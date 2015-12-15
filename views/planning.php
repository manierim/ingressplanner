<?php
echo
$this->div(
    '',
    $this->view('anim')
    . $this->view('noplanactive')
    . $this->div(
        'row',
        $this->div(
            'col-md-2',
            $this->tag('h1', 'Steps')
        )
        . $this->div(
            'col-md-10',
            $this->tag(
                'button',
                array(
                    'class'         => 'btn btn-default',
                    'role'          => 'button',
                    'data-toggle'   => 'collapse',
                    'href'          => '#optionsCollapse',
                    'aria-expanded' => 'false',
                    'aria-controls' => 'optionsCollapse',
                    'style'         => 'margin-top: 20px; ',
                ),
                'Options ' . $this->tag('span', array('class'=>'caret'), '')
            )
            .
            $this->div(
                'collapse',
                array(
                    'id'    => 'optionsCollapse',
                    'data-stepsCollapse' => true,
                ),
                $this->view('planoptions')
            )
            . $this->tag(
                'button',
                array(
                    'class'         => 'btn btn-info',
                    'role'          => 'button',
                    'data-toggle'   => 'collapse',
                    'href'          => '#toolsCollapse',
                    'aria-expanded' => 'false',
                    'aria-controls' => 'toolsCollapse',
                    'style'         => 'margin-top: 20px; ',
                ),
                'Tools ' . $this->tag('span', array('class'=>'caret'), '')
            )
            .
            $this->div(
                'collapse',
                array(
                    'id'    => 'toolsCollapse',
                    'data-stepsCollapse' => true,
                ),
                $this->view('plantools')
            )
            . $this->tag(
                'button',
                array(
                    'class'         => 'btn btn-success',
                    'role'          => 'button',
                    'data-toggle'   => 'collapse',
                    'href'          => '#exportCollapse',
                    'aria-expanded' => 'false',
                    'aria-controls' => 'exportCollapse',
                    'style'         => 'margin-top: 20px; ',
                ),
                'Export ' . $this->tag('span', array('class'=>'caret'), '')
            )
            .
            $this->div(
                'collapse',
                array(
                    'id'    => 'exportCollapse',
                    'data-stepsCollapse' => true,
                ),
                $this->view('export')
            )
        )
    )
    . $this->div(
        'scroll screenHeigth',
        array('id'=>'stepsTableContainer',),
        $this->tag(
            'table',
            array(
                'id'    => 'steps',
                'class' => 'table table-bordered text-center table-condensed'
            ),
            $this->tag(
                'thead',
                $this->tag(
                    'tr',
                    $this->tag('th', array('rowspan'=>2,'colspan'=>2), 'Type')
                    . $this->tag('th', array('rowspan'=>2), 'Step#')
                    . $this->tag('th', array('rowspan'=>3), 'From')
                    . $this->tag('th', array('colspan'=>2), 'Keys to farm')
                    . $this->tag('th', array('rowspan'=>2), 'To')
                    . $this->tag('th', array('rowspan'=>2), 'Keys After')
                    . $this->tag('th', array('rowspan'=>2), 'AP')
                )
                . $this->tag(
                    'tr',
                    $this->tag('th', 'by now')
                    . $this->tag('th', 'Total')
                )
            )
            . $this->tag('tbody')
        )
    )
)
;
