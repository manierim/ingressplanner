<?php
define('DEBUG', getenv('DEBUG')?true:false);

ini_set('display_errors', DEBUG?1:0);

date_default_timezone_set('Europe/Rome');

session_start();

define('SRC_FOLDER', dirname(__DIR__) . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR);

require SRC_FOLDER . 'utils.php';
require SRC_FOLDER . 'db.php';

$requestpath = array_values(array_filter(explode('/', $_SERVER['REQUEST_URI'])));

if (count($requestpath) == 1) {

    $requestpath = $requestpath[0];
    if ($requestpath == 'agent.php') {
        require SRC_FOLDER . 'agent.php';
        die();
    }
    require SRC_FOLDER . 'shortener.php';
}

require SRC_FOLDER . 'app.php';
