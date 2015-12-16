<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="favicon.png">
    <title><?= PRODUCTNAME ?></title>

    <!-- Bootstrap -->
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/<?= LIB_BOOTSTRAP_VERS ?>/css/bootstrap.min.css" integrity="<?= LIB_BOOTSTRAP_CSS_INTEGRITY ?>" crossorigin="anonymous" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/<?= LIB_BOOTSTRAP_VERS ?>/css/bootstrap-theme.min.css" integrity="<?= LIB_BOOTSTRAP_CSS_THEME_INTEGRITY ?>" crossorigin="anonymous" rel="stylesheet">

    <!-- Color Picker Sliders -->
    <link href="css/bootstrap.colorpickersliders.min.css" rel="stylesheet">

    <!-- Awesome Bootstrap Checkbox -->
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" rel="stylesheet">
    <link href="css/awesome-bootstrap-checkbox.css" rel="stylesheet">

    <!-- Leaflet -->
    <link rel="stylesheet" href="css/leaflet.css" />

    <!-- leaflet.label -->
    <link rel="stylesheet" href="css/leaflet.label.css" />

    <!-- Site -->
    <link href="css/main.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body style="overflow: hidden; ">

  <?php echo $content; ?>


    <script type="text/javascript">
    about = <?= json_encode(array('debug'=>DEBUG,'productname'=>PRODUCTNAME,'version'=>VERSION,'author'=>AUTHOR,'requiredPlugins'=>$requiredPlugins )) ?>;
    about.site = window.location.href;
    about.pluginVersion = <?= json_encode(PLUGINVERSION) ?>;
    </script>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/<?= LIB_JQUERY_VERS ?>/jquery.min.js"></script>
  
    <!-- Bootstrap -->
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/<?= LIB_BOOTSTRAP_VERS ?>/js/bootstrap.min.js" integrity="<?= LIB_BOOTSTRAP_JS_INTEGRITY ?>" crossorigin="anonymous"></script>

    <!-- Bootbox.js -->
    <script type="text/javascript" src="js/bootbox.min.js"></script>

    <!-- Color Picker Sliders -->
    <script type="text/javascript" src="js/tinycolor-min.js"></script>
    <script type="text/javascript" src="js/bootstrap.colorpickersliders.nocielch.min.js"></script>

    <!-- Leaflet -->
    <script src="js/leaflet.js"></script>

    <!-- Leaflet Routing Machine -->
    <script src="js/leaflet-routing-machine.min.js"></script>

    <!-- Leaflet.label -->
    <script src="js/leaflet.label.js"></script>

    <!-- Main App -->
    <script type="text/javascript" src="js/ingressplanner.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>
    <script type="text/javascript" src="js/iitc.js"></script>
    <script type="text/javascript" src="js/plan.js"></script>
    <script type="text/javascript" src="js/gameworld.js"></script>
    <script type="text/javascript" src="js/gdrive.js"></script>
    <script type="text/javascript" src="js/ui.js"></script>
    <script type="text/javascript" src="js/aprewards.js"></script>
    <script type="text/javascript" src="js/tools.js"></script>
    <script type="text/javascript" src="js/router.js"></script>

    <script type="text/javascript" src="https://apis.google.com/js/client.js?onload=gdriveClientLoad"></script>

 <?php if (!DEBUG) : ?>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-58916725-1', 'auto');
      ga('send', 'pageview');

    </script>
<?php endif; 
      echo $jsbuffer;
?>

  </body>
</html>