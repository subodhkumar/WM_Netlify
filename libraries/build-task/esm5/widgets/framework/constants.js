export var EVENTS_MAP = new Map([
    // ['enterkeypress', 'keypress.enter']
    ['tap', 'click']
]);
// TODO: Implement touch events for the mobile
export var DISPLAY_TYPE = {
    BLOCK: 'block',
    INLINE_BLOCK: 'inline-block',
    INLINE: 'inline'
};
// set of boolean attrs
var BOOLEAN_ATTRS = new Set([
    'readonly', 'autofocus', 'disabled', 'startchecked', 'multiple',
    'selected', 'required', 'controls', 'autoplay', 'loop', 'muted', 'show'
]);
/**
 * Returns true if the provided key is a boolean attribute
 * @param {string} key
 * @returns {boolean}
 */
export var isBooleanAttr = function (key) { return BOOLEAN_ATTRS.has(key); };
var DIMENSION_PROPS = new Set([
    'width',
    'height',
    'iconheight',
    'iconwidth',
    'popoverwidth',
    'popoverheight',
    'imagewidth',
    'imageheight'
]);
export var isDimensionProp = function (key) { return DIMENSION_PROPS.has(key); };
export var DEBOUNCE_TIMES = {
    PAGINATION_DEBOUNCE_TIME: 250
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2ZyYW1ld29yay9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFpQjtJQUM5QyxzQ0FBc0M7SUFDdkMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO0NBQ2xCLENBQUMsQ0FBQztBQUdILDhDQUE4QztBQUU5QyxNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUc7SUFDeEIsS0FBSyxFQUFFLE9BQU87SUFDZCxZQUFZLEVBQUUsY0FBYztJQUM1QixNQUFNLEVBQUUsUUFBUTtDQUNuQixDQUFDO0FBRUYsdUJBQXVCO0FBQ3ZCLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDO0lBQzFCLFVBQVUsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVO0lBQy9ELFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU07Q0FDMUUsQ0FBQyxDQUFDO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxVQUFDLEdBQVcsSUFBYyxPQUFBLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQXRCLENBQXNCLENBQUM7QUFFOUUsSUFBTSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDNUIsT0FBTztJQUNQLFFBQVE7SUFDUixZQUFZO0lBQ1osV0FBVztJQUNYLGNBQWM7SUFDZCxlQUFlO0lBQ2YsWUFBWTtJQUNaLGFBQWE7Q0FDaEIsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLFVBQUMsR0FBVyxJQUFjLE9BQUEsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQztBQUVsRixNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUc7SUFDMUIsd0JBQXdCLEVBQUcsR0FBRztDQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgRVZFTlRTX01BUCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KFtcbiAgICAvLyBbJ2VudGVya2V5cHJlc3MnLCAna2V5cHJlc3MuZW50ZXInXVxuICAgWyd0YXAnLCAnY2xpY2snXVxuXSk7XG5cblxuLy8gVE9ETzogSW1wbGVtZW50IHRvdWNoIGV2ZW50cyBmb3IgdGhlIG1vYmlsZVxuXG5leHBvcnQgY29uc3QgRElTUExBWV9UWVBFID0ge1xuICAgIEJMT0NLOiAnYmxvY2snLFxuICAgIElOTElORV9CTE9DSzogJ2lubGluZS1ibG9jaycsXG4gICAgSU5MSU5FOiAnaW5saW5lJ1xufTtcblxuLy8gc2V0IG9mIGJvb2xlYW4gYXR0cnNcbmNvbnN0IEJPT0xFQU5fQVRUUlMgPSBuZXcgU2V0KFtcbiAgICAncmVhZG9ubHknLCAnYXV0b2ZvY3VzJywgJ2Rpc2FibGVkJywgJ3N0YXJ0Y2hlY2tlZCcsICdtdWx0aXBsZScsXG4gICAgJ3NlbGVjdGVkJywgJ3JlcXVpcmVkJywgJ2NvbnRyb2xzJywgJ2F1dG9wbGF5JywgJ2xvb3AnLCAnbXV0ZWQnLCAnc2hvdydcbl0pO1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcHJvdmlkZWQga2V5IGlzIGEgYm9vbGVhbiBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgY29uc3QgaXNCb29sZWFuQXR0ciA9IChrZXk6IHN0cmluZyk6IGJvb2xlYW4gPT4gQk9PTEVBTl9BVFRSUy5oYXMoa2V5KTtcblxuY29uc3QgRElNRU5TSU9OX1BST1BTID0gbmV3IFNldChbXG4gICAgJ3dpZHRoJyxcbiAgICAnaGVpZ2h0JyxcbiAgICAnaWNvbmhlaWdodCcsXG4gICAgJ2ljb253aWR0aCcsXG4gICAgJ3BvcG92ZXJ3aWR0aCcsXG4gICAgJ3BvcG92ZXJoZWlnaHQnLFxuICAgICdpbWFnZXdpZHRoJyxcbiAgICAnaW1hZ2VoZWlnaHQnXG5dKTtcblxuZXhwb3J0IGNvbnN0IGlzRGltZW5zaW9uUHJvcCA9IChrZXk6IHN0cmluZyk6IGJvb2xlYW4gPT4gRElNRU5TSU9OX1BST1BTLmhhcyhrZXkpO1xuXG5leHBvcnQgY29uc3QgREVCT1VOQ0VfVElNRVMgPSB7XG4gICAgUEFHSU5BVElPTl9ERUJPVU5DRV9USU1FIDogMjUwXG59O1xuIl19