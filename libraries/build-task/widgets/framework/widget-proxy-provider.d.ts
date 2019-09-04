import { BaseComponent } from '../common/base/base.component';
/**
 *  proxy handler for the components
 */
export declare const proxyHandler: {
    set: (target: BaseComponent, key: string, value: any) => boolean;
    get: (target: BaseComponent, key: string) => any;
};
export declare class WidgetProxyProvider {
    static create(instance: BaseComponent, widgetSubType: string, propsByWidgetSubType: Map<string, any>): any;
}
