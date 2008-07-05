/**
 * @fileoverview Masc Grid core. Provides base grid features: sorting,
 * filtering, ranges, search, adding and removing rows, pagination, selection,
 * JSON input format, output using callback functions. Can be used alone if data
 * types and standard output functions are not needed.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/* $Id: zpgrid-core.js 4362 2006-09-07 20:41:13Z alex $ */

// Emulate window.event in Mozilla for click and dblclick events
Masc.Widget.emulateWindowEvent(['click', 'dblclick']);

/**
 * Extends base Masc Widget class (utils/zpwidget.js).
 *
 * <pre>
 * <strong>Input data formats:</strong>
 *
 * JSON:
 *
 * {
 *   style: [string, optional] table style attribute,
 *   headerStyle: [string, optional] header table row style attribute,
 *   fields:
 *   [
 *     {
 *       i: [number] column number,
 *       title: [string] column title,
 *       dataType: [string, optional] defines which standard or custom data type
 *        to use for cell conversion (if not specified, no conversion is done),
 *       columnWidth: [string, optional] column width, e.g. "10px", "10em",
 *       style: [string, optional] header table cell style attribute,
 *       hidden: [boolean, optional] if true, column will not be displayed, but
 *        filtering and searching can still be done on this column,
 *       nosort: [boolean, optional] if true, grid will not be sorted when this
 *        header is clicked,
 *       sortByColumn: [number, optional] number of column to use for sorting,
 *       hiddenValues: [object, optional] array of hidden values - rows
 *        conaining these values in the column will not be displayed,
 *       minValue: [any, optional] rows containing values in the column lesser
 *        than this value will not be displayed,
 *       maxValue:  [any, optional] rows containing values in the column greater
 *        than this value will not be displayed,
 *       textFilter: [string, optional] rows that doesn't contain this pattern
 *        in the column value will not be displayed,
 *       columnRange: [object, optional] see {@link Masc.Grid#getColumnRange}
 *     },
 *     ...
 *   ],
 *   rows:
 *   [
 *     {
 *       i: [number] row number,
 *       cells:
 *       [
 *         {
 *           i: [number] column number,
 *           r: [number] row number,
 *           v: [any] cell value to display,
 *           c: [any, optional] cell value to compare,
 *           o: [any, optional] original cell value,
 *           style: [string, optional] table cell style attribute
 *         },
 *         ...
 *       ],
 *       height: [string, optional] row height, e.g. "16px", "1.2em",
 *       style: [string, optional] table row style attribute
 *     },
 *     ...
 *   ],
 *   totalRows: [number, optional] total number of rows when dataOnDemand
 *    config option is used,
 *   displayedRows: [number, optional] number of rows displayed when
 *    dataOnDemand config option is used,
 *   currentPage: [number, optional] current page when dataOnDemand config
 *    option is used
 * }
 *
 * "i" and "r" properties are required when "dataPrepared" config option is
 * true. When "dataPrepared" is false, they are overwritten by automatic column
 * and row numbers.
 *
 * "c" and "o" properties may be useful when column "dataType" is not set. Also
 * they are required when "dataPrepared" config option is true and their values
 * differ from the value of "v" property of the cell. Anyway, they shouldn't be
 * set if their values are equal to the value of "v" property of the cell.
 *
 * "totalRows" and "displayedRows" properties are required when "dataOnDemand"
 * config option is true. When "dataOnDemand" is false, they are ignored.
 *
 * HTML:
 *
 * <xmp>
 * <table style="border: 1px solid #000">
 *   <tbody>
 *     <tr style="background-color: #00f">
 *       <td width="56" class="zpGridTypeTime" style="font-weight: bold">Time</td>
 *       ...
 *     </tr>
 *     <tr height="16" style="background-color: #ccc">
 *       <td style="background-color: #f00">09:30AM</td>
 *       ...
 *     </tr>
 *     ...
 *   </tbody>
 * </table>
 * </xmp>
 *
 * First row in the source table defines grid columns.
 *
 * To set column data type other than "string", add one of standard or custom
 * data type class names to the "class" attribute of the corresponding cell
 * in the first row.
 * Difference from JSON input format: If data type is not specified, conversion
 * will be done according to the "string" data type.
 *
 * Column width can be set through "width" attribute of the corresponding cell
 * in the first row.
 *
 * Special "zpGridTypeHidden" class makes column hidden and it will not be
 * displayed, but filtering and searching can still be done on this column.
 * This field type can be used alone or in conjunction with other field type,
 * e.g. class="zpGridTypeInt zpGridTypeHidden".
 *
 * Special "zpGridTypeNosort" class makes column header not clickable. Grid will
 * not be sorted when this header is clicked. This field type can be used alone
 * or in conjunction with other field type,
 * e.g. class="zpGridTypeInt zpGridTypeNosort".
 *
 * Special "zpGridTypeNotags" class makes grid skip all tags in the column, and
 * only uses the text. This will facilitate migrating from an existing table
 * to the grid. This field type can be used alone or in conjunction with other
 * field type, e.g. class="zpGridTypeInt zpGridTypeNotags".
 *
 * Special "zpGridTypeSortByN" class makes column use anoter column for sorting.
 * Where N is zero-based column number to use for sorting. This field type can
 * be used alone or in conjunction with other field type, e.g.
 * class="zpGridTypeInt zpGridTypeSortBy2".
 *
 * XML (requires zpgrid-xml.js to be included):
 *
 * <xmp>
 * <?xml version="1.0"?>
 * <grid>
 *   <table style="border: solid black 1px" headerStyle="background: #ccc"
 *    totalRows="123" displayedRows="89" currentPage="3">
 *     <fields>
 *       <field width="10px" hidden="true" nosort="true" sortbycolumn="2"
 *        style="color: #00f">
 *         <title>Title</title>
 *         <datatype>string</datatype>
 *       </field>
 *       ...
 *     </fields>
 *     <rows>
 *       <row height="1.2em" style="background: #eee">
 *         <cell style="color: #f00">Value</cell>
 *         ...
 *       </row>
 *       ...
 *     </rows>
 *   </table>
 * </grid>
 * </xmp>
 *
 * Where "style", "headerStyle", "totalRows", "displayedRows", "currentPage",
 * "width", "hidden", "nosort", "sortbycolumn", "height" attributes are
 * optional.
 *
 * "style" is style attribute of table, row or cell.
 *
 * "headerStyle" is header table row style attribute.
 *
 * "totalRows" is total number of rows when dataOnDemand config option is used.
 *
 * "displayedRows" is number of rows displayed when dataOnDemand config option
 * is used.
 *
 * "currentPage" is current page when dataOnDemand config option is used.
 *
 * "width" is column width.
 *
 * "hidden=true" attribute makes column hidden and it will not be displayed, but
 * filtering and searching can still be done on this column.
 *
 * "nosort=true" attribute makes column header not clickable. Grid will not be
 * sorted when this header is clicked.
 *
 * "sortbycolumn=N" attribute makes column use anoter column for sorting.
 * Where N is zero-based column number to use for sorting.
 *
 * "height" is row height.
 *
 * "datatype" tag is optional. Defines which standard or custom data type to use
 * for cell conversion. If not specified, no conversion is done.
 *
 * <strong>Possible data types:</strong>
 *
 * -----------------------------------------------------------------------------
 * Name for JSON    |Class name for HTML        |Input data      |Format of
 * and XML formats  |format                     |format          |displayed data
 * -----------------|---------------------------|----------------|--------------
 * string           |zpGridTypeString           |string          |same as input
 * -----------------|---------------------------|----------------|
 * istring          |zpGridTypeStringInsensitive|case insensitive|
 *                  |                           |string          |
 * -----------------|---------------------------|----------------|
 * int              |zpGridTypeInt              |integer or      |
 *                  |                           |Infinity        |
 * -----------------|---------------------------|----------------|
 * float            |zpGridTypeFloat            |float or        |
 *                  |                           |Infinity        |
 * -----------------|---------------------------|----------------|
 * date             |zpGridTypeDate             |string accepted |
 *                  |                           |by builtin      |
 *                  |                           |javascript Date |
 *                  |                           |object          |
 * -----------------|---------------------------|----------------|
 * time             |zpGridTypeTime             |HH:MM:SS        |
 *                  |                           |HH:MM:SS AM/PM  |
 *                  |                           |HH:MM           |
 *                  |                           |HH:MM AM/PM     |
 *                  |                           |HHMMSS          |
 *                  |                           |HHMMSS AM/PM    |
 *                  |                           |HHMM            |
 *                  |                           |HHMM AM/PM      |
 * -----------------|---------------------------|----------------|--------------
 * timestamp        |zpGridTypeTimestampLocale  |integer (number |Date in locale
 *                  |                           |of seconds since|format
 * -----------------|---------------------------|01/01/1970      |--------------
 * timestampMMDDYYYY|zpGridTypeTimestampMMDDYYYY|00:00 GMT)      |MM/DD/YYYY
 * -----------------|---------------------------|                |--------------
 * timestampDDMMYYYY|zpGridTypeTimestampDDMMYYYY|                |DD/MM/YYYY
 * -----------------|---------------------------|                |--------------
 * timestampYYYYMMDD|zpGridTypeTimestampYYYYMMDD|                |YYYY/MM/DD
 * -----------------|---------------------------|----------------|--------------
 * boolean          |zpGridTypeBoolean          |case insensitive|No/Yes
 *                  |                           |0 or 1          |or custom
 * -----------------|---------------------------|f or t          |--------------
 * booleanTF        |zpGridTypeBooleanTF        |false or true   |False/True
 *                  |                           |n or y          |or custom
 *                  |                           |no or yes       |
 * -----------------------------------------------------------------------------
 *
 * <strong>In addition to config options defined in base Masc.Widget class
 * provides following config options:</strong>
 *
 * <b>show_asis</b> [boolean] Show data as is.
 * The original data the is imported to the grid needs to be translated to it's field type.
 * In many cases this translation changes the original data.  
 * This option gives control back to the user to define how to display the grid cell
 * Possible values:
 * boolean
 *    true  - Show ALL cells as is
 *    false - Show the cells based on the field type conversion
 * object {bBoth, funcShow}
 *    bBoth - Show both in cell, Ex: Orig = Masc Value
 *    Ex: Showing both
 * BYTES-  cell=|15 MB=15360000000|; where 15 MB is orig and 15360000000 bytes is converted value
 * HOURS-  cell=|2 days 1 hour=49|; where 2 days 1 hour is orig and 49 hours is converted value
 * WEIGHT- cell=|1 lb 2 oz=18|; where 1 lb 2 oz is orig and 18 oz is converted value
 *   funcShow - callback function to create presentable cell data
 *   Function to visually present the data. Does NOT effect sorting, just visual
 *   strShowData = this.config.show_asis.funcShow(objGrid, objCell);
 *   param objCell - Masc.Grid object
 *   param objCell - cell object
 *
 * <b>funcStyle</b> [function] Callback function to dynamically change the style
 * of a cell.
 *   Dynamically change the style of a cell based on the contents.
 *   param objGrid - Masc.Grid object
 *   param objCell - cell object
 *   param iRow - index of the row in the displayed rows array returned by
 *    Masc.Grid#applyPaging method
 *   return undefined if NO change to style
 *   return string for the inline style that should be applied to this cell
 *
 * <b>convert</b> [function] Callback function to convert the cell value.
 * Receives Masc.Grid object and cell object. If returns a value, that value
 * will be assigned to the cell display and compare values.
 *
 * <b>container</b> [object or string] Element or id of element that will hold
 * the grid. If "callbackHeaderDisplay" and "callbackRowDisplay" or
 * "callbackDataDisplay" options are defined, grid will be drawn using those
 * functions and "container" option is ignored. Also can be used instead of
 * "source" option. If "source" option is not defined, first child table of
 * container element is used as source.
 *
 * <b>headerContainer</b> [object or string] Element or id of element that will
 * hold header of the grid. Used together with "container" option when header
 * should be separated from the grid. E.g. to have grid data scrollable
 * vertically and header always visible. See scroll.html demo for details.
 *
 * <b>rowsPerPage</b> [number] If > 0, paging is used.
 *
 * <b>paginationContainer</b> [object or string] Element or id of element that
 * will hold pagination of the grid. Used together with "container" and
 * "rowsPerPage" options when pagination should be separated from the grid. See
 * scroll.html demo for details.
 *
 * <b>selectRows</b> [boolean] If true, selected rows will be marked by
 * different color depending from theme. Default: true. Ignored when callback
 * functions are used to display grid.
 *
 * <b>selectCells</b> [boolean] If true, selected cells will be marked by
 * different color depending from theme. Default: true. Ignored when callback
 * functions are used to display grid.
 *
 * <b>multipleSelect</b> [boolean] If true, "Shift" and "Ctrl" click will select
 * multiple rows and cells. If false, only one row and cell can be selected at
 * a time. Default: true.
 *
 * <b>callbackHeaderDisplay</b> [function] Callback function to display grid
 * header. Used togeter with callbackRowDisplay or callbackDataDisplay option as
 * alternetive way to display the grid. Otherwise ignored. Receives Masc.Grid
 * object.
 *
 * <b>callbackRowDisplay</b> [function] Callback function to display grid row.
 * Used togeter with callbackHeaderDisplay option as alternetive way
 * to display the grid. Otherwise ignored. Receives Masc.Grid object and row
 * object.
 *
 * <b>callbackDataDisplay</b> [function] Callback function to display grid rows.
 * Used togeter with callbackHeaderDisplay option as alternetive way
 * to display the grid. Otherwise ignored. Receives Masc.Grid object and
 * array of row objects.
 *
 * <b>callbackPaginationDisplay</b> [function] Callback function to display grid
 * pagination. Used togeter with callbackHeaderDisplay, callbackRowDisplay and
 * callbackDataDisplay options as alternetive way to display the grid, but also
 * can be used separately as a replacement for standard pagination.
 * Receives Masc.Grid object. See also {@link Masc.Grid#gotoPage},
 * {@link Masc.Grid#previousPage}, {@link Masc.Grid#firstPage},
 * {@link Masc.Grid#nextPage} and {@link Masc.Grid#lastPage} functions.
 *
 * <b>callbackRowOnClick</b> [function] Callback function to call when grid row
 * is clicked. Receives Masc.Grid object and row object.
 *
 * <b>callbackCellOnClick</b> [function] Callback function to call when grid
 * cell is clicked. Receives Masc.Grid object and cell object. If this option
 * is defined, above "callbackRowOnClick" option is ignored.
 *
 * <b>callbackRowOnDblClick</b> [function] Callback function to call when grid
 * row is double clicked. Receives Masc.Grid object and row object.
 *
 * <b>callbackCellOnDblClick</b> [function] Callback function to call when grid
 * cell is double clicked. Receives Masc.Grid object and cell object. If this
 * option is defined, above "callbackRowOnDblClick" option is ignored.
 *
 * <b>callbackRowSelect</b> [function] Callback function to call when grid row
 * is selected. Receives Masc.Grid object and row object.
 * 
 * <b>callbackCellSelect</b> [function] Callback function to call when grid cell
 * is selected. Receives Masc.Grid object and cell object. If this option is
 * defined, above "callbackRowSelect" option is ignored.
 * 
 * <b>callbackRowUnselect</b> [function] Callback function to call when grid row
 * is unselected. Receives Masc.Grid object and row object.
 * 
 * <b>callbackCellUnselect</b> [function] Callback function to call when grid
 * cell is unselected. Receives Masc.Grid object and cell object. If this
 * option is defined, above "callbackRowUnselect" option is ignored.
 *
 * <b>callbackOnRefresh</b> [function] Callback function to call when grid is
 * refreshed. Receives Masc.Grid object. Deprecated. Use <b>gridRefreshed</b>
 * event described below instead.
 * 
 * <b>sortColumn</b> [number] Number of column to sort initially. First column
 * number is 0. If not set, initially grid will not be sorted.
 *
 * <b>sortDesc</b> [boolean] Used together with sortColumn option. Otherwise
 * ignored. If true, initially grid will be sorted in descending order.
 *
 * <b>filterOut</b> [object] Array of associative arrays:
 * [
 *   {
 *     column: [object or number] array of zero based column numbers or single
 *      zero based column number to use as source of values to filter out,
 *     sortDesc: [boolean, optional] if true, list of values will be sorted
 *      descending, otherwise ascending (default: false),
 *     container: [object or string, optional] element or id of element that
 *      will hold the list of values to filter out ,
 *     onclick: [string, optional] string with javascript code that will be
 *      evaluated when checkbox is clicked before filtering out the grid 
 *      (should not contain " (double quote) symbol),
 *     callback: [function, optional] callback function reference used as
 *      alternative way to display filter out list
 *   },
 *   ...
 * ]
 * If "callback" property is defined, "container" and "onclick" properties
 * are ingnored. "onclick" is useful when some simple actions like function call
 * or alert should be done before filtering out the grid. If you need to do more
 * complex actions than the code that can be passed in the string, use
 * alternative way to display filter out list with callback function.
 * callback function receives following array of associative arrays:
 * [
 *   {
 *     value: [string] the unique value from grid column,
 *     onclick: [string] onclick attribute value of the corresponding checkbox,
 *     checked: [boolean] true if this checkbox is checked,
 *     link: [string] onclick attribute for the link to filter out all values
 *      except this,
 *     selectall: [string] onclick attribute for the link to unfilter out all
 *      values (this property is defined only for the first value),
 *     clearall: [string] onclick attribute for the link to filter out all
 *      values (this property is defined only for the first value)
 *   },
 *   ...
 * ]
 *
 * <b>dataPrepared</b> [boolean] If true, grid will not attempt to check and
 * correct input data. External application is responsible for data preparation.
 * May be used with json source type to speed up large grid initialization. Data
 * must be prepared strictly according to grid internal format. 
 *
 * <b>dataOnDemand</b> [boolean] If true, on every paging, sorting, filtering,
 * ranging, and search action grid instead of doing actual operation reloads
 * its data. It makes sence to use this option together with "callbackSource"
 * config option defined in Masc.Widget class. In this case grid passes to
 * callbackSource function following object:
 * {
 *   currentPage: [number] current page number,
 *   sortColumn: [number] column number on which grid is currently sorted,
 *   sortDesc: [boolean] true if grid is currently sorted in descending order,
 *   filters: [object] array containing an object for each grid column:
 *   [
 *     {
 *       hiddenValues: [object] array of hidden values - rows conaining these
 *        values in the column should not be displayed,
 *       minValue: [any] rows containing values in the column lesser than this
 *        value should not be displayed,
 *       maxValue: [any] rows containing values in the column greater than this
 *        value should not be displayed,
 *       textFilter: [string] rows that doesn't contain this pattern in the
 *        column value should not be displayed
 *     },
 *     ...
 *   ]
 * }
 * and lets it to form the source, e.g. server URL, from which grid is reloaded
 * then.
 *
 * <b>fixedLeft</b> [number] Number of columns starting from the left that are
 * not moved during horizontal scrolling.
 *
 * <b>columnWidth</b> [string] Default column width. Should contain correct CSS
 * value, e.g. 'auto', '200px', etc. 'auto' must not be used with grids having
 * separate container for header. Default: 'auto' if headerContainer is not set,
 * '100px' if headerContainer is set.
 *
 * <b>rowHeight</b> [string] Default row height. Should contain correct CSS
 * value, e.g. 'auto', '1.5em', etc. 'auto' must not be used with grids having
 * fixed columns. Default: 'auto' if fixedLeft is not set, '1.2em' if fixedLeft
 * is set.
 *
 * <strong>In addition to events fireded from base Masc.Widget class fires
 * following events:</strong>
 *
 * <b>gridInitialized</b> when grid initialization process is completed.
 *
 * <b>gridModified</b> when splice or query is completed.
 *
 * <b>gridRefreshed</b> when grid refresh is completed.
 * </pre>
 *
 * @constructor
 * @extends Masc.Widget
 * @param {object} objArgs User configuration
 */
