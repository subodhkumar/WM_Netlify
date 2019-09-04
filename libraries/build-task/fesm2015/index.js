import '@angular/forms';
import { InjectionToken } from '@angular/core';
import { Attribute, Element, Text } from '@angular/compiler';
import { IDGenerator, updateTemplateAttrs, getNgModelAttr, FormWidgetType, getFormWidgetTemplate, isMobileApp, DataType, isDateTimeType, getRowActionAttrs } from '@wm/core';
import { getAttrMarkup, register, getBoundToExpr, getFormMarkupAttr, getDataSource } from '@wm/transpiler';
export * from '@wm/transpiler';

const tagName = 'div';
register('wm-accordion', () => {
    return {
        pre: attrs => `<${tagName} wmAccordion role="tablist" aria-multiselectable="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

const tagName$1 = 'div';
register('wm-accordionpane', () => {
    return {
        pre: attrs => `<${tagName$1} wmAccordionPane partialContainer wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1}>`
    };
});

const tagName$2 = 'div';
register('wm-tabs', () => {
    return {
        pre: attrs => `<${tagName$2} wmTabs ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$2}>`
    };
});

const tagName$3 = 'div';
register('wm-tabpane', () => {
    return {
        pre: attrs => `<${tagName$3} wmTabPane  partialContainer ${getAttrMarkup(attrs)} wm-navigable-element="true" role="tabpanel">`,
        post: () => `</${tagName$3}>`
    };
});

const tagName$4 = 'a';
register('wm-anchor', () => {
    return {
        pre: attrs => `<${tagName$4} wmAnchor role="link" data-identifier="anchor" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$4}>`
    };
});

const tagName$5 = 'div';
register('wm-audio', () => {
    return {
        pre: attrs => `<${tagName$5} wmAudio ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$5}>`
    };
});

const tagName$6 = 'ol';
register('wm-breadcrumb', () => {
    return {
        pre: attrs => `<${tagName$6} wmBreadcrumb ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$6}>`
    };
});

const tagName$7 = 'div';
register('wm-buttongroup', () => {
    return {
        pre: attrs => `<${tagName$7} wmButtonGroup role="group" aria-labelledby="button group" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$7}>`
    };
});

const tagName$8 = 'button';
register('wm-button', () => {
    return {
        pre: attrs => `<${tagName$8} wmButton ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$8}>`
    };
});

const tagName$9 = 'div';
register('wm-calendar', () => {
    return {
        pre: attrs => `<${tagName$9} wmCalendar redrawable style="width:100%" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$9}>`
    };
});

const tagName$a = 'div';
register('wm-card', () => {
    return {
        pre: attrs => `<${tagName$a} wmCard ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$a}>`
    };
});

const tagName$b = 'div';
register('wm-card-content', () => {
    return {
        pre: attrs => `<${tagName$b} wmCardContent partialContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$b}>`
    };
});

const tagName$c = 'div';
register('wm-card-actions', () => {
    return {
        pre: attrs => `<${tagName$c} wmCardActions ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$c}>`
    };
});

const tagName$d = 'div';
register('wm-card-footer', () => {
    return {
        pre: attrs => `<${tagName$d} wmCardFooter ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$d}>`
    };
});

const carouselTagName = 'carousel';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_carousel_ref_');
const isDynamicCarousel = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');
const ɵ0 = isDynamicCarousel;
register('wm-carousel', () => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the carousel
            const counter = idGen.nextUid();
            shared.set('carousel_ref', counter);
            return `<div class="app-carousel carousel"><${carouselTagName} wmCarousel #${counter}="wmCarousel"  ${getAttrMarkup(attrs)} interval="0" [ngClass]="${counter}.navigationClass">`;
        },
        post: () => `</${carouselTagName}></div>`,
        template: (node) => {
            // check if the carousel is dynamic
            if (isDynamicCarousel(node)) {
                const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
                const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');
                if (!datasetAttr) {
                    return;
                }
                const boundExpr = getBoundToExpr(datasetAttr.value);
                if (!boundExpr) {
                    return;
                }
                updateTemplateAttrs(node, boundExpr, widgetNameAttr.value);
            }
        },
        // To provide parent carousel reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('carousel_ref', shared.get('carousel_ref'));
            return provider;
        }
    };
});

const carouselContentTagName = 'slide';
// For static carousel
register('wm-carousel-content', () => {
    return {
        pre: attrs => `<${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)}>`,
        post: () => `</${carouselContentTagName}>`
    };
});
// For dynamic carousel
register('wm-carousel-template', () => {
    return {
        requires: ['wm-carousel'],
        pre: (attrs, shared, parentCarousel) => {
            const carouselRef = parentCarousel.get('carousel_ref');
            return `<div *ngIf="!${carouselRef}.fieldDefs">{{${carouselRef}.nodatamessage}}</div>
                    <${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)} *ngFor="let item of ${carouselRef}.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="tempRef" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                    </${carouselContentTagName}>
                    <ng-template #tempRef let-item="item" let-index="index">`;
        },
        post: () => `</ng-template>`
    };
});

const tagName$e = 'div';
register('wm-chart', () => {
    return {
        pre: attrs => `<${tagName$e} wmChart redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$e}>`
    };
});

const tagName$f = 'div';
register('wm-checkbox', () => {
    return {
        pre: attrs => `<${tagName$f} wmCheckbox role="input" ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$f}>`
    };
});

const tagName$g = 'ul';
register('wm-checkboxset', () => {
    return {
        pre: attrs => `<${tagName$g} wmCheckboxset ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$g}>`
    };
});

const tagName$h = 'ul';
register('wm-chips', () => {
    return {
        pre: attrs => `<${tagName$h} wmChips role="listbox" ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$h}>`
    };
});

const tagName$i = 'div';
register('wm-colorpicker', () => {
    return {
        pre: attrs => `<${tagName$i} wmColorPicker ${getAttrMarkup(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$i}>`
    };
});

const tagName$j = 'div';
register('wm-composite', () => {
    return {
        pre: attrs => `<${tagName$j} wmComposite role="group" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$j}>`
    };
});

const tagName$k = 'div';
register('wm-container', () => {
    return {
        pre: attrs => `<${tagName$k} wmContainer partialContainer wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$k}>`
    };
});

const tagName$l = 'main';
register('wm-content', () => {
    return {
        pre: attrs => `<${tagName$l} wmContent data-role="page-content" role="main" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$l}>`
    };
});

const tagName$m = 'div';
register('wm-currency', () => {
    return {
        pre: attrs => `<${tagName$m} wmCurrency ${getAttrMarkup(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$m}>`
    };
});

const tagName$n = 'div';
register('wm-datetime', () => {
    return {
        pre: attrs => `<${tagName$n} wmDateTime ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$n}>`
    };
});

