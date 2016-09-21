/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: MIT. SEE LICENSE-universal-router.txt.
 */

var sinon = require('sinon')
var expect = require('chai').expect

var route = require('../').route
var match = require('../').match

describe('Example 1', function(){

	it('demonstrates basic routing' , function(){
		var routes = [
			route('/', function(){
				return 'Welcome to the homepage of Cool Corp!'
			}),

			route('/products', function(){
				return 'View our cool products'
			}),

			route('/about', function(){
				return 'About Cool Corp'
			})
		]
		return Promise.all([
			match(routes, '/').then(function(result){
				expect(result).to.equal('Welcome to the homepage of Cool Corp!');
			}),
			match(routes, '/products').then(function(result){
				expect(result).to.equal('View our cool products');
			}),
			match(routes, '/about').then(function(result){
				expect(result).to.equal('About Cool Corp');
			})
		])
	})
})


describe('Example 2', function(){

	it('demonstrates route parameters', function(){

		var routes = route('/:one/:two', function(context){
			return context.params.one + ', ' + context.params.two + ', ...';
		})

		return Promise.all([
			match(routes, '/1/2').then(function(result){
				expect(result).to.equal('1, 2, ...')
			})
			,
			match(routes, '/un/deux').then(function(result){
				expect(result).to.equal('un, deux, ...')
			})
			,
			match(routes, '/eins/zwei').then(function(result){
				expect(result).to.equal('eins, zwei, ...')
			})
		])
	})
})


describe('Example 3', function(){

	it('demonstrates using route actions as middleware', function(){

		function greeterMiddleware(context) {
			// use context.next() to get the next response in the chain
			return context.next().then(function(response){
				// augment the response in some way
				response = 'Hello' + (response ? ', ' + response : '')
				// return the modified response
				return response
			})
		}

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

		return Promise.all([
			match(routes, '/hello').then(function(response){
				expect(response).to.equal('Hello')
			})
			,
			match(routes, '/hello/world').then(function(response){
				expect(response).to.equal('Hello, world!')
			})
			,
			match(routes, '/hello/planet').then(function(response){
				expect(response).to.equal('Hello, planet!')
			})
		])
	})
})

