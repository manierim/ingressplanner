<?php

echo $this->div(
    'modal fade',
    array(
        'tabindex'  => -1,
        'role'      => 'dialog',
        'id'        => 'planPreviewModal'
    ),
    $this->div(
        'modal-dialog modal-lg',
        $this->div(
            'modal-content',
            $this->div(
                'modal-header',
                $this->tag(
                    'button',
                    array(
                        'type'  => 'button',
                        'class' => 'close',
                        'data-dismiss'  => 'modal',
                        'aria-label'    => 'Close',
                    ),
                    $this->tag('span', array('aria-hidden'=>'true',), '&times;')
                )
                . $this->tag('h4', 'modal-title', 'Visual preview ' . $this->tag('small', '') . '&nbsp;' . $this->tag('span',''))
            )
            . $this->div(
                'modal-body',
                $this->div(
                    '',
                    array('id'=>'planPreviewControls'),
                    $this->tag(
                        'nav',
                        $this->tag(
                            'ul',
                            array('class'=>'pager'),
                            $this->tag(
                                'li',
                                array('class'=>'previous'),
                                $this->tag(
                                    'a',
                                    array('href'=>'#'),
                                    $this->tag(
                                        'span',
                                        array('aria-hidden'=>true),
                                        '&larr;'
                                    )
                                    . ' Previous'
                                )
                            )
                            . $this->tag(
                                'li',
                                $this->tag(
                                    'button',
                                    array(
                                        'class' => 'moveStep btn btn-default btn-sm',
                                        'aria-label'    => 'Move backward',
                                        'data-direction'    => 'up',
                                    ),
                                    $this->tag(
                                        'span',
                                        array(
                                            'title' => 'Move this step before the previous',
                                            'class' => 'glyphicon glyphicon-arrow-left',
                                            'aria-hidden'   => 'true',
                                        ),
                                        ''
                                    )
                                )
                                . '&nbsp;' . $this->tag(
                                    'button',
                                    array(
                                        'class' => 'removeStep btn btn-danger btn-sm',
                                        'aria-label'    => 'Delete',
                                    ),
                                    $this->tag(
                                        'span',
                                        array(
                                            'title' => 'Remove from plan',
                                            'class' => 'glyphicon glyphicon-remove',
                                            'aria-hidden'   => 'true',
                                        ),
                                        ''
                                    )
                                )
                                . '&nbsp;' . $this->tag(
                                    'button',
                                    array(
                                        'class' => 'invertlink btn btn-default btn-sm',
                                        'aria-label'    => 'Swap',
                                    ),
                                    $this->tag(
                                        'span',
                                        array(
                                            'title' => 'Invert link (swap origin & destination)',
                                            'class' => 'glyphicon glyphicon-resize-horizontal',
                                            'aria-hidden'   => 'true',
                                        ),
                                        ''
                                    )
                                )
                                . '&nbsp;' . $this->tag(
                                    'button',
                                    array(
                                        'class' => 'moveStep btn btn-default btn-sm',
                                        'aria-label'    => 'Move forward',
                                        'data-direction'    => 'down',
                                    ),
                                    $this->tag(
                                        'span',
                                        array(
                                            'title' => 'Move this step after the next',
                                            'class' => 'glyphicon glyphicon-arrow-right',
                                            'aria-hidden'   => 'true',
                                        ),
                                        ''
                                    )
                                )
                            )
                            . $this->tag(
                                'li',
                                array('class'=>'next'),
                                $this->tag(
                                    'a',
                                    array('href'=>'#'),
                                    'Next '
                                    . $this->tag(
                                        'span',
                                        array('aria-hidden'=>true),
                                        '&rarr;'
                                    )
                                )
                            )
                        )
                    )
                )
                . $this->div(
                    'screenHeigth',
                    array(
                        'id'    => 'planPreviewCanvas',
                        'style' => 'width: 100%;',
                        'data-screenHeigth-less' => 70,
                    ),
                    ''
                )
            )
        )
    )
);
