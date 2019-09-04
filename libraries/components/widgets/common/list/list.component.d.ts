import { AfterViewInit, ChangeDetectorRef, ElementRef, Injector, NgZone, OnDestroy, OnInit, QueryList, TemplateRef } from '@angular/core';
import { App, AppDefaults } from '@wm/core';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { StylableComponent } from '../base/stylable.component';
import { ListItemDirective } from './list-item.directive';
import { WidgetRef } from '../../framework/types';
export declare class ListComponent extends StylableComponent implements OnInit, AfterViewInit, OnDestroy {
    static initializeProps: void;
    listTemplate: TemplateRef<ElementRef>;
    listLeftActionTemplate: TemplateRef<ElementRef>;
    listRightActionTemplate: TemplateRef<ElementRef>;
    btnComponents: any;
    dataNavigator: any;
    listItems: QueryList<ListItemDirective>;
    private itemsPerRowClass;
    private firstSelectedItem;
    private navigatorMaxResultWatch;
    private navigatorResultWatch;
    private navControls;
    private onDemandLoad;
    private _items;
    private dataNavigatorWatched;
    private datasource;
    private showNavigation;
    noDataFound: boolean;
    private debouncedFetchNextDatasetOnScroll;
    private reorderProps;
    private app;
    private appDefaults;
    private ngZone;
    lastSelectedItem: ListItemDirective;
    fieldDefs: Array<any>;
    disableitem: any;
    navigation: string;
    navigationalign: string;
    pagesize: number;
    dataset: any;
    multiselect: boolean;
    selectfirstitem: boolean;
    orderby: string;
    loadingicon: string;
    paginationclass: string;
    ondemandmessage: string;
    loadingdatamsg: string;
    selectionlimit: number;
    infScroll: boolean;
    enablereorder: boolean;
    itemsperrow: string;
    itemclass: string;
    selectedItemWidgets: Array<WidgetRef> | WidgetRef;
    variableInflight: any;
    name: any;
    handleHeaderClick: Function;
    toggleAllHeaders: void;
    groupby: string;
    collapsible: string;
    datePipe: ToDatePipe;
    binditemclass: string;
    binddisableitem: string;
    binddataset: string;
    private binddatasource;
    mouseEnterCB: string;
    mouseLeaveCB: string;
    private match;
    private dateformat;
    private groupedData;
    private cdRef;
    private promiseResolverFn;
    private propsInitPromise;
    private $ulEle;
    private _listAnimator;
    pulltorefresh: boolean;
    private cancelSubscription;
    title: string;
    subheading: string;
    iconclass: string;
    listclass: any;
    private isDataChanged;
    selecteditem: any;
    /**
     * Returns list of widgets present on list item by considering name and index of the widget.
     * If we did'nt pass index, it returns array of all the widgets which are matching to widget name
     * @param widgteName: Name of the widget
     * @param index: Index of the widget
     */
    getWidgets(widgteName: string, index: number): any[];
    getItem(index: number): ListItemDirective;
    getIndex(item: ListItemDirective): number;
    constructor(inj: Injector, cdRef: ChangeDetectorRef, datePipe: ToDatePipe, app: App, appDefaults: AppDefaults, ngZone: NgZone, binditemclass: string, binddisableitem: string, binddataset: string, binddatasource: string, mouseEnterCB: string, mouseLeaveCB: string);
    handleLoading(data: any): void;
    private resetNavigation;
    private enableBasicNavigation;
    private enableInlineNavigation;
    private enableClassicNavigation;
    private enablePagerNavigation;
    private setNavigationTypeNone;
    private enableInfiniteScroll;
    private enableOnDemandLoad;
    private setListClass;
    /**
     * Sets Navigation type for the list.
     * @param type
     */
    private onNavigationTypeChange;
    private fetchNextDatasetOnScroll;
    private setIscrollHandlers;
    private bindIScrollEvt;
    private bindScrollEvt;
    /**
     * Update fieldDefs property, fieldDefs is the model of the List Component.
     * fieldDefs is an Array type.
     * @param newVal
     */
    private updateFieldDefs;
    private onDataChange;
    private setupDataSource;
    private onDataSetChange;
    private deselectListItems;
    private clearSelectedItems;
    /**
     * return the ListItemDirective instance by checking the equality of the model.
     * @param listModel: model to be searched for
     * @returns ListItem if the model is matched else return null.
     */
    private getListItemByModel;
    private updateSelectedItemsWidgets;
    /**
     * Selects the listItem and updates selecteditem property.
     * If the listItem is already a selected item then deselects the item.
     * @param {ListItemDirective} $listItem: Item to be selected of deselected.
     */
    private toggleListItemSelection;
    /**
     * Method is Invoked when the model for the List Widget is changed.
     * @param {QueryList<ListItemDirective>} listItems
     */
    private onListRender;
    triggerListItemSelection($el: JQuery<HTMLElement>, $event: Event): void;
    private setupHandlers;
    private onReorderStart;
    private onUpdate;
    private configureDnD;
    private checkSelectionLimit;
    private getListItemByIndex;
    /**
     * return index of an (listItemDirective) in the listItem
     * @param {ListItemDirective} item
     * @returns {number}
     */
    private getListItemIndex;
    execute(operation: any, options: any): any;
    handleKeyDown($event: any, action: string): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    onItemClick(evt: any, $listItem: ListItemDirective): void;
    clear(): void;
    /**
     *  Returns ListItem Reference based on the input provided.
     * @param val: index | model of the list item.
     * @returns {ListItemDirective}
     */
    private getItemRefByIndexOrModel;
    /**
     * deselects item in the list.
     * @param val: index | model of the list item.
     */
    deselectItem(val: any): void;
    /**
     * selects item in the list.
     * @param val: index | model of the list item.
     */
    selectItem(val: any): void;
    private beforePaginationChange;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    private subscribeToPullToRefresh;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
}
