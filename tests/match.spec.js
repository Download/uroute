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


describe('match(routes, { path, ...context })', function(){

	it('should return a Promise', function(){
		var routes = []
		var matched = match(routes, '/')
		expect(matched instanceof Promise)
	})

  it('should resolve [undefined] if a route was not found', function(){
		return match([], '/').then(function(result){
			expect(result).to.be.undefined
		})
	})

	it('should execute the matching route\'s action method and return its result', function(){
		var action = sinon.spy(() => 'b')
		var routes = [
			{ path: '/a', action },
		]
		return match(routes, '/a').then(function(result){
			expect(action.calledOnce).to.be.true;
			expect(action.args[0][0]).to.have.property('path', '/a')
			expect(result).to.be.equal('b')
		})
	})

	it('should find the first route whose action method !== [undefined]', () => {
		var action1 = sinon.spy(() => undefined)
		var action2 = sinon.spy(() => 'b')
		var action3 = sinon.spy(() => 'b')
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

	it('should be able to pass context variables to action methods', function(){
		var action = sinon.spy();
		var routes = [
			{ path: '/a', action },
		]
		return match(routes, { path: '/a', test: 'b' }).then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.property('path', '/a')
			expect(action.args[0][0]).to.have.property('test', 'b')
		})
	})

	it('should not call action methods of routes that don\'t match the URL path', function() {
		var action = sinon.spy()
		var routes = [
			{ path: '/a', action },
		]
		return match(routes, '/b').then(function(result){
			expect(action.called).to.be.false
		})
	})

	it('should asynchronously route actions', function(){
		var routes = [
			{ path: '/a', action: function(){return 'b'} },
		]
		return match(routes, '/a').then(function(result){
			expect(result).to.be.equal('b');
		})
	})

	it('URL parameters are captured and added to context.params', function(){
		var action = sinon.spy();
		var routes = [
			{ path: '/:one/:two', action },
		]
		return match(routes, { path: '/a/b' }).then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.deep.property('params.one', 'a')
			expect(action.args[0][0]).to.have.deep.property('params.two', 'b')
		})
	})

  it('should support next() across multiple routes', function(){
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

	it('should support parametrized routes 1', function(){
		var action = sinon.spy()
		var routes = [
		  { path: '/path/:a/other/:b', action },
		]
		return match(routes, '/path/1/other/2').then(function(result){
			expect(action.calledOnce).to.be.true
			expect(action.args[0][0]).to.have.deep.property('params.a', '1')
			expect(action.args[0][0]).to.have.deep.property('params.b', '2')
			expect(action.args[0][1]).to.have.property('a', '1')
			expect(action.args[0][1]).to.have.property('b', '2')
		})
	})

	it('should support child routes (1)', function(){
		var action = sinon.spy();
		var routes = [
			{
				path: '/',
				action,
				children: [
					{
						path: '/a',
						action,
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

	it('should support child routes (2)', function(){
		var action = sinon.spy();
		var routes = [
			{
				path: '/a',
				action,
				children: [
					{
						path: '/b',
						action,
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

	it('should support child routes (3)', function(){
		var action1 = sinon.spy(() => undefined);
		var action2 = sinon.spy(() => undefined);
		var action3 = sinon.spy(() => undefined);
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

	it('should re-throw an error', function(){
		var error = new Error('test error');
		var routes = [
			{
				path: '/a',
				action() { throw error; },
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

	it('should redirect to an error page if it exists', function(){
		var error = new Error('test error')
		var action = sinon.spy(() => 'b')
		var routes = [
			{
			  path: '/a',
			  action() { throw error; },
			},
			{
			  path: '/error',
			  action,
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
