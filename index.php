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

$additionalassetts = array(
    'css' => array(
        // Color Picker Sliders
        'css/bootstrap.colorpickersliders.min.css',
        // Awesome Bootstrap Checkbox
        '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
        'css/awesome-bootstrap-checkbox.css',
        // Leaflet
        'css/leaflet.css',
        // leaflet.label
        'css/leaflet.label.css',
        // main site
        'css/main.css',
    ),
    'scripts' => array(
        // Bootbox.js
        'js/bootbox.min.js',
        // Color Picker Sliders
        'js/tinycolor-min.js',
        'js/bootstrap.colorpickersliders.nocielch.min.js',
        // Leaflet
        'js/leaflet.js',
        // Leaflet.label
        'js/leaflet.label.js',
        // Polyline.encoded
        'js/Polyline.encoded.js',
        // Main App
        'js/ingressplanner.js',
        'js/utils.js',
        'js/iitc.js',
        'js/plan.js',
        'js/gameworld.js',
        'js/gdrive.js',
        'js/ui.js',
        'js/aprewards.js',
        'js/tools.js',
        'js/router.js',
        'js/shortener.js',
        // GDrive bootstrap
        'https://apis.google.com/js/client.js?onload=gdriveClientLoad',
    ),

    'jsblocks' => array(
        'about = ' . json_encode(array(
            'debug'           => DEBUG,
            'productname'     => PRODUCTNAME,
            'version'         => VERSION,
            'pluginVersion'   => PLUGINVERSION,
            'author'          => AUTHOR,
            'requiredPlugins' => $requiredPlugins,
        )) . ';
        about.site = window.location.href;',
    )

);

if (!DEBUG)
{
    $additionalassetts['jsblocks'][] = '
    (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,"script","//www.google-analytics.com/analytics.js","ga");

      ga("create", "UA-58916725-1", "auto");
      ga("send", "pageview");
    ';
}


$content = $html->view('index', compact('additionalassetts','requiredPlugins', 'agents', 'agents_since','news'));
$jsbuffer = $html->getJsBuffer();

require 'layout.php';
