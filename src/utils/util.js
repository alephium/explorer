import { ExplorerClient } from "./explorer";

export async function createClient() {
  let address = process.env.REACT_APP_ALEPHIUM_HOST;
  if (!address) { address = 'localhost'; }

  let port = process.env.REACT_APP_ALEPHIUM_PORT;
  if (!port) { port = 9090; }

  const client = new ExplorerClient({
    host: address,
    port: port
  });

  console.log('Connecting to: ' + client.host + ':' + client.port);

  return client;
}
