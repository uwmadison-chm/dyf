var mode = "PPT";
var container;
var svg;
var drawing_mode = "off";
var intro = true;
var curvals = [],
    autovals = [],
    autodrawTimeout = undefined,
    startMillis = 0,
    currentMillis = 0;
var x,
    y,
    margin,
    width,
    height,
    gheight,
    gwidth;

var data = {};
var dataPosted = false;

// Only let them draw forward
var xmin = 0;
var line = d3.line().curve(d3.curveBasis);

var button_done = $("#button_done");
var response = $("#response");
var ppt = $("#ppt");
var text = $(".text");

var vis = $("#visarea");

function rotateMode() {
    switch (mode) {
      case "Intro1":
        mode = "Intro2";
        break;
      case "Intro2":
        mode = "Intro3";
        break;
      case "Intro3":
        mode = "Intro4";
        break;
      case "Intro4":
        mode = "Intro5";
        break;
      case "Intro5":
        mode = "PracticePositive";
        break;
      case "PracticePositive":
        mode = "PracticeNegative";
        break;
      case "PracticeNegative":
        mode = "PracticeEnd";
        break;
      case "PracticeEnd":
        mode = "NegativeFace";
        break;
      case "NegativeFace":
        mode = "PositiveFace";
        break;
      case "PositiveFace":
        mode = "PreEMA1";
        break;
      case "PreEMA1":
        mode = "PreEMA2";
        break;
      case "PreEMA2":
        mode = "PreEMA3";
        break;
      case "PreEMA3":
        mode = "EMAWin";
        break;
      case "EMAWin":
        mode = "EMALose";
        break;
      case "EMALose":
        mode = "TSST";
        break;
      case "TSST":
        mode = "End";
        break;
      default:
        mode = "Intro1";
        break;
    }
}

function skipGraph() {
    switch (mode) {
      case "Intro1":
      case "Intro2":
      case "PracticeEnd":
      case "PreEMA3":
        return true;
      default:
        return false;
    }
}

function skipIntro() {
    switch (mode) {
      case "Intro4":
      case "Intro5":
      case "PreEMA2":
        return true;
      default:
        return false;
    }
}

function isAutomatic() {
    switch (mode) {
      case "Intro3":
      case "Intro4":
      case "Intro5":
        return true;
      default:
        return false;
    }
}

function valuesForMode() {
    var array = [];
    var div = $(".graphdata." + mode);
    if (div.length >= 1) {
        var points = div.find("span");
        points.each(function(p) {
            array.push({
              x: $(this).data('x'),
              y: $(this).data('y'),
              time: $(this).data('time'),
            });
        });
    } else {
        for (i = 0; i < 100; i++) {
            array.push({
              x: i * 0.01,
              y: Math.random(),
              time: x * 100,
            });
        }
    }
    return array;
}

function print() {
    var div = $(document.createElement('div'));
    curvals.forEach(function(o) {
        div.append($(`<span data-x='${o.x}' data-y='${o.y}' data-time='${o.time}'>`));
    });
    $('body').append(div);
}

function done() {
    clearTimeout(autodrawTimeout);
    if (mode === "End") {
        return;
    }

    if (mode === "PPT") {
        mode = "Intro1";
        data.ppt_id = $("#ppt_input").val()
        draw();
        return;
    }


    if (!intro || (intro && skipGraph())) {
        // We were on the graph or told to skip it, so rotate
        // But first, do we save the vals to data?
        switch (mode) {
            case "NegativeFace":
                data.NegativeFace = curvals;
                break;
            case "PositiveFace":
                data.PositiveFace = curvals;
                break;
            case "EMAWin":
                data.EMAWin = curvals;
                break;
            case "EMALose":
                data.EMALose = curvals;
                break;
            case "TSST":
                data.TSST = curvals;
                postData();
                break;
        }
        rotateMode();
        intro = !skipIntro();
    } else if (skipIntro() || (intro && !skipGraph())) {
        // Show the graph right away
        intro = false;
    } else {
        // We weren't on the graph yet, so turn off the intro and draw it
        intro = false;
    }

    if (isAutomatic()) {
        drawing_mode = "automatic";
        autovals = valuesForMode();
        currentMillis = 0;
        curvals = [];
    } else {
        drawing_mode = "on";
        curvals = [];
        xmin = 0;
    }

    draw();
}

