import '@angular/forms';
import { InjectionToken } from '@angular/core';
import { Attribute, Element, Text } from '@angular/compiler';
import { IDGenerator, updateTemplateAttrs, getNgModelAttr, FormWidgetType, getFormWidgetTemplate, isMobileApp, DataType, isDateTimeType, getRowActionAttrs } from '@wm/core';
import { getAttrMarkup, register, getBoundToExpr, getFormMarkupAttr, getDataSource } from '@wm/transpiler';
export * from '@wm/transpiler';

var tagName = 'div';
register('wm-accordion', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmAccordion role=\"tablist\" aria-multiselectable=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});

var tagName$1 = 'div';
register('wm-accordionpane', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1 + " wmAccordionPane partialContainer wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1 + ">"; }
    };
});

var tagName$2 = 'div';
register('wm-tabs', function () {
    return {
        pre: function (attrs) { return "<" + tagName$2 + " wmTabs " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$2 + ">"; }
    };
});

var tagName$3 = 'div';
register('wm-tabpane', function () {
    return {
        pre: function (attrs) { return "<" + tagName$3 + " wmTabPane  partialContainer " + getAttrMarkup(attrs) + " wm-navigable-element=\"true\" role=\"tabpanel\">"; },
        post: function () { return "</" + tagName$3 + ">"; }
    };
});

var tagName$4 = 'a';
register('wm-anchor', function () {
    return {
        pre: function (attrs) { return "<" + tagName$4 + " wmAnchor role=\"link\" data-identifier=\"anchor\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$4 + ">"; }
    };
});

var tagName$5 = 'div';
register('wm-audio', function () {
    return {
        pre: function (attrs) { return "<" + tagName$5 + " wmAudio " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$5 + ">"; }
    };
});

var tagName$6 = 'ol';
register('wm-breadcrumb', function () {
    return {
        pre: function (attrs) { return "<" + tagName$6 + " wmBreadcrumb " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$6 + ">"; }
    };
});

var tagName$7 = 'div';
register('wm-buttongroup', function () {
    return {
        pre: function (attrs) { return "<" + tagName$7 + " wmButtonGroup role=\"group\" aria-labelledby=\"button group\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$7 + ">"; }
    };
});

var tagName$8 = 'button';
register('wm-button', function () {
    return {
        pre: function (attrs) { return "<" + tagName$8 + " wmButton " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$8 + ">"; }
    };
});

var tagName$9 = 'div';
register('wm-calendar', function () {
    return {
        pre: function (attrs) { return "<" + tagName$9 + " wmCalendar redrawable style=\"width:100%\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$9 + ">"; }
    };
});

var tagName$a = 'div';
register('wm-card', function () {
    return {
        pre: function (attrs) { return "<" + tagName$a + " wmCard " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$a + ">"; }
    };
});

var tagName$b = 'div';
register('wm-card-content', function () {
    return {
        pre: function (attrs) { return "<" + tagName$b + " wmCardContent partialContainer " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$b + ">"; }
    };
});

var tagName$c = 'div';
register('wm-card-actions', function () {
    return {
        pre: function (attrs) { return "<" + tagName$c + " wmCardActions " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$c + ">"; }
    };
});

var tagName$d = 'div';
register('wm-card-footer', function () {
    return {
        pre: function (attrs) { return "<" + tagName$d + " wmCardFooter " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$d + ">"; }
    };
});

var carouselTagName = 'carousel';
var dataSetKey = 'dataset';
var idGen = new IDGenerator('wm_carousel_ref_');
var isDynamicCarousel = function (node) { return node.attrs.find(function (attr) { return attr.name === 'type' && attr.value === 'dynamic'; }); };
var ɵ0 = isDynamicCarousel;
register('wm-carousel', function () {
    return {
        pre: function (attrs, shared) {
            // generating unique Id for the carousel
            var counter = idGen.nextUid();
            shared.set('carousel_ref', counter);
            return "<div class=\"app-carousel carousel\"><" + carouselTagName + " wmCarousel #" + counter + "=\"wmCarousel\"  " + getAttrMarkup(attrs) + " interval=\"0\" [ngClass]=\"" + counter + ".navigationClass\">";
        },
        post: function () { return "</" + carouselTagName + "></div>"; },
        template: function (node) {
            // check if the carousel is dynamic
            if (isDynamicCarousel(node)) {
                var datasetAttr = node.attrs.find(function (attr) { return attr.name === dataSetKey; });
                var widgetNameAttr = node.attrs.find(function (attr) { return attr.name === 'name'; });
                if (!datasetAttr) {
                    return;
                }
                var boundExpr = getBoundToExpr(datasetAttr.value);
                if (!boundExpr) {
                    return;
                }
                updateTemplateAttrs(node, boundExpr, widgetNameAttr.value);
            }
        },
        // To provide parent carousel reference for children
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('carousel_ref', shared.get('carousel_ref'));
            return provider;
        }
    };
});

var carouselContentTagName = 'slide';
// For static carousel
register('wm-carousel-content', function () {
    return {
        pre: function (attrs) { return "<" + carouselContentTagName + " wmCarouselTemplate  " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + carouselContentTagName + ">"; }
    };
});
// For dynamic carousel
register('wm-carousel-template', function () {
    return {
        requires: ['wm-carousel'],
        pre: function (attrs, shared, parentCarousel) {
            var carouselRef = parentCarousel.get('carousel_ref');
            return "<div *ngIf=\"!" + carouselRef + ".fieldDefs\">{{" + carouselRef + ".nodatamessage}}</div>\n                    <" + carouselContentTagName + " wmCarouselTemplate  " + getAttrMarkup(attrs) + " *ngFor=\"let item of " + carouselRef + ".fieldDefs; let i = index;\">\n                        <ng-container [ngTemplateOutlet]=\"tempRef\" [ngTemplateOutletContext]=\"{item:item, index:i}\"></ng-container>\n                    </" + carouselContentTagName + ">\n                    <ng-template #tempRef let-item=\"item\" let-index=\"index\">";
        },
        post: function () { return "</ng-template>"; }
    };
});

var tagName$e = 'div';
register('wm-chart', function () {
    return {
        pre: function (attrs) { return "<" + tagName$e + " wmChart redrawable " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$e + ">"; }
    };
});

var tagName$f = 'div';
register('wm-checkbox', function () {
    return {
        pre: function (attrs) { return "<" + tagName$f + " wmCheckbox role=\"input\" " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$f + ">"; }
    };
});

var tagName$g = 'ul';
register('wm-checkboxset', function () {
    return {
        pre: function (attrs) { return "<" + tagName$g + " wmCheckboxset " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$g + ">"; }
    };
});

var tagName$h = 'ul';
register('wm-chips', function () {
    return {
        pre: function (attrs) { return "<" + tagName$h + " wmChips role=\"listbox\" " + getAttrMarkup(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$h + ">"; }
    };
});

var tagName$i = 'div';
register('wm-colorpicker', function () {
    return {
        pre: function (attrs) { return "<" + tagName$i + " wmColorPicker " + getAttrMarkup(attrs) + " role=\"input\" " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$i + ">"; }
    };
});

var tagName$j = 'div';
register('wm-composite', function () {
    return {
        pre: function (attrs) { return "<" + tagName$j + " wmComposite role=\"group\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$j + ">"; }
    };
});

var tagName$k = 'div';
register('wm-container', function () {
    return {
        pre: function (attrs) { return "<" + tagName$k + " wmContainer partialContainer wmSmoothscroll=\"" + (attrs.get('smoothscroll') || 'false') + "\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$k + ">"; }
    };
});

var tagName$l = 'main';
register('wm-content', function () {
    return {
        pre: function (attrs) { return "<" + tagName$l + " wmContent data-role=\"page-content\" role=\"main\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$l + ">"; }
    };
});

var tagName$m = 'div';
register('wm-currency', function () {
    return {
        pre: function (attrs) { return "<" + tagName$m + " wmCurrency " + getAttrMarkup(attrs) + " role=\"input\" " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$m + ">"; }
    };
});

var tagName$n = 'div';
register('wm-datetime', function () {
    return {
        pre: function (attrs) { return "<" + tagName$n + " wmDateTime " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$n + ">"; }
    };
});

var tagName$o = 'div';
register('wm-date', function () {
    return {
        pre: function (attrs) { return "<" + tagName$o + " wmDate " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$o + ">"; }
    };
});

var tagName$p = 'div';
register('wm-alertdialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName$p + " wmAlertDialog role=\"alertdialog\" wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$p + ">"; }
    };
});

var tagName$q = 'div';
register('wm-confirmdialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName$q + " wmConfirmDialog wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$q + ">"; }
    };
});

var tagName$r = 'div';
register('wm-dialogactions', function () {
    return {
        pre: function (attrs) { return "<ng-template #dialogFooter><" + tagName$r + " wmDialogFooter data-identfier=\"actions\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$r + "></ng-template>"; }
    };
});

var tagName$s = 'div';
register('wm-dialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName$s + " wmDialog " + getAttrMarkup(attrs) + " wm-navigable-element=\"true\"><ng-template #dialogBody>"; },
        post: function () { return "</ng-template></" + tagName$s + ">"; }
    };
});
// Todo:vinay remove wm-view in migration
register('wm-view', function () {
    return {
        pre: function (attrs) { return ''; },
        post: function () { return ''; }
    };
});

var tagName$t = 'div';
register('wm-iframedialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName$t + " wmIframeDialog wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$t + ">"; }
    };
});

