
//**************************************************************************************************
// Перемещение модальных окон
//**************************************************************************************************

var moveObject = null;

// Modal Header onmousedown
function moveModalDown(event, elmModalHeader) {
	if ( event.target.tagName !== 'BUTTON' && event.target.parentElement.tagName !== 'BUTTON' ) {
		moveObject = {};
		moveObject.elmModalContent = elmModalHeader.parentElement;
		// Modal's coordinates at click on Header
		var rect = moveObject.elmModalContent.getBoundingClientRect();
		// Есть граница у родителя, rect.left не подходит
		moveObject.objectX = parseInt( moveObject.elmModalContent.style.left == "" ? "0" : moveObject.elmModalContent.style.left );
		// Поправка на границу у родителя (задана переменной Bootstrap)
		// Создаётся медиа условие, проверяющее viewports на ширину -lg (работает совместно с .modal-fullscreen-lg-down)
		var mediaQuery = window.matchMedia('(min-width: 992px)')
		if (mediaQuery.matches) {
			var marginRem = parseFloat(getComputedStyle(moveObject.elmModalContent.parentElement).getPropertyValue('--bs-modal-margin'));
			var pxPerRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
		}
		else {
			var marginRem = 0;
			var pxPerRem = 0;
		}
		moveObject.objectY = rect.top - marginRem * pxPerRem;
		// Mouse's coordinates at click on Header
		moveObject.mouseX = event.clientX;
		moveObject.mouseY = event.clientY;
	}
}
document.onmousemove = function(event) {
	if ( moveObject === null ) return;
	moveObject.elmModalContent.style.left = (moveObject.objectX - moveObject.mouseX + event.clientX) + "px";
	moveObject.elmModalContent.style.top = (moveObject.objectY - moveObject.mouseY + event.clientY) + "px";
}
document.onmouseup = function() {
	moveObject = null;
}

//**************************************************************************************************
// Синхронизация горизонтального скроллинга в CRUD
//**************************************************************************************************

function crudSynchroScroll(event) {
	var elmTbody = event.target; // div-список
    var elmThead = event.target.previousElementSibling; // div-заголовок
    if (elmThead) {
	    elmThead.scrollLeft = elmTbody.scrollLeft;
    }
}

//**************************************************************************************************
// Туман
//**************************************************************************************************

var fog = {};
fog.show = function() {
    var elm = document.createElement("div");
    elm.id = "fog";
    Object.assign(elm.style, {
        position: "fixed",
        width: "100%",
        height: "100%",
        left: "0",
        top: "0",
        zIndex: "100500",
        backgroundColor: "transparent",
    });
    document.body.appendChild(elm);
    // elmMessage
    var elmMessage = document.createElement("div");
    elmMessage.innerHTML = "Обработка данных...";
    Object.assign(elmMessage.style, {
        width: "280px",
        paddingTop: "10px",
        paddingBottom: "12px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "75px",
        textAlign: "center",
        fontSize: "1.3rem",
        backgroundColor: "Gold",
        border: "solid",
        borderRadius: "10px",
        borderColor: "#C3C3C3",
        borderWidth: "1px",
        boxShadow: "5px 5px 5px rgba(0,0,0,.2)",
    });
    elm.appendChild(elmMessage);
}
fog.hide = function() {
	var fog = document.getElementById("fog");
	if ( fog ) {
        fog.remove();
    }
}
fog.message = function (innerHTML) {
	var fog = document.getElementById("fog");
	if ( fog ) {
        var elmMessage = fog.getElementsByTagName("div")[0];
        elmMessage.innerHTML = innerHTML;
    }
}

//**************************************************************************************************
// Главное меню
//**************************************************************************************************

// Показ / Скрытие меню на мобильных устройствах
function navbarBtnClick(elm) {
    elm.blur();
    document.getElementById("collapse").classList.toggle("show");
}
// Показ / Скрытие меню вложенных
// Показ / Скрытие меню у кнопки
function navbarLinkClick(elm) {
    var elmDropdown = elm.parentNode.querySelector(".dropdown-menu");
    // Остальные скрыть
    var elms = document.getElementsByClassName("dropdown-menu");
    Array.from(elms).forEach((elm) => {
        if (elm != elmDropdown) {
            elm.classList.remove("show");
        }
    });
    // Кликнутое показать / скрыть
    if (elmDropdown) {
        elmDropdown.classList.toggle("show");
    }
}
// Скрытие меню вложенных при клике мимо меню
// Скрытие меню у кнопки при клике мимо меню
document.addEventListener("click", function(event) {
    // Поиск открытого меню вложенного
    var elmShowing = null;
    var elms = document.getElementsByClassName("dropdown-menu");
    Array.from(elms).forEach((elm) => {
        if (elm.classList.contains("show")) {
            elmShowing = elm;
        }
    });
    // Скрытие меню вложенного, если клик не по его пункту из меню верхнего уровня
    if (elmShowing) {
        if ( !elmShowing.parentNode.contains(event.target) && !elmShowing.contains(event.target) ) {
            elmShowing.classList.remove("show");
        }
    }
});

//**************************************************************************************************
// Get a Cookie
//**************************************************************************************************

function cookieGet(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

//**************************************************************************************************
