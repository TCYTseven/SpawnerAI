import { Suspense } from "react";
import { Spinner } from "@heroui/spinner";
import SimulateClient from "./SimulateClient";

export default function SimulatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" color="warning" />
        </div>
      }
    >
      <SimulateClient />
    </Suspense>
  );
}
