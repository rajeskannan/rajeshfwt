// $Id: form.js 4322 2006-09-04 08:49:33Z shacka $
/**
 * @fileoverview Masc Form widget. Include this file in your HTML page.
 * Includes Masc Form modules: zpform.js, field.js, validator.js, utils.js.
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
 * Get path to this script
 * @private
 */

Masc.formPath = Masc.getPath();

// Include required scripts
Masc.Transport.include(Masc.formPath + 'zpform.js');
Masc.Transport.include(Masc.formPath + 'field.js');
Masc.Transport.include(Masc.formPath + 'validator.js');
Masc.Transport.include(Masc.formPath + 'utils.js');