const tagName$o = 'div';
register('wm-date', () => {
    return {
        pre: attrs => `<${tagName$o} wmDate ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$o}>`
    };
});

const tagName$p = 'div';
register('wm-alertdialog', () => {
    return {
        pre: attrs => `<${tagName$p} wmAlertDialog role="alertdialog" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$p}>`
    };
});

const tagName$q = 'div';
register('wm-confirmdialog', () => {
    return {
        pre: attrs => `<${tagName$q} wmConfirmDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$q}>`
    };
});

const tagName$r = 'div';
register('wm-dialogactions', () => {
    return {
        pre: attrs => `<ng-template #dialogFooter><${tagName$r} wmDialogFooter data-identfier="actions" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$r}></ng-template>`
    };
});

const tagName$s = 'div';
register('wm-dialog', () => {
    return {
        pre: attrs => `<${tagName$s} wmDialog ${getAttrMarkup(attrs)} wm-navigable-element="true"><ng-template #dialogBody>`,
        post: () => `</ng-template></${tagName$s}>`
    };
});
// Todo:vinay remove wm-view in migration
register('wm-view', () => {
    return {
        pre: attrs => '',
        post: () => ''
    };
});

const tagName$t = 'div';
register('wm-iframedialog', () => {
    return {
        pre: attrs => `<${tagName$t} wmIframeDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$t}>`
    };
});

const tagName$u = 'div';
register('wm-logindialog', () => {
    return {
        pre: attrs => `<${tagName$u} wmDialog wmLoginDialog ${getAttrMarkup(attrs)} eventsource.bind="Actions.loginAction" wm-navigable-element="true"><ng-template #dialogBody>`,
        post: () => `</ng-template></${tagName$u}>`
    };
});

const tagName$v = 'div';
register('wm-pagedialog', () => {
    return {
        pre: (attrs, shared) => {
            const content = attrs.get('content');
            attrs.delete('content');
            const boundContent = attrs.get('content.bind');
            attrs.delete('content.bind');
            const onLoad = attrs.get('load.event');
            attrs.delete('load.event');
            let onLoadEvtMarkup = '';
            let contentMarkup = '';
            if (onLoad) {
                onLoadEvtMarkup = `load.event="${onLoad}"`;
            }
            if (boundContent) {
                contentMarkup = `content.bind="${boundContent}"`;
            }
            else if (content) {
                contentMarkup = `content="${content}"`;
            }
            let containerMarkup = '';
            if (contentMarkup) {
                shared.set('hasPartialContent', true);
                containerMarkup += `<ng-template><div wmContainer partialContainer ${contentMarkup} width="100%" height="100%" ${onLoadEvtMarkup}>`;
            }
            return `<${tagName$v} wmPartialDialog ${getAttrMarkup(attrs)}>${containerMarkup}`;
        },
        post: (attrs, shared) => {
            let preContent = '';
            if (shared.get('hasPartialContent')) {
                preContent = `</div></ng-template>`;
            }
            return `${preContent}</${tagName$v}>`;
        }
    };
});

const tagName$w = 'footer';
register('wm-footer', () => {
    return {
        pre: attrs => `<${tagName$w} wmFooter partialContainer data-role="page-footer" role="contentinfo" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$w}>`
    };
});

const Context = new InjectionToken('Context Provider Reference');

const DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);
const isDataSetWidget = widget => {
    return DATASET_WIDGETS.has(widget);
};

var Live_Operations;
(function (Live_Operations) {
    Live_Operations["INSERT"] = "insert";
    Live_Operations["UPDATE"] = "update";
    Live_Operations["DELETE"] = "delete";
    Live_Operations["READ"] = "read";
})(Live_Operations || (Live_Operations = {}));
const ALLFIELDS = 'All Fields';

