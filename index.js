var mode = "PPT";
var container;
var svg;
var drawing = false;
var intro = true;
var curvals = [];
var x,
    y,
    margin,
    width,
    height,
    gheight,
    gwidth;

// Only let them draw forward
var xmin = 0;
var line = d3.line().curve(d3.curveBasis);

var button_done = $("#button_done");
var response = $("#response");
var ppt = $("#ppt");
var text = $(".text");

var ppt_id = "";

var vis = $("#visarea");

function done(){
    if (mode == "End") {
        return;
    }

    if (mode == "PPT") {
        mode = "Intro1";
        ppt_id = $("#ppt_input").val()
        draw();
        return;
    }

    // Skip the graph drawing for the first few thingies
    switch (mode) {
      case "Intro1":
        mode = "Intro2";
        draw();
        return;
        break;
      case "Intro2":
        mode = "Intro3";
        draw();
        return;
        break;
    }

    if (intro) {
        intro = false;
        drawing = true;
        draw();
        return;
    }
    switch (mode) {
      case "Intro1":
        mode = "Intro2";
        break;
      case "Intro2":
        mode = "Intro3";
        break;
      case "Intro3":
        mode = "NegativeFace";
        break;
      case "NegativeFace":
        mode = "PositiveFace";
        break;
      case "PositiveFace":
        mode = "TSST";
        break;
      case "TSST":
        mode = "EMALose";
        break;
      case "EMALose":
        mode = "EMAWin";
        break;
      case "EMAWin":
        mode = "End";
        // TODO: Post data
        break;
      default:
        mode = "Intro1";
        break;
    }
    intro = true;
    reset();
}

function reset(){
    drawing = true;
    curvals = [];
    xmin = 0;
    draw();
}

function draw(){
    if (intro) {
        drawing = false;
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
        button_done.hide();
        if (drawing) {
            response.hide();
        }
        drawLinePlot();
        // Some intro plots have text
        switch (mode) {
          case "Intro3":
            drawTitleOver("Intro3Graph");
            break;
        }
    }
}


function drawGraphAxes(x_label, xtick_labels, y_label, ytick_labels){
    var xAxis = d3.axisBottom(x)
                .ticks(xtick_labels.length - 1)
                .tickFormat(function(d,i){ return xtick_labels[i] });
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
        .attr("font-size",16);

    svg.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("font-size",20)
        .attr("x", gwidth/2)
        .attr("y", gheight + 50)
        .text(x_label)
    
    svg.append("text")
        .attr("class", "ylabel")
        .attr("text-anchor", "middle")
        .attr("font-size",20)
        .attr("x", -(gheight)/2)
        .attr("y", -margin.top + 30)
        .attr("transform", "rotate(-90)")
        .text(y_label);
}

function drawGraphSection(label, tick_label, color, fill, x, width){
    var textheight = gheight * 0.9;
    svg.append("rect")
        .attr("width",gwidth*width)
        .attr("x", gwidth*x)
        .attr("height",gheight)
        .attr("fill",fill);
    svg.append("text")
        .style("fill",color)
        .attr("text-anchor", "middle")
        .attr("font-size",20)
        .attr("x", gwidth * (x + width/2))
        .attr("y", textheight)
        .text(label);
    if (tick_label) {
        svg.append("text")
            .style("fill","#956")
            .attr("text-anchor", "middle")
            .attr("font-size",16)
            .attr("x", gwidth * x)
            .attr("y", gheight+16)
            .text(tick_label);
    }
}

function drawGraphSections(sections){
  sections.forEach(function(section){
    drawGraphSection(...section);
  });
}

function drawSectionsForMode(){
    switch (mode) {
      case "Intro":
        drawGraphSections([
              ["Hit finger with hammer", "", "#956", "#f563", 0.0, 0.25],
              ["", "4s", "#999", "#fff", 0.25, 0.1],
            ]);
            break;

      case "NegativeFace":
        drawGraphSections([
              ["Negative picture", "", "#956", "#f563", 0.0, 0.28],
              ["", "4s", "#999", "#fff", 0.28, 0.14],
              ["Face", "6s", "#569", "#56f3", 0.42, 0.035],
            ]);
            break;

      case "PositiveFace":
        drawGraphSections([
              ["Positive picture", "", "#695", "#6f53", 0.0, 0.28],
              ["", "4s", "#999", "#fff", 0.28, 0.14],
              ["Face", "6s", "#569", "#56f3", 0.42, 0.035],
            ]);
            break;

      case "TSST":
        drawGraphSections([
              ["Prep", "", "#695", "#6f53", 0.0, 0.1],
              ["Speech", "5min", "#956", "#f563", 0.1, 0.1],
              ["Math", "10min", "#569", "#56f3", 0.2, 0.1],
              ["Sitting down", "15min", "#666", "#fff", 0.3, 0.4],
              ["Rating yourself", "1hr", "#666", "#6663", 0.7, 0.3],
            ]);
            break;

      case "EMAWin":
        drawGraphSections([
              ["Playing game", "", "#569", "#56f3", 0.0, 0.1],
              ["You won", "???", "#596", "#5f63", 0.15, 0.1],
              ["Being surveyed after game", "???", "#666", "#aaa3", 0.3, 0.4],
            ]);
            break;

      case "EMALose":
        drawGraphSections([
              ["Playing game", "", "#569", "#56f3", 0.0, 0.1],
              ["You lost", "???", "#956", "#f563", 0.15, 0.1],
              ["Being surveyed after game", "???", "#666", "#aaa3", 0.3, 0.4],
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
    drawGraphAxes("Time", ["Start","End"], "Intensity", ["Low","High"]);
    
    if(drawing){
        response.hide();
        
    } else {
        response.show();
        
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

var normDrawing = function(drawn,xmax,ymax){
    for (var i = 0; i < drawn.length; i ++){
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
    margin = {top: 40, right: 40, bottom: 80, left: 75};
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
          
    if(drawing && valpos){
        xmin = d3.event.x;
        curvals = [];
        curvals.push({"x":d3.event.x,"y":d3.event.y});
    }
}

function dragging() {
    if (!drawing) {
        return;
    }
    var last = curvals[curvals.length - 1],
        x0 = last.x,
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
        curvals.push({"x":x1,"y":y1});
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
    if (!drawing) {
        return;
    }
    if (curvals.length>2){
        curvals = normDrawing(curvals,gwidth,gheight);
        drawing = false;
    } else {
        curvals = [];
        drawing = true;
    }
    redraw();
}

window.addEventListener("resize", redraw);

