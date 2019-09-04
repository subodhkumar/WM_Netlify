import * as tslib_1 from "tslib";
import { Attribute, ContentChild, Directive, Inject, Injector, Optional, Self } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { debounce, FormWidgetType, isDefined, isMobile, addForIdAttributes } from '@wm/core';
import { registerProps } from './form-field.props';
import { getEvaluatedData, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { getDefaultViewModeWidget } from '../../../../utils/live-utils';
import { StylableComponent } from '../../base/stylable.component';
import { FormComponent } from '../form.component';
import { Context } from '../../../framework/types';
import { ListComponent } from '../../list/list.component';
// Custom validator to show validation error, if setValidationMessage method is used
var customValidatorFn = function () {
    return { custom: true };
};
var ɵ0 = customValidatorFn;
var FILE_TYPES = {
    'image': 'image/*',
    'video': 'video/*',
    'audio': 'audio/*'
};
var ɵ1 = {};
var FormFieldDirective = /** @class */ (function (_super) {
    tslib_1.__extends(FormFieldDirective, _super);
    function FormFieldDirective(inj, form, fb, parentList, binddataset, binddisplayexpression, binddisplaylabel, _widgetType, name, key, isRange, pcDisplay, mobileDisplay, contexts) {
        var _this = this;
        var WIDGET_CONFIG = {
            widgetType: 'wm-form-field',
            hostClass: '',
            widgetSubType: 'wm-form-field-' + (_widgetType || FormWidgetType.TEXT).trim()
        };
        _this = _super.call(this, inj, WIDGET_CONFIG, new Promise(function (res) { return _this._initPropsRes = res; })) || this;
        _this._validators = [];
        _this.class = '';
        _this.binddataset = binddataset;
        _this.binddisplayexpression = binddisplayexpression;
        _this.binddisplaylabel = binddisplaylabel;
        _this.form = form;
        _this.fb = fb;
        _this._fieldName = key || name;
        _this.isRange = isRange;
        _this.excludeProps = new Set(['type', 'name']);
        _this.widgettype = _widgetType;
        _this.parentList = parentList;
        if (_this.binddataset || _this.$element.attr('dataset')) {
            _this.isDataSetBound = true;
        }
        contexts[0]._onFocusField = _this._onFocusField.bind(_this);
        contexts[0]._onBlurField = _this._onBlurField.bind(_this);
        _this._debounceSetUpValidators = debounce(function () { return _this.setUpValidators(); }, 500);
        return _this;
    }
    FormFieldDirective.prototype._onFocusField = function ($evt) {
        $($evt.target).closest('.live-field').addClass('active');
    };
    FormFieldDirective.prototype._onBlurField = function ($evt) {
        $($evt.target).closest('.live-field').removeClass('active');
        this.setUpValidators();
    };
    // Expression to be evaluated in view mode of form field
    FormFieldDirective.prototype.evaluateExpr = function (object, displayExpr) {
        if (!displayExpr) {
            displayExpr = Object.keys(object)[0];
            // If dataset is not ready, display expression will not be defined
            if (!displayExpr) {
                return;
            }
        }
        return getEvaluatedData(object, {
            expression: displayExpr
        }, this.viewParent);
    };
    // Expression to be evaluated in view mode of form field
    FormFieldDirective.prototype.getDisplayExpr = function () {
        var _this = this;
        var caption = [];
        var value = this.value;
        var displayExpr = this.displayexpression || this.displayfield || this.displaylabel;
        if (_.isObject(value)) {
            if (_.isArray(value)) {
                _.forEach(value, function (obj) {
                    if (_.isObject(obj)) {
                        caption.push(_this.evaluateExpr(obj, displayExpr));
                    }
                });
            }
            else {
                caption.push(this.evaluateExpr(value, displayExpr));
            }
            return _.join(caption, ',');
        }
        return (value === undefined || value === null) ? '' : this.value;
    };
    FormFieldDirective.prototype.getCaption = function () {
        return (this.value === undefined || this.value === null) ? (_.get(this.form.dataoutput, this._fieldName) || '') : this.value;
    };
    // Method to setup validators for reactive form control
    FormFieldDirective.prototype.setUpValidators = function (customValidator) {
        this._validators = [];
        if (this.required && this.show !== false) {
            // For checkbox/toggle widget, required validation should consider true value only
            if (this.widgettype === FormWidgetType.CHECKBOX || this.widgettype === FormWidgetType.TOGGLE) {
                this._validators.push(Validators.requiredTrue);
            }
            else {
                this._validators.push(Validators.required);
            }
        }
        if (this.maxchars) {
            this._validators.push(Validators.maxLength(this.maxchars));
        }
        if (this.minvalue) {
            this._validators.push(Validators.min(this.minvalue));
        }
        if (this.maxvalue && this.widgettype !== FormWidgetType.RATING) {
            this._validators.push(Validators.max(this.maxvalue));
        }
        if (this.regexp) {
            this._validators.push(Validators.pattern(this.regexp));
        }
        if (_.isFunction(this.formWidget.validate)) {
            this._validators.push(this.formWidget.validate.bind(this.formWidget));
        }
        if (customValidator) {
            this._validators.push(customValidator);
        }
        if (this.ngform) {
            this._control.setValidators(this._validators);
            var opt = {};
            // updating the value only when prevData is not equal to current value.
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.value === this.formWidget.prevDatavalue) {
                opt['emitEvent'] = false;
            }
            this._control.updateValueAndValidity(opt);
        }
    };
    // Method to set the properties on inner form widget
    FormFieldDirective.prototype.setFormWidget = function (key, val) {
        if (this.formWidget && this.formWidget.widget) {
            this.formWidget.widget[key] = val;
        }
    };
    // Method to set the properties on inner max form widget (when range is selected)
    FormFieldDirective.prototype.setMaxFormWidget = function (key, val) {
        if (this.formWidgetMax) {
            this.formWidgetMax.widget[key] = val;
        }
    };
    FormFieldDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key !== 'tabindex') {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
        if (this.excludeProps.has(key)) {
            return;
        }
        // As upload widget is an HTML widget, only required property is setup
        if (this.widgettype === FormWidgetType.UPLOAD) {
            if (key === 'required') {
                this._debounceSetUpValidators();
            }
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
            return;
        }
        this.setFormWidget(key, nv);
        // Placeholder should not be setup on max widget
        if (key !== 'placeholder') {
            this.setMaxFormWidget(key, nv);
        }
        switch (key) {
            case 'defaultvalue':
                this.form.onFieldDefaultValueChange(this, nv);
                break;
            case 'maxdefaultvalue':
                this.maxValue = nv;
                this.setMaxFormWidget('datavalue', nv);
                this.form.onMaxDefaultValueChange();
                break;
            case 'maxplaceholder':
                this.setMaxFormWidget('placeholder', nv);
                break;
            case 'required':
            case 'maxchars':
            case 'minvalue':
            case 'maxvalue':
            case 'regexp':
            case 'show':
                this._debounceSetUpValidators();
                break;
            case 'primary-key':
                if (nv) {
                    this.form.setPrimaryKey(this._fieldName);
                }
                break;
            case 'display-name':
                this.displayname = nv;
                break;
            case 'readonly':
                this.setReadOnlyState();
                break;
        }
    };
    FormFieldDirective.prototype.onStyleChange = function (key, nv, ov) {
        this.setFormWidget(key, nv);
        this.setMaxFormWidget(key, nv);
        _super.prototype.onStyleChange.call(this, key, nv, ov);
    };
    Object.defineProperty(FormFieldDirective.prototype, "datavalue", {
        get: function () {
            return this.formWidget && this.formWidget.datavalue;
        },
        set: function (val) {
            if (this._control && this.widgettype !== FormWidgetType.UPLOAD) {
                this._control.setValue(val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFieldDirective.prototype, "value", {
        get: function () {
            return this.datavalue;
        },
        set: function (val) {
            this.datavalue = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFieldDirective.prototype, "maxValue", {
        get: function () {
            return this.formWidgetMax && this.formWidgetMax.datavalue;
        },
        set: function (val) {
            if (this._maxControl) {
                this._maxControl.setValue(val);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFieldDirective.prototype, "minValue", {
        get: function () {
            return this.value;
        },
        set: function (val) {
            this.value = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFieldDirective.prototype, "_control", {
        // Get the reactive form control
        get: function () {
            return this.ngform && this.ngform.controls[this._fieldName];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormFieldDirective.prototype, "_maxControl", {
        // Get the reactive max form control
        get: function () {
            return this.ngform && this.ngform.controls[this._fieldName + '_max'];
        },
        enumerable: true,
        configurable: true
    });
    // Create the reactive form control
    FormFieldDirective.prototype.createControl = function () {
        return this.fb.control(undefined, {
            validators: this._validators
        });
    };
    // On field value change, propagate event to parent form
    FormFieldDirective.prototype.onValueChange = function (val) {
        if (!this.isDestroyed) {
            this.form.onFieldValueChange(this, val);
        }
    };
    // Method to expose validation message and set control to invalid
    FormFieldDirective.prototype.setValidationMessage = function (val) {
        var _this = this;
        setTimeout(function () {
            _this.validationmessage = val;
            _this.setUpValidators(customValidatorFn);
        });
    };
    FormFieldDirective.prototype.setReadOnlyState = function () {
        var readOnly;
        if (this.form.isUpdateMode) {
            if (this['primary-key'] && !this['is-related'] && !this.period) {
                /*If the field is primary but is assigned set readonly false.
                   Assigned is where the user inputs the value while a new entry.
                   This is not editable(in update mode) once entry is successful*/
                readOnly = !(this.generator === 'assigned' && this.form.operationType !== 'update');
            }
            else {
                readOnly = this.readonly;
            }
        }
        else {
            // In view mode, set widget state to readonly always
            readOnly = true;
        }
        this.setFormWidget('readonly', readOnly);
    };
    FormFieldDirective.prototype.resetDisplayInput = function () {
        if ((!isDefined(this.value) || this.value === '')) {
            this.formWidget && this.formWidget.resetDisplayInput && this.formWidget.resetDisplayInput();
        }
    };
    FormFieldDirective.prototype.triggerUploadEvent = function ($event, eventName) {
        var params = { $event: $event };
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this._oldUploadVal;
            this._oldUploadVal = params.newVal;
        }
        this.invokeEventCallback(eventName, params);
    };
    FormFieldDirective.prototype.registerFormField = function () {
        var fieldName = this._fieldName;
        if (this.parentList && !(this.form.parentList === this.parentList)) {
            var counter = 1;
            var _fieldName = fieldName;
            while (this.ngform.controls.hasOwnProperty(_fieldName)) {
                _fieldName = fieldName + "_" + counter;
                counter++;
            }
            this.ngform.addControl(_fieldName, this.createControl());
            this._fieldName = _fieldName;
        }
        else {
            this.ngform.addControl(fieldName, this.createControl());
        }
        var onValueChangeSubscription = this._control.valueChanges
            .pipe(debounceTime(200))
            .subscribe(this.onValueChange.bind(this));
        this.registerDestroyListener(function () { return onValueChangeSubscription.unsubscribe(); });
        if (this.isRange === 'true') {
            this.ngform.addControl(fieldName + '_max', this.createControl());
            // registering for valueChanges on MaxformWidget
            var onMaxValueChangeSubscription_1 = this._maxControl.valueChanges
                .pipe(debounceTime(200))
                .subscribe(this.onValueChange.bind(this));
            this.registerDestroyListener(function () { return onMaxValueChangeSubscription_1.unsubscribe(); });
        }
        this.value = _.get(this.form.formdata, this._fieldName);
    };
    FormFieldDirective.prototype.ngOnInit = function () {
        this.ngform = this.form.ngform;
        this.registerFormField();
        _super.prototype.ngOnInit.call(this);
    };
    FormFieldDirective.prototype.ngAfterContentInit = function () {
        var _this = this;
        _super.prototype.ngAfterContentInit.call(this);
        if (this.formWidget) {
            this._initPropsRes();
            // setting displayExpressions on the formwidget explicitly as expr was evaluated to "".
            this.setFormWidget('binddisplaylabel', this.binddisplaylabel);
            this.setFormWidget('binddisplayexpression', this.binddisplayexpression);
        }
        this.registerReadyStateListener(function () {
            _this.key = _this._fieldName || _this.target || _this.binding;
            _this.viewmodewidget = _this.viewmodewidget || getDefaultViewModeWidget(_this.widgettype);
            // For upload widget, generate the permitted field
            if (_this.widgettype === FormWidgetType.UPLOAD) {
                var fileType = void 0;
                // Create the accepts string from file type and extensions
                fileType = _this.filetype ? FILE_TYPES[_this.filetype] : '';
                _this.permitted = fileType + (_this.extensions ? (fileType ? ',' : '') + _this.extensions : '');
            }
            if (isMobile()) {
                if (!_this['mobile-display']) {
                    _this.widget.show = false;
                }
            }
            else {
                if (!_this['pc-display']) {
                    _this.widget.show = false;
                }
            }
            // Register the form field with parent form
            _this.form.registerFormFields(_this.widget);
            addForIdAttributes(_this.nativeElement);
            _this.setReadOnlyState();
        });
    };
    FormFieldDirective.initializeProps = registerProps();
    FormFieldDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmFormField]',
                    exportAs: 'wmFormField',
                    providers: [
                        provideAsWidgetRef(FormFieldDirective),
                        provideAsNgValueAccessor(FormFieldDirective),
                        { provide: Context, useValue: ɵ1, multi: true }
                    ]
                },] }
    ];
    /** @nocollapse */
    FormFieldDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: FormComponent },
        { type: FormBuilder },
        { type: ListComponent, decorators: [{ type: Optional }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['displayexpression.bind',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['displaylabel.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['widgettype',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['name',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['key',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['is-range',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['pc-display',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['mobile-display',] }] },
        { type: Array, decorators: [{ type: Self }, { type: Inject, args: [Context,] }] }
    ]; };
    FormFieldDirective.propDecorators = {
        formWidget: [{ type: ContentChild, args: ['formWidget',] }],
        formWidgetMax: [{ type: ContentChild, args: ['formWidgetMax',] }]
    };
    return FormFieldDirective;
}(StylableComponent));
export { FormFieldDirective };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Zvcm0vZm9ybS1maWVsZC9mb3JtLWZpZWxkLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFtQixTQUFTLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFVLFFBQVEsRUFBRSxJQUFJLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0gsT0FBTyxFQUFFLFdBQVcsRUFBYSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEgsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDeEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJMUQsb0ZBQW9GO0FBQ3BGLElBQU0saUJBQWlCLEdBQUc7SUFDdEIsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixDQUFDLENBQUM7O0FBRUYsSUFBTSxVQUFVLEdBQUc7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USxFQUFFLGFBQWE7b0JBQ3ZCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQzt3QkFDdEMsd0JBQXdCLENBQUMsa0JBQWtCLENBQUM7d0JBQzVDLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDO3FCQUNoRDtpQkFDSjs7OztnQkFwQ3FFLFFBQVE7Z0JBV3JFLGFBQWE7Z0JBVmIsV0FBVztnQkFZWCxhQUFhLHVCQWtGYixRQUFRO2dEQUNSLFNBQVMsU0FBQyxjQUFjOzZDQUN4QixTQUFTLFNBQUMsd0JBQXdCOzZDQUNsQyxTQUFTLFNBQUMsbUJBQW1CO2dEQUM3QixTQUFTLFNBQUMsWUFBWTtnREFDdEIsU0FBUyxTQUFDLE1BQU07Z0RBQ2hCLFNBQVMsU0FBQyxLQUFLO2dEQUNmLFNBQVMsU0FBQyxVQUFVO2dEQUNwQixTQUFTLFNBQUMsWUFBWTtnREFDdEIsU0FBUyxTQUFDLGdCQUFnQjtnQkFDUSxLQUFLLHVCQUF2QyxJQUFJLFlBQUksTUFBTSxTQUFDLE9BQU87Ozs2QkFqRTFCLFlBQVksU0FBQyxZQUFZO2dDQUN6QixZQUFZLFNBQUMsZUFBZTs7SUFpY2pDLHlCQUFDO0NBQUEsQUE5Y0QsQ0FTd0MsaUJBQWlCLEdBcWN4RDtTQXJjWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FmdGVyQ29udGVudEluaXQsIEF0dHJpYnV0ZSwgQ29udGVudENoaWxkLCBEaXJlY3RpdmUsIEluamVjdCwgSW5qZWN0b3IsIE9uSW5pdCwgT3B0aW9uYWwsIFNlbGZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRm9ybUJ1aWxkZXIsIEZvcm1Hcm91cCwgVmFsaWRhdG9ycyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcblxuaW1wb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBkZWJvdW5jZSwgRm9ybVdpZGdldFR5cGUsIGlzRGVmaW5lZCwgaXNNb2JpbGUsIGFkZEZvcklkQXR0cmlidXRlcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZm9ybS1maWVsZC5wcm9wcyc7XG5pbXBvcnQgeyBnZXRFdmFsdWF0ZWREYXRhLCBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBnZXREZWZhdWx0Vmlld01vZGVXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9saXZlLXV0aWxzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL2Zvcm0uY29tcG9uZW50JztcbmltcG9ydCB7IENvbnRleHQgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgTGlzdENvbXBvbmVudCB9IGZyb20gJy4uLy4uL2xpc3QvbGlzdC5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5cbi8vIEN1c3RvbSB2YWxpZGF0b3IgdG8gc2hvdyB2YWxpZGF0aW9uIGVycm9yLCBpZiBzZXRWYWxpZGF0aW9uTWVzc2FnZSBtZXRob2QgaXMgdXNlZFxuY29uc3QgY3VzdG9tVmFsaWRhdG9yRm4gPSAoKSA9PiB7XG4gICAgcmV0dXJuIHsgY3VzdG9tOiB0cnVlIH07XG59O1xuXG5jb25zdCBGSUxFX1RZUEVTID0ge1xuICAgICdpbWFnZScgOiAnaW1hZ2UvKicsXG4gICAgJ3ZpZGVvJyA6ICd2aWRlby8qJyxcbiAgICAnYXVkaW8nIDogJ2F1ZGlvLyonXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUZvcm1GaWVsZF0nLFxuICAgIGV4cG9ydEFzOiAnd21Gb3JtRmllbGQnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoRm9ybUZpZWxkRGlyZWN0aXZlKSxcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKEZvcm1GaWVsZERpcmVjdGl2ZSksXG4gICAgICAgIHtwcm92aWRlOiBDb250ZXh0LCB1c2VWYWx1ZToge30sIG11bHRpOiB0cnVlfVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRm9ybUZpZWxkRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudEluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBAQ29udGVudENoaWxkKCdmb3JtV2lkZ2V0JykgZm9ybVdpZGdldDtcbiAgICBAQ29udGVudENoaWxkKCdmb3JtV2lkZ2V0TWF4JykgZm9ybVdpZGdldE1heDtcblxuICAgIHByaXZhdGUgZmI7XG4gICAgLy8gZXhjbHVkZVByb3BzIGlzIHVzZWQgdG8gc3RvcmUgdGhlIHByb3BzIHRoYXQgc2hvdWxkIG5vdCBiZSBhcHBsaWVkIG9uIGlubmVyIHdpZGdldFxuICAgIHByaXZhdGUgZXhjbHVkZVByb3BzO1xuICAgIHByaXZhdGUgX3ZhbGlkYXRvcnM7XG4gICAgcHJpdmF0ZSBfb2xkVXBsb2FkVmFsO1xuXG4gICAgbmdmb3JtOiBGb3JtR3JvdXA7XG4gICAgZGVmYXVsdHZhbHVlO1xuICAgIGRpc3BsYXlleHByZXNzaW9uO1xuICAgIGRpc3BsYXlmaWVsZDtcbiAgICBkaXNwbGF5bGFiZWw7XG4gICAgZGlzcGxheW5hbWU7XG4gICAgZ2VuZXJhdG9yO1xuICAgIGtleTtcbiAgICB0YXJnZXQ7XG4gICAgYmluZGluZztcbiAgICB3aWRnZXR0eXBlO1xuICAgIGNsYXNzO1xuICAgIHJlYWRvbmx5O1xuICAgIHNob3c7XG4gICAgdHlwZTtcbiAgICBpc0RhdGFTZXRCb3VuZDtcbiAgICB2aWV3bW9kZXdpZGdldDtcbiAgICBiaW5kZGF0YXNldDtcbiAgICBiaW5kZGlzcGxheWV4cHJlc3Npb247XG4gICAgYmluZGRpc3BsYXlsYWJlbDtcbiAgICBmb3JtO1xuICAgIGZpbGV0eXBlO1xuICAgIGV4dGVuc2lvbnM7XG4gICAgcGVybWl0dGVkO1xuICAgIHBlcmlvZDtcbiAgICBpc1JhbmdlO1xuICAgIG5hbWU7XG5cbiAgICAvLyBWYWxpZGF0aW9uIHByb3BlcnRpZXNcbiAgICByZXF1aXJlZDtcbiAgICBtYXhjaGFycztcbiAgICBtaW52YWx1ZTtcbiAgICBtYXh2YWx1ZTtcbiAgICByZWdleHA7XG4gICAgdmFsaWRhdGlvbm1lc3NhZ2U7XG5cbiAgICBwdWJsaWMgX2ZpZWxkTmFtZTtcblxuICAgIHByaXZhdGUgX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzO1xuICAgIHByaXZhdGUgX2luaXRQcm9wc1JlcztcbiAgICBwcml2YXRlIHBhcmVudExpc3Q7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgZm9ybTogRm9ybUNvbXBvbmVudCxcbiAgICAgICAgZmI6IEZvcm1CdWlsZGVyLFxuICAgICAgICBAT3B0aW9uYWwoKSBwYXJlbnRMaXN0OiBMaXN0Q29tcG9uZW50LFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc2V0LmJpbmQnKSBiaW5kZGF0YXNldCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGlzcGxheWV4cHJlc3Npb24uYmluZCcpIGJpbmRkaXNwbGF5ZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdkaXNwbGF5bGFiZWwuYmluZCcpIGJpbmRkaXNwbGF5bGFiZWw6IHN0cmluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnd2lkZ2V0dHlwZScpIF93aWRnZXRUeXBlLFxuICAgICAgICBAQXR0cmlidXRlKCduYW1lJykgbmFtZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgna2V5Jykga2V5LFxuICAgICAgICBAQXR0cmlidXRlKCdpcy1yYW5nZScpIGlzUmFuZ2UsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3BjLWRpc3BsYXknKSBwY0Rpc3BsYXksXG4gICAgICAgIEBBdHRyaWJ1dGUoJ21vYmlsZS1kaXNwbGF5JykgbW9iaWxlRGlzcGxheSxcbiAgICAgICAgQFNlbGYoKSBASW5qZWN0KENvbnRleHQpIGNvbnRleHRzOiBBcnJheTxhbnk+XG4gICAgKSB7XG5cbiAgICAgICAgY29uc3QgV0lER0VUX0NPTkZJRyA9IHtcbiAgICAgICAgICAgIHdpZGdldFR5cGU6ICd3bS1mb3JtLWZpZWxkJyxcbiAgICAgICAgICAgIGhvc3RDbGFzczogJycsXG4gICAgICAgICAgICB3aWRnZXRTdWJUeXBlOiAnd20tZm9ybS1maWVsZC0nICsgKF93aWRnZXRUeXBlIHx8IEZvcm1XaWRnZXRUeXBlLlRFWFQpLnRyaW0oKVxuICAgICAgICB9O1xuXG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRywgbmV3IFByb21pc2UocmVzID0+IHRoaXMuX2luaXRQcm9wc1JlcyA9IHJlcykpO1xuXG4gICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jbGFzcyA9ICcnO1xuICAgICAgICB0aGlzLmJpbmRkYXRhc2V0ID0gYmluZGRhdGFzZXQ7XG4gICAgICAgIHRoaXMuYmluZGRpc3BsYXlleHByZXNzaW9uID0gYmluZGRpc3BsYXlleHByZXNzaW9uO1xuICAgICAgICB0aGlzLmJpbmRkaXNwbGF5bGFiZWwgPSBiaW5kZGlzcGxheWxhYmVsO1xuICAgICAgICB0aGlzLmZvcm0gPSBmb3JtO1xuICAgICAgICB0aGlzLmZiID0gZmI7XG4gICAgICAgIHRoaXMuX2ZpZWxkTmFtZSA9IGtleSB8fCBuYW1lO1xuICAgICAgICB0aGlzLmlzUmFuZ2UgPSBpc1JhbmdlO1xuICAgICAgICB0aGlzLmV4Y2x1ZGVQcm9wcyA9IG5ldyBTZXQoWyd0eXBlJywgJ25hbWUnXSk7XG4gICAgICAgIHRoaXMud2lkZ2V0dHlwZSA9IF93aWRnZXRUeXBlO1xuICAgICAgICB0aGlzLnBhcmVudExpc3QgPSBwYXJlbnRMaXN0O1xuXG4gICAgICAgIGlmICh0aGlzLmJpbmRkYXRhc2V0IHx8IHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YXNldCcpKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGF0YVNldEJvdW5kID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHRzWzBdLl9vbkZvY3VzRmllbGQgPSB0aGlzLl9vbkZvY3VzRmllbGQuYmluZCh0aGlzKTtcbiAgICAgICAgY29udGV4dHNbMF0uX29uQmx1ckZpZWxkID0gdGhpcy5fb25CbHVyRmllbGQuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycyA9IGRlYm91bmNlKCgpID0+IHRoaXMuc2V0VXBWYWxpZGF0b3JzKCksIDUwMCk7XG4gICAgfVxuXG4gICAgX29uRm9jdXNGaWVsZCgkZXZ0KSB7XG4gICAgICAgICQoJGV2dC50YXJnZXQpLmNsb3Nlc3QoJy5saXZlLWZpZWxkJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgIH1cblxuICAgIF9vbkJsdXJGaWVsZCgkZXZ0KSB7XG4gICAgICAgICQoJGV2dC50YXJnZXQpLmNsb3Nlc3QoJy5saXZlLWZpZWxkJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLnNldFVwVmFsaWRhdG9ycygpO1xuICAgIH1cblxuICAgIC8vIEV4cHJlc3Npb24gdG8gYmUgZXZhbHVhdGVkIGluIHZpZXcgbW9kZSBvZiBmb3JtIGZpZWxkXG4gICAgZXZhbHVhdGVFeHByKG9iamVjdCwgZGlzcGxheUV4cHIpIHtcbiAgICAgICAgaWYgKCFkaXNwbGF5RXhwcikge1xuICAgICAgICAgICAgZGlzcGxheUV4cHIgPSBPYmplY3Qua2V5cyhvYmplY3QpWzBdO1xuICAgICAgICAgICAgLy8gSWYgZGF0YXNldCBpcyBub3QgcmVhZHksIGRpc3BsYXkgZXhwcmVzc2lvbiB3aWxsIG5vdCBiZSBkZWZpbmVkXG4gICAgICAgICAgICBpZiAoIWRpc3BsYXlFeHByKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRFdmFsdWF0ZWREYXRhKG9iamVjdCwge1xuICAgICAgICAgICAgZXhwcmVzc2lvbjogZGlzcGxheUV4cHJcbiAgICAgICAgfSwgdGhpcy52aWV3UGFyZW50KTtcbiAgICB9XG5cbiAgICAvLyBFeHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZCBpbiB2aWV3IG1vZGUgb2YgZm9ybSBmaWVsZFxuICAgIGdldERpc3BsYXlFeHByKCkge1xuICAgICAgICBjb25zdCBjYXB0aW9uID0gW107XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgY29uc3QgZGlzcGxheUV4cHIgPSB0aGlzLmRpc3BsYXlleHByZXNzaW9uIHx8IHRoaXMuZGlzcGxheWZpZWxkIHx8IHRoaXMuZGlzcGxheWxhYmVsO1xuICAgICAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHZhbHVlLCBvYmogPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc09iamVjdChvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0aW9uLnB1c2godGhpcy5ldmFsdWF0ZUV4cHIob2JqLCBkaXNwbGF5RXhwcikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhcHRpb24ucHVzaCh0aGlzLmV2YWx1YXRlRXhwcih2YWx1ZSwgZGlzcGxheUV4cHIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfLmpvaW4oY2FwdGlvbiwgJywnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpID8gJycgOiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIGdldENhcHRpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMudmFsdWUgPT09IG51bGwpID8gKF8uZ2V0KHRoaXMuZm9ybS5kYXRhb3V0cHV0LCB0aGlzLl9maWVsZE5hbWUpIHx8ICcnKSA6IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIHRvIHNldHVwIHZhbGlkYXRvcnMgZm9yIHJlYWN0aXZlIGZvcm0gY29udHJvbFxuICAgIHByaXZhdGUgc2V0VXBWYWxpZGF0b3JzKGN1c3RvbVZhbGlkYXRvcj8pIHtcbiAgICAgICAgdGhpcy5fdmFsaWRhdG9ycyA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnJlcXVpcmVkICYmIHRoaXMuc2hvdyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIEZvciBjaGVja2JveC90b2dnbGUgd2lkZ2V0LCByZXF1aXJlZCB2YWxpZGF0aW9uIHNob3VsZCBjb25zaWRlciB0cnVlIHZhbHVlIG9ubHlcbiAgICAgICAgICAgIGlmICh0aGlzLndpZGdldHR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLkNIRUNLQk9YIHx8IHRoaXMud2lkZ2V0dHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuVE9HR0xFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMucmVxdWlyZWRUcnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1heGNoYXJzKSB7XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5tYXhMZW5ndGgodGhpcy5tYXhjaGFycykpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1pbnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5taW4odGhpcy5taW52YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm1heHZhbHVlICYmIHRoaXMud2lkZ2V0dHlwZSAhPT0gRm9ybVdpZGdldFR5cGUuUkFUSU5HKSB7XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5tYXgodGhpcy5tYXh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJlZ2V4cCkge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMucGF0dGVybih0aGlzLnJlZ2V4cCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzRnVuY3Rpb24odGhpcy5mb3JtV2lkZ2V0LnZhbGlkYXRlKSkge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKHRoaXMuZm9ybVdpZGdldC52YWxpZGF0ZS5iaW5kKHRoaXMuZm9ybVdpZGdldCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjdXN0b21WYWxpZGF0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMucHVzaChjdXN0b21WYWxpZGF0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubmdmb3JtKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250cm9sLnNldFZhbGlkYXRvcnModGhpcy5fdmFsaWRhdG9ycyk7XG4gICAgICAgICAgICBjb25zdCBvcHQgPSB7fTtcbiAgICAgICAgICAgIC8vIHVwZGF0aW5nIHRoZSB2YWx1ZSBvbmx5IHdoZW4gcHJldkRhdGEgaXMgbm90IGVxdWFsIHRvIGN1cnJlbnQgdmFsdWUuXG4gICAgICAgICAgICAvLyBlbWl0RXZlbnQgZmxhZyB3aWxsIHByZXZlbnQgZnJvbSBlbWl0dGluZyB0aGUgdmFsdWVDaGFuZ2VzIHdoZW4gdmFsdWUgaXMgZXF1YWwgdG8gdGhlIHByZXZEYXRhdmFsdWUuXG4gICAgICAgICAgICBpZiAodGhpcy52YWx1ZSA9PT0gdGhpcy5mb3JtV2lkZ2V0LnByZXZEYXRhdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvcHRbJ2VtaXRFdmVudCddID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9jb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkob3B0KTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIHRvIHNldCB0aGUgcHJvcGVydGllcyBvbiBpbm5lciBmb3JtIHdpZGdldFxuICAgIHNldEZvcm1XaWRnZXQoa2V5LCB2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMuZm9ybVdpZGdldCAmJiB0aGlzLmZvcm1XaWRnZXQud2lkZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1XaWRnZXQud2lkZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gc2V0IHRoZSBwcm9wZXJ0aWVzIG9uIGlubmVyIG1heCBmb3JtIHdpZGdldCAod2hlbiByYW5nZSBpcyBzZWxlY3RlZClcbiAgICBzZXRNYXhGb3JtV2lkZ2V0KGtleSwgdmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1XaWRnZXRNYXgpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybVdpZGdldE1heC53aWRnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgIT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZXhjbHVkZVByb3BzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBcyB1cGxvYWQgd2lkZ2V0IGlzIGFuIEhUTUwgd2lkZ2V0LCBvbmx5IHJlcXVpcmVkIHByb3BlcnR5IGlzIHNldHVwXG4gICAgICAgIGlmICh0aGlzLndpZGdldHR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlVQTE9BRCkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3JlcXVpcmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0Rm9ybVdpZGdldChrZXksIG52KTtcblxuICAgICAgICAvLyBQbGFjZWhvbGRlciBzaG91bGQgbm90IGJlIHNldHVwIG9uIG1heCB3aWRnZXRcbiAgICAgICAgaWYgKGtleSAhPT0gJ3BsYWNlaG9sZGVyJykge1xuICAgICAgICAgICAgdGhpcy5zZXRNYXhGb3JtV2lkZ2V0KGtleSwgbnYpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RlZmF1bHR2YWx1ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLm9uRmllbGREZWZhdWx0VmFsdWVDaGFuZ2UodGhpcywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbWF4ZGVmYXVsdHZhbHVlJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1heFZhbHVlID0gbnY7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNYXhGb3JtV2lkZ2V0KCdkYXRhdmFsdWUnLCBudik7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtLm9uTWF4RGVmYXVsdFZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtYXhwbGFjZWhvbGRlcic6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRNYXhGb3JtV2lkZ2V0KCdwbGFjZWhvbGRlcicsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlcXVpcmVkJzpcbiAgICAgICAgICAgIGNhc2UgJ21heGNoYXJzJzpcbiAgICAgICAgICAgIGNhc2UgJ21pbnZhbHVlJzpcbiAgICAgICAgICAgIGNhc2UgJ21heHZhbHVlJzpcbiAgICAgICAgICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICAgICAgICBjYXNlICdzaG93JzpcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncHJpbWFyeS1rZXknOlxuICAgICAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm0uc2V0UHJpbWFyeUtleSh0aGlzLl9maWVsZE5hbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Rpc3BsYXktbmFtZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5bmFtZSA9IG52O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmVhZG9ubHknOlxuICAgICAgICAgICAgICAgdGhpcy5zZXRSZWFkT25seVN0YXRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblN0eWxlQ2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICB0aGlzLnNldEZvcm1XaWRnZXQoa2V5LCBudik7XG4gICAgICAgIHRoaXMuc2V0TWF4Rm9ybVdpZGdldChrZXksIG52KTtcbiAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgZ2V0IGRhdGF2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybVdpZGdldCAmJiB0aGlzLmZvcm1XaWRnZXQuZGF0YXZhbHVlO1xuICAgIH1cblxuICAgIHNldCBkYXRhdmFsdWUodmFsKSB7XG4gICAgICAgIGlmICh0aGlzLl9jb250cm9sICYmIHRoaXMud2lkZ2V0dHlwZSAhPT0gRm9ybVdpZGdldFR5cGUuVVBMT0FEKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250cm9sLnNldFZhbHVlKHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGF2YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgdmFsdWUodmFsKSB7XG4gICAgICAgIHRoaXMuZGF0YXZhbHVlID0gdmFsO1xuICAgIH1cblxuICAgIGdldCBtYXhWYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybVdpZGdldE1heCAmJiB0aGlzLmZvcm1XaWRnZXRNYXguZGF0YXZhbHVlO1xuICAgIH1cblxuICAgIHNldCBtYXhWYWx1ZSh2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMuX21heENvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuX21heENvbnRyb2wuc2V0VmFsdWUodmFsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBtaW5WYWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IG1pblZhbHVlKHZhbCkge1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgcmVhY3RpdmUgZm9ybSBjb250cm9sXG4gICAgZ2V0IF9jb250cm9sKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0gJiYgdGhpcy5uZ2Zvcm0uY29udHJvbHNbdGhpcy5fZmllbGROYW1lXTtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHJlYWN0aXZlIG1heCBmb3JtIGNvbnRyb2xcbiAgICBnZXQgX21heENvbnRyb2woKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5nZm9ybSAmJiB0aGlzLm5nZm9ybS5jb250cm9sc1t0aGlzLl9maWVsZE5hbWUgKyAnX21heCddO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgcmVhY3RpdmUgZm9ybSBjb250cm9sXG4gICAgY3JlYXRlQ29udHJvbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmIuY29udHJvbCh1bmRlZmluZWQsIHtcbiAgICAgICAgICAgIHZhbGlkYXRvcnM6IHRoaXMuX3ZhbGlkYXRvcnNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gT24gZmllbGQgdmFsdWUgY2hhbmdlLCBwcm9wYWdhdGUgZXZlbnQgdG8gcGFyZW50IGZvcm1cbiAgICBvblZhbHVlQ2hhbmdlKHZhbCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNEZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5vbkZpZWxkVmFsdWVDaGFuZ2UodGhpcywgdmFsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBleHBvc2UgdmFsaWRhdGlvbiBtZXNzYWdlIGFuZCBzZXQgY29udHJvbCB0byBpbnZhbGlkXG4gICAgc2V0VmFsaWRhdGlvbk1lc3NhZ2UodmFsKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0aW9ubWVzc2FnZSA9IHZhbDtcbiAgICAgICAgICAgIHRoaXMuc2V0VXBWYWxpZGF0b3JzKGN1c3RvbVZhbGlkYXRvckZuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2V0UmVhZE9ubHlTdGF0ZSgpIHtcbiAgICAgICAgbGV0IHJlYWRPbmx5O1xuICAgICAgICBpZiAodGhpcy5mb3JtLmlzVXBkYXRlTW9kZSkge1xuICAgICAgICAgICAgaWYgKHRoaXNbJ3ByaW1hcnkta2V5J10gJiYgIXRoaXNbJ2lzLXJlbGF0ZWQnXSAmJiAhdGhpcy5wZXJpb2QpIHtcbiAgICAgICAgICAgICAgICAvKklmIHRoZSBmaWVsZCBpcyBwcmltYXJ5IGJ1dCBpcyBhc3NpZ25lZCBzZXQgcmVhZG9ubHkgZmFsc2UuXG4gICAgICAgICAgICAgICAgICAgQXNzaWduZWQgaXMgd2hlcmUgdGhlIHVzZXIgaW5wdXRzIHRoZSB2YWx1ZSB3aGlsZSBhIG5ldyBlbnRyeS5cbiAgICAgICAgICAgICAgICAgICBUaGlzIGlzIG5vdCBlZGl0YWJsZShpbiB1cGRhdGUgbW9kZSkgb25jZSBlbnRyeSBpcyBzdWNjZXNzZnVsKi9cbiAgICAgICAgICAgICAgICByZWFkT25seSA9ICEodGhpcy5nZW5lcmF0b3IgPT09ICdhc3NpZ25lZCcgJiYgdGhpcy5mb3JtLm9wZXJhdGlvblR5cGUgIT09ICd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVhZE9ubHkgPSB0aGlzLnJlYWRvbmx5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSW4gdmlldyBtb2RlLCBzZXQgd2lkZ2V0IHN0YXRlIHRvIHJlYWRvbmx5IGFsd2F5c1xuICAgICAgICAgICAgcmVhZE9ubHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0Rm9ybVdpZGdldCgncmVhZG9ubHknLCByZWFkT25seSk7XG4gICAgfVxuXG4gICAgcmVzZXREaXNwbGF5SW5wdXQoKSB7XG4gICAgICAgIGlmICgoIWlzRGVmaW5lZCh0aGlzLnZhbHVlKSB8fCB0aGlzLnZhbHVlID09PSAnJykpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybVdpZGdldCAmJiB0aGlzLmZvcm1XaWRnZXQucmVzZXREaXNwbGF5SW5wdXQgJiYgdGhpcy5mb3JtV2lkZ2V0LnJlc2V0RGlzcGxheUlucHV0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVXBsb2FkRXZlbnQoJGV2ZW50LCBldmVudE5hbWUpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7JGV2ZW50fTtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgIHBhcmFtcy5uZXdWYWwgPSAkZXZlbnQudGFyZ2V0LmZpbGVzO1xuICAgICAgICAgICAgcGFyYW1zLm9sZFZhbCA9IHRoaXMuX29sZFVwbG9hZFZhbDtcbiAgICAgICAgICAgIHRoaXMuX29sZFVwbG9hZFZhbCA9IHBhcmFtcy5uZXdWYWw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKGV2ZW50TmFtZSwgcGFyYW1zKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZ2lzdGVyRm9ybUZpZWxkKCkge1xuXG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHRoaXMuX2ZpZWxkTmFtZTtcblxuICAgICAgICBpZiAodGhpcy5wYXJlbnRMaXN0ICYmICEodGhpcy5mb3JtLnBhcmVudExpc3QgPT09IHRoaXMucGFyZW50TGlzdCkpIHtcbiAgICAgICAgICAgIGxldCBjb3VudGVyID0gMTtcbiAgICAgICAgICAgIGxldCBfZmllbGROYW1lID0gZmllbGROYW1lO1xuICAgICAgICAgICAgd2hpbGUgKHRoaXMubmdmb3JtLmNvbnRyb2xzLmhhc093blByb3BlcnR5KF9maWVsZE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgX2ZpZWxkTmFtZSA9IGAke2ZpZWxkTmFtZX1fJHtjb3VudGVyfWA7XG4gICAgICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5uZ2Zvcm0uYWRkQ29udHJvbChfZmllbGROYW1lLCB0aGlzLmNyZWF0ZUNvbnRyb2woKSk7XG4gICAgICAgICAgICB0aGlzLl9maWVsZE5hbWUgPSBfZmllbGROYW1lO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubmdmb3JtLmFkZENvbnRyb2woZmllbGROYW1lLCB0aGlzLmNyZWF0ZUNvbnRyb2woKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb25WYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuX2NvbnRyb2wudmFsdWVDaGFuZ2VzXG4gICAgICAgICAgICAucGlwZShkZWJvdW5jZVRpbWUoMjAwKSlcbiAgICAgICAgICAgIC5zdWJzY3JpYmUodGhpcy5vblZhbHVlQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNSYW5nZSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICB0aGlzLm5nZm9ybS5hZGRDb250cm9sKGZpZWxkTmFtZSArICdfbWF4JywgdGhpcy5jcmVhdGVDb250cm9sKCkpO1xuICAgICAgICAgICAgLy8gcmVnaXN0ZXJpbmcgZm9yIHZhbHVlQ2hhbmdlcyBvbiBNYXhmb3JtV2lkZ2V0XG4gICAgICAgICAgICBjb25zdCBvbk1heFZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uID0gdGhpcy5fbWF4Q29udHJvbC52YWx1ZUNoYW5nZXNcbiAgICAgICAgICAgICAgICAucGlwZShkZWJvdW5jZVRpbWUoMjAwKSlcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMub25WYWx1ZUNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gb25NYXhWYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gIF8uZ2V0KHRoaXMuZm9ybS5mb3JtZGF0YSwgdGhpcy5fZmllbGROYW1lKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5uZ2Zvcm0gPSB0aGlzLmZvcm0ubmdmb3JtO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRm9ybUZpZWxkKCk7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcblxuICAgICAgICBpZiAodGhpcy5mb3JtV2lkZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9pbml0UHJvcHNSZXMoKTtcblxuICAgICAgICAgICAgLy8gc2V0dGluZyBkaXNwbGF5RXhwcmVzc2lvbnMgb24gdGhlIGZvcm13aWRnZXQgZXhwbGljaXRseSBhcyBleHByIHdhcyBldmFsdWF0ZWQgdG8gXCJcIi5cbiAgICAgICAgICAgIHRoaXMuc2V0Rm9ybVdpZGdldCgnYmluZGRpc3BsYXlsYWJlbCcsIHRoaXMuYmluZGRpc3BsYXlsYWJlbCk7XG4gICAgICAgICAgICB0aGlzLnNldEZvcm1XaWRnZXQoJ2JpbmRkaXNwbGF5ZXhwcmVzc2lvbicsIHRoaXMuYmluZGRpc3BsYXlleHByZXNzaW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJSZWFkeVN0YXRlTGlzdGVuZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5rZXkgPSB0aGlzLl9maWVsZE5hbWUgfHwgdGhpcy50YXJnZXQgfHwgdGhpcy5iaW5kaW5nO1xuICAgICAgICAgICAgdGhpcy52aWV3bW9kZXdpZGdldCA9IHRoaXMudmlld21vZGV3aWRnZXQgfHwgZ2V0RGVmYXVsdFZpZXdNb2RlV2lkZ2V0KHRoaXMud2lkZ2V0dHlwZSk7XG5cbiAgICAgICAgICAgIC8vIEZvciB1cGxvYWQgd2lkZ2V0LCBnZW5lcmF0ZSB0aGUgcGVybWl0dGVkIGZpZWxkXG4gICAgICAgICAgICBpZiAodGhpcy53aWRnZXR0eXBlID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZVR5cGU7XG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIHRoZSBhY2NlcHRzIHN0cmluZyBmcm9tIGZpbGUgdHlwZSBhbmQgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgIGZpbGVUeXBlID0gdGhpcy5maWxldHlwZSA/IEZJTEVfVFlQRVNbdGhpcy5maWxldHlwZV0gOiAnJztcbiAgICAgICAgICAgICAgICB0aGlzLnBlcm1pdHRlZCA9IGZpbGVUeXBlICsgKHRoaXMuZXh0ZW5zaW9ucyA/IChmaWxlVHlwZSA/ICcsJyA6ICcnKSArIHRoaXMuZXh0ZW5zaW9ucyA6ICcnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzTW9iaWxlKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXNbJ21vYmlsZS1kaXNwbGF5J10pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzWydwYy1kaXNwbGF5J10pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuc2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIGZvcm0gZmllbGQgd2l0aCBwYXJlbnQgZm9ybVxuICAgICAgICAgICAgdGhpcy5mb3JtLnJlZ2lzdGVyRm9ybUZpZWxkcyh0aGlzLndpZGdldCk7XG5cbiAgICAgICAgICAgIGFkZEZvcklkQXR0cmlidXRlcyh0aGlzLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFJlYWRPbmx5U3RhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19