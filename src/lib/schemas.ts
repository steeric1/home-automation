import z from "zod";

import { departureTimePoiLabels } from "./const";

export const departureSchema = z
    .object({
        nearDepartureTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        farDepartureTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        rawDepartureTime: z
            .string()
            .regex(
                new RegExp(
                    `^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z) (${departureTimePoiLabels.near}|${departureTimePoiLabels.far})$`
                )
            )
    })
    .partial()
    .refine(
        (obj) => Object.values(obj).some((val) => val !== undefined),
        "Ainakin yksi lähtöaika vaaditaan."
    );
