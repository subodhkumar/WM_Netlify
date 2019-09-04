import { FormWidgetType } from '../enums/enums';
// For html upload widget, add events on input tag
const getUploadEventTmpl = (attrs, counter, fieldName) => {
    let eventTmpl = '';
    attrs.forEach((val, key) => {
        if (key && key.endsWith('.event')) {
            const eventName = key.split('.')[0];
            const counterTl = counter ? `${counter}.` : '';
            eventTmpl = ` ${eventTmpl} (${eventName})="${counterTl}triggerUploadEvent($event, '${eventName}', '${fieldName}', row)" `;
        }
    });
    return eventTmpl;
};
const ɵ0 = getUploadEventTmpl;
// Method to get the form widget template
export const getFormWidgetTemplate = (widgetType, innerTmpl, attrs, options = {}) => {
    let tmpl;
    const updateOn = attrs.get('updateon');
    const updateOnTmpl = updateOn ? `updateon="${updateOn}"` : '';
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch type="autocomplete" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<ul wmCheckboxset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.CHIPS:
            tmpl = `<ul wmChips role="input" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<div wmNumber ${innerTmpl} type="number" aria-label="Only numbers" ${updateOnTmpl}></div>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<wm-input ${innerTmpl} type="password" aria-label="Enter password" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<ul wmRadioset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${innerTmpl}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            tmpl = `<div wmRichTextEditor role="textbox" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SELECT:
            tmpl = `<wm-select ${innerTmpl}></wm-select>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${innerTmpl} type="toggle" role="checkbox" aria-label="Toggle button"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TEXT:
            const inputType = options.inputType || 'inputtype';
            tmpl = `<wm-input ${innerTmpl} type="${attrs.get(inputType) || 'text'}" aria-describedby="Enter text" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<wm-textarea ${innerTmpl} role="textbox" aria-describedby="Place your text" ${updateOnTmpl}></wm-textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${innerTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            const counter = options.counter;
            const pCounter = options.pCounter;
            const uploadProps = options.uploadProps;
            const eventTmpl = getUploadEventTmpl(attrs, counter, uploadProps && uploadProps.name);
            if (uploadProps) {
                tmpl = `<form name="${uploadProps.formName}" ${innerTmpl}>
                            <input focus-target class="file-upload" type="file" name="${uploadProps.name}" ${eventTmpl}/>
                        </form>`;
            }
            else {
                tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${innerTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}" ${eventTmpl}
                        [required]="${counter}.required" type="file" name="${attrs.get('key') || attrs.get('name')}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [accept]="${counter}.permitted">`;
            }
            break;
        default:
            tmpl = `<wm-input ${innerTmpl} aria-describedby="Enter text" type="text" ${updateOnTmpl}></wm-input>`;
            break;
    }
    return tmpl;
};
// The bound value is replaced with {{item.fieldname}} here. This is needed by the liveList when compiling inner elements
export const updateTemplateAttrs = (rootNode, parentDataSet, widgetName, instance = '', referenceName = 'item') => {
    const regex = new RegExp('(' + parentDataSet + ')(\\[0\\])?(.data\\[\\$i\\])?(.content\\[\\$i\\])?(\\[\\$i\\])?', 'g');
    let currentItemRegEx;
    let currentItemWidgetsRegEx;
    let formWidgetsRegex;
    let nodes;
    const widgetList = {
        'wm-list': ['itemclass', 'disableitem']
    };
    if (widgetName) {
        currentItemRegEx = new RegExp(`(Widgets.${widgetName}.currentItem)\\b`, 'g');
        currentItemWidgetsRegEx = new RegExp(`(Widgets.${widgetName}.currentItemWidgets)\\b`, 'g');
        formWidgetsRegex = new RegExp(`(Widgets.(.*).(formWidgets|filterWidgets))\\b`, 'g');
    }
    if (!_.isArray(rootNode)) {
        // [WMS-16712],[WMS-16769],[WMS-16805] The markup of root node(table, list, carousel) need to be updated only for the widgets mentioned in widgetList map.
        nodes = widgetList[rootNode.name] ? [rootNode] : (rootNode.children || []);
    }
    else {
        nodes = rootNode;
    }
    nodes.forEach((childNode) => {
        if (childNode.name) {
            const nodeName = childNode.name;
            childNode.attrs.forEach((attr) => {
                // trim the extra spaces in bindings
                let value = attr.value && attr.value.trim();
                if (_.startsWith(value, 'bind:')) {
                    // The markup of root node(table, list, carousel) attributes conatains same dataset variable binding then those attributes need to be updated only for specific properties mentioned in widgetList map.
                    if (!widgetList[nodeName] || (widgetList[nodeName] && widgetList[nodeName].indexOf(attr.name) > -1)) {
                        // if the attribute value is "bind:xxxxx.xxxx", either the dataSet/scopeDataSet has to contain "xxxx.xxxx"
                        if (_.includes(value, parentDataSet) && value !== 'bind:' + parentDataSet) {
                            value = value.replace('bind:', '');
                            value = value.replace(regex, referenceName);
                            value = 'bind:' + value;
                        }
                    }
                    // Replace item if widget property is bound to livelist currentItem
                    if (currentItemRegEx && currentItemRegEx.test(value)) {
                        // Change value from 'bind:Widgets.formName.formWidgets.listName.currentItem' to 'bind:Widgets.listName.currentItem'
                        if (value.includes('.formWidgets') || value.includes('.filterWidgets')) {
                            value = value.replace(formWidgetsRegex, 'Widgets');
                        }
                        value = value.replace(currentItemRegEx, referenceName);
                    }
                    if (currentItemWidgetsRegEx && currentItemWidgetsRegEx.test(value)) {
                        value = value.replace(currentItemWidgetsRegEx, `${instance}currentItemWidgets`);
                    }
                    attr.value = value;
                }
            });
            updateTemplateAttrs(childNode.children, parentDataSet, widgetName, instance, referenceName);
        }
    });
};
// If formControlName attribute is present, dont add the ngModel
export const getNgModelAttr = attrs => {
    if (attrs.has('formControlName') || attrs.has('formControlName.bind')) {
        return '';
    }
    return 'ngModel';
};
const rowActionAttrs = new Map([
    ['display-name', 'caption'],
    ['display-name.bind', 'caption.bind'],
    ['title', 'hint'],
    ['title.bind', 'hint.bind'],
    ['show', 'show'],
    ['show.bind', 'show.bind'],
    ['disabled', 'disabled'],
    ['disabled.bind', 'disabled.bind'],
    ['hyperlink', 'hyperlink'],
    ['hyperlink.bind', 'hyperlink.bind'],
    ['target', 'target'],
    ['conditionalclass.bind', 'conditionalclass.bind'],
    ['conditionalstyle.bind', 'conditionalstyle.bind']
]);
export const getRowActionAttrs = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        const newAttr = rowActionAttrs.get(key);
        if (newAttr) {
            tmpl += `${newAttr}="${val}" `;
        }
    });
    return tmpl;
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtdXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL2J1aWxkLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUloRCxrREFBa0Q7QUFDbEQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFRLEVBQUUsU0FBVSxFQUFFLEVBQUU7SUFDdkQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDeEIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMvQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQy9DLFNBQVMsR0FBRyxJQUFJLFNBQVMsS0FBSyxTQUFTLE1BQU0sU0FBUywrQkFBK0IsU0FBUyxPQUFPLFNBQVMsV0FBVyxDQUFDO1NBQzdIO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDLENBQUM7O0FBRUYseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsVUFBa0IsRUFBRSxTQUFpQixFQUFFLEtBQTJCLEVBQUUsVUFBZSxFQUFFLEVBQUUsRUFBRTtJQUMzSCxJQUFJLElBQUksQ0FBQztJQUNULE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdkMsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxh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Q0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO0lBQ3BCLENBQUMsdUJBQXVCLEVBQUUsdUJBQXVCLENBQUM7SUFDbEQsQ0FBQyx1QkFBdUIsRUFBRSx1QkFBdUIsQ0FBQztDQUNyRCxDQUNKLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsRUFBRTtJQUNyQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsSUFBSSxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksR0FBRyxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUM7U0FDbEM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnQgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7IEZvcm1XaWRnZXRUeXBlIH0gZnJvbSAnLi4vZW51bXMvZW51bXMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbi8vIEZvciBodG1sIHVwbG9hZCB3aWRnZXQsIGFkZCBldmVudHMgb24gaW5wdXQgdGFnXG5jb25zdCBnZXRVcGxvYWRFdmVudFRtcGwgPSAoYXR0cnMsIGNvdW50ZXI/LCBmaWVsZE5hbWU/KSA9PiB7XG4gICAgbGV0IGV2ZW50VG1wbCA9ICcnO1xuICAgIGF0dHJzLmZvckVhY2goKHZhbCwga2V5KSA9PiB7XG4gICAgICAgaWYgKGtleSAmJiBrZXkuZW5kc1dpdGgoJy5ldmVudCcpKSB7XG4gICAgICAgICAgIGNvbnN0IGV2ZW50TmFtZSA9IGtleS5zcGxpdCgnLicpWzBdO1xuICAgICAgICAgICBjb25zdCBjb3VudGVyVGwgPSBjb3VudGVyID8gYCR7Y291bnRlcn0uYCA6ICcnO1xuICAgICAgICAgICBldmVudFRtcGwgPSBgICR7ZXZlbnRUbXBsfSAoJHtldmVudE5hbWV9KT1cIiR7Y291bnRlclRsfXRyaWdnZXJVcGxvYWRFdmVudCgkZXZlbnQsICcke2V2ZW50TmFtZX0nLCAnJHtmaWVsZE5hbWV9Jywgcm93KVwiIGA7XG4gICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBldmVudFRtcGw7XG59O1xuXG4vLyBNZXRob2QgdG8gZ2V0IHRoZSBmb3JtIHdpZGdldCB0ZW1wbGF0ZVxuZXhwb3J0IGNvbnN0IGdldEZvcm1XaWRnZXRUZW1wbGF0ZSA9ICh3aWRnZXRUeXBlOiBzdHJpbmcsIGlubmVyVG1wbDogc3RyaW5nLCBhdHRycz86IE1hcDxzdHJpbmcsIHN0cmluZz4sIG9wdGlvbnM6IGFueSA9IHt9KSA9PiB7XG4gICAgbGV0IHRtcGw7XG4gICAgY29uc3QgdXBkYXRlT24gPSBhdHRycy5nZXQoJ3VwZGF0ZW9uJyk7XG4gICAgY29uc3QgdXBkYXRlT25UbXBsID0gdXBkYXRlT24gPyBgdXBkYXRlb249XCIke3VwZGF0ZU9ufVwiYCA6ICcnO1xuICAgIHN3aXRjaCAod2lkZ2V0VHlwZSkge1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURTpcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5UWVBFQUhFQUQ6XG4gICAgICAgICAgICB0bXBsID0gYDxkaXYgd21TZWFyY2ggdHlwZT1cImF1dG9jb21wbGV0ZVwiIGRlYm91bmNldGltZT1cIiR7YXR0cnMuZ2V0KCdkZWJvdW5jZXRpbWUnKX1cIiAke2lubmVyVG1wbH0+PC9kaXY+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLkNIRUNLQk9YOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtQ2hlY2tib3ggJHtpbm5lclRtcGx9PjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWFNFVDpcbiAgICAgICAgICAgIHRtcGwgPSBgPHVsIHdtQ2hlY2tib3hzZXQgJHtpbm5lclRtcGx9PjwvdWw+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLkNISVBTOlxuICAgICAgICAgICAgdG1wbCA9IGA8dWwgd21DaGlwcyByb2xlPVwiaW5wdXRcIiBkZWJvdW5jZXRpbWU9XCIke2F0dHJzLmdldCgnZGVib3VuY2V0aW1lJyl9XCIgJHtpbm5lclRtcGx9PjwvdWw+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLkNPTE9SUElDS0VSOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtQ29sb3JQaWNrZXIgJHtpbm5lclRtcGx9PjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5DVVJSRU5DWTpcbiAgICAgICAgICAgIHRtcGwgPSBgPGRpdiB3bUN1cnJlbmN5ICR7aW5uZXJUbXBsfT48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuREFURTpcbiAgICAgICAgICAgIHRtcGwgPSBgPGRpdiB3bURhdGUgJHtpbm5lclRtcGx9PjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5EQVRFVElNRTpcbiAgICAgICAgICAgIHRtcGwgPSBgPGRpdiB3bURhdGVUaW1lICR7aW5uZXJUbXBsfT48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuTlVNQkVSOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtTnVtYmVyICR7aW5uZXJUbXBsfSB0eXBlPVwibnVtYmVyXCIgYXJpYS1sYWJlbD1cIk9ubHkgbnVtYmVyc1wiICR7dXBkYXRlT25UbXBsfT48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuUEFTU1dPUkQ6XG4gICAgICAgICAgICB0bXBsID0gYDx3bS1pbnB1dCAke2lubmVyVG1wbH0gdHlwZT1cInBhc3N3b3JkXCIgYXJpYS1sYWJlbD1cIkVudGVyIHBhc3N3b3JkXCIgJHt1cGRhdGVPblRtcGx9Pjwvd20taW5wdXQ+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLlJBRElPU0VUOlxuICAgICAgICAgICAgdG1wbCA9IGA8dWwgd21SYWRpb3NldCAke2lubmVyVG1wbH0+PC91bD5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuUkFUSU5HOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtUmF0aW5nICR7aW5uZXJUbXBsfT48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuUklDSFRFWFQ6XG4gICAgICAgICAgICB0bXBsID0gYDxkaXYgd21SaWNoVGV4dEVkaXRvciByb2xlPVwidGV4dGJveFwiICR7aW5uZXJUbXBsfT48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuU0VMRUNUOlxuICAgICAgICAgICAgdG1wbCA9IGA8d20tc2VsZWN0ICR7aW5uZXJUbXBsfT48L3dtLXNlbGVjdD5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuVE9HR0xFOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtQ2hlY2tib3ggJHtpbm5lclRtcGx9IHR5cGU9XCJ0b2dnbGVcIiByb2xlPVwiY2hlY2tib3hcIiBhcmlhLWxhYmVsPVwiVG9nZ2xlIGJ1dHRvblwiPjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5TTElERVI6XG4gICAgICAgICAgICB0bXBsID0gYDxkaXYgd21TbGlkZXIgJHtpbm5lclRtcGx9PjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5TV0lUQ0g6XG4gICAgICAgICAgICB0bXBsID0gYDxkaXYgd21Td2l0Y2ggJHtpbm5lclRtcGx9PjwvZGl2PmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5URVhUOlxuICAgICAgICAgICAgY29uc3QgaW5wdXRUeXBlID0gb3B0aW9ucy5pbnB1dFR5cGUgfHwgJ2lucHV0dHlwZSc7XG4gICAgICAgICAgICB0bXBsID0gYDx3bS1pbnB1dCAke2lubmVyVG1wbH0gdHlwZT1cIiR7YXR0cnMuZ2V0KGlucHV0VHlwZSkgfHwgJ3RleHQnfVwiIGFyaWEtZGVzY3JpYmVkYnk9XCJFbnRlciB0ZXh0XCIgJHt1cGRhdGVPblRtcGx9Pjwvd20taW5wdXQ+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLlRFWFRBUkVBOlxuICAgICAgICAgICAgdG1wbCA9IGA8d20tdGV4dGFyZWEgJHtpbm5lclRtcGx9IHJvbGU9XCJ0ZXh0Ym94XCIgYXJpYS1kZXNjcmliZWRieT1cIlBsYWNlIHlvdXIgdGV4dFwiICR7dXBkYXRlT25UbXBsfT48L3dtLXRleHRhcmVhPmA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGb3JtV2lkZ2V0VHlwZS5USU1FOlxuICAgICAgICAgICAgdG1wbCA9IGA8ZGl2IHdtVGltZSAke2lubmVyVG1wbH0+PC9kaXY+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZvcm1XaWRnZXRUeXBlLlRJTUVTVEFNUDpcbiAgICAgICAgICAgIHRtcGwgPSBgPGRpdiB3bURhdGVUaW1lICR7aW5uZXJUbXBsfSByb2xlPVwiaW5wdXRcIj48L2Rpdj5gO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRm9ybVdpZGdldFR5cGUuVVBMT0FEOlxuICAgICAgICAgICAgY29uc3QgY291bnRlciA9IG9wdGlvbnMuY291bnRlcjtcbiAgICAgICAgICAgIGNvbnN0IHBDb3VudGVyID0gb3B0aW9ucy5wQ291bnRlcjtcbiAgICAgICAgICAgIGNvbnN0IHVwbG9hZFByb3BzID0gb3B0aW9ucy51cGxvYWRQcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50VG1wbCA9IGdldFVwbG9hZEV2ZW50VG1wbChhdHRycywgY291bnRlciwgdXBsb2FkUHJvcHMgJiYgdXBsb2FkUHJvcHMubmFtZSk7XG4gICAgICAgICAgICBpZiAodXBsb2FkUHJvcHMpIHtcbiAgICAgICAgICAgICAgICB0bXBsID0gYDxmb3JtIG5hbWU9XCIke3VwbG9hZFByb3BzLmZvcm1OYW1lfVwiICR7aW5uZXJUbXBsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgZm9jdXMtdGFyZ2V0IGNsYXNzPVwiZmlsZS11cGxvYWRcIiB0eXBlPVwiZmlsZVwiIG5hbWU9XCIke3VwbG9hZFByb3BzLm5hbWV9XCIgJHtldmVudFRtcGx9Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZm9ybT5gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0bXBsID0gYDxhIGNsYXNzPVwiZm9ybS1jb250cm9sLXN0YXRpY1wiIGhyZWY9XCJ7eyR7Y291bnRlcn0uaHJlZn19XCIgdGFyZ2V0PVwiX2JsYW5rXCIgKm5nSWY9XCIke2NvdW50ZXJ9LmZpbGV0eXBlID09PSAnaW1hZ2UnICYmICR7Y291bnRlcn0uaHJlZlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzdHlsZT1cImhlaWdodDoyZW1cIiBjbGFzcz1cIndpIHdpLWZpbGVcIiBbc3JjXT1cIiR7Y291bnRlcn0uaHJlZlwiLz48L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImZvcm0tY29udHJvbC1zdGF0aWNcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwie3ske2NvdW50ZXJ9LmhyZWZ9fVwiICpuZ0lmPVwiJHtjb3VudGVyfS5maWxldHlwZSAhPT0gJ2ltYWdlJyAmJiAke2NvdW50ZXJ9LmhyZWZcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwid2kgd2ktZmlsZVwiPjwvaT48L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgJHtpbm5lclRtcGx9IGNsYXNzPVwiYXBwLWJsb2ItdXBsb2FkXCIgW25nQ2xhc3NdPVwieydmaWxlLXJlYWRvbmx5JzogJHtjb3VudGVyfS5yZWFkb25seX1cIiAke2V2ZW50VG1wbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFtyZXF1aXJlZF09XCIke2NvdW50ZXJ9LnJlcXVpcmVkXCIgdHlwZT1cImZpbGVcIiBuYW1lPVwiJHthdHRycy5nZXQoJ2tleScpIHx8IGF0dHJzLmdldCgnbmFtZScpfV9mb3JtV2lkZ2V0XCIgW3JlYWRvbmx5XT1cIiR7Y291bnRlcn0ucmVhZG9ubHlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgW2NsYXNzLmhpZGRlbl09XCIhJHtwQ291bnRlcn0uaXNVcGRhdGVNb2RlXCIgW2FjY2VwdF09XCIke2NvdW50ZXJ9LnBlcm1pdHRlZFwiPmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRtcGwgPSBgPHdtLWlucHV0ICR7aW5uZXJUbXBsfSBhcmlhLWRlc2NyaWJlZGJ5PVwiRW50ZXIgdGV4dFwiIHR5cGU9XCJ0ZXh0XCIgJHt1cGRhdGVPblRtcGx9Pjwvd20taW5wdXQ+YDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gdG1wbDtcbn07XG5cbi8vIFRoZSBib3VuZCB2YWx1ZSBpcyByZXBsYWNlZCB3aXRoIHt7aXRlbS5maWVsZG5hbWV9fSBoZXJlLiBUaGlzIGlzIG5lZWRlZCBieSB0aGUgbGl2ZUxpc3Qgd2hlbiBjb21waWxpbmcgaW5uZXIgZWxlbWVudHNcbmV4cG9ydCBjb25zdCB1cGRhdGVUZW1wbGF0ZUF0dHJzID0gKHJvb3ROb2RlOiBFbGVtZW50IHwgQXJyYXk8RWxlbWVudD4sIHBhcmVudERhdGFTZXQ6IHN0cmluZywgd2lkZ2V0TmFtZTogc3RyaW5nLCBpbnN0YW5jZTogc3RyaW5nID0gJycsIHJlZmVyZW5jZU5hbWU6IHN0cmluZyA9ICdpdGVtJykgPT4ge1xuXG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCcoJyArIHBhcmVudERhdGFTZXQgKyAnKShcXFxcWzBcXFxcXSk/KC5kYXRhXFxcXFtcXFxcJGlcXFxcXSk/KC5jb250ZW50XFxcXFtcXFxcJGlcXFxcXSk/KFxcXFxbXFxcXCRpXFxcXF0pPycsICdnJyk7XG4gICAgbGV0IGN1cnJlbnRJdGVtUmVnRXg7XG4gICAgbGV0IGN1cnJlbnRJdGVtV2lkZ2V0c1JlZ0V4O1xuICAgIGxldCBmb3JtV2lkZ2V0c1JlZ2V4O1xuICAgIGxldCBub2RlczogQXJyYXk8RWxlbWVudD47XG4gICAgY29uc3Qgd2lkZ2V0TGlzdCA9IHtcbiAgICAgICAgJ3dtLWxpc3QnOiBbJ2l0ZW1jbGFzcycsICdkaXNhYmxlaXRlbSddXG4gICAgfTtcblxuICAgIGlmICh3aWRnZXROYW1lKSB7XG4gICAgICAgIGN1cnJlbnRJdGVtUmVnRXggPSBuZXcgUmVnRXhwKGAoV2lkZ2V0cy4ke3dpZGdldE5hbWV9LmN1cnJlbnRJdGVtKVxcXFxiYCwgJ2cnKTtcbiAgICAgICAgY3VycmVudEl0ZW1XaWRnZXRzUmVnRXggPSBuZXcgUmVnRXhwKGAoV2lkZ2V0cy4ke3dpZGdldE5hbWV9LmN1cnJlbnRJdGVtV2lkZ2V0cylcXFxcYmAsICdnJyk7XG4gICAgICAgIGZvcm1XaWRnZXRzUmVnZXggPSBuZXcgUmVnRXhwKGAoV2lkZ2V0cy4oLiopLihmb3JtV2lkZ2V0c3xmaWx0ZXJXaWRnZXRzKSlcXFxcYmAsICdnJyk7XG4gICAgfVxuXG4gICAgaWYgKCFfLmlzQXJyYXkocm9vdE5vZGUpKSB7XG4gICAgICAgIC8vIFtXTVMtMTY3MTJdLFtXTVMtMTY3NjldLFtXTVMtMTY4MDVdIFRoZSBtYXJrdXAgb2Ygcm9vdCBub2RlKHRhYmxlLCBsaXN0LCBjYXJvdXNlbCkgbmVlZCB0byBiZSB1cGRhdGVkIG9ubHkgZm9yIHRoZSB3aWRnZXRzIG1lbnRpb25lZCBpbiB3aWRnZXRMaXN0IG1hcC5cbiAgICAgICAgbm9kZXMgPSB3aWRnZXRMaXN0Wyhyb290Tm9kZSBhcyBhbnkpLm5hbWVdID8gW3Jvb3ROb2RlIGFzIEVsZW1lbnRdIDogKChyb290Tm9kZSBhcyBhbnkpLmNoaWxkcmVuIHx8IFtdKSBhcyBBcnJheTxFbGVtZW50PjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBub2RlcyA9IHJvb3ROb2RlIGFzIEFycmF5PEVsZW1lbnQ+O1xuICAgIH1cblxuICAgIG5vZGVzLmZvckVhY2goKGNoaWxkTm9kZTogRWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoY2hpbGROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVOYW1lID0gY2hpbGROb2RlLm5hbWU7XG4gICAgICAgICAgICBjaGlsZE5vZGUuYXR0cnMuZm9yRWFjaCgoYXR0cikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRyaW0gdGhlIGV4dHJhIHNwYWNlcyBpbiBiaW5kaW5nc1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGF0dHIudmFsdWUgJiYgYXR0ci52YWx1ZS50cmltKCk7XG4gICAgICAgICAgICAgICAgaWYgKF8uc3RhcnRzV2l0aCh2YWx1ZSwgJ2JpbmQ6JykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIG1hcmt1cCBvZiByb290IG5vZGUodGFibGUsIGxpc3QsIGNhcm91c2VsKSBhdHRyaWJ1dGVzIGNvbmF0YWlucyBzYW1lIGRhdGFzZXQgdmFyaWFibGUgYmluZGluZyB0aGVuIHRob3NlIGF0dHJpYnV0ZXMgbmVlZCB0byBiZSB1cGRhdGVkIG9ubHkgZm9yIHNwZWNpZmljIHByb3BlcnRpZXMgbWVudGlvbmVkIGluIHdpZGdldExpc3QgbWFwLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXdpZGdldExpc3Rbbm9kZU5hbWVdIHx8ICh3aWRnZXRMaXN0W25vZGVOYW1lXSAmJiB3aWRnZXRMaXN0W25vZGVOYW1lXS5pbmRleE9mKGF0dHIubmFtZSkgPiAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaXMgXCJiaW5kOnh4eHh4Lnh4eHhcIiwgZWl0aGVyIHRoZSBkYXRhU2V0L3Njb3BlRGF0YVNldCBoYXMgdG8gY29udGFpbiBcInh4eHgueHh4eFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyh2YWx1ZSwgcGFyZW50RGF0YVNldCkgJiYgdmFsdWUgIT09ICdiaW5kOicgKyBwYXJlbnREYXRhU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKCdiaW5kOicsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVnZXgsIHJlZmVyZW5jZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ2JpbmQ6JyArIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgaXRlbSBpZiB3aWRnZXQgcHJvcGVydHkgaXMgYm91bmQgdG8gbGl2ZWxpc3QgY3VycmVudEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtUmVnRXggJiYgY3VycmVudEl0ZW1SZWdFeC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hhbmdlIHZhbHVlIGZyb20gJ2JpbmQ6V2lkZ2V0cy5mb3JtTmFtZS5mb3JtV2lkZ2V0cy5saXN0TmFtZS5jdXJyZW50SXRlbScgdG8gJ2JpbmQ6V2lkZ2V0cy5saXN0TmFtZS5jdXJyZW50SXRlbSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5pbmNsdWRlcygnLmZvcm1XaWRnZXRzJykgfHwgdmFsdWUuaW5jbHVkZXMoJy5maWx0ZXJXaWRnZXRzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoZm9ybVdpZGdldHNSZWdleCwgJ1dpZGdldHMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShjdXJyZW50SXRlbVJlZ0V4LCByZWZlcmVuY2VOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW1XaWRnZXRzUmVnRXggJiYgY3VycmVudEl0ZW1XaWRnZXRzUmVnRXgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShjdXJyZW50SXRlbVdpZGdldHNSZWdFeCwgYCR7aW5zdGFuY2V9Y3VycmVudEl0ZW1XaWRnZXRzYCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXR0ci52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdXBkYXRlVGVtcGxhdGVBdHRycyhjaGlsZE5vZGUuY2hpbGRyZW4gYXMgQXJyYXk8RWxlbWVudD4sIHBhcmVudERhdGFTZXQsIHdpZGdldE5hbWUsIGluc3RhbmNlLCByZWZlcmVuY2VOYW1lKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gSWYgZm9ybUNvbnRyb2xOYW1lIGF0dHJpYnV0ZSBpcyBwcmVzZW50LCBkb250IGFkZCB0aGUgbmdNb2RlbFxuZXhwb3J0IGNvbnN0IGdldE5nTW9kZWxBdHRyID0gYXR0cnMgPT4ge1xuICAgIGlmIChhdHRycy5oYXMoJ2Zvcm1Db250cm9sTmFtZScpIHx8IGF0dHJzLmhhcygnZm9ybUNvbnRyb2xOYW1lLmJpbmQnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHJldHVybiAnbmdNb2RlbCc7XG59O1xuXG5jb25zdCByb3dBY3Rpb25BdHRycyA9IG5ldyBNYXAoXG4gICAgW1xuICAgICAgICBbJ2Rpc3BsYXktbmFtZScsICdjYXB0aW9uJ10sXG4gICAgICAgIFsnZGlzcGxheS1uYW1lLmJpbmQnLCAnY2FwdGlvbi5iaW5kJ10sXG4gICAgICAgIFsndGl0bGUnLCAnaGludCddLFxuICAgICAgICBbJ3RpdGxlLmJpbmQnLCAnaGludC5iaW5kJ10sXG4gICAgICAgIFsnc2hvdycsICdzaG93J10sXG4gICAgICAgIFsnc2hvdy5iaW5kJywgJ3Nob3cuYmluZCddLFxuICAgICAgICBbJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJ10sXG4gICAgICAgIFsnZGlzYWJsZWQuYmluZCcsICdkaXNhYmxlZC5iaW5kJ10sXG4gICAgICAgIFsnaHlwZXJsaW5rJywgJ2h5cGVybGluayddLFxuICAgICAgICBbJ2h5cGVybGluay5iaW5kJywgJ2h5cGVybGluay5iaW5kJ10sXG4gICAgICAgIFsndGFyZ2V0JywgJ3RhcmdldCddLFxuICAgICAgICBbJ2NvbmRpdGlvbmFsY2xhc3MuYmluZCcsICdjb25kaXRpb25hbGNsYXNzLmJpbmQnXSxcbiAgICAgICAgWydjb25kaXRpb25hbHN0eWxlLmJpbmQnLCAnY29uZGl0aW9uYWxzdHlsZS5iaW5kJ11cbiAgICBdXG4pO1xuXG5leHBvcnQgY29uc3QgZ2V0Um93QWN0aW9uQXR0cnMgPSBhdHRycyA9PiB7XG4gICAgbGV0IHRtcGwgPSAnJztcbiAgICBhdHRycy5mb3JFYWNoKCh2YWwsIGtleSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdBdHRyID0gcm93QWN0aW9uQXR0cnMuZ2V0KGtleSk7XG4gICAgICAgIGlmIChuZXdBdHRyKSB7XG4gICAgICAgICAgICB0bXBsICs9IGAke25ld0F0dHJ9PVwiJHt2YWx9XCIgYDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0bXBsO1xufTtcbiJdfQ==