import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Directive, EventEmitter, Injectable, Input, NgModule, Output, Pipe, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Observable as Observable$1 } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/groupBy';
import { CommonModule } from '@angular/common';

class ResourceService {
    constructor() {
        this.data = [];
        this.order = [];
    }
    /**
     * @param {?} key
     * @return {?}
     */
    sortBy(key) {
        this.key = key;
        if (Object.keys(this.order).length === 0) {
            this.order[this.key] = 'asc';
        }
        if (this.order[this.key] === 'asc') {
            this.order = [];
            this.order[this.key] = 'desc';
            this.data.sort((a, b) => this.compare(a, b));
        }
        else {
            this.order = [];
            this.order[this.key] = 'asc';
            this.data.sort((a, b) => this.compare(b, a));
        }
        return this.data;
    }
    /**
     * @param {?} a
     * @param {?} b
     * @return {?}
     */
    compare(a, b) {
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
    }
}
ResourceService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
ResourceService.ctorParameters = () => [];

class ConfigService {
}
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
ConfigService.ctorParameters = () => [];

let Event = {};
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

class LoggerService {
    /**
     * @param {?=} message
     * @return {?}
     */
    error(message) {
        console.error(message);
    }
    /**
     * @param {?=} message
     * @return {?}
     */
    warn(message) {
        console.warn(message);
    }
    /**
     * @param {?=} message
     * @return {?}
     */
    info(message) {
        console.log(message);
    }
    /**
     * @param {?=} message
     * @return {?}
     */
    debug(message) {
        console.log(message);
    }
    /**
     * @param {?=} message
     * @return {?}
     */
    log(message) {
        console.log(message);
    }
}
LoggerService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
LoggerService.ctorParameters = () => [];

