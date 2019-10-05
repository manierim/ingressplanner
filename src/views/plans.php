<?php

echo
    $this->div(
        'scroll screenHeigth container',
        $this->div(
            'row',
            $this->div(
                'col-md-2',
                $this->tag(
                    'p',
                    'Select a plan to work on:'
                )
            )
            . $this->div(
                'col-md-10',
                $this->div(
                    '',
                    array('id'=>'authDiv',),
                    $this->tag('small', PRODUCTNAME  . ' plans are stored in your Google Drive account:<br>')
                    . $this->button(
                        'Authorize',
                        array(
                            'class' => 'btn-primary',
                            'id'    => 'authorizeButton',
                        )
                    )
                )
                . $this->view('planslist')
            )
        )
    )
;
