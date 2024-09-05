import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

export function ChatRulesDialog() {
  const { isOpen, onOpenChange } = useDisclosure({
    defaultOpen: true,
  });

  return (
    <Modal
      hideCloseButton={true}
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      isOpen={isOpen}
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Rules</ModalHeader>
            <ModalBody>
              <ul className="list-disc list-inside">
                <li>Respect others viewpoints even if you do not agree</li>
                <li>Allow the other person time to explain their opinion</li>
                <li>Stay on topic</li>
                <li>Do not use any abusive or inappropriate language</li>
                <li>Keep an open mind to others&#39; views</li>
                <li>Do not share any personal information</li>
              </ul>
              <p className="font-bold">
                If the other user is not following these rules, feel free to
                leave the chat.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                I pledge to follow these rules
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
