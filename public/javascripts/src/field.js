// $Id: field.js 4363 2006-09-08 10:04:34Z andrew $
/**
* The Masc.Form object constructor.
* It would put special marks near field(basing on form config).
*
* You always could retrieve reference to this object:
* \code
*	document.getElementById('yourField').zpFormField
* \endcode
* @param form - [object] reference to Masc.Form instance.
* @param field - [HTMLElement] reference to HTML input element.
*/
Masc.Form.Field = function(form, field){
	if (Masc.Form.Utils.ignoreField(field)) {
		return;
	}

	// storing params in internal variables.
	this.form = form;

	// variable for storing internal variables
	this.state = {};

	//setup array of validators
	this.validators = Masc.Form.Utils.getTokens(field.className, " ");
	var md = null;

	if(md = field.className.match(/zpFormAllowed-(\S+)/)){
		if(this.validators['zpFormAllowedChars']){
			this.validators['zpFormAllowedChars'] += '\\' + (md[1]).split('').join('\\');
		} else {
			this.validators['zpFormAllowedChars'] = '\\' + (md[1]).split('').join('\\');
		}
	}

	if(
		typeof(this.validators['zpFormAllowedChars']) != 'undefined' &&
		this.getFeature('zpFormAllowedChars') == null
	){
		this.validators['zpFormAllowedChars'] = "";
	}

	// stores values for autocompletion
	this.autoCompleteOptions = [];

	if(
		(
			this.hasFeature("zpFormAutoComplete") ||
			this.hasFeature("zpFormAutoCompleteStrict")
		) &&
		field.nodeName.toUpperCase() == "SELECT"
	){
		var input = document.createElement('input');

		for(var ii = 0; ii < field.attributes.length; ii++){
			var attr = field.attributes[ii];

			if(attr.name == 'class'){
				input.className = field.getAttribute(attr.name);
			} else {
				input.setAttribute(attr.name, field.getAttribute(attr.name));
			}
		}

		for(var ii = 0; ii < field.options.length; ii++){
			this.autoCompleteOptions[this.autoCompleteOptions.length] = field.options[ii].innerHTML;
		}

		if(field.selectedIndex != null){
			if(
				field.options[field.selectedIndex].value != null &&
				field.options[field.selectedIndex].value != ""
			){
				val = field.options[field.selectedIndex].value;
			} else {
				val = field.options[field.selectedIndex].innerHTML;
			}

			input.value = val
			input.setAttribute("value", val);
		}

		Masc.Utils.insertAfter(field, input);
		Masc.Utils.destroy(field);

		input.type = 'text';

		field = input;
	}

	this.field = field;

	if(
		this.hasFeature("zpFormAutoComplete") ||
		this.hasFeature("zpFormAutoCompleteStrict") ||
		this.hasFeature("zpFormSuggest")
	){
		// disable browser tips
		this.field.setAttribute("autocomplete", "off");
		this.field.autoComplete = "off";
	}

	// creating back reference
	Masc.Utils.createProperty(this.field, "zpFormField", this);

	// add custom CSS classes to checkboxes and radiobuttons
	if(this.field.nodeName.toLowerCase() == "input"){
		if(this.field.type.toLowerCase() == "checkbox"){
			this.field.className += " zpFormCheckbox";
		}

		if(this.field.type.toLowerCase() == "radio"){
			this.field.className += " zpFormRadio";
		}
	}

	var self = this;
	// setting up special handlers for all events.
	var oldOnKeyDown = this.field.onkeydown || function(){return true;};
	Masc.Utils.createProperty(this.field, "onkeydown", function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		var res = oldOnKeyDown();
		return zpField.keydown(ev) && res
	});

	var oldOnKeyPress = this.field.onkeypress || function(){return true;};
	Masc.Utils.createProperty(this.field, "onkeypress", function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		var res = oldOnKeyPress();
		return zpField.keypress(ev) && res;
	});

	Masc.Utils.addEvent(this.field, 'keyup', function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		return zpField.keyup(ev);
	});

	Masc.Utils.addEvent(this.field, 'focus', function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		return zpField.focus(ev);
	});

	Masc.Utils.addEvent(this.field, 'blur', function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		return zpField.blur(ev);
	});
       
	if(self.field.nodeName.toLowerCase() == 'select'){
		Masc.Utils.addEvent(this.field, 'change', function(ev){
			var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
			return zpField.blur(ev);
		});
	}

	// validate field when field value changes
	var changeEvent = null;
	if(Masc.is_ie){
		changeEvent = 'paste';
	} else if(Masc.is_gecko) {
		changeEvent = 'input';
	} else {
		changeEvent = 'change';
	}

	Masc.Utils.addEvent(this.field, changeEvent, function(ev){
		var zpField = Masc.Utils.getTargetElement(ev).zpFormField;
		zpField.setValueFromField(true, true);
		return true;
	});

	if(self.field.type == 'radio' || self.field.type == 'checkbox'){
		var onChangeFunc = function(ev){
			var elements = self.form.container.elements;
			var zpField = Masc.Utils.getTargetElement(ev).zpFormField;

			for(var ii = 0; ii < elements.length; ii++){
				if(
					elements[ii].name == zpField.field.name &&
					elements[ii].zpFormField != null
				){
					elements[ii].zpFormField.validate()
				}
			}

			return zpField.blur(ev);
		}

		Masc.Utils.addEvent(this.field, 'change', onChangeFunc);

		// IE doesn't fire onchange on first change
		Masc.Utils.addEvent(this.field, 'click', onChangeFunc);
	}

	var events = ['focus', 'keydown', 'keypress', 'keyup', 'blur', 'change', 'click', 'dblclick'];

	for(var jj in events){
		Masc.Utils.addEvent(this.field, events[jj], function(){self.form.runChangeHandlers()});
	}

	// Next some <span> elements, as IE doens't support multi-class selectors.
	this.statusImg1 = Masc.Utils.createElement('span');
	this.statusImg1.className = Masc.Form.ignoreMark + " zpStatusImg"

	this.statusImg2 = this.statusImg1.appendChild(Masc.Utils.createElement('span'));
	this.statusImg2.className = Masc.Form.ignoreMark

	this.statusImg3 = this.statusImg2.appendChild(Masc.Utils.createElement('span'));
	this.statusImg3.className = Masc.Form.ignoreMark

	this.statusImg4 = this.statusImg3.appendChild(Masc.Utils.createElement('span'));
	this.statusImg4.className = Masc.Form.ignoreMark

	this.statusImg5 = this.statusImg4.appendChild(Masc.Utils.createElement('span'));
	this.statusImg5.className = Masc.Form.ignoreMark

	// The innermost is the one we actually style.
	this.statusImg = this.statusImg5.appendChild(Masc.Utils.createElement('span'));
	this.statusImg.className = Masc.Form.ignoreMark

	Masc.Utils.addDestroyOnUnload(this, "statusImg");
	Masc.Utils.addDestroyOnUnload(this, "statusImg5");
	Masc.Utils.addDestroyOnUnload(this, "statusImg4");
	Masc.Utils.addDestroyOnUnload(this, "statusImg3");
	Masc.Utils.addDestroyOnUnload(this, "statusImg2");
	Masc.Utils.addDestroyOnUnload(this, "statusImg1");

	var lastNode = this.field;

	// this variable indicates how many key was pressed during last
	// Masc.Form.Field.DELAYED_INTERVAL period.
	this.keyPressCounter = 0;

	// Attach the outermost <span> near the input field.
	if (this.form.config.statusImgPos == 'afterField') {
		Masc.Utils.insertAfter(this.field, this.statusImg1);
		lastNode = this.statusImg1;
	} else {
		this.field.parentNode.insertBefore(this.statusImg1, this.field);
	}

	// An error container.
	this.errorText = Masc.Utils.createElement('span');
	this.errorText.className = Masc.Form.ignoreMark + ' zpFormError';

	// during initial run - if field value is empty - do not validate it.
	var fieldValue = Masc.Form.Utils.getValue(this.field);

	if(fieldValue == null || fieldValue.length == 0){
		this.firstRun = true; //Only used first round
	}

	// Position it by the field if configured that way.
	if (this.form.config.showErrors == 'afterField') {
		Masc.Utils.insertAfter(this.field, this.errorText);
		lastNode = this.errorText;
	} else if (this.form.config.showErrors == 'beforeField') {
		this.field.parentNode.insertBefore(this.errorText, this.field);
	}

	// initializing internal arrays for zpFormMask validation type
	if(this.hasFeature("zpFormMask")){
		var mask = this.getFeature("zpFormMask");

		var maskChars = mask.split('');
		this.chars = [];
		this.enteredValue = []

		for(var ii = 0; ii < maskChars.length; ii++){
			var tmp = null;

			switch(maskChars[ii]){
				case "0":
					tmp = "[0-9]";
					break;
				case "L":
					tmp = "[a-zA-Z]";
					break;
				case "A":
					tmp = "[0-9a-zA-Z]";
					break;
				case "&":
					tmp = ".";
					break;
				case "\\":
					i++;
					if(i >= maskChars.length)
						break;
					// fall through
				default:
					this.chars.push(maskChars[ii]);
					this.enteredValue.push(maskChars[ii]);
			}

			if(tmp != null){
				var re = new RegExp("^" + tmp + "$");
				this.chars.push(re);

				this.enteredValue.push(null);
			}
		}

		this.setValue(fieldValue);
	}

	if(this.hasFeature("zpFormMultiple")){
		Masc.Utils.createProperty(this.field, "zpLastNode", lastNode);
	}

	if(
		this.hasFeature("zpFormSuggest") ||
		this.hasFeature("zpFormAutoComplete") ||
		this.hasFeature("zpFormAutoCompleteStrict")
	){
		this.dropDown = null;
		if(typeof(Masc.DropDown) == 'undefined'){
			Masc.Transport.loadJS({
				module: 'dropdown',
				async: true,
				onLoad: function(){
					self.initDropDown();
				}
			});
		} else {
			this.initDropDown();
		}
	}

	// Validate on first run.
	this.blur();
}

