<?php
namespace IngressPlanner\Helpers;

class HtmlHelper
{

    private $jsBuffer = array('dct'=>array(),'onDomReady'=>array());

    public function jsBuffer($js, $onDomReady = true)
    {
        $this->jsBuffer[$onDomReady?'onDomReady':'dct'][] = $js;
    }

    public function getJsBuffer()
    {

        $code = array();

        if (!empty($this->jsBuffer['dct'])) {
            $code[] = implode("\n", $this->jsBuffer['dct']);
            
        }

        if (!empty($this->jsBuffer['onDomReady'])) {
            $code[] = '$( document ).ready(function() { ' . "\n" . implode("\n", $this->jsBuffer['onDomReady']) . "\n" . '});';
        }
        $this->jsBuffer = array('dct'=>array(),'onDomReady'=>array());

        return $this->tag('script', array('type'=>'text/javascript'), implode("\n", $code));
    }

    private function addItemtoAttribute($attrsArray, $attributeKey, $itemsToAdd)
    {
        if (empty($attrsArray)) {
            $attrsArray = array();
        }

        if (!isset($attrsArray[$attributeKey])) {
            $attrsArray[$attributeKey] = array();
        } elseif (is_string($attrsArray[$attributeKey])) {
            $attrsArray[$attributeKey] = explode(' ', $attrsArray[$attributeKey]);
        }

        if (is_string($itemsToAdd)) {
            $itemsToAdd = explode(' ', $itemsToAdd);
        }

        foreach ($itemsToAdd as $itemToAdd) {
            if (!in_array($itemToAdd, $attrsArray[$attributeKey])) {
                $attrsArray[$attributeKey][] = $itemToAdd;
            }
        }

        return $attrsArray;

    }

    public function view($file, $vars = null)
    {
        if (!empty($vars) && is_array($vars)) {
            extract($vars);
        }
        ob_start();
        require "views/$file.php";
        $html = ob_get_contents();
        ob_end_clean();
        return $html;
    }

    public function input($name, $options)
    {
        if (isset($options['options'])  and (!isset($options['type']))) {
            $options['type'] = 'select';
        }

        if (!isset($options['type'])) {
            $options['type'] = null;
        }

        $content = $labelHtml = '';

        switch ($options['type'])
        {
            case 'select':

                $empty = '';

                if (isset($options['empty'])) {
                    $empty = $options['empty'];
                }

                if ($empty!==false) {
                    $content .= $this->tag('option', array('value'=>''), htmlentities($empty));
                }

                if (!empty($options['options'])) {
                    foreach ($options['options'] as $value => $label) {
                        $content .= $this->tag('option', array('value'=>$value), htmlentities($label));
                    }
                }
                unset($options['options']);
                break;

            default:
                break;
        }

        unset($options['empty']);

        $cols    = null;

        if (isset($this->_formParams)) {
            if (!empty($this->_formParams['type'])) {
                switch ($this->_formParams['type']) {
                    case 'horizontal':
                        $cols = array('sm'=>array(2,10));

                        if ((!empty($this->_formParams['cols']))) {
                            $cols = $this->_formParams['cols'];
                        }

                        break;
                    
                }
            }
        }

        if (isset($options['label'])) {
            $labOpts = array();
            if (isset($options['id'])) {
                $labOpts['for'] = $options['id'];
            }

            if (is_array($cols)) {
                foreach ($cols as $mediaBreakPoint => $gridcounts) {
                    $labOpts = $this->addItemtoAttribute($labOpts, 'class', "col-{$mediaBreakPoint}-{$gridcounts[0]}");
                    $options = $this->addItemtoAttribute($options, 'div', array('class'=>"col-{$mediaBreakPoint}-{$gridcounts[1]}"));
                }

                $labOpts = $this->addItemtoAttribute($labOpts, 'class', 'control-label');

            }

            $labelHtml .= $this->tag('label', $labOpts, $options['label']);
            unset($labOpts);
        } elseif (is_array($cols)) {
            foreach ($cols as $mediaBreakPoint => $gridcounts) {
                $options = $this->addItemtoAttribute($options, 'div', array('class'=>"col-{$mediaBreakPoint}-offset-{$gridcounts[0]} col-{$mediaBreakPoint}-{$gridcounts[1]}"));
            }
        }
        unset($options['label']);

        $divOpts = null;

        if (isset($options['div'])) {
            $divOpts = $options['div'];
            unset($options['div']);
        }

        $options = $this->addItemtoAttribute($options, 'class', 'form-control');
        $controlHtml = $this->tag($options['type'], $options, $content);

        if (is_array($divOpts)) {
            $controlHtml = $this->div($divOpts, $controlHtml);
        }
        unset($divOpts);

        return $this->div('form-group', $labelHtml . $controlHtml);

    }

    public function formClose()
    {
        return '</form>';
    }

