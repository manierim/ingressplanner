<?php

$requiredPluginsHTML = array();

foreach ($requiredPlugins as $name => $data) {
    $requiredPluginsHTML[] = $this->tag('li', $this->tag('strong', $name).' '.$data['description']);
}

echo $this->div(
    'scroll screenHeigth container',
    $this->div(
        'row',
        $this->col(
            2,
            $this->tag('p', $this->img('ingressplannerlogo.png', array('style'=>'margin-top: 20px;')))
        )
        . $this->col(
            10,
            $this->tag(
                'h1',
                PRODUCTNAME
                . ' 2'
            )
            . $this->img('ingress-logo.png', array('class'=>'pull-right'))
            . $this->tag(
                'p',
                $this->tag('small', 'by ' . AUTHOR . '(' . $this->tag('span', 'team-'.AUTHOR_TEAM, AUTHOR_AGENTNAME) . ') | version ' . VERSION . ' build ' . BUILD)
            )
            . $this->tag(
                'p',
                PRODUCTNAME .
                ' is an online tool for the Niantic game "Ingress"
                <blockquote><small>from <cite title="Wikipedia">Wikipedia</cite><br>
                Ingress is an augmented reality massively multiplayer online role playing GPS-dependent game created by
                Niantic Labs.<br>
                The gameplay consists of establishing "portals" at places of public art, landmarks, monuments, etc., and
                linking them to create virtual triangular fields over geographic areas. Progress in the game is measured by
                the number of "mind units" (MUs), i.e. people, nominally controlled by each faction.
                <strong>The necessary links between portals may range from meters to kilometers, to hundreds of kilometers 
                in operations of considerable logistical complexity</strong>.
                </small></blockquote>
                '. PRODUCTNAME .' allows seamless field operations planning integrating existing tools and it\'s own utilities.'
            )
            . $this->img('iitc-logo.png', array('class'=>'pull-right'))
            . $this->tag(
                'h2',
                'Ingress Intel Total Conversion (IITC)'
            )
            . $this->tag(
                'p',
                'The core of ' . PRODUCTNAME . ' functionalities derives from IITC, an <strong>unofficial</strong> browser modification
                to the official Niantic\'s "Ingress Intel" map.<br>
                A number of useful Plugin are already available for IITC to support operations\' planning:
                '
                . $this->tag('ul', $requiredPluginsHTML)
            )
            . $this->tag(
                'p',
                PRODUCTNAME.' dynamically exchange information with IITC and its plugins, performing a complete analysis of the planned links\' sequence,
                highlighting potential problems and thus allowing reordering and optimization of the operation schedule.<br>'
                . $this->tag(
                    'strong',
                    'This is achieved through '
                    . $this->link('its own IITC plugin', PLUGDOWNLOADRELURL)
                    . ', that must be '
                    . $this->tag('span', 'text-danger', 'installed & uptodate!')
                )
            )
            . $this->tag(
                'h3',
                'Building the plan'
            )
            . $this->tag(
                'p',
                PRODUCTNAME.' features plan generation utilities (Multilayer helper, Ingraph graphs export and import) as well as powerfull plan management
                functions (move, delete, change steps).'
            )
            . $this->img('keep-logo.png', array('class'=>'pull-right'))
            . $this->tag(
                'h3',
                'Exporting the plan'
            )
            . $this->tag(
                'p',
                'The final planned sequence can be exported as a "descriptive" text file, for example to Google Keep, for quick reference.<br>
                It will be then easy to go through each step,  portal after portal, with synthetic but fully informational directives.'
            )
            . $this->img('drive-logo.png', array('class'=>'pull-right'))
            . $this->tag(
                'h3',
                'Storing the plan'
            )
            . $this->tag(
                'p',
                PRODUCTNAME . ' stores your plans in your Google Drive, so you can access them from any place*, at any time.'
                . '<br><small>* ' . PRODUCTNAME . ' requires IITC desktop, mobile browsers doesn\'t allow browser modifications.</small>'
            )
            . $this->tag('hr')
            . $this->tag(
                'p',
                $this->tag('strong', 'This following disclaimer fully apply to ' . PRODUCTNAME . ':')
                . $this->tag(
                    'blockquote',
                    '<small>from the <cite title="IITC">IITC site</cite><br>
                    <div class="alert alert-block alert-danger"><span class="icon-warning"></span>
                    This site and the scripts are not officially affiliated with Ingress or Niantic Labs at Google.
                    Using these scripts is likely to be considered against the Ingress Terms of Service. Any use is at your own risk.
                 </div></small>'
                )
            )
        )
    )
);
