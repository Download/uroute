# uroute <sup><sub>1.1.0</sub></sup>
## Microscopically small universal router

[![Greenkeeper badge](https://badges.greenkeeper.io/Download/uroute.svg)](https://greenkeeper.io/)

[![npm](https://img.shields.io/npm/v/uroute.svg)](https://npmjs.com/package/uroute)
[![license](https://img.shields.io/npm/l/uroute.svg)](https://creativecommons.org/licenses/by/4.0/)
[![travis](https://img.shields.io/travis/Download/uroute.svg)](https://travis-ci.org/Download/uroute)
[![greenkeeper](https://img.shields.io/david/Download/uroute.svg)](https://greenkeeper.io/)
![mind BLOWN](https://img.shields.io/badge/mind-BLOWN-ff69b4.svg)

<sup><sub><sup><sub>.</sub></sup></sub></sup>

![uroute](https://rawgit.com/download/uroute/1.1.0/uroute.png)

<sup><sub><sup><sub>.</sub></sup></sub></sup>


## Installation

```sh
npm install --save uroute
```

## Require
```js
var route = require('uroute')
var match = route.match
// or
var route = require('uroute').route
var match = require('uroute').match

```

## Import
```js
import route, { match } from 'uroute'
// or
import { route, match } from 'uroute'
```

## Why
Basically a port of Universal Router (https://www.kriasoft.com/universal-router/)
by Konstantin Tarkus from Kriasoft LLC, this module does not use generators
or async functions, two upcoming features in Javascript. Cool as they are, these
currently require the [Babel](https://babeljs.io/) runtime, along with the
regenerator runtime/transform to be loaded. This added a lot of weight to my app
which does not need these, so I refactored Universal Router to not depend on
these features. The result is this module. It passes all original tests, though
I had to make some changes (as the tests were also using async functions).

## Usage
Define a route tree. This can be done with the `route` function:

```js
var routes = [
  route('/', function(){
    return 'Welcome to the homepage of Cool Corp!'
  },

  route('/products', function(){
    return 'View our cool products'
  }),

  route('/about', function(){
    return 'About Cool Corp'
  })
]
```

This will create a route tree that looks like this:
```js
[
	{
		path: '/',
		action: [Function]
	},
	{
		path: '/products',
		action: [Function]
	},
	{
		path: 'about',
		action: [Function]
	}
]
```

> The use of the `route` function is purely optional syntax sugar for your convenience. If you want, you can create the route tree 'by hand' so to speak.

Once you have created a route tree, use `match` to find the matching nodes and invoke any actions on them:

```js
var matched = match(routes, '/products')
```

`match` returns a Promise. Invoke it's `then` method to get access to the response:

```js
matched.then(function(response){
	console.info(response)  //  View our cool products
})
```

`match` runs through all the routes in the tree, executing the actions on those
routes that match the given url, until it finds one that resolves to a response
that is not `undefined`. The first such response found is used.

## Parameters
We can use parameters in our routes and they will be captured and made available
on the `params` object of the `context` that is passed to our actions:

```js
var routes = route('/:one/:two', function(context){
	return context.params.one + ', ' + context.params.two + ', ...';
})

match(routes, '/1/2').then(function(result){
	console.log(result) // 1, 2, ...
})
match(routes, '/un/deux').then(function(result){
	console.log(result) // 'un, deux, ...'
})
match(routes, '/eins/zwei').then(function(result){
	console.log(result) // 'eins, zwei, ...'
})
```
For more details refer to the documentation of [path-to-regexp](https://www.npmjs.com/package/path-to-regexp).

## Async
Route actions may return promises.

## Middleware
Route actions may act as middleware by utilizing the `next` and `end` functions
passed to them on the `context` parameter. Let's create a simple middleware
function to modify the repsonse of any of it's child routes:

```js
function greeterMiddleware(context) {
	// use context.next() to get the next response in the chain
	return context.next().then(function(response){
		// augment the response in some way
		response = 'Hello' + (response ? ', ' + response : '')
		// return the modified response
		return response
	})
}
```

Now we'll set up our routes to have the middleware on the parent, like this:

```js
var routes =
route('/hello',
	greeterMiddleware,
	[
		route('/world', function(){
			return 'world!'
		})
		,
		route('/planet', function(){
			return 'planet!'
		})
	]
)
```
The `greeterMiddleware` will modify the responses of it's children:

```js
match(routes, '/hello').then(function(response){
	console.log(response)  // Hello
})

match(routes, '/hello/world').then(function(response){
	console.log(response)  // Hello, world!
})

match(routes, '/hello/planet').then(function(response){
	console.log(response)  // Hello, planet!
})
```

## Issues

Add an issue in this project's [issue tracker](https://github.com/download/uroute/issues)
to let me know of any problems you find, or questions you may have.


## Copyright

Copyright 2016 by [Stijn de Witt](http://StijnDeWitt.com). Some rights reserved.


## License

[Creative Commons Attribution 4.0 (CC-BY-4.0)](https://creativecommons.org/licenses/by/4.0/)

Based on Universal Router (https://www.kriasoft.com/universal-router/)
Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
License: MIT. SEE LICENSE-universal-router.txt.
