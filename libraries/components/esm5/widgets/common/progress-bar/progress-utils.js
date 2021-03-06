import { isString } from '@wm/core';
// This function returns the maximum number of decimal digits allowed.
export var getDecimalCount = function (val) {
    val = val || '9';
    val = val.replace(/\%$/, '');
    var n = val.lastIndexOf('.');
    return (n === -1) ? 0 : (val.length - n - 1);
};
// returns true if the given value contains '%'
export var isPercentageValue = function (val) {
    if (isString(val)) {
        val = val.trim();
        return val.charAt(val.length - 1) === '%';
    }
    return false;
};
export var calculatePercent = function (value, min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 0; }
    var percent = ((value - min) / (max - min)) * 100;
    if (_.isNaN(percent)) {
        console.warn('Circle Progress Bar: One of the properties Min, Max or datavalue is not a valid number');
        return 0;
    }
    return Math.abs(percent);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtdXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3Byb2dyZXNzLWJhci9wcm9ncmVzcy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSXBDLHNFQUFzRTtBQUN0RSxNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsVUFBQyxHQUFXO0lBQ3ZDLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ2pCLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU3QixJQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRS9CLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUMsQ0FBQztBQUVGLCtDQUErQztBQUMvQyxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEdBQVc7SUFDekMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDZixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQztLQUM3QztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLFVBQUMsS0FBYSxFQUFHLEdBQWUsRUFBRSxHQUFlO0lBQWhDLG9CQUFBLEVBQUEsT0FBZTtJQUFFLG9CQUFBLEVBQUEsT0FBZTtJQUM3RSxJQUFNLE9BQU8sR0FBVyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTVELElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHdGQUF3RixDQUFDLENBQUM7UUFDdkcsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgZGlnaXRzIGFsbG93ZWQuXG5leHBvcnQgY29uc3QgZ2V0RGVjaW1hbENvdW50ID0gKHZhbDogc3RyaW5nKSA9PiB7XG4gICAgdmFsID0gdmFsIHx8ICc5JztcbiAgICB2YWwgPSB2YWwucmVwbGFjZSgvXFwlJC8sICcnKTtcblxuICAgIGNvbnN0IG4gPSB2YWwubGFzdEluZGV4T2YoJy4nKTtcblxuICAgIHJldHVybiAobiA9PT0gLTEpID8gMCA6ICh2YWwubGVuZ3RoIC0gbiAtIDEpO1xufTtcblxuLy8gcmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiB2YWx1ZSBjb250YWlucyAnJSdcbmV4cG9ydCBjb25zdCBpc1BlcmNlbnRhZ2VWYWx1ZSA9ICh2YWw6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChpc1N0cmluZyh2YWwpKSB7XG4gICAgICAgIHZhbCA9IHZhbC50cmltKCk7XG4gICAgICAgIHJldHVybiB2YWwuY2hhckF0KHZhbC5sZW5ndGggLSAxKSA9PT0gJyUnO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlUGVyY2VudCA9ICh2YWx1ZTogbnVtYmVyICwgbWluOiBudW1iZXIgPSAwLCBtYXg6IG51bWJlciA9IDApOiBudW1iZXIgPT4ge1xuICAgIGNvbnN0IHBlcmNlbnQ6IG51bWJlciA9ICgodmFsdWUgLSBtaW4pIC8gKG1heCAtIG1pbikpICogMTAwO1xuXG4gICAgaWYgKF8uaXNOYU4ocGVyY2VudCkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdDaXJjbGUgUHJvZ3Jlc3MgQmFyOiBPbmUgb2YgdGhlIHByb3BlcnRpZXMgTWluLCBNYXggb3IgZGF0YXZhbHVlIGlzIG5vdCBhIHZhbGlkIG51bWJlcicpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGguYWJzKHBlcmNlbnQpO1xufTtcbiJdfQ==