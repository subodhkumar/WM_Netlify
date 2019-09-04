import { Injector, OnInit } from '@angular/core';
import { AppDefaults } from '@wm/core';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
export declare class CheckboxsetComponent extends DatasetAwareFormComponent implements OnInit {
    groupby: string;
    private appDefaults;
    datePipe: ToDatePipe;
    static initializeProps: void;
    layout: string;
    collapsible: boolean;
    protected match: string;
    protected dateformat: string;
    protected groupedData: any[];
    handleHeaderClick: ($event: any) => void;
    private toggleAllHeaders;
    disabled: boolean;
    constructor(inj: Injector, groupby: string, appDefaults: AppDefaults, datePipe: ToDatePipe);
    onCheckboxLabelClick($event: any, key: any): void;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    private getGroupedData;
    private datasetSubscription;
    onPropertyChange(key: any, nv: any, ov?: any): void;
    ngOnInit(): void;
}
