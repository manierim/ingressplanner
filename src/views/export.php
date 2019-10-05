<?php

echo
$this->div(
    'container',
    $this->tabPanel(
        'textExportTab',
        array(
            'textExportTab' => array(
                'title'     => 'Textual',
                'view'      => 'textexport',
            ),
            'drawingExportTab' => array(
                'title'     => 'Drawing',
                'view'      => 'drawingexport',
            ),
            'planExportTab' => array(
                'title'     => 'Plan',
                'view'      => 'planexport',
            ),
        )
    )
)
;
