/**
 * $Id: calendar.js 4322 2006-09-04 08:49:33Z shacka $
 * @fileoverview Masc Calendar widget. Include this file in your HTML page.
 * Includes Masc Calendar modules: calendar-core.js, calendar-date-core.js, calendar-setup.js.
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
 * @private Get path to this script
 */
if (!window.Masc || (Masc && !Masc.include)) {
	alert("You need to include Masc.js file!");
} else {
	Masc.calendarPath = Masc.getPath();
	
	// Include required scripts
	Masc.Transport.include(Masc.calendarPath + 'calendar-core.js');
	Masc.Transport.include(Masc.calendarPath + 'calendar-date-core.js');
	Masc.Transport.include(Masc.calendarPath + 'calendar-setup.js');
}

window.calendar = null;		/**< global object that remembers the calendar */

// initialize the preferences object;
// embed it in a try/catch so we don't have any surprises
try {
	Masc.Calendar.loadPrefs();
} catch(e) {};
