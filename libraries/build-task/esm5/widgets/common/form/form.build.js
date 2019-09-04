import { Attribute } from '@angular/compiler';
import { getAttrMarkup, register, getDataSource } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';
var tagName = 'form';
var idGen = new IDGenerator('form_');
var formWidgets = new Set([
    'wm-text',
    'wm-textarea',
    'wm-checkbox',
    'wm-slider',
    'wm-richtexteditor',
    'wm-currency',
    'wm-switch',
    'wm-select',
    'wm-checkboxset',
    'wm-radioset',
    'wm-date',
    'wm-time',
    'wm-timestamp',
    'wm-upload',
    'wm-rating',
    'wm-datetime',
    'wm-search',
    'wm-chips',
    'wm-colorpicker',
    'wm-table'
]);
var addFormControlName = function (children) {
    if (children === void 0) { children = []; }
    children.forEach(function (childNode) {
        if (formWidgets.has(childNode.name)) {
            var key = childNode.attrs.find(function (attr) { return attr.name === 'key' || attr.name === 'name'; });
            key = key && key.value;
            childNode.attrs.push(new Attribute('formControlName', key, 1, 1));
            childNode.attrs.push(new Attribute('wmFormWidget', '', 1, 1));
        }
        addFormControlName(childNode.children);
    });
};
var ɵ0 = addFormControlName;
var updateFormDataSource = function (attrMap) {
    if (attrMap.get('formdata.bind')) {
        var formDataSource = getDataSource(attrMap.get('formdata.bind'));
        if (formDataSource) {
            attrMap.set('formdatasource.bind', formDataSource);
        }
    }
};
var ɵ1 = updateFormDataSource;
var buildTask = function (directiveAttr) {
    if (directiveAttr === void 0) { directiveAttr = ''; }
    return {
        requires: ['wm-livetable', 'wm-login'],
        template: function (node) {
            addFormControlName(node.children);
        },
        pre: function (attrs, shared, parentLiveTable, parentLoginWidget) {
            var tmpl;
            var dialogId;
            var role = parentLoginWidget && parentLoginWidget.get('isLogin') ? 'app-login' : '';
            var counter = idGen.nextUid();
            var dependsOn = attrs.get('dependson') ? "dependson=\"" + attrs.get('dependson') + "\"" : '';
            var classProp = attrs.get('formlayout') === 'page' ? 'app-device-liveform panel liveform-inline' : '';
            var dialogAttributes = ['title', 'title.bind', 'iconclass', 'iconclass.bind', 'width'];
            attrs.delete('dependson');
            var liveFormTmpl = "<" + tagName + " wmForm role=\"" + role + "\" " + directiveAttr + " #" + counter + " ngNativeValidate [formGroup]=\"" + counter + ".ngform\" [noValidate]=\"" + counter + ".validationtype !== 'html'\"\n                    class=\"" + classProp + "\" [class]=\"" + counter + ".captionAlignClass\" [autocomplete]=\"" + counter + ".autocomplete ? 'on' : 'off'\" captionposition=" + attrs.get('captionposition');
            shared.set('counter', counter);
            updateFormDataSource(attrs);
            if (attrs.get('formlayout') === 'dialog') {
                dialogId = parentLiveTable ? parentLiveTable.get('liveform_dialog_id') : "liveform_dialog_id_" + counter;
                attrs.set('dialogId', dialogId);
                var dialogAttrsMap_1 = new Map();
                dialogAttributes.forEach(function (attr) {
                    if (attrs.get(attr)) {
                        dialogAttrsMap_1.set(attr, attrs.get(attr));
                    }
                });
                attrs.set('width', '100%');
                tmpl = getAttrMarkup(attrs);
                return "<div data-identifier=\"liveform\" init-widget class=\"app-liveform liveform-dialog\" " + dependsOn + " dialogid=\"" + dialogId + "\">\n                            <div wmDialog class=\"app-liveform-dialog\" name=\"" + dialogId + "\" role=\"form\" " + getAttrMarkup(dialogAttrsMap_1) + " modal=\"true\">\n                            <ng-template #dialogBody>\n                            " + liveFormTmpl + " " + tmpl + ">";
            }
            var mobileFormContentTmpl = '';
            var buttonTemplate = '';
            // Include mobile-navbar above the form when formlayout is set to page
            if (attrs.get('formlayout') === 'page') {
                var name_1 = "device_liveform_header_" + counter;
                var navbarAttrsMap = new Map();
                navbarAttrsMap.set('title', attrs.get('title'));
                navbarAttrsMap.set('backbtnclick.event', attrs.get('backbtnclick.event'));
                buttonTemplate = "<ng-template #buttonRef let-btn=\"btn\">\n                                            <button  wmButton name=\"{{btn.key}}\" class=\"navbar-btn btn-primary btn-transparent\" iconclass.bind=\"btn.iconclass\" show.bind=\"btn.show\"\n                                                     (click)=\"" + counter + ".invokeActionEvent($event, btn.action)\" type.bind=\"btn.type\" hint.bind=\"btn.title\" shortcutkey.bind=\"btn.shortcutkey\" disabled.bind=\"btn.disabled\"\n                                                     tabindex.bind=\"btn.tabindex\" [class.hidden]=\"btn.updateMode ? !" + counter + ".isUpdateMode : " + counter + ".isUpdateMode\"></button>\n                                        </ng-template>";
                mobileFormContentTmpl = "<header wmMobileNavbar name=\"" + name_1 + "\" " + getAttrMarkup(navbarAttrsMap) + ">\n                                            <ng-container *ngFor=\"let btn of " + counter + ".buttonArray\" [ngTemplateOutlet]=\"buttonRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n                                            </ng-container>\n                                        </header>\n                                        <div class=\"form-elements panel-body\" >";
            }
            tmpl = getAttrMarkup(attrs);
            return liveFormTmpl + " " + tmpl + " " + dependsOn + ">\n                       " + buttonTemplate + " " + mobileFormContentTmpl;
        },
        post: function (attrs) {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            if (attrs.get('formlayout') === 'page') {
                return "</div></" + tagName + ">";
            }
            return "</" + tagName + ">";
        },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
var ɵ2 = buildTask;
register('wm-form', buildTask);
register('wm-liveform', function () { return buildTask('wmLiveForm'); });
register('wm-livefilter', function () { return buildTask('wmLiveFilter'); });
export default (function () { });
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9mb3JtLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUV2RCxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsSUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkMsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDeEIsU0FBUztJQUNULGFBQWE7SUFDYixhQUFhO0lBQ2IsV0FBVztJQUNYLG1CQUFtQjtJQUNuQixhQUFhO0lBQ2IsV0FBVztJQUNYLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLFNBQVM7SUFDVCxTQUFTO0lBQ1QsY0FBYztJQUNkLFdBQVc7SUFDWCxXQUFXO0lBQ1gsYUFBYTtJQUNiLFdBQVc7SUFDWCxVQUFVO0lBQ1YsZ0JBQWdCO0lBQ2hCLFVBQVU7Q0FDYixDQUFDLENBQUM7QUFFSCxJQUFNLGtCQUFrQixHQUFHLFVBQUMsUUFBYTtJQUFiLHlCQUFBLEVBQUEsYUFBYTtJQUNyQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztRQUN0QixJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pDLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQTNDLENBQTJDLENBQUMsQ0FBQztZQUN0RixHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDdkIsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFPLENBQUMsRUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVFLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQU8sQ0FBQyxFQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0U7UUFDRCxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7O0FBRUYsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLE9BQU87SUFDakMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1FBQzlCLElBQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDbkUsSUFBSSxjQUFjLEVBQUU7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUN0RDtLQUNKO0FBQ0wsQ0FBQyxDQUFDOztBQUVGLElBQU0sU0FBUyxHQUFHLFVBQUMsYUFBa0I7SUFBbEIsOEJBQUEsRUFBQSxrQkFBa0I7SUFDakMsT0FBTztRQUNILFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUM7UUFDdEMsUUFBUSxFQUFFLFVBQUMsSUFBYTtZQUNwQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUNELEdBQUcsRUFBRSxVQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLGlCQUFpQjtZQUNuRCxJQUFJLElBQUksQ0FBQztZQUNULElBQUksUUFBUSxDQUFDO1lBQ2IsSUFBTSxJQUFJLEdBQUcsaUJBQWlCLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN0RixJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEMsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDeEYsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJDQUEyQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDeEcsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3pGLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUIsSUFBTSxZQUFZLEdBQUcsTUFBSSxPQUFPLHVCQUFpQixJQUFJLFdBQUssYUFBYSxVQUFLLE9BQU8sd0NBQWtDLE9BQU8saUNBQTBCLE9BQU8sa0VBQzVJLFNBQVMscUJBQWMsT0FBTyw4Q0FBdUMsT0FBTyx1REFBaUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBRyxDQUFDO1lBQzdLLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVCLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQ3RDLFFBQVEsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQXNCLE9BQVMsQ0FBQztnQkFDekcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2hDLElBQU0sZ0JBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztnQkFDakQsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtvQkFDM0IsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNqQixnQkFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUM3QztnQkFDSixDQUFDLENBQUMsQ0FBQztnQkFDSCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDNUIsT0FBTywwRkFBb0YsU0FBUyxvQkFBYyxRQUFRLDRGQUM1RCxRQUFRLHlCQUFpQixhQUFhLENBQUMsZ0JBQWMsQ0FBQyw2R0FFdEcsWUFBWSxTQUFJLElBQUksTUFBRyxDQUFDO2FBQ3pDO1lBQ0QsSUFBSSxxQkFBcUIsR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLHNFQUFzRTtZQUN0RSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssTUFBTSxFQUFFO2dCQUNwQyxJQUFNLE1BQUksR0FBRyw0QkFBMEIsT0FBUyxDQUFDO2dCQUNqRCxJQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztnQkFDakQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxjQUFjLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxjQUFjLEdBQUcsMlNBRStCLE9BQU8sNFJBQytDLE9BQU8sd0JBQW1CLE9BQU8sc0ZBQ2hHLENBQUM7Z0JBQ3hDLHFCQUFxQixHQUFHLG1DQUFnQyxNQUFJLFdBQUssYUFBYSxDQUFDLGNBQWMsQ0FBQyx5RkFDL0IsT0FBTyxnU0FHTixDQUFDO2FBQ3BFO1lBRUQsSUFBSSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixPQUFVLFlBQVksU0FBSSxJQUFJLFNBQUksU0FBUyxrQ0FDOUIsY0FBYyxTQUFJLHFCQUF1QixDQUFDO1FBQzNELENBQUM7UUFDRCxJQUFJLEVBQUUsVUFBQyxLQUFLO1lBQ1IsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDdEMsT0FBTyxtQ0FBbUMsQ0FBQzthQUM5QztZQUNELElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxNQUFNLEVBQUU7Z0JBQ3BDLE9BQU8sYUFBVyxPQUFPLE1BQUcsQ0FBQzthQUNoQztZQUNELE9BQU8sT0FBSyxPQUFPLE1BQUcsQ0FBQztRQUMzQixDQUFDO1FBQ0QsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFFLE1BQU07WUFDbkIsSUFBTSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0RCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQzs7QUFFRixRQUFRLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsQ0FBQyxhQUFhLEVBQUUsY0FBTSxPQUFBLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO0FBQ3ZELFFBQVEsQ0FBQyxlQUFlLEVBQUUsY0FBTSxPQUFBLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO0FBRTNELGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBFbGVtZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5pbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciwgZ2V0RGF0YVNvdXJjZSB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcbmltcG9ydCB7IElER2VuZXJhdG9yIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Zvcm0nO1xuY29uc3QgaWRHZW4gPSBuZXcgSURHZW5lcmF0b3IoJ2Zvcm1fJyk7XG5cbmNvbnN0IGZvcm1XaWRnZXRzID0gbmV3IFNldChbXG4gICAgJ3dtLXRleHQnLFxuICAgICd3bS10ZXh0YXJlYScsXG4gICAgJ3dtLWNoZWNrYm94JyxcbiAgICAnd20tc2xpZGVyJyxcbiAgICAnd20tcmljaHRleHRlZGl0b3InLFxuICAgICd3bS1jdXJyZW5jeScsXG4gICAgJ3dtLXN3aXRjaCcsXG4gICAgJ3dtLXNlbGVjdCcsXG4gICAgJ3dtLWNoZWNrYm94c2V0JyxcbiAgICAnd20tcmFkaW9zZXQnLFxuICAgICd3bS1kYXRlJyxcbiAgICAnd20tdGltZScsXG4gICAgJ3dtLXRpbWVzdGFtcCcsXG4gICAgJ3dtLXVwbG9hZCcsXG4gICAgJ3dtLXJhdGluZycsXG4gICAgJ3dtLWRhdGV0aW1lJyxcbiAgICAnd20tc2VhcmNoJyxcbiAgICAnd20tY2hpcHMnLFxuICAgICd3bS1jb2xvcnBpY2tlcicsXG4gICAgJ3dtLXRhYmxlJ1xuXSk7XG5cbmNvbnN0IGFkZEZvcm1Db250cm9sTmFtZSA9IChjaGlsZHJlbiA9IFtdKSA9PiB7XG4gICAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZE5vZGUgPT4ge1xuICAgICAgICBpZiAoZm9ybVdpZGdldHMuaGFzKGNoaWxkTm9kZS5uYW1lKSkge1xuICAgICAgICAgICAgbGV0IGtleSA9IGNoaWxkTm9kZS5hdHRycy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09ICdrZXknIHx8IGF0dHIubmFtZSA9PT0gJ25hbWUnKTtcbiAgICAgICAgICAgIGtleSA9IGtleSAmJiBrZXkudmFsdWU7XG4gICAgICAgICAgICBjaGlsZE5vZGUuYXR0cnMucHVzaChuZXcgQXR0cmlidXRlKCdmb3JtQ29udHJvbE5hbWUnLCBrZXksIDxhbnk+MSwgPGFueT4xKSk7XG4gICAgICAgICAgICBjaGlsZE5vZGUuYXR0cnMucHVzaChuZXcgQXR0cmlidXRlKCd3bUZvcm1XaWRnZXQnLCAnJywgPGFueT4xLCA8YW55PjEpKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRGb3JtQ29udHJvbE5hbWUoY2hpbGROb2RlLmNoaWxkcmVuKTtcbiAgICB9KTtcbn07XG5cbmNvbnN0IHVwZGF0ZUZvcm1EYXRhU291cmNlID0gKGF0dHJNYXApID0+IHtcbiAgICBpZiAoYXR0ck1hcC5nZXQoJ2Zvcm1kYXRhLmJpbmQnKSkge1xuICAgICAgICBjb25zdCBmb3JtRGF0YVNvdXJjZSA9IGdldERhdGFTb3VyY2UoYXR0ck1hcC5nZXQoJ2Zvcm1kYXRhLmJpbmQnKSk7XG4gICAgICAgIGlmIChmb3JtRGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgYXR0ck1hcC5zZXQoJ2Zvcm1kYXRhc291cmNlLmJpbmQnLCBmb3JtRGF0YVNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBidWlsZFRhc2sgPSAoZGlyZWN0aXZlQXR0ciA9ICcnKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVxdWlyZXM6IFsnd20tbGl2ZXRhYmxlJywgJ3dtLWxvZ2luJ10sXG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgYWRkRm9ybUNvbnRyb2xOYW1lKG5vZGUuY2hpbGRyZW4pO1xuICAgICAgICB9LFxuICAgICAgICBwcmU6IChhdHRycywgc2hhcmVkLCBwYXJlbnRMaXZlVGFibGUsIHBhcmVudExvZ2luV2lkZ2V0KSA9PiB7XG4gICAgICAgICAgICBsZXQgdG1wbDtcbiAgICAgICAgICAgIGxldCBkaWFsb2dJZDtcbiAgICAgICAgICAgIGNvbnN0IHJvbGUgPSBwYXJlbnRMb2dpbldpZGdldCAmJiBwYXJlbnRMb2dpbldpZGdldC5nZXQoJ2lzTG9naW4nKSA/ICdhcHAtbG9naW4nIDogJyc7XG4gICAgICAgICAgICBjb25zdCBjb3VudGVyID0gaWRHZW4ubmV4dFVpZCgpO1xuICAgICAgICAgICAgY29uc3QgZGVwZW5kc09uID0gYXR0cnMuZ2V0KCdkZXBlbmRzb24nKSA/IGBkZXBlbmRzb249XCIke2F0dHJzLmdldCgnZGVwZW5kc29uJyl9XCJgIDogJyc7XG4gICAgICAgICAgICBjb25zdCBjbGFzc1Byb3AgPSBhdHRycy5nZXQoJ2Zvcm1sYXlvdXQnKSA9PT0gJ3BhZ2UnID8gJ2FwcC1kZXZpY2UtbGl2ZWZvcm0gcGFuZWwgbGl2ZWZvcm0taW5saW5lJyA6ICcnO1xuICAgICAgICAgICAgY29uc3QgZGlhbG9nQXR0cmlidXRlcyA9IFsndGl0bGUnLCAndGl0bGUuYmluZCcsICdpY29uY2xhc3MnLCAnaWNvbmNsYXNzLmJpbmQnLCAnd2lkdGgnXTtcbiAgICAgICAgICAgIGF0dHJzLmRlbGV0ZSgnZGVwZW5kc29uJyk7XG4gICAgICAgICAgICBjb25zdCBsaXZlRm9ybVRtcGwgPSBgPCR7dGFnTmFtZX0gd21Gb3JtIHJvbGU9XCIke3JvbGV9XCIgJHtkaXJlY3RpdmVBdHRyfSAjJHtjb3VudGVyfSBuZ05hdGl2ZVZhbGlkYXRlIFtmb3JtR3JvdXBdPVwiJHtjb3VudGVyfS5uZ2Zvcm1cIiBbbm9WYWxpZGF0ZV09XCIke2NvdW50ZXJ9LnZhbGlkYXRpb250eXBlICE9PSAnaHRtbCdcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIiR7Y2xhc3NQcm9wfVwiIFtjbGFzc109XCIke2NvdW50ZXJ9LmNhcHRpb25BbGlnbkNsYXNzXCIgW2F1dG9jb21wbGV0ZV09XCIke2NvdW50ZXJ9LmF1dG9jb21wbGV0ZSA/ICdvbicgOiAnb2ZmJ1wiIGNhcHRpb25wb3NpdGlvbj0ke2F0dHJzLmdldCgnY2FwdGlvbnBvc2l0aW9uJyl9YDtcbiAgICAgICAgICAgIHNoYXJlZC5zZXQoJ2NvdW50ZXInLCBjb3VudGVyKTtcbiAgICAgICAgICAgIHVwZGF0ZUZvcm1EYXRhU291cmNlKGF0dHJzKTtcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2Zvcm1sYXlvdXQnKSA9PT0gJ2RpYWxvZycpIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dJZCA9IHBhcmVudExpdmVUYWJsZSA/IHBhcmVudExpdmVUYWJsZS5nZXQoJ2xpdmVmb3JtX2RpYWxvZ19pZCcpIDogYGxpdmVmb3JtX2RpYWxvZ19pZF8ke2NvdW50ZXJ9YDtcbiAgICAgICAgICAgICAgICBhdHRycy5zZXQoJ2RpYWxvZ0lkJywgZGlhbG9nSWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpYWxvZ0F0dHJzTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICBkaWFsb2dBdHRyaWJ1dGVzLmZvckVhY2goKGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZ0F0dHJzTWFwLnNldChhdHRyLCBhdHRycy5nZXQoYXR0cikpO1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhdHRycy5zZXQoJ3dpZHRoJywgJzEwMCUnKTtcbiAgICAgICAgICAgICAgICB0bXBsID0gZ2V0QXR0ck1hcmt1cChhdHRycyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IGRhdGEtaWRlbnRpZmllcj1cImxpdmVmb3JtXCIgaW5pdC13aWRnZXQgY2xhc3M9XCJhcHAtbGl2ZWZvcm0gbGl2ZWZvcm0tZGlhbG9nXCIgJHtkZXBlbmRzT259IGRpYWxvZ2lkPVwiJHtkaWFsb2dJZH1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHdtRGlhbG9nIGNsYXNzPVwiYXBwLWxpdmVmb3JtLWRpYWxvZ1wiIG5hbWU9XCIke2RpYWxvZ0lkfVwiIHJvbGU9XCJmb3JtXCIgJHtnZXRBdHRyTWFya3VwKGRpYWxvZ0F0dHJzTWFwKX0gbW9kYWw9XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlICNkaWFsb2dCb2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7bGl2ZUZvcm1UbXBsfSAke3RtcGx9PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbW9iaWxlRm9ybUNvbnRlbnRUbXBsID0gJyc7XG4gICAgICAgICAgICBsZXQgYnV0dG9uVGVtcGxhdGUgPSAnJztcbiAgICAgICAgICAgIC8vIEluY2x1ZGUgbW9iaWxlLW5hdmJhciBhYm92ZSB0aGUgZm9ybSB3aGVuIGZvcm1sYXlvdXQgaXMgc2V0IHRvIHBhZ2VcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2Zvcm1sYXlvdXQnKSA9PT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGBkZXZpY2VfbGl2ZWZvcm1faGVhZGVyXyR7Y291bnRlcn1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hdmJhckF0dHJzTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICBuYXZiYXJBdHRyc01hcC5zZXQoJ3RpdGxlJywgYXR0cnMuZ2V0KCd0aXRsZScpKTtcbiAgICAgICAgICAgICAgICBuYXZiYXJBdHRyc01hcC5zZXQoJ2JhY2tidG5jbGljay5ldmVudCcsIGF0dHJzLmdldCgnYmFja2J0bmNsaWNrLmV2ZW50JykpO1xuICAgICAgICAgICAgICAgIGJ1dHRvblRlbXBsYXRlID0gYDxuZy10ZW1wbGF0ZSAjYnV0dG9uUmVmIGxldC1idG49XCJidG5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiAgd21CdXR0b24gbmFtZT1cInt7YnRuLmtleX19XCIgY2xhc3M9XCJuYXZiYXItYnRuIGJ0bi1wcmltYXJ5IGJ0bi10cmFuc3BhcmVudFwiIGljb25jbGFzcy5iaW5kPVwiYnRuLmljb25jbGFzc1wiIHNob3cuYmluZD1cImJ0bi5zaG93XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cIiR7Y291bnRlcn0uaW52b2tlQWN0aW9uRXZlbnQoJGV2ZW50LCBidG4uYWN0aW9uKVwiIHR5cGUuYmluZD1cImJ0bi50eXBlXCIgaGludC5iaW5kPVwiYnRuLnRpdGxlXCIgc2hvcnRjdXRrZXkuYmluZD1cImJ0bi5zaG9ydGN1dGtleVwiIGRpc2FibGVkLmJpbmQ9XCJidG4uZGlzYWJsZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJpbmRleC5iaW5kPVwiYnRuLnRhYmluZGV4XCIgW2NsYXNzLmhpZGRlbl09XCJidG4udXBkYXRlTW9kZSA/ICEke2NvdW50ZXJ9LmlzVXBkYXRlTW9kZSA6ICR7Y291bnRlcn0uaXNVcGRhdGVNb2RlXCI+PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5gO1xuICAgICAgICAgICAgICAgIG1vYmlsZUZvcm1Db250ZW50VG1wbCA9IGA8aGVhZGVyIHdtTW9iaWxlTmF2YmFyIG5hbWU9XCIke25hbWV9XCIgJHtnZXRBdHRyTWFya3VwKG5hdmJhckF0dHJzTWFwKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nRm9yPVwibGV0IGJ0biBvZiAke2NvdW50ZXJ9LmJ1dHRvbkFycmF5XCIgW25nVGVtcGxhdGVPdXRsZXRdPVwiYnV0dG9uUmVmXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntidG46YnRufVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZm9ybS1lbGVtZW50cyBwYW5lbC1ib2R5XCIgPmA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRtcGwgPSBnZXRBdHRyTWFya3VwKGF0dHJzKTtcbiAgICAgICAgICAgIHJldHVybiBgJHtsaXZlRm9ybVRtcGx9ICR7dG1wbH0gJHtkZXBlbmRzT259PlxuICAgICAgICAgICAgICAgICAgICAgICAke2J1dHRvblRlbXBsYXRlfSAke21vYmlsZUZvcm1Db250ZW50VG1wbH1gO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0OiAoYXR0cnMpID0+IHtcbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2Zvcm1sYXlvdXQnKSA9PT0gJ2RpYWxvZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJzwvZm9ybT48L25nLXRlbXBsYXRlPjwvZGl2PjwvZGl2Pic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdmb3JtbGF5b3V0JykgPT09ICdwYWdlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBgPC9kaXY+PC8ke3RhZ05hbWV9PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYDwvJHt0YWdOYW1lfT5gO1xuICAgICAgICB9LFxuICAgICAgICBwcm92aWRlOiAoYXR0cnMsIHNoYXJlZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBwcm92aWRlci5zZXQoJ2Zvcm1fcmVmZXJlbmNlJywgc2hhcmVkLmdldCgnY291bnRlcicpKTtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5yZWdpc3Rlcignd20tZm9ybScsIGJ1aWxkVGFzayk7XG5yZWdpc3Rlcignd20tbGl2ZWZvcm0nLCAoKSA9PiBidWlsZFRhc2soJ3dtTGl2ZUZvcm0nKSk7XG5yZWdpc3Rlcignd20tbGl2ZWZpbHRlcicsICgpID0+IGJ1aWxkVGFzaygnd21MaXZlRmlsdGVyJykpO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==