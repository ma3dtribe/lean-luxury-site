const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";
const ESPN_ENDPOINT = "https://ma3dtribe.com/.netlify/functions/zoo-gm-espn";

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
  return String(text)
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
  const match = String(block).match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return match ? match[1].trim() : "";
}

function getAuthorFromTitle(title = "") {
  const parts = String(title).split(":");
  if (parts.length < 2) return "";
  return parts.shift().trim();
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(text = "") {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  return keywordList.filter((keyword) => hasKeyword(text, keyword));
}

async function fetchText(url, label, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "User-Agent": "Zoo-GM/1.0",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`${label} request failed: ${response.status}`);
  }

  return response.text();
}

async function fetchJson(url, label, options = {}) {
  const text = await fetchText(url, label, options);

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function buildPlayerAliases(playerName = "") {
  const aliases = new Set();
  const original = String(playerName).trim();

  if (!original) return [];

  aliases.add(original);

  const cleaned = original
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, "")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned) aliases.add(cleaned);

  return [...aliases];
}

function textContainsPlayer(text = "", playerName = "") {
  const normalizedText = ` ${normalize(text)} `;

  return buildPlayerAliases(playerName).some((alias) => {
    const normalizedAlias = normalize(alias);

    if (!normalizedAlias || normalizedAlias.length < 4) return false;

    return normalizedText.includes(` ${normalizedAlias} `);
  });
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function priorityScore(priority = "") {
  const value = String(priority).toLowerCase();

  if (value === "high") return 18;
  if (value === "medium") return 10;
  if (value === "low") return 5;

  return 8;
}

function getZooTeamId(espnData = {}) {
  if (espnData.zooTeamId != null) return Number(espnData.zooTeamId);

  if (espnData.zoo && espnData.zoo.teamId != null) {
    return Number(espnData.zoo.teamId);
  }

  return null;
}

function getOpponentTeamId(espnData = {}) {
  const zooTeamId = getZooTeamId(espnData);

  if (zooTeamId == null) return null;

  for (const matchup of espnData.matchups || []) {
    const homeId = matchup.home && Number(matchup.home.teamId);
    const awayId = matchup.away && Number(matchup.away.teamId);

    if (homeId === zooTeamId && Number.isFinite(awayId)) return awayId;
    if (awayId === zooTeamId && Number.isFinite(homeId)) return homeId;
  }

  return null;
}

function buildLeaguePlayerCatalog(espnData = {}, watchList = []) {
  const catalog = new Map();
  const zooTeamId = getZooTeamId(espnData);
  const opponentTeamId = getOpponentTeamId(espnData);

  function upsert(player, context = {}) {
    if (!player || !player.name) return;

    const playerId =
      player.playerId != null ? String(player.playerId) : "";

    const key = playerId
      ? `id:${playerId}`
      : `name:${normalize(player.name)}`;

    const current = catalog.get(key) || {
      name: player.name,
      playerId,
      position: player.position || "",
      nflTeam: player.nflTeam || "",
      ownershipStatus: "UNKNOWN",
      classification: "UNKNOWN",
      lflTeam: "",
      lflTeamId: null,
      lineupStatus: "",
      opponentThisWeek: false,
      onWatchList: false,
      watchPriority: "",
      watchReason: "",
      watchTrigger: ""
    };

    const next = { ...current, ...context };

    next.name = current.name || player.name;
    next.playerId = current.playerId || playerId;
    next.position = current.position || player.position || "";
    next.nflTeam = current.nflTeam || player.nflTeam || "";

    catalog.set(key, next);
  }

  for (const team of espnData.teams || []) {
    const teamId = Number(team.teamId);
    const isZoo = teamId === zooTeamId;
    const isOpponent = teamId === opponentTeamId;

    for (const player of team.roster || []) {
      upsert(player, {
        ownershipStatus: isZoo ? "ZOO" : "LFL OWNED",
        classification: isZoo ? "ZOO" : "LFL OWNED",
        lflTeam: team.name || "",
        lflTeamId: team.teamId ?? null,
        lineupStatus: player.rosterStatus || player.lineupSlot || "",
        opponentThisWeek: isOpponent
      });
    }
  }

  for (const player of espnData.availablePlayers || []) {
    upsert(player, {
      ownershipStatus: "AVAILABLE",
      classification: "AVAILABLE",
      lflTeam: "",
      lflTeamId: null,
      lineupStatus: "",
      opponentThisWeek: false
    });
  }

  const players = [...catalog.values()];

  for (const watchPlayer of watchList) {
    const match = players.find(
      (player) =>
        normalize(player.name) === normalize(watchPlayer.name)
    );

    if (match) {
      match.onWatchList = true;
      match.classification = "WATCH LIST";
      match.watchPriority = watchPlayer.priority || "";
      match.watchReason = watchPlayer.reason || "";
      match.watchTrigger = watchPlayer.trigger || "";
    } else {
      catalog.set(`watch:${normalize(watchPlayer.name)}`, {
        name: watchPlayer.name,
        playerId: "",
        position: watchPlayer.position || "",
        nflTeam: watchPlayer.nflTeam || "",
        ownershipStatus: "UNKNOWN",
        classification: "WATCH LIST",
        lflTeam: "",
        lflTeamId: null,
        lineupStatus: "",
        opponentThisWeek: false,
        onWatchList: true,
        watchPriority: watchPlayer.priority || "",
        watchReason: watchPlayer.reason || "",
        watchTrigger: watchPlayer.trigger || ""
      });
    }
  }

  return [...catalog.values()];
}

function findMatchingLeaguePlayers(text = "", playerCatalog = []) {
  return playerCatalog.filter((player) =>
    textContainsPlayer(text, player.name)
  );
}

function scoreFantasyRelevance(text = "", playerMatches = []) {
  const fantasyMatches = findKeywords(text, FANTASY_KEYWORDS);
  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  let score = 10;

  score += Math.min(fantasyMatches.length * 8, 48);
  score += Math.min(urgentMatches.length * 7, 35);

  if (
    playerMatches.some(
      (player) => player.ownershipStatus === "ZOO"
    )
  ) {
    score += 20;
  }

  if (playerMatches.some((player) => player.onWatchList)) {
    score += 12;
  }

  if (
    playerMatches.some(
      (player) => player.ownershipStatus === "AVAILABLE"
    )
  ) {
    score += 8;
  }

  return clamp(score);
}

function scoreZooRelevance(text = "", playerMatches = []) {
  const zooMatches = playerMatches.filter(
    (player) => player.ownershipStatus === "ZOO"
  );

  if (zooMatches.length === 0) return 0;

  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  let score = 68;

  score += Math.min(zooMatches.length * 8, 16);
  score += Math.min(urgentMatches.length * 5, 20);

  return clamp(score);
}

function scoreWatchRelevance(text = "", playerMatches = []) {
  const watchMatches = playerMatches.filter(
    (player) => player.onWatchList
  );

  if (watchMatches.length === 0) return 0;

  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  const bestPriority = Math.max(
    ...watchMatches.map((player) =>
      priorityScore(player.watchPriority)
    )
  );

  let score = 55 + bestPriority;

  score += Math.min(urgentMatches.length * 5, 20);

  return clamp(score);
}

function scoreAvailableRelevance(text = "", playerMatches = []) {
  const availableMatches = playerMatches.filter(
    (player) => player.ownershipStatus === "AVAILABLE"
  );

  if (availableMatches.length === 0) return 0;

  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);
  const fantasyMatches = findKeywords(text, FANTASY_KEYWORDS);

  let score = 45;

  score += Math.min(urgentMatches.length * 6, 24);
  score += Math.min(fantasyMatches.length * 4, 20);

  if (availableMatches.some((player) => player.onWatchList)) {
    score += 15;
  }

  return clamp(score);
}

