<?php

if (isset($_REQUEST['extendedUrl'])) {

    $stmt = $db->prepare('SELECT * from "shorturls" where "extended" = :extended');
    $stmt->execute(array(':extended' => $_REQUEST['extendedUrl']));
    if (!$shorturl = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $stmt = $db->prepare('SELECT * from "shorturls" where "short" = :short');
        do {
            $shorturl = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
            $stmt->execute(array(':short' => $shorturl));
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
    } else {
        $shorturl = $shorturl['short'];
    }
    $path = str_replace('shortener.php', '', $_SERVER['REQUEST_URI']);
    header('Content-Type: application/json');
    echo json_encode('http://' . $_SERVER['HTTP_HOST'] . $path .  $shorturl);
    die();
} elseif (isset($requestpath) and is_string($requestpath)) {

    $stmt = $db->prepare('SELECT * from "shorturls" where "short" = :short');
    $stmt->execute(array(':short' => $requestpath));

    if ($shorturl = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        header('HTTP/ 308 Expansion Redirect');
        header('location: ' . $shorturl['extended']);
        $stmt = $db->prepare('UPDATE "shorturls" SET hits = hits + 1 WHERE "short" = :short');
        $stmt->execute(array(':short' => $requestpath));
        die();
    }
}
