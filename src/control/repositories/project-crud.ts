import { pb } from "../../shared/lib/pb";
import {
  CreateProjectDTOSchema,
  UpdateProjectDTOSchema,
  type CreateProjectDTO,
  type UpdateProjectDTO,
} from "../../shared/models/dto/project";

export const projectCrud = {
  async create(raw: CreateProjectDTO) {
    const dto = CreateProjectDTOSchema.parse(raw);
    const project = await pb.collection("projects").create(dto);
    return project;
  },
  async update(raw: UpdateProjectDTO) {
    const dto = UpdateProjectDTOSchema.parse(raw);
    const project = await pb.collection("projects").update(dto.id, dto);
    return project;
  },
  async delete(id: string) {
    return await pb.collection("projects").delete(id);
  },
};
