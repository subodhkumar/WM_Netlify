import * as tslib_1 from "tslib";
import { Attribute, Component, Injector, ViewChild } from '@angular/core';
import { $appDigest, $unwatch, $watch, debounce, isAppleProduct, isDefined, toBoolean } from '@wm/core';
import { registerProps } from './chips.props';
import { styler } from '../../framework/styler';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { configureDnD, getUniqObjsByDataField } from '../../../utils/form-utils';
import { ALLFIELDS } from '../../../utils/data-utils';
import { getConditionalClasses, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-chips',
    hostClass: 'app-chips nav nav-pills list-inline'
};
var ChipsComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ChipsComponent, _super);
    function ChipsComponent(inj, bindDisplayField, bindDisplayExpr, bindDisplayImgSrc, bindDataField, bindDataSet, bindChipclass) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.bindDisplayField = bindDisplayField;
        _this.bindDisplayExpr = bindDisplayExpr;
        _this.bindDisplayImgSrc = bindDisplayImgSrc;
        _this.bindDataField = bindDataField;
        _this.bindDataSet = bindDataSet;
        _this.bindChipclass = bindChipclass;
        _this.chipsList = [];
        _this.maxSizeReached = 'Max size reached';
        _this._unsubscribeDv = false;
        styler(_this.nativeElement, _this);
        // set the showsearchicon as false by default.
        if (!isDefined(_this.showsearchicon)) {
            _this.showsearchicon = false;
        }
        _this.multiple = true;
        _this.nextItemIndex = 0; // default chip index
        _this._debounceUpdateQueryModel = debounce(function (val) {
            _this.updateQueryModel(val).then(function () {
                if (_this.bindChipclass) {
                    _.forEach(_this.chipsList, function (item, index) {
                        _this.registerChipItemClass(item, index);
                    });
                }
            });
        }, 150);
        var datasetSubscription = _this.dataset$.subscribe(function () {
            _this.searchComponent.dataset = _this.dataset;
            _this.nextItemIndex = _this.datasetItems.length;
            _this._debounceUpdateQueryModel(_this.datavalue || _this.toBeProcessedDatavalue);
        });
        _this.registerDestroyListener(function () { return datasetSubscription.unsubscribe(); });
        var datavalueSubscription = _this.datavalue$.subscribe(function (val) {
            // update queryModel only when parentRef is available.
            if (!_this._unsubscribeDv) {
                _this.chipsList = [];
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                _this._debounceUpdateQueryModel(val);
            }
        });
        _this.registerDestroyListener(function () { return datavalueSubscription.unsubscribe(); });
        return _this;
    }
    Object.defineProperty(ChipsComponent.prototype, "datasource", {
        // getter setter is added to pass the datasource to searchcomponent.
        get: function () {
            return this._datasource;
        },
        set: function (nv) {
            this._datasource = nv;
            this.searchComponent.datasource = nv;
            this._debounceUpdateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
        },
        enumerable: true,
        configurable: true
    });
    ChipsComponent.prototype.ngOnInit = function () {
        var _this = this;
        _super.prototype.ngOnInit.call(this);
        this.searchComponent.multiple = true;
        this.searchComponent.binddisplayimagesrc = this.bindDisplayImgSrc;
        this.searchComponent.displayimagesrc = this.displayimagesrc;
        this.searchComponent.binddisplaylabel = this.bindDisplayExpr;
        this.searchComponent.displaylabel = this.displayfield;
        this.searchComponent.datafield = this.bindDataField || this.datafield;
        this.searchComponent.binddataset = this.bindDataSet;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.limit = this.limit;
        this.searchComponent.debouncetime = this.debouncetime;
        this.searchComponent.matchmode = this.matchmode;
        this.getTransformedData = function (val, isCustom) {
            return _this.searchComponent.getTransformedData([val], _this.nextItemIndex++, isCustom);
        };
    };
    ChipsComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        if (this.enablereorder) {
            this.configureDnD();
        }
    };
    /**
     * This method returns the evaluated class expression.
     * @param $index index of the chip
     * @param item chip object containing the key, value, label
     * @returns {any} evaluated class expression value
     */
    ChipsComponent.prototype.registerChipItemClass = function (item, $index) {
        var _this = this;
        if (this.bindChipclass) {
            var watchName = this.widgetId + "_chipItemClass_" + $index;
            $unwatch(watchName);
            this.registerDestroyListener($watch(this.bindChipclass, this.viewParent, { item: item, $index: $index }, function (nv, ov) {
                _this.applyItemClass(getConditionalClasses(nv, ov), $index);
            }, watchName));
        }
    };
    ChipsComponent.prototype.applyItemClass = function (val, index) {
        var chipItem = this.nativeElement.querySelectorAll('.chip-item').item(index);
        $(chipItem).removeClass(val.toRemove).addClass(val.toAdd);
    };
    ChipsComponent.prototype.removeDuplicates = function () {
        this.chipsList = getUniqObjsByDataField(this.chipsList, this.datafield, this.displayfield || this.displaylabel);
    };
    // This method updates the queryModel.
    // default call to get the default data can be done only when defaultQuery is true.
    ChipsComponent.prototype.updateQueryModel = function (data) {
        var _this = this;
        var promises = [];
        if (!data) {
            this.chipsList = [];
            return Promise.resolve();
        }
        // clone the data as the updations on data will change the datavalue.
        var dataValue = _.clone(data);
        var prevChipsList = this.chipsList;
        this.chipsList = [];
        // update the model when model has items more than maxsize
        if (this.maxsize && dataValue.length > this.maxsize) {
            this._modelByValue = dataValue = _.slice(dataValue, 0, this.maxsize);
            data = dataValue;
        }
        var searchQuery = [];
        /**
         * For each value in datavalue,
         * 1. check whether value is in datasetItems, if item is found, addd to the chipsList.
         * 2. else make a default query to the filter and get the record.
         * 3. In step 2, if datavalue is not ALLFIELDS, then make a query. Extract the chipsList from the query response.
         * 4. If there is no response for the value and allowonlyselect is true, remove the value from the datavalue. So that datavalue just contains the valid values.
         * 5. In step 2, if datavalue is ALLFIELDS and value is object, then just prepare the datasetItem from the value.
         * 6. If value is not object and allowonlyselect is false, then create a customModel and replace this value with customModel and prepare datasetItem from this value
         */
        dataValue.forEach(function (val, i) {
            var itemFound = _.find(_this.datasetItems, function (item) {
                return _.isObject(item.value) ? _.isEqual(item.value, val) : _.toString(item.value) === _.toString(val);
            });
            if (itemFound) {
                _this.chipsList.push(itemFound);
            }
            else if (_this.datafield !== ALLFIELDS) {
                searchQuery.push(val);
            }
            else if (_this.datafield === ALLFIELDS) {
                var dataObj = void 0, isCustom = false;
                if (!_.isObject(val)) {
                    dataObj = _this.createCustomDataModel(val);
                    isCustom = true;
                    if (dataObj) {
                        data.splice(i, 1, dataObj);
                    }
                }
                else {
                    // if custom chips is already generated, val will be object as {'dataField_val': 'entered_val'}
                    // Hence check this val in previous chipList and assign the iscustom flag
                    var prevChipObj = prevChipsList.find(function (obj) {
                        return _.isEqual(obj.value, val);
                    });
                    if (prevChipObj) {
                        isCustom = prevChipObj.iscustom;
                    }
                }
                dataObj = dataObj || val;
                var transformedData = _this.getTransformedData(dataObj, isCustom);
                var chipObj = transformedData[0];
                if (isCustom) {
                    chipObj.iscustom = isCustom;
                }
                _this.chipsList.push(chipObj);
            }
        });
        // make default query with all the values and if response for the value is not in datavalue then add a custom chip object.
        if (searchQuery.length) {
            promises.push(this.getDefaultModel(searchQuery, this.nextItemIndex)
                .then(function (response) {
                _this.chipsList = _this.chipsList.concat(response || []);
                dataValue.forEach(function (val, i) {
                    var isExists = _.find(_this.chipsList, function (obj) {
                        return obj.value.toString() === val.toString();
                    });
                    if (!isExists) {
                        if (_this.allowonlyselect) {
                            var index = data.indexOf(val);
                            if (index > -1) {
                                data.splice(index, 1);
                            }
                            return;
                        }
                        var transformedData = _this.getTransformedData(val, true);
                        var chipObj = transformedData[0];
                        chipObj.iscustom = true;
                        _this.chipsList.push(chipObj);
                    }
                });
            }));
        }
        // default chip data is adding focus on to the search input. Hence this flag helps not to focus.
        this.resetSearchModel(true);
        return Promise.all(promises).then(function () {
            _this._modelByValue = data;
            _this.removeDuplicates();
            _this.updateMaxSize();
            $appDigest();
        });
    };
    ChipsComponent.prototype.resetSearchModel = function (defaultQuery) {
        this._unsubscribeDv = true;
        // clear search will empty the query model and gets the data when minchars is 0 (i.e. autocomplete) on focus
        // defaultQuery flag is set when widget is not active. This will only load the autocomplete dropup with minchars as 0 when widget is focused/active
        this.searchComponent.clearSearch(undefined, !this.minchars && !defaultQuery);
        this._unsubscribeDv = false;
    };
    // Triggerred when typeahead option is selected by enter keypress.
    ChipsComponent.prototype.onSelect = function ($event) {
        if (!this.searchComponent.liElements.length) {
            this.addItem($event);
        }
    };
    // Add the newItem to the list
    ChipsComponent.prototype.addItem = function ($event, widget) {
        var searchComponent = widget;
        var allowAdd;
        var chipObj;
        if (searchComponent && isDefined(searchComponent.datavalue) && searchComponent.queryModel !== '') {
            if (!searchComponent.query || !_.trim(searchComponent.query)) {
                return;
            }
            chipObj = searchComponent.queryModel;
        }
        else {
            if (this.allowonlyselect) {
                return;
            }
            var dataObj = void 0;
            if (this.datafield === ALLFIELDS) {
                if (!_.isObject(this.searchComponent.query) && _.trim(this.searchComponent.query)) {
                    dataObj = this.createCustomDataModel(this.searchComponent.query);
                    // return if the custom chip is empty
                    if (!dataObj) {
                        this.resetSearchModel();
                        return;
                    }
                }
            }
            var data = dataObj || _.trim(this.searchComponent.query);
            if (data) {
                var transformedData = this.getTransformedData(data, true);
                chipObj = transformedData[0];
                chipObj.iscustom = true;
            }
        }
        if (!isDefined(chipObj) || chipObj === '') {
            return;
        }
        allowAdd = this.invokeEventCallback('beforeadd', { $event: $event, newItem: chipObj });
        if (isDefined(allowAdd) && !toBoolean(allowAdd)) {
            return;
        }
        if (this.isDuplicate(chipObj)) {
            this.resetSearchModel();
            return;
        }
        this.registerChipItemClass(chipObj, this.chipsList.length);
        this.chipsList.push(chipObj);
        if (!this.datavalue) {
            this._modelByValue = [chipObj.value];
        }
        else {
            this._modelByValue = tslib_1.__spread(this._modelByValue, [chipObj.value]);
        }
        this._unsubscribeDv = true;
        this.invokeOnTouched();
        this.invokeOnChange(this._modelByValue, $event || {}, true);
        this.invokeEventCallback('add', { $event: $event, $item: chipObj });
        this.updateMaxSize();
        // reset input box when item is added.
        this.resetSearchModel();
        // stop the event to not to call the submit event on enter press.
        if ($event && ($event.key === 'Enter' || $event.keyCode === 13)) {
            this.stopEvent($event);
        }
    };
    // Prepare datavalue object from a string(junk) value when datafield is allFields.
    ChipsComponent.prototype.createCustomDataModel = function (val) {
        var key = this.displayfield || (this.datafield !== ALLFIELDS ? this.datafield : undefined);
        if (key) {
            var customObj = {};
            customObj[key] = val;
            return customObj;
        }
    };
    // Check if newItem already exists
    ChipsComponent.prototype.isDuplicate = function (item) {
        if (this.datafield === ALLFIELDS) {
            return _.findIndex(this.chipsList, { value: item.value }) > -1;
        }
        return _.findIndex(this.chipsList, { key: item.key }) > -1;
    };
    // Check if max size is reached
    ChipsComponent.prototype.updateMaxSize = function () {
        this.saturate = this.maxsize > 0 && this.chipsList.length === this.maxsize;
    };
    // Makes call to searchComponent to filter the dataSource based on the query.
    ChipsComponent.prototype.getDefaultModel = function (query, index) {
        this.nextItemIndex++;
        return this.searchComponent.getDataSource(query, true, index)
            .then(function (response) {
            return _.filter(query, function (queryVal) {
                _.find(response, { value: queryVal });
            });
        });
    };
    ChipsComponent.prototype.handleChipClick = function ($event, chip) {
        if (this.readonly) {
            return;
        }
        $event.currentTarget.focus();
        this.invokeEventCallback('chipclick', { $event: $event, $item: chip });
    };
    ChipsComponent.prototype.handleChipFocus = function ($event, chip) {
        if (this.readonly) {
            return;
        }
        chip.active = true;
        this.invokeEventCallback('chipselect', { $event: $event, $item: chip });
    };
    // To avoid form submit on pressing enter key
    ChipsComponent.prototype.stopEvent = function ($event) {
        $event.stopPropagation();
        $event.preventDefault();
    };
    ChipsComponent.prototype.onTextDelete = function ($event) {
        if (isAppleProduct) {
            this.onInputClear($event);
        }
    };
    ChipsComponent.prototype.onInputClear = function ($event) {
        if (!this.chipsList || !this.chipsList.length || this.searchComponent.query) {
            return;
        }
        this.$element.find('li.chip-item > a.app-chip:last').focus();
        this.stopEvent($event);
    };
    ChipsComponent.prototype.onBackspace = function ($event, $item, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index, true);
    };
    ChipsComponent.prototype.onDelete = function ($event, $item, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index);
    };
    ChipsComponent.prototype.onArrowLeft = function ($item, $index) {
        if (this.readonly) {
            return;
        }
        // On left arrow click when search input query is empty.
        if (!this.searchComponent.query && !isDefined($index) && !isDefined($item)) {
            this.$element.find('li.chip-item > a.app-chip:last').focus();
            return;
        }
        if ($index > 0) {
            this.$element.find('li.chip-item > a.app-chip').get($index - 1).focus();
        }
        else {
            this.focusSearchBox();
        }
    };
    ChipsComponent.prototype.onArrowRight = function ($item, $index) {
        if (this.readonly) {
            return;
        }
        // On right arrow click when search input query is empty.
        if (!this.searchComponent.query && !isDefined($index) && !isDefined($item)) {
            this.$element.find('li.chip-item > a.app-chip:first').focus();
            return;
        }
        if ($index < (this.chipsList.length - 1)) {
            this.$element.find('li.chip-item > a.app-chip').get($index + 1).focus();
        }
        else {
            this.focusSearchBox();
        }
    };
    // focus search box.
    ChipsComponent.prototype.focusSearchBox = function () {
        this.$element.find('.app-chip-input > input.app-textbox').focus();
    };
    // Remove the item from list
    ChipsComponent.prototype.removeItem = function ($event, item, index, canFocus) {
        var _this = this;
        $event.stopPropagation();
        var indexes = _.isArray(index) ? index : [index];
        var focusIndex = _.max(indexes);
        var items = _.reduce(indexes, function (result, i) {
            result.push(_this.chipsList[i]);
            return result;
        }, []);
        // prevent deletion if the before-remove event callback returns false
        var allowRemove = this.invokeEventCallback('beforeremove', { $event: $event, $item: items.length === 1 ? items[0] : items });
        if (isDefined(allowRemove) && !toBoolean(allowRemove)) {
            return;
        }
        var prevDatavalue = _.clone(this.datavalue);
        // focus next chip after deletion.
        // if there are no chips in the list focus search box
        setTimeout(function () {
            var chipsLength = _this.chipsList.length;
            var $chipsList = _this.$element.find('li.chip-item > a.app-chip');
            if (!chipsLength || !canFocus) {
                _this.focusSearchBox();
            }
            else if ((chipsLength - 1) < focusIndex) {
                // if focus index is greater than chips length select last chip
                $chipsList.get(chipsLength - 1).focus();
            }
            else {
                // manually set the succeeding chip as active if there is a chip next to the current chip.
                _this.chipsList[focusIndex].active = true;
                $chipsList.get(focusIndex).focus();
            }
        });
        var pulledItems = _.pullAt(this.chipsList, indexes);
        pulledItems.forEach(function (datasetItem) {
            _this._modelByValue = _.filter(_this._modelByValue, function (val) {
                return !(_.isObject(val) ? _.isEqual(val, datasetItem.value) : _.toString(val) === _.toString(datasetItem.value));
            });
        });
        this._unsubscribeDv = false;
        this.invokeOnChange(this._modelByValue, $event, true);
        this.invokeEventCallback('change', { $event: $event, newVal: this.datavalue, oldVal: prevDatavalue });
        this.updateMaxSize();
        this.invokeEventCallback('remove', { $event: $event, $item: items.length === 1 ? items[0] : items });
    };
    /**
     * Swaps items in an array if provided with indexes.
     * @param data :- array to be swapped
     * @param newIndex :- new index for the element to be placed
     * @param currentIndex :- the current index of the element.
     */
    ChipsComponent.prototype.swapElementsInArray = function (data, newIndex, currentIndex) {
        var draggedItem = _.pullAt(data, currentIndex)[0];
        data.splice(newIndex, 0, draggedItem);
    };
    /**
     * Cancels the reorder by reseting the elements to the original position.
     */
    ChipsComponent.prototype.resetReorder = function () {
        this.$element.removeData('oldIndex');
    };
    ChipsComponent.prototype.onBeforeservicecall = function (inputData) {
        this.invokeEventCallback('beforeservicecall', { inputData: inputData });
    };
    ChipsComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        if (eventName === 'remove' || eventName === 'beforeremove' || eventName === 'chipselect'
            || eventName === 'chipclick' || eventName === 'add' || eventName === 'reorder' || eventName === 'change') {
            return;
        }
        _super.prototype.handleEvent.call(this, node, eventName, eventCallback, locals);
    };
    // Configures the reordable feature in chips widgets.
    ChipsComponent.prototype.configureDnD = function () {
        var options = {
            items: '> li:not(.app-chip-search)',
            placeholder: 'chip-placeholder'
        };
        configureDnD(this.$element, options, this.onReorderStart.bind(this), this.update.bind(this));
    };
    // Triggered on drag start while reordering.
    ChipsComponent.prototype.onReorderStart = function (evt, ui) {
        var helper = ui.helper;
        // increasing the width of the dragged item by 1
        helper.width(helper.width() + 1);
        this.$element.data('oldIndex', ui.item.index() - (this.inputposition === 'first' ? 1 : 0));
    };
    // updates the chipsList and datavalue on reorder.
    ChipsComponent.prototype.update = function ($event, ui) {
        var changedItem, newIndex, oldIndex;
        // Get the index of the item at position before drag and after the reorder.
        newIndex = ui.item.index() - (this.inputposition === 'first' ? 1 : 0);
        oldIndex = this.$element.data('oldIndex');
        newIndex = this.chipsList.length === newIndex ? newIndex - 1 : newIndex;
        changedItem = {
            oldIndex: oldIndex,
            newIndex: newIndex,
            item: this.chipsList[oldIndex]
        };
        if (newIndex === oldIndex) {
            this.resetReorder();
            return;
        }
        changedItem.item = this.chipsList[oldIndex];
        var allowReorder = this.invokeEventCallback('beforereorder', { $event: $event, $data: this.chipsList, $changedItem: changedItem });
        if (isDefined(allowReorder) && toBoolean(allowReorder) === false) {
            this.resetReorder();
            return;
        }
        // modify the chipsList and datavalue after the reorder.
        this.swapElementsInArray(this.chipsList, newIndex, oldIndex);
        this.swapElementsInArray(this._modelByValue, newIndex, oldIndex);
        changedItem.item = this.chipsList[newIndex];
        this.chipsList = tslib_1.__spread(this.chipsList);
        this.resetReorder();
        this.invokeEventCallback('reorder', { $event: $event, $data: this.chipsList, $changedItem: changedItem });
    };
    ChipsComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'tabindex') {
            return;
        }
        if (key === 'dataoptions') {
            this.searchComponent.dataoptions = nv;
        }
        if (key === 'datafield') {
            this.searchComponent.datafield = this.datafield;
        }
        if (key === 'displayfield') {
            this.searchComponent.displaylabel = this.displayfield;
        }
        if (key === 'displayexpression') {
            this.searchComponent.binddisplaylabel = this.binddisplayexpression ? this.binddisplayexpression : this.displayexpression;
        }
        if (key === 'displayimagesrc') {
            this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        }
        if (key === 'limit') {
            this.searchComponent.limit = this.limit;
        }
        if (key === 'enablereorder') {
            if (this.$element.hasClass('ui-sortable')) {
                this.$element.sortable('option', 'disabled', !nv);
            }
            else if (nv) {
                this.configureDnD();
            }
        }
        if (key === 'readonly') {
            if (nv) {
                this.$element.addClass('readonly');
            }
            else {
                this.$element.removeClass('readonly');
            }
        }
        if (key === 'inputposition') {
            var $inputEl = this.$element.find('li.app-chip-search');
            if (nv === 'first') {
                this.$element.prepend($inputEl);
            }
            else {
                this.$element.append($inputEl);
            }
        }
        if (key === 'autofocus' && nv) {
            // setting the autofocus on the input once after dom is updated
            setTimeout(function () {
                var $chipsList = _this.$element.find('.app-chip-input > input.app-textbox');
                if ($chipsList && $chipsList.length) {
                    _this.focusSearchBox();
                }
            });
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    ChipsComponent.initializeProps = registerProps();
    ChipsComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmChips]',
                    template: "<li class=\"chip-item\" role=\"option\" *ngFor=\"let item of chipsList; let $index = index;\"\n    [ngClass]=\"{'active': item.active, 'disabled': disabled}\">\n    <a class=\"app-chip\" href=\"javascript:void(0);\" tabindex=\"-1\"\n       (click)=\"handleChipClick($event, item)\"\n       (keydown.delete)=\"onDelete($event, item, $index)\"\n       (keydown.backspace)=\"onBackspace($event, item, $index)\"\n       (keydown.arrowleft)=\"onArrowLeft(item, $index)\"\n       (keydown.arrowright)=\"onArrowRight(item, $index)\"\n       (focus)=\"handleChipFocus($event, item)\"\n       (blur)=\"readonly ? 0 : item.active = false\"\n       [ngClass]=\"{'chip-duplicate bg-danger': item.isDuplicate, 'chip-picture': item.imgSrc}\">\n        <img data-identifier=\"img\" alt=\"Chip Image\" class=\"button-image-icon\" [src]=\"item.imgSrc\" *ngIf=\"item.imgSrc\"/>\n        <span class=\"app-chip-title\" [textContent]=\"item.label\" [title]=\"item.label\"></span>\n        <button type=\"button\" tabindex=\"-1\" arial-label=\"Clear Button\" class=\"btn btn-transparent\" (click)=\"removeItem($event, item, $index);\" *ngIf=\"!readonly\">\n            <i class=\"app-icon wi wi-close\"></i>\n        </button>\n    </a>\n</li>\n<li class=\"app-chip-search\" [ngClass]=\"{'full-width': inputwidth === 'full'}\">\n    <div #search wmSearch class=\"app-chip-input\"\n         name=\"app-chip-search\"\n         submit.event=\"addItem($event, widget)\"\n         beforeservicecall.event=\"onBeforeservicecall(inputData)\"\n         disabled.bind=\"disabled || readonly || saturate\"\n         datafield.bind=\"datafield\"\n         allowonlyselect.bind=\"allowonlyselect\"\n         searchkey.bind=\"searchkey\"\n         orderby.bind=\"orderby\"\n         placeholder.bind=\"saturate ? maxSizeReached : placeholder\"\n         showsearchicon.bind=\"showsearchicon\"\n         tabindex.bind=\"tabindex\"\n         minchars.bind=\"minchars\"\n         debouncetime.bind=\"debouncetime\"\n         matchmode.bind=\"matchmode\"\n         (keydown.enter)=\"onSelect($event)\"\n         (keydown.delete)=\"onTextDelete($event)\"\n         (keydown.backspace)=\"onInputClear($event)\"\n         (keydown.arrowleft)=\"onArrowLeft()\"\n         (keydown.arrowright)=\"onArrowRight()\">\n    </div>\n</li>\n",
                    providers: [
                        provideAsNgValueAccessor(ChipsComponent),
                        provideAsWidgetRef(ChipsComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ChipsComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['displayfield.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['displayexpression.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['displayimagesrc.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['datafield.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['chipclass.bind',] }] }
    ]; };
    ChipsComponent.propDecorators = {
        searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
    };
    return ChipsComponent;
}(DatasetAwareFormComponent));
export { ChipsComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcHMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGlwcy9jaGlwcy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpHLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFeEcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxZQUFZLEVBQWUsc0JBQXNCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM5RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFJakgsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxVQUFVO0lBQ3RCLFNBQVMsRUFBRSxxQ0FBcUM7Q0FDbkQsQ0FBQztBQUVGO0lBUW9DLDBDQUF5QjtJQXFDekQsd0JBQ0ksR0FBYSxFQUMyQixnQkFBZ0IsRUFDWCxlQUFlLEVBQ2pCLGlCQUFpQixFQUN2QixhQUFhLEVBQ2YsV0FBVyxFQUNULGFBQWE7UUFQdEQsWUFTSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBc0M1QjtRQTdDMkMsc0JB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QVMsU0FBQyxjQUFjO2dEQUN4QixTQUFTLFNBQUMsZ0JBQWdCOzs7a0NBNUI5QixTQUFTLFNBQUMsZUFBZTs7SUF1b0I5QixxQkFBQztDQUFBLEFBL3BCRCxDQVFvQyx5QkFBeUIsR0F1cEI1RDtTQXZwQlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHVud2F0Y2gsICR3YXRjaCwgZGVib3VuY2UsIGlzQXBwbGVQcm9kdWN0LCBpc0RlZmluZWQsIHRvQm9vbGVhbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2hpcHMucHJvcHMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTZWFyY2hDb21wb25lbnQgfSBmcm9tICcuLi9zZWFyY2gvc2VhcmNoLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IGNvbmZpZ3VyZURuRCwgRGF0YVNldEl0ZW0sIGdldFVuaXFPYmpzQnlEYXRhRmllbGQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcbmltcG9ydCB7IEFMTEZJRUxEUyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25hbENsYXNzZXMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNoaXBzJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtY2hpcHMgbmF2IG5hdi1waWxscyBsaXN0LWlubGluZSdcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ2hpcHNdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2hpcHMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoQ2hpcHNDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ2hpcHNDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDaGlwc0NvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgcHVibGljIGFsbG93b25seXNlbGVjdDogYm9vbGVhbjtcbiAgICBwdWJsaWMgZW5hYmxlcmVvcmRlcjogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4c2l6ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBpbnB1dHdpZHRoOiBhbnk7XG4gICAgcHJpdmF0ZSBkZWJvdW5jZXRpbWU6IG51bWJlcjtcblxuICAgIHB1YmxpYyBjaGlwc0xpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1heFNpemVSZWFjaGVkID0gJ01heCBzaXplIHJlYWNoZWQnO1xuICAgIHByaXZhdGUgc2F0dXJhdGU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBuZXh0SXRlbUluZGV4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBnZXRUcmFuc2Zvcm1lZERhdGE6IChkYXRhLCBpdGVtSW5kZXg/KSA9PiBEYXRhU2V0SXRlbVtdO1xuICAgIHByaXZhdGUgaW5wdXRwb3NpdGlvbjogc3RyaW5nO1xuICAgIHByaXZhdGUgc2hvd3NlYXJjaGljb246IGJvb2xlYW47XG5cbiAgICBAVmlld0NoaWxkKFNlYXJjaENvbXBvbmVudCkgc2VhcmNoQ29tcG9uZW50OiBTZWFyY2hDb21wb25lbnQ7XG4gICAgcHJpdmF0ZSBfZGF0YXNvdXJjZTogYW55O1xuICAgIHByaXZhdGUgX3Vuc3Vic2NyaWJlRHYgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNlYXJjaGtleTogc3RyaW5nO1xuICAgIHByaXZhdGUgX2RlYm91bmNlVXBkYXRlUXVlcnlNb2RlbDogYW55O1xuICAgIHByaXZhdGUgbGltaXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9jbGFzc0V4cHI6IGFueTtcbiAgICBwcml2YXRlIG1pbmNoYXJzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBtYXRjaG1vZGU6IHN0cmluZztcblxuICAgIC8vIGdldHRlciBzZXR0ZXIgaXMgYWRkZWQgdG8gcGFzcyB0aGUgZGF0YXNvdXJjZSB0byBzZWFyY2hjb21wb25lbnQuXG4gICAgZ2V0IGRhdGFzb3VyY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YXNvdXJjZTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YXNvdXJjZShudikge1xuICAgICAgICB0aGlzLl9kYXRhc291cmNlID0gbnY7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFzb3VyY2UgPSBudjtcbiAgICAgICAgdGhpcy5fZGVib3VuY2VVcGRhdGVRdWVyeU1vZGVsKHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Rpc3BsYXlmaWVsZC5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUZpZWxkLFxuICAgICAgICBAQXR0cmlidXRlKCdkaXNwbGF5ZXhwcmVzc2lvbi5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUV4cHIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Rpc3BsYXlpbWFnZXNyYy5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUltZ1NyYyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YWZpZWxkLmJpbmQnKSBwcml2YXRlIGJpbmREYXRhRmllbGQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2RhdGFzZXQuYmluZCcpIHByaXZhdGUgYmluZERhdGFTZXQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2NoaXBjbGFzcy5iaW5kJykgcHJpdmF0ZSBiaW5kQ2hpcGNsYXNzXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgc2hvd3NlYXJjaGljb24gYXMgZmFsc2UgYnkgZGVmYXVsdC5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodGhpcy5zaG93c2VhcmNoaWNvbikpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd3NlYXJjaGljb24gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubXVsdGlwbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLm5leHRJdGVtSW5kZXggPSAwOyAvLyBkZWZhdWx0IGNoaXAgaW5kZXhcblxuICAgICAgICB0aGlzLl9kZWJvdW5jZVVwZGF0ZVF1ZXJ5TW9kZWwgPSBkZWJvdW5jZSgodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVF1ZXJ5TW9kZWwodmFsKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5iaW5kQ2hpcGNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNoaXBzTGlzdCwgKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ2hpcEl0ZW1DbGFzcyhpdGVtLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxNTApO1xuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICAgICAgdGhpcy5uZXh0SXRlbUluZGV4ID0gdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VVcGRhdGVRdWVyeU1vZGVsKHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IGRhdGFzZXRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cbiAgICAgICAgY29uc3QgZGF0YXZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhdmFsdWUkLnN1YnNjcmliZSgodmFsOiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgcXVlcnlNb2RlbCBvbmx5IHdoZW4gcGFyZW50UmVmIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgICAgIGlmICghdGhpcy5fdW5zdWJzY3JpYmVEdikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGFmaWVsZCBpcyBBTExGSUxFRFMgZG8gbm90IGZldGNoIHRoZSByZWNvcmRzXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBxdWVyeSBtb2RlbCB3aXRoIHRoZSB2YWx1ZXMgd2UgaGF2ZVxuICAgICAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlVXBkYXRlUXVlcnlNb2RlbCh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhdmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG5cbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubXVsdGlwbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kRGlzcGxheUltZ1NyYztcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWltYWdlc3JjID0gdGhpcy5kaXNwbGF5aW1hZ2VzcmM7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmJpbmRkaXNwbGF5bGFiZWwgPSB0aGlzLmJpbmREaXNwbGF5RXhwcjtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5kaXNwbGF5ZmllbGQ7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFmaWVsZCA9IHRoaXMuYmluZERhdGFGaWVsZCB8fCB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRhdGFzZXQgPSB0aGlzLmJpbmREYXRhU2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5zZWFyY2hrZXkgPSB0aGlzLnNlYXJjaGtleTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubGltaXQgPSB0aGlzLmxpbWl0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kZWJvdW5jZXRpbWUgPSB0aGlzLmRlYm91bmNldGltZTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubWF0Y2htb2RlID0gdGhpcy5tYXRjaG1vZGU7XG5cbiAgICAgICAgdGhpcy5nZXRUcmFuc2Zvcm1lZERhdGEgPSAodmFsLCBpc0N1c3RvbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoQ29tcG9uZW50LmdldFRyYW5zZm9ybWVkRGF0YShbdmFsXSwgdGhpcy5uZXh0SXRlbUluZGV4KyssIGlzQ3VzdG9tKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5lbmFibGVyZW9yZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZURuRCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZXZhbHVhdGVkIGNsYXNzIGV4cHJlc3Npb24uXG4gICAgICogQHBhcmFtICRpbmRleCBpbmRleCBvZiB0aGUgY2hpcFxuICAgICAqIEBwYXJhbSBpdGVtIGNoaXAgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSwgdmFsdWUsIGxhYmVsXG4gICAgICogQHJldHVybnMge2FueX0gZXZhbHVhdGVkIGNsYXNzIGV4cHJlc3Npb24gdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZ2lzdGVyQ2hpcEl0ZW1DbGFzcyhpdGVtLCAkaW5kZXgpIHtcbiAgICAgICAgaWYgKHRoaXMuYmluZENoaXBjbGFzcykge1xuICAgICAgICAgICAgY29uc3Qgd2F0Y2hOYW1lID0gYCR7dGhpcy53aWRnZXRJZH1fY2hpcEl0ZW1DbGFzc18keyRpbmRleH1gO1xuICAgICAgICAgICAgJHVud2F0Y2god2F0Y2hOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoJHdhdGNoKHRoaXMuYmluZENoaXBjbGFzcywgdGhpcy52aWV3UGFyZW50LCB7aXRlbSwgJGluZGV4fSwgKG52LCBvdikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlJdGVtQ2xhc3MoZ2V0Q29uZGl0aW9uYWxDbGFzc2VzKG52LCBvdiksICRpbmRleCk7XG4gICAgICAgICAgICB9LCB3YXRjaE5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlJdGVtQ2xhc3ModmFsLCBpbmRleCkge1xuICAgICAgICBjb25zdCBjaGlwSXRlbSA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hpcC1pdGVtJykuaXRlbShpbmRleCk7XG4gICAgICAgICQoY2hpcEl0ZW0pLnJlbW92ZUNsYXNzKHZhbC50b1JlbW92ZSkuYWRkQ2xhc3ModmFsLnRvQWRkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUR1cGxpY2F0ZXMoKSB7XG4gICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gZ2V0VW5pcU9ianNCeURhdGFGaWVsZCh0aGlzLmNoaXBzTGlzdCwgdGhpcy5kYXRhZmllbGQsIHRoaXMuZGlzcGxheWZpZWxkIHx8IHRoaXMuZGlzcGxheWxhYmVsKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCB1cGRhdGVzIHRoZSBxdWVyeU1vZGVsLlxuICAgIC8vIGRlZmF1bHQgY2FsbCB0byBnZXQgdGhlIGRlZmF1bHQgZGF0YSBjYW4gYmUgZG9uZSBvbmx5IHdoZW4gZGVmYXVsdFF1ZXJ5IGlzIHRydWUuXG4gICAgcHJpdmF0ZSB1cGRhdGVRdWVyeU1vZGVsKGRhdGE6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbG9uZSB0aGUgZGF0YSBhcyB0aGUgdXBkYXRpb25zIG9uIGRhdGEgd2lsbCBjaGFuZ2UgdGhlIGRhdGF2YWx1ZS5cbiAgICAgICAgbGV0IGRhdGFWYWx1ZSA9IF8uY2xvbmUoZGF0YSk7XG4gICAgICAgIGNvbnN0IHByZXZDaGlwc0xpc3QgPSB0aGlzLmNoaXBzTGlzdDtcbiAgICAgICAgdGhpcy5jaGlwc0xpc3QgPSBbXTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIG1vZGVsIHdoZW4gbW9kZWwgaGFzIGl0ZW1zIG1vcmUgdGhhbiBtYXhzaXplXG4gICAgICAgIGlmICh0aGlzLm1heHNpemUgJiYgZGF0YVZhbHVlLmxlbmd0aCA+IHRoaXMubWF4c2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gZGF0YVZhbHVlID0gXy5zbGljZShkYXRhVmFsdWUsIDAsIHRoaXMubWF4c2l6ZSk7XG4gICAgICAgICAgICBkYXRhID0gZGF0YVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VhcmNoUXVlcnk6IEFycmF5PHN0cmluZz4gPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yIGVhY2ggdmFsdWUgaW4gZGF0YXZhbHVlLFxuICAgICAgICAgKiAxLiBjaGVjayB3aGV0aGVyIHZhbHVlIGlzIGluIGRhdGFzZXRJdGVtcywgaWYgaXRlbSBpcyBmb3VuZCwgYWRkZCB0byB0aGUgY2hpcHNMaXN0LlxuICAgICAgICAgKiAyLiBlbHNlIG1ha2UgYSBkZWZhdWx0IHF1ZXJ5IHRvIHRoZSBmaWx0ZXIgYW5kIGdldCB0aGUgcmVjb3JkLlxuICAgICAgICAgKiAzLiBJbiBzdGVwIDIsIGlmIGRhdGF2YWx1ZSBpcyBub3QgQUxMRklFTERTLCB0aGVuIG1ha2UgYSBxdWVyeS4gRXh0cmFjdCB0aGUgY2hpcHNMaXN0IGZyb20gdGhlIHF1ZXJ5IHJlc3BvbnNlLlxuICAgICAgICAgKiA0LiBJZiB0aGVyZSBpcyBubyByZXNwb25zZSBmb3IgdGhlIHZhbHVlIGFuZCBhbGxvd29ubHlzZWxlY3QgaXMgdHJ1ZSwgcmVtb3ZlIHRoZSB2YWx1ZSBmcm9tIHRoZSBkYXRhdmFsdWUuIFNvIHRoYXQgZGF0YXZhbHVlIGp1c3QgY29udGFpbnMgdGhlIHZhbGlkIHZhbHVlcy5cbiAgICAgICAgICogNS4gSW4gc3RlcCAyLCBpZiBkYXRhdmFsdWUgaXMgQUxMRklFTERTIGFuZCB2YWx1ZSBpcyBvYmplY3QsIHRoZW4ganVzdCBwcmVwYXJlIHRoZSBkYXRhc2V0SXRlbSBmcm9tIHRoZSB2YWx1ZS5cbiAgICAgICAgICogNi4gSWYgdmFsdWUgaXMgbm90IG9iamVjdCBhbmQgYWxsb3dvbmx5c2VsZWN0IGlzIGZhbHNlLCB0aGVuIGNyZWF0ZSBhIGN1c3RvbU1vZGVsIGFuZCByZXBsYWNlIHRoaXMgdmFsdWUgd2l0aCBjdXN0b21Nb2RlbCBhbmQgcHJlcGFyZSBkYXRhc2V0SXRlbSBmcm9tIHRoaXMgdmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIGRhdGFWYWx1ZS5mb3JFYWNoKCh2YWw6IGFueSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtRm91bmQgPSBfLmZpbmQodGhpcy5kYXRhc2V0SXRlbXMsIGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmlzT2JqZWN0KGl0ZW0udmFsdWUpID8gXy5pc0VxdWFsKGl0ZW0udmFsdWUsIHZhbCkgOiBfLnRvU3RyaW5nKGl0ZW0udmFsdWUpID09PSBfLnRvU3RyaW5nKHZhbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGl0ZW1Gb3VuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goaXRlbUZvdW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhZmllbGQgIT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIHNlYXJjaFF1ZXJ5LnB1c2godmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhZmllbGQgPT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIGxldCBkYXRhT2JqLCBpc0N1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghXy5pc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSB0aGlzLmNyZWF0ZUN1c3RvbURhdGFNb2RlbCh2YWwpO1xuICAgICAgICAgICAgICAgICAgICBpc0N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxLCBkYXRhT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGN1c3RvbSBjaGlwcyBpcyBhbHJlYWR5IGdlbmVyYXRlZCwgdmFsIHdpbGwgYmUgb2JqZWN0IGFzIHsnZGF0YUZpZWxkX3ZhbCc6ICdlbnRlcmVkX3ZhbCd9XG4gICAgICAgICAgICAgICAgICAgIC8vIEhlbmNlIGNoZWNrIHRoaXMgdmFsIGluIHByZXZpb3VzIGNoaXBMaXN0IGFuZCBhc3NpZ24gdGhlIGlzY3VzdG9tIGZsYWdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldkNoaXBPYmogPSBwcmV2Q2hpcHNMaXN0LmZpbmQob2JqID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmlzRXF1YWwob2JqLnZhbHVlLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZDaGlwT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0N1c3RvbSA9IHByZXZDaGlwT2JqLmlzY3VzdG9tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhT2JqIHx8IHZhbDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGRhdGFPYmosIGlzQ3VzdG9tKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlwT2JqID0gdHJhbnNmb3JtZWREYXRhWzBdO1xuICAgICAgICAgICAgICAgIGlmIChpc0N1c3RvbSkge1xuICAgICAgICAgICAgICAgICAgICAoY2hpcE9iaiBhcyBhbnkpLmlzY3VzdG9tID0gaXNDdXN0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goY2hpcE9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG1ha2UgZGVmYXVsdCBxdWVyeSB3aXRoIGFsbCB0aGUgdmFsdWVzIGFuZCBpZiByZXNwb25zZSBmb3IgdGhlIHZhbHVlIGlzIG5vdCBpbiBkYXRhdmFsdWUgdGhlbiBhZGQgYSBjdXN0b20gY2hpcCBvYmplY3QuXG4gICAgICAgIGlmIChzZWFyY2hRdWVyeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5nZXREZWZhdWx0TW9kZWwoc2VhcmNoUXVlcnksIHRoaXMubmV4dEl0ZW1JbmRleClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gdGhpcy5jaGlwc0xpc3QuY29uY2F0KHJlc3BvbnNlIHx8IFtdKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVZhbHVlLmZvckVhY2goKHZhbDogYW55LCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzRXhpc3RzID0gXy5maW5kKHRoaXMuY2hpcHNMaXN0LCAob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai52YWx1ZS50b1N0cmluZygpID09PSB2YWwudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxsb3dvbmx5c2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleE9mKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGEgPSB0aGlzLmdldFRyYW5zZm9ybWVkRGF0YSh2YWwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaXBPYmogPSB0cmFuc2Zvcm1lZERhdGFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNoaXBPYmogYXMgYW55KS5pc2N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlwc0xpc3QucHVzaChjaGlwT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCBjaGlwIGRhdGEgaXMgYWRkaW5nIGZvY3VzIG9uIHRvIHRoZSBzZWFyY2ggaW5wdXQuIEhlbmNlIHRoaXMgZmxhZyBoZWxwcyBub3QgdG8gZm9jdXMuXG4gICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCh0cnVlKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gZGF0YTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRHVwbGljYXRlcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVNYXhTaXplKCk7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzZXRTZWFyY2hNb2RlbChkZWZhdWx0UXVlcnk/OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSB0cnVlO1xuICAgICAgICAvLyBjbGVhciBzZWFyY2ggd2lsbCBlbXB0eSB0aGUgcXVlcnkgbW9kZWwgYW5kIGdldHMgdGhlIGRhdGEgd2hlbiBtaW5jaGFycyBpcyAwIChpLmUuIGF1dG9jb21wbGV0ZSkgb24gZm9jdXNcbiAgICAgICAgLy8gZGVmYXVsdFF1ZXJ5IGZsYWcgaXMgc2V0IHdoZW4gd2lkZ2V0IGlzIG5vdCBhY3RpdmUuIFRoaXMgd2lsbCBvbmx5IGxvYWQgdGhlIGF1dG9jb21wbGV0ZSBkcm9wdXAgd2l0aCBtaW5jaGFycyBhcyAwIHdoZW4gd2lkZ2V0IGlzIGZvY3VzZWQvYWN0aXZlXG4gICAgICAgICh0aGlzLnNlYXJjaENvbXBvbmVudCBhcyBhbnkpLmNsZWFyU2VhcmNoKHVuZGVmaW5lZCwgIXRoaXMubWluY2hhcnMgJiYgIWRlZmF1bHRRdWVyeSk7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycmVkIHdoZW4gdHlwZWFoZWFkIG9wdGlvbiBpcyBzZWxlY3RlZCBieSBlbnRlciBrZXlwcmVzcy5cbiAgICBwdWJsaWMgb25TZWxlY3QoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoQ29tcG9uZW50LmxpRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0oJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgbmV3SXRlbSB0byB0aGUgbGlzdFxuICAgIHByaXZhdGUgYWRkSXRlbSgkZXZlbnQ6IEV2ZW50LCB3aWRnZXQ/OiBTZWFyY2hDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoQ29tcG9uZW50ID0gd2lkZ2V0O1xuICAgICAgICBsZXQgYWxsb3dBZGQ7XG4gICAgICAgIGxldCBjaGlwT2JqO1xuXG4gICAgICAgIGlmIChzZWFyY2hDb21wb25lbnQgJiYgaXNEZWZpbmVkKHNlYXJjaENvbXBvbmVudC5kYXRhdmFsdWUpICYmIHNlYXJjaENvbXBvbmVudC5xdWVyeU1vZGVsICE9PSAnJykge1xuICAgICAgICAgICAgaWYgKCFzZWFyY2hDb21wb25lbnQucXVlcnkgfHwgIV8udHJpbShzZWFyY2hDb21wb25lbnQucXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpcE9iaiA9IHNlYXJjaENvbXBvbmVudC5xdWVyeU1vZGVsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWxsb3dvbmx5c2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGRhdGFPYmo7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhZmllbGQgPT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc09iamVjdCh0aGlzLnNlYXJjaENvbXBvbmVudC5xdWVyeSkgJiYgXy50cmltKHRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhT2JqID0gdGhpcy5jcmVhdGVDdXN0b21EYXRhTW9kZWwodGhpcy5zZWFyY2hDb21wb25lbnQucXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gaWYgdGhlIGN1c3RvbSBjaGlwIGlzIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YU9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFNlYXJjaE1vZGVsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBkYXRhT2JqIHx8IF8udHJpbSh0aGlzLnNlYXJjaENvbXBvbmVudC5xdWVyeSk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGRhdGEsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNoaXBPYmogPSB0cmFuc2Zvcm1lZERhdGFbMF07XG4gICAgICAgICAgICAgICAgY2hpcE9iai5pc2N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRGVmaW5lZChjaGlwT2JqKSB8fCBjaGlwT2JqID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYWxsb3dBZGQgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWFkZCcsIHskZXZlbnQsIG5ld0l0ZW06IGNoaXBPYmp9KTtcblxuICAgICAgICBpZiAoaXNEZWZpbmVkKGFsbG93QWRkKSAmJiAhdG9Cb29sZWFuKGFsbG93QWRkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNEdXBsaWNhdGUoY2hpcE9iaikpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVnaXN0ZXJDaGlwSXRlbUNsYXNzKGNoaXBPYmosIHRoaXMuY2hpcHNMaXN0Lmxlbmd0aCk7XG4gICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goY2hpcE9iaik7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRhdGF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gW2NoaXBPYmoudmFsdWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gWy4uLnRoaXMuX21vZGVsQnlWYWx1ZSwgY2hpcE9iai52YWx1ZV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLl9tb2RlbEJ5VmFsdWUsICRldmVudCB8fCB7fSwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdhZGQnLCB7JGV2ZW50LCAkaXRlbTogY2hpcE9ian0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlTWF4U2l6ZSgpO1xuXG4gICAgICAgIC8vIHJlc2V0IGlucHV0IGJveCB3aGVuIGl0ZW0gaXMgYWRkZWQuXG4gICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCgpO1xuXG4gICAgICAgIC8vIHN0b3AgdGhlIGV2ZW50IHRvIG5vdCB0byBjYWxsIHRoZSBzdWJtaXQgZXZlbnQgb24gZW50ZXIgcHJlc3MuXG4gICAgICAgIGlmICgkZXZlbnQgJiYgKCgkZXZlbnQgYXMgYW55KS5rZXkgPT09ICdFbnRlcicgfHwgKCRldmVudCBhcyBhbnkpLmtleUNvZGUgPT09IDEzKSkge1xuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByZXBhcmUgZGF0YXZhbHVlIG9iamVjdCBmcm9tIGEgc3RyaW5nKGp1bmspIHZhbHVlIHdoZW4gZGF0YWZpZWxkIGlzIGFsbEZpZWxkcy5cbiAgICBwcml2YXRlIGNyZWF0ZUN1c3RvbURhdGFNb2RlbCh2YWw6IHN0cmluZykge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmRpc3BsYXlmaWVsZCB8fCAodGhpcy5kYXRhZmllbGQgIT09IEFMTEZJRUxEUyA/IHRoaXMuZGF0YWZpZWxkIDogdW5kZWZpbmVkKTtcblxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21PYmogPSB7fTtcbiAgICAgICAgICAgIGN1c3RvbU9ialtrZXldID0gdmFsO1xuICAgICAgICAgICAgcmV0dXJuIGN1c3RvbU9iajtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIG5ld0l0ZW0gYWxyZWFkeSBleGlzdHNcbiAgICBwcml2YXRlIGlzRHVwbGljYXRlKGl0ZW06IERhdGFTZXRJdGVtKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFmaWVsZCA9PT0gQUxMRklFTERTKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5maW5kSW5kZXgodGhpcy5jaGlwc0xpc3QsIHt2YWx1ZTogaXRlbS52YWx1ZX0pID4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMuY2hpcHNMaXN0LCB7a2V5OiBpdGVtLmtleX0pID4gLTE7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgbWF4IHNpemUgaXMgcmVhY2hlZFxuICAgIHByaXZhdGUgdXBkYXRlTWF4U2l6ZSgpIHtcbiAgICAgICAgdGhpcy5zYXR1cmF0ZSA9IHRoaXMubWF4c2l6ZSA+IDAgJiYgdGhpcy5jaGlwc0xpc3QubGVuZ3RoID09PSB0aGlzLm1heHNpemU7XG4gICAgfVxuXG4gICAgLy8gTWFrZXMgY2FsbCB0byBzZWFyY2hDb21wb25lbnQgdG8gZmlsdGVyIHRoZSBkYXRhU291cmNlIGJhc2VkIG9uIHRoZSBxdWVyeS5cbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE1vZGVsKHF1ZXJ5OiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nLCBpbmRleD86IG51bWJlcikge1xuICAgICAgICB0aGlzLm5leHRJdGVtSW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoQ29tcG9uZW50LmdldERhdGFTb3VyY2UocXVlcnksIHRydWUsIGluZGV4KVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZmlsdGVyKHF1ZXJ5LCBxdWVyeVZhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIF8uZmluZChyZXNwb25zZSwge3ZhbHVlOiBxdWVyeVZhbH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVDaGlwQ2xpY2soJGV2ZW50OiBFdmVudCwgY2hpcDogRGF0YVNldEl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoJGV2ZW50LmN1cnJlbnRUYXJnZXQgYXMgYW55KS5mb2N1cygpO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoaXBjbGljaycsIHskZXZlbnQsICRpdGVtOiBjaGlwfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVDaGlwRm9jdXMoJGV2ZW50OiBFdmVudCwgY2hpcDogRGF0YVNldEl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoY2hpcCBhcyBhbnkpLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hpcHNlbGVjdCcsIHskZXZlbnQsICRpdGVtOiBjaGlwfSk7XG4gICAgfVxuXG4gICAgLy8gVG8gYXZvaWQgZm9ybSBzdWJtaXQgb24gcHJlc3NpbmcgZW50ZXIga2V5XG4gICAgcHJpdmF0ZSBzdG9wRXZlbnQoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblRleHREZWxldGUoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZiAoaXNBcHBsZVByb2R1Y3QpIHtcbiAgICAgICAgICAgIHRoaXMub25JbnB1dENsZWFyKCRldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25JbnB1dENsZWFyKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoaXBzTGlzdCB8fCAhdGhpcy5jaGlwc0xpc3QubGVuZ3RoIHx8IHRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwOmxhc3QnKS5mb2N1cygpO1xuICAgICAgICB0aGlzLnN0b3BFdmVudCgkZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CYWNrc3BhY2UoJGV2ZW50OiBFdmVudCwgJGl0ZW06IERhdGFTZXRJdGVtLCAkaW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlSXRlbSgkZXZlbnQsICRpdGVtLCAkaW5kZXgsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25EZWxldGUoJGV2ZW50OiBFdmVudCwgJGl0ZW06IERhdGFTZXRJdGVtLCAkaW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlSXRlbSgkZXZlbnQsICRpdGVtLCAkaW5kZXgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkFycm93TGVmdCgkaXRlbT86IERhdGFTZXRJdGVtLCAkaW5kZXg/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uIGxlZnQgYXJyb3cgY2xpY2sgd2hlbiBzZWFyY2ggaW5wdXQgcXVlcnkgaXMgZW1wdHkuXG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hDb21wb25lbnQucXVlcnkgJiYgIWlzRGVmaW5lZCgkaW5kZXgpICYmICFpc0RlZmluZWQoJGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmNoaXAtaXRlbSA+IGEuYXBwLWNoaXA6bGFzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGluZGV4ID4gMCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwJykuZ2V0KCRpbmRleCAtIDEpLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25BcnJvd1JpZ2h0KCRpdGVtPzogRGF0YVNldEl0ZW0sICRpbmRleD86IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uIHJpZ2h0IGFycm93IGNsaWNrIHdoZW4gc2VhcmNoIGlucHV0IHF1ZXJ5IGlzIGVtcHR5LlxuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5ICYmICFpc0RlZmluZWQoJGluZGV4KSAmJiAhaXNEZWZpbmVkKCRpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkaW5kZXggPCAodGhpcy5jaGlwc0xpc3QubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuY2hpcC1pdGVtID4gYS5hcHAtY2hpcCcpLmdldCgkaW5kZXggKyAxKS5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb2N1c1NlYXJjaEJveCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZm9jdXMgc2VhcmNoIGJveC5cbiAgICBwcml2YXRlIGZvY3VzU2VhcmNoQm94KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5hcHAtY2hpcC1pbnB1dCA+IGlucHV0LmFwcC10ZXh0Ym94JykuZm9jdXMoKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIGl0ZW0gZnJvbSBsaXN0XG4gICAgcHJpdmF0ZSByZW1vdmVJdGVtKCRldmVudDogRXZlbnQsIGl0ZW06IERhdGFTZXRJdGVtLCBpbmRleDogbnVtYmVyLCBjYW5Gb2N1cz86IGJvb2xlYW4pIHtcbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBfLmlzQXJyYXkoaW5kZXgpID8gaW5kZXggOiBbaW5kZXhdO1xuICAgICAgICBjb25zdCBmb2N1c0luZGV4ID0gXy5tYXgoaW5kZXhlcyk7XG5cbiAgICAgICAgY29uc3QgaXRlbXMgPSBfLnJlZHVjZShpbmRleGVzLCAocmVzdWx0LCBpKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNoaXBzTGlzdFtpXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgLy8gcHJldmVudCBkZWxldGlvbiBpZiB0aGUgYmVmb3JlLXJlbW92ZSBldmVudCBjYWxsYmFjayByZXR1cm5zIGZhbHNlXG4gICAgICAgIGNvbnN0IGFsbG93UmVtb3ZlID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyZW1vdmUnLCB7JGV2ZW50LCAkaXRlbTogaXRlbXMubGVuZ3RoID09PSAxID8gaXRlbXNbMF0gOiBpdGVtc30pO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKGFsbG93UmVtb3ZlKSAmJiAhdG9Cb29sZWFuKGFsbG93UmVtb3ZlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJldkRhdGF2YWx1ZSA9IF8uY2xvbmUodGhpcy5kYXRhdmFsdWUpO1xuXG4gICAgICAgIC8vIGZvY3VzIG5leHQgY2hpcCBhZnRlciBkZWxldGlvbi5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGNoaXBzIGluIHRoZSBsaXN0IGZvY3VzIHNlYXJjaCBib3hcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlwc0xlbmd0aCA9IHRoaXMuY2hpcHNMaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0ICRjaGlwc0xpc3QgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmNoaXAtaXRlbSA+IGEuYXBwLWNoaXAnKTtcblxuICAgICAgICAgICAgaWYgKCFjaGlwc0xlbmd0aCB8fCAhY2FuRm9jdXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChjaGlwc0xlbmd0aCAtIDEpIDwgZm9jdXNJbmRleCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIGZvY3VzIGluZGV4IGlzIGdyZWF0ZXIgdGhhbiBjaGlwcyBsZW5ndGggc2VsZWN0IGxhc3QgY2hpcFxuICAgICAgICAgICAgICAgICRjaGlwc0xpc3QuZ2V0KGNoaXBzTGVuZ3RoIC0gMSkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbWFudWFsbHkgc2V0IHRoZSBzdWNjZWVkaW5nIGNoaXAgYXMgYWN0aXZlIGlmIHRoZXJlIGlzIGEgY2hpcCBuZXh0IHRvIHRoZSBjdXJyZW50IGNoaXAuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlwc0xpc3RbZm9jdXNJbmRleF0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkY2hpcHNMaXN0LmdldChmb2N1c0luZGV4KS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBwdWxsZWRJdGVtcyA9IF8ucHVsbEF0KHRoaXMuY2hpcHNMaXN0LCBpbmRleGVzKTtcblxuICAgICAgICBwdWxsZWRJdGVtcy5mb3JFYWNoKGRhdGFzZXRJdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IF8uZmlsdGVyKHRoaXMuX21vZGVsQnlWYWx1ZSwgdmFsID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShfLmlzT2JqZWN0KHZhbCkgPyBfLmlzRXF1YWwodmFsLCBkYXRhc2V0SXRlbS52YWx1ZSkgOiBfLnRvU3RyaW5nKHZhbCkgPT09IF8udG9TdHJpbmcoZGF0YXNldEl0ZW0udmFsdWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLl9tb2RlbEJ5VmFsdWUsICRldmVudCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywgeyRldmVudCwgbmV3VmFsOiB0aGlzLmRhdGF2YWx1ZSwgb2xkVmFsOiBwcmV2RGF0YXZhbHVlfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVNYXhTaXplKCk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZW1vdmUnLCB7JGV2ZW50LCAkaXRlbTogaXRlbXMubGVuZ3RoID09PSAxID8gaXRlbXNbMF0gOiBpdGVtc30pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN3YXBzIGl0ZW1zIGluIGFuIGFycmF5IGlmIHByb3ZpZGVkIHdpdGggaW5kZXhlcy5cbiAgICAgKiBAcGFyYW0gZGF0YSA6LSBhcnJheSB0byBiZSBzd2FwcGVkXG4gICAgICogQHBhcmFtIG5ld0luZGV4IDotIG5ldyBpbmRleCBmb3IgdGhlIGVsZW1lbnQgdG8gYmUgcGxhY2VkXG4gICAgICogQHBhcmFtIGN1cnJlbnRJbmRleCA6LSB0aGUgY3VycmVudCBpbmRleCBvZiB0aGUgZWxlbWVudC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN3YXBFbGVtZW50c0luQXJyYXkoZGF0YTogQXJyYXk8YW55PiwgbmV3SW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZHJhZ2dlZEl0ZW0gPSBfLnB1bGxBdChkYXRhLCBjdXJyZW50SW5kZXgpWzBdO1xuICAgICAgICBkYXRhLnNwbGljZShuZXdJbmRleCwgMCwgZHJhZ2dlZEl0ZW0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbHMgdGhlIHJlb3JkZXIgYnkgcmVzZXRpbmcgdGhlIGVsZW1lbnRzIHRvIHRoZSBvcmlnaW5hbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc2V0UmVvcmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdvbGRJbmRleCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CZWZvcmVzZXJ2aWNlY2FsbChpbnB1dERhdGEpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzZXJ2aWNlY2FsbCcsIHtpbnB1dERhdGF9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3JlbW92ZScgfHwgZXZlbnROYW1lID09PSAnYmVmb3JlcmVtb3ZlJyB8fCBldmVudE5hbWUgPT09ICdjaGlwc2VsZWN0J1xuICAgICAgICAgICAgfHwgZXZlbnROYW1lID09PSAnY2hpcGNsaWNrJyB8fCBldmVudE5hbWUgPT09ICdhZGQnIHx8IGV2ZW50TmFtZSA9PT0gJ3Jlb3JkZXInIHx8IGV2ZW50TmFtZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjaywgbG9jYWxzKTtcbiAgICB9XG5cbiAgICAvLyBDb25maWd1cmVzIHRoZSByZW9yZGFibGUgZmVhdHVyZSBpbiBjaGlwcyB3aWRnZXRzLlxuICAgIHByaXZhdGUgY29uZmlndXJlRG5EKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgaXRlbXM6ICc+IGxpOm5vdCguYXBwLWNoaXAtc2VhcmNoKScsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2NoaXAtcGxhY2Vob2xkZXInXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uZmlndXJlRG5EKHRoaXMuJGVsZW1lbnQsIG9wdGlvbnMsIHRoaXMub25SZW9yZGVyU3RhcnQuYmluZCh0aGlzKSwgdGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcmVkIG9uIGRyYWcgc3RhcnQgd2hpbGUgcmVvcmRlcmluZy5cbiAgICBwcml2YXRlIG9uUmVvcmRlclN0YXJ0KGV2dDogRXZlbnQsIHVpOiBPYmplY3QpIHtcbiAgICAgICAgY29uc3QgaGVscGVyID0gKHVpIGFzIGFueSkuaGVscGVyO1xuICAgICAgICAvLyBpbmNyZWFzaW5nIHRoZSB3aWR0aCBvZiB0aGUgZHJhZ2dlZCBpdGVtIGJ5IDFcbiAgICAgICAgaGVscGVyLndpZHRoKGhlbHBlci53aWR0aCgpICsgMSk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZGF0YSgnb2xkSW5kZXgnLCAodWkgYXMgYW55KS5pdGVtLmluZGV4KCkgLSAodGhpcy5pbnB1dHBvc2l0aW9uID09PSAnZmlyc3QnID8gMSA6IDApKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGVzIHRoZSBjaGlwc0xpc3QgYW5kIGRhdGF2YWx1ZSBvbiByZW9yZGVyLlxuICAgIHByaXZhdGUgdXBkYXRlKCRldmVudDogRXZlbnQsIHVpOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGNoYW5nZWRJdGVtLFxuICAgICAgICAgICAgbmV3SW5kZXgsXG4gICAgICAgICAgICBvbGRJbmRleDtcblxuICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHRoZSBpdGVtIGF0IHBvc2l0aW9uIGJlZm9yZSBkcmFnIGFuZCBhZnRlciB0aGUgcmVvcmRlci5cbiAgICAgICAgbmV3SW5kZXggPSAodWkgYXMgYW55KS5pdGVtLmluZGV4KCkgLSAodGhpcy5pbnB1dHBvc2l0aW9uID09PSAnZmlyc3QnID8gMSA6IDApO1xuICAgICAgICBvbGRJbmRleCA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnb2xkSW5kZXgnKTtcblxuICAgICAgICBuZXdJbmRleCA9IHRoaXMuY2hpcHNMaXN0Lmxlbmd0aCA9PT0gbmV3SW5kZXggPyBuZXdJbmRleCAtIDEgOiBuZXdJbmRleDtcbiAgICAgICAgY2hhbmdlZEl0ZW0gPSB7XG4gICAgICAgICAgICBvbGRJbmRleDogb2xkSW5kZXgsXG4gICAgICAgICAgICBuZXdJbmRleDogbmV3SW5kZXgsXG4gICAgICAgICAgICBpdGVtOiB0aGlzLmNoaXBzTGlzdFtvbGRJbmRleF1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobmV3SW5kZXggPT09IG9sZEluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UmVvcmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZWRJdGVtLml0ZW0gPSB0aGlzLmNoaXBzTGlzdFtvbGRJbmRleF07XG5cbiAgICAgICAgY29uc3QgYWxsb3dSZW9yZGVyID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyZW9yZGVyJywgeyRldmVudCwgJGRhdGE6IHRoaXMuY2hpcHNMaXN0LCAkY2hhbmdlZEl0ZW06IGNoYW5nZWRJdGVtfSk7XG5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChhbGxvd1Jlb3JkZXIpICYmIHRvQm9vbGVhbihhbGxvd1Jlb3JkZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFJlb3JkZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vZGlmeSB0aGUgY2hpcHNMaXN0IGFuZCBkYXRhdmFsdWUgYWZ0ZXIgdGhlIHJlb3JkZXIuXG4gICAgICAgIHRoaXMuc3dhcEVsZW1lbnRzSW5BcnJheSh0aGlzLmNoaXBzTGlzdCwgbmV3SW5kZXgsIG9sZEluZGV4KTtcbiAgICAgICAgdGhpcy5zd2FwRWxlbWVudHNJbkFycmF5KHRoaXMuX21vZGVsQnlWYWx1ZSwgbmV3SW5kZXgsIG9sZEluZGV4KTtcblxuICAgICAgICBjaGFuZ2VkSXRlbS5pdGVtID0gdGhpcy5jaGlwc0xpc3RbbmV3SW5kZXhdO1xuXG4gICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gWy4uLnRoaXMuY2hpcHNMaXN0XTtcblxuICAgICAgICB0aGlzLnJlc2V0UmVvcmRlcigpO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jlb3JkZXInLCB7JGV2ZW50LCAkZGF0YTogdGhpcy5jaGlwc0xpc3QsICRjaGFuZ2VkSXRlbTogY2hhbmdlZEl0ZW19KTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YW9wdGlvbnMnKSB7XG4gICAgICAgICAgICAodGhpcy5zZWFyY2hDb21wb25lbnQgYXMgYW55KS5kYXRhb3B0aW9ucyA9IG52O1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdkYXRhZmllbGQnKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhZmllbGQgPSB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnZGlzcGxheWZpZWxkJykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5kaXNwbGF5ZmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2Rpc3BsYXlleHByZXNzaW9uJykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRpc3BsYXlsYWJlbCA9IHRoaXMuYmluZGRpc3BsYXlleHByZXNzaW9uID8gdGhpcy5iaW5kZGlzcGxheWV4cHJlc3Npb24gOiB0aGlzLmRpc3BsYXlleHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdkaXNwbGF5aW1hZ2VzcmMnKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjID8gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjIDogdGhpcy5kaXNwbGF5aW1hZ2VzcmM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2xpbWl0Jykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubGltaXQgPSB0aGlzLmxpbWl0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdlbmFibGVyZW9yZGVyJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3VpLXNvcnRhYmxlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnNvcnRhYmxlKCdvcHRpb24nLCAnZGlzYWJsZWQnLCAhbnYgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZURuRCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdyZWFkb25seScpIHtcbiAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2lucHV0cG9zaXRpb24nKSB7XG4gICAgICAgICAgICBjb25zdCAkaW5wdXRFbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuYXBwLWNoaXAtc2VhcmNoJyk7XG4gICAgICAgICAgICBpZiAobnYgPT09ICdmaXJzdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoJGlucHV0RWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFwcGVuZCgkaW5wdXRFbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2F1dG9mb2N1cycgJiYgbnYpIHtcbiAgICAgICAgICAgIC8vIHNldHRpbmcgdGhlIGF1dG9mb2N1cyBvbiB0aGUgaW5wdXQgb25jZSBhZnRlciBkb20gaXMgdXBkYXRlZFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgJGNoaXBzTGlzdCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmFwcC1jaGlwLWlucHV0ID4gaW5wdXQuYXBwLXRleHRib3gnKTtcbiAgICAgICAgICAgICAgICBpZiAoJGNoaXBzTGlzdCAmJiAkY2hpcHNMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxufVxuIl19