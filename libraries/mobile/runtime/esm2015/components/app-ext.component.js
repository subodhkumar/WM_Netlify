import { Component, ElementRef, ViewChild } from '@angular/core';
import { hasCordova } from '@wm/core';
import { FileBrowserComponent, FileSelectorService, ProcessManagerComponent, ProcessManagementService } from '@wm/mobile/components';
export class AppExtComponent {
    constructor(elRef, fileSelectorService, processManagementService) {
        this.elRef = elRef;
        this.fileSelectorService = fileSelectorService;
        this.processManagementService = processManagementService;
    }
    ngAfterViewInit() {
        const mobileElements = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster], >[wmAppUpdate], >[wmMobileFileBrowser]');
        const $body = $('body:first');
        if (hasCordova()) {
            mobileElements.appendTo($body);
            this.fileSelectorService.setFileBrowser(this.fileBrowserComponent);
        }
        else {
            mobileElements.remove();
        }
        $(this.elRef.nativeElement).find('>[wmProgressManager]').appendTo($body);
        this.processManagementService.setUIComponent(this.processManagerComponent);
    }
}
AppExtComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmAppExt]',
                template: `<ng-container>
        <div wmNetworkInfoToaster></div>
        <div wmAppUpdate></div>
        <div wmMobileFileBrowser></div>
        <div wmProcessManager></div>
    </ng-container>`
            }] }
];
/** @nocollapse */
AppExtComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: FileSelectorService },
    { type: ProcessManagementService }
];
AppExtComponent.propDecorators = {
    fileBrowserComponent: [{ type: ViewChild, args: [FileBrowserComponent,] }],
    processManagerComponent: [{ type: ViewChild, args: [ProcessManagerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWV4dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL3J1bnRpbWUvIiwic291cmNlcyI6WyJjb21wb25lbnRzL2FwcC1leHQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFaEYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN0QyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsdUJBQXVCLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVdySSxNQUFNLE9BQU8sZUFBZTtJQU14QixZQUNZLEtBQWlCLEVBQ2pCLG1CQUF3QyxFQUN4Qyx3QkFBa0Q7UUFGbEQsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUNqQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1FBQ3hDLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7SUFDM0QsQ0FBQztJQUVKLGVBQWU7UUFDWCxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsaUVBQWlFLENBQUMsQ0FBQztRQUMzSCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDOUIsSUFBSSxVQUFVLEVBQUUsRUFBRTtZQUNkLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUN0RTthQUFNO1lBQ0gsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzNCO1FBQ0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDL0UsQ0FBQzs7O1lBaENKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIsUUFBUSxFQUFFOzs7OztvQkFLTTthQUNuQjs7OztZQWJrQyxVQUFVO1lBR2QsbUJBQW1CO1lBQTJCLHdCQUF3Qjs7O21DQWFoRyxTQUFTLFNBQUMsb0JBQW9CO3NDQUU5QixTQUFTLFNBQUMsdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgaGFzQ29yZG92YSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IEZpbGVCcm93c2VyQ29tcG9uZW50LCBGaWxlU2VsZWN0b3JTZXJ2aWNlLCBQcm9jZXNzTWFuYWdlckNvbXBvbmVudCwgUHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb21wb25lbnRzJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21BcHBFeHRdJyxcbiAgICB0ZW1wbGF0ZTogYDxuZy1jb250YWluZXI+XG4gICAgICAgIDxkaXYgd21OZXR3b3JrSW5mb1RvYXN0ZXI+PC9kaXY+XG4gICAgICAgIDxkaXYgd21BcHBVcGRhdGU+PC9kaXY+XG4gICAgICAgIDxkaXYgd21Nb2JpbGVGaWxlQnJvd3Nlcj48L2Rpdj5cbiAgICAgICAgPGRpdiB3bVByb2Nlc3NNYW5hZ2VyPjwvZGl2PlxuICAgIDwvbmctY29udGFpbmVyPmBcbn0pXG5leHBvcnQgY2xhc3MgQXBwRXh0Q29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgICBAVmlld0NoaWxkKEZpbGVCcm93c2VyQ29tcG9uZW50KSBmaWxlQnJvd3NlckNvbXBvbmVudDogRmlsZUJyb3dzZXJDb21wb25lbnQ7XG5cbiAgICBAVmlld0NoaWxkKFByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50KSBwcm9jZXNzTWFuYWdlckNvbXBvbmVudDogUHJvY2Vzc01hbmFnZXJDb21wb25lbnQ7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBlbFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgcHJpdmF0ZSBmaWxlU2VsZWN0b3JTZXJ2aWNlOiBGaWxlU2VsZWN0b3JTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHByb2Nlc3NNYW5hZ2VtZW50U2VydmljZTogUHJvY2Vzc01hbmFnZW1lbnRTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBjb25zdCBtb2JpbGVFbGVtZW50cyA9ICQodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50KS5maW5kKCc+W3dtTmV0d29ya0luZm9Ub2FzdGVyXSwgPlt3bUFwcFVwZGF0ZV0sID5bd21Nb2JpbGVGaWxlQnJvd3Nlcl0nKTtcbiAgICAgICAgY29uc3QgJGJvZHkgPSAkKCdib2R5OmZpcnN0Jyk7XG4gICAgICAgIGlmIChoYXNDb3Jkb3ZhKCkpIHtcbiAgICAgICAgICAgIG1vYmlsZUVsZW1lbnRzLmFwcGVuZFRvKCRib2R5KTtcbiAgICAgICAgICAgIHRoaXMuZmlsZVNlbGVjdG9yU2VydmljZS5zZXRGaWxlQnJvd3Nlcih0aGlzLmZpbGVCcm93c2VyQ29tcG9uZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vYmlsZUVsZW1lbnRzLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgICQodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50KS5maW5kKCc+W3dtUHJvZ3Jlc3NNYW5hZ2VyXScpLmFwcGVuZFRvKCRib2R5KTtcbiAgICAgICAgdGhpcy5wcm9jZXNzTWFuYWdlbWVudFNlcnZpY2Uuc2V0VUlDb21wb25lbnQodGhpcy5wcm9jZXNzTWFuYWdlckNvbXBvbmVudCk7XG4gICAgfVxufVxuIl19