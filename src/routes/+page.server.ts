import fs from "fs/promises";

import type { Actions, PageServerLoad } from "./$types";

import { DEPARTURES_FILE } from "$env/static/private";
import type { Departure } from "$lib/types";
import { POST as POST_DEPARTURE } from "./api/departure/+server";
import { fail } from "@sveltejs/kit";
import { zod } from "sveltekit-superforms/adapters";
import { departureSchema } from "$lib/schemas";
import { superValidate } from "sveltekit-superforms";

export const load: PageServerLoad = async ({ params }) => {
    let departuresList: Departure[] | null = null;

    try {
        const departures = (await fs.readFile(DEPARTURES_FILE, { encoding: "utf-8" })).toString();
        departuresList = departures
            .split("\n")
            .filter((line) => line.length > 0)
            .map((line) => line.split(" "))
            .map(([timestamp, poi]) => ({ timestamp, poi }));
    } catch (err) {
        console.error(err);
    }

    const form = await superValidate(zod(departureSchema));

    return { departures: departuresList, form };
};

/*export const actions: Actions = {
    submitDepartures: async (event) => {
        const response = await POST_DEPARTURE(event);
        const body = await response.json();

        return response.ok ? { success: true } : fail(response.status, body || {});
    }
};
*/
