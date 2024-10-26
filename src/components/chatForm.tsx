"use client";

import { useState } from "react";

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "./ui/input";
import { Button } from "./ui/button";


const ChatForm = () => {
  const [resultado, setResultado] = useState(""); // Estado para el resultado parcial
  const [inputValue, setInputValue] = useState("");
  const [allMessages, setAllMessages] = useState([
    { role: "system", content: "Eres un asistente útil que ayuda con X." },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = new FormData(e.target as HTMLFormElement).get("message");
    console.log(resultado)

    const updatedMessages = [
      ...allMessages,
      { role: "user", content: message as string },
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

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let completeMessage = ""; // Aquí almacenamos el mensaje completo

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      // Decodifica el valor recibido
      const chunk = decoder.decode(value, { stream: true });
      completeMessage += chunk; // Acumula el mensaje completo
      setResultado((prevResultado) => prevResultado + chunk); // Actualiza el resultado visible en tiempo real
    }

    // Una vez que se ha recibido todo el mensaje, lo guardamos en allMessages
    setAllMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: completeMessage },
    ]);

    // Limpia el resultado parcial
    setResultado("");
  };
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollableArea) {
        scrollableArea.scrollTop = scrollableArea.scrollHeight
      }
    }
  }, [allMessages])

  return (
    <div className="w-full h-full">
    
    
      <ScrollArea ref={scrollAreaRef} className="h-[500px] min-w-96 rounded-md border bg-gray-100">
        <div>
          {allMessages.map((message, index) => (
            <div key={index}>
              <strong>{message.role}: </strong>
              {message.content}
              <Separator className="my-2" />
            </div>
           
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-6 mt-4">
      <Input
  type="text"
  placeholder="Type your message..."
  name="message"
  className="w-[80%]"
  value={inputValue} // Vincula el valor del input al estado
  onChange={(e) => setInputValue(e.target.value)} 
/>
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default ChatForm;
