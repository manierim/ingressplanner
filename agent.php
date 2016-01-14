<?php
namespace IngressPlanner;

error_reporting(E_ALL);
ini_set('error_log', 'php-error.log');
ini_set('log_errors', true);

require 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

require 'basics.php';

$optIn = null;
die('check and rewrite');
if (isset($agents[$_REQUEST['nickname']]) && isset($agents[$_REQUEST['nickname']]['opt-in'])) {
    $optIn = $agents[$_REQUEST['nickname']]['opt-in'];
}

$agents[$_REQUEST['nickname']] = $_REQUEST;

$agents[$_REQUEST['nickname']]['nickname'] = $_REQUEST['nickname'];
$agents[$_REQUEST['nickname']]['last_time_seen'] = new \DateTime();

if (!isset($_REQUEST['opt-in'])) {
    $agents[$_REQUEST['nickname']]['opt-in'] = $optIn;
}

\save_agents();

echo json_encode($agents[$_REQUEST['nickname']]);