Masc.Grid = function(objArgs) {
  // Call constructor of superclass
  Masc.Grid.SUPERconstructor.call(this, objArgs);
};

// Inherit Widget
Masc.inherit(Masc.Grid, Masc.Widget);

/**
 * Initializes grid.
 *
 * @param {object} objArgs User configuration
 */
Masc.Grid.prototype.init = function(objArgs) {
  // Indicates that initialization process is completed
  this.initialized = false;
  // Call parent method
  Masc.Grid.SUPERclass.init.call(this, objArgs);
  // Holds grid data
  this.data = {};
  // Reference to fields array in data object
  this.fields = [];
  // Reference to rows array in data object
  this.rows = [];
  // Array where indexes are the same as row ids to reference grid rows by id
  this.rowsIndex = [];
  // Holds filtered row objects
  this.filteredRows = [];
  // Holds current page number
  this.currentPage = 0;
  // Initially may be sorted on the specified column
  this.sortColumn = this.config.sortColumn;
  // Initially may be sorted in the specified order
  this.sortDesc = this.config.sortDesc;
  // Object that holds last selection to be able to modify it
  this.lastSelection = null;
  // Load data from the specified source
  this.loadData();
};

/**
 * Reconfigures the grid with new config options after it was initialized.
 * May be used to change look or behavior of the grid after it has loaded
 * the data. In the argument pass only values for changed config options.
 * There is no need to pass config options that were not changed.
 *
 * <pre>
 * Note: "sortColumn" and "sortDesc" config options are ignored by this method
 * because they are useful only on initialization. To sort the grid after it was
 * initialized use sort method instead.
 * </pre>
 *
 * @param {object} objArgs Changes to user configuration
 */
Masc.Grid.prototype.reconfigure = function(objArgs) {
  // Call parent method
  Masc.Grid.SUPERclass.reconfigure.call(this, objArgs);
  // Redraw grid
  this.refresh();
};

/**
 * Configures grid. Gets called from parent init method.
 *
 * @private
 * @param {object} objArgs User configuration
 */
