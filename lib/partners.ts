import { Opinion } from "@type/opinion";
import { getClient } from "@lib/redis";
import { Question } from "@lib/question";

export class Partners {
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

  public getRedisClient() {
    return this.redis;
  }
}
