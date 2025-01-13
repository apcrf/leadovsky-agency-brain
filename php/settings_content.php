
<div class="container-flex">
    <!-------------------------------------------------- Блок Header -------------------------------------------------->
    <div class="block-header">
        <div class="row pt-2">
            <div class="col-auto mt-1">
                <h1 class="h4 pt-1">
                    <i class="<?=$app->route['icon']?> fa-lg"></i> <?=$app->route['title']?>
                </h1>
            </div>
            <div class="col-auto mt-1 ms-auto">
                <div class="parrots-5 input-group d-inline-flex mb-2 ms-2" style="top: -1.5px;">
                    <input type="text" class="form-control" placeholder="Фильтр" title="Фильтр: Наименование, Ключ, Значение, Примечание"
                        v-model="crud.filter.data.filter"
                        v-bind:style="filterStyle(crud, 'filter')"
                        v-on:keydown.enter="filterSet(crud)"
                        v-on:input="crud.filter.refresh=true"
                    >
                    <button class="btn btn-secondary" v-on:click="filterClear(crud, 'filter'); filterSet(crud);" title="Очистить">
                        <i class="fas fa-lg fa-times-circle"></i>
                    </button>
                </div>
                <button type="button" class="btn btn-warning mb-2 ms-2" title="Фильтр записей" v-on:click="filterShow(crud)">
                    <i class="fas fa-filter fa-lg"></i> Фильтры
                </button>
                <button type="button" class="btn btn-success mb-2 ms-2" title="Добавить запись" v-on:click="formEdit(crud, form, 'add')" v-if="<?=$app->route['permission']?>==2">
                    <i class="fas fa-plus-circle fa-lg"></i> Добавить
                </button>
                <button type="button" class="btn btn-primary mb-2 ms-2" title="Правка записи" v-on:click="formEdit(crud, form, 'edit')" v-if="<?=$app->route['permission']?>==2">
                    <i class="fas fa-edit fa-lg"></i> Правка
                </button>
                <button type="button" class="btn btn-danger mb-2 ms-2" title="Удаление записи" v-on:click="formDel(crud)" v-if="<?=$app->route['permission']?>==2">
                    <i class="fas fa-trash-alt fa-lg"></i> Удаление
                </button>
            </div>
        </div>
    </div>

    <!-------------------------------------------------- Блок Grow ---------------------------------------------------->
    <div class="block-grow">
        <div class="table-crud-thead">
            <table class="table-crud table table-primary table-bordered">
                <thead>
                    <tr class="text-center pointer">
                        <th class="col-id"
                            v-bind:style="sortStyle(crud, 'settings.id')"
                            v-on:click="sortClick(crud, 'settings.id')"
                        >ID</th>
                        <th class="col-name"
                            v-bind:style="sortStyle(crud, 'settings.name')"
                            v-on:click="sortClick(crud, 'settings.name')"
                        >Наименование</th>
                        <th class="col-key"
                            v-bind:style="sortStyle(crud, 'settings.key')"
                            v-on:click="sortClick(crud, 'settings.key')"
                        >Ключ</th>
                        <th class="col-value"
                            v-bind:style="sortStyle(crud, 'settings.value')"
                            v-on:click="sortClick(crud, 'settings.value')"
                        >Значение</th>
                        <th class="col-in_use"
                            v-bind:style="sortStyle(crud, 'settings.in_use')"
                            v-on:click="sortClick(crud, 'settings.in_use')"
                        ></th>
                        <th class="col-note"
                            v-bind:style="sortStyle(crud, 'settings.note')"
                            v-on:click="sortClick(crud, 'settings.note')"
                        >Примечание</th>
                    </tr>
                </thead>
            </table>
        </div>
        <div class="table-crud-tbody" onscroll="crudSynchroScroll(event)">
            <table class="table-crud table table-bordered">
                <tbody>
                    <tr
                        v-for="row in crud.rows"
                        v-bind:style="rowSelectedStyle(crud, row, 'id')"
                        v-on:click="rowSelectedClick(crud, row, 'id')"
                        v-on:dblclick="<?=$app->route['permission']?>==2 ? formEdit(crud, form, 'edit') : 0"
                    >
                        <td class="col-id text-center" v-text="row.id"></td>
                        <td class="col-name" v-text="row.name"></td>
                        <td class="col-key" v-text="row.key"></td>
                        <td class="col-value" v-text="row.value" v-bind:title="row.value"></td>
                        <td class="col-in_use">
                            <div class="form-check form-switch ps-5 mb-0" title="Используется">
                                <input type="checkbox" class="form-check-input" disabled
                                    v-model="row.in_use"
                                    true-value="Y"
                                    false-value="N"
                                >
                            </div>
                        </td>
                        <td class="col-note" v-text="row.note"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-------------------------------------------------- Блок Footer -------------------------------------------------->
    <div class="block-footer">
        <!-- paginator -->
        <div class="row justify-content-end mb-2">
            <div class="col-auto mt-2">
                <label class="col-form-label">Всего:</label>
                <label class="col-form-label border rounded bg-light px-2 ms-2">{{crud.paginator.total}}</label>
            </div>
            <div class="col-auto mt-2">
                <div class="input-group">
                    <button type="button" class="btn btn-secondary border-0 border-end paginator-btn" v-on:click="paginate(crud, 'first')">
                        <i class="fa-solid fa-backward-fast fa-xl"></i>
                    </button>
                    <button type="button" class="btn btn-secondary border-0 border-start paginator-btn" v-on:click="paginate(crud, 'prev')">
                        <i class="fa-solid fa-caret-left fa-2xl"></i>
                    </button>
                    <select class="form-select text-center paginator-select" v-model="crud.paginator.page" v-on:change="paginate(crud, '')">
                        <option v-for="page in crud.paginator.pages" v-bind:value="page">{{page}}</option>
                    </select>
                    <label class="input-group-text border-end-0 pe-2">из</label>
                    <label class="input-group-text border-start-0 ps-0">{{crud.paginator.last_page}}</label>
                    <button type="button" class="btn btn-secondary border-0 border-end paginator-btn" v-on:click="paginate(crud, 'next')">
                        <i class="fa-solid fa-caret-right fa-2xl"></i>
                    </button>
                    <button type="button" class="btn btn-secondary border-0 border-start paginator-btn" v-on:click="paginate(crud, 'last')">
                        <i class="fa-solid fa-forward-fast fa-xl"></i>
                    </button>
                </div>
            </div>
            <div class="col-auto mt-2">
                <label class="col-form-label">на странице:</label>
                <select class="form-select d-inline text-center ms-2 ps-2" style="width: 82px;" v-model="crud.paginator.per_page" v-on:change="paginate(crud, 'per_page')">
                    <option v-for="per_page in crud.paginator.per_pages" v-bind:value="per_page">{{per_page}}</option>
                </select>
            </div>
        </div>
    </div>
