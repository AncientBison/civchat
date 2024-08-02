"use client";

import { Button } from "@nextui-org/button";
import { connectToQueue } from "";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button radius="full" size="lg" color="primary" variant="bordered" onClick={async () => {
        await connectToQueue();
      }}>Start Chatting</Button>
    </div>
  );
}