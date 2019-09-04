import * as tslib_1 from "tslib";
import { Attribute, ChangeDetectorRef, Component, ContentChild, ElementRef, Injector } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { $appDigest, AbstractDialogService, App, getClonedObject, isDefined, triggerFn } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './live-table.props';
import { TableComponent } from '../table/table.component';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-livegrid';
var WIDGET_CONFIG = { widgetType: 'wm-livetable', hostClass: DEFAULT_CLS };
var LiveTableComponent = /** @class */ (function (_super) {
    tslib_1.__extends(LiveTableComponent, _super);
    function LiveTableComponent(inj, elRef, cdr, dialogService, app, layoutType, dialogId) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.dialogService = dialogService;
        _this.app = app;
        _this.$queue = [];
        _this.tableOptions = {
            'multiselect': false,
            'setGridEditMode': ''
        };
        styler(_this.nativeElement, _this);
        if (layoutType === 'dialog') {
            _this.isLayoutDialog = true;
            _this.dialogId = dialogId;
        }
        return _this;
    }
    LiveTableComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        _super.prototype.ngAfterContentInit.call(this);
        if (this.table) {
            this.table._liveTableParent = this;
            this.table.datagridElement.datatable('option', this.tableOptions);
            this.table.selectedItemChange$
                .pipe(debounceTime(250))
                .subscribe(this.onSelectedItemChange.bind(this));
            if (!this.isLayoutDialog && !this.form) {
                this.table.datagridElement.datatable('option', {
                    'beforeRowUpdate': function () {
                        _this.showErrorMessage();
                    },
                    'beforeRowDelete': function () {
                        _this.showErrorMessage();
                    },
                    'beforeRowInsert': function () {
                        _this.showErrorMessage();
                    }
                });
            }
        }
    };
    LiveTableComponent.prototype.openDialog = function () {
        this.dialogService.open(this.dialogId);
        $appDigest();
    };
    LiveTableComponent.prototype.closeDialog = function () {
        this.dialogService.close(this.dialogId);
    };
    LiveTableComponent.prototype.focusFirstInput = function () {
        var $firstInput = $(this.form.$element).find('[role="input"]:first');
        $firstInput.focus();
        $firstInput.select();
    };
    LiveTableComponent.prototype.onDialogOpen = function () {
        this.focusFirstInput();
    };
    LiveTableComponent.prototype.setFormData = function (val) {
        if (!this.form.isDestroyed) {
            this.form.getWidget().formdata = val;
        }
    };
    LiveTableComponent.prototype._addNewRow = function () {
        this.form.isSelected = true;
        this.setFormData('');
        this.form.new();
        if (this.isLayoutDialog) {
            this.onDialogOpen();
        }
    };
    LiveTableComponent.prototype.addNewRow = function () {
        if (this.isLayoutDialog) {
            this.openDialog();
            this.$queue.push(this._addNewRow.bind(this));
            return;
        }
        this._addNewRow();
    };
    LiveTableComponent.prototype._updateRow = function (row, eventName) {
        this.setFormData(row);
        this.form.isSelected = true;
        this.form.edit();
        if (this.isLayoutDialog) {
            this.form.isUpdateMode = (eventName === 'dblclick') ? this.form.updateMode : true;
            this.onDialogOpen();
        }
    };
    LiveTableComponent.prototype.updateRow = function (row, eventName) {
        if (this.isLayoutDialog) {
            this.openDialog();
            this.$queue.push(this._updateRow.bind(this, row, eventName));
            return;
        }
        this._updateRow(row, eventName);
    };
    LiveTableComponent.prototype.onSelectedItemChange = function (newValue) {
        var rowData;
        if (!this.form || !this.table) {
            return;
        }
        if (newValue && newValue.length > 0 && !this.form.isSelected) {
            this.form.isSelected = true;
        }
        /*Update the rowdata of only that grid form that is associated with the specific grid on which row selection is being performed...
         * Since both the grid & gridform are associated with the same "parentgrid", match the same*/
        if (newValue && newValue.length > 0) {
            if (this.table.multiselect) {
                rowData = newValue[0];
            }
            else {
                rowData = newValue[newValue.length - 1];
            }
            this.setFormData(getClonedObject(rowData));
            /*If the form is already in update mode, call the form update function*/
            if (this.form.isUpdateMode) {
                this.form.edit();
            }
        }
        else {
            this.form.isSelected = false;
            this.setFormData('');
            this.form.clearData();
        }
    };
    LiveTableComponent.prototype.onCancel = function () {
        this.form.isUpdateMode = false;
        if (this.isLayoutDialog) {
            this.closeDialog();
        }
    };
    LiveTableComponent.prototype.onResult = function (operation, response, newForm, updateMode) {
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : newForm ? true : false;
        switch (operation) {
            case 'insert':
                if (newForm) {
                    /*if new form is to be shown after insert, skip the highlight of the row*/
                    this.table.gridfirstrowselect = false;
                    this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, true);
                }
                else {
                    /*The new row would always be inserted at the end of all existing records. Hence navigate to the last page and highlight the inserted row.*/
                    this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response);
                }
                break;
            case 'update':
                /*The updated row would be found in the current page itself. Hence simply highlight the row in the current page.*/
                if (newForm) {
                    this.table.gridfirstrowselect = false;
                    this.table.initiateSelectItem('current', response, true);
                }
                else {
                    this.table.initiateSelectItem('current', response);
                }
                break;
            case 'delete':
                this.table.onRecordDelete();
                break;
        }
        this.table.updateVariable();
        if (this.isLayoutDialog) {
            /*if new form is to be shown after update or insert, don't close the dialog*/
            if (newForm) {
                if (operation === 'insert') {
                    this.form.new();
                }
                else if (operation === 'update') {
                    this.form.edit();
                }
            }
            else {
                this.closeDialog();
            }
        }
    };
    LiveTableComponent.prototype.showErrorMessage = function () {
        this.app.notifyApp(this.appLocale.LABEL_ACCESS_DENIED, 'error');
    };
    // In dialog mode, on form render call the queued functions
    LiveTableComponent.prototype.onFormReady = function (form) {
        var _this = this;
        this.form = form;
        setTimeout(function () {
            triggerFn(_this.$queue.pop());
        });
    };
    LiveTableComponent.initializeProps = registerProps();
    LiveTableComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmLiveTable]',
                    template: "<ng-content></ng-content>",
                    providers: [
                        provideAsWidgetRef(LiveTableComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    LiveTableComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: ElementRef },
        { type: ChangeDetectorRef },
        { type: AbstractDialogService },
        { type: App },
        { type: String, decorators: [{ type: Attribute, args: ['formlayout',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['dialogid',] }] }
    ]; };
    LiveTableComponent.propDecorators = {
        table: [{ type: ContentChild, args: [TableComponent,] }]
    };
    return LiveTableComponent;
}(StylableComponent));
export { LiveTableComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS10YWJsZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2xpdmUtdGFibGUvbGl2ZS10YWJsZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU5SCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekcsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFLakUsSUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDO0FBQ25DLElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFM0U7SUFPd0MsOENBQWlCO0lBZXJELDRCQUNJLEdBQWEsRUFDYixLQUFpQixFQUNqQixHQUFzQixFQUNkLGFBQW9DLEVBQ3BDLEdBQVEsRUFDUyxVQUFrQixFQUNwQixRQUFnQjtRQVAzQyxZQVNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FNNUI7UUFYVyxtQkFBYSxHQUFiLGFBQWEsQ0FBdUI7UUFDcEMs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LGNBQWM7O0lBc05oQyx5QkFBQztDQUFBLEFBL05ELENBT3dDLGlCQUFpQixHQXdOeEQ7U0F4Tlksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJDb250ZW50SW5pdCwgQXR0cmlidXRlLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEVsZW1lbnRSZWYsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBBcHAsIGdldENsb25lZE9iamVjdCwgaXNEZWZpbmVkLCB0cmlnZ2VyRm4gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vbGl2ZS10YWJsZS5wcm9wcyc7XG5pbXBvcnQgeyBUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL3RhYmxlL3RhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcbmRlY2xhcmUgdmFyICQ6IGFueTtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWxpdmVncmlkJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWxpdmV0YWJsZScsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUxpdmVUYWJsZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9saXZlLXRhYmxlLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKExpdmVUYWJsZUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIExpdmVUYWJsZUNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBAQ29udGVudENoaWxkKFRhYmxlQ29tcG9uZW50KSB0YWJsZTogVGFibGVDb21wb25lbnQ7XG5cbiAgICBmb3JtO1xuICAgIGlzTGF5b3V0RGlhbG9nOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBkaWFsb2dJZDtcbiAgICBwcml2YXRlICRxdWV1ZSA9IFtdO1xuXG4gICAgcHJpdmF0ZSB0YWJsZU9wdGlvbnM6IGFueSA9IHtcbiAgICAgICAgJ211bHRpc2VsZWN0JzogZmFsc2UsXG4gICAgICAgICdzZXRHcmlkRWRpdE1vZGUnOiAnJ1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgIHByaXZhdGUgZGlhbG9nU2VydmljZTogQWJzdHJhY3REaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBAQXR0cmlidXRlKCdmb3JtbGF5b3V0JykgbGF5b3V0VHlwZTogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdkaWFsb2dpZCcpIGRpYWxvZ0lkOiBzdHJpbmdcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIGlmIChsYXlvdXRUeXBlID09PSAnZGlhbG9nJykge1xuICAgICAgICAgICAgdGhpcy5pc0xheW91dERpYWxvZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ0lkID0gZGlhbG9nSWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy50YWJsZSkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5fbGl2ZVRhYmxlUGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZSgnb3B0aW9uJywgdGhpcy50YWJsZU9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGlzLnRhYmxlLnNlbGVjdGVkSXRlbUNoYW5nZSRcbiAgICAgICAgICAgICAgICAucGlwZShkZWJvdW5jZVRpbWUoMjUwKSlcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKHRoaXMub25TZWxlY3RlZEl0ZW1DaGFuZ2UuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5pc0xheW91dERpYWxvZyAmJiAhdGhpcy5mb3JtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhZ3JpZEVsZW1lbnQuZGF0YXRhYmxlKCdvcHRpb24nLCB7XG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVSb3dVcGRhdGUnIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVSb3dEZWxldGUnIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVSb3dJbnNlcnQnIDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RXJyb3JNZXNzYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9wZW5EaWFsb2coKSB7XG4gICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5vcGVuKHRoaXMuZGlhbG9nSWQpO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgY2xvc2VEaWFsb2coKSB7XG4gICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5jbG9zZSh0aGlzLmRpYWxvZ0lkKTtcbiAgICB9XG5cbiAgICBmb2N1c0ZpcnN0SW5wdXQoKSB7XG4gICAgICAgIGNvbnN0ICRmaXJzdElucHV0ID0gJCh0aGlzLmZvcm0uJGVsZW1lbnQpLmZpbmQoJ1tyb2xlPVwiaW5wdXRcIl06Zmlyc3QnKTtcbiAgICAgICAgJGZpcnN0SW5wdXQuZm9jdXMoKTtcbiAgICAgICAgJGZpcnN0SW5wdXQuc2VsZWN0KCk7XG4gICAgfVxuXG4gICAgb25EaWFsb2dPcGVuKCkge1xuICAgICAgICB0aGlzLmZvY3VzRmlyc3RJbnB1dCgpO1xuICAgIH1cblxuICAgIHNldEZvcm1EYXRhKHZhbCkge1xuICAgICAgICBpZiAoIXRoaXMuZm9ybS5pc0Rlc3Ryb3llZCkge1xuICAgICAgICAgICAgdGhpcy5mb3JtLmdldFdpZGdldCgpLmZvcm1kYXRhID0gdmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfYWRkTmV3Um93KCkge1xuICAgICAgICB0aGlzLmZvcm0uaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0Rm9ybURhdGEoJycpO1xuXG4gICAgICAgIHRoaXMuZm9ybS5uZXcoKTtcblxuICAgICAgICBpZiAodGhpcy5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgdGhpcy5vbkRpYWxvZ09wZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZE5ld1JvdygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNMYXlvdXREaWFsb2cpIHtcbiAgICAgICAgICAgIHRoaXMub3BlbkRpYWxvZygpO1xuICAgICAgICAgICAgdGhpcy4kcXVldWUucHVzaCh0aGlzLl9hZGROZXdSb3cuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgIHRoaXMuX2FkZE5ld1JvdygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZVJvdyhyb3csIGV2ZW50TmFtZSkge1xuICAgICAgICB0aGlzLnNldEZvcm1EYXRhKHJvdyk7XG4gICAgICAgIHRoaXMuZm9ybS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mb3JtLmVkaXQoKTtcblxuICAgICAgICBpZiAodGhpcy5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgdGhpcy5mb3JtLmlzVXBkYXRlTW9kZSA9IChldmVudE5hbWUgPT09ICdkYmxjbGljaycpID8gdGhpcy5mb3JtLnVwZGF0ZU1vZGUgOiB0cnVlO1xuICAgICAgICAgICAgdGhpcy5vbkRpYWxvZ09wZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZVJvdyhyb3csIGV2ZW50TmFtZSkge1xuXG4gICAgICAgIGlmICh0aGlzLmlzTGF5b3V0RGlhbG9nKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW5EaWFsb2coKTtcbiAgICAgICAgICAgIHRoaXMuJHF1ZXVlLnB1c2godGhpcy5fdXBkYXRlUm93LmJpbmQodGhpcywgcm93LCBldmVudE5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJvdyhyb3csIGV2ZW50TmFtZSk7XG4gICAgfVxuXG4gICAgb25TZWxlY3RlZEl0ZW1DaGFuZ2UobmV3VmFsdWUpIHtcbiAgICAgICAgbGV0IHJvd0RhdGE7XG4gICAgICAgIGlmICghdGhpcy5mb3JtIHx8ICF0aGlzLnRhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3VmFsdWUgJiYgbmV3VmFsdWUubGVuZ3RoID4gMCAmJiAhdGhpcy5mb3JtLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qVXBkYXRlIHRoZSByb3dkYXRhIG9mIG9ubHkgdGhhdCBncmlkIGZvcm0gdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmljIGdyaWQgb24gd2hpY2ggcm93IHNlbGVjdGlvbiBpcyBiZWluZyBwZXJmb3JtZWQuLi5cbiAgICAgICAgICogU2luY2UgYm90aCB0aGUgZ3JpZCAmIGdyaWRmb3JtIGFyZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNhbWUgXCJwYXJlbnRncmlkXCIsIG1hdGNoIHRoZSBzYW1lKi9cbiAgICAgICAgaWYgKG5ld1ZhbHVlICYmIG5ld1ZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgcm93RGF0YSA9IG5ld1ZhbHVlWzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb3dEYXRhID0gbmV3VmFsdWVbbmV3VmFsdWUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0Rm9ybURhdGEoZ2V0Q2xvbmVkT2JqZWN0KHJvd0RhdGEpKTtcbiAgICAgICAgICAgIC8qSWYgdGhlIGZvcm0gaXMgYWxyZWFkeSBpbiB1cGRhdGUgbW9kZSwgY2FsbCB0aGUgZm9ybSB1cGRhdGUgZnVuY3Rpb24qL1xuICAgICAgICAgICAgaWYgKHRoaXMuZm9ybS5pc1VwZGF0ZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0uZWRpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5mb3JtLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc2V0Rm9ybURhdGEoJycpO1xuICAgICAgICAgICAgdGhpcy5mb3JtLmNsZWFyRGF0YSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DYW5jZWwoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5pc1VwZGF0ZU1vZGUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuaXNMYXlvdXREaWFsb2cpIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzdWx0KG9wZXJhdGlvbiwgcmVzcG9uc2UsIG5ld0Zvcm0sIHVwZGF0ZU1vZGUpIHtcbiAgICAgICAgdGhpcy5mb3JtLmlzVXBkYXRlTW9kZSA9IGlzRGVmaW5lZCh1cGRhdGVNb2RlKSA/IHVwZGF0ZU1vZGUgOiBuZXdGb3JtID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0JzpcbiAgICAgICAgICAgICAgICBpZiAobmV3Rm9ybSkge1xuICAgICAgICAgICAgICAgICAgICAvKmlmIG5ldyBmb3JtIGlzIHRvIGJlIHNob3duIGFmdGVyIGluc2VydCwgc2tpcCB0aGUgaGlnaGxpZ2h0IG9mIHRoZSByb3cqL1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmdyaWRmaXJzdHJvd3NlbGVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmluaXRpYXRlU2VsZWN0SXRlbSh0aGlzLnRhYmxlLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvKCksIHJlc3BvbnNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvKlRoZSBuZXcgcm93IHdvdWxkIGFsd2F5cyBiZSBpbnNlcnRlZCBhdCB0aGUgZW5kIG9mIGFsbCBleGlzdGluZyByZWNvcmRzLiBIZW5jZSBuYXZpZ2F0ZSB0byB0aGUgbGFzdCBwYWdlIGFuZCBoaWdobGlnaHQgdGhlIGluc2VydGVkIHJvdy4qL1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmluaXRpYXRlU2VsZWN0SXRlbSh0aGlzLnRhYmxlLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvKCksIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgICAgIC8qVGhlIHVwZGF0ZWQgcm93IHdvdWxkIGJlIGZvdW5kIGluIHRoZSBjdXJyZW50IHBhZ2UgaXRzZWxmLiBIZW5jZSBzaW1wbHkgaGlnaGxpZ2h0IHRoZSByb3cgaW4gdGhlIGN1cnJlbnQgcGFnZS4qL1xuICAgICAgICAgICAgICAgIGlmIChuZXdGb3JtKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuZ3JpZGZpcnN0cm93c2VsZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW5pdGlhdGVTZWxlY3RJdGVtKCdjdXJyZW50JywgcmVzcG9uc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuaW5pdGlhdGVTZWxlY3RJdGVtKCdjdXJyZW50JywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5vblJlY29yZERlbGV0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFibGUudXBkYXRlVmFyaWFibGUoKTtcbiAgICAgICAgaWYgKHRoaXMuaXNMYXlvdXREaWFsb2cpIHtcbiAgICAgICAgICAgIC8qaWYgbmV3IGZvcm0gaXMgdG8gYmUgc2hvd24gYWZ0ZXIgdXBkYXRlIG9yIGluc2VydCwgZG9uJ3QgY2xvc2UgdGhlIGRpYWxvZyovXG4gICAgICAgICAgICBpZiAobmV3Rm9ybSkge1xuICAgICAgICAgICAgICAgIGlmIChvcGVyYXRpb24gPT09ICdpbnNlcnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9ybS5uZXcoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9wZXJhdGlvbiA9PT0gJ3VwZGF0ZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtLmVkaXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VEaWFsb2coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dFcnJvck1lc3NhZ2UoKSB7XG4gICAgICAgIHRoaXMuYXBwLm5vdGlmeUFwcCh0aGlzLmFwcExvY2FsZS5MQUJFTF9BQ0NFU1NfREVOSUVELCAnZXJyb3InKTtcbiAgICB9XG5cbiAgICAvLyBJbiBkaWFsb2cgbW9kZSwgb24gZm9ybSByZW5kZXIgY2FsbCB0aGUgcXVldWVkIGZ1bmN0aW9uc1xuICAgIG9uRm9ybVJlYWR5KGZvcm0pIHtcbiAgICAgICAgdGhpcy5mb3JtID0gZm9ybTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0cmlnZ2VyRm4odGhpcy4kcXVldWUucG9wKCkpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=