Masc.Grid.prototype.configure = function(objArgs) {
  // Define config options
  this.defineConfigOption('show_asis', false);
  this.defineConfigOption('funcStyle');
  this.defineConfigOption('convert');
  this.defineConfigOption('container');
  this.defineConfigOption('headerContainer');
  this.defineConfigOption('rowsPerPage', 0);
  this.defineConfigOption('paginationContainer');
  this.defineConfigOption('selectRows', true);
  this.defineConfigOption('selectCells', true);
  this.defineConfigOption('multipleSelect', true);
  this.defineConfigOption('callbackHeaderDisplay');
  this.defineConfigOption('callbackRowDisplay');
  this.defineConfigOption('callbackDataDisplay');
  this.defineConfigOption('callbackPaginationDisplay');
  this.defineConfigOption('callbackRowOnClick');
  this.defineConfigOption('callbackCellOnClick');
  this.defineConfigOption('callbackRowOnDblClick');
  this.defineConfigOption('callbackCellOnDblClick');
  this.defineConfigOption('callbackRowSelect');
  this.defineConfigOption('callbackCellSelect');
  this.defineConfigOption('callbackRowUnselect');
  this.defineConfigOption('callbackCellUnselect');
  this.defineConfigOption('callbackOnRefresh');
  this.defineConfigOption('sortColumn');
  this.defineConfigOption('sortDesc');
  this.defineConfigOption('filterOut', []);
  this.defineConfigOption('dataPrepared', false);
  this.defineConfigOption('dataOnDemand', false);
  this.defineConfigOption('fixedLeft', 0);
  this.defineConfigOption('columnWidth', 'auto');
  this.defineConfigOption('rowHeight', 'auto');
  // Call parent method
  Masc.Grid.SUPERclass.configure.call(this, objArgs);
  // Correct rowsPerPage config option
  this.config.rowsPerPage = parseInt(this.config.rowsPerPage);
  if (isNaN(this.config.rowsPerPage)) {
    this.config.rowsPerPage = 0;
  }
  // There is no sense to use dataOnDemand without rowsPerPage
  if (!this.config.rowsPerPage) {
    this.config.dataOnDemand = false;
  }
  // Indicates that we are responsible for visualisation
  this.visualize = true;
  if (typeof this.config.callbackHeaderDisplay == 'function' &&
   (typeof this.config.callbackRowDisplay == 'function' ||
   typeof this.config.callbackDataDisplay == 'function')) {
    this.visualize = false;
  }
  // Grid container
  this.container = Masc.Widget.getElementById(this.config.container);
  // Grid header container
  this.headerContainer =
   Masc.Widget.getElementById(this.config.headerContainer);
  // Grid pagination container
  this.paginationContainer =
   Masc.Widget.getElementById(this.config.paginationContainer);
  // Correct columnWidth config option
  this.config.columnWidth =
   Masc.Utils.correctCssLength(this.config.columnWidth);
  if (this.config.columnWidth == 'auto' && this.headerContainer) {
    this.config.columnWidth = '100px';
  }
  // Correct rowHeight config option
  this.config.rowHeight = Masc.Utils.correctCssLength(this.config.rowHeight);
  if (this.config.rowHeight == 'auto' && this.config.fixedLeft) {
    this.config.rowHeight = '1.2em';
  }
};

/**
 * Extends parent method.
 * @private
 */
Masc.Grid.prototype.addStandardEventListeners = function() {
  // Call parent method
  Masc.Grid.SUPERclass.addStandardEventListeners.call(this);
  // Add grid specific event listeners
  if (this.displayLoading) {
    this.addEventListener('fetchSourceStart', function() {
      this.displayLoading();
    });
  }
  if (this.removeLoading) {
    this.addEventListener('fetchSourceEnd', function() {
      this.removeLoading();
    });
  }
  // If zpgrid-output.js is loaded
  if (this.visualizeThemeLoad) {
    this.addEventListener('loadThemeEnd', function() {
      // If we are responsible for visualisation
      if (this.visualize) {
        this.visualizeThemeLoad();
      }
    });
  }
  if (this.visualizeDataLoad) {
    this.addEventListener('loadDataEnd', function() {
      // If we are responsible for visualisation
      if (this.visualize) {
        this.visualizeDataLoad();
      }
    });
  }
};

/**
 * Reloads data from the specified source after grid is initialized. Argument
 * should be passed only when dataOnDemand config option is true and
 * callbackSource config option is defined. See description of dataOnDemand
 * config option for details.
 *
 * @param {object} objArgs (Optional) Arguments object
 */
Masc.Grid.prototype.loadData = function(objArgs) {
  // Form arguments object
  if (this.config.dataOnDemand) {
    if (typeof objArgs != 'object') {
      objArgs = {};
    }
    objArgs.currentPage = this.currentPage;
    objArgs.sortColumn = this.sortColumn;
    objArgs.sortDesc = this.sortDesc;
    objArgs.filters = [];
    for (var iCol = 0; iCol < this.fields.length; iCol++) {
      var objField = this.fields[iCol];
      if (objField) {
        objArgs.filters[iCol] = {
          hiddenValues: objField.hiddenValues,
          minValue: objField.minValue,
          maxValue: objField.maxValue,
          textFilter: objField.textFilter
        };
      } else {
        objArgs.filters[iCol] = {};
      }
    }
  }
  // Call parent method
  Masc.Grid.SUPERclass.loadData.call(this, objArgs);
};

/**
 * Performs some actions when grid is refreshed.
 * @private
 */
Masc.Grid.prototype.onRefresh = function() {
  // If we are responsible for visualisation
  if (this.visualizeRefresh && this.visualize) {
    this.visualizeRefresh();
  }
  // Onrefresh callback
  if (typeof this.config.callbackOnRefresh == 'function') {
    this.config.callbackOnRefresh(this);
  }
  // Fire event
  this.fireEvent('gridRefreshed');
};

/**
 * Loads data from the JSON source.
 *
 * @private
 * @param {object} objData Input data object
 */
Masc.Grid.prototype.loadDataJson = function(objData) {
  // Remove index
  this.rowsIndex = null;
  // Get data
  if (!(objData instanceof Object)) {
    objData = {};
  }
  if (!(objData.fields instanceof Array)) {
    objData.fields = [];
  }
  if (!(objData.rows instanceof Array)) {
    objData.rows = [];
  }
  this.data = objData;
  // References
  this.fields = this.data.fields;
  this.rows = this.data.rows;
  // Check and correct input data
  this.prepareData();
  // Duplicate rows array
  this.rowsIndex = this.rows.slice();
  // Set page
  if (typeof objData.currentPage != 'undefined') {
    this.currentPage = objData.currentPage;
  } else {
    this.currentPage = 0;
  }
  // Show grid
  this.show();
};

/**
 * Displays grid after data loading.
 * @private
 */
Masc.Grid.prototype.show = function() {
  // Duplicate rows array
  this.filteredRows = this.rows.slice();
  // Sort if needed
  this.sort();
  // Display grid
  this.refresh();
  // Display filter out forms
  this.displayFilterOut();
  // Fire event
  if (!this.initialized) {
    this.initialized = true;
    this.fireEvent('gridInitialized');
  }
};

/**
 * Checks if all required properties of input object are defined. Defines missed
 * properties.
 * @private
 */
Masc.Grid.prototype.prepareData = function() {
  if (!this.config.dataPrepared) {
    for (var iCol = 0; iCol < this.fields.length; iCol++) {
      var objField = this.fields[iCol];
      if (!(objField instanceof Object)) {
        objField = {};
      }
      objField.i = iCol;
      this.fields[iCol] = this.prepareField(objField);
    }
    for (var iRow = 0; iRow < this.rows.length; iRow++) {
      var objRow = this.rows[iRow];
      if (!(objRow instanceof Object)) {
        objRow = {};
      }
      objRow.i = iRow;
      this.rows[iRow] = this.prepareRow(objRow);
    }
  }
};

/**
 * Checks if all required properties of the field object are defined. Defines
 * missed properties.
 *
 * @private
 * @param {object} objField Field object
 * @return Prepared field object
 * @type {object}
 */
Masc.Grid.prototype.prepareField = function(objField) {
  return objField;
};

/**
 * Checks if all required properties of the row object are defined. Defines
 * missed properties.
 *
 * @private
 * @param {object} objRow Row object
 * @return Prepared row object
 * @type {object}
 */
Masc.Grid.prototype.prepareRow = function(objRow) {
  if (!objRow.cells || !(objRow.cells instanceof Array)) {
    objRow.cells = [];
  }
  for (var iCol = 0; iCol < objRow.cells.length; iCol++) {
    // Get cell
    var objCell = objRow.cells[iCol];
    if (!(objCell instanceof Object)) {
      objCell = {};
    }
    // Assign column number
    objCell.i = iCol;
    // Assign row number
    objCell.r = objRow.i;
    // Convert
    objRow.cells[iCol] = this.convertCell(objCell);
  }
  return objRow;
};

/**
 * Converts cell to corresponding data type.
 *
 * @private
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertCell = function(objCell) {
  if (!(objCell instanceof Object)) {
    objCell = {};
  }
  // Convert by type
  if (this.getConvertByType) {
    var objField = this.getFieldByCell(objCell);
    if (objField) {
      var strMethod = this.getConvertByType(objField.dataType);
      if (strMethod) {
        objCell = this[strMethod](objCell);
      }
    }
  }
  // Custom convert
  objCell = this.convertCellCallback(objCell);
  return objCell;
};

/**
 * Converts cell using callback function.
 *
 * @private
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertCellCallback = function(objCell) {
  if (!(objCell instanceof Object)) {
    objCell = {};
  }
  if (typeof this.config.convert == 'function') {
    var convertedValue = this.config.convert(this, objCell);
    if (typeof convertedValue != 'undefined') {
      if (typeof objCell.o == 'undefined') {
        objCell.o = objCell.v;
      }
      objCell.v = objCell.c = convertedValue;
    }
  }
  return objCell;
};

/**
 * Validates cell according to its data type. If value is invalid, sets
 * "invalid" cell property to true.
 *
 * @private
 * @param {object} objCell Cell object
 * @return True if valid
 * @type boolean
 */
Masc.Grid.prototype.validateCell = function(objCell) {
  if (!(objCell instanceof Object)) {
    objCell = {};
  }
  // Validate by type
  if (this.getValidateByType) {
    var objField = this.getFieldByCell(objCell);
    if (objField) {
      var strMethod = this.getValidateByType(objField.dataType);
      if (strMethod) {
        var undef;
        // Valid by default
        if (objCell.invalid) {
          objCell.invalid = undef;
        }
        // Validate
        var boolValid = this[strMethod](objCell);
        if (!boolValid) {
          objCell.invalid = true;
        }
        // Validate row
        var objRow = this.getRowByCell(objCell);
        if (objRow) {
          if (!boolValid) {
            objRow.invalid = true;
          } else {
            // Valid by default
            if (objRow.invalid) {
              objRow.invalid = undef;
            }
            // Validate
            var arrCells = this.getRowCells(objRow);
            for (var iCell = 0; iCell < arrCells.length; iCell++) {
              if (arrCells[iCell] && arrCells[iCell].invalid) {
                objRow.invalid = true;
                break;
              }
            }
          }
        }
        return boolValid;
      }
    }
  }
  // Default is true
  return true;
};

/**
 * Changes the content of the grid, adding new rows while removing old rows.
 *
 * <pre>
 * Input object format:
 *
 * {
 *   atRowId: [number, optional] id of row at which to start changing the grid,
 *   atRow: [number, optional] index in rows array of row at which to start
 *    changing the grid,
 *   afterRowId: [number, optional] id of row after which to start changing
 *    the grid,
 *   afterRow: [number, optional] index in rows array of row after which to
 *    start changing the grid,
 *   howMany: [number, optional] number of rows to remove (default: 0),
 *   rows: [object, optional] array of rows to add:
 *   [
 *     {
 *       i: [number] row number,
 *       cells:
 *       [
 *         {
 *           i: [number] column number,
 *           r: [number] row number,
 *           v: [any] cell value to display,
 *           c: [any, optional] cell value to compare,
 *           o: [any, optional] original cell value,
 *           style: [string, optional] table cell style attribute
 *         },
 *         ...
 *       ],
 *       style: [string, optional] table row style attribute
 *     },
 *     ...
 *   ],
 *   noRefresh: [boolean, optional] indicates that grid should not be refreshed
 *    after changing (default: false) (useful when several changes go one by
 *    one)
 * }
 *
 * Only one of "atRowId", "atRow", "afterRowId" and "afterRow" properties should
 * be defined. If none of them is defined, new rows will be added to the end of
 * grid.
 * </pre>
 *
 * @param {object} objData Input object
 * @return Array with removed row objects. Number of removed rows can be
 * accessed through the length property of this array. If error occured, returns
 * undefined
 * @type object
 */
