/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: MIT. SEE LICENSE-universal-router.txt.
 */
if (typeof Promise == 'undefined') {require('promise-polyfill')}

require('./route.spec.js')
require('./match.spec.js')
require('./matchRoute.spec.js')
require('./matchPath.spec.js')
require('./example.spec.js')
