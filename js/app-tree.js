
//**************************************************************************************************
// appTree
//**************************************************************************************************

class appTree {

	// id HTML-элемента дерева
	elmTreeID = 'tree-id';
	// Надпись корневой ветви дерева
	caption = 'Дерево';
	// restAPI
	restAPI = '/api/<...>';
	// Проверка возможности удаления
	deleteCheck = true;
	// Показ кол-ва вложенных веток
	childsCountShow = false;
	// ID выделенной записи
	rowSelected = 0;
	// Фильтры
	filter = {
		data: {},
	};

	constructor(elmTreeID, caption) {
		this.elmTreeID = elmTreeID;
		this.caption = caption;
	}

	// id для HTML-элемента
	nominator(suffix, id) {
		return 'app-' + this.elmTreeID + '-' + suffix + '-' + id;
	}

	// Показать Tree
	show() {
		// Дерево
		var elmTree = document.getElementById(this.elmTreeID);
		Object.assign(elmTree.style, {
			overflowY: 'scroll',
		});

		// Создание корневого <ul>
		let elm = document.createElement('ul');
		elm.id = this.nominator('ul', 'root');
		Object.assign(elm.style, {
			boxSizing: 'border-box',
			listStyleType: 'none',
			paddingLeft: '8px',
			paddingTop: '5px',
			paddingBottom: '5px',
			margin: '0',
		});
		elmTree.appendChild(elm);

		// Создание корневой ветви
		this.branchCreate({'pid': 'root', 'id': 0, 'name': this.caption, 'level': 0, 'childs': '*'});
		// Загрузка ветвей
		this.branchesShowHide(0);
	}

	// Показ/скрытие подчинённых ветвей
	branchesShowHide(pid) {
		// По иконке определяется показ/скрытие
		var elmI = document.getElementById(this.nominator('i', pid));
		if ( elmI.classList.contains('fa-chevron-right') ) {
			// Замена иконки
			elmI.classList.add('fa-chevron-down');
			elmI.classList.remove('fa-chevron-right');
			// Создание подчинённых ветвей
			this.branchesCreate(pid);
		}
		else if ( elmI.classList.contains('fa-chevron-down') ) {
			// Замена иконки
			elmI.classList.add('fa-chevron-right');
			elmI.classList.remove('fa-chevron-down');
			// Удаление подчинённых ветвей
			document.getElementById(this.nominator('ul', pid)).innerHTML = '';
		}
	}

	// Создание подчинённых ветвей
	branchesCreate(pid) {
		// Удаление подчинённых ветвей перед созданием
		document.getElementById(this.nominator('ul', pid)).innerHTML = '';
		//
		fog.show();
		var url = this.restAPI;
		url += '?pid=' + pid;
        for (var k in this.filter.data) {
            var value = this.filter.data[k];
            if (value) {
                url += '&' + k + '=' + encodeURIComponent(value);
            }
        }
		axios.get(url).then(response => {
			fog.hide();
			// Кастомная обработка загруженных данных
			var responseData = this.branchesCreateCustomData(pid, response.data);
			// Создание подчинённых ветвей
			var rows = responseData.rows;
			//console.log(rows);
			for (var j in rows) {
				var row = rows[j];
				this.branchCreate(row);
			}
			if ( this.childsCountShow ) {
				// Перерисовка кол-ва подчинённых ветвей у родительской ветви
				var elmDiv = document.getElementById(this.nominator('div', pid));
				elmDiv.getElementsByTagName('label')[0].innerHTML = rows.length;
			}
			// Выделение записи в TREE, если была выделена
			if (this.rowSelected) {
				this.branchSelect(this.rowSelected);
			}
			// Кастомная финальная обработка ветвей
			this.branchesCreateCustomFinal(pid, responseData);
		});
	}

	// Кастомная обработка загруженных данных
	branchesCreateCustomData(pid, responseData) {
		return responseData;
	}

	// Кастомная финальная обработка ветвей
	branchesCreateCustomFinal(pid, responseData) {
	}

