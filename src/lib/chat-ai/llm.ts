import * as hub from "langchain/hub/node";

import { getEnv } from "../../helpers/get-env";

const ENV = getEnv("ENV");

export const chain = await hub.pull(`chat-system:${ENV}`, {
  includeModel: true,
});
