import { MessageType, TypedMessage } from "@type/message";

export function isPayloadOfType<T extends MessageType>(
  message: any,
  type: T,
): message is TypedMessage<T> {
  return message.type !== undefined && message.type === type;
}
