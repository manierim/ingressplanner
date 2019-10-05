<?php

$dbfile = '/var/www/persistent/ingressplannerDB.sqlite';

$existing = is_file($dbfile);
$db = new PDO('sqlite:'.$dbfile);

if (!$existing) {

    $db->exec(
        '
        CREATE TABLE "config" (
            "parameter" TEXT PRIMARY KEY NOT NULL UNIQUE, 
            "value" TEXT
        )
        '
    );

    $db->exec('INSERT INTO "config" values ("dbVersion","1.1")');

    $db->exec(
        '
        CREATE TABLE "agents" (
            "nickname" TEXT PRIMARY KEY NOT NULL UNIQUE, 
            "team" TEXT, 
            "level" SMALLINT, 
            "last_time_seen" TIMESTAMP, 
            "opt-in" BOOLEAN
        )'
    );

    $agents_since = new DateTime();
    $total = $saved = $errors = 0;

    $db->exec('INSERT INTO "config" values ("agentsSince","'.$agents_since->getTimestamp().'")');

    $db->exec(
        '
        CREATE TABLE shorturls (
            short    TEXT PRIMARY KEY
                          NOT NULL
                          UNIQUE,
            extended TEXT UNIQUE
                          NOT NULL,
            hits     BIGINT NOT NULL
                          DEFAULT (0)
        );
        '
    );

}
