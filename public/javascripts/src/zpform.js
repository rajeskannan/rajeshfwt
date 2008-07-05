// $Id: zpform.js 4385 2006-09-11 10:39:25Z andrew $
/**
* The Masc.Form object constructor. Call it, for example, like this:
*
* \code
*	new Masc.Form({
*		form: 'userForm',
*		showErrors: 'afterField',
*		showErrorsOnSubmit: true,
*		submitErrorFunc: testErrOutput,
*		theme: "WinXP2"
*	});
* \endcode
*
* The above creates a new Form object. During initialization constructor
* would change page layout to display special marks near each field. Also
* standard form submit and reset would be replaced with custom handlers.
* You always could retrieve reference to this object:
* \code
*	document.getElementById('yourForm').zpForm
* \endcode
*
*	@param formRef [string or object] - reference to <FORM> element (deprecated.
*	use 'form' config option instead)
*	@param config [object] - all parameters are passed as the properties of this object.
*
* Constructor recognizes the following properties of the config object
* \code
*	property name		| description
*-------------------------------------------------------------------------------------------------
*	form				| [string or object]. Reference to <FORM> object
*	statusImgPos		| [string] Where to put status icon. Possible values:
*						|	'afterField' - icon would be putted after target field
*						|	'beforeField' - before target field(default value)
*						|	null - icon would not be displayed
*	showErrors			| [string] Where to put error text. Possible values:
*						|	'tooltip' - display error text as tooltip for field
*						|	'afterField' - text would be putted after target field
*						|	'beforeField' - before target field
*						|	null - error text would not be displayed(default value) //TODO
*	showErrorsOnSubmit	| If setted to true - function, given by submitErrorFunc parameter would be
*						|	invoked on form submit. Default value - true.
*	submitErrorFunc 	| [function] Callback function reference to call on
*						| error. Callback function receives following object:
*						| {
*						| 	serverSide: true if this is server response or false if validation
*						| 	result [boolean],
*						| 	generalError: "Human readable error description" [string],
*						| 	fieldErrors: [
*						| 		{
*						| 			field: field element object [object],
*						| 			errorMessage: "Human readable error description" [string]
*						| 		},
*						| 		...
*						| 	]
*						| }
*						| fieldErrors property may be undefined.
*						| By default Masc.Form.prototype.submitErrorFunc is
*						| used. It displays errors as alert message.
*	submitValidFunc		| [function] Callback function reference to call after
*						| validation is passed. Useful to remove old error
*						| messages produced by submitErrorFunc during previous
*						| validation attempt.
*						| Default value - Masc.Form.prototype.submitValidFunc
*	asyncSubmitFunc		| [function] Callback function reference to call after
*						| the form is sent to the server using
*						| Masc.Transport.fetchJsonObj and "success" response
*						| is received from the server.
*						| Server response should be a valid JSON string in the following format:
*						| {
*						| 	"success": true | false,
*						| 	"callbackArgs": object that will be passed to callback function,
*						| 	"generalError": "Human readable error description",
*						| 	"fieldErrors": {
*						| 		"fieldName1": "Human readable error description",
*						| 		"fieldName2": "Human readable error description",
*						| 		...
*						| 	}
*						| }
*						| Callback function receives callbackArgs object.
*						| callbackArgs, generalError and fieldErrors properties are optional.
*						| submitErrorFunc callback function is called on error.
*	themePath			| [string] Relative or absolute URL to the form themes directory.
*						| Trailing slash is required.
*						| You may also include path into "theme" option below instead of using
*						| themePath option. Default value: "../themes/"
*	theme				| [string] Theme name that will be used to display the form.
*						| Corresponding CSS file will be picked and added into the HTML document
*						| head element automatically.
*						| Case insensitive.
*						| May also contain relative or absolute URL to the form themes directory.
*						| E.g. ../themes/default.css or http://my.web.host/themes/default.css
*	strict				| [boolean] If true - submit buttons will be disabled until all fields
*						| will pass validation succesfully
*	ajaxDebugFunc		| [function] If given - this function will be used to
*						| display debug information about AJAX requests.
*						| Function signature consists of one argument - string
*						| message.
*	dropDownTheme		| [string] use this theme for drop-down list in fields.
*	hideUntilThemeLoaded| [boolean] Hide form until theme is fully loaded. Default: true.
* \endcode
*/

