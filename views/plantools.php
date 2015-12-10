<?php

echo
$this->div(
    'container',
    $this->tabPanel(
        'moveItemTab',
        array(
            'moveItemTab' => array(
                'title'     => 'Manage Items',
                'view'      => 'manageItem',
            ),
            'multiLayerToolTab' => array(
                'title'     => 'Multilayer',
                'view'      => 'multilayer',
            ),
            'ingraphTab' => array(
                'title'     => 'Ingraph',
                'view'      => 'ingraph',
            ),
        )
    )
)
;
