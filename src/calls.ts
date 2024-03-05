import { CallHandler, isFunction } from 'live-connect-common'

export class DefaultCallHandler implements CallHandler {
  ajaxGet(url: string, responseHandler: (responseText: string, response: object) => void, onError?: (error: unknown) => void, timeout = 1000): void {
    function errorCallback(message: string) {
      isFunction(onError) && onError(new Error(message))
    }

    function xhrCall(): XMLHttpRequest {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            responseHandler(xhr.responseText, xhr)
          } else {
            errorCallback(`Error during XHR call: ${xhr.status}, url: ${url}`)
          }
        }
      }
      return xhr
    }

    function xdrCall(): XDomainRequest {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const xdr = new window.XDomainRequest!()
      xdr.onprogress = () => undefined
      xdr.onerror = () => errorCallback(`Error during XDR call: ${xdr.responseText}, url: ${url}`)
      xdr.onload = () => responseHandler(xdr.responseText, xdr)
      return xdr
    }

    try {
      const startTime = (new Date()).getTime()
      const request = (window && window.XDomainRequest) ? xdrCall() : xhrCall()

      request.ontimeout = () => {
        const duration = (new Date()).getTime() - startTime
        errorCallback(`Timeout after ${duration} (${timeout}), url: ${url}`)
      }
      request.open('GET', url, true)
      request.timeout = timeout
      request.withCredentials = true
      request.send()
    } catch (error) {
      errorCallback(`Error while constructing ajax request, ${error}, url: ${url}`)
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
