import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
let serverEntryPromise;
async function getServerEntry() {
    if (!serverEntryPromise) {
        serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m));
    }
    return serverEntryPromise;
}
function brandedErrorResponse() {
    return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
    let payload;
    try {
        payload = JSON.parse(body);
    }
    catch {
        return false;
    }
    if (!payload || Array.isArray(payload) || typeof payload !== "object") {
        return false;
    }
    const fields = payload;
    const expectedKeys = new Set(["message", "status", "unhandled"]);
    if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
        return false;
    }
    return (fields.unhandled === true &&
        fields.message === "HTTPError" &&
        (fields.status === undefined || fields.status === responseStatus));
}
// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response) {
    if (response.status < 500)
        return response;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json"))
        return response;
    const body = await response.clone().text();
    if (!isCatastrophicSsrErrorBody(body, response.status)) {
        return response;
    }
    console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
    return brandedErrorResponse();
}
export default {
    async fetch(request, env, ctx) {
        try {
            const handler = await getServerEntry();
            const response = await handler.fetch(request, env, ctx);
            return await normalizeCatastrophicSsrResponse(response);
        }
        catch (error) {
            console.error(error);
            return brandedErrorResponse();
        }
    },
};
