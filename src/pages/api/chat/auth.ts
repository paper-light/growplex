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

    // Add basic validation for URL format
    try {
      new URL(chat.domain); // Validate stored domain is valid URL
      new URL(origin); // Validate origin is valid URL
    } catch {
      return new Response("Invalid domain format", {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    // Hybrid approach: full origin for external domains, hostname for internal MONO_URL
    const originHost = new URL(origin).hostname;
    const monoHost = new URL(MONO_URL).hostname;

    console.log("Domain check:", chat.domain, origin, MONO_URL);
    if (chat.domain !== origin && originHost !== monoHost) {
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