Masc.Grid.prototype.splice = function(objData) {
  // Check arguments
  if (!objData) {
    return;
  }
  // Will hold removed rows
  var arrRemoved = [];
  // Get insert position
  var iInsertPos = null;
  if ((typeof objData.atRowId == 'string' && objData.atRowId.length) ||
   typeof objData.atRowId == 'number') {
    // Find row number by its id
    var iRowNum = -1;
    for (var iRow = 0; iRow < this.rows.length; iRow++) {
      if (this.rows[iRow].i == objData.atRowId) {
        iRowNum = iRow;
        break;
      }
    }
    if (iRowNum >= 0) {
      iInsertPos = iRowNum;
    }
  }
  if (iInsertPos == null) {
    if ((typeof objData.atRow == 'string' && objData.atRow.length) ||
     typeof objData.atRow == 'number') {
      var iRowNum = objData.atRow * 1;
      if (typeof this.rows[iRowNum] != 'undefined') {
        // Before specified row
        iInsertPos = iRowNum;
      }
    }
  }
  if (iInsertPos == null) {
    if ((typeof objData.afterRowId == 'string' && objData.afterRowId.length) ||
     typeof objData.afterRowId == 'number') {
      // Find row number by its id
      var iRowNum = -1;
      for (var iRow = 0; iRow < this.rows.length; iRow++) {
        if (this.rows[iRow].i == objData.afterRowId) {
          iRowNum = iRow;
          break;
        }
      }
      if (iRowNum >= 0) {
        iInsertPos = iRowNum + 1;
      }
    }
  }
  if (iInsertPos == null) {
    if ((typeof objData.afterRow == 'string' && objData.afterRow.length) ||
     typeof objData.afterRow == 'number') {
      var iRowNum = objData.afterRow * 1;
      if (typeof this.rows[iRowNum] != 'undefined') {
        // After specified row
        iInsertPos = iRowNum + 1;
      }
    }
  }
  if (iInsertPos == null) {
    // End of the grid by default
    iInsertPos = this.rows.length;
  } else {
    // Remove rows
    var iHowManyToRemove = objData.howMany * 1;
    for (var iRemoved = 0; iRemoved < iHowManyToRemove; iRemoved++) {
      if (typeof this.rows[iInsertPos] == 'undefined') {
        // Tring to remove more rows than there are in the grid
        break;
      }
      var objRow = this.removeRow(iInsertPos);
      if (objRow) {
        arrRemoved.push(objRow);
      }
    }
  }
  // Insert new rows
  if (objData.rows && objData.rows instanceof Array) {
    for (var iRow = 0; iRow < objData.rows.length; iRow++) {
      var objRow = objData.rows[iRow];
      objRow.i = this.rowsIndex.length;
      objRow = this.prepareRow(objRow);
      // Insert row
      this.rows.splice(iInsertPos++, 0, objRow);
      this.rowsIndex.push(objRow);
    }
  }
  // Show grid
  if (!objData.noRefresh) {
    this.modify();
  }
  // Return removed rows
  return arrRemoved;
};

/**
 * Removes specified row from the grid.
 *
 * @private
 * @param {number} iRow Row index in rows array
 * @return Removed row
 * @type object
 */
Masc.Grid.prototype.removeRow = function(iRow) {
  var objRow = this.rows[iRow];
  if (!objRow) {
    return;
  }
  var undef;
  this.rowsIndex[objRow.i] = undef;
  var arrRows = this.rows.splice(iRow, 1);
  return arrRows[0];
};

/**
 * Displays grid after splice or query.
 * @private
 */
Masc.Grid.prototype.modify = function() {
  // Duplicate rows array
  this.filteredRows = this.rows.slice();
  // Display grid
  this.setFilters();
  // Display filter out forms
  this.displayFilterOut();
  // Fire event
  this.fireEvent('gridModified');
};

/**
 * Sorts the specified column in the specified order. If column is not
 * specified, uses current column and order. If there are equal values sorting
 * is done in ascending order by other columns.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [number or string, optional] number of column to sort
 *    (default: sortColumn config option),
 *   desc: [boolean, optional] sort in descending order (default: false)
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Grid.prototype.sort = function(objArgs) {
  // Get column number
  var iColNum;
  var boolDescOrder;
  if (!objArgs || typeof objArgs.column == 'undefined') {
    // Use current column and order
    iColNum = this.sortColumn;
    boolDescOrder = this.sortDesc;
  } else {
    iColNum = objArgs.column * 1;
    boolDescOrder = objArgs.desc ? true : false;
  }
  var objField = this.fields[iColNum];
  if (!objField) {
    return;
  }
  if (typeof objField.sortByColumn != 'undefined' &&
   !this.fields[objField.sortByColumn]) {
    return;
  }
  // Get order
  if (typeof boolDescOrder == 'undefined') {
    // Sort ascending by default
    boolDescOrder = false;
  }
  // Set current column and order
  this.sortColumn = iColNum;
  this.sortDesc = boolDescOrder;
  // Unsort all columns
  for (var iCol = 0; iCol < this.fields.length; iCol++) {
    var objFld = this.fields[iCol];
    if (objFld) {
      var undef;
      objFld.sorted = undef;
      objFld.sortedDesc = undef;
    }
  }
  // Determine sorting order
  var iLt, iGt;
  if (boolDescOrder) {
    // Descending
    iLt = 1;
    iGt = -1;
    objField.sortedDesc = true;
  } else {
    // Ascending
    iLt = -1;
    iGt = 1;
    objField.sorted = true;
  }
  // Correct column number
  if (typeof objField.sortByColumn != 'undefined') {
    iColNum = objField.sortByColumn;
  }
  // Display "Updating"
  if (this.displayUpdating) {
    this.displayUpdating();
  }
  // Sort
  var objGrid = this;
  // Timeout to let browser display "Updating"
  setTimeout(function() {
    objGrid.filteredRows.sort(
      function(left, right) {
        var leftVal = objGrid.getCellValueCompare(left.cells[iColNum]);
        var rightVal = objGrid.getCellValueCompare(right.cells[iColNum]);
        if (leftVal == rightVal) {
          // Compare other columns (always in ascending order)
          for (var iCol = 0; iCol < left.cells.length; iCol++) {
            if (iCol == iColNum) {
              continue;
            }
            var lVal = objGrid.getCellValueCompare(left.cells[iCol]);
            var rVal = objGrid.getCellValueCompare(right.cells[iCol]);
            if (lVal == rVal) {
              continue;
            }
            if (lVal < rVal) {
              return -1;
            }
            return 1;
          }
          return 0;
        }
        if (leftVal < rightVal) {
          return iLt;
        }
        return iGt;
      }
    );
  }, 0);
};

/**
 * Sorts column in ascending (if it is sorted descending) or descending
 * (if it is sorted ascending) order.
 *
 * @param {number} iGridId Id of the grid
 * @param {number} iCol Number of column to sort
 */
Masc.Grid.sort = function(iGridId, iCol) {
  // Check arguments
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (!objGrid || !objGrid.fields[iCol]) {
    return;
  }
  // Sort grid
  if (!objGrid.fields[iCol].sorted) {
    // Sort in ascending order
    objGrid.sort({
      column: iCol
    });
  } else {
    // Sort in descending order
    objGrid.sort({
      column: iCol,
      desc: true
    });
  }
  if (objGrid.config.dataOnDemand) {
    // Sort on server
    objGrid.loadData();
  } else {
    // Redraw grid
    objGrid.refresh();
  }
};

/**
 * Returns current page number.
 *
 * @return Current page number
 * @type number
 */
Masc.Grid.prototype.getCurrentPageNumber = function() {
  return this.currentPage + 1;
};

/**
 * Returns total number of pages.
 *
 * @return Total number of pages in the grid
 * @type number
 */
Masc.Grid.prototype.totalPages = function() {
  var iRecords = this.recordsDisplayed();
  if (this.config.rowsPerPage <= 0 || iRecords <= 0) {
    return 1;
  }
  return Math.ceil(iRecords / this.config.rowsPerPage);
};

/**
 * Sets current page without grid refresh.
 *
 * @param {number} iPage Zero-based number of page
 */
Masc.Grid.prototype.setCurrentPage = function(iPage) {
  // Get number of pages
  var iPages = this.totalPages();
  if (iPage < 0 || iPage >= iPages) {
    return;
  }
  // Go to page
  this.currentPage = iPage;
};

/**
 * Displays specified page.
 *
 * @param {number} iPage Zero-based number of page
 */
Masc.Grid.prototype.gotoPage = function(iPage) {
  // Set current page
  this.setCurrentPage(iPage);
  // Refresh grid
  if (this.config.dataOnDemand) {
    // Get page from server
    this.loadData();
  } else {
    // Redraw grid
    this.refresh();
  }
};

/**
 * Goes to the specified page.
 *
 * @param {number} iGridId Id of the grid
 * @param {number} iPage Number of page
 */
Masc.Grid.gotoPage = function(iGridId, iPage) {
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid) {
    objGrid.gotoPage(iPage - 1);
  }
};

/**
 * Goes to the next page.
 *
 * @param {number} iGridId Id of the grid
 */
Masc.Grid.nextPage = function(iGridId) {
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid) {
    objGrid.gotoPage(objGrid.currentPage + 1);
  }
};

/**
 * Goes to the last page.
 *
 * @param {number} iGridId Id of the grid
 */
Masc.Grid.lastPage = function(iGridId) {
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid) {
    objGrid.gotoPage(objGrid.totalPages() - 1);
  }
};

/**
 * Goes to the previous page.
 *
 * @param {number} iGridId Id of the grid
 */
Masc.Grid.previousPage = function(iGridId) {
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid) {
    objGrid.gotoPage(objGrid.currentPage - 1);
  }
};

/**
 * Goes to the first page.
 *
 * @param {number} iGridId Id of the grid
 */
Masc.Grid.firstPage = function(iGridId) {
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid) {
    objGrid.gotoPage(0);
  }
};

/**
 * Applies filters to the grid.
 * @private
 */
Masc.Grid.prototype.applyFilters = function() {
  // Check if data is filtered on server
  if (this.config.dataOnDemand) {
    // Go to the first page
    this.currentPage = 0;
    // Filter on server
    this.loadData();
  } else {
    // Display "Updating"
    if (this.displayUpdating) {
      this.displayUpdating();
    }
    // Set filters
    var objGrid = this;
    // Timeout to let browser display "Updating"
    setTimeout(function() {
      objGrid.setFilters();
    }, 0);
  }
};

/**
 * Sets filters to the array of rows.
 * @private
 */
