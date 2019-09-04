import { isEmptyObject, prettifyLabels } from '@wm/core';
export var chartTypes = ['Column', 'Line', 'Area', 'Cumulative Line', 'Bar', 'Pie', 'Donut', 'Bubble'], allShapes = ['circle', 'square', 'diamond', 'cross', 'triangle-up', 'triangle-down'];
var dateList = ['01/01/2001', '01/01/2002', '01/01/2003'], themes = {
    'Terrestrial': {
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
        tooltip: {
            'backgroundColor': '#de7d28',
            'textColor': '#FFFFFF'
        }
    },
    'Annabelle': {
        colors: ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'],
        tooltip: {
            'backgroundColor': '#2e306f',
            'textColor': '#FFFFFF'
        }
    },
    'Azure': {
        colors: ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'],
        tooltip: {
            'backgroundColor': '#3182bd',
            'textColor': '#FFFFFF'
        }
    },
    'Retro': {
        colors: ['#0ca7a1', '#ffa615', '#334957', '#acc5c2', '#988f90', '#8accc9', '#515151', '#f27861', '#36c9fd', '#794668', '#0f709d', '#0d2738', '#44be78', '#4a1839', '#6a393f', '#557d8b', '#6c331c', '#1c1c1c', '#861500', '#09562a'],
        tooltip: {
            'backgroundColor': '#80513a',
            'textColor': '#FFFFFF'
        }
    },
    'Mellow': {
        colors: ['#f0dcbf', '#88c877', '#aeb918', '#2e2c23', '#ddddd2', '#dfe956', '#4c963b', '#5d3801', '#e1eec3', '#cd8472', '#fcfab3', '#9a4635', '#9295ad', '#2e3f12', '#565677', '#557d8b', '#4f4d02', '#0c0c1b', '#833324', '#24120e'],
        tooltip: {
            'backgroundColor': '#7c9e73',
            'textColor': '#FFFFFF'
        }
    },
    'Orient': {
        colors: ['#a80000', '#cc6c3c', '#f0e400', '#000084', '#fccc6c', '#009c6c', '#cc309c', '#78cc00', '#fc84e4', '#48e4fc', '#4878d8', '#186c0c', '#606060', '#a8a8a8', '#000000', '#d7d7d7', '#75a06e', '#190d0b', '#888888', '#694b84'],
        tooltip: {
            'backgroundColor': '#c14242',
            'textColor': '#FFFFFF'
        }
    },
    'GrayScale': {
        colors: ['#141414', '#353535', '#5b5b5b', '#848484', '#a8a8a8', '#c3c3c3', '#e0e0e0', '#c8c8c8', '#a5a5a5', '#878787', '#656565', '#4e4e4e', '#303030', '#1c1c1c', '#4f4f4f', '#3b3b3b', '#757575', '#606060', '#868686', '#c1c1c1'],
        tooltip: {
            'backgroundColor': '#575757',
            'textColor': '#FFFFFF'
        }
    },
    'Flyer': {
        colors: ['#3f454c', '#5a646e', '#848778', '#cededf', '#74c4dd', '#0946ed', '#380bb1', '#000ff0', '#f54a23', '#1db262', '#bca3aa', '#ffa500', '#a86b32', '#63a18c', '#56795e', '#934343', '#b75f5f', '#752d2d', '#4e1111', '#920606'],
        tooltip: {
            'backgroundColor': '#47637c',
            'textColor': '#FFFFFF'
        }
    },
    'Luminosity': {
        colors: ['#FFFFFF', '#e4e4e4', '#00bcd4', '#f0dd2f', '#00aabf', '#018376', '#e91e63', '#39e5d4', '#ff6d6d', '#00ff76', '#ff9800', '#969696', '#ff4200', '#e00000', '#95cbe5', '#5331ff', '#fff4a7', '#e7a800', '#0061e4', '#d5e7ff'],
        tooltip: {
            'backgroundColor': '#47637c',
            'textColor': '#FFFFFF'
        }
    }
}, basicProperties = ['xaxislabel', 'yaxislabel', 'xunits', 'yunits', 'xnumberformat', 'xdateformat', 'ynumberformat',
    'showvalues', 'showlabels', 'viewtype', 'areaviewtype', 'staggerlabels', 'reducexticks', 'offsettop', 'offsetbottom', 'offsetright', 'offsetleft',
    'barspacing', 'xaxislabeldistance', 'yaxislabeldistance', 'theme', 'labeltype', 'donutratio', 'showlabelsoutside', 'showxdistance', 'showydistance', 'shape', 'nodatamessage', 'captions', 'showxaxis', 'showyaxis',
    'centerlabel', 'customcolors', 'showlegend', 'legendtype', 'xdomain', 'ydomain', 'tooltips', 'linethickness', 'highlightpoints', 'interpolation', 'labelthreshold'], barSpacingMap = {
    'small': 0.3,
    'medium': 0.5,
    'large': 0.8
}, donutRatioMap = {
    'small': 0.3,
    'medium': 0.6,
    'large': 0.7
}, barSpacingMapInvert = _.invert(barSpacingMap), donutRatioMapInvert = _.invert(donutRatioMap), tickformats = {
    'Thousand': {
        'prefix': 'K',
        'divider': 1000
    },
    'Million': {
        'prefix': 'M',
        'divider': 1000000
    },
    'Billion': {
        'prefix': 'B',
        'divider': 1000000000
    }
}, chartId = '#preview-chart', dataTypeJSON = ['Column', 'Line', 'Pie', 'Bar', 'Donut', 'Bubble'], // Charts that supports the data to be JSON;
lineTypeCharts = ['Line', 'Area', 'Cumulative Line'], // Charts that does not supports the string type of data in the xaxis in the nvd3;
dataTypeArray = ['Cumulative Line', 'Area'], // Charts that supports the data to be Array
SAMPLE_DATA = {
    'group1': 'Europe',
    'group2': 'Asia',
    'group3': 'America',
    'group4': 'Australia'
};
// returns true if chart type is pie
export var isPieChart = function (type) { return type === 'Pie'; };
// returns true if chart type is line
export var isLineChart = function (type) { return type === 'Line'; };
// returns true if chart type is bar
export var isBarChart = function (type) { return type === 'Bar'; };
// returns true if chart type is donut
export var isDonutChart = function (type) { return type === 'Donut'; };
// returns true if chart type is bubble
export var isBubbleChart = function (type) { return type === 'Bubble'; };
// returns true if chart type is column
export var isColumnChart = function (type) { return type === 'Column'; };
// returns true if chart type is area
export var isAreaChart = function (type) { return type === 'Area'; };
// returns true if chart type is area
export var isPieType = function (type) { return isPieChart(type) || isDonutChart(type); };
// The format of chart data is array of json objects in case of the following types of chart
export var isChartDataJSON = function (type) { return _.includes(dataTypeJSON, type) || !_.includes(chartTypes, type); };
// The format of chart data is array of objects in case of the following types of chart
export var isChartDataArray = function (type) { return _.includes(dataTypeArray, type); };
// returns true is the chart type is 'line', 'area' or 'cumulative line' else false
export var isLineTypeChart = function (type) { return _.includes(lineTypeCharts, type); };
// X/Y Domain properties are supported only for Column and Area charts
export var isAxisDomainSupported = function (type) { return isColumnChart(type) || isAreaChart(type); };
// Returns bar spacing value
export var getBarSpacingValue = function (value, prop) {
    if (prop === 'value') {
        return barSpacingMap[value];
    }
    if (prop === 'key') {
        return barSpacingMapInvert[value];
    }
};
// Returns radius value
export var getRadiusValue = function (value, prop) {
    if (prop === 'value') {
        return donutRatioMap[value];
    }
    if (prop === 'key') {
        return donutRatioMapInvert[value];
    }
};
// Returns labels config
export var getLabelValues = function (showlabels, showlabelsoutside, prop) {
    var labelsConfig = {};
    switch (showlabels) {
        case 'hide':
            labelsConfig.showlabels = false;
            break;
        case 'inside':
            labelsConfig.showlabels = true;
            labelsConfig.showlabelsoutside = false;
            break;
        case 'outside':
            labelsConfig.showlabels = true;
            labelsConfig.showlabelsoutside = true;
            break;
    }
    return labelsConfig;
};
// Construct the sample data
export var constructSampleData = function (dataType, yaxisLength, shape) {
    var first_series = [], second_series = [], third_series = [], first_series_array = [], second_series_array = [], third_series_array = [], first_series_bubble = [], second_series_bubble = [], third_series_bubble = [], data = [];
    switch (dataType) {
        case 'jsonFormat':
            first_series = [
                { 'x': '01/01/2001', 'y': 4000000 },
                { 'x': '01/01/2002', 'y': 1000000 },
                { 'x': '01/01/2003', 'y': 5000000 }
            ];
            second_series = [
                { 'x': '01/01/2001', 'y': 3000000 },
                { 'x': '01/01/2002', 'y': 4000000 },
                { 'x': '01/01/2003', 'y': 7000000 }
            ];
            third_series = [
                { 'x': '01/01/2001', 'y': 2000000 },
                { 'x': '01/01/2002', 'y': 8000000 },
                { 'x': '01/01/2003', 'y': 6000000 }
            ];
            data[0] = {
                values: first_series,
                key: SAMPLE_DATA.group1
            };
            if (yaxisLength >= 2) {
                data[1] = {
                    values: second_series,
                    key: SAMPLE_DATA.group2
                };
            }
            if (yaxisLength >= 3) {
                data[2] = {
                    values: third_series,
                    key: SAMPLE_DATA.group3
                };
            }
            break;
        case 'lineChartFormat':
            first_series = [
                { 'x': 1, 'y': 4000000 },
                { 'x': 2, 'y': 1000000 },
                { 'x': 3, 'y': 5000000 }
            ];
            second_series = [
                { 'x': 1, 'y': 3000000 },
                { 'x': 2, 'y': 4000000 },
                { 'x': 3, 'y': 7000000 }
            ];
            third_series = [
                { 'x': 1, 'y': 2000000 },
                { 'x': 2, 'y': 8000000 },
                { 'x': 3, 'y': 6000000 }
            ];
            data[0] = {
                values: first_series,
                key: SAMPLE_DATA.group1
            };
            if (yaxisLength >= 2) {
                data[1] = {
                    values: second_series,
                    key: SAMPLE_DATA.group2
                };
            }
            if (yaxisLength >= 3) {
                data[2] = {
                    values: third_series,
                    key: SAMPLE_DATA.group3
                };
            }
            break;
        case 'arrayFormat':
            first_series_array = [
                [1, 4000000],
                [2, 1000000],
                [3, 5000000]
            ];
            second_series_array = [
                [1, 3000000],
                [2, 4000000],
                [3, 7000000]
            ];
            third_series_array = [
                [1, 2000000],
                [2, 8000000],
                [3, 6000000]
            ];
            data[0] = {
                values: first_series_array,
                key: SAMPLE_DATA.group1
            };
            if (yaxisLength >= 2) {
                data[1] = {
                    values: second_series_array,
                    key: SAMPLE_DATA.group2
                };
            }
            if (yaxisLength >= 3) {
                data[2] = {
                    values: third_series_array,
                    key: SAMPLE_DATA.group3
                };
            }
            break;
        case 'bubbleFormat':
            shape = shape === 'random' ? allShapes[Math.floor(Math.random() * allShapes.length)] : shape;
            first_series_bubble = [
                { 'x': 80.66, 'y': 33739900, 'size': 78, 'shape': shape },
                { 'x': 79.84, 'y': 81902300, 'size': 90, 'shape': shape },
                { 'x': 78.6, 'y': 5523100, 'size': 45, 'shape': shape }
            ];
            second_series_bubble = [
                { 'x': 72.73, 'y': 79716200, 'size': 98, 'shape': shape },
                { 'x': 80.05, 'y': 61801600, 'size': 20, 'shape': shape },
                { 'x': 72.49, 'y': 73137200, 'size': 34, 'shape': shape }
            ];
            third_series_bubble = [
                { 'x': 68.09, 'y': 33739900, 'size': 45, 'shape': shape },
                { 'x': 81.55, 'y': 7485600, 'size': 78, 'shape': shape },
                { 'x': 68.60, 'y': 141850000, 'size': 56, 'shape': shape }
            ];
            data[0] = {
                values: first_series_bubble,
                key: SAMPLE_DATA.group1
            };
            if (yaxisLength >= 2) {
                data[1] = {
                    values: second_series_bubble,
                    key: SAMPLE_DATA.group2
                };
            }
            if (yaxisLength >= 3) {
                data[2] = {
                    values: third_series_bubble,
                    key: SAMPLE_DATA.group3
                };
            }
            break;
        case 'pieChartFormat':
            data = [
                { 'x': SAMPLE_DATA.group1, 'y': 1000000 },
                { 'x': SAMPLE_DATA.group2, 'y': 2000000 },
                { 'x': SAMPLE_DATA.group3, 'y': 3000000 },
                { 'x': SAMPLE_DATA.group4, 'y': 4000000 }
            ];
            break;
    }
    return data;
};
export var getDataType = function (widgetContext) {
    var type = widgetContext.type;
    if (isLineChart(type)) {
        return 'lineChartFormat';
    }
    if (isPieType(type)) {
        return 'pieChartFormat';
    }
    if (isBubbleChart(type)) {
        return 'bubbleFormat';
    }
    return isChartDataJSON(type) ? 'jsonFormat' : 'arrayFormat';
};
// Sample data to populate when no data is bound
export var getSampleData = function (widgetContext) { return constructSampleData(getDataType(widgetContext), _.split(widgetContext.yaxisdatakey, ',').length, widgetContext.shape); };
// Check whether X/Y Domain was set to Min and is supported for the present chart
export var isAxisDomainValid = function (widgetContext, axis) {
    if (widgetContext[axis + 'domain'] === 'Min' && (isAxisDomainSupported(widgetContext.type))) {
        return true;
    }
    return false;
};
// Check whether min and max values are finite or not
export var areMinMaxValuesValid = function (values) {
    if (_.isFinite(values.min) && _.isFinite(values.max)) {
        return true;
    }
    return false;
};
export var getYScaleMinValue = function (value) {
    var _min = Math.floor(value);
    /* If the number has a) decimal part returning floor value - 0.1
     b) no decimal part returning floor value - 1 */
    return Math.abs(value) - _min > 0 ? value - 0.1 : _min - 1;
};
// Chooses the data points of line/cumulative line/area chart and highlights them
export var highlightPoints = function (id, highlightpoints) {
    var chartSvg = id ? d3.select('#wmChart' + id + ' svg') : d3.select(chartId + ' svg');
    if (highlightpoints) {
        chartSvg.selectAll('.nv-point').style({ 'stroke-width': '6px', 'fill-opacity': '.95', 'stroke-opacity': '.95' });
    }
    else {
        chartSvg.selectAll('.nv-point').style({ 'stroke-width': '0px', 'fill-opacity': '0' });
    }
};
// Chooses the line of line/cumulative line and increases the thickness of it
export var setLineThickness = function (id, thickness) {
    var chartSvg = id ? d3.select('#wmChart' + id + ' svg') : d3.select(chartId + ' svg');
    thickness = thickness || 1.5;
    chartSvg.selectAll('.nv-line').style({ 'stroke-width': thickness });
};
// Constructing a common key value map for preview and canvas mode
export var initProperties = function (widgetContext, propertyValueMap) {
    if (!propertyValueMap || isEmptyObject(propertyValueMap)) {
        propertyValueMap = {};
    }
    _.forEach(basicProperties, function (prop) {
        if (_.isUndefined(propertyValueMap[prop])) {
            propertyValueMap[prop] = widgetContext[prop];
        }
    });
    return propertyValueMap;
};
export var getNumberValue = function (value, callback) {
    return isNaN(parseInt(value, 10)) ? callback(value, 'value') : value;
};
// Formats the given value according to date format
export var getDateFormatedData = function (dateFormat, d) {
    dateFormat = dateFormat || '%x';
    return d3.time.format(dateFormat)(new Date(d));
};
// Formats the given value according to number format
export var getNumberFormatedData = function (numberFormat, d) {
    var formattedData, divider, prefix;
    formattedData = d3.format(numberFormat)(d);
    // formatting the data based on number format selected
    if (numberFormat) {
        // Getting the respective divider[1000,1000000,1000000000] based on the number format choosen
        divider = (tickformats[numberFormat] && tickformats[numberFormat].divider) || 0;
        prefix = tickformats[numberFormat] && tickformats[numberFormat].prefix;
        if (prefix && divider !== 0) {
            formattedData = d3.format('.2f')(d / divider) + prefix;
        }
    }
    else {
        // Auto formatting the data when no formating option is chosen
        formattedData = d >= 1000 ? d3.format('.1s')(d) : d;
    }
    return formattedData;
};
// Set the visibility property of the chart x,y axis due to a bug in the nvd3
export var toggleAxisShow = function (property, value) {
    var $xAxis = d3.select(chartId + ' g.nv-axis.nv-x'), $yAxis = d3.select(chartId + ' g.nv-axis.nv-y');
    if (property === 'showxaxis') {
        $xAxis.style('visibility', value ? 'visible' : 'hidden');
    }
    else {
        $yAxis.style('visibility', value ? 'visible' : 'hidden');
    }
};
export var modifyLegendPosition = function (widgetContext, position, id) {
    var showLegend = isShowLegend(widgetContext.showlegend), chart_Id = id ? '#wmChart' + id : chartId, legendWrap = d3.select(chart_Id + ' .nv-legendWrap'), legendPadding = 5;
    // Return when showlegend is false
    if (!showLegend || !legendWrap[0][0]) {
        return;
    }
    if (position === 'bottom') {
        var legendWrapHeight_1 = legendWrap[0][0].getBoundingClientRect().height, wrap = d3.select(chart_Id + ' .nv-wrap'), wrapTransform = (wrap && wrap.attr('transform')) ? wrap.attr('transform').replace(/, /g, ',') : '', coordinates = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(wrapTransform), getChartHeight = function () {
            var chartHeight = $(chart_Id + ' svg>.nvd3.nv-wrap')[0].getBoundingClientRect().height;
            if (chartHeight === 0) { // fix for IE
                chartHeight = ($(chart_Id + ' svg')[0].getBoundingClientRect().height - (legendWrapHeight_1 + 15));
            }
            return chartHeight;
        };
        legendWrap.attr('transform', 'translate(0 , ' + (getChartHeight() - legendWrapHeight_1 - legendPadding) + ')');
        if (coordinates) {
            wrap.attr('transform', 'translate(' + coordinates[1] + ',' + legendPadding + ')');
        }
    }
};
// Returns value if legend need to shown or not
export var isShowLegend = function (value) {
    // Old projects will have either true or false
    if (value === 'false' || value === false) {
        return false;
    }
    if (value === 'true' || value === true) {
        return true;
    }
    // New projects will have either 'Hide Legend', 'Show Top', 'Show Bottom'
    return value === 'hide' ? false : true;
};
/**
 * Customise the tooltip for donut & pie charts and also for charts having only one value attached to yaxis
 * @param key
 * @param label
 */