var tagName$u = 'div';
register('wm-logindialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName$u + " wmDialog wmLoginDialog " + getAttrMarkup(attrs) + " eventsource.bind=\"Actions.loginAction\" wm-navigable-element=\"true\"><ng-template #dialogBody>"; },
        post: function () { return "</ng-template></" + tagName$u + ">"; }
    };
});

var tagName$v = 'div';
register('wm-pagedialog', function () {
    return {
        pre: function (attrs, shared) {
            var content = attrs.get('content');
            attrs.delete('content');
            var boundContent = attrs.get('content.bind');
            attrs.delete('content.bind');
            var onLoad = attrs.get('load.event');
            attrs.delete('load.event');
            var onLoadEvtMarkup = '';
            var contentMarkup = '';
            if (onLoad) {
                onLoadEvtMarkup = "load.event=\"" + onLoad + "\"";
            }
            if (boundContent) {
                contentMarkup = "content.bind=\"" + boundContent + "\"";
            }
            else if (content) {
                contentMarkup = "content=\"" + content + "\"";
            }
            var containerMarkup = '';
            if (contentMarkup) {
                shared.set('hasPartialContent', true);
                containerMarkup += "<ng-template><div wmContainer partialContainer " + contentMarkup + " width=\"100%\" height=\"100%\" " + onLoadEvtMarkup + ">";
            }
            return "<" + tagName$v + " wmPartialDialog " + getAttrMarkup(attrs) + ">" + containerMarkup;
        },
        post: function (attrs, shared) {
            var preContent = '';
            if (shared.get('hasPartialContent')) {
                preContent = "</div></ng-template>";
            }
            return preContent + "</" + tagName$v + ">";
        }
    };
});

var tagName$w = 'footer';
register('wm-footer', function () {
    return {
        pre: function (attrs) { return "<" + tagName$w + " wmFooter partialContainer data-role=\"page-footer\" role=\"contentinfo\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$w + ">"; }
    };
});

var Context = new InjectionToken('Context Provider Reference');

var DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);
var isDataSetWidget = function (widget) {
    return DATASET_WIDGETS.has(widget);
};

var Live_Operations;
(function (Live_Operations) {
    Live_Operations["INSERT"] = "insert";
    Live_Operations["UPDATE"] = "update";
    Live_Operations["DELETE"] = "delete";
    Live_Operations["READ"] = "read";
})(Live_Operations || (Live_Operations = {}));
var ALLFIELDS = 'All Fields';

