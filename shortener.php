<?php
namespace IngressPlanner;

error_reporting(E_ALL);
ini_set('error_log', 'php-error.log');
ini_set('log_errors', true);

require 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

require 'basics.php';

if (isset($_REQUEST['extendedUrl'])) {

    $stmt = $db->prepare('SELECT * from "shorturls" where "extended" = :extended');
    $stmt->execute(array(':extended'=>$_REQUEST['extendedUrl']));
    if (!$shorturl = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $stmt = $db->prepare('SELECT * from "shorturls" where "short" = :short');
        do {
            $shorturl = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
            $stmt->execute(array(':short'=>$shorturl));
        } while ($stmt->fetch(\PDO::FETCH_ASSOC));

        $stmt = $db->prepare('
            INSERT INTO "shorturls"
            ("short", "extended") 
            values 
            (:short, :extended)
        ');
        $stmt->execute(array(
            ':short'    => $shorturl,
            ':extended' => $_REQUEST['extendedUrl'],
        ));
    }
    else
    {
        $shorturl = $shorturl['short'];
    }
    $path = str_replace('shortener.php', '', $_SERVER['REQUEST_URI']);
    header('Content-Type: application/json');
    echo json_encode('http://' . $_SERVER['HTTP_HOST'] . $path .  $shorturl);
    die();

}

if (isset($_REQUEST['shorturl'])) {

    $stmt = $db->prepare('SELECT * from "shorturls" where "short" = :short');
    $stmt->execute(array(':short'=>$_REQUEST['shorturl']));

    if ($shorturl = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        header('HTTP/ 308 Expansion Redirect');
        header('location: ' . $shorturl['extended']);
        die();
    } else {
        header('HTTP/ 400 Invalid token ' . $_REQUEST['shorturl']);
        die();
    }
}
