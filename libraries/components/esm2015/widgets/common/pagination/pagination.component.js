import { Component, EventEmitter, Inject, Injector, Output, SkipSelf } from '@angular/core';
import { $appDigest, $watch, AppConstants, DataSource, debounce, isDefined, switchClass, triggerFn } from '@wm/core';
import { registerProps } from './pagination.props';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { getOrderByExpr, provideAsWidgetRef } from '../../../utils/widget-utils';
import { WidgetRef } from '../../framework/types';
import { DEBOUNCE_TIMES } from '../../framework/constants';
const DEFAULT_CLS = 'app-datanavigator clearfix';
const WIDGET_CONFIG = { widgetType: 'wm-pagination', hostClass: DEFAULT_CLS };
const sizeClasses = {
    'Pager': {
        'small': 'pager-sm',
        'large': 'pager-lg'
    },
    'Basic': {
        'small': 'pagination-sm',
        'large': 'pagination-lg'
    },
    'Classic': {
        'small': 'pagination-sm',
        'large': 'pagination-lg'
    }
};
export class PaginationComponent extends StylableComponent {
    constructor(inj, parent) {
        super(inj, WIDGET_CONFIG);
        this.parent = parent;
        this.resultEmitter = new EventEmitter();
        this.maxResultsEmitter = new EventEmitter();
        this.dn = {
            currentPage: 1
        };
        this.pageCount = 0;
        this.isDisableNext = true;
        this.isDisablePrevious = true;
        this.isDisableFirst = true;
        this.isDisableLast = true;
        this._debouncedApplyDataset = debounce(() => this.widget.dataset = this.dataset, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        this._debouncedPageChanged = debounce(event => {
            const currentPage = event && event.page;
            // Do not call goToPage if page has not changed
            if (currentPage !== this.dn.currentPage) {
                const inst = this.parent || this;
                this.dn.currentPage = currentPage;
                inst.invokeEventCallback('paginationchange', { $event: undefined, $index: this.dn.currentPage });
                this.goToPage();
            }
        }, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        styler(this.nativeElement, this);
    }
    setResult(result) {
        // TODO: Emit event only if result is changed
        this.result = result;
        this.resultEmitter.emit(this.result);
    }
    // Update navigationClass based on navigation and navigationSize props
    updateNavSize() {
        const sizeCls = sizeClasses[this.navcontrols];
        if (sizeCls && this.navigationsize) {
            this.navigationClass = sizeCls[this.navigationsize];
        }
        else {
            this.navigationClass = '';
        }
    }
    // Function to reset the paging values to default.
    resetPageNavigation() {
        this.pageCount = 0;
        this.dn.currentPage = 1;
        this.dataSize = 0;
    }
    /*Function to calculate the paging values.*/
    calculatePagingValues() {
        this.pageCount = (this.dataSize > this.maxResults) ? (Math.ceil(this.dataSize / this.maxResults)) : (this.dataSize < 0 ? 0 : 1);
        this.dn.currentPage = this.dn.currentPage || 1;
    }
    /*Function to set default values to the paging parameters*/
    setDefaultPagingValues(dataSize, maxResults, currentPage) {
        /*If neither 'dataSize' nor 'maxResults' is set, then set default values to the paging parameters.*/
        if (!dataSize && !maxResults) {
            this.pageCount = 1;
            this.dn.currentPage = 1;
            this.maxResults = dataSize;
            this.dataSize = dataSize;
        }
        else { /*Else, set the specified values and recalculate paging parameters.*/
            this.maxResults = maxResults || this.maxResults;
            this.dataSize = isDefined(dataSize) ? dataSize : this.dataSize;
            this.dn.currentPage = currentPage || this.dn.currentPage;
            this.calculatePagingValues();
        }
        this.maxResultsEmitter.emit(this.maxResults);
    }
    /*Function to check the dataSize and manipulate the navigator accordingly.*/
    checkDataSize(dataSize, numberOfElements, size) {
        /*If the dataSize is -1 or Integer.MAX_VALUE( which is 2147483647), then the total number of records is not known.
         * Hence,
         * 1. Hide the 'Total Record Count'.
         * 2. Disable the 'GoToLastPage' link as the page number of the last page is not known.*/
        if (dataSize === -1 || dataSize === AppConstants.INT_MAX_VALUE) {
            this.prevshowrecordcount = this.showrecordcount;
            this.isDisableLast = true;
            this.isDisableCount = true;
            this.showrecordcount = false;
            // If number of records in current page is less than the max records size, this is the last page. So disable next button.
            if (numberOfElements < size) {
                this.isDisableNext = true;
            }
        }
        else {
            this.isDisableCount = false;
            this.showrecordcount = this.prevshowrecordcount || this.showrecordcount;
        }
    }
    /*Function to disable navigation based on the current and total pages.*/
    disableNavigation() {
        const isCurrentPageFirst = (this.dn.currentPage === 1), isCurrentPageLast = (this.dn.currentPage === this.pageCount);
        this.isDisableFirst = this.isDisablePrevious = isCurrentPageFirst;
        this.isDisableNext = this.isDisableLast = isCurrentPageLast;
        this.isDisableCurrent = isCurrentPageFirst && isCurrentPageLast;
    }
    /*Function to check if the variable bound to the data-navigator has paging.*/
    isDataSourceHasPaging() {
        return this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE);
    }
    // Set the result for client side pagination
    setNonPageableData(newVal) {
        let dataSize, maxResults, currentPage, startIndex;
        dataSize = _.isArray(newVal) ? newVal.length : (_.isEmpty(newVal) ? 0 : 1);
        maxResults = (this.options && this.options.maxResults) || dataSize;
        // For static variable, keep the current page. For other variables without pagination reset the page to 1
        if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
            currentPage = 1;
        }
        else {
            currentPage = this.dn.currentPage || 1;
        }
        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
        this.disableNavigation();
        startIndex = (this.dn.currentPage - 1) * this.maxResults;
        this.setResult(_.isArray(newVal) ? newVal.slice(startIndex, startIndex + this.maxResults) : newVal);
    }
    /*Function to set the values needed for pagination*/
    setPagingValues(newVal) {
        let dataSize, maxResults, currentPage, dataSource;
        let variableOptions = {};
        // Store the data in __fullData. This is used for client side searching witvah out modifying the actual dataset.
        this.__fullData = newVal;
        /*Check for sanity*/
        if (this.binddataset) {
            dataSource = this.datasource || {};
            variableOptions = dataSource._options || {};
            /*Check for number of elements in the data set*/
            if (newVal) {
                if (this.isDataSourceHasPaging()) {
                    this.pagination = this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS) || {};
                    // If "filterFields" and "sortOptions" have been set, then set them so that the filters can be retained while fetching data upon page navigation.
                    this.filterFields = variableOptions.filterFields || {};
                    this.sortOptions = variableOptions.orderBy ||
                        (_.isArray(this.pagination.sort) ? getOrderByExpr(this.pagination.sort) : '');
                    dataSize = this.pagination.totalElements;
                    maxResults = this.pagination.size;
                    if (this.pagination.numberOfElements > 0) {
                        if (isDefined(this.pagination.number)) { // number is page number received from backend
                            this.dn.currentPage = this.pagination.number + 1;
                        }
                        currentPage = this.dn.currentPage || 1;
                    }
                    else {
                        currentPage = 1;
                    }
                    /* Sending pageCount undefined to calculate it again for query.*/
                    this.setDefaultPagingValues(dataSize, maxResults, currentPage);
                    this.disableNavigation();
                    this.checkDataSize(dataSize, this.pagination.numberOfElements, this.pagination.size);
                    this.setResult(newVal);
                }
                else if (!_.isString(newVal)) {
                    this.setNonPageableData(newVal);
                }
            }
            else {
                this.setResult(newVal);
                this.resetPageNavigation();
            }
        }
        else {
            if (newVal && !_.isString(newVal)) {
                this.setNonPageableData(newVal);
            }
        }
    }
    /*Function to check if the current page is the first page*/
    isFirstPage() {
        return (this.dn.currentPage === 1 || !this.dn.currentPage);
    }
    /*Function to check if the current page is the last page*/
    isLastPage() {
        return (this.dn.currentPage === this.pageCount);
    }
    /*Function to navigate to the last page*/
    goToLastPage(isRefresh, event, callback) {
        if (!this.isLastPage()) {
            this.dn.currentPage = this.pageCount;
            this.goToPage(event, callback);
        }
        else if (isRefresh) {
            this.goToPage(event, callback);
        }
    }
    /*Function to navigate to the first page*/
    goToFirstPage(isRefresh, event, callback) {
        if (!this.isFirstPage()) {
            this.dn.currentPage = 1;
            this.goToPage(event, callback);
        }
        else if (isRefresh) {
            this.goToPage(event, callback);
        }
    }
    /*Function to navigate to the current page*/
    goToPage(event, callback) {
        this.firstRow = (this.dn.currentPage - 1) * this.maxResults;
        this.getPageData(event, callback);
    }
    /*Function to be invoked after the data of the page has been fetched.*/
    onPageDataReady(event, data, callback) {
        this.disableNavigation();
        this.invokeSetRecord(event, data);
        triggerFn(callback);
    }
    /*Function to get data for the current page*/
    getPageData(event, callback) {
        let data, startIndex;
        if (this.isDataSourceHasPaging()) {
            this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'page': this.dn.currentPage,
                'filterFields': this.filterFields,
                'orderBy': this.sortOptions,
                'matchMode': 'anywhereignorecase'
            }).then(response => {
                this.onPageDataReady(event, response && response.data, callback);
                $appDigest();
            }, error => {
                // If error is undefined, do not show any message as this may be discarded request
                if (error) {
                    // TODO: Handle Error
                    // wmToaster.show('error', 'ERROR', 'Unable to get data of page -' + this.dn.currentPage + ':' + error);
                }
            });
        }
        else {
            startIndex = (this.dn.currentPage - 1) * this.maxResults;
            data = _.isArray(this.__fullData) ? this.__fullData.slice(startIndex, startIndex + this.maxResults) : this.__fullData;
            this.setResult(data);
            this.onPageDataReady(event, data, callback);
        }
    }
    invokeSetRecord(event, data) {
        // Trigger the event handler if exists.
        const pageInfo = {
            currentPage: this.dn.currentPage,
            size: this.maxResults,
            totalElements: this.dataSize,
            totalPages: this.pageCount
        };
        if (this.parent) {
            this.parent.invokeEventCallback('setrecord', { $event: event, $data: data, $index: this.dn.currentPage, pageInfo, data });
        }
        else {
            this.invokeEventCallback('setrecord', { $event: event, $data: data, $index: this.dn.currentPage, pageInfo, data });
        }
    }
    /*Function to validate the page input.
     In case of invalid input, navigate to the appropriate page; also return false.
     In case of valid input, return true.*/
    validateCurrentPage(event, callback) {
        /*If the value entered is greater than the last page number or invalid value, then highlighting the field showing error.*/
        if (event && (isNaN(this.dn.currentPage) || this.dn.currentPage <= 0 || (this.pageCount && (this.dn.currentPage > this.pageCount || _.isNull(this.dn.currentPage))))) {
            $(event.target).closest('a').addClass('ng-invalid');
            return false;
        }
        return true;
    }
    onModelChange(event) {
        if (!this.validateCurrentPage(event)) {
            return;
        }
        this.goToPage(event);
    }
    onKeyDown(event) {
        const targetEle = $(event.target).closest('a');
        if (event.code === 'KeyE') {
            targetEle.addClass('ng-invalid');
            return false;
        }
        targetEle.removeClass('ng-invalid');
        return true;
    }
    pageChanged(event) {
        this._debouncedPageChanged(event);
    }
    /*Function to navigate to the respective pages.*/
    navigatePage(index, event, isRefresh, callback) {
        this.invokeEventCallback('paginationchange', { $event: undefined, $index: this.dn.currentPage });
        // Convert the current page to a valid page number.
        this.dn.currentPage = +this.dn.currentPage;
        switch (index) {
            case 'first':
                this.goToFirstPage(isRefresh, event, callback);
                return;
            case 'prev':
                /*Return if already on the first page.*/
                if (this.isFirstPage() || !this.validateCurrentPage(event, callback)) {
                    return;
                }
                /*Decrement the current page by 1.*/
                this.dn.currentPage -= 1;
                break;
            case 'next':
                /*Return if already on the last page.*/
                if (this.isLastPage() || !this.validateCurrentPage(event, callback)) {
                    return;
                }
                /*Increment the current page by 1.*/
                this.dn.currentPage += 1;
                break;
            case 'last':
                this.goToLastPage(isRefresh, event, callback);
                return;
            default:
                break;
        }
        /*Navigate to the current page.*/
        this.goToPage(event, callback);
    }
    setBindDataSet(binddataset, parent, dataSource, dataset, binddatasource) {
        const parts = binddataset.split('.');
        let bindPagingOptions;
        if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
            bindPagingOptions = `${parts[0]}.${parts[1]}.pagination`;
        }
        if (!binddatasource && dataset) {
            this.dataset = dataset;
            this._debouncedApplyDataset();
            return;
        }
        this.binddataset = binddataset;
        setTimeout(() => {
            this.registerDestroyListener($watch(binddataset, parent, {}, nv => {
                this.dataset = nv;
                this._debouncedApplyDataset();
            }));
            // Register a watch on paging options. Call dataset property change handler even if paging options changes to reflect pagination state
            if (!bindPagingOptions) {
                return;
            }
            this.registerDestroyListener($watch(bindPagingOptions, parent, {}, () => this._debouncedApplyDataset()));
        });
        this.datasource = dataSource;
    }
    // Set the datasource of pagination from the parent widget
    setDataSource(dataSource) {
        this.datasource = dataSource;
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'dataset') {
            let data;
            if (this.parent && this.parent.onDataNavigatorDataSetChange) {
                data = this.parent.onDataNavigatorDataSetChange(nv);
            }
            else {
                data = nv;
            }
            this.setPagingValues(data);
        }
        else if (key === 'navigation') {
            if (nv === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                this.navigation = 'Classic';
            }
            this.updateNavSize();
            this.navcontrols = nv;
        }
        else if (key === 'navigationsize') {
            this.updateNavSize();
        }
        else if (key === 'navigationalign') {
            switchClass(this.nativeElement, `text-${nv}`, `text-${ov}`);
        }
        else if (key === 'maxResults') {
            this.setPagingValues(this.dataset);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterViewInit() {
        const paginationElem = this.nativeElement;
        paginationElem.onclick = (event) => {
            event.stopPropagation();
        };
    }
}
PaginationComponent.initializeProps = registerProps();
PaginationComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmPagination]',
                template: "\n<ul class=\"pagination advanced {{navigationClass}}\" *ngIf=\"navcontrols === 'Classic'\">\n    <li [ngClass]=\"{'disabled':isDisableFirst}\">\n        <a [title]=\"appLocale.LABEL_FIRST\" name=\"first\" href=\"javascript:void(0);\" aria-label=\"First\"\n           (click)=\"navigatePage('first', $event)\">\n            <span aria-hidden=\"true\"><i class=\"wi wi-first-page\"></i></span>\n            <span class=\"sr-only\">{{appLocale.LABEL_FIRST}}</span>\n        </a>\n    </li>\n    <li [ngClass]=\"{'disabled':isDisablePrevious}\">\n        <a [title]=\"appLocale.LABEL_PREVIOUS\" name=\"prev\" href=\"javascript:void(0);\" aria-label=\"Previous\"\n           (click)=\"navigatePage('prev', $event)\">\n            <span aria-hidden=\"true\"><i class=\"wi wi-chevron-left\"></i></span>\n            <span class=\"sr-only\">{{appLocale.LABEL_PREVIOUS}}</span>\n        </a>\n    </li>\n    <li class=\"pagecount disabled\">\n        <a><input type=\"number\" [disabled]=\"isDisableCurrent\" [(ngModel)]=\"dn.currentPage\"\n                  (keydown)=\"onKeyDown($event)\" (change)=\"onModelChange($event)\" class=\"form-control\"/></a>\n    </li>\n    <li class=\"disabled\">\n        <a [hidden]=\"isDisableCount\"> / {{pageCount}}</a>\n    </li>\n    <li [ngClass]=\"{'disabled':isDisableNext}\">\n        <a [title]=\"appLocale.LABEL_NEXT\" name=\"next\" href=\"javascript:void(0);\" aria-label=\"Next\"\n           (click)=\"navigatePage('next', $event)\">\n            <span aria-hidden=\"true\"><i class=\"wi wi-chevron-right\"></i></span>\n            <span class=\"sr-only\">{{appLocale.LABEL_NEXT}}</span>\n        </a>\n    </li>\n    <li [ngClass]=\"{'disabled':isDisableLast}\">\n        <a [title]=\"appLocale.LABEL_LAST\" name=\"last\" href=\"javascript:void(0);\" aria-label=\"Last\"\n           (click)=\"navigatePage('last', $event)\">\n            <span aria-hidden=\"true\"><i class=\"wi wi-last-page\"></i></span>\n            <span class=\"sr-only\">{{appLocale.LABEL_LAST}}</span>\n        </a>\n    </li>\n    <li *ngIf=\"showrecordcount\" class=\"totalcount disabled\">\n        <a>{{appLocale.LABEL_TOTAL_RECORDS}}: {{dataSize}}</a>\n    </li>\n</ul>\n<ul class=\"pager {{navigationClass}}\" *ngIf=\"navcontrols === 'Pager'\">\n    <li class=\"previous\" [ngClass]=\"{'disabled':isDisablePrevious}\">\n        <a href=\"javascript:void(0);\" (click)=\"navigatePage('prev', $event)\" aria-label=\"Previous\">\n            <span aria-hidden=\"true\"><i class=\"wi wi-chevron-left\"></i></span>\n            {{appLocale.LABEL_PREVIOUS}}\n            <span class=\"sr-only\">{{appLocale.LABEL_PREVIOUS}}</span>\n        </a>\n    </li>\n    <li class=\"next\" [ngClass]=\"{'disabled':isDisableNext}\">\n        <a href=\"javascript:void(0);\" (click)=\"navigatePage('next', $event)\" aria-label=\"Next\">\n            {{appLocale.LABEL_NEXT}}\n            <span aria-hidden=\"true\"><i class=\"wi wi-chevron-right\"></i></span>\n            <span class=\"sr-only\">{{appLocale.LABEL_NEXT}}</span>\n        </a>\n    </li>\n</ul>\n\n<pagination class=\"pagination basic\" [ngClass]=\"navigationClass\" *ngIf=\"navcontrols === 'Basic'\"\n            [itemsPerPage]=\"maxResults\" [totalItems]=\"dataSize\"\n            [ngModel]=\"dn.currentPage\" (pageChanged)=\"pageChanged($event)\"\n            [boundaryLinks]=\"boundarylinks\" [maxSize]=\"maxsize\"\n            [directionLinks]=\"directionlinks\" previousText=\".\" nextText=\".\" firstText=\".\" lastText=\".\"></pagination>\n\n<ul *ngIf=\"navcontrols === 'Basic' && showrecordcount\" class=\"pagination\">\n    <li class=\"totalcount disabled basiccount\"><a>{{appLocale.LABEL_TOTAL_RECORDS}}: {{dataSize}}</a></li>\n</ul>",
                providers: [
                    provideAsWidgetRef(PaginationComponent)
                ]
            }] }
];
/** @nocollapse */
PaginationComponent.ctorParameters = () => [
    { type: Injector },
    { type: undefined, decorators: [{ type: SkipSelf }, { type: Inject, args: [WidgetRef,] }] }
];
PaginationComponent.propDecorators = {
    resultEmitter: [{ type: Output }],
    maxResultsEmitter: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUUzRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVySCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSTNELE1BQU0sV0FBVyxHQUFHLDRCQUE0QixDQUFDO0FBQ2pELE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFNUUsTUFBTSxXQUFXLEdBQUc7SUFDaEIsT0FBTyxFQUFFO1FBQ0wsT0FBTyxFQUFFLFVBQVU7UUFDbkIsT0FBTyxFQUFFLFVBQVU7S0FDdEI7SUFDRCxPQUFPLEVBQUU7UUFDTCxPQUFPLEVBQUUsZUFBZTtRQUN4QixPQUFPLEVBQUUsZUFBZTtLQUMzQjtJQUNELFNB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QUFLLFlBQVksRUFBRTtZQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0QzthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsZUFBZTtRQUNYLE1BQU0sY0FBYyxHQUFJLElBQUksQ0FBQyxhQUE0QixDQUFDO1FBQzFELGNBQWMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMvQixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDO0lBQ04sQ0FBQzs7QUE3Yk0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLDJvSEFBMEM7Z0JBQzFDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztpQkFDMUM7YUFDSjs7OztZQXJDeUMsUUFBUTs0Q0EwRmxCLFFBQVEsWUFBSSxNQUFNLFNBQUMsU0FBUzs7OzRCQWxEdkQsTUFBTTtnQ0FDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0b3IsIE91dHB1dCwgU2tpcFNlbGYsIEFmdGVyVmlld0luaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHdhdGNoLCBBcHBDb25zdGFudHMsIERhdGFTb3VyY2UsIGRlYm91bmNlLCBpc0RlZmluZWQsIHN3aXRjaENsYXNzLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3BhZ2luYXRpb24ucHJvcHMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IGdldE9yZGVyQnlFeHByLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IERFQk9VTkNFX1RJTUVTIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL2NvbnN0YW50cyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWRhdGFuYXZpZ2F0b3IgY2xlYXJmaXgnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcGFnaW5hdGlvbicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5jb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAnUGFnZXInOiB7XG4gICAgICAgICdzbWFsbCc6ICdwYWdlci1zbScsXG4gICAgICAgICdsYXJnZSc6ICdwYWdlci1sZydcbiAgICB9LFxuICAgICdCYXNpYyc6IHtcbiAgICAgICAgJ3NtYWxsJzogJ3BhZ2luYXRpb24tc20nLFxuICAgICAgICAnbGFyZ2UnOiAncGFnaW5hdGlvbi1sZydcbiAgICB9LFxuICAgICdDbGFzc2ljJzoge1xuICAgICAgICAnc21hbGwnOiAncGFnaW5hdGlvbi1zbScsXG4gICAgICAgICdsYXJnZSc6ICdwYWdpbmF0aW9uLWxnJ1xuICAgIH1cbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnaW5hdGlvbl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9wYWdpbmF0aW9uLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBhZ2luYXRpb25Db21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQYWdpbmF0aW9uQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIEBPdXRwdXQoKSByZXN1bHRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBAT3V0cHV0KCkgbWF4UmVzdWx0c0VtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgZGF0YXNvdXJjZTtcbiAgICBtYXhSZXN1bHRzO1xuICAgIG5hdmlnYXRpb25zaXplO1xuICAgIHNob3dyZWNvcmRjb3VudDtcblxuICAgIG5hdmNvbnRyb2xzO1xuICAgIG5hdmlnYXRpb247XG5cbiAgICBib3VuZGFyeWxpbmtzO1xuICAgIGRpcmVjdGlvbmxpbmtzO1xuXG4gICAgbmF2aWdhdGlvbkNsYXNzO1xuICAgIGRuID0ge1xuICAgICAgICBjdXJyZW50UGFnZTogMVxuICAgIH07XG5cbiAgICBwYWdlQ291bnQgPSAwO1xuICAgIGlzRGlzYWJsZU5leHQgPSB0cnVlO1xuICAgIGlzRGlzYWJsZVByZXZpb3VzID0gdHJ1ZTtcbiAgICBpc0Rpc2FibGVGaXJzdCA9IHRydWU7XG4gICAgaXNEaXNhYmxlTGFzdCA9IHRydWU7XG4gICAgaXNEaXNhYmxlQ3VycmVudDtcbiAgICBkYXRhU2l6ZTtcbiAgICBwcmV2c2hvd3JlY29yZGNvdW50O1xuICAgIGlzRGlzYWJsZUNvdW50O1xuICAgIGZpcnN0Um93O1xuICAgIHJlc3VsdDtcbiAgICBfX2Z1bGxEYXRhO1xuICAgIGRhdGFzZXQ7XG4gICAgb3B0aW9ucztcbiAgICBmaWx0ZXJGaWVsZHM7XG4gICAgc29ydE9wdGlvbnM7XG4gICAgYmluZGRhdGFzZXQ7XG4gICAgcGFnaW5hdGlvbjtcblxuICAgIHByaXZhdGUgX2RlYm91bmNlZEFwcGx5RGF0YXNldCA9IGRlYm91bmNlKCgpID0+IHRoaXMud2lkZ2V0LmRhdGFzZXQgPSB0aGlzLmRhdGFzZXQsIERFQk9VTkNFX1RJTUVTLlBBR0lOQVRJT05fREVCT1VOQ0VfVElNRSk7XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkUGFnZUNoYW5nZWQgPSBkZWJvdW5jZShldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gZXZlbnQgJiYgZXZlbnQucGFnZTtcbiAgICAgICAgLy8gRG8gbm90IGNhbGwgZ29Ub1BhZ2UgaWYgcGFnZSBoYXMgbm90IGNoYW5nZWRcbiAgICAgICAgaWYgKGN1cnJlbnRQYWdlICE9PSB0aGlzLmRuLmN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBjb25zdCBpbnN0ID0gKHRoaXMgYXMgYW55KS5wYXJlbnQgfHwgdGhpcztcbiAgICAgICAgICAgIHRoaXMuZG4uY3VycmVudFBhZ2UgPSBjdXJyZW50UGFnZTtcbiAgICAgICAgICAgIGluc3QuaW52b2tlRXZlbnRDYWxsYmFjaygncGFnaW5hdGlvbmNoYW5nZScsIHskZXZlbnQ6IHVuZGVmaW5lZCwgJGluZGV4OiB0aGlzLmRuLmN1cnJlbnRQYWdlfSk7XG4gICAgICAgICAgICB0aGlzLmdvVG9QYWdlKCk7XG4gICAgICAgIH1cbiAgICB9LCBERUJPVU5DRV9USU1FUy5QQUdJTkFUSU9OX0RFQk9VTkNFX1RJTUUpO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgQFNraXBTZWxmKCkgQEluamVjdChXaWRnZXRSZWYpIHB1YmxpYyBwYXJlbnQpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgc2V0UmVzdWx0KHJlc3VsdCkge1xuICAgICAgICAvLyBUT0RPOiBFbWl0IGV2ZW50IG9ubHkgaWYgcmVzdWx0IGlzIGNoYW5nZWRcbiAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIHRoaXMucmVzdWx0RW1pdHRlci5lbWl0KHRoaXMucmVzdWx0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbmF2aWdhdGlvbkNsYXNzIGJhc2VkIG9uIG5hdmlnYXRpb24gYW5kIG5hdmlnYXRpb25TaXplIHByb3BzXG4gICAgcHJpdmF0ZSB1cGRhdGVOYXZTaXplKCkge1xuICAgICAgICBjb25zdCBzaXplQ2xzID0gc2l6ZUNsYXNzZXNbdGhpcy5uYXZjb250cm9sc107XG4gICAgICAgIGlmIChzaXplQ2xzICYmIHRoaXMubmF2aWdhdGlvbnNpemUpIHtcbiAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvbkNsYXNzID0gc2l6ZUNsc1t0aGlzLm5hdmlnYXRpb25zaXplXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvbkNsYXNzID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0byByZXNldCB0aGUgcGFnaW5nIHZhbHVlcyB0byBkZWZhdWx0LlxuICAgIHJlc2V0UGFnZU5hdmlnYXRpb24oKSB7XG4gICAgICAgIHRoaXMucGFnZUNvdW50ID0gMDtcbiAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IDE7XG4gICAgICAgIHRoaXMuZGF0YVNpemUgPSAwO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gY2FsY3VsYXRlIHRoZSBwYWdpbmcgdmFsdWVzLiovXG4gICAgY2FsY3VsYXRlUGFnaW5nVmFsdWVzKCkge1xuICAgICAgICB0aGlzLnBhZ2VDb3VudCA9ICh0aGlzLmRhdGFTaXplID4gdGhpcy5tYXhSZXN1bHRzKSA/IChNYXRoLmNlaWwodGhpcy5kYXRhU2l6ZSAvIHRoaXMubWF4UmVzdWx0cykpIDogKHRoaXMuZGF0YVNpemUgPCAwID8gMCA6IDEpO1xuICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gdGhpcy5kbi5jdXJyZW50UGFnZSB8fCAxO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gc2V0IGRlZmF1bHQgdmFsdWVzIHRvIHRoZSBwYWdpbmcgcGFyYW1ldGVycyovXG4gICAgc2V0RGVmYXVsdFBhZ2luZ1ZhbHVlcyhkYXRhU2l6ZSwgbWF4UmVzdWx0cywgY3VycmVudFBhZ2UpIHtcbiAgICAgICAgLypJZiBuZWl0aGVyICdkYXRhU2l6ZScgbm9yICdtYXhSZXN1bHRzJyBpcyBzZXQsIHRoZW4gc2V0IGRlZmF1bHQgdmFsdWVzIHRvIHRoZSBwYWdpbmcgcGFyYW1ldGVycy4qL1xuICAgICAgICBpZiAoIWRhdGFTaXplICYmICFtYXhSZXN1bHRzKSB7XG4gICAgICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDE7XG4gICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gMTtcbiAgICAgICAgICAgIHRoaXMubWF4UmVzdWx0cyA9IGRhdGFTaXplO1xuICAgICAgICAgICAgdGhpcy5kYXRhU2l6ZSA9IGRhdGFTaXplO1xuICAgICAgICB9IGVsc2UgeyAvKkVsc2UsIHNldCB0aGUgc3BlY2lmaWVkIHZhbHVlcyBhbmQgcmVjYWxjdWxhdGUgcGFnaW5nIHBhcmFtZXRlcnMuKi9cbiAgICAgICAgICAgIHRoaXMubWF4UmVzdWx0cyA9IG1heFJlc3VsdHMgfHwgdGhpcy5tYXhSZXN1bHRzO1xuICAgICAgICAgICAgdGhpcy5kYXRhU2l6ZSA9IGlzRGVmaW5lZChkYXRhU2l6ZSkgPyBkYXRhU2l6ZSA6IHRoaXMuZGF0YVNpemU7XG4gICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gY3VycmVudFBhZ2UgfHwgdGhpcy5kbi5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlUGFnaW5nVmFsdWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXhSZXN1bHRzRW1pdHRlci5lbWl0KHRoaXMubWF4UmVzdWx0cyk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBjaGVjayB0aGUgZGF0YVNpemUgYW5kIG1hbmlwdWxhdGUgdGhlIG5hdmlnYXRvciBhY2NvcmRpbmdseS4qL1xuICAgIGNoZWNrRGF0YVNpemUoZGF0YVNpemUsIG51bWJlck9mRWxlbWVudHM/LCBzaXplPykge1xuICAgICAgICAvKklmIHRoZSBkYXRhU2l6ZSBpcyAtMSBvciBJbnRlZ2VyLk1BWF9WQUxVRSggd2hpY2ggaXMgMjE0NzQ4MzY0NyksIHRoZW4gdGhlIHRvdGFsIG51bWJlciBvZiByZWNvcmRzIGlzIG5vdCBrbm93bi5cbiAgICAgICAgICogSGVuY2UsXG4gICAgICAgICAqIDEuIEhpZGUgdGhlICdUb3RhbCBSZWNvcmQgQ291bnQnLlxuICAgICAgICAgKiAyLiBEaXNhYmxlIHRoZSAnR29Ub0xhc3RQYWdlJyBsaW5rIGFzIHRoZSBwYWdlIG51bWJlciBvZiB0aGUgbGFzdCBwYWdlIGlzIG5vdCBrbm93bi4qL1xuICAgICAgICBpZiAoZGF0YVNpemUgPT09IC0xIHx8IGRhdGFTaXplID09PSBBcHBDb25zdGFudHMuSU5UX01BWF9WQUxVRSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2c2hvd3JlY29yZGNvdW50ID0gdGhpcy5zaG93cmVjb3JkY291bnQ7XG4gICAgICAgICAgICB0aGlzLmlzRGlzYWJsZUxhc3QgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc0Rpc2FibGVDb3VudCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnNob3dyZWNvcmRjb3VudCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gSWYgbnVtYmVyIG9mIHJlY29yZHMgaW4gY3VycmVudCBwYWdlIGlzIGxlc3MgdGhhbiB0aGUgbWF4IHJlY29yZHMgc2l6ZSwgdGhpcyBpcyB0aGUgbGFzdCBwYWdlLiBTbyBkaXNhYmxlIG5leHQgYnV0dG9uLlxuICAgICAgICAgICAgaWYgKG51bWJlck9mRWxlbWVudHMgPCBzaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0Rpc2FibGVOZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNEaXNhYmxlQ291bnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2hvd3JlY29yZGNvdW50ID0gdGhpcy5wcmV2c2hvd3JlY29yZGNvdW50IHx8IHRoaXMuc2hvd3JlY29yZGNvdW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBkaXNhYmxlIG5hdmlnYXRpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgYW5kIHRvdGFsIHBhZ2VzLiovXG4gICAgZGlzYWJsZU5hdmlnYXRpb24oKSB7XG4gICAgICAgIGNvbnN0IGlzQ3VycmVudFBhZ2VGaXJzdCA9ICh0aGlzLmRuLmN1cnJlbnRQYWdlID09PSAxKSxcbiAgICAgICAgICAgIGlzQ3VycmVudFBhZ2VMYXN0ID0gKHRoaXMuZG4uY3VycmVudFBhZ2UgPT09IHRoaXMucGFnZUNvdW50KTtcbiAgICAgICAgdGhpcy5pc0Rpc2FibGVGaXJzdCA9IHRoaXMuaXNEaXNhYmxlUHJldmlvdXMgPSBpc0N1cnJlbnRQYWdlRmlyc3Q7XG4gICAgICAgIHRoaXMuaXNEaXNhYmxlTmV4dCA9IHRoaXMuaXNEaXNhYmxlTGFzdCA9IGlzQ3VycmVudFBhZ2VMYXN0O1xuICAgICAgICB0aGlzLmlzRGlzYWJsZUN1cnJlbnQgPSBpc0N1cnJlbnRQYWdlRmlyc3QgJiYgaXNDdXJyZW50UGFnZUxhc3Q7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgdmFyaWFibGUgYm91bmQgdG8gdGhlIGRhdGEtbmF2aWdhdG9yIGhhcyBwYWdpbmcuKi9cbiAgICBpc0RhdGFTb3VyY2VIYXNQYWdpbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2UgJiYgdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEUpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgcmVzdWx0IGZvciBjbGllbnQgc2lkZSBwYWdpbmF0aW9uXG4gICAgc2V0Tm9uUGFnZWFibGVEYXRhKG5ld1ZhbCkge1xuICAgICAgICBsZXQgZGF0YVNpemUsXG4gICAgICAgICAgICBtYXhSZXN1bHRzLFxuICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICBzdGFydEluZGV4O1xuICAgICAgICBkYXRhU2l6ZSA9IF8uaXNBcnJheShuZXdWYWwpID8gbmV3VmFsLmxlbmd0aCA6IChfLmlzRW1wdHkobmV3VmFsKSA/IDAgOiAxKTtcbiAgICAgICAgbWF4UmVzdWx0cyA9ICh0aGlzLm9wdGlvbnMgJiYgdGhpcy5vcHRpb25zLm1heFJlc3VsdHMpIHx8IGRhdGFTaXplO1xuXG4gICAgICAgIC8vIEZvciBzdGF0aWMgdmFyaWFibGUsIGtlZXAgdGhlIGN1cnJlbnQgcGFnZS4gRm9yIG90aGVyIHZhcmlhYmxlcyB3aXRob3V0IHBhZ2luYXRpb24gcmVzZXQgdGhlIHBhZ2UgdG8gMVxuICAgICAgICBpZiAodGhpcy5kYXRhc291cmNlICYmIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gdGhpcy5kbi5jdXJyZW50UGFnZSB8fCAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXREZWZhdWx0UGFnaW5nVmFsdWVzKGRhdGFTaXplLCBtYXhSZXN1bHRzLCBjdXJyZW50UGFnZSk7XG4gICAgICAgIHRoaXMuZGlzYWJsZU5hdmlnYXRpb24oKTtcblxuICAgICAgICBzdGFydEluZGV4ID0gKHRoaXMuZG4uY3VycmVudFBhZ2UgLSAxKSAqIHRoaXMubWF4UmVzdWx0cztcbiAgICAgICAgdGhpcy5zZXRSZXN1bHQoXy5pc0FycmF5KG5ld1ZhbCkgPyBuZXdWYWwuc2xpY2Uoc3RhcnRJbmRleCwgc3RhcnRJbmRleCArIHRoaXMubWF4UmVzdWx0cykgOiBuZXdWYWwpO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gc2V0IHRoZSB2YWx1ZXMgbmVlZGVkIGZvciBwYWdpbmF0aW9uKi9cbiAgICBwcml2YXRlIHNldFBhZ2luZ1ZhbHVlcyhuZXdWYWwpIHtcbiAgICAgICAgbGV0IGRhdGFTaXplLFxuICAgICAgICAgICAgbWF4UmVzdWx0cyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgZGF0YVNvdXJjZTtcbiAgICAgICAgbGV0IHZhcmlhYmxlT3B0aW9uczogYW55ID0ge307XG4gICAgICAgIC8vIFN0b3JlIHRoZSBkYXRhIGluIF9fZnVsbERhdGEuIFRoaXMgaXMgdXNlZCBmb3IgY2xpZW50IHNpZGUgc2VhcmNoaW5nIHdpdHZhaCBvdXQgbW9kaWZ5aW5nIHRoZSBhY3R1YWwgZGF0YXNldC5cbiAgICAgICAgdGhpcy5fX2Z1bGxEYXRhID0gbmV3VmFsO1xuICAgICAgICAvKkNoZWNrIGZvciBzYW5pdHkqL1xuICAgICAgICBpZiAodGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgZGF0YVNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZSB8fCB7fTtcbiAgICAgICAgICAgIHZhcmlhYmxlT3B0aW9ucyA9IGRhdGFTb3VyY2UuX29wdGlvbnMgfHwge307XG4gICAgICAgICAgICAvKkNoZWNrIGZvciBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGRhdGEgc2V0Ki9cbiAgICAgICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0RhdGFTb3VyY2VIYXNQYWdpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhZ2luYXRpb24gPSB0aGlzLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUEFHSU5HX09QVElPTlMpIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBcImZpbHRlckZpZWxkc1wiIGFuZCBcInNvcnRPcHRpb25zXCIgaGF2ZSBiZWVuIHNldCwgdGhlbiBzZXQgdGhlbSBzbyB0aGF0IHRoZSBmaWx0ZXJzIGNhbiBiZSByZXRhaW5lZCB3aGlsZSBmZXRjaGluZyBkYXRhIHVwb24gcGFnZSBuYXZpZ2F0aW9uLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckZpZWxkcyA9IHZhcmlhYmxlT3B0aW9ucy5maWx0ZXJGaWVsZHMgfHwge307XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc29ydE9wdGlvbnMgPSB2YXJpYWJsZU9wdGlvbnMub3JkZXJCeSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNBcnJheSh0aGlzLnBhZ2luYXRpb24uc29ydCkgPyBnZXRPcmRlckJ5RXhwcih0aGlzLnBhZ2luYXRpb24uc29ydCkgOiAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFTaXplID0gdGhpcy5wYWdpbmF0aW9uLnRvdGFsRWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIG1heFJlc3VsdHMgPSB0aGlzLnBhZ2luYXRpb24uc2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFnaW5hdGlvbi5udW1iZXJPZkVsZW1lbnRzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZCh0aGlzLnBhZ2luYXRpb24ubnVtYmVyKSkgeyAvLyBudW1iZXIgaXMgcGFnZSBudW1iZXIgcmVjZWl2ZWQgZnJvbSBiYWNrZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IHRoaXMucGFnaW5hdGlvbi5udW1iZXIgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSB0aGlzLmRuLmN1cnJlbnRQYWdlIHx8IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLyogU2VuZGluZyBwYWdlQ291bnQgdW5kZWZpbmVkIHRvIGNhbGN1bGF0ZSBpdCBhZ2FpbiBmb3IgcXVlcnkuKi9cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXREZWZhdWx0UGFnaW5nVmFsdWVzKGRhdGFTaXplLCBtYXhSZXN1bHRzLCBjdXJyZW50UGFnZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZU5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja0RhdGFTaXplKGRhdGFTaXplLCB0aGlzLnBhZ2luYXRpb24ubnVtYmVyT2ZFbGVtZW50cywgdGhpcy5wYWdpbmF0aW9uLnNpemUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFJlc3VsdChuZXdWYWwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIV8uaXNTdHJpbmcobmV3VmFsKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE5vblBhZ2VhYmxlRGF0YShuZXdWYWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRSZXN1bHQobmV3VmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0UGFnZU5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChuZXdWYWwgJiYgIV8uaXNTdHJpbmcobmV3VmFsKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0Tm9uUGFnZWFibGVEYXRhKG5ld1ZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBjdXJyZW50IHBhZ2UgaXMgdGhlIGZpcnN0IHBhZ2UqL1xuICAgIGlzRmlyc3RQYWdlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuZG4uY3VycmVudFBhZ2UgPT09IDEgfHwgIXRoaXMuZG4uY3VycmVudFBhZ2UpO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGN1cnJlbnQgcGFnZSBpcyB0aGUgbGFzdCBwYWdlKi9cbiAgICBpc0xhc3RQYWdlKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuZG4uY3VycmVudFBhZ2UgPT09IHRoaXMucGFnZUNvdW50KTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIG5hdmlnYXRlIHRvIHRoZSBsYXN0IHBhZ2UqL1xuICAgIGdvVG9MYXN0UGFnZShpc1JlZnJlc2gsIGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIXRoaXMuaXNMYXN0UGFnZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gdGhpcy5wYWdlQ291bnQ7XG4gICAgICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNSZWZyZXNoKSB7XG4gICAgICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIG5hdmlnYXRlIHRvIHRoZSBmaXJzdCBwYWdlKi9cbiAgICBnb1RvRmlyc3RQYWdlKGlzUmVmcmVzaCwgZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0ZpcnN0UGFnZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gMTtcbiAgICAgICAgICAgIHRoaXMuZ29Ub1BhZ2UoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc1JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMuZ29Ub1BhZ2UoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gbmF2aWdhdGUgdG8gdGhlIGN1cnJlbnQgcGFnZSovXG4gICAgZ29Ub1BhZ2UoZXZlbnQ/LCBjYWxsYmFjaz8pIHtcbiAgICAgICAgdGhpcy5maXJzdFJvdyA9ICh0aGlzLmRuLmN1cnJlbnRQYWdlIC0gMSkgKiB0aGlzLm1heFJlc3VsdHM7XG4gICAgICAgIHRoaXMuZ2V0UGFnZURhdGEoZXZlbnQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIGJlIGludm9rZWQgYWZ0ZXIgdGhlIGRhdGEgb2YgdGhlIHBhZ2UgaGFzIGJlZW4gZmV0Y2hlZC4qL1xuICAgIG9uUGFnZURhdGFSZWFkeShldmVudCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlTmF2aWdhdGlvbigpO1xuICAgICAgICB0aGlzLmludm9rZVNldFJlY29yZChldmVudCwgZGF0YSk7XG4gICAgICAgIHRyaWdnZXJGbihjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBnZXQgZGF0YSBmb3IgdGhlIGN1cnJlbnQgcGFnZSovXG4gICAgZ2V0UGFnZURhdGEoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGxldCBkYXRhLFxuICAgICAgICAgICAgc3RhcnRJbmRleDtcblxuICAgICAgICBpZiAodGhpcy5pc0RhdGFTb3VyY2VIYXNQYWdpbmcoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uTElTVF9SRUNPUkRTLCB7XG4gICAgICAgICAgICAgICAgJ3BhZ2UnOiB0aGlzLmRuLmN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgICdmaWx0ZXJGaWVsZHMnOiB0aGlzLmZpbHRlckZpZWxkcyxcbiAgICAgICAgICAgICAgICAnb3JkZXJCeSc6IHRoaXMuc29ydE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgJ21hdGNoTW9kZSc6ICdhbnl3aGVyZWlnbm9yZWNhc2UnXG4gICAgICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUGFnZURhdGFSZWFkeShldmVudCwgcmVzcG9uc2UgJiYgcmVzcG9uc2UuZGF0YSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJZiBlcnJvciBpcyB1bmRlZmluZWQsIGRvIG5vdCBzaG93IGFueSBtZXNzYWdlIGFzIHRoaXMgbWF5IGJlIGRpc2NhcmRlZCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEhhbmRsZSBFcnJvclxuICAgICAgICAgICAgICAgICAgICAvLyB3bVRvYXN0ZXIuc2hvdygnZXJyb3InLCAnRVJST1InLCAnVW5hYmxlIHRvIGdldCBkYXRhIG9mIHBhZ2UgLScgKyB0aGlzLmRuLmN1cnJlbnRQYWdlICsgJzonICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhcnRJbmRleCA9ICh0aGlzLmRuLmN1cnJlbnRQYWdlIC0gMSkgKiB0aGlzLm1heFJlc3VsdHM7XG4gICAgICAgICAgICBkYXRhID0gXy5pc0FycmF5KHRoaXMuX19mdWxsRGF0YSkgPyB0aGlzLl9fZnVsbERhdGEuc2xpY2Uoc3RhcnRJbmRleCwgc3RhcnRJbmRleCArIHRoaXMubWF4UmVzdWx0cykgOiB0aGlzLl9fZnVsbERhdGE7XG4gICAgICAgICAgICB0aGlzLnNldFJlc3VsdChkYXRhKTtcbiAgICAgICAgICAgIHRoaXMub25QYWdlRGF0YVJlYWR5KGV2ZW50LCBkYXRhLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnZva2VTZXRSZWNvcmQoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgLy8gVHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBpZiBleGlzdHMuXG4gICAgICAgIGNvbnN0IHBhZ2VJbmZvID0ge1xuICAgICAgICAgICAgY3VycmVudFBhZ2U6IHRoaXMuZG4uY3VycmVudFBhZ2UsXG4gICAgICAgICAgICBzaXplOiB0aGlzLm1heFJlc3VsdHMsXG4gICAgICAgICAgICB0b3RhbEVsZW1lbnRzOiB0aGlzLmRhdGFTaXplLFxuICAgICAgICAgICAgdG90YWxQYWdlczogdGhpcy5wYWdlQ291bnRcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5pbnZva2VFdmVudENhbGxiYWNrKCdzZXRyZWNvcmQnLCB7JGV2ZW50OiBldmVudCwgJGRhdGE6IGRhdGEsICRpbmRleDogdGhpcy5kbi5jdXJyZW50UGFnZSwgcGFnZUluZm8sIGRhdGF9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2V0cmVjb3JkJywgeyRldmVudDogZXZlbnQsICRkYXRhOiBkYXRhLCAkaW5kZXg6IHRoaXMuZG4uY3VycmVudFBhZ2UsIHBhZ2VJbmZvLCBkYXRhfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIHZhbGlkYXRlIHRoZSBwYWdlIGlucHV0LlxuICAgICBJbiBjYXNlIG9mIGludmFsaWQgaW5wdXQsIG5hdmlnYXRlIHRvIHRoZSBhcHByb3ByaWF0ZSBwYWdlOyBhbHNvIHJldHVybiBmYWxzZS5cbiAgICAgSW4gY2FzZSBvZiB2YWxpZCBpbnB1dCwgcmV0dXJuIHRydWUuKi9cbiAgICB2YWxpZGF0ZUN1cnJlbnRQYWdlKGV2ZW50LCBjYWxsYmFjaz8pIHtcbiAgICAgICAgLypJZiB0aGUgdmFsdWUgZW50ZXJlZCBpcyBncmVhdGVyIHRoYW4gdGhlIGxhc3QgcGFnZSBudW1iZXIgb3IgaW52YWxpZCB2YWx1ZSwgdGhlbiBoaWdobGlnaHRpbmcgdGhlIGZpZWxkIHNob3dpbmcgZXJyb3IuKi9cbiAgICAgICAgaWYgKCBldmVudCAmJiAoaXNOYU4odGhpcy5kbi5jdXJyZW50UGFnZSkgfHwgdGhpcy5kbi5jdXJyZW50UGFnZSA8PSAwIHx8ICh0aGlzLnBhZ2VDb3VudCAmJiAodGhpcy5kbi5jdXJyZW50UGFnZSA+IHRoaXMucGFnZUNvdW50IHx8IF8uaXNOdWxsKHRoaXMuZG4uY3VycmVudFBhZ2UpKSkpKSB7XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnYScpLmFkZENsYXNzKCduZy1pbnZhbGlkJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgb25Nb2RlbENoYW5nZShldmVudCkge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWRhdGVDdXJyZW50UGFnZShldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50KTtcbiAgICB9XG5cbiAgICBvbktleURvd24oZXZlbnQpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0RWxlID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ2EnKTtcbiAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdLZXlFJykge1xuICAgICAgICAgICAgdGFyZ2V0RWxlLmFkZENsYXNzKCduZy1pbnZhbGlkJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0RWxlLnJlbW92ZUNsYXNzKCduZy1pbnZhbGlkJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHBhZ2VDaGFuZ2VkKGV2ZW50OiBhbnkpIHtcbiAgICAgICB0aGlzLl9kZWJvdW5jZWRQYWdlQ2hhbmdlZChldmVudCk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBuYXZpZ2F0ZSB0byB0aGUgcmVzcGVjdGl2ZSBwYWdlcy4qL1xuICAgIG5hdmlnYXRlUGFnZShpbmRleCwgZXZlbnQsIGlzUmVmcmVzaCwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdwYWdpbmF0aW9uY2hhbmdlJywgeyRldmVudDogdW5kZWZpbmVkLCAkaW5kZXg6IHRoaXMuZG4uY3VycmVudFBhZ2V9KTtcblxuICAgICAgICAvLyBDb252ZXJ0IHRoZSBjdXJyZW50IHBhZ2UgdG8gYSB2YWxpZCBwYWdlIG51bWJlci5cbiAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9ICt0aGlzLmRuLmN1cnJlbnRQYWdlO1xuXG4gICAgICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZpcnN0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9GaXJzdFBhZ2UoaXNSZWZyZXNoLCBldmVudCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhc2UgJ3ByZXYnOlxuICAgICAgICAgICAgICAgIC8qUmV0dXJuIGlmIGFscmVhZHkgb24gdGhlIGZpcnN0IHBhZ2UuKi9cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0ZpcnN0UGFnZSgpIHx8ICF0aGlzLnZhbGlkYXRlQ3VycmVudFBhZ2UoZXZlbnQsIGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qRGVjcmVtZW50IHRoZSBjdXJyZW50IHBhZ2UgYnkgMS4qL1xuICAgICAgICAgICAgICAgIHRoaXMuZG4uY3VycmVudFBhZ2UgLT0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIC8qUmV0dXJuIGlmIGFscmVhZHkgb24gdGhlIGxhc3QgcGFnZS4qL1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTGFzdFBhZ2UoKSB8fCAhdGhpcy52YWxpZGF0ZUN1cnJlbnRQYWdlKGV2ZW50LCBjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKkluY3JlbWVudCB0aGUgY3VycmVudCBwYWdlIGJ5IDEuKi9cbiAgICAgICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlICs9IDE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsYXN0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG9MYXN0UGFnZShpc1JlZnJlc2gsIGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qTmF2aWdhdGUgdG8gdGhlIGN1cnJlbnQgcGFnZS4qL1xuICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgc2V0QmluZERhdGFTZXQoYmluZGRhdGFzZXQsIHBhcmVudCwgZGF0YVNvdXJjZSwgZGF0YXNldD8sIGJpbmRkYXRhc291cmNlPykge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IGJpbmRkYXRhc2V0LnNwbGl0KCcuJyk7XG4gICAgICAgIGxldCBiaW5kUGFnaW5nT3B0aW9ucztcbiAgICAgICAgaWYgKHBhcnRzWzBdID09PSAnVmFyaWFibGVzJyB8fCBwYXJ0c1swXSA9PT0gJ1dpZGdldHMnKSB7XG4gICAgICAgICAgICBiaW5kUGFnaW5nT3B0aW9ucyA9IGAke3BhcnRzWzBdfS4ke3BhcnRzWzFdfS5wYWdpbmF0aW9uYDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWJpbmRkYXRhc291cmNlICYmIGRhdGFzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YXNldCA9IGRhdGFzZXQ7XG4gICAgICAgICAgICB0aGlzLl9kZWJvdW5jZWRBcHBseURhdGFzZXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRkYXRhc2V0ID0gYmluZGRhdGFzZXQ7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAkd2F0Y2goXG4gICAgICAgICAgICAgICAgICAgIGJpbmRkYXRhc2V0LFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICBudiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFzZXQgPSBudjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlZEFwcGx5RGF0YXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgYSB3YXRjaCBvbiBwYWdpbmcgb3B0aW9ucy4gQ2FsbCBkYXRhc2V0IHByb3BlcnR5IGNoYW5nZSBoYW5kbGVyIGV2ZW4gaWYgcGFnaW5nIG9wdGlvbnMgY2hhbmdlcyB0byByZWZsZWN0IHBhZ2luYXRpb24gc3RhdGVcbiAgICAgICAgICAgIGlmICghYmluZFBhZ2luZ09wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKFxuICAgICAgICAgICAgICAgICR3YXRjaChcbiAgICAgICAgICAgICAgICAgICAgYmluZFBhZ2luZ09wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHRoaXMuX2RlYm91bmNlZEFwcGx5RGF0YXNldCgpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGF0YXNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkYXRhc291cmNlIG9mIHBhZ2luYXRpb24gZnJvbSB0aGUgcGFyZW50IHdpZGdldFxuICAgIHNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSkge1xuICAgICAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52LCBvdikge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIGxldCBkYXRhO1xuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50Lm9uRGF0YU5hdmlnYXRvckRhdGFTZXRDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5wYXJlbnQub25EYXRhTmF2aWdhdG9yRGF0YVNldENoYW5nZShudik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBudjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0UGFnaW5nVmFsdWVzKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ25hdmlnYXRpb24nKSB7XG4gICAgICAgICAgICBpZiAobnYgPT09ICdBZHZhbmNlZCcpIHsgLy8gU3VwcG9ydCBmb3Igb2xkZXIgcHJvamVjdHMgd2hlcmUgbmF2aWdhdGlvbiB0eXBlIHdhcyBhZHZhbmNlZCBpbnN0ZWFkIG9mIGNsYXNpY1xuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvbiA9ICdDbGFzc2ljJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlTmF2U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy5uYXZjb250cm9scyA9IG52O1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ25hdmlnYXRpb25zaXplJykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVOYXZTaXplKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbmF2aWdhdGlvbmFsaWduJykge1xuICAgICAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBgdGV4dC0ke252fWAsIGB0ZXh0LSR7b3Z9YCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbWF4UmVzdWx0cycpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UGFnaW5nVmFsdWVzKHRoaXMuZGF0YXNldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgY29uc3QgcGFnaW5hdGlvbkVsZW0gPSAgdGhpcy5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBwYWdpbmF0aW9uRWxlbS5vbmNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=