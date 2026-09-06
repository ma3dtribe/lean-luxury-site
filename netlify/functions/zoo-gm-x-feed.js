const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";

function decodeXml(text = "") {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

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

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
      const item = match[1];

      return {
        title: getTag(item, "title"),
        description: getTag(item, "description"),
        link: getTag(item, "link"),
        publishedAt: getTag(item, "pubDate"),
        guid: getTag(item, "guid"),
      };
    });

    return Response.json(
      {
        ok: true,
        source: "Zoo GM Fantasy X List",
        count: items.length,
        posts: items,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Zoo GM X Feed Error:", error);

    return Response.json(
      {
        ok: false,
        error: "Unable to retrieve or parse Zoo GM X feed.",
      },
      { status: 500 }
    );
  }
};
