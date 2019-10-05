<?php

function pr($var)
{
    echo '<pre>' . print_r($var, true) . '</pre>';
}

function h($text)
{
    return htmlentities($text);
}
