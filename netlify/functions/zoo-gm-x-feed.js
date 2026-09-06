const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";

function decodeXml(text = "") {
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function stripHtml(text = "") {
  return decodeXml(text)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTag(block, tag) {
  const match = block.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
  );

  return match ? match[1].trim() : "";
}

function getAuthorFromTitle(title = "") {
  const parts = title.split(":");

  if (parts.length < 2) return "";

  return parts.shift().trim();
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

    const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(
      (match) => {
        const item = match[1];

        const rawTitle = getTag(item, "title");
        const rawDescription = getTag(item, "description");

        return {
          author: getAuthorFromTitle(stripHtml(rawTitle)),
          text: stripHtml(rawDescription),
          title: stripHtml(rawTitle),
          link: stripHtml(getTag(item, "link")),
          publishedAt: stripHtml(getTag(item, "pubDate")),
          guid: stripHtml(getTag(item, "guid")),
        };
      }
    );

    return Response.json(
      {
        ok: true,
        source: "Zoo GM Fantasy X List",
        count: posts.length,
        posts,
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
