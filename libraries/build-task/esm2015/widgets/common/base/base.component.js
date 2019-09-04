import { ElementRef } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { ReplaySubject, Subject } from 'rxjs';
import { $invokeWatchers, $parseEvent, $unwatch, $watch, addClass, setCSS, setCSSFromObj, App, isDefined, removeAttr, removeClass, setAttr, switchClass } from '@wm/core';
import { getWidgetPropsByType } from '../../framework/widget-props';
import { isStyle } from '../../framework/styler';
import { register, renameWidget } from '../../framework/widget-registry';
import { Context } from '../../framework/types';
import { widgetIdGenerator } from '../../framework/widget-id-generator';
import { DISPLAY_TYPE, EVENTS_MAP } from '../../framework/constants';
import { WidgetProxyProvider } from '../../framework/widget-proxy-provider';
import { getWatchIdentifier } from '../../../utils/widget-utils';
// Gets list of classes to add and remove and applies on the $el
const updateClasses = (toAdd, toRemove, el) => {
    if (toRemove && toRemove.length) {
        removeClass(el, _.join(toRemove, ' '));
    }
    if (toAdd && toAdd.length) {
        addClass(el, _.join(toAdd, ' '));
    }
};
const ɵ0 = updateClasses;
// To add and remove styles on the $el
const updateStyles = (nv, ov, el) => {
    if (ov && _.isObject(ov)) {
        const keys = Object.keys(ov || {});
        keys.forEach(function (key) {
            setCSS(el, key, '');
        });
    }
    if (nv && _.isObject(nv)) {
        setCSSFromObj(el, nv);
    }
};
const ɵ1 = updateStyles;
export class BaseComponent {
    constructor(inj, config, initPromise // Promise on which the initialization has to wait
    ) {
        this.inj = inj;
        /**
         * Style change subject and observable
         */
        this.styleChange = new ReplaySubject();
        /**
         * Property change subject and observable
         */
        this.propertyChange = new Subject();
        /**
         * On Ready State change subject and observable
         */
        this.readyState = new Subject();
        /**
         * Component destroy subject and observable
         */
        this.destroy = new Subject();
        /**
         * Map of event handler callbacks
         */
        this.eventHandlers = new Map();
        /**
         * Holds the event registration functions.
         * these functions needs to be executed after onViewInit
         */
        this.toBeSetupEventsQueue = [];
        this.__cloneable__ = false;
        this.$attrs = new Map();
        const elementRef = inj.get(ElementRef);
        this.nativeElement = elementRef.nativeElement;
        this.widgetType = config.widgetType;
        this.widgetSubType = config.widgetSubType || config.widgetType;
        this.viewParent = inj.view.component;
        this.displayType = config.displayType || DISPLAY_TYPE.BLOCK;
        this.context = inj.view.context;
        this.widget = this.createProxy();
        this.eventManager = inj.get(EventManager);
        this.nativeElement.widget = this.widget;
        this.appLocale = inj.get(App).appLocale || {};
        this.initContext();
        if (config.hostClass) {
            addClass(this.nativeElement, config.hostClass);
        }
        this.widgetId = this.generateWidgetId();
        setAttr(this.nativeElement, 'widget-id', this.widgetId, true);
        // register default property change handler and style change handler
        this.registerStyleChangeListener(this.onStyleChange, this);
        this.registerPropertyChangeListener(this.onPropertyChange, this);
        // if the initPromise is provided, wait till the promise is resolved to proceed with the widget initialization
        if (!initPromise) {
            this.initWidget();
        }
        else {
            this.delayedInit = true;
            initPromise.then(() => {
                this.initWidget();
                this.setInitProps();
            });
        }
    }
    /**
     * jQuery nativeElement reference of the component root
     */
    get $element() {
        return $(this.nativeElement);
    }
    getNativeElement() {
        return this.nativeElement;
    }
    getWidgetType() {
        return this.widgetType;
    }
    getWidgetSubType() {
        return this.widgetSubType;
    }
    getWidget() {
        return this.widget;
    }
    getViewParent() {
        return this.viewParent;
    }
    notifyStyleChange(key, nv, ov) {
        this.styleChange.next({ key, nv, ov });
    }
    notifyPropertyChange(key, nv, ov) {
        this.propertyChange.next({ key, nv, ov });
    }
    registerStyleChangeListener(fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.styleChange.subscribe(({ key, nv, ov }) => fn(key, nv, ov));
    }
    registerReadyStateListener(fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        if (this.readyState.isStopped) {
            fn();
            return;
        }
        this.readyState.subscribe(() => fn());
    }
    registerPropertyChangeListener(fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.propertyChange.subscribe(({ key, nv, ov }) => fn(key, nv, ov));
    }
    registerDestroyListener(fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.destroy.subscribe(() => { }, () => { }, () => fn());
    }
    getDisplayType() {
        return this.displayType;
    }
    createProxy() {
        return WidgetProxyProvider.create(this, this.widgetSubType, getWidgetPropsByType(this.widgetSubType));
    }
    initContext() {
        const context = this.inj.view.context;
        const parentContexts = this.inj.get(Context, {});
        // assign the context property accordingly
        if (this.viewParent !== context) {
            this.context = context;
        }
        else {
            this.context = {};
        }
        if (parentContexts) {
            this.context = Object.assign({}, ...parentContexts, this.context);
        }
    }
    /**
     * set the value on the proxy object ie, widget
     * setting the property on the proxy will invoke the change listeners
     * @param {string} key
     * @param value
     */
    setWidgetProperty(key, value) {
        this.widget[key] = value;
    }
    getAttr(attrName) {
        return this.$attrs.get(attrName);
    }
    /**
     * returns app instance
     * @returns {App}
     */
    getAppInstance() {
        return this.inj.get(App);
    }
    /**
     * Generates a unique id
     * Default pattern is `widget-id-${id}`
     * Components can override this method to generate a different id eg, bar-chart-1
     */
    generateWidgetId() {
        return widgetIdGenerator.nextUid();
    }
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
    onPropertyChange(key, nv, ov) {
        if (key === 'show') {
            this.nativeElement.hidden = !nv;
        }
        else if (key === 'hint') {
            setAttr(this.nativeElement, 'title', nv);
        }
        else if (key === 'class') {
            switchClass(this.nativeElement, nv, ov);
        }
        else if (key === 'name' || key === 'tabindex') {
            setAttr(this.nativeElement, key, nv);
            if (key === 'name' && nv) {
                renameWidget(this.viewParent, this.widget, nv, ov);
            }
        }
        else if (key === 'conditionalclass') {
            // update classes if old and nv value are different
            updateClasses(nv.toAdd, nv.toRemove, this.nativeElement);
        }
        else if (key === 'autoplay') {
            const tagName = this.widgetType === 'wm-audio' ? 'audio' : 'video';
            // Trigger media(audio/video) element load method after changing autoplay property
            this.nativeElement.querySelector(tagName).load();
        }
        else if (key === 'conditionalstyle') {
            // update styles if old and nv value are different
            updateStyles(nv, ov, this.nativeElement);
        }
    }
    /**
     * Default style change handler
     */
    onStyleChange(k, nv, ov) { }
    /**
     * Register the widget with the widgetRegistry
     */
    registerWidget(widgetName) {
        this.registerDestroyListener(register(this.widget, this.viewParent, this.widgetId, widgetName));
    }
    /**
     * override the
     */
    getMappedEventName(eventName) {
        return EVENTS_MAP.get(eventName) || eventName;
    }
    /**
     * invoke the event handler
     * Components can override this method to execute custom logic before invoking the user callback
     */
    handleEvent(node, eventName, eventCallback, locals, meta) {
        this.eventManager.addEventListener(node, eventName, e => {
            locals.$event = e;
            if (meta === 'delayed') {
                setTimeout(() => eventCallback(), 150);
            }
            else {
                return eventCallback();
            }
        });
    }
    /**
     * parse the event expression and save reference to the function inside eventHandlers map
     * If the component provides a override for an event through @Event decorator invoke that
     * else invoke the resolved function
     *
     * @param {string} eventName
     * @param {string} expr
     */
    processEventAttr(eventName, expr, meta) {
        const fn = $parseEvent(expr);
        const locals = this.context;
        locals.widget = this.widget;
        const boundFn = fn.bind(undefined, this.viewParent, locals);
        const eventCallback = () => {
            let boundFnVal;
            $invokeWatchers(true);
            try {
                // If the event is bound directly to the variable then we need to internally handle
                // the promise returned by the variable call.
                boundFnVal = boundFn();
                if (boundFnVal instanceof Promise) {
                    boundFnVal.then(response => response, err => err);
                }
                else {
                    return boundFnVal;
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        this.eventHandlers.set(this.getMappedEventName(eventName), { callback: eventCallback, locals });
        // prepend eventName with on and convert it to camelcase.
        // eg, "click" ---> onClick
        const onEventName = _.camelCase(`on-${eventName}`);
        // save the eventCallback in widgetScope.
        this[onEventName] = eventCallback;
        // events needs to be setup after viewInit
        this.toBeSetupEventsQueue.push(() => {
            this.handleEvent(this.nativeElement, this.getMappedEventName(eventName), eventCallback, locals, meta);
        });
    }
    /**
     * Process the bound property
     * Register a watch on the bound expression
     */
    processBindAttr(propName, expr) {
        this.initState.delete(propName);
        this.registerDestroyListener($watch(expr, this.viewParent, this.context, nv => this.widget[propName] = nv, getWatchIdentifier(this.widgetId, propName), propName === 'datasource'));
    }
    /**
     * Remove watch on the bound property
     */
    removePropertyBinding(propName) {
        $unwatch(getWatchIdentifier(this.widgetId, propName));
    }
    /**
     * invoke the event callback method
     * @param {string} eventName
     * @param extraLocals
     */
    invokeEventCallback(eventName, extraLocals) {
        const callbackInfo = this.eventHandlers.get(eventName);
        if (callbackInfo) {
            const fn = callbackInfo.callback;
            const locals = callbackInfo.locals || {};
            if (fn) {
                return fn(Object.assign(locals, extraLocals));
            }
        }
    }
    /**
     * Process the attribute
     * If the attribute is an event expression, generate a functional representation of the expression
     *      and keep in eventHandlers
     * If the attribute is a bound expression, register a watch on the expression
     */
    processAttr(attrName, attrValue) {
        const { 0: propName, 1: type, 2: meta, length } = attrName.split('.');
        if (type === 'bind') {
            // if the show property is bound, set the initial value to false
            if (propName === 'show') {
                this.nativeElement.hidden = true;
            }
            this.processBindAttr(propName, attrValue);
        }
        else if (type === 'event') {
            this.processEventAttr(propName, attrValue, meta);
        }
        else if (length === 1) {
            // remove class and name attributes. Component will set them on the proper node
            if (attrName === 'class') {
                removeClass(this.nativeElement, attrValue);
            }
            else if (attrName === 'tabindex' || attrName === 'name') {
                removeAttr(this.nativeElement, attrName);
            }
            this.initState.set(propName, attrValue);
        }
        else {
            // custom attributes provided on elDef;
        }
    }
    /**
     * Process the attributes
     */
    processAttrs() {
        const elDef = this.inj.elDef;
        for (const [, attrName, attrValue] of elDef.element.attrs) {
            this.$attrs.set(attrName, attrValue);
            this.processAttr(attrName, attrValue);
        }
    }
    /**
     * Update the initState with the default property values and the values provided in the markup
     * Process the attributes
     * Register the widget
     */
    initWidget() {
        this.initState = new Map();
        // get the widget properties
        const widgetProps = getWidgetPropsByType(this.widgetSubType);
        widgetProps.forEach((v, k) => {
            if (isDefined(v.value)) {
                this.initState.set(k, v.value);
            }
        });
        this.widgetProps = widgetProps;
        this.processAttrs();
        this.registerWidget(this.initState.get('name'));
    }
    /**
     * Update the default properties and the properties provided in the markup in component
     * Invoking this method will result in invocation of propertyChange handlers on the component for the first time
     */
    setInitProps() {
        if (this.initState.get('name')) {
            this.widget.name = this.initState.get('name');
        }
        this.initState.forEach((v, k) => {
            // name is already set, ignore name
            // if the key is part of to be ignored attributes list do not set it on the component instance
            if ((this.widgetProps.get(k) || isStyle(k)) && k !== 'name') {
                this.widget[k] = v;
            }
        });
        this.initState.clear();
        this.initState = undefined;
        this.readyState.next();
        this.readyState.complete();
    }
    /**
     * Returns true, if a listener registered for the given event on this widget markup.
     * @param eventName
     * @returns {boolean}
     */
    hasEventCallback(eventName) {
        return this.eventHandlers.has(eventName);
    }
    /**
     * Sets the focus on the widget
     */
    focus() {
        /**
         * Check for the nodes having focus-target attribute inside the element
         * If found, focus the first node (eg, date widget)
         * else, focus the element (eg, text widget)
         */
        let $target = this.$element[0].querySelector('[focus-target]');
        if (!$target) {
            $target = this.$element[0];
        }
        $target.focus();
    }
    // Defining the execute method on BaseComponent. If dataset is binded to widgets ouptut then datasource.execute will be defined
    execute(operation, options) {
    }
    /**
     * nativeElement will be available by this time
     * if the delayInit is false, properties meta will be available by this time
     * Invoke the setInitProps if the delayInit is false
     */
    ngOnInit() {
        if (!this.delayedInit) {
            this.setInitProps();
        }
    }
    /**
     * Register the events
     */
    ngAfterViewInit() {
        if (this.toBeSetupEventsQueue.length) {
            for (const fn of this.toBeSetupEventsQueue) {
                fn();
            }
        }
        this.toBeSetupEventsQueue.length = 0;
    }
    ngAfterContentInit() { }
    ngOnDestroy() {
        this.isDestroyed = true;
        this.widget = Object.create(null);
        this.styleChange.complete();
        this.propertyChange.complete();
        this.destroy.complete();
    }
}
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Jhc2UvYmFzZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFtQyxVQUFVLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBQ3pHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QyxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTFLLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3pFLE9BQU8sRUFBa0IsT0FBTyxFQUFpQixNQUFNLHVCQUF1QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDckUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJakUsZ0VBQWdFO0FBQ2hFLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUMx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QyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzVCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IFJlcGxheVN1YmplY3QsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgJGludm9rZVdhdGNoZXJzLCAkcGFyc2VFdmVudCwgJHVud2F0Y2gsICR3YXRjaCwgYWRkQ2xhc3MsIHNldENTUywgc2V0Q1NTRnJvbU9iaiwgQXBwLCBpc0RlZmluZWQsIHJlbW92ZUF0dHIsIHJlbW92ZUNsYXNzLCBzZXRBdHRyLCBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgZ2V0V2lkZ2V0UHJvcHNCeVR5cGUgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcbmltcG9ydCB7IGlzU3R5bGUgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyLCByZW5hbWVXaWRnZXQgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXJlZ2lzdHJ5JztcbmltcG9ydCB7IENoYW5nZUxpc3RlbmVyLCBDb250ZXh0LCBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHdpZGdldElkR2VuZXJhdG9yIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1pZC1nZW5lcmF0b3InO1xuaW1wb3J0IHsgRElTUExBWV9UWVBFLCBFVkVOVFNfTUFQIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBXaWRnZXRQcm94eVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm94eS1wcm92aWRlcic7XG5pbXBvcnQgeyBnZXRXYXRjaElkZW50aWZpZXIgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0ICQsIF87XG5cbi8vIEdldHMgbGlzdCBvZiBjbGFzc2VzIHRvIGFkZCBhbmQgcmVtb3ZlIGFuZCBhcHBsaWVzIG9uIHRoZSAkZWxcbmNvbnN0IHVwZGF0ZUNsYXNzZXMgPSAodG9BZGQsIHRvUmVtb3ZlLCBlbCkgPT4ge1xuICAgIGlmICh0b1JlbW92ZSAmJiB0b1JlbW92ZS5sZW5ndGgpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIF8uam9pbih0b1JlbW92ZSwgJyAnKSk7XG4gICAgfVxuICAgIGlmICh0b0FkZCAmJiB0b0FkZC5sZW5ndGgpIHtcbiAgICAgICAgYWRkQ2xhc3MoZWwsIF8uam9pbih0b0FkZCwgJyAnKSk7XG4gICAgfVxufTtcblxuLy8gVG8gYWRkIGFuZCByZW1vdmUgc3R5bGVzIG9uIHRoZSAkZWxcbmNvbnN0IHVwZGF0ZVN0eWxlcyA9IChudiwgb3YsIGVsKSA9PiB7XG4gICAgaWYgKG92ICYmIF8uaXNPYmplY3Qob3YpKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvdiB8fCB7fSk7XG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIHNldENTUyhlbCwga2V5LCAnJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAobnYgJiYgXy5pc09iamVjdChudikpIHtcbiAgICAgICAgc2V0Q1NTRnJvbU9iaihlbCwgbnYpO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQWZ0ZXJDb250ZW50SW5pdCB7XG5cbiAgICAvKipcbiAgICAgKiB1bmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHdpZGdldFxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSB3aWRnZXRJZDogYW55O1xuXG4gICAgcHVibGljIGlzRGVzdHJveWVkOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogalF1ZXJ5IG5hdGl2ZUVsZW1lbnQgcmVmZXJlbmNlIG9mIHRoZSBjb21wb25lbnQgcm9vdFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgJGVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiAkKHRoaXMubmF0aXZlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRE9NIG5vZGUgcmVmZXJlbmNlIG9mIHRoZSBjb21wb25lbnQgcm9vdFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWFkb25seSBuYXRpdmVFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdGhlIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWFkb25seSB3aWRnZXRUeXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBNb3N0IG9mIHRoZSBjYXNlcyBpdCBpcyBzYW1lIGFzIHdpZGdldFR5cGVcbiAgICAgKiBmb3Igc3BlY2lmaWMgd2lkZ2V0cyBsaWtlIGNoYXJ0cyB3aWRnZXRUeXBlIGNhbiBiZSB3bS1jaGFydCB3aGVyZSBhcyB0aGUgc3VidHlwZSBjYW4gYmUgd20tYmFyLWNoYXJ0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHdpZGdldFN1YlR5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFByb3h5IGZvciB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB3aWRnZXQ6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFZpZXcgcGFyZW50IGNvbXBvbmVudFxuICAgICAqIGVnLCBQYWdlLCBQYXJ0aWFsLCBQcmVmYWJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmlld1BhcmVudDogYW55O1xuXG4gICAgLyoqXG4gICAgICogRXZlbnRNYW5nZXIgdG8gYWRkL3JlbW92ZSBldmVudHNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgZXZlbnRNYW5hZ2VyOiBFdmVudE1hbmFnZXI7XG5cbiAgICAvKipcbiAgICAgKiBBcHAgTG9jYWxlXG4gICAgICovXG4gICAgcHVibGljIHJlYWRvbmx5IGFwcExvY2FsZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogU3R5bGUgY2hhbmdlIHN1YmplY3QgYW5kIG9ic2VydmFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0eWxlQ2hhbmdlID0gbmV3IFJlcGxheVN1YmplY3QoKTtcblxuICAgIC8qKlxuICAgICAqIFByb3BlcnR5IGNoYW5nZSBzdWJqZWN0IGFuZCBvYnNlcnZhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBwcm9wZXJ0eUNoYW5nZSA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBPbiBSZWFkeSBTdGF0ZSBjaGFuZ2Ugc3ViamVjdCBhbmQgb2JzZXJ2YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVhZHlTdGF0ZSA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBDb21wb25lbnQgZGVzdHJveSBzdWJqZWN0IGFuZCBvYnNlcnZhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZXN0cm95ID0gbmV3IFN1YmplY3QoKTtcblxuICAgIC8qKlxuICAgICAqIE1hcCBvZiBldmVudCBoYW5kbGVyIGNhbGxiYWNrc1xuICAgICAqL1xuICAgIHByaXZhdGUgZXZlbnRIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCB7Y2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueX0+KCk7XG5cbiAgICAvKipcbiAgICAgKiBjb250ZXh0IG9mIHRoZSB3aWRnZXRcbiAgICAgKiB3aGVuIHRoZSB3aWRnZXQgaXMgcHJlc2V0IGluc2lkZSBhIHJlcGVhdGVyIHRoaXMgY29udGV4dCB3aWxsIGhhdmUgdGhlIHJlcGVhdGVyIHJlbGF0ZWQgcHJvcGVydGllc1xuICAgICAqL1xuICAgIHB1YmxpYyBjb250ZXh0OiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsIHN0YXRlIG9mIHRoZSB3aWRnZXQuXG4gICAgICogV2lsbCBiZSB1bmRlZmluZWQgb25jZSB0aGUgaW5pdGlhbCBwcm9wZXJ0aWVzIGFyZSBzZXQgb24gdG8gdGhlIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdFN0YXRlOiBNYXA8c3RyaW5nLCBhbnk+O1xuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgZmxhZyB0byBkZXRlcm1pbmUgd2hldGhlciB0byB3YWl0IGZvciB0aGUgd2lkZ2V0IGluaXRpYWxpemF0aW9uIG9yIG5vdFxuICAgICAqIElmIHRoZSBpbml0UHJvbWlzZSBpcyBwcm92aWRlZCBpbiB0aGUgY29uc3RydWN0aW9uIHdhaXQgdGlsbCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZFxuICAgICAqIElmIHRoZSBpbml0UHJvbWlzZSBpcyBub3QgcHJvdmlkZWQgcHJvY2VlZCB3aXRoIHRoZSBpbml0aWFsaXphdGlvbiwgd2hpY2ggaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3IuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBkZWxheWVkSW5pdDogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIERpc3BsYXkgdHlwZSBvZiB0aGUgY29tcG9uZW50LiBlZywgYmxvY2soRGVmYXVsdCksIGlubGluZS1ibG9jaywgaW5saW5lIGV0Y1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGxheVR5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEhvbGRzIHRoZSBldmVudCByZWdpc3RyYXRpb24gZnVuY3Rpb25zLlxuICAgICAqIHRoZXNlIGZ1bmN0aW9ucyBuZWVkcyB0byBiZSBleGVjdXRlZCBhZnRlciBvblZpZXdJbml0XG4gICAgICovXG4gICAgcHJpdmF0ZSB0b0JlU2V0dXBFdmVudHNRdWV1ZTogQXJyYXk8RnVuY3Rpb24+ID0gW107XG5cbiAgICBwdWJsaWMgX19jbG9uZWFibGVfXyA9IGZhbHNlO1xuXG4gICAgcHVibGljIHdpZGdldFByb3BzOiBNYXA8c3RyaW5nLCBhbnk+O1xuXG4gICAgcHJpdmF0ZSAkYXR0cnMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcm90ZWN0ZWQgaW5qOiBJbmplY3RvcixcbiAgICAgICAgY29uZmlnOiBJV2lkZ2V0Q29uZmlnLFxuICAgICAgICBpbml0UHJvbWlzZT86IFByb21pc2U8YW55PiAvLyBQcm9taXNlIG9uIHdoaWNoIHRoZSBpbml0aWFsaXphdGlvbiBoYXMgdG8gd2FpdFxuICAgICkge1xuICAgICAgICBjb25zdCBlbGVtZW50UmVmID0gaW5qLmdldChFbGVtZW50UmVmKTtcbiAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLndpZGdldFR5cGUgPSBjb25maWcud2lkZ2V0VHlwZTtcbiAgICAgICAgdGhpcy53aWRnZXRTdWJUeXBlID0gY29uZmlnLndpZGdldFN1YlR5cGUgfHwgY29uZmlnLndpZGdldFR5cGU7XG4gICAgICAgIHRoaXMudmlld1BhcmVudCA9IChpbmogYXMgYW55KS52aWV3LmNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5kaXNwbGF5VHlwZSA9IGNvbmZpZy5kaXNwbGF5VHlwZSB8fCBESVNQTEFZX1RZUEUuQkxPQ0s7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IChpbmogYXMgYW55KS52aWV3LmNvbnRleHQ7XG4gICAgICAgIHRoaXMud2lkZ2V0ID0gdGhpcy5jcmVhdGVQcm94eSgpO1xuICAgICAgICB0aGlzLmV2ZW50TWFuYWdlciA9IGluai5nZXQoRXZlbnRNYW5hZ2VyKTtcbiAgICAgICAgKHRoaXMubmF0aXZlRWxlbWVudCBhcyBhbnkpLndpZGdldCA9IHRoaXMud2lkZ2V0O1xuXG4gICAgICAgIHRoaXMuYXBwTG9jYWxlID0gaW5qLmdldChBcHApLmFwcExvY2FsZSB8fCB7fTtcblxuICAgICAgICB0aGlzLmluaXRDb250ZXh0KCk7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5ob3N0Q2xhc3MpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgY29uZmlnLmhvc3RDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLndpZGdldElkID0gdGhpcy5nZW5lcmF0ZVdpZGdldElkKCk7XG4gICAgICAgIHNldEF0dHIodGhpcy5uYXRpdmVFbGVtZW50LCAnd2lkZ2V0LWlkJywgdGhpcy53aWRnZXRJZCwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gcmVnaXN0ZXIgZGVmYXVsdCBwcm9wZXJ0eSBjaGFuZ2UgaGFuZGxlciBhbmQgc3R5bGUgY2hhbmdlIGhhbmRsZXJcbiAgICAgICAgdGhpcy5yZWdpc3RlclN0eWxlQ2hhbmdlTGlzdGVuZXIodGhpcy5vblN0eWxlQ2hhbmdlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlclByb3BlcnR5Q2hhbmdlTGlzdGVuZXIodGhpcy5vblByb3BlcnR5Q2hhbmdlLCB0aGlzKTtcblxuICAgICAgICAvLyBpZiB0aGUgaW5pdFByb21pc2UgaXMgcHJvdmlkZWQsIHdhaXQgdGlsbCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBwcm9jZWVkIHdpdGggdGhlIHdpZGdldCBpbml0aWFsaXphdGlvblxuICAgICAgICBpZiAoIWluaXRQcm9taXNlKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRXaWRnZXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsYXllZEluaXQgPSB0cnVlO1xuICAgICAgICAgICAgaW5pdFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0V2lkZ2V0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbml0UHJvcHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldE5hdGl2ZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5uYXRpdmVFbGVtZW50O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRXaWRnZXRUeXBlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZGdldFR5cGU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFdpZGdldFN1YlR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2lkZ2V0U3ViVHlwZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0V2lkZ2V0KCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZGdldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Vmlld1BhcmVudCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWV3UGFyZW50O1xuICAgIH1cblxuICAgIHB1YmxpYyBub3RpZnlTdHlsZUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y6IGFueSkge1xuICAgICAgICB0aGlzLnN0eWxlQ2hhbmdlLm5leHQoe2tleSwgbnYsIG92fSk7XG4gICAgfVxuXG4gICAgcHVibGljIG5vdGlmeVByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlDaGFuZ2UubmV4dCh7a2V5LCBudiwgb3Z9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJTdHlsZUNoYW5nZUxpc3RlbmVyKGZuOiBDaGFuZ2VMaXN0ZW5lciwgY3R4PzogYW55KSB7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGZuID0gZm4uYmluZChjdHgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3R5bGVDaGFuZ2Uuc3Vic2NyaWJlKCh7a2V5LCBudiwgb3Z9KSA9PiBmbihrZXksIG52LCBvdikpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3RlclJlYWR5U3RhdGVMaXN0ZW5lcihmbjogRnVuY3Rpb24sIGN0eD86IGFueSkge1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBmbiA9IGZuLmJpbmQoY3R4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWFkeVN0YXRlLmlzU3RvcHBlZCkge1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlYWR5U3RhdGUuc3Vic2NyaWJlKCgpID0+IGZuKCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3RlclByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoZm46IENoYW5nZUxpc3RlbmVyLCBjdHg/OiBhbnkpIHtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgZm4gPSBmbi5iaW5kKGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wZXJ0eUNoYW5nZS5zdWJzY3JpYmUoKHtrZXksIG52LCBvdn0pID0+IGZuKGtleSwgbnYsIG92KSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKGZuOiBGdW5jdGlvbiwgY3R4PzogYW55KSB7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGZuID0gZm4uYmluZChjdHgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVzdHJveS5zdWJzY3JpYmUoKCkgPT4ge30sICgpID0+IHt9LCAoKSA9PiBmbigpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGlzcGxheVR5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheVR5cGU7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVByb3h5KCk6IGFueSB7XG4gICAgICAgIHJldHVybiBXaWRnZXRQcm94eVByb3ZpZGVyLmNyZWF0ZSh0aGlzLCB0aGlzLndpZGdldFN1YlR5cGUsIGdldFdpZGdldFByb3BzQnlUeXBlKHRoaXMud2lkZ2V0U3ViVHlwZSkpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBpbml0Q29udGV4dCgpIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9ICh0aGlzLmluaiBhcyBhbnkpLnZpZXcuY29udGV4dDtcblxuICAgICAgICBjb25zdCBwYXJlbnRDb250ZXh0cyA9IHRoaXMuaW5qLmdldChDb250ZXh0LCB7fSk7XG5cbiAgICAgICAgLy8gYXNzaWduIHRoZSBjb250ZXh0IHByb3BlcnR5IGFjY29yZGluZ2x5XG4gICAgICAgIGlmICh0aGlzLnZpZXdQYXJlbnQgIT09IGNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnRDb250ZXh0cykge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0gT2JqZWN0LmFzc2lnbih7fSwgLi4uKDxBcnJheTxhbnk+PnBhcmVudENvbnRleHRzKSwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldCB0aGUgdmFsdWUgb24gdGhlIHByb3h5IG9iamVjdCBpZSwgd2lkZ2V0XG4gICAgICogc2V0dGluZyB0aGUgcHJvcGVydHkgb24gdGhlIHByb3h5IHdpbGwgaW52b2tlIHRoZSBjaGFuZ2UgbGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRXaWRnZXRQcm9wZXJ0eShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICB0aGlzLndpZGdldFtrZXldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEF0dHIoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLiRhdHRycy5nZXQoYXR0ck5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgYXBwIGluc3RhbmNlXG4gICAgICogQHJldHVybnMge0FwcH1cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0QXBwSW5zdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluai5nZXQoQXBwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgYSB1bmlxdWUgaWRcbiAgICAgKiBEZWZhdWx0IHBhdHRlcm4gaXMgYHdpZGdldC1pZC0ke2lkfWBcbiAgICAgKiBDb21wb25lbnRzIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBnZW5lcmF0ZSBhIGRpZmZlcmVudCBpZCBlZywgYmFyLWNoYXJ0LTFcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2VuZXJhdGVXaWRnZXRJZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gd2lkZ2V0SWRHZW5lcmF0b3IubmV4dFVpZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGFjcm9zcyB0aGUgY29tcG9uZW50c1xuICAgICAqIGVnLFxuICAgICAqICAxLiB2YWx1ZSBvZiB0aGUgY2xhc3MgcHJvcGVydHkgd2lsbCBiZSBhcHBsaWVkIG9uIHRoZSBob3N0IGVsZW1lbnRcbiAgICAgKiAgMi4gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHNob3cgcHJvcGVydHkgY29tcG9uZW50IGlzIHNob3duL2hpZGRlblxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgICAqIEBwYXJhbSBudlxuICAgICAqIEBwYXJhbSBvdlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnc2hvdycpIHtcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5oaWRkZW4gPSAhbnY7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnaGludCcpIHtcbiAgICAgICAgICAgIHNldEF0dHIodGhpcy5uYXRpdmVFbGVtZW50LCAndGl0bGUnLCBudik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICBzd2l0Y2hDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIG52LCBvdik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbmFtZScgfHwga2V5ID09PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwga2V5LCBudik7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbmFtZScgJiYgbnYpIHtcbiAgICAgICAgICAgICAgICByZW5hbWVXaWRnZXQodGhpcy52aWV3UGFyZW50LCB0aGlzLndpZGdldCwgbnYsIG92KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdjb25kaXRpb25hbGNsYXNzJykge1xuICAgICAgICAgICAgLy8gdXBkYXRlIGNsYXNzZXMgaWYgb2xkIGFuZCBudiB2YWx1ZSBhcmUgZGlmZmVyZW50XG4gICAgICAgICAgICB1cGRhdGVDbGFzc2VzKG52LnRvQWRkLCBudi50b1JlbW92ZSwgdGhpcy5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgfSBlbHNlICBpZiAoa2V5ID09PSAnYXV0b3BsYXknKSB7XG4gICAgICAgICAgICBjb25zdCB0YWdOYW1lID0gdGhpcy53aWRnZXRUeXBlID09PSAnd20tYXVkaW8nID8gJ2F1ZGlvJyA6ICd2aWRlbyc7XG4gICAgICAgICAgICAvLyBUcmlnZ2VyIG1lZGlhKGF1ZGlvL3ZpZGVvKSBlbGVtZW50IGxvYWQgbWV0aG9kIGFmdGVyIGNoYW5naW5nIGF1dG9wbGF5IHByb3BlcnR5XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3Rvcih0YWdOYW1lKS5sb2FkKCk7XG4gICAgICAgIH0gIGVsc2UgaWYgKGtleSA9PT0gJ2NvbmRpdGlvbmFsc3R5bGUnKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGUgc3R5bGVzIGlmIG9sZCBhbmQgbnYgdmFsdWUgYXJlIGRpZmZlcmVudFxuICAgICAgICAgICAgdXBkYXRlU3R5bGVzKG52LCBvdiwgdGhpcy5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgc3R5bGUgY2hhbmdlIGhhbmRsZXJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgb25TdHlsZUNoYW5nZShrOiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7fVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgdGhlIHdpZGdldCB3aXRoIHRoZSB3aWRnZXRSZWdpc3RyeVxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWdpc3RlcldpZGdldCh3aWRnZXROYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihyZWdpc3Rlcih0aGlzLndpZGdldCwgdGhpcy52aWV3UGFyZW50LCB0aGlzLndpZGdldElkLCB3aWRnZXROYW1lKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogb3ZlcnJpZGUgdGhlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldE1hcHBlZEV2ZW50TmFtZShldmVudE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIEVWRU5UU19NQVAuZ2V0KGV2ZW50TmFtZSkgfHwgZXZlbnROYW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGludm9rZSB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAqIENvbXBvbmVudHMgY2FuIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIGV4ZWN1dGUgY3VzdG9tIGxvZ2ljIGJlZm9yZSBpbnZva2luZyB0aGUgdXNlciBjYWxsYmFja1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50Q2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSwgbWV0YT86IHN0cmluZykge1xuICAgICAgICB0aGlzLmV2ZW50TWFuYWdlci5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIGV2ZW50TmFtZSxcbiAgICAgICAgICAgIGUgPT4ge1xuICAgICAgICAgICAgICAgIGxvY2Fscy4kZXZlbnQgPSBlO1xuICAgICAgICAgICAgICAgIGlmIChtZXRhID09PSAnZGVsYXllZCcpIHtcbiAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGV2ZW50Q2FsbGJhY2soKSwgMTUwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZXZlbnRDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwYXJzZSB0aGUgZXZlbnQgZXhwcmVzc2lvbiBhbmQgc2F2ZSByZWZlcmVuY2UgdG8gdGhlIGZ1bmN0aW9uIGluc2lkZSBldmVudEhhbmRsZXJzIG1hcFxuICAgICAqIElmIHRoZSBjb21wb25lbnQgcHJvdmlkZXMgYSBvdmVycmlkZSBmb3IgYW4gZXZlbnQgdGhyb3VnaCBARXZlbnQgZGVjb3JhdG9yIGludm9rZSB0aGF0XG4gICAgICogZWxzZSBpbnZva2UgdGhlIHJlc29sdmVkIGZ1bmN0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV4cHJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcHJvY2Vzc0V2ZW50QXR0cihldmVudE5hbWU6IHN0cmluZywgZXhwcjogc3RyaW5nLCBtZXRhPzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZuID0gJHBhcnNlRXZlbnQoZXhwcik7XG4gICAgICAgIGNvbnN0IGxvY2FscyA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgbG9jYWxzLndpZGdldCA9IHRoaXMud2lkZ2V0O1xuICAgICAgICBjb25zdCBib3VuZEZuID0gZm4uYmluZCh1bmRlZmluZWQsIHRoaXMudmlld1BhcmVudCwgbG9jYWxzKTtcblxuICAgICAgICBjb25zdCBldmVudENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGJvdW5kRm5WYWw7XG4gICAgICAgICAgICAkaW52b2tlV2F0Y2hlcnModHJ1ZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBldmVudCBpcyBib3VuZCBkaXJlY3RseSB0byB0aGUgdmFyaWFibGUgdGhlbiB3ZSBuZWVkIHRvIGludGVybmFsbHkgaGFuZGxlXG4gICAgICAgICAgICAgICAgLy8gdGhlIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIHZhcmlhYmxlIGNhbGwuXG4gICAgICAgICAgICAgICAgYm91bmRGblZhbCA9IGJvdW5kRm4oKTtcbiAgICAgICAgICAgICAgICBpZiAoYm91bmRGblZhbCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYm91bmRGblZhbC50aGVuKCByZXNwb25zZSA9PiByZXNwb25zZSwgZXJyID0+IGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kRm5WYWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5ldmVudEhhbmRsZXJzLnNldCh0aGlzLmdldE1hcHBlZEV2ZW50TmFtZShldmVudE5hbWUpLCB7Y2FsbGJhY2s6IGV2ZW50Q2FsbGJhY2ssIGxvY2Fsc30pO1xuICAgICAgICAvLyBwcmVwZW5kIGV2ZW50TmFtZSB3aXRoIG9uIGFuZCBjb252ZXJ0IGl0IHRvIGNhbWVsY2FzZS5cbiAgICAgICAgLy8gZWcsIFwiY2xpY2tcIiAtLS0+IG9uQ2xpY2tcbiAgICAgICAgY29uc3Qgb25FdmVudE5hbWUgPSAgXy5jYW1lbENhc2UoYG9uLSR7ZXZlbnROYW1lfWApO1xuICAgICAgICAvLyBzYXZlIHRoZSBldmVudENhbGxiYWNrIGluIHdpZGdldFNjb3BlLlxuICAgICAgICB0aGlzW29uRXZlbnROYW1lXSA9IGV2ZW50Q2FsbGJhY2s7XG5cbiAgICAgICAgLy8gZXZlbnRzIG5lZWRzIHRvIGJlIHNldHVwIGFmdGVyIHZpZXdJbml0XG4gICAgICAgIHRoaXMudG9CZVNldHVwRXZlbnRzUXVldWUucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUV2ZW50KHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcy5nZXRNYXBwZWRFdmVudE5hbWUoZXZlbnROYW1lKSwgZXZlbnRDYWxsYmFjaywgbG9jYWxzLCBtZXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2VzcyB0aGUgYm91bmQgcHJvcGVydHlcbiAgICAgKiBSZWdpc3RlciBhIHdhdGNoIG9uIHRoZSBib3VuZCBleHByZXNzaW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NCaW5kQXR0cihwcm9wTmFtZTogc3RyaW5nLCBleHByOiBzdHJpbmcpIHtcblxuICAgICAgICB0aGlzLmluaXRTdGF0ZS5kZWxldGUocHJvcE5hbWUpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoXG4gICAgICAgICAgICAkd2F0Y2goXG4gICAgICAgICAgICAgICAgZXhwcixcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdQYXJlbnQsXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LFxuICAgICAgICAgICAgICAgIG52ID0+IHRoaXMud2lkZ2V0W3Byb3BOYW1lXSA9IG52LFxuICAgICAgICAgICAgICAgIGdldFdhdGNoSWRlbnRpZmllcih0aGlzLndpZGdldElkLCBwcm9wTmFtZSksXG4gICAgICAgICAgICAgICAgcHJvcE5hbWUgPT09ICdkYXRhc291cmNlJ1xuICAgICAgICAgICAgKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB3YXRjaCBvbiB0aGUgYm91bmQgcHJvcGVydHlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlUHJvcGVydHlCaW5kaW5nKHByb3BOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgJHVud2F0Y2goZ2V0V2F0Y2hJZGVudGlmaWVyKHRoaXMud2lkZ2V0SWQsIHByb3BOYW1lKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW52b2tlIHRoZSBldmVudCBjYWxsYmFjayBtZXRob2RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnROYW1lXG4gICAgICogQHBhcmFtIGV4dHJhTG9jYWxzXG4gICAgICovXG4gICAgcHVibGljIGludm9rZUV2ZW50Q2FsbGJhY2soZXZlbnROYW1lOiBzdHJpbmcsIGV4dHJhTG9jYWxzPzogYW55KSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrSW5mbyA9IHRoaXMuZXZlbnRIYW5kbGVycy5nZXQoZXZlbnROYW1lKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrSW5mbykge1xuICAgICAgICAgICAgY29uc3QgZm4gPSBjYWxsYmFja0luZm8uY2FsbGJhY2s7XG4gICAgICAgICAgICBjb25zdCBsb2NhbHMgPSBjYWxsYmFja0luZm8ubG9jYWxzIHx8IHt9O1xuXG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4oT2JqZWN0LmFzc2lnbihsb2NhbHMsIGV4dHJhTG9jYWxzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIHRoZSBhdHRyaWJ1dGVcbiAgICAgKiBJZiB0aGUgYXR0cmlidXRlIGlzIGFuIGV2ZW50IGV4cHJlc3Npb24sIGdlbmVyYXRlIGEgZnVuY3Rpb25hbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXhwcmVzc2lvblxuICAgICAqICAgICAgYW5kIGtlZXAgaW4gZXZlbnRIYW5kbGVyc1xuICAgICAqIElmIHRoZSBhdHRyaWJ1dGUgaXMgYSBib3VuZCBleHByZXNzaW9uLCByZWdpc3RlciBhIHdhdGNoIG9uIHRoZSBleHByZXNzaW9uXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NBdHRyKGF0dHJOYW1lOiBzdHJpbmcsIGF0dHJWYWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHswOiBwcm9wTmFtZSwgMTogdHlwZSwgMjogbWV0YSwgbGVuZ3RofSA9IGF0dHJOYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmICh0eXBlID09PSAnYmluZCcpIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBzaG93IHByb3BlcnR5IGlzIGJvdW5kLCBzZXQgdGhlIGluaXRpYWwgdmFsdWUgdG8gZmFsc2VcbiAgICAgICAgICAgIGlmIChwcm9wTmFtZSA9PT0gJ3Nob3cnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NCaW5kQXR0cihwcm9wTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NFdmVudEF0dHIocHJvcE5hbWUsIGF0dHJWYWx1ZSwgbWV0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgY2xhc3MgYW5kIG5hbWUgYXR0cmlidXRlcy4gQ29tcG9uZW50IHdpbGwgc2V0IHRoZW0gb24gdGhlIHByb3BlciBub2RlXG4gICAgICAgICAgICBpZiAoYXR0ck5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIGF0dHJWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGF0dHJOYW1lID09PSAndGFiaW5kZXgnIHx8IGF0dHJOYW1lID09PSAnbmFtZScpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgYXR0ck5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmluaXRTdGF0ZS5zZXQocHJvcE5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjdXN0b20gYXR0cmlidXRlcyBwcm92aWRlZCBvbiBlbERlZjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgdGhlIGF0dHJpYnV0ZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIHByb2Nlc3NBdHRycygpIHtcbiAgICAgICAgY29uc3QgZWxEZWYgPSAodGhpcy5pbmogYXMgYW55KS5lbERlZjtcblxuICAgICAgICBmb3IgKGNvbnN0IFssIGF0dHJOYW1lLCBhdHRyVmFsdWVdIG9mIGVsRGVmLmVsZW1lbnQuYXR0cnMpIHtcbiAgICAgICAgICAgIHRoaXMuJGF0dHJzLnNldChhdHRyTmFtZSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0F0dHIoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIGluaXRTdGF0ZSB3aXRoIHRoZSBkZWZhdWx0IHByb3BlcnR5IHZhbHVlcyBhbmQgdGhlIHZhbHVlcyBwcm92aWRlZCBpbiB0aGUgbWFya3VwXG4gICAgICogUHJvY2VzcyB0aGUgYXR0cmlidXRlc1xuICAgICAqIFJlZ2lzdGVyIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaW5pdFdpZGdldCgpIHtcbiAgICAgICAgdGhpcy5pbml0U3RhdGUgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuXG4gICAgICAgIC8vIGdldCB0aGUgd2lkZ2V0IHByb3BlcnRpZXNcbiAgICAgICAgY29uc3Qgd2lkZ2V0UHJvcHM6IE1hcDxzdHJpbmcsIGFueT4gPSBnZXRXaWRnZXRQcm9wc0J5VHlwZSh0aGlzLndpZGdldFN1YlR5cGUpO1xuICAgICAgICB3aWRnZXRQcm9wcy5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHYudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0U3RhdGUuc2V0KGssIHYudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndpZGdldFByb3BzID0gd2lkZ2V0UHJvcHM7XG5cbiAgICAgICAgdGhpcy5wcm9jZXNzQXR0cnMoKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyV2lkZ2V0KHRoaXMuaW5pdFN0YXRlLmdldCgnbmFtZScpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIGRlZmF1bHQgcHJvcGVydGllcyBhbmQgdGhlIHByb3BlcnRpZXMgcHJvdmlkZWQgaW4gdGhlIG1hcmt1cCBpbiBjb21wb25lbnRcbiAgICAgKiBJbnZva2luZyB0aGlzIG1ldGhvZCB3aWxsIHJlc3VsdCBpbiBpbnZvY2F0aW9uIG9mIHByb3BlcnR5Q2hhbmdlIGhhbmRsZXJzIG9uIHRoZSBjb21wb25lbnQgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldEluaXRQcm9wcygpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5pdFN0YXRlLmdldCgnbmFtZScpKSB7XG4gICAgICAgICAgICB0aGlzLndpZGdldC5uYW1lID0gdGhpcy5pbml0U3RhdGUuZ2V0KCduYW1lJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbml0U3RhdGUuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICAgICAgLy8gbmFtZSBpcyBhbHJlYWR5IHNldCwgaWdub3JlIG5hbWVcbiAgICAgICAgICAgIC8vIGlmIHRoZSBrZXkgaXMgcGFydCBvZiB0byBiZSBpZ25vcmVkIGF0dHJpYnV0ZXMgbGlzdCBkbyBub3Qgc2V0IGl0IG9uIHRoZSBjb21wb25lbnQgaW5zdGFuY2VcbiAgICAgICAgICAgIGlmICgodGhpcy53aWRnZXRQcm9wcy5nZXQoaykgfHwgaXNTdHlsZShrKSkgJiYgayAhPT0gJ25hbWUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aWRnZXRba10gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbml0U3RhdGUuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5pbml0U3RhdGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlLm5leHQoKTtcbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlLmNvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlLCBpZiBhIGxpc3RlbmVyIHJlZ2lzdGVyZWQgZm9yIHRoZSBnaXZlbiBldmVudCBvbiB0aGlzIHdpZGdldCBtYXJrdXAuXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZVxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoYXNFdmVudENhbGxiYWNrKGV2ZW50TmFtZSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudEhhbmRsZXJzLmhhcyhldmVudE5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGZvY3VzIG9uIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZm9jdXMoKTogdm9pZCB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDaGVjayBmb3IgdGhlIG5vZGVzIGhhdmluZyBmb2N1cy10YXJnZXQgYXR0cmlidXRlIGluc2lkZSB0aGUgZWxlbWVudFxuICAgICAgICAgKiBJZiBmb3VuZCwgZm9jdXMgdGhlIGZpcnN0IG5vZGUgKGVnLCBkYXRlIHdpZGdldClcbiAgICAgICAgICogZWxzZSwgZm9jdXMgdGhlIGVsZW1lbnQgKGVnLCB0ZXh0IHdpZGdldClcbiAgICAgICAgICovXG4gICAgICAgIGxldCAkdGFyZ2V0ID0gdGhpcy4kZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbZm9jdXMtdGFyZ2V0XScpO1xuICAgICAgICBpZiAoISR0YXJnZXQpIHtcbiAgICAgICAgICAgICR0YXJnZXQgPSB0aGlzLiRlbGVtZW50WzBdO1xuICAgICAgICB9XG4gICAgICAgICR0YXJnZXQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmluZyB0aGUgZXhlY3V0ZSBtZXRob2Qgb24gQmFzZUNvbXBvbmVudC4gSWYgZGF0YXNldCBpcyBiaW5kZWQgdG8gd2lkZ2V0cyBvdXB0dXQgdGhlbiBkYXRhc291cmNlLmV4ZWN1dGUgd2lsbCBiZSBkZWZpbmVkXG4gICAgcHJvdGVjdGVkIGV4ZWN1dGUob3BlcmF0aW9uLCBvcHRpb25zKTogYW55IHtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG5hdGl2ZUVsZW1lbnQgd2lsbCBiZSBhdmFpbGFibGUgYnkgdGhpcyB0aW1lXG4gICAgICogaWYgdGhlIGRlbGF5SW5pdCBpcyBmYWxzZSwgcHJvcGVydGllcyBtZXRhIHdpbGwgYmUgYXZhaWxhYmxlIGJ5IHRoaXMgdGltZVxuICAgICAqIEludm9rZSB0aGUgc2V0SW5pdFByb3BzIGlmIHRoZSBkZWxheUluaXQgaXMgZmFsc2VcbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRlbGF5ZWRJbml0KSB7XG4gICAgICAgICAgICB0aGlzLnNldEluaXRQcm9wcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgaWYgKHRoaXMudG9CZVNldHVwRXZlbnRzUXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIHRoaXMudG9CZVNldHVwRXZlbnRzUXVldWUpIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudG9CZVNldHVwRXZlbnRzUXVldWUubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7fVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuaXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLndpZGdldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHRoaXMuc3R5bGVDaGFuZ2UuY29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eUNoYW5nZS5jb21wbGV0ZSgpO1xuICAgICAgICB0aGlzLmRlc3Ryb3kuY29tcGxldGUoKTtcbiAgICB9XG59XG4iXX0=