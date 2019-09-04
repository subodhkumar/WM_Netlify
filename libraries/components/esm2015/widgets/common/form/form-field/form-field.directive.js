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
const customValidatorFn = () => {
    return { custom: true };
};
const ɵ0 = customValidatorFn;
const FILE_TYPES = {
    'image': 'image/*',
    'video': 'video/*',
    'audio': 'audio/*'
};
const ɵ1 = {};
export class FormFieldDirective extends StylableComponent {
    constructor(inj, form, fb, parentList, binddataset, binddisplayexpression, binddisplaylabel, _widgetType, name, key, isRange, pcDisplay, mobileDisplay, contexts) {
        const WIDGET_CONFIG = {
            widgetType: 'wm-form-field',
            hostClass: '',
            widgetSubType: 'wm-form-field-' + (_widgetType || FormWidgetType.TEXT).trim()
        };
        super(inj, WIDGET_CONFIG, new Promise(res => this._initPropsRes = res));
        this._validators = [];
        this.class = '';
        this.binddataset = binddataset;
        this.binddisplayexpression = binddisplayexpression;
        this.binddisplaylabel = binddisplaylabel;
        this.form = form;
        this.fb = fb;
        this._fieldName = key || name;
        this.isRange = isRange;
        this.excludeProps = new Set(['type', 'name']);
        this.widgettype = _widgetType;
        this.parentList = parentList;
        if (this.binddataset || this.$element.attr('dataset')) {
            this.isDataSetBound = true;
        }
        contexts[0]._onFocusField = this._onFocusField.bind(this);
        contexts[0]._onBlurField = this._onBlurField.bind(this);
        this._debounceSetUpValidators = debounce(() => this.setUpValidators(), 500);
    }
    _onFocusField($evt) {
        $($evt.target).closest('.live-field').addClass('active');
    }
    _onBlurField($evt) {
        $($evt.target).closest('.live-field').removeClass('active');
        this.setUpValidators();
    }
    // Expression to be evaluated in view mode of form field
    evaluateExpr(object, displayExpr) {
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
    }
    // Expression to be evaluated in view mode of form field
    getDisplayExpr() {
        const caption = [];
        const value = this.value;
        const displayExpr = this.displayexpression || this.displayfield || this.displaylabel;
        if (_.isObject(value)) {
            if (_.isArray(value)) {
                _.forEach(value, obj => {
                    if (_.isObject(obj)) {
                        caption.push(this.evaluateExpr(obj, displayExpr));
                    }
                });
            }
            else {
                caption.push(this.evaluateExpr(value, displayExpr));
            }
            return _.join(caption, ',');
        }
        return (value === undefined || value === null) ? '' : this.value;
    }
    getCaption() {
        return (this.value === undefined || this.value === null) ? (_.get(this.form.dataoutput, this._fieldName) || '') : this.value;
    }
    // Method to setup validators for reactive form control
    setUpValidators(customValidator) {
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
            const opt = {};
            // updating the value only when prevData is not equal to current value.
            // emitEvent flag will prevent from emitting the valueChanges when value is equal to the prevDatavalue.
            if (this.value === this.formWidget.prevDatavalue) {
                opt['emitEvent'] = false;
            }
            this._control.updateValueAndValidity(opt);
        }
    }
    // Method to set the properties on inner form widget
    setFormWidget(key, val) {
        if (this.formWidget && this.formWidget.widget) {
            this.formWidget.widget[key] = val;
        }
    }
    // Method to set the properties on inner max form widget (when range is selected)
    setMaxFormWidget(key, val) {
        if (this.formWidgetMax) {
            this.formWidgetMax.widget[key] = val;
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key !== 'tabindex') {
            super.onPropertyChange(key, nv, ov);
        }
        if (this.excludeProps.has(key)) {
            return;
        }
        // As upload widget is an HTML widget, only required property is setup
        if (this.widgettype === FormWidgetType.UPLOAD) {
            if (key === 'required') {
                this._debounceSetUpValidators();
            }
            super.onPropertyChange(key, nv, ov);
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
    }
    onStyleChange(key, nv, ov) {
        this.setFormWidget(key, nv);
        this.setMaxFormWidget(key, nv);
        super.onStyleChange(key, nv, ov);
    }
    get datavalue() {
        return this.formWidget && this.formWidget.datavalue;
    }
    set datavalue(val) {
        if (this._control && this.widgettype !== FormWidgetType.UPLOAD) {
            this._control.setValue(val);
        }
    }
    get value() {
        return this.datavalue;
    }
    set value(val) {
        this.datavalue = val;
    }
    get maxValue() {
        return this.formWidgetMax && this.formWidgetMax.datavalue;
    }
    set maxValue(val) {
        if (this._maxControl) {
            this._maxControl.setValue(val);
        }
    }
    get minValue() {
        return this.value;
    }
    set minValue(val) {
        this.value = val;
    }
    // Get the reactive form control
    get _control() {
        return this.ngform && this.ngform.controls[this._fieldName];
    }
    // Get the reactive max form control
    get _maxControl() {
        return this.ngform && this.ngform.controls[this._fieldName + '_max'];
    }
    // Create the reactive form control
    createControl() {
        return this.fb.control(undefined, {
            validators: this._validators
        });
    }
    // On field value change, propagate event to parent form
    onValueChange(val) {
        if (!this.isDestroyed) {
            this.form.onFieldValueChange(this, val);
        }
    }
    // Method to expose validation message and set control to invalid
    setValidationMessage(val) {
        setTimeout(() => {
            this.validationmessage = val;
            this.setUpValidators(customValidatorFn);
        });
    }
    setReadOnlyState() {
        let readOnly;
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
    }
    resetDisplayInput() {
        if ((!isDefined(this.value) || this.value === '')) {
            this.formWidget && this.formWidget.resetDisplayInput && this.formWidget.resetDisplayInput();
        }
    }
    triggerUploadEvent($event, eventName) {
        const params = { $event };
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this._oldUploadVal;
            this._oldUploadVal = params.newVal;
        }
        this.invokeEventCallback(eventName, params);
    }
    registerFormField() {
        const fieldName = this._fieldName;
        if (this.parentList && !(this.form.parentList === this.parentList)) {
            let counter = 1;
            let _fieldName = fieldName;
            while (this.ngform.controls.hasOwnProperty(_fieldName)) {
                _fieldName = `${fieldName}_${counter}`;
                counter++;
            }
            this.ngform.addControl(_fieldName, this.createControl());
            this._fieldName = _fieldName;
        }
        else {
            this.ngform.addControl(fieldName, this.createControl());
        }
        const onValueChangeSubscription = this._control.valueChanges
            .pipe(debounceTime(200))
            .subscribe(this.onValueChange.bind(this));
        this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
        if (this.isRange === 'true') {
            this.ngform.addControl(fieldName + '_max', this.createControl());
            // registering for valueChanges on MaxformWidget
            const onMaxValueChangeSubscription = this._maxControl.valueChanges
                .pipe(debounceTime(200))
                .subscribe(this.onValueChange.bind(this));
            this.registerDestroyListener(() => onMaxValueChangeSubscription.unsubscribe());
        }
        this.value = _.get(this.form.formdata, this._fieldName);
    }
    ngOnInit() {
        this.ngform = this.form.ngform;
        this.registerFormField();
        super.ngOnInit();
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        if (this.formWidget) {
            this._initPropsRes();
            // setting displayExpressions on the formwidget explicitly as expr was evaluated to "".
            this.setFormWidget('binddisplaylabel', this.binddisplaylabel);
            this.setFormWidget('binddisplayexpression', this.binddisplayexpression);
        }
        this.registerReadyStateListener(() => {
            this.key = this._fieldName || this.target || this.binding;
            this.viewmodewidget = this.viewmodewidget || getDefaultViewModeWidget(this.widgettype);
            // For upload widget, generate the permitted field
            if (this.widgettype === FormWidgetType.UPLOAD) {
                let fileType;
                // Create the accepts string from file type and extensions
                fileType = this.filetype ? FILE_TYPES[this.filetype] : '';
                this.permitted = fileType + (this.extensions ? (fileType ? ',' : '') + this.extensions : '');
            }
            if (isMobile()) {
                if (!this['mobile-display']) {
                    this.widget.show = false;
                }
            }
            else {
                if (!this['pc-display']) {
                    this.widget.show = false;
                }
            }
            // Register the form field with parent form
            this.form.registerFormFields(this.widget);
            addForIdAttributes(this.nativeElement);
            this.setReadOnlyState();
        });
    }
}
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
FormFieldDirective.ctorParameters = () => [
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
];
FormFieldDirective.propDecorators = {
    formWidget: [{ type: ContentChild, args: ['formWidget',] }],
    formWidgetMax: [{ type: ContentChild, args: ['formWidgetMax',] }]
};
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Zvcm0vZm9ybS1maWVsZC9mb3JtLWZpZWxkLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1CLFNBQVMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLElBQUksRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3SCxPQUFPLEVBQUUsV0FBVyxFQUFhLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXBFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU5QyxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTdGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNoSCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkxRCxvRkFBb0Y7QUFDcEYsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7SUFDM0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QixDQUFDLENBQUM7O0FBRUYsTUFBTSxV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QVE7WUFXckUsYUFBYTtZQVZiLFdBQVc7WUFZWCxhQUFhLHVCQWtGYixRQUFROzRDQUNSLFNBQVMsU0FBQyxjQUFjO3lDQUN4QixTQUFTLFNBQUMsd0JBQXdCO3lDQUNsQyxTQUFTLFNBQUMsbUJBQW1COzRDQUM3QixTQUFTLFNBQUMsWUFBWTs0Q0FDdEIsU0FBUyxTQUFDLE1BQU07NENBQ2hCLFNBQVMsU0FBQyxLQUFLOzRDQUNmLFNBQVMsU0FBQyxVQUFVOzRDQUNwQixTQUFTLFNBQUMsWUFBWTs0Q0FDdEIsU0FBUyxTQUFDLGdCQUFnQjtZQUNRLEtBQUssdUJBQXZDLElBQUksWUFBSSxNQUFNLFNBQUMsT0FBTzs7O3lCQWpFMUIsWUFBWSxTQUFDLFlBQVk7NEJBQ3pCLFlBQVksU0FBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBZnRlckNvbnRlbnRJbml0LCBBdHRyaWJ1dGUsIENvbnRlbnRDaGlsZCwgRGlyZWN0aXZlLCBJbmplY3QsIEluamVjdG9yLCBPbkluaXQsIE9wdGlvbmFsLCBTZWxmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZvcm1CdWlsZGVyLCBGb3JtR3JvdXAsIFZhbGlkYXRvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgZGVib3VuY2UsIEZvcm1XaWRnZXRUeXBlLCBpc0RlZmluZWQsIGlzTW9iaWxlLCBhZGRGb3JJZEF0dHJpYnV0ZXMgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2Zvcm0tZmllbGQucHJvcHMnO1xuaW1wb3J0IHsgZ2V0RXZhbHVhdGVkRGF0YSwgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgZ2V0RGVmYXVsdFZpZXdNb2RlV2lkZ2V0IH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IEZvcm1Db21wb25lbnQgfSBmcm9tICcuLi9mb3JtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IExpc3RDb21wb25lbnQgfSBmcm9tICcuLi8uLi9saXN0L2xpc3QuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG4vLyBDdXN0b20gdmFsaWRhdG9yIHRvIHNob3cgdmFsaWRhdGlvbiBlcnJvciwgaWYgc2V0VmFsaWRhdGlvbk1lc3NhZ2UgbWV0aG9kIGlzIHVzZWRcbmNvbnN0IGN1c3RvbVZhbGlkYXRvckZuID0gKCkgPT4ge1xuICAgIHJldHVybiB7IGN1c3RvbTogdHJ1ZSB9O1xufTtcblxuY29uc3QgRklMRV9UWVBFUyA9IHtcbiAgICAnaW1hZ2UnIDogJ2ltYWdlLyonLFxuICAgICd2aWRlbycgOiAndmlkZW8vKicsXG4gICAgJ2F1ZGlvJyA6ICdhdWRpby8qJ1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21Gb3JtRmllbGRdJyxcbiAgICBleHBvcnRBczogJ3dtRm9ybUZpZWxkJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEZvcm1GaWVsZERpcmVjdGl2ZSksXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihGb3JtRmllbGREaXJlY3RpdmUpLFxuICAgICAgICB7cHJvdmlkZTogQ29udGV4dCwgdXNlVmFsdWU6IHt9LCBtdWx0aTogdHJ1ZX1cbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEZvcm1GaWVsZERpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlckNvbnRlbnRJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQENvbnRlbnRDaGlsZCgnZm9ybVdpZGdldCcpIGZvcm1XaWRnZXQ7XG4gICAgQENvbnRlbnRDaGlsZCgnZm9ybVdpZGdldE1heCcpIGZvcm1XaWRnZXRNYXg7XG5cbiAgICBwcml2YXRlIGZiO1xuICAgIC8vIGV4Y2x1ZGVQcm9wcyBpcyB1c2VkIHRvIHN0b3JlIHRoZSBwcm9wcyB0aGF0IHNob3VsZCBub3QgYmUgYXBwbGllZCBvbiBpbm5lciB3aWRnZXRcbiAgICBwcml2YXRlIGV4Y2x1ZGVQcm9wcztcbiAgICBwcml2YXRlIF92YWxpZGF0b3JzO1xuICAgIHByaXZhdGUgX29sZFVwbG9hZFZhbDtcblxuICAgIG5nZm9ybTogRm9ybUdyb3VwO1xuICAgIGRlZmF1bHR2YWx1ZTtcbiAgICBkaXNwbGF5ZXhwcmVzc2lvbjtcbiAgICBkaXNwbGF5ZmllbGQ7XG4gICAgZGlzcGxheWxhYmVsO1xuICAgIGRpc3BsYXluYW1lO1xuICAgIGdlbmVyYXRvcjtcbiAgICBrZXk7XG4gICAgdGFyZ2V0O1xuICAgIGJpbmRpbmc7XG4gICAgd2lkZ2V0dHlwZTtcbiAgICBjbGFzcztcbiAgICByZWFkb25seTtcbiAgICBzaG93O1xuICAgIHR5cGU7XG4gICAgaXNEYXRhU2V0Qm91bmQ7XG4gICAgdmlld21vZGV3aWRnZXQ7XG4gICAgYmluZGRhdGFzZXQ7XG4gICAgYmluZGRpc3BsYXlleHByZXNzaW9uO1xuICAgIGJpbmRkaXNwbGF5bGFiZWw7XG4gICAgZm9ybTtcbiAgICBmaWxldHlwZTtcbiAgICBleHRlbnNpb25zO1xuICAgIHBlcm1pdHRlZDtcbiAgICBwZXJpb2Q7XG4gICAgaXNSYW5nZTtcbiAgICBuYW1lO1xuXG4gICAgLy8gVmFsaWRhdGlvbiBwcm9wZXJ0aWVzXG4gICAgcmVxdWlyZWQ7XG4gICAgbWF4Y2hhcnM7XG4gICAgbWludmFsdWU7XG4gICAgbWF4dmFsdWU7XG4gICAgcmVnZXhwO1xuICAgIHZhbGlkYXRpb25tZXNzYWdlO1xuXG4gICAgcHVibGljIF9maWVsZE5hbWU7XG5cbiAgICBwcml2YXRlIF9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycztcbiAgICBwcml2YXRlIF9pbml0UHJvcHNSZXM7XG4gICAgcHJpdmF0ZSBwYXJlbnRMaXN0O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIGZvcm06IEZvcm1Db21wb25lbnQsXG4gICAgICAgIGZiOiBGb3JtQnVpbGRlcixcbiAgICAgICAgQE9wdGlvbmFsKCkgcGFyZW50TGlzdDogTGlzdENvbXBvbmVudCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJykgYmluZGRhdGFzZXQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2Rpc3BsYXlleHByZXNzaW9uLmJpbmQnKSBiaW5kZGlzcGxheWV4cHJlc3Npb246IHN0cmluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGlzcGxheWxhYmVsLmJpbmQnKSBiaW5kZGlzcGxheWxhYmVsOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3dpZGdldHR5cGUnKSBfd2lkZ2V0VHlwZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWUsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2tleScpIGtleSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnaXMtcmFuZ2UnKSBpc1JhbmdlLFxuICAgICAgICBAQXR0cmlidXRlKCdwYy1kaXNwbGF5JykgcGNEaXNwbGF5LFxuICAgICAgICBAQXR0cmlidXRlKCdtb2JpbGUtZGlzcGxheScpIG1vYmlsZURpc3BsYXksXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChDb250ZXh0KSBjb250ZXh0czogQXJyYXk8YW55PlxuICAgICkge1xuXG4gICAgICAgIGNvbnN0IFdJREdFVF9DT05GSUcgPSB7XG4gICAgICAgICAgICB3aWRnZXRUeXBlOiAnd20tZm9ybS1maWVsZCcsXG4gICAgICAgICAgICBob3N0Q2xhc3M6ICcnLFxuICAgICAgICAgICAgd2lkZ2V0U3ViVHlwZTogJ3dtLWZvcm0tZmllbGQtJyArIChfd2lkZ2V0VHlwZSB8fCBGb3JtV2lkZ2V0VHlwZS5URVhUKS50cmltKClcbiAgICAgICAgfTtcblxuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcsIG5ldyBQcm9taXNlKHJlcyA9PiB0aGlzLl9pbml0UHJvcHNSZXMgPSByZXMpKTtcblxuICAgICAgICB0aGlzLl92YWxpZGF0b3JzID0gW107XG4gICAgICAgIHRoaXMuY2xhc3MgPSAnJztcbiAgICAgICAgdGhpcy5iaW5kZGF0YXNldCA9IGJpbmRkYXRhc2V0O1xuICAgICAgICB0aGlzLmJpbmRkaXNwbGF5ZXhwcmVzc2lvbiA9IGJpbmRkaXNwbGF5ZXhwcmVzc2lvbjtcbiAgICAgICAgdGhpcy5iaW5kZGlzcGxheWxhYmVsID0gYmluZGRpc3BsYXlsYWJlbDtcbiAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcbiAgICAgICAgdGhpcy5mYiA9IGZiO1xuICAgICAgICB0aGlzLl9maWVsZE5hbWUgPSBrZXkgfHwgbmFtZTtcbiAgICAgICAgdGhpcy5pc1JhbmdlID0gaXNSYW5nZTtcbiAgICAgICAgdGhpcy5leGNsdWRlUHJvcHMgPSBuZXcgU2V0KFsndHlwZScsICduYW1lJ10pO1xuICAgICAgICB0aGlzLndpZGdldHR5cGUgPSBfd2lkZ2V0VHlwZTtcbiAgICAgICAgdGhpcy5wYXJlbnRMaXN0ID0gcGFyZW50TGlzdDtcblxuICAgICAgICBpZiAodGhpcy5iaW5kZGF0YXNldCB8fCB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGFzZXQnKSkge1xuICAgICAgICAgICAgdGhpcy5pc0RhdGFTZXRCb3VuZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0c1swXS5fb25Gb2N1c0ZpZWxkID0gdGhpcy5fb25Gb2N1c0ZpZWxkLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnRleHRzWzBdLl9vbkJsdXJGaWVsZCA9IHRoaXMuX29uQmx1ckZpZWxkLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRVcFZhbGlkYXRvcnMgPSBkZWJvdW5jZSgoKSA9PiB0aGlzLnNldFVwVmFsaWRhdG9ycygpLCA1MDApO1xuICAgIH1cblxuICAgIF9vbkZvY3VzRmllbGQoJGV2dCkge1xuICAgICAgICAkKCRldnQudGFyZ2V0KS5jbG9zZXN0KCcubGl2ZS1maWVsZCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICB9XG5cbiAgICBfb25CbHVyRmllbGQoJGV2dCkge1xuICAgICAgICAkKCRldnQudGFyZ2V0KS5jbG9zZXN0KCcubGl2ZS1maWVsZCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgdGhpcy5zZXRVcFZhbGlkYXRvcnMoKTtcbiAgICB9XG5cbiAgICAvLyBFeHByZXNzaW9uIHRvIGJlIGV2YWx1YXRlZCBpbiB2aWV3IG1vZGUgb2YgZm9ybSBmaWVsZFxuICAgIGV2YWx1YXRlRXhwcihvYmplY3QsIGRpc3BsYXlFeHByKSB7XG4gICAgICAgIGlmICghZGlzcGxheUV4cHIpIHtcbiAgICAgICAgICAgIGRpc3BsYXlFeHByID0gT2JqZWN0LmtleXMob2JqZWN0KVswXTtcbiAgICAgICAgICAgIC8vIElmIGRhdGFzZXQgaXMgbm90IHJlYWR5LCBkaXNwbGF5IGV4cHJlc3Npb24gd2lsbCBub3QgYmUgZGVmaW5lZFxuICAgICAgICAgICAgaWYgKCFkaXNwbGF5RXhwcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0RXZhbHVhdGVkRGF0YShvYmplY3QsIHtcbiAgICAgICAgICAgIGV4cHJlc3Npb246IGRpc3BsYXlFeHByXG4gICAgICAgIH0sIHRoaXMudmlld1BhcmVudCk7XG4gICAgfVxuXG4gICAgLy8gRXhwcmVzc2lvbiB0byBiZSBldmFsdWF0ZWQgaW4gdmlldyBtb2RlIG9mIGZvcm0gZmllbGRcbiAgICBnZXREaXNwbGF5RXhwcigpIHtcbiAgICAgICAgY29uc3QgY2FwdGlvbiA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlFeHByID0gdGhpcy5kaXNwbGF5ZXhwcmVzc2lvbiB8fCB0aGlzLmRpc3BsYXlmaWVsZCB8fCB0aGlzLmRpc3BsYXlsYWJlbDtcbiAgICAgICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaCh2YWx1ZSwgb2JqID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNPYmplY3Qob2JqKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdGlvbi5wdXNoKHRoaXMuZXZhbHVhdGVFeHByKG9iaiwgZGlzcGxheUV4cHIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYXB0aW9uLnB1c2godGhpcy5ldmFsdWF0ZUV4cHIodmFsdWUsIGRpc3BsYXlFeHByKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gXy5qb2luKGNhcHRpb24sICcsJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSA/ICcnIDogdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBnZXRDYXB0aW9uKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWUgPT09IHVuZGVmaW5lZCB8fCB0aGlzLnZhbHVlID09PSBudWxsKSA/IChfLmdldCh0aGlzLmZvcm0uZGF0YW91dHB1dCwgdGhpcy5fZmllbGROYW1lKSB8fCAnJykgOiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBzZXR1cCB2YWxpZGF0b3JzIGZvciByZWFjdGl2ZSBmb3JtIGNvbnRyb2xcbiAgICBwcml2YXRlIHNldFVwVmFsaWRhdG9ycyhjdXN0b21WYWxpZGF0b3I/KSB7XG4gICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMgPSBbXTtcblxuICAgICAgICBpZiAodGhpcy5yZXF1aXJlZCAmJiB0aGlzLnNob3cgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBGb3IgY2hlY2tib3gvdG9nZ2xlIHdpZGdldCwgcmVxdWlyZWQgdmFsaWRhdGlvbiBzaG91bGQgY29uc2lkZXIgdHJ1ZSB2YWx1ZSBvbmx5XG4gICAgICAgICAgICBpZiAodGhpcy53aWRnZXR0eXBlID09PSBGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWCB8fCB0aGlzLndpZGdldHR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlRPR0dMRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnJlcXVpcmVkVHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnJlcXVpcmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tYXhjaGFycykge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWF4TGVuZ3RoKHRoaXMubWF4Y2hhcnMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5taW52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWluKHRoaXMubWludmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tYXh2YWx1ZSAmJiB0aGlzLndpZGdldHR5cGUgIT09IEZvcm1XaWRnZXRUeXBlLlJBVElORykge1xuICAgICAgICAgICAgdGhpcy5fdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWF4KHRoaXMubWF4dmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWdleHApIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnBhdHRlcm4odGhpcy5yZWdleHApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMuZm9ybVdpZGdldC52YWxpZGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbGlkYXRvcnMucHVzaCh0aGlzLmZvcm1XaWRnZXQudmFsaWRhdGUuYmluZCh0aGlzLmZvcm1XaWRnZXQpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3VzdG9tVmFsaWRhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLl92YWxpZGF0b3JzLnB1c2goY3VzdG9tVmFsaWRhdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5nZm9ybSkge1xuICAgICAgICAgICAgdGhpcy5fY29udHJvbC5zZXRWYWxpZGF0b3JzKHRoaXMuX3ZhbGlkYXRvcnMpO1xuICAgICAgICAgICAgY29uc3Qgb3B0ID0ge307XG4gICAgICAgICAgICAvLyB1cGRhdGluZyB0aGUgdmFsdWUgb25seSB3aGVuIHByZXZEYXRhIGlzIG5vdCBlcXVhbCB0byBjdXJyZW50IHZhbHVlLlxuICAgICAgICAgICAgLy8gZW1pdEV2ZW50IGZsYWcgd2lsbCBwcmV2ZW50IGZyb20gZW1pdHRpbmcgdGhlIHZhbHVlQ2hhbmdlcyB3aGVuIHZhbHVlIGlzIGVxdWFsIHRvIHRoZSBwcmV2RGF0YXZhbHVlLlxuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUgPT09IHRoaXMuZm9ybVdpZGdldC5wcmV2RGF0YXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb3B0WydlbWl0RXZlbnQnXSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KG9wdCk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBzZXQgdGhlIHByb3BlcnRpZXMgb24gaW5uZXIgZm9ybSB3aWRnZXRcbiAgICBzZXRGb3JtV2lkZ2V0KGtleSwgdmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1XaWRnZXQgJiYgdGhpcy5mb3JtV2lkZ2V0LndpZGdldCkge1xuICAgICAgICAgICAgdGhpcy5mb3JtV2lkZ2V0LndpZGdldFtrZXldID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIHRvIHNldCB0aGUgcHJvcGVydGllcyBvbiBpbm5lciBtYXggZm9ybSB3aWRnZXQgKHdoZW4gcmFuZ2UgaXMgc2VsZWN0ZWQpXG4gICAgc2V0TWF4Rm9ybVdpZGdldChrZXksIHZhbCkge1xuICAgICAgICBpZiAodGhpcy5mb3JtV2lkZ2V0TWF4KSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1XaWRnZXRNYXgud2lkZ2V0W2tleV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ICE9PSAndGFiaW5kZXgnKSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmV4Y2x1ZGVQcm9wcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXMgdXBsb2FkIHdpZGdldCBpcyBhbiBIVE1MIHdpZGdldCwgb25seSByZXF1aXJlZCBwcm9wZXJ0eSBpcyBzZXR1cFxuICAgICAgICBpZiAodGhpcy53aWRnZXR0eXBlID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdyZXF1aXJlZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldEZvcm1XaWRnZXQoa2V5LCBudik7XG5cbiAgICAgICAgLy8gUGxhY2Vob2xkZXIgc2hvdWxkIG5vdCBiZSBzZXR1cCBvbiBtYXggd2lkZ2V0XG4gICAgICAgIGlmIChrZXkgIT09ICdwbGFjZWhvbGRlcicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWF4Rm9ybVdpZGdldChrZXksIG52KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdkZWZhdWx0dmFsdWUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5vbkZpZWxkRGVmYXVsdFZhbHVlQ2hhbmdlKHRoaXMsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21heGRlZmF1bHR2YWx1ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5tYXhWYWx1ZSA9IG52O1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0TWF4Rm9ybVdpZGdldCgnZGF0YXZhbHVlJywgbnYpO1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5vbk1heERlZmF1bHRWYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbWF4cGxhY2Vob2xkZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0TWF4Rm9ybVdpZGdldCgncGxhY2Vob2xkZXInLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXF1aXJlZCc6XG4gICAgICAgICAgICBjYXNlICdtYXhjaGFycyc6XG4gICAgICAgICAgICBjYXNlICdtaW52YWx1ZSc6XG4gICAgICAgICAgICBjYXNlICdtYXh2YWx1ZSc6XG4gICAgICAgICAgICBjYXNlICdyZWdleHAnOlxuICAgICAgICAgICAgY2FzZSAnc2hvdyc6XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRVcFZhbGlkYXRvcnMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3ByaW1hcnkta2V5JzpcbiAgICAgICAgICAgICAgICBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtLnNldFByaW1hcnlLZXkodGhpcy5fZmllbGROYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5LW5hbWUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheW5hbWUgPSBudjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlYWRvbmx5JzpcbiAgICAgICAgICAgICAgIHRoaXMuc2V0UmVhZE9ubHlTdGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgdGhpcy5zZXRGb3JtV2lkZ2V0KGtleSwgbnYpO1xuICAgICAgICB0aGlzLnNldE1heEZvcm1XaWRnZXQoa2V5LCBudik7XG4gICAgICAgIHN1cGVyLm9uU3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cblxuICAgIGdldCBkYXRhdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1XaWRnZXQgJiYgdGhpcy5mb3JtV2lkZ2V0LmRhdGF2YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YXZhbHVlKHZhbCkge1xuICAgICAgICBpZiAodGhpcy5fY29udHJvbCAmJiB0aGlzLndpZGdldHR5cGUgIT09IEZvcm1XaWRnZXRUeXBlLlVQTE9BRCkge1xuICAgICAgICAgICAgdGhpcy5fY29udHJvbC5zZXRWYWx1ZSh2YWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhdmFsdWU7XG4gICAgfVxuXG4gICAgc2V0IHZhbHVlKHZhbCkge1xuICAgICAgICB0aGlzLmRhdGF2YWx1ZSA9IHZhbDtcbiAgICB9XG5cbiAgICBnZXQgbWF4VmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1XaWRnZXRNYXggJiYgdGhpcy5mb3JtV2lkZ2V0TWF4LmRhdGF2YWx1ZTtcbiAgICB9XG5cbiAgICBzZXQgbWF4VmFsdWUodmFsKSB7XG4gICAgICAgIGlmICh0aGlzLl9tYXhDb250cm9sKSB7XG4gICAgICAgICAgICB0aGlzLl9tYXhDb250cm9sLnNldFZhbHVlKHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgbWluVmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIHNldCBtaW5WYWx1ZSh2YWwpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbDtcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIHJlYWN0aXZlIGZvcm0gY29udHJvbFxuICAgIGdldCBfY29udHJvbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubmdmb3JtICYmIHRoaXMubmdmb3JtLmNvbnRyb2xzW3RoaXMuX2ZpZWxkTmFtZV07XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSByZWFjdGl2ZSBtYXggZm9ybSBjb250cm9sXG4gICAgZ2V0IF9tYXhDb250cm9sKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0gJiYgdGhpcy5uZ2Zvcm0uY29udHJvbHNbdGhpcy5fZmllbGROYW1lICsgJ19tYXgnXTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHJlYWN0aXZlIGZvcm0gY29udHJvbFxuICAgIGNyZWF0ZUNvbnRyb2woKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZiLmNvbnRyb2wodW5kZWZpbmVkLCB7XG4gICAgICAgICAgICB2YWxpZGF0b3JzOiB0aGlzLl92YWxpZGF0b3JzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE9uIGZpZWxkIHZhbHVlIGNoYW5nZSwgcHJvcGFnYXRlIGV2ZW50IHRvIHBhcmVudCBmb3JtXG4gICAgb25WYWx1ZUNoYW5nZSh2YWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm0ub25GaWVsZFZhbHVlQ2hhbmdlKHRoaXMsIHZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gZXhwb3NlIHZhbGlkYXRpb24gbWVzc2FnZSBhbmQgc2V0IGNvbnRyb2wgdG8gaW52YWxpZFxuICAgIHNldFZhbGlkYXRpb25NZXNzYWdlKHZhbCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGlvbm1lc3NhZ2UgPSB2YWw7XG4gICAgICAgICAgICB0aGlzLnNldFVwVmFsaWRhdG9ycyhjdXN0b21WYWxpZGF0b3JGbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNldFJlYWRPbmx5U3RhdGUoKSB7XG4gICAgICAgIGxldCByZWFkT25seTtcbiAgICAgICAgaWYgKHRoaXMuZm9ybS5pc1VwZGF0ZU1vZGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzWydwcmltYXJ5LWtleSddICYmICF0aGlzWydpcy1yZWxhdGVkJ10gJiYgIXRoaXMucGVyaW9kKSB7XG4gICAgICAgICAgICAgICAgLypJZiB0aGUgZmllbGQgaXMgcHJpbWFyeSBidXQgaXMgYXNzaWduZWQgc2V0IHJlYWRvbmx5IGZhbHNlLlxuICAgICAgICAgICAgICAgICAgIEFzc2lnbmVkIGlzIHdoZXJlIHRoZSB1c2VyIGlucHV0cyB0aGUgdmFsdWUgd2hpbGUgYSBuZXcgZW50cnkuXG4gICAgICAgICAgICAgICAgICAgVGhpcyBpcyBub3QgZWRpdGFibGUoaW4gdXBkYXRlIG1vZGUpIG9uY2UgZW50cnkgaXMgc3VjY2Vzc2Z1bCovXG4gICAgICAgICAgICAgICAgcmVhZE9ubHkgPSAhKHRoaXMuZ2VuZXJhdG9yID09PSAnYXNzaWduZWQnICYmIHRoaXMuZm9ybS5vcGVyYXRpb25UeXBlICE9PSAndXBkYXRlJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlYWRPbmx5ID0gdGhpcy5yZWFkb25seTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEluIHZpZXcgbW9kZSwgc2V0IHdpZGdldCBzdGF0ZSB0byByZWFkb25seSBhbHdheXNcbiAgICAgICAgICAgIHJlYWRPbmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEZvcm1XaWRnZXQoJ3JlYWRvbmx5JywgcmVhZE9ubHkpO1xuICAgIH1cblxuICAgIHJlc2V0RGlzcGxheUlucHV0KCkge1xuICAgICAgICBpZiAoKCFpc0RlZmluZWQodGhpcy52YWx1ZSkgfHwgdGhpcy52YWx1ZSA9PT0gJycpKSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1XaWRnZXQgJiYgdGhpcy5mb3JtV2lkZ2V0LnJlc2V0RGlzcGxheUlucHV0ICYmIHRoaXMuZm9ybVdpZGdldC5yZXNldERpc3BsYXlJbnB1dCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlclVwbG9hZEV2ZW50KCRldmVudCwgZXZlbnROYW1lKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtczogYW55ID0geyRldmVudH07XG4gICAgICAgIGlmIChldmVudE5hbWUgPT09ICdjaGFuZ2UnKSB7XG4gICAgICAgICAgICBwYXJhbXMubmV3VmFsID0gJGV2ZW50LnRhcmdldC5maWxlcztcbiAgICAgICAgICAgIHBhcmFtcy5vbGRWYWwgPSB0aGlzLl9vbGRVcGxvYWRWYWw7XG4gICAgICAgICAgICB0aGlzLl9vbGRVcGxvYWRWYWwgPSBwYXJhbXMubmV3VmFsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjayhldmVudE5hbWUsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlckZvcm1GaWVsZCgpIHtcblxuICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSB0aGlzLl9maWVsZE5hbWU7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyZW50TGlzdCAmJiAhKHRoaXMuZm9ybS5wYXJlbnRMaXN0ID09PSB0aGlzLnBhcmVudExpc3QpKSB7XG4gICAgICAgICAgICBsZXQgY291bnRlciA9IDE7XG4gICAgICAgICAgICBsZXQgX2ZpZWxkTmFtZSA9IGZpZWxkTmFtZTtcbiAgICAgICAgICAgIHdoaWxlICh0aGlzLm5nZm9ybS5jb250cm9scy5oYXNPd25Qcm9wZXJ0eShfZmllbGROYW1lKSkge1xuICAgICAgICAgICAgICAgIF9maWVsZE5hbWUgPSBgJHtmaWVsZE5hbWV9XyR7Y291bnRlcn1gO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubmdmb3JtLmFkZENvbnRyb2woX2ZpZWxkTmFtZSwgdGhpcy5jcmVhdGVDb250cm9sKCkpO1xuICAgICAgICAgICAgdGhpcy5fZmllbGROYW1lID0gX2ZpZWxkTmFtZTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm5nZm9ybS5hZGRDb250cm9sKGZpZWxkTmFtZSwgdGhpcy5jcmVhdGVDb250cm9sKCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24gPSB0aGlzLl9jb250cm9sLnZhbHVlQ2hhbmdlc1xuICAgICAgICAgICAgLnBpcGUoZGVib3VuY2VUaW1lKDIwMCkpXG4gICAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMub25WYWx1ZUNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBvblZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgIGlmICh0aGlzLmlzUmFuZ2UgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgdGhpcy5uZ2Zvcm0uYWRkQ29udHJvbChmaWVsZE5hbWUgKyAnX21heCcsIHRoaXMuY3JlYXRlQ29udHJvbCgpKTtcbiAgICAgICAgICAgIC8vIHJlZ2lzdGVyaW5nIGZvciB2YWx1ZUNoYW5nZXMgb24gTWF4Zm9ybVdpZGdldFxuICAgICAgICAgICAgY29uc3Qgb25NYXhWYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuX21heENvbnRyb2wudmFsdWVDaGFuZ2VzXG4gICAgICAgICAgICAgICAgLnBpcGUoZGVib3VuY2VUaW1lKDIwMCkpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSh0aGlzLm9uVmFsdWVDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IG9uTWF4VmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52YWx1ZSA9ICBfLmdldCh0aGlzLmZvcm0uZm9ybWRhdGEsIHRoaXMuX2ZpZWxkTmFtZSk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHRoaXMubmdmb3JtID0gdGhpcy5mb3JtLm5nZm9ybTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckZvcm1GaWVsZCgpO1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuZm9ybVdpZGdldCkge1xuICAgICAgICAgICAgdGhpcy5faW5pdFByb3BzUmVzKCk7XG5cbiAgICAgICAgICAgIC8vIHNldHRpbmcgZGlzcGxheUV4cHJlc3Npb25zIG9uIHRoZSBmb3Jtd2lkZ2V0IGV4cGxpY2l0bHkgYXMgZXhwciB3YXMgZXZhbHVhdGVkIHRvIFwiXCIuXG4gICAgICAgICAgICB0aGlzLnNldEZvcm1XaWRnZXQoJ2JpbmRkaXNwbGF5bGFiZWwnLCB0aGlzLmJpbmRkaXNwbGF5bGFiZWwpO1xuICAgICAgICAgICAgdGhpcy5zZXRGb3JtV2lkZ2V0KCdiaW5kZGlzcGxheWV4cHJlc3Npb24nLCB0aGlzLmJpbmRkaXNwbGF5ZXhwcmVzc2lvbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlZ2lzdGVyUmVhZHlTdGF0ZUxpc3RlbmVyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMua2V5ID0gdGhpcy5fZmllbGROYW1lIHx8IHRoaXMudGFyZ2V0IHx8IHRoaXMuYmluZGluZztcbiAgICAgICAgICAgIHRoaXMudmlld21vZGV3aWRnZXQgPSB0aGlzLnZpZXdtb2Rld2lkZ2V0IHx8IGdldERlZmF1bHRWaWV3TW9kZVdpZGdldCh0aGlzLndpZGdldHR5cGUpO1xuXG4gICAgICAgICAgICAvLyBGb3IgdXBsb2FkIHdpZGdldCwgZ2VuZXJhdGUgdGhlIHBlcm1pdHRlZCBmaWVsZFxuICAgICAgICAgICAgaWYgKHRoaXMud2lkZ2V0dHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuVVBMT0FEKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVUeXBlO1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSB0aGUgYWNjZXB0cyBzdHJpbmcgZnJvbSBmaWxlIHR5cGUgYW5kIGV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgICBmaWxlVHlwZSA9IHRoaXMuZmlsZXR5cGUgPyBGSUxFX1RZUEVTW3RoaXMuZmlsZXR5cGVdIDogJyc7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJtaXR0ZWQgPSBmaWxlVHlwZSArICh0aGlzLmV4dGVuc2lvbnMgPyAoZmlsZVR5cGUgPyAnLCcgOiAnJykgKyB0aGlzLmV4dGVuc2lvbnMgOiAnJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpc01vYmlsZSgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzWydtb2JpbGUtZGlzcGxheSddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0LnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdGhpc1sncGMtZGlzcGxheSddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0LnNob3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRoZSBmb3JtIGZpZWxkIHdpdGggcGFyZW50IGZvcm1cbiAgICAgICAgICAgIHRoaXMuZm9ybS5yZWdpc3RlckZvcm1GaWVsZHModGhpcy53aWRnZXQpO1xuXG4gICAgICAgICAgICBhZGRGb3JJZEF0dHJpYnV0ZXModGhpcy5uYXRpdmVFbGVtZW50KTtcblxuICAgICAgICAgICAgdGhpcy5zZXRSZWFkT25seVN0YXRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==