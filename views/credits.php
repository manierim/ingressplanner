<?php

echo 
	$this->tag('h1','Credits')
	. $this->tag('ul',

		$this->tag('li',
			$this->tag('strong',$this->link('jQuery','https://jquery.com/',true)) . ' ' . LIB_JQUERY_VERS
		)

		. $this->tag('li',
			$this->tag('strong',$this->link('Bootstrap','http://getbootstrap.com/',true)) . ' ' . LIB_BOOTSTRAP_VERS
		)

		. $this->tag('li',
			$this->tag('strong',$this->link('Leaflet','http://leafletjs.com/',true)) . ' ' . LIB_LEAFLET_VERS
		)

		. $this->tag('li',
			'Various:' . $this->tag('ul',

				$this->tag('li',
					'"point-in-polygon" in ' . $this->link('GitHub','https://github.com/substack/point-in-polygon',true)
				)

				. $this->tag('li',
					'"How to determine a point in a triangle?" in ' . $this->link('Stack Overflow','http://www.kryogenix.org/code/browser/sorttable/',true)
				)

				. $this->tag('li',
					'"Spherical Law of Cosines" ' . $this->link('Movable Type Scripts','http://www.movable-type.co.uk/scripts/latlong.html',true)
				)

				. $this->tag('li',
					$this->link('Leaflet Routing Machine','http://www.liedman.net/leaflet-routing-machine/download/',true) . ' 2.5.0'
				)

				. $this->tag('li',
					$this->link('Leaflet.label','https://github.com/Leaflet/Leaflet.label',true) . ' ' . LIB_LEAFLETLABEL_VERS
				)

				. $this->tag('li',
					$this->link('Bootbox.js','http://bootboxjs.com/',true) .' 4.4.0'
				)

				. $this->tag('li',
					$this->link('Bootstrap Color Picker Sliders','https://github.com/istvan-ujjmeszaros/bootstrap-colorpickersliders',true)
				)

				. $this->tag('li',
					$this->link('Awesome Bootstrap Checkbox','https://github.com/flatlogic/awesome-bootstrap-checkbox',true)
					. ' / ' . $this->link('Font Awesome','http://fontawesome.io/',true)
				)

				. $this->tag('li',
					$this->link('Douglas Crockford cycle.js','https://github.com/douglascrockford/JSON-js',true)
				)

			)
		)

	)
;