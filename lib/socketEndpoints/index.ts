import { Opinion } from "@type/opinion";
import { SocketEndpointData } from '@type/socketEndpoint';

type Response = {
  message: string;
  [key: string]: any;
};

type EventResponse<
  Responses extends Response[],
  IdSet extends boolean = true,
> = Responses[number];

export type HandlerFunction<Responses extends Response[],  IdSet extends boolean> = (...args: any) => EventResponse<Responses, IdSet>;

export type Handler<Function extends HandlerFunction<Response[], boolean>> =
(data: SocketEndpointData, params: Parameters<Function>) => Promise<ReturnType<Function>>

export namespace Events {
  export type TextMessage = (text: string) => EventResponse<[]>;
  export type TypingState = (typing: boolean) => EventResponse<[]>;
  export type AddToRoom = (roomInformation: { id: string; question: number }) => EventResponse<[]>;
  export type Opinion = (opinion: Opinion) => EventResponse<
    [
      {
        message: "failedSurvey";
        reason: "noOpinion";
      },
      {
        message: "failedSurvey";
        reason: "sharedOpinion";
      },
      {
        message: "addToChatRoom";
        partnerOpinion: Opinion;
        opinion: Opinion;
        questionId: number;
      },
    ]
  >;
  export type EndChat = () => EventResponse<[]>;
  export type CurrentOnline = () => EventResponse<
    [
      {
        message: "currentOnline";
        count: number;
      },
    ]
  >;
  export type AddToQueue = () => EventResponse<
    [
      {
        message: "waiting";
        id: string;
      },
    ]
  >;
  export type SetId = (id: string | undefined) => EventResponse<
    [
      {
        message: "setId";
        id: string;
      },
      {
        message: "generatedId";
        id: string;
      },
      {
        message: "idTaken";
        id: string;
      },
      {
        message: "idAlreadySet";
        id: string;
      },
    ],
    false
  >;
}

type Asyncify<F extends (...args: any[]) => any> = (...args: Parameters<F>) => Promise<ReturnType<F>>;

export interface ServerToClientEvents {
  textMessage: Asyncify<Events.TextMessage>,
  typingState: Asyncify<Events.TypingState>,
  addToRoom: Asyncify<Events.AddToRoom>,
  endChat: Asyncify<Events.EndChat>,
}

export interface ClientToServerEvents {
  textMessage: Asyncify<Events.TextMessage>;
  typingState: Asyncify<Events.TypingState>;
  setId: Asyncify<Events.SetId>;
  addToQueue: Asyncify<Events.AddToQueue>;
  currentOnline: Asyncify<Events.CurrentOnline>;
  endChat: Asyncify<Events.EndChat>;
  opinion: Asyncify<Events.Opinion>;
}
