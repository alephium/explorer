import ALF from "alf-client";

export async function createClient() {
  const client = new ALF.NodeClient({
    host: 'localhost',
    port: 10973
  });

  const response = await client.selfClique();

  if (!response) {
    this.log('Self clique not found.');
    return;
  }

  const clique = new ALF.CliqueClient(response.result);
  return clique;
}
