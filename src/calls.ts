import { CallHandler, Headers, isFunction } from 'live-connect-common'

export class DefaultCallHandler implements CallHandler {
  ajaxGet(url: string, responseHandler: (responseText: string, response: object) => void, onError?: (error: unknown) => void, timeout = 1000, headers?: Headers): void {
    function errorCallback(message: string) {
      if (isFunction(onError)) onError(new Error(message))
    }

    function xhrCall(): void {
      const xhr = new XMLHttpRequest()
      const startTime = Date.now()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
            responseHandler(xhr.responseText, xhr)
          } else {
            errorCallback(`Error during XHR call: ${xhr.status}, url: ${url}`)
          }
        }
      }
      xhr.ontimeout = () => {
        const duration = Date.now() - startTime
        errorCallback(`Timeout after ${duration} (${timeout}), url: ${url}`)
      }
      xhr.open('GET', url, true)
      xhr.timeout = timeout
      xhr.withCredentials = true
      if (headers != null) {
        for (const [name, value] of Object.entries(headers)) {
          if (value != null) {
            xhr.setRequestHeader(name, value)
          }
        }
      }
      xhr.send()
    }

    function xdrCall(): void {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const xdr = new window.XDomainRequest!()
      const startTime = Date.now()
      xdr.onprogress = () => undefined
      xdr.onerror = () => errorCallback(`Error during XDR call: ${xdr.responseText}, url: ${url}`)
      xdr.onload = () => responseHandler(xdr.responseText, xdr)
      xdr.ontimeout = () => {
        const duration = Date.now() - startTime
        errorCallback(`Timeout after ${duration} (${timeout}), url: ${url}`)
      }
      xdr.open('GET', url, true)
      xdr.timeout = timeout
      xdr.withCredentials = true
      xdr.send()
    }

    try {
      if (window.XMLHttpRequest) {
        xhrCall()
      } else {
        xdrCall()
      }
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
