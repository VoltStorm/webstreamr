import { socksDispatcher } from 'fetch-socks';
import { minimatch } from 'minimatch';
import { Agent, Dispatcher, interceptors, ProxyAgent } from 'undici';

const createProxyAgent = (proxyUrl: URL): Dispatcher => {
  if (proxyUrl.protocol === 'socks5:') {
    return socksDispatcher({ type: 5, host: proxyUrl.hostname, port: parseInt(proxyUrl.port) }, { allowH2: true });
  }

  return new ProxyAgent({ uri: proxyUrl.href, allowH2: true });
};

const createBasicDispatcher = (url: URL): Dispatcher => {
  if (process.env['PROXY_CONFIG']) {
    for (const rule of process.env['PROXY_CONFIG'].split(',')) {
      const [hostPattern, proxy] = rule.split(/:(.+)/);
      if (!hostPattern || !proxy) {
        throw new Error(`Proxy rule "${rule}" is invalid.`);
      }

      if (hostPattern === '*' || minimatch(url.host, hostPattern)) {
        return createProxyAgent(new URL(proxy));
      }
    }
  } else if (process.env['ALL_PROXY']) {
    return createProxyAgent(new URL(process.env['ALL_PROXY']));
  }

  return new Agent({ allowH2: true });
};

export const createDispatcher = (url: URL): Dispatcher => {
  return createBasicDispatcher(url).compose(
    interceptors.dns(),
    interceptors.retry({ maxRetries: 3 }),
  );
};
