<?php
echo
    $this->view('noplanactive')
    . $this->tag(
        'iframe',
        array(
            'class' => 'screenHeigth',
            'id'    => 'ictFrame',
            'src'   => STOCKINTELURL,
            'style' => 'border:0; padding:0, margin:0; width: 100%; height=auto;',
        )
    )
;
