import { Directive, Inject, Optional, Self, Attribute } from '@angular/core';
import { $appDigest, AbstractDialogService, DataSource, DataType, debounce, getClonedObject, getFiles, getValidDateObject, isDateTimeType, isDefined, isEmptyObject } from '@wm/core';
import { registerLiveFormProps } from '../form.props';
import { FormComponent } from '../form.component';
import { ALLFIELDS, applyFilterOnField, fetchRelatedFieldData, getDistinctValuesForField, Live_Operations, performDataOperation } from '../../../../utils/data-utils';
import { ToDatePipe } from '../../../../pipes/custom-pipes';
import { parseValueByType } from '../../../../utils/live-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';
import { LiveTableComponent } from '../../live-table/live-table.component';
const isTimeType = field => field.widgettype === DataType.TIME || (field.type === DataType.TIME && !field.widgettype);
const ɵ0 = isTimeType;
const getValidTime = val => {
    if (val) {
        const date = (new Date()).toDateString();
        return (new Date(`${date} ${val}`)).getTime();
    }
    return undefined;
};
const ɵ1 = getValidTime;
export class LiveFormDirective {
    constructor(form, liveTable, datePipe, dialogService, formlayout) {
        this.form = form;
        this.datePipe = datePipe;
        this.dialogService = dialogService;
        this._debouncedSavePrevDataValues = debounce(() => {
            this.savePrevDataValues();
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
    onDataSourceChange() {
        if (_.get(this.form.formFields, 'length')) {
            this.form.isDataSourceUpdated = true;
        }
        const formFields = this.form.getFormFields();
        formFields.forEach(field => {
            if (!field.isDataSetBound && isDataSetWidget(field.widgettype)) {
                if (field['is-related']) {
                    field.isDataSetBound = true;
                    fetchRelatedFieldData(this.form.datasource, field.widget, {
                        relatedField: field.key,
                        datafield: ALLFIELDS,
                        widget: 'widgettype',
                    });
                }
                else {
                    getDistinctValuesForField(this.form.datasource, field.widget, {
                        widget: 'widgettype',
                        enableemptyfilter: this.form.enableemptyfilter
                    });
                    applyFilterOnField(this.form.datasource, field.widget, formFields, field.value, { isFirst: true });
                }
            }
        });
    }
    onFieldDefaultValueChange(field, nv) {
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
    }
    onFieldValueChange(field, nv) {
        applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv);
    }
    getBlobURL(dataObj, key, value) {
        let href = '';
        let primaryKeys;
        let primaryKey;
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
    }
    resetFileUploadWidget(field, skipValueSet) {
        const $formEle = this.form.$element;
        $formEle.find('[name="' + field.key + '_formWidget"]').val('');
        field._control.reset();
        if (!skipValueSet) {
            field.href = '';
            field.value = null;
        }
    }
    setDefaultValues() {
        this.form.formFields.forEach(field => {
            this.onFieldDefaultValueChange(field, field.defaultvalue);
        });
    }
    setFormData(dataObj) {
        if (!dataObj) {
            return;
        }
        const formFields = this.form.getFormFields();
        formFields.forEach(field => {
            const value = _.get(dataObj, field.key || field.name);
            if (isTimeType(field)) {
                field.value = getValidTime(value);
            }
            else if (field.type === DataType.BLOB) {
                this.resetFileUploadWidget(field, true);
                field.href = this.getBlobURL(dataObj, field.key, value);
                field.value = _.isString(value) ? '' : value;
            }
            else {
                field.value = value;
            }
        });
        this.savePrevDataValues();
        this.form.constructDataObject();
    }
    onDataSourceUpdate(response, newForm, updateMode) {
        if (newForm) {
            this.form.new();
        }
        else {
            this.form.setFormData(response);
            this.closeDialog();
        }
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : true;
    }
    savePrevformFields() {
        this.form.prevformFields = getClonedObject(this.form.formFields.map(field => {
            return {
                'key': field.key,
                'type': field.type,
                'widgettype': field.widgettype,
                'outputformat': field.outputformat,
                'value': field.value
            };
        }));
    }
    getPrevformFields() {
        this.form.formFields.map(field => {
            const prevField = this.form.prevformFields.find(pField => pField.key === field.key);
            field.value = prevField.value;
        });
    }
    getDataObject() {
        if (this.form.operationType === Live_Operations.INSERT) {
            return {};
        }
        if (isDefined(this.form.prevDataObject) && !isEmptyObject(this.form.prevDataObject)) {
            return getClonedObject(this.form.prevDataObject);
        }
        return getClonedObject(this.form.formdata || {});
    }
    constructDataObject(isPreviousData) {
        const dataObject = this.getDataObject();
        const formName = this.form.name;
        let formFields;
        formFields = isPreviousData ? this.form.prevformFields : this.form.getFormFields();
        formFields.forEach(field => {
            let dateTime, fieldValue;
            const fieldTarget = _.split(field.key, '.');
            const fieldName = fieldTarget[0] || field.key;
            /*collect the values from the fields and construct the object*/
            /*Format the output of date time widgets to the given output format*/
            if ((field.widgettype && isDateTimeType(field.widgettype)) || isDateTimeType(field.type)) {
                if (field.value) {
                    dateTime = getValidDateObject(field.value);
                    if (field.outputformat === DataType.TIMESTAMP || field.type === DataType.TIMESTAMP) {
                        fieldValue = field.value ? dateTime : null;
                    }
                    else if (field.outputformat) {
                        fieldValue = this.datePipe.transform(dateTime, field.outputformat);
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
    }
    setPrimaryKey(fieldName) {
        /*Store the primary key of data*/
        this.form.primaryKey = this.form.primaryKey || [];
        if (this.form.primaryKey.indexOf(fieldName) === -1) {
            this.form.primaryKey.push(fieldName);
        }
    }
    findOperationType() {
        let operation;
        let isPrimary = false;
        const sourceOperation = this.form.datasource && this.form.datasource.execute(DataSource.Operation.GET_OPERATION_TYPE);
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
                _.forEach(this.form.formdata, (value) => {
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
                isPrimary = _.some(this.form.primaryKey, (primaryKey) => {
                    if (this.form.formdata[primaryKey]) {
                        return true;
                    }
                });
                if (isPrimary) {
                    operation = Live_Operations.UPDATE;
                }
            }
        }
        return operation || Live_Operations.INSERT;
    }
    getPrevDataValues() {
        const prevDataValues = _.fromPairs(_.map(this.form.prevDataValues, (item) => {
            return [item.key, item.value];
        })); // Convert of array of values to an object
        this.form.formFields.forEach(field => {
            field.value = prevDataValues[field.key] || '';
            field.resetDisplayInput();
        });
        return prevDataValues;
    }
    savePrevDataValues() {
        this.form.prevDataValues = this.form.formFields.map((obj) => {
            return { 'key': obj.key, 'value': obj.value };
        });
    }
    emptyDataModel() {
        this.form.formFields.forEach(field => {
            if (isDefined(field)) {
                if (field.type === DataType.BLOB) {
                    this.resetFileUploadWidget(field);
                }
                else {
                    field.datavalue = '';
                }
            }
        });
    }
    clearData() {
        this.form.toggleMessage(false);
        this.emptyDataModel();
    }
    setReadonlyFields() {
        this.form.formFields.forEach(field => {
            field.setReadOnlyState();
        });
    }
    edit() {
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
    }
    reset() {
        let prevDataValues;
        this.form.resetFormState();
        prevDataValues = this.getPrevDataValues();
        this.form.formFields.forEach(field => {
            if (field.type === DataType.BLOB) {
                this.resetFileUploadWidget(field, true);
                field.href = this.getBlobURL(prevDataValues, field.key, field.value);
            }
        });
        this.form.constructDataObject();
    }
    closeDialog() {
        if (this.form.isLayoutDialog) {
            this.dialogService.close(this.form.dialogId);
        }
    }
    cancel() {
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
    }
    new() {
        this.form.resetFormState();
        this.form.operationType = Live_Operations.INSERT;
        this.form.clearMessage();
        if (this.form.isSelected) {
            this.savePrevformFields();
        }
        this.emptyDataModel();
        setTimeout(() => {
            this.setDefaultValues();
            this.savePrevDataValues();
            this.form.constructDataObject();
        });
        this.form.isUpdateMode = true;
    }
    delete(callBackFn) {
        this.form.resetFormState();
        this.form.operationType = Live_Operations.DELETE;
        this.form.prevDataObject = getClonedObject(this.form.formdata || {});
        this.form.save(undefined, undefined, undefined, callBackFn);
    }
    // Function use to save the form and open new form after save
    saveAndNew() {
        this.save(undefined, true, true);
    }
    // Function use to save the form and open new form after save
    saveAndView() {
        this.save(undefined, false);
    }
    submitForm($event) {
        this.save($event);
    }
    save(event, updateMode, newForm) {
        if (!this.form.datasource) {
            return;
        }
        let data, prevData, operationType, isValid;
        const requestData = {};
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
        }).then((response) => {
            const msg = operationType === Live_Operations.INSERT ? this.form.insertmessage : (operationType === Live_Operations.UPDATE ?
                this.form.updatemessage : this.form.deletemessage);
            if (operationType === Live_Operations.DELETE) {
                this.form.onResult(requestData.row, true, event);
                this.emptyDataModel();
                this.form.prevDataValues = [];
                this.form.isSelected = false;
            }
            else {
                this.form.onResult(response, true, event);
            }
            this.form.toggleMessage(true, msg, 'success');
            if (this.form._liveTableParent) {
                // highlight the current updated row
                this.form._liveTableParent.onResult(operationType, response, newForm, updateMode);
            }
            else {
                /*get updated data without refreshing page*/
                this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                    'skipToggleState': true
                });
                this.onDataSourceUpdate(response, newForm, updateMode);
            }
        }, (error) => {
            this.form.onResult(error, false, event);
            this.form.toggleMessage(true, error, 'error');
            $appDigest();
        });
    }
}
LiveFormDirective.initializeProps = registerLiveFormProps();
LiveFormDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmLiveForm]'
            },] }
];
/** @nocollapse */
LiveFormDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [FormComponent,] }] },
    { type: LiveTableComponent, decorators: [{ type: Optional }] },
    { type: ToDatePipe },
    { type: AbstractDialogService },
    { type: String, decorators: [{ type: Attribute, args: ['formlayout',] }] }
];
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1mb3JtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9saXZlLWZvcm0vbGl2ZS1mb3JtLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RSxPQUFPLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEwsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLHlCQUF5QixFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3RLLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFJM0UsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMs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LFNBQUMsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBPcHRpb25hbCwgU2VsZiwgQXR0cmlidXRlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIEFic3RyYWN0RGlhbG9nU2VydmljZSwgRGF0YVNvdXJjZSwgRGF0YVR5cGUsIGRlYm91bmNlLCBnZXRDbG9uZWRPYmplY3QsIGdldEZpbGVzLCBnZXRWYWxpZERhdGVPYmplY3QsIGlzRGF0ZVRpbWVUeXBlLCBpc0RlZmluZWQsIGlzRW1wdHlPYmplY3QgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyTGl2ZUZvcm1Qcm9wcyB9IGZyb20gJy4uL2Zvcm0ucHJvcHMnO1xuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Zvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IEFMTEZJRUxEUywgYXBwbHlGaWx0ZXJPbkZpZWxkLCBmZXRjaFJlbGF0ZWRGaWVsZERhdGEsIGdldERpc3RpbmN0VmFsdWVzRm9yRmllbGQsIExpdmVfT3BlcmF0aW9ucywgcGVyZm9ybURhdGFPcGVyYXRpb24gfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7IFRvRGF0ZVBpcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9waXBlcy9jdXN0b20tcGlwZXMnO1xuaW1wb3J0IHsgcGFyc2VWYWx1ZUJ5VHlwZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2xpdmUtdXRpbHMnO1xuaW1wb3J0IHsgaXNEYXRhU2V0V2lkZ2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IExpdmVUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2xpdmUtdGFibGUvbGl2ZS10YWJsZS5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IGlzVGltZVR5cGUgPSBmaWVsZCA9PiBmaWVsZC53aWRnZXR0eXBlID09PSBEYXRhVHlwZS5USU1FIHx8IChmaWVsZC50eXBlID09PSBEYXRhVHlwZS5USU1FICYmICFmaWVsZC53aWRnZXR0eXBlKTtcbmNvbnN0IGdldFZhbGlkVGltZSA9IHZhbCA9PiB7XG4gICAgaWYgKHZhbCkge1xuICAgICAgICBjb25zdCBkYXRlID0gKG5ldyBEYXRlKCkpLnRvRGF0ZVN0cmluZygpO1xuICAgICAgICByZXR1cm4gKG5ldyBEYXRlKGAke2RhdGV9ICR7dmFsfWApKS5nZXRUaW1lKCk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUxpdmVGb3JtXSdcbn0pXG5leHBvcnQgY2xhc3MgTGl2ZUZvcm1EaXJlY3RpdmUge1xuICAgIHN0YXRpYyAgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJMaXZlRm9ybVByb3BzKCk7XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkU2F2ZVByZXZEYXRhVmFsdWVzID0gZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICB0aGlzLnNhdmVQcmV2RGF0YVZhbHVlcygpO1xuICAgIH0sIDI1MCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgQFNlbGYoKSBASW5qZWN0KEZvcm1Db21wb25lbnQpIHByaXZhdGUgZm9ybSxcbiAgICAgICAgQE9wdGlvbmFsKCkgbGl2ZVRhYmxlOiBMaXZlVGFibGVDb21wb25lbnQsXG4gICAgICAgIHB1YmxpYyBkYXRlUGlwZTogVG9EYXRlUGlwZSxcbiAgICAgICAgcHJpdmF0ZSBkaWFsb2dTZXJ2aWNlOiBBYnN0cmFjdERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Zvcm1sYXlvdXQnKSBmb3JtbGF5b3V0OiBzdHJpbmdcbiAgICApIHtcbiAgICAgICAgLy8gSWYgcGFyZW50IGxpdmUgdGFibGUgaXMgcHJlc2VudCBhbmQgdGhpcyBmb3JtIGlzIGZpcnN0IGNoaWxkIG9mIGxpdmUgdGFibGUsIHNldCB0aGlzIGZvcm0gaW5zdGFuY2Ugb24gbGl2ZXRhYmxlXG4gICAgICAgIGlmIChsaXZlVGFibGUgJiYgIXRoaXMuZm9ybS5wYXJlbnRGb3JtKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm0uX2xpdmVUYWJsZVBhcmVudCA9IGxpdmVUYWJsZTtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5pc0xheW91dERpYWxvZyA9IGxpdmVUYWJsZS5pc0xheW91dERpYWxvZztcbiAgICAgICAgICAgIGxpdmVUYWJsZS5vbkZvcm1SZWFkeSh0aGlzLmZvcm0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb3JtLmlzTGF5b3V0RGlhbG9nID0gZm9ybWxheW91dCA9PT0gJ2RpYWxvZyc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ1VEIG9wZXJhdGlvbnNcbiAgICAgICAgZm9ybS5lZGl0ID0gdGhpcy5lZGl0LmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uY2FuY2VsID0gdGhpcy5jYW5jZWwuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5yZXNldCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5uZXcgPSB0aGlzLm5ldy5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLmRlbGV0ZSA9IHRoaXMuZGVsZXRlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uc2F2ZSA9IHRoaXMuc2F2ZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLnNhdmVBbmROZXcgPSB0aGlzLnNhdmVBbmROZXcuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5zYXZlQW5kVmlldyA9IHRoaXMuc2F2ZUFuZFZpZXcuYmluZCh0aGlzKTtcblxuICAgICAgICBmb3JtLnNldFByaW1hcnlLZXkgPSB0aGlzLnNldFByaW1hcnlLZXkuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5jb25zdHJ1Y3REYXRhT2JqZWN0ID0gdGhpcy5jb25zdHJ1Y3REYXRhT2JqZWN0LmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uY2hhbmdlRGF0YU9iamVjdCA9IHRoaXMuc2V0Rm9ybURhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5zZXRGb3JtRGF0YSA9IHRoaXMuc2V0Rm9ybURhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5maW5kT3BlcmF0aW9uVHlwZSA9IHRoaXMuZmluZE9wZXJhdGlvblR5cGUuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5jbGVhckRhdGEgPSB0aGlzLmNsZWFyRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm9uRmllbGREZWZhdWx0VmFsdWVDaGFuZ2UgPSB0aGlzLm9uRmllbGREZWZhdWx0VmFsdWVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgZm9ybS5vbkRhdGFTb3VyY2VDaGFuZ2UgPSB0aGlzLm9uRGF0YVNvdXJjZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICBmb3JtLm9uRmllbGRWYWx1ZUNoYW5nZSA9IHRoaXMub25GaWVsZFZhbHVlQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIGZvcm0uc3VibWl0Rm9ybSA9IHRoaXMuc3VibWl0Rm9ybS5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIG9uRGF0YVNvdXJjZUNoYW5nZSgpIHtcbiAgICAgICAgaWYgKF8uZ2V0KHRoaXMuZm9ybS5mb3JtRmllbGRzLCAnbGVuZ3RoJykpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5pc0RhdGFTb3VyY2VVcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb3JtRmllbGRzID0gdGhpcy5mb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICAgICAgZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGlmICghZmllbGQuaXNEYXRhU2V0Qm91bmQgJiYgaXNEYXRhU2V0V2lkZ2V0KGZpZWxkLndpZGdldHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkWydpcy1yZWxhdGVkJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQuaXNEYXRhU2V0Qm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBmZXRjaFJlbGF0ZWRGaWVsZERhdGEodGhpcy5mb3JtLmRhdGFzb3VyY2UsIGZpZWxkLndpZGdldCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZEZpZWxkOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhZmllbGQ6IEFMTEZJRUxEUyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogJ3dpZGdldHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnZXREaXN0aW5jdFZhbHVlc0ZvckZpZWxkKHRoaXMuZm9ybS5kYXRhc291cmNlLCBmaWVsZC53aWRnZXQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogJ3dpZGdldHR5cGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZW1wdHlmaWx0ZXI6IHRoaXMuZm9ybS5lbmFibGVlbXB0eWZpbHRlclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHlGaWx0ZXJPbkZpZWxkKHRoaXMuZm9ybS5kYXRhc291cmNlLCBmaWVsZC53aWRnZXQsIGZvcm1GaWVsZHMsIGZpZWxkLnZhbHVlLCB7aXNGaXJzdDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZShmaWVsZCwgbnYpIHtcbiAgICAgICAgLy8gSW4gRWRpdCwgZG8gIG5vdCBzZXQgZGVmYXVsdCB2YWx1ZXNcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlID09PSAndXBkYXRlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldCB0aGUgZGVmYXVsdCB2YWx1ZSBvbmx5IGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChudikgJiYgbnYgIT09IG51bGwgJiYgbnYgIT09ICcnICYmIG52ICE9PSAnbnVsbCcpIHtcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gcGFyc2VWYWx1ZUJ5VHlwZShudiwgZmllbGQudHlwZSwgZmllbGQud2lkZ2V0dHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9kZWJvdW5jZWRTYXZlUHJldkRhdGFWYWx1ZXMoKTtcbiAgICB9XG5cbiAgICBvbkZpZWxkVmFsdWVDaGFuZ2UoZmllbGQsIG52KSB7XG4gICAgICAgIGFwcGx5RmlsdGVyT25GaWVsZCh0aGlzLmZvcm0uZGF0YXNvdXJjZSwgZmllbGQud2lkZ2V0LCB0aGlzLmZvcm0uZm9ybUZpZWxkcywgbnYpO1xuICAgIH1cblxuICAgIGdldEJsb2JVUkwoZGF0YU9iaiwga2V5LCB2YWx1ZSkge1xuICAgICAgICBsZXQgaHJlZiA9ICcnO1xuICAgICAgICBsZXQgcHJpbWFyeUtleXM7XG4gICAgICAgIGxldCBwcmltYXJ5S2V5O1xuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCAhdGhpcy5mb3JtLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBocmVmO1xuICAgICAgICB9XG4gICAgICAgIHByaW1hcnlLZXlzID0gdGhpcy5mb3JtLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUFJJTUFSWV9LRVkpIHx8IFtdO1xuICAgICAgICBwcmltYXJ5S2V5ICA9IGRhdGFPYmpbcHJpbWFyeUtleXNbMF1dO1xuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgbW9iaWxlIGNhc2VcbiAgICAgICAgLy8gaWYgKENPTlNUQU5UUy5oYXNDb3Jkb3ZhICYmIENPTlNUQU5UUy5pc1J1bk1vZGUpIHtcbiAgICAgICAgLy8gICAgIGhyZWYgKz0gJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsO1xuICAgICAgICAvLyB9XG4gICAgICAgIGhyZWYgKz0gdGhpcy5mb3JtLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfQkxPQl9VUkwsIHtcbiAgICAgICAgICAgIHByaW1hcnlWYWx1ZTogcHJpbWFyeUtleSxcbiAgICAgICAgICAgIGNvbHVtbk5hbWU6IGtleVxuICAgICAgICB9KTtcbiAgICAgICAgaHJlZiArPSAnPycgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgICByZXR1cm4gaHJlZjtcbiAgICB9XG5cbiAgICByZXNldEZpbGVVcGxvYWRXaWRnZXQoZmllbGQsIHNraXBWYWx1ZVNldD8pIHtcbiAgICAgICAgY29uc3QgJGZvcm1FbGUgPSB0aGlzLmZvcm0uJGVsZW1lbnQ7XG4gICAgICAgICRmb3JtRWxlLmZpbmQoJ1tuYW1lPVwiJyArIGZpZWxkLmtleSArICdfZm9ybVdpZGdldFwiXScpLnZhbCgnJyk7XG4gICAgICAgIGZpZWxkLl9jb250cm9sLnJlc2V0KCk7XG4gICAgICAgIGlmICghc2tpcFZhbHVlU2V0KSB7XG4gICAgICAgICAgICBmaWVsZC5ocmVmID0gJyc7XG4gICAgICAgICAgICBmaWVsZC52YWx1ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXREZWZhdWx0VmFsdWVzKCkge1xuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIHRoaXMub25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZShmaWVsZCwgZmllbGQuZGVmYXVsdHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0Rm9ybURhdGEoZGF0YU9iaikge1xuICAgICAgICBpZiAoIWRhdGFPYmopIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmb3JtRmllbGRzID0gdGhpcy5mb3JtLmdldEZvcm1GaWVsZHMoKTtcbiAgICAgICAgZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gXy5nZXQoZGF0YU9iaiwgZmllbGQua2V5IHx8IGZpZWxkLm5hbWUpO1xuICAgICAgICAgICAgaWYgKGlzVGltZVR5cGUoZmllbGQpKSB7XG4gICAgICAgICAgICAgICAgZmllbGQudmFsdWUgPSBnZXRWYWxpZFRpbWUodmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWVsZC50eXBlID09PSBEYXRhVHlwZS5CTE9CKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEZpbGVVcGxvYWRXaWRnZXQoZmllbGQsIHRydWUpO1xuICAgICAgICAgICAgICAgIGZpZWxkLmhyZWYgID0gdGhpcy5nZXRCbG9iVVJMKGRhdGFPYmosIGZpZWxkLmtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gXy5pc1N0cmluZyh2YWx1ZSkgPyAnJyA6IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zYXZlUHJldkRhdGFWYWx1ZXMoKTtcbiAgICAgICAgdGhpcy5mb3JtLmNvbnN0cnVjdERhdGFPYmplY3QoKTtcbiAgICB9XG5cbiAgICBvbkRhdGFTb3VyY2VVcGRhdGUocmVzcG9uc2UsIG5ld0Zvcm0sIHVwZGF0ZU1vZGUpIHtcbiAgICAgICAgaWYgKG5ld0Zvcm0pIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5uZXcoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5zZXRGb3JtRGF0YShyZXNwb25zZSk7XG4gICAgICAgICAgICB0aGlzLmNsb3NlRGlhbG9nKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JtLmlzVXBkYXRlTW9kZSA9IGlzRGVmaW5lZCh1cGRhdGVNb2RlKSA/IHVwZGF0ZU1vZGUgOiB0cnVlO1xuICAgIH1cblxuICAgIHNhdmVQcmV2Zm9ybUZpZWxkcygpIHtcbiAgICAgICAgdGhpcy5mb3JtLnByZXZmb3JtRmllbGRzID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuZm9ybS5mb3JtRmllbGRzLm1hcChmaWVsZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICdrZXknOiBmaWVsZC5rZXksXG4gICAgICAgICAgICAgICAgJ3R5cGUnOiBmaWVsZC50eXBlLFxuICAgICAgICAgICAgICAgICd3aWRnZXR0eXBlJzogZmllbGQud2lkZ2V0dHlwZSxcbiAgICAgICAgICAgICAgICAnb3V0cHV0Zm9ybWF0JzogZmllbGQub3V0cHV0Zm9ybWF0LFxuICAgICAgICAgICAgICAgICd2YWx1ZSc6IGZpZWxkLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgZ2V0UHJldmZvcm1GaWVsZHMoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5mb3JtRmllbGRzLm1hcChmaWVsZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcmV2RmllbGQgPSB0aGlzLmZvcm0ucHJldmZvcm1GaWVsZHMuZmluZChwRmllbGQgPT4gcEZpZWxkLmtleSA9PT0gZmllbGQua2V5KTtcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gcHJldkZpZWxkLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXREYXRhT2JqZWN0KCkge1xuICAgICAgICBpZiAodGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgPT09IExpdmVfT3BlcmF0aW9ucy5JTlNFUlQpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNEZWZpbmVkKHRoaXMuZm9ybS5wcmV2RGF0YU9iamVjdCkgJiYgIWlzRW1wdHlPYmplY3QodGhpcy5mb3JtLnByZXZEYXRhT2JqZWN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGdldENsb25lZE9iamVjdCh0aGlzLmZvcm0ucHJldkRhdGFPYmplY3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRDbG9uZWRPYmplY3QodGhpcy5mb3JtLmZvcm1kYXRhIHx8IHt9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3REYXRhT2JqZWN0KGlzUHJldmlvdXNEYXRhPykge1xuICAgICAgICBjb25zdCBkYXRhT2JqZWN0ID0gdGhpcy5nZXREYXRhT2JqZWN0KCk7XG4gICAgICAgIGNvbnN0IGZvcm1OYW1lID0gdGhpcy5mb3JtLm5hbWU7XG4gICAgICAgIGxldCBmb3JtRmllbGRzO1xuICAgICAgICBmb3JtRmllbGRzID0gaXNQcmV2aW91c0RhdGEgPyB0aGlzLmZvcm0ucHJldmZvcm1GaWVsZHMgOiB0aGlzLmZvcm0uZ2V0Rm9ybUZpZWxkcygpO1xuICAgICAgICBmb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGVUaW1lLFxuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICBjb25zdCBmaWVsZFRhcmdldCA9IF8uc3BsaXQoZmllbGQua2V5LCAnLicpO1xuICAgICAgICAgICAgY29uc3QgZmllbGROYW1lID0gZmllbGRUYXJnZXRbMF0gfHwgZmllbGQua2V5O1xuXG4gICAgICAgICAgICAvKmNvbGxlY3QgdGhlIHZhbHVlcyBmcm9tIHRoZSBmaWVsZHMgYW5kIGNvbnN0cnVjdCB0aGUgb2JqZWN0Ki9cbiAgICAgICAgICAgIC8qRm9ybWF0IHRoZSBvdXRwdXQgb2YgZGF0ZSB0aW1lIHdpZGdldHMgdG8gdGhlIGdpdmVuIG91dHB1dCBmb3JtYXQqL1xuICAgICAgICAgICAgaWYgKChmaWVsZC53aWRnZXR0eXBlICYmIGlzRGF0ZVRpbWVUeXBlKGZpZWxkLndpZGdldHR5cGUpKSB8fCBpc0RhdGVUaW1lVHlwZShmaWVsZC50eXBlKSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRlVGltZSA9IGdldFZhbGlkRGF0ZU9iamVjdChmaWVsZC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWVsZC5vdXRwdXRmb3JtYXQgPT09IERhdGFUeXBlLlRJTUVTVEFNUCB8fCBmaWVsZC50eXBlID09PSBEYXRhVHlwZS5USU1FU1RBTVApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZC52YWx1ZSA/IGRhdGVUaW1lIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaWVsZC5vdXRwdXRmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB0aGlzLmRhdGVQaXBlLnRyYW5zZm9ybShkYXRlVGltZSwgZmllbGQub3V0cHV0Zm9ybWF0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWVsZC50eXBlID09PSBEYXRhVHlwZS5CTE9CKSB7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGdldEZpbGVzKGZvcm1OYW1lLCBmaWVsZE5hbWUgKyAnX2Zvcm1XaWRnZXQnLCBmaWVsZC5tdWx0aXBsZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLkxJU1QpIHtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGQudmFsdWUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gKGZpZWxkLnZhbHVlID09PSBudWxsIHx8IGZpZWxkLnZhbHVlID09PSAnJykgPyB1bmRlZmluZWQgOiBmaWVsZC52YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpZWxkVGFyZ2V0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRhdGFPYmplY3RbZmllbGROYW1lXSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFPYmplY3RbZmllbGROYW1lXSA9IGRhdGFPYmplY3RbZmllbGROYW1lXSB8fCB7fTtcbiAgICAgICAgICAgICAgICBkYXRhT2JqZWN0W2ZpZWxkTmFtZV1bZmllbGRUYXJnZXRbMV1dID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghaXNQcmV2aW91c0RhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS51cGRhdGVGb3JtRGF0YU91dHB1dChkYXRhT2JqZWN0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcm0uZGF0YW91dHB1dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YU9iamVjdDtcbiAgICB9XG5cbiAgICBzZXRQcmltYXJ5S2V5KGZpZWxkTmFtZSkge1xuICAgICAgICAvKlN0b3JlIHRoZSBwcmltYXJ5IGtleSBvZiBkYXRhKi9cbiAgICAgICAgdGhpcy5mb3JtLnByaW1hcnlLZXkgPSB0aGlzLmZvcm0ucHJpbWFyeUtleSB8fCBbXTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5wcmltYXJ5S2V5LmluZGV4T2YoZmllbGROYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5wcmltYXJ5S2V5LnB1c2goZmllbGROYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRPcGVyYXRpb25UeXBlKCkge1xuICAgICAgICBsZXQgb3BlcmF0aW9uO1xuICAgICAgICBsZXQgaXNQcmltYXJ5ID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHNvdXJjZU9wZXJhdGlvbiA9IHRoaXMuZm9ybS5kYXRhc291cmNlICYmIHRoaXMuZm9ybS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX09QRVJBVElPTl9UWVBFKTtcbiAgICAgICAgaWYgKHNvdXJjZU9wZXJhdGlvbiAmJiBzb3VyY2VPcGVyYXRpb24gIT09ICdyZWFkJykge1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZU9wZXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICAvKklmIE9wZXJhdGlvblR5cGUgaXMgbm90IHNldCB0aGVuIGJhc2VkIG9uIHRoZSBmb3JtZGF0YSBvYmplY3QgcmV0dXJuIHRoZSBvcGVyYXRpb24gdHlwZSxcbiAgICAgICAgICAgIHRoaXMgY2FzZSBvY2N1cnMgb25seSBpZiB0aGUgZm9ybSBpcyBvdXRzaWRlIGEgbGl2ZWdyaWQqL1xuICAgICAgICAvKklmIHRoZSBmb3JtZGF0YSBvYmplY3QgaGFzIHByaW1hcnkga2V5IHZhbHVlIHRoZW4gcmV0dXJuIHVwZGF0ZSBlbHNlIGluc2VydCovXG4gICAgICAgIGlmICh0aGlzLmZvcm0ucHJpbWFyeUtleSAmJiAhXy5pc0VtcHR5KHRoaXMuZm9ybS5mb3JtZGF0YSkpIHtcbiAgICAgICAgICAgIC8qSWYgb25seSBvbmUgY29sdW1uIGlzIHByaW1hcnkga2V5Ki9cbiAgICAgICAgICAgIGlmICh0aGlzLmZvcm0ucHJpbWFyeUtleS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mb3JtLmZvcm1kYXRhW3RoaXMuZm9ybS5wcmltYXJ5S2V5WzBdXSkge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb24gPSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKklmIG9ubHkgbm8gY29sdW1uIGlzIHByaW1hcnkga2V5Ki9cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtLnByaW1hcnlLZXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHRoaXMuZm9ybS5mb3JtZGF0YSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQcmltYXJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChpc1ByaW1hcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uID0gTGl2ZV9PcGVyYXRpb25zLlVQREFURTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLypJZiBtdWx0aXBsZSBjb2x1bW5zIGFyZSBwcmltYXJ5IGtleSovXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlzUHJpbWFyeSA9IF8uc29tZSh0aGlzLmZvcm0ucHJpbWFyeUtleSwgKHByaW1hcnlLZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZm9ybS5mb3JtZGF0YVtwcmltYXJ5S2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNQcmltYXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbiA9IExpdmVfT3BlcmF0aW9ucy5VUERBVEU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb24gfHwgTGl2ZV9PcGVyYXRpb25zLklOU0VSVDtcbiAgICB9XG5cbiAgICBnZXRQcmV2RGF0YVZhbHVlcygpIHtcbiAgICAgICAgY29uc3QgcHJldkRhdGFWYWx1ZXMgPSBfLmZyb21QYWlycyhfLm1hcCh0aGlzLmZvcm0ucHJldkRhdGFWYWx1ZXMsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW2l0ZW0ua2V5LCBpdGVtLnZhbHVlXTtcbiAgICAgICAgfSkpOyAvLyBDb252ZXJ0IG9mIGFycmF5IG9mIHZhbHVlcyB0byBhbiBvYmplY3RcbiAgICAgICAgdGhpcy5mb3JtLmZvcm1GaWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBmaWVsZC52YWx1ZSA9IHByZXZEYXRhVmFsdWVzW2ZpZWxkLmtleV0gfHwgJyc7XG4gICAgICAgICAgICBmaWVsZC5yZXNldERpc3BsYXlJbnB1dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByZXZEYXRhVmFsdWVzO1xuICAgIH1cblxuICAgIHNhdmVQcmV2RGF0YVZhbHVlcygpIHtcbiAgICAgICAgdGhpcy5mb3JtLnByZXZEYXRhVmFsdWVzID0gdGhpcy5mb3JtLmZvcm1GaWVsZHMubWFwKChvYmopID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7J2tleSc6IG9iai5rZXksICd2YWx1ZSc6IG9iai52YWx1ZX07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGVtcHR5RGF0YU1vZGVsKCkge1xuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGlmIChpc0RlZmluZWQoZmllbGQpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkLnR5cGUgPT09IERhdGFUeXBlLkJMT0IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldEZpbGVVcGxvYWRXaWRnZXQoZmllbGQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkLmRhdGF2YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xlYXJEYXRhKCkge1xuICAgICAgICB0aGlzLmZvcm0udG9nZ2xlTWVzc2FnZShmYWxzZSk7XG4gICAgICAgIHRoaXMuZW1wdHlEYXRhTW9kZWwoKTtcbiAgICB9XG5cbiAgICBzZXRSZWFkb25seUZpZWxkcygpIHtcbiAgICAgICAgdGhpcy5mb3JtLmZvcm1GaWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBmaWVsZC5zZXRSZWFkT25seVN0YXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGVkaXQoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5yZXNldEZvcm1TdGF0ZSgpO1xuICAgICAgICB0aGlzLmZvcm0uY2xlYXJNZXNzYWdlKCk7XG5cbiAgICAgICAgdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgPSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFO1xuXG4gICAgICAgIGlmICh0aGlzLmZvcm0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgdGhpcy5zYXZlUHJldmZvcm1GaWVsZHMoKTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVByZXZEYXRhVmFsdWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JtLnByZXZEYXRhT2JqZWN0ID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuZm9ybS5mb3JtZGF0YSB8fCB7fSk7XG5cbiAgICAgICAgdGhpcy5zZXRSZWFkb25seUZpZWxkcygpO1xuICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gdHJ1ZTtcblxuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIGxldCBwcmV2RGF0YVZhbHVlcztcbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0Rm9ybVN0YXRlKCk7XG4gICAgICAgIHByZXZEYXRhVmFsdWVzID0gdGhpcy5nZXRQcmV2RGF0YVZhbHVlcygpO1xuICAgICAgICB0aGlzLmZvcm0uZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGlmIChmaWVsZC50eXBlID09PSBEYXRhVHlwZS5CTE9CKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEZpbGVVcGxvYWRXaWRnZXQoZmllbGQsIHRydWUpO1xuICAgICAgICAgICAgICAgIGZpZWxkLmhyZWYgPSB0aGlzLmdldEJsb2JVUkwocHJldkRhdGFWYWx1ZXMsIGZpZWxkLmtleSwgZmllbGQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5mb3JtLmNvbnN0cnVjdERhdGFPYmplY3QoKTtcbiAgICB9XG5cbiAgICBjbG9zZURpYWxvZygpIHtcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmNsb3NlKHRoaXMuZm9ybS5kaWFsb2dJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5jbGVhck1lc3NhZ2UoKTtcbiAgICAgICAgdGhpcy5mb3JtLmlzVXBkYXRlTW9kZSA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZm9ybS5yZXNldCgpO1xuICAgICAgICAvKlNob3cgdGhlIHByZXZpb3VzIHNlbGVjdGVkIGRhdGEqL1xuICAgICAgICBpZiAodGhpcy5mb3JtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJldmZvcm1GaWVsZHMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5fbGl2ZVRhYmxlUGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLmZvcm0uX2xpdmVUYWJsZVBhcmVudC5vbkNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBuZXcoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5yZXNldEZvcm1TdGF0ZSgpO1xuICAgICAgICB0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9IExpdmVfT3BlcmF0aW9ucy5JTlNFUlQ7XG4gICAgICAgIHRoaXMuZm9ybS5jbGVhck1lc3NhZ2UoKTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVQcmV2Zm9ybUZpZWxkcygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1wdHlEYXRhTW9kZWwoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldERlZmF1bHRWYWx1ZXMoKTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZVByZXZEYXRhVmFsdWVzKCk7XG4gICAgICAgICAgICB0aGlzLmZvcm0uY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5mb3JtLmlzVXBkYXRlTW9kZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZGVsZXRlKGNhbGxCYWNrRm4pIHtcbiAgICAgICAgdGhpcy5mb3JtLnJlc2V0Rm9ybVN0YXRlKCk7XG4gICAgICAgIHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlID0gTGl2ZV9PcGVyYXRpb25zLkRFTEVURTtcbiAgICAgICAgdGhpcy5mb3JtLnByZXZEYXRhT2JqZWN0ID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuZm9ybS5mb3JtZGF0YSB8fCB7fSk7XG4gICAgICAgIHRoaXMuZm9ybS5zYXZlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxCYWNrRm4pO1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHVzZSB0byBzYXZlIHRoZSBmb3JtIGFuZCBvcGVuIG5ldyBmb3JtIGFmdGVyIHNhdmVcbiAgICBzYXZlQW5kTmV3KCkge1xuICAgICAgICB0aGlzLnNhdmUodW5kZWZpbmVkLCB0cnVlLCB0cnVlKTtcbiAgICB9XG4gICAgLy8gRnVuY3Rpb24gdXNlIHRvIHNhdmUgdGhlIGZvcm0gYW5kIG9wZW4gbmV3IGZvcm0gYWZ0ZXIgc2F2ZVxuICAgIHNhdmVBbmRWaWV3KCkge1xuICAgICAgICB0aGlzLnNhdmUodW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgc3VibWl0Rm9ybSgkZXZlbnQpIHtcbiAgICAgICAgdGhpcy5zYXZlKCRldmVudCk7XG4gICAgfVxuXG4gICAgc2F2ZShldmVudD8sIHVwZGF0ZU1vZGU/LCBuZXdGb3JtPykge1xuICAgICAgICBpZiAoIXRoaXMuZm9ybS5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEsIHByZXZEYXRhLCBvcGVyYXRpb25UeXBlLCBpc1ZhbGlkO1xuICAgICAgICBjb25zdCByZXF1ZXN0RGF0YTogYW55ID0ge307XG5cbiAgICAgICAgb3BlcmF0aW9uVHlwZSA9IHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlID0gdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgfHwgdGhpcy5maW5kT3BlcmF0aW9uVHlwZSgpO1xuXG4gICAgICAgIC8vIERpc2FibGUgdGhlIGZvcm0gc3VibWl0IGlmIGZvcm0gaXMgaW4gaW52YWxpZCBzdGF0ZS5cbiAgICAgICAgaWYgKHRoaXMuZm9ybS52YWxpZGF0ZUZpZWxkc09uU3VibWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5mb3JtLmNvbnN0cnVjdERhdGFPYmplY3QoKSk7XG4gICAgICAgIHByZXZEYXRhID0gdGhpcy5mb3JtLnByZXZmb3JtRmllbGRzID8gdGhpcy5mb3JtLmNvbnN0cnVjdERhdGFPYmplY3QodHJ1ZSkgOiBkYXRhO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpc1ZhbGlkID0gdGhpcy5mb3JtLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXNlcnZpY2VjYWxsJywgeyRldmVudDogZXZlbnQsICRvcGVyYXRpb246IHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlLCAkZGF0YTogZGF0YSwgb3B0aW9uczogcmVxdWVzdERhdGF9KTtcbiAgICAgICAgICAgIGlmIChpc1ZhbGlkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1ZhbGlkICYmIGlzVmFsaWQuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0udG9nZ2xlTWVzc2FnZSh0cnVlLCBpc1ZhbGlkLmVycm9yLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVyci5tZXNzYWdlID09PSAnQWJvcnQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgb3BlcmF0aW9uIGlzIHVwZGF0ZSwgZm9ybSBpcyBub3QgdG91Y2hlZCBhbmQgY3VycmVudCBkYXRhIGFuZCBwcmV2aW91cyBkYXRhIGlzIHNhbWUsIFNob3cgbm8gY2hhbmdlcyBkZXRlY3RlZCBtZXNzYWdlXG4gICAgICAgIGlmICh0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9PT0gTGl2ZV9PcGVyYXRpb25zLlVQREFURSAmJiB0aGlzLmZvcm0ubmdmb3JtICYmIHRoaXMuZm9ybS5uZ2Zvcm0ucHJpc3RpbmUgJiZcbiAgICAgICAgICAgICAgICAodGhpcy5mb3JtLmlzU2VsZWN0ZWQgJiYgXy5pc0VxdWFsKGRhdGEsIHByZXZEYXRhKSkpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS50b2dnbGVNZXNzYWdlKHRydWUsIHRoaXMuZm9ybS5hcHBMb2NhbGUuTUVTU0FHRV9OT19DSEFOR0VTLCAnaW5mbycsICcnKTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9ybS5yZXNldEZvcm1TdGF0ZSgpO1xuXG4gICAgICAgIHJlcXVlc3REYXRhLnJvdyA9IGRhdGE7XG4gICAgICAgIHJlcXVlc3REYXRhLnRyYW5zZm9ybSA9IHRydWU7XG4gICAgICAgIHJlcXVlc3REYXRhLnNraXBOb3RpZmljYXRpb24gPSB0cnVlO1xuXG4gICAgICAgIGlmIChvcGVyYXRpb25UeXBlID09PSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFKSB7XG4gICAgICAgICAgICByZXF1ZXN0RGF0YS5yb3dEYXRhID0gdGhpcy5mb3JtLmZvcm1kYXRhO1xuICAgICAgICAgICAgcmVxdWVzdERhdGEucHJldkRhdGEgPSBwcmV2RGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBlcmZvcm1EYXRhT3BlcmF0aW9uKHRoaXMuZm9ybS5kYXRhc291cmNlLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgb3BlcmF0aW9uVHlwZTogb3BlcmF0aW9uVHlwZVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbXNnID0gb3BlcmF0aW9uVHlwZSA9PT0gTGl2ZV9PcGVyYXRpb25zLklOU0VSVCA/IHRoaXMuZm9ybS5pbnNlcnRtZXNzYWdlIDogKG9wZXJhdGlvblR5cGUgPT09IExpdmVfT3BlcmF0aW9ucy5VUERBVEUgP1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS51cGRhdGVtZXNzYWdlIDogdGhpcy5mb3JtLmRlbGV0ZW1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uVHlwZSA9PT0gTGl2ZV9PcGVyYXRpb25zLkRFTEVURSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5vblJlc3VsdChyZXF1ZXN0RGF0YS5yb3csIHRydWUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICB0aGlzLmVtcHR5RGF0YU1vZGVsKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLnByZXZEYXRhVmFsdWVzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLm9uUmVzdWx0KHJlc3BvbnNlLCB0cnVlLCBldmVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZm9ybS50b2dnbGVNZXNzYWdlKHRydWUsIG1zZywgJ3N1Y2Nlc3MnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZvcm0uX2xpdmVUYWJsZVBhcmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCB0aGUgY3VycmVudCB1cGRhdGVkIHJvd1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5fbGl2ZVRhYmxlUGFyZW50Lm9uUmVzdWx0KG9wZXJhdGlvblR5cGUsIHJlc3BvbnNlLCBuZXdGb3JtLCB1cGRhdGVNb2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLypnZXQgdXBkYXRlZCBkYXRhIHdpdGhvdXQgcmVmcmVzaGluZyBwYWdlKi9cbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0uZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkxJU1RfUkVDT1JEUywge1xuICAgICAgICAgICAgICAgICAgICAnc2tpcFRvZ2dsZVN0YXRlJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMub25EYXRhU291cmNlVXBkYXRlKHJlc3BvbnNlLCBuZXdGb3JtLCB1cGRhdGVNb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmZvcm0ub25SZXN1bHQoZXJyb3IsIGZhbHNlLCBldmVudCk7XG4gICAgICAgICAgICB0aGlzLmZvcm0udG9nZ2xlTWVzc2FnZSh0cnVlLCBlcnJvciwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==