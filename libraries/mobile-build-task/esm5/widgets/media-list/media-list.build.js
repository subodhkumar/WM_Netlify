import { Attribute, Element } from '@angular/compiler';
import { getAttrMarkup, register } from '@wm/transpiler';
var wmlistTag = 'wm-list';
var tagName = 'div';
var dataSetKey = 'dataset';
function copyAttribute(from, fromAttrName, to, toAttrName) {
    var fromAttr = from.attrs.find(function (a) { return a.name === fromAttrName; });
    if (fromAttr) {
        to.attrs.push(new Attribute(toAttrName, fromAttr.value, fromAttr.sourceSpan, fromAttr.valueSpan));
    }
}
register('wm-media-list', function () {
    return {
        template: function (node) {
            var bindDataset;
            var attrObj = node.attrs.find(function (attr) { return attr.name === dataSetKey; }), 
            /**
             *  Replacing binded property value with item
             * @param children
             */
            replaceBind = function (children) {
                if (children === void 0) { children = []; }
                children.forEach(function (childNode) {
                    if (childNode.name) {
                        // return if the child Element is of wm-list .
                        if (childNode.name !== wmlistTag) {
                            childNode.attrs.forEach(function (attr) {
                                if (attr.value.startsWith("bind:" + bindDataset + ".data[$i]")) {
                                    attr.value = attr.value.replace(bindDataset + ".data[$i]", 'item');
                                }
                                else if (attr.value.startsWith("bind:" + bindDataset)) {
                                    attr.value = attr.value.replace(bindDataset, 'item');
                                }
                            });
                            replaceBind(childNode.children);
                        }
                    }
                });
            };
            if (attrObj && attrObj.value.startsWith('bind:')) {
                bindDataset = attrObj.value.replace('bind:', '');
            }
            if (bindDataset) {
                replaceBind(node.children);
            }
            var template = node.children
                .find(function (e) { return e instanceof Element && e.name === 'wm-media-template'; });
            if (template != null) {
                copyAttribute(template, 'width', node, 'thumbnailwidth');
                copyAttribute(template, 'height', node, 'thumbnailheight');
            }
        },
        pre: function (attrs) { return "<" + tagName + " wmMediaList " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvbWVkaWEtbGlzdC9tZWRpYS1saXN0LmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFdkQsT0FBTyxFQUFFLGFBQWEsRUFBaUIsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEUsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzVCLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFFN0IsU0FBUyxhQUFhLENBQUMsSUFBYSxFQUFFLFlBQW9CLEVBQUUsRUFBVyxFQUFFLFVBQWtCO0lBQ3ZGLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksS0FBSyxZQUFZLEVBQXZCLENBQXVCLENBQUMsQ0FBQztJQUNoRSxJQUFJLFFBQVEsRUFBRTtRQUNWLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7S0FDckc7QUFDTCxDQUFDO0FBRUQsUUFBUSxDQUFDLGVBQWUsRUFBRTtJQUN0QixPQUFPO1FBQ0gsUUFBUSxFQUFFLFVBQUMsSUFBYTtZQUNwQixJQUFJLFdBQVcsQ0FBQztZQUNoQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUF4QixDQUF3QixDQUFDO1lBQzdEOzs7ZUFHRztZQUNILFdBQVcsR0FBRyxVQUFDLFFBQWE7Z0JBQWIseUJBQUEsRUFBQSxhQUFhO2dCQUN4QixRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztvQkFDdEIsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFO3dCQUNoQiw4Q0FBOEM7d0JBQzlDLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7NEJBQzlCLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtnQ0FDekIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFRLFdBQVcsY0FBVyxDQUFDLEVBQUU7b0NBQ3ZELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUksV0FBVyxjQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7aUNBQ3RFO3FDQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBUSxXQUFhLENBQUMsRUFBRTtvQ0FDckQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7aUNBQ3hEOzRCQUNMLENBQUMsQ0FBQyxDQUFDOzRCQUNILFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7eUJBQ25DO3FCQUNKO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDO1lBQ04sSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzlDLFdBQVcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDcEQ7WUFDRCxJQUFJLFdBQVcsRUFBRTtnQkFDYixXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsSUFBTSxRQUFRLEdBQWEsSUFBSSxDQUFDLFFBQVE7aUJBQ25DLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsWUFBWSxPQUFPLElBQWUsQ0FBRSxDQUFDLElBQUksS0FBSyxtQkFBbUIsRUFBbEUsQ0FBa0UsQ0FBQyxDQUFDO1lBQ25GLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtnQkFDbEIsYUFBYSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3pELGFBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO2FBQzlEO1FBQ0wsQ0FBQztRQUNELEdBQUcsRUFBRSxVQUFBLEtBQUssSUFBSSxPQUFBLE1BQUksT0FBTyxxQkFBZ0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFHLEVBQWxELENBQWtEO1FBQ2hFLElBQUksRUFBRSxjQUFNLE9BQUEsT0FBSyxPQUFPLE1BQUcsRUFBZixDQUFlO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBFbGVtZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuXG5pbXBvcnQgeyBnZXRBdHRyTWFya3VwLCBJQnVpbGRUYXNrRGVmLCByZWdpc3RlciB9IGZyb20gJ0B3bS90cmFuc3BpbGVyJztcblxuY29uc3Qgd21saXN0VGFnID0gJ3dtLWxpc3QnO1xuY29uc3QgdGFnTmFtZSA9ICdkaXYnO1xuY29uc3QgZGF0YVNldEtleSA9ICdkYXRhc2V0JztcblxuZnVuY3Rpb24gY29weUF0dHJpYnV0ZShmcm9tOiBFbGVtZW50LCBmcm9tQXR0ck5hbWU6IHN0cmluZywgdG86IEVsZW1lbnQsIHRvQXR0ck5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGZyb21BdHRyID0gZnJvbS5hdHRycy5maW5kKCBhID0+IGEubmFtZSA9PT0gZnJvbUF0dHJOYW1lKTtcbiAgICBpZiAoZnJvbUF0dHIpIHtcbiAgICAgICAgdG8uYXR0cnMucHVzaChuZXcgQXR0cmlidXRlKHRvQXR0ck5hbWUsIGZyb21BdHRyLnZhbHVlLCBmcm9tQXR0ci5zb3VyY2VTcGFuLCBmcm9tQXR0ci52YWx1ZVNwYW4pKTtcbiAgICB9XG59XG5cbnJlZ2lzdGVyKCd3bS1tZWRpYS1saXN0JywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGJpbmREYXRhc2V0O1xuICAgICAgICAgICAgY29uc3QgYXR0ck9iaiA9IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gZGF0YVNldEtleSksXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogIFJlcGxhY2luZyBiaW5kZWQgcHJvcGVydHkgdmFsdWUgd2l0aCBpdGVtXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcmVwbGFjZUJpbmQgPSAoY2hpbGRyZW4gPSBbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkTm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gaWYgdGhlIGNoaWxkIEVsZW1lbnQgaXMgb2Ygd20tbGlzdCAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkTm9kZS5uYW1lICE9PSB3bWxpc3RUYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGROb2RlLmF0dHJzLmZvckVhY2goKGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyLnZhbHVlLnN0YXJ0c1dpdGgoYGJpbmQ6JHtiaW5kRGF0YXNldH0uZGF0YVskaV1gKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHIudmFsdWUgPSBhdHRyLnZhbHVlLnJlcGxhY2UoYCR7YmluZERhdGFzZXR9LmRhdGFbJGldYCwgJ2l0ZW0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXR0ci52YWx1ZS5zdGFydHNXaXRoKGBiaW5kOiR7YmluZERhdGFzZXR9YCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyLnZhbHVlID0gYXR0ci52YWx1ZS5yZXBsYWNlKGJpbmREYXRhc2V0LCAnaXRlbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZUJpbmQoY2hpbGROb2RlLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoYXR0ck9iaiAmJiBhdHRyT2JqLnZhbHVlLnN0YXJ0c1dpdGgoJ2JpbmQ6JykpIHtcbiAgICAgICAgICAgICAgICBiaW5kRGF0YXNldCA9IGF0dHJPYmoudmFsdWUucmVwbGFjZSgnYmluZDonLCAnJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmluZERhdGFzZXQpIHtcbiAgICAgICAgICAgICAgICByZXBsYWNlQmluZChub2RlLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlID0gPEVsZW1lbnQ+IG5vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICAuZmluZChlID0+IGUgaW5zdGFuY2VvZiBFbGVtZW50ICYmICg8RWxlbWVudD4gZSkubmFtZSA9PT0gJ3dtLW1lZGlhLXRlbXBsYXRlJyk7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvcHlBdHRyaWJ1dGUodGVtcGxhdGUsICd3aWR0aCcsIG5vZGUsICd0aHVtYm5haWx3aWR0aCcpO1xuICAgICAgICAgICAgICAgIGNvcHlBdHRyaWJ1dGUodGVtcGxhdGUsICdoZWlnaHQnLCBub2RlLCAndGh1bWJuYWlsaGVpZ2h0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtTWVkaWFMaXN0ICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=