import { Attribute, Text } from '@angular/compiler';
import { DataType, FormWidgetType, getFormWidgetTemplate, IDGenerator, isDateTimeType } from '@wm/core';
import { getAttrMarkup, getDataSource, register } from '@wm/transpiler';
import { EDIT_MODE, getDataTableFilterWidget, getEditModeWidget } from '../../../../utils/live-utils';
var tagName = 'div';
var idGen = new IDGenerator('data_table_form_');
var formWidgets = new Set([
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
        if (formWidgets.has(childNode.name)) {
            childNode.attrs.push(new Attribute('[ngModelOptions]', '{standalone: true}', 1, 1));
        }
        addNgModelStandalone(childNode.children);
    });
};
var ɵ0 = addNgModelStandalone;
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
var ɵ1 = getFilterTemplate;
var getEventsTmpl = function (attrs) {
    var tmpl = '';
    attrs.forEach(function (val, key) {
        if (key.endsWith('.event')) {
            tmpl += key + "=\"" + val + "\" ";
        }
    });
    return tmpl;
};
var ɵ2 = getEventsTmpl;
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
var ɵ3 = getInlineEditRowPropsTmpl;
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
            formName: idGen.nextUid(),
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
var ɵ4 = getInlineEditWidgetTmpl;
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
var ɵ5 = getFormatExpression;
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
            return "<" + tagName + " wmTableColumn " + getAttrMarkup(attrs) + " " + parentForm + ">\n                    " + rowFilterTmpl + "\n                    " + inlineEditTmpl + "\n                    " + inlineNewEditTmpl + "\n                    " + customExprTmpl;
        },
        post: function (attrs, shared) {
            var customExprTmpl = '';
            if (shared.get('customExpression')) {
                customExprTmpl = "</div></ng-template>";
            }
            return customExprTmpl + "</" + tagName + ">";
        }
    };
});
export default (function () { });
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS1jb2x1bW4vdGFibGUtY29sdW1uLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVcsSUFBSSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFN0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUscUJBQXFCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN4RyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkYsT0FBTyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXRHLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2xELElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3hCLFNBQVM7SUFDVCxhQUFhO0lBQ2IsYUFBYTtJQUNiLFdBQVc7SUFDWCxhQUFhO0lBQ2IsV0FBVztJQUNYLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLFNBQVM7SUFDVCxTQUFTO0lBQ1QsY0FBYztJQUNkLFdBQVc7SUFDWCxhQUFhO0lBQ2IsV0FBVztJQUNYLFVBQVU7SUFDVixnQkFBZ0I7Q0FDbkIsQ0FBQyxDQUFDO0FBRUgsbUdBQW1HO0FBQ25HLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxRQUFhO0lBQWIseUJBQUEsRUFBQSxhQUFhO0lBQ3ZDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTO1FBQ3RCLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxD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QztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZ0JBQWUsY0FBTyxDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIEVsZW1lbnQsIFRleHQgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7IERhdGFUeXBlLCBGb3JtV2lkZ2V0VHlwZSwgZ2V0Rm9ybVdpZGdldFRlbXBsYXRlLCBJREdlbmVyYXRvciwgaXNEYXRlVGltZVR5cGUgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBnZXREYXRhU291cmNlLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuaW1wb3J0IHsgRURJVF9NT0RFLCBnZXREYXRhVGFibGVGaWx0ZXJXaWRnZXQsIGdldEVkaXRNb2RlV2lkZ2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcbmNvbnN0IGlkR2VuID0gbmV3IElER2VuZXJhdG9yKCdkYXRhX3RhYmxlX2Zvcm1fJyk7XG5jb25zdCBmb3JtV2lkZ2V0cyA9IG5ldyBTZXQoW1xuICAgICd3bS10ZXh0JyxcbiAgICAnd20tdGV4dGFyZWEnLFxuICAgICd3bS1jaGVja2JveCcsXG4gICAgJ3dtLXNsaWRlcicsXG4gICAgJ3dtLWN1cnJlbmN5JyxcbiAgICAnd20tc3dpdGNoJyxcbiAgICAnd20tc2VsZWN0JyxcbiAgICAnd20tY2hlY2tib3hzZXQnLFxuICAgICd3bS1yYWRpb3NldCcsXG4gICAgJ3dtLWRhdGUnLFxuICAgICd3bS10aW1lJyxcbiAgICAnd20tdGltZXN0YW1wJyxcbiAgICAnd20tcmF0aW5nJyxcbiAgICAnd20tZGF0ZXRpbWUnLFxuICAgICd3bS1zZWFyY2gnLFxuICAgICd3bS1jaGlwcycsXG4gICAgJ3dtLWNvbG9ycGlja2VyJ1xuXSk7XG5cbi8vIEFkZCBuZ01vZGVsT3B0aW9ucyBzdGFuZGFsb25lIHRydWUgYXMgaW5uZXIgY3VzdG9tIGZvcm0gd2lkZ2V0cyB3aWxsIGJlIG5vdCBwYXJ0IG9mIHRhYmxlIG5nZm9ybVxuY29uc3QgYWRkTmdNb2RlbFN0YW5kYWxvbmUgPSAoY2hpbGRyZW4gPSBbXSkgPT4ge1xuICAgIGNoaWxkcmVuLmZvckVhY2goY2hpbGROb2RlID0+IHtcbiAgICAgICAgaWYgKGZvcm1XaWRnZXRzLmhhcyhjaGlsZE5vZGUubmFtZSkpIHtcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hdHRycy5wdXNoKG5ldyBBdHRyaWJ1dGUoJ1tuZ01vZGVsT3B0aW9uc10nLCAne3N0YW5kYWxvbmU6IHRydWV9JywgPGFueT4xLCA8YW55PjEpKTtcbiAgICAgICAgfVxuICAgICAgICBhZGROZ01vZGVsU3RhbmRhbG9uZShjaGlsZE5vZGUuY2hpbGRyZW4pO1xuICAgIH0pO1xufTtcblxuLy8gZ2V0IHRoZSBmaWx0ZXIgdGVtcGxhdGUgKHdpZGdldCBhbmQgZmlsdGVyIG1lbnUpIHRvIGJlIGRpc3BsYXllZCBpbiBmaWx0ZXIgcm93XG5jb25zdCBnZXRGaWx0ZXJUZW1wbGF0ZSA9IChhdHRycywgcENvdW50ZXIpICA9PiB7XG4gICAgY29uc3Qgd2lkZ2V0ID0gYXR0cnMuZ2V0KCdmaWx0ZXJ3aWRnZXQnKSB8fCBnZXREYXRhVGFibGVGaWx0ZXJXaWRnZXQoYXR0cnMuZ2V0KCd0eXBlJykgfHwgRGF0YVR5cGUuU1RSSU5HKTtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBhdHRycy5nZXQoJ2JpbmRpbmcnKTtcbiAgICBjb25zdCB0eXBlID0gYXR0cnMuZ2V0KCd0eXBlJykgfHwgJ3N0cmluZyc7XG4gICAgbGV0IGRhdGFzb3VyY2VCaW5kaW5nLCBzdWJtaXRFdmVudEJpbmRpbmc7XG4gICAgY29uc3QgZGF0YXNldEF0dHIgPSBhdHRycy5nZXQoJ2ZpbHRlcmRhdGFzZXQuYmluZCcpO1xuICAgIC8vIHdoZW4gbXVsdGljb2x1bW4gaXMgc2VsZWN0ZWQgYW5kIGZpbHRlcndpZGdldCBhcyBhdXRvY29tcGxldGUgaXMgYXNzaWduZWQgdG8gZGF0YXNldC5cbiAgICBpZiAoYXR0cnMuZ2V0KCdmaWx0ZXJ3aWRnZXQnKSA9PT0gJ2F1dG9jb21wbGV0ZScpIHtcbiAgICAgICAgaWYgKGRhdGFzZXRBdHRyKSB7XG4gICAgICAgICAgICBjb25zdCBiaW5kZGF0YXNvdXJjZSA9IGdldERhdGFTb3VyY2UoZGF0YXNldEF0dHIpO1xuICAgICAgICAgICAgZGF0YXNvdXJjZUJpbmRpbmcgPSBgZGF0YXNldC5iaW5kPVwiJHtkYXRhc2V0QXR0cn1cIiBkYXRhc291cmNlLmJpbmQ9XCIke2JpbmRkYXRhc291cmNlfVwiYDtcbiAgICAgICAgfVxuICAgICAgICBzdWJtaXRFdmVudEJpbmRpbmcgPSBgc3VibWl0LmV2ZW50PVwiY2hhbmdlRm4oJyR7ZmllbGROYW1lfScpXCJgO1xuICAgIH1cbiAgICBjb25zdCBpbm5lclRtcGwgPSBgI2ZpbHRlcldpZGdldCBmb3JtQ29udHJvbE5hbWU9XCIke2ZpZWxkTmFtZSArICdfZmlsdGVyJ31cIiAke2RhdGFzb3VyY2VCaW5kaW5nfSAke3N1Ym1pdEV2ZW50QmluZGluZ30gY2hhbmdlLmV2ZW50PVwiY2hhbmdlRm4oJyR7ZmllbGROYW1lfScpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkLmJpbmQ9XCJpc0Rpc2FibGVkKCcke2ZpZWxkTmFtZX0nKVwiYDtcbiAgICBjb25zdCBvcHRpb25zID0ge2lucHV0VHlwZTogJ2ZpbHRlcmlucHV0dHlwZSd9IDtcbiAgICBjb25zdCB3aWRnZXRUbXBsID0gYCR7Z2V0Rm9ybVdpZGdldFRlbXBsYXRlKHdpZGdldCwgaW5uZXJUbXBsLCBhdHRycywgb3B0aW9ucyl9YDtcblxuICAgIHJldHVybiBgPG5nLXRlbXBsYXRlICNmaWx0ZXJUbXBsIGxldC1jaGFuZ2VGbj1cImNoYW5nZUZuXCIgbGV0LWlzRGlzYWJsZWQ9XCJpc0Rpc2FibGVkXCI+XG4gICAgPGRpdiBjbGFzcz1cImlucHV0LWdyb3VwICR7d2lkZ2V0fVwiIGRhdGEtY29sLWlkZW50aWZpZXI9XCIke2ZpZWxkTmFtZX1cIj5cbiAgICAgICAgJHt3aWRnZXRUbXBsfVxuICAgICAgICA8c3BhbiBjbGFzcz1cImlucHV0LWdyb3VwLWFkZG9uIGZpbHRlci1jbGVhci1pY29uXCIgKm5nSWY9XCIke3BDb3VudGVyfS5zaG93Q2xlYXJJY29uKCcke2ZpZWxkTmFtZX0nKVwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0bi10cmFuc3BhcmVudCBidG4gYXBwLWJ1dHRvblwiIGFyaWEtbGFiZWw9XCJDbGVhciBidXR0b25cIiB0eXBlPVwiYnV0dG9uXCIgKGNsaWNrKT1cIiR7cENvdW50ZXJ9LmNsZWFyUm93RmlsdGVyKCcke2ZpZWxkTmFtZX0nKVwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiYXBwLWljb24gd2kgd2ktY2xlYXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnB1dC1ncm91cC1hZGRvblwiIGRyb3Bkb3duIGNvbnRhaW5lcj1cImJvZHlcIj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4tdHJhbnNwYXJlbnQgYnRuIGFwcC1idXR0b25cIiB0eXBlPVwiYnV0dG9uXCIgZHJvcGRvd25Ub2dnbGU+PGkgY2xhc3M9XCJhcHAtaWNvbiB3aSB3aS1maWx0ZXItbGlzdFwiPjwvaT48L2J1dHRvbj5cbiAgICAgICAgICAgIDx1bCBjbGFzcz1cIm1hdGNobW9kZS1kcm9wZG93biBkcm9wZG93bi1tZW51XCIgKmRyb3Bkb3duTWVudT5cbiAgICAgICAgICAgICAgICAgICA8bGkgKm5nRm9yPVwibGV0IG1hdGNoTW9kZSBvZiAke3BDb3VudGVyfS5tYXRjaE1vZGVUeXBlc01hcFsnJHt0eXBlfSddXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInthY3RpdmU6IG1hdGNoTW9kZSA9PT0gKCR7cENvdW50ZXJ9LnJvd0ZpbHRlclsnJHtmaWVsZE5hbWV9J10ubWF0Y2hNb2RlIHx8ICR7cENvdW50ZXJ9Lm1hdGNoTW9kZVR5cGVzTWFwWycke3R5cGV9J11bMF0pfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIiAoY2xpY2spPVwiJHtwQ291bnRlcn0ub25GaWx0ZXJDb25kaXRpb25TZWxlY3QoJyR7ZmllbGROYW1lfScsIG1hdGNoTW9kZSlcIiBbaW5uZXJUZXh0XT1cIiR7cENvdW50ZXJ9Lm1hdGNoTW9kZU1zZ3NbbWF0Y2hNb2RlXVwiPjwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICA8L3VsPlxuICAgICAgICA8L3NwYW4+XG4gICAgPC9kaXY+PC9uZy10ZW1wbGF0ZT5gO1xufTtcblxuY29uc3QgZ2V0RXZlbnRzVG1wbCA9IGF0dHJzID0+IHtcbiAgICBsZXQgdG1wbCA9ICcnO1xuICAgIGF0dHJzLmZvckVhY2goKHZhbCwga2V5KSA9PiB7XG4gICAgICAgIGlmIChrZXkuZW5kc1dpdGgoJy5ldmVudCcpKSB7XG4gICAgICAgICAgICB0bXBsICs9IGAke2tleX09XCIke3ZhbH1cIiBgO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRtcGw7XG59O1xuXG4vLyBHZW5lcmF0ZSBpbmxpbmUgZWRpdCBwcm9wZXJ0aWVzIHRlbXBsYXRlLiBQcm9wZXJ0aWVzIHJlcXVpcmluZyByb3cgaW5zdGFuY2UgYXJlIGdlbmVyYXRlZCBoZXJlLlxuY29uc3QgZ2V0SW5saW5lRWRpdFJvd1Byb3BzVG1wbCA9IGF0dHJzID0+IHtcbiAgICBjb25zdCBwcm9wQXR0cnMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgcHJvcHMgPSBbJ2Rpc2FibGVkJywgJ2Rpc2FibGVkLmJpbmQnXTtcbiAgICBwcm9wcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBpZiAoYXR0cnMuZ2V0KHByb3ApKSB7XG4gICAgICAgICAgICBwcm9wQXR0cnMuc2V0KHByb3AsIGF0dHJzLmdldChwcm9wKSk7XG4gICAgICAgICAgICBhdHRycy5kZWxldGUocHJvcCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZ2V0QXR0ck1hcmt1cChwcm9wQXR0cnMpO1xufTtcblxuLy8gZ2V0IHRoZSBpbmxpbmUgd2lkZ2V0IHRlbXBsYXRlXG5jb25zdCBnZXRJbmxpbmVFZGl0V2lkZ2V0VG1wbCA9IChhdHRycywgaXNOZXdSb3c/LCBwQ291bnRlcj8pID0+IHtcbiAgICBjb25zdCBvcHRpb25zOiBhbnkgPSB7fTtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBhdHRycy5nZXQoJ2JpbmRpbmcnKTtcbiAgICBjb25zdCB3aWRnZXQgPSBhdHRycy5nZXQoJ2VkaXQtd2lkZ2V0LXR5cGUnKSB8fCBnZXRFZGl0TW9kZVdpZGdldCh7XG4gICAgICAgICd0eXBlJzogYXR0cnMuZ2V0KCd0eXBlJyksXG4gICAgICAgICdyZWxhdGVkLWVudGl0eS1uYW1lJzogYXR0cnMuZ2V0KCdyZWxhdGVkLWVudGl0eS1uYW1lJyksXG4gICAgICAgICdwcmltYXJ5LWtleSc6IGF0dHJzLmdldCgncHJpbWFyeS1rZXknKVxuICAgIH0pO1xuICAgIGxldCB3aWRnZXRSZWYgPSAnJztcbiAgICBsZXQgZm9ybUNvbnRyb2wgPSAnJztcbiAgICBsZXQgd21Gb3JtV2lkZ2V0ID0gJyc7XG4gICAgaWYgKHdpZGdldCA9PT0gRm9ybVdpZGdldFR5cGUuVVBMT0FEKSB7XG4gICAgICAgIG9wdGlvbnMudXBsb2FkUHJvcHMgPSB7XG4gICAgICAgICAgICBmb3JtTmFtZTogaWRHZW4ubmV4dFVpZCgpLFxuICAgICAgICAgICAgbmFtZTogZmllbGROYW1lXG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMuY291bnRlciA9IHBDb3VudGVyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZGdldFJlZiA9IGlzTmV3Um93ID8gJyNpbmxpbmVXaWRnZXROZXcnIDogJyNpbmxpbmVXaWRnZXQnO1xuICAgICAgICBmb3JtQ29udHJvbCA9IGlzTmV3Um93ID8gYGZvcm1Db250cm9sTmFtZT1cIiR7ZmllbGROYW1lfV9uZXdcImAgOiBgZm9ybUNvbnRyb2xOYW1lPVwiJHtmaWVsZE5hbWV9XCJgO1xuICAgICAgICB3bUZvcm1XaWRnZXQgPSAnd21Gb3JtV2lkZ2V0JztcbiAgICB9XG4gICAgb3B0aW9ucy5pbnB1dFR5cGUgPSAnZWRpdGlucHV0dHlwZSc7XG4gICAgY29uc3QgdG1wbFJlZiA9IGlzTmV3Um93ID8gJyNpbmxpbmVXaWRnZXRUbXBsTmV3JyA6ICcjaW5saW5lV2lkZ2V0VG1wbCc7XG4gICAgY29uc3QgZXZlbnRzVG1wbCA9IHdpZGdldCA9PT0gRm9ybVdpZGdldFR5cGUuVVBMT0FEID8gJycgOiBnZXRFdmVudHNUbXBsKGF0dHJzKTtcbiAgICBjb25zdCByb3dQcm9wc1RsID0gZ2V0SW5saW5lRWRpdFJvd1Byb3BzVG1wbChhdHRycyk7XG4gICAgY29uc3QgaW5uZXJUbXBsID0gYCR7d2lkZ2V0UmVmfSAke3dtRm9ybVdpZGdldH0ga2V5PVwiJHtmaWVsZE5hbWV9XCIgZGF0YS1maWVsZC1uYW1lPVwiJHtmaWVsZE5hbWV9XCIgJHtmb3JtQ29udHJvbH0gJHtldmVudHNUbXBsfSAke3Jvd1Byb3BzVGx9YDtcbiAgICBjb25zdCB3aWRnZXRUbXBsID0gZ2V0Rm9ybVdpZGdldFRlbXBsYXRlKHdpZGdldCwgaW5uZXJUbXBsLCBhdHRycywgb3B0aW9ucyk7XG5cbiAgICByZXR1cm4gYDxuZy10ZW1wbGF0ZSAke3RtcGxSZWZ9IGxldC1yb3c9XCJyb3dcIiBsZXQtZ2V0Q29udHJvbD1cImdldENvbnRyb2xcIiBsZXQtZ2V0VmFsaWRhdGlvbk1lc3NhZ2U9XCJnZXRWYWxpZGF0aW9uTWVzc2FnZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgZGF0YS1jb2wtaWRlbnRpZmllcj1cIiR7ZmllbGROYW1lfVwiID5cbiAgICAgICAgICAgICAgICAgICAgICR7d2lkZ2V0VG1wbH1cbiAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHBsYWNlbWVudD1cInRvcFwiIGNvbnRhaW5lcj1cImJvZHlcIiB0b29sdGlwPVwie3tnZXRWYWxpZGF0aW9uTWVzc2FnZSgpfX1cIiBjbGFzcz1cInRleHQtZGFuZ2VyIHdpIHdpLWVycm9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICpuZ0lmPVwiZ2V0VmFsaWRhdGlvbk1lc3NhZ2UoKSAmJiBnZXRDb250cm9sKCkgJiYgZ2V0Q29udHJvbCgpLmludmFsaWQgJiYgZ2V0Q29udHJvbCgpLnRvdWNoZWRcIj5cbiAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3Itb25seVwiICpuZ0lmPVwiZ2V0VmFsaWRhdGlvbk1lc3NhZ2UoKVwiPnt7Z2V0VmFsaWRhdGlvbk1lc3NhZ2UoKX19PC9zcGFuPlxuICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+YDtcbn07XG5cbmNvbnN0IGdldEZvcm1hdEV4cHJlc3Npb24gPSAoYXR0cnMpID0+IHtcbiAgICBjb25zdCBjb2x1bW5WYWx1ZSA9IGByb3cuZ2V0UHJvcGVydHkoJyR7YXR0cnMuZ2V0KCdiaW5kaW5nJyl9JylgO1xuICAgIGxldCBmb3JtYXRQYXR0ZXJuID0gYXR0cnMuZ2V0KCdmb3JtYXRwYXR0ZXJuJyk7XG4gICAgbGV0IGNvbEV4cHJlc3Npb24gPSAnJztcbiAgICAvLyBGb3IgZGF0ZSB0aW1lIGRhdGEgdHlwZXMsIGlmIGZvcm1hdCBwYXR0ZXJuIGlzIG5vdCBhcHBsaWVkLCBBcHBseSBkZWZhdWx0IHRvRGF0ZSBmb3JtYXRcbiAgICBpZiAoaXNEYXRlVGltZVR5cGUoYXR0cnMuZ2V0KCd0eXBlJykpICYmICghZm9ybWF0UGF0dGVybiB8fCBmb3JtYXRQYXR0ZXJuID09PSAnTm9uZScpKSB7XG4gICAgICAgIGF0dHJzLnNldCgnZm9ybWF0cGF0dGVybicsICd0b0RhdGUnKTtcbiAgICAgICAgYXR0cnMuZGVsZXRlKCdkYXRlcGF0dGVybicpO1xuICAgICAgICBmb3JtYXRQYXR0ZXJuID0gJ3RvRGF0ZSc7XG4gICAgfVxuICAgIHN3aXRjaCAoZm9ybWF0UGF0dGVybikge1xuICAgICAgICBjYXNlICd0b0RhdGUnOlxuICAgICAgICAgICAgY29sRXhwcmVzc2lvbiA9IGB7eyR7Y29sdW1uVmFsdWV9IHwgdG9EYXRlOiBjb2xEZWYuZGF0ZXBhdHRlcm59fWA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG9DdXJyZW5jeSc6XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdjdXJyZW5jeXBhdHRlcm4nKSkge1xuICAgICAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IHRvQ3VycmVuY3k6ICcke2F0dHJzLmdldCgnY3VycmVuY3lwYXR0ZXJuJyl9YDtcblxuICAgICAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2ZyYWN0aW9uc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gKz0gYCc6ICR7YXR0cnMuZ2V0KCdmcmFjdGlvbnNpemUnKX19fWA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29sRXhwcmVzc2lvbiArPSBgJ319YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbnVtYmVyVG9TdHJpbmcnOlxuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnZnJhY3Rpb25zaXplJykpIHtcbiAgICAgICAgICAgICAgICBjb2xFeHByZXNzaW9uID0gYHt7JHtjb2x1bW5WYWx1ZX0gfCBudW1iZXJUb1N0cmluZzogJyR7YXR0cnMuZ2V0KCdmcmFjdGlvbnNpemUnKX0nfX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3N0cmluZ1RvTnVtYmVyJzpcbiAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IHN0cmluZ1RvTnVtYmVyfX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RpbWVGcm9tTm93JzpcbiAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IHRpbWVGcm9tTm93fX1gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ByZWZpeCc6XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdwcmVmaXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IHByZWZpeDogJyR7YXR0cnMuZ2V0KCdwcmVmaXgnKX0nfX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3N1ZmZpeCc6XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdzdWZmaXgnKSkge1xuICAgICAgICAgICAgICAgIGNvbEV4cHJlc3Npb24gPSBge3ske2NvbHVtblZhbHVlfSB8IHN1ZmZpeDogJyR7YXR0cnMuZ2V0KCdzdWZmaXgnKX0nfX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBjb2xFeHByZXNzaW9uO1xufTtcblxucmVnaXN0ZXIoJ3dtLXRhYmxlLWNvbHVtbicsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlczogWyd3bS10YWJsZSddLFxuICAgICAgICB0ZW1wbGF0ZTogKG5vZGU6IEVsZW1lbnQsIHNoYXJlZCkgPT4ge1xuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgbm9kZSBoYXMgY2hpbGRyZW4sIGJ1dCBhbiBlbXB0eSB0ZXh0IG5vZGUgZG9udCBnZW5lcmF0ZSBjdXN0b20gZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBub2RlLmNoaWxkcmVuWzBdIGluc3RhbmNlb2YgVGV4dCAmJiAobm9kZS5jaGlsZHJlblswXSBhcyBUZXh0KS52YWx1ZS50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hhcmVkLnNldCgnY3VzdG9tRXhwcmVzc2lvbicsIHRydWUpO1xuICAgICAgICAgICAgICAgIGFkZE5nTW9kZWxTdGFuZGFsb25lKG5vZGUuY2hpbGRyZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmU6IChhdHRycywgc2hhcmVkLCBwYXJlbnRUYWJsZSkgPT4ge1xuICAgICAgICAgICAgbGV0IHJvd0ZpbHRlclRtcGwgPSAnJztcbiAgICAgICAgICAgIGxldCBpbmxpbmVFZGl0VG1wbCA9ICcnO1xuICAgICAgICAgICAgbGV0IGlubGluZU5ld0VkaXRUbXBsID0gJyc7XG4gICAgICAgICAgICBsZXQgcGFyZW50Rm9ybSA9ICcnO1xuICAgICAgICAgICAgaWYgKHBhcmVudFRhYmxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcENvdW50ZXIgPSBwYXJlbnRUYWJsZS5nZXQoJ3RhYmxlX3JlZmVyZW5jZScpO1xuICAgICAgICAgICAgICAgIHJvd0ZpbHRlclRtcGwgPSAocGFyZW50VGFibGUuZ2V0KCdmaWx0ZXJtb2RlJykgPT09ICdtdWx0aWNvbHVtbicgJiYgYXR0cnMuZ2V0KCdzZWFyY2hhYmxlJykgIT09ICdmYWxzZScpID8gZ2V0RmlsdGVyVGVtcGxhdGUoYXR0cnMsIHBDb3VudGVyKSA6ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRNb2RlID0gcGFyZW50VGFibGUuZ2V0KCdlZGl0bW9kZScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzSW5saW5lRWRpdCA9IChlZGl0TW9kZSAhPT0gRURJVF9NT0RFLkRJQUxPRyAmJiBlZGl0TW9kZSAhPT0gRURJVF9NT0RFLkZPUk0gJiYgYXR0cnMuZ2V0KCdyZWFkb25seScpICE9PSAndHJ1ZScpO1xuICAgICAgICAgICAgICAgIGlubGluZUVkaXRUbXBsID0gaXNJbmxpbmVFZGl0ID8gZ2V0SW5saW5lRWRpdFdpZGdldFRtcGwoYXR0cnMsIGZhbHNlLCBwQ291bnRlcikgOiAnJztcbiAgICAgICAgICAgICAgICBpbmxpbmVOZXdFZGl0VG1wbCA9IGlzSW5saW5lRWRpdCAmJiBlZGl0TW9kZSA9PT0gRURJVF9NT0RFLlFVSUNLX0VESVQgJiYgcGFyZW50VGFibGUuZ2V0KCdzaG93bmV3cm93JykgIT09ICdmYWxzZScgPyBnZXRJbmxpbmVFZGl0V2lkZ2V0VG1wbChhdHRycywgdHJ1ZSkgOiAnJztcbiAgICAgICAgICAgICAgICBwYXJlbnRGb3JtID0gYCBbZm9ybUdyb3VwXT1cIiR7cENvdW50ZXJ9Lm5nZm9ybVwiIGA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmb3JtYXRQYXR0ZXJuID0gYXR0cnMuZ2V0KCdmb3JtYXRwYXR0ZXJuJyk7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FeHByID0gYDxuZy10ZW1wbGF0ZSAjY3VzdG9tRXhwclRtcGwgbGV0LXJvdz1cInJvd1wiIGxldC1jb2xEZWY9XCJjb2xEZWZcIiBsZXQtZWRpdFJvdz1cImVkaXRSb3dcIiBsZXQtZGVsZXRlUm93PVwiZGVsZXRlUm93XCIgbGV0LWFkZE5ld1Jvdz1cImFkZE5ld1Jvd1wiPmA7XG4gICAgICAgICAgICBsZXQgY3VzdG9tRXhwclRtcGwgPSAnJztcbiAgICAgICAgICAgIGxldCBmb3JtYXRFeHByVG1wbCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoc2hhcmVkLmdldCgnY3VzdG9tRXhwcmVzc2lvbicpKSB7XG4gICAgICAgICAgICAgICAgYXR0cnMuc2V0KCdjdXN0b21FeHByZXNzaW9uJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICBjdXN0b21FeHByVG1wbCA9IGAke2N1c3RvbUV4cHJ9PGRpdiBkYXRhLWNvbC1pZGVudGlmaWVyPVwiJHthdHRycy5nZXQoJ2JpbmRpbmcnKX1cIj5gO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZm9ybWF0UGF0dGVybiAmJiBmb3JtYXRQYXR0ZXJuICE9PSAnTm9uZScpIHx8IGlzRGF0ZVRpbWVUeXBlKGF0dHJzLmdldCgndHlwZScpKSkge1xuICAgICAgICAgICAgICAgIGZvcm1hdEV4cHJUbXBsID0gZ2V0Rm9ybWF0RXhwcmVzc2lvbihhdHRycyk7XG4gICAgICAgICAgICAgICAgaWYgKGZvcm1hdEV4cHJUbXBsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXJlZC5zZXQoJ2N1c3RvbUV4cHJlc3Npb24nLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnMuc2V0KCdjdXN0b21FeHByZXNzaW9uJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tRXhwclRtcGwgPSBgJHtjdXN0b21FeHByfTxkaXYgZGF0YS1jb2wtaWRlbnRpZmllcj1cIiR7YXR0cnMuZ2V0KCdiaW5kaW5nJyl9XCIgdGl0bGU9XCIke2Zvcm1hdEV4cHJUbXBsfVwiPiR7Zm9ybWF0RXhwclRtcGx9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBgPCR7dGFnTmFtZX0gd21UYWJsZUNvbHVtbiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfSAke3BhcmVudEZvcm19PlxuICAgICAgICAgICAgICAgICAgICAke3Jvd0ZpbHRlclRtcGx9XG4gICAgICAgICAgICAgICAgICAgICR7aW5saW5lRWRpdFRtcGx9XG4gICAgICAgICAgICAgICAgICAgICR7aW5saW5lTmV3RWRpdFRtcGx9XG4gICAgICAgICAgICAgICAgICAgICR7Y3VzdG9tRXhwclRtcGx9YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGxldCBjdXN0b21FeHByVG1wbCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAoc2hhcmVkLmdldCgnY3VzdG9tRXhwcmVzc2lvbicpKSB7XG4gICAgICAgICAgICAgICAgY3VzdG9tRXhwclRtcGwgPSBgPC9kaXY+PC9uZy10ZW1wbGF0ZT5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGAke2N1c3RvbUV4cHJUbXBsfTwvJHt0YWdOYW1lfT5gO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==