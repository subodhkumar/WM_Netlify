import { navigationService } from '../variable/variables.utils';
/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
export const navigate = (variable, options) => {
    variable.dataSet = (options && options.data) || variable.dataSet;
    let viewName;
    const pageName = variable.dataBinding.pageName || variable.pageName, operation = variable.operation, urlParams = variable.dataSet;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi1hY3Rpb24udXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidXRpbC9hY3Rpb24vbmF2aWdhdGlvbi1hY3Rpb24udXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFaEU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRTtJQUMxQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDO0lBQ2pFLElBQUksUUFBUSxDQUFDO0lBQ2IsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFFBQVEsRUFDL0QsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQzlCLFNBQVMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO0lBRWpDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO0lBRXhCLHdEQUF3RDtJQUN4RCxRQUFRLFNBQVMsRUFBRTtRQUNmLEtBQUssa0JBQWtCO1lBQ25CLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ2pDLE1BQU07UUFDVixLQUFLLFVBQVU7WUFDWCxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUNqQyxVQUFVLEVBQUUsUUFBUSxDQUFDLGVBQWU7Z0JBQ3BDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtnQkFDdEIsU0FBUyxFQUFFLFNBQVM7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsTUFBTTtRQUNWLEtBQUssVUFBVTtZQUNYLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ3hGLE1BQU07UUFDVixLQUFLLFNBQVM7WUFDVixRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUN0RixNQUFNO1FBQ1YsS0FBSyxlQUFlO1lBQ2hCLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDO1lBQ2xHLE1BQU07UUFDVixLQUFLLGFBQWE7WUFDZCxRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUM5RixNQUFNO0tBQ2I7SUFFRCx3REFBd0Q7SUFDeEQsSUFBSSxRQUFRLEVBQUU7UUFDVixpQkFBaUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ2pDLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLFVBQVUsRUFBRSxRQUFRLENBQUMsZUFBZTtZQUNwQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsU0FBUyxFQUFFLFNBQVM7U0FDdkIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNoQjtBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vdmFyaWFibGUvdmFyaWFibGVzLnV0aWxzJztcblxuLyoqXG4gKiBIYW5kbGVzIHZhcmlhYmxlIG5hdmlnYXRpb24gb3BlcmF0aW9uc1xuICogQHBhcmFtIHZhcmlhYmxlXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5leHBvcnQgY29uc3QgbmF2aWdhdGUgPSAodmFyaWFibGUsIG9wdGlvbnMpID0+IHtcbiAgICB2YXJpYWJsZS5kYXRhU2V0ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5kYXRhKSB8fCB2YXJpYWJsZS5kYXRhU2V0O1xuICAgIGxldCB2aWV3TmFtZTtcbiAgICBjb25zdCBwYWdlTmFtZSA9IHZhcmlhYmxlLmRhdGFCaW5kaW5nLnBhZ2VOYW1lIHx8IHZhcmlhYmxlLnBhZ2VOYW1lLFxuICAgICAgICBvcGVyYXRpb24gPSB2YXJpYWJsZS5vcGVyYXRpb24sXG4gICAgICAgIHVybFBhcmFtcyA9IHZhcmlhYmxlLmRhdGFTZXQ7XG5cbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8qIGlmIG9wZXJhdGlvbiBpcyBnb1RvUGFnZSwgbmF2aWdhdGUgdG8gdGhlIHBhZ2VOYW1lICovXG4gICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgY2FzZSAnZ29Ub1ByZXZpb3VzUGFnZSc6XG4gICAgICAgICAgICBuYXZpZ2F0aW9uU2VydmljZS5nb1RvUHJldmlvdXMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnb3RvUGFnZSc6XG4gICAgICAgICAgICBuYXZpZ2F0aW9uU2VydmljZS5nb1RvUGFnZShwYWdlTmFtZSwge1xuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHZhcmlhYmxlLnBhZ2VUcmFuc2l0aW9ucyxcbiAgICAgICAgICAgICAgICAkZXZlbnQ6IG9wdGlvbnMuJGV2ZW50LFxuICAgICAgICAgICAgICAgIHVybFBhcmFtczogdXJsUGFyYW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnb3RvVmlldyc6XG4gICAgICAgICAgICB2aWV3TmFtZSA9ICh2YXJpYWJsZS5kYXRhQmluZGluZyAmJiB2YXJpYWJsZS5kYXRhQmluZGluZy52aWV3TmFtZSkgfHwgdmFyaWFibGUudmlld05hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ290b1RhYic6XG4gICAgICAgICAgICB2aWV3TmFtZSA9ICh2YXJpYWJsZS5kYXRhQmluZGluZyAmJiB2YXJpYWJsZS5kYXRhQmluZGluZy50YWJOYW1lKSB8fCB2YXJpYWJsZS50YWJOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dvdG9BY2NvcmRpb24nOlxuICAgICAgICAgICAgdmlld05hbWUgPSAodmFyaWFibGUuZGF0YUJpbmRpbmcgJiYgdmFyaWFibGUuZGF0YUJpbmRpbmcuYWNjb3JkaW9uTmFtZSkgfHwgdmFyaWFibGUuYWNjb3JkaW9uTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnb3RvU2VnbWVudCc6XG4gICAgICAgICAgICB2aWV3TmFtZSA9ICh2YXJpYWJsZS5kYXRhQmluZGluZyAmJiB2YXJpYWJsZS5kYXRhQmluZGluZy5zZWdtZW50TmFtZSkgfHwgdmFyaWFibGUuc2VnbWVudE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvKiBpZiB2aWV3IG5hbWUgZm91bmQsIGNhbGwgcm91dGluZSB0byBuYXZpZ2F0ZSB0byBpdCAqL1xuICAgIGlmICh2aWV3TmFtZSkge1xuICAgICAgICBuYXZpZ2F0aW9uU2VydmljZS5nb1RvVmlldyh2aWV3TmFtZSwge1xuICAgICAgICAgICAgcGFnZU5hbWU6IHBhZ2VOYW1lLFxuICAgICAgICAgICAgdHJhbnNpdGlvbjogdmFyaWFibGUucGFnZVRyYW5zaXRpb25zLFxuICAgICAgICAgICAgJGV2ZW50OiBvcHRpb25zLiRldmVudCxcbiAgICAgICAgICAgIHVybFBhcmFtczogdXJsUGFyYW1zXG4gICAgICAgIH0sIHZhcmlhYmxlKTtcbiAgICB9XG59O1xuIl19