// interval before last keystroke and sending request to server.
Masc.Form.Field.DELAYED_INTERVAL = 1000;

Masc.Form.Field.prototype.initDropDown = function(){
	var self = this;

	var arrow = Masc.Utils.createElement("span");
	arrow.className = Masc.Form.ignoreMark + " dropDownArrow";

	Masc.Utils.createProperty(arrow, "onclick", function(){
		self.autoCompleteValue(self.getAutoCompleteOptions(true));

		self.suggestValue(true)
	});

	Masc.Utils.insertAfter(this.field, arrow);

	this.dropDown = new Masc.DropDown({
		element: this.field,
		hook: arrow,
		onselect: function(objSource){
			self.setValue(objSource.join(" "));

			if(self.field.onchange != null){
				self.field.onchange.call();
			}

			self.validate();
		},
		theme: this.form.config.dropDownTheme,
		themePath: Masc.Form.path + "../../zpextra/themes/dropdown/"
	})
}

/**
* \internal handler for keydown event.
*/
Masc.Form.Field.prototype.keydown = function(evt) {
	if(!this.editing){
		return false;
	}

	if(!evt){
		evt = window.event;
	}

	this.state.lastSelectionStart = this.getSelectionStart();
	this.state.lastSelectionEnd = this.getSelectionEnd();

	// this is IE workaround - IE catches nonalphanumeric keys only on keydown.
	if(
		Masc.is_ie &&
		(this.hasFeature('zpFormAllowedChars') || this.hasFeature("zpFormMask"))
	){
		var tmpArr = Masc.Form.Utils.getInputData(evt, true);
		var charCode = tmpArr[0];
		var newChar = tmpArr[1];

		if(
			Masc.Form.Utils.isSpecialKey(charCode, newChar) ||
			this.processFunctionalKeys(evt) == true
		){
			return true;
		}

		if(this.hasFeature("zpFormMask")){
			if(this.processCustomKeys(charCode) == true){
				return true;
			}

			return false;
		}

		if(this.hasFeature('zpFormAllowedChars')){
			this.setValueFromField();
		}
	}

	if(this.dropDown){
		this.dropDown.hide();
	}

	return true;
}