class BaseComponent {
    /**
     * @param {?} resource
     * @param {?} cdr
     * @param {?} logger
     */
    constructor(resource, cdr, logger) {
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
    ngOnInit() {
        if (this.configuration) {
            ConfigService.config = this.configuration;
        }
        this.config = ConfigService.config;
        this.limit = this.configuration.rows;
        if (this.groupRowsBy) {
            Observable$1
                .from(this.data)
                .groupBy(row => row[this.groupRowsBy])
                .flatMap(group => group.reduce((acc, curr) => [...acc, curr], []))
                .subscribe(row => this.grouped.push(row));
        }
    }
    /**
     * @return {?}
     */
    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        const /** @type {?} */ data = changes.data;
        const /** @type {?} */ pagination = changes.pagination;
        if (data && data.currentValue) {
            this.data = [...data.currentValue];
        }
        if (pagination && pagination.currentValue) {
            this.count = pagination.currentValue.count;
        }
    }
    /**
     * @param {?} key
     * @return {?}
     */
    orderBy(key) {
        if (ConfigService.config.orderEnabled || !ConfigService.config.serverPagination) {
            this.data = this.resource.sortBy(key);
            this.data = [...this.data];
        }
        this.onOrder(key);
    }
    /**
     * @param {?} $event
     * @param {?} row
     * @param {?} key
     * @param {?} colIndex
     * @param {?} rowIndex
     * @return {?}
     */
    clickedCell($event, row, key, colIndex, rowIndex) {
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
            const /** @type {?} */ value = {
                event: $event,
                row: row,
                key: key,
                rowId: rowIndex,
                colId: colIndex
            };
            this.emitEvent(Event.onClick, value);
        }
    }
    /**
     * @param {?} colIndex
     * @return {?}
     */
    toggleColumn(colIndex) {
        const /** @type {?} */ toggleColumns = new Set(this.columns);
        if (toggleColumns.has(colIndex)) {
            toggleColumns.delete(colIndex);
        }
        else {
            toggleColumns.add(colIndex);
        }
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onSearch($event) {
        if (!ConfigService.config.serverPagination) {
            this.term = $event;
        }
        this.emitEvent(Event.onSearch, $event);
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onGlobalSearch($event) {
        if (!ConfigService.config.serverPagination) {
            this.globalSearchTerm = $event;
        }
        this.emitEvent(Event.onGlobalSearch, $event);
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onPagination($event) {
        this.page = $event.page;
        this.limit = $event.limit;
        this.emitEvent(Event.onPagination, $event);
    }
    /**
     * @param {?} key
     * @return {?}
     */
    onOrder(key) {
        const /** @type {?} */ value = {
            key,
            order: this.resource.order[key]
        };
        this.emitEvent(Event.onOrder, value);
    }
    /**
     * @param {?} event
     * @param {?} value
     * @return {?}
     */
    emitEvent(event, value) {
        this.event.emit({ event: Event[event], value });
    }
    /**
     * @param {?} rowIndex
     * @return {?}
     */
    selectRowId(rowIndex) {
        if (this.selectedDetailsTemplateRowId === rowIndex) {
            this.selectedDetailsTemplateRowId = null;
        }
        else {
            this.selectedDetailsTemplateRowId = rowIndex;
        }
    }
}
BaseComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-table',
                providers: [ResourceService, LoggerService, ConfigService],
                template: `
    <div class="ngx-container">
      <div class="ngx-columns">
        <div class="ngx-column ngx-col-4 ngx-col-mr-auto"></div>
        <div class="ngx-column ngx-col-3">
          <global-search
            *ngIf="config.globalSearchEnabled"
            (globalUpdate)="onGlobalSearch($event)">
          </global-search>
        </div>
      </div>
      <div class="ngx-columns">
        <table class="ngx-table ngx-table-striped ngx-table-hover">
          <thead>
          <tr class="ngx-table__header" *ngIf="config.headerEnabled">
            <ng-container *ngFor="let column of columns">
              <th class="ngx-table__header-cell"
                  (click)="orderBy(column['key'])">
                <div class="ngx-d-inline">{{ column['title'] }}</div>
                <span *ngIf="resource.order[column['key']]==='asc' "
                      [style.display]="config.orderEnabled?'':'none' "
                      class="ngx-icon ngx-icon-arrow-up">
                </span>
                <span *ngIf="resource.order[column['key']]==='desc' "
                      [style.display]="config.orderEnabled?'':'none' "
                      class="ngx-icon ngx-icon-arrow-down">
                </span>
              </th>
            </ng-container>
            <th *ngIf="config.additionalActions || config.detailsTemplate"
                class="ngx-table__header-cell-additional-actions">
              <div class="ngx-dropdown ngx-active ngx-dropdown-right"
                   *ngIf="config.additionalActions"
                   [class.ngx-active]="menuActive">
                <a class="ngx-btn ngx-btn-link" (click)="menuActive = !menuActive">
                  <span class="ngx-icon ngx-icon-menu"></span>
                </a>
                <ul class="ngx-menu ngx-table__table-menu">
                  <li class="ngx-menu-item">
                    <csv-export *ngIf="config.exportEnabled"></csv-export>
                  </li>
                </ul>
              </div>
            </th>
          </tr>
          <tr *ngIf="config.searchEnabled"
              class="ngx-table__sortHeader">
            <ng-container *ngFor="let column of columns">
              <th>
                <table-header (update)="onSearch($event)" [column]="column"></table-header>
              </th>
            </ng-container>
            <th *ngIf="config.additionalActions || config.detailsTemplate"></th>
          </tr>
          </thead>
          <tbody *ngIf="data && !config.isLoading">

            <ng-container *ngIf="!rowTemplate && !config.groupRows">
              <ng-container
                *ngFor="let row of data | search : term | global : globalSearchTerm | paginate: { itemsPerPage: limit, currentPage: page, totalItems: count, id: id };
                        let rowIndex = index"
                [class.ngx-table__table-row--selected]="rowIndex == selectedRow && !config.selectCell">
                <tr>
                  <ng-container *ngFor="let column of columns; let colIndex = index">
                    <td (click)="clickedCell($event, row, column['key'], colIndex, rowIndex)"
                        [class.ngx-table__table-col--selected]="colIndex == selectedCol && !config.selectCell"
                        [class.ngx-table__table-cell--selected]="colIndex == selectedCol && rowIndex == selectedRow && !config.selectCol && !config.selectRow"
                    >
                      <div>{{ row[column['key']] }}</div>
                    </td>
                  </ng-container>
                  <td *ngIf="config.additionalActions || config.detailsTemplate">
                    <span class="ngx-icon ngx-c-hand"
                          [class.ngx-icon-arrow-down]="selectedDetailsTemplateRowId === rowIndex"
                          [class.ngx-icon-arrow-right]="selectedDetailsTemplateRowId !== rowIndex"
                          (click)="selectRowId(rowIndex)">
                    </span>
                  </td>
                </tr>
                <tr *ngIf="config.detailsTemplate && selectedDetailsTemplateRowId === rowIndex">
                  <td [attr.colspan]="columns.length + 1">
                    <ng-container
                      [ngTemplateOutlet]="detailsTemplate"
                      [ngTemplateOutletContext]="{ $implicit: row }">
                    </ng-container>
                  </td>
                </tr>
              </ng-container>
            </ng-container>

            <ng-container *ngIf="rowTemplate">
              <ng-container *ngFor="let row of data | search : term | global : globalSearchTerm | paginate: { itemsPerPage: limit, currentPage: page, totalItems: count, id: id };
                    let rowIndex = index">
                <tr
                    (click)="clickedCell($event, row, '', '', rowIndex)"
                    [class.ngx-table__table-row--selected]="rowIndex == selectedRow && !config.selectCell">
                  <ng-container [ngTemplateOutlet]="rowTemplate"
                                [ngTemplateOutletContext]="{ $implicit: row }">
                  </ng-container>
                  <td *ngIf="config.additionalActions || config.detailsTemplate">
                    <span class="ngx-icon ngx-c-hand"
                          [class.ngx-icon-arrow-down]="selectedDetailsTemplateRowId === rowIndex"
                          [class.ngx-icon-arrow-right]="selectedDetailsTemplateRowId !== rowIndex"
                          (click)="selectRowId(rowIndex)">
                    </span>
                  </td>
                </tr>
                <tr *ngIf="config.detailsTemplate && selectedDetailsTemplateRowId === rowIndex">
                  <td [attr.colspan]="columns.length + 1">
                    <ng-container
                      [ngTemplateOutlet]="detailsTemplate"
                      [ngTemplateOutletContext]="{ $implicit: row }">
                    </ng-container>
                  </td>
                </tr>
              </ng-container>
            </ng-container>

            <ng-container *ngIf="!rowTemplate && config.groupRows">
              <ng-container
                *ngFor="let group of grouped; let rowIndex = index">
                <tr>
                  <td [attr.colspan]="columns.length">
                    <div>{{group[0][groupRowsBy]}} ({{group.length}})</div>
                  </td>
                  <td>
                    <span class="ngx-icon ngx-c-hand"
                          [class.ngx-icon-arrow-down]="selectedDetailsTemplateRowId === rowIndex"
                          [class.ngx-icon-arrow-right]="selectedDetailsTemplateRowId !== rowIndex"
                          (click)="selectRowId(rowIndex)">
                    </span>
                  </td>
                </tr>
                <ng-container *ngIf="selectedDetailsTemplateRowId === rowIndex">
                  <tr *ngFor="let row of group">
                    <td *ngFor="let column of columns">
                      {{row[column['key']]}}
                      <!-- TODO allow users to add groupRowsTemplateRef -->
                    </td>
                    <td></td>
                  </tr>
                </ng-container>
              </ng-container>
            </ng-container>


          </tbody>
          <tbody *ngIf="!data">
          <tr class="ngx-table__body-empty">
            <td>No results</td>
          </tr>
          </tbody>
          <tbody *ngIf="config.isLoading">
          <tr class="ngx-table__body-loading">
            <td>
              <div class="ngx-table__table-loader"></div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <pagination
        *ngIf="config.paginationEnabled"
        [id]="id"
        [pagination]="pagination"
        (updateRange)="onPagination($event)">
      </pagination>
    </div>
  `,
                styles: [`
    * {
      font-family: Verdana, serif;
    }

    .ngx-table__table-row--selected {
      background: #9cbff9 !important;
    }

    .ngx-table__table-col--selected {
      background: #9cbff9 !important;
    }

    .ngx-table__table-cell--selected {
      background: #9cbff9 !important;
    }
    .ngx-table__table-loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      height: 20px;
      width: 20px;
      margin-left: auto;
      margin-right: auto;
      -webkit-animation: spin 1s linear infinite;
              animation: spin 1s linear infinite;
    }

    @-webkit-keyframes spin {
      0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
    }

    @keyframes spin {
      0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }
      100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
    }
  `],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
BaseComponent.ctorParameters = () => [
    { type: ResourceService, },
    { type: ChangeDetectorRef, },
    { type: LoggerService, },
];
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

class GlobalSearchComponent {
    constructor() {
        this.globalUpdate = new EventEmitter();
    }
}
GlobalSearchComponent.decorators = [
    { type: Component, args: [{
                selector: 'global-search',
                template: `
    <label class="form-label ngx-float-right" for="search">
      <input type="text"
             id="search"
             class="ngx-table__global-search ngx-form-input ngx-input-sm"
             #input
             (input)="globalUpdate.emit({value: input.value})"
             placeholder="Search"/>
    </label>
  `
            },] },
];
/**
 * @nocollapse
 */
GlobalSearchComponent.ctorParameters = () => [];
GlobalSearchComponent.propDecorators = {
    'globalUpdate': [{ type: Output },],
};

class GlobalSearchPipe {
    /**
     * @param {?} resource
     */
    constructor(resource) {
        this.resource = resource;
    }
    /**
     * @param {?} dataArr
     * @param {?} filter
     * @return {?}
     */
    transform(dataArr, filter) {
        if (typeof dataArr === 'undefined') {
            return;
        }
        if (typeof filter === 'undefined' || Object.keys(filter).length === 0 || filter === '') {
            return dataArr;
        }
        this.resource.data = [];
        dataArr.forEach((row) => {
            for (const /** @type {?} */ value in row) {
                if (row.hasOwnProperty(value)) {
                    let /** @type {?} */ element;
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
                        this.resource.data.push(row);
                        return;
                    }
                }
            }
        });
        return this.resource.data;
    }
}
GlobalSearchPipe.decorators = [
    { type: Pipe, args: [{
                name: 'global'
            },] },
];
/**
 * @nocollapse
 */
GlobalSearchPipe.ctorParameters = () => [
    { type: ResourceService, },
];

class SearchPipe {
    /**
     * @param {?} resource
     */
    constructor(resource) {
        this.resource = resource;
    }
    /**
     * @param {?} value
     * @param {?} filters
     * @return {?}
     */
    transform(value, filters) {
        if (typeof value === 'undefined') {
            return;
        }
        this.resource.data = value.slice();
        if (typeof filters === 'undefined' || Object.keys(filters).length === 0) {
            return this.resource.data;
        }
        const /** @type {?} */ filtersArr = [];
        filtersArr[filters.key] = filters.value;
        value.forEach((item) => {
            for (const /** @type {?} */ filterKey in filtersArr) {
                if (filtersArr.hasOwnProperty(filterKey)) {
                    let /** @type {?} */ element = '';
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
                        this.resource.data.splice(this.resource.data.indexOf(item), 1);
                        return;
                    }
                }
            }
        });
        return this.resource.data;
    }
}
SearchPipe.decorators = [
    { type: Pipe, args: [{
                name: 'search'
            },] },
];
/**
 * @nocollapse
 */
