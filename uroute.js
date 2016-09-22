/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: MIT. SEE LICENSE-universal-router.txt.
 */

var parse = require('url').parse
var pathToRegExp = require('path-to-regexp')


function route() {
	var args = Array.prototype.slice.call(arguments), path = args.shift(),
			next = args.shift(), ctx = {}, action, children
	if (typeof next == 'object' && (! ('length' in next))) {ctx = next; next = args.shift()}
	if (typeof next == 'function') {action = next; next = args.shift()}
	if (typeof next == 'object' && ('length' in next)) {children = next; next = null}
	else if (next) {children = [next]}
	if (args.length) {children = (children || []).concat(args)}
	var result = extend({path:path}, ctx)
	if (typeof action == 'function') {result.action = action}
	if (typeof children == 'object') {result.children = children}
	return result
}


function match(routes, ctx) {
	var context = typeof ctx === 'string' || ctx instanceof String ? {path: ctx} : ctx,
			root = Array.isArray(routes) ? { path: '/', children: routes } : routes,
			errorRoute = root.children && root.children.filter(function(x){return x.path === '/error'})[0],
			match = matchRoute(root, '', context.path), result, value, done = false

	context.next = function() {
		var promise = Promise.resolve(), next = match.next()
		value = next.value; done = next.done
		if (!done && value && value.route.action) {
			var newCtx = extend({}, context, next.value)
			try {promise = Promise.resolve(value.route.action(newCtx, newCtx.params))}
			catch(err) {promise = Promise.reject(err)}
			if (errorRoute) {promise = promise.catch(function(err){
				err.status = err.status || 500
				newCtx.error = err
				return errorRoute.action(newCtx, newCtx.params)
			})}
		}
		return promise
	}

  context.end = function(data) {
		result = data;
		done = true;
	}

	function run() {
		return context.next().then(function(r){
			if (r !== undefined) {result = r; done = true}
			if (done) {return result}
			return run()
		})
	}

	return run().then(function(r){
		if (r === undefined && errorRoute) {
	    context.error = new Error('Not found')
	    context.error.status = 404
	    return errorRoute.action(context, {})
	  }
		return r
	})
}


function matchRoute(route, baseUrl, path) {
	var match, childMatches, childIdx = 0
	// simulate a generator function by returning an object with a `next` method
	return {next: function(){
		if (!route.children) {
			if (! match) {
				match = matchPath(true, route.path, path)
				if (match) {
					return {
						done: false,
						value: {
							route:route,
							baseUrl:baseUrl,
							path: match.path,
							params: match.params
						}
					}
				}
			}
			return {done:true, value:undefined}
		}

		if (route.children) {
			if (! match) {
				match = matchPath(false, route.path, path);
				if (match) {
					return {
						done: false,
						value: {
							route:route,
							baseUrl:baseUrl,
							path: match.path,
							params: match.params,
						}
					}
				}
			}
			while (childIdx < route.children.length) {
				if (!childMatches) {
					var childRoute = route.children[childIdx]
					var newPath = path.substr(match.path.length);
					childMatches = matchRoute(childRoute,
						baseUrl + (match.path === '/' ? '' : match.path),
						newPath.startsWith('/') ? newPath : `/${newPath}`
					)
				}
				var childMatch = childMatches.next()
				if (childMatch.done) {
					childIdx++
					childMatches = null
				}
				else {
					return {
						done: false,
						value: childMatch.value
					}
				}
			}
			return {done:true, value:undefined}
		}
	}}
}


function matchPath(end, routePath, urlPath) {
	var key = routePath + '|' + end,
			regexp = cache[key]
	if (!regexp) {
		var keys = []
		regexp = { pattern: pathToRegExp(routePath, keys, { end:end }), keys:keys }
		cache[key] = regexp
	}
	var m = regexp.pattern.exec(urlPath);
	if (!m) {return null}
	var params = {}, path = m.shift(), len=m.length, i
	for (i=0; i<len; i++) {
		params[regexp.keys[i].name] = m[i] !== undefined ? decode(m[i]) : undefined
	}
	return { path: path === '' ? '/' : path, params:params }
}


function decode(val) {
	return typeof val !== 'string' ? val : decodeURIComponent(val)
}


function extend(out) {
  for (var src, i=1; i<arguments.length; i++) {
    if ((src = arguments[i]) !== undefined && src !== null) {
      for (var key in src) {out[key] = src[key]}
    }
  }
  return out;
}

var cache = {}

route.route = route
route.match = match
route.match.matchRoute = matchRoute
route.match.matchPath = matchPath
module.exports = route