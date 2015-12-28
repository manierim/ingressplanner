<?php

echo
$this->div(
    'form-inline',
    $this->button(
        'Export to text file',
        array(
            'id'    => 'exportPlanToFile',
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
            'id'        => 'planJSON',
            'readonly'  => 'readonly',
            'data-screenHeigth-less' => 39
        ),
        ''
    )
)
;
