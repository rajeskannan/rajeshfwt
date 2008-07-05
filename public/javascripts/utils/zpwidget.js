/**
 * @fileoverview Masc Widget library. Base Widget class.
 *
 * <pre>
 * Copyright (c) 2004-2006 by Masc, Inc.
 * http://www.Masc.com
 * 1700 MLK Way, Berkeley, California,
 * 94709, U.S.A.
 * All rights reserved.
 * </pre>
 */

/* $Id: zpwidget.js 4398 2006-09-11 23:34:58Z alex $ */

if (typeof Masc == 'undefined') {
  /**
   * @ignore Namespace definition.
   */
  Masc = {};
}

/**
 * Base widget class.
 *
 * <pre>
 * Defines following config options:
 *
 * <b>theme</b> [string] Theme name that will be used to display the widget.
 * Corresponding CSS file will be picked and added into the HTML document
 * automatically. Case insensitive. Default: "default".
 * May also contain relative or absolute URL of themes directory.
 * E.g. "../themes/default.css" or "http://my.web.host/themes/default.css".
 *
 * <b>themePath</b> [string] Relative or absolute URL to themes directory.
 * Trailing slash is required. Default: path to child widget's file +
 * "../themes/". You may also include path into "theme" option instead of using
 * "themePath" option.
 *
 * <b>asyncTheme</b> [boolean] Load theme asynchronously. This means that script
 * execution will not be suspended until theme is loaded. Theme will be applied
 * once it is loaded. Default: false.
 *
 * <b>source</b> Depends on "sourceType" option. Possible sources:
 * -----------------------------------------------------------------------------
 * sourceType     | source
 * ---------------|-------------------------------------------------------------
 * 1) "html"      | [object or string] HTMLElement or its id.
 * 2) "html/text" | [string] HTML fragment.
 * 3) "html/url"  | [string] URL of HTML fragment.
 * 4) "json"      | [object or string] JSON object or string (http://json.org).
 * 5) "json/url"  | [string] URL of JSON data source.
 * 6) "xml"       | [object or string] XMLDocument object or XML string.
 * 7) "xml/url"   | [string] URL of XML data source.
 * -----------------------------------------------------------------------------
 *
 * <b>sourceType</b> [string] Used together with "source" option to specify how
 * source should be processed. Possible source types:
 * "html", "html/text", "html/url", "json", "json/url", "xml", "xml/url".
 * JSON format is described at http://www.json.org.
 *
 * <b>callbackSource</b> [function] May be used instead of "source" and
 * "sourceType" config options to get source depending on passed arguments.
 * Receives object with passed arguments. Must return following object:
 * {
 *   source: [object or string] see table above for possible sources,
 *   sourceType: [string] see table above for possible source types
 * }
 *
 * <b>asyncSource</b> [boolean] Load source asynchronously. This means that
 * script execution will not be suspended until source is loaded. Source will be
 * processed once it is loaded. Default: true.
 *
 * <b>reliableSource</b> [boolean] Used together with "json" or "json/url"
 * sourceType to skip JSON format verification. It saves a lot of time for large
 * data sets. Default: true.
 *
 * <b>eventListeners</b> [object] Associative array with event listeners:
 * {
 *   [string] event name: [function] event listener,
 *   ...
 * }
 * </pre>
 *
 * @constructor
 * @extends Masc.EventDriven
 * @param {object} objArgs User configuration
 */
Masc.Widget = function(objArgs) {
  // User configuration
  this.config = {};
  // Call constructor of superclass
  Masc.Widget.SUPERconstructor.call(this);
  // Initialize object
  this.init(objArgs);
};

// Inherit EventDriven
Masc.inherit(Masc.Widget, Masc.EventDriven);

/**
 * @private Holds path to this file.
 */
Masc.Widget.path = Masc.getPath();

/**
 * Initializes object.
 *
 * <pre>
 * Important: Before calling this method, define config options for the widget.
 * Initially "this.config" object should contain all config options with their
 * default values. Then values of config options will be changed with user
 * configuration in this method. Config options provided by user that were not
 * found in "this.config" object will be ignored.
 * </pre>
 *
 * @param {object} objArgs User configuration
 */
Masc.Widget.prototype.init = function(objArgs) {
  // Call parent method
  Masc.Widget.SUPERclass.init.call(this);
  // Add this widget to the list
  if (typeof this.id == 'undefined') {
    this.id = Masc.Widget.all.length;
    Masc.Widget.all.push(this);
  }
  // Configure
  this.configure(objArgs);
  // Add custom event listeners
  this.addUserEventListeners();
  // Add standard event listeners
  this.addStandardEventListeners();
  // Load theme
  this.loadTheme();
};

