import { Component, Injector } from '@angular/core';
import { switchClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './message.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'alert app-message';
const WIDGET_CONFIG = { widgetType: 'wm-message', hostClass: DEFAULT_CLS };
export class MessageComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.messageClass = '';
        this.messageIconClass = '';
        this.type = '';
        styler(this.nativeElement, this);
    }
    showMessage(caption, type) {
        if (caption) {
            this.caption = caption;
        }
        if (type) {
            this.setWidgetProperty('type', type);
        }
        this.setWidgetProperty('show', true);
    }
    hideMessage() {
        this.setWidgetProperty('show', false);
    }
    dismiss($event) {
        this.hideMessage();
        this.invokeEventCallback('close', { $event });
    }
    onMessageTypeChange(nv) {
        let msgCls, msgIconCls;
        switch (nv) {
            case 'success':
                msgCls = 'alert-success';
                msgIconCls = 'wi wi-done';
                break;
            case 'error':
                msgCls = 'alert-danger';
                msgIconCls = 'wi wi-cancel';
                break;
            case 'warn': /*To support old projects with type as "warn"*/
            case 'warning':
                msgCls = 'alert-warning';
                msgIconCls = 'wi wi-bell';
                break;
            case 'info':
                msgCls = 'alert-info';
                msgIconCls = 'wi wi-info';
                break;
            case 'loading':
                msgCls = 'alert-info alert-loading';
                msgIconCls = 'fa fa-spinner fa-spin';
                break;
        }
        switchClass(this.nativeElement, msgCls, this.messageClass);
        this.messageClass = msgCls;
        this.messageIconClass = msgIconCls;
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'type') {
            this.onMessageTypeChange(nv);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
MessageComponent.initializeProps = registerProps();
MessageComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmMessage]',
                template: "<i [title]=\"type + 'Alert'\" class=\"icon {{type}} {{messageIconClass}}\"></i>\n<span [innerHtml]=\"caption | trustAs: 'html'\"></span>\n<button title=\"Close\" type=\"button\" class=\"btn-transparent close\" [hidden]=\"hideclose\" (click)=\"dismiss($event)\" aria-label=\"Close\">\n    <span aria-hidden=\"true\">&times;</span>\n</button>",
                providers: [
                    provideAsWidgetRef(MessageComponent)
                ]
            }] }
];
/** @nocollapse */
MessageComponent.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL21lc3NhZ2UvbWVzc2FnZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLE1BQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDO0FBQ3hDLE1BQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBU3hGLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxpQkFBaUI7SUFRbkQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFQOUIsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFDbEIscUJBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLFNBQUksR0FBRyxFQUFFLENBQUM7UUFNTixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sV0FBVyxDQUFDLE9BQWdCLEVBQUUsSUFBYTtRQUM5QyxJQUFJLE9BQU8sRUFBRTtZQUNULElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxJQUFJLEVBQUU7WUFDTixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxNQUFNO1FBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsRUFBVTtRQUNsQyxJQUFJLE1BQU0sRUFBRSxVQUFVLENBQUM7UUFDdkIsUUFBUSxFQUFFLEVBQUU7WUFDUixLQUFLLFNBQVM7Z0JBQ1YsTUFBTSxHQUFHLGVBQWUsQ0FBQztnQkFDekIsVUFBVSxHQUFHLFlBQVksQ0FBQztnQkFDMUIsTUFBTTtZQUNWLEtBQUssT0FBTztnQkFDUixNQUFNLEdBQUcsY0FBYyxDQUFDO2dCQUN4QixVQUFVLEdBQUcsY0FBYyxDQUFDO2dCQUM1QixNQUFNO1lBQ1YsS0FBSyxNQUFNLENBQUMsQ0FBRSwrQ0FBK0M7WUFDN0QsS0FBSyxTQUFTO2dCQUNWLE1BQU0sR0FBRyxlQUFlLENBQUM7Z0JBQ3pCLFVBQVUsR0FBRyxZQUFZLENBQUM7Z0JBQzFCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsTUFBTSxHQUFHLFlBQVksQ0FBQztnQkFDdEIsVUFBVSxHQUFHLFlBQVksQ0FBQztnQkFDMUIsTUFBTTtZQUNWLEtBQUssU0FBUztnQkFDVixNQUFNLEdBQUcsMEJBQTBCLENBQUM7Z0JBQ3BDLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQztnQkFDckMsTUFBTTtTQUNiO1FBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUMzQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDekIsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNoQzthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDOztBQW5FTSxnQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLGdXQUF1QztnQkFDdkMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO2lCQUN2QzthQUNKOzs7O1lBbkJtQixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vbWVzc2FnZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhbGVydCBhcHAtbWVzc2FnZSc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1tZXNzYWdlJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTWVzc2FnZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9tZXNzYWdlLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE1lc3NhZ2VDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNZXNzYWdlQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgbWVzc2FnZUNsYXNzID0gJyc7XG4gICAgbWVzc2FnZUljb25DbGFzcyA9ICcnO1xuICAgIHR5cGUgPSAnJztcbiAgICBjYXB0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIGhpZGVjbG9zZTogYW55O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd01lc3NhZ2UoY2FwdGlvbj86IHN0cmluZywgdHlwZT86IHN0cmluZykge1xuICAgICAgICBpZiAoY2FwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gY2FwdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRXaWRnZXRQcm9wZXJ0eSgndHlwZScsIHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0V2lkZ2V0UHJvcGVydHkoJ3Nob3cnLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaGlkZU1lc3NhZ2UoKSB7XG4gICAgICAgIHRoaXMuc2V0V2lkZ2V0UHJvcGVydHkoJ3Nob3cnLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc21pc3MoJGV2ZW50KSB7XG4gICAgICAgIHRoaXMuaGlkZU1lc3NhZ2UoKTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjbG9zZScsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uTWVzc2FnZVR5cGVDaGFuZ2UobnY6IHN0cmluZykge1xuICAgICAgICBsZXQgbXNnQ2xzLCBtc2dJY29uQ2xzO1xuICAgICAgICBzd2l0Y2ggKG52KSB7XG4gICAgICAgICAgICBjYXNlICdzdWNjZXNzJzpcbiAgICAgICAgICAgICAgICBtc2dDbHMgPSAnYWxlcnQtc3VjY2Vzcyc7XG4gICAgICAgICAgICAgICAgbXNnSWNvbkNscyA9ICd3aSB3aS1kb25lJztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICBtc2dDbHMgPSAnYWxlcnQtZGFuZ2VyJztcbiAgICAgICAgICAgICAgICBtc2dJY29uQ2xzID0gJ3dpIHdpLWNhbmNlbCc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3YXJuJzogIC8qVG8gc3VwcG9ydCBvbGQgcHJvamVjdHMgd2l0aCB0eXBlIGFzIFwid2FyblwiKi9cbiAgICAgICAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICAgICAgICAgIG1zZ0NscyA9ICdhbGVydC13YXJuaW5nJztcbiAgICAgICAgICAgICAgICBtc2dJY29uQ2xzID0gJ3dpIHdpLWJlbGwnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgbXNnQ2xzID0gJ2FsZXJ0LWluZm8nO1xuICAgICAgICAgICAgICAgIG1zZ0ljb25DbHMgPSAnd2kgd2ktaW5mbyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb2FkaW5nJzpcbiAgICAgICAgICAgICAgICBtc2dDbHMgPSAnYWxlcnQtaW5mbyBhbGVydC1sb2FkaW5nJztcbiAgICAgICAgICAgICAgICBtc2dJY29uQ2xzID0gJ2ZhIGZhLXNwaW5uZXIgZmEtc3Bpbic7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBtc2dDbHMsIHRoaXMubWVzc2FnZUNsYXNzKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlQ2xhc3MgPSBtc2dDbHM7XG4gICAgICAgIHRoaXMubWVzc2FnZUljb25DbGFzcyA9IG1zZ0ljb25DbHM7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICB0aGlzLm9uTWVzc2FnZVR5cGVDaGFuZ2UobnYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=