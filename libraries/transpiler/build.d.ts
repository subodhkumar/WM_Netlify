import { Element, Text, Comment } from '@angular/compiler';
interface IProviderInfo {
    nodeName: string;
    provide: Map<string, any>;
}
export declare const getBoundToExpr: (value: string) => string;
export declare const getDataSource: (dataSetExpr: string) => string;
export declare const getFormMarkupAttr: (attrs: any) => string;
export declare const getAttrMarkup: (attrs: Map<string, string>) => string;
export declare const processNode: (node: any, providers?: IProviderInfo[]) => string;
export declare const transpile: (markup?: string) => string;
export declare const register: (nodeName: string, nodeDefFn: () => IBuildTaskDef) => Map<string, any>;
export interface IBuildTaskDef {
    requires?: string | Array<string>;
    template?: (node: Element | Text | Comment, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => void;
    pre: (attrs: Map<string, string>, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
    provide?: (attrs: Map<string, string>, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => Map<any, any>;
    post?: (attrs: Map<string, string>, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
}
export declare const scopeComponentStyles: (componentName: any, componentType: any, styles?: string) => string;
export {};
