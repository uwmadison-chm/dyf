<?php

error_reporting(-1);
ini_set('display_errors', 'On');
date_default_timezone_set('America/Chicago');

// Database
define('DB_PATH', getcwd() . '/data.sqlite');
$db = new PDO('sqlite:' . DB_PATH);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create table, if necessary
$db->exec(
  'CREATE TABLE IF NOT EXISTS dyf (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT,
    pid TEXT,
    session TEXT,
    timestamp TEXT,
    metadata TEXT,
    NegativeFace TEXT,
    PositiveFace TEXT,
    EMAWin TEXT,
    EMALose TEXT,
    TSST TEXT,
    PandemicStress TEXT,
    StressLastMonth TEXT
  )'
);


if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // Decode POST data
  $data = json_decode(file_get_contents('php://input'), true);

  if (is_array($data)) {
    try {
      $insert =
        'INSERT INTO dyf (pid, session, version, timestamp, metadata, NegativeFace, PositiveFace, EMAWin, EMALose, TSST, PandemicStress, StressLastMonth)
        VALUES (:pid, :session, :version, :timestamp, :metadata, :NegativeFace, :PositiveFace, :EMAWin, :EMALose, :TSST, :PandemicStress, :StressLastMonth)';
      $stmt = $db->prepare($insert);

      $stmt->execute(array(
        ':session' => session_id() ?: 'unknown',
        ':pid' => isset($data['ppt']) ? $data['ppt'] : 'none',
        ':version' => isset($data['version']) ? $data['version'] : 'none',
        ':timestamp' => date('c'),
        ':metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : 'none',
        ':NegativeFace' => isset($data['NegativeFace']) ? json_encode($data['NegativeFace']) : 'none',
        ':PositiveFace' => isset($data['PositiveFace']) ? json_encode($data['PositiveFace']) : 'none',
        ':EMAWin' => isset($data['EMAWin']) ? json_encode($data['EMAWin']) : 'none',
        ':EMALose' => isset($data['EMALose']) ? json_encode($data['EMALose']) : 'none',
        ':TSST' => isset($data['TSST']) ? json_encode($data['TSST']) : 'none',
        ':PandemicStress' => isset($data['PandemicStress']) ? json_encode($data['PandemicStress']) : 'none',
        ':StressLastMonth' => isset($data['StressLastMonth']) ? json_encode($data['StressLastMonth']) : 'none',
      ));
      echo "{}\n";
      http_response_code(200);
    } catch (exception $e) {
      http_response_code(500);
      echo "{error:'" . $e->getMessage();
      echo ", trace: ";
      echo $e->getTraceAsString();
      echo "}";
    }

  } else {
    http_response_code(400);
  }

} else {
  http_response_code(405);
}

?>
