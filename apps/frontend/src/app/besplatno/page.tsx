"use client";
import { useEffect } from "react";
export default function BesplatnoPage() {
  useEffect(() => { window.location.href = "/register"; }, []);
  return null;
}
