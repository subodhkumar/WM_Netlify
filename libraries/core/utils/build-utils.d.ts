import { Element } from '@angular/compiler';
export declare const getFormWidgetTemplate: (widgetType: string, innerTmpl: string, attrs?: Map<string, string>, options?: any) => any;
export declare const updateTemplateAttrs: (rootNode: Element | Element[], parentDataSet: string, widgetName: string, instance?: string, referenceName?: string) => void;
export declare const getNgModelAttr: (attrs: any) => "" | "ngModel";
export declare const getRowActionAttrs: (attrs: any) => string;
