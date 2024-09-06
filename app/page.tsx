"use client";

import { Button } from "@nextui-org/button";
import { Spinner } from "@nextui-org/spinner";
import { useWebSocket } from "next-ws/client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDisclosure } from "@nextui-org/modal";

import { createSocketEventHandler } from "@/lib/socketEventHandler";
import { sendSocketMessage } from "@/lib/socket";
import { AboutDialog } from "@/components/aboutDialog";

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

export default function Home() {
  const socket = useWebSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [waitingForPartner, setWaitingForPartner] = useState(false);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [idSet, setIdSet] = useState<boolean>(false);
  const {
    isOpen: aboutDialogIsOpen,
    onOpenChange: aboutDialogOnOpenChange,
    onOpen: aboutDialogOnOpen,
  } = useDisclosure();

  const createMemoizedSocketEventHandlerCleanup = useMemo(
    () =>
      createSocketEventHandler(
        socket!,
        router,
        {
          type: "waiting",
          handler: () => {
            setWaitingForPartner(true);
          },
        },
        {
          type: "addToRoom",
          handler: (message) => {
            sessionStorage.setItem(
              "questionId",
              JSON.stringify(message.data.questionId),
            );
            router.push("/survey");
          },
        },
        {
          type: "setIdResult",
          handler: (message) => {
            if (
              message.data.message === "generatedId" ||
              message.data.message === "setId" ||
              message.data.message === "idAlreadySet"
            ) {
              localStorage.setItem("id", message.data.id);
              setIdSet(true);
            } else if (message.data.message === "idTaken") {
              sendSocketMessage(socket!, {
                type: "setId",
                data: {
                  id: undefined,
                },
              });
            }
          },
        },
      ),
    [],
  );

  useEffect(() => {return createMemoizedSocketEventHandlerCleanup!}, []);

  useEffect(() => {
    sendSocketMessage(socket!, {
      type: "setId",
      data: {
        id: localStorage.getItem("id") ?? undefined,
      },
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
    sendSocketMessage(socket!, { type: "addToQueue" });
    setWaitingForPartner(true);
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
        !idSet ? (
          <Spinner
            label={
              condition === null || socket === null || !idSet
                ? "Loading..."
                : "Finding another person..."
            }
          />
        ) : (
          <>
            {condition !== null && condition !== "none" && (
              <p className="py-4">{conditionText[condition].description}</p>
            )}

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
