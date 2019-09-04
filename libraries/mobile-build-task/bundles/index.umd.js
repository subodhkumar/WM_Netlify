(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler'), require('@wm/transpiler')) :
    typeof define === 'function' && define.amd ? define('@wm/mobile/components', ['exports', '@angular/compiler', '@wm/transpiler'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.buildTask = {}),global.ng.compiler,global.wm.transpiler));
}(this, (function (exports,compiler,transpiler) { 'use strict';

    var tagName = 'button';
    transpiler.register('wm-barcodescanner', function () {
        return {
            pre: function (attrs) { return "<" + tagName + " wmBarcodescanner " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName + ">"; }
        };
    });

    var tagName$1 = 'button';
    transpiler.register('wm-camera', function () {
        return {
            pre: function (attrs) { return "<" + tagName$1 + " wmCamera " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$1 + ">"; }
        };
    });

    var wmlistTag = 'wm-list';
    var tagName$2 = 'div';
    var dataSetKey = 'dataset';
    function copyAttribute(from, fromAttrName, to, toAttrName) {
        var fromAttr = from.attrs.find(function (a) { return a.name === fromAttrName; });
        if (fromAttr) {
            to.attrs.push(new compiler.Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
        }
    }
    transpiler.register('wm-media-list', function () {
        return {
            template: function (node) {
                var bindDataset;
                var attrObj = node.attrs.find(function (attr) { return attr.name === dataSetKey; }), 
                /**
                 *  Replacing binded property value with item
                 * @param children
                 */
                replaceBind = function (children) {
                    if (children === void 0) {
                        children = [];
                    }
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
                    .find(function (e) { return e instanceof compiler.Element && e.name === 'wm-media-template'; });
                if (template != null) {
                    copyAttribute(template, 'width', node, 'thumbnailwidth');
                    copyAttribute(template, 'height', node, 'thumbnailheight');
                }
            },
            pre: function (attrs) { return "<" + tagName$2 + " wmMediaList " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$2 + ">"; }
        };
    });

    var tagName$3 = 'ng-template';
    transpiler.register('wm-media-template', function () {
        return {
            pre: function () { return "<" + tagName$3 + " #mediaListTemplate let-item=\"item\" let-index=\"index\">"; },
            post: function () { return "</" + tagName$3 + ">"; }
        };
    });

    var tagName$4 = 'header';
    transpiler.register('wm-mobile-navbar', function () {
        return {
            pre: function (attrs) { return "<" + tagName$4 + " wmMobileNavbar " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$4 + ">"; }
        };
    });

    var tagName$5 = 'div';
    transpiler.register('wm-network-info-toaster', function () {
        return {
            pre: function (attrs) { return "<" + tagName$5 + " wmNetworkInfoToaster " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$5 + ">"; }
        };
    });

    var tagName$6 = 'div';
    transpiler.register('wm-mobile-tabbar', function () {
        return {
            pre: function (attrs) { return "<" + tagName$6 + " wmMobileTabbar " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$6 + ">"; }
        };
    });

    var tagName$7 = 'li';
    transpiler.register('wm-segment-content', function () {
        return {
            pre: function (attrs) { return "<" + tagName$7 + " wmSegmentContent partialContainer wmSmoothscroll=" + (attrs.get('smoothscroll') || 'true') + " wm-navigable-element=\"true\" " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$7 + ">"; }
        };
    });

    var tagName$8 = 'div';
    transpiler.register('wm-segmented-control', function () {
        return {
            pre: function (attrs) { return "<" + tagName$8 + " wmSegmentedControl " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$8 + ">"; }
        };
    });

    var tagName$9 = 'div';
    transpiler.register('wm-widget-template', function () {
        return {
            pre: function (attrs) { return "<" + tagName$9 + " wmWidgetTemplate " + transpiler.getAttrMarkup(attrs) + ">"; },
            post: function () { return "</" + tagName$9 + ">"; }
        };
    });

    var initComponentsBuildTask = function () { };

    /**
     * Generated bundle index. Do not edit.
     */

    Object.keys(transpiler).forEach(function (key) { exports[key] = transpiler[key]; });
    exports.initComponentsBuildTask = initComponentsBuildTask;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map