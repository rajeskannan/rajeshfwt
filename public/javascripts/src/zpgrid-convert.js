// $Id: zpgrid-convert.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Plugin for Masc Grid to provide different data types for
 * cells.
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
 * Converts cell to string data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertString = function(objCell) {
  if (!(objCell instanceof Object)) {
    objCell = {};
  }
  // Convert to string
  objCell.v += '';
  // Remove multiple whitespaces
  objCell.v = objCell.v.replace(/\s+/g, ' ');
  // Remove leading and trailing space
  objCell.v = objCell.v.replace(/^\s/, '').replace(/\s$/, '');
  objCell.c = objCell.o = objCell.v;
  // Remove HTML tags
  objCell.c = objCell.c.replace(/<[^>]*>/g, '');
  return objCell;
};

/**
 * Converts cell to insensitive string data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertInsensitiveString = function(objCell) {
  objCell = this.convertString(objCell);
  objCell.c = objCell.c.toUpperCase();
  return objCell;
};

/**
 * Converts cell to integer data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertInteger = function(objCell) {
  if (objCell && (objCell.v == Infinity || objCell.v == -Infinity)) {
    return objCell;
  }
  objCell = this.convertString(objCell);
  // Get only numbers and decimal
  objCell.c = objCell.c.replace(/[^0-9\.\-]/g, '');
  // Ignore any chars after decimal, no rounding
  objCell.c = objCell.c.replace(/\..*/g, '');
  // Convert to integer
  objCell.c = parseInt(objCell.c);
  if (isNaN(objCell.c)) {
    objCell.c = 0;
  }
  return objCell;
};

/**
 * Converts cell to float data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertFloat = function(objCell) {
  if (objCell && (objCell.v == Infinity || objCell.v == -Infinity)) {
    return objCell;
  }
  objCell = this.convertString(objCell);
  // Get only numbers and decimal
  objCell.c = objCell.c.replace(/[^0-9\.\-]/g, '');
  // Convert to float
  objCell.c = parseFloat(objCell.c);
  if (isNaN(objCell.c)) {
    objCell.c = 0;
  }
  return objCell;
};

/**
 * Converts cell to date data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertDate = function(objCell) {
  objCell = this.convertString(objCell);
  objCell.c = Date.parse(objCell.c);
  return objCell;
};

/**
 * Converts cell to time data type.
 *
 * <pre>
 * Following time formats are recognized:
 * 1) HH:MM:SS
 * 2) HH:MM:SS AM/PM
 * 3) HH:MM
 * 4) HH:MM AM/PM
 * 5) HHMMSS
 * 6) HHMMSS AM/PM
 * 7) HHMM
 * 8) HHMM AM/PM
 *
 * Any type of separator can be used.
 *
 * Examples: 1.40AM, 05-06-02, 3:8:1, 0205[PM], etc.
 * </pre>
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertTime = function(objCell) {
  objCell = this.convertString(objCell);
  // Parse value
  var arrMatch =
   objCell.c.match(/(\d{1,2})\D+(\d{1,2})(\D+(\d{1,2}))?\W*(AM|PM|A|P)?/i);
  if (!arrMatch) {
    // Try without separator
    arrMatch = objCell.c.match(/(\d{2})(\d{2})((\d{2}))?\W*(AM|PM|A|P)?/i);
  }
  // Get compare value
  if (arrMatch && arrMatch[1] && arrMatch[2]) {
    // Get hour
    var hour = arrMatch[1] * 1;
    // Correct hour
    if (arrMatch[5]) {
      var strAmPm = arrMatch[5].toUpperCase();
      if (strAmPm == 'PM' || strAmPm == 'P') {
        if (hour < 12) {
          hour += 12;
        }
      } else { // AM
        if (hour == 12) {
          hour = 0;
        }
      }
    }
    if (hour < 10) {
      hour = '0' + hour;
    }
    // Get minute
    var minute = arrMatch[2] * 1;
    // Correct minute
    if (minute < 10) {
      minute = '0' + minute;
    }
    // Get second
    var second = 0;
    if (arrMatch[4]) {
      second = arrMatch[4] * 1;
    }
    // Correct second
    if (second < 10) {
      second = '0' + second;
    }
    // Get time
    objCell.c = hour + ':' + minute + ':' + second;
  }
  return objCell;
};

/**
 * Converts cell to UNIX timestamp data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertTimestampLocale = function(objCell) {
  objCell = this.convertString(objCell);
  objCell.v = (new Date(parseInt(objCell.v) * 1000)).toLocaleString();
  return objCell;
};

/**
 * Converts cell to UNIX timestamp data type. Value displayed in MM/DD/YYYY
 * format.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertTimestampMMDDYYYY = function(objCell) {
  objCell = this.convertString(objCell);
  var objDate = new Date(parseInt(objCell.v) * 1000);
  var strMonth = objDate.getMonth() + 1;
  if (strMonth < 10) {
    strMonth = '0' + strMonth;
  }
  var strDay = objDate.getDate();
  if (strDay < 10) {
    strDay = '0' + strDay;
  }
  var strYear = objDate.getYear();
  if (strYear < 1900) {
    strYear += 1900;
  }
  objCell.v = strMonth + '/' + strDay + '/' + strYear;
  return objCell;
};

/**
 * Converts cell to UNIX timestamp data type. Value displayed in DD/MM/YYYY
 * format.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertTimestampDDMMYYYY = function(objCell) {
  objCell = this.convertString(objCell);
  var objDate = new Date(parseInt(objCell.v) * 1000);
  var strMonth = objDate.getMonth() + 1;
  if (strMonth < 10) {
    strMonth = '0' + strMonth;
  }
  var strDay = objDate.getDate();
  if (strDay < 10) {
    strDay = '0' + strDay;
  }
  var strYear = objDate.getYear();
  if (strYear < 1900) {
    strYear += 1900;
  }
  objCell.v = strDay + '/' + strMonth + '/' + strYear;
  return objCell;
};

/**
 * Converts cell to UNIX timestamp data type. Value displayed in YYYY/MM/DD
 * format.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertTimestampYYYYMMDD = function(objCell) {
  objCell = this.convertString(objCell);
  var objDate = new Date(parseInt(objCell.v) * 1000);
  var strMonth = objDate.getMonth() + 1;
  if (strMonth < 10) {
    strMonth = '0' + strMonth;
  }
  var strDay = objDate.getDate();
  if (strDay < 10) {
    strDay = '0' + strDay;
  }
  var strYear = objDate.getYear();
  if (strYear < 1900) {
    strYear += 1900;
  }
  objCell.v = strYear + '/' + strMonth + '/' + strDay;
  return objCell;
};

/**
 * Converts cell to boolean data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertBoolean = function(objCell) {
  objCell = this.convertString(objCell);
  switch (objCell.c.toUpperCase()) {
    case '0':
    case 'F':
    case 'FALSE':
    case 'N':
    case 'NO':
    case Masc.Grid.booleanValues[0].toUpperCase():
      objCell.c = 0;
      break;
    default:
      objCell.c = 1;
  }
  objCell.v = Masc.Grid.booleanValues[objCell.c];
  return objCell;
};

/**
 * Display values for boolean data type. Since this is static variable,
 * external application is able to substitute it with other values,
 * e.g. ['Non', 'Oui'].
 * @private
 */