Masc.Form = function() {
	var objArgs = {};
	switch(arguments.length){
		case 1:
			objArgs = arguments[0];
			break;
		case 2:
			objArgs = arguments[1];
			objArgs.form = arguments[0];
			break;
	}

	// Call constructor of superclass
	Masc.Form.SUPERconstructor.call(this, objArgs);

}

// Inherit SuperClass
Masc.inherit(Masc.Form, Masc.Widget);

Masc.Form.prototype.init = function(objArgs){
	// Set defaults config options
	this.config.form				= null;
	this.config.statusImgPos		= 'beforeField';
	this.config.showErrors			= null;
	this.config.showErrorsOnSubmit	= true;
	this.config.submitErrorFunc		= this.submitErrorFunc;
	this.config.submitValidFunc		= null;
	this.config.asyncSubmitFunc		= null;
	this.config.strict				= false;
	this.config.asyncTheme			= true;
	this.config.ajaxDebugFunc		= null;
	this.config.dropDownTheme		= "default";
	this.config.hideUntilThemeLoaded= true;

	// processing Widget functionality
	Masc.Form.SUPERclass.init.call(this, objArgs);

	if (typeof(this.config.form) == 'string') {
		this.container = document.getElementById(this.config.form);
	} else if (typeof(this.config.form) == 'object') {
		this.container = this.config.form;
	}


	if(this.container == null || this.container.nodeName.toLowerCase() != "form"){
		// no form found for given ID or it is not <FORM> element
		Masc.Log({description: "Couldn't find form"});
		return null;
	}

	// setting backlink to Masc.Form object
	Masc.Utils.createProperty(this.container, "zpForm", this);
	Masc.Utils.addDestroyOnUnload(this, "container");

	//cleanup
	Masc.Utils.addDestroyOnUnload(this.container, "zpForm");

	this.container.className = this.getClassName({prefix: "zpForm"});

	if(this.config.hideUntilThemeLoaded){
		this.showLoader("loading form");
	}

	// internal array that stores functions to call on form events
	this.changeHandlers = [];

	var self = this;

	var oldOnSubmit = this.container.onsubmit || function(){return true};
	if (typeof(this.config.asyncSubmitFunc) == 'function'){
		this.container.onsubmit = function(ev){return self.asyncSubmit(ev) && oldOnSubmit() };
	} else {
		this.container.onsubmit = function(ev){return self.submit(ev) && oldOnSubmit()};
	}
	Masc.Utils.addDestroyOnUnload(this.container, "onsubmit");

	this.container.onreset = function(){setTimeout(function(){self.reset()}, 1)};
	Masc.Utils.addDestroyOnUnload(this.container, "onreset");

	var focusedFlag = false;
	var els = [];

	for(var ii = 0; ii < this.container.elements.length; ii++){
		els.push(this.container.elements[ii]);
	}

	for (var ii = 0; ii < els.length; ii++) {
		var el = els[ii];

		new Masc.Form.Field(this, el);

		if(el.zpFormField != null){
			// focus on first visible field in form
			if(
				focusedFlag == false &&
				typeof(el.focus) != 'undefined' &&
				(
					typeof(el.type) == 'undefined' ||
					typeof(el.type) != 'undefined' &&
					el.type.toLowerCase() != 'hidden'
				) &&
				!el.disabled &&
				!el.readOnly
			){
				try{
					el.focus();
					focusedFlag = true;
				} catch(e){}
			}
		}
	}

	// process all elements inside form
	var childElements = document.all ? document.all : this.container.getElementsByTagName("*");

	for(var ii = childElements.length - 1; ii >= 0 ; ii--){
		this.initMultipleField(childElements[ii], true);
		this.initConditionalField(childElements[ii]);
	}

	if(Masc.windowLoaded){
		this.runChangeHandlers();
	} else {
		Masc.Utils.addEvent(window, "load", function(){
			self.runChangeHandlers()}
		);
	}
}