Masc.Grid.prototype.setFilters = function() {
  // Duplicate rows array
  this.filteredRows = this.rows.slice();
  // Columns having text filter set
  var arrTextFilters = [];
  // Iterate over columns
  for (var iCol = 0; iCol < this.fields.length; iCol++) {
    if (!this.fields[iCol]) {
      continue;
    }
    // Apply filters
    var arrHiddenValues = this.fields[iCol].hiddenValues;
    var minValue = this.fields[iCol].minValue;
    var maxValue = this.fields[iCol].maxValue;
    if (arrHiddenValues instanceof Array || typeof minValue != 'undefined' ||
     typeof maxValue != 'undefined') {
      // Iterate over rows
      for (var iRow = this.filteredRows.length - 1; iRow >= 0; iRow--) {
        // Get cell
        var objCell = this.filteredRows[iRow].cells[iCol];
        if (!objCell) {
          continue;
        }
        // Remove row if value of the cell is hidden
        if (arrHiddenValues instanceof Array &&
         Masc.Utils.arrIndexOf(arrHiddenValues,
         this.getCellValueString(objCell)) >= 0) {
          this.filteredRows.splice(iRow, 1);
          continue;
        }
        // Remove row if value of the cell is lesser then min value
        if (minValue > this.getCellValueCompare(objCell)) {
          this.filteredRows.splice(iRow, 1);
          continue;
        }
        // Remove row if value of the cell is greater then max value
        if (maxValue < this.getCellValueCompare(objCell)) {
          this.filteredRows.splice(iRow, 1);
          continue;
        }
      }
    }
    // Check text filter
    if (this.fields[iCol].textFilter) {
      arrTextFilters.push(iCol);
    }
  }
  // Apply text filters
  if (arrTextFilters.length) {
    // Iterate over rows
    for (var iRow = this.filteredRows.length - 1; iRow >= 0; iRow--) {
      // Indicates that row should be removed
      var boolRemove = true;
      // Iterate over filters
      for (var iFilter = 0; iFilter < arrTextFilters.length; iFilter++) {
        // Column number
        var iCol = arrTextFilters[iFilter];
        // Get cell
        var objCell = this.filteredRows[iRow].cells[iCol];
        if (!objCell) {
          continue;
        }
        // Get cell value
        var strValue = this.getCellValueString(objCell);
        // Search text fragment
        if (strValue.indexOf(this.fields[iCol].textFilter) >= 0) {
          boolRemove = false;
          break;
        }
      }
      // Remove row if text fragment not found
      if (boolRemove) {
        this.filteredRows.splice(iRow, 1);
      }
    }
  }
  // Sort if needed
  this.sort();
  // Go to the first page
  this.currentPage = 0;
  // Redraw grid
  this.refresh();
};

/**
 * Filters out rows with the specified value in the specified column or set
 * of columns.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [object or number] array of zero based column numbers or single
 *    zero based column number to filter,
 *   value: [object or string] array of values or single value to filter out,
 *   show: [boolean] show rows having this value or not
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Grid.prototype.filterOut = function(objArgs) {
  // Filter out columns
  if (this.filterOutColumn(objArgs)) {
    // Apply filters
    this.applyFilters();
  }
};

/**
 * Filters out rows with the specified value in the specified columns. Only sets
 * a hidden value without applying it to the grid.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [object or number] array of zero based column numbers or single
 *    zero based column number to filter,
 *   value: [object or string] array of values or single value to filter out,
 *   show: [boolean] show rows having this value or not
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 * @return True if the hidden values were set
 * @type boolean
 */
Masc.Grid.prototype.filterOutColumn = function(objArgs) {
  // Check arguments
  if (!objArgs || typeof objArgs.value == 'undefined') {
    // Error
    return false;
  }
  var arrVals = objArgs.value;
  if (!(arrVals instanceof Array)) {
    arrVals = [arrVals];
  }
  var arrCols = objArgs.column;
  if (!(arrCols instanceof Array)) {
    arrCols = [arrCols];
  }
  // Will indicate that hidden values are set
  var boolApply = false;
  // Filter out columns
  for (var iCol = 0; iCol < arrCols.length; iCol++) {
    // Get column
    var objField = this.fields[arrCols[iCol]];
    if (!objField) {
      continue;
    }
    // Setup hidden values
    if (!(objField.hiddenValues instanceof Array)) {
      objField.hiddenValues = [];
    }
    if (objArgs.show) {
      // Remove from hiddenValues
      for (var iVal = 0; iVal < arrVals.length; iVal++) {
        for (var iHv = objField.hiddenValues.length - 1; iHv >= 0; iHv--) {
          if (objField.hiddenValues[iHv] == arrVals[iVal]) {
            objField.hiddenValues.splice(iHv, 1);
          }
        }
      }
    } else {
      // Add to hiddenValues
      for (var iVal = 0; iVal < arrVals.length; iVal++) {
        objField.hiddenValues.push(arrVals[iVal]);
      }
    }
    boolApply = true;
  }
  return boolApply;
};

/**
 * Removes all hidden values from the specified columns.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [object or number] array of zero based column numbers or single
 *    zero based column number to remove hidden values from
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Grid.prototype.unfilterOut = function(objArgs) {
  // Reset hidden values
  if (this.unfilterOutColumn(objArgs)) {
    // Apply filters
    this.applyFilters();
  }
};

/**
 * Removes all hidden values from the specified columns. Only resets hidden
 * values without applying them to the grid.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [object or number] array of zero based column numbers or single
 *    zero based column number to remove hidden values from
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 * @return True if hidden values were reset and must be applied to the grid
 * @type boolean
 */
Masc.Grid.prototype.unfilterOutColumn = function(objArgs) {
  // Check arguments
  if (!objArgs) {
    // Error
    return false;
  }
  var arrCols = objArgs.column;
  if (!(arrCols instanceof Array)) {
    arrCols = [arrCols];
  }
  // Will indicate that hidden values were reset
  var boolApply = false;
  // Reset hidden values
  var undef;
  for (var iCol = 0; iCol < arrCols.length; iCol++) {
    // Get field
    var objField = this.fields[arrCols[iCol]];
    if (!objField) {
      continue;
    }
    if ((objField.hiddenValues instanceof Array) &&
     objField.hiddenValues.length) {
      objField.hiddenValues = undef;
      boolApply = true;
    }
  }
  return boolApply;
};

/**
 * Limits range of values of the specified column.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   column: [number] number of column to filter,
 *   min [any, optional] minimum cell value,
 *   max [any, optional] mamximum cell value
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Grid.prototype.limitRange = function(objArgs) {
  // Check arguments
  if (!objArgs) {
    return;
  }
  // Get column
  var objField = this.fields[objArgs.column];
  if (!objField) {
    return;
  }
  // Setup min value
  var value = objArgs.min;
  var strTypeOf = typeof value;
  if (!value && strTypeOf != 'number' && strTypeOf != 'boolean') {
    var undef;
    objField.minValue = undef;
  } else {
    // Get compare value
    var objCell = {
      i: objField.i,
      v: value
    };
    objCell = this.convertCell(objCell);
    objField.minValue = this.getCellValueCompare(objCell);
  }
  // Setup max value
  value = objArgs.max;
  strTypeOf = typeof value;
  if (!value && strTypeOf != 'number' && strTypeOf != 'boolean') {
    var undef;
    objField.maxValue = undef;
  } else {
    // Get compare value
    var objCell = {
      i: objField.i,
      v: value
    };
    objCell = this.convertCell(objCell);
    objField.maxValue = this.getCellValueCompare(objCell);
  }
  // Apply filters
  this.applyFilters();
};

/**
 * Limits the result set by doing a search. Only rows having specified text
 * fragment will be shown.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   text: [string, optional] text fragment to search,
 *   columns: [object, optional] array with zero based column numbers to search
 *    (by default all columns are searched)
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Grid.prototype.setFilter = function(objArgs) {
  // Check arguments
  if (!objArgs) {
    objArgs = {};
  }
  // Set text filter
  if (objArgs.columns instanceof Array) {
    for (var iCol = 0; iCol < objArgs.columns.length; iCol++) {
      var objField = this.fields[objArgs.columns[iCol]];
      if (objField) {
        objField.textFilter = objArgs.text;
      }
    }
  } else {
    for (var iCol = 0; iCol < this.fields.length; iCol++) {
      if (!(this.fields[iCol] instanceof Object)) {
        this.fields[iCol] = {};
      }
      this.fields[iCol].textFilter = objArgs.text;
    }
  }
  // Apply filters
  this.applyFilters();
};

/**
 * Removes filter from the specified columns.
 *
 * <pre>
 * Arguments object format:
 *
 * {
 *   columns: [object, optional] array with column numbers to remove filter from
 * }
 *
 * If objArgs or columns are not defined or empty, filter is removed from all
 * columns.
 * </pre>
 *
 * @param {object} objArgs Optional. Arguments object
 */
Masc.Grid.prototype.removeFilter = function(objArgs) {
  // Check arguments
  if (!objArgs) {
    objArgs = {};
  }
  // Remove text filter
  this.setFilter({
    columns: objArgs.columns
  });
};

/**
 * Resets all filterouts, ranges and text filters.
 */
Masc.Grid.prototype.resetFilters = function() {
  // Remove filters
  for (var iCol = 0; iCol < this.fields.length; iCol++) {
    var objField = this.fields[iCol];
    if (objField) {
      var undef;
      // Remove filterout
      objField.hiddenValues = undef;
      // Remove range
      objField.minValue = undef;
      objField.maxValue = undef;
      // Remove text filter
      objField.textFilter = undef;
    }
  }
  // Apply filters
  this.applyFilters();
  // Display filter out forms
  this.displayFilterOut();
};

/**
 * Returns array of rows that are or must be (depending on context) displayed
 * on the current page.
 *
 * @return Array of rows on the current page
 * @type object
 */
Masc.Grid.prototype.applyPaging = function() {
  if (this.config.rowsPerPage <= 0 || this.config.dataOnDemand) {
    return this.filteredRows;
  }
  if (this.currentPage < 0) {
    this.currentPage = 0;
  }
  var iFirst = this.currentPage * this.config.rowsPerPage;
  if (iFirst && iFirst >= this.filteredRows.length) {
    this.currentPage--;
    iFirst = this.currentPage * this.config.rowsPerPage;
  }
  // rowsPerPage may be string
  var iLast = iFirst + this.config.rowsPerPage * 1;
  return this.filteredRows.slice(iFirst, iLast);
};

/**
 * Refreshes grid after sorting or filtering.
 * @private
 */
Masc.Grid.prototype.refresh = function() {
  // Display "Updating"
  if (this.displayUpdating) {
    this.displayUpdating();
  }
  // Refresh grid
  var objGrid = this;
  // Timeout to let browser display "Updating"
  setTimeout(function() {
    if (!objGrid.visualize) {
      objGrid.refreshCallback();
    } else if (objGrid.refreshContainer) {
      objGrid.refreshContainer();
    }
    // Several refresh processes may run simultaneously. Run onRefresh after
    // all refresh processes are finished.
    setTimeout(function() {
      objGrid.onRefresh();
    }, 0);
  }, 0);
};

/**
 * Displays grid using callback functions.
 *
 * <pre>
 * callbackHeaderDisplay function called to display header row.
 *
 * If callbackRowDisplay is defined, it is called to display data rows.
 *
 * If callbackDataDisplay is defined, it is called to display data instead of
 * callbackRowDisplay (callbackRowDisplay is ignored in this case).
 *
 * If callbackPaginationDisplay is defined, it is called to display pagination.
 * </pre>
 *
 * @private
 */
Masc.Grid.prototype.refreshCallback = function() {
  // Display header
  this.config.callbackHeaderDisplay(this);
  // Get rows to display
  var arrRows = this.applyPaging();
  // Display rows
  if (typeof this.config.callbackDataDisplay == 'function') {
    this.config.callbackDataDisplay(this, arrRows);
  } else {
    for (var iRow = 0; iRow < arrRows.length; iRow++) {
      this.config.callbackRowDisplay(this, arrRows[iRow]);
    }
  }
  // Display pagination
  if (this.config.rowsPerPage > 0 &&
   typeof this.config.callbackPaginationDisplay == 'function') {
    this.config.callbackPaginationDisplay(this);
  }
};

