<?php

echo $this->div(
    'scroll screenHeight',
    $this->view('noplanactive')
    . $this->tag(
        'table',
        array(
            'class' => 'table table-striped table-bordered text-center sortable',
            'id'    => 'portals'
        ),
        $this->tag(
            'thead',
            $this->tag(
                'tr',
                $this->tag('th', array('rowspan'=>2, 'data-sortable-sortfield'=>'title'), 'Name')
                . $this->tag('th', array('rowspan'=>2, 'data-sortable-sortfield'=>'linksIn'), 'Links IN')
                . $this->tag('th', array('colspan'=>2, 'data-keyfarming'), 'Keys')
            )
            . $this->tag(
                'tr',
                $this->tag('th', array('data-sortable-sortfield'=>'keys', 'data-keyfarming'), 'Owned')
                . $this->tag('th', array('data-sortable-sortfield'=>'missing', 'data-keyfarming'), 'Missing')
            )
        )
        . $this->tag('tbody')
    )
)
;
