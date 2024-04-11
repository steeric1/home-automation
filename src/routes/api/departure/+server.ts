import fs from "fs/promises";

import { json, type RequestHandler } from "@sveltejs/kit";

import { actionResult, setError, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";

import { DEPARTURES_FILE } from "$env/static/private";
import { departureTimePoiLabels } from "$lib/const";
import { departureSchema } from "$lib/schemas";

export const DELETE: RequestHandler = async ({ request }) => {
    const { timestamp: rTimestamp, poi: rPoi } = await request.json();

    try {
        let contents = (await fs.readFile(DEPARTURES_FILE, { encoding: "utf-8" })).toString();
        contents = contents
            .split("\n")
            .filter((line) => {
                if (line.length > 0) {
                    const [timestamp, poi] = line.split(" ");
                    return !(timestamp === rTimestamp && poi === rPoi);
                } else {
                    return true;
                }
            })
            .join("\n");

        await fs.writeFile(DEPARTURES_FILE, contents);
    } catch (err) {
        console.error(err);
        return json({}, { status: 500 });
    }

    // For some reason json(...) fails with status 204
    return new Response(null, { status: 204 });
};

export const POST: RequestHandler = async ({ request }) => {
    const form = await superValidate(request, zod(departureSchema));

    try {
        await handleDepartureTimes(form.data);
    } catch (err) {
        if (err instanceof RequestError) {
            return actionResult("failure", { form });
        }

        return actionResult("error", "A server error occurred.");
    }

    return actionResult("success", { form });
};

type DepartureTimes = {
    nearDepartureTime?: string;
    farDepartureTime?: string;
    rawDepartureTime?: string;
};

async function handleDepartureTimes(data: DepartureTimes) {
    const { nearDepartureTime: near, farDepartureTime: far, rawDepartureTime: raw } = data;

    const departures = (await fs.readFile(DEPARTURES_FILE, { encoding: "utf-8" }))
        .toString()
        .trimEnd()
        .split("\n")
        .map((line) => line.split(" "));

    function ensureNoDuplicate(timestamp: string) {
        if (departures.find(([ts, _]) => ts === timestamp))
            throw new RequestError("Samaa lähtöaikaa ei voi ilmoittaa kahta kertaa.", 400);
    }

    if (near) {
        const nextTimestamp = getNextTimestamp(near).toISOString();
        ensureNoDuplicate(nextTimestamp);

        await fs.appendFile(DEPARTURES_FILE, `${nextTimestamp} ${departureTimePoiLabels.near}\n`);
    }

    if (far) {
        const nextTimestamp = getNextTimestamp(far).toISOString();
        ensureNoDuplicate(nextTimestamp);

        await fs.appendFile(DEPARTURES_FILE, `${nextTimestamp} ${departureTimePoiLabels.far}\n`);
    }

    if (raw) {
        const departureTimeRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z) (\S.*)/;
        if (!departureTimeRegex.test(raw)) throw new RequestError("Lähtöajan muoto on väärä.", 400);

        ensureNoDuplicate(raw.split(" ")[0]);
        await fs.appendFile(DEPARTURES_FILE, `${raw}\n`);
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

class RequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
    }
}
