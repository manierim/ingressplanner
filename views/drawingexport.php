<?php

echo
$this->div(
    'form-inline',
    $this->checkbox(
        array(
            'name'  => 'drawingExportMarkers',
            'class' => 'planoption',
        ),
        'Export Portals (keys, take down, etc.) steps (markers)'
    )
    . $this->checkbox(
        array(
            'name'  => 'drawingExportRanges',
            'class' => 'planoption',
        ),
        'Export Ranges (polygons)'
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
            'class'     => 'screenHeigth form-control',
            'id'        => 'drawingJSON',
            'readonly'  => 'readonly',
            'data-screenHeigth-less' => 39
        ),
        ''
    )
)
;
