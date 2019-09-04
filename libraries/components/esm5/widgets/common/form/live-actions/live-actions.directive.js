import { Directive, Inject, Self } from '@angular/core';
import { AbstractDialogService, App, DataSource, triggerFn } from '@wm/core';
import { ListComponent } from '../../list/list.component';
import { Live_Operations, performDataOperation } from '../../../../utils/data-utils';
var LiveActionsDirective = /** @class */ (function () {
    function LiveActionsDirective(subscribedWidget, app, dialogService) {
        this.subscribedWidget = subscribedWidget;
        this.app = app;
        this.dialogService = dialogService;
        subscribedWidget.addRow = this.addRow.bind(this);
        subscribedWidget.updateRow = this.updateRow.bind(this);
        subscribedWidget.deleteRow = this.deleteRow.bind(this);
        subscribedWidget.call = this.call.bind(this);
    }
    LiveActionsDirective.prototype.addRow = function () {
        this.app.notify('wm-event', { eventName: Live_Operations.INSERT, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem });
    };
    LiveActionsDirective.prototype.updateRow = function () {
        this.app.notify('wm-event', { eventName: Live_Operations.UPDATE, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem });
    };
    LiveActionsDirective.prototype.deleteRow = function () {
        this.app.notify('wm-event', { eventName: Live_Operations.DELETE, widgetName: this.subscribedWidget.name, row: this.subscribedWidget.selecteditem });
    };
    LiveActionsDirective.prototype.successHandler = function (options, response) {
        triggerFn(options.success, response);
    };
    LiveActionsDirective.prototype.errorHandler = function (options, error) {
        this.app.notifyApp(error, 'error', 'ERROR');
        triggerFn(options.error, error);
    };
    LiveActionsDirective.prototype.getRecords = function (options, operation) {
        var _this = this;
        var index;
        var dataNavigator;
        if (this.subscribedWidget.navigation !== 'None' && this.subscribedWidget.dataNavigator) {
            dataNavigator = this.subscribedWidget.dataNavigator;
            // If operation is delete, decrease the data size and check if navigation to previous page is required
            if (operation === Live_Operations.DELETE) {
                dataNavigator.dataSize -= 1;
                dataNavigator.calculatePagingValues();
                index = dataNavigator.pageCount < dataNavigator.dn.currentPage ? 'prev' : undefined;
            }
            else {
                // If operation is insert, go to last page. If update operation, stay on current page
                index = operation === Live_Operations.INSERT ? 'last' : 'current';
                if (index === 'last') {
                    dataNavigator.dataSize += 1;
                }
                dataNavigator.calculatePagingValues();
            }
            dataNavigator.navigatePage(index, null, true, function (response) {
                _this.successHandler(options, response);
            });
        }
        else {
            this.subscribedWidget.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'skipToggleState': true
            }).then(function (response) {
                _this.successHandler(options, response);
            }, function (err) {
                _this.errorHandler(options, err);
            });
        }
    };
    LiveActionsDirective.prototype.performCUDOperation = function (requestData, operation, options) {
        var _this = this;
        performDataOperation(this.subscribedWidget.datasource, requestData, {
            operationType: operation
        }).then(function (response) {
            if (response.error) {
                _this.errorHandler(options, response.error);
                return;
            }
            _this.getRecords(options, operation);
            // show delete success toaster
            if (operation === 'delete') {
                _this.app.notifyApp(_this.app.appLocale.MESSAGE_DELETE_RECORD_SUCCESS, 'success');
            }
        }, function (error) {
            _this.errorHandler(options, error);
        });
    };
    LiveActionsDirective.prototype.insertRecord = function (requestData, operation, options) {
        this.performCUDOperation(requestData, operation, options);
    };
    LiveActionsDirective.prototype.updateRecord = function (requestData, operation, options) {
        this.performCUDOperation(requestData, operation, options);
    };
    LiveActionsDirective.prototype.deleteRecord = function (requestData, operation, options) {
        var _this = this;
        // Show the delete confirmation dialog. On Ok, delete the record.
        this.dialogService.showAppConfirmDialog({
            title: this.app.appLocale.MESSAGE_DELETE_RECORD || 'Delete Record',
            iconclass: 'wi wi-delete fa-lg',
            message: this.subscribedWidget.confirmdelete || 'Are you sure you want to delete this?',
            oktext: this.subscribedWidget.deleteoktext || 'Ok',
            canceltext: this.subscribedWidget.deletecanceltext || 'Cancel',
            onOk: function () {
                _this.performCUDOperation(requestData, operation, options);
                _this.dialogService.closeAppConfirmDialog();
            },
            onCancel: function () {
                triggerFn(options.cancelDeleteCallback);
                _this.dialogService.closeAppConfirmDialog();
            }
        });
    };
    LiveActionsDirective.prototype.performOperation = function (operation, options) {
        var requestData = {
            row: options.row,
            prevData: {},
            rowData: {},
            transform: true,
            skipNotification: true
        };
        if (operation === Live_Operations.UPDATE) {
            requestData.rowData = options.rowData;
            requestData.prevData = options.prevData;
        }
        /* decide routine based on CRUD operation to be performed */
        switch (operation) {
            case Live_Operations.INSERT:
                this.insertRecord(requestData, operation, options);
                break;
            case Live_Operations.UPDATE:
                this.updateRecord(requestData, operation, options);
                break;
            case Live_Operations.DELETE:
                this.deleteRecord(requestData, operation, options);
                break;
            case Live_Operations.READ:
                this.getRecords(options, operation);
                break;
        }
    };
    // API exposed to make CRUD operations
    LiveActionsDirective.prototype.call = function (operation, options, success, error) {
        options.success = success;
        options.error = error;
        this.performOperation(operation, options);
    };
    LiveActionsDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmLiveActions]'
                },] }
    ];
    /** @nocollapse */
    LiveActionsDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [ListComponent,] }] },
        { type: App },
        { type: AbstractDialogService }
    ]; };
    return LiveActionsDirective;
}());
export { LiveActionsDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1hY3Rpb25zLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9saXZlLWFjdGlvbnMvbGl2ZS1hY3Rpb25zLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTdFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckY7SUFLSSw4QkFDMkMsZ0JBQWdCLEVBQy9DLEdBQVEsRUFDUixhQUFvQztRQUZMLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBQTtRQUMvQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQ1Isa0JBQWEsR0FBYixhQUFhLENBQXVCO1FBRTVDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkQsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELGdCQUFnQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU0scUNBQU0sR0FBYjtRQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUs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Q0FBQSxBQTNKRCxJQTJKQztTQXhKWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdCwgU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdERpYWxvZ1NlcnZpY2UsIEFwcCwgRGF0YVNvdXJjZSwgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBMaXN0Q29tcG9uZW50IH0gZnJvbSAnLi4vLi4vbGlzdC9saXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBMaXZlX09wZXJhdGlvbnMsIHBlcmZvcm1EYXRhT3BlcmF0aW9uIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGl2ZUFjdGlvbnNdJ1xufSlcbmV4cG9ydCBjbGFzcyBMaXZlQWN0aW9uc0RpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgQFNlbGYoKSBASW5qZWN0KExpc3RDb21wb25lbnQpIHByaXZhdGUgc3Vic2NyaWJlZFdpZGdldCxcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBkaWFsb2dTZXJ2aWNlOiBBYnN0cmFjdERpYWxvZ1NlcnZpY2VcbiAgICApIHtcbiAgICAgICAgc3Vic2NyaWJlZFdpZGdldC5hZGRSb3cgPSB0aGlzLmFkZFJvdy5iaW5kKHRoaXMpO1xuICAgICAgICBzdWJzY3JpYmVkV2lkZ2V0LnVwZGF0ZVJvdyA9IHRoaXMudXBkYXRlUm93LmJpbmQodGhpcyk7XG4gICAgICAgIHN1YnNjcmliZWRXaWRnZXQuZGVsZXRlUm93ID0gdGhpcy5kZWxldGVSb3cuYmluZCh0aGlzKTtcbiAgICAgICAgc3Vic2NyaWJlZFdpZGdldC5jYWxsID0gdGhpcy5jYWxsLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFJvdygpIHtcbiAgICAgICAgdGhpcy5hcHAubm90aWZ5KCd3bS1ldmVudCcsIHtldmVudE5hbWU6IExpdmVfT3BlcmF0aW9ucy5JTlNFUlQsIHdpZGdldE5hbWU6IHRoaXMuc3Vic2NyaWJlZFdpZGdldC5uYW1lLCByb3c6IHRoaXMuc3Vic2NyaWJlZFdpZGdldC5zZWxlY3RlZGl0ZW19KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlUm93KCkge1xuICAgICAgICB0aGlzLmFwcC5ub3RpZnkoJ3dtLWV2ZW50Jywge2V2ZW50TmFtZTogTGl2ZV9PcGVyYXRpb25zLlVQREFURSwgd2lkZ2V0TmFtZTogdGhpcy5zdWJzY3JpYmVkV2lkZ2V0Lm5hbWUsIHJvdzogdGhpcy5zdWJzY3JpYmVkV2lkZ2V0LnNlbGVjdGVkaXRlbX0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBkZWxldGVSb3coKSB7XG4gICAgICAgIHRoaXMuYXBwLm5vdGlmeSgnd20tZXZlbnQnLCB7ZXZlbnROYW1lOiBMaXZlX09wZXJhdGlvbnMuREVMRVRFLCB3aWRnZXROYW1lOiB0aGlzLnN1YnNjcmliZWRXaWRnZXQubmFtZSwgcm93OiB0aGlzLnN1YnNjcmliZWRXaWRnZXQuc2VsZWN0ZWRpdGVtfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdWNjZXNzSGFuZGxlcihvcHRpb25zLCByZXNwb25zZSkge1xuICAgICAgICB0cmlnZ2VyRm4ob3B0aW9ucy5zdWNjZXNzLCByZXNwb25zZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlcnJvckhhbmRsZXIob3B0aW9ucywgZXJyb3IpIHtcbiAgICAgICAgdGhpcy5hcHAubm90aWZ5QXBwKGVycm9yLCAnZXJyb3InLCAnRVJST1InKTtcbiAgICAgICAgdHJpZ2dlckZuKG9wdGlvbnMuZXJyb3IsIGVycm9yKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UmVjb3JkcyhvcHRpb25zLCBvcGVyYXRpb24pIHtcbiAgICAgICAgbGV0IGluZGV4O1xuICAgICAgICBsZXQgZGF0YU5hdmlnYXRvcjtcblxuICAgICAgICBpZiAodGhpcy5zdWJzY3JpYmVkV2lkZ2V0Lm5hdmlnYXRpb24gIT09ICdOb25lJyAmJiB0aGlzLnN1YnNjcmliZWRXaWRnZXQuZGF0YU5hdmlnYXRvcikge1xuICAgICAgICAgICAgZGF0YU5hdmlnYXRvciA9IHRoaXMuc3Vic2NyaWJlZFdpZGdldC5kYXRhTmF2aWdhdG9yO1xuXG4gICAgICAgICAgICAvLyBJZiBvcGVyYXRpb24gaXMgZGVsZXRlLCBkZWNyZWFzZSB0aGUgZGF0YSBzaXplIGFuZCBjaGVjayBpZiBuYXZpZ2F0aW9uIHRvIHByZXZpb3VzIHBhZ2UgaXMgcmVxdWlyZWRcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24gPT09IExpdmVfT3BlcmF0aW9ucy5ERUxFVEUpIHtcbiAgICAgICAgICAgICAgICBkYXRhTmF2aWdhdG9yLmRhdGFTaXplIC09IDE7XG4gICAgICAgICAgICAgICAgZGF0YU5hdmlnYXRvci5jYWxjdWxhdGVQYWdpbmdWYWx1ZXMoKTtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGRhdGFOYXZpZ2F0b3IucGFnZUNvdW50IDwgZGF0YU5hdmlnYXRvci5kbi5jdXJyZW50UGFnZSA/ICdwcmV2JyA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgb3BlcmF0aW9uIGlzIGluc2VydCwgZ28gdG8gbGFzdCBwYWdlLiBJZiB1cGRhdGUgb3BlcmF0aW9uLCBzdGF5IG9uIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gb3BlcmF0aW9uID09PSBMaXZlX09wZXJhdGlvbnMuSU5TRVJUID8gJ2xhc3QnIDogJ2N1cnJlbnQnO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gJ2xhc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFOYXZpZ2F0b3IuZGF0YVNpemUgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YU5hdmlnYXRvci5jYWxjdWxhdGVQYWdpbmdWYWx1ZXMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0YU5hdmlnYXRvci5uYXZpZ2F0ZVBhZ2UoaW5kZXgsIG51bGwsIHRydWUsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1Y2Nlc3NIYW5kbGVyKG9wdGlvbnMsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVkV2lkZ2V0LmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5MSVNUX1JFQ09SRFMsIHtcbiAgICAgICAgICAgICAgICAnc2tpcFRvZ2dsZVN0YXRlJzogdHJ1ZVxuICAgICAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdWNjZXNzSGFuZGxlcihvcHRpb25zLCByZXNwb25zZSk7XG4gICAgICAgICAgICB9LCBlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZXJyb3JIYW5kbGVyKG9wdGlvbnMsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcGVyZm9ybUNVRE9wZXJhdGlvbihyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIHBlcmZvcm1EYXRhT3BlcmF0aW9uKHRoaXMuc3Vic2NyaWJlZFdpZGdldC5kYXRhc291cmNlLCByZXF1ZXN0RGF0YSwge1xuICAgICAgICAgICAgb3BlcmF0aW9uVHlwZTogb3BlcmF0aW9uXG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lcnJvckhhbmRsZXIob3B0aW9ucywgcmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ2V0UmVjb3JkcyhvcHRpb25zLCBvcGVyYXRpb24pO1xuICAgICAgICAgICAgLy8gc2hvdyBkZWxldGUgc3VjY2VzcyB0b2FzdGVyXG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uID09PSAnZGVsZXRlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeUFwcCh0aGlzLmFwcC5hcHBMb2NhbGUuTUVTU0FHRV9ERUxFVEVfUkVDT1JEX1NVQ0NFU1MsICdzdWNjZXNzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgdGhpcy5lcnJvckhhbmRsZXIob3B0aW9ucywgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluc2VydFJlY29yZChyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMucGVyZm9ybUNVRE9wZXJhdGlvbihyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVJlY29yZChyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMucGVyZm9ybUNVRE9wZXJhdGlvbihyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRlbGV0ZVJlY29yZChyZXF1ZXN0RGF0YSwgb3BlcmF0aW9uLCBvcHRpb25zKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGRlbGV0ZSBjb25maXJtYXRpb24gZGlhbG9nLiBPbiBPaywgZGVsZXRlIHRoZSByZWNvcmQuXG4gICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5zaG93QXBwQ29uZmlybURpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZTogIHRoaXMuYXBwLmFwcExvY2FsZS5NRVNTQUdFX0RFTEVURV9SRUNPUkQgfHwgJ0RlbGV0ZSBSZWNvcmQnLFxuICAgICAgICAgICAgaWNvbmNsYXNzOiAnd2kgd2ktZGVsZXRlIGZhLWxnJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuc3Vic2NyaWJlZFdpZGdldC5jb25maXJtZGVsZXRlIHx8ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXM/JyxcbiAgICAgICAgICAgIG9rdGV4dDogdGhpcy5zdWJzY3JpYmVkV2lkZ2V0LmRlbGV0ZW9rdGV4dCB8fCAnT2snLFxuICAgICAgICAgICAgY2FuY2VsdGV4dDogdGhpcy5zdWJzY3JpYmVkV2lkZ2V0LmRlbGV0ZWNhbmNlbHRleHQgfHwgJ0NhbmNlbCcsXG4gICAgICAgICAgICBvbk9rOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtQ1VET3BlcmF0aW9uKHJlcXVlc3REYXRhLCBvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5jbG9zZUFwcENvbmZpcm1EaWFsb2coKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihvcHRpb25zLmNhbmNlbERlbGV0ZUNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UuY2xvc2VBcHBDb25maXJtRGlhbG9nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcGVyZm9ybU9wZXJhdGlvbihvcGVyYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICByb3c6IG9wdGlvbnMucm93LFxuICAgICAgICAgICAgcHJldkRhdGE6IHt9LFxuICAgICAgICAgICAgcm93RGF0YToge30sXG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRydWUsXG4gICAgICAgICAgICBza2lwTm90aWZpY2F0aW9uOiB0cnVlXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gTGl2ZV9PcGVyYXRpb25zLlVQREFURSkge1xuICAgICAgICAgICAgcmVxdWVzdERhdGEucm93RGF0YSA9IG9wdGlvbnMucm93RGF0YTtcbiAgICAgICAgICAgIHJlcXVlc3REYXRhLnByZXZEYXRhID0gb3B0aW9ucy5wcmV2RGF0YTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGRlY2lkZSByb3V0aW5lIGJhc2VkIG9uIENSVUQgb3BlcmF0aW9uIHRvIGJlIHBlcmZvcm1lZCAqL1xuICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuSU5TRVJUOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0UmVjb3JkKHJlcXVlc3REYXRhLCBvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuVVBEQVRFOlxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUmVjb3JkKHJlcXVlc3REYXRhLCBvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuREVMRVRFOlxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlUmVjb3JkKHJlcXVlc3REYXRhLCBvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuUkVBRDpcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlY29yZHMob3B0aW9ucywgb3BlcmF0aW9uKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFQSSBleHBvc2VkIHRvIG1ha2UgQ1JVRCBvcGVyYXRpb25zXG4gICAgcHVibGljIGNhbGwob3BlcmF0aW9uLCBvcHRpb25zLCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIG9wdGlvbnMuc3VjY2VzcyA9IHN1Y2Nlc3M7XG4gICAgICAgIG9wdGlvbnMuZXJyb3IgPSBlcnJvcjtcblxuICAgICAgICB0aGlzLnBlcmZvcm1PcGVyYXRpb24ob3BlcmF0aW9uLCBvcHRpb25zKTtcbiAgICB9XG59XG4iXX0=