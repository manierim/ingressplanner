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

<?php 

if (!empty($additionalassetts['css']))
{
    foreach ($additionalassetts['css'] as $css) {
        echo $html->tag('link',array('href'=>$css,'rel'=>'stylesheet'));
    }
}

?>

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
<?php 

echo $content;

if (!empty($additionalassetts['jsblocks']))
{
    foreach ($additionalassetts['jsblocks'] as $jsblock) {
        echo $html->tag('script',array('type'=>'text/javascript'),$jsblock);
    }
}
?>

    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/<?= LIB_JQUERY_VERS ?>/jquery.min.js"></script>
  
    <!-- Bootstrap -->
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/<?= LIB_BOOTSTRAP_VERS ?>/js/bootstrap.min.js" integrity="<?= LIB_BOOTSTRAP_JS_INTEGRITY ?>" crossorigin="anonymous"></script>


<?php 

if (!empty($additionalassetts['scripts']))
{
    foreach ($additionalassetts['scripts'] as $script) {
        echo $html->tag('script',array('src'=>$script,'type'=>'text/javascript'));
    }
}

echo $jsbuffer;
?>

  </body>
</html>