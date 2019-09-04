import { DataSource } from '@wm/core';
import DatasetUtil from '../util/dataset-util';
export class BaseAction {
    execute(operation, options) {
        let returnVal;
        switch (operation) {
            case DataSource.Operation.GET_NAME:
                returnVal = this.name;
                break;
            case DataSource.Operation.GET_UNIQUE_IDENTIFIER:
                returnVal = this._id;
                break;
            case DataSource.Operation.GET_CONTEXT_IDENTIFIER:
                returnVal = this._context;
                break;
        }
        return returnVal;
    }
    getData() {
        return this.dataSet;
    }
    setData(dataSet) {
        if (DatasetUtil.isValidDataset(dataSet)) {
            this.dataSet = dataSet;
        }
        return this.dataSet;
    }
    getValue(key, index) {
        return DatasetUtil.getValue(this.dataSet, key, index);
    }
    setValue(key, value) {
        return DatasetUtil.setValue(this.dataSet, key, value);
    }
    getItem(index) {
        return DatasetUtil.getItem(this.dataSet, index);
    }
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index, value) {
        return DatasetUtil.setItem(this.dataSet, index, value);
    }
    addItem(value, index) {
        return DatasetUtil.addItem(this.dataSet, value, index);
    }
    removeItem(index, exactMatch) {
        return DatasetUtil.removeItem(this.dataSet, index, exactMatch);
    }
    clearData() {
        this.dataSet = DatasetUtil.getValidDataset();
        return this.dataSet;
    }
    getCount() {
        return DatasetUtil.getCount(this.dataSet);
    }
    init() {
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hY3Rpb24uanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibW9kZWwvYmFzZS1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0QyxPQUFPLFdBQVcsTUFBTSxzQkFBc0IsQ0FBQztBQUUvQyxNQUFNLE9BQWdCLFVBQVU7SUFXNUIsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPO1FBQ3RCLElBQUksU0FBUyxDQUFDO1FBQ2QsUUFBUSxTQUFTLEVBQUU7WUFDZixLQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUTtnQkFDOUIsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLE1BQU07WUFDVixLQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMscUJBQXFCO2dCQUMzQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDckIsTUFBTTtZQUNWLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0I7Z0JBQzVDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUMxQixNQUFNO1NBQ2I7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRUQsT0FBTztRQUNILE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsT0FBTyxDQUFDLE9BQVk7UUFDaEIsSUFBSSxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzFCO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBVyxFQUFFLEtBQWE7UUFDL0IsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxRQUFRLENBQUMsR0FBVyxFQUFFLEtBQVU7UUFDNUIsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxPQUFPLENBQUMsS0FBYTtRQUNqQixPQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsT0FBTyxDQUFDLEtBQVUsRUFBRSxLQUFVO1FBQzFCLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsT0FBTyxDQUFDLEtBQVUsRUFBRSxLQUFhO1FBQzdCLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVUsRUFBRSxVQUFtQjtRQUN0QyxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFNBQVM7UUFDTCxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxJQUFJO0lBQ0osQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YVNvdXJjZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IERhdGFzZXRVdGlsIGZyb20gJy4uL3V0aWwvZGF0YXNldC11dGlsJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VBY3Rpb24ge1xuXG4gICAgcHJvdGVjdGVkIF9pZDogc3RyaW5nO1xuXG4gICAgbmFtZTogc3RyaW5nO1xuICAgIG93bmVyOiBzdHJpbmc7XG4gICAgY2F0ZWdvcnk6IHN0cmluZztcbiAgICBkYXRhU2V0OiBhbnk7XG4gICAgZGF0YUJpbmRpbmc6IGFueTtcbiAgICBfY29udGV4dDogYW55O1xuXG4gICAgZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IHJldHVyblZhbDtcbiAgICAgICAgc3dpdGNoIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX05BTUU6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5uYW1lO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfVU5JUVVFX0lERU5USUZJRVI6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5faWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9DT05URVhUX0lERU5USUZJRVI6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5fY29udGV4dDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsO1xuICAgIH1cblxuICAgIGdldERhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXQ7XG4gICAgfVxuXG4gICAgc2V0RGF0YShkYXRhU2V0OiBhbnkpIHtcbiAgICAgICAgaWYgKERhdGFzZXRVdGlsLmlzVmFsaWREYXRhc2V0KGRhdGFTZXQpKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFTZXQgPSBkYXRhU2V0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXQ7XG4gICAgfVxuXG4gICAgZ2V0VmFsdWUoa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIERhdGFzZXRVdGlsLmdldFZhbHVlKHRoaXMuZGF0YVNldCwga2V5LCBpbmRleCk7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIERhdGFzZXRVdGlsLnNldFZhbHVlKHRoaXMuZGF0YVNldCwga2V5LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0SXRlbShpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBEYXRhc2V0VXRpbC5nZXRJdGVtKHRoaXMuZGF0YVNldCwgaW5kZXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGluZGV4LCBhIG51bWJlciBpbiBpZGVhbCBjYXNlXG4gICAgICogICAgICAgIGl0IGNhbiBiZSB0aGUgb2JqZWN0IHRvIGJlIHJlcGxhY2VkIGJ5IHRoZSBwYXNzZWQgdmFsdWVcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7YW55fVxuICAgICAqL1xuICAgIHNldEl0ZW0oaW5kZXg6IGFueSwgdmFsdWU6IGFueSkge1xuICAgICAgICByZXR1cm4gRGF0YXNldFV0aWwuc2V0SXRlbSh0aGlzLmRhdGFTZXQsIGluZGV4LCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgYWRkSXRlbSh2YWx1ZTogYW55LCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiBEYXRhc2V0VXRpbC5hZGRJdGVtKHRoaXMuZGF0YVNldCwgdmFsdWUsIGluZGV4KTtcbiAgICB9XG5cbiAgICByZW1vdmVJdGVtKGluZGV4OiBhbnksIGV4YWN0TWF0Y2g6IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIERhdGFzZXRVdGlsLnJlbW92ZUl0ZW0odGhpcy5kYXRhU2V0LCBpbmRleCwgZXhhY3RNYXRjaCk7XG4gICAgfVxuXG4gICAgY2xlYXJEYXRhKCkge1xuICAgICAgICB0aGlzLmRhdGFTZXQgPSBEYXRhc2V0VXRpbC5nZXRWYWxpZERhdGFzZXQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVNldDtcbiAgICB9XG5cbiAgICBnZXRDb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIERhdGFzZXRVdGlsLmdldENvdW50KHRoaXMuZGF0YVNldCk7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICB9XG59XG4iXX0=