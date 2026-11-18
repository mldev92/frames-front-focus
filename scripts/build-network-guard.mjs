// Предзагрузка во всех дочерних Node-процессах сборки; ограничивает fetch, не заменяет сетевой firewall.
const gateway = new URL(process.env.O100_BUILD_GATEWAY || 'http://invalid');
const origin = process.env.O100_BUILD_ORIGIN;
if (gateway.hostname !== '127.0.0.1' || gateway.protocol !== 'http:' || !gateway.port || !origin || !['capture','replay'].includes(process.env.O100_BUILD_MODE)) {
  throw Error('Production build requires the snapshot runner; direct network builds are forbidden');
}
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  const target = new URL(request.url);
  if (target.origin === origin) {
    if (request.method !== 'GET' || request.headers.has('authorization') || request.headers.has('cookie')) throw Error('Production build cannot use authenticated or mutating requests');
    return nativeFetch(gateway.origin + target.pathname + target.search, { signal: request.signal, redirect: 'error' });
  }
  if (target.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(target.hostname)) return nativeFetch(input, init);
  throw Error('External network is forbidden during production build: ' + target.origin);
};
