/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { HtmlParser, Element, Text, Comment, getHtmlTagDefinition } from '@angular/compiler';
/** @type {?} */
var CSS_REGEX = {
    COMMENTS_FORMAT: /\/\*((?!\*\/).|\n)+\*\//g,
    SELECTOR_FORMAT: /[^\{\}]*\{/gi,
    SELECTOR_EXCLUDE_FORMAT: /(@keyframes|@media|@font-face|@comment[0-9]+|from|to|[0-9]+%)\b/i
};
/** @type {?} */
var isString = function (v) { return typeof v === 'string'; };
var ɵ0 = isString;
/**
 * @record
 */
function IProviderInfo() { }
if (false) {
    /** @type {?} */
    IProviderInfo.prototype.nodeName;
    /** @type {?} */
    IProviderInfo.prototype.provide;
}
/** @type {?} */
var OVERRIDES = {
    'accessroles': '*accessroles',
    'ng-if': '*ngIf',
    'showindevice': 'showInDevice',
    'ng-class': '[ngClass]',
    'data-ng-class': '[ngClass]',
    'data-ng-src': 'src',
    'ng-src': 'src',
    'data-ng-href': 'href',
    'ng-href': 'href',
    'ng-disabled': 'disabled',
    'data-ng-disabled': 'disabled',
    'ng-model': '[ngModelOptions]="{standalone: true}" [(ngModel)]'
};
/** @type {?} */
var selfClosingTags = new Set(['img']);
/** @type {?} */
export var getBoundToExpr = function (value) {
    if (!value) {
        return null;
    }
    value = value.trim();
    if (value.startsWith('bind:')) {
        return value.substr(5);
    }
};
/** @type {?} */
var quoteAttr = function (v) {
    return ('' + v) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};
var ɵ1 = quoteAttr;
/** @type {?} */
var registry = new Map();
/** @type {?} */
var htmlParser = new HtmlParser();
/** @type {?} */
var ignoreComments = true;
/** @type {?} */
var empty = function () { return ''; };
var ɵ2 = empty;
/** @type {?} */
var isEvent = function (name) { return name[0] === 'o' && name[1] === 'n' && name[2] === '-'; };
var ɵ3 = isEvent;
/** @type {?} */
var getEventName = function (key) { return key.substr(3); };
var ɵ4 = getEventName;
/** @type {?} */
var processBinding = function (attr, expr) { return [attr.name + ".bind", quoteAttr(expr)]; };
var ɵ5 = processBinding;
/** @type {?} */
var processEvent = function (attr) {
    /** @type {?} */
    var evtName = getEventName(attr.name);
    return [evtName + ".event", attr.value];
};
var ɵ6 = processEvent;
/**
 * Wraps the string with single quotes.
 * \@param val
 * @type {?}
 */
var wrapWithApos = function (val) {
    return "&apos;" + val.replace(/&apos/g, '&quot').replace(/&quot/g, '\\&quot') + "&apos;";
};
var ɵ7 = wrapWithApos;
/** @type {?} */
var processAttr = function (attr) {
    /** @type {?} */
    var overridden = OVERRIDES[attr.name];
    /** @type {?} */
    var value = attr.valueSpan ? attr.value : undefined;
    if (overridden) {
        /**
         * wrap value for accessroles with ''.
         * since accessroles is a structural directive, it will be transpiled to [accessroles]
         * hence, the value against it should be a computed string
         */
        if (attr.name === 'accessroles') {
            return [overridden, "'" + value + "'"];
        }
        return [overridden, quoteAttr(value)];
    }
    if (isEvent(attr.name)) {
        return processEvent(attr);
    }
    /** @type {?} */
    var boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }
    return [attr.name, quoteAttr(value)];
};
var ɵ8 = processAttr;
/** @type {?} */
export var getDataSource = function (dataSetExpr) {
    /** @type {?} */
    var parts = dataSetExpr.split('.');
    if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
        return parts[0] + "." + parts[1];
    }
};
/** @type {?} */
export var getFormMarkupAttr = function (attrs) {
    if (attrs.get('datavalue.bind')) {
        /** @type {?} */
        var onDataValueBinding = getDataSource(attrs.get('datavalue.bind'));
        attrs.set('datavaluesource.bind', onDataValueBinding);
    }
    return getAttrMarkup(attrs);
};
/** @type {?} */
var getAttrMap = function (attrs) {
    /** @type {?} */
    var attrMap = new Map();
    attrs.forEach(function (attr) {
        var _a = tslib_1.__read(processAttr(attr), 2), attrName = _a[0], attrValue = _a[1];
        attrMap.set(attrName, attrValue);
    });
    if (attrMap.get('dataset.bind')) {
        /** @type {?} */
        var dataSource = getDataSource(attrMap.get('dataset.bind'));
        if (dataSource) {
            attrMap.set('datasource.bind', dataSource);
        }
    }
    return attrMap;
};
var ɵ9 = getAttrMap;
/** @type {?} */
export var getAttrMarkup = function (attrs) {
    /** @type {?} */
    var attrMarkup = '';
    attrs.forEach(function (v, k) {
        attrMarkup += " " + k;
        if (v) {
            v = v.trim();
            if (k === '[ngClass]' && v.startsWith('{')) {
                v = v.replace(/"/g, "'");
            }
            if (k === 'show.bind' && attrs.get('deferload') === 'true') {
                v = v + ("\" *lazyLoad=\"" + wrapWithApos(v));
            }
            attrMarkup += "=\"" + v + "\"";
        }
    });
    return attrMarkup;
};
/** @type {?} */
var getRequiredProviders = function (nodeDef, providers, nodeAttrs) {
    if (!nodeDef.requires) {
        return [];
    }
    /** @type {?} */
    var requires = (/** @type {?} */ (nodeDef.requires));
    if (isString(requires)) {
        requires = [requires];
    }
    if (!Array.isArray(requires)) {
        return [];
    }
    return requires.map(function (require) {
        // for dynamic table assigning parent provide map to the child,
        for (var i = nodeAttrs.length - 1; i >= 0; i--) {
            if (nodeAttrs[i].name === 'tableName') {
                return nodeDef[nodeAttrs[i].value];
            }
        }
        for (var i = providers.length - 1; i >= 0; i--) {
            if (providers[i].nodeName === require) {
                return providers[i].provide;
            }
        }
    });
};
var ɵ10 = getRequiredProviders;
/** @type {?} */
var DIMENSION_PROPS = ['padding', 'borderwidth', 'margin'];
/** @type {?} */
var SEPARATOR = ' ';
/** @type {?} */
var UNSET = 'unset';
/** @type {?} */
var setDimensionProp = function (cssObj, key, nv) {
    /** @type {?} */
    var cssKey = key;
    /** @type {?} */
    var val;
    /** @type {?} */
    var top;
    /** @type {?} */
    var right;
    /** @type {?} */
    var bottom;
    /** @type {?} */
    var left;
    /** @type {?} */
    var suffix = '';
    /**
     * @param {?} prop
     * @param {?} value
     * @return {?}
     */
    function setVal(prop, value) {
        // if the value is UNSET, reset the existing value
        if (value === UNSET) {
            value = '';
        }
        cssObj[cssKey + prop + suffix] = value;
    }
    if (key === 'borderwidth') {
        suffix = 'width';
        cssKey = 'border';
    }
    val = nv;
    if (val.indexOf(UNSET) !== -1) {
        val = val.split(SEPARATOR);
        top = val[0];
        right = val[1] || val[0];
        bottom = val[2] || val[0];
        left = val[3] || val[1] || val[0];
        setVal('top', top);
        setVal('right', right);
        setVal('bottom', bottom);
        setVal('left', left);
    }
    else {
        if (key === 'borderwidth') {
            cssKey = 'borderwidth';
        }
        cssObj[cssKey] = nv;
    }
};
var ɵ11 = setDimensionProp;
/** @type {?} */
var processDimensionAttributes = function (attrMap) {
    /** @type {?} */
    var attrKeys = Array.from(attrMap.keys());
    attrKeys.forEach(function (attrKey) {
        if (DIMENSION_PROPS.includes(attrKey)) {
            /** @type {?} */
            var cssObj_1 = {};
            /** @type {?} */
            var attrValue = attrMap.get(attrKey);
            attrMap.delete(attrKey);
            setDimensionProp(cssObj_1, attrKey, attrValue);
            Object.keys(cssObj_1).forEach(function (key) {
                if (cssObj_1[key]) {
                    attrMap.set(key, cssObj_1[key]);
                }
            });
        }
    });
};
var ɵ12 = processDimensionAttributes;
// replace <:svg:svg> -> <svg>, <:svg:*> -> <svg:*>
/** @type {?} */
var getNodeName = function (name) { return name.replace(':svg:svg', 'svg').replace(':svg:', 'svg:'); };
var ɵ13 = getNodeName;
/** @type {?} */
export var processNode = function (node, providers) {
    /** @type {?} */
    var nodeDef = registry.get(node.name);
    /** @type {?} */
    var pre;
    /** @type {?} */
    var post;
    /** @type {?} */
    var template;
    if (nodeDef) {
        pre = nodeDef.pre || empty;
        post = nodeDef.post || empty;
        template = nodeDef.template || empty;
    }
    /** @type {?} */
    var markup = '';
    /** @type {?} */
    var attrMap;
    /** @type {?} */
    var requiredProviders;
    /** @type {?} */
    var shared;
    if (!providers) {
        providers = [];
    }
    /** @type {?} */
    var isElementType = node instanceof Element;
    if (isElementType) {
        /** @type {?} */
        var provideInfo = void 0;
        if (nodeDef) {
            requiredProviders = getRequiredProviders(nodeDef, providers, node.attrs);
            shared = new Map();
            template.apply(void 0, tslib_1.__spread([node, shared], requiredProviders));
        }
        attrMap = getAttrMap(node.attrs);
        processDimensionAttributes(attrMap);
        /** @type {?} */
        var nodeName = getNodeName(node.name);
        if (nodeDef) {
            markup = ((/** @type {?} */ (pre))).apply(void 0, tslib_1.__spread([attrMap, shared], requiredProviders));
            if (nodeDef.provide) {
                provideInfo = {
                    nodeName: node.name,
                    provide: _.isFunction(nodeDef.provide) ? nodeDef.provide.apply(nodeDef, tslib_1.__spread([attrMap, shared], requiredProviders)) : nodeDef.provide
                };
                // For table node, assigning parent provide map to the child, as child requires some parent provide attrs.
                if (node.name === 'wm-table') {
                    /** @type {?} */
                    var tableColNodeDefn = registry.get('wm-table-column');
                    tableColNodeDefn[_.find(node.attrs, function (el) { return el.name === 'name'; }).value] = provideInfo.provide;
                    registry.set('wm-table-column', tableColNodeDefn);
                }
                providers.push(provideInfo);
            }
        }
        else {
            markup = "<" + nodeName + " " + getAttrMarkup(attrMap) + ">";
        }
        node.children.forEach(function (child) { return markup += processNode(child, providers); });
        if (nodeDef) {
            if (provideInfo) {
                providers.splice(providers.indexOf(provideInfo), 1);
            }
            markup += ((/** @type {?} */ (post))).apply(void 0, tslib_1.__spread([attrMap, shared], requiredProviders));
        }
        else {
            if (node.endSourceSpan && !getHtmlTagDefinition(node.name).isVoid) {
                markup += "</" + nodeName + ">";
            }
        }
    }
    else if (node instanceof Text) {
        markup += node.value;
    }
    else if (node instanceof Comment) {
        if (!ignoreComments) {
            markup += node.value;
        }
    }
    return markup;
};
/** @type {?} */
export var transpile = function (markup) {
    if (markup === void 0) { markup = ''; }
    var e_1, _a;
    if (!markup.length) {
        return;
    }
    /** @type {?} */
    var nodes = htmlParser.parse(markup, '');
    if (nodes.errors.length) {
        return;
    }
    /** @type {?} */
    var output = '';
    try {
        for (var _b = tslib_1.__values(nodes.rootNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
            var node = _c.value;
            output += processNode(node);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return output;
};
/** @type {?} */
export var register = function (nodeName, nodeDefFn) { return registry.set(nodeName, nodeDefFn()); };
/**
 * @record
 */
export function IBuildTaskDef() { }
if (false) {
    /** @type {?|undefined} */
    IBuildTaskDef.prototype.requires;
    /** @type {?|undefined} */
    IBuildTaskDef.prototype.template;
    /** @type {?} */
    IBuildTaskDef.prototype.pre;
    /** @type {?|undefined} */
    IBuildTaskDef.prototype.provide;
    /** @type {?|undefined} */
    IBuildTaskDef.prototype.post;
}
/** @type {?} */
export var scopeComponentStyles = function (componentName, componentType, styles) {
    if (styles === void 0) { styles = ''; }
    componentName = componentName.toLowerCase();
    /** @type {?} */
    var comments = {};
    /** @type {?} */
    var commentCount = 0;
    if (styles.startsWith('/*DISABLE_SCOPING*/')) {
        return styles;
    }
    styles = styles.replace(CSS_REGEX.COMMENTS_FORMAT, function (comment) {
        /** @type {?} */
        var key = "@comment" + commentCount++ + "{";
        comments[key] = comment;
        return key;
    });
    styles = styles.replace(CSS_REGEX.SELECTOR_FORMAT, function (selector) {
        if (!CSS_REGEX.SELECTOR_EXCLUDE_FORMAT.test(selector)) {
            /** @type {?} */
            var firstNonSpaceCharIndex = selector.match(/\S/).index;
            /** @type {?} */
            var prefixSpaceCharSeq = '';
            if (firstNonSpaceCharIndex > 0) {
                prefixSpaceCharSeq = selector.substring(0, firstNonSpaceCharIndex);
                selector = selector.substring(firstNonSpaceCharIndex);
            }
            if (!selector.startsWith('/*') && selector.trim().length > 0) {
                /** @type {?} */
                var spaceIndex = selector.indexOf(' ');
                if (selector.startsWith('.wm-app')) {
                    if (spaceIndex > 0) {
                        selector = selector.substring(spaceIndex + 1);
                    }
                    else {
                        return selector;
                    }
                }
                if (componentType === 0 || componentType === 'PAGE') {
                    selector = ".wm-app app-page-" + componentName + " " + selector;
                }
                else if (componentType === 1 || componentType === 'PREFAB') {
                    selector = ".wm-app app-prefab-" + componentName + " " + selector;
                }
                else if (componentType === 2 || componentType === 'PARTIAL') {
                    selector = ".wm-app app-partial-" + componentName + " " + selector;
                }
            }
            selector = prefixSpaceCharSeq + selector;
        }
        return selector;
    });
    for (var key in comments) {
        styles = styles.replace(key, comments[key]);
    }
    return styles;
};
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12, ɵ13 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdHJhbnNwaWxlci8iLCJzb3VyY2VzIjpbImJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsT0FBTyxFQUNILFVBQVUsRUFDVixPQUFPLEVBQ1AsSUFBSSxFQUNKLE9BQU8sRUFDUCxvQkFBb0IsRUFDdkIsTUFBTSxtQkFBbUIsQ0FBQzs7SUFHckIsU0FBUyxHQUFHO0lBQ2QsZUFBZSxFQUFHLDBCQUEwQjtJQUM1QyxlQUFlLEVBQUcsY0FBYztJQUNoQyx1QkFBdUIsRUFBRyxrRUFBa0U7Q0FDL0Y7O0lBRUssUUFBUSxHQUFHLFVBQUEsQ0FBQyxJQUFJLE9BQUEsT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFyQixDQUFxQjs7Ozs7QUFFM0MsNEJBR0M7OztJQUZHLGlDQUFpQjs7SUFDakIsZ0NBQTBCOzs7SUFHeEIsU0FBUyxHQUFHO0lBQ2QsYUFBYSxFQUFFLGNBQWM7SUFDN0IsT0FBTyxFQUFFLE9BQU87SUFDaEIsY0FBYyxFQUFFLGNBQWM7SUFDOUIsVUFBVSxFQUFFLFdBQVc7SUFDdkIsZUFBZSxFQUFFLFdBQVc7SUFDNUIsYUFBYSxFQUFFLEtBQUs7SUFDcEIsUUFBUSxFQUFFLEtBQUs7SUFDZixjQUFjLEVBQUUsTUFBTTtJQUN0QixTQUFTLEVBQUUsTUFBTTtJQUNqQixhQUFhLEVBQUUsVUFBVTtJQUN6QixrQkFBa0IsRUFBRSxVQUFVO0lBQzlCLFVBQVUsRUFBRSxtREFBbUQ7Q0FDbEU7O0lBRUssZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXhDLE1BQU0sS0FBTyxjQUFjLEdBQUcsVUFBQyxLQUFhO0lBQ3hDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxD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QUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDakQ7eUJBQU07d0JBQ0gsT0FBTyxRQUFRLENBQUM7cUJBQ25CO2lCQUNKO2dCQUVELElBQUksYUFBYSxLQUFLLENBQUMsSUFBSSxhQUFhLEtBQUssTUFBTSxFQUFFO29CQUNqRCxRQUFRLEdBQUcsc0JBQW9CLGFBQWEsU0FBSSxRQUFVLENBQUM7aUJBQzlEO3FCQUFNLElBQUksYUFBYSxLQUFLLENBQUMsSUFBSSxhQUFhLEtBQUssUUFBUSxFQUFFO29CQUMxRCxRQUFRLEdBQUcsd0JBQXNCLGFBQWEsU0FBSSxRQUFVLENBQUM7aUJBQ2hFO3FCQUFNLElBQUksYUFBYSxLQUFLLENBQUMsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMzRCxRQUFRLEdBQUcseUJBQXVCLGFBQWEsU0FBSSxRQUFVLENBQUM7aUJBQ2pFO2FBQ0o7WUFDRCxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsUUFBUSxDQUFDO1NBQzVDO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDSCxLQUFLLElBQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtRQUN4QixNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDL0M7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBIdG1sUGFyc2VyLFxuICAgIEVsZW1lbnQsXG4gICAgVGV4dCxcbiAgICBDb21tZW50LFxuICAgIGdldEh0bWxUYWdEZWZpbml0aW9uXG59IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgQ1NTX1JFR0VYID0ge1xuICAgIENPTU1FTlRTX0ZPUk1BVCA6IC9cXC9cXCooKD8hXFwqXFwvKS58XFxuKStcXCpcXC8vZyxcbiAgICBTRUxFQ1RPUl9GT1JNQVQgOiAvW15cXHtcXH1dKlxcey9naSxcbiAgICBTRUxFQ1RPUl9FWENMVURFX0ZPUk1BVCA6IC8oQGtleWZyYW1lc3xAbWVkaWF8QGZvbnQtZmFjZXxAY29tbWVudFswLTldK3xmcm9tfHRvfFswLTldKyUpXFxiL2lcbn07XG5cbmNvbnN0IGlzU3RyaW5nID0gdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZyc7XG5cbmludGVyZmFjZSBJUHJvdmlkZXJJbmZvIHtcbiAgICBub2RlTmFtZTogc3RyaW5nO1xuICAgIHByb3ZpZGU6IE1hcDxzdHJpbmcsIGFueT47XG59XG5cbmNvbnN0IE9WRVJSSURFUyA9IHtcbiAgICAnYWNjZXNzcm9sZXMnOiAnKmFjY2Vzc3JvbGVzJyxcbiAgICAnbmctaWYnOiAnKm5nSWYnLFxuICAgICdzaG93aW5kZXZpY2UnOiAnc2hvd0luRGV2aWNlJyxcbiAgICAnbmctY2xhc3MnOiAnW25nQ2xhc3NdJyxcbiAgICAnZGF0YS1uZy1jbGFzcyc6ICdbbmdDbGFzc10nLFxuICAgICdkYXRhLW5nLXNyYyc6ICdzcmMnLFxuICAgICduZy1zcmMnOiAnc3JjJyxcbiAgICAnZGF0YS1uZy1ocmVmJzogJ2hyZWYnLFxuICAgICduZy1ocmVmJzogJ2hyZWYnLFxuICAgICduZy1kaXNhYmxlZCc6ICdkaXNhYmxlZCcsXG4gICAgJ2RhdGEtbmctZGlzYWJsZWQnOiAnZGlzYWJsZWQnLFxuICAgICduZy1tb2RlbCc6ICdbbmdNb2RlbE9wdGlvbnNdPVwie3N0YW5kYWxvbmU6IHRydWV9XCIgWyhuZ01vZGVsKV0nXG59O1xuXG5jb25zdCBzZWxmQ2xvc2luZ1RhZ3MgPSBuZXcgU2V0KFsnaW1nJ10pO1xuXG5leHBvcnQgY29uc3QgZ2V0Qm91bmRUb0V4cHIgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFsdWUgPSB2YWx1ZS50cmltKCk7XG4gICAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoJ2JpbmQ6JykpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnN1YnN0cig1KTtcbiAgICB9XG59O1xuXG5jb25zdCBxdW90ZUF0dHIgPSB2ID0+IHtcbiAgICByZXR1cm4gKCcnICsgdikgLyogRm9yY2VzIHRoZSBjb252ZXJzaW9uIHRvIHN0cmluZy4gKi9cbiAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JykgLyogVGhpcyBNVVNUIGJlIHRoZSAxc3QgcmVwbGFjZW1lbnQuICovXG4gICAgICAgIC5yZXBsYWNlKC8nL2csICcmYXBvczsnKSAvKiBUaGUgNCBvdGhlciBwcmVkZWZpbmVkIGVudGl0aWVzLCByZXF1aXJlZC4gKi9cbiAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59O1xuXG5jb25zdCByZWdpc3RyeSA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KCk7XG5jb25zdCBodG1sUGFyc2VyID0gbmV3IEh0bWxQYXJzZXIoKTtcbmNvbnN0IGlnbm9yZUNvbW1lbnRzID0gdHJ1ZTtcblxuY29uc3QgZW1wdHkgPSAoKSA9PiAnJztcblxuY29uc3QgaXNFdmVudCA9IG5hbWUgPT4gbmFtZVswXSA9PT0gJ28nICYmIG5hbWVbMV0gPT09ICduJyAmJiBuYW1lWzJdID09PSAnLSc7XG5cbmNvbnN0IGdldEV2ZW50TmFtZSA9IGtleSA9PiBrZXkuc3Vic3RyKDMpO1xuXG5jb25zdCBwcm9jZXNzQmluZGluZyA9IChhdHRyLCBleHByKSA9PiBbYCR7YXR0ci5uYW1lfS5iaW5kYCwgcXVvdGVBdHRyKGV4cHIpXTtcblxuY29uc3QgcHJvY2Vzc0V2ZW50ID0gYXR0ciA9PiB7XG4gICAgY29uc3QgZXZ0TmFtZSA9IGdldEV2ZW50TmFtZShhdHRyLm5hbWUpO1xuICAgIHJldHVybiBbYCR7ZXZ0TmFtZX0uZXZlbnRgLCBhdHRyLnZhbHVlXTtcbn07XG5cbi8qKlxuICogV3JhcHMgdGhlIHN0cmluZyB3aXRoIHNpbmdsZSBxdW90ZXMuXG4gKiBAcGFyYW0gdmFsXG4gKi9cbmNvbnN0IHdyYXBXaXRoQXBvcyA9ICh2YWw6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiBgJmFwb3M7JHt2YWwucmVwbGFjZSgvJmFwb3MvZywgJyZxdW90JykucmVwbGFjZSgvJnF1b3QvZywgJ1xcXFwmcXVvdCcpfSZhcG9zO2A7XG59O1xuXG5jb25zdCBwcm9jZXNzQXR0ciA9IGF0dHIgPT4ge1xuICAgIGNvbnN0IG92ZXJyaWRkZW4gPSBPVkVSUklERVNbYXR0ci5uYW1lXTtcbiAgICBjb25zdCB2YWx1ZSA9IGF0dHIudmFsdWVTcGFuID8gYXR0ci52YWx1ZSA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChvdmVycmlkZGVuKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiB3cmFwIHZhbHVlIGZvciBhY2Nlc3Nyb2xlcyB3aXRoICcnLlxuICAgICAgICAgKiBzaW5jZSBhY2Nlc3Nyb2xlcyBpcyBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLCBpdCB3aWxsIGJlIHRyYW5zcGlsZWQgdG8gW2FjY2Vzc3JvbGVzXVxuICAgICAgICAgKiBoZW5jZSwgdGhlIHZhbHVlIGFnYWluc3QgaXQgc2hvdWxkIGJlIGEgY29tcHV0ZWQgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoYXR0ci5uYW1lID09PSAnYWNjZXNzcm9sZXMnKSB7XG4gICAgICAgICAgICByZXR1cm4gW292ZXJyaWRkZW4sIGAnJHt2YWx1ZX0nYF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtvdmVycmlkZGVuLCBxdW90ZUF0dHIodmFsdWUpXTtcbiAgICB9XG5cbiAgICBpZiAoaXNFdmVudChhdHRyLm5hbWUpKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzRXZlbnQoYXR0cik7XG4gICAgfVxuXG4gICAgY29uc3QgYm91bmRFeHByID0gZ2V0Qm91bmRUb0V4cHIoYXR0ci52YWx1ZSk7XG4gICAgaWYgKGJvdW5kRXhwcikge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc0JpbmRpbmcoYXR0ciwgYm91bmRFeHByKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2F0dHIubmFtZSwgcXVvdGVBdHRyKHZhbHVlKV07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RGF0YVNvdXJjZSA9IChkYXRhU2V0RXhwcjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBwYXJ0cyA9IGRhdGFTZXRFeHByLnNwbGl0KCcuJyk7XG4gICAgaWYgKHBhcnRzWzBdID09PSAnVmFyaWFibGVzJyB8fCBwYXJ0c1swXSA9PT0gJ1dpZGdldHMnKSB7XG4gICAgICAgIHJldHVybiBgJHtwYXJ0c1swXX0uJHtwYXJ0c1sxXX1gO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGb3JtTWFya3VwQXR0ciA9IGF0dHJzID0+IHtcbiAgICBpZiAoYXR0cnMuZ2V0KCdkYXRhdmFsdWUuYmluZCcpKSB7XG4gICAgICAgIGNvbnN0IG9uRGF0YVZhbHVlQmluZGluZyA9IGdldERhdGFTb3VyY2UoYXR0cnMuZ2V0KCdkYXRhdmFsdWUuYmluZCcpKTtcbiAgICAgICAgYXR0cnMuc2V0KCdkYXRhdmFsdWVzb3VyY2UuYmluZCcsIG9uRGF0YVZhbHVlQmluZGluZyk7XG4gICAgfVxuICAgIHJldHVybiBnZXRBdHRyTWFya3VwKGF0dHJzKTtcbn07XG5cbmNvbnN0IGdldEF0dHJNYXAgPSBhdHRycyA9PiB7XG4gICAgY29uc3QgYXR0ck1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgY29uc3QgW2F0dHJOYW1lLCBhdHRyVmFsdWVdID0gcHJvY2Vzc0F0dHIoYXR0cik7XG4gICAgICAgIGF0dHJNYXAuc2V0KGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgIH0pO1xuXG4gICAgaWYgKGF0dHJNYXAuZ2V0KCdkYXRhc2V0LmJpbmQnKSkge1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gZ2V0RGF0YVNvdXJjZShhdHRyTWFwLmdldCgnZGF0YXNldC5iaW5kJykpO1xuICAgICAgICBpZiAoZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgYXR0ck1hcC5zZXQoJ2RhdGFzb3VyY2UuYmluZCcsIGRhdGFTb3VyY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJNYXA7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXR0ck1hcmt1cCA9IChhdHRyczogTWFwPHN0cmluZywgc3RyaW5nPikgPT4ge1xuICAgIGxldCBhdHRyTWFya3VwID0gJyc7XG4gICAgYXR0cnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICBhdHRyTWFya3VwICs9IGAgJHtrfWA7XG4gICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICB2ID0gdi50cmltKCk7XG4gICAgICAgICAgICBpZiAoayA9PT0gJ1tuZ0NsYXNzXScgJiYgdi5zdGFydHNXaXRoKCd7JykpIHtcbiAgICAgICAgICAgICAgICB2ID0gdi5yZXBsYWNlKC9cIi9nLCBgJ2ApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGsgPT09ICdzaG93LmJpbmQnICYmIGF0dHJzLmdldCgnZGVmZXJsb2FkJykgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgIHYgPSB2ICsgYFwiICpsYXp5TG9hZD1cIiR7d3JhcFdpdGhBcG9zKHYpfWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdHRyTWFya3VwICs9IGA9XCIke3Z9XCJgO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXR0ck1hcmt1cDtcbn07XG5cbmNvbnN0IGdldFJlcXVpcmVkUHJvdmlkZXJzID0gKG5vZGVEZWY6IElCdWlsZFRhc2tEZWYsIHByb3ZpZGVyczogQXJyYXk8SVByb3ZpZGVySW5mbz4sIG5vZGVBdHRycykgPT4ge1xuICAgIGlmICghbm9kZURlZi5yZXF1aXJlcykge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgbGV0IHJlcXVpcmVzID0gbm9kZURlZi5yZXF1aXJlcyBhcyBhbnk7XG5cbiAgICBpZiAoaXNTdHJpbmcocmVxdWlyZXMpKSB7XG4gICAgICAgIHJlcXVpcmVzID0gW3JlcXVpcmVzXTtcbiAgICB9XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmVxdWlyZXMpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZXMubWFwKHJlcXVpcmUgPT4ge1xuICAgICAgICAvLyBmb3IgZHluYW1pYyB0YWJsZSBhc3NpZ25pbmcgcGFyZW50IHByb3ZpZGUgbWFwIHRvIHRoZSBjaGlsZCxcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVBdHRycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICAgIGlmIChub2RlQXR0cnNbaV0ubmFtZSA9PT0gJ3RhYmxlTmFtZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZURlZltub2RlQXR0cnNbaV0udmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IHByb3ZpZGVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICAgIGlmIChwcm92aWRlcnNbaV0ubm9kZU5hbWUgPT09IHJlcXVpcmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdmlkZXJzW2ldLnByb3ZpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmNvbnN0IERJTUVOU0lPTl9QUk9QUyA9IFsncGFkZGluZycsICdib3JkZXJ3aWR0aCcsICdtYXJnaW4nXTtcblxuY29uc3QgU0VQQVJBVE9SID0gJyAnLCBVTlNFVCA9ICd1bnNldCc7XG5cbmNvbnN0IHNldERpbWVuc2lvblByb3AgPSAoY3NzT2JqLCBrZXksIG52KSA9PiB7XG4gICAgbGV0IGNzc0tleSA9IGtleSwgdmFsLCB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQsIHN1ZmZpeCA9ICcnO1xuXG4gICAgZnVuY3Rpb24gc2V0VmFsKHByb3AsIHZhbHVlKSB7XG4gICAgICAgIC8vIGlmIHRoZSB2YWx1ZSBpcyBVTlNFVCwgcmVzZXQgdGhlIGV4aXN0aW5nIHZhbHVlXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gVU5TRVQpIHtcbiAgICAgICAgICAgIHZhbHVlID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgY3NzT2JqW2Nzc0tleSArIHByb3AgKyBzdWZmaXhdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGtleSA9PT0gJ2JvcmRlcndpZHRoJykge1xuICAgICAgICBzdWZmaXggPSAgJ3dpZHRoJztcbiAgICAgICAgY3NzS2V5ID0gJ2JvcmRlcic7XG4gICAgfVxuXG4gICAgdmFsID0gbnY7XG5cbiAgICBpZiAodmFsLmluZGV4T2YoVU5TRVQpICE9PSAtMSkge1xuICAgICAgICB2YWwgPSB2YWwuc3BsaXQoU0VQQVJBVE9SKTtcblxuICAgICAgICB0b3AgICAgPSB2YWxbMF07XG4gICAgICAgIHJpZ2h0ICA9IHZhbFsxXSB8fCB2YWxbMF07XG4gICAgICAgIGJvdHRvbSA9IHZhbFsyXSB8fCB2YWxbMF07XG4gICAgICAgIGxlZnQgICA9IHZhbFszXSB8fCB2YWxbMV0gfHwgdmFsWzBdO1xuXG4gICAgICAgIHNldFZhbCgndG9wJywgICAgdG9wKTtcbiAgICAgICAgc2V0VmFsKCdyaWdodCcsICByaWdodCk7XG4gICAgICAgIHNldFZhbCgnYm90dG9tJywgYm90dG9tKTtcbiAgICAgICAgc2V0VmFsKCdsZWZ0JywgICBsZWZ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoa2V5ID09PSAnYm9yZGVyd2lkdGgnKSB7XG4gICAgICAgICAgICBjc3NLZXkgPSAnYm9yZGVyd2lkdGgnO1xuICAgICAgICB9XG4gICAgICAgIGNzc09ialtjc3NLZXldID0gbnY7XG4gICAgfVxufTtcblxuY29uc3QgcHJvY2Vzc0RpbWVuc2lvbkF0dHJpYnV0ZXMgPSBhdHRyTWFwID0+IHtcbiAgICBjb25zdCBhdHRyS2V5cyA9IEFycmF5LmZyb20oYXR0ck1hcC5rZXlzKCkpO1xuICAgIGF0dHJLZXlzLmZvckVhY2goKGF0dHJLZXk6IGFueSkgPT4ge1xuICAgICAgICBpZiAoRElNRU5TSU9OX1BST1BTLmluY2x1ZGVzKGF0dHJLZXkpKSB7XG4gICAgICAgICAgICBjb25zdCBjc3NPYmogPSB7fSxcbiAgICAgICAgICAgICAgICBhdHRyVmFsdWUgPSBhdHRyTWFwLmdldChhdHRyS2V5KTtcbiAgICAgICAgICAgIGF0dHJNYXAuZGVsZXRlKGF0dHJLZXkpO1xuICAgICAgICAgICAgc2V0RGltZW5zaW9uUHJvcChjc3NPYmosIGF0dHJLZXksIGF0dHJWYWx1ZSk7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhjc3NPYmopLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3NzT2JqW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ck1hcC5zZXQoa2V5LCBjc3NPYmpba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8vIHJlcGxhY2UgPDpzdmc6c3ZnPiAtPiA8c3ZnPiwgPDpzdmc6Kj4gLT4gPHN2ZzoqPlxuY29uc3QgZ2V0Tm9kZU5hbWUgPSBuYW1lID0+IG5hbWUucmVwbGFjZSgnOnN2ZzpzdmcnLCAnc3ZnJykucmVwbGFjZSgnOnN2ZzonLCAnc3ZnOicpO1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc05vZGUgPSAobm9kZSwgcHJvdmlkZXJzPzogQXJyYXk8SVByb3ZpZGVySW5mbz4pID0+IHtcbiAgICBjb25zdCBub2RlRGVmID0gcmVnaXN0cnkuZ2V0KG5vZGUubmFtZSk7XG5cbiAgICBsZXQgcHJlLCBwb3N0LCB0ZW1wbGF0ZTtcblxuICAgIGlmIChub2RlRGVmKSB7XG4gICAgICAgIHByZSA9IG5vZGVEZWYucHJlIHx8IGVtcHR5O1xuICAgICAgICBwb3N0ID0gbm9kZURlZi5wb3N0IHx8IGVtcHR5O1xuICAgICAgICB0ZW1wbGF0ZSA9IG5vZGVEZWYudGVtcGxhdGUgfHwgZW1wdHk7XG4gICAgfVxuXG4gICAgbGV0IG1hcmt1cCA9ICcnO1xuICAgIGxldCBhdHRyTWFwO1xuICAgIGxldCByZXF1aXJlZFByb3ZpZGVycztcbiAgICBsZXQgc2hhcmVkO1xuXG4gICAgaWYgKCFwcm92aWRlcnMpIHtcbiAgICAgICAgcHJvdmlkZXJzID0gW107XG4gICAgfVxuXG4gICAgY29uc3QgaXNFbGVtZW50VHlwZSA9IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50O1xuXG4gICAgaWYgKGlzRWxlbWVudFR5cGUpIHtcbiAgICAgICAgbGV0IHByb3ZpZGVJbmZvOiBJUHJvdmlkZXJJbmZvO1xuXG4gICAgICAgIGlmIChub2RlRGVmKSB7XG4gICAgICAgICAgICByZXF1aXJlZFByb3ZpZGVycyA9IGdldFJlcXVpcmVkUHJvdmlkZXJzKG5vZGVEZWYsIHByb3ZpZGVycywgbm9kZS5hdHRycyk7XG4gICAgICAgICAgICBzaGFyZWQgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICB0ZW1wbGF0ZShub2RlLCBzaGFyZWQsIC4uLnJlcXVpcmVkUHJvdmlkZXJzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dHJNYXAgPSBnZXRBdHRyTWFwKG5vZGUuYXR0cnMpO1xuICAgICAgICBwcm9jZXNzRGltZW5zaW9uQXR0cmlidXRlcyhhdHRyTWFwKTtcblxuICAgICAgICBjb25zdCBub2RlTmFtZSA9IGdldE5vZGVOYW1lKG5vZGUubmFtZSk7XG5cbiAgICAgICAgaWYgKG5vZGVEZWYpIHtcbiAgICAgICAgICAgIG1hcmt1cCA9ICg8YW55PnByZSkoYXR0ck1hcCwgc2hhcmVkLCAuLi5yZXF1aXJlZFByb3ZpZGVycyk7XG4gICAgICAgICAgICBpZiAobm9kZURlZi5wcm92aWRlKSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IF8uaXNGdW5jdGlvbihub2RlRGVmLnByb3ZpZGUpID8gbm9kZURlZi5wcm92aWRlKGF0dHJNYXAsIHNoYXJlZCwgLi4ucmVxdWlyZWRQcm92aWRlcnMpIDogbm9kZURlZi5wcm92aWRlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBGb3IgdGFibGUgbm9kZSwgYXNzaWduaW5nIHBhcmVudCBwcm92aWRlIG1hcCB0byB0aGUgY2hpbGQsIGFzIGNoaWxkIHJlcXVpcmVzIHNvbWUgcGFyZW50IHByb3ZpZGUgYXR0cnMuXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubmFtZSA9PT0gJ3dtLXRhYmxlJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZUNvbE5vZGVEZWZuID0gcmVnaXN0cnkuZ2V0KCd3bS10YWJsZS1jb2x1bW4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVDb2xOb2RlRGVmbltfLmZpbmQobm9kZS5hdHRycywgKGVsKSA9PiBlbC5uYW1lID09PSAnbmFtZScpLnZhbHVlXSA9IHByb3ZpZGVJbmZvLnByb3ZpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5LnNldCgnd20tdGFibGUtY29sdW1uJywgdGFibGVDb2xOb2RlRGVmbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb3ZpZGVycy5wdXNoKHByb3ZpZGVJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1hcmt1cCA9IGA8JHtub2RlTmFtZX0gJHtnZXRBdHRyTWFya3VwKGF0dHJNYXApfT5gO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IG1hcmt1cCArPSBwcm9jZXNzTm9kZShjaGlsZCwgcHJvdmlkZXJzKSk7XG5cbiAgICAgICAgaWYgKG5vZGVEZWYpIHtcbiAgICAgICAgICAgIGlmIChwcm92aWRlSW5mbykge1xuICAgICAgICAgICAgICAgIHByb3ZpZGVycy5zcGxpY2UocHJvdmlkZXJzLmluZGV4T2YocHJvdmlkZUluZm8pLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcmt1cCArPSAoPGFueT5wb3N0KShhdHRyTWFwLCBzaGFyZWQsIC4uLnJlcXVpcmVkUHJvdmlkZXJzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChub2RlLmVuZFNvdXJjZVNwYW4gJiYgIWdldEh0bWxUYWdEZWZpbml0aW9uKG5vZGUubmFtZSkuaXNWb2lkKSB7XG4gICAgICAgICAgICAgICAgbWFya3VwICs9IGA8LyR7bm9kZU5hbWV9PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBUZXh0KSB7XG4gICAgICAgIG1hcmt1cCArPSBub2RlLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIENvbW1lbnQpIHtcbiAgICAgICAgaWYgKCFpZ25vcmVDb21tZW50cykge1xuICAgICAgICAgICAgbWFya3VwICs9IG5vZGUudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWFya3VwO1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zcGlsZSA9IChtYXJrdXA6IHN0cmluZyA9ICcnKSA9PiB7XG4gICAgaWYgKCFtYXJrdXAubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlcyA9IGh0bWxQYXJzZXIucGFyc2UobWFya3VwLCAnJyk7XG5cbiAgICBpZiAobm9kZXMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG91dHB1dCA9ICcnO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcy5yb290Tm9kZXMpIHtcbiAgICAgICAgb3V0cHV0ICs9IHByb2Nlc3NOb2RlKG5vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyID0gKG5vZGVOYW1lOiBzdHJpbmcsIG5vZGVEZWZGbjogKCkgPT4gSUJ1aWxkVGFza0RlZikgPT4gcmVnaXN0cnkuc2V0KG5vZGVOYW1lLCBub2RlRGVmRm4oKSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJ1aWxkVGFza0RlZiB7XG4gICAgcmVxdWlyZXM/OiBzdHJpbmcgfCBBcnJheTxzdHJpbmc+O1xuICAgIHRlbXBsYXRlPzogKG5vZGU6IEVsZW1lbnQgfCBUZXh0IHwgQ29tbWVudCwgc2hhcmVkPzogTWFwPGFueSwgYW55PiwgLi4ucmVxdWlyZXM6IEFycmF5PE1hcDxhbnksIGFueT4+KSA9PiB2b2lkO1xuICAgIHByZTogKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBzaGFyZWQgPzogTWFwPGFueSwgYW55PiwgLi4ucmVxdWlyZXM6IEFycmF5PE1hcDxhbnksIGFueT4+KSA9PiBzdHJpbmc7XG4gICAgcHJvdmlkZT86IChhdHRyczogTWFwPHN0cmluZywgc3RyaW5nPiwgc2hhcmVkID86IE1hcDxhbnksIGFueT4sIC4uLnJlcXVpcmVzOiBBcnJheTxNYXA8YW55LCBhbnk+PikgPT4gTWFwPGFueSwgYW55PjtcbiAgICBwb3N0PzogKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBzaGFyZWQgPzogTWFwPGFueSwgYW55PiwgLi4ucmVxdWlyZXM6IEFycmF5PE1hcDxhbnksIGFueT4+KSA9PiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBzY29wZUNvbXBvbmVudFN0eWxlcyA9IChjb21wb25lbnROYW1lLCBjb21wb25lbnRUeXBlLCBzdHlsZXMgPSAnJykgPT4ge1xuICAgIGNvbXBvbmVudE5hbWUgPSBjb21wb25lbnROYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc3QgY29tbWVudHMgPSB7fTtcbiAgICBsZXQgY29tbWVudENvdW50ID0gMDtcbiAgICBpZiAoc3R5bGVzLnN0YXJ0c1dpdGgoJy8qRElTQUJMRV9TQ09QSU5HKi8nKSkge1xuICAgICAgICByZXR1cm4gc3R5bGVzO1xuICAgIH1cbiAgICBzdHlsZXMgPSBzdHlsZXMucmVwbGFjZShDU1NfUkVHRVguQ09NTUVOVFNfRk9STUFULCBjb21tZW50ID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gYEBjb21tZW50JHtjb21tZW50Q291bnQrK317YDtcbiAgICAgICAgY29tbWVudHNba2V5XSA9IGNvbW1lbnQ7XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfSk7XG4gICAgc3R5bGVzID0gc3R5bGVzLnJlcGxhY2UoQ1NTX1JFR0VYLlNFTEVDVE9SX0ZPUk1BVCwgKHNlbGVjdG9yKSA9PiB7XG4gICAgICAgIGlmICghQ1NTX1JFR0VYLlNFTEVDVE9SX0VYQ0xVREVfRk9STUFULnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBjb25zdCBmaXJzdE5vblNwYWNlQ2hhckluZGV4ID0gc2VsZWN0b3IubWF0Y2goL1xcUy8pLmluZGV4O1xuICAgICAgICAgICAgbGV0IHByZWZpeFNwYWNlQ2hhclNlcSA9ICcnO1xuICAgICAgICAgICAgaWYgKGZpcnN0Tm9uU3BhY2VDaGFySW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgcHJlZml4U3BhY2VDaGFyU2VxID0gc2VsZWN0b3Iuc3Vic3RyaW5nKDAsIGZpcnN0Tm9uU3BhY2VDaGFySW5kZXgpO1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3Iuc3Vic3RyaW5nKGZpcnN0Tm9uU3BhY2VDaGFySW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvci5zdGFydHNXaXRoKCcvKicpICYmIHNlbGVjdG9yLnRyaW0oKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VJbmRleCA9IHNlbGVjdG9yLmluZGV4T2YoJyAnKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0b3Iuc3RhcnRzV2l0aCgnLndtLWFwcCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGFjZUluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5zdWJzdHJpbmcoc3BhY2VJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09IDAgfHwgY29tcG9uZW50VHlwZSA9PT0gJ1BBR0UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gYC53bS1hcHAgYXBwLXBhZ2UtJHtjb21wb25lbnROYW1lfSAke3NlbGVjdG9yfWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAxIHx8IGNvbXBvbmVudFR5cGUgPT09ICdQUkVGQUInKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gYC53bS1hcHAgYXBwLXByZWZhYi0ke2NvbXBvbmVudE5hbWV9ICR7c2VsZWN0b3J9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09IDIgfHwgY29tcG9uZW50VHlwZSA9PT0gJ1BBUlRJQUwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gYC53bS1hcHAgYXBwLXBhcnRpYWwtJHtjb21wb25lbnROYW1lfSAke3NlbGVjdG9yfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3IgPSBwcmVmaXhTcGFjZUNoYXJTZXEgKyBzZWxlY3RvcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2VsZWN0b3I7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gY29tbWVudHMpIHtcbiAgICAgICAgc3R5bGVzID0gc3R5bGVzLnJlcGxhY2Uoa2V5LCBjb21tZW50c1trZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0eWxlcztcbn07XG5cbiJdfQ==