"use client";

import { Card, CardBody } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { Spacer } from "@nextui-org/spacer";
import { Divider } from "@nextui-org/divider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@lib/question";
import { Opinion } from "@type/opinion";
import { ResponsiveButtonGroup } from "@components/ResponsiveButtonGroup";
import useSocketIo from "@lib/hooks/useSocketIo";
import { FailedSurveyReason } from "@lib/socketEndpoints/events";

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

const addToChatRoom = (
  opinion: Opinion,
  partnerOpinion: Opinion,
  router: ReturnType<typeof useRouter>,
) => {
  sessionStorage.setItem("opinion", opinion);
  sessionStorage.setItem("partnerOpinion", partnerOpinion);

  router.push("/chat");
};

const failedSurvey = (
  reason: FailedSurveyReason,
  router: ReturnType<typeof useRouter>,
) => {
  switch (reason) {
    case "sharedOpinion":
      router.push("/?failed");
      break;
    case "noOpinion":
      router.push("/?failedNoOpinion");
      break;
  }
};

const SurveyCard = () => {
  const socket = useSocketIo();
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
    socket.emit(
      "opinion",
      {
        opinion,
      },
      (res) => {
        switch (res.message) {
          case "addToChatRoom":
            addToChatRoom(res.opinion, res.partnerOpinion, router);
            break;
          case "failedSurvey":
            failedSurvey(res.reason, router);
            break;
          case "internalServerError":
            router.push("/");
            break;
          case "noPartnerId":
            router.push("/");
            break;
          case "waitingForPartnerOpinion":
            setWaitingForPartner(true);
            break;
        }
      },
    );
  }

  useEffect(() => {
    socket.on("failedSurvey", async ({ reason }) => {
      failedSurvey(reason, router);
    });

    socket.on("addToChatRoom", async ({ opinion, partnerOpinion }) => {
      addToChatRoom(opinion, partnerOpinion, router);
    });

    return () => {
      socket.off("failedSurvey");
      socket.off("addToChatRoom");
    };
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
