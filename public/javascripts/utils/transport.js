/**
 * @fileoverview Masc Transport library. Used to fetch data from the server,
 * parse and serialize XML and JSON data.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

// $Id: transport.js 4389 2006-09-11 18:16:35Z vkulov $

if (typeof Masc == 'undefined') {
  /**
   * Namespace definition.
   * @constructor
   */
  Masc = function() {};
}

/**
 * @constructor
 */
Masc.Transport = function() {};

// Determine most current versions of ActiveX objects available
if (typeof ActiveXObject != 'undefined') {

  /**
   * String variable with most current version of XMLDOM ActiveX object name
   * available.
   * @private
   */
  Masc.Transport.XMLDOM = null;

  /**
   * String variable with Most current version of XMLHTTP ActiveX object name
   * available.
   * @private
   */
  Masc.Transport.XMLHTTP = null;

  /**
   * @ignore
   * Returns first available ActiveX object name from the given list.
   *
   * @param {object} arrVersions List of ActiveX object names to test
   * @return First available ActiveX object name or null
   * @type string
   */
  Masc.Transport.pickActiveXVersion = function(arrVersions) {
    for (var iVn = 0; iVn < arrVersions.length; iVn++) {
      try {
        var objDocument = new ActiveXObject(arrVersions[iVn]);
        // If it gets to this point, the string worked
        return arrVersions[iVn];
      } catch (objException) {};
    }
    return null;
  };

  /**
   * Most current version of XMLDOM ActiveX object.
   * @private
   */
  Masc.Transport.XMLDOM = Masc.Transport.pickActiveXVersion([
    'Msxml2.DOMDocument.4.0',
    'Msxml2.DOMDocument.3.0',
    'MSXML2.DOMDocument',
    'MSXML.DOMDocument',
    'Microsoft.XMLDOM'
  ]);

  /**
   * Most current version of XMLHTTP ActiveX object.
   * @private
   */
  Masc.Transport.XMLHTTP = Masc.Transport.pickActiveXVersion([
    'Msxml2.XMLHTTP.4.0',
    'MSXML2.XMLHTTP.3.0',
    'MSXML2.XMLHTTP',
    'Microsoft.XMLHTTP'
  ]);

  // We don't need this any more
  Masc.Transport.pickActiveXVersion = null;

}

/**
 * Creates cross browser XMLHttpRequest object.
 *
 * @return New XMLHttpRequest object.
 * @type object
 */
Masc.Transport.createXmlHttpRequest = function() {
  if (typeof XMLHttpRequest != 'undefined') {
    return new XMLHttpRequest();
  }
  if (typeof ActiveXObject != 'undefined') {
    try {
      return new ActiveXObject(Masc.Transport.XMLHTTP);
    } catch (objException) {};
  }
  return null;
};

/**
 * Checks if animated GIF is already displayed in the specified div.
 *
 * <pre>
 * Arguments object format:
 * {
 *   busyContainer: [object or string] element where to put animated GIF,
 *   busyImage: [string, optional] image name
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 * @return True if image is displayed
 * @type boolean
 */
