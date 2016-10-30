<?php

$news = array(
// add newest to the top!

    array(
        'date'      => 'Oct. 30, 2016',
        'version'   => '2.0.10',
        'body' => array(
            '<b>senfomat</b>: Show the number of fields in a plan',
            '<b>senfomat</b>: Better wording when keys have to get farmed',
        ),
    ),

    array(
        'date'      => 'Apr. 14, 2016',
        'version'   => '2.0.9',
        'body' => array(
            'Improved cached links & fields management by zoom level & map bounds',
        ),
    ),

    array(
        'date'      => 'Feb. 24, 2016',
        'version'   => '2.0.8',
        'body' => array(
            'Manage items: item type filter now offer Links and Links crossed by own/enemy faction.',
            'Multi Layer helper: option to not create "Jet Links".',
        ),
    ),

    array(
        'date'      => 'Feb. 23, 2016',
        'version'   => '2.0.7',
        'body' => array(
            'Added "Move Up/Down buttons in Steps table rows.',
            'Color picker in Steps table: auto placement, fixed multiple addition of same color to swatches, HSV now works.',
            'Manage items: portal filter can now specify if it is origin/destination, selected links can be mass inverted, selected items can be mass changed colors.',
        ),
    ),

    array(
        'date'      => 'Jan. 14, 2016',
        'version'   => '2.0.6',
        'body' => array(
            'Backend data storage is now SQLite instead of JSON files (no more URL shortener issues).',
        ),
    ),
/*
    array(
        'date'      => 'Dec. 29, 2015',
        'version'   => '2.0.5',
        'body' => array(
            'New export formats: IITC drawing & Ingress Planner Plan.',
            'Plans can now be imported from files / pasted text.',
        ),
    ),

    array(
        'date'      => 'Dec. 28, 2015',
        'version'   => '2.0.4',
        'body' => array(
            'Key farm planning is now an option. You can turn it off and get just a summary of the keys needed.',
        ),
    ),

    array(
        'date'      => 'Dec. 27, 2015',
        'version'   => '2.0.3b',
        'body' => array(
            'Fixed done links generating an "empy" GO TO line in textual export.',
        ),
    ),

    array(
        'date'      => 'Dec. 20, 2015',
        'version'   => '2.0.3',
        'body' => array(
            'Textual plan instructions moved to new "Export" panel in Planning tab.',
            'New Textual plan instruction format:<ul>'
            . '<li>tree structure: GO TO portal then actions to perform</li>'
            . '<li>GO TO line include time & distance from previous portal</li>'
            . '<li>GO TO can include short urls to portal (Intel) or location (Gmaps)</li>'
            . '</ul>'
            ,
        ),
    ),

    array(
        'date'      => 'Dec. 19, 2015',
        'version'   => '2.0.2c',
        'body' => array(
            'Fixed routes not showing in Visual preview due to OSRM protocol change',
        ),
    ),

    array(
        'date'      => 'Dec. 15, 2015',
        'version'   => '2.0.2b',
        'body' => array(
            'Fixed privacy settings not showing',
        ),
    ),

    array(
        'date'      => 'Dec. 15, 2015',
        'version'   => '2.0.2',
        'body' => array(
            'Improved gameworld changes detection (to avoid unnecessary plan analysis if nothing changed)',
            'Fixed autoscroll of Steps table when Plan Preview is not shown',
            '<em>Added this "news" section in Home tab</em>',
        ),
    ),
    array(
        'date'      => 'Dec. 12, 2015',
        'version'   => '2.0.1',
        'body' => array(
            'Visual Preview: added alert for OSRM router down',
            'Fixed "copy plan" creating an empty plan',
            'Fixed "fake" portals out of map bounds not having all links & fields information and therefore removing them from gameworld',
        ),
    ),

    array(
        'date'      => 'Dec. 11, 2015',
        'version'   => '2.0b',
        'body' => array(
            'Fixed new (empty) plans not working at all',
        ),
    ),

    array(
        'date'      => 'Dec. 10, 2015',
        'title'     => 'v 2.0 online!',
        'body' =>
        $html->tag(
            'p',
            'Version 2, a brand new rewrite, is online!<br>Check the '
            . $html->link('video', 'https://youtu.be/f96PTPUh2lY', true)
            .'!'
        ),
    ),
*/
);
