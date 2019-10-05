<?php

require SRC_FOLDER . 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

define('PRODUCTNAME', 'Ingress Planner');
define('LIB_JQUERY_VERS', '1.11.3');

define('LIB_BOOTSTRAP_VERS', '3.3.5');
define('LIB_BOOTSTRAP_JS_INTEGRITY', 'sha512-K1qjQ+NcF2TYO/eI3M6v8EiNYZfA95pQumfvcVrTHtwQVDG+aHRqLi/ETn2uB+1JqwYqVG3LIvdm9lj6imS/pQ==');
define('LIB_BOOTSTRAP_CSS_INTEGRITY', 'sha512-dTfge/zgoMYpP7QbHy4gWMEGsbsdZeCXz7irItjcC3sPUFtf0kuFbDz/ixG7ArTxmDjLXDmezHubeNikyKGVyQ==');
define('LIB_BOOTSTRAP_CSS_THEME_INTEGRITY', 'sha384-aUGj/X2zp5rLCbBxumKTCw2Z50WgIr1vs/PFN4praOTvYXWlVyh2UtNUU0KAUhAX');

define('BUILD', (($target=getenv('BUILD_TARGET'))!='prod'?($target.'.'):'') . getenv('BUILD_TAG') .' ' . getenv('BUILD_DATE'));
define('PLUGINVERSION', '2.0.12.3106449');
define('AUTHOR', 'Marco Manieri');
define('AUTHOR_AGENTNAME', '@MarcioPG');
define('AUTHOR_TEAM', 'ENLIGHTENED');

define('LIB_LEAFLET_VERS', '<span id="leafletVersionSpan">?<span>');
define('LIB_LEAFLETLABEL_VERS', '<span id="leafletLabelVersionSpan">?<span>');

define('INGRESSURL', 'http://www.ingress.com');
define('STOCKINTELURL', 'https://intel.ingress.com/intel');
define('INGRAPHURL', 'http://atistar.net/~stepp/ingraph/');

define('IITCHOMEURL', 'https://static.iitc.me/');
define('IITCINTALLURL', 'https://iitc.me/desktop/');

define('FIXEDIITC', false);   // set false if official IITC script is ok.
//define('FIXEDIITC', 'files/total-conversion-build.user.js');   // set to relative url to download fixed IITC.
define('FIXEDIITCREASON', 'this is needed since the current IITC version has not yet implemented a fix to allow IITC to run inside a frame');

define('PLUGDOWNLOADRELURL', 'files/ingressplanner.user.js');
require SRC_FOLDER . 'news-archive.php';

foreach ($news as $new) {
    if (isset($new['version'])) {
        define('VERSION', $new['version']);
        break;
    }
}

$stmt = $db->prepare('SELECT * from "agents" where "opt-in" = "true" order by "last_time_seen" desc');
$stmt->execute();

$agents = array(
    'optin' => $stmt->fetchAll(PDO::FETCH_ASSOC)
);

$stmt = $db->prepare('SELECT count(*) count from "agents" where "opt-in" = "false"');
$stmt->execute();
$agents['anonyms'] = $stmt->fetch(PDO::FETCH_ASSOC);

$stmt = $db->prepare('SELECT value from "config" where "parameter" = "agentsSince"');
$stmt->execute();
$agents_since = $stmt->fetch(PDO::FETCH_ASSOC);
$agents_since = $agents_since['value'];

$requiredPlugins = array(
    'Draw Tools'    => array(
        'description'   => 'allows quick drawing of links directly on the map, portal to portal',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-draw-tools',
        'downloadURL'   => IITCHOMEURL . 'build/release/plugins/draw-tools.user.js',
        'objectName'    => 'drawTools',
    ),
    'Keys'          => array(
        'description'   => 'support the player in keeping track, directly from the map interface, of the number of "portal keys" for each portal, being them necessary to build links',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-keys',
        'downloadURL'   => IITCHOMEURL . 'build/release/plugins/keys.user.js',
        'objectName'    => 'keys',
    ),
    'Sync'          => array(
        'description'   => 'stores Keys plugin data for the user in Google Drive',
        'infoURL'       => IITCINTALLURL . '#' . 'plugin-sync',
        'downloadURL'   => IITCHOMEURL . 'build/release/plugins/sync.user.js',
        'objectName'    => 'sync',
    ),
);

$content = $html->view('index', compact('requiredPlugins', 'agents', 'agents_since', 'news'));

$jsbuffer = $html->getJsBuffer();

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
        //      fixed to avoid multiple addition of same color to swatch
        'js/bootstrap.colorpickersliders.nocielch-fix.js', //        'js/bootstrap.colorpickersliders.nocielch.min.js',
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
        'about = ' . json_encode(
            array(
                'debug'           => !!DEBUG,
                'productname'     => PRODUCTNAME,
                'version'         => VERSION,
                'pluginVersion'   => PLUGINVERSION,
                'author'          => AUTHOR,
                'requiredPlugins' => $requiredPlugins,
                'STOCKINTELURL'   => STOCKINTELURL,
            )
        ) . ';
        about.site = window.location.href;',
    )

);

if (!DEBUG) {
    $additionalassetts['jsblocks'][] = '
    (function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,"script","//www.google-analytics.com/analytics.js","ga");

      ga("create", "UA-58916725-1", "auto");
      ga("send", "pageview");
    ';
}

require SRC_FOLDER . 'layout.php';
