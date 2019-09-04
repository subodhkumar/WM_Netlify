import { __read, __spread, __values } from 'tslib';
import { HtmlParser, Element, Text, getHtmlTagDefinition } from '@angular/compiler';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
var CSS_REGEX = {
    COMMENTS_FORMAT: /\/\*((?!\*\/).|\n)+\*\//g,
    SELECTOR_FORMAT: /[^\{\}]*\{/gi,
    SELECTOR_EXCLUDE_FORMAT: /(@keyframes|@media|@font-face|@comment[0-9]+|from|to|[0-9]+%)\b/i
};
/** @type {?} */
var isString = function (v) { return typeof v === 'string'; };
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
var getBoundToExpr = function (value) {
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
/** @type {?} */
var registry = new Map();
/** @type {?} */
var htmlParser = new HtmlParser();
/** @type {?} */
var empty = function () { return ''; };
/** @type {?} */
var isEvent = function (name) { return name[0] === 'o' && name[1] === 'n' && name[2] === '-'; };
/** @type {?} */
var getEventName = function (key) { return key.substr(3); };
/** @type {?} */
var processBinding = function (attr, expr) { return [attr.name + ".bind", quoteAttr(expr)]; };
/** @type {?} */
var processEvent = function (attr) {
    /** @type {?} */
    var evtName = getEventName(attr.name);
    return [evtName + ".event", attr.value];
};
/**
 * Wraps the string with single quotes.
 * \@param val
 * @type {?}
 */
var wrapWithApos = function (val) {
    return "&apos;" + val.replace(/&apos/g, '&quot').replace(/&quot/g, '\\&quot') + "&apos;";
};
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
/** @type {?} */
var getDataSource = function (dataSetExpr) {
    /** @type {?} */
    var parts = dataSetExpr.split('.');
    if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
        return parts[0] + "." + parts[1];
    }
};
/** @type {?} */
var getFormMarkupAttr = function (attrs) {
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
        var _a = __read(processAttr(attr), 2), attrName = _a[0], attrValue = _a[1];
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
/** @type {?} */
var getAttrMarkup = function (attrs) {
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
// replace <:svg:svg> -> <svg>, <:svg:*> -> <svg:*>
/** @type {?} */
var getNodeName = function (name) { return name.replace(':svg:svg', 'svg').replace(':svg:', 'svg:'); };
/** @type {?} */
var processNode = function (node, providers) {
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
            template.apply(void 0, __spread([node, shared], requiredProviders));
        }
        attrMap = getAttrMap(node.attrs);
        processDimensionAttributes(attrMap);
        /** @type {?} */
        var nodeName = getNodeName(node.name);
        if (nodeDef) {
            markup = ((/** @type {?} */ (pre))).apply(void 0, __spread([attrMap, shared], requiredProviders));
            if (nodeDef.provide) {
                provideInfo = {
                    nodeName: node.name,
                    provide: _.isFunction(nodeDef.provide) ? nodeDef.provide.apply(nodeDef, __spread([attrMap, shared], requiredProviders)) : nodeDef.provide
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
            markup += ((/** @type {?} */ (post))).apply(void 0, __spread([attrMap, shared], requiredProviders));
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
    return markup;
};
/** @type {?} */
var transpile = function (markup) {
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
        for (var _b = __values(nodes.rootNodes), _c = _b.next(); !_c.done; _c = _b.next()) {
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
var register = function (nodeName, nodeDefFn) { return registry.set(nodeName, nodeDefFn()); };
/** @type {?} */
var scopeComponentStyles = function (componentName, componentType, styles) {
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { getBoundToExpr, getDataSource, getFormMarkupAttr, getAttrMarkup, processNode, transpile, register, scopeComponentStyles };

//# sourceMappingURL=index.js.map