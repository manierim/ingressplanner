<?php
echo
$this->div(
    'well',
    $this->div(
        'checkbox',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'id'    => 'HLPlanningInput',
                'name'  => 'HLPlanning',
                'class' => 'planoption',
            )
        )
        . $this->tag(
            'label',
            $this->tag('strong', 'HIGH LEVEL PLANNING mode')
            . ' ' . $this->tag('small', 'disable all checks and calculations except: planned links crossings, blocking & wasted fileds and outgoing links count check')
        )
    )
    . $this->div(
        'checkbox',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'id'    => 'showDoneLinksInput',
                'name'  => 'showDoneLinks',
                'class' => 'planoption',
            )
        )
        . $this->tag(
            'label',
            $this->tag('strong', 'Show done links')
            . ' ' . $this->tag('small', 'check to show done links (planned links currently in place and of the same faction)')
        )
    )
    . $this->div(
        'checkbox',
        $this->tag(
            'input',
            array(
                'type'  => 'checkbox',
                'id'    => 'fullresosOnTouchedPortalsInput',
                'name'  => 'fullresosOnTouchedPortals',
                'class' => 'planoption',
            )
        )
        . $this->tag(
            'label',
            $this->tag('strong', 'Always Capture & Ful resos')
            . ' ' . $this->tag('small', 'Check to assume any visited portal is captured & made full resos. Brought to NEUTRAL otherwise.')
        )
    )
    . $this->tag('strong', 'Max farming rate ')
    . $this->tag(
        'input',
        array(
            'type'  => 'number',
            'min'   => 1,
            'step'  => 1,
            'id'    => 'keyFarmLimitInput',
            'name'  => 'keyFarmLimit',
            'style' => 'width: 3em; text-align: center; ',
            'class' => 'planoption',
        )
    )
    . ' keys/visit ' . $this->tag('small', 'warn if at any point the planned farming rate is higher than this limit.')
)
;
