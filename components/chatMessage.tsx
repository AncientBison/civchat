import { Avatar } from "@nextui-org/avatar";
import React, { memo } from "react";

import { TextMessage } from "@/app/chat/innerPage";

type ChatMessageProps = {
  textMessage: TextMessage;
};

type ChatMessagePropsWithElement = {
  textMessage: {
    sender: "user" | "other";
    element: React.ReactNode;
  };
};

function isTextMessage(textMessage: any): textMessage is TextMessage {
  if (textMessage.text !== undefined) {
    return true;
  }

  return false;
}

function ChatMessagePure(
  props: ChatMessageProps | ChatMessagePropsWithElement,
) {
  const { textMessage } = props;

  return (
    <div
      className={`flex ${
        textMessage.sender === "user" ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {textMessage.sender === "other" && (
        <Avatar
          className="mr-2"
          src="https://static-00.iconduck.com/assets.00/person-icon-476x512-hr6biidg.png"
        />
      )}
      <div
        className={`px-4 py-2 rounded-lg max-w-[70%] ${
          textMessage.sender === "user"
            ? "bg-blue-500 text-white"
            : "bg-zinc-700 text-white"
        } ${
          isTextMessage(textMessage) ? "" : "flex justify-center items-center"
        }`}
      >
        {isTextMessage(textMessage) ? textMessage.text : textMessage.element}
      </div>
      {textMessage.sender === "user" && (
        <Avatar
          className="ml-2"
          src="https://static-00.iconduck.com/assets.00/person-icon-476x512-hr6biidg.png"
        />
      )}
    </div>
  );
}

export const ChatMessage = memo(ChatMessagePure);
