// $Id: utils.js 4322 2006-09-04 08:49:33Z shacka $
// various form functions
Masc.Form.Utils = [];

/**
* \internal function for retrieving pairs of key=value from string
* TODO: extend description
*/
Masc.Form.Utils.getTokens = function(className, separator){
	if(typeof(separator) != 'string' || separator.length == 0){
		// setting default value
		separator = " ";
	}

	var arr = {};

	if(className != null && className.length > 0){
		var isInQuotes = false;
		var quoteChar = null;
		var key = "";
		var value = "";
		var isInValue = false;

		for(var ii = 0; ii < className.length; ii++){
			var currChar = className.charAt(ii);

			if(currChar == "\\"){
				// if current char is \ - store next char in any case
				ii++;

				currChar = className.charAt(ii);
			} else if(!isInValue && currChar == "="){
				// if current char is = - this means that key is finished - all
				// other before next space is value

				isInValue = true;
				var nextChar = className.charAt(ii + 1);

				// supporting old behaviour - value could be putted into quotes
				if(nextChar == "'" || nextChar == '"'){
					quoteChar = nextChar;
					ii++;
				}

				continue;
			} else if(currChar == " "){
				if(key.length == 0){
					continue;
				}
				// if this is space - then current pair of key&value is
				// ready.

				if(quoteChar != null){
					// supporting old behaviour:
					//	if last character is same as quote after '=' - ignore
					//		last symbol.
					//	in other case - add quote after '=' to value
					if(quoteChar == value.charAt(value.length - 1)){
						quoteChar = null;
						value = value.substr(0, value.length - 1);
					} else {
						value = quoteChar + value;
					}
				}

				// store pair
				arr[key] = value.length == 0 ? null : value;

				//clear variables
				isInValue = false;
				key = "";
				value = "";
				quoteChar = null;

				continue;
			}

			if(ii < className.length){
				// if we are here - currChar is non-system char. Store it.
				if(isInValue){
					value += currChar;
				} else {
					key += currChar;
				}
			}
		}

		// processing last argument
		if(key.length > 0){
			if(quoteChar != null){
				// supporting old behaviour:
				//	if last character is same as quote after '=' - ignore
				//		last symbol.
				//	in other case - add quote after '=' to value
				if(quoteChar == value.charAt(value.length - 1)){
					quoteChar = null;
					value = value.substr(0, value.length - 1);
				} else {
					value = quoteChar + value;
				}
			}

			arr[key] = (value.length == 0 ? null : value)
		}
	}

	return arr;
}

/**
* Toggle visibility of given element and disable/enable all form elements
* inside given element.
* @param field - [HTMLElement or string] Reference to element
* @param show - [boolean] if true - show element else - hide.
* @param useVisibility - [boolean] if true - field visibility would be changed
*	using field.style.visibility property. Else - field.style.display
*/
Masc.Form.Utils.toggleFormElements = function(field, show, useVisibility){
	if(typeof(field) == 'string'){
		field = document.getElementById(field);
	}

	if(field == null){
		return null;
	}

	var inputs = Masc.Form.Utils.getFormElements(field);
	for(var ii = 0; ii < inputs.length; ii++){
		inputs[ii].disabled = show == false;
	}

	if(useVisibility){
		field.style.visibility = (show ? 'visible' : 'hidden');
	} else {
		field.style.display = (show ? '' : 'none');
	}
}

/**
* \internal Returns array of form elements inside given element.
* @param el - [HTMLElement or string] reference to element
*/
Masc.Form.Utils.getFormElements = function(el){
	if(typeof(el) == 'string'){
		el = document.getElementById(el);
	}

	if(el == null){
		return null;
	}


	var inputs = [];
	var childs = el.all ? el.all : el.getElementsByTagName("*");

	for(var ii = 0; ii < childs.length; ii++){
		if(Masc.Form.Utils.isInputField(childs[ii])){
			inputs[inputs.length] = childs[ii];
		}
	}

	return inputs;
}

/**
* Returns value of given element
* @param element - [string or HTMLElement] reference to element
*/
Masc.Form.Utils.getValue = function(element) {
	if(typeof(element) == 'string'){
		element = document.getElementById(element)
	}

	if(element == null || typeof(element.tagName) == 'undefined'){
		return null;
	}

	switch (element.tagName.toLowerCase()) {
		case "select":
			var option = element.options[element.selectedIndex];

			if(option != null){
				return option.value;
			} else {
				return "";
			}
		case "input":
			return element.value;
		case "textarea":
			return element.value;
	}

	return null;
}

