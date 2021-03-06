import { IDGenerator, updateTemplateAttrs } from '@wm/core';
import { getAttrMarkup, getBoundToExpr, register } from '@wm/transpiler';
var tagName = 'div';
var dataSetKey = 'dataset';
var idGen = new IDGenerator('table_');
register('wm-table', function () {
    return {
        template: function (node, shared) {
            // If table does not have child columns, set isdynamictable to true
            if (node.children.length) {
                var isColumnsPresent = node.children.some(function (childNode) {
                    return childNode.name === 'wm-table-column' || childNode.name === 'wm-table-column-group';
                });
                shared.set('isdynamictable', isColumnsPresent ? 'false' : 'true');
            }
            else {
                shared.set('isdynamictable', 'true');
            }
            var datasetAttr = node.attrs.find(function (attr) { return attr.name === dataSetKey; });
            var widgetNameAttr = node.attrs.find(function (attr) { return attr.name === 'name'; });
            if (!datasetAttr) {
                return;
            }
            var boundExpr = getBoundToExpr(datasetAttr.value);
            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, '', 'row');
        },
        pre: function (attrs, shared) {
            var counter = idGen.nextUid();
            shared.set('counter', counter);
            attrs.set('isdynamictable', shared.get('isdynamictable'));
            return "<" + tagName + " wmTable=\"" + counter + "\" wmTableFilterSort wmTableCUD #" + counter + " data-identifier=\"table\" role=\"table\" " + getAttrMarkup(attrs) + ">";
        },
        post: function () { return "</" + tagName + ">"; },
        provide: function (attrs, shared) {
            var provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            provider.set('editmode', attrs.get('editmode'));
            provider.set('shownewrow', attrs.get('shownewrow'));
            return provider;
        }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RhYmxlL3RhYmxlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhGLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDN0IsSUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFeEMsUUFBUSxDQUFDLFVBQVUsRUFBRTtJQUNqQixPQUFPO1FBQ0gsUUFBUSxFQUFFLFVBQUMsSUFBYSxFQUFFLE1BQU07WUFDNUIsbUVBQW1FO1lBQ25FLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RCLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxTQUFTO29CQUNqRCxPQUFhLFNBQVUsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLElBQVUsU0FBVSxDQUFDLElBQUksS0FBSyx1QkFBdUIsQ0FBQztnQkFDNUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRTtpQkFBTTtnQkFDSCxNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO1lBQ3RFLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQXBCLENBQW9CLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNkLE9BQU87YUFDVjtZQUNELElBQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFcEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDWixPQUFPO2FBQ1Y7WUFDRCxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFDRCxHQUFHLEVBQUUsVUFBQyxLQUFLLEVBQUUsTUFBTTtZQUNmLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQixLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQzFELE9BQU8sTUFBSSxPQUFPLG1CQUFhLE9BQU8seUNBQW1DLE9BQU8sa0RBQXlDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFDO1FBQ3JKLENBQUM7UUFDRCxJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtRQUMzQixPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUUsTUFBTTtZQUNuQixJQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNwRCxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3BELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnQgfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7IElER2VuZXJhdG9yLCB1cGRhdGVUZW1wbGF0ZUF0dHJzIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgZ2V0Qm91bmRUb0V4cHIsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5jb25zdCBkYXRhU2V0S2V5ID0gJ2RhdGFzZXQnO1xuY29uc3QgaWRHZW4gPSBuZXcgSURHZW5lcmF0b3IoJ3RhYmxlXycpO1xuXG5yZWdpc3Rlcignd20tdGFibGUnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGU6IChub2RlOiBFbGVtZW50LCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRhYmxlIGRvZXMgbm90IGhhdmUgY2hpbGQgY29sdW1ucywgc2V0IGlzZHluYW1pY3RhYmxlIHRvIHRydWVcbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQ29sdW1uc1ByZXNlbnQgPSBub2RlLmNoaWxkcmVuLnNvbWUoY2hpbGROb2RlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8YW55PmNoaWxkTm9kZSkubmFtZSA9PT0gJ3dtLXRhYmxlLWNvbHVtbicgfHwgKDxhbnk+Y2hpbGROb2RlKS5uYW1lID09PSAnd20tdGFibGUtY29sdW1uLWdyb3VwJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaGFyZWQuc2V0KCdpc2R5bmFtaWN0YWJsZScsIGlzQ29sdW1uc1ByZXNlbnQgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hhcmVkLnNldCgnaXNkeW5hbWljdGFibGUnLCAndHJ1ZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBkYXRhc2V0QXR0ciA9IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gZGF0YVNldEtleSk7XG4gICAgICAgICAgICBjb25zdCB3aWRnZXROYW1lQXR0ciA9IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gJ25hbWUnKTtcblxuICAgICAgICAgICAgaWYgKCFkYXRhc2V0QXR0cikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJvdW5kRXhwciA9IGdldEJvdW5kVG9FeHByKGRhdGFzZXRBdHRyLnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKCFib3VuZEV4cHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cGRhdGVUZW1wbGF0ZUF0dHJzKG5vZGUsIGJvdW5kRXhwciwgd2lkZ2V0TmFtZUF0dHIudmFsdWUsICcnLCAncm93Jyk7XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvdW50ZXIgPSBpZEdlbi5uZXh0VWlkKCk7XG4gICAgICAgICAgICBzaGFyZWQuc2V0KCdjb3VudGVyJywgY291bnRlcik7XG4gICAgICAgICAgICBhdHRycy5zZXQoJ2lzZHluYW1pY3RhYmxlJywgc2hhcmVkLmdldCgnaXNkeW5hbWljdGFibGUnKSk7XG4gICAgICAgICAgICByZXR1cm4gYDwke3RhZ05hbWV9IHdtVGFibGU9XCIke2NvdW50ZXJ9XCIgd21UYWJsZUZpbHRlclNvcnQgd21UYWJsZUNVRCAjJHtjb3VudGVyfSBkYXRhLWlkZW50aWZpZXI9XCJ0YWJsZVwiIHJvbGU9XCJ0YWJsZVwiICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmA7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YCxcbiAgICAgICAgcHJvdmlkZTogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0KCd0YWJsZV9yZWZlcmVuY2UnLCBzaGFyZWQuZ2V0KCdjb3VudGVyJykpO1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0KCdmaWx0ZXJtb2RlJywgYXR0cnMuZ2V0KCdmaWx0ZXJtb2RlJykpO1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0KCdlZGl0bW9kZScsIGF0dHJzLmdldCgnZWRpdG1vZGUnKSk7XG4gICAgICAgICAgICBwcm92aWRlci5zZXQoJ3Nob3duZXdyb3cnLCBhdHRycy5nZXQoJ3Nob3duZXdyb3cnKSk7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19