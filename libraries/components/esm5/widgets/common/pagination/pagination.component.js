import * as tslib_1 from "tslib";
import { Component, EventEmitter, Inject, Injector, Output, SkipSelf } from '@angular/core';
import { $appDigest, $watch, AppConstants, DataSource, debounce, isDefined, switchClass, triggerFn } from '@wm/core';
import { registerProps } from './pagination.props';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { getOrderByExpr, provideAsWidgetRef } from '../../../utils/widget-utils';
import { WidgetRef } from '../../framework/types';
import { DEBOUNCE_TIMES } from '../../framework/constants';
var DEFAULT_CLS = 'app-datanavigator clearfix';
var WIDGET_CONFIG = { widgetType: 'wm-pagination', hostClass: DEFAULT_CLS };
var sizeClasses = {
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
var PaginationComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PaginationComponent, _super);
    function PaginationComponent(inj, parent) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.parent = parent;
        _this.resultEmitter = new EventEmitter();
        _this.maxResultsEmitter = new EventEmitter();
        _this.dn = {
            currentPage: 1
        };
        _this.pageCount = 0;
        _this.isDisableNext = true;
        _this.isDisablePrevious = true;
        _this.isDisableFirst = true;
        _this.isDisableLast = true;
        _this._debouncedApplyDataset = debounce(function () { return _this.widget.dataset = _this.dataset; }, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        _this._debouncedPageChanged = debounce(function (event) {
            var currentPage = event && event.page;
            // Do not call goToPage if page has not changed
            if (currentPage !== _this.dn.currentPage) {
                var inst = _this.parent || _this;
                _this.dn.currentPage = currentPage;
                inst.invokeEventCallback('paginationchange', { $event: undefined, $index: _this.dn.currentPage });
                _this.goToPage();
            }
        }, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        styler(_this.nativeElement, _this);
        return _this;
    }
    PaginationComponent.prototype.setResult = function (result) {
        // TODO: Emit event only if result is changed
        this.result = result;
        this.resultEmitter.emit(this.result);
    };
    // Update navigationClass based on navigation and navigationSize props
    PaginationComponent.prototype.updateNavSize = function () {
        var sizeCls = sizeClasses[this.navcontrols];
        if (sizeCls && this.navigationsize) {
            this.navigationClass = sizeCls[this.navigationsize];
        }
        else {
            this.navigationClass = '';
        }
    };
    // Function to reset the paging values to default.
    PaginationComponent.prototype.resetPageNavigation = function () {
        this.pageCount = 0;
        this.dn.currentPage = 1;
        this.dataSize = 0;
    };
    /*Function to calculate the paging values.*/
    PaginationComponent.prototype.calculatePagingValues = function () {
        this.pageCount = (this.dataSize > this.maxResults) ? (Math.ceil(this.dataSize / this.maxResults)) : (this.dataSize < 0 ? 0 : 1);
        this.dn.currentPage = this.dn.currentPage || 1;
    };
    /*Function to set default values to the paging parameters*/
    PaginationComponent.prototype.setDefaultPagingValues = function (dataSize, maxResults, currentPage) {
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
    };
    /*Function to check the dataSize and manipulate the navigator accordingly.*/
    PaginationComponent.prototype.checkDataSize = function (dataSize, numberOfElements, size) {
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
    };
    /*Function to disable navigation based on the current and total pages.*/
    PaginationComponent.prototype.disableNavigation = function () {
        var isCurrentPageFirst = (this.dn.currentPage === 1), isCurrentPageLast = (this.dn.currentPage === this.pageCount);
        this.isDisableFirst = this.isDisablePrevious = isCurrentPageFirst;
        this.isDisableNext = this.isDisableLast = isCurrentPageLast;
        this.isDisableCurrent = isCurrentPageFirst && isCurrentPageLast;
    };
    /*Function to check if the variable bound to the data-navigator has paging.*/
    PaginationComponent.prototype.isDataSourceHasPaging = function () {
        return this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE);
    };
    // Set the result for client side pagination
    PaginationComponent.prototype.setNonPageableData = function (newVal) {
        var dataSize, maxResults, currentPage, startIndex;
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
    };
    /*Function to set the values needed for pagination*/
    PaginationComponent.prototype.setPagingValues = function (newVal) {
        var dataSize, maxResults, currentPage, dataSource;
        var variableOptions = {};
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
    };
    /*Function to check if the current page is the first page*/
    PaginationComponent.prototype.isFirstPage = function () {
        return (this.dn.currentPage === 1 || !this.dn.currentPage);
    };
    /*Function to check if the current page is the last page*/
    PaginationComponent.prototype.isLastPage = function () {
        return (this.dn.currentPage === this.pageCount);
    };
    /*Function to navigate to the last page*/
    PaginationComponent.prototype.goToLastPage = function (isRefresh, event, callback) {
        if (!this.isLastPage()) {
            this.dn.currentPage = this.pageCount;
            this.goToPage(event, callback);
        }
        else if (isRefresh) {
            this.goToPage(event, callback);
        }
    };
    /*Function to navigate to the first page*/
    PaginationComponent.prototype.goToFirstPage = function (isRefresh, event, callback) {
        if (!this.isFirstPage()) {
            this.dn.currentPage = 1;
            this.goToPage(event, callback);
        }
        else if (isRefresh) {
            this.goToPage(event, callback);
        }
    };
    /*Function to navigate to the current page*/
    PaginationComponent.prototype.goToPage = function (event, callback) {
        this.firstRow = (this.dn.currentPage - 1) * this.maxResults;
        this.getPageData(event, callback);
    };
    /*Function to be invoked after the data of the page has been fetched.*/
    PaginationComponent.prototype.onPageDataReady = function (event, data, callback) {
        this.disableNavigation();
        this.invokeSetRecord(event, data);
        triggerFn(callback);
    };
    /*Function to get data for the current page*/
    PaginationComponent.prototype.getPageData = function (event, callback) {
        var _this = this;
        var data, startIndex;
        if (this.isDataSourceHasPaging()) {
            this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'page': this.dn.currentPage,
                'filterFields': this.filterFields,
                'orderBy': this.sortOptions,
                'matchMode': 'anywhereignorecase'
            }).then(function (response) {
                _this.onPageDataReady(event, response && response.data, callback);
                $appDigest();
            }, function (error) {
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
    };
    PaginationComponent.prototype.invokeSetRecord = function (event, data) {
        // Trigger the event handler if exists.
        var pageInfo = {
            currentPage: this.dn.currentPage,
            size: this.maxResults,
            totalElements: this.dataSize,
            totalPages: this.pageCount
        };
        if (this.parent) {
            this.parent.invokeEventCallback('setrecord', { $event: event, $data: data, $index: this.dn.currentPage, pageInfo: pageInfo, data: data });
        }
        else {
            this.invokeEventCallback('setrecord', { $event: event, $data: data, $index: this.dn.currentPage, pageInfo: pageInfo, data: data });
        }
    };
    /*Function to validate the page input.
     In case of invalid input, navigate to the appropriate page; also return false.
     In case of valid input, return true.*/
    PaginationComponent.prototype.validateCurrentPage = function (event, callback) {
        /*If the value entered is greater than the last page number or invalid value, then highlighting the field showing error.*/
        if (event && (isNaN(this.dn.currentPage) || this.dn.currentPage <= 0 || (this.pageCount && (this.dn.currentPage > this.pageCount || _.isNull(this.dn.currentPage))))) {
            $(event.target).closest('a').addClass('ng-invalid');
            return false;
        }
        return true;
    };
    PaginationComponent.prototype.onModelChange = function (event) {
        if (!this.validateCurrentPage(event)) {
            return;
        }
        this.goToPage(event);
    };
    PaginationComponent.prototype.onKeyDown = function (event) {
        var targetEle = $(event.target).closest('a');
        if (event.code === 'KeyE') {
            targetEle.addClass('ng-invalid');
            return false;
        }
        targetEle.removeClass('ng-invalid');
        return true;
    };
    PaginationComponent.prototype.pageChanged = function (event) {
        this._debouncedPageChanged(event);
    };
    /*Function to navigate to the respective pages.*/
    PaginationComponent.prototype.navigatePage = function (index, event, isRefresh, callback) {
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
    };
    PaginationComponent.prototype.setBindDataSet = function (binddataset, parent, dataSource, dataset, binddatasource) {
        var _this = this;
        var parts = binddataset.split('.');
        var bindPagingOptions;
        if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
            bindPagingOptions = parts[0] + "." + parts[1] + ".pagination";
        }
        if (!binddatasource && dataset) {
            this.dataset = dataset;
            this._debouncedApplyDataset();
            return;
        }
        this.binddataset = binddataset;
        setTimeout(function () {
            _this.registerDestroyListener($watch(binddataset, parent, {}, function (nv) {
                _this.dataset = nv;
                _this._debouncedApplyDataset();
            }));
            // Register a watch on paging options. Call dataset property change handler even if paging options changes to reflect pagination state
            if (!bindPagingOptions) {
                return;
            }
            _this.registerDestroyListener($watch(bindPagingOptions, parent, {}, function () { return _this._debouncedApplyDataset(); }));
        });
        this.datasource = dataSource;
    };
    // Set the datasource of pagination from the parent widget
    PaginationComponent.prototype.setDataSource = function (dataSource) {
        this.datasource = dataSource;
    };
    PaginationComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'dataset') {
            var data = void 0;
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
            switchClass(this.nativeElement, "text-" + nv, "text-" + ov);
        }
        else if (key === 'maxResults') {
            this.setPagingValues(this.dataset);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    PaginationComponent.prototype.ngAfterViewInit = function () {
        var paginationElem = this.nativeElement;
        paginationElem.onclick = function (event) {
            event.stopPropagation();
        };
    };
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
    PaginationComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: SkipSelf }, { type: Inject, args: [WidgetRef,] }] }
    ]; };
    PaginationComponent.propDecorators = {
        resultEmitter: [{ type: Output }],
        maxResultsEmitter: [{ type: Output }]
    };
    return PaginationComponent;
}(StylableComponent));
export { PaginationComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFFM0csT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFckgsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkzRCxJQUFNLFdBQVcsR0FBRyw0QkFBNEIsQ0FBQztBQUNqRCxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRTVFLElBQU0sV0FBVyxHQUFHO0lBQ2hCLE9BQU8sRUFBRTtRQUNMLE9BQU8sRUFBRSxVQUFVO1FBQ25CLE9BQU8sRUFBRSxVQUFVO0tBQ3RCO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsT0FBTyxFQUFFLGVBQWU7UUFDeEIsT0FBTyxFQUFFLGVBQWU7S0FDM0I7SUFDRCxT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QUFnQixFQUFFO1lBQ2pDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN4QjthQUFNLElBQUksR0FBRyxLQUFLLGlCQUFpQixFQUFFO1lBQ2xDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVEsRUFBSSxFQUFFLFVBQVEsRUFBSSxDQUFDLENBQUM7U0FDL0Q7YUFBTSxJQUFJLEdBQUcsS0FBSyxZQUFZLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdEM7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsNkNBQWUsR0FBZjtRQUNJLElBQU0sY0FBYyxHQUFJLElBQUksQ0FBQyxhQUE0QixDQUFDO1FBQzFELGNBQWMsQ0FBQyxPQUFPLEdBQUcsVUFBQyxLQUFLO1lBQzNCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUM7SUFDTixDQUFDO0lBN2JNLG1DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtvQkFDMUIsMm9IQUEwQztvQkFDMUMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLG1CQUFtQixDQUFDO3FCQUMxQztpQkFDSjs7OztnQkFyQ3lDLFFBQVE7Z0RBMEZsQixRQUFRLFlBQUksTUFBTSxTQUFDLFNBQVM7OztnQ0FsRHZELE1BQU07b0NBQ04sTUFBTTs7SUE0YlgsMEJBQUM7Q0FBQSxBQXRjRCxDQU95QyxpQkFBaUIsR0ErYnpEO1NBL2JZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbmplY3QsIEluamVjdG9yLCBPdXRwdXQsIFNraXBTZWxmLCBBZnRlclZpZXdJbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsICR3YXRjaCwgQXBwQ29uc3RhbnRzLCBEYXRhU291cmNlLCBkZWJvdW5jZSwgaXNEZWZpbmVkLCBzd2l0Y2hDbGFzcywgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9wYWdpbmF0aW9uLnByb3BzJztcbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBnZXRPcmRlckJ5RXhwciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFdpZGdldFJlZiB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBERUJPVU5DRV9USU1FUyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1kYXRhbmF2aWdhdG9yIGNsZWFyZml4JztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXBhZ2luYXRpb24nLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgJ1BhZ2VyJzoge1xuICAgICAgICAnc21hbGwnOiAncGFnZXItc20nLFxuICAgICAgICAnbGFyZ2UnOiAncGFnZXItbGcnXG4gICAgfSxcbiAgICAnQmFzaWMnOiB7XG4gICAgICAgICdzbWFsbCc6ICdwYWdpbmF0aW9uLXNtJyxcbiAgICAgICAgJ2xhcmdlJzogJ3BhZ2luYXRpb24tbGcnXG4gICAgfSxcbiAgICAnQ2xhc3NpYyc6IHtcbiAgICAgICAgJ3NtYWxsJzogJ3BhZ2luYXRpb24tc20nLFxuICAgICAgICAnbGFyZ2UnOiAncGFnaW5hdGlvbi1sZydcbiAgICB9XG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVBhZ2luYXRpb25dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcGFnaW5hdGlvbi5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQYWdpbmF0aW9uQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUGFnaW5hdGlvbkNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBAT3V0cHV0KCkgcmVzdWx0RW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgQE91dHB1dCgpIG1heFJlc3VsdHNFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIGRhdGFzb3VyY2U7XG4gICAgbWF4UmVzdWx0cztcbiAgICBuYXZpZ2F0aW9uc2l6ZTtcbiAgICBzaG93cmVjb3JkY291bnQ7XG5cbiAgICBuYXZjb250cm9scztcbiAgICBuYXZpZ2F0aW9uO1xuXG4gICAgYm91bmRhcnlsaW5rcztcbiAgICBkaXJlY3Rpb25saW5rcztcblxuICAgIG5hdmlnYXRpb25DbGFzcztcbiAgICBkbiA9IHtcbiAgICAgICAgY3VycmVudFBhZ2U6IDFcbiAgICB9O1xuXG4gICAgcGFnZUNvdW50ID0gMDtcbiAgICBpc0Rpc2FibGVOZXh0ID0gdHJ1ZTtcbiAgICBpc0Rpc2FibGVQcmV2aW91cyA9IHRydWU7XG4gICAgaXNEaXNhYmxlRmlyc3QgPSB0cnVlO1xuICAgIGlzRGlzYWJsZUxhc3QgPSB0cnVlO1xuICAgIGlzRGlzYWJsZUN1cnJlbnQ7XG4gICAgZGF0YVNpemU7XG4gICAgcHJldnNob3dyZWNvcmRjb3VudDtcbiAgICBpc0Rpc2FibGVDb3VudDtcbiAgICBmaXJzdFJvdztcbiAgICByZXN1bHQ7XG4gICAgX19mdWxsRGF0YTtcbiAgICBkYXRhc2V0O1xuICAgIG9wdGlvbnM7XG4gICAgZmlsdGVyRmllbGRzO1xuICAgIHNvcnRPcHRpb25zO1xuICAgIGJpbmRkYXRhc2V0O1xuICAgIHBhZ2luYXRpb247XG5cbiAgICBwcml2YXRlIF9kZWJvdW5jZWRBcHBseURhdGFzZXQgPSBkZWJvdW5jZSgoKSA9PiB0aGlzLndpZGdldC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0LCBERUJPVU5DRV9USU1FUy5QQUdJTkFUSU9OX0RFQk9VTkNFX1RJTUUpO1xuICAgIHByaXZhdGUgX2RlYm91bmNlZFBhZ2VDaGFuZ2VkID0gZGVib3VuY2UoZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IGV2ZW50ICYmIGV2ZW50LnBhZ2U7XG4gICAgICAgIC8vIERvIG5vdCBjYWxsIGdvVG9QYWdlIGlmIHBhZ2UgaGFzIG5vdCBjaGFuZ2VkXG4gICAgICAgIGlmIChjdXJyZW50UGFnZSAhPT0gdGhpcy5kbi5jdXJyZW50UGFnZSkge1xuICAgICAgICAgICAgY29uc3QgaW5zdCA9ICh0aGlzIGFzIGFueSkucGFyZW50IHx8IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlID0gY3VycmVudFBhZ2U7XG4gICAgICAgICAgICBpbnN0Lmludm9rZUV2ZW50Q2FsbGJhY2soJ3BhZ2luYXRpb25jaGFuZ2UnLCB7JGV2ZW50OiB1bmRlZmluZWQsICRpbmRleDogdGhpcy5kbi5jdXJyZW50UGFnZX0pO1xuICAgICAgICAgICAgdGhpcy5nb1RvUGFnZSgpO1xuICAgICAgICB9XG4gICAgfSwgREVCT1VOQ0VfVElNRVMuUEFHSU5BVElPTl9ERUJPVU5DRV9USU1FKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIEBTa2lwU2VsZigpIEBJbmplY3QoV2lkZ2V0UmVmKSBwdWJsaWMgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIHNldFJlc3VsdChyZXN1bHQpIHtcbiAgICAgICAgLy8gVE9ETzogRW1pdCBldmVudCBvbmx5IGlmIHJlc3VsdCBpcyBjaGFuZ2VkXG4gICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICB0aGlzLnJlc3VsdEVtaXR0ZXIuZW1pdCh0aGlzLnJlc3VsdCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIG5hdmlnYXRpb25DbGFzcyBiYXNlZCBvbiBuYXZpZ2F0aW9uIGFuZCBuYXZpZ2F0aW9uU2l6ZSBwcm9wc1xuICAgIHByaXZhdGUgdXBkYXRlTmF2U2l6ZSgpIHtcbiAgICAgICAgY29uc3Qgc2l6ZUNscyA9IHNpemVDbGFzc2VzW3RoaXMubmF2Y29udHJvbHNdO1xuICAgICAgICBpZiAoc2l6ZUNscyAmJiB0aGlzLm5hdmlnYXRpb25zaXplKSB7XG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25DbGFzcyA9IHNpemVDbHNbdGhpcy5uYXZpZ2F0aW9uc2l6ZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25DbGFzcyA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gcmVzZXQgdGhlIHBhZ2luZyB2YWx1ZXMgdG8gZGVmYXVsdC5cbiAgICByZXNldFBhZ2VOYXZpZ2F0aW9uKCkge1xuICAgICAgICB0aGlzLnBhZ2VDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuZG4uY3VycmVudFBhZ2UgPSAxO1xuICAgICAgICB0aGlzLmRhdGFTaXplID0gMDtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIGNhbGN1bGF0ZSB0aGUgcGFnaW5nIHZhbHVlcy4qL1xuICAgIGNhbGN1bGF0ZVBhZ2luZ1ZhbHVlcygpIHtcbiAgICAgICAgdGhpcy5wYWdlQ291bnQgPSAodGhpcy5kYXRhU2l6ZSA+IHRoaXMubWF4UmVzdWx0cykgPyAoTWF0aC5jZWlsKHRoaXMuZGF0YVNpemUgLyB0aGlzLm1heFJlc3VsdHMpKSA6ICh0aGlzLmRhdGFTaXplIDwgMCA/IDAgOiAxKTtcbiAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IHRoaXMuZG4uY3VycmVudFBhZ2UgfHwgMTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIHNldCBkZWZhdWx0IHZhbHVlcyB0byB0aGUgcGFnaW5nIHBhcmFtZXRlcnMqL1xuICAgIHNldERlZmF1bHRQYWdpbmdWYWx1ZXMoZGF0YVNpemUsIG1heFJlc3VsdHMsIGN1cnJlbnRQYWdlKSB7XG4gICAgICAgIC8qSWYgbmVpdGhlciAnZGF0YVNpemUnIG5vciAnbWF4UmVzdWx0cycgaXMgc2V0LCB0aGVuIHNldCBkZWZhdWx0IHZhbHVlcyB0byB0aGUgcGFnaW5nIHBhcmFtZXRlcnMuKi9cbiAgICAgICAgaWYgKCFkYXRhU2l6ZSAmJiAhbWF4UmVzdWx0cykge1xuICAgICAgICAgICAgdGhpcy5wYWdlQ291bnQgPSAxO1xuICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IDE7XG4gICAgICAgICAgICB0aGlzLm1heFJlc3VsdHMgPSBkYXRhU2l6ZTtcbiAgICAgICAgICAgIHRoaXMuZGF0YVNpemUgPSBkYXRhU2l6ZTtcbiAgICAgICAgfSBlbHNlIHsgLypFbHNlLCBzZXQgdGhlIHNwZWNpZmllZCB2YWx1ZXMgYW5kIHJlY2FsY3VsYXRlIHBhZ2luZyBwYXJhbWV0ZXJzLiovXG4gICAgICAgICAgICB0aGlzLm1heFJlc3VsdHMgPSBtYXhSZXN1bHRzIHx8IHRoaXMubWF4UmVzdWx0cztcbiAgICAgICAgICAgIHRoaXMuZGF0YVNpemUgPSBpc0RlZmluZWQoZGF0YVNpemUpID8gZGF0YVNpemUgOiB0aGlzLmRhdGFTaXplO1xuICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IGN1cnJlbnRQYWdlIHx8IHRoaXMuZG4uY3VycmVudFBhZ2U7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVBhZ2luZ1ZhbHVlcygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWF4UmVzdWx0c0VtaXR0ZXIuZW1pdCh0aGlzLm1heFJlc3VsdHMpO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gY2hlY2sgdGhlIGRhdGFTaXplIGFuZCBtYW5pcHVsYXRlIHRoZSBuYXZpZ2F0b3IgYWNjb3JkaW5nbHkuKi9cbiAgICBjaGVja0RhdGFTaXplKGRhdGFTaXplLCBudW1iZXJPZkVsZW1lbnRzPywgc2l6ZT8pIHtcbiAgICAgICAgLypJZiB0aGUgZGF0YVNpemUgaXMgLTEgb3IgSW50ZWdlci5NQVhfVkFMVUUoIHdoaWNoIGlzIDIxNDc0ODM2NDcpLCB0aGVuIHRoZSB0b3RhbCBudW1iZXIgb2YgcmVjb3JkcyBpcyBub3Qga25vd24uXG4gICAgICAgICAqIEhlbmNlLFxuICAgICAgICAgKiAxLiBIaWRlIHRoZSAnVG90YWwgUmVjb3JkIENvdW50Jy5cbiAgICAgICAgICogMi4gRGlzYWJsZSB0aGUgJ0dvVG9MYXN0UGFnZScgbGluayBhcyB0aGUgcGFnZSBudW1iZXIgb2YgdGhlIGxhc3QgcGFnZSBpcyBub3Qga25vd24uKi9cbiAgICAgICAgaWYgKGRhdGFTaXplID09PSAtMSB8fCBkYXRhU2l6ZSA9PT0gQXBwQ29uc3RhbnRzLklOVF9NQVhfVkFMVUUpIHtcbiAgICAgICAgICAgIHRoaXMucHJldnNob3dyZWNvcmRjb3VudCA9IHRoaXMuc2hvd3JlY29yZGNvdW50O1xuICAgICAgICAgICAgdGhpcy5pc0Rpc2FibGVMYXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNEaXNhYmxlQ291bnQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zaG93cmVjb3JkY291bnQgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIElmIG51bWJlciBvZiByZWNvcmRzIGluIGN1cnJlbnQgcGFnZSBpcyBsZXNzIHRoYW4gdGhlIG1heCByZWNvcmRzIHNpemUsIHRoaXMgaXMgdGhlIGxhc3QgcGFnZS4gU28gZGlzYWJsZSBuZXh0IGJ1dHRvbi5cbiAgICAgICAgICAgIGlmIChudW1iZXJPZkVsZW1lbnRzIDwgc2l6ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEaXNhYmxlTmV4dCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzRGlzYWJsZUNvdW50ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNob3dyZWNvcmRjb3VudCA9IHRoaXMucHJldnNob3dyZWNvcmRjb3VudCB8fCB0aGlzLnNob3dyZWNvcmRjb3VudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gZGlzYWJsZSBuYXZpZ2F0aW9uIGJhc2VkIG9uIHRoZSBjdXJyZW50IGFuZCB0b3RhbCBwYWdlcy4qL1xuICAgIGRpc2FibGVOYXZpZ2F0aW9uKCkge1xuICAgICAgICBjb25zdCBpc0N1cnJlbnRQYWdlRmlyc3QgPSAodGhpcy5kbi5jdXJyZW50UGFnZSA9PT0gMSksXG4gICAgICAgICAgICBpc0N1cnJlbnRQYWdlTGFzdCA9ICh0aGlzLmRuLmN1cnJlbnRQYWdlID09PSB0aGlzLnBhZ2VDb3VudCk7XG4gICAgICAgIHRoaXMuaXNEaXNhYmxlRmlyc3QgPSB0aGlzLmlzRGlzYWJsZVByZXZpb3VzID0gaXNDdXJyZW50UGFnZUZpcnN0O1xuICAgICAgICB0aGlzLmlzRGlzYWJsZU5leHQgPSB0aGlzLmlzRGlzYWJsZUxhc3QgPSBpc0N1cnJlbnRQYWdlTGFzdDtcbiAgICAgICAgdGhpcy5pc0Rpc2FibGVDdXJyZW50ID0gaXNDdXJyZW50UGFnZUZpcnN0ICYmIGlzQ3VycmVudFBhZ2VMYXN0O1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIHZhcmlhYmxlIGJvdW5kIHRvIHRoZSBkYXRhLW5hdmlnYXRvciBoYXMgcGFnaW5nLiovXG4gICAgaXNEYXRhU291cmNlSGFzUGFnaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhc291cmNlICYmIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHJlc3VsdCBmb3IgY2xpZW50IHNpZGUgcGFnaW5hdGlvblxuICAgIHNldE5vblBhZ2VhYmxlRGF0YShuZXdWYWwpIHtcbiAgICAgICAgbGV0IGRhdGFTaXplLFxuICAgICAgICAgICAgbWF4UmVzdWx0cyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgc3RhcnRJbmRleDtcbiAgICAgICAgZGF0YVNpemUgPSBfLmlzQXJyYXkobmV3VmFsKSA/IG5ld1ZhbC5sZW5ndGggOiAoXy5pc0VtcHR5KG5ld1ZhbCkgPyAwIDogMSk7XG4gICAgICAgIG1heFJlc3VsdHMgPSAodGhpcy5vcHRpb25zICYmIHRoaXMub3B0aW9ucy5tYXhSZXN1bHRzKSB8fCBkYXRhU2l6ZTtcblxuICAgICAgICAvLyBGb3Igc3RhdGljIHZhcmlhYmxlLCBrZWVwIHRoZSBjdXJyZW50IHBhZ2UuIEZvciBvdGhlciB2YXJpYWJsZXMgd2l0aG91dCBwYWdpbmF0aW9uIHJlc2V0IHRoZSBwYWdlIHRvIDFcbiAgICAgICAgaWYgKHRoaXMuZGF0YXNvdXJjZSAmJiB0aGlzLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICBjdXJyZW50UGFnZSA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50UGFnZSA9IHRoaXMuZG4uY3VycmVudFBhZ2UgfHwgMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0RGVmYXVsdFBhZ2luZ1ZhbHVlcyhkYXRhU2l6ZSwgbWF4UmVzdWx0cywgY3VycmVudFBhZ2UpO1xuICAgICAgICB0aGlzLmRpc2FibGVOYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgc3RhcnRJbmRleCA9ICh0aGlzLmRuLmN1cnJlbnRQYWdlIC0gMSkgKiB0aGlzLm1heFJlc3VsdHM7XG4gICAgICAgIHRoaXMuc2V0UmVzdWx0KF8uaXNBcnJheShuZXdWYWwpID8gbmV3VmFsLnNsaWNlKHN0YXJ0SW5kZXgsIHN0YXJ0SW5kZXggKyB0aGlzLm1heFJlc3VsdHMpIDogbmV3VmFsKTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIHNldCB0aGUgdmFsdWVzIG5lZWRlZCBmb3IgcGFnaW5hdGlvbiovXG4gICAgcHJpdmF0ZSBzZXRQYWdpbmdWYWx1ZXMobmV3VmFsKSB7XG4gICAgICAgIGxldCBkYXRhU2l6ZSxcbiAgICAgICAgICAgIG1heFJlc3VsdHMsXG4gICAgICAgICAgICBjdXJyZW50UGFnZSxcbiAgICAgICAgICAgIGRhdGFTb3VyY2U7XG4gICAgICAgIGxldCB2YXJpYWJsZU9wdGlvbnM6IGFueSA9IHt9O1xuICAgICAgICAvLyBTdG9yZSB0aGUgZGF0YSBpbiBfX2Z1bGxEYXRhLiBUaGlzIGlzIHVzZWQgZm9yIGNsaWVudCBzaWRlIHNlYXJjaGluZyB3aXR2YWggb3V0IG1vZGlmeWluZyB0aGUgYWN0dWFsIGRhdGFzZXQuXG4gICAgICAgIHRoaXMuX19mdWxsRGF0YSA9IG5ld1ZhbDtcbiAgICAgICAgLypDaGVjayBmb3Igc2FuaXR5Ki9cbiAgICAgICAgaWYgKHRoaXMuYmluZGRhdGFzZXQpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UgPSB0aGlzLmRhdGFzb3VyY2UgfHwge307XG4gICAgICAgICAgICB2YXJpYWJsZU9wdGlvbnMgPSBkYXRhU291cmNlLl9vcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgLypDaGVjayBmb3IgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBkYXRhIHNldCovXG4gICAgICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNEYXRhU291cmNlSGFzUGFnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYWdpbmF0aW9uID0gdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1BBR0lOR19PUFRJT05TKSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgXCJmaWx0ZXJGaWVsZHNcIiBhbmQgXCJzb3J0T3B0aW9uc1wiIGhhdmUgYmVlbiBzZXQsIHRoZW4gc2V0IHRoZW0gc28gdGhhdCB0aGUgZmlsdGVycyBjYW4gYmUgcmV0YWluZWQgd2hpbGUgZmV0Y2hpbmcgZGF0YSB1cG9uIHBhZ2UgbmF2aWdhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJGaWVsZHMgPSB2YXJpYWJsZU9wdGlvbnMuZmlsdGVyRmllbGRzIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvcnRPcHRpb25zID0gdmFyaWFibGVPcHRpb25zLm9yZGVyQnkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzQXJyYXkodGhpcy5wYWdpbmF0aW9uLnNvcnQpID8gZ2V0T3JkZXJCeUV4cHIodGhpcy5wYWdpbmF0aW9uLnNvcnQpIDogJycpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhU2l6ZSA9IHRoaXMucGFnaW5hdGlvbi50b3RhbEVsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICBtYXhSZXN1bHRzID0gdGhpcy5wYWdpbmF0aW9uLnNpemU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhZ2luYXRpb24ubnVtYmVyT2ZFbGVtZW50cyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQodGhpcy5wYWdpbmF0aW9uLm51bWJlcikpIHsgLy8gbnVtYmVyIGlzIHBhZ2UgbnVtYmVyIHJlY2VpdmVkIGZyb20gYmFja2VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG4uY3VycmVudFBhZ2UgPSB0aGlzLnBhZ2luYXRpb24ubnVtYmVyICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlID0gdGhpcy5kbi5jdXJyZW50UGFnZSB8fCAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFBhZ2UgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qIFNlbmRpbmcgcGFnZUNvdW50IHVuZGVmaW5lZCB0byBjYWxjdWxhdGUgaXQgYWdhaW4gZm9yIHF1ZXJ5LiovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RGVmYXVsdFBhZ2luZ1ZhbHVlcyhkYXRhU2l6ZSwgbWF4UmVzdWx0cywgY3VycmVudFBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGVOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tEYXRhU2l6ZShkYXRhU2l6ZSwgdGhpcy5wYWdpbmF0aW9uLm51bWJlck9mRWxlbWVudHMsIHRoaXMucGFnaW5hdGlvbi5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRSZXN1bHQobmV3VmFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFfLmlzU3RyaW5nKG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROb25QYWdlYWJsZURhdGEobmV3VmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UmVzdWx0KG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldFBhZ2VOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobmV3VmFsICYmICFfLmlzU3RyaW5nKG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE5vblBhZ2VhYmxlRGF0YShuZXdWYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgY3VycmVudCBwYWdlIGlzIHRoZSBmaXJzdCBwYWdlKi9cbiAgICBpc0ZpcnN0UGFnZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmRuLmN1cnJlbnRQYWdlID09PSAxIHx8ICF0aGlzLmRuLmN1cnJlbnRQYWdlKTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBjdXJyZW50IHBhZ2UgaXMgdGhlIGxhc3QgcGFnZSovXG4gICAgaXNMYXN0UGFnZSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmRuLmN1cnJlbnRQYWdlID09PSB0aGlzLnBhZ2VDb3VudCk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBuYXZpZ2F0ZSB0byB0aGUgbGFzdCBwYWdlKi9cbiAgICBnb1RvTGFzdFBhZ2UoaXNSZWZyZXNoLCBldmVudCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzTGFzdFBhZ2UoKSkge1xuICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IHRoaXMucGFnZUNvdW50O1xuICAgICAgICAgICAgdGhpcy5nb1RvUGFnZShldmVudCwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVmcmVzaCkge1xuICAgICAgICAgICAgdGhpcy5nb1RvUGFnZShldmVudCwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBuYXZpZ2F0ZSB0byB0aGUgZmlyc3QgcGFnZSovXG4gICAgZ29Ub0ZpcnN0UGFnZShpc1JlZnJlc2gsIGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIXRoaXMuaXNGaXJzdFBhZ2UoKSkge1xuICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSA9IDE7XG4gICAgICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNSZWZyZXNoKSB7XG4gICAgICAgICAgICB0aGlzLmdvVG9QYWdlKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIG5hdmlnYXRlIHRvIHRoZSBjdXJyZW50IHBhZ2UqL1xuICAgIGdvVG9QYWdlKGV2ZW50PywgY2FsbGJhY2s/KSB7XG4gICAgICAgIHRoaXMuZmlyc3RSb3cgPSAodGhpcy5kbi5jdXJyZW50UGFnZSAtIDEpICogdGhpcy5tYXhSZXN1bHRzO1xuICAgICAgICB0aGlzLmdldFBhZ2VEYXRhKGV2ZW50LCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byBiZSBpbnZva2VkIGFmdGVyIHRoZSBkYXRhIG9mIHRoZSBwYWdlIGhhcyBiZWVuIGZldGNoZWQuKi9cbiAgICBvblBhZ2VEYXRhUmVhZHkoZXZlbnQsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZU5hdmlnYXRpb24oKTtcbiAgICAgICAgdGhpcy5pbnZva2VTZXRSZWNvcmQoZXZlbnQsIGRhdGEpO1xuICAgICAgICB0cmlnZ2VyRm4oY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gZ2V0IGRhdGEgZm9yIHRoZSBjdXJyZW50IHBhZ2UqL1xuICAgIGdldFBhZ2VEYXRhKGV2ZW50LCBjYWxsYmFjaykge1xuICAgICAgICBsZXQgZGF0YSxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNEYXRhU291cmNlSGFzUGFnaW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkxJU1RfUkVDT1JEUywge1xuICAgICAgICAgICAgICAgICdwYWdlJzogdGhpcy5kbi5jdXJyZW50UGFnZSxcbiAgICAgICAgICAgICAgICAnZmlsdGVyRmllbGRzJzogdGhpcy5maWx0ZXJGaWVsZHMsXG4gICAgICAgICAgICAgICAgJ29yZGVyQnknOiB0aGlzLnNvcnRPcHRpb25zLFxuICAgICAgICAgICAgICAgICdtYXRjaE1vZGUnOiAnYW55d2hlcmVpZ25vcmVjYXNlJ1xuICAgICAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VEYXRhUmVhZHkoZXZlbnQsIHJlc3BvbnNlICYmIHJlc3BvbnNlLmRhdGEsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZXJyb3IgaXMgdW5kZWZpbmVkLCBkbyBub3Qgc2hvdyBhbnkgbWVzc2FnZSBhcyB0aGlzIG1heSBiZSBkaXNjYXJkZWQgcmVxdWVzdFxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBIYW5kbGUgRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gd21Ub2FzdGVyLnNob3coJ2Vycm9yJywgJ0VSUk9SJywgJ1VuYWJsZSB0byBnZXQgZGF0YSBvZiBwYWdlIC0nICsgdGhpcy5kbi5jdXJyZW50UGFnZSArICc6JyArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0SW5kZXggPSAodGhpcy5kbi5jdXJyZW50UGFnZSAtIDEpICogdGhpcy5tYXhSZXN1bHRzO1xuICAgICAgICAgICAgZGF0YSA9IF8uaXNBcnJheSh0aGlzLl9fZnVsbERhdGEpID8gdGhpcy5fX2Z1bGxEYXRhLnNsaWNlKHN0YXJ0SW5kZXgsIHN0YXJ0SW5kZXggKyB0aGlzLm1heFJlc3VsdHMpIDogdGhpcy5fX2Z1bGxEYXRhO1xuICAgICAgICAgICAgdGhpcy5zZXRSZXN1bHQoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLm9uUGFnZURhdGFSZWFkeShldmVudCwgZGF0YSwgY2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW52b2tlU2V0UmVjb3JkKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIC8vIFRyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgaWYgZXhpc3RzLlxuICAgICAgICBjb25zdCBwYWdlSW5mbyA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlOiB0aGlzLmRuLmN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgc2l6ZTogdGhpcy5tYXhSZXN1bHRzLFxuICAgICAgICAgICAgdG90YWxFbGVtZW50czogdGhpcy5kYXRhU2l6ZSxcbiAgICAgICAgICAgIHRvdGFsUGFnZXM6IHRoaXMucGFnZUNvdW50XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuaW52b2tlRXZlbnRDYWxsYmFjaygnc2V0cmVjb3JkJywgeyRldmVudDogZXZlbnQsICRkYXRhOiBkYXRhLCAkaW5kZXg6IHRoaXMuZG4uY3VycmVudFBhZ2UsIHBhZ2VJbmZvLCBkYXRhfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NldHJlY29yZCcsIHskZXZlbnQ6IGV2ZW50LCAkZGF0YTogZGF0YSwgJGluZGV4OiB0aGlzLmRuLmN1cnJlbnRQYWdlLCBwYWdlSW5mbywgZGF0YX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLypGdW5jdGlvbiB0byB2YWxpZGF0ZSB0aGUgcGFnZSBpbnB1dC5cbiAgICAgSW4gY2FzZSBvZiBpbnZhbGlkIGlucHV0LCBuYXZpZ2F0ZSB0byB0aGUgYXBwcm9wcmlhdGUgcGFnZTsgYWxzbyByZXR1cm4gZmFsc2UuXG4gICAgIEluIGNhc2Ugb2YgdmFsaWQgaW5wdXQsIHJldHVybiB0cnVlLiovXG4gICAgdmFsaWRhdGVDdXJyZW50UGFnZShldmVudCwgY2FsbGJhY2s/KSB7XG4gICAgICAgIC8qSWYgdGhlIHZhbHVlIGVudGVyZWQgaXMgZ3JlYXRlciB0aGFuIHRoZSBsYXN0IHBhZ2UgbnVtYmVyIG9yIGludmFsaWQgdmFsdWUsIHRoZW4gaGlnaGxpZ2h0aW5nIHRoZSBmaWVsZCBzaG93aW5nIGVycm9yLiovXG4gICAgICAgIGlmICggZXZlbnQgJiYgKGlzTmFOKHRoaXMuZG4uY3VycmVudFBhZ2UpIHx8IHRoaXMuZG4uY3VycmVudFBhZ2UgPD0gMCB8fCAodGhpcy5wYWdlQ291bnQgJiYgKHRoaXMuZG4uY3VycmVudFBhZ2UgPiB0aGlzLnBhZ2VDb3VudCB8fCBfLmlzTnVsbCh0aGlzLmRuLmN1cnJlbnRQYWdlKSkpKSkge1xuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJ2EnKS5hZGRDbGFzcygnbmctaW52YWxpZCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG9uTW9kZWxDaGFuZ2UoZXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkYXRlQ3VycmVudFBhZ2UoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nb1RvUGFnZShldmVudCk7XG4gICAgfVxuXG4gICAgb25LZXlEb3duKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldEVsZSA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdhJyk7XG4gICAgICAgIGlmIChldmVudC5jb2RlID09PSAnS2V5RScpIHtcbiAgICAgICAgICAgIHRhcmdldEVsZS5hZGRDbGFzcygnbmctaW52YWxpZCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldEVsZS5yZW1vdmVDbGFzcygnbmctaW52YWxpZCcpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwYWdlQ2hhbmdlZChldmVudDogYW55KSB7XG4gICAgICAgdGhpcy5fZGVib3VuY2VkUGFnZUNoYW5nZWQoZXZlbnQpO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gbmF2aWdhdGUgdG8gdGhlIHJlc3BlY3RpdmUgcGFnZXMuKi9cbiAgICBuYXZpZ2F0ZVBhZ2UoaW5kZXgsIGV2ZW50LCBpc1JlZnJlc2gsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncGFnaW5hdGlvbmNoYW5nZScsIHskZXZlbnQ6IHVuZGVmaW5lZCwgJGluZGV4OiB0aGlzLmRuLmN1cnJlbnRQYWdlfSk7XG5cbiAgICAgICAgLy8gQ29udmVydCB0aGUgY3VycmVudCBwYWdlIHRvIGEgdmFsaWQgcGFnZSBudW1iZXIuXG4gICAgICAgIHRoaXMuZG4uY3VycmVudFBhZ2UgPSArdGhpcy5kbi5jdXJyZW50UGFnZTtcblxuICAgICAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgICAgICAgICBjYXNlICdmaXJzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvRmlyc3RQYWdlKGlzUmVmcmVzaCwgZXZlbnQsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICdwcmV2JzpcbiAgICAgICAgICAgICAgICAvKlJldHVybiBpZiBhbHJlYWR5IG9uIHRoZSBmaXJzdCBwYWdlLiovXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNGaXJzdFBhZ2UoKSB8fCAhdGhpcy52YWxpZGF0ZUN1cnJlbnRQYWdlKGV2ZW50LCBjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKkRlY3JlbWVudCB0aGUgY3VycmVudCBwYWdlIGJ5IDEuKi9cbiAgICAgICAgICAgICAgICB0aGlzLmRuLmN1cnJlbnRQYWdlIC09IDE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICAgICAgICAvKlJldHVybiBpZiBhbHJlYWR5IG9uIHRoZSBsYXN0IHBhZ2UuKi9cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xhc3RQYWdlKCkgfHwgIXRoaXMudmFsaWRhdGVDdXJyZW50UGFnZShldmVudCwgY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLypJbmNyZW1lbnQgdGhlIGN1cnJlbnQgcGFnZSBieSAxLiovXG4gICAgICAgICAgICAgICAgdGhpcy5kbi5jdXJyZW50UGFnZSArPSAxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGFzdCc6XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvTGFzdFBhZ2UoaXNSZWZyZXNoLCBldmVudCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvKk5hdmlnYXRlIHRvIHRoZSBjdXJyZW50IHBhZ2UuKi9cbiAgICAgICAgdGhpcy5nb1RvUGFnZShldmVudCwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHNldEJpbmREYXRhU2V0KGJpbmRkYXRhc2V0LCBwYXJlbnQsIGRhdGFTb3VyY2UsIGRhdGFzZXQ/LCBiaW5kZGF0YXNvdXJjZT8pIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBiaW5kZGF0YXNldC5zcGxpdCgnLicpO1xuICAgICAgICBsZXQgYmluZFBhZ2luZ09wdGlvbnM7XG4gICAgICAgIGlmIChwYXJ0c1swXSA9PT0gJ1ZhcmlhYmxlcycgfHwgcGFydHNbMF0gPT09ICdXaWRnZXRzJykge1xuICAgICAgICAgICAgYmluZFBhZ2luZ09wdGlvbnMgPSBgJHtwYXJ0c1swXX0uJHtwYXJ0c1sxXX0ucGFnaW5hdGlvbmA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFiaW5kZGF0YXNvdXJjZSAmJiBkYXRhc2V0KSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFzZXQgPSBkYXRhc2V0O1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VkQXBwbHlEYXRhc2V0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kZGF0YXNldCA9IGJpbmRkYXRhc2V0O1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICBiaW5kZGF0YXNldCxcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgbnYgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhc2V0ID0gbnY7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJvdW5jZWRBcHBseURhdGFzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIGEgd2F0Y2ggb24gcGFnaW5nIG9wdGlvbnMuIENhbGwgZGF0YXNldCBwcm9wZXJ0eSBjaGFuZ2UgaGFuZGxlciBldmVuIGlmIHBhZ2luZyBvcHRpb25zIGNoYW5nZXMgdG8gcmVmbGVjdCBwYWdpbmF0aW9uIHN0YXRlXG4gICAgICAgICAgICBpZiAoIWJpbmRQYWdpbmdPcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAkd2F0Y2goXG4gICAgICAgICAgICAgICAgICAgIGJpbmRQYWdpbmdPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLl9kZWJvdW5jZWRBcHBseURhdGFzZXQoKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRhdGFzb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGF0YXNvdXJjZSBvZiBwYWdpbmF0aW9uIGZyb20gdGhlIHBhcmVudCB3aWRnZXRcbiAgICBzZXREYXRhU291cmNlKGRhdGFTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5kYXRhc291cmNlID0gZGF0YVNvdXJjZTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudiwgb3YpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5vbkRhdGFOYXZpZ2F0b3JEYXRhU2V0Q2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMucGFyZW50Lm9uRGF0YU5hdmlnYXRvckRhdGFTZXRDaGFuZ2UobnYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gbnY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFBhZ2luZ1ZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICduYXZpZ2F0aW9uJykge1xuICAgICAgICAgICAgaWYgKG52ID09PSAnQWR2YW5jZWQnKSB7IC8vIFN1cHBvcnQgZm9yIG9sZGVyIHByb2plY3RzIHdoZXJlIG5hdmlnYXRpb24gdHlwZSB3YXMgYWR2YW5jZWQgaW5zdGVhZCBvZiBjbGFzaWNcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRpb24gPSAnQ2xhc3NpYyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU5hdlNpemUoKTtcbiAgICAgICAgICAgIHRoaXMubmF2Y29udHJvbHMgPSBudjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICduYXZpZ2F0aW9uc2l6ZScpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTmF2U2l6ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ25hdmlnYXRpb25hbGlnbicpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgYHRleHQtJHtudn1gLCBgdGV4dC0ke292fWApO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ21heFJlc3VsdHMnKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBhZ2luZ1ZhbHVlcyh0aGlzLmRhdGFzZXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGNvbnN0IHBhZ2luYXRpb25FbGVtID0gIHRoaXMubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgcGFnaW5hdGlvbkVsZW0ub25jbGljayA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH07XG4gICAgfVxufVxuIl19