/**
* \internal Handler for async form submit.
*/
Masc.Form.prototype.asyncSubmit = function(ev){
	var self = this;
	// check if form is already submitted and result not received
	if(this.processing == true){
		return false;
	}

	// Validate if needed
	if (
		this.config.showErrorsOnSubmit &&
		typeof(this.config.submitErrorFunc) == 'function' &&
		!this.submit()
	){
		return false;
	}

	// Get urlencoded content
	var arrContent = [];
	var objFormElements = this.container.elements;

	for (var iElm = 0; iElm < objFormElements.length; iElm++) {
		var formEl = objFormElements[iElm];
		if (
			formEl.name &&
			!formEl.disabled
		){
			if(
				formEl.nodeName.toLowerCase() == 'input' &&
				(
					formEl.type.toLowerCase() == 'radio' ||
					formEl.type.toLowerCase() == 'checkbox'
				) &&
				!formEl.checked
			){
				continue;
			}

			arrContent.push(objFormElements[iElm].name + '=' +
				escape(objFormElements[iElm].value));
		}
	}

	var strUrl = this.container.action;

	if (!strUrl) {
		return false;
	}

	var strMethod = this.container.method.toUpperCase();
	var strContent = arrContent.join('&');

	if (strMethod === '' || strMethod == 'GET' || strMethod == 'HEAD'){
		strUrl += '?' + strContent;
		strContent = null;
	}

	this.container.zpFormProcessing = true;

	// disabling all <input type="submit"> element in the form
	self.toggleSubmits(true);

	if(this.config.ajaxDebugFunc){
		this.config.ajaxDebugFunc("-----------------------");
		this.config.ajaxDebugFunc("Sending request for AJAX submit form.");
		this.config.ajaxDebugFunc(strMethod + " " + strUrl);
		this.config.ajaxDebugFunc("Query: " + strContent);
	}

	// Submit form
	Masc.Transport.fetch({
		url: strUrl,
		method: strMethod,
		contentType: this.container.enctype,
		content: strContent,
		onLoad: function(objText){
			if(self.config.ajaxDebugFunc){
				self.config.ajaxDebugFunc("Response received: " + objText.responseText);
			}

			self.processing = false;

			// enabling all <input type="submit"> element in the form
			self.toggleSubmits(false);

			var objResponse = Masc.Transport.parseJson({strJson: objText.responseText});

			if(objResponse == null){
				Masc.Log({description: "Can't parse received JSON: " + objText.responseText});
				return null;
			}

			if (objResponse){
				if (objResponse.success) {
					// Success
					self.config.asyncSubmitFunc(objResponse.callbackArgs);
				} else if (self.config.showErrorsOnSubmit) {
					// Error
					// Array with error messages
					var arrFieldErrors = [];

					// Flag to indicate that focus is already set
					var boolFocusSet = false;

					// Go through errors received from the server
					if (objResponse.fieldErrors){
						for (var strFieldName in objResponse.fieldErrors) {
							// Find corresponding form field
							for (var iElm = 0; iElm < objFormElements.length; iElm++) {
								var objField = objFormElements[iElm];

								if (objField.name && objField.name == strFieldName) {
									// Add error message to the array
									arrFieldErrors.push({
										field: objField,
										errorMessage: objResponse.fieldErrors[strFieldName],
										validator: ''
									});

									// Set focus to the first field that has an error
									if (!boolFocusSet) {
										// Temporarily remove onfocus handler
										var funcOnFocus = objField.onfocus;
										objField.onfocus = null;

										// Set focus
										objField.focus();
										objField.select();

										// Restore onfocus handler
										var objFocusField = objField;

										setTimeout(function() {
											objFocusField.onfocus = funcOnFocus;
										}, 0);

										// Set flag
										boolFocusSet = true;
									}

									// Set icon and status
									if(objField.zpFormField != null){
										objField.zpFormField.setImageStatus('INVALID');
									}

									// Field is found
									break;
								}
							}
						}
					}

					if (typeof(self.config.submitErrorFunc) == 'function') {
						self.config.submitErrorFunc({
							serverSide: true,
							generalError: objResponse.generalError || '',
							fieldErrors: arrFieldErrors
						});
					}
				}
			} else if(
				self.config.showErrorsOnSubmit &&
				typeof(self.config.submitErrorFunc) == 'function'
			){
				// No response
				self.config.submitErrorFunc({
					serverSide: true,
					generalError: 'No response'
				});
			}
		},
		onError: function(objError) {
			self.processing = false;

			var strError = '';

			if (objError.errorCode) {
				strError += objError.errorCode + ' ';
			}

			strError += objError.errorDescription;

			if(self.config.ajaxDebugFunc){
				self.config.ajaxDebugFunc("Error response received: " + strError);
			}

			// enabling all <input type="submit"> element in the form
			self.toggleSubmits(false);

			if(
				self.config.showErrorsOnSubmit &&
				typeof(self.config.submitErrorFunc) == 'function'
			){
				self.config.submitErrorFunc({
					serverSide: true,
					generalError: strError
				});
			}
		}
	});

	return false;
}

