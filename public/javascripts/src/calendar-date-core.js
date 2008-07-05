/* $Id: calendar-date-core.js 4322 2006-09-04 08:49:33Z shacka $ */
// BEGIN: DATE OBJECT PATCHES

/** \defgroup DateExtras Augmenting the Date object with some utility functions
 * and variables.
 */
//@{

Date._MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; /**< Number of days in each month */

Date.SECOND = 1000;		/**< One second has 1000 milliseconds. */
Date.MINUTE = 60 * Date.SECOND;	/**< One minute has 60 seconds. */
Date.HOUR   = 60 * Date.MINUTE;	/**< One hour has 60 minutes. */
Date.DAY    = 24 * Date.HOUR;	/**< One day has 24 hours. */
Date.WEEK   =  7 * Date.DAY;	/**< One week has 7 days. */

/** Returns the number of days in the month.  The \em month parameter is
 * optional; if not passed, the current month of \b this Date object is
 * assumed.
 *
 * @param month [int, optional] the month number, 0 for January.
 */
Date.prototype.getMonthDays = function(month) {
	var year = this.getFullYear();
	if (typeof month == "undefined") {
		month = this.getMonth();
	}
	if (((0 == (year%4)) && ( (0 != (year%100)) || (0 == (year%400)))) && month == 1) {
		return 29;
	} else {
		return Date._MD[month];
	}
};

/** Returns the number of the current day in the current year. */
Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.floor(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
	var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var DoW = d.getDay();
	d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
	var ms = d.valueOf(); // GMT
	d.setMonth(0);
	d.setDate(4); // Thu in Week 1
	return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
};

/** Checks dates equality.  Checks time too. */
Date.prototype.equalsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()) &&
		(this.getHours() == date.getHours()) &&
		(this.getMinutes() == date.getMinutes()));
};

/** Checks dates equality.  Ignores time. */
Date.prototype.dateEqualsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function(date) {
	var tmp = new Date(date);
	this.setDate(1);
	this.setFullYear(tmp.getFullYear());
	this.setMonth(tmp.getMonth());
	this.setDate(tmp.getDate());
};

/** Prints the date in a string according to the given format.
 *
 * The format (\b str) may contain the following specialties:
 *
 * - %%a - Abbreviated weekday name
 * - %%A - Full weekday name
 * - %%b - Abbreviated month name
 * - %%B - Full month name
 * - %%C - Century number
 * - %%d - The day of the month (00 .. 31)
 * - %%e - The day of the month (0 .. 31)
 * - %%H - Hour (00 .. 23)
 * - %%I - Hour (01 .. 12)
 * - %%j - The day of the year (000 .. 366)
 * - %%k - Hour (0 .. 23)
 * - %%l - Hour (1 .. 12)
 * - %%m - Month (01 .. 12)
 * - %%M - Minute (00 .. 59)
 * - %%n - A newline character
 * - %%p - "PM" or "AM"
 * - %%P - "pm" or "am"
 * - %%S - Second (00 .. 59)
 * - %%s - Number of seconds since Epoch
 * - %%t - A tab character
 * - %%W - The week number (as per ISO 8601)
 * - %%u - The day of week (1 .. 7, 1 = Monday)
 * - %%w - The day of week (0 .. 6, 0 = Sunday)
 * - %%y - Year without the century (00 .. 99)
 * - %%Y - Year including the century (ex. 1979)
 * - %%% - A literal %% character
 *
 * They are almost the same as for the POSIX strftime function.
 *
 * @param str [string] the format to print date in.
 */
Date.prototype.print = function (str) {
	var m = this.getMonth();
	var d = this.getDate();
	var y = this.getFullYear();
	var wn = this.getWeekNumber();
	var w = this.getDay();
	var s = {};
	var hr = this.getHours();
	var pm = (hr >= 12);
	var ir = (pm) ? (hr - 12) : hr;
	var dy = this.getDayOfYear();
	if (ir == 0)
		ir = 12;
	var min = this.getMinutes();
	var sec = this.getSeconds();
	s["%a"] = Masc.Calendar.i18n(w, "sdn"); // abbreviated weekday name [FIXME: I18N]
	s["%A"] = Masc.Calendar.i18n(w, "dn"); // full weekday name
	s["%b"] = Masc.Calendar.i18n(m, "smn"); // abbreviated month name [FIXME: I18N]
	s["%B"] = Masc.Calendar.i18n(m, "mn"); // full month name
	// FIXME: %c : preferred date and time representation for the current locale
	s["%C"] = 1 + Math.floor(y / 100); // the century number
	s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
	s["%e"] = d; // the day of the month (range 1 to 31)
	// FIXME: %D : american date style: %m/%d/%y
	// FIXME: %E, %F, %G, %g, %h (man strftime)
	s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
	s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
	s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
	s["%k"] = hr ? hr :  "0"; // hour, range 0 to 23 (24h format)
	s["%l"] = ir;		// hour, range 1 to 12 (12h format)
	s["%m"] = (m < 9) ? ("0" + (1+m)) : (1+m); // month, range 01 to 12
	s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
	s["%n"] = "\n";		// a newline character
	s["%p"] = pm ? "PM" : "AM";
	s["%P"] = pm ? "pm" : "am";
	// FIXME: %r : the time in am/pm notation %I:%M:%S %p
	// FIXME: %R : the time in 24-hour notation %H:%M
	s["%s"] = Math.floor(this.getTime() / 1000);
	s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
	s["%t"] = "\t";		// a tab character
	// FIXME: %T : the time in 24-hour notation (%H:%M:%S)
	s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
  s["%u"] = (w == 0) ? 7 : w; // the day of the week (range 1 to 7, 1 = MON)
	s["%w"] = w ? w : "0";		// the day of the week (range 0 to 6, 0 = SUN)
	// FIXME: %x : preferred date representation for the current locale without the time
	// FIXME: %X : preferred time representation for the current locale without the date
	s["%y"] = ('' + y).substr(2, 2); // year without the century (range 00 to 99)
	s["%Y"] = y;		// year with the century
	s["%%"] = "%";		// a literal '%' character

	var re = /%./g;
	var a = str.match(re);
	for (var i = 0; i < a.length; i++) {
		var tmp = s[a[i]];
		if (tmp) {
			re = new RegExp(a[i], 'g');
			str = str.replace(re, tmp);
		}
	}

	return str;
};

