<?php

$steps = array(

    $this->tag(
        'li',
        array('class'=>'qs-iitcplugin'),
        'Make sure you are ' . $this->tag('strong', 'logged in the Ingress Intel site ') . $this->link(STOCKINTELURL, STOCKINTELURL, true)
    ),

);

if (!FIXEDIITC)
{
    $steps[] = $this->tag(
        'li',
        array('class'=>'qs-iitcplugin'),
        'Install ' . $this->tag('strong', 'IITC Desktop') . ': '. $this->link(IITCINTALLURL, IITCINTALLURL, true)
    );
}
else
{
    $steps[] = $this->tag(
        'li',
        array('class'=>'qs-iitcplugin'),
        'Install ' . $this->tag('strong', 'IITC Desktop ' . $this->tag('span',array('style'=>'color: red; '),'FIXED') . ' script') . ': '
        . $this->link(FIXEDIITC, FIXEDIITC, true)
        . '<br>' . $this->tag('em',' ('.FIXEDIITCREASON.')')
    );

}


foreach ($requiredPlugins as $name=>$plugin) {


    $steps[] = $this->tag(
        'li',
        array('class'=>'qs-iitcplugin'),
        'Install ' . $this->tag('strong', $name . ' plugin') . ' for IITC'
        . ': '
        . $this->link('info',$plugin['infoURL'],true)
        . ', '
        . $this->link('download',$plugin['downloadURL'],true)
    );
}

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-iitcplugin'),
    'Install ' . $this->tag('strong', PRODUCTNAME . ' plugin') . ' for IITC: ' . $this->link(PLUGDOWNLOADRELURL, PLUGDOWNLOADRELURL, true)
);

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-iitcplugin'),
    $this->tag(
        'em',
        'If you completed all the above steps, '
        . $this->link(
            'refresh this page',
            '.',
            array('onclick'=>'location.reload(); return false;')
        )
        . ' and just wait IITC to initialize all its plugins'
    )
);

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-gdrive'),
    'Authorize ' . PRODUCTNAME . ' to access your Google Drive space in the '
    . $this->link(
        '"Plans" tab',
        '.',
        array('onclick'=>"ingressplanner.ui.gotab('gdriveTab'); return false;")
    )
);

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-gdrivenoplans'),
    'Create a new plan in the '
    . $this->link(
        '"Plans" tab',
        '.',
        array('onclick'=>"ingressplanner.ui.gotab('gdriveTab'); return false;")
    )
);

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-gdrivenoemptyplan'),
    'Start drawing your links with the Draw Tools in the '
    . $this->link(
        '"IICT" tab',
        '.',
        array('onclick'=>"ingressplanner.ui.gotab('ictTab'); return false;")
    )
);

$steps[] = $this->tag(
    'li',
    array('class'=>'qs-checkplan'),
    'Check the sequence of links you drawn, reorder and modify it in the '
    . $this->link(
        '"Steps" tab',
        '.',
        array('onclick'=>"ingressplanner.ui.gotab('stepsTab'); return false;")
    )
);


echo
    $this->div(
        'panel panel-primary',
        $this->div(
            'container',
            $this->tag('h4', $this->tag('strong', 'Quick Start:'))
            . $this->tag('ol', $steps)
        )
    )
;
