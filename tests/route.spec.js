/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: Apache-2.0. SEE LICENSE-universal-router.txt.
 */

var expect = require('chai').expect
var route = require('../')

describe('route(path [, context] [, action], [, children | child] [, child] ..)', function(){

  it('is a function', function(){
    expect(route).to.be.a.function
  })

  it('accepts a required `path` argument', function(){
    var result = route('/mypath');
    expect(result).to.deep.equal({path: '/mypath'})
  })

	it('accepts an optional `context` argument', function(){
    var result = route('/mypath', {test:'test'});
    expect(result).to.deep.equal({path: '/mypath', test:'test'})
  })

	it('accepts an optional `action` argument', function(){
		var action = function(){}
    var result = route('/mypath', action);
    expect(result).to.deep.equal({path: '/mypath', action:action})
  })

	it('accepts both `context` and `action` arguments simultaneously', function(){
		var action = function(){}
    var result = route('/mypath', {test:'test'}, action);
    expect(result).to.deep.equal({path: '/mypath', test:'test', action:action})
  })

	it('accepts an optional `children` argument, which is an array', function(){
    var result = route('/mypath', [route('/a')]);
    expect(result).to.deep.equal({path: '/mypath', children:[{path:'/a'}]})
  })

	it('accepts optional `child` arguments following `context` or `action`', function(){
    var result = route('/mypath', {test:'test'},
			route('/a'),
			route('/b')
		)
    expect(result).to.deep.equal({path: '/mypath', test:'test', children:[
			{path:'/a'},
			{path:'/b'}
		]})

		var action = function(){}
		var result = route('/mypath', action,
			route('/a'),
			route('/b')
		)
		expect(result).to.deep.equal({path: '/mypath', action:action, children:[
			{path:'/a'},
			{path:'/b'}
		]})
  })

	it('accepts optional `child` arguments following `children`', function(){
    var result = route('/mypath', [],
			route('/a'),
			route('/b')
		);
    expect(result).to.deep.equal({path: '/mypath', children:[
			{path:'/a'},
			{path:'/b'}
		]})
  })

	it('returns a route tree', function(){
		function greeting(ctx){}
		function awesome(ctx){}
		function boring(ctx){}
		function world(ctx){}
		function planet(ctx){}

		var routes =

		route('/mypath', greeting,
			route('/a', awesome,
				route('/w', world),
				route('/p', planet)
			),
			route('/b', boring,
				route('/w', world),
				route('/p', planet)
			)
		)

    expect(routes).to.deep.equal(
			{path: '/mypath', action:greeting, children:[
				{path:'/a', action:awesome, children:[
					{path:'/w', action:world},
					{path:'/p', action:planet}
				]},
				{path:'/b', action:boring, children:[
					{path:'/w', action:world},
					{path:'/p', action:planet}
				]}
			]}
		)
	})
})
