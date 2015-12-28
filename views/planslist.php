<?php

echo
$this->div(
    '',
    array('id'=>'plansTableDiv','style'=>'display: none;'),
    $this->tag(
        'table',
        array('id'=>'plansTable', 'class'=>'table table-border table-condensed sortable'),
        $this->tag(
            'thead',
            $this->tag(
                'tr',
                $this->tag('th', '')
                . $this->tag('th', array('data-sortable-sortfield'=>'name'), 'Name')
                . $this->tag('th', array('data-sortable-sortfield'=>'modified','data-sortdir'=>'desc'), 'Last modified')
            )
        )
        . $this->tag('tbody')
    )
    . $this->button('New', array('class'=>'btn-primary','id'=>'newPlan'))
    . '&nbsp;&nbsp;' . $this->button('Import from IPPlan.txt file', array('id'=>'importPlanFile'))
    . $this->tag('input', array('id'=>'importPlanFileControl', 'type'=>'file', 'style' => 'display: none; '))
    . '&nbsp;&nbsp;' . $this->button('Import from pasted text', array('id'=>'importPlanText'))
)
;
