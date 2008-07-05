// $Id: zpgrid-query.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Plugin for Masc Grid to make queries to the grid.
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
 * Executes query on the grid.
 *
 * <pre>
 * Query object format:
 *
 * {
 *   type: [string] query type ('insert', 'update' or 'delete'),
 *   rows: [object, optional] array of rows to add (see
 *    Masc.Grid.prototype.splice for details),
 *   values: [object, optional] object with new values of row (see
 *    Masc.GridQueryUpdate.prototype.execute for details),
 *   where: [object, optional] condition statement object (see
 *    Masc.GridQuery.prototype.compileStatement for details),
 *   noRefresh: [boolean, optional] indicates that grid should not be refreshed
 *    after changing (default: false) (useful when several changes go one by
 *    one)
 * }
 * </pre>
 *
 * @param {object} objArgs Query object.
 * @return Array of affected rows during query. Number of affected rows can be
 * accessed through the length property of this array. If error occured during
 * query, returns undefined. See {@link Masc.GridQueryInsert#execute},
 * {@link Masc.GridQueryUpdate#execute},
 * {@link Masc.GridQueryDelete#execute} for details
 * @type object
 */
Masc.Grid.prototype.query = function(objArgs) {
  // Check arguments
  if (!objArgs || !objArgs.type) {
    return;
  }
  if (!objArgs.where) {
    objArgs.where = null;
  }
  if (!objArgs.noRefresh) {
    objArgs.noRefresh = null;
  }
  // Execute query
  if (objArgs.type == 'insert') {
    if (objArgs.rows) {
      var objQuery = new Masc.GridQueryInsert({
        grid: this,
        noRefresh: objArgs.noRefresh
      });
      return objQuery.execute({
        rows: objArgs.rows
      });
    }
  } else if (objArgs.type == 'update') {
    if (objArgs.values) {
      var objQuery = new Masc.GridQueryUpdate({
        grid: this,
        where: objArgs.where,
        noRefresh: objArgs.noRefresh
      });
      return objQuery.execute(objArgs.values);
    }
  } else if (objArgs.type == 'delete') {
    var objQuery = new Masc.GridQueryDelete({
      grid: this,
      where: objArgs.where,
      noRefresh: objArgs.noRefresh
    });
    return objQuery.execute();
  }
};

/**
 * Base query.
 *
 * <pre>
 * <strong>Query initialization object format:</strong>
 *
 * {
 *   grid: [object] Grid object to query,
 *   where: [object, optional] statement object that describes query condition
 *    (if not defined, all rows will be affected),
 *   noRefresh: [boolean, optional] indicates that grid should not be refreshed
 *    after changing (default: false)
 * }
 *
 * <strong>Statement object format:</strong>
 *
 * {
 *   leftValue: [object, optional] statement value object,
 *   rightValue: [object, optional] statement value object,
 *   operator: [string, optional] any javascript binary or unary operator
 * }
 *
 * If operator is binary (e.g. '==' or '&&'), both leftValue and rightValue are
 * required.
 *
 * Operator can be left or right unary. In this case only one of leftValue or
 * rightValue should be defined.
 *
 * Examples:
 *
 * Statement "!value" can be described with following object:
 *
 * {
 *   rightValue: {value: value},
 *   operator: '!'
 * }
 *
 * Statement "value++" can be described with following object:
 *
 * {
 *   leftValue: {value: value},
 *   operator: '++'
 * }
 *
 * Statement "value1 == value2" can be described with following object:
 *
 * {
 *   leftValue: {value: value1},
 *   rightValue: {value: value2},
 *   operator: '=='
 * }
 *
 * Statement "value != value1 && value != -value2" can be described with
 * following object:
 *
 * {
 *   leftValue: {
 *     statement: {
 *       leftValue: {value: value},
 *       rightValue: {value: value1},
 *       operator: '!='
 *     }
 *   },
 *   rightValue: {
 *     statement: {
 *       leftValue: {value: value},
 *       rightValue: {
 *         statement: {
 *           rightValue: {value: value2},
 *           operator: '-'
 *         }
 *       },
 *       operator: '!='
 *     }
 *   },
 *   operator: '&&'
 * }
 *
 * <strong>Statement value object can be one of the following objects:</strong>
 *
 * {
 *   column: [number] column number to use value of
 * }
 *
 * or
 *
 * {
 *   value: [any] any value,
 *   type: [string, optional] specifies field type to use comparison rules of
 * }
 *
 * or
 *
 * {
 *   statement: [object] statement object (see above)
 * }
 * </pre>
 *
 * @constructor
 * @param {object} objArgs Query initialization object
 */
Masc.GridQuery = function(objArgs) {
  this.init(objArgs);
};

/**
 * Initializes object.
 *
 * @private
 * @param {object} objArgs Query initialization object
 * @return Success
 * @type boolean
 */
Masc.GridQuery.prototype.init = function(objArgs) {
  // Grid to query [object]
  this.grid = null;
  // Indicates that grid should not be refreshed after changing [boolean]
  this.noRefresh = false;
  // Reference to query condition function [function]
  this.condition = null;
  // Indicates that error occured during query initialization [boolean]
  this.error = null;
  // Human readable error description [string]
  this.errorDescription = null;
  // Get Grid object
  if (objArgs.grid && objArgs.grid.fields && objArgs.grid.rows) {
    this.grid = objArgs.grid;
  } else {
    // Error
    return this.setError('No grid');
  }
  // Get query condition
  if (objArgs.where) {
    this.condition = this.compileStatement(objArgs.where);
    if (!this.condition) {
      // True for all rows by default
      this.condition = function(iRow) {
        return true;
      }
    }
  }
  // Initialized successfully
  return true;
};

/**
 * Compiles statement object.
 *
 * @private
 * @param {object} objStatement Statement object
 * @return Reference to a function that accepts row number and returns result of
 * evaluation of statement on that row
 * @type function or null
 */
Masc.GridQuery.prototype.compileStatement = function(objStatement) {
  // Check arguments
  if (!objStatement) {
    return null;
  }
  // Get left value
  var funcLeftValue = null;
  if (typeof objStatement.leftValue != 'undefined') {
    funcLeftValue = this.compileStatementValue(objStatement.leftValue);
  }
  // Get right value
  var funcRightValue = null;
  if (typeof objStatement.rightValue != 'undefined') {
    funcRightValue = this.compileStatementValue(objStatement.rightValue);
  }
  // Get operator
  var funcOperator = null;
  if (typeof objStatement.operator == 'string') {
    funcOperator = this.compileOperator(funcLeftValue, funcRightValue,
     objStatement.operator);
  }
  // Compile statement
  if (funcOperator) {
    if (funcLeftValue && funcRightValue) {
      // Binary operator
      return function(iRow) {
        return funcOperator(funcLeftValue(iRow), funcRightValue(iRow));
      }
    }
    if (funcRightValue) {
      // Left unary operator
      return function(iRow) {
        return funcOperator(funcRightValue(iRow));
      }
    }
    if (funcLeftValue) {
      // Right unary operator
      return function(iRow) {
        return funcOperator(funcLeftValue(iRow));
      }
    }
  }
  if (funcLeftValue) {
    return funcLeftValue;
  }
  return funcRightValue;
};

/**
 * Compiles statement value object.
 *
 * @private
 * @param {object} objStatement Statement value object
 * @return Reference to a function that accepts row number and returns result of
 * evaluation of statement value on that row
 * @type function or null
 */
Masc.GridQuery.prototype.compileStatementValue = function(objValue) {
  // Check arguments
  if (!objValue) {
    return null;
  }
  // Try to get column number
  if (typeof objValue.column != 'undefined') {
    var iColumn = objValue.column * 1;
    if (!this.grid.fields[iColumn]) {
      // Error
      this.setError('Invalid column number: ' + objValue.column);
      return null;
    }
    // Return column value
    var objGrid = this.grid;
    return function(iRow) {
      var objRow = objGrid.rows[iRow];
      if (!objRow || !objRow.cells) {
        return;
      }
      var objCell = objRow.cells[iColumn];
      if (!objCell) {
        return;
      }
      return objGrid.getCellValueCompare(objCell);
    };
  }
  // Try to get value
  if (typeof objValue.value != 'undefined') {
    var value = objValue.value;
    // Get type
    if (typeof objValue.type != 'undefined' && Masc.Grid.convertByType) {
      // Get method
      var strMethod = Masc.Grid.convertByType[objValue.type];
      if (!strMethod) {
        // Error
        this.setError('Invalid field type: ' + objValue.type);
        return null;
      }
      // Convert to compare value according to the type rules
      var objCell = {
        v: value
      };
      objCell = this.grid[strMethod](objCell);
      value = this.grid.getCellValueCompare(objCell);
    }
    // Return value
    return function(iRow) {
      return value;
    };
  }
  // Try to get statement
  if (typeof objValue.statement != 'undefined') {
    // Return compiled statement
    return this.compileStatement(objValue.statement);
  }
  // Nothing applicable
  this.setError('Invalid statement value');
  return null;
};

/**
 * Compiles operator.
 *
 * @private
 * @param {function or null} funcLeftValue Left value
 * @param {function or null} funcRightValue Right value
 * @param {string} strOperator Any javascript binary or unary operator
 * @return Rreference to a function that accepts 1 or 2 values and returns
 * result of operator evaluation on those values
 * @type function or null
 */
Masc.GridQuery.prototype.compileOperator =
 function(funcLeftValue, funcRightValue, strOperator) {
  // Compile operator
  try {
    if (funcLeftValue && funcRightValue) {
      // Binary operator
      return new Function('l', 'r', 'return l ' + strOperator + ' r');
    }
    if (funcRightValue) {
      // Left unary operator
      return new Function('v', 'return ' + strOperator + ' v');
    }
    if (funcLeftValue) {
      // Right unary operator
      return new Function('v', 'return v ' + strOperator);
    }
  } catch(objException) {
    this.setError('Invalid operator: ' + strOperator);
  };
  return null;
};

/**
 * Sets error.
 *
 * @private
 * @param {string} strError Human readable error description
 * @return Always false
 * @type boolean
 */
Masc.GridQuery.prototype.setError = function(strError) {
  this.error = true;
  this.errorDescription = strError;
  return false;
};

/**
 * Refreshes grid after change.
 * @private
 */
Masc.GridQuery.prototype.refreshGrid = function() {
  if (!this.noRefresh && this.grid && this.grid.show) {
    this.grid.modify();
  }
};

/**
 * Insert query.
 *
 * @constructor
 * @extends Masc.GridQuery
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 */
Masc.GridQueryInsert = function(objArgs) {
  // Call constructor of superclass
  Masc.GridQueryInsert.SUPERconstructor.call(this, objArgs);
};

// Inherit GridQuery
Masc.inherit(Masc.GridQueryInsert, Masc.GridQuery);

/**
 * Initializes object.
 *
 * @private
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 * @return Success
 * @type boolean
 */
Masc.GridQueryInsert.prototype.init = function(objArgs) {
  // Call parent
  return Masc.GridQueryInsert.SUPERclass.init.call(this, objArgs);
};

/**
 * Executes query.
 *
 * <pre>
 * Query data object format:
 * 
 * {
 *   rows: [object] array of rows to add (see {@link Masc.Grid#splice} for
 *    details)
 * }
 * </pre>
 *
 * @param {object} objArgs Query data object
 * @return Array of added rows. Number of added rows can be accessed through the
 * length property of this array. If error occured during query, returns
 * undefined
 * @type object
 */
Masc.GridQueryInsert.prototype.execute = function(objArgs) {
  if (!this.grid || this.error) {
    // Error
    return;
  }
  // Check arguments
  if (!objArgs || !objArgs.rows) {
    return;
  }
  // Insert rows
  this.grid.splice({
    rows: objArgs.rows,
    noRefresh: this.noRefresh
  });
  // Success
  return objArgs.rows;
};

/**
 * Update query.
 *
 * @constructor
 * @extends Masc.GridQuery
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 */
Masc.GridQueryUpdate = function(objArgs) {
  // Call constructor of superclass
  Masc.GridQueryUpdate.SUPERconstructor.call(this, objArgs);
};

// Inherit GridQuery
Masc.inherit(Masc.GridQueryUpdate, Masc.GridQuery);

/**
 * Initializes object.
 *
 * @private
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 * @return Success
 * @type boolean
 */
Masc.GridQueryUpdate.prototype.init = function(objArgs) {
  // Call parent
  return Masc.GridQueryUpdate.SUPERclass.init.call(this, objArgs);
};

/**
 * Executes query.
 *
 * <pre>
 * Query data object format:
 * 
 * {
 *   cells: [
 *     {
 *       v: [any] cell value,
 *       style: [string, optional] table cell style attribute
 *     },
 *     ...
 *   ],
 *   style: [string, optional] table row style attribute
 * }
 *
 * If only some of cells should be changed, specify only those cells. E.g.
 *
 * {
 *   cells: [
 *     null,
 *     null,
 *     { v: value1 },
 *     null,
 *     { v: value2 }
 *   ]
 * }
 *
 * will change only values in 3-rd and 5-th columns.
 * </pre>
 *
 * @param {object} objArgs Query data object
 * @return Array of modified rows. Number of modified rows can be accessed
 * through the length property of this array. Each element of this array
 * contains array with copy of original row object and reference to modified
 * row object: [objOriginalRow, objModifiedRow]. If error occured during query,
 * returns undefined
 * @type object
 */
Masc.GridQueryUpdate.prototype.execute = function(objArgs) {
  if (!this.grid || this.error) {
    // Error
    return;
  }
  // Check arguments
  if (!objArgs || !objArgs.cells) {
    return;
  }
  // Will contain modified rows
  var arrModified = [];
  // Iterate over rows
  for (var iRow = 0; iRow < this.grid.rows.length; iRow++) {
    // Get row
    if (!(this.grid.rows[iRow] instanceof Object)) {
      this.grid.rows[iRow] = {};
    }
    var objRow = this.grid.rows[iRow];
    if (!(objRow.cells instanceof Array)) {
      objRow.cells = [];
    }
    // Update row
    if (this.condition(iRow)) {
      // Save a copy of original row and a reference to modified row
      arrModified.push([Masc.Utils.clone(objRow), objRow]);
      // Update row
      for (var iCol = 0; iCol < this.grid.fields.length; iCol++) {
        // Get new value
        var objArgsCell = objArgs.cells[iCol];
        if (!objArgsCell) {
          continue;
        }
        // Get cell
        if (!(objRow.cells[iCol] instanceof Object)) {
          objRow.cells[iCol] = {};
        }
        var objCell = objRow.cells[iCol];
        // Set new cell value
        objCell = this.grid.setCellValue(objCell,
         this.grid.getCellValue(objArgsCell));
        // Set cell style
        objCell = this.grid.setCellStyle(objCell, objArgsCell.style);
        // Update cell
        objRow.cells[iCol] = objCell;
      }
      // Set row style
      objRow = this.grid.setRowStyle(objRow, objArgs.style);
    }
  }
  // Refresh grid
  this.refreshGrid();
  // Success
  return arrModified;
};

/**
 * Delete query.
 *
 * @constructor
 * @extends Masc.GridQuery
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 */
Masc.GridQueryDelete = function(objArgs) {
  // Call constructor of superclass
  Masc.GridQueryDelete.SUPERconstructor.call(this, objArgs);
};

// Inherit GridQuery
Masc.inherit(Masc.GridQueryDelete, Masc.GridQuery);

/**
 * Initializes object.
 *
 * @private
 * @param {object} objArgs Query initialization object (see
 * {@link Masc.GridQuery} for details)
 * @return Success
 * @type boolean
 */
Masc.GridQueryDelete.prototype.init = function(objArgs) {
  // Call parent
  return Masc.GridQueryDelete.SUPERclass.init.call(this, objArgs);
};

/**
 * Executes query.
 *
 * @return Array of removed rows. Number of removed rows can be accessed through
 * the length property of this array. If error occured during query, returns
 * undefined
 * @type object
 */
Masc.GridQueryDelete.prototype.execute = function() {
  if (!this.grid || this.error) {
    // Error
    return;
  }
  // Will contain removed rows
  var arrRemoved = [];
  // Iterate over rows
  for (var iRow = this.grid.rows.length - 1; iRow >= 0; iRow--) {
    // Get row
    var objRow = this.grid.rows[iRow];
    if (!(objRow instanceof Object) || !(objRow.cells instanceof Array)) {
      continue;
    }
    // Remove row
    if (this.condition(iRow)) {
      arrRemoved.push(this.grid.removeRow(iRow));
    }
  }
  // Rows were removed in reverse order
  arrRemoved.reverse();
  // Refresh grid
  this.refreshGrid();
  // Success
  return arrRemoved;
};