/**
* \internal handler for keypress event.
*/
Masc.Form.Field.prototype.keypress = function(evt) {
	if(!this.editing){
		return false;
	}

	if(typeof(evt) == 'undefined'){
		evt = window.event;
	}

	if (this.hasFeature('zpFormAllowedChars')){
		if(this.processFunctionalKeys(evt) == true){
			return true;
		}

		//the key that was pressed
		var tmpArr = Masc.Form.Utils.getInputData(evt)
		var charCode = tmpArr[0];
		var newChar = tmpArr[1];

		if(
			(
				Masc.Form.Utils.isSpecialKey(charCode, newChar) ||
				charCode == 8 ||
				charCode == 46
			)
		){
			return true;
		}

		var allowed = new RegExp('[' + this.getFeature('zpFormAllowedChars') + ']');

		if (!(allowed.test(newChar))) {
			this.field.style.color = "red";
			this.field.readonly = true;

			var self = this;
			setTimeout(function(){
				self.field.style.color = "";
				self.field.readonly = false;
			}, 100);

			return false;
		}

		this.setValueFromField();
		return true;
	}

	if(this.hasFeature("zpFormMask")){
		var self = this;

		var tmpArr = Masc.Form.Utils.getInputData(evt)

		var charCode = tmpArr[0];
		var newChar = tmpArr[1];

		if(this.processFunctionalKeys(evt) == true){
			return true;
		}

		this.setValueFromField();

		var pos = this.getSelectionStart();

		if(charCode == null && newChar == null){
			return false;
		}

		if(!Masc.is_ie){
			if(Masc.Form.Utils.isSpecialKey(charCode, newChar)){
				return true;
			}

			if(this.processCustomKeys(charCode) == false){
				return false;
			}
		}

		// if char under cursor is strict - search for next mask char.
		// If no such char founded - leave at current position and exit
		if(typeof(this.chars[pos]) == 'string'){
			var newPos = this.getNextAvailablePosition(pos);

			if(newPos == null || newPos == pos)
				return false;

			this.setCaretPosition(newPos);
			pos = newPos;
		}

		// check if entered char could be applied to current mask element.
		if(
			pos >= this.chars.length ||
			typeof(this.chars[pos]) != 'string' && !newChar.match(this.chars[pos]) ||
			typeof(this.chars[pos]) == 'string' && newChar != this.chars[pos]
		){
			this.field.style.color = "red";
			this.field.readonly = true;

			setTimeout(function(){
				self.field.style.color = "";
				self.field.readonly = false;
			}, 100);

			this.setValue();
			this.setCaretPosition(pos)
		} else {
			// all is ok. store and display entered char.
			this.enteredValue[pos] = newChar;
			this.setValue();

			var newPos = this.getNextAvailablePosition(pos);

			if(newPos == null){
				newPos = pos + 1;
			}

			this.setCaretPosition(newPos)
		}

		if(evt && evt.preventDefault){
			evt.preventDefault();
		}

		return false;
	}
}

/**
* \internal handler for keyup event.
*/
Masc.Form.Field.prototype.keyup = function(evt) {
	if(!this.editing){
		return false;
	}

	var tmp = Masc.Form.Utils.getInputData(evt, true)

	this.validate();

	if(
		Masc.Form.Utils.isSpecialKey(tmp[0], tmp[1]) ||
		(
			(
				tmp[0] == 8 ||
				tmp[0] == 46
			) &&
			this.state.lastSelectionStart != this.state.lastSelectionEnd
		)
	){
		return true;
	}

	if(this.hasFeature("zpFormAutoComplete") || this.hasFeature("zpFormAutoCompleteStrict")){
		this.autoCompleteValue(this.getAutoCompleteOptions());
	}

	this.keyPressCounter++;
	var self = this;
	setTimeout(function(){self.runDelayedActions()}, Masc.Form.Field.DELAYED_INTERVAL);
	return true;
};

