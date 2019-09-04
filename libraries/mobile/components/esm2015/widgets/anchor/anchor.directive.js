import { Directive, HostListener, Inject } from '@angular/core';
import { WidgetRef } from '@wm/components';
export class AnchorDirective {
    constructor(widget) {
        this.widget = widget;
    }
    onClick() {
        let href = this.widget.hyperlink;
        if (href) {
            if (href.indexOf(':') >= 0 && !(_.startsWith(href, 'http://') || _.startsWith(href, 'https://'))) {
                return;
            }
            else if (_.startsWith(href, '#')) {
                window.location.href = window.location.origin + window.location.pathname + href;
                return;
            }
            else if (_.startsWith(href, '//')) {
                href = 'https:' + href;
            }
            cordova.InAppBrowser.open(href, this.widget.target);
        }
    }
}
AnchorDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmAnchor]'
            },] }
];
/** @nocollapse */
AnchorDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [WidgetRef,] }] }
];
AnchorDirective.propDecorators = {
    onClick: [{ type: HostListener, args: ['click',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvYW5jaG9yL2FuY2hvci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWhFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVEzQyxNQUFNLE9BQU8sZUFBZTtJQUV4QixZQUF1QyxNQUFXO1FBQVgsV0FBTSxHQUFOLE1BQU0sQ0FBSztJQUFJLENBQUM7SUFHdkQsT0FBTztRQUNILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2pDLElBQUksSUFBSSxFQUFFO1lBQ04sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRTtnQkFDOUYsT0FBTzthQUNWO2lCQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEYsT0FBTzthQUNWO2lCQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdkQ7SUFDTCxDQUFDOzs7WUFyQkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxZQUFZO2FBQ3pCOzs7OzRDQUdnQixNQUFNLFNBQUMsU0FBUzs7O3NCQUU1QixZQUFZLFNBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSG9zdExpc3RlbmVyLCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5kZWNsYXJlIGNvbnN0IGNvcmRvdmE7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtQW5jaG9yXSdcbn0pXG5leHBvcnQgY2xhc3MgQW5jaG9yRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKEBJbmplY3QoV2lkZ2V0UmVmKSBwcml2YXRlIHdpZGdldDogYW55KSB7IH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJylcbiAgICBvbkNsaWNrICgpIHtcbiAgICAgICAgbGV0IGhyZWYgPSB0aGlzLndpZGdldC5oeXBlcmxpbms7XG4gICAgICAgIGlmIChocmVmKSB7XG4gICAgICAgICAgICBpZiAoaHJlZi5pbmRleE9mKCc6JykgPj0gMCAmJiAhKF8uc3RhcnRzV2l0aChocmVmLCAnaHR0cDovLycpIHx8IF8uc3RhcnRzV2l0aChocmVmLCAnaHR0cHM6Ly8nKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uc3RhcnRzV2l0aChocmVmLCAnIycpKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgaHJlZjtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uc3RhcnRzV2l0aChocmVmLCAnLy8nKSkge1xuICAgICAgICAgICAgICAgIGhyZWYgPSAnaHR0cHM6JyArIGhyZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb3Jkb3ZhLkluQXBwQnJvd3Nlci5vcGVuKGhyZWYsIHRoaXMud2lkZ2V0LnRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=