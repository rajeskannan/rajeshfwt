// $Id: zpgrid-output.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Plugin for Masc Grid to display grid.
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
 * If there are several containers, synchronizes their width.
 * @private
 */
Masc.Grid.prototype.synchronizeContainers = function() {
  // At least 2 containers must be defined
  if (!this.container || (!this.headerContainer && !this.paginationContainer)) {
    return;
  }
  // Get container width
  var iContainerWidth = this.container.clientWidth;
  var objTable = null;
  if (this.container.firstChild && this.container.firstChild.firstChild) {
    objTable = this.container.firstChild.firstChild.firstChild;
  }
  if (objTable && (!iContainerWidth || !this.container.style.width ||
   objTable.offsetWidth < iContainerWidth)) {
    iContainerWidth = objTable.offsetWidth;
  }
  if (iContainerWidth) {
    // If there is separate container for header
    if (this.headerContainer) {
      this.headerContainer.style.width = iContainerWidth + 'px';
    }
    // If there is separate container for pagination
    if (this.paginationContainer) {
      this.paginationContainer.style.width = iContainerWidth + 'px';
    }
  }
};

/**
 * Synchronizes scrolling.
 * @private
 */
Masc.Grid.prototype.synchronizeScrolling = function() {
  if (this.headerContainer) {
    Masc.Utils.createProperty(this.container, 'zpGridHeader',
     this.headerContainer);
  }
  if (this.config.fixedLeft > 0) {
    Masc.Utils.createProperty(this.container, 'zpGridFixedLeft',
     document.getElementById('zpGrid' + this.id + 'FixedLeft'));
    Masc.Utils.createProperty(this.container, 'zpGridDataFixedLeft',
     document.getElementById('zpGrid' + this.id + 'DataFixedLeft'));
  }
  if (this.container.zpGridHeader || this.container.zpGridFixedLeft) {
    Masc.Utils.createProperty(this.container, 'onscroll', function() {
      var iScrollLeft = this.scrollLeft;
      // Synchronize fixed columns
      if (this.zpGridDataFixedLeft) {
        this.zpGridDataFixedLeft.style.left = iScrollLeft + 'px';
      }
      if (this.zpGridFixedLeft) {
        this.zpGridFixedLeft.style.left = iScrollLeft + 'px';
      }
      // Synchronize header
      if (this.zpGridHeader) {
        this.zpGridHeader.scrollLeft = iScrollLeft;
      }
    });
    // Workaround for Opera 8
    if (window.opera) {
      this.synchronizeScrollingOpera();
    }
  }
};

/**
 * Synchronizes scrolling in Opera. Workaround for Opera 8 which doesn't support
 * DOM 3 scroll event.
 * @private
 */
Masc.Grid.prototype.synchronizeScrollingOpera = function() {
  var objHeaderDiv = null;
  if (this.headerContainer) {
    objHeaderDiv = this.headerContainer.firstChild;
    objHeaderDiv.style.position = 'relative';
  }
  // Synchronize position every 10 ms
  if (this.syncIntervalId) {
    clearInterval(this.syncIntervalId);
  }
  var objGrid = this;
  this.syncIntervalId = setInterval(function() {
    // Synchronize fixed columns
    var strScrollLeft = objGrid.container.scrollLeft + 'px';
    var objDataFixedLeft = objGrid.container.zpGridDataFixedLeft;
    if (objDataFixedLeft && objDataFixedLeft.style.left != strScrollLeft) {
      objDataFixedLeft.style.left = strScrollLeft;
    }
    var objFixedLeft = objGrid.container.zpGridFixedLeft;
    if (objFixedLeft && objFixedLeft.style.left != strScrollLeft) {
      objFixedLeft.style.left = strScrollLeft;
    }
    // Move header instead of scrolling
    var strHeaderLeft = -objGrid.container.scrollLeft + 'px';
    if (objHeaderDiv && objHeaderDiv.style.left != strHeaderLeft) {
      objHeaderDiv.style.left = strHeaderLeft;
    }
  }, 10);
};

/**
 * Synchronizes containers when theme is loaded.
 * @private
 */
Masc.Grid.prototype.visualizeThemeLoad = function() {
  this.synchronizeContainers();
};

/**
 * Synchronizes containers when grid is refreshed.
 * @private
 */
Masc.Grid.prototype.visualizeRefresh = function() {
  // Synchronize containers
  this.synchronizeContainers();
};

/**
 * Sets column widths and row heights after data loading.
 * @private
 */
Masc.Grid.prototype.visualizeDataLoad = function() {
  if (!this.container) {
    return;
  }
  // If there is separate container for header
  if (this.headerContainer) {
    // Set header overflow
    this.headerContainer.style.overflow = 'hidden';
  }
  // Load StyleSheet class
  var objGrid = this;
  Masc.Transport.loadJS({
    module: 'stylesheet',
    onLoad: function() {
      // Sets column widths and row heights
      objGrid.applyCellDimensions();
    }
  });
};

/**
 * Sets column widths and row heights.
 * @private
 */
