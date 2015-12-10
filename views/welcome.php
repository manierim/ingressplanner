<?php

$requiredPluginsHTML = array();

foreach ($requiredPlugins as $name => $data) {
    $requiredPluginsHTML[] = $this->tag('li', $this->tag('strong', $name).' '.$data['description']);
}

echo $this->div(
    'scroll screenHeigth',
    $this->div(
        'jumbotron',
        $this->div(
            'row',
            $this->div(
                'col-md-2',
                $this->img('ingressplannerlogo.png', array('class'=>'pull-left'))
            )
            . $this->div(
                'col-md-10',
                $this->div(
                    'page-header text-center',
                    $this->tag(
                        'h1',
                        $this->tag('small', 'Welcome in ')
                        . PRODUCTNAME
                        . '&nbsp;2&nbsp;<a class="text-center" href="https://plus.google.com/communities/102911691483488654925" target="_blank" style="text-decoration:none;"><img src="//ssl.gstatic.com/images/icons/gplus-32.png" alt="Google+" style="border:0;width:32px;height:32px;"/></a><a href="https://plus.google.com/117771722222180982550" rel="publisher"></a>'
                    )
                    . $this->tag('small', 'by ' . AUTHOR . '(' . $this->tag('span', 'team-'.AUTHOR_TEAM, AUTHOR_AGENTNAME) . ') | version ' . VERSION . ' build ' . BUILD)
                )
                . $this->carousel(
                    'carousel-welcome',
                    array(
                        'ingress-logo.png'   => array(
                            'link'      => array(INGRESSURL,array('target'=>'_blank')),
                            'heading'   => PRODUCTNAME . ' is an online tool for the Niantic game "Ingress"',
                            'body'      => '<blockquote><small>from <cite title="Wikipedia">Wikipedia</cite><br>
                                Ingress is an augmented reality massively multiplayer online role playing GPS-dependent game created by Niantic Labs, a startup within Google.<br>
                                The gameplay consists of establishing "portals" at places of public art, landmarks, monuments, etc., and linking them to create virtual triangular fields over geographic areas. Progress in the game is measured by the number of "mind units" (MUs), i.e. people, nominally controlled by each faction. <strong>The necessary links between portals may range from meters to kilometers, to hundreds of kilometers in operations of considerable logistical complexity</strong>.
                                    </small></blockquote>
                                '.PRODUCTNAME.' allows seamless field operations planning integrating existing tools and it\'s own utilities.
                            ',
                        ),
                        'iitc-logo.png'   => array(
                            'link'      => array(IITCHOMEURL,array('target'=>'_blank')),
                            'heading'   => 'The core of its functionalities derives from Ingress Intel Total Conversion (IITC)',
                            'body'      => 'IITC is a browser modification to the Ingress intel map.<br>
                                A number of useful Plugin are already available for IITC to support operations\' planning:'
                                . $this->tag('ul', $requiredPluginsHTML)
                                .PRODUCTNAME.' dynamically exchange information with IITC and its plugins, performing a complete analysis of the planned links\' sequence, highlighting potential problems and thus allowing reordering and optimization of the operation schedule.<br>
                                <strong>This is achieved through ' . $this->link('its own plugin', PLUGDOWNLOADRELURL) . ', that must be installed & uptodate!</strong>
                                 ',
                        ),
                        'keep-logo.png'   => array(
                            'link'   => array('https://keep.google.com/',array('target'=>'_blank')),
                            'body'   => 'The final planned sequence can be exported as a "descriptive" text file, for example to Google Keep, for quick reference.<br>
                                    It will be then easy to go through each step,  portal after portal, with synthetic but fully informational directives.
                            ',
                        ),
                        'drive-logo.png'   => array(
                            'link'      => array('https://www.google.com/drive/',array('target'=>'_blank')),
                            'body'      => PRODUCTNAME . ' stores your plans in your Google Drive, so you can access them from any place*, at any time.'
                                . '<br><small>* ' . PRODUCTNAME . ' requires IITC desktop, mobile browsers doesn\'t allow browser modifications.</small>'
                            ,
                            ),

                    ),
                    array(
                        'media'     => true,
                        'interval'  => 10000,
                    )
                )
                . '<hr><strong>This following disclaimer fully apply to ' . PRODUCTNAME . ':</strong>
                                 <blockquote><small>from the <cite title="IITC">IITC site</cite><br>
                                    <div class="alert alert-block alert-danger"><span class="icon-warning"></span>
                                    This site and the scripts are not officially affiliated with Ingress or Niantic Labs at Google.
                                    Using these scripts is likely to be considered against the Ingress Terms of Service. Any use is at your own risk.
                                 </div>
                                 </small></blockquote>'
            )
        )
    )
)
;