function scoreOpponentRelevance(text = "", playerMatches = []) {
  const opponentMatches = playerMatches.filter(
    (player) => player.opponentThisWeek
  );

  if (opponentMatches.length === 0) return 0;

  const urgentMatches = findKeywords(text, URGENT_KEYWORDS);

  let score = 50;

  score += Math.min(urgentMatches.length * 6, 30);

  return clamp(score);
}

function getAlertLevel(...scores) {
  const score = Math.max(...scores);

  if (score >= 90) return "URGENT";
  if (score >= 75) return "IMPORTANT";
  if (score >= 60) return "WATCH";

  return "STORE";
}

function getPostAgeHours(publishedAt = "") {
  const published = new Date(publishedAt).getTime();

  if (!Number.isFinite(published)) return 999;

  return Math.max(
    0,
    (Date.now() - published) / (1000 * 60 * 60)
  );
}

function getActionTier({
  fantasyRelevance,
  zooRelevance,
  watchRelevance,
  availableRelevance,
  opponentRelevance,
  urgentKeywords = [],
  zooPlayers = [],
  watchPlayers = [],
  availablePlayers = [],
  opponentPlayers = []
}) {
  const maxScore = Math.max(
    fantasyRelevance,
    zooRelevance,
    watchRelevance,
    availableRelevance,
    opponentRelevance
  );

  const hasUrgentSignal = urgentKeywords.length > 0;
  const directImpact =
    zooPlayers.length > 0 ||
    watchPlayers.length > 0 ||
    opponentPlayers.length > 0;

  if (
    hasUrgentSignal &&
    (
      zooPlayers.length > 0 ||
      availablePlayers.length > 0 ||
      watchPlayers.length > 0
    ) &&
    maxScore >= 75
  ) {
    return "ACT NOW";
  }

  if (
    directImpact ||
    availableRelevance >= 65 ||
    maxScore >= 75
  ) {
    return "MONITOR";
  }

  if (
    fantasyRelevance >= 45 ||
    availableRelevance >= 55
  ) {
    return "FYI";
  }

  return "NOISE";
}