Masc.Transport.isBusy = function(objArgs) {
  // Get container
  var objContainer = objArgs.busyContainer;
  if (typeof objContainer == 'string') {
    objContainer = document.getElementById(objContainer);
  }
  if (!objContainer) {
    return;
  }
  // Get image name
  var strImage = objArgs.busyImage;
  if (typeof strImage != 'string') {
    strImage = '';
  }
  strImage = strImage.split('/').pop();
  if (!strImage.length) {
    strImage = 'zpbusy.gif';
  }
  // Check if image is displayed
  var objFC = objContainer.firstChild;
  if (objFC) {
    objFC = objFC.firstChild;
    if (objFC) {
      objFC = objFC.firstChild;
      if (objFC && objFC.tagName && objFC.tagName.toLowerCase() == 'img') {
        var strSrc = objFC.getAttribute('src');
        if (typeof strSrc == 'string' && strSrc.length) {
          // Get last token
          strSrc = strSrc.split('/').pop();
          if (strSrc == strImage) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

/**
 * Shows animated GIF in the specified div.
 *
 * <pre>
 * Arguments object format:
 * {
 *   busyContainer: [object or string] element where to put animated GIF,
 *   busyImage: [string, optional] image name,
 *   busyImageWidth: [number or string, optional] image width,
 *   busyImageHeight: [number or string, optional] image height
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 */
Masc.Transport.showBusy = function(objArgs) {
  // Make sure image is not displayed yet
  if (Masc.Transport.isBusy(objArgs)) {
    return;
  }
  // Get container
  var objContainer = objArgs.busyContainer;
  if (typeof objContainer == 'string') {
    objContainer = document.getElementById(objContainer);
  }
  if (!objContainer) {
    return;
  }
  // Get image name and dimensions
  var strImage = objArgs.busyImage;
  var strImageWidth = objArgs.busyImageWidth;
  var strImageHeight = objArgs.busyImageHeight;
  if (typeof strImage != 'string' || !strImage.length) {
    strImage = 'zpbusy.gif';
  } else {
    if (typeof strImageWidth == 'number' ||
     (typeof strImageWidth == 'string' && /\d$/.test(strImageWidth))) {
      strImageWidth += 'px';
    }
    if (typeof strImageHeight == 'number' ||
     (typeof strImageHeight == 'string' && /\d$/.test(strImageHeight))) {
      strImageHeight += 'px';
    }
  }
  if (!strImageWidth) {
    strImageWidth = '65px';
  }
  if (!strImageHeight) {
    strImageHeight = '35px';
  }
  // Get path
  var strPath = '';
  // Check if path is specified
  if (strImage.indexOf('/') < 0) {
    // Use default path
    strPath = Masc.Transport.getPath('transport.js');
  }
  // Form tag
  var arrImgTag = [];
  arrImgTag.push('<img src="');
  arrImgTag.push(strPath);
  arrImgTag.push(strImage);
  arrImgTag.push('"');
  if (strImageWidth || strImageHeight) {
    arrImgTag.push(' style="');
    if (strImageWidth) {
      arrImgTag.push('width:');
      arrImgTag.push(strImageWidth);
      arrImgTag.push(';');
    }
    if (strImageHeight) {
      arrImgTag.push('height:');
      arrImgTag.push(strImageHeight);
    }
    arrImgTag.push('"');
  }
  arrImgTag.push(' />');
  strImgTag = arrImgTag.join('');
  // Get container dimensions
  var iContainerWidth = objContainer.offsetWidth;
  var iContainerHeight = objContainer.offsetHeight;
  // Display image
  var objBusyContainer = Masc.Utils.createElement('div');
  objBusyContainer.style.position = 'relative';
  objBusyContainer.style.zIndex = 2147483583;
  var objBusy = Masc.Utils.createElement('div', objBusyContainer);
  objBusy.style.position = 'absolute';
  objBusy.innerHTML = strImgTag;
  if (objContainer.firstChild) {
    objContainer.insertBefore(objBusyContainer, objContainer.firstChild);
  } else {
    objContainer.appendChild(objBusyContainer);
  }
  // Move to the center of container
  var iBusyWidth = objBusy.offsetWidth;
  var iBusyHeight = objBusy.offsetHeight;
  if (iContainerWidth > iBusyWidth) {
    objBusy.style.left = objContainer.scrollLeft +
     (iContainerWidth - iBusyWidth) / 2 + 'px';
  }
  if (iContainerHeight > iBusyHeight) {
    objBusy.style.top = objContainer.scrollTop +
     (iContainerHeight - iBusyHeight) / 2 + 'px';
  }
};

/**
 * Removes animated GIF which was put by {@link Masc.Transport#showBusyGif}
 * from the specified div.
 *
 * <pre>
 * Arguments object format:
 * {
 *   busyContainer: [object or string] element where to put animated GIF,
 *   busyImage: [string, optional] image name
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 */
Masc.Transport.removeBusy = function(objArgs) {
  // Get container
  var objContainer = objArgs.busyContainer;
  if (typeof objContainer == 'string') {
    objContainer = document.getElementById(objContainer);
  }
  if (!objContainer) {
    return;
  }
  // Make sure image is displayed
  if (Masc.Transport.isBusy(objArgs)) {
    // Remove image
    objContainer.removeChild(objContainer.firstChild);
  }
};

/**
 * Fetches specified URL using new XMLHttpRequest object.
 *
 * <pre>
 * Asynchronous mode is recommended because it is safer and there is no risk of
 * having your script hang in case of network problem. Synchronous mode means
 * that the code will hang until a response comes back.
 *
 * When request is completed, one of provided callback functions is called:
 * onLoad on success or onError on error. In synchronous mode onLoad callback
 * can be omitted. Instead use returned object.
 *
 * onLoad callback function receives XMLHttpRequest object as argument and may
 * use its various properties like responseText, responseXML, etc.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: server status number (404, etc.) [number],
 *   errorDescription: human readable error description [string]
 * }
 *
 * Note: Some browsers implement caching for GET requests. Caching can be
 * prevented by adding 'r=' + Math.random() parameter to URL.
 *
 * If you use POST method, content argument should be something like
 * 'var1=value1&var2=value2' with urlencoded values. If you wish to send other
 * content, set appropriate contentType. E.g. 'multipart/form-data', 'text/xml',
 * etc.
 *
 * If server response contains non-ASCII characters, server must send
 * corresponding content-type header. E.g.
 * "Content-type: text/plain; charset=utf-8" or
 * "Content-type: text/plain; charset=windows-1251".
 *
 * Arguments object format:
 * {
 *   url: [string] relative or absolute URL to fetch,
 *   method: [string, optional] method ('GET', 'POST', 'HEAD', 'PUT'),
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   contentType: [string, optional] content type when using POST,
 *   content: [string or object, optional] postable string or DOM object data
 *    when using POST,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error,
 *   username: [string, optional] username,
 *   password: [string, optional] password,
 *   busyContainer: [object or string, optional] element or id of element where
 *    to put "Busy" animated GIF,
 *   busyImage: [string, optional] image name,
 *   busyImageWidth: [number or string, optional] image width,
 *   busyImageHeight: [number or string, optional] image height
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return In synchronous mode XMLHttpRequest object or null. In asynchronous
 * mode always null.
 * @type object
 */
Masc.Transport.fetch = function(objArgs) {
  // Check arguments
  if (objArgs == null || typeof objArgs != 'object') {
    return null;
  }
  if (!objArgs.url) {
    return null;
  }
  if (!objArgs.method) {
    objArgs.method = 'GET';
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  if (!objArgs.contentType && objArgs.method.toUpperCase() == 'POST') {
    objArgs.contentType = 'application/x-www-form-urlencoded';
  }
  if (!objArgs.content) {
    objArgs.content = null;
  }
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  // Request URL
  var objRequest = Masc.Transport.createXmlHttpRequest();
  if (objRequest == null) {
    return null;
  }
  // Show "Busy" animated GIF
  Masc.Transport.showBusy(objArgs);
  // IE 6 calls onreadystatechange and then raises an exception if local file is
  // not found. This flag is used to prevent duplicate onError calls.
  var boolErrorDisplayed = false;
  try {
    // Open request
    if (typeof objArgs.username != 'undefined' &&
     typeof objArgs.password != 'undefined') {
      objRequest.open(objArgs.method, objArgs.url, objArgs.async,
       objArgs.username, objArgs.password);
    } else {
      objRequest.open(objArgs.method, objArgs.url, objArgs.async);
    }
    // Onready handler
    var funcOnReady = function () {
      // Remove "Busy" animated GIF
      Masc.Transport.removeBusy(objArgs);
      // Process response
      if (objRequest.status == 200 || objRequest.status == 304 ||
       (location.protocol == 'file:' && !objRequest.status)) {
        // OK or found, but determined unchanged and loaded from cache
        if (typeof objArgs.onLoad == 'function') {
          objArgs.onLoad(objRequest);
        }
      } else if (!boolErrorDisplayed) {
        boolErrorDisplayed = true;
        // 404 Not found, etc.
        Masc.Transport.displayError(objRequest.status,
         "Error: Can't fetch " + objArgs.url + '.\n' +
         (objRequest.statusText || ''),
         objArgs.onError);
      }
    };
    // Prevent duplicate funcOnReady call in synchronous mode
    if (objArgs.async) {
      // Set onreadystatechange handler
      objRequest.onreadystatechange = function () {
        if (objRequest.readyState == 4) {
          // Request complete
          funcOnReady();
          // Prevent memory leak
          objRequest.onreadystatechange = {};
        }
      };
    }
    // Set content type if needed
    if (objArgs.contentType) {
      objRequest.setRequestHeader('Content-Type', objArgs.contentType);
    }
    // Send request
    objRequest.send(objArgs.content);
    // In synchronous mode the result is ready on the next line
    if (!objArgs.async) {
      funcOnReady();
      return objRequest;
    }
  } catch (objException) {
    // Remove "Busy" animated GIF
    Masc.Transport.removeBusy(objArgs);
    // Process error
    if (!boolErrorDisplayed) {
      boolErrorDisplayed = true;
      if (objException.name &&
       objException.name == 'NS_ERROR_FILE_NOT_FOUND') {
        Masc.Transport.displayError(0,
         "Error: Can't fetch " + objArgs.url + '.\nFile not found.',
         objArgs.onError);
      } else {
        Masc.Transport.displayError(0,
         "Error: Can't fetch " + objArgs.url + '.\n' +
         (objException.message || ''),
         objArgs.onError);
      }
    }
  };
  return null;
};

/**
 * Parses HTML fragment into HTMLElement object.
 *
 * @param {string} strHtml HTML fragment
 * @return Div element which contains parsed HTML fragment
 * @type object
 */
Masc.Transport.parseHtml = function(strHtml) {
  // Convert to string
  strHtml += '';
  // Remove leading whitespace characters because Firefox and Opera don't parse
  // fragment that starts from whitespace character
  strHtml = strHtml.replace(/^\s+/g, '');
  // Create temporaty container
  var objTempContainer = null;
	if (document.createElementNS) {
		// use the XHTML namespace
		objTempContainer =
		 document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
	} else {
		objTempContainer = document.createElement('div');
	}
  // Parse HTML fragment
  objTempContainer.innerHTML = strHtml;
  // Return container element
  return objTempContainer;
};

/**
 * Evaluates javascript in global scope.
 *
 * <p><b>
 * Note: Global variables must be declared without "var" keyword. Otherwise
 * they will be ignored by Safari.
 * </b></p>
 *
 * @param {string} strScript Script to evaluate
 */
Masc.Transport.evalGlobalScope = function(strScript) {
  if (typeof strScript != 'string' || !strScript.match(/\S/)) {
    return;
  }
  if (window.execScript) {
    // IE
    window.execScript(strScript, 'javascript');
  } else if (window.eval) {
    // Others
    window.eval(strScript);
/*
 This should never be reached
  } else {
    var funcScript = new Function(strScript);
    funcScript.call(window);
*/
  }
};

/**
 * Assigns passed HTML fragment to the specified element's innerHTML property
 * and evaluates in global scope javascripts found in the fragment.
 *
 * <pre>
 * Arguments object format:
 * {
 *   html: [string] HTML fragment,
 *   container: [object or string, optional] element or id of element to put
 *    HTML fragment into
 * }
 * </pre>
 *
 * <p><b>
 * Note: Scripts are executed after HTML fragment is assigned to innerHTML.
 * If external scripts are used, they are loaded asynchronously and execution
 * sequence is not preserved.
 * </b></p>
 *
 * <p><b>
 * Note: Global variables must be declared without "var" keyword. Otherwise
 * they will be ignored by Safari.
 * </b></p>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Transport.setInnerHtml = function(objArgs) {
  // Check arguments
  if (!objArgs || typeof objArgs.html != 'string') {
    return;
  }
  var strHtml = objArgs.html;
  // Get container
  var objContainer = null;
  if (typeof objArgs.container == 'string') {
    objContainer = document.getElementById(objArgs.container);
  } else if (typeof objArgs.container == 'object') {
    objContainer = objArgs.container;
  }
  // Extract javascripts
  var arrScripts = [];
  if (strHtml.match(/<\s*\/\s*script\s*>/i)) {
    // Split whole string by </script>
    var arrTokens = strHtml.split(/<\s*\/\s*script\s*>/i);
    var arrHtml = [];
    for (var iToken = arrTokens.length - 1; iToken >= 0; iToken--) {
      var strToken = arrTokens[iToken];
      if (strToken.match(/\S/)) {
        // Search <script ... > in the middle of each token
        var arrMatch = strToken.match(/<\s*script([^>]*)>/i);
        if (arrMatch) {
          // Separate HTML from javascript
          var arrCouple = strToken.split(/<\s*script[^>]*>/i);
          // IE doesn't put empty tokens into the array
          while (arrCouple.length < 2) {
            if (strToken.match(/^<\s*script[^>]*>/i)) {
              // HTML part is absent
              arrCouple.unshift('');
            } else {
              // javascript part is absent
              arrCouple.push('');
            }
          }
          // Save HTML fragment
          arrHtml.unshift(arrCouple[0]);
          // Get script attributes
          var strAttrs = arrMatch[1];
          // Get script text
          var srtScript = arrCouple[1];
          // Ignore script text if "src" attribute is present
          if (strAttrs.match(/\s+src\s*=/i)) {
            srtScript = '';
          } else {
            // Fix functions: function aaa() -> aaa = function()
            srtScript = srtScript.replace(/function\s+([^(]+)/g, '$1=function');
          }
          arrScripts.push([strAttrs, srtScript]);
        } else if (iToken < arrTokens.length - 1) {
          // On error assume this token is a part of previous token
          arrTokens[iToken - 1] += '</script>' + strToken;
        } else {
          // If this is last token, assume it is HTML fragment
          arrHtml.unshift(strToken);
        }
      } else {
        // Empty token
        arrHtml.unshift(strToken);
      }
    }
    // Get HTML part
    strHtml = arrHtml.join('');
  }
  // Set inner HTML
  if (objContainer) {
    // Opera hack
    objContainer.innerHTML = '<form></form>';
    objContainer.innerHTML = strHtml;
  }
  // Evaluate javascripts
  for (var iScript = 0; iScript < arrScripts.length; iScript++) {
    if (arrScripts[iScript][1].length) {
      // Evaluate in global scope
      Masc.Transport.evalGlobalScope(arrScripts[iScript][1]);
    }
    // Load external script
    var strAttrs = arrScripts[iScript][0];
    strAttrs = strAttrs.replace(/\s+/g, ' ').replace(/^\s/, '')
     .replace(/\s$/, '').replace(/ = /g, '=');
    if (strAttrs.indexOf('src=') >= 0) {
      // Get container
      var objContainer = document.body;
      if (!objContainer) {
        objContainer = document.getElementsByTagName('head')[0];
        if (!objContainer) {
          objContainer = document;
        }
      }
      // Get attributes
      var arrAttrs = strAttrs.split(' ');
      // Load script
      var objScript = Masc.Utils.createElement('script');
      for (var iAttr = 0; iAttr < arrAttrs.length; iAttr++) {
        var arrAttr = arrAttrs[iAttr].split('=');
        if (arrAttr.length > 1) {
          objScript.setAttribute(arrAttr[0],
           arrAttr[1].match(/^[\s|"|']*([\s|\S]*[^'|"])[\s|"|']*$/)[1]);
        } else {
          objScript.setAttribute(arrAttr[0], arrAttr[0]);
        }
      }
      // It's important for Safari to assign attributes before appending
      objContainer.appendChild(objScript);
    }
  }
};

/**
 * Fetches and parses XML document from the specified URL.
 *
 * <pre>
 * When XML document is fetched and parsed, one of provided callback functions
 * is called: onLoad on success or onError on error. In synchronous mode onLoad
 * callback can be omitted. Instead use returned object.
 *
 * onLoad callback function receives XMLDocument object as argument and may use
 * its documentElement and other properties.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: error code [number],
 *   errorDescription: human readable error description [string]
 * }
 * Error code will be 0 unless Masc.Transport.fetch was used to fetch URL
 * and there was a problem during fetching.
 *
 * If method argument is not defined, more efficient XMLDOM in IE and
 * document.implementation.createDocument in Mozilla will be used to fetch
 * and parse document. Otherwise Masc.Transport.fetch will be used to fetch
 * document and Masc.Transport.parseXml to parse.
 *
 * Note: Some browsers implement caching for GET requests. Caching can be
 * prevented by adding 'r=' + Math.random() parameter to URL.
 *
 * If you use POST method, content argument should be something like
 * 'var1=value1&var2=value'. If you wish to send other content, set appropriate
 * contentType. E.g. to send XML string, you should set contentType: 'text/xml'.
 *
 * If server response contains non-ASCII characters, encoding must be specified.
 * E.g. <?xml version="1.0" encoding="utf-8"?> or 
 * <?xml version="1.0" encoding="windows-1251"?>.
 *
 * If server response contains non-ASCII characters, server must send
 * corresponding content-type header. E.g.
 * "Content-type: text/xml; charset=utf-8" or
 * "Content-type: text/xml; charset=windows-1251".
 *
 * Arguments object format:
 * {
 *   url: [string] relative or absolute URL to fetch,
 *   method: [string, optional] method ('GET', 'POST', 'HEAD', 'PUT'),
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   contentType: [string, optional] content type when using POST,
 *   content: [string or object, optional] postable string or DOM object data
 *    when using POST,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error,
 *   username: [string, optional] username,
 *   password: [string, optional] password,
 *   busyContainer: [object or string, optional] element or id of element where
 *    to put "Busy" animated GIF,
 *   busyImage: [string, optional] image name,
 *   busyImageWidth: [number or string, optional] image width,
 *   busyImageHeight: [number or string, optional] image height
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return In synchronous mode XMLDocument object or null. In asynchronous mode
 * always null.
 * @type object
 */
Masc.Transport.fetchXmlDoc = function(objArgs) {
  // Check arguments
  if (objArgs == null || typeof objArgs != 'object') {
    return null;
  }
  if (!objArgs.url) {
    return null;
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  // Try more efficient methods first
  if (!objArgs.method && typeof objArgs.username == 'undefined' &&
   typeof objArgs.password == 'undefined') {
    if (document.implementation && document.implementation.createDocument) {
      // Mozilla
      var objDocument = null;

      if (!objArgs.reliable) {
        objArgs.reliable = false;
      }
      // Form argument for fetch
      var objFetchArgs = {};
      for (var strKey in objArgs) {
        objFetchArgs[strKey] = objArgs[strKey];
      }
      // Prevent duplicate parseXml call in synchronous mode
      if (objArgs.async) {
        objFetchArgs.onLoad = function(objRequest) {
          // Prevent onload being called more than once
          objFetchArgs.onLoad = null;

          // Parse xml response string
          var parser = new DOMParser();
          objDocument = parser.parseFromString(objRequest.responseText, "text/xml");

          // Remove "Busy" animated GIF
          Masc.Transport.removeBusy(objArgs);
          // Process response
          Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
           objArgs.onError);
        };
      } else {
        objFetchArgs.onLoad = null;
      }
      // Fetch URL
      var objRequest = Masc.Transport.fetch(objFetchArgs);
      // In synchronous mode the result is ready on the next line
      if (!objArgs.async && objRequest) {
        // Parse xml response string
        var parser = new DOMParser();
        objDocument = parser.parseFromString(objRequest.responseText, "text/xml");

        // Remove "Busy" animated GIF
        Masc.Transport.removeBusy(objArgs);
        // Process response
        Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
         objArgs.onError);

        return objDocument;
      }
    }
    if (typeof ActiveXObject != 'undefined') {
      // IE
      // Show "Busy" animated GIF
      Masc.Transport.showBusy(objArgs);
      // Load document
      try {
        var objDocument = new ActiveXObject(Masc.Transport.XMLDOM);
        objDocument.async = objArgs.async;
        // Prevent duplicate onXmlDocLoad call in synchronous mode
        if (objArgs.async) {
          objDocument.onreadystatechange = function () {
            if (objDocument.readyState == 4) {
              // Remove "Busy" animated GIF
              Masc.Transport.removeBusy(objArgs);
              // Process response
              Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
               objArgs.onError);
              // Prevent memory leak
              objDocument.onreadystatechange = {};
            }
          };
        }
        objDocument.load(objArgs.url);
        // In synchronous mode the result is ready on the next line
        if (!objArgs.async) {
          // Remove "Busy" animated GIF
          Masc.Transport.removeBusy(objArgs);
          // Process response
          Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
           objArgs.onError);
          return objDocument;
        }
        return null;
      } catch (objException) {
        // Remove "Busy" animated GIF
        Masc.Transport.removeBusy(objArgs);
      };
    }
  }
  // Try XMLHttpRequest
  // Form argument for fetch
  var objFetchArgs = {};
  for (var strKey in objArgs) {
    objFetchArgs[strKey] = objArgs[strKey];
  }
  // Prevent duplicate parseXml call in synchronous mode
  if (objArgs.async) {
    objFetchArgs.onLoad = function(objRequest) {
      Masc.Transport.parseXml({
        strXml: objRequest.responseText,
        onLoad: objArgs.onLoad,
        onError: objArgs.onError
      });
    };
  } else {
    objFetchArgs.onLoad = null;
  }
  // Fetch URL
  var objRequest = Masc.Transport.fetch(objFetchArgs);
  // In synchronous mode the result is ready on the next line
  if (!objArgs.async && objRequest) {
    return Masc.Transport.parseXml({
      strXml: objRequest.responseText,
      onLoad: objArgs.onLoad,
      onError: objArgs.onError
    });
  }
  return null;
};

/**
 * Parses XML string into XMLDocument object.
 *
 * <pre>
 * When XML string is parsed, one of provided callback functions is called:
 * onLoad on success or onError on error. In synchronous mode onLoad callback
 * can be omitted. Instead use returned object.
 *
 * onLoad callback function receives XMLDocument object as argument and may use
 * its documentElement and other properties.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: error code [number],
 *   errorDescription: human readable error description [string]
 * }
 * Error code will be always 0.
 *
 * Returns XMLDocument object, so onLoad callback function is optional.
 * Returned value and its documentElement property should be checked before
 * use because they can be null or undefined.
 *
 * If XML string contains non-ASCII characters, encoding must be specified.
 * E.g. <?xml version="1.0" encoding="utf-8"?> or 
 * <?xml version="1.0" encoding="windows-1251"?>.
 *
 * Arguments object format:
 * {
 *   strXml: XML string to parse [string],
 *   onLoad: function reference to call on success [function] (optional),
 *   onError: function reference to call on error [function] (optional)
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return XMLDocument object or null
 * @type object
 */
Masc.Transport.parseXml = function(objArgs) {
  if (objArgs == null || typeof objArgs != 'object') {
    return null;
  }
  if (!objArgs.strXml) {
    return null;
  }
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  if (window.DOMParser) {
    // Mozilla
    try {
      var objDocument = (new DOMParser()).parseFromString(objArgs.strXml,
       'text/xml');
      Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
       objArgs.onError);
      return objDocument;
    } catch (objException) {
      Masc.Transport.displayError(0,
       "Error: Can't parse.\n" +
       'String does not appear to be a valid XML fragment.',
       objArgs.onError);
    };
    return null;
  }
  if (typeof ActiveXObject != 'undefined') {
    // IE
    try {
      var objDocument = new ActiveXObject(Masc.Transport.XMLDOM);
      objDocument.loadXML(objArgs.strXml);
      Masc.Transport.onXmlDocLoad(objDocument, objArgs.onLoad,
       objArgs.onError);
      return objDocument;
    } catch (objException) {};
  }
  return null;
};

/**
 * Checks if there were errors during XML document fetching and parsing and
 * calls onLoad or onError callback function correspondingly.
 *
 * @private
 * @param {object} objDocument XMLDocument object
 * @param {function} onLoad Callback function provided by user
 * @param {function} onError Callback function provided by user
 */
Masc.Transport.onXmlDocLoad = function(objDocument, onLoad, onError) {
  var strError = null;
  if (objDocument.parseError) {
    // Parsing error in IE
    strError = objDocument.parseError.reason;
    if (objDocument.parseError.srcText) {
      strError += 'Location: ' + objDocument.parseError.url +
       '\nLine number ' + objDocument.parseError.line + ', column ' +
       objDocument.parseError.linepos + ':\n' +
       objDocument.parseError.srcText + '\n';
    }
  } else if (objDocument.documentElement &&
   objDocument.documentElement.tagName == 'parsererror') {
    // If an error is caused while parsing, Mozilla doesn't throw an exception.
    // Instead, it creates an XML string containing the details of the error:
    // <parsererror xmlns="http://www.w3.org/1999/xhtml">XML Parsing Error: ...
    // Check if strings has been generated.
    strError = objDocument.documentElement.firstChild.data + '\n' +
     objDocument.documentElement.firstChild.nextSibling.firstChild.data;
  } else if (!objDocument.documentElement) {
    strError = 'String does not appear to be a valid XML fragment.';
  }
  if (strError) {
    // Parsing error
    Masc.Transport.displayError(0,
     "Error: Can't parse.\n" + strError,
     onError);
  } else {
    // Success
    if (typeof onLoad == 'function') {
      onLoad(objDocument);
    }
  }
};

/**
 * Serializes XMLDocument object into XML string.
 *
 * @param {object} objDocument XMLDocument object
 * @return XML string
 * @type string
 */
Masc.Transport.serializeXmlDoc = function(objDocument) {
  if (window.XMLSerializer) {
    // Mozilla
    return (new XMLSerializer).serializeToString(objDocument);
  }
  if (objDocument.xml) {
    // IE
    return objDocument.xml;
  }
};

/**
 * Fetches and parses JSON object from the specified URL.
 *
 * <pre>
 * When JSON object is fetched and parsed, one of provided callback functions
 * is called: onLoad on success or onError on error. In synchronous mode onLoad
 * callback can be omitted. Instead use returned object.
 *
 * onLoad callback function receives JSON object as argument.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: error code [number],
 *   errorDescription: human readable error description [string]
 * }
 * Error code will be 0 unless there was a problem during fetching.
 *
 * Note: Some browsers implement caching for GET requests. Caching can be
 * prevented by adding 'r=' + Math.random() parameter to URL.
 *
 * If you use POST method, content argument should be something like
 * 'var1=value1&var2=value'. If you wish to send other content, set appropriate
 * contentType. E.g. to send XML string, you should set contentType: 'text/xml'.
 *
 * If server response contains non-ASCII characters, server must send
 * corresponding content-type header. E.g.
 * "Content-type: text/plain; charset=utf-8" or
 * "Content-type: text/plain; charset=windows-1251".
 *
 * Arguments object format:
 * {
 *   url: [string] relative or absolute URL to fetch,
 *   reliable: [boolean, optional] false (string will be parsed) or true
 *   (evaluated) (default: false),
 *   method: [string, optional] method ('GET', 'POST', 'HEAD', 'PUT'),
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   contentType: [string, optional] content type when using POST,
 *   content: [string or object, optional] postable string or DOM object data
 *    when using POST,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error,
 *   username: [string, optional] username,
 *   password: [string, optional] password,
 *   busyContainer: [object or string, optional] element or id of element where
 *    to put "Busy" animated GIF,
 *   busyImage: [string, optional] image name,
 *   busyImageWidth: [number or string, optional] image width,
 *   busyImageHeight: [number or string, optional] image height
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return In synchronous mode JSON object or null. In asynchronous mode always
 * null.
 * @type object
 */
Masc.Transport.fetchJsonObj = function(objArgs) {
  // Check arguments
  if (objArgs == null || typeof objArgs != 'object') {
    return null;
  }
  if (!objArgs.url) {
    return null;
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  if (!objArgs.reliable) {
    objArgs.reliable = false;
  }
  // Form argument for fetch
  var objFetchArgs = {};
  for (var strKey in objArgs) {
    objFetchArgs[strKey] = objArgs[strKey];
  }
  // Prevent duplicate parseXml call in synchronous mode
  if (objArgs.async) {
    objFetchArgs.onLoad = function(objRequest) {
      Masc.Transport.parseJson({
        strJson: objRequest.responseText,
        reliable: objArgs.reliable,
        onLoad: objArgs.onLoad,
        onError: objArgs.onError
      });
    };
  } else {
    objFetchArgs.onLoad = null;
  }
  // Fetch URL
  var objRequest = Masc.Transport.fetch(objFetchArgs);
  // In synchronous mode the result is ready on the next line
  if (!objArgs.async && objRequest) {
    return Masc.Transport.parseJson({
      strJson: objRequest.responseText,
      reliable: objArgs.reliable,
      onLoad: objArgs.onLoad,
      onError: objArgs.onError
    });
  }
  return null;
};

/**
 * Parses JSON string into object.
 *
 * <pre>
 * When JSON string is parsed, one of provided callback functions is called:
 * onLoad on success or onError on error.
 *
 * onLoad callback function receives JSON object as argument.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: error code [number],
 *   errorDescription: human readable error description [string]
 * }
 * Error code will be always 0.
 *
 * Returns JSON object, so onLoad callback function is optional.
 * Returned value should be checked before use because it can be null.
 *
 * Arguments object format:
 * {
 *   strJson: JSON string to parse [string],
 *   reliable: false (string will be parsed) or true (evaluated) [boolean]
 *   (optional, false by default),
 *   onLoad: function reference to call on success [function] (optional),
 *   onError: function reference to call on error [function] (optional)
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return JSON object or null
 * @type object
 */
Masc.Transport.parseJson = function(objArgs) {
  if (objArgs == null || typeof objArgs != 'object') {
    return null;
  }
  if (!objArgs.strJson) {
    return null;
  }
  if (!objArgs.reliable) {
    objArgs.reliable = false;
  }
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  var objJson = null;
  try {
    if (objArgs.reliable) {
      objJson = eval('(' + objArgs.strJson + ')');
    } else {
      objJson = Masc.Transport.parseJsonStr(objArgs.strJson);
    }
  } catch (objException) {
    Masc.Transport.displayError(0,
     "Error: Can't parse.\n" +
     'String does not appear to be a valid JSON fragment: ' +
     objException.message + '\n' + objException.text,
     objArgs.onError);
  };
  if (typeof objArgs.onLoad == 'function') {
    objArgs.onLoad(objJson);
  }
  return objJson;
};

/**
 * Parses JSON string into object.
 *
 * <pre>
 * Was taken with changes from http://json.org/json.js.
 *
 * Throws exception if parsing error occurs.
 *
 * JSON format is described at http://json.org/js.html.
 * </pre>
 *
 * @private
 * @param {string} text JSON string to parse
 * @return JSON object
 * @type object
 */
Masc.Transport.parseJsonStr = function(text) {
  var p = /^\s*(([,:{}\[\]])|"(\\.|[^\x00-\x1f"\\])*"|-?\d+(\.\d*)?([eE][+-]?\d+)?|true|false|null)\s*/,
      token,
      operator;
  function error(m, t) {
      throw {
          name: 'JSONError',
          message: m,
          text: t || operator || token
      };
  }
  function next(b) {
      if (b && b != operator) {
          error("Expected '" + b + "'");
      }
      if (text) {
          var t = p.exec(text);
          if (t) {
              if (t[2]) {
                  token = null;
                  operator = t[2];
              } else {
                  operator = null;
                  try {
                      token = eval(t[1]);
                  } catch (e) {
                      error("Bad token", t[1]);
                  }
              }
              text = text.substring(t[0].length);
          } else {
              error("Unrecognized token", text);
          }
      } else {
          // undefined changed to null because it is not supported in IE 5.0
          token = operator = null;
      }
  }
  function val() {
      var k, o;
      switch (operator) {
      case '{':
          next('{');
          o = {};
          if (operator != '}') {
              for (;;) {
                  if (operator || typeof token != 'string') {
                      error("Missing key");
                  }
                  k = token;
                  next();
                  next(':');
                  o[k] = val();
                  if (operator != ',') {
                      break;
                  }
                  next(',');
              }
          }
          next('}');
          return o;
      case '[':
          next('[');
          o = [];
          if (operator != ']') {
              for (;;) {
                  o.push(val());
                  if (operator != ',') {
                      break;
                  }
                  next(',');
              }
          }
          next(']');
          return o;
      default:
          if (operator !== null) {
              error("Missing value");
          }
          k = token;
          next();
          return k;
      }
  }
  next();
  return val();
};

/**
 * Serializes JSON object into JSON string.
 *
 * Was taken with changes from http://json.org/json.js.
 *
 * @param {object} v JSON object
 * @return JSON string
 * @type string
 */
Masc.Transport.serializeJsonObj = function(v) {
  var a = [];
  /*
    Emit a string.
  */
  function e(s) {
      a[a.length] = s;
  }
  /*
    Convert a value.
  */
  function g(x) {
      var c, i, l, v;
      switch (typeof x) {
      case 'object':
          if (x) {
              if (x instanceof Array) {
                  e('[');
                  l = a.length;
                  for (i = 0; i < x.length; i += 1) {
                      v = x[i];
                      if (typeof v != 'undefined' &&
                              typeof v != 'function') {
                          if (l < a.length) {
                              e(',');
                          }
                          g(v);
                      }
                  }
                  e(']');
                  return;
              } else if (typeof x.toString != 'undefined') {
                  e('{');
                  l = a.length;
                  for (i in x) {
                      v = x[i];
                      if (x.hasOwnProperty(i) &&
                              typeof v != 'undefined' &&
                              typeof v != 'function') {
                          if (l < a.length) {
                              e(',');
                          }
                          g(i);
                          e(':');
                          g(v);
                      }
                  }
                  return e('}');
              }
          }
          e('null');
          return;
      case 'number':
          e(isFinite(x) ? +x : 'null');
          return;
      case 'string':
          l = x.length;
          e('"');
          for (i = 0; i < l; i += 1) {
              c = x.charAt(i);
              if (c >= ' ') {
                  if (c == '\\' || c == '"') {
                      e('\\');
                  }
                  e(c);
              } else {
                  switch (c) {
                      case '\b':
                          e('\\b');
                          break;
                      case '\f':
                          e('\\f');
                          break;
                      case '\n':
                          e('\\n');
                          break;
                      case '\r':
                          e('\\r');
                          break;
                      case '\t':
                          e('\\t');
                          break;
                      default:
                          c = c.charCodeAt();
                          e('\\u00' + Math.floor(c / 16).toString(16) +
                              (c % 16).toString(16));
                  }
              }
          }
          e('"');
          return;
      case 'boolean':
          e(String(x));
          return;
      default:
          e('null');
          return;
      }
  }
  g(v);
  return a.join('');
};

/**
 * Displays error message.
 *
 * <pre>
 * Calls onError callback function provided by user. If there is no onError
 * callback function, displays alert with human readable error description.
 * onError callback function receives following object:
 * {
 *   errorCode: error code [number],
 *   errorDescription: human readable error description [string]
 * }
 * </pre>
 *
 * @private
 * @param {number} iErrCode Error code
 * @param {string} strError Human readable error description
 * @param {function} onError Callback function provided by user
 */
Masc.Transport.displayError = function(iErrCode, strError, onError) {
  if (typeof onError == 'function') {
    onError({
      errorCode: iErrCode,
      errorDescription: strError
    });
  } else {
    alert(strError);
  }
};

/**
 * Translates a URL to the URL relative to the specified or to absolute URL.
 *
 * <pre>
 * Arguments object format:
 * {
 *   url: absolute or relative URL to translate [string] (if absolute, will be
 *    returned as is),
 *   relativeTo: "url" will be translated to the URL relative to this absolute
 *    or relative URL [string] (optional, current page URL by default)
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 * @return Translated URL
 * @type string
 */
Masc.Transport.translateUrl = function(objArgs) {
  if (!objArgs || !objArgs.url) {
    return null;
  }
  // Cut arguments part from url
  var arrFullUrl = objArgs.url.split('?', 2);
  var strUrl = arrFullUrl[0];
  // Check url
  if (strUrl.charAt(0) == '/' || strUrl.indexOf(':') >= 0) {
    // Return absolute URL as is
    return objArgs.url;
  }
  // Get relativeTo
  var strRelativeTo;
  if (typeof objArgs.relativeTo != 'string') {
    // By default relative to current page URL
    strRelativeTo = document.location.toString().split('?', 2)[0];
  } else {
    // Remove arguments from relativeTo
    strRelativeTo = objArgs.relativeTo.split('?', 2)[0];
    // Check relativeTo
    if (strRelativeTo.indexOf('/') < 0) {
      // Relative to current page URL
      strRelativeTo = document.location.toString().split('?', 2)[0];
    } else if (strRelativeTo.charAt(0) != '/' &&
     strRelativeTo.indexOf(':') < 0) {
      // Transform relativeTo to absolute URL to be able to translate URLs
      // starting from ../
      strRelativeTo = Masc.Transport.translateUrl({
        url: strRelativeTo
      });
    }
  }
  // Split URLs
  var arrUrl = strUrl.split('/');
  var arrRelativeTo = strRelativeTo.split('/');
  // Remove file name
  arrRelativeTo.pop();
  // Form new URL
  for (var iToken = 0; iToken < arrUrl.length; iToken++) {
    var strToken = arrUrl[iToken];
    if (strToken == '..') {
      arrRelativeTo.pop();
    } else if (strToken != '.') {
      arrRelativeTo.push(strToken);
    }
  }
  arrFullUrl[0] = arrRelativeTo.join('/');
  // Restore arguments part
  return arrFullUrl.join('?');
};

/**
 * Holds currently loading URLs to prevent duplicate loads.
 * @private
 */
Masc.Transport.loading = {};

/**
 * Prevents duplicate loads of the same URL when second request is done before
 * first request is completed.
 *
 * <pre>
 * Arguments object format:
 * {
 *   url: [string] absolute URL,
 *   force: [boolean, optional] force reload if it is already loaded,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error
 * }
 *
 * Returned object format:
 *
 * If this URL is already loading by another process:
 * {
 *   loading: [boolean] always true
 * }
 *
 * Otherwise:
 * {
 *   onLoad: [function, optional] replacement for function to call on success,
 *   onError: [function, optional] replacement for function to call on error
 * }
 * </pre>
 *
 * @private
 * @param {object} objArgs Arguments object
 * @return Returned object
 * @type object
 */
Masc.Transport.setupEvents = function(objArgs) {
  // Check arguments
  if (!objArgs) {
    return {};
  }
  // If loading is forced, we don't need to check if it is already loading
  // If EventDriven is not available, operate as in older versions
  // Check if URL is passed
  if (objArgs.force || !Masc.EventDriven || !objArgs.url) {
    return {
      onLoad: objArgs.onLoad,
      onError: objArgs.onError
    };
  }
  var strUrl = objArgs.url;
  // Add onLoad listener
  if (typeof objArgs.onLoad == 'function') {
    Masc.EventDriven.addEventListener('zpTransportOnLoad' + strUrl,
     objArgs.onLoad);
  }
  // Add onError listener
  if (typeof objArgs.onError == 'function') {
    Masc.EventDriven.addEventListener('zpTransportOnError' + strUrl,
     objArgs.onError);
  }
  // Check if it is already loading
  if (Masc.Transport.loading[strUrl]) {
    return {
      loading: true
    };
  } else {
    // Flag
    Masc.Transport.loading[strUrl] = true;
    // Replace original callbacks
    return {
      onLoad: new Function("\
        Masc.EventDriven.fireEvent('zpTransportOnLoad" + strUrl + "');\
        Masc.EventDriven.removeEvent('zpTransportOnLoad" + strUrl + "');\
        Masc.EventDriven.removeEvent('zpTransportOnError" + strUrl + "');\
        Masc.Transport.loading['" + strUrl + "'] = false;\
      "),
      onError: new Function('objError', "\
        Masc.EventDriven.fireEvent('zpTransportOnError" + strUrl + "',\
         objError);\
        Masc.EventDriven.removeEvent('zpTransportOnLoad" + strUrl + "');\
        Masc.EventDriven.removeEvent('zpTransportOnError" + strUrl + "');\
        Masc.Transport.loading['" + strUrl + "'] = false;\
      ")
    };
  }
};

/**
 * Holds URLs of already loaded JS files to prevent duplicate loads.
 * @private
 */
Masc.Transport.loadedJS = {};

/**
 * Checks if specified JS file is already loaded.
 *
 * @private
 * @param {string} strUrl Absolute or relative URL of JS file
 * @param {string} strAbsoluteUrl Optional. Absolute URL of JS file
 * @return Loaded or not
 * @type boolean
 */
Masc.Transport.isLoadedJS = function(strUrl, strAbsoluteUrl) {
  // Get absolute URL of the JS file
  if (typeof strAbsoluteUrl == 'undefined') {
    strAbsoluteUrl = Masc.Transport.translateUrl({url: strUrl});
  }
  // Check in the list of loaded
  if (Masc.Transport.loadedJS[strAbsoluteUrl]) {
    return true;
  }
  // Try to find script tag
  var arrScripts = document.getElementsByTagName('script');
  for (var iScript = 0; iScript < arrScripts.length; iScript++) {
    var strSrc = arrScripts[iScript].getAttribute('src') || '';
    if (strSrc == strUrl) {
      // Add this URL to the list of loaded
      Masc.Transport.loadedJS[strAbsoluteUrl] = true;
      return true;
    }
  }
  // Not found
  return false;
};

/**
 * Returns path to the specified js file. Iterates over all loaded script
 * elements starting from the end. Finds specified js file in src attribute of
 * the script element. Splits src attribute value and returns path without js
 * file name.
 *
 * @param {string} strScriptFileName Script file name, e.g. 'zpmywidget.js'
 * @return Path to the script, e.g. '../src/' or '' if path is not found
 * @type string
 */
Masc.Transport.getPath = function(strScriptFileName) {
  // Get all script elements
  var arrScripts = document.getElementsByTagName('script');
  // Find the script in the list
  for (var iScript = arrScripts.length - 1; iScript >= 0; iScript--) {
    var strSrc = arrScripts[iScript].getAttribute('src') || '';
    var arrTokens = strSrc.split('/');
    // Remove last token
    var strLastToken = arrTokens.pop();
    if (strLastToken == strScriptFileName) {
      return arrTokens.join('/') + '/';
    }
  }
  // Search in loaded JS files
  for (var strSrc in Masc.Transport.loadedJS) {
    var arrTokens = strSrc.split('/');
    // Remove last token
    var strLastToken = arrTokens.pop();
    if (strLastToken == strScriptFileName) {
      return arrTokens.join('/') + '/';
    }
  }
  // Not found
  return '';
};

/**
 * Simply writes script tag to the document. Checks if specified JS file is
 * already loaded unless boolForce argument is true.
 *
 * @param {string} strSrc Src attribute value of the script element
 * @param {boolean} boolForce Optional. Force reload if it is already loaded
 */
Masc.Transport.include = function(strSrc, boolForce) {
  // Get absolute URL of the JS file
  var strAbsoluteUrl = Masc.Transport.translateUrl({url: strSrc});
  // Check if it is already loaded
  if (!boolForce && Masc.Transport.isLoadedJS(strSrc, strAbsoluteUrl)) {
    return;
  }
  // Include file
  document.write('<s' + 'cript type="text/javascript" src="' + strSrc +
   '"></s' + 'cript>');
  // Add this URL to the list of loaded
  Masc.Transport.loadedJS[strAbsoluteUrl] = true;
};

/**
 * Includes JS file into the page. Allows URLs from foreign domains. Doesn't
 * check if the JS file is already included. File is loaded asynchronously.
 *
 * @param {string} strSrc Src attribute value of the script element
 */
Masc.Transport.includeJS = function(strSrc) {
  var objContainer = document.body;
  if (!objContainer) {
    objContainer = document.getElementsByTagName('head')[0];
    if (!objContainer) {
      objContainer = document;
    }
  }
  var objScript = document.createElement('script');
  objScript.type = 'text/javascript';
  objScript.src = strSrc;
  // It's important for Safari to assign attributes before appending
  objContainer.appendChild(objScript);
};

/**
 * Fetches JS file using fetch and evaluates it in local scope.
 *
 * <pre>
 * When JS file is loaded successfully, onLoad callback function is called
 * without arguments. URL is added into Masc.Transport.loadedJS array
 * and will not be fetched again on next function call unless force argument is
 * set to true.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: [number] server status number (404, etc.),
 *   errorDescription: [string] human readable error description
 * }
 *
 * One of the arguments: module or url is required. When url is passed,
 * module argument is ignored.
 *
 * If module argument is used, function gets all "script" elements using
 * getElementsByTagName and searches for the first element having "src"
 * attribute value ending with (relativeModule + ".js") (default relativeModule
 * value is "transport"). Path to the module is taken from that src attribute
 * value and will be the same as path to relativeModule file.
 *
 * Arguments object format:
 * {
 *   url: [string, optional] absolute or relative URL of JS file,
 *   module: [string, optional] module name (file name without .js extension),
 *   relativeModule: [string, optional] search module in the same directory as
 *    relative module (default: 'transport') (file name without .js extension),
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   force: [boolean, optional] force reload if it is already loaded,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error
 * }
 *
 * Note: If "force" is used, you should add 'r=' + Math.random() parameter to
 * URL to prevent loading from browser cache.
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Transport.loadJS = function(objArgs) {
  // Check arguments
  if (!(objArgs instanceof Object)) {
    return;
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  // Get URL of JS file
  var strUrl = null;
  if (objArgs.url) {
    strUrl = objArgs.url;
  } else if (objArgs.module) {
    var strRelativeModule = 'transport.js';
    if (objArgs.relativeModule) {
      strRelativeModule = objArgs.relativeModule + '.js';
    }
    strUrl = Masc.Transport.getPath(strRelativeModule) + objArgs.module +
     '.js';
  } else {
    return;
  }
  // Get absolute URL of the JS file
  var strAbsUrl = Masc.Transport.translateUrl({url: strUrl});
  // Check arguments
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  // Check if it is already loaded
  if (!objArgs.force && Masc.Transport.isLoadedJS(strUrl, strAbsUrl)) {
    // onLoad callback
    if (typeof objArgs.onLoad == 'function') {
      objArgs.onLoad();
    }
    return;
  }
  // Setup onLoad and onError events
  var objHandlers = Masc.Transport.setupEvents({
    url: strAbsUrl,
    force: objArgs.force,
    onLoad: objArgs.onLoad,
    onError: objArgs.onError
  });
  // Don't need to continue if this url is already loading by another process
  if (objHandlers.loading) {
    return;
  }
  // Load JS file
  Masc.Transport.fetch({
    url: strUrl,
    async: objArgs.async,
    onLoad: function(objRequest) {
      // Can be loaded in two processes simultaneously
      if (objArgs.force || !Masc.Transport.loadedJS[strAbsUrl]) {
        var arrTokens = strUrl.split('/');
        // Remove last token
        var strLastToken = arrTokens.pop();
        // Store path to current module
        Masc.lastLoadedModule = arrTokens.join('/') + '/';
        // Evaluate code in global scope
        Masc.Transport.evalGlobalScope(objRequest.responseText);

        // clear path to last loaded module
        Masc.lastLoadedModule = null;

        // Add this URL to the list of loaded
        Masc.Transport.loadedJS[strAbsUrl] = true;
      }
      // onLoad callback
      if (typeof objHandlers.onLoad == 'function') {
        objHandlers.onLoad();
      }
    },
    onError: objHandlers.onError
  });
};

/**
 * Includes CSS file into the page. Allows URLs from foreign domains. Doesn't
 * check if the CSS file is already included. File is loaded asynchronously.
 * Requires that head section of the page already exists because link tag
 * may appear only inside head.
 *
 * @param {string} strHref Href attribute value of the link element
 */
Masc.Transport.includeCSS = function(strHref) {
  // May appear only inside head
  var objContainer = document.getElementsByTagName('head')[0];
  if (!objContainer) {
    return;
  }
  var objLink = document.createElement('link');
  objLink.setAttribute('rel', 'stylesheet');
  objLink.setAttribute('type', 'text/css');
  objLink.setAttribute('href', strHref);
  objContainer.appendChild(objLink);
};

/**
 * Holds URLs of already loaded CSS files to prevent duplicate loads.
 * @private
 */
Masc.Transport.loadedCss = {};

/**
 * Fetches style sheet using fetch and loads it into the document.
 *
 * <pre>
 * When stylesheet is loaded successfully, onLoad callback function is called
 * without arguments. URL is added into Masc.Transport.loadedCss array
 * and will not be fetched again on next function call unless force argument is
 * set to true.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: server status number (404, etc.) [number],
 *   errorDescription: human readable error description [string]
 * }
 *
 * Arguments object format:
 * {
 *   url: absolute or relative URL of CSS file [string],
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   force: [boolean, optional] force reload if it is already loaded,
 *   onLoad: [function, optional] function reference to call on success,
 *   onError: [function, optional] function reference to call on error
 * }
 *
 * Note: If "force" is used, you should add 'r=' + Math.random() parameter to
 * URL to prevent loading from browser cache.
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Transport.loadCss = function(objArgs) {
  // Check arguments
  if (!(objArgs instanceof Object)) {
    return;
  }
  if (!objArgs.url) {
    return;
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  // Get absolute URL of the CSS file
  var strAbsUrl = Masc.Transport.translateUrl({url: objArgs.url});
  // Check if it is already loaded
  if (!objArgs.force) {
    if (Masc.Transport.loadedCss[strAbsUrl]) {
      // onLoad callback
      if (typeof objArgs.onLoad == 'function') {
        objArgs.onLoad();
      }
      return;
    }
    var arrLinks = document.getElementsByTagName('link');
    for (var iLnk = 0; iLnk < arrLinks.length; iLnk++) {
      var strHref = arrLinks[iLnk].getAttribute('href') || '';
      if (strHref == objArgs.url) {
        // Add this url to the list of loaded
        Masc.Transport.loadedCss[strAbsUrl] = true;
        // onLoad callback
        if (typeof objArgs.onLoad == 'function') {
          objArgs.onLoad();
        }
        return;
      }
    }
  }
  // Setup onLoad and onError events
  var objHandlers = Masc.Transport.setupEvents({
    url: strAbsUrl,
    force: objArgs.force,
    onLoad: objArgs.onLoad,
    onError: objArgs.onError
  });
  // Don't need to continue if this url is already loading by another process
  if (objHandlers.loading) {
    return;
  }
  // Load Masc.StyleSheet class definition
  Masc.Transport.loadJS({
    module: 'stylesheet',
    async: objArgs.async,
    onLoad: function() {
      // Load CSS file
      Masc.Transport.fetch({
        url: objArgs.url,
        async: objArgs.async,
        onLoad: function(objRequest) {
          // Parse CSS file.
          // Find URLs and translate them to absolute.
          // Find @import rules and load corresponding CSS files.
          var strCss = objRequest.responseText;
          var arrResultCss = [];
          // Will hold image URLs to preload
          var arrImgUrls = [];
          // Will hold CSS URLs to load
          var arrCssUrls = [];
          // Move first cursor to the beginning of the string
          var iPos = 0;
          // Move second cursor to the pattern
          var iNextPos = strCss.indexOf('url(', iPos);
          while (iNextPos >= 0) {
            // Move first cursor to the URL
            iNextPos += 4;
            // Check if this is @import rule
            var strToken = strCss.substring(iPos, iNextPos);
            var boolIsImport = /@import\s+url\($/.test(strToken);
            // Add part of the string before URL
            arrResultCss.push(strToken);
            // Move second cursor to the new location to start the search from
            iPos = iNextPos;
            // Search the end of URL
            iNextPos = strCss.indexOf(')', iPos);
            if (iNextPos >= 0) {
              // Remove quotes
              var strImgUrl = strCss.substring(iPos, iNextPos);
              strImgUrl = strImgUrl.replace(/['"]/g, '');
              // Translate image URL relative to CSS file URL
              strImgUrl = Masc.Transport.translateUrl({
                url: strImgUrl,
                relativeTo: objArgs.url
              });
              // Convert to absolute URL
              strImgUrl = Masc.Transport.translateUrl({
                url: strImgUrl
              });
              // Add translated URL
              arrResultCss.push(strImgUrl);
              // Add URL to the list
              if (boolIsImport) {
                // Add CSS URL to load list
                arrCssUrls.push(strImgUrl);
              } else {
                // Add image URL to preload list
                arrImgUrls.push(strImgUrl);
              }
              // Move second cursor to the new location to start the search from
              iPos = iNextPos;
              // Search next pattern
              iNextPos = strCss.indexOf('url(', iPos);
            }
          }
          // Add the rest of string
          arrResultCss.push(strCss.substr(iPos));
          // Get translated CSS text
          strCss = arrResultCss.join('');
          // Load CSS files
          Masc.Transport.loadCssList({
            urls: arrCssUrls,
            async: objArgs.async,
            onLoad: function() {
              // Add style sheet rules into the page
              var objStyleSheet = new Masc.StyleSheet();
              objStyleSheet.addParse(strCss);
              // Fire event
              if (typeof objHandlers.onLoad == 'function') {
                objHandlers.onLoad();
              }
            }
          });
          // Add this URL to the list of loaded
          Masc.Transport.loadedCss[strAbsUrl] = true;
          // Preload images
          Masc.Transport.preloadImages({
            urls: arrImgUrls,
            timeout: 60000 // 1 minute
          });
        },
        onError: objHandlers.onError
      });
    },
    onError: objHandlers.onError
  });
};

/**
 * Loads several CSS files one by one it into the document.
 *
 * <pre>
 * This function behaves differently from other Masc.Transport functions.
 * onLoad callback function will be called in any case, even if errors occured
 * during loading. If there are multiple errors, onError callback function will
 * be called once for every passed URL that wasn't loaded successfully.
 *
 * onLoad callback function is called without arguments.
 *
 * onError callback function receives following object:
 * {
 *   errorCode: server status number (404, etc.) [number],
 *   errorDescription: human readable error description [string]
 * }
 *
 * Arguments object format:
 * {
 *   urls: array of absolute or relative URLs of CSS files to load [object]
 *    (files will be loaded in order they appear in the array),
 *   async: [boolean, optional] use asynchronous mode (default: true),
 *   force: [boolean, optional] force reload if it is already loaded,
 *   onLoad: function reference to call on completion [function] (optional),
 *   onError: function reference to call on error [function] (optional)
 * }
 *
 * Note: If "force" is used, you should add 'r=' + Math.random() parameter to
 * URL to prevent loading from browser cache.
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Transport.loadCssList = function(objArgs) {
  // Check arguments
  if (!(objArgs instanceof Object)) {
    return;
  }
  if (typeof objArgs.async == 'undefined') {
    objArgs.async = true;
  }
  if (!objArgs.onLoad) {
    objArgs.onLoad = null;
  }
  if (!objArgs.onError) {
    objArgs.onError = null;
  }
  if (!objArgs.urls || !objArgs.urls.length) {
    // onLoad callback
    if (typeof objArgs.onLoad == 'function') {
      objArgs.onLoad();
    }
    return;
  }
  // Get first URL in the array
  var strUrl = objArgs.urls.shift();
  // CSS file onLoad handler
  var funcOnLoad = function() {
    // Load the rest of URLs
    Masc.Transport.loadCssList({
      urls: objArgs.urls,
      async: objArgs.async,
      force: objArgs.force,
      onLoad: objArgs.onLoad,
      onError: objArgs.onError
    });
  };
  // Load CSS file
  Masc.Transport.loadCss({
    url: strUrl,
    async: objArgs.async,
    force: objArgs.force,
    onLoad: funcOnLoad,
    onError: function(objError) {
      Masc.Transport.displayError(objError.errorCode,
       objError.errorDescription, objArgs.onError);
      funcOnLoad();
    }
  });
};

/**
 * Holds image preloads.
 * @private
 */
Masc.Transport.imagePreloads = [];

/**
 * Preloads one or several images at once. See Masc.PreloadImages class
 * (utils/preloadimages.js) for details.
 *
 * <pre>
 * Arguments object format:
 * {
 *   urls: [object] array of absolute or relative image URLs to preload,
 *   onLoad: [function, optional] onload event handler,
 *   timeout: [number, optional] number of milliseconds to wait for onload
 *    event before forcing it
 * }
 * </pre>
 *
 * @param {object} objArgs Arguments object
 */
Masc.Transport.preloadImages = function(objArgs) {
  Masc.Transport.loadJS({
    module: '',
    onLoad: function() {
      Masc.Transport.imagePreloads.push(new Masc.PreloadImages(objArgs));
    }
  });
};
