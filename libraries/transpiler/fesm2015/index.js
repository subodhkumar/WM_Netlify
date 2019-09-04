import { HtmlParser, Element, Text, getHtmlTagDefinition } from '@angular/compiler';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const CSS_REGEX = {
    COMMENTS_FORMAT: /\/\*((?!\*\/).|\n)+\*\//g,
    SELECTOR_FORMAT: /[^\{\}]*\{/gi,
    SELECTOR_EXCLUDE_FORMAT: /(@keyframes|@media|@font-face|@comment[0-9]+|from|to|[0-9]+%)\b/i
};
/** @type {?} */
const isString = v => typeof v === 'string';
/** @type {?} */
const OVERRIDES = {
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
const getBoundToExpr = (value) => {
    if (!value) {
        return null;
    }
    value = value.trim();
    if (value.startsWith('bind:')) {
        return value.substr(5);
    }
};
/** @type {?} */
const quoteAttr = v => {
    return ('' + v) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};
/** @type {?} */
const registry = new Map();
/** @type {?} */
const htmlParser = new HtmlParser();
/** @type {?} */
const empty = () => '';
/** @type {?} */
const isEvent = name => name[0] === 'o' && name[1] === 'n' && name[2] === '-';
/** @type {?} */
const getEventName = key => key.substr(3);
/** @type {?} */
const processBinding = (attr, expr) => [`${attr.name}.bind`, quoteAttr(expr)];
/** @type {?} */
const processEvent = attr => {
    /** @type {?} */
    const evtName = getEventName(attr.name);
    return [`${evtName}.event`, attr.value];
};
/**
 * Wraps the string with single quotes.
 * \@param val
 * @type {?}
 */
const wrapWithApos = (val) => {
    return `&apos;${val.replace(/&apos/g, '&quot').replace(/&quot/g, '\\&quot')}&apos;`;
};
/** @type {?} */
const processAttr = attr => {
    /** @type {?} */
    const overridden = OVERRIDES[attr.name];
    /** @type {?} */
    const value = attr.valueSpan ? attr.value : undefined;
    if (overridden) {
        /**
         * wrap value for accessroles with ''.
         * since accessroles is a structural directive, it will be transpiled to [accessroles]
         * hence, the value against it should be a computed string
         */
        if (attr.name === 'accessroles') {
            return [overridden, `'${value}'`];
        }
        return [overridden, quoteAttr(value)];
    }
    if (isEvent(attr.name)) {
        return processEvent(attr);
    }
    /** @type {?} */
    const boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }
    return [attr.name, quoteAttr(value)];
};
/** @type {?} */
const getDataSource = (dataSetExpr) => {
    /** @type {?} */
    const parts = dataSetExpr.split('.');
    if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
        return `${parts[0]}.${parts[1]}`;
    }
};
/** @type {?} */
const getFormMarkupAttr = attrs => {
    if (attrs.get('datavalue.bind')) {
        /** @type {?} */
        const onDataValueBinding = getDataSource(attrs.get('datavalue.bind'));
        attrs.set('datavaluesource.bind', onDataValueBinding);
    }
    return getAttrMarkup(attrs);
};
/** @type {?} */
const getAttrMap = attrs => {
    /** @type {?} */
    const attrMap = new Map();
    attrs.forEach(attr => {
        const [attrName, attrValue] = processAttr(attr);
        attrMap.set(attrName, attrValue);
    });
    if (attrMap.get('dataset.bind')) {
        /** @type {?} */
        const dataSource = getDataSource(attrMap.get('dataset.bind'));
        if (dataSource) {
            attrMap.set('datasource.bind', dataSource);
        }
    }
    return attrMap;
};
/** @type {?} */
const getAttrMarkup = (attrs) => {
    /** @type {?} */
    let attrMarkup = '';
    attrs.forEach((v, k) => {
        attrMarkup += ` ${k}`;
        if (v) {
            v = v.trim();
            if (k === '[ngClass]' && v.startsWith('{')) {
                v = v.replace(/"/g, `'`);
            }
            if (k === 'show.bind' && attrs.get('deferload') === 'true') {
                v = v + `" *lazyLoad="${wrapWithApos(v)}`;
            }
            attrMarkup += `="${v}"`;
        }
    });
    return attrMarkup;
};
/** @type {?} */
const getRequiredProviders = (nodeDef, providers, nodeAttrs) => {
    if (!nodeDef.requires) {
        return [];
    }
    /** @type {?} */
    let requires = (/** @type {?} */ (nodeDef.requires));
    if (isString(requires)) {
        requires = [requires];
    }
    if (!Array.isArray(requires)) {
        return [];
    }
    return requires.map(require => {
        // for dynamic table assigning parent provide map to the child,
        for (let i = nodeAttrs.length - 1; i >= 0; i--) {
            if (nodeAttrs[i].name === 'tableName') {
                return nodeDef[nodeAttrs[i].value];
            }
        }
        for (let i = providers.length - 1; i >= 0; i--) {
            if (providers[i].nodeName === require) {
                return providers[i].provide;
            }
        }
    });
};
/** @type {?} */
const DIMENSION_PROPS = ['padding', 'borderwidth', 'margin'];
/** @type {?} */
const SEPARATOR = ' ';
/** @type {?} */
const UNSET = 'unset';
/** @type {?} */
const setDimensionProp = (cssObj, key, nv) => {
    /** @type {?} */
    let cssKey = key;
    /** @type {?} */
    let val;
    /** @type {?} */
    let top;
    /** @type {?} */
    let right;
    /** @type {?} */
    let bottom;
    /** @type {?} */
    let left;
    /** @type {?} */
    let suffix = '';
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
const processDimensionAttributes = attrMap => {
    /** @type {?} */
    const attrKeys = Array.from(attrMap.keys());
    attrKeys.forEach((attrKey) => {
        if (DIMENSION_PROPS.includes(attrKey)) {
            /** @type {?} */
            const cssObj = {};
            /** @type {?} */
            const attrValue = attrMap.get(attrKey);
            attrMap.delete(attrKey);
            setDimensionProp(cssObj, attrKey, attrValue);
            Object.keys(cssObj).forEach(key => {
                if (cssObj[key]) {
                    attrMap.set(key, cssObj[key]);
                }
            });
        }
    });
};
// replace <:svg:svg> -> <svg>, <:svg:*> -> <svg:*>
/** @type {?} */
const getNodeName = name => name.replace(':svg:svg', 'svg').replace(':svg:', 'svg:');
/** @type {?} */
const processNode = (node, providers) => {
    /** @type {?} */
    const nodeDef = registry.get(node.name);
    /** @type {?} */
    let pre;
    /** @type {?} */
    let post;
    /** @type {?} */
    let template;
    if (nodeDef) {
        pre = nodeDef.pre || empty;
        post = nodeDef.post || empty;
        template = nodeDef.template || empty;
    }
    /** @type {?} */
    let markup = '';
    /** @type {?} */
    let attrMap;
    /** @type {?} */
    let requiredProviders;
    /** @type {?} */
    let shared;
    if (!providers) {
        providers = [];
    }
    /** @type {?} */
    const isElementType = node instanceof Element;
    if (isElementType) {
        /** @type {?} */
        let provideInfo;
        if (nodeDef) {
            requiredProviders = getRequiredProviders(nodeDef, providers, node.attrs);
            shared = new Map();
            template(node, shared, ...requiredProviders);
        }
        attrMap = getAttrMap(node.attrs);
        processDimensionAttributes(attrMap);
        /** @type {?} */
        const nodeName = getNodeName(node.name);
        if (nodeDef) {
            markup = ((/** @type {?} */ (pre)))(attrMap, shared, ...requiredProviders);
            if (nodeDef.provide) {
                provideInfo = {
                    nodeName: node.name,
                    provide: _.isFunction(nodeDef.provide) ? nodeDef.provide(attrMap, shared, ...requiredProviders) : nodeDef.provide
                };
                // For table node, assigning parent provide map to the child, as child requires some parent provide attrs.
                if (node.name === 'wm-table') {
                    /** @type {?} */
                    const tableColNodeDefn = registry.get('wm-table-column');
                    tableColNodeDefn[_.find(node.attrs, (el) => el.name === 'name').value] = provideInfo.provide;
                    registry.set('wm-table-column', tableColNodeDefn);
                }
                providers.push(provideInfo);
            }
        }
        else {
            markup = `<${nodeName} ${getAttrMarkup(attrMap)}>`;
        }
        node.children.forEach(child => markup += processNode(child, providers));
        if (nodeDef) {
            if (provideInfo) {
                providers.splice(providers.indexOf(provideInfo), 1);
            }
            markup += ((/** @type {?} */ (post)))(attrMap, shared, ...requiredProviders);
        }
        else {
            if (node.endSourceSpan && !getHtmlTagDefinition(node.name).isVoid) {
                markup += `</${nodeName}>`;
            }
        }
    }
    else if (node instanceof Text) {
        markup += node.value;
    }
    return markup;
};
/** @type {?} */
const transpile = (markup = '') => {
    if (!markup.length) {
        return;
    }
    /** @type {?} */
    const nodes = htmlParser.parse(markup, '');
    if (nodes.errors.length) {
        return;
    }
    /** @type {?} */
    let output = '';
    for (const node of nodes.rootNodes) {
        output += processNode(node);
    }
    return output;
};
/** @type {?} */
const register = (nodeName, nodeDefFn) => registry.set(nodeName, nodeDefFn());
/** @type {?} */
const scopeComponentStyles = (componentName, componentType, styles = '') => {
    componentName = componentName.toLowerCase();
    /** @type {?} */
    const comments = {};
    /** @type {?} */
    let commentCount = 0;
    if (styles.startsWith('/*DISABLE_SCOPING*/')) {
        return styles;
    }
    styles = styles.replace(CSS_REGEX.COMMENTS_FORMAT, comment => {
        /** @type {?} */
        const key = `@comment${commentCount++}{`;
        comments[key] = comment;
        return key;
    });
    styles = styles.replace(CSS_REGEX.SELECTOR_FORMAT, (selector) => {
        if (!CSS_REGEX.SELECTOR_EXCLUDE_FORMAT.test(selector)) {
            /** @type {?} */
            const firstNonSpaceCharIndex = selector.match(/\S/).index;
            /** @type {?} */
            let prefixSpaceCharSeq = '';
            if (firstNonSpaceCharIndex > 0) {
                prefixSpaceCharSeq = selector.substring(0, firstNonSpaceCharIndex);
                selector = selector.substring(firstNonSpaceCharIndex);
            }
            if (!selector.startsWith('/*') && selector.trim().length > 0) {
                /** @type {?} */
                const spaceIndex = selector.indexOf(' ');
                if (selector.startsWith('.wm-app')) {
                    if (spaceIndex > 0) {
                        selector = selector.substring(spaceIndex + 1);
                    }
                    else {
                        return selector;
                    }
                }
                if (componentType === 0 || componentType === 'PAGE') {
                    selector = `.wm-app app-page-${componentName} ${selector}`;
                }
                else if (componentType === 1 || componentType === 'PREFAB') {
                    selector = `.wm-app app-prefab-${componentName} ${selector}`;
                }
                else if (componentType === 2 || componentType === 'PARTIAL') {
                    selector = `.wm-app app-partial-${componentName} ${selector}`;
                }
            }
            selector = prefixSpaceCharSeq + selector;
        }
        return selector;
    });
    for (const key in comments) {
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