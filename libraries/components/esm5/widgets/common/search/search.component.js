import * as tslib_1 from "tslib";
import { Attribute, Component, ElementRef, Injector, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TypeaheadDirective } from 'ngx-bootstrap';
import { addClass, adjustContainerPosition, DataSource, isDefined, isMobile, toBoolean } from '@wm/core';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { convertDataToObject, extractDataAsArray, getUniqObjsByDataField, transformData } from '../../../utils/form-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { styler } from '../../framework/styler';
import { registerProps } from './search.props';
import { ALLFIELDS } from '../../../utils/data-utils';
import { DataProvider } from './data-provider/data-provider';
var WIDGET_CONFIG = { widgetType: 'wm-search', hostClass: 'input-group' };
var SearchComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SearchComponent, _super);
    function SearchComponent(inj, binddatavalue, binddataset) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.binddatavalue = binddatavalue;
        _this.binddataset = binddataset;
        _this.query = '';
        _this.page = 1;
        // this flag will not allow the empty datafield values.
        _this.allowempty = false;
        addClass(_this.nativeElement, 'app-search', true);
        /**
         * Listens for the change in the ngModel on every search and retrieves the data as observable.
         * This observable data is passed to the typeahead.
         * @type {Observable<any>}
         */
        _this.typeaheadDataSource = Observable
            .create(function (observer) {
            // Runs on every search
            if (_this.listenQuery) {
                if (_this.isMobileAutoComplete() && !_this.$element.hasClass('full-screen')) {
                    _this.renderMobileAutoComplete();
                    return;
                }
                _this._defaultQueryInvoked = false;
                _this._loadingItems = true;
                observer.next(_this.query);
            }
            // on keydown, while scrolling the dropdown items, when last item is reached next call is triggered
            // unless the call is resolved, we are able to scroll next to first item and soon
            // This shows flickering from first item to next new items appended.
            // By setting container to undefined, key events changes will be stopped while loading items
            if (_this.lastSelectedIndex) {
                _this.typeahead._container = undefined;
            }
        }).pipe(mergeMap(function (token) { return _this.getDataSourceAsObservable(token); }));
        _this.dataProvider = new DataProvider();
        /**
         * When default datavalue is not found within the dataset, a filter call is made to get the record using fetchDefaultModel.
         * after getting the response, set the queryModel and query.
         */
        var datavalueSubscription = _this.datavalue$.subscribe(function (val) {
            var query = (_.isArray(val) ? val[0] : val);
            if (query === null || query === '') {
                _this._modelByValue = '';
                // reset the query.
                _this.query = _this.queryModel = '';
                // on clear or reset filter, empty the lastResults to fetch new records.
                _this._lastResult = undefined;
                return;
            }
            if (!_this._unsubscribeDv) {
                _this._defaultQueryInvoked = false;
                // if prev datavalue is not equal to current datavalue then clear the modelByKey and queryModel
                if (!_.isObject(val) && _this.prevDatavalue !== val) {
                    _this._modelByKey = undefined;
                    _this.query = _this.queryModel = '';
                }
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                _this.updateByDatavalue(val);
            }
        });
        _this.registerDestroyListener(function () { return datavalueSubscription.unsubscribe(); });
        var datasetSubscription = _this.dataset$.subscribe(function () {
            // set the next item index.
            _this.startIndex = _this.datasetItems.length;
            _this.updateByDataset(_this.datavalue || _this.toBeProcessedDatavalue);
        });
        _this.registerDestroyListener(function () { return datasetSubscription.unsubscribe(); });
        return _this;
    }
    Object.defineProperty(SearchComponent.prototype, "datasource", {
        // getter setter is added to pass the datasource to searchcomponent.
        get: function () {
            return this._datasource;
        },
        set: function (nv) {
            this._datasource = nv;
            var data = this.datavalue || this.toBeProcessedDatavalue;
            this.updateByDatavalue(data);
        },
        enumerable: true,
        configurable: true
    });
    // on clear, trigger search with page size 1
    SearchComponent.prototype.clearSearch = function ($event, loadOnClear) {
        this.query = '';
        this.onInputChange($event);
        this.dataProvider.isLastPage = false;
        this.listenQuery = false;
        if (loadOnClear) {
            this.listenQuery = true;
            this._unsubscribeDv = false;
            this.loadMoreData();
        }
        this.invokeEventCallback('clearsearch');
    };
    // Close the full screen mode in mobile view of auto complete
    SearchComponent.prototype.closeSearch = function () {
        this._loadingItems = false;
        this.page = 1;
        // after closing the search, insert the element at its previous position (elIndex)
        this.insertAtIndex(this.elIndex);
        this.elIndex = undefined;
        this.parentEl = undefined;
        this.$element.removeClass('full-screen');
        if (this._domUpdated) {
            this._domUpdated = false;
        }
        this.listenQuery = false;
        this._unsubscribeDv = true;
        this.typeahead.hide();
    };
    SearchComponent.prototype.renderMobileAutoComplete = function () {
        // Get the parent element of the search element which can be next or prev element, if both are empty then get the parent of element.
        if (!isDefined(this.elIndex)) {
            this.parentEl = this.$element.parent();
            this.elIndex = this.parentEl.children().index(this.$element);
        }
        if (!this.$element.hasClass('full-screen')) {
            // this flag is set to notify that the typeahead-container dom has changed its position
            this._domUpdated = true;
            this.$element.appendTo('div[data-role="pageContainer"]');
            // Add full screen class on focus of the input element.
            this.$element.addClass('full-screen');
            // Add position to set the height to auto
            if (this.position === 'inline') {
                this.$element.addClass(this.position);
            }
        }
        // focus is lost when element is changed to full-screen, keydown to select next items will not work
        // Hence explicitly focusing the input
        if (this.$element.hasClass('full-screen')) {
            this.$element.find('.app-search-input').focus();
        }
    };
    SearchComponent.prototype.getDataSourceAsObservable = function (query) {
        // show dropdown only when there is change in query. This should not apply when dataoptions with filterFields are updated.
        // when lastResult is not available i.e. still the first call is pending and second query is invoked then do not return.
        if (this._lastQuery === query && !_.get(this.dataoptions, 'filterFields') && isDefined(this._lastResult)) {
            this._loadingItems = false;
            return of(this._lastResult);
        }
        this._lastQuery = this.query;
        return from(this.getDataSource(query));
    };
    SearchComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        if (!_.includes(['blur', 'focus', 'select', 'submit', 'change'], eventName)) {
            _super.prototype.handleEvent.call(this, node, eventName, eventCallback, locals);
        }
    };
    // highlight the characters in the dropdown matching the query.
    SearchComponent.prototype.highlight = function (match, query) {
        if (this.typeaheadContainer) {
            // highlight of chars will work only when label are strings.
            match.value = match.item.label.toString();
            return this.typeaheadContainer.highlight(match, query);
        }
    };
    // inserts the element at the index position
    SearchComponent.prototype.insertAtIndex = function (i) {
        if (i === 0) {
            this.parentEl.prepend(this.$element);
        }
        else {
            var $elAtIndex = this.parentEl.children().eq(i);
            if ($elAtIndex.length) {
                this.$element.insertBefore(this.parentEl.children().eq(i));
            }
            else {
                this.$element.insertAfter(this.parentEl.children().eq(i - 1));
            }
        }
    };
    // Check if the widget is of type autocomplete in mobile view/ app
    SearchComponent.prototype.isMobileAutoComplete = function () {
        return this.type === 'autocomplete' && isMobile();
    };
    SearchComponent.prototype.loadMoreData = function (incrementPage) {
        if (this.dataProvider.isLastPage) {
            return;
        }
        // Increase the page number and trigger force query update
        this.page = incrementPage ? this.page + 1 : this.page;
        this.isScrolled = true;
        this._loadingItems = true;
        // when invoking new set of results, reset the lastQuery.
        if (incrementPage) {
            this._lastQuery = undefined;
        }
        // trigger the typeahead change manually to fetch the next set of results.
        this.typeahead.onInput({
            target: {
                value: _.trim(this.query) || '0' // dummy data to notify the observables
            }
        });
    };
    // on focusout, subscribe to the datavalue changes again
    SearchComponent.prototype.onFocusOut = function () {
        var _this = this;
        this._unsubscribeDv = false;
        this._loadingItems = false;
        // reset the page value on focusout.
        this.page = 1;
        // if domUpdated is true then do not hide the dropdown in the fullscreen
        if (!this._domUpdated && this._isOpen) {
            this.listenQuery = false;
            // hide the typeahead only after the item is selected from dropdown.
            setTimeout(function () {
                if (_this.typeahead._typeahead.isShown) {
                    _this.typeahead.hide();
                }
            }, 200);
        }
        this._isOpen = false;
        // on outside click, typeahead is hidden. To avoid this, when fullscreen is set, overridding isFocused flag on the typeahead container
        if (this._domUpdated && this.typeahead && this.typeahead._container) {
            this.typeahead._container.isFocused = true;
        }
    };
    SearchComponent.prototype.onInputChange = function ($event) {
        // reset all the previous page details in order to fetch new set of result.
        this.result = [];
        this.page = 1;
        this.listenQuery = this.isUpdateOnKeyPress();
        this._modelByValue = undefined;
        // when input is cleared, reset the datavalue
        if (this.query === '') {
            this.queryModel = '';
            this._modelByValue = '';
            this.invokeOnChange(this._modelByValue, {}, true);
            // trigger onSubmit only when the search input is cleared off and do not trigger when tab is pressed.
            if ($event && $event.which !== 9) {
                this.invokeEventCallback('submit', { $event: $event });
            }
        }
        else {
            // invoking change event on every input value change.
            this.invokeEventCallback('change', {
                $event: $event,
                newVal: this._modelByValue || this.query,
                oldVal: this.prevDatavalue
            });
        }
        this.showClosebtn = (this.query !== '');
    };
    // Triggered for enter event
    SearchComponent.prototype.handleEnterEvent = function ($event) {
        // submit event triggered when there is no search results
        if (!this.typeahead._container) {
            this.onSelect($event);
        }
    };
    // Triggerred when typeahead option is selected.
    SearchComponent.prototype.onSelect = function ($event) {
        // searchOn is set as onBtnClick, then invoke the search api call manually.
        if (!this.isUpdateOnKeyPress()) {
            this.listenQuery = true;
            // trigger the typeahead change manually to fetch the next set of results.
            this.typeahead.onInput({
                target: {
                    value: this.query // dummy data to notify the observables
                }
            });
            return;
        }
        // when matches are available.
        if (this.typeaheadContainer && this.liElements.length) {
            this.typeaheadContainer.selectActiveMatch();
        }
        else {
            this.queryModel = this.query;
            this.invokeEventCallback('submit', { $event: $event });
        }
    };
    SearchComponent.prototype.onBeforeservicecall = function (inputData) {
        this.invokeEventCallback('beforeservicecall', { inputData: inputData });
    };
    SearchComponent.prototype.onDropdownOpen = function () {
        var _this = this;
        // setting the ulElements, liElement on typeaheadContainer.
        // as we are using customOption template, liElements are not available on typeaheadContainer so append them explicitly.
        var fn = _.debounce(function () {
            _this._isOpen = true;
            _this.typeaheadContainer = _this.typeahead._container || _this.typeahead._typeahead.instance;
            _this.typeaheadContainer.liElements = _this.liElements;
            _this.typeaheadContainer.ulElement = _this.ulElement;
            adjustContainerPosition($('typeahead-container'), _this.nativeElement, _this.typeahead._typeahead, $('typeahead-container .dropdown-menu'));
        });
        fn();
        // open full-screen search view
        if (this.isMobileAutoComplete()) {
            var dropdownEl = this.dropdownEl.closest('typeahead-container');
            dropdownEl.insertAfter(this.$element.find('input:first'));
            var screenHeight = this.$element.closest('.app-content').height();
            dropdownEl.css({ position: 'relative', top: 0, height: screenHeight + 'px' });
            this.showClosebtn = this.query && this.query !== '';
            if (!this.dataProvider.isLastPage) {
                this.triggerSearch();
            }
        }
    };
    SearchComponent.prototype.selectNext = function () {
        var matches = this.typeaheadContainer.matches;
        if (!matches) {
            return;
        }
        var index = matches.indexOf(this.typeaheadContainer.active);
        // on keydown, if scroll is at the bottom and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && index + 1 > matches.length - 1) {
            // index is saved in order to select the lastSelected item in the dropdown after fetching next page items.
            this.lastSelectedIndex = index;
            this.loadMoreData(true);
        }
    };
    SearchComponent.prototype.setLastActiveMatchAsSelected = function () {
        if (this.lastSelectedIndex) {
            this.typeaheadContainer._active = this.typeaheadContainer.matches[this.lastSelectedIndex];
            this.typeaheadContainer.nextActiveMatch();
            this.lastSelectedIndex = undefined;
        }
    };
    SearchComponent.prototype.triggerSearch = function () {
        if (this.dataProvider.isLastPage || !this.$element.hasClass('full-screen')) {
            return;
        }
        var typeAheadDropDown = this.dropdownEl;
        var $lastItem = typeAheadDropDown.find('li').last();
        // Check if last item is not below the full screen
        if ($lastItem.length && typeAheadDropDown.length && (typeAheadDropDown.height() + typeAheadDropDown.position().top > $lastItem.height() + $lastItem.position().top)) {
            this.loadMoreData(true);
        }
    };
    SearchComponent.prototype.isUpdateOnKeyPress = function () {
        return this.searchon === 'typing';
    };
    SearchComponent.prototype.debounceDefaultQuery = function (data) {
        var _this = this;
        this._defaultQueryInvoked = true;
        this.getDataSource(data, true).then(function (response) {
            if (response.length) {
                _this.queryModel = response;
                _this._lastQuery = _this.query = _this.queryModel[0].label || '';
                _this._modelByValue = _this.queryModel[0].value;
                _this._modelByKey = _this.queryModel[0].key;
            }
            else {
                _this._modelByValue = undefined;
                _this.queryModel = undefined;
                _this.query = '';
            }
        });
    };
    SearchComponent.prototype.updateByDatavalue = function (data) {
        this.updateByDataset(data);
        this.updateByDataSource(data);
    };
    SearchComponent.prototype.updateByDataSource = function (data) {
        // value is present but the corresponding key is not found then fetch next set
        // modelByKey will be set only when datavalue is available inside the localData otherwise make a N/w call.
        if (isDefined(data) && !_.isObject(data) && this.datasource && !isDefined(this._modelByKey) && this.datafield !== ALLFIELDS) {
            // Avoid making default query if queryModel already exists.
            if (isDefined(this.queryModel) && !_.isEmpty(this.queryModel)) {
                this.updateDatavalueFromQueryModel();
                return;
            }
            // Make default query call only when datasource supports CRUD (live variable).
            if (!this._defaultQueryInvoked && this.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.debounceDefaultQuery(data);
            }
        }
    };
    // updates the model value using queryModel
    SearchComponent.prototype.updateDatavalueFromQueryModel = function () {
        this._modelByValue = _.isArray(this.queryModel) ? this.queryModel[0].value : this.queryModel;
        this._modelByKey = _.isArray(this.queryModel) ? this.queryModel[0].key : this.queryModel;
        this.toBeProcessedDatavalue = undefined;
    };
    SearchComponent.prototype.updateByDataset = function (data) {
        // default query is already invoked then do not make other default query call.
        // For local search i.e. searchkey is undefined, do not return, verify the datavalue against the datasetItems .
        if (this._defaultQueryInvoked && this.searchkey) {
            return;
        }
        var selectedItem = _.find(this.datasetItems, function (item) {
            return (_.isObject(item.value) ? _.isEqual(item.value, data) : (_.toString(item.value)).toLowerCase() === (_.toString(data)).toLowerCase());
        });
        // set the default only when it is available in dataset.
        if (selectedItem) {
            this.queryModel = [selectedItem];
        }
        else if (this.datafield === ALLFIELDS && _.isObject(data)) {
            this.queryModel = this.getTransformedData(extractDataAsArray(data));
        }
        else {
            this.queryModel = undefined;
            this.query = '';
            return;
        }
        this.updateDatavalueFromQueryModel();
        // Show the label value on input.
        this._lastQuery = this.query = this.queryModel.length ? this.queryModel[0].label : '';
    };
    // This method returns a promise that provides the filtered data from the datasource.
    SearchComponent.prototype.getDataSource = function (query, searchOnDataField, nextItemIndex) {
        var _this = this;
        // For default query, searchOnDataField is set to true, then do not make a n/w call when datafield is ALLFIELDS
        if (searchOnDataField && this.datafield === ALLFIELDS) {
            this._loadingItems = false;
            return Promise.resolve([]);
        }
        // For default datavalue, search key as to be on datafield to get the default data from the filter call.
        var dataConfig = {
            dataset: this.dataset ? convertDataToObject(this.dataset) : undefined,
            binddataset: this.binddataset,
            datasource: this.datasource,
            datafield: this.datafield,
            hasData: this.dataset && this.dataset.length,
            query: query,
            isLocalFilter: !this.searchkey,
            searchKey: searchOnDataField ? this.datafield : this.searchkey,
            // default search call match mode should be startignorecase
            matchMode: searchOnDataField ? 'startignorecase' : this.matchmode,
            casesensitive: this.casesensitive,
            isformfield: this.isformfield,
            orderby: this.orderby,
            limit: this.limit,
            pagesize: this.pagesize,
            page: this.page,
            onBeforeservicecall: this.onBeforeservicecall.bind(this)
        };
        if (this.dataoptions) {
            dataConfig.dataoptions = this.dataoptions;
            dataConfig.viewParent = this.viewParent;
        }
        this._loadingItems = true;
        return this.dataProvider.filter(dataConfig)
            .then(function (response) {
            // response from dataProvider returns always data object.
            response = response.data || response;
            // for service variable, updating the dataset only if it is not defined or empty
            if ((!isDefined(_this.dataset) || !_this.dataset.length) && _this.dataProvider.updateDataset) {
                _this.dataset = response;
            }
            if (_this.dataProvider.hasMoreData) {
                _this.formattedDataset = _this.formattedDataset.concat(response);
            }
            else {
                _this.formattedDataset = response;
            }
            // explicitly setting the optionslimit as the matches more than 20 will be ignored if optionslimit is not specified.
            if (_this.formattedDataset.length > 20 && !isDefined(_this.limit)) {
                _this.typeahead.typeaheadOptionsLimit = _this.formattedDataset.length;
            }
            // In mobile, trigger the search by default until the results have height upto page height. Other results can be fetched by scrolling
            if (_this._isOpen && _this.isMobileAutoComplete() && !_this.dataProvider.isLastPage) {
                _this.triggerSearch();
            }
            var transformedData = _this.getTransformedData(_this.formattedDataset, nextItemIndex);
            // result contains the datafield values.
            _this.result = _.map(transformedData, 'value');
            return transformedData;
        }, function (error) {
            _this._loadingItems = false;
            return [];
        }).then(function (result) {
            if (_this.isScrolled) {
                (_.debounce(function () {
                    _this.setLastActiveMatchAsSelected();
                }, 30))();
                _this.isScrolled = false;
            }
            // When no result is found, set the datavalue to undefined.
            if (!result.length) {
                _this._modelByValue = undefined;
                _this.queryModel = query;
            }
            // on focusout i.e. on other widget focus, if n/w is pending loading icon is shown, when data is available then dropdown is shown again.
            // on unsubscribing do not show the results.
            if (_this._unsubscribeDv) {
                result = [];
            }
            _this._loadingItems = false;
            _this._lastResult = result;
            return result;
        });
    };
    SearchComponent.prototype.getTransformedData = function (data, itemIndex, iscustom) {
        if (isDefined(itemIndex)) {
            itemIndex++;
        }
        var transformedData = transformData(this.viewParent, data, this.datafield, {
            displayField: this.displaylabel || this.displayfield,
            displayExpr: iscustom ? '' : this.displayexpression,
            bindDisplayExpr: iscustom ? '' : this.binddisplaylabel,
            bindDisplayImgSrc: this.binddisplayimagesrc,
            displayImgSrc: this.displayimagesrc
        }, itemIndex);
        return getUniqObjsByDataField(transformedData, this.datafield, this.displayfield || this.displaylabel, toBoolean(this.allowempty));
    };
    // OptionsListTemplate listens to the scroll event and triggers this function.
    SearchComponent.prototype.onScroll = function ($scrollEl, evt) {
        var totalHeight = $scrollEl.scrollHeight, clientHeight = $scrollEl.clientHeight;
        // If scroll is at the bottom and no request is in progress and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && ($scrollEl.scrollTop + clientHeight >= totalHeight)) {
            this.loadMoreData(true);
        }
    };
    SearchComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        if (!isDefined(this.minchars)) {
            // for autocomplete set the minchars to 0
            if (this.type === 'autocomplete') {
                this.minchars = 0;
            }
            else {
                this.minchars = 1;
            }
        }
        this.listenQuery = this.isUpdateOnKeyPress();
        // by default for autocomplete do not show the search icon
        // by default show the searchicon for type = search
        this.showsearchicon = isDefined(this.showsearchicon) ? this.showsearchicon : (this.type === 'search');
    };
    SearchComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement, this);
    };
    // triggered on select on option from the list. Set the queryModel, query and modelByKey from the matched item.
    SearchComponent.prototype.typeaheadOnSelect = function (match, $event) {
        var item = match.item;
        this.queryModel = item;
        item.selected = true;
        this.query = item.label;
        $event = $event || this.$typeaheadEvent;
        // As item.key can vary from key in the datasetItems
        this._modelByKey = item.key;
        this._modelByValue = item.value;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue, $event || {});
        if (this.$element.hasClass('full-screen')) {
            this.closeSearch();
        }
        this.invokeEventCallback('select', { $event: $event, selectedValue: this.datavalue });
        this.invokeEventCallback('submit', { $event: $event });
        this.updatePrevDatavalue(this.datavalue);
    };
    SearchComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        // when dataoptions are provided and there is no displaylabel given then displaylabel is set as the relatedfield
        if (key === 'displaylabel' && this.dataoptions && this.binddisplaylabel === null) {
            this.query = _.get(this._modelByValue, nv) || this._modelByValue;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    SearchComponent.initializeProps = registerProps();
    SearchComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmSearch]',
                    template: "<ng-template #customItemTemplate let-model=\"item\" let-index=\"index\" let-query=\"query\" let-match=\"match\">\n    <a>\n        <img *ngIf=\"model.imgSrc\" [src]=\"model.imgSrc\" alt=\"Search\" [style.width]=\"imagewidth\">\n        <span [title]=\"model.label\" [innerHtml]=\"highlight(match, query) || model.label\"></span>\n    </a>\n</ng-template>\n\n<ng-template #customListTemplate let-matches=\"matches\" let-itemTemplate=\"itemTemplate\" let-query=\"query\">\n    <ul #ulElement class=\"app-search dropdown-menu\" scrollable>\n        <li #liElements *ngFor=\"let match of matches\" [ngClass]=\"{active: typeaheadContainer && typeaheadContainer.isActive(match)}\"\n            (mouseenter)=\"typeaheadContainer.selectActive(match);\"\n            (click)=\"typeaheadContainer.selectMatch(match, $event); $typeaheadEvent = $event;\">\n            <!-- itemTemplate comes from the <input> -->\n            <ng-container *ngIf=\"!match.isHeader()\" [ngTemplateOutlet]=\"itemTemplate\"\n                          [ngTemplateOutletContext]=\"{item: match.item, index: i, match: match, query: query}\">\n            </ng-container>\n        </li>\n        <div class=\"status\" [hidden]=\"_loadingItems || !(datacompletemsg && dataProvider.isLastPage)\">\n            <span [textContent]=\"datacompletemsg\"></span>\n        </div>\n        <div class=\"status\" [hidden]=\"!_loadingItems\">\n            <i class=\"fa fa-circle-o-notch fa-spin\"></i>\n            <span [textContent]=\"loadingdatamsg\"></span>\n        </div>\n    </ul>\n</ng-template>\n\n<!--This template is for search inside mobile navbar.-->\n<ng-container *ngIf=\"navsearchbar; else searchTemplate\">\n    <input [title]=\"query || ''\" type=\"text\" class=\"app-textbox form-control list-of-objs app-search-input\" [placeholder]=\"placeholder || ''\"\n           focus-target\n           container=\"body\"\n           [disabled]=\"disabled\"\n           autocomplete=\"off\"\n           [(ngModel)]=\"query\"\n           [readonly]=\"readonly\"\n           [disabled]=\"disabled\"\n           [typeahead]=\"typeaheadDataSource\"\n           [typeaheadWaitMs]=\"debouncetime\"\n           [typeaheadItemTemplate]=\"customItemTemplate\"\n           [optionsListTemplate]=\"customListTemplate\"\n           (input)=\"onInputChange($event)\"\n           (keydown)=\"listenQuery = true\"\n           (keydown.enter)=\"$typeaheadEvent = $event;\"\n           (keydown.arrowdown)=\"selectNext($event)\"\n           (blur)=\"invokeOnTouched($event)\"\n           (focus)=\"_unsubscribeDv = false; listenQuery = true; invokeOnFocus($event);\"\n           (focusout)=\"onFocusOut()\"\n           [typeaheadMinLength]=\"minchars\"\n           [typeaheadOptionsLimit]=\"limit\"\n           (typeaheadLoading)=\"_loadingItems\"\n           (typeaheadOnSelect)=\"typeaheadOnSelect($event)\"\n           typeaheadOptionField=\"label\"\n           [typeaheadAsync]=\"true\"\n           [typeaheadScrollable]=\"true\"\n           [typeaheadOptionsInScrollableView]=\"optionslimitinscrollableview\"\n           [dropup]=\"dropup\"\n           [tabindex]=\"tabindex\"\n           [attr.name]=\"name\"/>\n    <i class=\"btn-close wi wi-cancel\" [hidden]=\"!showClosebtn\" (click)=\"clearSearch($event);\"></i>\n</ng-container>\n<!--This template is for both web and fullscreen mode in mobile.-->\n<ng-template #searchTemplate>\n    <span class=\"wi wi-arrow-left form-control-feedback back-btn\" aria-hidden=\"true\" (click)=\"closeSearch()\"></span>\n    <span class=\"sr-only\">Back button</span>\n    <input [title]=\"query || ''\" type=\"text\" class=\"app-textbox form-control list-of-objs app-search-input\" [placeholder]=\"placeholder || ''\"\n           focus-target\n           container=\"body\"\n           [disabled]=\"disabled\"\n           autocomplete=\"off\"\n           [(ngModel)]=\"query\"\n           [readonly]=\"readonly\"\n           [typeahead]=\"typeaheadDataSource\"\n           [typeaheadWaitMs]=\"debouncetime\"\n           [typeaheadItemTemplate]=\"customItemTemplate\"\n           [optionsListTemplate]=\"customListTemplate\"\n           (input)=\"onInputChange($event)\"\n           (keydown)=\"listenQuery = true\"\n           (keydown.enter)=\"$typeaheadEvent = $event;handleEnterEvent($event)\"\n           (keydown.arrowdown)=\"selectNext($event)\"\n           (blur)=\"invokeOnTouched($event)\"\n           (focus)=\"_unsubscribeDv = false; listenQuery = true; invokeOnFocus($event)\"\n           (focusout)=\"onFocusOut()\"\n           [typeaheadMinLength]=\"minchars\"\n           [typeaheadOptionsLimit]=\"limit\"\n           (typeaheadLoading)=\"_loadingItems\"\n           (typeaheadOnSelect)=\"typeaheadOnSelect($event)\"\n           typeaheadOptionField=\"label\"\n           [typeaheadAsync]=\"true\"\n           [typeaheadScrollable]=\"true\"\n           [typeaheadOptionsInScrollableView]=\"optionslimitinscrollableview\"\n           [tabindex]=\"tabindex\"\n           [dropup]=\"dropup\"\n           [attr.name]=\"name\">\n    <input class=\"model-holder\" ng-model=\"proxyModel\" ng-required=\"required\" tabindex=\"-1\">\n    <span *ngIf=\"_loadingItems\" aria-hidden=\"true\" class=\"fa fa-circle-o-notch fa-spin form-control-feedback\"></span>\n    <span class=\"wi wi-close form-control-feedback clear-btn\" [hidden]=\"!showClosebtn\" (click)=\"clearSearch($event, true)\"></span>\n    <span class=\"sr-only\">Clear button</span>\n    <span *ngIf=\"showsearchicon\" class=\"input-group-addon\" aria-label=\"search icon\" [ngClass]=\"{'disabled': disabled}\">\n        <form>\n            <button title=\"Search\" [disabled]=\"disabled\" class=\"app-search-button wi wi-search\" type=\"submit\"\n                    (click)=\"onSelect($event)\"></button>\n        </form>\n    </span>\n</ng-template>\n",
                    providers: [
                        provideAsNgValueAccessor(SearchComponent),
                        provideAsWidgetRef(SearchComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    SearchComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['datavalue.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] }
    ]; };
    SearchComponent.propDecorators = {
        typeahead: [{ type: ViewChild, args: [TypeaheadDirective,] }],
        ulElement: [{ type: ViewChild, args: ['ulElement',] }],
        liElements: [{ type: ViewChildren, args: ['liElements',] }]
    };
    return SearchComponent;
}(DatasetAwareFormComponent));
export { SearchComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2VhcmNoL3NlYXJjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFVLFNBQVMsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXRJLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1QyxPQUFPLEVBQWdCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhELE9BQU8sRUFBK0Isa0JBQWtCLEVBQWtCLE1BQU0sZUFBZSxDQUFDO0FBRWhHLE9BQU8sRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXpHLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzNGLE9BQU8sRUFBRSxtQkFBbUIsRUFBZSxrQkFBa0IsRUFBRSxzQkFBc0IsRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4SSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNqRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFzQyxNQUFNLCtCQUErQixDQUFDO0FBSWpHLElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFB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QUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVQ1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFlBQVk7b0JBQ3RCLG1zTEFBc0M7b0JBQ3RDLFNBQVMsRUFBRTt3QkFDUCx3QkFBd0IsQ0FBQyxlQUFlLENBQUM7d0JBQ3pDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztxQkFDdEM7aUJBQ0o7Ozs7Z0JBNUJ5RCxRQUFRO2dEQStGekQsU0FBUyxTQUFDLGdCQUFnQjtnREFDMUIsU0FBUyxTQUFDLGNBQWM7Ozs0QkF2QzVCLFNBQVMsU0FBQyxrQkFBa0I7NEJBQzVCLFNBQVMsU0FBQyxXQUFXOzZCQUNyQixZQUFZLFNBQUMsWUFBWTs7SUF5b0I5QixzQkFBQztDQUFBLEFBL3FCRCxDQVFxQyx5QkFBeUIsR0F1cUI3RDtTQXZxQlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgT25Jbml0LCBRdWVyeUxpc3QsIFZpZXdDaGlsZCwgVmlld0NoaWxkcmVuIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGZyb20sIE9ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIG1lcmdlTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBUeXBlYWhlYWRDb250YWluZXJDb21wb25lbnQsIFR5cGVhaGVhZERpcmVjdGl2ZSwgVHlwZWFoZWFkTWF0Y2ggfSBmcm9tICduZ3gtYm9vdHN0cmFwJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIGFkanVzdENvbnRhaW5lclBvc2l0aW9uLCBEYXRhU291cmNlLCBpc0RlZmluZWQsIGlzTW9iaWxlLCB0b0Jvb2xlYW4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IGNvbnZlcnREYXRhVG9PYmplY3QsIERhdGFTZXRJdGVtLCBleHRyYWN0RGF0YUFzQXJyYXksIGdldFVuaXFPYmpzQnlEYXRhRmllbGQsIHRyYW5zZm9ybURhdGEgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcbmltcG9ydCB7IERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgfSBmcm9tICcuLi9iYXNlL2RhdGFzZXQtYXdhcmUtZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9zZWFyY2gucHJvcHMnO1xuaW1wb3J0IHsgQUxMRklFTERTIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgeyBEYXRhUHJvdmlkZXIsIElEYXRhUHJvdmlkZXIsIElEYXRhUHJvdmlkZXJDb25maWcgfSBmcm9tICcuL2RhdGEtcHJvdmlkZXIvZGF0YS1wcm92aWRlcic7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tc2VhcmNoJywgaG9zdENsYXNzOiAnaW5wdXQtZ3JvdXAnfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21TZWFyY2hdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vc2VhcmNoLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFNlYXJjaENvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihTZWFyY2hDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTZWFyY2hDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIHB1YmxpYyBjYXNlc2Vuc2l0aXZlOiBib29sZWFuO1xuICAgIHB1YmxpYyBzZWFyY2hrZXk6IHN0cmluZztcbiAgICBwdWJsaWMgcXVlcnlNb2RlbDogQXJyYXk8RGF0YVNldEl0ZW0+IHwgc3RyaW5nO1xuICAgIHB1YmxpYyBxdWVyeSA9ICcnO1xuICAgIHB1YmxpYyBsaW1pdDogYW55O1xuICAgIHB1YmxpYyBzaG93c2VhcmNoaWNvbjogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWluY2hhcnM6IG51bWJlcjtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyBuYXZzZWFyY2hiYXI6IGFueTtcbiAgICBwdWJsaWMgZGVib3VuY2V0aW1lOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIHR5cGVhaGVhZERhdGFTb3VyY2U6IE9ic2VydmFibGU8YW55PjtcbiAgICBwcml2YXRlIHBhZ2VzaXplOiBhbnk7XG4gICAgcHJpdmF0ZSBwYWdlID0gMTtcbiAgICBwdWJsaWMgX2xvYWRpbmdJdGVtczogYm9vbGVhbjtcbiAgICBwcml2YXRlIGRhdGFQcm92aWRlcjogSURhdGFQcm92aWRlcjtcbiAgICBwcml2YXRlIHJlc3VsdDogQXJyYXk8YW55PjsgLy8gY29udGFpbnMgdGhlIHNlYXJjaCByZXN1bHQgaS5lLiBtYXRjaGVzXG4gICAgcHJpdmF0ZSBmb3JtYXR0ZWREYXRhc2V0OiBhbnk7XG4gICAgcHJpdmF0ZSBpc2Zvcm1maWVsZDogYm9vbGVhbjtcbiAgICBwcml2YXRlICR0eXBlYWhlYWRFdmVudDogRXZlbnQ7XG5cbiAgICBwdWJsaWMgdGFiaW5kZXg6IG51bWJlcjtcbiAgICBwdWJsaWMgc3RhcnRJbmRleDogbnVtYmVyO1xuICAgIHB1YmxpYyBiaW5kZGlzcGxheWxhYmVsOiBzdHJpbmc7XG4gICAgcHVibGljIHR5cGVhaGVhZENvbnRhaW5lcjogVHlwZWFoZWFkQ29udGFpbmVyQ29tcG9uZW50O1xuXG4gICAgQFZpZXdDaGlsZChUeXBlYWhlYWREaXJlY3RpdmUpIHR5cGVhaGVhZDogVHlwZWFoZWFkRGlyZWN0aXZlO1xuICAgIEBWaWV3Q2hpbGQoJ3VsRWxlbWVudCcpIHVsRWxlbWVudDogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkcmVuKCdsaUVsZW1lbnRzJykgbGlFbGVtZW50czogUXVlcnlMaXN0PEVsZW1lbnRSZWY+O1xuXG4gICAgcHJpdmF0ZSBhbGxvd29ubHlzZWxlY3Q6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBjbGFzczogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBsYXN0U2VsZWN0ZWRJbmRleDogbnVtYmVyO1xuICAgIHByaXZhdGUgZGF0YW9wdGlvbnM6IGFueTtcbiAgICBwdWJsaWMgZHJvcGRvd25FbDogYW55O1xuICAgIHByaXZhdGUgX2xhc3RRdWVyeTogc3RyaW5nO1xuICAgIHByaXZhdGUgX2xhc3RSZXN1bHQ6IGFueTtcbiAgICBwcml2YXRlIF9pc09wZW46IGJvb2xlYW47IC8vIHNldCB0byB0cnVlIHdoZW4gZHJvcGRvd24gaXMgb3BlblxuICAgIHByaXZhdGUgc2hvd0Nsb3NlYnRuOiBib29sZWFuO1xuICAgIHByaXZhdGUgX3Vuc3Vic2NyaWJlRHY6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfZGF0YXNvdXJjZTogYW55O1xuICAgIHByaXZhdGUgaXNTY3JvbGxlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIHBhcmVudEVsOiBhbnk7XG4gICAgcHJpdmF0ZSBwb3NpdGlvbjogc3RyaW5nO1xuICAgIHByaXZhdGUgZWxJbmRleDogbnVtYmVyO1xuICAgIHByaXZhdGUgbGlzdGVuUXVlcnk6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfZG9tVXBkYXRlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIHNlYXJjaG9uOiBzdHJpbmc7XG4gICAgcHVibGljIG1hdGNobW9kZTogc3RyaW5nO1xuXG4gICAgLy8gZ2V0dGVyIHNldHRlciBpcyBhZGRlZCB0byBwYXNzIHRoZSBkYXRhc291cmNlIHRvIHNlYXJjaGNvbXBvbmVudC5cbiAgICBnZXQgZGF0YXNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFzb3VyY2U7XG4gICAgfVxuXG4gICAgc2V0IGRhdGFzb3VyY2UobnYpIHtcbiAgICAgICAgdGhpcy5fZGF0YXNvdXJjZSA9IG52O1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhdmFsdWUgfHwgdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlO1xuICAgICAgICB0aGlzLnVwZGF0ZUJ5RGF0YXZhbHVlKGRhdGEpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhdmFsdWUuYmluZCcpIHB1YmxpYyBiaW5kZGF0YXZhbHVlLFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc2V0LmJpbmQnKSBwdWJsaWMgYmluZGRhdGFzZXRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgLy8gdGhpcyBmbGFnIHdpbGwgbm90IGFsbG93IHRoZSBlbXB0eSBkYXRhZmllbGQgdmFsdWVzLlxuICAgICAgICB0aGlzLmFsbG93ZW1wdHkgPSBmYWxzZTtcblxuICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdhcHAtc2VhcmNoJywgdHJ1ZSk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3RlbnMgZm9yIHRoZSBjaGFuZ2UgaW4gdGhlIG5nTW9kZWwgb24gZXZlcnkgc2VhcmNoIGFuZCByZXRyaWV2ZXMgdGhlIGRhdGEgYXMgb2JzZXJ2YWJsZS5cbiAgICAgICAgICogVGhpcyBvYnNlcnZhYmxlIGRhdGEgaXMgcGFzc2VkIHRvIHRoZSB0eXBlYWhlYWQuXG4gICAgICAgICAqIEB0eXBlIHtPYnNlcnZhYmxlPGFueT59XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnR5cGVhaGVhZERhdGFTb3VyY2UgPSBPYnNlcnZhYmxlXG4gICAgICAgICAgICAuY3JlYXRlKChvYnNlcnZlcjogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBSdW5zIG9uIGV2ZXJ5IHNlYXJjaFxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdGVuUXVlcnkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc01vYmlsZUF1dG9Db21wbGV0ZSgpICYmICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsLXNjcmVlbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTW9iaWxlQXV0b0NvbXBsZXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdFF1ZXJ5SW52b2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdJdGVtcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0aGlzLnF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG9uIGtleWRvd24sIHdoaWxlIHNjcm9sbGluZyB0aGUgZHJvcGRvd24gaXRlbXMsIHdoZW4gbGFzdCBpdGVtIGlzIHJlYWNoZWQgbmV4dCBjYWxsIGlzIHRyaWdnZXJlZFxuICAgICAgICAgICAgLy8gdW5sZXNzIHRoZSBjYWxsIGlzIHJlc29sdmVkLCB3ZSBhcmUgYWJsZSB0byBzY3JvbGwgbmV4dCB0byBmaXJzdCBpdGVtIGFuZCBzb29uXG4gICAgICAgICAgICAvLyBUaGlzIHNob3dzIGZsaWNrZXJpbmcgZnJvbSBmaXJzdCBpdGVtIHRvIG5leHQgbmV3IGl0ZW1zIGFwcGVuZGVkLlxuICAgICAgICAgICAgLy8gQnkgc2V0dGluZyBjb250YWluZXIgdG8gdW5kZWZpbmVkLCBrZXkgZXZlbnRzIGNoYW5nZXMgd2lsbCBiZSBzdG9wcGVkIHdoaWxlIGxvYWRpbmcgaXRlbXNcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3RTZWxlY3RlZEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWQuX2NvbnRhaW5lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkucGlwZShcbiAgICAgICAgICAgIG1lcmdlTWFwKCh0b2tlbjogc3RyaW5nKSA9PiB0aGlzLmdldERhdGFTb3VyY2VBc09ic2VydmFibGUodG9rZW4pKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZGF0YVByb3ZpZGVyID0gbmV3IERhdGFQcm92aWRlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaGVuIGRlZmF1bHQgZGF0YXZhbHVlIGlzIG5vdCBmb3VuZCB3aXRoaW4gdGhlIGRhdGFzZXQsIGEgZmlsdGVyIGNhbGwgaXMgbWFkZSB0byBnZXQgdGhlIHJlY29yZCB1c2luZyBmZXRjaERlZmF1bHRNb2RlbC5cbiAgICAgICAgICogYWZ0ZXIgZ2V0dGluZyB0aGUgcmVzcG9uc2UsIHNldCB0aGUgcXVlcnlNb2RlbCBhbmQgcXVlcnkuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBkYXRhdmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGF2YWx1ZSQuc3Vic2NyaWJlKCh2YWw6IEFycmF5PHN0cmluZz4gfCBzdHJpbmcpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAoXy5pc0FycmF5KHZhbCkgPyB2YWxbMF0gOiB2YWwpIGFzIHN0cmluZztcblxuICAgICAgICAgICAgaWYgKHF1ZXJ5ID09PSBudWxsIHx8IHF1ZXJ5ID09PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIC8vIHJlc2V0IHRoZSBxdWVyeS5cbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5xdWVyeU1vZGVsID0gJyc7XG4gICAgICAgICAgICAgICAgLy8gb24gY2xlYXIgb3IgcmVzZXQgZmlsdGVyLCBlbXB0eSB0aGUgbGFzdFJlc3VsdHMgdG8gZmV0Y2ggbmV3IHJlY29yZHMuXG4gICAgICAgICAgICAgICAgdGhpcy5fbGFzdFJlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fdW5zdWJzY3JpYmVEdikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRRdWVyeUludm9rZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvLyBpZiBwcmV2IGRhdGF2YWx1ZSBpcyBub3QgZXF1YWwgdG8gY3VycmVudCBkYXRhdmFsdWUgdGhlbiBjbGVhciB0aGUgbW9kZWxCeUtleSBhbmQgcXVlcnlNb2RlbFxuICAgICAgICAgICAgICAgIGlmICghXy5pc09iamVjdCh2YWwpICYmICh0aGlzIGFzIGFueSkucHJldkRhdGF2YWx1ZSAhPT0gdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vZGVsQnlLZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucXVlcnkgPSB0aGlzLnF1ZXJ5TW9kZWwgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGFmaWVsZCBpcyBBTExGSUxFRFMgZG8gbm90IGZldGNoIHRoZSByZWNvcmRzXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBxdWVyeSBtb2RlbCB3aXRoIHRoZSB2YWx1ZXMgd2UgaGF2ZVxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQnlEYXRhdmFsdWUodmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gZGF0YXZhbHVlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAvLyBzZXQgdGhlIG5leHQgaXRlbSBpbmRleC5cbiAgICAgICAgICAgIHRoaXMuc3RhcnRJbmRleCA9IHRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQnlEYXRhc2V0KHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IGRhdGFzZXRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgLy8gb24gY2xlYXIsIHRyaWdnZXIgc2VhcmNoIHdpdGggcGFnZSBzaXplIDFcbiAgICBwcml2YXRlIGNsZWFyU2VhcmNoKCRldmVudCwgbG9hZE9uQ2xlYXIpIHtcbiAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgICAgICB0aGlzLm9uSW5wdXRDaGFuZ2UoJGV2ZW50KTtcbiAgICAgICAgdGhpcy5kYXRhUHJvdmlkZXIuaXNMYXN0UGFnZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxpc3RlblF1ZXJ5ID0gZmFsc2U7XG4gICAgICAgIGlmIChsb2FkT25DbGVhcikge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlRGF0YSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2xlYXJzZWFyY2gnKTtcbiAgICB9XG5cbiAgICAvLyBDbG9zZSB0aGUgZnVsbCBzY3JlZW4gbW9kZSBpbiBtb2JpbGUgdmlldyBvZiBhdXRvIGNvbXBsZXRlXG4gICAgcHJpdmF0ZSBjbG9zZVNlYXJjaCgpIHtcbiAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGFnZSA9IDE7XG4gICAgICAgIC8vIGFmdGVyIGNsb3NpbmcgdGhlIHNlYXJjaCwgaW5zZXJ0IHRoZSBlbGVtZW50IGF0IGl0cyBwcmV2aW91cyBwb3NpdGlvbiAoZWxJbmRleClcbiAgICAgICAgdGhpcy5pbnNlcnRBdEluZGV4KHRoaXMuZWxJbmRleCk7XG4gICAgICAgIHRoaXMuZWxJbmRleCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5wYXJlbnRFbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnZnVsbC1zY3JlZW4nKTtcbiAgICAgICAgaWYgKHRoaXMuX2RvbVVwZGF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RvbVVwZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlblF1ZXJ5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSB0cnVlO1xuICAgICAgICB0aGlzLnR5cGVhaGVhZC5oaWRlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJNb2JpbGVBdXRvQ29tcGxldGUoKSB7XG4gICAgICAgIC8vIEdldCB0aGUgcGFyZW50IGVsZW1lbnQgb2YgdGhlIHNlYXJjaCBlbGVtZW50IHdoaWNoIGNhbiBiZSBuZXh0IG9yIHByZXYgZWxlbWVudCwgaWYgYm90aCBhcmUgZW1wdHkgdGhlbiBnZXQgdGhlIHBhcmVudCBvZiBlbGVtZW50LlxuICAgICAgICBpZiAoIWlzRGVmaW5lZCh0aGlzLmVsSW5kZXgpKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudEVsID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcbiAgICAgICAgICAgIHRoaXMuZWxJbmRleCA9IHRoaXMucGFyZW50RWwuY2hpbGRyZW4oKS5pbmRleCh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2Z1bGwtc2NyZWVuJykpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgZmxhZyBpcyBzZXQgdG8gbm90aWZ5IHRoYXQgdGhlIHR5cGVhaGVhZC1jb250YWluZXIgZG9tIGhhcyBjaGFuZ2VkIGl0cyBwb3NpdGlvblxuICAgICAgICAgICAgdGhpcy5fZG9tVXBkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFwcGVuZFRvKCdkaXZbZGF0YS1yb2xlPVwicGFnZUNvbnRhaW5lclwiXScpO1xuICAgICAgICAgICAgLy8gQWRkIGZ1bGwgc2NyZWVuIGNsYXNzIG9uIGZvY3VzIG9mIHRoZSBpbnB1dCBlbGVtZW50LlxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZnVsbC1zY3JlZW4nKTtcblxuICAgICAgICAgICAgLy8gQWRkIHBvc2l0aW9uIHRvIHNldCB0aGUgaGVpZ2h0IHRvIGF1dG9cbiAgICAgICAgICAgIGlmICh0aGlzLnBvc2l0aW9uID09PSAnaW5saW5lJykge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5wb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9jdXMgaXMgbG9zdCB3aGVuIGVsZW1lbnQgaXMgY2hhbmdlZCB0byBmdWxsLXNjcmVlbiwga2V5ZG93biB0byBzZWxlY3QgbmV4dCBpdGVtcyB3aWxsIG5vdCB3b3JrXG4gICAgICAgIC8vIEhlbmNlIGV4cGxpY2l0bHkgZm9jdXNpbmcgdGhlIGlucHV0XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsLXNjcmVlbicpKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5hcHAtc2VhcmNoLWlucHV0JykuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RGF0YVNvdXJjZUFzT2JzZXJ2YWJsZShxdWVyeTogc3RyaW5nKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICAgICAgLy8gc2hvdyBkcm9wZG93biBvbmx5IHdoZW4gdGhlcmUgaXMgY2hhbmdlIGluIHF1ZXJ5LiBUaGlzIHNob3VsZCBub3QgYXBwbHkgd2hlbiBkYXRhb3B0aW9ucyB3aXRoIGZpbHRlckZpZWxkcyBhcmUgdXBkYXRlZC5cbiAgICAgICAgLy8gd2hlbiBsYXN0UmVzdWx0IGlzIG5vdCBhdmFpbGFibGUgaS5lLiBzdGlsbCB0aGUgZmlyc3QgY2FsbCBpcyBwZW5kaW5nIGFuZCBzZWNvbmQgcXVlcnkgaXMgaW52b2tlZCB0aGVuIGRvIG5vdCByZXR1cm4uXG4gICAgICAgIGlmICh0aGlzLl9sYXN0UXVlcnkgPT09IHF1ZXJ5ICYmICFfLmdldCh0aGlzLmRhdGFvcHRpb25zLCAnZmlsdGVyRmllbGRzJykgJiYgaXNEZWZpbmVkKHRoaXMuX2xhc3RSZXN1bHQpKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBvZih0aGlzLl9sYXN0UmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UXVlcnkgPSB0aGlzLnF1ZXJ5O1xuICAgICAgICByZXR1cm4gZnJvbSh0aGlzLmdldERhdGFTb3VyY2UocXVlcnkpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKCFfLmluY2x1ZGVzKFsnYmx1cicsICdmb2N1cycsICdzZWxlY3QnLCAnc3VibWl0JywgJ2NoYW5nZSddLCBldmVudE5hbWUpKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudChub2RlLCBldmVudE5hbWUsIGV2ZW50Q2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBoaWdobGlnaHQgdGhlIGNoYXJhY3RlcnMgaW4gdGhlIGRyb3Bkb3duIG1hdGNoaW5nIHRoZSBxdWVyeS5cbiAgICBwcml2YXRlIGhpZ2hsaWdodChtYXRjaDogVHlwZWFoZWFkTWF0Y2gsIHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZWFoZWFkQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAvLyBoaWdobGlnaHQgb2YgY2hhcnMgd2lsbCB3b3JrIG9ubHkgd2hlbiBsYWJlbCBhcmUgc3RyaW5ncy5cbiAgICAgICAgICAgIChtYXRjaCBhcyBhbnkpLnZhbHVlID0gbWF0Y2guaXRlbS5sYWJlbC50b1N0cmluZygpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHlwZWFoZWFkQ29udGFpbmVyLmhpZ2hsaWdodChtYXRjaCwgcXVlcnkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gaW5zZXJ0cyB0aGUgZWxlbWVudCBhdCB0aGUgaW5kZXggcG9zaXRpb25cbiAgICBwcml2YXRlIGluc2VydEF0SW5kZXgoaSkge1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRFbC5wcmVwZW5kKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgJGVsQXRJbmRleCA9IHRoaXMucGFyZW50RWwuY2hpbGRyZW4oKS5lcShpKTtcbiAgICAgICAgICAgIGlmICgkZWxBdEluZGV4Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMucGFyZW50RWwuY2hpbGRyZW4oKS5lcShpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuaW5zZXJ0QWZ0ZXIodGhpcy5wYXJlbnRFbC5jaGlsZHJlbigpLmVxKGkgLSAxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgd2lkZ2V0IGlzIG9mIHR5cGUgYXV0b2NvbXBsZXRlIGluIG1vYmlsZSB2aWV3LyBhcHBcbiAgICBwcml2YXRlIGlzTW9iaWxlQXV0b0NvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50eXBlID09PSAnYXV0b2NvbXBsZXRlJyAmJiBpc01vYmlsZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZE1vcmVEYXRhKGluY3JlbWVudFBhZ2U/OiBib29sZWFuKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFQcm92aWRlci5pc0xhc3RQYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSW5jcmVhc2UgdGhlIHBhZ2UgbnVtYmVyIGFuZCB0cmlnZ2VyIGZvcmNlIHF1ZXJ5IHVwZGF0ZVxuICAgICAgICB0aGlzLnBhZ2UgPSBpbmNyZW1lbnRQYWdlID8gdGhpcy5wYWdlICsgMSA6IHRoaXMucGFnZTtcblxuICAgICAgICB0aGlzLmlzU2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSB0cnVlO1xuXG4gICAgICAgIC8vIHdoZW4gaW52b2tpbmcgbmV3IHNldCBvZiByZXN1bHRzLCByZXNldCB0aGUgbGFzdFF1ZXJ5LlxuICAgICAgICBpZiAoaW5jcmVtZW50UGFnZSkge1xuICAgICAgICAgICAgdGhpcy5fbGFzdFF1ZXJ5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJpZ2dlciB0aGUgdHlwZWFoZWFkIGNoYW5nZSBtYW51YWxseSB0byBmZXRjaCB0aGUgbmV4dCBzZXQgb2YgcmVzdWx0cy5cbiAgICAgICAgdGhpcy50eXBlYWhlYWQub25JbnB1dCh7XG4gICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogXy50cmltKHRoaXMucXVlcnkpIHx8ICcwJyAvLyBkdW1teSBkYXRhIHRvIG5vdGlmeSB0aGUgb2JzZXJ2YWJsZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gb24gZm9jdXNvdXQsIHN1YnNjcmliZSB0byB0aGUgZGF0YXZhbHVlIGNoYW5nZXMgYWdhaW5cbiAgICBwcml2YXRlIG9uRm9jdXNPdXQoKSB7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gZmFsc2U7XG4gICAgICAgIC8vIHJlc2V0IHRoZSBwYWdlIHZhbHVlIG9uIGZvY3Vzb3V0LlxuICAgICAgICB0aGlzLnBhZ2UgPSAxO1xuICAgICAgICAvLyBpZiBkb21VcGRhdGVkIGlzIHRydWUgdGhlbiBkbyBub3QgaGlkZSB0aGUgZHJvcGRvd24gaW4gdGhlIGZ1bGxzY3JlZW5cbiAgICAgICAgaWYgKCF0aGlzLl9kb21VcGRhdGVkICYmIHRoaXMuX2lzT3Blbikge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBoaWRlIHRoZSB0eXBlYWhlYWQgb25seSBhZnRlciB0aGUgaXRlbSBpcyBzZWxlY3RlZCBmcm9tIGRyb3Bkb3duLlxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLnR5cGVhaGVhZCBhcyBhbnkpLl90eXBlYWhlYWQuaXNTaG93bikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgLy8gb24gb3V0c2lkZSBjbGljaywgdHlwZWFoZWFkIGlzIGhpZGRlbi4gVG8gYXZvaWQgdGhpcywgd2hlbiBmdWxsc2NyZWVuIGlzIHNldCwgb3ZlcnJpZGRpbmcgaXNGb2N1c2VkIGZsYWcgb24gdGhlIHR5cGVhaGVhZCBjb250YWluZXJcbiAgICAgICAgaWYgKHRoaXMuX2RvbVVwZGF0ZWQgJiYgdGhpcy50eXBlYWhlYWQgJiYgKHRoaXMudHlwZWFoZWFkIGFzIGFueSkuX2NvbnRhaW5lcikge1xuICAgICAgICAgICAgKHRoaXMudHlwZWFoZWFkIGFzIGFueSkuX2NvbnRhaW5lci5pc0ZvY3VzZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbklucHV0Q2hhbmdlKCRldmVudCkge1xuICAgICAgICAvLyByZXNldCBhbGwgdGhlIHByZXZpb3VzIHBhZ2UgZGV0YWlscyBpbiBvcmRlciB0byBmZXRjaCBuZXcgc2V0IG9mIHJlc3VsdC5cbiAgICAgICAgdGhpcy5yZXN1bHQgPSBbXTtcbiAgICAgICAgdGhpcy5wYWdlID0gMTtcbiAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IHRoaXMuaXNVcGRhdGVPbktleVByZXNzKCk7XG4gICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyB3aGVuIGlucHV0IGlzIGNsZWFyZWQsIHJlc2V0IHRoZSBkYXRhdmFsdWVcbiAgICAgICAgaWYgKHRoaXMucXVlcnkgPT09ICcnKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSAnJztcbiAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLl9tb2RlbEJ5VmFsdWUsIHt9LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gdHJpZ2dlciBvblN1Ym1pdCBvbmx5IHdoZW4gdGhlIHNlYXJjaCBpbnB1dCBpcyBjbGVhcmVkIG9mZiBhbmQgZG8gbm90IHRyaWdnZXIgd2hlbiB0YWIgaXMgcHJlc3NlZC5cbiAgICAgICAgICAgIGlmICgkZXZlbnQgJiYgJGV2ZW50LndoaWNoICE9PSA5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWJtaXQnLCB7JGV2ZW50fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpbnZva2luZyBjaGFuZ2UgZXZlbnQgb24gZXZlcnkgaW5wdXQgdmFsdWUgY2hhbmdlLlxuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgJGV2ZW50OiAkZXZlbnQsXG4gICAgICAgICAgICAgICAgbmV3VmFsOiB0aGlzLl9tb2RlbEJ5VmFsdWUgfHwgdGhpcy5xdWVyeSxcbiAgICAgICAgICAgICAgICBvbGRWYWw6ICh0aGlzIGFzIGFueSkucHJldkRhdGF2YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zaG93Q2xvc2VidG4gPSAodGhpcy5xdWVyeSAhPT0gJycpO1xuICAgIH1cblxuICAgIC8vIFRyaWdnZXJlZCBmb3IgZW50ZXIgZXZlbnRcbiAgICBwcml2YXRlIGhhbmRsZUVudGVyRXZlbnQoJGV2ZW50KSB7XG4gICAgICAgIC8vIHN1Ym1pdCBldmVudCB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpcyBubyBzZWFyY2ggcmVzdWx0c1xuICAgICAgICBpZiAoIXRoaXMudHlwZWFoZWFkLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMub25TZWxlY3QoJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBUcmlnZ2VycmVkIHdoZW4gdHlwZWFoZWFkIG9wdGlvbiBpcyBzZWxlY3RlZC5cbiAgICBwcml2YXRlIG9uU2VsZWN0KCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgLy8gc2VhcmNoT24gaXMgc2V0IGFzIG9uQnRuQ2xpY2ssIHRoZW4gaW52b2tlIHRoZSBzZWFyY2ggYXBpIGNhbGwgbWFudWFsbHkuXG4gICAgICAgIGlmICghdGhpcy5pc1VwZGF0ZU9uS2V5UHJlc3MoKSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IHRydWU7XG4gICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSB0eXBlYWhlYWQgY2hhbmdlIG1hbnVhbGx5IHRvIGZldGNoIHRoZSBuZXh0IHNldCBvZiByZXN1bHRzLlxuICAgICAgICAgICAgdGhpcy50eXBlYWhlYWQub25JbnB1dCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLnF1ZXJ5IC8vIGR1bW15IGRhdGEgdG8gbm90aWZ5IHRoZSBvYnNlcnZhYmxlc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdoZW4gbWF0Y2hlcyBhcmUgYXZhaWxhYmxlLlxuICAgICAgICBpZiAodGhpcy50eXBlYWhlYWRDb250YWluZXIgJiYgdGhpcy5saUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRDb250YWluZXIuc2VsZWN0QWN0aXZlTWF0Y2goKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IHRoaXMucXVlcnk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Ym1pdCcsIHskZXZlbnR9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25CZWZvcmVzZXJ2aWNlY2FsbChpbnB1dERhdGEpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzZXJ2aWNlY2FsbCcsIHtpbnB1dERhdGF9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRHJvcGRvd25PcGVuKCkge1xuICAgICAgICAvLyBzZXR0aW5nIHRoZSB1bEVsZW1lbnRzLCBsaUVsZW1lbnQgb24gdHlwZWFoZWFkQ29udGFpbmVyLlxuICAgICAgICAvLyBhcyB3ZSBhcmUgdXNpbmcgY3VzdG9tT3B0aW9uIHRlbXBsYXRlLCBsaUVsZW1lbnRzIGFyZSBub3QgYXZhaWxhYmxlIG9uIHR5cGVhaGVhZENvbnRhaW5lciBzbyBhcHBlbmQgdGhlbSBleHBsaWNpdGx5LlxuICAgICAgICBjb25zdCBmbiA9IF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkQ29udGFpbmVyID0gdGhpcy50eXBlYWhlYWQuX2NvbnRhaW5lciB8fCAodGhpcy50eXBlYWhlYWQgYXMgYW55KS5fdHlwZWFoZWFkLmluc3RhbmNlO1xuICAgICAgICAgICAgKHRoaXMudHlwZWFoZWFkQ29udGFpbmVyIGFzIGFueSkubGlFbGVtZW50cyA9IHRoaXMubGlFbGVtZW50cztcbiAgICAgICAgICAgICh0aGlzLnR5cGVhaGVhZENvbnRhaW5lciBhcyBhbnkpLnVsRWxlbWVudCA9IHRoaXMudWxFbGVtZW50O1xuICAgICAgICAgICAgYWRqdXN0Q29udGFpbmVyUG9zaXRpb24oJCgndHlwZWFoZWFkLWNvbnRhaW5lcicpLCB0aGlzLm5hdGl2ZUVsZW1lbnQsICh0aGlzLnR5cGVhaGVhZCBhcyBhbnkpLl90eXBlYWhlYWQsICQoJ3R5cGVhaGVhZC1jb250YWluZXIgLmRyb3Bkb3duLW1lbnUnKSk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm4oKTtcblxuICAgICAgICAvLyBvcGVuIGZ1bGwtc2NyZWVuIHNlYXJjaCB2aWV3XG4gICAgICAgIGlmICh0aGlzLmlzTW9iaWxlQXV0b0NvbXBsZXRlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRyb3Bkb3duRWwgPSB0aGlzLmRyb3Bkb3duRWwuY2xvc2VzdCgndHlwZWFoZWFkLWNvbnRhaW5lcicpO1xuXG4gICAgICAgICAgICBkcm9wZG93bkVsLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXQ6Zmlyc3QnKSk7XG4gICAgICAgICAgICBjb25zdCBzY3JlZW5IZWlnaHQgPSB0aGlzLiRlbGVtZW50LmNsb3Nlc3QoJy5hcHAtY29udGVudCcpLmhlaWdodCgpO1xuICAgICAgICAgICAgZHJvcGRvd25FbC5jc3Moe3Bvc2l0aW9uOiAncmVsYXRpdmUnLCB0b3A6IDAsIGhlaWdodDogc2NyZWVuSGVpZ2h0ICsgJ3B4J30pO1xuICAgICAgICAgICAgdGhpcy5zaG93Q2xvc2VidG4gPSB0aGlzLnF1ZXJ5ICYmIHRoaXMucXVlcnkgIT09ICcnO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YVByb3ZpZGVyLmlzTGFzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0TmV4dCgpIHtcbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMudHlwZWFoZWFkQ29udGFpbmVyLm1hdGNoZXM7XG5cbiAgICAgICAgaWYgKCFtYXRjaGVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5kZXggPSBtYXRjaGVzLmluZGV4T2YodGhpcy50eXBlYWhlYWRDb250YWluZXIuYWN0aXZlKTtcblxuICAgICAgICAvLyBvbiBrZXlkb3duLCBpZiBzY3JvbGwgaXMgYXQgdGhlIGJvdHRvbSBhbmQgbmV4dCBwYWdlIHJlY29yZHMgYXJlIGF2YWlsYWJsZSwgZmV0Y2ggbmV4dCBwYWdlIGl0ZW1zLlxuICAgICAgICBpZiAoIXRoaXMuX2xvYWRpbmdJdGVtcyAmJiAhdGhpcy5kYXRhUHJvdmlkZXIuaXNMYXN0UGFnZSAmJiBpbmRleCArIDEgPiBtYXRjaGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIC8vIGluZGV4IGlzIHNhdmVkIGluIG9yZGVyIHRvIHNlbGVjdCB0aGUgbGFzdFNlbGVjdGVkIGl0ZW0gaW4gdGhlIGRyb3Bkb3duIGFmdGVyIGZldGNoaW5nIG5leHQgcGFnZSBpdGVtcy5cbiAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmVEYXRhKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRMYXN0QWN0aXZlTWF0Y2hBc1NlbGVjdGVkKCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0U2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgKHRoaXMudHlwZWFoZWFkQ29udGFpbmVyIGFzIGFueSkuX2FjdGl2ZSA9IHRoaXMudHlwZWFoZWFkQ29udGFpbmVyLm1hdGNoZXNbdGhpcy5sYXN0U2VsZWN0ZWRJbmRleF07XG4gICAgICAgICAgICB0aGlzLnR5cGVhaGVhZENvbnRhaW5lci5uZXh0QWN0aXZlTWF0Y2goKTtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSW5kZXggPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHRyaWdnZXJTZWFyY2goKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFQcm92aWRlci5pc0xhc3RQYWdlIHx8ICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsLXNjcmVlbicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZUFoZWFkRHJvcERvd24gPSB0aGlzLmRyb3Bkb3duRWw7XG4gICAgICAgIGNvbnN0ICRsYXN0SXRlbSA9IHR5cGVBaGVhZERyb3BEb3duLmZpbmQoJ2xpJykubGFzdCgpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGxhc3QgaXRlbSBpcyBub3QgYmVsb3cgdGhlIGZ1bGwgc2NyZWVuXG4gICAgICAgIGlmICgkbGFzdEl0ZW0ubGVuZ3RoICYmIHR5cGVBaGVhZERyb3BEb3duLmxlbmd0aCAmJiAodHlwZUFoZWFkRHJvcERvd24uaGVpZ2h0KCkgKyB0eXBlQWhlYWREcm9wRG93bi5wb3NpdGlvbigpLnRvcCA+ICAkbGFzdEl0ZW0uaGVpZ2h0KCkgKyAkbGFzdEl0ZW0ucG9zaXRpb24oKS50b3ApKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlRGF0YSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNVcGRhdGVPbktleVByZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hvbiA9PT0gJ3R5cGluZyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkZWJvdW5jZURlZmF1bHRRdWVyeShkYXRhKSB7XG4gICAgICAgIHRoaXMuX2RlZmF1bHRRdWVyeUludm9rZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmdldERhdGFTb3VyY2UoZGF0YSwgdHJ1ZSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0UXVlcnkgPSB0aGlzLnF1ZXJ5ID0gdGhpcy5xdWVyeU1vZGVsWzBdLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IHRoaXMucXVlcnlNb2RlbFswXS52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5ID0gdGhpcy5xdWVyeU1vZGVsWzBdLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQnlEYXRhdmFsdWUoZGF0YSkge1xuICAgICAgICB0aGlzLnVwZGF0ZUJ5RGF0YXNldChkYXRhKTtcbiAgICAgICAgdGhpcy51cGRhdGVCeURhdGFTb3VyY2UoZGF0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVCeURhdGFTb3VyY2UoZGF0YSkge1xuICAgICAgICAvLyB2YWx1ZSBpcyBwcmVzZW50IGJ1dCB0aGUgY29ycmVzcG9uZGluZyBrZXkgaXMgbm90IGZvdW5kIHRoZW4gZmV0Y2ggbmV4dCBzZXRcbiAgICAgICAgLy8gbW9kZWxCeUtleSB3aWxsIGJlIHNldCBvbmx5IHdoZW4gZGF0YXZhbHVlIGlzIGF2YWlsYWJsZSBpbnNpZGUgdGhlIGxvY2FsRGF0YSBvdGhlcndpc2UgbWFrZSBhIE4vdyBjYWxsLlxuICAgICAgICBpZiAoaXNEZWZpbmVkKGRhdGEpICYmICFfLmlzT2JqZWN0KGRhdGEpICYmIHRoaXMuZGF0YXNvdXJjZSAmJiAhaXNEZWZpbmVkKHRoaXMuX21vZGVsQnlLZXkpICYmIHRoaXMuZGF0YWZpZWxkICE9PSBBTExGSUVMRFMpIHtcbiAgICAgICAgICAgIC8vIEF2b2lkIG1ha2luZyBkZWZhdWx0IHF1ZXJ5IGlmIHF1ZXJ5TW9kZWwgYWxyZWFkeSBleGlzdHMuXG4gICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHRoaXMucXVlcnlNb2RlbCkgJiYgIV8uaXNFbXB0eSh0aGlzLnF1ZXJ5TW9kZWwpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhdmFsdWVGcm9tUXVlcnlNb2RlbCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBkZWZhdWx0IHF1ZXJ5IGNhbGwgb25seSB3aGVuIGRhdGFzb3VyY2Ugc3VwcG9ydHMgQ1JVRCAobGl2ZSB2YXJpYWJsZSkuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RlZmF1bHRRdWVyeUludm9rZWQgJiYgdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlYm91bmNlRGVmYXVsdFF1ZXJ5KGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlcyB0aGUgbW9kZWwgdmFsdWUgdXNpbmcgcXVlcnlNb2RlbFxuICAgIHByaXZhdGUgdXBkYXRlRGF0YXZhbHVlRnJvbVF1ZXJ5TW9kZWwoKSB7XG4gICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IF8uaXNBcnJheSh0aGlzLnF1ZXJ5TW9kZWwpID8gKHRoaXMucXVlcnlNb2RlbFswXSBhcyBEYXRhU2V0SXRlbSkudmFsdWUgOiB0aGlzLnF1ZXJ5TW9kZWw7XG4gICAgICAgIHRoaXMuX21vZGVsQnlLZXkgPSBfLmlzQXJyYXkodGhpcy5xdWVyeU1vZGVsKSA/ICh0aGlzLnF1ZXJ5TW9kZWxbMF0gYXMgRGF0YVNldEl0ZW0pLmtleSA6IHRoaXMucXVlcnlNb2RlbDtcbiAgICAgICAgdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQnlEYXRhc2V0KGRhdGE6IGFueSkge1xuICAgICAgICAvLyBkZWZhdWx0IHF1ZXJ5IGlzIGFscmVhZHkgaW52b2tlZCB0aGVuIGRvIG5vdCBtYWtlIG90aGVyIGRlZmF1bHQgcXVlcnkgY2FsbC5cbiAgICAgICAgLy8gRm9yIGxvY2FsIHNlYXJjaCBpLmUuIHNlYXJjaGtleSBpcyB1bmRlZmluZWQsIGRvIG5vdCByZXR1cm4sIHZlcmlmeSB0aGUgZGF0YXZhbHVlIGFnYWluc3QgdGhlIGRhdGFzZXRJdGVtcyAuXG4gICAgICAgIGlmICh0aGlzLl9kZWZhdWx0UXVlcnlJbnZva2VkICYmIHRoaXMuc2VhcmNoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRJdGVtID0gXy5maW5kKHRoaXMuZGF0YXNldEl0ZW1zLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICAoXy5pc09iamVjdChpdGVtLnZhbHVlKSA/IF8uaXNFcXVhbChpdGVtLnZhbHVlLCBkYXRhKSA6IChfLnRvU3RyaW5nKGl0ZW0udmFsdWUpKS50b0xvd2VyQ2FzZSgpID09PSAoXy50b1N0cmluZyhkYXRhKSkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHNldCB0aGUgZGVmYXVsdCBvbmx5IHdoZW4gaXQgaXMgYXZhaWxhYmxlIGluIGRhdGFzZXQuXG4gICAgICAgIGlmIChzZWxlY3RlZEl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IFtzZWxlY3RlZEl0ZW1dO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YWZpZWxkID09PSBBTExGSUVMRFMgJiYgXy5pc09iamVjdChkYXRhKSkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeU1vZGVsID0gdGhpcy5nZXRUcmFuc2Zvcm1lZERhdGEoZXh0cmFjdERhdGFBc0FycmF5KGRhdGEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZURhdGF2YWx1ZUZyb21RdWVyeU1vZGVsKCk7XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgbGFiZWwgdmFsdWUgb24gaW5wdXQuXG4gICAgICAgIHRoaXMuX2xhc3RRdWVyeSA9IHRoaXMucXVlcnkgPSB0aGlzLnF1ZXJ5TW9kZWwubGVuZ3RoID8gdGhpcy5xdWVyeU1vZGVsWzBdLmxhYmVsIDogJyc7XG4gICAgfVxuXG5cbiAgICAvLyBUaGlzIG1ldGhvZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHByb3ZpZGVzIHRoZSBmaWx0ZXJlZCBkYXRhIGZyb20gdGhlIGRhdGFzb3VyY2UuXG4gICAgcHVibGljIGdldERhdGFTb3VyY2UocXVlcnk6IEFycmF5PHN0cmluZz4gfCBzdHJpbmcsIHNlYXJjaE9uRGF0YUZpZWxkPzogYm9vbGVhbiwgbmV4dEl0ZW1JbmRleD86IG51bWJlcik6IFByb21pc2U8RGF0YVNldEl0ZW1bXT4ge1xuICAgICAgICAvLyBGb3IgZGVmYXVsdCBxdWVyeSwgc2VhcmNoT25EYXRhRmllbGQgaXMgc2V0IHRvIHRydWUsIHRoZW4gZG8gbm90IG1ha2UgYSBuL3cgY2FsbCB3aGVuIGRhdGFmaWVsZCBpcyBBTExGSUVMRFNcbiAgICAgICAgaWYgKHNlYXJjaE9uRGF0YUZpZWxkICYmIHRoaXMuZGF0YWZpZWxkID09PSBBTExGSUVMRFMpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRpbmdJdGVtcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGb3IgZGVmYXVsdCBkYXRhdmFsdWUsIHNlYXJjaCBrZXkgYXMgdG8gYmUgb24gZGF0YWZpZWxkIHRvIGdldCB0aGUgZGVmYXVsdCBkYXRhIGZyb20gdGhlIGZpbHRlciBjYWxsLlxuICAgICAgICBjb25zdCBkYXRhQ29uZmlnOiBJRGF0YVByb3ZpZGVyQ29uZmlnID0ge1xuICAgICAgICAgICAgZGF0YXNldDogdGhpcy5kYXRhc2V0ID8gY29udmVydERhdGFUb09iamVjdCh0aGlzLmRhdGFzZXQpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgYmluZGRhdGFzZXQ6IHRoaXMuYmluZGRhdGFzZXQsXG4gICAgICAgICAgICBkYXRhc291cmNlOiB0aGlzLmRhdGFzb3VyY2UsXG4gICAgICAgICAgICBkYXRhZmllbGQ6IHRoaXMuZGF0YWZpZWxkLFxuICAgICAgICAgICAgaGFzRGF0YTogdGhpcy5kYXRhc2V0ICYmIHRoaXMuZGF0YXNldC5sZW5ndGgsXG4gICAgICAgICAgICBxdWVyeTogcXVlcnksXG4gICAgICAgICAgICBpc0xvY2FsRmlsdGVyOiAhdGhpcy5zZWFyY2hrZXksXG4gICAgICAgICAgICBzZWFyY2hLZXk6IHNlYXJjaE9uRGF0YUZpZWxkID8gdGhpcy5kYXRhZmllbGQgOiB0aGlzLnNlYXJjaGtleSxcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgc2VhcmNoIGNhbGwgbWF0Y2ggbW9kZSBzaG91bGQgYmUgc3RhcnRpZ25vcmVjYXNlXG4gICAgICAgICAgICBtYXRjaE1vZGU6IHNlYXJjaE9uRGF0YUZpZWxkID8gJ3N0YXJ0aWdub3JlY2FzZScgOiB0aGlzLm1hdGNobW9kZSxcbiAgICAgICAgICAgIGNhc2VzZW5zaXRpdmU6IHRoaXMuY2FzZXNlbnNpdGl2ZSxcbiAgICAgICAgICAgIGlzZm9ybWZpZWxkOiB0aGlzLmlzZm9ybWZpZWxkLFxuICAgICAgICAgICAgb3JkZXJieTogdGhpcy5vcmRlcmJ5LFxuICAgICAgICAgICAgbGltaXQ6IHRoaXMubGltaXQsXG4gICAgICAgICAgICBwYWdlc2l6ZTogdGhpcy5wYWdlc2l6ZSxcbiAgICAgICAgICAgIHBhZ2U6IHRoaXMucGFnZSxcbiAgICAgICAgICAgIG9uQmVmb3Jlc2VydmljZWNhbGw6IHRoaXMub25CZWZvcmVzZXJ2aWNlY2FsbC5iaW5kKHRoaXMpXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMuZGF0YW9wdGlvbnMpIHtcbiAgICAgICAgICAgIGRhdGFDb25maWcuZGF0YW9wdGlvbnMgPSB0aGlzLmRhdGFvcHRpb25zO1xuICAgICAgICAgICAgZGF0YUNvbmZpZy52aWV3UGFyZW50ID0gdGhpcy52aWV3UGFyZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhUHJvdmlkZXIuZmlsdGVyKGRhdGFDb25maWcpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXNwb25zZSBmcm9tIGRhdGFQcm92aWRlciByZXR1cm5zIGFsd2F5cyBkYXRhIG9iamVjdC5cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSByZXNwb25zZS5kYXRhIHx8IHJlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBzZXJ2aWNlIHZhcmlhYmxlLCB1cGRhdGluZyB0aGUgZGF0YXNldCBvbmx5IGlmIGl0IGlzIG5vdCBkZWZpbmVkIG9yIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIGlmICgoIWlzRGVmaW5lZCh0aGlzLmRhdGFzZXQpIHx8ICF0aGlzLmRhdGFzZXQubGVuZ3RoKSAmJiB0aGlzLmRhdGFQcm92aWRlci51cGRhdGVEYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFzZXQgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGFQcm92aWRlci5oYXNNb3JlRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXR0ZWREYXRhc2V0ID0gdGhpcy5mb3JtYXR0ZWREYXRhc2V0LmNvbmNhdChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1hdHRlZERhdGFzZXQgPSByZXNwb25zZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGV4cGxpY2l0bHkgc2V0dGluZyB0aGUgb3B0aW9uc2xpbWl0IGFzIHRoZSBtYXRjaGVzIG1vcmUgdGhhbiAyMCB3aWxsIGJlIGlnbm9yZWQgaWYgb3B0aW9uc2xpbWl0IGlzIG5vdCBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvcm1hdHRlZERhdGFzZXQubGVuZ3RoID4gMjAgJiYgIWlzRGVmaW5lZCh0aGlzLmxpbWl0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWQudHlwZWFoZWFkT3B0aW9uc0xpbWl0ID0gdGhpcy5mb3JtYXR0ZWREYXRhc2V0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSW4gbW9iaWxlLCB0cmlnZ2VyIHRoZSBzZWFyY2ggYnkgZGVmYXVsdCB1bnRpbCB0aGUgcmVzdWx0cyBoYXZlIGhlaWdodCB1cHRvIHBhZ2UgaGVpZ2h0LiBPdGhlciByZXN1bHRzIGNhbiBiZSBmZXRjaGVkIGJ5IHNjcm9sbGluZ1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc09wZW4gJiYgdGhpcy5pc01vYmlsZUF1dG9Db21wbGV0ZSgpICYmICF0aGlzLmRhdGFQcm92aWRlci5pc0xhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlclNlYXJjaCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGEgPSB0aGlzLmdldFRyYW5zZm9ybWVkRGF0YSh0aGlzLmZvcm1hdHRlZERhdGFzZXQsIG5leHRJdGVtSW5kZXgpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc3VsdCBjb250YWlucyB0aGUgZGF0YWZpZWxkIHZhbHVlcy5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSBfLm1hcCh0cmFuc2Zvcm1lZERhdGEsICd2YWx1ZScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWREYXRhO1xuICAgICAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzU2Nyb2xsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgKF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRMYXN0QWN0aXZlTWF0Y2hBc1NlbGVjdGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDMwKSkoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1Njcm9sbGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFdoZW4gbm8gcmVzdWx0IGlzIGZvdW5kLCBzZXQgdGhlIGRhdGF2YWx1ZSB0byB1bmRlZmluZWQuXG4gICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWVyeU1vZGVsID0gKHF1ZXJ5IGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIG9uIGZvY3Vzb3V0IGkuZS4gb24gb3RoZXIgd2lkZ2V0IGZvY3VzLCBpZiBuL3cgaXMgcGVuZGluZyBsb2FkaW5nIGljb24gaXMgc2hvd24sIHdoZW4gZGF0YSBpcyBhdmFpbGFibGUgdGhlbiBkcm9wZG93biBpcyBzaG93biBhZ2Fpbi5cbiAgICAgICAgICAgICAgICAvLyBvbiB1bnN1YnNjcmliaW5nIGRvIG5vdCBzaG93IHRoZSByZXN1bHRzLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl91bnN1YnNjcmliZUR2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0UmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VHJhbnNmb3JtZWREYXRhKGRhdGE6IGFueSwgaXRlbUluZGV4PzogbnVtYmVyLCBpc2N1c3RvbT86IGJvb2xlYW4pOiBEYXRhU2V0SXRlbVtdIHtcbiAgICAgICAgaWYgKGlzRGVmaW5lZChpdGVtSW5kZXgpKSB7XG4gICAgICAgICAgICBpdGVtSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRyYW5zZm9ybURhdGEoXG4gICAgICAgICAgICB0aGlzLnZpZXdQYXJlbnQsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgdGhpcy5kYXRhZmllbGQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGlzcGxheUZpZWxkOiB0aGlzLmRpc3BsYXlsYWJlbCB8fCB0aGlzLmRpc3BsYXlmaWVsZCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5RXhwcjogaXNjdXN0b20gPyAnJyA6IHRoaXMuZGlzcGxheWV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgYmluZERpc3BsYXlFeHByOiBpc2N1c3RvbSA/ICcnIDogdGhpcy5iaW5kZGlzcGxheWxhYmVsLFxuICAgICAgICAgICAgICAgIGJpbmREaXNwbGF5SW1nU3JjOiB0aGlzLmJpbmRkaXNwbGF5aW1hZ2VzcmMsXG4gICAgICAgICAgICAgICAgZGlzcGxheUltZ1NyYzogdGhpcy5kaXNwbGF5aW1hZ2VzcmNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpdGVtSW5kZXhcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGdldFVuaXFPYmpzQnlEYXRhRmllbGQodHJhbnNmb3JtZWREYXRhLCB0aGlzLmRhdGFmaWVsZCwgdGhpcy5kaXNwbGF5ZmllbGQgfHwgdGhpcy5kaXNwbGF5bGFiZWwsIHRvQm9vbGVhbih0aGlzLmFsbG93ZW1wdHkpKTtcbiAgICB9XG5cbiAgICAvLyBPcHRpb25zTGlzdFRlbXBsYXRlIGxpc3RlbnMgdG8gdGhlIHNjcm9sbCBldmVudCBhbmQgdHJpZ2dlcnMgdGhpcyBmdW5jdGlvbi5cbiAgICBwdWJsaWMgb25TY3JvbGwoJHNjcm9sbEVsOiBFbGVtZW50LCBldnQ6IEV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRvdGFsSGVpZ2h0ID0gJHNjcm9sbEVsLnNjcm9sbEhlaWdodCxcbiAgICAgICAgICAgIGNsaWVudEhlaWdodCA9ICRzY3JvbGxFbC5jbGllbnRIZWlnaHQ7XG5cbiAgICAgICAgLy8gSWYgc2Nyb2xsIGlzIGF0IHRoZSBib3R0b20gYW5kIG5vIHJlcXVlc3QgaXMgaW4gcHJvZ3Jlc3MgYW5kIG5leHQgcGFnZSByZWNvcmRzIGFyZSBhdmFpbGFibGUsIGZldGNoIG5leHQgcGFnZSBpdGVtcy5cbiAgICAgICAgaWYgKCF0aGlzLl9sb2FkaW5nSXRlbXMgJiYgIXRoaXMuZGF0YVByb3ZpZGVyLmlzTGFzdFBhZ2UgJiYgKCRzY3JvbGxFbC5zY3JvbGxUb3AgKyBjbGllbnRIZWlnaHQgPj0gdG90YWxIZWlnaHQpKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlRGF0YSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcblxuICAgICAgICBpZiAoIWlzRGVmaW5lZCh0aGlzLm1pbmNoYXJzKSkge1xuICAgICAgICAgICAgLy8gZm9yIGF1dG9jb21wbGV0ZSBzZXQgdGhlIG1pbmNoYXJzIHRvIDBcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdhdXRvY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5jaGFycyA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWluY2hhcnMgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IHRoaXMuaXNVcGRhdGVPbktleVByZXNzKCk7XG5cbiAgICAgICAgLy8gYnkgZGVmYXVsdCBmb3IgYXV0b2NvbXBsZXRlIGRvIG5vdCBzaG93IHRoZSBzZWFyY2ggaWNvblxuICAgICAgICAvLyBieSBkZWZhdWx0IHNob3cgdGhlIHNlYXJjaGljb24gZm9yIHR5cGUgPSBzZWFyY2hcbiAgICAgICAgdGhpcy5zaG93c2VhcmNoaWNvbiA9IGlzRGVmaW5lZCh0aGlzLnNob3dzZWFyY2hpY29uKSA/IHRoaXMuc2hvd3NlYXJjaGljb24gOiAodGhpcy50eXBlID09PSAnc2VhcmNoJyk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlcmVkIG9uIHNlbGVjdCBvbiBvcHRpb24gZnJvbSB0aGUgbGlzdC4gU2V0IHRoZSBxdWVyeU1vZGVsLCBxdWVyeSBhbmQgbW9kZWxCeUtleSBmcm9tIHRoZSBtYXRjaGVkIGl0ZW0uXG4gICAgcHVibGljIHR5cGVhaGVhZE9uU2VsZWN0KG1hdGNoOiBUeXBlYWhlYWRNYXRjaCwgJGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBpdGVtID0gbWF0Y2guaXRlbTtcbiAgICAgICAgdGhpcy5xdWVyeU1vZGVsID0gaXRlbTtcbiAgICAgICAgaXRlbS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMucXVlcnkgPSBpdGVtLmxhYmVsO1xuICAgICAgICAkZXZlbnQgPSAkZXZlbnQgfHwgdGhpcy4kdHlwZWFoZWFkRXZlbnQ7XG5cbiAgICAgICAgLy8gQXMgaXRlbS5rZXkgY2FuIHZhcnkgZnJvbSBrZXkgaW4gdGhlIGRhdGFzZXRJdGVtc1xuICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5ID0gaXRlbS5rZXk7XG4gICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IGl0ZW0udmFsdWU7XG5cbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLmRhdGF2YWx1ZSwgJGV2ZW50IHx8IHt9KTtcbiAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2Z1bGwtc2NyZWVuJykpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VTZWFyY2goKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdCcsIHskZXZlbnQsIHNlbGVjdGVkVmFsdWU6IHRoaXMuZGF0YXZhbHVlfSk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VibWl0JywgeyRldmVudH0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlUHJldkRhdGF2YWx1ZSh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y6IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2hlbiBkYXRhb3B0aW9ucyBhcmUgcHJvdmlkZWQgYW5kIHRoZXJlIGlzIG5vIGRpc3BsYXlsYWJlbCBnaXZlbiB0aGVuIGRpc3BsYXlsYWJlbCBpcyBzZXQgYXMgdGhlIHJlbGF0ZWRmaWVsZFxuICAgICAgICBpZiAoa2V5ID09PSAnZGlzcGxheWxhYmVsJyAmJiB0aGlzLmRhdGFvcHRpb25zICYmIHRoaXMuYmluZGRpc3BsYXlsYWJlbCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5xdWVyeSA9IF8uZ2V0KHRoaXMuX21vZGVsQnlWYWx1ZSwgbnYpIHx8IHRoaXMuX21vZGVsQnlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG59XG4iXX0=