    public function formOpen($type = null, $attrsArray = null)
    {

        if (is_array($type) and is_null($attrsArray)) {
            $attrsArray = $type;
            $type = null;
        }

        if (is_null($attrsArray)) {
            $attrsArray = array();
        }

        $formParams = array('type'=>$type);

        switch ($type) {

            case null:
                break;
            
            case 'horizontal':
                $attrsArray = $this->addItemtoAttribute($attrsArray, 'class', 'form-horizontal');
                break;

            default:
                throw new \ErrorException("Invalid form type '$type'", 1);
                
                break;
        }

        $this->_formParams = $formParams;

        return $this->tag('form', $attrsArray, '', true);
    }

    public function tag($tag, $attrsArray = null, $content = '', $openOnly = false)
    {
        $attrs = array();

        if (!empty($attrsArray)) {

            if (is_string($attrsArray)) {
                if (empty($content)) {
                    $content = $attrsArray;
                    $attrsArray = array();
                } else {
                    $attrsArray = array('class'=>$attrsArray);
                }
            }

            if (is_array($attrsArray)) {
                if (is_numeric(key($attrsArray))) {
                    $content = implode('', $attrsArray);
                    $attrsArray = array();
                } else {
                    if (isset($attrsArray['class'])  and empty($attrsArray['class'])) {
                        unset($attrsArray['class']);
                    }

                    if (!empty($attrsArray)) {
                        foreach ($attrsArray as $key => $value) {

                            if (is_array($value)) {
                                $value = implode(' ', $value);
                            }

                            if (is_string($key)) {
                                $attrs[] = "{$key}=\"{$value}\"";
                            } else {
                                $attrs[] = "{$value}";
                            }

                            
                        }

                    }

                }

            }

        }

        if (!empty($attrs)) {
            $attrs = ' ' . $attrs = implode(' ', $attrs);
        } else {
            $attrs = '';
        }

        $ret = "<{$tag}{$attrs}>{$content}";

        if (!$openOnly) {
            $ret .= "</{$tag}>";
        }

        return $ret;
    }

    public function button($text, $attrsArray = array())
    {
        if (is_string($attrsArray)) {
            $attrsArray = $this->addItemtoAttribute(array(), 'class', 'btn-'.$attrsArray);
        }

        if (isset($attrsArray['type'])) {
            $attrsArray = $this->addItemtoAttribute($attrsArray, 'class', 'btn-'.$attrsArray['type']);
            unset($attrsArray['type']);
        }

        $attrsArray = $this->addItemtoAttribute($attrsArray, 'class', 'btn');
        $attrsArray['type'] = 'button';
        $attrsArray['value'] = $text;

        return $this->tag(
            'input',
            $attrsArray
        );

    }

    public function script($js)
    {
        return $this->tag('script', array('type'=>'text/javascript'), $js);
    }

    public function img($src, $attrsArray = null, $noresponsive = false)
    {

        if (empty($attrsArray)) {
            $attrsArray=array();
        } elseif (is_string($attrsArray)) {
            $attrsArray = array('class'=>$attrsArray);
        }

        $attrsArray['src'] = 'img/'.$src;

        if (!$noresponsive) {
            $attrsArray = $this->addItemtoAttribute($attrsArray, 'class', 'img-responsive');
        }

        return $this->tag('img', $attrsArray);
    }

    private function aMedia($img, $item)
    {

        if (is_array($item['link'])) {
            $linkHref = $item['link'][0];
            $linkAttrsArray = $item['link'][1];
        } else {
            $linkHref = $item['link'];
            $linkAttrsArray = array();
        }

        $linkAttrsArray = $this->addItemtoAttribute($linkAttrsArray, 'class', 'media-left');

        $body = $item['body'];

        if (!empty($item['heading'])) {
            $body = $this->tag('h4', 'media-heading', $item['heading']) . $body;
        }

        return $this->div(
            'media',
            $this->link($this->img($img, null, true), $linkHref, $linkAttrsArray)
            . $this->div('media-body', $body)
        );

    }

    public function carousel($id, $items, $options)
    {

        $indicators = $carouselInner = '';

        $active = ' active';

        if (!empty($items)) {

            $index = 0;

            foreach ($items as $key => $value) {

                $indicators.= $this->tag(
                    'li',
                    array(
                        'data-target'   => '#' . $id,
                        'data-slide-to' => $index,
                        'class'         => $active
                    )
                );

                if (!empty($options['media'])) {
                    $content = $this->aMedia($key, $value);
                } else {
                    $content = $item;
                }

                $carouselInner.= $this->div(
                    'item' . $active,
                    array(
                        'style'    => 'padding: 2em 15% 60px 15%; ',
                    ),
                    $content
                );

                $active = '';
                $index++;
            }
        }

        $controls = '';

        foreach (array('prev' => 'left', 'next' => 'right') as $slide => $dir) {
            $controls .= $this->tag(
                'a',
                array(
                    'class'         => $dir . ' carousel-control',
                    'href'          => '#'.$id,
                    'role'          => 'button',
                    'data-slide'    => $slide,
                ),
                $this->tag(
                    'span',
                    array(
                        'class'         => 'glyphicon glyphicon-chevron-' . $dir,
                        'aria-hidden'   => true,
                    )
                )
                . $this->tag(
                    'span',
                    array(
                        'class'         => 'sr-only',
                    ),
                    $slide
                )
            );
        }

        $carouselOpts = array(
            'id'        => $id,
            'data-ride' => 'carousel',
        );

        if (!empty($options['interval'])) {
            $carouselOpts['data-interval'] = $options['interval'];
        }

        return
            $this->div(
                'carousel slide',
                $carouselOpts,
                $this->tag(
                    'ol',
                    array('class'=>'carousel-indicators'),
                    $indicators
                )
                . $this->div(
                    'carousel-inner',
                    array(
                        'role'  => 'listbox'
                    ),
                    $carouselInner
                )
                . $controls
            )
        ;
    }

