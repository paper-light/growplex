import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { AUTH_JWT_SECRET } from "astro:env/server";

import { pb } from "@/shared/lib/pb";
import {
  RoomsTypeOptions,
  type LeadsResponse,
} from "@/shared/models/pocketbase-types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST({ request }: { request: Request }) {
  try {
    let { chatId, roomId, username, identity } = await request.json();

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

    if (chat.domain !== origin) {
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
        const room = await initRoom(chat.id, identity);
        roomId = room.id;
      }
    } else {
      const room = await initRoom(chat.id, identity);
      roomId = room.id;
    }

    const payload = {
      roomId,
      username,
      theme: chat.theme,
    };
    const token = jwt.sign(payload, AUTH_JWT_SECRET);
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

async function initRoom(chatId: string, identity?: string) {
  let lead: LeadsResponse | null = null;
  let newLead = true;

  const leads = await pb.collection("leads").getFullList({
    filter: `id = "${identity}" || externalUser = "${identity}"`,
  });

  if (leads.length > 0) {
    lead = leads[0];
    newLead = false;
  }

  if (!lead) {
    const chat = await pb.collection("chats").getOne(chatId, {
      expand: "project",
    });
    const project = (chat.expand as any)?.project;
    if (!project) throw new Error("Chat does not have a project");

    lead = await pb.collection("leads").create({
      name: `Guest-${nanoid(2)}`,
      externalUser: identity,
      level: "cold",
      project: project.id,
    });
  }

  const room = await pb.collection("rooms").create({
    chat: chatId,
    status: newLead ? "seeded" : "auto",
    type: RoomsTypeOptions.chatWidget,
    lead: lead!.id,
  });
  return room;
}
