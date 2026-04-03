import { createHash } from "node:crypto";

function parseUptimeToSeconds(text) {
  const s = String(text || "").toLowerCase();
  let total = 0;

  for (const match of s.matchAll(/(\d+)\s*(day|days|hour|hours|minute|minutes|second|seconds)/g)) {
    const n = Number(match[1]);
    const unit = match[2];

    if (unit.startsWith("day")) total += n * 86400;
    else if (unit.startsWith("hour")) total += n * 3600;
    else if (unit.startsWith("minute")) total += n * 60;
    else if (unit.startsWith("second")) total += n;
  }

  return total;
}

function makeSessionUuid(channel, startedAtMs) {
  const minuteBucket = Math.floor(startedAtMs / 60000) * 60000;
  const hex = createHash("sha1")
    .update(`${channel}:${minuteBucket}`)
    .digest("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `8${hex.slice(17, 20)}`,
    hex.slice(20, 32)
  ].join("-");
}

export default async () => {
  const CHANNEL = "ma3dtribe";
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  const uptimeRes = await fetch(`https://decapi.me/twitch/uptime/${CHANNEL}?redirect=false`, {
    headers: { "cache-control": "no-cache" }
  });

  const uptimeText = (await uptimeRes.text()).trim();
  const lower = uptimeText.toLowerCase();
  const isLive = !lower.includes("offline");

  if (!isLive) {
    return new Response(JSON.stringify({ ok: true, sent: false, reason: "offline" }), {
      headers: { "content-type": "application/json" }
    });
  }

  const uptimeSeconds = parseUptimeToSeconds(uptimeText);
  const startedAtMs = Date.now() - (uptimeSeconds * 1000);
  const idempotencyKey = makeSessionUuid(CHANNEL, startedAtMs);

  const sendRes = await fetch("https://api.onesignal.com/notifications?c=push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${API_KEY}`
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ["Total Subscriptions"],
      headings: { en: "🔴 MA3DTribe is LIVE" },
      contents: { en: "Tap now — MA3D Vibes is live." },
      web_url: "https://ma3dtribe.com",
      idempotency_key: idempotencyKey
    })
  });

  const data = await sendRes.json();

  return new Response(JSON.stringify({ ok: true, sent: true, uptimeText, idempotencyKey, data }), {
    headers: { "content-type": "application/json" }
  });
};

export const config = {
  schedule: "*/2 * * * *"
};