function reset(){
    drawing_mode = "on";
    curvals = [];
    xmin = 0;
    draw();
}

function draw(){
    console.log(`Draw: ${drawing_mode}, in ${mode}, intro ${intro}`);
    if (intro) {
        drawing_mode = "off";
        response.hide();
        text.hide();
        ppt.hide();
        switch (mode) {
          case "PPT":
            button_done.hide();
            ppt.show();
            break;
          case "End":
            button_done.hide();
            break;
          default:
            button_done.show();
            break;
        }
        drawTitle(mode);
    } else {
        text.hide();
        if (drawing_mode === "automatic") {
            button_done.show();
        } else {
            button_done.hide();
        }
        if (drawing_mode === "on" || drawing_mode === "automatic") {
            response.hide();
        } else {
            response.show();
        }
        drawLinePlot();
        // Some intro plots have text
        drawTitleOver(mode + "Graph");
    }
}

function xtickArguments(){
    switch (mode) {
      case "Intro3":
      case "Intro4":
      case "Intro5":
      case "PracticePositive":
      case "PracticeNegative":
      case "NegativeFace":
      case "PositiveFace":
        return [12, "s"];
      case "PreEMA1":
      case "PreEMA2":
      case "EMAWin":
      case "EMALose":
        return [90, "m"];
      default:
        return [];
    }
}

function xtickValues(){
    switch (mode) {
      case "Intro3":
      case "Intro4":
      case "Intro5":
      case "PracticePositive":
      case "PracticeNegative":
      case "NegativeFace":
      case "PositiveFace":
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      case "PreEMA1":
      case "EMAWin":
        return ["Win $10", 10, 20, 30, 40, 50, 60, 70, 80, 90];
      case "PreEMA2":
      case "EMALose":
        return ["Lose $5", 10, 20, 30, 40, 50, 60, 70, 80, 90];
      default:
        return [];
    }
}

function xScaleWidthForCurrentMode() {
    switch (mode) {
      case "Intro3":
      case "Intro4":
      case "Intro5":
      case "PracticePositive":
      case "PracticeNegative":
      case "NegativeFace":
      case "PositiveFace":
        return 12;
      case "PreEMA1":
      case "PreEMA2":
      case "EMAWin":
      case "EMALose":
        return 90;
      default:
        return 1;
    }
}

function xFormat(value) {
    var suffix = "sec";
    if (mode.includes("EMA")) {
        suffix = "min";
    }
    if (typeof value === 'string') {
        return value;
    } else {
        return d3.format("d")(value) + suffix;
    }
}


function drawGraphAxes(x_label, xtick_labels, y_label, ytick_labels){
    var xScale = d3.scaleLinear()
        .range([0, gwidth])
        .domain([0, xScaleWidthForCurrentMode()]);
    var xValues = xtickValues();
    var xAxis = d3.axisBottom(x)
                .scale(xScale)
                .tickArguments(xtickArguments())
                .tickValues(xValues)
                .tickFormat(xFormat);
    var yAxis = d3.axisLeft(y)
                .ticks(ytick_labels.length - 1)
                .tickFormat(function(d,i){ return ytick_labels[i] });
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + gheight + ")")
        .call(xAxis)
    
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxis)
    
    d3.selectAll(".tick")
        .attr("font-size",24);

    svg.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("font-size",30)
        .attr("x", gwidth/2)
        .attr("y", gheight + 70)
        .text(x_label)
    
    svg.append("text")
        .attr("class", "ylabel")
        .attr("text-anchor", "middle")
        .attr("font-size",30)
        .attr("x", -(gheight)/2)
        .attr("y", -margin.top + 30)
        .attr("transform", "rotate(-90)")
        .text(y_label);
}

