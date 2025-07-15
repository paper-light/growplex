import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONO_URL } from "astro:env/server";

import { pb } from "../../../shared/lib/pb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST({ request }: { request: Request }) {
  try {
    let { chatId, roomId, username } = await request.json();

    if (!chatId)
      return new Response("Missing id", {
        status: 400,
        headers: CORS_HEADERS,
      });

    const chat = await pb.collection("chats").getOne(chatId);
    if (!chat)
      return new Response("Chat not found", {
        status: 404,
        headers: CORS_HEADERS,
      });

    const origin = request.headers.get("origin");
    if (!origin)
      return new Response("Missing Origin", {
        status: 400,
        headers: CORS_HEADERS,
      });

    try {
      new URL(chat.domain);
      new URL(origin);
    } catch {
      return new Response("Invalid domain format", {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const originHost = new URL(origin).hostname;
    const monoHost = new URL(MONO_URL).hostname;

    if (chat.domain !== origin && originHost !== monoHost) {
      return new Response("Forbidden", {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    if (!username) {
      username = `Guest-${nanoid(6)}`;
    }

    if (roomId) {
      try {
        const room = await pb.collection("rooms").getOne(roomId);
        if (room.chat !== chat.id) {
          return new Response("Forbidden: Room does not belong to chat", {
            status: 403,
            headers: CORS_HEADERS,
          });
        }
      } catch (err) {
        const room = await pb.collection("rooms").create({
          chat: chat.id,
          status: "seeded",
        });
        roomId = room.id;
      }
    } else {
      const room = await pb.collection("rooms").create({
        chat: chat.id,
        status: "seeded",
      });
      roomId = room.id;
    }

    const payload = {
      roomId,
      username,
      theme: chat.theme,
    };
    const token = jwt.sign(payload, JWT_SECRET);
    return new Response(JSON.stringify({ token, payload }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Server error", {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
