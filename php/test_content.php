
<?php
    echo('<br><br>');
    echo('Test' . '<br><br>');

    // Тестирование $app->log();
    /*
    $app->log('logs', 0, 'test', null);
    $app->log('logs', 0, 'test', true);
    $app->log('logs', 0, 'test', 123);
    $app->log('logs', 0, 'test', 987.12345);
    $app->log('logs', 0, 'test', '   Test logs    ');
    $app->log('logs', 0, 'test', ['elm1', 'elm2']);
    $app->log('logs', 0, 'test', $app);
    */

    echo('get_debug_type: ' . get_debug_type($app) . '<br><br>');
    echo '<pre>';
    print_r($app);
    echo '</pre>' . '<br><br>';
?>
