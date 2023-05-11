import 'jsdom-global/register'
import { expect, use } from 'chai'
import { DefaultStorageHandler } from '../src'
import { ReplayEmitter } from 'live-connect-common'
import jsdom from 'jsdom-global'
import dirtyChai from 'dirty-chai'

use(dirtyChai)

describe('Storage', () => {
  jsdom('', {
    url: 'http://www.example.com'
  })

  const storage = new DefaultStorageHandler(new ReplayEmitter(5))

  it('should add a cookie, return it after', function () {
    // @ts-expect-error
    storage.setCookie('x', 'new-value', 2, undefined, 'example.com')

    const result = storage.getCookie('x')

    expect(result).to.eql('new-value')
  })

  it('should return false if LS is inaccessible', function () {
    window.localStorage.getItem = () => JSON.parse('7')

    const result = storage.getDataFromLocalStorage('x')

    expect(result).to.eql(null)
  })

  it('should create an LS entry, return it after', function () {
    storage.setDataInLocalStorage('x', 'new-value')

    const result = storage.getDataFromLocalStorage('x')

    expect('new-value').to.eql(result)
    expect(window.localStorage.getItem('x')).to.eql(result)
  })

  it('should delete an LS entry', function () {
    storage.setDataInLocalStorage('x', 'new-value')
    storage.removeDataFromLocalStorage('x')

    const result = storage.getDataFromLocalStorage('x')

    expect(result).to.be.null()
  })

  it('should return lookalikes from the cookie jar', function () {
    storage.setCookie('_crap_.id.sss', 'some-value')
    storage.setCookie('_crap_.sess.aaa', 'another-value')
    const cookieEntries = storage.findSimilarCookies('_crap_.')
    expect(cookieEntries.sort()).to.eql(['another-value', 'some-value'])
  })

  it('should read cookies that are not uri encoded', function () {
    document.cookie = '_crap_.id.sss=foo bar'
    expect(storage.getCookie('_crap_.id.sss')).to.eq('foo bar')
  })

  it('should not read cookies that include malformed uri encoded elements', function () {
    document.cookie = '_crap_.id.sss=%FF'
    expect(storage.getCookie('_crap_.id.sss')).to.null()
  })

  it('should not list cookies that include malformed uri encoded elements', function () {
    document.cookie = '_crap_.id.sss=%FF'
    storage.setCookie('_crap_.sess.aaa', 'some-value')
    const cookieEntries = storage.findSimilarCookies('_crap_.')
    expect(cookieEntries).to.eql(['some-value'])
  })
})
