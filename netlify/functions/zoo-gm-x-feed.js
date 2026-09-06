const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";

const ZOO_ROSTER = [
  "Jayden Daniels",
  "Jahmyr Gibbs",
  "Chase Brown",
  "Quinshon Judkins",
  "Nico Collins",
  "Ladd McConkey",
  "Colston Loveland",
  "Zack Baun",
  "Daiyan Henley",
  "Barrett Carter",
  "T.J. Watt",
  "TJ Watt",
  "Quentin Lake",
  "Nick Cross",
  "Terry McLaurin",
  "Marvin Harrison Jr.",
  "Marvin Harrison",
  "Jacory Croskey-Merritt",
  "Jacory Croskey Merritt",
  "Patrick Queen",
  "DeMarvion Overshown",
  "Mike Washington Jr.",
  "Mike Washington",
  "Jacob Rodriguez",
  "Brian Branch"
];

const URGENT_KEYWORDS = [
  "out",
  "inactive",
  "injured",
  "injury",
  "questionable",
  "doubtful",
  "ruled out",
  "did not practice",
  "limited practice",
  "full practice",
  "ir",
  "injured reserve",
  "waived",
  "released",
  "cut",
  "traded",
  "trade",
  "suspended",
  "starter",
  "starting",
  "benched",
  "depth chart",
  "snap",
  "snaps",
  "role",
  "workload"
];

const FANTASY_KEYWORDS = [
  "fantasy",
  "injury",
  "practice",
  "inactive",
  "starter",
  "starting",
  "depth chart",
  "snap",
  "snaps",
  "target",
  "targets",
  "carry",
  "carries",
  "touches",
  "routes",
  "route participation",
  "red zone",
  "goal line",
  "waiver",
  "waivers",
  "free agent",
  "trade",
  "traded",
  "released",
  "waived",
  "rb",
  "wr",
  "qb",
  "te",
  "lb",
  "dl",
  "cb",
  "safety",
  "idp"
];

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

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findZooPlayers(text = "") {
  const normalizedText = normalize(text);

  return [...new Set(
    ZOO_ROSTER.filter((player) =>
      normalizedText.includes(normalize(player))
    )
  )];
}

function findKeywords(text = "", keywordList = []) {
  const lower = text.toLowerCase();

  return keywordList.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreFantasyRelevance(text = "", zooPlayers = []) {
  const fantasyMatches = findKeywords(text, FANTASY_KEYWORDS);
  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  let score = 10;

  score += fantasyMatches.length * 7;
  score += urgentMatches.length * 6;

  if (zooPlayers.length > 0) score += 20;

  return clamp(score);
}

function scoreZooRelevance(text = "", zooPlayers = []) {
  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  if (zooPlayers.length === 0) {
    return 0;
  }

  let score = 65;

  score += Math.min(zooPlayers.length * 8, 16);
  score += Math.min(urgentMatches.length * 5, 20);

  return clamp(score);
}

function getAlertLevel(fantasyScore, zooScore) {
  const score = Math.max(fantasyScore, zooScore);

  if (score >= 90) return "URGENT";
  if (score >= 75) return "IMPORTANT";
  if (score >= 60) return "WATCH";
  return "STORE";
}

function buildPostIntelligence(post) {
  const combinedText = `${post.title} ${post.text}`;

  const zooPlayers = findZooPlayers(combinedText);
  const urgentKeywords = findKeywords(combinedText, URGENT_KEYWORDS);
  const fantasyKeywords = findKeywords(combinedText, FANTASY_KEYWORDS);

  const fantasyRelevance = scoreFantasyRelevance(
    combinedText,
    zooPlayers
  );

  const zooRelevance = scoreZooRelevance(
    combinedText,
    zooPlayers
  );

  const alertLevel = getAlertLevel(
    fantasyRelevance,
    zooRelevance
  );

  return {
    ...post,
    intelligence: {
      zooPlayers,
      fantasyKeywords,
      urgentKeywords,
      fantasyRelevance,
      zooRelevance,
      alertLevel,
      directZooImpact: zooPlayers.length > 0
    }
  };
}

export default async () => {
  try {
    const response = await fetch(RSS_FEED_URL, {
      headers: {
        "User-Agent": "Zoo-GM/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`RSS request failed: ${response.status}`);
    }

    const xml = await response.text();

    const rawPosts = [
      ...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)
    ].map((match) => {
      const item = match[1];

      const rawTitle = getTag(item, "title");
      const rawDescription = getTag(item, "description");

      return {
        author: getAuthorFromTitle(stripHtml(rawTitle)),
        text: stripHtml(rawDescription),
        title: stripHtml(rawTitle),
        link: stripHtml(getTag(item, "link")),
        publishedAt: stripHtml(getTag(item, "pubDate")),
        guid: stripHtml(getTag(item, "guid"))
      };
    });

    const posts = rawPosts
      .map(buildPostIntelligence)
      .sort((a, b) => {
        const aScore = Math.max(
          a.intelligence.fantasyRelevance,
          a.intelligence.zooRelevance
        );

        const bScore = Math.max(
          b.intelligence.fantasyRelevance,
          b.intelligence.zooRelevance
        );

        return bScore - aScore;
      });

    const summary = {
      postsReviewed: posts.length,
      fantasyRelevant: posts.filter(
        (post) =>
          post.intelligence.fantasyRelevance >= 60
      ).length,
      zooRelevant: posts.filter(
        (post) =>
          post.intelligence.zooRelevance >= 60
      ).length,
      urgent: posts.filter(
        (post) =>
          post.intelligence.alertLevel === "URGENT"
      ).length,
      important: posts.filter(
        (post) =>
          post.intelligence.alertLevel === "IMPORTANT"
      ).length
    };

    return Response.json(
      {
        ok: true,
        source: "Zoo GM Fantasy X List",
        summary,
        posts
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Zoo GM X Feed Error:", error);

    return Response.json(
      {
        ok: false,
        error: "Unable to retrieve or analyze Zoo GM X feed."
      },
      { status: 500 }
    );
  }
};          link: stripHtml(getTag(item, "link")),
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
