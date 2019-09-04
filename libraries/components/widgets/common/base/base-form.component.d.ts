import { Injector } from '@angular/core';
import { StylableComponent } from './stylable.component';
import { IWidgetConfig } from '../../framework/types';
export declare abstract class BaseFormComponent extends StylableComponent {
    protected inj: Injector;
    datavalue: any;
    private prevDatavalue;
    protected binddatavalue: string;
    private datavaluesource;
    protected constructor(inj: Injector, config: IWidgetConfig, initPromise?: Promise<any>);
    /**
     * Responsible for updating the variable bound to the widget's datavalue property.
     * @param value
     */
    updateBoundVariable(value: any): void;
    protected invokeOnChange(value: any, $event?: Event): void;
    protected updatePrevDatavalue(val: any): void;
}
