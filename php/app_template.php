<!DOCTYPE html>
<html lang="ru">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="icon" href="/<?=$app->settings['appFavicon']?>" type="image/x-icon">
        <link rel="stylesheet" type="text/css" href="/css/bootstrap/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="/css/fontawesome/css/all.css">
        <link rel="stylesheet" type="text/css" href="/css/app.css?v=<?=$app->version?>">
        <title><?=$app->settings['appTitle']?></title>
    </head>
    <body>

        <style>
            .col-id { width: 130px; }
            .col-name { width: 350px; }
            .col-key { width: 200px; }
            .col-value { width: 350px; }
            .col-in_use { width: 65px; }
            .col-note { width: 400px; }
        </style>

        <div id="app">
            <?php
                require('php/app_menu.php');
                require('php/' . $app->content . '.php');
            ?>
        </div>

        <script src="/js/app-box.js?v=<?=$app->version?>" type="text/javascript"></script>
        <script src="/js/app-ref.js?v=<?=$app->version?>" type="text/javascript"></script>
        <script src="/js/app.js?v=<?=$app->version?>" type="text/javascript"></script>
        <script src="/js/axios.js" type="text/javascript"></script>
        <script src="/js/vue_crud_form.js?v=<?=$app->version?>" type="text/javascript"></script>
        <script src="/js/vue.global.js" type="text/javascript"></script>

        <script src="/js/settings.js?v=<?=date('Y-m-d-H')?>" type="text/javascript"></script>

    </body>
</html>
