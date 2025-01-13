<?php
//**************************************************************************************************

class Settings
{
    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Настройки
    // http://leadovsky-agency-brain/settings
    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function settings() {
        global $app;

        $app->content = 'settings_content';
        require('php/app_template.php');
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function index() {
        global $app;

        $where = [];
        $params = [];
        if ( !empty($_REQUEST['filter']) ) {
            $where[] = "(
                settings.name LIKE ?
                OR settings.key LIKE ?
                OR settings.value LIKE ?
                OR settings.note LIKE ?
            )";
            $f = '%' . $_REQUEST['filter'] . '%';
            array_push($params, $f, $f, $f, $f);
        }
        if ( !empty($_REQUEST['name']) ) {
            $where[] = 'settings.name LIKE ?';
            $params[] = '%' . $_REQUEST['name'] . '%';
        }
        if ( !empty($_REQUEST['in_use']) ) {
            $where[] = 'settings.in_use = ?';
            $params[] = $_REQUEST['in_use'];
        }
        // WHERE
        if ( !empty($where) ) {
            $where = implode(' AND ', $where);
        }
        else {
            $where = 'true';
        }

        $sql = "
            SELECT *
            FROM settings
            WHERE {$where}
        ";
        $rows = $app->query($sql, $params);

        $app->response(200, [
            'rows' => $rows,
        ]);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function get($id) {
        global $app;

        $row = $app->select('settings', $id);

        $app->response(200, $row);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function post() {
        global $app;

        $input = file_get_contents('php://input');
        $params = json_decode($input, true);
        $lastInsertId = $app->insert('settings', $params);

        $app->response(200, ['id' => $lastInsertId]);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function put($id) {
        global $app;

        $input = file_get_contents('php://input');
        $params = json_decode($input, true);
        unset($params['_method']);
        $rowCount = $app->update('settings', $params, $id);

        $app->response(200, ['rowCount' => $rowCount]);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    public static function delete($id) {
        global $app;

        $rowCount = $app->delete('settings', $id);

        $app->response(200, ['rowCount' => $rowCount]);
    }

}  /* class */

//**************************************************************************************************
