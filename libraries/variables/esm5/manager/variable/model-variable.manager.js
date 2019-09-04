import * as tslib_1 from "tslib";
import { BaseVariableManager } from './base-variable.manager';
var checkEmptyObject = function (obj) {
    var isEmpty = true;
    _.forEach(obj, function (value) {
        if (_.isEmpty(value)) {
            return;
        }
        if (!_.isObject(value)) {
            isEmpty = false;
        }
        else if (_.isArray(value)) {
            // If array, check if array is empty or if it has only one value and the value is empty
            isEmpty = _.isEmpty(value) || (value.length === 1 ? _.isEmpty(value[0]) : false);
        }
        else {
            // If object, loop over the object to check if it is empty or not
            isEmpty = checkEmptyObject(value);
        }
        return isEmpty; // isEmpty false will break the loop
    });
    return isEmpty;
};
var ɵ0 = checkEmptyObject;
var ModelVariableManager = /** @class */ (function (_super) {
    tslib_1.__extends(ModelVariableManager, _super);
    function ModelVariableManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /*
    * Case: a LIST type static variable having only one object
    * and the object has all fields empty, remove that object
    */
    ModelVariableManager.prototype.removeFirstEmptyObject = function (variable) {
        if (_.isArray(variable.dataSet) && variable.dataSet.length === 1 && checkEmptyObject(variable.dataSet[0])) {
            variable.dataSet = [];
        }
    };
    return ModelVariableManager;
}(BaseVariableManager));
export { ModelVariableManager };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtdmFyaWFibGUubWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtYW5hZ2VyL3ZhcmlhYmxlL21vZGVsLXZhcmlhYmxlLm1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSTlELElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxHQUFHO0lBQ3pCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFDLEtBQUs7UUFDakIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDbkI7YUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsdUZBQXVGO1lBQ3ZGLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BGO2FBQU07WUFDSCxpRUFBaUU7WUFDakUsT0FBTyxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxvQ0FBb0M7SUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDLENBQUM7O0FBRUY7SUFBMEMsZ0RBQW1CO0lBQTdEOztJQVVBLENBQUM7SUFURzs7O01BR0U7SUFDRixxREFBc0IsR0FBdEIsVUFBdUIsUUFBUTtRQUMzQixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkcsUUFBUSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0wsMkJBQUM7QUFBRCxDQUFDLEFBVkQsQ0FBMEMsbUJBQW1CLEdBVTVEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZVZhcmlhYmxlTWFuYWdlciB9IGZyb20gJy4vYmFzZS12YXJpYWJsZS5tYW5hZ2VyJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBjaGVja0VtcHR5T2JqZWN0ID0gKG9iaikgPT4ge1xuICAgIGxldCBpc0VtcHR5ID0gdHJ1ZTtcbiAgICBfLmZvckVhY2gob2JqLCAodmFsdWUpID0+IHtcbiAgICAgICAgaWYgKF8uaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgICAgaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIElmIGFycmF5LCBjaGVjayBpZiBhcnJheSBpcyBlbXB0eSBvciBpZiBpdCBoYXMgb25seSBvbmUgdmFsdWUgYW5kIHRoZSB2YWx1ZSBpcyBlbXB0eVxuICAgICAgICAgICAgaXNFbXB0eSA9IF8uaXNFbXB0eSh2YWx1ZSkgfHwgKHZhbHVlLmxlbmd0aCA9PT0gMSA/IF8uaXNFbXB0eSh2YWx1ZVswXSkgOiBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiBvYmplY3QsIGxvb3Agb3ZlciB0aGUgb2JqZWN0IHRvIGNoZWNrIGlmIGl0IGlzIGVtcHR5IG9yIG5vdFxuICAgICAgICAgICAgaXNFbXB0eSA9IGNoZWNrRW1wdHlPYmplY3QodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpc0VtcHR5OyAvLyBpc0VtcHR5IGZhbHNlIHdpbGwgYnJlYWsgdGhlIGxvb3BcbiAgICB9KTtcbiAgICByZXR1cm4gaXNFbXB0eTtcbn07XG5cbmV4cG9ydCBjbGFzcyBNb2RlbFZhcmlhYmxlTWFuYWdlciBleHRlbmRzIEJhc2VWYXJpYWJsZU1hbmFnZXIge1xuICAgIC8qXG4gICAgKiBDYXNlOiBhIExJU1QgdHlwZSBzdGF0aWMgdmFyaWFibGUgaGF2aW5nIG9ubHkgb25lIG9iamVjdFxuICAgICogYW5kIHRoZSBvYmplY3QgaGFzIGFsbCBmaWVsZHMgZW1wdHksIHJlbW92ZSB0aGF0IG9iamVjdFxuICAgICovXG4gICAgcmVtb3ZlRmlyc3RFbXB0eU9iamVjdCh2YXJpYWJsZSkge1xuICAgICAgICBpZiAoXy5pc0FycmF5KHZhcmlhYmxlLmRhdGFTZXQpICYmIHZhcmlhYmxlLmRhdGFTZXQubGVuZ3RoID09PSAxICYmIGNoZWNrRW1wdHlPYmplY3QodmFyaWFibGUuZGF0YVNldFswXSkpIHtcbiAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFTZXQgPSBbXTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==