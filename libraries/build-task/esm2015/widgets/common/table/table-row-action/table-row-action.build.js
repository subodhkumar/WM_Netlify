import { getAttrMarkup, register } from '@wm/transpiler';
import { getRowActionAttrs } from '@wm/core';
const tagName = 'div';
const getSaveCancelTemplate = () => {
    return `<button type="button" aria-label="Save edit icon" class="save row-action-button btn app-button btn-transparent save-edit-row-button hidden" title="Save">
                <i class="wi wi-done" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Cancel edit icon" class="cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden" title="Cancel">
                <i class="wi wi-cancel" aria-hidden="true"></i>
            </button>`;
};
const ɵ0 = getSaveCancelTemplate;
// get the inline widget template
const getRowActionTmpl = (attrs) => {
    const action = attrs.get('action');
    const actionTmpl = action ? ` click.event.delayed="${action}" ` : '';
    const saveCancelTmpl = action && action.includes('editRow(') ? getSaveCancelTemplate() : '';
    const btnClass = action ? (action.includes('editRow(') ? 'edit edit-row-button' :
        (action.includes('deleteRow(') ? 'delete delete-row-button' : '')) : '';
    const tabIndex = attrs.get('tabindex') ? `tabindex="${attrs.get('tabindex')}"` : '';
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowActionTmpl let-row="row">
               <${tag} ${directive} data-action-key="${attrs.get('key')}"
                    ${getRowActionAttrs(attrs)}
                    class="row-action row-action-button ${attrs.get('class')} ${btnClass}"
                    iconclass="${attrs.get('iconclass')}"
                    ${actionTmpl}
                    ${tabIndex}
                    type="button"></${tag}>
                ${saveCancelTmpl}
            </ng-template>`;
};
const ɵ1 = getRowActionTmpl;
register('wm-table-row-action', () => {
    return {
        pre: attrs => `<${tagName} wmTableRowAction ${getAttrMarkup(attrs)}>
                        ${getRowActionTmpl(attrs)}`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LWFjdGlvbi5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtcm93LWFjdGlvbi90YWJsZS1yb3ctYWN0aW9uLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsTUFBTSxxQkFBcUIsR0FBRyxHQUFHLEVBQUU7SUFDL0IsT0FBTzs7Ozs7c0JBS1csQ0FBQztBQUN2QixDQUFDLENBQUM7O0FBRUYsaUNBQWlDO0FBQ2pDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUMvQixNQUFNLE1BQU0sR0FBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMseUJBQXlCLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDckUsTUFBTSxjQUFjLEdBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM1RixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUM3RCxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDNUYsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNwRixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDbkUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQ2xGLE9BQU87a0JBQ08sR0FBRyxJQUFJLFNBQVMscUJBQXFCLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO3NCQUNqRCxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7MERBQ1ksS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRO2lDQUN2RCxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztzQkFDakMsVUFBVTtzQkFDVixRQUFRO3NDQUNRLEdBQUc7a0JBQ3ZCLGNBQWM7MkJBQ0wsQ0FBQztBQUM1QixDQUFDLENBQUM7O0FBRUYsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQWtCLEVBQUU7SUFDaEQsT0FBTztRQUNILEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxxQkFBcUIsYUFBYSxDQUFDLEtBQUssQ0FBQzswQkFDaEQsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDM0MsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5pbXBvcnQgeyBnZXRSb3dBY3Rpb25BdHRycyB9IGZyb20gJ0B3bS9jb3JlJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5jb25zdCBnZXRTYXZlQ2FuY2VsVGVtcGxhdGUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBhcmlhLWxhYmVsPVwiU2F2ZSBlZGl0IGljb25cIiBjbGFzcz1cInNhdmUgcm93LWFjdGlvbi1idXR0b24gYnRuIGFwcC1idXR0b24gYnRuLXRyYW5zcGFyZW50IHNhdmUtZWRpdC1yb3ctYnV0dG9uIGhpZGRlblwiIHRpdGxlPVwiU2F2ZVwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwid2kgd2ktZG9uZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgYXJpYS1sYWJlbD1cIkNhbmNlbCBlZGl0IGljb25cIiBjbGFzcz1cImNhbmNlbCByb3ctYWN0aW9uLWJ1dHRvbiBidG4gYXBwLWJ1dHRvbiBidG4tdHJhbnNwYXJlbnQgY2FuY2VsLWVkaXQtcm93LWJ1dHRvbiBoaWRkZW5cIiB0aXRsZT1cIkNhbmNlbFwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwid2kgd2ktY2FuY2VsXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxuICAgICAgICAgICAgPC9idXR0b24+YDtcbn07XG5cbi8vIGdldCB0aGUgaW5saW5lIHdpZGdldCB0ZW1wbGF0ZVxuY29uc3QgZ2V0Um93QWN0aW9uVG1wbCA9IChhdHRycykgPT4ge1xuICAgIGNvbnN0IGFjdGlvbiA9ICBhdHRycy5nZXQoJ2FjdGlvbicpO1xuICAgIGNvbnN0IGFjdGlvblRtcGwgPSBhY3Rpb24gPyBgIGNsaWNrLmV2ZW50LmRlbGF5ZWQ9XCIke2FjdGlvbn1cIiBgIDogJyc7XG4gICAgY29uc3Qgc2F2ZUNhbmNlbFRtcGwgPSBhY3Rpb24gJiYgYWN0aW9uLmluY2x1ZGVzKCdlZGl0Um93KCcpID8gZ2V0U2F2ZUNhbmNlbFRlbXBsYXRlKCkgOiAnJztcbiAgICBjb25zdCBidG5DbGFzcyA9IGFjdGlvbiA/IChhY3Rpb24uaW5jbHVkZXMoJ2VkaXRSb3coJykgPyAnZWRpdCBlZGl0LXJvdy1idXR0b24nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIChhY3Rpb24uaW5jbHVkZXMoJ2RlbGV0ZVJvdygnKSA/ICdkZWxldGUgZGVsZXRlLXJvdy1idXR0b24nIDogJycpKSA6ICcnO1xuICAgIGNvbnN0IHRhYkluZGV4ID0gYXR0cnMuZ2V0KCd0YWJpbmRleCcpID8gYHRhYmluZGV4PVwiJHthdHRycy5nZXQoJ3RhYmluZGV4Jyl9XCJgIDogJyc7XG4gICAgY29uc3QgdGFnID0gYXR0cnMuZ2V0KCd3aWRnZXQtdHlwZScpID09PSAnYW5jaG9yJyA/ICdhJyA6ICdidXR0b24nO1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGF0dHJzLmdldCgnd2lkZ2V0LXR5cGUnKSA9PT0gJ2FuY2hvcicgPyAnd21BbmNob3InIDogJ3dtQnV0dG9uJztcbiAgICByZXR1cm4gYDxuZy10ZW1wbGF0ZSAjcm93QWN0aW9uVG1wbCBsZXQtcm93PVwicm93XCI+XG4gICAgICAgICAgICAgICA8JHt0YWd9ICR7ZGlyZWN0aXZlfSBkYXRhLWFjdGlvbi1rZXk9XCIke2F0dHJzLmdldCgna2V5Jyl9XCJcbiAgICAgICAgICAgICAgICAgICAgJHtnZXRSb3dBY3Rpb25BdHRycyhhdHRycyl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwicm93LWFjdGlvbiByb3ctYWN0aW9uLWJ1dHRvbiAke2F0dHJzLmdldCgnY2xhc3MnKX0gJHtidG5DbGFzc31cIlxuICAgICAgICAgICAgICAgICAgICBpY29uY2xhc3M9XCIke2F0dHJzLmdldCgnaWNvbmNsYXNzJyl9XCJcbiAgICAgICAgICAgICAgICAgICAgJHthY3Rpb25UbXBsfVxuICAgICAgICAgICAgICAgICAgICAke3RhYkluZGV4fVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCI+PC8ke3RhZ30+XG4gICAgICAgICAgICAgICAgJHtzYXZlQ2FuY2VsVG1wbH1cbiAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+YDtcbn07XG5cbnJlZ2lzdGVyKCd3bS10YWJsZS1yb3ctYWN0aW9uJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtVGFibGVSb3dBY3Rpb24gJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2dldFJvd0FjdGlvblRtcGwoYXR0cnMpfWAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=