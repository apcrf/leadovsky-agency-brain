
var vueCrudFormData = {
    page: {
        // { "icon":"", "name":"", "view":"", "permissions":{}, "permission":0 }
    },
    refs: {
    },
    crud: {
        restAPI: null, // '/api/<...>'
        funcRowsLoad: 'rowsLoad', // Функция загрузки строк
        rowsLoadTimeout: 60000, // Timeout времени выполнения AJAX-запроса
        rowsLoadIntervalID: null, // ID интервала попыток загрузки строк
        deleteCheck: true, // Проверка возможности удаления
        rows: [],
        rowSelected: 0, // ID выделенной записи
        rowData: [], // Данные выделенной записи
        markAll: 0, // Отметка всех записей (в заголовке таблицы)
        paginator: {
            page: 1, // Выбранная для загрузки страница
            per_page: 100, // Записей на странице
            current_page: 1, // Текущая страница
            last_page: 0, // Последняя страница
            total: 0, // Записей всего
            pages: [], // Список страниц
            per_pages: [20,50,100,500,1000],
        },
        sort: {
            by: '<table>.name',
            dir: 'ASC',
        },
        filter: {
            data: {},
            show: false,
            tabActive: 'Main',
            tabs: {
                Main: { caption: 'Главная' },
            },
            refresh: false,
        },
    },
    form: {
        data: {},
        dataInit: { id: 0 },
        show: false,
        tabActive: 'Main',
        tabs: {
            Main: { caption: 'Главная', fields: ['name'], saveAndClose: false },
            Note: { caption: 'Примечание', fields: ['note'], saveAndClose: false },
        },
        changed: {},
        error: '',
        parentRowsLoad: true, // Обновление родительского списка в formClose()
    },
    xxxx: {
        firstLoad: true, // Флаг первоначальной загрузки страницы
    },
};