/**
* Sets given value for given element
* @param element - [string or HTMLElement] reference to element
* @param value - [string] value
*/
Masc.Form.Utils.setValue = function(element, value) {
	if(typeof(element) == 'string'){
		element = document.getElementById(element)
	}

	if(element == null || typeof(element.tagName) == 'undefined'){
		return null;
	}

	switch (element.tagName.toLowerCase()) {
		case "input":
			if(element.type.toLowerCase() != "file"){
				element.value = value;
			}

			break;
		case "textarea":
			element.value = value;

			break;
		case "select":
			for(var i = 0; i < element.options.length; i++){
				if (element.options[i].value == value){
					element.selectedIndex = i;
					break;
				}
			}
	}

	return value;
}

/**
* \internal Returns true, if current field is input-able field.
*/
Masc.Form.Utils.isInputField = function(el){
	if (
		el.nodeType == 1 &&
		(
			el.nodeName.toLowerCase() == 'input' ||
			el.nodeName.toLowerCase() == 'textarea' ||
			el.nodeName.toLowerCase() == 'select'
		)
	){
		return true;
	}

	return false;
}

/**
* \internal Should we ignore this field
*/
Masc.Form.Utils.ignoreField = function(field) {
	if(
		!Masc.Form.Utils.isInputField(field) ||
		field.nodeType == 1 &&
		field.nodeName.toLowerCase() == 'fieldset'
	){
		return true;
	}

	var type = field.type.toLowerCase();
	var ignoreList = ['submit', 'reset', 'button'];

	for (var ii = 0; ii < ignoreList.length; ii++) {
		if (type.toLowerCase() == ignoreList[ii]) {
			return true; //ignore
		}
	}

	return false; //not in the list; don't ignore
}

/**
* \internal zpFormMask related function - returns true if key that was pressed
* is not alphanumeric key.
* @param charCode - [int] data, retrieved from this.getInputData()[0]
* @param newChar - [char] data, retrieved from this.getInputData()[1]
*/
Masc.Form.Utils.isSpecialKey = function(charCode, newChar){
	return (
		(
			newChar == null &&
			charCode != 8 &&
			charCode != 46
		) ||
		charCode == 9	|| // tab
		charCode == 13	|| // enter
		charCode == 16	|| // shift
		charCode == 17	|| // ctrl
		charCode == 18	|| // alt
		charCode == 20	|| // caps lock
		charCode == 27	|| // escape
		charCode == 33	|| // page up
		charCode == 34	|| // page down
		charCode == 35	|| // home
		charCode == 36	|| // end
		charCode == 37	|| // left arrow
		charCode == 38	|| // up arrow
		charCode == 39	|| // right arrow
		charCode == 40	|| // down arrow
		charCode == 45	|| // insert
		charCode == 144	|| // num lock
		charCode > 256 // Safari strange bug
	)
}

/**
* \internal zpFormMask related function - returns array with two codes:
* [0] - [int] code of key that was pressed(could be null for mozilla(when
*	alphanumeric key was pressed) and opera(when unknown key (charCode == 0)
*	was pressed))
* [1] - [char] letter, that was pressed(could be null for mozilla(when
*	nonalphanumeric key was pressed) and opera(when unknown key (charCode == 0)
*	was pressed))
*/
Masc.Form.Utils.getInputData = function(evt, isOnKeyDown){
	if(!evt) {
		evt = window.event;
	}

	var charCode = null;
	var newChar = null;

	if(Masc.is_gecko && !Masc.is_khtml && !isOnKeyDown){
		if(evt.charCode){
			newChar = String.fromCharCode(evt.charCode);
		} else {
			charCode = evt.keyCode;
		}
	} else {
		charCode = evt.keyCode || evt.which;
		newChar = String.fromCharCode(charCode);
	}

	if(Masc.is_opera && charCode == 0){
		charCode = null;
		newChar = null;
	}

	if(Masc.is_khtml && charCode == 63272){
		charCode = 46;
		newChar = null;
	}

	return [charCode, newChar]
}
