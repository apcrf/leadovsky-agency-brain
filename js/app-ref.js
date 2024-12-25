
//**************************************************************************************************
// appRef
//**************************************************************************************************

class appRef {

	// Справочник Списка элементов
	ref = [];
	// Отфильтрованный массив Списка элементов
	refFiltered = [];
	// Имя поля в Справочнике для Выбора
	fieldName = 'name';
	// Имя поля в Справочнике для Элемента списка, Поиска
	listFieldName = '';
	// Максимальная ширина списка
	listMaxWidth = 700; // px
	// Максимальная высота списка
	listMaxHeight = 280; // px (должно быть кратно 'listItemHeight')
	// Высота строки списка
	listItemHeight = 28; // px
	// Направление открытия списка
	listDropDir = 'Down'; // Down || Up
	// elements
	elms = {};
	// Div 'input-group', поле 'readonly' и кнопка '▼▲'
	nodes = {};
	// Индекс Элемента списка в массиве элементов <li> с выделенным 'background'
	currentRow = -1;
	// Значение в строке поиска (сохраняется для последующего открытия)
	searchValue = '';
	// ID кликнутой записи (сохраняется для прокрутки к ранее кликнутой записи при последующем открытии списка)
	selectedID = -1;

	constructor(ref) {
		// parameters
		if ( typeof(ref) == "object" ) this.ref = ref;
	}

	// id для HTML-элемента
	nominator(name) {
		return 'app-ref-' + name;
	}

	// Показать / Скрыть DropDown
	toggle(elm) {
		this.nodes.div = elm;
		this.nodes.input = elm.firstElementChild;
		this.nodes.button = elm.getElementsByTagName('button')[0];
		if ( this.elms.container ) {
			this.hide();
		}
		else {
			this.show();
		}
	}

	// Показать DropDown
	show() {
		// Корректировка кратности listMaxHeight (в меньшую сторону)
		this.listMaxHeight = Math.floor(this.listMaxHeight / this.listItemHeight) * this.listItemHeight;
		// Скрытие другого открытого DropDown
		var elm = document.getElementById('app-ref-container');
		if ( elm ) {
			// Имитация клика по Input'у Box'а
			elm.previousSibling.firstChild.click();
		}
		// Показ DropDown
		this.containerShow();
		this.divSearchClearShow();
		this.searchShow();
		this.clearShow();
		this.listShow();
		this.listItemsShow();
		this.clickedRowSelect();
		this.elms.search.focus();
		this.nodes.button.innerHTML = '▲';
	}

	// Скрыть DropDown
	hide() {
		this.searchValue = this.elms.search.value; // Сохранение значения в строке поиска для последующего открытия
		this.elms.container.remove();
		this.elms.container = null;
		this.nodes.button.innerHTML = '▼';
	}

	//----------------------------------------------------------------------------------------------

	// Контейнер для DropDown
	containerShow() {
		let elm = document.createElement("div");
		this.elms.container = elm;
		elm.id = this.nominator("container");
		Object.assign(elm.style, {
			boxSizing: "border-box",
			position: "absolute",
			minWidth: this.nodes.div.offsetWidth + 'px', // Минимальная ширина контейнера == input-group
			padding: "5px",
			borderRadius: "0.3rem",
			boxShadow: "0px 5px 12px Grey",
			backgroundColor: "White",
			zIndex: "1030",
		});
		if ( this.listDropDir == "Up" ) {
			elm.style.marginTop = "-" + ( this.nodes.div.clientHeight + 5 + 38 + 5 + this.listMaxHeight + 5 ) + "px";
		}
		this.nodes.div.parentNode.appendChild(elm);
	}

	// Обёртка для Строки поиска и кнопки Очистка
	divSearchClearShow() {
		let elm = document.createElement("div");
		this.elms.divSearchClear = elm;
		elm.id = this.nominator("divSearchClear");
		Object.assign(elm.style, {
			boxSizing: "border-box",
			display: "flex",
			height: "38px",
		});
		this.elms.container.appendChild(elm);
	}

	// Строка поиска
	searchShow() {
		let elm = document.createElement("input");
		this.elms.search = elm;
		elm.id = this.nominator("search");
		elm.value = this.searchValue; // Значение в строке поиска от предыдущего открытия
		Object.assign(elm.style, {
			boxSizing: "border-box",
			padding: "0.4rem 0.5rem",
			border: "1px solid LightGrey",
			borderRight: "none",
			borderTopLeftRadius: "0.3rem",
			borderBottomLeftRadius: "0.3rem",
			outline: "0",
		});
		elm.setAttribute('autocomplete', 'off');
		elm.addEventListener('keydown', event => this.searchKeyDown(event));
		elm.addEventListener('input', () => this.searchInput());
		this.elms.divSearchClear.appendChild(elm);
	}

