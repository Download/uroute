/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: Apache-2.0. SEE LICENSE-universal-router.txt.
 */
module.exports = function iteratorToArray(iterator) {
	var loop, results = [];
	while (! (loop = iterator.next()).done) {
		results.push(loop.value)
	}
	return results
}