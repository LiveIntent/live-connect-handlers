import 'jsdom-global/register'
import jsdom from 'jsdom-global'
import sinon, { SinonStub } from 'sinon'
import { expect, use } from 'chai'
import { DefaultCallHandler } from '../src'
import dirtyChai from 'dirty-chai'

use(dirtyChai)

describe('Calls', () => {
  let requests: XMLHttpRequest[] = []
  const dummy = () => undefined
  const sandbox = sinon.createSandbox()
  let imgStub: SinonStub<unknown[], HTMLImageElement> | undefined

  const calls = new DefaultCallHandler()

  jsdom('', {
    url: 'http://www.something.example.com'
  })

  beforeEach(() => {
    requests = []
    // @ts-expect-error
    global.XDomainRequest = undefined
    // @ts-expect-error
    global.XMLHttpRequest = sandbox.useFakeXMLHttpRequest()
    // @ts-expect-error
    global.XMLHttpRequest.onCreate = function (xhr: XMLHttpRequest) {
      requests.push(xhr)
    }
  })

  afterEach(() => {
    if (imgStub) {
      imgStub.restore()
      imgStub = undefined
    }
  })

  it('should invoke the success callback when ajaxGet', function (done) {
    // @ts-expect-error
    const successCallback = (body, request) => {
      expect(body).to.eql('{"comment": "Howdy"}')
      expect(request).to.eql(requests[0])
      done()
    }
    calls.ajaxGet('http://steve.liadm.com/idex/any/any', successCallback)
    const request = requests[0]
    // @ts-expect-error
    request.respond(200, { 'Content-Type': 'application/json' }, '{"comment": "Howdy"}')
  })

  it('should invoke the fallback callback for failure status codes when ajaxGet', function (done) {
    const fallback = () => {
      expect(request).to.eql(requests[0])
      done()
    }
    calls.ajaxGet('http://steve.liadm.com/idex/any/any', dummy, fallback)
    const request = requests[0]
    // @ts-expect-error
    request.respond(503, null, '')
  })

  it('should invoke the fallback callback on failure when ajaxGet', function (done) {
    const expectedError = new Error('Purposely failing')
    // @ts-expect-error
    global.XMLHttpRequest = () => {
      throw expectedError
    }
    const fallback = (error: unknown) => {
      expect(error).to.be.eq(expectedError)
      done()
    }
    calls.ajaxGet('http://steve.liadm.com/idex/any/any', dummy, fallback)
  })

  it('should call pixel with an onload function', function () {
    const obj = {} as HTMLImageElement
    const onload = () => 1
    imgStub = sandbox.stub(window, 'Image').returns(obj)

    calls.pixelGet('http://localhost', onload)

    expect(obj.src).to.eq('http://localhost')
    expect(obj.onload).to.eq(onload)
  })

  it('should call pixel when the onload function is not provided', function () {
    const obj = {} as HTMLImageElement
    imgStub = sandbox.stub(window, 'Image').returns(obj)

    // @ts-expect-error
    calls.pixelGet('http://localhost', null)

    expect(obj.src).to.eq('http://localhost')
    expect(obj.onload).to.be.undefined()
  })
})
