import { Attribute, Element } from '@angular/compiler';
import { getAttrMarkup, register } from '@wm/transpiler';
export * from '@wm/transpiler';

var tagName = 'button';
register('wm-barcodescanner', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmBarcodescanner " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});

var tagName$1 = 'button';
register('wm-camera', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1 + " wmCamera " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1 + ">"; }
    };
});

var wmlistTag = 'wm-list';
var tagName$2 = 'div';
var dataSetKey = 'dataset';
function copyAttribute(from, fromAttrName, to, toAttrName) {
    var fromAttr = from.attrs.find(function (a) { return a.name === fromAttrName; });
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-media-list', function () {
    return {
        template: function (node) {
            var bindDataset;
            var attrObj = node.attrs.find(function (attr) { return attr.name === dataSetKey; }), 
            /**
             *  Replacing binded property value with item
             * @param children
             */
            replaceBind = function (children) {
                if (children === void 0) { children = []; }
                children.forEach(function (childNode) {
                    if (childNode.name) {
                        // return if the child Element is of wm-list .
                        if (childNode.name !== wmlistTag) {
                            childNode.attrs.forEach(function (attr) {
                                if (attr.value.startsWith("bind:" + bindDataset + ".data[$i]")) {
                                    attr.value = attr.value.replace(bindDataset + ".data[$i]", 'item');
                                }
                                else if (attr.value.startsWith("bind:" + bindDataset)) {
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
            var template = node.children
                .find(function (e) { return e instanceof Element && e.name === 'wm-media-template'; });
            if (template != null) {
                copyAttribute(template, 'width', node, 'thumbnailwidth');
                copyAttribute(template, 'height', node, 'thumbnailheight');
            }
        },
        pre: function (attrs) { return "<" + tagName$2 + " wmMediaList " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$2 + ">"; }
    };
});

var tagName$3 = 'ng-template';
register('wm-media-template', function () {
    return {
        pre: function () { return "<" + tagName$3 + " #mediaListTemplate let-item=\"item\" let-index=\"index\">"; },
        post: function () { return "</" + tagName$3 + ">"; }
    };
});

var tagName$4 = 'header';
register('wm-mobile-navbar', function () {
    return {
        pre: function (attrs) { return "<" + tagName$4 + " wmMobileNavbar " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$4 + ">"; }
    };
});

var tagName$5 = 'div';
register('wm-network-info-toaster', function () {
    return {
        pre: function (attrs) { return "<" + tagName$5 + " wmNetworkInfoToaster " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$5 + ">"; }
    };
});

var tagName$6 = 'div';
register('wm-mobile-tabbar', function () {
    return {
        pre: function (attrs) { return "<" + tagName$6 + " wmMobileTabbar " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$6 + ">"; }
    };
});

var tagName$7 = 'li';
register('wm-segment-content', function () {
    return {
        pre: function (attrs) { return "<" + tagName$7 + " wmSegmentContent partialContainer wmSmoothscroll=" + (attrs.get('smoothscroll') || 'true') + " wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$7 + ">"; }
    };
});

var tagName$8 = 'div';
register('wm-segmented-control', function () {
    return {
        pre: function (attrs) { return "<" + tagName$8 + " wmSegmentedControl " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$8 + ">"; }
    };
});

var tagName$9 = 'div';
register('wm-widget-template', function () {
    return {
        pre: function (attrs) { return "<" + tagName$9 + " wmWidgetTemplate " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$9 + ">"; }
    };
});

var initComponentsBuildTask = function () { };

/**
 * Generated bundle index. Do not edit.
 */

export { initComponentsBuildTask };

//# sourceMappingURL=index.js.map