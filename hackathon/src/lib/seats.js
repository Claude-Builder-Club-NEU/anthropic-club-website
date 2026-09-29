import { useEffect, useState } from "react";
import { SEATS } from "./event";
import { withBase } from "./base";

/**
 * The live seat count, from /hackathon/api/seats (netlify/functions).
 *
 * A seat is a paid registration in Supabase. The count is read once when the
 * page loads and again every 30 seconds while the tab is visible, so the meter
 * moves on its own when someone else signs up and flips to "Join the
 * waitlist" the moment the hundredth seat goes.
 *
 * Every component on the page shares ONE request and one timer: the store
 * below is module-level, and useSeats() only subscribes to it. The header,
 * the hero and the meter all asking separately would be three requests for
 * one number.
 *
 * FIRST RENDER IS THE FALLBACK. The page is prerendered, and hydration needs
 * the client's first render to match the server's, so both start from SEATS in
 * event.js and the live number replaces it after mount. If the endpoint is not
 * configured yet (503) the fallback simply stays.
 */

const REFRESH_MS = 30_000;

let state = { capacity: SEATS.capacity, taken: SEATS.seatsTaken, live: false };
const listeners = new Set();
let timer = null;
let inflight = null;

function publish(next) {
  state = next;
  listeners.forEach((fn) => fn(state));
}

export async function refreshSeats() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(withBase("api/seats"), { headers: { Accept: "application/json" } });
      if (!res.ok) return state;
      const data = await res.json();
      if (Number.isFinite(data.capacity) && Number.isFinite(data.taken)) {
        publish({ capacity: data.capacity, taken: data.taken, live: true });
      }
    } catch {
      // Offline, or the functions are not deployed (a plain `vite preview`).
      // The fallback stays on screen.
    } finally {
      inflight = null;
    }
    return state;
  })();
  return inflight;
}

function start() {
  refreshSeats();
  timer = window.setInterval(() => {
    if (document.visibilityState === "visible") refreshSeats();
  }, REFRESH_MS);
  document.addEventListener("visibilitychange", onVisible);
}

function stop() {
  window.clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisible);
}

function onVisible() {
  if (document.visibilityState === "visible") refreshSeats();
}

/** { capacity, taken, left, full, live } */
export function useSeats() {
  const [seats, setSeats] = useState(() => ({
    capacity: SEATS.capacity,
    taken: SEATS.seatsTaken,
    live: false,
  }));

  useEffect(() => {
    listeners.add(setSeats);
    if (listeners.size === 1) start();
    else setSeats(state);
    return () => {
      listeners.delete(setSeats);
      if (listeners.size === 0) stop();
    };
  }, []);

  const capacity = seats.capacity;
  const taken = Math.max(0, Math.min(capacity, seats.taken));
  return { capacity, taken, left: capacity - taken, full: taken >= capacity, live: seats.live };
}
