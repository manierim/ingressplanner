<?php
namespace IngressPlanner;

error_reporting(E_ALL);
ini_set('error_log', 'php-error.log');
ini_set('log_errors', true);

require 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

require 'basics.php';

define('BUILD', '@@BUILD@@ @@BUILDDATE@@');
define('PLUGINVERSION', '2.@@PLUGINBUILD@@');
define('AUTHOR', 'Marco Manieri');
define('AUTHOR_AGENTNAME', '@MarcioPG');
define('AUTHOR_TEAM', 'ENLIGHTENED');

define('LIB_JQUERY_VERS', '1.11.3');

define('LIB_BOOTSTRAP_VERS', '3.3.5');
define('LIB_BOOTSTRAP_JS_INTEGRITY', 'sha512-K1qjQ+NcF2TYO/eI3M6v8EiNYZfA95pQumfvcVrTHtwQVDG+aHRqLi/ETn2uB+1JqwYqVG3LIvdm9lj6imS/pQ==');
define('LIB_BOOTSTRAP_CSS_INTEGRITY', 'sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==');
define('LIB_BOOTSTRAP_CSS_THEME_INTEGRITY', 'sha384-aUGj/X2zp5rLCbBxumKTCw2Z50WgIr1vs/PFN4praOTvYXWlVyh2UtNUU0KAUhAX');

define('LIB_LEAFLET_VERS', '<span id="leafletVersionSpan">?<span>');
define('LIB_LEAFLETLABEL_VERS', '<span id="leafletLabelVersionSpan">?<span>');

define('INGRESSURL', 'http://www.ingress.com/');
define('STOCKINTELURL', 'https://www.ingress.com/intel/');
define('INGRAPHURL', 'http://atistar.net/~stepp/ingraph/');

define('IITCHOMEURL', 'http://iitc.jonatkins.com/');
define('IITCINTALLURL', 'http://iitc.jonatkins.com/?page=desktop');

define('FIXEDIITC', false);   // set false if official IITC script is ok.
//define('FIXEDIITC', 'files/total-conversion-build.user.js');   // set to relative url to download fixed IITC.
define('FIXEDIITCREASON', 'this is needed since the current IITC version has not yet implemented a fix to allow IITC to run inside a frame');

define('PLUGDOWNLOADRELURL', 'files/ingressplanner.user.js');

$requiredPlugins = array(
    'Draw Tools'    => array(
        'description'   => 'allows quick drawing of links directly on the map, portal to portal',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-draw-tools',
        'downloadURL'   => IITCHOMEURL . 'release/plugins/draw-tools.user.js',
        'objectName'    => 'drawTools',
    ),
    'Keys'          => array(
        'description'   => 'support the player in keeping track, directly from the map interface, of the number of "portal keys" for each portal, being them necessary to build links',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-keys',
        'downloadURL'   => IITCHOMEURL . 'release/plugins/keys.user.js',
        'objectName'    => 'keys',
    ),
    'Sync'          => array(
        'description'   => 'stores Keys plugin data for the user in Google Drive',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-sync',
        'downloadURL'   => IITCHOMEURL . 'release/plugins/sync.user.js',
        'objectName'    => 'sync',
    ),
);

$content = $html->view('index', compact('requiredPlugins', 'agents', 'agents_since','news'));
$jsbuffer = $html->getJsBuffer();

require 'layout.php';
