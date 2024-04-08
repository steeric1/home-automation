import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    const requestStartTime = Date.now();
    const response = await resolve(event);

    console.log(
        new Date(requestStartTime).toISOString(),
        event.request.method,
        event.url.pathname,
        `(${Date.now() - requestStartTime}ms)`,
        response.status
    );
    return response;
};
