// $Id: zpgrid-html.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Plugin for Masc Grid to input grid data from HTML source.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/**
 * Loads data from HTML table source. Utilizes custom "style" attributes.
 *
 * @private
 * @param {object} objSource Input HTMLElement object
 */
Masc.Grid.prototype.loadDataHtml = function(objSource) {
  var objTable = null;
  if (objSource) {
    objTable = objSource;
  } else if (this.container) {
    objTable = Masc.Utils.getFirstChild(this.container, 'table');
  }
  if (!objTable) {
    alert("Masc.Grid invalid configuration: Can't find source table");
    return;
  }
  var objTbody = Masc.Utils.getFirstChild(objTable, 'tbody');
  if (!objTbody) {
    objTbody = objTable;
  }
  var objHeaderRow = Masc.Utils.getFirstChild(objTbody, 'tr');
  if (!objHeaderRow) {
    alert("Masc.Grid invalid configuration: Can't find header for table");
    return;
  }
  // Remove old data
  this.data = this.newDataHtml(objTable, objHeaderRow);
  this.fields = this.data.fields;
  this.rows = this.data.rows;
  this.rowsIndex = [];
  // Go to first page
  this.currentPage = 0;
  // Get fields
  var objTableCell = Masc.Utils.getFirstChild(objHeaderRow, 'th', 'td');
  while (objTableCell) {
    // Add field
    this.fields.push(this.newFieldHtml(objTableCell));
    // Next field
    objTableCell = Masc.Utils.getNextSibling(objTableCell, 'th', 'td');
  }
  // Get rows
  var objTableRow = Masc.Utils.getNextSibling(objHeaderRow, 'tr');
  while (objTableRow) {
    // Create row
    var objRow = this.newRowHtml(objTableRow);
    // Add row
    this.rows.push(objRow);
    this.rowsIndex.push(objRow);
    // Next row
    objTableRow = Masc.Utils.getNextSibling(objTableRow, 'tr');
  }
  // Show grid
  this.show();
};

/**
 * Creates new data object from HTML source.
 *
 * @private
 * @param {object} objTable Table element
 * @param {object} objHeaderRow First table row element in the table
 * @return Data object
 * @type object
 */
Masc.Grid.prototype.newDataHtml = function(objTable, objHeaderRow) {
  // Create data object
  var objData = {
    fields: [],
    rows: []
  };
  // Set style
  var strStyle = Masc.Widget.getStyle(objTable);
  if (strStyle) {
    objData.style = strStyle;
  }
  var strHeaderStyle = Masc.Widget.getStyle(objHeaderRow);
  if (strHeaderStyle) {
    objData.headerStyle = strHeaderStyle;
  }
  return objData;
};

/**
 * Creates new field object from HTML table cell element.
 *
 * @private
 * @param {object} objTableCell Table cell element
 * @return Field object
 * @type object
 */
Masc.Grid.prototype.newFieldHtml = function(objTableCell) {
  // Create field object
  var objField = {
    i: this.fields.length,
    title: objTableCell.innerHTML
  };
  // Set data type
  if (this.getTypeByClass) {
    objField.dataType = this.getTypeByClass(objTableCell.className);
  }
  // Set width
  var strWidth = objTableCell.getAttribute('width');
  if (strWidth) {
    strWidth += ''; // Convert to string
    if (strWidth.length) {
      objField.columnWidth = strWidth;
    }
  }
  // Set style
  var strStyle = Masc.Widget.getStyle(objTableCell);
  if (strStyle) {
    objField.style = strStyle;
  }
  // Set hidden
  var boolHidden = (objTableCell.className.indexOf('zpGridTypeHidden') >= 0);
  if (boolHidden) {
    objField.hidden = boolHidden;
  }
  // Set nosort
  var boolNosort = (objTableCell.className.indexOf('zpGridTypeNosort') >= 0);
  if (boolNosort) {
    objField.nosort = boolNosort;
  }
  // Set notags
  var boolNotags = (objTableCell.className.indexOf('zpGridTypeNotags') >= 0);
  if (boolNotags) {
    objField.notags = boolNotags;
  }
  // Set sortByColumn
  var arrMatch = objTableCell.className.match(/zpGridTypeSortBy(\d+)/);
  if (arrMatch) {
    objField.sortByColumn = arrMatch[1];
  }
  return objField;
};

/**
 * Creates new row object from HTML table row element.
 *
 * @private
 * @param {object} objTableRow Table row element
 * @return Row object
 * @type object
 */
Masc.Grid.prototype.newRowHtml = function(objTableRow) {
  // Create new row object
  var objRow = {
    i: this.rowsIndex.length,
    cells: []
  };
  // Set height
  var strHeight = objTableRow.getAttribute('height');
  if (strHeight) {
    strHeight += ''; // Convert to string
    if (strHeight.length) {
      objRow.height = strHeight;
    }
  }
  // Set style
  var strStyle = Masc.Widget.getStyle(objTableRow);
  if (strStyle) {
    objRow.style = strStyle;
  }
  // Get cells
  var objTableCell = Masc.Utils.getFirstChild(objTableRow, 'td', 'th');
  for (var iCol = 0; iCol < this.fields.length; iCol++) {
    // Add cell
    objRow.cells.push(this.newCellHtml(objTableCell, objRow.i, iCol));
    // Next cell
    if (objTableCell) {
      objTableCell = Masc.Utils.getNextSibling(objTableCell, 'td', 'th');
    }
  }
  return objRow;
};

/**
 * Creates new cell object from HTML table cell element.
 *
 * @private
 * @param {object} objTableCell Table cell element
 * @param {number} iRow Row id
 * @param {number} iCol Column id
 * @return Cell object
 * @type object
 */
Masc.Grid.prototype.newCellHtml = function(objTableCell, iRow, iCol) {
  // Create cell object
  var objCell = {
    i: iCol,
    r: iRow,
    v: ''
  };
  if (objTableCell) {
    // Set value
    objCell.v = objTableCell.innerHTML;
    // Facilitate migrating from an existing <table> to the grid
    if (this.fields[iCol].notags) {
      // Remove tags
      objCell.v = objCell.v.replace(/<[^>]*>/g, '');
    }
    // Set style
    var strCellStyle = Masc.Widget.getStyle(objTableCell);
    if (strCellStyle) {
      objCell.style = strCellStyle;
    }
  }
  // Convert cell value
  objCell = this.convertCell(objCell);
  return objCell;
};