/**
 * Reconfigures the widget with new config options after it was initialized.
 * May be used to change look or behavior of the widget after it has loaded
 * the data. In the argument pass only values for changed config options.
 * There is no need to pass config options that were not changed.
 *
 * <pre>
 * Note: "eventListeners" config option is ignored by this method because it is
 * useful only on initialization. To add event listener after the widget was
 * initialized, use addEventListener method instead.
 * </pre>
 *
 * @param {object} objArgs Changes to user configuration
 */
Masc.Widget.prototype.reconfigure = function(objArgs) {
  // Configure
  this.configure(objArgs);
  // Load theme
  this.loadTheme();
};

/**
 * Configures widget.
 *
 * @param {object} objArgs User configuration
 */
Masc.Widget.prototype.configure = function(objArgs) {
  // Default configuration
  this.defineConfigOption('theme', 'default');
  if (typeof this.constructor.path != 'undefined') {
    this.defineConfigOption('themePath', this.constructor.path + '../themes/');
  } else {
    this.defineConfigOption('themePath', '../themes/');
  }
  this.defineConfigOption('asyncTheme', false);
  this.defineConfigOption('source');
  this.defineConfigOption('sourceType');
  this.defineConfigOption('callbackSource');
  this.defineConfigOption('asyncSource', true);
  this.defineConfigOption('reliableSource', true);
  this.defineConfigOption('eventListeners', {});
  // Get user configuration
  if (objArgs) {
    for (var strOption in objArgs) {
      if (typeof this.config[strOption] != 'undefined') {
        this.config[strOption] = objArgs[strOption];
      } else {
        Masc.Log({
          description: "Unknown config option: " + strOption
        });
      }
    }
  }
};

/**
 * Returns current configuration of the widget.
 *
 * @return Current configuration
 * @type object
 */
Masc.Widget.prototype.getConfiguration = function() {
  return this.config;
};

/**
 * @private Array to access any widget on the page by its id number.
 */
Masc.Widget.all = [];

/**
 * Finds a widget by id.
 *
 * @param {number} Widget id
 * @return Widget or undefined if not found
 * @type object
 */
Masc.Widget.getWidgetById = function(iId) {
  return Masc.Widget.all[iId];
};

/**
 * @private Defines config option if it is not defined yet. Sets default value
 * of new config option. If default value is not specified, it is set to null.
 *
 * @param {string} strOption Config option name
 * @param {any} val Optional. Config option default value
 */
Masc.Widget.prototype.defineConfigOption = function(strOption, val) {
  if (typeof this.config[strOption] == 'undefined') {
    if (typeof val == 'undefined') {
      this.config[strOption] = null;
    } else {
      this.config[strOption] = val;
    }
  }
};

/**
 * Adds custom event listeners.
 */
Masc.Widget.prototype.addUserEventListeners = function() {
  for (var strEvent in this.config.eventListeners) {
    if (this.config.eventListeners.hasOwnProperty(strEvent)) {
      this.addEventListener(strEvent, this.config.eventListeners[strEvent]);
    }
  }
};

/**
 * Adds standard event listeners.
 */
Masc.Widget.prototype.addStandardEventListeners = function() {
  this.addEventListener('loadThemeError', Masc.Widget.loadThemeError);
};

/**
 * Displays the reason why the theme was not loaded.
 * @private
 */
Masc.Widget.loadThemeError = function(objError) {
  var strDescription = "Can't load theme.";
  if (objError && objError.errorDescription) {
    strDescription += ' ' + objError.errorDescription;
  }
  Masc.Log({
    description: strDescription
  });
};

/**
 * Loads specified theme.
 */
