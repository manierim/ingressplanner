<?php

echo
$this->div(
    'form-inline',
    $this->div(
        'checkbox',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'name'  => 'drawingExportMarkers',
                'class' => 'planoption',
            ),
            ''
        )
        . $this->tag(
            'label',
            'Export Portals (keys, take down, etc.) steps (markers)'
        )
    )
    . $this->div(
        'checkbox',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'name'  => 'drawingExportRanges',
                'class' => 'planoption',
            ),
            ''
        )
        . $this->tag(
            'label',
            'Export Ranges (polygons)'
        )
    )
    . '&nbsp;&nbsp;' . $this->button(
        'Export to text file',
        array(
            'id'    => 'exportDrwToFile',
            'class' => 'btn-primary btn-xs',
        )
    )
)
. $this->tag(
    'form',
    array('role'=>'form'),
    $this->tag(
        'textarea',
        array(
            'class'     => 'screenHeight form-control',
            'id'        => 'drawingJSON',
            'readonly'  => 'readonly',
            'data-screenHeight-less' => 39
        ),
        ''
    )
)
;
