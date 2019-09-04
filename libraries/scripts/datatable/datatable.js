/*global $, window, angular, moment, _, document, parseInt, navigator*/
/**
 * JQuery Datagrid widget.
 */

'use strict';

$.widget('wm.datatable', {
    options: {
        data: [],
        statusMsg: '',
        colDefs: [],
        rowActions: [],
        headerConfig: [],
        sortInfo: {
            'field': '',
            'direction': ''
        },
        isMobile: false,
        enableSort: true,
        filtermode: '',
        height: '100%',
        showHeader: true,
        selectFirstRow: false,
        showNewRow: true,
        showRowIndex: false,
        enableRowSelection: true,
        enableColumnSelection: false,
        multiselect: false,
        filterNullRecords: true,
        cssClassNames: {
            'tableRow': 'app-datagrid-row',
            'headerCell': 'app-datagrid-header-cell',
            'groupHeaderCell': 'app-datagrid-group-header-cell',
            'tableCell': 'app-datagrid-cell',
            'grid': '',
            'gridDefault': 'table',
            'gridBody': 'app-datagrid-body',
            'deleteRow': 'danger',
            'ascIcon': 'wi wi-long-arrow-up',
            'descIcon': 'wi wi-long-arrow-down',
            'selectedColumn': 'selected-column',
            'rowExpandIcon': 'wi wi-minus-square',
            'rowCollapseIcon': 'wi wi-plus-square',
            'gridRowExpansionClass': 'table-row-expansion'
        },
        dataStates: {
            'loading': 'Loading...',
            'ready': '',
            'error': 'An error occurred in loading the data.',
            'nodata': 'No data found.'
        },
        messages: {
            'selectField': 'Select Field'
        },
        loadingicon: '',
        startRowIndex: 1,
        editmode: '',
        actionsEnabled: {
            'edit': true,
            'new': true
        },
        rowExpansionEnabled: false,
        rowDef: {
            position: '0',
            closeothers: false,
            columnwidth: '30px'
        },
        searchHandler: function () {
        },
        sortHandler: function () {
        }
    },
    customColumnDefs: {
        'checkbox': {
            'field': 'checkbox',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'width: 50px; text-align: center;',
            'textAlignment': 'center',
            'isMultiSelectCol': true,
            'show': true
        },
        'radio': {
            'field': 'radio',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'width: 50px; text-align: center;',
            'textAlignment': 'center',
            'show': true
        },
        '__expand': {
            'field': '__expand',
            'type': 'custom',
            'displayName': '',
            'sortable': false,
            'searchable': false,
            'resizable': false,
            'selectable': false,
            'readonly': true,
            'style': 'text-align: center;',
            'textAlignment': 'center',
            'show': true,
            'width': '30px'
        },
        'rowIndex': {
            'field': 'rowIndex',
            'type': 'custom',
            'displayName': 'S. No.',
            'sortable': false,
            'searchable': false,
            'selectable': false,
            'readonly': true,
            'style': 'text-align: left;',
            'textAlignment': 'left',
            'show': true
        }
    },
    CONSTANTS: {
        'QUICK_EDIT': 'quickedit',
        'INLINE': 'inline',
        'FORM': 'form',
        'DIALOG': 'dialog',
        'SEARCH': 'search',
        'MULTI_COLUMN': 'multicolumn'
    },
    Utils: {
        random: function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        },
        isDefined: function (value) {
            return value !== undefined;
        },
        isObject: function (value) {
            return value !== null && typeof value === 'object';
        },
        getObjectIndex: function (data, obj) {
            var matchIndex = -1;
            if (!Array.isArray(data)) {
                return -1;
            }
            data.some(function (data, index) {
                if (_.isEqual(data, obj)) {
                    matchIndex = index;
                    return true;
                }
            });
            return matchIndex;
        },
        generateGuid: function () {
            var random = this.random;
            return random() + random() + '-' + random() + '-' + random() + '-' +
                random() + '-' + random() + random() + random();
        },
        isValidHtml: function (htm) {
            var validHtmlRegex = /<[a-z][\s\S]*>/i;
            return validHtmlRegex.test(htm);
        },
        isMac: function () {
            return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        },
        isDeleteKey: function (event) {
            return (this.isMac() && event.which === 8) || event.which === 46;
        }
    },

    _getColumnSortDirection: function (field) {
        var sortInfo = this.options.sortInfo;
        return field === sortInfo.field ? sortInfo.direction : '';
    },
    /*Based on the spacing property, add or remove classes*/
    _toggleSpacingClasses: function (value) {
        switch (value) {
            case 'normal':
                this.gridElement.removeClass('table-condensed');
                this.gridHeaderElement.removeClass('table-condensed');
                if (this.gridSearch) {
                    this.gridSearch.find('.form-group').removeClass('form-group-sm');
                    this.gridSearch.find('select').removeClass('input-sm');
                    this.gridSearch.find('.input-group').removeClass('input-group-sm');
                }
                break;
            case 'condensed':
                this.gridElement.addClass('table-condensed');
                this.gridHeaderElement.addClass('table-condensed');
                if (this.gridSearch) {
                    this.gridSearch.find('.form-group').addClass('form-group-sm');
                    this.gridSearch.find('select').addClass('input-sm');
                    this.gridSearch.find('.input-group').addClass('input-group-sm');
                }
                break;
        }
    },
    //Method to calculate and get the column span of the header cells
    _getColSpan: function (cols) {
        var colSpan = 0,
            self = this;
        _.forEach(cols, function (col) {
            var colDef;
            if (col.isGroup) {
                colSpan += self._getColSpan(col.columns);
            } else {
                colDef = _.find(self.preparedHeaderData, {'field': col.field});
                //If show is false, don't increment the col span
                colSpan = (!_.isUndefined(colDef.show) && !colDef.show) ? colSpan : colSpan + 1;
            }
        });
        return colSpan;
    },
    //Method to set the column span of the header cells in the config
    _setColSpan: function (config) {
        var self = this;
        _.forEach(config, function (col) {
            if (col.isGroup) {
                col.colspan = self._getColSpan(col.columns);
                self.gridHeader.find('th[data-col-group="' + col.field + '"]').attr('colspan', col.colspan);
                self._setColSpan(col.columns);
            }
        });
    },
    /* Returns the table header template. */
    _getHeaderTemplate: function () {

        var $colgroup = $('<colgroup></colgroup>'),
            $htm = $('<thead></thead>'),
            isDefined = this.Utils.isDefined,
            sortInfo = this.options.sortInfo,
            sortField = sortInfo.field,
            self = this,
            rowTemplates = [],
            headerConfig = this.options.headerConfig,
            headerGroupClass = self.options.cssClassNames.groupHeaderCell,
            $row;

        function generateHeaderCell(value, index) {
            var id = index,
                field = value.field,
                headerLabel = self.Utils.isDefined(value.displayName) ? value.displayName : (field || ''),
                titleLabel = headerLabel,
                sortEnabled = self.options.enableSort && (_.isUndefined(value.show) || value.show) && (_.isUndefined(value.sortable) || value.sortable),
                headerClasses = self.options.cssClassNames.headerCell,
                sortClass,
                tl = '',
                $th,
                $col,
                $sortSpan,
                $sortIcon;
            headerLabel = (!self.Utils.isDefined(headerLabel) || headerLabel === '') ? '&nbsp;' : headerLabel; //If headername is empty, add an empty space
            $col = $('<col/>');
            if (value.style) {
                $col.attr('style', value.style);
            }
            $colgroup.append($col);
            /* thead */

            if (isDefined(value.class)) {
                headerClasses += ' ' + value.class;
            }
            if (value.selected) {
                headerClasses += ' ' + self.options.cssClassNames.selectedColumn + ' ';
            }
            if (field === 'checkbox' || field === 'radio') {
                headerClasses += ' grid-col-small';
            }
            tl += '<th';
            if ((_.isUndefined(value.resizable) || value.resizable) && (_.isUndefined(value.show) || value.show)) { //If show is false, do not add the resize option
                tl += ' data-col-resizable';
            }
            if (self.options.enableColumnSelection && (_.isUndefined(value.selectable) || value.selectable)) {
                tl += ' data-col-selectable';
            }
            if (sortEnabled) {
                tl += ' data-col-sortable';
            }
            tl += '></th>';
            $th = $(tl);
            $th.attr({
                'data-col-id': id,
                'data-col-field': field,
                'title': titleLabel,
                'style': 'text-align: ' + value.textAlignment
            });
            $th.addClass(headerClasses);
            /* For custom columns, show display name if provided, else don't show any label. */
            if (field === 'checkbox') {
                $th.append('<input type="checkbox" />');
            }
            $th.append('<span class="header-data">' + headerLabel + '</span>');
            if (sortEnabled) { //If sort info is present, show the sort icon for that column on grid render
                $sortSpan = $('<span class="sort-buttons-container"></span>');
                $sortIcon = $('<i class="sort-icon"></i>');
                if (sortField && sortField === value.field && sortInfo.direction) {
                    sortClass = sortInfo.direction === 'asc' ? self.options.cssClassNames.ascIcon : self.options.cssClassNames.descIcon;
                    $sortSpan.addClass('active');
                    $sortIcon.addClass(sortClass + ' ' + sortInfo.direction);
                }
                $th.append($sortSpan.append($sortIcon));
            }
            return $th.get(0).outerHTML;
        }

        //Method to generate the header row based on the column group config
        function generateRow(cols, i) {
            var tl = '';
            _.forEach(cols, function (col) {
                var index,
                    value,
                    classes,
                    styles,
                    $groupTl;
                if (col.columns && col.columns.length) {
                    //If columns is present, this is a group header cell.
                    $groupTl = $('<th></th>');
                    classes = headerGroupClass + ' ' + (col.class || '');
                    styles = 'text-align: ' + col.textAlignment + ';background-color: ' + (col.backgroundColor || '') + ';';
                    $groupTl.attr({
                        'data-col-group': col.field,
                        'class': classes,
                        'style': styles,
                        'title': col.displayName
                    });
                    $groupTl.append('<span class="header-data">' + col.displayName + '</span>');
                    tl += $groupTl.get(0).outerHTML;
                    generateRow(col.columns, (i + 1));
                } else {
                    //For non group cells, fetch the relative field definition and generate the template
                    index = _.findIndex(self.preparedHeaderData, {'field': col.field});
                    value = self.preparedHeaderData[index];
                    if (value) {
                        tl += generateHeaderCell(value, index);
                    }
                }
            });
            rowTemplates[i] = rowTemplates[i] || '';
            rowTemplates[i] += tl;
        }

        //If header config is not present, this is a dynamic grid. Generate headers directly from field defs
        if (_.isEmpty(headerConfig)) {
            $row = $('<tr></tr>');
            self.preparedHeaderData.forEach(function (value, index) {
                $row.append(generateHeaderCell(value, index));
            });
            $htm.append($row);
        } else {
            generateRow(headerConfig, 0);
            //Combine all the row templates to generate the header
            $htm.append(_.reduce(rowTemplates, function (template, rowTl, index) {
                var $rowTl = $(rowTl),
                    tl = '',
                    rowSpan = rowTemplates.length - index;
                if (rowSpan > 1) {
                    $rowTl.closest('th.app-datagrid-header-cell').attr('rowspan', rowSpan);
                }
                $rowTl.each(function () {
                    tl += $(this).get(0).outerHTML;
                });
                return template + '<tr>' + tl + '</tr>';
            }, ''));
        }

        return {'colgroup': $colgroup, 'header': $htm};
    },

    /* Returns the seachbox template. */
    _getSearchTemplate: function () {
        var htm,
            sel = '<select name="wm-datatable" data-element="dgFilterValue" ' +
                'class="form-control app-select">' +
                '<option value="" selected class="placeholder">' + this.options.messages.selectField + '</option>',
            searchLabel = (this.Utils.isDefined(this.options.searchLabel) &&
                this.options.searchLabel.length) ? this.options.searchLabel : '';
        this.options.colDefs.forEach(function (colDef, index) {
            if (colDef.field !== 'none' && colDef.field !== 'rowOperations' && colDef.searchable) {
                sel += '<option value="' + colDef.field +
                    '" data-coldef-index="' + index + '">' +
                    (colDef.displayName || colDef.field) + '</option>';
            }
        });

        sel += '</select>';
        htm =
            '<form class="form-search form-inline" onsubmit="return false;"><div class="form-group">' +
            '<input type="text" data-element="dgSearchText" class="form-control app-textbox" value="" placeholder="' + searchLabel + '" style="display: inline-block;"/>' +
            '</div><div class="input-append input-group">' +
            sel +
            '<span class="input-group-addon"><button type="button" data-element="dgSearchButton" class="app-search-button" title="' + searchLabel + '">' +
            '<i class="wi wi-search"></i>' +
            '</button></span>' +
            '</div>' +
            '</div></form>';
        return htm;
    },
    _appendRowExpansionButtons: function ($htm) {
        var self = this;
        $htm.find("[data-identifier='rowExpansionButtons']").each(function (index) {
            var _rowData, $row, rowId;
            $row = $(this).closest('tr.app-datagrid-row');
            rowId = parseInt($row.attr('data-row-id'), 10);
            _rowData = _.clone(self.options.data[rowId]);
            _rowData.$index = index + 1;
            self.options.generateRowExpansionCell(_rowData, index);
            $(this).empty().append(self.options.getRowExpansionAction(index));
        });
    },

    /* Returns the tbody markup. */
    _getGridTemplate: function () {
        var self = this,
            $tbody = $('<tbody class="' + this.options.cssClassNames.gridBody + '"></tbody>');

        this.options.clearCustomExpression();
        this.options.clearRowDetailExpression();

        _.forEach(this.preparedData, function (row, index) {
            var _row = _.clone(row);
            _row.$index = index + 1;
            self.options.generateCustomExpressions(_row, index);
            self.options.registerRowNgClassWatcher(_row, index);
            $tbody.append(self._getRowTemplate(row, index));
            if (self.options.rowExpansionEnabled) {
                var heightStyle = self.options.rowDef.height ? ' style="min-height:' + self.options.rowDef.height + '"' : '';
                var colSpanLength = _.filter(self.preparedHeaderData, function(c) {return c.show}).length - 1;
                $tbody.append('<tr class="app-datagrid-detail-row" style="display: none;" tabindex="0" data-row-id="' + row.$$pk + '"><td></td><td colspan="' + colSpanLength + '" class="app-datagrid-row-details-cell">' +
                    '<div class="row-overlay" ' + heightStyle + '><div class="row-status"><i class="' + self.options.loadingicon + '"></i></div></div><div class="details-section" style="display: none;"></div>' +
                    '</td></tr>');
            }
        });

        return $tbody;
    },

    /* Returns the table row template. */
    _getRowTemplate: function (row, rowIndex) {
        var $htm,
            self = this,
            gridOptions = self.options;

        $htm = $('<tr tabindex="0" class="' + gridOptions.cssClassNames.tableRow + ' ' + (gridOptions.rowClass || '') + '" data-row-id="' + row.$$pk + '"></tr>');
        this.preparedHeaderData.forEach(function (current, colIndex) {
            $htm.append(self._getColumnTemplate(row, colIndex, current, rowIndex));
        });
        return $htm;
    },

    _getRowActionsColumnDefIndex: function () {
        var i, len = this.preparedHeaderData.length;
        for (i = 0; i < len; i += 1) {
            if (this.preparedHeaderData[i].field === 'rowOperations') {
                return i;
            }
        }
        return -1;
    },

    _getRowActionsColumnDef: function () {
        var index = this._getRowActionsColumnDefIndex();
        if (index !== -1) {
            return this.preparedHeaderData[index];
        }
        return null;
    },

    /* Returns the checkbox template. */
    _getCheckboxTemplate: function (row, isMultiSelectCol) {
        var checked = row.checked ? ' checked' : '',
            disabled = row.disabed ? ' disabled' : '',
            chkBoxName = isMultiSelectCol ? 'gridMultiSelect' : '';
        return '<input name="' + chkBoxName + '" type="checkbox"' + checked + disabled + '/>';
    },

    /* Returns the radio template. */
    _getRadioTemplate: function (row) {
        var checked = row.checked ? ' checked' : '',
            disabled = row.disabed ? ' disabled' : '';
        return '<input type="radio" rowSelectInput name="" value=""' + checked + disabled + '/>';
    },

    /* Returns the table cell template. */
    _getColumnTemplate: function (row, colId, colDef, rowIndex) {
        var $htm,
            columnValue,
            innerTmpl,
            classes = this.options.cssClassNames.tableCell + ' ' + (colDef.class || ''),
            colExpression = colDef.customExpression;

        $htm = $('<td class="' + classes + '" data-col-id="' + colId + '" style="text-align: ' + colDef.textAlignment + ';"></td>');

        columnValue = _.get(row, colDef.field);

        if (colExpression) {
            $htm.html(this.options.getCustomExpression(colDef.field, rowIndex));
        } else {
            if (colDef.type !== 'custom') {
                columnValue = _.get(row, colDef.field);
                /* 1. Show "null" values as null if filterNullRecords is true, else show empty string.
                * 2. Show "undefined" values as empty string. */
                if ((this.options.filterNullRecords && columnValue === null) ||
                    _.isUndefined(columnValue)) {
                    columnValue = '';
                }
                $htm.attr('title', columnValue);
                //Add empty quote, to convert boolean false to 'false', so that value is rendered
                $htm.html("" + columnValue);
            } else {
                switch (colDef.field) {
                    case 'checkbox':
                        innerTmpl = this._getCheckboxTemplate(row, colDef.isMultiSelectCol);
                        break;
                    case '__expand':
                        innerTmpl = '<span class="row-expansion-column" data-identifier="rowExpansionButtons"></span>';
                        break;
                    case 'radio':
                        innerTmpl = this._getRadioTemplate(row);
                        break;
                    case 'rowOperations':
                        innerTmpl = '<span class="actions-column" data-identifier="actionButtons"></span>';
                        break;
                    case 'rowIndex':
                        innerTmpl = row.$$index;
                        break;
                    case 'none':
                        innerTmpl = '';
                        break;
                    default:
                        innerTmpl = (_.isUndefined(columnValue) || columnValue === null) ? '' : columnValue;
                }
                $htm.html(innerTmpl);
            }
        }
        row.$index = rowIndex + 1;
        this.options.registerColNgClassWatcher(row, colDef, rowIndex, colId);
        return $htm;
    },
    //Get event related template for editable widget
    _getEventTemplate: function (colDef) {
        var events = _.filter(_.keys(colDef), function (key) {
                return _.startsWith(key, 'on');
            }),
            changeEvt,
            template = '';
        //On change events for the widget
        changeEvt = colDef.editWidgetType === 'autocomplete' ? 'onSubmit' : 'onChange';
        events = _.union(events, [changeEvt]);
        _.forEach(events, function (eventName) {
            template += ' ' + _.kebabCase(eventName) + '="';
            if (eventName === 'onSubmit' || eventName === 'onChange') {
                template += '_' + eventName + 'Field($event, $scope, newVal, oldVal);'
            }
            template += (colDef[eventName] || '') + '" ';
        });
        return template;
    },
    _insertFieldInHeaderConfig: function (headerConfig, fieldName, position) {
        var index = _.findIndex(headerConfig, {field: position}),
            self = this;
        if (index === -1) {
            _.forEach(headerConfig, function (config) {
                if (config.isGroup) {
                    self._insertFieldInHeaderConfig(config.columns, fieldName, position);
                }
            });
        } else {
            headerConfig.splice(index + 1, 0, {'field': fieldName, 'isPredefined': true});
        }
    },
    setHeaderConfigForDefaultFields: function (name, position) {
        if (_.isEmpty(this.options.headerConfig)) {
            return;
        }
        var fieldName = this.customColumnDefs[name].field;
        _.remove(this.options.headerConfig, {'field': fieldName});
        if (position === '0') {
            this.options.headerConfig.unshift({'field': fieldName, 'isPredefined': true});
        } else  if (position === '-1') {
            this.options.headerConfig.push({'field': fieldName, 'isPredefined': true});
        } else {
            this._insertFieldInHeaderConfig(this.options.headerConfig, fieldName, position);
        }
    },
    setDefaultColsData: function (header) {
        //If columns are not present, do not add the default columns
        if (_.isEmpty(this.preparedHeaderData)) {
            return;
        }
        var rowExpandPosition,
            rowExpandCol;
        if (this.options.rowExpansionEnabled) {
            rowExpandPosition = this.options.rowDef.position;
            rowExpandCol = _.clone(this.customColumnDefs.__expand);
            rowExpandCol.width = this.options.rowDef.columnwidth;
            if (header) {
                if (rowExpandPosition === '-1') {
                    this.preparedHeaderData.push(rowExpandCol);
                } else if (rowExpandPosition === '0') {
                    this.preparedHeaderData.unshift(rowExpandCol);
                } else {
                    var index = _.findIndex(this.preparedHeaderData, {field: rowExpandPosition});
                    this.preparedHeaderData.splice(index + 1, 0, rowExpandCol);
                }
            }
            this.setHeaderConfigForDefaultFields('__expand', rowExpandPosition);
        }
        if (this.options.showRowIndex) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.rowIndex);
            }
            this.setHeaderConfigForDefaultFields('rowIndex', '0');
        }
        if (this.options.multiselect) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.checkbox);
            }
            this.setHeaderConfigForDefaultFields('checkbox', '0');
        }
        if (!this.options.multiselect && this.options.showRadioColumn) {
            if (header) {
                this.preparedHeaderData.unshift(this.customColumnDefs.radio);
            }
            this.setHeaderConfigForDefaultFields('radio', '0');
        }
    },
    /* Prepares the grid header data by adding custom column definitions if needed. */
    _prepareHeaderData: function () {
        this.preparedHeaderData = [];

        $.extend(this.preparedHeaderData, this.options.colDefs);
        this.setDefaultColsData(true);
    },

    /* Generates default column definitions from given data. */
    _generateCustomColDefs: function () {
        var colDefs = [],
            generatedColDefs = {};

        function generateColumnDef(key) {
            if (!generatedColDefs[key]) {
                var colDef = {
                    'type': 'string',
                    'field': key
                };
                colDefs.push(colDef);
                generatedColDefs[key] = true;
            }
        }

        this.options.data.forEach(function (item) {
            _.keys(item).forEach(generateColumnDef);
        });

        this.options.colDefs = colDefs;
        this._prepareHeaderData();
    },

    /* Prepares the grid data by adding a primary key to each row's data. */
    _prepareData: function () {
        var data = [],
            colDefs = this.options.colDefs,
            self = this,
            isObject = this.Utils.isObject,
            isDefined = this.Utils.isDefined;
        if (!this.options.colDefs.length && this.options.data.length) {
            this._generateCustomColDefs();
        }
        this.options.data.forEach(function (item, i) {
            var rowData = $.extend(true, {}, item);
            colDefs.forEach(function (colDef) {
                if (!colDef.field) {
                    return;
                }
                var fields = colDef.field.split('.'),
                    text = item,
                    j,
                    len = fields.length,
                    key,
                    isArray;

                for (j = 0; j < len; j++) {
                    key = fields[j];
                    isArray = undefined;
                    if (key.indexOf('[0]') !== -1) {
                        key = key.replace('[0]', '');
                        isArray = true;
                    }
                    if (isObject(text) && !isArray) {
                        text = _.get(text, key);
                    } else if (isArray) {
                        text = _.get(text, key + '[0]');
                    } else {
                        text = undefined;
                        break;
                    }
                }
                if (isDefined(text)) {
                    rowData[colDef.field] = text;
                } else if (fields.length > 1 && _.has(item, colDef.field)) {
                    /* For case when coldef field name has ".", but data is in
                     * format [{'foo.bar': 'test'}], i.e. when the key value is
                     * not a nested object but a primitive value.
                     * (Ideally if coldef name has ".", for e.g. field name 'foo.bar',
                     * data should be [{'foo': {'bar': 'test'}})*/
                    rowData[colDef.field] = item[colDef.field];
                }
            });

            /* Add a unique identifier for each row. */
            rowData.$$index = self.options.startRowIndex + i;
            rowData.$$pk = i;
            data.push(rowData);
        });

        this.preparedData = data;
    },

    /* Select previously selected columns after refreshing grid data. */
    _reselectColumns: function () {
        var selectedColumns = [],
            self = this;
        //If enableColumnSelection is set to true, reselect the columns on data refresh
        if (this.gridHeader && this.options.enableColumnSelection) {
            selectedColumns = this.gridHeader.find('th.' + this.options.cssClassNames.selectedColumn);
            //Call the column selection handler on each of the selected columns
            if (selectedColumns.length) {
                selectedColumns.each(function () {
                    self.columnSelectionHandler(undefined, $(this));
                });
            }
        }
        //reset select all checkbox.
        if (this.options.multiselect) {
            this.updateSelectAllCheckboxState();
        }
    },

    /* Initializes the grid. */
    _create: function () {
        // Add all instance specific values here.
        $.extend(this, {
            dataStatus: {
                'message': '',
                'state': 'ready'
            },
            preparedData: [],
            preparedHeaderData: [],
            dataStatusContainer: null,
            gridContainer: null,
            gridElement: null,
            gridHeader: null,
            gridBody: null,
            gridSearch: null,
            tableId: null,
            searchObj: {
                'field': '',
                'value': '',
                'event': null
            },
            compiledCellTemplates: {}
        });
        // TODO: Variable loading status is getting updated before dataset update. This is resulting in loader going off before data is rendered.
        // Need to update code with suitable fix. For now 250ms is added as workaround
        this._setStatus = _.debounce(function (isCreated) {
            this.__setStatus(isCreated);
        }, 100);
        this._debounceOnEnter = _.debounce(function ($target, $row, quickEdit, event) {
            this._onEnter($target, $row, quickEdit, event);
        }, 150);
        this._prepareHeaderData();
        this._prepareData();
        this._render(true);
    },
    _setGridEditMode: function (val) {
        if ($.isFunction(this.options.setGridEditMode)) {
            this.options.setGridEditMode(val);
        }
    },
    /* Re-renders the whole grid. */
    _refreshGrid: function () {
        this._prepareHeaderData();
        this._prepareData();
        this._render();
        this.addOrRemoveScroll();
        this._setGridEditMode(false);
    },

    refreshGrid: function () {
        window.clearTimeout(this.refreshGridTimeout);
        this.refreshGridTimeout = window.setTimeout(this._refreshGrid.bind(this), 50);
    },

    /* Re-renders the table body. */
    refreshGridData: function () {
        this._prepareData();
        this.gridBody.remove();
        this._renderGrid();
        this._reselectColumns();
        this.addOrRemoveScroll();
        this._setGridEditMode(false);
    },
    //Populate row data with default data
    setDefaultRowData: function (rowData) {
        _.forEach(this.preparedHeaderData, function (colDef) {
            rowData[colDef.field] = colDef.defaultvalue;
        });
    },
    /* Inserts a new blank row in the table. */
    addNewRow: function (skipFocus, alwaysNewRow) {
        var rowId = this.gridBody.find('> tr.app-datagrid-row:visible').length || 99999, //Dummy value if rows are not there
            self = this,
            rowData = {},
            $row,
            $gridBody,
            $alwaysNewRow;

        if (!alwaysNewRow && $.isFunction(this.options.beforeRowInsert)) {
            this.options.beforeRowInsert();
        }

        $gridBody = this.gridElement.find('> tbody.app-datagrid-body');
        $alwaysNewRow = $gridBody.find('> tr.app-datagrid-row.always-new-row');
        //Focus the new row if already present
        if ($alwaysNewRow.length) {
            this.setFocusOnElement(undefined, $alwaysNewRow);
            // QUICK EDIT MODE | On Add Click on new row, trigger save action
            if(this.options.editmode===this.CONSTANTS.QUICK_EDIT){
                var $qTarget = $alwaysNewRow.find("input").length>0?$($alwaysNewRow.find("input")[0]):null;
                if($qTarget!==null){
                    var event = $.Event("keydown");
                    event.which = 13;
                    $qTarget.trigger(event);
                }
            }
            return;
        }

        rowData.$index = rowId;
        rowData.$$pk = rowId;
        if (this.options.editmode !== this.CONSTANTS.FORM && this.options.editmode !== this.CONSTANTS.DIALOG) {
            $row = $(this._getRowTemplate(rowData, rowData.$index));
            if (!this.preparedData.length) {
                this.setStatus('ready', this.dataStatus.ready);
            }
            //Based on the form position, add new row at top or bottom
            if (this.options.formPosition === 'top') {
                $gridBody.prepend($row);
            } else {
                $gridBody.append($row);
            }
            this._appendRowActions($row, true, rowData);
            this.attachEventHandlers($row);
            //For quick edit, do not remove the delete button
            if (alwaysNewRow || this.options.editmode !== this.CONSTANTS.QUICK_EDIT) {
                $row.find('.delete-row-button').hide();
                //Hide the edit button for always new row
                if (alwaysNewRow) {
                    $row.find('.edit-row-button').hide()
                }
            }
            this._findAndReplaceCompiledTemplates();

            //For always show new row, make the row editable with default values
            if (alwaysNewRow) {
                this.setDefaultRowData(rowData);

                $row.addClass('always-new-row').addClass('row-editing');
                this.options.runInNgZone(function () {
                    self.makeRowEditable($row, rowData, true);
                });
            } else {
                $row.trigger('click', [undefined, {action: 'edit', operation: 'new', skipFocus: skipFocus}]);
            }

            this.updateSelectAllCheckboxState();
            this.addOrRemoveScroll();
            this.options.timeoutCall(function () {
                self.setColGroupWidths();
            }, 100);
        }
    },

    /* Returns the selected rows in the table. */
    getSelectedRows: function () {
        this.getSelectedColumns();
        var selectedRowsData = [],
            self = this;

        this.preparedData.forEach(function (data, i) {
            if (data.selected) {
                selectedRowsData.push(self.options.data[i]);
            }
        });
        return selectedRowsData;
    },
    /* Sets the selected rows in the table. */
    selectRows: function (rows) {
        var self = this;
        /*Deselect all the previous selected rows in the table*/
        self.gridBody.find('tr.app-datagrid-row').each(function (index) {
            if (self.preparedData[index] && self.preparedData[index].selected) {
                $(this).trigger('click', [$(this), {skipSingleCheck: true}]);
            }
        });
        /*Select the given row. If rows is an array, loop through the array and set the row*/
        if (_.isArray(rows)) {
            _.forEach(rows, function (row) {
                self.selectRow(row, true);
            });
        } else {
            self.selectRow(rows, true);
        }
    },
    toggleRowFilter: function(show) {
        if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN && this.gridSearch) {
            if (show) {
                this.gridSearch.show();
            } else {
                this.gridSearch.hide();
            }
        }
    },
    /*Set the default widths for the colgroup*/
    setColGroupWidths: function () {
        var self = this,
            headerCols = this.options.isMobile ? this.gridElement.find('col') : this.gridHeaderElement.find('col'),
            bodyCols = this.gridElement.find('col'),
            headerCells = this.options.showHeader ? this.gridContainer.find('th.app-datagrid-header-cell') : this.gridElement.find('tr.app-datagrid-row:first td'),
            colLength = this.preparedHeaderData.length,
            scrollLeft = this.gridElement.parent().prop('scrollLeft'); //Preserve the scroll left to keep the same scroll after setting width
        if (!headerCols.length && !headerCells.length) {
            return;
        }
        //Set the col spans for the header groups
        this._setColSpan(this.options.headerConfig);
        // Hide the row filter. As different widgets are present inside row filter, this will effect the column size
        this.toggleRowFilter();
        //First Hide or show the column based on the show property so that width is calculated correctly
        headerCells.each(function () {
            var id = Number($(this).attr('data-col-id')),
                colDef = self.preparedHeaderData[id],
                $headerCell = self.gridContainer.find('th[data-col-id="' + id + '"]'),
                $tdCell = self.gridElement.find('td.app-datagrid-cell[data-col-id="' + id + '"]'),
                $headerCol = $(headerCols[id]),
                $bodyCol = $(bodyCols[id]),
                definedWidth,
                width;
            if (!colDef) {
                return;
            }
            definedWidth = colDef.width;
            if (!_.isUndefined(colDef.show) && !colDef.show) { //If show is false, set width to 0 to hide the column
                //Hide the header and column if show is false
                $headerCell.hide();
                $tdCell.hide();
                $headerCol.hide();
                $bodyCol.hide();
            } else {
                $headerCell.show();
                $tdCell.show();
                $headerCol.show();
                $bodyCol.show();
            }
            //If default width is set, reset the width so that correct width is set on reload
            if ($headerCol.length && $headerCol[0].style.width === '90px') {
                width = _.isUndefined(definedWidth) ? '' : definedWidth;
                $headerCol.css('width', width);
                $bodyCol.css('width', width);
            }
        });
        //setting the header col width based on the content width
        headerCells.each(function () {
            var $header = $(this),
                id = Number($header.attr('data-col-id')),
                colDef = self.preparedHeaderData[id],
                definedWidth,
                width,
                tempWidth,
                $headerCol;
            if (!colDef) {
                return;
            }
            definedWidth = colDef.width;
            if (!_.isUndefined(colDef.show) && !colDef.show) { //If show is false, set width to 0 to hide the column
                //Hide the header and column if show is false
                width = 0;
            } else {
                if ($header.hasClass('grid-col-small')) { //For checkbox or radio, set width as 30
                    width = 50;
                } else {
                    if (_.isUndefined(definedWidth) || definedWidth === '' || _.includes(definedWidth, '%')) {
                        $headerCol = $(headerCols[id]);
                        if ($headerCol.length) {
                            tempWidth = $headerCol[0].style.width;
                            if (tempWidth === '' || tempWidth === '0px' || tempWidth === '90px' || _.includes(tempWidth, '%')) { //If width is not 0px, width is already set. So, set the same width again
                                width = $header.width();
                                width = width > 90 ? ((colLength === id + 1) ? width - 17 : width) : 90; //columnSanity check to prevent width being too small and Last column, adjust for the scroll width
                            } else {
                                width = tempWidth;
                            }
                        }
                    } else {
                        width = definedWidth;
                    }
                }
            }
            $(headerCols[id]).css('width', width);
            $(bodyCols[id]).css('width', width);
        });
        this.toggleRowFilter(true);
        this.gridElement.parent().prop('scrollLeft', scrollLeft);
    },

    /* Returns the selected columns in the table. */
    getSelectedColumns: function () {
        var selectedColsData = {},
            headerData = [],
            self = this,
            multiSelectColIndex,
            radioColIndex,
            colIndex;
        $.extend(headerData, this.preparedHeaderData);

        if (this.options.multiselect) {
            headerData.some(function (item, i) {
                if (item.field === 'checkbox') {
                    multiSelectColIndex = i;
                    return true;
                }
            });
            headerData.splice(multiSelectColIndex, 1);
        } else if (this.options.showRadioColumn) {
            headerData.some(function (item, i) {
                if (item.field === 'radio') {
                    radioColIndex = i;
                    return true;
                }
            });
            headerData.splice(radioColIndex, 1);
        }
        if (this.options.showRowIndex) {
            headerData.some(function (item, i) {
                if (item.field === 'rowIndex') {
                    colIndex = i;
                    return true;
                }
            });
            headerData.splice(colIndex, 1);
        }

        headerData.forEach(function (colDef) {
            var field = colDef.field;
            if (colDef.selected) {
                selectedColsData[field] = {
                    'colDef': colDef,
                    'colData': self.options.data.map(function (data) {
                        return data[field];
                    })
                };
            }
        });
        return selectedColsData;
    },

    /* Sets the options for the grid. */
    _setOption: function (key, value) {
        this._super(key, value);
        switch (key) {
            case 'showHeader':
                this._toggleHeader();
                this._toggleSearch();
                this.setColGroupWidths();
                this.addOrRemoveScroll();
                break;
            case 'filtermode':
                this._toggleSearch();
                break;
            case 'searchLabel':
                if (this.gridSearch) {
                    this.gridSearch.find('[data-element="dgSearchText"]').attr('placeholder', value);
                    this.gridSearch.find('[data-element="dgSearchButton"]').attr('title', value);
                }
                break;
            case 'selectFirstRow':
                this.selectFirstRow(value);
                break;
            case 'data':
                this.refreshGridData();
                break;
            case 'dataStates':
                if (this.dataStatus.state === 'nodata') {
                    this.setStatus('nodata', this.dataStatus.nodata);
                } else if (this.dataStatus.state === 'loading') {
                    this.setStatus('loading');
                }
                break;
            case 'loadingicon':
                this.dataStatusContainer.find('i').removeClass().addClass(this.options.loadingicon);
                break;
            case 'multiselect': // Fallthrough
            case 'showRadioColumn':
            case 'colDefs':
            case 'rowActions':
            case 'filterNullRecords':
            case 'showRowIndex':
                this.refreshGrid();
                break;
            case 'cssClassNames':
                var gridClass = this.options.cssClassNames.gridDefault + ' ' + this.options.cssClassNames.grid;
                if (this.options.rowExpansionEnabled) {
                    gridClass =  gridClass + ' ' + this.options.cssClassNames.gridRowExpansionClass;
                }
                // Set grid class on table.
                this.gridElement.attr('class', gridClass);
                this.gridHeaderElement.attr('class', gridClass);
                if (this.options.spacing === 'condensed') {
                    this._toggleSpacingClasses('condensed');
                }
                break;
            case 'spacing':
                this._toggleSpacingClasses(value);
                break;
            case 'messages':
                this.gridSearch && this.gridSearch.find('option.placeholder').text(value && value.selectField);
                break;
        }
    },

    getOptions: function () {
        return this.options;
    },

    /* Toggles the table header visibility. */
    _toggleHeader: function () {
        if (this.gridHeaderElement) {
            this.gridHeaderElement.empty();
        }
        if (this.gridElement) {
            this.gridElement.find('colgroup').remove();
            this.gridElement.find('thead').remove();
        }
        this.setDefaultColsData();
        if (this.options.showHeader) {
            this._renderHeader();
        }
    },

    /* Toggles the searchbox visibility. */
    _toggleSearch: function () {
        if (this.gridSearch) {
            this.gridSearch.remove();
        }
        if (this.options.filtermode === this.CONSTANTS.SEARCH) {
            this._renderSearch();
        } else if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN) {
            this._renderRowFilter();
            this.setColGroupWidths();
        }
    },
    /* Marks the first row as selected. */
    selectFirstRow: function (value, visible) {
        var $row,
            id;
        //If visible flag is true, select the first visible row item (Do not select the always new row)
        if (visible && this.gridElement.find('tBody').is(':visible')) {
            this.__setStatus();
            $row = this.gridElement.find('tBody tr.app-datagrid-row:visible:not(.always-new-row):first');
        } else {
            $row = this.gridElement.find('tBody tr.app-datagrid-row:not(.always-new-row):first');
        }
        id = $row.attr('data-row-id');
        // Select the first row if it exists, i.e. it is not the first row being added.
        if ($row.length && this.preparedData.length) {
            this.preparedData[id].selected = !value;
            // Triggering row click event using javascript click method because jquery trigger method is not triggering the events which are attached through javascript addEventListener method.
            $row[0].click();
        }
    },

    /* Selects a row. */
    selectRow: function (row, value) {
        var rowIndex = _.isNumber(row) ? row : this.Utils.getObjectIndex(this.options.data, row),
            selector,
            $row;
        if (rowIndex !== -1) {
            selector = 'tr.app-datagrid-row[data-row-id=' + rowIndex + ']';
            $row = this.gridBody.find(selector);
            if ($row.length) {
                this.preparedData[rowIndex].selected = !value;
            }
            $row.trigger('click');
        }
    },
    /**
     * deselect a row
     */
    deselectRow: function (row) {
        this.selectRow(row, false);
    },

    /* Toggles the table row selection. */
    toggleRowSelection: function ($row, selected, e, isSelectAll) {
        if (!$row.length) {
            return;
        }

        var rowId = $row.attr('data-row-id'),
            $checkbox,
            $radio;
        if (!this.preparedData[rowId]) {
            return;
        }
        this.preparedData[rowId].selected = selected;
        if (selected) {
            $row.addClass('active');
        } else {
            $row.removeClass('active');
        }
        if (this.options.showRadioColumn) {
            $radio = $row.find('td input[rowSelectInput]:radio:not(:disabled)');
            $radio.prop('checked', selected);
            this.preparedData[rowId].checked = selected;
        }
        if (this.options.multiselect) {
            $checkbox = $row.find('td input[name="gridMultiSelect"]:checkbox:not(:disabled)');
            $checkbox.prop('checked', selected);
            this.preparedData[rowId].checked = selected;
            // if we check header checkbox(select/unselect all the records) then updating selectAll checkbox state is not required.
            if (!isSelectAll) {
                this.updateSelectAllCheckboxState();
            }
        } else {
            this._deselectPreviousSelection($row, e);
        }
    },

    /* Checks the header checkbox if all table checkboxes are checked, else unchecks it. */
    updateSelectAllCheckboxState: function () {
        if (!this.options.showHeader || !this.options.multiselect) {
            return;
        }
        //As rows visibility is checked, remove loading icon
        this.__setStatus();
        var $headerCheckbox = this.gridHeader.find('th.app-datagrid-header-cell input:checkbox'),
            $tbody = this.gridElement.find('tbody'),
            checkedItemsLength = $tbody.find('tr.app-datagrid-row:visible input[name="gridMultiSelect"]:checkbox:checked').length,
            visibleRowsLength = $tbody.find('tr.app-datagrid-row:visible').length;

        if (!visibleRowsLength) {
            $headerCheckbox.prop('checked', false);
            return;
        }
        if (checkedItemsLength === visibleRowsLength) {
            $headerCheckbox.prop('checked', true);
        } else {
            $headerCheckbox.prop('checked', false);
        }
    },
    // triggered on capture phase of click listener.
    // sets the selected rowdata on click.
    rowClickHandlerOnCapture: function (e, $row, options) {
        $row = $row || $(e.target).closest('tr.app-datagrid-row');
        var rowId = $row.attr('data-row-id');
        var rowData = this.preparedData[rowId];
        data = this.options.data[rowId];
        this.options.assignSelectedItems(data, e);
    },

    /* Handles row selection. */
    rowSelectionHandler: function (e, $row, options) {
        options = options || {};
        var rowId,
            rowData,
            data,
            selected,
            self = this,
            action = options.action,
            $target = $(e.target),
            isQuickEdit = this.options.editmode === this.CONSTANTS.QUICK_EDIT;

        function callRowSelectionEvents() {
            if (selected && $.isFunction(self.options.onRowSelect)) {
                self.options.onRowSelect(data, e);
            }
            if (!selected && $.isFunction(self.options.onRowDeselect)) {
                self.options.onRowDeselect(data, e);
            }
        }

        $row = $row || $target.closest('tr.app-datagrid-row');

        if (action || (isQuickEdit && $target.hasClass('app-datagrid-cell') && !$row.hasClass('always-new-row'))) {
            //In case of advanced edit, Edit the row on click of a row
            options.action = options.action || 'edit';

            if (options.operation === 'new' || self.options.actionsEnabled.edit) {
                self.toggleEditRow(e, options)
            }

            if (options.skipSelect) {
                return;
            }
        }
        rowId = $row.attr('data-row-id');
        rowData = this.preparedData[rowId];
        data = this.options.data[rowId];
        selected = (rowData && rowData.selected) || false;
        if (!options.skipSingleCheck && (($row.hasClass('active') && !this.options.multiselect) || !rowData)) {
            if (!isQuickEdit && options.operation !== 'new') { //For quick edit, row will be in edit mode. So, no need to call events.
                callRowSelectionEvents();
            }
            return;
        }
        this.options.callOnRowClickEvent(data, e);
        selected = !selected;
        this.toggleRowSelection($row, selected, e);
        callRowSelectionEvents();
    },
    /*Handles the double click of the grid row*/
    rowDblClickHandler: function (e, $row) {
        e.stopPropagation();
        $row = $row || $(e.target).closest('tr.app-datagrid-row');
        var rowData, rowId = $row.attr('data-row-id');
        rowData = this.preparedData[rowId];
        if (!rowData) {
            return;
        }
        if ($.isFunction(this.options.onRowDblClick)) {
            this.options.onRowDblClick(rowData, e);
        }
    },
    closePopover: function() {
        //If the DataTable is in the popover, popover shouldn't be closed
        this.options.closePopover(this.element);
    },
    headerClickHandler: function (e) {
        var $th = $(e.target).closest('th.app-datagrid-header-cell'),
            id = $th.attr('data-col-id');
        //Closing the popovers if any present when clicked on header or while sorting
        this.closePopover();
        this.options.onHeaderClick(this.preparedHeaderData[id], e);
    },
    /* Handles column selection. */
    columnSelectionHandler: function (e, $headerCell) {
        if (e) {
            e.stopImmediatePropagation();
        }
        var $th = e ? $(e.target).closest('th.app-datagrid-header-cell') : $headerCell,
            id = $th.attr('data-col-id'),
            colDef = this.preparedHeaderData[id],
            field = colDef.field,
            selector = 'td[data-col-id="' + id + '"]',
            $column = this.gridElement.find(selector),
            selected = $column.data('selected') || false,
            colInfo = {
                colDef: colDef,
                data: this.options.data.map(function (data) {
                    return data[field];
                }),
                sortDirection: this._getColumnSortDirection(colDef.field)
            },
            selectedClass = this.options.cssClassNames.selectedColumn;
        selected = !selected;
        colDef.selected = selected;
        $column.data('selected', selected);

        if (selected) {
            $column.addClass(selectedClass);
            $th.addClass(selectedClass);
            if ($.isFunction(this.options.onColumnSelect) && e) {
                this.options.onColumnSelect(colInfo, e);
            }
        } else {
            $column.removeClass(selectedClass);
            $th.removeClass(selectedClass);
            if ($.isFunction(this.options.onColumnDeselect) && e) {
                this.options.onColumnDeselect(colInfo, e);
            }
        }
    },
    getTextValue: function (fieldName, alwaysNewRow) {
        return this.options.getFieldValue(alwaysNewRow ? fieldName + '_new' : fieldName);
    },
    getUploadedFiles: function ($el, fieldName) {
        return _.get(document.forms, [$el.find('form').attr('name'), fieldName, 'files', 0]);
    },
    isDataModified: function ($editableElements, rowData, alwaysNewRow) {
        var isDataChanged = false,
            self = this;

        function getEpoch(val) {
            return val ? moment(val).valueOf() : val;
        }

        $editableElements.each(function () {
            var $el = $(this),
                colId = $el.attr('data-col-id'),
                colDef = self.preparedHeaderData[colId],
                text = self.getTextValue(colDef.field, alwaysNewRow),
                originalData = _.get(rowData, colDef.field);
            if (colDef.editWidgetType === 'upload') {
                //For upload widget, check if any file is uploaded
                isDataChanged = self.getUploadedFiles($el, colDef.field) instanceof File;
            } else {
                //If new value and old value are not defined, then data is not changed
                if (!self.Utils.isDefined(text) && (originalData === null || originalData === undefined)) {
                    isDataChanged = false;
                } else {
                    //For datetime, compare the values in epoch format
                    if (colDef.editWidgetType === 'datetime') {
                        isDataChanged = !(getEpoch(originalData) === getEpoch(text));
                    } else {
                        isDataChanged = !(originalData == text);
                    }
                }
            }
            if (isDataChanged) {
                return !isDataChanged;
            }
        });
        return isDataChanged;
    },
    //Focus the active row
    focusActiveRow: function () {
        this.gridBody.find('tr.app-datagrid-row.active').focus();
    },
    focusNewRow: function () {
        var newRow = this.gridBody.find('tr.always-new-row');
        var newRowInputs = newRow && newRow.find("input") || [];
        newRowInputs.length && newRowInputs[0].focus();
    },
    disableActions: function (val) {
        var $deleteBtns = this.gridBody.find('.delete-row-button'),
            $editBtns = this.gridBody.find('.edit-row-button');
        if (val) {
            //Disable edit and delete actions while editing a row
            $editBtns.addClass('disabled-action');
            $deleteBtns.addClass('disabled-action');
        } else {
            $editBtns.removeClass('disabled-action');
            $deleteBtns.removeClass('disabled-action');
        }
    },
    //Function to the first input element in a row
    setFocusOnElement: function (e, $el, skipDelay) {
        var $firstEl,
            $target = e && $(e.target),
            $focusEl;
        //If focused directly on the cell, focus the input in the cell
        if ($target && $target.hasClass('app-datagrid-cell')) {
            $firstEl = $target.find('input');
        } else {
            if (!$el) {
                $el = $target.closest('tr.app-datagrid-row').find('td.cell-editing');
            } else if ($el.hasClass('app-datagrid-row')) {
                $el = $el.find('td.cell-editing');
            }

            $firstEl = $($el).first().find('input');
            if (!$firstEl.length) {
                $firstEl = $($el).first().find('textarea');
            }
            if (!$firstEl.length) {
                $firstEl = $($el).first().find('select');
            }
        }
        //Focus and select the first element
        if ($firstEl.length) {
            $focusEl = $firstEl.first();
            if (skipDelay) {
                $focusEl.focus();
                $focusEl.select();
            } else {
                this.options.timeoutCall(function () {
                    $focusEl.focus();
                    $focusEl.select();
                });
            }
        }
    },
    removeNewRow: function ($row) {
        this.disableActions(false);
        this._setGridEditMode(false);

        //Don't remove the always new row
        if ($row.hasClass('always-new-row')) {
            return;
        }

        $row.attr('data-removed', true);
        $row.remove();
        if (!this.preparedData.length) {
            this.setStatus('nodata', this.dataStatus.nodata);
        }
        this.addOrRemoveScroll();
    },
    //Method to save a row which is in editable state
    saveRow: function (callBack) {
        this.gridBody.find('tr.app-datagrid-row.row-editing:not(.always-new-row)').each(function () {
            $(this).trigger('click', [undefined, {action: 'save', skipSelect: true, noMsg: true, success: callBack}]);
        });
    },
    //Method to make row editable with widgets
    makeRowEditable: function ($row, rowData, alwaysNewRow) {
        var self = this,
            $originalElements = $row.find('td.app-datagrid-cell'),
            rowId = parseInt($row.attr('data-row-id'), 10),
            $editableElements,
            _rowData = _.clone(rowData);

        _rowData.$index = rowId + 1;

        this.options.generateInlineEditRow(_rowData, alwaysNewRow);

        $originalElements.each(function () {
            var $el = $(this),
                cellText = $el.text(),
                id = $el.attr('data-col-id'),
                colDef = self.preparedHeaderData[id],
                value,
                editableTemplate;

            if (!colDef.readonly) {
                value = _.get(rowData, colDef.field);
                editableTemplate = self.options.getInlineEditWidget(colDef.field, value, alwaysNewRow);
                if (!(colDef.customExpression || colDef.formatpattern)) {
                    $el.addClass('cell-editing').html(editableTemplate).data('originalText', cellText);
                } else {
                    $el.addClass('cell-editing editable-expression').data('originalValue', {
                        'rowIndex': rowId,
                        'fieldName': colDef.field
                    });
                    $el.addClass('cell-editing editable-expression').html(editableTemplate).data('originalText', cellText);
                }
                $el.addClass('form-group');
                if (colDef.required) {
                    $el.addClass('required-field');
                }
            }
        });

        $editableElements = $row.find('td.cell-editing');
        $editableElements.on('click', function (e) {
            e.stopPropagation();
        });
        $editableElements.on('keydown', function (e) {
            //To prevent up and down arrows, navigating to other rows in edit mode
            if (e.which === 38 || e.which === 40) {
                e.stopPropagation();
            }
        });
    },
    _isNewRow: function ($row) {
        var rowId = parseInt($row.attr('data-row-id'), 10);
        return rowId >= this.preparedData.length || $row.hasClass('always-new-row');
    },
    /* Toggles the edit state of a row. */
    toggleEditRow: function (e, options) {
        options = options || {};
        if (e) {
            e.stopPropagation();
        }
        //Closing the popovers if clicked on any row for Quick edit
        this.closePopover();
        var $row = options.$row || $(e.target).closest('tr.app-datagrid-row'),
            $editButton = $row.find('.edit-row-button'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            $deleteButton = $row.find('.delete-row-button'),
            rowData = _.cloneDeep(this.options.data[$row.attr('data-row-id')]) || {},
            self = this,
            action,
            isNewRow,
            $editableElements,
            isDataChanged = false,
            isValid,
            $requiredEls,
            alwaysNewRow = $row.hasClass('always-new-row'),
            advancedEdit = self.options.editmode === self.CONSTANTS.QUICK_EDIT,
            editOptions = {};

        //On success of update or delete
        function onSaveSuccess(skipFocus, error) {
            if ($.isFunction(options.success)) {
                options.success(skipFocus, error);
            }
            if (!advancedEdit || self.options.actionsEnabled.edit) {
                self.focusActiveRow();
            }
        }

        if ($row.attr('data-removed') === 'true') {
            //Even after removing row, focus out is triggered and edit is called. In this case, return here
            return;
        }
        //Select the current edited row
        if (options.selectRow) {
            this.selectRow(rowData, true);
        }
        e = e || {};
        e.data = e.data || {};
        action = e.data.action || options.action;
        if (action === 'edit') {
            if (advancedEdit && self.gridBody.find('tr.app-datagrid-row.row-editing:not(.always-new-row)').length) {
                //In case of advanced edit, save the previous row
                self.saveRow(function (skipFocus, error) {
                    self.editSuccessHandler(skipFocus, error, e, $row, true);
                });
                return;
            }
            $row.addClass('row-editing');
            if ($.isFunction(this.options.beforeRowUpdate)) {
                this.options.beforeRowUpdate(rowData, e);
            }

            if (self.options.editmode === self.CONSTANTS.FORM || self.options.editmode === self.CONSTANTS.DIALOG) {
                return;
            }
            //For new operation, set the rowdata from the default values
            if (options.operation === 'new') {
                self.setDefaultRowData(rowData);
            }
            //Event for on before form render. User can update row data here.
            if ($.isFunction(this.options.onBeforeFormRender)) {
                isValid = this.options.onBeforeFormRender(rowData, e, options.operation || action);
                if (isValid === false) {
                    return;
                }
            }
            this._setGridEditMode(true);
            this.disableActions(true);
            $deleteButton.removeClass('disabled-action');
            this.options.runInNgZone(function () {
                self.makeRowEditable($row, rowData);
            });
            // Show editable row.
            $editButton.addClass('hidden');
            $cancelButton.removeClass('hidden');
            $saveButton.removeClass('hidden');
            $editableElements = $row.find('td.cell-editing');
            if (!options.skipFocus && $editableElements) {
                this.options.timeoutCall(function () {
                    self.setFocusOnElement(e, $editableElements);
                });
            }
            //Event for on before form render. User can access form widgets here.
            if ($.isFunction(this.options.onFormRender)) {
                this.options.onFormRender($row, e, options.operation || action, $row.hasClass('always-new-row'));
            }
        } else {
            $editableElements = $row.find('td.cell-editing');
            isNewRow = self._isNewRow($row);
            if (action === 'save') {

                if (isNewRow) {
                    isDataChanged = true;
                } else {
                    isDataChanged = this.isDataModified($editableElements, rowData, alwaysNewRow);
                }

                if (isDataChanged) {
                    $editableElements.each(function () {
                        var $el = $(this),
                            colId = $el.attr('data-col-id'),
                            colDef = self.preparedHeaderData[colId],
                            fields = _.split(colDef.field, '.'),
                            text;
                        text = self.getTextValue(colDef.field, alwaysNewRow);
                        if (fields.length === 1 && colDef.editWidgetType === 'upload') {
                            _.set(rowData, colDef.field, self.getUploadedFiles($el, colDef.field));
                        } else {
                            text = ((fields.length === 1 || isNewRow) && text === '') ? undefined : text; //Set empty values as undefined
                            if (self.Utils.isDefined(text)) {
                                text = text === 'null' ? null : text; //For select, null is returned as string null. Set this back to ull
                                if (text === null) {
                                    if (fields.length > 1) {
                                        _.set(rowData, fields[0], text); //For related fields, set the object to null
                                    } else {
                                        if (!isNewRow) {
                                            _.set(rowData, colDef.field, ''); //Set to empty for normal fields
                                        }
                                    }
                                } else {
                                    _.set(rowData, colDef.field, text);
                                }
                            } else {
                                //Set undefined while editing the rows
                                if (fields.length === 1 && !isNewRow) {
                                    _.set(rowData, colDef.field, text);
                                }
                            }
                        }
                    });

                    $requiredEls = $editableElements.find('.ng-invalid');
                    //If required fields are present and value is not filled, return here
                    if ($requiredEls.length > 0) {
                        $requiredEls.each(function (index) {
                            var $invalidTd = $(this).closest('td.app-datagrid-cell');
                            if (index === 0) {
                                $invalidTd.find('[focus-target]').focus();
                            }
                            self.options.setTouched($invalidTd.find('[formcontrolname]').attr('formcontrolname'));
                        });
                        if ($.isFunction(options.success)) {
                            options.success(false, true);
                        }
                        return;
                    }

                    if (isNewRow && advancedEdit && _.isEmpty(rowData)) {
                        self.removeNewRow($row);
                        if ($.isFunction(options.success)) {
                            options.success(false, undefined, true);
                        }
                        return;
                    }

                    if (isNewRow) {
                        if ($.isFunction(this.options.onBeforeRowInsert)) {
                            isValid = this.options.onBeforeRowInsert(rowData, e, editOptions);
                            if (isValid === false) {
                                return;
                            }
                        }
                        this.options.onRowInsert(rowData, e, onSaveSuccess, editOptions);
                    } else {
                        if ($.isFunction(this.options.onBeforeRowUpdate)) {
                            isValid = this.options.onBeforeRowUpdate(rowData, e, editOptions);
                            if (isValid === false) {
                                return;
                            }
                        }
                        this.options.afterRowUpdate(rowData, e, onSaveSuccess, editOptions);
                    }
                } else {
                    this.cancelEdit($row);
                    if (!options.noMsg) {
                        this.options.noChangesDetected();
                    }
                    if ($.isFunction(options.success)) {
                        options.success(false);
                    }
                }
            } else {
                if (isNewRow) {
                    self.removeNewRow($row);
                    return;
                }
                // Cancel edit.
                this.cancelEdit($row);
            }
        }
        this.addOrRemoveScroll();
    },
    cancelEdit: function ($row) {
        var self = this,
            $editableElements = $row.find('td.cell-editing'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            $editButton = $row.find('.edit-row-button');
        this.disableActions(false);
        $row.removeClass('row-editing');
        $editableElements.off('click');
        $editableElements.each(function () {
            var $el = $(this),
                value = $el.data('originalValue');
            $el.removeClass('datetime-wrapper cell-editing required-field form-group');
            if (!value) {
                $el.text($el.data('originalText') || '');
            } else {
                $el.html(self.options.getCustomExpression(value.fieldName, value.rowIndex));
            }
        });
        $editButton.removeClass('hidden');
        $cancelButton.addClass('hidden');
        $saveButton.addClass('hidden');
        this._setGridEditMode(false);
    },
    //Function to close the current editing row
    closeEditedRow: function () {
        var $row = this.gridBody.find('tr.app-datagrid-row.row-editing');
        if ($row.length) {
            //If new row, remove the row. Else, cancel the row edit
            if (this._isNewRow($row)) {
                this.removeNewRow($row);
            } else {
                this.cancelEdit($row);
            }
        }
    },
    hideRowEditMode: function ($row) {
        var $editableElements = $row.find('td.cell-editing'),
            $editButton = $row.find('.edit-row-button'),
            $cancelButton = $row.find('.cancel-edit-row-button'),
            $saveButton = $row.find('.save-edit-row-button'),
            self = this;
        $row.removeClass('row-editing');
        $editableElements.off('click');
        this.disableActions(false);
        this._setGridEditMode(false);
        $editableElements.each(function () {
            var $el = $(this),
                value = $el.data('originalValue'),
                text,
                colDef;
            $el.removeClass('datetime-wrapper cell-editing required-field form-group');
            if (!value) {
                colDef = self.preparedHeaderData[$el.attr('data-col-id')];
                text = self.getTextValue(colDef.field);
                $el.text(self.Utils.isDefined(text) ? text : '');
            } else {
                $el.html(self.options.getCustomExpression(value.fieldName, value.rowIndex));
            }
        });
        $editButton.removeClass('hidden');
        $cancelButton.addClass('hidden');
        $saveButton.addClass('hidden');
        this.addOrRemoveScroll();
    },
    /* Deletes a row. */
    deleteRow: function (e) {
        e.stopPropagation();
        var $row = $(e.target).closest('tr.app-datagrid-row'),
            rowId = $row.attr('data-row-id'),
            rowData = this.options.data[rowId],
            isNewRow = this._isNewRow($row),
            className,
            isActiveRow,
            isValid,
            options = {},
            self = this;
        if ($.isFunction(this.options.beforeRowDelete)) {
            this.options.beforeRowDelete(rowData, e);
        }
        if (isNewRow) {
            this.disableActions(false);
            this._setGridEditMode(false);
            $row.attr('data-removed', true);
            $row.remove();
            if (!this.preparedData.length) {
                //On delete of a new row with no data, show no data message
                this.setStatus('nodata', this.dataStatus.nodata);
            }
            this.addOrRemoveScroll();
            return;
        }
        /* calling onbeforerowDelete callback function.*/
        if($.isFunction(this.options.onBeforeRowDelete)) {
            isValid = this.options.onBeforeRowDelete(rowData, e, options);
            if (isValid === false) {
                return;
            }
        }
        if ($.isFunction(this.options.onRowDelete)) {
            className = this.options.cssClassNames.deleteRow;
            isActiveRow = $row.attr('class').indexOf('active') !== -1;
            if (isActiveRow) {
                $row.removeClass('active');
            }
            $row.addClass(className);
            this.options.onRowDelete(rowData, function () {
                if (isActiveRow) {
                    $row.addClass('active');
                }
                $row.removeClass(className);
                self.addOrRemoveScroll();
            }, e, function (skipFocus, error) {
                //For quick edit, on clicking of delete button or DELETE key, edit the next row
                if (self.options.editmode !== self.CONSTANTS.QUICK_EDIT || !($(e.target).hasClass('delete-row-button') || self.Utils.isDeleteKey(e))) {
                    return;
                }
                //Call set status, so that the rows are visible for fom operations
                self.__setStatus();
                var rowID,
                    $nextRow;
                if (error) {
                    return;
                }
                //On success, Focus the next row. If row is not present, focus the previous row
                rowID = +$(e.target).closest('tr.app-datagrid-row').attr('data-row-id');
                $nextRow = self.gridBody.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');
                if (!$nextRow.length) {
                    $nextRow = self.gridBody.find('tr.app-datagrid-row[data-row-id="' + (rowID - 1) + '"]');
                }
                $nextRow.trigger('click', [undefined, {action: 'edit', skipFocus: skipFocus}]);
            }, options);
        }
    },

    /* Deletes a row and updates the header checkbox if multiselect is true. */
    deleteRowAndUpdateSelectAll: function (e) {
        this.deleteRow(e);
        this.updateSelectAllCheckboxState();
    },

    /* Keeps a track of the currently selected row, and deselects the previous row, if multiselect is false. */
    _deselectPreviousSelection: function ($row, e) {
        var selectedRows = this.gridBody.find('tr.app-datagrid-row.active'),
            rowId = $row.attr('data-row-id'),
            self = this;
        selectedRows.each(function () {
            var id = $(this).attr('data-row-id'),
                preparedData = self.preparedData[id];
            if (id !== rowId && preparedData) {
                $(this).find('input[rowSelectInput]:radio').prop('checked', false);
                preparedData.selected = preparedData.checked = false;
                $(this).removeClass('active');
                self.options.callOnRowDeselectEvent(preparedData, e);
            }
        });
    },
    //Method to remove sort icons from the column header cells
    resetSortIcons: function ($el) {
        var $sortContainer;
        //If sort icon is not passed, find out the sort icon from the active class
        if (!$el && this.gridHeader) {
            $sortContainer = this.gridHeader.find('.sort-buttons-container.active');
            $el = $sortContainer.find('i.sort-icon');
            $sortContainer.removeClass('active');
        }
        $el.removeClass('desc asc').removeClass(this.options.cssClassNames.descIcon).removeClass(this.options.cssClassNames.ascIcon);
    },
    /* Handles table sorting. */
    sortHandler: function (e) {
        e.stopImmediatePropagation();
        // If header span is clicked and column selection is enabled, call header click
        if ($(e.target).hasClass('header-data') && this.options.enableColumnSelection) {
            this.headerClickHandler(e);
        }
        var $e = $(e.target),
            $th = $e.closest('th.app-datagrid-header-cell'),
            id = $th.attr('data-col-id'),
            $sortContainer = $th.find('.sort-buttons-container'),
            $sortIcon = $sortContainer.find('i.sort-icon'),
            direction = $sortIcon.hasClass('asc') ? 'desc' : $sortIcon.hasClass('desc') ? '' : 'asc',
            sortInfo = this.options.sortInfo,
            $previousSortMarker = this.gridHeader.find('.sort-buttons-container.active'),
            field = $th.attr('data-col-field'),
            $previousSortedColumn,
            $previousSortIcon,
            colId,
            colDef;
        this.resetSortIcons($sortIcon);
        $sortIcon.addClass(direction);
        //Add the classes based on the direction
        if (direction === 'asc') {
            $sortIcon.addClass(this.options.cssClassNames.ascIcon);
            $sortContainer.addClass('active');
        } else if (direction === 'desc') {
            $sortIcon.addClass(this.options.cssClassNames.descIcon);
            $sortContainer.addClass('active');
        }
        if ($previousSortMarker.length) {
            //Reset the previous sorted column icons and info
            $previousSortedColumn = $previousSortMarker.closest('th.app-datagrid-header-cell');
            colId = $previousSortedColumn.attr('data-col-id');
            colDef = this.preparedHeaderData[colId];
            $previousSortIcon = $previousSortMarker.find('i.sort-icon');
            if (colDef.field !== field) {
                $previousSortMarker.removeClass('active');
                this.resetSortIcons($previousSortIcon);
            }
            colDef.sortInfo = {'sorted': false, 'direction': ''};
        }
        sortInfo.direction = direction;
        sortInfo.field = field;
        if (direction !== '') {
            this.preparedHeaderData[id].sortInfo = {'sorted': true, 'direction': direction};
        }
        this._setGridEditMode(false);
        this.closeEditedRow();
        this.options.sortHandler.call(this, this.options.sortInfo, e, 'sort');
    },
    //Method to handle up and next key presses
    processUpDownKeys: function (event, $row, direction) {
        var self = this;
        if ($row.hasClass('row-editing') && self.options.editmode === self.CONSTANTS.QUICK_EDIT) {
            self.toggleEditRow(event, {
                'action': 'save',
                'noMsg': true,
                'success': function (skipFocus, error) {
                    self.editSuccessHandler(skipFocus, error, event, $row, true, direction);
                }
            });
        } else {
            $row = direction === 'down' ? $row.next() : $row.prev();
            if (this.options.rowExpansionEnabled && !$row.is(':visible')) {
                $row = direction === 'down' ? $row.next() : $row.prev();
            }
            $row.focus();
        }
    },
    //Reset new row data
    resetNewRow: function ($row) {
        var rowData = {},
            self = this;

        this.options.clearForm(true);

        self.setDefaultRowData(rowData);

        //Set the default values for widgets in the row
        $row.find('[data-field-name]').each(function () {
            var $input = $(this),
                fieldName = $input.attr('data-field-name') + '_new';
            self.options.setFieldValue(fieldName, rowData[$input.attr('data-field-name')] || '')
        });
        self.options.safeApply();
        self.setFocusOnElement(undefined, $row, true);
    },
  _onEnter: function ($target, $row, quickEdit, event) {
        var self = this;
        if($target.is('button')){
          return;
        }
        if (quickEdit && $target.hasClass('app-datagrid-row') && !$target.hasClass('row-editing')) {
          $row.trigger('click', [undefined, {action: 'edit'}]);
        } else {
          //On click of enter while inside a widget in editing row, save the row
          if ($row.hasClass('row-editing') && $target.closest('[data-field-name]').length) {
            $target.blur(); //Blur the input, to update the model
            self.toggleEditRow(event, {
              'action': 'save',
              'success': function (skipFocus, error) {
                //On error, focus the same field. Else, focus the row
                if (error) {
                  $target.focus();
                } else {
                        self.focusActiveRow();
                        self.focusNewRow();
                }
              }
            });
          } else {
            $row.trigger('click');
          }
        }
        //Stop the enter keypress from submitting any parent form. If target is button, event should not be stopped as this stops click event on button
        if (!$target.is('button')) {
          event.stopPropagation();
        }
      },
    // Handles keydown event on row items.
    onKeyDown: function (event) {
        var $target = $(event.target),
            $row = $target.closest('tr.app-datagrid-row'),
            self = this,
            quickEdit = this.options.editmode === this.CONSTANTS.QUICK_EDIT,
            isNewRow;
        if (this.options.rowExpansionEnabled && !$row.length) {
            $row = $target.closest('tr.app-datagrid-detail-row')
        }

        if (this.Utils.isDeleteKey(event)) { //Delete Key
            //For input elements, dont delete the row. If delete button is not present, dont allowe deleting by keyboard shortcut
            if (!this.options.actionsEnabled.delete || $target.is('input') || $target.hasClass('form-control')) {
                return;
            }
            this.deleteRow(event);
            return;
        }
        if (event.which === 27) { //Escape key
            isNewRow = this._isNewRow($row);
            //On Escape, cancel the row edit
            if (isNewRow && $row.hasClass('always-new-row')) {
                $target.blur();
                self.resetNewRow($row);
            } else {
                $row.trigger('click', [undefined, {action: 'cancel'}]);
            }

            if (!isNewRow) {
                $row.focus();
            }
            return;
        }
        if (event.which === 13) { //Enter key
            event.stopPropagation();
            this._debounceOnEnter($target, $row, quickEdit, event);
            return;
        }
        if (event.which === 38) { // up-arrow action
            this.processUpDownKeys(event, $row, 'up');
            return;
        }
        if (event.which === 40) { // down-arrow action
            this.processUpDownKeys(event, $row, 'down');
        }
    },
    editSuccessHandler: function (skipFocus, error, e, $row, isSameRow, direction) {
        var self = this,
            rowID,
            $nextRow;
        //Call set status, so that the rows are visible for fom operations
        self.__setStatus();
        //On error, focus the current row first element
        if (error) {
            self.setFocusOnElement(e);
            return;
        }
        //On success, make next row editable. If next row is not present, add new row
        rowID = +$row.attr('data-row-id');
        if (direction) {
            rowID = direction === 'down' ? ++rowID : --rowID;
            $nextRow = self.gridBody.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');
            if ($nextRow.length) {
                $nextRow.focus();
            } else {
                $row.focus();
            }
            return;
        }
        if (!isSameRow) {
            rowID++;
        }
        $nextRow = self.gridBody.find('tr.app-datagrid-row[data-row-id="' + rowID + '"]');

        //For always new row, dont trigger the edit action
        if ($nextRow.hasClass('always-new-row')) {
            if (self.options.formPosition !== 'top' || $row.hasClass('always-new-row')) {
                self.addNewRow(skipFocus);
            }
        } else if ($nextRow.length) {
            $nextRow.trigger('click', [undefined, {
                action: 'edit',
                skipFocus: skipFocus,
                skipSelect: self.options.multiselect
            }]);
        } else if (self.options.actionsEnabled.new) {
            self.addNewRow(skipFocus);
        }
    },
    //Method to check if the docus is on last column
    isLastColumn: function ($target) {
        var $cell = $target.closest('td.app-datagrid-cell'),
            $editCells;

        if ($cell.is(':last-child')) {
            return true;
        }

        if ($cell.hasClass('cell-editing')) {
            //Find and compare the last editable column which is not disabled
            $editCells = $cell.closest('tr.app-datagrid-row').find('.cell-editing').has('> :not([disabled="disabled"])');
            return $cell.attr('data-col-id') === $editCells.last().attr('data-col-id');
        }
        return false;
    },
    /* Attaches all event handlers for the table. */
    attachEventHandlers: function ($htm) {
        var $header = this.gridHeader,
            self = this;

        if (this.options.enableRowSelection) {
            // add js click handler for capture phase in order to first listen on grid and
            // assign selectedItems so that any child actions can have access to the selectedItems.
            $htm[0].addEventListener('click', this.rowClickHandlerOnCapture.bind(this), true);
            $htm.on('click', this.rowSelectionHandler.bind(this));
            $htm.on('dblclick', this.rowDblClickHandler.bind(this));
            $htm.on('keydown', this.onKeyDown.bind(this));
        }

        if ($header) {
            if (this.options.enableColumnSelection) {
                $header.find('th[data-col-selectable]').on('click', this.columnSelectionHandler.bind(this));
            } else {
                $header.find('th[data-col-selectable]').off('click');
            }

            if (this.options.enableSort) {
                if (this.options.enableColumnSelection) {
                    $header.find('th[data-col-sortable] .header-data').on('click', this.sortHandler.bind(this));
                } else {
                    $header.find('th[data-col-sortable]').on('click', this.sortHandler.bind(this));
                }
            } else {
                if (this.options.enableColumnSelection) {
                    $header.find('th[data-col-sortable] .header-data').off('click');
                } else {
                    $header.find('th[data-col-sortable]').off('click');
                }
            }
        }
        if (this.options.rowActions.length) {
            $htm.find('.cancel-edit-row-button').on('click', {action: 'cancel'}, this.toggleEditRow.bind(this));
            $htm.find('.save-edit-row-button').on('click', {action: 'save'}, this.toggleEditRow.bind(this));
        }
        if (self.options.editmode === self.CONSTANTS.QUICK_EDIT) {
            //On tab out of a row, save the current row and make next row editable
            $htm.on('focusout', 'tr.app-datagrid-row', function (e) {
                var $target = $(e.target),
                    $row = $target.closest('tr.app-datagrid-row'),
                    $relatedTarget = $(e.relatedTarget),
                    isLastColumn = self.isLastColumn($target, $relatedTarget),
                    isTargetRowAction = $target.closest('span.actions-column').length>0,
                    isRelatedTargetRowAction = $relatedTarget.closest('span.actions-column').length>0,
                    isTargetGridAction = $relatedTarget.closest('div.app-datagrid-actions').length>0,
                    isRelatedTargetGridAction = $relatedTarget.closest('div.app-datagrid-actions').length>0,
                    invalidTargets = '.row-editing:not(".always-new-row"), .row-action-button, .app-datagrid-cell, .caption, button.btn-time, button.btn-date';

                //Check if the focus out element is outside the grid or some special elements
                function isInvalidTarget() {
                    if (!$relatedTarget.closest('.app-grid').length) {
                        return true;
                    }
                    return $relatedTarget.is(invalidTargets);
                }

                //If focus is on the same row, return here
                if ($relatedTarget.is('tr.app-datagrid-row')) {
                    if ($relatedTarget.attr('data-row-id') === $row.attr('data-row-id')) {
                        return;
                    }
                }
                // If class has danger, confirm dialog is opened, so dont save the row.
                 //If focusout is because of input element or row action or current row, dont save the row
                if (isRelatedTargetRowAction || $row.hasClass("danger") || isRelatedTargetGridAction || (isTargetRowAction && isRelatedTargetRowAction) || (isTargetRowAction && e.relatedTarget ===null) || isInvalidTarget() || $relatedTarget.attr("focus-target") === "") {
                    return;
                }
                // Save the Row if any button from Grid action is clicked / AddRow action is
                // triggered from the Row Actions
                if (!isTargetGridAction && !isTargetRowAction) {
                    //Save the row on last column of the data table. Do not save the row if focus is out of input file.
                    if (!isLastColumn || (isLastColumn && e.relatedTarget === null) || $target.hasClass("file-upload")) {
                        return;
                    }
                }
                self.options.timeoutCall(function () {
                    self.toggleEditRow(e, {
                        'action': 'save',
                        'noMsg': true,
                        'success': function (skipFocus, error, isNewRow) {
                            if (!isNewRow) {
                                self.editSuccessHandler(skipFocus, error, e, $row);
                            }
                        }
                    });
                });
            });
        }

        // row selection
        $htm.find('[data-identifier="rowExpansionButtons"]').on('click', function (e) {
            var $row = $(e.target).closest('tr.app-datagrid-row');
            if ($(this).find('.app-button').attr('disabled')) {
                return;
            }
            self.toggleExpandRow(+$row.attr('data-row-id'), undefined, e);
        });
    },
    expandRow: function(rowId) {
        this.toggleExpandRow(rowId, true)
    },
    collapseRow: function(rowId) {
        this.toggleExpandRow(rowId, false)
    },
    _collapseRow: function(e, rowData, rowId, $nextDetailRow, $icon) {
        if (this.options.onBeforeRowCollapse(e, rowData, rowId) === false) {
            return;
        }
        if ($icon.length && $icon.hasClass(this.options.cssClassNames.rowExpandIcon)) {
            $icon.removeClass(this.options.cssClassNames.rowExpandIcon).addClass(this.options.cssClassNames.rowCollapseIcon);
        }
        $nextDetailRow.hide();
        this.options.onRowCollapse(e, rowData)
    },
    toggleExpandRow: function(rowId, isExpand, e) {
        var self = this,
            $tbody = self.gridElement.find('> .app-datagrid-body'),
            $row = $($tbody.find('> tr.app-datagrid-row[data-row-id="'+ rowId +'"]')),
            rowData = _.clone(self.options.data[rowId]),
            $nextDetailRow = $row.next('tr.app-datagrid-detail-row'),
            isClosed = !$nextDetailRow.is(':visible'),
            $icon = $row.find('[data-identifier="rowExpansionButtons"] i.app-icon');

        rowData.$index = rowId + 1;
        if (isExpand && !isClosed) {
            return;
        }
        if (isExpand === false && isClosed) {
            return;
        }
        if (isClosed) {
            if (e && self.preparedData[rowId].selected) {
                e.stopPropagation();
            }
            if (self.options.rowDef.closeothers) {
                $tbody.find('> tr.app-datagrid-detail-row:visible').each(function() {
                    var $otherDetailRow = $(this),
                        $otherIcon = $otherDetailRow.prev('tr.app-datagrid-row').find('[data-identifier="rowExpansionButtons"] i.app-icon'),
                        otherRowId = +$otherDetailRow.attr('data-row-id'),
                        otherRowData = self.options.data[otherRowId];
                    $otherDetailRow.hide();
                    self._collapseRow(e, otherRowData, otherRowId, $otherDetailRow, $otherIcon);
                });
            }
            self.options.generateRowDetailView(e, rowData, rowId, $nextDetailRow.find('td.app-datagrid-row-details-cell .details-section'),
                $nextDetailRow.find('td.app-datagrid-row-details-cell .row-overlay'), function () {
                    if ($icon.length && $icon.hasClass(self.options.cssClassNames.rowCollapseIcon)) {
                        $icon.removeClass(self.options.cssClassNames.rowCollapseIcon).addClass(self.options.cssClassNames.rowExpandIcon);
                    }
                    $nextDetailRow.show();
                });
        } else {
            self._collapseRow(e, rowData, rowId, $nextDetailRow, $icon);
        }
    },
    /* Replaces all the templates needing angular compilation with the actual compiled templates. */
    _findAndReplaceCompiledTemplates: function () {
        if (!this.gridBody) {
            return;
        }
        var $compiledCells = this.gridBody.find('td[data-compiled-template]'),
            self = this;

        $compiledCells.each(function () {
            var $cell = $(this),
                id = $cell.attr('data-compiled-template');

            $cell.replaceWith(self.compiledCellTemplates[id]);
        });
    },

    /* Renders the search box. */
    _renderSearch: function () {
        var $htm = $(this._getSearchTemplate()),
            self = this,
            $searchBox;

        function search(e) {
            e.stopPropagation();
            var searchText = $htm.find('[data-element="dgSearchText"]')[0].value,
                $filterField = $htm.find('[data-element="dgFilterValue"]'),
                field = $filterField[0].value,
                colDefIndex = $htm.find('option:selected').attr('data-coldef-index'),
                colDef = self.options.colDefs[colDefIndex],
                type = colDef && colDef.type ? colDef.type : '';

            self.searchObj = {
                'field': field,
                'value': searchText,
                'type': type,
                'event': e
            };
            self.options.searchHandler.call(self, self.searchObj, e, 'search');
        }

        this.element.find('.form-search').remove();
        $htm.insertBefore(this.gridContainer);
        this.gridSearch = this.element.find('.form-search');

        $searchBox = this.gridSearch.find('[data-element="dgSearchText"]');
        this.gridSearch.find('.app-search-button').on('click', search);
        this.gridSearch.find('[data-element="dgFilterValue"]').on('change', function (e) {
            // If "No data found" message is shown, and user changes the selection, then fetch all data.
            if (self.dataStatusContainer.find('.status').text() === self.options.dataStates.nodata) {
                search(e);
            }
        });
        $searchBox.on('keyup', function (e) {
            e.stopPropagation();
            // If the search text is empty then show all the rows.
            if (!$(this).val()) {
                if (self.searchObj.value) {
                    self.searchObj.value = '';
                    search(e);
                }
            }
            /* Search only when enter key is pressed. */
            if (e.which === 13) {
                search(e);
            }
        });
    },
    //Generate the row level filter
    _renderRowFilter: function () {
        var $row = $('<tr class="filter-row"></tr>'),
            self = this,
            $headerElement = (this.options.isMobile && !this.options.showHeader) ? this.gridElement : this.gridHeaderElement;
        $headerElement.find('.filter-row').remove();
        this.options.generateFilterRow();
        this.preparedHeaderData.forEach(function (field, index) {
            var fieldName = field.field,
                $th = $('<th data-col-id="' + index + '"></th>');
            if (!field.searchable) {
                $row.append($th);
                return;
            }
            $th.append(self.options.getFilterWidget(fieldName));
            $row.append($th);
        }, this);
        if (this.options.showHeader) {
            this.gridHeader.append($row);
        } else {
            if (this.options.isMobile) {
                $headerElement.append($('<thead></thead>').append($row));
            } else {
                $headerElement.append('<thead></thead>').append($row);
            }
        }
        this.gridSearch = $headerElement.find('.filter-row');
    },
    /* Renders the table header. */
    _renderHeader: function () {
        var headerTemplate = this._getHeaderTemplate(),
            $colgroup = headerTemplate.colgroup,
            self = this,
            $header;
        /*On scroll of the content table, scroll the header*/
        this.gridElement.parent().scroll(function () {
            self.gridHeaderElement.parent().prop('scrollLeft', this.scrollLeft);
        });
        if (!this.options.showHeader) {
            this.gridHeaderElement.append($colgroup);
            this.gridElement.prepend($colgroup.clone());
            return;
        }
        $header = headerTemplate.header;

        function toggleSelectAll(e) {
            var $checkboxes = $('tbody tr.app-datagrid-row:visible td input[name="gridMultiSelect"]:checkbox', self.gridElement),
                checked = this.checked;
            $checkboxes.prop('checked', checked);
            $checkboxes.each(function () {
                var $row = $(this).closest('tr.app-datagrid-row'),
                    rowId = $row.attr('data-row-id'),
                    rowData = self.options.data[rowId];
                // If we enable multiselect and check header checkbox then updating selecteditem in datatable.
                self.options.assignSelectedItems(rowData, e);
                self.toggleRowSelection($row, checked, e, true);
                if (checked && $.isFunction(self.options.onRowSelect)) {
                    self.options.onRowSelect(rowData, e);
                }
                if (!checked && $.isFunction(self.options.onRowDeselect)) {
                    self.options.onRowDeselect(rowData, e);
                }
            });
        }

        /*For mobile view, append header to the main table only*/
        if (this.options.isMobile) {
            this.gridElement.append($colgroup).append($header);
            this.gridHeader = this.gridElement.find('thead');
        } else {
            /**Append the colgroup to the header and the body.
             * Colgroup is used to maintain the consistent widths between the header table and body table**/
            this.gridHeaderElement.append($colgroup).append($header);
            /**As jquery references the colgroup, clone the colgroup and add it to the table body**/
            this.gridElement.prepend($colgroup.clone());
            this.gridHeader = this.gridHeaderElement.find('thead');
        }
        /**Add event handler, to the select all checkbox on the header**/
        $header.on('click', '.app-datagrid-header-cell input:checkbox', toggleSelectAll);

        if ($.isFunction(this.options.onHeaderClick)) {
            this.gridHeader.find('th.app-datagrid-header-cell').on('click', this.headerClickHandler.bind(this));
        }

        if (!this.options.isMobile && this.gridHeaderElement.length) {
            this.gridHeaderElement.find('th[data-col-resizable]').resizable({
                handles: 'e',
                minWidth: 50,
                // set COL width
                /* This is needed because if width is initially set on col from coldefs,
                 * then that column was not getting resized.*/
                resize: function (evt, ui) {
                    var $colElement,
                        $colHeaderElement,
                        $cellElements,
                        colIndex = +ui.helper.attr('data-col-id') + 1,
                        originalWidth = ui.helper.width(),
                        newWidth = ui.size.width,
                        originalTableWidth,
                        newTableWidth;
                    $colHeaderElement = self.gridHeaderElement.find('colgroup > col:nth-child(' + colIndex + ')');
                    $colElement = self.gridElement.find('colgroup > col:nth-child(' + colIndex + ')');
                    $cellElements = self.gridElement.find('tr.app-datagrid-row > td:nth-child(' + colIndex + ') > div');
                    $colElement.width(newWidth);
                    $colHeaderElement.width(newWidth);
                    $cellElements.width(newWidth);
                    // height must be set in order to prevent IE9 to set wrong height
                    $(this).css('height', 'auto');
                    /*Adjust the table width only if the column width is increased*/
                    if (newWidth > ui.originalSize.width) {
                        /*Increase or decrease table width on resizing the column*/
                        originalTableWidth = self.gridHeaderElement.width();
                        newTableWidth = originalTableWidth + newWidth - originalWidth;
                        self.gridHeaderElement.width(newTableWidth);
                        self.gridElement.width(newTableWidth);
                    }
                    self.addOrRemoveScroll();
                    self.options.redrawWidgets();
                }
            });
        }
    },
    addOrRemoveScroll: function () {
        var gridContent = this.gridContainer.find('.app-grid-content').get(0),
            gridHeader = this.gridContainer.find('.app-grid-header');
        /*If scroll bar is present on the grid content, add padding to the header*/
        if ((gridContent.scrollHeight > gridContent.clientHeight) && !this.Utils.isMac()) {
            gridHeader.addClass('scroll-visible');
        } else {
            gridHeader.removeClass('scroll-visible');
        }
    },

    //Triggers actual function in scope
    _handleCustomEvents: function (e, options) {
        this.options.handleCustomEvents(e, options);
    },

    //Generates markup for row operations
    _setActionsEnabled: function () {
        var self = this;
        _.forEach(this.options.rowActions, function (def) {
            if (_.includes(def.action, 'editRow(')) {
                self.options.actionsEnabled.edit = true;
            } else if (_.includes(def.action, 'deleteRow(')) {
                self.options.actionsEnabled.delete = true;
            }
        });
    },

    //Appends row operations markup to grid template
    _appendRowActions: function ($htm, isNewRow, rowData) {
        var self,
            rowOperationsCol = this._getRowActionsColumnDef();
        if (this.options.rowActions.length || rowOperationsCol) {
            this._setActionsEnabled();
            self = this;
            $htm.find("[data-identifier='actionButtons']").each(function (index) {
                var _rowData, $row, rowId;
                if (isNewRow) {
                    _rowData = rowData;
                } else {
                    $row = $(this).closest('tr.app-datagrid-row');
                    rowId = parseInt($row.attr('data-row-id'), 10);
                    _rowData = _.clone(self.options.data[rowId]);
                    _rowData.$index = index + 1;
                }
                self.options.generateRowActions(_rowData, index);
                $(this).empty().append(self.options.getRowAction(index));
            });
        }
    },
    /* Renders the table body. */
    _renderGrid: function (isCreated) {
        var $htm = $(this._getGridTemplate());
        this.gridElement.append($htm);
        // Set proper data status messages after the grid is rendered.
        if (!this.options.data.length && this.dataStatus.state === 'nodata') {
            this.setStatus('nodata');
        } else {
            this.dataStatus.state = this.dataStatus.state || 'loading';
            this.dataStatus.message = this.dataStatus.message || this.options.dataStates.loading;
            this.setStatus(this.dataStatus.state, this.dataStatus.message, isCreated);
        }
        this.gridBody = this.gridElement.find('tbody');
        this._findAndReplaceCompiledTemplates();
        this.options.clearRowActions();
        this._appendRowExpansionButtons($htm);
        this._appendRowActions($htm);
        this.attachEventHandlers($htm);
        this.__setStatus(isCreated);
        //Add new row, if always show new row is present for quick edit
        if (this.options.editmode === this.CONSTANTS.QUICK_EDIT && this.options.showNewRow) {
            this.addNewRow(false, true);
        }
        if (isCreated) {
            this._setColSpan(this.options.headerConfig);
        }
        if ($.isFunction(this.options.onDataRender)) {
            this.options.onDataRender();
        }
        if (!isCreated && this.options.selectFirstRow) {
            if (this.options.multiselect) {
                //Set selectFirstRow to false, to prevent first item being selected in next page
                this.options.selectFirstRow = false;
            }
            this.selectFirstRow(true, true);
        }
    },

    /* Renders the table container. */
    _render: function (isCreated) {
        if (!this.tableId) {
            this.tableId = this.Utils.generateGuid();
        }
        var statusContainer =
            '<div class="overlay" style="display: none;">' +
            '<div class="status"><i class="' + this.options.loadingicon + '"></i><span class="message"></span></div>' +
            '</div>',
            table = '<div class="table-container table-responsive"><div class="app-grid-header ' +
                '"><div class="app-grid-header-inner"><table class="' + this.options.cssClassNames.gridDefault + ' ' + this.options.cssClassNames.grid + '" id="table_header_' + this.tableId + '">' +
                '</table></div></div><div class="app-grid-content" style="height:' + this.options.height + ';"><table class="' + this.options.cssClassNames.gridDefault + ' ' + this.options.cssClassNames.grid + '" id="table_' + this.tableId + '">' +
                '</table></div>' +
                '</div>';
        this.gridContainer = $(table);
        this.gridElement = this.gridContainer.find('.app-grid-content table');
        this.gridHeaderElement = this.gridContainer.find('.app-grid-header table');
        // Remove the grid table element.
        this.element.find('.table-container').remove();
        this.element.append(this.gridContainer);
        this.dataStatusContainer = $(statusContainer);
        this.gridContainer.append(this.dataStatusContainer);
        this._renderHeader();
        if (this.options.filtermode === this.CONSTANTS.SEARCH) {
            this._renderSearch();
        } else if (this.options.filtermode === this.CONSTANTS.MULTI_COLUMN) {
            this._renderRowFilter();
        }
        if (this.options.spacing === 'condensed') {
            this._toggleSpacingClasses('condensed');
        }
        this._renderGrid(isCreated);
    },
    __setStatus: function (isCreated) {
        var loadingIndicator = this.dataStatusContainer.find('i'),
            state = this.dataStatus.state;
        this.dataStatusContainer.find('.message').text(this.dataStatus.message);
        if (state === 'loading') {
            loadingIndicator.removeClass('hidden');
        } else {
            loadingIndicator.addClass('hidden');
        }
        if (state === 'ready') {
            this.dataStatusContainer.hide();
        } else {
            this.dataStatusContainer.show();
        }
        if (state === 'nodata' || state === 'loading' || state === 'error') {
            if (this.options.height === '100%' || this.options.height === 'auto') { //If height is auto or 100%, Set the loading overlay height as present grid content height
                if (state === 'nodata') {
                    this.dataStatusContainer.css('height', 'auto');
                    this.dataStatus.contentHeight = 0;
                } else {
                    this.dataStatus.height = this.dataStatus.height || this.dataStatusContainer.outerHeight();
                    this.dataStatus.contentHeight = this.gridElement.outerHeight() || this.dataStatus.contentHeight;
                    this.dataStatusContainer.css('height', this.dataStatus.height > this.dataStatus.contentHeight ? 'auto' : this.dataStatus.contentHeight);
                }
            }
            this.gridContainer.addClass('show-msg');
        } else {
            this.gridContainer.removeClass('show-msg');
            if (!isCreated) {
                this.setColGroupWidths();
            }
        }
        this.addOrRemoveScroll();
    },
    //This method is used to show or hide data loading/ no data found overlay
    setStatus: function (state, message, isCreated) {
        var $newRow;
        //If state is nodata and always new row is present, change state to ready
        if (state === 'nodata') {
            $newRow = this.gridElement && this.gridElement.find('tbody.app-datagrid-body tr.app-datagrid-row.always-new-row');
            state = ($newRow && $newRow.length) ? 'ready' : state;
        }

        this.dataStatus.state = state;
        this.options.setGridState(state);
        this.dataStatus.message = message || this.options.dataStates[state];
        //First time call the status function, afterwards use debounce with 100 ms wait
        if (this._setStatusCalled) {
            this._setStatus(isCreated);
        } else {
            this.__setStatus(isCreated);
            this._setStatusCalled = true;
        }
    },

    setGridDimensions: function (key, value) {
        if (value.indexOf('px') === -1 && value.indexOf('%') === -1 && value.indexOf('em') === -1 && value != 'auto') {
            value = value + 'px';
        }
        this.options[key] = value;
        if (key === 'height') {
            this.gridContainer.find('.app-grid-content').css(key, value);
            this.dataStatusContainer.css(key, value);
        }
        this.addOrRemoveScroll();
    },
    /*Change the column header title. function will be called if display name changes in runmode*/
    setColumnProp: function (fieldName, property, val, isGroup) {
        var $col;
        if (property === 'displayName') {
            if (isGroup) {
                $col = this.gridHeader.find('th[data-col-group="' + fieldName + '"]');
            } else {
                $col = this.gridHeader.find('th[data-col-field="' + fieldName + '"]');
            }
            $col.attr('title', val);
            $col.find('.header-data').html(val);

            //Change the display name in the search filter options
            if (this.options.filtermode === this.CONSTANTS.SEARCH && this.gridSearch) {
                this.gridSearch.find('select option[value="' + fieldName + '"]').text(val);
            }
        }
    },

    applyRowNgClass: function (val, index) {
        var $row = this.gridBody.find('tr.app-datagrid-row[data-row-id="' + index + '"]');
        $row.removeClass(val.toRemove);
        $row.addClass(val.toAdd);
    },

    applyColNgClass: function (val, rowIndex, colIndex) {
        var $cell = this.gridBody.find('tr.app-datagrid-row[data-row-id="' + rowIndex + '"] td.app-datagrid-cell[data-col-id="' + colIndex + '"]');
        $cell.removeClass(val.toRemove);
        $cell.addClass(val.toAdd);
    },

    _destroy: function () {
        this.element.text('');
        window.clearTimeout(this.refreshGridTimeout);
    }
});
