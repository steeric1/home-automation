import fs from "fs/promises";

import { fail, type ActionFailure } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { DEPARTURES_FILE } from "$env/static/private";
import type { Departure } from "$lib/types";
import { departureTimePoiLabels } from "$lib/const";

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

    return { departures: departuresList };
};

export const actions: Actions = {
    submitDepartures: async ({ request }) => {
        const data = await request.formData();

        try {
            const failure = await handleDepartureTimes(data);
            if (failure) return failure;
        } catch (err) {
            return fail(500);
        }

        return { success: true };
    }
};

async function handleDepartureTimes(data: FormData): Promise<ActionFailure<undefined> | null> {
    const [near, far, raw] = [
        data.get("nearDepartureTime")?.toString(),
        data.get("farDepartureTime")?.toString(),
        data.get("rawDepartureTime")?.toString()
    ];

    if (near) {
        const nextNearTimestamp = getNextTimestamp(near).toISOString();
        await fs.appendFile(
            DEPARTURES_FILE,
            `${nextNearTimestamp} ${departureTimePoiLabels.near}\n`
        );
    }

    if (far) {
        const nextFarTimestamp = getNextTimestamp(far).toISOString();
        await fs.appendFile(DEPARTURES_FILE, `${nextFarTimestamp} ${departureTimePoiLabels.far}\n`);
    }

    if (raw) {
        const departureTimeRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) (\S.*)/;
        if (!departureTimeRegex.test(raw)) return fail(400);

        await fs.appendFile(DEPARTURES_FILE, `${raw}\n`);
    }

    return null;
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
