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
var WIDGET_CONFIG = { widgetType: 'wm-form', hostClass: 'panel app-panel app-form' };
var LOGIN_FORM_CONFIG = { widgetType: 'wm-form', hostClass: 'app-form app-login-form' };
var LIVE_FORM_CONFIG = { widgetType: 'wm-liveform', hostClass: 'panel app-panel app-liveform liveform-inline' };
var LIVE_FILTER_CONFIG = { widgetType: 'wm-livefilter', hostClass: 'panel app-panel app-livefilter clearfix liveform-inline' };
var getWidgetConfig = function (isLiveForm, isLiveFilter, role) {
    var config = WIDGET_CONFIG;
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
var ɵ0 = getWidgetConfig;
// Generate the form field with given field definition. Add a grid column wrapper around the form field.
var setMarkupForFormField = function (field, columnWidth) {
    var propsTmpl = '';
    _.forEach(field, function (value, key) {
        propsTmpl = propsTmpl + " " + key + "=\"" + value + "\"";
    });
    return "<wm-gridcolumn columnwidth=\"" + columnWidth + "\">\n                  <wm-form-field " + propsTmpl + "></wm-form-field>\n            </wm-gridcolumn>";
};
var ɵ1 = setMarkupForFormField;
// Function to find out the first invalid element in form
var findInvalidElement = function ($formEle, ngForm) {
    var $ele = $formEle.find('form.ng-invalid:visible, [formControlName].ng-invalid:visible').first();
    var formObj = ngForm;
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
var ɵ2 = findInvalidElement;
var setTouchedState = function (ngForm) {
    if (ngForm.valid) {
        return;
    }
    if (ngForm.controls) {
        _.forEach(ngForm.controls, function (ctrl) {
            setTouchedState(ctrl);
        });
    }
    else {
        ngForm.markAsTouched();
    }
};
var ɵ3 = setTouchedState;
var FormComponent = /** @class */ (function (_super) {
    tslib_1.__extends(FormComponent, _super);
    function FormComponent(inj, fb, app, dynamicComponentProvider, ngZone, parentList, parentForm, onBeforeSubmitEvt, onSubmitEvt, onBeforeRenderEvt, binddataset, bindformdata, isLiveForm, isLiveFilter, role, key, name) {
        var _this = _super.call(this, inj, getWidgetConfig(isLiveForm, isLiveFilter, role)) || this;
        _this.fb = fb;
        _this.app = app;
        _this.dynamicComponentProvider = dynamicComponentProvider;
        _this.ngZone = ngZone;
        _this.parentList = parentList;
        _this.parentForm = parentForm;
        _this.onBeforeSubmitEvt = onBeforeSubmitEvt;
        _this.onSubmitEvt = onSubmitEvt;
        _this.onBeforeRenderEvt = onBeforeRenderEvt;
        _this.binddataset = binddataset;
        _this.bindformdata = bindformdata;
        _this._widgetClass = '';
        _this._captionClass = '';
        _this.formFields = [];
        _this.formfields = {};
        _this.formWidgets = {};
        _this.filterWidgets = {};
        _this.buttonArray = [];
        _this.dataoutput = {};
        _this.formdata = {};
        _this.statusMessage = {
            caption: '',
            type: ''
        };
        _this.primaryKey = [];
        _this._debouncedUpdateFieldSource = _.debounce(_this.updateFieldSource, 350);
        _this.validationMessages = [];
        _this._debouncedSubmitForm = debounce(function ($event) {
            // calling submit event in ngZone as change detection is not triggered post the submit callback and actions like notification are not shown
            _this.ngZone.run(function () {
                _this.submitForm($event);
            });
        }, 250);
        styler(_this.nativeElement, _this);
        _this.isUpdateMode = true;
        _this.dialogId = _this.nativeElement.getAttribute('dialogId');
        _this.ngform = fb.group({});
        _this.addInnerNgFormToForm(key || name);
        // On value change in form, update the dataoutput
        var onValueChangeSubscription = _this.ngform.valueChanges
            .subscribe(_this.updateDataOutput.bind(_this));
        _this.registerDestroyListener(function () { return onValueChangeSubscription.unsubscribe(); });
        _this.elScope = _this;
        _this.addEventsToContext(_this.context);
        return _this;
    }
    Object.defineProperty(FormComponent.prototype, "isLayoutDialog", {
        get: function () {
            return this._isLayoutDialog;
        },
        set: function (nv) {
            if (nv) {
                removeClass(this.nativeElement, 'panel app-panel liveform-inline');
            }
            this._isLayoutDialog = nv;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormComponent.prototype, "isUpdateMode", {
        get: function () {
            return this._isUpdateMode;
        },
        set: function (nv) {
            this._isUpdateMode = nv;
            this.formFields.forEach(function (field) {
                field.setReadOnlyState(nv);
            });
        },
        enumerable: true,
        configurable: true
    });
    FormComponent.prototype.submit = function ($event) {
        this._debouncedSubmitForm($event);
    };
    FormComponent.prototype.onReset = function () {
        this.reset();
    };
    FormComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.componentRefs.forEach(function (componentRef) {
                if (componentRef.name) {
                    // Register widgets inside form with formWidgets
                    _this.formWidgets[componentRef.name] = componentRef;
                }
            });
        }, 250);
    };
    FormComponent.prototype.findOperationType = function () { };
    FormComponent.prototype.addInnerNgFormToForm = function (binding) {
        if (this.parentForm && this.parentForm.ngform) {
            var counter = 1;
            var innerBinding = binding;
            // Inner forms may have same names. If same name is present, append unqiue identifier
            while (this.parentForm.ngform.controls.hasOwnProperty(innerBinding)) {
                innerBinding = binding + "_" + counter;
                counter++;
            }
            this.formGroupName = innerBinding;
            // If parent form is present, add the current form as as formGroup for parent form
            this.parentForm.ngform.addControl(innerBinding, this.ngform);
        }
    };
    // Expose the events on context so that they can be accessed by form actions
    FormComponent.prototype.addEventsToContext = function (context) {
        var _this = this;
        context.cancel = function () { return _this.cancel(); };
        context.reset = function () { return _this.reset(); };
        context.save = function (evt) { return _this.save(evt); };
        context.saveAndNew = function () { return _this.saveAndNew(); };
        context.saveAndView = function () { return _this.saveAndView(); };
        context.delete = function () { return _this.delete(); };
        context.new = function () { return _this.new(); };
        context.edit = function () { return _this.edit(); };
        context.highlightInvalidFields = function () { return _this.highlightInvalidFields(); };
        context.filter = function () { return _this.filter(); };
        context.clearFilter = function () { return _this.clearFilter(); };
        context.submit = function (evt) { return _this.submit(evt); };
    };
    // This method gets all the inner forms and validates each form.
    FormComponent.prototype.setValidationOnInnerForms = function (validateTouch) {
        var _this = this;
        var formEle = this.getNativeElement();
        var formObjs = formEle.querySelectorAll('.app-form');
        var validationMsgs = [];
        _.forEach(formObjs, function (e) {
            var formInstance = e.widget;
            // differentiating the validationMessages prefix based on the formGroupName
            // as the formName's are same when forms are in list
            var formName = _.get(formInstance, 'formGroupName') || formInstance.name;
            var current = formInstance;
            while (_.get(current, 'parentForm')) {
                var parentName = current.parentForm.formGroupName || current.parentForm.name;
                formName = parentName + '.' + formName;
                current = current.parentForm;
            }
            _this.setValidationOnFields(formInstance, formName, validateTouch);
        });
    };
    /**
     * This method sets validation on formFields.
     * Applies to innerform and also sets innerform validation on parent form.
     * @param prefix contains the form name, which also includes its parents form name
     * @param {boolean} validateTouch
     */
    FormComponent.prototype.setValidationOnFields = function (form, prefix, validateTouch) {
        var _this = this;
        var controls = form.ngform.controls;
        var formFields = form.formFields;
        if (!formFields) {
            return;
        }
        _.forEach(controls, function (v, k) {
            var field = formFields.find(function (e) { return e.key === k; });
            if (!field || (validateTouch && !v.touched)) {
                return;
            }
            // invoking the prepareValidation on both parent form and current form.
            _this.prepareValidationObj(v, k, field, prefix);
            _this.prepareValidationObj.call(form, v, k, field, prefix);
        });
    };
    // Assigns / updates validationMessages based on angular errors on field
    FormComponent.prototype.prepareValidationObj = function (v, k, field, prefix) {
        var index = this.validationMessages.findIndex(function (e) { return (e.field === k && e.fullyQualifiedFormName === prefix); });
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
                    getElement: function () {
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
    };
    // This will return a object containing the error details from the list of formFields that are invalid
    FormComponent.prototype.setValidationMsgs = function (validateTouch) {
        if (!this.formFields.length && _.isEmpty(this.ngform.controls)) {
            return;
        }
        this.setValidationOnFields(this, this.name, validateTouch);
        this.setValidationOnInnerForms(validateTouch);
    };
    // change and blur events are added from the template
    FormComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'submit') {
            _super.prototype.handleEvent.call(this, this.nativeElement, eventName, callback, locals);
        }
    };
    FormComponent.prototype.updateFieldSource = function () {
        var _this = this;
        if (this.formdatasource && this.formdatasource.execute(DataSource.Operation.IS_API_AWARE)) {
            return;
        }
        else if (this.formdatasource && !this.formdatasource.twoWayBinding) {
            return;
        }
        this.formFields.forEach(function (formField) {
            formField.setFormWidget('datavaluesource', _this.formdatasource);
            formField.setFormWidget('binddatavalue', _this.bindformdata + "." + formField.key);
        });
    };
    // This method loops through the form fields and highlights the invalid fields by setting state to touched
    FormComponent.prototype.highlightInvalidFields = function () {
        setTouchedState(this.ngform);
    };
    // Disable the form submit if form is in invalid state. Highlight all the invalid fields if validation type is default
    FormComponent.prototype.validateFieldsOnSubmit = function () {
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
                var eleForm = findInvalidElement(this.$element, this.ngform);
                var $invalidForm = eleForm.ngForm;
                var $invalidEle = eleForm.$ele;
                $invalidEle = $invalidEle.parent().find('[focus-target]');
                if ($invalidEle.length) {
                    // on save click in page layout liveform, focus of autocomplete widget opens full-screen search.
                    if (!$invalidEle.hasClass('app-search-input')) {
                        $invalidEle.focus();
                    }
                    var ngEle = $invalidForm && $invalidForm.controls[$invalidEle.attr('formControlName') || $invalidEle.attr('name')];
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
    };
    FormComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
                _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    // Event callbacks on success/error
    FormComponent.prototype.onResult = function (data, status, event) {
        var params = { $event: event, $data: data, $operation: this.operationType };
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
    };
    // Display or hide the inline message/ toaster
    FormComponent.prototype.toggleMessage = function (show, msg, type, header) {
        var template;
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
    };
    // Hide the inline message/ toaster
    FormComponent.prototype.clearMessage = function () {
        this.toggleMessage(false);
    };
    // Set the classes on the form based on the captionposition and captionwidth properties
    FormComponent.prototype.setLayoutConfig = function () {
        var layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition, _.get(this.app.selectedViewPort, 'os'));
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;
        $appDigest();
    };
    FormComponent.prototype.registerFormWidget = function (widget) {
        var name = widget.name || widget.key;
        this.formWidgets[name] = widget;
    };
    FormComponent.prototype.registerFormFields = function (formField) {
        this.formFields.push(formField);
        this.formfields[formField.key] = formField;
        this.registerFormWidget(formField);
        this._debouncedUpdateFieldSource();
        if (this.parentForm) {
            this.parentForm.formFields.push(formField);
            this.parentForm.formfields[formField.key] = formField;
        }
    };
    FormComponent.prototype.registerActions = function (formAction) {
        this.buttonArray.push(formAction);
    };
    // Update the dataoutput whenever there is a change in inside form widget value
    FormComponent.prototype.updateFormDataOutput = function (dataObject) {
        var _this = this;
        // Set the values of the widgets inside the live form (other than form fields) in form data
        _.forEach(this.ngform.value, function (val, key) {
            if (!_.find(_this.formFields, { key: key })) {
                dataObject[key] = val;
            }
        });
        this.dataoutput = dataObject;
    };
    // Construct the data object merging the form fields and custom widgets data
    FormComponent.prototype.constructDataObject = function () {
        var _this = this;
        var formData = {};
        var formFields = this.getFormFields();
        // Get all form fields and prepare form data as key value pairs
        formFields.forEach(function (field) {
            var fieldName, fieldValue;
            fieldValue = field.datavalue || field._control.value;
            fieldValue = (fieldValue === null || fieldValue === '') ? undefined : fieldValue;
            if (field.type === 'file') {
                fieldValue = getFiles(_this.name, field.key + '_formWidget', field.multiple);
            }
            fieldName = field.key || field.target || field.name;
            // In case of update the field will be already present in form data
            _.set(formData, fieldName, fieldValue);
        });
        this.updateFormDataOutput(formData);
        return this.dataoutput;
    };
    FormComponent.prototype.updateDataOutput = function () {
        this.constructDataObject();
        if (this.ngform.touched) {
            this.setValidationMsgs(true);
        }
    };
    // FormFields will contain all the fields in parent and inner form also.
    // This returns the formFields in the form based on the form name.
    FormComponent.prototype.getFormFields = function () {
        var _this = this;
        return _.filter(this.formFields, function (formField) {
            return formField.form.name === _this.name;
        });
    };
    FormComponent.prototype.setFormData = function (data) {
        var formFields = this.getFormFields();
        formFields.forEach(function (field) {
            field.value = _.get(data, field.key || field.name);
        });
        this.constructDataObject();
    };
    FormComponent.prototype.resetFormState = function () {
        var _this = this;
        // clearing the validationMessages on reset.
        if (this.validationMessages.length) {
            this.validationMessages = [];
        }
        if (!this.ngform) {
            return;
        }
        setTimeout(function () {
            _this.ngform.markAsUntouched();
            _this.ngform.markAsPristine();
        });
    };
    FormComponent.prototype.reset = function () {
        this.resetFormState();
        this.formFields.forEach(function (field) {
            field.value = '';
        });
        this.constructDataObject();
        this.clearMessage();
    };
    FormComponent.prototype.submitForm = function ($event) {
        var _this = this;
        var formData, template, params;
        var dataSource = this.datasource;
        // Disable the form submit if form is in invalid state.
        if (this.validateFieldsOnSubmit()) {
            return;
        }
        this.resetFormState();
        formData = getClonedObject(this.constructDataObject());
        params = { $event: $event, $formData: formData, $data: formData };
        if (this.onBeforeSubmitEvt && (this.invokeEventCallback('beforesubmit', params) === false)) {
            return;
        }
        if (this.onSubmitEvt || dataSource) {
            // If on submit is there execute it and if it returns true do service variable invoke else return
            // If its a service variable call setInput and assign form data and invoke the service
            if (dataSource) {
                performDataOperation(dataSource, formData, {})
                    .then(function (data) {
                    _this.onResult(data, true, $event);
                    _this.toggleMessage(true, _this.postmessage, 'success');
                    _this.invokeEventCallback('submit', params);
                }, function (error) {
                    template = _this.errormessage || error.error || error;
                    _this.onResult(error, false, $event);
                    _this.toggleMessage(true, template, 'error');
                    _this.invokeEventCallback('submit', params);
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
    };
    // Method to show/hide the panel header or footer based on the buttons
    FormComponent.prototype.showButtons = function (position) {
        var _this = this;
        return _.some(this.buttonArray, function (btn) {
            return _.includes(btn.position, position) && btn.updateMode === _this.isUpdateMode;
        });
    };
    // Expand or collapse the panel
    FormComponent.prototype.expandCollapsePanel = function () {
        if (this.collapsible) {
            // flip the active flag
            this.expanded = !this.expanded;
        }
    };
    // On form data source change. This method is overridden by live form and live filter
    FormComponent.prototype.onDataSourceChange = function () {
    };
    // On form data source change. This method is overridden by live form and live filter
    FormComponent.prototype.onFormDataSourceChange = function () {
        this.updateFieldSource();
    };
    // On form field default value change. This method is overridden by live form and live filter
    FormComponent.prototype.onFieldDefaultValueChange = function (field, nv) {
        field.value = parseValueByType(nv, undefined, field.widgettype);
    };
    // On form field value change. This method is overridden by live form and live filter
    FormComponent.prototype.onFieldValueChange = function () {
    };
    // Function to generate and compile the form fields from the metadata
    FormComponent.prototype.generateFormFields = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var noOfColumns, $gridLayout, columnWidth, fieldTemplate, colCount, index, userFields, fields, colTmpl, componentFactoryRef, component;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        columnWidth = 12 / noOfColumns;
                        fieldTemplate = '';
                        colCount = 0;
                        fields = this.metadata ? this.metadata.data || this.metadata : [];
                        this.formFields = []; // empty the form fields
                        if (_.isEmpty(fields)) {
                            return [2 /*return*/];
                        }
                        if (this.onBeforeRenderEvt) {
                            userFields = this.invokeEventCallback('beforerender', { $metadata: fields });
                            if (userFields) {
                                fields = userFields;
                            }
                        }
                        if (!_.isArray(fields)) {
                            return [2 /*return*/];
                        }
                        while (fields[colCount]) {
                            colTmpl = '';
                            for (index = 0; index < noOfColumns; index++) {
                                if (fields[colCount]) {
                                    colTmpl += setMarkupForFormField(fields[colCount], columnWidth);
                                }
                                colCount++;
                            }
                            fieldTemplate += "<wm-gridrow>" + colTmpl + "</wm-gridrow>";
                        }
                        if (!this._isGridLayoutPresent) {
                            fieldTemplate = "<wm-layoutgrid>" + fieldTemplate + "</wm-layoutgrid>";
                        }
                        this.dynamicFormRef.clear();
                        if (!this._dynamicContext) {
                            this._dynamicContext = Object.create(this.viewParent);
                            this._dynamicContext.form = this;
                        }
                        return [4 /*yield*/, this.dynamicComponentProvider.getComponentFactoryRef('app-form-dynamic-' + this.widgetId, fieldTemplate, {
                                noCache: true,
                                transpile: true
                            })];
                    case 1:
                        componentFactoryRef = _a.sent();
                        component = this.dynamicFormRef.createComponent(componentFactoryRef, 0, this.inj);
                        extendProto(component.instance, this._dynamicContext);
                        $gridLayout[0].appendChild(component.location.nativeElement);
                        this.setFormData(this.formdata);
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(FormComponent.prototype, "mode", {
        get: function () {
            return this.operationType || this.findOperationType();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormComponent.prototype, "dirty", {
        get: function () {
            return this.ngform && this.ngform.dirty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormComponent.prototype, "invalid", {
        get: function () {
            return this.ngform && this.ngform.invalid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormComponent.prototype, "touched", {
        get: function () {
            return this.ngform && this.ngform.touched;
        },
        enumerable: true,
        configurable: true
    });
    FormComponent.prototype.invokeActionEvent = function ($event, expression) {
        var fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, { $event: $event }));
    };
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
    FormComponent.ctorParameters = function () { return [
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
    ]; };
    FormComponent.propDecorators = {
        dynamicFormRef: [{ type: ViewChild, args: ['dynamicForm', { read: ViewContainerRef },] }],
        messageRef: [{ type: ViewChild, args: [MessageComponent,] }],
        componentRefs: [{ type: ContentChildren, args: [WidgetRef, { descendants: true },] }],
        action: [{ type: HostBinding, args: ['action',] }],
        submit: [{ type: HostListener, args: ['submit', ['$event'],] }],
        onReset: [{ type: HostListener, args: ['reset',] }]
    };
    return FormComponent;
}(StylableComponent));
export { FormComponent };
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Zvcm0vZm9ybS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFhLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBb0IsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pNLE9BQU8sRUFBRSxXQUFXLEVBQWEsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RCxPQUFPLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEssT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbkYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBSXZELElBQU0sYUFBYSxHQUFH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QUFDLFFBQVE7eUJBRXBCLFlBQVksU0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7MEJBSWpDLFlBQVksU0FBQyxPQUFPOztJQXlsQnpCLG9CQUFDO0NBQUEsQUFqdEJELENBT21DLGlCQUFpQixHQTBzQm5EO1NBMXNCWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDb21wb25lbnQsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIEluamVjdG9yLCBPbkRlc3Ryb3ksIFNraXBTZWxmLCBPcHRpb25hbCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmLCBDb250ZW50Q2hpbGRyZW4sIEFmdGVyQ29udGVudEluaXQsIE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybUJ1aWxkZXIsIEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRGaWxlcywgcmVtb3ZlQ2xhc3MsIEFwcCwgJHBhcnNlRXZlbnQsIGRlYm91bmNlLCBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXIsIGV4dGVuZFByb3RvLCBEYXRhU291cmNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFdpZGdldFJlZiB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyRm9ybVByb3BzIH0gZnJvbSAnLi9mb3JtLnByb3BzJztcbmltcG9ydCB7IGdldEZpZWxkTGF5b3V0Q29uZmlnLCBwYXJzZVZhbHVlQnlUeXBlIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5pbXBvcnQgeyBwZXJmb3JtRGF0YU9wZXJhdGlvbiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IE1lc3NhZ2VDb21wb25lbnQgfSBmcm9tICcuLi9tZXNzYWdlL21lc3NhZ2UuY29tcG9uZW50JztcbmltcG9ydCB7IExpc3RDb21wb25lbnQgfSBmcm9tICcuLi9saXN0L2xpc3QuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1mb3JtJywgaG9zdENsYXNzOiAncGFuZWwgYXBwLXBhbmVsIGFwcC1mb3JtJ307XG5jb25zdCBMT0dJTl9GT1JNX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tZm9ybScsIGhvc3RDbGFzczogJ2FwcC1mb3JtIGFwcC1sb2dpbi1mb3JtJ307XG5jb25zdCBMSVZFX0ZPUk1fQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1saXZlZm9ybScsIGhvc3RDbGFzczogJ3BhbmVsIGFwcC1wYW5lbCBhcHAtbGl2ZWZvcm0gbGl2ZWZvcm0taW5saW5lJ307XG5jb25zdCBMSVZFX0ZJTFRFUl9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWxpdmVmaWx0ZXInLCBob3N0Q2xhc3M6ICdwYW5lbCBhcHAtcGFuZWwgYXBwLWxpdmVmaWx0ZXIgY2xlYXJmaXggbGl2ZWZvcm0taW5saW5lJ307XG5cbmNvbnN0IGdldFdpZGdldENvbmZpZyA9IChpc0xpdmVGb3JtLCBpc0xpdmVGaWx0ZXIsIHJvbGUpID0+IHtcbiAgICBsZXQgY29uZmlnID0gV0lER0VUX0NPTkZJRztcbiAgICBpZiAoaXNMaXZlRm9ybSAhPT0gbnVsbCkge1xuICAgICAgICBjb25maWcgPSBMSVZFX0ZPUk1fQ09ORklHO1xuICAgIH0gZWxzZSBpZiAoaXNMaXZlRmlsdGVyICE9PSBudWxsKSB7XG4gICAgICAgIGNvbmZpZyA9IExJVkVfRklMVEVSX0NPTkZJRztcbiAgICB9IGVsc2UgaWYgKHJvbGUgPT09ICdhcHAtbG9naW4nKSB7XG4gICAgICAgIGNvbmZpZyA9IExPR0lOX0ZPUk1fQ09ORklHO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnO1xufTtcblxuLy8gR2VuZXJhdGUgdGhlIGZvcm0gZmllbGQgd2l0aCBnaXZlbiBmaWVsZCBkZWZpbml0aW9uLiBBZGQgYSBncmlkIGNvbHVtbiB3cmFwcGVyIGFyb3VuZCB0aGUgZm9ybSBmaWVsZC5cbmNvbnN0IHNldE1hcmt1cEZvckZvcm1GaWVsZCA9IChmaWVsZCwgY29sdW1uV2lkdGgpID0+ICB7XG4gICAgbGV0IHByb3BzVG1wbCA9ICcnO1xuICAgIF8uZm9yRWFjaChmaWVsZCwgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgcHJvcHNUbXBsID0gYCR7cHJvcHNUbXBsfSAke2tleX09XCIke3ZhbHVlfVwiYDtcbiAgICB9KTtcbiAgICByZXR1cm4gYDx3bS1ncmlkY29sdW1uIGNvbHVtbndpZHRoPVwiJHtjb2x1bW5XaWR0aH1cIj5cbiAgICAgICAgICAgICAgICAgIDx3bS1mb3JtLWZpZWxkICR7cHJvcHNUbXBsfT48L3dtLWZvcm0tZmllbGQ+XG4gICAgICAgICAgICA8L3dtLWdyaWRjb2x1bW4+YDtcbn07XG5cbi8vIEZ1bmN0aW9uIHRvIGZpbmQgb3V0IHRoZSBmaXJzdCBpbnZhbGlkIGVsZW1lbnQgaW4gZm9ybVxuY29uc3QgZmluZEludmFsaWRFbGVtZW50ID0gKCRmb3JtRWxlLCBuZ0Zvcm0pID0+IHtcbiAgICBjb25zdCAkZWxlID0gJGZvcm1FbGUuZmluZCgnZm9ybS5uZy1pbnZhbGlkOnZpc2libGUsIFtmb3JtQ29udHJvbE5hbWVdLm5nLWludmFsaWQ6dmlzaWJsZScpLmZpcnN0KCk7XG4gICAgbGV0IGZvcm1PYmogPSBuZ0Zvcm07XG4gICAgLy8gSWYgZWxlbWVudCBpcyBmb3JtLCBmaW5kIG91dCB0aGUgZmlyc3QgaW52YWxpZCBlbGVtZW50IGluIHRoaXMgZm9ybVxuICAgIGlmICgkZWxlLmlzKCdmb3JtJykpIHtcbiAgICAgICAgZm9ybU9iaiA9IG5nRm9ybSAmJiBuZ0Zvcm0uY29udHJvbHNbJGVsZS5hdHRyKCdmb3JtQ29udHJvbE5hbWUnKSB8fCAkZWxlLmF0dHIoJ25hbWUnKV07XG4gICAgICAgIGlmIChmb3JtT2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluZEludmFsaWRFbGVtZW50KCRlbGUsIGZvcm1PYmopO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIG5nRm9ybTogZm9ybU9iaixcbiAgICAgICAgJGVsZTogJGVsZVxuICAgIH07XG59O1xuXG5jb25zdCBzZXRUb3VjaGVkU3RhdGUgPSBuZ0Zvcm0gPT4ge1xuICAgIGlmIChuZ0Zvcm0udmFsaWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobmdGb3JtLmNvbnRyb2xzKSB7XG4gICAgICAgIF8uZm9yRWFjaChuZ0Zvcm0uY29udHJvbHMsIGN0cmwgPT4ge1xuICAgICAgICAgICAgc2V0VG91Y2hlZFN0YXRlKGN0cmwpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuZ0Zvcm0ubWFya0FzVG91Y2hlZCgpO1xuICAgIH1cbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZm9ybVt3bUZvcm1dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZm9ybS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihGb3JtQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRm9ybUNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgICBzdGF0aWMgIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyRm9ybVByb3BzKCk7XG4gICAgQFZpZXdDaGlsZCgnZHluYW1pY0Zvcm0nLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGR5bmFtaWNGb3JtUmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICAgIEBWaWV3Q2hpbGQoTWVzc2FnZUNvbXBvbmVudCkgbWVzc2FnZVJlZjtcbiAgICAvLyB0aGlzIGlzIHRoZSByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCByZWZzIGluc2lkZSB0aGUgZm9ybS1ncm91cFxuICAgIEBDb250ZW50Q2hpbGRyZW4oV2lkZ2V0UmVmLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBjb21wb25lbnRSZWZzO1xuXG4gICAgYXV0b3VwZGF0ZTtcbiAgICBwdWJsaWMgZm9ybWxheW91dDogYW55O1xuICAgIHB1YmxpYyBpc0RhdGFTb3VyY2VVcGRhdGVkOiBib29sZWFuO1xuICAgIGNhcHRpb25BbGlnbkNsYXNzOiBzdHJpbmc7XG4gICAgdmFsaWRhdGlvbnR5cGU6IHN0cmluZztcbiAgICBjYXB0aW9uYWxpZ246IHN0cmluZztcbiAgICBjYXB0aW9ucG9zaXRpb246IHN0cmluZztcbiAgICBjYXB0aW9uc2l6ZTtcbiAgICBjb2xsYXBzaWJsZTogYm9vbGVhbjtcbiAgICBleHBhbmRlZDogYm9vbGVhbjtcbiAgICBlbFNjb3BlO1xuICAgIF93aWRnZXRDbGFzcyA9ICcnO1xuICAgIGNhcHRpb253aWR0aDogc3RyaW5nO1xuICAgIF9jYXB0aW9uQ2xhc3MgPSAnJztcbiAgICBuZ2Zvcm06IEZvcm1Hcm91cDtcbiAgICBmb3JtRmllbGRzID0gW107XG4gICAgZm9ybWZpZWxkcyA9IHt9O1xuICAgIGZvcm1XaWRnZXRzID0ge307XG4gICAgZmlsdGVyV2lkZ2V0cyA9IHt9O1xuICAgIGJ1dHRvbkFycmF5ID0gW107XG4gICAgZGF0YW91dHB1dCA9IHt9O1xuICAgIGRhdGFzb3VyY2U7XG4gICAgZm9ybWRhdGFzb3VyY2U7XG4gICAgZm9ybWRhdGEgPSB7fTtcbiAgICBpc1NlbGVjdGVkO1xuICAgIHByZXZEYXRhVmFsdWVzO1xuICAgIHByZXZEYXRhT2JqZWN0O1xuICAgIHByZXZmb3JtRmllbGRzO1xuICAgIHN0YXR1c01lc3NhZ2UgPSB7XG4gICAgICAgIGNhcHRpb246ICcnLFxuICAgICAgICB0eXBlOiAnJ1xuICAgIH07XG4gICAgbWVzc2FnZWxheW91dDtcbiAgICBtZXRhZGF0YTtcbiAgICBlcnJvcm1lc3NhZ2U7XG4gICAgcHJpbWFyeUtleSA9IFtdO1xuICAgIHBvc3RtZXNzYWdlO1xuICAgIF9saXZlVGFibGVQYXJlbnQ7XG4gICAgdXBkYXRlTW9kZTtcbiAgICBuYW1lO1xuICAgIC8vIExpdmUgRm9ybSBNZXRob2RzXG4gICAgY2xlYXJEYXRhOiBGdW5jdGlvbjtcbiAgICBlZGl0OiBGdW5jdGlvbjtcbiAgICBuZXc6IEZ1bmN0aW9uO1xuICAgIGNhbmNlbDogRnVuY3Rpb247XG4gICAgZGVsZXRlOiBGdW5jdGlvbjtcbiAgICBzYXZlOiBGdW5jdGlvbjtcbiAgICBzYXZlQW5kTmV3OiBGdW5jdGlvbjtcbiAgICBzYXZlQW5kVmlldzogRnVuY3Rpb247XG4gICAgc2V0UHJpbWFyeUtleTogKCkgPT4ge307XG4gICAgZGlhbG9nSWQ6IHN0cmluZztcbiAgICAvLyBMaXZlIEZpbHRlclxuICAgIGVuYWJsZWVtcHR5ZmlsdGVyO1xuICAgIHBhZ2VzaXplO1xuICAgIHJlc3VsdDtcbiAgICBwYWdpbmF0aW9uO1xuICAgIGNsZWFyRmlsdGVyOiBGdW5jdGlvbjtcbiAgICBhcHBseUZpbHRlcjogRnVuY3Rpb247XG4gICAgZmlsdGVyOiBGdW5jdGlvbjtcbiAgICBmaWx0ZXJPbkRlZmF1bHQ6IEZ1bmN0aW9uO1xuICAgIG9uTWF4RGVmYXVsdFZhbHVlQ2hhbmdlOiBGdW5jdGlvbjtcblxuICAgIHByaXZhdGUgX2RlYm91bmNlZFVwZGF0ZUZpZWxkU291cmNlOiBGdW5jdGlvbiA9IF8uZGVib3VuY2UodGhpcy51cGRhdGVGaWVsZFNvdXJjZSwgMzUwKTtcbiAgICBwcml2YXRlIG9wZXJhdGlvblR5cGU7XG4gICAgcHJpdmF0ZSBfaXNMYXlvdXREaWFsb2c7XG4gICAgcHJpdmF0ZSBfZHluYW1pY0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBfaXNHcmlkTGF5b3V0UHJlc2VudDtcbiAgICBwcml2YXRlIHZhbGlkYXRpb25NZXNzYWdlcyA9IFtdO1xuICAgIHByaXZhdGUgZm9ybUdyb3VwTmFtZTtcblxuICAgIHByaXZhdGUgX2RlYm91bmNlZFN1Ym1pdEZvcm0gPSBkZWJvdW5jZSgoJGV2ZW50KSA9PiB7XG4gICAgICAgIC8vIGNhbGxpbmcgc3VibWl0IGV2ZW50IGluIG5nWm9uZSBhcyBjaGFuZ2UgZGV0ZWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgcG9zdCB0aGUgc3VibWl0IGNhbGxiYWNrIGFuZCBhY3Rpb25zIGxpa2Ugbm90aWZpY2F0aW9uIGFyZSBub3Qgc2hvd25cbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3VibWl0Rm9ybSgkZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICB9LCAyNTApO1xuXG4gICAgc2V0IGlzTGF5b3V0RGlhbG9nKG52KSB7XG4gICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAncGFuZWwgYXBwLXBhbmVsIGxpdmVmb3JtLWlubGluZScpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lzTGF5b3V0RGlhbG9nID0gbnY7XG4gICAgfVxuXG4gICAgZ2V0IGlzTGF5b3V0RGlhbG9nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNMYXlvdXREaWFsb2c7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaXNVcGRhdGVNb2RlO1xuICAgIHNldCBpc1VwZGF0ZU1vZGUobnYpIHtcbiAgICAgICAgdGhpcy5faXNVcGRhdGVNb2RlID0gbnY7XG4gICAgICAgIHRoaXMuZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGZpZWxkLnNldFJlYWRPbmx5U3RhdGUobnYpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXQgaXNVcGRhdGVNb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNVcGRhdGVNb2RlO1xuICAgIH1cblxuICAgIEBIb3N0QmluZGluZygnYWN0aW9uJykgYWN0aW9uOiBzdHJpbmc7XG5cbiAgICBASG9zdExpc3RlbmVyKCdzdWJtaXQnLCBbJyRldmVudCddKSBzdWJtaXQoJGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2RlYm91bmNlZFN1Ym1pdEZvcm0oJGV2ZW50KTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdyZXNldCcpIG9uUmVzZXQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSBmYjogRm9ybUJ1aWxkZXIsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgZHluYW1pY0NvbXBvbmVudFByb3ZpZGVyOiBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmUsXG4gICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyBwYXJlbnRMaXN0OiBMaXN0Q29tcG9uZW50LFxuICAgICAgICBAU2tpcFNlbGYoKSBAT3B0aW9uYWwoKSBwdWJsaWMgcGFyZW50Rm9ybTogRm9ybUNvbXBvbmVudCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnYmVmb3Jlc3VibWl0LmV2ZW50JykgcHVibGljIG9uQmVmb3JlU3VibWl0RXZ0LFxuICAgICAgICBAQXR0cmlidXRlKCdzdWJtaXQuZXZlbnQnKSBwdWJsaWMgb25TdWJtaXRFdnQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2JlZm9yZXJlbmRlci5ldmVudCcpIHB1YmxpYyBvbkJlZm9yZVJlbmRlckV2dCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJykgcHVibGljIGJpbmRkYXRhc2V0LFxuICAgICAgICBAQXR0cmlidXRlKCdmb3JtZGF0YS5iaW5kJykgcHJpdmF0ZSBiaW5kZm9ybWRhdGEsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3dtTGl2ZUZvcm0nKSBpc0xpdmVGb3JtLFxuICAgICAgICBAQXR0cmlidXRlKCd3bUxpdmVGaWx0ZXInKSBpc0xpdmVGaWx0ZXIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3JvbGUnKSByb2xlLFxuICAgICAgICBAQXR0cmlidXRlKCdrZXknKSBrZXksXG4gICAgICAgIEBBdHRyaWJ1dGUoJ25hbWUnKSBuYW1lXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgZ2V0V2lkZ2V0Q29uZmlnKGlzTGl2ZUZvcm0sIGlzTGl2ZUZpbHRlciwgcm9sZSkpO1xuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuaXNVcGRhdGVNb2RlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kaWFsb2dJZCA9IHRoaXMubmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RpYWxvZ0lkJyk7XG4gICAgICAgIHRoaXMubmdmb3JtID0gZmIuZ3JvdXAoe30pO1xuICAgICAgICB0aGlzLmFkZElubmVyTmdGb3JtVG9Gb3JtKGtleSB8fCBuYW1lKTtcblxuICAgICAgICAvLyBPbiB2YWx1ZSBjaGFuZ2UgaW4gZm9ybSwgdXBkYXRlIHRoZSBkYXRhb3V0cHV0XG4gICAgICAgIGNvbnN0IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24gPSAgdGhpcy5uZ2Zvcm0udmFsdWVDaGFuZ2VzXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMudXBkYXRlRGF0YU91dHB1dC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBvblZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICB0aGlzLmVsU2NvcGUgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRzVG9Db250ZXh0KHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29tcG9uZW50UmVmcy5mb3JFYWNoKGNvbXBvbmVudFJlZiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudFJlZi5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHdpZGdldHMgaW5zaWRlIGZvcm0gd2l0aCBmb3JtV2lkZ2V0c1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1XaWRnZXRzW2NvbXBvbmVudFJlZi5uYW1lXSA9IGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBmaW5kT3BlcmF0aW9uVHlwZSgpIHt9XG5cbiAgICBwcml2YXRlIGFkZElubmVyTmdGb3JtVG9Gb3JtKGJpbmRpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50Rm9ybSAmJiB0aGlzLnBhcmVudEZvcm0ubmdmb3JtKSB7XG4gICAgICAgICAgICBsZXQgY291bnRlciA9IDE7XG4gICAgICAgICAgICBsZXQgaW5uZXJCaW5kaW5nID0gYmluZGluZztcbiAgICAgICAgICAgIC8vIElubmVyIGZvcm1zIG1heSBoYXZlIHNhbWUgbmFtZXMuIElmIHNhbWUgbmFtZSBpcyBwcmVzZW50LCBhcHBlbmQgdW5xaXVlIGlkZW50aWZpZXJcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLnBhcmVudEZvcm0ubmdmb3JtLmNvbnRyb2xzLmhhc093blByb3BlcnR5KGlubmVyQmluZGluZykpIHtcbiAgICAgICAgICAgICAgICBpbm5lckJpbmRpbmcgPSBgJHtiaW5kaW5nfV8ke2NvdW50ZXJ9YDtcbiAgICAgICAgICAgICAgICBjb3VudGVyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmZvcm1Hcm91cE5hbWUgPSBpbm5lckJpbmRpbmc7XG4gICAgICAgICAgICAvLyBJZiBwYXJlbnQgZm9ybSBpcyBwcmVzZW50LCBhZGQgdGhlIGN1cnJlbnQgZm9ybSBhcyBhcyBmb3JtR3JvdXAgZm9yIHBhcmVudCBmb3JtXG4gICAgICAgICAgICB0aGlzLnBhcmVudEZvcm0ubmdmb3JtLmFkZENvbnRyb2woaW5uZXJCaW5kaW5nLCB0aGlzLm5nZm9ybSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFeHBvc2UgdGhlIGV2ZW50cyBvbiBjb250ZXh0IHNvIHRoYXQgdGhleSBjYW4gYmUgYWNjZXNzZWQgYnkgZm9ybSBhY3Rpb25zXG4gICAgcHJpdmF0ZSBhZGRFdmVudHNUb0NvbnRleHQoY29udGV4dCkge1xuICAgICAgICBjb250ZXh0LmNhbmNlbCA9ICgpID0+IHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIGNvbnRleHQucmVzZXQgPSAoKSA9PiB0aGlzLnJlc2V0KCk7XG4gICAgICAgIGNvbnRleHQuc2F2ZSA9IGV2dCA9PiB0aGlzLnNhdmUoZXZ0KTtcbiAgICAgICAgY29udGV4dC5zYXZlQW5kTmV3ID0gKCkgPT4gdGhpcy5zYXZlQW5kTmV3KCk7XG4gICAgICAgIGNvbnRleHQuc2F2ZUFuZFZpZXcgPSAoKSA9PiB0aGlzLnNhdmVBbmRWaWV3KCk7XG4gICAgICAgIGNvbnRleHQuZGVsZXRlID0gKCkgPT4gdGhpcy5kZWxldGUoKTtcbiAgICAgICAgY29udGV4dC5uZXcgPSAoKSA9PiB0aGlzLm5ldygpO1xuICAgICAgICBjb250ZXh0LmVkaXQgPSAoKSA9PiB0aGlzLmVkaXQoKTtcbiAgICAgICAgY29udGV4dC5oaWdobGlnaHRJbnZhbGlkRmllbGRzID0gKCkgPT4gdGhpcy5oaWdobGlnaHRJbnZhbGlkRmllbGRzKCk7XG4gICAgICAgIGNvbnRleHQuZmlsdGVyID0gKCkgPT4gdGhpcy5maWx0ZXIoKTtcbiAgICAgICAgY29udGV4dC5jbGVhckZpbHRlciA9ICgpID0+IHRoaXMuY2xlYXJGaWx0ZXIoKTtcbiAgICAgICAgY29udGV4dC5zdWJtaXQgPSBldnQgPT4gdGhpcy5zdWJtaXQoZXZ0KTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBnZXRzIGFsbCB0aGUgaW5uZXIgZm9ybXMgYW5kIHZhbGlkYXRlcyBlYWNoIGZvcm0uXG4gICAgcHJpdmF0ZSBzZXRWYWxpZGF0aW9uT25Jbm5lckZvcm1zKHZhbGlkYXRlVG91Y2gpIHtcbiAgICAgICAgY29uc3QgZm9ybUVsZSA9IHRoaXMuZ2V0TmF0aXZlRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBmb3JtT2JqcyA9IGZvcm1FbGUucXVlcnlTZWxlY3RvckFsbCgnLmFwcC1mb3JtJyk7XG4gICAgICAgIGNvbnN0IHZhbGlkYXRpb25Nc2dzID0gW107XG4gICAgICAgIF8uZm9yRWFjaChmb3JtT2JqcywgZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmb3JtSW5zdGFuY2UgPSAoZSBhcyBhbnkpLndpZGdldDtcbiAgICAgICAgICAgIC8vIGRpZmZlcmVudGlhdGluZyB0aGUgdmFsaWRhdGlvbk1lc3NhZ2VzIHByZWZpeCBiYXNlZCBvbiB0aGUgZm9ybUdyb3VwTmFtZVxuICAgICAgICAgICAgLy8gYXMgdGhlIGZvcm1OYW1lJ3MgYXJlIHNhbWUgd2hlbiBmb3JtcyBhcmUgaW4gbGlzdFxuICAgICAgICAgICAgbGV0IGZvcm1OYW1lID0gXy5nZXQoZm9ybUluc3RhbmNlLCAnZm9ybUdyb3VwTmFtZScpIHx8IGZvcm1JbnN0YW5jZS5uYW1lO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBmb3JtSW5zdGFuY2U7XG4gICAgICAgICAgICB3aGlsZSAoXy5nZXQoY3VycmVudCwgJ3BhcmVudEZvcm0nKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudE5hbWUgPSBjdXJyZW50LnBhcmVudEZvcm0uZm9ybUdyb3VwTmFtZSB8fCBjdXJyZW50LnBhcmVudEZvcm0ubmFtZTtcbiAgICAgICAgICAgICAgICBmb3JtTmFtZSA9IHBhcmVudE5hbWUgKyAnLicgKyBmb3JtTmFtZTtcbiAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRGb3JtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRWYWxpZGF0aW9uT25GaWVsZHMoZm9ybUluc3RhbmNlLCBmb3JtTmFtZSwgdmFsaWRhdGVUb3VjaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHNldHMgdmFsaWRhdGlvbiBvbiBmb3JtRmllbGRzLlxuICAgICAqIEFwcGxpZXMgdG8gaW5uZXJmb3JtIGFuZCBhbHNvIHNldHMgaW5uZXJmb3JtIHZhbGlkYXRpb24gb24gcGFyZW50IGZvcm0uXG4gICAgICogQHBhcmFtIHByZWZpeCBjb250YWlucyB0aGUgZm9ybSBuYW1lLCB3aGljaCBhbHNvIGluY2x1ZGVzIGl0cyBwYXJlbnRzIGZvcm0gbmFtZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsaWRhdGVUb3VjaFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0VmFsaWRhdGlvbk9uRmllbGRzKGZvcm06IEZvcm1Db21wb25lbnQsIHByZWZpeDogc3RyaW5nLCB2YWxpZGF0ZVRvdWNoPzogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBjb250cm9scyA9IGZvcm0ubmdmb3JtLmNvbnRyb2xzO1xuICAgICAgICBjb25zdCBmb3JtRmllbGRzID0gZm9ybS5mb3JtRmllbGRzO1xuICAgICAgICBpZiAoIWZvcm1GaWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBfLmZvckVhY2goY29udHJvbHMsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWVsZCA9IGZvcm1GaWVsZHMuZmluZChlID0+IGUua2V5ID09PSBrKTtcbiAgICAgICAgICAgIGlmICghZmllbGQgfHwgKHZhbGlkYXRlVG91Y2ggJiYgIXYudG91Y2hlZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpbnZva2luZyB0aGUgcHJlcGFyZVZhbGlkYXRpb24gb24gYm90aCBwYXJlbnQgZm9ybSBhbmQgY3VycmVudCBmb3JtLlxuICAgICAgICAgICAgdGhpcy5wcmVwYXJlVmFsaWRhdGlvbk9iaih2LCBrLCBmaWVsZCwgcHJlZml4KTtcbiAgICAgICAgICAgIHRoaXMucHJlcGFyZVZhbGlkYXRpb25PYmouY2FsbChmb3JtLCB2LCBrLCBmaWVsZCwgcHJlZml4KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQXNzaWducyAvIHVwZGF0ZXMgdmFsaWRhdGlvbk1lc3NhZ2VzIGJhc2VkIG9uIGFuZ3VsYXIgZXJyb3JzIG9uIGZpZWxkXG4gICAgcHJpdmF0ZSBwcmVwYXJlVmFsaWRhdGlvbk9iaih2LCBrLCBmaWVsZCwgcHJlZml4KSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy52YWxpZGF0aW9uTWVzc2FnZXMuZmluZEluZGV4KGUgPT4gKGUuZmllbGQgPT09IGsgJiYgZS5mdWxseVF1YWxpZmllZEZvcm1OYW1lID09PSBwcmVmaXgpKTtcbiAgICAgICAgaWYgKHYuaW52YWxpZCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIGZpZWxkIGNvbnRhaW5zIHRoZSBmaWVsZE5hbWVcbiAgICAgICAgICAgICAgICAgKiB2YWx1ZSBjb250YWlucyB0aGUgZmllbGQgdmFsdWVcbiAgICAgICAgICAgICAgICAgKiBlcnJvclR5cGUgY29udGFpbnMgdGhlIGxpc3Qgb2YgZXJyb3JzXG4gICAgICAgICAgICAgICAgICogbWVzc2FnZSBjb250YWlucyB0aGUgdmFsaWRhdGlvbiBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICogZ2V0RWxlbWVudCByZXR1cm5zIHRoZSBlbGVtZW50IGhhdmluZyBmb2N1cy10YXJnZXRcbiAgICAgICAgICAgICAgICAgKiBmb3JtTmFtZSByZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBmb3JtXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uTWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkOiBrLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZmllbGQudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogXy5rZXlzKHYuZXJyb3JzKSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZmllbGQudmFsaWRhdGlvbm1lc3NhZ2UgfHwgJycsXG4gICAgICAgICAgICAgICAgICAgIGdldEVsZW1lbnQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZC4kZWxlbWVudC5maW5kKCdbZm9jdXMtdGFyZ2V0XScpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmb3JtTmFtZTogXy5sYXN0KHByZWZpeC5zcGxpdCgnLicpKSxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWRGb3JtTmFtZTogcHJlZml4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvbk1lc3NhZ2VzW2luZGV4XS52YWx1ZSA9IGZpZWxkLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvbk1lc3NhZ2VzW2luZGV4XS5lcnJvclR5cGUgPSBfLmtleXModi5lcnJvcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHYudmFsaWQgJiYgaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9uTWVzc2FnZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgd2lsbCByZXR1cm4gYSBvYmplY3QgY29udGFpbmluZyB0aGUgZXJyb3IgZGV0YWlscyBmcm9tIHRoZSBsaXN0IG9mIGZvcm1GaWVsZHMgdGhhdCBhcmUgaW52YWxpZFxuICAgIHByaXZhdGUgc2V0VmFsaWRhdGlvbk1zZ3ModmFsaWRhdGVUb3VjaD86IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmZvcm1GaWVsZHMubGVuZ3RoICYmIF8uaXNFbXB0eSh0aGlzLm5nZm9ybS5jb250cm9scykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFZhbGlkYXRpb25PbkZpZWxkcyh0aGlzLCB0aGlzLm5hbWUsIHZhbGlkYXRlVG91Y2gpO1xuICAgICAgICB0aGlzLnNldFZhbGlkYXRpb25PbklubmVyRm9ybXModmFsaWRhdGVUb3VjaCk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdzdWJtaXQnKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUZpZWxkU291cmNlKCkge1xuICAgICAgICBpZiAodGhpcy5mb3JtZGF0YXNvdXJjZSAmJiB0aGlzLmZvcm1kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZm9ybWRhdGFzb3VyY2UgJiYgIXRoaXMuZm9ybWRhdGFzb3VyY2UudHdvV2F5QmluZGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9ybUZpZWxkcy5mb3JFYWNoKGZvcm1GaWVsZCA9PiB7XG4gICAgICAgICAgICBmb3JtRmllbGQuc2V0Rm9ybVdpZGdldCgnZGF0YXZhbHVlc291cmNlJywgdGhpcy5mb3JtZGF0YXNvdXJjZSk7XG4gICAgICAgICAgICBmb3JtRmllbGQuc2V0Rm9ybVdpZGdldCgnYmluZGRhdGF2YWx1ZScsIGAke3RoaXMuYmluZGZvcm1kYXRhfS4ke2Zvcm1GaWVsZC5rZXl9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGxvb3BzIHRocm91Z2ggdGhlIGZvcm0gZmllbGRzIGFuZCBoaWdobGlnaHRzIHRoZSBpbnZhbGlkIGZpZWxkcyBieSBzZXR0aW5nIHN0YXRlIHRvIHRvdWNoZWRcbiAgICBoaWdobGlnaHRJbnZhbGlkRmllbGRzKCkge1xuICAgICAgICBzZXRUb3VjaGVkU3RhdGUodGhpcy5uZ2Zvcm0pO1xuICAgIH1cblxuICAgIC8vIERpc2FibGUgdGhlIGZvcm0gc3VibWl0IGlmIGZvcm0gaXMgaW4gaW52YWxpZCBzdGF0ZS4gSGlnaGxpZ2h0IGFsbCB0aGUgaW52YWxpZCBmaWVsZHMgaWYgdmFsaWRhdGlvbiB0eXBlIGlzIGRlZmF1bHRcbiAgICB2YWxpZGF0ZUZpZWxkc09uU3VibWl0KCkge1xuICAgICAgICB0aGlzLnNldFZhbGlkYXRpb25Nc2dzKCk7XG4gICAgICAgIC8vIERpc2FibGUgdGhlIGZvcm0gc3VibWl0IGlmIGZvcm0gaXMgaW4gaW52YWxpZCBzdGF0ZS4gRm9yIGRlbGV0ZSBvcGVyYXRpb24sIGRvIG5vdCBjaGVjayB0aGUgdmFsaWRhdGlvbi5cbiAgICAgICAgaWYgKHRoaXMub3BlcmF0aW9uVHlwZSAhPT0gJ2RlbGV0ZScgJiYgKHRoaXMudmFsaWRhdGlvbnR5cGUgPT09ICdodG1sJyB8fCB0aGlzLnZhbGlkYXRpb250eXBlID09PSAnZGVmYXVsdCcpXG4gICAgICAgICAgICAgICAgJiYgdGhpcy5uZ2Zvcm0gJiYgdGhpcy5uZ2Zvcm0uaW52YWxpZCkge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5uZ2Zvcm0uaW52YWxpZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRpb250eXBlID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRJbnZhbGlkRmllbGRzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGludmFsaWQgdW50b2NoZWQgZWxlbWVudCBhbmQgc2V0IGl0IHRvIHRvdWNoZWQuXG4gICAgICAgICAgICAgICAgLy8gU2FmYXJpIGRvZXMgbm90IGZvcm0gdmFsaWRhdGlvbnMuIHRoaXMgd2lsbCBlbnN1cmUgdGhhdCBlcnJvciBpcyBzaG93biBmb3IgdXNlclxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZUZvcm0gPSBmaW5kSW52YWxpZEVsZW1lbnQodGhpcy4kZWxlbWVudCwgdGhpcy5uZ2Zvcm0pO1xuICAgICAgICAgICAgICAgIGNvbnN0ICRpbnZhbGlkRm9ybSA9IGVsZUZvcm0ubmdGb3JtO1xuICAgICAgICAgICAgICAgIGxldCAkaW52YWxpZEVsZSAgPSBlbGVGb3JtLiRlbGU7XG4gICAgICAgICAgICAgICAgJGludmFsaWRFbGUgPSAkaW52YWxpZEVsZS5wYXJlbnQoKS5maW5kKCdbZm9jdXMtdGFyZ2V0XScpO1xuICAgICAgICAgICAgICAgIGlmICgkaW52YWxpZEVsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb24gc2F2ZSBjbGljayBpbiBwYWdlIGxheW91dCBsaXZlZm9ybSwgZm9jdXMgb2YgYXV0b2NvbXBsZXRlIHdpZGdldCBvcGVucyBmdWxsLXNjcmVlbiBzZWFyY2guXG4gICAgICAgICAgICAgICAgICAgIGlmICghJGludmFsaWRFbGUuaGFzQ2xhc3MoJ2FwcC1zZWFyY2gtaW5wdXQnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGludmFsaWRFbGUuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZ0VsZSA9ICRpbnZhbGlkRm9ybSAmJiAkaW52YWxpZEZvcm0uY29udHJvbHNbJGludmFsaWRFbGUuYXR0cignZm9ybUNvbnRyb2xOYW1lJykgfHwgJGludmFsaWRFbGUuYXR0cignbmFtZScpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5nRWxlICYmIG5nRWxlLm1hcmtBc1RvdWNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nRWxlLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb25hbGlnbic6XG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0aW9uQWxpZ25DbGFzcyA9ICdhbGlnbi0nICsgbnY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYXB0aW9ucG9zaXRpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGF5b3V0Q29uZmlnKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYXB0aW9ud2lkdGgnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TGF5b3V0Q29uZmlnKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYXB0aW9uc2l6ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0aW9uc2l6ZSA9IG52O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm92YWxpZGF0ZSc6XG4gICAgICAgICAgICAgICAgLy8gIFNldCB2YWxpZGF0aW9uIHR5cGUgYmFzZWQgb24gdGhlIG5vdmFsaWRhdGUgcHJvcGVydHlcbiAgICAgICAgICAgICAgICB0aGlzLndpZGdldC52YWxpZGF0aW9udHlwZSA9IChudiA9PT0gdHJ1ZSB8fCBudiA9PT0gJ3RydWUnKSA/ICdub25lJyA6ICdkZWZhdWx0JztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Zvcm1kYXRhJzpcbiAgICAgICAgICAgICAgICAvLyBGb3IgbGl2ZWxpc3Qgd2hlbiBtdWx0aXNlbGVjdCBpcyBlbmFibGVkLCBmb3JtZGF0YSB3aWxsIGJlIGFycmF5IG9mIG9iamVjdHMuIEluIHRoaXMgY2FzZSBjb25zaWRlciB0aGUgbGFzdCBvYmplY3QgYXMgZm9ybWRhdGEuXG4gICAgICAgICAgICAgICAgXy5pc0FycmF5KG52KSA/IHRoaXMuc2V0Rm9ybURhdGEoXy5sYXN0KG52KSkgOiB0aGlzLnNldEZvcm1EYXRhKG52KTtcbiAgICAgICAgICAgICAgICAvLyBpZiBkYXRhc2V0IG9uIHRoZSBmb3JtRmllbGRzIGFyZSBub3Qgc2V0IGFzIHRoZSBkYXRhc291cmNlQ2hhbmdlIGlzIHRyaWdnZXJlZCBiZWZvcmUgdGhlIGZvcm1GaWVsZHMgYXJlIHJlZ2lzdGVyZWQuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzRGF0YVNvdXJjZVVwZGF0ZWQgJiYgdGhpcy5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25EYXRhU291cmNlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGVmYXVsdG1vZGUnOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgICAgICAgICBpZiAobnYgJiYgbnYgPT09ICdFZGl0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVNb2RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTW9kZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNVcGRhdGVNb2RlID0gdGhpcy51cGRhdGVNb2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RhdGFzb3VyY2UnOlxuICAgICAgICAgICAgICAgIHRoaXMub25EYXRhU291cmNlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmb3JtZGF0YXNvdXJjZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkZvcm1EYXRhU291cmNlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtZXRhZGF0YSc6XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZUZvcm1GaWVsZHMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBFdmVudCBjYWxsYmFja3Mgb24gc3VjY2Vzcy9lcnJvclxuICAgIG9uUmVzdWx0KGRhdGEsIHN0YXR1cywgZXZlbnQ/KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHskZXZlbnQ6IGV2ZW50LCAkZGF0YTogZGF0YSwgJG9wZXJhdGlvbjogdGhpcy5vcGVyYXRpb25UeXBlfTtcbiAgICAgICAgLy8gd2hldGhlciBzZXJ2aWNlIGNhbGwgc3VjY2VzcyBvciBmYWlsdXJlIGNhbGwgdGhpcyBtZXRob2RcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZXN1bHQnLCBwYXJhbXMpO1xuICAgICAgICBpZiAoc3RhdHVzKSB7XG4gICAgICAgICAgICAvLyBpZiBzZXJ2aWNlIGNhbGwgaXMgc3VjY2VzcyBjYWxsIHRoaXMgbWV0aG9kXG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Y2Nlc3MnLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWYgc2VydmljZSBjYWxsIGZhaWxzIGNhbGwgdGhpcyBtZXRob2RcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZXJyb3InLCBwYXJhbXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGlzcGxheSBvciBoaWRlIHRoZSBpbmxpbmUgbWVzc2FnZS8gdG9hc3RlclxuICAgIHRvZ2dsZU1lc3NhZ2Uoc2hvdzogYm9vbGVhbiwgbXNnPzogc3RyaW5nLCB0eXBlPzogc3RyaW5nLCBoZWFkZXI/OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlO1xuICAgICAgICBpZiAoc2hvdyAmJiBtc2cpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gKHR5cGUgPT09ICdlcnJvcicgJiYgdGhpcy5lcnJvcm1lc3NhZ2UpID8gdGhpcy5lcnJvcm1lc3NhZ2UgOiBtc2c7XG4gICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdlbGF5b3V0ID09PSAnSW5saW5lJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHVzTWVzc2FnZSA9IHsnY2FwdGlvbic6IHRlbXBsYXRlIHx8ICcnLCB0eXBlOiB0eXBlfTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZXNzYWdlUmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVJlZi5zaG93TWVzc2FnZSh0aGlzLnN0YXR1c01lc3NhZ2UuY2FwdGlvbiwgdGhpcy5zdGF0dXNNZXNzYWdlLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAubm90aWZ5QXBwKHRlbXBsYXRlLCB0eXBlLCBoZWFkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXNNZXNzYWdlLmNhcHRpb24gPSAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhpZGUgdGhlIGlubGluZSBtZXNzYWdlLyB0b2FzdGVyXG4gICAgY2xlYXJNZXNzYWdlKCkge1xuICAgICAgICB0aGlzLnRvZ2dsZU1lc3NhZ2UoZmFsc2UpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgY2xhc3NlcyBvbiB0aGUgZm9ybSBiYXNlZCBvbiB0aGUgY2FwdGlvbnBvc2l0aW9uIGFuZCBjYXB0aW9ud2lkdGggcHJvcGVydGllc1xuICAgIHByaXZhdGUgc2V0TGF5b3V0Q29uZmlnKCkge1xuICAgICAgICBsZXQgbGF5b3V0Q29uZmlnO1xuICAgICAgICBsYXlvdXRDb25maWcgPSBnZXRGaWVsZExheW91dENvbmZpZyh0aGlzLmNhcHRpb253aWR0aCwgdGhpcy5jYXB0aW9ucG9zaXRpb24sIF8uZ2V0KHRoaXMuYXBwLnNlbGVjdGVkVmlld1BvcnQsICdvcycpKTtcbiAgICAgICAgdGhpcy5fd2lkZ2V0Q2xhc3MgPSBsYXlvdXRDb25maWcud2lkZ2V0Q2xzO1xuICAgICAgICB0aGlzLl9jYXB0aW9uQ2xhc3MgPSBsYXlvdXRDb25maWcuY2FwdGlvbkNscztcblxuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGb3JtV2lkZ2V0KHdpZGdldCkge1xuICAgICAgICBjb25zdCBuYW1lID0gd2lkZ2V0Lm5hbWUgfHwgd2lkZ2V0LmtleTtcbiAgICAgICAgdGhpcy5mb3JtV2lkZ2V0c1tuYW1lXSA9IHdpZGdldDtcbiAgICB9XG5cbiAgICByZWdpc3RlckZvcm1GaWVsZHMoZm9ybUZpZWxkKSB7XG4gICAgICAgIHRoaXMuZm9ybUZpZWxkcy5wdXNoKGZvcm1GaWVsZCk7XG4gICAgICAgIHRoaXMuZm9ybWZpZWxkc1tmb3JtRmllbGQua2V5XSA9IGZvcm1GaWVsZDtcbiAgICAgICAgdGhpcy5yZWdpc3RlckZvcm1XaWRnZXQoZm9ybUZpZWxkKTtcbiAgICAgICAgdGhpcy5fZGVib3VuY2VkVXBkYXRlRmllbGRTb3VyY2UoKTtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50Rm9ybSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRGb3JtLmZvcm1GaWVsZHMucHVzaChmb3JtRmllbGQpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRGb3JtLmZvcm1maWVsZHNbZm9ybUZpZWxkLmtleV0gPSBmb3JtRmllbGQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlckFjdGlvbnMoZm9ybUFjdGlvbikge1xuICAgICAgICB0aGlzLmJ1dHRvbkFycmF5LnB1c2goZm9ybUFjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBkYXRhb3V0cHV0IHdoZW5ldmVyIHRoZXJlIGlzIGEgY2hhbmdlIGluIGluc2lkZSBmb3JtIHdpZGdldCB2YWx1ZVxuICAgIHVwZGF0ZUZvcm1EYXRhT3V0cHV0KGRhdGFPYmplY3QpIHtcbiAgICAgICAgLy8gU2V0IHRoZSB2YWx1ZXMgb2YgdGhlIHdpZGdldHMgaW5zaWRlIHRoZSBsaXZlIGZvcm0gKG90aGVyIHRoYW4gZm9ybSBmaWVsZHMpIGluIGZvcm0gZGF0YVxuICAgICAgICBfLmZvckVhY2godGhpcy5uZ2Zvcm0udmFsdWUsICh2YWwsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFfLmZpbmQodGhpcy5mb3JtRmllbGRzLCB7a2V5fSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhT2JqZWN0W2tleV0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmRhdGFvdXRwdXQgPSBkYXRhT2JqZWN0O1xuICAgIH1cblxuICAgIC8vIENvbnN0cnVjdCB0aGUgZGF0YSBvYmplY3QgbWVyZ2luZyB0aGUgZm9ybSBmaWVsZHMgYW5kIGN1c3RvbSB3aWRnZXRzIGRhdGFcbiAgICBjb25zdHJ1Y3REYXRhT2JqZWN0KCkge1xuICAgICAgICBjb25zdCBmb3JtRGF0YSAgICAgPSB7fTtcbiAgICAgICAgY29uc3QgZm9ybUZpZWxkcyA9IHRoaXMuZ2V0Rm9ybUZpZWxkcygpO1xuICAgICAgICAvLyBHZXQgYWxsIGZvcm0gZmllbGRzIGFuZCBwcmVwYXJlIGZvcm0gZGF0YSBhcyBrZXkgdmFsdWUgcGFpcnNcbiAgICAgICAgZm9ybUZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgICAgICAgIGxldCBmaWVsZE5hbWUsXG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZTtcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZC5kYXRhdmFsdWUgfHwgZmllbGQuX2NvbnRyb2wudmFsdWU7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gKGZpZWxkVmFsdWUgPT09IG51bGwgfHwgZmllbGRWYWx1ZSA9PT0gJycpID8gdW5kZWZpbmVkIDogZmllbGRWYWx1ZTtcblxuICAgICAgICAgICAgaWYgKGZpZWxkLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBnZXRGaWxlcyh0aGlzLm5hbWUsIGZpZWxkLmtleSArICdfZm9ybVdpZGdldCcsIGZpZWxkLm11bHRpcGxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmllbGROYW1lID0gZmllbGQua2V5IHx8IGZpZWxkLnRhcmdldCB8fCBmaWVsZC5uYW1lO1xuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiB1cGRhdGUgdGhlIGZpZWxkIHdpbGwgYmUgYWxyZWFkeSBwcmVzZW50IGluIGZvcm0gZGF0YVxuICAgICAgICAgICAgXy5zZXQoZm9ybURhdGEsIGZpZWxkTmFtZSwgZmllbGRWYWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZUZvcm1EYXRhT3V0cHV0KGZvcm1EYXRhKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YW91dHB1dDtcbiAgICB9XG5cbiAgICB1cGRhdGVEYXRhT3V0cHV0KCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdERhdGFPYmplY3QoKTtcbiAgICAgICAgaWYgKHRoaXMubmdmb3JtLnRvdWNoZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsaWRhdGlvbk1zZ3ModHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGb3JtRmllbGRzIHdpbGwgY29udGFpbiBhbGwgdGhlIGZpZWxkcyBpbiBwYXJlbnQgYW5kIGlubmVyIGZvcm0gYWxzby5cbiAgICAvLyBUaGlzIHJldHVybnMgdGhlIGZvcm1GaWVsZHMgaW4gdGhlIGZvcm0gYmFzZWQgb24gdGhlIGZvcm0gbmFtZS5cbiAgICBnZXRGb3JtRmllbGRzKCkge1xuICAgICAgICByZXR1cm4gXy5maWx0ZXIodGhpcy5mb3JtRmllbGRzLCBmb3JtRmllbGQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1GaWVsZC5mb3JtLm5hbWUgPT09IHRoaXMubmFtZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0Rm9ybURhdGEoZGF0YSkge1xuICAgICAgICBjb25zdCBmb3JtRmllbGRzID0gdGhpcy5nZXRGb3JtRmllbGRzKCk7XG4gICAgICAgIGZvcm1GaWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBmaWVsZC52YWx1ZSA9ICBfLmdldChkYXRhLCBmaWVsZC5rZXkgfHwgZmllbGQubmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgIH1cblxuICAgIHJlc2V0Rm9ybVN0YXRlKCkge1xuICAgICAgICAvLyBjbGVhcmluZyB0aGUgdmFsaWRhdGlvbk1lc3NhZ2VzIG9uIHJlc2V0LlxuICAgICAgICBpZiAodGhpcy52YWxpZGF0aW9uTWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRpb25NZXNzYWdlcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5uZ2Zvcm0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdmb3JtLm1hcmtBc1VudG91Y2hlZCgpO1xuICAgICAgICAgICAgdGhpcy5uZ2Zvcm0ubWFya0FzUHJpc3RpbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucmVzZXRGb3JtU3RhdGUoKTtcbiAgICAgICAgdGhpcy5mb3JtRmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgZmllbGQudmFsdWUgPSAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY29uc3RydWN0RGF0YU9iamVjdCgpO1xuICAgICAgICB0aGlzLmNsZWFyTWVzc2FnZSgpO1xuICAgIH1cblxuICAgIHN1Ym1pdEZvcm0oJGV2ZW50KSB7XG4gICAgICAgIGxldCBmb3JtRGF0YSwgdGVtcGxhdGUsIHBhcmFtcztcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZTtcbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgZm9ybSBzdWJtaXQgaWYgZm9ybSBpcyBpbiBpbnZhbGlkIHN0YXRlLlxuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZUZpZWxkc09uU3VibWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzZXRGb3JtU3RhdGUoKTtcblxuICAgICAgICBmb3JtRGF0YSA9IGdldENsb25lZE9iamVjdCh0aGlzLmNvbnN0cnVjdERhdGFPYmplY3QoKSk7XG5cbiAgICAgICAgcGFyYW1zID0geyRldmVudCwgJGZvcm1EYXRhOiBmb3JtRGF0YSwgJGRhdGE6IGZvcm1EYXRhfTtcblxuICAgICAgICBpZiAodGhpcy5vbkJlZm9yZVN1Ym1pdEV2dCAmJiAodGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVzdWJtaXQnLCBwYXJhbXMpID09PSBmYWxzZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9uU3VibWl0RXZ0IHx8IGRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIC8vIElmIG9uIHN1Ym1pdCBpcyB0aGVyZSBleGVjdXRlIGl0IGFuZCBpZiBpdCByZXR1cm5zIHRydWUgZG8gc2VydmljZSB2YXJpYWJsZSBpbnZva2UgZWxzZSByZXR1cm5cbiAgICAgICAgICAgIC8vIElmIGl0cyBhIHNlcnZpY2UgdmFyaWFibGUgY2FsbCBzZXRJbnB1dCBhbmQgYXNzaWduIGZvcm0gZGF0YSBhbmQgaW52b2tlIHRoZSBzZXJ2aWNlXG4gICAgICAgICAgICBpZiAoZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHBlcmZvcm1EYXRhT3BlcmF0aW9uKGRhdGFTb3VyY2UsIGZvcm1EYXRhLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25SZXN1bHQoZGF0YSwgdHJ1ZSwgJGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVzc2FnZSh0cnVlLCB0aGlzLnBvc3RtZXNzYWdlLCAnc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzdWJtaXQnLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gdGhpcy5lcnJvcm1lc3NhZ2UgfHwgZXJyb3IuZXJyb3IgfHwgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUmVzdWx0KGVycm9yLCBmYWxzZSwgJGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVzc2FnZSh0cnVlLCB0ZW1wbGF0ZSwgJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3N1Ym1pdCcsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzdWx0KHt9LCB0cnVlLCAkZXZlbnQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc3VibWl0JywgcGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMub25SZXN1bHQoe30sIHRydWUsICRldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gc2hvdy9oaWRlIHRoZSBwYW5lbCBoZWFkZXIgb3IgZm9vdGVyIGJhc2VkIG9uIHRoZSBidXR0b25zXG4gICAgc2hvd0J1dHRvbnMocG9zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIF8uc29tZSh0aGlzLmJ1dHRvbkFycmF5LCBidG4gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMoYnRuLnBvc2l0aW9uLCBwb3NpdGlvbikgJiYgYnRuLnVwZGF0ZU1vZGUgPT09IHRoaXMuaXNVcGRhdGVNb2RlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBFeHBhbmQgb3IgY29sbGFwc2UgdGhlIHBhbmVsXG4gICAgZXhwYW5kQ29sbGFwc2VQYW5lbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29sbGFwc2libGUpIHtcbiAgICAgICAgICAgIC8vIGZsaXAgdGhlIGFjdGl2ZSBmbGFnXG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbiBmb3JtIGRhdGEgc291cmNlIGNoYW5nZS4gVGhpcyBtZXRob2QgaXMgb3ZlcnJpZGRlbiBieSBsaXZlIGZvcm0gYW5kIGxpdmUgZmlsdGVyXG4gICAgb25EYXRhU291cmNlQ2hhbmdlKCkge1xuICAgIH1cblxuICAgIC8vIE9uIGZvcm0gZGF0YSBzb3VyY2UgY2hhbmdlLiBUaGlzIG1ldGhvZCBpcyBvdmVycmlkZGVuIGJ5IGxpdmUgZm9ybSBhbmQgbGl2ZSBmaWx0ZXJcbiAgICBvbkZvcm1EYXRhU291cmNlQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUZpZWxkU291cmNlKCk7XG4gICAgfVxuXG4gICAgLy8gT24gZm9ybSBmaWVsZCBkZWZhdWx0IHZhbHVlIGNoYW5nZS4gVGhpcyBtZXRob2QgaXMgb3ZlcnJpZGRlbiBieSBsaXZlIGZvcm0gYW5kIGxpdmUgZmlsdGVyXG4gICAgb25GaWVsZERlZmF1bHRWYWx1ZUNoYW5nZShmaWVsZCwgbnYpIHtcbiAgICAgICAgZmllbGQudmFsdWUgPSBwYXJzZVZhbHVlQnlUeXBlKG52LCB1bmRlZmluZWQsIGZpZWxkLndpZGdldHR5cGUpO1xuICAgIH1cblxuICAgIC8vIE9uIGZvcm0gZmllbGQgdmFsdWUgY2hhbmdlLiBUaGlzIG1ldGhvZCBpcyBvdmVycmlkZGVuIGJ5IGxpdmUgZm9ybSBhbmQgbGl2ZSBmaWx0ZXJcbiAgICBvbkZpZWxkVmFsdWVDaGFuZ2UoKSB7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gZ2VuZXJhdGUgYW5kIGNvbXBpbGUgdGhlIGZvcm0gZmllbGRzIGZyb20gdGhlIG1ldGFkYXRhXG4gICAgYXN5bmMgZ2VuZXJhdGVGb3JtRmllbGRzKCkge1xuICAgICAgICBsZXQgbm9PZkNvbHVtbnM7XG4gICAgICAgIGxldCAkZ3JpZExheW91dDtcbiAgICAgICAgLy8gQ2hlY2sgaWYgZ3JpZCBsYXlvdXQgaXMgcHJlc2VudCBvciBub3QgZm9yIGZpcnN0IHRpbWVcbiAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodGhpcy5faXNHcmlkTGF5b3V0UHJlc2VudCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzR3JpZExheW91dFByZXNlbnQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5wYW5lbC1ib2R5IFt3bWxheW91dGdyaWRdJykubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faXNHcmlkTGF5b3V0UHJlc2VudCkge1xuICAgICAgICAgICAgJGdyaWRMYXlvdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5mb3JtLWVsZW1lbnRzIFt3bWxheW91dGdyaWRdOmZpcnN0Jyk7XG4gICAgICAgICAgICBub09mQ29sdW1ucyA9IE51bWJlcigkZ3JpZExheW91dC5hdHRyKCdjb2x1bW5zJykpIHx8IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkZ3JpZExheW91dCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmZvcm0tZWxlbWVudHMgLmR5bmFtaWMtZm9ybS1jb250YWluZXInKTtcbiAgICAgICAgICAgIGlmICghJGdyaWRMYXlvdXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcuZm9ybS1lbGVtZW50cycpLnByZXBlbmQoJzxkaXYgY2xhc3M9XCJkeW5hbWljLWZvcm0tY29udGFpbmVyXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgJGdyaWRMYXlvdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5mb3JtLWVsZW1lbnRzIC5keW5hbWljLWZvcm0tY29udGFpbmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub09mQ29sdW1ucyA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29sdW1uV2lkdGggPSAxMiAvIG5vT2ZDb2x1bW5zO1xuICAgICAgICBsZXQgZmllbGRUZW1wbGF0ZSA9ICcnO1xuICAgICAgICBsZXQgY29sQ291bnQgPSAwO1xuICAgICAgICBsZXQgaW5kZXg7XG4gICAgICAgIGxldCB1c2VyRmllbGRzO1xuICAgICAgICBsZXQgZmllbGRzID0gdGhpcy5tZXRhZGF0YSA/IHRoaXMubWV0YWRhdGEuZGF0YSB8fCB0aGlzLm1ldGFkYXRhIDogW107XG5cbiAgICAgICAgdGhpcy5mb3JtRmllbGRzID0gW107IC8vIGVtcHR5IHRoZSBmb3JtIGZpZWxkc1xuXG4gICAgICAgIGlmIChfLmlzRW1wdHkoZmllbGRzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub25CZWZvcmVSZW5kZXJFdnQpIHtcbiAgICAgICAgICAgIHVzZXJGaWVsZHMgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXJlbmRlcicsIHskbWV0YWRhdGE6IGZpZWxkc30pO1xuICAgICAgICAgICAgaWYgKHVzZXJGaWVsZHMpIHtcbiAgICAgICAgICAgICAgICBmaWVsZHMgPSB1c2VyRmllbGRzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfLmlzQXJyYXkoZmllbGRzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGZpZWxkc1tjb2xDb3VudF0pIHtcbiAgICAgICAgICAgIGxldCBjb2xUbXBsID0gJyc7XG4gICAgICAgICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBub09mQ29sdW1uczsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZHNbY29sQ291bnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbFRtcGwgKz0gc2V0TWFya3VwRm9yRm9ybUZpZWxkKGZpZWxkc1tjb2xDb3VudF0sIGNvbHVtbldpZHRoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkVGVtcGxhdGUgKz0gYDx3bS1ncmlkcm93PiR7Y29sVG1wbH08L3dtLWdyaWRyb3c+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5faXNHcmlkTGF5b3V0UHJlc2VudCkge1xuICAgICAgICAgICAgZmllbGRUZW1wbGF0ZSA9IGA8d20tbGF5b3V0Z3JpZD4ke2ZpZWxkVGVtcGxhdGV9PC93bS1sYXlvdXRncmlkPmA7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmR5bmFtaWNGb3JtUmVmLmNsZWFyKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9keW5hbWljQ29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZHluYW1pY0NvbnRleHQgPSBPYmplY3QuY3JlYXRlKHRoaXMudmlld1BhcmVudCk7XG4gICAgICAgICAgICB0aGlzLl9keW5hbWljQ29udGV4dC5mb3JtID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVmID0gYXdhaXQgdGhpcy5keW5hbWljQ29tcG9uZW50UHJvdmlkZXIuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihcbiAgICAgICAgICAgICdhcHAtZm9ybS1keW5hbWljLScgKyB0aGlzLndpZGdldElkLFxuICAgICAgICAgICAgZmllbGRUZW1wbGF0ZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBub0NhY2hlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRyYW5zcGlsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuZHluYW1pY0Zvcm1SZWYuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnlSZWYsIDAsIHRoaXMuaW5qKTtcbiAgICAgICAgZXh0ZW5kUHJvdG8oY29tcG9uZW50Lmluc3RhbmNlLCB0aGlzLl9keW5hbWljQ29udGV4dCk7XG4gICAgICAgICRncmlkTGF5b3V0WzBdLmFwcGVuZENoaWxkKGNvbXBvbmVudC5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgdGhpcy5zZXRGb3JtRGF0YSh0aGlzLmZvcm1kYXRhKTtcbiAgICB9XG5cbiAgICBnZXQgbW9kZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uVHlwZSB8fCB0aGlzLmZpbmRPcGVyYXRpb25UeXBlKCk7XG4gICAgfVxuXG4gICAgZ2V0IGRpcnR5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0gJiYgdGhpcy5uZ2Zvcm0uZGlydHk7XG4gICAgfVxuXG4gICAgZ2V0IGludmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5nZm9ybSAmJiB0aGlzLm5nZm9ybS5pbnZhbGlkO1xuICAgIH1cblxuICAgIGdldCB0b3VjaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0gJiYgdGhpcy5uZ2Zvcm0udG91Y2hlZDtcbiAgICB9XG5cbiAgICBpbnZva2VBY3Rpb25FdmVudCgkZXZlbnQsIGV4cHJlc3Npb246IHN0cmluZykge1xuICAgICAgICBjb25zdCBmbiA9ICRwYXJzZUV2ZW50KGV4cHJlc3Npb24pO1xuICAgICAgICBmbih0aGlzLnZpZXdQYXJlbnQsIE9iamVjdC5hc3NpZ24odGhpcy5jb250ZXh0LCB7JGV2ZW50fSkpO1xuICAgIH1cbn1cbiJdfQ==