export var customiseTooltip = function (chart, propertyValueMap, widgetContext, label) {
    chart.tooltip.contentGenerator(function (key) {
        var xValue = key.data.x, yValue;
        yValue = getNumberFormatedData(propertyValueMap.ynumberformat, key.data.y);
        if (isPieType(widgetContext.type)) {
            label = key.data.x;
            xValue = '';
        }
        return '<table>' +
            '<tbody>' +
            '<tr class="value"><b>' + xValue +
            '</b></tr>' +
            '<tr>' +
            '<td class="legend-color-guide"><div style="background-color:' + key.color + ';"></div></td>' +
            '<td class="key">' + label + '</td>' +
            '<td class="value">' + yValue + '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';
    });
};
// intializes the chart obejct
export var initChart = function (widgetContext, xDomainValues, yDomainValues, propertyValueMap, isPreview) {
    propertyValueMap = initProperties(widgetContext, propertyValueMap);
    var chart, colors = [], xaxislabel, yaxislabel, labelConfig, radius, barSpacing, showLegend, xAxisValue, hasMultipleYValues;
    var xValue = {}, yValue = {};
    switch (widgetContext.type) {
        case 'Column':
            barSpacing = getNumberValue(propertyValueMap.barspacing, getBarSpacingValue) || barSpacingMap.medium;
            chart = nv.models.multiBarChart()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .reduceXTicks(propertyValueMap.reducexticks)
                .rotateLabels(0)
                .showControls(false)
                .stacked(propertyValueMap.viewtype === 'Stacked' ? true : false)
                .groupSpacing(barSpacing);
            break;
        case 'Cumulative Line':
            chart = nv.models.cumulativeLineChart()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .showControls(false)
                .useInteractiveGuideline(propertyValueMap.tooltips)
                .interpolate(propertyValueMap.interpolation);
            break;
        case 'Line':
            chart = nv.models.lineChart()
                .useInteractiveGuideline(propertyValueMap.tooltips)
                .interpolate(propertyValueMap.interpolation);
            break;
        case 'Area':
            chart = nv.models.stackedAreaChart()
                .x(function (d) { return d[0]; })
                .y(function (d) { return d[1]; })
                .clipEdge(true)
                .showControls(false)
                .style(propertyValueMap.areaviewtype)
                .useInteractiveGuideline(propertyValueMap.tooltips)
                .interpolate(propertyValueMap.interpolation);
            break;
        case 'Bar':
            barSpacing = getNumberValue(propertyValueMap.barspacing, getBarSpacingValue) || barSpacingMap.medium;
            chart = nv.models.multiBarHorizontalChart()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .showControls(false)
                .stacked(propertyValueMap.viewtype === 'Stacked' ? true : false)
                .showValues(propertyValueMap.showvalues)
                .groupSpacing(barSpacing);
            break;
        case 'Pie':
        case 'Donut':
            labelConfig = getLabelValues(propertyValueMap.showlabels, propertyValueMap.showlabelsoutside, 'value');
            radius = getNumberValue(propertyValueMap.donutratio, getRadiusValue) || donutRatioMap.medium;
            chart = nv.models.pieChart()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .showLabels(labelConfig.showlabels)
                .labelType(propertyValueMap.labeltype)
                .valueFormat(d3.format('%'))
                .title(propertyValueMap.centerlabel)
                .labelThreshold(propertyValueMap.labelthreshold || 0.01)
                .labelsOutside(labelConfig.showlabelsoutside);
            if (isDonutChart(widgetContext.type)) {
                chart.donut(true)
                    .donutRatio(radius);
            }
            if (propertyValueMap.labeltype === 'key-value') {
                chart.labelType(function (d) { return d.data.x + ' ' + d.data.y; });
            }
            break;
        case 'Bubble':
            chart = nv.models.scatterChart()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .showDistX(propertyValueMap.showxdistance)
                .showDistY(propertyValueMap.showydistance);
            break;
    }
    if (xDomainValues) {
        xValue.min = xDomainValues.min.x || xDomainValues.min[0];
        xValue.max = xDomainValues.max.x || xDomainValues.max[0];
        // If the values on the x axis are string then min max values gives Infinity
        if (areMinMaxValuesValid(xValue)) {
            // Reducing the min value to 0.1 so the min value is not missed out
            xValue.min = getYScaleMinValue(xValue.min);
            chart.xDomain([xValue.min, xValue.max]);
        }
    }
    if (yDomainValues) {
        // Reducing the min value to 1 so the min value is not missed out
        yValue.min = yDomainValues.min.y || yDomainValues.min[1];
        yValue.max = yDomainValues.max.y || yDomainValues.max[1];
        // If the values on the y axis are string or invalid then min max values gives Infinity
        if (areMinMaxValuesValid(yValue)) {
            // Reducing the min value to 1 so the min value is not missed out
            yValue.min = getYScaleMinValue(yValue.min);
            chart.yDomain([yValue.min, yValue.max]);
        }
    }
    // Setting the legend type choosen by user or default it will be furious
    chart.legend.vers((propertyValueMap.legendtype && propertyValueMap.legendtype.toLowerCase()) || 'furious');
    if (!_.includes(chartTypes, widgetContext.type)) {
        chart = nv.models.multiBarChart()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
    }
    if (isPieType(widgetContext.type)) {
        // In case of pie/donut chart formatting the values of it
        if (propertyValueMap.labeltype === 'percent') {
            chart.valueFormat(d3.format('%'));
        }
        else {
            chart.valueFormat(function (d) { return getNumberFormatedData(propertyValueMap.ynumberformat, d); });
        }
        // Customizing the tooltips in case of the pie and donut when labelType is value
        customiseTooltip(chart, propertyValueMap, widgetContext);
    }
    else {
        chart.showXAxis(propertyValueMap.showxaxis)
            .showYAxis(propertyValueMap.showyaxis);
        // Setting the labels if they are specified explicitly or taking the axiskeys chosen
        xaxislabel = propertyValueMap.xaxislabel || prettifyLabels(widgetContext.xaxisdatakey) || 'x caption';
        yaxislabel = propertyValueMap.yaxislabel || prettifyLabels(widgetContext.yaxisdatakey) || 'y caption';
        // Checking if y axis has multiple values
        if (widgetContext.yaxisdatakey && widgetContext.yaxisdatakey.split(',').length > 1) {
            hasMultipleYValues = true;
        }
        // Customizing the tooltip to show yaxislabel, only if the y axis contains one value
        if (!hasMultipleYValues && !isBubbleChart(widgetContext.type)) {
            customiseTooltip(chart, propertyValueMap, widgetContext, yaxislabel);
        }
        // Adding the units to the captions if they are specified
        xaxislabel += propertyValueMap.xunits ? '(' + propertyValueMap.xunits + ')' : '';
        yaxislabel += propertyValueMap.yunits ? '(' + propertyValueMap.yunits + ')' : '';
        chart.xAxis
            .axisLabel(xaxislabel)
            .axisLabelDistance(propertyValueMap.xaxislabeldistance)
            .staggerLabels(propertyValueMap.staggerlabels);
        // If date format set format based date format
        if (propertyValueMap.xdateformat || (isPreview && !isBubbleChart(widgetContext.type))) {
            if (isLineTypeChart(widgetContext.type)) {
                chart.xAxis.tickFormat(function (d) {
                    // get the actual value
                    xAxisValue = isPreview ? dateList[d - 1] : widgetContext.xDataKeyArr[d];
                    return getDateFormatedData(propertyValueMap.xdateformat, xAxisValue);
                });
            }
            else {
                chart.xAxis.tickFormat(function (d) { return getDateFormatedData(propertyValueMap.xdateformat, d); });
            }
        }
        else if (propertyValueMap.xnumberformat) {
            chart.xAxis.tickFormat(function (d) { return getNumberFormatedData(propertyValueMap.xnumberformat, d); });
        }
        else {
            if (isLineTypeChart(widgetContext.type)) {
                // get the actual value
                chart.xAxis.tickFormat(function (d) { return widgetContext.xDataKeyArr[d]; });
            }
        }
        chart.yAxis
            .axisLabel(yaxislabel)
            .axisLabelDistance(propertyValueMap.yaxislabeldistance)
            .staggerLabels(propertyValueMap.staggerlabels)
            .tickFormat(function (d) { return getNumberFormatedData(propertyValueMap.ynumberformat, d); });
        if (isBarChart(widgetContext.type)) {
            chart.valueFormat(function (d) { return getNumberFormatedData(propertyValueMap.ynumberformat, d); });
        }
    }
    // Support for custom colors if user gives direct string of colors in text box
    if (_.isString(propertyValueMap.customcolors) && propertyValueMap.customcolors) {
        colors = _.split(propertyValueMap.customcolors, ',');
    }
    if (_.isArray(propertyValueMap.customcolors)) {
        colors = propertyValueMap.customcolors;
    }
    showLegend = isShowLegend(propertyValueMap.showlegend);
    chart.showLegend(showLegend)
        .margin({ top: propertyValueMap.offsettop, right: propertyValueMap.offsetright, bottom: propertyValueMap.offsetbottom, left: propertyValueMap.offsetleft })
        .color(colors.length ? colors : themes[propertyValueMap.theme].colors);
    chart.tooltip.enabled(propertyValueMap.tooltips);
    widgetContext.message = propertyValueMap.nodatamessage || 'No data found';
    // setting the no data message
    chart.noData(widgetContext.message);
    if (isLineTypeChart(widgetContext.type) && widgetContext.highlightpoints) {
        chart.dispatch.on('stateChange', function () {
            setTimeout(function () { return postPlotChartProcess(widgetContext); }, 100);
        });
    }
    return chart;
};
export var postPlotChartProcess = function (widgetContext, isPreview) {
    var id = isPreview ? null : widgetContext.$id;
    // If user sets to highlight the data points and increase the thickness of the line
    if (isLineTypeChart(widgetContext.type)) {
        setLineThickness(id, widgetContext.linethickness);
        highlightPoints(id, widgetContext.highlightpoints);
    }
    // Modifying the legend position only when legend is shown
    if (widgetContext.showlegend) {
        modifyLegendPosition(widgetContext, widgetContext.showlegend, id);
    }
};
export var getDateList = function () { return dateList; };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnQudXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NoYXJ0L2NoYXJ0LnV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSXpELE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUNwRyxTQUFTLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRXpGLElBQU0sUUFBUSxHQUFHLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsRUFDdkQsTUFBTSxHQUFHO0lBQ0wsYUFBYSxFQUFFO1FBQ1gsTUFBTSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQztRQUNwTyxPQUFPLEVBQUU7WUFDTCxpQkFBaUIsRUFBRSxTQUFTO1lBQzVCLFdBQVcsRUFBRSxTQUFTO1NBQ3pCO0tBQ0o7SUFDRCxXQUFXLEVBQUU7UUFDVCxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFB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QyxDQUFDLENBQUM7S0FDTjtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLFVBQUMsYUFBYSxFQUFFLFNBQVU7SUFDMUQsSUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7SUFDaEQsbUZBQW1GO0lBQ25GLElBQUksZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELGVBQWUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3REO0lBQ0QsMERBQTBEO0lBQzFELElBQUksYUFBYSxDQUFDLFVBQVUsRUFBRTtRQUMxQixvQkFBb0IsQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNyRTtBQUNMLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxjQUFNLE9BQUEsUUFBUSxFQUFSLENBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzRW1wdHlPYmplY3QsIHByZXR0aWZ5TGFiZWxzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQsIGQzLCBudjtcblxuZXhwb3J0IGNvbnN0IGNoYXJ0VHlwZXMgPSBbJ0NvbHVtbicsICdMaW5lJywgJ0FyZWEnLCAnQ3VtdWxhdGl2ZSBMaW5lJywgJ0JhcicsICdQaWUnLCAnRG9udXQnLCAnQnViYmxlJ10sXG4gICAgYWxsU2hhcGVzID0gWydjaXJjbGUnLCAnc3F1YXJlJywgJ2RpYW1vbmQnLCAnY3Jvc3MnLCAndHJpYW5nbGUtdXAnLCAndHJpYW5nbGUtZG93biddO1xuXG5jb25zdCBkYXRlTGlzdCA9IFsnMDEvMDEvMjAwMScsICcwMS8wMS8yMDAyJywgJzAxLzAxLzIwMDMnXSxcbiAgICB0aGVtZXMgPSB7XG4gICAgICAgICdUZXJyZXN0cmlhbCc6IHtcbiAgICAgICAgICAgIGNvbG9yczogWycjMWY3N2I0JywgJyNhZWM3ZTgnLCAnI2ZmN2YwZScsICcjZmZiYjc4JywgJyMyY2EwMmMnLCAnIzk4ZGY4YScsICcjZDYyNzI4JywgJyNmZjk4OTYnLCAnIzk0NjdiZCcsICcjYzViMGQ1JywgJyM4YzU2NGInLCAnI2M0OWM5NCcsICcjZTM3N2MyJywgJyNmN2I2ZDInLCAnIzdmN2Y3ZicsICcjYzdjN2M3JywgJyNiY2JkMjInLCAnI2RiZGI4ZCcsICcjMTdiZWNmJywgJyM5ZWRhZTUnXSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJzogJyNkZTdkMjgnLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29sb3InOiAnI0ZGRkZGRidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ0FubmFiZWxsZSc6IHtcbiAgICAgICAgICAgIGNvbG9yczogWycjMzkzYjc5JywgJyM1MjU0YTMnLCAnIzZiNmVjZicsICcjOWM5ZWRlJywgJyM2Mzc5MzknLCAnIzhjYTI1MicsICcjYjVjZjZiJywgJyNjZWRiOWMnLCAnIzhjNmQzMScsICcjYmQ5ZTM5JywgJyNlN2JhNTInLCAnI2U3Y2I5NCcsICcjODQzYzM5JywgJyNhZDQ5NGEnLCAnI2Q2NjE2YicsICcjZTc5NjljJywgJyM3YjQxNzMnLCAnI2E1NTE5NCcsICcjY2U2ZGJkJywgJyNkZTllZDYnXSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJzogJyMyZTMwNmYnLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29sb3InOiAnI0ZGRkZGRidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ0F6dXJlJzoge1xuICAgICAgICAgICAgY29sb3JzOiBbJyMzMTgyYmQnLCAnIzZiYWVkNicsICcjOWVjYWUxJywgJyNjNmRiZWYnLCAnI2U2NTUwZCcsICcjZmQ4ZDNjJywgJyNmZGFlNmInLCAnI2ZkZDBhMicsICcjMzFhMzU0JywgJyM3NGM0NzYnLCAnI2ExZDk5YicsICcjYzdlOWMwJywgJyM3NTZiYjEnLCAnIzllOWFjOCcsICcjYmNiZGRjJywgJyNkYWRhZWInLCAnIzYzNjM2MycsICcjOTY5Njk2JywgJyNiZGJkYmQnLCAnI2Q5ZDlkOSddLFxuICAgICAgICAgICAgdG9vbHRpcDoge1xuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kQ29sb3InOiAnIzMxODJiZCcsXG4gICAgICAgICAgICAgICAgJ3RleHRDb2xvcic6ICcjRkZGRkZGJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnUmV0cm8nOiB7XG4gICAgICAgICAgICBjb2xvcnM6IFsnIzBjYTdhMScsICcjZmZhNjE1JywgJyMzMzQ5NTcnLCAnI2FjYzVjMicsICcjOTg4ZjkwJywgJyM4YWNjYzknLCAnIzUxNTE1MScsICcjZjI3ODYxJywgJyMzNmM5ZmQnLCAnIzc5NDY2OCcsICcjMGY3MDlkJywgJyMwZDI3MzgnLCAnIzQ0YmU3OCcsICcjNGExODM5JywgJyM2YTM5M2YnLCAnIzU1N2Q4YicsICcjNmMzMzFjJywgJyMxYzFjMWMnLCAnIzg2MTUwMCcsICcjMDk1NjJhJ10sXG4gICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICcjODA1MTNhJyxcbiAgICAgICAgICAgICAgICAndGV4dENvbG9yJzogJyNGRkZGRkYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdNZWxsb3cnOiB7XG4gICAgICAgICAgICBjb2xvcnM6IFsnI2YwZGNiZicsICcjODhjODc3JywgJyNhZWI5MTgnLCAnIzJlMmMyMycsICcjZGRkZGQyJywgJyNkZmU5NTYnLCAnIzRjOTYzYicsICcjNWQzODAxJywgJyNlMWVlYzMnLCAnI2NkODQ3MicsICcjZmNmYWIzJywgJyM5YTQ2MzUnLCAnIzkyOTVhZCcsICcjMmUzZjEyJywgJyM1NjU2NzcnLCAnIzU1N2Q4YicsICcjNGY0ZDAyJywgJyMwYzBjMWInLCAnIzgzMzMyNCcsICcjMjQxMjBlJ10sXG4gICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICcjN2M5ZTczJyxcbiAgICAgICAgICAgICAgICAndGV4dENvbG9yJzogJyNGRkZGRkYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdPcmllbnQnOiB7XG4gICAgICAgICAgICBjb2xvcnM6IFsnI2E4MDAwMCcsICcjY2M2YzNjJywgJyNmMGU0MDAnLCAnIzAwMDA4NCcsICcjZmNjYzZjJywgJyMwMDljNmMnLCAnI2NjMzA5YycsICcjNzhjYzAwJywgJyNmYzg0ZTQnLCAnIzQ4ZTRmYycsICcjNDg3OGQ4JywgJyMxODZjMGMnLCAnIzYwNjA2MCcsICcjYThhOGE4JywgJyMwMDAwMDAnLCAnI2Q3ZDdkNycsICcjNzVhMDZlJywgJyMxOTBkMGInLCAnIzg4ODg4OCcsICcjNjk0Yjg0J10sXG4gICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICcjYzE0MjQyJyxcbiAgICAgICAgICAgICAgICAndGV4dENvbG9yJzogJyNGRkZGRkYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdHcmF5U2NhbGUnOiB7XG4gICAgICAgICAgICBjb2xvcnM6IFsnIzE0MTQxNCcsICcjMzUzNTM1JywgJyM1YjViNWInLCAnIzg0ODQ4NCcsICcjYThhOGE4JywgJyNjM2MzYzMnLCAnI2UwZTBlMCcsICcjYzhjOGM4JywgJyNhNWE1YTUnLCAnIzg3ODc4NycsICcjNjU2NTY1JywgJyM0ZTRlNGUnLCAnIzMwMzAzMCcsICcjMWMxYzFjJywgJyM0ZjRmNGYnLCAnIzNiM2IzYicsICcjNzU3NTc1JywgJyM2MDYwNjAnLCAnIzg2ODY4NicsICcjYzFjMWMxJ10sXG4gICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICcjNTc1NzU3JyxcbiAgICAgICAgICAgICAgICAndGV4dENvbG9yJzogJyNGRkZGRkYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdGbHllcic6IHtcbiAgICAgICAgICAgIGNvbG9yczogWycjM2Y0NTRjJywgJyM1YTY0NmUnLCAnIzg0ODc3OCcsICcjY2VkZWRmJywgJyM3NGM0ZGQnLCAnIzA5NDZlZCcsICcjMzgwYmIxJywgJyMwMDBmZjAnLCAnI2Y1NGEyMycsICcjMWRiMjYyJywgJyNiY2EzYWEnLCAnI2ZmYTUwMCcsICcjYTg2YjMyJywgJyM2M2ExOGMnLCAnIzU2Nzk1ZScsICcjOTM0MzQzJywgJyNiNzVmNWYnLCAnIzc1MmQyZCcsICcjNGUxMTExJywgJyM5MjA2MDYnXSxcbiAgICAgICAgICAgIHRvb2x0aXA6IHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZENvbG9yJzogJyM0NzYzN2MnLFxuICAgICAgICAgICAgICAgICd0ZXh0Q29sb3InOiAnI0ZGRkZGRidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ0x1bWlub3NpdHknOiB7XG4gICAgICAgICAgICBjb2xvcnM6IFsnI0ZGRkZGRicsICcjZTRlNGU0JywgJyMwMGJjZDQnLCAnI2YwZGQyZicsICcjMDBhYWJmJywgJyMwMTgzNzYnLCAnI2U5MWU2MycsICcjMzllNWQ0JywgJyNmZjZkNmQnLCAnIzAwZmY3NicsICcjZmY5ODAwJywgJyM5Njk2OTYnLCAnI2ZmNDIwMCcsICcjZTAwMDAwJywgJyM5NWNiZTUnLCAnIzUzMzFmZicsICcjZmZmNGE3JywgJyNlN2E4MDAnLCAnIzAwNjFlNCcsICcjZDVlN2ZmJ10sXG4gICAgICAgICAgICB0b29sdGlwOiB7XG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmRDb2xvcic6ICcjNDc2MzdjJyxcbiAgICAgICAgICAgICAgICAndGV4dENvbG9yJzogJyNGRkZGRkYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJhc2ljUHJvcGVydGllcyA9IFsneGF4aXNsYWJlbCcsICd5YXhpc2xhYmVsJywgJ3h1bml0cycsICd5dW5pdHMnLCAneG51bWJlcmZvcm1hdCcsICd4ZGF0ZWZvcm1hdCcsICd5bnVtYmVyZm9ybWF0JyxcbiAgICAgICAgJ3Nob3d2YWx1ZXMnLCAnc2hvd2xhYmVscycsICd2aWV3dHlwZScsICdhcmVhdmlld3R5cGUnLCAnc3RhZ2dlcmxhYmVscycsICdyZWR1Y2V4dGlja3MnLCAnb2Zmc2V0dG9wJywgJ29mZnNldGJvdHRvbScsICdvZmZzZXRyaWdodCcsICdvZmZzZXRsZWZ0JyxcbiAgICAgICAgJ2JhcnNwYWNpbmcnLCAneGF4aXNsYWJlbGRpc3RhbmNlJywgJ3lheGlzbGFiZWxkaXN0YW5jZScsICd0aGVtZScsICdsYWJlbHR5cGUnLCAnZG9udXRyYXRpbycsICdzaG93bGFiZWxzb3V0c2lkZScsICdzaG93eGRpc3RhbmNlJywgJ3Nob3d5ZGlzdGFuY2UnLCAnc2hhcGUnLCAnbm9kYXRhbWVzc2FnZScsICdjYXB0aW9ucycsICdzaG93eGF4aXMnLCAnc2hvd3lheGlzJyxcbiAgICAgICAgJ2NlbnRlcmxhYmVsJywgJ2N1c3RvbWNvbG9ycycsICdzaG93bGVnZW5kJywgJ2xlZ2VuZHR5cGUnLCAneGRvbWFpbicsICd5ZG9tYWluJywgJ3Rvb2x0aXBzJywgJ2xpbmV0aGlja25lc3MnLCAnaGlnaGxpZ2h0cG9pbnRzJywgJ2ludGVycG9sYXRpb24nLCAnbGFiZWx0aHJlc2hvbGQnXSxcbiAgICBiYXJTcGFjaW5nTWFwID0ge1xuICAgICAgICAnc21hbGwnIDogMC4zLFxuICAgICAgICAnbWVkaXVtJyA6IDAuNSxcbiAgICAgICAgJ2xhcmdlJyA6IDAuOFxuICAgIH0sXG4gICAgZG9udXRSYXRpb01hcCA9IHtcbiAgICAgICAgJ3NtYWxsJyA6IDAuMyxcbiAgICAgICAgJ21lZGl1bScgOiAwLjYsXG4gICAgICAgICdsYXJnZScgOiAwLjdcbiAgICB9LFxuICAgIGJhclNwYWNpbmdNYXBJbnZlcnQgPSBfLmludmVydChiYXJTcGFjaW5nTWFwKSxcbiAgICBkb251dFJhdGlvTWFwSW52ZXJ0ID0gXy5pbnZlcnQoZG9udXRSYXRpb01hcCksXG4gICAgdGlja2Zvcm1hdHMgPSB7XG4gICAgICAgICdUaG91c2FuZCc6IHtcbiAgICAgICAgICAgICdwcmVmaXgnOiAnSycsXG4gICAgICAgICAgICAnZGl2aWRlcic6IDEwMDBcbiAgICAgICAgfSxcbiAgICAgICAgJ01pbGxpb24nIDoge1xuICAgICAgICAgICAgJ3ByZWZpeCc6ICdNJyxcbiAgICAgICAgICAgICdkaXZpZGVyJzogMTAwMDAwMFxuICAgICAgICB9LFxuICAgICAgICAnQmlsbGlvbicgOiB7XG4gICAgICAgICAgICAncHJlZml4JzogJ0InLFxuICAgICAgICAgICAgJ2RpdmlkZXInOiAxMDAwMDAwMDAwXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNoYXJ0SWQgPSAnI3ByZXZpZXctY2hhcnQnLFxuICAgIGRhdGFUeXBlSlNPTiA9IFsnQ29sdW1uJywgJ0xpbmUnLCAnUGllJywgJ0JhcicsICdEb251dCcsICdCdWJibGUnXSwgICAgLy8gQ2hhcnRzIHRoYXQgc3VwcG9ydHMgdGhlIGRhdGEgdG8gYmUgSlNPTjtcbiAgICBsaW5lVHlwZUNoYXJ0cyA9IFsnTGluZScsICdBcmVhJywgJ0N1bXVsYXRpdmUgTGluZSddLCAgIC8vIENoYXJ0cyB0aGF0IGRvZXMgbm90IHN1cHBvcnRzIHRoZSBzdHJpbmcgdHlwZSBvZiBkYXRhIGluIHRoZSB4YXhpcyBpbiB0aGUgbnZkMztcbiAgICBkYXRhVHlwZUFycmF5ID0gWydDdW11bGF0aXZlIExpbmUnLCAnQXJlYSddLCAgICAgLy8gQ2hhcnRzIHRoYXQgc3VwcG9ydHMgdGhlIGRhdGEgdG8gYmUgQXJyYXlcbiAgICBTQU1QTEVfREFUQSA9IHtcbiAgICAgICAgJ2dyb3VwMScgOiAnRXVyb3BlJyxcbiAgICAgICAgJ2dyb3VwMicgOiAnQXNpYScsXG4gICAgICAgICdncm91cDMnIDogJ0FtZXJpY2EnLFxuICAgICAgICAnZ3JvdXA0JyA6ICdBdXN0cmFsaWEnXG4gICAgfTtcblxuLy8gcmV0dXJucyB0cnVlIGlmIGNoYXJ0IHR5cGUgaXMgcGllXG5leHBvcnQgY29uc3QgaXNQaWVDaGFydCA9IHR5cGUgPT4gdHlwZSA9PT0gJ1BpZSc7XG5cbi8vIHJldHVybnMgdHJ1ZSBpZiBjaGFydCB0eXBlIGlzIGxpbmVcbmV4cG9ydCBjb25zdCBpc0xpbmVDaGFydCA9IHR5cGUgPT4gdHlwZSA9PT0gJ0xpbmUnO1xuXG4vLyByZXR1cm5zIHRydWUgaWYgY2hhcnQgdHlwZSBpcyBiYXJcbmV4cG9ydCBjb25zdCBpc0JhckNoYXJ0ID0gdHlwZSA9PiB0eXBlID09PSAnQmFyJztcblxuLy8gcmV0dXJucyB0cnVlIGlmIGNoYXJ0IHR5cGUgaXMgZG9udXRcbmV4cG9ydCBjb25zdCBpc0RvbnV0Q2hhcnQgPSB0eXBlID0+IHR5cGUgPT09ICdEb251dCc7XG5cbi8vIHJldHVybnMgdHJ1ZSBpZiBjaGFydCB0eXBlIGlzIGJ1YmJsZVxuZXhwb3J0IGNvbnN0IGlzQnViYmxlQ2hhcnQgPSB0eXBlID0+IHR5cGUgPT09ICdCdWJibGUnO1xuXG4vLyByZXR1cm5zIHRydWUgaWYgY2hhcnQgdHlwZSBpcyBjb2x1bW5cbmV4cG9ydCBjb25zdCBpc0NvbHVtbkNoYXJ0ID0gdHlwZSA9PiB0eXBlID09PSAnQ29sdW1uJztcblxuLy8gcmV0dXJucyB0cnVlIGlmIGNoYXJ0IHR5cGUgaXMgYXJlYVxuZXhwb3J0IGNvbnN0IGlzQXJlYUNoYXJ0ID0gdHlwZSA9PiB0eXBlID09PSAnQXJlYSc7XG5cbi8vIHJldHVybnMgdHJ1ZSBpZiBjaGFydCB0eXBlIGlzIGFyZWFcbmV4cG9ydCBjb25zdCBpc1BpZVR5cGUgPSB0eXBlID0+IGlzUGllQ2hhcnQodHlwZSkgfHwgaXNEb251dENoYXJ0KHR5cGUpO1xuXG4vLyBUaGUgZm9ybWF0IG9mIGNoYXJ0IGRhdGEgaXMgYXJyYXkgb2YganNvbiBvYmplY3RzIGluIGNhc2Ugb2YgdGhlIGZvbGxvd2luZyB0eXBlcyBvZiBjaGFydFxuZXhwb3J0IGNvbnN0IGlzQ2hhcnREYXRhSlNPTiA9IHR5cGUgPT4gXy5pbmNsdWRlcyhkYXRhVHlwZUpTT04sIHR5cGUpIHx8ICFfLmluY2x1ZGVzKGNoYXJ0VHlwZXMsIHR5cGUpO1xuXG4vLyBUaGUgZm9ybWF0IG9mIGNoYXJ0IGRhdGEgaXMgYXJyYXkgb2Ygb2JqZWN0cyBpbiBjYXNlIG9mIHRoZSBmb2xsb3dpbmcgdHlwZXMgb2YgY2hhcnRcbmV4cG9ydCBjb25zdCBpc0NoYXJ0RGF0YUFycmF5ID0gdHlwZSA9PiBfLmluY2x1ZGVzKGRhdGFUeXBlQXJyYXksIHR5cGUpO1xuXG4vLyByZXR1cm5zIHRydWUgaXMgdGhlIGNoYXJ0IHR5cGUgaXMgJ2xpbmUnLCAnYXJlYScgb3IgJ2N1bXVsYXRpdmUgbGluZScgZWxzZSBmYWxzZVxuZXhwb3J0IGNvbnN0IGlzTGluZVR5cGVDaGFydCA9IHR5cGUgPT4gXy5pbmNsdWRlcyhsaW5lVHlwZUNoYXJ0cywgdHlwZSk7XG5cbi8vIFgvWSBEb21haW4gcHJvcGVydGllcyBhcmUgc3VwcG9ydGVkIG9ubHkgZm9yIENvbHVtbiBhbmQgQXJlYSBjaGFydHNcbmV4cG9ydCBjb25zdCBpc0F4aXNEb21haW5TdXBwb3J0ZWQgPSB0eXBlID0+IGlzQ29sdW1uQ2hhcnQodHlwZSkgfHwgaXNBcmVhQ2hhcnQodHlwZSk7XG5cbi8vIFJldHVybnMgYmFyIHNwYWNpbmcgdmFsdWVcbmV4cG9ydCBjb25zdCBnZXRCYXJTcGFjaW5nVmFsdWUgPSAodmFsdWUsIHByb3ApID0+IHtcbiAgICBpZiAocHJvcCA9PT0gJ3ZhbHVlJykge1xuICAgICAgICByZXR1cm4gYmFyU3BhY2luZ01hcFt2YWx1ZV07XG4gICAgfVxuICAgIGlmIChwcm9wID09PSAna2V5Jykge1xuICAgICAgICByZXR1cm4gYmFyU3BhY2luZ01hcEludmVydFt2YWx1ZV07XG4gICAgfVxufTtcblxuLy8gUmV0dXJucyByYWRpdXMgdmFsdWVcbmV4cG9ydCBjb25zdCBnZXRSYWRpdXNWYWx1ZSA9ICh2YWx1ZSwgcHJvcCkgPT4ge1xuICAgIGlmIChwcm9wID09PSAndmFsdWUnKSB7XG4gICAgICAgIHJldHVybiBkb251dFJhdGlvTWFwW3ZhbHVlXTtcbiAgICB9XG4gICAgaWYgKHByb3AgPT09ICdrZXknKSB7XG4gICAgICAgIHJldHVybiBkb251dFJhdGlvTWFwSW52ZXJ0W3ZhbHVlXTtcbiAgICB9XG59O1xuXG4vLyBSZXR1cm5zIGxhYmVscyBjb25maWdcbmV4cG9ydCBjb25zdCBnZXRMYWJlbFZhbHVlcyA9IChzaG93bGFiZWxzLCBzaG93bGFiZWxzb3V0c2lkZSwgcHJvcCkgPT4ge1xuICAgIGNvbnN0IGxhYmVsc0NvbmZpZzogYW55ID0ge307XG4gICAgc3dpdGNoIChzaG93bGFiZWxzKSB7XG4gICAgICAgIGNhc2UgJ2hpZGUnOlxuICAgICAgICAgICAgbGFiZWxzQ29uZmlnLnNob3dsYWJlbHMgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbnNpZGUnOlxuICAgICAgICAgICAgbGFiZWxzQ29uZmlnLnNob3dsYWJlbHMgPSB0cnVlO1xuICAgICAgICAgICAgbGFiZWxzQ29uZmlnLnNob3dsYWJlbHNvdXRzaWRlID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnb3V0c2lkZSc6XG4gICAgICAgICAgICBsYWJlbHNDb25maWcuc2hvd2xhYmVscyA9IHRydWU7XG4gICAgICAgICAgICBsYWJlbHNDb25maWcuc2hvd2xhYmVsc291dHNpZGUgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiBsYWJlbHNDb25maWc7XG59O1xuXG4vLyBDb25zdHJ1Y3QgdGhlIHNhbXBsZSBkYXRhXG5leHBvcnQgY29uc3QgY29uc3RydWN0U2FtcGxlRGF0YSA9IChkYXRhVHlwZSwgeWF4aXNMZW5ndGgsIHNoYXBlKSA9PiB7XG4gICAgbGV0IGZpcnN0X3NlcmllcyA9IFtdLFxuICAgICAgICBzZWNvbmRfc2VyaWVzID0gW10sXG4gICAgICAgIHRoaXJkX3NlcmllcyA9IFtdLFxuICAgICAgICBmaXJzdF9zZXJpZXNfYXJyYXkgPSBbXSxcbiAgICAgICAgc2Vjb25kX3Nlcmllc19hcnJheSA9IFtdLFxuICAgICAgICB0aGlyZF9zZXJpZXNfYXJyYXkgPSBbXSxcbiAgICAgICAgZmlyc3Rfc2VyaWVzX2J1YmJsZSA9IFtdLFxuICAgICAgICBzZWNvbmRfc2VyaWVzX2J1YmJsZSA9IFtdLFxuICAgICAgICB0aGlyZF9zZXJpZXNfYnViYmxlID0gW10sXG4gICAgICAgIGRhdGEgPSBbXTtcbiAgICBzd2l0Y2ggKGRhdGFUeXBlKSB7XG4gICAgICAgIGNhc2UgJ2pzb25Gb3JtYXQnOlxuICAgICAgICAgICAgZmlyc3Rfc2VyaWVzID0gW1xuICAgICAgICAgICAgICAgIHsneCc6ICcwMS8wMS8yMDAxJywgJ3knOiA0MDAwMDAwfSxcbiAgICAgICAgICAgICAgICB7J3gnOiAnMDEvMDEvMjAwMicsICd5JzogMTAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogJzAxLzAxLzIwMDMnLCAneSc6IDUwMDAwMDB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgc2Vjb25kX3NlcmllcyA9IFtcbiAgICAgICAgICAgICAgICB7J3gnOiAnMDEvMDEvMjAwMScsICd5JzogMzAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogJzAxLzAxLzIwMDInLCAneSc6IDQwMDAwMDB9LFxuICAgICAgICAgICAgICAgIHsneCc6ICcwMS8wMS8yMDAzJywgJ3knOiA3MDAwMDAwfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHRoaXJkX3NlcmllcyA9IFtcbiAgICAgICAgICAgICAgICB7J3gnOiAnMDEvMDEvMjAwMScsICd5JzogMjAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogJzAxLzAxLzIwMDInLCAneSc6IDgwMDAwMDB9LFxuICAgICAgICAgICAgICAgIHsneCc6ICcwMS8wMS8yMDAzJywgJ3knOiA2MDAwMDAwfVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGRhdGFbMF0gPSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBmaXJzdF9zZXJpZXMsXG4gICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoeWF4aXNMZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIGRhdGFbMV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogc2Vjb25kX3NlcmllcyxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHlheGlzTGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICBkYXRhWzJdID0ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXJkX3NlcmllcyxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2xpbmVDaGFydEZvcm1hdCc6XG4gICAgICAgICAgICBmaXJzdF9zZXJpZXMgPSBbXG4gICAgICAgICAgICAgICAgeyd4JzogMSwgJ3knOiA0MDAwMDAwfSxcbiAgICAgICAgICAgICAgICB7J3gnOiAyLCAneSc6IDEwMDAwMDB9LFxuICAgICAgICAgICAgICAgIHsneCc6IDMsICd5JzogNTAwMDAwMH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBzZWNvbmRfc2VyaWVzID0gW1xuICAgICAgICAgICAgICAgIHsneCc6IDEsICd5JzogMzAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogMiwgJ3knOiA0MDAwMDAwfSxcbiAgICAgICAgICAgICAgICB7J3gnOiAzLCAneSc6IDcwMDAwMDB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGhpcmRfc2VyaWVzID0gW1xuICAgICAgICAgICAgICAgIHsneCc6IDEsICd5JzogMjAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogMiwgJ3knOiA4MDAwMDAwfSxcbiAgICAgICAgICAgICAgICB7J3gnOiAzLCAneSc6IDYwMDAwMDB9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgZGF0YVswXSA9IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGZpcnN0X3NlcmllcyxcbiAgICAgICAgICAgICAgICBrZXk6IFNBTVBMRV9EQVRBLmdyb3VwMVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh5YXhpc0xlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICAgICAgZGF0YVsxXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiBzZWNvbmRfc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IFNBTVBMRV9EQVRBLmdyb3VwMlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeWF4aXNMZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIGRhdGFbMl0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogdGhpcmRfc2VyaWVzLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IFNBTVBMRV9EQVRBLmdyb3VwM1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYXJyYXlGb3JtYXQnOlxuICAgICAgICAgICAgZmlyc3Rfc2VyaWVzX2FycmF5ID0gW1xuICAgICAgICAgICAgICAgIFsxLCA0MDAwMDAwXSxcbiAgICAgICAgICAgICAgICBbMiwgMTAwMDAwMF0sXG4gICAgICAgICAgICAgICAgWzMsIDUwMDAwMDBdXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgc2Vjb25kX3Nlcmllc19hcnJheSA9IFtcbiAgICAgICAgICAgICAgICBbMSwgMzAwMDAwMF0sXG4gICAgICAgICAgICAgICAgWzIsIDQwMDAwMDBdLFxuICAgICAgICAgICAgICAgIFszLCA3MDAwMDAwXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHRoaXJkX3Nlcmllc19hcnJheSA9IFtcbiAgICAgICAgICAgICAgICBbMSwgMjAwMDAwMF0sXG4gICAgICAgICAgICAgICAgWzIsIDgwMDAwMDBdLFxuICAgICAgICAgICAgICAgIFszLCA2MDAwMDAwXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGRhdGFbMF0gPSB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBmaXJzdF9zZXJpZXNfYXJyYXksXG4gICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoeWF4aXNMZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIGRhdGFbMV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogc2Vjb25kX3Nlcmllc19hcnJheSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHlheGlzTGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgICAgICBkYXRhWzJdID0ge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHRoaXJkX3Nlcmllc19hcnJheSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2J1YmJsZUZvcm1hdCc6XG4gICAgICAgICAgICBzaGFwZSA9IHNoYXBlID09PSAncmFuZG9tJyA/ICBhbGxTaGFwZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYWxsU2hhcGVzLmxlbmd0aCldIDogc2hhcGU7XG4gICAgICAgICAgICBmaXJzdF9zZXJpZXNfYnViYmxlID0gW1xuICAgICAgICAgICAgICAgIHsneCc6IDgwLjY2LCAneSc6IDMzNzM5OTAwLCAgJ3NpemUnOiA3OCwgJ3NoYXBlJzogc2hhcGV9LFxuICAgICAgICAgICAgICAgIHsneCc6IDc5Ljg0LCAneSc6IDgxOTAyMzAwLCAgJ3NpemUnOiA5MCwgJ3NoYXBlJzogc2hhcGV9LFxuICAgICAgICAgICAgICAgIHsneCc6IDc4LjYsICAneSc6IDU1MjMxMDAsICAgJ3NpemUnOiA0NSwgJ3NoYXBlJzogc2hhcGV9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgc2Vjb25kX3Nlcmllc19idWJibGUgPSBbXG4gICAgICAgICAgICAgICAgeyd4JzogNzIuNzMsICd5JzogNzk3MTYyMDAsICAnc2l6ZSc6IDk4LCAnc2hhcGUnOiBzaGFwZX0sXG4gICAgICAgICAgICAgICAgeyd4JzogODAuMDUsICd5JzogNjE4MDE2MDAsICAnc2l6ZSc6IDIwLCAnc2hhcGUnOiBzaGFwZX0sXG4gICAgICAgICAgICAgICAgeyd4JzogNzIuNDksICd5JzogNzMxMzcyMDAsICAnc2l6ZSc6IDM0LCAnc2hhcGUnOiBzaGFwZX1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0aGlyZF9zZXJpZXNfYnViYmxlID0gW1xuICAgICAgICAgICAgICAgIHsneCc6IDY4LjA5LCAneSc6IDMzNzM5OTAwLCAgJ3NpemUnOiA0NSwgJ3NoYXBlJzogc2hhcGV9LFxuICAgICAgICAgICAgICAgIHsneCc6IDgxLjU1LCAneSc6IDc0ODU2MDAsICAgJ3NpemUnOiA3OCwgJ3NoYXBlJzogc2hhcGV9LFxuICAgICAgICAgICAgICAgIHsneCc6IDY4LjYwLCAneSc6IDE0MTg1MDAwMCwgJ3NpemUnOiA1NiwgJ3NoYXBlJzogc2hhcGV9XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgZGF0YVswXSA9IHtcbiAgICAgICAgICAgICAgICB2YWx1ZXM6IGZpcnN0X3Nlcmllc19idWJibGUsXG4gICAgICAgICAgICAgICAga2V5OiBTQU1QTEVfREFUQS5ncm91cDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoeWF4aXNMZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIGRhdGFbMV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogc2Vjb25kX3Nlcmllc19idWJibGUsXG4gICAgICAgICAgICAgICAgICAgIGtleTogU0FNUExFX0RBVEEuZ3JvdXAyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5YXhpc0xlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICAgICAgZGF0YVsyXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzOiB0aGlyZF9zZXJpZXNfYnViYmxlLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IFNBTVBMRV9EQVRBLmdyb3VwM1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGllQ2hhcnRGb3JtYXQnOlxuICAgICAgICAgICAgZGF0YSA9IFtcbiAgICAgICAgICAgICAgICB7J3gnOiBTQU1QTEVfREFUQS5ncm91cDEsICd5JzogMTAwMDAwMH0sXG4gICAgICAgICAgICAgICAgeyd4JzogU0FNUExFX0RBVEEuZ3JvdXAyLCAneSc6IDIwMDAwMDB9LFxuICAgICAgICAgICAgICAgIHsneCc6IFNBTVBMRV9EQVRBLmdyb3VwMywgJ3knOiAzMDAwMDAwfSxcbiAgICAgICAgICAgICAgICB7J3gnOiBTQU1QTEVfREFUQS5ncm91cDQsICd5JzogNDAwMDAwMH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RGF0YVR5cGUgPSB3aWRnZXRDb250ZXh0ID0+IHtcbiAgICBjb25zdCB0eXBlID0gd2lkZ2V0Q29udGV4dC50eXBlO1xuICAgIGlmIChpc0xpbmVDaGFydCh0eXBlKSkge1xuICAgICAgICByZXR1cm4gJ2xpbmVDaGFydEZvcm1hdCc7XG4gICAgfVxuICAgIGlmIChpc1BpZVR5cGUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuICdwaWVDaGFydEZvcm1hdCc7XG4gICAgfVxuICAgIGlmIChpc0J1YmJsZUNoYXJ0KHR5cGUpKSB7XG4gICAgICAgIHJldHVybiAnYnViYmxlRm9ybWF0JztcbiAgICB9XG4gICAgcmV0dXJuIGlzQ2hhcnREYXRhSlNPTih0eXBlKSA/ICdqc29uRm9ybWF0JyA6ICdhcnJheUZvcm1hdCc7XG59O1xuXG4vLyBTYW1wbGUgZGF0YSB0byBwb3B1bGF0ZSB3aGVuIG5vIGRhdGEgaXMgYm91bmRcbmV4cG9ydCBjb25zdCBnZXRTYW1wbGVEYXRhID0gd2lkZ2V0Q29udGV4dCA9PiBjb25zdHJ1Y3RTYW1wbGVEYXRhKGdldERhdGFUeXBlKHdpZGdldENvbnRleHQpLCBfLnNwbGl0KHdpZGdldENvbnRleHQueWF4aXNkYXRha2V5LCAnLCcpLmxlbmd0aCwgd2lkZ2V0Q29udGV4dC5zaGFwZSk7XG5cbi8vIENoZWNrIHdoZXRoZXIgWC9ZIERvbWFpbiB3YXMgc2V0IHRvIE1pbiBhbmQgaXMgc3VwcG9ydGVkIGZvciB0aGUgcHJlc2VudCBjaGFydFxuZXhwb3J0IGNvbnN0IGlzQXhpc0RvbWFpblZhbGlkID0gKHdpZGdldENvbnRleHQsIGF4aXMpID0+IHtcbiAgICBpZiAod2lkZ2V0Q29udGV4dFtheGlzICsgJ2RvbWFpbiddID09PSAnTWluJyAmJiAoaXNBeGlzRG9tYWluU3VwcG9ydGVkKHdpZGdldENvbnRleHQudHlwZSkpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBDaGVjayB3aGV0aGVyIG1pbiBhbmQgbWF4IHZhbHVlcyBhcmUgZmluaXRlIG9yIG5vdFxuZXhwb3J0IGNvbnN0IGFyZU1pbk1heFZhbHVlc1ZhbGlkID0gdmFsdWVzID0+IHtcbiAgICBpZiAoXy5pc0Zpbml0ZSh2YWx1ZXMubWluKSAmJiBfLmlzRmluaXRlKHZhbHVlcy5tYXgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0WVNjYWxlTWluVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgY29uc3QgX21pbiA9IE1hdGguZmxvb3IodmFsdWUpO1xuICAgIC8qIElmIHRoZSBudW1iZXIgaGFzIGEpIGRlY2ltYWwgcGFydCByZXR1cm5pbmcgZmxvb3IgdmFsdWUgLSAwLjFcbiAgICAgYikgbm8gZGVjaW1hbCBwYXJ0IHJldHVybmluZyBmbG9vciB2YWx1ZSAtIDEgKi9cbiAgICByZXR1cm4gTWF0aC5hYnModmFsdWUpIC0gX21pbiA+IDAgPyB2YWx1ZSAtIDAuMSA6IF9taW4gLSAxO1xufTtcblxuLy8gQ2hvb3NlcyB0aGUgZGF0YSBwb2ludHMgb2YgbGluZS9jdW11bGF0aXZlIGxpbmUvYXJlYSBjaGFydCBhbmQgaGlnaGxpZ2h0cyB0aGVtXG5leHBvcnQgY29uc3QgaGlnaGxpZ2h0UG9pbnRzID0gKGlkLCBoaWdobGlnaHRwb2ludHMpID0+IHtcbiAgICBjb25zdCBjaGFydFN2ZyA9IGlkID8gZDMuc2VsZWN0KCcjd21DaGFydCcgKyBpZCArICcgc3ZnJykgOiBkMy5zZWxlY3QoY2hhcnRJZCArICcgc3ZnJyk7XG4gICAgaWYgKGhpZ2hsaWdodHBvaW50cykge1xuICAgICAgICBjaGFydFN2Zy5zZWxlY3RBbGwoJy5udi1wb2ludCcpLnN0eWxlKHsnc3Ryb2tlLXdpZHRoJzogJzZweCcsICdmaWxsLW9wYWNpdHknOiAnLjk1JywgJ3N0cm9rZS1vcGFjaXR5JzogJy45NSd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjaGFydFN2Zy5zZWxlY3RBbGwoJy5udi1wb2ludCcpLnN0eWxlKHsnc3Ryb2tlLXdpZHRoJzogJzBweCcsICdmaWxsLW9wYWNpdHknOiAnMCd9KTtcbiAgICB9XG59O1xuXG4vLyBDaG9vc2VzIHRoZSBsaW5lIG9mIGxpbmUvY3VtdWxhdGl2ZSBsaW5lIGFuZCBpbmNyZWFzZXMgdGhlIHRoaWNrbmVzcyBvZiBpdFxuZXhwb3J0IGNvbnN0IHNldExpbmVUaGlja25lc3MgPSAoaWQsIHRoaWNrbmVzcykgPT4ge1xuICAgIGNvbnN0IGNoYXJ0U3ZnID0gaWQgPyBkMy5zZWxlY3QoJyN3bUNoYXJ0JyArIGlkICsgJyBzdmcnKSA6IGQzLnNlbGVjdChjaGFydElkICsgJyBzdmcnKTtcbiAgICB0aGlja25lc3MgPSB0aGlja25lc3MgfHwgMS41O1xuICAgIGNoYXJ0U3ZnLnNlbGVjdEFsbCgnLm52LWxpbmUnKS5zdHlsZSh7J3N0cm9rZS13aWR0aCc6IHRoaWNrbmVzc30pO1xufTtcblxuLy8gQ29uc3RydWN0aW5nIGEgY29tbW9uIGtleSB2YWx1ZSBtYXAgZm9yIHByZXZpZXcgYW5kIGNhbnZhcyBtb2RlXG5leHBvcnQgY29uc3QgaW5pdFByb3BlcnRpZXMgPSAod2lkZ2V0Q29udGV4dCwgcHJvcGVydHlWYWx1ZU1hcCkgPT4ge1xuICAgIGlmICghcHJvcGVydHlWYWx1ZU1hcCB8fCBpc0VtcHR5T2JqZWN0KHByb3BlcnR5VmFsdWVNYXApKSB7XG4gICAgICAgIHByb3BlcnR5VmFsdWVNYXAgPSB7fTtcbiAgICB9XG4gICAgXy5mb3JFYWNoKGJhc2ljUHJvcGVydGllcywgcHJvcCA9PiB7XG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHByb3BlcnR5VmFsdWVNYXBbcHJvcF0pKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eVZhbHVlTWFwW3Byb3BdID0gd2lkZ2V0Q29udGV4dFtwcm9wXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb3BlcnR5VmFsdWVNYXA7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TnVtYmVyVmFsdWUgPSAodmFsdWUsIGNhbGxiYWNrKSA9PiB7XG4gICAgcmV0dXJuIGlzTmFOKHBhcnNlSW50KHZhbHVlLCAxMCkpID8gY2FsbGJhY2sodmFsdWUsICd2YWx1ZScpIDogdmFsdWU7XG59O1xuXG4vLyBGb3JtYXRzIHRoZSBnaXZlbiB2YWx1ZSBhY2NvcmRpbmcgdG8gZGF0ZSBmb3JtYXRcbmV4cG9ydCBjb25zdCBnZXREYXRlRm9ybWF0ZWREYXRhID0gKGRhdGVGb3JtYXQsIGQpID0+IHtcbiAgICBkYXRlRm9ybWF0ID0gZGF0ZUZvcm1hdCB8fCAnJXgnO1xuICAgIHJldHVybiBkMy50aW1lLmZvcm1hdChkYXRlRm9ybWF0KShuZXcgRGF0ZShkKSk7XG59O1xuXG4vLyBGb3JtYXRzIHRoZSBnaXZlbiB2YWx1ZSBhY2NvcmRpbmcgdG8gbnVtYmVyIGZvcm1hdFxuZXhwb3J0IGNvbnN0IGdldE51bWJlckZvcm1hdGVkRGF0YSA9IChudW1iZXJGb3JtYXQsIGQpID0+IHtcbiAgICBsZXQgZm9ybWF0dGVkRGF0YSxcbiAgICAgICAgZGl2aWRlcixcbiAgICAgICAgcHJlZml4O1xuICAgIGZvcm1hdHRlZERhdGEgPSBkMy5mb3JtYXQobnVtYmVyRm9ybWF0KShkKTtcbiAgICAvLyBmb3JtYXR0aW5nIHRoZSBkYXRhIGJhc2VkIG9uIG51bWJlciBmb3JtYXQgc2VsZWN0ZWRcbiAgICBpZiAobnVtYmVyRm9ybWF0KSB7XG4gICAgICAgIC8vIEdldHRpbmcgdGhlIHJlc3BlY3RpdmUgZGl2aWRlclsxMDAwLDEwMDAwMDAsMTAwMDAwMDAwMF0gYmFzZWQgb24gdGhlIG51bWJlciBmb3JtYXQgY2hvb3NlblxuICAgICAgICBkaXZpZGVyID0gKHRpY2tmb3JtYXRzW251bWJlckZvcm1hdF0gJiYgdGlja2Zvcm1hdHNbbnVtYmVyRm9ybWF0XS5kaXZpZGVyKSB8fCAwO1xuICAgICAgICBwcmVmaXggPSB0aWNrZm9ybWF0c1tudW1iZXJGb3JtYXRdICYmIHRpY2tmb3JtYXRzW251bWJlckZvcm1hdF0ucHJlZml4O1xuICAgICAgICBpZiAocHJlZml4ICYmIGRpdmlkZXIgIT09IDApIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZERhdGEgPSBkMy5mb3JtYXQoJy4yZicpKGQgLyBkaXZpZGVyKSArIHByZWZpeDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEF1dG8gZm9ybWF0dGluZyB0aGUgZGF0YSB3aGVuIG5vIGZvcm1hdGluZyBvcHRpb24gaXMgY2hvc2VuXG4gICAgICAgIGZvcm1hdHRlZERhdGEgPSBkID49IDEwMDAgPyBkMy5mb3JtYXQoJy4xcycpKGQpIDogZDtcbiAgICB9XG4gICAgcmV0dXJuIGZvcm1hdHRlZERhdGE7XG59O1xuXG4vLyBTZXQgdGhlIHZpc2liaWxpdHkgcHJvcGVydHkgb2YgdGhlIGNoYXJ0IHgseSBheGlzIGR1ZSB0byBhIGJ1ZyBpbiB0aGUgbnZkM1xuZXhwb3J0IGNvbnN0IHRvZ2dsZUF4aXNTaG93ID0gKHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuICAgIGNvbnN0ICR4QXhpcyA9IGQzLnNlbGVjdChjaGFydElkICsgJyBnLm52LWF4aXMubnYteCcpLFxuICAgICAgICAkeUF4aXMgPSBkMy5zZWxlY3QoY2hhcnRJZCArICcgZy5udi1heGlzLm52LXknKTtcbiAgICBpZiAocHJvcGVydHkgPT09ICdzaG93eGF4aXMnKSB7XG4gICAgICAgICR4QXhpcy5zdHlsZSgndmlzaWJpbGl0eScsIHZhbHVlID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICR5QXhpcy5zdHlsZSgndmlzaWJpbGl0eScsIHZhbHVlID8gJ3Zpc2libGUnIDogJ2hpZGRlbicpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBtb2RpZnlMZWdlbmRQb3NpdGlvbiA9ICh3aWRnZXRDb250ZXh0LCBwb3NpdGlvbiwgaWQpID0+IHtcbiAgICBjb25zdCBzaG93TGVnZW5kID0gaXNTaG93TGVnZW5kKHdpZGdldENvbnRleHQuc2hvd2xlZ2VuZCksXG4gICAgICAgIGNoYXJ0X0lkID0gaWQgPyAnI3dtQ2hhcnQnICsgaWQgOiBjaGFydElkLFxuICAgICAgICBsZWdlbmRXcmFwID0gZDMuc2VsZWN0KGNoYXJ0X0lkICsgJyAubnYtbGVnZW5kV3JhcCcpLFxuICAgICAgICBsZWdlbmRQYWRkaW5nID0gNTtcbiAgICAvLyBSZXR1cm4gd2hlbiBzaG93bGVnZW5kIGlzIGZhbHNlXG4gICAgaWYgKCFzaG93TGVnZW5kIHx8ICFsZWdlbmRXcmFwWzBdWzBdKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uID09PSAnYm90dG9tJykge1xuICAgICAgICBjb25zdCBsZWdlbmRXcmFwSGVpZ2h0ID0gbGVnZW5kV3JhcFswXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQsXG4gICAgICAgICAgICB3cmFwID0gZDMuc2VsZWN0KGNoYXJ0X0lkICsgJyAubnYtd3JhcCcpLFxuICAgICAgICAgICAgd3JhcFRyYW5zZm9ybSA9ICh3cmFwICYmIHdyYXAuYXR0cigndHJhbnNmb3JtJykpID8gd3JhcC5hdHRyKCd0cmFuc2Zvcm0nKS5yZXBsYWNlKC8sIC9nLCAnLCcpIDogJycsXG4gICAgICAgICAgICBjb29yZGluYXRlcyA9IC90cmFuc2xhdGVcXChcXHMqKFteXFxzLCldKylbICxdKFteXFxzLCldKykvLmV4ZWMod3JhcFRyYW5zZm9ybSksXG4gICAgICAgICAgICBnZXRDaGFydEhlaWdodCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2hhcnRIZWlnaHQgPSAkKGNoYXJ0X0lkICsgJyBzdmc+Lm52ZDMubnYtd3JhcCcpWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAoY2hhcnRIZWlnaHQgPT09IDApIHsgLy8gZml4IGZvciBJRVxuICAgICAgICAgICAgICAgICAgICBjaGFydEhlaWdodCA9ICgkKGNoYXJ0X0lkICsgJyBzdmcnKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQgLSAobGVnZW5kV3JhcEhlaWdodCArIDE1KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFydEhlaWdodDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIGxlZ2VuZFdyYXAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwICwgJyArIChnZXRDaGFydEhlaWdodCgpIC0gbGVnZW5kV3JhcEhlaWdodCAtIGxlZ2VuZFBhZGRpbmcpICsgJyknKTtcbiAgICAgICAgaWYgKGNvb3JkaW5hdGVzKSB7XG4gICAgICAgICAgICB3cmFwLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvb3JkaW5hdGVzWzFdICsgJywnICsgbGVnZW5kUGFkZGluZyArICcpJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vLyBSZXR1cm5zIHZhbHVlIGlmIGxlZ2VuZCBuZWVkIHRvIHNob3duIG9yIG5vdFxuZXhwb3J0IGNvbnN0IGlzU2hvd0xlZ2VuZCA9IHZhbHVlID0+IHtcbiAgICAvLyBPbGQgcHJvamVjdHMgd2lsbCBoYXZlIGVpdGhlciB0cnVlIG9yIGZhbHNlXG4gICAgaWYgKHZhbHVlID09PSAnZmFsc2UnIHx8IHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBOZXcgcHJvamVjdHMgd2lsbCBoYXZlIGVpdGhlciAnSGlkZSBMZWdlbmQnLCAnU2hvdyBUb3AnLCAnU2hvdyBCb3R0b20nXG4gICAgcmV0dXJuIHZhbHVlID09PSAnaGlkZScgPyBmYWxzZSA6IHRydWU7XG59O1xuXG4vKipcbiAqIEN1c3RvbWlzZSB0aGUgdG9vbHRpcCBmb3IgZG9udXQgJiBwaWUgY2hhcnRzIGFuZCBhbHNvIGZvciBjaGFydHMgaGF2aW5nIG9ubHkgb25lIHZhbHVlIGF0dGFjaGVkIHRvIHlheGlzXG4gKiBAcGFyYW0ga2V5XG4gKiBAcGFyYW0gbGFiZWxcbiAqL1xuZXhwb3J0IGNvbnN0IGN1c3RvbWlzZVRvb2x0aXAgPSAoY2hhcnQsIHByb3BlcnR5VmFsdWVNYXAsIHdpZGdldENvbnRleHQsIGxhYmVsPykgPT4ge1xuICAgIGNoYXJ0LnRvb2x0aXAuY29udGVudEdlbmVyYXRvcihrZXkgPT4ge1xuICAgICAgICBsZXQgeFZhbHVlID0ga2V5LmRhdGEueCwgeVZhbHVlO1xuICAgICAgICB5VmFsdWUgPSBnZXROdW1iZXJGb3JtYXRlZERhdGEocHJvcGVydHlWYWx1ZU1hcC55bnVtYmVyZm9ybWF0LCBrZXkuZGF0YS55KTtcbiAgICAgICAgaWYgKGlzUGllVHlwZSh3aWRnZXRDb250ZXh0LnR5cGUpKSB7XG4gICAgICAgICAgICBsYWJlbCA9IGtleS5kYXRhLng7XG4gICAgICAgICAgICB4VmFsdWUgPSAnJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJzx0YWJsZT4nICtcbiAgICAgICAgICAgICc8dGJvZHk+JyArXG4gICAgICAgICAgICAnPHRyIGNsYXNzPVwidmFsdWVcIj48Yj4nICsgeFZhbHVlICtcbiAgICAgICAgICAgICc8L2I+PC90cj4nICtcbiAgICAgICAgICAgICc8dHI+JyArXG4gICAgICAgICAgICAnPHRkIGNsYXNzPVwibGVnZW5kLWNvbG9yLWd1aWRlXCI+PGRpdiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6JyArIGtleS5jb2xvciArICc7XCI+PC9kaXY+PC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgY2xhc3M9XCJrZXlcIj4nICsgbGFiZWwgKyAnPC90ZD4nICtcbiAgICAgICAgICAgICc8dGQgY2xhc3M9XCJ2YWx1ZVwiPicgKyB5VmFsdWUgKyAnPC90ZD4nICtcbiAgICAgICAgICAgICc8L3RyPicgK1xuICAgICAgICAgICAgJzwvdGJvZHk+JyArXG4gICAgICAgICAgICAnPC90YWJsZT4nO1xuICAgIH0pO1xufTtcblxuLy8gaW50aWFsaXplcyB0aGUgY2hhcnQgb2JlamN0XG5leHBvcnQgY29uc3QgaW5pdENoYXJ0ID0gKHdpZGdldENvbnRleHQsIHhEb21haW5WYWx1ZXMsIHlEb21haW5WYWx1ZXMsIHByb3BlcnR5VmFsdWVNYXAsIGlzUHJldmlldykgPT4ge1xuICAgIHByb3BlcnR5VmFsdWVNYXAgPSAgaW5pdFByb3BlcnRpZXMod2lkZ2V0Q29udGV4dCwgcHJvcGVydHlWYWx1ZU1hcCk7XG4gICAgbGV0IGNoYXJ0LCBjb2xvcnMgPSBbXSwgeGF4aXNsYWJlbCwgeWF4aXNsYWJlbCwgbGFiZWxDb25maWcsIHJhZGl1cywgYmFyU3BhY2luZyxcbiAgICAgICAgc2hvd0xlZ2VuZCwgeEF4aXNWYWx1ZSwgaGFzTXVsdGlwbGVZVmFsdWVzO1xuICAgIGNvbnN0IHhWYWx1ZTogYW55ID0ge30sIHlWYWx1ZTogYW55ID0ge307XG4gICAgc3dpdGNoICh3aWRnZXRDb250ZXh0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnQ29sdW1uJzpcbiAgICAgICAgICAgIGJhclNwYWNpbmcgPSBnZXROdW1iZXJWYWx1ZShwcm9wZXJ0eVZhbHVlTWFwLmJhcnNwYWNpbmcsIGdldEJhclNwYWNpbmdWYWx1ZSkgfHwgYmFyU3BhY2luZ01hcC5tZWRpdW07XG4gICAgICAgICAgICBjaGFydCA9IG52Lm1vZGVscy5tdWx0aUJhckNoYXJ0KClcbiAgICAgICAgICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgICAgICAgICAueShkID0+IGQueSlcbiAgICAgICAgICAgICAgICAucmVkdWNlWFRpY2tzKHByb3BlcnR5VmFsdWVNYXAucmVkdWNleHRpY2tzKVxuICAgICAgICAgICAgICAgIC5yb3RhdGVMYWJlbHMoMClcbiAgICAgICAgICAgICAgICAuc2hvd0NvbnRyb2xzKGZhbHNlKVxuICAgICAgICAgICAgICAgIC5zdGFja2VkKHByb3BlcnR5VmFsdWVNYXAudmlld3R5cGUgPT09ICdTdGFja2VkJyA/ICB0cnVlIDogZmFsc2UpXG4gICAgICAgICAgICAgICAgLmdyb3VwU3BhY2luZyhiYXJTcGFjaW5nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdDdW11bGF0aXZlIExpbmUnOlxuICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMuY3VtdWxhdGl2ZUxpbmVDaGFydCgpXG4gICAgICAgICAgICAgICAgLngoZCA9PiBkWzBdKVxuICAgICAgICAgICAgICAgIC55KGQgPT4gZFsxXSlcbiAgICAgICAgICAgICAgICAuc2hvd0NvbnRyb2xzKGZhbHNlKVxuICAgICAgICAgICAgICAgIC51c2VJbnRlcmFjdGl2ZUd1aWRlbGluZShwcm9wZXJ0eVZhbHVlTWFwLnRvb2x0aXBzKVxuICAgICAgICAgICAgICAgIC5pbnRlcnBvbGF0ZShwcm9wZXJ0eVZhbHVlTWFwLmludGVycG9sYXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0xpbmUnOlxuICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMubGluZUNoYXJ0KClcbiAgICAgICAgICAgICAgICAudXNlSW50ZXJhY3RpdmVHdWlkZWxpbmUocHJvcGVydHlWYWx1ZU1hcC50b29sdGlwcylcbiAgICAgICAgICAgICAgICAuaW50ZXJwb2xhdGUocHJvcGVydHlWYWx1ZU1hcC5pbnRlcnBvbGF0aW9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdBcmVhJzpcbiAgICAgICAgICAgIGNoYXJ0ID0gbnYubW9kZWxzLnN0YWNrZWRBcmVhQ2hhcnQoKVxuICAgICAgICAgICAgICAgIC54KGQgPT4gZFswXSlcbiAgICAgICAgICAgICAgICAueShkID0+IGRbMV0pXG4gICAgICAgICAgICAgICAgLmNsaXBFZGdlKHRydWUpXG4gICAgICAgICAgICAgICAgLnNob3dDb250cm9scyhmYWxzZSlcbiAgICAgICAgICAgICAgICAuc3R5bGUocHJvcGVydHlWYWx1ZU1hcC5hcmVhdmlld3R5cGUpXG4gICAgICAgICAgICAgICAgLnVzZUludGVyYWN0aXZlR3VpZGVsaW5lKHByb3BlcnR5VmFsdWVNYXAudG9vbHRpcHMpXG4gICAgICAgICAgICAgICAgLmludGVycG9sYXRlKHByb3BlcnR5VmFsdWVNYXAuaW50ZXJwb2xhdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQmFyJzpcbiAgICAgICAgICAgIGJhclNwYWNpbmcgPSBnZXROdW1iZXJWYWx1ZShwcm9wZXJ0eVZhbHVlTWFwLmJhcnNwYWNpbmcsIGdldEJhclNwYWNpbmdWYWx1ZSkgfHwgYmFyU3BhY2luZ01hcC5tZWRpdW07XG4gICAgICAgICAgICBjaGFydCA9IG52Lm1vZGVscy5tdWx0aUJhckhvcml6b250YWxDaGFydCgpXG4gICAgICAgICAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgICAgICAgICAgLnkoZCA9PiBkLnkpXG4gICAgICAgICAgICAgICAgLnNob3dDb250cm9scyhmYWxzZSlcbiAgICAgICAgICAgICAgICAuc3RhY2tlZChwcm9wZXJ0eVZhbHVlTWFwLnZpZXd0eXBlID09PSAnU3RhY2tlZCcgPyAgdHJ1ZSA6IGZhbHNlKVxuICAgICAgICAgICAgICAgIC5zaG93VmFsdWVzKHByb3BlcnR5VmFsdWVNYXAuc2hvd3ZhbHVlcylcbiAgICAgICAgICAgICAgICAuZ3JvdXBTcGFjaW5nKGJhclNwYWNpbmcpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1BpZSc6XG4gICAgICAgIGNhc2UgJ0RvbnV0JzpcbiAgICAgICAgICAgIGxhYmVsQ29uZmlnID0gZ2V0TGFiZWxWYWx1ZXMocHJvcGVydHlWYWx1ZU1hcC5zaG93bGFiZWxzLCBwcm9wZXJ0eVZhbHVlTWFwLnNob3dsYWJlbHNvdXRzaWRlLCAndmFsdWUnKTtcbiAgICAgICAgICAgIHJhZGl1cyA9IGdldE51bWJlclZhbHVlKHByb3BlcnR5VmFsdWVNYXAuZG9udXRyYXRpbywgZ2V0UmFkaXVzVmFsdWUpIHx8IGRvbnV0UmF0aW9NYXAubWVkaXVtO1xuICAgICAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMucGllQ2hhcnQoKVxuICAgICAgICAgICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAgICAgICAgIC55KGQgPT4gZC55KVxuICAgICAgICAgICAgICAgIC5zaG93TGFiZWxzKGxhYmVsQ29uZmlnLnNob3dsYWJlbHMpXG4gICAgICAgICAgICAgICAgLmxhYmVsVHlwZShwcm9wZXJ0eVZhbHVlTWFwLmxhYmVsdHlwZSlcbiAgICAgICAgICAgICAgICAudmFsdWVGb3JtYXQoZDMuZm9ybWF0KCclJykpXG4gICAgICAgICAgICAgICAgLnRpdGxlKHByb3BlcnR5VmFsdWVNYXAuY2VudGVybGFiZWwpXG4gICAgICAgICAgICAgICAgLmxhYmVsVGhyZXNob2xkKHByb3BlcnR5VmFsdWVNYXAubGFiZWx0aHJlc2hvbGQgfHwgMC4wMSlcbiAgICAgICAgICAgICAgICAubGFiZWxzT3V0c2lkZShsYWJlbENvbmZpZy5zaG93bGFiZWxzb3V0c2lkZSk7XG4gICAgICAgICAgICBpZiAoaXNEb251dENoYXJ0KHdpZGdldENvbnRleHQudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjaGFydC5kb251dCh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAuZG9udXRSYXRpbyhyYWRpdXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb3BlcnR5VmFsdWVNYXAubGFiZWx0eXBlID09PSAna2V5LXZhbHVlJykge1xuICAgICAgICAgICAgICAgIGNoYXJ0LmxhYmVsVHlwZShkID0+IGQuZGF0YS54ICsgJyAnICsgZC5kYXRhLnkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0J1YmJsZSc6XG4gICAgICAgICAgICBjaGFydCA9IG52Lm1vZGVscy5zY2F0dGVyQ2hhcnQoKVxuICAgICAgICAgICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAgICAgICAgIC55KGQgPT4gZC55KVxuICAgICAgICAgICAgICAgIC5zaG93RGlzdFgocHJvcGVydHlWYWx1ZU1hcC5zaG93eGRpc3RhbmNlKVxuICAgICAgICAgICAgICAgIC5zaG93RGlzdFkocHJvcGVydHlWYWx1ZU1hcC5zaG93eWRpc3RhbmNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmICh4RG9tYWluVmFsdWVzKSB7XG4gICAgICAgIHhWYWx1ZS5taW4gPSB4RG9tYWluVmFsdWVzLm1pbi54IHx8IHhEb21haW5WYWx1ZXMubWluWzBdO1xuICAgICAgICB4VmFsdWUubWF4ID0geERvbWFpblZhbHVlcy5tYXgueCB8fCB4RG9tYWluVmFsdWVzLm1heFswXTtcbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlcyBvbiB0aGUgeCBheGlzIGFyZSBzdHJpbmcgdGhlbiBtaW4gbWF4IHZhbHVlcyBnaXZlcyBJbmZpbml0eVxuICAgICAgICBpZiAoYXJlTWluTWF4VmFsdWVzVmFsaWQoeFZhbHVlKSkge1xuICAgICAgICAgICAgLy8gUmVkdWNpbmcgdGhlIG1pbiB2YWx1ZSB0byAwLjEgc28gdGhlIG1pbiB2YWx1ZSBpcyBub3QgbWlzc2VkIG91dFxuICAgICAgICAgICAgeFZhbHVlLm1pbiA9IGdldFlTY2FsZU1pblZhbHVlKHhWYWx1ZS5taW4pO1xuICAgICAgICAgICAgY2hhcnQueERvbWFpbihbeFZhbHVlLm1pbiwgeFZhbHVlLm1heF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHlEb21haW5WYWx1ZXMpIHtcbiAgICAgICAgLy8gUmVkdWNpbmcgdGhlIG1pbiB2YWx1ZSB0byAxIHNvIHRoZSBtaW4gdmFsdWUgaXMgbm90IG1pc3NlZCBvdXRcbiAgICAgICAgeVZhbHVlLm1pbiA9IHlEb21haW5WYWx1ZXMubWluLnkgfHwgeURvbWFpblZhbHVlcy5taW5bMV07XG4gICAgICAgIHlWYWx1ZS5tYXggPSB5RG9tYWluVmFsdWVzLm1heC55IHx8IHlEb21haW5WYWx1ZXMubWF4WzFdO1xuICAgICAgICAvLyBJZiB0aGUgdmFsdWVzIG9uIHRoZSB5IGF4aXMgYXJlIHN0cmluZyBvciBpbnZhbGlkIHRoZW4gbWluIG1heCB2YWx1ZXMgZ2l2ZXMgSW5maW5pdHlcbiAgICAgICAgaWYgKGFyZU1pbk1heFZhbHVlc1ZhbGlkKHlWYWx1ZSkpIHtcbiAgICAgICAgICAgIC8vIFJlZHVjaW5nIHRoZSBtaW4gdmFsdWUgdG8gMSBzbyB0aGUgbWluIHZhbHVlIGlzIG5vdCBtaXNzZWQgb3V0XG4gICAgICAgICAgICB5VmFsdWUubWluID0gZ2V0WVNjYWxlTWluVmFsdWUoeVZhbHVlLm1pbik7XG4gICAgICAgICAgICBjaGFydC55RG9tYWluKFt5VmFsdWUubWluLCB5VmFsdWUubWF4XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXR0aW5nIHRoZSBsZWdlbmQgdHlwZSBjaG9vc2VuIGJ5IHVzZXIgb3IgZGVmYXVsdCBpdCB3aWxsIGJlIGZ1cmlvdXNcbiAgICBjaGFydC5sZWdlbmQudmVycygocHJvcGVydHlWYWx1ZU1hcC5sZWdlbmR0eXBlICYmIHByb3BlcnR5VmFsdWVNYXAubGVnZW5kdHlwZS50b0xvd2VyQ2FzZSgpKSB8fCAnZnVyaW91cycpO1xuXG4gICAgaWYgKCFfLmluY2x1ZGVzKGNoYXJ0VHlwZXMsIHdpZGdldENvbnRleHQudHlwZSkpIHtcbiAgICAgICAgY2hhcnQgPSBudi5tb2RlbHMubXVsdGlCYXJDaGFydCgpXG4gICAgICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgICAgIC55KGQgPT4gZC55KTtcbiAgICB9XG5cblxuICAgIGlmIChpc1BpZVR5cGUod2lkZ2V0Q29udGV4dC50eXBlKSkge1xuICAgICAgICAvLyBJbiBjYXNlIG9mIHBpZS9kb251dCBjaGFydCBmb3JtYXR0aW5nIHRoZSB2YWx1ZXMgb2YgaXRcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWVNYXAubGFiZWx0eXBlID09PSAncGVyY2VudCcpIHtcbiAgICAgICAgICAgIGNoYXJ0LnZhbHVlRm9ybWF0KGQzLmZvcm1hdCgnJScpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoYXJ0LnZhbHVlRm9ybWF0KGQgPT4gZ2V0TnVtYmVyRm9ybWF0ZWREYXRhKHByb3BlcnR5VmFsdWVNYXAueW51bWJlcmZvcm1hdCwgZCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEN1c3RvbWl6aW5nIHRoZSB0b29sdGlwcyBpbiBjYXNlIG9mIHRoZSBwaWUgYW5kIGRvbnV0IHdoZW4gbGFiZWxUeXBlIGlzIHZhbHVlXG4gICAgICAgIGN1c3RvbWlzZVRvb2x0aXAoY2hhcnQsIHByb3BlcnR5VmFsdWVNYXAsIHdpZGdldENvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYXJ0LnNob3dYQXhpcyhwcm9wZXJ0eVZhbHVlTWFwLnNob3d4YXhpcylcbiAgICAgICAgICAgIC5zaG93WUF4aXMocHJvcGVydHlWYWx1ZU1hcC5zaG93eWF4aXMpO1xuXG4gICAgICAgIC8vIFNldHRpbmcgdGhlIGxhYmVscyBpZiB0aGV5IGFyZSBzcGVjaWZpZWQgZXhwbGljaXRseSBvciB0YWtpbmcgdGhlIGF4aXNrZXlzIGNob3NlblxuICAgICAgICB4YXhpc2xhYmVsID0gcHJvcGVydHlWYWx1ZU1hcC54YXhpc2xhYmVsIHx8IHByZXR0aWZ5TGFiZWxzKHdpZGdldENvbnRleHQueGF4aXNkYXRha2V5KSB8fCAneCBjYXB0aW9uJztcbiAgICAgICAgeWF4aXNsYWJlbCA9IHByb3BlcnR5VmFsdWVNYXAueWF4aXNsYWJlbCB8fCBwcmV0dGlmeUxhYmVscyh3aWRnZXRDb250ZXh0LnlheGlzZGF0YWtleSkgfHwgJ3kgY2FwdGlvbic7XG5cbiAgICAgICAgLy8gQ2hlY2tpbmcgaWYgeSBheGlzIGhhcyBtdWx0aXBsZSB2YWx1ZXNcbiAgICAgICAgaWYgKHdpZGdldENvbnRleHQueWF4aXNkYXRha2V5ICYmIHdpZGdldENvbnRleHQueWF4aXNkYXRha2V5LnNwbGl0KCcsJykubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgaGFzTXVsdGlwbGVZVmFsdWVzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDdXN0b21pemluZyB0aGUgdG9vbHRpcCB0byBzaG93IHlheGlzbGFiZWwsIG9ubHkgaWYgdGhlIHkgYXhpcyBjb250YWlucyBvbmUgdmFsdWVcbiAgICAgICAgaWYgKCFoYXNNdWx0aXBsZVlWYWx1ZXMgJiYgIWlzQnViYmxlQ2hhcnQod2lkZ2V0Q29udGV4dC50eXBlKSkge1xuICAgICAgICAgICAgY3VzdG9taXNlVG9vbHRpcChjaGFydCwgcHJvcGVydHlWYWx1ZU1hcCwgd2lkZ2V0Q29udGV4dCwgeWF4aXNsYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGRpbmcgdGhlIHVuaXRzIHRvIHRoZSBjYXB0aW9ucyBpZiB0aGV5IGFyZSBzcGVjaWZpZWRcbiAgICAgICAgeGF4aXNsYWJlbCArPSBwcm9wZXJ0eVZhbHVlTWFwLnh1bml0cyA/ICcoJyArIHByb3BlcnR5VmFsdWVNYXAueHVuaXRzICsgJyknIDogJyc7XG4gICAgICAgIHlheGlzbGFiZWwgKz0gcHJvcGVydHlWYWx1ZU1hcC55dW5pdHMgPyAnKCcgKyBwcm9wZXJ0eVZhbHVlTWFwLnl1bml0cyArICcpJyA6ICcnO1xuXG4gICAgICAgIGNoYXJ0LnhBeGlzXG4gICAgICAgICAgICAuYXhpc0xhYmVsKHhheGlzbGFiZWwpXG4gICAgICAgICAgICAuYXhpc0xhYmVsRGlzdGFuY2UocHJvcGVydHlWYWx1ZU1hcC54YXhpc2xhYmVsZGlzdGFuY2UpXG4gICAgICAgICAgICAuc3RhZ2dlckxhYmVscyhwcm9wZXJ0eVZhbHVlTWFwLnN0YWdnZXJsYWJlbHMpO1xuXG4gICAgICAgIC8vIElmIGRhdGUgZm9ybWF0IHNldCBmb3JtYXQgYmFzZWQgZGF0ZSBmb3JtYXRcbiAgICAgICAgaWYgKHByb3BlcnR5VmFsdWVNYXAueGRhdGVmb3JtYXQgfHwgKGlzUHJldmlldyAmJiAhaXNCdWJibGVDaGFydCh3aWRnZXRDb250ZXh0LnR5cGUpKSkge1xuICAgICAgICAgICAgaWYgKGlzTGluZVR5cGVDaGFydCh3aWRnZXRDb250ZXh0LnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY2hhcnQueEF4aXMudGlja0Zvcm1hdChkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBhY3R1YWwgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgeEF4aXNWYWx1ZSA9IGlzUHJldmlldyA/IGRhdGVMaXN0W2QgLSAxXSA6IHdpZGdldENvbnRleHQueERhdGFLZXlBcnJbZF07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXREYXRlRm9ybWF0ZWREYXRhKHByb3BlcnR5VmFsdWVNYXAueGRhdGVmb3JtYXQsIHhBeGlzVmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGFydC54QXhpcy50aWNrRm9ybWF0KGQgPT4gZ2V0RGF0ZUZvcm1hdGVkRGF0YShwcm9wZXJ0eVZhbHVlTWFwLnhkYXRlZm9ybWF0LCBkKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHlWYWx1ZU1hcC54bnVtYmVyZm9ybWF0KSB7XG4gICAgICAgICAgICBjaGFydC54QXhpcy50aWNrRm9ybWF0KGQgPT4gZ2V0TnVtYmVyRm9ybWF0ZWREYXRhKHByb3BlcnR5VmFsdWVNYXAueG51bWJlcmZvcm1hdCwgZCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzTGluZVR5cGVDaGFydCh3aWRnZXRDb250ZXh0LnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBhY3R1YWwgdmFsdWVcbiAgICAgICAgICAgICAgICBjaGFydC54QXhpcy50aWNrRm9ybWF0KGQgPT4gd2lkZ2V0Q29udGV4dC54RGF0YUtleUFycltkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hhcnQueUF4aXNcbiAgICAgICAgICAgIC5heGlzTGFiZWwoeWF4aXNsYWJlbClcbiAgICAgICAgICAgIC5heGlzTGFiZWxEaXN0YW5jZShwcm9wZXJ0eVZhbHVlTWFwLnlheGlzbGFiZWxkaXN0YW5jZSlcbiAgICAgICAgICAgIC5zdGFnZ2VyTGFiZWxzKHByb3BlcnR5VmFsdWVNYXAuc3RhZ2dlcmxhYmVscylcbiAgICAgICAgICAgIC50aWNrRm9ybWF0KGQgPT4gZ2V0TnVtYmVyRm9ybWF0ZWREYXRhKHByb3BlcnR5VmFsdWVNYXAueW51bWJlcmZvcm1hdCwgZCkpO1xuICAgICAgICBpZiAoaXNCYXJDaGFydCh3aWRnZXRDb250ZXh0LnR5cGUpKSB7XG4gICAgICAgICAgICBjaGFydC52YWx1ZUZvcm1hdChkID0+IGdldE51bWJlckZvcm1hdGVkRGF0YShwcm9wZXJ0eVZhbHVlTWFwLnludW1iZXJmb3JtYXQsIGQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN1cHBvcnQgZm9yIGN1c3RvbSBjb2xvcnMgaWYgdXNlciBnaXZlcyBkaXJlY3Qgc3RyaW5nIG9mIGNvbG9ycyBpbiB0ZXh0IGJveFxuICAgIGlmIChfLmlzU3RyaW5nKHByb3BlcnR5VmFsdWVNYXAuY3VzdG9tY29sb3JzKSAmJiBwcm9wZXJ0eVZhbHVlTWFwLmN1c3RvbWNvbG9ycykge1xuICAgICAgICBjb2xvcnMgPSBfLnNwbGl0KHByb3BlcnR5VmFsdWVNYXAuY3VzdG9tY29sb3JzLCAnLCcpO1xuICAgIH1cbiAgICBpZiAoXy5pc0FycmF5KHByb3BlcnR5VmFsdWVNYXAuY3VzdG9tY29sb3JzKSkge1xuICAgICAgICBjb2xvcnMgPSBwcm9wZXJ0eVZhbHVlTWFwLmN1c3RvbWNvbG9ycztcbiAgICB9XG5cbiAgICBzaG93TGVnZW5kID0gaXNTaG93TGVnZW5kKHByb3BlcnR5VmFsdWVNYXAuc2hvd2xlZ2VuZCk7XG4gICAgY2hhcnQuc2hvd0xlZ2VuZChzaG93TGVnZW5kKVxuICAgICAgICAubWFyZ2luKHt0b3A6IHByb3BlcnR5VmFsdWVNYXAub2Zmc2V0dG9wLCByaWdodDogcHJvcGVydHlWYWx1ZU1hcC5vZmZzZXRyaWdodCwgYm90dG9tOiBwcm9wZXJ0eVZhbHVlTWFwLm9mZnNldGJvdHRvbSwgbGVmdDogcHJvcGVydHlWYWx1ZU1hcC5vZmZzZXRsZWZ0fSlcbiAgICAgICAgLmNvbG9yKGNvbG9ycy5sZW5ndGggPyBjb2xvcnMgOiB0aGVtZXNbcHJvcGVydHlWYWx1ZU1hcC50aGVtZV0uY29sb3JzKTtcblxuICAgIGNoYXJ0LnRvb2x0aXAuZW5hYmxlZChwcm9wZXJ0eVZhbHVlTWFwLnRvb2x0aXBzKTtcbiAgICB3aWRnZXRDb250ZXh0Lm1lc3NhZ2UgPSBwcm9wZXJ0eVZhbHVlTWFwLm5vZGF0YW1lc3NhZ2UgfHwgJ05vIGRhdGEgZm91bmQnO1xuICAgIC8vIHNldHRpbmcgdGhlIG5vIGRhdGEgbWVzc2FnZVxuICAgIGNoYXJ0Lm5vRGF0YSh3aWRnZXRDb250ZXh0Lm1lc3NhZ2UpO1xuXG4gICAgaWYgKGlzTGluZVR5cGVDaGFydCh3aWRnZXRDb250ZXh0LnR5cGUpICYmIHdpZGdldENvbnRleHQuaGlnaGxpZ2h0cG9pbnRzKSB7XG4gICAgICAgIGNoYXJ0LmRpc3BhdGNoLm9uKCdzdGF0ZUNoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gcG9zdFBsb3RDaGFydFByb2Nlc3Mod2lkZ2V0Q29udGV4dCksIDEwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjaGFydDtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3N0UGxvdENoYXJ0UHJvY2VzcyA9ICh3aWRnZXRDb250ZXh0LCBpc1ByZXZpZXc/KSA9PiB7XG4gICAgY29uc3QgaWQgPSBpc1ByZXZpZXcgPyBudWxsIDogd2lkZ2V0Q29udGV4dC4kaWQ7XG4gICAgLy8gSWYgdXNlciBzZXRzIHRvIGhpZ2hsaWdodCB0aGUgZGF0YSBwb2ludHMgYW5kIGluY3JlYXNlIHRoZSB0aGlja25lc3Mgb2YgdGhlIGxpbmVcbiAgICBpZiAoaXNMaW5lVHlwZUNoYXJ0KHdpZGdldENvbnRleHQudHlwZSkpIHtcbiAgICAgICAgc2V0TGluZVRoaWNrbmVzcyhpZCwgd2lkZ2V0Q29udGV4dC5saW5ldGhpY2tuZXNzKTtcbiAgICAgICAgaGlnaGxpZ2h0UG9pbnRzKGlkLCB3aWRnZXRDb250ZXh0LmhpZ2hsaWdodHBvaW50cyk7XG4gICAgfVxuICAgIC8vIE1vZGlmeWluZyB0aGUgbGVnZW5kIHBvc2l0aW9uIG9ubHkgd2hlbiBsZWdlbmQgaXMgc2hvd25cbiAgICBpZiAod2lkZ2V0Q29udGV4dC5zaG93bGVnZW5kKSB7XG4gICAgICAgIG1vZGlmeUxlZ2VuZFBvc2l0aW9uKHdpZGdldENvbnRleHQsIHdpZGdldENvbnRleHQuc2hvd2xlZ2VuZCwgaWQpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXREYXRlTGlzdCA9ICgpID0+IGRhdGVMaXN0O1xuIl19