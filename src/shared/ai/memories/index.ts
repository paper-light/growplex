import type { RoomMemory } from "./load-room-memory";
import type { IntegrationMemory } from "./load-integration-memory";
import type { ProjectMemory } from "./load-project-memory";

import { loadRoomMemory } from "./load-room-memory";
import { loadIntegrationMemory } from "./load-integration-memory";
import { loadProjectMemory } from "./load-project-memory";

export type Memory = {
  room: RoomMemory;
  integration: IntegrationMemory;
  project: ProjectMemory;
};

export async function loadMemory(roomId: string): Promise<Memory> {
  const roomMemory = await loadRoomMemory(roomId);
  const integrationMemory = await loadIntegrationMemory(
    roomMemory.chat.integration
  );
  const projectMemory = await loadProjectMemory(roomMemory.chat.project);

  return {
    room: roomMemory,
    integration: integrationMemory,
    project: projectMemory,
  };
}