/**
* \internal Turn on/off submit buttons into form.
*/
Masc.Form.prototype.toggleSubmits = function(disable){
	// enabling all <input type="submit"> element in the form
	var inputs = this.container.getElementsByTagName("input");

	for(var ii = 0; ii < inputs.length; ii++){
		if(inputs[ii].type == "submit"){
			inputs[ii].disabled = disable == true;
		}
	}
}

/**
* \internal Reset handler for form. It is called _after_ resetting form.
*/
Masc.Form.prototype.reset = function(){
	for(var ii = 0; ii < this.container.elements.length; ii++){
		var field = this.container.elements[ii].zpFormField;

		if(field != null){
			var fieldValue = field.getValue();

			if(fieldValue != null && fieldValue.length != 0){
				field.setValue(fieldValue);
				field.firstRun = false;
			} else {
				field.setValue("");
				field.firstRun = true;
			}

			field.blur();
		}
	}

	this.runChangeHandlers();
}

/**
* \internal This function is called on form submit. If config.showErrorsOnSubmit
* is true and config.submitErrorFunc is defined - then they would be called
* after validation.
* If there was no errors and config.submitValidFunc was defined - it would be called.
*/
Masc.Form.prototype.submit = function(){
	var errors = this.validate(false);

	if(
		errors != null &&
		errors.length > 0 &&
		this.config.showErrorsOnSubmit &&
		typeof(this.config.submitErrorFunc) == 'function'
	){
		this.config.submitErrorFunc({
			serverSide: false,
			generalError: errors.length == 1 ? 'There is 1 error.' : 'There are ' + errors.length + ' errors.',
			fieldErrors: errors
		});

		try{
			errors[0].field.focus();
		} catch(e){}

		return false;
	}

	// call submitValidFunc callback
	if (typeof(this.config.submitValidFunc) == 'function') {
		this.config.submitValidFunc();
	}

	return true;
}

/**
* Validate all elements in form.
* Returns null if validation passed succesfully or return array of errors in 
* other case.
* @param onlyValidate [boolean] - if setted to true - then no visual marks
* will be added to fields. Default value - true. 
*/
Masc.Form.prototype.validate = function(onlyValidate){
	if(onlyValidate == null){
		onlyValidate = true;
	}

	var valid = true;
	var tabIndex = 1;
	var errors = [];

	for (var ii = 0; ii < this.container.elements.length; ii++){
		var el = this.container.elements[ii];

		if(el.zpFormField == null){
			continue;
		}

		var validate = el.zpFormField.validate(onlyValidate);
		var fieldValid = (validate == null || validate.length == 0);

		if(fieldValid){
			el.removeAttribute("tabIndex");
			el.tabIndex = null;
		} else {
			el.tabIndex = tabIndex;
			el.setAttribute("tabIndex", tabIndex++);
			for(var jj = 0; jj < validate.length; jj++){
				errors.push(validate[jj])
			}
		}

		valid = valid && fieldValid;
	}

	if(errors.length == 0){
		errors = null;
	}

	return errors;
}

