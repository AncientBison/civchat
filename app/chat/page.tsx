import { Metadata } from "next";
import InnerChatPage from "@app/chat/innerPage";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatPage() {
  return <InnerChatPage />;
}
