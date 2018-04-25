import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, EventEmitter, Injectable, Input, NgModule, Output, Pipe, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Observable as Observable$1 } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/groupBy';
import { CommonModule } from '@angular/common';
var ResourceService = (function () {
    function ResourceService() {
        this.data = [];
        this.order = [];
    }
    /**
     * @param {?} key
     * @return {?}
     */
    ResourceService.prototype.sortBy = function (key) {
        var _this = this;
        this.key = key;
        if (Object.keys(this.order).length === 0) {
            this.order[this.key] = 'asc';
        }
        if (this.order[this.key] === 'asc') {
            this.order = [];
            this.order[this.key] = 'desc';
            this.data.sort(function (a, b) { return _this.compare(a, b); });
        }
        else {
            this.order = [];
            this.order[this.key] = 'asc';
            this.data.sort(function (a, b) { return _this.compare(b, a); });
        }
        return this.data;
    };
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    ResourceService.prototype.compare = function (a, b) {
        if ((isNaN(parseFloat(a[this.key])) || !isFinite(a[this.key])) || (isNaN(parseFloat(b[this.key])) || !isFinite(b[this.key]))) {
            if (a[this.key] + ''.toLowerCase() < b[this.key] + ''.toLowerCase()) {
                return -1;
            }
            if (a[this.key] + ''.toLowerCase() > b[this.key] + ''.toLowerCase()) {
                return 1;
            }
        }
        else {
            if (parseFloat(a[this.key]) < parseFloat(b[this.key])) {
                return -1;
            }
            if (parseFloat(a[this.key]) > parseFloat(b[this.key])) {
                return 1;
            }
        }
        return 0;
    };
    return ResourceService;
}());
ResourceService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
ResourceService.ctorParameters = function () { return []; };
var ConfigService = (function () {
    function ConfigService() {
    }
    return ConfigService;
}());
ConfigService.config = {
    searchEnabled: false,
    headerEnabled: true,
    orderEnabled: true,
    globalSearchEnabled: false,
    paginationEnabled: true,
    exportEnabled: false,
    clickEvent: true,
    selectRow: false,
    selectCol: false,
    selectCell: false,
    rows: 10,
    additionalActions: false,
    serverPagination: false,
    isLoading: true,
    detailsTemplate: false,
    groupRows: false,
    paginationRangeEnabled: true,
};
ConfigService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
ConfigService.ctorParameters = function () { return []; };
var Event = {};
Event.onPagination = 0;
Event.onOrder = 1;
Event.onGlobalSearch = 2;
Event.onSearch = 3;
Event.onClick = 4;
Event[Event.onPagination] = "onPagination";
Event[Event.onOrder] = "onOrder";
Event[Event.onGlobalSearch] = "onGlobalSearch";
Event[Event.onSearch] = "onSearch";
Event[Event.onClick] = "onClick";
var LoggerService = (function () {
    function LoggerService() {
    }
    /**
     * @param {?=} message
     * @return {?}
     */
    LoggerService.prototype.error = function (message) {
        console.error(message);
    };
    /**
     * @param {?=} message
     * @return {?}
     */
    LoggerService.prototype.warn = function (message) {
        console.warn(message);
    };
    /**
     * @param {?=} message
     * @return {?}
     */
    LoggerService.prototype.info = function (message) {
        console.log(message);
    };
    /**
     * @param {?=} message
     * @return {?}
     */
    LoggerService.prototype.debug = function (message) {
        console.log(message);
    };
    /**
     * @param {?=} message
     * @return {?}
     */
    LoggerService.prototype.log = function (message) {
        console.log(message);
    };
    return LoggerService;
}());
LoggerService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
LoggerService.ctorParameters = function () { return []; };
var BaseComponent = (function () {
    /**
     * @param {?} resource
     * @param {?} cdr
     * @param {?} logger
     */
    function BaseComponent(resource, cdr, logger) {
        this.resource = resource;
        this.cdr = cdr;
        this.logger = logger;
        this.grouped = [];
        this.menuActive = false;
        this.page = 1;
        this.count = null;
        this.selectedDetailsTemplateRowId = null;
        this.event = new EventEmitter();
        // make random pagination ID to avoid situation when we have more than 1 table at page
        this.id = Math.floor((Math.random() * 10000) + 1);
    }
    /**
     * @return {?}
     */
    BaseComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.configuration) {
            ConfigService.config = this.configuration;
        }
        this.config = ConfigService.config;
        this.limit = this.configuration.rows;
        if (this.groupRowsBy) {
            Observable$1
                .from(this.data)
                .groupBy(function (row) { return row[_this.groupRowsBy]; })
                .flatMap(function (group) { return group.reduce(function (acc, curr) { return acc.concat([curr]); }, []); })
                .subscribe(function (row) { return _this.grouped.push(row); });
        }
    };
    /**
     * @return {?}
     */
    BaseComponent.prototype.ngAfterViewInit = function () {
        this.cdr.detectChanges();
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    BaseComponent.prototype.ngOnChanges = function (changes) {
        var /** @type {?} */ data = changes.data;
        var /** @type {?} */ pagination = changes.pagination;
        if (data && data.currentValue) {
            this.data = data.currentValue.slice();
        }
        if (pagination && pagination.currentValue) {
            this.count = pagination.currentValue.count;
        }
    };
    /**
     * @param {?} key
     * @return {?}
     */
    BaseComponent.prototype.orderBy = function (key) {
        if (ConfigService.config.orderEnabled || !ConfigService.config.serverPagination) {
            this.data = this.resource.sortBy(key);
            this.data = this.data.slice();
        }
        this.onOrder(key);
    };
    /**
     * @param {?} $event
     * @param {?} row
     * @param {?} key
     * @param {?} colIndex
     * @param {?} rowIndex
     * @return {?}
     */
    BaseComponent.prototype.clickedCell = function ($event, row, key, colIndex, rowIndex) {
        if (ConfigService.config.selectRow) {
            this.selectedRow = rowIndex;
        }
        if (ConfigService.config.selectCol) {
            this.selectedCol = colIndex;
        }
        if (ConfigService.config.selectCell) {
            this.selectedRow = rowIndex;
            this.selectedCol = colIndex;
        }
        if (ConfigService.config.clickEvent) {
            var /** @type {?} */ value = {
                event: $event,
                row: row,
                key: key,
                rowId: rowIndex,
                colId: colIndex
            };
            this.emitEvent(Event.onClick, value);
        }
    };
    /**
     * @param {?} colIndex
     * @return {?}
     */
    BaseComponent.prototype.toggleColumn = function (colIndex) {
        var /** @type {?} */ toggleColumns = new Set(this.columns);
        if (toggleColumns.has(colIndex)) {
            toggleColumns.delete(colIndex);
        }
        else {
            toggleColumns.add(colIndex);
        }
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    BaseComponent.prototype.onSearch = function ($event) {
        if (!ConfigService.config.serverPagination) {
            this.term = $event;
        }
        this.emitEvent(Event.onSearch, $event);
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    BaseComponent.prototype.onGlobalSearch = function ($event) {
        if (!ConfigService.config.serverPagination) {
            this.globalSearchTerm = $event;
        }
        this.emitEvent(Event.onGlobalSearch, $event);
    };
    /**
     * @param {?} $event
     * @return {?}
     */
    BaseComponent.prototype.onPagination = function ($event) {
        this.page = $event.page;
        this.limit = $event.limit;
        this.emitEvent(Event.onPagination, $event);
    };
    /**
     * @param {?} key
     * @return {?}
     */
    BaseComponent.prototype.onOrder = function (key) {
        var /** @type {?} */ value = {
            key: key,
            order: this.resource.order[key]
        };
        this.emitEvent(Event.onOrder, value);
    };
    /**
     * @param {?} event
     * @param {?} value
     * @return {?}
     */
    BaseComponent.prototype.emitEvent = function (event, value) {
        this.event.emit({ event: Event[event], value: value });
    };
    /**
     * @param {?} rowIndex
     * @return {?}
     */
    BaseComponent.prototype.selectRowId = function (rowIndex) {
        if (this.selectedDetailsTemplateRowId === rowIndex) {
            this.selectedDetailsTemplateRowId = null;
        }
        else {
            this.selectedDetailsTemplateRowId = rowIndex;
        }
    };
    return BaseComponent;
}());
BaseComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-table',
                providers: [ResourceService, LoggerService, ConfigService],
                template: "\n    <div class=\"ngx-container\">\n      <div class=\"ngx-columns\">\n        <div class=\"ngx-column ngx-col-4 ngx-col-mr-auto\"></div>\n        <div class=\"ngx-column ngx-col-3\">\n          <global-search\n            *ngIf=\"config.globalSearchEnabled\"\n            (globalUpdate)=\"onGlobalSearch($event)\">\n          </global-search>\n        </div>\n      </div>\n      <div class=\"ngx-columns\">\n        <table class=\"ngx-table ngx-table-striped ngx-table-hover\">\n          <thead>\n          <tr class=\"ngx-table__header\" *ngIf=\"config.headerEnabled\">\n            <ng-container *ngFor=\"let column of columns\">\n              <th class=\"ngx-table__header-cell\"\n                  (click)=\"orderBy(column['key'])\">\n                <div class=\"ngx-d-inline\">{{ column['title'] }}</div>\n                <span *ngIf=\"resource.order[column['key']]==='asc' \"\n                      [style.display]=\"config.orderEnabled?'':'none' \"\n                      class=\"ngx-icon ngx-icon-arrow-up\">\n                </span>\n                <span *ngIf=\"resource.order[column['key']]==='desc' \"\n                      [style.display]=\"config.orderEnabled?'':'none' \"\n                      class=\"ngx-icon ngx-icon-arrow-down\">\n                </span>\n              </th>\n            </ng-container>\n            <th *ngIf=\"config.additionalActions || config.detailsTemplate\"\n                class=\"ngx-table__header-cell-additional-actions\">\n              <div class=\"ngx-dropdown ngx-active ngx-dropdown-right\"\n                   *ngIf=\"config.additionalActions\"\n                   [class.ngx-active]=\"menuActive\">\n                <a class=\"ngx-btn ngx-btn-link\" (click)=\"menuActive = !menuActive\">\n                  <span class=\"ngx-icon ngx-icon-menu\"></span>\n                </a>\n                <ul class=\"ngx-menu ngx-table__table-menu\">\n                  <li class=\"ngx-menu-item\">\n                    <csv-export *ngIf=\"config.exportEnabled\"></csv-export>\n                  </li>\n                </ul>\n              </div>\n            </th>\n          </tr>\n          <tr *ngIf=\"config.searchEnabled\"\n              class=\"ngx-table__sortHeader\">\n            <ng-container *ngFor=\"let column of columns\">\n              <th>\n                <table-header (update)=\"onSearch($event)\" [column]=\"column\"></table-header>\n              </th>\n            </ng-container>\n            <th *ngIf=\"config.additionalActions || config.detailsTemplate\"></th>\n          </tr>\n          </thead>\n          <tbody *ngIf=\"data && !config.isLoading\">\n          <ng-container *ngIf=\"rowTemplate\">\n            <tr *ngFor=\"let row of data | search : term | global : globalSearchTerm | paginate: { itemsPerPage: limit, currentPage: page, totalItems: count, id: id };\n                  let rowIndex = index\"\n                (click)=\"clickedCell($event, row, '', '', rowIndex)\"\n                [class.ngx-table__table-row--selected]=\"rowIndex == selectedRow && !config.selectCell\">\n              <ng-container [ngTemplateOutlet]=\"rowTemplate\"\n                            [ngTemplateOutletContext]=\"{ $implicit: row }\">\n              </ng-container>\n            </tr>\n          </ng-container>\n          <ng-container *ngIf=\"!rowTemplate && !config.groupRows\">\n            <ng-container\n              *ngFor=\"let row of data | search : term | global : globalSearchTerm | paginate: { itemsPerPage: limit, currentPage: page, totalItems: count, id: id };\n                      let rowIndex = index\"\n              [class.ngx-table__table-row--selected]=\"rowIndex == selectedRow && !config.selectCell\">\n              <tr>\n                <ng-container *ngFor=\"let column of columns; let colIndex = index\">\n                  <td (click)=\"clickedCell($event, row, column['key'], colIndex, rowIndex)\"\n                      [class.ngx-table__table-col--selected]=\"colIndex == selectedCol && !config.selectCell\"\n                      [class.ngx-table__table-cell--selected]=\"colIndex == selectedCol && rowIndex == selectedRow && !config.selectCol && !config.selectRow\"\n                  >\n                    <div>{{ row[column['key']] }}</div>\n                  </td>\n                </ng-container>\n                <td *ngIf=\"config.additionalActions || config.detailsTemplate\">\n                  <span class=\"ngx-icon ngx-c-hand\"\n                        [class.ngx-icon-arrow-down]=\"selectedDetailsTemplateRowId === rowIndex\"\n                        [class.ngx-icon-arrow-right]=\"selectedDetailsTemplateRowId !== rowIndex\"\n                        (click)=\"selectRowId(rowIndex)\">\n                  </span>\n                </td>\n              </tr>\n              <tr *ngIf=\"config.detailsTemplate && selectedDetailsTemplateRowId === rowIndex\">\n                <td [attr.colspan]=\"columns.length + 1\">\n                  <ng-container\n                    [ngTemplateOutlet]=\"detailsTemplate\"\n                    [ngTemplateOutletContext]=\"{ $implicit: row }\">\n                  </ng-container>\n                </td>\n              </tr>\n            </ng-container>\n          </ng-container>\n          <ng-container *ngIf=\"!rowTemplate && config.groupRows\">\n            <ng-container\n              *ngFor=\"let group of grouped; let rowIndex = index\">\n              <tr>\n                <td [attr.colspan]=\"columns.length\">\n                  <div>{{group[0][groupRowsBy]}} ({{group.length}})</div>\n                </td>\n                <td>\n                  <span class=\"ngx-icon ngx-c-hand\"\n                        [class.ngx-icon-arrow-down]=\"selectedDetailsTemplateRowId === rowIndex\"\n                        [class.ngx-icon-arrow-right]=\"selectedDetailsTemplateRowId !== rowIndex\"\n                        (click)=\"selectRowId(rowIndex)\">\n                  </span>\n                </td>\n              </tr>\n              <ng-container *ngIf=\"selectedDetailsTemplateRowId === rowIndex\">\n                <tr *ngFor=\"let row of group\">\n                  <td *ngFor=\"let column of columns\">\n                    {{row[column['key']]}}\n                    <!-- TODO allow users to add groupRowsTemplateRef -->\n                  </td>\n                  <td></td>\n                </tr>\n              </ng-container>\n            </ng-container>\n          </ng-container>\n          </tbody>\n          <tbody *ngIf=\"!data\">\n          <tr class=\"ngx-table__body-empty\">\n            <td>No results</td>\n          </tr>\n          </tbody>\n          <tbody *ngIf=\"config.isLoading\">\n          <tr class=\"ngx-table__body-loading\">\n            <td>\n              <div class=\"ngx-table__table-loader\"></div>\n            </td>\n          </tr>\n          </tbody>\n        </table>\n      </div>\n      <pagination\n        *ngIf=\"config.paginationEnabled\"\n        [id]=\"id\"\n        [pagination]=\"pagination\"\n        (updateRange)=\"onPagination($event)\">\n      </pagination>\n    </div>\n  ",
                styles: ["\n    * {\n      font-family: Verdana, serif;\n    }\n\n    .ngx-table__table-row--selected {\n      background: #9cbff9 !important;\n    }\n\n    .ngx-table__table-col--selected {\n      background: #9cbff9 !important;\n    }\n\n    .ngx-table__table-cell--selected {\n      background: #9cbff9 !important;\n    }\n    .ngx-table__table-loader {\n      border: 4px solid #f3f3f3;\n      border-top: 4px solid #3498db;\n      border-radius: 50%;\n      height: 20px;\n      width: 20px;\n      margin-left: auto;\n      margin-right: auto;\n      -webkit-animation: spin 1s linear infinite;\n              animation: spin 1s linear infinite;\n    }\n\n    @-webkit-keyframes spin {\n      0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }\n      100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }\n    }\n\n    @keyframes spin {\n      0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }\n      100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }\n    }\n  "],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
BaseComponent.ctorParameters = function () { return [
    { type: ResourceService, },
    { type: ChangeDetectorRef, },
    { type: LoggerService, },
]; };
BaseComponent.propDecorators = {
    'configuration': [{ type: Input },],
    'data': [{ type: Input },],
    'pagination': [{ type: Input },],
    'groupRowsBy': [{ type: Input },],
    'detailsTemplate': [{ type: Input },],
    'columns': [{ type: Input },],
    'event': [{ type: Output },],
    'rowTemplate': [{ type: ContentChild, args: [TemplateRef,] },],
};
var GlobalSearchComponent = (function () {
    function GlobalSearchComponent() {
        this.globalUpdate = new EventEmitter();
    }
    return GlobalSearchComponent;
}());
GlobalSearchComponent.decorators = [
    { type: Component, args: [{
                selector: 'global-search',
                template: "\n    <label class=\"form-label ngx-float-right\" for=\"search\">\n      <input type=\"text\"\n             id=\"search\"\n             class=\"ngx-table__global-search ngx-form-input ngx-input-sm\"\n             #input\n             (input)=\"globalUpdate.emit({value: input.value})\"\n             placeholder=\"Search\"/>\n    </label>\n  "
            },] },
];
/**
 * @nocollapse
 */
GlobalSearchComponent.ctorParameters = function () { return []; };
GlobalSearchComponent.propDecorators = {
    'globalUpdate': [{ type: Output },],
};
var GlobalSearchPipe = (function () {
    /**
     * @param {?} resource
     */
    function GlobalSearchPipe(resource) {
        this.resource = resource;
    }
    /**
     * @param {?} dataArr
     * @param {?} filter
     * @return {?}
     */
    GlobalSearchPipe.prototype.transform = function (dataArr, filter) {
        var _this = this;
        if (typeof dataArr === 'undefined') {
            return;
        }
        if (typeof filter === 'undefined' || Object.keys(filter).length === 0 || filter === '') {
            return dataArr;
        }
        this.resource.data = [];
        dataArr.forEach(function (row) {
            for (var /** @type {?} */ value in row) {
                if (row.hasOwnProperty(value)) {
                    var /** @type {?} */ element = void 0;
                    if (typeof row[value] === 'object') {
                        element = JSON.stringify(row[value]).toLocaleLowerCase();
                    }
                    if (typeof row[value] === 'boolean') {
                        element = '' + row[value];
                    }
                    if (typeof row[value] === 'string') {
                        element = row[value].toLocaleLowerCase();
                    }
                    if (typeof row[value] === 'number') {
                        element = '' + row[value];
                    }
                    if (element.indexOf(filter['value'].toLocaleLowerCase()) >= 0) {
                        _this.resource.data.push(row);
                        return;
                    }
                }
            }
        });
        return this.resource.data;
    };
    return GlobalSearchPipe;
}());
GlobalSearchPipe.decorators = [
    { type: Pipe, args: [{
                name: 'global'
            },] },
];
/**
 * @nocollapse
 */
GlobalSearchPipe.ctorParameters = function () { return [
    { type: ResourceService, },
]; };
var SearchPipe = (function () {
    /**
     * @param {?} resource
     */
    function SearchPipe(resource) {
        this.resource = resource;
    }
    /**
     * @param {?} value
     * @param {?} filters
     * @return {?}
     */
    SearchPipe.prototype.transform = function (value, filters) {
        var _this = this;
        if (typeof value === 'undefined') {
            return;
        }
        this.resource.data = value.slice();
        if (typeof filters === 'undefined' || Object.keys(filters).length === 0) {
            return this.resource.data;
        }
        var /** @type {?} */ filtersArr = [];
        filtersArr[filters.key] = filters.value;
        value.forEach(function (item) {
            for (var /** @type {?} */ filterKey in filtersArr) {
                if (filtersArr.hasOwnProperty(filterKey)) {
                    var /** @type {?} */ element = '';
                    if (typeof item[filterKey] === 'string') {
                        element = item[filterKey].toLocaleLowerCase();
                    }
                    if (typeof item[filterKey] === 'object') {
                        element = JSON.stringify(item[filterKey]);
                    }
                    if (typeof item[filterKey] === 'number') {
                        element = item[filterKey].toString();
                    }
                    if (typeof item[filterKey] === 'boolean') {
                        element = item[filterKey].toString();
                    }
                    if (element.indexOf(filtersArr[filterKey].toLocaleLowerCase()) === -1) {
                        _this.resource.data.splice(_this.resource.data.indexOf(item), 1);
                        return;
                    }
                }
            }
        });
        return this.resource.data;
    };
    return SearchPipe;
}());
SearchPipe.decorators = [
    { type: Pipe, args: [{
                name: 'search'
            },] },
];
/**
 * @nocollapse
 */
SearchPipe.ctorParameters = function () { return [
    { type: ResourceService, },
]; };
var HeaderComponent = (function () {
    function HeaderComponent() {
        this.update = new EventEmitter();
    }
    return HeaderComponent;
}());
HeaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'table-header',
                template: "\n    <label for=\"search_{{ column['key'] }}\">\n      <input type=\"text\"\n             id=\"search_{{ column['key'] }}\"\n             aria-label=\"Search\"\n             placeholder=\"Search {{ column['title'] }}\"\n             class=\"ngx-table__header-search ngx-form-input ngx-input-sm\"\n             #input\n             (input)=\"update.emit({value: input.value, key: column['key']})\"\n      >\n    </label>"
            },] },
];
/**
 * @nocollapse
 */
