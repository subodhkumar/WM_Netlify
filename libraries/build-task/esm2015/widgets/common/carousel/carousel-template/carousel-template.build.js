import { getAttrMarkup, register } from '@wm/transpiler';
const carouselContentTagName = 'slide';
// For static carousel
register('wm-carousel-content', () => {
    return {
        pre: attrs => `<${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)}>`,
        post: () => `</${carouselContentTagName}>`
    };
});
// For dynamic carousel
register('wm-carousel-template', () => {
    return {
        requires: ['wm-carousel'],
        pre: (attrs, shared, parentCarousel) => {
            const carouselRef = parentCarousel.get('carousel_ref');
            return `<div *ngIf="!${carouselRef}.fieldDefs">{{${carouselRef}.nodatamessage}}</div>
                    <${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)} *ngFor="let item of ${carouselRef}.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="tempRef" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                    </${carouselContentTagName}>
                    <ng-template #tempRef let-item="item" let-index="index">`;
        },
        post: () => `</ng-template>`
    };
});
export default () => { };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwtdGVtcGxhdGUuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Nhcm91c2VsL2Nhcm91c2VsLXRlbXBsYXRlL2Nhcm91c2VsLXRlbXBsYXRlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDO0FBRXZDLHNCQUFzQjtBQUN0QixRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBa0IsRUFBRTtJQUNoRCxPQUFPO1FBQ0gsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxzQkFBc0Isd0JBQXdCLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRztRQUN2RixJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxzQkFBc0IsR0FBRztLQUM3QyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCx1QkFBdUI7QUFDdkIsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEdBQWtCLEVBQUU7SUFDakQsT0FBTztRQUNILFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUN6QixHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxFQUFFO1lBQ25DLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdkQsT0FBTyxnQkFBZ0IsV0FBVyxpQkFBaUIsV0FBVzt1QkFDbkQsc0JBQXNCLHdCQUF3QixhQUFhLENBQUMsS0FBSyxDQUFDLHdCQUF3QixXQUFXOzt3QkFFcEcsc0JBQXNCOzZFQUMrQixDQUFDO1FBQ3RFLENBQUM7UUFDRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCO0tBQy9CLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgSUJ1aWxkVGFza0RlZiwgcmVnaXN0ZXIgfSBmcm9tICdAd20vdHJhbnNwaWxlcic7XG5cbmNvbnN0IGNhcm91c2VsQ29udGVudFRhZ05hbWUgPSAnc2xpZGUnO1xuXG4vLyBGb3Igc3RhdGljIGNhcm91c2VsXG5yZWdpc3Rlcignd20tY2Fyb3VzZWwtY29udGVudCcsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHtjYXJvdXNlbENvbnRlbnRUYWdOYW1lfSB3bUNhcm91c2VsVGVtcGxhdGUgICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7Y2Fyb3VzZWxDb250ZW50VGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuLy8gRm9yIGR5bmFtaWMgY2Fyb3VzZWxcbnJlZ2lzdGVyKCd3bS1jYXJvdXNlbC10ZW1wbGF0ZScsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlczogWyd3bS1jYXJvdXNlbCddLFxuICAgICAgICBwcmU6IChhdHRycywgc2hhcmVkLCBwYXJlbnRDYXJvdXNlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2Fyb3VzZWxSZWYgPSBwYXJlbnRDYXJvdXNlbC5nZXQoJ2Nhcm91c2VsX3JlZicpO1xuICAgICAgICAgICAgcmV0dXJuIGA8ZGl2ICpuZ0lmPVwiISR7Y2Fyb3VzZWxSZWZ9LmZpZWxkRGVmc1wiPnt7JHtjYXJvdXNlbFJlZn0ubm9kYXRhbWVzc2FnZX19PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwke2Nhcm91c2VsQ29udGVudFRhZ05hbWV9IHdtQ2Fyb3VzZWxUZW1wbGF0ZSAgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0gKm5nRm9yPVwibGV0IGl0ZW0gb2YgJHtjYXJvdXNlbFJlZn0uZmllbGREZWZzOyBsZXQgaSA9IGluZGV4O1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciBbbmdUZW1wbGF0ZU91dGxldF09XCJ0ZW1wUmVmXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntpdGVtOml0ZW0sIGluZGV4Oml9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgICAgICAgICAgICAgIDwvJHtjYXJvdXNlbENvbnRlbnRUYWdOYW1lfT5cbiAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlICN0ZW1wUmVmIGxldC1pdGVtPVwiaXRlbVwiIGxldC1pbmRleD1cImluZGV4XCI+YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvbmctdGVtcGxhdGU+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=