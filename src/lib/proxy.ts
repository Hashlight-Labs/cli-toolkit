export const proxyStringToUri = (proxyString: string) => {
  const [host, port, username, password] = proxyString.split(":");

  return `http://${username}:${password}@${host}:${port}`;
};

export const proxies = [];

const proxyCounters: Record<string, number> = {};

export const getProxy = (proxyKey: string) => {
  if (!proxyCounters[proxyKey]) proxyCounters[proxyKey] = 0;

  const proxy = proxies[proxyCounters[proxyKey] % proxies.length];

  proxyCounters[proxyKey] =
    proxyCounters[proxyKey] + 1 < proxies.length
      ? proxyCounters[proxyKey] + 1
      : 0;

  return proxy;
};