var tagName$x = 'div';
var idGen$1 = new IDGenerator('formfield_');
var getEventsTemplate = function (attrs) {
    var eventAttrs = new Map();
    if (!attrs.has('focus.event')) {
        attrs.set('focus.event', '');
    }
    if (!attrs.has('blur.event')) {
        attrs.set('blur.event', '');
    }
    attrs.forEach(function (value, key) {
        if (key.endsWith('.event')) {
            if (key === 'focus.event') {
                value = "_onFocusField($event);" + value;
            }
            else if (key === 'blur.event') {
                value = "_onBlurField($event);" + value;
            }
            eventAttrs.set(key, value);
            attrs.delete(key);
        }
    });
    return getFormMarkupAttr(eventAttrs);
};
var DEFAULT_PLACEHOLDERS = new Map([
    [FormWidgetType.SELECT, ['Select Min value', 'Select Max value', 'Select value']],
    [FormWidgetType.DATETIME, ['Select Min date time', 'Select Max date time', 'Select date time']],
    [FormWidgetType.TIME, ['Select Min time', 'Select Max time', 'Select time']],
    [FormWidgetType.DATE, ['Select Min date', 'Select Max date', 'Select date']],
    [FormWidgetType.TEXTAREA, ['', '', 'Enter value']],
    [FormWidgetType.RICHTEXT, ['', '', 'Enter value']],
    [FormWidgetType.COLORPICKER, ['Select Color', 'Select Color', 'Select Color']],
    [FormWidgetType.CHIPS, ['', '', 'Type here...']],
    [FormWidgetType.PASSWORD, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.NUMBER, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.TEXT, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.CURRENCY, ['Enter Min value', 'Enter Max value', 'Enter value']],
    [FormWidgetType.AUTOCOMPLETE, ['', '', 'Search']],
]);
var setDefaultPlaceholder = function (attrs, widgetType, index) {
    var prop = index === 1 ? 'maxplaceholder' : 'placeholder';
    var placeholder = attrs.get(prop);
    if (placeholder || placeholder === '') {
        return;
    }
    placeholder = DEFAULT_PLACEHOLDERS.get(widgetType) && DEFAULT_PLACEHOLDERS.get(widgetType)[index];
    if (placeholder) {
        attrs.set(prop, placeholder);
    }
};
var ɵ1$1 = setDefaultPlaceholder;
var getWidgetTemplate = function (attrs, options) {
    var name = attrs.get('name');
    var fieldName = (attrs.get('key') || name || '').trim();
    var formControl = options.isMaxWidget ? "formControlName=\"" + fieldName + "_max\"" : (options.isInList ? "[formControlName]=\"" + options.counter + "._fieldName\"" : "formControlName=\"" + fieldName + "\"");
    var tmplRef = options.isMaxWidget ? "#formWidgetMax" : "#formWidget";
    var widgetName = name ? (options.isMaxWidget ? "name=\"" + name + "_formWidgetMax\"" : "name=\"" + name + "_formWidget\"") : '';
    var defaultTmpl = "[class.hidden]=\"!" + options.pCounter + ".isUpdateMode && " + options.counter + ".viewmodewidget !== 'default'\" " + formControl + " " + options.eventsTmpl + " " + tmplRef + " " + widgetName;
    return getFormWidgetTemplate(options.widgetType, defaultTmpl, attrs, { counter: options.counter, pCounter: options.pCounter });
};
var ɵ2$1 = getWidgetTemplate;
var getTemplate = function (attrs, widgetType, eventsTmpl, counter, pCounter, isInList) {
    var isRange = attrs.get('is-range') === 'true';
    if (!isRange) {
        return getWidgetTemplate(attrs, { widgetType: widgetType, eventsTmpl: eventsTmpl, counter: counter, pCounter: pCounter, isInList: isInList });
    }
    var layoutClass = isMobileApp() ? 'col-xs-6' : 'col-sm-6';
    return "<div class=\"" + layoutClass + "\">" + getWidgetTemplate(attrs, { widgetType: widgetType, eventsTmpl: eventsTmpl, counter: counter, pCounter: pCounter }) + "</div>\n                <div class=\"" + layoutClass + "\">" + getWidgetTemplate(attrs, { widgetType: widgetType, eventsTmpl: eventsTmpl, counter: counter, pCounter: pCounter, isMaxWidget: true }) + "</div>";
};
var ɵ3$1 = getTemplate;
var getCaptionByWidget = function (attrs, widgetType, counter) {
    if (attrs.get('is-related') === 'true') {
        return counter + ".getDisplayExpr()";
    }
    if (widgetType === FormWidgetType.PASSWORD) {
        return '\'********\'';
    }
    var caption = counter + ".value";
    if (widgetType === FormWidgetType.DATETIME || widgetType === FormWidgetType.TIMESTAMP) {
        caption += " | toDate:" + counter + ".formWidget.datepattern || 'yyyy-MM-dd hh:mm:ss a'";
        return caption;
    }
    if (widgetType === FormWidgetType.TIME) {
        caption += " | toDate:" + counter + ".formWidget.timepattern || 'hh:mm a'";
        return caption;
    }
    if (widgetType === FormWidgetType.DATE) {
        caption += " | toDate:" + counter + ".formWidget.datepattern ||  'yyyy-MMM-dd'";
        return caption;
    }
    if (widgetType === FormWidgetType.RATING || widgetType === FormWidgetType.UPLOAD) {
        return '';
    }
    if (isDataSetWidget(widgetType) && attrs.get('datafield') === ALLFIELDS) {
        return counter + ".getDisplayExpr()";
    }
    return counter + ".getCaption()";
};
var ɵ4 = getCaptionByWidget;
var registerFormField = function (isFormField) {
    return {
        requires: ['wm-form', 'wm-liveform', 'wm-livefilter', 'wm-list'],
        pre: function (attrs, shared, parentForm, parentLiveForm, parentFilter, parentList) {
            var counter = idGen$1.nextUid();
            var parent = parentForm || parentLiveForm || parentFilter;
            var pCounter = (parent && parent.get('form_reference')) || 'form';
            var widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            var dataRole = isFormField ? 'form-field' : 'filter-field';
            var validationMsg = isFormField ? "<p *ngIf=\"" + counter + "._control?.invalid && " + counter + "._control?.touched && " + pCounter + ".isUpdateMode\"\n                                   class=\"help-block text-danger\"\n                                   [textContent]=\"" + counter + ".validationmessage\"></p>" : '';
            var eventsTmpl = widgetType === FormWidgetType.UPLOAD ? '' : getEventsTemplate(attrs);
            var controlLayout = isMobileApp() ? 'col-xs-12' : 'col-sm-12';
            var isInList = pCounter === (parentList && parentList.get('parent_form_reference'));
            attrs.delete('widget');
            shared.set('counter', counter);
            if (attrs.get('is-range') === 'true') {
                setDefaultPlaceholder(attrs, widgetType, 0);
                setDefaultPlaceholder(attrs, widgetType, 1);
            }
            else {
                setDefaultPlaceholder(attrs, widgetType, 2);
            }
            return "<" + tagName$x + " data-role=\"" + dataRole + "\" [formGroup]=\"" + pCounter + ".ngform\" wmFormField #" + counter + "=\"wmFormField\" widgettype=\"" + widgetType + "\" " + getFormMarkupAttr(attrs) + ">\n                        <div class=\"live-field form-group app-composite-widget clearfix caption-{{" + pCounter + ".captionposition}}\" widget=\"" + widgetType + "\">\n                            <label [hidden]=\"!" + counter + ".displayname\" class=\"app-label control-label formfield-label {{" + pCounter + "._captionClass}}\" [title]=\"" + counter + ".displayname\"\n                                        [ngStyle]=\"{width: " + pCounter + ".captionsize}\" [ngClass]=\"{'text-danger': " + counter + "._control?.invalid && " + counter + "._control?.touched && " + pCounter + ".isUpdateMode,\n                                         required: " + pCounter + ".isUpdateMode && " + counter + ".required}\" [textContent]=\"" + counter + ".displayname\"> </label>\n                            <div [ngClass]=\"" + counter + ".displayname ? " + pCounter + "._widgetClass : '" + controlLayout + "'\">\n                                 <label class=\"form-control-static app-label\"\n                                       [hidden]=\"" + pCounter + ".isUpdateMode || " + counter + ".viewmodewidget === 'default' || " + counter + ".widgettype === 'upload'\" [innerHTML]=\"" + getCaptionByWidget(attrs, widgetType, counter) + "\"></label>\n                                " + getTemplate(attrs, widgetType, eventsTmpl, counter, pCounter, isInList) + "\n                                <p *ngIf=\"!(" + counter + "._control?.invalid && " + counter + "._control?.touched) && " + pCounter + ".isUpdateMode\"\n                                   class=\"help-block\" [textContent]=\"" + counter + ".hint\"></p>\n                                " + validationMsg + "\n                            </div>\n                        </div>";
        },
        post: function () { return "</" + tagName$x + ">"; },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
var ɵ5 = registerFormField;
register('wm-form-field', registerFormField.bind(this, true));
register('wm-filter-field', registerFormField.bind(this, false));

var tagName$y = 'div';
var registerAction = function (tmpl) {
    return {
        pre: function (attrs) { return "<" + tagName$y + " wmFormAction name=\"" + (attrs.get('name') || attrs.get('key')) + "\" " + getAttrMarkup(attrs) + " " + tmpl + ">"; },
        post: function () { return "</" + tagName$y + ">"; }
    };
};
register('wm-form-action', registerAction.bind(this, ''));
register('wm-filter-action', registerAction.bind(this, " update-mode=\"true\" "));

var tagName$z = 'form';
var idGen$2 = new IDGenerator('form_');
var formWidgets = new Set([
    'wm-text',
    'wm-textarea',
    'wm-checkbox',
    'wm-slider',
    'wm-richtexteditor',
    'wm-currency',
    'wm-switch',
    'wm-select',
    'wm-checkboxset',
    'wm-radioset',
    'wm-date',
    'wm-time',
    'wm-timestamp',
    'wm-upload',
    'wm-rating',
    'wm-datetime',
    'wm-search',
    'wm-chips',
    'wm-colorpicker',
    'wm-table'
]);
var addFormControlName = function (children) {
    if (children === void 0) { children = []; }
    children.forEach(function (childNode) {
        if (formWidgets.has(childNode.name)) {
            var key = childNode.attrs.find(function (attr) { return attr.name === 'key' || attr.name === 'name'; });
            key = key && key.value;
            childNode.attrs.push(new Attribute('formControlName', key, 1, 1));
            childNode.attrs.push(new Attribute('wmFormWidget', '', 1, 1));
        }
        addFormControlName(childNode.children);
    });
};
var updateFormDataSource = function (attrMap) {
    if (attrMap.get('formdata.bind')) {
        var formDataSource = getDataSource(attrMap.get('formdata.bind'));
        if (formDataSource) {
            attrMap.set('formdatasource.bind', formDataSource);
        }
    }
};
var buildTask = function (directiveAttr) {
    if (directiveAttr === void 0) { directiveAttr = ''; }
    return {
        requires: ['wm-livetable', 'wm-login'],
        template: function (node) {
            addFormControlName(node.children);
        },
        pre: function (attrs, shared, parentLiveTable, parentLoginWidget) {
            var tmpl;
            var dialogId;
            var role = parentLoginWidget && parentLoginWidget.get('isLogin') ? 'app-login' : '';
            var counter = idGen$2.nextUid();
            var dependsOn = attrs.get('dependson') ? "dependson=\"" + attrs.get('dependson') + "\"" : '';
            var classProp = attrs.get('formlayout') === 'page' ? 'app-device-liveform panel liveform-inline' : '';
            var dialogAttributes = ['title', 'title.bind', 'iconclass', 'iconclass.bind', 'width'];
            attrs.delete('dependson');
            var liveFormTmpl = "<" + tagName$z + " wmForm role=\"" + role + "\" " + directiveAttr + " #" + counter + " ngNativeValidate [formGroup]=\"" + counter + ".ngform\" [noValidate]=\"" + counter + ".validationtype !== 'html'\"\n                    class=\"" + classProp + "\" [class]=\"" + counter + ".captionAlignClass\" [autocomplete]=\"" + counter + ".autocomplete ? 'on' : 'off'\" captionposition=" + attrs.get('captionposition');
            shared.set('counter', counter);
            updateFormDataSource(attrs);
            if (attrs.get('formlayout') === 'dialog') {
                dialogId = parentLiveTable ? parentLiveTable.get('liveform_dialog_id') : "liveform_dialog_id_" + counter;
                attrs.set('dialogId', dialogId);
                var dialogAttrsMap_1 = new Map();
                dialogAttributes.forEach(function (attr) {
                    if (attrs.get(attr)) {
                        dialogAttrsMap_1.set(attr, attrs.get(attr));
                    }
                });
                attrs.set('width', '100%');
                tmpl = getAttrMarkup(attrs);
                return "<div data-identifier=\"liveform\" init-widget class=\"app-liveform liveform-dialog\" " + dependsOn + " dialogid=\"" + dialogId + "\">\n                            <div wmDialog class=\"app-liveform-dialog\" name=\"" + dialogId + "\" role=\"form\" " + getAttrMarkup(dialogAttrsMap_1) + " modal=\"true\">\n                            <ng-template #dialogBody>\n                            " + liveFormTmpl + " " + tmpl + ">";
            }
            var mobileFormContentTmpl = '';
            var buttonTemplate = '';
            // Include mobile-navbar above the form when formlayout is set to page
            if (attrs.get('formlayout') === 'page') {
                var name_1 = "device_liveform_header_" + counter;
                var navbarAttrsMap = new Map();
                navbarAttrsMap.set('title', attrs.get('title'));
                navbarAttrsMap.set('backbtnclick.event', attrs.get('backbtnclick.event'));
                buttonTemplate = "<ng-template #buttonRef let-btn=\"btn\">\n                                            <button  wmButton name=\"{{btn.key}}\" class=\"navbar-btn btn-primary btn-transparent\" iconclass.bind=\"btn.iconclass\" show.bind=\"btn.show\"\n                                                     (click)=\"" + counter + ".invokeActionEvent($event, btn.action)\" type.bind=\"btn.type\" hint.bind=\"btn.title\" shortcutkey.bind=\"btn.shortcutkey\" disabled.bind=\"btn.disabled\"\n                                                     tabindex.bind=\"btn.tabindex\" [class.hidden]=\"btn.updateMode ? !" + counter + ".isUpdateMode : " + counter + ".isUpdateMode\"></button>\n                                        </ng-template>";
                mobileFormContentTmpl = "<header wmMobileNavbar name=\"" + name_1 + "\" " + getAttrMarkup(navbarAttrsMap) + ">\n                                            <ng-container *ngFor=\"let btn of " + counter + ".buttonArray\" [ngTemplateOutlet]=\"buttonRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n                                            </ng-container>\n                                        </header>\n                                        <div class=\"form-elements panel-body\" >";
            }
            tmpl = getAttrMarkup(attrs);
            return liveFormTmpl + " " + tmpl + " " + dependsOn + ">\n                       " + buttonTemplate + " " + mobileFormContentTmpl;
        },
        post: function (attrs) {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            if (attrs.get('formlayout') === 'page') {
                return "</div></" + tagName$z + ">";
            }
            return "</" + tagName$z + ">";
        },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
register('wm-form', buildTask);
register('wm-liveform', function () { return buildTask('wmLiveForm'); });
register('wm-livefilter', function () { return buildTask('wmLiveFilter'); });

var tagName$A = 'header';
register('wm-header', function () {
    return {
        pre: function (attrs) { return "<" + tagName$A + " wmHeader partialContainer data-role=\"page-header\" role=\"banner\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$A + ">"; }
    };
});

var tagName$B = 'div';
register('wm-html', function () {
    return {
        pre: function (attrs) { return "<" + tagName$B + " wmHtml " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$B + ">"; }
    };
});

var tagName$C = 'span';
register('wm-icon', function () {
    return {
        pre: function (attrs) { return "<" + tagName$C + " wmIcon aria-hidden=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$C + ">"; }
    };
});

var tagName$D = 'div';
register('wm-iframe', function () {
    return {
        pre: function (attrs) { return "<" + tagName$D + " wmIframe " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$D + ">"; }
    };
});

var tagName$E = 'label';
register('wm-label', function () {
    return {
        pre: function (attrs) { return "<" + tagName$E + " wmLabel " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$E + ">"; }
    };
});

var wmListTag = 'wm-list';
var listTagName = 'div';
var dataSetKey$1 = 'dataset';
register(wmListTag, function () {
    return {
        requires: ['wm-form', 'wm-liveform'],
        template: function (node) {
            var datasetAttr = node.attrs.find(function (attr) { return attr.name === dataSetKey$1; });
            var widgetNameAttr = node.attrs.find(function (attr) { return attr.name === 'name'; });
            if (!datasetAttr) {
                return;
            }
            var boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, 'itemRef.');
        },
        pre: function (attrs, shared, parentForm, parentLiveForm) {
            var parent = parentForm || parentLiveForm;
            shared.set('form_reference', parent && parent.get('form_reference'));
            return "<" + listTagName + " wmList wmLiveActions " + getAttrMarkup(attrs) + ">";
        },
        post: function () { return "</" + listTagName + ">"; },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('parent_form_reference', shared.get('form_reference'));
            return provider;
        }
    };
});
register('wm-listtemplate', function () {
    return {
        pre: function () { return "<ng-template #listTemplate let-item=\"item\" let-$index=\"$index\" let-itemRef=\"itemRef\" let-$first=\"$first\" let-$last=\"$last\"  let-currentItemWidgets=\"currentItemWidgets\" >"; },
        post: function () { return "</ng-template>"; }
    };
});
function copyAttribute(from, fromAttrName, to, toAttrName) {
    var fromAttr = from.attrs.find(function (a) { return a.name === fromAttrName; });
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-list-action-template', function () {
    return {
        template: function (node) {
            var position = node.attrs.find(function (attr) { return attr.name === 'position'; }).value;
            var btns = node.children
                .filter(function (e) { return e instanceof Element && e.name === 'wm-button'; });
            // add swipe-position on button nodes to identify whether buttons are from left or right action templates
            btns.forEach(function (btnNode) {
                copyAttribute(node, 'position', btnNode, 'swipe-position');
            });
        },
        pre: function (attrs, el) {
            if (attrs.get('position') === 'left') {
                return "<ng-template #listLeftActionTemplate>\n                            <li class=\"app-list-item-action-panel app-list-item-left-action-panel actionMenu\" " + getAttrMarkup(attrs) + ">";
            }
            if (attrs.get('position') === 'right') {
                return "<ng-template #listRightActionTemplate>\n                            <li class=\"app-list-item-action-panel app-list-item-right-action-panel actionMenu\" " + getAttrMarkup(attrs) + ">";
            }
        },
        post: function () { return "</li></ng-template>"; }
    };
});

var tagName$F = 'div';
register('wm-gridcolumn', function () {
    return {
        pre: function (attrs) { return "<" + tagName$F + " wmLayoutGridColumn " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$F + ">"; }
    };
});

var tagName$G = 'div';
register('wm-gridrow', function () {
    return {
        pre: function (attrs) { return "<" + tagName$G + " wmLayoutGridRow " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$G + ">"; }
    };
});

var tagName$H = 'div';
register('wm-layoutgrid', function () {
    return {
        pre: function (attrs) { return "<" + tagName$H + " wmLayoutGrid " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$H + ">"; }
    };
});

var tagName$I = 'aside';
register('wm-left-panel', function () {
    return {
        pre: function (attrs) { return "<" + tagName$I + " wmLeftPanel partialContainer data-role=\"page-left-panel\" role=\"complementary\" wmSmoothscroll=\"" + (attrs.get('smoothscroll') || 'true') + "\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$I + ">"; }
    };
});

var tagName$J = 'div';
var idGen$3 = new IDGenerator('liveform_dialog_id_');
register('wm-livetable', function () {
    return {
        pre: function (attrs, shared) {
            var counter = idGen$3.nextUid();
            shared.set('counter', counter);
            return "<" + tagName$J + " wmLiveTable role=\"table\" " + getAttrMarkup(attrs) + " dialogid=\"" + counter + "\">";
        },
        post: function () { return "</" + tagName$J + ">"; },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('liveform_dialog_id', shared.get('counter'));
            return provider;
        }
    };
});

var tagName$K = 'div';
register('wm-login', function () {
    return {
        pre: function (attrs) { return "<" + tagName$K + " wmLogin " + getAttrMarkup(attrs) + " eventsource.bind=\"Actions.loginAction\">"; },
        post: function () { return "</" + tagName$K + ">"; },
        provide: function () {
            var provider = new Map();
            provider.set('isLogin', true);
            return provider;
        }
    };
});

var tagName$L = 'marquee';
register('wm-marquee', function () {
    return {
        pre: function (attrs) { return "<" + tagName$L + " onmouseover=\"this.stop();\" onmouseout=\"this.start();\" wmMarquee role=\"marquee\" aria-live=\"off\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$L + ">"; }
    };
});

var tagName$M = 'p';
register('wm-message', function () {
    return {
        pre: function (attrs) { return "<" + tagName$M + " wmMessage aria-label=\"Notification Alerts\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$M + ">"; }
    };
});

var tagName$N = 'div';
register('wm-menu', function () {
    return {
        pre: function (attrs) { return "<" + tagName$N + " wmMenu dropdown " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$N + ">"; }
    };
});

var tagName$O = 'li';
register('wm-nav-item', function () {
    return {
        pre: function (attrs) { return "<" + tagName$O + " wmNavItem role=\"presentation\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$O + ">"; }
    };
});

var tagName$P = 'ul';
register('wm-nav', function () {
    return {
        pre: function (attrs) { return "<" + tagName$P + " wmNav data-element-type=\"wmNav\" data-role=\"page-header\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$P + ">"; }
    };
});

var tagName$Q = 'nav';
register('wm-navbar', function () {
    return {
        pre: function (attrs) { return "<" + tagName$Q + " wmNavbar data-element-type=\"wmNavbar\" role=\"navigation\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$Q + ">"; }
    };
});

var tagName$R = 'div';
register('wm-number', function () {
    return {
        pre: function (attrs) { return "<" + tagName$R + " wmNumber " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$R + ">"; }
    };
});

var tagName$S = 'div';
register('wm-page-content', function () {
    return {
        pre: function (attrs) { return "<" + tagName$S + " wmPageContent wmSmoothscroll=\"" + (attrs.get('smoothscroll') || 'true') + "\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$S + ">"; }
    };
});

var tagName$T = 'div';
var findChild = function (node, childName) {
    var child = node && node.children.find(function (e) { return (e instanceof Element && e.name === childName); });
    return child;
};
var createElement = function (name) {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};
var addAtrribute = function (node, name, value) {
    var attr = new Attribute(name, value, noSpan, noSpan);
    node.attrs.push(attr);
};
var noSpan = {};
register('wm-page', function () {
    return {
        template: function (node) {
            if (isMobileApp()) {
                var pageContentNode = findChild(findChild(node, 'wm-content'), 'wm-page-content');
                if (pageContentNode) {
                    var conditionalNode = createElement('ng-container');
                    addAtrribute(conditionalNode, '*ngIf', 'compilePageContent');
                    var loader = createElement('div');
                    addAtrribute(loader, 'wmPageContentLoader', '');
                    addAtrribute(loader, '*ngIf', '!showPageContent');
                    conditionalNode.children = conditionalNode.children.concat(pageContentNode.children);
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null));
                    pageContentNode.children = [conditionalNode, loader];
                }
            }
        },
        pre: function (attrs) { return "<" + tagName$T + " wmPage data-role=\"pageContainer\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$T + ">"; }
    };
});

var tagName$U = 'nav';
register('wm-pagination', function () {
    return {
        pre: function (attrs) { return "<" + tagName$U + " wmPagination data-identifier=\"pagination\" aria-label=\"Page navigation\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$U + ">"; }
    };
});

var tagName$V = 'div';
register('wm-panel', function () {
    return {
        pre: function (attrs) { return "<" + tagName$V + " wmPanel partialContainer aria-label=\"panel\" wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$V + ">"; }
    };
});
register('wm-panel-footer', function () {
    return {
        pre: function (attrs) { return "<" + tagName$V + " wmPanelFooter aria-label=\"panel footer\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$V + ">"; }
    };
});

var tagName$W = 'section';
register('wm-partial', function () {
    return {
        pre: function (attrs) { return "<" + tagName$W + " wmPartial data-role=\"partial\" role=\"region\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$W + ">"; }
    };
});

var tagName$X = 'div';
register('wm-param', function () {
    return {
        pre: function (attrs) { return "<" + tagName$X + " wmParam hidden " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$X + ">"; }
    };
});

var tagName$Y = 'img';
register('wm-picture', function () {
    return {
        pre: function (attrs) { return "<" + tagName$Y + " wmPicture alt=\"image\" wmImageCache=\"" + (attrs.get('offline') || 'true') + "\" " + getAttrMarkup(attrs) + ">"; }
    };
});

var tagName$Z = 'wm-popover';
register('wm-popover', function () {
    return {
        requires: ['wm-table'],
        pre: function (attrs, shared, table) {
            var contentSource = attrs.get('contentsource');
            var popoverTemplate;
            if (contentSource !== 'inline') {
                var content = attrs.get('content');
                var bindContent = attrs.get('content.bind');
                var contentMarkup = '';
                if (content) {
                    contentMarkup = "content=\"" + content + "\"";
                }
                else if (bindContent) {
                    contentMarkup = "content.bind=\"" + bindContent + "\"";
                }
                popoverTemplate = "<div wmContainer #partial partialContainer " + contentMarkup + ">";
                shared.set('hasPopoverContent', true);
            }
            var markup = "<" + tagName$Z + " wmPopover " + getAttrMarkup(attrs) + ">";
            var contextAttrs = table ? "let-row=\"row\"" : "";
            markup += "<ng-template " + contextAttrs + "><button class=\"popover-start\"></button>";
            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += "" + (popoverTemplate ? popoverTemplate : '');
            }
            return markup;
        },
        post: function (attrs, shared) {
            var markup = '';
            if (shared.get('hasPopoverContent')) {
                markup += "</div>";
            }
            return markup + "<button class=\"popover-end\"></button></ng-template></" + tagName$Z + ">";
        }
    };
});

var tagName$_ = 'section';
register('wm-prefab', function () {
    return {
        pre: function (attrs) { return "<" + tagName$_ + " wmPrefab data-role=\"perfab\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$_ + ">"; }
    };
});

var tagName$10 = 'div';
register('wm-prefab-container', function () {
    return {
        pre: function (attrs) { return "<" + tagName$10 + " wmPrefabContainer " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$10 + ">"; }
    };
});

var tagName$11 = 'div';
var getAttr = function (node, attrName) { return node.attrs.find(function (attr) { return attr.name === attrName; }); };
var getAttrValue = function (node, attrName) {
    var match = getAttr(node, attrName);
    if (match) {
        return match.value;
    }
};
var getReplaceRegex = function (v) { return new RegExp("bind:(" + v + "|" + v + "\\[\\$i])\\.", 'g'); };
register('wm-progress-bar', function () {
    return {
        template: function (node) {
            var dataset = getAttrValue(node, 'dataset');
            var boundExpr = getBoundToExpr(dataset);
            if (boundExpr) {
                var type = getAttrValue(node, 'type');
                var datavalue = getAttrValue(node, 'datavalue');
                var replaceRegex = getReplaceRegex(boundExpr);
                if (type && type.includes(boundExpr)) {
                    type = type.replace(replaceRegex, '');
                    getAttr(node, 'type').value = type;
                }
                if (datavalue && datavalue.includes(boundExpr)) {
                    datavalue = datavalue.replace(replaceRegex, '');
                    getAttr(node, 'datavalue').value = datavalue;
                }
            }
        },
        pre: function (attrs) { return "<" + tagName$11 + " wmProgressBar " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$11 + ">"; }
    };
});

var tagName$12 = 'div';
register('wm-progress-circle', function () {
    return {
        pre: function (attrs) { return "<" + tagName$12 + " wmProgressCircle " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$12 + ">"; }
    };
});

var tagName$13 = 'ul';
register('wm-radioset', function () {
    return {
        pre: function (attrs) { return "<" + tagName$13 + " wmRadioset role=\"radiogroup\" " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$13 + ">"; }
    };
});

var tagName$14 = 'div';
register('wm-rating', function () {
    return {
        pre: function (attrs) { return "<" + tagName$14 + " wmRating " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$14 + ">"; }
    };
});

var tagName$15 = 'div';
register('wm-richtexteditor', function () {
    return {
        pre: function (attrs) { return "<" + tagName$15 + " wmRichTextEditor role=\"textbox\" " + getFormMarkupAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$15 + ">"; }
    };
});

var tagName$16 = 'aside';
register('wm-right-panel', function () {
    return {
        pre: function (attrs) { return "<" + tagName$16 + " wmRightPanel partialContainer data-role=\"page-right-panel\" role=\"complementary\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$16 + ">"; }
    };
});

var tagName$17 = 'div';
register('wm-search', function () {
    return {
        pre: function (attrs) { return "<" + tagName$17 + " wmSearch " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$17 + ">"; }
    };
});

var tagName$18 = 'wm-select';
register('wm-select', function () {
    return {
        pre: function (attrs) { return "<" + tagName$18 + " " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$18 + ">"; }
    };
});

var tagName$19 = 'div';
register('wm-slider', function () {
    return {
        pre: function (attrs) { return "<" + tagName$19 + " wmSlider " + getAttrMarkup(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$19 + ">"; }
    };
});

var tagName$1a = 'div';
register('wm-spinner', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1a + " wmSpinner role=\"loading\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1a + ">"; }
    };
});

var tagName$1b = 'div';
register('wm-switch', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1b + " wmSwitch " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$1b + ">"; }
    };
});

var tagName$1c = 'div';
register('wm-table-action', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1c + " name=\"" + (attrs.get('name') || attrs.get('key')) + "\" wmTableAction " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1c + ">"; }
    };
});

var tagName$1d = 'div';
register('wm-table-column-group', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1d + " wmTableColumnGroup " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1d + ">"; }
    };
});

var EDIT_MODE = {
    QUICK_EDIT: 'quickedit',
    INLINE: 'inline',
    FORM: 'form',
    DIALOG: 'dialog'
};
var fieldTypeWidgetTypeMap = {
    'integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'big_integer': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'short': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'float': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'big_decimal': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'number': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'double': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'long': ['number', 'text', 'select', 'checkboxset', 'radioset', 'rating', 'slider', 'currency', 'autocomplete', 'chips'],
    'byte': ['number', 'text', 'select', 'checkboxset', 'radioset', 'slider', 'currency', 'autocomplete', 'chips'],
    'string': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
    'character': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'switch', 'currency', 'autocomplete', 'chips'],
    'text': ['text', 'number', 'textarea', 'password', 'richtext', 'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'switch', 'currency', 'autocomplete', 'chips', 'colorpicker'],
    'date': ['date', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'time': ['time', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'timestamp': ['timestamp', 'text', 'number', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'datetime': ['datetime', 'text', 'select', 'checkboxset', 'radioset', 'autocomplete', 'chips'],
    'boolean': ['checkbox', 'radioset', 'toggle', 'select'],
    'list': ['select', 'radioset', 'checkboxset', 'switch', 'autocomplete', 'chips'],
    'clob': ['text', 'textarea', 'richtext'],
    'blob': ['upload'],
    'file': ['upload'],
    'custom': ['text', 'number', 'textarea', 'password', 'checkbox', 'toggle', 'slider', 'richtext', 'currency', 'switch',
        'select', 'checkboxset', 'radioset', 'date', 'time', 'timestamp', 'rating', 'datetime', 'autocomplete', 'chips', 'colorpicker']
};
// Get filter widget applicable to the given type
var getDataTableFilterWidget = function (type) {
    var widget = fieldTypeWidgetTypeMap[type] && fieldTypeWidgetTypeMap[type][0];
    if (type === DataType.BOOLEAN) {
        widget = FormWidgetType.SELECT;
    }
    if (_.includes([FormWidgetType.TEXT, FormWidgetType.NUMBER, FormWidgetType.SELECT, FormWidgetType.AUTOCOMPLETE,
        FormWidgetType.DATE, FormWidgetType.TIME, FormWidgetType.DATETIME], widget)) {
        return widget;
    }
    return FormWidgetType.TEXT;
};
/**
 * @ngdoc function
 * @name wm.widgets.live.getEditModeWidget
 * @methodOf wm.widgets.live.LiveWidgetUtils
 * @function
 *
 * @description
 * This function returns the default widget for grid
 *
 * @param {object} colDef field definition
 */
var getEditModeWidget = function (colDef) {
    if (colDef['related-entity-name'] && colDef['primary-key']) {
        return FormWidgetType.SELECT;
    }
    return (fieldTypeWidgetTypeMap[colDef.type] && fieldTypeWidgetTypeMap[colDef.type][0]) || FormWidgetType.TEXT;
};

var tagName$1e = 'div';
var idGen$4 = new IDGenerator('data_table_form_');
var formWidgets$1 = new Set([
    'wm-text',
    'wm-textarea',
    'wm-checkbox',
    'wm-slider',
    'wm-currency',
    'wm-switch',
    'wm-select',
    'wm-checkboxset',
    'wm-radioset',
    'wm-date',
    'wm-time',
    'wm-timestamp',
    'wm-rating',
    'wm-datetime',
    'wm-search',
    'wm-chips',
    'wm-colorpicker'
]);
// Add ngModelOptions standalone true as inner custom form widgets will be not part of table ngform
var addNgModelStandalone = function (children) {
    if (children === void 0) { children = []; }
    children.forEach(function (childNode) {
        if (formWidgets$1.has(childNode.name)) {
            childNode.attrs.push(new Attribute('[ngModelOptions]', '{standalone: true}', 1, 1));
        }
        addNgModelStandalone(childNode.children);
    });
};
// get the filter template (widget and filter menu) to be displayed in filter row
var getFilterTemplate = function (attrs, pCounter) {
    var widget = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
    var fieldName = attrs.get('binding');
    var type = attrs.get('type') || 'string';
    var datasourceBinding, submitEventBinding;
    var datasetAttr = attrs.get('filterdataset.bind');
    // when multicolumn is selected and filterwidget as autocomplete is assigned to dataset.
    if (attrs.get('filterwidget') === 'autocomplete') {
        if (datasetAttr) {
            var binddatasource = getDataSource(datasetAttr);
            datasourceBinding = "dataset.bind=\"" + datasetAttr + "\" datasource.bind=\"" + binddatasource + "\"";
        }
        submitEventBinding = "submit.event=\"changeFn('" + fieldName + "')\"";
    }
    var innerTmpl = "#filterWidget formControlName=\"" + (fieldName + '_filter') + "\" " + datasourceBinding + " " + submitEventBinding + " change.event=\"changeFn('" + fieldName + "')\"\n                        disabled.bind=\"isDisabled('" + fieldName + "')\"";
    var options = { inputType: 'filterinputtype' };
    var widgetTmpl = "" + getFormWidgetTemplate(widget, innerTmpl, attrs, options);
    return "<ng-template #filterTmpl let-changeFn=\"changeFn\" let-isDisabled=\"isDisabled\">\n    <div class=\"input-group " + widget + "\" data-col-identifier=\"" + fieldName + "\">\n        " + widgetTmpl + "\n        <span class=\"input-group-addon filter-clear-icon\" *ngIf=\"" + pCounter + ".showClearIcon('" + fieldName + "')\">\n            <button class=\"btn-transparent btn app-button\" aria-label=\"Clear button\" type=\"button\" (click)=\"" + pCounter + ".clearRowFilter('" + fieldName + "')\">\n                <i class=\"app-icon wi wi-clear\" aria-hidden=\"true\"></i>\n            </button>\n         </span>\n        <span class=\"input-group-addon\" dropdown container=\"body\">\n            <button class=\"btn-transparent btn app-button\" type=\"button\" dropdownToggle><i class=\"app-icon wi wi-filter-list\"></i></button>\n            <ul class=\"matchmode-dropdown dropdown-menu\" *dropdownMenu>\n                   <li *ngFor=\"let matchMode of " + pCounter + ".matchModeTypesMap['" + type + "']\"\n                        [ngClass]=\"{active: matchMode === (" + pCounter + ".rowFilter['" + fieldName + "'].matchMode || " + pCounter + ".matchModeTypesMap['" + type + "'][0])}\">\n                        <a href=\"javascript:void(0);\" (click)=\"" + pCounter + ".onFilterConditionSelect('" + fieldName + "', matchMode)\" [innerText]=\"" + pCounter + ".matchModeMsgs[matchMode]\"></a>\n                    </li>\n             </ul>\n        </span>\n    </div></ng-template>";
};
var getEventsTmpl = function (attrs) {
    var tmpl = '';
    attrs.forEach(function (val, key) {
        if (key.endsWith('.event')) {
            tmpl += key + "=\"" + val + "\" ";
        }
    });
    return tmpl;
};
// Generate inline edit properties template. Properties requiring row instance are generated here.
var getInlineEditRowPropsTmpl = function (attrs) {
    var propAttrs = new Map();
    var props = ['disabled', 'disabled.bind'];
    props.forEach(function (prop) {
        if (attrs.get(prop)) {
            propAttrs.set(prop, attrs.get(prop));
            attrs.delete(prop);
        }
    });
    return getAttrMarkup(propAttrs);
};
// get the inline widget template
var getInlineEditWidgetTmpl = function (attrs, isNewRow, pCounter) {
    var options = {};
    var fieldName = attrs.get('binding');
    var widget = attrs.get('edit-widget-type') || getEditModeWidget({
        'type': attrs.get('type'),
        'related-entity-name': attrs.get('related-entity-name'),
        'primary-key': attrs.get('primary-key')
    });
    var widgetRef = '';
    var formControl = '';
    var wmFormWidget = '';
    if (widget === FormWidgetType.UPLOAD) {
        options.uploadProps = {
            formName: idGen$4.nextUid(),
            name: fieldName
        };
        options.counter = pCounter;
    }
    else {
        widgetRef = isNewRow ? '#inlineWidgetNew' : '#inlineWidget';
        formControl = isNewRow ? "formControlName=\"" + fieldName + "_new\"" : "formControlName=\"" + fieldName + "\"";
        wmFormWidget = 'wmFormWidget';
    }
    options.inputType = 'editinputtype';
    var tmplRef = isNewRow ? '#inlineWidgetTmplNew' : '#inlineWidgetTmpl';
    var eventsTmpl = widget === FormWidgetType.UPLOAD ? '' : getEventsTmpl(attrs);
    var rowPropsTl = getInlineEditRowPropsTmpl(attrs);
    var innerTmpl = widgetRef + " " + wmFormWidget + " key=\"" + fieldName + "\" data-field-name=\"" + fieldName + "\" " + formControl + " " + eventsTmpl + " " + rowPropsTl;
    var widgetTmpl = getFormWidgetTemplate(widget, innerTmpl, attrs, options);
    return "<ng-template " + tmplRef + " let-row=\"row\" let-getControl=\"getControl\" let-getValidationMessage=\"getValidationMessage\">\n                <div data-col-identifier=\"" + fieldName + "\" >\n                     " + widgetTmpl + "\n                     <span placement=\"top\" container=\"body\" tooltip=\"{{getValidationMessage()}}\" class=\"text-danger wi wi-error\"\n                        *ngIf=\"getValidationMessage() && getControl() && getControl().invalid && getControl().touched\">\n                     </span>\n                     <span class=\"sr-only\" *ngIf=\"getValidationMessage()\">{{getValidationMessage()}}</span>\n                 </div>\n            </ng-template>";
};
var getFormatExpression = function (attrs) {
    var columnValue = "row.getProperty('" + attrs.get('binding') + "')";
    var formatPattern = attrs.get('formatpattern');
    var colExpression = '';
    // For date time data types, if format pattern is not applied, Apply default toDate format
    if (isDateTimeType(attrs.get('type')) && (!formatPattern || formatPattern === 'None')) {
        attrs.set('formatpattern', 'toDate');
        attrs.delete('datepattern');
        formatPattern = 'toDate';
    }
    switch (formatPattern) {
        case 'toDate':
            colExpression = "{{" + columnValue + " | toDate: colDef.datepattern}}";
            break;
        case 'toCurrency':
            if (attrs.get('currencypattern')) {
                colExpression = "{{" + columnValue + " | toCurrency: '" + attrs.get('currencypattern');
                if (attrs.get('fractionsize')) {
                    colExpression += "': " + attrs.get('fractionsize') + "}}";
                }
                else {
                    colExpression += "'}}";
                }
            }
            break;
        case 'numberToString':
            if (attrs.get('fractionsize')) {
                colExpression = "{{" + columnValue + " | numberToString: '" + attrs.get('fractionsize') + "'}}";
            }
            break;
        case 'stringToNumber':
            colExpression = "{{" + columnValue + " | stringToNumber}}";
            break;
        case 'timeFromNow':
            colExpression = "{{" + columnValue + " | timeFromNow}}";
            break;
        case 'prefix':
            if (attrs.get('prefix')) {
                colExpression = "{{" + columnValue + " | prefix: '" + attrs.get('prefix') + "'}}";
            }
            break;
        case 'suffix':
            if (attrs.get('suffix')) {
                colExpression = "{{" + columnValue + " | suffix: '" + attrs.get('suffix') + "'}}";
            }
            break;
    }
    return colExpression;
};
register('wm-table-column', function () {
    return {
        requires: ['wm-table'],
        template: function (node, shared) {
            if (node.children.length) {
                // If node has children, but an empty text node dont generate custom expression
                if (node.children.length === 1 && node.children[0] instanceof Text && node.children[0].value.trim().length === 0) {
                    return;
                }
                shared.set('customExpression', true);
                addNgModelStandalone(node.children);
            }
        },
        pre: function (attrs, shared, parentTable) {
            var rowFilterTmpl = '';
            var inlineEditTmpl = '';
            var inlineNewEditTmpl = '';
            var parentForm = '';
            if (parentTable) {
                var pCounter = parentTable.get('table_reference');
                rowFilterTmpl = (parentTable.get('filtermode') === 'multicolumn' && attrs.get('searchable') !== 'false') ? getFilterTemplate(attrs, pCounter) : '';
                var editMode = parentTable.get('editmode');
                var isInlineEdit = (editMode !== EDIT_MODE.DIALOG && editMode !== EDIT_MODE.FORM && attrs.get('readonly') !== 'true');
                inlineEditTmpl = isInlineEdit ? getInlineEditWidgetTmpl(attrs, false, pCounter) : '';
                inlineNewEditTmpl = isInlineEdit && editMode === EDIT_MODE.QUICK_EDIT && parentTable.get('shownewrow') !== 'false' ? getInlineEditWidgetTmpl(attrs, true) : '';
                parentForm = " [formGroup]=\"" + pCounter + ".ngform\" ";
            }
            var formatPattern = attrs.get('formatpattern');
            var customExpr = "<ng-template #customExprTmpl let-row=\"row\" let-colDef=\"colDef\" let-editRow=\"editRow\" let-deleteRow=\"deleteRow\" let-addNewRow=\"addNewRow\">";
            var customExprTmpl = '';
            var formatExprTmpl = '';
            if (shared.get('customExpression')) {
                attrs.set('customExpression', 'true');
                customExprTmpl = customExpr + "<div data-col-identifier=\"" + attrs.get('binding') + "\">";
            }
            else if ((formatPattern && formatPattern !== 'None') || isDateTimeType(attrs.get('type'))) {
                formatExprTmpl = getFormatExpression(attrs);
                if (formatExprTmpl) {
                    shared.set('customExpression', true);
                    attrs.set('customExpression', 'true');
                    customExprTmpl = customExpr + "<div data-col-identifier=\"" + attrs.get('binding') + "\" title=\"" + formatExprTmpl + "\">" + formatExprTmpl;
                }
            }
            return "<" + tagName$1e + " wmTableColumn " + getAttrMarkup(attrs) + " " + parentForm + ">\n                    " + rowFilterTmpl + "\n                    " + inlineEditTmpl + "\n                    " + inlineNewEditTmpl + "\n                    " + customExprTmpl;
        },
        post: function (attrs, shared) {
            var customExprTmpl = '';
            if (shared.get('customExpression')) {
                customExprTmpl = "</div></ng-template>";
            }
            return customExprTmpl + "</" + tagName$1e + ">";
        }
    };
});

var tagName$1f = 'div';
var getRowExpansionActionTmpl = function (attrs) {
    var tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    var directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return "<ng-template #rowExpansionActionTmpl let-row=\"row\">\n               <" + tag + " " + directive + "\n                    " + getRowActionAttrs(attrs) + "\n                    class=\"" + attrs.get('class') + " row-expansion-button\"\n                    iconclass=\"" + attrs.get('collapseicon') + "\"\n                    type=\"button\"></" + tag + ">\n            </ng-template>";
};
register('wm-table-row', function () {
    return {
        pre: function (attrs) {
            return "<" + tagName$1f + " wmTableRow " + getAttrMarkup(attrs) + ">\n                    " + getRowExpansionActionTmpl(attrs) + "\n                    <ng-template #rowExpansionTmpl let-row=\"row\" let-rowDef=\"rowDef\" let-containerLoad=\"containerLoad\">\n                        <div wmContainer partialContainer content.bind=\"rowDef.content\" load.event=\"containerLoad(widget)\"\n                            [ngStyle]=\"{'height': rowDef.height, 'overflow-y': 'auto'}\">\n                         <div *ngFor=\"let param of rowDef.partialParams | keyvalue\" wmParam hidden\n                            [name]=\"param.key\" [value]=\"param.value\"></div>";
        },
        post: function () { return "</div></ng-template></" + tagName$1f + ">"; }
    };
});

var tagName$1g = 'div';
var getSaveCancelTemplate = function () {
    return "<button type=\"button\" aria-label=\"Save edit icon\" class=\"save row-action-button btn app-button btn-transparent save-edit-row-button hidden\" title=\"Save\">\n                <i class=\"wi wi-done\" aria-hidden=\"true\"></i>\n            </button>\n            <button type=\"button\" aria-label=\"Cancel edit icon\" class=\"cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden\" title=\"Cancel\">\n                <i class=\"wi wi-cancel\" aria-hidden=\"true\"></i>\n            </button>";
};
// get the inline widget template
var getRowActionTmpl = function (attrs) {
    var action = attrs.get('action');
    var actionTmpl = action ? " click.event.delayed=\"" + action + "\" " : '';
    var saveCancelTmpl = action && action.includes('editRow(') ? getSaveCancelTemplate() : '';
    var btnClass = action ? (action.includes('editRow(') ? 'edit edit-row-button' :
        (action.includes('deleteRow(') ? 'delete delete-row-button' : '')) : '';
    var tabIndex = attrs.get('tabindex') ? "tabindex=\"" + attrs.get('tabindex') + "\"" : '';
    var tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    var directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return "<ng-template #rowActionTmpl let-row=\"row\">\n               <" + tag + " " + directive + " data-action-key=\"" + attrs.get('key') + "\"\n                    " + getRowActionAttrs(attrs) + "\n                    class=\"row-action row-action-button " + attrs.get('class') + " " + btnClass + "\"\n                    iconclass=\"" + attrs.get('iconclass') + "\"\n                    " + actionTmpl + "\n                    " + tabIndex + "\n                    type=\"button\"></" + tag + ">\n                " + saveCancelTmpl + "\n            </ng-template>";
};
register('wm-table-row-action', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1g + " wmTableRowAction " + getAttrMarkup(attrs) + ">\n                        " + getRowActionTmpl(attrs); },
        post: function () { return "</" + tagName$1g + ">"; }
    };
});

var tagName$1h = 'div';
var dataSetKey$2 = 'dataset';
var idGen$5 = new IDGenerator('table_');
register('wm-table', function () {
    return {
        template: function (node, shared) {
            // If table does not have child columns, set isdynamictable to true
            if (node.children.length) {
                var isColumnsPresent = node.children.some(function (childNode) {
                    return childNode.name === 'wm-table-column' || childNode.name === 'wm-table-column-group';
                });
                shared.set('isdynamictable', isColumnsPresent ? 'false' : 'true');
            }
            else {
                shared.set('isdynamictable', 'true');
            }
            var datasetAttr = node.attrs.find(function (attr) { return attr.name === dataSetKey$2; });
            var widgetNameAttr = node.attrs.find(function (attr) { return attr.name === 'name'; });
            if (!datasetAttr) {
                return;
            }
            var boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, '', 'row');
        },
        pre: function (attrs, shared) {
            var counter = idGen$5.nextUid();
            shared.set('counter', counter);
            attrs.set('isdynamictable', shared.get('isdynamictable'));
            return "<" + tagName$1h + " wmTable=\"" + counter + "\" wmTableFilterSort wmTableCUD #" + counter + " data-identifier=\"table\" role=\"table\" " + getAttrMarkup(attrs) + ">";
        },
        post: function () { return "</" + tagName$1h + ">"; },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            provider.set('editmode', attrs.get('editmode'));
            provider.set('shownewrow', attrs.get('shownewrow'));
            return provider;
        }
    };
});

var tagName$1i = 'wm-input';
register('wm-text', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1i + " " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$1i + ">"; }
    };
});

