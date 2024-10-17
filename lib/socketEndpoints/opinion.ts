import { Handler } from "@lib/socketEndpoints";
import { Events } from "@lib/socketEndpoints/events";

export const opinion: Handler<Events["Opinion"]> = async (
  { client, partners, server },
  { opinion },
  callback,
) => {
  const partnerId = await partners.getPartnerId(client.id);

  if (partnerId === undefined) {
    callback({
      message: "noPartnerId",
    });

    return;
  }

  await partners.setAwnser(client.id, partnerId, opinion);
  const answers = await partners!.getQuestionAnswers(client.id, partnerId);
  const question = await partners!.getQuestion(client.id, partnerId);

  if (answers === undefined || question === undefined) {
    callback({
      message: "internalServerError",
    });

    return;
  }

  const partnerOpinion = answers[partnerId];

  if (opinion === "noOpinion") {
    await partners.seperatePartners(client.id, partnerId);

    server.to(partnerId).emit(
      "failedSurvey",
      {
        reason: "noOpinion",
      },
      () => {},
    );

    callback({
      message: "failedSurvey",
      reason: "noOpinion",
    });
  } else if (partnerOpinion !== null) {
    const partnerDisagee =
      partnerOpinion === "disagree" || partnerOpinion === "stronglyDisagree";
    const partnerAgree =
      partnerOpinion === "agree" || partnerOpinion === "stronglyAgree";
    const disagree = opinion === "disagree" || opinion === "stronglyDisagree";
    const agree = opinion === "agree" || opinion === "stronglyAgree";

    if ((partnerDisagee && agree) || (partnerAgree && disagree)) {
      server.to(partnerId).emit(
        "addToChatRoom",
        {
          opinion: partnerOpinion,
          partnerOpinion: opinion,
          questionId: question.id,
        },
        () => {},
      );

      callback({
        message: "addToChatRoom",
        opinion,
        partnerOpinion,
        questionId: question.id,
      });
    } else {
      await partners.seperatePartners(client.id, partnerId);

      server.to(partnerId).emit(
        "failedSurvey",
        {
          reason: "sharedOpinion",
        },
        () => {},
      );

      callback({
        message: "failedSurvey",
        reason: "sharedOpinion",
      });
    }
  } else {
    callback({
      message: "waitingForPartnerOpinion",
    });
  }
};
