<?php
define('DEBUG', true); // changed to false by deploy.sh (called by post-receive git hook) for production
ini_set('display_errors', DEBUG?'1':'0');

date_default_timezone_set('Europe/Rome');

define('AGENTSLOG', 'agentslog.json');
define('PRODUCTNAME', 'Ingress Planner');

require 'news-archive.php';

foreach ($news as $new) {
	if (isset($new['version']))
	{
		define('VERSION', $new['version']);
		break;
	}
}

$agents = array();
$agents_since = null;

if (is_file(AGENTSLOG))
{
	$content = json_decode(file_get_contents(AGENTSLOG),true);
	if ((!isset($content['agents_since'])) or (!isset($content['agents'])))
	{
		unlink(AGENTSLOG);
	}
	else
	{
		$agents_since = new DateTime($content['agents_since']['date'],new DateTimeZone($content['agents_since']['timezone']));
		$agents = $content['agents'];
	}
}

function save_agents()
{
	global $agents, $agents_since;
	
	if (!is_file(AGENTSLOG))
	{
		$agents_since = new DateTime();
	}

	file_put_contents(AGENTSLOG, json_encode(compact(
		'agents',
		'agents_since'
	)));
}


function pr($var)
{
	echo '<pre>' . print_r($var, true) . '</pre>';
}
