import questions from "@lib/questions.json";

export class Question {
  constructor(public id: number) {}

  get text() {
    return questions[this.id].text;
  }

  get description() {
    return questions[this.id].description;
  }

  public static count = questions.length;
}
