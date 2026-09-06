const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";

const ZOO_ROSTER_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcPmd0YL9Ln-sDQlKHnlvRODpCbyEbE6hX6Lc9Cn7nfGRiWapKCvy57PXlYfx4xpVd2Ib2bYwtyCQg/pub?gid=1565676178&single=true&output=csv";

const WATCH_LIST_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcPmd0YL9Ln-sDQlKHnlvRODpCbyEbE6hX6Lc9Cn7nfGRiWapKCvy57PXlYfx4xpVd2Ib2bYwtyCQg/pub?gid=1431580856&single=true&output=csv";

const URGENT_KEYWORDS = [
  "ruled out", "did not practice", "limited practice", "full practice",
  "injured reserve", "inactive", "injured", "injury", "questionable",
  "doubtful", "waived", "released", "cut", "traded", "trade",
  "suspended", "starter", "starting", "benched", "depth chart",
  "snap", "snaps", "role", "workload"
];

const FANTASY_KEYWORDS = [
  "fantasy", "injury", "practice", "inactive", "starter", "starting",
  "depth chart", "snap", "snaps", "target", "targets", "carry",
  "carries", "touches", "routes", "route participation", "red zone",
  "goal line", "waiver", "waivers", "free agent", "trade", "traded",
  "released", "waived", "rb", "wr", "qb", "te", "lb", "dl", "cb",
  "safety", "idp"
];

function decodeXml(text = "") {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
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

function escapeRegExp(text = "") {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasKeyword(text = "", keyword = "") {
  const normalizedText = normalize(text);
  const normalizedKeyword = normalize(keyword);

  if (!normalizedKeyword) return false;

  const pattern = new RegExp(
    `(^|\\s)${escapeRegExp(normalizedKeyword)}(?=\\s|$|[.-])`,
    "i"
  );

  return pattern.test(normalizedText);
}

function findKeywords(text = "", keywordList = []) {
  return keywordList.filter((keyword) =>
    hasKeyword(text, keyword)
  );
}

function parseCsv(csvText = "") {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !inQuotes
    ) {
      if (char === "\r" && next === "\n") i += 1;

      row.push(field);
      field = "";

      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);

  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((header) =>
    header.trim()
  );

  return rows.slice(1).map((values) => {
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = (values[index] || "").trim();
    });

    return obj;
  });
}

async function fetchText(url, label) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Zoo-GM/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(
      `${label} request failed: ${response.status}`
    );
  }

  return response.text();
}

function buildPlayerAliases(playerName = "") {
  const aliases = new Set([playerName]);

  const cleaned = playerName
    .replace(/\b(Jr\.|Sr\.|II|III|IV)\b/gi, "")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned && cleaned !== playerName) {
    aliases.add(cleaned);
  }

  return [...aliases];
}

