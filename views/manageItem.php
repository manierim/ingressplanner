<?php
echo
$this->div(
    'screenHeigth',
    array('data-screenHeigth-less' => 25),
    $this->panel(
        array(
            'heading' => $this->tag(
                'h3',
                'Manage items'
                . $this->tag('small', ' Move, delete or change plan items')
            ),
            'body'  => $this->div(
                'row',
                $this->div(
                    'col-md-6',
                    $this->tag('h4', 'Select item(s)' . $this->tag('small', ' to move/delete/change'))
                    . $this->div(
                        '',
                        array(
                            'data-filter'           => 'portal',
                            'data-filter-target'    => 'moveItemSelect',
                            'data-filter-label'     => 'Filter by item portal, <strong class=&quot;text-success&quot;>select a portal and then the items to enable &quot;swap portal&quot; change</strong>',
                        )
                    )
                    . $this->div('', array('data-filter'=>'actiontype', 'data-filter-target'=>'moveItemSelect'))
                    . $this->div('', array('data-filter'=>'color', 'data-filter-target'=>'moveItemSelect'))
                    . $this->tag(
                        'select',
                        array(
                            'id' => 'moveItemSelect',
                            'class' => 'form-control screenHeigth',
                            'multiple' => 'multiple',
                            'data-steps="all"',
                            'data-screenHeigth-less' => 108
                        )
                    )
                )
                . $this->div(
                    'col-md-6',
                    $this->tag('h4', 'Position moved item(s)  before')
                    . $this->div(
                        '',
                        array(
                            'data-filter'           => 'portal',
                            'data-filter-target'    => 'moveItemBeforeSelect',
                            'data-filter-label'     => 'Filter by item portal, <strong class=&quot;text-success&quot;>select a portal to enable &quot;swap portal&quot; change</strong>',
                        )
                    )
                    . $this->div('', array('data-filter'=>'actiontype', 'data-filter-target'=>'moveItemBeforeSelect'))
                    . $this->div('', array('data-filter'=>'color', 'data-filter-target'=>'moveItemBeforeSelect'))
                    . $this->tag(
                        'select',
                        array(
                            'id' => 'moveItemBeforeSelect',
                            'class' => 'form-control screenHeigth',
                            'multiple' => 'multiple',
                            'data-singleselect',
                            'data-steps="all"',
                            'data-screenHeigth-less' => 108
                        )
                    )
                )
            ),
            'footer' =>
                $this->row(
                    $this->col(
                        6,
                        $this->tag('button', array('class'=>'btn btn-danger', 'id'=>'deleteItemsBtn'), 'Delete the item(s)')
                    )
                    . $this->col(
                        6,
                        $this->tag('button', array('class'=>'btn btn-primary', 'id'=>'moveItemBtn'), 'Move the item(s)')
                        . '&nbsp;&nbsp;'
                        . $this->tag('button', array('class'=>'btn btn-success', 'id'=>'swapPortalsBtn'), 'Swap item(s) portals')
                    )
                )
            
        )
    )
)
;
