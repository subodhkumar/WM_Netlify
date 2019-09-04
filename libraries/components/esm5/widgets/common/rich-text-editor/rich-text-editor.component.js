import * as tslib_1 from "tslib";
import { Component, Injector, NgZone, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './rich-text-editor.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
var WIDGET_INFO = { widgetType: 'wm-richtexteditor', hostClass: 'app-richtexteditor clearfix' };
var getChangeEvt = function () {
    var changeEvt;
    // for IE the event constructor doesn't work so use the createEvent proto
    if (typeof (Event) === 'function') {
        changeEvt = new Event('change');
    }
    else {
        changeEvt = document.createEvent('Event');
        changeEvt.initEvent('change', true, true);
    }
    return changeEvt;
};
var ɵ0 = getChangeEvt;
// override summernote methods
var origFn = $.summernote.ui.button.bind($.summernote);
$.summernote.ui.button = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var retVal = origFn.apply(void 0, tslib_1.__spread(args));
    var origCallback = retVal.callback;
    retVal.callback = function ($node, options) {
        // add bs3 btn class to the buttons
        $node.addClass('btn');
        return origCallback($node, options);
    };
    return retVal;
};
//
var RichTextEditorComponent = /** @class */ (function (_super) {
    tslib_1.__extends(RichTextEditorComponent, _super);
    function RichTextEditorComponent(inj, domSanitizer, ngZone) {
        var _this = _super.call(this, inj, WIDGET_INFO) || this;
        _this.domSanitizer = domSanitizer;
        _this.ngZone = ngZone;
        _this._operationStack = [];
        _this.isEditorLoaded = false;
        _this.EDITOR_DEFAULT_OPTIONS = {
            toolbar: [
                // [groupName, [list of button]]
                ['misc', ['undo', 'redo']],
                ['style', ['style']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['height', ['height']],
                ['style', ['bold', 'italic', 'underline', 'clear']],
                ['font', ['strikethrough', 'superscript', 'subscript']],
                ['color', ['color']],
                ['insert', ['table', 'picture', 'link', 'video', 'hr']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['misc', ['codeview', 'fullscreen', 'help']]
            ],
            callbacks: {
                onInit: function () {
                    _this.isEditorLoaded = true;
                    if (_this._operationStack.length) {
                        _this._operationStack.forEach(function (operationParam) {
                            var key = Array.from(operationParam.keys())[0], val = operationParam.get(key);
                            _this.performEditorOperation(key, val);
                        });
                        _this._operationStack = [];
                    }
                },
                onChange: function (contents, editable) {
                    _this.proxyModel = _this.domSanitizer.sanitize(SecurityContext.HTML, contents.toString());
                    _this.invokeOnChange(contents, getChangeEvt(), true);
                    _this.invokeOnTouched();
                }
            },
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'],
            placeholder: '',
            height: 100,
            disableResizeEditor: true
        };
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER, ['height']);
        return _this;
    }
    Object.defineProperty(RichTextEditorComponent.prototype, "htmlcontent", {
        get: function () {
            return this.performEditorOperation('code');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RichTextEditorComponent.prototype, "datavalue", {
        get: function () {
            return this.htmlcontent;
        },
        set: function (nv) {
            if (nv !== undefined && nv !== null) {
                this.$hiddenInputEle.val(nv);
                this.performEditorOperation('reset');
                this.performEditorOperation('insertText', nv);
            }
        },
        enumerable: true,
        configurable: true
    });
    RichTextEditorComponent.prototype.ngOnInit = function () {
        this.$richTextEditor = $(this.nativeElement.querySelector('[richTextEditor]'));
        this.$hiddenInputEle = $(this.nativeElement.querySelector('input.model-holder'));
        _super.prototype.ngOnInit.call(this);
        this.initEditor();
    };
    RichTextEditorComponent.prototype.initEditor = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            _this.$richTextEditor.summernote(_this.EDITOR_DEFAULT_OPTIONS);
        });
    };
    RichTextEditorComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'placeholder') {
            this.EDITOR_DEFAULT_OPTIONS.placeholder = nv;
            this.performEditorOperation({
                placeholder: nv
            });
        }
        else if (key === 'disabled' || key === 'readonly') {
            this.performEditorOperation(nv ? 'disable' : 'enable');
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    RichTextEditorComponent.prototype.onStyleChange = function (key, nv, ov) {
        if (key === 'height') {
            this.EDITOR_DEFAULT_OPTIONS.height = nv;
            this.performEditorOperation({
                height: nv
            });
        }
    };
    RichTextEditorComponent.prototype.performEditorOperation = function (key, value) {
        if (this.isEditorLoaded) {
            return this.$richTextEditor.summernote(key, value);
        }
        else {
            var op = new Map();
            op.set(key, value);
            this._operationStack.push(op);
            return;
        }
    };
    RichTextEditorComponent.prototype.getCurrentPosition = function () {
        return this.performEditorOperation('createRange');
    };
    RichTextEditorComponent.prototype.undo = function () {
        this.performEditorOperation('undo');
    };
    RichTextEditorComponent.prototype.focus = function () {
        this.performEditorOperation('focus');
    };
    RichTextEditorComponent.prototype.ngOnDestroy = function () {
        this.performEditorOperation('destroy');
        _super.prototype.ngOnDestroy.call(this);
    };
    RichTextEditorComponent.initializeProps = registerProps();
    RichTextEditorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmRichTextEditor]',
                    template: "<div richTextEditor></div>\n<div [innerHTML]=\"proxyModel\" class=\"ta-preview\" *ngIf=\"showpreview\"></div>\n<input class=\"model-holder\" [disabled]=\"disabled\" hidden>\n",
                    providers: [
                        provideAsNgValueAccessor(RichTextEditorComponent),
                        provideAsWidgetRef(RichTextEditorComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    RichTextEditorComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: DomSanitizer },
        { type: NgZone }
    ]; };
    return RichTextEditorComponent;
}(BaseFormCustomComponent));
export { RichTextEditorComponent };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmljaC10ZXh0LWVkaXRvci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JpY2gtdGV4dC1lZGl0b3IvcmljaC10ZXh0LWVkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBcUIsZUFBZSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMzRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3pELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTdFLElBQU0sV0FBVyxHQUFHLEVBQUMsVUFBVSxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSw2QkFBNkIsRUFBQyxDQUFDO0FBRWhHLElBQU0sWUFBWSxHQUFHO0lBQ2pCLElBQUksU0FBUyxDQUFDO0lBQ2QseUVBQXlFO0lBQ3pFLElBQUksT0FBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLFVBQVUsRUFBRTtRQUM5QixTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDbkM7U0FBTTtRQUNILFNBQVMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM3QztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUMsQ0FBQzs7QUFLRiw4QkFBOEI7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QkFDOUM7aUJBQ0o7Ozs7Z0JBbERtQixRQUFRO2dCQUNuQixZQUFZO2dCQURTLE1BQU07O0lBMkxwQyw4QkFBQztDQUFBLEFBaEpELENBUTZDLHVCQUF1QixHQXdJbkU7U0F4SVksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3RvciwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2VjdXJpdHlDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0IHsgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcmljaC10ZXh0LWVkaXRvci5wcm9wcyc7XG5pbXBvcnQgeyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvYmFzZS1mb3JtLWN1c3RvbS5jb21wb25lbnQnO1xuXG5jb25zdCBXSURHRVRfSU5GTyA9IHt3aWRnZXRUeXBlOiAnd20tcmljaHRleHRlZGl0b3InLCBob3N0Q2xhc3M6ICdhcHAtcmljaHRleHRlZGl0b3IgY2xlYXJmaXgnfTtcblxuY29uc3QgZ2V0Q2hhbmdlRXZ0ID0gKCkgPT4ge1xuICAgIGxldCBjaGFuZ2VFdnQ7XG4gICAgLy8gZm9yIElFIHRoZSBldmVudCBjb25zdHJ1Y3RvciBkb2Vzbid0IHdvcmsgc28gdXNlIHRoZSBjcmVhdGVFdmVudCBwcm90b1xuICAgIGlmICh0eXBlb2YoRXZlbnQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNoYW5nZUV2dCA9IG5ldyBFdmVudCgnY2hhbmdlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlRXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgIGNoYW5nZUV2dC5pbml0RXZlbnQoJ2NoYW5nZScsIHRydWUsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlRXZ0O1xufTtcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5cbi8vIG92ZXJyaWRlIHN1bW1lcm5vdGUgbWV0aG9kc1xuXG5jb25zdCBvcmlnRm4gPSAkLnN1bW1lcm5vdGUudWkuYnV0dG9uLmJpbmQoJC5zdW1tZXJub3RlKTtcblxuJC5zdW1tZXJub3RlLnVpLmJ1dHRvbiA9ICguLi5hcmdzKSA9PiB7XG5cbiAgICBjb25zdCByZXRWYWwgPSBvcmlnRm4oLi4uYXJncyk7XG4gICAgY29uc3Qgb3JpZ0NhbGxiYWNrID0gcmV0VmFsLmNhbGxiYWNrO1xuXG4gICAgcmV0VmFsLmNhbGxiYWNrID0gKCRub2RlLCBvcHRpb25zKSA9PiB7XG4gICAgICAgIC8vIGFkZCBiczMgYnRuIGNsYXNzIHRvIHRoZSBidXR0b25zXG4gICAgICAgICRub2RlLmFkZENsYXNzKCdidG4nKTtcbiAgICAgICAgcmV0dXJuIG9yaWdDYWxsYmFjaygkbm9kZSwgb3B0aW9ucyk7XG4gICAgfTtcbiAgICByZXR1cm4gcmV0VmFsO1xufTtcbi8vXG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtUmljaFRleHRFZGl0b3JdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcmljaC10ZXh0LWVkaXRvci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihSaWNoVGV4dEVkaXRvckNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihSaWNoVGV4dEVkaXRvckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFJpY2hUZXh0RWRpdG9yQ29tcG9uZW50IGV4dGVuZHMgQmFzZUZvcm1DdXN0b21Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgICRyaWNoVGV4dEVkaXRvcjtcbiAgICAkaGlkZGVuSW5wdXRFbGU7XG5cbiAgICBwcm94eU1vZGVsO1xuICAgIF9vcGVyYXRpb25TdGFjayA9IFtdO1xuICAgIGlzRWRpdG9yTG9hZGVkID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgc2hvd3ByZXZpZXc6IGFueTtcbiAgICBwdWJsaWMgZGlzYWJsZWQ6IGJvb2xlYW47XG5cbiAgICBFRElUT1JfREVGQVVMVF9PUFRJT05TID0ge1xuICAgICAgICB0b29sYmFyOiBbXG4gICAgICAgICAgICAvLyBbZ3JvdXBOYW1lLCBbbGlzdCBvZiBidXR0b25dXVxuICAgICAgICAgICAgWydtaXNjJywgWyd1bmRvJywgJ3JlZG8nXV0sXG4gICAgICAgICAgICBbJ3N0eWxlJywgWydzdHlsZSddXSxcbiAgICAgICAgICAgIFsnZm9udG5hbWUnLCBbJ2ZvbnRuYW1lJ11dLFxuICAgICAgICAgICAgWydmb250c2l6ZScsIFsnZm9udHNpemUnXV0sXG4gICAgICAgICAgICBbJ2hlaWdodCcsIFsnaGVpZ2h0J11dLFxuICAgICAgICAgICAgWydzdHlsZScsIFsnYm9sZCcsICdpdGFsaWMnLCAndW5kZXJsaW5lJywgJ2NsZWFyJ11dLFxuICAgICAgICAgICAgWydmb250JywgWydzdHJpa2V0aHJvdWdoJywgJ3N1cGVyc2NyaXB0JywgJ3N1YnNjcmlwdCddXSxcbiAgICAgICAgICAgIFsnY29sb3InLCBbJ2NvbG9yJ11dLFxuICAgICAgICAgICAgWydpbnNlcnQnLCBbJ3RhYmxlJywgJ3BpY3R1cmUnLCAnbGluaycsICd2aWRlbycsICdociddXSxcbiAgICAgICAgICAgIFsncGFyYScsIFsndWwnLCAnb2wnLCAncGFyYWdyYXBoJ11dLFxuICAgICAgICAgICAgWydtaXNjJywgWydjb2RldmlldycsICdmdWxsc2NyZWVuJywgJ2hlbHAnXV1cbiAgICAgICAgXSxcbiAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICBvbkluaXQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRWRpdG9yTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb3BlcmF0aW9uU3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29wZXJhdGlvblN0YWNrLmZvckVhY2gob3BlcmF0aW9uUGFyYW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gQXJyYXkuZnJvbShvcGVyYXRpb25QYXJhbS5rZXlzKCkpWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IG9wZXJhdGlvblBhcmFtLmdldChrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKGtleSwgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29wZXJhdGlvblN0YWNrID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAoY29udGVudHMsIGVkaXRhYmxlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm94eU1vZGVsID0gdGhpcy5kb21TYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LkhUTUwsIGNvbnRlbnRzLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlT25DaGFuZ2UoY29udGVudHMsIGdldENoYW5nZUV2dCgpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZU9uVG91Y2hlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmb250TmFtZXM6IFsnQXJpYWwnLCAnQXJpYWwgQmxhY2snLCAnQ29taWMgU2FucyBNUycsICdDb3VyaWVyIE5ldycsICdNZXJyaXdlYXRoZXInXSxcbiAgICAgICAgcGxhY2Vob2xkZXI6ICcnLFxuICAgICAgICBoZWlnaHQ6IDEwMCxcbiAgICAgICAgZGlzYWJsZVJlc2l6ZUVkaXRvcjogdHJ1ZVxuICAgIH07XG5cbiAgICBnZXQgaHRtbGNvbnRlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBlcmZvcm1FZGl0b3JPcGVyYXRpb24oJ2NvZGUnKTtcbiAgICB9XG5cbiAgICBnZXQgZGF0YXZhbHVlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5odG1sY29udGVudDtcbiAgICB9XG5cbiAgICBzZXQgZGF0YXZhbHVlKG52KSB7XG4gICAgICAgIGlmIChudiAhPT0gdW5kZWZpbmVkICYmIG52ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLiRoaWRkZW5JbnB1dEVsZS52YWwobnYpO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKCdyZXNldCcpO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKCdpbnNlcnRUZXh0JywgbnYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBkb21TYW5pdGl6ZXI6IERvbVNhbml0aXplciwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9JTkZPKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSLCBbJ2hlaWdodCddKTtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy4kcmljaFRleHRFZGl0b3IgPSAkKHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbcmljaFRleHRFZGl0b3JdJykpO1xuICAgICAgICB0aGlzLiRoaWRkZW5JbnB1dEVsZSA9ICQodGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Lm1vZGVsLWhvbGRlcicpKTtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5pbml0RWRpdG9yKCk7XG4gICAgfVxuXG4gICAgaW5pdEVkaXRvcigpIHtcbiAgICAgICAgdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy4kcmljaFRleHRFZGl0b3Iuc3VtbWVybm90ZSh0aGlzLkVESVRPUl9ERUZBVUxUX09QVElPTlMpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdwbGFjZWhvbGRlcicpIHtcbiAgICAgICAgICAgIHRoaXMuRURJVE9SX0RFRkFVTFRfT1BUSU9OUy5wbGFjZWhvbGRlciA9IG52O1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogbnZcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2Rpc2FibGVkJyB8fCBrZXkgPT09ICdyZWFkb25seScpIHtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybUVkaXRvck9wZXJhdGlvbihudiA/ICdkaXNhYmxlJyA6ICdlbmFibGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICBpZiAoa2V5ID09PSAnaGVpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5FRElUT1JfREVGQVVMVF9PUFRJT05TLmhlaWdodCA9IG52O1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IG52XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBlcmZvcm1FZGl0b3JPcGVyYXRpb24oa2V5LCB2YWx1ZT8pIHtcbiAgICAgICAgaWYgKHRoaXMuaXNFZGl0b3JMb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRyaWNoVGV4dEVkaXRvci5zdW1tZXJub3RlKGtleSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgb3A6IGFueSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIG9wLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX29wZXJhdGlvblN0YWNrLnB1c2gob3ApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0Q3VycmVudFBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wZXJmb3JtRWRpdG9yT3BlcmF0aW9uKCdjcmVhdGVSYW5nZScpO1xuICAgIH1cblxuICAgIHVuZG8oKSB7XG4gICAgICAgIHRoaXMucGVyZm9ybUVkaXRvck9wZXJhdGlvbigndW5kbycpO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLnBlcmZvcm1FZGl0b3JPcGVyYXRpb24oJ2ZvY3VzJyk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMucGVyZm9ybUVkaXRvck9wZXJhdGlvbignZGVzdHJveScpO1xuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cbn1cbiJdfQ==