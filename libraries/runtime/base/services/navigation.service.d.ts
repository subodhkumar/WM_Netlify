import { Router } from '@angular/router';
import { App, NavigationOptions, AbstractNavigationService } from '@wm/core';
export declare class NavigationServiceImpl implements AbstractNavigationService {
    private app;
    private router;
    private history;
    private transition;
    private isPageAddedToHistory;
    constructor(app: App, router: Router);
    getPageTransition(): string;
    /**
     * Navigates to particular page
     * @param pageName
     * @param options
     */
    goToPage(pageName: string, options: NavigationOptions): Promise<boolean>;
    /**
     * Navigates to last visited page.
     */
    goToPrevious(): void;
    /** Todo[Shubham] Need to handle gotoElement in other partials
     * Navigates to particular view
     * @param viewName
     * @param options
     * @param variable
     */
    goToView(viewName: string, options: NavigationOptions, variable: any): void;
    private goToElementView;
    private getViewElementInActivePage;
    /**
     * checks if the pagecontainer has the pageName.
     */
    private isPartialWithNameExists;
    /**
     * checks if the pagecontainer has the prefab.
     */
    private isPrefabWithNameExists;
    private showAncestors;
    private showAncestorDialog;
}