	// Строка поиска - KeyDown
	searchKeyDown(event) {
		var key = event.key;
		// Выделение Элемента списка стрелками вниз / вверх, PageDown / PageUp
		if ( ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].indexOf(key) > -1 ) {
			if ( this.elms.listItems.length ) {
				// ArrowDown
				if ( key == 'ArrowDown' && this.currentRow + 1 < this.elms.listItems.length ) {
					this.currentRow++;
				}
				// ArrowUp
				if ( key == 'ArrowUp' && this.currentRow - 1 >= 0 ) {
					this.currentRow--;
				}
				// Кол-во строк в странице
				var linesInPage = Math.round(this.listMaxHeight / this.listItemHeight) - 1;
				// PageDown
				if ( key == 'PageDown' ) {
					if ( this.currentRow + linesInPage < this.elms.listItems.length ) {
						if ( this.currentRow == -1 ) this.currentRow = 0;
						this.currentRow += linesInPage;
					}
					else {
						this.currentRow = this.elms.listItems.length - 1;
					}
				}
				// PageUp
				if ( key == 'PageUp' ) {
					if ( this.currentRow - linesInPage >= 0 ) {
						this.currentRow -= linesInPage;
					}
					else {
						this.currentRow = 0;
					}
				}
				this.paintBackground();
				this.scrollForVisibility();

			}
			event.preventDefault();
		}
		// Выбор Элемента списка клавишей Enter
		if ( ['Enter'].indexOf(key) > -1 ) {
			if ( this.currentRow > -1 ) {
				this.elms.listItems[this.currentRow].click();
			}
		}
	}

	// Строка поиска - Input
	searchInput() {
		// Список элементов
		this.listItemsShow();
	}

	// Кнопка очистки строки поиска
	clearShow() {
		let elm = document.createElement("button");
		this.elms.clear = elm;
		elm.id = this.nominator("clear");
		elm.innerHTML = '✖'; // ✖ 🔍
		Object.assign(elm.style, {
			boxSizing: "border-box",
			width: "38px",
			userSelect: "none",
			border: "1px solid LightGrey",
			borderTopRightRadius: "0.3rem",
			borderBottomRightRadius: "0.3rem",
			color: "DimGrey",
			backgroundColor: "WhiteSmoke",
			opacity: "0.85",
			cursor: "pointer",
			outline: "0",
			fontSize: "medium",
		});
		elm.addEventListener("mouseover", function() { this.style.opacity = 1; });
		elm.addEventListener("mouseout", function() { this.style.opacity = 0.85; });
		elm.addEventListener("click", () => this.clearClick());
		this.elms.divSearchClear.appendChild(elm);
	}

	// Кнопка очистки строки поиска - Click
	clearClick() {
		this.elms.search.value = '';
		this.elms.search.focus();
		// Список элементов
		this.listItemsShow();
		// Выделение 'background' и Прокрутка к ранее кликнутой записи
		this.clickedRowSelect();
	}

	// Выделение 'background' и Прокрутка к ранее кликнутой записи
	clickedRowSelect() {
		// Поиск индекса ранее кликнутой записи
		if ( this.selectedID > -1 ) {
			for (var i=0; i<this.refFiltered.length; i++) {
				if ( this.refFiltered[i].id == this.selectedID ) {
					this.currentRow = i;
					break;
				}
			}
			// Выделение 'background' ранее кликнутой записи <=> currentRow
			this.paintBackground();
			// Прокрутка к ранее кликнутой записи <=> currentRow
			// Visibility from top
			this.elms.list.scrollTop = this.currentRow * this.listItemHeight;
		}
	}

	// Список
	listShow() {
		let elm = document.createElement("ul");
		this.elms.list = elm;
		elm.id = this.nominator("list");
		Object.assign(elm.style, {
			boxSizing: "border-box",
			listStyleType: "none",
			marginTop: "5px",
			marginBottom: "0",
			maxWidth: this.listMaxWidth + "px",
			maxHeight: this.listMaxHeight + "px",
			overflowY: "scroll",
			paddingLeft: "0",
			border: "1px solid LightGrey",
			borderRadius: "0.3rem",
		});
		if ( this.listDropDir == "Up" ) {
			elm.style.minHeight = this.listMaxHeight + "px";
		}
		this.elms.container.appendChild(elm);
	}

	// Список элементов
	listItemsShow() {
		this.elms.list.innerHTML = '';
		this.elms.list.scrollTop = 0;
		this.elms.listItems = [];
		this.refFiltered = [];
		this.currentRow = -1;
		var searchValue = this.elms.search.value.trim().toLowerCase();
		for (var i=0; i<this.ref.length; i++) {
			// Имя поля для фильтрации списка
			if ( this.listFieldName == '' ) var fn = this.fieldName;
			else var fn = this.listFieldName;
			// Фильтрация списка
			if (
				this.listItemFilter(this.ref[i])
				&&
				( searchValue == '' || this.ref[i][fn].toLowerCase().indexOf(searchValue) > -1 )
			) {
				this.refFiltered.push(this.ref[i]);
				this.listItemShow(i);
			}
		}
	}

	// Фильтр списка элементов
	listItemFilter(row) {
		var condition = true;
		return condition;
	}

	// Элемент списка
	listItemShow(i) {
		let elm = document.createElement("li");
		this.elms.listItems.push(elm);
		elm.id = this.nominator("listItem-") + i;
		// Имя поля для списка
		if ( this.listFieldName == '' ) var fn = this.fieldName;
		else var fn = this.listFieldName;
		var fv = this.ref[i][fn];
		if ( fv === null ) fv = 'NULL';
		elm.innerHTML = fv.trim();
		Object.assign(elm.style, {
			boxSizing: "border-box",
			height: this.listItemHeight + "px",
			lineHeight: this.listItemHeight + "px",
			maxWidth: "100%",
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap",
			paddingLeft: "0.4rem",
			paddingRight: "0.4rem",
			cursor: "pointer",
		});
		var currentRow = this.elms.listItems.length - 1;
		elm.addEventListener("mouseover", () => {
			this.currentRow = currentRow;
			this.paintBackground();
			this.scrollForVisibility();
		});
		elm.addEventListener("click", () => {
			this.nodes.input.value = this.ref[i][this.fieldName];
			this.listItemClickWrapper(this.ref[i]);
			this.hide();
		});
		this.elms.list.appendChild(elm);
	}

	// Элемент списка - Click (обёртка для сохранения внутренних данных)
	listItemClickWrapper(row) {
		this.selectedID = row.id;
		this.listItemClick(row);
	}

	// Элемент списка - Click (функция пользователя)
	listItemClick(row) {
		console.log(row);
	}

	// Paint item's background
	paintBackground() {
		// Clear all item's backgrounds
		for (var i=0; i<this.elms.listItems.length; i++) {
			var elm = this.elms.listItems[i];
			elm.style.backgroundColor = 'White';
		}
		// Paint current item's background
		//console.log(this.currentRow);
		var elm = this.elms.listItems[this.currentRow];
		if (elm) {
			elm.style.backgroundColor = 'LightBlue';
		}
	}
	
	// Scroll for visibility
	scrollForVisibility() {
		// Visibility from top
		if ( this.elms.list.scrollTop > this.currentRow * this.listItemHeight ) {
			this.elms.list.scrollTop = this.currentRow * this.listItemHeight;
		}
		// Visibility from bottom
		if ( this.elms.list.scrollTop < (this.currentRow + 1) * this.listItemHeight - this.listMaxHeight ) {
			this.elms.list.scrollTop = (this.currentRow + 1) * this.listItemHeight - this.listMaxHeight;
		}
	}

} // class appRef

//**************************************************************************************************
// Скрытие DropDown при клике мимо
//**************************************************************************************************

document.addEventListener('click', function(event) {
	//console.log('app-ref --- document.addEventListener(click)');
    // Поиск открытого DropDown
    var elm = document.getElementById('app-ref-container');
    // Скрытие DropDown, если клик мимо Контейнера для DropDown и Box'а
    if ( elm ) {
        if ( !elm.previousSibling.contains(event.target) && !elm.contains(event.target) ) {
			// HTML поля input из Box'а
            //var html = elm.previousSibling.firstChild.outerHTML;
			// HTML поля .input-group из Box'а
            var html = elm.previousSibling.outerHTML;
			//console.log(html);
			// Имя объекта из onclick="..."
			var objName = html.match(/onclick=\"(.+?)\.toggle/);
            if ( objName[1] ) {
				window[objName[1]].hide();
			}
			// Имитация клика по Input'у Box'а
            // elm.previousSibling.firstChild.click();
			// click() глючит с главным меню
        }
    }
});

//**************************************************************************************************