function drawGraphSection(label, tickLabel, color, fill, x, width, horizontalOffset, verticalOffset){
    var position = gwidth * (x + width/2)
    if (horizontalOffset) {
        position += horizontalOffset;
    }

    var textheight = gheight * 0.9;
    if (verticalOffset) {
        textheight += verticalOffset;
    }
    svg.append("rect")
        .attr("width",gwidth*width)
        .attr("x", gwidth*x)
        .attr("height",gheight)
        .attr("fill",fill);
    svg.append("text")
        .style("fill",color)
        .attr("text-anchor", "middle")
        .attr("font-size",30)
        .attr("x", position)
        .attr("y", textheight)
        .text(label);
    if (tickLabel) {
        svg.append("text")
            .style("fill","#333")
            .attr("text-anchor", "middle")
            .attr("font-size",24)
            .attr("x", gwidth * x)
            .attr("y", gheight + 24)
            .text(tickLabel);
    }
}

function drawGraphSections(sections){
  sections.forEach(function(section){
    drawGraphSection(...section);
  });
}

function drawSectionsForMode(){
    switch (mode) {
      case "Intro3":
      case "Intro4":
      case "PracticeNegative":
      case "NegativeFace":
        drawGraphSections([
              ["Negative picture", "", "#956", "#f563", 0.0, 0.333],
            ]);
            break;

      case "PracticePositive":
      case "Intro5":
      case "PositiveFace":
        drawGraphSections([
              ["Positive picture", "", "#695", "#6f53", 0.0, 0.333],
            ]);
            break;

      case "TSST":
        var c = 1.0 / 12.0;
        drawGraphSections([
              ["Prep", "", "#695", "#6f53", 0*c, 1*c],
              ["Speech", "5min", "#956", "#f563", 1*c, 1*c, 0, -40],
              ["Math", "10min", "#569", "#56f3", 2*c, 1*c],
              ["Standing up", "15min", "#666", "#fff0", 3*c, 1*c, 0, -40],
              ["Sitting down", "20min", "#666", "#9993", 4*c, 2*c],
              ["Home instructions", "30min", "#33a", "#fff0", 6*c, 3*c, 0, -40],
              ["Rating yourself", "1hr", "#666", "#6663", 9*c, 3*c],
            ]);
            break;

      case "PreEMA1":
      case "EMAWin":
        drawGraphSections([
              ["Being texted surveys after winning $10", "", "#666", "#fff", 0.0, 1.0],
            ]);
            break;

      case "PreEMA2":
      case "EMALose":
        drawGraphSections([
              ["Being texted surveys after losing $5", "", "#666", "#fff", 0.0, 1.0],
            ]);
            break;
    }
}

function drawTitle(id) {
    svg.selectAll("*").remove();
    $('#' + id).show();
}

function drawTitleOver(id) {
    $('#' + id).show();
}

function autodraw() {
    if (autovals.length == 0) {
        return;
    }
    //console.log(`autodraw: ${autovals.length} ${curvals.length}`)
    var point = autovals.shift()
    curvals.push(point);
    var timeout = currentMillis - point.time;
    if (timeout <= 10) {
      timeout = 10
    }
    autodrawTimeout = setTimeout(drawLinePlot, timeout);
    currentMillis = point.time;
}

function drawLinePlot() {
    svg.selectAll("*").remove();

    svg.append("rect")
        .attr("width",width)
        .attr("height",height)
        .attr("fill","#fff0");

    x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, gwidth]);
    
    y = d3.scaleLinear()
        .domain([0, 1])
        .range([gheight, 0]);
    
    var textheight = gheight * 0.9;

    drawSectionsForMode();
    drawGraphAxes("Time", ["Start","End"], "Emotional Response Intensity", ["Start","High"]);

    if(drawing_mode === "automatic") {
        autodraw();
    }
    
    if(drawing_mode === "off" || drawing_mode === "automatic") {
        var line = d3.line()
                .x(function(d) {return x(d["x"]); })
                .y(function(d) {return y(d["y"]); })
                .curve(d3.curveBasis);
        
        if (curvals != []){
            svg.append("path").datum(curvals)
                .attr("fill","none")
                .attr("stroke","#0066aa")
                .attr("stroke-width","7px")
                .attr("stroke-linejoin","round")
                .attr("stroke-linecap","round")
                .attr('d',line);
        }
    }
}

