"use client";

import dynamic from "next/dynamic";
import type { PlasmaProps } from "./Plasma";

const Plasma = dynamic(() => import("./Plasma"), {
  ssr: false,
  loading: () => <div className="plasma-container plasma-fallback absolute inset-0" />,
});

export function PlasmaLazy(props: PlasmaProps) {
  return <Plasma {...props} />;
}

export default PlasmaLazy;