function getPrimaryCategory({
  actionTier,
  zooPlayers = [],
  watchPlayers = [],
  availablePlayers = [],
  opponentPlayers = [],
  fantasyRelevance = 0
}) {
  if (actionTier === "NOISE") {
    return "NOISE";
  }

  if (zooPlayers.length > 0) {
    return "ZOO IMPACT";
  }

  if (
    availablePlayers.length > 0 &&
    watchPlayers.length > 0
  ) {
    return "WATCH LIST";
  }

  if (availablePlayers.length > 0) {
    return "AVAILABLE OPPORTUNITY";
  }

  if (watchPlayers.length > 0) {
    return "WATCH LIST";
  }

  if (opponentPlayers.length > 0) {
    return "OPPONENT";
  }

  if (fantasyRelevance >= 60) {
    return "FANTASY TREND";
  }

  return "AROUND THE NFL";
}

function getRecommendation({
  actionTier,
  zooPlayers = [],
  watchPlayers = [],
  availablePlayers = [],
  opponentPlayers = [],
  urgentKeywords = []
}) {
  const urgent = urgentKeywords.length > 0;

  if (
    actionTier === "ACT NOW" &&
    zooPlayers.length &&
    urgent
  ) {
    return "CHECK ZOO LINEUP";
  }

  if (
    actionTier === "ACT NOW" &&
    availablePlayers.length
  ) {
    return "REVIEW WAIVERS";
  }

  if (
    availablePlayers.length &&
    watchPlayers.length
  ) {
    return "MONITOR FOR ADD";
  }

  if (availablePlayers.length) {
    return "REVIEW AVAILABLE PLAYER";
  }

  if (zooPlayers.length) {
    return "MONITOR ZOO PLAYER";
  }

  if (opponentPlayers.length) {
    return "MONITOR OPPONENT";
  }

  if (watchPlayers.length) {
    return "MONITOR WATCH LIST";
  }

  return "HOLD";
}

function getPriorityScore(post) {
  const i = post.intelligence || {};

  const tierWeight = {
    "ACT NOW": 400,
    "MONITOR": 300,
    "FYI": 200,
    "NOISE": 100
  }[i.actionTier] || 0;

  const maxScore = Math.max(
    Number(i.fantasyRelevance || 0),
    Number(i.zooRelevance || 0),
    Number(i.watchRelevance || 0),
    Number(i.availableRelevance || 0),
    Number(i.opponentRelevance || 0)
  );

  const agePenalty = Math.min(
    getPostAgeHours(post.publishedAt),
    72
  );

  return tierWeight + maxScore - agePenalty;
}

