import { getAttrMarkup, register } from '@wm/transpiler';
const tagName = 'wm-popover';
register('wm-popover', () => {
    return {
        requires: ['wm-table'],
        pre: (attrs, shared, table) => {
            const contentSource = attrs.get('contentsource');
            let popoverTemplate;
            if (contentSource !== 'inline') {
                const content = attrs.get('content');
                const bindContent = attrs.get('content.bind');
                let contentMarkup = '';
                if (content) {
                    contentMarkup = `content="${content}"`;
                }
                else if (bindContent) {
                    contentMarkup = `content.bind="${bindContent}"`;
                }
                popoverTemplate = `<div wmContainer #partial partialContainer ${contentMarkup}>`;
                shared.set('hasPopoverContent', true);
            }
            let markup = `<${tagName} wmPopover ${getAttrMarkup(attrs)}>`;
            const contextAttrs = table ? `let-row="row"` : ``;
            markup += `<ng-template ${contextAttrs}><button class="popover-start"></button>`;
            // todo keyboard navigation - tab
            if (popoverTemplate) {
                markup += `${popoverTemplate ? popoverTemplate : ''}`;
            }
            return markup;
        },
        post: (attrs, shared) => {
            let markup = '';
            if (shared.get('hasPopoverContent')) {
                markup += `</div>`;
            }
            return `${markup}<button class="popover-end"></button></ng-template></${tagName}>`;
        }
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcG9wb3Zlci9wb3BvdmVyLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQztBQUU3QixRQUFRLENBQUMsWUFBWSxFQUFFLEdBQWtCLEVBQUU7SUFDdkMsT0FBTztRQUNILFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQztRQUN0QixHQUFHLEVBQUUsQ0FBQyxLQUEwQixFQUFFLE1BQXdCLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDakUsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNqRCxJQUFJLGVBQWUsQ0FBQztZQUNwQixJQUFJLGFBQWEsS0FBSyxRQUFRLEVBQUU7Z0JBQzVCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3JDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBRTlDLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztnQkFFdkIsSUFBSSxPQUFPLEVBQUU7b0JBQ1QsYUFBYSxHQUFHLFlBQVksT0FBTyxHQUFHLENBQUM7aUJBQzFDO3FCQUFNLElBQUksV0FBVyxFQUFFO29CQUNwQixhQUFhLEdBQUcsaUJBQWlCLFdBQVcsR0FBRyxDQUFDO2lCQUNuRDtnQkFFRCxlQUFlLEdBQUcsOENBQThDLGFBQWEsR0FBRyxDQUFDO2dCQUNqRixNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxPQUFPLGNBQWMsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7WUFDOUQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVsRCxNQUFNLElBQUksZ0JBQWdCLFlBQVksMENBQTBDLENBQUM7WUFFakYsaUNBQWlDO1lBQ2pDLElBQUksZUFBZSxFQUFFO2dCQUNqQixNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7YUFDekQ7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBQ0QsSUFBSSxFQUFFLENBQUMsS0FBMEIsRUFBRSxNQUF3QixFQUFFLEVBQUU7WUFDM0QsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO2dCQUNqQyxNQUFNLElBQUksUUFBUSxDQUFDO2FBQ3RCO1lBRUQsT0FBTyxHQUFHLE1BQU0sd0RBQXdELE9BQU8sR0FBRyxDQUFDO1FBQ3ZGLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxlQUFlLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ3dtLXBvcG92ZXInO1xuXG5yZWdpc3Rlcignd20tcG9wb3ZlcicsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlczogWyd3bS10YWJsZSddLFxuICAgICAgICBwcmU6IChhdHRyczogTWFwPHN0cmluZywgc3RyaW5nPiwgc2hhcmVkOiBNYXA8c3RyaW5nLCBhbnk+LCB0YWJsZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGVudFNvdXJjZSA9IGF0dHJzLmdldCgnY29udGVudHNvdXJjZScpO1xuICAgICAgICAgICAgbGV0IHBvcG92ZXJUZW1wbGF0ZTtcbiAgICAgICAgICAgIGlmIChjb250ZW50U291cmNlICE9PSAnaW5saW5lJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhdHRycy5nZXQoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBiaW5kQ29udGVudCA9IGF0dHJzLmdldCgnY29udGVudC5iaW5kJyk7XG5cbiAgICAgICAgICAgICAgICBsZXQgY29udGVudE1hcmt1cCA9ICcnO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudE1hcmt1cCA9IGBjb250ZW50PVwiJHtjb250ZW50fVwiYDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJpbmRDb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRNYXJrdXAgPSBgY29udGVudC5iaW5kPVwiJHtiaW5kQ29udGVudH1cImA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcG9wb3ZlclRlbXBsYXRlID0gYDxkaXYgd21Db250YWluZXIgI3BhcnRpYWwgcGFydGlhbENvbnRhaW5lciAke2NvbnRlbnRNYXJrdXB9PmA7XG4gICAgICAgICAgICAgICAgc2hhcmVkLnNldCgnaGFzUG9wb3ZlckNvbnRlbnQnLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1hcmt1cCA9IGA8JHt0YWdOYW1lfSB3bVBvcG92ZXIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YDtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHRBdHRycyA9IHRhYmxlID8gYGxldC1yb3c9XCJyb3dcImAgOiBgYDtcblxuICAgICAgICAgICAgbWFya3VwICs9IGA8bmctdGVtcGxhdGUgJHtjb250ZXh0QXR0cnN9PjxidXR0b24gY2xhc3M9XCJwb3BvdmVyLXN0YXJ0XCI+PC9idXR0b24+YDtcblxuICAgICAgICAgICAgLy8gdG9kbyBrZXlib2FyZCBuYXZpZ2F0aW9uIC0gdGFiXG4gICAgICAgICAgICBpZiAocG9wb3ZlclRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgICAgbWFya3VwICs9IGAke3BvcG92ZXJUZW1wbGF0ZSA/IHBvcG92ZXJUZW1wbGF0ZSA6ICcnfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtYXJrdXA7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3Q6IChhdHRyczogTWFwPHN0cmluZywgc3RyaW5nPiwgc2hhcmVkOiBNYXA8c3RyaW5nLCBhbnk+KSA9PiB7XG4gICAgICAgICAgICBsZXQgbWFya3VwID0gJyc7XG4gICAgICAgICAgICBpZiAoc2hhcmVkLmdldCgnaGFzUG9wb3ZlckNvbnRlbnQnKSkge1xuICAgICAgICAgICAgICAgIG1hcmt1cCArPSBgPC9kaXY+YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke21hcmt1cH08YnV0dG9uIGNsYXNzPVwicG9wb3Zlci1lbmRcIj48L2J1dHRvbj48L25nLXRlbXBsYXRlPjwvJHt0YWdOYW1lfT5gO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==