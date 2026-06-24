import { useEffect } from "react";
import { useUsage } from "@/hooks/use-usage";

export default function ExportIntelligence() {
  const { consume } = useUsage();
  useEffect(() => { consume("page_view"); }, []);
  return <div>Export Intelligence Loaded</div>;
}