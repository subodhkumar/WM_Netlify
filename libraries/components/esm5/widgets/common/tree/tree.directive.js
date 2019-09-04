import * as tslib_1 from "tslib";
import { Attribute, Directive, Injector } from '@angular/core';
import { $appDigest, $parseEvent, $parseExpr, getClonedObject } from '@wm/core';
import { registerProps } from './tree.props';
import { getEvaluatedData, provideAsWidgetRef } from '../../../utils/widget-utils';
import { getOrderedDataset } from '../../../utils/form-utils';
import { StylableComponent } from '../base/stylable.component';
var defaultTreeIconClass = 'plus-minus';
var ICON_CLASSES = {
    'folder': {
        'expanded': 'wi-folder-open',
        'collapsed': 'wi-folder'
    },
    'circle-plus-minus': {
        'expanded': 'wi-remove-circle-outline',
        'collapsed': 'wi-add-circle-outline'
    },
    'chevron': {
        'expanded': 'wi-keyboard-arrow-down',
        'collapsed': 'wi-keyboard-arrow-right'
    },
    'menu': {
        'expanded': 'wi-arrow-down',
        'collapsed': 'wi-arrow-right'
    },
    'triangle': {
        'expanded': 'wi-arrow-drop-down-circle',
        'collapsed': 'wi-play-circle-filled'
    },
    'expand-collapse': {
        'expanded': 'wi-expand-less',
        'collapsed': 'wi-expand-more'
    },
    'plus-minus': {
        'expanded': 'wi-minus',
        'collapsed': 'wi-plus'
    }
};
var WIDGET_INFO = { widgetType: 'wm-tree', hostClass: 'app-tree' };
var TreeDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TreeDirective, _super);
    function TreeDirective(inj, binddatavalue, bindnodelabel, bindnodeicon, bindnodechildren, bindnodeid) {
        var _this = _super.call(this, inj, WIDGET_INFO) || this;
        _this.binddatavalue = binddatavalue;
        _this.bindnodelabel = bindnodelabel;
        _this.bindnodeicon = bindnodeicon;
        _this.bindnodechildren = bindnodechildren;
        _this.bindnodeid = bindnodeid;
        _this.bindEvents();
        return _this;
    }
    TreeDirective.prototype.onPropertyChange = function (key, nv, ov) {
        switch (key) {
            case 'dataset':
                this.nodes = this.getNodes(nv);
                this._selectNode = undefined;
                this.renderTree();
                break;
            case 'nodeicon':
            case 'nodelabel':
            case 'nodechildren':
            case 'orderby':
                this.renderTree();
                break;
            case 'treeicons':
                this.changeTreeIcons(nv, ov);
                break;
            case 'datavalue':
                this.selectById(nv);
                break;
            default:
                _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    TreeDirective.prototype.constructNodes = function (nodes, parent, levels, deep, _evalDataValue) {
        var _this = this;
        var $ul = $('<ul></ul>');
        var _iconClses = ICON_CLASSES[this.treeicons || defaultTreeIconClass];
        var _expr = (this.binddatavalue || this.datavalue);
        var _iconCls, _cls;
        _cls = levels > 0 ? ' expanded ' : ' collapsed ';
        _iconCls = _cls + (levels > 0 ? _iconClses.expanded : _iconClses.collapsed);
        deep = deep || 0;
        parent.append($ul);
        nodes.forEach(function (node, idx) {
            var $li = $('<li></li>'), $iconNode = $('<i></i>'), nodeLabel = getEvaluatedData(node, { expression: _this.nodelabel, bindExpression: _this.bindnodelabel }, _this.viewParent) || node.label, nodeIcon = getEvaluatedData(node, { expression: _this.nodeicon, bindExpression: _this.bindnodeicon }, _this.viewParent) || node.icon, nodeChildren = getEvaluatedData(node, { expression: _this.nodechildren, bindExpression: _this.bindnodechildren }, _this.viewParent) || node.children, nodeIdValue = getEvaluatedData(node, { expression: _this.nodeid, bindExpression: _this.bindnodeid }, _this.viewParent) || node.children;
            var isNodeMatched = false, expandCollapseIcon;
            $li.data('nodedata', node)
                .append($iconNode)
                .append("<span class=\"title\">" + nodeLabel + "</span>")
                .appendTo($ul);
            // if datavalue(ie, expr) is provided select the tree node accordingly
            // if datavalue === 'FirstNode' -- select the FirstNode at level 0
            // if datavalue === 'LastNode' -- select the LastNode at level 0
            // if datavalue is a bind expression evaluate the expression for each node of the tree till the condition is satisfied.
            // if node identifier is present then verify the datavalue is bound expr or static value and compare with the node model
            if (_this.bindnodeid || _this.nodeid) {
                isNodeMatched = _this.binddatavalue ? nodeIdValue === _evalDataValue : nodeIdValue === _expr;
                if (nodeIdValue) {
                    $li.attr('id', nodeIdValue);
                }
            }
            else if (_this.binddatavalue) { // evaluate the expression only if it is bound (useExpression)
                isNodeMatched = !!$parseExpr(_expr)(_this, node);
            }
            // Perform LastNode check only at level 0.(ie, deep = 0);
            if (!_this._selectNode) {
                if ((_expr === 'FirstNode' && idx === 0)
                    || (!deep && _expr === 'LastNode' && idx === nodes.length - 1)
                    || isNodeMatched) {
                    // save a reference of the node to be selected in `_selectNode`
                    _this._selectNode = $li;
                    _this.datavalue = nodeIdValue;
                }
            }
            if (nodeIcon) {
                $iconNode.addClass(nodeIcon);
            }
            if (nodeChildren && nodeChildren.length) { // parent node
                $li.addClass("parent-node " + _cls);
                expandCollapseIcon = $("<i class=\"wi " + _iconCls + "\"></i>");
                if (nodeIcon) {
                    $iconNode.addClass(nodeIcon);
                }
                $li.prepend(expandCollapseIcon);
                _this.constructNodes(nodeChildren, $li, levels - 1, deep + 1, _evalDataValue);
            }
            else {
                if (!nodeIcon) {
                    $iconNode.addClass('leaf-node');
                }
                $li.addClass('leaf-node');
            }
        });
    };
    TreeDirective.prototype.getNodesFromString = function (value) {
        return value.split(',').map(function (item) {
            return {
                'label': item && item.trim()
            };
        });
    };
    TreeDirective.prototype.getNodes = function (newVal) {
        var nodes;
        if (_.isString(newVal) && !_.isEmpty(newVal)) {
            newVal = newVal.trim();
            if (newVal) {
                nodes = this.getNodesFromString(newVal);
            }
        }
        else if (_.isArray(newVal)) {
            newVal = getOrderedDataset(newVal, this.orderby);
            nodes = newVal;
        }
        else if (_.isObject(newVal)) {
            nodes = [newVal];
        }
        return nodes;
    };
    TreeDirective.prototype.changeTreeIcons = function (nv, ov) {
        var $el = $(this.nativeElement);
        nv = nv || defaultTreeIconClass;
        ov = ov || defaultTreeIconClass;
        $el.find('i.expanded').removeClass(ICON_CLASSES[ov].expanded).addClass(ICON_CLASSES[nv].expanded);
        $el.find('i.collapsed').removeClass(ICON_CLASSES[ov].collapsed).addClass(ICON_CLASSES[nv].collapsed);
    };
    TreeDirective.prototype.toggleExpandCollapseNode = function ($event, $i, $li) {
        var treeIcons = ICON_CLASSES[this.treeicons || defaultTreeIconClass], eventParams = {
            '$event': $event
        };
        if ($i.hasClass('collapsed')) {
            $i.removeClass("collapsed " + treeIcons.collapsed).addClass("expanded " + treeIcons.expanded);
            $li.removeClass('collapsed').addClass('expanded');
            this.invokeEventCallback('expand', eventParams);
        }
        else if ($i.hasClass('expanded')) {
            $i.removeClass("expanded " + treeIcons.expanded).addClass("collapsed " + treeIcons.collapsed);
            $li.removeClass('expanded').addClass('collapsed');
            this.invokeEventCallback('collapse', eventParams);
        }
    };
    TreeDirective.prototype.renderTree = function (forceRender) {
        var _this = this;
        var docFrag, $li, $liPath, data, path = '';
        var levels = +this.nativeElement.getAttribute('levels') || 0, $el = $(this.nativeElement);
        $el.empty();
        if (forceRender) {
            this._selectNode = undefined;
        }
        if (this.nodes && this.nodes.length) {
            docFrag = document.createDocumentFragment();
            this.constructNodes(this.nodes, $(docFrag), levels, 0, this.datavalue);
            $el.append(docFrag);
        }
        if (this._selectNode) {
            $li = this._selectNode;
            $li.addClass('selected');
            data = $li.data('nodedata');
            $liPath = $li.parentsUntil($el, 'li.parent-node.collapsed');
            if (!$liPath.length) {
                $liPath = $li;
            }
            $liPath
                .each(function () {
                var $current = $(_this), $i = $current.children('i.collapsed'), $title = $current.children('.title');
                _this.toggleExpandCollapseNode(undefined, $i, $current);
                path = "/" + ($title.text() + path);
            });
            this.selecteditem = getClonedObject(data) || {};
            this.selecteditem.path = path;
            this.invokeEventCallback('select', { $event: undefined, $item: data, $path: path });
            $appDigest();
        }
    };
    TreeDirective.prototype.selectNode = function (evt, value) {
        var _this = this;
        var target = evt && $(evt.target), $el = $(this.nativeElement), $li = _.isObject(value) ? value : $el.find("li[id=\"" + value + "\"]:first");
        var data, path = '', $liPath, nodeAction;
        $el.find('.selected').removeClass('selected');
        if (!$li.length) {
            return;
        }
        $li.addClass('selected');
        data = $li.data('nodedata');
        nodeAction = data[this.nodeaction || 'action'];
        // if the selectNode is initiated by click event then use the nativeElement target from event
        $liPath = target ? target.parents('.app-tree li') : $li.find('> span.title').parents('.app-tree li');
        // construct the path of the node
        $liPath
            .each(function (i, el) {
            var current = $(el).children('.title').text();
            path = "/" + (current + path);
        });
        // expand the current node till the viewParent level which is collapsed
        $li.parentsUntil($el, 'li.parent-node.collapsed')
            .each(function (index, el) {
            var $current = $(el), $i = $current.children('i.collapsed');
            _this.toggleExpandCollapseNode(undefined, $i, $current);
        });
        this.selecteditem = getClonedObject(data) || {};
        this.selecteditem.path = path;
        if (target) {
            if (this.nodeid) {
                this.datavalue = $parseExpr(this.nodeid)(this, data);
            }
            else if (this.bindnodeid) {
                this.datavalue = getEvaluatedData(data, { expression: this.nodeid, bindExpression: this.bindnodeid }, this.viewParent);
            }
            else {
                this.datavalue = getClonedObject(data) || {};
            }
        }
        if (nodeAction) {
            $parseEvent(nodeAction)(this);
        }
        this.invokeEventCallback('select', { $event: evt, $item: data, $path: path });
        $appDigest();
    };
    // click event is added on the host nativeElement
    TreeDirective.prototype.bindEvents = function () {
        var _this = this;
        $(this.nativeElement).on('click', function (evt) {
            var target = $(evt.target), li = target.closest('li'), $i = target.is('i') ? target : target.siblings('i.collapsed,i.expanded');
            evt.stopPropagation();
            if (target.is('span.title')) { // select the node only if it is nodelabel
                _this.selecteditem = {};
                _this.selectNode(evt, li);
            }
            if (target.is('i') || (target.is('span.title') && _this.nodeclick === 'expand')) {
                _this.toggleExpandCollapseNode(evt, $i, li);
            }
        });
    };
    TreeDirective.prototype.selectById = function (value) {
        this.selectNode(undefined, value);
    };
    TreeDirective.prototype.deselectById = function (value) {
        this.selecteditem = {};
        this.selectById();
    };
    TreeDirective.prototype.redraw = function () {
        this.renderTree(true);
    };
    TreeDirective.initializeProps = registerProps();
    TreeDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'div[wmTree]',
                    providers: [
                        provideAsWidgetRef(TreeDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    TreeDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['datavalue.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['nodelabel.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['nodeicon.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['nodechildren.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['nodeid.bind',] }] }
    ]; };
    return TreeDirective;
}(StylableComponent));
export { TreeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3RyZWUvdHJlZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUvRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR2hGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbkYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFHL0QsSUFBTSxvQkFBb0IsR0FBRyxZQUFZLENBQUM7QUFDMUMsSUFBTSxZQUFZLEdBQUc7SUFDakIsUUFBUSxFQUFFO1FBQ04sVUFBVSxFQUFHLGdCQUFnQjtRQUM3QixXQUFXLEVBQUUsV0FBVztLQUMzQjtJQUNELG1CQUFtQixFQUFFO1FBQ2pCLFVBQVUsRUFBRywwQkFBMEI7UUFDdkMsV0FBVyxFQUFFLHVCQUF1QjtLQUN2QztJQUNELFNBQVMsRUFBRTtRQUNQLFVBQVUsRUFBRyx3QkFBd0I7UUFDckMsV0FBVyxFQUFFLHlCQUF5QjtLQUN6QztJQUNELE1BQU0sRUFBRTtRQUNKLFVBQVUsRUFBRyxlQUFlO1FBQzVCLFdBQVcsRUFBRSxnQkFBZ0I7S0FDaEM7SUFDRCxVQUFVLEVBQUU7UUFDUixVQUFVLEVBQUcsMkJBQTJCO1FBQ3hDLFdBQVcsRUFBRSx1QkFBdUI7S0FDdkM7SUFDRCxpQkFBaUIsRUFBRTtRQUNmLFVBQVUsRUFBRyxnQkFBZ0I7UUFDN0Is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QVUsR0FBbEIsVUFBbUIsS0FBTTtRQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ08sb0NBQVksR0FBcEIsVUFBcUIsS0FBTTtRQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUNNLDhCQUFNLEdBQWI7UUFDSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFyVE0sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztxQkFDcEM7aUJBQ0o7Ozs7Z0JBbEQ4QixRQUFRO2dEQXNFOUIsU0FBUyxTQUFDLGdCQUFnQjtnREFDMUIsU0FBUyxTQUFDLGdCQUFnQjtnREFDMUIsU0FBUyxTQUFDLGVBQWU7Z0RBQ3pCLFNBQVMsU0FBQyxtQkFBbUI7Z0RBQzdCLFNBQVMsU0FBQyxhQUFhOztJQWdTaEMsb0JBQUM7Q0FBQSxBQTdURCxDQU1tQyxpQkFBaUIsR0F1VG5EO1NBdlRZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHBhcnNlRXZlbnQsICRwYXJzZUV4cHIsIGdldENsb25lZE9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgSVJlZHJhd2FibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdHJlZS5wcm9wcyc7XG5pbXBvcnQgeyBnZXRFdmFsdWF0ZWREYXRhLCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgZ2V0T3JkZXJlZERhdGFzZXQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5jb25zdCBkZWZhdWx0VHJlZUljb25DbGFzcyA9ICdwbHVzLW1pbnVzJztcbmNvbnN0IElDT05fQ0xBU1NFUyA9IHtcbiAgICAnZm9sZGVyJzoge1xuICAgICAgICAnZXhwYW5kZWQnIDogJ3dpLWZvbGRlci1vcGVuJyxcbiAgICAgICAgJ2NvbGxhcHNlZCc6ICd3aS1mb2xkZXInXG4gICAgfSxcbiAgICAnY2lyY2xlLXBsdXMtbWludXMnOiB7XG4gICAgICAgICdleHBhbmRlZCcgOiAnd2ktcmVtb3ZlLWNpcmNsZS1vdXRsaW5lJyxcbiAgICAgICAgJ2NvbGxhcHNlZCc6ICd3aS1hZGQtY2lyY2xlLW91dGxpbmUnXG4gICAgfSxcbiAgICAnY2hldnJvbic6IHtcbiAgICAgICAgJ2V4cGFuZGVkJyA6ICd3aS1rZXlib2FyZC1hcnJvdy1kb3duJyxcbiAgICAgICAgJ2NvbGxhcHNlZCc6ICd3aS1rZXlib2FyZC1hcnJvdy1yaWdodCdcbiAgICB9LFxuICAgICdtZW51Jzoge1xuICAgICAgICAnZXhwYW5kZWQnIDogJ3dpLWFycm93LWRvd24nLFxuICAgICAgICAnY29sbGFwc2VkJzogJ3dpLWFycm93LXJpZ2h0J1xuICAgIH0sXG4gICAgJ3RyaWFuZ2xlJzoge1xuICAgICAgICAnZXhwYW5kZWQnIDogJ3dpLWFycm93LWRyb3AtZG93bi1jaXJjbGUnLFxuICAgICAgICAnY29sbGFwc2VkJzogJ3dpLXBsYXktY2lyY2xlLWZpbGxlZCdcbiAgICB9LFxuICAgICdleHBhbmQtY29sbGFwc2UnOiB7XG4gICAgICAgICdleHBhbmRlZCcgOiAnd2ktZXhwYW5kLWxlc3MnLFxuICAgICAgICAnY29sbGFwc2VkJzogJ3dpLWV4cGFuZC1tb3JlJ1xuICAgIH0sXG4gICAgJ3BsdXMtbWludXMnOiB7XG4gICAgICAgICdleHBhbmRlZCcgOiAnd2ktbWludXMnLFxuICAgICAgICAnY29sbGFwc2VkJzogJ3dpLXBsdXMnXG4gICAgfVxufTtcblxuY29uc3QgV0lER0VUX0lORk8gPSB7d2lkZ2V0VHlwZTogJ3dtLXRyZWUnLCBob3N0Q2xhc3M6ICdhcHAtdHJlZSd9O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bVRyZWVdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRyZWVEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUcmVlRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHByaXZhdGUgX3NlbGVjdE5vZGU6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgbm9kZXM6IEFycmF5PGFueT47XG5cbiAgICBwdWJsaWMgZGF0YXZhbHVlOiBzdHJpbmc7XG4gICAgcHVibGljIHRyZWVpY29uczogc3RyaW5nO1xuICAgIHB1YmxpYyBzZWxlY3RlZGl0ZW06IGFueTtcbiAgICBwdWJsaWMgbm9kZWlkOiBzdHJpbmc7XG4gICAgcHVibGljIG5vZGVhY3Rpb246IHN0cmluZztcbiAgICBwdWJsaWMgbm9kZWNsaWNrOiBzdHJpbmc7XG4gICAgcHVibGljIG5vZGVsYWJlbDogc3RyaW5nO1xuICAgIHB1YmxpYyBub2RlaWNvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBub2RlY2hpbGRyZW46IHN0cmluZztcbiAgICBwdWJsaWMgb3JkZXJieTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2RhdGF2YWx1ZS5iaW5kJykgcHJpdmF0ZSBiaW5kZGF0YXZhbHVlLFxuICAgICAgICBAQXR0cmlidXRlKCdub2RlbGFiZWwuYmluZCcpIHByaXZhdGUgYmluZG5vZGVsYWJlbCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnbm9kZWljb24uYmluZCcpIHByaXZhdGUgYmluZG5vZGVpY29uLFxuICAgICAgICBAQXR0cmlidXRlKCdub2RlY2hpbGRyZW4uYmluZCcpIHByaXZhdGUgYmluZG5vZGVjaGlsZHJlbixcbiAgICAgICAgQEF0dHJpYnV0ZSgnbm9kZWlkLmJpbmQnKSBwcml2YXRlIGJpbmRub2RlaWRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfSU5GTyk7XG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdkYXRhc2V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5nZXROb2Rlcyhudik7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0Tm9kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRyZWUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vZGVpY29uJzpcbiAgICAgICAgICAgIGNhc2UgJ25vZGVsYWJlbCc6XG4gICAgICAgICAgICBjYXNlICdub2RlY2hpbGRyZW4nOlxuICAgICAgICAgICAgY2FzZSAnb3JkZXJieSc6XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUcmVlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0cmVlaWNvbnMnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlVHJlZUljb25zKG52LCBvdik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkYXRhdmFsdWUnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0QnlJZChudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3ROb2Rlcyhub2RlcywgcGFyZW50LCBsZXZlbHMsIGRlZXAsIF9ldmFsRGF0YVZhbHVlKSB7XG5cbiAgICAgICAgY29uc3QgJHVsID0gJCgnPHVsPjwvdWw+Jyk7XG4gICAgICAgIGNvbnN0IF9pY29uQ2xzZXMgPSBJQ09OX0NMQVNTRVNbdGhpcy50cmVlaWNvbnMgfHwgZGVmYXVsdFRyZWVJY29uQ2xhc3NdO1xuICAgICAgICBjb25zdCBfZXhwciA9ICh0aGlzLmJpbmRkYXRhdmFsdWUgfHwgdGhpcy5kYXRhdmFsdWUpO1xuXG4gICAgICAgIGxldCBfaWNvbkNscywgX2NscztcblxuICAgICAgICBfY2xzICAgICA9IGxldmVscyA+IDAgPyAnIGV4cGFuZGVkICcgOiAnIGNvbGxhcHNlZCAnO1xuICAgICAgICBfaWNvbkNscyA9IF9jbHMgKyAobGV2ZWxzID4gMCA/IF9pY29uQ2xzZXMuZXhwYW5kZWQgOiBfaWNvbkNsc2VzLmNvbGxhcHNlZCk7XG5cbiAgICAgICAgZGVlcCA9IGRlZXAgfHwgMDtcblxuICAgICAgICBwYXJlbnQuYXBwZW5kKCR1bCk7XG4gICAgICAgIG5vZGVzLmZvckVhY2goKG5vZGUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgJGxpID0gJCgnPGxpPjwvbGk+JyksXG4gICAgICAgICAgICAgICAgJGljb25Ob2RlID0gJCgnPGk+PC9pPicpLFxuICAgICAgICAgICAgICAgIG5vZGVMYWJlbCA9IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246IHRoaXMubm9kZWxhYmVsLCBiaW5kRXhwcmVzc2lvbjogdGhpcy5iaW5kbm9kZWxhYmVsfSwgdGhpcy52aWV3UGFyZW50KSB8fCBub2RlLmxhYmVsLFxuICAgICAgICAgICAgICAgIG5vZGVJY29uID0gZ2V0RXZhbHVhdGVkRGF0YShub2RlLCB7ZXhwcmVzc2lvbjogdGhpcy5ub2RlaWNvbiwgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZG5vZGVpY29ufSwgdGhpcy52aWV3UGFyZW50KSB8fCBub2RlLmljb24sXG4gICAgICAgICAgICAgICAgbm9kZUNoaWxkcmVuID0gZ2V0RXZhbHVhdGVkRGF0YShub2RlLCB7ZXhwcmVzc2lvbjogdGhpcy5ub2RlY2hpbGRyZW4sIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRub2RlY2hpbGRyZW59LCB0aGlzLnZpZXdQYXJlbnQpIHx8IG5vZGUuY2hpbGRyZW4sXG4gICAgICAgICAgICAgICAgbm9kZUlkVmFsdWUgPSBnZXRFdmFsdWF0ZWREYXRhKG5vZGUsIHtleHByZXNzaW9uOiB0aGlzLm5vZGVpZCwgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZG5vZGVpZH0sIHRoaXMudmlld1BhcmVudCkgfHwgbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGxldCBpc05vZGVNYXRjaGVkID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgZXhwYW5kQ29sbGFwc2VJY29uO1xuXG4gICAgICAgICAgICAkbGkuZGF0YSgnbm9kZWRhdGEnLCBub2RlKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJGljb25Ob2RlKVxuICAgICAgICAgICAgICAgIC5hcHBlbmQoYDxzcGFuIGNsYXNzPVwidGl0bGVcIj4ke25vZGVMYWJlbH08L3NwYW4+YClcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8oJHVsKTtcblxuXG4gICAgICAgICAgICAvLyBpZiBkYXRhdmFsdWUoaWUsIGV4cHIpIGlzIHByb3ZpZGVkIHNlbGVjdCB0aGUgdHJlZSBub2RlIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAvLyBpZiBkYXRhdmFsdWUgPT09ICdGaXJzdE5vZGUnIC0tIHNlbGVjdCB0aGUgRmlyc3ROb2RlIGF0IGxldmVsIDBcbiAgICAgICAgICAgIC8vIGlmIGRhdGF2YWx1ZSA9PT0gJ0xhc3ROb2RlJyAtLSBzZWxlY3QgdGhlIExhc3ROb2RlIGF0IGxldmVsIDBcbiAgICAgICAgICAgIC8vIGlmIGRhdGF2YWx1ZSBpcyBhIGJpbmQgZXhwcmVzc2lvbiBldmFsdWF0ZSB0aGUgZXhwcmVzc2lvbiBmb3IgZWFjaCBub2RlIG9mIHRoZSB0cmVlIHRpbGwgdGhlIGNvbmRpdGlvbiBpcyBzYXRpc2ZpZWQuXG5cbiAgICAgICAgICAgIC8vIGlmIG5vZGUgaWRlbnRpZmllciBpcyBwcmVzZW50IHRoZW4gdmVyaWZ5IHRoZSBkYXRhdmFsdWUgaXMgYm91bmQgZXhwciBvciBzdGF0aWMgdmFsdWUgYW5kIGNvbXBhcmUgd2l0aCB0aGUgbm9kZSBtb2RlbFxuICAgICAgICAgICAgaWYgKHRoaXMuYmluZG5vZGVpZCB8fCB0aGlzLm5vZGVpZCkge1xuICAgICAgICAgICAgICAgIGlzTm9kZU1hdGNoZWQgPSB0aGlzLmJpbmRkYXRhdmFsdWUgPyBub2RlSWRWYWx1ZSA9PT0gX2V2YWxEYXRhVmFsdWUgOiBub2RlSWRWYWx1ZSA9PT0gX2V4cHI7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVJZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICRsaS5hdHRyKCdpZCcsIG5vZGVJZFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYmluZGRhdGF2YWx1ZSkgeyAvLyBldmFsdWF0ZSB0aGUgZXhwcmVzc2lvbiBvbmx5IGlmIGl0IGlzIGJvdW5kICh1c2VFeHByZXNzaW9uKVxuICAgICAgICAgICAgICAgIGlzTm9kZU1hdGNoZWQgPSAhISRwYXJzZUV4cHIoX2V4cHIpKHRoaXMsIG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGVyZm9ybSBMYXN0Tm9kZSBjaGVjayBvbmx5IGF0IGxldmVsIDAuKGllLCBkZWVwID0gMCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3NlbGVjdE5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoKF9leHByID09PSAnRmlyc3ROb2RlJyAmJiBpZHggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHx8ICghZGVlcCAmJiBfZXhwciA9PT0gJ0xhc3ROb2RlJyAmJiBpZHggPT09IG5vZGVzLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgICAgICAgIHx8IGlzTm9kZU1hdGNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSBhIHJlZmVyZW5jZSBvZiB0aGUgbm9kZSB0byBiZSBzZWxlY3RlZCBpbiBgX3NlbGVjdE5vZGVgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdE5vZGUgPSAkbGk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlICAgPSBub2RlSWRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub2RlSWNvbikge1xuICAgICAgICAgICAgICAgICRpY29uTm9kZS5hZGRDbGFzcyhub2RlSWNvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub2RlQ2hpbGRyZW4gJiYgbm9kZUNoaWxkcmVuLmxlbmd0aCkgeyAvLyBwYXJlbnQgbm9kZVxuICAgICAgICAgICAgICAgICRsaS5hZGRDbGFzcyhgcGFyZW50LW5vZGUgJHtfY2xzfWApO1xuICAgICAgICAgICAgICAgIGV4cGFuZENvbGxhcHNlSWNvbiA9ICQoYDxpIGNsYXNzPVwid2kgJHtfaWNvbkNsc31cIj48L2k+YCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVJY29uKSB7XG4gICAgICAgICAgICAgICAgICAgICRpY29uTm9kZS5hZGRDbGFzcyhub2RlSWNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRsaS5wcmVwZW5kKGV4cGFuZENvbGxhcHNlSWNvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3ROb2Rlcyhub2RlQ2hpbGRyZW4sICRsaSwgbGV2ZWxzIC0gMSwgZGVlcCArIDEsIF9ldmFsRGF0YVZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFub2RlSWNvbikge1xuICAgICAgICAgICAgICAgICAgICAkaWNvbk5vZGUuYWRkQ2xhc3MoJ2xlYWYtbm9kZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkbGkuYWRkQ2xhc3MoJ2xlYWYtbm9kZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE5vZGVzRnJvbVN0cmluZyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUuc3BsaXQoJywnKS5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2xhYmVsJzogaXRlbSAmJiBpdGVtLnRyaW0oKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXROb2RlcyhuZXdWYWwpIHtcbiAgICAgICAgbGV0IG5vZGVzO1xuICAgICAgICBpZiAoXy5pc1N0cmluZyhuZXdWYWwpICYmICFfLmlzRW1wdHkobmV3VmFsKSkge1xuICAgICAgICAgICAgbmV3VmFsID0gbmV3VmFsLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICBub2RlcyA9IHRoaXMuZ2V0Tm9kZXNGcm9tU3RyaW5nKG5ld1ZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KG5ld1ZhbCkpIHtcbiAgICAgICAgICAgIG5ld1ZhbCA9IGdldE9yZGVyZWREYXRhc2V0KG5ld1ZhbCwgdGhpcy5vcmRlcmJ5KTtcbiAgICAgICAgICAgIG5vZGVzID0gbmV3VmFsO1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QobmV3VmFsKSkge1xuICAgICAgICAgICAgbm9kZXMgPSBbbmV3VmFsXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VUcmVlSWNvbnMobnYsIG92KSB7XG4gICAgICAgIGNvbnN0ICRlbCA9ICQodGhpcy5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgbnYgPSBudiB8fCBkZWZhdWx0VHJlZUljb25DbGFzcztcbiAgICAgICAgb3YgPSBvdiB8fCBkZWZhdWx0VHJlZUljb25DbGFzcztcbiAgICAgICAgJGVsLmZpbmQoJ2kuZXhwYW5kZWQnKS5yZW1vdmVDbGFzcyhJQ09OX0NMQVNTRVNbb3ZdLmV4cGFuZGVkKS5hZGRDbGFzcyhJQ09OX0NMQVNTRVNbbnZdLmV4cGFuZGVkKTtcbiAgICAgICAgJGVsLmZpbmQoJ2kuY29sbGFwc2VkJykucmVtb3ZlQ2xhc3MoSUNPTl9DTEFTU0VTW292XS5jb2xsYXBzZWQpLmFkZENsYXNzKElDT05fQ0xBU1NFU1tudl0uY29sbGFwc2VkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRvZ2dsZUV4cGFuZENvbGxhcHNlTm9kZSgkZXZlbnQsICRpLCAkbGkpIHtcbiAgICAgICAgY29uc3QgdHJlZUljb25zID0gSUNPTl9DTEFTU0VTW3RoaXMudHJlZWljb25zIHx8IGRlZmF1bHRUcmVlSWNvbkNsYXNzXSxcbiAgICAgICAgICAgIGV2ZW50UGFyYW1zID0ge1xuICAgICAgICAgICAgICAgICckZXZlbnQnICA6ICRldmVudFxuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoJGkuaGFzQ2xhc3MoJ2NvbGxhcHNlZCcpKSB7XG4gICAgICAgICAgICAkaS5yZW1vdmVDbGFzcyhgY29sbGFwc2VkICR7dHJlZUljb25zLmNvbGxhcHNlZH1gKS5hZGRDbGFzcyhgZXhwYW5kZWQgJHt0cmVlSWNvbnMuZXhwYW5kZWR9YCk7XG4gICAgICAgICAgICAkbGkucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpLmFkZENsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdleHBhbmQnLCBldmVudFBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoJGkuaGFzQ2xhc3MoJ2V4cGFuZGVkJykpIHtcbiAgICAgICAgICAgICRpLnJlbW92ZUNsYXNzKGBleHBhbmRlZCAke3RyZWVJY29ucy5leHBhbmRlZH1gKS5hZGRDbGFzcyhgY29sbGFwc2VkICR7dHJlZUljb25zLmNvbGxhcHNlZH1gKTtcbiAgICAgICAgICAgICRsaS5yZW1vdmVDbGFzcygnZXhwYW5kZWQnKS5hZGRDbGFzcygnY29sbGFwc2VkJyk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NvbGxhcHNlJywgZXZlbnRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJUcmVlKGZvcmNlUmVuZGVyPykge1xuICAgICAgICBsZXQgZG9jRnJhZyxcbiAgICAgICAgICAgICRsaSxcbiAgICAgICAgICAgICRsaVBhdGgsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcGF0aCA9ICcnO1xuICAgICAgICBjb25zdCBsZXZlbHMgPSArdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnbGV2ZWxzJykgfHwgMCxcbiAgICAgICAgICAgICRlbCA9ICQodGhpcy5uYXRpdmVFbGVtZW50KTtcblxuICAgICAgICAkZWwuZW1wdHkoKTtcblxuICAgICAgICBpZiAoZm9yY2VSZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdE5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ub2RlcyAmJiB0aGlzLm5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0Tm9kZXModGhpcy5ub2RlcywgJChkb2NGcmFnKSwgbGV2ZWxzLCAwLCB0aGlzLmRhdGF2YWx1ZSk7XG4gICAgICAgICAgICAkZWwuYXBwZW5kKGRvY0ZyYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX3NlbGVjdE5vZGUpIHtcbiAgICAgICAgICAgICRsaSA9IHRoaXMuX3NlbGVjdE5vZGU7XG4gICAgICAgICAgICAkbGkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICAgICBkYXRhICAgID0gJGxpLmRhdGEoJ25vZGVkYXRhJyk7XG4gICAgICAgICAgICAkbGlQYXRoID0gJGxpLnBhcmVudHNVbnRpbCgkZWwsICdsaS5wYXJlbnQtbm9kZS5jb2xsYXBzZWQnKTtcblxuICAgICAgICAgICAgaWYgKCEkbGlQYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICRsaVBhdGggPSAkbGk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRsaVBhdGhcbiAgICAgICAgICAgICAgICAuZWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0ICRjdXJyZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICRpICAgICAgID0gJGN1cnJlbnQuY2hpbGRyZW4oJ2kuY29sbGFwc2VkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGl0bGUgICA9ICRjdXJyZW50LmNoaWxkcmVuKCcudGl0bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFeHBhbmRDb2xsYXBzZU5vZGUodW5kZWZpbmVkLCAkaSwgJGN1cnJlbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBgLyR7JHRpdGxlLnRleHQoKSArIHBhdGh9YDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSBnZXRDbG9uZWRPYmplY3QoZGF0YSkgfHwge307XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkaXRlbS5wYXRoID0gcGF0aDtcblxuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JGV2ZW50OiB1bmRlZmluZWQsICRpdGVtOiBkYXRhLCAkcGF0aDogcGF0aH0pO1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZWxlY3ROb2RlKGV2dCwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZ0ICYmICQoZXZ0LnRhcmdldCksXG4gICAgICAgICAgICAkZWwgPSAkKHRoaXMubmF0aXZlRWxlbWVudCksXG4gICAgICAgICAgICAkbGkgPSBfLmlzT2JqZWN0KHZhbHVlKSA/IHZhbHVlIDogJGVsLmZpbmQoYGxpW2lkPVwiJHt2YWx1ZX1cIl06Zmlyc3RgKTtcbiAgICAgICAgbGV0IGRhdGEsXG4gICAgICAgICAgICBwYXRoID0gJycsXG4gICAgICAgICAgICAkbGlQYXRoLFxuICAgICAgICAgICAgbm9kZUFjdGlvbjtcbiAgICAgICAgJGVsLmZpbmQoJy5zZWxlY3RlZCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICBpZiAoISRsaS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkbGkuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgIGRhdGEgPSAkbGkuZGF0YSgnbm9kZWRhdGEnKTtcbiAgICAgICAgbm9kZUFjdGlvbiA9IGRhdGFbdGhpcy5ub2RlYWN0aW9uIHx8ICdhY3Rpb24nXTtcblxuICAgICAgICAvLyBpZiB0aGUgc2VsZWN0Tm9kZSBpcyBpbml0aWF0ZWQgYnkgY2xpY2sgZXZlbnQgdGhlbiB1c2UgdGhlIG5hdGl2ZUVsZW1lbnQgdGFyZ2V0IGZyb20gZXZlbnRcbiAgICAgICAgJGxpUGF0aCA9IHRhcmdldCA/IHRhcmdldC5wYXJlbnRzKCcuYXBwLXRyZWUgbGknKSA6ICRsaS5maW5kKCc+IHNwYW4udGl0bGUnKS5wYXJlbnRzKCcuYXBwLXRyZWUgbGknKTtcblxuICAgICAgICAvLyBjb25zdHJ1Y3QgdGhlIHBhdGggb2YgdGhlIG5vZGVcbiAgICAgICAgJGxpUGF0aFxuICAgICAgICAgICAgLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudCA9ICQoZWwpLmNoaWxkcmVuKCcudGl0bGUnKS50ZXh0KCk7XG4gICAgICAgICAgICAgICAgcGF0aCA9IGAvJHtjdXJyZW50ICsgcGF0aH1gO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gZXhwYW5kIHRoZSBjdXJyZW50IG5vZGUgdGlsbCB0aGUgdmlld1BhcmVudCBsZXZlbCB3aGljaCBpcyBjb2xsYXBzZWRcbiAgICAgICAgJGxpLnBhcmVudHNVbnRpbCgkZWwsICdsaS5wYXJlbnQtbm9kZS5jb2xsYXBzZWQnKVxuICAgICAgICAgICAgLmVhY2goKGluZGV4LCBlbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0ICRjdXJyZW50ID0gJChlbCksXG4gICAgICAgICAgICAgICAgICAgICRpID0gJGN1cnJlbnQuY2hpbGRyZW4oJ2kuY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVFeHBhbmRDb2xsYXBzZU5vZGUodW5kZWZpbmVkLCAkaSwgJGN1cnJlbnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gICAgICA9IGdldENsb25lZE9iamVjdChkYXRhKSB8fCB7fTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0ucGF0aCA9IHBhdGg7XG5cbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubm9kZWlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhdmFsdWUgPSAkcGFyc2VFeHByKHRoaXMubm9kZWlkKSh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5iaW5kbm9kZWlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhdmFsdWUgPSBnZXRFdmFsdWF0ZWREYXRhKGRhdGEsIHtleHByZXNzaW9uOiB0aGlzLm5vZGVpZCwgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZG5vZGVpZH0sIHRoaXMudmlld1BhcmVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YXZhbHVlID0gZ2V0Q2xvbmVkT2JqZWN0KGRhdGEpIHx8IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGVBY3Rpb24pIHtcbiAgICAgICAgICAgICRwYXJzZUV2ZW50KG5vZGVBY3Rpb24pKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JGV2ZW50OiBldnQsICRpdGVtOiBkYXRhLCAkcGF0aDogcGF0aH0pO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuICAgIC8vIGNsaWNrIGV2ZW50IGlzIGFkZGVkIG9uIHRoZSBob3N0IG5hdGl2ZUVsZW1lbnRcbiAgICBwcml2YXRlIGJpbmRFdmVudHMoKSB7XG4gICAgICAgICQodGhpcy5uYXRpdmVFbGVtZW50KS5vbignY2xpY2snLCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSAkKGV2dC50YXJnZXQpLFxuICAgICAgICAgICAgICAgIGxpICAgICA9IHRhcmdldC5jbG9zZXN0KCdsaScpLFxuICAgICAgICAgICAgICAgICRpICAgICA9IHRhcmdldC5pcygnaScpID8gdGFyZ2V0IDogdGFyZ2V0LnNpYmxpbmdzKCdpLmNvbGxhcHNlZCxpLmV4cGFuZGVkJyk7XG5cbiAgICAgICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRhcmdldC5pcygnc3Bhbi50aXRsZScpKSB7IC8vIHNlbGVjdCB0aGUgbm9kZSBvbmx5IGlmIGl0IGlzIG5vZGVsYWJlbFxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRpdGVtID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3ROb2RlKGV2dCwgbGkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGFyZ2V0LmlzKCdpJykgfHwgKHRhcmdldC5pcygnc3Bhbi50aXRsZScpICYmIHRoaXMubm9kZWNsaWNrID09PSAnZXhwYW5kJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUV4cGFuZENvbGxhcHNlTm9kZShldnQsICRpLCBsaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2VsZWN0QnlJZCh2YWx1ZT8pIHtcbiAgICAgICAgdGhpcy5zZWxlY3ROb2RlKHVuZGVmaW5lZCwgdmFsdWUpO1xuICAgIH1cbiAgICBwcml2YXRlIGRlc2VsZWN0QnlJZCh2YWx1ZT8pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSB7fTtcbiAgICAgICAgdGhpcy5zZWxlY3RCeUlkKCk7XG4gICAgfVxuICAgIHB1YmxpYyByZWRyYXcoKSB7XG4gICAgICAgIHRoaXMucmVuZGVyVHJlZSh0cnVlKTtcbiAgICB9XG59XG4iXX0=