<?php
//**************************************************************************************************

date_default_timezone_set('UTC');

//**************************************************************************************************

require 'config.php';
require 'php/app.php';
$app = new App;

//**************************************************************************************************

// Меню приложения
$app->menu = [
    ['name' => 'refs',  'title' => 'Справочники'],
    ['name' => 'tools', 'title' => 'Инструменты'],
];

$app->routes = [
    // type   pattern                          class         method      menu     icon                  title
    ['GET',  '/',                             'Home',       'page',     '',      'fas fa-house',       'Главная страница'    ],
    // Справочники
    ['GET',  '/test',                         'Test',       'test',     'refs',  'fas fa-text-slash',  'Тест'                ],
    ['*',    '/api/test1/([\w\-]+)',          'Test',       'api_test1'                                                      ],
    ['DIV',  '',                              '',           '',         'refs'                                               ],
    // Инструменты
    ['GET',  '/settings',                     'Settings',   'settings', 'tools', 'fas fa-gear',        'Настройки'           ],
    ['GET',  '/api/settings',                 'Settings',   'index'                                                          ],
    ['GET',  '/sysinfo',                      'SysInfo',    'sysinfo',  'tools', 'fas fa-circle-info', 'Информация о системе'],
];

//**************************************************************************************************

// Запуск маршрутизатора
$app->router();

if ( empty($app->route) ) {
    // Not Found (маршрут не найден)
    http_response_code(404);
}
else {
    // Имя файла совпадает с именем класса (в нижнем регистре)
    $file = 'php/' . mb_strtolower($app->route['class']) . '.php';
    if ( file_exists($file) ) {
        // Подключение скрипта
        require($file);
        // Вызов метода класса и передача списка параметров из элементов массива
        ($app->route['class'])::{$app->route['method']}(...$app->route['params']);
    }
    else {
        // Bad Request (файл класса не найден)
        http_response_code(400);
    }
}

//**************************************************************************************************
