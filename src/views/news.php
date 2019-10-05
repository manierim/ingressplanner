<?php

$ulcontent = '';

foreach ($news as $new) {
    $ulcontent .= $this->view('new',$new);
}

echo $this->tag('ul', 'list-unstyled', $ulcontent);
