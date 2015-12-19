<?php
namespace IngressPlanner;

error_reporting(E_ALL);
ini_set('error_log', 'php-error.log');
ini_set('log_errors', true);

require 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

require 'basics.php';
define('SHORTURLSDB', 'shortURLs.json');

$urls = array();

if (is_file(SHORTURLSDB)) {
    $urls = json_decode(file_get_contents(SHORTURLSDB), true);
}

if (empty($urls)) {
    $urls = array();
}

if (isset($_REQUEST['extendedUrl'])) {
    $shorturl = array_search($_REQUEST['extendedUrl'], $urls);
    if (!$shorturl) {
        do {
            $shorturl = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
        } while (isset($urls[$shorturl]));

        $urls[$shorturl] = $_REQUEST['extendedUrl'];
        file_put_contents(SHORTURLSDB, json_encode($urls));
    }
    $path = str_replace('shortener.php', '', $_SERVER['REQUEST_URI']);
    header('Content-Type: application/json');
    echo json_encode('http://' . $_SERVER['HTTP_HOST'] . $path .  $shorturl);
    die();

}

if (isset($_REQUEST['shorturl'])) {
    if (isset($urls[$_REQUEST['shorturl']])) {
        header('HTTP/ 308 Expansion Redirect');
        header('location: ' . $urls[$_REQUEST['shorturl']]);
        die();
    } else {
        header('HTTP/ 400 Invalid token ' . $_REQUEST['shorturl']);
        die();
    }
}
