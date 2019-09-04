import { Directive, Inject, Optional, Self, Attribute } from '@angular/core';
import { $appDigest, AbstractDialogService, DataSource, DataType, debounce, getClonedObject, getFiles, getValidDateObject, isDateTimeType, isDefined, isEmptyObject } from '@wm/core';
import { registerLiveFormProps } from '../form.props';
import { FormComponent } from '../form.component';
import { ALLFIELDS, applyFilterOnField, fetchRelatedFieldData, getDistinctValuesForField, Live_Operations, performDataOperation } from '../../../../utils/data-utils';
import { ToDatePipe } from '../../../../pipes/custom-pipes';
import { parseValueByType } from '../../../../utils/live-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';
import { LiveTableComponent } from '../../live-table/live-table.component';
var isTimeType = function (field) { return field.widgettype === DataType.TIME || (field.type === DataType.TIME && !field.widgettype); };
var ɵ0 = isTimeType;
var getValidTime = function (val) {
    if (val) {
        var date = (new Date()).toDateString();
        return (new Date(date + " " + val)).getTime();
    }
    return undefined;
};
var ɵ1 = getValidTime;
var LiveFormDirective = /** @class */ (function () {
    function LiveFormDirective(form, liveTable, datePipe, dialogService, formlayout) {
        var _this = this;
        this.form = form;
        this.datePipe = datePipe;
        this.dialogService = dialogService;
        this._debouncedSavePrevDataValues = debounce(function () {
            _this.savePrevDataValues();
        }, 250);
        // If parent live table is present and this form is first child of live table, set this form instance on livetable
        if (liveTable && !this.form.parentForm) {
            this.form._liveTableParent = liveTable;
            this.form.isLayoutDialog = liveTable.isLayoutDialog;
            liveTable.onFormReady(this.form);
        }
        else {
            this.form.isLayoutDialog = formlayout === 'dialog';
        }
        // CUD operations
        form.edit = this.edit.bind(this);
        form.cancel = this.cancel.bind(this);
        form.reset = this.reset.bind(this);
        form.new = this.new.bind(this);
        form.delete = this.delete.bind(this);
        form.save = this.save.bind(this);
        form.saveAndNew = this.saveAndNew.bind(this);
        form.saveAndView = this.saveAndView.bind(this);
        form.setPrimaryKey = this.setPrimaryKey.bind(this);
        form.constructDataObject = this.constructDataObject.bind(this);
        form.changeDataObject = this.setFormData.bind(this);
        form.setFormData = this.setFormData.bind(this);
        form.findOperationType = this.findOperationType.bind(this);
        form.clearData = this.clearData.bind(this);
        form.onFieldDefaultValueChange = this.onFieldDefaultValueChange.bind(this);
        form.onDataSourceChange = this.onDataSourceChange.bind(this);
        form.onFieldValueChange = this.onFieldValueChange.bind(this);
        form.submitForm = this.submitForm.bind(this);
    }
    LiveFormDirective.prototype.onDataSourceChange = function () {
        var _this = this;
        if (_.get(this.form.formFields, 'length')) {
            this.form.isDataSourceUpdated = true;
        }
        var formFields = this.form.getFormFields();
        formFields.forEach(function (field) {
            if (!field.isDataSetBound && isDataSetWidget(field.widgettype)) {
                if (field['is-related']) {
                    field.isDataSetBound = true;
                    fetchRelatedFieldData(_this.form.datasource, field.widget, {
                        relatedField: field.key,
                        datafield: ALLFIELDS,
                        widget: 'widgettype',
                    });
                }
                else {
                    getDistinctValuesForField(_this.form.datasource, field.widget, {
                        widget: 'widgettype',
                        enableemptyfilter: _this.form.enableemptyfilter
                    });
                    applyFilterOnField(_this.form.datasource, field.widget, formFields, field.value, { isFirst: true });
                }
            }
        });
    };
    LiveFormDirective.prototype.onFieldDefaultValueChange = function (field, nv) {
        // In Edit, do  not set default values
        if (this.form.operationType === 'update') {
            return;
        }
        // Set the default value only if it exists.
        if (isDefined(nv) && nv !== null && nv !== '' && nv !== 'null') {
            field.value = parseValueByType(nv, field.type, field.widgettype);
        }
        else {
            field.value = undefined;
        }
        this._debouncedSavePrevDataValues();
    };
    LiveFormDirective.prototype.onFieldValueChange = function (field, nv) {
        applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv);
    };
    LiveFormDirective.prototype.getBlobURL = function (dataObj, key, value) {
        var href = '';
        var primaryKeys;
        var primaryKey;
        if (value === null || value === undefined || !this.form.datasource) {
            return href;
        }
        primaryKeys = this.form.datasource.execute(DataSource.Operation.GET_PRIMARY_KEY) || [];
        primaryKey = dataObj[primaryKeys[0]];
        // TODO: Handle mobile case
        // if (CONSTANTS.hasCordova && CONSTANTS.isRunMode) {
        //     href += $rootScope.project.deployedUrl;
        // }
        href += this.form.datasource.execute(DataSource.Operation.GET_BLOB_URL, {
            primaryValue: primaryKey,
            columnName: key
        });
        href += '?' + Math.random();
        return href;
    };
    LiveFormDirective.prototype.resetFileUploadWidget = function (field, skipValueSet) {
        var $formEle = this.form.$element;
        $formEle.find('[name="' + field.key + '_formWidget"]').val('');
        field._control.reset();
        if (!skipValueSet) {
            field.href = '';
            field.value = null;
        }
    };
    LiveFormDirective.prototype.setDefaultValues = function () {
        var _this = this;
        this.form.formFields.forEach(function (field) {
            _this.onFieldDefaultValueChange(field, field.defaultvalue);
        });
    };
    LiveFormDirective.prototype.setFormData = function (dataObj) {
        var _this = this;
        if (!dataObj) {
            return;
        }
        var formFields = this.form.getFormFields();
        formFields.forEach(function (field) {
            var value = _.get(dataObj, field.key || field.name);
            if (isTimeType(field)) {
                field.value = getValidTime(value);
            }
            else if (field.type === DataType.BLOB) {
                _this.resetFileUploadWidget(field, true);
                field.href = _this.getBlobURL(dataObj, field.key, value);
                field.value = _.isString(value) ? '' : value;
            }
            else {
                field.value = value;
            }
        });
        this.savePrevDataValues();
        this.form.constructDataObject();
    };
    LiveFormDirective.prototype.onDataSourceUpdate = function (response, newForm, updateMode) {
        if (newForm) {
            this.form.new();
        }
        else {
            this.form.setFormData(response);
            this.closeDialog();
        }
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : true;
    };
    LiveFormDirective.prototype.savePrevformFields = function () {
        this.form.prevformFields = getClonedObject(this.form.formFields.map(function (field) {
            return {
                'key': field.key,
                'type': field.type,
                'widgettype': field.widgettype,
                'outputformat': field.outputformat,
                'value': field.value
            };
        }));
    };
    LiveFormDirective.prototype.getPrevformFields = function () {
        var _this = this;
        this.form.formFields.map(function (field) {
            var prevField = _this.form.prevformFields.find(function (pField) { return pField.key === field.key; });
            field.value = prevField.value;
        });
    };
    LiveFormDirective.prototype.getDataObject = function () {
        if (this.form.operationType === Live_Operations.INSERT) {
            return {};
        }
        if (isDefined(this.form.prevDataObject) && !isEmptyObject(this.form.prevDataObject)) {
            return getClonedObject(this.form.prevDataObject);
        }
        return getClonedObject(this.form.formdata || {});
    };
    LiveFormDirective.prototype.constructDataObject = function (isPreviousData) {
        var _this = this;
        var dataObject = this.getDataObject();
        var formName = this.form.name;
        var formFields;
        formFields = isPreviousData ? this.form.prevformFields : this.form.getFormFields();
        formFields.forEach(function (field) {
            var dateTime, fieldValue;
            var fieldTarget = _.split(field.key, '.');
            var fieldName = fieldTarget[0] || field.key;
            /*collect the values from the fields and construct the object*/
            /*Format the output of date time widgets to the given output format*/
            if ((field.widgettype && isDateTimeType(field.widgettype)) || isDateTimeType(field.type)) {
                if (field.value) {
                    dateTime = getValidDateObject(field.value);
                    if (field.outputformat === DataType.TIMESTAMP || field.type === DataType.TIMESTAMP) {
                        fieldValue = field.value ? dateTime : null;
                    }
                    else if (field.outputformat) {
                        fieldValue = _this.datePipe.transform(dateTime, field.outputformat);
                    }
                    else {
                        fieldValue = field.value;
                    }
                }
                else {
                    fieldValue = undefined;
                }
            }
            else if (field.type === DataType.BLOB) {
                fieldValue = getFiles(formName, fieldName + '_formWidget', field.multiple);
            }
            else if (field.type === DataType.LIST) {
                fieldValue = field.value || undefined;
            }
            else {
                fieldValue = (field.value === null || field.value === '') ? undefined : field.value;
            }
            if (fieldTarget.length === 1) {
                dataObject[fieldName] = fieldValue;
            }
            else {
                dataObject[fieldName] = dataObject[fieldName] || {};
                dataObject[fieldName][fieldTarget[1]] = fieldValue;
            }
        });
        if (!isPreviousData) {
            this.form.updateFormDataOutput(dataObject);
            return this.form.dataoutput;
        }
        return dataObject;
    };
    LiveFormDirective.prototype.setPrimaryKey = function (fieldName) {
        /*Store the primary key of data*/
        this.form.primaryKey = this.form.primaryKey || [];
        if (this.form.primaryKey.indexOf(fieldName) === -1) {
            this.form.primaryKey.push(fieldName);
        }
    };
    LiveFormDirective.prototype.findOperationType = function () {
        var _this = this;
        var operation;
        var isPrimary = false;
        var sourceOperation = this.form.datasource && this.form.datasource.execute(DataSource.Operation.GET_OPERATION_TYPE);
        if (sourceOperation && sourceOperation !== 'read') {
            return sourceOperation;
        }
        /*If OperationType is not set then based on the formdata object return the operation type,
            this case occurs only if the form is outside a livegrid*/
        /*If the formdata object has primary key value then return update else insert*/
        if (this.form.primaryKey && !_.isEmpty(this.form.formdata)) {
            /*If only one column is primary key*/
            if (this.form.primaryKey.length === 1) {
                if (this.form.formdata[this.form.primaryKey[0]]) {
                    operation = Live_Operations.UPDATE;
                }
                /*If only no column is primary key*/
            }
            else if (this.form.primaryKey.length === 0) {
                _.forEach(this.form.formdata, function (value) {
                    if (value) {
                        isPrimary = true;
                    }
                });
                if (isPrimary) {
                    operation = Live_Operations.UPDATE;
                }
                /*If multiple columns are primary key*/
            }
            else {
                isPrimary = _.some(this.form.primaryKey, function (primaryKey) {
                    if (_this.form.formdata[primaryKey]) {
                        return true;
                    }
                });
                if (isPrimary) {
                    operation = Live_Operations.UPDATE;
                }
            }
        }
        return operation || Live_Operations.INSERT;
    };
    LiveFormDirective.prototype.getPrevDataValues = function () {
        var prevDataValues = _.fromPairs(_.map(this.form.prevDataValues, function (item) {
            return [item.key, item.value];
        })); // Convert of array of values to an object
        this.form.formFields.forEach(function (field) {
            field.value = prevDataValues[field.key] || '';
            field.resetDisplayInput();
        });
        return prevDataValues;
    };
    LiveFormDirective.prototype.savePrevDataValues = function () {
        this.form.prevDataValues = this.form.formFields.map(function (obj) {
            return { 'key': obj.key, 'value': obj.value };
        });
    };
    LiveFormDirective.prototype.emptyDataModel = function () {
        var _this = this;
        this.form.formFields.forEach(function (field) {
            if (isDefined(field)) {
                if (field.type === DataType.BLOB) {
                    _this.resetFileUploadWidget(field);
                }
                else {
                    field.datavalue = '';
                }
            }
        });
    };
    LiveFormDirective.prototype.clearData = function () {
        this.form.toggleMessage(false);
        this.emptyDataModel();
    };
    LiveFormDirective.prototype.setReadonlyFields = function () {
        this.form.formFields.forEach(function (field) {
            field.setReadOnlyState();
        });
    };
    LiveFormDirective.prototype.edit = function () {
        this.form.resetFormState();
        this.form.clearMessage();
        this.form.operationType = Live_Operations.UPDATE;
        if (this.form.isSelected) {
            this.savePrevformFields();
            this.savePrevDataValues();
        }
        this.form.prevDataObject = getClonedObject(this.form.formdata || {});
        this.setReadonlyFields();
        this.form.isUpdateMode = true;
        $appDigest();
    };
    LiveFormDirective.prototype.reset = function () {
        var _this = this;
        var prevDataValues;
        this.form.resetFormState();
        prevDataValues = this.getPrevDataValues();
        this.form.formFields.forEach(function (field) {
            if (field.type === DataType.BLOB) {
                _this.resetFileUploadWidget(field, true);
                field.href = _this.getBlobURL(prevDataValues, field.key, field.value);
            }
        });
        this.form.constructDataObject();
    };
    LiveFormDirective.prototype.closeDialog = function () {
        if (this.form.isLayoutDialog) {
            this.dialogService.close(this.form.dialogId);
        }
    };
    LiveFormDirective.prototype.cancel = function () {
        this.form.clearMessage();
        this.form.isUpdateMode = false;
        this.form.reset();
        /*Show the previous selected data*/
        if (this.form.isSelected) {
            this.getPrevformFields();
        }
        this.form.isUpdateMode = false;
        this.closeDialog();
        if (this.form._liveTableParent) {
            this.form._liveTableParent.onCancel();
        }
        $appDigest();
    };
    LiveFormDirective.prototype.new = function () {
        var _this = this;
        this.form.resetFormState();
        this.form.operationType = Live_Operations.INSERT;
        this.form.clearMessage();
        if (this.form.isSelected) {
            this.savePrevformFields();
        }
        this.emptyDataModel();
        setTimeout(function () {
            _this.setDefaultValues();
            _this.savePrevDataValues();
            _this.form.constructDataObject();
        });
        this.form.isUpdateMode = true;
    };
    LiveFormDirective.prototype.delete = function (callBackFn) {
        this.form.resetFormState();
        this.form.operationType = Live_Operations.DELETE;
        this.form.prevDataObject = getClonedObject(this.form.formdata || {});
        this.form.save(undefined, undefined, undefined, callBackFn);
    };
    // Function use to save the form and open new form after save
    LiveFormDirective.prototype.saveAndNew = function () {
        this.save(undefined, true, true);
    };
    // Function use to save the form and open new form after save
    LiveFormDirective.prototype.saveAndView = function () {
        this.save(undefined, false);
    };
    LiveFormDirective.prototype.submitForm = function ($event) {
        this.save($event);
    };
    LiveFormDirective.prototype.save = function (event, updateMode, newForm) {
        var _this = this;
        if (!this.form.datasource) {
            return;
        }
        var data, prevData, operationType, isValid;
        var requestData = {};
        operationType = this.form.operationType = this.form.operationType || this.findOperationType();
        // Disable the form submit if form is in invalid state.
        if (this.form.validateFieldsOnSubmit()) {
            return;
        }
        data = getClonedObject(this.form.constructDataObject());
        prevData = this.form.prevformFields ? this.form.constructDataObject(true) : data;
        try {
            isValid = this.form.invokeEventCallback('beforeservicecall', { $event: event, $operation: this.form.operationType, $data: data, options: requestData });
            if (isValid === false) {
                return;
            }
            if (isValid && isValid.error) {
                this.form.toggleMessage(true, isValid.error, 'error');
                return;
            }
        }
        catch (err) {
            if (err.message === 'Abort') {
                return;
            }
        }
        // If operation is update, form is not touched and current data and previous data is same, Show no changes detected message
        if (this.form.operationType === Live_Operations.UPDATE && this.form.ngform && this.form.ngform.pristine &&
            (this.form.isSelected && _.isEqual(data, prevData))) {
            this.form.toggleMessage(true, this.form.appLocale.MESSAGE_NO_CHANGES, 'info', '');
            $appDigest();
            return;
        }
        this.form.resetFormState();
        requestData.row = data;
        requestData.transform = true;
        requestData.skipNotification = true;
        if (operationType === Live_Operations.UPDATE) {
            requestData.rowData = this.form.formdata;
            requestData.prevData = prevData;
        }
        performDataOperation(this.form.datasource, requestData, {
            operationType: operationType
        }).then(function (response) {
            var msg = operationType === Live_Operations.INSERT ? _this.form.insertmessage : (operationType === Live_Operations.UPDATE ?
                _this.form.updatemessage : _this.form.deletemessage);
            if (operationType === Live_Operations.DELETE) {
                _this.form.onResult(requestData.row, true, event);
                _this.emptyDataModel();
                _this.form.prevDataValues = [];
                _this.form.isSelected = false;
            }
            else {
                _this.form.onResult(response, true, event);
            }
            _this.form.toggleMessage(true, msg, 'success');
            if (_this.form._liveTableParent) {
                // highlight the current updated row
                _this.form._liveTableParent.onResult(operationType, response, newForm, updateMode);
            }
            else {
                /*get updated data without refreshing page*/
                _this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                    'skipToggleState': true
                });
                _this.onDataSourceUpdate(response, newForm, updateMode);
            }
        }, function (error) {
            _this.form.onResult(error, false, event);
            _this.form.toggleMessage(true, error, 'error');
            $appDigest();
        });
    };
    LiveFormDirective.initializeProps = registerLiveFormProps();
    LiveFormDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLiveForm]'
                },] }
    ];
    /** @nocollapse */
    LiveFormDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [FormComponent,] }] },
        { type: LiveTableComponent, decorators: [{ type: Optional }] },
        { type: ToDatePipe },
        { type: AbstractDialogService },
        { type: String, decorators: [{ type: Attribute, args: ['formlayout',] }] }
    ]; };
    return LiveFormDirective;
}());
export { LiveFormDirective };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1mb3JtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9saXZlLWZvcm0vbGl2ZS1mb3JtLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RSxPQUFPLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEwsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLHlCQUF5QixFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3RLLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFJM0UsSUFBTSxVQUFVLEdBQUcsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMs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O0lBM2VPLGlDQUFlLEdBQUcscUJBQXFCLEVBQUUsQ0FBQzs7Z0JBSnJELFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsY0FBYztpQkFDM0I7Ozs7Z0RBUVEsSUFBSSxZQUFJLE1BQU0sU0FBQyxhQUFhO2dCQXZCNUIsa0JBQWtCLHVCQXdCbEIsUUFBUTtnQkEzQlIsVUFBVTtnQkFMRSxxQkFBcUI7NkNBbUNqQyxTQUFTLFNBQUMsWUFBWTs7SUFrZS9CLHdCQUFDO0NBQUEsQUFoZkQsSUFnZkM7U0E3ZVksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBJbmplY3QsIE9wdGlvbmFsLCBTZWxmLCBBdHRyaWJ1dGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBEYXRhU291cmNlLCBEYXRhVHlwZSwgZGVib3VuY2UsIGdldENsb25lZE9iamVjdCwgZ2V0RmlsZXMsIGdldFZhbGlkRGF0ZU9iamVjdCwgaXNEYXRlVGltZVR5cGUsIGlzRGVmaW5lZCwgaXNFbXB0eU9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJMaXZlRm9ybVByb3BzIH0gZnJvbSAnLi4vZm9ybS5wcm9wcyc7XG5pbXBvcnQgeyBGb3JtQ29tcG9uZW50IH0gZnJvbSAnLi4vZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgQUxMRklFTERTLCBhcHBseUZpbHRlck9uRmllbGQsIGZldGNoUmVsYXRlZEZpZWxkRGF0YSwgZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZCwgTGl2ZV9PcGVyYXRpb25zLCBwZXJmb3JtRGF0YU9wZXJhdGlvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgVG9EYXRlUGlwZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BpcGVzL2N1c3RvbS1waXBlcyc7XG5pbXBvcnQgeyBwYXJzZVZhbHVlQnlUeXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5pbXBvcnQgeyBpc0RhdGFTZXRXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgTGl2ZVRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vbGl2ZS10YWJsZS9saXZlLXRhYmxlLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgaXNUaW1lVHlwZSA9IGZpZWxkID0+IGZpZWxkLndpZGdldHR5cGUgPT09IERhdGFUeXBlLlRJTUUgfHwgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLlRJTUUgJiYgIWZpZWxkLndpZGdldHR5cGUpO1xuY29uc3QgZ2V0VmFsaWRUaW1lID0gdmFsID0+IHtcbiAgICBpZiAodmFsKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSAobmV3IERhdGUoKSkudG9EYXRlU3RyaW5nKCk7XG4gICAgICAgIHJldHVybiAobmV3IERhdGUoYCR7ZGF0ZX0gJHt2YWx9YCkpLmdldFRpbWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGl2ZUZvcm1dJ1xufSlcbmV4cG9ydCBjbGFzcyBMaXZlRm9ybURpcmVjdGl2ZSB7XG4gICAgc3RhdGljICBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlckxpdmVGb3JtUHJvcHMoKTtcbiAgICBwcml2YXRlIF9kZWJvdW5jZWRTYXZlUHJldkRhdGFWYWx1ZXMgPSBkZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2F2ZVByZXZEYXRhVmFsdWVzKCk7XG4gICAgfSwgMjUwKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoRm9ybUNvbXBvbmVudCkgcHJpdmF0ZSBmb3JtLFxuICAgICAgICBAT3B0aW9uYWwoKSBsaXZlVGFibGU6IExpdmVUYWJsZUNvbXBvbmVudCxcbiAgICAgICAgcHVibGljIGRhdGVQaXBlOiBUb0RhdGVQaXBlLFxuICAgICAgICBwcml2YXRlIGRpYWxvZ1NlcnZpY2U6IEFic3RyYWN0RGlhbG9nU2VydmljZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZm9ybWxheW91dCcpIGZvcm1sYXlvdXQ6IHN0cmluZ1xuICAgICkge1xuICAgICAgICAvLyBJZiBwYXJlbnQgbGl2ZSB0YWJsZSBpcyBwcmVzZW50IGFuZCB0aGlzIGZvcm0gaXMgZmlyc3QgY2hpbGQgb2YgbGl2ZSB0YWJsZSwgc2V0IHRoaXMgZm9ybSBpbnN0YW5jZSBvbiBsaXZldGFibGVcbiAgICAgICAgaWYgKGxpdmVUYWJsZSAmJiAhdGhpcy5mb3JtLnBhcmVudEZvcm0pIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5fbGl2ZVRhYmxlUGFyZW50ID0gbGl2ZVRhYmxlO1xuICAgICAgICAgICAgdGhpcy5mb3JtLmlzTGF5b3V0RGlhbG9nID0gbGl2ZVRhYmxlLmlzTGF5b3V0RGlhbG9nO1xuICAgICAgICAgICAgbGl2ZVRhYmxlLm9uRm9ybVJlYWR5KHRoaXMuZm9ybSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmZvcm0uaXNMYXlvdXREaWFsb2cgPSBmb3JtbGF5b3V0ID09PSAnZGlhbG9nJztcbiAgICAgICAgfVxuICAgICAgICAvLyBDVUQgb3BlcmF0aW9uc1xuICAgICAgICBmb3JtLmVkaXQgPSB0aGlzLmVkaXQuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5jYW5jZWwgPSB0aGlzLmNhbmNlbC5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLnJlc2V0ID0gdGhpcy5yZXNldC5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm5ldyA9IHRoaXMubmV3LmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uZGVsZXRlID0gdGhpcy5kZWxldGUuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5zYXZlID0gdGhpcy5zYXZlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uc2F2ZUFuZE5ldyA9IHRoaXMuc2F2ZUFuZE5ldy5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLnNhdmVBbmRWaWV3ID0gdGhpcy5zYXZlQW5kVmlldy5iaW5kKHRoaXMpO1xuXG4gICAgICAgIGZvcm0uc2V0UHJpbWFyeUtleSA9IHRoaXMuc2V0UHJpbWFyeUtleS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmNvbnN0cnVjdERhdGFPYmplY3QgPSB0aGlzLmNvbnN0cnVjdERhdGFPYmplY3QuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5jaGFuZ2VEYXRhT2JqZWN0ID0gdGhpcy5zZXRGb3JtRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLnNldEZvcm1EYXRhID0gdGhpcy5zZXRGb3JtRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmZpbmRPcGVyYXRpb25UeXBlID0gdGhpcy5maW5kT3BlcmF0aW9uVHlwZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmNsZWFyRGF0YSA9IHRoaXMuY2xlYXJEYXRhLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0ub25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZSA9IHRoaXMub25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm9uRGF0YVNvdXJjZUNoYW5nZSA9IHRoaXMub25EYXRhU291cmNlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0ub25GaWVsZFZhbHVlQ2hhbmdlID0gdGhpcy5vbkZpZWxkVmFsdWVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5zdWJtaXRGb3JtID0gdGhpcy5zdWJtaXRGb3JtLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgb25EYXRhU291cmNlQ2hhbmdlKCkge1xuICAgICAgICBpZiAoXy5nZXQodGhpcy5mb3JtLmZvcm1GaWVsZHMsICdsZW5ndGgnKSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLmlzRGF0YVNvdXJjZVVwZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcm1GaWVsZHMgPSB0aGlzLmZvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuICAgICAgICBmb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaWVsZC5pc0RhdGFTZXRCb3VuZCAmJiBpc0RhdGFTZXRXaWRnZXQoZmllbGQud2lkZ2V0dHlwZSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmllbGRbJ2lzLXJlbGF0ZWQnXSkge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZC5pc0RhdGFTZXRCb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGZldGNoUmVsYXRlZEZpZWxkRGF0YSh0aGlzLmZvcm0uZGF0YXNvdXJjZSwgZmllbGQud2lkZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGVkRmllbGQ6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFmaWVsZDogQUxMRklFTERTLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiAnd2lkZ2V0dHlwZScsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdldERpc3RpbmN0VmFsdWVzRm9yRmllbGQodGhpcy5mb3JtLmRhdGFzb3VyY2UsIGZpZWxkLndpZGdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiAnd2lkZ2V0dHlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVlbXB0eWZpbHRlcjogdGhpcy5mb3JtLmVuYWJsZWVtcHR5ZmlsdGVyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhcHBseUZpbHRlck9uRmllbGQodGhpcy5mb3JtLmRhdGFzb3VyY2UsIGZpZWxkLndpZGdldCwgZm9ybUZpZWxkcywgZmllbGQudmFsdWUsIHtpc0ZpcnN0OiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkZpZWxkRGVmYXVsdFZhbHVlQ2hhbmdlKGZpZWxkLCBudikge1xuICAgICAgICAvLyBJbiBFZGl0LCBkbyAgbm90IHNldCBkZWZhdWx0IHZhbHVlc1xuICAgICAgICBpZiAodGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9ubHkgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAoaXNEZWZpbmVkKG52KSAmJiBudiAhPT0gbnVsbCAmJiBudiAhPT0gJycgJiYgbnYgIT09ICdudWxsJykge1xuICAgICAgICAgICAgZmllbGQudmFsdWUgPSBwYXJzZVZhbHVlQnlUeXBlKG52LCBmaWVsZC50eXBlLCBmaWVsZC53aWRnZXR0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2RlYm91bmNlZFNhdmVQcmV2RGF0YVZhbHVlcygpO1xuICAgIH1cblxuICAgIG9uRmllbGRWYWx1ZUNoYW5nZShmaWVsZCwgbnYpIHtcbiAgICAgICAgYXBwbHlGaWx0ZXJPbkZpZWxkKHRoaXMuZm9ybS5kYXRhc291cmNlLCBmaWVsZC53aWRnZXQsIHRoaXMuZm9ybS5mb3JtRmllbGRzLCBudik7XG4gICAgfVxuXG4gICAgZ2V0QmxvYlVSTChkYXRhT2JqLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGxldCBocmVmID0gJyc7XG4gICAgICAgIGxldCBwcmltYXJ5S2V5cztcbiAgICAgICAgbGV0IHByaW1hcnlLZXk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8ICF0aGlzLmZvcm0uZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuIGhyZWY7XG4gICAgICAgIH1cbiAgICAgICAgcHJpbWFyeUtleXMgPSB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9QUklNQVJZX0tFWSkgfHwgW107XG4gICAgICAgIHByaW1hcnlLZXkgID0gZGF0YU9ialtwcmltYXJ5S2V5c1swXV07XG4gICAgICAgIC8vIFRPRE86IEhhbmRsZSBtb2JpbGUgY2FzZVxuICAgICAgICAvLyBpZiAoQ09OU1RBTlRTLmhhc0NvcmRvdmEgJiYgQ09OU1RBTlRTLmlzUnVuTW9kZSkge1xuICAgICAgICAvLyAgICAgaHJlZiArPSAkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmw7XG4gICAgICAgIC8vIH1cbiAgICAgICAgaHJlZiArPSB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9CTE9CX1VSTCwge1xuICAgICAgICAgICAgcHJpbWFyeVZhbHVlOiBwcmltYXJ5S2V5LFxuICAgICAgICAgICAgY29sdW1uTmFtZToga2V5XG4gICAgICAgIH0pO1xuICAgICAgICBocmVmICs9ICc/JyArIE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHJldHVybiBocmVmO1xuICAgIH1cblxuICAgIHJlc2V0RmlsZVVwbG9hZFdpZGdldChmaWVsZCwgc2tpcFZhbHVlU2V0Pykge1xuICAgICAgICBjb25zdCAkZm9ybUVsZSA9IHRoaXMuZm9ybS4kZWxlbWVudDtcbiAgICAgICAgJGZvcm1FbGUuZmluZCgnW25hbWU9XCInICsgZmllbGQua2V5ICsgJ19mb3JtV2lkZ2V0XCJdJykudmFsKCcnKTtcbiAgICAgICAgZmllbGQuX2NvbnRyb2wucmVzZXQoKTtcbiAgICAgICAgaWYgKCFza2lwVmFsdWVTZXQpIHtcbiAgICAgICAgICAgIGZpZWxkLmhyZWYgPSAnJztcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldERlZmF1bHRWYWx1ZXMoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkZpZWxkRGVmYXVsdFZhbHVlQ2hhbmdlKGZpZWxkLCBmaWVsZC5kZWZhdWx0dmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRGb3JtRGF0YShkYXRhT2JqKSB7XG4gICAgICAgIGlmICghZGF0YU9iaikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcm1GaWVsZHMgPSB0aGlzLmZvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuICAgICAgICBmb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBfLmdldChkYXRhT2JqLCBmaWVsZC5rZXkgfHwgZmllbGQubmFtZSk7XG4gICAgICAgICAgICBpZiAoaXNUaW1lVHlwZShmaWVsZCkpIHtcbiAgICAgICAgICAgICAgICBmaWVsZC52YWx1ZSA9IGdldFZhbGlkVGltZSh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLkJMT0IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0RmlsZVVwbG9hZFdpZGdldChmaWVsZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGQuaHJlZiAgPSB0aGlzLmdldEJsb2JVUkwoZGF0YU9iaiwgZmllbGQua2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGQudmFsdWUgPSBfLmlzU3RyaW5nKHZhbHVlKSA/ICcnIDogdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNhdmVQcmV2RGF0YVZhbHVlcygpO1xuICAgICAgICB0aGlzLmZvcm0uY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgIH1cblxuICAgIG9uRGF0YVNvdXJjZVVwZGF0ZShyZXNwb25zZSwgbmV3Rm9ybSwgdXBkYXRlTW9kZSkge1xuICAgICAgICBpZiAobmV3Rm9ybSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLm5ldygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb3JtLnNldEZvcm1EYXRhKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gaXNEZWZpbmVkKHVwZGF0ZU1vZGUpID8gdXBkYXRlTW9kZSA6IHRydWU7XG4gICAgfVxuXG4gICAgc2F2ZVByZXZmb3JtRmllbGRzKCkge1xuICAgICAgICB0aGlzLmZvcm0ucHJldmZvcm1GaWVsZHMgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5mb3JtLmZvcm1GaWVsZHMubWFwKGZpZWxkID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2tleSc6IGZpZWxkLmtleSxcbiAgICAgICAgICAgICAgICAndHlwZSc6IGZpZWxkLnR5cGUsXG4gICAgICAgICAgICAgICAgJ3dpZGdldHR5cGUnOiBmaWVsZC53aWRnZXR0eXBlLFxuICAgICAgICAgICAgICAgICdvdXRwdXRmb3JtYXQnOiBmaWVsZC5vdXRwdXRmb3JtYXQsXG4gICAgICAgICAgICAgICAgJ3ZhbHVlJzogZmllbGQudmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBnZXRQcmV2Zm9ybUZpZWxkcygpIHtcbiAgICAgICAgdGhpcy5mb3JtLmZvcm1GaWVsZHMubWFwKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByZXZGaWVsZCA9IHRoaXMuZm9ybS5wcmV2Zm9ybUZpZWxkcy5maW5kKHBGaWVsZCA9PiBwRmllbGQua2V5ID09PSBmaWVsZC5rZXkpO1xuICAgICAgICAgICAgZmllbGQudmFsdWUgPSBwcmV2RmllbGQudmFsdWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldERhdGFPYmplY3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9PT0gTGl2ZV9PcGVyYXRpb25zLklOU0VSVCkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZmluZWQodGhpcy5mb3JtLnByZXZEYXRhT2JqZWN0KSAmJiAhaXNFbXB0eU9iamVjdCh0aGlzLmZvcm0ucHJldkRhdGFPYmplY3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuZm9ybS5wcmV2RGF0YU9iamVjdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldENsb25lZE9iamVjdCh0aGlzLmZvcm0uZm9ybWRhdGEgfHwge30pO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdERhdGFPYmplY3QoaXNQcmV2aW91c0RhdGE/KSB7XG4gICAgICAgIGNvbnN0IGRhdGFPYmplY3QgPSB0aGlzLmdldERhdGFPYmplY3QoKTtcbiAgICAgICAgY29uc3QgZm9ybU5hbWUgPSB0aGlzLmZvcm0ubmFtZTtcbiAgICAgICAgbGV0IGZvcm1GaWVsZHM7XG4gICAgICAgIGZvcm1GaWVsZHMgPSBpc1ByZXZpb3VzRGF0YSA/IHRoaXMuZm9ybS5wcmV2Zm9ybUZpZWxkcyA6IHRoaXMuZm9ybS5nZXRGb3JtRmllbGRzKCk7XG4gICAgICAgIGZvcm1GaWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0ZVRpbWUsXG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkVGFyZ2V0ID0gXy5zcGxpdChmaWVsZC5rZXksICcuJyk7XG4gICAgICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZFRhcmdldFswXSB8fCBmaWVsZC5rZXk7XG5cbiAgICAgICAgICAgIC8qY29sbGVjdCB0aGUgdmFsdWVzIGZyb20gdGhlIGZpZWxkcyBhbmQgY29uc3RydWN0IHRoZSBvYmplY3QqL1xuICAgICAgICAgICAgLypGb3JtYXQgdGhlIG91dHB1dCBvZiBkYXRlIHRpbWUgd2lkZ2V0cyB0byB0aGUgZ2l2ZW4gb3V0cHV0IGZvcm1hdCovXG4gICAgICAgICAgICBpZiAoKGZpZWxkLndpZGdldHR5cGUgJiYgaXNEYXRlVGltZVR5cGUoZmllbGQud2lkZ2V0dHlwZSkpIHx8IGlzRGF0ZVRpbWVUeXBlKGZpZWxkLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVUaW1lID0gZ2V0VmFsaWREYXRlT2JqZWN0KGZpZWxkLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkLm91dHB1dGZvcm1hdCA9PT0gRGF0YVR5cGUuVElNRVNUQU1QIHx8IGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLlRJTUVTVEFNUCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkLnZhbHVlID8gZGF0ZVRpbWUgOiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkLm91dHB1dGZvcm1hdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHRoaXMuZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGVUaW1lLCBmaWVsZC5vdXRwdXRmb3JtYXQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLkJMT0IpIHtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZ2V0RmlsZXMoZm9ybU5hbWUsIGZpZWxkTmFtZSArICdfZm9ybVdpZGdldCcsIGZpZWxkLm11bHRpcGxlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmllbGQudHlwZSA9PT0gRGF0YVR5cGUuTElTVCkge1xuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZC52YWx1ZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSAoZmllbGQudmFsdWUgPT09IG51bGwgfHwgZmllbGQudmFsdWUgPT09ICcnKSA/IHVuZGVmaW5lZCA6IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmllbGRUYXJnZXQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgZGF0YU9iamVjdFtmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YU9iamVjdFtmaWVsZE5hbWVdID0gZGF0YU9iamVjdFtmaWVsZE5hbWVdIHx8IHt9O1xuICAgICAgICAgICAgICAgIGRhdGFPYmplY3RbZmllbGROYW1lXVtmaWVsZFRhcmdldFsxXV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFpc1ByZXZpb3VzRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLnVwZGF0ZUZvcm1EYXRhT3V0cHV0KGRhdGFPYmplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybS5kYXRhb3V0cHV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhT2JqZWN0O1xuICAgIH1cblxuICAgIHNldFByaW1hcnlLZXkoZmllbGROYW1lKSB7XG4gICAgICAgIC8qU3RvcmUgdGhlIHByaW1hcnkga2V5IG9mIGRhdGEqL1xuICAgICAgICB0aGlzLmZvcm0ucHJpbWFyeUtleSA9IHRoaXMuZm9ybS5wcmltYXJ5S2V5IHx8IFtdO1xuICAgICAgICBpZiAodGhpcy5mb3JtLnByaW1hcnlLZXkuaW5kZXhPZihmaWVsZE5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLnByaW1hcnlLZXkucHVzaChmaWVsZE5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmluZE9wZXJhdGlvblR5cGUoKSB7XG4gICAgICAgIGxldCBvcGVyYXRpb247XG4gICAgICAgIGxldCBpc1ByaW1hcnkgPSBmYWxzZTtcbiAgICAgICAgY29uc3Qgc291cmNlT3BlcmF0aW9uID0gdGhpcy5mb3JtLmRhdGFzb3VyY2UgJiYgdGhpcy5mb3JtLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfT1BFUkFUSU9OX1RZUEUpO1xuICAgICAgICBpZiAoc291cmNlT3BlcmF0aW9uICYmIHNvdXJjZU9wZXJhdGlvbiAhPT0gJ3JlYWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gc291cmNlT3BlcmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIC8qSWYgT3BlcmF0aW9uVHlwZSBpcyBub3Qgc2V0IHRoZW4gYmFzZWQgb24gdGhlIGZvcm1kYXRhIG9iamVjdCByZXR1cm4gdGhlIG9wZXJhdGlvbiB0eXBlLFxuICAgICAgICAgICAgdGhpcyBjYXNlIG9jY3VycyBvbmx5IGlmIHRoZSBmb3JtIGlzIG91dHNpZGUgYSBsaXZlZ3JpZCovXG4gICAgICAgIC8qSWYgdGhlIGZvcm1kYXRhIG9iamVjdCBoYXMgcHJpbWFyeSBrZXkgdmFsdWUgdGhlbiByZXR1cm4gdXBkYXRlIGVsc2UgaW5zZXJ0Ki9cbiAgICAgICAgaWYgKHRoaXMuZm9ybS5wcmltYXJ5S2V5ICYmICFfLmlzRW1wdHkodGhpcy5mb3JtLmZvcm1kYXRhKSkge1xuICAgICAgICAgICAgLypJZiBvbmx5IG9uZSBjb2x1bW4gaXMgcHJpbWFyeSBrZXkqL1xuICAgICAgICAgICAgaWYgKHRoaXMuZm9ybS5wcmltYXJ5S2V5Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZvcm0uZm9ybWRhdGFbdGhpcy5mb3JtLnByaW1hcnlLZXlbMF1dKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IExpdmVfT3BlcmF0aW9ucy5VUERBVEU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8qSWYgb25seSBubyBjb2x1bW4gaXMgcHJpbWFyeSBrZXkqL1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZvcm0ucHJpbWFyeUtleS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBfLmZvckVhY2godGhpcy5mb3JtLmZvcm1kYXRhLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1ByaW1hcnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzUHJpbWFyeSkge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24gPSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKklmIG11bHRpcGxlIGNvbHVtbnMgYXJlIHByaW1hcnkga2V5Ki9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXNQcmltYXJ5ID0gXy5zb21lKHRoaXMuZm9ybS5wcmltYXJ5S2V5LCAocHJpbWFyeUtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mb3JtLmZvcm1kYXRhW3ByaW1hcnlLZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpc1ByaW1hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gTGl2ZV9PcGVyYXRpb25zLlVQREFURTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9wZXJhdGlvbiB8fCBMaXZlX09wZXJhdGlvbnMuSU5TRVJUO1xuICAgIH1cblxuICAgIGdldFByZXZEYXRhVmFsdWVzKCkge1xuICAgICAgICBjb25zdCBwcmV2RGF0YVZhbHVlcyA9IF8uZnJvbVBhaXJzKF8ubWFwKHRoaXMuZm9ybS5wcmV2RGF0YVZhbHVlcywgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbaXRlbS5rZXksIGl0ZW0udmFsdWVdO1xuICAgICAgICB9KSk7IC8vIENvbnZlcnQgb2YgYXJyYXkgb2YgdmFsdWVzIHRvIGFuIG9iamVjdFxuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gcHJldkRhdGFWYWx1ZXNbZmllbGQua2V5XSB8fCAnJztcbiAgICAgICAgICAgIGZpZWxkLnJlc2V0RGlzcGxheUlucHV0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJldkRhdGFWYWx1ZXM7XG4gICAgfVxuXG4gICAgc2F2ZVByZXZEYXRhVmFsdWVzKCkge1xuICAgICAgICB0aGlzLmZvcm0ucHJldkRhdGFWYWx1ZXMgPSB0aGlzLmZvcm0uZm9ybUZpZWxkcy5tYXAoKG9iaikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHsna2V5Jzogb2JqLmtleSwgJ3ZhbHVlJzogb2JqLnZhbHVlfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZW1wdHlEYXRhTW9kZWwoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGVmaW5lZChmaWVsZCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmllbGQudHlwZSA9PT0gRGF0YVR5cGUuQkxPQikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0RmlsZVVwbG9hZFdpZGdldChmaWVsZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQuZGF0YXZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGVhckRhdGEoKSB7XG4gICAgICAgIHRoaXMuZm9ybS50b2dnbGVNZXNzYWdlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbXB0eURhdGFNb2RlbCgpO1xuICAgIH1cblxuICAgIHNldFJlYWRvbmx5RmllbGRzKCkge1xuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGZpZWxkLnNldFJlYWRPbmx5U3RhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZWRpdCgpIHtcbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0Rm9ybVN0YXRlKCk7XG4gICAgICAgIHRoaXMuZm9ybS5jbGVhck1lc3NhZ2UoKTtcblxuICAgICAgICB0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9IExpdmVfT3BlcmF0aW9ucy5VUERBVEU7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9ybS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVQcmV2Zm9ybUZpZWxkcygpO1xuICAgICAgICAgICAgdGhpcy5zYXZlUHJldkRhdGFWYWx1ZXMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm0ucHJldkRhdGFPYmplY3QgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5mb3JtLmZvcm1kYXRhIHx8IHt9KTtcblxuICAgICAgICB0aGlzLnNldFJlYWRvbmx5RmllbGRzKCk7XG4gICAgICAgIHRoaXMuZm9ybS5pc1VwZGF0ZU1vZGUgPSB0cnVlO1xuXG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgbGV0IHByZXZEYXRhVmFsdWVzO1xuICAgICAgICB0aGlzLmZvcm0ucmVzZXRGb3JtU3RhdGUoKTtcbiAgICAgICAgcHJldkRhdGFWYWx1ZXMgPSB0aGlzLmdldFByZXZEYXRhVmFsdWVzKCk7XG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgaWYgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLkJMT0IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0RmlsZVVwbG9hZFdpZGdldChmaWVsZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGQuaHJlZiA9IHRoaXMuZ2V0QmxvYlVSTChwcmV2RGF0YVZhbHVlcywgZmllbGQua2V5LCBmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZvcm0uY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgIH1cblxuICAgIGNsb3NlRGlhbG9nKCkge1xuICAgICAgICBpZiAodGhpcy5mb3JtLmlzTGF5b3V0RGlhbG9nKSB7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UuY2xvc2UodGhpcy5mb3JtLmRpYWxvZ0lkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNhbmNlbCgpIHtcbiAgICAgICAgdGhpcy5mb3JtLmNsZWFyTWVzc2FnZSgpO1xuICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0KCk7XG4gICAgICAgIC8qU2hvdyB0aGUgcHJldmlvdXMgc2VsZWN0ZWQgZGF0YSovXG4gICAgICAgIGlmICh0aGlzLmZvcm0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5nZXRQcmV2Zm9ybUZpZWxkcygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9ybS5pc1VwZGF0ZU1vZGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jbG9zZURpYWxvZygpO1xuICAgICAgICBpZiAodGhpcy5mb3JtLl9saXZlVGFibGVQYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5fbGl2ZVRhYmxlUGFyZW50Lm9uQ2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIG5ldygpIHtcbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0Rm9ybVN0YXRlKCk7XG4gICAgICAgIHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlID0gTGl2ZV9PcGVyYXRpb25zLklOU0VSVDtcbiAgICAgICAgdGhpcy5mb3JtLmNsZWFyTWVzc2FnZSgpO1xuICAgICAgICBpZiAodGhpcy5mb3JtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVByZXZmb3JtRmllbGRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbXB0eURhdGFNb2RlbCgpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0RGVmYXVsdFZhbHVlcygpO1xuICAgICAgICAgICAgdGhpcy5zYXZlUHJldkRhdGFWYWx1ZXMoKTtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5jb25zdHJ1Y3REYXRhT2JqZWN0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBkZWxldGUoY2FsbEJhY2tGbikge1xuICAgICAgICB0aGlzLmZvcm0ucmVzZXRGb3JtU3RhdGUoKTtcbiAgICAgICAgdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgPSBMaXZlX09wZXJhdGlvbnMuREVMRVRFO1xuICAgICAgICB0aGlzLmZvcm0ucHJldkRhdGFPYmplY3QgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5mb3JtLmZvcm1kYXRhIHx8IHt9KTtcbiAgICAgICAgdGhpcy5mb3JtLnNhdmUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2FsbEJhY2tGbik7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdXNlIHRvIHNhdmUgdGhlIGZvcm0gYW5kIG9wZW4gbmV3IGZvcm0gYWZ0ZXIgc2F2ZVxuICAgIHNhdmVBbmROZXcoKSB7XG4gICAgICAgIHRoaXMuc2F2ZSh1bmRlZmluZWQsIHRydWUsIHRydWUpO1xuICAgIH1cbiAgICAvLyBGdW5jdGlvbiB1c2UgdG8gc2F2ZSB0aGUgZm9ybSBhbmQgb3BlbiBuZXcgZm9ybSBhZnRlciBzYXZlXG4gICAgc2F2ZUFuZFZpZXcoKSB7XG4gICAgICAgIHRoaXMuc2F2ZSh1bmRlZmluZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBzdWJtaXRGb3JtKCRldmVudCkge1xuICAgICAgICB0aGlzLnNhdmUoJGV2ZW50KTtcbiAgICB9XG5cbiAgICBzYXZlKGV2ZW50PywgdXBkYXRlTW9kZT8sIG5ld0Zvcm0/KSB7XG4gICAgICAgIGlmICghdGhpcy5mb3JtLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YSwgcHJldkRhdGEsIG9wZXJhdGlvblR5cGUsIGlzVmFsaWQ7XG4gICAgICAgIGNvbnN0IHJlcXVlc3REYXRhOiBhbnkgPSB7fTtcblxuICAgICAgICBvcGVyYXRpb25UeXBlID0gdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgPSB0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSB8fCB0aGlzLmZpbmRPcGVyYXRpb25UeXBlKCk7XG5cbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgZm9ybSBzdWJtaXQgaWYgZm9ybSBpcyBpbiBpbnZhbGlkIHN0YXRlLlxuICAgICAgICBpZiAodGhpcy5mb3JtLnZhbGlkYXRlRmllbGRzT25TdWJtaXQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YSA9IGdldENsb25lZE9iamVjdCh0aGlzLmZvcm0uY29uc3RydWN0RGF0YU9iamVjdCgpKTtcbiAgICAgICAgcHJldkRhdGEgPSB0aGlzLmZvcm0ucHJldmZvcm1GaWVsZHMgPyB0aGlzLmZvcm0uY29uc3RydWN0RGF0YU9iamVjdCh0cnVlKSA6IGRhdGE7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSB0aGlzLmZvcm0uaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlc2VydmljZWNhbGwnLCB7JGV2ZW50OiBldmVudCwgJG9wZXJhdGlvbjogdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUsICRkYXRhOiBkYXRhLCBvcHRpb25zOiByZXF1ZXN0RGF0YX0pO1xuICAgICAgICAgICAgaWYgKGlzVmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzVmFsaWQgJiYgaXNWYWxpZC5lcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS50b2dnbGVNZXNzYWdlKHRydWUsIGlzVmFsaWQuZXJyb3IsICdlcnJvcicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLm1lc3NhZ2UgPT09ICdBYm9ydCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBvcGVyYXRpb24gaXMgdXBkYXRlLCBmb3JtIGlzIG5vdCB0b3VjaGVkIGFuZCBjdXJyZW50IGRhdGEgYW5kIHByZXZpb3VzIGRhdGEgaXMgc2FtZSwgU2hvdyBubyBjaGFuZ2VzIGRldGVjdGVkIG1lc3NhZ2VcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlID09PSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFICYmIHRoaXMuZm9ybS5uZ2Zvcm0gJiYgdGhpcy5mb3JtLm5nZm9ybS5wcmlzdGluZSAmJlxuICAgICAgICAgICAgICAgICh0aGlzLmZvcm0uaXNTZWxlY3RlZCAmJiBfLmlzRXF1YWwoZGF0YSwgcHJldkRhdGEpKSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgdGhpcy5mb3JtLmFwcExvY2FsZS5NRVNTQUdFX05PX0NIQU5HRVMsICdpbmZvJywgJycpO1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0Rm9ybVN0YXRlKCk7XG5cbiAgICAgICAgcmVxdWVzdERhdGEucm93ID0gZGF0YTtcbiAgICAgICAgcmVxdWVzdERhdGEudHJhbnNmb3JtID0gdHJ1ZTtcbiAgICAgICAgcmVxdWVzdERhdGEuc2tpcE5vdGlmaWNhdGlvbiA9IHRydWU7XG5cbiAgICAgICAgaWYgKG9wZXJhdGlvblR5cGUgPT09IExpdmVfT3BlcmF0aW9ucy5VUERBVEUpIHtcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLnJvd0RhdGEgPSB0aGlzLmZvcm0uZm9ybWRhdGE7XG4gICAgICAgICAgICByZXF1ZXN0RGF0YS5wcmV2RGF0YSA9IHByZXZEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgcGVyZm9ybURhdGFPcGVyYXRpb24odGhpcy5mb3JtLmRhdGFzb3VyY2UsIHJlcXVlc3REYXRhLCB7XG4gICAgICAgICAgICBvcGVyYXRpb25UeXBlOiBvcGVyYXRpb25UeXBlXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtc2cgPSBvcGVyYXRpb25UeXBlID09PSBMaXZlX09wZXJhdGlvbnMuSU5TRVJUID8gdGhpcy5mb3JtLmluc2VydG1lc3NhZ2UgOiAob3BlcmF0aW9uVHlwZSA9PT0gTGl2ZV9PcGVyYXRpb25zLlVQREFURSA/XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLnVwZGF0ZW1lc3NhZ2UgOiB0aGlzLmZvcm0uZGVsZXRlbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIGlmIChvcGVyYXRpb25UeXBlID09PSBMaXZlX09wZXJhdGlvbnMuREVMRVRFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLm9uUmVzdWx0KHJlcXVlc3REYXRhLnJvdywgdHJ1ZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlEYXRhTW9kZWwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0ucHJldkRhdGFWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0ub25SZXN1bHQocmVzcG9uc2UsIHRydWUsIGV2ZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5mb3JtLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgbXNnLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZm9ybS5fbGl2ZVRhYmxlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0IHRoZSBjdXJyZW50IHVwZGF0ZWQgcm93XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLl9saXZlVGFibGVQYXJlbnQub25SZXN1bHQob3BlcmF0aW9uVHlwZSwgcmVzcG9uc2UsIG5ld0Zvcm0sIHVwZGF0ZU1vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvKmdldCB1cGRhdGVkIGRhdGEgd2l0aG91dCByZWZyZXNoaW5nIHBhZ2UqL1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uTElTVF9SRUNPUkRTLCB7XG4gICAgICAgICAgICAgICAgICAgICdza2lwVG9nZ2xlU3RhdGUnOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkRhdGFTb3VyY2VVcGRhdGUocmVzcG9uc2UsIG5ld0Zvcm0sIHVwZGF0ZU1vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5vblJlc3VsdChlcnJvciwgZmFsc2UsIGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuZm9ybS50b2dnbGVNZXNzYWdlKHRydWUsIGVycm9yLCAnZXJyb3InKTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19