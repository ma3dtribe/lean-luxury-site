const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";

export default async () => {
  try {
    const response = await fetch(RSS_FEED_URL, {
      headers: {
        "User-Agent": "Zoo-GM/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS request failed: ${response.status}`);
    }

    const xml = await response.text();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Zoo GM X Feed Error:", error);

    return Response.json(
      {
        ok: false,
        error: "Unable to retrieve Zoo GM X feed.",
      },
      { status: 500 }
    );
  }
};
