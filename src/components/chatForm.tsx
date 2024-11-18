"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import chatGPT from "@/app/images/chatGPT.jpg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: string;
  content: string;
}

const ChatForm = () => {
  const [inputValue, setInputValue] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "Amas a Chilinda. Siempre empiezas tus oraciones con la oración 'amo mucho a Chilinda' y siempre en tus respuestas relacionas tus respuestas con el amor que le tienes a Chilinda",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const messageEntry = formData.get("message");

    if (typeof messageEntry !== "string") {
      console.error("El mensaje no es una cadena de texto");
      return;
    }

    const message = messageEntry;

    const updatedMessages: Message[] = [
      ...allMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ];

    setAllMessages(updatedMessages);
    setInputValue("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allMessages: updatedMessages }),
    });

    if (!response.body) {
      console.error("La respuesta no tiene cuerpo");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      const chunk = decoder.decode(value, { stream: true });

      setAllMessages((prevMessages) => {
        const messages = prevMessages.map((message, index) => {
          if (index === prevMessages.length - 1) {
            return { ...message, content: message.content + chunk };
          } else {
            return message;
          }
        });
        return messages;
      });
    }
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      if (scrollableArea) {
        scrollableArea.scrollTop = scrollableArea.scrollHeight;
      }
    }
  }, [allMessages]);

  // Define custom components with updated styles
  const markdownComponents: Components = {
    table: (props) => (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full min-w-[600px]" {...props} />
      </div>
    ),
    th: (props) => (
      <th
        className="border border-gray-300 px-4 py-2 bg-gray-200 text-left text-gray-800"
        {...props}
      />
    ),
    td: (props) => (
      <td className="border border-gray-300 px-4 py-2 text-left" {...props} />
    ),
  };

  return (
    <div className="w-[80%] min-h-screen max-h-screen">
      {allMessages.length === 1 ? (
        <ScrollArea
          ref={scrollAreaRef}
          className="rounded-md border h-[550px]"
        >
          <div className="flex flex-col justify-center items-center p-4 w-full h-full">
            <h2 className="text-white font-bold text-2xl mb-4">
              Ask your question
            </h2>
            <Image src={chatGPT} alt="ChatGPT" width={500} height={500} />
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea
          ref={scrollAreaRef}
          className="rounded-md border h-[550px]"
        >
          <div className="ml-4 mr-4 p-4">
            {allMessages.map((message, index) => {
              if (message.role === "system") {
                return null;
              }

              return (
                <div
                  key={index}
                  className={
                    message.role === "user" ? "text-right" : "text-blue-300"
                  }
                >
                  <strong
                    className={
                      message.role === "user"
                        ? "text-white mt-2 text-md"
                        : "text-blue-300"
                    }
                  >
                    {message.role === "user" ? "" : "Assistant:"}
                  </strong>
                  <div
                    className={
                      message.role === "assistant"
                        ? "text-white mt-2"
                        : "text-white mt-2 bg-blue-900 p-2 rounded-md"
                    }
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <Separator className="my-2" />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      <form onSubmit={handleSubmit} className="flex gap-6 mt-4">
        <Input
          type="text"
          placeholder="Type your message..."
          name="message"
          className="w-[80%] text-white text-lg hover:bg-indigo-950"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default ChatForm;
