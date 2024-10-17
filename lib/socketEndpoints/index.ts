import { SocketEndpointData } from "@type/socketEndpoint";
import { Events } from "@lib/socketEndpoints/events";

interface Response {
  message: string;
  [key: string]: any;
}

export type HandlerFunction<
  Params extends { [key: string]: any } = {},
  Responses extends Response | void = void,
> = (params: Params, callback: (response: Responses) => void) => void;

export type Handler<Function extends HandlerFunction<any, Response | void>> = (
  data: SocketEndpointData,
  params: Parameters<Function>[0],
  callback: Parameters<Function>[1],
) => Promise<ReturnType<Function>>;

type Asyncify<F extends (...args: any[]) => any> = (
  ...args: Parameters<F>
) => Promise<ReturnType<F>>;

export interface ServerToClientEvents {
  textMessage: Asyncify<Events["TextMessage"]>;
  typingState: Asyncify<Events["TypingState"]>;
  addToRoom: Asyncify<Events["AddToRoom"]>;
  endChat: Asyncify<Events["EndChat"]>;
  failedSurvey: Asyncify<Events["FailedSurvey"]>;
  addToChatRoom: Asyncify<Events["AddToChatRoom"]>;
  currentOnline: Asyncify<Events["CurrentOnline"]>;
}

export interface ClientToServerEvents {
  textMessage: Asyncify<Events["TextMessage"]>;
  typingState: Asyncify<Events["TypingState"]>;
  addToQueue: Asyncify<Events["AddToQueue"]>;
  endChat: Asyncify<Events["EndChat"]>;
  opinion: Asyncify<Events["Opinion"]>;
  requestCurrentlyOnlineCount: Asyncify<Events["RequestCurrentlyOnlineCount"]>;
}
