import type { Metadata } from "next";
import { KontrolIQContent } from "@/components/solutions/KontrolIQContent";

export const metadata: Metadata = {
  title: "KontrolIQ | SOC 2 Compliance Automation | Mainoo Technologies",
  description:
    "KontrolIQ is a governance sector engine on Nyansapo — automate SOC 2 and ISO 27001 evidence, monitoring, and remediation in your AWS environment.",
};

export default function KontrolIQPage() {
  return <KontrolIQContent />;
}