	// Создание 1 ветви
	branchCreate(row) {
		//console.log(row);
		// Создание <li>
		var elm = document.createElement('li');
		elm.id = this.nominator('li', row.id);
		Object.assign(elm.style, {
			boxSizing: 'border-box',
			cursor: 'pointer',
			whiteSpace: 'nowrap',
			//paddingTop: '2px',
    		//paddingBottom: '2px',
		});
		document.getElementById(this.nominator('ul', row.pid)).appendChild(elm);
		var elmLI = elm;

		// Создание иконки <i> (уголок)
		var elm = document.createElement('i');
		elm.id = this.nominator('i', row.id);
		if ( row.childs ) {
			elm.classList.add('fas', 'fa-chevron-right');
		}
		Object.assign(elm.style, {
			boxSizing: 'border-box',
			display: 'inline-block',
			width: '22px',
			paddingLeft: '7px',
		});
		elm.addEventListener("click", () => this.branchesShowHide(row.id));
		elmLI.appendChild(elm);
		
		// Создание надписи <div>
		var elm = document.createElement('div');
		elm.id = this.nominator('div', row.id);
		elm.innerHTML = '<i class="far fa-folder" style="width: 22px; padding-right: 5px; color: ' + this.bindColor(row) + ';" id="' + this.nominator('folder', row.id) + '"></i>';
		elm.innerHTML += '<span style="display: inline-block; padding-right: 5px; padding-top: 4px; padding-bottom: 4px; overflow-x: clip;" id="' + this.nominator('span', row.id) + '">' + row.name + '</span>';
		// Тег для 'childs' нужен для перерисовки кол-ва подчинённых ветвей у родительской ветви
		if ( this.childsCountShow ) {
			elm.innerHTML += '<label style="padding: 4px; color: LightGrey;" id="' + this.nominator('label', row.id) + '">' + row.childs + '</label>';
		}
		Object.assign(elm.style, {
			boxSizing: 'border-box',
			display: 'inline-block',
			paddingLeft: '5px',
			paddingRight: '5px',
		});
		elm.addEventListener("click", () => this.branchSelect(row.id)); // Выделение ветви
		elm.addEventListener("click", () => this.branchOnClick(row.id)); // Кастомное событие в экземпляре класса
 		// Drag and Drop
 		elm.addEventListener("dragover", (event) => {
			event.preventDefault();
		});
 		elm.addEventListener("dragenter", (event) => {
			// Unset hover dropable
			var elmTree = document.getElementById(this.elmTreeID);
			var arrDiv = elmTree.getElementsByTagName('div');
			for (let i=0; i<arrDiv.length; i++) {
				var elmDiv = arrDiv[i];
				elmDiv.style.border = '2px solid transparent';
			}
			// event.target.id - может быть любым вложенным в ветвь елементом!!!
			var branchID = event.target.id.split('-').pop();
			var elmDiv = document.getElementById( this.nominator('div', branchID) );
			elmDiv.style.border = "2px solid blue";
		});
 		elm.addEventListener("dragleave", (event) => {
			// event.target.id - может быть любым вложенным в ветвь елементом!!!
			var branchID = event.target.id.split('-').pop();
			var elmDiv = document.getElementById( this.nominator('div', branchID) );
	        // Get the location on screen of the element
			var rect = elmDiv.getBoundingClientRect();
			var x = event.clientX;     // Get the horizontal mouse coordinate
			var y = event.clientY;     // Get the vertical mouse coordinate
			// Check the mouseEvent coordinates are outside of the rectangle
			if ( x > rect.left + rect.width || x < rect.left || y > rect.top + rect.height || y < rect.top ) {
				// Unset hover dropable
				elmDiv.style.border = '2px solid transparent';
			}
		});
		elm.addEventListener("drop", (event) => {
			event.preventDefault();
			// Unset hover dropable
			var elmTree = document.getElementById(this.elmTreeID);
			var arrDiv = elmTree.getElementsByTagName('div');
			for (let i=0; i<arrDiv.length; i++) {
				var elmDiv = arrDiv[i];
				elmDiv.style.border = '2px solid transparent';
			}
			//
			this.branchOnDrop(event);
		});
		//
		elmLI.appendChild(elm);

		// Создание вложенного <ul>
		var elm = document.createElement('ul');
		elm.id = this.nominator('ul', row.id);
		Object.assign(elm.style, {
			boxSizing: 'border-box',
			listStyleType: 'none',
			paddingLeft: '0',
			marginLeft: '22px',
			marginBottom: '0px',
		});
		elmLI.appendChild(elm);

		this.branchCreateCustom(row);
	}

	// Цвет
	bindColor(row) {
		switch (row.level) {
			case 0 : return 'Black';
			case 1 : return 'DeepPink';
			case 2 : return 'Gold';
			case 3 : return 'ForestGreen';
			case 4 : return 'RoyalBlue';
			case 5 : return 'RebeccaPurple';
			case 6 : return 'Purple';
			case 7 : return 'Coral';
			default : return 'Black';
		}
	}

	// Кастомная дорисовка ветви
	branchCreateCustom(row) {
	}

