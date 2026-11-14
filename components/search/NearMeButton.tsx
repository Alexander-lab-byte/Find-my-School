"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/common/Icon";
import { useSearchNavigation } from "@/components/search/SearchNavigation";
import { roundLocation } from "@/lib/geo";

type LocateError = "denied" | "unavailable" | "unsupported";

/**
 * Asks the browser for the visitor's location once, rounds it to ~1 km, and
 * calls back with "lat,lng". The location never leaves the URL — nothing is
 * stored on the server.
 */
export function requestNearParam(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject("unsupported" satisfies LocateError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(roundLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })),
      (err) => reject((err.code === err.PERMISSION_DENIED ? "denied" : "unavailable") satisfies LocateError),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  });
}

/** "Schools near me": sorts the results by distance, or turns that off again. */
export function NearMeButton({ active }: { active: boolean }) {
  const t = useTranslations("NearMe");
  const { update } = useSearchNavigation();
  const [state, setState] = useState<"idle" | "locating" | LocateError>("idle");

  async function locate() {
    setState("locating");
    try {
      const near = await requestNearParam();
      setState("idle");
      update({ near, sort: "distance", page: null });
    } catch (error) {
      setState(error as LocateError);
    }
  }

  if (active) {
    return (
      <button
        type="button"
        onClick={() => update({ near: null, sort: null, page: null })}
        className="chip is-on min-h-12"
      >
        <Icon name="map-pin" className="size-4" />
        {t("active")}
        <Icon name="x" className="size-3.5" />
        <span className="sr-only">{t("stop")}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={locate} disabled={state === "locating"} className="chip min-h-12">
        <Icon name="map-pin" className="size-4" />
        {state === "locating" ? t("locating") : t("button")}
      </button>
      {(state === "denied" || state === "unavailable" || state === "unsupported") && (
        <p role="alert" className="text-xs text-muted">
          {t(state)}
        </p>
      )}
    </div>
  );
}
