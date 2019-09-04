import { Attribute } from '@angular/compiler';
import { getAttrMarkup, register, getDataSource } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';
const tagName = 'form';
const idGen = new IDGenerator('form_');
const formWidgets = new Set([
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
const addFormControlName = (children = []) => {
    children.forEach(childNode => {
        if (formWidgets.has(childNode.name)) {
            let key = childNode.attrs.find((attr) => attr.name === 'key' || attr.name === 'name');
            key = key && key.value;
            childNode.attrs.push(new Attribute('formControlName', key, 1, 1));
            childNode.attrs.push(new Attribute('wmFormWidget', '', 1, 1));
        }
        addFormControlName(childNode.children);
    });
};
const ɵ0 = addFormControlName;
const updateFormDataSource = (attrMap) => {
    if (attrMap.get('formdata.bind')) {
        const formDataSource = getDataSource(attrMap.get('formdata.bind'));
        if (formDataSource) {
            attrMap.set('formdatasource.bind', formDataSource);
        }
    }
};
const ɵ1 = updateFormDataSource;
const buildTask = (directiveAttr = '') => {
    return {
        requires: ['wm-livetable', 'wm-login'],
        template: (node) => {
            addFormControlName(node.children);
        },
        pre: (attrs, shared, parentLiveTable, parentLoginWidget) => {
            let tmpl;
            let dialogId;
            const role = parentLoginWidget && parentLoginWidget.get('isLogin') ? 'app-login' : '';
            const counter = idGen.nextUid();
            const dependsOn = attrs.get('dependson') ? `dependson="${attrs.get('dependson')}"` : '';
            const classProp = attrs.get('formlayout') === 'page' ? 'app-device-liveform panel liveform-inline' : '';
            const dialogAttributes = ['title', 'title.bind', 'iconclass', 'iconclass.bind', 'width'];
            attrs.delete('dependson');
            const liveFormTmpl = `<${tagName} wmForm role="${role}" ${directiveAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngform" [noValidate]="${counter}.validationtype !== 'html'"
                    class="${classProp}" [class]="${counter}.captionAlignClass" [autocomplete]="${counter}.autocomplete ? 'on' : 'off'" captionposition=${attrs.get('captionposition')}`;
            shared.set('counter', counter);
            updateFormDataSource(attrs);
            if (attrs.get('formlayout') === 'dialog') {
                dialogId = parentLiveTable ? parentLiveTable.get('liveform_dialog_id') : `liveform_dialog_id_${counter}`;
                attrs.set('dialogId', dialogId);
                const dialogAttrsMap = new Map();
                dialogAttributes.forEach((attr) => {
                    if (attrs.get(attr)) {
                        dialogAttrsMap.set(attr, attrs.get(attr));
                    }
                });
                attrs.set('width', '100%');
                tmpl = getAttrMarkup(attrs);
                return `<div data-identifier="liveform" init-widget class="app-liveform liveform-dialog" ${dependsOn} dialogid="${dialogId}">
                            <div wmDialog class="app-liveform-dialog" name="${dialogId}" role="form" ${getAttrMarkup(dialogAttrsMap)} modal="true">
                            <ng-template #dialogBody>
                            ${liveFormTmpl} ${tmpl}>`;
            }
            let mobileFormContentTmpl = '';
            let buttonTemplate = '';
            // Include mobile-navbar above the form when formlayout is set to page
            if (attrs.get('formlayout') === 'page') {
                const name = `device_liveform_header_${counter}`;
                const navbarAttrsMap = new Map();
                navbarAttrsMap.set('title', attrs.get('title'));
                navbarAttrsMap.set('backbtnclick.event', attrs.get('backbtnclick.event'));
                buttonTemplate = `<ng-template #buttonRef let-btn="btn">
                                            <button  wmButton name="{{btn.key}}" class="navbar-btn btn-primary btn-transparent" iconclass.bind="btn.iconclass" show.bind="btn.show"
                                                     (click)="${counter}.invokeActionEvent($event, btn.action)" type.bind="btn.type" hint.bind="btn.title" shortcutkey.bind="btn.shortcutkey" disabled.bind="btn.disabled"
                                                     tabindex.bind="btn.tabindex" [class.hidden]="btn.updateMode ? !${counter}.isUpdateMode : ${counter}.isUpdateMode"></button>
                                        </ng-template>`;
                mobileFormContentTmpl = `<header wmMobileNavbar name="${name}" ${getAttrMarkup(navbarAttrsMap)}>
                                            <ng-container *ngFor="let btn of ${counter}.buttonArray" [ngTemplateOutlet]="buttonRef" [ngTemplateOutletContext]="{btn:btn}">
                                            </ng-container>
                                        </header>
                                        <div class="form-elements panel-body" >`;
            }
            tmpl = getAttrMarkup(attrs);
            return `${liveFormTmpl} ${tmpl} ${dependsOn}>
                       ${buttonTemplate} ${mobileFormContentTmpl}`;
        },
        post: (attrs) => {
            if (attrs.get('formlayout') === 'dialog') {
                return '</form></ng-template></div></div>';
            }
            if (attrs.get('formlayout') === 'page') {
                return `</div></${tagName}>`;
            }
            return `</${tagName}>`;
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};
const ɵ2 = buildTask;
register('wm-form', buildTask);
register('wm-liveform', () => buildTask('wmLiveForm'));
register('wm-livefilter', () => buildTask('wmLiveFilter'));
export default () => { };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9mb3JtLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVcsTUFBTSxtQkFBbUIsQ0FBQztBQUV2RCxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFdkMsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDeEIsU0FBUztJQUNULGFBQWE7SUFDYixhQUFhO0lBQ2IsV0FBVztJQUNYLG1CQUFtQjtJQUNuQixhQUFhO0lBQ2IsV0FBVztJQUNYLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLFNBQVM7SUFDVCxTQUFTO0lBQ1QsY0FBYztJQUNkLFdBQVc7SUFDWCxXQUFXO0lBQ1gsYUFBYTtJQUNiLFdBQVc7SUFDWCxVQUFVO0lBQ1YsZ0JBQWdCO0lBQ2hCLFVBQVU7Q0FDYixDQUFDLENBQUM7QUFFSCxNQUFNLGtCQUFrQixHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQ3pDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDekIsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQyxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLElB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Q3ZELFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFFM0QsZUFBZSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIEVsZW1lbnQgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyLCBnZXREYXRhU291cmNlIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuaW1wb3J0IHsgSURHZW5lcmF0b3IgfSBmcm9tICdAd20vY29yZSc7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZm9ybSc7XG5jb25zdCBpZEdlbiA9IG5ldyBJREdlbmVyYXRvcignZm9ybV8nKTtcblxuY29uc3QgZm9ybVdpZGdldHMgPSBuZXcgU2V0KFtcbiAgICAnd20tdGV4dCcsXG4gICAgJ3dtLXRleHRhcmVhJyxcbiAgICAnd20tY2hlY2tib3gnLFxuICAgICd3bS1zbGlkZXInLFxuICAgICd3bS1yaWNodGV4dGVkaXRvcicsXG4gICAgJ3dtLWN1cnJlbmN5JyxcbiAgICAnd20tc3dpdGNoJyxcbiAgICAnd20tc2VsZWN0JyxcbiAgICAnd20tY2hlY2tib3hzZXQnLFxuICAgICd3bS1yYWRpb3NldCcsXG4gICAgJ3dtLWRhdGUnLFxuICAgICd3bS10aW1lJyxcbiAgICAnd20tdGltZXN0YW1wJyxcbiAgICAnd20tdXBsb2FkJyxcbiAgICAnd20tcmF0aW5nJyxcbiAgICAnd20tZGF0ZXRpbWUnLFxuICAgICd3bS1zZWFyY2gnLFxuICAgICd3bS1jaGlwcycsXG4gICAgJ3dtLWNvbG9ycGlja2VyJyxcbiAgICAnd20tdGFibGUnXG5dKTtcblxuY29uc3QgYWRkRm9ybUNvbnRyb2xOYW1lID0gKGNoaWxkcmVuID0gW10pID0+IHtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkTm9kZSA9PiB7XG4gICAgICAgIGlmIChmb3JtV2lkZ2V0cy5oYXMoY2hpbGROb2RlLm5hbWUpKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0gY2hpbGROb2RlLmF0dHJzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gJ2tleScgfHwgYXR0ci5uYW1lID09PSAnbmFtZScpO1xuICAgICAgICAgICAga2V5ID0ga2V5ICYmIGtleS52YWx1ZTtcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hdHRycy5wdXNoKG5ldyBBdHRyaWJ1dGUoJ2Zvcm1Db250cm9sTmFtZScsIGtleSwgPGFueT4xLCA8YW55PjEpKTtcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hdHRycy5wdXNoKG5ldyBBdHRyaWJ1dGUoJ3dtRm9ybVdpZGdldCcsICcnLCA8YW55PjEsIDxhbnk+MSkpO1xuICAgICAgICB9XG4gICAgICAgIGFkZEZvcm1Db250cm9sTmFtZShjaGlsZE5vZGUuY2hpbGRyZW4pO1xuICAgIH0pO1xufTtcblxuY29uc3QgdXBkYXRlRm9ybURhdGFTb3VyY2UgPSAoYXR0ck1hcCkgPT4ge1xuICAgIGlmIChhdHRyTWFwLmdldCgnZm9ybWRhdGEuYmluZCcpKSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhU291cmNlID0gZ2V0RGF0YVNvdXJjZShhdHRyTWFwLmdldCgnZm9ybWRhdGEuYmluZCcpKTtcbiAgICAgICAgaWYgKGZvcm1EYXRhU291cmNlKSB7XG4gICAgICAgICAgICBhdHRyTWFwLnNldCgnZm9ybWRhdGFzb3VyY2UuYmluZCcsIGZvcm1EYXRhU291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IGJ1aWxkVGFzayA9IChkaXJlY3RpdmVBdHRyID0gJycpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlczogWyd3bS1saXZldGFibGUnLCAnd20tbG9naW4nXSxcbiAgICAgICAgdGVtcGxhdGU6IChub2RlOiBFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBhZGRGb3JtQ29udHJvbE5hbWUobm9kZS5jaGlsZHJlbik7XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogKGF0dHJzLCBzaGFyZWQsIHBhcmVudExpdmVUYWJsZSwgcGFyZW50TG9naW5XaWRnZXQpID0+IHtcbiAgICAgICAgICAgIGxldCB0bXBsO1xuICAgICAgICAgICAgbGV0IGRpYWxvZ0lkO1xuICAgICAgICAgICAgY29uc3Qgcm9sZSA9IHBhcmVudExvZ2luV2lkZ2V0ICYmIHBhcmVudExvZ2luV2lkZ2V0LmdldCgnaXNMb2dpbicpID8gJ2FwcC1sb2dpbicgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ZXIgPSBpZEdlbi5uZXh0VWlkKCk7XG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzT24gPSBhdHRycy5nZXQoJ2RlcGVuZHNvbicpID8gYGRlcGVuZHNvbj1cIiR7YXR0cnMuZ2V0KCdkZXBlbmRzb24nKX1cImAgOiAnJztcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzUHJvcCA9IGF0dHJzLmdldCgnZm9ybWxheW91dCcpID09PSAncGFnZScgPyAnYXBwLWRldmljZS1saXZlZm9ybSBwYW5lbCBsaXZlZm9ybS1pbmxpbmUnIDogJyc7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dBdHRyaWJ1dGVzID0gWyd0aXRsZScsICd0aXRsZS5iaW5kJywgJ2ljb25jbGFzcycsICdpY29uY2xhc3MuYmluZCcsICd3aWR0aCddO1xuICAgICAgICAgICAgYXR0cnMuZGVsZXRlKCdkZXBlbmRzb24nKTtcbiAgICAgICAgICAgIGNvbnN0IGxpdmVGb3JtVG1wbCA9IGA8JHt0YWdOYW1lfSB3bUZvcm0gcm9sZT1cIiR7cm9sZX1cIiAke2RpcmVjdGl2ZUF0dHJ9ICMke2NvdW50ZXJ9IG5nTmF0aXZlVmFsaWRhdGUgW2Zvcm1Hcm91cF09XCIke2NvdW50ZXJ9Lm5nZm9ybVwiIFtub1ZhbGlkYXRlXT1cIiR7Y291bnRlcn0udmFsaWRhdGlvbnR5cGUgIT09ICdodG1sJ1wiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiJHtjbGFzc1Byb3B9XCIgW2NsYXNzXT1cIiR7Y291bnRlcn0uY2FwdGlvbkFsaWduQ2xhc3NcIiBbYXV0b2NvbXBsZXRlXT1cIiR7Y291bnRlcn0uYXV0b2NvbXBsZXRlID8gJ29uJyA6ICdvZmYnXCIgY2FwdGlvbnBvc2l0aW9uPSR7YXR0cnMuZ2V0KCdjYXB0aW9ucG9zaXRpb24nKX1gO1xuICAgICAgICAgICAgc2hhcmVkLnNldCgnY291bnRlcicsIGNvdW50ZXIpO1xuICAgICAgICAgICAgdXBkYXRlRm9ybURhdGFTb3VyY2UoYXR0cnMpO1xuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnZm9ybWxheW91dCcpID09PSAnZGlhbG9nJykge1xuICAgICAgICAgICAgICAgIGRpYWxvZ0lkID0gcGFyZW50TGl2ZVRhYmxlID8gcGFyZW50TGl2ZVRhYmxlLmdldCgnbGl2ZWZvcm1fZGlhbG9nX2lkJykgOiBgbGl2ZWZvcm1fZGlhbG9nX2lkXyR7Y291bnRlcn1gO1xuICAgICAgICAgICAgICAgIGF0dHJzLnNldCgnZGlhbG9nSWQnLCBkaWFsb2dJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlhbG9nQXR0cnNNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgICAgICAgICAgIGRpYWxvZ0F0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICAgICAgICAgICAgIGlmIChhdHRycy5nZXQoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgZGlhbG9nQXR0cnNNYXAuc2V0KGF0dHIsIGF0dHJzLmdldChhdHRyKSk7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGF0dHJzLnNldCgnd2lkdGgnLCAnMTAwJScpO1xuICAgICAgICAgICAgICAgIHRtcGwgPSBnZXRBdHRyTWFya3VwKGF0dHJzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXYgZGF0YS1pZGVudGlmaWVyPVwibGl2ZWZvcm1cIiBpbml0LXdpZGdldCBjbGFzcz1cImFwcC1saXZlZm9ybSBsaXZlZm9ybS1kaWFsb2dcIiAke2RlcGVuZHNPbn0gZGlhbG9naWQ9XCIke2RpYWxvZ0lkfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgd21EaWFsb2cgY2xhc3M9XCJhcHAtbGl2ZWZvcm0tZGlhbG9nXCIgbmFtZT1cIiR7ZGlhbG9nSWR9XCIgcm9sZT1cImZvcm1cIiAke2dldEF0dHJNYXJrdXAoZGlhbG9nQXR0cnNNYXApfSBtb2RhbD1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgI2RpYWxvZ0JvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtsaXZlRm9ybVRtcGx9ICR7dG1wbH0+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBtb2JpbGVGb3JtQ29udGVudFRtcGwgPSAnJztcbiAgICAgICAgICAgIGxldCBidXR0b25UZW1wbGF0ZSA9ICcnO1xuICAgICAgICAgICAgLy8gSW5jbHVkZSBtb2JpbGUtbmF2YmFyIGFib3ZlIHRoZSBmb3JtIHdoZW4gZm9ybWxheW91dCBpcyBzZXQgdG8gcGFnZVxuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnZm9ybWxheW91dCcpID09PSAncGFnZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gYGRldmljZV9saXZlZm9ybV9oZWFkZXJfJHtjb3VudGVyfWA7XG4gICAgICAgICAgICAgICAgY29uc3QgbmF2YmFyQXR0cnNNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICAgICAgICAgICAgICAgIG5hdmJhckF0dHJzTWFwLnNldCgndGl0bGUnLCBhdHRycy5nZXQoJ3RpdGxlJykpO1xuICAgICAgICAgICAgICAgIG5hdmJhckF0dHJzTWFwLnNldCgnYmFja2J0bmNsaWNrLmV2ZW50JywgYXR0cnMuZ2V0KCdiYWNrYnRuY2xpY2suZXZlbnQnKSk7XG4gICAgICAgICAgICAgICAgYnV0dG9uVGVtcGxhdGUgPSBgPG5nLXRlbXBsYXRlICNidXR0b25SZWYgbGV0LWJ0bj1cImJ0blwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uICB3bUJ1dHRvbiBuYW1lPVwie3tidG4ua2V5fX1cIiBjbGFzcz1cIm5hdmJhci1idG4gYnRuLXByaW1hcnkgYnRuLXRyYW5zcGFyZW50XCIgaWNvbmNsYXNzLmJpbmQ9XCJidG4uaWNvbmNsYXNzXCIgc2hvdy5iaW5kPVwiYnRuLnNob3dcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwiJHtjb3VudGVyfS5pbnZva2VBY3Rpb25FdmVudCgkZXZlbnQsIGJ0bi5hY3Rpb24pXCIgdHlwZS5iaW5kPVwiYnRuLnR5cGVcIiBoaW50LmJpbmQ9XCJidG4udGl0bGVcIiBzaG9ydGN1dGtleS5iaW5kPVwiYnRuLnNob3J0Y3V0a2V5XCIgZGlzYWJsZWQuYmluZD1cImJ0bi5kaXNhYmxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmluZGV4LmJpbmQ9XCJidG4udGFiaW5kZXhcIiBbY2xhc3MuaGlkZGVuXT1cImJ0bi51cGRhdGVNb2RlID8gISR7Y291bnRlcn0uaXNVcGRhdGVNb2RlIDogJHtjb3VudGVyfS5pc1VwZGF0ZU1vZGVcIj48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPmA7XG4gICAgICAgICAgICAgICAgbW9iaWxlRm9ybUNvbnRlbnRUbXBsID0gYDxoZWFkZXIgd21Nb2JpbGVOYXZiYXIgbmFtZT1cIiR7bmFtZX1cIiAke2dldEF0dHJNYXJrdXAobmF2YmFyQXR0cnNNYXApfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdGb3I9XCJsZXQgYnRuIG9mICR7Y291bnRlcn0uYnV0dG9uQXJyYXlcIiBbbmdUZW1wbGF0ZU91dGxldF09XCJidXR0b25SZWZcIiBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie2J0bjpidG59XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWVsZW1lbnRzIHBhbmVsLWJvZHlcIiA+YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG1wbCA9IGdldEF0dHJNYXJrdXAoYXR0cnMpO1xuICAgICAgICAgICAgcmV0dXJuIGAke2xpdmVGb3JtVG1wbH0gJHt0bXBsfSAke2RlcGVuZHNPbn0+XG4gICAgICAgICAgICAgICAgICAgICAgICR7YnV0dG9uVGVtcGxhdGV9ICR7bW9iaWxlRm9ybUNvbnRlbnRUbXBsfWA7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3Q6IChhdHRycykgPT4ge1xuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnZm9ybWxheW91dCcpID09PSAnZGlhbG9nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnPC9mb3JtPjwvbmctdGVtcGxhdGU+PC9kaXY+PC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhdHRycy5nZXQoJ2Zvcm1sYXlvdXQnKSA9PT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8L2Rpdj48LyR7dGFnTmFtZX0+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgPC8ke3RhZ05hbWV9PmA7XG4gICAgICAgIH0sXG4gICAgICAgIHByb3ZpZGU6IChhdHRycywgc2hhcmVkKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm92aWRlciA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIHByb3ZpZGVyLnNldCgnZm9ybV9yZWZlcmVuY2UnLCBzaGFyZWQuZ2V0KCdjb3VudGVyJykpO1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbnJlZ2lzdGVyKCd3bS1mb3JtJywgYnVpbGRUYXNrKTtcbnJlZ2lzdGVyKCd3bS1saXZlZm9ybScsICgpID0+IGJ1aWxkVGFzaygnd21MaXZlRm9ybScpKTtcbnJlZ2lzdGVyKCd3bS1saXZlZmlsdGVyJywgKCkgPT4gYnVpbGRUYXNrKCd3bUxpdmVGaWx0ZXInKSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19