const tagName$x = 'div';
const idGen$1 = new IDGenerator('formfield_');
const getEventsTemplate = (attrs) => {
    const eventAttrs = new Map();
    if (!attrs.has('focus.event')) {
        attrs.set('focus.event', '');
    }
    if (!attrs.has('blur.event')) {
        attrs.set('blur.event', '');
    }
    attrs.forEach((value, key) => {
        if (key.endsWith('.event')) {
            if (key === 'focus.event') {
                value = `_onFocusField($event);${value}`;
            }
            else if (key === 'blur.event') {
                value = `_onBlurField($event);${value}`;
            }
            eventAttrs.set(key, value);
            attrs.delete(key);
        }
    });
    return getFormMarkupAttr(eventAttrs);
};
const DEFAULT_PLACEHOLDERS = new Map([
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
const setDefaultPlaceholder = (attrs, widgetType, index) => {
    const prop = index === 1 ? 'maxplaceholder' : 'placeholder';
    let placeholder = attrs.get(prop);
    if (placeholder || placeholder === '') {
        return;
    }
    placeholder = DEFAULT_PLACEHOLDERS.get(widgetType) && DEFAULT_PLACEHOLDERS.get(widgetType)[index];
    if (placeholder) {
        attrs.set(prop, placeholder);
    }
};
const ɵ1$1 = setDefaultPlaceholder;
const getWidgetTemplate = (attrs, options) => {
    const name = attrs.get('name');
    const fieldName = (attrs.get('key') || name || '').trim();
    const formControl = options.isMaxWidget ? `formControlName="${fieldName}_max"` : (options.isInList ? `[formControlName]="${options.counter}._fieldName"` : `formControlName="${fieldName}"`);
    const tmplRef = options.isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const widgetName = name ? (options.isMaxWidget ? `name="${name}_formWidgetMax"` : `name="${name}_formWidget"`) : '';
    const defaultTmpl = `[class.hidden]="!${options.pCounter}.isUpdateMode && ${options.counter}.viewmodewidget !== 'default'" ${formControl} ${options.eventsTmpl} ${tmplRef} ${widgetName}`;
    return getFormWidgetTemplate(options.widgetType, defaultTmpl, attrs, { counter: options.counter, pCounter: options.pCounter });
};
const ɵ2$1 = getWidgetTemplate;
const getTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter, isInList) => {
    const isRange = attrs.get('is-range') === 'true';
    if (!isRange) {
        return getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter, isInList });
    }
    const layoutClass = isMobileApp() ? 'col-xs-6' : 'col-sm-6';
    return `<div class="${layoutClass}">${getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter })}</div>
                <div class="${layoutClass}">${getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter, isMaxWidget: true })}</div>`;
};
const ɵ3$1 = getTemplate;
const getCaptionByWidget = (attrs, widgetType, counter) => {
    if (attrs.get('is-related') === 'true') {
        return `${counter}.getDisplayExpr()`;
    }
    if (widgetType === FormWidgetType.PASSWORD) {
        return '\'********\'';
    }
    let caption = `${counter}.value`;
    if (widgetType === FormWidgetType.DATETIME || widgetType === FormWidgetType.TIMESTAMP) {
        caption += ` | toDate:${counter}.formWidget.datepattern || 'yyyy-MM-dd hh:mm:ss a'`;
        return caption;
    }
    if (widgetType === FormWidgetType.TIME) {
        caption += ` | toDate:${counter}.formWidget.timepattern || 'hh:mm a'`;
        return caption;
    }
    if (widgetType === FormWidgetType.DATE) {
        caption += ` | toDate:${counter}.formWidget.datepattern ||  'yyyy-MMM-dd'`;
        return caption;
    }
    if (widgetType === FormWidgetType.RATING || widgetType === FormWidgetType.UPLOAD) {
        return '';
    }
    if (isDataSetWidget(widgetType) && attrs.get('datafield') === ALLFIELDS) {
        return `${counter}.getDisplayExpr()`;
    }
    return `${counter}.getCaption()`;
};
const ɵ4 = getCaptionByWidget;
const registerFormField = (isFormField) => {
    return {
        requires: ['wm-form', 'wm-liveform', 'wm-livefilter', 'wm-list'],
        pre: (attrs, shared, parentForm, parentLiveForm, parentFilter, parentList) => {
            const counter = idGen$1.nextUid();
            const parent = parentForm || parentLiveForm || parentFilter;
            const pCounter = (parent && parent.get('form_reference')) || 'form';
            const widgetType = attrs.get('widget') || FormWidgetType.TEXT;
            const dataRole = isFormField ? 'form-field' : 'filter-field';
            const validationMsg = isFormField ? `<p *ngIf="${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode"
                                   class="help-block text-danger"
                                   [textContent]="${counter}.validationmessage"></p>` : '';
            const eventsTmpl = widgetType === FormWidgetType.UPLOAD ? '' : getEventsTemplate(attrs);
            const controlLayout = isMobileApp() ? 'col-xs-12' : 'col-sm-12';
            const isInList = pCounter === (parentList && parentList.get('parent_form_reference'));
            attrs.delete('widget');
            shared.set('counter', counter);
            if (attrs.get('is-range') === 'true') {
                setDefaultPlaceholder(attrs, widgetType, 0);
                setDefaultPlaceholder(attrs, widgetType, 1);
            }
            else {
                setDefaultPlaceholder(attrs, widgetType, 2);
            }
            return `<${tagName$x} data-role="${dataRole}" [formGroup]="${pCounter}.ngform" wmFormField #${counter}="wmFormField" widgettype="${widgetType}" ${getFormMarkupAttr(attrs)}>
                        <div class="live-field form-group app-composite-widget clearfix caption-{{${pCounter}.captionposition}}" widget="${widgetType}">
                            <label [hidden]="!${counter}.displayname" class="app-label control-label formfield-label {{${pCounter}._captionClass}}" [title]="${counter}.displayname"
                                        [ngStyle]="{width: ${pCounter}.captionsize}" [ngClass]="{'text-danger': ${counter}._control?.invalid && ${counter}._control?.touched && ${pCounter}.isUpdateMode,
                                         required: ${pCounter}.isUpdateMode && ${counter}.required}" [textContent]="${counter}.displayname"> </label>
                            <div [ngClass]="${counter}.displayname ? ${pCounter}._widgetClass : '${controlLayout}'">
                                 <label class="form-control-static app-label"
                                       [hidden]="${pCounter}.isUpdateMode || ${counter}.viewmodewidget === 'default' || ${counter}.widgettype === 'upload'" [innerHTML]="${getCaptionByWidget(attrs, widgetType, counter)}"></label>
                                ${getTemplate(attrs, widgetType, eventsTmpl, counter, pCounter, isInList)}
                                <p *ngIf="!(${counter}._control?.invalid && ${counter}._control?.touched) && ${pCounter}.isUpdateMode"
                                   class="help-block" [textContent]="${counter}.hint"></p>
                                ${validationMsg}
                            </div>
                        </div>`;
        },
        post: () => `</${tagName$x}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
const ɵ5 = registerFormField;
register('wm-form-field', registerFormField.bind(this, true));
register('wm-filter-field', registerFormField.bind(this, false));

const tagName$y = 'div';
const registerAction = (tmpl) => {
    return {
        pre: attrs => `<${tagName$y} wmFormAction name="${attrs.get('name') || attrs.get('key')}" ${getAttrMarkup(attrs)} ${tmpl}>`,
        post: () => `</${tagName$y}>`
    };
};
register('wm-form-action', registerAction.bind(this, ''));
register('wm-filter-action', registerAction.bind(this, ` update-mode="true" `));

const tagName$z = 'form';
const idGen$2 = new IDGenerator('form_');
const formWidgets = new Set([
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
const addFormControlName = (children = []) => {
    children.forEach(childNode => {
        if (formWidgets.has(childNode.name)) {
            let key = childNode.attrs.find((attr) => attr.name === 'key' || attr.name === 'name');
            key = key && key.value;
            childNode.attrs.push(new Attribute('formControlName', key, 1, 1));
            childNode.attrs.push(new Attribute('wmFormWidget', '', 1, 1));
        }
        addFormControlName(childNode.children);
    });
};
const updateFormDataSource = (attrMap) => {
    if (attrMap.get('formdata.bind')) {
        const formDataSource = getDataSource(attrMap.get('formdata.bind'));
        if (formDataSource) {
            attrMap.set('formdatasource.bind', formDataSource);
        }
    }
};
const buildTask = (directiveAttr = '') => {
    return {
        requires: ['wm-livetable', 'wm-login'],
        template: (node) => {
            addFormControlName(node.children);
        },
        pre: (attrs, shared, parentLiveTable, parentLoginWidget) => {
            let tmpl;
            let dialogId;
            const role = parentLoginWidget && parentLoginWidget.get('isLogin') ? 'app-login' : '';
            const counter = idGen$2.nextUid();
            const dependsOn = attrs.get('dependson') ? `dependson="${attrs.get('dependson')}"` : '';
            const classProp = attrs.get('formlayout') === 'page' ? 'app-device-liveform panel liveform-inline' : '';
            const dialogAttributes = ['title', 'title.bind', 'iconclass', 'iconclass.bind', 'width'];
            attrs.delete('dependson');
            const liveFormTmpl = `<${tagName$z} wmForm role="${role}" ${directiveAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngform" [noValidate]="${counter}.validationtype !== 'html'"
                    class="${classProp}" [class]="${counter}.captionAlignClass" [autocomplete]="${counter}.autocomplete ? 'on' : 'off'" captionposition=${attrs.get('captionposition')}`;
            shared.set('counter', counter);
            updateFormDataSource(attrs);
            if (attrs.get('formlayout') === 'dialog') {
                dialogId = parentLiveTable ? parentLiveTable.get('liveform_dialog_id') : `liveform_dialog_id_${counter}`;
                attrs.set('dialogId', dialogId);
                const dialogAttrsMap = new Map();
                dialogAttributes.forEach((attr) => {
                    if (attrs.get(attr)) {
                        dialogAttrsMap.set(attr, attrs.get(attr));
                    }
                });
                attrs.set('width', '100%');
                tmpl = getAttrMarkup(attrs);
                return `<div data-identifier="liveform" init-widget class="app-liveform liveform-dialog" ${dependsOn} dialogid="${dialogId}">
                            <div wmDialog class="app-liveform-dialog" name="${dialogId}" role="form" ${getAttrMarkup(dialogAttrsMap)} modal="true">
                            <ng-template #dialogBody>
                            ${liveFormTmpl} ${tmpl}>`;
            }
            let mobileFormContentTmpl = '';
            let buttonTemplate = '';
            // Include mobile-navbar above the form when formlayout is set to page
            if (attrs.get('formlayout') === 'page') {
                const name = `device_liveform_header_${counter}`;
                const navbarAttrsMap = new Map();
                navbarAttrsMap.set('title', attrs.get('title'));
                navbarAttrsMap.set('backbtnclick.event', attrs.get('backbtnclick.event'));
                buttonTemplate = `<ng-template #buttonRef let-btn="btn">
                                            <button  wmButton name="{{btn.key}}" class="navbar-btn btn-primary btn-transparent" iconclass.bind="btn.iconclass" show.bind="btn.show"
                                                     (click)="${counter}.invokeActionEvent($event, btn.action)" type.bind="btn.type" hint.bind="btn.title" shortcutkey.bind="btn.shortcutkey" disabled.bind="btn.disabled"
                                                     tabindex.bind="btn.tabindex" [class.hidden]="btn.updateMode ? !${counter}.isUpdateMode : ${counter}.isUpdateMode"></button>
                                        </ng-template>`;
                mobileFormContentTmpl = `<header wmMobileNavbar name="${name}" ${getAttrMarkup(navbarAttrsMap)}>
                                            <ng-container *ngFor="let btn of ${counter}.buttonArray" [ngTemplateOutlet]="buttonRef" [ngTemplateOutletContext]="{btn:btn}">
                                            </ng-container>
                                        </header>
                                        <div class="form-elements panel-body" >`;
            }
            tmpl = getAttrMarkup(attrs);
            return `${liveFormTmpl} ${tmpl} ${dependsOn}>
                       ${buttonTemplate} ${mobileFormContentTmpl}`;
        },
        post: (attrs) => {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            if (attrs.get('formlayout') === 'page') {
                return `</div></${tagName$z}>`;
            }
            return `</${tagName$z}>`;
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
register('wm-form', buildTask);
register('wm-liveform', () => buildTask('wmLiveForm'));
register('wm-livefilter', () => buildTask('wmLiveFilter'));

const tagName$A = 'header';
register('wm-header', () => {
    return {
        pre: attrs => `<${tagName$A} wmHeader partialContainer data-role="page-header" role="banner" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$A}>`
    };
});

const tagName$B = 'div';
register('wm-html', () => {
    return {
        pre: attrs => `<${tagName$B} wmHtml ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$B}>`
    };
});

const tagName$C = 'span';
register('wm-icon', () => {
    return {
        pre: attrs => `<${tagName$C} wmIcon aria-hidden="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$C}>`
    };
});