/**
* \internal handler for focus event.
*/
Masc.Form.Field.prototype.focus = function(evt) {
	this.editing = true;

	if(this.hasFeature("zpFormMask")){
		if(this.isEmpty()){
			this.setValue();
			this.setCaretPosition(0);
		}
	}

	this.validate();
};

/**
* \internal handler for blur event.
*/
Masc.Form.Field.prototype.blur = function(evt) {
	this.editing = false;

	// clean mask layout from field if no value was entered
	if(this.hasFeature("zpFormMask") && !this.isFilled()){
		this.setValue("", true);
	}

	if(this.hasFeature("zpFormAllowedChars")){
		this.setValueFromField(false);
	}

	this.validate();
};

/**
* \internal function to validate current field.
*/
Masc.Form.Field.prototype.validate = function(onlyValidate) {
	if (!this.field.className || (!this.firstRun && this.field.disabled))
		return null;

	var validators = Masc.Form.dataTypes;
	var valid = true;
	var message = null;
	var errors = [];

	var isRequired = this.hasFeature("zpFormRequired");
	var isEmpty = this.isEmpty();

	var validatorUsed = isRequired;

	// If field is empty - do not run any validations. Only display error if
	// field is required.
	if(isEmpty){
		validatorUsed = true;
		if(isRequired){
		 	message = this.hasFeature("zpFormRequiredError") ? this.getFeature("zpFormRequiredError") : "This field is required";
			errors.push({field: this.field, errorMessage: message, validator: 'zpFormRequired'});
		}
	} else {
		for(var validatorName in this.validators){
			if(validatorName == 'zpFormMask'){
				validatorUsed = true;

				if(!this.isMaskFullyFilled()){
					valid = false;
					var mask = this.getFeature("zpFormMask");
					message = this.hasFeature("zpFormMaskError") ?
						this.getFeature("zpFormMaskError") :
						"Does not conform to mask " + mask.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

					errors.push({field: this.field, errorMessage: message, validator: "zpFormMask"});
				}
			}

			// do not run any other validators until mask is filled.
			if(this.hasFeature('zpFormMask') && !this.isMaskFullyFilled()){
				continue;
			}

			if(validatorName == 'zpFormAutoCompleteStrict'){
				validatorUsed = true;

				var founded = false;
				var currVal = this.getValue();

				for(var ii = 0; ii < this.autoCompleteOptions.length; ii++){
					if(currVal == this.autoCompleteOptions[ii]){
						founded = true;
						break;
					}
				}

				if(!founded){
					valid = false;

					message = this.hasFeature("zpFormAutoCompleteStrictError") ?
						this.getFeature("zpFormAutoCompleteStrictError") :
						"No such value";

					errors.push({field: this.field, errorMessage: message, validator: "zpFormAutoCompleteStrict"});
				}
			}

			if(typeof(validators[validatorName]) != 'undefined'){
				validatorUsed = true;
				var validator = validators[validatorName];

				if(validator.regex) {
					// Regex validation.
					valid &= validator.regex.test(this.getValue());
				} else if (validator.func) {
					// Javascript function validation.
					valid &= validator.func(this.getValue(), this.getFeature(validatorName));
				}

				if(!valid){
					message = this.hasFeature(validatorName + "Error") ?
						this.getFeature(validatorName + "Error") :
						validator.error;

					errors.push({'field': this.field, 'errorMessage': message, 'validator': validator});
				}
			}
		}

		if(this.ajaxError != null){
			validatorUsed = true;
			message = this.ajaxError;
			errors.push({'field': this.field, 'errorMessage': this.ajaxError, 'validator': "zpFormValidate"});
		}
	}

	if(!onlyValidate && validatorUsed){
		this.setImageStatus(message);
	}

	return errors;
};

/**
* Sets the CLASS of the status indicator next to a form field, and its title
* tooltip popup.
* @param status - [string] error message
*/
Masc.Form.Field.prototype.setImageStatus = function(status) {
	var isRequired = this.hasFeature("zpFormRequired")
	var isEmpty = this.isEmpty();

	// clear all marks from status fields.
	this.statusImg.className = Masc.Form.ignoreMark + ' zpStatusImg';
	this.statusImg1.className = Masc.Form.ignoreMark + (isRequired ? ' zpIsRequired' : ' zpNotRequired');
	this.statusImg2.className = Masc.Form.ignoreMark;
	this.statusImg3.className = Masc.Form.ignoreMark;
	this.statusImg4.className = Masc.Form.ignoreMark;
	this.errorText.innerHTML = "";

	if(this.form.config.strict){
		if(status == null){
			this.form.toggleSubmits(this.form.validate() != null)
		} else {
			this.form.toggleSubmits(true);
		}
	}
	// process field only if this is not first round mark
	if(!this.firstRun && (isRequired && isEmpty || !isEmpty)){
		this.statusImg2.className += (this.editing ? ' zpIsEditing' : ' zpNotEditing');
		this.statusImg3.className += (isEmpty ? ' zpIsEmpty' : ' zpNotEmpty');
		this.statusImg4.className += (!status ? ' zpIsValid' : ' zpNotValid');

		// if field is empty but it is editing in this time - do not display
		// "this field is required" message
		if(isRequired && isEmpty && this.editing){
			status = null;
		}

		// Error status text handling.
		if(status != null){
			if (
				this.form.config.showErrors == 'beforeField' ||
				this.form.config.showErrors == 'afterField'
			){
				this.errorText.innerHTML = status;
			} else if(this.form.config.showErrors == 'tooltip' && Masc.Tooltip){
				// Create and/or show a tooltip on the img.
				if (!this.tooltip) {
					var tt = Masc.Utils.createElement('div', document.body);
					this.tooltip = new Masc.Tooltip(this.statusImg, tt);
				}

				this.tooltip.tooltip.innerHTML = status ? status : '';
			} else {
				// Use default browser tooltip
				this.statusImg.title = status;
			}
		}
	}

	this.firstRun = false;
}