function findMatchingPlayers(text = "", players = []) {
  const normalizedText = normalize(text);
  const matches = [];

  for (const player of players) {
    const aliases = buildPlayerAliases(
      player.name || player.Player || ""
    );

    const matched = aliases.some((alias) => {
      const normalizedAlias = normalize(alias);

      return (
        normalizedAlias &&
        normalizedText.includes(normalizedAlias)
      );
    });

    if (matched) {
      matches.push(player);
    }
  }

  return matches;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

function scoreFantasyRelevance(
  text = "",
  zooMatches = [],
  watchMatches = []
) {
  const fantasyMatches =
    findKeywords(text, FANTASY_KEYWORDS);

  const urgentMatches =
    findKeywords(text, URGENT_KEYWORDS);

  let score = 10;

  score += Math.min(
    fantasyMatches.length * 8,
    48
  );

  score += Math.min(
    urgentMatches.length * 7,
    35
  );

  if (zooMatches.length > 0) score += 20;
  if (watchMatches.length > 0) score += 12;

  return clamp(score);
}

function scoreZooRelevance(
  text = "",
  zooMatches = []
) {
  if (zooMatches.length === 0) {
    return 0;
  }

  const urgentMatches =
    findKeywords(text, URGENT_KEYWORDS);

  let score = 68;

  score += Math.min(
    zooMatches.length * 8,
    16
  );

  score += Math.min(
    urgentMatches.length * 5,
    20
  );

  return clamp(score);
}

function priorityScore(priority = "") {
  const value = priority.toLowerCase();

  if (value === "high") return 18;
  if (value === "medium") return 10;
  if (value === "low") return 5;

  return 8;
}

function scoreWatchRelevance(
  text = "",
  watchMatches = []
) {
  if (watchMatches.length === 0) {
    return 0;
  }

  const urgentMatches =
    findKeywords(text, URGENT_KEYWORDS);

  const bestPriority = Math.max(
    ...watchMatches.map((player) =>
      priorityScore(player.priority)
    )
  );

  let score = 55 + bestPriority;

  score += Math.min(
    urgentMatches.length * 5,
    20
  );

  return clamp(score);
}

function getAlertLevel(
  fantasyScore,
  zooScore,
  watchScore
) {
  const score = Math.max(
    fantasyScore,
    zooScore,
    watchScore
  );

  if (score >= 90) return "URGENT";
  if (score >= 75) return "IMPORTANT";
  if (score >= 60) return "WATCH";

  return "STORE";
}

function mapRosterRows(rows = []) {
  return rows
    .filter((row) => row.Player)
    .filter((row) =>
      !row["Monitoring Status"] ||
      row["Monitoring Status"]
        .toLowerCase() === "active"
    )
    .map((row) => ({
      name: row.Player,
      position: row.Position || "",
      nflTeam: row["NFL Team"] || "",
      lineup: row["Starter/Bench"] || "",
      monitoringStatus:
        row["Monitoring Status"] || "Active"
    }));
}

function mapWatchRows(rows = []) {
  return rows
    .filter((row) => row.Player)
    .filter((row) =>
      !row.Status ||
      !["inactive", "removed"].includes(
        row.Status.toLowerCase()
      )
    )
    .map((row) => ({
      name: row.Player,
      position: row.Position || "",
      nflTeam: row["NFL Team"] || "",
      reason: row.Reason || "",
      priority: row.Priority || "",
      trigger: row.Trigger || "",
      status: row.Status || ""
    }));
}

function buildPostIntelligence(
  post,
  zooRoster,
  watchList
) {
  const combinedText =
    `${post.title} ${post.text}`;

  const zooMatches =
    findMatchingPlayers(
      combinedText,
      zooRoster
    );

  const watchMatches =
    findMatchingPlayers(
      combinedText,
      watchList
    );

  const fantasyKeywords =
    findKeywords(
      combinedText,
      FANTASY_KEYWORDS
    );

  const urgentKeywords =
    findKeywords(
      combinedText,
      URGENT_KEYWORDS
    );

  const fantasyRelevance =
    scoreFantasyRelevance(
      combinedText,
      zooMatches,
      watchMatches
    );

  const zooRelevance =
    scoreZooRelevance(
      combinedText,
      zooMatches
    );

  const watchRelevance =
    scoreWatchRelevance(
      combinedText,
      watchMatches
    );

  return {
    ...post,
    intelligence: {
      zooPlayers:
        zooMatches.map((player) =>
          player.name
        ),

      watchPlayers:
        watchMatches.map((player) =>
          player.name
        ),

      fantasyKeywords,
      urgentKeywords,
      fantasyRelevance,
      zooRelevance,
      watchRelevance,

      alertLevel:
        getAlertLevel(
          fantasyRelevance,
          zooRelevance,
          watchRelevance
        ),

      directZooImpact:
        zooMatches.length > 0,

      watchListImpact:
        watchMatches.length > 0
    }
  };
}

exports.handler = async function () {
  try {
    const [
      xml,
      rosterCsv,
      watchCsv
    ] = await Promise.all([
      fetchText(
        RSS_FEED_URL,
        "RSS feed"
      ),

      fetchText(
        ZOO_ROSTER_CSV_URL,
        "Zoo roster"
      ),

      fetchText(
        WATCH_LIST_CSV_URL,
        "Watch list"
      )
    ]);

    const zooRoster =
      mapRosterRows(
        parseCsv(rosterCsv)
      );

    const watchList =
      mapWatchRows(
        parseCsv(watchCsv)
      );

    const rawPosts = [
      ...xml.matchAll(
        /<item>([\s\S]*?)<\/item>/gi
      )
    ].map((match) => {
      const item = match[1];

      const rawTitle =
        getTag(item, "title");

      const rawDescription =
        getTag(item, "description");

      return {
        author:
          getAuthorFromTitle(
            stripHtml(rawTitle)
          ),

        text:
          stripHtml(rawDescription),

        title:
          stripHtml(rawTitle),

        link:
          stripHtml(
            getTag(item, "link")
          ),

        publishedAt:
          stripHtml(
            getTag(item, "pubDate")
          ),

        guid:
          stripHtml(
            getTag(item, "guid")
          )
      };
    });

    const posts = rawPosts
      .map((post) =>
        buildPostIntelligence(
          post,
          zooRoster,
          watchList
        )
      )
      .sort((a, b) => {
        const aScore = Math.max(
          a.intelligence
            .fantasyRelevance,

          a.intelligence
            .zooRelevance,

          a.intelligence
            .watchRelevance
        );

        const bScore = Math.max(
          b.intelligence
            .fantasyRelevance,

          b.intelligence
            .zooRelevance,

          b.intelligence
            .watchRelevance
        );

        return bScore - aScore;
      });

    const summary = {
      postsReviewed:
        posts.length,

      fantasyRelevant:
        posts.filter(
          (post) =>
            post.intelligence
              .fantasyRelevance >= 60
        ).length,

      zooRelevant:
        posts.filter(
          (post) =>
            post.intelligence
              .zooRelevance >= 60
        ).length,

      watchListRelevant:
        posts.filter(
          (post) =>
            post.intelligence
              .watchRelevance >= 60
        ).length,

      urgent:
        posts.filter(
          (post) =>
            post.intelligence
              .alertLevel === "URGENT"
        ).length,

      important:
        posts.filter(
          (post) =>
            post.intelligence
              .alertLevel === "IMPORTANT"
        ).length,

      zooRosterLoaded:
        zooRoster.length,

      watchListLoaded:
        watchList.length
    };

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"
      },

      body: JSON.stringify({
        ok: true,

        source:
          "Zoo GM Fantasy X List",

        dataSources: {
          zooRoster:
            "Google Sheets",

          watchList:
            "Google Sheets"
        },

        summary,
        posts
      })
    };
  } catch (error) {
    console.error(
      "Zoo GM X Feed Error:",
      error
    );

    return {
      statusCode: 500,

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        ok: false,

        error:
          "Unable to retrieve or analyze Zoo GM X feed.",

        detail:
          error.message
      })
    };
  }
};
