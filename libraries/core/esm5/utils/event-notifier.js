import { Subject } from 'rxjs';
import { isObject, noop } from './utils';
var EventNotifier = /** @class */ (function () {
    function EventNotifier(start) {
        if (start === void 0) { start = true; }
        this._subject = new Subject();
        this._isInitialized = false;
        this._eventsBeforeInit = [];
        if (start) {
            this.start();
        }
    }
    /**
     * A event can be fired, but will be sent to subscribers only after exchange is started.
     *
     * @param {string} eventName
     * @param data
     */
    EventNotifier.prototype.notify = function (eventName) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this._isInitialized) {
            this._subject.next({
                name: eventName,
                data: data
            });
        }
        else {
            this._eventsBeforeInit.push({
                name: eventName,
                data: data
            });
        }
    };
    /**
     * starts the exchange and send the pending events to subscribers.
     */
    EventNotifier.prototype.start = function () {
        var _this = this;
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._eventsBeforeInit.forEach(function (event) { return _this._subject.next(event); });
        }
    };
    /**
     * upon subscription, method to cancel subscription is returned.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {() => void}
     */
    EventNotifier.prototype.subscribe = function (eventName, callback) {
        var eventListener;
        if (eventName && callback) {
            eventListener = this._subject
                .subscribe(function (event) {
                if (event && isObject(event) && event.name === eventName) {
                    callback.apply(undefined, event.data);
                }
            });
            return function () {
                eventListener.unsubscribe();
            };
        }
        return noop;
    };
    EventNotifier.prototype.destroy = function () {
        this._subject.complete();
    };
    return EventNotifier;
}());
export { EventNotifier };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbm90aWZpZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL2V2ZW50LW5vdGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFekM7SUFNSSx1QkFBWSxLQUFZO1FBQVosc0JBQUEsRUFBQSxZQUFZO1FBSmhCLGFBQVEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLHNCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUczQixJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLDhCQUFNLEdBQWIsVUFBYyxTQUFpQjtRQUFFLGNBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQiw2QkFBbUI7O1FBQ2hELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDZixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2dCQUN4QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksNkJBQUssR0FBWjtRQUFBLGlCQUtDO1FBSkcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7WUFDM0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUF6QixDQUF5QixDQUFDLENBQUM7U0FDeEU7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksaUNBQVMsR0FBaEIsVUFBaUIsU0FBUyxFQUFFLFFBQXVDO1FBQy9ELElBQUksYUFBYSxDQUFDO1FBQ2xCLElBQUksU0FBUyxJQUFJLFFBQVEsRUFBRTtZQUN2QixhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVE7aUJBQ3hCLFNBQVMsQ0FBQyxVQUFDLEtBQVU7Z0JBQ2xCLElBQUksS0FBSyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDdEQsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6QztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsT0FBTztnQkFDSCxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sK0JBQU8sR0FBZDtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0FBQyxBQXBFRCxJQW9FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgaXNPYmplY3QsIG5vb3AgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGNsYXNzIEV2ZW50Tm90aWZpZXIge1xuXG4gICAgcHJpdmF0ZSBfc3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgcHJpdmF0ZSBfaXNJbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2V2ZW50c0JlZm9yZUluaXQgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHN0YXJ0ID0gdHJ1ZSkge1xuICAgICAgICBpZiAoc3RhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgZXZlbnQgY2FuIGJlIGZpcmVkLCBidXQgd2lsbCBiZSBzZW50IHRvIHN1YnNjcmliZXJzIG9ubHkgYWZ0ZXIgZXhjaGFuZ2UgaXMgc3RhcnRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIHB1YmxpYyBub3RpZnkoZXZlbnROYW1lOiBzdHJpbmcsIC4uLmRhdGE6IEFycmF5PGFueT4pIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3N1YmplY3QubmV4dCh7XG4gICAgICAgICAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzQmVmb3JlSW5pdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzdGFydHMgdGhlIGV4Y2hhbmdlIGFuZCBzZW5kIHRoZSBwZW5kaW5nIGV2ZW50cyB0byBzdWJzY3JpYmVycy5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHNCZWZvcmVJbml0LmZvckVhY2goKGV2ZW50KSA9PiB0aGlzLl9zdWJqZWN0Lm5leHQoZXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVwb24gc3Vic2NyaXB0aW9uLCBtZXRob2QgdG8gY2FuY2VsIHN1YnNjcmlwdGlvbiBpcyByZXR1cm5lZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0geyhkYXRhOiBhbnkpID0+IHZvaWR9IGNhbGxiYWNrXG4gICAgICogQHJldHVybnMgeygpID0+IHZvaWR9XG4gICAgICovXG4gICAgcHVibGljIHN1YnNjcmliZShldmVudE5hbWUsIGNhbGxiYWNrOiAoLi4uZGF0YTogQXJyYXk8YW55PikgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICAgICAgICBsZXQgZXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgaWYgKGV2ZW50TmFtZSAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgZXZlbnRMaXN0ZW5lciA9IHRoaXMuX3N1YmplY3RcbiAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudCAmJiBpc09iamVjdChldmVudCkgJiYgZXZlbnQubmFtZSA9PT0gZXZlbnROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh1bmRlZmluZWQsIGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50TGlzdGVuZXIudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3N1YmplY3QuY29tcGxldGUoKTtcbiAgICB9XG59XG4iXX0=