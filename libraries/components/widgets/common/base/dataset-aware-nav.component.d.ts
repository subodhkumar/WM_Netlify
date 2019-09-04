import { Injector } from '@angular/core';
import { StylableComponent } from './stylable.component';
export declare class DatasetAwareNavComponent extends StylableComponent {
    nodes: Array<NavNode>;
    dataset: any;
    itemicon: string;
    itemlabel: string;
    itemlink: string;
    itemtarget: string;
    itembadge: string;
    itemchildren: string;
    itemaction: string;
    itemclass: string;
    itemid: string;
    userrole: string;
    orderby: string;
    datafield: string;
    displayfield: string;
    private _itemFieldMap;
    private binditemlabel;
    private binditemicon;
    private binditemaction;
    private binditembadge;
    private binditemchildren;
    private binditemlink;
    private binditemtarget;
    private binduserrole;
    private securityService;
    protected binditemid: string | null;
    constructor(inj: Injector, WIDGET_CONFIG: any);
    /**
     * constructs individual node for the widget model.
     * @param fields
     * @param node
     */
    private getNode;
    resetItemFieldMap(): void;
    getItemFieldsMap(): any;
    /**
     * returns array for the value passed as nv.
     * nv: 'a,b' => [{label:a, value:a}, {label:b, value:b}]
     * nv: [1,2] => [{label:1, value:1}, {label:2, value:2}]
     * nv: [{obj}, {obj}] => [{obj}, {obj}]
     * @param nv
     */
    private prepareNodeDataSet;
    /**
     * constructs dataset form the nav elements.
     */
    private getNodes;
    protected resetNodes(): void;
    private _resetNodes;
    onPropertyChange(key: any, nv: any, ov: any): void;
}
export interface NavNode {
    label: string;
    action?: any;
    badge?: string;
    children?: Array<NavNode>;
    class?: string;
    disabled?: boolean;
    icon?: string;
    id?: string;
    link?: string;
    role?: string;
    value?: any;
}