/**
 * Selects a row. If callbackCellSelect is not defined, calls callbackRowSelect
 * function.
 *
 * @private
 * @param {object} objRow Row object
 */
Masc.Grid.prototype.selectRow = function(objRow) {
  // Check arguments
  if (!objRow || objRow.selected) {
    return;
  }
  // Select callback
  if (typeof this.config.callbackCellSelect != 'function' &&
   typeof this.config.callbackRowSelect == 'function') {
    this.config.callbackRowSelect(this, objRow);
  }
  // Display updates if we are responsible for visualisation
  if (this.visualizeSelectRow && this.config.selectRows && this.visualize) {
    this.visualizeSelectRow(objRow);
  }
  // Select row
  objRow.selected = true;
};

/**
 * Unselects a row. If callbackCellUnselect is not defined, calls
 * callbackRowUnselect function.
 *
 * @private
 * @param {object} objRow Row object
 */
Masc.Grid.prototype.unselectRow = function(objRow) {
  // Check arguments
  if (!objRow || !objRow.selected) {
    return;
  }
  // Unselect row
  var undef;
  objRow.selected = undef;
  // Display updates if we are responsible for visualisation
  if (this.visualizeUnselectRow && this.config.selectRows && this.visualize) {
    this.visualizeUnselectRow(objRow);
  }
  // Unselect callback
  if (typeof this.config.callbackCellUnselect != 'function' &&
   typeof this.config.callbackRowUnselect == 'function') {
    this.config.callbackRowUnselect(this, objRow);
  }
};

/**
 * Selects a cell. Calls callbackCellSelect function.
 *
 * @private
 * @param {object} objCell Cell object
 */
Masc.Grid.prototype.selectCell = function(objCell) {
  // Check arguments
  if (!objCell || objCell.selected) {
    return;
  }
  // Select callback
  if (typeof this.config.callbackCellSelect == 'function') {
    this.config.callbackCellSelect(this, objCell);
  }
  // Display updates if we are responsible for visualisation
  if (this.visualizeSelectCell && this.config.selectCells && this.visualize) {
    this.visualizeSelectCell(objCell);
  }
  // Select cell
  objCell.selected = true;
};

/**
 * Unselects a cell. Calls callbackCellUnselect function.
 *
 * @private
 * @param {object} objCell Cell object
 */
Masc.Grid.prototype.unselectCell = function(objCell) {
  // Check arguments
  if (!objCell || !objCell.selected) {
    return;
  }
  // Unselect cell
  var undef;
  objCell.selected = undef;
  // Display updates if we are responsible for visualisation
  if (this.visualizeUnselectCell && this.config.selectCells && this.visualize) {
    this.visualizeUnselectCell(objCell);
  }
  // Unselect callback
  if (typeof this.config.callbackCellUnselect == 'function') {
    this.config.callbackCellUnselect(this, objCell);
  }
};

/**
 * Selects clicked row. Supports multiple selections with "Shift" and "Ctrl"
 * clicking. Calls callbackCellOnClick function. If callbackCellOnClick is not
 * defined, calls callbackRowOnClick function.
 *
 * @private
 * @param {number} iRowId Id of row that was clicked
 * @param {number} iCellId Optional. Id of cell that was clicked
 */
Masc.Grid.prototype.rowOnClick = function(iRowId, iCellId) {
  // Get clicked row and cell
  var objRow = this.getRowById(iRowId);
  if (!objRow) {
    return;
  }
  var objCell = null;
  if (typeof iCellId != 'undefined') {
    objCell = this.getCellById(iRowId, iCellId);
    if (!objCell) {
      return;
    }
  }
  // Get modifiers
  var boolShift = false;
  var boolCtrl = false;
  if (this.config.multipleSelect) {
    // There should be at least one item selected to use "Shift"
    if (this.lastSelection) {
      boolShift = window.event.shiftKey;
    }
    // metaKey for Safari
    boolCtrl = window.event.ctrlKey || window.event.metaKey;
  }
  // Unselect rows and cells
  if (!boolShift && !boolCtrl) {
    // Unselect all rows except clicked if "Shift" or "Ctrl" is not holded
    for (var iRow = 0; iRow < this.rows.length; iRow++) {
      var objCurrRow = this.rows[iRow];
      if (!objCurrRow || !objCurrRow.selected) {
        continue;
      }
      // Unselect all cells except clicked
      if (objCell) {
        for (var iCol = 0; iCol < this.fields.length; iCol++) {
          var objCurrCell = objCurrRow.cells[iCol];
          if (!objCurrCell) {
            continue;
          }
          if (!(objCurrRow.i == iRowId &&
           objCurrCell.i == iCellId)) {
            // Unselect cell
            this.unselectCell(objCurrCell);
          }
        }
      }
      // Unselect row
      if (objCurrRow.i != iRowId) {
        this.unselectRow(objCurrRow);
      }
    }
  } else if (boolShift) {
    // Unselect previous multiple selection
    // Unselect rows
    if (this.lastSelection.rows instanceof Array) {
      for (var iRow = 0; iRow < this.lastSelection.rows.length; iRow++) {
        this.unselectRow(this.lastSelection.rows[iRow]);
      }
    }
    // Unselect cells
    if (this.lastSelection.cells instanceof Array) {
      for (var iCell = 0; iCell < this.lastSelection.cells.length; iCell++) {
        this.unselectCell(this.lastSelection.cells[iCell]);
      }
    }
  }
  // OnClick callback
  if (objCell && typeof this.config.callbackCellOnClick == 'function') {
    this.config.callbackCellOnClick(this, objCell);
  } else if (typeof this.config.callbackRowOnClick == 'function') {
    this.config.callbackRowOnClick(this, objRow);
  }
  // Select rows and cells
  if (!boolShift) {
    // Select row
    this.selectRow(objRow);
    this.lastSelection = {
      rowId: iRowId
    };
    // Select cell
    if (objCell) {
      this.selectCell(objCell);
      this.lastSelection.cellId = iCellId;
    }
  } else {
    // Multiple selection
    var iSelectionStartRowId = this.lastSelection.rowId;
    var iSelectionStartCellId = this.lastSelection.cellId;
    this.lastSelection.rows = [];
    this.lastSelection.cells = [];
    var arrSelectedRows = this.lastSelection.rows;
    var arrSelectedCells = this.lastSelection.cells;
    // Get first and last row of the selection
    var iRow = 0;
    var iLastRow = 0;
    while (this.filteredRows[iRow]) {
      var iCurrRowId = this.filteredRows[iRow].i;
      if (iCurrRowId == iRowId) {
        iLastRow = iSelectionStartRowId;
        break;
      } else if (iCurrRowId == iSelectionStartRowId) {
        iLastRow = iRowId;
        break;
      }
      iRow++;
    }
    // Get first and last cell of the selection
    var iFirstCell = 0;
    var iLastCell = 0;
    if (objCell && typeof iSelectionStartCellId != 'undefined') {
      if (iCellId < iSelectionStartCellId) {
        iFirstCell = iCellId;
        iLastCell = iSelectionStartCellId;
      } else {
        iFirstCell = iSelectionStartCellId;
        iLastCell = iCellId;
      }
    }
    // Select rows and cells
    while (this.filteredRows[iRow]) {
      var objCurrRow = this.filteredRows[iRow];
      // Select row
      if (!objCurrRow.selected) {
        this.selectRow(objCurrRow);
        arrSelectedRows.push(objCurrRow);
      }
      // Select cells
      if (objCell) {
        for (var iCell = iFirstCell; iCell <= iLastCell; iCell++) {
          var objCurrCell = objCurrRow.cells[iCell];
          // Select cell
          if (!objCurrCell.selected) {
            this.selectCell(objCurrCell);
            arrSelectedCells.push(objCurrCell);
          }
        }
      }
      if (objCurrRow.i == iLastRow) {
        // Last row in the selection
        break;
      }
      iRow++;
    }
  }
};

/**
 * Handles click on the row.
 *
 * @private
 * @param {number} iGridId Id of the grid
 * @param {number} iRowId Id of row that was clicked
 * @param {number} iCellId Optional. Id of cell that was clicked
 */
Masc.Grid.rowOnClick = function(iGridId, iRowId, iCellId) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid && objGrid.rowOnClick) {
    // Call method
    objGrid.rowOnClick(iRowId, iCellId);
  }
};

/**
 * Calls callbackCellOnDblClick function. If callbackCellOnDblClick is not
 * defined, calls callbackRowOnDblClick function.
 *
 * @private
 * @param {number} iRowId Id of row that was clicked
 * @param {number} iCellId Optional. Id of cell that was clicked
 */
Masc.Grid.prototype.rowOnDblClick = function(iRowId, iCellId) {
  // Get double clicked row and cell
  var objRow = this.getRowById(iRowId);
  if (!objRow) {
    return;
  }
  var objCell = null;
  if (typeof iCellId != 'undefined') {
    objCell = this.getCellById(iRowId, iCellId);
    if (!objCell) {
      return;
    }
  }
  // OnDblClick callback
  if (objCell && typeof this.config.callbackCellOnDblClick == 'function') {
    this.config.callbackCellOnDblClick(this, objCell);
  } else if (typeof this.config.callbackRowOnDblClick == 'function') {
    this.config.callbackRowOnDblClick(this, objRow);
  }
};

/**
 * Handles double click on the row.
 *
 * @private
 * @param {number} iGridId Id of the grid
 * @param {number} iRowId Id of row that was clicked
 * @param {number} iCellId Optional. Id of cell that was clicked
 */
Masc.Grid.rowOnDblClick = function(iGridId, iRowId, iCellId) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid && objGrid.rowOnDblClick) {
    // Call method
    objGrid.rowOnDblClick(iRowId, iCellId);
  }
};

/**
 * Unselects all selected rows and cells.
 */
Masc.Grid.prototype.clearSelection = function() {
  // Unselect all rows
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    var objCurrRow = this.rows[iRow];
    if (objCurrRow.selected) {
      // Unselect all cells
      for (var iCol = 0; iCol < objCurrRow.cells.length; iCol++) {
        this.unselectCell(objCurrRow.cells[iCol]);
      }
      // Unselect row
      this.unselectRow(objCurrRow);
    }
  }
};

/**
 * Returns selected rows in an array.
 *
 * @return Array of row objects
 * @type object
 */
Masc.Grid.prototype.getSelectedRows = function() {
  var arrSelected = [];
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    var objCurrRow = this.rows[iRow];
    if (objCurrRow.selected) {
      arrSelected.push(objCurrRow);
    }
  }
  return arrSelected;
};

/**
 * Returns selected cells in an array.
 *
 * @return Array of cell objects
 * @type object
 */
Masc.Grid.prototype.getSelectedCells = function() {
  var arrSelected = [];
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    var objCurrRow = this.rows[iRow];
    if (objCurrRow.selected) {
      for (var iCol = 0; iCol < this.fields.length; iCol++) {
        var objCurrCell = objCurrRow.cells[iCol];
        if (objCurrCell.selected) {
          arrSelected.push(objCurrCell);
        }
      }
    }
  }
  return arrSelected;
};

/**
 * Returns rows with cells having invalid value in an array.
 *
 * @return Array of row objects
 * @type object
 */
Masc.Grid.prototype.getInvalidRows = function() {
  var arrInvalid = [];
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    var objCurrRow = this.rows[iRow];
    if (objCurrRow.invalid) {
      arrInvalid.push(objCurrRow);
    }
  }
  return arrInvalid;
};

