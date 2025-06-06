// src/lib/pb.ts
import PocketBase from "pocketbase";

import { getEnv } from "../../helpers/get-env";

const PUBLIC_PB_URL = getEnv("PUBLIC_PB_URL");

export const pb = new PocketBase(PUBLIC_PB_URL);