Masc.Widget.prototype.loadTheme = function() {
	// Correct theme config option
	if (typeof this.config.theme == 'string' && this.config.theme.length) {
		// Remove path
		var iPos = this.config.theme.lastIndexOf('/');
		if (iPos >= 0) {
			iPos++; // Go to first char of theme name
			this.config.themePath = this.config.theme.substring(0, iPos);
			this.config.theme = this.config.theme.substring(iPos);
		}
		// Remove file extension
		iPos = this.config.theme.lastIndexOf('.');
		if (iPos >= 0) {
			this.config.theme = this.config.theme.substring(0, iPos);
		}
		// Make lower case
		this.config.theme = this.config.theme.toLowerCase();
	} else {
		this.config.theme = '';
	}
	// Load theme
	if(this.config.theme){
    this.fireEvent('loadThemeStart');
		this.themeLoaded = false;
		var objWidget = this;
		var strUrl = this.config.themePath + this.config.theme + '.css';
		Masc.Transport.loadCss({
			// URL of theme file
			url: strUrl,
			// Suspend script execution until theme is loaded or error received
			async: this.config.asyncTheme,
			// Onload event handler
			onLoad: function() {
        objWidget.fireEvent('loadThemeEnd');
				objWidget.themeLoaded = true;
				objWidget.hideLoader();
			},
			onError: function(objError) {
        objWidget.fireEvent('loadThemeEnd');
        objWidget.fireEvent('loadThemeError', objError);
				objWidget.themeLoaded = true;
				objWidget.hideLoader();
			}
		});
	}
}
/**
 * Forms class name from theme name and provided prefix and suffix.
 *
 * <pre>
 * Arguments object format:
 * {
 *   prefix: [string, optional] prefix,
 *   suffix: [string, optional] suffix
 * }
 * E.g. if this.config.theme == 'default' and following object provided
 * {
 *   prefix: 'zpWidget',
 *   suffix: 'Container'
 * },
 * class name will be 'zpWidgetDefaultContainer'.
 * </pre>
 *
 * @param objArgs [object] Arguments object
 * @return Class name
 * @type string
 */
Masc.Widget.prototype.getClassName = function(objArgs) {
  var arrClassName = [];
  if (objArgs && objArgs.prefix) {
    arrClassName.push(objArgs.prefix);
  }
  if (this.config.theme != '') {
    arrClassName.push(this.config.theme.charAt(0).toUpperCase());
    arrClassName.push(this.config.theme.substr(1));
  }
  if (objArgs && objArgs.suffix) {
    arrClassName.push(objArgs.suffix);
  }
  return arrClassName.join('');
};

/**
 * @private if theme for current widget is not loaded yet - this method will
 * hide widget container and show progress bar instead of it.
 */
Masc.Widget.prototype.showLoader = function(message){
	if(this.container != null && this.config.theme && !this.themeLoaded){
		// if window content is not fulle loaded - progress bar can resize
		// incorrectly
		if(!Masc.windowLoaded){
			var self = this;
			Masc.Utils.addEvent(window, "load", function(){self.showLoader(message)});
			return null;
		}

		if(typeof(Masc.Progress) == 'undefined'){
			var self = this;

			Masc.Transport.loadJS({
				module: '',
				onLoad: function() {
					// if theme is already loaded - do not show progress bar
					if(self.themeLoaded){
						return null;
					}

					self.showLoader(message);
				}
			});

			return null;
		}

		this.loader = new Masc.Progress({
			container: this.container,
			themePath: Masc.Progress.path + "../../zpextra/themes/progress/"
		});

		this.loader.start(message || 'loading');
		this.container.style.visibility = 'hidden';
	}
}

/**
 * @private Hides progressbar created using #showLoader and shows widget.
 * This method will be called automatically on theme loading.
 */
Masc.Widget.prototype.hideLoader = function(){
	if(this.loader && this.loader.isActive()){
		this.container.style.visibility = '';
		this.loader.stop();
	}
}

/**
 * Shows widget using given effects and animation speed. You need to define
 * this.container to use this method.
 * @param {object} effects list of effects to apply
 * @param {number} animSpeed possible values - 1..100. Bigger value - more fast animation.
 * @param {function} onFinish Function to call on effect end.
 */
Masc.Widget.prototype.showContainer = function(effects, animSpeed, onFinish){
	return this.showHideContainer(effects, animSpeed, onFinish, true);
}

/**
 * Hides widget using given effects and animation speed. You need to define
 * this.container to use this method.
 * @param {object} effects list of effects to apply
 * @param {number} animSpeed possible values - 1..100. Bigger value - more fast animation.
 */
Masc.Widget.prototype.hideContainer = function(effects, animSpeed, onFinish){
	return this.showHideContainer(effects, animSpeed, onFinish, false);
}

/**
 * Show/hides widget using given effects and animation speed. You need to define
 * this.container to use this method.
 * @param {object} effects list of effects to apply
 * @param {number} animSpeed possible values - 1..100. Bigger value - more fast animation.
 * @param {boolean} show if true - show widget. Otherwise - hide.
 */
