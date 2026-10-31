import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const enabled = process.env.NODE_ENV !== "production" || !!process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;
const handlers = makeRouteHandler({ config });
const notFound = () => new Response("Not found", { status: 404 });

export const GET = enabled ? handlers.GET : notFound;
export const POST = enabled ? handlers.POST : notFound;
