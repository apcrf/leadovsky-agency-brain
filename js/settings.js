
var o = vueCrudFormData;
//o.page = window.page;
o.crud.restAPI = '/api/settings';
o.crud.deleteCheck = false;
o.crud.sort.by = 'settings.name';
o.crud.filter.data.in_use = 'Y';
o.form.dataInit.in_use = 'Y';
o.form.tabs = {
    Main: { caption: 'Настройка', fields: ['name', 'key', 'value', 'in_use'] },
    Note: { caption: 'Примечание', fields: ['note'] },
};

////////////////////////////////////////////////////////////////////////////////////////////

const app = Vue.createApp({
    data() {
        return vueCrudFormData
    },
    created: function() {
        document.addEventListener('keydown', this.onKeyDown);
    },
    mounted: function() {
        this.mounted();
    },
    methods: vueCrudFormMethods
}).mount('#app');
