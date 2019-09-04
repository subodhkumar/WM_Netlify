import { Attribute, Text } from '@angular/compiler';
import { DataType, FormWidgetType, getFormWidgetTemplate, IDGenerator, isDateTimeType } from '@wm/core';
import { getAttrMarkup, getDataSource, register } from '@wm/transpiler';
import { EDIT_MODE, getDataTableFilterWidget, getEditModeWidget } from '../../../../utils/live-utils';
const tagName = 'div';
const idGen = new IDGenerator('data_table_form_');
const formWidgets = new Set([
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
        if (formWidgets.has(childNode.name)) {
            childNode.attrs.push(new Attribute('[ngModelOptions]', '{standalone: true}', 1, 1));
        }
        addNgModelStandalone(childNode.children);
    });
};
const ɵ0 = addNgModelStandalone;
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
const ɵ1 = getFilterTemplate;
const getEventsTmpl = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        if (key.endsWith('.event')) {
            tmpl += `${key}="${val}" `;
        }
    });
    return tmpl;
};
const ɵ2 = getEventsTmpl;
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
const ɵ3 = getInlineEditRowPropsTmpl;
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
            formName: idGen.nextUid(),
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
const ɵ4 = getInlineEditWidgetTmpl;
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
const ɵ5 = getFormatExpression;
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
            return `<${tagName} wmTableColumn ${getAttrMarkup(attrs)} ${parentForm}>
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
            return `${customExprTmpl}</${tagName}>`;
        }
    };
});
export default () => { };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS1jb2x1bW4vdGFibGUtY29sdW1uLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVcsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFN0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN4RyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkYsT0FBTyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXRHLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN0QixNQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3hCLFNBQVM7SUFDVCxhQUFhO0lBQ2IsYUFBYTtJQUNiLFdBQVc7SUFDWCxhQUFhO0lBQ2IsV0FBVztJQUNYLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLFNBQVM7SUFDVCxTQUFTO0lBQ1QsY0FBYztJQUNkLFdBQVc7SUFDWCxhQUFhO0lBQ2IsV0FBVztJQUNYLFVBQVU7SUFDVixnQkFBZ0I7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsbUdBQW1HO0FBQ25HLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxRQUFRLEdBQUcsRUFBRSxFQUFFLEVBQUU7SUFDM0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN6QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElB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LEdBQUcsRUFBRSxDQUFDO1lBRXhCLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUNoQyxjQUFjLEdBQUcsc0JBQXNCLENBQUM7YUFDM0M7WUFDRCxPQUFPLEdBQUcsY0FBYyxLQUFLLE9BQU8sR0FBRyxDQUFDO1FBQzVDLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgRWxlbWVudCwgVGV4dCB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHsgRGF0YVR5cGUsIEZvcm1XaWRnZXRUeXBlLCBnZXRGb3JtV2lkZ2V0VGVtcGxhdGUsIElER2VuZXJhdG9yLCBpc0RhdGVUaW1lVHlwZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IGdldEF0dHJNYXJrdXAsIGdldERhdGFTb3VyY2UsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5pbXBvcnQgeyBFRElUX01PREUsIGdldERhdGFUYWJsZUZpbHRlcldpZGdldCwgZ2V0RWRpdE1vZGVXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9saXZlLXV0aWxzJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuY29uc3QgaWRHZW4gPSBuZXcgSURHZW5lcmF0b3IoJ2RhdGFfdGFibGVfZm9ybV8nKTtcbmNvbnN0IGZvcm1XaWRnZXRzID0gbmV3IFNldChbXG4gICAgJ3dtLXRleHQnLFxuICAgICd3bS10ZXh0YXJlYScsXG4gICAgJ3dtLWNoZWNrYm94JyxcbiAgICAnd20tc2xpZGVyJyxcbiAgICAnd20tY3VycmVuY3knLFxuICAgICd3bS1zd2l0Y2gnLFxuICAgICd3bS1zZWxlY3QnLFxuICAgICd3bS1jaGVja2JveHNldCcsXG4gICAgJ3dtLXJhZGlvc2V0JyxcbiAgICAnd20tZGF0ZScsXG4gICAgJ3dtLXRpbWUnLFxuICAgICd3bS10aW1lc3RhbXAnLFxuICAgICd3bS1yYXRpbmcnLFxuICAgICd3bS1kYXRldGltZScsXG4gICAgJ3dtLXNlYXJjaCcsXG4gICAgJ3dtLWNoaXBzJyxcbiAgICAnd20tY29sb3JwaWNrZXInXG5dKTtcblxuLy8gQWRkIG5nTW9kZWxPcHRpb25zIHN0YW5kYWxvbmUgdHJ1ZSBhcyBpbm5lciBjdXN0b20gZm9ybSB3aWRnZXRzIHdpbGwgYmUgbm90IHBhcnQgb2YgdGFibGUgbmdmb3JtXG5jb25zdCBhZGROZ01vZGVsU3RhbmRhbG9uZSA9IChjaGlsZHJlbiA9IFtdKSA9PiB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICBpZiAoZm9ybVdpZGdldHMuaGFzKGNoaWxkTm9kZS5uYW1lKSkge1xuICAgICAgICAgICAgY2hpbGROb2RlLmF0dHJzLnB1c2gobmV3IEF0dHJpYnV0ZSgnW25nTW9kZWxPcHRpb25zXScsICd7c3RhbmRhbG9uZTogdHJ1ZX0nLCA8YW55PjEsIDxhbnk+MSkpO1xuICAgICAgICB9XG4gICAgICAgIGFkZE5nTW9kZWxTdGFuZGFsb25lKGNoaWxkTm9kZS5jaGlsZHJlbik7XG4gICAgfSk7XG59O1xuXG4vLyBnZXQgdGhlIGZpbHRlciB0ZW1wbGF0ZSAod2lkZ2V0IGFuZCBmaWx0ZXIgbWVudSkgdG8gYmUgZGlzcGxheWVkIGluIGZpbHRlciByb3dcbmNvbnN0IGdldEZpbHRlclRlbXBsYXRlID0gKGF0dHJzLCBwQ291bnRlcikgID0+IHtcbiAgICBjb25zdCB3aWRnZXQgPSBhdHRycy5nZXQoJ2ZpbHRlcndpZGdldCcpIHx8IGdldERhdGFUYWJsZUZpbHRlcldpZGdldChhdHRycy5nZXQoJ3R5cGUnKSB8fCBEYXRhVHlwZS5TVFJJTkcpO1xuICAgIGNvbnN0IGZpZWxkTmFtZSA9IGF0dHJzLmdldCgnYmluZGluZycpO1xuICAgIGNvbnN0IHR5cGUgPSBhdHRycy5nZXQoJ3R5cGUnKSB8fCAnc3RyaW5nJztcbiAgICBsZXQgZGF0YXNvdXJjZUJpbmRpbmcsIHN1Ym1pdEV2ZW50QmluZGluZztcbiAgICBjb25zdCBkYXRhc2V0QXR0ciA9IGF0dHJzLmdldCgnZmlsdGVyZGF0YXNldC5iaW5kJyk7XG4gICAgLy8gd2hlbiBtdWx0aWNvbHVtbiBpcyBzZWxlY3RlZCBhbmQgZmlsdGVyd2lkZ2V0IGFzIGF1dG9jb21wbGV0ZSBpcyBhc3NpZ25lZCB0byBkYXRhc2V0LlxuICAgIGlmIChhdHRycy5nZXQoJ2ZpbHRlcndpZGdldCcpID09PSAnYXV0b2NvbXBsZXRlJykge1xuICAgICAgICBpZiAoZGF0YXNldEF0dHIpIHtcbiAgICAgICAgICAgIGNvbnN0IGJpbmRkYXRhc291cmNlID0gZ2V0RGF0YVNvdXJjZShkYXRhc2V0QXR0cik7XG4gICAgICAgICAgICBkYXRhc291cmNlQmluZGluZyA9IGBkYXRhc2V0LmJpbmQ9XCIke2RhdGFzZXRBdHRyfVwiIGRhdGFzb3VyY2UuYmluZD1cIiR7YmluZGRhdGFzb3VyY2V9XCJgO1xuICAgICAgICB9XG4gICAgICAgIHN1Ym1pdEV2ZW50QmluZGluZyA9IGBzdWJtaXQuZXZlbnQ9XCJjaGFuZ2VGbignJHtmaWVsZE5hbWV9JylcImA7XG4gICAgfVxuICAgIGNvbnN0IGlubmVyVG1wbCA9IGAjZmlsdGVyV2lkZ2V0IGZvcm1Db250cm9sTmFtZT1cIiR7ZmllbGROYW1lICsgJ19maWx0ZXInfVwiICR7ZGF0YXNvdXJjZUJpbmRpbmd9ICR7c3VibWl0RXZlbnRCaW5kaW5nfSBjaGFuZ2UuZXZlbnQ9XCJjaGFuZ2VGbignJHtmaWVsZE5hbWV9JylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQuYmluZD1cImlzRGlzYWJsZWQoJyR7ZmllbGROYW1lfScpXCJgO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7aW5wdXRUeXBlOiAnZmlsdGVyaW5wdXR0eXBlJ30gO1xuICAgIGNvbnN0IHdpZGdldFRtcGwgPSBgJHtnZXRGb3JtV2lkZ2V0VGVtcGxhdGUod2lkZ2V0LCBpbm5lclRtcGwsIGF0dHJzLCBvcHRpb25zKX1gO1xuXG4gICAgcmV0dXJuIGA8bmctdGVtcGxhdGUgI2ZpbHRlclRtcGwgbGV0LWNoYW5nZUZuPVwiY2hhbmdlRm5cIiBsZXQtaXNEaXNhYmxlZD1cImlzRGlzYWJsZWRcIj5cbiAgICA8ZGl2IGNsYXNzPVwiaW5wdXQtZ3JvdXAgJHt3aWRnZXR9XCIgZGF0YS1jb2wtaWRlbnRpZmllcj1cIiR7ZmllbGROYW1lfVwiPlxuICAgICAgICAke3dpZGdldFRtcGx9XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiaW5wdXQtZ3JvdXAtYWRkb24gZmlsdGVyLWNsZWFyLWljb25cIiAqbmdJZj1cIiR7cENvdW50ZXJ9LnNob3dDbGVhckljb24oJyR7ZmllbGROYW1lfScpXCI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXRyYW5zcGFyZW50IGJ0biBhcHAtYnV0dG9uXCIgYXJpYS1sYWJlbD1cIkNsZWFyIGJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiAoY2xpY2spPVwiJHtwQ291bnRlcn0uY2xlYXJSb3dGaWx0ZXIoJyR7ZmllbGROYW1lfScpXCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJhcHAtaWNvbiB3aSB3aS1jbGVhclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uXCIgZHJvcGRvd24gY29udGFpbmVyPVwiYm9keVwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi10cmFuc3BhcmVudCBidG4gYXBwLWJ1dHRvblwiIHR5cGU9XCJidXR0b25cIiBkcm9wZG93blRvZ2dsZT48aSBjbGFzcz1cImFwcC1pY29uIHdpIHdpLWZpbHRlci1saXN0XCI+PC9pPjwvYnV0dG9uPlxuICAgICAgICAgICAgPHVsIGNsYXNzPVwibWF0Y2htb2RlLWRyb3Bkb3duIGRyb3Bkb3duLW1lbnVcIiAqZHJvcGRvd25NZW51PlxuICAgICAgICAgICAgICAgICAgIDxsaSAqbmdGb3I9XCJsZXQgbWF0Y2hNb2RlIG9mICR7cENvdW50ZXJ9Lm1hdGNoTW9kZVR5cGVzTWFwWycke3R5cGV9J11cIlxuICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwie2FjdGl2ZTogbWF0Y2hNb2RlID09PSAoJHtwQ291bnRlcn0ucm93RmlsdGVyWycke2ZpZWxkTmFtZX0nXS5tYXRjaE1vZGUgfHwgJHtwQ291bnRlcn0ubWF0Y2hNb2RlVHlwZXNNYXBbJyR7dHlwZX0nXVswXSl9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIChjbGljayk9XCIke3BDb3VudGVyfS5vbkZpbHRlckNvbmRpdGlvblNlbGVjdCgnJHtmaWVsZE5hbWV9JywgbWF0Y2hNb2RlKVwiIFtpbm5lclRleHRdPVwiJHtwQ291bnRlcn0ubWF0Y2hNb2RlTXNnc1ttYXRjaE1vZGVdXCI+PC9hPlxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj48L25nLXRlbXBsYXRlPmA7XG59O1xuXG5jb25zdCBnZXRFdmVudHNUbXBsID0gYXR0cnMgPT4ge1xuICAgIGxldCB0bXBsID0gJyc7XG4gICAgYXR0cnMuZm9yRWFjaCgodmFsLCBrZXkpID0+IHtcbiAgICAgICAgaWYgKGtleS5lbmRzV2l0aCgnLmV2ZW50JykpIHtcbiAgICAgICAgICAgIHRtcGwgKz0gYCR7a2V5fT1cIiR7dmFsfVwiIGA7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG1wbDtcbn07XG5cbi8vIEdlbmVyYXRlIGlubGluZSBlZGl0IHByb3BlcnRpZXMgdGVtcGxhdGUuIFByb3BlcnRpZXMgcmVxdWlyaW5nIHJvdyBpbnN0YW5jZSBhcmUgZ2VuZXJhdGVkIGhlcmUuXG5jb25zdCBnZXRJbmxpbmVFZGl0Um93UHJvcHNUbXBsID0gYXR0cnMgPT4ge1xuICAgIGNvbnN0IHByb3BBdHRycyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBwcm9wcyA9IFsnZGlzYWJsZWQnLCAnZGlzYWJsZWQuYmluZCddO1xuICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgIGlmIChhdHRycy5nZXQocHJvcCkpIHtcbiAgICAgICAgICAgIHByb3BBdHRycy5zZXQocHJvcCwgYXR0cnMuZ2V0KHByb3ApKTtcbiAgICAgICAgICAgIGF0dHJzLmRlbGV0ZShwcm9wKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBnZXRBdHRyTWFya3VwKHByb3BBdHRycyk7XG59O1xuXG4vLyBnZXQgdGhlIGlubGluZSB3aWRnZXQgdGVtcGxhdGVcbmNvbnN0IGdldElubGluZUVkaXRXaWRnZXRUbXBsID0gKGF0dHJzLCBpc05ld1Jvdz8sIHBDb3VudGVyPykgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IGFueSA9IHt9O1xuICAgIGNvbnN0IGZpZWxkTmFtZSA9IGF0dHJzLmdldCgnYmluZGluZycpO1xuICAgIGNvbnN0IHdpZGdldCA9IGF0dHJzLmdldCgnZWRpdC13aWRnZXQtdHlwZScpIHx8IGdldEVkaXRNb2RlV2lkZ2V0KHtcbiAgICAgICAgJ3R5cGUnOiBhdHRycy5nZXQoJ3R5cGUnKSxcbiAgICAgICAgJ3JlbGF0ZWQtZW50aXR5LW5hbWUnOiBhdHRycy5nZXQoJ3JlbGF0ZWQtZW50aXR5LW5hbWUnKSxcbiAgICAgICAgJ3ByaW1hcnkta2V5JzogYXR0cnMuZ2V0KCdwcmltYXJ5LWtleScpXG4gICAgfSk7XG4gICAgbGV0IHdpZGdldFJlZiA9ICcnO1xuICAgIGxldCBmb3JtQ29udHJvbCA9ICcnO1xuICAgIGxldCB3bUZvcm1XaWRnZXQgPSAnJztcbiAgICBpZiAod2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQpIHtcbiAgICAgICAgb3B0aW9ucy51cGxvYWRQcm9wcyA9IHtcbiAgICAgICAgICAgIGZvcm1OYW1lOiBpZEdlbi5uZXh0VWlkKCksXG4gICAgICAgICAgICBuYW1lOiBmaWVsZE5hbWVcbiAgICAgICAgfTtcbiAgICAgICAgb3B0aW9ucy5jb3VudGVyID0gcENvdW50ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2lkZ2V0UmVmID0gaXNOZXdSb3cgPyAnI2lubGluZVdpZGdldE5ldycgOiAnI2lubGluZVdpZGdldCc7XG4gICAgICAgIGZvcm1Db250cm9sID0gaXNOZXdSb3cgPyBgZm9ybUNvbnRyb2xOYW1lPVwiJHtmaWVsZE5hbWV9X25ld1wiYCA6IGBmb3JtQ29udHJvbE5hbWU9XCIke2ZpZWxkTmFtZX1cImA7XG4gICAgICAgIHdtRm9ybVdpZGdldCA9ICd3bUZvcm1XaWRnZXQnO1xuICAgIH1cbiAgICBvcHRpb25zLmlucHV0VHlwZSA9ICdlZGl0aW5wdXR0eXBlJztcbiAgICBjb25zdCB0bXBsUmVmID0gaXNOZXdSb3cgPyAnI2lubGluZVdpZGdldFRtcGxOZXcnIDogJyNpbmxpbmVXaWRnZXRUbXBsJztcbiAgICBjb25zdCBldmVudHNUbXBsID0gd2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQgPyAnJyA6IGdldEV2ZW50c1RtcGwoYXR0cnMpO1xuICAgIGNvbnN0IHJvd1Byb3BzVGwgPSBnZXRJbmxpbmVFZGl0Um93UHJvcHNUbXBsKGF0dHJzKTtcbiAgICBjb25zdCBpbm5lclRtcGwgPSBgJHt3aWRnZXRSZWZ9ICR7d21Gb3JtV2lkZ2V0fSBrZXk9XCIke2ZpZWxkTmFtZX1cIiBkYXRhLWZpZWxkLW5hbWU9XCIke2ZpZWxkTmFtZX1cIiAke2Zvcm1Db250cm9sfSAke2V2ZW50c1RtcGx9ICR7cm93UHJvcHNUbH1gO1xuICAgIGNvbnN0IHdpZGdldFRtcGwgPSBnZXRGb3JtV2lkZ2V0VGVtcGxhdGUod2lkZ2V0LCBpbm5lclRtcGwsIGF0dHJzLCBvcHRpb25zKTtcblxuICAgIHJldHVybiBgPG5nLXRlbXBsYXRlICR7dG1wbFJlZn0gbGV0LXJvdz1cInJvd1wiIGxldC1nZXRDb250cm9sPVwiZ2V0Q29udHJvbFwiIGxldC1nZXRWYWxpZGF0aW9uTWVzc2FnZT1cImdldFZhbGlkYXRpb25NZXNzYWdlXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBkYXRhLWNvbC1pZGVudGlmaWVyPVwiJHtmaWVsZE5hbWV9XCIgPlxuICAgICAgICAgICAgICAgICAgICAgJHt3aWRnZXRUbXBsfVxuICAgICAgICAgICAgICAgICAgICAgPHNwYW4gcGxhY2VtZW50PVwidG9wXCIgY29udGFpbmVyPVwiYm9keVwiIHRvb2x0aXA9XCJ7e2dldFZhbGlkYXRpb25NZXNzYWdlKCl9fVwiIGNsYXNzPVwidGV4dC1kYW5nZXIgd2kgd2ktZXJyb3JcIlxuICAgICAgICAgICAgICAgICAgICAgICAgKm5nSWY9XCJnZXRWYWxpZGF0aW9uTWVzc2FnZSgpICYmIGdldENvbnRyb2woKSAmJiBnZXRDb250cm9sKCkuaW52YWxpZCAmJiBnZXRDb250cm9sKCkudG91Y2hlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCIgKm5nSWY9XCJnZXRWYWxpZGF0aW9uTWVzc2FnZSgpXCI+e3tnZXRWYWxpZGF0aW9uTWVzc2FnZSgpfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5gO1xufTtcblxuY29uc3QgZ2V0Rm9ybWF0RXhwcmVzc2lvbiA9IChhdHRycykgPT4ge1xuICAgIGNvbnN0IGNvbHVtblZhbHVlID0gYHJvdy5nZXRQcm9wZXJ0eSgnJHthdHRycy5nZXQoJ2JpbmRpbmcnKX0nKWA7XG4gICAgbGV0IGZvcm1hdFBhdHRlcm4gPSBhdHRycy5nZXQoJ2Zvcm1hdHBhdHRlcm4nKTtcbiAgICBsZXQgY29sRXhwcmVzc2lvbiA9ICcnO1xuICAgIC8vIEZvciBkYXRlIHRpbWUgZGF0YSB0eXBlcywgaWYgZm9ybWF0IHBhdHRlcm4gaXMgbm90IGFwcGxpZWQsIEFwcGx5IGRlZmF1bHQgdG9EYXRlIGZvcm1hdFxuICAgIGlmIChpc0RhdGVUaW1lVHlwZShhdHRycy5nZXQoJ3R5cGUnKSkgJiYgKCFmb3JtYXRQYXR0ZXJuIHx8IGZvcm1hdFBhdHRlcm4gPT09ICdOb25lJykpIHtcbiAgICAgICAgYXR0cnMuc2V0KCdmb3JtYXRwYXR0ZXJuJywgJ3RvRGF0ZScpO1xuICAgICAgICBhdHRycy5kZWxldGUoJ2RhdGVwYXR0ZXJuJyk7XG4gICAgICAgIGZvcm1hdFBhdHRlcm4gPSAndG9EYXRlJztcbiAgICB9XG4gICAgc3dpdGNoIChmb3JtYXRQYXR0ZXJuKSB7XG4gICAgICAgIGNhc2UgJ3RvRGF0ZSc6XG4gICAgICAgICAgICBjb2xFeHByZXNzaW9uID0gYHt7JHtjb2x1bW5WYWx1ZX0gfCB0b0RhdGU6IGNvbERlZi5kYXRlcGF0dGVybn19YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b0N1cnJlbmN5JzpcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2N1cnJlbmN5cGF0dGVybicpKSB7XG4gICAgICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgdG9DdXJyZW5jeTogJyR7YXR0cnMuZ2V0KCdjdXJyZW5jeXBhdHRlcm4nKX1gO1xuXG4gICAgICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnZnJhY3Rpb25zaXplJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29sRXhwcmVzc2lvbiArPSBgJzogJHthdHRycy5nZXQoJ2ZyYWN0aW9uc2l6ZScpfX19YDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2xFeHByZXNzaW9uICs9IGAnfX1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdudW1iZXJUb1N0cmluZyc6XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdmcmFjdGlvbnNpemUnKSkge1xuICAgICAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IG51bWJlclRvU3RyaW5nOiAnJHthdHRycy5nZXQoJ2ZyYWN0aW9uc2l6ZScpfSd9fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3RyaW5nVG9OdW1iZXInOlxuICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgc3RyaW5nVG9OdW1iZXJ9fWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGltZUZyb21Ob3cnOlxuICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgdGltZUZyb21Ob3d9fWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncHJlZml4JzpcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ3ByZWZpeCcpKSB7XG4gICAgICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgcHJlZml4OiAnJHthdHRycy5nZXQoJ3ByZWZpeCcpfSd9fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3VmZml4JzpcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ3N1ZmZpeCcpKSB7XG4gICAgICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgc3VmZml4OiAnJHthdHRycy5nZXQoJ3N1ZmZpeCcpfSd9fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGNvbEV4cHJlc3Npb247XG59O1xuXG5yZWdpc3Rlcignd20tdGFibGUtY29sdW1uJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVzOiBbJ3dtLXRhYmxlJ10sXG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCwgc2hhcmVkKSA9PiB7XG4gICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBub2RlIGhhcyBjaGlsZHJlbiwgYnV0IGFuIGVtcHR5IHRleHQgbm9kZSBkb250IGdlbmVyYXRlIGN1c3RvbSBleHByZXNzaW9uXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIG5vZGUuY2hpbGRyZW5bMF0gaW5zdGFuY2VvZiBUZXh0ICYmIChub2RlLmNoaWxkcmVuWzBdIGFzIFRleHQpLnZhbHVlLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzaGFyZWQuc2V0KCdjdXN0b21FeHByZXNzaW9uJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYWRkTmdNb2RlbFN0YW5kYWxvbmUobm9kZS5jaGlsZHJlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogKGF0dHJzLCBzaGFyZWQsIHBhcmVudFRhYmxlKSA9PiB7XG4gICAgICAgICAgICBsZXQgcm93RmlsdGVyVG1wbCA9ICcnO1xuICAgICAgICAgICAgbGV0IGlubGluZUVkaXRUbXBsID0gJyc7XG4gICAgICAgICAgICBsZXQgaW5saW5lTmV3RWRpdFRtcGwgPSAnJztcbiAgICAgICAgICAgIGxldCBwYXJlbnRGb3JtID0gJyc7XG4gICAgICAgICAgICBpZiAocGFyZW50VGFibGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwQ291bnRlciA9IHBhcmVudFRhYmxlLmdldCgndGFibGVfcmVmZXJlbmNlJyk7XG4gICAgICAgICAgICAgICAgcm93RmlsdGVyVG1wbCA9IChwYXJlbnRUYWJsZS5nZXQoJ2ZpbHRlcm1vZGUnKSA9PT0gJ211bHRpY29sdW1uJyAmJiBhdHRycy5nZXQoJ3NlYXJjaGFibGUnKSAhPT0gJ2ZhbHNlJykgPyBnZXRGaWx0ZXJUZW1wbGF0ZShhdHRycywgcENvdW50ZXIpIDogJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgZWRpdE1vZGUgPSBwYXJlbnRUYWJsZS5nZXQoJ2VkaXRtb2RlJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNJbmxpbmVFZGl0ID0gKGVkaXRNb2RlICE9PSBFRElUX01PREUuRElBTE9HICYmIGVkaXRNb2RlICE9PSBFRElUX01PREUuRk9STSAmJiBhdHRycy5nZXQoJ3JlYWRvbmx5JykgIT09ICd0cnVlJyk7XG4gICAgICAgICAgICAgICAgaW5saW5lRWRpdFRtcGwgPSBpc0lubGluZUVkaXQgPyBnZXRJbmxpbmVFZGl0V2lkZ2V0VG1wbChhdHRycywgZmFsc2UsIHBDb3VudGVyKSA6ICcnO1xuICAgICAgICAgICAgICAgIGlubGluZU5ld0VkaXRUbXBsID0gaXNJbmxpbmVFZGl0ICYmIGVkaXRNb2RlID09PSBFRElUX01PREUuUVVJQ0tfRURJVCAmJiBwYXJlbnRUYWJsZS5nZXQoJ3Nob3duZXdyb3cnKSAhPT0gJ2ZhbHNlJyA/IGdldElubGluZUVkaXRXaWRnZXRUbXBsKGF0dHJzLCB0cnVlKSA6ICcnO1xuICAgICAgICAgICAgICAgIHBhcmVudEZvcm0gPSBgIFtmb3JtR3JvdXBdPVwiJHtwQ291bnRlcn0ubmdmb3JtXCIgYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdFBhdHRlcm4gPSBhdHRycy5nZXQoJ2Zvcm1hdHBhdHRlcm4nKTtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUV4cHIgPSBgPG5nLXRlbXBsYXRlICNjdXN0b21FeHByVG1wbCBsZXQtcm93PVwicm93XCIgbGV0LWNvbERlZj1cImNvbERlZlwiIGxldC1lZGl0Um93PVwiZWRpdFJvd1wiIGxldC1kZWxldGVSb3c9XCJkZWxldGVSb3dcIiBsZXQtYWRkTmV3Um93PVwiYWRkTmV3Um93XCI+YDtcbiAgICAgICAgICAgIGxldCBjdXN0b21FeHByVG1wbCA9ICcnO1xuICAgICAgICAgICAgbGV0IGZvcm1hdEV4cHJUbXBsID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChzaGFyZWQuZ2V0KCdjdXN0b21FeHByZXNzaW9uJykpIHtcbiAgICAgICAgICAgICAgICBhdHRycy5zZXQoJ2N1c3RvbUV4cHJlc3Npb24nLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIGN1c3RvbUV4cHJUbXBsID0gYCR7Y3VzdG9tRXhwcn08ZGl2IGRhdGEtY29sLWlkZW50aWZpZXI9XCIke2F0dHJzLmdldCgnYmluZGluZycpfVwiPmA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChmb3JtYXRQYXR0ZXJuICYmIGZvcm1hdFBhdHRlcm4gIT09ICdOb25lJykgfHwgaXNEYXRlVGltZVR5cGUoYXR0cnMuZ2V0KCd0eXBlJykpKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0RXhwclRtcGwgPSBnZXRGb3JtYXRFeHByZXNzaW9uKGF0dHJzKTtcbiAgICAgICAgICAgICAgICBpZiAoZm9ybWF0RXhwclRtcGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hhcmVkLnNldCgnY3VzdG9tRXhwcmVzc2lvbicsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBhdHRycy5zZXQoJ2N1c3RvbUV4cHJlc3Npb24nLCAndHJ1ZScpO1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21FeHByVG1wbCA9IGAke2N1c3RvbUV4cHJ9PGRpdiBkYXRhLWNvbC1pZGVudGlmaWVyPVwiJHthdHRycy5nZXQoJ2JpbmRpbmcnKX1cIiB0aXRsZT1cIiR7Zm9ybWF0RXhwclRtcGx9XCI+JHtmb3JtYXRFeHByVG1wbH1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGA8JHt0YWdOYW1lfSB3bVRhYmxlQ29sdW1uICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9ICR7cGFyZW50Rm9ybX0+XG4gICAgICAgICAgICAgICAgICAgICR7cm93RmlsdGVyVG1wbH1cbiAgICAgICAgICAgICAgICAgICAgJHtpbmxpbmVFZGl0VG1wbH1cbiAgICAgICAgICAgICAgICAgICAgJHtpbmxpbmVOZXdFZGl0VG1wbH1cbiAgICAgICAgICAgICAgICAgICAgJHtjdXN0b21FeHByVG1wbH1gO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0OiAoYXR0cnMsIHNoYXJlZCkgPT4ge1xuICAgICAgICAgICAgbGV0IGN1c3RvbUV4cHJUbXBsID0gJyc7XG5cbiAgICAgICAgICAgIGlmIChzaGFyZWQuZ2V0KCdjdXN0b21FeHByZXNzaW9uJykpIHtcbiAgICAgICAgICAgICAgICBjdXN0b21FeHByVG1wbCA9IGA8L2Rpdj48L25nLXRlbXBsYXRlPmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYCR7Y3VzdG9tRXhwclRtcGx9PC8ke3RhZ05hbWV9PmA7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19