import { MessageType, TypedMessage } from "@/app/api/route";

export function isPayloadOfType<T extends MessageType>(
  message: any,
  type: T,
): message is TypedMessage<T> {
  return message.type !== undefined && message.type === type;
}
