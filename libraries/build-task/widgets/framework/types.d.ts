import { InjectionToken } from '@angular/core';
import { BaseComponent } from '../common/base/base.component';
export interface IWidgetConfig {
    widgetType: string;
    widgetSubType?: string;
    hostClass?: string;
    displayType?: string;
}
export interface IRedrawableComponent {
    redraw: Function;
}
export declare type ChangeListener = (key: string, nv: any, ov?: any) => void;
export declare abstract class WidgetRef {
}
export declare abstract class DialogRef<T extends BaseComponent> {
    bsModal: any;
}
export declare const Context: InjectionToken<{}>;
export interface IDialog {
    open: (initState?: any) => void;
    close: () => void;
}
