import { createFileRoute } from "@tanstack/react-router";
import Index from "./IndexRoute";

export const Route = createFileRoute("/")({
  component: Index,
});
