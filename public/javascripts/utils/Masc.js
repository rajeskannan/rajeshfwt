// $Id: Masc.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Loads generic modules required for all widgets.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

if (typeof Masc == 'undefined') {
  /**
   * Namespace definition.
   * @constructor
   */
  Masc = function() {};
}

/**
 * Returns path from the last loaded script element. Splits src attribute value
 * and returns path without js file name.
 *
 * <p><strong>
 * Note: This function should not be called from another function. It must be
 * invoked during page load to determine path to js file from which it is called
 * correctly.
 * </strong></p>
 *
 * @private
 * @return Path to the script, e.g. '../src/' or '' if path is not found
 * @type string
 */
Masc.getPath = function() {
  // Get last script element
  var objContainer = document.body;
  if (!objContainer) {
    objContainer = document.getElementsByTagName('head')[0];
    if (!objContainer) {
      objContainer = document;
    }
  }
  var objScript = objContainer.lastChild;
  // Get path
  var strSrc = objScript.getAttribute('src');
  if (!strSrc) {
    return '';
  }
  var arrTokens = strSrc.split('/');
  // Remove last token
  arrTokens = arrTokens.slice(0, -1);
  if (!arrTokens.length) {
    return '';
  }
  return arrTokens.join('/') + '/';
};

/**
 * Simply writes script tag to the document.
 *
 * @private
 * @param {string} strSrc Src attribute value of the script element
 */
Masc.include = function(strSrc) {
  document.write('<s' + 'cript type="text/javascript" src="' + strSrc +
   '"></s' + 'cript>');
};

/**
 * Path to main Masc script.
 * @private
 */
Masc.MascPath = Masc.getPath();

// Include required scripts
Masc.include(Masc.MascPath + 'utils.js');
Masc.include(Masc.MascPath + 'zpeventdriven.js');
Masc.include(Masc.MascPath + 'transport.js');
Masc.include(Masc.MascPath + 'zpwidget.js');

// Replace Masc.include with more complex function from transport library
if (Masc.Transport && Masc.Transport.include) {
  Masc.include = Masc.Transport.include;
}
