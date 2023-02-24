export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type XDomainRequest = any

  interface Window {
    XDomainRequest?: { new(): XDomainRequest; prototype: XDomainRequest; create(): XDomainRequest }; // for IE compat
    msCrypto: Crypto
  }
}
