// $Id: validator.js 4322 2006-09-04 08:49:33Z shacka $
//Array of Data Types
Masc.Form.dataTypes = {};

Masc.Form.Validator = [];

/*
* Small function to add datatypes to Masc.Form.dataTypes
* @param zpName - [string] name of this datatype
* @param name - [string] internal name
* @param regex - [RegExp] regexp to validate
* @param error - [string] text to use, if validation was not passed
* @param help - [string] help message
* @param func - [function] function to use for validating field value
*/

Masc.Form.Validator.addDataType = function(zpName, name, regex, error, help, func) {
	Masc.Form.dataTypes[zpName] = {
		zpName: zpName,
		name: name,
		regex: regex,
		error: error,
		help: help,
		func: func
 };
}

// backward compartibility
Masc.Form.addDataType = Masc.Form.Validator.addDataType;

/*
* Returns true, if given string is valid domain name
* Valid domains:
*	127.0.0.1
*	google.com
*	http://www.google.com/
* @param domain - [string] value to test
*/
Masc.Form.Validator.isDomainValid = function(domain){
	if(typeof(domain) != 'string'){
		return false;
	}

	for (i = 0; i < domain.length; i++){
		if (domain.charCodeAt(i) > 127){
			return false;
		}
	}

	var ipDigit = "(0?0?\\d|[01]?\\d\\d|2[0-4]\\d|25[0-6])";
	var ipRE = new RegExp("^" + ipDigit + "\\." + ipDigit + "\\." + ipDigit + "\\." + ipDigit + "$");

	if (ipRE.test(domain)) {
		return true;
	}

	var domains = domain.split(".");

	if (domains.length < 2) {
		return false;
	}

	for (i = 0; i < domains.length - 1; i++) {
		if (!(/^[a-zA-Z0-9\-]+$/).test(domains[i])) {
			return false;
		}
	}

	if(domains[domains.length-2].length < 2){
		return false;
	}

	if (!(/^[a-zA-Z]{2,}$/).test(domains[domains.length-1])){
		return false;
	}

	return true;
}

/*
* Returns true, if given string is valid domain name
* Valid urls:
*	127.0.0.1
*	http://127.0.0.1/index.html?query
*	google.com
*	http://www.google.com/search?q=Masc
* @param url - [string] value to test
*/
Masc.Form.Validator.isUrlValid = function(url){
	if(typeof(url) != 'string'){
		return false;
	}

	var domain = url;

	var protocolSeparatorPos = url.indexOf("://");
	var domainSeparatorPos = url.indexOf("/", protocolSeparatorPos + 3);

	if(protocolSeparatorPos == 0){
		return false;
	}

	domain = url.substring(
		(protocolSeparatorPos > 0 ? protocolSeparatorPos + 3 : 0),
		(domainSeparatorPos > 0 ? domainSeparatorPos : url.length)
	);

	return Masc.Form.Validator.isDomainValid(domain);
}

Masc.Form.Validator.isEmailValid = function(email){
	if(email == null){
		return false;
	}

	var atPos = email.indexOf("@");

	if(
		atPos < 1 ||
		email.indexOf(".", atPos) == -1
	){
		return false
	}

	var login = email.substring(0, atPos);
	var domain = email.substring(atPos + 1, email.length);

	// Regexp declarations
    var atom = "\[^\\s\\(\\)><@,;:\\\\\\\"\\.\\[\\]\]+";
    var word = "(" + atom + "|(\"[^\"]*\"))";
    var loginRE = new RegExp("^" + word + "(\\." + word + ")*$");

    for (i = 0; i < login.length; i++){
        if (login.charCodeAt(i) > 127){
            return false;
        }
    }

    if (!login.match(loginRE)){
        return false;
    }

    return Masc.Form.Validator.isDomainValid(domain);
}

/*
* Returns true, if given string is valid credit card number(according to Luhn
* algorythm)
* @param cardNumber - [string] value to test
*/
Masc.Form.Validator.isCreditCardValid = function(cardNumber){
	if(cardNumber == null){
		return false;
	}

	var cardDigits = cardNumber.replace(/\D/g, "");
	var parity = cardDigits.length % 2;
	var sum = 0;

	for(var ii = 0; ii < cardDigits.length; ii++){
		var digit = cardDigits.charAt(ii);

		if (ii % 2 == parity)
			digit = digit * 2;

		if (digit > 9)
			digit = digit - 9;

		sum += parseInt(digit);
	}

	return ((sum != 0) && (sum % 10 == 0))
}

