import type { PageServerLoad } from "./$types";

import { isProduction } from "$lib/const";
import { error, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (_) => {
    console.log("here");
    console.log(isProduction);
    isProduction ? error(404, "Not found") : redirect(302, "/_");
};
