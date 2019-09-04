import { getFormMarkupAttr, register } from '@wm/transpiler';
import { FormWidgetType, getFormWidgetTemplate, IDGenerator, isMobileApp } from '@wm/core';
import { ALLFIELDS } from '../../../../utils/data-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';
const tagName = 'div';
const idGen = new IDGenerator('formfield_');
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
const ɵ0 = getEventsTemplate;
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
const ɵ1 = setDefaultPlaceholder;
const getWidgetTemplate = (attrs, options) => {
    const name = attrs.get('name');
    const fieldName = (attrs.get('key') || name || '').trim();
    const formControl = options.isMaxWidget ? `formControlName="${fieldName}_max"` : (options.isInList ? `[formControlName]="${options.counter}._fieldName"` : `formControlName="${fieldName}"`);
    const tmplRef = options.isMaxWidget ? `#formWidgetMax` : `#formWidget`;
    const widgetName = name ? (options.isMaxWidget ? `name="${name}_formWidgetMax"` : `name="${name}_formWidget"`) : '';
    const defaultTmpl = `[class.hidden]="!${options.pCounter}.isUpdateMode && ${options.counter}.viewmodewidget !== 'default'" ${formControl} ${options.eventsTmpl} ${tmplRef} ${widgetName}`;
    return getFormWidgetTemplate(options.widgetType, defaultTmpl, attrs, { counter: options.counter, pCounter: options.pCounter });
};
const ɵ2 = getWidgetTemplate;
const getTemplate = (attrs, widgetType, eventsTmpl, counter, pCounter, isInList) => {
    const isRange = attrs.get('is-range') === 'true';
    if (!isRange) {
        return getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter, isInList });
    }
    const layoutClass = isMobileApp() ? 'col-xs-6' : 'col-sm-6';
    return `<div class="${layoutClass}">${getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter })}</div>
                <div class="${layoutClass}">${getWidgetTemplate(attrs, { widgetType, eventsTmpl, counter, pCounter, isMaxWidget: true })}</div>`;
};
const ɵ3 = getTemplate;
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
            const counter = idGen.nextUid();
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
            return `<${tagName} data-role="${dataRole}" [formGroup]="${pCounter}.ngform" wmFormField #${counter}="wmFormField" widgettype="${widgetType}" ${getFormMarkupAttr(attrs)}>
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
        post: () => `</${tagName}>`,
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
export default () => { };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9mb3JtLWZpZWxkL2Zvcm0tZmllbGQuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1RSxPQUFPLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFM0YsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVqRSxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ2hDLE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDaEM7SUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMvQjtJQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDMUIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3hCLElBQUksR0FBRyxLQUFLLGFBQWEsRUFBRTtnQkFDdkIs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LEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUVqRSxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEZvcm1NYXJrdXBBdHRyLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcbmltcG9ydCB7IEZvcm1XaWRnZXRUeXBlLCBnZXRGb3JtV2lkZ2V0VGVtcGxhdGUsIElER2VuZXJhdG9yLCBpc01vYmlsZUFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQUxMRklFTERTIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgeyBpc0RhdGFTZXRXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5jb25zdCBpZEdlbiA9IG5ldyBJREdlbmVyYXRvcignZm9ybWZpZWxkXycpO1xuXG5jb25zdCBnZXRFdmVudHNUZW1wbGF0ZSA9IChhdHRycykgPT4ge1xuICAgIGNvbnN0IGV2ZW50QXR0cnMgPSBuZXcgTWFwKCk7XG4gICAgaWYgKCFhdHRycy5oYXMoJ2ZvY3VzLmV2ZW50JykpIHtcbiAgICAgICAgYXR0cnMuc2V0KCdmb2N1cy5ldmVudCcsICcnKTtcbiAgICB9XG4gICAgaWYgKCFhdHRycy5oYXMoJ2JsdXIuZXZlbnQnKSkge1xuICAgICAgICBhdHRycy5zZXQoJ2JsdXIuZXZlbnQnLCAnJyk7XG4gICAgfVxuICAgIGF0dHJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICBpZiAoa2V5LmVuZHNXaXRoKCcuZXZlbnQnKSkge1xuICAgICAgICAgICBpZiAoa2V5ID09PSAnZm9jdXMuZXZlbnQnKSB7XG4gICAgICAgICAgICAgICB2YWx1ZSA9IGBfb25Gb2N1c0ZpZWxkKCRldmVudCk7JHt2YWx1ZX1gO1xuICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2JsdXIuZXZlbnQnKSB7XG4gICAgICAgICAgICAgICB2YWx1ZSA9IGBfb25CbHVyRmllbGQoJGV2ZW50KTske3ZhbHVlfWA7XG4gICAgICAgICAgIH1cbiAgICAgICAgICAgZXZlbnRBdHRycy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgIGF0dHJzLmRlbGV0ZShrZXkpO1xuICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZ2V0Rm9ybU1hcmt1cEF0dHIoZXZlbnRBdHRycyk7XG59O1xuXG5jb25zdCBERUZBVUxUX1BMQUNFSE9MREVSUyA9IG5ldyBNYXAoW1xuICAgIFtGb3JtV2lkZ2V0VHlwZS5TRUxFQ1QsIFsnU2VsZWN0IE1pbiB2YWx1ZScsICdTZWxlY3QgTWF4IHZhbHVlJywgJ1NlbGVjdCB2YWx1ZSddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuREFURVRJTUUsIFsnU2VsZWN0IE1pbiBkYXRlIHRpbWUnLCAnU2VsZWN0IE1heCBkYXRlIHRpbWUnLCAnU2VsZWN0IGRhdGUgdGltZSddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuVElNRSwgWydTZWxlY3QgTWluIHRpbWUnLCAnU2VsZWN0IE1heCB0aW1lJywgJ1NlbGVjdCB0aW1lJ11dLFxuICAgIFtGb3JtV2lkZ2V0VHlwZS5EQVRFLCBbJ1NlbGVjdCBNaW4gZGF0ZScsICdTZWxlY3QgTWF4IGRhdGUnLCAnU2VsZWN0IGRhdGUnXV0sXG4gICAgW0Zvcm1XaWRnZXRUeXBlLlRFWFRBUkVBLCBbJycsICcnLCAnRW50ZXIgdmFsdWUnXV0sXG4gICAgW0Zvcm1XaWRnZXRUeXBlLlJJQ0hURVhULCBbJycsICcnLCAnRW50ZXIgdmFsdWUnXV0sXG4gICAgW0Zvcm1XaWRnZXRUeXBlLkNPTE9SUElDS0VSLCBbJ1NlbGVjdCBDb2xvcicsICdTZWxlY3QgQ29sb3InLCAnU2VsZWN0IENvbG9yJ11dLFxuICAgIFtGb3JtV2lkZ2V0VHlwZS5DSElQUywgWycnLCAnJywgJ1R5cGUgaGVyZS4uLiddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuUEFTU1dPUkQsIFsnRW50ZXIgTWluIHZhbHVlJywgJ0VudGVyIE1heCB2YWx1ZScsICdFbnRlciB2YWx1ZSddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuTlVNQkVSLCBbJ0VudGVyIE1pbiB2YWx1ZScsICdFbnRlciBNYXggdmFsdWUnLCAnRW50ZXIgdmFsdWUnXV0sXG4gICAgW0Zvcm1XaWRnZXRUeXBlLlRFWFQsIFsnRW50ZXIgTWluIHZhbHVlJywgJ0VudGVyIE1heCB2YWx1ZScsICdFbnRlciB2YWx1ZSddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuQ1VSUkVOQ1ksIFsnRW50ZXIgTWluIHZhbHVlJywgJ0VudGVyIE1heCB2YWx1ZScsICdFbnRlciB2YWx1ZSddXSxcbiAgICBbRm9ybVdpZGdldFR5cGUuQVVUT0NPTVBMRVRFLCBbJycsICcnLCAnU2VhcmNoJ11dLFxuXSk7XG5cbmNvbnN0IHNldERlZmF1bHRQbGFjZWhvbGRlciA9IChhdHRycywgd2lkZ2V0VHlwZSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwcm9wID0gaW5kZXggPT09IDEgPyAnbWF4cGxhY2Vob2xkZXInIDogJ3BsYWNlaG9sZGVyJztcbiAgICBsZXQgcGxhY2Vob2xkZXIgPSBhdHRycy5nZXQocHJvcCk7XG4gICAgaWYgKHBsYWNlaG9sZGVyIHx8IHBsYWNlaG9sZGVyID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHBsYWNlaG9sZGVyID0gREVGQVVMVF9QTEFDRUhPTERFUlMuZ2V0KHdpZGdldFR5cGUpICYmIERFRkFVTFRfUExBQ0VIT0xERVJTLmdldCh3aWRnZXRUeXBlKVtpbmRleF07XG4gICAgaWYgKHBsYWNlaG9sZGVyKSB7XG4gICAgICAgIGF0dHJzLnNldChwcm9wLCBwbGFjZWhvbGRlcik7XG4gICAgfVxufTtcblxuY29uc3QgZ2V0V2lkZ2V0VGVtcGxhdGUgPSAoYXR0cnMsIG9wdGlvbnMpID0+IHtcbiAgICBjb25zdCBuYW1lID0gYXR0cnMuZ2V0KCduYW1lJyk7XG4gICAgY29uc3QgZmllbGROYW1lID0gKGF0dHJzLmdldCgna2V5JykgfHwgbmFtZSB8fCAnJykudHJpbSgpO1xuICAgIGNvbnN0IGZvcm1Db250cm9sID0gb3B0aW9ucy5pc01heFdpZGdldCA/IGBmb3JtQ29udHJvbE5hbWU9XCIke2ZpZWxkTmFtZX1fbWF4XCJgIDogKG9wdGlvbnMuaXNJbkxpc3QgPyBgW2Zvcm1Db250cm9sTmFtZV09XCIke29wdGlvbnMuY291bnRlcn0uX2ZpZWxkTmFtZVwiYCA6IGBmb3JtQ29udHJvbE5hbWU9XCIke2ZpZWxkTmFtZX1cImApO1xuICAgIGNvbnN0IHRtcGxSZWYgPSBvcHRpb25zLmlzTWF4V2lkZ2V0ID8gYCNmb3JtV2lkZ2V0TWF4YCA6IGAjZm9ybVdpZGdldGA7XG4gICAgY29uc3Qgd2lkZ2V0TmFtZSA9IG5hbWUgPyAob3B0aW9ucy5pc01heFdpZGdldCA/IGBuYW1lPVwiJHtuYW1lfV9mb3JtV2lkZ2V0TWF4XCJgIDogYG5hbWU9XCIke25hbWV9X2Zvcm1XaWRnZXRcImApIDogJyc7XG4gICAgY29uc3QgZGVmYXVsdFRtcGwgPSBgW2NsYXNzLmhpZGRlbl09XCIhJHtvcHRpb25zLnBDb3VudGVyfS5pc1VwZGF0ZU1vZGUgJiYgJHtvcHRpb25zLmNvdW50ZXJ9LnZpZXdtb2Rld2lkZ2V0ICE9PSAnZGVmYXVsdCdcIiAke2Zvcm1Db250cm9sfSAke29wdGlvbnMuZXZlbnRzVG1wbH0gJHt0bXBsUmVmfSAke3dpZGdldE5hbWV9YDtcbiAgICByZXR1cm4gZ2V0Rm9ybVdpZGdldFRlbXBsYXRlKG9wdGlvbnMud2lkZ2V0VHlwZSwgZGVmYXVsdFRtcGwsIGF0dHJzLCB7Y291bnRlcjogb3B0aW9ucy5jb3VudGVyLCBwQ291bnRlcjogb3B0aW9ucy5wQ291bnRlcn0pO1xufTtcblxuXG5jb25zdCBnZXRUZW1wbGF0ZSA9IChhdHRycywgd2lkZ2V0VHlwZSwgZXZlbnRzVG1wbCwgY291bnRlciwgcENvdW50ZXIsIGlzSW5MaXN0KSA9PiB7XG4gICAgY29uc3QgaXNSYW5nZSA9IGF0dHJzLmdldCgnaXMtcmFuZ2UnKSA9PT0gJ3RydWUnO1xuICAgIGlmICghaXNSYW5nZSkge1xuICAgICAgICByZXR1cm4gZ2V0V2lkZ2V0VGVtcGxhdGUoYXR0cnMsIHt3aWRnZXRUeXBlLCBldmVudHNUbXBsLCBjb3VudGVyLCBwQ291bnRlciwgaXNJbkxpc3R9KTtcbiAgICB9XG4gICAgY29uc3QgbGF5b3V0Q2xhc3MgPSBpc01vYmlsZUFwcCgpID8gJ2NvbC14cy02JyA6ICdjb2wtc20tNic7XG4gICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwiJHtsYXlvdXRDbGFzc31cIj4ke2dldFdpZGdldFRlbXBsYXRlKGF0dHJzLCB7d2lkZ2V0VHlwZSwgZXZlbnRzVG1wbCwgY291bnRlciwgcENvdW50ZXJ9KX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiJHtsYXlvdXRDbGFzc31cIj4ke2dldFdpZGdldFRlbXBsYXRlKGF0dHJzLCB7d2lkZ2V0VHlwZSwgZXZlbnRzVG1wbCwgY291bnRlciwgcENvdW50ZXIsIGlzTWF4V2lkZ2V0OiB0cnVlfSl9PC9kaXY+YDtcbn07XG5cbmNvbnN0IGdldENhcHRpb25CeVdpZGdldCA9IChhdHRycywgd2lkZ2V0VHlwZSwgY291bnRlcikgPT4ge1xuICAgIGlmIChhdHRycy5nZXQoJ2lzLXJlbGF0ZWQnKSA9PT0gJ3RydWUnKSB7XG4gICAgICAgIHJldHVybiBgJHtjb3VudGVyfS5nZXREaXNwbGF5RXhwcigpYDtcbiAgICB9XG4gICAgaWYgKHdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlBBU1NXT1JEKSB7XG4gICAgICAgIHJldHVybiAnXFwnKioqKioqKipcXCcnO1xuICAgIH1cbiAgICBsZXQgY2FwdGlvbiA9IGAke2NvdW50ZXJ9LnZhbHVlYDtcbiAgICBpZiAod2lkZ2V0VHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuREFURVRJTUUgfHwgd2lkZ2V0VHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuVElNRVNUQU1QKSB7XG4gICAgICAgIGNhcHRpb24gKz0gYCB8IHRvRGF0ZToke2NvdW50ZXJ9LmZvcm1XaWRnZXQuZGF0ZXBhdHRlcm4gfHwgJ3l5eXktTU0tZGQgaGg6bW06c3MgYSdgO1xuICAgICAgICByZXR1cm4gY2FwdGlvbjtcbiAgICB9XG4gICAgaWYgKHdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlRJTUUpIHtcbiAgICAgICAgY2FwdGlvbiArPSBgIHwgdG9EYXRlOiR7Y291bnRlcn0uZm9ybVdpZGdldC50aW1lcGF0dGVybiB8fCAnaGg6bW0gYSdgO1xuICAgICAgICByZXR1cm4gY2FwdGlvbjtcbiAgICB9XG4gICAgaWYgKHdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLkRBVEUpIHtcbiAgICAgICAgY2FwdGlvbiArPSBgIHwgdG9EYXRlOiR7Y291bnRlcn0uZm9ybVdpZGdldC5kYXRlcGF0dGVybiB8fCAgJ3l5eXktTU1NLWRkJ2A7XG4gICAgICAgIHJldHVybiBjYXB0aW9uO1xuICAgIH1cbiAgICBpZiAod2lkZ2V0VHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuUkFUSU5HIHx8IHdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlVQTE9BRCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGlmIChpc0RhdGFTZXRXaWRnZXQod2lkZ2V0VHlwZSkgJiYgYXR0cnMuZ2V0KCdkYXRhZmllbGQnKSA9PT0gQUxMRklFTERTKSB7XG4gICAgICAgIHJldHVybiBgJHtjb3VudGVyfS5nZXREaXNwbGF5RXhwcigpYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke2NvdW50ZXJ9LmdldENhcHRpb24oKWA7XG59O1xuXG5jb25zdCByZWdpc3RlckZvcm1GaWVsZCA9IChpc0Zvcm1GaWVsZCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVzOiBbJ3dtLWZvcm0nLCAnd20tbGl2ZWZvcm0nLCAnd20tbGl2ZWZpbHRlcicsICd3bS1saXN0J10sXG4gICAgICAgIHByZTogKGF0dHJzLCBzaGFyZWQsIHBhcmVudEZvcm0sIHBhcmVudExpdmVGb3JtLCBwYXJlbnRGaWx0ZXIsIHBhcmVudExpc3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ZXIgPSBpZEdlbi5uZXh0VWlkKCk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBwYXJlbnRGb3JtIHx8IHBhcmVudExpdmVGb3JtIHx8IHBhcmVudEZpbHRlcjtcbiAgICAgICAgICAgIGNvbnN0IHBDb3VudGVyID0gKHBhcmVudCAmJiBwYXJlbnQuZ2V0KCdmb3JtX3JlZmVyZW5jZScpKSB8fCAnZm9ybSc7XG4gICAgICAgICAgICBjb25zdCB3aWRnZXRUeXBlID0gYXR0cnMuZ2V0KCd3aWRnZXQnKSB8fCBGb3JtV2lkZ2V0VHlwZS5URVhUO1xuICAgICAgICAgICAgY29uc3QgZGF0YVJvbGUgPSBpc0Zvcm1GaWVsZCA/ICdmb3JtLWZpZWxkJyA6ICdmaWx0ZXItZmllbGQnO1xuICAgICAgICAgICAgY29uc3QgdmFsaWRhdGlvbk1zZyA9IGlzRm9ybUZpZWxkID8gYDxwICpuZ0lmPVwiJHtjb3VudGVyfS5fY29udHJvbD8uaW52YWxpZCAmJiAke2NvdW50ZXJ9Ll9jb250cm9sPy50b3VjaGVkICYmICR7cENvdW50ZXJ9LmlzVXBkYXRlTW9kZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaGVscC1ibG9jayB0ZXh0LWRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt0ZXh0Q29udGVudF09XCIke2NvdW50ZXJ9LnZhbGlkYXRpb25tZXNzYWdlXCI+PC9wPmAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50c1RtcGwgPSB3aWRnZXRUeXBlID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQgPyAnJyA6IGdldEV2ZW50c1RlbXBsYXRlKGF0dHJzKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2xMYXlvdXQgPSBpc01vYmlsZUFwcCgpID8gJ2NvbC14cy0xMicgOiAnY29sLXNtLTEyJztcbiAgICAgICAgICAgIGNvbnN0IGlzSW5MaXN0ID0gcENvdW50ZXIgPT09IChwYXJlbnRMaXN0ICYmIHBhcmVudExpc3QuZ2V0KCdwYXJlbnRfZm9ybV9yZWZlcmVuY2UnKSk7XG4gICAgICAgICAgICBhdHRycy5kZWxldGUoJ3dpZGdldCcpO1xuICAgICAgICAgICAgc2hhcmVkLnNldCgnY291bnRlcicsIGNvdW50ZXIpO1xuXG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdpcy1yYW5nZScpID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICBzZXREZWZhdWx0UGxhY2Vob2xkZXIoYXR0cnMsIHdpZGdldFR5cGUsIDApO1xuICAgICAgICAgICAgICAgIHNldERlZmF1bHRQbGFjZWhvbGRlcihhdHRycywgd2lkZ2V0VHlwZSwgMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldERlZmF1bHRQbGFjZWhvbGRlcihhdHRycywgd2lkZ2V0VHlwZSwgMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBgPCR7dGFnTmFtZX0gZGF0YS1yb2xlPVwiJHtkYXRhUm9sZX1cIiBbZm9ybUdyb3VwXT1cIiR7cENvdW50ZXJ9Lm5nZm9ybVwiIHdtRm9ybUZpZWxkICMke2NvdW50ZXJ9PVwid21Gb3JtRmllbGRcIiB3aWRnZXR0eXBlPVwiJHt3aWRnZXRUeXBlfVwiICR7Z2V0Rm9ybU1hcmt1cEF0dHIoYXR0cnMpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaXZlLWZpZWxkIGZvcm0tZ3JvdXAgYXBwLWNvbXBvc2l0ZS13aWRnZXQgY2xlYXJmaXggY2FwdGlvbi17eyR7cENvdW50ZXJ9LmNhcHRpb25wb3NpdGlvbn19XCIgd2lkZ2V0PVwiJHt3aWRnZXRUeXBlfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBbaGlkZGVuXT1cIiEke2NvdW50ZXJ9LmRpc3BsYXluYW1lXCIgY2xhc3M9XCJhcHAtbGFiZWwgY29udHJvbC1sYWJlbCBmb3JtZmllbGQtbGFiZWwge3ske3BDb3VudGVyfS5fY2FwdGlvbkNsYXNzfX1cIiBbdGl0bGVdPVwiJHtjb3VudGVyfS5kaXNwbGF5bmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nU3R5bGVdPVwie3dpZHRoOiAke3BDb3VudGVyfS5jYXB0aW9uc2l6ZX1cIiBbbmdDbGFzc109XCJ7J3RleHQtZGFuZ2VyJzogJHtjb3VudGVyfS5fY29udHJvbD8uaW52YWxpZCAmJiAke2NvdW50ZXJ9Ll9jb250cm9sPy50b3VjaGVkICYmICR7cENvdW50ZXJ9LmlzVXBkYXRlTW9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6ICR7cENvdW50ZXJ9LmlzVXBkYXRlTW9kZSAmJiAke2NvdW50ZXJ9LnJlcXVpcmVkfVwiIFt0ZXh0Q29udGVudF09XCIke2NvdW50ZXJ9LmRpc3BsYXluYW1lXCI+IDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBbbmdDbGFzc109XCIke2NvdW50ZXJ9LmRpc3BsYXluYW1lID8gJHtwQ291bnRlcn0uX3dpZGdldENsYXNzIDogJyR7Y29udHJvbExheW91dH0nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJmb3JtLWNvbnRyb2wtc3RhdGljIGFwcC1sYWJlbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaGlkZGVuXT1cIiR7cENvdW50ZXJ9LmlzVXBkYXRlTW9kZSB8fCAke2NvdW50ZXJ9LnZpZXdtb2Rld2lkZ2V0ID09PSAnZGVmYXVsdCcgfHwgJHtjb3VudGVyfS53aWRnZXR0eXBlID09PSAndXBsb2FkJ1wiIFtpbm5lckhUTUxdPVwiJHtnZXRDYXB0aW9uQnlXaWRnZXQoYXR0cnMsIHdpZGdldFR5cGUsIGNvdW50ZXIpfVwiPjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Z2V0VGVtcGxhdGUoYXR0cnMsIHdpZGdldFR5cGUsIGV2ZW50c1RtcGwsIGNvdW50ZXIsIHBDb3VudGVyLCBpc0luTGlzdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwICpuZ0lmPVwiISgke2NvdW50ZXJ9Ll9jb250cm9sPy5pbnZhbGlkICYmICR7Y291bnRlcn0uX2NvbnRyb2w/LnRvdWNoZWQpICYmICR7cENvdW50ZXJ9LmlzVXBkYXRlTW9kZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiaGVscC1ibG9ja1wiIFt0ZXh0Q29udGVudF09XCIke2NvdW50ZXJ9LmhpbnRcIj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dmFsaWRhdGlvbk1zZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YCxcbiAgICAgICAgcHJvdmlkZTogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0KCdmb3JtX3JlZmVyZW5jZScsIHNoYXJlZC5nZXQoJ2NvdW50ZXInKSk7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxucmVnaXN0ZXIoJ3dtLWZvcm0tZmllbGQnLCByZWdpc3RlckZvcm1GaWVsZC5iaW5kKHRoaXMsIHRydWUpKTtcbnJlZ2lzdGVyKCd3bS1maWx0ZXItZmllbGQnLCByZWdpc3RlckZvcm1GaWVsZC5iaW5kKHRoaXMsIGZhbHNlKSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19