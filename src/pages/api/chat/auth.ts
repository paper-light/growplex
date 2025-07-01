import { JWT_SECRET, MONO_URL } from "astro:env/server";
import jwt from "jsonwebtoken";

import { pb } from "../../../lib/config/pb";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST({ request }: { request: Request }) {
  try {
    const { id } = await request.json();
    if (!id)
      return new Response("Missing id", {
        status: 400,
        headers: CORS_HEADERS,
      });

    const chat = await pb.collection("chats").getOne(id);
    if (!chat)
      return new Response("Chat not found", {
        status: 404,
        headers: CORS_HEADERS,
      });

    const origin = request.headers.get("origin"); // || request.headers.get("referer");
    if (!origin)
      return new Response("Missing Origin", {
        status: 400,
        headers: CORS_HEADERS,
      });

    // let originHost;
    // try {
    //   originHost = new URL(origin).hostname;
    // } catch {
    //   originHost = origin;
    // }

    console.log(chat.domain, origin, MONO_URL);
    if (chat.domain !== origin && origin !== MONO_URL) {
      return new Response("Forbidden", {
        status: 403,
        headers: CORS_HEADERS,
      });
    }

    const payload = {
      id: chat.id,
      origin: origin,
      domain: chat.domain,
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
