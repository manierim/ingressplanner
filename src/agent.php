<?php

require SRC_FOLDER . 'htmlHelper.php';
$html = new Helpers\HtmlHelper;

$lastseen = time();
$nickname = $_REQUEST['nickname'];
$team = $_REQUEST['team'];
$level = $_REQUEST['level'];

$optIn = null;

if (isset($_REQUEST['opt-in'])) {
    $optIn = $_REQUEST['opt-in'];
} else {
    $stmt = $db->prepare('SELECT "opt-in" from "agents" where "nickname" = :nickname');
    $stmt->execute(array(':nickname'=>$nickname));
    if ($agentDB = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $optIn = $agentDB['opt-in'];
    }
}

$stmt = $db->prepare(
    '
    INSERT OR REPLACE INTO "agents"
    ("nickname", "team", "level", "last_time_seen", "opt-in") 
    values 
    (:nickname, :team, :level, :lastseen, :optin)
    '
);

$stmt->execute(
    array(
        ':nickname' => $nickname,
        ':team'     => $team,
        ':level'    => $level,
        ':lastseen' => $lastseen,
        ':optin'    => $optIn,
    )
);

$_SESSION['agent'] = array(
    'nickname'       => $nickname,
    'team'           => $team,
    'level'          => $level,
    'last_time_seen' => $lastseen,
    'opt-in'         => $optIn,
);

echo json_encode($_SESSION['agent']);
die();
