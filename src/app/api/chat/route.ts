"use server";

import { NextResponse } from "next/server";
import OpenAI from "openai";

// Definir el manejador para solicitudes POST con streaming
export async function POST(request: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Leer los datos enviados en el cuerpo de la solicitud
  const body = await request.json();

  // Crear un stream con OpenAI
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: body.allMessages,
    stream: true, // Habilitar el streaming
  });

  // Crear un ReadableStream para enviar datos progresivamente al cliente
  const readableStream = new ReadableStream({
    async start(controller) {
      // Leer los datos del stream de OpenAI y enviarlos en chunks
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(new TextEncoder().encode(content)); // Enviar el chunk al cliente
      }
      controller.close(); // Cerrar el stream cuando termine
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