HeaderComponent.ctorParameters = function () { return []; };
HeaderComponent.propDecorators = {
    'column': [{ type: Input },],
    'update': [{ type: Output },],
};
var PaginationComponent = (function () {
    function PaginationComponent() {
        this.updateRange = new EventEmitter();
        this.ranges = [5, 10, 25, 50, 100];
        this.limit = ConfigService.config.rows;
        this.showRange = false;
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    PaginationComponent.prototype.onPageChange = function ($event) {
        this.updateRange.emit({
            page: $event,
            limit: this.limit
        });
    };
    /**
     * @param {?} limit
     * @return {?}
     */
    PaginationComponent.prototype.changeLimit = function (limit) {
        this.showRange = !this.showRange;
        this.limit = limit;
        this.updateRange.emit({
            page: 1,
            limit: limit
        });
    };
    /**
     * @return {?}
     */
    PaginationComponent.prototype.ngOnInit = function () {
        this.config = ConfigService.config;
    };
    return PaginationComponent;
}());
PaginationComponent.decorators = [
    { type: Component, args: [{
                selector: 'pagination',
                template: "\n    <div class=\"ngx-columns\">\n      <div class=\"ngx-col-mr-auto pagination-mobile\">\n        <pagination-controls\n          [id]=\"id\"\n          [maxSize]=\"5\"\n          [previousLabel]=\"''\"\n          [nextLabel]=\"''\"\n          (pageChange)=\"onPageChange($event)\">\n        </pagination-controls>\n      </div>\n      <div class=\"pagination-mobile\" *ngIf=\"config.paginationRangeEnabled\">\n        <div class=\"ngx-dropdown ngx-range-dropdown ngx-float-right\"\n             [class.ngx-active]=\"showRange\"\n             id=\"rowAmount\">\n          <div class=\"ngx-btn-group\">\n            <span class=\"ngx-btn ngx-range-dropdown-button\"\n                  (click)=\"showRange = !showRange\">\n              {{limit}} <i class=\"ngx-icon ngx-icon-arrow-down\"></i>\n            </span>\n            <ul class=\"ngx-menu\">\n              <li class=\"ngx-c-hand ngx-range-dropdown-button\"\n                  (click)=\"changeLimit(limit)\"\n                  *ngFor=\"let limit of ranges\">\n                <span>{{limit}}</span>\n              </li>\n            </ul>\n          </div>\n        </div>\n      </div>\n    </div>\n  ",
                styles: ["\n    :host /deep/ pagination-controls > pagination-template > ul > li {\n      border: 1px solid #f0f0f0;\n    }\n    @media screen and (max-width: 480px) {\n      .pagination-mobile {\n        margin-right: auto;\n        margin-left: auto;\n      }\n    }\n\n    .ngx-btn {\n      color: #4f596c;\n      border: 1px solid #f0f0f0;\n    }\n\n    .ngx-range-dropdown {\n      margin-top: 16px;\n    }\n\n    .ngx-range-dropdown-button {\n      padding: 4px;\n    }\n\n    .ngx-menu {\n      min-width: 55px;\n    }\n  "],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
PaginationComponent.ctorParameters = function () { return []; };
PaginationComponent.propDecorators = {
    'pagination': [{ type: Input },],
    'id': [{ type: Input },],
    'updateRange': [{ type: Output },],
};
var CsvExportComponent = (function () {
    /**
     * @param {?} resource
     */
    function CsvExportComponent(resource) {
        this.resource = resource;
    }
    /**
     * @return {?}
     */
    CsvExportComponent.prototype.exportCsv = function () {
        var /** @type {?} */ data = this.resource.data;
        var /** @type {?} */ csvContent = 'data:text/csv;charset=utf-8,';
        var /** @type {?} */ dataString = '';
        var /** @type {?} */ x = [];
        var /** @type {?} */ keys = Object.keys(this.resource.data[0]);
        data.forEach(function (row, index) {
            x[index] = [];
            keys.forEach(function (i) {
                if (row.hasOwnProperty(i)) {
                    if (typeof row[i] === 'object') {
                        row[i] = 'Object'; // so far just change object to "Object" string
                    }
                    x[index].push(row[i]);
                }
            });
        });
        csvContent += keys + '\n';
        x.forEach(function (row, index) {
            dataString = row.join(',');
            csvContent += index < data.length ? dataString + '\n' : dataString;
        });
        var /** @type {?} */ encodedUri = encodeURI(csvContent);
        var /** @type {?} */ link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'my_data.csv');
        link.click();
    };
    return CsvExportComponent;
}());
CsvExportComponent.decorators = [
    { type: Component, args: [{
                selector: 'csv-export',
                template: "\n    <a (click)=\"exportCsv()\">\n      CSV export\n    </a>"
            },] },
];
/**
 * @nocollapse
 */
CsvExportComponent.ctorParameters = function () { return [
    { type: ResourceService, },
]; };
var PaginationService = (function () {
    function PaginationService() {
        this.change = new EventEmitter();
        this.instances = {};
        this.DEFAULT_ID = 'DEFAULT_PAGINATION_ID';
    }
    PaginationService.prototype.defaultId = function () { return this.DEFAULT_ID; };
    PaginationService.prototype.register = function (instance) {
        if (!instance.id) {
            instance.id = this.DEFAULT_ID;
        }
        if (!this.instances[instance.id]) {
            this.instances[instance.id] = instance;
            this.change.emit(instance.id);
        }
        else {
            var changed = this.updateInstance(instance);
            if (changed) {
                this.change.emit(instance.id);
            }
        }
    };
    /**
     * Check each property of the instance and update any that have changed. Return
     * true if any changes were made, else return false.
     */
    PaginationService.prototype.updateInstance = function (instance) {
        var changed = false;
        for (var prop in this.instances[instance.id]) {
            if (instance[prop] !== this.instances[instance.id][prop]) {
                this.instances[instance.id][prop] = instance[prop];
                changed = true;
            }
        }
        return changed;
    };
    /**
     * Returns the current page number.
     */
    PaginationService.prototype.getCurrentPage = function (id) {
        if (this.instances[id]) {
            return this.instances[id].currentPage;
        }
    };
    /**
     * Sets the current page number.
     */
    PaginationService.prototype.setCurrentPage = function (id, page) {
        if (this.instances[id]) {
            var instance = this.instances[id];
            var maxPage = Math.ceil(instance.totalItems / instance.itemsPerPage);
            if (page <= maxPage && 1 <= page) {
                this.instances[id].currentPage = page;
                this.change.emit(id);
            }
        }
    };
    /**
     * Sets the value of instance.totalItems
     */
    PaginationService.prototype.setTotalItems = function (id, totalItems) {
        if (this.instances[id] && 0 <= totalItems) {
            this.instances[id].totalItems = totalItems;
            this.change.emit(id);
        }
    };
    /**
     * Sets the value of instance.itemsPerPage.
     */
    PaginationService.prototype.setItemsPerPage = function (id, itemsPerPage) {
        if (this.instances[id]) {
            this.instances[id].itemsPerPage = itemsPerPage;
            this.change.emit(id);
        }
    };
    /**
     * Returns a clone of the pagination instance object matching the id. If no
     * id specified, returns the instance corresponding to the default id.
     */
    PaginationService.prototype.getInstance = function (id) {
        if (id === void 0) {
            id = this.DEFAULT_ID;
        }
        if (this.instances[id]) {
            return this.clone(this.instances[id]);
        }
        return {};
    };
    /**
     * Perform a shallow clone of an object.
     */
    PaginationService.prototype.clone = function (obj) {
        var target = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                target[i] = obj[i];
            }
        }
        return target;
    };
    return PaginationService;
}());
var LARGE_NUMBER = Number.MAX_SAFE_INTEGER;
var PaginatePipe = (function () {
    function PaginatePipe(service) {
        this.service = service;
        // store the values from the last time the pipe was invoked
        this.state = {};
    }
    PaginatePipe.prototype.transform = function (collection, args) {
        // When an observable is passed through the AsyncPipe, it will output
        // `null` until the subscription resolves. In this case, we want to
        // use the cached data from the `state` object to prevent the NgFor
        // from flashing empty until the real values arrive.
        if (args instanceof Array) {
            // compatible with angular2 before beta16
            args = args[0];
        }
        if (!(collection instanceof Array)) {
            var _id = args.id || this.service.defaultId;
            if (this.state[_id]) {
                return this.state[_id].slice;
            }
            else {
                return collection;
            }
        }
        var serverSideMode = args.totalItems && args.totalItems !== collection.length;
        var instance = this.createInstance(collection, args);
        var id = instance.id;
        var start, end;
        var perPage = instance.itemsPerPage;
        this.service.register(instance);
        if (!serverSideMode && collection instanceof Array) {
            perPage = +perPage || LARGE_NUMBER;
            start = (instance.currentPage - 1) * perPage;
            end = start + perPage;
            var isIdentical = this.stateIsIdentical(id, collection, start, end);
            if (isIdentical) {
                return this.state[id].slice;
            }
            else {
                var slice = collection.slice(start, end);
                this.saveState(id, collection, slice, start, end);
                this.service.change.emit(id);
                return slice;
            }
        }
        // save the state for server-side collection to avoid null
        // flash as new data loads.
        this.saveState(id, collection, collection, start, end);
        return collection;
    };
    /**
     * Create an PaginationInstance object, using defaults for any optional properties not supplied.
     */
    PaginatePipe.prototype.createInstance = function (collection, args) {
        var config = args;
        this.checkConfig(config);
        return {
            id: config.id || this.service.defaultId(),
            itemsPerPage: +config.itemsPerPage || 0,
            currentPage: +config.currentPage || 1,
            totalItems: +config.totalItems || collection.length
        };
    };
    /**
     * Ensure the argument passed to the filter contains the required properties.
     */
    PaginatePipe.prototype.checkConfig = function (config) {
        var required = ['itemsPerPage', 'currentPage'];
        var missing = required.filter(function (prop) { return !(prop in config); });
        if (0 < missing.length) {
            throw new Error("PaginatePipe: Argument is missing the following required properties: " + missing.join(', '));
        }
    };
    /**
     * To avoid returning a brand new array each time the pipe is run, we store the state of the sliced
     * array for a given id. This means that the next time the pipe is run on this collection & id, we just
     * need to check that the collection, start and end points are all identical, and if so, return the
     * last sliced array.
     */
    PaginatePipe.prototype.saveState = function (id, collection, slice, start, end) {
        this.state[id] = {
            collection: collection,
            size: collection.length,
            slice: slice,
            start: start,
            end: end
        };
    };
    /**
     * For a given id, returns true if the collection, size, start and end values are identical.
     */
    PaginatePipe.prototype.stateIsIdentical = function (id, collection, start, end) {
        var state = this.state[id];
        if (!state) {
            return false;
        }
        var isMetaDataIdentical = state.size === collection.length &&
            state.start === start &&
            state.end === end;
        if (!isMetaDataIdentical) {
            return false;
        }
        return state.slice.every(function (element, index) { return element === collection[start + index]; });
    };
    PaginatePipe.decorators = [
        { type: Pipe, args: [{
                    name: 'paginate',
                    pure: false
                },] },
    ];
    /** @nocollapse */
    PaginatePipe.ctorParameters = function () {
        return [
            { type: PaginationService, },
        ];
    };
    return PaginatePipe;
}());
/**
 * The default template and styles for the pagination links are borrowed directly
 * from Zurb Foundation 6: http://foundation.zurb.com/sites/docs/pagination.html
 */
var DEFAULT_TEMPLATE = "\n    <pagination-template  #p=\"paginationApi\"\n                         [id]=\"id\"\n                         [maxSize]=\"maxSize\"\n                         (pageChange)=\"pageChange.emit($event)\">\n    <ul class=\"ngx-pagination\" \n        role=\"navigation\" \n        [attr.aria-label]=\"screenReaderPaginationLabel\" \n        *ngIf=\"!(autoHide && p.pages.length <= 1)\">\n\n        <li class=\"pagination-previous\" [class.disabled]=\"p.isFirstPage()\" *ngIf=\"directionLinks\"> \n            <a *ngIf=\"1 < p.getCurrent()\" (click)=\"p.previous()\" [attr.aria-label]=\"previousLabel + ' ' + screenReaderPageLabel\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isFirstPage()\">\n                {{ previousLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li>\n\n        <li [class.current]=\"p.getCurrent() === page.value\" *ngFor=\"let page of p.pages\">\n            <a (click)=\"p.setCurrent(page.value)\" *ngIf=\"p.getCurrent() !== page.value\">\n                <span class=\"show-for-sr\">{{ screenReaderPageLabel }} </span>\n                <span>{{ page.label }}</span>\n            </a>\n            <div *ngIf=\"p.getCurrent() === page.value\">\n                <span class=\"show-for-sr\">{{ screenReaderCurrentLabel }} </span>\n                <span>{{ page.label }}</span> \n            </div>\n        </li>\n\n        <li class=\"pagination-next\" [class.disabled]=\"p.isLastPage()\" *ngIf=\"directionLinks\">\n            <a *ngIf=\"!p.isLastPage()\" (click)=\"p.next()\" [attr.aria-label]=\"nextLabel + ' ' + screenReaderPageLabel\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </a>\n            <span *ngIf=\"p.isLastPage()\">\n                 {{ nextLabel }} <span class=\"show-for-sr\">{{ screenReaderPageLabel }}</span>\n            </span>\n        </li>\n\n    </ul>\n    </pagination-template>\n    ";
var DEFAULT_STYLES = "\n.ngx-pagination {\n  margin-left: 0;\n  margin-bottom: 1rem; }\n  .ngx-pagination::before, .ngx-pagination::after {\n    content: ' ';\n    display: table; }\n  .ngx-pagination::after {\n    clear: both; }\n  .ngx-pagination li {\n    -moz-user-select: none;\n    -webkit-user-select: none;\n    -ms-user-select: none;\n    margin-right: 0.0625rem;\n    border-radius: 0; }\n  .ngx-pagination li {\n    display: inline-block; }\n  .ngx-pagination a,\n  .ngx-pagination button {\n    color: #0a0a0a; \n    display: block;\n    padding: 0.1875rem 0.625rem;\n    border-radius: 0; }\n    .ngx-pagination a:hover,\n    .ngx-pagination button:hover {\n      background: #e6e6e6; }\n  .ngx-pagination .current {\n    padding: 0.1875rem 0.625rem;\n    background: #2199e8;\n    color: #fefefe;\n    cursor: default; }\n  .ngx-pagination .disabled {\n    padding: 0.1875rem 0.625rem;\n    color: #cacaca;\n    cursor: default; } \n    .ngx-pagination .disabled:hover {\n      background: transparent; }\n  .ngx-pagination .ellipsis::after {\n    content: '\u2026';\n    padding: 0.1875rem 0.625rem;\n    color: #0a0a0a; }\n  .ngx-pagination a, .ngx-pagination button {\n    cursor: pointer; }\n\n.ngx-pagination .pagination-previous a::before,\n.ngx-pagination .pagination-previous.disabled::before { \n  content: '\u00AB';\n  display: inline-block;\n  margin-right: 0.5rem; }\n\n.ngx-pagination .pagination-next a::after,\n.ngx-pagination .pagination-next.disabled::after {\n  content: '\u00BB';\n  display: inline-block;\n  margin-left: 0.5rem; }\n\n.ngx-pagination .show-for-sr {\n  position: absolute !important;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0); }";
/**
 * The default pagination controls component. Actually just a default implementation of a custom template.
 */
var PaginationControlsComponent = (function () {
    function PaginationControlsComponent() {
        this.maxSize = 7;
        this.previousLabel = 'Previous';
        this.nextLabel = 'Next';
        this.screenReaderPaginationLabel = 'Pagination';
        this.screenReaderPageLabel = 'page';
        this.screenReaderCurrentLabel = "You're on page";
        this.pageChange = new EventEmitter();
        this._directionLinks = true;
        this._autoHide = false;
    }
    Object.defineProperty(PaginationControlsComponent.prototype, "directionLinks", {
        get: function () {
            return this._directionLinks;
        },
        set: function (value) {
            this._directionLinks = !!value && value !== 'false';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaginationControlsComponent.prototype, "autoHide", {
        get: function () {
            return this._autoHide;
        },
        set: function (value) {
            this._autoHide = !!value && value !== 'false';
        },
        enumerable: true,
        configurable: true
    });
    PaginationControlsComponent.decorators = [
        { type: Component, args: [{
                    selector: 'pagination-controls',
                    template: DEFAULT_TEMPLATE,
                    styles: [DEFAULT_STYLES],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                },] },
    ];
    /** @nocollapse */
    PaginationControlsComponent.ctorParameters = function () { return []; };
    PaginationControlsComponent.propDecorators = {
        'id': [{ type: Input },],
        'maxSize': [{ type: Input },],
        'directionLinks': [{ type: Input },],
        'autoHide': [{ type: Input },],
        'previousLabel': [{ type: Input },],
        'nextLabel': [{ type: Input },],
        'screenReaderPaginationLabel': [{ type: Input },],
        'screenReaderPageLabel': [{ type: Input },],
        'screenReaderCurrentLabel': [{ type: Input },],
        'pageChange': [{ type: Output },],
    };
    return PaginationControlsComponent;
}());
/**
 * This directive is what powers all pagination controls components, including the default one.
 * It exposes an API which is hooked up to the PaginationService to keep the PaginatePipe in sync
 * with the pagination controls.
 */
var PaginationControlsDirective = (function () {
    function PaginationControlsDirective(service, changeDetectorRef) {
        var _this = this;
        this.service = service;
        this.changeDetectorRef = changeDetectorRef;
        this.maxSize = 7;
        this.pageChange = new EventEmitter();
        this.pages = [];
        this.changeSub = this.service.change
            .subscribe(function (id) {
            if (_this.id === id) {
                _this.updatePageLinks();
                _this.changeDetectorRef.markForCheck();
                _this.changeDetectorRef.detectChanges();
            }
        });
    }
    PaginationControlsDirective.prototype.ngOnInit = function () {
        if (this.id === undefined) {
            this.id = this.service.defaultId();
        }
        this.updatePageLinks();
    };
    PaginationControlsDirective.prototype.ngOnChanges = function (changes) {
        this.updatePageLinks();
    };
    PaginationControlsDirective.prototype.ngOnDestroy = function () {
        this.changeSub.unsubscribe();
    };
    /**
     * Go to the previous page
     */
    PaginationControlsDirective.prototype.previous = function () {
        this.checkValidId();
        this.setCurrent(this.getCurrent() - 1);
    };
    /**
     * Go to the next page
     */
    PaginationControlsDirective.prototype.next = function () {
        this.checkValidId();
        this.setCurrent(this.getCurrent() + 1);
    };
    /**
     * Returns true if current page is first page
     */
    PaginationControlsDirective.prototype.isFirstPage = function () {
        return this.getCurrent() === 1;
    };
    /**
     * Returns true if current page is last page
     */
    PaginationControlsDirective.prototype.isLastPage = function () {
        return this.getLastPage() === this.getCurrent();
    };
    /**
     * Set the current page number.
     */
    PaginationControlsDirective.prototype.setCurrent = function (page) {
        this.pageChange.emit(page);
    };
    /**
     * Get the current page number.
     */
    PaginationControlsDirective.prototype.getCurrent = function () {
        return this.service.getCurrentPage(this.id);
    };
    /**
     * Returns the last page number
     */
    PaginationControlsDirective.prototype.getLastPage = function () {
        var inst = this.service.getInstance(this.id);
        if (inst.totalItems < 1) {
            // when there are 0 or fewer (an error case) items, there are no "pages" as such,
            // but it makes sense to consider a single, empty page as the last page.
            return 1;
        }
        return Math.ceil(inst.totalItems / inst.itemsPerPage);
    };
    PaginationControlsDirective.prototype.checkValidId = function () {
        if (!this.service.getInstance(this.id).id) {
            console.warn("PaginationControlsDirective: the specified id \"" + this.id + "\" does not match any registered PaginationInstance");
        }
    };
    /**
     * Updates the page links and checks that the current page is valid. Should run whenever the
     * PaginationService.change stream emits a value matching the current ID, or when any of the
     * input values changes.
     */
    PaginationControlsDirective.prototype.updatePageLinks = function () {
        var _this = this;
        var inst = this.service.getInstance(this.id);
        var correctedCurrentPage = this.outOfBoundCorrection(inst);
        if (correctedCurrentPage !== inst.currentPage) {
            setTimeout(function () {
                _this.setCurrent(correctedCurrentPage);
                _this.pages = _this.createPageArray(inst.currentPage, inst.itemsPerPage, inst.totalItems, _this.maxSize);
            });
        }
        else {
            this.pages = this.createPageArray(inst.currentPage, inst.itemsPerPage, inst.totalItems, this.maxSize);
        }
    };
    /**
     * Checks that the instance.currentPage property is within bounds for the current page range.
     * If not, return a correct value for currentPage, or the current value if OK.
     */
    PaginationControlsDirective.prototype.outOfBoundCorrection = function (instance) {
        var totalPages = Math.ceil(instance.totalItems / instance.itemsPerPage);
        if (totalPages < instance.currentPage && 0 < totalPages) {
            return totalPages;
        }
        else if (instance.currentPage < 1) {
            return 1;
        }
        return instance.currentPage;
    };
    /**
     * Returns an array of Page objects to use in the pagination controls.
     */
    PaginationControlsDirective.prototype.createPageArray = function (currentPage, itemsPerPage, totalItems, paginationRange) {
        // paginationRange could be a string if passed from attribute, so cast to number.
        paginationRange = +paginationRange;
        var pages = [];
        var totalPages = Math.ceil(totalItems / itemsPerPage);
        var halfWay = Math.ceil(paginationRange / 2);
        var isStart = currentPage <= halfWay;
        var isEnd = totalPages - halfWay < currentPage;
        var isMiddle = !isStart && !isEnd;
        var ellipsesNeeded = paginationRange < totalPages;
        var i = 1;
        while (i <= totalPages && i <= paginationRange) {
            var label = void 0;
            var pageNumber = this.calculatePageNumber(i, currentPage, paginationRange, totalPages);
            var openingEllipsesNeeded = (i === 2 && (isMiddle || isEnd));
            var closingEllipsesNeeded = (i === paginationRange - 1 && (isMiddle || isStart));
            if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                label = '...';
            }
            else {
                label = pageNumber;
            }
            pages.push({
                label: label,
                value: pageNumber
            });
            i++;
        }
        return pages;
    };
    /**
     * Given the position in the sequence of pagination links [i],
     * figure out what page number corresponds to that position.
     */
    PaginationControlsDirective.prototype.calculatePageNumber = function (i, currentPage, paginationRange, totalPages) {
        var halfWay = Math.ceil(paginationRange / 2);
        if (i === paginationRange) {
            return totalPages;
        }
        else if (i === 1) {
            return i;
        }
        else if (paginationRange < totalPages) {
            if (totalPages - halfWay < currentPage) {
                return totalPages - paginationRange + i;
            }
            else if (halfWay < currentPage) {
                return currentPage - halfWay + i;
            }
            else {
                return i;
            }
        }
        else {
            return i;
        }
    };
    PaginationControlsDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'pagination-template,[pagination-template]',
                    exportAs: 'paginationApi'
                },] },
    ];
    /** @nocollapse */
    PaginationControlsDirective.ctorParameters = function () {
        return [
            { type: PaginationService, },
            { type: ChangeDetectorRef, },
        ];
    };
    PaginationControlsDirective.propDecorators = {
        'id': [{ type: Input },],
        'maxSize': [{ type: Input },],
        'pageChange': [{ type: Output },],
    };
    return PaginationControlsDirective;
}());
var NgxPaginationModule = (function () {
    function NgxPaginationModule() {
    }
    NgxPaginationModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    declarations: [
                        PaginatePipe,
                        PaginationControlsComponent,
                        PaginationControlsDirective
                    ],
                    providers: [PaginationService],
                    exports: [PaginatePipe, PaginationControlsComponent, PaginationControlsDirective]
                },] },
    ];
    /** @nocollapse */
    NgxPaginationModule.ctorParameters = function () { return []; };
    return NgxPaginationModule;
}());
var BaseModule = (function () {
    function BaseModule() {
    }
    return BaseModule;
}());
BaseModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    BaseComponent,
                    GlobalSearchComponent,
                    CsvExportComponent,
                    HeaderComponent,
                    PaginationComponent,
                    SearchPipe,
                    GlobalSearchPipe
                ],
                imports: [
                    CommonModule,
                    NgxPaginationModule
                ],
                exports: [BaseComponent]
            },] },
];
/**
 * @nocollapse
 */
BaseModule.ctorParameters = function () { return []; };
var TableModule = (function () {
    function TableModule() {
    }
    return TableModule;
}());
TableModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    BaseModule,
                ],
                bootstrap: [BaseComponent],
                exports: [BaseComponent],
                providers: []
            },] },
];
/**
 * @nocollapse
 */
TableModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { TableModule, BaseComponent as ɵb, BaseModule as ɵa, CsvExportComponent as ɵg, GlobalSearchComponent as ɵf, HeaderComponent as ɵh, PaginationComponent as ɵi, GlobalSearchPipe as ɵk, SearchPipe as ɵj, ConfigService as ɵe, LoggerService as ɵd, ResourceService as ɵc };
//# sourceMappingURL=ngx-easy-table.es5.js.map