/**
* \internal returns true, if field is empty(for zpFormMask fields field is empty -
* only if user don't enter any symbol to it)
*/
Masc.Form.Field.prototype.isEmpty = function(){
	if(this.hasFeature("zpFormMask")){
		for(ii = 0; ii < this.enteredValue.length; ii++){
			if(typeof(this.chars[ii]) != 'string' && this.enteredValue[ii] != null){
				return false;
			}
		}

		return true;
	} else {
		if(this.field.type.toLowerCase() == 'radio' || this.field.type.toLowerCase() == 'checkbox'){
			var elements = this.form.container.elements;
			var empty = true;

			for(var ii = 0; ii < elements.length; ii++){
				if(elements[ii].name == this.field.name && elements[ii].checked){
					empty = false;
					break;
				}
			}

			return empty;
		} else {
			var currVal = this.getValue();
			return (currVal == null || currVal.length == 0);
		}
	}

	alert('impossible');
}

/**
* \internal returns true, if at least one character is entered
*/
Masc.Form.Field.prototype.isFilled = function(){
	if(this.hasFeature("zpFormMask")){
		for(ii = 0; ii < this.enteredValue.length; ii++){
			if(typeof(this.chars[ii]) != 'string' && this.enteredValue[ii] != null){
				return true;
			}
		}

		return false;
	} else {
		var currVal = this.getValue();
		return (currVal != null && currVal.length > 0);
	}
}

/**
* \internal returns true, if mask is fully entered
*/
Masc.Form.Field.prototype.isMaskFullyFilled = function(){
	if(this.hasFeature("zpFormMask")){
		for(ii = 0; ii < this.enteredValue.length; ii++){
			if(typeof(this.chars[ii]) != 'string' && this.enteredValue[ii] == null){
				return false;
			}
		}

		return true;
	} else {
		return this.isFilled();
	}
}

/**
* \internal Returns true, if field has feature, specifed by param feature.
* False in other case
* @param feature - [string] feature name
*/
Masc.Form.Field.prototype.hasFeature = function(feature){
	if(typeof(feature) == 'undefined' || feature == null){
		return false;
	}

	if(typeof(this.validators[feature]) == 'undefined'){
		return false;
	}

	return true;
}

/**
* \internal Returns value for given feature name
* @param feature - [string] feature name
*/
Masc.Form.Field.prototype.getFeature = function(feature){
	if(typeof(feature) == 'undefined' || feature == null){
		return false;
	}

	return this.validators[feature]
}

/*
* \internal zpFormMask related function - returns position of next unfilled
* mask char into mask. Returns null if such character not found.
*/
Masc.Form.Field.prototype.getNextAvailablePosition = function(pos){
	if(pos + 1 >= this.enteredValue.length)
		return null;

	if(typeof(this.chars[pos + 1]) == 'string')
		return this.getNextAvailablePosition(pos + 1);

	return (pos + 1);
}

/**
* \internal zpFormMask related function - returns position of previous
* unfilled mask char into mask. Returns null if such character not found.
*/
Masc.Form.Field.prototype.getPrevAvailablePosition = function(pos){
	if(pos - 1 < 0)
		return null;

	if(typeof(this.chars[pos - 1]) == 'string')
		return this.getPrevAvailablePosition(pos - 1);

	return pos - 1;
}

/**
* \internal zpFormMask related function - sets selection inside INPUT element
* @param startPos - [int] start of selection(required).
* @param endPos - [int] end of selection(nonrequired. equal to startPos by default)
*/
Masc.Form.Field.prototype.setCaretPosition = function(startPos, endPos){
	var valLength = this.getValue().length;

	if(isNaN(parseInt(startPos))){
		return false;
	} else {
		startPos = parseInt(startPos);

		if(startPos < 0){
			startPos = 0
		} else if(startPos > valLength){
			startPos = valLength;
		}
	}

	if(isNaN(parseInt(endPos)) || parseInt(endPos) < startPos){
		endPos = startPos;
	} else {
		endPos = parseInt(endPos);

		if(endPos < 0){
			endPos = 0;
		} else if(endPos > valLength){
			endPos = valLength;
		}
	}

	if(typeof(this.field.createTextRange) == "object"){
		// IE
		var range = this.field.createTextRange();

		range.moveEnd("character", endPos - this.getValue().length);
		range.moveStart("character", startPos);
		range.select();

		return true;
	} else if (typeof(this.field.setSelectionRange) == 'function'){
		// mozilla, opera, safari
		this.field.setSelectionRange(startPos, endPos)

		return true;
	}

	return false;
}

