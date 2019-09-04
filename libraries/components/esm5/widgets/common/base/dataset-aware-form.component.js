import * as tslib_1 from "tslib";
import { Subject } from 'rxjs';
import { $appDigest, debounce, isDefined, isEqualWithFields, toBoolean } from '@wm/core';
import { convertDataToObject, extractDataAsArray, getOrderedDataset, getUniqObjsByDataField, transformData, transformDataWithKeys } from '../../../utils/form-utils';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { ALLFIELDS } from '../../../utils/data-utils';
var DatasetAwareFormComponent = /** @class */ (function (_super) {
    tslib_1.__extends(DatasetAwareFormComponent, _super);
    function DatasetAwareFormComponent(inj, WIDGET_CONFIG) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.datasetItems = [];
        _this.acceptsArray = false; // set to true if proxyModel on widget accepts array type.
        _this.dataset$ = new Subject();
        _this.datavalue$ = new Subject();
        _this.allowempty = true;
        _this._debounceDatavalueUpdation = _.debounce(function (values) {
            // if no item is found in datasetItems, wait untill the dataset updates by preserving the datavalue in toBeProcessedDatavalue.
            if (!isDefined(_this._modelByKey) || (_.isArray(_this._modelByKey) && !_this._modelByKey.length)) {
                _this.toBeProcessedDatavalue = values;
                _this._modelByValue = undefined;
            }
            else if (isDefined(_this.toBeProcessedDatavalue)) {
                // obtain the first array value when multiple is set to false.
                // set the modelByValue only when undefined.
                if (!isDefined(_this._modelByValue)) {
                    _this._modelByValue = (!_this.multiple && _.isArray(_this.toBeProcessedDatavalue)) ? _this.toBeProcessedDatavalue[0] : _this.toBeProcessedDatavalue;
                }
                _this.toBeProcessedDatavalue = undefined;
            }
            _this.initDisplayValues();
        }, 150);
        _this.binddisplayexpression = _this.nativeElement.getAttribute('displayexpression.bind');
        _this.binddisplayimagesrc = _this.nativeElement.getAttribute('displayimagesrc.bind');
        _this.binddisplaylabel = _this.nativeElement.getAttribute('displaylabel.bind');
        _this._debouncedInitDatasetItems = debounce(function () {
            _this.initDatasetItems();
            $appDigest();
        }, 150);
        return _this;
    }
    Object.defineProperty(DatasetAwareFormComponent.prototype, "modelByKey", {
        get: function () {
            return this._modelByKey;
        },
        // triggers on ngModel change. This function extracts the datavalue value.
        set: function (val) {
            this.selectByKey(val);
            // invoke on datavalue change.
            this.invokeOnChange(this._modelByValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DatasetAwareFormComponent.prototype, "datavalue", {
        get: function () {
            return this._modelByValue;
        },
        // triggers on setting the datavalue. This function extracts the model value.
        set: function (val) {
            if (this.multiple) {
                val = extractDataAsArray(val);
            }
            this._modelByValue = val;
            this.selectByValue(val);
            // changes on the datavalue can be subscribed using listenToDatavalue
            this.datavalue$.next(val);
            // invoke on datavalue change.
            this.invokeOnChange(val, undefined, true);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This function sets the _datavalue value from the model and sets the selected flag when item is found.
     * Here model is the value obtained from ngModel.
     * @param keys represent the model.
     */
    DatasetAwareFormComponent.prototype.selectByKey = function (keys) {
        var _this = this;
        this.resetDatasetItems();
        if (!this.datasetItems.length) {
            return;
        }
        if (this.multiple && !_.isArray(keys)) {
            keys = [keys];
        }
        // Set the _modelByKey to the modified keys.
        this._modelByKey = keys;
        if (this.multiple) {
            this._modelByValue = [];
            keys.forEach(function (key) {
                var itemByKey = _.find(_this.datasetItems, function (item) {
                    // not triple equal, as the instance type can be different.
                    // only value comparison should be done.
                    return _.toString(item.key) === _.toString(key);
                });
                if (itemByKey) {
                    itemByKey.selected = true;
                    _this._modelByValue = tslib_1.__spread(_this._modelByValue, [itemByKey.value]);
                }
            });
        }
        else {
            this._modelByValue = '';
            var itemByKey = _.find(this.datasetItems, function (item) {
                // not triple equal, as the instance type can be different.
                // only value comparison should be done.
                return _.toString(item.key) === _.toString(keys);
            });
            if (itemByKey) {
                itemByKey.selected = true;
                this._modelByValue = itemByKey.value;
            }
        }
        this.initDisplayValues();
    };
    /**
     * This function sets the _model value from the datavalue (selectedvalues) and sets the selected flag when item is found.
     * datavalue is the default value or a value representing the displayField (for suppose: object in case of ALLFIELDS).
     * If acceptsArray is true, the model always accepts an array.
     * For example, select always accepts model as array whether multiple select is true or false.
     * @param values represent the datavalue.
     */
    DatasetAwareFormComponent.prototype.selectByValue = function (values) {
        var _this = this;
        this.resetDatasetItems();
        // if datavalue is not defined or empty then set the model as undefined.
        if (!isDefined(values) || values === '' || _.isNull(values) || (values instanceof Array && !values.length)) {
            this._modelByKey = undefined;
            // do not return when allowempty is set to true.
            if (!this.allowempty || !isDefined(values)) {
                return;
            }
        }
        if (this.acceptsArray && !_.isArray(values)) {
            values = this.allowempty ? [values] : extractDataAsArray(values);
        }
        // preserve the datavalue if datasetItems are empty.
        if (!this.datasetItems.length && isDefined(values)) {
            this.toBeProcessedDatavalue = values;
            return;
        }
        var filterField = this.datafield === ALLFIELDS ? 'dataObject' : 'key';
        if (_.isArray(values)) {
            this._modelByKey = [];
            values.forEach(function (val) {
                var itemByValue = _.find(_this.datasetItems, function (item) {
                    if (filterField === 'dataObject') {
                        if (_this.compareby && _this.compareby.length) {
                            return isEqualWithFields(item[filterField], val, _this.compareby);
                        }
                    }
                    return (_.isObject(item.value) ? _.isEqual(item.value, val) : (_.toString(item.value)).toLowerCase() === (_.toString(val)).toLowerCase());
                });
                if (itemByValue) {
                    itemByValue.selected = true;
                    _this._modelByKey.push(itemByValue.key);
                }
            });
        }
        else {
            this._modelByKey = undefined;
            var itemByValue = _.find(this.datasetItems, function (item) {
                if (filterField === 'dataObject') {
                    if (_this.compareby && _this.compareby.length) {
                        return isEqualWithFields(item[filterField], values, _this.compareby);
                    }
                }
                return (_.isObject(item.value) ? _.isEqual(item.value, values) : (_.toString(item.value)).toLowerCase() === (_.toString(values)).toLowerCase());
            });
            if (itemByValue) {
                itemByValue.selected = true;
                this._modelByKey = itemByValue.key;
            }
        }
        // delaying the datavalue update as the widgets in liveform are having datavalue as undefined and not the default provided value
        // because datavalue is updated later when new dataset is available.
        this._debounceDatavalueUpdation(values);
    };
    // Updates the displayValue property.
    DatasetAwareFormComponent.prototype.initDisplayValues = function () {
        var displayValues = [];
        this.datasetItems.forEach(function (item) {
            if (item.selected) {
                displayValues.push(item.label);
            }
        });
        this.displayValue = this.multiple ? displayValues : displayValues[0];
    };
    // This function parses the dataset and extracts the displayOptions from parsed dataset.
    DatasetAwareFormComponent.prototype.initDatasetItems = function () {
        if (!this.dataset || _.isEmpty(this.dataset)) {
            this.datasetItems = [];
            return;
        }
        // convert any dataset to the object format.
        var orderedDataset = getOrderedDataset(convertDataToObject(this.dataset), this.orderby);
        if (this.usekeys) {
            this.datasetItems = transformDataWithKeys(orderedDataset);
        }
        else {
            var displayOptions = transformData(this.viewParent, orderedDataset, this.datafield, {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression || this.binddisplaylabel,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            });
            // get the unique objects out of the extracted data. Notify change in datasetItems using [...datasetItems] notation
            this.datasetItems = tslib_1.__spread(getUniqObjsByDataField(displayOptions, this.datafield, this.displayfield || this.displaylabel, toBoolean(this.allowempty)));
        }
        this.postDatasetItemsInit();
    };
    // Once the datasetItems are ready, set the proxyModel by using datavalue.
    DatasetAwareFormComponent.prototype.postDatasetItemsInit = function () {
        if (this.datasetItems.length && !this._defaultQueryInvoked) {
            // use the latest of toBeProcessedDatavalue, datavalue
            var _datavalue = !isDefined(this.toBeProcessedDatavalue) ? this.datavalue : this.toBeProcessedDatavalue;
            this.selectByValue(_datavalue);
        }
        // notify the dataset listeners
        this.dataset$.next(this.datasetItems);
    };
    // Reset the selected flag on datasetItems to false.
    DatasetAwareFormComponent.prototype.resetDatasetItems = function () {
        this.datasetItems.forEach(function (item) { return item.selected = false; });
    };
    DatasetAwareFormComponent.prototype.onPropertyChange = function (key, nv, ov) {
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
        switch (key) {
            case 'dataset':
            case 'datafield':
            case 'displayfield':
            case 'displaylabel':
            case 'displayexpression':
            case 'orderby':
            case 'usekeys':
                this._debouncedInitDatasetItems();
                break;
        }
    };
    return DatasetAwareFormComponent;
}(BaseFormCustomComponent));
export { DatasetAwareFormComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YXNldC1hd2FyZS1mb3JtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYmFzZS9kYXRhc2V0LWF3YXJlLWZvcm0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekYsT0FBTyxFQUFFLG1CQUFtQixFQUFlLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xMLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUl0RDtJQUF3RCxxREFBdUI7SUFpRTNFLG1DQUFzQixHQUFhLEVBQUUsYUFBYTtRQUFsRCxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FVNUI7UUExRE0sa0JBQVksR0FBa0IsRUFBRSxDQUFDO1FBQ2pDLGtCQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMsMERBQTBEO1FBQzdFLGNBQVEsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLGdCQUFVLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQVMzQixnQkFBVSxHQUFHLElBQUksQ0FBQztRQWtLVCxnQ0FBMEIsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQUMsTUFBTTtZQUM5RCw4SEFBOEg7WUFDOUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzNGLEtBQUksQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUM7Z0JBQ3JDLEtBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO2FBQ2xDO2lCQUFNLElBQUksU0FBUyxDQUFDLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO2dCQUMvQyw4REFBOEQ7Z0JBQzlELDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ2hDLEtBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEtBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxzQkFBc0IsQ0FBQztpQkFDbEo7Z0JBQ0QsS0FBSSxDQUFDLHNCQUFzQixHQUFHLFNBQVMsQ0FBQzthQUMzQztZQUVELEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQTNJSixLQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN2RixLQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUNuRixLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUU3RSxLQUFJLENBQUMsMEJBQTBCLEdBQUcsUUFBUSxDQUFDO1lBQ3ZDLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLFVBQVUsRUFBRSxDQUFDO1FBQ2pCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7SUFDWixDQUFDO0lBM0NELHNCQUFXLGlEQUFVO2FBQXJCO1lBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7UUFFRCwwRUFBMEU7YUFDMUUsVUFBc0IsR0FBUTtZQUMxQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXRCLDhCQUE4QjtZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM1QyxDQUFDOzs7T0FSQTtJQVVELHNCQUFXLGdEQUFTO2FBQXBCO1lBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzlCLENBQUM7UUFFRCw2RUFBNkU7YUFDN0UsVUFBcUIsR0FBUTtZQUN6QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2YsR0FBRyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pDO1lBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7WUFFekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV4QixxRUFBcUU7WUFDckUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFMUIsOEJBQThCO1lBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QyxDQUFDOzs7T0FoQkE7SUErQkQ7Ozs7T0FJRztJQUNPLCtDQUFXLEdBQXJCLFVBQXNCLElBQUk7UUFBMUIsaUJBd0NDO1FBdkNHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUMzQixPQUFPO1NBQ1Y7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25DLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsNENBQTRDO1FBQzVDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRXhCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2dCQUNaLElBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksRUFBRSxVQUFBLElBQUk7b0JBQzVDLDJEQUEyRDtvQkFDM0Qsd0NBQXdDO29CQUN4QyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BELENBQUMsQ0FBQyxDQUFDO2dCQUNILElBQUksU0FBUyxFQUFFO29CQUNYLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUMxQixLQUFJLENBQUMsYUFBYSxvQkFBTyxLQUFJLENBQUMsYUFBYSxHQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUMsQ0FBQztpQkFDakU7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQSxJQUFJO2dCQUM1QywyREFBMkQ7Z0JBQzNELHdDQUF3QztnQkFDeEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQzthQUN4QztTQUNKO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNPLGlEQUFhLEdBQXZCLFVBQXdCLE1BQXdCO1FBQWhELGlCQTBEQztRQXpERyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUV6Qix3RUFBd0U7UUFDeEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hHLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQzdCLGdEQUFnRDtZQUNoRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDeEMsT0FBTzthQUNWO1NBQ0o7UUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3pDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNwRTtRQUVELG9EQUFvRDtRQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2hELElBQUksQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUM7WUFDckMsT0FBTztTQUNWO1FBRUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRXhFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDZCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQSxJQUFJO29CQUM5QyxJQUFJLFdBQVcsS0FBSyxZQUFZLEVBQUU7d0JBQzlCLElBQUksS0FBSSxDQUFDLFNBQVMsSUFBSSxLQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTs0QkFDekMsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt5QkFDcEU7cUJBQ0o7b0JBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUM5SSxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLFdBQVcsRUFBRTtvQkFDYixXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDNUIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMxQztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQzdCLElBQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFBLElBQUk7Z0JBQzlDLElBQUksV0FBVyxLQUFLLFlBQVksRUFBRTtvQkFDOUIsSUFBSSxLQUFJLENBQUMsU0FBUyxJQUFJLEtBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO3dCQUN6QyxPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUN2RTtpQkFDSjtnQkFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDckosQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLFdBQVcsRUFBRTtnQkFDYixXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO2FBQ3RDO1NBQ0o7UUFDRCxnSUFBZ0k7UUFDaEksb0VBQW9FO1FBQ3BFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBbUJELHFDQUFxQztJQUMzQixxREFBaUIsR0FBM0I7UUFDSSxJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQzFCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsd0ZBQXdGO0lBQzlFLG9EQUFnQixHQUExQjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzFDLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLE9BQU87U0FDVjtRQUVELDRDQUE0QztRQUM1QyxJQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFGLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxZQUFZLEdBQUcscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDN0Q7YUFBTTtZQUNILElBQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsRixZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsWUFBWTtnQkFDcEQsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUI7Z0JBQ25DLGVBQWUsRUFBRSxJQUFJLENBQUMscUJBQXFCLElBQUksSUFBSSxDQUFDLGdCQUFnQjtnQkFDcEUsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtnQkFDM0MsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlO2FBQ3RDLENBQUMsQ0FBQztZQUNILG1IQUFtSDtZQUNuSCxJQUFJLENBQUMsWUFBWSxvQkFBTyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdko7UUFFRCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsMEVBQTBFO0lBQ2hFLHdEQUFvQixHQUE5QjtRQUNJLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDeEQsc0RBQXNEO1lBQ3RELElBQU0sVUFBVSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUM7WUFDMUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNsQztRQUNELCtCQUErQjtRQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELG9EQUFvRDtJQUMxQyxxREFBaUIsR0FBM0I7UUFDSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxFQUFyQixDQUFxQixDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELG9EQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQyxRQUFRLEdBQUcsRUFBRTtZQUNULEtBQUssU0FBUyxDQUFDO1lBQ2YsS0FBSyxXQUFXLENBQUM7WUFDakIsS0FBSyxjQUFjLENBQUM7WUFDcEIsS0FBSyxjQUFjLENBQUM7WUFDcEIsS0FBSyxtQkFBbUIsQ0FBQztZQUN6QixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssU0FBUztnQkFDVixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztnQkFDbEMsTUFBTTtTQUNiO0lBQ0wsQ0FBQztJQUNMLGdDQUFDO0FBQUQsQ0FBQyxBQXRSRCxDQUF3RCx1QkFBdUIsR0FzUjlFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBkZWJvdW5jZSwgaXNEZWZpbmVkLCBpc0VxdWFsV2l0aEZpZWxkcywgdG9Cb29sZWFuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBjb252ZXJ0RGF0YVRvT2JqZWN0LCBEYXRhU2V0SXRlbSwgZXh0cmFjdERhdGFBc0FycmF5LCBnZXRPcmRlcmVkRGF0YXNldCwgZ2V0VW5pcU9ianNCeURhdGFGaWVsZCwgdHJhbnNmb3JtRGF0YSwgdHJhbnNmb3JtRGF0YVdpdGhLZXlzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZm9ybS11dGlscyc7XG5pbXBvcnQgeyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCB9IGZyb20gJy4vYmFzZS1mb3JtLWN1c3RvbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgQUxMRklFTERTIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERhdGFzZXRBd2FyZUZvcm1Db21wb25lbnQgZXh0ZW5kcyBCYXNlRm9ybUN1c3RvbUNvbXBvbmVudCB7XG4gICAgcHVibGljIGRhdGFzZXQ6IGFueTtcbiAgICBwdWJsaWMgZGF0YWZpZWxkOiBzdHJpbmc7XG4gICAgcHVibGljIGRpc3BsYXlmaWVsZDogc3RyaW5nO1xuICAgIHB1YmxpYyBkaXNwbGF5bGFiZWw6IHN0cmluZztcbiAgICBwdWJsaWMgZGlzcGxheWltYWdlc3JjOiBzdHJpbmc7XG4gICAgcHVibGljIGRpc3BsYXlleHByZXNzaW9uOiBzdHJpbmc7XG4gICAgcHVibGljIHVzZWtleXM6IGJvb2xlYW47XG4gICAgcHVibGljIG9yZGVyYnk6IHN0cmluZztcbiAgICBwdWJsaWMgbXVsdGlwbGU6IGJvb2xlYW47XG4gICAgcHVibGljIHJlYWRvbmx5OiBib29sZWFuO1xuXG4gICAgcHVibGljIGJpbmRkaXNwbGF5ZXhwcmVzc2lvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBiaW5kZGlzcGxheWltYWdlc3JjOiBzdHJpbmc7XG4gICAgcHVibGljIGJpbmRkaXNwbGF5bGFiZWw6IHN0cmluZztcblxuICAgIHB1YmxpYyBkaXNwbGF5VmFsdWU6IEFycmF5PHN0cmluZz4gfCBzdHJpbmc7XG5cbiAgICBwdWJsaWMgZGF0YXNldEl0ZW1zOiBEYXRhU2V0SXRlbVtdID0gW107XG4gICAgcHVibGljIGFjY2VwdHNBcnJheSA9IGZhbHNlOyAvLyBzZXQgdG8gdHJ1ZSBpZiBwcm94eU1vZGVsIG9uIHdpZGdldCBhY2NlcHRzIGFycmF5IHR5cGUuXG4gICAgcHJvdGVjdGVkIGRhdGFzZXQkID0gbmV3IFN1YmplY3QoKTtcbiAgICBwcm90ZWN0ZWQgZGF0YXZhbHVlJCA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICBwcm90ZWN0ZWQgX21vZGVsQnlLZXk6IGFueTtcbiAgICBwdWJsaWMgX21vZGVsQnlWYWx1ZTogYW55O1xuICAgIHB1YmxpYyBfZGVmYXVsdFF1ZXJ5SW52b2tlZDogYm9vbGVhbjsgLy8gZm9yIHNlYXJjaC9jaGlwcyBpZiBkYXRhdmFsdWUgaXMgb2J0YWluZWQgZnJvbSB0aGUgZGVmYXVsdCBuL3cgY2FsbCB0aGVuIHNldCB0byB0cnVlIGFuZCBkbyBub3QgdXBkYXRlIHRoZSBtb2RlbEJ5S2V5cy5cblxuICAgIC8vIHRoaXMgZmllbGQgY29udGFpbnMgdGhlIGluaXRpYWwgZGF0YXZhbHVlIHdoaWNoIG5lZWRzIHRvIGJlIHByb2Nlc3NlZCBvbmNlIHRoZSBkYXRhc2V0IGlzIGF2YWlsYWJsZVxuICAgIHB1YmxpYyB0b0JlUHJvY2Vzc2VkRGF0YXZhbHVlOiBhbnk7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGVib3VuY2VkSW5pdERhdGFzZXRJdGVtczogRnVuY3Rpb247XG4gICAgcHJvdGVjdGVkIGFsbG93ZW1wdHkgPSB0cnVlO1xuICAgIHB1YmxpYyBjb21wYXJlYnk6IGFueTtcblxuICAgIHB1YmxpYyBnZXQgbW9kZWxCeUtleSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsQnlLZXk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlcnMgb24gbmdNb2RlbCBjaGFuZ2UuIFRoaXMgZnVuY3Rpb24gZXh0cmFjdHMgdGhlIGRhdGF2YWx1ZSB2YWx1ZS5cbiAgICBwdWJsaWMgc2V0IG1vZGVsQnlLZXkodmFsOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RCeUtleSh2YWwpO1xuXG4gICAgICAgIC8vIGludm9rZSBvbiBkYXRhdmFsdWUgY2hhbmdlLlxuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHRoaXMuX21vZGVsQnlWYWx1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkYXRhdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2RlbEJ5VmFsdWU7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlcnMgb24gc2V0dGluZyB0aGUgZGF0YXZhbHVlLiBUaGlzIGZ1bmN0aW9uIGV4dHJhY3RzIHRoZSBtb2RlbCB2YWx1ZS5cbiAgICBwdWJsaWMgc2V0IGRhdGF2YWx1ZSh2YWw6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgICAgICAgdmFsID0gZXh0cmFjdERhdGFBc0FycmF5KHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gdmFsO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0QnlWYWx1ZSh2YWwpO1xuXG4gICAgICAgIC8vIGNoYW5nZXMgb24gdGhlIGRhdGF2YWx1ZSBjYW4gYmUgc3Vic2NyaWJlZCB1c2luZyBsaXN0ZW5Ub0RhdGF2YWx1ZVxuICAgICAgICB0aGlzLmRhdGF2YWx1ZSQubmV4dCh2YWwpO1xuXG4gICAgICAgIC8vIGludm9rZSBvbiBkYXRhdmFsdWUgY2hhbmdlLlxuICAgICAgICB0aGlzLmludm9rZU9uQ2hhbmdlKHZhbCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoaW5qOiBJbmplY3RvciwgV0lER0VUX0NPTkZJRykge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuXG4gICAgICAgIHRoaXMuYmluZGRpc3BsYXlleHByZXNzaW9uID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGlzcGxheWV4cHJlc3Npb24uYmluZCcpO1xuICAgICAgICB0aGlzLmJpbmRkaXNwbGF5aW1hZ2VzcmMgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXNwbGF5aW1hZ2VzcmMuYmluZCcpO1xuICAgICAgICB0aGlzLmJpbmRkaXNwbGF5bGFiZWwgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkaXNwbGF5bGFiZWwuYmluZCcpO1xuXG4gICAgICAgIHRoaXMuX2RlYm91bmNlZEluaXREYXRhc2V0SXRlbXMgPSBkZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluaXREYXRhc2V0SXRlbXMoKTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfSwgMTUwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIF9kYXRhdmFsdWUgdmFsdWUgZnJvbSB0aGUgbW9kZWwgYW5kIHNldHMgdGhlIHNlbGVjdGVkIGZsYWcgd2hlbiBpdGVtIGlzIGZvdW5kLlxuICAgICAqIEhlcmUgbW9kZWwgaXMgdGhlIHZhbHVlIG9idGFpbmVkIGZyb20gbmdNb2RlbC5cbiAgICAgKiBAcGFyYW0ga2V5cyByZXByZXNlbnQgdGhlIG1vZGVsLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZWxlY3RCeUtleShrZXlzKSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhc2V0SXRlbXMoKTtcblxuICAgICAgICBpZiAoIXRoaXMuZGF0YXNldEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubXVsdGlwbGUgJiYgIV8uaXNBcnJheShrZXlzKSkge1xuICAgICAgICAgICAga2V5cyA9IFtrZXlzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgX21vZGVsQnlLZXkgdG8gdGhlIG1vZGlmaWVkIGtleXMuXG4gICAgICAgIHRoaXMuX21vZGVsQnlLZXkgPSBrZXlzO1xuXG4gICAgICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XG4gICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSBbXTtcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1CeUtleSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywgaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdCB0cmlwbGUgZXF1YWwsIGFzIHRoZSBpbnN0YW5jZSB0eXBlIGNhbiBiZSBkaWZmZXJlbnQuXG4gICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgdmFsdWUgY29tcGFyaXNvbiBzaG91bGQgYmUgZG9uZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8udG9TdHJpbmcoaXRlbS5rZXkpID09PSBfLnRvU3RyaW5nKGtleSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1CeUtleSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtQnlLZXkuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSBbLi4udGhpcy5fbW9kZWxCeVZhbHVlLCBpdGVtQnlLZXkudmFsdWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gJyc7XG4gICAgICAgICAgICBjb25zdCBpdGVtQnlLZXkgPSBfLmZpbmQodGhpcy5kYXRhc2V0SXRlbXMsIGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIC8vIG5vdCB0cmlwbGUgZXF1YWwsIGFzIHRoZSBpbnN0YW5jZSB0eXBlIGNhbiBiZSBkaWZmZXJlbnQuXG4gICAgICAgICAgICAgICAgLy8gb25seSB2YWx1ZSBjb21wYXJpc29uIHNob3VsZCBiZSBkb25lLlxuICAgICAgICAgICAgICAgIHJldHVybiBfLnRvU3RyaW5nKGl0ZW0ua2V5KSA9PT0gXy50b1N0cmluZyhrZXlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGl0ZW1CeUtleSkge1xuICAgICAgICAgICAgICAgIGl0ZW1CeUtleS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gaXRlbUJ5S2V5LnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdERpc3BsYXlWYWx1ZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNldHMgdGhlIF9tb2RlbCB2YWx1ZSBmcm9tIHRoZSBkYXRhdmFsdWUgKHNlbGVjdGVkdmFsdWVzKSBhbmQgc2V0cyB0aGUgc2VsZWN0ZWQgZmxhZyB3aGVuIGl0ZW0gaXMgZm91bmQuXG4gICAgICogZGF0YXZhbHVlIGlzIHRoZSBkZWZhdWx0IHZhbHVlIG9yIGEgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBkaXNwbGF5RmllbGQgKGZvciBzdXBwb3NlOiBvYmplY3QgaW4gY2FzZSBvZiBBTExGSUVMRFMpLlxuICAgICAqIElmIGFjY2VwdHNBcnJheSBpcyB0cnVlLCB0aGUgbW9kZWwgYWx3YXlzIGFjY2VwdHMgYW4gYXJyYXkuXG4gICAgICogRm9yIGV4YW1wbGUsIHNlbGVjdCBhbHdheXMgYWNjZXB0cyBtb2RlbCBhcyBhcnJheSB3aGV0aGVyIG11bHRpcGxlIHNlbGVjdCBpcyB0cnVlIG9yIGZhbHNlLlxuICAgICAqIEBwYXJhbSB2YWx1ZXMgcmVwcmVzZW50IHRoZSBkYXRhdmFsdWUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNlbGVjdEJ5VmFsdWUodmFsdWVzOiBBcnJheTxhbnk+IHwgYW55KSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhc2V0SXRlbXMoKTtcblxuICAgICAgICAvLyBpZiBkYXRhdmFsdWUgaXMgbm90IGRlZmluZWQgb3IgZW1wdHkgdGhlbiBzZXQgdGhlIG1vZGVsIGFzIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodmFsdWVzKSB8fCB2YWx1ZXMgPT09ICcnIHx8IF8uaXNOdWxsKHZhbHVlcykgfHwgKHZhbHVlcyBpbnN0YW5jZW9mIEFycmF5ICYmICF2YWx1ZXMubGVuZ3RoKSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeUtleSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIC8vIGRvIG5vdCByZXR1cm4gd2hlbiBhbGxvd2VtcHR5IGlzIHNldCB0byB0cnVlLlxuICAgICAgICAgICAgaWYgKCF0aGlzLmFsbG93ZW1wdHkgfHwgIWlzRGVmaW5lZCh2YWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYWNjZXB0c0FycmF5ICYmICFfLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5hbGxvd2VtcHR5ID8gW3ZhbHVlc10gOiBleHRyYWN0RGF0YUFzQXJyYXkodmFsdWVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHByZXNlcnZlIHRoZSBkYXRhdmFsdWUgaWYgZGF0YXNldEl0ZW1zIGFyZSBlbXB0eS5cbiAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGggJiYgaXNEZWZpbmVkKHZhbHVlcykpIHtcbiAgICAgICAgICAgIHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSA9IHZhbHVlcztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbHRlckZpZWxkID0gdGhpcy5kYXRhZmllbGQgPT09IEFMTEZJRUxEUyA/ICdkYXRhT2JqZWN0JyA6ICdrZXknO1xuXG4gICAgICAgIGlmIChfLmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeUtleSA9IFtdO1xuICAgICAgICAgICAgdmFsdWVzLmZvckVhY2godmFsID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtQnlWYWx1ZSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywgaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJGaWVsZCA9PT0gJ2RhdGFPYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlYnkgJiYgdGhpcy5jb21wYXJlYnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzRXF1YWxXaXRoRmllbGRzKGl0ZW1bZmlsdGVyRmllbGRdLCB2YWwsIHRoaXMuY29tcGFyZWJ5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKF8uaXNPYmplY3QoaXRlbS52YWx1ZSkgPyBfLmlzRXF1YWwoaXRlbS52YWx1ZSwgdmFsKSA6IChfLnRvU3RyaW5nKGl0ZW0udmFsdWUpKS50b0xvd2VyQ2FzZSgpID09PSAoXy50b1N0cmluZyh2YWwpKS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbUJ5VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbUJ5VmFsdWUuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5LnB1c2goaXRlbUJ5VmFsdWUua2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21vZGVsQnlLZXkgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBpdGVtQnlWYWx1ZSA9IF8uZmluZCh0aGlzLmRhdGFzZXRJdGVtcywgaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlckZpZWxkID09PSAnZGF0YU9iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZWJ5ICYmIHRoaXMuY29tcGFyZWJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzRXF1YWxXaXRoRmllbGRzKGl0ZW1bZmlsdGVyRmllbGRdLCB2YWx1ZXMsIHRoaXMuY29tcGFyZWJ5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKF8uaXNPYmplY3QoaXRlbS52YWx1ZSkgID8gXy5pc0VxdWFsKGl0ZW0udmFsdWUsIHZhbHVlcykgOiAoXy50b1N0cmluZyhpdGVtLnZhbHVlKSkudG9Mb3dlckNhc2UoKSA9PT0gKF8udG9TdHJpbmcodmFsdWVzKSkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpdGVtQnlWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1CeVZhbHVlLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5S2V5ID0gaXRlbUJ5VmFsdWUua2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGRlbGF5aW5nIHRoZSBkYXRhdmFsdWUgdXBkYXRlIGFzIHRoZSB3aWRnZXRzIGluIGxpdmVmb3JtIGFyZSBoYXZpbmcgZGF0YXZhbHVlIGFzIHVuZGVmaW5lZCBhbmQgbm90IHRoZSBkZWZhdWx0IHByb3ZpZGVkIHZhbHVlXG4gICAgICAgIC8vIGJlY2F1c2UgZGF0YXZhbHVlIGlzIHVwZGF0ZWQgbGF0ZXIgd2hlbiBuZXcgZGF0YXNldCBpcyBhdmFpbGFibGUuXG4gICAgICAgIHRoaXMuX2RlYm91bmNlRGF0YXZhbHVlVXBkYXRpb24odmFsdWVzKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RlYm91bmNlRGF0YXZhbHVlVXBkYXRpb24gPSBfLmRlYm91bmNlKCh2YWx1ZXMpID0+IHtcbiAgICAgICAgLy8gaWYgbm8gaXRlbSBpcyBmb3VuZCBpbiBkYXRhc2V0SXRlbXMsIHdhaXQgdW50aWxsIHRoZSBkYXRhc2V0IHVwZGF0ZXMgYnkgcHJlc2VydmluZyB0aGUgZGF0YXZhbHVlIGluIHRvQmVQcm9jZXNzZWREYXRhdmFsdWUuXG4gICAgICAgIGlmICghaXNEZWZpbmVkKHRoaXMuX21vZGVsQnlLZXkpIHx8IChfLmlzQXJyYXkodGhpcy5fbW9kZWxCeUtleSkgJiYgIXRoaXMuX21vZGVsQnlLZXkubGVuZ3RoKSkge1xuICAgICAgICAgICAgdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlID0gdmFsdWVzO1xuICAgICAgICAgICAgdGhpcy5fbW9kZWxCeVZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGVmaW5lZCh0aGlzLnRvQmVQcm9jZXNzZWREYXRhdmFsdWUpKSB7XG4gICAgICAgICAgICAvLyBvYnRhaW4gdGhlIGZpcnN0IGFycmF5IHZhbHVlIHdoZW4gbXVsdGlwbGUgaXMgc2V0IHRvIGZhbHNlLlxuICAgICAgICAgICAgLy8gc2V0IHRoZSBtb2RlbEJ5VmFsdWUgb25seSB3aGVuIHVuZGVmaW5lZC5cbiAgICAgICAgICAgIGlmICghaXNEZWZpbmVkKHRoaXMuX21vZGVsQnlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb2RlbEJ5VmFsdWUgPSAoIXRoaXMubXVsdGlwbGUgJiYgXy5pc0FycmF5KHRoaXMudG9CZVByb2Nlc3NlZERhdGF2YWx1ZSkpID8gdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlWzBdIDogdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbml0RGlzcGxheVZhbHVlcygpO1xuICAgIH0sIDE1MCk7XG5cbiAgICAvLyBVcGRhdGVzIHRoZSBkaXNwbGF5VmFsdWUgcHJvcGVydHkuXG4gICAgcHJvdGVjdGVkIGluaXREaXNwbGF5VmFsdWVzKCkge1xuICAgICAgICBjb25zdCBkaXNwbGF5VmFsdWVzID0gW107XG4gICAgICAgIHRoaXMuZGF0YXNldEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbS5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlWYWx1ZXMucHVzaChpdGVtLmxhYmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5VmFsdWUgPSB0aGlzLm11bHRpcGxlID8gZGlzcGxheVZhbHVlcyA6IGRpc3BsYXlWYWx1ZXNbMF07XG4gICAgfVxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBwYXJzZXMgdGhlIGRhdGFzZXQgYW5kIGV4dHJhY3RzIHRoZSBkaXNwbGF5T3B0aW9ucyBmcm9tIHBhcnNlZCBkYXRhc2V0LlxuICAgIHByb3RlY3RlZCBpbml0RGF0YXNldEl0ZW1zKCkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YXNldCB8fCBfLmlzRW1wdHkodGhpcy5kYXRhc2V0KSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhc2V0SXRlbXMgPSBbXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnZlcnQgYW55IGRhdGFzZXQgdG8gdGhlIG9iamVjdCBmb3JtYXQuXG4gICAgICAgIGNvbnN0IG9yZGVyZWREYXRhc2V0ID0gZ2V0T3JkZXJlZERhdGFzZXQoY29udmVydERhdGFUb09iamVjdCh0aGlzLmRhdGFzZXQpLCB0aGlzLm9yZGVyYnkpO1xuXG4gICAgICAgIGlmICh0aGlzLnVzZWtleXMpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YXNldEl0ZW1zID0gdHJhbnNmb3JtRGF0YVdpdGhLZXlzKG9yZGVyZWREYXRhc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlPcHRpb25zID0gdHJhbnNmb3JtRGF0YSh0aGlzLnZpZXdQYXJlbnQsIG9yZGVyZWREYXRhc2V0LCB0aGlzLmRhdGFmaWVsZCwge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlGaWVsZDogdGhpcy5kaXNwbGF5ZmllbGQgfHwgdGhpcy5kaXNwbGF5bGFiZWwsXG4gICAgICAgICAgICAgICAgZGlzcGxheUV4cHI6IHRoaXMuZGlzcGxheWV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgYmluZERpc3BsYXlFeHByOiB0aGlzLmJpbmRkaXNwbGF5ZXhwcmVzc2lvbiB8fCB0aGlzLmJpbmRkaXNwbGF5bGFiZWwsXG4gICAgICAgICAgICAgICAgYmluZERpc3BsYXlJbWdTcmM6IHRoaXMuYmluZGRpc3BsYXlpbWFnZXNyYyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5SW1nU3JjOiB0aGlzLmRpc3BsYXlpbWFnZXNyY1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBnZXQgdGhlIHVuaXF1ZSBvYmplY3RzIG91dCBvZiB0aGUgZXh0cmFjdGVkIGRhdGEuIE5vdGlmeSBjaGFuZ2UgaW4gZGF0YXNldEl0ZW1zIHVzaW5nIFsuLi5kYXRhc2V0SXRlbXNdIG5vdGF0aW9uXG4gICAgICAgICAgICB0aGlzLmRhdGFzZXRJdGVtcyA9IFsuLi5nZXRVbmlxT2Jqc0J5RGF0YUZpZWxkKGRpc3BsYXlPcHRpb25zLCB0aGlzLmRhdGFmaWVsZCwgdGhpcy5kaXNwbGF5ZmllbGQgfHwgdGhpcy5kaXNwbGF5bGFiZWwsIHRvQm9vbGVhbih0aGlzLmFsbG93ZW1wdHkpKV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBvc3REYXRhc2V0SXRlbXNJbml0KCk7XG4gICAgfVxuXG4gICAgLy8gT25jZSB0aGUgZGF0YXNldEl0ZW1zIGFyZSByZWFkeSwgc2V0IHRoZSBwcm94eU1vZGVsIGJ5IHVzaW5nIGRhdGF2YWx1ZS5cbiAgICBwcm90ZWN0ZWQgcG9zdERhdGFzZXRJdGVtc0luaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFzZXRJdGVtcy5sZW5ndGggJiYgIXRoaXMuX2RlZmF1bHRRdWVyeUludm9rZWQpIHtcbiAgICAgICAgICAgIC8vIHVzZSB0aGUgbGF0ZXN0IG9mIHRvQmVQcm9jZXNzZWREYXRhdmFsdWUsIGRhdGF2YWx1ZVxuICAgICAgICAgICAgY29uc3QgX2RhdGF2YWx1ZSA9ICFpc0RlZmluZWQodGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlKSA/IHRoaXMuZGF0YXZhbHVlIDogdGhpcy50b0JlUHJvY2Vzc2VkRGF0YXZhbHVlO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RCeVZhbHVlKF9kYXRhdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5vdGlmeSB0aGUgZGF0YXNldCBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5kYXRhc2V0JC5uZXh0KHRoaXMuZGF0YXNldEl0ZW1zKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgc2VsZWN0ZWQgZmxhZyBvbiBkYXRhc2V0SXRlbXMgdG8gZmFsc2UuXG4gICAgcHJvdGVjdGVkIHJlc2V0RGF0YXNldEl0ZW1zKCkge1xuICAgICAgICB0aGlzLmRhdGFzZXRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RhdGFzZXQnOlxuICAgICAgICAgICAgY2FzZSAnZGF0YWZpZWxkJzpcbiAgICAgICAgICAgIGNhc2UgJ2Rpc3BsYXlmaWVsZCc6XG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5bGFiZWwnOlxuICAgICAgICAgICAgY2FzZSAnZGlzcGxheWV4cHJlc3Npb24nOlxuICAgICAgICAgICAgY2FzZSAnb3JkZXJieSc6XG4gICAgICAgICAgICBjYXNlICd1c2VrZXlzJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJvdW5jZWRJbml0RGF0YXNldEl0ZW1zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=