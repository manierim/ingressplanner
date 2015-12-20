<?php

echo
$this->div(
    'form-inline',
    $this->div(
        'checkbox checkbox-inline',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'name'  => 'textualPlanAddLinks',
                'class' => 'planoption',
            ),
            ''
        )
        . $this->tag(
            'label',
            'Add links'
        )
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
            'class'     => 'screenHeigth form-control',
            'id'        => 'todoList',
            'readonly'  => 'readonly',
            'data-screenHeigth-less' => 39
        ),
        ''
    )
)
;
