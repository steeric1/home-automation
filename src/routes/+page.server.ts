import fs from "fs/promises";

import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { SECRET_NUMBERS_FILE } from "$env/static/private";

export const actions: Actions = {
    default: async ({ request }) => {
        console.log("here");

        const data = await request.formData();
        const nearDepartureTime = data.get("nearDepartureTime");

        if (!nearDepartureTime) {
            return fail(400, { number: nearDepartureTime, missing: true });
        }

        try {
            await fs.writeFile(SECRET_NUMBERS_FILE, nearDepartureTime.toString());
        } catch (err) {
            return fail(500);
        }

        return { success: true };
    }
};
