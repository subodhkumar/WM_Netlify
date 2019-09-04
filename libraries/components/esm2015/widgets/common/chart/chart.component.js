import { Component, HostBinding, Injector, ViewEncapsulation } from '@angular/core';
import { App, DataSource, getClonedObject, isDataSourceEqual, isEmptyObject, isNumberType, prettifyLabels, removeAttr, triggerFn } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './chart.props';
import { allShapes, getDateList, getSampleData, initChart, isAreaChart, isAxisDomainValid, isBarChart, isBubbleChart, isChartDataArray, isChartDataJSON, isLineTypeChart, isPieType, postPlotChartProcess } from './chart.utils';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const WIDGET_CONFIG = { widgetType: 'wm-chart', hostClass: 'app-chart' };
const options = {
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
const getBooleanValue = val => {
    if (val === true || val === 'true') {
        return true;
    }
    if (val === false || val === 'false') {
        return false;
    }
    return val;
};
const ɵ0 = getBooleanValue;
// returns orderby columns and their orders in two separate arrays
const getLodashOrderByFormat = orderby => {
    let columns;
    const orderByColumns = [], orders = [];
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
const ɵ1 = getLodashOrderByFormat;
// Replacing the '.' by the '$' because '.' is not supported in the alias names
const getValidAliasName = aliasName => aliasName ? aliasName.replace(/\./g, '$') : null;
const ɵ2 = getValidAliasName;
// Applying the font related styles for the chart
const setTextStyle = (properties, id) => {
    const charttext = d3.select('#wmChart' + id + ' svg').selectAll('text');
    charttext.style(properties);
};
const ɵ3 = setTextStyle;
const angle = d => {
    const a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
};
const ɵ4 = angle;
export class ChartComponent extends StylableComponent {
    constructor(inj, app) {
        super(inj, WIDGET_CONFIG);
        this.app = app;
        this.iconclass = '';
        this.nonPrimaryColumns = [];
        this.xDataKeyArr = [];
        this.chartData = [];
        this._processedData = [];
        this._plotChartProxy = _.debounce(this.plotChartProxy.bind(this), 100);
        this.redraw = this._plotChartProxy.bind(this);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER, ['fontsize', 'fontunit', 'color', 'fontfamily', 'fontweight', 'fontstyle', 'textdecoration']);
        // generate unique id for the component
        this.$id = this.widgetId || Math.random();
        // remove title attribute as the element on hover shows you the hint through-out the element
        removeAttr(this.nativeElement, 'title');
        this.chartReady = false;
        this.binddataset = this.nativeElement.getAttribute('dataset.bind');
        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this));
    }
    isGroupByEnabled() {
        return !!(this.groupby && this.groupby !== NONE);
    }
    // Check if x and y axis that are chosen are valid to plot chart
    isValidAxis() {
        // Check if x axis and y axis are chosen and are not equal
        return this.binddataset ? (this.xaxisdatakey && this.yaxisdatakey) : true;
    }
    // Check if aggregation is chosen
    isAggregationEnabled() {
        return !!((this.isGroupByEnabled() && this.aggregation !== NONE && this.aggregationcolumn));
    }
    // Check if either groupby, aggregation or orderby is chosen
    isDataFilteringEnabled() {
        /*Query need to be triggered if any of the following cases satisfy
        * 1. Group By and aggregation both chosen
        * 2. Only Order By is chosen
        * */
        return this.isAggregationEnabled() || (!this.isVisuallyGrouped && this.orderby);
    }
    /*Charts like Line,Area,Cumulative Line does not support any other datatype
        other than integer unlike the column and bar.It is a nvd3 issue. Inorder to
        support that this is a fix*/
    getxAxisVal(dataObj, xKey, index) {
        const value = _.get(dataObj, xKey);
        // If x axis is other than number type then add indexes
        if (isLineTypeChart(this.type) && !isNumberType(this.xAxisDataType)) {
            // Verification to get the unique data keys
            this.xDataKeyArr.push(value);
            return index;
        }
        return value;
    }
    // Getting the min and max values among all the x values
    getXMinMaxValues(datum) {
        if (!datum) {
            return;
        }
        const xValues = {};
        /*
         compute the min x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            min x: 1
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            min x: 10
        */
        xValues.min = _.minBy(datum.values, dataObject => dataObject.x || dataObject[0]);
        /*
         compute the max x value
         eg: When data has objects
            input: [{x:1, y:2}, {x:2, y:3}, {x:3, y:4}]
            max x: 3
         eg: When data has arrays
            input: [[10, 20], [20, 30], [30, 40]];
            max x: 30
         */
        xValues.max = _.maxBy(datum.values, dataObject => dataObject.x || dataObject[0]);
        return xValues;
    }
    // Getting the min and max values among all the y values
    getYMinMaxValues(datum) {
        const yValues = {}, minValues = [], maxValues = [];
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
        _.forEach(datum, data => {
            minValues.push(_.minBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
            maxValues.push(_.maxBy(data.values, function (dataObject) { return dataObject.y || dataObject[1]; }));
        });
        // Gets the least and highest values among all the min and max values of respective series of data
        yValues.min = _.minBy(minValues, dataObject => dataObject.y || dataObject[1]);
        yValues.max = _.maxBy(maxValues, dataObject => dataObject.y || dataObject[1]);
        return yValues;
    }
    // If the x-axis values are undefined, we return empty array else we return the values
    getValidData(values) {
        return (values.length === 1 && values[0] === undefined) ? [] : values;
    }
    // Returns the single data point based on the type of the data chart accepts
    valueFinder(dataObj, xKey, yKey, index, shape) {
        const xVal = this.getxAxisVal(dataObj, xKey, index), value = _.get(dataObj, yKey), yVal = parseFloat(value) || value, size = parseFloat(dataObj[this.bubblesize]) || 2;
        let dataPoint = {};
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
    }
    // Setting appropriate error messages
    setErrMsg(message) {
        if (this.showNoDataMsg) {
            this.showContentLoadError = true;
            this.invalidConfig = true;
            // TODO: Set the locale from the message
            this.errMsg = ''; // $rootScope.locale[message];
        }
    }
    processChartData() {
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
        let datum = [], yAxisKey, shapes = [], values = [];
        const xAxisKey = this.xaxisdatakey, yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [], dataSet = this.chartData;
        if (_.isArray(dataSet)) {
            if (isPieType(this.type)) {
                yAxisKey = yAxisKeys[0];
                datum = _.map(dataSet, (dataObj, index) => {
                    if (!isEmptyObject(dataSet[index])) {
                        return this.valueFinder(dataSet[index], xAxisKey, yAxisKey);
                    }
                });
                datum = this.getValidData(datum);
            }
            else {
                if (isBubbleChart(this.type)) {
                    shapes = this.shape === 'random' ? allShapes : this.shape;
                }
                yAxisKeys.forEach((yAxisKey, series) => {
                    values = _.map(dataSet, (dataObj, index) => {
                        if (!isEmptyObject(dataSet[index])) {
                            return this.valueFinder(dataSet[index], xAxisKey, yAxisKey, index, (_.isArray(shapes) && shapes[series]) || this.shape);
                        }
                    });
                    values = this.getValidData(values);
                    datum.push({
                        values: values,
                        key: prettifyLabels(yAxisKey)
                    });
                });
            }
        }
        return datum;
    }
    setChartData(data) {
        if (data) {
            this._processedData = data;
        }
    }
    getChartData() {
        return this._processedData;
    }
    // constructing the grouped data based on the selection of orderby, x & y axis
    getVisuallyGroupedData(queryResponse, groupingColumn) {
        let groupData = {}, groupValues = [], orderByDetails, maxLength;
        const chartData = [], _isAreaChart = isAreaChart(this.type), yAxisKey = _.first(_.split(this.yaxisdatakey, ','));
        this.xDataKeyArr = [];
        queryResponse = _.orderBy(queryResponse, _.split(this.groupby, ','));
        if (this.orderby) {
            orderByDetails = getLodashOrderByFormat(this.orderby);
            queryResponse = _.orderBy(queryResponse, orderByDetails.columns, orderByDetails.orders);
        }
        queryResponse = _.groupBy(queryResponse, groupingColumn);
        // In case of area chart all the series data should be of same length
        if (_isAreaChart) {
            maxLength = _.max(_.map(queryResponse, obj => obj.length));
        }
        _.forEach(queryResponse, (values, groupKey) => {
            groupValues = isAreaChart ? _.fill(new Array(maxLength), [0, 0]) : [];
            _.forEachRight(values, (value, index) => {
                groupValues[index] = this.valueFinder(value, this.xaxisdatakey, yAxisKey, index);
            });
            groupData = {
                key: groupKey,
                values: groupValues
            };
            chartData.push(groupData);
        });
        return chartData;
    }
    /*Decides whether the data should be visually grouped or not
            Visually grouped when a different column is choosen in the group by other than x and y axis and aggregation is not chosen*/
    getGroupingDetails() {
        if (this.isGroupByEnabled() && !this.isAggregationEnabled()) {
            let isVisuallyGrouped = false, visualGroupingColumn, groupingExpression, columns = [], groupingColumnIndex;
            const groupbyColumns = this.groupby && this.groupby !== NONE ? this.groupby.split(',') : [], yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [];
            if (groupbyColumns.length > 1) {
                /*Getting the group by column which is not selected either in x or y axis*/
                groupbyColumns.every((column, index) => {
                    if (this.xaxisdatakey !== column && $.inArray(column, yAxisKeys) === -1) {
                        isVisuallyGrouped = true;
                        visualGroupingColumn = column;
                        groupingColumnIndex = index;
                        groupbyColumns.splice(groupingColumnIndex, 1);
                        return false;
                    }
                    return true;
                });
                // Constructing the groupby expression
                if (visualGroupingColumn) {
                    columns.push(visualGroupingColumn);
                }
                if (groupbyColumns.length) {
                    columns = _.concat(columns, groupbyColumns);
                }
            }
            // If x and y axis are not included in aggregation need to be included in groupby
            if (this.xaxisdatakey !== this.aggregationcolumn) {
                columns.push(this.xaxisdatakey);
            }
            _.forEach(yAxisKeys, key => {
                if (key !== this.aggregationcolumn) {
                    columns.push(key);
                }
            });
            groupingExpression = columns.join(',');
            // set isVisuallyGrouped flag in scope for later use
            this.isVisuallyGrouped = isVisuallyGrouped;
            return {
                expression: groupingExpression,
                isVisuallyGrouped: isVisuallyGrouped,
                visualGroupingColumn: visualGroupingColumn
            };
        }
        return {
            expression: '',
            isVisuallyGrouped: false,
            visualGroupingColumn: ''
        };
    }
    // Function to get the aggregated data after applying the aggregation & group by or order by operations.
    getAggregatedData(callback) {
        const variable = this.datasource, yAxisKeys = this.yaxisdatakey ? this.yaxisdatakey.split(',') : [], data = {};
        let sortExpr, columns = [], colAlias, orderByColumns, groupByFields = [];
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
            _.forEach(_.intersection(columns, orderByColumns), col => {
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
        }).then(response => {
            // Transform the result into a format supported by the chart.
            const chartData = [], aggregationAlias = getValidAliasName(this.aggregationcolumn), xAxisAliasKey = getValidAliasName(this.xaxisdatakey), yAxisAliasKeys = [];
            yAxisKeys.forEach(yAxisKey => yAxisAliasKeys.push(getValidAliasName(yAxisKey)));
            _.forEach(response.body.content, (responseContent) => {
                const obj = {};
                // Set the response in the chartData based on 'aggregationColumn', 'xAxisDataKey' & 'yAxisDataKey'.
                if (this.isAggregationEnabled()) {
                    obj[this.aggregationcolumn] = responseContent[aggregationAlias];
                    obj[this.aggregationcolumn] = _.get(responseContent, aggregationAlias) || _.get(responseContent, this.aggregationcolumn);
                }
                obj[this.xaxisdatakey] = _.get(responseContent, xAxisAliasKey) || _.get(responseContent, this.xaxisdatakey);
                yAxisKeys.forEach((yAxisKey, index) => {
                    obj[yAxisKey] = responseContent[yAxisAliasKeys[index]];
                    obj[yAxisKey] = _.get(responseContent, yAxisAliasKeys[index]) || _.get(responseContent, yAxisKey);
                });
                chartData.push(obj);
            });
            this.chartData = chartData;
            triggerFn(callback);
        }, () => {
            this.chartData = [];
            this.setErrMsg('MESSAGE_ERROR_FETCH_DATA');
            triggerFn(callback);
        });
    }
    // This function sets maximum width for the labels that can be displayed.This will helpful when they are overlapping
    setLabelsMaxWidth() {
        let xTicks, tickWidth, maxLength, xDist, yDist, totalHeight, maxNoLabels, nthElement, labelsAvailableWidth, barWrapper, yAxisWrapper, svgWrapper;
        const fontsize = parseInt(this.fontsize, 10) || 12, isBarchart = isBarChart(this.type);
        // getting the x ticks in the chart
        xTicks = $('#wmChart' + this.$id + ' svg').find('g.nv-x').find('g.tick').find('text');
        // getting the distance between the two visible ticks associated with visible text
        xTicks.each(function () {
            const xTick = $(this);
            let xTransform, tickDist;
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
    }
    // Returns the columns of that can be choosen in the x and y axis
    getDefaultColumns() {
        let type, stringColumn, i, temp;
        const defaultColumns = [], columns = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP) || [];
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
    }
    // Call user defined javascript function when user links it to click event of the widget.
    attachClickEvent() {
        let dataObj;
        d3.select('#wmChart' + this.$id + ' svg').selectAll(chartDataPointXpath[this.type]).style('pointer-events', 'all')
            .on('click', (data, index) => {
            switch (this.type) {
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
            this.selecteditem = dataObj;
            this.invokeEventCallback('select', { $event: d3.event, selectedChartItem: data, selectedItem: this.selecteditem });
        });
    }
    /*  Returns Y Scale min value
           Ex: Input   : 8.97
               Output  : 8.87

               Input   : 8
               Output  : 7
       */
    postPlotProcess(chart) {
        let chartSvg, pieLabels, pieGroups, angleArray;
        const styleObj = {};
        const element = this.$element;
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
                    const group = d3.select(this);
                    $(group[0][0]).find('text').attr('transform', 'rotate(' + angleArray[i] + ')');
                });
            }
        }
        // prepare text style props object and set
        _.forEach(styleProps, (value, key) => {
            if (key === 'fontsize' || key === 'fontunit') {
                styleObj[value] = this.fontsize + this.fontunit;
            }
            else {
                styleObj[value] = this[key];
            }
        });
        setTextStyle(styleObj, this.$id);
        /*
         * allow window-resize functionality, for only-run mode as
         * updating chart is being handled by watchers of height & width in studio-mode
         * */
        triggerFn(this._resizeFn && this._resizeFn.clear);
        this._resizeFn = nv.utils.windowResize(() => {
            if (element[0].getBoundingClientRect().height) {
                chart.update();
                postPlotChartProcess(this);
                if (!isPieType(this.type)) {
                    this.setLabelsMaxWidth();
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
    }
    // prepares and configures the chart properties
    configureChart() {
        // Copy the data only in case of pie chart with default data
        // Reason : when multiple pie charts are bound to same data, first chart theme will be applied to all charts
        let xDomainValues;
        let yDomainValues;
        let chart;
        let beforeRenderVal;
        const yformatOptions = {};
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
    }
    // Plotting the chart with set of the properties set to it
    plotChart() {
        const element = this.$element;
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
        nv.addGraph(() => this.configureChart(), () => {
            /*Bubble chart has an time out delay of 300ms in their implementation due to which we
            * won't be getting required data points on attaching events
            * hence delaying it 600ms*/
            setTimeout(() => {
                this.attachClickEvent();
            }, 600);
        });
        this.isLoadInProgress = false;
    }
    // TODO: Need way to figure out if the datasource is a live source
    get isLiveVariable() {
        // setting the flag for the live variable in the scope for the checks
        const variableObj = this.datasource;
        return variableObj && variableObj.category === 'wm.LiveVariable';
    }
    plotChartProxy() {
        this.showContentLoadError = false;
        this.invalidConfig = false;
        // Checking if x and y axis are chosen
        this.isLoadInProgress = true;
        const groupingDetails = this.getGroupingDetails();
        // If aggregation/group by/order by properties have been set, then get the aggregated data and plot the result in the chart.
        // TODO: datasource for live variable detection
        if (this.binddataset && this.isLiveVariable && (this.filterFields || this.isDataFilteringEnabled())) {
            this.getAggregatedData(() => this.plotChart());
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
    }
    // sets the default x and y axis options
    setDefaultAxisOptions() {
        const defaultColumns = this.getDefaultColumns();
        // If we get the valid default columns then assign them as the x and y axis
        // In case of service variable we may not get the valid columns because we cannot know the datatypes
        this.xaxisdatakey = defaultColumns[0] || null;
        this.yaxisdatakey = defaultColumns[1] || null;
    }
    getCutomizedOptions(prop, fields) {
        const groupByColumns = _.split(this.groupby, ','), aggColumns = _.split(this.aggregationcolumn, ',');
        if (!this.binddataset) {
            return fields;
        }
        if (!this.axisoptions) {
            this.axisoptions = fields;
        }
        let newOptions;
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
    }
    // Function that iterates through all the columns and then fetching the numeric and non primary columns among them
    setNumericandNonPrimaryColumns() {
        let columns, type;
        const propertiesMap = this.datasource.execute(DataSource.Operation.GET_PROPERTIES_MAP);
        this.numericColumns = [];
        this.nonPrimaryColumns = [];
        // Fetching all the columns
        if (this.dataset && !_.isEmpty(propertiesMap)) {
            columns = []; // TODO: fetchPropertiesMapColumns(propertiesMap);
        }
        if (columns) {
            // Iterating through all the columns and fetching the numeric and non primary key columns
            _.forEach(Object.keys(columns), (key) => {
                type = columns[key].type;
                if (isNumberType(type)) {
                    this.numericColumns.push(key);
                }
                // Hiding only table's primary key
                if (columns[key].isRelatedPk === 'true' || !columns[key].isPrimaryKey) {
                    this.nonPrimaryColumns.push(key);
                }
            });
            this.numericColumns = this.numericColumns.sort();
            this.nonPrimaryColumns = this.nonPrimaryColumns.sort();
        }
    }
    // plot the chart
    handleDataSet(newVal) {
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
    }
    onPropertyChange(key, newVal, oldVal) {
        super.onPropertyChange(key, newVal, oldVal);
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
    }
    handleLoading(data) {
        const dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.variableInflight = data.active;
            this.isLoadInProgress = data.active;
        }
    }
    onStyleChange(key, newVal, oldVal) {
        const styleObj = {};
        super.onStyleChange(key, newVal, oldVal);
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
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
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
    }
}
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
ChartComponent.ctorParameters = () => [
    { type: Injector },
    { type: App }
];
ChartComponent.propDecorators = {
    title: [{ type: HostBinding, args: ['class.panel',] }]
};
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jaGFydC9jaGFydC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRyxPQUFPLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVuSixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pPLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSWpFLE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFdkUsTUFBTSxPQUFPLEdBQUc7SUFDUixRQUFRLEVBQUcsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDO0NBQ3JDLEVBQ0QsSUFBSSxHQUFHLE1BQU0sRUFDYixnQkFBZ0IsR0FBRyxDQUFDLGFBQWEsRUFBRSxtQkFBbUIs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Q0FBQyxjQUFjLENBQUMsRUFBRTtZQUN2RSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDMUI7SUFDTCxDQUFDOztBQS83Qk0sOEJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFWNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixpMkJBQXFDO2dCQUVyQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsY0FBYyxDQUFDO2lCQUNyQztnQkFDRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDeEM7Ozs7WUFwRytDLFFBQVE7WUFFL0MsR0FBRzs7O29CQXFKUCxXQUFXLFNBQUMsYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgSG9zdEJpbmRpbmcsIEluamVjdG9yLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHAsIERhdGFTb3VyY2UsIGdldENsb25lZE9iamVjdCwgaXNEYXRhU291cmNlRXF1YWwsIGlzRW1wdHlPYmplY3QsIGlzTnVtYmVyVHlwZSwgcHJldHRpZnlMYWJlbHMsIHJlbW92ZUF0dHIsIHRyaWdnZXJGbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVJlZHJhd2FibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jaGFydC5wcm9wcyc7XG5pbXBvcnQgeyBhbGxTaGFwZXMsIGdldERhdGVMaXN0LCBnZXRTYW1wbGVEYXRhLCBpbml0Q2hhcnQsIGlzQXJlYUNoYXJ0LCBpc0F4aXNEb21haW5WYWxpZCwgaXNCYXJDaGFydCwgaXNCdWJibGVDaGFydCwgaXNDaGFydERhdGFBcnJheSwgaXNDaGFydERhdGFKU09OLCBpc0xpbmVUeXBlQ2hhcnQsIGlzUGllVHlwZSwgcG9zdFBsb3RDaGFydFByb2Nlc3MgfSBmcm9tICcuL2NoYXJ0LnV0aWxzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgJCwgXywgZDMsIG52O1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1jaGFydCcsIGhvc3RDbGFzczogJ2FwcC1jaGFydCd9O1xuXG5jb25zdCBvcHRpb25zID0ge1xuICAgICAgICAnQnViYmxlJyA6IFsnYnViYmxlc2l6ZScsICdzaGFwZSddXG4gICAgfSxcbiAgICBOT05FID0gJ25vbmUnLFxuICAgIGFkdmFuY2VEYXRhUHJvcHMgPSBbJ2FnZ3JlZ2F0aW9uJywgJ2FnZ3JlZ2F0aW9uY29sdW1uJywgJ2dyb3VwYnknLCAnb3JkZXJieSddLFxuICAgIC8vIFhQYXRocyB0byBnZXQgYWN0dWFsIGRhdGEgb2YgZGF0YSBwb2ludHMgaW4gY2hhcnRzXG4gICAgY2hhcnREYXRhUG9pbnRYcGF0aCA9IHtcbiAgICAgICAgJ0NvbHVtbicgICAgICAgICA6ICdyZWN0Lm52LWJhcicsXG4gICAgICAgICdCYXInICAgICAgICAgICAgOiAnZy5udi1iYXInLFxuICAgICAgICAnQXJlYScgICAgICAgICAgIDogJy5udi1zdGFja2VkYXJlYSAubnYtcG9pbnQnLFxuICAgICAgICAnQ3VtdWxhdGl2ZSBMaW5lJzogJy5udi1jdW11bGF0aXZlTGluZSAubnYtc2NhdHRlcldyYXAgcGF0aC5udi1wb2ludCcsXG4gICAgICAgICdMaW5lJyAgICAgICAgICAgOiAnLm52LWxpbmVDaGFydCAubnYtc2NhdHRlcldyYXAgcGF0aC5udi1wb2ludCcsXG4gICAgICAgICdQaWUnICAgICAgICAgICAgOiAnLm52LXBpZUNoYXJ0IC5udi1zbGljZSBwYXRoJyxcbiAgICAgICAgJ0RvbnV0JyAgICAgICAgICA6ICcubnYtcGllQ2hhcnQgLm52LXNsaWNlIHBhdGgnLFxuICAgICAgICAnQnViYmxlJyAgICAgICAgIDogJy5udi1zY2F0dGVyQ2hhcnQgLm52LXBvaW50LXBhdGhzIHBhdGgnXG4gICAgfSxcbiAgICAvLyBhbGwgcHJvcGVydGllcyBvZiB0aGUgY2hhcnRcbiAgICBhbGxPcHRpb25zID0gWydidWJibGVzaXplJywgJ3NoYXBlJ10sXG4gICAgc3R5bGVQcm9wcyA9IHtcbiAgICAgICAgJ2ZvbnR1bml0JyAgICAgIDogJ2ZvbnQtc2l6ZScsXG4gICAgICAgICdmb250c2l6ZScgICAgICA6ICdmb250LXNpemUnLFxuICAgICAgICAnY29sb3InICAgICAgICAgOiAnZmlsbCcsXG4gICAgICAgICdmb250ZmFtaWx5JyAgICA6ICdmb250LWZhbWlseScsXG4gICAgICAgICdmb250d2VpZ2h0JyAgICA6ICdmb250LXdlaWdodCcsXG4gICAgICAgICdmb250c3R5bGUnICAgICA6ICdmb250LXN0eWxlJyxcbiAgICAgICAgJ3RleHRkZWNvcmF0aW9uJzogJ3RleHQtZGVjb3JhdGlvbidcbiAgICB9LFxuICAgIC8vIEdldHRpbmcgdGhlIHJlbGV2YW50IGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBvcHRpb25cbiAgICBhZ2dyZWdhdGlvbkZuTWFwID0ge1xuICAgICAgICAnYXZlcmFnZScgOiAnQVZHJyxcbiAgICAgICAgJ2NvdW50JyAgIDogJ0NPVU5UJyxcbiAgICAgICAgJ21heGltdW0nIDogJ01BWCcsXG4gICAgICAgICdtaW5pbXVtJyA6ICdNSU4nLFxuICAgICAgICAnc3VtJyAgICAgOiAnU1VNJ1xuICAgIH07XG5cbmNvbnN0IGdldEJvb2xlYW5WYWx1ZSA9IHZhbCA9PiB7XG4gICAgaWYgKHZhbCA9PT0gdHJ1ZSB8fCB2YWwgPT09ICd0cnVlJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHZhbCA9PT0gZmFsc2UgfHwgdmFsID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbi8vIHJldHVybnMgb3JkZXJieSBjb2x1bW5zIGFuZCB0aGVpciBvcmRlcnMgaW4gdHdvIHNlcGFyYXRlIGFycmF5c1xuY29uc3QgZ2V0TG9kYXNoT3JkZXJCeUZvcm1hdCA9IG9yZGVyYnkgPT4ge1xuICAgIGxldCBjb2x1bW5zO1xuICAgIGNvbnN0IG9yZGVyQnlDb2x1bW5zID0gW10sXG4gICAgICAgIG9yZGVycyA9IFtdO1xuXG4gICAgXy5mb3JFYWNoKF8uc3BsaXQob3JkZXJieSwgJywnKSwgZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICBjb2x1bW5zID0gXy5zcGxpdChjb2wsICc6Jyk7XG4gICAgICAgIG9yZGVyQnlDb2x1bW5zLnB1c2goY29sdW1uc1swXSk7XG4gICAgICAgIG9yZGVycy5wdXNoKGNvbHVtbnNbMV0pO1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgICdjb2x1bW5zJyA6IG9yZGVyQnlDb2x1bW5zLFxuICAgICAgICAnb3JkZXJzJyAgOiBvcmRlcnNcbiAgICB9O1xufTtcblxuLy8gUmVwbGFjaW5nIHRoZSAnLicgYnkgdGhlICckJyBiZWNhdXNlICcuJyBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBhbGlhcyBuYW1lc1xuY29uc3QgZ2V0VmFsaWRBbGlhc05hbWUgPSBhbGlhc05hbWUgPT4gYWxpYXNOYW1lID8gYWxpYXNOYW1lLnJlcGxhY2UoL1xcLi9nLCAnJCcpIDogbnVsbDtcblxuLy8gQXBwbHlpbmcgdGhlIGZvbnQgcmVsYXRlZCBzdHlsZXMgZm9yIHRoZSBjaGFydFxuY29uc3Qgc2V0VGV4dFN0eWxlID0gKHByb3BlcnRpZXMsIGlkKSA9PiB7XG4gICAgY29uc3QgY2hhcnR0ZXh0ID0gZDMuc2VsZWN0KCcjd21DaGFydCcgKyBpZCArICcgc3ZnJykuc2VsZWN0QWxsKCd0ZXh0Jyk7XG4gICAgY2hhcnR0ZXh0LnN0eWxlKHByb3BlcnRpZXMpO1xufTtcblxuY29uc3QgYW5nbGUgPSBkID0+IHtcbiAgICBjb25zdCBhID0gKGQuc3RhcnRBbmdsZSArIGQuZW5kQW5nbGUpICogOTAgLyBNYXRoLlBJIC0gOTA7XG4gICAgcmV0dXJuIGEgPiA5MCA/IGEgLSAxODAgOiBhO1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21DaGFydF0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jaGFydC5jb21wb25lbnQuaHRtbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4uLy4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy93bS1udmQzL2J1aWxkL252LmQzLmNzcyddLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ2hhcnRDb21wb25lbnQpXG4gICAgXSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXG59KVxuZXhwb3J0IGNsYXNzIENoYXJ0Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHhheGlzZGF0YWtleTtcbiAgICB5YXhpc2RhdGFrZXk7XG4gICAgZ3JvdXBieTtcbiAgICBhZ2dyZWdhdGlvbjtcbiAgICBhZ2dyZWdhdGlvbmNvbHVtbjtcbiAgICBpc1Zpc3VhbGx5R3JvdXBlZDtcbiAgICBvcmRlcmJ5O1xuICAgIGljb25jbGFzcyA9ICcnO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzaG93Q29udGVudExvYWRFcnJvcjtcbiAgICBpbnZhbGlkQ29uZmlnO1xuICAgIGVyck1zZztcbiAgICBzaGFwZTogc3RyaW5nO1xuICAgIGRhdGFzb3VyY2U6IGFueTtcbiAgICBmb250c2l6ZTogc3RyaW5nO1xuICAgIHNlbGVjdGVkaXRlbTogYW55O1xuICAgIGZvbnR1bml0OiBzdHJpbmc7XG4gICAgb2Zmc2V0dG9wOiBudW1iZXI7XG4gICAgb2Zmc2V0bGVmdDogbnVtYmVyO1xuICAgIG9mZnNldHJpZ2h0OiBudW1iZXI7XG4gICAgb2Zmc2V0Ym90dG9tOiBudW1iZXI7XG4gICAgc2hvd2xhYmVsczogYW55O1xuICAgIHRoZW1lOiBzdHJpbmc7XG5cbiAgICBwcml2YXRlICRpZDtcbiAgICBwcml2YXRlIHNjb3BlZGF0YXNldDogYW55O1xuICAgIHByaXZhdGUgYmluZGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIHNob3dsYWJlbHNvdXRzaWRlOiBhbnk7XG4gICAgcHJpdmF0ZSBfcmVzaXplRm46IGFueTtcbiAgICBwcml2YXRlIGNoYXJ0OiBhbnk7XG4gICAgcHJpdmF0ZSBjbGVhckNhbnZhczogYm9vbGVhbjtcbiAgICBwdWJsaWMgaXNMb2FkSW5Qcm9ncmVzczogYm9vbGVhbjtcbiAgICBwcml2YXRlIGZpbHRlckZpZWxkczogYm9vbGVhbiB8IGFueTtcbiAgICBwcml2YXRlIGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIGF4aXNvcHRpb25zOiBhbnk7XG4gICAgcHJpdmF0ZSBudW1lcmljQ29sdW1uczogYW55O1xuICAgIHByaXZhdGUgbm9uUHJpbWFyeUNvbHVtbnM6IGFueSA9IFtdO1xuICAgIHByaXZhdGUgdmFyaWFibGVJbmZsaWdodDogYW55O1xuICAgIHByaXZhdGUgY2hhcnRSZWFkeTogYm9vbGVhbjtcbiAgICBwcml2YXRlIHhEYXRhS2V5QXJyOiBhbnkgPSBbXTtcbiAgICBwcml2YXRlIHhBeGlzRGF0YVR5cGU6IHN0cmluZztcbiAgICBwcml2YXRlIGJ1YmJsZXNpemU6IGFueTtcbiAgICBwdWJsaWMgc2hvd05vRGF0YU1zZzogYW55O1xuICAgIHByaXZhdGUgc2FtcGxlRGF0YTogYW55W107XG4gICAgcHJpdmF0ZSBjaGFydERhdGE6IGFueVtdID0gW107XG4gICAgcHJpdmF0ZSBfcHJvY2Vzc2VkRGF0YTogYW55W10gPSBbXTtcblxuICAgIEBIb3N0QmluZGluZygnY2xhc3MucGFuZWwnKSB0aXRsZTtcblxuICAgIGlzR3JvdXBCeUVuYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiAhISh0aGlzLmdyb3VwYnkgJiYgdGhpcy5ncm91cGJ5ICE9PSBOT05FKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB4IGFuZCB5IGF4aXMgdGhhdCBhcmUgY2hvc2VuIGFyZSB2YWxpZCB0byBwbG90IGNoYXJ0XG4gICAgaXNWYWxpZEF4aXMoKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHggYXhpcyBhbmQgeSBheGlzIGFyZSBjaG9zZW4gYW5kIGFyZSBub3QgZXF1YWxcbiAgICAgICAgcmV0dXJuIHRoaXMuYmluZGRhdGFzZXQgPyAodGhpcy54YXhpc2RhdGFrZXkgJiYgdGhpcy55YXhpc2RhdGFrZXkpIDogdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhZ2dyZWdhdGlvbiBpcyBjaG9zZW5cbiAgICBpc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuICEhKCh0aGlzLmlzR3JvdXBCeUVuYWJsZWQoKSAmJiB0aGlzLmFnZ3JlZ2F0aW9uICE9PSBOT05FICYmIHRoaXMuYWdncmVnYXRpb25jb2x1bW4pKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBlaXRoZXIgZ3JvdXBieSwgYWdncmVnYXRpb24gb3Igb3JkZXJieSBpcyBjaG9zZW5cbiAgICBpc0RhdGFGaWx0ZXJpbmdFbmFibGVkKCkge1xuICAgICAgICAvKlF1ZXJ5IG5lZWQgdG8gYmUgdHJpZ2dlcmVkIGlmIGFueSBvZiB0aGUgZm9sbG93aW5nIGNhc2VzIHNhdGlzZnlcbiAgICAgICAgKiAxLiBHcm91cCBCeSBhbmQgYWdncmVnYXRpb24gYm90aCBjaG9zZW5cbiAgICAgICAgKiAyLiBPbmx5IE9yZGVyIEJ5IGlzIGNob3NlblxuICAgICAgICAqICovXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBZ2dyZWdhdGlvbkVuYWJsZWQoKSB8fCAoIXRoaXMuaXNWaXN1YWxseUdyb3VwZWQgJiYgdGhpcy5vcmRlcmJ5KTtcbiAgICB9XG5cbiAgICAvKkNoYXJ0cyBsaWtlIExpbmUsQXJlYSxDdW11bGF0aXZlIExpbmUgZG9lcyBub3Qgc3VwcG9ydCBhbnkgb3RoZXIgZGF0YXR5cGVcbiAgICAgICAgb3RoZXIgdGhhbiBpbnRlZ2VyIHVubGlrZSB0aGUgY29sdW1uIGFuZCBiYXIuSXQgaXMgYSBudmQzIGlzc3VlLiBJbm9yZGVyIHRvXG4gICAgICAgIHN1cHBvcnQgdGhhdCB0aGlzIGlzIGEgZml4Ki9cbiAgICBnZXR4QXhpc1ZhbChkYXRhT2JqLCB4S2V5LCBpbmRleCkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IF8uZ2V0KGRhdGFPYmosIHhLZXkpO1xuICAgICAgICAvLyBJZiB4IGF4aXMgaXMgb3RoZXIgdGhhbiBudW1iZXIgdHlwZSB0aGVuIGFkZCBpbmRleGVzXG4gICAgICAgIGlmIChpc0xpbmVUeXBlQ2hhcnQodGhpcy50eXBlKSAmJiAhaXNOdW1iZXJUeXBlKHRoaXMueEF4aXNEYXRhVHlwZSkpIHtcbiAgICAgICAgICAgIC8vIFZlcmlmaWNhdGlvbiB0byBnZXQgdGhlIHVuaXF1ZSBkYXRhIGtleXNcbiAgICAgICAgICAgIHRoaXMueERhdGFLZXlBcnIucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIEdldHRpbmcgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBhbW9uZyBhbGwgdGhlIHggdmFsdWVzXG4gICAgZ2V0WE1pbk1heFZhbHVlcyhkYXR1bSkge1xuICAgICAgICBpZiAoIWRhdHVtKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeFZhbHVlczogYW55ID0ge307XG4gICAgICAgIC8qXG4gICAgICAgICBjb21wdXRlIHRoZSBtaW4geCB2YWx1ZVxuICAgICAgICAgZWc6IFdoZW4gZGF0YSBoYXMgb2JqZWN0c1xuICAgICAgICAgICAgaW5wdXQ6IFt7eDoxLCB5OjJ9LCB7eDoyLCB5OjN9LCB7eDozLCB5OjR9XVxuICAgICAgICAgICAgbWluIHg6IDFcbiAgICAgICAgIGVnOiBXaGVuIGRhdGEgaGFzIGFycmF5c1xuICAgICAgICAgICAgaW5wdXQ6IFtbMTAsIDIwXSwgWzIwLCAzMF0sIFszMCwgNDBdXTtcbiAgICAgICAgICAgIG1pbiB4OiAxMFxuICAgICAgICAqL1xuICAgICAgICB4VmFsdWVzLm1pbiA9IF8ubWluQnkoZGF0dW0udmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueCB8fCBkYXRhT2JqZWN0WzBdKTtcbiAgICAgICAgLypcbiAgICAgICAgIGNvbXB1dGUgdGhlIG1heCB4IHZhbHVlXG4gICAgICAgICBlZzogV2hlbiBkYXRhIGhhcyBvYmplY3RzXG4gICAgICAgICAgICBpbnB1dDogW3t4OjEsIHk6Mn0sIHt4OjIsIHk6M30sIHt4OjMsIHk6NH1dXG4gICAgICAgICAgICBtYXggeDogM1xuICAgICAgICAgZWc6IFdoZW4gZGF0YSBoYXMgYXJyYXlzXG4gICAgICAgICAgICBpbnB1dDogW1sxMCwgMjBdLCBbMjAsIDMwXSwgWzMwLCA0MF1dO1xuICAgICAgICAgICAgbWF4IHg6IDMwXG4gICAgICAgICAqL1xuICAgICAgICB4VmFsdWVzLm1heCA9IF8ubWF4QnkoZGF0dW0udmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueCB8fCBkYXRhT2JqZWN0WzBdKTtcbiAgICAgICAgcmV0dXJuIHhWYWx1ZXM7XG4gICAgfVxuXG4gICAgLy8gR2V0dGluZyB0aGUgbWluIGFuZCBtYXggdmFsdWVzIGFtb25nIGFsbCB0aGUgeSB2YWx1ZXNcbiAgICBnZXRZTWluTWF4VmFsdWVzKGRhdHVtKSB7XG4gICAgICAgIGNvbnN0IHlWYWx1ZXM6IGFueSA9IHt9LFxuICAgICAgICAgICAgbWluVmFsdWVzID0gW10sXG4gICAgICAgICAgICBtYXhWYWx1ZXMgPSBbXTtcbiAgICAgICAgaWYgKCFkYXR1bSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgIEdldHRpbmcgdGhlIG1pbiBhbmQgbWF4IHkgdmFsdWVzIGFtb25nIGFsbCB0aGUgc2VyaWVzIG9mIGRhdGFcbiAgICAgICAgIGNvbXB1dGUgdGhlIG1pbiB5IHZhbHVlXG4gICAgICAgICBlZzogV2hlbiBkYXRhIGhhcyBvYmplY3RzXG4gICAgICAgICAgICBpbnB1dDogW1t7eDoxLCB5OjJ9LCB7eDoyLCB5OjN9LCB7eDozLCB5OjR9XSwgW3t4OjIsIHk6M30sIHt4OjMsIHk6NH0sIHt4OjQsIHk6NX1dXVxuICAgICAgICAgICAgbWluIHkgdmFsdWVzIDogJzInKGFtb25nIGZpcnN0IHNldCkgJiAnMycoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICAgIG1heCB5IHZhbHVlcyA6ICc0JyhhbW9uZyBmaXJzdCBzZXQpICYgJzUnKGFtb25nIHNlY29uZCBzZXQpXG5cbiAgICAgICAgIGVnOiBXaGVuIGRhdGEgaGFzIGFycmF5c1xuICAgICAgICAgICAgaW5wdXQ6IFtbWzEwLCAyMF0sIFsyMCwgMzBdLCBbMzAsIDQwXV0sIFtbMjAsIDMwXSwgWzMwLCA0MF0sIFs0MCwgNTBdXV1cbiAgICAgICAgICAgIG1pbiB5IHZhbHVlcyA6ICcyMCcoYW1vbmcgZmlyc3Qgc2V0KSAmICczMCcoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICAgIG1heCB5IHZhbHVlcyA6ICc0MCcoYW1vbmcgZmlyc3Qgc2V0KSAmICc1MCcoYW1vbmcgc2Vjb25kIHNldClcbiAgICAgICAgICovXG5cbiAgICAgICAgXy5mb3JFYWNoKGRhdHVtLCBkYXRhID0+IHtcbiAgICAgICAgICAgIG1pblZhbHVlcy5wdXNoKF8ubWluQnkoZGF0YS52YWx1ZXMsIGZ1bmN0aW9uIChkYXRhT2JqZWN0KSB7IHJldHVybiBkYXRhT2JqZWN0LnkgfHwgZGF0YU9iamVjdFsxXTsgfSkpO1xuICAgICAgICAgICAgbWF4VmFsdWVzLnB1c2goXy5tYXhCeShkYXRhLnZhbHVlcywgZnVuY3Rpb24gKGRhdGFPYmplY3QpIHsgcmV0dXJuIGRhdGFPYmplY3QueSB8fCBkYXRhT2JqZWN0WzFdOyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBHZXRzIHRoZSBsZWFzdCBhbmQgaGlnaGVzdCB2YWx1ZXMgYW1vbmcgYWxsIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMgb2YgcmVzcGVjdGl2ZSBzZXJpZXMgb2YgZGF0YVxuICAgICAgICB5VmFsdWVzLm1pbiA9IF8ubWluQnkobWluVmFsdWVzLCBkYXRhT2JqZWN0ID0+IGRhdGFPYmplY3QueSB8fCBkYXRhT2JqZWN0WzFdKTtcbiAgICAgICAgeVZhbHVlcy5tYXggPSBfLm1heEJ5KG1heFZhbHVlcywgZGF0YU9iamVjdCA9PiBkYXRhT2JqZWN0LnkgfHwgZGF0YU9iamVjdFsxXSk7XG4gICAgICAgIHJldHVybiB5VmFsdWVzO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSB4LWF4aXMgdmFsdWVzIGFyZSB1bmRlZmluZWQsIHdlIHJldHVybiBlbXB0eSBhcnJheSBlbHNlIHdlIHJldHVybiB0aGUgdmFsdWVzXG4gICAgZ2V0VmFsaWREYXRhKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gKHZhbHVlcy5sZW5ndGggPT09IDEgJiYgdmFsdWVzWzBdID09PSB1bmRlZmluZWQpID8gW10gOiB2YWx1ZXM7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyB0aGUgc2luZ2xlIGRhdGEgcG9pbnQgYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIGRhdGEgY2hhcnQgYWNjZXB0c1xuICAgIHZhbHVlRmluZGVyKGRhdGFPYmosIHhLZXksIHlLZXksIGluZGV4Pywgc2hhcGU/KSB7XG4gICAgICAgIGNvbnN0IHhWYWwgPSB0aGlzLmdldHhBeGlzVmFsKGRhdGFPYmosIHhLZXksIGluZGV4KSxcbiAgICAgICAgICAgIHZhbHVlID0gXy5nZXQoZGF0YU9iaiwgeUtleSksXG4gICAgICAgICAgICB5VmFsID0gcGFyc2VGbG9hdCh2YWx1ZSkgfHwgdmFsdWUsXG4gICAgICAgICAgICBzaXplID0gcGFyc2VGbG9hdChkYXRhT2JqW3RoaXMuYnViYmxlc2l6ZV0pIHx8IDI7XG4gICAgICAgIGxldCBkYXRhUG9pbnQ6IGFueSA9IHt9O1xuXG4gICAgICAgIGlmIChpc0NoYXJ0RGF0YUpTT04odGhpcy50eXBlKSkge1xuICAgICAgICAgICAgZGF0YVBvaW50LnggPSB4VmFsO1xuICAgICAgICAgICAgZGF0YVBvaW50LnkgPSB5VmFsO1xuICAgICAgICAgICAgLy8gb25seSBCdWJibGUgY2hhcnQgaGFzIHRoZSB0aGlyZCBkaW1lbnNpb25cbiAgICAgICAgICAgIGlmIChpc0J1YmJsZUNoYXJ0KHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhUG9pbnQuc2l6ZSA9IHNpemU7XG4gICAgICAgICAgICAgICAgZGF0YVBvaW50LnNoYXBlID0gc2hhcGUgfHwgJ2NpcmNsZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNDaGFydERhdGFBcnJheSh0aGlzLnR5cGUpKSB7XG4gICAgICAgICAgICBkYXRhUG9pbnQgPSBbeFZhbCwgeVZhbF07XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkaW5nIGFjdHVhbCB1bndyYXBwZWQgZGF0YSB0byBjaGFydCBkYXRhIHRvIHVzZSBhdCB0aGUgdGltZSBvZiBzZWxlY3RlZCBkYXRhIHBvaW50IG9mIGNoYXJ0IGV2ZW50XG4gICAgICAgIGRhdGFQb2ludC5fZGF0YU9iaiA9IGRhdGFPYmo7XG4gICAgICAgIHJldHVybiBkYXRhUG9pbnQ7XG4gICAgfVxuXG4gICAgLy8gU2V0dGluZyBhcHByb3ByaWF0ZSBlcnJvciBtZXNzYWdlc1xuICAgIHNldEVyck1zZyhtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLnNob3dOb0RhdGFNc2cpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnRMb2FkRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pbnZhbGlkQ29uZmlnID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIFRPRE86IFNldCB0aGUgbG9jYWxlIGZyb20gdGhlIG1lc3NhZ2VcbiAgICAgICAgICAgIHRoaXMuZXJyTXNnID0gJyc7IC8vICRyb290U2NvcGUubG9jYWxlW21lc3NhZ2VdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvY2Vzc0NoYXJ0RGF0YSgpIHtcbiAgICAgICAgdGhpcy5zYW1wbGVEYXRhID0gZ2V0U2FtcGxlRGF0YSh0aGlzKTtcbiAgICAgICAgLy8gc2NvcGUgdmFyaWFibGVzIHVzZWQgdG8ga2VlcCB0aGUgYWN0dWFsIGtleSB2YWx1ZXMgZm9yIHgtYXhpc1xuICAgICAgICB0aGlzLnhEYXRhS2V5QXJyID0gW107XG4gICAgICAgIC8vIFBsb3R0aW5nIHRoZSBjaGFydCB3aXRoIHNhbXBsZSBkYXRhIHdoZW4gdGhlIGNoYXJ0IGRhdGFzZXQgaXMgbm90IGJvdW5kXG4gICAgICAgIGlmICghdGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgdGhpcy54RGF0YUtleUFyciA9IGdldERhdGVMaXN0KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zYW1wbGVEYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNoYXJ0RGF0YSB8fCAhdGhpcy5jaGFydERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGF0dW0gPSBbXSxcbiAgICAgICAgICAgIHlBeGlzS2V5LFxuICAgICAgICAgICAgc2hhcGVzOiBhbnkgPSBbXSxcbiAgICAgICAgICAgIHZhbHVlczogYW55ID0gW107XG4gICAgICAgIGNvbnN0IHhBeGlzS2V5ID0gdGhpcy54YXhpc2RhdGFrZXksXG4gICAgICAgICAgICB5QXhpc0tleXMgPSB0aGlzLnlheGlzZGF0YWtleSA/IHRoaXMueWF4aXNkYXRha2V5LnNwbGl0KCcsJykgOiBbXSxcbiAgICAgICAgICAgIGRhdGFTZXQgPSB0aGlzLmNoYXJ0RGF0YTtcblxuICAgICAgICBpZiAoXy5pc0FycmF5KGRhdGFTZXQpKSB7XG4gICAgICAgICAgICBpZiAoaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICB5QXhpc0tleSA9IHlBeGlzS2V5c1swXTtcbiAgICAgICAgICAgICAgICBkYXR1bSA9IF8ubWFwKGRhdGFTZXQsIChkYXRhT2JqLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzRW1wdHlPYmplY3QoZGF0YVNldFtpbmRleF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZUZpbmRlcihkYXRhU2V0W2luZGV4XSwgeEF4aXNLZXksIHlBeGlzS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRhdHVtID0gdGhpcy5nZXRWYWxpZERhdGEoZGF0dW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNCdWJibGVDaGFydCh0aGlzLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoYXBlcyA9IHRoaXMuc2hhcGUgPT09ICdyYW5kb20nID8gYWxsU2hhcGVzIDogdGhpcy5zaGFwZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeUF4aXNLZXlzLmZvckVhY2goKHlBeGlzS2V5LCBzZXJpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gIF8ubWFwKGRhdGFTZXQsIChkYXRhT2JqLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0VtcHR5T2JqZWN0KGRhdGFTZXRbaW5kZXhdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlRmluZGVyKGRhdGFTZXRbaW5kZXhdLCB4QXhpc0tleSwgeUF4aXNLZXksIGluZGV4LCAoXy5pc0FycmF5KHNoYXBlcykgJiYgc2hhcGVzW3Nlcmllc10pIHx8IHRoaXMuc2hhcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gdGhpcy5nZXRWYWxpZERhdGEodmFsdWVzKTtcbiAgICAgICAgICAgICAgICAgICAgZGF0dW0ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHZhbHVlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcHJldHRpZnlMYWJlbHMoeUF4aXNLZXkpXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9XG5cbiAgICBzZXRDaGFydERhdGEoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkRGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRDaGFydERhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzZWREYXRhO1xuICAgIH1cblxuICAgIC8vIGNvbnN0cnVjdGluZyB0aGUgZ3JvdXBlZCBkYXRhIGJhc2VkIG9uIHRoZSBzZWxlY3Rpb24gb2Ygb3JkZXJieSwgeCAmIHkgYXhpc1xuICAgIGdldFZpc3VhbGx5R3JvdXBlZERhdGEocXVlcnlSZXNwb25zZSwgZ3JvdXBpbmdDb2x1bW4pIHtcbiAgICAgICAgbGV0IGdyb3VwRGF0YTogYW55ID0ge30sXG4gICAgICAgICAgICBncm91cFZhbHVlczogYW55ID0gW10sXG4gICAgICAgICAgICBvcmRlckJ5RGV0YWlscyxcbiAgICAgICAgICAgIG1heExlbmd0aDtcbiAgICAgICAgY29uc3QgY2hhcnREYXRhOiBhbnkgPSBbXSxcbiAgICAgICAgICAgIF9pc0FyZWFDaGFydCA9IGlzQXJlYUNoYXJ0KHRoaXMudHlwZSksXG4gICAgICAgICAgICB5QXhpc0tleSA9IF8uZmlyc3QoXy5zcGxpdCh0aGlzLnlheGlzZGF0YWtleSwgJywnKSk7XG4gICAgICAgIHRoaXMueERhdGFLZXlBcnIgPSBbXTtcbiAgICAgICAgcXVlcnlSZXNwb25zZSA9IF8ub3JkZXJCeShxdWVyeVJlc3BvbnNlLCBfLnNwbGl0KHRoaXMuZ3JvdXBieSwgJywnKSk7XG4gICAgICAgIGlmICh0aGlzLm9yZGVyYnkpIHtcbiAgICAgICAgICAgIG9yZGVyQnlEZXRhaWxzID0gZ2V0TG9kYXNoT3JkZXJCeUZvcm1hdCh0aGlzLm9yZGVyYnkpO1xuICAgICAgICAgICAgcXVlcnlSZXNwb25zZSA9IF8ub3JkZXJCeShxdWVyeVJlc3BvbnNlLCBvcmRlckJ5RGV0YWlscy5jb2x1bW5zLCBvcmRlckJ5RGV0YWlscy5vcmRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXJ5UmVzcG9uc2UgPSBfLmdyb3VwQnkocXVlcnlSZXNwb25zZSwgZ3JvdXBpbmdDb2x1bW4pO1xuICAgICAgICAvLyBJbiBjYXNlIG9mIGFyZWEgY2hhcnQgYWxsIHRoZSBzZXJpZXMgZGF0YSBzaG91bGQgYmUgb2Ygc2FtZSBsZW5ndGhcbiAgICAgICAgaWYgKF9pc0FyZWFDaGFydCkge1xuICAgICAgICAgICAgbWF4TGVuZ3RoID0gXy5tYXgoXy5tYXAocXVlcnlSZXNwb25zZSwgb2JqID0+IG9iai5sZW5ndGgpKTtcbiAgICAgICAgfVxuICAgICAgICBfLmZvckVhY2gocXVlcnlSZXNwb25zZSwgKHZhbHVlcywgZ3JvdXBLZXkpID0+IHtcbiAgICAgICAgICAgIGdyb3VwVmFsdWVzID0gaXNBcmVhQ2hhcnQgPyBfLmZpbGwobmV3IEFycmF5KG1heExlbmd0aCksIFswLCAwXSkgOiBbXTtcbiAgICAgICAgICAgIF8uZm9yRWFjaFJpZ2h0KHZhbHVlcywgKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwVmFsdWVzW2luZGV4XSA9IHRoaXMudmFsdWVGaW5kZXIodmFsdWUsIHRoaXMueGF4aXNkYXRha2V5LCB5QXhpc0tleSwgaW5kZXgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBncm91cERhdGEgPSB7XG4gICAgICAgICAgICAgICAga2V5IDogZ3JvdXBLZXksXG4gICAgICAgICAgICAgICAgdmFsdWVzIDogZ3JvdXBWYWx1ZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjaGFydERhdGEucHVzaChncm91cERhdGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNoYXJ0RGF0YTtcbiAgICB9XG5cbiAgICAvKkRlY2lkZXMgd2hldGhlciB0aGUgZGF0YSBzaG91bGQgYmUgdmlzdWFsbHkgZ3JvdXBlZCBvciBub3RcbiAgICAgICAgICAgIFZpc3VhbGx5IGdyb3VwZWQgd2hlbiBhIGRpZmZlcmVudCBjb2x1bW4gaXMgY2hvb3NlbiBpbiB0aGUgZ3JvdXAgYnkgb3RoZXIgdGhhbiB4IGFuZCB5IGF4aXMgYW5kIGFnZ3JlZ2F0aW9uIGlzIG5vdCBjaG9zZW4qL1xuICAgIGdldEdyb3VwaW5nRGV0YWlscygpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNHcm91cEJ5RW5hYmxlZCgpICYmICF0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGxldCBpc1Zpc3VhbGx5R3JvdXBlZCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZpc3VhbEdyb3VwaW5nQ29sdW1uLFxuICAgICAgICAgICAgICAgIGdyb3VwaW5nRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICBjb2x1bW5zOiBhbnkgPSBbXSxcbiAgICAgICAgICAgICAgICBncm91cGluZ0NvbHVtbkluZGV4O1xuICAgICAgICAgICAgY29uc3QgZ3JvdXBieUNvbHVtbnMgPSB0aGlzLmdyb3VwYnkgJiYgdGhpcy5ncm91cGJ5ICE9PSBOT05FID8gdGhpcy5ncm91cGJ5LnNwbGl0KCcsJykgOiBbXSxcbiAgICAgICAgICAgICAgICB5QXhpc0tleXMgPSB0aGlzLnlheGlzZGF0YWtleSA/IHRoaXMueWF4aXNkYXRha2V5LnNwbGl0KCcsJykgOiBbXTtcblxuICAgICAgICAgICAgaWYgKGdyb3VwYnlDb2x1bW5zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAvKkdldHRpbmcgdGhlIGdyb3VwIGJ5IGNvbHVtbiB3aGljaCBpcyBub3Qgc2VsZWN0ZWQgZWl0aGVyIGluIHggb3IgeSBheGlzKi9cbiAgICAgICAgICAgICAgICBncm91cGJ5Q29sdW1ucy5ldmVyeSgoY29sdW1uLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy54YXhpc2RhdGFrZXkgIT09IGNvbHVtbiAmJiAkLmluQXJyYXkoY29sdW1uLCB5QXhpc0tleXMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNWaXN1YWxseUdyb3VwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzdWFsR3JvdXBpbmdDb2x1bW4gPSBjb2x1bW47XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cGluZ0NvbHVtbkluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cGJ5Q29sdW1ucy5zcGxpY2UoZ3JvdXBpbmdDb2x1bW5JbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0aW5nIHRoZSBncm91cGJ5IGV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICBpZiAodmlzdWFsR3JvdXBpbmdDb2x1bW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1ucy5wdXNoKHZpc3VhbEdyb3VwaW5nQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXBieUNvbHVtbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMgPSBfLmNvbmNhdChjb2x1bW5zLCBncm91cGJ5Q29sdW1ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgeCBhbmQgeSBheGlzIGFyZSBub3QgaW5jbHVkZWQgaW4gYWdncmVnYXRpb24gbmVlZCB0byBiZSBpbmNsdWRlZCBpbiBncm91cGJ5XG4gICAgICAgICAgICBpZiAodGhpcy54YXhpc2RhdGFrZXkgIT09IHRoaXMuYWdncmVnYXRpb25jb2x1bW4pIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2godGhpcy54YXhpc2RhdGFrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXy5mb3JFYWNoKHlBeGlzS2V5cywga2V5ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLmFnZ3JlZ2F0aW9uY29sdW1uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3JvdXBpbmdFeHByZXNzaW9uID0gIGNvbHVtbnMuam9pbignLCcpO1xuICAgICAgICAgICAgLy8gc2V0IGlzVmlzdWFsbHlHcm91cGVkIGZsYWcgaW4gc2NvcGUgZm9yIGxhdGVyIHVzZVxuICAgICAgICAgICAgdGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCA9IGlzVmlzdWFsbHlHcm91cGVkO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cHJlc3Npb246IGdyb3VwaW5nRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICBpc1Zpc3VhbGx5R3JvdXBlZDogaXNWaXN1YWxseUdyb3VwZWQsXG4gICAgICAgICAgICAgICAgdmlzdWFsR3JvdXBpbmdDb2x1bW46IHZpc3VhbEdyb3VwaW5nQ29sdW1uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBleHByZXNzaW9uOiAnJyxcbiAgICAgICAgICAgIGlzVmlzdWFsbHlHcm91cGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHZpc3VhbEdyb3VwaW5nQ29sdW1uOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHRvIGdldCB0aGUgYWdncmVnYXRlZCBkYXRhIGFmdGVyIGFwcGx5aW5nIHRoZSBhZ2dyZWdhdGlvbiAmIGdyb3VwIGJ5IG9yIG9yZGVyIGJ5IG9wZXJhdGlvbnMuXG4gICAgZ2V0QWdncmVnYXRlZERhdGEoY2FsbGJhY2spIHtcbiAgICAgICAgY29uc3QgdmFyaWFibGU6IGFueSA9IHRoaXMuZGF0YXNvdXJjZSxcbiAgICAgICAgICAgIHlBeGlzS2V5cyA9IHRoaXMueWF4aXNkYXRha2V5ID8gdGhpcy55YXhpc2RhdGFrZXkuc3BsaXQoJywnKSA6IFtdLFxuICAgICAgICAgICAgZGF0YTogYW55ID0ge307XG4gICAgICAgIGxldCBzb3J0RXhwcixcbiAgICAgICAgICAgIGNvbHVtbnM6IGFueSA9IFtdLFxuICAgICAgICAgICAgY29sQWxpYXMsXG4gICAgICAgICAgICBvcmRlckJ5Q29sdW1ucyxcbiAgICAgICAgICAgIGdyb3VwQnlGaWVsZHM6IGFueSA9IFtdO1xuXG4gICAgICAgIGlmICghdmFyaWFibGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIGdyb3VwQnlGaWVsZHMgPSBfLnNwbGl0KHRoaXMuZ3JvdXBieSwgJywnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcmRlcmJ5KSB7XG4gICAgICAgICAgICBzb3J0RXhwciA9IF8ucmVwbGFjZSh0aGlzLm9yZGVyYnksIC86L2csICcgJyk7XG4gICAgICAgICAgICBjb2x1bW5zID0gXy51bmlxKF8uY29uY2F0KGNvbHVtbnMsIGdyb3VwQnlGaWVsZHMsIFt0aGlzLmFnZ3JlZ2F0aW9uY29sdW1uXSkpO1xuICAgICAgICAgICAgb3JkZXJCeUNvbHVtbnMgPSBnZXRMb2Rhc2hPcmRlckJ5Rm9ybWF0KHRoaXMub3JkZXJieSkuY29sdW1ucztcbiAgICAgICAgICAgIC8vIElmIHRoZSBvcmRlcmJ5IGNvbHVtbiBpcyBjaG9zZW4gZWl0aGVyIGluIGdyb3VwYnkgb3Igb3JkZXJieSB0aGVuIHJlcGxhY2UgLiB3aXRoICQgZm9yIHRoYXQgY29sdW1uXG4gICAgICAgICAgICBfLmZvckVhY2goXy5pbnRlcnNlY3Rpb24oY29sdW1ucywgb3JkZXJCeUNvbHVtbnMpLCBjb2wgPT4ge1xuICAgICAgICAgICAgICAgIGNvbEFsaWFzID0gZ2V0VmFsaWRBbGlhc05hbWUoY29sKTtcbiAgICAgICAgICAgICAgICBzb3J0RXhwciA9IF8ucmVwbGFjZShzb3J0RXhwciwgY29sLCBjb2xBbGlhcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAvLyBTZW5kIHRoZSBncm91cCBieSBpbiB0aGUgYWdncmVnYXRpb25zIGFwaSBvbmx5IGlmIGFnZ3JlZ2F0aW9uIGlzIGFsc28gY2hvc2VuXG4gICAgICAgICAgICBkYXRhLmdyb3VwQnlGaWVsZHMgPSBncm91cEJ5RmllbGRzO1xuICAgICAgICAgICAgZGF0YS5hZ2dyZWdhdGlvbnMgPSAgW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgJ2ZpZWxkJzogdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAgYWdncmVnYXRpb25Gbk1hcFt0aGlzLmFnZ3JlZ2F0aW9uXSxcbiAgICAgICAgICAgICAgICAgICAgJ2FsaWFzJzogZ2V0VmFsaWRBbGlhc05hbWUodGhpcy5hZ2dyZWdhdGlvbmNvbHVtbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEV4ZWN1dGUgdGhlIHF1ZXJ5LlxuICAgICAgICB2YXJpYWJsZS5leGVjdXRlKCdnZXRBZ2dyZWdhdGVkRGF0YScsIHtcbiAgICAgICAgICAgICdhZ2dyZWdhdGlvbnMnIDogZGF0YSxcbiAgICAgICAgICAgICdzb3J0JyAgICAgICAgIDogc29ydEV4cHJcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIHJlc3VsdCBpbnRvIGEgZm9ybWF0IHN1cHBvcnRlZCBieSB0aGUgY2hhcnQuXG4gICAgICAgICAgICBjb25zdCBjaGFydERhdGE6IGFueSA9IFtdLFxuICAgICAgICAgICAgICAgIGFnZ3JlZ2F0aW9uQWxpYXM6IGFueSA9IGdldFZhbGlkQWxpYXNOYW1lKHRoaXMuYWdncmVnYXRpb25jb2x1bW4pLFxuICAgICAgICAgICAgICAgIHhBeGlzQWxpYXNLZXkgPSBnZXRWYWxpZEFsaWFzTmFtZSh0aGlzLnhheGlzZGF0YWtleSksXG4gICAgICAgICAgICAgICAgeUF4aXNBbGlhc0tleXMgPSBbXTtcblxuICAgICAgICAgICAgeUF4aXNLZXlzLmZvckVhY2goeUF4aXNLZXkgPT4geUF4aXNBbGlhc0tleXMucHVzaChnZXRWYWxpZEFsaWFzTmFtZSh5QXhpc0tleSkpKTtcblxuICAgICAgICAgICAgXy5mb3JFYWNoKHJlc3BvbnNlLmJvZHkuY29udGVudCwgKHJlc3BvbnNlQ29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgcmVzcG9uc2UgaW4gdGhlIGNoYXJ0RGF0YSBiYXNlZCBvbiAnYWdncmVnYXRpb25Db2x1bW4nLCAneEF4aXNEYXRhS2V5JyAmICd5QXhpc0RhdGFLZXknLlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3RoaXMuYWdncmVnYXRpb25jb2x1bW5dID0gcmVzcG9uc2VDb250ZW50W2FnZ3JlZ2F0aW9uQWxpYXNdO1xuICAgICAgICAgICAgICAgICAgICBvYmpbdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbl0gPSBfLmdldChyZXNwb25zZUNvbnRlbnQsIGFnZ3JlZ2F0aW9uQWxpYXMpIHx8IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgdGhpcy5hZ2dyZWdhdGlvbmNvbHVtbik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2JqW3RoaXMueGF4aXNkYXRha2V5XSA9IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgeEF4aXNBbGlhc0tleSkgfHwgXy5nZXQocmVzcG9uc2VDb250ZW50LCB0aGlzLnhheGlzZGF0YWtleSk7XG5cbiAgICAgICAgICAgICAgICB5QXhpc0tleXMuZm9yRWFjaCgoeUF4aXNLZXksIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9ialt5QXhpc0tleV0gPSByZXNwb25zZUNvbnRlbnRbeUF4aXNBbGlhc0tleXNbaW5kZXhdXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3lBeGlzS2V5XSA9IF8uZ2V0KHJlc3BvbnNlQ29udGVudCwgeUF4aXNBbGlhc0tleXNbaW5kZXhdKSB8fCBfLmdldChyZXNwb25zZUNvbnRlbnQsIHlBeGlzS2V5KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGNoYXJ0RGF0YS5wdXNoKG9iaik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5jaGFydERhdGEgPSBjaGFydERhdGE7XG5cbiAgICAgICAgICAgIHRyaWdnZXJGbihjYWxsYmFjayk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hhcnREYXRhID0gW107XG4gICAgICAgICAgICB0aGlzLnNldEVyck1zZygnTUVTU0FHRV9FUlJPUl9GRVRDSF9EQVRBJyk7XG4gICAgICAgICAgICB0cmlnZ2VyRm4oY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHNldHMgbWF4aW11bSB3aWR0aCBmb3IgdGhlIGxhYmVscyB0aGF0IGNhbiBiZSBkaXNwbGF5ZWQuVGhpcyB3aWxsIGhlbHBmdWwgd2hlbiB0aGV5IGFyZSBvdmVybGFwcGluZ1xuICAgIHNldExhYmVsc01heFdpZHRoKCkge1xuICAgICAgICBsZXQgeFRpY2tzLFxuICAgICAgICAgICAgdGlja1dpZHRoLFxuICAgICAgICAgICAgbWF4TGVuZ3RoLFxuICAgICAgICAgICAgeERpc3QsXG4gICAgICAgICAgICB5RGlzdCxcbiAgICAgICAgICAgIHRvdGFsSGVpZ2h0LFxuICAgICAgICAgICAgbWF4Tm9MYWJlbHMsXG4gICAgICAgICAgICBudGhFbGVtZW50LFxuICAgICAgICAgICAgbGFiZWxzQXZhaWxhYmxlV2lkdGgsXG4gICAgICAgICAgICBiYXJXcmFwcGVyLFxuICAgICAgICAgICAgeUF4aXNXcmFwcGVyLFxuICAgICAgICAgICAgc3ZnV3JhcHBlcjtcbiAgICAgICAgY29uc3QgZm9udHNpemUgPSBwYXJzZUludCh0aGlzLmZvbnRzaXplLCAxMCkgfHwgMTIsXG4gICAgICAgICAgICBpc0JhcmNoYXJ0ID0gaXNCYXJDaGFydCh0aGlzLnR5cGUpO1xuICAgICAgICAvLyBnZXR0aW5nIHRoZSB4IHRpY2tzIGluIHRoZSBjaGFydFxuICAgICAgICB4VGlja3MgPSAkKCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJykuZmluZCgnZy5udi14JykuZmluZCgnZy50aWNrJykuZmluZCgndGV4dCcpO1xuXG4gICAgICAgIC8vIGdldHRpbmcgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byB2aXNpYmxlIHRpY2tzIGFzc29jaWF0ZWQgd2l0aCB2aXNpYmxlIHRleHRcbiAgICAgICAgeFRpY2tzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgeFRpY2sgPSAkKHRoaXMpO1xuICAgICAgICAgICAgbGV0IHhUcmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgdGlja0Rpc3Q7XG4gICAgICAgICAgICBpZiAoeFRpY2sudGV4dCgpICYmIHhUaWNrLmNzcygnb3BhY2l0eScpID09PSAnMScpIHtcbiAgICAgICAgICAgICAgICB4VHJhbnNmb3JtID0geFRpY2sucGFyZW50KCkuYXR0cigndHJhbnNmb3JtJykuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICB4RGlzdCA9IHBhcnNlRmxvYXQoeFRyYW5zZm9ybVswXS5zdWJzdHIoMTApKTtcbiAgICAgICAgICAgICAgICB5RGlzdCA9IHBhcnNlRmxvYXQoeFRyYW5zZm9ybVsxXSB8fCAnMCcpO1xuICAgICAgICAgICAgICAgIGlmICghaXNCYXJjaGFydCAmJiB4RGlzdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGlja0Rpc3QgPSB4RGlzdDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHlEaXN0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aWNrRGlzdCA9IHlEaXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGlja1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2tXaWR0aCA9IHRpY2tEaXN0IC0gdGlja1dpZHRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRpY2tXaWR0aCA9IHRpY2tEaXN0O1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbiBjYXNlIG9mIGJhciBjaGFydCBnZXR0aW5nIHRoZSBhdmFpbGFibGUgc3BhY2UgZm9yIHRoZSBsYWJlbHMgdG8gYmUgZGlzcGxheWVkXG4gICAgICAgIGlmIChpc0JhcmNoYXJ0KSB7XG4gICAgICAgICAgICBiYXJXcmFwcGVyID0gJCgnI3dtQ2hhcnQnICsgdGhpcy4kaWQgKyAnIHN2Zz5nLm52LXdyYXA+Zz5nLm52LWJhcnNXcmFwJylbMF07XG4gICAgICAgICAgICB5QXhpc1dyYXBwZXIgPSAkKCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnPmcubnYtd3JhcD5nPmcubnYteScpWzBdO1xuICAgICAgICAgICAgc3ZnV3JhcHBlciA9ICQoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKVswXTtcbiAgICAgICAgICAgIC8vIGdldHRpbmcgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgY2hhcnRcbiAgICAgICAgICAgIHRvdGFsSGVpZ2h0ID0gYmFyV3JhcHBlciA/IGJhcldyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0IDogMDtcbiAgICAgICAgICAgIC8vIGdldHRpbmcgdGhlIGxhYmVscyBhdmFpbGFibGUgc3BhY2VcbiAgICAgICAgICAgIGxhYmVsc0F2YWlsYWJsZVdpZHRoID0geUF4aXNXcmFwcGVyID8gc3ZnV3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAtIHlBeGlzV3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCA6IHN2Z1dyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgICAgICAvLyBTZXR0aW5nIHRoZSBtYXggbGVuZ3RoIGZvciB0aGUgbGFiZWxcbiAgICAgICAgICAgIG1heExlbmd0aCA9IE1hdGgucm91bmQobGFiZWxzQXZhaWxhYmxlV2lkdGggLyBmb250c2l6ZSk7XG4gICAgICAgICAgICAvLyBpZiBhdmFpbGFibGUgc3BhY2UgZm9yIGVhY2ggbGFiZWwgaXMgbGVzcyB0aGFuIHRoZSBmb250LXNpemVcbiAgICAgICAgICAgIC8vIHRoZW4gbGltaXRpbmcgdGhlIGxhYmVscyB0byBiZSBkaXNwbGF5ZWRcbiAgICAgICAgICAgIGlmICh0aWNrV2lkdGggPCBmb250c2l6ZSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgbWF4aW11bSBubyBvZiBsYWJlbHMgdG8gYmUgZml0dGVkXG4gICAgICAgICAgICAgICAgbWF4Tm9MYWJlbHMgPSB0b3RhbEhlaWdodCAvIGZvbnRzaXplO1xuICAgICAgICAgICAgICAgIC8vIHNob3dpbmcgb25seSB0aGUgbnRoIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBudGhFbGVtZW50ID0gTWF0aC5jZWlsKHRoaXMuY2hhcnREYXRhLmxlbmd0aCAvIG1heE5vTGFiZWxzKTtcbiAgICAgICAgICAgICAgICAvLyBzaG93aW5nIHVwIG9ubHkgc29tZSBsYWJlbHNcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKS5zZWxlY3QoJ2cubnYteCcpLnNlbGVjdEFsbCgnZy50aWNrJykuc2VsZWN0KCd0ZXh0JykuZWFjaChmdW5jdGlvbiAodGV4dCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBoaWRpbmcgZXZlcnkgbm9uIG50aCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICUgbnRoRWxlbWVudCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ29wYWNpdHknLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gU2V0dGluZyB0aGUgbWF4IGxlbmd0aCBmb3IgdGhlIGxhYmVsXG4gICAgICAgICAgICBtYXhMZW5ndGggPSBNYXRoLnJvdW5kKHRpY2tXaWR0aCAvIGZvbnRzaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1heExlbmd0aCBzaG91bGQgYWx3YXlzIGJlIGEgcG9zaXRpdmUgbnVtYmVyXG4gICAgICAgIG1heExlbmd0aCA9IE1hdGguYWJzKG1heExlbmd0aCk7XG4gICAgICAgIC8vIFZhbGlkYXRpbmcgaWYgZXZlcnkgbGFiZWwgZXhjZWVkcyB0aGUgbWF4IGxlbmd0aCBhbmQgaWYgc28gbGltaXRpbmcgdGhlIGxlbmd0aCBhbmQgYWRkaW5nIGVsbGlwc2lzXG4gICAgICAgIHhUaWNrcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRleHRDb250ZW50Lmxlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSB0aGlzLnRleHRDb250ZW50LnN1YnN0cigwLCBtYXhMZW5ndGgpICsgJy4uLic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGNvbHVtbnMgb2YgdGhhdCBjYW4gYmUgY2hvb3NlbiBpbiB0aGUgeCBhbmQgeSBheGlzXG4gICAgZ2V0RGVmYXVsdENvbHVtbnMoKSB7XG4gICAgICAgIGxldCB0eXBlLFxuICAgICAgICAgICAgc3RyaW5nQ29sdW1uLFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIHRlbXA7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0gW10sXG4gICAgICAgICAgICBjb2x1bW5zID0gdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1BST1BFUlRJRVNfTUFQKSB8fCBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29sdW1ucy5sZW5ndGggJiYgZGVmYXVsdENvbHVtbnMubGVuZ3RoIDw9IDI7IGkgKz0gMSkge1xuICAgICAgICAgICAgdHlwZSA9IGNvbHVtbnNbaV0udHlwZTtcbiAgICAgICAgICAgIGlmICghY29sdW1uc1tpXS5pc1JlbGF0ZWQgJiYgKGlzTnVtYmVyVHlwZSh0eXBlKSkpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0Q29sdW1ucy5wdXNoKGNvbHVtbnNbaV0uZmllbGROYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgIXN0cmluZ0NvbHVtbikge1xuICAgICAgICAgICAgICAgIHN0cmluZ0NvbHVtbiA9IGNvbHVtbnNbaV0uZmllbGROYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyIHRoYW4gYnViYmxlIGNoYXJ0IHg6IHN0cmluZyB0eXBlIHk6IG51bWJlciB0eXBlXG4gICAgICAgIC8vIEJ1YmJsZSBjaGFydCB4OiBudW1iZXIgdHlwZSB5OiBudW1iZXIgdHlwZVxuICAgICAgICBpZiAoc3RyaW5nQ29sdW1uICYmIGRlZmF1bHRDb2x1bW5zLmxlbmd0aCA+IDAgJiYgIWlzQnViYmxlQ2hhcnQodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgdGVtcCA9IGRlZmF1bHRDb2x1bW5zWzBdO1xuICAgICAgICAgICAgZGVmYXVsdENvbHVtbnNbMF0gPSBzdHJpbmdDb2x1bW47XG4gICAgICAgICAgICBkZWZhdWx0Q29sdW1uc1sxXSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmYXVsdENvbHVtbnM7XG4gICAgfVxuXG4gICAgLy8gQ2FsbCB1c2VyIGRlZmluZWQgamF2YXNjcmlwdCBmdW5jdGlvbiB3aGVuIHVzZXIgbGlua3MgaXQgdG8gY2xpY2sgZXZlbnQgb2YgdGhlIHdpZGdldC5cbiAgICBhdHRhY2hDbGlja0V2ZW50KCkge1xuICAgICAgICBsZXQgZGF0YU9iajtcbiAgICAgICAgZDMuc2VsZWN0KCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJykuc2VsZWN0QWxsKGNoYXJ0RGF0YVBvaW50WHBhdGhbdGhpcy50eXBlXSkuc3R5bGUoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgKGRhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQ29sdW1uJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQmFyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLl9kYXRhT2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1BpZSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RvbnV0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLmRhdGEuX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJlYSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0N1bXVsYXRpdmUgTGluZSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0xpbmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YU9iaiA9IGRhdGFbMF0uX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQnViYmxlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFPYmogPSBkYXRhLmRhdGEucG9pbnRbNF0uX2RhdGFPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSBkYXRhT2JqO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudDogZDMuZXZlbnQsIHNlbGVjdGVkQ2hhcnRJdGVtOiBkYXRhLCBzZWxlY3RlZEl0ZW06IHRoaXMuc2VsZWN0ZWRpdGVtfSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiAgUmV0dXJucyBZIFNjYWxlIG1pbiB2YWx1ZVxuICAgICAgICAgICBFeDogSW5wdXQgICA6IDguOTdcbiAgICAgICAgICAgICAgIE91dHB1dCAgOiA4Ljg3XG5cbiAgICAgICAgICAgICAgIElucHV0ICAgOiA4XG4gICAgICAgICAgICAgICBPdXRwdXQgIDogN1xuICAgICAgICovXG5cbiAgICBwb3N0UGxvdFByb2Nlc3MoY2hhcnQpIHtcbiAgICAgICAgbGV0IGNoYXJ0U3ZnLFxuICAgICAgICAgICAgcGllTGFiZWxzLFxuICAgICAgICAgICAgcGllR3JvdXBzLFxuICAgICAgICAgICAgYW5nbGVBcnJheTtcbiAgICAgICAgY29uc3Qgc3R5bGVPYmogPSB7fTtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XG5cbiAgICAgICAgcG9zdFBsb3RDaGFydFByb2Nlc3ModGhpcyk7XG5cbiAgICAgICAgaWYgKCFpc1BpZVR5cGUodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbHNNYXhXaWR0aCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnNob3dsYWJlbHNvdXRzaWRlKSB7XG4gICAgICAgICAgICAvKiogTnZkMyBoYXMgYSBpc3N1ZSBpbiByb3RhdGluZyB0ZXh0LiBTbyB3ZSB3aWxsIHVzZSB0aGlzIGFzIGEgdGVtcCBmaXguXG4gICAgICAgICAgICAgKiBJZiB0aGUgaXNzdWUgaXMgcmVzb2x2ZWQgdGhlcmUsIHdlIGNhbiByZW1vdmUgdGhpcy4qL1xuICAgICAgICAgICAgLyogSWYgaXQgaXMgYSBkb251dCBjaGFydCwgdGhlbiByb3RhdGUgdGhlIHRleHQgYW5kIHBvc2l0aW9uIHRoZW0qL1xuICAgICAgICAgICAgY2hhcnRTdmcgPSBkMy5zZWxlY3QoJyN3bUNoYXJ0JyArIHRoaXMuJGlkICsgJyBzdmcnKTtcbiAgICAgICAgICAgIHBpZUxhYmVscyA9IGNoYXJ0U3ZnLnNlbGVjdCgnLm52LXBpZUxhYmVscycpLnNlbGVjdEFsbCgnLm52LWxhYmVsJyk7XG4gICAgICAgICAgICBwaWVHcm91cHMgPSBjaGFydFN2Zy5zZWxlY3QoJy5udi1waWUnKS5zZWxlY3RBbGwoJy5udi1zbGljZScpO1xuICAgICAgICAgICAgYW5nbGVBcnJheSA9IFtdO1xuICAgICAgICAgICAgaWYgKHBpZUdyb3VwcyAmJiBwaWVHcm91cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcGllR3JvdXBzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ2xlQXJyYXkucHVzaChhbmdsZShkKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBpZUxhYmVscy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyb3VwID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAkKGdyb3VwWzBdWzBdKS5maW5kKCd0ZXh0JykuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSgnICsgYW5nbGVBcnJheVtpXSArICcpJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcmVwYXJlIHRleHQgc3R5bGUgcHJvcHMgb2JqZWN0IGFuZCBzZXRcbiAgICAgICAgXy5mb3JFYWNoKHN0eWxlUHJvcHMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnZm9udHNpemUnIHx8IGtleSA9PT0gJ2ZvbnR1bml0Jykge1xuICAgICAgICAgICAgICAgIHN0eWxlT2JqW3ZhbHVlXSA9IHRoaXMuZm9udHNpemUgKyB0aGlzLmZvbnR1bml0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZU9ialt2YWx1ZV0gPSB0aGlzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUZXh0U3R5bGUoc3R5bGVPYmosIHRoaXMuJGlkKTtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBhbGxvdyB3aW5kb3ctcmVzaXplIGZ1bmN0aW9uYWxpdHksIGZvciBvbmx5LXJ1biBtb2RlIGFzXG4gICAgICAgICAqIHVwZGF0aW5nIGNoYXJ0IGlzIGJlaW5nIGhhbmRsZWQgYnkgd2F0Y2hlcnMgb2YgaGVpZ2h0ICYgd2lkdGggaW4gc3R1ZGlvLW1vZGVcbiAgICAgICAgICogKi9cbiAgICAgICAgdHJpZ2dlckZuKHRoaXMuX3Jlc2l6ZUZuICYmIHRoaXMuX3Jlc2l6ZUZuLmNsZWFyKTtcbiAgICAgICAgdGhpcy5fcmVzaXplRm4gPSBudi51dGlscy53aW5kb3dSZXNpemUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgY2hhcnQudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgcG9zdFBsb3RDaGFydFByb2Nlc3ModGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1BpZVR5cGUodGhpcy50eXBlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldExhYmVsc01heFdpZHRoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBnZXQgcGFyZW50cyBvZiBhY2NvcmRpb24gdHlwZVxuICAgICAgICAgICAgICAgIC8qbGV0IHBhcmVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLmFwcC1hY2NvcmRpb24tcGFuZWwsIC50YWItcGFuZScpLmlzb2xhdGVTY29wZSgpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHByZXBhcmVzIGFuZCBjb25maWd1cmVzIHRoZSBjaGFydCBwcm9wZXJ0aWVzXG4gICAgY29uZmlndXJlQ2hhcnQoKSB7XG4gICAgICAgIC8vIENvcHkgdGhlIGRhdGEgb25seSBpbiBjYXNlIG9mIHBpZSBjaGFydCB3aXRoIGRlZmF1bHQgZGF0YVxuICAgICAgICAvLyBSZWFzb24gOiB3aGVuIG11bHRpcGxlIHBpZSBjaGFydHMgYXJlIGJvdW5kIHRvIHNhbWUgZGF0YSwgZmlyc3QgY2hhcnQgdGhlbWUgd2lsbCBiZSBhcHBsaWVkIHRvIGFsbCBjaGFydHNcbiAgICAgICAgbGV0IHhEb21haW5WYWx1ZXM7XG4gICAgICAgIGxldCB5RG9tYWluVmFsdWVzO1xuICAgICAgICBsZXQgY2hhcnQ7XG4gICAgICAgIGxldCBiZWZvcmVSZW5kZXJWYWw7XG4gICAgICAgIGNvbnN0IHlmb3JtYXRPcHRpb25zOiBhbnkgPSB7fTtcblxuICAgICAgICBpZiAodGhpcy5fcHJvY2Vzc2VkRGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAoaXNBeGlzRG9tYWluVmFsaWQodGhpcywgJ3gnKSkge1xuICAgICAgICAgICAgICAgIHhEb21haW5WYWx1ZXMgPSB0aGlzLmJpbmRkYXRhc2V0ID8gdGhpcy5nZXRYTWluTWF4VmFsdWVzKHRoaXMuX3Byb2Nlc3NlZERhdGFbMF0pIDogeyAnbWluJyA6IHsneCc6IDF9LCAgJ21heCcgOiB7J3gnIDogNX19O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXhpc0RvbWFpblZhbGlkKHRoaXMsICd5JykpIHtcbiAgICAgICAgICAgICAgICB5RG9tYWluVmFsdWVzID0gdGhpcy5iaW5kZGF0YXNldCA/IHRoaXMuZ2V0WU1pbk1heFZhbHVlcyh0aGlzLl9wcm9jZXNzZWREYXRhKSA6IHsgJ21pbicgOiB7J3knIDogMX0sICdtYXgnIDogeyd5JyA6IDV9fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1BpZVR5cGUodGhpcy50eXBlKSAmJiAoIXRoaXMuYmluZGRhdGFzZXQgfHwgIXRoaXMuc2NvcGVkYXRhc2V0KSkge1xuICAgICAgICAgICAgdGhpcy5fcHJvY2Vzc2VkRGF0YSA9IGdldENsb25lZE9iamVjdCh0aGlzLnNjb3BlZGF0YXNldCB8fCB0aGlzLl9wcm9jZXNzZWREYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGdldCB0aGUgY2hhcnQgb2JqZWN0XG4gICAgICAgIGNoYXJ0ID0gaW5pdENoYXJ0KHRoaXMsIHhEb21haW5WYWx1ZXMsIHlEb21haW5WYWx1ZXMsIG51bGwsICF0aGlzLmJpbmRkYXRhc2V0KTtcblxuICAgICAgICBpZiAoXy5pc0FycmF5KHRoaXMuX3Byb2Nlc3NlZERhdGEpKSB7XG4gICAgICAgICAgICBiZWZvcmVSZW5kZXJWYWwgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXJlbmRlcicsIHsgJ2NoYXJ0SW5zdGFuY2UnIDogY2hhcnR9KTtcbiAgICAgICAgICAgIGlmIChiZWZvcmVSZW5kZXJWYWwpIHtcbiAgICAgICAgICAgICAgICBjaGFydCA9IGJlZm9yZVJlbmRlclZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY2hhcnQgPSBjaGFydDtcbiAgICAgICAgICAgIC8vIGNoYW5naW5nIHRoZSBkZWZhdWx0IG5vIGRhdGEgbWVzc2FnZVxuICAgICAgICAgICAgZDMuc2VsZWN0KCcjd21DaGFydCcgKyB0aGlzLiRpZCArICcgc3ZnJylcbiAgICAgICAgICAgICAgICAuZGF0dW0odGhpcy5fcHJvY2Vzc2VkRGF0YSlcbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLmNoYXJ0KTtcbiAgICAgICAgICAgIHRoaXMucG9zdFBsb3RQcm9jZXNzKGNoYXJ0KTtcbiAgICAgICAgICAgIHJldHVybiBjaGFydDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFBsb3R0aW5nIHRoZSBjaGFydCB3aXRoIHNldCBvZiB0aGUgcHJvcGVydGllcyBzZXQgdG8gaXRcbiAgICBwbG90Q2hhcnQoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgICAvLyBjYWxsIHVzZXItdHJhbnNmb3JtZWQgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5jaGFydERhdGEgPSAodGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCd0cmFuc2Zvcm0nKSkgfHwgdGhpcy5jaGFydERhdGE7XG5cbiAgICAgICAgLy8gR2V0dGluZyB0aGUgb3JkZXIgYnkgZGF0YSBvbmx5IGluIHJ1biBtb2RlLiBUaGUgb3JkZXIgYnkgYXBwbGllcyBmb3IgYWxsIHRoZSBjaGFydHMgb3RoZXIgdGhhbiBwaWUgYW5kIGRvbnV0IGNoYXJ0c1xuICAgICAgICBpZiAodGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCAmJiAhaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSB0aGlzLmNoYXJ0RGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSB0aGlzLnByb2Nlc3NDaGFydERhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjaGVja2luZyB0aGUgcGFyZW50IGNvbnRhaW5lciBiZWZvcmUgcGxvdHRpbmcgdGhlIGNoYXJ0XG4gICAgICAgIGlmICghZWxlbWVudFswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jbGVhckNhbnZhcykge1xuICAgICAgICAgICAgLy8gZW1wdHkgc3ZnIHRvIGFkZC1uZXcgY2hhcnRcbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnc3ZnJykucmVwbGFjZVdpdGgoJzxzdmc+PC9zdmc+Jyk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FudmFzID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbiBjYXNlIG9mIGludmFsaWQgYXhpcyBzaG93IG5vIGRhdGEgYXZhaWxhYmxlIG1lc3NhZ2VcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRBeGlzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NlZERhdGEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBudi5hZGRHcmFwaCgoKSA9PiB0aGlzLmNvbmZpZ3VyZUNoYXJ0KCksICAoKSA9PiB7XG4gICAgICAgICAgICAvKkJ1YmJsZSBjaGFydCBoYXMgYW4gdGltZSBvdXQgZGVsYXkgb2YgMzAwbXMgaW4gdGhlaXIgaW1wbGVtZW50YXRpb24gZHVlIHRvIHdoaWNoIHdlXG4gICAgICAgICAgICAqIHdvbid0IGJlIGdldHRpbmcgcmVxdWlyZWQgZGF0YSBwb2ludHMgb24gYXR0YWNoaW5nIGV2ZW50c1xuICAgICAgICAgICAgKiBoZW5jZSBkZWxheWluZyBpdCA2MDBtcyovXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hDbGlja0V2ZW50KCk7XG4gICAgICAgICAgICB9LCA2MDApO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pc0xvYWRJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfVxuICAgIC8vIFRPRE86IE5lZWQgd2F5IHRvIGZpZ3VyZSBvdXQgaWYgdGhlIGRhdGFzb3VyY2UgaXMgYSBsaXZlIHNvdXJjZVxuICAgIGdldCBpc0xpdmVWYXJpYWJsZSgpIHtcbiAgICAgICAgLy8gc2V0dGluZyB0aGUgZmxhZyBmb3IgdGhlIGxpdmUgdmFyaWFibGUgaW4gdGhlIHNjb3BlIGZvciB0aGUgY2hlY2tzXG4gICAgICAgIGNvbnN0IHZhcmlhYmxlT2JqID0gdGhpcy5kYXRhc291cmNlO1xuICAgICAgICByZXR1cm4gdmFyaWFibGVPYmogJiYgdmFyaWFibGVPYmouY2F0ZWdvcnkgPT09ICd3bS5MaXZlVmFyaWFibGUnO1xuICAgIH1cblxuICAgIHBsb3RDaGFydFByb3h5KCkge1xuICAgICAgICB0aGlzLnNob3dDb250ZW50TG9hZEVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaW52YWxpZENvbmZpZyA9IGZhbHNlO1xuICAgICAgICAvLyBDaGVja2luZyBpZiB4IGFuZCB5IGF4aXMgYXJlIGNob3NlblxuICAgICAgICB0aGlzLmlzTG9hZEluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICBjb25zdCBncm91cGluZ0RldGFpbHMgPSB0aGlzLmdldEdyb3VwaW5nRGV0YWlscygpO1xuICAgICAgICAvLyBJZiBhZ2dyZWdhdGlvbi9ncm91cCBieS9vcmRlciBieSBwcm9wZXJ0aWVzIGhhdmUgYmVlbiBzZXQsIHRoZW4gZ2V0IHRoZSBhZ2dyZWdhdGVkIGRhdGEgYW5kIHBsb3QgdGhlIHJlc3VsdCBpbiB0aGUgY2hhcnQuXG4gICAgICAgIC8vIFRPRE86IGRhdGFzb3VyY2UgZm9yIGxpdmUgdmFyaWFibGUgZGV0ZWN0aW9uXG4gICAgICAgIGlmICh0aGlzLmJpbmRkYXRhc2V0ICYmIHRoaXMuaXNMaXZlVmFyaWFibGUgJiYgKHRoaXMuZmlsdGVyRmllbGRzIHx8IHRoaXMuaXNEYXRhRmlsdGVyaW5nRW5hYmxlZCgpKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBZ2dyZWdhdGVkRGF0YSgoKSA9PiB0aGlzLnBsb3RDaGFydCgpKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gRWxzZSwgc2ltcGx5IHBsb3QgdGhlIGNoYXJ0LlxuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiBsaXZlIHZhcmlhYmxlIHJlc2V0dGluZyB0aGUgYWdncmVnYXRlZCBkYXRhIHRvIHRoZSBub3JtYWwgZGF0YXNldCB3aGVuIHRoZSBhZ2dyZWdhdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhc2V0ICYmIHRoaXMuaXNMaXZlVmFyaWFibGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IHRoaXMuZGF0YXNldDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkgJiYgZ3JvdXBpbmdEZXRhaWxzLmlzVmlzdWFsbHlHcm91cGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhcnREYXRhID0gdGhpcy5nZXRWaXN1YWxseUdyb3VwZWREYXRhKHRoaXMuY2hhcnREYXRhLCBncm91cGluZ0RldGFpbHMudmlzdWFsR3JvdXBpbmdDb2x1bW4pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wbG90Q2hhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldHMgdGhlIGRlZmF1bHQgeCBhbmQgeSBheGlzIG9wdGlvbnNcbiAgICBzZXREZWZhdWx0QXhpc09wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb2x1bW5zID0gdGhpcy5nZXREZWZhdWx0Q29sdW1ucygpO1xuICAgICAgICAvLyBJZiB3ZSBnZXQgdGhlIHZhbGlkIGRlZmF1bHQgY29sdW1ucyB0aGVuIGFzc2lnbiB0aGVtIGFzIHRoZSB4IGFuZCB5IGF4aXNcbiAgICAgICAgLy8gSW4gY2FzZSBvZiBzZXJ2aWNlIHZhcmlhYmxlIHdlIG1heSBub3QgZ2V0IHRoZSB2YWxpZCBjb2x1bW5zIGJlY2F1c2Ugd2UgY2Fubm90IGtub3cgdGhlIGRhdGF0eXBlc1xuICAgICAgICB0aGlzLnhheGlzZGF0YWtleSA9IGRlZmF1bHRDb2x1bW5zWzBdIHx8IG51bGw7XG4gICAgICAgIHRoaXMueWF4aXNkYXRha2V5ID0gZGVmYXVsdENvbHVtbnNbMV0gfHwgbnVsbDtcbiAgICB9XG5cbiAgICBnZXRDdXRvbWl6ZWRPcHRpb25zKHByb3AsIGZpZWxkcykge1xuICAgICAgICBjb25zdCBncm91cEJ5Q29sdW1ucyA9IF8uc3BsaXQodGhpcy5ncm91cGJ5LCAnLCcpLFxuICAgICAgICAgICAgYWdnQ29sdW1ucyA9IF8uc3BsaXQodGhpcy5hZ2dyZWdhdGlvbmNvbHVtbiwgJywnKTtcbiAgICAgICAgaWYgKCF0aGlzLmJpbmRkYXRhc2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRzO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5heGlzb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpcy5heGlzb3B0aW9ucyA9IGZpZWxkcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgbmV3T3B0aW9ucztcbiAgICAgICAgc3dpdGNoIChwcm9wKSB7XG4gICAgICAgICAgICBjYXNlICd4YXhpc2RhdGFrZXknOlxuICAgICAgICAgICAgICAgIC8vIElmIGdyb3VwIGJ5IGVuYWJsZWQsIGNvbHVtbnMgY2hvc2VuIGluIGdyb3VwYnkgd2lsbCBiZSBwb3B1bGF0ZWQgaW4geCBheGlzIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwQnlFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9ucyA9IGdyb3VwQnlDb2x1bW5zO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3lheGlzZGF0YWtleSc6XG4gICAgICAgICAgICAgICAgLy8gSWYgYWdncmVnYXRpb24gYnkgZW5hYmxlZCwgY29sdW1ucyBjaG9zZW4gaW4gYWdncmVnYXRpb24gd2lsbCBiZSBwb3B1bGF0ZWQgaW4geSBheGlzIG9wdGlvbnNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbnMgPSBhZ2dDb2x1bW5zO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0xpdmVWYXJpYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBjYXNlIG9mIGxpdmUgdmFyaWFibGUgcG9wdWxhdGluZyBvbmx5IG51bWVyaWMgY29sdW1uc1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncm91cGJ5JzpcbiAgICAgICAgICAgICAgICAvLyBGaWx0ZXJpbmcgb25seSBub24gcHJpbWFyeSBrZXkgY29sdW1uc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTGl2ZVZhcmlhYmxlICYmIHRoaXMubm9uUHJpbWFyeUNvbHVtbnMgJiYgdGhpcy5ub25QcmltYXJ5Q29sdW1ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T3B0aW9ucyA9IHRoaXMubm9uUHJpbWFyeUNvbHVtbnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWdncmVnYXRpb25jb2x1bW4nOlxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgJ2FnZ3JlZ2F0aW9uQ29sdW1uJyB0byBzaG93IGFsbCBrZXlzIGluIGNhc2Ugb2YgYWdncmVnYXRpb24gZnVuY3Rpb24gaXMgY291bnQgb3IgdG8gbnVtZXJpYyBrZXlzIGluIGFsbCBvdGhlciBjYXNlcy5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xpdmVWYXJpYWJsZSAmJiB0aGlzLmlzQWdncmVnYXRpb25FbmFibGVkKCkgJiYgdGhpcy5hZ2dyZWdhdGlvbiAhPT0gJ2NvdW50Jykge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcmRlcmJ5JzpcbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlICdhZ2dyZWdhdGlvbkNvbHVtbicgdG8gc2hvdyBhbGwga2V5cyBpbiBjYXNlIG9mIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uIGlzIGNvdW50IG9yIHRvIG51bWVyaWMga2V5cyBpbiBhbGwgb3RoZXIgY2FzZXMuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNMaXZlVmFyaWFibGUgJiYgdGhpcy5pc0FnZ3JlZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld09wdGlvbnMgPSBfLnVuaXEoXy5jb25jYXQoZ3JvdXBCeUNvbHVtbnMsIGFnZ0NvbHVtbnMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdidWJibGVzaXplJzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5udW1lcmljQ29sdW1ucyAmJiB0aGlzLm51bWVyaWNDb2x1bW5zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdPcHRpb25zID0gdGhpcy5udW1lcmljQ29sdW1ucztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3T3B0aW9ucyB8fCBmaWVsZHMgfHwgdGhpcy5heGlzb3B0aW9ucztcbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0aGF0IGl0ZXJhdGVzIHRocm91Z2ggYWxsIHRoZSBjb2x1bW5zIGFuZCB0aGVuIGZldGNoaW5nIHRoZSBudW1lcmljIGFuZCBub24gcHJpbWFyeSBjb2x1bW5zIGFtb25nIHRoZW1cbiAgICBzZXROdW1lcmljYW5kTm9uUHJpbWFyeUNvbHVtbnMoKSB7XG4gICAgICAgIGxldCBjb2x1bW5zLFxuICAgICAgICAgICAgdHlwZTtcbiAgICAgICAgY29uc3QgcHJvcGVydGllc01hcCA9IHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9QUk9QRVJUSUVTX01BUCk7XG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTtcbiAgICAgICAgdGhpcy5ub25QcmltYXJ5Q29sdW1ucyA9IFtdO1xuICAgICAgICAvLyBGZXRjaGluZyBhbGwgdGhlIGNvbHVtbnNcbiAgICAgICAgaWYgKHRoaXMuZGF0YXNldCAmJiAhXy5pc0VtcHR5KHByb3BlcnRpZXNNYXApKSB7XG4gICAgICAgICAgICBjb2x1bW5zID0gW107IC8vIFRPRE86IGZldGNoUHJvcGVydGllc01hcENvbHVtbnMocHJvcGVydGllc01hcCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29sdW1ucykge1xuICAgICAgICAgICAgLy8gSXRlcmF0aW5nIHRocm91Z2ggYWxsIHRoZSBjb2x1bW5zIGFuZCBmZXRjaGluZyB0aGUgbnVtZXJpYyBhbmQgbm9uIHByaW1hcnkga2V5IGNvbHVtbnNcbiAgICAgICAgICAgIF8uZm9yRWFjaChPYmplY3Qua2V5cyhjb2x1bW5zKSwgKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHR5cGUgPSBjb2x1bW5zW2tleV0udHlwZTtcbiAgICAgICAgICAgICAgICBpZiAoaXNOdW1iZXJUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBIaWRpbmcgb25seSB0YWJsZSdzIHByaW1hcnkga2V5XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbnNba2V5XS5pc1JlbGF0ZWRQayA9PT0gJ3RydWUnIHx8ICFjb2x1bW5zW2tleV0uaXNQcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9uUHJpbWFyeUNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IHRoaXMubnVtZXJpY0NvbHVtbnMuc29ydCgpO1xuICAgICAgICAgICAgdGhpcy5ub25QcmltYXJ5Q29sdW1ucyA9IHRoaXMubm9uUHJpbWFyeUNvbHVtbnMuc29ydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcGxvdCB0aGUgY2hhcnRcbiAgICBoYW5kbGVEYXRhU2V0KG5ld1ZhbCkge1xuICAgICAgICB0aGlzLmVyck1zZyA9ICcnO1xuICAgICAgICAvLyBSZXNldHRpbmcgdGhlIGZsYWcgdG8gZmFsc2Ugd2hlbiB0aGUgYmluZGluZyB3YXMgcmVtb3ZlZFxuICAgICAgICBpZiAoIW5ld1ZhbCAmJiAhdGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgdGhpcy5pc1Zpc3VhbGx5R3JvdXBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5heGlzb3B0aW9ucyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsaXZlVmFyaWFibGVzIGNvbnRhaW4gZGF0YSBpbiAnZGF0YScgcHJvcGVydHknIG9mIHRoZSB2YXJpYWJsZVxuICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IHRoaXMuaXNMaXZlVmFyaWFibGUgPyBuZXdWYWwgfHwgJycgOiAobmV3VmFsICYmIG5ld1ZhbC5kYXRhVmFsdWUgPT09ICcnICYmIF8ua2V5cyhuZXdWYWwpLmxlbmd0aCA9PT0gMSkgPyAnJyA6IG5ld1ZhbDtcblxuICAgICAgICAvLyBpZiB0aGUgZGF0YSByZXR1cm5lZCBpcyBhbiBvYmplY3QgbWFrZSBpdCBhbiBhcnJheSBvZiBvYmplY3RcbiAgICAgICAgaWYgKCFfLmlzQXJyYXkodGhpcy5jaGFydERhdGEpICYmIF8uaXNPYmplY3QodGhpcy5jaGFydERhdGEpKSB7XG4gICAgICAgICAgICB0aGlzLmNoYXJ0RGF0YSA9IFt0aGlzLmNoYXJ0RGF0YV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3VmFsICYmIG5ld1ZhbC5maWx0ZXJGaWVsZHMpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyRmllbGRzID0gbmV3VmFsLmZpbHRlckZpZWxkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBsb3RjaGFydCBmb3Igb25seSB2YWxpZCBkYXRhIGFuZCBvbmx5IGFmdGVyIGJvdW5kIHZhcmlhYmxlIHJldHVybnMgZGF0YVxuICAgICAgICBpZiAodGhpcy5jaGFydERhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bsb3RDaGFydFByb3h5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfcGxvdENoYXJ0UHJveHkgPSBfLmRlYm91bmNlKHRoaXMucGxvdENoYXJ0UHJveHkuYmluZCh0aGlzKSwgMTAwKTtcblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBuZXdWYWwsIG9sZFZhbD8pIHtcbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG5ld1ZhbCwgb2xkVmFsKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RhdGFzZXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRGF0YVNldChuZXdWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndHlwZSc6XG4gICAgICAgICAgICAgICAgLy8gQmFzZWQgb24gdGhlIGNoYW5nZSBpbiB0eXBlIGRlY2lkaW5nIHRoZSBkZWZhdWx0IG1hcmdpbnNcbiAgICAgICAgICAgICAgICBpZiAoaXNQaWVUeXBlKHRoaXMudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXR0b3AgPSAyMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRyaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0Ym90dG9tID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRsZWZ0ID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9sZFZhbCA9PT0gJ1BpZScgfHwgb2xkVmFsID09PSAnRG9udXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0dG9wID0gMjU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub2Zmc2V0cmlnaHQgPSAyNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRib3R0b20gPSA1NTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmZzZXRsZWZ0ID0gNzU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG9sZFZhbCAhPT0gbmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJDYW52YXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBJbiBzdHVkaW8gbW9kZSwgY29uZmlndXJlIHByb3BlcnRpZXMgZGVwZW5kZW50IG9uIGNoYXJ0IHR5cGVcbiAgICAgICAgICAgICAgICB0aGlzLl9wbG90Q2hhcnRQcm94eSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBJbiBSdW5Nb2RlLCB0aGUgcGxvdGNoYXJ0IG1ldGhvZCB3aWxsIG5vdCBiZSBjYWxsZWQgZm9yIGFsbCBwcm9wZXJ0eSBjaGFuZ2VcbiAgICAgICAgICAgICAgICB0aGlzLl9wbG90Q2hhcnRQcm94eSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGFkdmFuY2VEYXRhUHJvcHMsIGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Bsb3RDaGFydFByb3h5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVMb2FkaW5nKGRhdGEpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKGRhdGFTb3VyY2UgJiYgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkgJiYgaXNEYXRhU291cmNlRXF1YWwoZGF0YS52YXJpYWJsZSwgZGF0YVNvdXJjZSkpIHtcbiAgICAgICAgICAgIHRoaXMudmFyaWFibGVJbmZsaWdodCA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAgICAgdGhpcy5pc0xvYWRJblByb2dyZXNzID0gZGF0YS5hY3RpdmU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblN0eWxlQ2hhbmdlKGtleSwgbmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgY29uc3Qgc3R5bGVPYmogPSB7fTtcbiAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG5ld1ZhbCwgb2xkVmFsKTtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnRzaXplJzpcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnR1bml0JzpcbiAgICAgICAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgICAgIGNhc2UgJ2ZvbnRmYW1pbHknOlxuICAgICAgICAgICAgY2FzZSAnZm9udHdlaWdodCc6XG4gICAgICAgICAgICBjYXNlICdmb250c3R5bGUnOlxuICAgICAgICAgICAgY2FzZSAndGV4dGRlY29yYXRpb24nOlxuICAgICAgICAgICAgICAgIHN0eWxlT2JqW3N0eWxlUHJvcHNba2V5XV0gPSAoa2V5ID09PSAnZm9udHNpemUnIHx8IGtleSA9PT0gJ2ZvbnR1bml0JykgPyB0aGlzLmZvbnRzaXplICsgdGhpcy5mb250dW5pdCA6IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICBzZXRUZXh0U3R5bGUoc3R5bGVPYmosIHRoaXMuJGlkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSLCBbJ2ZvbnRzaXplJywgJ2ZvbnR1bml0JywgJ2NvbG9yJywgJ2ZvbnRmYW1pbHknLCAnZm9udHdlaWdodCcsICdmb250c3R5bGUnLCAndGV4dGRlY29yYXRpb24nXSk7XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdW5pcXVlIGlkIGZvciB0aGUgY29tcG9uZW50XG4gICAgICAgIHRoaXMuJGlkID0gdGhpcy53aWRnZXRJZCB8fCBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAvLyByZW1vdmUgdGl0bGUgYXR0cmlidXRlIGFzIHRoZSBlbGVtZW50IG9uIGhvdmVyIHNob3dzIHlvdSB0aGUgaGludCB0aHJvdWdoLW91dCB0aGUgZWxlbWVudFxuICAgICAgICByZW1vdmVBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ3RpdGxlJyk7XG4gICAgICAgIHRoaXMuY2hhcnRSZWFkeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJpbmRkYXRhc2V0ID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJyk7XG4gICAgICAgIC8vIFNob3cgbG9hZGluZyBzdGF0dXMgYmFzZWQgb24gdGhlIHZhcmlhYmxlIGxpZmUgY3ljbGVcbiAgICAgICAgdGhpcy5hcHAuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCB0aGlzLmhhbmRsZUxvYWRpbmcuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgLy8gRm9yIG9sZCBwcm9qZWN0c1xuICAgICAgICBpZiAoIV8uaW5jbHVkZXMoWydvdXRzaWRlJywgJ2luc2lkZScsICdoaWRlJ10sIHRoaXMuc2hvd2xhYmVscykpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd2xhYmVscyAgICAgICAgPSBnZXRCb29sZWFuVmFsdWUodGhpcy5zaG93bGFiZWxzKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd2xhYmVsc291dHNpZGUgPSBnZXRCb29sZWFuVmFsdWUodGhpcy5zaG93bGFiZWxzb3V0c2lkZSk7XG4gICAgICAgICAgICB0aGlzLnNob3dsYWJlbHMgICAgICAgID0gdGhpcy5zaG93bGFiZWxzID8gKHRoaXMuc2hvd2xhYmVsc291dHNpZGUgPyAnb3V0c2lkZScgOiAnaW5zaWRlJykgOiAnaGlkZSc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudGhlbWUpIHtcbiAgICAgICAgICAgIC8vIERlZmF1bHQgdGhlbWUgZm9yIHBpZS9kb251dCBpcyBBenVyZSBhbmQgZm9yIG90aGVyIGl0IGlzIFRlcnJlc3RyaWFsXG4gICAgICAgICAgICB0aGlzLnRoZW1lID0gaXNQaWVUeXBlKHRoaXMudHlwZSkgPyAnQXp1cmUnIDogJ1RlcnJlc3RyaWFsJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3dtQ2hhcnQnICsgdGhpcy4kaWQpO1xuICAgICAgICAvLyBXaGVuIHRoZXJlIGlzIG5vdCB2YWx1ZSBiaW5kaW5nLCB0aGVuIHBsb3QgdGhlIGNoYXJ0IHdpdGggc2FtcGxlIGRhdGFcbiAgICAgICAgaWYgKCF0aGlzLmJpbmRkYXRhc2V0ICYmICF0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzY29wZWRhdGFzZXQnKSkge1xuICAgICAgICAgICAgdGhpcy5fcGxvdENoYXJ0UHJveHkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlZHJhdyA9IHRoaXMuX3Bsb3RDaGFydFByb3h5LmJpbmQodGhpcyk7XG59XG4iXX0=