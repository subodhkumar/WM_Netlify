import * as tslib_1 from "tslib";
import { BaseActionManager } from './base-action.manager';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { initiateCallback, toasterService, dialogService } from '../../util/variable/variables.utils';
var NotificationActionManager = /** @class */ (function (_super) {
    tslib_1.__extends(NotificationActionManager, _super);
    function NotificationActionManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NotificationActionManager.prototype.onToasterClick = function (variable) {
        initiateCallback('onClick', variable, '');
    };
    NotificationActionManager.prototype.onToasterHide = function (variable) {
        initiateCallback('onHide', variable, '');
    };
    NotificationActionManager.prototype.notifyViaToaster = function (variable, options) {
        var type = (options.class || variable.dataBinding.class || 'info').toLowerCase(), body = options.message || variable.dataBinding.text, title = options.title, positionClass = 'toast-' + (options.position || variable.dataBinding.toasterPosition || 'bottom right').replace(' ', '-'), partialPage = variable.dataBinding.page, DEFAULT_DURATION = 3000;
        var duration = parseInt(variable.dataBinding.duration || options.duration, null), toaster;
        // duration
        if (!duration) {
            duration = (duration !== 0 && type === 'success') ? DEFAULT_DURATION : 0;
        }
        if (variable.dataBinding.content && variable.dataBinding.content === 'page' && partialPage) {
            toaster = toasterService.showCustom(partialPage, { positionClass: positionClass, timeOut: duration,
                partialParams: variable._binddataSet, context: variable._context });
        }
        else {
            toaster = toasterService.show(type, title, body || null, { positionClass: positionClass, timeOut: duration, enableHtml: true });
        }
        // callbacks
        if (variable.onClick) {
            toaster.onTap.subscribe(this.onToasterClick.bind(this, variable));
        }
        if (variable.onHide) {
            toaster.onHidden.subscribe(this.onToasterHide.bind(this, variable));
        }
    };
    NotificationActionManager.prototype.notifyViaDialog = function (variable, options) {
        var commonPageDialogId = 'Common' + _.capitalize(variable.operation) + 'Dialog', variableOwner = variable.owner, dialogId = (variableOwner === VARIABLE_CONSTANTS.OWNER.APP) ? commonPageDialogId : 'notification' + variable.operation + 'dialog';
        dialogService.open(dialogId, variable._context, {
            notification: {
                'title': options.title || variable.dataBinding.title,
                'text': options.message || variable.dataBinding.text,
                'okButtonText': options.okButtonText || variable.dataBinding.okButtonText || 'OK',
                'cancelButtonText': options.cancelButtonText || variable.dataBinding.cancelButtonText || 'CANCEL',
                'alerttype': options.alerttype || variable.dataBinding.alerttype || 'information',
                onOk: function () {
                    initiateCallback('onOk', variable, options.data);
                    // Close the action dialog after triggering onOk callback event
                    dialogService.close(dialogId, variable._context);
                },
                onCancel: function () {
                    initiateCallback('onCancel', variable, options.data);
                    // Close the action dialog after triggering onCancel callback event
                    dialogService.close(dialogId, variable._context);
                },
                onClose: function () {
                    initiateCallback('onClose', variable, options.data);
                }
            }
        });
    };
    // *********************************************************** PUBLIC ***********************************************************//
    NotificationActionManager.prototype.notify = function (variable, options, success, error) {
        var operation = variable.operation;
        options = options || {};
        if (operation === 'toast') {
            this.notifyViaToaster(variable, options);
        }
        else {
            this.notifyViaDialog(variable, options);
        }
    };
    NotificationActionManager.prototype.getMessage = function (variable) {
        return variable.dataBinding.text;
    };
    NotificationActionManager.prototype.setMessage = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.text = text;
        }
        return variable.dataBinding.text;
    };
    NotificationActionManager.prototype.getOkButtonText = function (variable) {
        return variable.dataBinding.okButtonText;
    };
    NotificationActionManager.prototype.setOkButtonText = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.okButtonText = text;
        }
        return variable.dataBinding.okButtonText;
    };
    NotificationActionManager.prototype.getToasterDuration = function (variable) {
        return variable.dataBinding.duration;
    };
    NotificationActionManager.prototype.setToasterDuration = function (variable, duration) {
        variable.dataBinding.duration = duration;
        return variable.dataBinding.duration;
    };
    NotificationActionManager.prototype.getToasterClass = function (variable) {
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.setToasterClass = function (variable, type) {
        if (_.isString(type)) {
            variable.dataBinding.class = type;
        }
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.getToasterPosition = function (variable) {
        return variable.dataBinding.class;
    };
    NotificationActionManager.prototype.setToasterPosition = function (variable, position) {
        if (_.isString(position)) {
            variable.dataBinding.position = position;
        }
        return variable.dataBinding.position;
    };
    NotificationActionManager.prototype.getAlertType = function (variable) {
        return variable.dataBinding.alerttype;
    };
    NotificationActionManager.prototype.setAlertType = function (variable, alerttype) {
        if (_.isString(alerttype)) {
            variable.dataBinding.alerttype = alerttype;
        }
        return variable.dataBinding.alerttype;
    };
    NotificationActionManager.prototype.getCancelButtonText = function (variable) {
        return variable.dataBinding.cancelButtonText;
    };
    NotificationActionManager.prototype.setCancelButtonText = function (variable, text) {
        if (_.isString(text)) {
            variable.dataBinding.cancelButtonText = text;
        }
        return variable.dataBinding.cancelButtonText;
    };
    return NotificationActionManager;
}(BaseActionManager));
export { NotificationActionManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLWFjdGlvbi5tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbIm1hbmFnZXIvYWN0aW9uL25vdGlmaWNhdGlvbi1hY3Rpb24ubWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDekUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxhQUFhLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUl0RztJQUErQyxxREFBaUI7SUFBaEU7O0lBMEpBLENBQUM7SUF4Slcsa0RBQWMsR0FBdEIsVUFBdUIsUUFBUTtRQUMzQixnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyxpREFBYSxHQUFyQixVQUFzQixRQUFRO1FBQzFCLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLG9EQUFnQixHQUF4QixVQUF5QixRQUFRLEVBQUUsT0FBTztRQUN0QyxJQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQzlFLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUNuRCxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFDckIsYUFBYSxHQUFHLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlLElBQUksY0FBYyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFH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RCxzREFBa0IsR0FBbEIsVUFBbUIsUUFBUSxFQUFFLFFBQVE7UUFDakMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3RCLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztTQUM1QztRQUNELE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7SUFDekMsQ0FBQztJQUVELGdEQUFZLEdBQVosVUFBYSxRQUFRO1FBQ2pCLE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDMUMsQ0FBQztJQUVELGdEQUFZLEdBQVosVUFBYSxRQUFRLEVBQUUsU0FBUztRQUM1QixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDdkIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzlDO1FBQ0QsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsdURBQW1CLEdBQW5CLFVBQW9CLFFBQVE7UUFDeEIsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0lBQ2pELENBQUM7SUFFRCx1REFBbUIsR0FBbkIsVUFBb0IsUUFBUSxFQUFFLElBQUk7UUFDOUIsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xCLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0lBQ2pELENBQUM7SUFDTCxnQ0FBQztBQUFELENBQUMsQUExSkQsQ0FBK0MsaUJBQWlCLEdBMEovRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJhc2VBY3Rpb25NYW5hZ2VyIH0gZnJvbSAnLi9iYXNlLWFjdGlvbi5tYW5hZ2VyJztcbmltcG9ydCB7IFZBUklBQkxFX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IGluaXRpYXRlQ2FsbGJhY2ssIHRvYXN0ZXJTZXJ2aWNlLCBkaWFsb2dTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdXRpbC92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25BY3Rpb25NYW5hZ2VyIGV4dGVuZHMgQmFzZUFjdGlvbk1hbmFnZXIge1xuXG4gICAgcHJpdmF0ZSBvblRvYXN0ZXJDbGljayh2YXJpYWJsZSkge1xuICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvbkNsaWNrJywgdmFyaWFibGUsICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVG9hc3RlckhpZGUodmFyaWFibGUpIHtcbiAgICAgICAgaW5pdGlhdGVDYWxsYmFjaygnb25IaWRlJywgdmFyaWFibGUsICcnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vdGlmeVZpYVRvYXN0ZXIodmFyaWFibGUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IChvcHRpb25zLmNsYXNzIHx8IHZhcmlhYmxlLmRhdGFCaW5kaW5nLmNsYXNzIHx8ICdpbmZvJykudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgIGJvZHkgPSBvcHRpb25zLm1lc3NhZ2UgfHwgdmFyaWFibGUuZGF0YUJpbmRpbmcudGV4dCxcbiAgICAgICAgICAgIHRpdGxlID0gb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ2xhc3MgPSAndG9hc3QtJyArIChvcHRpb25zLnBvc2l0aW9uIHx8IHZhcmlhYmxlLmRhdGFCaW5kaW5nLnRvYXN0ZXJQb3NpdGlvbiB8fCAnYm90dG9tIHJpZ2h0JykucmVwbGFjZSgnICcsICctJyksXG4gICAgICAgICAgICBwYXJ0aWFsUGFnZSA9IHZhcmlhYmxlLmRhdGFCaW5kaW5nLnBhZ2UsXG4gICAgICAgICAgICBERUZBVUxUX0RVUkFUSU9OID0gMzAwMDtcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gcGFyc2VJbnQodmFyaWFibGUuZGF0YUJpbmRpbmcuZHVyYXRpb24gfHwgb3B0aW9ucy5kdXJhdGlvbiwgbnVsbCksXG4gICAgICAgICAgICB0b2FzdGVyO1xuXG4gICAgICAgIC8vIGR1cmF0aW9uXG4gICAgICAgIGlmICghZHVyYXRpb24pIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gKGR1cmF0aW9uICE9PSAwICYmIHR5cGUgPT09ICdzdWNjZXNzJykgPyBERUZBVUxUX0RVUkFUSU9OIDogMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFyaWFibGUuZGF0YUJpbmRpbmcuY29udGVudCAmJiB2YXJpYWJsZS5kYXRhQmluZGluZy5jb250ZW50ID09PSAncGFnZScgJiYgcGFydGlhbFBhZ2UpIHtcbiAgICAgICAgICAgIHRvYXN0ZXIgPSB0b2FzdGVyU2VydmljZS5zaG93Q3VzdG9tKHBhcnRpYWxQYWdlLCB7cG9zaXRpb25DbGFzczogcG9zaXRpb25DbGFzcywgdGltZU91dDogZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgcGFydGlhbFBhcmFtczogdmFyaWFibGUuX2JpbmRkYXRhU2V0LCBjb250ZXh0OiB2YXJpYWJsZS5fY29udGV4dH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9hc3RlciA9IHRvYXN0ZXJTZXJ2aWNlLnNob3codHlwZSwgdGl0bGUsIGJvZHkgfHwgbnVsbCwge3Bvc2l0aW9uQ2xhc3M6IHBvc2l0aW9uQ2xhc3MsIHRpbWVPdXQ6IGR1cmF0aW9uLCBlbmFibGVIdG1sOiB0cnVlfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjYWxsYmFja3NcbiAgICAgICAgaWYgKHZhcmlhYmxlLm9uQ2xpY2spIHtcbiAgICAgICAgICAgIHRvYXN0ZXIub25UYXAuc3Vic2NyaWJlKCB0aGlzLm9uVG9hc3RlckNsaWNrLmJpbmQodGhpcywgdmFyaWFibGUpICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhcmlhYmxlLm9uSGlkZSkge1xuICAgICAgICAgICAgdG9hc3Rlci5vbkhpZGRlbi5zdWJzY3JpYmUoIHRoaXMub25Ub2FzdGVySGlkZS5iaW5kKHRoaXMsIHZhcmlhYmxlKSApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBub3RpZnlWaWFEaWFsb2codmFyaWFibGUsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgY29tbW9uUGFnZURpYWxvZ0lkID0gJ0NvbW1vbicgKyBfLmNhcGl0YWxpemUodmFyaWFibGUub3BlcmF0aW9uKSArICdEaWFsb2cnLFxuICAgICAgICAgICAgdmFyaWFibGVPd25lciA9IHZhcmlhYmxlLm93bmVyLFxuICAgICAgICAgICAgZGlhbG9nSWQgPSAodmFyaWFibGVPd25lciA9PT0gVkFSSUFCTEVfQ09OU1RBTlRTLk9XTkVSLkFQUCApID8gY29tbW9uUGFnZURpYWxvZ0lkIDogJ25vdGlmaWNhdGlvbicgKyB2YXJpYWJsZS5vcGVyYXRpb24gKyAnZGlhbG9nJztcbiAgICAgICAgZGlhbG9nU2VydmljZS5vcGVuKGRpYWxvZ0lkLCAgdmFyaWFibGUuX2NvbnRleHQsIHtcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbjoge1xuICAgICAgICAgICAgICAgICd0aXRsZScgOiBvcHRpb25zLnRpdGxlIHx8IHZhcmlhYmxlLmRhdGFCaW5kaW5nLnRpdGxlLFxuICAgICAgICAgICAgICAgICd0ZXh0JyA6IG9wdGlvbnMubWVzc2FnZSB8fCB2YXJpYWJsZS5kYXRhQmluZGluZy50ZXh0LFxuICAgICAgICAgICAgICAgICdva0J1dHRvblRleHQnIDogb3B0aW9ucy5va0J1dHRvblRleHQgfHwgdmFyaWFibGUuZGF0YUJpbmRpbmcub2tCdXR0b25UZXh0IHx8ICdPSycsXG4gICAgICAgICAgICAgICAgJ2NhbmNlbEJ1dHRvblRleHQnIDogb3B0aW9ucy5jYW5jZWxCdXR0b25UZXh0IHx8IHZhcmlhYmxlLmRhdGFCaW5kaW5nLmNhbmNlbEJ1dHRvblRleHQgfHwgJ0NBTkNFTCcsXG4gICAgICAgICAgICAgICAgJ2FsZXJ0dHlwZScgOiBvcHRpb25zLmFsZXJ0dHlwZSB8fCB2YXJpYWJsZS5kYXRhQmluZGluZy5hbGVydHR5cGUgfHwgJ2luZm9ybWF0aW9uJyxcbiAgICAgICAgICAgICAgICBvbk9rOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uT2snLCB2YXJpYWJsZSwgb3B0aW9ucy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2xvc2UgdGhlIGFjdGlvbiBkaWFsb2cgYWZ0ZXIgdHJpZ2dlcmluZyBvbk9rIGNhbGxiYWNrIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIGRpYWxvZ1NlcnZpY2UuY2xvc2UoZGlhbG9nSWQsIHZhcmlhYmxlLl9jb250ZXh0KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYXRlQ2FsbGJhY2soJ29uQ2FuY2VsJywgdmFyaWFibGUsIG9wdGlvbnMuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENsb3NlIHRoZSBhY3Rpb24gZGlhbG9nIGFmdGVyIHRyaWdnZXJpbmcgb25DYW5jZWwgY2FsbGJhY2sgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgZGlhbG9nU2VydmljZS5jbG9zZShkaWFsb2dJZCwgdmFyaWFibGUuX2NvbnRleHQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25DbG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKCdvbkNsb3NlJywgdmFyaWFibGUsIG9wdGlvbnMuZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFBVQkxJQyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXG5cbiAgICBub3RpZnkodmFyaWFibGUsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHZhcmlhYmxlLm9wZXJhdGlvbjtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJ3RvYXN0Jykge1xuICAgICAgICAgICAgdGhpcy5ub3RpZnlWaWFUb2FzdGVyKHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubm90aWZ5VmlhRGlhbG9nKHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE1lc3NhZ2UodmFyaWFibGUpIHtcbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlLmRhdGFCaW5kaW5nLnRleHQ7XG4gICAgfVxuXG4gICAgc2V0TWVzc2FnZSh2YXJpYWJsZSwgdGV4dCkge1xuICAgICAgICBpZiAoXy5pc1N0cmluZyh0ZXh0KSkge1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YUJpbmRpbmcudGV4dCA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhcmlhYmxlLmRhdGFCaW5kaW5nLnRleHQ7XG4gICAgfVxuXG4gICAgZ2V0T2tCdXR0b25UZXh0KHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5kYXRhQmluZGluZy5va0J1dHRvblRleHQ7XG4gICAgfVxuICAgIHNldE9rQnV0dG9uVGV4dCh2YXJpYWJsZSwgdGV4dCkge1xuICAgICAgICBpZiAoXy5pc1N0cmluZyh0ZXh0KSkge1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YUJpbmRpbmcub2tCdXR0b25UZXh0ID0gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcub2tCdXR0b25UZXh0O1xuICAgIH1cblxuICAgIGdldFRvYXN0ZXJEdXJhdGlvbih2YXJpYWJsZSkge1xuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcuZHVyYXRpb247XG4gICAgfVxuXG4gICAgc2V0VG9hc3RlckR1cmF0aW9uKHZhcmlhYmxlLCBkdXJhdGlvbikge1xuICAgICAgICB2YXJpYWJsZS5kYXRhQmluZGluZy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcuZHVyYXRpb247XG4gICAgfVxuXG4gICAgZ2V0VG9hc3RlckNsYXNzKHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5kYXRhQmluZGluZy5jbGFzcztcbiAgICB9XG5cbiAgICBzZXRUb2FzdGVyQ2xhc3ModmFyaWFibGUsIHR5cGUpIHtcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcodHlwZSkpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFCaW5kaW5nLmNsYXNzID0gdHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcuY2xhc3M7XG4gICAgfVxuXG4gICAgZ2V0VG9hc3RlclBvc2l0aW9uKHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5kYXRhQmluZGluZy5jbGFzcztcbiAgICB9XG5cbiAgICBzZXRUb2FzdGVyUG9zaXRpb24odmFyaWFibGUsIHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKHBvc2l0aW9uKSkge1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YUJpbmRpbmcucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcucG9zaXRpb247XG4gICAgfVxuXG4gICAgZ2V0QWxlcnRUeXBlKHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5kYXRhQmluZGluZy5hbGVydHR5cGU7XG4gICAgfVxuXG4gICAgc2V0QWxlcnRUeXBlKHZhcmlhYmxlLCBhbGVydHR5cGUpIHtcbiAgICAgICAgaWYgKF8uaXNTdHJpbmcoYWxlcnR0eXBlKSkge1xuICAgICAgICAgICAgdmFyaWFibGUuZGF0YUJpbmRpbmcuYWxlcnR0eXBlID0gYWxlcnR0eXBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YXJpYWJsZS5kYXRhQmluZGluZy5hbGVydHR5cGU7XG4gICAgfVxuXG4gICAgZ2V0Q2FuY2VsQnV0dG9uVGV4dCh2YXJpYWJsZSkge1xuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcuY2FuY2VsQnV0dG9uVGV4dDtcbiAgICB9XG5cbiAgICBzZXRDYW5jZWxCdXR0b25UZXh0KHZhcmlhYmxlLCB0ZXh0KSB7XG4gICAgICAgIGlmIChfLmlzU3RyaW5nKHRleHQpKSB7XG4gICAgICAgICAgICB2YXJpYWJsZS5kYXRhQmluZGluZy5jYW5jZWxCdXR0b25UZXh0ID0gdGV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFyaWFibGUuZGF0YUJpbmRpbmcuY2FuY2VsQnV0dG9uVGV4dDtcbiAgICB9XG59XG4iXX0=