var vueCrudFormMethods = {

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Будет вызван после монтирования экземпляра
    ////////////////////////////////////////////////////////////////////////////////////////////

    mounted() {
        // Инициализация фильтра по датам
        this.filterPeriodDates(this.crud);
        // Модальные формы имеют класс `d-none` для скрытия артефактов до запуска Vue.js
        var elms = document.getElementsByClassName('modal');
        Array.from(elms).forEach((elm) => {
            elm.classList.remove("d-none");
        });
        // Параметры фильтра из URL
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
            if (value) {
                this.crud.filter.data[key] = value;
            }
        });
        // Зарузка rows
        if ( this.crud.restAPI !== null ) {
            this.rowsLoad();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Зарузка rows
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowsLoad() {
        fog.show();
        this.rowsLoadInterval();
        this.crud.rowsLoadIntervalID = setInterval(() => {
            this.rowsLoadInterval();
        }, this.crud.rowsLoadTimeout * 1.2);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Попытки получения данных от сервера
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowsLoadInterval() {
        var crud = this.crud;
        var pg = crud.paginator;
        var url = crud.restAPI;
        url += '?page=' + pg.page;
        url += '&per_page=' + pg.per_page;
        url += '&sort_by=' + crud.sort.by;
        url += '&sort_dir=' + crud.sort.dir;
        for (var k in crud.filter.data) {
            var value = crud.filter.data[k];
            if (value) {
                url += '&' + k + '=' + encodeURIComponent(value);
            }
        }
        axios({
            method: 'get',
            url: url,
            timeout: this.crud.rowsLoadTimeout,
        }).then(response => {
            clearInterval(this.crud.rowsLoadIntervalID);
            this.rowsLoading(response);
            fog.hide();
        }).catch(error => {
            var message = 'Ошибка сервера: ';
            if (error.code === 'ECONNABORTED') {
                message += ' ' + 'Таймаут AJAX-запроса.';
            }
            else {
                message += ' ' + error.message + '.';
            }
            fog.message(message + ' ' + 'Выполняется повторная попытка загрузки данных...');
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Обработка полученных данных
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowsLoading(response) {
        var rd = response.data;
        var crud = this.crud;
        var pg = crud.paginator;
        if (rd.data) {
            // DB->paginate()
            //console.log(rd.data);
            crud.rows = rd.data;
            for (var j in crud.rows) {
                // Метки могут быть заданы и на стороне API
                if (!crud.rows[j].mark) {
                    crud.rows[j].mark = "0";
                }
            }
            pg.page = rd.current_page;
            pg.per_page = rd.per_page;
            pg.current_page = rd.current_page;
            pg.last_page = rd.last_page;
            pg.total = rd.total;
            pg.pages = [];
            for (var i = 0; i < rd.last_page; i++) {
                pg.pages.push(i + 1);
            }
        }
        else {
            // DB->get()->toArray()
            for (var j in rd) {
                crud[j] = rd[j];
            }
        }
        this.rowsLoaded(crud, response.data);
        // Показ 2-го этажа, если передан параметр фильтра `id` и запись найдена
        if (this.xxxx.firstLoad && crud.filter.data.id && crud.rows[0]) {
            //console.log(crud.filter.data.id);
            this.rowSelectedClick(crud, crud.rows[0], 'id');
            this.formEdit(crud, this.form, 'edit');
        }
        this.xxxx.firstLoad = false; // Сброс флага
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Обработка данных после загрузки
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowsLoaded(crud, responseData) {
        // Do something
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Экспорт в Excel
    ////////////////////////////////////////////////////////////////////////////////////////////

    exportToExcel() {
        fog.show();
        var crud = this.crud;
        var url = crud.restAPI + '/export/excel';
        url += '?sort_by=' + crud.sort.by;
        url += '&sort_dir=' + crud.sort.dir;
        for (var k in crud.filter.data) {
            var value = crud.filter.data[k];
            if (value) {
                url += '&' + k + '=' + encodeURIComponent(value);
            }
        }
        window.open(url, "_self");
        fog.hide();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Экспорт в буфер обмена
    ////////////////////////////////////////////////////////////////////////////////////////////

    exportToClipboard() {
        fog.show();
        var crud = this.crud;
        var url = crud.restAPI + '/export/clipboard';
        url += '?sort_by=' + crud.sort.by;
        url += '&sort_dir=' + crud.sort.dir;
        for (var k in crud.filter.data) {
            var value = crud.filter.data[k];
            if (value) {
                url += '&' + k + '=' + encodeURIComponent(value);
            }
        }
        axios.get(url).then(response => {
            var rd = response.data;
            //console.log(rd);
            copyToClipboard(rd);
            fog.hide();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Экспорт в CSV
    ////////////////////////////////////////////////////////////////////////////////////////////

    exportToCSV() {
        fog.show();
        var crud = this.crud;
        var url = crud.restAPI + '/export/csv';
        url += '?sort_by=' + crud.sort.by;
        url += '&sort_dir=' + crud.sort.dir;
        for (var k in crud.filter.data) {
            var value = crud.filter.data[k];
            if (value) {
                url += '&' + k + '=' + encodeURIComponent(value);
            }
        }
        window.open(url, "_self");
        fog.hide();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Выделение записи - Style
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowSelectedStyle(crud, row, fieldName) {
        if ( row[fieldName] == crud.rowSelected ) {
            //return {'background-color': 'LightYellow'};
            return {'--bs-table-bg': 'LightYellow'};
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Выделение записи - Click
    ////////////////////////////////////////////////////////////////////////////////////////////

    rowSelectedClick(crud, row, fieldName) {
        // Выделение для списков из объектов
        if (crud && row && fieldName) {
            crud.rowSelected = row[fieldName];
            crud.rowData = row;
        }
        // Снятие выделения
        else if (crud) {
            crud.rowSelected = 0;
            crud.rowData = [];
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Количество отмеченных записей
    ////////////////////////////////////////////////////////////////////////////////////////////

    marksCount(crud) {
        var count = 0;
        for (var j in crud.rows) {
            if (crud.rows[j].mark == 1) {
                count++;
            }
        }
        return count;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Отметить все записи на странице - Change
    ////////////////////////////////////////////////////////////////////////////////////////////

    markAllChange(crud) {
        for (var j in crud.rows) {
            crud.rows[j].mark = crud.markAll;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Сортировка - Style
    ////////////////////////////////////////////////////////////////////////////////////////////

    sortStyle(crud, fieldName) {
        if ( crud.sort.by == fieldName ) {
            if ( crud.sort.dir == 'ASC' ) {
                return {'background': 'linear-gradient(rgb(230, 241, 255), rgb(160, 200, 245))'};
            }
            else {
                return {'background': 'linear-gradient(rgb(160, 200, 245), rgb(230, 241, 255))'};
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Сортировка - Click
    ////////////////////////////////////////////////////////////////////////////////////////////

    sortClick(crud, fieldName) {
        if ( crud.sort.by == fieldName ) {
            // ASC <-> DESC
            if (crud.sort.dir == 'ASC') { crud.sort.dir = 'DESC'; }
            else { crud.sort.dir = 'ASC'; }
        }
        else {
            // ORDER BY
            crud.sort.by = fieldName;
            crud.sort.dir = 'ASC';
        }
        // Обновление списка
        this[crud.funcRowsLoad]();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Пагинация
    ////////////////////////////////////////////////////////////////////////////////////////////

    paginate(crud, mode) {
        var pg = crud.paginator;
        switch (mode) {
            case 'first' : pg.page = 1; break;
            case 'prev' : pg.page > 1 ? pg.page-- : pg.page = 1; break;
            case 'next' : pg.page < pg.last_page ? pg.page++ : pg.page = pg.last_page; break;
            case 'last' : pg.page = pg.last_page; break;
            case 'per_page' : pg.page = 1; break;
            default : break;
        }
        // Обновление списка
        this[crud.funcRowsLoad]();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Фильтр - Показать
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterShow(crud) {
        crud.filter.show = true;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Фильтр - Выделение поля
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterStyle(crud, fieldName) {
        if ( crud.filter.data[fieldName] !== undefined && crud.filter.data[fieldName] !== '' ) {
            return {'background-color': 'Moccasin'};
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Фильтр - Очистка поля
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterClear(crud, fieldName1, fieldName2) {
        crud.filter.data[fieldName1] = undefined;
        crud.filter.data[fieldName2] = undefined;
        crud.filter.refresh = true;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Фильтр - Установка значения `Все` в поле  <select> при необходимости
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterSelectChange(crud, fieldName) {
        crud.filter.refresh = true;
        // 'undefined' -> undefined
        if ( crud.filter.data[fieldName] == 'undefined' ) {
            crud.filter.data[fieldName] = undefined;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Фильтр - Фильтровать
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterSet(crud) {
        this.rowSelectedClick(crud);
        crud.paginator.page = 1;
        crud.filter.show = false;
        crud.filter.refresh = false;
        // Обновление списка
        this[crud.funcRowsLoad]();
        // Изменение адресной строки
        this.pushState();
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Добавление / Правка / Просмотр
    ////////////////////////////////////////////////////////////////////////////////////////////

    formEdit(crud, form, mode) {
        // CleanUp
        form.data = {};
        form.tabActive = 'Main';
        form.changed = {};
        form.error = '';
        // Добавление или Правка / Просмотр
        switch (mode) {
            case 'add' :
                this.formInit(crud, form);
                this.formShow(crud, form);
                break;
            case 'edit' :
            case 'view' :
                if ( crud.rowSelected != 0 ) {
                    fog.show();
                    var url = crud.restAPI;
                    url += '/' + crud.rowSelected;
                    axios.get(url).then(response => {
                        form.data = response.data;
                        this.formShow(crud, form);
                        fog.hide();
                    });
                }
                else {
                    var aBox = new appBox();
                    aBox.picture = 'Info';
                    switch (mode) {
                        case 'edit' :
                            aBox.message = 'Выберите запись для правки';
                            break;
                        case 'view' :
                            aBox.message = 'Выберите запись для просмотра';
                            break;
                    }            
                    aBox.buttons = ['OK'];
                    aBox.show();
                    return;
                }
                break;
        }
        //console.log('form.data:');
        //console.log(form.data);
        form.show = true;
    },
   
    ////////////////////////////////////////////////////////////////////////////////////////////
    // Инициализация данных при добавлении
    ////////////////////////////////////////////////////////////////////////////////////////////

    formInit(crud, form) {
        form.data = JSON.parse(JSON.stringify(form.dataInit));
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Кастомный метод при открытии формы
    ////////////////////////////////////////////////////////////////////////////////////////////

    formShow(crud, form) {
        // Do something
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Сохранение добавления / правки
    ////////////////////////////////////////////////////////////////////////////////////////////

    formSave(crud, form, tab) {
        form.error = '';
        var fd = form.data;
        var url = crud.restAPI;
        // Поля на вкладке для сохранения
        var data = {};
        for (var j in form.tabs[tab].fields) {
            var f = form.tabs[tab].fields[j];
            data[f] = fd[f];
        }
        // Добавление или Правка
        switch (fd.id) {
            case 0 :
                break;
            default :
                data['_method'] = 'PUT';
                url += '/' + fd.id;
                break;
        }
        // Сохранение
        axios({
            method: 'post', url: url, data: data
        }).then(response => {
            // Скрытие кнопки Сохранить
            form.changed[tab] = false;
            // Прорисовка данных
            this.formApply(crud, form, response);
            // Обновление списка
            this[crud.funcRowsLoad]();
            // Выделение записи в CRUD
            this.rowSelectedClick(crud, fd, 'id');
            // Сохранить и Закрыть
            if ( form.tabs[tab].saveAndClose ) {
                this.formClose(crud, form);
            }
        }).catch(error => {
            form.error = error.response.data.message;
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Прорисовка данных после сохранения
    ////////////////////////////////////////////////////////////////////////////////////////////

    formApply(crud, form, response) {
        // ID для новой записи
        if ( form.data.id == 0 ) {
            form.data.id = response.data.id;
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Показ кнопки Сохранить при изменении данных в поле на текущей вкладке
    ////////////////////////////////////////////////////////////////////////////////////////////

    tabChanged(form, fieldName) {
        // Поиск поля на вкладках
        for ( var j in form.tabs ) {
            if ( form.tabs[j].fields.indexOf(fieldName) > -1 ) {
                form.changed[j] = true;
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Проверка возможности удаления
    ////////////////////////////////////////////////////////////////////////////////////////////

    formDel(crud) {
        if ( crud.rowSelected == 0 ) {
            var aBox = new appBox();
            aBox.picture = 'Info';
            aBox.message = 'Выберите запись для удаления';
            aBox.buttons = ['OK'];
            aBox.show();
            return;
        }
        //console.log(crud.deleteCheck);
        if ( crud.deleteCheck ) {
            // Проверка возможности удаления
            fog.show();
            var url = crud.restAPI + '/check/' + crud.rowSelected;
            axios.get(url).then(response => {
                console.log(response);
                fog.hide();
                if (response.data.trim() == '') {
                    this.formDelConfirm(crud);
                }
                else {
                    var aBox = new appBox();
                    aBox.picture = "Info";
                    aBox.message = response.data;
                    aBox.buttons = ['OK'];
                    aBox.show();
                }
            });
        }
        else {
            // Не требуется проверка возможности удаления
            this.formDelConfirm(crud);
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Подтверждение удаления
    ////////////////////////////////////////////////////////////////////////////////////////////

    formDelConfirm(crud) {
        var aBox = new appBox();
        aBox.picture = 'Trash';
        aBox.message = '<big>Удалить запись?</big><br><small>Это действие необратимо.</small>';
        aBox.buttons = ['Trash', 'Cancel'];
        aBox.buttonClick = function(name) {
            if (name == 'Trash') {
                app.formDeleting(crud); // app <=> this
            }
        }
        aBox.show();
        // Customization (after .show())
        aBox.elms.picture.style.color = 'Grey';
        aBox.elms.buttons.Trash.innerHTML = 'Удалить';
        aBox.elms.buttons.Cancel.innerHTML = 'Отмена';
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Удаление
    ////////////////////////////////////////////////////////////////////////////////////////////

    formDeleting(crud) {
        fog.show();
        var url = crud.restAPI + '/' + crud.rowSelected;
        axios.delete(url).then(response => {
            console.log(response);
            // Обновление списка
            this[crud.funcRowsLoad]();
            // Снятие выделения записи в CRUD
            crud.rowSelected = 0;
            fog.hide();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Закрытие формы этажа с проверкой на изменения
    ////////////////////////////////////////////////////////////////////////////////////////////

    formClose(crud, form) {
        var flag = false;
        for ( var j in form.changed ) {
            if ( form.changed[j] ) {
                flag = true;
                break;
            }
        }
        if ( flag ) {
            var aBox = new appBox();
            aBox.picture = 'Question';
            aBox.message = 'Данные были изменены.<br>Закрыть без сохранения?';
            aBox.buttons = ['Yes', 'No'];
            aBox.buttonClick = function (name) {
                if (name == 'Yes') {
                    form.show = false;
                    // Очистка списков на форме
                    app.formRowsClear(form); // this
                    // Обновление родительского списка
                    if ( form.parentRowsLoad ) {
                        app[crud.funcRowsLoad](); // this
                    }
                }
            }
            aBox.show();
            aBox.elms.buttons.Yes.innerHTML = 'Да';
            aBox.elms.buttons.No.innerHTML = 'Нет';
        }
        else {
            form.show = false;
            // Очистка списков на форме
            this.formRowsClear(form);
            // Обновление родительского списка
            if ( form.parentRowsLoad ) {
                this[crud.funcRowsLoad]();
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Очистка списков на форме
    ////////////////////////////////////////////////////////////////////////////////////////////

    formRowsClear(form) {
        var keys = Object.keys(form);
        for (var j in keys) {
            var key = keys[j];
            // Если имя свойства начинается с 'crud', то:
            // - очищается его массив 'rows'
            // - очищается его 'paginator'
            if ( key.substring(0, 4) == 'crud' ) {
                if ( Object.keys(form[key]).includes('rows') ) {
                    form[key].rows = [];
                }
                if ( Object.keys(form[key]).includes('paginator') ) {
                    form[key].paginator.page = 1; // Выбранная для загрузки страница
                    form[key].paginator.current_page = 1; // Текущая страница
                    form[key].paginator.last_page = 0; // Последняя страница
                    form[key].paginator.total = 0; // Записей всего
                    form[key].paginator.pages = []; // Список страниц
                }
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Изменение адресной строки и Добавление нового элемента в историю браузера
    ////////////////////////////////////////////////////////////////////////////////////////////

    pushState() {
        var crud = this.crud; // эта функция работает только для 1-го этажа
        var params = [];
        // Параметры фильтра
        for (var k in crud.filter.data) {
            var value = crud.filter.data[k];
            if (value) {
                params.push(k + '=' + encodeURIComponent(value));
            }
        }
        // Изменение адресной строки
        var url = window.location.pathname;
        if ( params.length > 0 ) {
            url += '?' + params.join('&');
        }
        history.pushState(null, null, url);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Открыть ссылку в новой вкладке
    ////////////////////////////////////////////////////////////////////////////////////////////

    linkOnClick(url) {
	    if ( !url || url.trim().length == 0 ) return;
	    window.open(url, "_blank");
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Method Call
    ////////////////////////////////////////////////////////////////////////////////////////////

    methodCall(methodName) {
        if (methodName) {
            this[methodName]();
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Обработчик нажатия клавиш
    ////////////////////////////////////////////////////////////////////////////////////////////

    onKeyDown(KeyboardEvent) {
        if ( KeyboardEvent.code == "Escape" ) {
            // 4-е этажи - Форма
            // Перебор форм 3-го этажа
            for (var key3 in this.form) {
                // formName 3-го этажа
                if (key3.substring(0, 4) == 'form') {
                    // Перебор форм 4-го этажа
                    for (var key4 in this.form[key3]) {
                        // formName 4-го этажа
                        if (key4.substring(0, 4) == 'form') {
                            if (this.form[key3][key4].show) {
                                // formName -> crudName
                                var crudName = 'crud' + key4.substring(4);
                                this.formClose(this.form[key3][crudName], this.form[key3][key4]);
                                return;
                            }
                        }
                    }
                }
            }
            // 3-е этажи - Фильтр и Форма
            for (var key in this.form) {
                // Поиск crudName или formName
                if (key.substring(0, 4) == 'crud') {
                    if (this.form[key].filter.show) {
                        this.form[key].filter.show = false;
                        return;
                    }
                }
                if (key.substring(0, 4) == 'form') {
                    if (this.form[key].show) {
                        // formName -> crudName
                        var crudName = 'crud' + key.substring(4);
                        this.formClose(this.form[crudName], this.form[key]);
                        return;
                    }
                }
            }
            // 2-е этажи - Фильтр и Форма
            if (this.crud.filter.show) {
                this.crud.filter.show = false;
                return;
            }
            if (this.form.show) {
                this.formClose(this.crud, this.form);
                return;
            }
            if (this.formAdd && this.formAdd.show) {
                this.formClose(this.crud, this.formAdd);
                return;
            }
            if (this.formTree && this.formTree.show) {
                this.formClose(this.crud, this.formTree);
                return;
            }
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Переключатель периода отчёта
    ////////////////////////////////////////////////////////////////////////////////////////////

    filterPeriodChange(crud, period) {
        crud.filter.data.period = period;
        this.filterPeriodDates(crud);
        this.filterSet(crud);
    },

    filterPeriodDates(crud) {
        if ( crud.filter.data.period ) {
            if ( crud.filter.data.period == 'dates' ) {
                // даты не изменяются
            }
            else {
                var o = filterPeriodDates(crud.filter.data.period);
                crud.filter.data.period_from = o.period_from;
                crud.filter.data.period_to = o.period_to;
            }
        }
    },

    filterPeriodStyle(crud, period) {
        if ( crud.filter.data.period == period ) {
            return {'background-color': 'Moccasin'};
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Форматирование
    ////////////////////////////////////////////////////////////////////////////////////////////

    numFormat(v, decimals) {
        if (!decimals) decimals = 0;
        // Приведение к типу 'string'
        switch (typeof(v)) {
            case 'undefined' :
                v = 0;
                break;
            case 'object' : // null
                v = 0;
                break;
            case 'number' :
                break;
            case 'string' :
                v = parseFloat(v);
                break;
            default :
                console.log(typeof(v));
                return '*';
                break;
        }
        // Округление
        v = v.toFixed(decimals);
        // Приведение к типу 'string'
        v = v.toString();
        // Добавление десятичной точки и нулей (при необходимости)
        if ( decimals && decimals > 0 && v.length > 0 ) {
            if ( v.indexOf('.') < 0 ) {
                v += '.';
            }
            var int = v.split('.')[0]; // Целая часть числа
            var dec = v.split('.')[1]; // Дробная часть числа
            dec = dec.substr(0, decimals); // Отбрасываются лишние цифры дробной части
            v = int + '.' + dec + '0'.repeat(decimals - dec.length);
        }
        // Разделение групп цифр 'separator'ом
        var separator = ' ';
        v = v.split('').reverse().join('').replace(/\d\d\d/g, '$&' + separator).split('').reverse().join('').trim();
        // Замена на ''
        if ( v == '0' ) v = '';
        if ( v == '0.00' ) v = '';
        if ( v == 'NaN' ) v = '';
        return v;
    },

    ////////////////////////////////////////////////////////////////////////////////////////////

};
