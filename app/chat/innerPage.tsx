"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { useRouter } from "next/navigation";
import { ChatMessage } from "@components/chatMessage";
import { LoadingTripleDots } from "@components/loadingTripleDots";
import { Question } from "@lib/question";
import { ChatRulesDialog } from "@components/chatRulesDialog";
import { FullSpinner } from "@components/FullSpinner";
import { Opinion } from "@type/opinion";
import {
  CivChatSessionStorage,
  ensureStorageIsCivChatSessionStorage,
} from "@app/env";
import useSocketIo from "@lib/hooks/useSocketIo";

export interface TextMessage {
  text: string;
  sender: "user" | "other";
}

function opinionToHumanReadable(opinion: string) {
  switch (opinion) {
    case "agree":
      return "Agree";
    case "stronglyAgree":
      return "Strongly Agree";
    case "disagree":
      return "Disagree";
    case "stronglyDisagree":
      return "Strongly Disagree";
    case "noOpinion":
      return "No Opinion";
    default:
      return "Something Went Wrong";
  }
}

export default function InnerChatPage() {
  const socket = useSocketIo();
  const router = useRouter();

  const [questionAndOpinions, setQuestionAndOpinions] = useState<
    (CivChatSessionStorage & { question: Question }) | null
  >(null);

  useEffect(() => {
    if (!ensureStorageIsCivChatSessionStorage(sessionStorage)) {
      router.push("/");
    } else {
      setQuestionAndOpinions({
        questionId: sessionStorage.getItem("questionId")!,
        question: new Question(parseInt(sessionStorage.getItem("questionId")!)),
        opinion: sessionStorage.getItem("opinion")! as Opinion,
        partnerOpinion: sessionStorage.getItem("partnerOpinion")! as Opinion,
      });
    }
  }, []);

  const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
  const [inputTextMessage, setInputTextMessage] = useState<string>("");
  const [partnerTyping, setPartnerTyping] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const textMessageEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (): void => {
    const textMessageToSend = inputTextMessage.trim();

    if (textMessageToSend) {
      setTextMessages((oldTextMessages) => [
        ...oldTextMessages,
        { text: textMessageToSend, sender: "user" },
      ]);
      setInputTextMessage("");
      socket.emit(
        "textMessage",
        {
          text: textMessageToSend,
        },
        () => {},
      );

      setTyping(false);
    }
  };

  useEffect(() => {
    socket.on("textMessage", async ({ text }) => {
      setPartnerTyping(false);
      setTextMessages((oldTextMessages) => [
        ...oldTextMessages,
        { text, sender: "other" },
      ]);
    });

    socket.on("endChat", async () => {
      router.push("/?endedOn");
    });

    socket.on("typingState", async ({ typing }) => {
      setPartnerTyping(typing);
    });

    return () => {
      socket.off("textMessage");
      socket.off("endChat");
      socket.off("typingState");
    };
  }, []);

  const scrollToBottom = (): void => {
    textMessageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [textMessages]);

  useEffect(() => {
    if (partnerTyping) {
      scrollToBottom();
    }
  }, [partnerTyping]);

  useEffect(() => {
    socket.emit(
      "typingState",
      {
        typing,
      },
      () => {},
    );
  }, [typing]);

  return questionAndOpinions === null ? (
    <FullSpinner />
  ) : (
    <>
      <ChatRulesDialog />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="h-[95vh] w-full max-w-7xl">
          <CardHeader className="border-b flex justify-between">
            <h2 className="text-xl font-bold">Chat</h2>
            <Button
              color="danger"
              onClick={() => {
                socket.emit("endChat", {}, () => {});
                router.push("/?ended");
              }}
            >
              End Chat
            </Button>
          </CardHeader>
          <CardBody className="h-[90vh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 scrollbar-thumb-rounded-full">
            <p className="font-bold">{questionAndOpinions!.question.text}</p>
            <p>
              You said: {opinionToHumanReadable(questionAndOpinions!.opinion)}
            </p>
            <p className="pb-3">
              They said:{" "}
              {opinionToHumanReadable(questionAndOpinions!.partnerOpinion)}
            </p>
            {textMessages.map((message, index) => (
              <ChatMessage key={index} textMessage={message} />
            ))}
            {partnerTyping && (
              <ChatMessage
                textMessage={{
                  sender: "other",
                  element: <LoadingTripleDots />,
                }}
              />
            )}
            <div ref={textMessageEndRef} />
          </CardBody>
          <CardFooter>
            <div className="flex w-full">
              <Input
                autoFocus
                className="flex-grow"
                placeholder="Type a message..."
                value={inputTextMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTyping(e.target.value !== "");
                  setInputTextMessage(e.target.value);
                }}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" && handleSend()
                }
              />
              <Button color="primary" className="ml-2" onClick={handleSend}>
                Send
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
