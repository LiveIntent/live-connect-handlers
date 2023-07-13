import jsdom from 'jsdom-global'
import sinon, { SinonStub } from 'sinon'
import { expect, use } from 'chai'
import { DefaultCallHandler } from '../src/calls'
import dirtyChai from 'dirty-chai'

use(dirtyChai)

describe('Calls', () => {
  let requests: XMLHttpRequest[] = []
  const dummy = () => undefined
  const sandbox = sinon.createSandbox()
  let imgStub: SinonStub<unknown[], HTMLImageElement> | undefined

  const calls = new DefaultCallHandler()

  beforeEach(() => jsdom('', { url: 'http://www.something.example.com' }))

  beforeEach(() => {
    requests = []
    global.XDomainRequest = undefined
    global.XMLHttpRequest = sandbox.useFakeXMLHttpRequest()
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
    const successCallback = (body, request) => {
      expect(body).to.eql('{"comment": "Howdy"}')
      expect(request).to.eql(requests[0])
      done()
    }
    calls.ajaxGet('http://steve.liadm.com/idex/any/any', successCallback)
    const request = requests[0]
    request.respond(200, { 'Content-Type': 'application/json' }, '{"comment": "Howdy"}')
  })

  it('should invoke the fallback callback for failure status codes when ajaxGet', function (done) {
    const fallback = () => {
      expect(request).to.eql(requests[0])
      done()
    }
    calls.ajaxGet('http://steve.liadm.com/idex/any/any', dummy, fallback)
    const request = requests[0]
    request.respond(503, null, '')
  })

  it('should invoke the fallback callback on failure when ajaxGet', function (done) {
    const expectedError = new Error('Purposely failing')
    global.XMLHttpRequest = () => {
      throw expectedError
    }
    const fallback = (error: unknown) => {
      expect(error.message).to.match(/^Error while constructing ajax request/)
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

    calls.pixelGet('http://localhost', null)

    expect(obj.src).to.eq('http://localhost')
    expect(obj.onload).to.be.undefined()
  })
})
