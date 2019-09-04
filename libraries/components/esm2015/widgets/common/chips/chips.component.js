import { Attribute, Component, Injector, ViewChild } from '@angular/core';
import { $appDigest, $unwatch, $watch, debounce, isAppleProduct, isDefined, toBoolean } from '@wm/core';
import { registerProps } from './chips.props';
import { styler } from '../../framework/styler';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { configureDnD, getUniqObjsByDataField } from '../../../utils/form-utils';
import { ALLFIELDS } from '../../../utils/data-utils';
import { getConditionalClasses, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-chips',
    hostClass: 'app-chips nav nav-pills list-inline'
};
export class ChipsComponent extends DatasetAwareFormComponent {
    constructor(inj, bindDisplayField, bindDisplayExpr, bindDisplayImgSrc, bindDataField, bindDataSet, bindChipclass) {
        super(inj, WIDGET_CONFIG);
        this.bindDisplayField = bindDisplayField;
        this.bindDisplayExpr = bindDisplayExpr;
        this.bindDisplayImgSrc = bindDisplayImgSrc;
        this.bindDataField = bindDataField;
        this.bindDataSet = bindDataSet;
        this.bindChipclass = bindChipclass;
        this.chipsList = [];
        this.maxSizeReached = 'Max size reached';
        this._unsubscribeDv = false;
        styler(this.nativeElement, this);
        // set the showsearchicon as false by default.
        if (!isDefined(this.showsearchicon)) {
            this.showsearchicon = false;
        }
        this.multiple = true;
        this.nextItemIndex = 0; // default chip index
        this._debounceUpdateQueryModel = debounce((val) => {
            this.updateQueryModel(val).then(() => {
                if (this.bindChipclass) {
                    _.forEach(this.chipsList, (item, index) => {
                        this.registerChipItemClass(item, index);
                    });
                }
            });
        }, 150);
        const datasetSubscription = this.dataset$.subscribe(() => {
            this.searchComponent.dataset = this.dataset;
            this.nextItemIndex = this.datasetItems.length;
            this._debounceUpdateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
        const datavalueSubscription = this.datavalue$.subscribe((val) => {
            // update queryModel only when parentRef is available.
            if (!this._unsubscribeDv) {
                this.chipsList = [];
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                this._debounceUpdateQueryModel(val);
            }
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
    }
    // getter setter is added to pass the datasource to searchcomponent.
    get datasource() {
        return this._datasource;
    }
    set datasource(nv) {
        this._datasource = nv;
        this.searchComponent.datasource = nv;
        this._debounceUpdateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
    }
    ngOnInit() {
        super.ngOnInit();
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
        this.getTransformedData = (val, isCustom) => {
            return this.searchComponent.getTransformedData([val], this.nextItemIndex++, isCustom);
        };
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.enablereorder) {
            this.configureDnD();
        }
    }
    /**
     * This method returns the evaluated class expression.
     * @param $index index of the chip
     * @param item chip object containing the key, value, label
     * @returns {any} evaluated class expression value
     */
    registerChipItemClass(item, $index) {
        if (this.bindChipclass) {
            const watchName = `${this.widgetId}_chipItemClass_${$index}`;
            $unwatch(watchName);
            this.registerDestroyListener($watch(this.bindChipclass, this.viewParent, { item, $index }, (nv, ov) => {
                this.applyItemClass(getConditionalClasses(nv, ov), $index);
            }, watchName));
        }
    }
    applyItemClass(val, index) {
        const chipItem = this.nativeElement.querySelectorAll('.chip-item').item(index);
        $(chipItem).removeClass(val.toRemove).addClass(val.toAdd);
    }
    removeDuplicates() {
        this.chipsList = getUniqObjsByDataField(this.chipsList, this.datafield, this.displayfield || this.displaylabel);
    }
    // This method updates the queryModel.
    // default call to get the default data can be done only when defaultQuery is true.
    updateQueryModel(data) {
        const promises = [];
        if (!data) {
            this.chipsList = [];
            return Promise.resolve();
        }
        // clone the data as the updations on data will change the datavalue.
        let dataValue = _.clone(data);
        const prevChipsList = this.chipsList;
        this.chipsList = [];
        // update the model when model has items more than maxsize
        if (this.maxsize && dataValue.length > this.maxsize) {
            this._modelByValue = dataValue = _.slice(dataValue, 0, this.maxsize);
            data = dataValue;
        }
        const searchQuery = [];
        /**
         * For each value in datavalue,
         * 1. check whether value is in datasetItems, if item is found, addd to the chipsList.
         * 2. else make a default query to the filter and get the record.
         * 3. In step 2, if datavalue is not ALLFIELDS, then make a query. Extract the chipsList from the query response.
         * 4. If there is no response for the value and allowonlyselect is true, remove the value from the datavalue. So that datavalue just contains the valid values.
         * 5. In step 2, if datavalue is ALLFIELDS and value is object, then just prepare the datasetItem from the value.
         * 6. If value is not object and allowonlyselect is false, then create a customModel and replace this value with customModel and prepare datasetItem from this value
         */
        dataValue.forEach((val, i) => {
            const itemFound = _.find(this.datasetItems, item => {
                return _.isObject(item.value) ? _.isEqual(item.value, val) : _.toString(item.value) === _.toString(val);
            });
            if (itemFound) {
                this.chipsList.push(itemFound);
            }
            else if (this.datafield !== ALLFIELDS) {
                searchQuery.push(val);
            }
            else if (this.datafield === ALLFIELDS) {
                let dataObj, isCustom = false;
                if (!_.isObject(val)) {
                    dataObj = this.createCustomDataModel(val);
                    isCustom = true;
                    if (dataObj) {
                        data.splice(i, 1, dataObj);
                    }
                }
                else {
                    // if custom chips is already generated, val will be object as {'dataField_val': 'entered_val'}
                    // Hence check this val in previous chipList and assign the iscustom flag
                    const prevChipObj = prevChipsList.find(obj => {
                        return _.isEqual(obj.value, val);
                    });
                    if (prevChipObj) {
                        isCustom = prevChipObj.iscustom;
                    }
                }
                dataObj = dataObj || val;
                const transformedData = this.getTransformedData(dataObj, isCustom);
                const chipObj = transformedData[0];
                if (isCustom) {
                    chipObj.iscustom = isCustom;
                }
                this.chipsList.push(chipObj);
            }
        });
        // make default query with all the values and if response for the value is not in datavalue then add a custom chip object.
        if (searchQuery.length) {
            promises.push(this.getDefaultModel(searchQuery, this.nextItemIndex)
                .then(response => {
                this.chipsList = this.chipsList.concat(response || []);
                dataValue.forEach((val, i) => {
                    const isExists = _.find(this.chipsList, (obj) => {
                        return obj.value.toString() === val.toString();
                    });
                    if (!isExists) {
                        if (this.allowonlyselect) {
                            const index = data.indexOf(val);
                            if (index > -1) {
                                data.splice(index, 1);
                            }
                            return;
                        }
                        const transformedData = this.getTransformedData(val, true);
                        const chipObj = transformedData[0];
                        chipObj.iscustom = true;
                        this.chipsList.push(chipObj);
                    }
                });
            }));
        }
        // default chip data is adding focus on to the search input. Hence this flag helps not to focus.
        this.resetSearchModel(true);
        return Promise.all(promises).then(() => {
            this._modelByValue = data;
            this.removeDuplicates();
            this.updateMaxSize();
            $appDigest();
        });
    }
    resetSearchModel(defaultQuery) {
        this._unsubscribeDv = true;
        // clear search will empty the query model and gets the data when minchars is 0 (i.e. autocomplete) on focus
        // defaultQuery flag is set when widget is not active. This will only load the autocomplete dropup with minchars as 0 when widget is focused/active
        this.searchComponent.clearSearch(undefined, !this.minchars && !defaultQuery);
        this._unsubscribeDv = false;
    }
    // Triggerred when typeahead option is selected by enter keypress.
    onSelect($event) {
        if (!this.searchComponent.liElements.length) {
            this.addItem($event);
        }
    }
    // Add the newItem to the list
    addItem($event, widget) {
        const searchComponent = widget;
        let allowAdd;
        let chipObj;
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
            let dataObj;
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
            const data = dataObj || _.trim(this.searchComponent.query);
            if (data) {
                const transformedData = this.getTransformedData(data, true);
                chipObj = transformedData[0];
                chipObj.iscustom = true;
            }
        }
        if (!isDefined(chipObj) || chipObj === '') {
            return;
        }
        allowAdd = this.invokeEventCallback('beforeadd', { $event, newItem: chipObj });
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
            this._modelByValue = [...this._modelByValue, chipObj.value];
        }
        this._unsubscribeDv = true;
        this.invokeOnTouched();
        this.invokeOnChange(this._modelByValue, $event || {}, true);
        this.invokeEventCallback('add', { $event, $item: chipObj });
        this.updateMaxSize();
        // reset input box when item is added.
        this.resetSearchModel();
        // stop the event to not to call the submit event on enter press.
        if ($event && ($event.key === 'Enter' || $event.keyCode === 13)) {
            this.stopEvent($event);
        }
    }
    // Prepare datavalue object from a string(junk) value when datafield is allFields.
    createCustomDataModel(val) {
        const key = this.displayfield || (this.datafield !== ALLFIELDS ? this.datafield : undefined);
        if (key) {
            const customObj = {};
            customObj[key] = val;
            return customObj;
        }
    }
    // Check if newItem already exists
    isDuplicate(item) {
        if (this.datafield === ALLFIELDS) {
            return _.findIndex(this.chipsList, { value: item.value }) > -1;
        }
        return _.findIndex(this.chipsList, { key: item.key }) > -1;
    }
    // Check if max size is reached
    updateMaxSize() {
        this.saturate = this.maxsize > 0 && this.chipsList.length === this.maxsize;
    }
    // Makes call to searchComponent to filter the dataSource based on the query.
    getDefaultModel(query, index) {
        this.nextItemIndex++;
        return this.searchComponent.getDataSource(query, true, index)
            .then((response) => {
            return _.filter(query, queryVal => {
                _.find(response, { value: queryVal });
            });
        });
    }
    handleChipClick($event, chip) {
        if (this.readonly) {
            return;
        }
        $event.currentTarget.focus();
        this.invokeEventCallback('chipclick', { $event, $item: chip });
    }
    handleChipFocus($event, chip) {
        if (this.readonly) {
            return;
        }
        chip.active = true;
        this.invokeEventCallback('chipselect', { $event, $item: chip });
    }
    // To avoid form submit on pressing enter key
    stopEvent($event) {
        $event.stopPropagation();
        $event.preventDefault();
    }
    onTextDelete($event) {
        if (isAppleProduct) {
            this.onInputClear($event);
        }
    }
    onInputClear($event) {
        if (!this.chipsList || !this.chipsList.length || this.searchComponent.query) {
            return;
        }
        this.$element.find('li.chip-item > a.app-chip:last').focus();
        this.stopEvent($event);
    }
    onBackspace($event, $item, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index, true);
    }
    onDelete($event, $item, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index);
    }
    onArrowLeft($item, $index) {
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
    }
    onArrowRight($item, $index) {
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
    }
    // focus search box.
    focusSearchBox() {
        this.$element.find('.app-chip-input > input.app-textbox').focus();
    }
    // Remove the item from list
    removeItem($event, item, index, canFocus) {
        $event.stopPropagation();
        const indexes = _.isArray(index) ? index : [index];
        const focusIndex = _.max(indexes);
        const items = _.reduce(indexes, (result, i) => {
            result.push(this.chipsList[i]);
            return result;
        }, []);
        // prevent deletion if the before-remove event callback returns false
        const allowRemove = this.invokeEventCallback('beforeremove', { $event, $item: items.length === 1 ? items[0] : items });
        if (isDefined(allowRemove) && !toBoolean(allowRemove)) {
            return;
        }
        const prevDatavalue = _.clone(this.datavalue);
        // focus next chip after deletion.
        // if there are no chips in the list focus search box
        setTimeout(() => {
            const chipsLength = this.chipsList.length;
            const $chipsList = this.$element.find('li.chip-item > a.app-chip');
            if (!chipsLength || !canFocus) {
                this.focusSearchBox();
            }
            else if ((chipsLength - 1) < focusIndex) {
                // if focus index is greater than chips length select last chip
                $chipsList.get(chipsLength - 1).focus();
            }
            else {
                // manually set the succeeding chip as active if there is a chip next to the current chip.
                this.chipsList[focusIndex].active = true;
                $chipsList.get(focusIndex).focus();
            }
        });
        const pulledItems = _.pullAt(this.chipsList, indexes);
        pulledItems.forEach(datasetItem => {
            this._modelByValue = _.filter(this._modelByValue, val => {
                return !(_.isObject(val) ? _.isEqual(val, datasetItem.value) : _.toString(val) === _.toString(datasetItem.value));
            });
        });
        this._unsubscribeDv = false;
        this.invokeOnChange(this._modelByValue, $event, true);
        this.invokeEventCallback('change', { $event, newVal: this.datavalue, oldVal: prevDatavalue });
        this.updateMaxSize();
        this.invokeEventCallback('remove', { $event, $item: items.length === 1 ? items[0] : items });
    }
    /**
     * Swaps items in an array if provided with indexes.
     * @param data :- array to be swapped
     * @param newIndex :- new index for the element to be placed
     * @param currentIndex :- the current index of the element.
     */
    swapElementsInArray(data, newIndex, currentIndex) {
        const draggedItem = _.pullAt(data, currentIndex)[0];
        data.splice(newIndex, 0, draggedItem);
    }
    /**
     * Cancels the reorder by reseting the elements to the original position.
     */
    resetReorder() {
        this.$element.removeData('oldIndex');
    }
    onBeforeservicecall(inputData) {
        this.invokeEventCallback('beforeservicecall', { inputData });
    }
    handleEvent(node, eventName, eventCallback, locals) {
        if (eventName === 'remove' || eventName === 'beforeremove' || eventName === 'chipselect'
            || eventName === 'chipclick' || eventName === 'add' || eventName === 'reorder' || eventName === 'change') {
            return;
        }
        super.handleEvent(node, eventName, eventCallback, locals);
    }
    // Configures the reordable feature in chips widgets.
    configureDnD() {
        const options = {
            items: '> li:not(.app-chip-search)',
            placeholder: 'chip-placeholder'
        };
        configureDnD(this.$element, options, this.onReorderStart.bind(this), this.update.bind(this));
    }
    // Triggered on drag start while reordering.
    onReorderStart(evt, ui) {
        const helper = ui.helper;
        // increasing the width of the dragged item by 1
        helper.width(helper.width() + 1);
        this.$element.data('oldIndex', ui.item.index() - (this.inputposition === 'first' ? 1 : 0));
    }
    // updates the chipsList and datavalue on reorder.
    update($event, ui) {
        let changedItem, newIndex, oldIndex;
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
        const allowReorder = this.invokeEventCallback('beforereorder', { $event, $data: this.chipsList, $changedItem: changedItem });
        if (isDefined(allowReorder) && toBoolean(allowReorder) === false) {
            this.resetReorder();
            return;
        }
        // modify the chipsList and datavalue after the reorder.
        this.swapElementsInArray(this.chipsList, newIndex, oldIndex);
        this.swapElementsInArray(this._modelByValue, newIndex, oldIndex);
        changedItem.item = this.chipsList[newIndex];
        this.chipsList = [...this.chipsList];
        this.resetReorder();
        this.invokeEventCallback('reorder', { $event, $data: this.chipsList, $changedItem: changedItem });
    }
    onPropertyChange(key, nv, ov) {
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
            const $inputEl = this.$element.find('li.app-chip-search');
            if (nv === 'first') {
                this.$element.prepend($inputEl);
            }
            else {
                this.$element.append($inputEl);
            }
        }
        if (key === 'autofocus' && nv) {
            // setting the autofocus on the input once after dom is updated
            setTimeout(() => {
                const $chipsList = this.$element.find('.app-chip-input > input.app-textbox');
                if ($chipsList && $chipsList.length) {
                    this.focusSearchBox();
                }
            });
        }
        super.onPropertyChange(key, nv, ov);
    }
}
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
ChipsComponent.ctorParameters = () => [
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['displayfield.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['displayexpression.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['displayimagesrc.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['datafield.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['chipclass.bind',] }] }
];
ChipsComponent.propDecorators = {
    searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcHMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGlwcy9jaGlwcy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFakcsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV4RyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDakYsT0FBTyxFQUFFLFlBQVksRUFBZSxzQkFBc0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzlGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV0RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUlqSCxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFVBQVU7SUFDdEIsU0FBUyxFQUFFLHFDQUFxQztDQUNuRCxDQUFDO0FBVUYsTUFBTSxPQUFPLGNBQWUsU0FBUSx5QkFBeUI7SUFxQ3pELFlBQ0ksR0FBYSxFQUMyQixnQkFBZ0IsRUFDWCxlQUFlLEVBQ2pCLGlCQUFpQixFQUN2QixhQUFhLEVBQ2YsV0FBVyxFQUNULGFBQWE7UUFFbEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztR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O2dCQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuQztpQkFBTTtnQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNsQztTQUNKO1FBQ0QsSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEVBQUUsRUFBRTtZQUMzQiwrREFBK0Q7WUFDL0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO29CQUNqQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7aUJBQ3pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUNELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7O0FBcnBCTSw4QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVQ1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLDh2RUFBcUM7Z0JBQ3JDLFNBQVMsRUFBRTtvQkFDUCx3QkFBd0IsQ0FBQyxjQUFjLENBQUM7b0JBQ3hDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQztpQkFDckM7YUFDSjs7OztZQTNCNkMsUUFBUTs0Q0FtRTdDLFNBQVMsU0FBQyxtQkFBbUI7NENBQzdCLFNBQVMsU0FBQyx3QkFBd0I7NENBQ2xDLFNBQVMsU0FBQyxzQkFBc0I7NENBQ2hDLFNBQVMsU0FBQyxnQkFBZ0I7NENBQzFCLFNBQVMsU0FBQyxjQUFjOzRDQUN4QixTQUFTLFNBQUMsZ0JBQWdCOzs7OEJBNUI5QixTQUFTLFNBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHVud2F0Y2gsICR3YXRjaCwgZGVib3VuY2UsIGlzQXBwbGVQcm9kdWN0LCBpc0RlZmluZWQsIHRvQm9vbGVhbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2hpcHMucHJvcHMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTZWFyY2hDb21wb25lbnQgfSBmcm9tICcuLi9zZWFyY2gvc2VhcmNoLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IGNvbmZpZ3VyZURuRCwgRGF0YVNldEl0ZW0sIGdldFVuaXFPYmpzQnlEYXRhRmllbGQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcbmltcG9ydCB7IEFMTEZJRUxEUyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25hbENsYXNzZXMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNoaXBzJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtY2hpcHMgbmF2IG5hdi1waWxscyBsaXN0LWlubGluZSdcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ2hpcHNdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2hpcHMuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IoQ2hpcHNDb21wb25lbnQpLFxuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ2hpcHNDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDaGlwc0NvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgcHVibGljIGFsbG93b25seXNlbGVjdDogYm9vbGVhbjtcbiAgICBwdWJsaWMgZW5hYmxlcmVvcmRlcjogYm9vbGVhbjtcbiAgICBwdWJsaWMgbWF4c2l6ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBpbnB1dHdpZHRoOiBhbnk7XG4gICAgcHJpdmF0ZSBkZWJvdW5jZXRpbWU6IG51bWJlcjtcblxuICAgIHB1YmxpYyBjaGlwc0xpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1heFNpemVSZWFjaGVkID0gJ01heCBzaXplIHJlYWNoZWQnO1xuICAgIHByaXZhdGUgc2F0dXJhdGU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBuZXh0SXRlbUluZGV4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBnZXRUcmFuc2Zvcm1lZERhdGE6IChkYXRhLCBpdGVtSW5kZXg/KSA9PiBEYXRhU2V0SXRlbVtdO1xuICAgIHByaXZhdGUgaW5wdXRwb3NpdGlvbjogc3RyaW5nO1xuICAgIHByaXZhdGUgc2hvd3NlYXJjaGljb246IGJvb2xlYW47XG5cbiAgICBAVmlld0NoaWxkKFNlYXJjaENvbXBvbmVudCkgc2VhcmNoQ29tcG9uZW50OiBTZWFyY2hDb21wb25lbnQ7XG4gICAgcHJpdmF0ZSBfZGF0YXNvdXJjZTogYW55O1xuICAgIHByaXZhdGUgX3Vuc3Vic2NyaWJlRHYgPSBmYWxzZTtcbiAgICBwcml2YXRlIHNlYXJjaGtleTogc3RyaW5nO1xuICAgIHByaXZhdGUgX2RlYm91bmNlVXBkYXRlUXVlcnlNb2RlbDogYW55O1xuICAgIHByaXZhdGUgbGltaXQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9jbGFzc0V4cHI6IGFueTtcbiAgICBwcml2YXRlIG1pbmNoYXJzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBtYXRjaG1vZGU6IHN0cmluZztcblxuICAgIC8vIGdldHRlciBzZXR0ZXIgaXMgYWRkZWQgdG8gcGFzcyB0aGUgZGF0YXNvdXJjZSB0byBzZWFyY2hjb21wb25lbnQuXG4gICAgZ2V0IGRhdGFzb3VyY2UgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YXNvdXJjZTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YXNvdXJjZShudikge1xuICAgICAgICB0aGlzLl9kYXRhc291cmNlID0gbnY7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFzb3VyY2UgPSBudjtcbiAgICAgICAgdGhpcy5fZGVib3VuY2VVcGRhdGVRdWVyeU1vZGVsKHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Rpc3BsYXlmaWVsZC5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUZpZWxkLFxuICAgICAgICBAQXR0cmlidXRlKCdkaXNwbGF5ZXhwcmVzc2lvbi5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUV4cHIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Rpc3BsYXlpbWFnZXNyYy5iaW5kJykgcHJpdmF0ZSBiaW5kRGlzcGxheUltZ1NyYyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YWZpZWxkLmJpbmQnKSBwcml2YXRlIGJpbmREYXRhRmllbGQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2RhdGFzZXQuYmluZCcpIHByaXZhdGUgYmluZERhdGFTZXQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2NoaXBjbGFzcy5iaW5kJykgcHJpdmF0ZSBiaW5kQ2hpcGNsYXNzXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgc2hvd3NlYXJjaGljb24gYXMgZmFsc2UgYnkgZGVmYXVsdC5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodGhpcy5zaG93c2VhcmNoaWNvbikpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd3NlYXJjaGljb24gPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubXVsdGlwbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLm5leHRJdGVtSW5kZXggPSAwOyAvLyBkZWZhdWx0IGNoaXAgaW5kZXhcblxuICAgICAgICB0aGlzLl9kZWJvdW5jZVVwZGF0ZVF1ZXJ5TW9kZWwgPSBkZWJvdW5jZSgodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVF1ZXJ5TW9kZWwodmFsKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5iaW5kQ2hpcGNsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaCh0aGlzLmNoaXBzTGlzdCwgKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyQ2hpcEl0ZW1DbGFzcyhpdGVtLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAxNTApO1xuXG4gICAgICAgIGNvbnN0IGRhdGFzZXRTdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICAgICAgdGhpcy5uZXh0SXRlbUluZGV4ID0gdGhpcy5kYXRhc2V0SXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VVcGRhdGVRdWVyeU1vZGVsKHRoaXMuZGF0YXZhbHVlIHx8IHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IGRhdGFzZXRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cbiAgICAgICAgY29uc3QgZGF0YXZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhdmFsdWUkLnN1YnNjcmliZSgodmFsOiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgcXVlcnlNb2RlbCBvbmx5IHdoZW4gcGFyZW50UmVmIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgICAgIGlmICghdGhpcy5fdW5zdWJzY3JpYmVEdikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGFmaWVsZCBpcyBBTExGSUxFRFMgZG8gbm90IGZldGNoIHRoZSByZWNvcmRzXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBxdWVyeSBtb2RlbCB3aXRoIHRoZSB2YWx1ZXMgd2UgaGF2ZVxuICAgICAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlVXBkYXRlUXVlcnlNb2RlbCh2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBkYXRhdmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG5cbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubXVsdGlwbGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kRGlzcGxheUltZ1NyYztcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWltYWdlc3JjID0gdGhpcy5kaXNwbGF5aW1hZ2VzcmM7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmJpbmRkaXNwbGF5bGFiZWwgPSB0aGlzLmJpbmREaXNwbGF5RXhwcjtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5kaXNwbGF5ZmllbGQ7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFmaWVsZCA9IHRoaXMuYmluZERhdGFGaWVsZCB8fCB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRhdGFzZXQgPSB0aGlzLmJpbmREYXRhU2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5zZWFyY2hrZXkgPSB0aGlzLnNlYXJjaGtleTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubGltaXQgPSB0aGlzLmxpbWl0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kZWJvdW5jZXRpbWUgPSB0aGlzLmRlYm91bmNldGltZTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubWF0Y2htb2RlID0gdGhpcy5tYXRjaG1vZGU7XG5cbiAgICAgICAgdGhpcy5nZXRUcmFuc2Zvcm1lZERhdGEgPSAodmFsLCBpc0N1c3RvbSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoQ29tcG9uZW50LmdldFRyYW5zZm9ybWVkRGF0YShbdmFsXSwgdGhpcy5uZXh0SXRlbUluZGV4KyssIGlzQ3VzdG9tKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5lbmFibGVyZW9yZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZURuRCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZXZhbHVhdGVkIGNsYXNzIGV4cHJlc3Npb24uXG4gICAgICogQHBhcmFtICRpbmRleCBpbmRleCBvZiB0aGUgY2hpcFxuICAgICAqIEBwYXJhbSBpdGVtIGNoaXAgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSwgdmFsdWUsIGxhYmVsXG4gICAgICogQHJldHVybnMge2FueX0gZXZhbHVhdGVkIGNsYXNzIGV4cHJlc3Npb24gdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZ2lzdGVyQ2hpcEl0ZW1DbGFzcyhpdGVtLCAkaW5kZXgpIHtcbiAgICAgICAgaWYgKHRoaXMuYmluZENoaXBjbGFzcykge1xuICAgICAgICAgICAgY29uc3Qgd2F0Y2hOYW1lID0gYCR7dGhpcy53aWRnZXRJZH1fY2hpcEl0ZW1DbGFzc18keyRpbmRleH1gO1xuICAgICAgICAgICAgJHVud2F0Y2god2F0Y2hOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoJHdhdGNoKHRoaXMuYmluZENoaXBjbGFzcywgdGhpcy52aWV3UGFyZW50LCB7aXRlbSwgJGluZGV4fSwgKG52LCBvdikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlJdGVtQ2xhc3MoZ2V0Q29uZGl0aW9uYWxDbGFzc2VzKG52LCBvdiksICRpbmRleCk7XG4gICAgICAgICAgICB9LCB3YXRjaE5hbWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXBwbHlJdGVtQ2xhc3ModmFsLCBpbmRleCkge1xuICAgICAgICBjb25zdCBjaGlwSXRlbSA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hpcC1pdGVtJykuaXRlbShpbmRleCk7XG4gICAgICAgICQoY2hpcEl0ZW0pLnJlbW92ZUNsYXNzKHZhbC50b1JlbW92ZSkuYWRkQ2xhc3ModmFsLnRvQWRkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbW92ZUR1cGxpY2F0ZXMoKSB7XG4gICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gZ2V0VW5pcU9ianNCeURhdGFGaWVsZCh0aGlzLmNoaXBzTGlzdCwgdGhpcy5kYXRhZmllbGQsIHRoaXMuZGlzcGxheWZpZWxkIHx8IHRoaXMuZGlzcGxheWxhYmVsKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCB1cGRhdGVzIHRoZSBxdWVyeU1vZGVsLlxuICAgIC8vIGRlZmF1bHQgY2FsbCB0byBnZXQgdGhlIGRlZmF1bHQgZGF0YSBjYW4gYmUgZG9uZSBvbmx5IHdoZW4gZGVmYXVsdFF1ZXJ5IGlzIHRydWUuXG4gICAgcHJpdmF0ZSB1cGRhdGVRdWVyeU1vZGVsKGRhdGE6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gW107XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbG9uZSB0aGUgZGF0YSBhcyB0aGUgdXBkYXRpb25zIG9uIGRhdGEgd2lsbCBjaGFuZ2UgdGhlIGRhdGF2YWx1ZS5cbiAgICAgICAgbGV0IGRhdGFWYWx1ZSA9IF8uY2xvbmUoZGF0YSk7XG4gICAgICAgIGNvbnN0IHByZXZDaGlwc0xpc3QgPSB0aGlzLmNoaXBzTGlzdDtcbiAgICAgICAgdGhpcy5jaGlwc0xpc3QgPSBbXTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIG1vZGVsIHdoZW4gbW9kZWwgaGFzIGl0ZW1zIG1vcmUgdGhhbiBtYXhzaXplXG4gICAgICAgIGlmICh0aGlzLm1heHNpemUgJiYgZGF0YVZhbHVlLmxlbmd0aCA+IHRoaXMubWF4c2l6ZSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gZGF0YVZhbHVlID0gXy5zbGljZShkYXRhVmFsdWUsIDAsIHRoaXMubWF4c2l6ZSk7XG4gICAgICAgICAgICBkYXRhID0gZGF0YVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VhcmNoUXVlcnk6IEFycmF5PHN0cmluZz4gPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yIGVhY2ggdmFsdWUgaW4gZGF0YXZhbHVlLFxuICAgICAgICAgKiAxLiBjaGVjayB3aGV0aGVyIHZhbHVlIGlzIGluIGRhdGFzZXRJdGVtcywgaWYgaXRlbSBpcyBmb3VuZCwgYWRkZCB0byB0aGUgY2hpcHNMaXN0LlxuICAgICAgICAgKiAyLiBlbHNlIG1ha2UgYSBkZWZhdWx0IHF1ZXJ5IHRvIHRoZSBmaWx0ZXIgYW5kIGdldCB0aGUgcmVjb3JkLlxuICAgICAgICAgKiAzLiBJbiBzdGVwIDIsIGlmIGRhdGF2YWx1ZSBpcyBub3QgQUxMRklFTERTLCB0aGVuIG1ha2UgYSBxdWVyeS4gRXh0cmFjdCB0aGUgY2hpcHNMaXN0IGZyb20gdGhlIHF1ZXJ5IHJlc3BvbnNlLlxuICAgICAgICAgKiA0LiBJZiB0aGVyZSBpcyBubyByZXNwb25zZSBmb3IgdGhlIHZhbHVlIGFuZCBhbGxvd29ubHlzZWxlY3QgaXMgdHJ1ZSwgcmVtb3ZlIHRoZSB2YWx1ZSBmcm9tIHRoZSBkYXRhdmFsdWUuIFNvIHRoYXQgZGF0YXZhbHVlIGp1c3QgY29udGFpbnMgdGhlIHZhbGlkIHZhbHVlcy5cbiAgICAgICAgICogNS4gSW4gc3RlcCAyLCBpZiBkYXRhdmFsdWUgaXMgQUxMRklFTERTIGFuZCB2YWx1ZSBpcyBvYmplY3QsIHRoZW4ganVzdCBwcmVwYXJlIHRoZSBkYXRhc2V0SXRlbSBmcm9tIHRoZSB2YWx1ZS5cbiAgICAgICAgICogNi4gSWYgdmFsdWUgaXMgbm90IG9iamVjdCBhbmQgYWxsb3dvbmx5c2VsZWN0IGlzIGZhbHNlLCB0aGVuIGNyZWF0ZSBhIGN1c3RvbU1vZGVsIGFuZCByZXBsYWNlIHRoaXMgdmFsdWUgd2l0aCBjdXN0b21Nb2RlbCBhbmQgcHJlcGFyZSBkYXRhc2V0SXRlbSBmcm9tIHRoaXMgdmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIGRhdGFWYWx1ZS5mb3JFYWNoKCh2YWw6IGFueSwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtRm91bmQgPSBfLmZpbmQodGhpcy5kYXRhc2V0SXRlbXMsIGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmlzT2JqZWN0KGl0ZW0udmFsdWUpID8gXy5pc0VxdWFsKGl0ZW0udmFsdWUsIHZhbCkgOiBfLnRvU3RyaW5nKGl0ZW0udmFsdWUpID09PSBfLnRvU3RyaW5nKHZhbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGl0ZW1Gb3VuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goaXRlbUZvdW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhZmllbGQgIT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIHNlYXJjaFF1ZXJ5LnB1c2godmFsKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRhZmllbGQgPT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIGxldCBkYXRhT2JqLCBpc0N1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICghXy5pc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSB0aGlzLmNyZWF0ZUN1c3RvbURhdGFNb2RlbCh2YWwpO1xuICAgICAgICAgICAgICAgICAgICBpc0N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnNwbGljZShpLCAxLCBkYXRhT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIGN1c3RvbSBjaGlwcyBpcyBhbHJlYWR5IGdlbmVyYXRlZCwgdmFsIHdpbGwgYmUgb2JqZWN0IGFzIHsnZGF0YUZpZWxkX3ZhbCc6ICdlbnRlcmVkX3ZhbCd9XG4gICAgICAgICAgICAgICAgICAgIC8vIEhlbmNlIGNoZWNrIHRoaXMgdmFsIGluIHByZXZpb3VzIGNoaXBMaXN0IGFuZCBhc3NpZ24gdGhlIGlzY3VzdG9tIGZsYWdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldkNoaXBPYmogPSBwcmV2Q2hpcHNMaXN0LmZpbmQob2JqID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmlzRXF1YWwob2JqLnZhbHVlLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZDaGlwT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0N1c3RvbSA9IHByZXZDaGlwT2JqLmlzY3VzdG9tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhT2JqIHx8IHZhbDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGRhdGFPYmosIGlzQ3VzdG9tKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlwT2JqID0gdHJhbnNmb3JtZWREYXRhWzBdO1xuICAgICAgICAgICAgICAgIGlmIChpc0N1c3RvbSkge1xuICAgICAgICAgICAgICAgICAgICAoY2hpcE9iaiBhcyBhbnkpLmlzY3VzdG9tID0gaXNDdXN0b207XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goY2hpcE9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIG1ha2UgZGVmYXVsdCBxdWVyeSB3aXRoIGFsbCB0aGUgdmFsdWVzIGFuZCBpZiByZXNwb25zZSBmb3IgdGhlIHZhbHVlIGlzIG5vdCBpbiBkYXRhdmFsdWUgdGhlbiBhZGQgYSBjdXN0b20gY2hpcCBvYmplY3QuXG4gICAgICAgIGlmIChzZWFyY2hRdWVyeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHByb21pc2VzLnB1c2godGhpcy5nZXREZWZhdWx0TW9kZWwoc2VhcmNoUXVlcnksIHRoaXMubmV4dEl0ZW1JbmRleClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gdGhpcy5jaGlwc0xpc3QuY29uY2F0KHJlc3BvbnNlIHx8IFtdKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVZhbHVlLmZvckVhY2goKHZhbDogYW55LCBpOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzRXhpc3RzID0gXy5maW5kKHRoaXMuY2hpcHNMaXN0LCAob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai52YWx1ZS50b1N0cmluZygpID09PSB2YWwudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxsb3dvbmx5c2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZGF0YS5pbmRleE9mKHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZERhdGEgPSB0aGlzLmdldFRyYW5zZm9ybWVkRGF0YSh2YWwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaXBPYmogPSB0cmFuc2Zvcm1lZERhdGFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNoaXBPYmogYXMgYW55KS5pc2N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGlwc0xpc3QucHVzaChjaGlwT2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCBjaGlwIGRhdGEgaXMgYWRkaW5nIGZvY3VzIG9uIHRvIHRoZSBzZWFyY2ggaW5wdXQuIEhlbmNlIHRoaXMgZmxhZyBoZWxwcyBub3QgdG8gZm9jdXMuXG4gICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCh0cnVlKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gZGF0YTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRHVwbGljYXRlcygpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVNYXhTaXplKCk7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVzZXRTZWFyY2hNb2RlbChkZWZhdWx0UXVlcnk/OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSB0cnVlO1xuICAgICAgICAvLyBjbGVhciBzZWFyY2ggd2lsbCBlbXB0eSB0aGUgcXVlcnkgbW9kZWwgYW5kIGdldHMgdGhlIGRhdGEgd2hlbiBtaW5jaGFycyBpcyAwIChpLmUuIGF1dG9jb21wbGV0ZSkgb24gZm9jdXNcbiAgICAgICAgLy8gZGVmYXVsdFF1ZXJ5IGZsYWcgaXMgc2V0IHdoZW4gd2lkZ2V0IGlzIG5vdCBhY3RpdmUuIFRoaXMgd2lsbCBvbmx5IGxvYWQgdGhlIGF1dG9jb21wbGV0ZSBkcm9wdXAgd2l0aCBtaW5jaGFycyBhcyAwIHdoZW4gd2lkZ2V0IGlzIGZvY3VzZWQvYWN0aXZlXG4gICAgICAgICh0aGlzLnNlYXJjaENvbXBvbmVudCBhcyBhbnkpLmNsZWFyU2VhcmNoKHVuZGVmaW5lZCwgIXRoaXMubWluY2hhcnMgJiYgIWRlZmF1bHRRdWVyeSk7XG4gICAgICAgIHRoaXMuX3Vuc3Vic2NyaWJlRHYgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycmVkIHdoZW4gdHlwZWFoZWFkIG9wdGlvbiBpcyBzZWxlY3RlZCBieSBlbnRlciBrZXlwcmVzcy5cbiAgICBwdWJsaWMgb25TZWxlY3QoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoQ29tcG9uZW50LmxpRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0oJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgbmV3SXRlbSB0byB0aGUgbGlzdFxuICAgIHByaXZhdGUgYWRkSXRlbSgkZXZlbnQ6IEV2ZW50LCB3aWRnZXQ/OiBTZWFyY2hDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoQ29tcG9uZW50ID0gd2lkZ2V0O1xuICAgICAgICBsZXQgYWxsb3dBZGQ7XG4gICAgICAgIGxldCBjaGlwT2JqO1xuXG4gICAgICAgIGlmIChzZWFyY2hDb21wb25lbnQgJiYgaXNEZWZpbmVkKHNlYXJjaENvbXBvbmVudC5kYXRhdmFsdWUpICYmIHNlYXJjaENvbXBvbmVudC5xdWVyeU1vZGVsICE9PSAnJykge1xuICAgICAgICAgICAgaWYgKCFzZWFyY2hDb21wb25lbnQucXVlcnkgfHwgIV8udHJpbShzZWFyY2hDb21wb25lbnQucXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpcE9iaiA9IHNlYXJjaENvbXBvbmVudC5xdWVyeU1vZGVsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWxsb3dvbmx5c2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGRhdGFPYmo7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhZmllbGQgPT09IEFMTEZJRUxEUykge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc09iamVjdCh0aGlzLnNlYXJjaENvbXBvbmVudC5xdWVyeSkgJiYgXy50cmltKHRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhT2JqID0gdGhpcy5jcmVhdGVDdXN0b21EYXRhTW9kZWwodGhpcy5zZWFyY2hDb21wb25lbnQucXVlcnkpO1xuICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gaWYgdGhlIGN1c3RvbSBjaGlwIGlzIGVtcHR5XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YU9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFNlYXJjaE1vZGVsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBkYXRhT2JqIHx8IF8udHJpbSh0aGlzLnNlYXJjaENvbXBvbmVudC5xdWVyeSk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGRhdGEsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNoaXBPYmogPSB0cmFuc2Zvcm1lZERhdGFbMF07XG4gICAgICAgICAgICAgICAgY2hpcE9iai5pc2N1c3RvbSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzRGVmaW5lZChjaGlwT2JqKSB8fCBjaGlwT2JqID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYWxsb3dBZGQgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWFkZCcsIHskZXZlbnQsIG5ld0l0ZW06IGNoaXBPYmp9KTtcblxuICAgICAgICBpZiAoaXNEZWZpbmVkKGFsbG93QWRkKSAmJiAhdG9Cb29sZWFuKGFsbG93QWRkKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNEdXBsaWNhdGUoY2hpcE9iaikpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVnaXN0ZXJDaGlwSXRlbUNsYXNzKGNoaXBPYmosIHRoaXMuY2hpcHNMaXN0Lmxlbmd0aCk7XG4gICAgICAgIHRoaXMuY2hpcHNMaXN0LnB1c2goY2hpcE9iaik7XG5cbiAgICAgICAgaWYgKCF0aGlzLmRhdGF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gW2NoaXBPYmoudmFsdWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gWy4uLnRoaXMuX21vZGVsQnlWYWx1ZSwgY2hpcE9iai52YWx1ZV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnZva2VPblRvdWNoZWQoKTtcbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLl9tb2RlbEJ5VmFsdWUsICRldmVudCB8fCB7fSwgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdhZGQnLCB7JGV2ZW50LCAkaXRlbTogY2hpcE9ian0pO1xuXG4gICAgICAgIHRoaXMudXBkYXRlTWF4U2l6ZSgpO1xuXG4gICAgICAgIC8vIHJlc2V0IGlucHV0IGJveCB3aGVuIGl0ZW0gaXMgYWRkZWQuXG4gICAgICAgIHRoaXMucmVzZXRTZWFyY2hNb2RlbCgpO1xuXG4gICAgICAgIC8vIHN0b3AgdGhlIGV2ZW50IHRvIG5vdCB0byBjYWxsIHRoZSBzdWJtaXQgZXZlbnQgb24gZW50ZXIgcHJlc3MuXG4gICAgICAgIGlmICgkZXZlbnQgJiYgKCgkZXZlbnQgYXMgYW55KS5rZXkgPT09ICdFbnRlcicgfHwgKCRldmVudCBhcyBhbnkpLmtleUNvZGUgPT09IDEzKSkge1xuICAgICAgICAgICAgdGhpcy5zdG9wRXZlbnQoJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByZXBhcmUgZGF0YXZhbHVlIG9iamVjdCBmcm9tIGEgc3RyaW5nKGp1bmspIHZhbHVlIHdoZW4gZGF0YWZpZWxkIGlzIGFsbEZpZWxkcy5cbiAgICBwcml2YXRlIGNyZWF0ZUN1c3RvbURhdGFNb2RlbCh2YWw6IHN0cmluZykge1xuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmRpc3BsYXlmaWVsZCB8fCAodGhpcy5kYXRhZmllbGQgIT09IEFMTEZJRUxEUyA/IHRoaXMuZGF0YWZpZWxkIDogdW5kZWZpbmVkKTtcblxuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21PYmogPSB7fTtcbiAgICAgICAgICAgIGN1c3RvbU9ialtrZXldID0gdmFsO1xuICAgICAgICAgICAgcmV0dXJuIGN1c3RvbU9iajtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIG5ld0l0ZW0gYWxyZWFkeSBleGlzdHNcbiAgICBwcml2YXRlIGlzRHVwbGljYXRlKGl0ZW06IERhdGFTZXRJdGVtKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFmaWVsZCA9PT0gQUxMRklFTERTKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5maW5kSW5kZXgodGhpcy5jaGlwc0xpc3QsIHt2YWx1ZTogaXRlbS52YWx1ZX0pID4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF8uZmluZEluZGV4KHRoaXMuY2hpcHNMaXN0LCB7a2V5OiBpdGVtLmtleX0pID4gLTE7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgbWF4IHNpemUgaXMgcmVhY2hlZFxuICAgIHByaXZhdGUgdXBkYXRlTWF4U2l6ZSgpIHtcbiAgICAgICAgdGhpcy5zYXR1cmF0ZSA9IHRoaXMubWF4c2l6ZSA+IDAgJiYgdGhpcy5jaGlwc0xpc3QubGVuZ3RoID09PSB0aGlzLm1heHNpemU7XG4gICAgfVxuXG4gICAgLy8gTWFrZXMgY2FsbCB0byBzZWFyY2hDb21wb25lbnQgdG8gZmlsdGVyIHRoZSBkYXRhU291cmNlIGJhc2VkIG9uIHRoZSBxdWVyeS5cbiAgICBwcm90ZWN0ZWQgZ2V0RGVmYXVsdE1vZGVsKHF1ZXJ5OiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nLCBpbmRleD86IG51bWJlcikge1xuICAgICAgICB0aGlzLm5leHRJdGVtSW5kZXgrKztcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoQ29tcG9uZW50LmdldERhdGFTb3VyY2UocXVlcnksIHRydWUsIGluZGV4KVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZmlsdGVyKHF1ZXJ5LCBxdWVyeVZhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIF8uZmluZChyZXNwb25zZSwge3ZhbHVlOiBxdWVyeVZhbH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVDaGlwQ2xpY2soJGV2ZW50OiBFdmVudCwgY2hpcDogRGF0YVNldEl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoJGV2ZW50LmN1cnJlbnRUYXJnZXQgYXMgYW55KS5mb2N1cygpO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoaXBjbGljaycsIHskZXZlbnQsICRpdGVtOiBjaGlwfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVDaGlwRm9jdXMoJGV2ZW50OiBFdmVudCwgY2hpcDogRGF0YVNldEl0ZW0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoY2hpcCBhcyBhbnkpLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hpcHNlbGVjdCcsIHskZXZlbnQsICRpdGVtOiBjaGlwfSk7XG4gICAgfVxuXG4gICAgLy8gVG8gYXZvaWQgZm9ybSBzdWJtaXQgb24gcHJlc3NpbmcgZW50ZXIga2V5XG4gICAgcHJpdmF0ZSBzdG9wRXZlbnQoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblRleHREZWxldGUoJGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZiAoaXNBcHBsZVByb2R1Y3QpIHtcbiAgICAgICAgICAgIHRoaXMub25JbnB1dENsZWFyKCRldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25JbnB1dENsZWFyKCRldmVudDogRXZlbnQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNoaXBzTGlzdCB8fCAhdGhpcy5jaGlwc0xpc3QubGVuZ3RoIHx8IHRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwOmxhc3QnKS5mb2N1cygpO1xuICAgICAgICB0aGlzLnN0b3BFdmVudCgkZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CYWNrc3BhY2UoJGV2ZW50OiBFdmVudCwgJGl0ZW06IERhdGFTZXRJdGVtLCAkaW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlSXRlbSgkZXZlbnQsICRpdGVtLCAkaW5kZXgsIHRydWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25EZWxldGUoJGV2ZW50OiBFdmVudCwgJGl0ZW06IERhdGFTZXRJdGVtLCAkaW5kZXg6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlSXRlbSgkZXZlbnQsICRpdGVtLCAkaW5kZXgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkFycm93TGVmdCgkaXRlbT86IERhdGFTZXRJdGVtLCAkaW5kZXg/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9uIGxlZnQgYXJyb3cgY2xpY2sgd2hlbiBzZWFyY2ggaW5wdXQgcXVlcnkgaXMgZW1wdHkuXG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hDb21wb25lbnQucXVlcnkgJiYgIWlzRGVmaW5lZCgkaW5kZXgpICYmICFpc0RlZmluZWQoJGl0ZW0pKSB7XG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmNoaXAtaXRlbSA+IGEuYXBwLWNoaXA6bGFzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGluZGV4ID4gMCkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwJykuZ2V0KCRpbmRleCAtIDEpLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25BcnJvd1JpZ2h0KCRpdGVtPzogRGF0YVNldEl0ZW0sICRpbmRleD86IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uIHJpZ2h0IGFycm93IGNsaWNrIHdoZW4gc2VhcmNoIGlucHV0IHF1ZXJ5IGlzIGVtcHR5LlxuICAgICAgICBpZiAoIXRoaXMuc2VhcmNoQ29tcG9uZW50LnF1ZXJ5ICYmICFpc0RlZmluZWQoJGluZGV4KSAmJiAhaXNEZWZpbmVkKCRpdGVtKSkge1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCdsaS5jaGlwLWl0ZW0gPiBhLmFwcC1jaGlwOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkaW5kZXggPCAodGhpcy5jaGlwc0xpc3QubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuY2hpcC1pdGVtID4gYS5hcHAtY2hpcCcpLmdldCgkaW5kZXggKyAxKS5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb2N1c1NlYXJjaEJveCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZm9jdXMgc2VhcmNoIGJveC5cbiAgICBwcml2YXRlIGZvY3VzU2VhcmNoQm94KCkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5hcHAtY2hpcC1pbnB1dCA+IGlucHV0LmFwcC10ZXh0Ym94JykuZm9jdXMoKTtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIGl0ZW0gZnJvbSBsaXN0XG4gICAgcHJpdmF0ZSByZW1vdmVJdGVtKCRldmVudDogRXZlbnQsIGl0ZW06IERhdGFTZXRJdGVtLCBpbmRleDogbnVtYmVyLCBjYW5Gb2N1cz86IGJvb2xlYW4pIHtcbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBfLmlzQXJyYXkoaW5kZXgpID8gaW5kZXggOiBbaW5kZXhdO1xuICAgICAgICBjb25zdCBmb2N1c0luZGV4ID0gXy5tYXgoaW5kZXhlcyk7XG5cbiAgICAgICAgY29uc3QgaXRlbXMgPSBfLnJlZHVjZShpbmRleGVzLCAocmVzdWx0LCBpKSA9PiB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmNoaXBzTGlzdFtpXSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgLy8gcHJldmVudCBkZWxldGlvbiBpZiB0aGUgYmVmb3JlLXJlbW92ZSBldmVudCBjYWxsYmFjayByZXR1cm5zIGZhbHNlXG4gICAgICAgIGNvbnN0IGFsbG93UmVtb3ZlID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyZW1vdmUnLCB7JGV2ZW50LCAkaXRlbTogaXRlbXMubGVuZ3RoID09PSAxID8gaXRlbXNbMF0gOiBpdGVtc30pO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKGFsbG93UmVtb3ZlKSAmJiAhdG9Cb29sZWFuKGFsbG93UmVtb3ZlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJldkRhdGF2YWx1ZSA9IF8uY2xvbmUodGhpcy5kYXRhdmFsdWUpO1xuXG4gICAgICAgIC8vIGZvY3VzIG5leHQgY2hpcCBhZnRlciBkZWxldGlvbi5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG5vIGNoaXBzIGluIHRoZSBsaXN0IGZvY3VzIHNlYXJjaCBib3hcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlwc0xlbmd0aCA9IHRoaXMuY2hpcHNMaXN0Lmxlbmd0aDtcbiAgICAgICAgICAgIGNvbnN0ICRjaGlwc0xpc3QgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpLmNoaXAtaXRlbSA+IGEuYXBwLWNoaXAnKTtcblxuICAgICAgICAgICAgaWYgKCFjaGlwc0xlbmd0aCB8fCAhY2FuRm9jdXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChjaGlwc0xlbmd0aCAtIDEpIDwgZm9jdXNJbmRleCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIGZvY3VzIGluZGV4IGlzIGdyZWF0ZXIgdGhhbiBjaGlwcyBsZW5ndGggc2VsZWN0IGxhc3QgY2hpcFxuICAgICAgICAgICAgICAgICRjaGlwc0xpc3QuZ2V0KGNoaXBzTGVuZ3RoIC0gMSkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbWFudWFsbHkgc2V0IHRoZSBzdWNjZWVkaW5nIGNoaXAgYXMgYWN0aXZlIGlmIHRoZXJlIGlzIGEgY2hpcCBuZXh0IHRvIHRoZSBjdXJyZW50IGNoaXAuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlwc0xpc3RbZm9jdXNJbmRleF0uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkY2hpcHNMaXN0LmdldChmb2N1c0luZGV4KS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBwdWxsZWRJdGVtcyA9IF8ucHVsbEF0KHRoaXMuY2hpcHNMaXN0LCBpbmRleGVzKTtcblxuICAgICAgICBwdWxsZWRJdGVtcy5mb3JFYWNoKGRhdGFzZXRJdGVtID0+IHtcbiAgICAgICAgICAgIHRoaXMuX21vZGVsQnlWYWx1ZSA9IF8uZmlsdGVyKHRoaXMuX21vZGVsQnlWYWx1ZSwgdmFsID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIShfLmlzT2JqZWN0KHZhbCkgPyBfLmlzRXF1YWwodmFsLCBkYXRhc2V0SXRlbS52YWx1ZSkgOiBfLnRvU3RyaW5nKHZhbCkgPT09IF8udG9TdHJpbmcoZGF0YXNldEl0ZW0udmFsdWUpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl91bnN1YnNjcmliZUR2ID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5pbnZva2VPbkNoYW5nZSh0aGlzLl9tb2RlbEJ5VmFsdWUsICRldmVudCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywgeyRldmVudCwgbmV3VmFsOiB0aGlzLmRhdGF2YWx1ZSwgb2xkVmFsOiBwcmV2RGF0YXZhbHVlfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVNYXhTaXplKCk7XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZW1vdmUnLCB7JGV2ZW50LCAkaXRlbTogaXRlbXMubGVuZ3RoID09PSAxID8gaXRlbXNbMF0gOiBpdGVtc30pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN3YXBzIGl0ZW1zIGluIGFuIGFycmF5IGlmIHByb3ZpZGVkIHdpdGggaW5kZXhlcy5cbiAgICAgKiBAcGFyYW0gZGF0YSA6LSBhcnJheSB0byBiZSBzd2FwcGVkXG4gICAgICogQHBhcmFtIG5ld0luZGV4IDotIG5ldyBpbmRleCBmb3IgdGhlIGVsZW1lbnQgdG8gYmUgcGxhY2VkXG4gICAgICogQHBhcmFtIGN1cnJlbnRJbmRleCA6LSB0aGUgY3VycmVudCBpbmRleCBvZiB0aGUgZWxlbWVudC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN3YXBFbGVtZW50c0luQXJyYXkoZGF0YTogQXJyYXk8YW55PiwgbmV3SW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZHJhZ2dlZEl0ZW0gPSBfLnB1bGxBdChkYXRhLCBjdXJyZW50SW5kZXgpWzBdO1xuICAgICAgICBkYXRhLnNwbGljZShuZXdJbmRleCwgMCwgZHJhZ2dlZEl0ZW0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbHMgdGhlIHJlb3JkZXIgYnkgcmVzZXRpbmcgdGhlIGVsZW1lbnRzIHRvIHRoZSBvcmlnaW5hbCBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlc2V0UmVvcmRlcigpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdvbGRJbmRleCcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CZWZvcmVzZXJ2aWNlY2FsbChpbnB1dERhdGEpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzZXJ2aWNlY2FsbCcsIHtpbnB1dERhdGF9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3JlbW92ZScgfHwgZXZlbnROYW1lID09PSAnYmVmb3JlcmVtb3ZlJyB8fCBldmVudE5hbWUgPT09ICdjaGlwc2VsZWN0J1xuICAgICAgICAgICAgfHwgZXZlbnROYW1lID09PSAnY2hpcGNsaWNrJyB8fCBldmVudE5hbWUgPT09ICdhZGQnIHx8IGV2ZW50TmFtZSA9PT0gJ3Jlb3JkZXInIHx8IGV2ZW50TmFtZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KG5vZGUsIGV2ZW50TmFtZSwgZXZlbnRDYWxsYmFjaywgbG9jYWxzKTtcbiAgICB9XG5cbiAgICAvLyBDb25maWd1cmVzIHRoZSByZW9yZGFibGUgZmVhdHVyZSBpbiBjaGlwcyB3aWRnZXRzLlxuICAgIHByaXZhdGUgY29uZmlndXJlRG5EKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgaXRlbXM6ICc+IGxpOm5vdCguYXBwLWNoaXAtc2VhcmNoKScsXG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2NoaXAtcGxhY2Vob2xkZXInXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uZmlndXJlRG5EKHRoaXMuJGVsZW1lbnQsIG9wdGlvbnMsIHRoaXMub25SZW9yZGVyU3RhcnQuYmluZCh0aGlzKSwgdGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcmVkIG9uIGRyYWcgc3RhcnQgd2hpbGUgcmVvcmRlcmluZy5cbiAgICBwcml2YXRlIG9uUmVvcmRlclN0YXJ0KGV2dDogRXZlbnQsIHVpOiBPYmplY3QpIHtcbiAgICAgICAgY29uc3QgaGVscGVyID0gKHVpIGFzIGFueSkuaGVscGVyO1xuICAgICAgICAvLyBpbmNyZWFzaW5nIHRoZSB3aWR0aCBvZiB0aGUgZHJhZ2dlZCBpdGVtIGJ5IDFcbiAgICAgICAgaGVscGVyLndpZHRoKGhlbHBlci53aWR0aCgpICsgMSk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZGF0YSgnb2xkSW5kZXgnLCAodWkgYXMgYW55KS5pdGVtLmluZGV4KCkgLSAodGhpcy5pbnB1dHBvc2l0aW9uID09PSAnZmlyc3QnID8gMSA6IDApKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGVzIHRoZSBjaGlwc0xpc3QgYW5kIGRhdGF2YWx1ZSBvbiByZW9yZGVyLlxuICAgIHByaXZhdGUgdXBkYXRlKCRldmVudDogRXZlbnQsIHVpOiBPYmplY3QpIHtcbiAgICAgICAgbGV0IGNoYW5nZWRJdGVtLFxuICAgICAgICAgICAgbmV3SW5kZXgsXG4gICAgICAgICAgICBvbGRJbmRleDtcblxuICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHRoZSBpdGVtIGF0IHBvc2l0aW9uIGJlZm9yZSBkcmFnIGFuZCBhZnRlciB0aGUgcmVvcmRlci5cbiAgICAgICAgbmV3SW5kZXggPSAodWkgYXMgYW55KS5pdGVtLmluZGV4KCkgLSAodGhpcy5pbnB1dHBvc2l0aW9uID09PSAnZmlyc3QnID8gMSA6IDApO1xuICAgICAgICBvbGRJbmRleCA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnb2xkSW5kZXgnKTtcblxuICAgICAgICBuZXdJbmRleCA9IHRoaXMuY2hpcHNMaXN0Lmxlbmd0aCA9PT0gbmV3SW5kZXggPyBuZXdJbmRleCAtIDEgOiBuZXdJbmRleDtcbiAgICAgICAgY2hhbmdlZEl0ZW0gPSB7XG4gICAgICAgICAgICBvbGRJbmRleDogb2xkSW5kZXgsXG4gICAgICAgICAgICBuZXdJbmRleDogbmV3SW5kZXgsXG4gICAgICAgICAgICBpdGVtOiB0aGlzLmNoaXBzTGlzdFtvbGRJbmRleF1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobmV3SW5kZXggPT09IG9sZEluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UmVvcmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNoYW5nZWRJdGVtLml0ZW0gPSB0aGlzLmNoaXBzTGlzdFtvbGRJbmRleF07XG5cbiAgICAgICAgY29uc3QgYWxsb3dSZW9yZGVyID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyZW9yZGVyJywgeyRldmVudCwgJGRhdGE6IHRoaXMuY2hpcHNMaXN0LCAkY2hhbmdlZEl0ZW06IGNoYW5nZWRJdGVtfSk7XG5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChhbGxvd1Jlb3JkZXIpICYmIHRvQm9vbGVhbihhbGxvd1Jlb3JkZXIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFJlb3JkZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1vZGlmeSB0aGUgY2hpcHNMaXN0IGFuZCBkYXRhdmFsdWUgYWZ0ZXIgdGhlIHJlb3JkZXIuXG4gICAgICAgIHRoaXMuc3dhcEVsZW1lbnRzSW5BcnJheSh0aGlzLmNoaXBzTGlzdCwgbmV3SW5kZXgsIG9sZEluZGV4KTtcbiAgICAgICAgdGhpcy5zd2FwRWxlbWVudHNJbkFycmF5KHRoaXMuX21vZGVsQnlWYWx1ZSwgbmV3SW5kZXgsIG9sZEluZGV4KTtcblxuICAgICAgICBjaGFuZ2VkSXRlbS5pdGVtID0gdGhpcy5jaGlwc0xpc3RbbmV3SW5kZXhdO1xuXG4gICAgICAgIHRoaXMuY2hpcHNMaXN0ID0gWy4uLnRoaXMuY2hpcHNMaXN0XTtcblxuICAgICAgICB0aGlzLnJlc2V0UmVvcmRlcigpO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jlb3JkZXInLCB7JGV2ZW50LCAkZGF0YTogdGhpcy5jaGlwc0xpc3QsICRjaGFuZ2VkSXRlbTogY2hhbmdlZEl0ZW19KTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YW9wdGlvbnMnKSB7XG4gICAgICAgICAgICAodGhpcy5zZWFyY2hDb21wb25lbnQgYXMgYW55KS5kYXRhb3B0aW9ucyA9IG52O1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdkYXRhZmllbGQnKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhZmllbGQgPSB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ID09PSAnZGlzcGxheWZpZWxkJykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5kaXNwbGF5ZmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2Rpc3BsYXlleHByZXNzaW9uJykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRpc3BsYXlsYWJlbCA9IHRoaXMuYmluZGRpc3BsYXlleHByZXNzaW9uID8gdGhpcy5iaW5kZGlzcGxheWV4cHJlc3Npb24gOiB0aGlzLmRpc3BsYXlleHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdkaXNwbGF5aW1hZ2VzcmMnKSB7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjID8gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjIDogdGhpcy5kaXNwbGF5aW1hZ2VzcmM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2xpbWl0Jykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubGltaXQgPSB0aGlzLmxpbWl0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdlbmFibGVyZW9yZGVyJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3VpLXNvcnRhYmxlJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnNvcnRhYmxlKCdvcHRpb24nLCAnZGlzYWJsZWQnLCAhbnYgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZURuRCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkgPT09ICdyZWFkb25seScpIHtcbiAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2lucHV0cG9zaXRpb24nKSB7XG4gICAgICAgICAgICBjb25zdCAkaW5wdXRFbCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuYXBwLWNoaXAtc2VhcmNoJyk7XG4gICAgICAgICAgICBpZiAobnYgPT09ICdmaXJzdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnByZXBlbmQoJGlucHV0RWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmFwcGVuZCgkaW5wdXRFbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtleSA9PT0gJ2F1dG9mb2N1cycgJiYgbnYpIHtcbiAgICAgICAgICAgIC8vIHNldHRpbmcgdGhlIGF1dG9mb2N1cyBvbiB0aGUgaW5wdXQgb25jZSBhZnRlciBkb20gaXMgdXBkYXRlZFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgJGNoaXBzTGlzdCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmFwcC1jaGlwLWlucHV0ID4gaW5wdXQuYXBwLXRleHRib3gnKTtcbiAgICAgICAgICAgICAgICBpZiAoJGNoaXBzTGlzdCAmJiAkY2hpcHNMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvY3VzU2VhcmNoQm94KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxufVxuIl19