import { HandlerFunction } from "@lib/socketEndpoints";
import { Opinion } from "@type/opinion";

export interface Events {
  TextMessage: HandlerFunction<{ text: string }>;
  TypingState: HandlerFunction<{ typing: boolean }>;
  AddToRoom: HandlerFunction<{
    questionId: number;
  }>;
  Opinion: HandlerFunction<
    { opinion: Opinion },
    | {
        message: "failedSurvey";
        reason: "noOpinion";
      }
    | {
        message: "failedSurvey";
        reason: "sharedOpinion";
      }
    | {
        message: "addToChatRoom";
        partnerOpinion: Opinion;
        opinion: Opinion;
        questionId: number;
      }
  >;
  EndChat: HandlerFunction;
  CurrentOnline: HandlerFunction<
    {},
    {
      message: "currentOnline";
      count: number;
    }
  >;
  AddToQueue: HandlerFunction<
    {},
    {
      message: "waiting";
    } | {
      message: "addToRoom"
      questionId: number;
    }
  >;
}