var tagName$1j = 'wm-textarea';
register('wm-textarea', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1j + " " + getFormMarkupAttr(attrs) + " " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$1j + ">"; }
    };
});

var tagName$1k = 'div';
register('wm-tile', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1k + " wmTile aria-describedby=\"Tile\" wm-navigable-element=\"true\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1k + ">"; }
    };
});

var tagName$1l = 'div';
register('wm-time', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1l + " wmTime " + getFormMarkupAttr(attrs) + " role=\"input\" " + getNgModelAttr(attrs) + ">"; },
        post: function () { return "</" + tagName$1l + ">"; }
    };
});

var tagName$1m = 'div';
register('wm-tree', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1m + " wmTree redrawable " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1m + ">"; }
    };
});

var tagName$1n = 'section';
register('wm-top-nav', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1n + " wmTopNav partialContainer data-role=\"page-topnav\" role=\"region\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1n + ">"; }
    };
});

var tagName$1o = 'div';
register('wm-video', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1o + " wmVideo " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1o + ">"; }
    };
});

var tagName$1p = 'div';
register('wm-wizard', function () {
    return {
        pre: function (attrs) { return "<" + tagName$1p + " wmWizard role=\"tablist\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName$1p + ">"; }
    };
});

var tagName$1q = 'form';
var idGen$6 = new IDGenerator('wizard_step_id_');
register('wm-wizardstep', function () {
    return {
        pre: function (attrs) {
            var counter = idGen$6.nextUid();
            return "<" + tagName$1q + " wmWizardStep #" + counter + "=\"wmWizardStep\" " + getAttrMarkup(attrs) + ">\n                       <ng-template [ngIf]=\"" + counter + ".isInitialized\">";
        },
        post: function () { return "</ng-template></" + tagName$1q + ">"; }
    };
});

var tagName$1r = 'div';
register('wm-fileupload', function () {
    return {
        pre: function (attrs) {
            if (attrs.get('select.event')) {
                var onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return "<" + tagName$1r + " wmFileUpload " + getAttrMarkup(attrs) + " role=\"input\">";
        },
        post: function () { return "</" + tagName$1r + ">"; }
    };
});

var initComponentsBuildTask = function () { };

/**
 * Generated bundle index. Do not edit.
 */

export { initComponentsBuildTask, ɵ0, ɵ1$1 as ɵ1, ɵ2$1 as ɵ2, ɵ3$1 as ɵ3, ɵ4, ɵ5 };

//# sourceMappingURL=index.js.map