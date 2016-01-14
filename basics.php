<?php
define('DEBUG', true); // changed to false by deploy.sh (called by post-receive git hook) for production
ini_set('display_errors', DEBUG?'1':'0');

date_default_timezone_set('Europe/Rome');

define('PRODUCTNAME', 'Ingress Planner');

require 'news-archive.php';

foreach ($news as $new) {
	if (isset($new['version']))
	{
		define('VERSION', $new['version']);
		break;
	}
}


// conversion to sqlite from json files, can be removed in future
$dbfile = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'ingressplannerDB.sqlite';

$existed = is_file($dbfile);
$db = new PDO('sqlite:'.$dbfile);

if (!$existed)
{

	$db->exec('
		CREATE TABLE "config" (
			"parameter" TEXT PRIMARY KEY NOT NULL UNIQUE, 
			"value" TEXT
		)'
	);

	$db->exec('INSERT INTO "config" values ("dbVersion","1.0")');

	$db->exec('
		CREATE TABLE "agents" (
			"nickname" TEXT PRIMARY KEY NOT NULL UNIQUE, 
			"team" TEXT, 
			"level" SMALLINT, 
			"last_time_seen" TIMESTAMP, 
			"opt-in" BOOLEAN
		)'
	);

	$total = $saved = $errors = 0;

	$AGENTSLOG = 'agentslog.json';
	if (is_file($AGENTSLOG))
	{
		$content = json_decode(file_get_contents($AGENTSLOG),true);

		$stmt = $db->prepare('
			INSERT INTO "agents"
			("nickname", "team", "level", "last_time_seen", "opt-in") 
			values 
			(:nickname, :team, :level, :lastseen, :optin)
		');

		$stmt->bindParam(':nickname', $nickname);
		$stmt->bindParam(':team', $team);
		$stmt->bindParam(':level', $level);
		$stmt->bindParam(':lastseen', $lastseen);
		$stmt->bindParam(':optin', $optin);

		$fieldsMap = array(
//			'nickname' 			=> 'nickname',
			'team' 				=> 'team',
			'level' 			=> 'level',
			'last_time_seen' 	=> 'lastseen',
			'opt-in' 			=> 'optin',
		);

		$total = count($content['agents']);

		foreach ($content['agents'] as $nickname=>$agent) {

			if (empty($nickname))
			{
				if (empty($agent['nickname']))
				{
					continue;
				}
				$nickname = $agent['nickname'];
			}

			foreach ($fieldsMap as $jsonField => $dbVar) {
				if (!isset($agent[$jsonField]))
				{
					switch ($jsonField)
					{
						default:
							$agent[$jsonField] = '';
							break;
					}
					
				}
				$$dbVar = $agent[$jsonField];

				if ($dbVar == 'lastseen')
				{
					$lastseen = new DateTime($lastseen['date'], new DateTimeZone($lastseen['timezone']));
					$lastseen = $lastseen->getTimestamp();
				}
			}

			if ($stmt->execute())
			{
				$saved++;
			}
			else
			{
				$errors++;
			}
		}

		$agents_since = new DateTime();

		if (!empty($content['agents_since']))
		{
			$agents_since = new DateTime($content['agents_since']['date'], new DateTimeZone($content['agents_since']['timezone']));
		}

		$db->exec('INSERT INTO "config" values ("agentsSince","'.$agents_since->getTimestamp().'")');

	}

// unlink($AGENTSLOG);

}

$stmt = $db->prepare('SELECT * from "agents" where "opt-in" = "true" order by "lat_time_seen" desc');
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
