import * as tslib_1 from "tslib";
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
var updateClasses = function (toAdd, toRemove, el) {
    if (toRemove && toRemove.length) {
        removeClass(el, _.join(toRemove, ' '));
    }
    if (toAdd && toAdd.length) {
        addClass(el, _.join(toAdd, ' '));
    }
};
var ɵ0 = updateClasses;
// To add and remove styles on the $el
var updateStyles = function (nv, ov, el) {
    if (ov && _.isObject(ov)) {
        var keys = Object.keys(ov || {});
        keys.forEach(function (key) {
            setCSS(el, key, '');
        });
    }
    if (nv && _.isObject(nv)) {
        setCSSFromObj(el, nv);
    }
};
var ɵ1 = updateStyles;
var BaseComponent = /** @class */ (function () {
    function BaseComponent(inj, config, initPromise // Promise on which the initialization has to wait
    ) {
        var _this = this;
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
        var elementRef = inj.get(ElementRef);
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
            initPromise.then(function () {
                _this.initWidget();
                _this.setInitProps();
            });
        }
    }
    Object.defineProperty(BaseComponent.prototype, "$element", {
        /**
         * jQuery nativeElement reference of the component root
         */
        get: function () {
            return $(this.nativeElement);
        },
        enumerable: true,
        configurable: true
    });
    BaseComponent.prototype.getNativeElement = function () {
        return this.nativeElement;
    };
    BaseComponent.prototype.getWidgetType = function () {
        return this.widgetType;
    };
    BaseComponent.prototype.getWidgetSubType = function () {
        return this.widgetSubType;
    };
    BaseComponent.prototype.getWidget = function () {
        return this.widget;
    };
    BaseComponent.prototype.getViewParent = function () {
        return this.viewParent;
    };
    BaseComponent.prototype.notifyStyleChange = function (key, nv, ov) {
        this.styleChange.next({ key: key, nv: nv, ov: ov });
    };
    BaseComponent.prototype.notifyPropertyChange = function (key, nv, ov) {
        this.propertyChange.next({ key: key, nv: nv, ov: ov });
    };
    BaseComponent.prototype.registerStyleChangeListener = function (fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.styleChange.subscribe(function (_a) {
            var key = _a.key, nv = _a.nv, ov = _a.ov;
            return fn(key, nv, ov);
        });
    };
    BaseComponent.prototype.registerReadyStateListener = function (fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        if (this.readyState.isStopped) {
            fn();
            return;
        }
        this.readyState.subscribe(function () { return fn(); });
    };
    BaseComponent.prototype.registerPropertyChangeListener = function (fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.propertyChange.subscribe(function (_a) {
            var key = _a.key, nv = _a.nv, ov = _a.ov;
            return fn(key, nv, ov);
        });
    };
    BaseComponent.prototype.registerDestroyListener = function (fn, ctx) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.destroy.subscribe(function () { }, function () { }, function () { return fn(); });
    };
    BaseComponent.prototype.getDisplayType = function () {
        return this.displayType;
    };
    BaseComponent.prototype.createProxy = function () {
        return WidgetProxyProvider.create(this, this.widgetSubType, getWidgetPropsByType(this.widgetSubType));
    };
    BaseComponent.prototype.initContext = function () {
        var context = this.inj.view.context;
        var parentContexts = this.inj.get(Context, {});
        // assign the context property accordingly
        if (this.viewParent !== context) {
            this.context = context;
        }
        else {
            this.context = {};
        }
        if (parentContexts) {
            this.context = Object.assign.apply(Object, tslib_1.__spread([{}], parentContexts, [this.context]));
        }
    };
    /**
     * set the value on the proxy object ie, widget
     * setting the property on the proxy will invoke the change listeners
     * @param {string} key
     * @param value
     */
    BaseComponent.prototype.setWidgetProperty = function (key, value) {
        this.widget[key] = value;
    };
    BaseComponent.prototype.getAttr = function (attrName) {
        return this.$attrs.get(attrName);
    };
    /**
     * returns app instance
     * @returns {App}
     */
    BaseComponent.prototype.getAppInstance = function () {
        return this.inj.get(App);
    };
    /**
     * Generates a unique id
     * Default pattern is `widget-id-${id}`
     * Components can override this method to generate a different id eg, bar-chart-1
     */
    BaseComponent.prototype.generateWidgetId = function () {
        return widgetIdGenerator.nextUid();
    };
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
    BaseComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            var tagName = this.widgetType === 'wm-audio' ? 'audio' : 'video';
            // Trigger media(audio/video) element load method after changing autoplay property
            this.nativeElement.querySelector(tagName).load();
        }
        else if (key === 'conditionalstyle') {
            // update styles if old and nv value are different
            updateStyles(nv, ov, this.nativeElement);
        }
    };
    /**
     * Default style change handler
     */
    BaseComponent.prototype.onStyleChange = function (k, nv, ov) { };
    /**
     * Register the widget with the widgetRegistry
     */
    BaseComponent.prototype.registerWidget = function (widgetName) {
        this.registerDestroyListener(register(this.widget, this.viewParent, this.widgetId, widgetName));
    };
    /**
     * override the
     */
    BaseComponent.prototype.getMappedEventName = function (eventName) {
        return EVENTS_MAP.get(eventName) || eventName;
    };
    /**
     * invoke the event handler
     * Components can override this method to execute custom logic before invoking the user callback
     */
    BaseComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals, meta) {
        this.eventManager.addEventListener(node, eventName, function (e) {
            locals.$event = e;
            if (meta === 'delayed') {
                setTimeout(function () { return eventCallback(); }, 150);
            }
            else {
                return eventCallback();
            }
        });
    };
    /**
     * parse the event expression and save reference to the function inside eventHandlers map
     * If the component provides a override for an event through @Event decorator invoke that
     * else invoke the resolved function
     *
     * @param {string} eventName
     * @param {string} expr
     */
    BaseComponent.prototype.processEventAttr = function (eventName, expr, meta) {
        var _this = this;
        var fn = $parseEvent(expr);
        var locals = this.context;
        locals.widget = this.widget;
        var boundFn = fn.bind(undefined, this.viewParent, locals);
        var eventCallback = function () {
            var boundFnVal;
            $invokeWatchers(true);
            try {
                // If the event is bound directly to the variable then we need to internally handle
                // the promise returned by the variable call.
                boundFnVal = boundFn();
                if (boundFnVal instanceof Promise) {
                    boundFnVal.then(function (response) { return response; }, function (err) { return err; });
                }
                else {
                    return boundFnVal;
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        this.eventHandlers.set(this.getMappedEventName(eventName), { callback: eventCallback, locals: locals });
        // prepend eventName with on and convert it to camelcase.
        // eg, "click" ---> onClick
        var onEventName = _.camelCase("on-" + eventName);
        // save the eventCallback in widgetScope.
        this[onEventName] = eventCallback;
        // events needs to be setup after viewInit
        this.toBeSetupEventsQueue.push(function () {
            _this.handleEvent(_this.nativeElement, _this.getMappedEventName(eventName), eventCallback, locals, meta);
        });
    };
    /**
     * Process the bound property
     * Register a watch on the bound expression
     */
    BaseComponent.prototype.processBindAttr = function (propName, expr) {
        var _this = this;
        this.initState.delete(propName);
        this.registerDestroyListener($watch(expr, this.viewParent, this.context, function (nv) { return _this.widget[propName] = nv; }, getWatchIdentifier(this.widgetId, propName), propName === 'datasource'));
    };
    /**
     * Remove watch on the bound property
     */
    BaseComponent.prototype.removePropertyBinding = function (propName) {
        $unwatch(getWatchIdentifier(this.widgetId, propName));
    };
    /**
     * invoke the event callback method
     * @param {string} eventName
     * @param extraLocals
     */
    BaseComponent.prototype.invokeEventCallback = function (eventName, extraLocals) {
        var callbackInfo = this.eventHandlers.get(eventName);
        if (callbackInfo) {
            var fn = callbackInfo.callback;
            var locals = callbackInfo.locals || {};
            if (fn) {
                return fn(Object.assign(locals, extraLocals));
            }
        }
    };
    /**
     * Process the attribute
     * If the attribute is an event expression, generate a functional representation of the expression
     *      and keep in eventHandlers
     * If the attribute is a bound expression, register a watch on the expression
     */
    BaseComponent.prototype.processAttr = function (attrName, attrValue) {
        var _a = attrName.split('.'), propName = _a[0], type = _a[1], meta = _a[2], length = _a.length;
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
    };
    /**
     * Process the attributes
     */
    BaseComponent.prototype.processAttrs = function () {
        var e_1, _a;
        var elDef = this.inj.elDef;
        try {
            for (var _b = tslib_1.__values(elDef.element.attrs), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 3), attrName = _d[1], attrValue = _d[2];
                this.$attrs.set(attrName, attrValue);
                this.processAttr(attrName, attrValue);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Update the initState with the default property values and the values provided in the markup
     * Process the attributes
     * Register the widget
     */
    BaseComponent.prototype.initWidget = function () {
        var _this = this;
        this.initState = new Map();
        // get the widget properties
        var widgetProps = getWidgetPropsByType(this.widgetSubType);
        widgetProps.forEach(function (v, k) {
            if (isDefined(v.value)) {
                _this.initState.set(k, v.value);
            }
        });
        this.widgetProps = widgetProps;
        this.processAttrs();
        this.registerWidget(this.initState.get('name'));
    };
    /**
     * Update the default properties and the properties provided in the markup in component
     * Invoking this method will result in invocation of propertyChange handlers on the component for the first time
     */
    BaseComponent.prototype.setInitProps = function () {
        var _this = this;
        if (this.initState.get('name')) {
            this.widget.name = this.initState.get('name');
        }
        this.initState.forEach(function (v, k) {
            // name is already set, ignore name
            // if the key is part of to be ignored attributes list do not set it on the component instance
            if ((_this.widgetProps.get(k) || isStyle(k)) && k !== 'name') {
                _this.widget[k] = v;
            }
        });
        this.initState.clear();
        this.initState = undefined;
        this.readyState.next();
        this.readyState.complete();
    };
    /**
     * Returns true, if a listener registered for the given event on this widget markup.
     * @param eventName
     * @returns {boolean}
     */
    BaseComponent.prototype.hasEventCallback = function (eventName) {
        return this.eventHandlers.has(eventName);
    };
    /**
     * Sets the focus on the widget
     */
    BaseComponent.prototype.focus = function () {
        /**
         * Check for the nodes having focus-target attribute inside the element
         * If found, focus the first node (eg, date widget)
         * else, focus the element (eg, text widget)
         */
        var $target = this.$element[0].querySelector('[focus-target]');
        if (!$target) {
            $target = this.$element[0];
        }
        $target.focus();
    };
    // Defining the execute method on BaseComponent. If dataset is binded to widgets ouptut then datasource.execute will be defined
    BaseComponent.prototype.execute = function (operation, options) {
    };
    /**
     * nativeElement will be available by this time
     * if the delayInit is false, properties meta will be available by this time
     * Invoke the setInitProps if the delayInit is false
     */
    BaseComponent.prototype.ngOnInit = function () {
        if (!this.delayedInit) {
            this.setInitProps();
        }
    };
    /**
     * Register the events
     */
    BaseComponent.prototype.ngAfterViewInit = function () {
        var e_2, _a;
        if (this.toBeSetupEventsQueue.length) {
            try {
                for (var _b = tslib_1.__values(this.toBeSetupEventsQueue), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var fn = _c.value;
                    fn();
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        this.toBeSetupEventsQueue.length = 0;
    };
    BaseComponent.prototype.ngAfterContentInit = function () { };
    BaseComponent.prototype.ngOnDestroy = function () {
        this.isDestroyed = true;
        this.widget = Object.create(null);
        this.styleChange.complete();
        this.propertyChange.complete();
        this.destroy.complete();
    };
    return BaseComponent;
}());
export { BaseComponent };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Jhc2UvYmFzZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBbUMsVUFBVSxFQUErQixNQUFNLGVBQWUsQ0FBQztBQUN6RyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUxSyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN6RSxPQUFPLEVBQWtCLE9BQU8sRUFBaUIsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3JFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSWpFLGdFQUFnRTtBQUNoRSxJQUFNLGFBQWEsR0FBRyxVQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUN0QyxJQUFJLFFB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QyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUU7O2dCQUNsQyxLQUFpQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLG9CQUFvQixDQUFBLGdCQUFBLDRCQUFFO29CQUF2QyxJQUFNLEVBQUUsV0FBQTtvQkFDVCxFQUFFLEVBQUUsQ0FBQztpQkFDUjs7Ozs7Ozs7O1NBQ0o7UUFDRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsMENBQWtCLEdBQWxCLGNBQXNCLENBQUM7SUFFdkIsbUNBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBdmtCRCxJQXVrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0LCBFbGVtZW50UmVmLCBJbmplY3RvciwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEV2ZW50TWFuYWdlciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgeyBSZXBsYXlTdWJqZWN0LCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7ICRpbnZva2VXYXRjaGVycywgJHBhcnNlRXZlbnQsICR1bndhdGNoLCAkd2F0Y2gsIGFkZENsYXNzLCBzZXRDU1MsIHNldENTU0Zyb21PYmosIEFwcCwgaXNEZWZpbmVkLCByZW1vdmVBdHRyLCByZW1vdmVDbGFzcywgc2V0QXR0ciwgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IGdldFdpZGdldFByb3BzQnlUeXBlIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5pbXBvcnQgeyBpc1N0eWxlIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlciwgcmVuYW1lV2lkZ2V0IH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1yZWdpc3RyeSc7XG5pbXBvcnQgeyBDaGFuZ2VMaXN0ZW5lciwgQ29udGV4dCwgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyB3aWRnZXRJZEdlbmVyYXRvciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtaWQtZ2VuZXJhdG9yJztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSwgRVZFTlRTX01BUCB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgV2lkZ2V0UHJveHlQcm92aWRlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay93aWRnZXQtcHJveHktcHJvdmlkZXInO1xuaW1wb3J0IHsgZ2V0V2F0Y2hJZGVudGlmaWVyIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCAkLCBfO1xuXG4vLyBHZXRzIGxpc3Qgb2YgY2xhc3NlcyB0byBhZGQgYW5kIHJlbW92ZSBhbmQgYXBwbGllcyBvbiB0aGUgJGVsXG5jb25zdCB1cGRhdGVDbGFzc2VzID0gKHRvQWRkLCB0b1JlbW92ZSwgZWwpID0+IHtcbiAgICBpZiAodG9SZW1vdmUgJiYgdG9SZW1vdmUubGVuZ3RoKSB7XG4gICAgICAgIHJlbW92ZUNsYXNzKGVsLCBfLmpvaW4odG9SZW1vdmUsICcgJykpO1xuICAgIH1cbiAgICBpZiAodG9BZGQgJiYgdG9BZGQubGVuZ3RoKSB7XG4gICAgICAgIGFkZENsYXNzKGVsLCBfLmpvaW4odG9BZGQsICcgJykpO1xuICAgIH1cbn07XG5cbi8vIFRvIGFkZCBhbmQgcmVtb3ZlIHN0eWxlcyBvbiB0aGUgJGVsXG5jb25zdCB1cGRhdGVTdHlsZXMgPSAobnYsIG92LCBlbCkgPT4ge1xuICAgIGlmIChvdiAmJiBfLmlzT2JqZWN0KG92KSkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob3YgfHwge30pO1xuICAgICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBzZXRDU1MoZWwsIGtleSwgJycpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG52ICYmIF8uaXNPYmplY3QobnYpKSB7XG4gICAgICAgIHNldENTU0Zyb21PYmooZWwsIG52KTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQsIEFmdGVyVmlld0luaXQsIEFmdGVyQ29udGVudEluaXQge1xuXG4gICAgLyoqXG4gICAgICogdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoZSB3aWRnZXRcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZG9ubHkgd2lkZ2V0SWQ6IGFueTtcblxuICAgIHB1YmxpYyBpc0Rlc3Ryb3llZDogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIGpRdWVyeSBuYXRpdmVFbGVtZW50IHJlZmVyZW5jZSBvZiB0aGUgY29tcG9uZW50IHJvb3RcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0ICRlbGVtZW50KCkge1xuICAgICAgICByZXR1cm4gJCh0aGlzLm5hdGl2ZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERPTSBub2RlIHJlZmVyZW5jZSBvZiB0aGUgY29tcG9uZW50IHJvb3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmF0aXZlRWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBUeXBlIG9mIHRoZSBjb21wb25lbnRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgd2lkZ2V0VHlwZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogTW9zdCBvZiB0aGUgY2FzZXMgaXQgaXMgc2FtZSBhcyB3aWRnZXRUeXBlXG4gICAgICogZm9yIHNwZWNpZmljIHdpZGdldHMgbGlrZSBjaGFydHMgd2lkZ2V0VHlwZSBjYW4gYmUgd20tY2hhcnQgd2hlcmUgYXMgdGhlIHN1YnR5cGUgY2FuIGJlIHdtLWJhci1jaGFydFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZWFkb25seSB3aWRnZXRTdWJUeXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBQcm94eSBmb3IgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgd2lkZ2V0OiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBWaWV3IHBhcmVudCBjb21wb25lbnRcbiAgICAgKiBlZywgUGFnZSwgUGFydGlhbCwgUHJlZmFiXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IHZpZXdQYXJlbnQ6IGFueTtcblxuICAgIC8qKlxuICAgICAqIEV2ZW50TWFuZ2VyIHRvIGFkZC9yZW1vdmUgZXZlbnRzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IGV2ZW50TWFuYWdlcjogRXZlbnRNYW5hZ2VyO1xuXG4gICAgLyoqXG4gICAgICogQXBwIExvY2FsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSBhcHBMb2NhbGU6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFN0eWxlIGNoYW5nZSBzdWJqZWN0IGFuZCBvYnNlcnZhYmxlXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWFkb25seSBzdHlsZUNoYW5nZSA9IG5ldyBSZXBsYXlTdWJqZWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBQcm9wZXJ0eSBjaGFuZ2Ugc3ViamVjdCBhbmQgb2JzZXJ2YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcHJvcGVydHlDaGFuZ2UgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgLyoqXG4gICAgICogT24gUmVhZHkgU3RhdGUgY2hhbmdlIHN1YmplY3QgYW5kIG9ic2VydmFibGVcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IHJlYWR5U3RhdGUgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgLyoqXG4gICAgICogQ29tcG9uZW50IGRlc3Ryb3kgc3ViamVjdCBhbmQgb2JzZXJ2YWJsZVxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVzdHJveSA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICAvKipcbiAgICAgKiBNYXAgb2YgZXZlbnQgaGFuZGxlciBjYWxsYmFja3NcbiAgICAgKi9cbiAgICBwcml2YXRlIGV2ZW50SGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywge2NhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnl9PigpO1xuXG4gICAgLyoqXG4gICAgICogY29udGV4dCBvZiB0aGUgd2lkZ2V0XG4gICAgICogd2hlbiB0aGUgd2lkZ2V0IGlzIHByZXNldCBpbnNpZGUgYSByZXBlYXRlciB0aGlzIGNvbnRleHQgd2lsbCBoYXZlIHRoZSByZXBlYXRlciByZWxhdGVkIHByb3BlcnRpZXNcbiAgICAgKi9cbiAgICBwdWJsaWMgY29udGV4dDogYW55O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbCBzdGF0ZSBvZiB0aGUgd2lkZ2V0LlxuICAgICAqIFdpbGwgYmUgdW5kZWZpbmVkIG9uY2UgdGhlIGluaXRpYWwgcHJvcGVydGllcyBhcmUgc2V0IG9uIHRvIHRoZSBjb21wb25lbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRTdGF0ZTogTWFwPHN0cmluZywgYW55PjtcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZsYWcgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gd2FpdCBmb3IgdGhlIHdpZGdldCBpbml0aWFsaXphdGlvbiBvciBub3RcbiAgICAgKiBJZiB0aGUgaW5pdFByb21pc2UgaXMgcHJvdmlkZWQgaW4gdGhlIGNvbnN0cnVjdGlvbiB3YWl0IHRpbGwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWRcbiAgICAgKiBJZiB0aGUgaW5pdFByb21pc2UgaXMgbm90IHByb3ZpZGVkIHByb2NlZWQgd2l0aCB0aGUgaW5pdGlhbGl6YXRpb24sIHdoaWNoIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGVsYXllZEluaXQ6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5IHR5cGUgb2YgdGhlIGNvbXBvbmVudC4gZWcsIGJsb2NrKERlZmF1bHQpLCBpbmxpbmUtYmxvY2ssIGlubGluZSBldGNcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpc3BsYXlUeXBlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBIb2xkcyB0aGUgZXZlbnQgcmVnaXN0cmF0aW9uIGZ1bmN0aW9ucy5cbiAgICAgKiB0aGVzZSBmdW5jdGlvbnMgbmVlZHMgdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgb25WaWV3SW5pdFxuICAgICAqL1xuICAgIHByaXZhdGUgdG9CZVNldHVwRXZlbnRzUXVldWU6IEFycmF5PEZ1bmN0aW9uPiA9IFtdO1xuXG4gICAgcHVibGljIF9fY2xvbmVhYmxlX18gPSBmYWxzZTtcblxuICAgIHB1YmxpYyB3aWRnZXRQcm9wczogTWFwPHN0cmluZywgYW55PjtcblxuICAgIHByaXZhdGUgJGF0dHJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJvdGVjdGVkIGluajogSW5qZWN0b3IsXG4gICAgICAgIGNvbmZpZzogSVdpZGdldENvbmZpZyxcbiAgICAgICAgaW5pdFByb21pc2U/OiBQcm9taXNlPGFueT4gLy8gUHJvbWlzZSBvbiB3aGljaCB0aGUgaW5pdGlhbGl6YXRpb24gaGFzIHRvIHdhaXRcbiAgICApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudFJlZiA9IGluai5nZXQoRWxlbWVudFJlZik7XG4gICAgICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy53aWRnZXRUeXBlID0gY29uZmlnLndpZGdldFR5cGU7XG4gICAgICAgIHRoaXMud2lkZ2V0U3ViVHlwZSA9IGNvbmZpZy53aWRnZXRTdWJUeXBlIHx8IGNvbmZpZy53aWRnZXRUeXBlO1xuICAgICAgICB0aGlzLnZpZXdQYXJlbnQgPSAoaW5qIGFzIGFueSkudmlldy5jb21wb25lbnQ7XG4gICAgICAgIHRoaXMuZGlzcGxheVR5cGUgPSBjb25maWcuZGlzcGxheVR5cGUgfHwgRElTUExBWV9UWVBFLkJMT0NLO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSAoaW5qIGFzIGFueSkudmlldy5jb250ZXh0O1xuICAgICAgICB0aGlzLndpZGdldCA9IHRoaXMuY3JlYXRlUHJveHkoKTtcbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIgPSBpbmouZ2V0KEV2ZW50TWFuYWdlcik7XG4gICAgICAgICh0aGlzLm5hdGl2ZUVsZW1lbnQgYXMgYW55KS53aWRnZXQgPSB0aGlzLndpZGdldDtcblxuICAgICAgICB0aGlzLmFwcExvY2FsZSA9IGluai5nZXQoQXBwKS5hcHBMb2NhbGUgfHwge307XG5cbiAgICAgICAgdGhpcy5pbml0Q29udGV4dCgpO1xuXG4gICAgICAgIGlmIChjb25maWcuaG9zdENsYXNzKSB7XG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIGNvbmZpZy5ob3N0Q2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53aWRnZXRJZCA9IHRoaXMuZ2VuZXJhdGVXaWRnZXRJZCgpO1xuICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3dpZGdldC1pZCcsIHRoaXMud2lkZ2V0SWQsIHRydWUpO1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyIGRlZmF1bHQgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIgYW5kIHN0eWxlIGNoYW5nZSBoYW5kbGVyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJTdHlsZUNoYW5nZUxpc3RlbmVyKHRoaXMub25TdHlsZUNoYW5nZSwgdGhpcyk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJQcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKHRoaXMub25Qcm9wZXJ0eUNoYW5nZSwgdGhpcyk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGluaXRQcm9taXNlIGlzIHByb3ZpZGVkLCB3YWl0IHRpbGwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgdG8gcHJvY2VlZCB3aXRoIHRoZSB3aWRnZXQgaW5pdGlhbGl6YXRpb25cbiAgICAgICAgaWYgKCFpbml0UHJvbWlzZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0V2lkZ2V0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlbGF5ZWRJbml0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGluaXRQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFdpZGdldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5pdFByb3BzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXROYXRpdmVFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmF0aXZlRWxlbWVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0V2lkZ2V0VHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy53aWRnZXRUeXBlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRXaWRnZXRTdWJUeXBlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZGdldFN1YlR5cGU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFdpZGdldCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWRnZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFZpZXdQYXJlbnQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlld1BhcmVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgbm90aWZ5U3R5bGVDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92OiBhbnkpIHtcbiAgICAgICAgdGhpcy5zdHlsZUNoYW5nZS5uZXh0KHtrZXksIG52LCBvdn0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBub3RpZnlQcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y6IGFueSkge1xuICAgICAgICB0aGlzLnByb3BlcnR5Q2hhbmdlLm5leHQoe2tleSwgbnYsIG92fSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lzdGVyU3R5bGVDaGFuZ2VMaXN0ZW5lcihmbjogQ2hhbmdlTGlzdGVuZXIsIGN0eD86IGFueSkge1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBmbiA9IGZuLmJpbmQoY3R4KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0eWxlQ2hhbmdlLnN1YnNjcmliZSgoe2tleSwgbnYsIG92fSkgPT4gZm4oa2V5LCBudiwgb3YpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJSZWFkeVN0YXRlTGlzdGVuZXIoZm46IEZ1bmN0aW9uLCBjdHg/OiBhbnkpIHtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgZm4gPSBmbi5iaW5kKGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZS5pc1N0b3BwZWQpIHtcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWFkeVN0YXRlLnN1YnNjcmliZSgoKSA9PiBmbigpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXJQcm9wZXJ0eUNoYW5nZUxpc3RlbmVyKGZuOiBDaGFuZ2VMaXN0ZW5lciwgY3R4PzogYW55KSB7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGZuID0gZm4uYmluZChjdHgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvcGVydHlDaGFuZ2Uuc3Vic2NyaWJlKCh7a2V5LCBudiwgb3Z9KSA9PiBmbihrZXksIG52LCBvdikpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihmbjogRnVuY3Rpb24sIGN0eD86IGFueSkge1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBmbiA9IGZuLmJpbmQoY3R4KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlc3Ryb3kuc3Vic2NyaWJlKCgpID0+IHt9LCAoKSA9PiB7fSwgKCkgPT4gZm4oKSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldERpc3BsYXlUeXBlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3BsYXlUeXBlO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBjcmVhdGVQcm94eSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gV2lkZ2V0UHJveHlQcm92aWRlci5jcmVhdGUodGhpcywgdGhpcy53aWRnZXRTdWJUeXBlLCBnZXRXaWRnZXRQcm9wc0J5VHlwZSh0aGlzLndpZGdldFN1YlR5cGUpKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaW5pdENvbnRleHQoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSAodGhpcy5pbmogYXMgYW55KS52aWV3LmNvbnRleHQ7XG5cbiAgICAgICAgY29uc3QgcGFyZW50Q29udGV4dHMgPSB0aGlzLmluai5nZXQoQ29udGV4dCwge30pO1xuXG4gICAgICAgIC8vIGFzc2lnbiB0aGUgY29udGV4dCBwcm9wZXJ0eSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAodGhpcy52aWV3UGFyZW50ICE9PSBjb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyZW50Q29udGV4dHMpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IE9iamVjdC5hc3NpZ24oe30sIC4uLig8QXJyYXk8YW55Pj5wYXJlbnRDb250ZXh0cyksIHRoaXMuY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXQgdGhlIHZhbHVlIG9uIHRoZSBwcm94eSBvYmplY3QgaWUsIHdpZGdldFxuICAgICAqIHNldHRpbmcgdGhlIHByb3BlcnR5IG9uIHRoZSBwcm94eSB3aWxsIGludm9rZSB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0V2lkZ2V0UHJvcGVydHkoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy53aWRnZXRba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBdHRyKGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy4kYXR0cnMuZ2V0KGF0dHJOYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGFwcCBpbnN0YW5jZVxuICAgICAqIEByZXR1cm5zIHtBcHB9XG4gICAgICovXG4gICAgcHVibGljIGdldEFwcEluc3RhbmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmouZ2V0KEFwcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIGEgdW5pcXVlIGlkXG4gICAgICogRGVmYXVsdCBwYXR0ZXJuIGlzIGB3aWRnZXQtaWQtJHtpZH1gXG4gICAgICogQ29tcG9uZW50cyBjYW4gb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gZ2VuZXJhdGUgYSBkaWZmZXJlbnQgaWQgZWcsIGJhci1jaGFydC0xXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdlbmVyYXRlV2lkZ2V0SWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHdpZGdldElkR2VuZXJhdG9yLm5leHRVaWQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHRoZSBjb21tb24gZnVuY3Rpb25hbGl0eSBhY3Jvc3MgdGhlIGNvbXBvbmVudHNcbiAgICAgKiBlZyxcbiAgICAgKiAgMS4gdmFsdWUgb2YgdGhlIGNsYXNzIHByb3BlcnR5IHdpbGwgYmUgYXBwbGllZCBvbiB0aGUgaG9zdCBlbGVtZW50XG4gICAgICogIDIuIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBzaG93IHByb3BlcnR5IGNvbXBvbmVudCBpcyBzaG93bi9oaWRkZW5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0gbnZcbiAgICAgKiBAcGFyYW0gb3ZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3Nob3cnKSB7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQuaGlkZGVuID0gIW52O1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2hpbnQnKSB7XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3RpdGxlJywgbnYpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2NsYXNzJykge1xuICAgICAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBudiwgb3YpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ25hbWUnIHx8IGtleSA9PT0gJ3RhYmluZGV4Jykge1xuICAgICAgICAgICAgc2V0QXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsIGtleSwgbnYpO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ25hbWUnICYmIG52KSB7XG4gICAgICAgICAgICAgICAgcmVuYW1lV2lkZ2V0KHRoaXMudmlld1BhcmVudCwgdGhpcy53aWRnZXQsIG52LCBvdik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnY29uZGl0aW9uYWxjbGFzcycpIHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBjbGFzc2VzIGlmIG9sZCBhbmQgbnYgdmFsdWUgYXJlIGRpZmZlcmVudFxuICAgICAgICAgICAgdXBkYXRlQ2xhc3Nlcyhudi50b0FkZCwgbnYudG9SZW1vdmUsIHRoaXMubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSAgaWYgKGtleSA9PT0gJ2F1dG9wbGF5Jykge1xuICAgICAgICAgICAgY29uc3QgdGFnTmFtZSA9IHRoaXMud2lkZ2V0VHlwZSA9PT0gJ3dtLWF1ZGlvJyA/ICdhdWRpbycgOiAndmlkZW8nO1xuICAgICAgICAgICAgLy8gVHJpZ2dlciBtZWRpYShhdWRpby92aWRlbykgZWxlbWVudCBsb2FkIG1ldGhvZCBhZnRlciBjaGFuZ2luZyBhdXRvcGxheSBwcm9wZXJ0eVxuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IodGFnTmFtZSkubG9hZCgpO1xuICAgICAgICB9ICBlbHNlIGlmIChrZXkgPT09ICdjb25kaXRpb25hbHN0eWxlJykge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHN0eWxlcyBpZiBvbGQgYW5kIG52IHZhbHVlIGFyZSBkaWZmZXJlbnRcbiAgICAgICAgICAgIHVwZGF0ZVN0eWxlcyhudiwgb3YsIHRoaXMubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWZhdWx0IHN0eWxlIGNoYW5nZSBoYW5kbGVyXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG9uU3R5bGVDaGFuZ2Uoazogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge31cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRoZSB3aWRnZXQgd2l0aCB0aGUgd2lkZ2V0UmVnaXN0cnlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXJXaWRnZXQod2lkZ2V0TmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIocmVnaXN0ZXIodGhpcy53aWRnZXQsIHRoaXMudmlld1BhcmVudCwgdGhpcy53aWRnZXRJZCwgd2lkZ2V0TmFtZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIG92ZXJyaWRlIHRoZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRNYXBwZWRFdmVudE5hbWUoZXZlbnROYW1lKSB7XG4gICAgICAgIHJldHVybiBFVkVOVFNfTUFQLmdldChldmVudE5hbWUpIHx8IGV2ZW50TmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnZva2UgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICAgKiBDb21wb25lbnRzIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBleGVjdXRlIGN1c3RvbSBsb2dpYyBiZWZvcmUgaW52b2tpbmcgdGhlIHVzZXIgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnksIG1ldGE/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBldmVudE5hbWUsXG4gICAgICAgICAgICBlID0+IHtcbiAgICAgICAgICAgICAgICBsb2NhbHMuJGV2ZW50ID0gZTtcbiAgICAgICAgICAgICAgICBpZiAobWV0YSA9PT0gJ2RlbGF5ZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBldmVudENhbGxiYWNrKCksIDE1MCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50Q2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcGFyc2UgdGhlIGV2ZW50IGV4cHJlc3Npb24gYW5kIHNhdmUgcmVmZXJlbmNlIHRvIHRoZSBmdW5jdGlvbiBpbnNpZGUgZXZlbnRIYW5kbGVycyBtYXBcbiAgICAgKiBJZiB0aGUgY29tcG9uZW50IHByb3ZpZGVzIGEgb3ZlcnJpZGUgZm9yIGFuIGV2ZW50IHRocm91Z2ggQEV2ZW50IGRlY29yYXRvciBpbnZva2UgdGhhdFxuICAgICAqIGVsc2UgaW52b2tlIHRoZSByZXNvbHZlZCBmdW5jdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBleHByXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NFdmVudEF0dHIoZXZlbnROYW1lOiBzdHJpbmcsIGV4cHI6IHN0cmluZywgbWV0YT86IHN0cmluZykge1xuICAgICAgICBjb25zdCBmbiA9ICRwYXJzZUV2ZW50KGV4cHIpO1xuICAgICAgICBjb25zdCBsb2NhbHMgPSB0aGlzLmNvbnRleHQ7XG4gICAgICAgIGxvY2Fscy53aWRnZXQgPSB0aGlzLndpZGdldDtcbiAgICAgICAgY29uc3QgYm91bmRGbiA9IGZuLmJpbmQodW5kZWZpbmVkLCB0aGlzLnZpZXdQYXJlbnQsIGxvY2Fscyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBib3VuZEZuVmFsO1xuICAgICAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgaXMgYm91bmQgZGlyZWN0bHkgdG8gdGhlIHZhcmlhYmxlIHRoZW4gd2UgbmVlZCB0byBpbnRlcm5hbGx5IGhhbmRsZVxuICAgICAgICAgICAgICAgIC8vIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSB2YXJpYWJsZSBjYWxsLlxuICAgICAgICAgICAgICAgIGJvdW5kRm5WYWwgPSBib3VuZEZuKCk7XG4gICAgICAgICAgICAgICAgaWYgKGJvdW5kRm5WYWwgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kRm5WYWwudGhlbiggcmVzcG9uc2UgPT4gcmVzcG9uc2UsIGVyciA9PiBlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBib3VuZEZuVmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zZXQodGhpcy5nZXRNYXBwZWRFdmVudE5hbWUoZXZlbnROYW1lKSwge2NhbGxiYWNrOiBldmVudENhbGxiYWNrLCBsb2NhbHN9KTtcbiAgICAgICAgLy8gcHJlcGVuZCBldmVudE5hbWUgd2l0aCBvbiBhbmQgY29udmVydCBpdCB0byBjYW1lbGNhc2UuXG4gICAgICAgIC8vIGVnLCBcImNsaWNrXCIgLS0tPiBvbkNsaWNrXG4gICAgICAgIGNvbnN0IG9uRXZlbnROYW1lID0gIF8uY2FtZWxDYXNlKGBvbi0ke2V2ZW50TmFtZX1gKTtcbiAgICAgICAgLy8gc2F2ZSB0aGUgZXZlbnRDYWxsYmFjayBpbiB3aWRnZXRTY29wZS5cbiAgICAgICAgdGhpc1tvbkV2ZW50TmFtZV0gPSBldmVudENhbGxiYWNrO1xuXG4gICAgICAgIC8vIGV2ZW50cyBuZWVkcyB0byBiZSBzZXR1cCBhZnRlciB2aWV3SW5pdFxuICAgICAgICB0aGlzLnRvQmVTZXR1cEV2ZW50c1F1ZXVlLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFdmVudCh0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMuZ2V0TWFwcGVkRXZlbnROYW1lKGV2ZW50TmFtZSksIGV2ZW50Q2FsbGJhY2ssIGxvY2FscywgbWV0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgdGhlIGJvdW5kIHByb3BlcnR5XG4gICAgICogUmVnaXN0ZXIgYSB3YXRjaCBvbiB0aGUgYm91bmQgZXhwcmVzc2lvblxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwcm9jZXNzQmluZEF0dHIocHJvcE5hbWU6IHN0cmluZywgZXhwcjogc3RyaW5nKSB7XG5cbiAgICAgICAgdGhpcy5pbml0U3RhdGUuZGVsZXRlKHByb3BOYW1lKTtcblxuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKFxuICAgICAgICAgICAgJHdhdGNoKFxuICAgICAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3UGFyZW50LFxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICAgICBudiA9PiB0aGlzLndpZGdldFtwcm9wTmFtZV0gPSBudixcbiAgICAgICAgICAgICAgICBnZXRXYXRjaElkZW50aWZpZXIodGhpcy53aWRnZXRJZCwgcHJvcE5hbWUpLFxuICAgICAgICAgICAgICAgIHByb3BOYW1lID09PSAnZGF0YXNvdXJjZSdcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgd2F0Y2ggb24gdGhlIGJvdW5kIHByb3BlcnR5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbW92ZVByb3BlcnR5QmluZGluZyhwcm9wTmFtZTogc3RyaW5nKSB7XG4gICAgICAgICR1bndhdGNoKGdldFdhdGNoSWRlbnRpZmllcih0aGlzLndpZGdldElkLCBwcm9wTmFtZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGludm9rZSB0aGUgZXZlbnQgY2FsbGJhY2sgbWV0aG9kXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSBleHRyYUxvY2Fsc1xuICAgICAqL1xuICAgIHB1YmxpYyBpbnZva2VFdmVudENhbGxiYWNrKGV2ZW50TmFtZTogc3RyaW5nLCBleHRyYUxvY2Fscz86IGFueSkge1xuICAgICAgICBjb25zdCBjYWxsYmFja0luZm8gPSB0aGlzLmV2ZW50SGFuZGxlcnMuZ2V0KGV2ZW50TmFtZSk7XG4gICAgICAgIGlmIChjYWxsYmFja0luZm8pIHtcbiAgICAgICAgICAgIGNvbnN0IGZuID0gY2FsbGJhY2tJbmZvLmNhbGxiYWNrO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxzID0gY2FsbGJhY2tJbmZvLmxvY2FscyB8fCB7fTtcblxuICAgICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuKE9iamVjdC5hc3NpZ24obG9jYWxzLCBleHRyYUxvY2FscykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2VzcyB0aGUgYXR0cmlidXRlXG4gICAgICogSWYgdGhlIGF0dHJpYnV0ZSBpcyBhbiBldmVudCBleHByZXNzaW9uLCBnZW5lcmF0ZSBhIGZ1bmN0aW9uYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGV4cHJlc3Npb25cbiAgICAgKiAgICAgIGFuZCBrZWVwIGluIGV2ZW50SGFuZGxlcnNcbiAgICAgKiBJZiB0aGUgYXR0cmlidXRlIGlzIGEgYm91bmQgZXhwcmVzc2lvbiwgcmVnaXN0ZXIgYSB3YXRjaCBvbiB0aGUgZXhwcmVzc2lvblxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwcm9jZXNzQXR0cihhdHRyTmFtZTogc3RyaW5nLCBhdHRyVmFsdWU6IHN0cmluZykge1xuICAgICAgICBjb25zdCB7MDogcHJvcE5hbWUsIDE6IHR5cGUsIDI6IG1ldGEsIGxlbmd0aH0gPSBhdHRyTmFtZS5zcGxpdCgnLicpO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ2JpbmQnKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgc2hvdyBwcm9wZXJ0eSBpcyBib3VuZCwgc2V0IHRoZSBpbml0aWFsIHZhbHVlIHRvIGZhbHNlXG4gICAgICAgICAgICBpZiAocHJvcE5hbWUgPT09ICdzaG93Jykge1xuICAgICAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5oaWRkZW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9jZXNzQmluZEF0dHIocHJvcE5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2V2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5wcm9jZXNzRXZlbnRBdHRyKHByb3BOYW1lLCBhdHRyVmFsdWUsIG1ldGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGNsYXNzIGFuZCBuYW1lIGF0dHJpYnV0ZXMuIENvbXBvbmVudCB3aWxsIHNldCB0aGVtIG9uIHRoZSBwcm9wZXIgbm9kZVxuICAgICAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhdHRyTmFtZSA9PT0gJ3RhYmluZGV4JyB8fCBhdHRyTmFtZSA9PT0gJ25hbWUnKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsIGF0dHJOYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pbml0U3RhdGUuc2V0KHByb3BOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY3VzdG9tIGF0dHJpYnV0ZXMgcHJvdmlkZWQgb24gZWxEZWY7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIHRoZSBhdHRyaWJ1dGVzXG4gICAgICovXG4gICAgcHJpdmF0ZSBwcm9jZXNzQXR0cnMoKSB7XG4gICAgICAgIGNvbnN0IGVsRGVmID0gKHRoaXMuaW5qIGFzIGFueSkuZWxEZWY7XG5cbiAgICAgICAgZm9yIChjb25zdCBbLCBhdHRyTmFtZSwgYXR0clZhbHVlXSBvZiBlbERlZi5lbGVtZW50LmF0dHJzKSB7XG4gICAgICAgICAgICB0aGlzLiRhdHRycy5zZXQoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NBdHRyKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBpbml0U3RhdGUgd2l0aCB0aGUgZGVmYXVsdCBwcm9wZXJ0eSB2YWx1ZXMgYW5kIHRoZSB2YWx1ZXMgcHJvdmlkZWQgaW4gdGhlIG1hcmt1cFxuICAgICAqIFByb2Nlc3MgdGhlIGF0dHJpYnV0ZXNcbiAgICAgKiBSZWdpc3RlciB0aGUgd2lkZ2V0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGluaXRXaWRnZXQoKSB7XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcblxuICAgICAgICAvLyBnZXQgdGhlIHdpZGdldCBwcm9wZXJ0aWVzXG4gICAgICAgIGNvbnN0IHdpZGdldFByb3BzOiBNYXA8c3RyaW5nLCBhbnk+ID0gZ2V0V2lkZ2V0UHJvcHNCeVR5cGUodGhpcy53aWRnZXRTdWJUeXBlKTtcbiAgICAgICAgd2lkZ2V0UHJvcHMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGVmaW5lZCh2LnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFN0YXRlLnNldChrLCB2LnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy53aWRnZXRQcm9wcyA9IHdpZGdldFByb3BzO1xuXG4gICAgICAgIHRoaXMucHJvY2Vzc0F0dHJzKCk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlcldpZGdldCh0aGlzLmluaXRTdGF0ZS5nZXQoJ25hbWUnKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHRoZSBkZWZhdWx0IHByb3BlcnRpZXMgYW5kIHRoZSBwcm9wZXJ0aWVzIHByb3ZpZGVkIGluIHRoZSBtYXJrdXAgaW4gY29tcG9uZW50XG4gICAgICogSW52b2tpbmcgdGhpcyBtZXRob2Qgd2lsbCByZXN1bHQgaW4gaW52b2NhdGlvbiBvZiBwcm9wZXJ0eUNoYW5nZSBoYW5kbGVycyBvbiB0aGUgY29tcG9uZW50IGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXRJbml0UHJvcHMoKSB7XG4gICAgICAgIGlmICh0aGlzLmluaXRTdGF0ZS5nZXQoJ25hbWUnKSkge1xuICAgICAgICAgICAgdGhpcy53aWRnZXQubmFtZSA9IHRoaXMuaW5pdFN0YXRlLmdldCgnbmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgICAgIC8vIG5hbWUgaXMgYWxyZWFkeSBzZXQsIGlnbm9yZSBuYW1lXG4gICAgICAgICAgICAvLyBpZiB0aGUga2V5IGlzIHBhcnQgb2YgdG8gYmUgaWdub3JlZCBhdHRyaWJ1dGVzIGxpc3QgZG8gbm90IHNldCBpdCBvbiB0aGUgY29tcG9uZW50IGluc3RhbmNlXG4gICAgICAgICAgICBpZiAoKHRoaXMud2lkZ2V0UHJvcHMuZ2V0KGspIHx8IGlzU3R5bGUoaykpICYmIGsgIT09ICduYW1lJykge1xuICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0W2tdID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuaW5pdFN0YXRlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZS5uZXh0KCk7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZS5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSwgaWYgYSBsaXN0ZW5lciByZWdpc3RlcmVkIGZvciB0aGUgZ2l2ZW4gZXZlbnQgb24gdGhpcyB3aWRnZXQgbWFya3VwLlxuICAgICAqIEBwYXJhbSBldmVudE5hbWVcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGFzRXZlbnRDYWxsYmFjayhldmVudE5hbWUpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRIYW5kbGVycy5oYXMoZXZlbnROYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBmb2N1cyBvbiB0aGUgd2lkZ2V0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGZvY3VzKCk6IHZvaWQge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgZm9yIHRoZSBub2RlcyBoYXZpbmcgZm9jdXMtdGFyZ2V0IGF0dHJpYnV0ZSBpbnNpZGUgdGhlIGVsZW1lbnRcbiAgICAgICAgICogSWYgZm91bmQsIGZvY3VzIHRoZSBmaXJzdCBub2RlIChlZywgZGF0ZSB3aWRnZXQpXG4gICAgICAgICAqIGVsc2UsIGZvY3VzIHRoZSBlbGVtZW50IChlZywgdGV4dCB3aWRnZXQpXG4gICAgICAgICAqL1xuICAgICAgICBsZXQgJHRhcmdldCA9IHRoaXMuJGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignW2ZvY3VzLXRhcmdldF0nKTtcbiAgICAgICAgaWYgKCEkdGFyZ2V0KSB7XG4gICAgICAgICAgICAkdGFyZ2V0ID0gdGhpcy4kZWxlbWVudFswXTtcbiAgICAgICAgfVxuICAgICAgICAkdGFyZ2V0LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5pbmcgdGhlIGV4ZWN1dGUgbWV0aG9kIG9uIEJhc2VDb21wb25lbnQuIElmIGRhdGFzZXQgaXMgYmluZGVkIHRvIHdpZGdldHMgb3VwdHV0IHRoZW4gZGF0YXNvdXJjZS5leGVjdXRlIHdpbGwgYmUgZGVmaW5lZFxuICAgIHByb3RlY3RlZCBleGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucyk6IGFueSB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBuYXRpdmVFbGVtZW50IHdpbGwgYmUgYXZhaWxhYmxlIGJ5IHRoaXMgdGltZVxuICAgICAqIGlmIHRoZSBkZWxheUluaXQgaXMgZmFsc2UsIHByb3BlcnRpZXMgbWV0YSB3aWxsIGJlIGF2YWlsYWJsZSBieSB0aGlzIHRpbWVcbiAgICAgKiBJbnZva2UgdGhlIHNldEluaXRQcm9wcyBpZiB0aGUgZGVsYXlJbml0IGlzIGZhbHNlXG4gICAgICovXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5kZWxheWVkSW5pdCkge1xuICAgICAgICAgICAgdGhpcy5zZXRJbml0UHJvcHMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRoZSBldmVudHNcbiAgICAgKi9cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLnRvQmVTZXR1cEV2ZW50c1F1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBmbiBvZiB0aGlzLnRvQmVTZXR1cEV2ZW50c1F1ZXVlKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRvQmVTZXR1cEV2ZW50c1F1ZXVlLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge31cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLmlzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy53aWRnZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLnN0eWxlQ2hhbmdlLmNvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMucHJvcGVydHlDaGFuZ2UuY29tcGxldGUoKTtcbiAgICAgICAgdGhpcy5kZXN0cm95LmNvbXBsZXRlKCk7XG4gICAgfVxufVxuIl19