import { Directive, Input } from '@angular/core';
import { provideAsWidgetRef } from '@wm/components';
export class MediaListItemDirective {
    set wmMediaListItem(val) {
        this.item = val;
    }
}
MediaListItemDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmMediaListItem]',
                providers: [
                    provideAsWidgetRef(MediaListItemDirective)
                ]
            },] }
];
MediaListItemDirective.propDecorators = {
    wmMediaListItem: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC1pdGVtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvbWVkaWEtbGlzdC9tZWRpYS1saXN0LWl0ZW0vbWVkaWEtbGlzdC1pdGVtLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVFwRCxNQUFNLE9BQU8sc0JBQXNCO0lBSy9CLElBQWEsZUFBZSxDQUFDLEdBQUc7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDcEIsQ0FBQzs7O1lBYkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQztpQkFDN0M7YUFDSjs7OzhCQU1JLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21NZWRpYUxpc3RJdGVtXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihNZWRpYUxpc3RJdGVtRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgTWVkaWFMaXN0SXRlbURpcmVjdGl2ZSB7XG5cbiAgICBwdWJsaWMgaW5kZXg7XG4gICAgcHVibGljIGl0ZW07XG5cbiAgICBASW5wdXQoKSBzZXQgd21NZWRpYUxpc3RJdGVtKHZhbCkge1xuICAgICAgICB0aGlzLml0ZW0gPSB2YWw7XG4gICAgfVxufVxuIl19