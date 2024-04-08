import fs from "fs/promises";

import { json, type RequestHandler } from "@sveltejs/kit";

import { DEPARTURES_FILE } from "$env/static/private";

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

    return new Response(null, { status: 204 });
};
