import { CallHandler, isFunction } from 'live-connect-common'

export class DefaultCallHandler implements CallHandler {
  ajaxGet(url: string, responseHandler: (responseText: string, response: object) => void, fallback?: (error: unknown) => void, timeout = 1000): void {
    function errorCallback(message: string, request?: XMLHttpRequest | XDomainRequest) {
      function getHeaders(get: (name: string) => string, names: { [key: string]: string[] }) {
        return Object.keys(names).map(key => {
          const res = names[key].map(h => get(h)).find(x => !!x)
          return res && { [key]: res }
        }).filter(x => !!x)
      }

      const cleaned = !request
        ? {}
        : {
          status: request.status,
          statusText: request.statusText,
          readyState: request.readyState,
          responseText: request.responseText,
          responseType: request.responseType,
          timeout: request.timeout,
          headers: [
            ...getHeaders(name => request.requestHeaders[name], {
              userAgent: ['userAgent', 'user-agent', 'User-Agent'],
              acceptEncoding: ['acceptEncoding', 'accept-encoding', 'Accept-Encoding'],
              accept: ['accept', 'Accept']
            }),
            ...getHeaders(name => request.getResponseHeader(name), {
              receivedEncoding: ['Content-Encoding', 'content-encoding', 'contentEncoding'],
              receivedType: ['Content-Type', 'content-type', 'contentType']
            })
          ]
        }
      const errorMessage = !request ? message : `${message}, request: ${JSON.stringify(cleaned)}`
      console.error('Error while executing ajax call', errorMessage)
      if (isFunction(fallback)) fallback(new Error(errorMessage))
    }

    function xhrCall(): XMLHttpRequest {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const status = xhr.status
          if ((status >= 200 && status < 300) || status === 304) {
            responseHandler(xhr.responseText, xhr)
          } else {
            errorCallback(`Error during XHR call: ${status}, url: ${url}`, xhr)
          }
        }
      }
      return xhr
    }

    function xdrCall(): XDomainRequest {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const xdr = new window.XDomainRequest!()
      xdr.onprogress = () => undefined
      xdr.onerror = () => errorCallback(`Error during XDR call: ${xdr.responseText}, url: ${url}`, xdr)
      xdr.onload = () => responseHandler(xdr.responseText, xdr)
      return xdr
    }

    try {
      const request = (window && window.XDomainRequest) ? xdrCall() : xhrCall()
      request.ontimeout = () => errorCallback(`Timeout after ${timeout}, url : ${url}`, request)
      request.open('GET', url, true)
      request.timeout = timeout
      request.withCredentials = true
      request.send()
    } catch (error) {
      errorCallback(`Error while constructing ajax request, ${error}`)
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