/*
* Returns true if given string is valid date according to given format. Default format: "%m/%d/%y"
* @param str - [string] value to test
* @param format - [string] date format
*/
Masc.Form.Validator.isDateValid = function(str, fmt){
	if(fmt == null || fmt == ""){
		fmt = "%m/%d/%y"
	}

	var separator = " ";
	var nums = fmt.split(separator)

	if (nums.length < 3){
		separator = "/"
		nums = fmt.split(separator)

		if (nums.length < 3){
			separator = "."
			nums = fmt.split(separator)

			if (nums.length < 3){
				separator = "-"
				nums = fmt.split(separator)

				if (nums.length < 3){
					separator = null;
				}
			}
		}
	}

	if(separator == null){
		return false;
	}

	var y = null;
	var m = null;
	var d = null;

	var a = str.split(separator);

	if(a.length != 3){
		return false;
	}

	var b = fmt.match(/%./g);

	var nlDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var lDays  = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (var i = 0; i < a.length; ++i) {
		if (!a[i])
			continue;
		switch (b[i]) {
		    case "%d":
		    case "%e":
				d = parseInt(a[i], 10);
				if(d < 0 || d > 31)
					d = -1
				break;
		    case "%m":
				m = parseInt(a[i], 10) - 1;
				if(m > 11 || m < 0)
					m = -1;
				break;
		    case "%Y":
		    case "%y":
				y = parseInt(a[i], 10);
				(y < 100) && (y += (y > 29) ? 1900 : 2000);
				break;
		}
	}

	if (y == null || m == null || d == null || isNaN(y) || isNaN(m) || isNaN(d)){
		return false;
	}

	if(m != -1){
		if ((y % 4) == 0) {
			if ((y % 100) == 0 && (y % 400) != 0){
				if(d > nlDays[m]){
					d = -1;
				}
			}

			if(d > lDays[m]){
				d = -1;
			}
		} else {
			if(d > nlDays[m]){
				d = -1;
			}
		}
	}

	if (y != 0 && m != -1 && d != -1){
		return true;
	}

	return false;
}

//Initialize the validators
Masc.Form.Validator.addDataType(
	'zpFormUrl',
	'A URL -- web address',
	null,
	"Invalid URL",
	"Valid URL needs to be in the form http://www.yahoo.com:80/index.html or just www.yahoo.com",
	Masc.Form.Validator.isUrlValid
);

Masc.Form.Validator.addDataType(
	'zpFormEmail',
	'An Email Address',
	null,
	"Invalid Email Address",
	"Valid email address need to be in the form of nobody@example.com",
	Masc.Form.Validator.isEmailValid
);

Masc.Form.Validator.addDataType(
	'zpFormCreditCard',
	'Credit card number',
	null,
	"Invalid credit card number",
	"Please enter valid credit card number",
	Masc.Form.Validator.isCreditCardValid
);

Masc.Form.Validator.addDataType(
	'zpFormUSPhone',
	'A USA Phone Number',
	/^((\([1-9][0-9]{2}\) *)|([1-9][0-9]{2}[\-. ]?))(\d[ -]?){6}\d *(ex[t]? *[0-9]+)?$/,
	"Invalid US Phone Number",
	"Valid US Phone number needs to be in the form of 'xxx xxx-xxxx' For instance 312 123-1234. An extention can be added as ext xxxx. For instance 312 123-1234 ext 1234",
	null
);

Masc.Form.Validator.addDataType(
	'zpFormInternationalPhone',
	'An international Phone Number',
	/^\+\d{1,3}[ -]\d{2,3}[ -](\d[ -]?){6}\d *(ex[t]? *[0-9]+)?$/,
//	/^((\([1-9][0-9]{2}\) *)|([1-9][0-9]{2}[\-. ]?))[0-9]{3}[\-. ][0-9]{4} *(ex[t]? *[0-9]+)?$/,
	"Invalid international phone Number",
	"Valid internation phone number needs to be in the form of '+x xxx xxx-xxxx' For instance +1 234 567-9012. An extention can be added as ext xxxx. For instance +1 234 567-9012 ext 1234",
	null
);

Masc.Form.Validator.addDataType(
	'zpFormUSZip',
	'A USA Zip Number',
	/(^\d{5}$)|(^\d{5}-\d{4}$)/,
	"Invalid US Zip Code",
	"Valid US Zip number needs to be either in the form of '99999', for instance 94132 or '99999-9999' for instance 94132-3213",
	null
);

Masc.Form.Validator.addDataType(
	'zpFormDate',
	'A Valid Date',
	null,
	"Invalid Date",
	"Please enter a valid date",
	Masc.Form.Validator.isDateValid
);

Masc.Form.Validator.addDataType(
	'zpFormInt',
	'An Integer',
	null,
	"Not an integer",
	"Please enter an integer",
	function(number) {
		return /^\d+$/.test(number)
	}
);

Masc.Form.Validator.addDataType(
	'zpFormFloat',
	'A Floating Point Number',
	null,
	"Not a float",
	"Please enter a Floating Point Number",
	function(number) {
		var parsed = parseFloat(number);
		return (parsed == number);
	}
);