</div> <!-- /container-flex -->

<!----------------------------------------------------------------------------------------------------------------->
<!-- Фильтр -->
<!----------------------------------------------------------------------------------------------------------------->
<div class="modal modal-floor-2 d-none" v-show="crud.filter.show">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-lg-down">
		<div class="modal-content">
			<!-- Modal Header -->
			<div class="modal-header py-2 pe-1 move" onmousedown="moveModalDown(event, this)">
				<i class="fas fa-filter fa-lg"></i>&nbsp;
				<h5 class="modal-title d-inline-block mt-1">Фильтры</h5>
				<!--  -->
				<button type="button" class="btn float-end" v-on:click="crud.filter.show = false">
					<i class="fas fa-times fa-lg text-secondary"></i>
				</button>
			</div>
			<!-- Modal body -->
			<div class="modal-body pt-3">
				<div class="row mb-3">
					<label class="col-form-label col-sm-4">Наименование:</label>
					<div class="parrots-8">
						<div class="input-group">
							<input type="text" class="form-control" placeholder="содержит"
								v-model="crud.filter.data.name"
								v-bind:style="filterStyle(crud, 'name')"
								v-on:keydown.enter="filterSet(crud)"
								v-on:input="crud.filter.refresh=true"
							>
							<button class="btn btn-secondary" v-on:click="filterClear(crud, 'name')" title="Очистить">
								<i class="fas fa-lg fa-times-circle"></i>
							</button>
						</div>
					</div>
				</div>
				<div class="row mb-3">
					<label class="col-form-label col-sm-4">Используется:</label>
					<div class="parrots-5">
						<div class="input-group">
							<select class="form-select"
								v-model="crud.filter.data.in_use"
								v-bind:style="filterStyle(crud, 'in_use')"
								v-on:change="filterSelectChange(crud, 'in_use')"
							>
								<option value="undefined">Все</option>
								<option value="Y">Да</option>
								<option value="N">Нет</option>
							</select>
							<button class="btn btn-secondary" v-on:click="filterClear(crud, 'in_use')" title="Очистить">
								<i class="fas fa-lg fa-times-circle"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- Modal footer -->
			<div class="modal-footer py-2">
				<button class="btn btn-warning" v-on:click="filterSet(crud)" v-bind:disabled="!crud.filter.refresh">
					<i class="fas fa-filter fa-lg"></i>&nbsp; Фильтровать
				</button>
				<button class="btn btn-secondary me-0" v-on:click="crud.filter.show=false">
					<i class="fas fa-times-circle fa-lg"></i>&nbsp; Закрыть
				</button>
			</div>
		</div>
	</div>