/**
* \internal Default function for displaying validation errors.
* @param objErrors - [array]
*	{
*		serverSide: true if this is server response or false if validation
*		result [boolean],
*		generalError: "Human readable error description" [string],
*		fieldErrors: [
*			{
*				field: field element object [object],
*				errorMessage: "Human readable error description" [string]
*			},
*			...
*		]
*	}
*	fieldErrors property may be undefined.
*/
Masc.Form.prototype.submitErrorFunc = function(objErrors){
	var message = objErrors.generalError + '\n';

	if (objErrors.fieldErrors && objErrors.fieldErrors.length) {
		for (var ii = 0; ii < objErrors.fieldErrors.length; ii++) {
			message += (ii + 1) + ': Field ' + objErrors.fieldErrors[ii].field.name +
				' ' + objErrors.fieldErrors[ii].errorMessage + "\n";
		}

		message = message.substr(0 ,message.length - 1);
		objErrors.fieldErrors[0].field.focus();
	}

	alert(message);
}

/**
* \internal field, for initializing multiple elements in form.
* @param elementRef - [HTMLElement] link to element, that is processed.
* @param firstRun - [boolean] Should be setted to true, if this function is
* called at first time.(in other case you would get problems with table layout)
*/
Masc.Form.prototype.initMultipleField = function(currEl, firstRun, isCloned){
	var md = null;
	if(
		!currEl.className ||
		!(md = currEl.className.match(/zpFormMultiple(Inside|Outside)?/)) ||
	    currEl.zpRelatedElements != null
	){
		return null;
	}
	var outside = true;
	if(
		md[1] == "Inside" ||
		currEl.nodeName.toLowerCase() == "td" ||
		currEl.nodeName.toLowerCase() == "th" ||
		currEl.nodeName.toLowerCase() == "tr"
	){
		// for table elements button could be added only inside element
		outside = false;
	}

	if(
		currEl.nodeName.toLowerCase() == "input" ||
		currEl.nodeName.toLowerCase() == "textarea" ||
		currEl.nodeName.toLowerCase() == "select" ||
		currEl.nodeName.toLowerCase() == "image"
	){
		// for this elements button could be added only outside element
		outside = true;
	}

	var appendEl = currEl;

	// if marker sticked to TR - we should create TD element at the end to add
	// button to it. To save table structure - we also should add empty cells to
	// all other rows.
	// but we should do this only on form init
	if(currEl.nodeName.toLowerCase() == "tr"){
		function findParentTable(el){
			if (
				el.parentNode != null &&
				el.parentNode.nodeType == 1 &&
				el.parentNode.tagName.toLowerCase() != "table"
			){
				return findParentTable(el.parentNode);
			}

			return el.parentNode;
		}

		var table = findParentTable(currEl);

		for(var jj = table.rows.length - 1; jj >=0 ; jj--){
			var td = document.createElement('td');
			td.className = Masc.Form.ignoreMark;
			td.innerHTML = "&nbsp;";

			if(jj == currEl.rowIndex){
				appendEl = td;
			}

			if(firstRun || jj == currEl.rowIndex){
				table.rows[jj].appendChild(td);
			}
		}
	}

	var button = Masc.Utils.createElement('input');
	button.type = "button"
	button.className = Masc.Form.ignoreMark + " multipleButton"
	Masc.Utils.createProperty(button, "zpMultipleElement", currEl)

	if(currEl.zpOriginalNode == null){
		Masc.Utils.createProperty(currEl, "zpMultipleChilds", []);
		Masc.Utils.createProperty(currEl, "zpMultipleCounter", 0);

		button.value = "+";

		var _this = this;
		button.onclick = function(){
			_this.cloneElement(this.zpMultipleElement);
		}
	} else {
		button.value = "-";
		var parent = currEl.zpOriginalNode
		parent.zpMultipleChilds[parent.zpMultipleChilds.length] = currEl;

		var _this = this;
		button.onclick = function(){
			_this.removeClonedElement(this.zpMultipleElement);
		}
	}

	if(outside){
		Masc.Utils.insertAfter(appendEl, button);
	} else {
		appendEl.appendChild(button);
	}

	// in this array stored elements, that should be deleted when element would be deleted.
	Masc.Utils.createProperty(currEl, "zpRelatedElements", [button, currEl]);

	// store reference to button
	Masc.Utils.createProperty(currEl, "zpMultipleButton", button);

	var tokens = Masc.Form.Utils.getTokens(currEl.className);

	if(typeof(tokens['zpFormMultipleLimit']) != 'undefined' && !isNaN(parseInt(tokens['zpFormMultipleLimit']))){
		Masc.Utils.createProperty(currEl, "zpFormMultipleLimit", parseInt(tokens['zpFormMultipleLimit']) - 2);
	} else {
		Masc.Utils.createProperty(currEl, "zpFormMultipleLimit", -1);
	}

	// check if this is input field
	if(currEl.zpFormField != null){
		currEl.zpRelatedElements = [
			currEl.zpFormField.statusImg1,
			currEl.zpFormField.statusImg2,
			currEl.zpFormField.statusImg3,
			currEl.zpFormField.statusImg4,
			currEl.zpFormField.statusImg,
			currEl.zpFormField.errorText
		].concat(currEl.zpRelatedElements);
	} else {
		Masc.Utils.createProperty(currEl, "zpLastNode", (outside ? button : currEl));
	}
}

