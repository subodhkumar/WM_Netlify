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
const WIDGET_CONFIG = { widgetType: 'wm-search', hostClass: 'input-group' };
export class SearchComponent extends DatasetAwareFormComponent {
    constructor(inj, binddatavalue, binddataset) {
        super(inj, WIDGET_CONFIG);
        this.binddatavalue = binddatavalue;
        this.binddataset = binddataset;
        this.query = '';
        this.page = 1;
        // this flag will not allow the empty datafield values.
        this.allowempty = false;
        addClass(this.nativeElement, 'app-search', true);
        /**
         * Listens for the change in the ngModel on every search and retrieves the data as observable.
         * This observable data is passed to the typeahead.
         * @type {Observable<any>}
         */
        this.typeaheadDataSource = Observable
            .create((observer) => {
            // Runs on every search
            if (this.listenQuery) {
                if (this.isMobileAutoComplete() && !this.$element.hasClass('full-screen')) {
                    this.renderMobileAutoComplete();
                    return;
                }
                this._defaultQueryInvoked = false;
                this._loadingItems = true;
                observer.next(this.query);
            }
            // on keydown, while scrolling the dropdown items, when last item is reached next call is triggered
            // unless the call is resolved, we are able to scroll next to first item and soon
            // This shows flickering from first item to next new items appended.
            // By setting container to undefined, key events changes will be stopped while loading items
            if (this.lastSelectedIndex) {
                this.typeahead._container = undefined;
            }
        }).pipe(mergeMap((token) => this.getDataSourceAsObservable(token)));
        this.dataProvider = new DataProvider();
        /**
         * When default datavalue is not found within the dataset, a filter call is made to get the record using fetchDefaultModel.
         * after getting the response, set the queryModel and query.
         */
        const datavalueSubscription = this.datavalue$.subscribe((val) => {
            const query = (_.isArray(val) ? val[0] : val);
            if (query === null || query === '') {
                this._modelByValue = '';
                // reset the query.
                this.query = this.queryModel = '';
                // on clear or reset filter, empty the lastResults to fetch new records.
                this._lastResult = undefined;
                return;
            }
            if (!this._unsubscribeDv) {
                this._defaultQueryInvoked = false;
                // if prev datavalue is not equal to current datavalue then clear the modelByKey and queryModel
                if (!_.isObject(val) && this.prevDatavalue !== val) {
                    this._modelByKey = undefined;
                    this.query = this.queryModel = '';
                }
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                this.updateByDatavalue(val);
            }
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
        const datasetSubscription = this.dataset$.subscribe(() => {
            // set the next item index.
            this.startIndex = this.datasetItems.length;
            this.updateByDataset(this.datavalue || this.toBeProcessedDatavalue);
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
    }
    // getter setter is added to pass the datasource to searchcomponent.
    get datasource() {
        return this._datasource;
    }
    set datasource(nv) {
        this._datasource = nv;
        const data = this.datavalue || this.toBeProcessedDatavalue;
        this.updateByDatavalue(data);
    }
    // on clear, trigger search with page size 1
    clearSearch($event, loadOnClear) {
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
    }
    // Close the full screen mode in mobile view of auto complete
    closeSearch() {
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
    }
    renderMobileAutoComplete() {
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
    }
    getDataSourceAsObservable(query) {
        // show dropdown only when there is change in query. This should not apply when dataoptions with filterFields are updated.
        // when lastResult is not available i.e. still the first call is pending and second query is invoked then do not return.
        if (this._lastQuery === query && !_.get(this.dataoptions, 'filterFields') && isDefined(this._lastResult)) {
            this._loadingItems = false;
            return of(this._lastResult);
        }
        this._lastQuery = this.query;
        return from(this.getDataSource(query));
    }
    handleEvent(node, eventName, eventCallback, locals) {
        if (!_.includes(['blur', 'focus', 'select', 'submit', 'change'], eventName)) {
            super.handleEvent(node, eventName, eventCallback, locals);
        }
    }
    // highlight the characters in the dropdown matching the query.
    highlight(match, query) {
        if (this.typeaheadContainer) {
            // highlight of chars will work only when label are strings.
            match.value = match.item.label.toString();
            return this.typeaheadContainer.highlight(match, query);
        }
    }
    // inserts the element at the index position
    insertAtIndex(i) {
        if (i === 0) {
            this.parentEl.prepend(this.$element);
        }
        else {
            const $elAtIndex = this.parentEl.children().eq(i);
            if ($elAtIndex.length) {
                this.$element.insertBefore(this.parentEl.children().eq(i));
            }
            else {
                this.$element.insertAfter(this.parentEl.children().eq(i - 1));
            }
        }
    }
    // Check if the widget is of type autocomplete in mobile view/ app
    isMobileAutoComplete() {
        return this.type === 'autocomplete' && isMobile();
    }
    loadMoreData(incrementPage) {
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
    }
    // on focusout, subscribe to the datavalue changes again
    onFocusOut() {
        this._unsubscribeDv = false;
        this._loadingItems = false;
        // reset the page value on focusout.
        this.page = 1;
        // if domUpdated is true then do not hide the dropdown in the fullscreen
        if (!this._domUpdated && this._isOpen) {
            this.listenQuery = false;
            // hide the typeahead only after the item is selected from dropdown.
            setTimeout(() => {
                if (this.typeahead._typeahead.isShown) {
                    this.typeahead.hide();
                }
            }, 200);
        }
        this._isOpen = false;
        // on outside click, typeahead is hidden. To avoid this, when fullscreen is set, overridding isFocused flag on the typeahead container
        if (this._domUpdated && this.typeahead && this.typeahead._container) {
            this.typeahead._container.isFocused = true;
        }
    }
    onInputChange($event) {
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
                this.invokeEventCallback('submit', { $event });
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
    }
    // Triggered for enter event
    handleEnterEvent($event) {
        // submit event triggered when there is no search results
        if (!this.typeahead._container) {
            this.onSelect($event);
        }
    }
    // Triggerred when typeahead option is selected.
    onSelect($event) {
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
            this.invokeEventCallback('submit', { $event });
        }
    }
    onBeforeservicecall(inputData) {
        this.invokeEventCallback('beforeservicecall', { inputData });
    }
    onDropdownOpen() {
        // setting the ulElements, liElement on typeaheadContainer.
        // as we are using customOption template, liElements are not available on typeaheadContainer so append them explicitly.
        const fn = _.debounce(() => {
            this._isOpen = true;
            this.typeaheadContainer = this.typeahead._container || this.typeahead._typeahead.instance;
            this.typeaheadContainer.liElements = this.liElements;
            this.typeaheadContainer.ulElement = this.ulElement;
            adjustContainerPosition($('typeahead-container'), this.nativeElement, this.typeahead._typeahead, $('typeahead-container .dropdown-menu'));
        });
        fn();
        // open full-screen search view
        if (this.isMobileAutoComplete()) {
            const dropdownEl = this.dropdownEl.closest('typeahead-container');
            dropdownEl.insertAfter(this.$element.find('input:first'));
            const screenHeight = this.$element.closest('.app-content').height();
            dropdownEl.css({ position: 'relative', top: 0, height: screenHeight + 'px' });
            this.showClosebtn = this.query && this.query !== '';
            if (!this.dataProvider.isLastPage) {
                this.triggerSearch();
            }
        }
    }
    selectNext() {
        const matches = this.typeaheadContainer.matches;
        if (!matches) {
            return;
        }
        const index = matches.indexOf(this.typeaheadContainer.active);
        // on keydown, if scroll is at the bottom and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && index + 1 > matches.length - 1) {
            // index is saved in order to select the lastSelected item in the dropdown after fetching next page items.
            this.lastSelectedIndex = index;
            this.loadMoreData(true);
        }
    }
    setLastActiveMatchAsSelected() {
        if (this.lastSelectedIndex) {
            this.typeaheadContainer._active = this.typeaheadContainer.matches[this.lastSelectedIndex];
            this.typeaheadContainer.nextActiveMatch();
            this.lastSelectedIndex = undefined;
        }
    }
    triggerSearch() {
        if (this.dataProvider.isLastPage || !this.$element.hasClass('full-screen')) {
            return;
        }
        const typeAheadDropDown = this.dropdownEl;
        const $lastItem = typeAheadDropDown.find('li').last();
        // Check if last item is not below the full screen
        if ($lastItem.length && typeAheadDropDown.length && (typeAheadDropDown.height() + typeAheadDropDown.position().top > $lastItem.height() + $lastItem.position().top)) {
            this.loadMoreData(true);
        }
    }
    isUpdateOnKeyPress() {
        return this.searchon === 'typing';
    }
    debounceDefaultQuery(data) {
        this._defaultQueryInvoked = true;
        this.getDataSource(data, true).then((response) => {
            if (response.length) {
                this.queryModel = response;
                this._lastQuery = this.query = this.queryModel[0].label || '';
                this._modelByValue = this.queryModel[0].value;
                this._modelByKey = this.queryModel[0].key;
            }
            else {
                this._modelByValue = undefined;
                this.queryModel = undefined;
                this.query = '';
            }
        });
    }
    updateByDatavalue(data) {
        this.updateByDataset(data);
        this.updateByDataSource(data);
    }
    updateByDataSource(data) {
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
    }
    // updates the model value using queryModel
    updateDatavalueFromQueryModel() {
        this._modelByValue = _.isArray(this.queryModel) ? this.queryModel[0].value : this.queryModel;
        this._modelByKey = _.isArray(this.queryModel) ? this.queryModel[0].key : this.queryModel;
        this.toBeProcessedDatavalue = undefined;
    }
    updateByDataset(data) {
        // default query is already invoked then do not make other default query call.
        // For local search i.e. searchkey is undefined, do not return, verify the datavalue against the datasetItems .
        if (this._defaultQueryInvoked && this.searchkey) {
            return;
        }
        const selectedItem = _.find(this.datasetItems, (item) => {
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
    }
    // This method returns a promise that provides the filtered data from the datasource.
    getDataSource(query, searchOnDataField, nextItemIndex) {
        // For default query, searchOnDataField is set to true, then do not make a n/w call when datafield is ALLFIELDS
        if (searchOnDataField && this.datafield === ALLFIELDS) {
            this._loadingItems = false;
            return Promise.resolve([]);
        }
        // For default datavalue, search key as to be on datafield to get the default data from the filter call.
        const dataConfig = {
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
            .then((response) => {
            // response from dataProvider returns always data object.
            response = response.data || response;
            // for service variable, updating the dataset only if it is not defined or empty
            if ((!isDefined(this.dataset) || !this.dataset.length) && this.dataProvider.updateDataset) {
                this.dataset = response;
            }
            if (this.dataProvider.hasMoreData) {
                this.formattedDataset = this.formattedDataset.concat(response);
            }
            else {
                this.formattedDataset = response;
            }
            // explicitly setting the optionslimit as the matches more than 20 will be ignored if optionslimit is not specified.
            if (this.formattedDataset.length > 20 && !isDefined(this.limit)) {
                this.typeahead.typeaheadOptionsLimit = this.formattedDataset.length;
            }
            // In mobile, trigger the search by default until the results have height upto page height. Other results can be fetched by scrolling
            if (this._isOpen && this.isMobileAutoComplete() && !this.dataProvider.isLastPage) {
                this.triggerSearch();
            }
            const transformedData = this.getTransformedData(this.formattedDataset, nextItemIndex);
            // result contains the datafield values.
            this.result = _.map(transformedData, 'value');
            return transformedData;
        }, (error) => {
            this._loadingItems = false;
            return [];
        }).then(result => {
            if (this.isScrolled) {
                (_.debounce(() => {
                    this.setLastActiveMatchAsSelected();
                }, 30))();
                this.isScrolled = false;
            }
            // When no result is found, set the datavalue to undefined.
            if (!result.length) {
                this._modelByValue = undefined;
                this.queryModel = query;
            }
            // on focusout i.e. on other widget focus, if n/w is pending loading icon is shown, when data is available then dropdown is shown again.
            // on unsubscribing do not show the results.
            if (this._unsubscribeDv) {
                result = [];
            }
            this._loadingItems = false;
            this._lastResult = result;
            return result;
        });
    }
    getTransformedData(data, itemIndex, iscustom) {
        if (isDefined(itemIndex)) {
            itemIndex++;
        }
        const transformedData = transformData(this.viewParent, data, this.datafield, {
            displayField: this.displaylabel || this.displayfield,
            displayExpr: iscustom ? '' : this.displayexpression,
            bindDisplayExpr: iscustom ? '' : this.binddisplaylabel,
            bindDisplayImgSrc: this.binddisplayimagesrc,
            displayImgSrc: this.displayimagesrc
        }, itemIndex);
        return getUniqObjsByDataField(transformedData, this.datafield, this.displayfield || this.displaylabel, toBoolean(this.allowempty));
    }
    // OptionsListTemplate listens to the scroll event and triggers this function.
    onScroll($scrollEl, evt) {
        const totalHeight = $scrollEl.scrollHeight, clientHeight = $scrollEl.clientHeight;
        // If scroll is at the bottom and no request is in progress and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && ($scrollEl.scrollTop + clientHeight >= totalHeight)) {
            this.loadMoreData(true);
        }
    }
    ngOnInit() {
        super.ngOnInit();
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
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement, this);
    }
    // triggered on select on option from the list. Set the queryModel, query and modelByKey from the matched item.
    typeaheadOnSelect(match, $event) {
        const item = match.item;
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
        this.invokeEventCallback('select', { $event, selectedValue: this.datavalue });
        this.invokeEventCallback('submit', { $event });
        this.updatePrevDatavalue(this.datavalue);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        // when dataoptions are provided and there is no displaylabel given then displaylabel is set as the relatedfield
        if (key === 'displaylabel' && this.dataoptions && this.binddisplaylabel === null) {
            this.query = _.get(this._modelByValue, nv) || this._modelByValue;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
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
SearchComponent.ctorParameters = () => [
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['datavalue.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] }
];
SearchComponent.propDecorators = {
    typeahead: [{ type: ViewChild, args: [TypeaheadDirective,] }],
    ulElement: [{ type: ViewChild, args: ['ulElement',] }],
    liElements: [{ type: ViewChildren, args: ['liElements',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2VhcmNoL3NlYXJjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEksT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVDLE9BQU8sRUFBZ0IsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEQsT0FBTyxFQUErQixrQkFBa0IsRUFBa0IsTUFBTSxlQUFlLENBQUM7QUFFaEcsT0FBTyxFQUFFLFFBQVEsRUFBRSx1QkFBdUIsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekcsT0FBTyxFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0YsT0FBTyxFQUFFLG1CQUFtQixFQUFlLGtCQUFrQixFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hJLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxZQUFZLEVBQXNDLE1BQU0sK0JBQStCLENBQUM7QUFJakcsTUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFF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RnpELFNBQVMsU0FBQyxnQkFBZ0I7NENBQzFCLFNBQVMsU0FBQyxjQUFjOzs7d0JBdkM1QixTQUFTLFNBQUMsa0JBQWtCO3dCQUM1QixTQUFTLFNBQUMsV0FBVzt5QkFDckIsWUFBWSxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIE9uSW5pdCwgUXVlcnlMaXN0LCBWaWV3Q2hpbGQsIFZpZXdDaGlsZHJlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBmcm9tLCBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBtZXJnZU1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgVHlwZWFoZWFkQ29udGFpbmVyQ29tcG9uZW50LCBUeXBlYWhlYWREaXJlY3RpdmUsIFR5cGVhaGVhZE1hdGNoIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7IGFkZENsYXNzLCBhZGp1c3RDb250YWluZXJQb3NpdGlvbiwgRGF0YVNvdXJjZSwgaXNEZWZpbmVkLCBpc01vYmlsZSwgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBjb252ZXJ0RGF0YVRvT2JqZWN0LCBEYXRhU2V0SXRlbSwgZXh0cmFjdERhdGFBc0FycmF5LCBnZXRVbmlxT2Jqc0J5RGF0YUZpZWxkLCB0cmFuc2Zvcm1EYXRhIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vc2VhcmNoLnByb3BzJztcbmltcG9ydCB7IEFMTEZJRUxEUyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgRGF0YVByb3ZpZGVyLCBJRGF0YVByb3ZpZGVyLCBJRGF0YVByb3ZpZGVyQ29uZmlnIH0gZnJvbSAnLi9kYXRhLXByb3ZpZGVyL2RhdGEtcHJvdmlkZXInO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXNlYXJjaCcsIGhvc3RDbGFzczogJ2lucHV0LWdyb3VwJ307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtU2VhcmNoXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3NlYXJjaC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihTZWFyY2hDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoU2VhcmNoQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgU2VhcmNoQ29tcG9uZW50IGV4dGVuZHMgRGF0YXNldEF3YXJlRm9ybUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBwdWJsaWMgY2FzZXNlbnNpdGl2ZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgc2VhcmNoa2V5OiBzdHJpbmc7XG4gICAgcHVibGljIHF1ZXJ5TW9kZWw6IEFycmF5PERhdGFTZXRJdGVtPiB8IHN0cmluZztcbiAgICBwdWJsaWMgcXVlcnkgPSAnJztcbiAgICBwdWJsaWMgbGltaXQ6IGFueTtcbiAgICBwdWJsaWMgc2hvd3NlYXJjaGljb246IGJvb2xlYW47XG4gICAgcHVibGljIG1pbmNoYXJzOiBudW1iZXI7XG4gICAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgICBwdWJsaWMgbmF2c2VhcmNoYmFyOiBhbnk7XG4gICAgcHVibGljIGRlYm91bmNldGltZTogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSB0eXBlYWhlYWREYXRhU291cmNlOiBPYnNlcnZhYmxlPGFueT47XG4gICAgcHJpdmF0ZSBwYWdlc2l6ZTogYW55O1xuICAgIHByaXZhdGUgcGFnZSA9IDE7XG4gICAgcHVibGljIF9sb2FkaW5nSXRlbXM6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBkYXRhUHJvdmlkZXI6IElEYXRhUHJvdmlkZXI7XG4gICAgcHJpdmF0ZSByZXN1bHQ6IEFycmF5PGFueT47IC8vIGNvbnRhaW5zIHRoZSBzZWFyY2ggcmVzdWx0IGkuZS4gbWF0Y2hlc1xuICAgIHByaXZhdGUgZm9ybWF0dGVkRGF0YXNldDogYW55O1xuICAgIHByaXZhdGUgaXNmb3JtZmllbGQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSAkdHlwZWFoZWFkRXZlbnQ6IEV2ZW50O1xuXG4gICAgcHVibGljIHRhYmluZGV4OiBudW1iZXI7XG4gICAgcHVibGljIHN0YXJ0SW5kZXg6IG51bWJlcjtcbiAgICBwdWJsaWMgYmluZGRpc3BsYXlsYWJlbDogc3RyaW5nO1xuICAgIHB1YmxpYyB0eXBlYWhlYWRDb250YWluZXI6IFR5cGVhaGVhZENvbnRhaW5lckNvbXBvbmVudDtcblxuICAgIEBWaWV3Q2hpbGQoVHlwZWFoZWFkRGlyZWN0aXZlKSB0eXBlYWhlYWQ6IFR5cGVhaGVhZERpcmVjdGl2ZTtcbiAgICBAVmlld0NoaWxkKCd1bEVsZW1lbnQnKSB1bEVsZW1lbnQ6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZHJlbignbGlFbGVtZW50cycpIGxpRWxlbWVudHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcblxuICAgIHByaXZhdGUgYWxsb3dvbmx5c2VsZWN0OiBib29sZWFuO1xuICAgIHByaXZhdGUgY2xhc3M6IHN0cmluZztcblxuICAgIHByaXZhdGUgbGFzdFNlbGVjdGVkSW5kZXg6IG51bWJlcjtcbiAgICBwcml2YXRlIGRhdGFvcHRpb25zOiBhbnk7XG4gICAgcHVibGljIGRyb3Bkb3duRWw6IGFueTtcbiAgICBwcml2YXRlIF9sYXN0UXVlcnk6IHN0cmluZztcbiAgICBwcml2YXRlIF9sYXN0UmVzdWx0OiBhbnk7XG4gICAgcHJpdmF0ZSBfaXNPcGVuOiBib29sZWFuOyAvLyBzZXQgdG8gdHJ1ZSB3aGVuIGRyb3Bkb3duIGlzIG9wZW5cbiAgICBwcml2YXRlIHNob3dDbG9zZWJ0bjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF91bnN1YnNjcmliZUR2OiBib29sZWFuO1xuICAgIHByaXZhdGUgX2RhdGFzb3VyY2U6IGFueTtcbiAgICBwcml2YXRlIGlzU2Nyb2xsZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBwYXJlbnRFbDogYW55O1xuICAgIHByaXZhdGUgcG9zaXRpb246IHN0cmluZztcbiAgICBwcml2YXRlIGVsSW5kZXg6IG51bWJlcjtcbiAgICBwcml2YXRlIGxpc3RlblF1ZXJ5OiBib29sZWFuO1xuICAgIHByaXZhdGUgX2RvbVVwZGF0ZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBzZWFyY2hvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBtYXRjaG1vZGU6IHN0cmluZztcblxuICAgIC8vIGdldHRlciBzZXR0ZXIgaXMgYWRkZWQgdG8gcGFzcyB0aGUgZGF0YXNvdXJjZSB0byBzZWFyY2hjb21wb25lbnQuXG4gICAgZ2V0IGRhdGFzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhc291cmNlO1xuICAgIH1cblxuICAgIHNldCBkYXRhc291cmNlKG52KSB7XG4gICAgICAgIHRoaXMuX2RhdGFzb3VyY2UgPSBudjtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGVCeURhdGF2YWx1ZShkYXRhKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXZhbHVlLmJpbmQnKSBwdWJsaWMgYmluZGRhdGF2YWx1ZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJykgcHVibGljIGJpbmRkYXRhc2V0XG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIC8vIHRoaXMgZmxhZyB3aWxsIG5vdCBhbGxvdyB0aGUgZW1wdHkgZGF0YWZpZWxkIHZhbHVlcy5cbiAgICAgICAgdGhpcy5hbGxvd2VtcHR5ID0gZmFsc2U7XG5cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnYXBwLXNlYXJjaCcsIHRydWUpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0ZW5zIGZvciB0aGUgY2hhbmdlIGluIHRoZSBuZ01vZGVsIG9uIGV2ZXJ5IHNlYXJjaCBhbmQgcmV0cmlldmVzIHRoZSBkYXRhIGFzIG9ic2VydmFibGUuXG4gICAgICAgICAqIFRoaXMgb2JzZXJ2YWJsZSBkYXRhIGlzIHBhc3NlZCB0byB0aGUgdHlwZWFoZWFkLlxuICAgICAgICAgKiBAdHlwZSB7T2JzZXJ2YWJsZTxhbnk+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50eXBlYWhlYWREYXRhU291cmNlID0gT2JzZXJ2YWJsZVxuICAgICAgICAgICAgLmNyZWF0ZSgob2JzZXJ2ZXI6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gUnVucyBvbiBldmVyeSBzZWFyY2hcbiAgICAgICAgICAgIGlmICh0aGlzLmxpc3RlblF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNNb2JpbGVBdXRvQ29tcGxldGUoKSAmJiAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbC1zY3JlZW4nKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1vYmlsZUF1dG9Db21wbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRRdWVyeUludm9rZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQodGhpcy5xdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBvbiBrZXlkb3duLCB3aGlsZSBzY3JvbGxpbmcgdGhlIGRyb3Bkb3duIGl0ZW1zLCB3aGVuIGxhc3QgaXRlbSBpcyByZWFjaGVkIG5leHQgY2FsbCBpcyB0cmlnZ2VyZWRcbiAgICAgICAgICAgIC8vIHVubGVzcyB0aGUgY2FsbCBpcyByZXNvbHZlZCwgd2UgYXJlIGFibGUgdG8gc2Nyb2xsIG5leHQgdG8gZmlyc3QgaXRlbSBhbmQgc29vblxuICAgICAgICAgICAgLy8gVGhpcyBzaG93cyBmbGlja2VyaW5nIGZyb20gZmlyc3QgaXRlbSB0byBuZXh0IG5ldyBpdGVtcyBhcHBlbmRlZC5cbiAgICAgICAgICAgIC8vIEJ5IHNldHRpbmcgY29udGFpbmVyIHRvIHVuZGVmaW5lZCwga2V5IGV2ZW50cyBjaGFuZ2VzIHdpbGwgYmUgc3RvcHBlZCB3aGlsZSBsb2FkaW5nIGl0ZW1zXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0U2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkLl9jb250YWluZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnBpcGUoXG4gICAgICAgICAgICBtZXJnZU1hcCgodG9rZW46IHN0cmluZykgPT4gdGhpcy5nZXREYXRhU291cmNlQXNPYnNlcnZhYmxlKHRva2VuKSlcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmRhdGFQcm92aWRlciA9IG5ldyBEYXRhUHJvdmlkZXIoKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogV2hlbiBkZWZhdWx0IGRhdGF2YWx1ZSBpcyBub3QgZm91bmQgd2l0aGluIHRoZSBkYXRhc2V0LCBhIGZpbHRlciBjYWxsIGlzIG1hZGUgdG8gZ2V0IHRoZSByZWNvcmQgdXNpbmcgZmV0Y2hEZWZhdWx0TW9kZWwuXG4gICAgICAgICAqIGFmdGVyIGdldHRpbmcgdGhlIHJlc3BvbnNlLCBzZXQgdGhlIHF1ZXJ5TW9kZWwgYW5kIHF1ZXJ5LlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgZGF0YXZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhdmFsdWUkLnN1YnNjcmliZSgodmFsOiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gKF8uaXNBcnJheSh2YWwpID8gdmFsWzBdIDogdmFsKSBhcyBzdHJpbmc7XG5cbiAgICAgICAgICAgIGlmIChxdWVyeSA9PT0gbnVsbCB8fCBxdWVyeSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAvLyByZXNldCB0aGUgcXVlcnkuXG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMucXVlcnlNb2RlbCA9ICcnO1xuICAgICAgICAgICAgICAgIC8vIG9uIGNsZWFyIG9yIHJlc2V0IGZpbHRlciwgZW1wdHkgdGhlIGxhc3RSZXN1bHRzIHRvIGZldGNoIG5ldyByZWNvcmRzLlxuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RSZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Vuc3Vic2NyaWJlRHYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0UXVlcnlJbnZva2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgLy8gaWYgcHJldiBkYXRhdmFsdWUgaXMgbm90IGVxdWFsIHRvIGN1cnJlbnQgZGF0YXZhbHVlIHRoZW4gY2xlYXIgdGhlIG1vZGVsQnlLZXkgYW5kIHF1ZXJ5TW9kZWxcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNPYmplY3QodmFsKSAmJiAodGhpcyBhcyBhbnkpLnByZXZEYXRhdmFsdWUgIT09IHZhbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gdGhpcy5xdWVyeU1vZGVsID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBkYXRhZmllbGQgaXMgQUxMRklMRURTIGRvIG5vdCBmZXRjaCB0aGUgcmVjb3Jkc1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgcXVlcnkgbW9kZWwgd2l0aCB0aGUgdmFsdWVzIHdlIGhhdmVcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUJ5RGF0YXZhbHVlKHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IGRhdGF2YWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcblxuICAgICAgICBjb25zdCBkYXRhc2V0U3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0JC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgLy8gc2V0IHRoZSBuZXh0IGl0ZW0gaW5kZXguXG4gICAgICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSB0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJ5RGF0YXNldCh0aGlzLmRhdGF2YWx1ZSB8fCB0aGlzLnRvQmVQcm9jZXNzZWREYXRhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhc2V0U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH1cblxuICAgIC8vIG9uIGNsZWFyLCB0cmlnZ2VyIHNlYXJjaCB3aXRoIHBhZ2Ugc2l6ZSAxXG4gICAgcHJpdmF0ZSBjbGVhclNlYXJjaCgkZXZlbnQsIGxvYWRPbkNsZWFyKSB7XG4gICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICAgICAgdGhpcy5vbklucHV0Q2hhbmdlKCRldmVudCk7XG4gICAgICAgIHRoaXMuZGF0YVByb3ZpZGVyLmlzTGFzdFBhZ2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IGZhbHNlO1xuICAgICAgICBpZiAobG9hZE9uQ2xlYXIpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuUXVlcnkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fdW5zdWJzY3JpYmVEdiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZURhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NsZWFyc2VhcmNoJyk7XG4gICAgfVxuXG4gICAgLy8gQ2xvc2UgdGhlIGZ1bGwgc2NyZWVuIG1vZGUgaW4gbW9iaWxlIHZpZXcgb2YgYXV0byBjb21wbGV0ZVxuICAgIHByaXZhdGUgY2xvc2VTZWFyY2goKSB7XG4gICAgICAgIHRoaXMuX2xvYWRpbmdJdGVtcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhZ2UgPSAxO1xuICAgICAgICAvLyBhZnRlciBjbG9zaW5nIHRoZSBzZWFyY2gsIGluc2VydCB0aGUgZWxlbWVudCBhdCBpdHMgcHJldmlvdXMgcG9zaXRpb24gKGVsSW5kZXgpXG4gICAgICAgIHRoaXMuaW5zZXJ0QXRJbmRleCh0aGlzLmVsSW5kZXgpO1xuICAgICAgICB0aGlzLmVsSW5kZXggPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMucGFyZW50RWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2Z1bGwtc2NyZWVuJyk7XG4gICAgICAgIGlmICh0aGlzLl9kb21VcGRhdGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9kb21VcGRhdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5RdWVyeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50eXBlYWhlYWQuaGlkZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyTW9iaWxlQXV0b0NvbXBsZXRlKCkge1xuICAgICAgICAvLyBHZXQgdGhlIHBhcmVudCBlbGVtZW50IG9mIHRoZSBzZWFyY2ggZWxlbWVudCB3aGljaCBjYW4gYmUgbmV4dCBvciBwcmV2IGVsZW1lbnQsIGlmIGJvdGggYXJlIGVtcHR5IHRoZW4gZ2V0IHRoZSBwYXJlbnQgb2YgZWxlbWVudC5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodGhpcy5lbEluZGV4KSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRFbCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XG4gICAgICAgICAgICB0aGlzLmVsSW5kZXggPSB0aGlzLnBhcmVudEVsLmNoaWxkcmVuKCkuaW5kZXgodGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsLXNjcmVlbicpKSB7XG4gICAgICAgICAgICAvLyB0aGlzIGZsYWcgaXMgc2V0IHRvIG5vdGlmeSB0aGF0IHRoZSB0eXBlYWhlYWQtY29udGFpbmVyIGRvbSBoYXMgY2hhbmdlZCBpdHMgcG9zaXRpb25cbiAgICAgICAgICAgIHRoaXMuX2RvbVVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hcHBlbmRUbygnZGl2W2RhdGEtcm9sZT1cInBhZ2VDb250YWluZXJcIl0nKTtcbiAgICAgICAgICAgIC8vIEFkZCBmdWxsIHNjcmVlbiBjbGFzcyBvbiBmb2N1cyBvZiB0aGUgaW5wdXQgZWxlbWVudC5cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2Z1bGwtc2NyZWVuJyk7XG5cbiAgICAgICAgICAgIC8vIEFkZCBwb3NpdGlvbiB0byBzZXQgdGhlIGhlaWdodCB0byBhdXRvXG4gICAgICAgICAgICBpZiAodGhpcy5wb3NpdGlvbiA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKHRoaXMucG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGZvY3VzIGlzIGxvc3Qgd2hlbiBlbGVtZW50IGlzIGNoYW5nZWQgdG8gZnVsbC1zY3JlZW4sIGtleWRvd24gdG8gc2VsZWN0IG5leHQgaXRlbXMgd2lsbCBub3Qgd29ya1xuICAgICAgICAvLyBIZW5jZSBleHBsaWNpdGx5IGZvY3VzaW5nIHRoZSBpbnB1dFxuICAgICAgICBpZiAodGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbC1zY3JlZW4nKSkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcuYXBwLXNlYXJjaC1pbnB1dCcpLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldERhdGFTb3VyY2VBc09ic2VydmFibGUocXVlcnk6IHN0cmluZyk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgICAgIC8vIHNob3cgZHJvcGRvd24gb25seSB3aGVuIHRoZXJlIGlzIGNoYW5nZSBpbiBxdWVyeS4gVGhpcyBzaG91bGQgbm90IGFwcGx5IHdoZW4gZGF0YW9wdGlvbnMgd2l0aCBmaWx0ZXJGaWVsZHMgYXJlIHVwZGF0ZWQuXG4gICAgICAgIC8vIHdoZW4gbGFzdFJlc3VsdCBpcyBub3QgYXZhaWxhYmxlIGkuZS4gc3RpbGwgdGhlIGZpcnN0IGNhbGwgaXMgcGVuZGluZyBhbmQgc2Vjb25kIHF1ZXJ5IGlzIGludm9rZWQgdGhlbiBkbyBub3QgcmV0dXJuLlxuICAgICAgICBpZiAodGhpcy5fbGFzdFF1ZXJ5ID09PSBxdWVyeSAmJiAhXy5nZXQodGhpcy5kYXRhb3B0aW9ucywgJ2ZpbHRlckZpZWxkcycpICYmIGlzRGVmaW5lZCh0aGlzLl9sYXN0UmVzdWx0KSkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gb2YodGhpcy5fbGFzdFJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGFzdFF1ZXJ5ID0gdGhpcy5xdWVyeTtcbiAgICAgICAgcmV0dXJuIGZyb20odGhpcy5nZXREYXRhU291cmNlKHF1ZXJ5KSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgZXZlbnRDYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2JsdXInLCAnZm9jdXMnLCAnc2VsZWN0JywgJ3N1Ym1pdCcsICdjaGFuZ2UnXSwgZXZlbnROYW1lKSkge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQobm9kZSwgZXZlbnROYW1lLCBldmVudENhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gaGlnaGxpZ2h0IHRoZSBjaGFyYWN0ZXJzIGluIHRoZSBkcm9wZG93biBtYXRjaGluZyB0aGUgcXVlcnkuXG4gICAgcHJpdmF0ZSBoaWdobGlnaHQobWF0Y2g6IFR5cGVhaGVhZE1hdGNoLCBxdWVyeTogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGVhaGVhZENvbnRhaW5lcikge1xuICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IG9mIGNoYXJzIHdpbGwgd29yayBvbmx5IHdoZW4gbGFiZWwgYXJlIHN0cmluZ3MuXG4gICAgICAgICAgICAobWF0Y2ggYXMgYW55KS52YWx1ZSA9IG1hdGNoLml0ZW0ubGFiZWwudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnR5cGVhaGVhZENvbnRhaW5lci5oaWdobGlnaHQobWF0Y2gsIHF1ZXJ5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGluc2VydHMgdGhlIGVsZW1lbnQgYXQgdGhlIGluZGV4IHBvc2l0aW9uXG4gICAgcHJpdmF0ZSBpbnNlcnRBdEluZGV4KGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50RWwucHJlcGVuZCh0aGlzLiRlbGVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0ICRlbEF0SW5kZXggPSB0aGlzLnBhcmVudEVsLmNoaWxkcmVuKCkuZXEoaSk7XG4gICAgICAgICAgICBpZiAoJGVsQXRJbmRleC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLnBhcmVudEVsLmNoaWxkcmVuKCkuZXEoaSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50Lmluc2VydEFmdGVyKHRoaXMucGFyZW50RWwuY2hpbGRyZW4oKS5lcShpIC0gMSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHdpZGdldCBpcyBvZiB0eXBlIGF1dG9jb21wbGV0ZSBpbiBtb2JpbGUgdmlldy8gYXBwXG4gICAgcHJpdmF0ZSBpc01vYmlsZUF1dG9Db21wbGV0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gJ2F1dG9jb21wbGV0ZScgJiYgaXNNb2JpbGUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGxvYWRNb3JlRGF0YShpbmNyZW1lbnRQYWdlPzogYm9vbGVhbikge1xuICAgICAgICBpZiAodGhpcy5kYXRhUHJvdmlkZXIuaXNMYXN0UGFnZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIEluY3JlYXNlIHRoZSBwYWdlIG51bWJlciBhbmQgdHJpZ2dlciBmb3JjZSBxdWVyeSB1cGRhdGVcbiAgICAgICAgdGhpcy5wYWdlID0gaW5jcmVtZW50UGFnZSA/IHRoaXMucGFnZSArIDEgOiB0aGlzLnBhZ2U7XG5cbiAgICAgICAgdGhpcy5pc1Njcm9sbGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gdHJ1ZTtcblxuICAgICAgICAvLyB3aGVuIGludm9raW5nIG5ldyBzZXQgb2YgcmVzdWx0cywgcmVzZXQgdGhlIGxhc3RRdWVyeS5cbiAgICAgICAgaWYgKGluY3JlbWVudFBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RRdWVyeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHRyaWdnZXIgdGhlIHR5cGVhaGVhZCBjaGFuZ2UgbWFudWFsbHkgdG8gZmV0Y2ggdGhlIG5leHQgc2V0IG9mIHJlc3VsdHMuXG4gICAgICAgIHRoaXMudHlwZWFoZWFkLm9uSW5wdXQoe1xuICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IF8udHJpbSh0aGlzLnF1ZXJ5KSB8fCAnMCcgLy8gZHVtbXkgZGF0YSB0byBub3RpZnkgdGhlIG9ic2VydmFibGVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIG9uIGZvY3Vzb3V0LCBzdWJzY3JpYmUgdG8gdGhlIGRhdGF2YWx1ZSBjaGFuZ2VzIGFnYWluXG4gICAgcHJpdmF0ZSBvbkZvY3VzT3V0KCkge1xuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2xvYWRpbmdJdGVtcyA9IGZhbHNlO1xuICAgICAgICAvLyByZXNldCB0aGUgcGFnZSB2YWx1ZSBvbiBmb2N1c291dC5cbiAgICAgICAgdGhpcy5wYWdlID0gMTtcbiAgICAgICAgLy8gaWYgZG9tVXBkYXRlZCBpcyB0cnVlIHRoZW4gZG8gbm90IGhpZGUgdGhlIGRyb3Bkb3duIGluIHRoZSBmdWxsc2NyZWVuXG4gICAgICAgIGlmICghdGhpcy5fZG9tVXBkYXRlZCAmJiB0aGlzLl9pc09wZW4pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuUXVlcnkgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gaGlkZSB0aGUgdHlwZWFoZWFkIG9ubHkgYWZ0ZXIgdGhlIGl0ZW0gaXMgc2VsZWN0ZWQgZnJvbSBkcm9wZG93bi5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgodGhpcy50eXBlYWhlYWQgYXMgYW55KS5fdHlwZWFoZWFkLmlzU2hvd24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWQuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNPcGVuID0gZmFsc2U7XG4gICAgICAgIC8vIG9uIG91dHNpZGUgY2xpY2ssIHR5cGVhaGVhZCBpcyBoaWRkZW4uIFRvIGF2b2lkIHRoaXMsIHdoZW4gZnVsbHNjcmVlbiBpcyBzZXQsIG92ZXJyaWRkaW5nIGlzRm9jdXNlZCBmbGFnIG9uIHRoZSB0eXBlYWhlYWQgY29udGFpbmVyXG4gICAgICAgIGlmICh0aGlzLl9kb21VcGRhdGVkICYmIHRoaXMudHlwZWFoZWFkICYmICh0aGlzLnR5cGVhaGVhZCBhcyBhbnkpLl9jb250YWluZXIpIHtcbiAgICAgICAgICAgICh0aGlzLnR5cGVhaGVhZCBhcyBhbnkpLl9jb250YWluZXIuaXNGb2N1c2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25JbnB1dENoYW5nZSgkZXZlbnQpIHtcbiAgICAgICAgLy8gcmVzZXQgYWxsIHRoZSBwcmV2aW91cyBwYWdlIGRldGFpbHMgaW4gb3JkZXIgdG8gZmV0Y2ggbmV3IHNldCBvZiByZXN1bHQuXG4gICAgICAgIHRoaXMucmVzdWx0ID0gW107XG4gICAgICAgIHRoaXMucGFnZSA9IDE7XG4gICAgICAgIHRoaXMubGlzdGVuUXVlcnkgPSB0aGlzLmlzVXBkYXRlT25LZXlQcmVzcygpO1xuICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gd2hlbiBpbnB1dCBpcyBjbGVhcmVkLCByZXNldCB0aGUgZGF0YXZhbHVlXG4gICAgICAgIGlmICh0aGlzLnF1ZXJ5ID09PSAnJykge1xuICAgICAgICAgICAgdGhpcy5xdWVyeU1vZGVsID0gJyc7XG4gICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5fbW9kZWxCeVZhbHVlLCB7fSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgb25TdWJtaXQgb25seSB3aGVuIHRoZSBzZWFyY2ggaW5wdXQgaXMgY2xlYXJlZCBvZmYgYW5kIGRvIG5vdCB0cmlnZ2VyIHdoZW4gdGFiIGlzIHByZXNzZWQuXG4gICAgICAgICAgICBpZiAoJGV2ZW50ICYmICRldmVudC53aGljaCAhPT0gOSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VibWl0JywgeyRldmVudH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaW52b2tpbmcgY2hhbmdlIGV2ZW50IG9uIGV2ZXJ5IGlucHV0IHZhbHVlIGNoYW5nZS5cbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywge1xuICAgICAgICAgICAgICAgICRldmVudDogJGV2ZW50LFxuICAgICAgICAgICAgICAgIG5ld1ZhbDogdGhpcy5fbW9kZWxCeVZhbHVlIHx8IHRoaXMucXVlcnksXG4gICAgICAgICAgICAgICAgb2xkVmFsOiAodGhpcyBhcyBhbnkpLnByZXZEYXRhdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hvd0Nsb3NlYnRuID0gKHRoaXMucXVlcnkgIT09ICcnKTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VyZWQgZm9yIGVudGVyIGV2ZW50XG4gICAgcHJpdmF0ZSBoYW5kbGVFbnRlckV2ZW50KCRldmVudCkge1xuICAgICAgICAvLyBzdWJtaXQgZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXMgbm8gc2VhcmNoIHJlc3VsdHNcbiAgICAgICAgaWYgKCF0aGlzLnR5cGVhaGVhZC5fY29udGFpbmVyKSB7XG4gICAgICAgICAgICB0aGlzLm9uU2VsZWN0KCRldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gVHJpZ2dlcnJlZCB3aGVuIHR5cGVhaGVhZCBvcHRpb24gaXMgc2VsZWN0ZWQuXG4gICAgcHJpdmF0ZSBvblNlbGVjdCgkZXZlbnQ6IEV2ZW50KSB7XG4gICAgICAgIC8vIHNlYXJjaE9uIGlzIHNldCBhcyBvbkJ0bkNsaWNrLCB0aGVuIGludm9rZSB0aGUgc2VhcmNoIGFwaSBjYWxsIG1hbnVhbGx5LlxuICAgICAgICBpZiAoIXRoaXMuaXNVcGRhdGVPbktleVByZXNzKCkpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuUXVlcnkgPSB0cnVlO1xuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgdHlwZWFoZWFkIGNoYW5nZSBtYW51YWxseSB0byBmZXRjaCB0aGUgbmV4dCBzZXQgb2YgcmVzdWx0cy5cbiAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkLm9uSW5wdXQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDoge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5xdWVyeSAvLyBkdW1teSBkYXRhIHRvIG5vdGlmeSB0aGUgb2JzZXJ2YWJsZXNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3aGVuIG1hdGNoZXMgYXJlIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKHRoaXMudHlwZWFoZWFkQ29udGFpbmVyICYmIHRoaXMubGlFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkQ29udGFpbmVyLnNlbGVjdEFjdGl2ZU1hdGNoKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSB0aGlzLnF1ZXJ5O1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWJtaXQnLCB7JGV2ZW50fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQmVmb3Jlc2VydmljZWNhbGwoaW5wdXREYXRhKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlc2VydmljZWNhbGwnLCB7aW5wdXREYXRhfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRyb3Bkb3duT3BlbigpIHtcbiAgICAgICAgLy8gc2V0dGluZyB0aGUgdWxFbGVtZW50cywgbGlFbGVtZW50IG9uIHR5cGVhaGVhZENvbnRhaW5lci5cbiAgICAgICAgLy8gYXMgd2UgYXJlIHVzaW5nIGN1c3RvbU9wdGlvbiB0ZW1wbGF0ZSwgbGlFbGVtZW50cyBhcmUgbm90IGF2YWlsYWJsZSBvbiB0eXBlYWhlYWRDb250YWluZXIgc28gYXBwZW5kIHRoZW0gZXhwbGljaXRseS5cbiAgICAgICAgY29uc3QgZm4gPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnR5cGVhaGVhZENvbnRhaW5lciA9IHRoaXMudHlwZWFoZWFkLl9jb250YWluZXIgfHwgKHRoaXMudHlwZWFoZWFkIGFzIGFueSkuX3R5cGVhaGVhZC5pbnN0YW5jZTtcbiAgICAgICAgICAgICh0aGlzLnR5cGVhaGVhZENvbnRhaW5lciBhcyBhbnkpLmxpRWxlbWVudHMgPSB0aGlzLmxpRWxlbWVudHM7XG4gICAgICAgICAgICAodGhpcy50eXBlYWhlYWRDb250YWluZXIgYXMgYW55KS51bEVsZW1lbnQgPSB0aGlzLnVsRWxlbWVudDtcbiAgICAgICAgICAgIGFkanVzdENvbnRhaW5lclBvc2l0aW9uKCQoJ3R5cGVhaGVhZC1jb250YWluZXInKSwgdGhpcy5uYXRpdmVFbGVtZW50LCAodGhpcy50eXBlYWhlYWQgYXMgYW55KS5fdHlwZWFoZWFkLCAkKCd0eXBlYWhlYWQtY29udGFpbmVyIC5kcm9wZG93bi1tZW51JykpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZuKCk7XG5cbiAgICAgICAgLy8gb3BlbiBmdWxsLXNjcmVlbiBzZWFyY2ggdmlld1xuICAgICAgICBpZiAodGhpcy5pc01vYmlsZUF1dG9Db21wbGV0ZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBkcm9wZG93bkVsID0gdGhpcy5kcm9wZG93bkVsLmNsb3Nlc3QoJ3R5cGVhaGVhZC1jb250YWluZXInKTtcblxuICAgICAgICAgICAgZHJvcGRvd25FbC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0OmZpcnN0JykpO1xuICAgICAgICAgICAgY29uc3Qgc2NyZWVuSGVpZ2h0ID0gdGhpcy4kZWxlbWVudC5jbG9zZXN0KCcuYXBwLWNvbnRlbnQnKS5oZWlnaHQoKTtcbiAgICAgICAgICAgIGRyb3Bkb3duRWwuY3NzKHtwb3NpdGlvbjogJ3JlbGF0aXZlJywgdG9wOiAwLCBoZWlnaHQ6IHNjcmVlbkhlaWdodCArICdweCd9KTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Nsb3NlYnRuID0gdGhpcy5xdWVyeSAmJiB0aGlzLnF1ZXJ5ICE9PSAnJztcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFQcm92aWRlci5pc0xhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyU2VhcmNoKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbGVjdE5leHQoKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLnR5cGVhaGVhZENvbnRhaW5lci5tYXRjaGVzO1xuXG4gICAgICAgIGlmICghbWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluZGV4ID0gbWF0Y2hlcy5pbmRleE9mKHRoaXMudHlwZWFoZWFkQ29udGFpbmVyLmFjdGl2ZSk7XG5cbiAgICAgICAgLy8gb24ga2V5ZG93biwgaWYgc2Nyb2xsIGlzIGF0IHRoZSBib3R0b20gYW5kIG5leHQgcGFnZSByZWNvcmRzIGFyZSBhdmFpbGFibGUsIGZldGNoIG5leHQgcGFnZSBpdGVtcy5cbiAgICAgICAgaWYgKCF0aGlzLl9sb2FkaW5nSXRlbXMgJiYgIXRoaXMuZGF0YVByb3ZpZGVyLmlzTGFzdFBhZ2UgJiYgaW5kZXggKyAxID4gbWF0Y2hlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAvLyBpbmRleCBpcyBzYXZlZCBpbiBvcmRlciB0byBzZWxlY3QgdGhlIGxhc3RTZWxlY3RlZCBpdGVtIGluIHRoZSBkcm9wZG93biBhZnRlciBmZXRjaGluZyBuZXh0IHBhZ2UgaXRlbXMuXG4gICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlRGF0YSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TGFzdEFjdGl2ZU1hdGNoQXNTZWxlY3RlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdFNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgICAgICh0aGlzLnR5cGVhaGVhZENvbnRhaW5lciBhcyBhbnkpLl9hY3RpdmUgPSB0aGlzLnR5cGVhaGVhZENvbnRhaW5lci5tYXRjaGVzW3RoaXMubGFzdFNlbGVjdGVkSW5kZXhdO1xuICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRDb250YWluZXIubmV4dEFjdGl2ZU1hdGNoKCk7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEluZGV4ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmlnZ2VyU2VhcmNoKCkge1xuICAgICAgICBpZiAodGhpcy5kYXRhUHJvdmlkZXIuaXNMYXN0UGFnZSB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbC1zY3JlZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGVBaGVhZERyb3BEb3duID0gdGhpcy5kcm9wZG93bkVsO1xuICAgICAgICBjb25zdCAkbGFzdEl0ZW0gPSB0eXBlQWhlYWREcm9wRG93bi5maW5kKCdsaScpLmxhc3QoKTtcblxuICAgICAgICAvLyBDaGVjayBpZiBsYXN0IGl0ZW0gaXMgbm90IGJlbG93IHRoZSBmdWxsIHNjcmVlblxuICAgICAgICBpZiAoJGxhc3RJdGVtLmxlbmd0aCAmJiB0eXBlQWhlYWREcm9wRG93bi5sZW5ndGggJiYgKHR5cGVBaGVhZERyb3BEb3duLmhlaWdodCgpICsgdHlwZUFoZWFkRHJvcERvd24ucG9zaXRpb24oKS50b3AgPiAgJGxhc3RJdGVtLmhlaWdodCgpICsgJGxhc3RJdGVtLnBvc2l0aW9uKCkudG9wKSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZURhdGEodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVXBkYXRlT25LZXlQcmVzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNob24gPT09ICd0eXBpbmcnO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGVib3VuY2VEZWZhdWx0UXVlcnkoZGF0YSkge1xuICAgICAgICB0aGlzLl9kZWZhdWx0UXVlcnlJbnZva2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5nZXREYXRhU291cmNlKGRhdGEsIHRydWUpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeU1vZGVsID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGFzdFF1ZXJ5ID0gdGhpcy5xdWVyeSA9IHRoaXMucXVlcnlNb2RlbFswXS5sYWJlbCB8fCAnJztcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSB0aGlzLnF1ZXJ5TW9kZWxbMF0udmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9kZWxCeUtleSA9IHRoaXMucXVlcnlNb2RlbFswXS5rZXk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUJ5RGF0YXZhbHVlKGRhdGEpIHtcbiAgICAgICAgdGhpcy51cGRhdGVCeURhdGFzZXQoZGF0YSk7XG4gICAgICAgIHRoaXMudXBkYXRlQnlEYXRhU291cmNlKGRhdGEpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlQnlEYXRhU291cmNlKGRhdGEpIHtcbiAgICAgICAgLy8gdmFsdWUgaXMgcHJlc2VudCBidXQgdGhlIGNvcnJlc3BvbmRpbmcga2V5IGlzIG5vdCBmb3VuZCB0aGVuIGZldGNoIG5leHQgc2V0XG4gICAgICAgIC8vIG1vZGVsQnlLZXkgd2lsbCBiZSBzZXQgb25seSB3aGVuIGRhdGF2YWx1ZSBpcyBhdmFpbGFibGUgaW5zaWRlIHRoZSBsb2NhbERhdGEgb3RoZXJ3aXNlIG1ha2UgYSBOL3cgY2FsbC5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChkYXRhKSAmJiAhXy5pc09iamVjdChkYXRhKSAmJiB0aGlzLmRhdGFzb3VyY2UgJiYgIWlzRGVmaW5lZCh0aGlzLl9tb2RlbEJ5S2V5KSAmJiB0aGlzLmRhdGFmaWVsZCAhPT0gQUxMRklFTERTKSB7XG4gICAgICAgICAgICAvLyBBdm9pZCBtYWtpbmcgZGVmYXVsdCBxdWVyeSBpZiBxdWVyeU1vZGVsIGFscmVhZHkgZXhpc3RzLlxuICAgICAgICAgICAgaWYgKGlzRGVmaW5lZCh0aGlzLnF1ZXJ5TW9kZWwpICYmICFfLmlzRW1wdHkodGhpcy5xdWVyeU1vZGVsKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF0YXZhbHVlRnJvbVF1ZXJ5TW9kZWwoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgZGVmYXVsdCBxdWVyeSBjYWxsIG9ubHkgd2hlbiBkYXRhc291cmNlIHN1cHBvcnRzIENSVUQgKGxpdmUgdmFyaWFibGUpLlxuICAgICAgICAgICAgaWYgKCF0aGlzLl9kZWZhdWx0UXVlcnlJbnZva2VkICYmIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0NSVUQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWJvdW5jZURlZmF1bHRRdWVyeShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHVwZGF0ZXMgdGhlIG1vZGVsIHZhbHVlIHVzaW5nIHF1ZXJ5TW9kZWxcbiAgICBwcml2YXRlIHVwZGF0ZURhdGF2YWx1ZUZyb21RdWVyeU1vZGVsKCkge1xuICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSBfLmlzQXJyYXkodGhpcy5xdWVyeU1vZGVsKSA/ICh0aGlzLnF1ZXJ5TW9kZWxbMF0gYXMgRGF0YVNldEl0ZW0pLnZhbHVlIDogdGhpcy5xdWVyeU1vZGVsO1xuICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5ID0gXy5pc0FycmF5KHRoaXMucXVlcnlNb2RlbCkgPyAodGhpcy5xdWVyeU1vZGVsWzBdIGFzIERhdGFTZXRJdGVtKS5rZXkgOiB0aGlzLnF1ZXJ5TW9kZWw7XG4gICAgICAgIHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUJ5RGF0YXNldChkYXRhOiBhbnkpIHtcbiAgICAgICAgLy8gZGVmYXVsdCBxdWVyeSBpcyBhbHJlYWR5IGludm9rZWQgdGhlbiBkbyBub3QgbWFrZSBvdGhlciBkZWZhdWx0IHF1ZXJ5IGNhbGwuXG4gICAgICAgIC8vIEZvciBsb2NhbCBzZWFyY2ggaS5lLiBzZWFyY2hrZXkgaXMgdW5kZWZpbmVkLCBkbyBub3QgcmV0dXJuLCB2ZXJpZnkgdGhlIGRhdGF2YWx1ZSBhZ2FpbnN0IHRoZSBkYXRhc2V0SXRlbXMgLlxuICAgICAgICBpZiAodGhpcy5fZGVmYXVsdFF1ZXJ5SW52b2tlZCAmJiB0aGlzLnNlYXJjaGtleSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkSXRlbSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiAgKF8uaXNPYmplY3QoaXRlbS52YWx1ZSkgPyBfLmlzRXF1YWwoaXRlbS52YWx1ZSwgZGF0YSkgOiAoXy50b1N0cmluZyhpdGVtLnZhbHVlKSkudG9Mb3dlckNhc2UoKSA9PT0gKF8udG9TdHJpbmcoZGF0YSkpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBzZXQgdGhlIGRlZmF1bHQgb25seSB3aGVuIGl0IGlzIGF2YWlsYWJsZSBpbiBkYXRhc2V0LlxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSBbc2VsZWN0ZWRJdGVtXTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRhdGFmaWVsZCA9PT0gQUxMRklFTERTICYmIF8uaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGV4dHJhY3REYXRhQXNBcnJheShkYXRhKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5TW9kZWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVEYXRhdmFsdWVGcm9tUXVlcnlNb2RlbCgpO1xuXG4gICAgICAgIC8vIFNob3cgdGhlIGxhYmVsIHZhbHVlIG9uIGlucHV0LlxuICAgICAgICB0aGlzLl9sYXN0UXVlcnkgPSB0aGlzLnF1ZXJ5ID0gdGhpcy5xdWVyeU1vZGVsLmxlbmd0aCA/IHRoaXMucXVlcnlNb2RlbFswXS5sYWJlbCA6ICcnO1xuICAgIH1cblxuXG4gICAgLy8gVGhpcyBtZXRob2QgcmV0dXJucyBhIHByb21pc2UgdGhhdCBwcm92aWRlcyB0aGUgZmlsdGVyZWQgZGF0YSBmcm9tIHRoZSBkYXRhc291cmNlLlxuICAgIHB1YmxpYyBnZXREYXRhU291cmNlKHF1ZXJ5OiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nLCBzZWFyY2hPbkRhdGFGaWVsZD86IGJvb2xlYW4sIG5leHRJdGVtSW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPERhdGFTZXRJdGVtW10+IHtcbiAgICAgICAgLy8gRm9yIGRlZmF1bHQgcXVlcnksIHNlYXJjaE9uRGF0YUZpZWxkIGlzIHNldCB0byB0cnVlLCB0aGVuIGRvIG5vdCBtYWtlIGEgbi93IGNhbGwgd2hlbiBkYXRhZmllbGQgaXMgQUxMRklFTERTXG4gICAgICAgIGlmIChzZWFyY2hPbkRhdGFGaWVsZCAmJiB0aGlzLmRhdGFmaWVsZCA9PT0gQUxMRklFTERTKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkaW5nSXRlbXMgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIGRlZmF1bHQgZGF0YXZhbHVlLCBzZWFyY2gga2V5IGFzIHRvIGJlIG9uIGRhdGFmaWVsZCB0byBnZXQgdGhlIGRlZmF1bHQgZGF0YSBmcm9tIHRoZSBmaWx0ZXIgY2FsbC5cbiAgICAgICAgY29uc3QgZGF0YUNvbmZpZzogSURhdGFQcm92aWRlckNvbmZpZyA9IHtcbiAgICAgICAgICAgIGRhdGFzZXQ6IHRoaXMuZGF0YXNldCA/IGNvbnZlcnREYXRhVG9PYmplY3QodGhpcy5kYXRhc2V0KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGJpbmRkYXRhc2V0OiB0aGlzLmJpbmRkYXRhc2V0LFxuICAgICAgICAgICAgZGF0YXNvdXJjZTogdGhpcy5kYXRhc291cmNlLFxuICAgICAgICAgICAgZGF0YWZpZWxkOiB0aGlzLmRhdGFmaWVsZCxcbiAgICAgICAgICAgIGhhc0RhdGE6IHRoaXMuZGF0YXNldCAmJiB0aGlzLmRhdGFzZXQubGVuZ3RoLFxuICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgICAgICAgaXNMb2NhbEZpbHRlcjogIXRoaXMuc2VhcmNoa2V5LFxuICAgICAgICAgICAgc2VhcmNoS2V5OiBzZWFyY2hPbkRhdGFGaWVsZCA/IHRoaXMuZGF0YWZpZWxkIDogdGhpcy5zZWFyY2hrZXksXG4gICAgICAgICAgICAvLyBkZWZhdWx0IHNlYXJjaCBjYWxsIG1hdGNoIG1vZGUgc2hvdWxkIGJlIHN0YXJ0aWdub3JlY2FzZVxuICAgICAgICAgICAgbWF0Y2hNb2RlOiBzZWFyY2hPbkRhdGFGaWVsZCA/ICdzdGFydGlnbm9yZWNhc2UnIDogdGhpcy5tYXRjaG1vZGUsXG4gICAgICAgICAgICBjYXNlc2Vuc2l0aXZlOiB0aGlzLmNhc2VzZW5zaXRpdmUsXG4gICAgICAgICAgICBpc2Zvcm1maWVsZDogdGhpcy5pc2Zvcm1maWVsZCxcbiAgICAgICAgICAgIG9yZGVyYnk6IHRoaXMub3JkZXJieSxcbiAgICAgICAgICAgIGxpbWl0OiB0aGlzLmxpbWl0LFxuICAgICAgICAgICAgcGFnZXNpemU6IHRoaXMucGFnZXNpemUsXG4gICAgICAgICAgICBwYWdlOiB0aGlzLnBhZ2UsXG4gICAgICAgICAgICBvbkJlZm9yZXNlcnZpY2VjYWxsOiB0aGlzLm9uQmVmb3Jlc2VydmljZWNhbGwuYmluZCh0aGlzKVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmRhdGFvcHRpb25zKSB7XG4gICAgICAgICAgICBkYXRhQ29uZmlnLmRhdGFvcHRpb25zID0gdGhpcy5kYXRhb3B0aW9ucztcbiAgICAgICAgICAgIGRhdGFDb25maWcudmlld1BhcmVudCA9IHRoaXMudmlld1BhcmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRpbmdJdGVtcyA9IHRydWU7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVByb3ZpZGVyLmZpbHRlcihkYXRhQ29uZmlnKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzcG9uc2UgZnJvbSBkYXRhUHJvdmlkZXIgcmV0dXJucyBhbHdheXMgZGF0YSBvYmplY3QuXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gcmVzcG9uc2UuZGF0YSB8fCByZXNwb25zZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBmb3Igc2VydmljZSB2YXJpYWJsZSwgdXBkYXRpbmcgdGhlIGRhdGFzZXQgb25seSBpZiBpdCBpcyBub3QgZGVmaW5lZCBvciBlbXB0eVxuICAgICAgICAgICAgICAgICAgICBpZiAoKCFpc0RlZmluZWQodGhpcy5kYXRhc2V0KSB8fCAhdGhpcy5kYXRhc2V0Lmxlbmd0aCkgJiYgdGhpcy5kYXRhUHJvdmlkZXIudXBkYXRlRGF0YXNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhc2V0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhUHJvdmlkZXIuaGFzTW9yZURhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybWF0dGVkRGF0YXNldCA9IHRoaXMuZm9ybWF0dGVkRGF0YXNldC5jb25jYXQocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtYXR0ZWREYXRhc2V0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBleHBsaWNpdGx5IHNldHRpbmcgdGhlIG9wdGlvbnNsaW1pdCBhcyB0aGUgbWF0Y2hlcyBtb3JlIHRoYW4gMjAgd2lsbCBiZSBpZ25vcmVkIGlmIG9wdGlvbnNsaW1pdCBpcyBub3Qgc3BlY2lmaWVkLlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mb3JtYXR0ZWREYXRhc2V0Lmxlbmd0aCA+IDIwICYmICFpc0RlZmluZWQodGhpcy5saW1pdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkLnR5cGVhaGVhZE9wdGlvbnNMaW1pdCA9IHRoaXMuZm9ybWF0dGVkRGF0YXNldC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEluIG1vYmlsZSwgdHJpZ2dlciB0aGUgc2VhcmNoIGJ5IGRlZmF1bHQgdW50aWwgdGhlIHJlc3VsdHMgaGF2ZSBoZWlnaHQgdXB0byBwYWdlIGhlaWdodC4gT3RoZXIgcmVzdWx0cyBjYW4gYmUgZmV0Y2hlZCBieSBzY3JvbGxpbmdcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNPcGVuICYmIHRoaXMuaXNNb2JpbGVBdXRvQ29tcGxldGUoKSAmJiAhdGhpcy5kYXRhUHJvdmlkZXIuaXNMYXN0UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJTZWFyY2goKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWREYXRhID0gdGhpcy5nZXRUcmFuc2Zvcm1lZERhdGEodGhpcy5mb3JtYXR0ZWREYXRhc2V0LCBuZXh0SXRlbUluZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyByZXN1bHQgY29udGFpbnMgdGhlIGRhdGFmaWVsZCB2YWx1ZXMuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gXy5tYXAodHJhbnNmb3JtZWREYXRhLCAndmFsdWUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkRGF0YTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1Njcm9sbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIChfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TGFzdEFjdGl2ZU1hdGNoQXNTZWxlY3RlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCAzMCkpKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTY3JvbGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBXaGVuIG5vIHJlc3VsdCBpcyBmb3VuZCwgc2V0IHRoZSBkYXRhdmFsdWUgdG8gdW5kZWZpbmVkLlxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IChxdWVyeSBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBvbiBmb2N1c291dCBpLmUuIG9uIG90aGVyIHdpZGdldCBmb2N1cywgaWYgbi93IGlzIHBlbmRpbmcgbG9hZGluZyBpY29uIGlzIHNob3duLCB3aGVuIGRhdGEgaXMgYXZhaWxhYmxlIHRoZW4gZHJvcGRvd24gaXMgc2hvd24gYWdhaW4uXG4gICAgICAgICAgICAgICAgLy8gb24gdW5zdWJzY3JpYmluZyBkbyBub3Qgc2hvdyB0aGUgcmVzdWx0cy5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdW5zdWJzY3JpYmVEdikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9hZGluZ0l0ZW1zID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGFzdFJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRyYW5zZm9ybWVkRGF0YShkYXRhOiBhbnksIGl0ZW1JbmRleD86IG51bWJlciwgaXNjdXN0b20/OiBib29sZWFuKTogRGF0YVNldEl0ZW1bXSB7XG4gICAgICAgIGlmIChpc0RlZmluZWQoaXRlbUluZGV4KSkge1xuICAgICAgICAgICAgaXRlbUluZGV4Kys7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGEgPSB0cmFuc2Zvcm1EYXRhKFxuICAgICAgICAgICAgdGhpcy52aWV3UGFyZW50LFxuICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgIHRoaXMuZGF0YWZpZWxkLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlGaWVsZDogdGhpcy5kaXNwbGF5bGFiZWwgfHwgdGhpcy5kaXNwbGF5ZmllbGQsXG4gICAgICAgICAgICAgICAgZGlzcGxheUV4cHI6IGlzY3VzdG9tID8gJycgOiB0aGlzLmRpc3BsYXlleHByZXNzaW9uLFxuICAgICAgICAgICAgICAgIGJpbmREaXNwbGF5RXhwcjogaXNjdXN0b20gPyAnJyA6IHRoaXMuYmluZGRpc3BsYXlsYWJlbCxcbiAgICAgICAgICAgICAgICBiaW5kRGlzcGxheUltZ1NyYzogdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlJbWdTcmM6IHRoaXMuZGlzcGxheWltYWdlc3JjXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbUluZGV4XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBnZXRVbmlxT2Jqc0J5RGF0YUZpZWxkKHRyYW5zZm9ybWVkRGF0YSwgdGhpcy5kYXRhZmllbGQsIHRoaXMuZGlzcGxheWZpZWxkIHx8IHRoaXMuZGlzcGxheWxhYmVsLCB0b0Jvb2xlYW4odGhpcy5hbGxvd2VtcHR5KSk7XG4gICAgfVxuXG4gICAgLy8gT3B0aW9uc0xpc3RUZW1wbGF0ZSBsaXN0ZW5zIHRvIHRoZSBzY3JvbGwgZXZlbnQgYW5kIHRyaWdnZXJzIHRoaXMgZnVuY3Rpb24uXG4gICAgcHVibGljIG9uU2Nyb2xsKCRzY3JvbGxFbDogRWxlbWVudCwgZXZ0OiBFdmVudCkge1xuICAgICAgICBjb25zdCB0b3RhbEhlaWdodCA9ICRzY3JvbGxFbC5zY3JvbGxIZWlnaHQsXG4gICAgICAgICAgICBjbGllbnRIZWlnaHQgPSAkc2Nyb2xsRWwuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIC8vIElmIHNjcm9sbCBpcyBhdCB0aGUgYm90dG9tIGFuZCBubyByZXF1ZXN0IGlzIGluIHByb2dyZXNzIGFuZCBuZXh0IHBhZ2UgcmVjb3JkcyBhcmUgYXZhaWxhYmxlLCBmZXRjaCBuZXh0IHBhZ2UgaXRlbXMuXG4gICAgICAgIGlmICghdGhpcy5fbG9hZGluZ0l0ZW1zICYmICF0aGlzLmRhdGFQcm92aWRlci5pc0xhc3RQYWdlICYmICgkc2Nyb2xsRWwuc2Nyb2xsVG9wICsgY2xpZW50SGVpZ2h0ID49IHRvdGFsSGVpZ2h0KSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZURhdGEodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodGhpcy5taW5jaGFycykpIHtcbiAgICAgICAgICAgIC8vIGZvciBhdXRvY29tcGxldGUgc2V0IHRoZSBtaW5jaGFycyB0byAwXG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSAnYXV0b2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgIHRoaXMubWluY2hhcnMgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbmNoYXJzID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGlzdGVuUXVlcnkgPSB0aGlzLmlzVXBkYXRlT25LZXlQcmVzcygpO1xuXG4gICAgICAgIC8vIGJ5IGRlZmF1bHQgZm9yIGF1dG9jb21wbGV0ZSBkbyBub3Qgc2hvdyB0aGUgc2VhcmNoIGljb25cbiAgICAgICAgLy8gYnkgZGVmYXVsdCBzaG93IHRoZSBzZWFyY2hpY29uIGZvciB0eXBlID0gc2VhcmNoXG4gICAgICAgIHRoaXMuc2hvd3NlYXJjaGljb24gPSBpc0RlZmluZWQodGhpcy5zaG93c2VhcmNoaWNvbikgPyB0aGlzLnNob3dzZWFyY2hpY29uIDogKHRoaXMudHlwZSA9PT0gJ3NlYXJjaCcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIC8vIHRyaWdnZXJlZCBvbiBzZWxlY3Qgb24gb3B0aW9uIGZyb20gdGhlIGxpc3QuIFNldCB0aGUgcXVlcnlNb2RlbCwgcXVlcnkgYW5kIG1vZGVsQnlLZXkgZnJvbSB0aGUgbWF0Y2hlZCBpdGVtLlxuICAgIHB1YmxpYyB0eXBlYWhlYWRPblNlbGVjdChtYXRjaDogVHlwZWFoZWFkTWF0Y2gsICRldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IG1hdGNoLml0ZW07XG4gICAgICAgIHRoaXMucXVlcnlNb2RlbCA9IGl0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXJ5ID0gaXRlbS5sYWJlbDtcbiAgICAgICAgJGV2ZW50ID0gJGV2ZW50IHx8IHRoaXMuJHR5cGVhaGVhZEV2ZW50O1xuXG4gICAgICAgIC8vIEFzIGl0ZW0ua2V5IGNhbiB2YXJ5IGZyb20ga2V5IGluIHRoZSBkYXRhc2V0SXRlbXNcbiAgICAgICAgdGhpcy5fbW9kZWxCeUtleSA9IGl0ZW0ua2V5O1xuICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSBpdGVtLnZhbHVlO1xuXG4gICAgICAgIHRoaXMuaW52b2tlT25Ub3VjaGVkKCk7XG4gICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UodGhpcy5kYXRhdmFsdWUsICRldmVudCB8fCB7fSk7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmdWxsLXNjcmVlbicpKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlU2VhcmNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JGV2ZW50LCBzZWxlY3RlZFZhbHVlOiB0aGlzLmRhdGF2YWx1ZX0pO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Ym1pdCcsIHskZXZlbnR9KTtcblxuICAgICAgICB0aGlzLnVwZGF0ZVByZXZEYXRhdmFsdWUodGhpcy5kYXRhdmFsdWUpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdoZW4gZGF0YW9wdGlvbnMgYXJlIHByb3ZpZGVkIGFuZCB0aGVyZSBpcyBubyBkaXNwbGF5bGFiZWwgZ2l2ZW4gdGhlbiBkaXNwbGF5bGFiZWwgaXMgc2V0IGFzIHRoZSByZWxhdGVkZmllbGRcbiAgICAgICAgaWYgKGtleSA9PT0gJ2Rpc3BsYXlsYWJlbCcgJiYgdGhpcy5kYXRhb3B0aW9ucyAmJiB0aGlzLmJpbmRkaXNwbGF5bGFiZWwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnkgPSBfLmdldCh0aGlzLl9tb2RlbEJ5VmFsdWUsIG52KSB8fCB0aGlzLl9tb2RlbEJ5VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxufVxuIl19