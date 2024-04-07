import fs from "fs/promises";

import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { DEPARTURES_FILE } from "$env/static/private";

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();

        try {
            await handleDepartureTimes(data);
        } catch (err) {
            return fail(500);
        }

        return { success: true };
    }
};

async function handleDepartureTimes(data: FormData) {
    const [near, far] = [data.get("nearDepartureTime"), data.get("farDepartureTime")];

    if (near) {
        const nextNearTimestamp = getNextTimestamp(near.toString()).toISOString();
        await fs.appendFile(DEPARTURES_FILE, `${nextNearTimestamp} Pusula/Nummela\n`);
    }

    if (far) {
        const nextFarTimestamp = getNextTimestamp(far.toString()).toISOString();
        await fs.appendFile(DEPARTURES_FILE, `${nextFarTimestamp} kauemmaksi\n`);
    }
}

function getNextTimestamp(targetTime: string): Date {
    const [targetHours, targetMinutes] = targetTime.split(":").map(Number);
    const now = new Date();

    // Create a Date object for today at the target time
    const nextTimestamp = new Date();
    nextTimestamp.setHours(targetHours);
    nextTimestamp.setMinutes(targetMinutes);
    nextTimestamp.setSeconds(0);
    nextTimestamp.setMilliseconds(0);

    // If the target time is in the past for today, set it to tomorrow
    if (nextTimestamp < now) {
        nextTimestamp.setDate(nextTimestamp.getDate() + 1);
    }

    return nextTimestamp;
}
