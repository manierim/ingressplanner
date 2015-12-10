<?php

$anonymous = 0;

$optedin = array();

if (!empty($agents)) {
    $now = new DateTime();
    usort(
        $agents,
        function ($agent1, $agent2) {

            $a = new DateTime($agent1['last_time_seen']['date'], new DateTimeZone($agent1['last_time_seen']['timezone']));
            $b = new DateTime($agent2['last_time_seen']['date'], new DateTimeZone($agent2['last_time_seen']['timezone']));

            if ($a == $b) {
                return 0;
            }
            return ($a > $b) ? -1 : 1;
        }
    );

    foreach ($agents as $agent) {

        if (empty($agent['opt-in']) or ($agent['opt-in']!='true')) {
            $anonymous++;
        } else {
            $date = new DateTime($agent['last_time_seen']['date'], new DateTimeZone($agent['last_time_seen']['timezone']));

            $interval = $now->diff($date);

            $optedin[] = $this->tag(
                'span',
                array('class'=>'team-'.$agent['team'],'title'=>'L'.$agent['level'] . ', last seen ' . $interval->format('%a days ago')),
                htmlentities($agent['nickname'])
            );
        }
    }

}

$since = '';

if (!empty($agents_since)) {
    $since = '&nbsp;' . $this->tag('small', '(since ' . $agents_since->format('F jS, Y').')');
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
    'scroll screenHeigth',
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
            count($agents) . ' agents have been using ' . PRODUCTNAME . $since . ':'
        )
        . $this->tag('p', $text)
    )
);
