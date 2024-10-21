"use client";

import { useState } from "react";

const ChatForm = () => {
  const [resultado, setResultado] = useState(""); // Estado para el resultado

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = new FormData(e.target as HTMLFormElement).get("message");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: message }),
    });
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      // Decodifica el valor recibido y actualiza el estado con el texto recibido
      const chunk = decoder.decode(value, { stream: true });

      // Aquí actualizamos el estado resultado, concatenando el nuevo chunk
      setResultado((prevResultado) => prevResultado + chunk);

      // También puedes imprimir en consola lo que se va recibiendo
      console.log("Streamed data:", chunk);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Type your message..." name="message" />
        <button type="submit">Send</button>
      </form>

      <div>
        <h2>Resultado</h2>
        {/* Aquí mostramos el resultado actualizado en tiempo real */}
        <p>{resultado}</p>
      </div>
    </div>
  );
};

export default ChatForm;
