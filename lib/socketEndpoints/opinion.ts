import { getClientFromUuid, sendSocketMessage } from "@lib/socket";
import { Message } from "@type/message";
import { Opinion } from "@type/opinion";
import { SocketEndpointData } from "@type/socketEndpoint";

export async function opinion(
  { client, id, partners, server }: SocketEndpointData,
  {
    opinion,
  }: {
    opinion: Opinion;
  },
) {
  const partnerId = await partners.getPartnerId(id);

  if (partnerId === undefined) {
    return;
  }

  await partners!.setAwnser(id, partnerId, opinion);
  const answers = await partners!.getQuestionAnswers(id, partnerId);
  const question = await partners!.getQuestion(id, partnerId);

  if (answers === undefined || question === undefined) {
    return;
  }

  const partnerOpinion = answers[partnerId];
  const partner = getClientFromUuid(partnerId, server);

  if (partner === undefined) {
    throw Error("Invalid databsae state");
  }

  if (opinion === "noOpinion") {
    const failedSurveyMessage: Message = {
      type: "failedSurvey",
      data: {
        reason: "noOpinion",
      },
    };

    sendSocketMessage(partner, failedSurveyMessage);
    sendSocketMessage(client, failedSurveyMessage);
  } else if (partnerOpinion !== null) {
    const partnerDisagee =
      partnerOpinion === "disagree" || partnerOpinion === "stronglyDisagree";
    const partnerAgree =
      partnerOpinion === "agree" || partnerOpinion === "stronglyAgree";
    const disagree = opinion === "disagree" || opinion === "stronglyDisagree";
    const agree = opinion === "agree" || opinion === "stronglyAgree";

    if ((partnerDisagee && agree) || (partnerAgree && disagree)) {
      sendSocketMessage(partner, {
        type: "addToChatRoom",
        data: {
          partnerOpinion: opinion,
          opinion: partnerOpinion,
          questionId: question.id,
        },
      });
      sendSocketMessage(client, {
        type: "addToChatRoom",
        data: {
          partnerOpinion,
          opinion,
          questionId: question.id,
        },
      });
    } else {
      const failedSurveyMessage: Message = {
        type: "failedSurvey",
        data: {
          reason: "sharedOpinion",
        },
      };

      sendSocketMessage(partner, failedSurveyMessage);
      sendSocketMessage(client, failedSurveyMessage);

      await partners!.seperatePartners(id, partnerId);
    }
  }
}
