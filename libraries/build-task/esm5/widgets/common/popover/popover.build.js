import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'wm-popover';
register('wm-popover', function () {
    return {
        requires: ['wm-table'],
        pre: function (attrs, shared, table) {
            var contentSource = attrs.get('contentsource');
            var popoverTemplate;
            if (contentSource !== 'inline') {
                var content = attrs.get('content');
                var bindContent = attrs.get('content.bind');
                var contentMarkup = '';
                if (content) {
                    contentMarkup = "content=\"" + content + "\"";
                }
                else if (bindContent) {
                    contentMarkup = "content.bind=\"" + bindContent + "\"";
                }
                popoverTemplate = "<div wmContainer #partial partialContainer " + contentMarkup + ">";
                shared.set('hasPopoverContent', true);
            }
            var markup = "<" + tagName + " wmPopover " + getAttrMarkup(attrs) + ">";
            var contextAttrs = table ? "let-row=\"row\"" : "";
            markup += "<ng-template " + contextAttrs + "><button class=\"popover-start\"></button>";
            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += "" + (popoverTemplate ? popoverTemplate : '');
            }
            return markup;
        },
        post: function (attrs, shared) {
            var markup = '';
            if (shared.get('hasPopoverContent')) {
                markup += "</div>";
            }
            return markup + "<button class=\"popover-end\"></button></ng-template></" + tagName + ">";
        }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcG9wb3Zlci9wb3BvdmVyLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQztBQUU3QixRQUFRLENBQUMsWUFBWSxFQUFFO0lBQ25CLE9BQU87UUFDSCxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUM7UUFDdEIsR0FBRyxFQUFFLFVBQUMsS0FBMEIsRUFBRSxNQUF3QixFQUFFLEtBQUs7WUFDN0QsSUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxJQUFJLGVBQWUsQ0FBQztZQUNwQixJQUFJLGFBQWEsS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3JDLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRTlDLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztnQkFFdkIsSUFBSSxPQUFPLEVBQUU7b0JBQ1QsYUFBYSxHQUFHLGVBQVksT0FBTyxPQUFHLENBQUM7aUJBQzFDO3FCQUFNLElBQUksV0FBVyxFQUFFO29CQUNwQixhQUFhLEdBQUcsb0JBQWlCLFdBQVcsT0FBRyxDQUFDO2lCQUNuRDtnQkFFRCxlQUFlLEdBQUcsZ0RBQThDLGFBQWEsTUFBRyxDQUFDO2dCQUNqRixNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsSUFBSSxNQUFNLEdBQUcsTUFBSSxPQUFPLG1CQUFjLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBRyxDQUFDO1lBQzlELElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsaUJBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRWxELE1BQU0sSUFBSSxrQkFBZ0IsWUFBWSwrQ0FBMEMsQ0FBQztZQUVqRixpQ0FBaUM7WUFDakMsSUFBSSxlQUFlLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxNQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQzthQUN6RDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDRCxJQUFJLEVBQUUsVUFBQyxLQUEwQixFQUFFLE1BQXdCO1lBQ3ZELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNoQixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDakMsTUFBTSxJQUFJLFFBQVEsQ0FBQzthQUN0QjtZQUVELE9BQVUsTUFBTSwrREFBd0QsT0FBTyxNQUFHLENBQUM7UUFDdkYsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnd20tcG9wb3Zlcic7XG5cbnJlZ2lzdGVyKCd3bS1wb3BvdmVyJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlcXVpcmVzOiBbJ3dtLXRhYmxlJ10sXG4gICAgICAgIHByZTogKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBzaGFyZWQ6IE1hcDxzdHJpbmcsIGFueT4sIHRhYmxlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50U291cmNlID0gYXR0cnMuZ2V0KCdjb250ZW50c291cmNlJyk7XG4gICAgICAgICAgICBsZXQgcG9wb3ZlclRlbXBsYXRlO1xuICAgICAgICAgICAgaWYgKGNvbnRlbnRTb3VyY2UgIT09ICdpbmxpbmUnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF0dHJzLmdldCgnY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRDb250ZW50ID0gYXR0cnMuZ2V0KCdjb250ZW50LmJpbmQnKTtcblxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50TWFya3VwID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50TWFya3VwID0gYGNvbnRlbnQ9XCIke2NvbnRlbnR9XCJgO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmluZENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudE1hcmt1cCA9IGBjb250ZW50LmJpbmQ9XCIke2JpbmRDb250ZW50fVwiYDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwb3BvdmVyVGVtcGxhdGUgPSBgPGRpdiB3bUNvbnRhaW5lciAjcGFydGlhbCBwYXJ0aWFsQ29udGFpbmVyICR7Y29udGVudE1hcmt1cH0+YDtcbiAgICAgICAgICAgICAgICBzaGFyZWQuc2V0KCdoYXNQb3BvdmVyQ29udGVudCcsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbWFya3VwID0gYDwke3RhZ05hbWV9IHdtUG9wb3ZlciAke2dldEF0dHJNYXJrdXAoYXR0cnMpfT5gO1xuICAgICAgICAgICAgY29uc3QgY29udGV4dEF0dHJzID0gdGFibGUgPyBgbGV0LXJvdz1cInJvd1wiYCA6IGBgO1xuXG4gICAgICAgICAgICBtYXJrdXAgKz0gYDxuZy10ZW1wbGF0ZSAke2NvbnRleHRBdHRyc30+PGJ1dHRvbiBjbGFzcz1cInBvcG92ZXItc3RhcnRcIj48L2J1dHRvbj5gO1xuXG4gICAgICAgICAgICAvLyB0b2RvIGtleWJvYXJkIG5hdmlnYXRpb24gLSB0YWJcbiAgICAgICAgICAgIGlmIChwb3BvdmVyVGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICBtYXJrdXAgKz0gYCR7cG9wb3ZlclRlbXBsYXRlID8gcG9wb3ZlclRlbXBsYXRlIDogJyd9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKGF0dHJzOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBzaGFyZWQ6IE1hcDxzdHJpbmcsIGFueT4pID0+IHtcbiAgICAgICAgICAgIGxldCBtYXJrdXAgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGFyZWQuZ2V0KCdoYXNQb3BvdmVyQ29udGVudCcpKSB7XG4gICAgICAgICAgICAgICAgbWFya3VwICs9IGA8L2Rpdj5gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYCR7bWFya3VwfTxidXR0b24gY2xhc3M9XCJwb3BvdmVyLWVuZFwiPjwvYnV0dG9uPjwvbmctdGVtcGxhdGU+PC8ke3RhZ05hbWV9PmA7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19