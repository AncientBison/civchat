"use client";

import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import { Divider } from "@nextui-org/divider";
import { useWebSocket } from "next-ws/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ResponsiveButtonGroup } from "./ResponsiveButtonGroup";

import { Opinion } from "@/app/api/route";
import { createSocketEventHandler } from "@/lib/socketEventHandler";
import { sendSocketMessage } from "@/lib/socket";
import { Question } from "@/lib/question";

const buttons: {
  text: string;
  value: Opinion;
  backgroundColor: string;
  hoverBackgroundColor: string;
  textColor: string;
}[] = [
  {
    text: "Strongly Disagree",
    value: "stronglyDisagree",
    backgroundColor: "bg-red-600/75",
    hoverBackgroundColor: "bg-red-800/75",
    textColor: "text-white",
  },
  {
    text: "Disagree",
    value: "disagree",
    backgroundColor: "bg-red-500/75",
    hoverBackgroundColor: "bg-red-700/75",
    textColor: "text-white",
  },
  {
    text: "No Opinion",
    value: "noOpinion",
    backgroundColor: "bg-gray-500/75",
    hoverBackgroundColor: "bg-gray-700/75",
    textColor: "text-white",
  },
  {
    text: "Agree",
    value: "agree",
    backgroundColor: "bg-green-500/75",
    hoverBackgroundColor: "bg-green-700/75",
    textColor: "text-white",
  },
  {
    text: "Strongly Agree",
    value: "stronglyAgree",
    backgroundColor: "bg-green-600/75",
    hoverBackgroundColor: "bg-green-800/75",
    textColor: "text-white",
  },
];

const SurveyCard = () => {
  const socket = useWebSocket();
  const router = useRouter();
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("questionId") === null) {
      router.push("/");
    } else {
      setQuestion(
        new Question(parseInt(sessionStorage.getItem("questionId")!)),
      );
    }
  }, []);

  function sendOpinionMessage(opinion: Opinion) {
    sendSocketMessage(socket!, {
      type: "opinion",
      data: { opinion },
    });
    setWaitingForPartner(true);
  }

  const createMemoizedSocketEventHandlerCleanup = useMemo(
    () =>
      createSocketEventHandler(
        socket!,
        router,
        {
          type: "addToChatRoom",
          handler: (message) => {
            sessionStorage.setItem("opinion", message.data.opinion);
            sessionStorage.setItem(
              "partnerOpinion",
              message.data.partnerOpinion,
            );
            router.push("/chat");
          },
        },
        {
          type: "failedSurvey",
          handler: (message) => {
            switch (message.data.reason) {
              case "sharedOpinion":
                router.push("/?failed");
                break;
              case "noOpinion":
                router.push("/?failedNoOpinion");
                break;
            }
          },
        },
      ),
    [],
  );

  useEffect(() => {
    return createMemoizedSocketEventHandlerCleanup!;
  }, []);

  return waitingForPartner ? (
    <Spinner label="Waiting for other person to answer..." />
  ) : question === null ? (
    <Spinner />
  ) : (
    <Card className="max-w-[95%]">
      <CardBody>
        <h1 className="text-xl">{question.text}</h1>
        <Divider />
        <p className="text-md">{question.description}</p>
        <Spacer y={4} />
        <ResponsiveButtonGroup>
          {buttons.map((button) => (
            <Button
              key={button.value}
              className={`backdrop-brightness-75 ${button.backgroundColor} hover:${button.hoverBackgroundColor} ${button.textColor}`}
              onClick={() => sendOpinionMessage(button.value)}
            >
              {button.text}
            </Button>
          ))}
        </ResponsiveButtonGroup>
      </CardBody>
    </Card>
  );
};

export default SurveyCard;
