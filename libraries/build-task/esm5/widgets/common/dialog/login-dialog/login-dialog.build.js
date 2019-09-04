import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-logindialog', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " wmDialog wmLoginDialog " + getAttrMarkup(attrs) + " eventsource.bind=\"Actions.loginAction\" wm-navigable-element=\"true\"><ng-template #dialogBody>"; },
        post: function () { return "</ng-template></" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tZGlhbG9nLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9kaWFsb2cvbG9naW4tZGlhbG9nL2xvZ2luLWRpYWxvZy5idWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4RSxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLGdCQUFnQixFQUFFO0lBQ3ZCLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8sZ0NBQTJCLGFBQWEsQ0FBQyxLQUFLLENBQUMsc0dBQStGLEVBQXpKLENBQXlKO1FBQ3ZLLElBQUksRUFBRSxjQUFNLE9BQUEscUJBQW1CLE9BQU8sTUFBRyxFQUE3QixDQUE2QjtLQUM1QyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1sb2dpbmRpYWxvZycsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSB3bURpYWxvZyB3bUxvZ2luRGlhbG9nICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9IGV2ZW50c291cmNlLmJpbmQ9XCJBY3Rpb25zLmxvZ2luQWN0aW9uXCIgd20tbmF2aWdhYmxlLWVsZW1lbnQ9XCJ0cnVlXCI+PG5nLXRlbXBsYXRlICNkaWFsb2dCb2R5PmAsXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8L25nLXRlbXBsYXRlPjwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==