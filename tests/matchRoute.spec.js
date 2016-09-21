/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: MIT. SEE LICENSE-universal-router.txt.
 */

var expect = require('chai').expect
var iteratorToArray = require('./iteratorToArray')
var matchRoute = require('../').match.matchRoute

describe('matchRoute(route, baseUrl, path)', function(){

  it('should match 0 routes (1)', function(){
    var route = {
      path: '/',
    }
    var result = Array.from(matchRoute(route, '', '/a'))
    expect(result).to.have.lengthOf(0)
  })

  it('should match 0 routes (2)', function(){
    var route = {
      path: '/a',
    }
    var result = Array.from(matchRoute(route, '', '/b'))
    expect(result).to.have.lengthOf(0)
  })

	it('should match 1 route (1)', function(){
		var route = {
			path: '/',
		}
		var result = iteratorToArray(matchRoute(route, '', '/'))
    expect(result).to.have.lengthOf(1)
    expect(result[0]).to.have.property('baseUrl', '')
    expect(result[0]).to.have.property('path', '/')
    expect(result[0]).to.have.deep.property('route.path', '/')
  })

  it('should match 1 route (2)', function(){
    var route = {
      path: '/a',
    }
    var result = iteratorToArray(matchRoute(route, '', '/a'))
    expect(result).to.have.lengthOf(1)
    expect(result[0]).to.have.property('baseUrl', '')
    expect(result[0]).to.have.property('path', '/a')
    expect(result[0]).to.have.deep.property('route.path', '/a')
  })

  it('should match 2 routes (1)', function(){
    var route = {
      path: '/',
      children: [
        {
          path: '/a',
        },
      ],
    }
    var result = iteratorToArray(matchRoute(route, '', '/a'))
    expect(result).to.have.lengthOf(2)
    expect(result[0]).to.have.property('baseUrl', '')
    expect(result[0]).to.have.property('path', '/')
    expect(result[0]).to.have.deep.property('route.path', '/')
    expect(result[1]).to.have.property('baseUrl', '')
    expect(result[1]).to.have.property('path', '/a')
    expect(result[1]).to.have.deep.property('route.path', '/a')
  })

  it('should match 2 routes (2)', function(){
    var route = {
      path: '/a',
      children: [
        {
          path: '/b',
          children: [
            {
              path: '/c',
            }
          ]
        }
      ]
    }
    var result = iteratorToArray(matchRoute(route, '', '/a/b/c'))
    expect(result).to.have.lengthOf(3)
    expect(result[0]).to.have.property('baseUrl', '')
    expect(result[0]).to.have.deep.property('route.path', '/a')
    expect(result[1]).to.have.property('baseUrl', '/a')
    expect(result[1]).to.have.deep.property('route.path', '/b')
    expect(result[2]).to.have.property('baseUrl', '/a/b')
    expect(result[2]).to.have.deep.property('route.path', '/c')
  })

  it('should match 2 routes (3)', function(){
    var route = {
      path: '/',
      children: [
        {
          path: '/',
        }
      ]
    }
    var result = iteratorToArray(matchRoute(route, '', '/'))
    expect(result).to.have.lengthOf(2)
    expect(result[0]).to.have.property('baseUrl', '')
    expect(result[0]).to.have.deep.property('route.path', '/')
    expect(result[1]).to.have.property('baseUrl', '')
    expect(result[1]).to.have.deep.property('route.path', '/')
  })
})
