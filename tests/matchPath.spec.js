/*
 * uroute © 2016 by Stijn de Witt, some rights reserved.
 * License: CC-BY-4.0
 *
 * Based on Universal Router (https://www.kriasoft.com/universal-router/)
 * Copyright © 2015-2016 Konstantin Tarkus, Kriasoft LLC. All rights reserved.
 * license: MIT. SEE LICENSE-universal-router.txt.
 */

var expect = require('chai').expect
var matchPath = require('../').match.matchPath

describe('matchPath(true, routePath, urlPath)', function(){

  it('returns `null` if path not found (1)', function(){
    var result = matchPath(true, '/', '/a')
    expect(result).to.be.null
  })

  it('returns `null` if path not found (2)', function(){
    var result = matchPath(true, '/a', '/')
    expect(result).to.be.null
  })

  it('returns `path` and `params` (1)', function(){
    var result = matchPath(true, '/a', '/a')
    expect(result).to.be.deep.equal({ path: '/a', params: {} })
  })

  it('returns `path` and `params` (2)', function(){
    var result = matchPath(true, '/:a/:b', '/1/2')
    expect(result).to.be.ok
    expect(result).to.have.property('path', '/1/2')
    expect(result).to.have.property('params').and.be.deep.equal({ a: '1', b: '2' })
  })

  it('returns `path` and `params` (3)', function(){
    var result = matchPath(true, '/', '')
    expect(result).to.be.ok
    expect(result).to.have.property('path', '/')
    expect(result).to.have.property('params').and.be.an('object')
    expect(Object.keys(result.params)).to.have.lengthOf(0)
  })

  it('returns `path` and `params` (4)', function(){
    var result = matchPath(true, '/:a/:b?', '/1')
    expect(result).to.be.ok
    expect(result).to.have.property('path', '/1')
    expect(result).to.have.property('params').and.be.deep.equal({ a: '1', b: undefined })
  })

  it('returns `path` and `params` (5)', function(){
    var result = matchPath(true, '/:a/:b?', '/1/2')
    expect(result).to.be.ok
    expect(result).to.have.property('path', '/1/2')
    expect(result).to.have.property('params').and.be.deep.equal({ a: '1', b: '2' })
  })

  it('matches an array of paths', function(){
    var result = matchPath(true, ['/e', '/f'], '/f')
    expect(result).to.be.deep.equal({ path: '/f', params: {} })
  })

})



describe('matchPath(false, routePath, urlPath)', function(){

  it('returns `path` and `params` (6)', function(){
    var result = matchPath(false, '/c', '/c/d')
    expect(result).to.be.deep.equal({ path: '/c', params: {} })
  })

  it('returns `path` and `params` (7)', function(){
    var result = matchPath(false, '/', '/a/b')
    expect(result).to.be.deep.equal({ path: '/', params: {} })
  })

  it('returns `path` and `params` (8)', function(){
    var result = matchPath(false, '/', '')
    expect(result).to.be.deep.equal({ path: '/', params: {} })
  })

})