/**
 * Returns cells having invalid value in an array.
 *
 * @return Array of cell objects
 * @type object
 */
Masc.Grid.prototype.getInvalidCells = function() {
  var arrInvalid = [];
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    var objCurrRow = this.rows[iRow];
    if (objCurrRow.invalid) {
      for (var iCol = 0; iCol < this.fields.length; iCol++) {
        var objCurrCell = objCurrRow.cells[iCol];
        if (objCurrCell.invalid) {
          arrInvalid.push(objCurrCell);
        }
      }
    }
  }
  return arrInvalid;
};

/**
 * Handles the click on filter out checkbox. Filters out rows if checkbox is
 * unchecked. Shows rows if checkbox is checked.
 *
 * @private
 * @param {string} iGridId Grid id
 * @param {object} arrCols Array of zero based column numbers or single zero
 * based column number to filter
 * @param {string} strValue Value to filter out
 * @param {boolean} boolChecked Show rows having this value or not
 */
Masc.Grid.checkboxOnClick = function(iGridId, arrCols, strVal, boolChecked) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (objGrid && objGrid.filterOut) {
    // Filter out grid
    objGrid.filterOut({
      column: arrCols,
      value: strVal,
      show: boolChecked
    });
  }
};

/**
 * Handles the click on "Select all" link inside filter out form. Removes all
 * hidden values from the specified columns.
 *
 * @private
 * @param {string} iGridId Grid id
 * @param {object} arrCols Array of zero based column numbers or single zero
 * based column number to remove hidden values from
 */
Masc.Grid.checkboxSelectAllOnClick = function(iGridId, arrCols) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (!objGrid || !objGrid.unfilterOutColumn || !objGrid.applyFilters ||
   !objGrid.displayFilterOut) {
    return
  }
  // Remove hidden values
  var boolApply = objGrid.unfilterOutColumn({
    column: arrCols
  });
  // Apply filters
  if (boolApply) {
    objGrid.applyFilters();
    // Refresh filter out forms
    objGrid.displayFilterOut();
  }
};

/**
 * Handles the click on "Clear all" link inside filter out form. Hides rows by
 * making all values of the specified columns hidden.
 *
 * @private
 * @param {string} iGridId Grid id
 * @param {object} arrCols Array of zero based column numbers or single zero
 * based column number to filter
 */
Masc.Grid.checkboxClearAllOnClick = function(iGridId, arrCols) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (!objGrid || !objGrid.getColumnRange || !objGrid.filterOutColumn ||
   !objGrid.applyFilters || !objGrid.displayFilterOut) {
    return;
  }
  // Get column range
  var objRange = objGrid.getColumnRange({
    column: arrCols
  });
  if (!objRange) {
    return;
  }
  // Get unique values
  var arrVals = [];
  for (var iVal = 0; iVal < objRange.values.length; iVal++) {
    arrVals.push(objRange.values[iVal].v + '');
  }
  // Filter out grid
  var boolApply = objGrid.filterOutColumn({
    column: arrCols,
    value: arrVals,
    show: false
  });
  // Apply filters
  if (boolApply) {
    objGrid.applyFilters();
    // Refresh filter out forms
    objGrid.displayFilterOut();
  }
};

/**
 * Handles the click on filter out link. Filters out all rows that don't have
 * specified value in the specified columns.
 *
 * @private
 * @param {string} iGridId Grid id
 * @param {object} arrCols Array of zero based column numbers or single zero
 * based column number to filter
 * @param {string} strVal Selected value to show
 */
Masc.Grid.checkboxLinkOnClick = function(iGridId, arrCols, strVal) {
  // Get grid object
  var objGrid = Masc.Widget.getWidgetById(iGridId);
  if (!objGrid || !objGrid.getColumnRange || !objGrid.filterOutColumn ||
   !objGrid.applyFilters || !objGrid.displayFilterOut) {
    return;
  }
  // Get column range
  var objRange = objGrid.getColumnRange({
    column: arrCols
  });
  if (!objRange) {
    return;
  }
  // Get unique values
  var arrVals = [];
  for (var iVal = 0; iVal < objRange.values.length; iVal++) {
    arrVals.push(objRange.values[iVal].v + '');
  }
  // Clear all
  var boolClear = objGrid.filterOutColumn({
    column: arrCols,
    value: arrVals,
    show: false
  });
  // Show selected value
  var boolShow = objGrid.filterOutColumn({
    column: arrCols,
    value: strVal,
    show: true
  });
  // Apply filters
  if (boolClear || boolShow) {
    objGrid.applyFilters();
    // Refresh filter out forms
    objGrid.displayFilterOut();
  }
};

/**
 * Displays filter out forms.
 * @private
 */
Masc.Grid.prototype.displayFilterOut = function() {
  // Go through all filterOut arguments
  for (var iFo = 0; iFo < this.config.filterOut.length; iFo++) {
    var objFilterOut = this.config.filterOut[iFo];
    // Get column range
    var objRange = this.getColumnRange(objFilterOut);
    if (!objRange) {
      continue;
    }
    // Get unique values
    var arrVals = objRange.values;
    // Sort in descending order if needed
    if (objFilterOut.sortDesc) {
      arrVals.sort(function(leftVal, rightVal) {
        if (leftVal.c < rightVal.c) {
          return 1;
        }
        if (leftVal.c > rightVal.c) {
          return -1;
        }
        return 0;
      });
    }
    // Display form
    if (typeof objFilterOut.callback == 'function') {
      // Get columns
      var arrCols = objFilterOut.column;
      if (!(arrCols instanceof Array)) {
        arrCols = [arrCols];
      }
      // Get fields
      var arrFields = [];
      for (var iCol = 0; iCol < arrCols.length; iCol++) {
        var objField = this.fields[arrCols[iCol]];
        if (!objField) {
          continue;
        }
        arrFields.push(objField);
      }
      if (!arrFields.length) {
        continue;
      }
      // Join column numbers
      var strCols = arrCols.join(',');
      // Use callback function
      var arrChoices = [];
      for (var iVal = 0; iVal < arrVals.length; iVal++) {
        var strVal = arrVals[iVal].v + '';
        var strEscaped = escape(strVal);
        var objChoice = {};
        objChoice.value = strVal;
        objChoice.onclick = "Masc.Grid.checkboxOnClick('" + this.id +
         "',[" + strCols + "],unescape('" + strEscaped + "'),this.checked)";
        // Check if this value is hidden
        objChoice.checked = false;
        for (var iField = 0; iField < arrFields.length; iField++) {
          var objField = arrFields[iField];
          if (!(objField.hiddenValues instanceof Array) ||
           Masc.Utils.arrIndexOf(objField.hiddenValues, strVal) < 0) {
            objChoice.checked = true;
            break;
          }
        }
        objChoice.link = "Masc.Grid.checkboxLinkOnClick('" + this.id +
         "',[" + strCols + "],unescape('" + strEscaped + "'))";
        if (iVal == 0) {
          objChoice.selectall = "Masc.Grid.checkboxSelectAllOnClick('" +
           this.id + "',[" + strCols + "])";
          objChoice.clearall = "Masc.Grid.checkboxClearAllOnClick('" +
           this.id + "',[" + strCols + "])";
        }
        arrChoices.push(objChoice);
      }
      objFilterOut.callback(arrChoices);
    } else if (this.visualizeFilterOut) {
      // Use container
      this.visualizeFilterOut(objFilterOut, arrVals);
    }
  }
};

/**
 * Returns range of values of the specified column. If field property
 * "columnRange" of the column is defined, it is returned instead. If array of
 * column numbers is passed, returns range of values of the result of all
 * specified columns concatenation.
 *
 * <pre>
 * Arguments object format:
 * {
 *   column: [object or number] array of zero based column numbers or single
 *    zero based column number
 * }
 *
 * Return object format:
 * {
 *   min: [any] min value to compare,
 *   minValue: [string] min value to display,
 *   minOrig: [any] min original value,
 *   max: [any] max value to compare,
 *   maxValue: [string] max value to display,
 *   maxOrig: [any] max original value,
 *   values: [object] array of unique column values in the following format:
 *   [
 *     {
 *       c: [any] value to compare,
 *       v: [string] value to display,
 *       o: [any] original value
 *     },
 *     ...
 *   ]
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return Range of column values or null
 * @type object
 */
Masc.Grid.prototype.getColumnRange = function(objArgs) {
  // Check arguments
  if (!objArgs || typeof objArgs.column == 'undefined') {
    return null;
  }
  // Get columns
  var arrCols = objArgs.column;
  if (!(arrCols instanceof Array)) {
    // Single column number was passed
    var objField = this.fields[objArgs.column];
    if (!objField) {
      return null;
    }
    // Get range defined by user
    if (typeof objField.columnRange != 'undefined') {
      return objField.columnRange;
    }
    // Form array
    arrCols = [objArgs.column];
  }
  // Get array of keys
  var arrKeys = [];
  // Auxiliary associative array
  var objKeys = {};
  for (var iRow = 0; iRow < this.rows.length; iRow++) {
    // Get row
    var objRow = this.rows[iRow];
    if (!objRow) {
      continue;
    }
    // For each passed column
    for (var iCol = 0; iCol < arrCols.length; iCol++) {
      // Get cell
      var objCell = objRow.cells[arrCols[iCol]];
      if (!objCell) {
        continue;
      }
      // Get cell value
      var strKey = this.getCellValueString(objCell);
      if (strKey.length && typeof objKeys[strKey] == 'undefined') {
        arrKeys.push({
          v: strKey,
          c: this.getCellValueCompare(objCell),
          o: this.getCellValueOriginal(objCell)
        });
        objKeys[strKey] = true;
      }
    }
  }
  if (!arrKeys.length) {
    // Empty array
    return null;
  }
  // Sort array of keys
  arrKeys.sort(function(leftVal, rightVal) {
    if (leftVal.c < rightVal.c) {
      return -1;
    }
    if (leftVal.c > rightVal.c) {
      return 1;
    }
    return 0;
  });
  // Return range of column values
  var iLastKey = arrKeys.length - 1;
  return {
    min: arrKeys[0].c,
    minValue: arrKeys[0].v,
    minOrig: arrKeys[0].o,
    max: arrKeys[iLastKey].c,
    maxValue: arrKeys[iLastKey].v,
    maxOrig: arrKeys[iLastKey].o,
    values: arrKeys
  };
};

/**
 * Returns number of records that are currently displayed.
 *
 * @return How many records are currently displayed
 * @type number
 */
Masc.Grid.prototype.recordsDisplayed = function() {
  if (this.config.dataOnDemand &&
   typeof this.data.displayedRows != 'undefined') {
    return this.data.displayedRows * 1;
  }
  return this.filteredRows.length;
};

/**
 * Returns total number of records.
 *
 * @return Total number of records
 * @type number
 */
Masc.Grid.prototype.totalRecords = function() {
  if (this.config.dataOnDemand &&
   typeof this.data.totalRows != 'undefined') {
    return this.data.totalRows * 1;
  }
  return this.rows.length;
};

/**
 * Returns grid id.
 *
 * @return Grid id
 * @type number
 */
Masc.Grid.prototype.getId = function() {
  return this.id;
};

/**
 * Returns grid style defined by user.
 *
 * @return Grid style
 * @type string
 */
Masc.Grid.prototype.getStyle = function() {
  if (this.data && this.data.style) {
    return this.data.style;
  }
  return '';
};