/**
* \interval Handles click on "+" button near zpFormMultiple element
*/
Masc.Form.prototype.cloneElement = function(field){
	var insertAfterNode = field.zpLastNode;

	if(field.zpMultipleChilds != null && field.zpMultipleChilds.length > 0){
		insertAfterNode = field.zpMultipleChilds[field.zpMultipleChilds.length - 1].zpLastNode;
	}

	field.zpMultipleCounter++;

	var clone = field.cloneNode(true);

	Masc.Utils.createProperty(clone, "zpOriginalNode", field);

	Masc.Utils.insertAfter(insertAfterNode, clone);

	// init all nodes in created subtree if needed(included newly created node)
	var childElements = [clone];
	var tmpArr = clone.all ? clone.all : clone.getElementsByTagName("*");

	for(var ii = 0; ii < tmpArr.length; ii++){
		childElements[childElements.length] = tmpArr[ii];
	}

	// check all child elements for this element.
	for(var ii = 0; ii < childElements.length; ii++){
		var currEl = childElements[ii];
		// if field has "ignore" mark - delete it.
		if(currEl.className.indexOf(Masc.Form.ignoreMark) >= 0){
			// removing zpForm elements that were cloned
			Masc.Utils.destroy(currEl);
			continue;
		}

		// if element has 'id' attribute - make it unique.
		if(typeof(currEl.id) != 'undefined' && currEl.id != null && currEl.id != ""){
			currEl.id += "-" + field.zpMultipleCounter;
		}

		// If element is input field - clear its value, change name and create
		// corresponding Masc.Form.Field object.
		if(Masc.Form.Utils.isInputField(currEl)){
			Masc.Form.Utils.setValue(currEl, "");

			if(typeof(currEl.name) != 'undefined' && currEl.name != null && currEl.name != ""){
				currEl.name += "-" + field.zpMultipleCounter;
			}

			new Masc.Form.Field(this, currEl);
		}

		currEl.zpMultipleElement = null;
		currEl.zpMultipleChilds = null;
		currEl.zpMultipleCounter = null;
		currEl.zpRelatedElements = null;
		currEl.zpMultipleButton = null;
		currEl.zpFormMultipleLimit = null;

		this.initMultipleField(currEl, false);
	}

	if(field.zpFormMultipleLimit >= 0 && field.zpMultipleChilds != null && field.zpMultipleChilds.length > field.zpFormMultipleLimit){
		field.zpMultipleButton.style.visibility = 'hidden';
		return false;
	}

	return clone;
}

