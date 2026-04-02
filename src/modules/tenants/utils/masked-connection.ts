export function describeConnectionTarget(connectionString: string) {
  try {
    const url = new URL(connectionString);

    return {
      protocol: url.protocol.replace(':', ''),
      username: url.username || null,
      host: url.hostname || null,
      port: url.port || null,
      database: url.pathname ? url.pathname.replace(/^\//, '') : null,
    };
  } catch {
    return {
      protocol: null,
      username: null,
      host: null,
      port: null,
      database: null,
    };
  }
}
