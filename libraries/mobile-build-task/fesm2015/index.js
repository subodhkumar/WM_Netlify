import { Attribute, Element } from '@angular/compiler';
import { getAttrMarkup, register } from '@wm/transpiler';
export * from '@wm/transpiler';

const tagName = 'button';
register('wm-barcodescanner', () => {
    return {
        pre: attrs => `<${tagName} wmBarcodescanner ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

const tagName$1 = 'button';
register('wm-camera', () => {
    return {
        pre: attrs => `<${tagName$1} wmCamera ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1}>`
    };
});

const wmlistTag = 'wm-list';
const tagName$2 = 'div';
const dataSetKey = 'dataset';
function copyAttribute(from, fromAttrName, to, toAttrName) {
    const fromAttr = from.attrs.find(a => a.name === fromAttrName);
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-media-list', () => {
    return {
        template: (node) => {
            let bindDataset;
            const attrObj = node.attrs.find(attr => attr.name === dataSetKey), 
            /**
             *  Replacing binded property value with item
             * @param children
             */
            replaceBind = (children = []) => {
                children.forEach(childNode => {
                    if (childNode.name) {
                        // return if the child Element is of wm-list .
                        if (childNode.name !== wmlistTag) {
                            childNode.attrs.forEach((attr) => {
                                if (attr.value.startsWith(`bind:${bindDataset}.data[$i]`)) {
                                    attr.value = attr.value.replace(`${bindDataset}.data[$i]`, 'item');
                                }
                                else if (attr.value.startsWith(`bind:${bindDataset}`)) {
                                    attr.value = attr.value.replace(bindDataset, 'item');
                                }
                            });
                            replaceBind(childNode.children);
                        }
                    }
                });
            };
            if (attrObj && attrObj.value.startsWith('bind:')) {
                bindDataset = attrObj.value.replace('bind:', '');
            }
            if (bindDataset) {
                replaceBind(node.children);
            }
            const template = node.children
                .find(e => e instanceof Element && e.name === 'wm-media-template');
            if (template != null) {
                copyAttribute(template, 'width', node, 'thumbnailwidth');
                copyAttribute(template, 'height', node, 'thumbnailheight');
            }
        },
        pre: attrs => `<${tagName$2} wmMediaList ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$2}>`
    };
});

const tagName$3 = 'ng-template';
register('wm-media-template', () => {
    return {
        pre: () => `<${tagName$3} #mediaListTemplate let-item="item" let-index="index">`,
        post: () => `</${tagName$3}>`
    };
});

const tagName$4 = 'header';
register('wm-mobile-navbar', () => {
    return {
        pre: attrs => `<${tagName$4} wmMobileNavbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$4}>`
    };
});

const tagName$5 = 'div';
register('wm-network-info-toaster', () => {
    return {
        pre: attrs => `<${tagName$5} wmNetworkInfoToaster ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$5}>`
    };
});

const tagName$6 = 'div';
register('wm-mobile-tabbar', () => {
    return {
        pre: attrs => `<${tagName$6} wmMobileTabbar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$6}>`
    };
});

const tagName$7 = 'li';
register('wm-segment-content', () => {
    return {
        pre: attrs => `<${tagName$7} wmSegmentContent partialContainer wmSmoothscroll=${attrs.get('smoothscroll') || 'true'} wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$7}>`
    };
});

const tagName$8 = 'div';
register('wm-segmented-control', () => {
    return {
        pre: attrs => `<${tagName$8} wmSegmentedControl ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$8}>`
    };
});

const tagName$9 = 'div';
register('wm-widget-template', () => {
    return {
        pre: attrs => `<${tagName$9} wmWidgetTemplate ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$9}>`
    };
});

const initComponentsBuildTask = () => { };

/**
 * Generated bundle index. Do not edit.
 */

export { initComponentsBuildTask };

//# sourceMappingURL=index.js.map