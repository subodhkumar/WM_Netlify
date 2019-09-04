import { getAttrMarkup, register, getBoundToExpr } from '@wm/transpiler';
import { IDGenerator, updateTemplateAttrs } from '@wm/core';
const carouselTagName = 'carousel';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_carousel_ref_');
const isDynamicCarousel = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');
const ɵ0 = isDynamicCarousel;
register('wm-carousel', () => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the carousel
            const counter = idGen.nextUid();
            shared.set('carousel_ref', counter);
            return `<div class="app-carousel carousel"><${carouselTagName} wmCarousel #${counter}="wmCarousel"  ${getAttrMarkup(attrs)} interval="0" [ngClass]="${counter}.navigationClass">`;
        },
        post: () => `</${carouselTagName}></div>`,
        template: (node) => {
            // check if the carousel is dynamic
            if (isDynamicCarousel(node)) {
                const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
                const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');
                if (!datasetAttr) {
                    return;
                }
                const boundExpr = getBoundToExpr(datasetAttr.value);
                if (!boundExpr) {
                    return;
                }
                updateTemplateAttrs(node, boundExpr, widgetNameAttr.value);
            }
        },
        // To provide parent carousel reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('carousel_ref', shared.get('carousel_ref'));
            return provider;
        }
    };
});
export default () => { };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Nhcm91c2VsL2Nhcm91c2VsLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBaUIsYUFBYSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4RixPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTVELE1BQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQztBQUNuQyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDN0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUVsRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDOztBQUU1RyxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQWtCLEVBQUU7SUFDeEMsT0FBTztRQUNILEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQix3Q0FBd0M7WUFDeEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sdUNBQXVDLGVBQWUsZ0JBQWdCLE9BQU8sa0JBQWtCLGFBQWEsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLE9BQU8sb0JBQW9CLENBQUM7UUFDdEwsQ0FBQztRQUNELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLGVBQWUsU0FBUztRQUN6QyxRQUFRLEVBQUUsQ0FBQyxJQUFhLEVBQUUsRUFBRTtZQUN4QixtQ0FBbUM7WUFDbkMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLENBQUM7Z0JBRXJFLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2QsT0FBTztpQkFDVjtnQkFDRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVwRCxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNaLE9BQU87aUJBQ1Y7Z0JBQ0QsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUQ7UUFDTCxDQUFDO1FBQ0Qsb0RBQW9EO1FBQ3BELE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN2QixNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzNCLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUN6RCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbGVtZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0IHsgSUJ1aWxkVGFza0RlZiwgZ2V0QXR0ck1hcmt1cCwgcmVnaXN0ZXIsIGdldEJvdW5kVG9FeHByIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuaW1wb3J0IHsgSURHZW5lcmF0b3IsIHVwZGF0ZVRlbXBsYXRlQXR0cnMgfSBmcm9tICdAd20vY29yZSc7XG5cbmNvbnN0IGNhcm91c2VsVGFnTmFtZSA9ICdjYXJvdXNlbCc7XG5jb25zdCBkYXRhU2V0S2V5ID0gJ2RhdGFzZXQnO1xuY29uc3QgaWRHZW4gPSBuZXcgSURHZW5lcmF0b3IoJ3dtX2Nhcm91c2VsX3JlZl8nKTtcblxuY29uc3QgaXNEeW5hbWljQ2Fyb3VzZWwgPSBub2RlID0+IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gJ3R5cGUnICYmIGF0dHIudmFsdWUgPT09ICdkeW5hbWljJyk7XG5cbnJlZ2lzdGVyKCd3bS1jYXJvdXNlbCcsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IChhdHRycywgc2hhcmVkKSA9PiB7XG4gICAgICAgICAgICAvLyBnZW5lcmF0aW5nIHVuaXF1ZSBJZCBmb3IgdGhlIGNhcm91c2VsXG4gICAgICAgICAgICBjb25zdCBjb3VudGVyID0gaWRHZW4ubmV4dFVpZCgpO1xuICAgICAgICAgICAgc2hhcmVkLnNldCgnY2Fyb3VzZWxfcmVmJywgY291bnRlcik7XG4gICAgICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJhcHAtY2Fyb3VzZWwgY2Fyb3VzZWxcIj48JHtjYXJvdXNlbFRhZ05hbWV9IHdtQ2Fyb3VzZWwgIyR7Y291bnRlcn09XCJ3bUNhcm91c2VsXCIgICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9IGludGVydmFsPVwiMFwiIFtuZ0NsYXNzXT1cIiR7Y291bnRlcn0ubmF2aWdhdGlvbkNsYXNzXCI+YDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHtjYXJvdXNlbFRhZ05hbWV9PjwvZGl2PmAsXG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIGNhcm91c2VsIGlzIGR5bmFtaWNcbiAgICAgICAgICAgIGlmIChpc0R5bmFtaWNDYXJvdXNlbChub2RlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFzZXRBdHRyID0gbm9kZS5hdHRycy5maW5kKGF0dHIgPT4gYXR0ci5uYW1lID09PSBkYXRhU2V0S2V5KTtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXROYW1lQXR0ciA9IG5vZGUuYXR0cnMuZmluZChhdHRyID0+IGF0dHIubmFtZSA9PT0gJ25hbWUnKTtcblxuICAgICAgICAgICAgICAgIGlmICghZGF0YXNldEF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZEV4cHIgPSBnZXRCb3VuZFRvRXhwcihkYXRhc2V0QXR0ci52YWx1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWJvdW5kRXhwcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVwZGF0ZVRlbXBsYXRlQXR0cnMobm9kZSwgYm91bmRFeHByLCB3aWRnZXROYW1lQXR0ci52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRvIHByb3ZpZGUgcGFyZW50IGNhcm91c2VsIHJlZmVyZW5jZSBmb3IgY2hpbGRyZW5cbiAgICAgICAgcHJvdmlkZTogKGF0dHJzLCBzaGFyZWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVyID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgcHJvdmlkZXIuc2V0KCdjYXJvdXNlbF9yZWYnLCBzaGFyZWQuZ2V0KCdjYXJvdXNlbF9yZWYnKSk7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0ICgpID0+IHt9O1xuIl19