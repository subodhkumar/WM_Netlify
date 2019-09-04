import * as tslib_1 from "tslib";
import { $appDigest, findValueOf, isObject, validateAccessRoles } from '@wm/core';
import { SecurityService } from '@wm/security';
import { createArrayFrom } from '../../../utils/data-utils';
import { getEvaluatedData } from '../../../utils/widget-utils';
import { getOrderedDataset } from '../../../utils/form-utils';
import { StylableComponent } from './stylable.component';
var getValidLink = function (link) {
    var routRegex = /^(\/|#\/|#)(?!\W).*/;
    if (link) {
        if (routRegex.test(link)) {
            link = _.first(link.match(/[\w]+.*/g)) || '';
            return "#/" + link;
        }
        if (_.startsWith(link, 'www.')) {
            return "//" + link;
        }
        return link;
    }
};
var ɵ0 = getValidLink;
var DatasetAwareNavComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DatasetAwareNavComponent, _super);
    function DatasetAwareNavComponent(inj, WIDGET_CONFIG) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.nodes = [];
        // debounce function for reset nodes functions.
        _this._resetNodes = _.debounce(_this.resetNodes, 50);
        _this.securityService = _this.inj.get(SecurityService);
        _this.binditemlabel = _this.nativeElement.getAttribute('itemlabel.bind');
        _this.binditemicon = _this.nativeElement.getAttribute('itemicon.bind');
        _this.binditemaction = _this.nativeElement.getAttribute('itemaction.bind');
        _this.binditembadge = _this.nativeElement.getAttribute('itembadge.bind');
        _this.binditemchildren = _this.nativeElement.getAttribute('itemchildren.bind');
        _this.binditemid = _this.nativeElement.getAttribute('itemid.bind');
        _this.binditemlink = _this.nativeElement.getAttribute('itemlink.bind');
        _this.binditemtarget = _this.nativeElement.getAttribute('itemtarget.bind');
        _this.binduserrole = _this.nativeElement.getAttribute('userrole.bind');
        return _this;
    }
    /**
     * constructs individual node for the widget model.
     * @param fields
     * @param node
     */
    DatasetAwareNavComponent.prototype.getNode = function (fields, node) {
        var context = this.viewParent.pageScope || this.viewParent;
        var children = getEvaluatedData(node, { expression: 'itemchildren', bindExpression: this.binditemchildren }, context) || _.get(node, fields.childrenField);
        var navNode = {
            action: getEvaluatedData(node, { expression: 'itemaction', bindExpression: this.binditemaction }, context) || _.get(node, fields.actionField),
            badge: getEvaluatedData(node, { expression: 'itembadge', bindExpression: this.binditembadge }, context) || _.get(node, fields.badgeField),
            children: Array.isArray(children) ? this.getNodes(children) : [],
            class: _.get(node, fields.classField),
            disabled: node.disabled,
            icon: getEvaluatedData(node, { expression: 'itemicon', bindExpression: this.binditemicon }, context) || _.get(node, fields.iconField),
            id: getEvaluatedData(node, { expression: 'itemid', bindExpression: this.binditemid }, context) || _.get(node, fields.idField),
            label: getEvaluatedData(node, { expression: 'itemlabel', bindExpression: this.binditemlabel }, context) || _.get(node, fields.labelField),
            link: getValidLink(getEvaluatedData(node, { expression: 'itemlink', bindExpression: this.binditemlink }, context) || _.get(node, fields.linkField)),
            target: getValidLink(getEvaluatedData(node, { expression: 'itemtarget', bindExpression: this.binditemtarget }, context) || _.get(node, fields.targetField)),
            role: getEvaluatedData(node, { expression: 'userrole', bindExpression: this.binduserrole }, context),
            // older projects have display field & data field property for menu.
            value: this.datafield ? (this.datafield === 'All Fields' ? node : findValueOf(node, this.datafield)) : node
        };
        return _.omitBy(navNode, _.isUndefined);
    };
    DatasetAwareNavComponent.prototype.resetItemFieldMap = function () {
        this._itemFieldMap = null;
    };
    DatasetAwareNavComponent.prototype.getItemFieldsMap = function () {
        if (!this._itemFieldMap) {
            this._itemFieldMap = {
                idField: this.itemid || 'itemid',
                iconField: this.itemicon || 'icon',
                labelField: this.itemlabel || 'label',
                linkField: this.itemlink || 'link',
                targetField: this.itemtarget || 'target',
                badgeField: this.itembadge || 'badge',
                childrenField: this.itemchildren || 'children',
                classField: this.itemclass || 'class',
                actionField: this.itemaction || 'action'
            };
        }
        return this._itemFieldMap;
    };
    /**
     * returns array for the value passed as nv.
     * nv: 'a,b' => [{label:a, value:a}, {label:b, value:b}]
     * nv: [1,2] => [{label:1, value:1}, {label:2, value:2}]
     * nv: [{obj}, {obj}] => [{obj}, {obj}]
     * @param nv
     */
    DatasetAwareNavComponent.prototype.prepareNodeDataSet = function (nv) {
        nv = createArrayFrom(nv);
        return nv.map(function (val) {
            if (!isObject(val)) {
                return {
                    label: val,
                    value: val
                };
            }
            return val;
        });
    };
    /**
     * constructs dataset form the nav elements.
     */
    DatasetAwareNavComponent.prototype.getNodes = function (nv) {
        var _this = this;
        if (nv === void 0) { nv = this.dataset || {}; }
        var nodes = getOrderedDataset(this.prepareNodeDataSet(nv), this.orderby) || [];
        if (nodes.length) {
            var userRole_1 = this.userrole;
            var nodeFields_1 = this.getItemFieldsMap();
            nodes = nodes.reduce(function (result, node) {
                if (validateAccessRoles(node[userRole_1], _this.securityService.loggedInUser)) {
                    result.push(_this.getNode(nodeFields_1, node));
                }
                return result;
            }, []);
        }
        return nodes;
    };
    // enable the inherited class to extend this method.
    DatasetAwareNavComponent.prototype.resetNodes = function () {
        this.resetItemFieldMap();
        this.nodes = this.getNodes();
        $appDigest();
    };
    DatasetAwareNavComponent.prototype.onPropertyChange = function (key, nv, ov) {
        switch (key) {
            case 'dataset':
            case 'itemicon':
            case 'itemlabel':
            case 'itemlink':
            case 'itemtarget':
            case 'itemclass':
            case 'itemchildren':
            case 'orderby':
                // calls resetnodes method after 50ms. any calls within 50ms will be ignored.
                this._resetNodes();
                break;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    return DatasetAwareNavComponent;
}(StylableComponent));
export { DatasetAwareNavComponent };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YXNldC1hd2FyZS1uYXYuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9iYXNlL2RhdGFzZXQtYXdhcmUtbmF2LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFL0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzlELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBSXpELElBQU0sWUFBWSxHQUFHLFVBQUMsSUFBSTtJQUN0QixJQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztJQUN4QyxJQUFJLElBQUksRUFBRTtRQUNOLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdDLE9BQU8sT0FBSyxJQUFNLENBQUM7U0FDdEI7UUFDRCxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLE9BQU8sT0FBSyxJQUFNLENBQUM7U0FDdEI7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNmO0FBQ0wsQ0FBQyxDQUFDOztBQUVGO0lBQThDLG9EQUFpQjtJQStCM0Qsa0NBQVksR0FBYSxFQUFFLGFBQWE7UUFBeEMsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBVzVCO1FBekNNLFdBQUssR0FBbUIsRUFBRSxDQUFDO1FBeUlsQywrQ0FBK0M7UUFDdkMsaUJBQVcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7UUEzR2xELEtBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckQsS0FBSSxDQUFDLGFBQWEsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZFLEtBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLEtBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RSxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM3RSxLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pFLEtBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLEtBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7O0lBQ3pFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssMENBQU8sR0FBZixVQUFnQixNQUFNLEVBQUUsSUFBSTtRQUN4QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzdELElBQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzSixJQUFNLE9BQU8sR0FBRztZQUNaLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUMzSSxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDdkksUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDaEUsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDckMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNuSSxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDM0gsS0FBSyxFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDO1lBQ3ZJLElBQUksRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNqSixNQUFNLEVBQUUsWUFBWSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDekosSUFBSSxFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsRUFBRSxPQUFPLENBQUM7WUFDbEcsb0VBQW9FO1lBQ3BFLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7U0FDOUcsQ0FBQztRQUNGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxvREFBaUIsR0FBakI7UUFDSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztJQUM5QixDQUFDO0lBRUQsbURBQWdCLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRztnQkFDakIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLElBQUksUUFBUTtnQkFDaEMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTTtnQkFDbEMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTztnQkFDckMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTTtnQkFDbEMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUTtnQkFDeEMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTztnQkFDckMsYUFBYSxFQUFFLElBQUksQ0FBQyxZQUFZLElBQUksVUFBVTtnQkFDOUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTztnQkFDckMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUTthQUMzQyxDQUFDO1NBQ0w7UUFDRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLHFEQUFrQixHQUExQixVQUEyQixFQUFFO1FBQ3pCLEVBQUUsR0FBSSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUMsR0FBRztZQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2YsT0FBTztvQkFDSCxLQUFLLEVBQUUsR0FBRztvQkFDVixLQUFLLEVBQUUsR0FBRztpQkFDYixDQUFDO2FBQ047WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ssMkNBQVEsR0FBaEIsVUFBaUIsRUFBdUI7UUFBeEMsaUJBZUM7UUFmZ0IsbUJBQUEsRUFBQSxLQUFLLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRTtRQUNwQyxJQUFJLEtBQUssR0FBZSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUUzRixJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFNLFVBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLElBQU0sWUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTNDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsTUFBTSxFQUFFLElBQUk7Z0JBQzlCLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVEsQ0FBQyxFQUFFLEtBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQ3hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxZQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDL0M7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ1Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsb0RBQW9EO0lBQzFDLDZDQUFVLEdBQXBCO1FBQ0ksSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQztJQUtELG1EQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDeEIsUUFBUSxHQUFHLEVBQUU7WUFDVCxLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssVUFBVSxDQUFDO1lBQ2hCLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssU0FBUztnQkFDViw2RUFBNkU7Z0JBQzdFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbkIsTUFBTTtTQUNiO1FBQ0QsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBOUpELENBQThDLGlCQUFpQixHQThKOUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBmaW5kVmFsdWVPZiwgaXNPYmplY3QsIHZhbGlkYXRlQWNjZXNzUm9sZXMgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBTZWN1cml0eVNlcnZpY2UgfSBmcm9tICdAd20vc2VjdXJpdHknO1xuXG5pbXBvcnQgeyBjcmVhdGVBcnJheUZyb20gfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7IGdldEV2YWx1YXRlZERhdGEgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgZ2V0T3JkZXJlZERhdGFzZXQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9mb3JtLXV0aWxzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi9zdHlsYWJsZS5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IGdldFZhbGlkTGluayA9IChsaW5rKSA9PiB7XG4gICAgY29uc3Qgcm91dFJlZ2V4ID0gL14oXFwvfCNcXC98IykoPyFcXFcpLiovO1xuICAgIGlmIChsaW5rKSB7XG4gICAgICAgIGlmIChyb3V0UmVnZXgudGVzdChsaW5rKSkge1xuICAgICAgICAgICAgbGluayA9IF8uZmlyc3QobGluay5tYXRjaCgvW1xcd10rLiovZykpIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIGAjLyR7bGlua31gO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLnN0YXJ0c1dpdGgobGluaywgJ3d3dy4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGAvLyR7bGlua31gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaW5rO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBEYXRhc2V0QXdhcmVOYXZDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG5cbiAgICBwdWJsaWMgbm9kZXM6IEFycmF5PE5hdk5vZGU+ID0gW107XG4gICAgcHVibGljIGRhdGFzZXQ6IGFueTtcbiAgICBwdWJsaWMgaXRlbWljb246IHN0cmluZztcbiAgICBwdWJsaWMgaXRlbWxhYmVsOiBzdHJpbmc7XG4gICAgcHVibGljIGl0ZW1saW5rOiBzdHJpbmc7XG4gICAgcHVibGljIGl0ZW10YXJnZXQ6IHN0cmluZztcbiAgICBwdWJsaWMgaXRlbWJhZGdlOiBzdHJpbmc7XG4gICAgcHVibGljIGl0ZW1jaGlsZHJlbjogc3RyaW5nO1xuICAgIHB1YmxpYyBpdGVtYWN0aW9uOiBzdHJpbmc7XG4gICAgcHVibGljIGl0ZW1jbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyBpdGVtaWQ6IHN0cmluZztcbiAgICBwdWJsaWMgdXNlcnJvbGU6IHN0cmluZztcbiAgICBwdWJsaWMgb3JkZXJieTogc3RyaW5nO1xuICAgIHB1YmxpYyBkYXRhZmllbGQ6IHN0cmluZztcbiAgICBwdWJsaWMgZGlzcGxheWZpZWxkOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIF9pdGVtRmllbGRNYXA7XG4gICAgcHJpdmF0ZSBiaW5kaXRlbWxhYmVsOiBzdHJpbmcgfCBudWxsO1xuICAgIHByaXZhdGUgYmluZGl0ZW1pY29uOiBzdHJpbmcgfCBudWxsO1xuICAgIHByaXZhdGUgYmluZGl0ZW1hY3Rpb246IHN0cmluZyB8IG51bGw7XG4gICAgcHJpdmF0ZSBiaW5kaXRlbWJhZGdlOiBzdHJpbmcgfCBudWxsO1xuICAgIHByaXZhdGUgYmluZGl0ZW1jaGlsZHJlbjogc3RyaW5nIHwgbnVsbDtcbiAgICBwcml2YXRlIGJpbmRpdGVtbGluazogc3RyaW5nIHwgbnVsbDtcbiAgICBwcml2YXRlIGJpbmRpdGVtdGFyZ2V0OiBzdHJpbmcgfCBudWxsO1xuICAgIHByaXZhdGUgYmluZHVzZXJyb2xlOiBzdHJpbmcgfCBudWxsO1xuICAgIHByaXZhdGUgc2VjdXJpdHlTZXJ2aWNlOiBhbnk7XG5cbiAgICBwcm90ZWN0ZWQgYmluZGl0ZW1pZDogc3RyaW5nIHwgbnVsbDtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIFdJREdFVF9DT05GSUcpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgdGhpcy5zZWN1cml0eVNlcnZpY2UgPSB0aGlzLmluai5nZXQoU2VjdXJpdHlTZXJ2aWNlKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWxhYmVsID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbWxhYmVsLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWljb24gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtaWNvbi5iaW5kJyk7XG4gICAgICAgIHRoaXMuYmluZGl0ZW1hY3Rpb24gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtYWN0aW9uLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWJhZGdlID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbWJhZGdlLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWNoaWxkcmVuID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbWNoaWxkcmVuLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWlkID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbWlkLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWxpbmsgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtbGluay5iaW5kJyk7XG4gICAgICAgIHRoaXMuYmluZGl0ZW10YXJnZXQgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtdGFyZ2V0LmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kdXNlcnJvbGUgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCd1c2Vycm9sZS5iaW5kJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY29uc3RydWN0cyBpbmRpdmlkdWFsIG5vZGUgZm9yIHRoZSB3aWRnZXQgbW9kZWwuXG4gICAgICogQHBhcmFtIGZpZWxkc1xuICAgICAqIEBwYXJhbSBub2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXROb2RlKGZpZWxkcywgbm9kZSk6IE5hdk5vZGUge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy52aWV3UGFyZW50LnBhZ2VTY29wZSB8fCB0aGlzLnZpZXdQYXJlbnQ7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gZ2V0RXZhbHVhdGVkRGF0YShub2RlLCB7ZXhwcmVzc2lvbjogJ2l0ZW1jaGlsZHJlbicsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRpdGVtY2hpbGRyZW59LCBjb250ZXh0KSB8fCBfLmdldChub2RlLCBmaWVsZHMuY2hpbGRyZW5GaWVsZCk7XG4gICAgICAgIGNvbnN0IG5hdk5vZGUgPSB7XG4gICAgICAgICAgICBhY3Rpb246IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtYWN0aW9uJywgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZGl0ZW1hY3Rpb259LCBjb250ZXh0KSB8fCBfLmdldChub2RlLCBmaWVsZHMuYWN0aW9uRmllbGQpLFxuICAgICAgICAgICAgYmFkZ2U6IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtYmFkZ2UnLCBiaW5kRXhwcmVzc2lvbjogdGhpcy5iaW5kaXRlbWJhZGdlfSwgY29udGV4dCkgfHwgXy5nZXQobm9kZSwgZmllbGRzLmJhZGdlRmllbGQpLFxuICAgICAgICAgICAgY2hpbGRyZW46IEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pID8gdGhpcy5nZXROb2RlcyhjaGlsZHJlbikgOiBbXSxcbiAgICAgICAgICAgIGNsYXNzOiBfLmdldChub2RlLCBmaWVsZHMuY2xhc3NGaWVsZCksXG4gICAgICAgICAgICBkaXNhYmxlZDogbm9kZS5kaXNhYmxlZCxcbiAgICAgICAgICAgIGljb246IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtaWNvbicsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRpdGVtaWNvbn0sIGNvbnRleHQpIHx8IF8uZ2V0KG5vZGUsIGZpZWxkcy5pY29uRmllbGQpLFxuICAgICAgICAgICAgaWQ6IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtaWQnLCBiaW5kRXhwcmVzc2lvbjogdGhpcy5iaW5kaXRlbWlkfSwgY29udGV4dCkgfHwgXy5nZXQobm9kZSwgZmllbGRzLmlkRmllbGQpLFxuICAgICAgICAgICAgbGFiZWw6IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtbGFiZWwnLCBiaW5kRXhwcmVzc2lvbjogdGhpcy5iaW5kaXRlbWxhYmVsfSwgY29udGV4dCkgfHwgXy5nZXQobm9kZSwgZmllbGRzLmxhYmVsRmllbGQpLFxuICAgICAgICAgICAgbGluazogZ2V0VmFsaWRMaW5rKGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtbGluaycsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRpdGVtbGlua30sIGNvbnRleHQpIHx8IF8uZ2V0KG5vZGUsIGZpZWxkcy5saW5rRmllbGQpKSxcbiAgICAgICAgICAgIHRhcmdldDogZ2V0VmFsaWRMaW5rKGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICdpdGVtdGFyZ2V0JywgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZGl0ZW10YXJnZXR9LCBjb250ZXh0KSB8fCBfLmdldChub2RlLCBmaWVsZHMudGFyZ2V0RmllbGQpKSxcbiAgICAgICAgICAgIHJvbGU6IGdldEV2YWx1YXRlZERhdGEobm9kZSwge2V4cHJlc3Npb246ICd1c2Vycm9sZScsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmR1c2Vycm9sZX0sIGNvbnRleHQpLFxuICAgICAgICAgICAgLy8gb2xkZXIgcHJvamVjdHMgaGF2ZSBkaXNwbGF5IGZpZWxkICYgZGF0YSBmaWVsZCBwcm9wZXJ0eSBmb3IgbWVudS5cbiAgICAgICAgICAgIHZhbHVlOiB0aGlzLmRhdGFmaWVsZCA/ICh0aGlzLmRhdGFmaWVsZCA9PT0gJ0FsbCBGaWVsZHMnID8gbm9kZSA6IGZpbmRWYWx1ZU9mKG5vZGUsIHRoaXMuZGF0YWZpZWxkKSkgOiBub2RlXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBfLm9taXRCeShuYXZOb2RlLCBfLmlzVW5kZWZpbmVkKTtcbiAgICB9XG5cbiAgICByZXNldEl0ZW1GaWVsZE1hcCgpIHtcbiAgICAgICAgdGhpcy5faXRlbUZpZWxkTWFwID0gbnVsbDtcbiAgICB9XG5cbiAgICBnZXRJdGVtRmllbGRzTWFwKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2l0ZW1GaWVsZE1hcCkge1xuICAgICAgICAgICAgdGhpcy5faXRlbUZpZWxkTWFwID0ge1xuICAgICAgICAgICAgICAgIGlkRmllbGQ6IHRoaXMuaXRlbWlkIHx8ICdpdGVtaWQnLFxuICAgICAgICAgICAgICAgIGljb25GaWVsZDogdGhpcy5pdGVtaWNvbiB8fCAnaWNvbicsXG4gICAgICAgICAgICAgICAgbGFiZWxGaWVsZDogdGhpcy5pdGVtbGFiZWwgfHwgJ2xhYmVsJyxcbiAgICAgICAgICAgICAgICBsaW5rRmllbGQ6IHRoaXMuaXRlbWxpbmsgfHwgJ2xpbmsnLFxuICAgICAgICAgICAgICAgIHRhcmdldEZpZWxkOiB0aGlzLml0ZW10YXJnZXQgfHwgJ3RhcmdldCcsXG4gICAgICAgICAgICAgICAgYmFkZ2VGaWVsZDogdGhpcy5pdGVtYmFkZ2UgfHwgJ2JhZGdlJyxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbkZpZWxkOiB0aGlzLml0ZW1jaGlsZHJlbiB8fCAnY2hpbGRyZW4nLFxuICAgICAgICAgICAgICAgIGNsYXNzRmllbGQ6IHRoaXMuaXRlbWNsYXNzIHx8ICdjbGFzcycsXG4gICAgICAgICAgICAgICAgYWN0aW9uRmllbGQ6IHRoaXMuaXRlbWFjdGlvbiB8fCAnYWN0aW9uJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5faXRlbUZpZWxkTWFwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgYXJyYXkgZm9yIHRoZSB2YWx1ZSBwYXNzZWQgYXMgbnYuXG4gICAgICogbnY6ICdhLGInID0+IFt7bGFiZWw6YSwgdmFsdWU6YX0sIHtsYWJlbDpiLCB2YWx1ZTpifV1cbiAgICAgKiBudjogWzEsMl0gPT4gW3tsYWJlbDoxLCB2YWx1ZToxfSwge2xhYmVsOjIsIHZhbHVlOjJ9XVxuICAgICAqIG52OiBbe29ian0sIHtvYmp9XSA9PiBbe29ian0sIHtvYmp9XVxuICAgICAqIEBwYXJhbSBudlxuICAgICAqL1xuICAgIHByaXZhdGUgcHJlcGFyZU5vZGVEYXRhU2V0KG52KSB7XG4gICAgICAgIG52ID0gIGNyZWF0ZUFycmF5RnJvbShudik7XG4gICAgICAgIHJldHVybiBudi5tYXAoKHZhbCkgPT4ge1xuICAgICAgICAgICBpZiAoIWlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogdmFsLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmFsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgfVxuICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb25zdHJ1Y3RzIGRhdGFzZXQgZm9ybSB0aGUgbmF2IGVsZW1lbnRzLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0Tm9kZXMobnYgPSB0aGlzLmRhdGFzZXQgfHwge30pOiBBcnJheTxOYXZOb2RlPiB7XG4gICAgICAgIGxldCBub2RlczogQXJyYXk8YW55PiA9IGdldE9yZGVyZWREYXRhc2V0KHRoaXMucHJlcGFyZU5vZGVEYXRhU2V0KG52KSwgdGhpcy5vcmRlcmJ5KSB8fCBbXTtcblxuICAgICAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyUm9sZSA9IHRoaXMudXNlcnJvbGU7XG4gICAgICAgICAgICBjb25zdCBub2RlRmllbGRzID0gdGhpcy5nZXRJdGVtRmllbGRzTWFwKCk7XG5cbiAgICAgICAgICAgIG5vZGVzID0gbm9kZXMucmVkdWNlKChyZXN1bHQsIG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRhdGVBY2Nlc3NSb2xlcyhub2RlW3VzZXJSb2xlXSwgdGhpcy5zZWN1cml0eVNlcnZpY2UubG9nZ2VkSW5Vc2VyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLmdldE5vZGUobm9kZUZpZWxkcywgbm9kZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG5cbiAgICAvLyBlbmFibGUgdGhlIGluaGVyaXRlZCBjbGFzcyB0byBleHRlbmQgdGhpcyBtZXRob2QuXG4gICAgcHJvdGVjdGVkIHJlc2V0Tm9kZXMoKSB7XG4gICAgICAgIHRoaXMucmVzZXRJdGVtRmllbGRNYXAoKTtcbiAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMuZ2V0Tm9kZXMoKTtcbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIC8vIGRlYm91bmNlIGZ1bmN0aW9uIGZvciByZXNldCBub2RlcyBmdW5jdGlvbnMuXG4gICAgcHJpdmF0ZSBfcmVzZXROb2RlcyA9IF8uZGVib3VuY2UodGhpcy5yZXNldE5vZGVzLCA1MCk7XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICdkYXRhc2V0JzpcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW1pY29uJzpcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW1sYWJlbCc6XG4gICAgICAgICAgICBjYXNlICdpdGVtbGluayc6XG4gICAgICAgICAgICBjYXNlICdpdGVtdGFyZ2V0JzpcbiAgICAgICAgICAgIGNhc2UgJ2l0ZW1jbGFzcyc6XG4gICAgICAgICAgICBjYXNlICdpdGVtY2hpbGRyZW4nOlxuICAgICAgICAgICAgY2FzZSAnb3JkZXJieSc6XG4gICAgICAgICAgICAgICAgLy8gY2FsbHMgcmVzZXRub2RlcyBtZXRob2QgYWZ0ZXIgNTBtcy4gYW55IGNhbGxzIHdpdGhpbiA1MG1zIHdpbGwgYmUgaWdub3JlZC5cbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNldE5vZGVzKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE5hdk5vZGUge1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgYWN0aW9uPzogYW55O1xuICAgIGJhZGdlPzogc3RyaW5nO1xuICAgIGNoaWxkcmVuPzogQXJyYXk8TmF2Tm9kZT47XG4gICAgY2xhc3M/OiBzdHJpbmc7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIGljb24/OiBzdHJpbmc7XG4gICAgaWQ/OiBzdHJpbmc7XG4gICAgbGluaz86IHN0cmluZztcbiAgICByb2xlPzogc3RyaW5nO1xuICAgIHZhbHVlPzogYW55O1xufVxuIl19