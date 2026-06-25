import { useMemo } from "react";
import { CLINICS, DEFAULT_CLINIC, ClinicConfig } from "@/lib/clinicConfig";

export function useClinic(): ClinicConfig {
  return useMemo(() => {
    const slug = window.location.pathname.replace("/", "").toLowerCase().trim();
    return CLINICS[slug] ?? DEFAULT_CLINIC;
  }, []);
}
