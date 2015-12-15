<?php 
echo $this->div(
    'container-fluid',
    array('id'=>'mainwrapper'),
    $this->tabPanel(
        'welcomeTab',
        array(
            'welcomeTab' => array(
                'icon'      => 'home',
                'title'     => 'Home',
                'view'      => array('welcome'=>compact('requiredPlugins','news')),
            ),
            'gdriveTab' => array(
                'icon'      => 'question-sign',
                'title'     => 'Plans',
                'view'      => 'plans',
            ),
            'ictTab' => array(
                'title'     => 'IICT',
                'view'      => 'iict',
            ),
            'stepsTab' => array(
                'icon'      => 'remove',
                'title'     => 'Planning',
                'view'      => 'planning',
            ),
            'portalsTab' => array(
                'title'     => 'Portals',
                'view'      => 'portalstable',
            ),
            'helpTab' => array(
                'title'     => 'Help',
                'view'      => array('help'=>compact('requiredPlugins')),
            ),
            'statisticsTab' => array(
                'title'     => 'Usage stats',
                'view'      => array('statistics' => compact('agents', 'agents_since')),
            ),
        ),
        array(
            'tab-content-id'    => 'contentDiv',
        )
    )
);
