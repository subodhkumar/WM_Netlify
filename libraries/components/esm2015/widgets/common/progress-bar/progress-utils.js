import { isString } from '@wm/core';
// This function returns the maximum number of decimal digits allowed.
export const getDecimalCount = (val) => {
    val = val || '9';
    val = val.replace(/\%$/, '');
    const n = val.lastIndexOf('.');
    return (n === -1) ? 0 : (val.length - n - 1);
};
// returns true if the given value contains '%'
export const isPercentageValue = (val) => {
    if (isString(val)) {
        val = val.trim();
        return val.charAt(val.length - 1) === '%';
    }
    return false;
};
export const calculatePercent = (value, min = 0, max = 0) => {
    const percent = ((value - min) / (max - min)) * 100;
    if (_.isNaN(percent)) {
        console.warn('Circle Progress Bar: One of the properties Min, Max or datavalue is not a valid number');
        return 0;
    }
    return Math.abs(percent);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtdXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3Byb2dyZXNzLWJhci9wcm9ncmVzcy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSXBDLHNFQUFzRTtBQUN0RSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRTtJQUMzQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUNqQixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFN0IsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUUvQixPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRCxDQUFDLENBQUM7QUFFRiwrQ0FBK0M7QUFDL0MsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFXLEVBQVcsRUFBRTtJQUN0RCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNmLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDO0tBQzdDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFhLEVBQUcsTUFBYyxDQUFDLEVBQUUsTUFBYyxDQUFDLEVBQVUsRUFBRTtJQUN6RixNQUFNLE9BQU8sR0FBVyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTVELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHdGQUF3RixDQUFDLENBQUM7UUFDdkcsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzIGFsbG93ZWQuXG5leHBvcnQgY29uc3QgZ2V0RGVjaW1hbENvdW50ID0gKHZhbDogc3RyaW5nKSA9PiB7XG4gICAgdmFsID0gdmFsIHx8ICc5JztcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvXFwlJC8sICcnKTtcblxuICAgIGNvbnN0IG4gPSB2YWwubGFzdEluZGV4T2YoJy4nKTtcblxuICAgIHJldHVybiAobiA9PT0gLTEpID8gMCA6ICh2YWwubGVuZ3RoIC0gbiAtIDEpO1xufTtcblxuLy8gcmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB2YWx1ZSBjb250YWlucyAnJSdcbmV4cG9ydCBjb25zdCBpc1BlcmNlbnRhZ2VWYWx1ZSA9ICh2YWw6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChpc1N0cmluZyh2YWwpKSB7XG4gICAgICAgIHZhbCA9IHZhbC50cmltKCk7XG4gICAgICAgIHJldHVybiB2YWwuY2hhckF0KHZhbC5sZW5ndGggLSAxKSA9PT0gJyUnO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlUGVyY2VudCA9ICh2YWx1ZTogbnVtYmVyICwgbWluOiBudW1iZXIgPSAwLCBtYXg6IG51bWJlciA9IDApOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHBlcmNlbnQ6IG51bWJlciA9ICgodmFsdWUgLSBtaW4pIC8gKG1heCAtIG1pbikpICogMTAwO1xuXG4gICAgaWYgKF8uaXNOYU4ocGVyY2VudCkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDaXJjbGUgUHJvZ3Jlc3MgQmFyOiBPbmUgb2YgdGhlIHByb3BlcnRpZXMgTWluLCBNYXggb3IgZGF0YXZhbHVlIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGguYWJzKHBlcmNlbnQpO1xufTtcbiJdfQ==