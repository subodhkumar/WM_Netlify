/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { HtmlParser, Element, Text, Comment, getHtmlTagDefinition } from '@angular/compiler';
/** @type {?} */
const CSS_REGEX = {
    COMMENTS_FORMAT: /\/\*((?!\*\/).|\n)+\*\//g,
    SELECTOR_FORMAT: /[^\{\}]*\{/gi,
    SELECTOR_EXCLUDE_FORMAT: /(@keyframes|@media|@font-face|@comment[0-9]+|from|to|[0-9]+%)\b/i
};
/** @type {?} */
const isString = v => typeof v === 'string';
const ɵ0 = isString;
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
const selfClosingTags = new Set(['img']);
/** @type {?} */
export const getBoundToExpr = (value) => {
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
const ɵ1 = quoteAttr;
/** @type {?} */
const registry = new Map();
/** @type {?} */
const htmlParser = new HtmlParser();
/** @type {?} */
const ignoreComments = true;
/** @type {?} */
const empty = () => '';
const ɵ2 = empty;
/** @type {?} */
const isEvent = name => name[0] === 'o' && name[1] === 'n' && name[2] === '-';
const ɵ3 = isEvent;
/** @type {?} */
const getEventName = key => key.substr(3);
const ɵ4 = getEventName;
/** @type {?} */
const processBinding = (attr, expr) => [`${attr.name}.bind`, quoteAttr(expr)];
const ɵ5 = processBinding;
/** @type {?} */
const processEvent = attr => {
    /** @type {?} */
    const evtName = getEventName(attr.name);
    return [`${evtName}.event`, attr.value];
};
const ɵ6 = processEvent;
/**
 * Wraps the string with single quotes.
 * \@param val
 * @type {?}
 */
const wrapWithApos = (val) => {
    return `&apos;${val.replace(/&apos/g, '&quot').replace(/&quot/g, '\\&quot')}&apos;`;
};
const ɵ7 = wrapWithApos;
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
const ɵ8 = processAttr;
/** @type {?} */
export const getDataSource = (dataSetExpr) => {
    /** @type {?} */
    const parts = dataSetExpr.split('.');
    if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
        return `${parts[0]}.${parts[1]}`;
    }
};
/** @type {?} */
export const getFormMarkupAttr = attrs => {
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
const ɵ9 = getAttrMap;
/** @type {?} */
export const getAttrMarkup = (attrs) => {
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
const ɵ10 = getRequiredProviders;
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
const ɵ11 = setDimensionProp;
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
const ɵ12 = processDimensionAttributes;
// replace <:svg:svg> -> <svg>, <:svg:*> -> <svg:*>
/** @type {?} */
const getNodeName = name => name.replace(':svg:svg', 'svg').replace(':svg:', 'svg:');
const ɵ13 = getNodeName;
/** @type {?} */
export const processNode = (node, providers) => {
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
    else if (node instanceof Comment) {
        if (!ignoreComments) {
            markup += node.value;
        }
    }
    return markup;
};
/** @type {?} */
export const transpile = (markup = '') => {
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
export const register = (nodeName, nodeDefFn) => registry.set(nodeName, nodeDefFn());
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
export const scopeComponentStyles = (componentName, componentType, styles = '') => {
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
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, ɵ11, ɵ12, ɵ13 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdHJhbnNwaWxlci8iLCJzb3VyY2VzIjpbImJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQ0gsVUFBVSxFQUNWLE9BQU8sRUFDUCxJQUFJLEVBQ0osT0FBTyxFQUNQLG9CQUFvQixFQUN2QixNQUFNLG1CQUFtQixDQUFDOztNQUdyQixTQUFTLEdBQUc7SUFDZCxlQUFlLEVBQUcsMEJBQTBCO0lBQzVDLGVBQWUsRUFBRyxjQUFjO0lBQ2hDLHVCQUF1QixFQUFHLGtFQUFrRTtDQUMvRjs7TUFFSyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFROzs7OztBQUUzQyw0QkFHQzs7O0lBRkcsaUNBQWlCOztJQUNqQixnQ0FBMEI7OztNQUd4QixTQUFTLEdBQUc7SUFDZCxhQUFhLEVBQUUsY0FBYztJQUM3QixPQUFPLEVBQUUsT0FBTztJQUNoQixjQUFjLEVBQUUsY0FBYztJQUM5QixVQUFVLEVBQUUsV0FBVztJQUN2QixlQUFlLEVBQUUsV0FBVztJQUM1QixhQUFhLEVBQUUsS0FBSztJQUNwQixRQUFRLEVBQUUsS0FBSztJQUNmLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGFBQWEsRUFBRSxVQUFVO0lBQ3pCLGtCQUFrQixFQUFFLFVBQVU7SUFDOUIsVUFBVSxFQUFFLG1EQUFtRDtDQUNsRTs7TUFFSyxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFeEMsTUFBTSxPQUFPLGNBQWMsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQzVDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFD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UyxDQUFDLEVBQUU7b0JBQ2hDLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTt3QkFDaEIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNqRDt5QkFBTTt3QkFDSCxPQUFPLFFBQVEsQ0FBQztxQkFDbkI7aUJBQ0o7Z0JBRUQsSUFBSSxhQUFhLEtBQUssQ0FBQyxJQUFJLGFBQWEsS0FBSyxNQUFNLEVBQUU7b0JBQ2pELFFBQVEsR0FBRyxvQkFBb0IsYUFBYSxJQUFJLFFBQVEsRUFBRSxDQUFDO2lCQUM5RDtxQkFBTSxJQUFJLGFBQWEsS0FBSyxDQUFDLElBQUksYUFBYSxLQUFLLFFBQVEsRUFBRTtvQkFDMUQsUUFBUSxHQUFHLHNCQUFzQixhQUFhLElBQUksUUFBUSxFQUFFLENBQUM7aUJBQ2hFO3FCQUFNLElBQUksYUFBYSxLQUFLLENBQUMsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMzRCxRQUFRLEdBQUcsdUJBQXVCLGFBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQztpQkFDakU7YUFDSjtZQUNELFFBQVEsR0FBRyxrQkFBa0IsR0FBRyxRQUFRLENBQUM7U0FDNUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO1FBQ3hCLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIEh0bWxQYXJzZXIsXG4gICAgRWxlbWVudCxcbiAgICBUZXh0LFxuICAgIENvbW1lbnQsXG4gICAgZ2V0SHRtbFRhZ0RlZmluaXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBDU1NfUkVHRVggPSB7XG4gICAgQ09NTUVOVFNfRk9STUFUIDogL1xcL1xcKigoPyFcXCpcXC8pLnxcXG4pK1xcKlxcLy9nLFxuICAgIFNFTEVDVE9SX0ZPUk1BVCA6IC9bXlxce1xcfV0qXFx7L2dpLFxuICAgIFNFTEVDVE9SX0VYQ0xVREVfRk9STUFUIDogLyhAa2V5ZnJhbWVzfEBtZWRpYXxAZm9udC1mYWNlfEBjb21tZW50WzAtOV0rfGZyb218dG98WzAtOV0rJSlcXGIvaVxufTtcblxuY29uc3QgaXNTdHJpbmcgPSB2ID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJztcblxuaW50ZXJmYWNlIElQcm92aWRlckluZm8ge1xuICAgIG5vZGVOYW1lOiBzdHJpbmc7XG4gICAgcHJvdmlkZTogTWFwPHN0cmluZywgYW55Pjtcbn1cblxuY29uc3QgT1ZFUlJJREVTID0ge1xuICAgICdhY2Nlc3Nyb2xlcyc6ICcqYWNjZXNzcm9sZXMnLFxuICAgICduZy1pZic6ICcqbmdJZicsXG4gICAgJ3Nob3dpbmRldmljZSc6ICdzaG93SW5EZXZpY2UnLFxuICAgICduZy1jbGFzcyc6ICdbbmdDbGFzc10nLFxuICAgICdkYXRhLW5nLWNsYXNzJzogJ1tuZ0NsYXNzXScsXG4gICAgJ2RhdGEtbmctc3JjJzogJ3NyYycsXG4gICAgJ25nLXNyYyc6ICdzcmMnLFxuICAgICdkYXRhLW5nLWhyZWYnOiAnaHJlZicsXG4gICAgJ25nLWhyZWYnOiAnaHJlZicsXG4gICAgJ25nLWRpc2FibGVkJzogJ2Rpc2FibGVkJyxcbiAgICAnZGF0YS1uZy1kaXNhYmxlZCc6ICdkaXNhYmxlZCcsXG4gICAgJ25nLW1vZGVsJzogJ1tuZ01vZGVsT3B0aW9uc109XCJ7c3RhbmRhbG9uZTogdHJ1ZX1cIiBbKG5nTW9kZWwpXSdcbn07XG5cbmNvbnN0IHNlbGZDbG9zaW5nVGFncyA9IG5ldyBTZXQoWydpbWcnXSk7XG5cbmV4cG9ydCBjb25zdCBnZXRCb3VuZFRvRXhwciA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICBpZiAodmFsdWUuc3RhcnRzV2l0aCgnYmluZDonKSkge1xuICAgICAgICByZXR1cm4gdmFsdWUuc3Vic3RyKDUpO1xuICAgIH1cbn07XG5cbmNvbnN0IHF1b3RlQXR0ciA9IHYgPT4ge1xuICAgIHJldHVybiAoJycgKyB2KSAvKiBGb3JjZXMgdGhlIGNvbnZlcnNpb24gdG8gc3RyaW5nLiAqL1xuICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKSAvKiBUaGlzIE1VU1QgYmUgdGhlIDFzdCByZXBsYWNlbWVudC4gKi9cbiAgICAgICAgLnJlcGxhY2UoLycvZywgJyZhcG9zOycpIC8qIFRoZSA0IG90aGVyIHByZWRlZmluZWQgZW50aXRpZXMsIHJlcXVpcmVkLiAqL1xuICAgICAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn07XG5cbmNvbnN0IHJlZ2lzdHJ5ID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcbmNvbnN0IGh0bWxQYXJzZXIgPSBuZXcgSHRtbFBhcnNlcigpO1xuY29uc3QgaWdub3JlQ29tbWVudHMgPSB0cnVlO1xuXG5jb25zdCBlbXB0eSA9ICgpID0+ICcnO1xuXG5jb25zdCBpc0V2ZW50ID0gbmFtZSA9PiBuYW1lWzBdID09PSAnbycgJiYgbmFtZVsxXSA9PT0gJ24nICYmIG5hbWVbMl0gPT09ICctJztcblxuY29uc3QgZ2V0RXZlbnROYW1lID0ga2V5ID0+IGtleS5zdWJzdHIoMyk7XG5cbmNvbnN0IHByb2Nlc3NCaW5kaW5nID0gKGF0dHIsIGV4cHIpID0+IFtgJHthdHRyLm5hbWV9LmJpbmRgLCBxdW90ZUF0dHIoZXhwcildO1xuXG5jb25zdCBwcm9jZXNzRXZlbnQgPSBhdHRyID0+IHtcbiAgICBjb25zdCBldnROYW1lID0gZ2V0RXZlbnROYW1lKGF0dHIubmFtZSk7XG4gICAgcmV0dXJuIFtgJHtldnROYW1lfS5ldmVudGAsIGF0dHIudmFsdWVdO1xufTtcblxuLyoqXG4gKiBXcmFwcyB0aGUgc3RyaW5nIHdpdGggc2luZ2xlIHF1b3Rlcy5cbiAqIEBwYXJhbSB2YWxcbiAqL1xuY29uc3Qgd3JhcFdpdGhBcG9zID0gKHZhbDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIGAmYXBvczske3ZhbC5yZXBsYWNlKC8mYXBvcy9nLCAnJnF1b3QnKS5yZXBsYWNlKC8mcXVvdC9nLCAnXFxcXCZxdW90Jyl9JmFwb3M7YDtcbn07XG5cbmNvbnN0IHByb2Nlc3NBdHRyID0gYXR0ciA9PiB7XG4gICAgY29uc3Qgb3ZlcnJpZGRlbiA9IE9WRVJSSURFU1thdHRyLm5hbWVdO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0ci52YWx1ZVNwYW4gPyBhdHRyLnZhbHVlIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG92ZXJyaWRkZW4pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIHdyYXAgdmFsdWUgZm9yIGFjY2Vzc3JvbGVzIHdpdGggJycuXG4gICAgICAgICAqIHNpbmNlIGFjY2Vzc3JvbGVzIGlzIGEgc3RydWN0dXJhbCBkaXJlY3RpdmUsIGl0IHdpbGwgYmUgdHJhbnNwaWxlZCB0byBbYWNjZXNzcm9sZXNdXG4gICAgICAgICAqIGhlbmNlLCB0aGUgdmFsdWUgYWdhaW5zdCBpdCBzaG91bGQgYmUgYSBjb21wdXRlZCBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgIGlmIChhdHRyLm5hbWUgPT09ICdhY2Nlc3Nyb2xlcycpIHtcbiAgICAgICAgICAgIHJldHVybiBbb3ZlcnJpZGRlbiwgYCcke3ZhbHVlfSdgXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW292ZXJyaWRkZW4sIHF1b3RlQXR0cih2YWx1ZSldO1xuICAgIH1cblxuICAgIGlmIChpc0V2ZW50KGF0dHIubmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NFdmVudChhdHRyKTtcbiAgICB9XG5cbiAgICBjb25zdCBib3VuZEV4cHIgPSBnZXRCb3VuZFRvRXhwcihhdHRyLnZhbHVlKTtcbiAgICBpZiAoYm91bmRFeHByKSB7XG4gICAgICAgIHJldHVybiBwcm9jZXNzQmluZGluZyhhdHRyLCBib3VuZEV4cHIpO1xuICAgIH1cblxuICAgIHJldHVybiBbYXR0ci5uYW1lLCBxdW90ZUF0dHIodmFsdWUpXTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXREYXRhU291cmNlID0gKGRhdGFTZXRFeHByOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IHBhcnRzID0gZGF0YVNldEV4cHIuc3BsaXQoJy4nKTtcbiAgICBpZiAocGFydHNbMF0gPT09ICdWYXJpYWJsZXMnIHx8IHBhcnRzWzBdID09PSAnV2lkZ2V0cycpIHtcbiAgICAgICAgcmV0dXJuIGAke3BhcnRzWzBdfS4ke3BhcnRzWzFdfWA7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGdldEZvcm1NYXJrdXBBdHRyID0gYXR0cnMgPT4ge1xuICAgIGlmIChhdHRycy5nZXQoJ2RhdGF2YWx1ZS5iaW5kJykpIHtcbiAgICAgICAgY29uc3Qgb25EYXRhVmFsdWVCaW5kaW5nID0gZ2V0RGF0YVNvdXJjZShhdHRycy5nZXQoJ2RhdGF2YWx1ZS5iaW5kJykpO1xuICAgICAgICBhdHRycy5zZXQoJ2RhdGF2YWx1ZXNvdXJjZS5iaW5kJywgb25EYXRhVmFsdWVCaW5kaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGdldEF0dHJNYXJrdXAoYXR0cnMpO1xufTtcblxuY29uc3QgZ2V0QXR0ck1hcCA9IGF0dHJzID0+IHtcbiAgICBjb25zdCBhdHRyTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBhdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgICBjb25zdCBbYXR0ck5hbWUsIGF0dHJWYWx1ZV0gPSBwcm9jZXNzQXR0cihhdHRyKTtcbiAgICAgICAgYXR0ck1hcC5zZXQoYXR0ck5hbWUsIGF0dHJWYWx1ZSk7XG4gICAgfSk7XG5cbiAgICBpZiAoYXR0ck1hcC5nZXQoJ2RhdGFzZXQuYmluZCcpKSB7XG4gICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSBnZXREYXRhU291cmNlKGF0dHJNYXAuZ2V0KCdkYXRhc2V0LmJpbmQnKSk7XG4gICAgICAgIGlmIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICBhdHRyTWFwLnNldCgnZGF0YXNvdXJjZS5iaW5kJywgZGF0YVNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXR0ck1hcDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBdHRyTWFya3VwID0gKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+KSA9PiB7XG4gICAgbGV0IGF0dHJNYXJrdXAgPSAnJztcbiAgICBhdHRycy5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgIGF0dHJNYXJrdXAgKz0gYCAke2t9YDtcbiAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgIHYgPSB2LnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChrID09PSAnW25nQ2xhc3NdJyAmJiB2LnN0YXJ0c1dpdGgoJ3snKSkge1xuICAgICAgICAgICAgICAgIHYgPSB2LnJlcGxhY2UoL1wiL2csIGAnYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoayA9PT0gJ3Nob3cuYmluZCcgJiYgYXR0cnMuZ2V0KCdkZWZlcmxvYWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgdiA9IHYgKyBgXCIgKmxhenlMb2FkPVwiJHt3cmFwV2l0aEFwb3Modil9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF0dHJNYXJrdXAgKz0gYD1cIiR7dn1cImA7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBhdHRyTWFya3VwO1xufTtcblxuY29uc3QgZ2V0UmVxdWlyZWRQcm92aWRlcnMgPSAobm9kZURlZjogSUJ1aWxkVGFza0RlZiwgcHJvdmlkZXJzOiBBcnJheTxJUHJvdmlkZXJJbmZvPiwgbm9kZUF0dHJzKSA9PiB7XG4gICAgaWYgKCFub2RlRGVmLnJlcXVpcmVzKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBsZXQgcmVxdWlyZXMgPSBub2RlRGVmLnJlcXVpcmVzIGFzIGFueTtcblxuICAgIGlmIChpc1N0cmluZyhyZXF1aXJlcykpIHtcbiAgICAgICAgcmVxdWlyZXMgPSBbcmVxdWlyZXNdO1xuICAgIH1cblxuICAgIGlmICghQXJyYXkuaXNBcnJheShyZXF1aXJlcykpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlcy5tYXAocmVxdWlyZSA9PiB7XG4gICAgICAgIC8vIGZvciBkeW5hbWljIHRhYmxlIGFzc2lnbmluZyBwYXJlbnQgcHJvdmlkZSBtYXAgdG8gdGhlIGNoaWxkLFxuICAgICAgICBmb3IgKGxldCBpID0gbm9kZUF0dHJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICAgICAgaWYgKG5vZGVBdHRyc1tpXS5uYW1lID09PSAndGFibGVOYW1lJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlRGVmW25vZGVBdHRyc1tpXS52YWx1ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gcHJvdmlkZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICAgICAgaWYgKHByb3ZpZGVyc1tpXS5ub2RlTmFtZSA9PT0gcmVxdWlyZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm92aWRlcnNbaV0ucHJvdmlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuY29uc3QgRElNRU5TSU9OX1BST1BTID0gWydwYWRkaW5nJywgJ2JvcmRlcndpZHRoJywgJ21hcmdpbiddO1xuXG5jb25zdCBTRVBBUkFUT1IgPSAnICcsIFVOU0VUID0gJ3Vuc2V0JztcblxuY29uc3Qgc2V0RGltZW5zaW9uUHJvcCA9IChjc3NPYmosIGtleSwgbnYpID0+IHtcbiAgICBsZXQgY3NzS2V5ID0ga2V5LCB2YWwsIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCwgc3VmZml4ID0gJyc7XG5cbiAgICBmdW5jdGlvbiBzZXRWYWwocHJvcCwgdmFsdWUpIHtcbiAgICAgICAgLy8gaWYgdGhlIHZhbHVlIGlzIFVOU0VULCByZXNldCB0aGUgZXhpc3RpbmcgdmFsdWVcbiAgICAgICAgaWYgKHZhbHVlID09PSBVTlNFVCkge1xuICAgICAgICAgICAgdmFsdWUgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBjc3NPYmpbY3NzS2V5ICsgcHJvcCArIHN1ZmZpeF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoa2V5ID09PSAnYm9yZGVyd2lkdGgnKSB7XG4gICAgICAgIHN1ZmZpeCA9ICAnd2lkdGgnO1xuICAgICAgICBjc3NLZXkgPSAnYm9yZGVyJztcbiAgICB9XG5cbiAgICB2YWwgPSBudjtcblxuICAgIGlmICh2YWwuaW5kZXhPZihVTlNFVCkgIT09IC0xKSB7XG4gICAgICAgIHZhbCA9IHZhbC5zcGxpdChTRVBBUkFUT1IpO1xuXG4gICAgICAgIHRvcCAgICA9IHZhbFswXTtcbiAgICAgICAgcmlnaHQgID0gdmFsWzFdIHx8IHZhbFswXTtcbiAgICAgICAgYm90dG9tID0gdmFsWzJdIHx8IHZhbFswXTtcbiAgICAgICAgbGVmdCAgID0gdmFsWzNdIHx8IHZhbFsxXSB8fCB2YWxbMF07XG5cbiAgICAgICAgc2V0VmFsKCd0b3AnLCAgICB0b3ApO1xuICAgICAgICBzZXRWYWwoJ3JpZ2h0JywgIHJpZ2h0KTtcbiAgICAgICAgc2V0VmFsKCdib3R0b20nLCBib3R0b20pO1xuICAgICAgICBzZXRWYWwoJ2xlZnQnLCAgIGxlZnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdib3JkZXJ3aWR0aCcpIHtcbiAgICAgICAgICAgIGNzc0tleSA9ICdib3JkZXJ3aWR0aCc7XG4gICAgICAgIH1cbiAgICAgICAgY3NzT2JqW2Nzc0tleV0gPSBudjtcbiAgICB9XG59O1xuXG5jb25zdCBwcm9jZXNzRGltZW5zaW9uQXR0cmlidXRlcyA9IGF0dHJNYXAgPT4ge1xuICAgIGNvbnN0IGF0dHJLZXlzID0gQXJyYXkuZnJvbShhdHRyTWFwLmtleXMoKSk7XG4gICAgYXR0cktleXMuZm9yRWFjaCgoYXR0cktleTogYW55KSA9PiB7XG4gICAgICAgIGlmIChESU1FTlNJT05fUFJPUFMuaW5jbHVkZXMoYXR0cktleSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNzc09iaiA9IHt9LFxuICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSA9IGF0dHJNYXAuZ2V0KGF0dHJLZXkpO1xuICAgICAgICAgICAgYXR0ck1hcC5kZWxldGUoYXR0cktleSk7XG4gICAgICAgICAgICBzZXREaW1lbnNpb25Qcm9wKGNzc09iaiwgYXR0cktleSwgYXR0clZhbHVlKTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNzc09iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjc3NPYmpba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBhdHRyTWFwLnNldChrZXksIGNzc09ialtrZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gcmVwbGFjZSA8OnN2Zzpzdmc+IC0+IDxzdmc+LCA8OnN2ZzoqPiAtPiA8c3ZnOio+XG5jb25zdCBnZXROb2RlTmFtZSA9IG5hbWUgPT4gbmFtZS5yZXBsYWNlKCc6c3ZnOnN2ZycsICdzdmcnKS5yZXBsYWNlKCc6c3ZnOicsICdzdmc6Jyk7XG5cbmV4cG9ydCBjb25zdCBwcm9jZXNzTm9kZSA9IChub2RlLCBwcm92aWRlcnM/OiBBcnJheTxJUHJvdmlkZXJJbmZvPikgPT4ge1xuICAgIGNvbnN0IG5vZGVEZWYgPSByZWdpc3RyeS5nZXQobm9kZS5uYW1lKTtcblxuICAgIGxldCBwcmUsIHBvc3QsIHRlbXBsYXRlO1xuXG4gICAgaWYgKG5vZGVEZWYpIHtcbiAgICAgICAgcHJlID0gbm9kZURlZi5wcmUgfHwgZW1wdHk7XG4gICAgICAgIHBvc3QgPSBub2RlRGVmLnBvc3QgfHwgZW1wdHk7XG4gICAgICAgIHRlbXBsYXRlID0gbm9kZURlZi50ZW1wbGF0ZSB8fCBlbXB0eTtcbiAgICB9XG5cbiAgICBsZXQgbWFya3VwID0gJyc7XG4gICAgbGV0IGF0dHJNYXA7XG4gICAgbGV0IHJlcXVpcmVkUHJvdmlkZXJzO1xuICAgIGxldCBzaGFyZWQ7XG5cbiAgICBpZiAoIXByb3ZpZGVycykge1xuICAgICAgICBwcm92aWRlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBpc0VsZW1lbnRUeXBlID0gbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQ7XG5cbiAgICBpZiAoaXNFbGVtZW50VHlwZSkge1xuICAgICAgICBsZXQgcHJvdmlkZUluZm86IElQcm92aWRlckluZm87XG5cbiAgICAgICAgaWYgKG5vZGVEZWYpIHtcbiAgICAgICAgICAgIHJlcXVpcmVkUHJvdmlkZXJzID0gZ2V0UmVxdWlyZWRQcm92aWRlcnMobm9kZURlZiwgcHJvdmlkZXJzLCBub2RlLmF0dHJzKTtcbiAgICAgICAgICAgIHNoYXJlZCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHRlbXBsYXRlKG5vZGUsIHNoYXJlZCwgLi4ucmVxdWlyZWRQcm92aWRlcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0ck1hcCA9IGdldEF0dHJNYXAobm9kZS5hdHRycyk7XG4gICAgICAgIHByb2Nlc3NEaW1lbnNpb25BdHRyaWJ1dGVzKGF0dHJNYXApO1xuXG4gICAgICAgIGNvbnN0IG5vZGVOYW1lID0gZ2V0Tm9kZU5hbWUobm9kZS5uYW1lKTtcblxuICAgICAgICBpZiAobm9kZURlZikge1xuICAgICAgICAgICAgbWFya3VwID0gKDxhbnk+cHJlKShhdHRyTWFwLCBzaGFyZWQsIC4uLnJlcXVpcmVkUHJvdmlkZXJzKTtcbiAgICAgICAgICAgIGlmIChub2RlRGVmLnByb3ZpZGUpIHtcbiAgICAgICAgICAgICAgICBwcm92aWRlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6IG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZTogXy5pc0Z1bmN0aW9uKG5vZGVEZWYucHJvdmlkZSkgPyBub2RlRGVmLnByb3ZpZGUoYXR0ck1hcCwgc2hhcmVkLCAuLi5yZXF1aXJlZFByb3ZpZGVycykgOiBub2RlRGVmLnByb3ZpZGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIEZvciB0YWJsZSBub2RlLCBhc3NpZ25pbmcgcGFyZW50IHByb3ZpZGUgbWFwIHRvIHRoZSBjaGlsZCwgYXMgY2hpbGQgcmVxdWlyZXMgc29tZSBwYXJlbnQgcHJvdmlkZSBhdHRycy5cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5uYW1lID09PSAnd20tdGFibGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlQ29sTm9kZURlZm4gPSByZWdpc3RyeS5nZXQoJ3dtLXRhYmxlLWNvbHVtbicpO1xuICAgICAgICAgICAgICAgICAgICB0YWJsZUNvbE5vZGVEZWZuW18uZmluZChub2RlLmF0dHJzLCAoZWwpID0+IGVsLm5hbWUgPT09ICduYW1lJykudmFsdWVdID0gcHJvdmlkZUluZm8ucHJvdmlkZTtcbiAgICAgICAgICAgICAgICAgICAgcmVnaXN0cnkuc2V0KCd3bS10YWJsZS1jb2x1bW4nLCB0YWJsZUNvbE5vZGVEZWZuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzLnB1c2gocHJvdmlkZUluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFya3VwID0gYDwke25vZGVOYW1lfSAke2dldEF0dHJNYXJrdXAoYXR0ck1hcCl9PmA7XG4gICAgICAgIH1cblxuICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gbWFya3VwICs9IHByb2Nlc3NOb2RlKGNoaWxkLCBwcm92aWRlcnMpKTtcblxuICAgICAgICBpZiAobm9kZURlZikge1xuICAgICAgICAgICAgaWYgKHByb3ZpZGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzLnNwbGljZShwcm92aWRlcnMuaW5kZXhPZihwcm92aWRlSW5mbyksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFya3VwICs9ICg8YW55PnBvc3QpKGF0dHJNYXAsIHNoYXJlZCwgLi4ucmVxdWlyZWRQcm92aWRlcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG5vZGUuZW5kU291cmNlU3BhbiAmJiAhZ2V0SHRtbFRhZ0RlZmluaXRpb24obm9kZS5uYW1lKS5pc1ZvaWQpIHtcbiAgICAgICAgICAgICAgICBtYXJrdXAgKz0gYDwvJHtub2RlTmFtZX0+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICAgICAgbWFya3VwICs9IG5vZGUudmFsdWU7XG4gICAgfSBlbHNlIGlmIChub2RlIGluc3RhbmNlb2YgQ29tbWVudCkge1xuICAgICAgICBpZiAoIWlnbm9yZUNvbW1lbnRzKSB7XG4gICAgICAgICAgICBtYXJrdXAgKz0gbm9kZS52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXJrdXA7XG59O1xuXG5leHBvcnQgY29uc3QgdHJhbnNwaWxlID0gKG1hcmt1cDogc3RyaW5nID0gJycpID0+IHtcbiAgICBpZiAoIW1hcmt1cC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG5vZGVzID0gaHRtbFBhcnNlci5wYXJzZShtYXJrdXAsICcnKTtcblxuICAgIGlmIChub2Rlcy5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgb3V0cHV0ID0gJyc7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzLnJvb3ROb2Rlcykge1xuICAgICAgICBvdXRwdXQgKz0gcHJvY2Vzc05vZGUobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXIgPSAobm9kZU5hbWU6IHN0cmluZywgbm9kZURlZkZuOiAoKSA9PiBJQnVpbGRUYXNrRGVmKSA9PiByZWdpc3RyeS5zZXQobm9kZU5hbWUsIG5vZGVEZWZGbigpKTtcblxuZXhwb3J0IGludGVyZmFjZSBJQnVpbGRUYXNrRGVmIHtcbiAgICByZXF1aXJlcz86IHN0cmluZyB8IEFycmF5PHN0cmluZz47XG4gICAgdGVtcGxhdGU/OiAobm9kZTogRWxlbWVudCB8IFRleHQgfCBDb21tZW50LCBzaGFyZWQ/OiBNYXA8YW55LCBhbnk+LCAuLi5yZXF1aXJlczogQXJyYXk8TWFwPGFueSwgYW55Pj4pID0+IHZvaWQ7XG4gICAgcHJlOiAoYXR0cnM6IE1hcDxzdHJpbmcsIHN0cmluZz4sIHNoYXJlZCA/OiBNYXA8YW55LCBhbnk+LCAuLi5yZXF1aXJlczogQXJyYXk8TWFwPGFueSwgYW55Pj4pID0+IHN0cmluZztcbiAgICBwcm92aWRlPzogKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBzaGFyZWQgPzogTWFwPGFueSwgYW55PiwgLi4ucmVxdWlyZXM6IEFycmF5PE1hcDxhbnksIGFueT4+KSA9PiBNYXA8YW55LCBhbnk+O1xuICAgIHBvc3Q/OiAoYXR0cnM6IE1hcDxzdHJpbmcsIHN0cmluZz4sIHNoYXJlZCA/OiBNYXA8YW55LCBhbnk+LCAuLi5yZXF1aXJlczogQXJyYXk8TWFwPGFueSwgYW55Pj4pID0+IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IHNjb3BlQ29tcG9uZW50U3R5bGVzID0gKGNvbXBvbmVudE5hbWUsIGNvbXBvbmVudFR5cGUsIHN0eWxlcyA9ICcnKSA9PiB7XG4gICAgY29tcG9uZW50TmFtZSA9IGNvbXBvbmVudE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBjb21tZW50cyA9IHt9O1xuICAgIGxldCBjb21tZW50Q291bnQgPSAwO1xuICAgIGlmIChzdHlsZXMuc3RhcnRzV2l0aCgnLypESVNBQkxFX1NDT1BJTkcqLycpKSB7XG4gICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgfVxuICAgIHN0eWxlcyA9IHN0eWxlcy5yZXBsYWNlKENTU19SRUdFWC5DT01NRU5UU19GT1JNQVQsIGNvbW1lbnQgPT4ge1xuICAgICAgICBjb25zdCBrZXkgPSBgQGNvbW1lbnQke2NvbW1lbnRDb3VudCsrfXtgO1xuICAgICAgICBjb21tZW50c1trZXldID0gY29tbWVudDtcbiAgICAgICAgcmV0dXJuIGtleTtcbiAgICB9KTtcbiAgICBzdHlsZXMgPSBzdHlsZXMucmVwbGFjZShDU1NfUkVHRVguU0VMRUNUT1JfRk9STUFULCAoc2VsZWN0b3IpID0+IHtcbiAgICAgICAgaWYgKCFDU1NfUkVHRVguU0VMRUNUT1JfRVhDTFVERV9GT1JNQVQudGVzdChzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0Tm9uU3BhY2VDaGFySW5kZXggPSBzZWxlY3Rvci5tYXRjaCgvXFxTLykuaW5kZXg7XG4gICAgICAgICAgICBsZXQgcHJlZml4U3BhY2VDaGFyU2VxID0gJyc7XG4gICAgICAgICAgICBpZiAoZmlyc3ROb25TcGFjZUNoYXJJbmRleCA+IDApIHtcbiAgICAgICAgICAgICAgICBwcmVmaXhTcGFjZUNoYXJTZXEgPSBzZWxlY3Rvci5zdWJzdHJpbmcoMCwgZmlyc3ROb25TcGFjZUNoYXJJbmRleCk7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5zdWJzdHJpbmcoZmlyc3ROb25TcGFjZUNoYXJJbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yLnN0YXJ0c1dpdGgoJy8qJykgJiYgc2VsZWN0b3IudHJpbSgpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGFjZUluZGV4ID0gc2VsZWN0b3IuaW5kZXhPZignICcpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rvci5zdGFydHNXaXRoKCcud20tYXBwJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwYWNlSW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLnN1YnN0cmluZyhzcGFjZUluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50VHlwZSA9PT0gMCB8fCBjb21wb25lbnRUeXBlID09PSAnUEFHRScpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgLndtLWFwcCBhcHAtcGFnZS0ke2NvbXBvbmVudE5hbWV9ICR7c2VsZWN0b3J9YDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09IDEgfHwgY29tcG9uZW50VHlwZSA9PT0gJ1BSRUZBQicpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgLndtLWFwcCBhcHAtcHJlZmFiLSR7Y29tcG9uZW50TmFtZX0gJHtzZWxlY3Rvcn1gO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50VHlwZSA9PT0gMiB8fCBjb21wb25lbnRUeXBlID09PSAnUEFSVElBTCcpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgLndtLWFwcCBhcHAtcGFydGlhbC0ke2NvbXBvbmVudE5hbWV9ICR7c2VsZWN0b3J9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxlY3RvciA9IHByZWZpeFNwYWNlQ2hhclNlcSArIHNlbGVjdG9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9KTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBjb21tZW50cykge1xuICAgICAgICBzdHlsZXMgPSBzdHlsZXMucmVwbGFjZShrZXksIGNvbW1lbnRzW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gc3R5bGVzO1xufTtcblxuIl19