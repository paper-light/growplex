import type { RecordSubscription } from "pocketbase";
import type { StructuredTool } from "@langchain/core/tools";

import type { MessagesResponse } from "@/shared/models/pocketbase-types";
import type { Usager } from "@/billing/usager";
import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";

import { rejectTool } from "./reject-tool";
import { approveTool } from "./approve-tool";

const log = logger.child({ module: "shared:ai:tools:msg-wait" });

export async function msgWait(
  e: RecordSubscription<MessagesResponse>,
  timeout: NodeJS.Timeout,
  resolve: () => void,
  reject: (error: Error) => void,
  msg: MessagesResponse,
  tool: StructuredTool,
  toolCall: any,
  memory: any,
  runConfig: any,
  usager: Usager
) {
  log.debug({ e }, "Tool update event for tool call");
  switch (e.action) {
    case "update":
      const metadata = e.record.metadata as any;

      // REJECT
      if (metadata.rejected) {
        clearTimeout(timeout);
        pb.collection("messages").unsubscribe(msg.id);
        try {
          await rejectTool(
            msg,
            toolCall,
            memory,
            runConfig,
            metadata,
            "Tool was rejected by user"
          );
        } catch (error) {
          log.error({ error }, "Failed to update message on rejection");
        }
        reject(new Error("Tool was rejected by user"));
        return;
      }

      // APPROVE
      if (metadata.approved) {
        clearTimeout(timeout);
        pb.collection("messages").unsubscribe(msg.id);
        try {
          await approveTool(
            tool,
            toolCall,
            msg,
            memory,
            metadata,
            runConfig,
            usager
          );
        } catch (error) {
          log.error({ error }, "Failed to execute tool on approval");
        }
        resolve();
      }
      break;
    case "delete":
      clearTimeout(timeout);
      pb.collection("messages").unsubscribe(msg.id);
      reject(new Error("Message was deleted while waiting for approval"));
      break;
    default:
      log.debug({ e }, `Received action: ${e.action}`);
      break;
  }
}