Masc.Grid.booleanValues = ['No', 'Yes'];

/**
 * Sets display values for boolean data type.
 *
 * @param {string} strNo Replacement for "No"
 * @param {string} strYes Replacement for "Yes"
 */
Masc.Grid.prototype.setBooleanValues = function(strNo, strYes) {
  if (typeof strNo == 'string') {
    Masc.Grid.booleanValues[0] = strNo;
  }
  if (typeof strYes == 'string') {
    Masc.Grid.booleanValues[1] = strYes;
  }
};

/**
 * Converts cell to boolean data type.
 *
 * @param {object} objCell Cell object
 * @return Converted cell object
 * @type object
 */
Masc.Grid.prototype.convertBooleanTF = function(objCell) {
  objCell = this.convertString(objCell);
  switch (objCell.c.toUpperCase()) {
    case '0':
    case 'F':
    case 'FALSE':
    case 'N':
    case 'NO':
    case Masc.Grid.booleanTFValues[0].toUpperCase():
      objCell.c = 0;
      break;
    default:
      objCell.c = 1;
  }
  objCell.v = Masc.Grid.booleanTFValues[objCell.c];
  return objCell;
};

/**
 * Display values for booleanTF data type.
 * @private
 */
Masc.Grid.booleanTFValues = ['False', 'True'];

/**
 * Sets display values for booleanTF data type.
 *
 * @param {string} strFalse Replacement for "False"
 * @param {string} strTrue Replacement for "True"
 */
Masc.Grid.prototype.setBooleanTFValues = function(strFalse, strTrue) {
  if (typeof strFalse == 'string') {
    Masc.Grid.booleanTFValues[0] = strFalse;
  }
  if (typeof strTrue == 'string') {
    Masc.Grid.booleanTFValues[1] = strTrue;
  }
};

