<?php

define('DEBUG', getenv('DEBUG') ?: false);

date_default_timezone_set('Europe/Rome');

session_start();

define('SRC_FOLDER', __DIR__ . 'src');
print_r(SRC_FOLDER);

require SRC_FOLDER . 'utils.php';
require SRC_FOLDER . 'db.php';
