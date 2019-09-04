import { Attribute, Element } from '@angular/compiler';
import { updateTemplateAttrs } from '@wm/core';
import { getAttrMarkup, getBoundToExpr, register } from '@wm/transpiler';
const wmListTag = 'wm-list';
const listTagName = 'div';
const dataSetKey = 'dataset';
register(wmListTag, () => {
    return {
        requires: ['wm-form', 'wm-liveform'],
        template: (node) => {
            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
            const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');
            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, 'itemRef.');
        },
        pre: (attrs, shared, parentForm, parentLiveForm) => {
            const parent = parentForm || parentLiveForm;
            shared.set('form_reference', parent && parent.get('form_reference'));
            return `<${listTagName} wmList wmLiveActions ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${listTagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('parent_form_reference', shared.get('form_reference'));
            return provider;
        }
    };
});
register('wm-listtemplate', () => {
    return {
        pre: () => `<ng-template #listTemplate let-item="item" let-$index="$index" let-itemRef="itemRef" let-$first="$first" let-$last="$last"  let-currentItemWidgets="currentItemWidgets" >`,
        post: () => `</ng-template>`
    };
});
function copyAttribute(from, fromAttrName, to, toAttrName) {
    const fromAttr = from.attrs.find(a => a.name === fromAttrName);
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-list-action-template', () => {
    return {
        template: (node) => {
            const position = node.attrs.find(attr => attr.name === 'position').value;
            const btns = node.children
                .filter(e => e instanceof Element && e.name === 'wm-button');
            // add swipe-position on button nodes to identify whether buttons are from left or right action templates
            btns.forEach((btnNode) => {
                copyAttribute(node, 'position', btnNode, 'swipe-position');
            });
        },
        pre: (attrs, el) => {
            if (attrs.get('position') === 'left') {
                return `<ng-template #listLeftActionTemplate>
                            <li class="app-list-item-action-panel app-list-item-left-action-panel actionMenu" ${getAttrMarkup(attrs)}>`;
            }
            if (attrs.get('position') === 'right') {
                return `<ng-template #listRightActionTemplate>
                            <li class="app-list-item-action-panel app-list-item-right-action-panel actionMenu" ${getAttrMarkup(attrs)}>`;
            }
        },
        post: () => `</li></ng-template>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDdkQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RixNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDNUIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzFCLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztBQUU3QixRQUFRLENBQUMsU0FBUyxFQUFFLEdBQWtCLEVBQUU7SUFDcEMsT0FBTztRQUNILFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUM7UUFDcEMsUUFBUSxFQUFFLENBQUMsSUFBYSxFQUFFLEVBQUU7WUFFeEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQ3RFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNkLE9BQU87YUFDVjtZQUNELE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFcEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDWixPQUFPO2FBQ1Y7WUFDRCxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsU0FB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QUssQ0FBQyxHQUFHLENBQUM7YUFDNUg7UUFDTCxDQUFDO1FBQ0QsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFxQjtLQUNwQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgRWxlbWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7IHVwZGF0ZVRlbXBsYXRlQXR0cnMgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IGdldEF0dHJNYXJrdXAsIGdldEJvdW5kVG9FeHByLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3Qgd21MaXN0VGFnID0gJ3dtLWxpc3QnO1xuY29uc3QgbGlzdFRhZ05hbWUgPSAnZGl2JztcbmNvbnN0IGRhdGFTZXRLZXkgPSAnZGF0YXNldCc7XG5cbnJlZ2lzdGVyKHdtTGlzdFRhZywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVzOiBbJ3dtLWZvcm0nLCAnd20tbGl2ZWZvcm0nXSxcbiAgICAgICAgdGVtcGxhdGU6IChub2RlOiBFbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGRhdGFzZXRBdHRyID0gbm9kZS5hdHRycy5maW5kKGF0dHIgPT4gYXR0ci5uYW1lID09PSBkYXRhU2V0S2V5KTtcbiAgICAgICAgICAgIGNvbnN0IHdpZGdldE5hbWVBdHRyID0gbm9kZS5hdHRycy5maW5kKGF0dHIgPT4gYXR0ci5uYW1lID09PSAnbmFtZScpO1xuXG4gICAgICAgICAgICBpZiAoIWRhdGFzZXRBdHRyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYm91bmRFeHByID0gZ2V0Qm91bmRUb0V4cHIoZGF0YXNldEF0dHIudmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAoIWJvdW5kRXhwcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVwZGF0ZVRlbXBsYXRlQXR0cnMobm9kZSwgYm91bmRFeHByLCB3aWRnZXROYW1lQXR0ci52YWx1ZSwgJ2l0ZW1SZWYuJyk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogKGF0dHJzLCBzaGFyZWQsIHBhcmVudEZvcm0sIHBhcmVudExpdmVGb3JtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBwYXJlbnRGb3JtIHx8IHBhcmVudExpdmVGb3JtO1xuICAgICAgICAgICAgc2hhcmVkLnNldCgnZm9ybV9yZWZlcmVuY2UnLCBwYXJlbnQgJiYgcGFyZW50LmdldCgnZm9ybV9yZWZlcmVuY2UnKSk7XG4gICAgICAgICAgICByZXR1cm4gYDwke2xpc3RUYWdOYW1lfSB3bUxpc3Qgd21MaXZlQWN0aW9ucyAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gO1xuICAgICAgICB9LFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC8ke2xpc3RUYWdOYW1lfT5gLFxuICAgICAgICBwcm92aWRlOiAoYXR0cnMsIHNoYXJlZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvdmlkZXIgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBwcm92aWRlci5zZXQoJ3BhcmVudF9mb3JtX3JlZmVyZW5jZScsIHNoYXJlZC5nZXQoJ2Zvcm1fcmVmZXJlbmNlJykpO1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5yZWdpc3Rlcignd20tbGlzdHRlbXBsYXRlJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogKCkgPT4gYDxuZy10ZW1wbGF0ZSAjbGlzdFRlbXBsYXRlIGxldC1pdGVtPVwiaXRlbVwiIGxldC0kaW5kZXg9XCIkaW5kZXhcIiBsZXQtaXRlbVJlZj1cIml0ZW1SZWZcIiBsZXQtJGZpcnN0PVwiJGZpcnN0XCIgbGV0LSRsYXN0PVwiJGxhc3RcIiAgbGV0LWN1cnJlbnRJdGVtV2lkZ2V0cz1cImN1cnJlbnRJdGVtV2lkZ2V0c1wiID5gLFxuICAgICAgICBwb3N0OiAoKSA9PiBgPC9uZy10ZW1wbGF0ZT5gXG4gICAgfTtcbn0pO1xuXG5mdW5jdGlvbiBjb3B5QXR0cmlidXRlKGZyb206IEVsZW1lbnQsIGZyb21BdHRyTmFtZTogc3RyaW5nLCB0bzogRWxlbWVudCwgdG9BdHRyTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZnJvbUF0dHIgPSBmcm9tLmF0dHJzLmZpbmQoIGEgPT4gYS5uYW1lID09PSBmcm9tQXR0ck5hbWUpO1xuICAgIGlmIChmcm9tQXR0cikge1xuICAgICAgICB0by5hdHRycy5wdXNoKG5ldyBBdHRyaWJ1dGUodG9BdHRyTmFtZSwgZnJvbUF0dHIudmFsdWUsIGZyb21BdHRyLnNvdXJjZVNwYW4sIGZyb21BdHRyLnZhbHVlU3BhbikpO1xuICAgIH1cbn1cblxucmVnaXN0ZXIoJ3dtLWxpc3QtYWN0aW9uLXRlbXBsYXRlJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gJ3Bvc2l0aW9uJykudmFsdWU7XG5cbiAgICAgICAgICAgIGNvbnN0IGJ0bnMgPSA8RWxlbWVudFtdPiBub2RlLmNoaWxkcmVuXG4gICAgICAgICAgICAgICAgLmZpbHRlcihlID0+IGUgaW5zdGFuY2VvZiBFbGVtZW50ICYmICg8RWxlbWVudD4gZSkubmFtZSA9PT0gJ3dtLWJ1dHRvbicpO1xuXG4gICAgICAgICAgICAvLyBhZGQgc3dpcGUtcG9zaXRpb24gb24gYnV0dG9uIG5vZGVzIHRvIGlkZW50aWZ5IHdoZXRoZXIgYnV0dG9ucyBhcmUgZnJvbSBsZWZ0IG9yIHJpZ2h0IGFjdGlvbiB0ZW1wbGF0ZXNcbiAgICAgICAgICAgIGJ0bnMuZm9yRWFjaCgoYnRuTm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvcHlBdHRyaWJ1dGUobm9kZSwgJ3Bvc2l0aW9uJywgYnRuTm9kZSwgJ3N3aXBlLXBvc2l0aW9uJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJlOiAoYXR0cnMsIGVsKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXR0cnMuZ2V0KCdwb3NpdGlvbicpID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxuZy10ZW1wbGF0ZSAjbGlzdExlZnRBY3Rpb25UZW1wbGF0ZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJhcHAtbGlzdC1pdGVtLWFjdGlvbi1wYW5lbCBhcHAtbGlzdC1pdGVtLWxlZnQtYWN0aW9uLXBhbmVsIGFjdGlvbk1lbnVcIiAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgncG9zaXRpb24nKSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBgPG5nLXRlbXBsYXRlICNsaXN0UmlnaHRBY3Rpb25UZW1wbGF0ZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGkgY2xhc3M9XCJhcHAtbGlzdC1pdGVtLWFjdGlvbi1wYW5lbCBhcHAtbGlzdC1pdGVtLXJpZ2h0LWFjdGlvbi1wYW5lbCBhY3Rpb25NZW51XCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvbGk+PC9uZy10ZW1wbGF0ZT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==