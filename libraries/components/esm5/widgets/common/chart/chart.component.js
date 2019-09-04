import * as tslib_1 from "tslib";
import { Component, HostBinding, Injector, ViewEncapsulation } from '@angular/core';
import { App, DataSource, getClonedObject, isDataSourceEqual, isEmptyObject, isNumberType, prettifyLabels, removeAttr, triggerFn } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './chart.props';
import { allShapes, getDateList, getSampleData, initChart, isAreaChart, isAxisDomainValid, isBarChart, isBubbleChart, isChartDataArray, isChartDataJSON, isLineTypeChart, isPieType, postPlotChartProcess } from './chart.utils';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var WIDGET_CONFIG = { widgetType: 'wm-chart', hostClass: 'app-chart' };
var options = {
    'Bubble': ['bubblesize', 'shape']
}, NONE = 'none', advanceDataProps = ['aggregation', 'aggregationcolumn', 'groupby', 'orderby'], 
// XPaths to get actual data of data points in charts
chartDataPointXpath = {
    'Column': 'rect.nv-bar',
    'Bar': 'g.nv-bar',
    'Area': '.nv-stackedarea .nv-point',
    'Cumulative Line': '.nv-cumulativeLine .nv-scatterWrap path.nv-point',
    'Line': '.nv-lineChart .nv-scatterWrap path.nv-point',
    'Pie': '.nv-pieChart .nv-slice path',
    'Donut': '.nv-pieChart .nv-slice path',
    'Bubble': '.nv-scatterChart .nv-point-paths path'
}, 
// all properties of the chart
allOptions = ['bubblesize', 'shape'], styleProps = {
    'fontunit': 'font-size',
    'fontsize': 'font-size',
    'color': 'fill',
    'fontfamily': 'font-family',
    'fontweight': 'font-weight',
    'fontstyle': 'font-style',
    'textdecoration': 'text-decoration'
}, 
// Getting the relevant aggregation function based on the selected option
aggregationFnMap = {
    'average': 'AVG',
    'count': 'COUNT',
    'maximum': 'MAX',
    'minimum': 'MIN',
    'sum': 'SUM'
};
var getBooleanValue = function (val) {
    if (val === true || val === 'true') {
        return true;
    }
    if (val === false || val === 'false') {
        return false;
    }
    return val;
};
var ɵ0 = getBooleanValue;
// returns orderby columns and their orders in two separate arrays
var getLodashOrderByFormat = function (orderby) {
    var columns;
    var orderByColumns = [], orders = [];
    _.forEach(_.split(orderby, ','), function (col) {
        columns = _.split(col, ':');
        orderByColumns.push(columns[0]);
        orders.push(columns[1]);
    });
    return {
        'columns': orderByColumns,
        'orders': orders
    };
};
var ɵ1 = getLodashOrderByFormat;
// Replacing the '.' by the '$' because '.' is not supported in the alias names
var getValidAliasName = function (aliasName) { return aliasName ? aliasName.replace(/\./g, '$') : null; };
var ɵ2 = getValidAliasName;
// Applying the font related styles for the chart
var setTextStyle = function (properties, id) {
    var charttext = d3.select('#wmChart' + id + ' svg').selectAll('text');
    charttext.style(properties);
};
var ɵ3 = setTextStyle;
var angle = function (d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
};
var ɵ4 = angle;
var ChartComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ChartComponent, _super);
    function ChartComponent(inj, app) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.app = app;
        _this.iconclass = '';
        _this.nonPrimaryColumns = [];
        _this.xDataKeyArr = [];
        _this.chartData = [];
        _this._processedData = [];
        _this._plotChartProxy = _.debounce(_this.plotChartProxy.bind(_this), 100);
        _this.redraw = _this._plotChartProxy.bind(_this);
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER, ['fontsize', 'fontunit', 'color', 'fontfamily', 'fontweight', 'fontstyle', 'textdecoration']);
        // generate unique id for the component
        _this.$id = _this.widgetId || Math.random();
        // remove title attribute as the element on hover shows you the hint through-out the element
        removeAttr(_this.nativeElement, 'title');
        _this.chartReady = false;
        _this.binddataset = _this.nativeElement.getAttribute('dataset.bind');
        // Show loading status based on the variable life cycle
        _this.app.subscribe('toggle-variable-state', _this.handleLoading.bind(_this));
        return _this;
    }
    ChartComponent.prototype.isGroupByEnabled = function () {
        return !!(this.groupby && this.groupby !== NONE);
    };
    // Check if x and y axis that are chosen are valid to plot chart
    ChartComponent.prototype.isValidAxis = function () {
        // Check if x axis and y axis are chosen and are not equal
        return this.binddataset ? (this.xaxisdatakey && this.yaxisdatakey) : true;
    };
    // Check if aggregation is chosen
    ChartComponent.prototype.isAggregationEnabled = function () {
        return !!((this.isGroupByEnabled() && this.aggregation !== NONE && this.aggregationcolumn));
    };
    // Check if either groupby, aggregation or orderby is chosen
    ChartComponent.prototype.isDataFilteringEnabled = function () {
        /*Query need to be triggered if any of the following cases satisfy
        * 1. Group By and aggregation both chosen
        * 2. Only Order By is chosen
        * */
        return this.isAggregationEnabled() || (!this.isVisuallyGrouped && this.orderby);
    };
    /*Charts like Line,Area,Cumulative Line does not support any other datatype
        other than integer unlike the column and bar.It is a nvd3 issue. Inorder to
        support that this is a fix*/
    ChartComponent.prototype.getxAxisVal = function (dataObj, xKey, index) {
        var value = _.get(dataObj, xKey);
        // If x axis is other than number type then add indexes
        if (isLineTypeChart(this.type) && !isNumberType(this.xAxisDataType)) {
            // Verification to get the unique data keys
            this.xDataKeyArr.push(value);
            return index;
        }
        return value;
    };
    // Getting the min and max values among all the x values
    ChartComponent.prototype.getXMinMaxValues = function (datum) {
        if (!datum) {
            return;
        }
        var xValues = {};
        /*
         compute the min x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            min x: 1
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            min x: 10
        */
        xValues.min = _.minBy(datum.values, function (dataObject) { return dataObject.x || dataObject[0]; });
        /*
         compute the max x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            max x: 3
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            max x: 30
         */
        xValues.max = _.maxBy(datum.values, function (dataObject) { return dataObject.x || dataObject[0]; });
        return xValues;
    };
    // Getting the min and max values among all the y values
    ChartComponent.prototype.getYMinMaxValues = function (datum) {
        var yValues = {}, minValues = [], maxValues = [];
        if (!datum) {
            return;
        }
        /*
         Getting the min and max y values among all the series of data
         compute the min y value
         eg: When data has objects
            input: [[{x:1, y:2}, {x:2, y:3}, {x:3, y:4}], [{x:2, y:3}, {x:3, y:4}, {x:4, y:5}]]
            min y values : '2'(among first set) & '3'(among second set)
            max y values : '4'(among first set) & '5'(among second set)

         eg: When data has arrays
            input: [[[10, 20], [20, 30], [30, 40]], [[20, 30], [30, 40], [40, 50]]]
            min y values : '20'(among first set) & '30'(among second set)
            max y values : '40'(among first set) & '50'(among second set)
         */
        _.forEach(datum, function (data) {
            minValues.push(_.minBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
            maxValues.push(_.maxBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
        });
        // Gets the least and highest values among all the min and max values of respective series of data
        yValues.min = _.minBy(minValues, function (dataObject) { return dataObject.y || dataObject[1]; });
        yValues.max = _.maxBy(maxValues, function (dataObject) { return dataObject.y || dataObject[1]; });
        return yValues;
    };
    // If the x-axis values are undefined, we return empty array else we return the values
    ChartComponent.prototype.getValidData = function (values) {
        return (values.length === 1 && values[0] === undefined) ? [] : values;
    };
    // Returns the single data point based on the type of the data chart accepts
    ChartComponent.prototype.valueFinder = function (dataObj, xKey, yKey, index, shape) {
        var xVal = this.getxAxisVal(dataObj, xKey, index), value = _.get(dataObj, yKey), yVal = parseFloat(value) || value, size = parseFloat(dataObj[this.bubblesize]) || 2;
        var dataPoint = {};
        if (isChartDataJSON(this.type)) {
            dataPoint.x = xVal;
            dataPoint.y = yVal;
            // only Bubble chart has the third dimension
            if (isBubbleChart(this.type)) {
                dataPoint.size = size;
                dataPoint.shape = shape || 'circle';
            }
        }
        else if (isChartDataArray(this.type)) {
            dataPoint = [xVal, yVal];
        }
        // Adding actual unwrapped data to chart data to use at the time of selected data point of chart event
        dataPoint._dataObj = dataObj;
        return dataPoint;
    };
    // Setting appropriate error messages
    ChartComponent.prototype.setErrMsg = function (message) {
        if (this.showNoDataMsg) {
            this.showContentLoadError = true;
            this.invalidConfig = true;
            // TODO: Set the locale from the message
            this.errMsg = ''; // $rootScope.locale[message];
        }
    };
    ChartComponent.prototype.processChartData = function () {
        var _this = this;
        this.sampleData = getSampleData(this);
        // scope variables used to keep the actual key values for x-axis
        this.xDataKeyArr = [];
        // Plotting the chart with sample data when the chart dataset is not bound
        if (!this.binddataset) {
            this.xDataKeyArr = getDateList();
            return this.sampleData;
        }
        if (!this.chartData || !this.chartData.length) {
            return [];
        }
        var datum = [], yAxisKey, shapes = [], values = [];
        var xAxisKey = this.xaxisdatakey, yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [], dataSet = this.chartData;
        if (_.isArray(dataSet)) {
            if (isPieType(this.type)) {
                yAxisKey = yAxisKeys[0];
                datum = _.map(dataSet, function (dataObj, index) {
                    if (!isEmptyObject(dataSet[index])) {
                        return _this.valueFinder(dataSet[index], xAxisKey, yAxisKey);
                    }
                });
                datum = this.getValidData(datum);
            }
            else {
                if (isBubbleChart(this.type)) {
                    shapes = this.shape === 'random' ? allShapes : this.shape;
                }
                yAxisKeys.forEach(function (yAxisKey, series) {
                    values = _.map(dataSet, function (dataObj, index) {
                        if (!isEmptyObject(dataSet[index])) {
                            return _this.valueFinder(dataSet[index], xAxisKey, yAxisKey, index, (_.isArray(shapes) && shapes[series]) || _this.shape);
                        }
                    });
                    values = _this.getValidData(values);
                    datum.push({
                        values: values,
                        key: prettifyLabels(yAxisKey)
                    });
                });
            }
        }
        return datum;
    };
    ChartComponent.prototype.setChartData = function (data) {
        if (data) {
            this._processedData = data;
        }
    };
    ChartComponent.prototype.getChartData = function () {
        return this._processedData;
    };
    // constructing the grouped data based on the selection of orderby, x & y axis
    ChartComponent.prototype.getVisuallyGroupedData = function (queryResponse, groupingColumn) {
        var _this = this;
        var groupData = {}, groupValues = [], orderByDetails, maxLength;
        var chartData = [], _isAreaChart = isAreaChart(this.type), yAxisKey = _.first(_.split(this.yaxisdatakey, ','));
        this.xDataKeyArr = [];
        queryResponse = _.orderBy(queryResponse, _.split(this.groupby, ','));
        if (this.orderby) {
            orderByDetails = getLodashOrderByFormat(this.orderby);
            queryResponse = _.orderBy(queryResponse, orderByDetails.columns, orderByDetails.orders);
        }
        queryResponse = _.groupBy(queryResponse, groupingColumn);
        // In case of area chart all the series data should be of same length
        if (_isAreaChart) {
            maxLength = _.max(_.map(queryResponse, function (obj) { return obj.length; }));
        }
        _.forEach(queryResponse, function (values, groupKey) {
            groupValues = isAreaChart ? _.fill(new Array(maxLength), [0, 0]) : [];
            _.forEachRight(values, function (value, index) {
                groupValues[index] = _this.valueFinder(value, _this.xaxisdatakey, yAxisKey, index);
            });
            groupData = {
                key: groupKey,
                values: groupValues
            };
            chartData.push(groupData);
        });
        return chartData;
    };
    /*Decides whether the data should be visually grouped or not
            Visually grouped when a different column is choosen in the group by other than x and y axis and aggregation is not chosen*/
    ChartComponent.prototype.getGroupingDetails = function () {
        var _this = this;
        if (this.isGroupByEnabled() && !this.isAggregationEnabled()) {
            var isVisuallyGrouped_1 = false, visualGroupingColumn_1, groupingExpression = void 0, columns_1 = [], groupingColumnIndex_1;
            var groupbyColumns_1 = this.groupby && this.groupby !== NONE ? this.groupby.split(',') : [], yAxisKeys_1 = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [];
            if (groupbyColumns_1.length > 1) {
                /*Getting the group by column which is not selected either in x or y axis*/
                groupbyColumns_1.every(function (column, index) {
                    if (_this.xaxisdatakey !== column && $.inArray(column, yAxisKeys_1) === -1) {
                        isVisuallyGrouped_1 = true;
                        visualGroupingColumn_1 = column;
                        groupingColumnIndex_1 = index;
                        groupbyColumns_1.splice(groupingColumnIndex_1, 1);
                        return false;
                    }
                    return true;
                });
                // Constructing the groupby expression
                if (visualGroupingColumn_1) {
                    columns_1.push(visualGroupingColumn_1);
                }
                if (groupbyColumns_1.length) {
                    columns_1 = _.concat(columns_1, groupbyColumns_1);
                }
            }
            // If x and y axis are not included in aggregation need to be included in groupby
            if (this.xaxisdatakey !== this.aggregationcolumn) {
                columns_1.push(this.xaxisdatakey);
            }
            _.forEach(yAxisKeys_1, function (key) {
                if (key !== _this.aggregationcolumn) {
                    columns_1.push(key);
                }
            });
            groupingExpression = columns_1.join(',');
            // set isVisuallyGrouped flag in scope for later use
            this.isVisuallyGrouped = isVisuallyGrouped_1;
            return {
                expression: groupingExpression,
                isVisuallyGrouped: isVisuallyGrouped_1,
                visualGroupingColumn: visualGroupingColumn_1
            };
        }
        return {
            expression: '',
            isVisuallyGrouped: false,
            visualGroupingColumn: ''
        };
    };
    // Function to get the aggregated data after applying the aggregation & group by or order by operations.
    ChartComponent.prototype.getAggregatedData = function (callback) {
        var _this = this;
        var variable = this.datasource, yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [], data = {};
        var sortExpr, columns = [], colAlias, orderByColumns, groupByFields = [];
        if (!variable) {
            return;
        }
        if (this.isGroupByEnabled()) {
            groupByFields = _.split(this.groupby, ',');
        }
        if (this.orderby) {
            sortExpr = _.replace(this.orderby, /:/g, ' ');
            columns = _.uniq(_.concat(columns, groupByFields, [this.aggregationcolumn]));
            orderByColumns = getLodashOrderByFormat(this.orderby).columns;
            // If the orderby column is chosen either in groupby or orderby then replace . with $ for that column
            _.forEach(_.intersection(columns, orderByColumns), function (col) {
                colAlias = getValidAliasName(col);
                sortExpr = _.replace(sortExpr, col, colAlias);
            });
        }
        if (this.isAggregationEnabled()) {
            // Send the group by in the aggregations api only if aggregation is also chosen
            data.groupByFields = groupByFields;
            data.aggregations = [
                {
                    'field': this.aggregationcolumn,
                    'type': aggregationFnMap[this.aggregation],
                    'alias': getValidAliasName(this.aggregationcolumn)
                }
            ];
        }
        // Execute the query.
        variable.execute('getAggregatedData', {
            'aggregations': data,
            'sort': sortExpr
        }).then(function (response) {
            // Transform the result into a format supported by the chart.
            var chartData = [], aggregationAlias = getValidAliasName(_this.aggregationcolumn), xAxisAliasKey = getValidAliasName(_this.xaxisdatakey), yAxisAliasKeys = [];
            yAxisKeys.forEach(function (yAxisKey) { return yAxisAliasKeys.push(getValidAliasName(yAxisKey)); });
            _.forEach(response.body.content, function (responseContent) {
                var obj = {};
                // Set the response in the chartData based on 'aggregationColumn', 'xAxisDataKey' & 'yAxisDataKey'.
                if (_this.isAggregationEnabled()) {
                    obj[_this.aggregationcolumn] = responseContent[aggregationAlias];
                    obj[_this.aggregationcolumn] = _.get(responseContent, aggregationAlias) || _.get(responseContent, _this.aggregationcolumn);
                }
                obj[_this.xaxisdatakey] = _.get(responseContent, xAxisAliasKey) || _.get(responseContent, _this.xaxisdatakey);
                yAxisKeys.forEach(function (yAxisKey, index) {
                    obj[yAxisKey] = responseContent[yAxisAliasKeys[index]];
                    obj[yAxisKey] = _.get(responseContent, yAxisAliasKeys[index]) || _.get(responseContent, yAxisKey);
                });
                chartData.push(obj);
            });
            _this.chartData = chartData;
            triggerFn(callback);
        }, function () {
            _this.chartData = [];
            _this.setErrMsg('MESSAGE_ERROR_FETCH_DATA');
            triggerFn(callback);
        });
    };
    // This function sets maximum width for the labels that can be displayed.This will helpful when they are overlapping
    ChartComponent.prototype.setLabelsMaxWidth = function () {
        var xTicks, tickWidth, maxLength, xDist, yDist, totalHeight, maxNoLabels, nthElement, labelsAvailableWidth, barWrapper, yAxisWrapper, svgWrapper;
        var fontsize = parseInt(this.fontsize, 10) || 12, isBarchart = isBarChart(this.type);
        // getting the x ticks in the chart
        xTicks = $('#wmChart' + this.$id + ' svg').find('g.nv-x').find('g.tick').find('text');
        // getting the distance between the two visible ticks associated with visible text
        xTicks.each(function () {
            var xTick = $(this);
            var xTransform, tickDist;
            if (xTick.text() && xTick.css('opacity') === '1') {
                xTransform = xTick.parent().attr('transform').split(',');
                xDist = parseFloat(xTransform[0].substr(10));
                yDist = parseFloat(xTransform[1] || '0');
                if (!isBarchart && xDist > 0) {
                    tickDist = xDist;
                }
                else if (yDist > 0) {
                    tickDist = yDist;
                }
                if (tickWidth) {
                    tickWidth = tickDist - tickWidth;
                    return false;
                }
                tickWidth = tickDist;
                return true;
            }
        });
        // In case of bar chart getting the available space for the labels to be displayed
        if (isBarchart) {
            barWrapper = $('#wmChart' + this.$id + ' svg>g.nv-wrap>g>g.nv-barsWrap')[0];
            yAxisWrapper = $('#wmChart' + this.$id + ' svg>g.nv-wrap>g>g.nv-y')[0];
            svgWrapper = $('#wmChart' + this.$id + ' svg')[0];
            // getting the total height of the chart
            totalHeight = barWrapper ? barWrapper.getBoundingClientRect().height : 0;
            // getting the labels available space
            labelsAvailableWidth = yAxisWrapper ? svgWrapper.getBoundingClientRect().width - yAxisWrapper.getBoundingClientRect().width : svgWrapper.getBoundingClientRect().width;
            // Setting the max length for the label
            maxLength = Math.round(labelsAvailableWidth / fontsize);
            // if available space for each label is less than the font-size
            // then limiting the labels to be displayed
            if (tickWidth < fontsize) {
                // calculate the maximum no of labels to be fitted
                maxNoLabels = totalHeight / fontsize;
                // showing only the nth element
                nthElement = Math.ceil(this.chartData.length / maxNoLabels);
                // showing up only some labels
                d3.select('#wmChart' + this.$id + ' svg').select('g.nv-x').selectAll('g.tick').select('text').each(function (text, i) {
                    // hiding every non nth element
                    if (i % nthElement !== 0) {
                        d3.select(this).attr('opacity', 0);
                    }
                });
            }
        }
        else {
            // Setting the max length for the label
            maxLength = Math.round(tickWidth / fontsize);
        }
        // maxLength should always be a positive number
        maxLength = Math.abs(maxLength);
        // Validating if every label exceeds the max length and if so limiting the length and adding ellipsis
        xTicks.each(function () {
            if (this.textContent.length > maxLength) {
                this.textContent = this.textContent.substr(0, maxLength) + '...';
            }
        });
    };
    // Returns the columns of that can be choosen in the x and y axis
    ChartComponent.prototype.getDefaultColumns = function () {
        var type, stringColumn, i, temp;
        var defaultColumns = [], columns = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP) || [];
        for (i = 0; i < columns.length && defaultColumns.length <= 2; i += 1) {
            type = columns[i].type;
            if (!columns[i].isRelated && (isNumberType(type))) {
                defaultColumns.push(columns[i].fieldName);
            }
            else if (type === 'string' && !stringColumn) {
                stringColumn = columns[i].fieldName;
            }
        }
        // Other than bubble chart x: string type y: number type
        // Bubble chart x: number type y: number type
        if (stringColumn && defaultColumns.length > 0 && !isBubbleChart(this.type)) {
            temp = defaultColumns[0];
            defaultColumns[0] = stringColumn;
            defaultColumns[1] = temp;
        }
        return defaultColumns;
    };
    // Call user defined javascript function when user links it to click event of the widget.
    ChartComponent.prototype.attachClickEvent = function () {
        var _this = this;
        var dataObj;
        d3.select('#wmChart' + this.$id + ' svg').selectAll(chartDataPointXpath[this.type]).style('pointer-events', 'all')
            .on('click', function (data, index) {
            switch (_this.type) {
                case 'Column':
                case 'Bar':
                    dataObj = data._dataObj;
                    break;
                case 'Pie':
                case 'Donut':
                    dataObj = data.data._dataObj;
                    break;
                case 'Area':
                case 'Cumulative Line':
                case 'Line':
                    dataObj = data[0]._dataObj;
                    break;
                case 'Bubble':
                    dataObj = data.data.point[4]._dataObj;
                    break;
            }
            _this.selecteditem = dataObj;
            _this.invokeEventCallback('select', { $event: d3.event, selectedChartItem: data, selectedItem: _this.selecteditem });
        });
    };
    /*  Returns Y Scale min value
           Ex: Input   : 8.97
               Output  : 8.87

               Input   : 8
               Output  : 7
       */
    ChartComponent.prototype.postPlotProcess = function (chart) {
        var _this = this;
        var chartSvg, pieLabels, pieGroups, angleArray;
        var styleObj = {};
        var element = this.$element;
        postPlotChartProcess(this);
        if (!isPieType(this.type)) {
            this.setLabelsMaxWidth();
        }
        else if (!this.showlabelsoutside) {
            /** Nvd3 has a issue in rotating text. So we will use this as a temp fix.
             * If the issue is resolved there, we can remove this.*/
            /* If it is a donut chart, then rotate the text and position them*/
            chartSvg = d3.select('#wmChart' + this.$id + ' svg');
            pieLabels = chartSvg.select('.nv-pieLabels').selectAll('.nv-label');
            pieGroups = chartSvg.select('.nv-pie').selectAll('.nv-slice');
            angleArray = [];
            if (pieGroups && pieGroups.length) {
                pieGroups.each(function () {
                    d3.select(this).attr('transform', function (d) {
                        angleArray.push(angle(d));
                    });
                });
                pieLabels.each(function (d, i) {
                    var group = d3.select(this);
                    $(group[0][0]).find('text').attr('transform', 'rotate(' + angleArray[i] + ')');
                });
            }
        }
        // prepare text style props object and set
        _.forEach(styleProps, function (value, key) {
            if (key === 'fontsize' || key === 'fontunit') {
                styleObj[value] = _this.fontsize + _this.fontunit;
            }
            else {
                styleObj[value] = _this[key];
            }
        });
        setTextStyle(styleObj, this.$id);
        /*
         * allow window-resize functionality, for only-run mode as
         * updating chart is being handled by watchers of height & width in studio-mode
         * */
        triggerFn(this._resizeFn && this._resizeFn.clear);
        this._resizeFn = nv.utils.windowResize(function () {
            if (element[0].getBoundingClientRect().height) {
                chart.update();
                postPlotChartProcess(_this);
                if (!isPieType(_this.type)) {
                    _this.setLabelsMaxWidth();
                }
            }
            else {
                // TODO: get parents of accordion type
                /*let parent = element.closest('.app-accordion-panel, .tab-pane').isolateScope();
                if (parent) {
                    parent.initialized = false;
                }*/
            }
        });
    };
    // prepares and configures the chart properties
    ChartComponent.prototype.configureChart = function () {
        // Copy the data only in case of pie chart with default data
        // Reason : when multiple pie charts are bound to same data, first chart theme will be applied to all charts
        var xDomainValues;
        var yDomainValues;
        var chart;
        var beforeRenderVal;
        var yformatOptions = {};
        if (this._processedData.length > 0) {
            if (isAxisDomainValid(this, 'x')) {
                xDomainValues = this.binddataset ? this.getXMinMaxValues(this._processedData[0]) : { 'min': { 'x': 1 }, 'max': { 'x': 5 } };
            }
            if (isAxisDomainValid(this, 'y')) {
                yDomainValues = this.binddataset ? this.getYMinMaxValues(this._processedData) : { 'min': { 'y': 1 }, 'max': { 'y': 5 } };
            }
        }
        if (isPieType(this.type) && (!this.binddataset || !this.scopedataset)) {
            this._processedData = getClonedObject(this.scopedataset || this._processedData);
        }
        // get the chart object
        chart = initChart(this, xDomainValues, yDomainValues, null, !this.binddataset);
        if (_.isArray(this._processedData)) {
            beforeRenderVal = this.invokeEventCallback('beforerender', { 'chartInstance': chart });
            if (beforeRenderVal) {
                chart = beforeRenderVal;
            }
            this.chart = chart;
            // changing the default no data message
            d3.select('#wmChart' + this.$id + ' svg')
                .datum(this._processedData)
                .call(this.chart);
            this.postPlotProcess(chart);
            return chart;
        }
    };
    // Plotting the chart with set of the properties set to it
    ChartComponent.prototype.plotChart = function () {
        var _this = this;
        var element = this.$element;
        // call user-transformed function
        this.chartData = (this.invokeEventCallback('transform')) || this.chartData;
        // Getting the order by data only in run mode. The order by applies for all the charts other than pie and donut charts
        if (this.isVisuallyGrouped && !isPieType(this.type)) {
            this._processedData = this.chartData;
        }
        else {
            this._processedData = this.processChartData();
        }
        // checking the parent container before plotting the chart
        if (!element[0].getBoundingClientRect().height) {
            return;
        }
        if (this.clearCanvas) {
            // empty svg to add-new chart
            element.find('svg').replaceWith('<svg></svg>');
            this.clearCanvas = false;
        }
        // In case of invalid axis show no data available message
        if (!this.isValidAxis()) {
            this._processedData = [];
        }
        nv.addGraph(function () { return _this.configureChart(); }, function () {
            /*Bubble chart has an time out delay of 300ms in their implementation due to which we
            * won't be getting required data points on attaching events
            * hence delaying it 600ms*/
            setTimeout(function () {
                _this.attachClickEvent();
            }, 600);
        });
        this.isLoadInProgress = false;
    };
    Object.defineProperty(ChartComponent.prototype, "isLiveVariable", {
        // TODO: Need way to figure out if the datasource is a live source
        get: function () {
            // setting the flag for the live variable in the scope for the checks
            var variableObj = this.datasource;
            return variableObj && variableObj.category === 'wm.LiveVariable';
        },
        enumerable: true,
        configurable: true
    });
    ChartComponent.prototype.plotChartProxy = function () {
        var _this = this;
        this.showContentLoadError = false;
        this.invalidConfig = false;
        // Checking if x and y axis are chosen
        this.isLoadInProgress = true;
        var groupingDetails = this.getGroupingDetails();
        // If aggregation/group by/order by properties have been set, then get the aggregated data and plot the result in the chart.
        // TODO: datasource for live variable detection
        if (this.binddataset && this.isLiveVariable && (this.filterFields || this.isDataFilteringEnabled())) {
            this.getAggregatedData(function () { return _this.plotChart(); });
        }
        else { // Else, simply plot the chart.
            // In case of live variable resetting the aggregated data to the normal dataset when the aggregation has been removed
            if (this.dataset && this.isLiveVariable) {
                this.chartData = this.dataset;
                if (this.isGroupByEnabled() && groupingDetails.isVisuallyGrouped) {
                    this.chartData = this.getVisuallyGroupedData(this.chartData, groupingDetails.visualGroupingColumn);
                }
            }
            this.plotChart();
        }
    };
    // sets the default x and y axis options
    ChartComponent.prototype.setDefaultAxisOptions = function () {
        var defaultColumns = this.getDefaultColumns();
        // If we get the valid default columns then assign them as the x and y axis
        // In case of service variable we may not get the valid columns because we cannot know the datatypes
        this.xaxisdatakey = defaultColumns[0] || null;
        this.yaxisdatakey = defaultColumns[1] || null;
    };
    ChartComponent.prototype.getCutomizedOptions = function (prop, fields) {
        var groupByColumns = _.split(this.groupby, ','), aggColumns = _.split(this.aggregationcolumn, ',');
        if (!this.binddataset) {
            return fields;
        }
        if (!this.axisoptions) {
            this.axisoptions = fields;
        }
        var newOptions;
        switch (prop) {
            case 'xaxisdatakey':
                // If group by enabled, columns chosen in groupby will be populated in x axis options
                if (this.isGroupByEnabled()) {
                    newOptions = groupByColumns;
                }
                break;
            case 'yaxisdatakey':
                // If aggregation by enabled, columns chosen in aggregation will be populated in y axis options
                if (this.isAggregationEnabled()) {
                    newOptions = aggColumns;
                }
                else if (this.isLiveVariable) {
                    // In case of live variable populating only numeric columns
                    newOptions = this.numericColumns;
                }
                break;
            case 'groupby':
                // Filtering only non primary key columns
                if (this.isLiveVariable && this.nonPrimaryColumns && this.nonPrimaryColumns.length) {
                    newOptions = this.nonPrimaryColumns;
                }
                break;
            case 'aggregationcolumn':
                // Set the 'aggregationColumn' to show all keys in case of aggregation function is count or to numeric keys in all other cases.
                if (this.isLiveVariable && this.isAggregationEnabled() && this.aggregation !== 'count') {
                    newOptions = this.numericColumns;
                }
                break;
            case 'orderby':
                // Set the 'aggregationColumn' to show all keys in case of aggregation function is count or to numeric keys in all other cases.
                if (this.isLiveVariable && this.isAggregationEnabled()) {
                    newOptions = _.uniq(_.concat(groupByColumns, aggColumns));
                }
                break;
            case 'bubblesize':
                if (this.numericColumns && this.numericColumns.length) {
                    newOptions = this.numericColumns;
                }
                break;
        }
        return newOptions || fields || this.axisoptions;
    };
    // Function that iterates through all the columns and then fetching the numeric and non primary columns among them
    ChartComponent.prototype.setNumericandNonPrimaryColumns = function () {
        var _this = this;
        var columns, type;
        var propertiesMap = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP);
        this.numericColumns = [];
        this.nonPrimaryColumns = [];
        // Fetching all the columns
        if (this.dataset && !_.isEmpty(propertiesMap)) {
            columns = []; // TODO: fetchPropertiesMapColumns(propertiesMap);
        }
        if (columns) {
            // Iterating through all the columns and fetching the numeric and non primary key columns
            _.forEach(Object.keys(columns), function (key) {
                type = columns[key].type;
                if (isNumberType(type)) {
                    _this.numericColumns.push(key);
                }
                // Hiding only table's primary key
                if (columns[key].isRelatedPk === 'true' || !columns[key].isPrimaryKey) {
                    _this.nonPrimaryColumns.push(key);
                }
            });
            this.numericColumns = this.numericColumns.sort();
            this.nonPrimaryColumns = this.nonPrimaryColumns.sort();
        }
    };
    // plot the chart
    ChartComponent.prototype.handleDataSet = function (newVal) {
        this.errMsg = '';
        // Resetting the flag to false when the binding was removed
        if (!newVal && !this.binddataset) {
            this.isVisuallyGrouped = false;
            this.axisoptions = null;
        }
        // liveVariables contain data in 'data' property' of the variable
        this.chartData = this.isLiveVariable ? newVal || '' : (newVal && newVal.dataValue === '' && _.keys(newVal).length === 1) ? '' : newVal;
        // if the data returned is an object make it an array of object
        if (!_.isArray(this.chartData) && _.isObject(this.chartData)) {
            this.chartData = [this.chartData];
        }
        if (newVal && newVal.filterFields) {
            this.filterFields = newVal.filterFields;
        }
        // plotchart for only valid data and only after bound variable returns data
        if (this.chartData) {
            this._plotChartProxy();
        }
    };
    ChartComponent.prototype.onPropertyChange = function (key, newVal, oldVal) {
        _super.prototype.onPropertyChange.call(this, key, newVal, oldVal);
        switch (key) {
            case 'dataset':
                this.handleDataSet(newVal);
                break;
            case 'type':
                // Based on the change in type deciding the default margins
                if (isPieType(this.type)) {
                    this.offsettop = 20;
                    this.offsetright = 0;
                    this.offsetbottom = 0;
                    this.offsetleft = 0;
                }
                else if (oldVal === 'Pie' || oldVal === 'Donut') {
                    this.offsettop = 25;
                    this.offsetright = 25;
                    this.offsetbottom = 55;
                    this.offsetleft = 75;
                }
                if (oldVal !== newVal) {
                    this.clearCanvas = true;
                }
                // In studio mode, configure properties dependent on chart type
                this._plotChartProxy();
                break;
            default:
                // In RunMode, the plotchart method will not be called for all property change
                this._plotChartProxy();
                break;
        }
        if (_.includes(advanceDataProps, key)) {
            this._plotChartProxy();
        }
    };
    ChartComponent.prototype.handleLoading = function (data) {
        var dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.variableInflight = data.active;
            this.isLoadInProgress = data.active;
        }
    };
    ChartComponent.prototype.onStyleChange = function (key, newVal, oldVal) {
        var styleObj = {};
        _super.prototype.onStyleChange.call(this, key, newVal, oldVal);
        switch (key) {
            case 'fontsize':
            case 'fontunit':
            case 'color':
            case 'fontfamily':
            case 'fontweight':
            case 'fontstyle':
            case 'textdecoration':
                styleObj[styleProps[key]] = (key === 'fontsize' || key === 'fontunit') ? this.fontsize + this.fontunit : newVal;
                setTextStyle(styleObj, this.$id);
                break;
        }
    };
    ChartComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        // For old projects
        if (!_.includes(['outside', 'inside', 'hide'], this.showlabels)) {
            this.showlabels = getBooleanValue(this.showlabels);
            this.showlabelsoutside = getBooleanValue(this.showlabelsoutside);
            this.showlabels = this.showlabels ? (this.showlabelsoutside ? 'outside' : 'inside') : 'hide';
        }
        if (!this.theme) {
            // Default theme for pie/donut is Azure and for other it is Terrestrial
            this.theme = isPieType(this.type) ? 'Azure' : 'Terrestrial';
        }
        this.nativeElement.setAttribute('id', 'wmChart' + this.$id);
        // When there is not value binding, then plot the chart with sample data
        if (!this.binddataset && !this.nativeElement.getAttribute('scopedataset')) {
            this._plotChartProxy();
        }
    };
    ChartComponent.initializeProps = registerProps();
    ChartComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmChart]',
                    template: "<div class=\"panel-heading\" *ngIf=\"title\">\n    <h3 class=\"panel-title\">\n        <div class=\"pull-left\"><i class=\"app-icon panel-icon {{iconclass}}\" [class.ng-hide]=\"!iconclass\"></i></div>\n        <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\"></div>\n        <div class=\"description\" *ngIf=\"subheading\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n    </h3>\n</div>\n<div class=\"app-chart-inner\" [ngClass]=\"{'loading':isLoadInProgress, 'panel-body': title}\">\n    <svg></svg>\n    <div class=\"wm-content-info readonly-wrapper\" *ngIf=\"showContentLoadError && showNoDataMsg\">\n        <p class=\"wm-message\" [title]=\"hintMsg\" [ngClass]=\"{'error': invalidConfig}\" [innerText]=\"errMsg\"></p>\n    </div>\n    <div wmSpinner show.bind=\"isLoadInProgress\" caption.bind=\"loadingdatamsg\"></div>\n</div>",
                    providers: [
                        provideAsWidgetRef(ChartComponent)
                    ],
                    encapsulation: ViewEncapsulation.None,
                    styles: [".nvd3 .nv-axis{pointer-events:none;opacity:1}.nvd3 .nv-axis path{fill:none;stroke:#000;stroke-opacity:.75;shape-rendering:crispEdges}.nvd3 .nv-axis path.domain{stroke-opacity:.75}.nvd3 .nv-axis.nv-x path.domain{stroke-opacity:0}.nvd3 .nv-axis line{fill:none;stroke:#e5e5e5;shape-rendering:crispEdges}.nvd3 .nv-axis .zero line,.nvd3 .nv-axis line.zero{stroke-opacity:.75}.nvd3 .nv-axis .nv-axisMaxMin text{font-weight:700}.nvd3 .x .nv-axis .nv-axisMaxMin text,.nvd3 .x2 .nv-axis .nv-axisMaxMin text,.nvd3 .x3 .nv-axis .nv-axisMaxMin text{text-anchor:middle}.nvd3 .nv-axis.nv-disabled{opacity:0}.nvd3 .nv-bars rect{fill-opacity:.75;transition:fill-opacity 250ms linear}.nvd3 .nv-bars rect.hover{fill-opacity:1}.nvd3 .nv-bars .hover rect{fill:#add8e6}.nvd3 .nv-bars text{fill:transparent}.nvd3 .nv-bars .hover text{fill:rgba(0,0,0,1)}.nvd3 .nv-discretebar .nv-groups rect,.nvd3 .nv-multibar .nv-groups rect,.nvd3 .nv-multibarHorizontal .nv-groups rect{stroke-opacity:0;transition:fill-opacity 250ms linear}.nvd3 .nv-candlestickBar .nv-ticks rect:hover,.nvd3 .nv-discretebar .nv-groups rect:hover,.nvd3 .nv-multibar .nv-groups rect:hover,.nvd3 .nv-multibarHorizontal .nv-groups rect:hover{fill-opacity:1}.nvd3 .nv-discretebar .nv-groups text,.nvd3 .nv-multibarHorizontal .nv-groups text{font-weight:700;fill:rgba(0,0,0,1);stroke:transparent}.nvd3 .nv-boxplot circle{fill-opacity:.5}.nvd3 .nv-boxplot circle:hover,.nvd3 .nv-boxplot rect:hover{fill-opacity:1}.nvd3 line.nv-boxplot-median{stroke:#000}.nv-boxplot-tick:hover{stroke-width:2.5px}.nvd3.nv-bullet{font:10px sans-serif}.nvd3.nv-bullet .nv-measure{fill-opacity:.8}.nvd3.nv-bullet .nv-measure:hover{fill-opacity:1}.nvd3.nv-bullet .nv-marker{stroke:#000;stroke-width:2px}.nvd3.nv-bullet .nv-markerTriangle{stroke:#000;fill:#fff;stroke-width:1.5px}.nvd3.nv-bullet .nv-markerLine{stroke:#000;stroke-width:1.5px}.nvd3.nv-bullet .nv-tick line{stroke:#666;stroke-width:.5px}.nvd3.nv-bullet .nv-range.nv-s0{fill:#eee}.nvd3.nv-bullet .nv-range.nv-s1{fill:#ddd}.nvd3.nv-bullet .nv-range.nv-s2{fill:#ccc}.nvd3.nv-bullet .nv-title{font-size:14px;font-weight:700}.nvd3.nv-bullet .nv-subtitle{fill:#999}.nvd3.nv-bullet .nv-range{fill:#bababa;fill-opacity:.4}.nvd3.nv-bullet .nv-range:hover{fill-opacity:.7}.nvd3.nv-candlestickBar .nv-ticks .nv-tick{stroke-width:1px}.nvd3.nv-candlestickBar .nv-ticks .nv-tick.hover{stroke-width:2px}.nvd3.nv-candlestickBar .nv-ticks .nv-tick.positive rect{stroke:#2ca02c;fill:#2ca02c}.nvd3.nv-candlestickBar .nv-ticks .nv-tick.negative rect{stroke:#d62728;fill:#d62728}.with-transitions .nv-candlestickBar .nv-ticks .nv-tick{transition:stroke-width 250ms linear,stroke-opacity 250ms linear}.nvd3.nv-candlestickBar .nv-ticks line{stroke:#333}.nv-force-node{stroke:#fff;stroke-width:1.5px}.nv-force-link{stroke:#999;stroke-opacity:.6}.nv-force-node text{stroke-width:0}.nvd3 .nv-check-box .nv-box{fill-opacity:0;stroke-width:2}.nvd3 .nv-check-box .nv-check{fill-opacity:0;stroke-width:4}.nvd3 .nv-series.nv-disabled .nv-check-box .nv-check{fill-opacity:0;stroke-opacity:0}.nvd3 .nv-controlsWrap .nv-legend .nv-check-box .nv-check{opacity:0}.nvd3.nv-linePlusBar .nv-bar rect{fill-opacity:.75}.nvd3.nv-linePlusBar .nv-bar rect:hover{fill-opacity:1}.nvd3 .nv-groups path.nv-line{fill:none}.nvd3 .nv-groups path.nv-area{stroke:none}.nvd3.nv-line .nvd3.nv-scatter .nv-groups .nv-point{fill-opacity:0;stroke-opacity:0}.nvd3.nv-scatter.nv-single-point .nv-groups .nv-point{fill-opacity:.5!important;stroke-opacity:.5!important}.with-transitions .nvd3 .nv-groups .nv-point{transition:stroke-width 250ms linear,stroke-opacity 250ms linear}.nvd3 .nv-groups .nv-point.hover,.nvd3.nv-scatter .nv-groups .nv-point.hover{stroke-width:7px;fill-opacity:.95!important;stroke-opacity:.95!important}.nvd3 .nv-point-paths path{stroke:#aaa;stroke-opacity:0;fill:#eee;fill-opacity:0}.nvd3 .nv-indexLine{cursor:ew-resize}svg.nvd3-svg{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:block;width:100%;height:100%}.nvtooltip.with-3d-shadow,.with-3d-shadow .nvtooltip{box-shadow:0 5px 10px rgba(0,0,0,.2);border-radius:5px}.nvd3 text{font:12px Arial,sans-serif}.nvd3 .title{font:bold 14px Arial,sans-serif}.nvd3 .nv-background{fill:#fff;fill-opacity:0}.nvd3.nv-noData{font-size:18px;font-weight:700}.nv-brush .extent{fill-opacity:.125;shape-rendering:crispEdges}.nv-brush .resize path{fill:#eee;stroke:#666}.nvd3 .nv-legend .nv-series{cursor:pointer}.nvd3 .nv-legend .nv-disabled circle{fill-opacity:0}.nvd3 .nv-brush .extent{fill-opacity:0!important}.nvd3 .nv-brushBackground rect{stroke:#000;stroke-width:.4;fill:#fff;fill-opacity:.7}@media print{.nvd3 text{stroke-width:0;fill-opacity:1}}.nvd3.nv-ohlcBar .nv-ticks .nv-tick{stroke-width:1px}.nvd3.nv-ohlcBar .nv-ticks .nv-tick.hover{stroke-width:2px}.nvd3.nv-ohlcBar .nv-ticks .nv-tick.positive{stroke:#2ca02c}.nvd3.nv-ohlcBar .nv-ticks .nv-tick.negative{stroke:#d62728}.nvd3 .background path{fill:none;stroke:#eee;stroke-opacity:.4;shape-rendering:crispEdges}.nvd3 .foreground path{fill:none;stroke-opacity:.7}.nvd3 .nv-parallelCoordinates-brush .extent{fill:#fff;fill-opacity:.6;stroke:gray;shape-rendering:crispEdges}.nvd3 .nv-parallelCoordinates .hover{fill-opacity:1;stroke-width:3px}.nvd3 .missingValuesline line{fill:none;stroke:#000;stroke-width:1;stroke-opacity:1;stroke-dasharray:5,5}.nvd3.nv-pie path{stroke-opacity:0;transition:fill-opacity 250ms linear,stroke-width 250ms linear,stroke-opacity 250ms linear;stroke:#fff;stroke-width:1px;stroke-opacity:1;fill-opacity:.7}.nvd3.nv-pie .nv-pie-title{font-size:24px;fill:rgba(19,196,249,.59)}.nvd3.nv-pie .nv-slice text{stroke:#000;stroke-width:0}.nvd3.nv-pie .hover path{fill-opacity:1}.nvd3.nv-pie .nv-label{pointer-events:none}.nvd3.nv-pie .nv-label rect{fill-opacity:0;stroke-opacity:0}.nvd3 .nv-groups .nv-point.hover{stroke-width:20px;stroke-opacity:.5}.nvd3 .nv-scatter .nv-point.hover{fill-opacity:1}.nv-distx,.nv-disty,.nv-noninteractive{pointer-events:none}.nvd3.nv-sparkline path{fill:none}.nvd3.nv-sparklineplus g.nv-hoverValue{pointer-events:none}.nvd3.nv-sparklineplus .nv-hoverValue line{stroke:#333;stroke-width:1.5px}.nvd3.nv-sparklineplus,.nvd3.nv-sparklineplus g{pointer-events:all}.nvd3 .nv-hoverArea{fill-opacity:0;stroke-opacity:0}.nvd3.nv-sparklineplus .nv-xValue,.nvd3.nv-sparklineplus .nv-yValue{stroke-width:0;font-size:.9em;font-weight:400}.nvd3.nv-sparklineplus .nv-yValue{stroke:#f66}.nvd3.nv-sparklineplus .nv-maxValue{stroke:#2ca02c;fill:#2ca02c}.nvd3.nv-sparklineplus .nv-minValue{stroke:#d62728;fill:#d62728}.nvd3.nv-sparklineplus .nv-currentValue{font-weight:700;font-size:1.1em}.nvd3.nv-stackedarea path.nv-area{fill-opacity:.7;stroke-opacity:0;transition:fill-opacity 250ms linear,stroke-opacity 250ms linear}.nvd3.nv-stackedarea path.nv-area.hover{fill-opacity:.9}.nvd3.nv-stackedarea .nv-groups .nv-point{stroke-opacity:0;fill-opacity:0}.nvtooltip{position:absolute;color:rgba(0,0,0,1);padding:1px;border:1px solid rgba(0,0,0,.5);z-index:10000;display:block;font-family:Arial,sans-serif;font-size:13px;text-align:left;pointer-events:none;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background:rgba(255,255,255,.8);border-radius:4px}.nvtooltip.with-transitions,.with-transitions .nvtooltip{transition:opacity 50ms linear .2s}.nvtooltip.x-nvtooltip,.nvtooltip.y-nvtooltip{padding:8px}.nvtooltip h3{margin:0;padding:4px 14px;line-height:18px;font-weight:400;background-color:rgba(247,247,247,.75);color:rgba(0,0,0,1);text-align:center;border-bottom:1px solid #ebebeb;border-radius:5px 5px 0 0}.nvtooltip p{margin:0;padding:5px 14px;text-align:center}.nvtooltip span{display:inline-block;margin:2px 0}.nvtooltip table{margin:6px;border-spacing:0}.nvtooltip table td{padding:2px 9px 2px 0;vertical-align:middle}.nvtooltip table td.key{font-weight:400}.nvtooltip table td.key.total{font-weight:700}.nvtooltip table td.value{text-align:right;font-weight:700}.nvtooltip table td.percent{color:#a9a9a9}.nvtooltip table tr.highlight td{padding:1px 9px 1px 0;border-bottom-style:solid;border-bottom-width:1px;border-top-style:solid;border-top-width:1px}.nvtooltip table td.legend-color-guide div{vertical-align:middle;width:12px;height:12px;border:1px solid #999}.nvtooltip .footer{padding:3px;text-align:center}.nvtooltip-pending-removal{pointer-events:none;display:none}.nvd3 .nv-interactiveGuideLine{pointer-events:none}.nvd3 line.nv-guideline{stroke:#ccc}"]
                }] }
    ];
    /** @nocollapse */
    ChartComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: App }
    ]; };
    ChartComponent.propDecorators = {
        title: [{ type: HostBinding, args: ['class.panel',] }]
    };
    return ChartComponent;
}(StylableComponent));
export { ChartComponent };
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGFydC9jaGFydC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbkcsT0FBTyxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkosT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqTyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUlqRSxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXZFLElBQU0sT0FBTyxHQUFHO0lBQ1IsUUFBUSxFQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQztDQUNyQyxFQUNELElBQUksR0FBRyxNQUFNLEVBQ2IsZ0JBQWdCLEdBQUcsQ0FBQyxhQUFhLEVBQUUsbUJBQW1C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QUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7U0FDL0Q7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1RCx3RUFBd0U7UUFDeEUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN2RSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDMUI7SUFDTCxDQUFDO0lBLzdCTSw4QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFWNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO29CQUN4QixpMkJBQXFDO29CQUVyQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO3FCQUNyQztvQkFDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7aUJBQ3hDOzs7O2dCQXBHK0MsUUFBUTtnQkFFL0MsR0FBRzs7O3dCQXFKUCxXQUFXLFNBQUMsYUFBYTs7SUFpNUI5QixxQkFBQztDQUFBLEFBNThCRCxDQVNvQyxpQkFBaUIsR0FtOEJwRDtTQW44QlksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEluamVjdG9yLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHAsIERhdGFTb3VyY2UsIGdldENsb25lZE9iamVjdCwgaXNEYXRhU291cmNlRXF1YWwsIGlzRW1wdHlPYmplY3QsIGlzTnVtYmVyVHlwZSwgcHJldHRpZnlMYWJlbHMsIHJlbW92ZUF0dHIsIHRyaWdnZXJGbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVJlZHJhd2FibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jaGFydC5wcm9wcyc7XG5pbXBvcnQgeyBhbGxTaGFwZXMsIGdldERhdGVMaXN0LCBnZXRTYW1wbGVEYXRhLCBpbml0Q2hhcnQsIGlzQXJlYUNoYXJ0LCBpc0F4aXNEb21haW5WYWxpZCwgaXNCYXJDaGFydCwgaXNCdWJibGVDaGFydCwgaXNDaGFydERhdGFBcnJheSwgaXNDaGFydERhdGFKU09OLCBpc0xpbmVUeXBlQ2hhcnQsIGlzUGllVHlwZSwgcG9zdFBsb3RDaGFydFByb2Nlc3MgfSBmcm9tICcuL2NoYXJ0LnV0aWxzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgJCwgXywgZDMsIG52O1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1jaGFydCcsIGhvc3RDbGFzczogJ2FwcC1jaGFydCd9O1xuXG5jb25zdCBvcHRpb25zID0ge1xuICAgICAgICAnQnViYmxlJyA6IFsnYnViYmxlc2l6ZScsICdzaGFwZSddXG4gICAgfSxcbiAgICBOT05FID0gJ25vbmUnLFxuICAgIGFkdmFuY2VEYXRhUHJvcHMgPSBbJ2FnZ3JlZ2F0aW9uJywgJ2FnZ3JlZ2F0aW9uY29sdW1uJywgJ2dyb3VwYnknLCAnb3JkZXJieSddLFxuICAgIC8vIFhQYXRocyB0byBnZXQgYWN0dWFsIGRhdGEgb2YgZGF0YSBwb2ludHMgaW4gY2hhcnRzXG4gICAgY2hhcnREYXRhUG9pbnRYcGF0aCA9IHtcbiAgICAgICAgJ0NvbHVtbicgICAgICAgICA6ICdyZWN0Lm52LWJhcicsXG4gICAgICAgICdCYXInICAgICAgICAgICAgOiAnZy5udi1iYXInLFxuICAgICAgICAnQXJlYScgICAgICAgICAgIDogJy5udi1zdGFja2VkYXJlYSAubnYtcG9pbnQnLFxuICAgICAgICAnQ3VtdWxhdGl2ZSBMaW5lJzogJy5udi1jdW11bGF0aXZlTGluZSAubnYtc2NhdHRlcldyYXAgcGF0aC5udi1wb2ludCcsXG4gICAgICAgICdMaW5lJyAgICAgICAgICAgOiAnLm52LWxpbmVDaGFydCAubnYtc2NhdHRlcldyYXAgcGF0aC5udi1wb2ludCcsXG4gICAgICAgICdQaWUnICAgICAgICAgICAgOiAnLm52LXBpZUNoYXJ0IC5udi1zbGljZSBwYXRoJyxcbiAgICAgICAgJ0RvbnV0JyAgICAgICAgICA6ICcubnYtcGllQ2hhcnQgLm52LXNsaWNlIHBhdGgnLFxuICAgICAgICAnQnViYmxlJyAgICAgICAgIDogJy5udi1zY2F0dGVyQ2hhcnQgLm52LXBvaW50LXBhdGhzIHBhdGgnXG4gICAgfSxcbiAgICAvLyBhbGwgcHJvcGVydGllcyBvZiB0aGUgY2hhcnRcbiAgICBhbGxPcHRpb25zID0gWydidWJibGVzaXplJywgJ3NoYXBlJ10sXG4gICAgc3R5bGVQcm9wcyA9IHtcbiAgICAgICAgJ2ZvbnR1bml0JyAgICAgIDogJ2ZvbnQtc2l6ZScsXG4gICAgICAgICdmb250c2l6ZScgICAgICA6ICdmb250LXNpemUnLFxuICAgICAgICAnY29sb3InICAgICAgICAgOiAnZmlsbCcsXG4gICAgICAgICdmb250ZmFtaWx5JyAgICA6ICdmb250LWZhbWlseScsXG4gICAgICAgICdmb250d2VpZ2h0JyAgICA6ICdmb250LXdlaWdodCcsXG4gICAgICAgICdmb250c3R5bGUnICAgICA6ICdmb250LXN0eWxlJyxcbiAgICAgICAgJ3RleHRkZWNvcmF0aW9uJzogJ3RleHQtZGVjb3JhdGlvbidcbiAgICB9LFxuICAgIC8vIEdldHRpbmcgdGhlIHJlbGV2YW50IGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBvcHRpb25cbiAgICBhZ2dyZWdhdGlvbkZuTWFwID0ge1xuICAgICAgICAnYXZlcmFnZScgOiAnQVZHJyxcbiAgICAgICAgJ2NvdW50JyAgIDogJ0NPVU5UJyxcbiAgICAgICAgJ21heGltdW0nIDogJ01BWCcsXG4gICAgICAgICdtaW5pbXVtJyA6ICdNSU4nLFxuICAgICAgICAnc3VtJyAgICAgOiAnU1VNJ1xuICAgIH07XG5cbmNvbnN0IGdldEJvb2xlYW5WYWx1ZSA9IHZhbCA9PiB7XG4gICAgaWYgKHZhbCA9PT0gdHJ1ZSB8fCB2YWwgPT09ICd0cnVlJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHZhbCA9PT0gZmFsc2UgfHwgdmFsID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbi8vIHJldHVybnMgb3JkZXJieSBjb2x1bW5zIGFuZCB0aGVpciBvcmRlcnMgaW4gdHdvIHNlcGFyYXRlIGFycmF5c1xuY29uc3QgZ2V0TG9kYXNoT3JkZXJCeUZvcm1hdCA9IG9yZGVyYnkgPT4ge1xuICAgIGxldCBjb2x1bW5zO1xuICAgIGNvbnN0IG9yZGVyQnlDb2x1bW5zID0gW10sXG4gICAgICAgIG9yZGVycyA9IFtdO1xuXG4gICAgXy5mb3JFYWNoKF8uc3BsaXQob3JkZXJieSwgJywnKSwgZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICBjb2x1bW5zID0gXy5zcGxpdChjb2wsICc6Jyk7XG4gICAgICAgIG9yZGVyQnlDb2x1bW5zLnB1c2goY29sdW1uc1swXSk7XG4gICAgICAgIG9yZGVycy5wdXNoKGNvbHVtbnNbMV0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgICdjb2x1bW5zJyA6IG9yZGVyQnlDb2x1bW5zLFxuICAgICAgICAnb3JkZXJzJyAgOiBvcmRlcnNcbiAgICB9O1xufTtcblxuLy8gUmVwbGFjaW5nIHRoZSAnLicgYnkgdGhlICckJyBiZWNhdXNlICcuJyBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBhbGlhcyBuYW1lc1xuY29uc3QgZ2V0VmFsaWRBbGlhc05hbWUgPSBhbGlhc05hbWUgPT4gYWxpYXNOYW1lID8gYWxpYXNOYW1lLnJlcGxhY2UoL1xcLi9nLCAnJCcpIDogbnVsbDtcblxuLy8gQXBwbHlpbmcgdGhlIGZvbnQgcmVsYXRlZCBzdHlsZXMgZm9yIHRoZSBjaGFydFxuY29uc3Qgc2V0VGV4dFN0eWxlID0gKHByb3BlcnRpZXMsIGlkKSA9PiB7XG4gICAgY29uc3QgY2hhcnR0ZXh0ID0gZDMuc2VsZWN0KCcjd21DaGFydCcgKyBpZCArICcgc3ZnJykuc2VsZWN0QWxsKCd0ZXh0Jyk7XG4gICAgY2hhcnR0ZXh0LnN0eWxlKHByb3BlcnRpZXMpO1xufTtcblxuY29uc3QgYW5nbGUgPSBkID0+IHtcbiAgICBjb25zdCBhID0gKGQuc3RhcnRBbmdsZSArIGQuZW5kQW5nbGUpICogOTAgLyBNYXRoLlBJIC0gOTA7XG4gICAgcmV0dXJuIGEgPiA5MCA/IGEgLSAxODAgOiBhO1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21DaGFydF0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jaGFydC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy93bS1udmQzL2J1aWxkL252LmQzLmNzcyddLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ2hhcnRDb21wb25lbnQpXG4gICAgXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIENoYXJ0Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHhheGlzZGF0YWtleTtcbiAgICB5YXhpc2RhdGFrZXk7XG4gICAgZ3JvdXBieTtcbiAgICBhZ2dyZWdhdGlvbjtcbiAgICBhZ2dyZWdhdGlvbmNvbHVtbjtcbiAgICBpc1Zpc3VhbGx5R3JvdXBlZDtcbiAgICBvcmRlcmJ5O1xuICAgIGljb25jbGFzcyA9ICcnO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzaG93Q29udGVudExvYWRFcnJvcjtcbiAgICBpbnZhbGlkQ29uZmlnO1xuICAgIGVyck1zZztcbiAgICBzaGFwZTogc3RyaW5nO1xuICAgIGRhdGFzb3VyY2U6IGFueTtcbiAgICBmb250c2l6ZTogc3RyaW5nO1xuICAgIHNlbGVjdGVkaXRlbTogYW55O1xuICAgIGZvbnR1bml0OiBzdHJpbmc7XG4gICAgb2Zmc2V0dG9wOiBudW1iZXI7XG4gICAgb2Zmc2V0bGVmdDogbnVtYmVyO1xuICAgIG9mZnNldHJpZ2h0OiBudW1iZXI7XG4gICAgb2Zmc2V0Ym90dG9tOiBudW1iZXI7XG4gICAgc2hvd2xhYmVsczogYW55O1xuICAgIHRoZW1lOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlICRpZDtcbiAgICBwcml2YXRlIHNjb3BlZGF0YXNldDogYW55O1xuICAgIHByaXZhdGUgYmluZGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIHNob3dsYWJlbHNvdXRzaWRlOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVzaXplRm46IGFueTtcbiAgICBwcml2YXRlIGNoYXJ0OiBhbnk7XG4gICAgcHJpdmF0ZSBjbGVhckNhbnZhczogYm9vbGVhbjtcbiAgICBwdWJsaWMgaXNMb2FkSW5Qcm9ncmVzczogYm9vbGVhbjtcbiAgICBwcml2YXRlIGZpbHRlckZpZWxkczogYm9vbGVhbiB8IGFueTtcbiAgICBwcml2YXRlIGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIGF4aXNvcHRpb25zOiBhbnk7XG4gICAgcHJpdmF0ZSBudW1lcmljQ29sdW1uczogYW55O1xuICAgIHByaXZhdGUgbm9uUHJpbWFyeUNvbHVtbnM6IGFueSA9IFtdO1xuICAgIHByaXZhdGUgdmFyaWFibGVJbmZsaWdodDogYW55O1xuICAgIHByaXZhdGUgY2hhcnRSZWFkeTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHhEYXRhS2V5QXJyOiBhbnkgPSBbXTtcbiAgICBwcml2YXRlIHhBeGlzRGF0YVR5cGU6IHN0cmluZztcbiAgICBwcml2YXRlIGJ1YmJsZXNpemU6IGFueTtcbiAgICBwdWJsaWMgc2hvd05vRGF0YU1zZzogYW55O1xuICAgIHByaXZhdGUgc2FtcGxlRGF0YTogYW55W107XG4gICAgcHJpdmF0ZSBjaGFydERhdGE6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBfcHJvY2Vzc2VkRGF0YTogYW55W10gPSBbXTtcblxuICAgIEBIb3N0QmluZGluZygnY2xhc3MucGFuZWwnKSB0aXRsZTtcblxuICAgIGlzR3JvdXBCeUVuYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmdyb3VwYnkgJiYgdGhpcy5ncm91cGJ5ICE9PSBOT05FKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB4IGFuZCB5IGF4aXMgdGhhdCBhcmUgY2hvc2VuIGFyZSB2YWxpZCB0byBwbG90IGNoYXJ0XG4gICAgaXNWYWxpZEF4aXMoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHggYXhpcyBhbmQgeSBheGlzIGFyZSBjaG9zZW4gYW5kIGFyZSBub3QgZXF1YWxcbiAgICAgICAgcmV0dXJuIHRoaXMuYmluZGRhdGFzZXQgPyAodGhpcy54YXhpc2RhdGFrZXkgJiYgdGhpcy55YXhpc2RhdGFrZXkpIDogdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhZ2dyZWdhdGlvbiBpcyBjaG9zZW5cbiAgICBpc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuICEhKCh0aGlzLmlzR3JvdXBCeUVuYWJsZWQoKSAmJiB0aGlzLmFnZ3JlZ2F0aW9uICE9PSBOT05FICYmIHRoaXMuYWdncmVnYXRpb25jb2x1bW4pKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBlaXRoZXIgZ3JvdXBieSwgYWdncmVnYXRpb24gb3Igb3JkZXJieSBpcyBjaG9zZW5cbiAgICBpc0RhdGFGaWx0ZXJpbmdFbmFibGVkKCkge1xuICAgICAgICAvKlF1ZXJ5IG5lZWQgdG8gYmUgdHJpZ2dlcmVkIGlmIGFueSBvZiB0aGUgZm9sbG93aW5nIGNhc2VzIHNhdGlzZnlcbiAgICAgICAgKiAxLiBHcm91cCBCeSBhbmQgYWdncmVnYXRpb24gYm90aCBjaG9zZW5cbiAgICAgICAgKiAyLiBPbmx5IE9yZGVyIEJ5IGlzIGNob3NlblxuICAgICAgICAqICovXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBZ2dyZWdhdGlvbkVuYWJsZWQoKSB8fCAoIXRoaXMuaXNWaXN1YWxseUdyb3VwZWQgJiYgdGhpcy5vcmRlcmJ5KTtcbiAgICB9XG5cbiAgICAvKkNoYXJ0cyBsaWtlIExpbmUsQXJlYSxDdW11bGF0aXZlIExpbmUgZG9lcyBub3Qgc3VwcG9ydCBhbnkgb3RoZXIgZGF0YXR5cGVcbiAgICAgICAgb3RoZXIgdGhhbiBpbnRlZ2VyIHVubGlrZSB0aGUgY29sdW1uIGFuZCBiYXIuSXQgaXMgYSBudmQzIGlzc3VlLiBJbm9yZGVyIHRvXG4gICAgICAgIHN1cHBvcnQgdGhhdCB0aGlzIGlzIGEgZml4Ki9cbiAgICBnZXR4QXhpc1ZhbChkYXRhT2JqLCB4S2V5LCBpbmRleCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IF8uZ2V0KGRhdGFPYmosIHhLZXkpO1xuICAgICAgICAvLyBJZiB4IGF4aXMgaXMgb3RoZXIgdGhhbiBudW1iZXIgdHlwZSB0aGVuIGFkZCBpbmRleGVzXG4gICAgICAgIGlmIChpc0xpbmVUeXBlQ2hhcnQodGhpcy50eXBlKSAmJiAhaXNOdW1iZXJUeXBlKHRoaXMueEF4aXNEYXRhVHlwZSkpIHtcbiAgICAgICAgICAgIC8vIFZlcmlmaWNhdGlvbiB0byBnZXQgdGhlIHVuaXF1ZSBkYXRhIGtleXNcbiAgICAgICAgICAgIHRoaXMueERhdGFLZXlBcnIucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIEdldHRpbmcgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBhbW9uZyBhbGwgdGhlIHggdmFsdWVzXG4gICAgZ2V0WE1pbk1heFZhbHVlcyhkYXR1bSkge1xuICAgICAgICBpZiAoIWRhdHVtKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeFZhbHVlczogYW55ID0ge307XG4gICAgICAgIC8qXG4gICAgICAgICBjb21wdXRlIHRoZSBtaW4geCB2YWx1ZVxuICAgICAgICAgZWc6IFdoZW4gZGF0YSBoYXMgb2JqZWN0c1xuICAgICAgICAgICAgaW5wdXQ6IFt7eDoxLCB5OjJ9LCB7eDoyLCB5OjN9LCB7eDozLCB5OjR9XVxuICAgICAgICAgICAgbWluIHg6IDFcbiAgICAgICAgIGVnOiBXaGVuIGRhdGEgaGFzIGFycmF5c1xuICAgICAgICAgICAgaW5wdXQ6IFtbMTAsIDIwXSwgWzIwLCAzMF0sIFszMCwgNDBdXTtcbiAgICAgICAgICAgIG1pbiB4OiAxMFxuICAgICAgICAqL1xuICAgICAgICB4VmFsdWVzLm1pbiA9IF8ubWluQnkoZGF0dW0udmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueCB8fCBkYXRhT2JqZWN0WzBdKTtcbiAgICAgICAgLypcbiAgICAgICAgIGNvbXB1dGUgdGhlIG1heCB4IHZhbHVlXG4gICAgICAgICBlZzogV2hlbiBkYXRhIGhhcyBvYmplY3RzXG4gICAgICAgICAgICBpbnB1dDogW3t4OjEsIHk6Mn0sIHt4OjIsIHk6M30sIHt4OjMsIHk6NH1dXG4gICAgICAgICAgICBtYXggeDogM1xuICAgICAgICAgZWc6IFdoZW4gZGF0YSBoYXMgYXJyYXlzXG4gICAgICAgICAgICBpbnB1dDogW1sxMCwgMjBdLCBbMjAsIDMwXSwgWzMwLCA0MF1dO1xuICAgICAgICAgICAgbWF4IHg6IDMwXG4gICAgICAgICAqL1xuICAgICAgICB4VmFsdWVzLm1heCA9IF8ubWF4QnkoZGF0dW0udmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueCB8fCBkYXRhT2JqZWN0WzBdKTtcbiAgICAgICAgcmV0dXJuIHhWYWx1ZXM7XG4gICAgfVxuXG4gICAgLy8gR2V0dGluZyB0aGUgbWluIGFuZCBtYXggdmFsdWVzIGFtb25nIGFsbCB0aGUgeSB2YWx1ZXNcbiAgICBnZXRZTWluTWF4VmFsdWVzKGRhdHVtKSB7XG4gICAgICAgIGNvbnN0IHlWYWx1ZXM6IGFueSA9IHt9LFxuICAgICAgICAgICAgbWluVmFsdWVzID0gW10sXG4gICAgICAgICAgICBtYXhWYWx1ZXMgPSBbXTtcbiAgICAgICAgaWYgKCFkYXR1bSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgIEdldHRpbmcgdGhlIG1pbiBhbmQgbWF4IHkgdmFsdWVzIGFtb25nIGFsbCB0aGUgc2VyaWVzIG9mIGRhdGFcbiAgICAgICAgIGNvbXB1dGUgdGhlIG1pbiB5IHZhbHVlXG4gICAgICAgICBlZzogV2hlbiBkYXRhIGhhcyBvYmplY3RzXG4gICAgICAgICAgICBpbnB1dDogW1t7eDoxLCB5OjJ9LCB7eDoyLCB5OjN9LCB7eDozLCB5OjR9XSwgW3t4OjIsIHk6M30sIHt4OjMsIHk6NH0sIHt4OjQsIHk6NX1dXVxuICAgICAgICAgICAgbWluIHkgdmFsdWVzIDogJzInKGFtb25nIGZpcnN0IHNldCkgJiAnMycoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICAgIG1heCB5IHZhbHVlcyA6ICc0JyhhbW9uZyBmaXJzdCBzZXQpICYgJzUnKGFtb25nIHNlY29uZCBzZXQpXG5cbiAgICAgICAgIGVnOiBXaGVuIGRhdGEgaGFzIGFycmF5c1xuICAgICAgICAgICAgaW5wdXQ6IFtbWzEwLCAyMF0sIFsyMCwgMzBdLCBbMzAsIDQwXV0sIFtbMjAsIDMwXSwgWzMwLCA0MF0sIFs0MCwgNTBdXV1cbiAgICAgICAgICAgIG1pbiB5IHZhbHVlcyA6ICcyMCcoYW1vbmcgZmlyc3Qgc2V0KSAmICczMCcoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICAgIG1heCB5IHZhbHVlcyA6ICc0MCcoYW1vbmcgZmlyc3Qgc2V0KSAmICc1MCcoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICovXG5cbiAgICAgICAgXy5mb3JFYWNoKGRhdHVtLCBkYXRhID0+IHtcbiAgICAgICAgICAgIG1pblZhbHVlcy5wdXNoKF8ubWluQnkoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uIChkYXRhT2JqZWN0KSB7IHJldHVybiBkYXRhT2JqZWN0LnkgfHwgZGF0YU9iamVjdFsxXTsgfSkpO1xuICAgICAgICAgICAgbWF4VmFsdWVzLnB1c2goXy5tYXhCeShkYXRhLnZhbHVlcywgZnVuY3Rpb24gKGRhdGFPYmplY3QpIHsgcmV0dXJuIGRhdGFPYmplY3QueSB8fCBkYXRhT2JqZWN0WzFdOyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBHZXRzIHRoZSBsZWFzdCBhbmQgaGlnaGVzdCB2YWx1ZXMgYW1vbmcgYWxsIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMgb2YgcmVzcGVjdGl2ZSBzZXJpZXMgb2YgZGF0YVxuICAgICAgICB5VmFsdWVzLm1pbiA9IF8ubWluQnkobWluVmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueSB8fCBkYXRhT2JqZWN0WzFdKTtcbiAgICAgICAgeVZhbHVlcy5tYXggPSBfLm1heEJ5KG1heFZhbHVlcywgZGF0YU9iamVjdCA9PiBkYXRhT2JqZWN0LnkgfHwgZGF0YU9iamVjdFsxXSk7XG4gICAgICAgIHJldHVybiB5VmFsdWVzO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB4LWF4aXMgdmFsdWVzIGFyZSB1bmRlZmluZWQsIHdlIHJldHVybiBlbXB0eSBhcnJheSBlbHNlIHdlIHJldHVybiB0aGUgdmFsdWVzXG4gICAgZ2V0VmFsaWREYXRhKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gKHZhbHVlcy5sZW5ndGggPT09IDEgJiYgdmFsdWVzWzBdID09PSB1bmRlZmluZWQpID8gW10gOiB2YWx1ZXM7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgc2luZ2xlIGRhdGEgcG9pbnQgYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIGRhdGEgY2hhcnQgYWNjZXB0c1xuICAgIHZhbHVlRmluZGVyKGRhdGFPYmosIHhLZXksIHlLZXksIGluZGV4Pywgc2hhcGU/KSB7XG4gICAgICAgIGNvbnN0IHhWYWwgPSB0aGlzLmdldHhBeGlzVmFsKGRhdGFPYmosIHhLZXksIGluZGV4KSxcbiAgICAgICAgICAgIHZhbHVlID0gXy5nZXQoZGF0YU9iaiwgeUtleSksXG4gICAgICAgICAgICB5VmFsID0gcGFyc2VGbG9hdCh2YWx1ZSkgfHwgdmFsdWUsXG4gICAgICAgICAgICBzaXplID0gcGFyc2VGbG9hdChkYXRhT2JqW3RoaXMuYnViYmxlc2l6ZV0pIHx8IDI7XG4gICAgICAgIGxldCBkYXRhUG9pbnQ6IGFueSA9IHt9O1xuXG4gICAgICAgIGlmIChpc0NoYXJ0RGF0YUpTT04odGhpcy50eXBlKSkge1xuICAgICAgICAgICAgZGF0YVBvaW50LnggPSB4VmFsO1xuICAgICAgICAgICAgZGF0YVBvaW50LnkgPSB5VmFsO1xuICAgICAgICAgICAgLy8gb25seSBCdWJibGUgY2hhcnQgaGFzIHRoZSB0aGlyZCBkaW1lbnNpb25cbiAgICAgICAgICAgIGlmIChpc0J1YmJsZUNoYXJ0KHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhUG9pbnQuc2l6ZSA9IHNpemU7XG4gICAgICAgICAgICAgICAgZGF0YVBvaW50LnNoYXBlID0gc2hhcGUgfHwgJ2NpcmNsZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNDaGFydERhdGFBcnJheSh0aGlzLnR5cGUpKSB7XG4gICAgICAgICAgICBkYXRhUG9pbnQgPSBbeFZhbCwgeVZhbF07XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkaW5nIGFjdHVhbCB1bndyYXBwZWQgZGF0YSB0byBjaGFydCBkYXRhIHRvIHVzZSBhdCB0aGUgdGltZSBvZiBzZWxlY3RlZCBkYXRhIHBvaW50IG9mIGNoYXJ0IGV2ZW50XG4gICAgICAgIGRhdGFQb2ludC5fZGF0YU9iaiA9IGRhdGFPYmo7XG4gICAgICAgIHJldHVybiBkYXRhUG9pbnQ7XG4gICAgfVxuXG4gICAgLy8gU2V0dGluZyBhcHByb3ByaWF0ZSBlcnJvciBtZXNzYWdlc1xuICAgIHNldEVyck1zZyhtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLnNob3dOb0RhdGFNc2cpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnRMb2FkRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkQ29uZmlnID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIFRPRE86IFNldCB0aGUgbG9jYWxlIGZyb20gdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgIHRoaXMuZXJyTXNnID0gJyc7IC8vICRyb290U2NvcGUubG9jYWxlW21lc3NhZ2VdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc0NoYXJ0RGF0YSgpIHtcbiAgICAgICAgdGhpcy5zYW1wbGVEYXRhID0gZ2V0U2FtcGxlRGF0YSh0aGlzKTtcbiAgICAgICAgLy8gc2NvcGUgdmFyaWFibGVzIHVzZWQgdG8ga2VlcCB0aGUgYWN0dWFsIGtleSB2YWx1ZXMgZm9yIHgtYXhpc1xuICAgICAgICB0aGlzLnhEYXRhS2V5QXJyID0gW107XG4gICAgICAgIC8vIFBsb3R0aW5nIHRoZSBjaGFydCB3aXRoIHNhbXBsZSBkYXRhIHdoZW4gdGhlIGNoYXJ0IGRhdGFzZXQgaXMgbm90IGJvdW5kXG4gICAgICAgIGlmICghdGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgdGhpcy54RGF0YUtleUFyciA9IGdldERhdGVMaXN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zYW1wbGVEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNoYXJ0RGF0YSB8fCAhdGhpcy5jaGFydERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGF0dW0gPSBbXSxcbiAgICAgICAgICAgIHlBeGlzS2V5LFxuICAgICAgICAgICAgc2hhcGVzOiBhbnkgPSBbXSxcbiAgICAgICAgICAgIHZhbHVlczogYW55ID0gW107XG4gICAgICAgIGNvbnN0IHhBeGlzS2V5ID0gdGhpcy54YXhpc2RhdGFrZXksXG4gICAgICAgICAgICB5QXhpc0tleXMgPSB0aGlzLnlheGlzZGF0YWtleSA/IHRoaXMueWF4aXNkYXRha2V5LnNwbGl0KCcsJykgOiBbXSxcbiAgICAgICAgICAgIGRhdGFTZXQgPSB0aGlzLmNoYXJ0RGF0YTtcblxuICAgICAgICBpZiAoXy5pc0FycmF5KGRhdGFTZXQpKSB7XG4gICAgICAgICAgICBpZiAoaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICB5QXhpc0tleSA9IHlBeGlzS2V5c1swXTtcbiAgICAgICAgICAgICAgICBkYXR1bSA9IF8ubWFwKGRhdGFTZXQsIChkYXRhT2JqLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlPYmplY3QoZGF0YVNldFtpbmRleF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZUZpbmRlcihkYXRhU2V0W2luZGV4XSwgeEF4aXNLZXksIHlBeGlzS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRhdHVtID0gdGhpcy5nZXRWYWxpZERhdGEoZGF0dW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCdWJibGVDaGFydCh0aGlzLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXBlcyA9IHRoaXMuc2hhcGUgPT09ICdyYW5kb20nID8gYWxsU2hhcGVzIDogdGhpcy5zaGFwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeUF4aXNLZXlzLmZvckVhY2goKHlBeGlzS2V5LCBzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gIF8ubWFwKGRhdGFTZXQsIChkYXRhT2JqLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5T2JqZWN0KGRhdGFTZXRbaW5kZXhdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlRmluZGVyKGRhdGFTZXRbaW5kZXhdLCB4QXhpc0tleSwgeUF4aXNLZXksIGluZGV4LCAoXy5pc0FycmF5KHNoYXBlcykgJiYgc2hhcGVzW3Nlcmllc10pIHx8IHRoaXMuc2hhcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5nZXRWYWxpZERhdGEodmFsdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0dW0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcHJldHRpZnlMYWJlbHMoeUF4aXNLZXkpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9XG5cbiAgICBzZXRDaGFydERhdGEoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkRGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDaGFydERhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzZWREYXRhO1xuICAgIH1cblxuICAgIC8vIGNvbnN0cnVjdGluZyB0aGUgZ3JvdXBlZCBkYXRhIGJhc2VkIG9uIHRoZSBzZWxlY3Rpb24gb2Ygb3JkZXJieSwgeCAmIHkgYXhpc1xuICAgIGdldFZpc3VhbGx5R3JvdXBlZERhdGEocXVlcnlSZXNwb25zZSwgZ3JvdXBpbmdDb2x1bW4pIHtcbiAgICAgICAgbGV0IGdyb3VwRGF0YTogYW55ID0ge30sXG4gICAgICAgICAgICBncm91cFZhbHVlczogYW55ID0gW10sXG4gICAgICAgICAgICBvcmRlckJ5RGV0YWlscyxcbiAgICAgICAgICAgIG1heExlbmd0aDtcbiAgICAgICAgY29uc3QgY2hhcnREYXRhOiBhbnkgPSBbXSxcbiAgICAgICAgICAgIF9pc0FyZWFDaGFydCA9IGlzQXJlYUNoYXJ0KHRoaXMudHlwZSksXG4gICAgICAgICAgICB5QXhpc0tleSA9IF8uZmlyc3QoXy5zcGxpdCh0aGlzLnlheGlzZGF0YWtleSwgJywnKSk7XG4gICAgICAgIHRoaXMueERhdGFLZXlBcnIgPSBbXTtcbiAgICAgICAgcXVlcnlSZXNwb25zZSA9IF8ub3JkZXJCeShxdWVyeVJlc3BvbnNlLCBfLnNwbGl0KHRoaXMuZ3JvdXBieSwgJywnKSk7XG4gICAgICAgIGlmICh0aGlzLm9yZGVyYnkpIHtcbiAgICAgICAgICAgIG9yZGVyQnlEZXRhaWxzID0gZ2V0TG9kYXNoT3JkZXJCeUZvcm1hdCh0aGlzLm9yZGVyYnkpO1xuICAgICAgICAgICAgcXVlcnlSZXNwb25zZSA9IF8ub3JkZXJCeShxdWVyeVJlc3BvbnNlLCBvcmRlckJ5RGV0YWlscy5jb2x1bW5zLCBvcmRlckJ5RGV0YWlscy5vcmRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXJ5UmVzcG9uc2UgPSBfLmdyb3VwQnkocXVlcnlSZXNwb25zZSwgZ3JvdXBpbmdDb2x1bW4pO1xuICAgICAgICAvLyBJbiBjYXNlIG9mIGFyZWEgY2hhcnQgYWxsIHRoZSBzZXJpZXMgZGF0YSBzaG91bGQgYmUgb2Ygc2FtZSBsZW5ndGhcbiAgICAgICAgaWYgKF9pc0FyZWFDaGFydCkge1xuICAgICAgICAgICAgbWF4TGVuZ3RoID0gXy5tYXgoXy5tYXAocXVlcnlSZXNwb25zZSwgb2JqID0+IG9iai5sZW5ndGgpKTtcbiAgICAgICAgfVxuICAgICAgICBfLmZvckVhY2gocXVlcnlSZXNwb25zZSwgKHZhbHVlcywgZ3JvdXBLZXkpID0+IHtcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzID0gaXNBcmVhQ2hhcnQgPyBfLmZpbGwobmV3IEFycmF5KG1heExlbmd0aCksIFswLCAwXSkgOiBbXTtcbiAgICAgICAgICAgIF8uZm9yRWFjaFJpZ2h0KHZhbHVlcywgKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwVmFsdWVzW2luZGV4XSA9IHRoaXMudmFsdWVGaW5kZXIodmFsdWUsIHRoaXMueGF4aXNkYXRha2V5LCB5QXhpc0tleSwgaW5kZXgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBncm91cERhdGEgPSB7XG4gICAgICAgICAgICAgICAga2V5IDogZ3JvdXBLZXksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogZ3JvdXBWYWx1ZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChncm91cERhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNoYXJ0RGF0YTtcbiAgICB9XG5cbiAgICAvKkRlY2lkZXMgd2hldGhlciB0aGUgZGF0YSBzaG91bGQgYmUgdmlzdWFsbHkgZ3JvdXBlZCBvciBub3RcbiAgICAgICAgICAgIFZpc3VhbGx5IGdyb3VwZWQgd2hlbiBhIGRpZmZlcmVudCBjb2x1bW4gaXMgY2hvb3NlbiBpbiB0aGUgZ3JvdXAgYnkgb3RoZXIgdGhhbiB4IGFuZCB5IGF4aXMgYW5kIGFnZ3JlZ2F0aW9uIGlzIG5vdCBjaG9zZW4qL1xuICAgIGdldEdyb3VwaW5nRGV0YWlscygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNHcm91cEJ5RW5hYmxlZCgpICYmICF0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGxldCBpc1Zpc3VhbGx5R3JvdXBlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZpc3VhbEdyb3VwaW5nQ29sdW1uLFxuICAgICAgICAgICAgICAgIGdyb3VwaW5nRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiBhbnkgPSBbXSxcbiAgICAgICAgICAgICAgICBncm91cGluZ0NvbHVtbkluZGV4O1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBieUNvbHVtbnMgPSB0aGlzLmdyb3VwYnkgJiYgdGhpcy5ncm91cGJ5ICE9PSBOT05FID8gdGhpcy5ncm91cGJ5LnNwbGl0KCcsJykgOiBbXSxcbiAgICAgICAgICAgICAgICB5QXhpc0tleXMgPSB0aGlzLnlheGlzZGF0YWtleSA/IHRoaXMueWF4aXNkYXRha2V5LnNwbGl0KCcsJykgOiBbXTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwYnlDb2x1bW5zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAvKkdldHRpbmcgdGhlIGdyb3VwIGJ5IGNvbHVtbiB3aGljaCBpcyBub3Qgc2VsZWN0ZWQgZWl0aGVyIGluIHggb3IgeSBheGlzKi9cbiAgICAgICAgICAgICAgICBncm91cGJ5Q29sdW1ucy5ldmVyeSgoY29sdW1uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54YXhpc2RhdGFrZXkgIT09IGNvbHVtbiAmJiAkLmluQXJyYXkoY29sdW1uLCB5QXhpc0tleXMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNWaXN1YWxseUdyb3VwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzdWFsR3JvdXBpbmdDb2x1bW4gPSBjb2x1bW47XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cGluZ0NvbHVtbkluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cGJ5Q29sdW1ucy5zcGxpY2UoZ3JvdXBpbmdDb2x1bW5JbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0aW5nIHRoZSBncm91cGJ5IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICBpZiAodmlzdWFsR3JvdXBpbmdDb2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucy5wdXNoKHZpc3VhbEdyb3VwaW5nQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBieUNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMgPSBfLmNvbmNhdChjb2x1bW5zLCBncm91cGJ5Q29sdW1ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgeCBhbmQgeSBheGlzIGFyZSBub3QgaW5jbHVkZWQgaW4gYWdncmVnYXRpb24gbmVlZCB0byBiZSBpbmNsdWRlZCBpbiBncm91cGJ5XG4gICAgICAgICAgICBpZiAodGhpcy54YXhpc2RhdGFrZXkgIT09IHRoaXMuYWdncmVnYXRpb25jb2x1bW4pIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2godGhpcy54YXhpc2RhdGFrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5mb3JFYWNoKHlBeGlzS2V5cywga2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLmFnZ3JlZ2F0aW9uY29sdW1uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3JvdXBpbmdFeHByZXNzaW9uID0gIGNvbHVtbnMuam9pbignLCcpO1xuICAgICAgICAgICAgLy8gc2V0IGlzVmlzdWFsbHlHcm91cGVkIGZsYWcgaW4gc2NvcGUgZm9yIGxhdGVyIHVzZVxuICAgICAgICAgICAgdGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCA9IGlzVmlzdWFsbHlHcm91cGVkO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGdyb3VwaW5nRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICBpc1Zpc3VhbGx5R3JvdXBlZDogaXNWaXN1YWxseUdyb3VwZWQsXG4gICAgICAgICAgICAgICAgdmlzdWFsR3JvdXBpbmdDb2x1bW46IHZpc3VhbEdyb3VwaW5nQ29sdW1uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBleHByZXNzaW9uOiAnJyxcbiAgICAgICAgICAgIGlzVmlzdWFsbHlHcm91cGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHZpc3VhbEdyb3VwaW5nQ29sdW1uOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHRvIGdldCB0aGUgYWdncmVnYXRlZCBkYXRhIGFmdGVyIGFwcGx5aW5nIHRoZSBhZ2dyZWdhdGlvbiAmIGdyb3VwIGJ5IG9yIG9yZGVyIGJ5IG9wZXJhdGlvbnMuXG4gICAgZ2V0QWdncmVnYXRlZERhdGEoY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgdmFyaWFibGU6IGFueSA9IHRoaXMuZGF0YXNvdXJjZSxcbiAgICAgICAgICAgIHlBeGlzS2V5cyA9IHRoaXMueWF4aXNkYXRha2V5ID8gdGhpcy55YXhpc2RhdGFrZXkuc3BsaXQoJywnKSA6IFtdLFxuICAgICAgICAgICAgZGF0YTogYW55ID0ge307XG4gICAgICAgIGxldCBzb3J0RXhwcixcbiAgICAgICAgICAgIGNvbHVtbnM6IGFueSA9IFtdLFxuICAgICAgICAgICAgY29sQWxpYXMsXG4gICAgICAgICAgICBvcmRlckJ5Q29sdW1ucyxcbiAgICAgICAgICAgIGdyb3VwQnlGaWVsZHM6IGFueSA9IFtdO1xuXG4gICAgICAgIGlmICghdmFyaWFibGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGdyb3VwQnlGaWVsZHMgPSBfLnNwbGl0KHRoaXMuZ3JvdXBieSwgJywnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcmRlcmJ5KSB7XG4gICAgICAgICAgICBzb3J0RXhwciA9IF8ucmVwbGFjZSh0aGlzLm9yZGVyYnksIC86L2csICcgJyk7XG4gICAgICAgICAgICBjb2x1bW5zID0gXy51bmlxKF8uY29uY2F0KGNvbHVtbnMsIGdyb3VwQnlGaWVsZHMsIFt0aGlzLmFnZ3JlZ2F0aW9uY29sdW1uXSkpO1xuICAgICAgICAgICAgb3JkZXJCeUNvbHVtbnMgPSBnZXRMb2Rhc2hPcmRlckJ5Rm9ybWF0KHRoaXMub3JkZXJieSkuY29sdW1ucztcbiAgICAgICAgICAgIC8vIElmIHRoZSBvcmRlcmJ5IGNvbHVtbiBpcyBjaG9zZW4gZWl0aGVyIGluIGdyb3VwYnkgb3Igb3JkZXJieSB0aGVuIHJlcGxhY2UgLiB3aXRoICQgZm9yIHRoYXQgY29sdW1uXG4gICAgICAgICAgICBfLmZvckVhY2goXy5pbnRlcnNlY3Rpb24oY29sdW1ucywgb3JkZXJCeUNvbHVtbnMpLCBjb2wgPT4ge1xuICAgICAgICAgICAgICAgIGNvbEFsaWFzID0gZ2V0VmFsaWRBbGlhc05hbWUoY29sKTtcbiAgICAgICAgICAgICAgICBzb3J0RXhwciA9IF8ucmVwbGFjZShzb3J0RXhwciwgY29sLCBjb2xBbGlhcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAvLyBTZW5kIHRoZSBncm91cCBieSBpbiB0aGUgYWdncmVnYXRpb25zIGFwaSBvbmx5IGlmIGFnZ3JlZ2F0aW9uIGlzIGFsc28gY2hvc2VuXG4gICAgICAgICAgICBkYXRhLmdyb3VwQnlGaWVsZHMgPSBncm91cEJ5RmllbGRzO1xuICAgICAgICAgICAgZGF0YS5hZ2dyZWdhdGlvbnMgPSAgW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJ2ZpZWxkJzogdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAgYWdncmVnYXRpb25Gbk1hcFt0aGlzLmFnZ3JlZ2F0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgJ2FsaWFzJzogZ2V0VmFsaWRBbGlhc05hbWUodGhpcy5hZ2dyZWdhdGlvbmNvbHVtbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV4ZWN1dGUgdGhlIHF1ZXJ5LlxuICAgICAgICB2YXJpYWJsZS5leGVjdXRlKCdnZXRBZ2dyZWdhdGVkRGF0YScsIHtcbiAgICAgICAgICAgICdhZ2dyZWdhdGlvbnMnIDogZGF0YSxcbiAgICAgICAgICAgICdzb3J0JyAgICAgICAgIDogc29ydEV4cHJcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJlc3VsdCBpbnRvIGEgZm9ybWF0IHN1cHBvcnRlZCBieSB0aGUgY2hhcnQuXG4gICAgICAgICAgICBjb25zdCBjaGFydERhdGE6IGFueSA9IFtdLFxuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uQWxpYXM6IGFueSA9IGdldFZhbGlkQWxpYXNOYW1lKHRoaXMuYWdncmVnYXRpb25jb2x1bW4pLFxuICAgICAgICAgICAgICAgIHhBeGlzQWxpYXNLZXkgPSBnZXRWYWxpZEFsaWFzTmFtZSh0aGlzLnhheGlzZGF0YWtleSksXG4gICAgICAgICAgICAgICAgeUF4aXNBbGlhc0tleXMgPSBbXTtcblxuICAgICAgICAgICAgeUF4aXNLZXlzLmZvckVhY2goeUF4aXNLZXkgPT4geUF4aXNBbGlhc0tleXMucHVzaChnZXRWYWxpZEFsaWFzTmFtZSh5QXhpc0tleSkpKTtcblxuICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3BvbnNlLmJvZHkuY29udGVudCwgKHJlc3BvbnNlQ29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2UgaW4gdGhlIGNoYXJ0RGF0YSBiYXNlZCBvbiAnYWdncmVnYXRpb25Db2x1bW4nLCAneEF4aXNEYXRhS2V5JyAmICd5QXhpc0RhdGFLZXknLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3RoaXMuYWdncmVnYXRpb25jb2x1bW5dID0gcmVzcG9uc2VDb250ZW50W2FnZ3JlZ2F0aW9uQWxpYXNdO1xuICAgICAgICAgICAgICAgICAgICBvYmpbdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbl0gPSBfLmdldChyZXNwb25zZUNvbnRlbnQsIGFnZ3JlZ2F0aW9uQWxpYXMpIHx8IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2JqW3RoaXMueGF4aXNkYXRha2V5XSA9IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgeEF4aXNBbGlhc0tleSkgfHwgXy5nZXQocmVzcG9uc2VDb250ZW50LCB0aGlzLnhheGlzZGF0YWtleSk7XG5cbiAgICAgICAgICAgICAgICB5QXhpc0tleXMuZm9yRWFjaCgoeUF4aXNLZXksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ialt5QXhpc0tleV0gPSByZXNwb25zZUNvbnRlbnRbeUF4aXNBbGlhc0tleXNbaW5kZXhdXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3lBeGlzS2V5XSA9IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgeUF4aXNBbGlhc0tleXNbaW5kZXhdKSB8fCBfLmdldChyZXNwb25zZUNvbnRlbnQsIHlBeGlzS2V5KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5jaGFydERhdGEgPSBjaGFydERhdGE7XG5cbiAgICAgICAgICAgIHRyaWdnZXJGbihjYWxsYmFjayk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhcnREYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLnNldEVyck1zZygnTUVTU0FHRV9FUlJPUl9GRVRDSF9EQVRBJyk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNldHMgbWF4aW11bSB3aWR0aCBmb3IgdGhlIGxhYmVscyB0aGF0IGNhbiBiZSBkaXNwbGF5ZWQuVGhpcyB3aWxsIGhlbHBmdWwgd2hlbiB0aGV5IGFyZSBvdmVybGFwcGluZ1xuICAgIHNldExhYmVsc01heFdpZHRoKCkge1xuICAgICAgICBsZXQgeFRpY2tzLFxuICAgICAgICAgICAgdGlja1dpZHRoLFxuICAgICAgICAgICAgbWF4TGVuZ3RoLFxuICAgICAgICAgICAgeERpc3QsXG4gICAgICAgICAgICB5RGlzdCxcbiAgICAgICAgICAgIHRvdGFsSGVpZ2h0LFxuICAgICAgICAgICAgbWF4Tm9MYWJlbHMsXG4gICAgICAgICAgICBudGhFbGVtZW50LFxuICAgICAgICAgICAgbGFiZWxzQXZhaWxhYmxlV2lkdGgsXG4gICAgICAgICAgICBiYXJXcmFwcGVyLFxuICAgICAgICAgICAgeUF4aXNXcmFwcGVyLFxuICAgICAgICAgICAgc3ZnV3JhcHBlcjtcbiAgICAgICAgY29uc3QgZm9udHNpemUgPSBwYXJzZUludCh0aGlzLmZvbnRzaXplLCAxMCkgfHwgMTIsXG4gICAgICAgICAgICBpc0JhcmNoYXJ0ID0gaXNCYXJDaGFydCh0aGlzLnR5cGUpO1xuICAgICAgICAvLyBnZXR0aW5nIHRoZSB4IHRpY2tzIGluIHRoZSBjaGFydFxuICAgICAgICB4VGlja3MgPSAkKCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJykuZmluZCgnZy5udi14JykuZmluZCgnZy50aWNrJykuZmluZCgndGV4dCcpO1xuXG4gICAgICAgIC8vIGdldHRpbmcgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byB2aXNpYmxlIHRpY2tzIGFzc29jaWF0ZWQgd2l0aCB2aXNpYmxlIHRleHRcbiAgICAgICAgeFRpY2tzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgeFRpY2sgPSAkKHRoaXMpO1xuICAgICAgICAgICAgbGV0IHhUcmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgdGlja0Rpc3Q7XG4gICAgICAgICAgICBpZiAoeFRpY2sudGV4dCgpICYmIHhUaWNrLmNzcygnb3BhY2l0eScpID09PSAnMScpIHtcbiAgICAgICAgICAgICAgICB4VHJhbnNmb3JtID0geFRpY2sucGFyZW50KCkuYXR0cigndHJhbnNmb3JtJykuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICB4RGlzdCA9IHBhcnNlRmxvYXQoeFRyYW5zZm9ybVswXS5zdWJzdHIoMTApKTtcbiAgICAgICAgICAgICAgICB5RGlzdCA9IHBhcnNlRmxvYXQoeFRyYW5zZm9ybVsxXSB8fCAnMCcpO1xuICAgICAgICAgICAgICAgIGlmICghaXNCYXJjaGFydCAmJiB4RGlzdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGlja0Rpc3QgPSB4RGlzdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHlEaXN0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrRGlzdCA9IHlEaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGlja1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2tXaWR0aCA9IHRpY2tEaXN0IC0gdGlja1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRpY2tXaWR0aCA9IHRpY2tEaXN0O1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIGJhciBjaGFydCBnZXR0aW5nIHRoZSBhdmFpbGFibGUgc3BhY2UgZm9yIHRoZSBsYWJlbHMgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGlmIChpc0JhcmNoYXJ0KSB7XG4gICAgICAgICAgICBiYXJXcmFwcGVyID0gJCgnI3dtQ2hhcnQnICsgdGhpcy4kaWQgKyAnIHN2Zz5nLm52LXdyYXA+Zz5nLm52LWJhcnNXcmFwJylbMF07XG4gICAgICAgICAgICB5QXhpc1dyYXBwZXIgPSAkKCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnPmcubnYtd3JhcD5nPmcubnYteScpWzBdO1xuICAgICAgICAgICAgc3ZnV3JhcHBlciA9ICQoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKVswXTtcbiAgICAgICAgICAgIC8vIGdldHRpbmcgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgY2hhcnRcbiAgICAgICAgICAgIHRvdGFsSGVpZ2h0ID0gYmFyV3JhcHBlciA/IGJhcldyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IDogMDtcbiAgICAgICAgICAgIC8vIGdldHRpbmcgdGhlIGxhYmVscyBhdmFpbGFibGUgc3BhY2VcbiAgICAgICAgICAgIGxhYmVsc0F2YWlsYWJsZVdpZHRoID0geUF4aXNXcmFwcGVyID8gc3ZnV3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAtIHlBeGlzV3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCA6IHN2Z1dyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBtYXggbGVuZ3RoIGZvciB0aGUgbGFiZWxcbiAgICAgICAgICAgIG1heExlbmd0aCA9IE1hdGgucm91bmQobGFiZWxzQXZhaWxhYmxlV2lkdGggLyBmb250c2l6ZSk7XG4gICAgICAgICAgICAvLyBpZiBhdmFpbGFibGUgc3BhY2UgZm9yIGVhY2ggbGFiZWwgaXMgbGVzcyB0aGFuIHRoZSBmb250LXNpemVcbiAgICAgICAgICAgIC8vIHRoZW4gbGltaXRpbmcgdGhlIGxhYmVscyB0byBiZSBkaXNwbGF5ZWRcbiAgICAgICAgICAgIGlmICh0aWNrV2lkdGggPCBmb250c2l6ZSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWF4aW11bSBubyBvZiBsYWJlbHMgdG8gYmUgZml0dGVkXG4gICAgICAgICAgICAgICAgbWF4Tm9MYWJlbHMgPSB0b3RhbEhlaWdodCAvIGZvbnRzaXplO1xuICAgICAgICAgICAgICAgIC8vIHNob3dpbmcgb25seSB0aGUgbnRoIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBudGhFbGVtZW50ID0gTWF0aC5jZWlsKHRoaXMuY2hhcnREYXRhLmxlbmd0aCAvIG1heE5vTGFiZWxzKTtcbiAgICAgICAgICAgICAgICAvLyBzaG93aW5nIHVwIG9ubHkgc29tZSBsYWJlbHNcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKS5zZWxlY3QoJ2cubnYteCcpLnNlbGVjdEFsbCgnZy50aWNrJykuc2VsZWN0KCd0ZXh0JykuZWFjaChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBoaWRpbmcgZXZlcnkgbm9uIG50aCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICUgbnRoRWxlbWVudCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ29wYWNpdHknLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2V0dGluZyB0aGUgbWF4IGxlbmd0aCBmb3IgdGhlIGxhYmVsXG4gICAgICAgICAgICBtYXhMZW5ndGggPSBNYXRoLnJvdW5kKHRpY2tXaWR0aCAvIGZvbnRzaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1heExlbmd0aCBzaG91bGQgYWx3YXlzIGJlIGEgcG9zaXRpdmUgbnVtYmVyXG4gICAgICAgIG1heExlbmd0aCA9IE1hdGguYWJzKG1heExlbmd0aCk7XG4gICAgICAgIC8vIFZhbGlkYXRpbmcgaWYgZXZlcnkgbGFiZWwgZXhjZWVkcyB0aGUgbWF4IGxlbmd0aCBhbmQgaWYgc28gbGltaXRpbmcgdGhlIGxlbmd0aCBhbmQgYWRkaW5nIGVsbGlwc2lzXG4gICAgICAgIHhUaWNrcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRDb250ZW50Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSB0aGlzLnRleHRDb250ZW50LnN1YnN0cigwLCBtYXhMZW5ndGgpICsgJy4uLic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGNvbHVtbnMgb2YgdGhhdCBjYW4gYmUgY2hvb3NlbiBpbiB0aGUgeCBhbmQgeSBheGlzXG4gICAgZ2V0RGVmYXVsdENvbHVtbnMoKSB7XG4gICAgICAgIGxldCB0eXBlLFxuICAgICAgICAgICAgc3RyaW5nQ29sdW1uLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHRlbXA7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0gW10sXG4gICAgICAgICAgICBjb2x1bW5zID0gdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1BST1BFUlRJRVNfTUFQKSB8fCBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGggJiYgZGVmYXVsdENvbHVtbnMubGVuZ3RoIDw9IDI7IGkgKz0gMSkge1xuICAgICAgICAgICAgdHlwZSA9IGNvbHVtbnNbaV0udHlwZTtcbiAgICAgICAgICAgIGlmICghY29sdW1uc1tpXS5pc1JlbGF0ZWQgJiYgKGlzTnVtYmVyVHlwZSh0eXBlKSkpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0Q29sdW1ucy5wdXNoKGNvbHVtbnNbaV0uZmllbGROYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgIXN0cmluZ0NvbHVtbikge1xuICAgICAgICAgICAgICAgIHN0cmluZ0NvbHVtbiA9IGNvbHVtbnNbaV0uZmllbGROYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyIHRoYW4gYnViYmxlIGNoYXJ0IHg6IHN0cmluZyB0eXBlIHk6IG51bWJlciB0eXBlXG4gICAgICAgIC8vIEJ1YmJsZSBjaGFydCB4OiBudW1iZXIgdHlwZSB5OiBudW1iZXIgdHlwZVxuICAgICAgICBpZiAoc3RyaW5nQ29sdW1uICYmIGRlZmF1bHRDb2x1bW5zLmxlbmd0aCA+IDAgJiYgIWlzQnViYmxlQ2hhcnQodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgdGVtcCA9IGRlZmF1bHRDb2x1bW5zWzBdO1xuICAgICAgICAgICAgZGVmYXVsdENvbHVtbnNbMF0gPSBzdHJpbmdDb2x1bW47XG4gICAgICAgICAgICBkZWZhdWx0Q29sdW1uc1sxXSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmYXVsdENvbHVtbnM7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB1c2VyIGRlZmluZWQgamF2YXNjcmlwdCBmdW5jdGlvbiB3aGVuIHVzZXIgbGlua3MgaXQgdG8gY2xpY2sgZXZlbnQgb2YgdGhlIHdpZGdldC5cbiAgICBhdHRhY2hDbGlja0V2ZW50KCkge1xuICAgICAgICBsZXQgZGF0YU9iajtcbiAgICAgICAgZDMuc2VsZWN0KCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJykuc2VsZWN0QWxsKGNoYXJ0RGF0YVBvaW50WHBhdGhbdGhpcy50eXBlXSkuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgKGRhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQ29sdW1uJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQmFyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLl9kYXRhT2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1BpZSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RvbnV0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLmRhdGEuX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJlYSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0N1bXVsYXRpdmUgTGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0xpbmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU9iaiA9IGRhdGFbMF0uX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQnViYmxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLmRhdGEucG9pbnRbNF0uX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSBkYXRhT2JqO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudDogZDMuZXZlbnQsIHNlbGVjdGVkQ2hhcnRJdGVtOiBkYXRhLCBzZWxlY3RlZEl0ZW06IHRoaXMuc2VsZWN0ZWRpdGVtfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiAgUmV0dXJucyBZIFNjYWxlIG1pbiB2YWx1ZVxuICAgICAgICAgICBFeDogSW5wdXQgICA6IDguOTdcbiAgICAgICAgICAgICAgIE91dHB1dCAgOiA4Ljg3XG5cbiAgICAgICAgICAgICAgIElucHV0ICAgOiA4XG4gICAgICAgICAgICAgICBPdXRwdXQgIDogN1xuICAgICAgICovXG5cbiAgICBwb3N0UGxvdFByb2Nlc3MoY2hhcnQpIHtcbiAgICAgICAgbGV0IGNoYXJ0U3ZnLFxuICAgICAgICAgICAgcGllTGFiZWxzLFxuICAgICAgICAgICAgcGllR3JvdXBzLFxuICAgICAgICAgICAgYW5nbGVBcnJheTtcbiAgICAgICAgY29uc3Qgc3R5bGVPYmogPSB7fTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XG5cbiAgICAgICAgcG9zdFBsb3RDaGFydFByb2Nlc3ModGhpcyk7XG5cbiAgICAgICAgaWYgKCFpc1BpZVR5cGUodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbHNNYXhXaWR0aCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNob3dsYWJlbHNvdXRzaWRlKSB7XG4gICAgICAgICAgICAvKiogTnZkMyBoYXMgYSBpc3N1ZSBpbiByb3RhdGluZyB0ZXh0LiBTbyB3ZSB3aWxsIHVzZSB0aGlzIGFzIGEgdGVtcCBmaXguXG4gICAgICAgICAgICAgKiBJZiB0aGUgaXNzdWUgaXMgcmVzb2x2ZWQgdGhlcmUsIHdlIGNhbiByZW1vdmUgdGhpcy4qL1xuICAgICAgICAgICAgLyogSWYgaXQgaXMgYSBkb251dCBjaGFydCwgdGhlbiByb3RhdGUgdGhlIHRleHQgYW5kIHBvc2l0aW9uIHRoZW0qL1xuICAgICAgICAgICAgY2hhcnRTdmcgPSBkMy5zZWxlY3QoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKTtcbiAgICAgICAgICAgIHBpZUxhYmVscyA9IGNoYXJ0U3ZnLnNlbGVjdCgnLm52LXBpZUxhYmVscycpLnNlbGVjdEFsbCgnLm52LWxhYmVsJyk7XG4gICAgICAgICAgICBwaWVHcm91cHMgPSBjaGFydFN2Zy5zZWxlY3QoJy5udi1waWUnKS5zZWxlY3RBbGwoJy5udi1zbGljZScpO1xuICAgICAgICAgICAgYW5nbGVBcnJheSA9IFtdO1xuICAgICAgICAgICAgaWYgKHBpZUdyb3VwcyAmJiBwaWVHcm91cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcGllR3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlQXJyYXkucHVzaChhbmdsZShkKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBpZUxhYmVscy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAkKGdyb3VwWzBdWzBdKS5maW5kKCd0ZXh0JykuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSgnICsgYW5nbGVBcnJheVtpXSArICcpJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcmVwYXJlIHRleHQgc3R5bGUgcHJvcHMgb2JqZWN0IGFuZCBzZXRcbiAgICAgICAgXy5mb3JFYWNoKHN0eWxlUHJvcHMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnZm9udHNpemUnIHx8IGtleSA9PT0gJ2ZvbnR1bml0Jykge1xuICAgICAgICAgICAgICAgIHN0eWxlT2JqW3ZhbHVlXSA9IHRoaXMuZm9udHNpemUgKyB0aGlzLmZvbnR1bml0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZU9ialt2YWx1ZV0gPSB0aGlzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUZXh0U3R5bGUoc3R5bGVPYmosIHRoaXMuJGlkKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBhbGxvdyB3aW5kb3ctcmVzaXplIGZ1bmN0aW9uYWxpdHksIGZvciBvbmx5LXJ1biBtb2RlIGFzXG4gICAgICAgICAqIHVwZGF0aW5nIGNoYXJ0IGlzIGJlaW5nIGhhbmRsZWQgYnkgd2F0Y2hlcnMgb2YgaGVpZ2h0ICYgd2lkdGggaW4gc3R1ZGlvLW1vZGVcbiAgICAgICAgICogKi9cbiAgICAgICAgdHJpZ2dlckZuKHRoaXMuX3Jlc2l6ZUZuICYmIHRoaXMuX3Jlc2l6ZUZuLmNsZWFyKTtcbiAgICAgICAgdGhpcy5fcmVzaXplRm4gPSBudi51dGlscy53aW5kb3dSZXNpemUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY2hhcnQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgcG9zdFBsb3RDaGFydFByb2Nlc3ModGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1BpZVR5cGUodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExhYmVsc01heFdpZHRoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBnZXQgcGFyZW50cyBvZiBhY2NvcmRpb24gdHlwZVxuICAgICAgICAgICAgICAgIC8qbGV0IHBhcmVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLmFwcC1hY2NvcmRpb24tcGFuZWwsIC50YWItcGFuZScpLmlzb2xhdGVTY29wZSgpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmVzIGFuZCBjb25maWd1cmVzIHRoZSBjaGFydCBwcm9wZXJ0aWVzXG4gICAgY29uZmlndXJlQ2hhcnQoKSB7XG4gICAgICAgIC8vIENvcHkgdGhlIGRhdGEgb25seSBpbiBjYXNlIG9mIHBpZSBjaGFydCB3aXRoIGRlZmF1bHQgZGF0YVxuICAgICAgICAvLyBSZWFzb24gOiB3aGVuIG11bHRpcGxlIHBpZSBjaGFydHMgYXJlIGJvdW5kIHRvIHNhbWUgZGF0YSwgZmlyc3QgY2hhcnQgdGhlbWUgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBjaGFydHNcbiAgICAgICAgbGV0IHhEb21haW5WYWx1ZXM7XG4gICAgICAgIGxldCB5RG9tYWluVmFsdWVzO1xuICAgICAgICBsZXQgY2hhcnQ7XG4gICAgICAgIGxldCBiZWZvcmVSZW5kZXJWYWw7XG4gICAgICAgIGNvbnN0IHlmb3JtYXRPcHRpb25zOiBhbnkgPSB7fTtcblxuICAgICAgICBpZiAodGhpcy5fcHJvY2Vzc2VkRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoaXNBeGlzRG9tYWluVmFsaWQodGhpcywgJ3gnKSkge1xuICAgICAgICAgICAgICAgIHhEb21haW5WYWx1ZXMgPSB0aGlzLmJpbmRkYXRhc2V0ID8gdGhpcy5nZXRYTWluTWF4VmFsdWVzKHRoaXMuX3Byb2Nlc3NlZERhdGFbMF0pIDogeyAnbWluJyA6IHsneCc6IDF9LCAgJ21heCcgOiB7J3gnIDogNX19O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXhpc0RvbWFpblZhbGlkKHRoaXMsICd5JykpIHtcbiAgICAgICAgICAgICAgICB5RG9tYWluVmFsdWVzID0gdGhpcy5iaW5kZGF0YXNldCA/IHRoaXMuZ2V0WU1pbk1heFZhbHVlcyh0aGlzLl9wcm9jZXNzZWREYXRhKSA6IHsgJ21pbicgOiB7J3knIDogMX0sICdtYXgnIDogeyd5JyA6IDV9fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1BpZVR5cGUodGhpcy50eXBlKSAmJiAoIXRoaXMuYmluZGRhdGFzZXQgfHwgIXRoaXMuc2NvcGVkYXRhc2V0KSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkRGF0YSA9IGdldENsb25lZE9iamVjdCh0aGlzLnNjb3BlZGF0YXNldCB8fCB0aGlzLl9wcm9jZXNzZWREYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldCB0aGUgY2hhcnQgb2JqZWN0XG4gICAgICAgIGNoYXJ0ID0gaW5pdENoYXJ0KHRoaXMsIHhEb21haW5WYWx1ZXMsIHlEb21haW5WYWx1ZXMsIG51bGwsICF0aGlzLmJpbmRkYXRhc2V0KTtcblxuICAgICAgICBpZiAoXy5pc0FycmF5KHRoaXMuX3Byb2Nlc3NlZERhdGEpKSB7XG4gICAgICAgICAgICBiZWZvcmVSZW5kZXJWYWwgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXJlbmRlcicsIHsgJ2NoYXJ0SW5zdGFuY2UnIDogY2hhcnR9KTtcbiAgICAgICAgICAgIGlmIChiZWZvcmVSZW5kZXJWYWwpIHtcbiAgICAgICAgICAgICAgICBjaGFydCA9IGJlZm9yZVJlbmRlclZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICAgICAgICAgIC8vIGNoYW5naW5nIHRoZSBkZWZhdWx0IG5vIGRhdGEgbWVzc2FnZVxuICAgICAgICAgICAgZDMuc2VsZWN0KCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJylcbiAgICAgICAgICAgICAgICAuZGF0dW0odGhpcy5fcHJvY2Vzc2VkRGF0YSlcbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLmNoYXJ0KTtcbiAgICAgICAgICAgIHRoaXMucG9zdFBsb3RQcm9jZXNzKGNoYXJ0KTtcbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBsb3R0aW5nIHRoZSBjaGFydCB3aXRoIHNldCBvZiB0aGUgcHJvcGVydGllcyBzZXQgdG8gaXRcbiAgICBwbG90Q2hhcnQoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgICAvLyBjYWxsIHVzZXItdHJhbnNmb3JtZWQgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5jaGFydERhdGEgPSAodGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCd0cmFuc2Zvcm0nKSkgfHwgdGhpcy5jaGFydERhdGE7XG5cbiAgICAgICAgLy8gR2V0dGluZyB0aGUgb3JkZXIgYnkgZGF0YSBvbmx5IGluIHJ1biBtb2RlLiBUaGUgb3JkZXIgYnkgYXBwbGllcyBmb3IgYWxsIHRoZSBjaGFydHMgb3RoZXIgdGhhbiBwaWUgYW5kIGRvbnV0IGNoYXJ0c1xuICAgICAgICBpZiAodGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCAmJiAhaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSB0aGlzLmNoYXJ0RGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSB0aGlzLnByb2Nlc3NDaGFydERhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjaGVja2luZyB0aGUgcGFyZW50IGNvbnRhaW5lciBiZWZvcmUgcGxvdHRpbmcgdGhlIGNoYXJ0XG4gICAgICAgIGlmICghZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jbGVhckNhbnZhcykge1xuICAgICAgICAgICAgLy8gZW1wdHkgc3ZnIHRvIGFkZC1uZXcgY2hhcnRcbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnc3ZnJykucmVwbGFjZVdpdGgoJzxzdmc+PC9zdmc+Jyk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FudmFzID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbiBjYXNlIG9mIGludmFsaWQgYXhpcyBzaG93IG5vIGRhdGEgYXZhaWxhYmxlIG1lc3NhZ2VcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRBeGlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB0aGlzLmNvbmZpZ3VyZUNoYXJ0KCksICAoKSA9PiB7XG4gICAgICAgICAgICAvKkJ1YmJsZSBjaGFydCBoYXMgYW4gdGltZSBvdXQgZGVsYXkgb2YgMzAwbXMgaW4gdGhlaXIgaW1wbGVtZW50YXRpb24gZHVlIHRvIHdoaWNoIHdlXG4gICAgICAgICAgICAqIHdvbid0IGJlIGdldHRpbmcgcmVxdWlyZWQgZGF0YSBwb2ludHMgb24gYXR0YWNoaW5nIGV2ZW50c1xuICAgICAgICAgICAgKiBoZW5jZSBkZWxheWluZyBpdCA2MDBtcyovXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlja0V2ZW50KCk7XG4gICAgICAgICAgICB9LCA2MDApO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pc0xvYWRJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRPRE86IE5lZWQgd2F5IHRvIGZpZ3VyZSBvdXQgaWYgdGhlIGRhdGFzb3VyY2UgaXMgYSBsaXZlIHNvdXJjZVxuICAgIGdldCBpc0xpdmVWYXJpYWJsZSgpIHtcbiAgICAgICAgLy8gc2V0dGluZyB0aGUgZmxhZyBmb3IgdGhlIGxpdmUgdmFyaWFibGUgaW4gdGhlIHNjb3BlIGZvciB0aGUgY2hlY2tzXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlT2JqID0gdGhpcy5kYXRhc291cmNlO1xuICAgICAgICByZXR1cm4gdmFyaWFibGVPYmogJiYgdmFyaWFibGVPYmouY2F0ZWdvcnkgPT09ICd3bS5MaXZlVmFyaWFibGUnO1xuICAgIH1cblxuICAgIHBsb3RDaGFydFByb3h5KCkge1xuICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW52YWxpZENvbmZpZyA9IGZhbHNlO1xuICAgICAgICAvLyBDaGVja2luZyBpZiB4IGFuZCB5IGF4aXMgYXJlIGNob3NlblxuICAgICAgICB0aGlzLmlzTG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICBjb25zdCBncm91cGluZ0RldGFpbHMgPSB0aGlzLmdldEdyb3VwaW5nRGV0YWlscygpO1xuICAgICAgICAvLyBJZiBhZ2dyZWdhdGlvbi9ncm91cCBieS9vcmRlciBieSBwcm9wZXJ0aWVzIGhhdmUgYmVlbiBzZXQsIHRoZW4gZ2V0IHRoZSBhZ2dyZWdhdGVkIGRhdGEgYW5kIHBsb3QgdGhlIHJlc3VsdCBpbiB0aGUgY2hhcnQuXG4gICAgICAgIC8vIFRPRE86IGRhdGFzb3VyY2UgZm9yIGxpdmUgdmFyaWFibGUgZGV0ZWN0aW9uXG4gICAgICAgIGlmICh0aGlzLmJpbmRkYXRhc2V0ICYmIHRoaXMuaXNMaXZlVmFyaWFibGUgJiYgKHRoaXMuZmlsdGVyRmllbGRzIHx8IHRoaXMuaXNEYXRhRmlsdGVyaW5nRW5hYmxlZCgpKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBZ2dyZWdhdGVkRGF0YSgoKSA9PiB0aGlzLnBsb3RDaGFydCgpKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gRWxzZSwgc2ltcGx5IHBsb3QgdGhlIGNoYXJ0LlxuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXZlIHZhcmlhYmxlIHJlc2V0dGluZyB0aGUgYWdncmVnYXRlZCBkYXRhIHRvIHRoZSBub3JtYWwgZGF0YXNldCB3aGVuIHRoZSBhZ2dyZWdhdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhc2V0ICYmIHRoaXMuaXNMaXZlVmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IHRoaXMuZGF0YXNldDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkgJiYgZ3JvdXBpbmdEZXRhaWxzLmlzVmlzdWFsbHlHcm91cGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnREYXRhID0gdGhpcy5nZXRWaXN1YWxseUdyb3VwZWREYXRhKHRoaXMuY2hhcnREYXRhLCBncm91cGluZ0RldGFpbHMudmlzdWFsR3JvdXBpbmdDb2x1bW4pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wbG90Q2hhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldHMgdGhlIGRlZmF1bHQgeCBhbmQgeSBheGlzIG9wdGlvbnNcbiAgICBzZXREZWZhdWx0QXhpc09wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0gdGhpcy5nZXREZWZhdWx0Q29sdW1ucygpO1xuICAgICAgICAvLyBJZiB3ZSBnZXQgdGhlIHZhbGlkIGRlZmF1bHQgY29sdW1ucyB0aGVuIGFzc2lnbiB0aGVtIGFzIHRoZSB4IGFuZCB5IGF4aXNcbiAgICAgICAgLy8gSW4gY2FzZSBvZiBzZXJ2aWNlIHZhcmlhYmxlIHdlIG1heSBub3QgZ2V0IHRoZSB2YWxpZCBjb2x1bW5zIGJlY2F1c2Ugd2UgY2Fubm90IGtub3cgdGhlIGRhdGF0eXBlc1xuICAgICAgICB0aGlzLnhheGlzZGF0YWtleSA9IGRlZmF1bHRDb2x1bW5zWzBdIHx8IG51bGw7XG4gICAgICAgIHRoaXMueWF4aXNkYXRha2V5ID0gZGVmYXVsdENvbHVtbnNbMV0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICBnZXRDdXRvbWl6ZWRPcHRpb25zKHByb3AsIGZpZWxkcykge1xuICAgICAgICBjb25zdCBncm91cEJ5Q29sdW1ucyA9IF8uc3BsaXQodGhpcy5ncm91cGJ5LCAnLCcpLFxuICAgICAgICAgICAgYWdnQ29sdW1ucyA9IF8uc3BsaXQodGhpcy5hZ2dyZWdhdGlvbmNvbHVtbiwgJywnKTtcbiAgICAgICAgaWYgKCF0aGlzLmJpbmRkYXRhc2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRzO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5heGlzb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5heGlzb3B0aW9ucyA9IGZpZWxkcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmV3T3B0aW9ucztcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgICBjYXNlICd4YXhpc2RhdGFrZXknOlxuICAgICAgICAgICAgICAgIC8vIElmIGdyb3VwIGJ5IGVuYWJsZWQsIGNvbHVtbnMgY2hvc2VuIGluIGdyb3VwYnkgd2lsbCBiZSBwb3B1bGF0ZWQgaW4geCBheGlzIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9ucyA9IGdyb3VwQnlDb2x1bW5zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3lheGlzZGF0YWtleSc6XG4gICAgICAgICAgICAgICAgLy8gSWYgYWdncmVnYXRpb24gYnkgZW5hYmxlZCwgY29sdW1ucyBjaG9zZW4gaW4gYWdncmVnYXRpb24gd2lsbCBiZSBwb3B1bGF0ZWQgaW4geSBheGlzIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbnMgPSBhZ2dDb2x1bW5zO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0xpdmVWYXJpYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBjYXNlIG9mIGxpdmUgdmFyaWFibGUgcG9wdWxhdGluZyBvbmx5IG51bWVyaWMgY29sdW1uc1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncm91cGJ5JzpcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb25seSBub24gcHJpbWFyeSBrZXkgY29sdW1uc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTGl2ZVZhcmlhYmxlICYmIHRoaXMubm9uUHJpbWFyeUNvbHVtbnMgJiYgdGhpcy5ub25QcmltYXJ5Q29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9ucyA9IHRoaXMubm9uUHJpbWFyeUNvbHVtbnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWdncmVnYXRpb25jb2x1bW4nOlxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgJ2FnZ3JlZ2F0aW9uQ29sdW1uJyB0byBzaG93IGFsbCBrZXlzIGluIGNhc2Ugb2YgYWdncmVnYXRpb24gZnVuY3Rpb24gaXMgY291bnQgb3IgdG8gbnVtZXJpYyBrZXlzIGluIGFsbCBvdGhlciBjYXNlcy5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xpdmVWYXJpYWJsZSAmJiB0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkgJiYgdGhpcy5hZ2dyZWdhdGlvbiAhPT0gJ2NvdW50Jykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcmRlcmJ5JzpcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlICdhZ2dyZWdhdGlvbkNvbHVtbicgdG8gc2hvdyBhbGwga2V5cyBpbiBjYXNlIG9mIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGlzIGNvdW50IG9yIHRvIG51bWVyaWMga2V5cyBpbiBhbGwgb3RoZXIgY2FzZXMuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNMaXZlVmFyaWFibGUgJiYgdGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbnMgPSBfLnVuaXEoXy5jb25jYXQoZ3JvdXBCeUNvbHVtbnMsIGFnZ0NvbHVtbnMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdidWJibGVzaXplJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5udW1lcmljQ29sdW1ucyAmJiB0aGlzLm51bWVyaWNDb2x1bW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3T3B0aW9ucyB8fCBmaWVsZHMgfHwgdGhpcy5heGlzb3B0aW9ucztcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0aGF0IGl0ZXJhdGVzIHRocm91Z2ggYWxsIHRoZSBjb2x1bW5zIGFuZCB0aGVuIGZldGNoaW5nIHRoZSBudW1lcmljIGFuZCBub24gcHJpbWFyeSBjb2x1bW5zIGFtb25nIHRoZW1cbiAgICBzZXROdW1lcmljYW5kTm9uUHJpbWFyeUNvbHVtbnMoKSB7XG4gICAgICAgIGxldCBjb2x1bW5zLFxuICAgICAgICAgICAgdHlwZTtcbiAgICAgICAgY29uc3QgcHJvcGVydGllc01hcCA9IHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9QUk9QRVJUSUVTX01BUCk7XG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTtcbiAgICAgICAgdGhpcy5ub25QcmltYXJ5Q29sdW1ucyA9IFtdO1xuICAgICAgICAvLyBGZXRjaGluZyBhbGwgdGhlIGNvbHVtbnNcbiAgICAgICAgaWYgKHRoaXMuZGF0YXNldCAmJiAhXy5pc0VtcHR5KHByb3BlcnRpZXNNYXApKSB7XG4gICAgICAgICAgICBjb2x1bW5zID0gW107IC8vIFRPRE86IGZldGNoUHJvcGVydGllc01hcENvbHVtbnMocHJvcGVydGllc01hcCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29sdW1ucykge1xuICAgICAgICAgICAgLy8gSXRlcmF0aW5nIHRocm91Z2ggYWxsIHRoZSBjb2x1bW5zIGFuZCBmZXRjaGluZyB0aGUgbnVtZXJpYyBhbmQgbm9uIHByaW1hcnkga2V5IGNvbHVtbnNcbiAgICAgICAgICAgIF8uZm9yRWFjaChPYmplY3Qua2V5cyhjb2x1bW5zKSwgKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjb2x1bW5zW2tleV0udHlwZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOdW1iZXJUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIaWRpbmcgb25seSB0YWJsZSdzIHByaW1hcnkga2V5XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbnNba2V5XS5pc1JlbGF0ZWRQayA9PT0gJ3RydWUnIHx8ICFjb2x1bW5zW2tleV0uaXNQcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9uUHJpbWFyeUNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IHRoaXMubnVtZXJpY0NvbHVtbnMuc29ydCgpO1xuICAgICAgICAgICAgdGhpcy5ub25QcmltYXJ5Q29sdW1ucyA9IHRoaXMubm9uUHJpbWFyeUNvbHVtbnMuc29ydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGxvdCB0aGUgY2hhcnRcbiAgICBoYW5kbGVEYXRhU2V0KG5ld1ZhbCkge1xuICAgICAgICB0aGlzLmVyck1zZyA9ICcnO1xuICAgICAgICAvLyBSZXNldHRpbmcgdGhlIGZsYWcgdG8gZmFsc2Ugd2hlbiB0aGUgYmluZGluZyB3YXMgcmVtb3ZlZFxuICAgICAgICBpZiAoIW5ld1ZhbCAmJiAhdGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgdGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5heGlzb3B0aW9ucyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsaXZlVmFyaWFibGVzIGNvbnRhaW4gZGF0YSBpbiAnZGF0YScgcHJvcGVydHknIG9mIHRoZSB2YXJpYWJsZVxuICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IHRoaXMuaXNMaXZlVmFyaWFibGUgPyBuZXdWYWwgfHwgJycgOiAobmV3VmFsICYmIG5ld1ZhbC5kYXRhVmFsdWUgPT09ICcnICYmIF8ua2V5cyhuZXdWYWwpLmxlbmd0aCA9PT0gMSkgPyAnJyA6IG5ld1ZhbDtcblxuICAgICAgICAvLyBpZiB0aGUgZGF0YSByZXR1cm5lZCBpcyBhbiBvYmplY3QgbWFrZSBpdCBhbiBhcnJheSBvZiBvYmplY3RcbiAgICAgICAgaWYgKCFfLmlzQXJyYXkodGhpcy5jaGFydERhdGEpICYmIF8uaXNPYmplY3QodGhpcy5jaGFydERhdGEpKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IFt0aGlzLmNoYXJ0RGF0YV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3VmFsICYmIG5ld1ZhbC5maWx0ZXJGaWVsZHMpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyRmllbGRzID0gbmV3VmFsLmZpbHRlckZpZWxkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBsb3RjaGFydCBmb3Igb25seSB2YWxpZCBkYXRhIGFuZCBvbmx5IGFmdGVyIGJvdW5kIHZhcmlhYmxlIHJldHVybnMgZGF0YVxuICAgICAgICBpZiAodGhpcy5jaGFydERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bsb3RDaGFydFByb3h5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcGxvdENoYXJ0UHJveHkgPSBfLmRlYm91bmNlKHRoaXMucGxvdENoYXJ0UHJveHkuYmluZCh0aGlzKSwgMTAwKTtcblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBuZXdWYWwsIG9sZFZhbD8pIHtcbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG5ld1ZhbCwgb2xkVmFsKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RhdGFzZXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRGF0YVNldChuZXdWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndHlwZSc6XG4gICAgICAgICAgICAgICAgLy8gQmFzZWQgb24gdGhlIGNoYW5nZSBpbiB0eXBlIGRlY2lkaW5nIHRoZSBkZWZhdWx0IG1hcmdpbnNcbiAgICAgICAgICAgICAgICBpZiAoaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXR0b3AgPSAyMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRyaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0Ym90dG9tID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRsZWZ0ID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9sZFZhbCA9PT0gJ1BpZScgfHwgb2xkVmFsID09PSAnRG9udXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0dG9wID0gMjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0cmlnaHQgPSAyNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRib3R0b20gPSA1NTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRsZWZ0ID0gNzU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJDYW52YXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJbiBzdHVkaW8gbW9kZSwgY29uZmlndXJlIHByb3BlcnRpZXMgZGVwZW5kZW50IG9uIGNoYXJ0IHR5cGVcbiAgICAgICAgICAgICAgICB0aGlzLl9wbG90Q2hhcnRQcm94eSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBJbiBSdW5Nb2RlLCB0aGUgcGxvdGNoYXJ0IG1ldGhvZCB3aWxsIG5vdCBiZSBjYWxsZWQgZm9yIGFsbCBwcm9wZXJ0eSBjaGFuZ2VcbiAgICAgICAgICAgICAgICB0aGlzLl9wbG90Q2hhcnRQcm94eSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGFkdmFuY2VEYXRhUHJvcHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bsb3RDaGFydFByb3h5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVMb2FkaW5nKGRhdGEpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKGRhdGFTb3VyY2UgJiYgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkgJiYgaXNEYXRhU291cmNlRXF1YWwoZGF0YS52YXJpYWJsZSwgZGF0YVNvdXJjZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFyaWFibGVJbmZsaWdodCA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRJblByb2dyZXNzID0gZGF0YS5hY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblN0eWxlQ2hhbmdlKGtleSwgbmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVPYmogPSB7fTtcbiAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG5ld1ZhbCwgb2xkVmFsKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnRzaXplJzpcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnR1bml0JzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnRmYW1pbHknOlxuICAgICAgICAgICAgY2FzZSAnZm9udHdlaWdodCc6XG4gICAgICAgICAgICBjYXNlICdmb250c3R5bGUnOlxuICAgICAgICAgICAgY2FzZSAndGV4dGRlY29yYXRpb24nOlxuICAgICAgICAgICAgICAgIHN0eWxlT2JqW3N0eWxlUHJvcHNba2V5XV0gPSAoa2V5ID09PSAnZm9udHNpemUnIHx8IGtleSA9PT0gJ2ZvbnR1bml0JykgPyB0aGlzLmZvbnRzaXplICsgdGhpcy5mb250dW5pdCA6IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICBzZXRUZXh0U3R5bGUoc3R5bGVPYmosIHRoaXMuJGlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSLCBbJ2ZvbnRzaXplJywgJ2ZvbnR1bml0JywgJ2NvbG9yJywgJ2ZvbnRmYW1pbHknLCAnZm9udHdlaWdodCcsICdmb250c3R5bGUnLCAndGV4dGRlY29yYXRpb24nXSk7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdW5pcXVlIGlkIGZvciB0aGUgY29tcG9uZW50XG4gICAgICAgIHRoaXMuJGlkID0gdGhpcy53aWRnZXRJZCB8fCBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAvLyByZW1vdmUgdGl0bGUgYXR0cmlidXRlIGFzIHRoZSBlbGVtZW50IG9uIGhvdmVyIHNob3dzIHlvdSB0aGUgaGludCB0aHJvdWdoLW91dCB0aGUgZWxlbWVudFxuICAgICAgICByZW1vdmVBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3RpdGxlJyk7XG4gICAgICAgIHRoaXMuY2hhcnRSZWFkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJpbmRkYXRhc2V0ID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJyk7XG4gICAgICAgIC8vIFNob3cgbG9hZGluZyBzdGF0dXMgYmFzZWQgb24gdGhlIHZhcmlhYmxlIGxpZmUgY3ljbGVcbiAgICAgICAgdGhpcy5hcHAuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCB0aGlzLmhhbmRsZUxvYWRpbmcuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgLy8gRm9yIG9sZCBwcm9qZWN0c1xuICAgICAgICBpZiAoIV8uaW5jbHVkZXMoWydvdXRzaWRlJywgJ2luc2lkZScsICdoaWRlJ10sIHRoaXMuc2hvd2xhYmVscykpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2xhYmVscyAgICAgICAgPSBnZXRCb29sZWFuVmFsdWUodGhpcy5zaG93bGFiZWxzKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd2xhYmVsc291dHNpZGUgPSBnZXRCb29sZWFuVmFsdWUodGhpcy5zaG93bGFiZWxzb3V0c2lkZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dsYWJlbHMgICAgICAgID0gdGhpcy5zaG93bGFiZWxzID8gKHRoaXMuc2hvd2xhYmVsc291dHNpZGUgPyAnb3V0c2lkZScgOiAnaW5zaWRlJykgOiAnaGlkZSc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudGhlbWUpIHtcbiAgICAgICAgICAgIC8vIERlZmF1bHQgdGhlbWUgZm9yIHBpZS9kb251dCBpcyBBenVyZSBhbmQgZm9yIG90aGVyIGl0IGlzIFRlcnJlc3RyaWFsXG4gICAgICAgICAgICB0aGlzLnRoZW1lID0gaXNQaWVUeXBlKHRoaXMudHlwZSkgPyAnQXp1cmUnIDogJ1RlcnJlc3RyaWFsJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3dtQ2hhcnQnICsgdGhpcy4kaWQpO1xuICAgICAgICAvLyBXaGVuIHRoZXJlIGlzIG5vdCB2YWx1ZSBiaW5kaW5nLCB0aGVuIHBsb3QgdGhlIGNoYXJ0IHdpdGggc2FtcGxlIGRhdGFcbiAgICAgICAgaWYgKCF0aGlzLmJpbmRkYXRhc2V0ICYmICF0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzY29wZWRhdGFzZXQnKSkge1xuICAgICAgICAgICAgdGhpcy5fcGxvdENoYXJ0UHJveHkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhdyA9IHRoaXMuX3Bsb3RDaGFydFByb3h5LmJpbmQodGhpcyk7XG59XG4iXX0=