/**
 * Associative array to access conversion method by data type name.
 * @private
 */
Masc.Grid.convertByType = {
  'string': 'convertString',
  'istring': 'convertInsensitiveString',
  'int': 'convertInteger',
  'integer': 'convertInteger',
  'float': 'convertFloat',
  'date': 'convertDate',
  'time': 'convertTime',
  'timestamp': 'convertTimestampLocale',
  'timestampMMDDYYYY': 'convertTimestampMMDDYYYY',
  'timestampDDMMYYYY': 'convertTimestampDDMMYYYY',
  'timestampYYYYMMDD': 'convertTimestampYYYYMMDD',
  'boolean': 'convertBoolean',
  'booleanTF': 'convertBooleanTF'
};

/**
 * Returns name of convert method corresponding to data type.
 *
 * @param {string} strType Data type
 * @return Convert method name or undefined if not found
 * @type string
 */
Masc.Grid.prototype.getConvertByType = function(strType) {
  return Masc.Grid.convertByType[strType];
};

/**
 * Associative array to get class name by data type.
 * @private
 */
Masc.Grid.classByType = {
  'string': 'zpGridTypeString',
  'istring': 'zpGridTypeStringInsensitive',
  'int': 'zpGridTypeInt',
  'integer': 'zpGridTypeInt',
  'float': 'zpGridTypeFloat',
  'date': 'zpGridTypeDate',
  'time': 'zpGridTypeTime',
  'timestamp': 'zpGridTypeTimestampLocale',
  'timestampMMDDYYYY': 'zpGridTypeTimestampMMDDYYYY',
  'timestampDDMMYYYY': 'zpGridTypeTimestampDDMMYYYY',
  'timestampYYYYMMDD': 'zpGridTypeTimestampYYYYMMDD',
  'boolean': 'zpGridTypeBoolean',
  'booleanTF': 'zpGridTypeBooleanTF'
};

/**
 * Returns class name corresponding to data type.
 *
 * @param {string} strType Data type
 * @return Class name or undefined if not found
 * @type string
 */
Masc.Grid.prototype.getClassByType = function(strType) {
  return Masc.Grid.classByType[strType];
};

/**
 * Associative array to get data type by class name.
 * @private
 */
Masc.Grid.typeByClass = {
  'zpGridTypeString': 'string',
  'zpGridTypeStringInsensitive': 'istring',
  'zpGridTypeInt': 'int',
  'zpGridTypeFloat': 'float',
  'zpGridTypeDate': 'date',
  'zpGridTypeTime': 'time',
  'zpGridTypeTimestampLocale': 'timestamp',
  'zpGridTypeTimestampMMDDYYYY': 'timestampMMDDYYYY',
  'zpGridTypeTimestampDDMMYYYY': 'timestampDDMMYYYY',
  'zpGridTypeTimestampYYYYMMDD': 'timestampYYYYMMDD',
  'zpGridTypeBoolean': 'boolean',
  'zpGridTypeBooleanTF': 'booleanTF'
};

/**
 * Returns data type corresponding to class name. Default is "string".
 *
 * @param {string} strClass className attribute value
 * @return Data type
 * @type string
 */
Masc.Grid.prototype.getTypeByClass = function(strClass) {
  // className may contain several classes
  var arrClasses = strClass.split(/\s+/);
  // Search first applicable class
  for (var iClass = 0; iClass < arrClasses.length; iClass++) {
    var strType = Masc.Grid.typeByClass[arrClasses[iClass]];
    if (typeof strType != 'undefined') {
      return strType;
    }
  }
  // Default is "string"
  return 'string';
};

/**
 * Creates custom data type.
 *
 * @param {function} funcConvert Function that converts cell value
 * @param {string} strTypeName Type name
 * @param {string} strTypeClass Optional. Class name
 */
Masc.Grid.createType = function(funcConvert, strTypeName, strTypeClass) {
  // Check arguments
  if (typeof funcConvert != 'function' || typeof strTypeName != 'string' ||
   !strTypeName.length) {
    return;
  }
  // Form method name
  var strFuncName = 'convertCustom' + strTypeName.charAt(0).toUpperCase() +
   strTypeName.substr(1);
  // Add method
  Masc.Grid.prototype[strFuncName] = funcConvert;
  // Add type
  Masc.Grid.convertByType[strTypeName] = strFuncName;
  // Add class
  if (typeof strTypeClass == 'string' && strTypeClass.length) {
    Masc.Grid.classByType[strTypeName] = strTypeClass;
    Masc.Grid.typeByClass[strTypeClass] = strTypeName;
  }
};