/**
* \internal zpFormMask related function - returns start position of selection
* in INPUT element.
*/
Masc.Form.Field.prototype.getSelectionStart = function(){
	if (typeof(this.field.selectionStart) != "undefined") {
		// mozilla and opera
		var selStart = this.field.selectionStart;

		// Safari bug when field is focused for first time
		if(selStart == 2147483647){
			selStart = 0;
		}
		return selStart;
	} else if (document.selection) {
		// IE black magic
		return Math.abs(
			document.selection.createRange().moveStart("character", -1000000)
		);
	}

	return null;
}

/**
* \internal zpFormMask related function - returns end position of selection
* in INPUT element.
*/
Masc.Form.Field.prototype.getSelectionEnd = function(){
	if (typeof(this.field.selectionEnd) != "undefined") {
		// mozilla and opera
		return this.field.selectionEnd;
	} else if (document.selection) {
		// IE black magic
		return this.field.value.length - Math.abs(
			document.selection.createRange().moveEnd("character", 1000000)
		);
	}

	return null;
}

/**
* \internal zpFormMask related function - processes backspace and delete
* keys.
* @param charCode - [int] code of the key that was pressed.
*/
Masc.Form.Field.prototype.processCustomKeys = function(charCode){
	var selStart = this.getSelectionStart();
	var selEnd = this.getSelectionEnd();

	if(selStart == selEnd){
		if(charCode == 8){ // backspace
			var newPos = this.getPrevAvailablePosition(selStart);

			if(newPos == null || newPos == selStart){
				return false;
			}

			this.enteredValue[newPos] = null;
			this.setValue();

			this.setCaretPosition(newPos + (Masc.is_opera ? 1 : 0));

			return false;
		}

		if(charCode == 46){ // delete
			if(typeof(this.chars[selStart]) == 'string'){
				return false;
			}

			this.enteredValue[selStart] = null;
			this.setValue();
			this.setCaretPosition(selStart)

			return false;
		}
	} else {
		if(charCode == 8 || charCode == 46){ // backspace
			for(var ii = selStart; ii < selEnd; ii++){
				if(typeof(this.chars[ii]) != 'string'){
					this.enteredValue[ii] = null;
				}
			}

			this.setValue();
			this.setCaretPosition(selStart + (Masc.is_opera ? 1 : 0));

			return false;
		}
	}

	return true;
}

/**
* \internal custom processing for alt, ctrl and shift keys
*/
Masc.Form.Field.prototype.processFunctionalKeys = function(evt){
	var tmpArr = Masc.Form.Utils.getInputData(evt)

	var charCode = tmpArr[0];
	var newChar = tmpArr[1];

	if(evt.ctrlKey || (typeof(evt.metaKey) != 'undefined' && evt.metaKey)){
		// custom processing of ctrl+backspace and ctrl+delete shortcuts
		if(charCode == 8){
			// backspace
			this.setCaretPosition(0, this.getSelectionStart());

			return false;
		} else if(charCode == 46){
			// delete
			this.setCaretPosition(this.getSelectionStart(), this.getValue().length);

			return false;
		} else if(newChar == 'v' || newChar == 'V'){
			this.setValueFromField();

			return true;
		}

		return true;
	} else if(evt.shiftKey){
		if(charCode == 37 || charCode == 39){ // left/right arrow
			return true;
		} else if(charCode == 45){ // insert
			this.setValueFromField();
			return true;
		}
	} else if(evt.altKey){
		return true;
	}

	return false;
}

/**
* \internal zpFormMask related function - sets field value and value of INPUT
* element(this captures paste into field)
*/
Masc.Form.Field.prototype.setValueFromField = function(restoreCursorPosition, validateAfter){
	if(typeof(restoreCursorPosition) == 'undefined'){
		restoreCursorPosition = true;
	}

	var self = this;
	setTimeout(
		function(){
			var selStart = self.getSelectionStart();
			var selEnd = self.getSelectionEnd();

			var val = Masc.Form.Utils.getValue(self.field);

			if (self.hasFeature('zpFormAllowedChars')){
				var notallowed = new RegExp('[^' + self.getFeature('zpFormAllowedChars') + ']', 'g');
				val = val.replace(notallowed, "");
			}

			self.setValue(val);

			if(restoreCursorPosition && self.editing == true){
				self.setCaretPosition(selStart, selEnd);
			}

			if(validateAfter){
				self.validate();
			}
		},
		1
	);
}

/**
* \internal returns value of current field.
*/
Masc.Form.Field.prototype.getValue = function(){
	return Masc.Form.Utils.getValue(this.field);
}

