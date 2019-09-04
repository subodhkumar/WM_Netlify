import { AfterContentInit, AfterViewInit, Injector, OnDestroy, OnInit } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { ChangeListener, IWidgetConfig } from '../../framework/types';
export declare abstract class BaseComponent implements OnDestroy, OnInit, AfterViewInit, AfterContentInit {
    protected inj: Injector;
    /**
     * unique identifier for the widget
     */
    readonly widgetId: any;
    isDestroyed: boolean;
    /**
     * jQuery nativeElement reference of the component root
     */
    readonly $element: any;
    /**
     * DOM node reference of the component root
     */
    protected readonly nativeElement: HTMLElement;
    /**
     * Type of the component
     */
    protected readonly widgetType: string;
    /**
     * Most of the cases it is same as widgetType
     * for specific widgets like charts widgetType can be wm-chart where as the subtype can be wm-bar-chart
     */
    protected readonly widgetSubType: string;
    /**
     * Proxy for the component instance.
     */
    protected widget: any;
    /**
     * View parent component
     * eg, Page, Partial, Prefab
     */
    protected readonly viewParent: any;
    /**
     * EventManger to add/remove events
     */
    protected readonly eventManager: EventManager;
    /**
     * App Locale
     */
    readonly appLocale: any;
    /**
     * Style change subject and observable
     */
    private readonly styleChange;
    /**
     * Property change subject and observable
     */
    private readonly propertyChange;
    /**
     * On Ready State change subject and observable
     */
    private readonly readyState;
    /**
     * Component destroy subject and observable
     */
    private readonly destroy;
    /**
     * Map of event handler callbacks
     */
    private eventHandlers;
    /**
     * context of the widget
     * when the widget is preset inside a repeater this context will have the repeater related properties
     */
    context: any;
    /**
     * Initial state of the widget.
     * Will be undefined once the initial properties are set on to the component
     */
    private initState;
    /**
     * Internal flag to determine whether to wait for the widget initialization or not
     * If the initPromise is provided in the construction wait till the promise is resolved
     * If the initPromise is not provided proceed with the initialization, which is the default behavior.
     */
    private readonly delayedInit;
    /**
     * Display type of the component. eg, block(Default), inline-block, inline etc
     */
    private readonly displayType;
    /**
     * Holds the event registration functions.
     * these functions needs to be executed after onViewInit
     */
    private toBeSetupEventsQueue;
    __cloneable__: boolean;
    widgetProps: Map<string, any>;
    private $attrs;
    protected constructor(inj: Injector, config: IWidgetConfig, initPromise?: Promise<any>);
    getNativeElement(): HTMLElement;
    getWidgetType(): string;
    getWidgetSubType(): string;
    getWidget(): any;
    getViewParent(): any;
    notifyStyleChange(key: string, nv: any, ov: any): void;
    notifyPropertyChange(key: string, nv: any, ov: any): void;
    registerStyleChangeListener(fn: ChangeListener, ctx?: any): void;
    registerReadyStateListener(fn: Function, ctx?: any): void;
    registerPropertyChangeListener(fn: ChangeListener, ctx?: any): void;
    registerDestroyListener(fn: Function, ctx?: any): void;
    getDisplayType(): string;
    protected createProxy(): any;
    protected initContext(): void;
    /**
     * set the value on the proxy object ie, widget
     * setting the property on the proxy will invoke the change listeners
     * @param {string} key
     * @param value
     */
    setWidgetProperty(key: string, value: any): void;
    getAttr(attrName: string): string;
    /**
     * returns app instance
     * @returns {App}
     */
    getAppInstance(): any;
    /**
     * Generates a unique id
     * Default pattern is `widget-id-${id}`
     * Components can override this method to generate a different id eg, bar-chart-1
     */
    protected generateWidgetId(): string;
    /**
     * Handles the common functionality across the components
     * eg,
     *  1. value of the class property will be applied on the host element
     *  2. based on the value of show property component is shown/hidden
     *
     * @param {string} key
     * @param nv
     * @param ov
     */
    protected onPropertyChange(key: string, nv: any, ov?: any): void;
    /**
     * Default style change handler
     */
    protected onStyleChange(k: string, nv: any, ov?: any): void;
    /**
     * Register the widget with the widgetRegistry
     */
    protected registerWidget(widgetName: string): void;
    /**
     * override the
     */
    protected getMappedEventName(eventName: any): any;
    /**
     * invoke the event handler
     * Components can override this method to execute custom logic before invoking the user callback
     */
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any, meta?: string): void;
    /**
     * parse the event expression and save reference to the function inside eventHandlers map
     * If the component provides a override for an event through @Event decorator invoke that
     * else invoke the resolved function
     *
     * @param {string} eventName
     * @param {string} expr
     */
    protected processEventAttr(eventName: string, expr: string, meta?: string): void;
    /**
     * Process the bound property
     * Register a watch on the bound expression
     */
    protected processBindAttr(propName: string, expr: string): void;
    /**
     * Remove watch on the bound property
     */
    protected removePropertyBinding(propName: string): void;
    /**
     * invoke the event callback method
     * @param {string} eventName
     * @param extraLocals
     */
    invokeEventCallback(eventName: string, extraLocals?: any): any;
    /**
     * Process the attribute
     * If the attribute is an event expression, generate a functional representation of the expression
     *      and keep in eventHandlers
     * If the attribute is a bound expression, register a watch on the expression
     */
    protected processAttr(attrName: string, attrValue: string): void;
    /**
     * Process the attributes
     */
    private processAttrs;
    /**
     * Update the initState with the default property values and the values provided in the markup
     * Process the attributes
     * Register the widget
     */
    protected initWidget(): void;
    /**
     * Update the default properties and the properties provided in the markup in component
     * Invoking this method will result in invocation of propertyChange handlers on the component for the first time
     */
    protected setInitProps(): void;
    /**
     * Returns true, if a listener registered for the given event on this widget markup.
     * @param eventName
     * @returns {boolean}
     */
    protected hasEventCallback(eventName: any): boolean;
    /**
     * Sets the focus on the widget
     */
    protected focus(): void;
    protected execute(operation: any, options: any): any;
    /**
     * nativeElement will be available by this time
     * if the delayInit is false, properties meta will be available by this time
     * Invoke the setInitProps if the delayInit is false
     */
    ngOnInit(): void;
    /**
     * Register the events
     */
    ngAfterViewInit(): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
}
