import * as tslib_1 from "tslib";
function idGenerator(token) {
    var id;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = 1;
                _a.label = 1;
            case 1:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, "" + token + id++];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
var IDGenerator = /** @class */ (function () {
    function IDGenerator(key) {
        this.generator = idGenerator(key);
    }
    IDGenerator.prototype.nextUid = function () {
        return this.generator.next().value;
    };
    return IDGenerator;
}());
export { IDGenerator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQtZ2VuZXJhdG9yLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvcmUvIiwic291cmNlcyI6WyJ1dGlscy9pZC1nZW5lcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLFNBQVUsV0FBVyxDQUFDLEtBQUs7Ozs7O2dCQUNuQixFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7cUJBQ0osQ0FBQztnQkFDSixxQkFBTSxLQUFHLEtBQUssR0FBRyxFQUFFLEVBQUksRUFBQTs7Z0JBQXZCLFNBQXVCLENBQUM7Ozs7O0NBRS9CO0FBRUQ7SUFHSSxxQkFBWSxHQUFXO1FBQ25CLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSw2QkFBTyxHQUFkO1FBQ0ksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQztJQUN2QyxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQUFDLEFBVkQsSUFVQyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uKiBpZEdlbmVyYXRvcih0b2tlbikge1xuICAgIGxldCBpZCA9IDE7XG4gICAgd2hpbGUgKDEpIHtcbiAgICAgICAgeWllbGQgYCR7dG9rZW59JHtpZCsrfWA7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgSURHZW5lcmF0b3Ige1xuICAgIHByaXZhdGUgZ2VuZXJhdG9yOiBJdGVyYXRvcjxhbnk+O1xuXG4gICAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0b3IgPSBpZEdlbmVyYXRvcihrZXkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZXh0VWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRvci5uZXh0KCkudmFsdWU7XG4gICAgfVxufVxuIl19