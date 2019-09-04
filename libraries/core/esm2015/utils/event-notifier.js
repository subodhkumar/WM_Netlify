import { Subject } from 'rxjs';
import { isObject, noop } from './utils';
export class EventNotifier {
    constructor(start = true) {
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
    notify(eventName, ...data) {
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
    }
    /**
     * starts the exchange and send the pending events to subscribers.
     */
    start() {
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._eventsBeforeInit.forEach((event) => this._subject.next(event));
        }
    }
    /**
     * upon subscription, method to cancel subscription is returned.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {() => void}
     */
    subscribe(eventName, callback) {
        let eventListener;
        if (eventName && callback) {
            eventListener = this._subject
                .subscribe((event) => {
                if (event && isObject(event) && event.name === eventName) {
                    callback.apply(undefined, event.data);
                }
            });
            return () => {
                eventListener.unsubscribe();
            };
        }
        return noop;
    }
    destroy() {
        this._subject.complete();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbm90aWZpZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL2V2ZW50LW5vdGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFekMsTUFBTSxPQUFPLGFBQWE7SUFNdEIsWUFBWSxLQUFLLEdBQUcsSUFBSTtRQUpoQixhQUFRLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN6QixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQUN2QixzQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFHM0IsSUFBSSxLQUFLLEVBQUU7WUFDUCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsU0FBaUIsRUFBRSxHQUFHLElBQWdCO1FBQ2hELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDZixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2dCQUN4QixJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSztRQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDeEU7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksU0FBUyxDQUFDLFNBQVMsRUFBRSxRQUF1QztRQUMvRCxJQUFJLGFBQWEsQ0FBQztRQUNsQixJQUFJLFNBQVMsSUFBSSxRQUFRLEVBQUU7WUFDdkIsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRO2lCQUN4QixTQUFTLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDdEIsSUFBSSxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUN0RCxRQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3pDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDUCxPQUFPLEdBQUcsRUFBRTtnQkFDUixhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sT0FBTztRQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBpc09iamVjdCwgbm9vcCB9IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgY2xhc3MgRXZlbnROb3RpZmllciB7XG5cbiAgICBwcml2YXRlIF9zdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcbiAgICBwcml2YXRlIF9pc0luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfZXZlbnRzQmVmb3JlSW5pdCA9IFtdO1xuXG4gICAgY29uc3RydWN0b3Ioc3RhcnQgPSB0cnVlKSB7XG4gICAgICAgIGlmIChzdGFydCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBldmVudCBjYW4gYmUgZmlyZWQsIGJ1dCB3aWxsIGJlIHNlbnQgdG8gc3Vic2NyaWJlcnMgb25seSBhZnRlciBleGNoYW5nZSBpcyBzdGFydGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICovXG4gICAgcHVibGljIG5vdGlmeShldmVudE5hbWU6IHN0cmluZywgLi4uZGF0YTogQXJyYXk8YW55Pikge1xuICAgICAgICBpZiAodGhpcy5faXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhpcy5fc3ViamVjdC5uZXh0KHtcbiAgICAgICAgICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudHNCZWZvcmVJbml0LnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHN0YXJ0cyB0aGUgZXhjaGFuZ2UgYW5kIHNlbmQgdGhlIHBlbmRpbmcgZXZlbnRzIHRvIHN1YnNjcmliZXJzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aGlzLl9pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50c0JlZm9yZUluaXQuZm9yRWFjaCgoZXZlbnQpID0+IHRoaXMuX3N1YmplY3QubmV4dChldmVudCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdXBvbiBzdWJzY3JpcHRpb24sIG1ldGhvZCB0byBjYW5jZWwgc3Vic2NyaXB0aW9uIGlzIHJldHVybmVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZVxuICAgICAqIEBwYXJhbSB7KGRhdGE6IGFueSkgPT4gdm9pZH0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7KCkgPT4gdm9pZH1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3Vic2NyaWJlKGV2ZW50TmFtZSwgY2FsbGJhY2s6ICguLi5kYXRhOiBBcnJheTxhbnk+KSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIGxldCBldmVudExpc3RlbmVyO1xuICAgICAgICBpZiAoZXZlbnROYW1lICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBldmVudExpc3RlbmVyID0gdGhpcy5fc3ViamVjdFxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50ICYmIGlzT2JqZWN0KGV2ZW50KSAmJiBldmVudC5uYW1lID09PSBldmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHVuZGVmaW5lZCwgZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lci51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fc3ViamVjdC5jb21wbGV0ZSgpO1xuICAgIH1cbn1cbiJdfQ==