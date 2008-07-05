// $Id: stylesheet.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * \file stylesheet.js
 * Masc StyleSheet class definition.
 * Used to manipulate with style sheets.
 *
 * Copyright (c) 2004-2005 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 *
 * $Id: stylesheet.js 4322 2006-09-04 08:49:33Z shacka $
 */

// Define Masc namespace
if (typeof Masc == 'undefined') {
  Masc = {};
}

/**
 * Constructor.
 */
Masc.StyleSheet = function() {
  if (document.createStyleSheet) {
    // IE
    this.styleSheet = document.createStyleSheet();
  } else {
    this.styleSheet = document.createElement('style');
    this.styleSheet.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(this.styleSheet);
    if (document.styleSheets) {
      // Firefox, Safari, Konqueror
      this.n = document.styleSheets.length - 1;
    }
  }
};

/**
 * Adds a rule to the style sheet.
 *
 * \param strSelector [string] rule selector.
 * \param strDeclarations [string] rule declarations.
 */
Masc.StyleSheet.prototype.addRule = function(strSelector, strDeclarations) {
  if (document.createStyleSheet) {
    // IE
    this.styleSheet.addRule(strSelector, strDeclarations);
/* Commenting for now because works properly only in Firefox
  } else if (document.styleSheets) {
    // Firefox, Safari, Konqueror
    var objStyleSheet = document.styleSheets.item(this.n);
    objStyleSheet.insertRule(strSelector + ' { ' + strDeclarations + ' }',
     objStyleSheet.cssRules.length);
*/
  } else {
    // Opera
    this.styleSheet.appendChild(
     document.createTextNode(strSelector + ' { ' + strDeclarations + ' }')
    );
  }
};

/**
 * Removes all rules from the style sheet.
 */
Masc.StyleSheet.prototype.removeRules = function() {
  if (document.createStyleSheet) {
    // IE
    var iRules = this.styleSheet.rules.length;
    for (var iRule = 0; iRule < iRules; iRule++) {
      this.styleSheet.removeRule();
    }
/* Commenting for now because works properly only in Firefox
  } else if (document.styleSheets) {
    // Firefox, Safari, Konqueror
    var objStyleSheet = document.styleSheets.item(this.n);
    var iRules = objStyleSheet.cssRules.length;
    for (var iRule = 0; iRule < iRules; iRule++) {
      objStyleSheet.deleteRule(0);
    }
*/
  } else {
    // Opera
    while (this.styleSheet.firstChild) {
      this.styleSheet.removeChild(this.styleSheet.firstChild);
    }
  }
};

/**
 * Parses the CSS string and adds rules into the style sheet.
 *
 * \param strStyleSheet [string] CSS string.
 */
Masc.StyleSheet.prototype.addParse = function(strStyleSheet) {
  // Remove comments
  var arrClean = [];
  var arrTokens = strStyleSheet.split('/*');
  for (var iTok = 0; iTok < arrTokens.length; iTok++) {
    var arrTails = arrTokens[iTok].split('*/');
    arrClean.push(arrTails[arrTails.length - 1]);
  }
  strStyleSheet = arrClean.join('');
  // Remove at-rules
  strStyleSheet = strStyleSheet.replace(/@[^{]*;/g, '');
  // Split to styles
  var arrStyles = strStyleSheet.split('}');
  for (var iStl = 0; iStl < arrStyles.length; iStl++) {
    // Split to selector and declarations
    var arrRules = arrStyles[iStl].split('{');
    if (arrRules[0] && arrRules[1]) {
      // Split selector
      var arrSelectors = arrRules[0].split(',');
      for (var iSel = 0; iSel < arrSelectors.length; iSel++) {
        this.addRule(arrSelectors[iSel], arrRules[1]);
      }
    }
  }
};
