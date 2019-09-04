/**
 * returns the widget by the given widgetId
 */
export declare const getById: (widgetId: string) => any;
/**
 * Registers the Widget with the given id and name
 * Makes the Widget available with the viewParent
 * returns unRegister method
 */
export declare const register: (widget: any, viewParent: any, widgetId: string, name?: string) => () => void;
/**
 * Deregisters the oldname in widgets registry and sets new name
 */
export declare const renameWidget: (viewParent: any, widget: any, nv: string, ov?: string) => void;