	// Выделение ветви
	branchSelect(id) {
		this.rowSelected = id;
		// Снятие выделения
		var elmTree = document.getElementById(this.elmTreeID);
		var arrDiv = elmTree.getElementsByTagName('div');
		for (let i=0; i<arrDiv.length; i++) {
			var elmDiv = arrDiv[i];
			elmDiv.style.color = 'Black';
			elmDiv.style.backgroundColor = 'White';
			elmFolder = elmDiv.getElementsByTagName('i')[0];
			elmFolder.classList.remove('fas');
			elmFolder.classList.add('far');
		}
		// Выделение
		var elmDiv = document.getElementById(this.nominator('div', id));
		if (elmDiv) {
			elmDiv.style.color = 'MediumBlue';
			elmDiv.style.backgroundColor = 'LightYellow';
			var elmFolder = document.getElementById(this.nominator('folder', id));
			elmFolder.classList.remove('far');
			elmFolder.classList.add('fas');
		}
	}

	// Кастомное событие 'onclick' в экземпляре класса
	branchOnClick(id) {
		console.log(id);
	}
	
	// Кастомное событие 'ondrop' в экземпляре класса
	branchOnDrop(event) {
		console.log(event);
	}
	
    // Проверка возможности удаления
    branchDel() {
        if ( this.rowSelected == 0 ) {
            var aBox = new appBox();
            aBox.picture = 'Info';
            aBox.message = 'Выберите запись для удаления';
            aBox.buttons = ['OK'];
            aBox.show();
            return;
        }
        //console.log(this.deleteCheck);
        if ( this.deleteCheck ) {
            // Проверка возможности удаления
            fog.show();
            var url = this.restAPI + '/check/' + this.rowSelected;
            axios.get(url).then(response => {
                console.log(response);
                fog.hide();
                if (response.data.trim() == '') {
                    this.branchDelConfirm();
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
            this.branchDelConfirm();
        }
    }

    // Подтверждение удаления
    branchDelConfirm() {
		var tree = this; // tree <=> this
        var aBox = new appBox();
        aBox.picture = 'Trash';
        aBox.message = '<big>Удалить запись?</big><br><small>Это действие необратимо.</small>';
        aBox.buttons = ['Trash', 'Cancel'];
        aBox.buttonClick = function(name) {
            if (name == 'Trash') {
                tree.branchDeleting(); // tree <=> this
            }
        }
        aBox.show();
        // Customization (after .show())
        aBox.elms.picture.style.color = 'Grey';
        aBox.elms.buttons.Trash.innerHTML = 'Удалить';
        aBox.elms.buttons.Cancel.innerHTML = 'Отмена';
    }

    // Удаление
    branchDeleting() {
		fog.show();
		var url = this.restAPI + '/' + this.rowSelected;
		axios.delete(url).then(response => {
			console.log(response);
			// ID из БД родительской записи для выделенной записи
			var elmLi = document.getElementById(this.nominator('li', this.rowSelected));
			var pidHTML = elmLi.parentNode.id; // <ul> id
			console.log(pidHTML); // app-tree-sources-ul-9
			var pid = pidHTML.split('-').pop();
			// Обновление TREE
			this.branchesCreate(pid);
			// Снятие выделения записи в TREE
			this.rowSelected = 0;
			fog.hide();
		});
    }

	// Удаление всех ветвей дерева
	clear() {
		// Дерево
		var elmTree = document.getElementById(this.elmTreeID);
		// Очистка
		elmTree.innerHTML = '';
	}

} // class appTree

//**************************************************************************************************

////////////////////////////////////////////////////////////////////////////////////////////////////
// Drag and Drop
////////////////////////////////////////////////////////////////////////////////////////////////////

// What to Drag - 'ondragstart' and setData()
// First of all: To make an element draggable, set the draggable attribute to true.
// Specify what should happen when the element is dragged.
// The 'ondragstart' attribute calls a function, onDragStart(event),
// that specifies what data to be dragged.
// The data type is 'text' and the value is the id of the <tr>

// См. 'Drag and Drop' в app-tree.js
// Where to Drop - 'ondragover'
// The 'ondragover' event specifies where the dragged data can be dropped.
// By default, data/elements cannot be dropped in other elements.
// To allow a drop, we must prevent the default handling of the element.
// This is done by calling the event.preventDefault() method for the 'ondragover' event of <li>

// См. 'Drag and Drop' в app-tree.js
// Do the Drop - 'ondrop' and getData()
// When the dragged data is dropped, a drop event occurs.
// The 'ondrop' attribute calls a function, drop(event).
// Code explained:
// Call preventDefault() to prevent the browser default handling of the data (default is open as link on drop).
// Get the dragged data with the dataTransfer.getData() method.
// This method will return any data that was set to the same type in the setData() method.

//**************************************************************************************************
