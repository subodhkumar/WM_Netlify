import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
export declare class BreadcrumbComponent extends DatasetAwareNavComponent {
    private route;
    private location;
    static initializeProps: void;
    private disableMenuContext;
    constructor(inj: Injector, route: Router, location: Location, beforeNavigateCB: string);
    /**
     * Gets the first path found based on the key provided inside info Object.
     * @param info - Info object which has properties key(Active Page Name) and isPathFound[boolean] is set true if path found.
     * @param children - a child Object form children Array.
     * @param path - final path.
     * @returns {*|Array}: returns array of objects which represents the final path.
     */
    private getPath;
    private getCurrentRoute;
    protected resetNodes(): void;
    onItemClick($event: Event, $item: any): void;
}
