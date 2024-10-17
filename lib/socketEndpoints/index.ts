import { SocketEndpointData } from "@type/socketEndpoint";
import { Events } from "@lib/socketEndpoints/events";

interface Response {
  message: string;
  [key: string]: any;
}

export type HandlerFunction<
  Params extends { [key: string]: any } = {},
  Responses extends Response = never,
> = (
  params: Params,
) => Responses;

export type Handler<Function extends HandlerFunction<any, Response>> = (
  data: SocketEndpointData,
  params: Parameters<Function>[0],
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
}

export interface ClientToServerEvents {
  textMessage: Asyncify<Events["TextMessage"]>;
  typingState: Asyncify<Events["TypingState"]>;
  addToQueue: Asyncify<Events["AddToQueue"]>;
  currentOnline: Asyncify<Events["CurrentOnline"]>;
  endChat: Asyncify<Events["EndChat"]>;
  opinion: Asyncify<Events["Opinion"]>;
}
