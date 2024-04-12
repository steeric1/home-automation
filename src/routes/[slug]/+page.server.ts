import fs from "fs/promises";

import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { PRODUCTION_PATH, DEPARTURES_FILE } from "$env/static/private";
import { isProduction } from "$lib/const";
import type { Departure } from "$lib/types";
import { departureSchema } from "$lib/schemas";

export const load: PageServerLoad = async ({ params }) => {
    if (isProduction && params.slug !== PRODUCTION_PATH) {
        error(404, "Not found");
    } else if (!isProduction && params.slug !== "_") {
        redirect(302, "/_");
    }

    const departures = await loadDepartures();
    const form = await superValidate(zod(departureSchema));

    return { departures, form };
};

async function loadDepartures(): Promise<Departure[] | null> {
    try {
        const departures = (await fs.readFile(DEPARTURES_FILE, { encoding: "utf-8" })).toString();
        return departures
            .split("\n")
            .filter((line) => line.length > 0)
            .map((line) => line.split(" "))
            .map(([timestamp, poi]) => ({ timestamp, poi }));
    } catch (err) {
        console.error(err);
        return null;
    }
}