const tagName$D = 'div';
register('wm-iframe', () => {
    return {
        pre: attrs => `<${tagName$D} wmIframe ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$D}>`
    };
});

const tagName$E = 'label';
register('wm-label', () => {
    return {
        pre: attrs => `<${tagName$E} wmLabel ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$E}>`
    };
});

const wmListTag = 'wm-list';
const listTagName = 'div';
const dataSetKey$1 = 'dataset';
register(wmListTag, () => {
    return {
        requires: ['wm-form', 'wm-liveform'],
        template: (node) => {
            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey$1);
            const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');
            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, 'itemRef.');
        },
        pre: (attrs, shared, parentForm, parentLiveForm) => {
            const parent = parentForm || parentLiveForm;
            shared.set('form_reference', parent && parent.get('form_reference'));
            return `<${listTagName} wmList wmLiveActions ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${listTagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('parent_form_reference', shared.get('form_reference'));
            return provider;
        }
    };
});
register('wm-listtemplate', () => {
    return {
        pre: () => `<ng-template #listTemplate let-item="item" let-$index="$index" let-itemRef="itemRef" let-$first="$first" let-$last="$last"  let-currentItemWidgets="currentItemWidgets" >`,
        post: () => `</ng-template>`
    };
});
function copyAttribute(from, fromAttrName, to, toAttrName) {
    const fromAttr = from.attrs.find(a => a.name === fromAttrName);
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-list-action-template', () => {
    return {
        template: (node) => {
            const position = node.attrs.find(attr => attr.name === 'position').value;
            const btns = node.children
                .filter(e => e instanceof Element && e.name === 'wm-button');
            // add swipe-position on button nodes to identify whether buttons are from left or right action templates
            btns.forEach((btnNode) => {
                copyAttribute(node, 'position', btnNode, 'swipe-position');
            });
        },
        pre: (attrs, el) => {
            if (attrs.get('position') === 'left') {
                return `<ng-template #listLeftActionTemplate>
                            <li class="app-list-item-action-panel app-list-item-left-action-panel actionMenu" ${getAttrMarkup(attrs)}>`;
            }
            if (attrs.get('position') === 'right') {
                return `<ng-template #listRightActionTemplate>
                            <li class="app-list-item-action-panel app-list-item-right-action-panel actionMenu" ${getAttrMarkup(attrs)}>`;
            }
        },
        post: () => `</li></ng-template>`
    };
});

const tagName$F = 'div';
register('wm-gridcolumn', () => {
    return {
        pre: attrs => `<${tagName$F} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$F}>`
    };
});

const tagName$G = 'div';
register('wm-gridrow', () => {
    return {
        pre: attrs => `<${tagName$G} wmLayoutGridRow ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$G}>`
    };
});

const tagName$H = 'div';
register('wm-layoutgrid', () => {
    return {
        pre: attrs => `<${tagName$H} wmLayoutGrid ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$H}>`
    };
});

const tagName$I = 'aside';
register('wm-left-panel', () => {
    return {
        pre: attrs => `<${tagName$I} wmLeftPanel partialContainer data-role="page-left-panel" role="complementary" wmSmoothscroll="${attrs.get('smoothscroll') || 'true'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$I}>`
    };
});

