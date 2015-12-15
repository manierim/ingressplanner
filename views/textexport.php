<?php

echo
$this->tag(
    'form',
    array('role'=>'form'),
    $this->tag(
        'textarea',
        array(
            'class'     => 'screenHeigth form-control',
            'id'        => 'todoList',
            'readonly'  => 'readonly',
            'data-screenHeigth-less' => 39
        ),
        ''
    )
)
;
