import { randomUUID } from "crypto";
import { IncomingMessage } from "http";

import { WebSocketServer, WebSocket } from "ws";

import { getClient } from "@/lib/redis";
import { Question } from "@/lib/question";

function getClientFromUUid(uuid: string, server: WebSocketServer) {
  return Array.from(server.clients).find(
    (client) => (client as WebSocketWithUuid).uuid === uuid,
  );
}

class Partners {
  constructor(private redis: Awaited<ReturnType<typeof getClient>>) {}

  private static createPartnersId(id: string, partnerId: string) {
    return [id, partnerId].sort().join("");
  }

  public async seperatePartners(id: string, partnerId: string) {
    await this.delete(id);
    await this.delete(partnerId);
    await this.redis.del(Partners.createPartnersId(partnerId, id));
  }

  private async delete(id: string) {
    await this.redis.hDel("partners", id);
  }

  public async getPartnerId(id: string): Promise<string | undefined> {
    return await this.redis.hGet("partners", id);
  }

  public async setPartners(id: string, partnerId: string) {
    await this.redis.hSet("partners", id, partnerId);
    await this.redis.hSet("partners", partnerId, id);
  }

  public async has(id: string) {
    return await this.redis.hExists("partners", id);
  }

  public async assignRandomQuestion(
    id: string,
    partnerId: string,
  ): Promise<Question> {
    const questionId = Math.floor(Math.random() * Question.count);

    await this.redis.hSet(
      Partners.createPartnersId(id, partnerId),
      "id",
      questionId,
    );

    return new Question(questionId);
  }

  public async getQuestion(
    id: string,
    partnerId: string,
  ): Promise<Question | undefined> {
    const questionId = await this.redis.hGet(
      Partners.createPartnersId(id, partnerId),
      "id",
    );

    return questionId === undefined
      ? undefined
      : new Question(parseInt(questionId));
  }

  public async setAwnser(id: string, partnerId: string, answer: Opinion) {
    await this.redis.hSet(
      Partners.createPartnersId(id, partnerId),
      `answer:${id}`,
      answer,
    );
  }

  public async getQuestionAnswers(
    id: string,
    partnerId: string,
  ): Promise<{ [key: string]: Opinion } | undefined> {
    const selfAnswer = await this.redis.hGet(
      Partners.createPartnersId(id, partnerId),
      `answer:${id}`,
    );
    const partnerAnswer = await this.redis.hGet(
      Partners.createPartnersId(id, partnerId),
      `answer:${partnerId}`,
    );

    if (selfAnswer === undefined || partnerAnswer === undefined) {
      return undefined;
    }

    return {
      [id]: selfAnswer as Opinion,
      [partnerId]: partnerAnswer as Opinion,
    };
  }
}

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
  | "startTyping";

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
  | StartTypingMessage;

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
                          : never;

export type Opinion =
  | "stronglyDisagree"
  | "disagree"
  | "noOpinion"
  | "agree"
  | "stronglyAgree";

interface WebSocketWithUuid extends WebSocket {
  uuid: string;
}