/**
 * Returns grid header style defined by user.
 *
 * @return Grid header style
 * @type string
 */
Masc.Grid.prototype.getHeaderStyle = function() {
  if (this.data && this.data.headerStyle) {
    return this.data.headerStyle;
  }
  return '';
};

/**
 * Returns reference to private array containing grid rows.
 *
 * @return Grid rows array
 * @type object
 */
Masc.Grid.prototype.getRows = function() {
  return this.rows;
};

/**
 * Returns reference to private array containing filtered rows. Note: to get
 * currently displayed rows use Masc.Grid#applyPaging method instead.
 *
 * @return Filtered rows array
 * @type object
 */
Masc.Grid.prototype.getFilteredRows = function() {
  return this.filteredRows;
};

/**
 * Returns row id.
 *
 * @param {object} objRow Row object
 * @return Row id or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getRowId = function(objRow) {
  if (objRow) {
    return objRow.i;
  }
};

/**
 * Returns visible row number.
 *
 * @param {object} objRow Row object
 * @return Row number or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getRowNumber = function(objRow) {
  if (objRow) {
    var iRowId = this.getRowId(objRow);
    var arrRows = this.applyPaging();
    for (var iRow = 0; iRow < arrRows.length; iRow++) {
      if (this.getRowId(arrRows[iRow]) == iRowId) {
        return iRow;
      }
    }
  }
};

/**
 * Returns row style defined by user.
 *
 * @param {object} objRow Row object
 * @return Row style
 * @type string
 */
Masc.Grid.prototype.getRowStyle = function(objRow) {
  if (objRow && objRow.style) {
    return objRow.style;
  }
  return '';
};

/**
 * Finds row by its id.
 *
 * @param {number} iRowId Row id
 * @return Row object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getRowById = function(iRowId) {
  return this.rowsIndex[iRowId];
};

/**
 * Finds row by cell.
 *
 * @param {object} objCell Cell object
 * @return Row object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getRowByCell = function(objCell) {
  if (objCell) {
    return this.getRowById(objCell.r);
  }
};

/**
 * Returns cells array of the row.
 *
 * @param {object} objRow Row object
 * @return Array of cell objects or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getRowCells = function(objRow) {
  if (objRow && objRow.cells instanceof Array) {
    return objRow.cells;
  }
};

/**
 * Sets row style.
 *
 * @param {object} objRow Row object
 * @param {string} strStyle New row style
 * @return Updated row object
 * @type object
 */
Masc.Grid.prototype.setRowStyle = function(objRow, strStyle) {
  if (objRow instanceof Object) {
    objRow.style = strStyle;
  }
  return objRow;
};

/**
 * Returns reference to private array containing grid fields.
 *
 * @return Grid fields array
 * @type object
 */
Masc.Grid.prototype.getFields = function() {
  return this.fields;
};

/**
 * Returns field id.
 *
 * @param {object} objField Field object
 * @return Field id or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getFieldId = function(objField) {
  if (objField) {
    return objField.i;
  }
};

/**
 * Returns column title.
 *
 * @param {object} objField Field object
 * @return Column title
 * @type string
 */
Masc.Grid.prototype.getFieldTitle = function(objField) {
  if (objField && objField.title) {
    return objField.title;
  }
  return '';
};

/**
 * Returns field data type.
 *
 * @param {object} objField Field object
 * @return Field data type or undefined if not found
 * @type string
 */
Masc.Grid.prototype.getFieldType = function(objField) {
  if (objField) {
    return objField.dataType;
  }
};

/**
 * Returns column width defined by user.
 *
 * @param {object} objField Field object
 * @return Column width
 * @type string
 */
Masc.Grid.prototype.getFieldWidth = function(objField) {
  if (objField && objField.columnWidth) {
    return objField.columnWidth;
  }
  return '';
};

/**
 * Returns field style defined by user.
 *
 * @param {object} objField Field object
 * @return Field style
 * @type string
 */
Masc.Grid.prototype.getFieldStyle = function(objField) {
  if (objField && objField.style) {
    return objField.style;
  }
  return '';
};

/**
 * Returns true if field is hidden.
 *
 * @param {object} objField Field object
 * @return True if field is hidden
 * @type boolean
 */
Masc.Grid.prototype.getFieldHidden = function(objField) {
  if (objField) {
    return objField.hidden;
  }
};

/**
 * Returns true if it is not allowed to sort the field.
 *
 * @param {object} objField Field object
 * @return True if it is not allowed to sort the field
 * @type boolean
 */
Masc.Grid.prototype.getFieldNosort = function(objField) {
  if (objField) {
    return objField.nosort;
  }
};

/**
 * Returns true if the field is sorted ascending.
 *
 * @param {object} objField Field object
 * @return True if the field is sorted ascending
 * @type boolean
 */
Masc.Grid.prototype.getFieldSorted = function(objField) {
  if (objField) {
    return objField.sorted;
  }
};

/**
 * Returns true if the field is sorted descending.
 *
 * @param {object} objField Field object
 * @return True if the field is sorted descending
 * @type boolean
 */
Masc.Grid.prototype.getFieldSortedDesc = function(objField) {
  if (objField) {
    return objField.sortedDesc;
  }
};

/**
 * Forms field onclick attribute value.
 *
 * @param {object} objField Field object
 * @return Field onclick attribute value
 * @type string
 */
Masc.Grid.prototype.getFieldOnclick = function(objField) {
  if (objField && !objField.nosort) {
    return "Masc.Grid.sort('" + this.id + "','" + objField.i + "')";
  }
  return '';
};

/**
 * Finds field by its id.
 *
 * @param {number} iFieldId Field id
 * @return Field object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getFieldById = function(iFieldId) {
  return this.fields[iFieldId];
};

/**
 * Finds field by cell.
 *
 * @param {object} objCell Cell object
 * @return Field object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getFieldByCell = function(objCell) {
  if (objCell) {
    return this.getFieldById(objCell.i);
  }
};

/**
 * Returns cell id.
 *
 * @param {object} objCell Cell object
 * @return Cell id or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getCellId = function(objCell) {
  if (objCell) {
    return objCell.i;
  }
};

/**
 * Returns cell row id.
 *
 * @param {object} objCell Cell object
 * @return Cell row id or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getCellRowId = function(objCell) {
  if (objCell) {
    return objCell.r;
  }
};

/**
 * Returns cell visible row number.
 *
 * @param {object} objCell Cell object
 * @return Cell row number or undefined if not found
 * @type number
 */
Masc.Grid.prototype.getCellRowNumber = function(objCell) {
  if (objCell) {
    var iRowId = this.getCellRowId(objCell);
    var arrRows = this.applyPaging();
    for (var iRow = 0; iRow < arrRows.length; iRow++) {
      if (this.getRowId(arrRows[iRow]) == iRowId) {
        return iRow;
      }
    }
  }
};

/**
 * Finds cell by its row and cell id.
 *
 * @param {object} objRow Row object
 * @param {number} iCellId Cell id
 * @return Cell object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getCellByRow = function(objRow, iCellId) {
  var arrCells = this.getRowCells(objRow);
  if (arrCells) {
    return arrCells[iCellId];
  }
};

/**
 * Finds cell by its row id and cell id.
 *
 * @param {number} iRowId Row id
 * @param {number} iCellId Cell id
 * @return Cell object or undefined if not found
 * @type object
 */
Masc.Grid.prototype.getCellById = function(iRowId, iCellId) {
  return this.getCellByRow(this.getRowById(iRowId), iCellId);
};

/**
 * Returns cell value to display.
 *
 * @param {object} objCell Cell object
 * @return Cell value to display
 * @type any
 */
Masc.Grid.prototype.getCellValue = function(objCell) {
  if (!objCell) {
    return;
  }
  return objCell.v;
};

/**
 * Returns cell value to display as string.
 *
 * @param {object} objCell Cell object
 * @return Cell value to display
 * @type string
 */
Masc.Grid.prototype.getCellValueString = function(objCell) {
  return this.getCellValue(objCell) + '';
};

/**
 * Returns cell value to compare.
 *
 * @param {object} objCell Cell object
 * @return Cell value to compare
 * @type any
 */
Masc.Grid.prototype.getCellValueCompare = function(objCell) {
  if (!objCell) {
    return '';
  }
  if (typeof objCell.c != 'undefined') {
    return objCell.c;
  }
  return this.getCellValue(objCell);
};

/**
 * Returns original cell value.
 *
 * @param {object} objCell Cell object
 * @return Original cell value
 * @type any
 */
Masc.Grid.prototype.getCellValueOriginal = function(objCell) {
  if (!objCell) {
    return '';
  }
  if (typeof objCell.o != 'undefined') {
    return objCell.o;
  }
  return this.getCellValue(objCell);
};

/**
 * Returns cell style defined by user.
 *
 * @param {object} objCell Cell object
 * @return User defined cell style
 * @type string
 */
Masc.Grid.prototype.getCellStyle = function(objCell, iRow) {
  // Check arguments
  if (!objCell) {
    return '';
  }
  // Get style defined by user
  var strStyle = '';
  // Try funcStyle
  if (typeof this.config.funcStyle == 'function') {
    strStyle = this.config.funcStyle(this, objCell, iRow);
  }
  // Try value got from source
  if (!strStyle) {
    strStyle = objCell.style;
  }
  return strStyle;
};

/**
 * Returns cell data type.
 *
 * @param {object} objCell Cell object
 * @return Cell data type or undefined if not found
 * @type string
 */
Masc.Grid.prototype.getCellDataType = function(objCell) {
  var objField = this.getFieldByCell(objCell);
  if (objField) {
    return objField.dataType;
  }
};

/**
 * Returns data to be displayed in grid cell.
 *
 * @param {object} objCell Cell object
 * @param {number} iMode Optional. Mode for show as is: 1 = check show_asis,
 * 2 = show converted, 3 = show as is with any conversion, 4 = original value.
 * Default: 1.
 * @return Data to display for this cell
 * @type string
 */
Masc.Grid.prototype.getCellData = function(objCell, iMode) {
  // Check arguments
  if (!objCell) {
    return 'undefined';
  }
  if (!iMode) {
    iMode = 1;
  }
  // Check show_asis
  if ((iMode == 1 && !this.config.show_asis) || iMode == 2) {
    // Default representation
    return this.getCellValueString(objCell);
  }
  // Form value
  var strData = this.getCellValueOriginal(objCell) + '';
  if (iMode == 4) {
    // Original value
    return strData;
  }
  // iMode == 3
  if (typeof this.config.show_asis == 'object') {
    // Call function to create presentable data for grid cell
    if (typeof this.config.show_asis.funcShow == 'function') {
      strData = this.config.show_asis.funcShow(this, objCell);
    }
    // Show both
    if (this.config.show_asis.bBoth) {
      strData = '<u>' + strData + '</u><br>' + this.getCellValueString(objCell);
    }
  }
  return strData;
};

/**
 * Sets cell value.
 *
 * @param {object} objCell Cell object
 * @param {any} value New cell value
 * @return Updated cell object
 * @type object
 */
Masc.Grid.prototype.setCellValue = function(objCell, value) {
  if (!objCell) {
    objCell = {};
  }
  objCell.v = value;
  return this.convertCell(objCell);
};

/**
 * Sets cell style.
 *
 * @param {object} objCell Cell object
 * @param {string} strStyle New cell style
 * @return Updated cell object
 * @type object
 */
Masc.Grid.prototype.setCellStyle = function(objCell, strStyle) {
  if (objCell instanceof Object) {
    objCell.style = strStyle;
  }
  return objCell;
};
