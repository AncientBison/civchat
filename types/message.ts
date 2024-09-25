import { Opinion } from "@type/opinion";

export type MessageType =
  | "addToRoom"
  | "opinion"
  | "addToQueue"
  | "textMessage"
  | "addToChatRoom"
  | "waiting"
  | "failedSurvey"
  | "partnerLeft"
  | "endChat"
  | "partnerOpinion"
  | "setId"
  | "setIdResult"
  | "noId"
  | "startTyping"
  | "ping"
  | "pong";

type BaseMessageWithoutData<T extends MessageType> = {
  type: T;
};
type BaseMessageWithData<T extends MessageType, D> = {
  type: T;
  data: D;
};
type BaseMessage<T extends MessageType, D = undefined> = D extends undefined
  ? BaseMessageWithoutData<T>
  : BaseMessageWithData<T, D>;

type AddToRoomMessage = BaseMessage<
  "addToRoom",
  {
    id: string;
    questionId: number;
  }
>;

type OpinionMessage = BaseMessage<
  "opinion",
  {
    opinion: Opinion;
  }
>;

type TextMessageMessage = BaseMessage<
  "textMessage",
  {
    text: string;
  }
>;

type AddToQueueMessage = BaseMessage<"addToQueue">;

type AddToChatRoomMessage = BaseMessage<
  "addToChatRoom",
  {
    partnerOpinion: Opinion;
    opinion: Opinion;
    questionId: number;
  }
>;

type WaitingMessage = BaseMessage<"waiting">;

type FailedSurveyMessage = BaseMessage<
  "failedSurvey",
  {
    reason: "sharedOpinion" | "noOpinion";
  }
>;

type PartnerLeftMessage = BaseMessage<"partnerLeft">;

type EndChatMessage = BaseMessage<"endChat">;

type SetIdMessage = BaseMessage<
  "setId",
  {
    id?: string;
  }
>;

type SetIdResultMessage = BaseMessage<
  "setIdResult",
  {
    message: "setId" | "generatedId" | "idTaken" | "idAlreadySet";
    id: string;
  }
>;

type NoIdMessage = BaseMessage<"noId">;

type StartTypingMessage = BaseMessage<
  "startTyping",
  {
    typing: boolean;
  }
>;

type PingMessage = BaseMessage<"ping">;

type PongMessage = BaseMessage<"pong">;

export type Message =
  | AddToRoomMessage
  | OpinionMessage
  | TextMessageMessage
  | AddToQueueMessage
  | AddToChatRoomMessage
  | WaitingMessage
  | FailedSurveyMessage
  | PartnerLeftMessage
  | EndChatMessage
  | SetIdMessage
  | SetIdResultMessage
  | NoIdMessage
  | StartTypingMessage
  | PingMessage
  | PongMessage;

export type TypedMessage<T extends MessageType> = T extends "addToRoom"
  ? AddToRoomMessage
  : T extends "opinion"
    ? OpinionMessage
    : T extends "textMessage"
      ? TextMessageMessage
      : T extends "addToQueue"
        ? AddToQueueMessage
        : T extends "addToChatRoom"
          ? AddToChatRoomMessage
          : T extends "waiting"
            ? WaitingMessage
            : T extends "failedSurvey"
              ? FailedSurveyMessage
              : T extends "partnerLeft"
                ? PartnerLeftMessage
                : T extends "endChat"
                  ? EndChatMessage
                  : T extends "setId"
                    ? SetIdMessage
                    : T extends "setIdResult"
                      ? SetIdResultMessage
                      : T extends "noId"
                        ? NoIdMessage
                        : T extends "startTyping"
                          ? StartTypingMessage
                          : T extends "ping"
                            ? PingMessage
                            : T extends "pong"
                              ? PongMessage
                              : never;