/**
* \internal sets value of current field
* @param value - [string] value to set
*/
Masc.Form.Field.prototype.setValue = function(value, direct){
	if(value == null){
		value = "";
	}

	// if field has zpFormMask mark - this is special case
	if(this.hasFeature('zpFormMask') && !direct){
		var val = "";

		if(this.editing != false || this.isFilled()){
			for(ii = 0; ii < this.chars.length; ii++){
				if(ii < value.length){
					// if value is given - fill this.enteredValue with it.
					if(typeof(this.chars[ii]) != "string"){
						if(this.chars[ii].test(value.charAt(ii))){
							this.enteredValue[ii] = value.charAt(ii);
							val += value.charAt(ii);
						} else {
							this.enteredValue[ii] = null;
							val += "_";
						}
					} else {
						this.enteredValue[ii] = this.chars[ii];
						val += this.chars[ii];
					}
				} else if(arguments.length > 0){
					// if value were given - clear rest of the characters
					if(typeof(this.chars[ii]) == 'string'){
						val += this.chars[ii];
					} else {
						this.enteredValue[ii] = null;
						val += "_";
					}
				} else {
					// if no value were given - then form masked value from internal arrays
					if(typeof(this.chars[ii]) == 'string'){
						val += this.chars[ii];
					} else {
						val += this.enteredValue[ii] == null ? "_" : this.enteredValue[ii];
					}
				}
			}
		}

		value = val;
	}

	return Masc.Form.Utils.setValue(this.field, value);
}

/**
* \interal This method processes delayed actions - usually this actions are
* executed when user finished typing in the field.
*/
Masc.Form.Field.prototype.runDelayedActions = function(){
	this.keyPressCounter--;

	if(this.keyPressCounter != 0){
		return null;
	}

	this.ajaxValidate();
	this.suggestValue();
}

/**
* TODO
*/
Masc.Form.Field.prototype.ajaxValidate = function(){
	// processing zpFormValidate feature
	if(!this.hasFeature("zpFormValidate")){
		return null;
	}

	var valid = this.validate();

	if(!(
			valid == null || // if field has no client-side errors
			valid != null &&
			(
				valid.length == 0 ||
				valid.length == 1 && // or has only one error, but it is error from this validator
				valid[0].validator == "zpFormValidate"
			)
		)
	){
		return null;
	}
	var submitUrl = this.getFeature("zpFormValidate");
	var submitMethod = this.getFeature("zpFormValidateMethod");
	var submitParam = this.getFeature("zpFormValidateParam");
	var submitQuery = this.getFeature("zpFormValidateQuery");

	// method by default is GET
	if(typeof(submitMethod) != 'string'){
		submitMethod = "GET"
	}

	// URL param name by default is equal to the field name
	if(typeof(submitParam) != 'string'){
		submitParam = this.field.name;
	}

	if(typeof(submitQuery) != 'string'){
		submitQuery = "";
	}

	submitQuery += "&" + escape(submitParam) + "=" + escape(this.getValue());

	if(submitUrl.indexOf("?") < 0){
		submitUrl += "?";
	}

	submitUrl += "&" + Math.random();

	if(submitMethod == 'GET'){
		submitUrl += "&" + submitQuery;
	}

	this.statusImg5.className = "zpIsFetching " + Masc.Form.ignoreMark;

	var self = this;

	if(this.form.config.ajaxDebugFunc){
		this.form.config.ajaxDebugFunc("-----------------------");
		this.form.config.ajaxDebugFunc("Sending request for AJAX validate field " + this.field.name + ".");
		this.form.config.ajaxDebugFunc(submitMethod + " " + submitUrl);
		this.form.config.ajaxDebugFunc("Query: " + ("GET" ? null : submitQuery));
	}

	Masc.Transport.fetch({
		url: submitUrl,
		content: submitMethod == "GET" ? null : submitQuery,
		method: submitMethod,
		onLoad: function(objText){
			// retrieves JSON object of following format:
			//{
			//	"success": true | false,
			//	"generalError": "Human readable error description"
			//}

			if(self.form.config.ajaxDebugFunc){
				self.form.config.ajaxDebugFunc("Response received: " + objText.responseText);
			}

			self.statusImg5.className = Masc.Form.ignoreMark + "zpNotFetching";

			var objResponse = Masc.Transport.parseJson({strJson: objText.responseText});

			if(objResponse == null){
				Masc.Log({description: "Can't parse received JSON: " + objText.responseText});
				return null;
			}

			if(!objResponse.success){
				self.ajaxError = typeof(objResponse.generalError) != 'string' ||
					objResponse.generalError.length == 0 ?
						"This field is not valid" : objResponse.generalError;
			} else {
				self.ajaxError = null;
			}

			self.validate();
		},
		onError : function(objError){
			var strError = '';

			if (objError.errorCode) {
				strError += objError.errorCode + ' ';
			}

			strError += objError.errorDescription;

			self.statusImg5.className = Masc.Form.ignoreMark + "zpNotFetching";
			alert(strError);
			self.ajaxError = null;

			if(self.form.config.ajaxDebugFunc){
				self.form.config.ajaxDebugFunc("Error response received: " + strError);
			}
		}
	});
}