</div> <!-- /modal -->

<!----------------------------------------------------------------------------------------------------------------->
<!-- Добавление / Правка -->
<!----------------------------------------------------------------------------------------------------------------->
<div class="modal modal-floor-2 d-none" v-show="form.show">
	<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-lg-down">
		<div class="modal-content">
			<!-- Modal Header -->
			<div class="modal-header py-2 pe-1 move" onmousedown="moveModalDown(event, this)">
				<i class="<?=$app->route['icon']?> fa-xl"></i>&nbsp;
				<h5 class="modal-title d-inline-block mt-1">{{form.tabs.Main.caption}}</h5>
				<!--  -->
				<button type="button" class="btn float-end" v-on:click="formClose(crud, form)">
					<i class="fas fa-times fa-lg text-secondary"></i>
				</button>
			</div>
			<!-- Modal NavTabs -->
			<div class="modal-header pt-2 pb-0 border-0">
				<ul class="nav nav-tabs">
					<li class="nav-item" v-for="(tab, key) in form.tabs" v-on:click="methodCall(tab.methodOnClick)">
						<a class="nav-link" href="#"
							v-on:click="form.tabActive=key"
							v-bind:class="{ active: form.tabActive==key, disabled: form.data.id == 0 }"
						>
							{{tab.caption}}
						</a>
					</li>
				</ul>
			</div>
			<!-- Modal Body -->
			<div class="modal-body">
				<!-- Tab panes -->
				<div class="tab-content">

					<!-- Tab pane Main -->
					<div class="tab-pane" v-bind:class="{ active: form.tabActive=='Main' }">
						<div class="row mb-3">
							<label class="col-form-label col-sm-3">ID:</label>
							<div class="parrots-5">
								<input type="text" class="form-control" disabled v-model="form.data.id">
							</div>
						</div>
						<div class="row mb-3">
							<label class="col-form-label col-sm-3">Наименование:</label>
							<div class="parrots-20 col-sm-9">
								<input type="text" class="form-control"
									v-model="form.data.name"
									v-on:input="tabChanged(form, 'name')"
								>
							</div>
						</div>
						<div class="row mb-3">
							<label class="col-form-label col-sm-3">Ключ:</label>
							<div class="parrots-20 col-sm-9">
								<input type="text" class="form-control"
									v-model="form.data.key"
									v-on:input="tabChanged(form, 'key')"
								>
							</div>
						</div>
						<div class="row mb-3">
							<label class="col-form-label col-sm-3">Значение:</label>
							<div class="parrots-20 col-sm-9">
								<input type="text" class="form-control"
									v-model="form.data.value"
									v-on:input="tabChanged(form, 'value')"
								>
							</div>
						</div>
						<div class="row mb-3">
							<label class="col-form-label col-sm-3">Используется:</label>
							<div class="parrots-2 mt-sm-2">
								<div class="form-check form-switch">
									<input type="checkbox" class="form-check-input"
										v-model="form.data.in_use"
										v-on:input="tabChanged(form, 'in_use')"
										true-value="Y"
										false-value="N"
									>
								</div>
							</div>
						</div>
					</div>

					<!-- Tab pane Note -->
					<div class="tab-pane" v-bind:class="{ active: form.tabActive=='Note' }">
						<div class="row h-100 pb-3">
							<div class="col-12">
								<textarea class="form-control h-100" style="resize: none;" placeholder="Введите Примечание"
									v-model="form.data.note"
									v-on:input="tabChanged(form, 'note')"
								>
								</textarea>
							</div>
						</div>
					</div>

				</div>
			</div>
			<!-- Modal Footer -->
			<div class="modal-footer py-2">
				<h6 class="modal-title me-auto" v-show="form.error.length>0">
					<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> &nbsp; {{form.error}}</span>
				</h6>
				<button class="btn btn-primary"
					v-for="(tab, key) in form.tabs"
					v-on:click="formSave(crud, form, key)"
					v-show="form.changed[key]"
				>
					Сохранить {{tab.caption}}
				</button>
				<button class="btn btn-secondary" v-on:click="formClose(crud, form)">
					<i class="fas fa-times-circle fa-lg"></i>&nbsp; Закрыть
				</button>
			</div>
		</div>
	</div>
</div> <!-- /modal -->