/**
* \interval Handles click on "-" button near zpFormMultiple element
*/
Masc.Form.prototype.removeClonedElement = function(field){
	// Do nothing if this is not cloned field.
	if(field == null || field.zpOriginalNode == null){
		return false;
	}

	var pos = null;
	// remove current element from array of cloned elements in parent node.
	var childs = field.zpOriginalNode.zpMultipleChilds;
	for(var ii = 0; ii < childs.length; ii++){
		if(childs[ii] == field){
			pos = ii;
			break;
		}
	}

	if(pos != null){
		field.zpOriginalNode.zpMultipleChilds = childs.slice(0, pos).concat(childs.slice(pos + 1));

		if(
			field.zpOriginalNode.zpFormMultipleLimit >= 0 &&
			field.zpOriginalNode.zpMultipleChilds.length <= field.zpOriginalNode.zpFormMultipleLimit
		){
			field.zpOriginalNode.zpMultipleButton.style.visibility = 'visible';
		}
	}

	// destroy all related elements for this element.
	if(field.zpRelatedElements != null && field.zpRelatedElements.length > 0){
		for(var ii = 0; ii < field.zpRelatedElements.length; ii++){
			if(
				typeof(field.zpRelatedElements[ii]) != 'undefined' &&
				field.zpRelatedElements[ii] != null
			){
				Masc.Utils.destroy(field.zpRelatedElements[ii]);
			}
		}
	}
}

/**
* \internal This method is used to process conditional elements into form. It
* addChangeHandler method to add handlers for toggling fields.
* @param field - [HTMLElement] reference to element.
*/
Masc.Form.prototype.initConditionalField = function(field){
	var md = null;
	if(
		field.className &&
		(md = field.className.match(/zpForm(Display|Visible)When=([^\s]+)/))
	){
		var func = eval(md[2]);
		var handler = null;

		var self = this;
		if(md[1] == 'Display'){
			handler = function(){
				Masc.Form.Utils.toggleFormElements(field, func(), false);

				if(self.config.strict){
					self.toggleSubmits(self.validate() != null)
				}
			};
		} else if(md[1] == 'Visible'){
			handler = function(){
				Masc.Form.Utils.toggleFormElements(field, func(), true);

				if(self.config.strict){
					self.toggleSubmits(self.validate() != null)
				}
			};
		}

		if(handler != null){
			handler();
			this.addChangeHandler(handler);
		}
	}
}

/**
* Allows to add function, that would be called when any form element changes its value.
* @param func - [function] reference to function
*/
Masc.Form.prototype.addChangeHandler = function(func){
	if(typeof(func) == 'string'){
		func = eval(func);
	}

	if(typeof(func) == 'function'){
		this.changeHandlers.push(func);
		this.runChangeHandlers();

		if(this.config.strict){
			this.toggleSubmits(this.validate() != null);
		}

		return true;
	}

	return false;
}

/**
* \internal Runs all changeHandlers for this form
*/
Masc.Form.prototype.runChangeHandlers = function(){
	for(var ii = 0; ii < this.changeHandlers.length; ii++){
//		try{
			this.changeHandlers[ii]();
//		} catch(e){}
	}
}

/**
* Setup function that auto-activates all forms, which has classNames, that
* starts from "zpForm".
* Accepts same params as Masc.Form constructor(except 'form' parameter).
* If no 'theme' parameter was given - it would retrieve it from form className
*/
Masc.Form.setupAll = function(params) {
	var forms = document.getElementsByTagName('form');

	if(forms && forms.length){
		for(var ff = forms.length; ff--; ){
			var arrMatch = forms[ff].className.match(/zpForm(\S*)/);

			if(arrMatch){
				// Get theme name
				var strThemeName = arrMatch[1];

				// Duplicate configuration object
				var objConfig = {};
				for(var strKey in params){
					objConfig[strKey] = params[strKey];
				}

				// Modify configuration
				if (
					(objConfig.theme == null || objConfig.theme == "") &&
					strThemeName
				){
					objConfig.theme = strThemeName;
				}

				objConfig.form = forms[ff];

				new Masc.Form(objConfig);
			}
		}
	}
};

// class to mark element as interal element of Masc.Form(needed for cloning elements)
Masc.Form.ignoreMark = "zpFormInternalEl";
