import { HandlerFunction } from "@lib/socketEndpoints";
import { Opinion } from "@type/opinion";

export type FailedSurveyReason = "noOpinion" | "sharedOpinion";

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
        reason: FailedSurveyReason;
      }
    | {
        message: "addToChatRoom";
        partnerOpinion: Opinion;
        opinion: Opinion;
        questionId: number;
      }
    | {
        message: "noPartnerId";
      }
    | {
        message: "internalServerError";
      }
    | {
        message: "waitingForPartnerOpinion";
      }
  >;
  EndChat: HandlerFunction;
  CurrentOnline: HandlerFunction<{
    count: number;
  }>;
  AddToQueue: HandlerFunction<
    {},
    | {
        message: "waiting";
      }
    | {
        message: "addToRoom";
        questionId: number;
      }
  >;
  FailedSurvey: HandlerFunction<
    { reason: "noOpinion" } | { reason: "sharedOpinion" }
  >;
  AddToChatRoom: HandlerFunction<{
    partnerOpinion: Opinion;
    opinion: Opinion;
    questionId: number;
  }>;
  RequestCurrentlyOnlineCount: HandlerFunction<
    {},
    {
      message: "currentlyOnline";
      count: number;
    }
  >;
}
