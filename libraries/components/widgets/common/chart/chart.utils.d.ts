export declare const chartTypes: string[], allShapes: string[];
export declare const isPieChart: (type: any) => boolean;
export declare const isLineChart: (type: any) => boolean;
export declare const isBarChart: (type: any) => boolean;
export declare const isDonutChart: (type: any) => boolean;
export declare const isBubbleChart: (type: any) => boolean;
export declare const isColumnChart: (type: any) => boolean;
export declare const isAreaChart: (type: any) => boolean;
export declare const isPieType: (type: any) => boolean;
export declare const isChartDataJSON: (type: any) => any;
export declare const isChartDataArray: (type: any) => any;
export declare const isLineTypeChart: (type: any) => any;
export declare const isAxisDomainSupported: (type: any) => boolean;
export declare const getBarSpacingValue: (value: any, prop: any) => any;
export declare const getRadiusValue: (value: any, prop: any) => any;
export declare const getLabelValues: (showlabels: any, showlabelsoutside: any, prop: any) => any;
export declare const constructSampleData: (dataType: any, yaxisLength: any, shape: any) => any[];
export declare const getDataType: (widgetContext: any) => "jsonFormat" | "lineChartFormat" | "arrayFormat" | "bubbleFormat" | "pieChartFormat";
export declare const getSampleData: (widgetContext: any) => any[];
export declare const isAxisDomainValid: (widgetContext: any, axis: any) => boolean;
export declare const areMinMaxValuesValid: (values: any) => boolean;
export declare const getYScaleMinValue: (value: any) => number;
export declare const highlightPoints: (id: any, highlightpoints: any) => void;
export declare const setLineThickness: (id: any, thickness: any) => void;
export declare const initProperties: (widgetContext: any, propertyValueMap: any) => any;
export declare const getNumberValue: (value: any, callback: any) => any;
export declare const getDateFormatedData: (dateFormat: any, d: any) => any;
export declare const getNumberFormatedData: (numberFormat: any, d: any) => any;
export declare const toggleAxisShow: (property: any, value: any) => void;
export declare const modifyLegendPosition: (widgetContext: any, position: any, id: any) => void;
export declare const isShowLegend: (value: any) => boolean;
/**
 * Customise the tooltip for donut & pie charts and also for charts having only one value attached to yaxis
 * @param key
 * @param label
 */
export declare const customiseTooltip: (chart: any, propertyValueMap: any, widgetContext: any, label?: any) => void;
export declare const initChart: (widgetContext: any, xDomainValues: any, yDomainValues: any, propertyValueMap: any, isPreview: any) => any;
export declare const postPlotChartProcess: (widgetContext: any, isPreview?: any) => void;
export declare const getDateList: () => string[];
