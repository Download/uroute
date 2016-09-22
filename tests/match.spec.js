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
var match = require('../').match


describe('match(routes, { path, ...context} )', function(){

	it('returns a Promise', function(){
		var routes = []
		var matched = match(routes, '/')
		expect(matched instanceof Promise)
	})

  it('resolves to [undefined] if a route was not found', function(){
		return match([], '/').then(function(result){
			expect(result).to.be.undefined
		})
	})

	it('executes the matching route\'s action method and returns its result', function(){
		var action = sinon.spy(function(){return 'b'})
		var routes = [
			{ path: '/a', action:action },
		]
		return match(routes, '/a').then(function(result){
			expect(action.calledOnce).to.be.true;
			expect(action.args[0][0]).to.have.property('path', '/a')
			expect(result).to.be.equal('b')
		})
	})

	it('finds the first route whose action method !== [undefined]', function(){
		var action1 = sinon.spy(function(){})
		var action2 = sinon.spy(function(){return 'b'})
		var action3 = sinon.spy(function(){return 'b'})
		var routes = [
			{ path: '/a', action: action1 },
			{ path: '/a', action: action2 },
			{ path: '/a', action: action3 },
		]
		return match(routes, '/a').then(function(result){
			expect(result).to.be.equal('b')
			expect(action1.calledOnce).to.be.true
			expect(action2.calledOnce).to.be.true
			expect(action3.called).to.be.false
		})
	})

	it('is able to pass context variables to action methods', function(){
		var action = sinon.spy();
		var routes = [
			{ path: '/a', action:action },
		]
		return match(routes, { path: '/a', test: 'b' }).then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.property('path', '/a')
			expect(action.args[0][0]).to.have.property('test', 'b')
		})
	})

	it('does not call action methods of routes that don\'t match the URL path', function() {
		var action = sinon.spy()
		var routes = [
			{ path: '/a', action:action },
		]
		return match(routes, '/b').then(function(result){
			expect(action.called).to.be.false
		})
	})

	it('asynchronously routes actions', function(){
		var routes = [
			{ path: '/a', action: function(){return 'b'} },
		]
		return match(routes, '/a').then(function(result){
			expect(result).to.be.equal('b');
		})
	})

	it('captures URL parameters and adds them to `context.params`', function(){
		var action = sinon.spy();
		var routes = [
			{ path: '/:one/:two', action:action },
		]
		return match(routes, { path: '/a/b' }).then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.deep.property('params.one', 'a')
			expect(action.args[0][0]).to.have.deep.property('params.two', 'b')
		})
	})

  it('supports `next()` across multiple routes', function(){
		var log = [];
		var routes = [
			{
				path: '/test',
				action: function(context) {
					log.push(1);
					context.next()  // should cause log.push(2)
					.then(function(){log.push(3)})
				},
			},
			{
				path: '/test',
				action: function(){
					log.push(2)
				}
			},
		]

		return match(routes, '/test').then(function(result){
			expect(log).to.be.deep.equal([1, 2, 3])
		})
  })

	it('supports parametrized routes 1', function(){
		var action = sinon.spy()
		var routes = [
		  { path: '/path/:a/other/:b', action:action },
		]
		return match(routes, '/path/1/other/2').then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.deep.property('params.a', '1')
			expect(action.args[0][0]).to.have.deep.property('params.b', '2')
			expect(action.args[0][1]).to.have.property('a', '1')
			expect(action.args[0][1]).to.have.property('b', '2')
		})
	})

	it('supports child routes (1)', function(){
		var action = sinon.spy();
		var routes = [
			{
				path: '/',
				action:action,
				children: [
					{
						path: '/a',
						action:action,
					},
				],
			},
		];

		return match(routes, '/a').then(function(result){
			expect(action.calledTwice).to.be.true
			expect(action.args[0][0]).to.have.property('path', '/')
			expect(action.args[1][0]).to.have.property('path', '/a')
		})
	})

	it('supports child routes (2)', function(){
		var action = sinon.spy();
		var routes = [
			{
				path: '/a',
				action:action,
				children: [
					{
						path: '/b',
						action:action,
					},
				],
			},
		];

		return match(routes, '/a/b').then(function(result){
			expect(action.calledTwice).to.be.true
			expect(action.args[0][0]).to.have.property('path', '/a')
			expect(action.args[1][0]).to.have.property('path', '/b')
		})
	})

	it('supports child routes (3)', function(){
		var action1 = sinon.spy(function(){});
		var action2 = sinon.spy(function(){});
		var action3 = sinon.spy(function(){});
		var routes = [
			{
				path: '/a',
				action: action1,
				children: [
					{
						path: '/b',
						action: action2,
					},
				],
			},
			{
				path: '/a/b',
				action: action3,
			},
		];

		return match(routes, '/a/b').then(function(result){
			expect(action1.calledOnce).to.be.true
			expect(action1.args[0][0]).to.have.property('baseUrl', '')
			expect(action1.args[0][0]).to.have.property('path', '/a')
			expect(action2.calledOnce).to.be.true
			expect(action2.args[0][0]).to.have.property('baseUrl', '/a')
			expect(action2.args[0][0]).to.have.property('path', '/b')
			expect(action3.calledOnce).to.be.true
			expect(action3.args[0][0]).to.have.property('baseUrl', '')
			expect(action3.args[0][0]).to.have.property('path', '/a/b')
		})
	})

	it('re-throws errors', function(){
		var error = new Error('test error')
		var routes = [
			{
				path: '/a',
				action: function() { throw error },
			},
		]

		return match(routes, '/a').then(function(result){
			return Promise.reject()
		})
		.catch (function(err) {
			expect(err).to.be.equal(error)
			return Promise.resolve()
		})
	})

	it('redirects to an error page if it exists', function(){
		var error = new Error('test error')
		var action = sinon.spy(function(){return 'b'})
		var routes = [
			{
			  path: '/a',
			  action: function() { throw error },
			},
			{
			  path: '/error',
			  action:action,
			},
		]

		return match(routes, '/a').then(function(result){
			expect(result).to.be.equal('b')
			expect(action.args[0][0]).to.have.property('error', error)
			expect(action.args[0][0]).to.have.deep.property('error.status', 500)
		})
	})

	it('allows for complex manipulation of the response ', function(){
		function greeting(ctx){return ctx.next().then(function(response){return 'Hello, ' + response})}
		function awesome(ctx){return ctx.next().then(function(response){return 'awesome ' + response})}
		function boring(ctx){return ctx.next().then(function(response){return 'boring ' + response})}
		function world(ctx){return 'world!'}
		function planet(ctx){return 'planet!'}

		var routes = {path: '/mypath', action:greeting, children:[
			{path:'/a', action:awesome, children:[
				{path:'/w', action:world},
				{path:'/p', action:planet}
			]},
			{path:'/b', action:boring, children:[
				{path:'/w', action:world},
				{path:'/p', action:planet}
			]}
		]}

		return match(routes, '/mypath/a/w').then(function(result){
			expect(result).to.equal('Hello, awesome world!')
		})
	})

})