Masc.Widget.prototype.showHideContainer = function(effects, animSpeed, onFinish, show){
	if(this.container == null){
		return null;
	}

	if(typeof(Masc.Effects) == 'undefined'){
		var self = this;

		Masc.Transport.loadJS({
			url: Masc.Widget.path + '../../zpeffects/src/effects.js',
			onLoad: function() {
				self.showHideContainer(effects, animSpeed, onFinish, show);
			}
		});

		return false;
	}

	if(animSpeed == null && isNaN(parseInt(animSpeed))){
		animSpeed = 5;
	}

	if(effects == null || effects.length == 0){
		if(show){
			this.container.style.display = this.originalContainerDisplay;
			this.originalContainerDisplay = null;
		} else {
			this.originalContainerDisplay = this.container.style.display;
			this.container.style.display = 'none';
		}

		if (onFinish) {
			onFinish();
		}
	} else {
		if(show){
			Masc.Effects.show(this.container, animSpeed, effects, onFinish);
		} else {
			Masc.Effects.hide(this.container, animSpeed, effects, onFinish);
		}
	}

	return true;
}

/**
 * Loads data from the specified source.
 *
 * <pre>
 * If source is URL, fires following events:
 * <ul>
 * <li><i>fetchSourceStart</i> when Masc.Transport#fetch is called</li>
 * <li><i>fetchSourceEnd</i> when Masc.Transport#fetch returns result or
 *  error</li>
 * <li><i>fetchSourceError</i> when Masc.Transport#fetch returns error.
 *  fetchSourceError event listener receives object returned by
 *  Masc.Transport#fetch</li>
 * </ul>
 *
 * Fires following events:
 * <ul>
 * <li><i>loadDataStart</i> when data parsing is started</li>
 * <li><i>loadDataEnd</i> when data parsing is ended or error occured during
 *  fetch</li>
 * </ul>
 * </pre>
 *
 * @param {object} objArgs Arguments object passed to callbackSource function
 */
Masc.Widget.prototype.loadData = function(objArgs) {
  // Get source using callback function
  if (typeof this.config.callbackSource == 'function') {
    var objSource = this.config.callbackSource(objArgs);
    if (objSource) {
      if (typeof objSource.source != 'undefined') {
        this.config.source = objSource.source;
      }
      if (typeof objSource.sourceType != 'undefined') {
        this.config.sourceType = objSource.sourceType;
      }
    }
  }
  // Process source
  if (this.config.source != null && this.config.sourceType != null) {
    var strSourceType = this.config.sourceType.toLowerCase();
    if (strSourceType == 'html') {
      this.fireEvent('loadDataStart');
      this.loadDataHtml(Masc.Widget.getElementById(this.config.source));
      this.fireEvent('loadDataEnd');
    } else if (strSourceType == 'html/text') {
      this.fireEvent('loadDataStart');
      this.loadDataHtmlText(this.config.source);
      this.fireEvent('loadDataEnd');
    } else if (strSourceType == 'html/url') {
      this.fireEvent('fetchSourceStart');
      // Fetch source
      var objWidget = this;
      Masc.Transport.fetch({
        // URL of the source
        url: this.config.source,
        // Suspend script execution until source is loaded or error received
        async: this.config.asyncSource,
        // Onload event handler
        onLoad: function(objRequest) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataStart');
          objWidget.loadDataHtmlText(objRequest.responseText);
          objWidget.fireEvent('loadDataEnd');
        },
        // Onerror event handler
        onError: function(objError) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataEnd');
          objWidget.fireEvent('fetchSourceError', objError);
        }
      });
    } else if (strSourceType == 'json') {
      this.fireEvent('loadDataStart');
      if (typeof this.config.source == 'object') {
        this.loadDataJson(this.config.source);
      } else if (this.config.reliableSource) {
        this.loadDataJson(eval(this.config.source));
      } else {
        this.loadDataJson(Masc.Transport.parseJson({
          strJson: this.config.source
        }));
      }
      this.fireEvent('loadDataEnd');
    } else if (strSourceType == 'json/url') {
      this.fireEvent('fetchSourceStart');
      // Fetch source
      var objWidget = this;
      Masc.Transport.fetchJsonObj({
        // URL of the source
        url: this.config.source,
        // Suspend script execution until source is loaded or error received
        async: this.config.asyncSource,
        // Skip JSON format verification
        reliable: this.config.reliableSource,
        // Onload event handler
        onLoad: function(objResult) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataStart');
          objWidget.loadDataJson(objResult);
          objWidget.fireEvent('loadDataEnd');
        },
        // Onerror event handler
        onError: function(objError) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataEnd');
          objWidget.fireEvent('fetchSourceError', objError);
        }
      });
    } else if (strSourceType == 'xml') {
      this.fireEvent('loadDataStart');
      if (typeof this.config.source == 'object') {
        this.loadDataXml(this.config.source);
      } else {
        this.loadDataXml(Masc.Transport.parseXml({
          strXml: this.config.source
        }));
      }
      this.fireEvent('loadDataEnd');
    } else if (strSourceType == 'xml/url') {
      this.fireEvent('fetchSourceStart');
      // Fetch source
      var objWidget = this;
      Masc.Transport.fetchXmlDoc({
        // URL of the source
        url: this.config.source,
        // Suspend script execution until source is loaded or error received
        async: this.config.asyncSource,
        // Onload event handler
        onLoad: function(objResult) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataStart');
          objWidget.loadDataXml(objResult);
          objWidget.fireEvent('loadDataEnd');
        },
        // Onerror event handler
        onError: function(objError) {
          objWidget.fireEvent('fetchSourceEnd');
          objWidget.fireEvent('loadDataEnd');
          objWidget.fireEvent('fetchSourceError', objError);
        }
      });
    }
  } else {
    this.fireEvent('loadDataStart');
    this.loadDataHtml(Masc.Widget.getElementById(this.config.source));
    this.fireEvent('loadDataEnd');
  }
};

