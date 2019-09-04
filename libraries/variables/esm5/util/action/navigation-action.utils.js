import { navigationService } from '../variable/variables.utils';
/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
export var navigate = function (variable, options) {
    variable.dataSet = (options && options.data) || variable.dataSet;
    var viewName;
    var pageName = variable.dataBinding.pageName || variable.pageName, operation = variable.operation, urlParams = variable.dataSet;
    options = options || {};
    /* if operation is goToPage, navigate to the pageName */
    switch (operation) {
        case 'goToPreviousPage':
            navigationService.goToPrevious();
            break;
        case 'gotoPage':
            navigationService.goToPage(pageName, {
                transition: variable.pageTransitions,
                $event: options.$event,
                urlParams: urlParams
            });
            break;
        case 'gotoView':
            viewName = (variable.dataBinding && variable.dataBinding.viewName) || variable.viewName;
            break;
        case 'gotoTab':
            viewName = (variable.dataBinding && variable.dataBinding.tabName) || variable.tabName;
            break;
        case 'gotoAccordion':
            viewName = (variable.dataBinding && variable.dataBinding.accordionName) || variable.accordionName;
            break;
        case 'gotoSegment':
            viewName = (variable.dataBinding && variable.dataBinding.segmentName) || variable.segmentName;
            break;
    }
    /* if view name found, call routine to navigate to it */
    if (viewName) {
        navigationService.goToView(viewName, {
            pageName: pageName,
            transition: variable.pageTransitions,
            $event: options.$event,
            urlParams: urlParams
        }, variable);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1hY3Rpb24udXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidXRpbC9hY3Rpb24vbmF2aWdhdGlvbi1hY3Rpb24udXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFaEU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRyxVQUFDLFFBQVEsRUFBRSxPQUFPO0lBQ3RDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFDakUsSUFBSSxRQUFRLENBQUM7SUFDYixJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUMvRCxTQUFTLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFDOUIsU0FBUyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7SUFFakMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFFeEIsd0RBQXdEO0lBQ3hELFFBQVEsU0FBUyxFQUFFO1FBQ2YsS0FBSyxrQkFBa0I7WUFDbkIsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDakMsTUFBTTtRQUNWLEtBQUssVUFBVTtZQUNYLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7Z0JBQ2pDLFVBQVUsRUFBRSxRQUFRLENBQUMsZUFBZTtnQkFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2dCQUN0QixTQUFTLEVBQUUsU0FBUzthQUN2QixDQUFDLENBQUM7WUFDSCxNQUFNO1FBQ1YsS0FBSyxVQUFVO1lBQ1gsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDeEYsTUFBTTtRQUNWLEtBQUssU0FBUztZQUNWLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ3RGLE1BQU07UUFDVixLQUFLLGVBQWU7WUFDaEIsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUM7WUFDbEcsTUFBTTtRQUNWLEtBQUssYUFBYTtZQUNkLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQzlGLE1BQU07S0FDYjtJQUVELHdEQUF3RDtJQUN4RCxJQUFJLFFBQVEsRUFBRTtRQUNWLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDakMsUUFBUSxFQUFFLFFBQVE7WUFDbEIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxlQUFlO1lBQ3BDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixTQUFTLEVBQUUsU0FBUztTQUN2QixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tICcuLi92YXJpYWJsZS92YXJpYWJsZXMudXRpbHMnO1xuXG4vKipcbiAqIEhhbmRsZXMgdmFyaWFibGUgbmF2aWdhdGlvbiBvcGVyYXRpb25zXG4gKiBAcGFyYW0gdmFyaWFibGVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZSA9ICh2YXJpYWJsZSwgb3B0aW9ucykgPT4ge1xuICAgIHZhcmlhYmxlLmRhdGFTZXQgPSAob3B0aW9ucyAmJiBvcHRpb25zLmRhdGEpIHx8IHZhcmlhYmxlLmRhdGFTZXQ7XG4gICAgbGV0IHZpZXdOYW1lO1xuICAgIGNvbnN0IHBhZ2VOYW1lID0gdmFyaWFibGUuZGF0YUJpbmRpbmcucGFnZU5hbWUgfHwgdmFyaWFibGUucGFnZU5hbWUsXG4gICAgICAgIG9wZXJhdGlvbiA9IHZhcmlhYmxlLm9wZXJhdGlvbixcbiAgICAgICAgdXJsUGFyYW1zID0gdmFyaWFibGUuZGF0YVNldDtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgLyogaWYgb3BlcmF0aW9uIGlzIGdvVG9QYWdlLCBuYXZpZ2F0ZSB0byB0aGUgcGFnZU5hbWUgKi9cbiAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICBjYXNlICdnb1RvUHJldmlvdXNQYWdlJzpcbiAgICAgICAgICAgIG5hdmlnYXRpb25TZXJ2aWNlLmdvVG9QcmV2aW91cygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvdG9QYWdlJzpcbiAgICAgICAgICAgIG5hdmlnYXRpb25TZXJ2aWNlLmdvVG9QYWdlKHBhZ2VOYW1lLCB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyaWFibGUucGFnZVRyYW5zaXRpb25zLFxuICAgICAgICAgICAgICAgICRldmVudDogb3B0aW9ucy4kZXZlbnQsXG4gICAgICAgICAgICAgICAgdXJsUGFyYW1zOiB1cmxQYXJhbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvdG9WaWV3JzpcbiAgICAgICAgICAgIHZpZXdOYW1lID0gKHZhcmlhYmxlLmRhdGFCaW5kaW5nICYmIHZhcmlhYmxlLmRhdGFCaW5kaW5nLnZpZXdOYW1lKSB8fCB2YXJpYWJsZS52aWV3TmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnb3RvVGFiJzpcbiAgICAgICAgICAgIHZpZXdOYW1lID0gKHZhcmlhYmxlLmRhdGFCaW5kaW5nICYmIHZhcmlhYmxlLmRhdGFCaW5kaW5nLnRhYk5hbWUpIHx8IHZhcmlhYmxlLnRhYk5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ290b0FjY29yZGlvbic6XG4gICAgICAgICAgICB2aWV3TmFtZSA9ICh2YXJpYWJsZS5kYXRhQmluZGluZyAmJiB2YXJpYWJsZS5kYXRhQmluZGluZy5hY2NvcmRpb25OYW1lKSB8fCB2YXJpYWJsZS5hY2NvcmRpb25OYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvdG9TZWdtZW50JzpcbiAgICAgICAgICAgIHZpZXdOYW1lID0gKHZhcmlhYmxlLmRhdGFCaW5kaW5nICYmIHZhcmlhYmxlLmRhdGFCaW5kaW5nLnNlZ21lbnROYW1lKSB8fCB2YXJpYWJsZS5zZWdtZW50TmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8qIGlmIHZpZXcgbmFtZSBmb3VuZCwgY2FsbCByb3V0aW5lIHRvIG5hdmlnYXRlIHRvIGl0ICovXG4gICAgaWYgKHZpZXdOYW1lKSB7XG4gICAgICAgIG5hdmlnYXRpb25TZXJ2aWNlLmdvVG9WaWV3KHZpZXdOYW1lLCB7XG4gICAgICAgICAgICBwYWdlTmFtZTogcGFnZU5hbWUsXG4gICAgICAgICAgICB0cmFuc2l0aW9uOiB2YXJpYWJsZS5wYWdlVHJhbnNpdGlvbnMsXG4gICAgICAgICAgICAkZXZlbnQ6IG9wdGlvbnMuJGV2ZW50LFxuICAgICAgICAgICAgdXJsUGFyYW1zOiB1cmxQYXJhbXNcbiAgICAgICAgfSwgdmFyaWFibGUpO1xuICAgIH1cbn07XG4iXX0=