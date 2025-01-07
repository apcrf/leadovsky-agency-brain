<?php
//**************************************************************************************************

class App
{
    public $pdo = null; // Объект PDO
    public $routes = []; // Маршруты
    public $route = []; // Найденный маршрут из routes + массив параметров маршрута
    public $settings = []; // Настройки приложения из таблицы 'settings'
    public $authUser = []; // Авторизованный пользователь
    public $version = ''; // Версия приложения для загрузки style.css и script.js
    public $content = null; // Строка или массив имён php-файлов - вложений в шаблон страницы

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Конструктор класса
    ////////////////////////////////////////////////////////////////////////////////////////////////

    function __construct() {
        // Создаётся объект PDO
        $this->pdo = $this->createPDO(DB_HOST, DB_NAME, DB_CHAR, DB_USER, DB_PASS);
        // Заменяется стандарный обработчик ошибок
        $value = DB_HOST == '127.0.0.1' ? '1' : '0';
        ini_set("display_errors", $value);
        ini_set("display_startup_errors", $value);
        register_shutdown_function([$this, "shutdownHandler"]);
        // Версия приложения для загрузки style.css и script.js
        $this->version = date("Y-m-d-H-") . substr(date("i"), 0, 1); // Десятки минут
        // Настройки приложения
        $rows = $this->query("SELECT * FROM settings WHERE in_use = 'Y'");
        $this->settings = array_column($rows, 'value', 'key');
        // Test !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        $this->authUser['name'] = 'Avatar';
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Создаётся объект PDO
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function createPDO($db_host, $db_name, $db_char, $db_user, $db_pass) {
        $dsn = "mysql:host=" . $db_host . ";dbname=" . $db_name . ";charset=" . $db_char;
        $opt  = array(
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => TRUE,
        );
        try {
            return new PDO($dsn, $db_user, $db_pass, $opt);
        }
        catch (PDOException $e) {
            http_response_code(500);
            die($e->getMessage());
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Заменяется стандарный обработчик ошибок
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function shutdownHandler() {
        $error = error_get_last();
        if ( $error ) {
            $sql = "
                INSERT INTO errors
                SET
                    server_name = ?,
                    type = ?,
                    message = ?,
                    file = ?,
                    line = ?,
                    debug = ?,
                    created_at = UTC_TIMESTAMP()
            ";
            $params = [$_SERVER['SERVER_NAME'], $error["type"], $error["message"], $error["file"], $error["line"], print_r(debug_backtrace(), true)];
            // Если записать ошибку в БД невозможно, то записываем в файл
            if ( $this->pdo ) {
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
            }
            else {
                error_log("shutdownHandler: " . print_r($params, true));
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Запись в log
    // $app->log('users', 0, 'test', $note);
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function log($tableName, $tableID, $action, $note) {
        // REMOTE_ADDR
        if ( !empty($_SERVER['REMOTE_ADDR']) ) {
            $REMOTE_ADDR = $_SERVER['REMOTE_ADDR'];
        }
        else {
            $REMOTE_ADDR = null;
        }
        // authUserID
        if ( !empty($this->authUser['id']) ) {
            $authUserID = $this->authUser['id'];
        }
        else {
            $authUserID = null;
        }
        // note
        switch ( get_debug_type($note) ) {
            case 'null' :
                $note = null;
                break;
            case 'bool' :
                if ($note) $note = 'true';
                else $note = 'false';
                break;
            case 'int' :
            case 'float' :
                // Do nothing
                break;
            case 'string' :
                $note = trim($note);
                break;
            case 'array' :
            default :
                $note = json_encode($note, JSON_UNESCAPED_UNICODE);
                break;
        }
        // Запись в log
        $sql = "
            INSERT INTO logs
            SET
                server_name = ?,
                client_ip = ?,
                user_id = ?,
                table_name = ?,
                table_id = ?,
                action = ?,
                note = ?,
                created_at = UTC_TIMESTAMP()
        ";
        $params = [$_SERVER['SERVER_NAME'], $REMOTE_ADDR, $authUserID, $tableName, $tableID, $action, $note];
        $this->query($sql, $params);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Маршрутизатор
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function router() {
        // Запрошенный адрес (без GET параметров)
        $url = explode('?', $_SERVER['REQUEST_URI'])[0];
        // Преобразование массива в ассоциативный
        for ($i=0; $i<count($this->routes); $i++) {
            $v = $this->routes[$i];
            $route = [];
            $route['type'] = !empty($v[0]) ? $v[0] : ''; // GET, POST, PUT, DELETE, * (любой)
            $route['pattern'] = !empty($v[1]) ? $v[1] : ''; // Маршрут (регулярное выражение)
            $route['class'] = !empty($v[2]) ? $v[2] : ''; // Класс
            $route['method'] = !empty($v[3]) ? $v[3] : ''; // Метод класса
            $route['menu'] = !empty($v[4]) ? $v[4] : ''; // Пункт в меню приложения
            $route['icon'] = !empty($v[5]) ? $v[5] : ''; // Иконка
            $route['title'] = !empty($v[6]) ? $v[6] : ''; // Заголовок страницы
            $this->routes[$i] = $route;
        }
        // Поиск маршрута
        foreach ($this->routes as $route) {
            // Функция str_replace() здесь нужна для экранирования всех прямых слешей,
            // так как они используются в качестве маркеров регулярного выражения
            $route['pattern'] = '/^' . str_replace('/', '\/', $route['pattern']) . '$/';
            // Сравнение через регулярное выражение
            if (
                ( $route['type'] == '*' || $route['type'] == $_SERVER['REQUEST_METHOD'] )
                &&
                preg_match($route['pattern'], $url, $params)
            ) {
                // Соответствие найдено
                $this->route = $route;
                // Удаляется первый элемент из массива $params, который содержит всю найденную строку
                array_shift($params);
                // Параметры маршрута
                $this->route['params'] = $params;
                // Test !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // Право доступа маршрута
                $this->route['permission'] = 2;
                return;
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // SELECT, INSERT, UPDATE, DELETE
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // SELECT
    // $rows = $app->query($sql, $params);
    // $rows = $app->query("SELECT * FROM users");
    // $rows = $app->query("SELECT * FROM users WHERE group_id = ?", [$group_id]);
    // INSERT
    // $lastInsertId = $app->query($sql, $params);
    // UPDATE
    // $rowCount = $app->query($sql, $params);
    // DELETE
    // $rowCount = $app->query($sql, $params);
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function query($sql='', $params=[]) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        switch ( substr(strtoupper(trim($sql)), 0, 6) ) {
            case 'SELECT' :
                $rows = $stmt->fetchAll();
                return $rows;
            case 'INSERT' :
                $lastInsertId = $this->pdo->lastInsertId();
                return $lastInsertId;
            case 'UPDATE' :
                $rowCount = $stmt->rowCount();
                return $rowCount;
            case 'DELETE' :
                $rowCount = $stmt->rowCount();
                return $rowCount;
            default :
                break;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Точка выхода из API
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public function response($status = 500, $data = null) {
        // header() обязана вызываться до отправки любого вывода
        header("Content-type: text/html; charset=utf-8");
        http_response_code($status);
        exit(json_encode($data, JSON_UNESCAPED_UNICODE));
    }

} /* class */

//**************************************************************************************************
