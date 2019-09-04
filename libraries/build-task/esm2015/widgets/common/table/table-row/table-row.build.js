import { getAttrMarkup, register } from '@wm/transpiler';
import { getRowActionAttrs } from '@wm/core';
const tagName = 'div';
const getRowExpansionActionTmpl = (attrs) => {
    const tag = attrs.get('widget-type') === 'anchor' ? 'a' : 'button';
    const directive = attrs.get('widget-type') === 'anchor' ? 'wmAnchor' : 'wmButton';
    return `<ng-template #rowExpansionActionTmpl let-row="row">
               <${tag} ${directive}
                    ${getRowActionAttrs(attrs)}
                    class="${attrs.get('class')} row-expansion-button"
                    iconclass="${attrs.get('collapseicon')}"
                    type="button"></${tag}>
            </ng-template>`;
};
const ɵ0 = getRowExpansionActionTmpl;
register('wm-table-row', () => {
    return {
        pre: (attrs) => {
            return `<${tagName} wmTableRow ${getAttrMarkup(attrs)}>
                    ${getRowExpansionActionTmpl(attrs)}
                    <ng-template #rowExpansionTmpl let-row="row" let-rowDef="rowDef" let-containerLoad="containerLoad">
                        <div wmContainer partialContainer content.bind="rowDef.content" load.event="containerLoad(widget)"
                            [ngStyle]="{'height': rowDef.height, 'overflow-y': 'auto'}">
                         <div *ngFor="let param of rowDef.partialParams | keyvalue" wmParam hidden
                            [name]="param.key" [value]="param.value"></div>`;
        },
        post: () => `</div></ng-template></${tagName}>`
    };
});
export default () => { };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtcm93LmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS1yb3cvdGFibGUtcm93LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsTUFBTSx5QkFBeUIsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQ3hDLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNuRSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDbEYsT0FBTztrQkFDTyxHQUFHLElBQUksU0FBUztzQkFDWixpQkFBaUIsQ0FBQyxLQUFLLENBQUM7NkJBQ2pCLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2lDQUNkLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO3NDQUNwQixHQUFHOzJCQUNkLENBQUM7QUFDNUIsQ0FBQyxDQUFDOztBQUVGLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBa0IsRUFBRTtJQUN6QyxPQUFPO1FBQ0gsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDWCxPQUFPLElBQUksT0FBTyxlQUFlLGFBQWEsQ0FBQyxLQUFLLENBQUM7c0JBQzNDLHlCQUF5QixDQUFDLEtBQUssQ0FBQzs7Ozs7NEVBS3NCLENBQUM7UUFDckUsQ0FBQztRQUNELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyx5QkFBeUIsT0FBTyxHQUFHO0tBQ2xELENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5pbXBvcnQgeyBnZXRSb3dBY3Rpb25BdHRycyB9IGZyb20gJ0B3bS9jb3JlJztcblxuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuXG5jb25zdCBnZXRSb3dFeHBhbnNpb25BY3Rpb25UbXBsID0gKGF0dHJzKSA9PiB7XG4gICAgY29uc3QgdGFnID0gYXR0cnMuZ2V0KCd3aWRnZXQtdHlwZScpID09PSAnYW5jaG9yJyA/ICdhJyA6ICdidXR0b24nO1xuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGF0dHJzLmdldCgnd2lkZ2V0LXR5cGUnKSA9PT0gJ2FuY2hvcicgPyAnd21BbmNob3InIDogJ3dtQnV0dG9uJztcbiAgICByZXR1cm4gYDxuZy10ZW1wbGF0ZSAjcm93RXhwYW5zaW9uQWN0aW9uVG1wbCBsZXQtcm93PVwicm93XCI+XG4gICAgICAgICAgICAgICA8JHt0YWd9ICR7ZGlyZWN0aXZlfVxuICAgICAgICAgICAgICAgICAgICAke2dldFJvd0FjdGlvbkF0dHJzKGF0dHJzKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCIke2F0dHJzLmdldCgnY2xhc3MnKX0gcm93LWV4cGFuc2lvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBpY29uY2xhc3M9XCIke2F0dHJzLmdldCgnY29sbGFwc2VpY29uJyl9XCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiPjwvJHt0YWd9PlxuICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5gO1xufTtcblxucmVnaXN0ZXIoJ3dtLXRhYmxlLXJvdycsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IChhdHRycykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGA8JHt0YWdOYW1lfSB3bVRhYmxlUm93ICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PlxuICAgICAgICAgICAgICAgICAgICAke2dldFJvd0V4cGFuc2lvbkFjdGlvblRtcGwoYXR0cnMpfVxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgI3Jvd0V4cGFuc2lvblRtcGwgbGV0LXJvdz1cInJvd1wiIGxldC1yb3dEZWY9XCJyb3dEZWZcIiBsZXQtY29udGFpbmVyTG9hZD1cImNvbnRhaW5lckxvYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgd21Db250YWluZXIgcGFydGlhbENvbnRhaW5lciBjb250ZW50LmJpbmQ9XCJyb3dEZWYuY29udGVudFwiIGxvYWQuZXZlbnQ9XCJjb250YWluZXJMb2FkKHdpZGdldClcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1N0eWxlXT1cInsnaGVpZ2h0Jzogcm93RGVmLmhlaWdodCwgJ292ZXJmbG93LXknOiAnYXV0byd9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgcGFyYW0gb2Ygcm93RGVmLnBhcnRpYWxQYXJhbXMgfCBrZXl2YWx1ZVwiIHdtUGFyYW0gaGlkZGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW25hbWVdPVwicGFyYW0ua2V5XCIgW3ZhbHVlXT1cInBhcmFtLnZhbHVlXCI+PC9kaXY+YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvZGl2PjwvbmctdGVtcGxhdGU+PC8ke3RhZ05hbWV9PmBcbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19