/**
* \internal Provide suggestions for current field value.
* @param showAll - [boolean] if setted to true - no current field value will be
* sent to server so it must send all possible values.
*/
Masc.Form.Field.prototype.suggestValue = function(showAll){
	// processing suggest feature
	if(
		!this.hasFeature("zpFormSuggest") ||
		!showAll &&
		this.isEmpty()
	){
		return null;
	}

	var suggestUrl = this.getFeature("zpFormSuggest");
	var suggestMethod = this.getFeature("zpFormSuggestMethod");
	var suggestParam = this.getFeature("zpFormSuggestParam");
	var suggestQuery = this.getFeature("zpFormSuggestQuery");

	// method by default is GET
	if(typeof(suggestMethod) != 'string'){
		suggestMethod = "GET"
	}

	// URL param name by default is equal to the field name
	if(typeof(suggestParam) != 'string'){
		suggestParam = this.field.name;
	}

	if(typeof(suggestQuery) != 'string'){
		suggestQuery = "";
	}

	suggestQuery += "&" + escape(suggestParam) + "=" + (showAll ? "" : escape(this.getValue()));

	if(suggestUrl.indexOf("?") < 0){
		suggestUrl += "?";
	}

	suggestUrl += "&" + Math.random();

	if(suggestMethod == 'GET'){
		suggestUrl += "&" + suggestQuery;
	}

	this.statusImg5.className = "zpIsFetching " + Masc.Form.ignoreMark;

	var self = this;

	if(this.form.config.ajaxDebugFunc){
		this.form.config.ajaxDebugFunc("-----------------------");
		this.form.config.ajaxDebugFunc("Sending request for AJAX suggest field " + this.field.name + ".");
		this.form.config.ajaxDebugFunc(suggestMethod + " " + suggestUrl);
		this.form.config.ajaxDebugFunc("Query: " + ("GET" ? null : suggestQuery));
	}

	Masc.Transport.fetch({
		url: suggestUrl,
		content: suggestMethod == "GET" ? null : suggestQuery,
		method: suggestMethod,
		onLoad: function(objText){
			/*
			retrieves JSON object of following format:
			{
			"success" : true, //true/false - if request processed successfully.
			"generalError": "Human readable error description" // if success == false
			"header": [ // table header description. Optional.
				{
					name: "Col name1", // text to display in column header
					style: "color: blue", // apply this style to this header
					colStyle: "color: blue" // apply this style to each cell in this row
				},
				{
					name: "Col name2", // text to display in column header
					className: "custom", // add this class to this header
					colClassName: "customCol" // add this class to each cell in this row
				}
			],
			"body": [ // array of data to display in rows
				["str1, col1", "str1, col2"],
				...
			]
			}
			*/

			if(self.form.config.ajaxDebugFunc){
				self.form.config.ajaxDebugFunc("Response received: " + objText.responseText);
			}

			self.statusImg5.className = Masc.Form.ignoreMark + "zpNotFetching";

			var objResponse = Masc.Transport.parseJson({strJson: objText.responseText});

			if(objResponse == null){
				Masc.Log({description: "Can't parse received JSON: " + objText.responseText});
				return null;
			}

			if(!objResponse.success){
				alert(typeof(objResponse.generalError) != 'string' ||
					objResponse.generalError.length == 0 ?
						"Can't retrieve value: " : objResponse.generalError
				);
			} else {
				self.autoCompleteValue(objResponse);
			}

			self.validate();
		},
		onError : function(objError){
			var strError = '';

			if (objError.errorCode) {
				strError += objError.errorCode + ' ';
			}

			strError += objError.errorDescription;

			self.statusImg5.className = Masc.Form.ignoreMark + "zpNotFetching";
			alert(strError);
			self.ajaxError = null;

			if(self.form.config.ajaxDebugFunc){
				self.form.config.ajaxDebugFunc("Error response received: " + strError);
			}
		}
	});
}

/**
* \internal returns array of values to autocomplete current field value
* @param showAll - [boolean] if setted to true - no current field value will be
* used to filter available options.
*/
Masc.Form.Field.prototype.getAutoCompleteOptions = function(showAll){
	var opts = {body: []};
	var currVal = this.getValue();

	if(
		(
			this.hasFeature("zpFormAutoComplete") ||
			this.hasFeature("zpFormAutoCompleteStrict")
		)
	){
		for(var ii = 0; ii < this.autoCompleteOptions.length; ii++){
			if(
				(this.hasFeature("zpFormAutoCompleteStrict") ? this.autoCompleteOptions[ii].substring(0, currVal.length) : this.autoCompleteOptions[ii].substring(0, currVal.length).toLowerCase()) ==
				(this.hasFeature("zpFormAutoCompleteStrict") ? currVal : currVal.toLowerCase()) ||
				showAll
			){
				opts.body.push([this.autoCompleteOptions[ii]]);
			}
		}
	}

	return opts;
}

/**
* \internal function autocompletes field value with given value and displays
* dropdown list of other available values.
* @param opts - [object] array of values to display.
*/
Masc.Form.Field.prototype.autoCompleteValue = function(opts){
	if(
		typeof(opts) == 'undefined' ||
		opts.body == null ||
		opts.body.length == 0 ||
		(
			opts.body.length == 1 &&
			opts.body[0][0] == ""
		)
	){
		return;
	}

	var currValue = this.getValue();
	var retrValue = null;

	var firstValue = opts.body[0][0];

	if(firstValue.substring(0, currValue.length).toLowerCase() == currValue.toLowerCase()){
		retrValue = firstValue.substring(currValue.length);
		this.setValue(currValue + retrValue);
		this.setCaretPosition(currValue.length, this.getValue().length);
	}

	this.validate();

	if(this.dropDown && opts.body.length > 1){
		this.dropDown.setContent(opts)
		this.dropDown.show();
		this.dropDown.setWidth(this.field.clientWidth);
		if(this.dropDown.WCH){
			this.dropDown.WCH.style.width = this.field.clientWidth + "px";
		}
	}
}
