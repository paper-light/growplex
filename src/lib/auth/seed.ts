import type z from "zod";

import {
  OrgSchema,
  OrgMemberSchema,
  ProjectSchema,
  type UserSchema,
} from "../../models";

import { pb } from "../config/pb";

export async function seed(user: z.infer<typeof UserSchema>) {
  const project = ProjectSchema.parse(
    await pb.collection("projects").create({ name: "Default" })
  );
  const org = OrgSchema.parse(
    await pb.collection("orgs").create({
      name: `${user.name}'s Org`,
      projects: [project.id],
    })
  );

  const { items } = await pb.collection("orgMembers").getList(1, 1, {
    filter: `org = "${org.id}" && role = "owner"`,
  });
  if (items.length > 0) {
    throw new Error("owner already exists");
  }

  const orgMem = OrgMemberSchema.parse(
    await pb.collection("orgMembers").create({
      org: org.id,
      role: "owner",
    })
  );
  await pb.collection("users").update(user.id, {
    orgMembers: [orgMem.id],
  });
}