const tagName$J = 'div';
const idGen$3 = new IDGenerator('liveform_dialog_id_');
register('wm-livetable', () => {
    return {
        pre: (attrs, shared) => {
            const counter = idGen$3.nextUid();
            shared.set('counter', counter);
            return `<${tagName$J} wmLiveTable role="table" ${getAttrMarkup(attrs)} dialogid="${counter}">`;
        },
        post: () => `</${tagName$J}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('liveform_dialog_id', shared.get('counter'));
            return provider;
        }
    };
});

const tagName$K = 'div';
register('wm-login', () => {
    return {
        pre: attrs => `<${tagName$K} wmLogin ${getAttrMarkup(attrs)} eventsource.bind="Actions.loginAction">`,
        post: () => `</${tagName$K}>`,
        provide: () => {
            const provider = new Map();
            provider.set('isLogin', true);
            return provider;
        }
    };
});

const tagName$L = 'marquee';
register('wm-marquee', () => {
    return {
        pre: attrs => `<${tagName$L} onmouseover="this.stop();" onmouseout="this.start();" wmMarquee role="marquee" aria-live="off" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$L}>`
    };
});

const tagName$M = 'p';
register('wm-message', () => {
    return {
        pre: attrs => `<${tagName$M} wmMessage aria-label="Notification Alerts" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$M}>`
    };
});

const tagName$N = 'div';
register('wm-menu', () => {
    return {
        pre: attrs => `<${tagName$N} wmMenu dropdown ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$N}>`
    };
});

const tagName$O = 'li';
register('wm-nav-item', () => {
    return {
        pre: attrs => `<${tagName$O} wmNavItem role="presentation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$O}>`
    };
});

const tagName$P = 'ul';
register('wm-nav', () => {
    return {
        pre: attrs => `<${tagName$P} wmNav data-element-type="wmNav" data-role="page-header" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$P}>`
    };
});

const tagName$Q = 'nav';
register('wm-navbar', () => {
    return {
        pre: attrs => `<${tagName$Q} wmNavbar data-element-type="wmNavbar" role="navigation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$Q}>`
    };
});

const tagName$R = 'div';
register('wm-number', () => {
    return {
        pre: attrs => `<${tagName$R} wmNumber ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$R}>`
    };
});

const tagName$S = 'div';
register('wm-page-content', () => {
    return {
        pre: attrs => `<${tagName$S} wmPageContent wmSmoothscroll="${attrs.get('smoothscroll') || 'true'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$S}>`
    };
});

const tagName$T = 'div';
const findChild = (node, childName) => {
    const child = node && node.children.find(e => (e instanceof Element && e.name === childName));
    return child;
};
const createElement = name => {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};
const addAtrribute = (node, name, value) => {
    const attr = new Attribute(name, value, noSpan, noSpan);
    node.attrs.push(attr);
};
const noSpan = {};
register('wm-page', () => {
    return {
        template: (node) => {
            if (isMobileApp()) {
                const pageContentNode = findChild(findChild(node, 'wm-content'), 'wm-page-content');
                if (pageContentNode) {
                    const conditionalNode = createElement('ng-container');
                    addAtrribute(conditionalNode, '*ngIf', 'compilePageContent');
                    const loader = createElement('div');
                    addAtrribute(loader, 'wmPageContentLoader', '');
                    addAtrribute(loader, '*ngIf', '!showPageContent');
                    conditionalNode.children = conditionalNode.children.concat(pageContentNode.children);
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null));
                    pageContentNode.children = [conditionalNode, loader];
                }
            }
        },
        pre: attrs => `<${tagName$T} wmPage data-role="pageContainer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$T}>`
    };
});

const tagName$U = 'nav';
register('wm-pagination', () => {
    return {
        pre: attrs => `<${tagName$U} wmPagination data-identifier="pagination" aria-label="Page navigation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$U}>`
    };
});

const tagName$V = 'div';
register('wm-panel', () => {
    return {
        pre: attrs => `<${tagName$V} wmPanel partialContainer aria-label="panel" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$V}>`
    };
});
register('wm-panel-footer', () => {
    return {
        pre: attrs => `<${tagName$V} wmPanelFooter aria-label="panel footer" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$V}>`
    };
});

const tagName$W = 'section';
register('wm-partial', () => {
    return {
        pre: attrs => `<${tagName$W} wmPartial data-role="partial" role="region" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$W}>`
    };
});

const tagName$X = 'div';
register('wm-param', () => {
    return {
        pre: attrs => `<${tagName$X} wmParam hidden ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$X}>`
    };
});

const tagName$Y = 'img';
register('wm-picture', () => {
    return {
        pre: attrs => `<${tagName$Y} wmPicture alt="image" wmImageCache="${attrs.get('offline') || 'true'}" ${getAttrMarkup(attrs)}>`
    };
});

const tagName$Z = 'wm-popover';
register('wm-popover', () => {
    return {
        requires: ['wm-table'],
        pre: (attrs, shared, table) => {
            const contentSource = attrs.get('contentsource');
            let popoverTemplate;
            if (contentSource !== 'inline') {
                const content = attrs.get('content');
                const bindContent = attrs.get('content.bind');
                let contentMarkup = '';
                if (content) {
                    contentMarkup = `content="${content}"`;
                }
                else if (bindContent) {
                    contentMarkup = `content.bind="${bindContent}"`;
                }
                popoverTemplate = `<div wmContainer #partial partialContainer ${contentMarkup}>`;
                shared.set('hasPopoverContent', true);
            }
            let markup = `<${tagName$Z} wmPopover ${getAttrMarkup(attrs)}>`;
            const contextAttrs = table ? `let-row="row"` : ``;
            markup += `<ng-template ${contextAttrs}><button class="popover-start"></button>`;
            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += `${popoverTemplate ? popoverTemplate : ''}`;
            }
            return markup;
        },
        post: (attrs, shared) => {
            let markup = '';
            if (shared.get('hasPopoverContent')) {
                markup += `</div>`;
            }
            return `${markup}<button class="popover-end"></button></ng-template></${tagName$Z}>`;
        }
    };
});

const tagName$_ = 'section';
register('wm-prefab', () => {
    return {
        pre: attrs => `<${tagName$_} wmPrefab data-role="perfab" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$_}>`
    };
});

const tagName$10 = 'div';
register('wm-prefab-container', () => {
    return {
        pre: attrs => `<${tagName$10} wmPrefabContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$10}>`
    };
});

