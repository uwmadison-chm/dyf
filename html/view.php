<html>
<head>
<title>Draw your feels statistics</title>
</head>
<?php

error_reporting(-1);
ini_set('display_errors', 'On');
date_default_timezone_set('America/Chicago');

// Database
define('DB_PATH', getcwd() . '/data.sqlite');
$db = new PDO('sqlite:' . DB_PATH);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$count = $db->query('SELECT COUNT(*) FROM dyf')->fetch()[0];
echo "<h1>Draw your feels: ".$count." entries</h1>";

echo "<p>Most recent first:</p>";

$stmt = $db->query("SELECT pid FROM dyf ORDER BY timestamp DESC LIMIT 20");

while ($row = $stmt->fetch()) {
  echo "PID: ".$row['pid'].", Timestamp: ".$row['timestamp']."<br/>";
}

?>
</html>
