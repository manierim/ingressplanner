<?php

$anonymous = $agents['anonyms']['count'];

$optedin = array();

if (!empty($agents)) {
    $now = new DateTime();
    foreach ($agents['optin'] as $agent) {

        $date = new DateTime('@'.$agent['last_time_seen']);

        $interval = $now->diff($date);

        $optedin[] = $this->tag(
            'span',
            array('class'=>'team-'.$agent['team'],'title'=>'L'.$agent['level'] . ', last seen ' . $interval->format('%a days ago')),
            htmlentities($agent['nickname'])
        );
    }

}

$since = '';

if (!empty($agents_since)) {
    $agents_sinceDT = new DateTime('@'.$agents_since);
    $since = '&nbsp;' . $this->tag('small', '(since ' . $agents_sinceDT->format('F jS, Y').')');
}

$text = array();

if (!empty($optedin)) {
    $text[] = implode(', ', $optedin);
}

if (!empty($anonymous)) {
    $text[] = $anonymous . ' anonymous agents';
}

$text = implode(' and ', $text);

echo $this->div(
    'scroll screenHeight',
    '<br>'
    . $this->div(
        'container',
        array('id'=>'privacyDiv'),
        ''
    )
    . $this->div(
        'container',
        $this->tag(
            'h2',
            count($agents['optin']) + $anonymous . ' agents have been using ' . PRODUCTNAME . $since . ':'
        )
        . $this->tag('p', $text)
    )
);