Masc.Grid.prototype.applyCellDimensions = function() {
  // Get stylesheet
  if (!this.syncStyleSheet) {
    this.syncStyleSheet = new Masc.StyleSheet();
  } else {
    this.syncStyleSheet.removeRules();
  }
  // Set default column width and row height
  this.syncStyleSheet.addRule(
   '#zpGrid' + this.id + 'Container .zpGridTable div',
   'width:' + this.config.columnWidth + ';height:' + this.config.rowHeight);
  this.syncStyleSheet.addRule(
   '#zpGrid' + this.id + 'DataContainer .zpGridTable div',
   'width:' + this.config.columnWidth + ';height:' + this.config.rowHeight);
  // Set fixed column widths
  for (var iFld = 0, iCol = 0; iFld < this.fields.length; iFld++) {
    // Get field
    var objField = this.fields[iFld];
    // Skip hidden columns
    if (!objField || objField.hidden) {
      continue;
    }
    if (objField.columnWidth) {
      var strColumnWidth = Masc.Utils.correctCssLength(objField.columnWidth);
      // Set column width
      this.syncStyleSheet.addRule('#zpGrid' + this.id +
       'Container .zpGridTable .zpGridCell' + iCol + ' div',
       'width:' + strColumnWidth);
      this.syncStyleSheet.addRule('#zpGrid' + this.id +
       'DataContainer .zpGridTable .zpGridCell' + iCol + ' div',
       'width:' + strColumnWidth);
    }
    iCol++;
  }
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {boolean) boolFixed (Optional) Indicates that this is fixed part of
 * header
 */
Masc.Grid.prototype.outputTableOpen = function(arrHtml, boolFixed) {
  arrHtml.push('<table class="');
  arrHtml.push(this.getClassName({prefix: 'zpGrid'}));
  arrHtml.push(
   '" cellpadding="0" cellspacing="0"><tbody><tr><td class="zpGridTable');
  if (boolFixed) {
    arrHtml.push(' zpGridTableFixed');
  }
  arrHtml.push('"><table style="');
  if (this.data.style) {
    arrHtml.push(this.data.style);
  }
  arrHtml.push('"><tbody>');
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 */
Masc.Grid.prototype.outputTableClose = function(arrHtml) {
  arrHtml.push('</tbody></table></td></tr></tbody></table>');
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {object} arrCols Array with field objects to output
 * @param {number} iFixed (Optional) Number of fixed columns
 * @param {boolean) boolFixed (Optional) Indicates that this is fixed part of
 * header
 */
Masc.Grid.prototype.outputFields = function(arrHtml, arrCols, iFixed,
 boolFixed) {
  arrHtml.push('<tr id="zpGrid');
  arrHtml.push(this.id);
  arrHtml.push('Head');
  if (boolFixed) {
    arrHtml.push('Fixed');
  }
  var strClass = 'zpGridRow zpGridRow0 zpGridRowEven';
  var strClassActive = strClass +
   ' zpGridRowActive zpGridRowActive0 zpGridRowActiveEven';
  arrHtml.push('" class="');
  arrHtml.push(strClass);
  arrHtml.push('" onmouseover="this.className=\'');
  arrHtml.push(strClassActive);
  arrHtml.push("'");
  if (boolFixed) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push("Head').className='");
    arrHtml.push(strClassActive);
    arrHtml.push("'");
  } else if (this.config.fixedLeft > 0) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push("HeadFixed').className='");
    arrHtml.push(strClassActive);
    arrHtml.push("'");
  }
  arrHtml.push('" onmouseout="this.className=\'');
  arrHtml.push(strClass);
  arrHtml.push("'");
  if (boolFixed) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push("Head').className='");
    arrHtml.push(strClass);
    arrHtml.push("'");
  } else if (this.config.fixedLeft > 0) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push("HeadFixed').className='");
    arrHtml.push(strClass);
    arrHtml.push("'");
  }
  arrHtml.push('"');
  if (this.data.headerStyle) {
    arrHtml.push(' style="');
    arrHtml.push(this.data.headerStyle);
    arrHtml.push('"');
  }
  arrHtml.push('>');
  // Display fields
  var iFields = this.fields.length;
  var iShow = boolFixed ? iFixed : iFields;
  var iCols = arrCols.length;
  var boolHiddenCols = (!boolFixed && iFixed);
  for (var iField = 0, iCol = 0; iField < iFields && iField < iShow; iField++) {
    var boolHidden = (boolHiddenCols && iCol < iFixed);
    iCol += this.outputField(arrHtml, iCols, iField, iCol, boolHidden);
  }
  arrHtml.push('</tr>');
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {number} iCols Visible column count
 * @param {number} iField Column id
 * @param {number} iCol Visible column number
 * @param {boolean} boolHidden (Optional) Indicates that field is hidden
 * @return Number of displayed cells (0 or 1)
 * @type number
 */
