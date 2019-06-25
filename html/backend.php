<?php

// Define path for the database file
define('DB_PATH', getcwd() . '/data/data.sqlite');

// Establish a database connection
$db = new PDO('sqlite:' . DB_PATH);

// Throw exceptions when errors occur
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create table, if necessary
$db->exec(
  'CREATE TABLE IF NOT EXISTS dyf (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pid TEXT,
    session TEXT,
    timestamp TEXT,
    metadata TEXT,
    NegativeFace TEXT,
    PositiveFace TEXT,
    EMAWin TEXT,
    EMALose TEXT,
    TSST TEXT
  )'
);

// Establish or continue session
session_start([
  'cookie_lifetime' => 86400, // 24 hours
  'cookie_httponly' => true,  // Not accessible via JavaScript
  'read_and_close'  => true,  // Extract information and remove lock
]);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  // Decode transmitted data
  $data = json_decode(file_get_contents('php://input'), true);

  // (Cursory) validity check
  if (is_array($data)) {
    // Setup prepared statement
    $insert =
      'INSERT INTO dyf (session, timestamp, url, metadata, NegativeFace)
       VALUES (:session, :timestamp, :url, :metadata, :NegativeFace, :PositiveFace, :EMAWin, :EMALose, :TSST)';
    $stmt = $db->prepare($insert);

    // Insert data
    $stmt->execute(array(
      ':session' => session_id() ?: 'unknown',
      ':pid' => isset($data['pid']) ? $data['pid'] : 'none',
      ':timestamp' => date('c'),
      ':metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : 'none',
      ':NegativeFace' => isset($data['NegativeFace']) ? json_encode($data['NegativeFace']) : 'none',
      ':PositiveFace' => isset($data['PositiveFace']) ? json_encode($data['PositiveFace']) : 'none',
      ':EMAWin' => isset($data['EMAWin']) ? json_encode($data['EMAWin']) : 'none',
      ':EMALose' => isset($data['EMALose']) ? json_encode($data['EMALose']) : 'none',
      ':TSST' => isset($data['TSST']) ? json_encode($data['TSST']) : 'none',
    ));

    http_response_code(200);
  } else {
    http_response_code(400);
  }

} else {
  http_response_code(405);
}

?>