SearchPipe.ctorParameters = () => [
    { type: ResourceService, },
];

class HeaderComponent {
    constructor() {
        this.update = new EventEmitter();
    }
}
HeaderComponent.decorators = [
    { type: Component, args: [{
                selector: 'table-header',
                template: `
    <label for="search_{{ column['key'] }}">
      <input type="text"
             id="search_{{ column['key'] }}"
             aria-label="Search"
             placeholder="Search {{ column['title'] }}"
             class="ngx-table__header-search ngx-form-input ngx-input-sm"
             #input
             (input)="update.emit({value: input.value, key: column['key']})"
      >
    </label>`
            },] },
];
/**
 * @nocollapse
 */
HeaderComponent.ctorParameters = () => [];
HeaderComponent.propDecorators = {
    'column': [{ type: Input },],
    'update': [{ type: Output },],
};

class PaginationComponent {
    constructor() {
        this.updateRange = new EventEmitter();
        this.ranges = [5, 10, 25, 50, 100];
        this.limit = ConfigService.config.rows;
        this.showRange = false;
    }
    /**
     * @param {?} $event
     * @return {?}
     */
    onPageChange($event) {
        this.updateRange.emit({
            page: $event,
            limit: this.limit
        });
    }
    /**
     * @param {?} limit
     * @return {?}
     */
    changeLimit(limit) {
        this.showRange = !this.showRange;
        this.limit = limit;
        this.updateRange.emit({
            page: 1,
            limit: limit
        });
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.config = ConfigService.config;
    }
}
PaginationComponent.decorators = [
    { type: Component, args: [{
                selector: 'pagination',
                template: `
    <div class="ngx-columns">
      <div class="ngx-col-mr-auto pagination-mobile">
        <pagination-controls
          [id]="id"
          [maxSize]="5"
          [previousLabel]="''"
          [nextLabel]="''"
          (pageChange)="onPageChange($event)">
        </pagination-controls>
      </div>
      <div class="pagination-mobile" *ngIf="config.paginationRangeEnabled">
        <div class="ngx-dropdown ngx-range-dropdown ngx-float-right"
             [class.ngx-active]="showRange"
             id="rowAmount">
          <div class="ngx-btn-group">
            <span class="ngx-btn ngx-range-dropdown-button"
                  (click)="showRange = !showRange">
              {{limit}} <i class="ngx-icon ngx-icon-arrow-down"></i>
            </span>
            <ul class="ngx-menu">
              <li class="ngx-c-hand ngx-range-dropdown-button"
                  (click)="changeLimit(limit)"
                  *ngFor="let limit of ranges">
                <span>{{limit}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
                styles: [`
    :host /deep/ pagination-controls > pagination-template > ul > li {
      border: 1px solid #f0f0f0;
    }
    @media screen and (max-width: 480px) {
      .pagination-mobile {
        margin-right: auto;
        margin-left: auto;
      }
    }

    .ngx-btn {
      color: #4f596c;
      border: 1px solid #f0f0f0;
    }

    .ngx-range-dropdown {
      margin-top: 16px;
    }

    .ngx-range-dropdown-button {
      padding: 4px;
    }

    .ngx-menu {
      min-width: 55px;
    }
  `],
                changeDetection: ChangeDetectionStrategy.OnPush
            },] },
];
/**
 * @nocollapse
 */
PaginationComponent.ctorParameters = () => [];
PaginationComponent.propDecorators = {
    'pagination': [{ type: Input },],
    'id': [{ type: Input },],
    'updateRange': [{ type: Output },],
};

class CsvExportComponent {
    /**
     * @param {?} resource
     */
    constructor(resource) {
        this.resource = resource;
    }
    /**
     * @return {?}
     */
    exportCsv() {
        const /** @type {?} */ data = this.resource.data;
        let /** @type {?} */ csvContent = 'data:text/csv;charset=utf-8,';
        let /** @type {?} */ dataString = '';
        const /** @type {?} */ x = [];
        const /** @type {?} */ keys = Object.keys(this.resource.data[0]);
        data.forEach((row, index) => {
            x[index] = [];
            keys.forEach((i) => {
                if (row.hasOwnProperty(i)) {
                    if (typeof row[i] === 'object') {
                        row[i] = 'Object'; // so far just change object to "Object" string
                    }
                    x[index].push(row[i]);
                }
            });
        });
        csvContent += keys + '\n';
        x.forEach((row, index) => {
            dataString = row.join(',');
            csvContent += index < data.length ? dataString + '\n' : dataString;
        });
        const /** @type {?} */ encodedUri = encodeURI(csvContent);
        const /** @type {?} */ link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'my_data.csv');
        link.click();
    }
}
CsvExportComponent.decorators = [
    { type: Component, args: [{
                selector: 'csv-export',
                template: `
    <a (click)="exportCsv()">
      CSV export
    </a>`
            },] },
];
/**
 * @nocollapse
 */
CsvExportComponent.ctorParameters = () => [
    { type: ResourceService, },
];

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
        if (id === void 0) { id = this.DEFAULT_ID; }
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
    PaginatePipe.ctorParameters = function () { return [
        { type: PaginationService, },
    ]; };
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
    PaginationControlsDirective.ctorParameters = function () { return [
        { type: PaginationService, },
        { type: ChangeDetectorRef, },
    ]; };
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

class BaseModule {
}
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
BaseModule.ctorParameters = () => [];

class TableModule {
}
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
TableModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { TableModule, BaseComponent as ɵb, BaseModule as ɵa, CsvExportComponent as ɵg, GlobalSearchComponent as ɵf, HeaderComponent as ɵh, PaginationComponent as ɵi, GlobalSearchPipe as ɵk, SearchPipe as ɵj, ConfigService as ɵe, LoggerService as ɵd, ResourceService as ɵc };
//# sourceMappingURL=ngx-easy-table.js.map
