import * as tslib_1 from "tslib";
import { Attribute, Component, HostBinding, HostListener, Injector, SkipSelf, Optional, ViewChild, ViewContainerRef, ContentChildren, NgZone } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { $appDigest, getClonedObject, getFiles, removeClass, App, $parseEvent, debounce, DynamicComponentRefProvider, extendProto, DataSource } from '@wm/core';
import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerFormProps } from './form.props';
import { getFieldLayoutConfig, parseValueByType } from '../../../utils/live-utils';
import { performDataOperation } from '../../../utils/data-utils';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { MessageComponent } from '../message/message.component';
import { ListComponent } from '../list/list.component';
const WIDGET_CONFIG = { widgetType: 'wm-form', hostClass: 'panel app-panel app-form' };
const LOGIN_FORM_CONFIG = { widgetType: 'wm-form', hostClass: 'app-form app-login-form' };
const LIVE_FORM_CONFIG = { widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline' };
const LIVE_FILTER_CONFIG = { widgetType: 'wm-livefilter', hostClass: 'panel app-panel app-livefilter clearfix liveform-inline' };
const getWidgetConfig = (isLiveForm, isLiveFilter, role) => {
    let config = WIDGET_CONFIG;
    if (isLiveForm !== null) {
        config = LIVE_FORM_CONFIG;
    }
    else if (isLiveFilter !== null) {
        config = LIVE_FILTER_CONFIG;
    }
    else if (role === 'app-login') {
        config = LOGIN_FORM_CONFIG;
    }
    return config;
};
const ɵ0 = getWidgetConfig;
// Generate the form field with given field definition. Add a grid column wrapper around the form field.
const setMarkupForFormField = (field, columnWidth) => {
    let propsTmpl = '';
    _.forEach(field, (value, key) => {
        propsTmpl = `${propsTmpl} ${key}="${value}"`;
    });
    return `<wm-gridcolumn columnwidth="${columnWidth}">
                  <wm-form-field ${propsTmpl}></wm-form-field>
            </wm-gridcolumn>`;
};
const ɵ1 = setMarkupForFormField;
// Function to find out the first invalid element in form
const findInvalidElement = ($formEle, ngForm) => {
    const $ele = $formEle.find('form.ng-invalid:visible, [formControlName].ng-invalid:visible').first();
    let formObj = ngForm;
    // If element is form, find out the first invalid element in this form
    if ($ele.is('form')) {
        formObj = ngForm && ngForm.controls[$ele.attr('formControlName') || $ele.attr('name')];
        if (formObj) {
            return findInvalidElement($ele, formObj);
        }
    }
    return {
        ngForm: formObj,
        $ele: $ele
    };
};
const ɵ2 = findInvalidElement;
const setTouchedState = ngForm => {
    if (ngForm.valid) {
        return;
    }
    if (ngForm.controls) {
        _.forEach(ngForm.controls, ctrl => {
            setTouchedState(ctrl);
        });
    }
    else {
        ngForm.markAsTouched();
    }
};
const ɵ3 = setTouchedState;
export class FormComponent extends StylableComponent {
    constructor(inj, fb, app, dynamicComponentProvider, ngZone, parentList, parentForm, onBeforeSubmitEvt, onSubmitEvt, onBeforeRenderEvt, binddataset, bindformdata, isLiveForm, isLiveFilter, role, key, name) {
        super(inj, getWidgetConfig(isLiveForm, isLiveFilter, role));
        this.fb = fb;
        this.app = app;
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.ngZone = ngZone;
        this.parentList = parentList;
        this.parentForm = parentForm;
        this.onBeforeSubmitEvt = onBeforeSubmitEvt;
        this.onSubmitEvt = onSubmitEvt;
        this.onBeforeRenderEvt = onBeforeRenderEvt;
        this.binddataset = binddataset;
        this.bindformdata = bindformdata;
        this._widgetClass = '';
        this._captionClass = '';
        this.formFields = [];
        this.formfields = {};
        this.formWidgets = {};
        this.filterWidgets = {};
        this.buttonArray = [];
        this.dataoutput = {};
        this.formdata = {};
        this.statusMessage = {
            caption: '',
            type: ''
        };
        this.primaryKey = [];
        this._debouncedUpdateFieldSource = _.debounce(this.updateFieldSource, 350);
        this.validationMessages = [];
        this._debouncedSubmitForm = debounce(($event) => {
            // calling submit event in ngZone as change detection is not triggered post the submit callback and actions like notification are not shown
            this.ngZone.run(() => {
                this.submitForm($event);
            });
        }, 250);
        styler(this.nativeElement, this);
        this.isUpdateMode = true;
        this.dialogId = this.nativeElement.getAttribute('dialogId');
        this.ngform = fb.group({});
        this.addInnerNgFormToForm(key || name);
        // On value change in form, update the dataoutput
        const onValueChangeSubscription = this.ngform.valueChanges
            .subscribe(this.updateDataOutput.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
        this.elScope = this;
        this.addEventsToContext(this.context);
    }
    set isLayoutDialog(nv) {
        if (nv) {
            removeClass(this.nativeElement, 'panel app-panel liveform-inline');
        }
        this._isLayoutDialog = nv;
    }
    get isLayoutDialog() {
        return this._isLayoutDialog;
    }
    set isUpdateMode(nv) {
        this._isUpdateMode = nv;
        this.formFields.forEach(field => {
            field.setReadOnlyState(nv);
        });
    }
    get isUpdateMode() {
        return this._isUpdateMode;
    }
    submit($event) {
        this._debouncedSubmitForm($event);
    }
    onReset() {
        this.reset();
    }
    ngAfterContentInit() {
        setTimeout(() => {
            this.componentRefs.forEach(componentRef => {
                if (componentRef.name) {
                    // Register widgets inside form with formWidgets
                    this.formWidgets[componentRef.name] = componentRef;
                }
            });
        }, 250);
    }
    findOperationType() { }
    addInnerNgFormToForm(binding) {
        if (this.parentForm && this.parentForm.ngform) {
            let counter = 1;
            let innerBinding = binding;
            // Inner forms may have same names. If same name is present, append unqiue identifier
            while (this.parentForm.ngform.controls.hasOwnProperty(innerBinding)) {
                innerBinding = `${binding}_${counter}`;
                counter++;
            }
            this.formGroupName = innerBinding;
            // If parent form is present, add the current form as as formGroup for parent form
            this.parentForm.ngform.addControl(innerBinding, this.ngform);
        }
    }
    // Expose the events on context so that they can be accessed by form actions
    addEventsToContext(context) {
        context.cancel = () => this.cancel();
        context.reset = () => this.reset();
        context.save = evt => this.save(evt);
        context.saveAndNew = () => this.saveAndNew();
        context.saveAndView = () => this.saveAndView();
        context.delete = () => this.delete();
        context.new = () => this.new();
        context.edit = () => this.edit();
        context.highlightInvalidFields = () => this.highlightInvalidFields();
        context.filter = () => this.filter();
        context.clearFilter = () => this.clearFilter();
        context.submit = evt => this.submit(evt);
    }
    // This method gets all the inner forms and validates each form.
    setValidationOnInnerForms(validateTouch) {
        const formEle = this.getNativeElement();
        const formObjs = formEle.querySelectorAll('.app-form');
        const validationMsgs = [];
        _.forEach(formObjs, e => {
            const formInstance = e.widget;
            // differentiating the validationMessages prefix based on the formGroupName
            // as the formName's are same when forms are in list
            let formName = _.get(formInstance, 'formGroupName') || formInstance.name;
            let current = formInstance;
            while (_.get(current, 'parentForm')) {
                const parentName = current.parentForm.formGroupName || current.parentForm.name;
                formName = parentName + '.' + formName;
                current = current.parentForm;
            }
            this.setValidationOnFields(formInstance, formName, validateTouch);
        });
    }
    /**
     * This method sets validation on formFields.
     * Applies to innerform and also sets innerform validation on parent form.
     * @param prefix contains the form name, which also includes its parents form name
     * @param {boolean} validateTouch
     */
    setValidationOnFields(form, prefix, validateTouch) {
        const controls = form.ngform.controls;
        const formFields = form.formFields;
        if (!formFields) {
            return;
        }
        _.forEach(controls, (v, k) => {
            const field = formFields.find(e => e.key === k);
            if (!field || (validateTouch && !v.touched)) {
                return;
            }
            // invoking the prepareValidation on both parent form and current form.
            this.prepareValidationObj(v, k, field, prefix);
            this.prepareValidationObj.call(form, v, k, field, prefix);
        });
    }
    // Assigns / updates validationMessages based on angular errors on field
    prepareValidationObj(v, k, field, prefix) {
        const index = this.validationMessages.findIndex(e => (e.field === k && e.fullyQualifiedFormName === prefix));
        if (v.invalid) {
            if (index === -1) {
                /**
                 * field contains the fieldName
                 * value contains the field value
                 * errorType contains the list of errors
                 * message contains the validation message
                 * getElement returns the element having focus-target
                 * formName returns the name of the form
                 */
                this.validationMessages.push({
                    field: k,
                    value: field.value,
                    errorType: _.keys(v.errors),
                    message: field.validationmessage || '',
                    getElement: () => {
                        return field.$element.find('[focus-target]');
                    },
                    formName: _.last(prefix.split('.')),
                    fullyQualifiedFormName: prefix
                });
            }
            else {
                this.validationMessages[index].value = field.value;
                this.validationMessages[index].errorType = _.keys(v.errors);
            }
        }
        else if (v.valid && index > -1) {
            this.validationMessages.splice(index, 1);
        }
    }
    // This will return a object containing the error details from the list of formFields that are invalid
    setValidationMsgs(validateTouch) {
        if (!this.formFields.length && _.isEmpty(this.ngform.controls)) {
            return;
        }
        this.setValidationOnFields(this, this.name, validateTouch);
        this.setValidationOnInnerForms(validateTouch);
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'submit') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }
    updateFieldSource() {
        if (this.formdatasource && this.formdatasource.execute(DataSource.Operation.IS_API_AWARE)) {
            return;
        }
        else if (this.formdatasource && !this.formdatasource.twoWayBinding) {
            return;
        }
        this.formFields.forEach(formField => {
            formField.setFormWidget('datavaluesource', this.formdatasource);
            formField.setFormWidget('binddatavalue', `${this.bindformdata}.${formField.key}`);
        });
    }
    // This method loops through the form fields and highlights the invalid fields by setting state to touched
    highlightInvalidFields() {
        setTouchedState(this.ngform);
    }
    // Disable the form submit if form is in invalid state. Highlight all the invalid fields if validation type is default
    validateFieldsOnSubmit() {
        this.setValidationMsgs();
        // Disable the form submit if form is in invalid state. For delete operation, do not check the validation.
        if (this.operationType !== 'delete' && (this.validationtype === 'html' || this.validationtype === 'default')
            && this.ngform && this.ngform.invalid) {
            if (this.ngform.invalid) {
                if (this.validationtype === 'default') {
                    this.highlightInvalidFields();
                }
                // Find the first invalid untoched element and set it to touched.
                // Safari does not form validations. this will ensure that error is shown for user
                const eleForm = findInvalidElement(this.$element, this.ngform);
                const $invalidForm = eleForm.ngForm;
                let $invalidEle = eleForm.$ele;
                $invalidEle = $invalidEle.parent().find('[focus-target]');
                if ($invalidEle.length) {
                    // on save click in page layout liveform, focus of autocomplete widget opens full-screen search.
                    if (!$invalidEle.hasClass('app-search-input')) {
                        $invalidEle.focus();
                    }
                    const ngEle = $invalidForm && $invalidForm.controls[$invalidEle.attr('formControlName') || $invalidEle.attr('name')];
                    if (ngEle && ngEle.markAsTouched) {
                        ngEle.markAsTouched();
                    }
                    $appDigest();
                    return true;
                }
                return true;
            }
            return false;
        }
        return false;
    }
    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'captionalign':
                this.captionAlignClass = 'align-' + nv;
                break;
            case 'captionposition':
                this.setLayoutConfig();
                break;
            case 'captionwidth':
                this.setLayoutConfig();
                break;
            case 'captionsize':
                this.captionsize = nv;
                break;
            case 'novalidate':
                //  Set validation type based on the novalidate property
                this.widget.validationtype = (nv === true || nv === 'true') ? 'none' : 'default';
                break;
            case 'formdata':
                // For livelist when multiselect is enabled, formdata will be array of objects. In this case consider the last object as formdata.
                _.isArray(nv) ? this.setFormData(_.last(nv)) : this.setFormData(nv);
                // if dataset on the formFields are not set as the datasourceChange is triggered before the formFields are registered.
                if (!this.isDataSourceUpdated && this.datasource) {
                    this.onDataSourceChange();
                }
                break;
            case 'defaultmode':
                if (!this.isLayoutDialog) {
                    if (nv && nv === 'Edit') {
                        this.updateMode = true;
                    }
                    else {
                        this.updateMode = false;
                    }
                    this.isUpdateMode = this.updateMode;
                }
                break;
            case 'datasource':
                this.onDataSourceChange();
                break;
            case 'formdatasource':
                this.onFormDataSourceChange();
                break;
            case 'metadata':
                this.generateFormFields();
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }
    // Event callbacks on success/error
    onResult(data, status, event) {
        const params = { $event: event, $data: data, $operation: this.operationType };
        // whether service call success or failure call this method
        this.invokeEventCallback('result', params);
        if (status) {
            // if service call is success call this method
            this.invokeEventCallback('success', params);
        }
        else {
            // if service call fails call this method
            this.invokeEventCallback('error', params);
        }
    }
    // Display or hide the inline message/ toaster
    toggleMessage(show, msg, type, header) {
        let template;
        if (show && msg) {
            template = (type === 'error' && this.errormessage) ? this.errormessage : msg;
            if (this.messagelayout === 'Inline') {
                this.statusMessage = { 'caption': template || '', type: type };
                if (this.messageRef) {
                    this.messageRef.showMessage(this.statusMessage.caption, this.statusMessage.type);
                }
            }
            else {
                this.app.notifyApp(template, type, header);
            }
        }
        else {
            this.statusMessage.caption = '';
        }
    }
    // Hide the inline message/ toaster
    clearMessage() {
        this.toggleMessage(false);
    }
    // Set the classes on the form based on the captionposition and captionwidth properties
    setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition, _.get(this.app.selectedViewPort, 'os'));
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;
        $appDigest();
    }
    registerFormWidget(widget) {
        const name = widget.name || widget.key;
        this.formWidgets[name] = widget;
    }
    registerFormFields(formField) {
        this.formFields.push(formField);
        this.formfields[formField.key] = formField;
        this.registerFormWidget(formField);
        this._debouncedUpdateFieldSource();
        if (this.parentForm) {
            this.parentForm.formFields.push(formField);
            this.parentForm.formfields[formField.key] = formField;
        }
    }
    registerActions(formAction) {
        this.buttonArray.push(formAction);
    }
    // Update the dataoutput whenever there is a change in inside form widget value
    updateFormDataOutput(dataObject) {
        // Set the values of the widgets inside the live form (other than form fields) in form data
        _.forEach(this.ngform.value, (val, key) => {
            if (!_.find(this.formFields, { key })) {
                dataObject[key] = val;
            }
        });
        this.dataoutput = dataObject;
    }
    // Construct the data object merging the form fields and custom widgets data
    constructDataObject() {
        const formData = {};
        const formFields = this.getFormFields();
        // Get all form fields and prepare form data as key value pairs
        formFields.forEach(field => {
            let fieldName, fieldValue;
            fieldValue = field.datavalue || field._control.value;
            fieldValue = (fieldValue === null || fieldValue === '') ? undefined : fieldValue;
            if (field.type === 'file') {
                fieldValue = getFiles(this.name, field.key + '_formWidget', field.multiple);
            }
            fieldName = field.key || field.target || field.name;
            // In case of update the field will be already present in form data
            _.set(formData, fieldName, fieldValue);
        });
        this.updateFormDataOutput(formData);
        return this.dataoutput;
    }
    updateDataOutput() {
        this.constructDataObject();
        if (this.ngform.touched) {
            this.setValidationMsgs(true);
        }
    }
    // FormFields will contain all the fields in parent and inner form also.
    // This returns the formFields in the form based on the form name.
    getFormFields() {
        return _.filter(this.formFields, formField => {
            return formField.form.name === this.name;
        });
    }
    setFormData(data) {
        const formFields = this.getFormFields();
        formFields.forEach(field => {
            field.value = _.get(data, field.key || field.name);
        });
        this.constructDataObject();
    }
    resetFormState() {
        // clearing the validationMessages on reset.
        if (this.validationMessages.length) {
            this.validationMessages = [];
        }
        if (!this.ngform) {
            return;
        }
        setTimeout(() => {
            this.ngform.markAsUntouched();
            this.ngform.markAsPristine();
        });
    }
    reset() {
        this.resetFormState();
        this.formFields.forEach(field => {
            field.value = '';
        });
        this.constructDataObject();
        this.clearMessage();
    }
    submitForm($event) {
        let formData, template, params;
        const dataSource = this.datasource;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }
        this.resetFormState();
        formData = getClonedObject(this.constructDataObject());
        params = { $event, $formData: formData, $data: formData };
        if (this.onBeforeSubmitEvt && (this.invokeEventCallback('beforesubmit', params) === false)) {
            return;
        }
        if (this.onSubmitEvt || dataSource) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (dataSource) {
                performDataOperation(dataSource, formData, {})
                    .then((data) => {
                    this.onResult(data, true, $event);
                    this.toggleMessage(true, this.postmessage, 'success');
                    this.invokeEventCallback('submit', params);
                }, (error) => {
                    template = this.errormessage || error.error || error;
                    this.onResult(error, false, $event);
                    this.toggleMessage(true, template, 'error');
                    this.invokeEventCallback('submit', params);
                    $appDigest();
                });
            }
            else {
                this.onResult({}, true, $event);
                this.invokeEventCallback('submit', params);
            }
        }
        else {
            this.onResult({}, true, $event);
        }
    }
    // Method to show/hide the panel header or footer based on the buttons
    showButtons(position) {
        return _.some(this.buttonArray, btn => {
            return _.includes(btn.position, position) && btn.updateMode === this.isUpdateMode;
        });
    }
    // Expand or collapse the panel
    expandCollapsePanel() {
        if (this.collapsible) {
            // flip the active flag
            this.expanded = !this.expanded;
        }
    }
    // On form data source change. This method is overridden by live form and live filter
    onDataSourceChange() {
    }
    // On form data source change. This method is overridden by live form and live filter
    onFormDataSourceChange() {
        this.updateFieldSource();
    }
    // On form field default value change. This method is overridden by live form and live filter
    onFieldDefaultValueChange(field, nv) {
        field.value = parseValueByType(nv, undefined, field.widgettype);
    }
    // On form field value change. This method is overridden by live form and live filter
    onFieldValueChange() {
    }
    // Function to generate and compile the form fields from the metadata
    generateFormFields() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let noOfColumns;
            let $gridLayout;
            // Check if grid layout is present or not for first time
            if (_.isUndefined(this._isGridLayoutPresent)) {
                this._isGridLayoutPresent = this.$element.find('.panel-body [wmlayoutgrid]').length > 0;
            }
            if (this._isGridLayoutPresent) {
                $gridLayout = this.$element.find('.form-elements [wmlayoutgrid]:first');
                noOfColumns = Number($gridLayout.attr('columns')) || 1;
            }
            else {
                $gridLayout = this.$element.find('.form-elements .dynamic-form-container');
                if (!$gridLayout.length) {
                    this.$element.find('.form-elements').prepend('<div class="dynamic-form-container"></div>');
                    $gridLayout = this.$element.find('.form-elements .dynamic-form-container');
                }
                noOfColumns = 1;
            }
            const columnWidth = 12 / noOfColumns;
            let fieldTemplate = '';
            let colCount = 0;
            let index;
            let userFields;
            let fields = this.metadata ? this.metadata.data || this.metadata : [];
            this.formFields = []; // empty the form fields
            if (_.isEmpty(fields)) {
                return;
            }
            if (this.onBeforeRenderEvt) {
                userFields = this.invokeEventCallback('beforerender', { $metadata: fields });
                if (userFields) {
                    fields = userFields;
                }
            }
            if (!_.isArray(fields)) {
                return;
            }
            while (fields[colCount]) {
                let colTmpl = '';
                for (index = 0; index < noOfColumns; index++) {
                    if (fields[colCount]) {
                        colTmpl += setMarkupForFormField(fields[colCount], columnWidth);
                    }
                    colCount++;
                }
                fieldTemplate += `<wm-gridrow>${colTmpl}</wm-gridrow>`;
            }
            if (!this._isGridLayoutPresent) {
                fieldTemplate = `<wm-layoutgrid>${fieldTemplate}</wm-layoutgrid>`;
            }
            this.dynamicFormRef.clear();
            if (!this._dynamicContext) {
                this._dynamicContext = Object.create(this.viewParent);
                this._dynamicContext.form = this;
            }
            const componentFactoryRef = yield this.dynamicComponentProvider.getComponentFactoryRef('app-form-dynamic-' + this.widgetId, fieldTemplate, {
                noCache: true,
                transpile: true
            });
            const component = this.dynamicFormRef.createComponent(componentFactoryRef, 0, this.inj);
            extendProto(component.instance, this._dynamicContext);
            $gridLayout[0].appendChild(component.location.nativeElement);
            this.setFormData(this.formdata);
        });
    }
    get mode() {
        return this.operationType || this.findOperationType();
    }
    get dirty() {
        return this.ngform && this.ngform.dirty;
    }
    get invalid() {
        return this.ngform && this.ngform.invalid;
    }
    get touched() {
        return this.ngform && this.ngform.touched;
    }
    invokeActionEvent($event, expression) {
        const fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, { $event }));
    }
}
FormComponent.initializeProps = registerFormProps();
FormComponent.decorators = [
    { type: Component, args: [{
                selector: 'form[wmForm]',
                template: "<ng-template #content><ng-content></ng-content></ng-template>\n\n<ng-container *ngIf=\"formlayout === 'page'; then pageLayoutTemplate else defaultTemplate\">\n</ng-container>\n\n<ng-template #defaultTemplate>\n    <div class=\"panel-heading\" *ngIf=\"!isLayoutDialog && (title || subheading || iconclass || showButtons('header'))\">\n        <h3 class=\"panel-title\">\n            <div class=\"pull-left\">\n                <i class=\"app-icon panel-icon\" aria-hidden=\"true\" [ngClass]=\"iconclass\" *ngIf=\"iconclass\"></i>\n            </div>\n            <div class=\"pull-left\">\n                <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\"></div>\n                <div class=\"description\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n            </div>\n            <div class=\"form-action panel-actions basic-btn-grp\">\n                <ng-container *ngFor=\"let btn of buttonArray | filter : 'position' : 'header'\"\n                              [ngTemplateOutlet]=\"btn.widgetType === 'button' ? buttonRef : anchorRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n                </ng-container>\n                <button type=\"button\" class=\"app-icon wi panel-action\" *ngIf=\"collapsible\" title=\"Collapse/Expand\"\n                        [ngClass]=\"expanded ? 'wi-minus': 'wi-plus'\" (click)=\"expandCollapsePanel();\"></button>\n            </div>\n        </h3>\n    </div>\n    <div class=\"panel-body\" [ngClass]=\"{'form-elements': isLayoutDialog, 'form-body': !isLayoutDialog}\" [class.hidden]=\"!expanded\">\n        <p wmMessage [hidden]=\"!statusMessage.caption.toString()\" caption.bind=\"statusMessage.caption\" type.bind=\"statusMessage.type\"></p>\n        <div [ngClass]=\"{'form-elements': !isLayoutDialog, 'form-content': isLayoutDialog}\">\n            <ng-container *ngTemplateOutlet=\"content\"></ng-container>\n        </div>\n        <div class=\"basic-btn-grp form-action panel-footer clearfix\" [ngClass]=\"{'modal-footer': isLayoutDialog}\" [class.hidden]=\"!expanded || !showButtons('footer')\">\n            <ng-container *ngFor=\"let btn of buttonArray | filter : 'position' : 'footer'\"\n                          [ngTemplateOutlet]=\"btn.widgetType === 'button' ? buttonRef : anchorRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n            </ng-container>\n        </div>\n    </div>\n</ng-template>\n\n<ng-template #pageLayoutTemplate>\n    <ng-container *ngTemplateOutlet=\"content\"></ng-container>\n</ng-template>\n\n<ng-template #buttonRef let-btn=\"btn\">\n    <button  wmButton name=\"{{btn.key}}\" caption.bind=\"btn.displayName\" class.bind=\"btn.class\" iconclass.bind=\"btn.iconclass\" show.bind=\"btn.show\"\n             (click)=\"invokeActionEvent($event, btn.action)\" type.bind=\"btn.type\" hint.bind=\"btn.title\" shortcutkey.bind=\"btn.shortcutkey\" disabled.bind=\"btn.disabled\"\n             tabindex.bind=\"btn.tabindex\" [class.hidden]=\"btn.updateMode ? !isUpdateMode : isUpdateMode\"></button>\n</ng-template>\n\n<ng-template #anchorRef let-btn=\"btn\">\n    <a wmAnchor name=\"{{btn.key}}\" caption.bind=\"btn.displayName\" class.bind=\"btn.class\" iconclass.bind=\"btn.iconclass\" show.bind=\"btn.show\"\n             (click)=\"invokeActionEvent($event, btn.action)\" hint.bind=\"btn.title\" shortcutkey.bind=\"btn.shortcutkey\"\n             hyperlink.bind=\"btn.hyperlink\" target.bind=\"btn.target\"\n             tabindex.bind=\"btn.tabindex\" [class.hidden]=\"btn.updateMode ? !isUpdateMode : isUpdateMode\"></a>\n</ng-template>\n\n<ng-container #dynamicForm></ng-container>",
                providers: [
                    provideAsWidgetRef(FormComponent)
                ]
            }] }
];
/** @nocollapse */
FormComponent.ctorParameters = () => [
    { type: Injector },
    { type: FormBuilder },
    { type: App },
    { type: DynamicComponentRefProvider },
    { type: NgZone },
    { type: ListComponent, decorators: [{ type: Optional }] },
    { type: FormComponent, decorators: [{ type: SkipSelf }, { type: Optional }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['beforesubmit.event',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['submit.event',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['beforerender.event',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['formdata.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['wmLiveForm',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['wmLiveFilter',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['role',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['key',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['name',] }] }
];
FormComponent.propDecorators = {
    dynamicFormRef: [{ type: ViewChild, args: ['dynamicForm', { read: ViewContainerRef },] }],
    messageRef: [{ type: ViewChild, args: [MessageComponent,] }],
    componentRefs: [{ type: ContentChildren, args: [WidgetRef, { descendants: true },] }],
    action: [{ type: HostBinding, args: ['action',] }],
    submit: [{ type: HostListener, args: ['submit', ['$event'],] }],
    onReset: [{ type: HostListener, args: ['reset',] }]
};
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Zvcm0vZm9ybS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFhLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBb0IsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pNLE9BQU8sRUFBRSxXQUFXLEVBQWEsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RCxPQUFPLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEssT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbkYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBSXZELE1BQU0sYUFBYSxHQUFH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QUFlLEdBQUcsaUJBQWlCLEVBQUUsQ0FBQzs7WUFSakQsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4Qiw4Z0hBQW9DO2dCQUNwQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO2lCQUNwQzthQUNKOzs7O1lBakZ5RCxRQUFRO1lBQ3pELFdBQVc7WUFFeUMsR0FBRztZQUF5QiwyQkFBMkI7WUFIK0MsTUFBTTtZQWFoSyxhQUFhLHVCQWdNYixRQUFRO1lBQ2tDLGFBQWEsdUJBQXZELFFBQVEsWUFBSSxRQUFROzRDQUNwQixTQUFTLFNBQUMsb0JBQW9COzRDQUM5QixTQUFTLFNBQUMsY0FBYzs0Q0FDeEIsU0FBUyxTQUFDLG9CQUFvQjs0Q0FDOUIsU0FBUyxTQUFDLGNBQWM7NENBQ3hCLFNBQVMsU0FBQyxlQUFlOzRDQUN6QixTQUFTLFNBQUMsWUFBWTs0Q0FDdEIsU0FBUyxTQUFDLGNBQWM7NENBQ3hCLFNBQVMsU0FBQyxNQUFNOzRDQUNoQixTQUFTLFNBQUMsS0FBSzs0Q0FDZixTQUFTLFNBQUMsTUFBTTs7OzZCQXBJcEIsU0FBUyxTQUFDLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBQzt5QkFDakQsU0FBUyxTQUFDLGdCQUFnQjs0QkFFMUIsZUFBZSxTQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7cUJBc0c5QyxXQUFXLFNBQUMsUUFBUTtxQkFFcEIsWUFBWSxTQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQztzQkFJakMsWUFBWSxTQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IsIE9uRGVzdHJveSwgU2tpcFNlbGYsIE9wdGlvbmFsLCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWYsIENvbnRlbnRDaGlsZHJlbiwgQWZ0ZXJDb250ZW50SW5pdCwgTmdab25lIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3JtQnVpbGRlciwgRm9ybUdyb3VwIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBnZXRDbG9uZWRPYmplY3QsIGdldEZpbGVzLCByZW1vdmVDbGFzcywgQXBwLCAkcGFyc2VFdmVudCwgZGVib3VuY2UsIER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlciwgZXh0ZW5kUHJvdG8sIERhdGFTb3VyY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJGb3JtUHJvcHMgfSBmcm9tICcuL2Zvcm0ucHJvcHMnO1xuaW1wb3J0IHsgZ2V0RmllbGRMYXlvdXRDb25maWcsIHBhcnNlVmFsdWVCeVR5cGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9saXZlLXV0aWxzJztcbmltcG9ydCB7IHBlcmZvcm1EYXRhT3BlcmF0aW9uIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgTWVzc2FnZUNvbXBvbmVudCB9IGZyb20gJy4uL21lc3NhZ2UvbWVzc2FnZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTGlzdENvbXBvbmVudCB9IGZyb20gJy4uL2xpc3QvbGlzdC5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWZvcm0nLCBob3N0Q2xhc3M6ICdwYW5lbCBhcHAtcGFuZWwgYXBwLWZvcm0nfTtcbmNvbnN0IExPR0lOX0ZPUk1fQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1mb3JtJywgaG9zdENsYXNzOiAnYXBwLWZvcm0gYXBwLWxvZ2luLWZvcm0nfTtcbmNvbnN0IExJVkVfRk9STV9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWxpdmVmb3JtJywgaG9zdENsYXNzOiAncGFuZWwgYXBwLXBhbmVsIGFwcC1saXZlZm9ybSBsaXZlZm9ybS1pbmxpbmUnfTtcbmNvbnN0IExJVkVfRklMVEVSX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tbGl2ZWZpbHRlcicsIGhvc3RDbGFzczogJ3BhbmVsIGFwcC1wYW5lbCBhcHAtbGl2ZWZpbHRlciBjbGVhcmZpeCBsaXZlZm9ybS1pbmxpbmUnfTtcblxuY29uc3QgZ2V0V2lkZ2V0Q29uZmlnID0gKGlzTGl2ZUZvcm0sIGlzTGl2ZUZpbHRlciwgcm9sZSkgPT4ge1xuICAgIGxldCBjb25maWcgPSBXSURHRVRfQ09ORklHO1xuICAgIGlmIChpc0xpdmVGb3JtICE9PSBudWxsKSB7XG4gICAgICAgIGNvbmZpZyA9IExJVkVfRk9STV9DT05GSUc7XG4gICAgfSBlbHNlIGlmIChpc0xpdmVGaWx0ZXIgIT09IG51bGwpIHtcbiAgICAgICAgY29uZmlnID0gTElWRV9GSUxURVJfQ09ORklHO1xuICAgIH0gZWxzZSBpZiAocm9sZSA9PT0gJ2FwcC1sb2dpbicpIHtcbiAgICAgICAgY29uZmlnID0gTE9HSU5fRk9STV9DT05GSUc7XG4gICAgfVxuICAgIHJldHVybiBjb25maWc7XG59O1xuXG4vLyBHZW5lcmF0ZSB0aGUgZm9ybSBmaWVsZCB3aXRoIGdpdmVuIGZpZWxkIGRlZmluaXRpb24uIEFkZCBhIGdyaWQgY29sdW1uIHdyYXBwZXIgYXJvdW5kIHRoZSBmb3JtIGZpZWxkLlxuY29uc3Qgc2V0TWFya3VwRm9yRm9ybUZpZWxkID0gKGZpZWxkLCBjb2x1bW5XaWR0aCkgPT4gIHtcbiAgICBsZXQgcHJvcHNUbXBsID0gJyc7XG4gICAgXy5mb3JFYWNoKGZpZWxkLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBwcm9wc1RtcGwgPSBgJHtwcm9wc1RtcGx9ICR7a2V5fT1cIiR7dmFsdWV9XCJgO1xuICAgIH0pO1xuICAgIHJldHVybiBgPHdtLWdyaWRjb2x1bW4gY29sdW1ud2lkdGg9XCIke2NvbHVtbldpZHRofVwiPlxuICAgICAgICAgICAgICAgICAgPHdtLWZvcm0tZmllbGQgJHtwcm9wc1RtcGx9Pjwvd20tZm9ybS1maWVsZD5cbiAgICAgICAgICAgIDwvd20tZ3JpZGNvbHVtbj5gO1xufTtcblxuLy8gRnVuY3Rpb24gdG8gZmluZCBvdXQgdGhlIGZpcnN0IGludmFsaWQgZWxlbWVudCBpbiBmb3JtXG5jb25zdCBmaW5kSW52YWxpZEVsZW1lbnQgPSAoJGZvcm1FbGUsIG5nRm9ybSkgPT4ge1xuICAgIGNvbnN0ICRlbGUgPSAkZm9ybUVsZS5maW5kKCdmb3JtLm5nLWludmFsaWQ6dmlzaWJsZSwgW2Zvcm1Db250cm9sTmFtZV0ubmctaW52YWxpZDp2aXNpYmxlJykuZmlyc3QoKTtcbiAgICBsZXQgZm9ybU9iaiA9IG5nRm9ybTtcbiAgICAvLyBJZiBlbGVtZW50IGlzIGZvcm0sIGZpbmQgb3V0IHRoZSBmaXJzdCBpbnZhbGlkIGVsZW1lbnQgaW4gdGhpcyBmb3JtXG4gICAgaWYgKCRlbGUuaXMoJ2Zvcm0nKSkge1xuICAgICAgICBmb3JtT2JqID0gbmdGb3JtICYmIG5nRm9ybS5jb250cm9sc1skZWxlLmF0dHIoJ2Zvcm1Db250cm9sTmFtZScpIHx8ICRlbGUuYXR0cignbmFtZScpXTtcbiAgICAgICAgaWYgKGZvcm1PYmopIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5kSW52YWxpZEVsZW1lbnQoJGVsZSwgZm9ybU9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmdGb3JtOiBmb3JtT2JqLFxuICAgICAgICAkZWxlOiAkZWxlXG4gICAgfTtcbn07XG5cbmNvbnN0IHNldFRvdWNoZWRTdGF0ZSA9IG5nRm9ybSA9PiB7XG4gICAgaWYgKG5nRm9ybS52YWxpZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChuZ0Zvcm0uY29udHJvbHMpIHtcbiAgICAgICAgXy5mb3JFYWNoKG5nRm9ybS5jb250cm9scywgY3RybCA9PiB7XG4gICAgICAgICAgICBzZXRUb3VjaGVkU3RhdGUoY3RybCk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5nRm9ybS5tYXJrQXNUb3VjaGVkKCk7XG4gICAgfVxufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdmb3JtW3dtRm9ybV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9mb3JtLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEZvcm1Db21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBGb3JtQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIEFmdGVyQ29udGVudEluaXQge1xuICAgIHN0YXRpYyAgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJGb3JtUHJvcHMoKTtcbiAgICBAVmlld0NoaWxkKCdkeW5hbWljRm9ybScsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgZHluYW1pY0Zvcm1SZWY6IFZpZXdDb250YWluZXJSZWY7XG4gICAgQFZpZXdDaGlsZChNZXNzYWdlQ29tcG9uZW50KSBtZXNzYWdlUmVmO1xuICAgIC8vIHRoaXMgaXMgdGhlIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50IHJlZnMgaW5zaWRlIHRoZSBmb3JtLWdyb3VwXG4gICAgQENvbnRlbnRDaGlsZHJlbihXaWRnZXRSZWYsIHtkZXNjZW5kYW50czogdHJ1ZX0pIGNvbXBvbmVudFJlZnM7XG5cbiAgICBhdXRvdXBkYXRlO1xuICAgIHB1YmxpYyBmb3JtbGF5b3V0OiBhbnk7XG4gICAgcHVibGljIGlzRGF0YVNvdXJjZVVwZGF0ZWQ6IGJvb2xlYW47XG4gICAgY2FwdGlvbkFsaWduQ2xhc3M6IHN0cmluZztcbiAgICB2YWxpZGF0aW9udHlwZTogc3RyaW5nO1xuICAgIGNhcHRpb25hbGlnbjogc3RyaW5nO1xuICAgIGNhcHRpb25wb3NpdGlvbjogc3RyaW5nO1xuICAgIGNhcHRpb25zaXplO1xuICAgIGNvbGxhcHNpYmxlOiBib29sZWFuO1xuICAgIGV4cGFuZGVkOiBib29sZWFuO1xuICAgIGVsU2NvcGU7XG4gICAgX3dpZGdldENsYXNzID0gJyc7XG4gICAgY2FwdGlvbndpZHRoOiBzdHJpbmc7XG4gICAgX2NhcHRpb25DbGFzcyA9ICcnO1xuICAgIG5nZm9ybTogRm9ybUdyb3VwO1xuICAgIGZvcm1GaWVsZHMgPSBbXTtcbiAgICBmb3JtZmllbGRzID0ge307XG4gICAgZm9ybVdpZGdldHMgPSB7fTtcbiAgICBmaWx0ZXJXaWRnZXRzID0ge307XG4gICAgYnV0dG9uQXJyYXkgPSBbXTtcbiAgICBkYXRhb3V0cHV0ID0ge307XG4gICAgZGF0YXNvdXJjZTtcbiAgICBmb3JtZGF0YXNvdXJjZTtcbiAgICBmb3JtZGF0YSA9IHt9O1xuICAgIGlzU2VsZWN0ZWQ7XG4gICAgcHJldkRhdGFWYWx1ZXM7XG4gICAgcHJldkRhdGFPYmplY3Q7XG4gICAgcHJldmZvcm1GaWVsZHM7XG4gICAgc3RhdHVzTWVzc2FnZSA9IHtcbiAgICAgICAgY2FwdGlvbjogJycsXG4gICAgICAgIHR5cGU6ICcnXG4gICAgfTtcbiAgICBtZXNzYWdlbGF5b3V0O1xuICAgIG1ldGFkYXRhO1xuICAgIGVycm9ybWVzc2FnZTtcbiAgICBwcmltYXJ5S2V5ID0gW107XG4gICAgcG9zdG1lc3NhZ2U7XG4gICAgX2xpdmVUYWJsZVBhcmVudDtcbiAgICB1cGRhdGVNb2RlO1xuICAgIG5hbWU7XG4gICAgLy8gTGl2ZSBGb3JtIE1ldGhvZHNcbiAgICBjbGVhckRhdGE6IEZ1bmN0aW9uO1xuICAgIGVkaXQ6IEZ1bmN0aW9uO1xuICAgIG5ldzogRnVuY3Rpb247XG4gICAgY2FuY2VsOiBGdW5jdGlvbjtcbiAgICBkZWxldGU6IEZ1bmN0aW9uO1xuICAgIHNhdmU6IEZ1bmN0aW9uO1xuICAgIHNhdmVBbmROZXc6IEZ1bmN0aW9uO1xuICAgIHNhdmVBbmRWaWV3OiBGdW5jdGlvbjtcbiAgICBzZXRQcmltYXJ5S2V5OiAoKSA9PiB7fTtcbiAgICBkaWFsb2dJZDogc3RyaW5nO1xuICAgIC8vIExpdmUgRmlsdGVyXG4gICAgZW5hYmxlZW1wdHlmaWx0ZXI7XG4gICAgcGFnZXNpemU7XG4gICAgcmVzdWx0O1xuICAgIHBhZ2luYXRpb247XG4gICAgY2xlYXJGaWx0ZXI6IEZ1bmN0aW9uO1xuICAgIGFwcGx5RmlsdGVyOiBGdW5jdGlvbjtcbiAgICBmaWx0ZXI6IEZ1bmN0aW9uO1xuICAgIGZpbHRlck9uRGVmYXVsdDogRnVuY3Rpb247XG4gICAgb25NYXhEZWZhdWx0VmFsdWVDaGFuZ2U6IEZ1bmN0aW9uO1xuXG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkVXBkYXRlRmllbGRTb3VyY2U6IEZ1bmN0aW9uID0gXy5kZWJvdW5jZSh0aGlzLnVwZGF0ZUZpZWxkU291cmNlLCAzNTApO1xuICAgIHByaXZhdGUgb3BlcmF0aW9uVHlwZTtcbiAgICBwcml2YXRlIF9pc0xheW91dERpYWxvZztcbiAgICBwcml2YXRlIF9keW5hbWljQ29udGV4dDtcbiAgICBwcml2YXRlIF9pc0dyaWRMYXlvdXRQcmVzZW50O1xuICAgIHByaXZhdGUgdmFsaWRhdGlvbk1lc3NhZ2VzID0gW107XG4gICAgcHJpdmF0ZSBmb3JtR3JvdXBOYW1lO1xuXG4gICAgcHJpdmF0ZSBfZGVib3VuY2VkU3VibWl0Rm9ybSA9IGRlYm91bmNlKCgkZXZlbnQpID0+IHtcbiAgICAgICAgLy8gY2FsbGluZyBzdWJtaXQgZXZlbnQgaW4gbmdab25lIGFzIGNoYW5nZSBkZXRlY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBwb3N0IHRoZSBzdWJtaXQgY2FsbGJhY2sgYW5kIGFjdGlvbnMgbGlrZSBub3RpZmljYXRpb24gYXJlIG5vdCBzaG93blxuICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdWJtaXRGb3JtKCRldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH0sIDI1MCk7XG5cbiAgICBzZXQgaXNMYXlvdXREaWFsb2cobnYpIHtcbiAgICAgICAgaWYgKG52KSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdwYW5lbCBhcHAtcGFuZWwgbGl2ZWZvcm0taW5saW5lJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNMYXlvdXREaWFsb2cgPSBudjtcbiAgICB9XG5cbiAgICBnZXQgaXNMYXlvdXREaWFsb2coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0xheW91dERpYWxvZztcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pc1VwZGF0ZU1vZGU7XG4gICAgc2V0IGlzVXBkYXRlTW9kZShudikge1xuICAgICAgICB0aGlzLl9pc1VwZGF0ZU1vZGUgPSBudjtcbiAgICAgICAgdGhpcy5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgZmllbGQuc2V0UmVhZE9ubHlTdGF0ZShudik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldCBpc1VwZGF0ZU1vZGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc1VwZGF0ZU1vZGU7XG4gICAgfVxuXG4gICAgQEhvc3RCaW5kaW5nKCdhY3Rpb24nKSBhY3Rpb246IHN0cmluZztcblxuICAgIEBIb3N0TGlzdGVuZXIoJ3N1Ym1pdCcsIFsnJGV2ZW50J10pIHN1Ym1pdCgkZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZGVib3VuY2VkU3VibWl0Rm9ybSgkZXZlbnQpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ3Jlc2V0Jykgb25SZXNldCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGZiOiBGb3JtQnVpbGRlcixcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBkeW5hbWljQ29tcG9uZW50UHJvdmlkZXI6IER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgICAgQE9wdGlvbmFsKCkgcHVibGljIHBhcmVudExpc3Q6IExpc3RDb21wb25lbnQsXG4gICAgICAgIEBTa2lwU2VsZigpIEBPcHRpb25hbCgpIHB1YmxpYyBwYXJlbnRGb3JtOiBGb3JtQ29tcG9uZW50LFxuICAgICAgICBAQXR0cmlidXRlKCdiZWZvcmVzdWJtaXQuZXZlbnQnKSBwdWJsaWMgb25CZWZvcmVTdWJtaXRFdnQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3N1Ym1pdC5ldmVudCcpIHB1YmxpYyBvblN1Ym1pdEV2dCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnYmVmb3JlcmVuZGVyLmV2ZW50JykgcHVibGljIG9uQmVmb3JlUmVuZGVyRXZ0LFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc2V0LmJpbmQnKSBwdWJsaWMgYmluZGRhdGFzZXQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Zvcm1kYXRhLmJpbmQnKSBwcml2YXRlIGJpbmRmb3JtZGF0YSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnd21MaXZlRm9ybScpIGlzTGl2ZUZvcm0sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3dtTGl2ZUZpbHRlcicpIGlzTGl2ZUZpbHRlcixcbiAgICAgICAgQEF0dHJpYnV0ZSgncm9sZScpIHJvbGUsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2tleScpIGtleSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBnZXRXaWRnZXRDb25maWcoaXNMaXZlRm9ybSwgaXNMaXZlRmlsdGVyLCByb2xlKSk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5pc1VwZGF0ZU1vZGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmRpYWxvZ0lkID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGlhbG9nSWQnKTtcbiAgICAgICAgdGhpcy5uZ2Zvcm0gPSBmYi5ncm91cCh7fSk7XG4gICAgICAgIHRoaXMuYWRkSW5uZXJOZ0Zvcm1Ub0Zvcm0oa2V5IHx8IG5hbWUpO1xuXG4gICAgICAgIC8vIE9uIHZhbHVlIGNoYW5nZSBpbiBmb3JtLCB1cGRhdGUgdGhlIGRhdGFvdXRwdXRcbiAgICAgICAgY29uc3Qgb25WYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbiA9ICB0aGlzLm5nZm9ybS52YWx1ZUNoYW5nZXNcbiAgICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy51cGRhdGVEYXRhT3V0cHV0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgICAgIHRoaXMuZWxTY29wZSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudHNUb0NvbnRleHQodGhpcy5jb250ZXh0KTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb21wb25lbnRSZWZzLmZvckVhY2goY29tcG9uZW50UmVmID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50UmVmLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVnaXN0ZXIgd2lkZ2V0cyBpbnNpZGUgZm9ybSB3aXRoIGZvcm1XaWRnZXRzXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybVdpZGdldHNbY29tcG9uZW50UmVmLm5hbWVdID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAyNTApO1xuICAgIH1cblxuICAgIGZpbmRPcGVyYXRpb25UeXBlKCkge31cblxuICAgIHByaXZhdGUgYWRkSW5uZXJOZ0Zvcm1Ub0Zvcm0oYmluZGluZykge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRGb3JtICYmIHRoaXMucGFyZW50Rm9ybS5uZ2Zvcm0pIHtcbiAgICAgICAgICAgIGxldCBjb3VudGVyID0gMTtcbiAgICAgICAgICAgIGxldCBpbm5lckJpbmRpbmcgPSBiaW5kaW5nO1xuICAgICAgICAgICAgLy8gSW5uZXIgZm9ybXMgbWF5IGhhdmUgc2FtZSBuYW1lcy4gSWYgc2FtZSBuYW1lIGlzIHByZXNlbnQsIGFwcGVuZCB1bnFpdWUgaWRlbnRpZmllclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMucGFyZW50Rm9ybS5uZ2Zvcm0uY29udHJvbHMuaGFzT3duUHJvcGVydHkoaW5uZXJCaW5kaW5nKSkge1xuICAgICAgICAgICAgICAgIGlubmVyQmluZGluZyA9IGAke2JpbmRpbmd9XyR7Y291bnRlcn1gO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZm9ybUdyb3VwTmFtZSA9IGlubmVyQmluZGluZztcbiAgICAgICAgICAgIC8vIElmIHBhcmVudCBmb3JtIGlzIHByZXNlbnQsIGFkZCB0aGUgY3VycmVudCBmb3JtIGFzIGFzIGZvcm1Hcm91cCBmb3IgcGFyZW50IGZvcm1cbiAgICAgICAgICAgIHRoaXMucGFyZW50Rm9ybS5uZ2Zvcm0uYWRkQ29udHJvbChpbm5lckJpbmRpbmcsIHRoaXMubmdmb3JtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV4cG9zZSB0aGUgZXZlbnRzIG9uIGNvbnRleHQgc28gdGhhdCB0aGV5IGNhbiBiZSBhY2Nlc3NlZCBieSBmb3JtIGFjdGlvbnNcbiAgICBwcml2YXRlIGFkZEV2ZW50c1RvQ29udGV4dChjb250ZXh0KSB7XG4gICAgICAgIGNvbnRleHQuY2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWwoKTtcbiAgICAgICAgY29udGV4dC5yZXNldCA9ICgpID0+IHRoaXMucmVzZXQoKTtcbiAgICAgICAgY29udGV4dC5zYXZlID0gZXZ0ID0+IHRoaXMuc2F2ZShldnQpO1xuICAgICAgICBjb250ZXh0LnNhdmVBbmROZXcgPSAoKSA9PiB0aGlzLnNhdmVBbmROZXcoKTtcbiAgICAgICAgY29udGV4dC5zYXZlQW5kVmlldyA9ICgpID0+IHRoaXMuc2F2ZUFuZFZpZXcoKTtcbiAgICAgICAgY29udGV4dC5kZWxldGUgPSAoKSA9PiB0aGlzLmRlbGV0ZSgpO1xuICAgICAgICBjb250ZXh0Lm5ldyA9ICgpID0+IHRoaXMubmV3KCk7XG4gICAgICAgIGNvbnRleHQuZWRpdCA9ICgpID0+IHRoaXMuZWRpdCgpO1xuICAgICAgICBjb250ZXh0LmhpZ2hsaWdodEludmFsaWRGaWVsZHMgPSAoKSA9PiB0aGlzLmhpZ2hsaWdodEludmFsaWRGaWVsZHMoKTtcbiAgICAgICAgY29udGV4dC5maWx0ZXIgPSAoKSA9PiB0aGlzLmZpbHRlcigpO1xuICAgICAgICBjb250ZXh0LmNsZWFyRmlsdGVyID0gKCkgPT4gdGhpcy5jbGVhckZpbHRlcigpO1xuICAgICAgICBjb250ZXh0LnN1Ym1pdCA9IGV2dCA9PiB0aGlzLnN1Ym1pdChldnQpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGdldHMgYWxsIHRoZSBpbm5lciBmb3JtcyBhbmQgdmFsaWRhdGVzIGVhY2ggZm9ybS5cbiAgICBwcml2YXRlIHNldFZhbGlkYXRpb25PbklubmVyRm9ybXModmFsaWRhdGVUb3VjaCkge1xuICAgICAgICBjb25zdCBmb3JtRWxlID0gdGhpcy5nZXROYXRpdmVFbGVtZW50KCk7XG4gICAgICAgIGNvbnN0IGZvcm1PYmpzID0gZm9ybUVsZS5xdWVyeVNlbGVjdG9yQWxsKCcuYXBwLWZvcm0nKTtcbiAgICAgICAgY29uc3QgdmFsaWRhdGlvbk1zZ3MgPSBbXTtcbiAgICAgICAgXy5mb3JFYWNoKGZvcm1PYmpzLCBlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1JbnN0YW5jZSA9IChlIGFzIGFueSkud2lkZ2V0O1xuICAgICAgICAgICAgLy8gZGlmZmVyZW50aWF0aW5nIHRoZSB2YWxpZGF0aW9uTWVzc2FnZXMgcHJlZml4IGJhc2VkIG9uIHRoZSBmb3JtR3JvdXBOYW1lXG4gICAgICAgICAgICAvLyBhcyB0aGUgZm9ybU5hbWUncyBhcmUgc2FtZSB3aGVuIGZvcm1zIGFyZSBpbiBsaXN0XG4gICAgICAgICAgICBsZXQgZm9ybU5hbWUgPSBfLmdldChmb3JtSW5zdGFuY2UsICdmb3JtR3JvdXBOYW1lJykgfHwgZm9ybUluc3RhbmNlLm5hbWU7XG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGZvcm1JbnN0YW5jZTtcbiAgICAgICAgICAgIHdoaWxlIChfLmdldChjdXJyZW50LCAncGFyZW50Rm9ybScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50TmFtZSA9IGN1cnJlbnQucGFyZW50Rm9ybS5mb3JtR3JvdXBOYW1lIHx8IGN1cnJlbnQucGFyZW50Rm9ybS5uYW1lO1xuICAgICAgICAgICAgICAgIGZvcm1OYW1lID0gcGFyZW50TmFtZSArICcuJyArIGZvcm1OYW1lO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEZvcm07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFZhbGlkYXRpb25PbkZpZWxkcyhmb3JtSW5zdGFuY2UsIGZvcm1OYW1lLCB2YWxpZGF0ZVRvdWNoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2Qgc2V0cyB2YWxpZGF0aW9uIG9uIGZvcm1GaWVsZHMuXG4gICAgICogQXBwbGllcyB0byBpbm5lcmZvcm0gYW5kIGFsc28gc2V0cyBpbm5lcmZvcm0gdmFsaWRhdGlvbiBvbiBwYXJlbnQgZm9ybS5cbiAgICAgKiBAcGFyYW0gcHJlZml4IGNvbnRhaW5zIHRoZSBmb3JtIG5hbWUsIHdoaWNoIGFsc28gaW5jbHVkZXMgaXRzIHBhcmVudHMgZm9ybSBuYW1lXG4gICAgICogQHBhcmFtIHtib29sZWFufSB2YWxpZGF0ZVRvdWNoXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRWYWxpZGF0aW9uT25GaWVsZHMoZm9ybTogRm9ybUNvbXBvbmVudCwgcHJlZml4OiBzdHJpbmcsIHZhbGlkYXRlVG91Y2g/OiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xzID0gZm9ybS5uZ2Zvcm0uY29udHJvbHM7XG4gICAgICAgIGNvbnN0IGZvcm1GaWVsZHMgPSBmb3JtLmZvcm1GaWVsZHM7XG4gICAgICAgIGlmICghZm9ybUZpZWxkcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF8uZm9yRWFjaChjb250cm9scywgKHYsIGspID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gZm9ybUZpZWxkcy5maW5kKGUgPT4gZS5rZXkgPT09IGspO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCB8fCAodmFsaWRhdGVUb3VjaCAmJiAhdi50b3VjaGVkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGludm9raW5nIHRoZSBwcmVwYXJlVmFsaWRhdGlvbiBvbiBib3RoIHBhcmVudCBmb3JtIGFuZCBjdXJyZW50IGZvcm0uXG4gICAgICAgICAgICB0aGlzLnByZXBhcmVWYWxpZGF0aW9uT2JqKHYsIGssIGZpZWxkLCBwcmVmaXgpO1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlVmFsaWRhdGlvbk9iai5jYWxsKGZvcm0sIHYsIGssIGZpZWxkLCBwcmVmaXgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBc3NpZ25zIC8gdXBkYXRlcyB2YWxpZGF0aW9uTWVzc2FnZXMgYmFzZWQgb24gYW5ndWxhciBlcnJvcnMgb24gZmllbGRcbiAgICBwcml2YXRlIHByZXBhcmVWYWxpZGF0aW9uT2JqKHYsIGssIGZpZWxkLCBwcmVmaXgpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnZhbGlkYXRpb25NZXNzYWdlcy5maW5kSW5kZXgoZSA9PiAoZS5maWVsZCA9PT0gayAmJiBlLmZ1bGx5UXVhbGlmaWVkRm9ybU5hbWUgPT09IHByZWZpeCkpO1xuICAgICAgICBpZiAodi5pbnZhbGlkKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZmllbGQgY29udGFpbnMgdGhlIGZpZWxkTmFtZVxuICAgICAgICAgICAgICAgICAqIHZhbHVlIGNvbnRhaW5zIHRoZSBmaWVsZCB2YWx1ZVxuICAgICAgICAgICAgICAgICAqIGVycm9yVHlwZSBjb250YWlucyB0aGUgbGlzdCBvZiBlcnJvcnNcbiAgICAgICAgICAgICAgICAgKiBtZXNzYWdlIGNvbnRhaW5zIHRoZSB2YWxpZGF0aW9uIG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgKiBnZXRFbGVtZW50IHJldHVybnMgdGhlIGVsZW1lbnQgaGF2aW5nIGZvY3VzLXRhcmdldFxuICAgICAgICAgICAgICAgICAqIGZvcm1OYW1lIHJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGZvcm1cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25NZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGssXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmaWVsZC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBfLmtleXModi5lcnJvcnMpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmaWVsZC52YWxpZGF0aW9ubWVzc2FnZSB8fCAnJyxcbiAgICAgICAgICAgICAgICAgICAgZ2V0RWxlbWVudDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkLiRlbGVtZW50LmZpbmQoJ1tmb2N1cy10YXJnZXRdJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZvcm1OYW1lOiBfLmxhc3QocHJlZml4LnNwbGl0KCcuJykpLFxuICAgICAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZEZvcm1OYW1lOiBwcmVmaXhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uTWVzc2FnZXNbaW5kZXhdLnZhbHVlID0gZmllbGQudmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uTWVzc2FnZXNbaW5kZXhdLmVycm9yVHlwZSA9IF8ua2V5cyh2LmVycm9ycyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodi52YWxpZCAmJiBpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25NZXNzYWdlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyB3aWxsIHJldHVybiBhIG9iamVjdCBjb250YWluaW5nIHRoZSBlcnJvciBkZXRhaWxzIGZyb20gdGhlIGxpc3Qgb2YgZm9ybUZpZWxkcyB0aGF0IGFyZSBpbnZhbGlkXG4gICAgcHJpdmF0ZSBzZXRWYWxpZGF0aW9uTXNncyh2YWxpZGF0ZVRvdWNoPzogYm9vbGVhbikge1xuICAgICAgICBpZiAoIXRoaXMuZm9ybUZpZWxkcy5sZW5ndGggJiYgXy5pc0VtcHR5KHRoaXMubmdmb3JtLmNvbnRyb2xzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0VmFsaWRhdGlvbk9uRmllbGRzKHRoaXMsIHRoaXMubmFtZSwgdmFsaWRhdGVUb3VjaCk7XG4gICAgICAgIHRoaXMuc2V0VmFsaWRhdGlvbk9uSW5uZXJGb3Jtcyh2YWxpZGF0ZVRvdWNoKTtcbiAgICB9XG5cbiAgICAvLyBjaGFuZ2UgYW5kIGJsdXIgZXZlbnRzIGFyZSBhZGRlZCBmcm9tIHRoZSB0ZW1wbGF0ZVxuICAgIHByb3RlY3RlZCBoYW5kbGVFdmVudChub2RlOiBIVE1MRWxlbWVudCwgZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSAhPT0gJ3N1Ym1pdCcpIHtcbiAgICAgICAgICAgIHN1cGVyLmhhbmRsZUV2ZW50KHRoaXMubmF0aXZlRWxlbWVudCwgZXZlbnROYW1lLCBjYWxsYmFjaywgbG9jYWxzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlRmllbGRTb3VyY2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1kYXRhc291cmNlICYmIHRoaXMuZm9ybWRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5mb3JtZGF0YXNvdXJjZSAmJiAhdGhpcy5mb3JtZGF0YXNvdXJjZS50d29XYXlCaW5kaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JtRmllbGRzLmZvckVhY2goZm9ybUZpZWxkID0+IHtcbiAgICAgICAgICAgIGZvcm1GaWVsZC5zZXRGb3JtV2lkZ2V0KCdkYXRhdmFsdWVzb3VyY2UnLCB0aGlzLmZvcm1kYXRhc291cmNlKTtcbiAgICAgICAgICAgIGZvcm1GaWVsZC5zZXRGb3JtV2lkZ2V0KCdiaW5kZGF0YXZhbHVlJywgYCR7dGhpcy5iaW5kZm9ybWRhdGF9LiR7Zm9ybUZpZWxkLmtleX1gKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2QgbG9vcHMgdGhyb3VnaCB0aGUgZm9ybSBmaWVsZHMgYW5kIGhpZ2hsaWdodHMgdGhlIGludmFsaWQgZmllbGRzIGJ5IHNldHRpbmcgc3RhdGUgdG8gdG91Y2hlZFxuICAgIGhpZ2hsaWdodEludmFsaWRGaWVsZHMoKSB7XG4gICAgICAgIHNldFRvdWNoZWRTdGF0ZSh0aGlzLm5nZm9ybSk7XG4gICAgfVxuXG4gICAgLy8gRGlzYWJsZSB0aGUgZm9ybSBzdWJtaXQgaWYgZm9ybSBpcyBpbiBpbnZhbGlkIHN0YXRlLiBIaWdobGlnaHQgYWxsIHRoZSBpbnZhbGlkIGZpZWxkcyBpZiB2YWxpZGF0aW9uIHR5cGUgaXMgZGVmYXVsdFxuICAgIHZhbGlkYXRlRmllbGRzT25TdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuc2V0VmFsaWRhdGlvbk1zZ3MoKTtcbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgZm9ybSBzdWJtaXQgaWYgZm9ybSBpcyBpbiBpbnZhbGlkIHN0YXRlLiBGb3IgZGVsZXRlIG9wZXJhdGlvbiwgZG8gbm90IGNoZWNrIHRoZSB2YWxpZGF0aW9uLlxuICAgICAgICBpZiAodGhpcy5vcGVyYXRpb25UeXBlICE9PSAnZGVsZXRlJyAmJiAodGhpcy52YWxpZGF0aW9udHlwZSA9PT0gJ2h0bWwnIHx8IHRoaXMudmFsaWRhdGlvbnR5cGUgPT09ICdkZWZhdWx0JylcbiAgICAgICAgICAgICAgICAmJiB0aGlzLm5nZm9ybSAmJiB0aGlzLm5nZm9ybS5pbnZhbGlkKSB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5nZm9ybS5pbnZhbGlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGlvbnR5cGUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodEludmFsaWRGaWVsZHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRmluZCB0aGUgZmlyc3QgaW52YWxpZCB1bnRvY2hlZCBlbGVtZW50IGFuZCBzZXQgaXQgdG8gdG91Y2hlZC5cbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lcyBub3QgZm9ybSB2YWxpZGF0aW9ucy4gdGhpcyB3aWxsIGVuc3VyZSB0aGF0IGVycm9yIGlzIHNob3duIGZvciB1c2VyXG4gICAgICAgICAgICAgICAgY29uc3QgZWxlRm9ybSA9IGZpbmRJbnZhbGlkRWxlbWVudCh0aGlzLiRlbGVtZW50LCB0aGlzLm5nZm9ybSk7XG4gICAgICAgICAgICAgICAgY29uc3QgJGludmFsaWRGb3JtID0gZWxlRm9ybS5uZ0Zvcm07XG4gICAgICAgICAgICAgICAgbGV0ICRpbnZhbGlkRWxlICA9IGVsZUZvcm0uJGVsZTtcbiAgICAgICAgICAgICAgICAkaW52YWxpZEVsZSA9ICRpbnZhbGlkRWxlLnBhcmVudCgpLmZpbmQoJ1tmb2N1cy10YXJnZXRdJyk7XG4gICAgICAgICAgICAgICAgaWYgKCRpbnZhbGlkRWxlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvbiBzYXZlIGNsaWNrIGluIHBhZ2UgbGF5b3V0IGxpdmVmb3JtLCBmb2N1cyBvZiBhdXRvY29tcGxldGUgd2lkZ2V0IG9wZW5zIGZ1bGwtc2NyZWVuIHNlYXJjaC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkaW52YWxpZEVsZS5oYXNDbGFzcygnYXBwLXNlYXJjaC1pbnB1dCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkaW52YWxpZEVsZS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nRWxlID0gJGludmFsaWRGb3JtICYmICRpbnZhbGlkRm9ybS5jb250cm9sc1skaW52YWxpZEVsZS5hdHRyKCdmb3JtQ29udHJvbE5hbWUnKSB8fCAkaW52YWxpZEVsZS5hdHRyKCduYW1lJyldO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmdFbGUgJiYgbmdFbGUubWFya0FzVG91Y2hlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmdFbGUubWFya0FzVG91Y2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnY2FwdGlvbmFsaWduJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhcHRpb25BbGlnbkNsYXNzID0gJ2FsaWduLScgKyBudjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb25wb3NpdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXlvdXRDb25maWcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb253aWR0aCc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRMYXlvdXRDb25maWcoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb25zaXplJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhcHRpb25zaXplID0gbnY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3ZhbGlkYXRlJzpcbiAgICAgICAgICAgICAgICAvLyAgU2V0IHZhbGlkYXRpb24gdHlwZSBiYXNlZCBvbiB0aGUgbm92YWxpZGF0ZSBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0LnZhbGlkYXRpb250eXBlID0gKG52ID09PSB0cnVlIHx8IG52ID09PSAndHJ1ZScpID8gJ25vbmUnIDogJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZm9ybWRhdGEnOlxuICAgICAgICAgICAgICAgIC8vIEZvciBsaXZlbGlzdCB3aGVuIG11bHRpc2VsZWN0IGlzIGVuYWJsZWQsIGZvcm1kYXRhIHdpbGwgYmUgYXJyYXkgb2Ygb2JqZWN0cy4gSW4gdGhpcyBjYXNlIGNvbnNpZGVyIHRoZSBsYXN0IG9iamVjdCBhcyBmb3JtZGF0YS5cbiAgICAgICAgICAgICAgICBfLmlzQXJyYXkobnYpID8gdGhpcy5zZXRGb3JtRGF0YShfLmxhc3QobnYpKSA6IHRoaXMuc2V0Rm9ybURhdGEobnYpO1xuICAgICAgICAgICAgICAgIC8vIGlmIGRhdGFzZXQgb24gdGhlIGZvcm1GaWVsZHMgYXJlIG5vdCBzZXQgYXMgdGhlIGRhdGFzb3VyY2VDaGFuZ2UgaXMgdHJpZ2dlcmVkIGJlZm9yZSB0aGUgZm9ybUZpZWxkcyBhcmUgcmVnaXN0ZXJlZC5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNEYXRhU291cmNlVXBkYXRlZCAmJiB0aGlzLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRhdGFTb3VyY2VDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZWZhdWx0bW9kZSc6XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzTGF5b3V0RGlhbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChudiAmJiBudiA9PT0gJ0VkaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU1vZGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVNb2RlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1VwZGF0ZU1vZGUgPSB0aGlzLnVwZGF0ZU1vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGF0YXNvdXJjZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkRhdGFTb3VyY2VDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Zvcm1kYXRhc291cmNlJzpcbiAgICAgICAgICAgICAgICB0aGlzLm9uRm9ybURhdGFTb3VyY2VDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21ldGFkYXRhJzpcbiAgICAgICAgICAgICAgICB0aGlzLmdlbmVyYXRlRm9ybUZpZWxkcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEV2ZW50IGNhbGxiYWNrcyBvbiBzdWNjZXNzL2Vycm9yXG4gICAgb25SZXN1bHQoZGF0YSwgc3RhdHVzLCBldmVudD8pIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0geyRldmVudDogZXZlbnQsICRkYXRhOiBkYXRhLCAkb3BlcmF0aW9uOiB0aGlzLm9wZXJhdGlvblR5cGV9O1xuICAgICAgICAvLyB3aGV0aGVyIHNlcnZpY2UgY2FsbCBzdWNjZXNzIG9yIGZhaWx1cmUgY2FsbCB0aGlzIG1ldGhvZFxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jlc3VsdCcsIHBhcmFtcyk7XG4gICAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgIC8vIGlmIHNlcnZpY2UgY2FsbCBpcyBzdWNjZXNzIGNhbGwgdGhpcyBtZXRob2RcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VjY2VzcycsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiBzZXJ2aWNlIGNhbGwgZmFpbHMgY2FsbCB0aGlzIG1ldGhvZFxuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdlcnJvcicsIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEaXNwbGF5IG9yIGhpZGUgdGhlIGlubGluZSBtZXNzYWdlLyB0b2FzdGVyXG4gICAgdG9nZ2xlTWVzc2FnZShzaG93OiBib29sZWFuLCBtc2c/OiBzdHJpbmcsIHR5cGU/OiBzdHJpbmcsIGhlYWRlcj86IHN0cmluZykge1xuICAgICAgICBsZXQgdGVtcGxhdGU7XG4gICAgICAgIGlmIChzaG93ICYmIG1zZykge1xuICAgICAgICAgICAgdGVtcGxhdGUgPSAodHlwZSA9PT0gJ2Vycm9yJyAmJiB0aGlzLmVycm9ybWVzc2FnZSkgPyB0aGlzLmVycm9ybWVzc2FnZSA6IG1zZztcbiAgICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2VsYXlvdXQgPT09ICdJbmxpbmUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlID0geydjYXB0aW9uJzogdGVtcGxhdGUgfHwgJycsIHR5cGU6IHR5cGV9O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lc3NhZ2VSZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlUmVmLnNob3dNZXNzYWdlKHRoaXMuc3RhdHVzTWVzc2FnZS5jYXB0aW9uLCB0aGlzLnN0YXR1c01lc3NhZ2UudHlwZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC5ub3RpZnlBcHAodGVtcGxhdGUsIHR5cGUsIGhlYWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1c01lc3NhZ2UuY2FwdGlvbiA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSGlkZSB0aGUgaW5saW5lIG1lc3NhZ2UvIHRvYXN0ZXJcbiAgICBjbGVhck1lc3NhZ2UoKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlTWVzc2FnZShmYWxzZSk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBjbGFzc2VzIG9uIHRoZSBmb3JtIGJhc2VkIG9uIHRoZSBjYXB0aW9ucG9zaXRpb24gYW5kIGNhcHRpb253aWR0aCBwcm9wZXJ0aWVzXG4gICAgcHJpdmF0ZSBzZXRMYXlvdXRDb25maWcoKSB7XG4gICAgICAgIGxldCBsYXlvdXRDb25maWc7XG4gICAgICAgIGxheW91dENvbmZpZyA9IGdldEZpZWxkTGF5b3V0Q29uZmlnKHRoaXMuY2FwdGlvbndpZHRoLCB0aGlzLmNhcHRpb25wb3NpdGlvbiwgXy5nZXQodGhpcy5hcHAuc2VsZWN0ZWRWaWV3UG9ydCwgJ29zJykpO1xuICAgICAgICB0aGlzLl93aWRnZXRDbGFzcyA9IGxheW91dENvbmZpZy53aWRnZXRDbHM7XG4gICAgICAgIHRoaXMuX2NhcHRpb25DbGFzcyA9IGxheW91dENvbmZpZy5jYXB0aW9uQ2xzO1xuXG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICByZWdpc3RlckZvcm1XaWRnZXQod2lkZ2V0KSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB3aWRnZXQubmFtZSB8fCB3aWRnZXQua2V5O1xuICAgICAgICB0aGlzLmZvcm1XaWRnZXRzW25hbWVdID0gd2lkZ2V0O1xuICAgIH1cblxuICAgIHJlZ2lzdGVyRm9ybUZpZWxkcyhmb3JtRmllbGQpIHtcbiAgICAgICAgdGhpcy5mb3JtRmllbGRzLnB1c2goZm9ybUZpZWxkKTtcbiAgICAgICAgdGhpcy5mb3JtZmllbGRzW2Zvcm1GaWVsZC5rZXldID0gZm9ybUZpZWxkO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRm9ybVdpZGdldChmb3JtRmllbGQpO1xuICAgICAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVGaWVsZFNvdXJjZSgpO1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRGb3JtKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudEZvcm0uZm9ybUZpZWxkcy5wdXNoKGZvcm1GaWVsZCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudEZvcm0uZm9ybWZpZWxkc1tmb3JtRmllbGQua2V5XSA9IGZvcm1GaWVsZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZ2lzdGVyQWN0aW9ucyhmb3JtQWN0aW9uKSB7XG4gICAgICAgIHRoaXMuYnV0dG9uQXJyYXkucHVzaChmb3JtQWN0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRhdGFvdXRwdXQgd2hlbmV2ZXIgdGhlcmUgaXMgYSBjaGFuZ2UgaW4gaW5zaWRlIGZvcm0gd2lkZ2V0IHZhbHVlXG4gICAgdXBkYXRlRm9ybURhdGFPdXRwdXQoZGF0YU9iamVjdCkge1xuICAgICAgICAvLyBTZXQgdGhlIHZhbHVlcyBvZiB0aGUgd2lkZ2V0cyBpbnNpZGUgdGhlIGxpdmUgZm9ybSAob3RoZXIgdGhhbiBmb3JtIGZpZWxkcykgaW4gZm9ybSBkYXRhXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLm5nZm9ybS52YWx1ZSwgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIV8uZmluZCh0aGlzLmZvcm1GaWVsZHMsIHtrZXl9KSkge1xuICAgICAgICAgICAgICAgIGRhdGFPYmplY3Rba2V5XSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZGF0YW91dHB1dCA9IGRhdGFPYmplY3Q7XG4gICAgfVxuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBkYXRhIG9iamVjdCBtZXJnaW5nIHRoZSBmb3JtIGZpZWxkcyBhbmQgY3VzdG9tIHdpZGdldHMgZGF0YVxuICAgIGNvbnN0cnVjdERhdGFPYmplY3QoKSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhICAgICA9IHt9O1xuICAgICAgICBjb25zdCBmb3JtRmllbGRzID0gdGhpcy5nZXRGb3JtRmllbGRzKCk7XG4gICAgICAgIC8vIEdldCBhbGwgZm9ybSBmaWVsZHMgYW5kIHByZXBhcmUgZm9ybSBkYXRhIGFzIGtleSB2YWx1ZSBwYWlyc1xuICAgICAgICBmb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgbGV0IGZpZWxkTmFtZSxcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkLmRhdGF2YWx1ZSB8fCBmaWVsZC5fY29udHJvbC52YWx1ZTtcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSAoZmllbGRWYWx1ZSA9PT0gbnVsbCB8fCBmaWVsZFZhbHVlID09PSAnJykgPyB1bmRlZmluZWQgOiBmaWVsZFZhbHVlO1xuXG4gICAgICAgICAgICBpZiAoZmllbGQudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGdldEZpbGVzKHRoaXMubmFtZSwgZmllbGQua2V5ICsgJ19mb3JtV2lkZ2V0JywgZmllbGQubXVsdGlwbGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBmaWVsZC5rZXkgfHwgZmllbGQudGFyZ2V0IHx8IGZpZWxkLm5hbWU7XG4gICAgICAgICAgICAvLyBJbiBjYXNlIG9mIHVwZGF0ZSB0aGUgZmllbGQgd2lsbCBiZSBhbHJlYWR5IHByZXNlbnQgaW4gZm9ybSBkYXRhXG4gICAgICAgICAgICBfLnNldChmb3JtRGF0YSwgZmllbGROYW1lLCBmaWVsZFZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlRm9ybURhdGFPdXRwdXQoZm9ybURhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhb3V0cHV0O1xuICAgIH1cblxuICAgIHVwZGF0ZURhdGFPdXRwdXQoKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgICAgICBpZiAodGhpcy5uZ2Zvcm0udG91Y2hlZCkge1xuICAgICAgICAgICAgdGhpcy5zZXRWYWxpZGF0aW9uTXNncyh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEZvcm1GaWVsZHMgd2lsbCBjb250YWluIGFsbCB0aGUgZmllbGRzIGluIHBhcmVudCBhbmQgaW5uZXIgZm9ybSBhbHNvLlxuICAgIC8vIFRoaXMgcmV0dXJucyB0aGUgZm9ybUZpZWxkcyBpbiB0aGUgZm9ybSBiYXNlZCBvbiB0aGUgZm9ybSBuYW1lLlxuICAgIGdldEZvcm1GaWVsZHMoKSB7XG4gICAgICAgIHJldHVybiBfLmZpbHRlcih0aGlzLmZvcm1GaWVsZHMsIGZvcm1GaWVsZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybUZpZWxkLmZvcm0ubmFtZSA9PT0gdGhpcy5uYW1lO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzZXRGb3JtRGF0YShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGZvcm1GaWVsZHMgPSB0aGlzLmdldEZvcm1GaWVsZHMoKTtcbiAgICAgICAgZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gIF8uZ2V0KGRhdGEsIGZpZWxkLmtleSB8fCBmaWVsZC5uYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3REYXRhT2JqZWN0KCk7XG4gICAgfVxuXG4gICAgcmVzZXRGb3JtU3RhdGUoKSB7XG4gICAgICAgIC8vIGNsZWFyaW5nIHRoZSB2YWxpZGF0aW9uTWVzc2FnZXMgb24gcmVzZXQuXG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRpb25NZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvbk1lc3NhZ2VzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm5nZm9ybSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uZ2Zvcm0ubWFya0FzVW50b3VjaGVkKCk7XG4gICAgICAgICAgICB0aGlzLm5nZm9ybS5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5yZXNldEZvcm1TdGF0ZSgpO1xuICAgICAgICB0aGlzLmZvcm1GaWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBmaWVsZC52YWx1ZSA9ICcnO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3REYXRhT2JqZWN0KCk7XG4gICAgICAgIHRoaXMuY2xlYXJNZXNzYWdlKCk7XG4gICAgfVxuXG4gICAgc3VibWl0Rm9ybSgkZXZlbnQpIHtcbiAgICAgICAgbGV0IGZvcm1EYXRhLCB0ZW1wbGF0ZSwgcGFyYW1zO1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy5kYXRhc291cmNlO1xuICAgICAgICAvLyBEaXNhYmxlIHRoZSBmb3JtIHN1Ym1pdCBpZiBmb3JtIGlzIGluIGludmFsaWQgc3RhdGUuXG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlRmllbGRzT25TdWJtaXQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNldEZvcm1TdGF0ZSgpO1xuXG4gICAgICAgIGZvcm1EYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuY29uc3RydWN0RGF0YU9iamVjdCgpKTtcblxuICAgICAgICBwYXJhbXMgPSB7JGV2ZW50LCAkZm9ybURhdGE6IGZvcm1EYXRhLCAkZGF0YTogZm9ybURhdGF9O1xuXG4gICAgICAgIGlmICh0aGlzLm9uQmVmb3JlU3VibWl0RXZ0ICYmICh0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXN1Ym1pdCcsIHBhcmFtcykgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub25TdWJtaXRFdnQgfHwgZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgLy8gSWYgb24gc3VibWl0IGlzIHRoZXJlIGV4ZWN1dGUgaXQgYW5kIGlmIGl0IHJldHVybnMgdHJ1ZSBkbyBzZXJ2aWNlIHZhcmlhYmxlIGludm9rZSBlbHNlIHJldHVyblxuICAgICAgICAgICAgLy8gSWYgaXRzIGEgc2VydmljZSB2YXJpYWJsZSBjYWxsIHNldElucHV0IGFuZCBhc3NpZ24gZm9ybSBkYXRhIGFuZCBpbnZva2UgdGhlIHNlcnZpY2VcbiAgICAgICAgICAgIGlmIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICAgICAgcGVyZm9ybURhdGFPcGVyYXRpb24oZGF0YVNvdXJjZSwgZm9ybURhdGEsIHt9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJlc3VsdChkYXRhLCB0cnVlLCAkZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVNZXNzYWdlKHRydWUsIHRoaXMucG9zdG1lc3NhZ2UsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Ym1pdCcsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUgPSB0aGlzLmVycm9ybWVzc2FnZSB8fCBlcnJvci5lcnJvciB8fCBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25SZXN1bHQoZXJyb3IsIGZhbHNlLCAkZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVNZXNzYWdlKHRydWUsIHRlbXBsYXRlLCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VibWl0JywgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMub25SZXN1bHQoe30sIHRydWUsICRldmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWJtaXQnLCBwYXJhbXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vblJlc3VsdCh7fSwgdHJ1ZSwgJGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBzaG93L2hpZGUgdGhlIHBhbmVsIGhlYWRlciBvciBmb290ZXIgYmFzZWQgb24gdGhlIGJ1dHRvbnNcbiAgICBzaG93QnV0dG9ucyhwb3NpdGlvbikge1xuICAgICAgICByZXR1cm4gXy5zb21lKHRoaXMuYnV0dG9uQXJyYXksIGJ0biA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXy5pbmNsdWRlcyhidG4ucG9zaXRpb24sIHBvc2l0aW9uKSAmJiBidG4udXBkYXRlTW9kZSA9PT0gdGhpcy5pc1VwZGF0ZU1vZGU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEV4cGFuZCBvciBjb2xsYXBzZSB0aGUgcGFuZWxcbiAgICBleHBhbmRDb2xsYXBzZVBhbmVsKCkge1xuICAgICAgICBpZiAodGhpcy5jb2xsYXBzaWJsZSkge1xuICAgICAgICAgICAgLy8gZmxpcCB0aGUgYWN0aXZlIGZsYWdcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWQgPSAhdGhpcy5leHBhbmRlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9uIGZvcm0gZGF0YSBzb3VyY2UgY2hhbmdlLiBUaGlzIG1ldGhvZCBpcyBvdmVycmlkZGVuIGJ5IGxpdmUgZm9ybSBhbmQgbGl2ZSBmaWx0ZXJcbiAgICBvbkRhdGFTb3VyY2VDaGFuZ2UoKSB7XG4gICAgfVxuXG4gICAgLy8gT24gZm9ybSBkYXRhIHNvdXJjZSBjaGFuZ2UuIFRoaXMgbWV0aG9kIGlzIG92ZXJyaWRkZW4gYnkgbGl2ZSBmb3JtIGFuZCBsaXZlIGZpbHRlclxuICAgIG9uRm9ybURhdGFTb3VyY2VDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlRmllbGRTb3VyY2UoKTtcbiAgICB9XG5cbiAgICAvLyBPbiBmb3JtIGZpZWxkIGRlZmF1bHQgdmFsdWUgY2hhbmdlLiBUaGlzIG1ldGhvZCBpcyBvdmVycmlkZGVuIGJ5IGxpdmUgZm9ybSBhbmQgbGl2ZSBmaWx0ZXJcbiAgICBvbkZpZWxkRGVmYXVsdFZhbHVlQ2hhbmdlKGZpZWxkLCBudikge1xuICAgICAgICBmaWVsZC52YWx1ZSA9IHBhcnNlVmFsdWVCeVR5cGUobnYsIHVuZGVmaW5lZCwgZmllbGQud2lkZ2V0dHlwZSk7XG4gICAgfVxuXG4gICAgLy8gT24gZm9ybSBmaWVsZCB2YWx1ZSBjaGFuZ2UuIFRoaXMgbWV0aG9kIGlzIG92ZXJyaWRkZW4gYnkgbGl2ZSBmb3JtIGFuZCBsaXZlIGZpbHRlclxuICAgIG9uRmllbGRWYWx1ZUNoYW5nZSgpIHtcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0byBnZW5lcmF0ZSBhbmQgY29tcGlsZSB0aGUgZm9ybSBmaWVsZHMgZnJvbSB0aGUgbWV0YWRhdGFcbiAgICBhc3luYyBnZW5lcmF0ZUZvcm1GaWVsZHMoKSB7XG4gICAgICAgIGxldCBub09mQ29sdW1ucztcbiAgICAgICAgbGV0ICRncmlkTGF5b3V0O1xuICAgICAgICAvLyBDaGVjayBpZiBncmlkIGxheW91dCBpcyBwcmVzZW50IG9yIG5vdCBmb3IgZmlyc3QgdGltZVxuICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh0aGlzLl9pc0dyaWRMYXlvdXRQcmVzZW50KSkge1xuICAgICAgICAgICAgdGhpcy5faXNHcmlkTGF5b3V0UHJlc2VudCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLnBhbmVsLWJvZHkgW3dtbGF5b3V0Z3JpZF0nKS5sZW5ndGggPiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9pc0dyaWRMYXlvdXRQcmVzZW50KSB7XG4gICAgICAgICAgICAkZ3JpZExheW91dCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmZvcm0tZWxlbWVudHMgW3dtbGF5b3V0Z3JpZF06Zmlyc3QnKTtcbiAgICAgICAgICAgIG5vT2ZDb2x1bW5zID0gTnVtYmVyKCRncmlkTGF5b3V0LmF0dHIoJ2NvbHVtbnMnKSkgfHwgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRncmlkTGF5b3V0ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuZm9ybS1lbGVtZW50cyAuZHluYW1pYy1mb3JtLWNvbnRhaW5lcicpO1xuICAgICAgICAgICAgaWYgKCEkZ3JpZExheW91dC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5mb3JtLWVsZW1lbnRzJykucHJlcGVuZCgnPGRpdiBjbGFzcz1cImR5bmFtaWMtZm9ybS1jb250YWluZXJcIj48L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAkZ3JpZExheW91dCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmZvcm0tZWxlbWVudHMgLmR5bmFtaWMtZm9ybS1jb250YWluZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vT2ZDb2x1bW5zID0gMTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb2x1bW5XaWR0aCA9IDEyIC8gbm9PZkNvbHVtbnM7XG4gICAgICAgIGxldCBmaWVsZFRlbXBsYXRlID0gJyc7XG4gICAgICAgIGxldCBjb2xDb3VudCA9IDA7XG4gICAgICAgIGxldCBpbmRleDtcbiAgICAgICAgbGV0IHVzZXJGaWVsZHM7XG4gICAgICAgIGxldCBmaWVsZHMgPSB0aGlzLm1ldGFkYXRhID8gdGhpcy5tZXRhZGF0YS5kYXRhIHx8IHRoaXMubWV0YWRhdGEgOiBbXTtcblxuICAgICAgICB0aGlzLmZvcm1GaWVsZHMgPSBbXTsgLy8gZW1wdHkgdGhlIGZvcm0gZmllbGRzXG5cbiAgICAgICAgaWYgKF8uaXNFbXB0eShmaWVsZHMpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVJlbmRlckV2dCkge1xuICAgICAgICAgICAgdXNlckZpZWxkcyA9IHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3JlcmVuZGVyJywgeyRtZXRhZGF0YTogZmllbGRzfSk7XG4gICAgICAgICAgICBpZiAodXNlckZpZWxkcykge1xuICAgICAgICAgICAgICAgIGZpZWxkcyA9IHVzZXJGaWVsZHM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV8uaXNBcnJheShmaWVsZHMpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoZmllbGRzW2NvbENvdW50XSkge1xuICAgICAgICAgICAgbGV0IGNvbFRtcGwgPSAnJztcbiAgICAgICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IG5vT2ZDb2x1bW5zOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkc1tjb2xDb3VudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29sVG1wbCArPSBzZXRNYXJrdXBGb3JGb3JtRmllbGQoZmllbGRzW2NvbENvdW50XSwgY29sdW1uV2lkdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb2xDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGRUZW1wbGF0ZSArPSBgPHdtLWdyaWRyb3c+JHtjb2xUbXBsfTwvd20tZ3JpZHJvdz5gO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9pc0dyaWRMYXlvdXRQcmVzZW50KSB7XG4gICAgICAgICAgICBmaWVsZFRlbXBsYXRlID0gYDx3bS1sYXlvdXRncmlkPiR7ZmllbGRUZW1wbGF0ZX08L3dtLWxheW91dGdyaWQ+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZHluYW1pY0Zvcm1SZWYuY2xlYXIoKTtcblxuICAgICAgICBpZiAoIXRoaXMuX2R5bmFtaWNDb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9keW5hbWljQ29udGV4dCA9IE9iamVjdC5jcmVhdGUodGhpcy52aWV3UGFyZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2R5bmFtaWNDb250ZXh0LmZvcm0gPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZWYgPSBhd2FpdCB0aGlzLmR5bmFtaWNDb21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnRGYWN0b3J5UmVmKFxuICAgICAgICAgICAgJ2FwcC1mb3JtLWR5bmFtaWMtJyArIHRoaXMud2lkZ2V0SWQsXG4gICAgICAgICAgICBmaWVsZFRlbXBsYXRlLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNwaWxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5keW5hbWljRm9ybVJlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeVJlZiwgMCwgdGhpcy5pbmopO1xuICAgICAgICBleHRlbmRQcm90byhjb21wb25lbnQuaW5zdGFuY2UsIHRoaXMuX2R5bmFtaWNDb250ZXh0KTtcbiAgICAgICAgJGdyaWRMYXlvdXRbMF0uYXBwZW5kQ2hpbGQoY29tcG9uZW50LmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICB0aGlzLnNldEZvcm1EYXRhKHRoaXMuZm9ybWRhdGEpO1xuICAgIH1cblxuICAgIGdldCBtb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vcGVyYXRpb25UeXBlIHx8IHRoaXMuZmluZE9wZXJhdGlvblR5cGUoKTtcbiAgICB9XG5cbiAgICBnZXQgZGlydHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5nZm9ybSAmJiB0aGlzLm5nZm9ybS5kaXJ0eTtcbiAgICB9XG5cbiAgICBnZXQgaW52YWxpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmdmb3JtICYmIHRoaXMubmdmb3JtLmludmFsaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHRvdWNoZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5nZm9ybSAmJiB0aGlzLm5nZm9ybS50b3VjaGVkO1xuICAgIH1cblxuICAgIGludm9rZUFjdGlvbkV2ZW50KCRldmVudCwgZXhwcmVzc2lvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZuID0gJHBhcnNlRXZlbnQoZXhwcmVzc2lvbik7XG4gICAgICAgIGZuKHRoaXMudmlld1BhcmVudCwgT2JqZWN0LmFzc2lnbih0aGlzLmNvbnRleHQsIHskZXZlbnR9KSk7XG4gICAgfVxufVxuIl19