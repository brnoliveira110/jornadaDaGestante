import { z } from "zod";
import { BloodType } from "../types";

export const pregnancySetupSchema = z.object({
    dum: z.string().min(1, "Data da Última Menstruação é obrigatória"),
    initialWeight: z.coerce.number().min(30, "Peso inicial inválido").max(200, "Peso inicial inválido"),
    preGestationalHeight: z.coerce.number().min(100, "Altura inválida (em cm)").max(250, "Altura inválida"),
    bloodType: z.any(), // Simplified for now, can be stricter
    spouseBloodType: z.any().optional(),
    weightGoalMin: z.coerce.number().min(0, "Meta mínima inválida"),
    weightGoalMax: z.coerce.number().min(0, "Meta máxima inválida")
}).refine((data) => data.weightGoalMax >= data.weightGoalMin, {
    message: "A meta máxima deve ser maior ou igual à mínima",
    path: ["weightGoalMax"],
});

export type PregnancySetupFormValues = z.infer<typeof pregnancySetupSchema>;
