"use client";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@nextui-org/modal";
import { AboutDialog } from "@components/aboutDialog";
import useSocketIo from "@lib/hooks/useSocketIo";

const conditions = [
  "failed",
  "failedNoOpinion",
  "left",
  "endedOn",
  "ended",
  "none",
] as const;

type Condition = (typeof conditions)[number];

const conditionText: Record<
  Condition,
  {
    description: string;
    buttonText: string;
  }
> = {
  failed: {
    description:
      "The other person and you shared an opinion on the previous statement",
    buttonText: "Try Again",
  },
  failedNoOpinion: {
    description: "The other person had no opinion on the previous statement.",
    buttonText: "Try Again",
  },
  left: {
    description: "The other person left",
    buttonText: "Start Again",
  },
  endedOn: {
    description: "The other person ended the chat",
    buttonText: "Chat Again",
  },
  ended: {
    description: "You ended the chat",
    buttonText: "Chat Again",
  },
  none: {
    description: "",
    buttonText: "Start Chatting",
  },
};

const addToRoom = (
  questionId: number,
  router: ReturnType<typeof useRouter>,
) => {
  sessionStorage.setItem("questionId", JSON.stringify(questionId));

  router.push("/survey");
};

export default function Home() {
  const socket = useSocketIo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [currentOnlineCount, setCurrentOnlineCount] = useState<number | null>(
    null,
  );
  const {
    isOpen: aboutDialogIsOpen,
    onOpenChange: aboutDialogOnOpenChange,
    onOpen: aboutDialogOnOpen,
  } = useDisclosure();

  useEffect(() => {
    socket.on("addToRoom", async ({ questionId }) => {
      addToRoom(questionId, router);
    });

    socket.on("currentOnline", async ({ count }) => {
      setCurrentOnlineCount(count);
    });

    return () => {
      socket.off("addToRoom");
      socket.off("currentOnline");
    };
  }, []);

  useEffect(() => {
    socket.emit("requestCurrentlyOnlineCount", {}, ({ count }) => {
      setCurrentOnlineCount(count);
    });
  }, [socket]);

  useEffect(() => {
    for (const checkCondition of conditions) {
      if (searchParams.get(checkCondition) !== null) {
        setCondition(checkCondition);

        return;
      }
    }

    setCondition("none");
  }, [searchParams]);

  async function addToQueue() {
    const res = socket.emit("addToQueue", {}, (res) => {
      switch (res.message) {
        case "waiting":
          setWaitingForPartner(true);
          break;
        case "addToRoom":
          addToRoom(res.questionId, router);
      }
    });
  }

  return (
    <>
      <AboutDialog
        isOpen={aboutDialogIsOpen}
        onOpenChange={aboutDialogOnOpenChange}
      />
      <div className="flex flex-col items-center justify-center min-h-screen">
        {waitingForPartner ||
        condition === null ||
        socket === null ||
        currentOnlineCount === null ? (
          <Spinner
            label={
              waitingForPartner ? "Finding another person..." : "Loading..."
            }
          />
        ) : (
          <>
            {condition !== null && condition !== "none" && (
              <p className="py-4 text-center">
                {conditionText[condition].description}
              </p>
            )}
            <span className="mb-6 text-center">
              {currentOnlineCount === 1 ? (
                <p>You are the first one here!</p>
              ) : (
                <p>
                  There are currently{" "}
                  <span className="font-mono">{currentOnlineCount}</span> people
                  online.
                </p>
              )}
            </span>

            <Button
              color="primary"
              radius="full"
              size="lg"
              variant="bordered"
              onClick={async () => {
                addToQueue();
              }}
            >
              {conditionText[condition].buttonText}
            </Button>
            <a
              className="cursor-pointer italic mt-6"
              onClick={aboutDialogOnOpen}
            >
              About
            </a>
          </>
        )}
      </div>
    </>
  );
}
