<?php

echo
$this->div(
    'form-inline',
    $this->checkbox(
        array(
            'name'  => 'textualPlanAddLinks',
            'class' => 'planoption',
        ),
        'Add links',
        true
    )
    . $this->tag(
        'span',
        array(
            'id'    => 'textualPlanAddLinksParamsContainer',
            'style' => 'vertical-align: middle;',
        ),
        '&nbsp;'
        . $this->input(
            'textualPlanAddLinksType',
            array(
                'type'  => 'select',
                'empty' => false,
                'options'  => array(
                    'portal'    => 'to portal (Intel)',
                    'gmap'      => 'to location (Google Maps)',
                ),
                'class' => 'planoption',
            )
        )
        . ' only if distance is '
        . $this->tag(
            'input',
            array(
                'type'  => 'number',
                'min'   => 0,
                'step'  => 10,
                'name'  => 'textualPlanAddLinksMinDistance',
                'style' => 'width: 6em; text-align: center; ',
                'class' => 'planoption',
            )
        )
        . ' meters or more '
    )
)
. $this->tag(
    'form',
    array('role'=>'form'),
    $this->tag(
        'textarea',
        array(
            'class'     => 'screenHeight form-control',
            'id'        => 'todoList',
            'readonly'  => 'readonly',
            'data-screenHeight-less' => 39
        ),
        ''
    )
)
;
