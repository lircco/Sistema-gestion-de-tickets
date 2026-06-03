import { createFileRoute } from "@tanstack/react-router";
import Index from "../components/IndexRoute";

export const Route = createFileRoute("/")({
  component: Index,
});