Masc.Grid.prototype.outputField = function(arrHtml, iCols, iField, iCol,
 boolHidden) {
  // Get field
  var objField = this.fields[iField];
  // Skip hidden columns
  if (!objField || objField.hidden) {
    return 0;
  }
  var strCol = iCol.toString();
  var arrClass = [];
  arrClass.push('zpGridCell zpGridCell');
  arrClass.push(strCol);
  arrClass.push(' zpGridCell');
  arrClass.push(iCol % 2 == 1 ? 'Odd' : 'Even');
  if (iCol + 1 == iCols) { // Last column
    arrClass.push(' zpGridCellLast');
  }
  if (objField.sorted) { // Sorted ascending
    arrClass.push(' zpGridSortedAsc');
  } else if (objField.sortedDesc) { // Sorted descending
    arrClass.push(' zpGridSortedDesc');
  }
  var strClass = arrClass.join('');
  arrClass.push(' zpGridCellActive zpGridCellActive');
  arrClass.push(strCol);
  arrClass.push(' zpGridCellActive');
  arrClass.push(iCol % 2 == 1 ? 'Odd' : 'Even');
  if (iCol + 1 == iCols) { // Last column
    arrClass.push(' zpGridCellActiveLast');
  }
  if (objField.sorted) { // Sorted ascending
    arrClass.push(' zpGridSortedAscActive');
  } else if (objField.sortedDesc) { // Sorted descending
    arrClass.push(' zpGridSortedDescActive');
  }
  var strClassActive = arrClass.join('');
  arrHtml.push('<td class="');
  arrHtml.push(strClass);
  arrHtml.push('"');
  if (!boolHidden) {
    arrHtml.push(' id="zpGrid');
    arrHtml.push(this.id);
    arrHtml.push('Field');
    arrHtml.push(objField.i);
    arrHtml.push('" onmouseover="this.className=\'');
    arrHtml.push(strClassActive);
    arrHtml.push('\'" onmouseout="this.className=\'');
    arrHtml.push(strClass);
    arrHtml.push('\'"');
    if (!objField.nosort) {
      arrHtml.push(' onclick="Masc.Grid.sort(\'');
      arrHtml.push(this.id);
      arrHtml.push("','");
      arrHtml.push(objField.i);
      arrHtml.push('\')"');
    }
  }
  if (objField.style) {
    arrHtml.push(' style="');
    arrHtml.push(objField.style);
    arrHtml.push('"');
  }
  // div is needed to be able to set column width and row height
  // span is needed to be able to set right margin for arrow
  arrHtml.push('><div');
  if (objField.height) {
    arrHtml.push(' style="height:');
    arrHtml.push(objField.height);
    arrHtml.push('"');
  }
  arrHtml.push('><span>');
  arrHtml.push(objField.title);
  arrHtml.push('</span></div></td>');
  return 1;
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {object} arrCols Array with field objects to output
 * @param {object} arrRows Array with row objects to output
 * @param {object} iRow Index in arrRows array
 * @param {number} iFixed (Optional) Number of fixed columns
 * @param {boolean) boolFixed (Optional) Indicates that this is fixed part of
 * row
 */
Masc.Grid.prototype.outputRow = function(arrHtml, arrCols, arrRows, iRow,
 iFixed, boolFixed) {
  // Get row
  var objRow = arrRows[iRow];
  if (!objRow) {
    return;
  }
  var iRowN = iRow + 1;
  var strRow = iRowN.toString();
  var arrClass = [];
  arrClass.push('zpGridRow zpGridRow');
  arrClass.push(strRow);
  arrClass.push(' zpGridRow');
  arrClass.push(iRowN % 2 == 1 ? 'Odd' : 'Even');
  if (iRowN == arrRows.length) { // Last row
    arrClass.push(' zpGridRowLast');
  }
  if (this.config.selectRows && objRow.selected) {
    arrClass.push(' zpGridRowSelected zpGridRowSelected');
    arrClass.push(strRow);
    arrClass.push(' zpGridRowSelected');
    arrClass.push(iRowN % 2 == 1 ? 'Odd' : 'Even');
    if (iRowN == arrRows.length) { // Last row
      arrClass.push(' zpGridRowSelectedLast');
    }
  }
  if (objRow.invalid) {
    arrClass.push(' zpGridRowInvalid zpGridRowInvalid');
    arrClass.push(strRow);
    arrClass.push(' zpGridRowInvalid');
    arrClass.push(iRowN % 2 == 1 ? 'Odd' : 'Even');
    if (iRowN == arrRows.length) { // Last row
      arrClass.push(' zpGridRowInvalidLast');
    }
  }
  var strClass = arrClass.join('');
  var arrClassActive = [];
  arrClassActive.push(' zpGridRowActive zpGridRowActive');
  arrClassActive.push(strRow);
  arrClassActive.push(' zpGridRowActive');
  arrClassActive.push(iRowN % 2 == 1 ? 'Odd' : 'Even');
  if (iRowN == arrRows.length) { // Last row
    arrClassActive.push(' zpGridRowActiveLast');
  }
  var strClassActive = arrClassActive.join('');
  arrHtml.push('<tr id="zpGrid');
  arrHtml.push(this.id);
  arrHtml.push('Row');
  arrHtml.push(objRow.i);
  if (boolFixed) {
    arrHtml.push('Fixed');
  }
  arrHtml.push('" class="');
  arrHtml.push(strClass);
  arrHtml.push('" onmouseover="if(this.className.indexOf( \
   \'zpGridRowActive\')==-1){this.className+=\'');
  arrHtml.push(strClassActive);
  arrHtml.push("'");
  if (boolFixed) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push('Row');
    arrHtml.push(objRow.i);
    arrHtml.push("').className+='");
    arrHtml.push(strClassActive);
    arrHtml.push("'");
  } else if (this.config.fixedLeft > 0) {
    arrHtml.push(";document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push('Row');
    arrHtml.push(objRow.i);
    arrHtml.push("Fixed').className+='");
    arrHtml.push(strClassActive);
    arrHtml.push("'");
  }
  arrHtml.push("}\" onmouseout=\"this.className=this.className.replace( \
   /zpGridRowActive[^ ]*/g,'').split(/\\s+/).join(' ')");
  if (boolFixed) {
    arrHtml.push(";var objRow=document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push('Row');
    arrHtml.push(objRow.i);
    arrHtml.push("');objRow.className=objRow.className.replace( \
     /zpGridRowActive[^ ]*/g,'').split(/\\s+/).join(' ')");
  } else if (this.config.fixedLeft > 0) {
    arrHtml.push(";var objRow=document.getElementById('zpGrid");
    arrHtml.push(this.id);
    arrHtml.push('Row');
    arrHtml.push(objRow.i);
    arrHtml.push("Fixed');objRow.className=objRow.className.replace( \
     /zpGridRowActive[^ ]*/g,'').split(/\\s+/).join(' ')");
  }
  arrHtml.push('" ondblclick="this.onmouseout()" style="');
  if (objRow.style) {
    arrHtml.push(objRow.style);
  }
  arrHtml.push('">');
  // Display cells
  var iFields = this.fields.length;
  var iShow = boolFixed ? iFixed : iFields;
  var iCols = arrCols.length;
  var boolHiddenCols = (!boolFixed && iFixed);
  for (var iField = 0, iCol = 0; iField < iFields && iField < iShow; iField++) {
    var boolHidden = (boolHiddenCols && iCol < iFixed);
    iCol += this.outputCell(arrHtml, iRow, objRow, iCols, iField, iCol,
     boolHidden);
  }
  arrHtml.push('</tr>');
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {object} iRow Number of row on the page
 * @param {object} objRow Row object
 * @param {number} iCols Visible column count
 * @param {number} iField Column id
 * @param {number} iCol Visible column number
 * @param {boolean} boolHidden (Optional) Indicates that field is hidden
 * @return Number of displayed cells (0 or 1)
 * @type number
 */
Masc.Grid.prototype.outputCell = function(arrHtml, iRow, objRow, iCols,
 iField, iCol, boolHidden) {
  // Get field
  var objField = this.fields[iField];
  // Skip hidden columns
  if (!objField || objField.hidden) {
    return 0;
  }
  // Get cell
  var objCell = objRow.cells[iField];
  if (!objCell) {
    return 0;
  }
  var strCol = iCol.toString();
  var arrClass = [];
  arrClass.push('zpGridCell zpGridCell');
  arrClass.push(strCol);
  arrClass.push(' zpGridCell');
  arrClass.push(iCol % 2 == 1 ? 'Odd' : 'Even');
  if (iCol + 1 == iCols) { // Last cell
    arrClass.push(' zpGridCellLast');
  }
  if (this.config.selectCells && objCell.selected) {
    arrClass.push(' zpGridCellSelected zpGridCellSelected');
    arrClass.push(strCol);
    arrClass.push(' zpGridCellSelected');
    arrClass.push(iCol % 2 == 1 ? 'Odd' : 'Even');
    if (iCol + 1 == iCols) { // Last cell
      arrClass.push(' zpGridCellSelectedLast');
    }
  }
  if (objCell.invalid) {
    arrClass.push(' zpGridCellInvalid zpGridCellInvalid');
    arrClass.push(strCol);
    arrClass.push(' zpGridCellInvalid');
    arrClass.push(iCol % 2 == 1 ? 'Odd' : 'Even');
    if (iCol + 1 == iCols) { // Last cell
      arrClass.push(' zpGridCellInvalidLast');
    }
  }
  var strClass = arrClass.join('');
  var arrClassActive = [];
  arrClassActive.push(' zpGridCellActive zpGridCellActive');
  arrClassActive.push(strCol);
  arrClassActive.push(' zpGridCellActive');
  arrClassActive.push(iCol % 2 == 1 ? 'Odd' : 'Even');
  if (iCol + 1 == iCols) { // Last cell
    arrClassActive.push(' zpGridCellActiveLast');
  }
  var strClassActive = arrClassActive.join('');
  arrHtml.push('<td class="');
  arrHtml.push(strClass);
  arrHtml.push('" id="zpGrid');
  arrHtml.push(this.id);
  arrHtml.push('Row');
  arrHtml.push(objRow.i);
  arrHtml.push('Cell');
  arrHtml.push(objCell.i);
  if (boolHidden) {
    arrHtml.push('Hidden"');
  } else {
    arrHtml.push('" onmouseover="if(this.className.indexOf( \
     \'zpGridCellActive\')==-1)this.className+=\'');
    arrHtml.push(strClassActive);
    arrHtml.push('\'" onmouseout="this.className=this.className.replace( \
     /zpGridCellActive[^ ]*/g,\'\').split(/\\s+/).join(\' \')" \
     onclick="Masc.Grid.rowOnClick(\'');
    arrHtml.push(this.id);
    arrHtml.push("','");
    arrHtml.push(objRow.i);
    arrHtml.push("','");
    arrHtml.push(objCell.i);
    arrHtml.push('\')" ondblclick="this.onmouseout(); \
     Masc.Grid.rowOnDblClick(\'');
    arrHtml.push(this.id);
    arrHtml.push("','");
    arrHtml.push(objRow.i);
    arrHtml.push("','");
    arrHtml.push(objCell.i);
    arrHtml.push('\')"');
  }
  var strStyle = this.getCellStyle(objCell, iRow);
  if (strStyle) {
    arrHtml.push(' style="');
    arrHtml.push(strStyle);
    arrHtml.push('"');
  }
  arrHtml.push('>');
  this.outputCellValue(arrHtml, objField, objRow, objCell);
  arrHtml.push('</td>');
  return 1;
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 * @param {object} objField Field object
 * @param {object} objRow Row object
 * @param {object} objCell Cell object
 */
Masc.Grid.prototype.outputCellValue = function(arrHtml, objField, objRow,
 objCell) {
  // div is needed to be able to set column width and row height
  arrHtml.push('<div');
  // Set cell type
  if (this.getClassByType) {
    arrHtml.push(' class="');
    arrHtml.push(this.getClassByType(this.getFieldType(objField)));
    arrHtml.push('"');
  }
  // Set row height
  if (objRow.height) {
    arrHtml.push(' style="height:');
    arrHtml.push(Masc.Utils.correctCssLength(objRow.height));
    arrHtml.push('"');
  }
  arrHtml.push('>');
  var strData = this.getCellData(objCell);
  if (strData && typeof strData != 'string') {
    strData = strData.toString();
  }
  // Empty cell may cause visual problems in editable grid extension
  if (!strData || !strData.length) {
    strData = '&nbsp;';
  }
  arrHtml.push(strData);
  arrHtml.push('</div>');
};

/**
 * Forms grid output.
 *
 * @private
 * @param {object} arrHtml Output array
 */
Masc.Grid.prototype.outputPagination = function(arrHtml) {
  if (typeof this.config.callbackPaginationDisplay == 'function' ||
   this.config.rowsPerPage <= 0) {
    // No pagination
    return;
  }
  if (this.paginationContainer) {
    arrHtml.push('<div id="zpGrid');
    arrHtml.push(this.id);
    arrHtml.push('PaginationContainer"><div><table class="');
    arrHtml.push(this.getClassName({prefix: 'zpGrid'}));
    arrHtml.push('" cellpadding="0" cellspacing="0" \
     style="width:100%"><tbody>');
  }
  arrHtml.push('<tr><td class="zpGridPagination">Page');
  if (this.currentPage > 0) {
    // Don't display previous on the first page
    arrHtml.push(' <span class="zpGridFirstPage" \
     onclick="Masc.Grid.firstPage(\'');
    arrHtml.push(this.id);
    arrHtml.push('\')">&lt;&lt;</span> <span class="zpGridPrevPage" \
     onclick="Masc.Grid.previousPage(\'');
    arrHtml.push(this.id);
    arrHtml.push('\')">&lt;</span>');
  }
  // Get number of pages
  var iPages = this.totalPages();
  // Display up to 10 pages
  var iCurrentPage = this.getCurrentPageNumber();
  var iFirstPage = iCurrentPage - 4;
  var iLastPage = iCurrentPage + 5;
  for (var iPage = iFirstPage; iPage < iLastPage && iPage <= iPages; iPage++) {
    if (iPage < 1) {
      // Current page < 10
      continue;
    }
    arrHtml.push(' <span class="zpGrid');
    if (iPage == iCurrentPage) {
      arrHtml.push('CurrentPage">');
    } else {
      arrHtml.push('Page" onclick="Masc.Grid.gotoPage(\'');
      arrHtml.push(this.id);
      arrHtml.push("','");
      arrHtml.push(iPage);
      arrHtml.push('\')">');
    }
    arrHtml.push(iPage);
    arrHtml.push('</span>');
  }
  if (this.currentPage < iPages - 1) {
    // Don't display next on the last page
    arrHtml.push(' <span class="zpGridNextPage" \
     onclick="Masc.Grid.nextPage(\'');
    arrHtml.push(this.id);
    arrHtml.push('\')">&gt;</span> <span class="zpGridLastPage" \
     onclick="Masc.Grid.lastPage(\'');
    arrHtml.push(this.id);
    arrHtml.push('\')">&gt;&gt;</span>');
  }
  arrHtml.push(' of ');
  arrHtml.push(iPages);
  arrHtml.push(' (');
  arrHtml.push(this.recordsDisplayed());
  arrHtml.push(' rows)</td></tr>');
  if (this.paginationContainer) {
    arrHtml.push('</tbody></table></div></div>');
  }
};

/**
 * Displays grid. Forms new grid as plain HTML. Pushes strings into array, then
 * joins array to achieve maximum speed. Replaces previous contents of container
 * element with formed grid. Adds classes that can be used to create different
 * themes. Adds user defined styles.
 * @private
 */
Masc.Grid.prototype.refreshContainer = function() {
  // Check container
  if (!this.container) {
    alert("Can not find container for grid");
    return;
  }
  this.container.style.position = 'relative';
  // Get columns to display
  var arrCols = [];
  for (var iField = 0; iField < this.fields.length; iField++) {
    var objField = this.fields[iField];
    // Skip hidden columns
    if (!objField || objField.hidden) {
      continue;
    }
    arrCols.push(objField);
  }
  // Display grid
  if (this.headerContainer) {
    this.headerContainer.style.position = 'relative';
    var arrHtml = [];
    arrHtml.push('<div id="zpGrid');
    arrHtml.push(this.id);
    arrHtml.push('Container"><div>');
    // Header
    this.outputTableOpen(arrHtml);
    this.outputFields(arrHtml, arrCols, this.config.fixedLeft);
    this.outputTableClose(arrHtml);
    arrHtml.push('</div>');
    // Fixed header
    if (this.config.fixedLeft > 0) {
      arrHtml.push('<div id="zpGrid');
      arrHtml.push(this.id);
      if (this.headerContainer.style.setAttribute) {
        // IE
        arrHtml.push('FixedLeft" style="position:absolute;top:0px; \
         left:expression(this.offsetParent.scrollLeft+\'px\')"><div>');
      } else {
        // Other browsers don't support expressions yet
        arrHtml.push('FixedLeft" style="position:absolute;top:0px;left:');
        arrHtml.push(this.container.scrollLeft);
        arrHtml.push('px"><div>');
      }
      this.outputTableOpen(arrHtml, true);
      this.outputFields(arrHtml, arrCols, this.config.fixedLeft, true);
      this.outputTableClose(arrHtml);
      arrHtml.push('</div></div>');
    }
    arrHtml.push('</div>');
    // Draw header
    this.headerContainer.innerHTML = arrHtml.join('');
    // Clean container
    this.container.innerHTML = '';
    // Data
    var objContainer = Masc.Utils.createElement('div', this.container, true);
    objContainer.id = 'zpGrid' + this.id + 'DataContainer';
    // Get rows to display
    var arrRows = this.applyPaging();
    // Rows
    arrHtml = [];
    this.outputTableOpen(arrHtml);
    for (var iRow = 1, iRowNum = 0; iRow <= arrRows.length; iRow++, iRowNum++) {
      if (this.headerContainer && iRowNum > 0 && iRowNum % 10 == 0) {
        // Draw 10 rows
        this.outputTableClose(arrHtml);
        var objDiv = Masc.Utils.createElement('div', objContainer, true);
        objDiv.innerHTML = arrHtml.join('');
        // Next 10 rows
        arrHtml = [];
        this.outputTableOpen(arrHtml);
      }
      this.outputRow(arrHtml, arrCols, arrRows, iRowNum, this.config.fixedLeft);
    }
    // Pagination
    if (this.paginationContainer) {
      // Draw the rest of rows
      this.outputTableClose(arrHtml);
      var objDiv = Masc.Utils.createElement('div', objContainer, true);
      objDiv.innerHTML = arrHtml.join('');
      // Pagination
      arrHtml = [];
      this.outputPagination(arrHtml);
      this.paginationContainer.innerHTML = arrHtml.join('');
    } else {
      // Pagination
      arrHtml.push('</tbody></table></td></tr>');
      this.outputPagination(arrHtml);
      arrHtml.push('</tbody></table>');
      // Draw the rest of rows
      var objDiv = Masc.Utils.createElement('div', objContainer, true);
      objDiv.innerHTML = arrHtml.join('');
    }
    // Fixed columns
    if (this.config.fixedLeft > 0) {
      var objFixed = Masc.Utils.createElement('div', objContainer, true);
      objFixed.id = 'zpGrid' + this.id + 'DataFixedLeft';
      if (objFixed.style.setAttribute) {
        // IE
        objFixed.style.setAttribute('cssText', 'position:absolute;top:0px; \
         left:expression(this.offsetParent.scrollLeft+"px")', 0);
      } else {
        // Other browsers don't support expressions yet
        objFixed.style.position = 'absolute';
        objFixed.style.top = '0px';
        objFixed.style.left = this.container.scrollLeft + 'px';
      }
      var arrHtml = [];
      this.outputTableOpen(arrHtml, true);
      // Rows
      for (var iRow = 1, iNum = 0; iRow <= arrRows.length; iRow++, iNum++) {
        if (this.headerContainer && iNum > 0 && iNum % 10 == 0) {
          // Draw 10 rows
          this.outputTableClose(arrHtml);
          var objDiv = Masc.Utils.createElement('div', objFixed, true);
          objDiv.innerHTML = arrHtml.join('');
          // Next 10 rows
          arrHtml = [];
          this.outputTableOpen(arrHtml, true);
        }
        this.outputRow(arrHtml, arrCols, arrRows, iNum, this.config.fixedLeft,
         true);
      }
      this.outputTableClose(arrHtml);
      var objDiv = Masc.Utils.createElement('div', objFixed, true);
      objDiv.innerHTML = arrHtml.join('');
    }
  } else {
    // Table
    var arrHtml = [];
    arrHtml.push('<div id="zpGrid');
    arrHtml.push(this.id);
    arrHtml.push('Container"><div>');
    this.outputTableOpen(arrHtml);
    // Header
    this.outputFields(arrHtml, arrCols, this.config.fixedLeft);
    // Get rows to display
    var arrRows = this.applyPaging();
    // Rows
    for (var iRow = 1, iNum = 0; iRow <= arrRows.length; iRow++, iNum++) {
      this.outputRow(arrHtml, arrCols, arrRows, iNum, this.config.fixedLeft);
    }
    // Pagination
    if (this.paginationContainer) {
      // Draw table
      this.outputTableClose(arrHtml);
      arrHtml.push('</div></div>');
      this.container.innerHTML = arrHtml.join('');
      // Pagination
      arrHtml = [];
      this.outputPagination(arrHtml);
      this.paginationContainer.innerHTML = arrHtml.join('');
    } else {
      // Pagination
      arrHtml.push('</tbody></table></td></tr>');
      this.outputPagination(arrHtml);
      arrHtml.push('</tbody></table></div></div>');
      // Draw table
      this.container.innerHTML = arrHtml.join('');
    }
    // Fixed columns
    if (this.config.fixedLeft > 0) {
      var objFixed = Masc.Utils.createElement('div',
       document.getElementById('zpGrid' + this.id + 'Container'), true);
      objFixed.id = 'zpGrid' + this.id + 'FixedLeft';
      if (objFixed.style.setAttribute) {
        // IE
        objFixed.style.setAttribute('cssText', 'position:absolute;top:0px; \
         left:expression(this.offsetParent.scrollLeft+"px")', 0);
      } else {
        // Other browsers don't support expressions yet
        objFixed.style.position = 'absolute';
        objFixed.style.top = '0px';
        objFixed.style.left = this.container.scrollLeft + 'px';
      }
      var arrHtml = [];
      this.outputTableOpen(arrHtml, true);
      // Header
      this.outputFields(arrHtml, arrCols, this.config.fixedLeft, true);
      // Rows
      for (var iRow = 1, iNum = 0; iRow <= arrRows.length; iRow++, iNum++) {
        this.outputRow(arrHtml, arrCols, arrRows, iNum, this.config.fixedLeft,
         true);
      }
      this.outputTableClose(arrHtml);
      var objDiv = Masc.Utils.createElement('div', objFixed, true);
      objDiv.innerHTML = arrHtml.join('');
    }
  }
  // Synchronize scrolling
  this.synchronizeScrolling();
  // Custom pagination
  if (typeof this.config.callbackPaginationDisplay == 'function' &&
   this.config.rowsPerPage > 0) {
    this.config.callbackPaginationDisplay(this);
  }
};

/**
 * Visualizes row selection.
 *
 * @private
 * @param {object} objRow Row object
 */
Masc.Grid.prototype.visualizeSelectRow = function(objRow) {
  // Check arguments
  if (!objRow) {
    return;
  }
  // Get table row element
  var objTr = document.getElementById('zpGrid' + this.id + 'Row' + objRow.i);
  if (objTr) { // Can be on different page
    // Get row number because rows can be sorted and filtered
    /zpGridRow(\d+)/.exec(objTr.className);
    var strRow = RegExp.$1;
    // Select row
    var arrClassSelected = [];
    arrClassSelected.push(' zpGridRowSelected zpGridRowSelected');
    arrClassSelected.push(strRow);
    arrClassSelected.push(' zpGridRowSelected');
    arrClassSelected.push(strRow % 2 == 1 ? 'Odd' : 'Even');
    if (objTr.className.indexOf('zpGridRowLast') >= 0) { // Last row
      arrClassSelected.push(' zpGridRowSelectedLast');
    }
    var strClassSelected = arrClassSelected.join('');
    objTr.className += strClassSelected;
    // Get fixed part of row
    objTr = document.getElementById('zpGrid' + this.id + 'Row' + objRow.i +
     'Fixed');
    if (objTr) {
      objTr.className += strClassSelected;
    }
  }
};

/**
 * Visualizes row unselection.
 *
 * @private
 * @param {object} objRow Row object
 */
Masc.Grid.prototype.visualizeUnselectRow = function(objRow) {
  // Check arguments
  if (!objRow) {
    return;
  }
  // Get table row element
  var objTr = document.getElementById('zpGrid' + this.id + 'Row' + objRow.i);
  if (objTr) { // Can be on different page
    objTr.className = objTr.className.replace(/zpGridRowSelected[^ ]*/g, '')
     .split(/\s+/).join(' ');
    // Get fixed part of row
    objTr = document.getElementById('zpGrid' + this.id + 'Row' + objRow.i +
     'Fixed');
    if (objTr) {
      objTr.className = objTr.className.replace(/zpGridRowSelected[^ ]*/g, '')
       .split(/\s+/).join(' ');
    }
  }
};

/**
 * Visualizes cell selection.
 *
 * @private
 * @param {object} objCell Cell object
 */
Masc.Grid.prototype.visualizeSelectCell = function(objCell) {
  // Check arguments
  if (!objCell) {
    return;
  }
  // Get table cell element
  var objTd = document.getElementById('zpGrid' + this.id + 'Row' + objCell.r +
   'Cell' + objCell.i);
  if (objTd) { // Can be on different page
    // Select cell
    var arrClassSelected = [];
    arrClassSelected.push(' zpGridCellSelected zpGridCellSelected');
    arrClassSelected.push(objCell.i);
    arrClassSelected.push(' zpGridCellSelected');
    arrClassSelected.push(objCell.i % 2 == 1 ? 'Odd' : 'Even');
    if (objCell.i == this.fields.length - 1) { // Last cell
      arrClassSelected.push(' zpGridCellSelectedLast');
    }
    objTd.className += arrClassSelected.join('');
  }
};

/**
 * Visualizes cell unselection.
 *
 * @private
 * @param {object} objCell Cell object
 */
Masc.Grid.prototype.visualizeUnselectCell = function(objCell) {
  // Check arguments
  if (!objCell) {
    return;
  }
  // Get table row element
  var objTd = document.getElementById('zpGrid' + this.id + 'Row' + objCell.r +
   'Cell' + objCell.i);
  if (objTd) { // Can be on different page
    objTd.className = objTd.className.replace(/zpGridCellSelected[^ ]*/g, '')
     .split(/\s+/).join(' ');
  }
};

/**
 * Displays filter out forms.
 *
 * @private
 * @param {object} objFilterOut Object passed through config option
 * @param {object} arrVals Array of unique column values
 */
Masc.Grid.prototype.visualizeFilterOut = function(objFilterOut, arrVals) {
  // Get container
  if (!objFilterOut) {
    return;
  }
  var objContainer = Masc.Widget.getElementById(objFilterOut.container);
  if (!objContainer) {
    return;
  }
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
    return;
  }
  // Join column numbers
  var strCols = arrCols.join(',');
  // "Select all" and "Clear" links
  var arrHtml = [];
  arrHtml.push('<div><a href="javascript:void(0)" \
   onclick="Masc.Grid.checkboxSelectAllOnClick(\'');
  arrHtml.push(this.id);
  arrHtml.push("',[");
  arrHtml.push(strCols);
  arrHtml.push('])">Select all</a> | <a href="javascript:void(0)" \
   onclick="Masc.Grid.checkboxClearAllOnClick(\'');
  arrHtml.push(this.id);
  arrHtml.push("',[");
  arrHtml.push(strCols);
  arrHtml.push('])">Clear</a></div>');
  // Checkboxes
  for (var iVal = 0; iVal < arrVals.length; iVal++) {
    var strVal = arrVals[iVal].v + '';
    var strEscaped = escape(strVal);
    arrHtml.push('<div><input type="checkbox" ');
    // Check if this value is hidden
    for (var iField = 0; iField < arrFields.length; iField++) {
      var objField = arrFields[iField];
      if (!(objField.hiddenValues instanceof Array) ||
       Masc.Utils.arrIndexOf(objField.hiddenValues, strVal) < 0) {
        arrHtml.push('checked ');
        break;
      }
    }
    arrHtml.push('onclick="');
    if (objFilterOut.onclick) {
      arrHtml.push(objFilterOut.onclick);
      arrHtml.push(';');
    }
    arrHtml.push("Masc.Grid.checkboxOnClick('");
    arrHtml.push(this.id);
    arrHtml.push("',[");
    arrHtml.push(strCols);
    arrHtml.push("],unescape('");
    arrHtml.push(strEscaped);
    arrHtml.push("'),this.checked)\" /><a href=\"javascript:void(0)\" \
     onclick=\"Masc.Grid.checkboxLinkOnClick('");
    arrHtml.push(this.id);
    arrHtml.push("',[");
    arrHtml.push(strCols);
    arrHtml.push("],unescape('");
    arrHtml.push(strEscaped);
    arrHtml.push("'))\">");
    arrHtml.push(strVal);
    arrHtml.push('</a></div>');
  }
  objContainer.innerHTML = arrHtml.join('');
};

/**
 * Returns container for "Loading" or "Updating" image.
 *
 * @private
 * @return Container for "Loading" or "Updating" image
 * @type object
 */
Masc.Grid.prototype.getBusyContainer = function() {
  // Container must exist
  if (!this.container) {
    return;
  }
  // Get container
  var objContainer = this.container.firstChild;
  if (objContainer) {
    objContainer = objContainer.firstChild;
    if (objContainer) {
      var objTable = objContainer.firstChild;
      if (objTable && objTable.tagName.toLowerCase() == 'table') {
        if (objTable.offsetWidth > this.container.offsetWidth) {
          objContainer = this.container;
        } else {
          objContainer.style.overflow = 'visible';
          objContainer.style.width = objTable.offsetWidth + 'px';
        }
      } else {
        objContainer = null;
      }
    }
  }
  if (!objContainer) {
    objContainer = this.container;
  };
  return objContainer;
};

/**
 * Displays "Loading" image.
 * @private
 */
Masc.Grid.prototype.displayLoading = function() {
  // Remove "Updating"
  this.removeUpdating();
  // Get container
  var objContainer = this.getBusyContainer();
  if (!objContainer) {
    return;
  }
  // Display image
  Masc.Transport.showBusy({
    busyContainer: objContainer
  });
};

/**
 * Removes "Loading" image.
 * @private
 */
Masc.Grid.prototype.removeLoading = function() {
  // Get container
  var objContainer = this.getBusyContainer();
  if (!objContainer) {
    return;
  }
  // Remove image
  Masc.Transport.removeBusy({
    busyContainer: objContainer
  });
};

/**
 * Displays "Updating" image.
 * @private
 */
Masc.Grid.prototype.displayUpdating = function() {
  // Blinking message is irritative. Display it only when it's really needed.
  // Message can be safely skipped in large grids when there are < 50 of lines
  // to display because rendering takes most of time.
  if (!this.config.dataOnDemand) {
    var iFields = this.fields.length;
    if (this.totalRecords() * iFields < 2500) {
      if (this.recordsDisplayed() * iFields < 250) {
        return;
      }
      if (this.config.rowsPerPage > 0) {
        if (this.config.rowsPerPage * iFields < 250) {
          return;
        }
      }
    }
  }
  // Remove "Loading"
  this.removeLoading();
  // Get container
  var objContainer = this.getBusyContainer();
  if (!objContainer) {
    return;
  }
  // Display image
  Masc.Transport.showBusy({
    busyContainer: objContainer,
    busyImage: 'zpupdating.gif'
  });
};

/**
 * Removes "Updating" image.
 * @private
 */
Masc.Grid.prototype.removeUpdating = function() {
  // Get container
  var objContainer = this.getBusyContainer();
  if (!objContainer) {
    return;
  }
  // Remove image
  Masc.Transport.removeBusy({
    busyContainer: objContainer,
    busyImage: 'zpupdating.gif'
  });
};
