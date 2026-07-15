import type { Metadata } from "next";
import { KontrolIQContent } from "@/components/solutions/KontrolIQContent";

export const metadata: Metadata = {
  title: "KontrolIQ | SOC 2, ISO 27001 & Ghana Data Act Compliance | Mainoo Technologies",
  description:
    "KontrolIQ is a governance sector engine on Nyansapo — automate SOC 2, ISO 27001, and Ghana Data Protection Act evidence, monitoring, and remediation in your AWS environment.",
};

export default function KontrolIQPage() {
  return <KontrolIQContent />;
}
