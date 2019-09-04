import { Directive, ElementRef, Injector } from '@angular/core';
import { SearchComponent } from './search.component';
var ScrollableDirective = /** @class */ (function () {
    function ScrollableDirective(inj, searchRef) {
        this.searchRef = searchRef;
        this.elementRef = inj.get(ElementRef);
    }
    ScrollableDirective.prototype.ngAfterContentInit = function () {
        // add the scroll event listener on the ul element.
        this.elementRef.nativeElement.addEventListener('scroll', this.notifyParent.bind(this));
        this.searchRef.dropdownEl = $(this.elementRef.nativeElement);
        this.searchRef.onDropdownOpen();
    };
    ScrollableDirective.prototype.ngAfterViewInit = function () {
        // assigning width for the dropdown.
        var typeAheadInput = this.searchRef.$element.find('input:first');
        this.searchRef.dropdownEl.width(typeAheadInput.outerWidth());
    };
    ScrollableDirective.prototype.notifyParent = function (evt) {
        this.searchRef.onScroll(this.elementRef.nativeElement, evt);
    };
    ScrollableDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[scrollable]'
                },] }
    ];
    /** @nocollapse */
    ScrollableDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: SearchComponent }
    ]; };
    return ScrollableDirective;
}());
export { ScrollableDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3NlYXJjaC9zY3JvbGxhYmxlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQW1DLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWpHLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUlyRDtJQU1JLDZCQUFZLEdBQWEsRUFBVSxTQUEwQjtRQUExQixjQUFTLEdBQVQsU0FBUyxDQUFpQjtRQUN6RCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELGdEQUFrQixHQUFsQjtRQUNJLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2RixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsU0FBaUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM3QyxDQUFDO0lBRUQsNkNBQWUsR0FBZjtRQUNJLG9DQUFvQztRQUNwQyxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFTywwQ0FBWSxHQUFwQixVQUFxQixHQUFVO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7O2dCQXpCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGNBQWM7aUJBQzNCOzs7O2dCQVJnRSxRQUFRO2dCQUVoRSxlQUFlOztJQThCeEIsMEJBQUM7Q0FBQSxBQTFCRCxJQTBCQztTQXZCWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0LCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFNlYXJjaENvbXBvbmVudCB9IGZyb20gJy4vc2VhcmNoLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbc2Nyb2xsYWJsZV0nXG59KVxuZXhwb3J0IGNsYXNzIFNjcm9sbGFibGVEaXJlY3RpdmUgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIHNlYXJjaFJlZjogU2VhcmNoQ29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFJlZiA9IGluai5nZXQoRWxlbWVudFJlZik7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICAvLyBhZGQgdGhlIHNjcm9sbCBldmVudCBsaXN0ZW5lciBvbiB0aGUgdWwgZWxlbWVudC5cbiAgICAgICAgdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5ub3RpZnlQYXJlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc2VhcmNoUmVmLmRyb3Bkb3duRWwgPSAkKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgKHRoaXMuc2VhcmNoUmVmIGFzIGFueSkub25Ecm9wZG93bk9wZW4oKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIC8vIGFzc2lnbmluZyB3aWR0aCBmb3IgdGhlIGRyb3Bkb3duLlxuICAgICAgICBjb25zdCB0eXBlQWhlYWRJbnB1dCA9IHRoaXMuc2VhcmNoUmVmLiRlbGVtZW50LmZpbmQoJ2lucHV0OmZpcnN0Jyk7XG4gICAgICAgIHRoaXMuc2VhcmNoUmVmLmRyb3Bkb3duRWwud2lkdGgodHlwZUFoZWFkSW5wdXQub3V0ZXJXaWR0aCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG5vdGlmeVBhcmVudChldnQ6IEV2ZW50KSB7XG4gICAgICAgIHRoaXMuc2VhcmNoUmVmLm9uU2Nyb2xsKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBldnQpO1xuICAgIH1cbn1cbiJdfQ==