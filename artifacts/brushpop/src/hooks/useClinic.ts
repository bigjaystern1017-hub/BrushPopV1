import { useMemo } from "react";
import { CLINICS, DEFAULT_CLINIC, ClinicConfig } from "@/lib/clinicConfig";

export function useClinic(): ClinicConfig {
  return useMemo(() => {
    const slug = new URLSearchParams(window.location.search).get("clinic") ?? "";
    return CLINICS[slug] ?? DEFAULT_CLINIC;
  }, []);
}
