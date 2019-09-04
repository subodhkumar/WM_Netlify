import * as tslib_1 from "tslib";
import { Attribute, ChangeDetectorRef, Component, ContentChild, ContentChildren, Injector, NgZone, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { $appDigest, App, AppDefaults, DataSource, getClonedObject, isDataSourceEqual, isDefined, isMobileApp, isNumber, isObject, noop, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './list.props';
import { NAVIGATION_TYPE, provideAsWidgetRef } from '../../../utils/widget-utils';
import { PaginationComponent } from '../pagination/pagination.component';
import { ListItemDirective } from './list-item.directive';
import { ListAnimator } from './list.animator';
import { configureDnD, getOrderedDataset, groupData, handleHeaderClick, toggleAllHeaders } from '../../../utils/form-utils';
import { ButtonComponent } from '../button/button.component';
import { DEBOUNCE_TIMES } from '../../framework/constants';
var DEFAULT_CLS = 'app-livelist app-panel';
var WIDGET_CONFIG = { widgetType: 'wm-list', hostClass: DEFAULT_CLS };
var ListComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ListComponent, _super);
    function ListComponent(inj, cdRef, datePipe, app, appDefaults, ngZone, binditemclass, binddisableitem, binddataset, binddatasource, mouseEnterCB, mouseLeaveCB) {
        var _this = this;
        var resolveFn = noop;
        var propsInitPromise = new Promise(function (res) { return resolveFn = res; });
        _this = _super.call(this, inj, WIDGET_CONFIG, propsInitPromise) || this;
        _this.propsInitPromise = propsInitPromise;
        _this.promiseResolverFn = resolveFn;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SHELL);
        _this.cdRef = cdRef;
        _this.ngZone = ngZone;
        _this.datePipe = datePipe;
        _this.binditemclass = binditemclass;
        _this.binddisableitem = binddisableitem;
        _this.binddataset = binddataset;
        _this.mouseEnterCB = mouseEnterCB;
        _this.mouseLeaveCB = mouseLeaveCB;
        _this.binddatasource = binddatasource;
        _this.app = app;
        _this.appDefaults = appDefaults;
        _this.variableInflight = false;
        _this.noDataFound = !binddataset;
        // Show loading status based on the variable life cycle
        _this.app.subscribe('toggle-variable-state', _this.handleLoading.bind(_this));
        return _this;
    }
    Object.defineProperty(ListComponent.prototype, "selecteditem", {
        get: function () {
            if (this.multiselect) {
                return getClonedObject(this._items);
            }
            if (_.isEmpty(this._items)) {
                return {};
            }
            return getClonedObject(this._items[0]);
        },
        set: function (items) {
            var _this = this;
            this._items.length = 0;
            this.deselectListItems();
            if (_.isArray(items)) {
                items.forEach(function (item) { return _this.selectItem(item); });
            }
            else {
                this.selectItem(items);
            }
            $appDigest();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns list of widgets present on list item by considering name and index of the widget.
     * If we did'nt pass index, it returns array of all the widgets which are matching to widget name
     * @param widgteName: Name of the widget
     * @param index: Index of the widget
     */
    ListComponent.prototype.getWidgets = function (widgteName, index) {
        var $target;
        var retVal = [];
        if (!widgteName) {
            return;
        }
        if (!isDefined(index)) {
            _.forEach(this.listItems.toArray(), function (el) {
                $target = _.get(el.currentItemWidgets, widgteName);
                if ($target) {
                    retVal.push($target);
                }
            });
            return retVal;
        }
        index = +index || 0;
        $target = _.get(this.listItems.toArray(), index);
        if ($target) {
            return [_.get($target.currentItemWidgets, widgteName)];
        }
    };
    // returns listitem reference by index value. This refers to the same method getListItemByIndex.
    ListComponent.prototype.getItem = function (index) {
        return this.getListItemByIndex(index);
    };
    // return index of listItem(listItemDirective). This refers to the same method getListItemIndex.
    ListComponent.prototype.getIndex = function (item) {
        return this.getListItemIndex(item);
    };
    ListComponent.prototype.handleLoading = function (data) {
        var _this = this;
        var dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.ngZone.run(function () {
                _this.variableInflight = data.active;
            });
        }
    };
    ListComponent.prototype.resetNavigation = function () {
        this.showNavigation = false;
        this.navControls = undefined;
        this.infScroll = false;
        this.onDemandLoad = false;
    };
    ListComponent.prototype.enableBasicNavigation = function () {
        this.navControls = NAVIGATION_TYPE.BASIC;
        this.showNavigation = true;
    };
    ListComponent.prototype.enableInlineNavigation = function () {
        this.navControls = NAVIGATION_TYPE.INLINE;
    };
    ListComponent.prototype.enableClassicNavigation = function () {
        this.navControls = NAVIGATION_TYPE.CLASSIC;
        this.showNavigation = true;
    };
    ListComponent.prototype.enablePagerNavigation = function () {
        this.navControls = NAVIGATION_TYPE.PAGER;
        this.showNavigation = true;
    };
    ListComponent.prototype.setNavigationTypeNone = function () {
        this.navControls = NAVIGATION_TYPE.NONE;
        this.showNavigation = false;
    };
    ListComponent.prototype.enableInfiniteScroll = function () {
        this.infScroll = true;
    };
    ListComponent.prototype.enableOnDemandLoad = function () {
        this.onDemandLoad = true;
        this.showNavigation = true;
    };
    /* this function sets the itemclass depending on itemsperrow.
     * if itemsperrow is 2 for large device, then itemclass is 'col-xs-1 col-sm-1 col-lg-2'
     * if itemsperrow is 'lg-3' then itemclass is 'col-lg-3'
     */
    ListComponent.prototype.setListClass = function () {
        var temp = '';
        if (this.itemsperrow) {
            if (isNaN(parseInt(this.itemsperrow, 10))) {
                // handling itemsperrow containing string of classes
                _.split(this.itemsperrow, ' ').forEach(function (cls) {
                    var keys = _.split(cls, '-');
                    cls = keys[0] + "-" + (12 / parseInt(keys[1], 10));
                    temp += " col-" + cls;
                });
                this.itemsPerRowClass = temp.trim();
            }
            else {
                // handling itemsperrow having integer value.
                this.itemsPerRowClass = "col-xs-" + (12 / parseInt(this.itemsperrow, 10));
            }
        }
        else { // If itemsperrow is not specified make it full width
            this.itemsPerRowClass = 'col-xs-12';
        }
    };
    /**
     * Sets Navigation type for the list.
     * @param type
     */
    ListComponent.prototype.onNavigationTypeChange = function (type) {
        this.resetNavigation();
        switch (type) {
            case NAVIGATION_TYPE.BASIC:
                this.enableBasicNavigation();
                break;
            case NAVIGATION_TYPE.INLINE:
                this.enableInlineNavigation();
                break;
            case NAVIGATION_TYPE.ADVANCED:
            case NAVIGATION_TYPE.CLASSIC:
                this.enableClassicNavigation();
                break;
            case NAVIGATION_TYPE.PAGER:
                this.enablePagerNavigation();
                break;
            case NAVIGATION_TYPE.NONE:
                this.setNavigationTypeNone();
                break;
            case NAVIGATION_TYPE.SCROLL:
                this.enableInfiniteScroll();
                break;
            case NAVIGATION_TYPE.ONDEMAND:
                this.enableOnDemandLoad();
                break;
        }
    };
    ListComponent.prototype.fetchNextDatasetOnScroll = function () {
        this.dataNavigator.navigatePage('next');
    };
    ListComponent.prototype.setIscrollHandlers = function (el) {
        var _this = this;
        var lastScrollTop = 0;
        var wrapper = _.get(el.iscroll, 'wrapper');
        var self = el.iscroll;
        el.iscroll.on('scrollEnd', function () {
            var clientHeight = wrapper.clientHeight, totalHeight = wrapper.scrollHeight, scrollTop = Math.abs(el.iscroll.y);
            if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                _this.debouncedFetchNextDatasetOnScroll();
                if (self.indicatorRefresh) {
                    self.indicatorRefresh();
                }
            }
            lastScrollTop = scrollTop;
        });
    };
    // Applying iscroll event to invoke the next calls for infinte scroll.
    ListComponent.prototype.bindIScrollEvt = function () {
        var _this = this;
        var $scrollParent = this.$element.closest('[wmsmoothscroll="true"]');
        var iScroll = _.get($scrollParent[0], 'iscroll');
        // when iscroll is not initialised the notify the smoothscroll and subscribe to the iscroll update
        if (!iScroll) {
            var iScrollSubscription_1 = this.app.subscribe('iscroll-update', function (_el) {
                if (!_.isEmpty(_el) && _el.isSameNode($scrollParent[0])) {
                    _this.setIscrollHandlers($scrollParent[0]);
                    iScrollSubscription_1();
                }
            });
            this.app.notify('no-iscroll', $scrollParent[0]);
            return;
        }
        this.setIscrollHandlers($scrollParent[0]);
    };
    ListComponent.prototype.bindScrollEvt = function () {
        var _this = this;
        var $el = this.$element;
        var $ul = $el.find('> ul');
        var $firstChild = $ul.children().first();
        var self = this;
        var $scrollParent;
        var scrollNode;
        var lastScrollTop = 0;
        if (!$firstChild.length) {
            return;
        }
        $scrollParent = $firstChild.scrollParent(false);
        if ($scrollParent[0] === document) {
            scrollNode = document.body;
        }
        else {
            scrollNode = $scrollParent[0];
        }
        // has scroll
        if (scrollNode.scrollHeight > scrollNode.clientHeight) {
            $scrollParent
                .each(function (index, node) {
                // scrollTop property is 0 or undefined for body in IE, safari.
                lastScrollTop = node === document ? (node.body.scrollTop || $(window).scrollTop()) : node.scrollTop;
            })
                .off('scroll.scroll_evt')
                .on('scroll.scroll_evt', function (evt) {
                var target = evt.target;
                var clientHeight;
                var totalHeight;
                var scrollTop;
                // scrollingElement is undefined for IE, safari. use body as target Element
                target = target === document ? (target.scrollingElement || document.body) : target;
                clientHeight = target.clientHeight;
                totalHeight = target.scrollHeight;
                scrollTop = target === document.body ? $(window).scrollTop() : target.scrollTop;
                if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                    $(this).off('scroll.scroll_evt');
                    self.debouncedFetchNextDatasetOnScroll();
                }
                lastScrollTop = scrollTop;
            });
            $ul.off('wheel.scroll_evt');
        }
        else {
            // if there is no scrollable element register wheel event on ul element
            $ul.on('wheel.scroll_evt', function (e) {
                if (e.originalEvent.deltaY > 0) {
                    $ul.off('wheel.scroll_evt');
                    _this.debouncedFetchNextDatasetOnScroll();
                }
            });
        }
    };
    /**
     * Update fieldDefs property, fieldDefs is the model of the List Component.
     * fieldDefs is an Array type.
     * @param newVal
     */
    ListComponent.prototype.updateFieldDefs = function (newVal) {
        if (this.infScroll || this.onDemandLoad) {
            if (!isDefined(this.fieldDefs) || this.dataNavigator.isFirstPage()) {
                this.fieldDefs = [];
            }
            this.fieldDefs = tslib_1.__spread(this.fieldDefs, newVal);
        }
        else {
            this.fieldDefs = newVal;
        }
        if (this.orderby) {
            this.fieldDefs = getOrderedDataset(this.fieldDefs, this.orderby);
        }
        if (this.groupby) {
            this.groupedData = groupData(this, this.fieldDefs, this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, undefined, this.appDefaults);
        }
        if (!this.fieldDefs.length) {
            this.noDataFound = true;
            this.selecteditem = undefined;
        }
        $appDigest();
        this.listItems.setDirty();
    };
    ListComponent.prototype.onDataChange = function (newVal) {
        // Check for newVal is not empty
        if (!_.isEmpty(newVal)) {
            this.noDataFound = false;
            this.isDataChanged = true;
            if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                // clone the the data in case of live and service variables to prevent the two-way binding for these variables.
                newVal = _.cloneDeep(newVal);
            }
            if (isObject(newVal) && !_.isArray(newVal)) {
                newVal = _.isEmpty(newVal) ? [] : [newVal];
            }
            if (_.isString(newVal)) {
                newVal = newVal.split(',');
            }
            if (_.isArray(newVal)) {
                if (newVal.length) {
                    this.invokeEventCallback('beforedatarender', { $data: newVal });
                }
                this.updateFieldDefs(newVal);
            }
        }
        else {
            this.updateFieldDefs([]);
        }
    };
    // Updates the dataSource when pagination is enabled for the Component.
    ListComponent.prototype.setupDataSource = function () {
        var _this = this;
        var dataNavigator = this.dataNavigator;
        dataNavigator.options = {
            maxResults: this.pagesize || 5
        };
        this.dataNavigatorWatched = true;
        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
        this.navigatorResultWatch = dataNavigator.resultEmitter.subscribe(function (newVal) {
            _this.onDataChange(newVal);
        }, true);
        /*De-register the watch if it is exists */
        if (this.navigatorMaxResultWatch) {
            this.navigatorMaxResultWatch.unsubscribe();
        }
        /*Register a watch on the "maxResults" property of the "dataNavigator" so that the "pageSize" is displayed in the live-list.*/
        this.navigatorMaxResultWatch = dataNavigator.maxResultsEmitter.subscribe(function (val) {
            _this.pagesize = val;
        });
        dataNavigator.maxResults = this.pagesize || 5;
        this.removePropertyBinding('dataset');
        this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource, this.dataset, this.binddatasource);
    };
    ListComponent.prototype.onDataSetChange = function (newVal) {
        if (!this.dataNavigatorWatched) {
            if (this.navigation && this.navigation !== NAVIGATION_TYPE.NONE) {
                this.setupDataSource();
            }
            else {
                this.onDataChange(newVal);
            }
        }
        else if (this.navigation && this.navigation !== NAVIGATION_TYPE.NONE) {
            // If navigation is already setup and datasource is changed, update the datasource on navigation
            this.dataNavigator.setDataSource(this.datasource);
        }
    };
    // All the ListItem's Active state is set to false.
    ListComponent.prototype.deselectListItems = function () {
        this.listItems.forEach(function (item) { return item.isActive = false; });
    };
    // Deselect all the ListItems and clear the selecteditem(InOutBound Property model)
    ListComponent.prototype.clearSelectedItems = function () {
        this.deselectListItems();
        this._items.length = 0;
        $appDigest();
    };
    /**
     * return the ListItemDirective instance by checking the equality of the model.
     * @param listModel: model to be searched for
     * @returns ListItem if the model is matched else return null.
     */
    ListComponent.prototype.getListItemByModel = function (listModel) {
        var _this = this;
        return this.listItems.find(function (listItem) {
            var itemObj = listItem.item;
            if (_this.groupby && !_.has(listModel, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded while comparing model.
                itemObj = _.clone(itemObj);
                delete itemObj._groupIndex;
            }
            if (_.isEqual(itemObj, listModel)) {
                return true;
            }
        }) || null;
    };
    ListComponent.prototype.updateSelectedItemsWidgets = function () {
        var _this = this;
        if (this.multiselect) {
            this.selectedItemWidgets.length = 0;
        }
        this.listItems.forEach(function (item) {
            if (item.isActive) {
                if (_this.multiselect) {
                    _this.selectedItemWidgets.push(item.currentItemWidgets);
                }
                else {
                    _this.selectedItemWidgets = item.currentItemWidgets;
                }
            }
        });
    };
    /**
     * Selects the listItem and updates selecteditem property.
     * If the listItem is already a selected item then deselects the item.
     * @param {ListItemDirective} $listItem: Item to be selected of deselected.
     */
    ListComponent.prototype.toggleListItemSelection = function ($listItem) {
        // item is not allowed to get selected if it is disabled.
        if ($listItem && !$listItem.disableItem) {
            var item = $listItem.item;
            if (this.groupby && _.has(item, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded from selecteditem.
                item = _.clone(item);
                delete item._groupIndex;
            }
            if ($listItem.isActive) {
                this._items = _.pullAllWith(this._items, [item], _.isEqual);
                $listItem.isActive = false;
            }
            else {
                // if multiselect is false, clear the selectItem list before adding an item to the selectItem list.
                if (!this.multiselect) {
                    this.clearSelectedItems();
                }
                this._items.push(item);
                this.invokeEventCallback('select', { widget: $listItem, $data: item });
                $listItem.isActive = true;
            }
            this.updateSelectedItemsWidgets();
        }
    };
    /**
     * Method is Invoked when the model for the List Widget is changed.
     * @param {QueryList<ListItemDirective>} listItems
     */
    ListComponent.prototype.onListRender = function (listItems) {
        var _this = this;
        // Added render callback event. This method(onListRender) is calling multiple times so checking isDatachanged flag because this falg is changed whenever new data is rendered.
        if (this.isDataChanged) {
            this.invokeEventCallback('render', { $data: this.fieldDefs });
        }
        var selectedItems = _.isArray(this.selecteditem) ? this.selecteditem : [this.selecteditem];
        this.firstSelectedItem = this.lastSelectedItem = null;
        // don't select first item if multi-select is enabled and at least item is already selected in the list.
        if (listItems.length && this.selectfirstitem && !(this._items.length && this.multiselect)) {
            var $firstItem = listItems.first;
            if (!$firstItem.disableItem &&
                this.isDataChanged &&
                // "infinite scroll" or "load on demand" is enabled and at least one item is selected then dont alter the selected list items.
                !((this.infScroll || this.onDemandLoad) &&
                    this._items.length)) {
                this.clearSelectedItems();
                this.firstSelectedItem = this.lastSelectedItem = $firstItem;
                // selecting the first record
                this.selectItem(0);
            }
        }
        else {
            this.deselectListItems();
            selectedItems.forEach(function (selecteditem) {
                var listItem = _this.getListItemByModel(selecteditem);
                if (listItem) {
                    listItem.isActive = true;
                    _this.lastSelectedItem = listItem;
                    // focus the active element
                    listItem.nativeElement.focus();
                }
            });
        }
        if (this.fieldDefs.length && this.infScroll) {
            if (isMobileApp()) {
                this.bindIScrollEvt();
            }
            else {
                this.bindScrollEvt();
            }
        }
        this.isDataChanged = false;
    };
    ListComponent.prototype.triggerListItemSelection = function ($el, $event) {
        if ($el && $el[0]) {
            var listItemContext = $el.data('listItemContext');
            // Trigger click event only if the list item is from the corresponding list.
            if (listItemContext.listComponent === this) {
                this.onItemClick($event, listItemContext);
            }
        }
    };
    ListComponent.prototype.setupHandlers = function () {
        var _this = this;
        this.listItems.changes.subscribe(function (listItems) {
            _this.onListRender(listItems);
            _this.cdRef.detectChanges();
        });
        // handle click event in capturing phase.
        this.nativeElement.querySelector('ul.app-livelist-container').addEventListener('click', function ($event) {
            var target = $($event.target).closest('.app-list-item');
            // Recursively find the current list item
            while (target.get(0) && (target.closest('ul.app-livelist-container').get(0) !== $event.currentTarget)) {
                target = target.parent().closest('.app-list-item');
            }
            _this.triggerListItemSelection(target, $event);
        }, true);
    };
    // Triggers on drag start while reordering.
    ListComponent.prototype.onReorderStart = function (evt, ui) {
        ui.placeholder.height(ui.item.height());
        this.$ulEle.data('oldIndex', ui.item.index());
    };
    // Triggers after the sorting.
    ListComponent.prototype.onUpdate = function (evt, ui) {
        var data = this.fieldDefs;
        var newIndex = ui.item.index();
        var oldIndex = this.$ulEle.data('oldIndex');
        var minIndex = _.min([newIndex, oldIndex]);
        var maxIndex = _.max([newIndex, oldIndex]);
        var draggedItem = _.pullAt(data, oldIndex)[0];
        this.reorderProps.minIndex = _.min([minIndex, this.reorderProps.minIndex]);
        this.reorderProps.maxIndex = _.max([maxIndex, this.reorderProps.maxIndex]);
        data.splice(newIndex, 0, draggedItem);
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
        var $changedItem = {
            oldIndex: oldIndex,
            newIndex: newIndex,
            item: data[newIndex]
        };
        this.invokeEventCallback('reorder', { $event: evt, $data: data, $changedItem: $changedItem });
        this.$ulEle.removeData('oldIndex');
    };
    // configures reordering the list items.
    ListComponent.prototype.configureDnD = function () {
        var options = {
            appendTo: 'body',
        };
        var $el = $(this.nativeElement);
        this.$ulEle = $el.find('.app-livelist-container');
        configureDnD(this.$ulEle, options, this.onReorderStart.bind(this), this.onUpdate.bind(this));
        this.$ulEle.droppable({ 'accept': '.app-list-item' });
    };
    // returns true if the selection limit is reached.
    ListComponent.prototype.checkSelectionLimit = function (count) {
        return (!this.selectionlimit || count < this.selectionlimit);
    };
    // returns listitem reference by index value.
    ListComponent.prototype.getListItemByIndex = function (index) {
        return this.listItems.toArray()[index];
    };
    /**
     * return index of an (listItemDirective) in the listItem
     * @param {ListItemDirective} item
     * @returns {number}
     */
    ListComponent.prototype.getListItemIndex = function (item) {
        return this.listItems.toArray().indexOf(item);
    };
    // this method is called form other data widgets like table.
    ListComponent.prototype.execute = function (operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource.execute(operation, options);
    };
    ListComponent.prototype.handleKeyDown = function ($event, action) {
        $event.stopPropagation();
        var listItems = this.listItems;
        var presentIndex = this.getListItemIndex(this.lastSelectedItem);
        if (this.multiselect) {
            var firstIndex = this.getListItemIndex(this.firstSelectedItem);
            var selectCount = _.isArray(this.selecteditem) ? this.selecteditem.length : (_.isObject(this.selecteditem) ? 1 : 0);
            if (action === 'selectPrev') {
                if (presentIndex > 0) {
                    if ((presentIndex <= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex - 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    }
                    else if (presentIndex > firstIndex) {
                        this.toggleListItemSelection(this.getListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex - 1);
                    }
                    else {
                        this.invokeEventCallback('selectionlimitexceed', { $event: $event });
                    }
                }
            }
            else if (action === 'selectNext') {
                if (presentIndex < listItems.length - 1) {
                    if ((presentIndex >= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex + 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    }
                    else if (presentIndex < firstIndex) {
                        this.toggleListItemSelection(this.getListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex + 1);
                    }
                    else {
                        this.invokeEventCallback('selectionlimitexceed', { $event: $event });
                    }
                }
            }
        }
        if (action === 'focusPrev') {
            presentIndex = presentIndex <= 0 ? 0 : (presentIndex - 1);
            this.lastSelectedItem = this.getListItemByIndex(presentIndex);
            this.lastSelectedItem.nativeElement.focus();
        }
        else if (action === 'focusNext') {
            presentIndex = presentIndex < (listItems.length - 1) ? (presentIndex + 1) : (listItems.length - 1);
            this.lastSelectedItem = this.getListItemByIndex(presentIndex);
            this.lastSelectedItem.nativeElement.focus();
        }
        else if (action === 'select') {
            // if the enter click is pressed on the item which is not the last selected item, the find the item from which the event is originated.
            if (presentIndex === -1 || !$($event.target).closest(this.lastSelectedItem.nativeElement)) {
                var $li = $($event.target).closest('li.app-list-item');
                var $ul = $li.closest('ul.app-livelist-container');
                presentIndex = $ul.find('li.app-list-item').index($li);
            }
            this.onItemClick($event, this.getListItemByIndex(presentIndex));
        }
    };
    ListComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'dataset') {
            if (!nv && this.binddatasource && !this.datasource) {
                return;
            }
            this.onDataSetChange(nv);
        }
        else if (key === 'datasource') {
            if (this.dataset) {
                this.onDataSetChange(this.dataset);
            }
        }
        else if (key === 'navigation') {
            // Support for older projects where navigation type was advanced instead of classic
            if (nv === 'Advanced') {
                this.navigation = 'Classic';
                return;
            }
            switchClass(this.nativeElement, nv, ov);
            this.onNavigationTypeChange(nv);
            if (this.dataNavigator) {
                this.dataNavigator.navigationClass = this.paginationclass;
            }
        }
        else if (key === 'itemsperrow') {
            this.setListClass();
        }
        else if (key === 'tabindex') {
            return;
        }
        else if (key === 'pulltorefresh' && nv) {
            this.app.notify('pullToRefresh:enable');
            this.subscribeToPullToRefresh();
        }
        else if (key === 'paginationclass') {
            if (this.dataNavigator) {
                // Adding setTimeout because in pagination component updateNavSize method is overriding navigationclass
                setTimeout(function () { return _this.dataNavigator.navigationClass = nv; });
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    ListComponent.prototype.onItemClick = function (evt, $listItem) {
        var _this = this;
        var selectCount;
        if (!$listItem.disableItem) {
            this.firstSelectedItem = this.firstSelectedItem || $listItem;
            // Setting selectCount value based number of items selected.
            selectCount = _.isArray(this.selecteditem) ? this.selecteditem.length : (_.isObject(this.selecteditem) ? 1 : 0);
            // Handling multiselect for mobile applications
            if (this.multiselect && isMobileApp()) {
                if (this.checkSelectionLimit(selectCount) || $listItem.isActive) {
                    this.toggleListItemSelection($listItem);
                }
                else {
                    this.invokeEventCallback('selectionlimitexceed', { $event: evt });
                }
            }
            else if ((evt.ctrlKey || evt.metaKey) && this.multiselect) {
                if (this.checkSelectionLimit(selectCount) || $listItem.isActive) {
                    this.firstSelectedItem = this.lastSelectedItem = $listItem;
                    this.toggleListItemSelection($listItem);
                }
                else {
                    this.invokeEventCallback('selectionlimitexceed', { $event: evt });
                }
            }
            else if (evt.shiftKey && this.multiselect) {
                var first_1 = $listItem.context.index;
                var last_1 = this.firstSelectedItem.context.index;
                // if first is greater than last, then swap values
                if (first_1 > last_1) {
                    last_1 = [first_1, first_1 = last_1][0];
                }
                if (this.checkSelectionLimit(last_1 - first_1)) {
                    this.clearSelectedItems();
                    this.listItems.forEach(function ($liItem) {
                        var index = $liItem.context.index;
                        if (index >= first_1 && index <= last_1) {
                            _this.toggleListItemSelection($liItem);
                        }
                    });
                    this.lastSelectedItem = $listItem;
                }
                else {
                    this.invokeEventCallback('selectionlimitexceed', { $event: evt });
                }
            }
            else {
                if (!$listItem.isActive || selectCount > 1) {
                    this.clearSelectedItems();
                    this.toggleListItemSelection($listItem);
                    this.firstSelectedItem = this.lastSelectedItem = $listItem;
                }
            }
            $appDigest();
        }
    };
    // Empty the list content on clear
    ListComponent.prototype.clear = function () {
        this.updateFieldDefs([]);
    };
    /**
     *  Returns ListItem Reference based on the input provided.
     * @param val: index | model of the list item.
     * @returns {ListItemDirective}
     */
    ListComponent.prototype.getItemRefByIndexOrModel = function (val) {
        var listItem;
        if (isNumber(val)) {
            listItem = this.getListItemByIndex(val);
        }
        else {
            listItem = this.getListItemByModel(val);
        }
        return listItem;
    };
    /**
     * deselects item in the list.
     * @param val: index | model of the list item.
     */
    ListComponent.prototype.deselectItem = function (val) {
        var listItem = this.getItemRefByIndexOrModel(val);
        if (listItem && listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
    };
    /**
     * selects item in the list.
     * @param val: index | model of the list item.
     */
    ListComponent.prototype.selectItem = function (val) {
        var listItem = this.getItemRefByIndexOrModel(val);
        if (!listItem) {
            return;
        }
        if (!listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
        // focus the element.
        listItem.nativeElement.focus();
    };
    ListComponent.prototype.beforePaginationChange = function ($event, $index) {
        this.invokeEventCallback('paginationchange', { $event: $event, $index: $index });
    };
    ListComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals) {
        var _this = this;
        // tap and doubleTap events are not getting propagated.So, using mouse events instead.
        var touchToMouse = {
            tap: 'click',
            doubletap: 'dblclick'
        };
        if (_.includes(['click', 'tap', 'dblclick', 'doubletap'], eventName)) {
            this.eventManager.addEventListener(this.nativeElement, touchToMouse[eventName] || eventName, function (evt) {
                var target = $(evt.target).closest('.app-list-item');
                if (target.length) {
                    var listItemContext = target.data('listItemContext');
                    if (!listItemContext.disableItem) {
                        _this.invokeEventCallback(eventName, { widget: listItemContext, $event: evt, item: listItemContext.item });
                    }
                }
            });
        }
    };
    // Invoke the datasource variable by default when pulltorefresh event is not specified.
    ListComponent.prototype.subscribeToPullToRefresh = function () {
        var _this = this;
        this.cancelSubscription = this.app.subscribe('pulltorefresh', function () {
            if (_this.datasource && _this.datasource.listRecords) {
                _this.datasource.listRecords();
            }
        });
    };
    ListComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.handleHeaderClick = noop;
        this._items = [];
        this.fieldDefs = [];
        // When pagination is infinite scroll dataset is applying after debounce time(250ms) so making next call after previous data has rendered
        this.debouncedFetchNextDatasetOnScroll = _.debounce(this.fetchNextDatasetOnScroll, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        this.reorderProps = {
            minIndex: null,
            maxIndex: null
        };
    };
    ListComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.promiseResolverFn();
        this.propsInitPromise.then(function () {
            _super.prototype.ngAfterViewInit.call(_this);
            _this.selectedItemWidgets = _this.multiselect ? [] : {};
            if (_this.enablereorder && !_this.groupby) {
                _this.configureDnD();
            }
            if (_this.groupby && _this.collapsible) {
                _this.handleHeaderClick = handleHeaderClick;
                _this.toggleAllHeaders = toggleAllHeaders.bind(undefined, _this);
            }
            _this.setListClass();
        });
        this.setupHandlers();
        var $ul = this.nativeElement.querySelector('ul.app-livelist-container');
        styler($ul, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        if (isMobileApp() && $ul.querySelector('.app-list-item-action-panel')) {
            this._listAnimator = new ListAnimator(this);
        }
    };
    ListComponent.prototype.ngOnDestroy = function () {
        if (this._listAnimator && this._listAnimator.$btnSubscription) {
            this._listAnimator.$btnSubscription.unsubscribe();
        }
        if (this.cancelSubscription) {
            this.cancelSubscription();
        }
    };
    ListComponent.initializeProps = registerProps();
    ListComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmList]',
                    template: "<div class=\"panel-heading\" *ngIf=\"title || subheading || iconclass\">\n    <h3 class=\"panel-title\">\n        <div class=\"pull-left\">\n            <i class=\"app-icon panel-icon {{iconclass}}\" aria-hidden=\"true\" [hidden]=\"!iconclass\"></i>\n        </div>\n        <div class=\"pull-left\">\n            <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\"></div>\n            <div class=\"description\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n        </div>\n    </h3>\n</div>\n\n<nav class=\"app-datanavigator\" aria-label=\"Page navigation\" *ngIf=\"navigation === 'Inline' && !noDataFound\">\n    <ul class=\"pager\">\n        <li class=\"previous\" [ngClass]=\"{'disabled': (dataNavigator ? dataNavigator.isDisablePrevious : true)}\">\n            <a href=\"javascript:void(0);\" (click)=\"dataNavigator.navigatePage('prev', $event)\">\n                <i class=\"wi wi-chevron-left\" aria-hidden=\"true\"></i>\n                <span class=\"sr-only\">Previous</span>\n            </a>\n        </li>\n    </ul>\n</nav>\n\n<ul tabindex=\"0\" class=\"app-livelist-container clearfix {{listclass}}\"\n    (keydown.enter)=\"handleKeyDown($event, 'select')\"\n\n    (keydown.arrowup)=\"handleKeyDown($event, 'focusPrev')\"\n    (keydown.arrowdown)=\"handleKeyDown($event, 'focusNext')\"\n    (keydown.arrowleft)=\"handleKeyDown($event, 'focusPrev')\"\n    (keydown.arrowright)=\"handleKeyDown($event, 'focusNext')\"\n\n    (keydown.shift.arrowup)=\"handleKeyDown($event, 'selectPrev')\"\n    (keydown.shift.arrowdown)=\"handleKeyDown($event, 'selectNext')\"\n    (keydown.shift.arrowleft)=\"handleKeyDown($event, 'selectPrev')\"\n    (keydown.shift.arrowright)=\"handleKeyDown($event, 'selectNext')\"\n>\n    <ng-template [ngIf]=\"!groupby\" [ngIfElse]=\"groupedListTemplate\">\n        <li *ngFor=\"let item of fieldDefs; index as $index; first as $first; last as $last;\" class=\"app-list-item {{itemsPerRowClass}}\" [ngClass]=\"listItemRef.itemClass\"\n            [wmListItem]=\"item\"\n            #listItemRef=\"listItemRef\"\n            tabindex=\"0\">\n            <ng-container [ngTemplateOutlet]=\"listTemplate\" [ngTemplateOutletContext]=\"{item: item, $index: $index, itemRef: listItemRef, $first: $first, $last: $last, currentItemWidgets: listItemRef.currentItemWidgets}\"></ng-container>\n        </li>\n    </ng-template>\n    <ng-container [ngTemplateOutlet]=\"listLeftActionTemplate\"></ng-container>\n    <ng-container [ngTemplateOutlet]=\"listRightActionTemplate\"></ng-container>\n</ul>\n\n<div class=\"no-data-msg\" *ngIf=\"noDataFound && !variableInflight\" [textContent]=\"nodatamessage\"></div>\n\n<div class=\"loading-data-msg\" *ngIf=\"variableInflight && !pulltorefresh\">\n    <span>\n        <i class=\"app-icon panel-icon fa-spin\" aria-hidden=\"true\" [ngClass]=\"loadingicon\"></i>\n        <span class=\"sr-only\">Loading</span>\n        <span class=\"loading-text\" [textContent]=\"loadingdatamsg\"></span>\n    </span>\n</div>\n\n<nav class=\"app-datanavigator\" *ngIf=\"navigation === 'Inline' && !noDataFound\">\n    <ul class=\"pager\">\n        <li class=\"next\" [ngClass]=\"{'disabled': (dataNavigator ? dataNavigator.isDisableNext  : true)}\">\n            <a href=\"javascript:void(0);\" (click)=\"dataNavigator.navigatePage('next', $event)\">\n                <i class=\"wi wi-chevron-right\" aria-hidden=\"true\"></i>\n                <span class=\"sr-only\">Next</span>\n            </a>\n        </li>\n    </ul>\n</nav>\n\n<div class=\"panel-footer\" *ngIf=\"navigation !== 'None'\" [hidden]=\"!showNavigation || (onDemandLoad && dataNavigator.isDisableNext) || (dataNavigator.dataSize <= pagesize) || !dataNavigator.dataSize\">\n    <nav wmPagination\n         navigationalign.bind=\"navigationalign\"\n         navigation.bind=\"navControls\"\n         showrecordcount.bind=\"showrecordcount\"\n         maxsize.bind=\"maxsize\"\n         boundarylinks.bind=\"boundarylinks\"\n         forceellipses.bind=\"forceellipses\"\n         directionlinks.bind=\"directionlinks\"\n         show.bind=\"!onDemandLoad\"\n         paginationchange.event=\"beforePaginationChange($event, $index)\"\n    ></nav>\n    <a *ngIf=\"onDemandLoad\" href=\"javascript:void(0);\"\n       (click)=\"dataNavigator.navigatePage('next', $event)\"\n       class=\"app-button btn btn-block\"\n       [ngClass]=\"paginationclass\"\n       [textContent]=\"ondemandmessage\"\n    ></a>\n</div>\n\n<!--This template will be displayed when groupby is specified-->\n<ng-template #groupedListTemplate>\n    <li *ngFor=\"let groupObj of groupedData\" class=\"app-list-item-group clearfix\">\n        <ul class=\"list-group item-group\" [ngClass]=\"listclass\">\n            <li class=\"app-list-item-header list-item list-group-header\" (click)=\"handleHeaderClick($event)\" [ngClass]=\"{'collapsible-content': collapsible}\">\n            <h4>{{groupObj.key}}\n                <div class=\"header-action\">\n                    <i class=\"app-icon wi action wi-chevron-up\" *ngIf=\"collapsible\"></i>\n                    <span *ngIf=\"showcount\" class=\"label label-default\">{{groupObj.data.length}}</span>\n                    </div>\n                </h4>\n            </li>\n            <li *ngFor=\"let item of groupObj.data; index as $index; first as $first; last as $last;\" tabindex=\"0\"\n                class=\"app-list-item group-list-item {{itemsPerRowClass}}\"\n                [ngClass]=\"listItemRef.itemClass\"\n                [wmListItem]=\"item\" #listItemRef=\"listItemRef\">\n                <ng-container [ngTemplateOutlet]=\"listTemplate\" [ngTemplateOutletContext]=\"{item: item, $index: $index, itemRef: listItemRef, $first: $first, $last: $last, currentItemWidgets: listItemRef.currentItemWidgets}\"></ng-container>\n            </li>\n        </ul>\n    </li>\n</ng-template>\n",
                    providers: [
                        provideAsWidgetRef(ListComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ListComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: ChangeDetectorRef },
        { type: ToDatePipe },
        { type: App },
        { type: AppDefaults },
        { type: NgZone },
        { type: String, decorators: [{ type: Attribute, args: ['itemclass.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['disableitem.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['datasource.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['mouseenter.event',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['mouseleave.event',] }] }
    ]; };
    ListComponent.propDecorators = {
        listTemplate: [{ type: ContentChild, args: ['listTemplate',] }],
        listLeftActionTemplate: [{ type: ContentChild, args: ['listLeftActionTemplate',] }],
        listRightActionTemplate: [{ type: ContentChild, args: ['listRightActionTemplate',] }],
        btnComponents: [{ type: ContentChildren, args: [ButtonComponent,] }],
        dataNavigator: [{ type: ViewChild, args: [PaginationComponent,] }],
        listItems: [{ type: ViewChildren, args: [ListItemDirective,] }]
    };
    return ListComponent;
}(StylableComponent));
export { ListComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2xpc3QvbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFjLFFBQVEsRUFBRSxNQUFNLEVBQXFCLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUl4TixPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQVksV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVqTCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDJC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LGtCQUFrQjs2Q0FDNUIsU0FBUyxTQUFDLGNBQWM7NkNBQ3hCLFNBQVMsU0FBQyxpQkFBaUI7NkNBQzNCLFNBQVMsU0FBQyxrQkFBa0I7NkNBQzVCLFNBQVMsU0FBQyxrQkFBa0I7OzsrQkEzSmhDLFlBQVksU0FBQyxjQUFjO3lDQUUzQixZQUFZLFNBQUMsd0JBQXdCOzBDQUNyQyxZQUFZLFNBQUMseUJBQXlCO2dDQUN0QyxlQUFlLFNBQUMsZUFBZTtnQ0FFL0IsU0FBUyxTQUFDLG1CQUFtQjs0QkFDN0IsWUFBWSxTQUFDLGlCQUFpQjs7SUFzK0JuQyxvQkFBQztDQUFBLEFBdi9CRCxDQU9tQyxpQkFBaUIsR0FnL0JuRDtTQWgvQlksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBDb250ZW50Q2hpbGRyZW4sIEVsZW1lbnRSZWYsIEluamVjdG9yLCBOZ1pvbmUsIE9uRGVzdHJveSwgT25Jbml0LCBRdWVyeUxpc3QsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQsIFZpZXdDaGlsZHJlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgQXBwLCBBcHBEZWZhdWx0cywgRGF0YVNvdXJjZSwgZ2V0Q2xvbmVkT2JqZWN0LCBpc0RhdGFTb3VyY2VFcXVhbCwgaXNEZWZpbmVkLCBpc01vYmlsZSwgaXNNb2JpbGVBcHAsIGlzTnVtYmVyLCBpc09iamVjdCwgbm9vcCwgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFRvRGF0ZVBpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy9jdXN0b20tcGlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9saXN0LnByb3BzJztcbmltcG9ydCB7IE5BVklHQVRJT05fVFlQRSwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFBhZ2luYXRpb25Db21wb25lbnQgfSBmcm9tICcuLi9wYWdpbmF0aW9uL3BhZ2luYXRpb24uY29tcG9uZW50JztcbmltcG9ydCB7IExpc3RJdGVtRGlyZWN0aXZlIH0gZnJvbSAnLi9saXN0LWl0ZW0uZGlyZWN0aXZlJztcbmltcG9ydCB7IExpc3RBbmltYXRvciB9IGZyb20gJy4vbGlzdC5hbmltYXRvcic7XG5pbXBvcnQgeyBjb25maWd1cmVEbkQsIGdldE9yZGVyZWREYXRhc2V0LCBncm91cERhdGEsIGhhbmRsZUhlYWRlckNsaWNrLCB0b2dnbGVBbGxIZWFkZXJzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQnV0dG9uQ29tcG9uZW50IH0gZnJvbSAnLi4vYnV0dG9uL2J1dHRvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgREVCT1VOQ0VfVElNRVMgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvY29uc3RhbnRzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuZGVjbGFyZSBjb25zdCAkO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtbGl2ZWxpc3QgYXBwLXBhbmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWxpc3QnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21MaXN0XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTGlzdENvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIExpc3RDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQENvbnRlbnRDaGlsZCgnbGlzdFRlbXBsYXRlJykgbGlzdFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxFbGVtZW50UmVmPjtcblxuICAgIEBDb250ZW50Q2hpbGQoJ2xpc3RMZWZ0QWN0aW9uVGVtcGxhdGUnKSBsaXN0TGVmdEFjdGlvblRlbXBsYXRlOiAgVGVtcGxhdGVSZWY8RWxlbWVudFJlZj47XG4gICAgQENvbnRlbnRDaGlsZCgnbGlzdFJpZ2h0QWN0aW9uVGVtcGxhdGUnKSBsaXN0UmlnaHRBY3Rpb25UZW1wbGF0ZTogIFRlbXBsYXRlUmVmPEVsZW1lbnRSZWY+O1xuICAgIEBDb250ZW50Q2hpbGRyZW4oQnV0dG9uQ29tcG9uZW50KSBidG5Db21wb25lbnRzO1xuXG4gICAgQFZpZXdDaGlsZChQYWdpbmF0aW9uQ29tcG9uZW50KSBkYXRhTmF2aWdhdG9yO1xuICAgIEBWaWV3Q2hpbGRyZW4oTGlzdEl0ZW1EaXJlY3RpdmUpIGxpc3RJdGVtczogUXVlcnlMaXN0PExpc3RJdGVtRGlyZWN0aXZlPjtcblxuICAgIHByaXZhdGUgaXRlbXNQZXJSb3dDbGFzczogc3RyaW5nO1xuICAgIHByaXZhdGUgZmlyc3RTZWxlY3RlZEl0ZW06IExpc3RJdGVtRGlyZWN0aXZlO1xuICAgIHByaXZhdGUgbmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2g6IFN1YnNjcmlwdGlvbjtcbiAgICBwcml2YXRlIG5hdmlnYXRvclJlc3VsdFdhdGNoOiBTdWJzY3JpcHRpb247XG4gICAgcHJpdmF0ZSBuYXZDb250cm9sczogc3RyaW5nO1xuICAgIHByaXZhdGUgb25EZW1hbmRMb2FkOiBib29sZWFuO1xuICAgIHByaXZhdGUgX2l0ZW1zOiBBcnJheTxhbnk+O1xuICAgIHByaXZhdGUgZGF0YU5hdmlnYXRvcldhdGNoZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBkYXRhc291cmNlOiBhbnk7XG4gICAgcHJpdmF0ZSBzaG93TmF2aWdhdGlvbjogYm9vbGVhbjtcbiAgICBwdWJsaWMgbm9EYXRhRm91bmQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBkZWJvdW5jZWRGZXRjaE5leHREYXRhc2V0T25TY3JvbGw6IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgcmVvcmRlclByb3BzOiBhbnk7XG4gICAgcHJpdmF0ZSBhcHA6IGFueTtcbiAgICBwcml2YXRlIGFwcERlZmF1bHRzOiBhbnk7XG4gICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZTtcblxuICAgIHB1YmxpYyBsYXN0U2VsZWN0ZWRJdGVtOiBMaXN0SXRlbURpcmVjdGl2ZTtcbiAgICBwdWJsaWMgZmllbGREZWZzOiBBcnJheTxhbnk+O1xuICAgIHB1YmxpYyBkaXNhYmxlaXRlbTtcbiAgICBwdWJsaWMgbmF2aWdhdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBuYXZpZ2F0aW9uYWxpZ246IHN0cmluZztcbiAgICBwdWJsaWMgcGFnZXNpemU6IG51bWJlcjtcbiAgICBwdWJsaWMgZGF0YXNldDogYW55O1xuICAgIHB1YmxpYyBtdWx0aXNlbGVjdDogYm9vbGVhbjtcbiAgICBwdWJsaWMgc2VsZWN0Zmlyc3RpdGVtOiBib29sZWFuO1xuICAgIHB1YmxpYyBvcmRlcmJ5OiBzdHJpbmc7XG4gICAgcHVibGljIGxvYWRpbmdpY29uOiBzdHJpbmc7XG4gICAgcHVibGljIHBhZ2luYXRpb25jbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyBvbmRlbWFuZG1lc3NhZ2U6IHN0cmluZztcbiAgICBwdWJsaWMgbG9hZGluZ2RhdGFtc2c6IHN0cmluZztcbiAgICBwdWJsaWMgc2VsZWN0aW9ubGltaXQ6IG51bWJlcjtcbiAgICBwdWJsaWMgaW5mU2Nyb2xsOiBib29sZWFuO1xuICAgIHB1YmxpYyBlbmFibGVyZW9yZGVyOiBib29sZWFuO1xuICAgIHB1YmxpYyBpdGVtc3BlcnJvdzogc3RyaW5nO1xuICAgIHB1YmxpYyBpdGVtY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgc2VsZWN0ZWRJdGVtV2lkZ2V0czogQXJyYXk8V2lkZ2V0UmVmPiB8IFdpZGdldFJlZjtcbiAgICBwdWJsaWMgdmFyaWFibGVJbmZsaWdodDtcbiAgICBwdWJsaWMgbmFtZTtcblxuICAgIHB1YmxpYyBoYW5kbGVIZWFkZXJDbGljazogRnVuY3Rpb247XG4gICAgcHVibGljIHRvZ2dsZUFsbEhlYWRlcnM6IHZvaWQ7XG4gICAgcHVibGljIGdyb3VwYnk6IHN0cmluZztcbiAgICBwdWJsaWMgY29sbGFwc2libGU6IHN0cmluZztcbiAgICBwdWJsaWMgZGF0ZVBpcGU6IFRvRGF0ZVBpcGU7XG4gICAgcHVibGljIGJpbmRpdGVtY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgYmluZGRpc2FibGVpdGVtOiBzdHJpbmc7XG4gICAgcHVibGljIGJpbmRkYXRhc2V0OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBiaW5kZGF0YXNvdXJjZTogc3RyaW5nO1xuICAgIHB1YmxpYyBtb3VzZUVudGVyQ0I6IHN0cmluZztcbiAgICBwdWJsaWMgbW91c2VMZWF2ZUNCOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIG1hdGNoOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkYXRlZm9ybWF0OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBncm91cGVkRGF0YTogYW55O1xuICAgIHByaXZhdGUgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmO1xuICAgIHByaXZhdGUgcHJvbWlzZVJlc29sdmVyRm46IEZ1bmN0aW9uO1xuICAgIHByaXZhdGUgcHJvcHNJbml0UHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuICAgIHByaXZhdGUgJHVsRWxlOiBhbnk7XG4gICAgcHJpdmF0ZSBfbGlzdEFuaW1hdG9yOiBMaXN0QW5pbWF0b3I7XG4gICAgcHVibGljIHB1bGx0b3JlZnJlc2g6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBjYW5jZWxTdWJzY3JpcHRpb246IEZ1bmN0aW9uO1xuXG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmc7XG4gICAgcHVibGljIHN1YmhlYWRpbmc6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIGxpc3RjbGFzczogYW55O1xuICAgIHByaXZhdGUgaXNEYXRhQ2hhbmdlZDogYm9vbGVhbjtcblxuICAgIHB1YmxpYyBnZXQgc2VsZWN0ZWRpdGVtKCkge1xuICAgICAgICBpZiAodGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldENsb25lZE9iamVjdCh0aGlzLl9pdGVtcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaXNFbXB0eSh0aGlzLl9pdGVtcykpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuX2l0ZW1zWzBdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGxpc3Qgb2Ygd2lkZ2V0cyBwcmVzZW50IG9uIGxpc3QgaXRlbSBieSBjb25zaWRlcmluZyBuYW1lIGFuZCBpbmRleCBvZiB0aGUgd2lkZ2V0LlxuICAgICAqIElmIHdlIGRpZCdudCBwYXNzIGluZGV4LCBpdCByZXR1cm5zIGFycmF5IG9mIGFsbCB0aGUgd2lkZ2V0cyB3aGljaCBhcmUgbWF0Y2hpbmcgdG8gd2lkZ2V0IG5hbWVcbiAgICAgKiBAcGFyYW0gd2lkZ3RlTmFtZTogTmFtZSBvZiB0aGUgd2lkZ2V0XG4gICAgICogQHBhcmFtIGluZGV4OiBJbmRleCBvZiB0aGUgd2lkZ2V0XG4gICAgICovXG4gICAgcHVibGljIGdldFdpZGdldHMod2lkZ3RlTmFtZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIGxldCAkdGFyZ2V0O1xuICAgICAgICBjb25zdCByZXRWYWwgPSBbXTtcblxuICAgICAgICBpZiAoIXdpZGd0ZU5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNEZWZpbmVkKGluZGV4KSkge1xuICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMubGlzdEl0ZW1zLnRvQXJyYXkoKSwgKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgJHRhcmdldCA9IF8uZ2V0KGVsLmN1cnJlbnRJdGVtV2lkZ2V0cywgd2lkZ3RlTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCR0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0VmFsLnB1c2goJHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXRWYWw7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSAraW5kZXggfHwgMDtcblxuICAgICAgICAkdGFyZ2V0ID0gXy5nZXQodGhpcy5saXN0SXRlbXMudG9BcnJheSgpLCBpbmRleCk7XG5cbiAgICAgICAgaWYgKCR0YXJnZXQpIHtcbiAgICAgICAgICAgIHJldHVybiBbXy5nZXQoJHRhcmdldC5jdXJyZW50SXRlbVdpZGdldHMsIHdpZGd0ZU5hbWUpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybnMgbGlzdGl0ZW0gcmVmZXJlbmNlIGJ5IGluZGV4IHZhbHVlLiBUaGlzIHJlZmVycyB0byB0aGUgc2FtZSBtZXRob2QgZ2V0TGlzdEl0ZW1CeUluZGV4LlxuICAgIHB1YmxpYyBnZXRJdGVtKGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TGlzdEl0ZW1CeUluZGV4KGluZGV4KTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gaW5kZXggb2YgbGlzdEl0ZW0obGlzdEl0ZW1EaXJlY3RpdmUpLiBUaGlzIHJlZmVycyB0byB0aGUgc2FtZSBtZXRob2QgZ2V0TGlzdEl0ZW1JbmRleC5cbiAgICBwdWJsaWMgZ2V0SW5kZXgoaXRlbTogTGlzdEl0ZW1EaXJlY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TGlzdEl0ZW1JbmRleChpdGVtKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHNlbGVjdGVkaXRlbShpdGVtcykge1xuICAgICAgICB0aGlzLl9pdGVtcy5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLmRlc2VsZWN0TGlzdEl0ZW1zKCk7XG5cbiAgICAgICAgaWYgKF8uaXNBcnJheShpdGVtcykpIHtcbiAgICAgICAgICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB0aGlzLnNlbGVjdEl0ZW0oaXRlbSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RJdGVtKGl0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgZGF0ZVBpcGU6IFRvRGF0ZVBpcGUsXG4gICAgICAgIGFwcDogQXBwLFxuICAgICAgICBhcHBEZWZhdWx0czogQXBwRGVmYXVsdHMsXG4gICAgICAgIG5nWm9uZTogTmdab25lLFxuICAgICAgICBAQXR0cmlidXRlKCdpdGVtY2xhc3MuYmluZCcpIGJpbmRpdGVtY2xhc3M6IHN0cmluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGlzYWJsZWl0ZW0uYmluZCcpIGJpbmRkaXNhYmxlaXRlbTogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc2V0LmJpbmQnKSBiaW5kZGF0YXNldDogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc291cmNlLmJpbmQnKSBiaW5kZGF0YXNvdXJjZTogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdtb3VzZWVudGVyLmV2ZW50JykgbW91c2VFbnRlckNCOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vdXNlbGVhdmUuZXZlbnQnKSBtb3VzZUxlYXZlQ0I6IHN0cmluZyxcbiAgICApIHtcbiAgICAgICAgbGV0IHJlc29sdmVGbjogRnVuY3Rpb24gPSBub29wO1xuICAgICAgICBjb25zdCBwcm9wc0luaXRQcm9taXNlID0gbmV3IFByb21pc2UocmVzID0+IHJlc29sdmVGbiA9IHJlcyk7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRywgcHJvcHNJbml0UHJvbWlzZSk7XG4gICAgICAgIHRoaXMucHJvcHNJbml0UHJvbWlzZSA9IHByb3BzSW5pdFByb21pc2U7XG4gICAgICAgIHRoaXMucHJvbWlzZVJlc29sdmVyRm4gPSByZXNvbHZlRm47XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNIRUxMKTtcbiAgICAgICAgdGhpcy5jZFJlZiA9IGNkUmVmO1xuICAgICAgICB0aGlzLm5nWm9uZSA9IG5nWm9uZTtcbiAgICAgICAgdGhpcy5kYXRlUGlwZSA9IGRhdGVQaXBlO1xuXG4gICAgICAgIHRoaXMuYmluZGl0ZW1jbGFzcyA9IGJpbmRpdGVtY2xhc3M7XG4gICAgICAgIHRoaXMuYmluZGRpc2FibGVpdGVtID0gYmluZGRpc2FibGVpdGVtO1xuICAgICAgICB0aGlzLmJpbmRkYXRhc2V0ID0gYmluZGRhdGFzZXQ7XG4gICAgICAgIHRoaXMubW91c2VFbnRlckNCID0gbW91c2VFbnRlckNCO1xuICAgICAgICB0aGlzLm1vdXNlTGVhdmVDQiA9IG1vdXNlTGVhdmVDQjtcbiAgICAgICAgdGhpcy5iaW5kZGF0YXNvdXJjZSA9IGJpbmRkYXRhc291cmNlO1xuXG4gICAgICAgIHRoaXMuYXBwID0gYXBwO1xuICAgICAgICB0aGlzLmFwcERlZmF1bHRzID0gYXBwRGVmYXVsdHM7XG4gICAgICAgIHRoaXMudmFyaWFibGVJbmZsaWdodCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMubm9EYXRhRm91bmQgPSAhYmluZGRhdGFzZXQ7XG5cbiAgICAgICAgLy8gU2hvdyBsb2FkaW5nIHN0YXR1cyBiYXNlZCBvbiB0aGUgdmFyaWFibGUgbGlmZSBjeWNsZVxuICAgICAgICB0aGlzLmFwcC5zdWJzY3JpYmUoJ3RvZ2dsZS12YXJpYWJsZS1zdGF0ZScsIHRoaXMuaGFuZGxlTG9hZGluZy5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBoYW5kbGVMb2FkaW5nKGRhdGEpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKGRhdGFTb3VyY2UgJiYgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkgJiYgaXNEYXRhU291cmNlRXF1YWwoZGF0YS52YXJpYWJsZSwgZGF0YVNvdXJjZSkpIHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy52YXJpYWJsZUluZmxpZ2h0ID0gZGF0YS5hY3RpdmU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVzZXROYXZpZ2F0aW9uKCkge1xuICAgICAgICB0aGlzLnNob3dOYXZpZ2F0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMubmF2Q29udHJvbHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaW5mU2Nyb2xsID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25EZW1hbmRMb2FkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbmFibGVCYXNpY05hdmlnYXRpb24oKSB7XG4gICAgICAgIHRoaXMubmF2Q29udHJvbHMgPSBOQVZJR0FUSU9OX1RZUEUuQkFTSUM7XG4gICAgICAgIHRoaXMuc2hvd05hdmlnYXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5hYmxlSW5saW5lTmF2aWdhdGlvbigpIHtcbiAgICAgICAgdGhpcy5uYXZDb250cm9scyA9IE5BVklHQVRJT05fVFlQRS5JTkxJTkU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbmFibGVDbGFzc2ljTmF2aWdhdGlvbigpIHtcbiAgICAgICAgdGhpcy5uYXZDb250cm9scyA9IE5BVklHQVRJT05fVFlQRS5DTEFTU0lDO1xuICAgICAgICB0aGlzLnNob3dOYXZpZ2F0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuYWJsZVBhZ2VyTmF2aWdhdGlvbigpIHtcbiAgICAgICAgdGhpcy5uYXZDb250cm9scyA9IE5BVklHQVRJT05fVFlQRS5QQUdFUjtcbiAgICAgICAgdGhpcy5zaG93TmF2aWdhdGlvbiA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXROYXZpZ2F0aW9uVHlwZU5vbmUoKSB7XG4gICAgICAgIHRoaXMubmF2Q29udHJvbHMgPSBOQVZJR0FUSU9OX1RZUEUuTk9ORTtcbiAgICAgICAgdGhpcy5zaG93TmF2aWdhdGlvbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW5hYmxlSW5maW5pdGVTY3JvbGwoKSB7XG4gICAgICAgIHRoaXMuaW5mU2Nyb2xsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuYWJsZU9uRGVtYW5kTG9hZCgpIHtcbiAgICAgICAgdGhpcy5vbkRlbWFuZExvYWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnNob3dOYXZpZ2F0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKiB0aGlzIGZ1bmN0aW9uIHNldHMgdGhlIGl0ZW1jbGFzcyBkZXBlbmRpbmcgb24gaXRlbXNwZXJyb3cuXG4gICAgICogaWYgaXRlbXNwZXJyb3cgaXMgMiBmb3IgbGFyZ2UgZGV2aWNlLCB0aGVuIGl0ZW1jbGFzcyBpcyAnY29sLXhzLTEgY29sLXNtLTEgY29sLWxnLTInXG4gICAgICogaWYgaXRlbXNwZXJyb3cgaXMgJ2xnLTMnIHRoZW4gaXRlbWNsYXNzIGlzICdjb2wtbGctMydcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldExpc3RDbGFzcygpIHtcbiAgICAgICAgbGV0IHRlbXAgPSAnJztcbiAgICAgICAgaWYgKHRoaXMuaXRlbXNwZXJyb3cpIHtcbiAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUludCh0aGlzLml0ZW1zcGVycm93LCAxMCkpKSB7XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcgaXRlbXNwZXJyb3cgY29udGFpbmluZyBzdHJpbmcgb2YgY2xhc3Nlc1xuICAgICAgICAgICAgICAgIF8uc3BsaXQodGhpcy5pdGVtc3BlcnJvdywgJyAnKS5mb3JFYWNoKChjbHM6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gXy5zcGxpdChjbHMsICctJyk7XG4gICAgICAgICAgICAgICAgICAgIGNscyA9IGAke2tleXNbMF19LSR7KDEyIC8gcGFyc2VJbnQoa2V5c1sxXSwgMTApKX1gO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wICs9IGAgY29sLSR7Y2xzfWA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtc1BlclJvd0NsYXNzID0gdGVtcC50cmltKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGhhbmRsaW5nIGl0ZW1zcGVycm93IGhhdmluZyBpbnRlZ2VyIHZhbHVlLlxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNQZXJSb3dDbGFzcyA9IGBjb2wteHMtJHsoMTIgLyBwYXJzZUludCh0aGlzLml0ZW1zcGVycm93LCAxMCkpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIElmIGl0ZW1zcGVycm93IGlzIG5vdCBzcGVjaWZpZWQgbWFrZSBpdCBmdWxsIHdpZHRoXG4gICAgICAgICAgICB0aGlzLml0ZW1zUGVyUm93Q2xhc3MgPSAnY29sLXhzLTEyJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgTmF2aWdhdGlvbiB0eXBlIGZvciB0aGUgbGlzdC5cbiAgICAgKiBAcGFyYW0gdHlwZVxuICAgICAqL1xuICAgIHByaXZhdGUgb25OYXZpZ2F0aW9uVHlwZUNoYW5nZSh0eXBlKSB7XG4gICAgICAgIHRoaXMucmVzZXROYXZpZ2F0aW9uKCk7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBOQVZJR0FUSU9OX1RZUEUuQkFTSUM6XG4gICAgICAgICAgICAgICAgdGhpcy5lbmFibGVCYXNpY05hdmlnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTkFWSUdBVElPTl9UWVBFLklOTElORTpcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZUlubGluZU5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTkFWSUdBVElPTl9UWVBFLkFEVkFOQ0VEOlxuICAgICAgICAgICAgY2FzZSBOQVZJR0FUSU9OX1RZUEUuQ0xBU1NJQzpcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZUNsYXNzaWNOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5BVklHQVRJT05fVFlQRS5QQUdFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZVBhZ2VyTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBOQVZJR0FUSU9OX1RZUEUuTk9ORSA6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXROYXZpZ2F0aW9uVHlwZU5vbmUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTkFWSUdBVElPTl9UWVBFLlNDUk9MTDpcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZUluZmluaXRlU2Nyb2xsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE5BVklHQVRJT05fVFlQRS5PTkRFTUFORDpcbiAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZU9uRGVtYW5kTG9hZCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmZXRjaE5leHREYXRhc2V0T25TY3JvbGwoKSB7XG4gICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci5uYXZpZ2F0ZVBhZ2UoJ25leHQnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldElzY3JvbGxIYW5kbGVycyhlbCkge1xuICAgICAgICBsZXQgbGFzdFNjcm9sbFRvcCA9IDA7XG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSBfLmdldChlbC5pc2Nyb2xsLCAnd3JhcHBlcicpO1xuICAgICAgICBjb25zdCBzZWxmID0gZWwuaXNjcm9sbDtcblxuICAgICAgICBlbC5pc2Nyb2xsLm9uKCdzY3JvbGxFbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRIZWlnaHQgPSB3cmFwcGVyLmNsaWVudEhlaWdodCxcbiAgICAgICAgICAgICAgICB0b3RhbEhlaWdodCA9IHdyYXBwZXIuc2Nyb2xsSGVpZ2h0LFxuICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9IE1hdGguYWJzKGVsLmlzY3JvbGwueSk7XG5cbiAgICAgICAgICAgIGlmICgobGFzdFNjcm9sbFRvcCA8IHNjcm9sbFRvcCkgJiYgKHRvdGFsSGVpZ2h0ICogMC45IDwgc2Nyb2xsVG9wICsgY2xpZW50SGVpZ2h0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVib3VuY2VkRmV0Y2hOZXh0RGF0YXNldE9uU2Nyb2xsKCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuaW5kaWNhdG9yUmVmcmVzaCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmluZGljYXRvclJlZnJlc2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxhc3RTY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFwcGx5aW5nIGlzY3JvbGwgZXZlbnQgdG8gaW52b2tlIHRoZSBuZXh0IGNhbGxzIGZvciBpbmZpbnRlIHNjcm9sbC5cbiAgICBwcml2YXRlIGJpbmRJU2Nyb2xsRXZ0KCkge1xuICAgICAgICBjb25zdCAkc2Nyb2xsUGFyZW50ID0gdGhpcy4kZWxlbWVudC5jbG9zZXN0KCdbd21zbW9vdGhzY3JvbGw9XCJ0cnVlXCJdJyk7XG5cbiAgICAgICAgY29uc3QgaVNjcm9sbCA9IF8uZ2V0KCRzY3JvbGxQYXJlbnRbMF0sICdpc2Nyb2xsJyk7XG5cbiAgICAgICAgLy8gd2hlbiBpc2Nyb2xsIGlzIG5vdCBpbml0aWFsaXNlZCB0aGUgbm90aWZ5IHRoZSBzbW9vdGhzY3JvbGwgYW5kIHN1YnNjcmliZSB0byB0aGUgaXNjcm9sbCB1cGRhdGVcbiAgICAgICAgaWYgKCFpU2Nyb2xsKSB7XG4gICAgICAgICAgICBjb25zdCBpU2Nyb2xsU3Vic2NyaXB0aW9uID0gdGhpcy5hcHAuc3Vic2NyaWJlKCdpc2Nyb2xsLXVwZGF0ZScsIChfZWwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIV8uaXNFbXB0eShfZWwpICYmIF9lbC5pc1NhbWVOb2RlKCRzY3JvbGxQYXJlbnRbMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SXNjcm9sbEhhbmRsZXJzKCRzY3JvbGxQYXJlbnRbMF0pO1xuICAgICAgICAgICAgICAgICAgICBpU2Nyb2xsU3Vic2NyaXB0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFwcC5ub3RpZnkoJ25vLWlzY3JvbGwnLCAkc2Nyb2xsUGFyZW50WzBdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldElzY3JvbGxIYW5kbGVycygkc2Nyb2xsUGFyZW50WzBdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRTY3JvbGxFdnQoKSB7XG4gICAgICAgIGNvbnN0ICRlbCA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICAgIGNvbnN0ICR1bCA9ICRlbC5maW5kKCc+IHVsJyk7XG4gICAgICAgIGNvbnN0ICRmaXJzdENoaWxkID0gJHVsLmNoaWxkcmVuKCkuZmlyc3QoKTtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgbGV0ICRzY3JvbGxQYXJlbnQ7XG4gICAgICAgIGxldCBzY3JvbGxOb2RlO1xuICAgICAgICBsZXQgbGFzdFNjcm9sbFRvcCA9IDA7XG5cbiAgICAgICAgaWYgKCEkZmlyc3RDaGlsZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY3JvbGxQYXJlbnQgPSAkZmlyc3RDaGlsZC5zY3JvbGxQYXJlbnQoZmFsc2UpO1xuXG4gICAgICAgIGlmICgkc2Nyb2xsUGFyZW50WzBdID09PSBkb2N1bWVudCkge1xuICAgICAgICAgICAgc2Nyb2xsTm9kZSA9IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JvbGxOb2RlID0gJHNjcm9sbFBhcmVudFswXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhcyBzY3JvbGxcbiAgICAgICAgaWYgKHNjcm9sbE5vZGUuc2Nyb2xsSGVpZ2h0ID4gc2Nyb2xsTm9kZS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICRzY3JvbGxQYXJlbnRcbiAgICAgICAgICAgICAgICAuZWFjaCgoaW5kZXg6IG51bWJlciwgbm9kZTogSFRNTEVsZW1lbnQgfCBEb2N1bWVudCkgPT4gIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2Nyb2xsVG9wIHByb3BlcnR5IGlzIDAgb3IgdW5kZWZpbmVkIGZvciBib2R5IGluIElFLCBzYWZhcmkuXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JvbGxUb3AgPSBub2RlID09PSBkb2N1bWVudCA/IChub2RlLmJvZHkuc2Nyb2xsVG9wIHx8ICQod2luZG93KS5zY3JvbGxUb3AoKSkgOiAobm9kZSBhcyBIVE1MRWxlbWVudCkuc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9mZignc2Nyb2xsLnNjcm9sbF9ldnQnKVxuICAgICAgICAgICAgICAgIC5vbignc2Nyb2xsLnNjcm9sbF9ldnQnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBsZXQgdG90YWxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzY3JvbGxUb3A7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNjcm9sbGluZ0VsZW1lbnQgaXMgdW5kZWZpbmVkIGZvciBJRSwgc2FmYXJpLiB1c2UgYm9keSBhcyB0YXJnZXQgRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSAgdGFyZ2V0ID09PSBkb2N1bWVudCA/ICh0YXJnZXQuc2Nyb2xsaW5nRWxlbWVudCB8fCBkb2N1bWVudC5ib2R5KSA6IHRhcmdldDtcblxuICAgICAgICAgICAgICAgICAgICBjbGllbnRIZWlnaHQgPSB0YXJnZXQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEhlaWdodCA9IHRhcmdldC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9IHRhcmdldCA9PT0gZG9jdW1lbnQuYm9keSA/ICQod2luZG93KS5zY3JvbGxUb3AoKSA6IHRhcmdldC5zY3JvbGxUb3A7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKChsYXN0U2Nyb2xsVG9wIDwgc2Nyb2xsVG9wKSAmJiAodG90YWxIZWlnaHQgKiAwLjkgPCBzY3JvbGxUb3AgKyBjbGllbnRIZWlnaHQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm9mZignc2Nyb2xsLnNjcm9sbF9ldnQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZGVib3VuY2VkRmV0Y2hOZXh0RGF0YXNldE9uU2Nyb2xsKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsYXN0U2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJHVsLm9mZignd2hlZWwuc2Nyb2xsX2V2dCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gc2Nyb2xsYWJsZSBlbGVtZW50IHJlZ2lzdGVyIHdoZWVsIGV2ZW50IG9uIHVsIGVsZW1lbnRcbiAgICAgICAgICAgICR1bC5vbignd2hlZWwuc2Nyb2xsX2V2dCcsIGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQuZGVsdGFZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAkdWwub2ZmKCd3aGVlbC5zY3JvbGxfZXZ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVib3VuY2VkRmV0Y2hOZXh0RGF0YXNldE9uU2Nyb2xsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgZmllbGREZWZzIHByb3BlcnR5LCBmaWVsZERlZnMgaXMgdGhlIG1vZGVsIG9mIHRoZSBMaXN0IENvbXBvbmVudC5cbiAgICAgKiBmaWVsZERlZnMgaXMgYW4gQXJyYXkgdHlwZS5cbiAgICAgKiBAcGFyYW0gbmV3VmFsXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVGaWVsZERlZnMobmV3VmFsOiBBcnJheTxhbnk+KSB7XG4gICAgICAgIGlmICh0aGlzLmluZlNjcm9sbCB8fCB0aGlzLm9uRGVtYW5kTG9hZCkge1xuXG4gICAgICAgICAgICBpZiAoIWlzRGVmaW5lZCh0aGlzLmZpZWxkRGVmcykgfHwgdGhpcy5kYXRhTmF2aWdhdG9yLmlzRmlyc3RQYWdlKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkRGVmcyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maWVsZERlZnMgPSBbLi4udGhpcy5maWVsZERlZnMsIC4uLm5ld1ZhbF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZpZWxkRGVmcyA9IG5ld1ZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9yZGVyYnkpIHtcbiAgICAgICAgICAgIHRoaXMuZmllbGREZWZzID0gZ2V0T3JkZXJlZERhdGFzZXQodGhpcy5maWVsZERlZnMsIHRoaXMub3JkZXJieSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBieSkge1xuICAgICAgICAgICAgdGhpcy5ncm91cGVkRGF0YSA9IGdyb3VwRGF0YSh0aGlzLCB0aGlzLmZpZWxkRGVmcywgdGhpcy5ncm91cGJ5LCB0aGlzLm1hdGNoLCB0aGlzLm9yZGVyYnksIHRoaXMuZGF0ZWZvcm1hdCwgdGhpcy5kYXRlUGlwZSwgdW5kZWZpbmVkLCB0aGlzLmFwcERlZmF1bHRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5maWVsZERlZnMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLm5vRGF0YUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRpdGVtID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgdGhpcy5saXN0SXRlbXMuc2V0RGlydHkoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0YUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIG5ld1ZhbCBpcyBub3QgZW1wdHlcbiAgICAgICAgaWYgKCFfLmlzRW1wdHkobmV3VmFsKSkge1xuXG4gICAgICAgICAgICB0aGlzLm5vRGF0YUZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzRGF0YUNoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhc291cmNlICYmIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkpIHtcbiAgICAgICAgICAgICAgICAvLyBjbG9uZSB0aGUgdGhlIGRhdGEgaW4gY2FzZSBvZiBsaXZlIGFuZCBzZXJ2aWNlIHZhcmlhYmxlcyB0byBwcmV2ZW50IHRoZSB0d28td2F5IGJpbmRpbmcgZm9yIHRoZXNlIHZhcmlhYmxlcy5cbiAgICAgICAgICAgICAgICBuZXdWYWwgPSBfLmNsb25lRGVlcChuZXdWYWwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNPYmplY3QobmV3VmFsKSAmJiAhXy5pc0FycmF5KG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICBuZXdWYWwgPSBfLmlzRW1wdHkobmV3VmFsKSA/IFtdIDogW25ld1ZhbF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmlzU3RyaW5nKG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICBuZXdWYWwgPSBuZXdWYWwuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVkYXRhcmVuZGVyJywgeyRkYXRhOiBuZXdWYWx9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGaWVsZERlZnMobmV3VmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmllbGREZWZzKFtdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZXMgdGhlIGRhdGFTb3VyY2Ugd2hlbiBwYWdpbmF0aW9uIGlzIGVuYWJsZWQgZm9yIHRoZSBDb21wb25lbnQuXG4gICAgcHJpdmF0ZSBzZXR1cERhdGFTb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IGRhdGFOYXZpZ2F0b3IgPSB0aGlzLmRhdGFOYXZpZ2F0b3I7XG5cbiAgICAgICAgZGF0YU5hdmlnYXRvci5vcHRpb25zID0ge1xuICAgICAgICAgICAgbWF4UmVzdWx0czogdGhpcy5wYWdlc2l6ZSB8fCA1XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kYXRhTmF2aWdhdG9yV2F0Y2hlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2gudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvKlJlZ2lzdGVyIGEgd2F0Y2ggb24gdGhlIFwicmVzdWx0XCIgcHJvcGVydHkgb2YgdGhlIFwiZGF0YU5hdmlnYXRvclwiIHNvIHRoYXQgdGhlIHBhZ2luYXRlZCBkYXRhIGlzIGRpc3BsYXllZCBpbiB0aGUgbGl2ZS1saXN0LiovXG4gICAgICAgIHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2ggPSBkYXRhTmF2aWdhdG9yLnJlc3VsdEVtaXR0ZXIuc3Vic2NyaWJlKChuZXdWYWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkRhdGFDaGFuZ2UobmV3VmFsKTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIC8qRGUtcmVnaXN0ZXIgdGhlIHdhdGNoIGlmIGl0IGlzIGV4aXN0cyAqL1xuICAgICAgICBpZiAodGhpcy5uYXZpZ2F0b3JNYXhSZXN1bHRXYXRjaCkge1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0b3JNYXhSZXN1bHRXYXRjaC51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8qUmVnaXN0ZXIgYSB3YXRjaCBvbiB0aGUgXCJtYXhSZXN1bHRzXCIgcHJvcGVydHkgb2YgdGhlIFwiZGF0YU5hdmlnYXRvclwiIHNvIHRoYXQgdGhlIFwicGFnZVNpemVcIiBpcyBkaXNwbGF5ZWQgaW4gdGhlIGxpdmUtbGlzdC4qL1xuICAgICAgICB0aGlzLm5hdmlnYXRvck1heFJlc3VsdFdhdGNoID0gZGF0YU5hdmlnYXRvci5tYXhSZXN1bHRzRW1pdHRlci5zdWJzY3JpYmUoKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYWdlc2l6ZSA9IHZhbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGF0YU5hdmlnYXRvci5tYXhSZXN1bHRzID0gdGhpcy5wYWdlc2l6ZSB8fCA1O1xuICAgICAgICB0aGlzLnJlbW92ZVByb3BlcnR5QmluZGluZygnZGF0YXNldCcpO1xuICAgICAgICB0aGlzLmRhdGFOYXZpZ2F0b3Iuc2V0QmluZERhdGFTZXQodGhpcy5iaW5kZGF0YXNldCwgdGhpcy52aWV3UGFyZW50LCB0aGlzLmRhdGFzb3VyY2UsIHRoaXMuZGF0YXNldCwgdGhpcy5iaW5kZGF0YXNvdXJjZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRhdGFTZXRDaGFuZ2UobmV3VmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhTmF2aWdhdG9yV2F0Y2hlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubmF2aWdhdGlvbiAmJiB0aGlzLm5hdmlnYXRpb24gIT09IE5BVklHQVRJT05fVFlQRS5OT05FKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXR1cERhdGFTb3VyY2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkRhdGFDaGFuZ2UobmV3VmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5hdmlnYXRpb24gJiYgdGhpcy5uYXZpZ2F0aW9uICE9PSBOQVZJR0FUSU9OX1RZUEUuTk9ORSkge1xuICAgICAgICAgICAgLy8gSWYgbmF2aWdhdGlvbiBpcyBhbHJlYWR5IHNldHVwIGFuZCBkYXRhc291cmNlIGlzIGNoYW5nZWQsIHVwZGF0ZSB0aGUgZGF0YXNvdXJjZSBvbiBuYXZpZ2F0aW9uXG4gICAgICAgICAgICB0aGlzLmRhdGFOYXZpZ2F0b3Iuc2V0RGF0YVNvdXJjZSh0aGlzLmRhdGFzb3VyY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWxsIHRoZSBMaXN0SXRlbSdzIEFjdGl2ZSBzdGF0ZSBpcyBzZXQgdG8gZmFsc2UuXG4gICAgcHJpdmF0ZSBkZXNlbGVjdExpc3RJdGVtcygpIHtcbiAgICAgICAgdGhpcy5saXN0SXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uaXNBY3RpdmUgPSBmYWxzZSk7XG4gICAgfVxuXG4gICAgLy8gRGVzZWxlY3QgYWxsIHRoZSBMaXN0SXRlbXMgYW5kIGNsZWFyIHRoZSBzZWxlY3RlZGl0ZW0oSW5PdXRCb3VuZCBQcm9wZXJ0eSBtb2RlbClcbiAgICBwcml2YXRlIGNsZWFyU2VsZWN0ZWRJdGVtcygpIHtcbiAgICAgICAgdGhpcy5kZXNlbGVjdExpc3RJdGVtcygpO1xuICAgICAgICB0aGlzLl9pdGVtcy5sZW5ndGggPSAwO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIHRoZSBMaXN0SXRlbURpcmVjdGl2ZSBpbnN0YW5jZSBieSBjaGVja2luZyB0aGUgZXF1YWxpdHkgb2YgdGhlIG1vZGVsLlxuICAgICAqIEBwYXJhbSBsaXN0TW9kZWw6IG1vZGVsIHRvIGJlIHNlYXJjaGVkIGZvclxuICAgICAqIEByZXR1cm5zIExpc3RJdGVtIGlmIHRoZSBtb2RlbCBpcyBtYXRjaGVkIGVsc2UgcmV0dXJuIG51bGwuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRMaXN0SXRlbUJ5TW9kZWwobGlzdE1vZGVsKTogTGlzdEl0ZW1EaXJlY3RpdmUge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0SXRlbXMuZmluZCgobGlzdEl0ZW0pID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtT2JqID0gbGlzdEl0ZW0uaXRlbTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwYnkgJiYgIV8uaGFzKGxpc3RNb2RlbCwgJ19ncm91cEluZGV4JykpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBncm91cGJ5IGlzIGVuYWJsZWQsIGl0ZW0gY29udGFpbnMgX2dyb3VwSW5kZXggcHJvcGVydHkgd2hpY2ggc2hvdWxkIGJlIGV4Y2x1ZGVkIHdoaWxlIGNvbXBhcmluZyBtb2RlbC5cbiAgICAgICAgICAgICAgICBpdGVtT2JqID0gXy5jbG9uZShpdGVtT2JqKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbU9iai5fZ3JvdXBJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChfLmlzRXF1YWwoaXRlbU9iaiwgbGlzdE1vZGVsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSB8fCBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlU2VsZWN0ZWRJdGVtc1dpZGdldHMoKSB7XG4gICAgICAgIGlmICh0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAodGhpcy5zZWxlY3RlZEl0ZW1XaWRnZXRzIGFzIEFycmF5PFdpZGdldFJlZj4pLmxlbmd0aCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0SXRlbXMuZm9yRWFjaCgoaXRlbTogTGlzdEl0ZW1EaXJlY3RpdmUpID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubXVsdGlzZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuc2VsZWN0ZWRJdGVtV2lkZ2V0cyBhcyBBcnJheTxXaWRnZXRSZWY+KS5wdXNoKGl0ZW0uY3VycmVudEl0ZW1XaWRnZXRzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbVdpZGdldHMgPSBpdGVtLmN1cnJlbnRJdGVtV2lkZ2V0cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgdGhlIGxpc3RJdGVtIGFuZCB1cGRhdGVzIHNlbGVjdGVkaXRlbSBwcm9wZXJ0eS5cbiAgICAgKiBJZiB0aGUgbGlzdEl0ZW0gaXMgYWxyZWFkeSBhIHNlbGVjdGVkIGl0ZW0gdGhlbiBkZXNlbGVjdHMgdGhlIGl0ZW0uXG4gICAgICogQHBhcmFtIHtMaXN0SXRlbURpcmVjdGl2ZX0gJGxpc3RJdGVtOiBJdGVtIHRvIGJlIHNlbGVjdGVkIG9mIGRlc2VsZWN0ZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSB0b2dnbGVMaXN0SXRlbVNlbGVjdGlvbigkbGlzdEl0ZW06IExpc3RJdGVtRGlyZWN0aXZlKSB7XG4gICAgICAgIC8vIGl0ZW0gaXMgbm90IGFsbG93ZWQgdG8gZ2V0IHNlbGVjdGVkIGlmIGl0IGlzIGRpc2FibGVkLlxuICAgICAgICBpZiAoJGxpc3RJdGVtICYmICEkbGlzdEl0ZW0uZGlzYWJsZUl0ZW0pIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gJGxpc3RJdGVtLml0ZW07XG4gICAgICAgICAgICBpZiAodGhpcy5ncm91cGJ5ICYmIF8uaGFzKGl0ZW0sICdfZ3JvdXBJbmRleCcpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZ3JvdXBieSBpcyBlbmFibGVkLCBpdGVtIGNvbnRhaW5zIF9ncm91cEluZGV4IHByb3BlcnR5IHdoaWNoIHNob3VsZCBiZSBleGNsdWRlZCBmcm9tIHNlbGVjdGVkaXRlbS5cbiAgICAgICAgICAgICAgICBpdGVtID0gXy5jbG9uZShpdGVtKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgaXRlbS5fZ3JvdXBJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkbGlzdEl0ZW0uaXNBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pdGVtcyA9IF8ucHVsbEFsbFdpdGgodGhpcy5faXRlbXMsIFtpdGVtXSwgXy5pc0VxdWFsKTtcbiAgICAgICAgICAgICAgICAkbGlzdEl0ZW0uaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgbXVsdGlzZWxlY3QgaXMgZmFsc2UsIGNsZWFyIHRoZSBzZWxlY3RJdGVtIGxpc3QgYmVmb3JlIGFkZGluZyBhbiBpdGVtIHRvIHRoZSBzZWxlY3RJdGVtIGxpc3QuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3RlZEl0ZW1zKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7d2lkZ2V0OiAkbGlzdEl0ZW0sICRkYXRhOiBpdGVtfSk7XG4gICAgICAgICAgICAgICAgJGxpc3RJdGVtLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0ZWRJdGVtc1dpZGdldHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCBpcyBJbnZva2VkIHdoZW4gdGhlIG1vZGVsIGZvciB0aGUgTGlzdCBXaWRnZXQgaXMgY2hhbmdlZC5cbiAgICAgKiBAcGFyYW0ge1F1ZXJ5TGlzdDxMaXN0SXRlbURpcmVjdGl2ZT59IGxpc3RJdGVtc1xuICAgICAqL1xuICAgIHByaXZhdGUgb25MaXN0UmVuZGVyKGxpc3RJdGVtczogUXVlcnlMaXN0PExpc3RJdGVtRGlyZWN0aXZlPikge1xuICAgICAgICAvLyBBZGRlZCByZW5kZXIgY2FsbGJhY2sgZXZlbnQuIFRoaXMgbWV0aG9kKG9uTGlzdFJlbmRlcikgaXMgY2FsbGluZyBtdWx0aXBsZSB0aW1lcyBzbyBjaGVja2luZyBpc0RhdGFjaGFuZ2VkIGZsYWcgYmVjYXVzZSB0aGlzIGZhbGcgaXMgY2hhbmdlZCB3aGVuZXZlciBuZXcgZGF0YSBpcyByZW5kZXJlZC5cbiAgICAgICAgaWYgKHRoaXMuaXNEYXRhQ2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZW5kZXInLCB7JGRhdGE6IHRoaXMuZmllbGREZWZzfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRJdGVtcyA9IF8uaXNBcnJheSh0aGlzLnNlbGVjdGVkaXRlbSkgPyB0aGlzLnNlbGVjdGVkaXRlbSA6IFt0aGlzLnNlbGVjdGVkaXRlbV07XG5cbiAgICAgICAgdGhpcy5maXJzdFNlbGVjdGVkSXRlbSA9IHRoaXMubGFzdFNlbGVjdGVkSXRlbSA9IG51bGw7XG5cbiAgICAgICAgLy8gZG9uJ3Qgc2VsZWN0IGZpcnN0IGl0ZW0gaWYgbXVsdGktc2VsZWN0IGlzIGVuYWJsZWQgYW5kIGF0IGxlYXN0IGl0ZW0gaXMgYWxyZWFkeSBzZWxlY3RlZCBpbiB0aGUgbGlzdC5cbiAgICAgICAgaWYgKGxpc3RJdGVtcy5sZW5ndGggJiYgdGhpcy5zZWxlY3RmaXJzdGl0ZW0gJiYgISggdGhpcy5faXRlbXMubGVuZ3RoICYmIHRoaXMubXVsdGlzZWxlY3QpKSB7XG4gICAgICAgICAgICBjb25zdCAkZmlyc3RJdGVtOiBMaXN0SXRlbURpcmVjdGl2ZSA9IGxpc3RJdGVtcy5maXJzdDtcblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICEkZmlyc3RJdGVtLmRpc2FibGVJdGVtICYmXG4gICAgICAgICAgICAgICAgdGhpcy5pc0RhdGFDaGFuZ2VkICYmXG4gICAgICAgICAgICAgICAgLy8gXCJpbmZpbml0ZSBzY3JvbGxcIiBvciBcImxvYWQgb24gZGVtYW5kXCIgaXMgZW5hYmxlZCBhbmQgYXQgbGVhc3Qgb25lIGl0ZW0gaXMgc2VsZWN0ZWQgdGhlbiBkb250IGFsdGVyIHRoZSBzZWxlY3RlZCBsaXN0IGl0ZW1zLlxuICAgICAgICAgICAgICAgICEoXG4gICAgICAgICAgICAgICAgICAgICh0aGlzLmluZlNjcm9sbCB8fCB0aGlzLm9uRGVtYW5kTG9hZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclNlbGVjdGVkSXRlbXMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcnN0U2VsZWN0ZWRJdGVtID0gdGhpcy5sYXN0U2VsZWN0ZWRJdGVtID0gJGZpcnN0SXRlbTtcbiAgICAgICAgICAgICAgICAvLyBzZWxlY3RpbmcgdGhlIGZpcnN0IHJlY29yZFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RMaXN0SXRlbXMoKTtcbiAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMuZm9yRWFjaChzZWxlY3RlZGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RJdGVtOiBMaXN0SXRlbURpcmVjdGl2ZSA9IHRoaXMuZ2V0TGlzdEl0ZW1CeU1vZGVsKHNlbGVjdGVkaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWRJdGVtID0gbGlzdEl0ZW07XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvY3VzIHRoZSBhY3RpdmUgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbS5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5maWVsZERlZnMubGVuZ3RoICYmIHRoaXMuaW5mU2Nyb2xsKSB7XG4gICAgICAgICAgICBpZiAoaXNNb2JpbGVBcHAoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmluZElTY3JvbGxFdnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kU2Nyb2xsRXZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzRGF0YUNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJpZ2dlckxpc3RJdGVtU2VsZWN0aW9uKCRlbDogSlF1ZXJ5PEhUTUxFbGVtZW50PiwgJGV2ZW50OiBFdmVudCkge1xuICAgICAgICBpZiAoJGVsICYmICRlbFswXSkge1xuICAgICAgICAgICAgY29uc3QgbGlzdEl0ZW1Db250ZXh0ID0gJGVsLmRhdGEoJ2xpc3RJdGVtQ29udGV4dCcpO1xuICAgICAgICAgICAgLy8gVHJpZ2dlciBjbGljayBldmVudCBvbmx5IGlmIHRoZSBsaXN0IGl0ZW0gaXMgZnJvbSB0aGUgY29ycmVzcG9uZGluZyBsaXN0LlxuICAgICAgICAgICAgaWYgKGxpc3RJdGVtQ29udGV4dC5saXN0Q29tcG9uZW50ID09PSB0aGlzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkl0ZW1DbGljaygkZXZlbnQsIGxpc3RJdGVtQ29udGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwSGFuZGxlcnMoKSB7XG4gICAgICAgIHRoaXMubGlzdEl0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKCBsaXN0SXRlbXMgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkxpc3RSZW5kZXIobGlzdEl0ZW1zKTtcbiAgICAgICAgICAgIHRoaXMuY2RSZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gaGFuZGxlIGNsaWNrIGV2ZW50IGluIGNhcHR1cmluZyBwaGFzZS5cbiAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VsLmFwcC1saXZlbGlzdC1jb250YWluZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgkZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSAkKCRldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5hcHAtbGlzdC1pdGVtJyk7XG4gICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBmaW5kIHRoZSBjdXJyZW50IGxpc3QgaXRlbVxuICAgICAgICAgICAgd2hpbGUgKHRhcmdldC5nZXQoMCkgJiYgKHRhcmdldC5jbG9zZXN0KCd1bC5hcHAtbGl2ZWxpc3QtY29udGFpbmVyJykuZ2V0KDApICE9PSAkZXZlbnQuY3VycmVudFRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50KCkuY2xvc2VzdCgnLmFwcC1saXN0LWl0ZW0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudHJpZ2dlckxpc3RJdGVtU2VsZWN0aW9uKHRhcmdldCwgJGV2ZW50KTtcbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gVHJpZ2dlcnMgb24gZHJhZyBzdGFydCB3aGlsZSByZW9yZGVyaW5nLlxuICAgIHByaXZhdGUgb25SZW9yZGVyU3RhcnQoZXZ0LCB1aSkge1xuICAgICAgICB1aS5wbGFjZWhvbGRlci5oZWlnaHQodWkuaXRlbS5oZWlnaHQoKSk7XG4gICAgICAgIHRoaXMuJHVsRWxlLmRhdGEoJ29sZEluZGV4JywgdWkuaXRlbS5pbmRleCgpKTtcbiAgICB9XG5cbiAgICAvLyBUcmlnZ2VycyBhZnRlciB0aGUgc29ydGluZy5cbiAgICBwcml2YXRlIG9uVXBkYXRlKGV2dCwgdWkpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZmllbGREZWZzO1xuICAgICAgICBjb25zdCBuZXdJbmRleCA9IHVpLml0ZW0uaW5kZXgoKTtcbiAgICAgICAgY29uc3Qgb2xkSW5kZXggPSB0aGlzLiR1bEVsZS5kYXRhKCdvbGRJbmRleCcpO1xuXG4gICAgICAgIGNvbnN0IG1pbkluZGV4ID0gXy5taW4oW25ld0luZGV4LCBvbGRJbmRleF0pO1xuICAgICAgICBjb25zdCBtYXhJbmRleCA9IF8ubWF4KFtuZXdJbmRleCwgb2xkSW5kZXhdKTtcblxuICAgICAgICBjb25zdCBkcmFnZ2VkSXRlbSA9IF8ucHVsbEF0KGRhdGEsIG9sZEluZGV4KVswXTtcblxuICAgICAgICB0aGlzLnJlb3JkZXJQcm9wcy5taW5JbmRleCA9IF8ubWluKFttaW5JbmRleCwgdGhpcy5yZW9yZGVyUHJvcHMubWluSW5kZXhdKTtcbiAgICAgICAgdGhpcy5yZW9yZGVyUHJvcHMubWF4SW5kZXggPSBfLm1heChbbWF4SW5kZXgsIHRoaXMucmVvcmRlclByb3BzLm1heEluZGV4XSk7XG5cbiAgICAgICAgZGF0YS5zcGxpY2UobmV3SW5kZXgsIDAsIGRyYWdnZWRJdGVtKTtcblxuICAgICAgICB0aGlzLmNkUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgICAgICB0aGlzLmNkUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgY29uc3QgJGNoYW5nZWRJdGVtID0ge1xuICAgICAgICAgICAgb2xkSW5kZXg6IG9sZEluZGV4LFxuICAgICAgICAgICAgbmV3SW5kZXg6IG5ld0luZGV4LFxuICAgICAgICAgICAgaXRlbTogZGF0YVtuZXdJbmRleF1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZW9yZGVyJywgeyRldmVudDogZXZ0LCAkZGF0YTogZGF0YSwgJGNoYW5nZWRJdGVtfSk7XG4gICAgICAgIHRoaXMuJHVsRWxlLnJlbW92ZURhdGEoJ29sZEluZGV4Jyk7XG4gICAgfVxuXG4gICAgLy8gY29uZmlndXJlcyByZW9yZGVyaW5nIHRoZSBsaXN0IGl0ZW1zLlxuICAgIHByaXZhdGUgY29uZmlndXJlRG5EKCkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgYXBwZW5kVG86ICdib2R5JyxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCAkZWwgPSAkKHRoaXMubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIHRoaXMuJHVsRWxlID0gJGVsLmZpbmQoJy5hcHAtbGl2ZWxpc3QtY29udGFpbmVyJyk7XG5cbiAgICAgICAgY29uZmlndXJlRG5EKHRoaXMuJHVsRWxlLCBvcHRpb25zLCB0aGlzLm9uUmVvcmRlclN0YXJ0LmJpbmQodGhpcyksIHRoaXMub25VcGRhdGUuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy4kdWxFbGUuZHJvcHBhYmxlKHsnYWNjZXB0JzogJy5hcHAtbGlzdC1pdGVtJ30pO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdHJ1ZSBpZiB0aGUgc2VsZWN0aW9uIGxpbWl0IGlzIHJlYWNoZWQuXG4gICAgcHJpdmF0ZSBjaGVja1NlbGVjdGlvbkxpbWl0KGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuICghdGhpcy5zZWxlY3Rpb25saW1pdCB8fCBjb3VudCA8IHRoaXMuc2VsZWN0aW9ubGltaXQpO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgbGlzdGl0ZW0gcmVmZXJlbmNlIGJ5IGluZGV4IHZhbHVlLlxuICAgIHByaXZhdGUgZ2V0TGlzdEl0ZW1CeUluZGV4KGluZGV4OiBudW1iZXIpOiBMaXN0SXRlbURpcmVjdGl2ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RJdGVtcy50b0FycmF5KClbaW5kZXhdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybiBpbmRleCBvZiBhbiAobGlzdEl0ZW1EaXJlY3RpdmUpIGluIHRoZSBsaXN0SXRlbVxuICAgICAqIEBwYXJhbSB7TGlzdEl0ZW1EaXJlY3RpdmV9IGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0TGlzdEl0ZW1JbmRleChpdGVtOiBMaXN0SXRlbURpcmVjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0SXRlbXMudG9BcnJheSgpLmluZGV4T2YoaXRlbSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIGZvcm0gb3RoZXIgZGF0YSB3aWRnZXRzIGxpa2UgdGFibGUuXG4gICAgcHVibGljIGV4ZWN1dGUob3BlcmF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChbRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFLCBEYXRhU291cmNlLk9wZXJhdGlvbi5JU19QQUdFQUJMRSwgRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfU0VSVkVSX0ZJTFRFUl0uaW5jbHVkZXMob3BlcmF0aW9uKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFzb3VyY2UuZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBoYW5kbGVLZXlEb3duKCRldmVudCwgYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCBsaXN0SXRlbXM6IFF1ZXJ5TGlzdDxMaXN0SXRlbURpcmVjdGl2ZT4gPSB0aGlzLmxpc3RJdGVtcztcblxuICAgICAgICBsZXQgcHJlc2VudEluZGV4OiBudW1iZXIgPSB0aGlzLmdldExpc3RJdGVtSW5kZXgodGhpcy5sYXN0U2VsZWN0ZWRJdGVtKTtcblxuICAgICAgICBpZiAodGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgY29uc3QgZmlyc3RJbmRleDogbnVtYmVyID0gdGhpcy5nZXRMaXN0SXRlbUluZGV4KHRoaXMuZmlyc3RTZWxlY3RlZEl0ZW0pO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0Q291bnQ6IG51bWJlciA9IF8uaXNBcnJheSh0aGlzLnNlbGVjdGVkaXRlbSkgPyB0aGlzLnNlbGVjdGVkaXRlbS5sZW5ndGggOiAoXy5pc09iamVjdCh0aGlzLnNlbGVjdGVkaXRlbSkgPyAxIDogMCk7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnc2VsZWN0UHJldicpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJlc2VudEluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHByZXNlbnRJbmRleCA8PSBmaXJzdEluZGV4KSAmJiB0aGlzLmNoZWNrU2VsZWN0aW9uTGltaXQoc2VsZWN0Q291bnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEl0ZW0gPSB0aGlzLmdldExpc3RJdGVtQnlJbmRleCggcHJlc2VudEluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RJdGVtU2VsZWN0aW9uKHRoaXMubGFzdFNlbGVjdGVkSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJlc2VudEluZGV4ID4gZmlyc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0SXRlbVNlbGVjdGlvbih0aGlzLmdldExpc3RJdGVtQnlJbmRleChwcmVzZW50SW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSXRlbSA9IHRoaXMuZ2V0TGlzdEl0ZW1CeUluZGV4KHByZXNlbnRJbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3Rpb25saW1pdGV4Y2VlZCcsIHskZXZlbnR9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnc2VsZWN0TmV4dCcpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJlc2VudEluZGV4IDwgbGlzdEl0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChwcmVzZW50SW5kZXggPj0gZmlyc3RJbmRleCkgJiYgdGhpcy5jaGVja1NlbGVjdGlvbkxpbWl0KHNlbGVjdENvdW50KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWRJdGVtID0gdGhpcy5nZXRMaXN0SXRlbUJ5SW5kZXgocHJlc2VudEluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RJdGVtU2VsZWN0aW9uKHRoaXMubGFzdFNlbGVjdGVkSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJlc2VudEluZGV4IDwgZmlyc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0SXRlbVNlbGVjdGlvbih0aGlzLmdldExpc3RJdGVtQnlJbmRleChwcmVzZW50SW5kZXgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSXRlbSA9IHRoaXMuZ2V0TGlzdEl0ZW1CeUluZGV4KHByZXNlbnRJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3Rpb25saW1pdGV4Y2VlZCcsIHskZXZlbnR9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uID09PSAnZm9jdXNQcmV2Jykge1xuICAgICAgICAgICAgcHJlc2VudEluZGV4ID0gcHJlc2VudEluZGV4IDw9IDAgPyAwIDogKHByZXNlbnRJbmRleCAtIDEpO1xuICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWRJdGVtID0gdGhpcy5nZXRMaXN0SXRlbUJ5SW5kZXgocHJlc2VudEluZGV4KTtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGVkSXRlbS5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnZm9jdXNOZXh0Jykge1xuICAgICAgICAgICAgcHJlc2VudEluZGV4ID0gcHJlc2VudEluZGV4IDwgKGxpc3RJdGVtcy5sZW5ndGggLSAxKSA/IChwcmVzZW50SW5kZXggKyAxKSA6IChsaXN0SXRlbXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEl0ZW0gPSB0aGlzLmdldExpc3RJdGVtQnlJbmRleChwcmVzZW50SW5kZXgpO1xuICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0ZWRJdGVtLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3Rpb24gPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgZW50ZXIgY2xpY2sgaXMgcHJlc3NlZCBvbiB0aGUgaXRlbSB3aGljaCBpcyBub3QgdGhlIGxhc3Qgc2VsZWN0ZWQgaXRlbSwgdGhlIGZpbmQgdGhlIGl0ZW0gZnJvbSB3aGljaCB0aGUgZXZlbnQgaXMgb3JpZ2luYXRlZC5cbiAgICAgICAgICAgIGlmIChwcmVzZW50SW5kZXggPT09IC0xIHx8ICEkKCRldmVudC50YXJnZXQpLmNsb3Nlc3QodGhpcy5sYXN0U2VsZWN0ZWRJdGVtLm5hdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgJGxpID0gJCgkZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdsaS5hcHAtbGlzdC1pdGVtJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgJHVsID0gJGxpLmNsb3Nlc3QoJ3VsLmFwcC1saXZlbGlzdC1jb250YWluZXInKTtcbiAgICAgICAgICAgICAgICBwcmVzZW50SW5kZXggPSAkdWwuZmluZCgnbGkuYXBwLWxpc3QtaXRlbScpLmluZGV4KCRsaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uSXRlbUNsaWNrKCRldmVudCwgdGhpcy5nZXRMaXN0SXRlbUJ5SW5kZXgocHJlc2VudEluZGV4KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIGlmICghbnYgJiYgdGhpcy5iaW5kZGF0YXNvdXJjZSAmJiAhdGhpcy5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRhdGFTZXRDaGFuZ2UobnYpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2RhdGFzb3VyY2UnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkRhdGFTZXRDaGFuZ2UodGhpcy5kYXRhc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICduYXZpZ2F0aW9uJykge1xuICAgICAgICAgICAgLy8gU3VwcG9ydCBmb3Igb2xkZXIgcHJvamVjdHMgd2hlcmUgbmF2aWdhdGlvbiB0eXBlIHdhcyBhZHZhbmNlZCBpbnN0ZWFkIG9mIGNsYXNzaWNcbiAgICAgICAgICAgIGlmIChudiA9PT0gJ0FkdmFuY2VkJykge1xuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvbiA9ICdDbGFzc2ljJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2hDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgICAgICB0aGlzLm9uTmF2aWdhdGlvblR5cGVDaGFuZ2UobnYpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YU5hdmlnYXRvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci5uYXZpZ2F0aW9uQ2xhc3MgPSB0aGlzLnBhZ2luYXRpb25jbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdpdGVtc3BlcnJvdycpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TGlzdENsYXNzKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncHVsbHRvcmVmcmVzaCcgJiYgbnYpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeSgncHVsbFRvUmVmcmVzaDplbmFibGUnKTtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlVG9QdWxsVG9SZWZyZXNoKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncGFnaW5hdGlvbmNsYXNzJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YU5hdmlnYXRvcikge1xuICAgICAgICAgICAgICAgIC8vIEFkZGluZyBzZXRUaW1lb3V0IGJlY2F1c2UgaW4gcGFnaW5hdGlvbiBjb21wb25lbnQgdXBkYXRlTmF2U2l6ZSBtZXRob2QgaXMgb3ZlcnJpZGluZyBuYXZpZ2F0aW9uY2xhc3NcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB0aGlzLmRhdGFOYXZpZ2F0b3IubmF2aWdhdGlvbkNsYXNzID0gbnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25JdGVtQ2xpY2soZXZ0OiBhbnksICRsaXN0SXRlbTogTGlzdEl0ZW1EaXJlY3RpdmUpIHtcbiAgICAgICAgbGV0IHNlbGVjdENvdW50OiBudW1iZXI7XG5cbiAgICAgICAgaWYgKCEkbGlzdEl0ZW0uZGlzYWJsZUl0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RTZWxlY3RlZEl0ZW0gPSB0aGlzLmZpcnN0U2VsZWN0ZWRJdGVtIHx8ICRsaXN0SXRlbTtcbiAgICAgICAgICAgIC8vIFNldHRpbmcgc2VsZWN0Q291bnQgdmFsdWUgYmFzZWQgbnVtYmVyIG9mIGl0ZW1zIHNlbGVjdGVkLlxuICAgICAgICAgICAgc2VsZWN0Q291bnQgPSBfLmlzQXJyYXkodGhpcy5zZWxlY3RlZGl0ZW0pID8gdGhpcy5zZWxlY3RlZGl0ZW0ubGVuZ3RoIDogKF8uaXNPYmplY3QodGhpcy5zZWxlY3RlZGl0ZW0pID8gMSA6IDApO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGluZyBtdWx0aXNlbGVjdCBmb3IgbW9iaWxlIGFwcGxpY2F0aW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMubXVsdGlzZWxlY3QgJiYgaXNNb2JpbGVBcHAoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrU2VsZWN0aW9uTGltaXQoc2VsZWN0Q291bnQpIHx8ICRsaXN0SXRlbS5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RJdGVtU2VsZWN0aW9uKCRsaXN0SXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3Rpb25saW1pdGV4Y2VlZCcsIHskZXZlbnQ6IGV2dH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGV2dC5jdHJsS2V5IHx8IGV2dC5tZXRhS2V5KSAmJiB0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tTZWxlY3Rpb25MaW1pdChzZWxlY3RDb3VudCkgfHwgJGxpc3RJdGVtLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyc3RTZWxlY3RlZEl0ZW0gPSB0aGlzLmxhc3RTZWxlY3RlZEl0ZW0gPSAkbGlzdEl0ZW07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdEl0ZW1TZWxlY3Rpb24oJGxpc3RJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdGlvbmxpbWl0ZXhjZWVkJywgeyRldmVudDogZXZ0fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChldnQuc2hpZnRLZXkgJiYgdGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgICAgIGxldCBmaXJzdCA9ICRsaXN0SXRlbS5jb250ZXh0LmluZGV4O1xuICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gdGhpcy5maXJzdFNlbGVjdGVkSXRlbS5jb250ZXh0LmluZGV4O1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgZmlyc3QgaXMgZ3JlYXRlciB0aGFuIGxhc3QsIHRoZW4gc3dhcCB2YWx1ZXNcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3QgPiBsYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBbZmlyc3QsIGZpcnN0ID0gbGFzdF1bMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrU2VsZWN0aW9uTGltaXQobGFzdCAtIGZpcnN0KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyU2VsZWN0ZWRJdGVtcygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RJdGVtcy5mb3JFYWNoKCgkbGlJdGVtOiBMaXN0SXRlbURpcmVjdGl2ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSAkbGlJdGVtLmNvbnRleHQuaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gZmlyc3QgJiYgaW5kZXggPD0gbGFzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdEl0ZW1TZWxlY3Rpb24oJGxpSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3RlZEl0ZW0gPSAkbGlzdEl0ZW07XG4gICAgICAgICAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0aW9ubGltaXRleGNlZWQnLCB7JGV2ZW50OiBldnR9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkbGlzdEl0ZW0uaXNBY3RpdmUgfHwgc2VsZWN0Q291bnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3RlZEl0ZW1zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdEl0ZW1TZWxlY3Rpb24oJGxpc3RJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJzdFNlbGVjdGVkSXRlbSA9IHRoaXMubGFzdFNlbGVjdGVkSXRlbSA9ICRsaXN0SXRlbTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFbXB0eSB0aGUgbGlzdCBjb250ZW50IG9uIGNsZWFyXG4gICAgcHVibGljIGNsZWFyICgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVGaWVsZERlZnMoW10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBSZXR1cm5zIExpc3RJdGVtIFJlZmVyZW5jZSBiYXNlZCBvbiB0aGUgaW5wdXQgcHJvdmlkZWQuXG4gICAgICogQHBhcmFtIHZhbDogaW5kZXggfCBtb2RlbCBvZiB0aGUgbGlzdCBpdGVtLlxuICAgICAqIEByZXR1cm5zIHtMaXN0SXRlbURpcmVjdGl2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEl0ZW1SZWZCeUluZGV4T3JNb2RlbCh2YWw6IGFueSk6IExpc3RJdGVtRGlyZWN0aXZlIHtcbiAgICAgICAgbGV0IGxpc3RJdGVtOiBMaXN0SXRlbURpcmVjdGl2ZTtcbiAgICAgICAgaWYgKGlzTnVtYmVyKHZhbCkpIHtcbiAgICAgICAgICAgIGxpc3RJdGVtID0gdGhpcy5nZXRMaXN0SXRlbUJ5SW5kZXgodmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpc3RJdGVtID0gdGhpcy5nZXRMaXN0SXRlbUJ5TW9kZWwodmFsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdEl0ZW07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZGVzZWxlY3RzIGl0ZW0gaW4gdGhlIGxpc3QuXG4gICAgICogQHBhcmFtIHZhbDogaW5kZXggfCBtb2RlbCBvZiB0aGUgbGlzdCBpdGVtLlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdEl0ZW0gKHZhbDogYW55KSB7XG4gICAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5nZXRJdGVtUmVmQnlJbmRleE9yTW9kZWwodmFsKTtcbiAgICAgICAgaWYgKGxpc3RJdGVtICYmIGxpc3RJdGVtLmlzQWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RJdGVtU2VsZWN0aW9uKGxpc3RJdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNlbGVjdHMgaXRlbSBpbiB0aGUgbGlzdC5cbiAgICAgKiBAcGFyYW0gdmFsOiBpbmRleCB8IG1vZGVsIG9mIHRoZSBsaXN0IGl0ZW0uXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdEl0ZW0odmFsKSB7XG4gICAgICAgIGNvbnN0IGxpc3RJdGVtID0gdGhpcy5nZXRJdGVtUmVmQnlJbmRleE9yTW9kZWwodmFsKTtcbiAgICAgICAgaWYgKCFsaXN0SXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbGlzdEl0ZW0uaXNBY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdEl0ZW1TZWxlY3Rpb24obGlzdEl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZvY3VzIHRoZSBlbGVtZW50LlxuICAgICAgICBsaXN0SXRlbS5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiZWZvcmVQYWdpbmF0aW9uQ2hhbmdlKCRldmVudCwgJGluZGV4KSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncGFnaW5hdGlvbmNoYW5nZScsIHskZXZlbnQsICRpbmRleH0pO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50Q2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICAvLyB0YXAgYW5kIGRvdWJsZVRhcCBldmVudHMgYXJlIG5vdCBnZXR0aW5nIHByb3BhZ2F0ZWQuU28sIHVzaW5nIG1vdXNlIGV2ZW50cyBpbnN0ZWFkLlxuICAgICAgICBjb25zdCB0b3VjaFRvTW91c2UgPSB7XG4gICAgICAgICAgICB0YXA6ICdjbGljaycsXG4gICAgICAgICAgICBkb3VibGV0YXA6ICdkYmxjbGljaydcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoWydjbGljaycsICd0YXAnLCAnZGJsY2xpY2snLCAnZG91YmxldGFwJ10sIGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LFxuICAgICAgICAgICAgICAgIHRvdWNoVG9Nb3VzZVtldmVudE5hbWVdIHx8IGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICAoZXZ0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9ICQoZXZ0LnRhcmdldCkuY2xvc2VzdCgnLmFwcC1saXN0LWl0ZW0nKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RJdGVtQ29udGV4dDogTGlzdEl0ZW1EaXJlY3RpdmUgPSB0YXJnZXQuZGF0YSgnbGlzdEl0ZW1Db250ZXh0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWxpc3RJdGVtQ29udGV4dC5kaXNhYmxlSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjayhldmVudE5hbWUsIHt3aWRnZXQ6IGxpc3RJdGVtQ29udGV4dCwgJGV2ZW50OiBldnQsIGl0ZW06IGxpc3RJdGVtQ29udGV4dC5pdGVtfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIHRoZSBkYXRhc291cmNlIHZhcmlhYmxlIGJ5IGRlZmF1bHQgd2hlbiBwdWxsdG9yZWZyZXNoIGV2ZW50IGlzIG5vdCBzcGVjaWZpZWQuXG4gICAgcHJpdmF0ZSBzdWJzY3JpYmVUb1B1bGxUb1JlZnJlc2goKSB7XG4gICAgICAgIHRoaXMuY2FuY2VsU3Vic2NyaXB0aW9uID0gdGhpcy5hcHAuc3Vic2NyaWJlKCdwdWxsdG9yZWZyZXNoJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNvdXJjZSAmJiB0aGlzLmRhdGFzb3VyY2UubGlzdFJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFzb3VyY2UubGlzdFJlY29yZHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMuaGFuZGxlSGVhZGVyQ2xpY2sgPSBub29wO1xuICAgICAgICB0aGlzLl9pdGVtcyA9IFtdO1xuICAgICAgICB0aGlzLmZpZWxkRGVmcyA9IFtdO1xuICAgICAgICAvLyBXaGVuIHBhZ2luYXRpb24gaXMgaW5maW5pdGUgc2Nyb2xsIGRhdGFzZXQgaXMgYXBwbHlpbmcgYWZ0ZXIgZGVib3VuY2UgdGltZSgyNTBtcykgc28gbWFraW5nIG5leHQgY2FsbCBhZnRlciBwcmV2aW91cyBkYXRhIGhhcyByZW5kZXJlZFxuICAgICAgICB0aGlzLmRlYm91bmNlZEZldGNoTmV4dERhdGFzZXRPblNjcm9sbCA9IF8uZGVib3VuY2UodGhpcy5mZXRjaE5leHREYXRhc2V0T25TY3JvbGwsIERFQk9VTkNFX1RJTUVTLlBBR0lOQVRJT05fREVCT1VOQ0VfVElNRSk7XG4gICAgICAgIHRoaXMucmVvcmRlclByb3BzID0ge1xuICAgICAgICAgICAgbWluSW5kZXg6IG51bGwsXG4gICAgICAgICAgICBtYXhJbmRleDogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgdGhpcy5wcm9taXNlUmVzb2x2ZXJGbigpO1xuICAgICAgICB0aGlzLnByb3BzSW5pdFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtV2lkZ2V0cyA9IHRoaXMubXVsdGlzZWxlY3QgPyBbXSA6IHt9O1xuICAgICAgICAgICAgaWYgKHRoaXMuZW5hYmxlcmVvcmRlciAmJiAhdGhpcy5ncm91cGJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVEbkQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmdyb3VwYnkgJiYgdGhpcy5jb2xsYXBzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlSGVhZGVyQ2xpY2sgPSBoYW5kbGVIZWFkZXJDbGljaztcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUFsbEhlYWRlcnMgPSB0b2dnbGVBbGxIZWFkZXJzLmJpbmQodW5kZWZpbmVkLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0TGlzdENsYXNzKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldHVwSGFuZGxlcnMoKTtcbiAgICAgICAgY29uc3QgJHVsID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3VsLmFwcC1saXZlbGlzdC1jb250YWluZXInKTtcbiAgICAgICAgc3R5bGVyKCR1bCBhcyBIVE1MRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0NST0xMQUJMRV9DT05UQUlORVIpO1xuXG4gICAgICAgIGlmIChpc01vYmlsZUFwcCgpICYmICR1bC5xdWVyeVNlbGVjdG9yKCcuYXBwLWxpc3QtaXRlbS1hY3Rpb24tcGFuZWwnKSkge1xuICAgICAgICAgICAgdGhpcy5fbGlzdEFuaW1hdG9yID0gbmV3IExpc3RBbmltYXRvcih0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5fbGlzdEFuaW1hdG9yICYmIHRoaXMuX2xpc3RBbmltYXRvci4kYnRuU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0QW5pbWF0b3IuJGJ0blN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNhbmNlbFN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jYW5jZWxTdWJzY3JpcHRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==