/**
 * Parses a date from a string in the specified format.
 *
 * @param str [string] the date as a string
 * @param fmt [string] the format to try to parse the date in
 *
 * @return [Date] a date object containing the parsed date or \b null if for
 * some reason the date couldn't be parsed.
 */
Date.parseDate = function (str, fmt) {
	// Konqueror
	if (!str)
		return new Date();
	var y = 0;
	var m = -1;
	var d = 0;
	var a = str.split(/\W+/);
	var b = fmt.match(/%./g);
	var i = 0, j = 0;
	var hr = 0;
	var min = 0;
	var sec = 0;
	for (i = 0; i < a.length; ++i) {
		if (!a[i])
			continue;
		switch (b[i]) {
		    case "%d":
		    case "%e":
			d = parseInt(a[i], 10);
			break;

		    case "%m":
			m = parseInt(a[i], 10) - 1;
			break;

		    case "%Y":
		    case "%y":
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
			break;

		    case "%b":
			for (j = 0; j < 12; ++j)
				if (Masc.Calendar.i18n(j, "smn").toLowerCase() == a[i].toLowerCase()) {
					m = j;
					break;
				}
			break;

		    case "%B":
			for (j = 0; j < 12; ++j)
				if (Masc.Calendar.i18n(j, "mn").toLowerCase() == a[i].toLowerCase()) {
					m = j;
					break;
				}
			break;

		    case "%H":
		    case "%I":
		    case "%k":
		    case "%l":
			hr = parseInt(a[i], 10);
			break;

		    case "%P":
		    case "%p":
			if (/pm/i.test(a[i]) && hr < 12)
				hr += 12;
			if (/am/i.test(a[i]) && hr == 12)
				hr = 0;
			break;

		    case "%M":
			min = parseInt(a[i], 10);
			break;

		    case "%S":
			sec = parseInt(a[i], 10);
			break;
		}
	}
	//Fix for the mm/dd/yy bug
	var validDate = !isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(hr) && !isNaN(min) && !isNaN(sec);
	if (!validDate) {return null;}
	if (y != 0 && m != -1 && d != 0)
		return new Date(y, m, d, hr, min, sec);
	y = 0; m = -1; d = 0;
	for (i = 0; i < a.length; ++i) {
		if (a[i].search(/[a-zA-Z]+/) != -1) {
			var t = -1;
			for (j = 0; j < 12; ++j)
				if (Masc.Calendar.i18n(j, "mn").substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {
					t = j;
					break;
				}
			if (t != -1) {
				if (m != -1)
					d = m+1;
				m = t;
			}
		} else if (parseInt(a[i], 10) <= 12 && m == -1) {
			m = a[i]-1;
		} else if (parseInt(a[i], 10) > 31 && y == 0) {
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
		} else if (d == 0) {
			d = a[i];
		}
	}
	if (y == 0) {
		var today = new Date();
		y = today.getFullYear();
	}
	if (m != -1 && d != 0)
		return new Date(y, m, d, hr, min, sec);
	return null;
};

Date.prototype.__msh_oldSetFullYear = Date.prototype.setFullYear; /**< save a reference to the original setFullYear function */

/**
 * This function replaces the original Date.setFullYear() with a "safer"
 * function which makes sure that the month or date aren't modified (unless in
 * the exceptional case where the date is February 29 but the new year doesn't
 * contain it).
 *
 * @param y [int] the new year to move this date to
 */
Date.prototype.setFullYear = function(y) {
	var d = new Date(this);
	d.__msh_oldSetFullYear(y);
	if (d.getMonth() != this.getMonth())
		this.setDate(28);
	this.__msh_oldSetFullYear(y);
};

/**
 * This function compares only years, months and days of two date objects.
 *
 * @return [int] -1 if date1>date2, 1 if date2>date1 or 0 if they are equal
 *
 * @param date1 [Date] first date to compare
 * @param date1 [Date] second date to compare
 */
Date.prototype.compareDatesOnly = function (date1,date2) { 
	var year1 = date1.getYear();
	var year2 = date2.getYear(); 
	var month1 = date1.getMonth(); 
	var month2 = date2.getMonth(); 
	var day1 = date1.getDate(); 
	var day2 = date2.getDate(); 
	if (year1 > year2) { return -1;	} 
	if (year2 > year1) { return 1; } //years are equal 
	if (month1 > month2) { return -1; } 
	if (month2 > month1) { return 1; } //years and months are equal 
	if (day1 > day2) { return -1; } 
	if (day2 > day1) { return 1; } //days are equal 
	return 0; 
}

//@}

// END: DATE OBJECT PATCHES