    public function media($items)
    {
        $return = '';

        if (!empty($items)) {
            foreach ($items as $img => $item) {
                $return .= $this->aMedia($img, $item);
            }
        }

        return $return;

    }

    public function row($attrsArray = null, $content = null)
    {
        if (is_string($attrsArray) && is_string($content)) {
            $attrsArray = array('class'=>$attrsArray);
        }
        return $this->div('row', $attrsArray, $content);
    }

    public function col($span, $attrsArray = null, $content = null)
    {
        return $this->div('col-md-'.$span, $attrsArray, $content);
    }

    public function div($class, $attrsArray = null, $content = null)
    {
        if (is_string($attrsArray) and is_null($content)) {
            $content = $attrsArray;
            $attrsArray = array();
        }

        if (empty($attrsArray)) {
            $attrsArray = array();
        }

        if (empty($content)) {
            $content = '';
        }

        return $this->tag('div', $this->addItemtoAttribute($attrsArray, 'class', $class), $content);

    }

    public function link($text, $href = '#', $attrsArray = array())
    {
        if (is_bool($attrsArray)
            &&
            $attrsArray
        ) {
            $attrsArray = array('target'=>'_BLANK');
        }

        if (empty($attrsArray)) {
            $attrsArray= array();
        }

        $attrsArray['href'] = $href;
        return $this->tag('a', $attrsArray, $text);
    }

    public function panel($panel)
    {
        if (is_string($panel)) {
            $panel = array('body'=>$panel);
        }

        $return = '';

        foreach (array('heading','body','footer') as $section) {
            if (isset($panel[$section])) {
                $return .= $this->div('panel-'.$section, $panel[$section]);
            }
        }

        return $this->div('panel panel-default', $return);


    }

    public function tabPanel($active, $tabsArray, $options = array())
    {
        
        $tablist = '';
        $tabs = '';

        foreach ($tabsArray as $id => $tab) {

            if (!empty($tab['icon'])) {
                $tab['title'] = '<span class="glyphicon glyphicon-' . $tab['icon'] . '" aria-hidden="true"></span>&nbsp;' . $tab['title'];
            }

            $tablist .= $this->tag(
                'li',
                array(
                    'role'  => 'presentation',
                    'class' => ($id==$active?'active':'')
                ),
                $this->link($tab['title'], '#'.$id, array('aria-controls'=>$id,'role'=>'tab','data-toggle'=>'tab'))
            );

            if (!empty($tab['view'])) {

                $view = $tab['view'];
                $vars = null;
                if (is_array($view)) {
                    $vars = current($view);
                    $view = key($view);
                }

                $tab['content'] = $this->view($view, $vars);
            }

            if (empty($tab['content'])) {
                $tab['content'] = '';
            }

            $tabs .= $this->div(
                'tab-pane'.($id==$active?' active':''),
                array('role'=>'tabpanel','id'=>$id),
                $tab['content']
            );
        }

        $tabContentAttrs=array();

        if (isset($options['tab-content-id'])) {
            $tabContentAttrs['id'] = $options['tab-content-id'];
        }

        return $this->div(
            '',
            array('role'=>'tabpanel'),
            $this->tag('ul', array('class'=>'nav nav-tabs','role'=>'tablist'), $tablist)
            . $this->div('tab-content', $tabContentAttrs, $tabs)
        );
    }

    public function progressBar($label, $domId, $containerDomId = null)
    {
        $containerOpts = array();
        if (!is_null($containerDomId)) {
            $containerOpts['id'] = $containerDomId;
        }
        return
            $this->div(
                '',
                $containerOpts,
                $this->row(
                    'text-center',
                    $this->col(
                        12,
                        $this->tag('strong', $label)
                    )
                )
                . $this->row(
                    'text-center',
                    $this->col(
                        12,
                        $this->div(
                            'progress',
                            $this->div(
                                'progress-bar',
                                array(
                                    'id'    => $domId,
                                    'role'  => 'progressbar',
                                    'aria-valuenow' => 0,
                                    'aria-valuemin' => 0,
                                    'aria-valuemax' => 100,
                                    'style' => 'width: 0%; '
                                )
                            )
                        )
                    )
                )
            )
        ;
    }
}
