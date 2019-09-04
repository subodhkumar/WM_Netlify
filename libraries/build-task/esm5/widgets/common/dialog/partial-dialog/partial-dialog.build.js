import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-pagedialog', function () {
    return {
        pre: function (attrs, shared) {
            var content = attrs.get('content');
            attrs.delete('content');
            var boundContent = attrs.get('content.bind');
            attrs.delete('content.bind');
            var onLoad = attrs.get('load.event');
            attrs.delete('load.event');
            var onLoadEvtMarkup = '';
            var contentMarkup = '';
            if (onLoad) {
                onLoadEvtMarkup = "load.event=\"" + onLoad + "\"";
            }
            if (boundContent) {
                contentMarkup = "content.bind=\"" + boundContent + "\"";
            }
            else if (content) {
                contentMarkup = "content=\"" + content + "\"";
            }
            var containerMarkup = '';
            if (contentMarkup) {
                shared.set('hasPartialContent', true);
                containerMarkup += "<ng-template><div wmContainer partialContainer " + contentMarkup + " width=\"100%\" height=\"100%\" " + onLoadEvtMarkup + ">";
            }
            return "<" + tagName + " wmPartialDialog " + getAttrMarkup(attrs) + ">" + containerMarkup;
        },
        post: function (attrs, shared) {
            var preContent = '';
            if (shared.get('hasPartialContent')) {
                preContent = "</div></ng-template>";
            }
            return preContent + "</" + tagName + ">";
        }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1kaWFsb2cuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9wYXJ0aWFsLWRpYWxvZy9wYXJ0aWFsLWRpYWxvZy5idWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RSxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLGVBQWUsRUFBRTtJQUN0QixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUMsS0FBSyxFQUFFLE1BQU07WUFDZixJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFeEIsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMvQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTdCLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUzQixJQUFJLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBRXZCLElBQUksTUFBTSxFQUFFO2dCQUNSLGVBQWUsR0FBRyxrQkFBZSxNQUFNLE9BQUcsQ0FBQzthQUM5QztZQUVELElBQUksWUFBWSxFQUFFO2dCQUNkLGFBQWEsR0FBRyxvQkFBaUIsWUFBWSxPQUFHLENBQUM7YUFDcEQ7aUJBQU0sSUFBSSxPQUFPLEVBQUU7Z0JBQ2hCLGFBQWEsR0FBRyxlQUFZLE9BQU8sT0FBRyxDQUFDO2FBQzFDO1lBRUQsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksYUFBYSxFQUFFO2dCQUVmLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLGVBQWUsSUFBSSxvREFBa0QsYUFBYSx3Q0FBK0IsZUFBZSxNQUFHLENBQUM7YUFDdkk7WUFFRCxPQUFPLE1BQUksT0FBTyx5QkFBb0IsYUFBYSxDQUFDLEtBQUssQ0FBQyxTQUFJLGVBQWlCLENBQUM7UUFDcEYsQ0FBQztRQUNELElBQUksRUFBRSxVQUFDLEtBQUssRUFBRSxNQUFNO1lBQ2hCLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRTtnQkFDakMsVUFBVSxHQUFJLHNCQUFzQixDQUFDO2FBQ3hDO1lBQ0QsT0FBVSxVQUFVLFVBQUssT0FBTyxNQUFHLENBQUM7UUFDeEMsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGdCQUFlLGNBQU8sQ0FBQyxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxucmVnaXN0ZXIoJ3dtLXBhZ2VkaWFsb2cnLCAoKTogSUJ1aWxkVGFza0RlZiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiAoYXR0cnMsIHNoYXJlZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF0dHJzLmdldCgnY29udGVudCcpO1xuICAgICAgICAgICAgYXR0cnMuZGVsZXRlKCdjb250ZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJvdW5kQ29udGVudCA9IGF0dHJzLmdldCgnY29udGVudC5iaW5kJyk7XG4gICAgICAgICAgICBhdHRycy5kZWxldGUoJ2NvbnRlbnQuYmluZCcpO1xuXG4gICAgICAgICAgICBjb25zdCBvbkxvYWQgPSBhdHRycy5nZXQoJ2xvYWQuZXZlbnQnKTtcbiAgICAgICAgICAgIGF0dHJzLmRlbGV0ZSgnbG9hZC5ldmVudCcpO1xuXG4gICAgICAgICAgICBsZXQgb25Mb2FkRXZ0TWFya3VwID0gJyc7XG4gICAgICAgICAgICBsZXQgY29udGVudE1hcmt1cCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAob25Mb2FkKSB7XG4gICAgICAgICAgICAgICAgb25Mb2FkRXZ0TWFya3VwID0gYGxvYWQuZXZlbnQ9XCIke29uTG9hZH1cImA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChib3VuZENvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50TWFya3VwID0gYGNvbnRlbnQuYmluZD1cIiR7Ym91bmRDb250ZW50fVwiYDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRNYXJrdXAgPSBgY29udGVudD1cIiR7Y29udGVudH1cImA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBjb250YWluZXJNYXJrdXAgPSAnJztcbiAgICAgICAgICAgIGlmIChjb250ZW50TWFya3VwKSB7XG5cbiAgICAgICAgICAgICAgICBzaGFyZWQuc2V0KCdoYXNQYXJ0aWFsQ29udGVudCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lck1hcmt1cCArPSBgPG5nLXRlbXBsYXRlPjxkaXYgd21Db250YWluZXIgcGFydGlhbENvbnRhaW5lciAke2NvbnRlbnRNYXJrdXB9IHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiAke29uTG9hZEV2dE1hcmt1cH0+YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGA8JHt0YWdOYW1lfSB3bVBhcnRpYWxEaWFsb2cgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+JHtjb250YWluZXJNYXJrdXB9YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGxldCBwcmVDb250ZW50ID0gJyc7XG4gICAgICAgICAgICBpZiAoc2hhcmVkLmdldCgnaGFzUGFydGlhbENvbnRlbnQnKSkge1xuICAgICAgICAgICAgICAgIHByZUNvbnRlbnQgPSAgYDwvZGl2PjwvbmctdGVtcGxhdGU+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgJHtwcmVDb250ZW50fTwvJHt0YWdOYW1lfT5gO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==