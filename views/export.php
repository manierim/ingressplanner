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
        )
    )
)
;
