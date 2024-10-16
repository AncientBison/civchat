import { Partners } from "@lib/partners";
import { TypedServer, TypedSocket } from "@type/socket";

export type SocketEndpointData = {
  client: TypedSocket;
  server: TypedServer;
  partners: Partners;
};
