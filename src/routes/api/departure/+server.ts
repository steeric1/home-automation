import fs from "fs/promises";

import { json, type RequestHandler } from "@sveltejs/kit";

import { DEPARTURES_FILE } from "$env/static/private";
import { departureTimePoiLabels } from "$lib/const";

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
    const data = await request.formData();

    try {
        await handleDepartureTimes(data);
    } catch (err) {
        if (err instanceof RequestError) {
            return json({ message: err.message }, { status: err.status });
        }

        return json(null, { status: 500 });
    }

    return json(null, { status: 201 });
};

async function handleDepartureTimes(data: FormData) {
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
        if (!departureTimeRegex.test(raw))
            throw new RequestError("invalid departure time format", 400);

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

class RequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
    }
}
