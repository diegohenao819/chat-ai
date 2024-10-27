"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import chatGPT from "@/app/images/chatGPT.jpg";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Definir una interfaz para los mensajes
interface Message {
  role: string;
  content: string;
}

const ChatForm = () => {
  const [inputValue, setInputValue] = useState("");
  // Especificar el tipo de estado como un arreglo de Message
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

    // Verificar que messageEntry es una cadena de texto
    if (typeof messageEntry !== "string") {
      console.error("El mensaje no es una cadena de texto");
      return;
    }

    const message = messageEntry;

    // Agregar el mensaje del usuario y un mensaje vacío del asistente
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

      // Actualizar el contenido del último mensaje del asistente
      setAllMessages((prevMessages) => {
        const messages = prevMessages.map((message, index) => {
          if (index === prevMessages.length - 1) {
            // Crear una nueva copia del mensaje y actualizar el contenido
            return { ...message, content: message.content + chunk };
          } else {
            return message;
          }
        });
        return messages;
      });
    }
  };

  // Especificar el tipo del ref como HTMLDivElement
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

  // Función para parsear el Markdown
  function parseMarkdown(content: string) {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      // Manejar títulos
      if (line.startsWith("### ")) {
        const text = line.slice(4);
        const formattedText = formatBoldText(text);
        elements.push(
          <h3 key={index} className="text-lg font-bold mb-2">
            {formattedText}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        const text = line.slice(3);
        const formattedText = formatBoldText(text);
        elements.push(
          <h2 key={index} className="text-xl font-bold mb-2">
            {formattedText}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        const text = line.slice(2);
        const formattedText = formatBoldText(text);
        elements.push(
          <h1 key={index} className="text-2xl font-bold mb-2">
            {formattedText}
          </h1>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={index} className="my-2" />);
      } else {
        const formattedText = formatBoldText(line);
        elements.push(
          <p key={index} className="mb-2">
            {formattedText}
          </p>
        );
      }
    });

    return elements;
  }

  // Función para formatear el texto en negrita
  function formatBoldText(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^\*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold">
            {boldText}
          </strong>
        );
      } else {
        return part;
      }
    });
  }

  return (
    <div className="w-[80%] min-h-screen max-h-screen">
      {allMessages.length === 1 ? (
        <ScrollArea ref={scrollAreaRef} className="rounded-md border h-[550px]">
          <div className="flex flex-col justify-center items-center p-4 w-full h-full">
            <h2 className="text-white font-bold text-2xl mb-4">
              Ask your question
            </h2>
            <Image src={chatGPT} alt="ChatGPT" width={500} height={500} />
          </div>
        </ScrollArea>
      ) : (
        <ScrollArea ref={scrollAreaRef} className="rounded-md border h-[550px]">
          <div className="ml-4 mr-4 p-4">
            {allMessages.map((message, index) => {
              if (message.role === "system") {
                return null; // Omitir mensajes del sistema
              }

              return (
                <div
                  key={index}
                  className={
                    message.role === "user" ? " text-right" : "text-blue-300"
                  }
                >
                  <strong
                    className={
                      message.role === "user"
                        ? "text-white mt-2  text-md"
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
                    {parseMarkdown(message.content)}
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