function buildBrief(posts = []) {
  const meaningful = posts
    .filter(
      (post) =>
        post.intelligence?.actionTier !== "NOISE"
    )
    .sort(
      (a, b) =>
        getPriorityScore(b) - getPriorityScore(a)
    );

  const actNow = meaningful.filter(
    (post) =>
      post.intelligence?.actionTier === "ACT NOW"
  );

  const zoo = meaningful.filter(
    (post) =>
      post.intelligence?.directZooImpact
  );

  const available = meaningful.filter(
    (post) =>
      post.intelligence?.availablePlayerImpact
  );

  const watch = meaningful.filter(
    (post) =>
      post.intelligence?.watchListImpact
  );

  const opponent = meaningful.filter(
    (post) =>
      post.intelligence?.opponentImpact
  );

  let recommendation = "HOLD";

  if (
    actNow.some(
      (post) =>
        post.intelligence?.recommendation ===
        "CHECK ZOO LINEUP"
    )
  ) {
    recommendation = "CHECK ZOO LINEUP";
  } else if (
    actNow.some(
      (post) =>
        post.intelligence?.recommendation ===
        "REVIEW WAIVERS"
    )
  ) {
    recommendation = "REVIEW WAIVERS";
  } else if (
    available.some(
      (post) =>
        post.intelligence?.watchListImpact
    )
  ) {
    recommendation = "MONITOR WAIVERS";
  }

  return {
    recommendation,
    relevantPosts: meaningful.length,
    noisePosts: posts.length - meaningful.length,
    actNowCount: actNow.length,
    zooImpactCount: zoo.length,
    availableOpportunityCount: available.length,
    watchListCount: watch.length,
    opponentCount: opponent.length,

    topItems: meaningful.slice(0, 8).map((post) => ({
      author: post.author,
      text: post.text,
      link: post.link,
      publishedAt: post.publishedAt,
      actionTier: post.intelligence.actionTier,
      primaryCategory:
        post.intelligence.primaryCategory,
      recommendation:
        post.intelligence.recommendation,

      maxRelevance: Math.max(
        post.intelligence.fantasyRelevance,
        post.intelligence.zooRelevance,
        post.intelligence.watchRelevance,
        post.intelligence.availableRelevance,
        post.intelligence.opponentRelevance
      ),

      players: post.intelligence.players
    }))
  };
}

function buildPostIntelligence(post, playerCatalog) {
  const combinedText = `${post.title} ${post.text}`;

  const playerMatches = findMatchingLeaguePlayers(
    combinedText,
    playerCatalog
  );

  const fantasyKeywords = findKeywords(
    combinedText,
    FANTASY_KEYWORDS
  );

  const urgentKeywords = findKeywords(
    combinedText,
    URGENT_KEYWORDS
  );

  const fantasyRelevance = scoreFantasyRelevance(
    combinedText,
    playerMatches
  );

  const zooRelevance = scoreZooRelevance(
    combinedText,
    playerMatches
  );

  const watchRelevance = scoreWatchRelevance(
    combinedText,
    playerMatches
  );

  const availableRelevance = scoreAvailableRelevance(
    combinedText,
    playerMatches
  );

  const opponentRelevance = scoreOpponentRelevance(
    combinedText,
    playerMatches
  );

  const zooPlayers = playerMatches
    .filter(
      (player) =>
        player.ownershipStatus === "ZOO"
    )
    .map((player) => player.name);

  const watchPlayers = playerMatches
    .filter((player) => player.onWatchList)
    .map((player) => player.name);

  const availablePlayers = playerMatches
    .filter(
      (player) =>
        player.ownershipStatus === "AVAILABLE"
    )
    .map((player) => player.name);

  const lflOwnedPlayers = playerMatches
    .filter(
      (player) =>
        player.ownershipStatus === "LFL OWNED"
    )
    .map((player) => ({
      name: player.name,
      lflTeam: player.lflTeam
    }));

  const opponentPlayers = playerMatches
    .filter((player) => player.opponentThisWeek)
    .map((player) => player.name);

  const actionTier = getActionTier({
    fantasyRelevance,
    zooRelevance,
    watchRelevance,
    availableRelevance,
    opponentRelevance,
    urgentKeywords,
    zooPlayers,
    watchPlayers,
    availablePlayers,
    opponentPlayers
  });

  const primaryCategory = getPrimaryCategory({
    actionTier,
    zooPlayers,
    watchPlayers,
    availablePlayers,
    opponentPlayers,
    fantasyRelevance
  });

  const recommendation = getRecommendation({
    actionTier,
    zooPlayers,
    watchPlayers,
    availablePlayers,
    opponentPlayers,
    urgentKeywords
  });

  return {
    ...post,

    intelligence: {
      players: playerMatches.map((player) => ({
        name: player.name,
        position: player.position,
        nflTeam: player.nflTeam,
        classification: player.classification,
        ownershipStatus: player.ownershipStatus,
        lflTeam: player.lflTeam,
        lineupStatus: player.lineupStatus,
        opponentThisWeek: player.opponentThisWeek,
        onWatchList: player.onWatchList,
        watchPriority: player.watchPriority
      })),

      zooPlayers,
      watchPlayers,
      availablePlayers,
      lflOwnedPlayers,
      opponentPlayers,

      fantasyKeywords,
      urgentKeywords,

      fantasyRelevance,
      zooRelevance,
      watchRelevance,
      availableRelevance,
      opponentRelevance,

      actionTier,
      primaryCategory,
      recommendation,

      ageHours:
        Math.round(
          getPostAgeHours(post.publishedAt) * 10
        ) / 10,

      alertLevel: getAlertLevel(
        fantasyRelevance,
        zooRelevance,
        watchRelevance,
        availableRelevance,
        opponentRelevance
      ),

      directZooImpact: zooPlayers.length > 0,
      watchListImpact: watchPlayers.length > 0,
      availablePlayerImpact:
        availablePlayers.length > 0,
      opponentImpact: opponentPlayers.length > 0
    }
  };
}

