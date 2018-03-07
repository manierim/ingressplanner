<?php
echo
$this->div(
    'screenHeight',
    array('data-screenHeight-less' => 25),
    $this->panel(
        array(
            'heading' => $this->tag(
                'h3',
                'Multi Layer helper'
                . $this->tag('small', ' Find the best portals for MultiLayer fields')
            ),
            'body' => $this->row(
                'MlSelects',
                $this->col(
                    6,
                    $this->tag('h4', 'Select base link')
                    . $this->tag('p', 'small', 'This will be the base link against which the longest vertex sequence will be searched for in the area defined by the ranges on the right.')
                )
                . $this->col(
                    6,
                    $this->tag('h4', 'Select "ranges" where to perform the search for the vertexes')
                    . $this->tag('p', 'small', 'Ranges are circles or polygons drawn on the map.<br>Make sure to scroll the map at the "all" zoom level to make all portals in the areas show up!')
                )
            )
            . $this->row(
                'MlSelects',
                $this->col(
                    6,
                    $this->div('', array('data-filter'=>'portal', 'data-filter-target'=>'mlBaseLink'))
                    . $this->div('', array('data-filter'=>'color', 'data-filter-target'=>'mlBaseLink'))
                    . $this->tag(
                        'select',
                        array(
                            'class'         => 'form-control screenHeight',
                            'data-screenHeight-less' => 108,
                            'id'            => 'mlBaseLink',
                            'multiple'      => 'multiple',
                            'data-singleselect',
                            'data-steps'    =>'link',
                        )
                    )
                )
                . $this->col(
                    6,
                    $this->div('', array('data-filter'=>'color', 'data-filter-target'=>'mlRanges'))
                    . $this->tag(
                        'select',
                        array(
                            'class'         => 'form-control screenHeight',
                            'data-screenHeight-less' => 108,
                            'id'            => 'mlRanges',
                            'multiple'      => 'multiple',
                            'data-ranges'
                        )
                    )
                )
            )
            . $this->div(
                '',
                array(
                    'id'    => 'mlStatus',
                ),
                $this->progressBar('Filtering portals in range', 'mlPortalsInRangeStatus')
                . $this->progressBar('Filtering blocked portals', 'mlPortalsBlocked')
                . $this->progressBar('Sorting portals', 'mlPortalsSorting')
                . $this->progressBar('Building sequences', 'mlSequencesBuilding')
            )
            . $this->row(
                array(
                    'class'=>'MlResults',
                ),
                $this->col(
                    12,
                    $this->div(
                        'screenHeight scroll',
                        array('data-screenHeight-less' => 348,),
                        $this->tag('h3', 'Results')
                        . $this->tag('ul', array('id'=>'ml-targets'), '')
                    )
                )
            )
            ,
            'footer' => $this->button(
                'Search best sequences',
                array(
                    'class' => 'btn-primary MlSelects',
                    'id'    => 'mlSearch',
                )
            )
            . $this->button('Clear results', array('class'=>'clearMlResults MlResults','type'=>'danger')),
        )
    )
)
;