/**
 * Loads data from the HTML source. Override this in child class.
 *
 * @param {object} objSource Source HTMLElement object
 */
Masc.Widget.prototype.loadDataHtml = function(objSource) {};

/**
 * Loads data from the HTML fragment source.
 *
 * @param {string} strSource Source HTML fragment
 */
Masc.Widget.prototype.loadDataHtmlText = function(strSource) {
  // Parse HTML fragment
  var objTempContainer = Masc.Transport.parseHtml(strSource);
  // Load data
  this.loadDataHtml(objTempContainer.firstChild);
};

/**
 * Loads data from the JSON source. Override this in child class.
 *
 * @param {object} objSource Source JSON object
 */
Masc.Widget.prototype.loadDataJson = function(objSource) {};

/**
 * Loads data from the XML source. Override this in child class.
 *
 * @param {object} objSource Source XMLDocument object
 */
Masc.Widget.prototype.loadDataXml = function(objSource) {
};

/**
 * Finds a widget by id and calls specified method with specified arguments and
 * returns value from the method.
 *
 * @param {number} iWidgetId Widget id
 * @param {string} strMethod Method name
 * @param {any} any Any number of arguments
 * @return Value returned from the method
 * @type any
 */
Masc.Widget.callMethod = function(iWidgetId, strMethod) {
  // Get Widget object
  var objWidget = Masc.Widget.getWidgetById(iWidgetId);
  if (objWidget && typeof objWidget[strMethod] == 'function') {
    // Remove first two arguments
    var arrArgs = [].slice.call(arguments, 2);
    // Call method
    return objWidget[strMethod].apply(objWidget, arrArgs);
  }
};

/**
 * Converts element id to reference.
 *
 * @param {string} element Element id
 * @return Reference to element
 * @type object
 */
Masc.Widget.getElementById = function(element) {
  if (typeof element == 'string') {
    return document.getElementById(element);
  }
  return element;
};

/**
 * Returns style attribute of the specified element.
 *
 * @param {object} element Element
 * @return Style attribute value
 * @type string
 */
Masc.Widget.getStyle = function(element) {
  var style = element.getAttribute('style') || '';
  if (typeof style == 'string') {
    return style;
  }
  return style.cssText;
};

/**
 * Emulates "window.event" for certain events in Mozilla. To be able to access
 * Event object when event handler is set using element attribute, e.g.
 * &lt;a onclick="eventHandler()"&gt;.
 *
 * @param {object} arrEventNames array of event names where "window.event" is
 * needed, e.g. ['click', 'dblclick'].
 */
Masc.Widget.emulateWindowEvent = function(arrEventNames) {
  if (document.addEventListener) {
    // Set up emulation for certain events
    for (var iEvent = 0; iEvent < arrEventNames.length; iEvent++) {
      document.addEventListener(arrEventNames[iEvent], function (objEvent) {
        if (objEvent) {
          window.event = objEvent;
        }
      }, true);
    }
  }
};