exports.handler = async function () {
  try {
    const [xml, espnData] = await Promise.all([
      fetchText(
        RSS_FEED_URL,
        "RSS feed"
      ),
      fetchJson(
        ESPN_ENDPOINT,
        "Zoo GM ESPN"
      )
    ]);

    if (!espnData || !espnData.ok) {
      throw new Error(
        espnData && espnData.error
          ? espnData.error
          : "Zoo GM ESPN data unavailable"
      );
    }

    const watchList = Array.isArray(
      espnData.watchList
    )
      ? espnData.watchList.filter(
          (player) => player && player.name
        )
      : [];

    const playerCatalog =
      buildLeaguePlayerCatalog(
        espnData,
        watchList
      );

    const rawPosts = [
      ...xml.matchAll(
        /<item>([\s\S]*?)<\/item>/gi
      )
    ].map((match) => {
      const item = match[1];

      const rawTitle = getTag(
        item,
        "title"
      );

      const rawDescription = getTag(
        item,
        "description"
      );

      return {
        author: getAuthorFromTitle(
          stripHtml(rawTitle)
        ),
        text: stripHtml(rawDescription),
        title: stripHtml(rawTitle),
        link: stripHtml(
          getTag(item, "link")
        ),
        publishedAt: stripHtml(
          getTag(item, "pubDate")
        ),
        guid: stripHtml(
          getTag(item, "guid")
        )
      };
    });

    // Live Intelligence feed:
    // newest post first.
    const posts = rawPosts
      .map((post) =>
        buildPostIntelligence(
          post,
          playerCatalog
        )
      )
      .sort((a, b) => {
        const aTime =
          new Date(a.publishedAt).getTime() || 0;

        const bTime =
          new Date(b.publishedAt).getTime() || 0;

        return bTime - aTime;
      });

    // Zoo GM Brief:
    // relevance / urgency first.
    const brief = buildBrief(posts);

    const summary = {
      postsReviewed: posts.length,
      relevantPosts: brief.relevantPosts,
      noisePosts: brief.noisePosts,
      actNow: brief.actNowCount,

      monitor: posts.filter(
        (post) =>
          post.intelligence.actionTier ===
          "MONITOR"
      ).length,

      fyi: posts.filter(
        (post) =>
          post.intelligence.actionTier ===
          "FYI"
      ).length,

      fantasyRelevant: posts.filter(
        (post) =>
          post.intelligence.fantasyRelevance >= 60
      ).length,

      zooRelevant: posts.filter(
        (post) =>
          post.intelligence.zooRelevance >= 60
      ).length,

      watchListRelevant: posts.filter(
        (post) =>
          post.intelligence.watchRelevance >= 60
      ).length,

      availablePlayerRelevant: posts.filter(
        (post) =>
          post.intelligence.availableRelevance >=
          60
      ).length,

      opponentRelevant: posts.filter(
        (post) =>
          post.intelligence.opponentRelevance >= 60
      ).length,

      urgent: posts.filter(
        (post) =>
          post.intelligence.alertLevel === "URGENT"
      ).length,

      important: posts.filter(
        (post) =>
          post.intelligence.alertLevel ===
          "IMPORTANT"
      ).length,

      zooRosterLoaded:
        espnData.zooRosterSize ??
        (
          espnData.zoo &&
          espnData.zoo.roster
            ? espnData.zoo.roster.length
            : 0
        ),

      lflTeamsLoaded:
        espnData.teamCount ??
        (espnData.teams || []).length,

      rosteredPlayersLoaded:
        espnData.rosteredPlayerCount ?? 0,

      availablePlayersLoaded:
        espnData.availablePlayerCount ??
        (
          espnData.availablePlayers || []
        ).length,

      watchListLoaded:
        watchList.length,

      playerCatalogLoaded:
        playerCatalog.length
    };

    return {
      statusCode: 200,

      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },

      body: JSON.stringify({
        ok: true,

        source:
          "Zoo GM Fantasy X List",

        dataSources: {
          xFeed: "RSS.app",
          espnLeague:
            "Live Zoo GM ESPN Sync",
          watchList:
            "ESPN Watch List"
        },

        summary,
        brief,
        watchList,
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
          "application/json",
        "Cache-Control":
          "no-store"
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
