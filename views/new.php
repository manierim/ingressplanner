<?php

$title = '';

if (
    (!isset($title))
    and isset($version)
)
{
    $title = 'v ' . $version . ' online';
}

if (is_array($body))
{
    $body =
        $this->tag('p', 'Fixes & improvements:')
        . $this->tag('ul',
            $this->tag(
                'li',
                implode('</li><li>', $body)
            )
        )
    ;
}
echo 
$this->tag(
    'li',
    $this->tag('h5',  $this->tag('strong', $title))
    . $this->tag('small', 'date', $date)
    . $body
);