export function SOCKET(
  client: WebSocketWithUuid,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  let id: string = "";
  let partners: Partners;

  async function setId(idToSet?: string) {
    if (idToSet === undefined) {
      id = randomUUID();
      client.send(
        JSON.stringify({
          type: "setIdResult",
          data: {
            message: "generatedId",
            id,
          },
        } satisfies Message),
      );
    } else if (getClientFromUUid(idToSet, server) !== undefined) {
      client.send(
        JSON.stringify({
          type: "setIdResult",
          data: {
            message: "idTaken",
            id,
          },
        } satisfies Message),
      );
    } else {
      id = idToSet;
      client.send(
        JSON.stringify({
          type: "setIdResult",
          data: {
            message: "setId",
            id,
          },
        } satisfies Message),
      );
    }

    client.uuid = id;
  }

  async function opinion(opinion: Opinion) {
    const partnerId = await partners.getPartnerId(id);

    if (partnerId === undefined) {
      return;
    }

    await partners.setAwnser(id, partnerId, opinion);
    const answers = await partners.getQuestionAnswers(id, partnerId);
    const question = await partners.getQuestion(id, partnerId);

    if (answers === undefined || question === undefined) {
      return;
    }

    const partnerOpinion = answers[partnerId];
    const partner = getClientFromUUid(partnerId, server);

    if (opinion === "noOpinion") {
      const messageStringified = JSON.stringify({
        type: "failedSurvey",
        data: {
          reason: "noOpinion",
        },
      } satisfies Message);

      partner?.send(messageStringified);
      client.send(messageStringified);
    } else if (partnerOpinion !== null) {
      const partnerDisagee =
        partnerOpinion === "disagree" || partnerOpinion === "stronglyDisagree";
      const partnerAgree =
        partnerOpinion === "agree" || partnerOpinion === "stronglyAgree";
      const disagree = opinion === "disagree" || opinion === "stronglyDisagree";
      const agree = opinion === "agree" || opinion === "stronglyAgree";

      if ((partnerDisagee && agree) || (partnerAgree && disagree)) {
        partner?.send(
          JSON.stringify({
            type: "addToChatRoom",
            data: {
              partnerOpinion: opinion,
              opinion: partnerOpinion,
              questionId: question.id,
            },
          } satisfies Message),
        );
        client.send(
          JSON.stringify({
            type: "addToChatRoom",
            data: {
              partnerOpinion,
              opinion,
              questionId: question.id,
            },
          } satisfies Message),
        );
      } else {
        const messageStringified = JSON.stringify({
          type: "failedSurvey",
          data: {
            reason: "sharedOpinion",
          },
        } satisfies Message);

        partner?.send(messageStringified);
        client.send(messageStringified);

        await partners.seperatePartners(id, partnerId);
      }
    }
  }

  async function addToQueue() {
    const redis = await getClient();
    const partnerId = await redis.rPop("queue");

    if (partnerId === null) {
      await redis.lRem("queue", 1, id);
      await redis.lPush("queue", id);
      client.send(JSON.stringify({ type: "waiting" } satisfies Message));
    } else {
      const partner = getClientFromUUid(partnerId, server);

      await partners.setPartners(id, partnerId);

      const question = await partners.assignRandomQuestion(id, partnerId);

      partner?.send(
        JSON.stringify({
          type: "addToRoom",
          data: {
            id,
            questionId: question.id,
          },
        } satisfies Message),
      );

      client?.send(
        JSON.stringify({
          type: "addToRoom",
          data: {
            id: partnerId,
            questionId: question.id,
          },
        } satisfies Message),
      );
    }
  }

  async function textMessage(text: string) {
    const partnerId = await partners.getPartnerId(id);

    if (partnerId === undefined) {
      return;
    }

    const partner = getClientFromUUid(partnerId, server);

    if (!partner) {
      return;
    }

    partner.send(
      JSON.stringify({
        type: "textMessage",
        data: { text },
      } satisfies Message),
    );
  }

  async function endChat() {
    const partnerId = await partners.getPartnerId(id);

    if (partnerId === undefined) {
      return;
    }

    const partner = getClientFromUUid(partnerId, server);

    if (!partner) {
      return;
    }
    partner.send(
      JSON.stringify({
        type: "endChat",
      } satisfies Message),
    );

    await partners.seperatePartners(id, partnerId);
  }

  async function startTyping(typing: boolean) {
    const partnerId = await partners.getPartnerId(id);

    if (partnerId === undefined) {
      return;
    }

    const partner = getClientFromUUid(partnerId, server);

    if (!partner) {
      return;
    }

    partner.send(
      JSON.stringify({
        type: "startTyping",
        data: { typing },
      } satisfies Message),
    );
  }

  client.on("message", async (message) => {
    if (partners === undefined) {
      partners = new Partners(await getClient());
    }

    const payload = JSON.parse(message.toString());

    if (payload.type === "setId") {
      if (id === "") {
        await setId(payload.data.id);

        return;
      } else {
        client.send(
          JSON.stringify({
            type: "setIdResult",
            data: {
              message: "idAlreadySet",
              id,
            },
          } satisfies Message),
        );

        return;
      }
    }

    if (id === "") {
      client.send(
        JSON.stringify({
          type: "noId",
        } satisfies Message),
      );

      return;
    }

    switch (payload.type) {
      case "addToQueue":
        await addToQueue();
        break;
      case "opinion":
        await opinion(payload.data.opinion);
        break;
      case "textMessage":
        await textMessage(payload.data.text);
        break;
      case "endChat":
        await endChat();
        break;
      case "startTyping":
        await startTyping(payload.data.typing);
        break;
      default:
        if (process.env.NODE_ENV === "development") {
          console.warn("Unknown message type:", payload.type);
        }
    }
  });

  client.on("close", async () => {
    const redis = await getClient();

    if (partners !== undefined && (await partners.has(id))) {
      const partnerId = (await partners.getPartnerId(id))!;
      const partner = getClientFromUUid(partnerId, server);

      if (partner !== undefined) {
        partner.send(JSON.stringify({ type: "partnerLeft" } satisfies Message));
      }
      await partners.seperatePartners(id, partnerId);
    }
    await redis.lRem("queue", 1, id);
  });
}
