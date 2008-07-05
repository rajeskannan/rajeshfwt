// $Id: zpgrid.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Masc Grid widget. Include this file in your HTML page.
 * Includes base Masc Grid modules: zpgrid-core.js, zpgrid-convert.js,
 * zpgrid-html.js, zpgrid-output.js. To extend grid with other features like
 * XML, query, editing, export, or make it compatible with previous version,
 * include respective modules manually in your HTML page.
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
 * Path to Masc Grid scripts.
 * @private
 */
Masc.gridPath = Masc.getPath();

// Include required scripts
Masc.Transport.include(Masc.gridPath + 'zpgrid-core.js');
Masc.Transport.include(Masc.gridPath + 'zpgrid-convert.js');
Masc.Transport.include(Masc.gridPath + 'zpgrid-html.js');
Masc.Transport.include(Masc.gridPath + 'zpgrid-output.js');
