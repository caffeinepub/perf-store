import { useEffect, useState } from "react";

export type DeviceMode = "mobile" | "tablet" | "desktop";

function getDeviceMode(): DeviceMode {
  const w = window.innerWidth;
  if (w >= 1024) return "desktop";
  if (w >= 768) return "tablet";
  return "mobile";
}

export function useDeviceMode(): DeviceMode {
  const [mode, setMode] = useState<DeviceMode>(getDeviceMode);

  useEffect(() => {
    const handler = () => setMode(getDeviceMode());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return mode;
}
