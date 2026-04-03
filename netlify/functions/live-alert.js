export default async (req, context) => {
  const CHANNEL = "ma3dtribe";
  const APP_ID = process.env.ONESIGNAL_APP_ID;
  const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

  const uptimeRes = await fetch(`https://decapi.me/twitch/uptime/${CHANNEL}?redirect=false`, {
    headers: { "cache-control": "no-cache" }
  });

  const uptimeText = (await uptimeRes.text()).toLowerCase();
  const isLive = !uptimeText.includes("offline");

  if (!isLive) {
    return new Response(JSON.stringify({ ok: true, sent: false }), {
      headers: { "content-type": "application/json" }
    });
  }

  const sendRes = await fetch("https://api.onesignal.com/notifications?c=push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Key ${API_KEY}`
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ["Subscribed Users"],
      target_channel: "push",
      headings: { en: "🔴 MA3DTribe is LIVE" },
      contents: { en: "Tap now — MA3D Vibes is live." },
      web_url: "https://ma3dtribe.com"
    })
  });

  const data = await sendRes.json();

  return new Response(JSON.stringify({ ok: true, sent: true, data }), {
    headers: { "content-type": "application/json" }
  });
};

export const config = {
  schedule: "*/2 * * * *"
};


