import { CallHandler, isFunction } from 'live-connect-common'

export class DefaultCallHandler implements CallHandler {
  ajaxGet(url: string, responseHandler: (responseText: string, response: object) => void, fallback?: (error: unknown) => void, timeout = 1000): void {
    function errorCallback(name: string, message: string, error: unknown, request: XMLHttpRequest | XDomainRequest) {
      console.error('Error while executing ajax call', message, error, request)
      if (isFunction(fallback)) fallback(error)
    }

    function xhrCall(): XMLHttpRequest {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const status = xhr.status
          if ((status >= 200 && status < 300) || status === 304) {
            responseHandler(xhr.responseText, xhr)
          } else {
            const error = new Error(`Incorrect status received : ${status}`)
            errorCallback('XHRError', `Error during XHR call: ${status}, url: ${url}`, error, xhr)
          }
        }
      }
      return xhr
    }

    function xdrCall(): XDomainRequest {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const xdr = new window.XDomainRequest!()
      xdr.onprogress = () => undefined
      xdr.onerror = () => {
        const error = new Error(`XDR Error received: ${xdr.responseText}`)
        errorCallback('XDRError', `Error during XDR call: ${xdr.responseText}, url: ${url}`, error, xdr)
      }
      xdr.onload = () => responseHandler(xdr.responseText, xdr)
      return xdr
    }

    try {
      const request = (window && window.XDomainRequest) ? xdrCall() : xhrCall()
      request.ontimeout = () => {
        const error = new Error(`Timeout after ${timeout}, url : ${url}`)
        errorCallback('AjaxTimeout', `Timeout after ${timeout}`, error, request)
      }
      request.open('GET', url, true)
      request.timeout = timeout
      request.withCredentials = true
      request.send()
    } catch (error) {
      errorCallback('AjaxCompositionError', `Error while constructing ajax request, ${error}`, error, undefined)
    }
  }

  pixelGet(uri: string, onload?: () => void): void {
    const img = new window.Image()
    if (isFunction(onload)) {
      img.onload = onload
    }
    img.src = uri
  }
}
