import "server-only";

export {
  listCurricula,
  listActiveCurricula,
  type CurriculumDto,
  listDepartments,
  listActiveDepartments,
  getDepartment,
  type DepartmentDto,
} from "./_internal/services";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
