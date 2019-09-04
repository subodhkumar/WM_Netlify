import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, DataSource, DataType, debounce, FormWidgetType, getClonedObject, isDefined } from '@wm/core';
import { FormComponent } from '../form.component';
import { registerLiveFilterProps } from '../form.props';
import { applyFilterOnField, fetchDistinctValues, getDistinctValuesForField, getEmptyMatchMode, getEnableEmptyFilter, getRangeFieldValue, getRangeMatchMode } from '../../../../utils/data-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';
var FILTER_CONSTANTS = {
    'EMPTY_KEY': 'EMPTY_NULL_FILTER'
};
var noop = function () { };
var ɵ0 = noop;
var LiveFilterDirective = /** @class */ (function () {
    function LiveFilterDirective(form) {
        var _this = this;
        this.form = form;
        // debounce the filter function. If multiple filter calls are made at same time, calls will be delayed and last call is fired
        this._filter = debounce(function (options) {
            _this.filter(options);
        }, 250);
        form.clearFilter = this.clearFilter.bind(this);
        form.applyFilter = this.applyFilter.bind(this);
        form.filter = this.filter.bind(this);
        form.filterOnDefault = this.filterOnDefault.bind(this);
        form.execute = this.execute.bind(this);
        form.onFieldDefaultValueChange = this.onFieldDefaultValueChange.bind(this);
        form.onMaxDefaultValueChange = this.onMaxDefaultValueChange.bind(this);
        form.onDataSourceChange = this.onDataSourceChange.bind(this);
        form.onFieldValueChange = this.onFieldValueChange.bind(this);
        form.submitForm = this.submitForm.bind(this);
        form.registerFormWidget = this.registerFormWidget.bind(this);
    }
    LiveFilterDirective.prototype.execute = function (operation, options) {
        if (operation === DataSource.Operation.LIST_RECORDS || operation === DataSource.Operation.DOWNLOAD) {
            return this.applyFilter(options);
        }
        if (operation === DataSource.Operation.GET_OPTIONS) {
            return this._options || {};
        }
        if (operation === DataSource.Operation.GET_PAGING_OPTIONS) {
            return this.form.pagination;
        }
        if (!this.form.datasource) {
            return {};
        }
        if (operation === DataSource.Operation.FETCH_DISTINCT_VALUES) {
            return fetchDistinctValues(this.form.datasource, this.form.formFields, {
                widget: 'widgettype',
                enableemptyfilter: this.form.enableemptyfilter,
                EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
            });
        }
        return this.form.datasource.execute(operation, options);
    };
    LiveFilterDirective.prototype.onFieldDefaultValueChange = function (field, nv) {
        field.minValue = nv;
        field.value = nv;
        this.filterOnDefault();
    };
    LiveFilterDirective.prototype.onFieldValueChange = function (field, nv) {
        applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv, {
            EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
        });
        if (this.form.autoupdate && isDefined(nv)) {
            this._filter();
        }
    };
    LiveFilterDirective.prototype.onMaxDefaultValueChange = function () {
        var _this = this;
        setTimeout(function () {
            _this.filterOnDefault();
        });
    };
    LiveFilterDirective.prototype.onDataSourceChange = function () {
        var _this = this;
        var dataSource = this.form.datasource;
        if (!dataSource) {
            return;
        }
        this.form.formFields.forEach(function (field) {
            if (isDataSetWidget(field.widgettype)) {
                getDistinctValuesForField(dataSource, field.widget, {
                    widget: 'widgettype',
                    enableemptyfilter: _this.form.enableemptyfilter,
                    EMPTY_VALUE: _this.form.appLocale.LABEL_NO_VALUE
                });
                applyFilterOnField(dataSource, field.widget, _this.form.formFields, field.value, {
                    isFirst: true,
                    EMPTY_VALUE: _this.form.appLocale.LABEL_NO_VALUE
                });
            }
        });
        // On load check if default value exists and apply filter, Call the filter with the result options
        this._filter(this._options);
    };
    LiveFilterDirective.prototype.clearFilter = function () {
        var _this = this;
        this.form.resetFormState();
        this.form.formFields.forEach(function (filterField) {
            // Added check for range field
            if (!filterField.readonly && filterField.show) {
                if (filterField.widgettype === FormWidgetType.AUTOCOMPLETE || filterField.widgettype === FormWidgetType.TYPEAHEAD) {
                    _this.form.$element.find('div[name=' + filterField.name + '] input').val('');
                }
                if (filterField['is-range']) {
                    filterField.minValue = '';
                    filterField.maxValue = '';
                }
                else {
                    filterField.value = '';
                    filterField.resetDisplayInput();
                }
            }
        });
        // If variable has any bindings, wait for the bindings to be updated
        setTimeout(function () {
            // Setting result to the default data
            _this._filter();
        });
    };
    LiveFilterDirective.prototype.submitForm = function () {
        this.filter();
    };
    LiveFilterDirective.prototype.applyFilter = function (options) {
        options = options ? (options.data || options) : {};
        options.page = options.page || 1;
        options.orderBy = isDefined(options.orderBy) ? options.orderBy : this.orderBy;
        return this.filter(options);
    };
    LiveFilterDirective.prototype.filter = function (options) {
        var _this = this;
        if (!this.form.datasource) {
            return;
        }
        var filterFields = {};
        var dataModel = {};
        var page = 1, orderBy, isValid;
        options = options || {};
        page = options.page || page;
        orderBy = isDefined(options.orderBy) ? options.orderBy : (this.orderBy || '');
        this.orderBy = orderBy; // Store the order by in scope. This can be used to retain the sort after filtering
        // Copy the values to be sent to the user as '$data' before servicecall
        this.form.formFields.forEach(function (field) {
            var fieldSelector = 'div[name=' + field.name + '] input';
            var $el = _this.form.$element;
            var fieldEle;
            if ((field.widgettype === FormWidgetType.AUTOCOMPLETE || field.widgettype === FormWidgetType.TYPEAHEAD) && $el) {
                fieldEle = $el.find(fieldSelector);
                if (!field['is-range']) {
                    dataModel[field.field] = {
                        'value': isDefined(field.value) ? field.value : fieldEle.val() // For autocomplete, set the datavalue. If not present, set query value
                    };
                }
                else {
                    dataModel[field.field] = {
                        'minValue': isDefined(field.minValue) ? field.minValue : fieldEle.first().val(),
                        'maxValue': isDefined(field.maxValue) ? field.maxValue : fieldEle.last().val()
                    };
                }
                return;
            }
            if (!field['is-range']) {
                dataModel[field.field] = {
                    'value': field.value
                };
            }
            else {
                dataModel[field.field] = {
                    'minValue': field.minValue,
                    'maxValue': field.maxValue
                };
            }
        });
        /*Perform this function for the event onBeforeservicecall*/
        try {
            isValid = this.form.invokeEventCallback('beforeservicecall', { $data: dataModel });
            if (isValid === false) {
                return;
            }
            if (isValid && isValid.error) {
                this.form.toggleMessage(true, isValid.error, 'error', 'ERROR');
                return;
            }
            /*Update these values in the formFields with new reference, inorder to maintain the UI values*/
            this.form.formFields.forEach(function (filterField) {
                if (!filterField['is-range']) {
                    filterField._value = dataModel[filterField.field].value;
                }
                else {
                    filterField._minValue = dataModel[filterField.field].minValue;
                    filterField._maxValue = dataModel[filterField.field].maxValue;
                }
            });
        }
        catch (err) {
            if (err.message === 'Abort') {
                return;
            }
        }
        /* Construct the formFields Variable to send it to the queryBuilder */
        this.form.formFields.forEach(function (filterField) {
            var fieldValue;
            var matchMode;
            var colName = filterField.field;
            var minValue = filterField._minValue;
            var maxvalue = filterField._maxValue;
            /* if field is part of a related entity, column name will be 'entity.fieldName' */
            if (filterField['is-related']) {
                colName += '.' + filterField['lookup-field'];
            }
            if (filterField['is-range']) {
                /*Based on the min and max values, decide the matchmode condition*/
                fieldValue = getRangeFieldValue(minValue, maxvalue);
                matchMode = getRangeMatchMode(minValue, maxvalue);
                if (isDefined(fieldValue)) {
                    filterFields[colName] = {
                        'value': fieldValue,
                        'matchMode': matchMode,
                        'logicalOp': 'AND'
                    };
                }
            }
            else {
                switch (filterField.widgettype) {
                    case FormWidgetType.SELECT:
                    case FormWidgetType.RADIOSET:
                        if (getEnableEmptyFilter(_this.form.enableemptyfilter) && filterField._value === FILTER_CONSTANTS.EMPTY_KEY) {
                            matchMode = getEmptyMatchMode(_this.form.enableemptyfilter);
                            fieldValue = filterField._value;
                        }
                        else {
                            if (filterField.type === DataType.BOOLEAN) {
                                if (isDefined(filterField._value) && filterField._value !== '') {
                                    fieldValue = JSON.parse(filterField._value);
                                }
                            }
                            else {
                                fieldValue = filterField._value;
                            }
                        }
                        break;
                    case FormWidgetType.CHECKBOXSET:
                    case FormWidgetType.CHIPS:
                        if (filterField._value && filterField._value.length) {
                            fieldValue = filterField._value;
                        }
                        break;
                    case FormWidgetType.CHECKBOX:
                    case FormWidgetType.TOGGLE:
                        if (isDefined(filterField._value) && filterField._value !== '') {
                            fieldValue = filterField.type === DataType.BOOLEAN ? JSON.parse(filterField._value) : filterField._value;
                        }
                        break;
                    default:
                        fieldValue = filterField._value;
                        break;
                }
                if (isDefined(fieldValue) && fieldValue !== '' && fieldValue !== null) {
                    filterFields[colName] = {};
                    if (matchMode) {
                        filterFields[colName].matchMode = matchMode;
                        fieldValue = undefined;
                    }
                    else if (filterField.type === DataType.STRING || filterField.isRelated) { // Only for string types and related fields, custom match modes are enabled.
                        filterFields[colName].matchMode = matchMode || filterField.matchmode ||
                            _this.form.datasource.execute(DataSource.Operation.GET_MATCH_MODE);
                    }
                    filterFields[colName].value = fieldValue;
                    filterFields[colName].logicalOp = 'AND';
                    filterFields[colName].type = filterField.type;
                }
            }
        });
        if (options.exportType) {
            return this.form.datasource.execute(DataSource.Operation.DOWNLOAD, {
                data: {
                    matchMode: 'anywhereignorecase',
                    filterFields: filterFields,
                    orderBy: orderBy,
                    exportType: options.exportType,
                    logicalOp: 'AND',
                    exportSize: options.exportSize,
                    fields: options.fields,
                    fileName: options.fileName
                }
            });
        }
        return this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
            filterFields: filterFields,
            orderBy: orderBy,
            page: page,
            pagesize: this.form.pagesize || 20,
            skipDataSetUpdate: true,
            inFlightBehavior: 'executeAll'
        }).then(function (response) {
            var data = response.data;
            _this.form.pagination = response.pagination;
            if (data.error) {
                // disable readonly and show the appropriate error
                _this.form.toggleMessage(true, data.error, 'error', 'ERROR');
                _this.form.onResult(data, false);
            }
            else {
                _this._options = {
                    'page': page,
                    'orderBy': orderBy
                };
                _this.form.result = getClonedObject(data);
                _this.form.onResult(data, true);
            }
            $appDigest();
            return _this.form.result;
        }, function (error) {
            _this.form.toggleMessage(true, error, 'error', 'ERROR');
            _this.form.onResult(error, false);
            return error;
        });
    };
    // Calls the filter function if default values are present
    LiveFilterDirective.prototype.filterOnDefault = function () {
        /*Check if default value is present for any filter field*/
        var defaultObj = _.find(this.form.formFields, function (obj) {
            return isDefined(obj.value) || isDefined(obj.minValue) || isDefined(obj.maxValue);
        });
        /*If default value exists and data is loaded, apply the filter*/
        if (defaultObj) {
            this._filter(this._options);
        }
    };
    LiveFilterDirective.prototype.registerFormWidget = function (widget) {
        var name = widget.key || widget.name;
        this.form.filterWidgets[name] = widget;
    };
    LiveFilterDirective.initializeProps = registerLiveFilterProps();
    LiveFilterDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLiveFilter]'
                },] }
    ];
    /** @nocollapse */
    LiveFilterDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [FormComponent,] }] }
    ]; };
    return LiveFilterDirective;
}());
export { LiveFilterDirective };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1maWx0ZXIuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9mb3JtL2xpdmUtZmlsdGVyL2xpdmUtZmlsdGVyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsSCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSx5QkFBeUIsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2xNLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUlqRSxJQUFNLGdCQUFnQixHQUFHO0lBQ3JCLFdBQVcsRUFBSyxtQkFBbUI7Q0FDdEMsQ0FBQztBQUNGLElBQU0sSUFBSSxHQUFHLGNBQU8sQ0FBQyxDQUFDOztBQUV0QjtJQWNJLDZCQUFtRCxJQUFJO1FBQXZELGlCQVlDO1FBWmtELFNBQUksR0FBSixJQUFJLENBQUE7UUFMdkQsNkhBQTZIO1FBQzdILFlBQU8sR0FBRyxRQUFRLENBQUMsVUFBQSxPQUFPO1lBQ3RCLEtBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBR0osSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxD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QyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDM0MsQ0FBQztJQXZVTyxtQ0FBZSxHQUFHLHVCQUF1QixFQUFFLENBQUM7O2dCQUp2RCxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtpQkFDN0I7Ozs7Z0RBWWdCLElBQUksWUFBSSxNQUFNLFNBQUMsYUFBYTs7SUE4VDdDLDBCQUFDO0NBQUEsQUE1VUQsSUE0VUM7U0F6VVksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3QsIFNlbGYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ICRhcHBEaWdlc3QsIERhdGFTb3VyY2UsIERhdGFUeXBlLCBkZWJvdW5jZSwgRm9ybVdpZGdldFR5cGUsIGdldENsb25lZE9iamVjdCwgaXNEZWZpbmVkIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJMaXZlRmlsdGVyUHJvcHMgfSBmcm9tICcuLi9mb3JtLnByb3BzJztcbmltcG9ydCB7IGFwcGx5RmlsdGVyT25GaWVsZCwgZmV0Y2hEaXN0aW5jdFZhbHVlcywgZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZCwgZ2V0RW1wdHlNYXRjaE1vZGUsIGdldEVuYWJsZUVtcHR5RmlsdGVyLCBnZXRSYW5nZUZpZWxkVmFsdWUsIGdldFJhbmdlTWF0Y2hNb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgeyBpc0RhdGFTZXRXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IEZJTFRFUl9DT05TVEFOVFMgPSB7XG4gICAgJ0VNUFRZX0tFWScgICA6ICdFTVBUWV9OVUxMX0ZJTFRFUidcbn07XG5jb25zdCBub29wID0gKCkgPT4ge307XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGl2ZUZpbHRlcl0nXG59KVxuZXhwb3J0IGNsYXNzIExpdmVGaWx0ZXJEaXJlY3RpdmUge1xuICAgIHN0YXRpYyAgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJMaXZlRmlsdGVyUHJvcHMoKTtcbiAgICBwcml2YXRlIF9vcHRpb25zO1xuXG4gICAgb3JkZXJCeTtcblxuICAgIC8vIGRlYm91bmNlIHRoZSBmaWx0ZXIgZnVuY3Rpb24uIElmIG11bHRpcGxlIGZpbHRlciBjYWxscyBhcmUgbWFkZSBhdCBzYW1lIHRpbWUsIGNhbGxzIHdpbGwgYmUgZGVsYXllZCBhbmQgbGFzdCBjYWxsIGlzIGZpcmVkXG4gICAgX2ZpbHRlciA9IGRlYm91bmNlKG9wdGlvbnMgPT4ge1xuICAgICAgICB0aGlzLmZpbHRlcihvcHRpb25zKTtcbiAgICB9LCAyNTApO1xuXG4gICAgY29uc3RydWN0b3IoQFNlbGYoKSBASW5qZWN0KEZvcm1Db21wb25lbnQpIHByaXZhdGUgZm9ybSkge1xuICAgICAgICBmb3JtLmNsZWFyRmlsdGVyID0gdGhpcy5jbGVhckZpbHRlci5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmFwcGx5RmlsdGVyID0gdGhpcy5hcHBseUZpbHRlci5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmZpbHRlciA9IHRoaXMuZmlsdGVyLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uZmlsdGVyT25EZWZhdWx0ID0gdGhpcy5maWx0ZXJPbkRlZmF1bHQuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5leGVjdXRlID0gdGhpcy5leGVjdXRlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0ub25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZSA9IHRoaXMub25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm9uTWF4RGVmYXVsdFZhbHVlQ2hhbmdlID0gdGhpcy5vbk1heERlZmF1bHRWYWx1ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm9uRGF0YVNvdXJjZUNoYW5nZSA9IHRoaXMub25EYXRhU291cmNlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0ub25GaWVsZFZhbHVlQ2hhbmdlID0gdGhpcy5vbkZpZWxkVmFsdWVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5zdWJtaXRGb3JtID0gdGhpcy5zdWJtaXRGb3JtLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0ucmVnaXN0ZXJGb3JtV2lkZ2V0ID0gdGhpcy5yZWdpc3RlckZvcm1XaWRnZXQuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3BlcmF0aW9uID09PSBEYXRhU291cmNlLk9wZXJhdGlvbi5MSVNUX1JFQ09SRFMgfHwgb3BlcmF0aW9uID09PSBEYXRhU291cmNlLk9wZXJhdGlvbi5ET1dOTE9BRCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXBwbHlGaWx0ZXIob3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX09QVElPTlMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcHRpb25zIHx8IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcGVyYXRpb24gPT09IERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9QQUdJTkdfT1BUSU9OUykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybS5wYWdpbmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5mb3JtLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3BlcmF0aW9uID09PSBEYXRhU291cmNlLk9wZXJhdGlvbi5GRVRDSF9ESVNUSU5DVF9WQUxVRVMpIHtcbiAgICAgICAgICAgIHJldHVybiBmZXRjaERpc3RpbmN0VmFsdWVzKHRoaXMuZm9ybS5kYXRhc291cmNlLCB0aGlzLmZvcm0uZm9ybUZpZWxkcywge1xuICAgICAgICAgICAgICAgIHdpZGdldDogJ3dpZGdldHR5cGUnLFxuICAgICAgICAgICAgICAgIGVuYWJsZWVtcHR5ZmlsdGVyOiB0aGlzLmZvcm0uZW5hYmxlZW1wdHlmaWx0ZXIsXG4gICAgICAgICAgICAgICAgRU1QVFlfVkFMVUU6IHRoaXMuZm9ybS5hcHBMb2NhbGUuTEFCRUxfTk9fVkFMVUVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgb25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZShmaWVsZCwgbnYpIHtcbiAgICAgICAgZmllbGQubWluVmFsdWUgPSBudjtcbiAgICAgICAgZmllbGQudmFsdWUgPSBudjtcbiAgICAgICAgdGhpcy5maWx0ZXJPbkRlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBvbkZpZWxkVmFsdWVDaGFuZ2UoZmllbGQsIG52KSB7XG4gICAgICAgIGFwcGx5RmlsdGVyT25GaWVsZCh0aGlzLmZvcm0uZGF0YXNvdXJjZSwgZmllbGQud2lkZ2V0LCB0aGlzLmZvcm0uZm9ybUZpZWxkcywgbnYsIHtcbiAgICAgICAgICAgIEVNUFRZX1ZBTFVFOiB0aGlzLmZvcm0uYXBwTG9jYWxlLkxBQkVMX05PX1ZBTFVFXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5mb3JtLmF1dG91cGRhdGUgJiYgaXNEZWZpbmVkKG52KSkge1xuICAgICAgICAgICAgdGhpcy5fZmlsdGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbk1heERlZmF1bHRWYWx1ZUNoYW5nZSgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlck9uRGVmYXVsdCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkRhdGFTb3VyY2VDaGFuZ2UoKSB7XG4gICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSB0aGlzLmZvcm0uZGF0YXNvdXJjZTtcblxuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGF0YVNldFdpZGdldChmaWVsZC53aWRnZXR0eXBlKSkge1xuICAgICAgICAgICAgICAgIGdldERpc3RpbmN0VmFsdWVzRm9yRmllbGQoZGF0YVNvdXJjZSwgZmllbGQud2lkZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldDogJ3dpZGdldHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICBlbmFibGVlbXB0eWZpbHRlcjogdGhpcy5mb3JtLmVuYWJsZWVtcHR5ZmlsdGVyLFxuICAgICAgICAgICAgICAgICAgICBFTVBUWV9WQUxVRTogdGhpcy5mb3JtLmFwcExvY2FsZS5MQUJFTF9OT19WQUxVRVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFwcGx5RmlsdGVyT25GaWVsZChkYXRhU291cmNlLCBmaWVsZC53aWRnZXQsIHRoaXMuZm9ybS5mb3JtRmllbGRzLCBmaWVsZC52YWx1ZSwge1xuICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBFTVBUWV9WQUxVRTogdGhpcy5mb3JtLmFwcExvY2FsZS5MQUJFTF9OT19WQUxVRVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBPbiBsb2FkIGNoZWNrIGlmIGRlZmF1bHQgdmFsdWUgZXhpc3RzIGFuZCBhcHBseSBmaWx0ZXIsIENhbGwgdGhlIGZpbHRlciB3aXRoIHRoZSByZXN1bHQgb3B0aW9uc1xuICAgICAgICB0aGlzLl9maWx0ZXIodGhpcy5fb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgY2xlYXJGaWx0ZXIoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5yZXNldEZvcm1TdGF0ZSgpO1xuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpbHRlckZpZWxkID0+IHtcbiAgICAgICAgICAgIC8vIEFkZGVkIGNoZWNrIGZvciByYW5nZSBmaWVsZFxuICAgICAgICAgICAgaWYgKCFmaWx0ZXJGaWVsZC5yZWFkb25seSAmJiBmaWx0ZXJGaWVsZC5zaG93KSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckZpZWxkLndpZGdldHR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSB8fCBmaWx0ZXJGaWVsZC53aWRnZXR0eXBlID09PSBGb3JtV2lkZ2V0VHlwZS5UWVBFQUhFQUQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtLiRlbGVtZW50LmZpbmQoJ2RpdltuYW1lPScgKyBmaWx0ZXJGaWVsZC5uYW1lICsgJ10gaW5wdXQnKS52YWwoJycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZmlsdGVyRmllbGRbJ2lzLXJhbmdlJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGQubWluVmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGQubWF4VmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZC5yZXNldERpc3BsYXlJbnB1dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIElmIHZhcmlhYmxlIGhhcyBhbnkgYmluZGluZ3MsIHdhaXQgZm9yIHRoZSBiaW5kaW5ncyB0byBiZSB1cGRhdGVkXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy8gU2V0dGluZyByZXN1bHQgdG8gdGhlIGRlZmF1bHQgZGF0YVxuICAgICAgICAgICAgdGhpcy5fZmlsdGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN1Ym1pdEZvcm0oKSB7XG4gICAgICAgIHRoaXMuZmlsdGVyKCk7XG4gICAgfVxuXG4gICAgYXBwbHlGaWx0ZXIob3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyA/IChvcHRpb25zLmRhdGEgfHwgb3B0aW9ucykgOiB7fTtcbiAgICAgICAgb3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlIHx8IDE7XG4gICAgICAgIG9wdGlvbnMub3JkZXJCeSA9IGlzRGVmaW5lZChvcHRpb25zLm9yZGVyQnkpID8gIG9wdGlvbnMub3JkZXJCeSA6IHRoaXMub3JkZXJCeTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZpbHRlcihvcHRpb25zPykge1xuICAgICAgICBpZiAoIXRoaXMuZm9ybS5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsdGVyRmllbGRzID0ge307XG4gICAgICAgIGNvbnN0IGRhdGFNb2RlbCA9IHt9O1xuICAgICAgICBsZXQgcGFnZSA9IDEsXG4gICAgICAgICAgICBvcmRlckJ5LFxuICAgICAgICAgICAgaXNWYWxpZDtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIHBhZ2UgPSBvcHRpb25zLnBhZ2UgfHwgcGFnZTtcbiAgICAgICAgb3JkZXJCeSA9IGlzRGVmaW5lZChvcHRpb25zLm9yZGVyQnkpID8gb3B0aW9ucy5vcmRlckJ5IDogKHRoaXMub3JkZXJCeSB8fCAnJyk7XG4gICAgICAgIHRoaXMub3JkZXJCeSA9IG9yZGVyQnk7IC8vIFN0b3JlIHRoZSBvcmRlciBieSBpbiBzY29wZS4gVGhpcyBjYW4gYmUgdXNlZCB0byByZXRhaW4gdGhlIHNvcnQgYWZ0ZXIgZmlsdGVyaW5nXG4gICAgICAgIC8vIENvcHkgdGhlIHZhbHVlcyB0byBiZSBzZW50IHRvIHRoZSB1c2VyIGFzICckZGF0YScgYmVmb3JlIHNlcnZpY2VjYWxsXG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmllbGRTZWxlY3RvciA9ICdkaXZbbmFtZT0nICsgZmllbGQubmFtZSArICddIGlucHV0JztcbiAgICAgICAgICAgIGNvbnN0ICRlbCA9IHRoaXMuZm9ybS4kZWxlbWVudDtcbiAgICAgICAgICAgIGxldCBmaWVsZEVsZTtcbiAgICAgICAgICAgIGlmICgoZmllbGQud2lkZ2V0dHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuQVVUT0NPTVBMRVRFIHx8IGZpZWxkLndpZGdldHR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlRZUEVBSEVBRCkgJiYgJGVsKSB7XG4gICAgICAgICAgICAgICAgZmllbGRFbGUgPSAkZWwuZmluZChmaWVsZFNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAoIWZpZWxkWydpcy1yYW5nZSddKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFNb2RlbFtmaWVsZC5maWVsZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBpc0RlZmluZWQoZmllbGQudmFsdWUpID8gZmllbGQudmFsdWUgOiBmaWVsZEVsZS52YWwoKSAvLyBGb3IgYXV0b2NvbXBsZXRlLCBzZXQgdGhlIGRhdGF2YWx1ZS4gSWYgbm90IHByZXNlbnQsIHNldCBxdWVyeSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFNb2RlbFtmaWVsZC5maWVsZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbWluVmFsdWUnOiAgaXNEZWZpbmVkKGZpZWxkLm1pblZhbHVlKSA/IGZpZWxkLm1pblZhbHVlIDogZmllbGRFbGUuZmlyc3QoKS52YWwoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXhWYWx1ZSc6ICBpc0RlZmluZWQoZmllbGQubWF4VmFsdWUpID8gZmllbGQubWF4VmFsdWUgOiBmaWVsZEVsZS5sYXN0KCkudmFsKClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFmaWVsZFsnaXMtcmFuZ2UnXSkge1xuICAgICAgICAgICAgICAgIGRhdGFNb2RlbFtmaWVsZC5maWVsZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSc6IGZpZWxkLnZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YU1vZGVsW2ZpZWxkLmZpZWxkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ21pblZhbHVlJzogZmllbGQubWluVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICdtYXhWYWx1ZSc6IGZpZWxkLm1heFZhbHVlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8qUGVyZm9ybSB0aGlzIGZ1bmN0aW9uIGZvciB0aGUgZXZlbnQgb25CZWZvcmVzZXJ2aWNlY2FsbCovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpc1ZhbGlkID0gdGhpcy5mb3JtLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXNlcnZpY2VjYWxsJywgeyRkYXRhOiBkYXRhTW9kZWx9KTtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1ZhbGlkICYmIGlzVmFsaWQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0udG9nZ2xlTWVzc2FnZSh0cnVlLCBpc1ZhbGlkLmVycm9yLCAnZXJyb3InLCAnRVJST1InKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKlVwZGF0ZSB0aGVzZSB2YWx1ZXMgaW4gdGhlIGZvcm1GaWVsZHMgd2l0aCBuZXcgcmVmZXJlbmNlLCBpbm9yZGVyIHRvIG1haW50YWluIHRoZSBVSSB2YWx1ZXMqL1xuICAgICAgICAgICAgdGhpcy5mb3JtLmZvcm1GaWVsZHMuZm9yRWFjaChmaWx0ZXJGaWVsZCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWx0ZXJGaWVsZFsnaXMtcmFuZ2UnXSkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZC5fdmFsdWUgPSBkYXRhTW9kZWxbZmlsdGVyRmllbGQuZmllbGRdLnZhbHVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkLl9taW5WYWx1ZSA9IGRhdGFNb2RlbFtmaWx0ZXJGaWVsZC5maWVsZF0ubWluVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkLl9tYXhWYWx1ZSA9IGRhdGFNb2RlbFtmaWx0ZXJGaWVsZC5maWVsZF0ubWF4VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5tZXNzYWdlID09PSAnQWJvcnQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qIENvbnN0cnVjdCB0aGUgZm9ybUZpZWxkcyBWYXJpYWJsZSB0byBzZW5kIGl0IHRvIHRoZSBxdWVyeUJ1aWxkZXIgKi9cbiAgICAgICAgdGhpcy5mb3JtLmZvcm1GaWVsZHMuZm9yRWFjaChmaWx0ZXJGaWVsZCA9PiB7XG4gICAgICAgICAgICBsZXQgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgIGxldCBtYXRjaE1vZGU7XG4gICAgICAgICAgICBsZXQgY29sTmFtZSAgPSBmaWx0ZXJGaWVsZC5maWVsZDtcbiAgICAgICAgICAgIGNvbnN0IG1pblZhbHVlID0gZmlsdGVyRmllbGQuX21pblZhbHVlO1xuICAgICAgICAgICAgY29uc3QgbWF4dmFsdWUgPSBmaWx0ZXJGaWVsZC5fbWF4VmFsdWU7XG4gICAgICAgICAgICAvKiBpZiBmaWVsZCBpcyBwYXJ0IG9mIGEgcmVsYXRlZCBlbnRpdHksIGNvbHVtbiBuYW1lIHdpbGwgYmUgJ2VudGl0eS5maWVsZE5hbWUnICovXG4gICAgICAgICAgICBpZiAoZmlsdGVyRmllbGRbJ2lzLXJlbGF0ZWQnXSkge1xuICAgICAgICAgICAgICAgIGNvbE5hbWUgKz0gJy4nICsgZmlsdGVyRmllbGRbJ2xvb2t1cC1maWVsZCddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlckZpZWxkWydpcy1yYW5nZSddKSB7XG4gICAgICAgICAgICAgICAgLypCYXNlZCBvbiB0aGUgbWluIGFuZCBtYXggdmFsdWVzLCBkZWNpZGUgdGhlIG1hdGNobW9kZSBjb25kaXRpb24qL1xuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBnZXRSYW5nZUZpZWxkVmFsdWUobWluVmFsdWUsIG1heHZhbHVlKTtcbiAgICAgICAgICAgICAgICBtYXRjaE1vZGUgID0gZ2V0UmFuZ2VNYXRjaE1vZGUobWluVmFsdWUsIG1heHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWZpbmVkKGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkc1tjb2xOYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd2YWx1ZScgICAgIDogZmllbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdtYXRjaE1vZGUnIDogbWF0Y2hNb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2xvZ2ljYWxPcCcgOiAnQU5EJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChmaWx0ZXJGaWVsZC53aWRnZXR0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuU0VMRUNUOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLlJBRElPU0VUOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldEVuYWJsZUVtcHR5RmlsdGVyKHRoaXMuZm9ybS5lbmFibGVlbXB0eWZpbHRlcikgJiYgZmlsdGVyRmllbGQuX3ZhbHVlID09PSBGSUxURVJfQ09OU1RBTlRTLkVNUFRZX0tFWSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoTW9kZSAgPSBnZXRFbXB0eU1hdGNoTW9kZSh0aGlzLmZvcm0uZW5hYmxlZW1wdHlmaWx0ZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWx0ZXJGaWVsZC5fdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGaWVsZC50eXBlID09PSBEYXRhVHlwZS5CT09MRUFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQoZmlsdGVyRmllbGQuX3ZhbHVlKSAmJiBmaWx0ZXJGaWVsZC5fdmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gSlNPTi5wYXJzZShmaWx0ZXJGaWVsZC5fdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpbHRlckZpZWxkLl92YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWFNFVDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5DSElQUzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGaWVsZC5fdmFsdWUgJiYgZmlsdGVyRmllbGQuX3ZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWx0ZXJGaWVsZC5fdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5UT0dHTEU6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZpbmVkKGZpbHRlckZpZWxkLl92YWx1ZSkgJiYgZmlsdGVyRmllbGQuX3ZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWx0ZXJGaWVsZC50eXBlID09PSBEYXRhVHlwZS5CT09MRUFOID8gSlNPTi5wYXJzZShmaWx0ZXJGaWVsZC5fdmFsdWUpIDogZmlsdGVyRmllbGQuX3ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZmlsdGVyRmllbGQuX3ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQoZmllbGRWYWx1ZSkgJiYgZmllbGRWYWx1ZSAhPT0gJycgJiYgZmllbGRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHNbY29sTmFtZV0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoTW9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGRzW2NvbE5hbWVdLm1hdGNoTW9kZSA9IG1hdGNoTW9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsdGVyRmllbGQudHlwZSA9PT0gRGF0YVR5cGUuU1RSSU5HIHx8IGZpbHRlckZpZWxkLmlzUmVsYXRlZCkgeyAvLyBPbmx5IGZvciBzdHJpbmcgdHlwZXMgYW5kIHJlbGF0ZWQgZmllbGRzLCBjdXN0b20gbWF0Y2ggbW9kZXMgYXJlIGVuYWJsZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHNbY29sTmFtZV0ubWF0Y2hNb2RlID0gbWF0Y2hNb2RlIHx8IGZpbHRlckZpZWxkLm1hdGNobW9kZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX01BVENIX01PREUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkc1tjb2xOYW1lXS52YWx1ZSAgICAgPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHNbY29sTmFtZV0ubG9naWNhbE9wID0gJ0FORCc7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkc1tjb2xOYW1lXS50eXBlID0gZmlsdGVyRmllbGQudHlwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmV4cG9ydFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkRPV05MT0FELCB7XG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaE1vZGUgOiAnYW55d2hlcmVpZ25vcmVjYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGRzIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgICAgICAgICBvcmRlckJ5IDogb3JkZXJCeSxcbiAgICAgICAgICAgICAgICAgICAgZXhwb3J0VHlwZSA6IG9wdGlvbnMuZXhwb3J0VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgbG9naWNhbE9wIDogJ0FORCcsXG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydFNpemUgOiBvcHRpb25zLmV4cG9ydFNpemUsXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkcyA6IG9wdGlvbnMuZmllbGRzLFxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZTogb3B0aW9ucy5maWxlTmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkxJU1RfUkVDT1JEUywge1xuICAgICAgICAgICAgZmlsdGVyRmllbGRzIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgb3JkZXJCeSA6IG9yZGVyQnksXG4gICAgICAgICAgICBwYWdlIDogcGFnZSxcbiAgICAgICAgICAgIHBhZ2VzaXplIDogdGhpcy5mb3JtLnBhZ2VzaXplIHx8IDIwLFxuICAgICAgICAgICAgc2tpcERhdGFTZXRVcGRhdGUgOiB0cnVlLCAvLyBkb250IHVwZGF0ZSB0aGUgYWN0dWFsIHZhcmlhYmxlIGRhdGFzZXQsXG4gICAgICAgICAgICBpbkZsaWdodEJlaGF2aW9yIDogJ2V4ZWN1dGVBbGwnXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB0aGlzLmZvcm0ucGFnaW5hdGlvbiA9IHJlc3BvbnNlLnBhZ2luYXRpb247XG5cbiAgICAgICAgICAgIGlmIChkYXRhLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgLy8gZGlzYWJsZSByZWFkb25seSBhbmQgc2hvdyB0aGUgYXBwcm9wcmlhdGUgZXJyb3JcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0udG9nZ2xlTWVzc2FnZSh0cnVlLCBkYXRhLmVycm9yLCAnZXJyb3InLCAnRVJST1InKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0ub25SZXN1bHQoZGF0YSwgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAncGFnZSc6IHBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICdvcmRlckJ5Jzogb3JkZXJCeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLnJlc3VsdCA9IGdldENsb25lZE9iamVjdChkYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0ub25SZXN1bHQoZGF0YSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtLnJlc3VsdDtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgdGhpcy5mb3JtLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgZXJyb3IsICdlcnJvcicsICdFUlJPUicpO1xuICAgICAgICAgICAgdGhpcy5mb3JtLm9uUmVzdWx0KGVycm9yLCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENhbGxzIHRoZSBmaWx0ZXIgZnVuY3Rpb24gaWYgZGVmYXVsdCB2YWx1ZXMgYXJlIHByZXNlbnRcbiAgICBmaWx0ZXJPbkRlZmF1bHQoKSB7XG4gICAgICAgIC8qQ2hlY2sgaWYgZGVmYXVsdCB2YWx1ZSBpcyBwcmVzZW50IGZvciBhbnkgZmlsdGVyIGZpZWxkKi9cbiAgICAgICAgY29uc3QgZGVmYXVsdE9iaiA9IF8uZmluZCh0aGlzLmZvcm0uZm9ybUZpZWxkcywgb2JqID0+IHtcbiAgICAgICAgICAgIHJldHVybiBpc0RlZmluZWQob2JqLnZhbHVlKSB8fCBpc0RlZmluZWQob2JqLm1pblZhbHVlKSB8fCBpc0RlZmluZWQob2JqLm1heFZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8qSWYgZGVmYXVsdCB2YWx1ZSBleGlzdHMgYW5kIGRhdGEgaXMgbG9hZGVkLCBhcHBseSB0aGUgZmlsdGVyKi9cbiAgICAgICAgaWYgKGRlZmF1bHRPYmopIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpbHRlcih0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyRm9ybVdpZGdldCh3aWRnZXQpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHdpZGdldC5rZXkgfHwgd2lkZ2V0Lm5hbWU7XG4gICAgICAgIHRoaXMuZm9ybS5maWx0ZXJXaWRnZXRzW25hbWVdID0gd2lkZ2V0O1xuICAgIH1cbn1cbiJdfQ==