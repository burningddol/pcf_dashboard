import { z } from "zod";
import { ACTIVITY_TYPES, SCOPES } from "./constants";

export const ActivityFormSchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  factorId: z.string().min(1, "배출계수를 선택해주세요."),
  description: z.string().min(1, "설명을 입력해주세요."),
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "YYYY-MM 형식으로 입력해주세요."),
  amount: z.number({ message: "활동량을 입력해주세요." }).positive("활동량은 0보다 커야 합니다."),
});

export type ActivityFormValues = z.infer<typeof ActivityFormSchema>;

export const CreateActivityBodySchema = ActivityFormSchema.extend({
  companyId: z.string().min(1),
  unit: z.string().min(1),
  scope: z.enum(SCOPES),
});

export type CreateActivityBody = z.infer<typeof CreateActivityBodySchema>;
