import ALF from "alf-client";

export async function createClient() {
  const address = '18.222.113.75';

  const client = new ALF.NodeClient({
    host: address,
    port: 10973
  });

  const response = await client.selfClique();

  if (!response) {
    console.log('Self clique not found.');
    return;
  }

  const clique = new ALF.CliqueClient(response.result);
  return clique;
}
