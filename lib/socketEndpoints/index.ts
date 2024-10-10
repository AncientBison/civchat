import { Opinion } from "@type/opinion";

type Response = {
  message: string;
  [key: string]: any;
};

type EventResponse<
  Responses extends Response[],
  IdSet extends boolean = true,
> = {
  responses: Responses;
};

export interface ServerToClientEvents {
  textMessage: (text: string) => EventResponse<[]>;
  typingState: (typing: boolean) => EventResponse<[]>;
  addToRoom: (roomInformation: { id: string; question: number }) => void;
  endChat: () => EventResponse<[]>;
}

export interface ClientToServerEvents {
  textMessage: (text: string) => EventResponse<[]>;
  typingState: (typing: boolean) => EventResponse<[]>;
  ping: () => EventResponse<[]>;
  opinion: (opinion: Opinion) => EventResponse<
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
  endChat: () => EventResponse<[]>;
  currentOnline: () => EventResponse<
    [
      {
        message: "currentOnline";
        count: number;
      },
    ]
  >;
  addToQueue: () => EventResponse<
    [
      {
        message: "waiting";
        id: string;
      },
    ]
  >;
  setId: (id: string | undefined) => EventResponse<
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
