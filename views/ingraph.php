<?php

echo $this->div(
    'screenHeight',
    array('data-screenHeight-less' => 25),
    $this->panel(
        array(
            'heading' => $this->tag(
                'h3',
                'Ingraph'
                . $this->tag('small', ' Import & Export')
            ),
            'body' => $this->row(
                $this->col(
                    2,
                    $this->img('ingraph-logo.png')
                )
                . $this->col(
                    10,
                    $this->row(
                        $this->col(
                            12,
                            $this->link('Ingraph', INGRAPHURL, array('target'=>'bnlank')) . ' by Nigel Stepp is a tool for determining the best way to link portals together in the game.'
                        )
                    )
                    . $this->row(
                        $this->col(
                            8,
                            $this->tag('h4', 'Export')
                            . $this->tag('p', 'small', 'Select the portals to be exported as an Ingraph graph file (.gph):')
                            . $this->checkbox(
                                array(
                                    'type'  => 'radio',
                                    'name'  => 'iGsource',
                                    'value' => 'plan',
                                ),
                                $this->tag('strong', 'from plan')
                                . ' ' . $this->tag('small', 'Select portals from the plan')
                            )
                            . $this->checkbox(
                                array(
                                    'type'  => 'radio',
                                    'name'  => 'iGsource',
                                    'value' => 'ranges',
                                ),
                                $this->tag('strong', 'from ranges')
                                . ' ' . $this->tag('small', 'Select portals from definde ranges.<br>Ranges are circles or polygons drawn on the map.')
                            )
                            . $this->div(
                                'iGSelection',
                                array('data-iGsource'=>'plan'),
                                $this->tag(
                                    'select',
                                    array(
                                        'class'         => 'form-control screenHeight',
                                        'data-screenHeight-less' => 107,
                                        'id'            => 'iGPortals',
                                        'multiple'      => 'multiple',
                                        'data-planportals'
                                    )
                                )
                            )
                            . $this->div(
                                'iGSelection',
                                array('data-iGsource'=>'ranges'),
                                $this->div('', array('data-filter'=>'color', 'data-filter-target'=>'iGRanges'))
                                . $this->tag(
                                    'select',
                                    array(
                                        'class'         => 'form-control screenHeight',
                                        'data-screenHeight-less' => 107,
                                        'id'            => 'iGRanges',
                                        'multiple'      => 'multiple',
                                        'data-ranges'
                                    )
                                )
                                . $this->progressBar('Filtering portals in range', 'iGportalsInRangeStatus', 'iGportalsInRangeStatusContainer')
                            )
                            . '<br>' . $this->button('Export Portals to Ingraph', array('class'=>'btn-primary', 'id'=>'exportIngraph'))
                        )
                        . $this->col(
                            4,
                            $this->tag('h4', 'Import')
                            . $this->tag('p', 'small', 'Import an Ingraph graph file (.gph) into the plan.')
                            . $this->tag('h5', 'Color:')
                            . $this->div(
                                '',
                                array(
                                    'id'    => 'iGColor',
                                )
                            )
                            . $this->tag('h5', 'Import type:')
                            . $this->checkbox(
                                array(
                                    'type'  => 'radio',
                                    'name'  => 'iGimportType',
                                    'value' => 'replace',
                                ),
                                $this->tag('strong', 'Replace'),
                                true
                            )
                            . $this->checkbox(
                                array(
                                    'type'  => 'radio',
                                    'name'  => 'iGimportType',
                                    'value' => 'append',
                                ),
                                $this->tag('strong', 'Append'),
                                true
                            )
                            . $this->checkbox(
                                array(
                                    'type'  => 'radio',
                                    'name'  => 'iGimportType',
                                    'value' => 'prepend',
                                ),
                                $this->tag('strong', 'Prepend'),
                                true
                            )
                            . '<br><br>' . $this->button('Import Graph from Ingraph', array('class'=>'btn-primary', 'id'=>'importIngraphBtn'))
                            . $this->tag('input', array('id'=>'importIngraphControl', 'type'=>'file', 'style' => 'display: none; '))
                        )
                    )
                )
            )
            ,
        )
    )
)
;