const tagName$11 = 'div';
const getAttr = (node, attrName) => node.attrs.find(attr => attr.name === attrName);
const getAttrValue = (node, attrName) => {
    const match = getAttr(node, attrName);
    if (match) {
        return match.value;
    }
};
const getReplaceRegex = (v) => new RegExp(`bind:(${v}|${v}\\[\\$i])\\.`, 'g');
register('wm-progress-bar', () => {
    return {
        template: (node) => {
            const dataset = getAttrValue(node, 'dataset');
            const boundExpr = getBoundToExpr(dataset);
            if (boundExpr) {
                let type = getAttrValue(node, 'type');
                let datavalue = getAttrValue(node, 'datavalue');
                const replaceRegex = getReplaceRegex(boundExpr);
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
        pre: attrs => `<${tagName$11} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$11}>`
    };
});

const tagName$12 = 'div';
register('wm-progress-circle', () => {
    return {
        pre: attrs => `<${tagName$12} wmProgressCircle ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$12}>`
    };
});

const tagName$13 = 'ul';
register('wm-radioset', () => {
    return {
        pre: attrs => `<${tagName$13} wmRadioset role="radiogroup" ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$13}>`
    };
});

const tagName$14 = 'div';
register('wm-rating', () => {
    return {
        pre: attrs => `<${tagName$14} wmRating ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$14}>`
    };
});

const tagName$15 = 'div';
register('wm-richtexteditor', () => {
    return {
        pre: attrs => `<${tagName$15} wmRichTextEditor role="textbox" ${getFormMarkupAttr(attrs)}>`,
        post: () => `</${tagName$15}>`
    };
});

const tagName$16 = 'aside';
register('wm-right-panel', () => {
    return {
        pre: attrs => `<${tagName$16} wmRightPanel partialContainer data-role="page-right-panel" role="complementary" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$16}>`
    };
});

const tagName$17 = 'div';
register('wm-search', () => {
    return {
        pre: attrs => `<${tagName$17} wmSearch ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$17}>`
    };
});

const tagName$18 = 'wm-select';
register('wm-select', () => {
    return {
        pre: attrs => `<${tagName$18} ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$18}>`
    };
});

const tagName$19 = 'div';
register('wm-slider', () => {
    return {
        pre: attrs => `<${tagName$19} wmSlider ${getAttrMarkup(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$19}>`
    };
});

const tagName$1a = 'div';
register('wm-spinner', () => {
    return {
        pre: attrs => `<${tagName$1a} wmSpinner role="loading" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1a}>`
    };
});

const tagName$1b = 'div';
register('wm-switch', () => {
    return {
        pre: attrs => `<${tagName$1b} wmSwitch ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$1b}>`
    };
});

const tagName$1c = 'div';
register('wm-table-action', () => {
    return {
        pre: attrs => `<${tagName$1c} name="${attrs.get('name') || attrs.get('key')}" wmTableAction ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1c}>`
    };
});

const tagName$1d = 'div';
register('wm-table-column-group', () => {
    return {
        pre: attrs => `<${tagName$1d} wmTableColumnGroup ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1d}>`
    };
});

const EDIT_MODE = {
    QUICK_EDIT: 'quickedit',
    INLINE: 'inline',
    FORM: 'form',
    DIALOG: 'dialog'
};
const fieldTypeWidgetTypeMap = {
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
const getDataTableFilterWidget = type => {
    let widget = fieldTypeWidgetTypeMap[type] && fieldTypeWidgetTypeMap[type][0];
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
const getEditModeWidget = colDef => {
    if (colDef['related-entity-name'] && colDef['primary-key']) {
        return FormWidgetType.SELECT;
    }
    return (fieldTypeWidgetTypeMap[colDef.type] && fieldTypeWidgetTypeMap[colDef.type][0]) || FormWidgetType.TEXT;
};

const tagName$1e = 'div';
const idGen$4 = new IDGenerator('data_table_form_');
const formWidgets$1 = new Set([
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
const addNgModelStandalone = (children = []) => {
    children.forEach(childNode => {
        if (formWidgets$1.has(childNode.name)) {
            childNode.attrs.push(new Attribute('[ngModelOptions]', '{standalone: true}', 1, 1));
        }
        addNgModelStandalone(childNode.children);
    });
};
// get the filter template (widget and filter menu) to be displayed in filter row
const getFilterTemplate = (attrs, pCounter) => {
    const widget = attrs.get('filterwidget') || getDataTableFilterWidget(attrs.get('type') || DataType.STRING);
    const fieldName = attrs.get('binding');
    const type = attrs.get('type') || 'string';
    let datasourceBinding, submitEventBinding;
    const datasetAttr = attrs.get('filterdataset.bind');
    // when multicolumn is selected and filterwidget as autocomplete is assigned to dataset.
    if (attrs.get('filterwidget') === 'autocomplete') {
        if (datasetAttr) {
            const binddatasource = getDataSource(datasetAttr);
            datasourceBinding = `dataset.bind="${datasetAttr}" datasource.bind="${binddatasource}"`;
        }
        submitEventBinding = `submit.event="changeFn('${fieldName}')"`;
    }
    const innerTmpl = `#filterWidget formControlName="${fieldName + '_filter'}" ${datasourceBinding} ${submitEventBinding} change.event="changeFn('${fieldName}')"
                        disabled.bind="isDisabled('${fieldName}')"`;
    const options = { inputType: 'filterinputtype' };
    const widgetTmpl = `${getFormWidgetTemplate(widget, innerTmpl, attrs, options)}`;
    return `<ng-template #filterTmpl let-changeFn="changeFn" let-isDisabled="isDisabled">
    <div class="input-group ${widget}" data-col-identifier="${fieldName}">
        ${widgetTmpl}
        <span class="input-group-addon filter-clear-icon" *ngIf="${pCounter}.showClearIcon('${fieldName}')">
            <button class="btn-transparent btn app-button" aria-label="Clear button" type="button" (click)="${pCounter}.clearRowFilter('${fieldName}')">
                <i class="app-icon wi wi-clear" aria-hidden="true"></i>
            </button>
         </span>
        <span class="input-group-addon" dropdown container="body">
            <button class="btn-transparent btn app-button" type="button" dropdownToggle><i class="app-icon wi wi-filter-list"></i></button>
            <ul class="matchmode-dropdown dropdown-menu" *dropdownMenu>
                   <li *ngFor="let matchMode of ${pCounter}.matchModeTypesMap['${type}']"
                        [ngClass]="{active: matchMode === (${pCounter}.rowFilter['${fieldName}'].matchMode || ${pCounter}.matchModeTypesMap['${type}'][0])}">
                        <a href="javascript:void(0);" (click)="${pCounter}.onFilterConditionSelect('${fieldName}', matchMode)" [innerText]="${pCounter}.matchModeMsgs[matchMode]"></a>
                    </li>
             </ul>
        </span>
    </div></ng-template>`;
};
const getEventsTmpl = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        if (key.endsWith('.event')) {
            tmpl += `${key}="${val}" `;
        }
    });
    return tmpl;
};
// Generate inline edit properties template. Properties requiring row instance are generated here.
const getInlineEditRowPropsTmpl = attrs => {
    const propAttrs = new Map();
    const props = ['disabled', 'disabled.bind'];
    props.forEach(prop => {
        if (attrs.get(prop)) {
            propAttrs.set(prop, attrs.get(prop));
            attrs.delete(prop);
        }
    });
    return getAttrMarkup(propAttrs);
};
// get the inline widget template
const getInlineEditWidgetTmpl = (attrs, isNewRow, pCounter) => {
    const options = {};
    const fieldName = attrs.get('binding');
    const widget = attrs.get('edit-widget-type') || getEditModeWidget({
        'type': attrs.get('type'),
        'related-entity-name': attrs.get('related-entity-name'),
        'primary-key': attrs.get('primary-key')
    });
    let widgetRef = '';
    let formControl = '';
    let wmFormWidget = '';
    if (widget === FormWidgetType.UPLOAD) {
        options.uploadProps = {
            formName: idGen$4.nextUid(),
            name: fieldName
        };
        options.counter = pCounter;
    }
    else {
        widgetRef = isNewRow ? '#inlineWidgetNew' : '#inlineWidget';
        formControl = isNewRow ? `formControlName="${fieldName}_new"` : `formControlName="${fieldName}"`;
        wmFormWidget = 'wmFormWidget';
    }
    options.inputType = 'editinputtype';
    const tmplRef = isNewRow ? '#inlineWidgetTmplNew' : '#inlineWidgetTmpl';
    const eventsTmpl = widget === FormWidgetType.UPLOAD ? '' : getEventsTmpl(attrs);
    const rowPropsTl = getInlineEditRowPropsTmpl(attrs);
    const innerTmpl = `${widgetRef} ${wmFormWidget} key="${fieldName}" data-field-name="${fieldName}" ${formControl} ${eventsTmpl} ${rowPropsTl}`;
    const widgetTmpl = getFormWidgetTemplate(widget, innerTmpl, attrs, options);
    return `<ng-template ${tmplRef} let-row="row" let-getControl="getControl" let-getValidationMessage="getValidationMessage">
                <div data-col-identifier="${fieldName}" >
                     ${widgetTmpl}
                     <span placement="top" container="body" tooltip="{{getValidationMessage()}}" class="text-danger wi wi-error"
                        *ngIf="getValidationMessage() && getControl() && getControl().invalid && getControl().touched">
                     </span>
                     <span class="sr-only" *ngIf="getValidationMessage()">{{getValidationMessage()}}</span>
                 </div>
            </ng-template>`;
};
const getFormatExpression = (attrs) => {
    const columnValue = `row.getProperty('${attrs.get('binding')}')`;
    let formatPattern = attrs.get('formatpattern');
    let colExpression = '';
    // For date time data types, if format pattern is not applied, Apply default toDate format
    if (isDateTimeType(attrs.get('type')) && (!formatPattern || formatPattern === 'None')) {
        attrs.set('formatpattern', 'toDate');
        attrs.delete('datepattern');
        formatPattern = 'toDate';
    }
    switch (formatPattern) {
        case 'toDate':
            colExpression = `{{${columnValue} | toDate: colDef.datepattern}}`;
            break;
        case 'toCurrency':
            if (attrs.get('currencypattern')) {
                colExpression = `{{${columnValue} | toCurrency: '${attrs.get('currencypattern')}`;
                if (attrs.get('fractionsize')) {
                    colExpression += `': ${attrs.get('fractionsize')}}}`;
                }
                else {
                    colExpression += `'}}`;
                }
            }
            break;
        case 'numberToString':
            if (attrs.get('fractionsize')) {
                colExpression = `{{${columnValue} | numberToString: '${attrs.get('fractionsize')}'}}`;
            }
            break;
        case 'stringToNumber':
            colExpression = `{{${columnValue} | stringToNumber}}`;
            break;
        case 'timeFromNow':
            colExpression = `{{${columnValue} | timeFromNow}}`;
            break;
        case 'prefix':
            if (attrs.get('prefix')) {
                colExpression = `{{${columnValue} | prefix: '${attrs.get('prefix')}'}}`;
            }
            break;
        case 'suffix':
            if (attrs.get('suffix')) {
                colExpression = `{{${columnValue} | suffix: '${attrs.get('suffix')}'}}`;
            }
            break;
    }
    return colExpression;
};
register('wm-table-column', () => {
    return {
        requires: ['wm-table'],
        template: (node, shared) => {
            if (node.children.length) {
                // If node has children, but an empty text node dont generate custom expression
                if (node.children.length === 1 && node.children[0] instanceof Text && node.children[0].value.trim().length === 0) {
                    return;
                }
                shared.set('customExpression', true);
                addNgModelStandalone(node.children);
            }
        },
        pre: (attrs, shared, parentTable) => {
            let rowFilterTmpl = '';
            let inlineEditTmpl = '';
            let inlineNewEditTmpl = '';
            let parentForm = '';
            if (parentTable) {
                const pCounter = parentTable.get('table_reference');
                rowFilterTmpl = (parentTable.get('filtermode') === 'multicolumn' && attrs.get('searchable') !== 'false') ? getFilterTemplate(attrs, pCounter) : '';
                const editMode = parentTable.get('editmode');
                const isInlineEdit = (editMode !== EDIT_MODE.DIALOG && editMode !== EDIT_MODE.FORM && attrs.get('readonly') !== 'true');
                inlineEditTmpl = isInlineEdit ? getInlineEditWidgetTmpl(attrs, false, pCounter) : '';
                inlineNewEditTmpl = isInlineEdit && editMode === EDIT_MODE.QUICK_EDIT && parentTable.get('shownewrow') !== 'false' ? getInlineEditWidgetTmpl(attrs, true) : '';
                parentForm = ` [formGroup]="${pCounter}.ngform" `;
            }
            const formatPattern = attrs.get('formatpattern');
            const customExpr = `<ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow" let-addNewRow="addNewRow">`;
            let customExprTmpl = '';
            let formatExprTmpl = '';
            if (shared.get('customExpression')) {
                attrs.set('customExpression', 'true');
                customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}">`;
            }
            else if ((formatPattern && formatPattern !== 'None') || isDateTimeType(attrs.get('type'))) {
                formatExprTmpl = getFormatExpression(attrs);
                if (formatExprTmpl) {
                    shared.set('customExpression', true);
                    attrs.set('customExpression', 'true');
                    customExprTmpl = `${customExpr}<div data-col-identifier="${attrs.get('binding')}" title="${formatExprTmpl}">${formatExprTmpl}`;
                }
            }
            return `<${tagName$1e} wmTableColumn ${getAttrMarkup(attrs)} ${parentForm}>
                    ${rowFilterTmpl}
                    ${inlineEditTmpl}
                    ${inlineNewEditTmpl}
                    ${customExprTmpl}`;
        },
        post: (attrs, shared) => {
            let customExprTmpl = '';
            if (shared.get('customExpression')) {
                customExprTmpl = `</div></ng-template>`;
            }
            return `${customExprTmpl}</${tagName$1e}>`;
        }
    };
});

const tagName$1f = 'div';
const getRowExpansionActionTmpl = (attrs) => {
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowExpansionActionTmpl let-row="row">
               <${tag} ${directive}
                    ${getRowActionAttrs(attrs)}
                    class="${attrs.get('class')} row-expansion-button"
                    iconclass="${attrs.get('collapseicon')}"
                    type="button"></${tag}>
            </ng-template>`;
};
register('wm-table-row', () => {
    return {
        pre: (attrs) => {
            return `<${tagName$1f} wmTableRow ${getAttrMarkup(attrs)}>
                    ${getRowExpansionActionTmpl(attrs)}
                    <ng-template #rowExpansionTmpl let-row="row" let-rowDef="rowDef" let-containerLoad="containerLoad">
                        <div wmContainer partialContainer content.bind="rowDef.content" load.event="containerLoad(widget)"
                            [ngStyle]="{'height': rowDef.height, 'overflow-y': 'auto'}">
                         <div *ngFor="let param of rowDef.partialParams | keyvalue" wmParam hidden
                            [name]="param.key" [value]="param.value"></div>`;
        },
        post: () => `</div></ng-template></${tagName$1f}>`
    };
});

const tagName$1g = 'div';
const getSaveCancelTemplate = () => {
    return `<button type="button" aria-label="Save edit icon" class="save row-action-button btn app-button btn-transparent save-edit-row-button hidden" title="Save">
                <i class="wi wi-done" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Cancel edit icon" class="cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden" title="Cancel">
                <i class="wi wi-cancel" aria-hidden="true"></i>
            </button>`;
};
// get the inline widget template
const getRowActionTmpl = (attrs) => {
    const action = attrs.get('action');
    const actionTmpl = action ? ` click.event.delayed="${action}" ` : '';
    const saveCancelTmpl = action && action.includes('editRow(') ? getSaveCancelTemplate() : '';
    const btnClass = action ? (action.includes('editRow(') ? 'edit edit-row-button' :
        (action.includes('deleteRow(') ? 'delete delete-row-button' : '')) : '';
    const tabIndex = attrs.get('tabindex') ? `tabindex="${attrs.get('tabindex')}"` : '';
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowActionTmpl let-row="row">
               <${tag} ${directive} data-action-key="${attrs.get('key')}"
                    ${getRowActionAttrs(attrs)}
                    class="row-action row-action-button ${attrs.get('class')} ${btnClass}"
                    iconclass="${attrs.get('iconclass')}"
                    ${actionTmpl}
                    ${tabIndex}
                    type="button"></${tag}>
                ${saveCancelTmpl}
            </ng-template>`;
};
register('wm-table-row-action', () => {
    return {
        pre: attrs => `<${tagName$1g} wmTableRowAction ${getAttrMarkup(attrs)}>
                        ${getRowActionTmpl(attrs)}`,
        post: () => `</${tagName$1g}>`
    };
});

const tagName$1h = 'div';
const dataSetKey$2 = 'dataset';
const idGen$5 = new IDGenerator('table_');
register('wm-table', () => {
    return {
        template: (node, shared) => {
            // If table does not have child columns, set isdynamictable to true
            if (node.children.length) {
                const isColumnsPresent = node.children.some(childNode => {
                    return childNode.name === 'wm-table-column' || childNode.name === 'wm-table-column-group';
                });
                shared.set('isdynamictable', isColumnsPresent ? 'false' : 'true');
            }
            else {
                shared.set('isdynamictable', 'true');
            }
            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey$2);
            const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');
            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, '', 'row');
        },
        pre: (attrs, shared) => {
            const counter = idGen$5.nextUid();
            shared.set('counter', counter);
            attrs.set('isdynamictable', shared.get('isdynamictable'));
            return `<${tagName$1h} wmTable="${counter}" wmTableFilterSort wmTableCUD #${counter} data-identifier="table" role="table" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName$1h}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            provider.set('editmode', attrs.get('editmode'));
            provider.set('shownewrow', attrs.get('shownewrow'));
            return provider;
        }
    };
});

const tagName$1i = 'wm-input';
register('wm-text', () => {
    return {
        pre: attrs => `<${tagName$1i} ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$1i}>`
    };
});

const tagName$1j = 'wm-textarea';
register('wm-textarea', () => {
    return {
        pre: attrs => `<${tagName$1j} ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$1j}>`
    };
});

const tagName$1k = 'div';
register('wm-tile', () => {
    return {
        pre: attrs => `<${tagName$1k} wmTile aria-describedby="Tile" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1k}>`
    };
});

const tagName$1l = 'div';
register('wm-time', () => {
    return {
        pre: attrs => `<${tagName$1l} wmTime ${getFormMarkupAttr(attrs)} role="input" ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName$1l}>`
    };
});

const tagName$1m = 'div';
register('wm-tree', () => {
    return {
        pre: attrs => `<${tagName$1m} wmTree redrawable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1m}>`
    };
});

const tagName$1n = 'section';
register('wm-top-nav', () => {
    return {
        pre: attrs => `<${tagName$1n} wmTopNav partialContainer data-role="page-topnav" role="region" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1n}>`
    };
});

const tagName$1o = 'div';
register('wm-video', () => {
    return {
        pre: attrs => `<${tagName$1o} wmVideo ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1o}>`
    };
});

const tagName$1p = 'div';
register('wm-wizard', () => {
    return {
        pre: attrs => `<${tagName$1p} wmWizard role="tablist" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName$1p}>`
    };
});

const tagName$1q = 'form';
const idGen$6 = new IDGenerator('wizard_step_id_');
register('wm-wizardstep', () => {
    return {
        pre: attrs => {
            const counter = idGen$6.nextUid();
            return `<${tagName$1q} wmWizardStep #${counter}="wmWizardStep" ${getAttrMarkup(attrs)}>
                       <ng-template [ngIf]="${counter}.isInitialized">`;
        },
        post: () => `</ng-template></${tagName$1q}>`
    };
});

const tagName$1r = 'div';
register('wm-fileupload', () => {
    return {
        pre: attrs => {
            if (attrs.get('select.event')) {
                const onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return `<${tagName$1r} wmFileUpload ${getAttrMarkup(attrs)} role="input">`;
        },
        post: () => `</${tagName$1r}>`
    };
});

const initComponentsBuildTask = () => { };

/**
 * Generated bundle index. Do not edit.
 */

export { initComponentsBuildTask, ɵ0, ɵ1$1 as ɵ1, ɵ2$1 as ɵ2, ɵ3$1 as ɵ3, ɵ4, ɵ5 };

//# sourceMappingURL=index.js.map