function smoothDrawing(drawn,xmax,ymax) {
    for (var i = 0; i < drawn.length; i ++) {
        drawn[i]["x"] = (drawn[i]["x"])/xmax;
        drawn[i]["y"] = 1-(drawn[i]["y"]/ymax);
    }
    return drawn;
}

function redraw(){
    resize();
    draw();
}

function resize(){
    margin = {top: 40, right: 40, bottom: 95, left: 75};
    width = visarea.clientWidth;
    height = visarea.clientHeight;
    gheight = height - margin.top - margin.bottom;
    gwidth = width - margin.left - margin.right;

    container
        .attr("width",width)
        .attr("height",height);

    svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function init(){
    container = d3.select("#svg");
    svg = container.append("g");
}

init();
redraw();


var dragAndDraw = d3.drag()
    .container(function() { return this; })
    .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
    .on("start", dragstarted)
    .on("drag", dragging)
    .on("end", dragstopped);

svg.call(dragAndDraw);

function dragstarted() {
    var valpos = d3.event.x>0 & d3.event.x<gwidth & d3.event.y>0 & d3.event.y<gheight;
          
    if(drawing_mode === "on" && valpos){
        startMillis = Date.now();
        xmin = d3.event.x;
        curvals = [];
        curvals.push({"x":0.0,"y":gheight,"time":0.0});
        curvals.push({"x":d3.event.x,"y":d3.event.y,"time":0.0});
        // Draw a line from 0 always
        var active = svg.append("path").datum([[0.0, gheight], [d3.event.x,d3.event.y]])
          .attr("fill","none")
          .attr("stroke","#0066ff")
          .attr("stroke-width","5px")
          .attr("stroke-linejoin","round")
          .attr("stroke-linecap","round")
          .attr("d", line);
    }
}

function dragging() {
    if (drawing_mode !== "on") {
        return;
    }
    var last = curvals[curvals.length - 1];
    if (last === undefined) {
        last = {'x':1,'y':1};
    }
    var x0 = last.x,
        y0 = last.x,
        x1 = d3.event.x,
        y1 = d3.event.y,
        dx = x1 - x0,
        dy = y1 - y0;
    var valpos = x1>xmin & x1<(gwidth) & y1>0 & y1<(gheight);
    if (valpos) {
        var d = d3.event.subject,
            active = svg.append("path").datum(d)
              .attr("fill","none")
              .attr("stroke","#0066ff")
              .attr("stroke-width","5px")
              .attr("stroke-linejoin","round")
              .attr("stroke-linecap","round");
        curvals.push({"x":x1,"y":y1,"time":Date.now()-startMillis});
        xmin = x1;
        if (dx * dx + dy * dy > 20) {
            d.push([x0 = x1, y0 = y1]);
        } else {
            d[d.length - 1] = [x1, y1];
        }
        active.attr("d", line);
    }
}

function dragstopped() {
    if (drawing_mode !== "on") {
        return;
    }
    if (curvals.length>2){
        curvals = smoothDrawing(curvals,gwidth,gheight);
        drawing_mode = "off";
    } else {
        curvals = [];
        drawing_mode = "on";
    }
    redraw();
}

function postData() {
    if (dataPosted) {
        return;
    }
    console.log("Posting data: ", data);
    $.ajax({
        type: "POST",
        url: "backend.php",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            dataPosted = true;
            console.log("Upload successful", data);
        },
        failure: function(errMsg) {
            alert("Error uploading data: " + errMsg);
        }
    });
}

window.addEventListener("resize", redraw);

