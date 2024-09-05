import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal";
import { Accordion, AccordionItem } from "@nextui-org/accordion";

export function AboutDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  return (
    <Modal
      isDismissable={true}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">About</ModalHeader>
            <ModalBody>
              <Accordion>
                <AccordionItem
                  key="1"
                  aria-label="What is civchat?"
                  title="What is CivChat?"
                >
                  CivChat is a chat made to help unite Americans. Our goal is to
                  create a place for healthy conversations between people with
                  differing views to allow mutual understanding and inspire
                  cooperation amongts the polarized population.
                </AccordionItem>
                <AccordionItem
                  key="2"
                  aria-label="Who We Are"
                  title="Who We Are"
                >
                  CivChat was created by Liam Bridgers and Ilan Bernstein, two
                  high school students from Massachusetts. They both have been
                  learning computer science and web development for multiple
                  years and want to use their skills to help the world.
                </AccordionItem>
                <AccordionItem key="3" aria-label="FAQs" title="FAQs">
                  <p className="font-bold">Is CivChat anonymous?</p>
                  <p>
                    Yes! We pride ourselves in allowing you to chat completely
                    anonymously.
                  </p>
                  <br />
                  <p className="font-bold">Is CivChat moderated?</p>
                  <p>
                    We trust our users to moderate themselves using the chat
                    rules.
                  </p>
                  <br />
                  <p className="font-bold">
                    I found an issue; How can I report this?
                  </p>
                  <p>
                    If you found an issue, please send us an email at{" "}
                    <span className="font-mono">support@civchat.com</span>.
                  </p>
                </AccordionItem>
              </Accordion>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
