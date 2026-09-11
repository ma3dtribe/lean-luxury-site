const ESPN_ENDPOINT = "https://ma3dtribe.com/.netlify/functions/zoo-gm-espn";

// -----------------------------------------------------------------------------
// ZOO GM INTELLIGENCE SOURCES
// X/RSS.app has been retired. These sources now provide the live-news and
// weekly-analysis layer that feeds the same Zoo GM decision engine.
// Stability mode: live runtime scraping is limited to NBC + FantasyPros player news.
// Weekly IDP articles stay configured as reference inputs and your expert rankings remain active.
// -----------------------------------------------------------------------------
const INTELLIGENCE_SOURCES = [
  {
    key: "nbcsports",
    label: "NBC Sports Rotoworld",
    url: "https://www.nbcsports.com/fantasy/football/player-news",
    type: "PLAYER_NEWS",
    enabled: true
  },
  {
    key: "fantasypros",
    label: "FantasyPros Player News",
    url: "https://www.fantasypros.com/nfl/player-news.php",
    type: "PLAYER_NEWS",
    enabled: true
  },
  {
    key: "footballguys",
    label: "Footballguys IDP",
    url: process.env.ZOO_GM_FOOTBALLGUYS_URL ||
      "https://www.footballguys.com/article/2026-idp-start-sit-studs-duds-week01",
    type: "WEEKLY_IDP",
    enabled: false
  },
  {
    key: "fantasypros_idp",
    label: "FantasyPros IDP Start/Sit",
    url: process.env.ZOO_GM_FANTASYPROS_IDP_URL ||
      "https://www.fantasypros.com/2026/09/fantasy-football-idp-start-sit-lineup-advice-week-1-2026/",
    type: "WEEKLY_IDP",
    enabled: false
  },
  {
    key: "si_idp",
    label: "SI Fantasy IDP Rankings",
    url: process.env.ZOO_GM_SI_IDP_URL ||
      "https://www.si.com/onsi/fantasy/rankings/fantasy-football-idp-rankings-week-1-arvell-reese-raises-intrigue-with-dl-lb-eligibility",
    type: "WEEKLY_IDP_RANKINGS",
    enabled: false
  }
];

// Optional: later we can point this at a JSON file generated from your weekly
// Jamey / Heath / Fabiano / ESPN / FantasyPros rankings without changing this
// function again.
const EXPERT_RANKINGS_URL = process.env.ZOO_GM_EXPERT_RANKINGS_URL || "";

// If no rankings URL is configured, this block is the manual weekly fallback.
// Expected format:
// {
//   week: 1,
//   experts: [
//     { name: "Jamey Eisenberg", rankings: { QB: ["Player A"], RB: [...], WR: [...], TE: [...], LB: [...], DL: [...], CB: [...], S: [...] } }
//   ]
// }
const INLINE_WEEKLY_EXPERT_RANKINGS = {
  week: 1,
  experts: []
};

const EXPECTED_EXPERTS = [
  "Jamey Eisenberg",
  "Heath Cummings",
  "Michael Fabiano",
  "ESPN",
  "FantasyPros"
];

const FANTASYPROS_API_KEY = process.env.FANTASYPROS_API_KEY || "";

const URGENT_KEYWORDS = [
  "ruled out", "did not practice", "limited practice", "full practice", "practicing", "practiced",
  "injured reserve", "inactive", "injured", "injury", "questionable",
  "doubtful", "waived", "released", "cut", "traded", "trade",
  "suspended", "starter", "starting", "benched", "depth chart",
  "snap", "snaps", "role", "workload"
];

const FANTASY_KEYWORDS = [
  "fantasy", "injury", "practice", "practicing", "practiced", "inactive", "starter", "starting",
  "depth chart", "snap", "snaps", "target", "targets", "carry",
  "carries", "touches", "routes", "route participation", "red zone",
  "goal line", "waiver", "waivers", "free agent", "trade", "traded",
  "released", "waived", "rb", "wr", "qb", "te", "lb", "dl", "cb",
  "safety", "idp"
];

const EVENT_RULES = [
  [
    "INACTIVE",
    [
      "inactive",
      "will not play",
      "ruled out",
      "not expected to play"
    ]
  ],
  [
    "INJURY",
    [
      "injury",
      "injured",
      "injured reserve",
      "concussion",
      "hamstring",
      "ankle",
      "knee",
      "shoulder",
      "groin",
      "foot",
      "calf",
      "back injury"
    ]
  ],
  [
    "PRACTICE",
    [
      "did not practice",
      "limited practice",
      "full practice",
      "practice participation",
      "returned to practice",
      "missed practice",
      "practicing",
      "practiced",
      "participating in practice",
      "back at practice",
      "working at practice",
      "full participant",
      "limited participant",
      "returned to drills",
      "back on the field"
    ]
  ],
  [
    "TRANSACTION",
    [
      "waived",
      "released",
      "cut",
      "traded",
      "trade",
      "signed",
      "signing",
      "claimed",
      "activated",
      "elevated",
      "suspended"
    ]
  ],
  [
    "DEPTH_CHART",
    [
      "depth chart",
      "starter",
      "starting",
      "benched",
      "backup",
      "rb1",
      "rb2",
      "wr1",
      "wr2",
      "wr3",
      "te1",
      "qb1",
      "first team",
      "second team"
    ]
  ],
  [
    "ROLE_WORKLOAD",
    [
      "snap",
      "snaps",
      "role",
      "workload",
      "touches",
      "carries",
      "targets",
      "routes",
      "route participation",
      "goal line",
      "red zone",
      "third down",
      "two minute",
      "committee",
      "hot hand",
      "split",
      "featured",
      "every down"
    ]
  ],
  [
    "PERFORMANCE_ANALYSIS",
    [
      "film",
      "breakdown",
      "analysis",
      "efficiency",
      "yards per route",
      "yards after contact",
      "pressure rate",
      "target share",
      "air yards",
      "usage"
    ]
  ],
  [
    "FANTASY_STRATEGY",
    [
      "draft a",
      "mock draft",
      "draft strategy",
      "best ball",
      "adp",
      "ranking",
      "rankings",
      "sleepers",
      "start sit",
      "start/sit"
    ]
  ],
  [
    "PROMO_NOISE",
    [
      "new episode",
      "live tonight",
      "subscribe",
      "podcast",
      "giveaway",
      "merch",
      "tickets",
      "watch live",
      "join me",
      "sponsor"
    ]
  ]
];

const ACTIONABLE_EVENTS = new Set([
  "INACTIVE",
  "INJURY",
  "PRACTICE",
  "TRANSACTION",
  "DEPTH_CHART",
  "ROLE_WORKLOAD"
]);

const SOURCE_TIER_1 = new Set([
  "rapsheet",
  "adamschefter",
  "tompelissero",
  "jfowlerespn",
  "mysportsupdate",
  "schultz_report"
]);

const SOURCE_TIER_2 = new Set([
  "aaronwilson_nfl",
  "john_keim",
  "toddarcher",
  "davbirkett",
  "davebirkett",
  "nick_underhill",
  "jourdanrodrigue",
  "victafur",
  "mikeklis9news",
  "danielrpopper",
  "bynatetaylor",
  "miaobrientv",
  "holderstephen",
  "richcimini",
  "mikereiss",
  "adamjahns",
  "josephperson",
  "joebuscaglia",
  "jeffzrebiec",
  "joshtheathletic",
  "andyhermannfl",
  "colton_pouncy",
  "nickkosmider",
  "jonmachota",
  "marykaycabot",
  "pauldehnerjr",
  "john_shipley",
  "romeovillekid",
  "paulkuharskynfl",
  "salsports",
  "dorlandoled",
  "cardschatter",
  "zbrem",
  "zberm",
  "gerrydulac",
  "mattbarrows",
  "mikedugar",
  "gregauman",
  "scott7news",
  "gbellseattle"
]);

const SOURCE_TIER_FANTASY = new Set([
  "nbcsports",
  "fantasypros",
  "fantasypros_idp",
  "footballguys",
  "si_idp",
  "fantasypts",
  "fantasypros",
  "fantasyproshub",
  "establishtherun",
  "scottbarrettdfb",
  "mikeclaynfl",
  "lateroundqb",
  "dwainmcfarland",
  "pff_fantasy",
  "mbfantasylife",
  "underdognfl",
  "footballguys",
  "football_guys",
  "michael_fabiano",
  "michaelfabiano",
  "drjessemorse",
  "jmthrivept",
  "lordreebs"
]);

const SOURCE_TIER_IDP = new Set([
  "idp_macri",
  "idpgodfather",
  "theidptipster",
  "downwithidp",
  "idpnation",
  "theidpshow",
  "idp_plus",
  "idphunter",
  "realidphunter",
  "hitstick",
  "dhananizain",
  "mike_woellert",
  "johnpnorton"
]);

const NFL_TEAM_ALIASES = {
  ARI: ["arizona cardinals", "cardinals"],
  ATL: ["atlanta falcons", "falcons"],
  BAL: ["baltimore ravens", "ravens"],
  BUF: ["buffalo bills", "bills"],
  CAR: ["carolina panthers", "panthers"],
  CHI: ["chicago bears", "bears"],
  CIN: ["cincinnati bengals", "bengals"],
  CLE: ["cleveland browns", "browns"],
  DAL: ["dallas cowboys", "cowboys"],
  DEN: ["denver broncos", "broncos"],
  DET: ["detroit lions", "lions"],
  GB: ["green bay packers", "packers"],
  HOU: ["houston texans", "texans"],
  IND: ["indianapolis colts", "colts"],
  JAC: ["jacksonville jaguars", "jaguars", "jags"],
  JAX: ["jacksonville jaguars", "jaguars", "jags"],
  KC: ["kansas city chiefs", "chiefs"],
  LV: ["las vegas raiders", "raiders"],
  LAC: ["los angeles chargers", "chargers"],
  LAR: ["los angeles rams", "rams"],
  MIA: ["miami dolphins", "dolphins"],
  MIN: ["minnesota vikings", "vikings"],
  NE: ["new england patriots", "patriots", "pats"],
  NO: ["new orleans saints", "saints"],
  NYG: ["new york giants", "giants"],
  NYJ: ["new york jets", "jets"],
  PHI: ["philadelphia eagles", "eagles"],
  PIT: ["pittsburgh steelers", "steelers"],
  SEA: ["seattle seahawks", "seahawks"],
  SF: ["san francisco 49ers", "49ers", "niners"],
  TB: ["tampa bay buccaneers", "buccaneers", "bucs"],
  TEN: ["tennessee titans", "titans"],
  WAS: ["washington commanders", "commanders"]
};

const POSITION_ALIASES = {
  QB: [" qb ", "qb1", "qb2", "quarterback"],
  RB: [" rb ", "rb1", "rb2", "rb3", "running back", "backfield"],
  WR: [
    " wr ",
    "wr1",
    "wr2",
    "wr3",
    "wide receiver",
    "receiver room"
  ],
  TE: [" te ", "te1", "te2", "tight end"],
  LB: [" lb ", "linebacker"],
  DL: [" dl ", "defensive line", "edge rusher", "edge"],
  CB: [" cb ", "cornerback", "nickel"],
  S: [" safety ", " saf ", "free safety", "strong safety"]
};

// -----------------------------------------------------------------------------
// LFL STATIC LEAGUE INTELLIGENCE
// These values come from the league's fixed roster/scoring rules plus the
// 2023-2025 positional scoring history supplied for Zoo GM. They are static on
// purpose; live ESPN calls are reserved for roster/waiver/news information.
// -----------------------------------------------------------------------------
const LFL_CONFIG = {
  leagueSize: 10,
  rosterSize: 20,
  starters: 14,
  bench: 6,
  ir: 2,

  startingSlots: {
    QB: 1,
    RB: 2,
    RB_WR: 1,
    WR: 2,
    TE: 1,
    LB: 3,
    DL: 1,
    CB: 1,
    S: 1,
    K: 1
  },

  // Preferred 20-man Zoo construction. This deliberately spends bench spots
  // on RB/WR/LB rather than duplicating one-starter positions.
  preferredRosterCounts: {
    QB: 1,
    RB: 5,
    WR: 4,
    TE: 1,
    LB: 5,
    DL: 1,
    CB: 1,
    S: 1,
    K: 1
  },

  // LFL-specific position profiles. starterDemand reflects how many lineup spots a
  // position can realistically fill; scoringLeverage reflects how strongly the
  // league's custom scoring can reward difference-makers at that position.
  positionProfiles: {
    QB: { scarcity: 42, market: 38, benchBias: -18, starterDemand: 34, scoringLeverage: 62, historicalAvg: [44.98, 47.0, 44.09] },
    RB: { scarcity: 100, market: 100, benchBias: 20, starterDemand: 92, scoringLeverage: 92, historicalAvg: [38.79, 40.0, 40.15] },
    WR: { scarcity: 80, market: 82, benchBias: 14, starterDemand: 88, scoringLeverage: 90, historicalAvg: [37.55, 37.0, 35.81] },
    TE: { scarcity: 48, market: 42, benchBias: -16, starterDemand: 38, scoringLeverage: 58, historicalAvg: [28.57, 30.0, 29.48] },
    LB: { scarcity: 88, market: 76, benchBias: 18, starterDemand: 100, scoringLeverage: 100, historicalAvg: [39.03, 38.0, 36.91] },
    DL: { scarcity: 66, market: 56, benchBias: -8, starterDemand: 58, scoringLeverage: 92, historicalAvg: [35.1, 31.0, 34.08] },
    CB: { scarcity: 58, market: 48, benchBias: -8, starterDemand: 58, scoringLeverage: 96, historicalAvg: [38.4, 37.0, 35.19] },
    S:  { scarcity: 62, market: 52, benchBias: -8, starterDemand: 58, scoringLeverage: 96, historicalAvg: [40.0, 37.0, 33.73] },
    K:  { scarcity: 24, market: 18, benchBias: -24, starterDemand: 30, scoringLeverage: 70, historicalAvg: [25.4, 0, 0] }
  },

  scoring: {
    passing: { yardsPer20: 1, completion: 1, touchdown: 4.5, bonus40TD: 0.5, bonus50TD: 1, interception: -4, twoPoint: 2, sacked: -2 },
    rushing: { yardsPer5: 1.3, attempt: 0.5, touchdown: 6, bonus40TD: 1, bonus50TD: 2, twoPoint: 2 },
    receiving: { yardsPer5: 1.5, reception: 2, touchdown: 6, bonus40TD: 1, bonus50TD: 2, twoPoint: 2 },
    kicking: { pat: 1, missedPat: -1, fg0to39: 6, fg40to49: 15, missed0to39: -4, missed40to49: -2, fg50to59: 25, fg60plus: 25 },
    misc: { kickReturnTD: 6, puntReturnTD: 6, fumbleRecoveredTD: 6, fumbleLost: -3, interceptionReturnTD: 15, fumbleReturnTD: 15, blockedReturnTD: 20 },
    idp: { sack: 15, blockedKick: 18, interception: 22, fumbleRecovery: 10, forcedFumble: 5, safety: 25, assistedTackle: 2, soloTackle: 4, stuff: 3, passDefended: 12 }
  },

  philosophy: {
    priorityDepth: ["RB", "WR", "LB"],
    singleCarryPositions: ["QB", "TE", "DL", "CB", "S", "K"],
    rbTradePremium: true,
    evaluateAcrossPositions: true
  },

  // Current Zoo strategic context. These are small tie-breaker adjustments, not
  // permanent player rankings. Remove/update them when Zoo's roster situation changes.
  zooStrategicOverrides: {
    "patrick queen": { expendabilityAdjustment: 14, note: "current Zoo first-cut benchmark" },
    "demarvion overshown": { expendabilityAdjustment: -8, note: "upside stash protection" },
    "jacob rodriguez": { expendabilityAdjustment: -10, note: "recent opportunity/upside add" }
  }
};

function canonicalPosition(position = "") {
  const p = String(position || "").toUpperCase();
  if (p === "DE" || p === "DT") return "DL";
  if (p === "DB") return "CB";
  return p;
}

function getPositionProfile(position = "") {
  const p = canonicalPosition(position);
  return LFL_CONFIG.positionProfiles[p] || {
    scarcity: 35,
    market: 30,
    benchBias: -10,
    starterDemand: 30,
    scoringLeverage: 45,
    historicalAvg: [0, 0, 0]
  };
}

function historicalPositionAverage(position = "") {
  const values = getPositionProfile(position).historicalAvg.filter(Number);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

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
    new RegExp(
      `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    )
  );

  return match
    ? match[1].trim()
    : "";
}

function getAuthorFromTitle(title = "") {
  const parts =
    String(title).split(":");

  if (parts.length < 2) {
    return "";
  }

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
  return String(text).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function hasKeyword(
  text = "",
  keyword = ""
) {
  const normalizedText =
    normalize(text);

  const normalizedKeyword =
    normalize(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  const pattern =
    new RegExp(
      `(^|\\s)${escapeRegExp(
        normalizedKeyword
      )}(?=\\s|$|[.-])`,
      "i"
    );

  return pattern.test(
    normalizedText
  );
}

function findKeywords(
  text = "",
  keywordList = []
) {
  return keywordList.filter(
    keyword =>
      hasKeyword(
        text,
        keyword
      )
  );
}

async function fetchText(
  url,
  label,
  options = {}
) {
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 8000);
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response =
      await fetch(
        url,
        {
          method:
            options.method ||
            "GET",

          headers: {
            "User-Agent":
              "Zoo-GM/1.0",

            ...(
              options.headers ||
              {}
            )
          },
          signal: controller.signal
        }
      );

    if (!response.ok) {
      throw new Error(
        `${label} request failed: ${response.status}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(
  url,
  label,
  options = {}
) {
  const text =
    await fetchText(
      url,
      label,
      options
    );

  try {
    return JSON.parse(
      text
    );
  } catch (error) {
    throw new Error(
      `${label} returned invalid JSON`
    );
  }
}

function buildPlayerAliases(
  playerName = ""
) {
  const aliases =
    new Set();

  const original =
    String(
      playerName
    ).trim();

  if (!original) {
    return [];
  }

  const addAlias = value => {
    const alias = String(value || "").replace(/\s+/g, " ").trim();
    if (alias.length >= 4) aliases.add(alias);
  };

  addAlias(original);

  const noSuffix =
    original
      .replace(
        /\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

  addAlias(noSuffix);
  addAlias(noSuffix.replace(/[-–—]/g, " "));
  addAlias(noSuffix.replace(/[’']/g, ""));
  addAlias(noSuffix.replace(/[’']/g, "").replace(/[-–—]/g, " "));

  const parts = noSuffix.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];

    // Common reporter shorthand such as "J Daniels" or "J. Daniels".
    // Keep the last name reasonably long to reduce false matches.
    if (last.length >= 5) {
      addAlias(`${first.charAt(0)} ${last}`);
      addAlias(`${first.charAt(0)}. ${last}`);
    }
  }

  return [
    ...aliases
  ];
}

function textContainsPlayer(
  text = "",
  playerName = ""
) {
  const normalizedText =
    ` ${normalize(text)} `;

  return buildPlayerAliases(
    playerName
  ).some(
    alias => {
      const normalizedAlias =
        normalize(
          alias
        );

      if (
        !normalizedAlias ||
        normalizedAlias.length < 4
      ) {
        return false;
      }

      return normalizedText.includes(
        ` ${normalizedAlias} `
      );
    }
  );
}

function clamp(
  value,
  min = 0,
  max = 100
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function priorityScore(
  priority = ""
) {
  const value =
    String(
      priority
    ).toLowerCase();

  if (
    value === "high"
  ) {
    return 18;
  }

  if (
    value === "medium"
  ) {
    return 10;
  }

  if (
    value === "low"
  ) {
    return 5;
  }

  return 8;
}

function getZooTeamId(
  espnData = {}
) {
  if (
    espnData.zooTeamId != null
  ) {
    return Number(
      espnData.zooTeamId
    );
  }

  if (
    espnData.zoo &&
    espnData.zoo.teamId != null
  ) {
    return Number(
      espnData.zoo.teamId
    );
  }

  return null;
}

function getOpponentTeamId(
  espnData = {}
) {
  const zooTeamId =
    getZooTeamId(
      espnData
    );

  if (
    zooTeamId == null
  ) {
    return null;
  }

  for (
    const matchup
    of espnData.matchups || []
  ) {
    const homeId =
      matchup.home &&
      Number(
        matchup.home.teamId
      );

    const awayId =
      matchup.away &&
      Number(
        matchup.away.teamId
      );

    if (
      homeId === zooTeamId &&
      Number.isFinite(
        awayId
      )
    ) {
      return awayId;
    }

    if (
      awayId === zooTeamId &&
      Number.isFinite(
        homeId
      )
    ) {
      return homeId;
    }
  }

  return null;
}

function buildLeaguePlayerCatalog(
  espnData = {},
  watchList = []
) {
  const catalog =
    new Map();

  const zooTeamId =
    getZooTeamId(
      espnData
    );

  const opponentTeamId =
    getOpponentTeamId(
      espnData
    );

  function upsert(
    player,
    context = {}
  ) {
    if (
      !player ||
      !player.name
    ) {
      return;
    }

    const playerId =
      player.playerId != null
        ? String(
            player.playerId
          )
        : "";

    const key =
      playerId
        ? `id:${playerId}`
        : `name:${normalize(
            player.name
          )}`;

    const current =
      catalog.get(
        key
      ) || {
        name:
          player.name,

        playerId,

        position:
          player.position ||
          "",

        nflTeam:
          player.nflTeam ||
          "",

        percentOwned:
          player.percentOwned ??
          null,

        percentStarted:
          player.percentStarted ??
          null,

        injuryStatus:
          player.injuryStatus ||
          "ACTIVE",

        ownershipStatus:
          "UNKNOWN",

        classification:
          "UNKNOWN",

        lflTeam:
          "",

        lflTeamId:
          null,

        lineupStatus:
          "",

        opponentThisWeek:
          false,

        onWatchList:
          false,

        watchPriority:
          "",

        watchReason:
          "",

        watchTrigger:
          ""
      };

    const next = {
      ...current,
      ...context
    };

    next.name =
      current.name ||
      player.name;

    next.playerId =
      current.playerId ||
      playerId;

    next.position =
      current.position ||
      player.position ||
      "";

    next.nflTeam =
      current.nflTeam ||
      player.nflTeam ||
      "";

    next.percentOwned =
      player.percentOwned ??
      current.percentOwned ??
      null;

    next.percentStarted =
      player.percentStarted ??
      current.percentStarted ??
      null;

    next.injuryStatus =
      player.injuryStatus ||
      current.injuryStatus ||
      "ACTIVE";

    catalog.set(
      key,
      next
    );
  }

  for (
    const team
    of espnData.teams || []
  ) {
    const teamId =
      Number(
        team.teamId
      );

    const isZoo =
      teamId ===
      zooTeamId;

    const isOpponent =
      teamId ===
      opponentTeamId;

    for (
      const player
      of team.roster || []
    ) {
      upsert(
        player,
        {
          ownershipStatus:
            isZoo
              ? "ZOO"
              : "LFL OWNED",

          classification:
            isZoo
              ? "ZOO"
              : "LFL OWNED",

          lflTeam:
            team.name ||
            "",

          lflTeamId:
            team.teamId ??
            null,

          lineupStatus:
            player.rosterStatus ||
            player.lineupSlot ||
            "",

          opponentThisWeek:
            isOpponent
        }
      );
    }
  }

  for (
    const player
    of espnData.availablePlayers ||
    []
  ) {
    upsert(
      player,
      {
        ownershipStatus:
          "AVAILABLE",

        classification:
          "AVAILABLE",

        lflTeam:
          "",

        lflTeamId:
          null,

        lineupStatus:
          "",

        opponentThisWeek:
          false
      }
    );
  }

  const players = [
    ...catalog.values()
  ];

  for (
    const watchPlayer
    of watchList
  ) {
    const match =
      players.find(
        player =>
          normalize(
            player.name
          ) ===
          normalize(
            watchPlayer.name
          )
      );

    if (match) {
      match.onWatchList =
        true;

      match.classification =
        "WATCH LIST";

      match.watchPriority =
        watchPlayer.priority ||
        "";

      match.watchReason =
        watchPlayer.reason ||
        "";

      match.watchTrigger =
        watchPlayer.trigger ||
        "";

    } else {
      catalog.set(
        `watch:${normalize(
          watchPlayer.name
        )}`,
        {
          name:
            watchPlayer.name,

          playerId:
            "",

          position:
            watchPlayer.position ||
            "",

          nflTeam:
            watchPlayer.nflTeam ||
            "",

          percentOwned:
            watchPlayer.percentOwned ??
            null,

          percentStarted:
            watchPlayer.percentStarted ??
            null,

          injuryStatus:
            watchPlayer.injuryStatus ||
            "ACTIVE",

          ownershipStatus:
            "UNKNOWN",

          classification:
            "WATCH LIST",

          lflTeam:
            "",

          lflTeamId:
            null,

          lineupStatus:
            "",

          opponentThisWeek:
            false,

          onWatchList:
            true,

          watchPriority:
            watchPlayer.priority ||
            "",

          watchReason:
            watchPlayer.reason ||
            "",

          watchTrigger:
            watchPlayer.trigger ||
            ""
        }
      );
    }
  }

  return [
    ...catalog.values()
  ];
}

function findMatchingLeaguePlayers(
  text = "",
  playerCatalog = []
) {
  return playerCatalog.filter(
    player =>
      textContainsPlayer(
        text,
        player.name
      )
  );
}

function normalizeHandle(
  handle = "",
  author = ""
) {
  return String(
    handle ||
    author ||
    ""
  )
    .toLowerCase()
    .replace(/^@/, "")
    .replace(
      /[^a-z0-9_]/g,
      ""
    );
}

function getSourceAuthority(
  handle = "",
  author = ""
) {
  const key =
    normalizeHandle(
      handle,
      author
    );

  if (
    SOURCE_TIER_1.has(
      key
    )
  ) {
    return {
      tier:
        "TIER 1 NEWS",

      score:
        95,

      boost:
        10
    };
  }

  if (
    SOURCE_TIER_2.has(
      key
    )
  ) {
    return {
      tier:
        "BEAT / REPORTER",

      score:
        85,

      boost:
        8
    };
  }

  if (
    SOURCE_TIER_IDP.has(
      key
    )
  ) {
    return {
      tier:
        "IDP EXPERT",

      score:
        85,

      boost:
        8
    };
  }

  if (
    SOURCE_TIER_FANTASY.has(
      key
    )
  ) {
    return {
      tier:
        "FANTASY EXPERT",

      score:
        80,

      boost:
        6
    };
  }

  return {
    tier:
      "CURATED SOURCE",

    score:
      65,

    boost:
      3
  };
}

function detectEventTypes(
  text = ""
) {
  const matches =
    [];

  for (
    const [
      eventType,
      keywords
    ]
    of EVENT_RULES
  ) {
    if (
      keywords.some(
        keyword =>
          hasKeyword(
            text,
            keyword
          )
      )
    ) {
      matches.push(
        eventType
      );
    }
  }

  if (
    !matches.length
  ) {
    matches.push(
      "GENERAL_NEWS"
    );
  }

  return matches;
}

function getPrimaryEvent(
  eventTypes = []
) {
  const priority = [
    "INACTIVE",
    "INJURY",
    "PRACTICE",
    "TRANSACTION",
    "DEPTH_CHART",
    "ROLE_WORKLOAD",
    "PERFORMANCE_ANALYSIS",
    "FANTASY_STRATEGY",
    "PROMO_NOISE",
    "GENERAL_NEWS"
  ];

  return (
    priority.find(
      type =>
        eventTypes.includes(
          type
        )
    ) ||
    "GENERAL_NEWS"
  );
}

function hasActionableEvent(
  eventTypes = []
) {
  return eventTypes.some(
    type =>
      ACTIONABLE_EVENTS.has(
        type
      )
  );
}

function findMentionedNFLTeams(
  text = ""
) {
  const n =
    ` ${normalize(text)} `;

  const teams =
    new Set();

  for (
    const [
      team,
      aliases
    ]
    of Object.entries(
      NFL_TEAM_ALIASES
    )
  ) {
    if (
      aliases.some(
        alias =>
          n.includes(
            ` ${normalize(
              alias
            )} `
          )
      )
    ) {
      teams.add(
        team === "JAX"
          ? "JAC"
          : team
      );
    }
  }

  return teams;
}

function findMentionedPositions(
  text = ""
) {
  const n =
    ` ${normalize(text)} `;

  const positions =
    new Set();

  for (
    const [
      position,
      aliases
    ]
    of Object.entries(
      POSITION_ALIASES
    )
  ) {
    if (
      aliases.some(
        alias =>
          n.includes(
            normalize(
              alias
            ).startsWith(
              " "
            )
              ? normalize(
                  alias
                )
              : ` ${normalize(
                  alias
                )} `
          )
      )
    ) {
      positions.add(
        position
      );
    }
  }

  return positions;
}

function normalizeNflTeam(
  team = ""
) {
  const value =
    String(
      team ||
      ""
    ).toUpperCase();

  return value === "JAX"
    ? "JAC"
    : value;
}

function isRelevantContextCandidate(
  player = {}
) {
  return (
    player.ownershipStatus ===
      "ZOO" ||
    player.onWatchList ||
    player.opponentThisWeek
  );
}

function directPositionsForTeam(
  playerMatches = [],
  nflTeam = ""
) {
  const team =
    normalizeNflTeam(
      nflTeam
    );

  return new Set(
    playerMatches
      .filter(
        player =>
          normalizeNflTeam(
            player.nflTeam
          ) ===
          team
      )
      .map(
        player =>
          String(
            player.position ||
            ""
          ).toUpperCase()
      )
      .filter(
        Boolean
      )
  );
}

function positionsAreRelated(
  candidatePosition = "",
  directPositions =
    new Set(),
  eventTypes = []
) {
  const candidate =
    String(
      candidatePosition ||
      ""
    ).toUpperCase();

  if (!candidate) {
    return false;
  }

  if (
    directPositions.has(
      candidate
    )
  ) {
    return true;
  }

  const severeAvailabilityEvent =
    eventTypes.some(
      type =>
        [
          "INACTIVE",
          "INJURY",
          "PRACTICE"
        ].includes(
          type
        )
    );

  if (
    !severeAvailabilityEvent
  ) {
    return false;
  }

  if (
    directPositions.has(
      "QB"
    ) &&
    [
      "RB",
      "WR",
      "TE"
    ].includes(
      candidate
    )
  ) {
    return true;
  }

  if (
    candidate === "QB" &&
    [
      ...directPositions
    ].some(
      pos =>
        [
          "WR",
          "TE"
        ].includes(
          pos
        )
    )
  ) {
    return true;
  }

  return false;
}

function buildContextImpact(
  text = "",
  playerMatches = [],
  playerCatalog = [],
  eventTypes = []
) {
  if (
    !hasActionableEvent(
      eventTypes
    )
  ) {
    return [];
  }

  const mentionedTeams =
    findMentionedNFLTeams(
      text
    );

  const mentionedPositions =
    findMentionedPositions(
      text
    );

  for (
    const player
    of playerMatches
  ) {
    if (
      player.nflTeam
    ) {
      mentionedTeams.add(
        normalizeNflTeam(
          player.nflTeam
        )
      );
    }
  }

  if (
    !mentionedTeams.size
  ) {
    return [];
  }

  const directKeys =
    new Set(
      playerMatches.map(
        player =>
          player.playerId
            ? `id:${player.playerId}`
            : `name:${normalize(
                player.name
              )}`
      )
    );

  const context =
    [];

  for (
    const candidate
    of playerCatalog
  ) {
    if (
      !candidate?.name ||
      !candidate.nflTeam ||
      !isRelevantContextCandidate(
        candidate
      )
    ) {
      continue;
    }

    const candidateKey =
      candidate.playerId
        ? `id:${candidate.playerId}`
        : `name:${normalize(
            candidate.name
          )}`;

    if (
      directKeys.has(
        candidateKey
      )
    ) {
      continue;
    }

    const team =
      normalizeNflTeam(
        candidate.nflTeam
      );

    if (
      !mentionedTeams.has(
        team
      )
    ) {
      continue;
    }

    const candidatePosition =
      String(
        candidate.position ||
        ""
      ).toUpperCase();

    const directPositions =
      directPositionsForTeam(
        playerMatches,
        team
      );

    let reason =
      "";

    if (
      mentionedPositions.size &&
      mentionedPositions.has(
        candidatePosition
      )
    ) {
      reason =
        "TEAM + POSITION CONTEXT";

    } else if (
      directPositions.size &&
      positionsAreRelated(
        candidatePosition,
        directPositions,
        eventTypes
      )
    ) {
      reason =
        "TEAMMATE / ROLE CONTEXT";

    } else if (
      !mentionedPositions.size &&
      directPositions.has(
        candidatePosition
      )
    ) {
      reason =
        "POSITION COMPETITION";
    }

    if (
      !reason
    ) {
      continue;
    }

    context.push({
      ...candidate,
      contextReason:
        reason
    });
  }

  return context;
}

function scoreFantasyRelevance(
  text = "",
  playerMatches = [],
  eventTypes = [],
  source = {}
) {
  const fantasyMatches =
    findKeywords(
      text,
      FANTASY_KEYWORDS
    );

  const urgentMatches =
    findKeywords(
      text,
      URGENT_KEYWORDS
    );

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  const primaryEvent =
    getPrimaryEvent(
      eventTypes
    );

  let score =
    primaryEvent ===
    "PROMO_NOISE"
      ? 4
      : 10;

  score += Math.min(
    fantasyMatches.length *
      6,
    36
  );

  score += Math.min(
    urgentMatches.length *
      7,
    28
  );

  if (
    actionable
  ) {
    score += 18;
  }

  if (
    primaryEvent ===
    "PERFORMANCE_ANALYSIS"
  ) {
    score += 10;
  }

  if (
    primaryEvent ===
    "FANTASY_STRATEGY"
  ) {
    score =
      Math.min(
        score,
        42
      );
  }

  if (
    primaryEvent ===
    "PROMO_NOISE"
  ) {
    score =
      Math.min(
        score,
        20
      );
  }

  if (
    playerMatches.some(
      player =>
        player.ownershipStatus ===
        "ZOO"
    )
  ) {
    score += 15;
  }

  if (
    playerMatches.some(
      player =>
        player.onWatchList
    )
  ) {
    score += 10;
  }

  if (
    actionable &&
    playerMatches.some(
      player =>
        player.ownershipStatus === "LFL OWNED"
    )
  ) {
    score += 12;
  }

  score +=
    Number(
      source.boost ||
      0
    );

  return clamp(
    score
  );
}

function scoreZooRelevance(
  text = "",
  directMatches = [],
  contextMatches = [],
  eventTypes = [],
  source = {}
) {
  const direct =
    directMatches.filter(
      player =>
        player.ownershipStatus ===
        "ZOO"
    );

  const indirect =
    contextMatches.filter(
      player =>
        player.ownershipStatus ===
        "ZOO"
    );

  if (
    !direct.length &&
    !indirect.length
  ) {
    return 0;
  }

  const urgentMatches =
    findKeywords(
      text,
      URGENT_KEYWORDS
    );

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  let score =
    direct.length
      ? 62
      : 48;

  if (
    actionable
  ) {
    score +=
      direct.length
        ? 14
        : 18;
  }

  score += Math.min(
    urgentMatches.length *
      5,
    15
  );

  score += Math.min(
    (
      direct.length +
      indirect.length
    ) * 5,
    10
  );

  score +=
    Number(
      source.boost ||
      0
    );

  return clamp(
    score
  );
}

function scoreWatchRelevance(
  text = "",
  directMatches = [],
  contextMatches = [],
  eventTypes = [],
  source = {}
) {
  const matches = [
    ...directMatches,
    ...contextMatches
  ].filter(
    player =>
      player.onWatchList
  );

  if (
    !matches.length
  ) {
    return 0;
  }

  const bestPriority =
    Math.max(
      ...matches.map(
        player =>
          priorityScore(
            player.watchPriority
          )
      )
    );

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  let score =
    45 +
    bestPriority +
    (
      actionable
        ? 15
        : 0
    ) +
    Number(
      source.boost ||
      0
    );

  return clamp(
    score
  );
}

function scoreAvailableRelevance(
  text = "",
  directMatches = [],
  eventTypes = [],
  source = {}
) {
  const available =
    directMatches.filter(
      player =>
        player.ownershipStatus ===
        "AVAILABLE"
    );

  if (
    !available.length
  ) {
    return 0;
  }

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  const primaryEvent =
    getPrimaryEvent(
      eventTypes
    );

  if (
    !actionable
  ) {
    if (
      primaryEvent ===
        "FANTASY_STRATEGY" ||
      primaryEvent ===
        "PROMO_NOISE"
    ) {
      return 10;
    }

    return Math.min(
      30 +
      Number(
        source.boost ||
        0
      ),
      40
    );
  }

  const urgentMatches =
    findKeywords(
      text,
      URGENT_KEYWORDS
    );

  let score =
    52 +
    Math.min(
      urgentMatches.length *
        6,
      18
    ) +
    Number(
      source.boost ||
      0
    );

  if (
    available.some(
      player =>
        player.onWatchList
    )
  ) {
    score += 15;
  }

  return clamp(
    score
  );
}

function scoreOpponentRelevance(
  text = "",
  directMatches = [],
  contextMatches = [],
  eventTypes = [],
  source = {}
) {
  const matches = [
    ...directMatches,
    ...contextMatches
  ].filter(
    player =>
      player.opponentThisWeek
  );

  if (
    !matches.length
  ) {
    return 0;
  }

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  let score =
    directMatches.some(
      player =>
        player.opponentThisWeek
    )
      ? 50
      : 42;

  if (
    actionable
  ) {
    score += 18;
  }

  score +=
    Number(
      source.boost ||
      0
    );

  return clamp(
    score
  );
}

function getAlertLevel(
  ...scores
) {
  const score =
    Math.max(
      ...scores
    );

  if (
    score >= 90
  ) {
    return "URGENT";
  }

  if (
    score >= 75
  ) {
    return "IMPORTANT";
  }

  if (
    score >= 60
  ) {
    return "WATCH";
  }

  return "STORE";
}

function getPostAgeHours(
  publishedAt = ""
) {
  const published =
    new Date(
      publishedAt
    ).getTime();

  if (
    !Number.isFinite(
      published
    )
  ) {
    return 999;
  }

  return Math.max(
    0,
    (
      Date.now() -
      published
    ) /
    (
      1000 *
      60 *
      60
    )
  );
}


function getZooRoster(espnData = {}) {
  if (Array.isArray(espnData?.zoo?.roster)) {
    return espnData.zoo.roster;
  }

  const zooTeamId = getZooTeamId(espnData);
  const team = (espnData.teams || []).find(
    item => Number(item.teamId) === Number(zooTeamId)
  );

  return Array.isArray(team?.roster) ? team.roster : [];
}

function countRosterPositions(roster = [], { includeIR = false } = {}) {
  const counts = {};

  for (const player of roster) {
    const slot = String(player?.rosterStatus || player?.lineupSlot || "").toUpperCase();
    if (!includeIR && slot === "IR") continue;

    const position = canonicalPosition(player?.position);
    if (!position) continue;
    counts[position] = (counts[position] || 0) + 1;
  }

  return counts;
}

function getPreferredCount(position = "") {
  return Number(
    LFL_CONFIG.preferredRosterCounts[canonicalPosition(position)] || 1
  );
}

function rosterNeedScore(position = "", counts = {}) {
  const p = canonicalPosition(position);
  const current = Number(counts[p] || 0);
  const preferred = getPreferredCount(p);
  const profile = getPositionProfile(p);

  if (current < preferred) {
    return clamp(20 + ((preferred - current) * 5) + (profile.benchBias > 0 ? 3 : 0), 0, 25);
  }

  if (current === preferred) {
    return profile.benchBias > 0 ? 15 : 8;
  }

  return profile.benchBias > 0 ? 6 : 2;
}

function playerMarketQuality(player = {}) {
  const owned = Number(player.percentOwned || 0);
  const started = Number(player.percentStarted || 0);
  return clamp((owned * 0.55) + (started * 1.1), 0, 100);
}

function actionTierValue(tier = "") {
  return {
    "ACT NOW": 20,
    "MONITOR": 15,
    "FYI": 8,
    "NOISE": 0
  }[String(tier)] || 0;
}

function postsForPlayer(posts = [], playerName = "") {
  return posts.filter(post => {
    const intelligence = post.intelligence || {};
    return (intelligence.impactPlayers || intelligence.players || []).some(
      player => normalize(player.name) === normalize(playerName)
    );
  });
}

function liveNewsScore(posts = [], playerName = "") {
  const related = postsForPlayer(posts, playerName);
  if (!related.length) return 0;

  return clamp(Math.max(
    ...related.map(post => {
      const i = post.intelligence || {};
      let value = actionTierValue(i.actionTier);
      if (i.hasActionableEvent) value += 3;
      if (["INACTIVE", "INJURY", "PRACTICE", "TRANSACTION", "DEPTH_CHART"].includes(i.primaryEvent)) {
        value += 2;
      }
      return value;
    })
  ), 0, 20);
}

function historicalProductionIndex(position = "") {
  const avg = historicalPositionAverage(position);
  // LFL top-end positional averages have generally clustered around the mid-30s
  // to low-40s. Converting that history to a 0-100 index lets defensive scoring
  // matter without allowing raw QB totals to dominate roster decisions.
  return clamp(Math.round(((avg - 20) / 25) * 100), 0, 100);
}

function positionLflValue(position = "") {
  const p = canonicalPosition(position);
  const profile = getPositionProfile(p);
  const history = historicalProductionIndex(p);

  return clamp(Math.round(
    (profile.scarcity * 0.20) +
    (profile.market * 0.08) +
    (profile.starterDemand * 0.24) +
    (profile.scoringLeverage * 0.28) +
    (history * 0.20)
  ), 0, 100);
}

function watchPriorityBonus(priority = "") {
  const value = String(priority || "").toLowerCase();
  if (value === "high") return 10;
  if (value === "medium") return 5;
  if (value === "low") return 1;
  return 0;
}

function candidateContext(player = {}, watchContext = null) {
  return {
    onWatchList: Boolean(watchContext),
    watchPriorityScore: Number(watchContext?.priorityScore || 0),
    watchRecommendation: watchContext?.recommendation || "",
    watchPriorityBonus: watchPriorityBonus(player.watchPriority || watchContext?.watchPriority || "")
  };
}

function injuryAvailabilityAdjustment(player = {}) {
  const status = normalize(player.injuryStatus || player.status || "");

  if (!status || status === "active" || status === "healthy") return 0;
  if (/(injured reserve|\bir\b|pup|physically unable|nfi|reserve)/.test(status)) return -32;
  if (/(out|suspended)/.test(status)) return -24;
  if (/(doubtful)/.test(status)) return -12;
  if (/(questionable)/.test(status)) return -5;

  return -3;
}

const CURRENT_ROLE_OVERRIDES = {
  // Current-role corrections supplied for Zoo GM. Keep these small and explicit so
  // live ESPN/news signals still drive the score and the override is easy to remove
  // when the role changes.
  "tyrel dodson": { adjustment: -28, note: "not currently a Carolina starting linebacker; reserve-role penalty" },
  "anthony hill jr.": { adjustment: -26, note: "currently a backup/reserve linebacker; prospect upside does not equal immediate LFL starter value" },
  "anthony hill jr": { adjustment: -26, note: "currently a backup/reserve linebacker; prospect upside does not equal immediate LFL starter value" },
  "cody barton": { adjustment: -12, note: "starting-role value acknowledged, but current opportunity does not justify an automatic ADD NOW grade" }
};

function roleOpportunitySignal(player = {}, posts = []) {
  const related = postsForPlayer(posts, player.name);
  let adjustment = 0;
  const notes = [];

  for (const post of related.slice(0, 8)) {
    const text = normalize(`${post.title || ""} ${post.text || ""}`);

    if (/(practice squad|signed to the practice squad|backup|second team|second-team|not starting|reserve role)/.test(text)) {
      adjustment = Math.min(adjustment, -18);
      notes.push("current news indicates a reserve/non-starting role");
    }

    if (/(named starter|starting linebacker|starting corner|starting safety|starting defensive|first team|first-team|every down|every-down|green dot|full time role|full-time role|100% of snaps|all defensive snaps)/.test(text)) {
      adjustment = Math.max(adjustment, 14);
      notes.push("current news supports a starting/high-snap role");
    }

    if (/(promoted from the practice squad|elevated from the practice squad)/.test(text)) {
      adjustment = Math.max(adjustment, 4);
      notes.push("recent roster promotion increases opportunity");
    }
  }

  const override = CURRENT_ROLE_OVERRIDES[normalize(player.name)] || null;
  if (override) {
    adjustment += Number(override.adjustment || 0);
    notes.push(override.note);
  }

  return {
    adjustment: clamp(Math.round(adjustment), -35, 20),
    notes: [...new Set(notes)]
  };
}

function playerAvailabilityContext(player = {}, posts = []) {
  const injuryAdjustment = injuryAvailabilityAdjustment(player);
  const role = roleOpportunitySignal(player, posts);
  return {
    injuryAdjustment,
    roleAdjustment: role.adjustment,
    totalAdjustment: clamp(injuryAdjustment + role.adjustment, -45, 20),
    roleNotes: role.notes
  };
}

function acquisitionScore(player = {}, rosterCounts = {}, posts = [], watchContext = null) {
  const position = canonicalPosition(player.position);
  const profile = getPositionProfile(position);
  const need = rosterNeedScore(position, rosterCounts);
  const marketQuality = playerMarketQuality(player);
  const news = liveNewsScore(posts, player.name);
  const lflValue = positionLflValue(position);
  const history = historicalProductionIndex(position);
  const context = candidateContext(player, watchContext);
  const availability = playerAvailabilityContext(player, posts);

  let score =
    (need * 0.70) +
    (lflValue * 0.40) +
    (history * 0.12) +
    (marketQuality * 0.12) +
    (news * 0.85) +
    (context.watchPriorityBonus * 0.80) +
    (profile.benchBias * 0.35) +
    availability.totalAdjustment;

  const current = Number(rosterCounts[position] || 0);
  const preferred = getPreferredCount(position);

  // In this LFL, six IDPs start every week and big plays are massively rewarded
  // (sack 15, INT 22, PD 12, safety 25). A defensive player with starter/upside
  // value should not be buried simply because Zoo normally carries one DL/CB/S.
  if (["LB", "DL", "CB", "S"].includes(position)) {
    score += profile.scoringLeverage * 0.10;
    score += profile.starterDemand * 0.08;
  }

  if (position === "LB") score += 7;
  if (["DL", "CB", "S"].includes(position)) score += 5;

  if (
    LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
    current >= preferred
  ) {
    const defensiveStarterChallenge = ["DL", "CB", "S"].includes(position);
    score -= defensiveStarterChallenge ? 7 : 20;
  }

  if (["RB", "WR", "LB"].includes(position) && current < preferred) {
    score += 8;
  }

  // RB inventory still has special trade/attrition value in the LFL, but no
  // longer receives enough of an automatic boost to suppress elite IDP targets.
  if (position === "RB") score += 5;

  // If a player is already on Zoo's Watch List, use that work as a corroborating
  // signal rather than creating a second, contradictory ranking system.
  if (context.watchPriorityScore > 0) {
    score = Math.max(score, context.watchPriorityScore * 0.94);
  }

  return clamp(Math.round(score), 0, 100);
}

function lflBestPlayerScore(player = {}, rosterCounts = {}, posts = [], watchContext = null) {
  const position = canonicalPosition(player.position);
  const profile = getPositionProfile(position);
  const marketQuality = playerMarketQuality(player);
  const news = liveNewsScore(posts, player.name);
  const lflValue = positionLflValue(position);
  const history = historicalProductionIndex(position);
  const need = rosterNeedScore(position, rosterCounts);
  const context = candidateContext(player, watchContext);
  const availability = playerAvailabilityContext(player, posts);

  // TRUE LFL BEST-PLAYER BOARD:
  // Player quality/market signal, LFL scoring fit, historical positional production,
  // live role/news and availability drive the ranking. Zoo roster need is deliberately
  // only a small tie-breaker so an elite QB, DL, CB, S, TE or K can outrank a merely
  // useful RB/WR/LB even when Zoo already starts someone at that position.
  let score =
    (marketQuality * 0.36) +
    (lflValue * 0.25) +
    (history * 0.14) +
    (profile.scarcity * 0.06) +
    (profile.market * 0.04) +
    (news * 1.10) +
    ((need - 10) * 0.18) +
    (context.watchPriorityBonus * 0.20) +
    availability.totalAdjustment;

  return clamp(Math.round(score), 0, 100);
}

function buildWatchListIntelligence(
  watchList = [],
  playerCatalog = [],
  espnData = {},
  posts = []
) {
  const zooRoster = getZooRoster(espnData);
  const counts = countRosterPositions(zooRoster);
  const results = [];

  for (const watchPlayer of watchList) {
    const catalogPlayer = playerCatalog.find(
      player =>
        String(player.playerId || "") === String(watchPlayer.playerId || "") ||
        normalize(player.name) === normalize(watchPlayer.name)
    ) || watchPlayer;

    const position = canonicalPosition(catalogPlayer.position);
    const profile = getPositionProfile(position);
    const need = rosterNeedScore(position, counts);
    const news = liveNewsScore(posts, catalogPlayer.name);
    const marketQuality = playerMarketQuality(catalogPlayer);
    const historicalIndex = historicalProductionIndex(position);
    const lflValue = positionLflValue(position);
    const availability = playerAvailabilityContext(catalogPlayer, posts);

    const replacementValue = clamp(
      Math.round(
        (lflValue * 0.55) +
        (historicalIndex * 0.25) +
        (marketQuality * 0.20)
      ),
      0,
      100
    );

    const claimRisk = clamp(
      Math.round(
        (Number(catalogPlayer.percentOwned || 0) * 0.55) +
        (Number(catalogPlayer.percentStarted || 0) * 1.05)
      ),
      0,
      100
    );

    let score = lflBestPlayerScore(catalogPlayer, counts, posts, watchPlayer);

    const currentCount = Number(counts[position] || 0);
    const preferred = getPreferredCount(position);
    const redundantSingle =
      LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
      currentCount >= preferred;

    // The Watch List is now a true best-player-for-the-LFL board. Do not penalize
    // QB/TE/DL/CB/S simply because Zoo currently carries one starter. Existing
    // roster construction is only reflected by the small tie-breaker inside
    // lflBestPlayerScore().
    if (String(watchPlayer.priority || "").toLowerCase() === "high") score += 2;
    if (catalogPlayer.ownershipStatus === "LFL OWNED") score -= 15;

    score = clamp(Math.round(score), 0, 100);

    let recommendation = "IGNORE";
    if (catalogPlayer.ownershipStatus === "LFL OWNED") {
      recommendation = score >= 72 ? "TRADE WATCH" : "OWNED - MONITOR";
    } else if (score >= 82) {
      recommendation = "ADD NOW";
    } else if (score >= 68) {
      recommendation = "WATCH CLOSELY";
    } else if (score >= 50) {
      recommendation = "HOLD";
    }

    const reasons = [];
    if (position === "RB") reasons.push("LFL RB scarcity + trade inventory value");
    if (need >= 20) reasons.push(`Zoo needs ${position} depth`);
    if (position === "LB") reasons.push("LFL starts 3 LBs and rewards tackle/splash production heavily");
    if (["DL", "CB", "S"].includes(position)) reasons.push(`LFL ${position} scoring can create a meaningful starter upgrade`);
    if (redundantSingle && !["DL", "CB", "S"].includes(position)) reasons.push(`Zoo normally carries one ${position}`);
    if (news >= 15) reasons.push("actionable live news");
    if (claimRisk >= 60) reasons.push("elevated waiver claim risk");
    if (historicalIndex >= 60) reasons.push(`strong 2023-2025 LFL scoring environment for ${position}`);
    if (availability.injuryAdjustment <= -24) reasons.push(`major availability penalty: ${catalogPlayer.injuryStatus || "inactive/reserve status"}`);
    else if (availability.injuryAdjustment < 0) reasons.push(`injury/status penalty: ${catalogPlayer.injuryStatus || "limited availability"}`);
    reasons.push(...availability.roleNotes);
    if (!reasons.length) reasons.push("depth value versus current Zoo construction");

    results.push({
      playerId: catalogPlayer.playerId || watchPlayer.playerId || null,
      name: catalogPlayer.name,
      position,
      nflTeam: catalogPlayer.nflTeam || "",
      ownershipStatus: catalogPlayer.ownershipStatus || "UNKNOWN",
      lflTeam: catalogPlayer.lflTeam || "",
      priorityScore: score,
      zooValueScore: score,
      recommendation,
      components: {
        zooNeed: need,
        lflPositionValue: lflValue,
        positionalScarcity: profile.scarcity,
        starterDemand: profile.starterDemand,
        scoringLeverage: profile.scoringLeverage,
        historicalProduction: historicalIndex,
        liveNews: news,
        replacementValue,
        tradeMarketValue: profile.market,
        claimRisk,
        injuryAvailabilityAdjustment: availability.injuryAdjustment,
        roleOpportunityAdjustment: availability.roleAdjustment
      },
      injuryStatus: catalogPlayer.injuryStatus || "ACTIVE",
      historicalPositionAverage: historicalPositionAverage(position),
      currentZooCount: currentCount,
      preferredZooCount: preferred,
      reasons
    });
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
}

function buildSuggestedWatchList(
  watchList = [],
  espnData = {},
  posts = [],
  limit = 12
) {
  const zooRoster = getZooRoster(espnData);
  const counts = countRosterPositions(zooRoster);
  const watchedIds = new Set((watchList || []).map(player => String(player.playerId || "")).filter(Boolean));
  const watchedNames = new Set((watchList || []).map(player => normalize(player.name)).filter(Boolean));

  return (espnData.availablePlayers || [])
    .filter(player => {
      if (!player?.name) return false;
      const position = canonicalPosition(player.position);
      if (!position || position === "D/ST") return false;
      if (watchedIds.has(String(player.playerId || ""))) return false;
      if (watchedNames.has(normalize(player.name))) return false;
      return true;
    })
    .map(player => {
      const position = canonicalPosition(player.position);
      const profile = getPositionProfile(position);
      const availability = playerAvailabilityContext(player, posts);
      const score = lflBestPlayerScore(player, counts, posts, null);
      const marketQuality = playerMarketQuality(player);
      const news = liveNewsScore(posts, player.name);

      let recommendation = "SCOUT";
      if (score >= 82) recommendation = "ADD TO WATCH LIST";
      else if (score >= 70) recommendation = "WATCH CLOSELY";
      else if (score >= 60) recommendation = "SCOUT";
      else recommendation = "DEEP WATCH";

      const reasons = [];
      reasons.push("ranked on overall LFL player value, not positional quota");
      if (position === "LB") reasons.push("3 LBs start weekly in the LFL");
      if (["DL", "CB", "S"].includes(position)) reasons.push(`high-impact LFL ${position} scoring creates starter-upgrade upside`);
      if (position === "RB") reasons.push("RB scarcity and trade inventory matter in the LFL");
      if (rosterNeedScore(position, counts) >= 24) reasons.push(`Zoo roster need provides only a small ${position} tie-breaker`);
      if (marketQuality >= 55) reasons.push("strong current fantasy market signal");
      if (news >= 15) reasons.push("actionable live news signal");
      if (availability.injuryAdjustment <= -24) reasons.push(`reserve/injury penalty: ${player.injuryStatus || "inactive"}`);
      reasons.push(...availability.roleNotes);
      if (!reasons.length) reasons.push("Zoo-value profile is stronger than many currently watched options");

      return {
        playerId: player.playerId || null,
        name: player.name,
        position,
        nflTeam: player.nflTeam || "",
        injuryStatus: player.injuryStatus || "ACTIVE",
        zooValueScore: score,
        priorityScore: score,
        recommendation,
        onWatchList: false,
        watchListStatus: "NOT ON WATCH LIST",
        percentOwned: player.percentOwned ?? null,
        percentStarted: player.percentStarted ?? null,
        components: {
          zooNeed: rosterNeedScore(position, counts),
          lflPositionValue: positionLflValue(position),
          positionalScarcity: profile.scarcity,
          starterDemand: profile.starterDemand,
          scoringLeverage: profile.scoringLeverage,
          liveNews: news,
          marketQuality,
          injuryAvailabilityAdjustment: availability.injuryAdjustment,
          roleOpportunityAdjustment: availability.roleAdjustment
        },
        reasons
      };
    })
    .sort((a, b) => {
      if (b.zooValueScore !== a.zooValueScore) return b.zooValueScore - a.zooValueScore;
      return Number(b.percentOwned || 0) - Number(a.percentOwned || 0);
    })
    .filter(player => !watchedIds.has(String(player.playerId || "")) && !watchedNames.has(normalize(player.name)))
    .slice(0, limit);
}

function simulateCountsAfterCut(counts = {}, cutPosition = "") {
  const next = { ...counts };
  const p = canonicalPosition(cutPosition);
  next[p] = Math.max(0, Number(next[p] || 0) - 1);
  return next;
}

function buildBestAvailableOptions(
  espnData = {},
  posts = [],
  counts = {},
  limit = 12,
  watchListIntelligence = []
) {
  const watchMap = new Map();

  for (const item of watchListIntelligence || []) {
    if (item?.playerId != null) watchMap.set(`id:${String(item.playerId)}`, item);
    if (item?.name) watchMap.set(`name:${normalize(item.name)}`, item);
  }

  return (espnData.availablePlayers || [])
    .filter(player => player && player.name && canonicalPosition(player.position) !== "D/ST")
    .map(player => {
      const watchContext =
        watchMap.get(`id:${String(player.playerId || "")}`) ||
        watchMap.get(`name:${normalize(player.name)}`) ||
        null;

      const baseScore = acquisitionScore(player, counts, posts, watchContext);
      const watchScore = Number(watchContext?.priorityScore || 0);
      const zooValueScore = clamp(Math.round(Math.max(baseScore, watchScore)), 0, 100);

      return {
        ...player,
        position: canonicalPosition(player.position),
        acquisitionScore: zooValueScore,
        zooValueScore,
        onWatchList: Boolean(watchContext),
        watchRecommendation: watchContext?.recommendation || "",
        lflPositionValue: positionLflValue(player.position)
      };
    })
    .sort((a, b) => {
      if (b.zooValueScore !== a.zooValueScore) return b.zooValueScore - a.zooValueScore;
      if (Boolean(b.onWatchList) !== Boolean(a.onWatchList)) return Number(b.onWatchList) - Number(a.onWatchList);
      return playerMarketQuality(b) - playerMarketQuality(a);
    })
    .slice(0, limit);
}


function getPracticeAvailabilityStatus(text = "") {
  const n = ` ${normalize(text)} `;

  if (/( injured reserve | placed on ir | reserve injured | pup | physically unable to perform )/.test(n)) return "IR/PUP";
  if (/( inactive | ruled out | will not play | not expected to play )/.test(n)) return "OUT";
  if (/( game time decision | game-time decision | gtd )/.test(n)) return "GAME-TIME DECISION";
  if (/( doubtful )/.test(n)) return "DOUBTFUL";
  if (/( questionable )/.test(n)) return "QUESTIONABLE";
  if (/( did not practice | dnp | missed practice | not practicing | did not participate )/.test(n)) return "DNP";
  if (/( limited practice | limited participant | limited participation )/.test(n)) return "LIMITED";
  if (/( full practice | full participant | full participation )/.test(n)) return "FULL";
  if (/( returned to practice | back at practice | returned to drills | back on the field | resumed practice )/.test(n)) return "RETURNED";
  if (/( cleared to play | cleared for contact | cleared | no injury designation | removed from injury report )/.test(n)) return "CLEARED";
  if (/( expected to play | will play | good to go | on track to play )/.test(n)) return "EXPECTED TO PLAY";
  if (/( practicing | practiced | participating in practice | working at practice )/.test(n)) return "PRACTICING";

  return "";
}

function isPositiveAvailabilityStatus(status = "") {
  return ["FULL", "RETURNED", "CLEARED", "EXPECTED TO PLAY", "PRACTICING"].includes(String(status));
}

function isNegativeAvailabilityStatus(status = "") {
  return ["IR/PUP", "OUT", "GAME-TIME DECISION", "DOUBTFUL", "QUESTIONABLE", "DNP", "LIMITED"].includes(String(status));
}

function recentPostsForPlayer(posts = [], playerName = "", hours = 72) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);

  return posts.filter(post => {
    const published = new Date(post.publishedAt || 0).getTime();
    if (!Number.isFinite(published) || published < cutoff) return false;

    const i = post.intelligence || {};
    const direct = Array.isArray(i.players) ? i.players : [];
    return direct.some(player => normalize(player.name) === normalize(playerName));
  });
}

function teammateOpportunityContext(player = {}, posts = [], playerCatalog = []) {
  const team = normalizeNflTeam(player.nflTeam || "");
  const position = canonicalPosition(player.position);
  if (!team || !position) return { adjustment: 0, notes: [], relatedPlayers: [] };

  const playerQuality = playerMarketQuality(player);
  let adjustment = 0;
  const notes = [];
  const relatedPlayers = [];

  const teammates = playerCatalog.filter(candidate =>
    candidate?.name &&
    normalize(candidate.name) !== normalize(player.name) &&
    normalizeNflTeam(candidate.nflTeam || "") === team &&
    canonicalPosition(candidate.position) === position
  );

  for (const teammate of teammates) {
    const teammateQuality = playerMarketQuality(teammate);
    const teammateEspnStatus = normalize(teammate.injuryStatus || teammate.status || "active");
    const teammateAvailable = !/(out|injured reserve|\bir\b|pup|physically unable|suspended|doubtful)/.test(teammateEspnStatus);
    const qualityGap = teammateQuality - playerQuality;

    // ESPN itself is a fallback opportunity signal. A clearly higher-value, active
    // teammate at the same position narrows the backup's path even when RSS misses
    // the return-to-practice tweet. This is especially meaningful at RB.
    if (teammateAvailable && qualityGap >= (position === "RB" ? 18 : 28)) {
      const espnPenalty = position === "RB" ? -16 : -10;
      adjustment = Math.min(adjustment, espnPenalty);
      notes.push(`${teammate.name} is active and materially ahead in ESPN market/role signals, reducing ${player.name}'s opportunity`);
      relatedPlayers.push(teammate.name);
    }

    const teammatePosts = recentPostsForPlayer(posts, teammate.name, 72);

    for (const post of teammatePosts.slice(0, 6)) {
      const combined = `${post.title || ""} ${post.text || ""}`;
      const status = getPracticeAvailabilityStatus(combined);
      const n = normalize(combined);

      if (
        isPositiveAvailabilityStatus(status) ||
        /(named starter|starting|first team|first-team|lead back|rb1|every down|every-down)/.test(n)
      ) {
        if (teammateQuality >= playerQuality + 15 || position === "RB") {
          adjustment = Math.min(adjustment, position === "RB" ? -24 : -16);
          notes.push(`${teammate.name} availability/role improved, reducing ${player.name}'s opportunity`);
          relatedPlayers.push(teammate.name);
        }
      }

      if (
        ["OUT", "IR/PUP", "DNP"].includes(status) ||
        /(ruled out|placed on injured reserve|will not play)/.test(n)
      ) {
        adjustment = Math.max(adjustment, position === "RB" ? 20 : 14);
        notes.push(`${teammate.name} availability declined, increasing ${player.name}'s opportunity`);
        relatedPlayers.push(teammate.name);
      }
    }
  }

  return {
    adjustment: clamp(Math.round(adjustment), -30, 24),
    notes: [...new Set(notes)],
    relatedPlayers: [...new Set(relatedPlayers)]
  };
}

function currentNewsAvailability(player = {}, posts = []) {
  const related = recentPostsForPlayer(posts, player.name, 72)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  for (const post of related) {
    const status = getPracticeAvailabilityStatus(`${post.title || ""} ${post.text || ""}`);
    if (status) {
      return {
        status,
        post,
        publishedAt: post.publishedAt || ""
      };
    }
  }

  return {
    status: String(player.injuryStatus || "ACTIVE").toUpperCase(),
    post: null,
    publishedAt: ""
  };
}

function isZooStarter(player = {}) {
  const slot = String(player.rosterStatus || player.lineupSlot || "").toUpperCase();
  if (!slot) return false;
  return !/(^BE$|BENCH|IR|INJURED RESERVE)/.test(slot);
}

function inferEmptyStartingPositions(roster = []) {
  const starters = roster.filter(isZooStarter);
  const counts = countRosterPositions(starters, { includeIR: true });
  const missing = [];

  const fixedRequirements = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    LB: 3,
    DL: 1,
    CB: 1,
    S: 1,
    K: 1
  };

  for (const [position, required] of Object.entries(fixedRequirements)) {
    const current = Number(counts[position] || 0);
    for (let i = current; i < required; i += 1) missing.push(position);
  }

  // LFL has one RB/WR flex in addition to 2 RB + 2 WR.
  const rbWrStarters = Number(counts.RB || 0) + Number(counts.WR || 0);
  if (rbWrStarters < 5) missing.push("RB_WR");

  return missing;
}

function buildStartingLineupAlerts(espnData = {}, posts = []) {
  const roster = getZooRoster(espnData);
  const alerts = [];

  for (const player of roster) {
    if (!isZooStarter(player)) continue;

    const news = currentNewsAvailability(player, posts);
    const status = String(news.status || "").toUpperCase();

    let severity = "";
    let action = "";
    let reason = "";

    if (["OUT", "IR/PUP"].includes(status)) {
      severity = "URGENT";
      action = "CHANGE LINEUP";
      reason = `${player.name} is ${status}`;
    } else if (status === "GAME-TIME DECISION" || status === "DOUBTFUL") {
      severity = "URGENT";
      action = "PREPARE REPLACEMENT";
      reason = `${player.name} is ${status}`;
    } else if (["QUESTIONABLE", "DNP", "LIMITED"].includes(status)) {
      severity = "IMPORTANT";
      action = "MONITOR LINEUP";
      reason = `${player.name} is ${status}`;
    }

    if (severity) {
      alerts.push({
        playerId: player.playerId || null,
        player: player.name,
        position: canonicalPosition(player.position),
        nflTeam: player.nflTeam || "",
        lineupStatus: player.rosterStatus || player.lineupSlot || "",
        availabilityStatus: status,
        severity,
        action,
        reason,
        source: news.post?.author || news.post?.handle || "ESPN / X",
        publishedAt: news.publishedAt || "",
        link: news.post?.link || ""
      });
    }
  }

  const expectedStarterCount = Number(LFL_CONFIG.starters || 14);
  const actualStarterCount = roster.filter(isZooStarter).length;
  if (actualStarterCount < expectedStarterCount) {
    const missingPositions = inferEmptyStartingPositions(roster);
    const missingCount = Math.max(1, expectedStarterCount - actualStarterCount);
    const slots = missingPositions.length
      ? missingPositions.slice(0, missingCount)
      : Array(missingCount).fill("UNKNOWN");

    for (const position of slots) {
      alerts.push({
        playerId: null,
        player: position === "UNKNOWN" ? "EMPTY STARTING POSITION" : `EMPTY ${position} STARTER`,
        position,
        nflTeam: "",
        lineupStatus: "",
        availabilityStatus: "EMPTY",
        severity: "URGENT",
        action: "SET LINEUP",
        reason: position === "UNKNOWN"
          ? `Zoo has ${actualStarterCount} of ${expectedStarterCount} starting slots filled`
          : `Zoo has an empty ${position} starting slot (${actualStarterCount} of ${expectedStarterCount} starters filled)`,
        source: "ESPN",
        publishedAt: "",
        link: ""
      });
    }
  }

  const priority = { URGENT: 3, IMPORTANT: 2, WATCH: 1 };
  return alerts.sort((a, b) => (priority[b.severity] || 0) - (priority[a.severity] || 0));
}

function replacementPoolForPosition(roster = [], position = "") {
  const p = canonicalPosition(position);
  const eligible = new Set([p]);
  if (p === "RB" || p === "WR" || p === "RB_WR") {
    eligible.add("RB");
    eligible.add("WR");
  }

  return roster.filter(player =>
    !isZooStarter(player) &&
    String(player.rosterStatus || player.lineupSlot || "").toUpperCase() !== "IR" &&
    eligible.has(canonicalPosition(player.position))
  );
}

function buildReplacementRecommendations(
  espnData = {},
  posts = [],
  watchListIntelligence = [],
  lineupAlerts = []
) {
  const roster = getZooRoster(espnData);
  const counts = countRosterPositions(roster);
  const results = [];

  for (const alert of lineupAlerts) {
    if (!alert.position || alert.position === "UNKNOWN") continue;

    const bench = replacementPoolForPosition(roster, alert.position)
      .map(player => ({
        source: "ZOO BENCH",
        playerId: player.playerId || null,
        name: player.name,
        position: canonicalPosition(player.position),
        nflTeam: player.nflTeam || "",
        score: lflBestPlayerScore(player, counts, posts, null)
      }))
      .sort((a, b) => b.score - a.score);

    const watch = (watchListIntelligence || [])
      .filter(player => {
        const p = canonicalPosition(player.position);
        return p === alert.position || (
          ["RB", "WR", "RB_WR"].includes(alert.position) &&
          ["RB", "WR"].includes(p)
        );
      })
      .filter(player => player.ownershipStatus === "AVAILABLE" || !player.ownershipStatus)
      .map(player => ({
        source: "WATCH LIST",
        playerId: player.playerId || null,
        name: player.name,
        position: canonicalPosition(player.position),
        nflTeam: player.nflTeam || "",
        score: Number(player.zooValueScore || player.priorityScore || 0)
      }))
      .sort((a, b) => b.score - a.score);

    const available = buildBestAvailableOptions(espnData, posts, counts, 20, watchListIntelligence)
      .filter(player => {
        const p = canonicalPosition(player.position);
        return p === alert.position || (
          ["RB", "WR", "RB_WR"].includes(alert.position) &&
          ["RB", "WR"].includes(p)
        );
      })
      .map(player => ({
        source: "LFL WAIVERS",
        playerId: player.playerId || null,
        name: player.name,
        position: canonicalPosition(player.position),
        nflTeam: player.nflTeam || "",
        score: Number(player.zooValueScore || 0)
      }));

    const best = [...bench, ...watch, ...available]
      .sort((a, b) => b.score - a.score)[0] || null;

    results.push({
      problemPlayer: alert.player,
      problemPosition: alert.position,
      problemStatus: alert.availabilityStatus,
      severity: alert.severity,
      recommendation: best
        ? alert.availabilityStatus === "EMPTY"
          ? `${alert.position} EMPTY → ${best.source === "ZOO BENCH" ? "START" : "CONSIDER"} ${best.name}`
          : `${alert.player} ${alert.availabilityStatus} → ${best.source === "ZOO BENCH" ? "START" : "CONSIDER"} ${best.name}`
        : alert.availabilityStatus === "EMPTY"
          ? `${alert.position} EMPTY → NO CLEAR REPLACEMENT`
          : `${alert.player} ${alert.availabilityStatus} → NO CLEAR REPLACEMENT`,
      bestReplacement: best,
      noWaiverMoveNeeded: Boolean(best && best.source === "ZOO BENCH")
    });
  }

  return results;
}

function buildAddDropDecisions(
  espnData = {},
  posts = [],
  watchListIntelligence = [],
  expendability = {}
) {
  const roster = getZooRoster(espnData);
  const counts = countRosterPositions(roster);
  const available = buildBestAvailableOptions(
    espnData,
    posts,
    counts,
    15,
    watchListIntelligence
  );

  const drops = (expendability.all || []).slice(0, 8);
  const decisions = [];

  for (const add of available.slice(0, 10)) {
    const watchRecommendation = normalize(add.watchRecommendation || add.recommendation || "");
    if (watchRecommendation === "ignore") continue;

    let bestPair = null;

    for (const drop of drops) {
      const dropPlayer = roster.find(player =>
        String(player.playerId || "") === String(drop.playerId || "") ||
        normalize(player.name) === normalize(drop.name)
      );
      if (!dropPlayer) continue;

      const keepValue = lflBestPlayerScore(dropPlayer, counts, posts, null);
      const addValue = Number(add.zooValueScore || add.acquisitionScore || 0);
      const rosterGain = Math.round(addValue - keepValue);

      const pair = {
        add: {
          playerId: add.playerId || null,
          name: add.name,
          position: add.position,
          nflTeam: add.nflTeam || "",
          zooValueScore: addValue
        },
        drop: {
          playerId: drop.playerId || null,
          name: drop.name,
          position: drop.position,
          nflTeam: drop.nflTeam || "",
          keepValue,
          expendabilityScore: drop.expendabilityScore
        },
        rosterValueChange: rosterGain,
        verdict: rosterGain >= 8 ? "YES" : rosterGain >= 1 ? "MARGINAL" : "NO"
      };

      if (!bestPair || pair.rosterValueChange > bestPair.rosterValueChange) {
        bestPair = pair;
      }
    }

    if (bestPair) decisions.push(bestPair);
  }

  return decisions
    .sort((a, b) => b.rosterValueChange - a.rosterValueChange)
    .slice(0, 10);
}

function buildOpponentIntelligence(posts = [], hours = 24) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);

  return posts
    .filter(post => {
      const published = new Date(post.publishedAt || 0).getTime();
      const i = post.intelligence || {};
      return (
        Number.isFinite(published) &&
        published >= cutoff &&
        (i.opponentPlayers || []).length > 0 &&
        i.hasActionableEvent &&
        ["INACTIVE", "INJURY", "PRACTICE", "DEPTH_CHART", "ROLE_WORKLOAD", "TRANSACTION"].includes(i.primaryEvent)
      );
    })
    .map(post => ({
      players: post.intelligence.opponentPlayers || [],
      event: getZooUpdateEvent(
        post.intelligence.primaryEvent,
        post.intelligence.eventTypes || [],
        `${post.title || ""} ${post.text || ""}`
      ),
      whatHappened: post.text || post.title || "",
      source: post.author || post.handle || "X Source",
      publishedAt: post.publishedAt || "",
      link: post.link || ""
    }))
    .slice(0, 12);
}

function buildOpportunityAlerts(
  espnData = {},
  posts = [],
  suggestedWatchList = [],
  watchListIntelligence = []
) {
  const alerts = [];
  const availableNames = new Set(
    (espnData.availablePlayers || []).map(player => normalize(player.name))
  );

  for (const post of posts) {
    const i = post.intelligence || {};
    const published = new Date(post.publishedAt || 0).getTime();
    if (!Number.isFinite(published) || getPostAgeHours(post.publishedAt) > 24) continue;

    const candidates = (i.players || []).filter(player =>
      player.ownershipStatus === "AVAILABLE" ||
      availableNames.has(normalize(player.name))
    );

    for (const candidate of candidates) {
      const n = normalize(`${post.title || ""} ${post.text || ""}`);
      const opportunitySignal =
        /(named starter|starting|first team|first-team|every down|every-down|green dot|promoted|elevated|snap|snaps|targets|target share|routes|workload|lead back|rb1)/.test(n);

      if (!opportunitySignal && !i.hasActionableEvent) continue;

      alerts.push({
        player: candidate.name,
        position: candidate.position || "",
        nflTeam: candidate.nflTeam || "",
        reason: post.text || post.title || "",
        event: i.primaryEvent || "GENERAL_NEWS",
        source: post.author || post.handle || "X Source",
        publishedAt: post.publishedAt || "",
        link: post.link || "",
        recommendation: "REVIEW FOR ZOO"
      });
    }
  }

  for (const player of [...(suggestedWatchList || []), ...(watchListIntelligence || [])]) {
    if (Number(player.zooValueScore || player.priorityScore || 0) < 75) continue;
    if (!(player.components?.roleOpportunityAdjustment > 0 || player.components?.liveNews >= 15)) continue;

    alerts.push({
      player: player.name,
      position: player.position || "",
      nflTeam: player.nflTeam || "",
      reason: (player.reasons || []).slice(0, 2).join(" · "),
      event: "OPPORTUNITY",
      source: "Zoo GM",
      publishedAt: "",
      link: "",
      recommendation: player.recommendation || "REVIEW FOR ZOO"
    });
  }

  const seen = new Set();
  return alerts.filter(item => {
    const key = normalize(item.player);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}

function buildExpendability(espnData = {}, posts = [], watchListIntelligence = [], playerCatalog = []) {
  const roster = getZooRoster(espnData);
  const counts = countRosterPositions(roster);
  const results = [];

  for (const player of roster) {
    const position = canonicalPosition(player.position);
    if (!position || String(player.rosterStatus || player.lineupSlot || "").toUpperCase() === "IR") {
      continue;
    }

    const profile = getPositionProfile(position);
    const preferred = getPreferredCount(position);
    const positionCount = Number(counts[position] || 0);
    const surplus = Math.max(0, positionCount - preferred);
    const lineupStatus = String(player.rosterStatus || player.lineupSlot || "").toUpperCase();
    const isBench = ["BE", "BENCH", "20"].includes(lineupStatus);
    const marketQuality = playerMarketQuality(player);
    const news = liveNewsScore(posts, player.name);
    const availability = playerAvailabilityContext(player, posts);
    const teammateContext = teammateOpportunityContext(player, posts, playerCatalog);
    const currentAvailability = currentNewsAvailability(player, posts);

    const afterCutCounts = simulateCountsAfterCut(counts, position);
    const replacementOptions = buildBestAvailableOptions(
      espnData,
      posts,
      afterCutCounts,
      10,
      watchListIntelligence
    );
    const bestReplacement = replacementOptions[0] || null;

    // "Who should I cut today?" score. Player opportunity and current availability
    // are deliberately weighted more heavily than simply being above a positional quota.
    let score = 36;

    if (isBench) score += 20;
    if (surplus > 0) score += Math.min(16, 8 + ((surplus - 1) * 4));

    score -= profile.scarcity * 0.12;
    score -= profile.market * 0.08;
    score -= marketQuality * 0.10;
    score -= news * 0.25;

    // A negative teammate opportunity adjustment means this player's path narrowed,
    // so invert it here: -24 opportunity becomes +24 expendability.
    score -= teammateContext.adjustment;

    if (availability.totalAdjustment <= -20) score += 12;
    else if (availability.totalAdjustment < 0) score += 5;

    if (position === "RB") score -= 8;
    if (position === "WR") score -= 5;
    if (position === "LB" && surplus === 0) score -= 6;
    if (["DL", "CB", "S"].includes(position) && !isBench) score -= 7;

    if (
      LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
      positionCount > preferred
    ) {
      score += 18;
    }

    if (bestReplacement) {
      score += Math.max(0, (bestReplacement.zooValueScore - 60) * 0.30);
    }

    const strategicOverride =
      LFL_CONFIG.zooStrategicOverrides[normalize(player.name)] ||
      null;

    if (strategicOverride) {
      score += Number(strategicOverride.expendabilityAdjustment || 0);
    }

    score = clamp(Math.round(score), 0, 100);

    const reasons = [];
    if (isBench) reasons.push("currently a Zoo bench player");
    if (surplus > 0) reasons.push(`${position} is above Zoo's preferred roster count`);
    if (position === "LB" && surplus > 0) reasons.push("LB surplus matters, but no longer outweighs a major role/opportunity decline elsewhere");
    if (teammateContext.adjustment < 0) reasons.push(...teammateContext.notes);
    if (teammateContext.adjustment > 0) reasons.push(...teammateContext.notes.map(note => `${note} — roster spot protected`));
    if (isNegativeAvailabilityStatus(currentAvailability.status)) {
      reasons.push(`current availability: ${currentAvailability.status}`);
    }
    if (position === "RB") reasons.push("RB scarcity/trade value protects this roster spot unless opportunity materially falls");
    if (LFL_CONFIG.philosophy.singleCarryPositions.includes(position) && positionCount > preferred) {
      reasons.push(`duplicate ${position} is normally unnecessary`);
    }
    if (bestReplacement && bestReplacement.zooValueScore >= 65) {
      reasons.push(`best Zoo-value waiver target: ${bestReplacement.name} (${bestReplacement.position})`);
    }
    if (bestReplacement?.onWatchList) reasons.push("replacement is already on Zoo's Watch List");
    if (strategicOverride?.note) reasons.push(strategicOverride.note);
    if (!reasons.length) reasons.push("lower marginal value versus the rest of Zoo's roster");

    results.push({
      playerId: player.playerId || null,
      name: player.name,
      position,
      nflTeam: player.nflTeam || "",
      lineupStatus: player.rosterStatus || player.lineupSlot || "",
      injuryStatus: player.injuryStatus || "ACTIVE",
      currentAvailabilityStatus: currentAvailability.status || "",
      expendabilityScore: score,
      currentPositionCount: positionCount,
      preferredPositionCount: preferred,
      surplusAtPosition: surplus,
      historicalPositionAverage: historicalPositionAverage(position),
      strategicAdjustment: strategicOverride?.expendabilityAdjustment || 0,
      teammateOpportunityAdjustment: teammateContext.adjustment,
      teammateOpportunityPlayers: teammateContext.relatedPlayers,
      bestAvailableReplacement: bestReplacement ? {
        playerId: bestReplacement.playerId || null,
        name: bestReplacement.name,
        position: bestReplacement.position,
        nflTeam: bestReplacement.nflTeam || "",
        acquisitionScore: bestReplacement.zooValueScore,
        zooValueScore: bestReplacement.zooValueScore,
        onWatchList: Boolean(bestReplacement.onWatchList),
        watchRecommendation: bestReplacement.watchRecommendation || "",
        percentOwned: bestReplacement.percentOwned ?? null,
        percentStarted: bestReplacement.percentStarted ?? null
      } : null,
      reasons
    });
  }

  results.sort((a, b) => b.expendabilityScore - a.expendabilityScore);

  return {
    top3: results.slice(0, 3).map((item, index) => ({
      rank: index + 1,
      ...item
    })),
    all: results,
    rosterCounts: counts,
    preferredRosterCounts: LFL_CONFIG.preferredRosterCounts,
    bestAvailableOverall: buildBestAvailableOptions(
      espnData,
      posts,
      counts,
      20,
      watchListIntelligence
    )
  };
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
  opponentPlayers = [],
  lflOwnedPlayers = [],
  eventTypes = []
}) {
  const maxScore =
    Math.max(
      fantasyRelevance,
      zooRelevance,
      watchRelevance,
      availableRelevance,
      opponentRelevance
    );

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  const criticalEvent =
    eventTypes.some(
      type =>
        [
          "INACTIVE",
          "INJURY",
          "PRACTICE",
          "TRANSACTION"
        ].includes(
          type
        )
    );

  const hasUrgentSignal =
    urgentKeywords.length >
    0;

  const directImpact =
    zooPlayers.length > 0 ||
    watchPlayers.length > 0 ||
    opponentPlayers.length > 0 ||
    (actionable && lflOwnedPlayers.length > 0);

  if (
    criticalEvent &&
    hasUrgentSignal &&
    (
      zooPlayers.length > 0 ||
      availablePlayers.length >
        0 ||
      watchPlayers.length > 0
    ) &&
    maxScore >= 78
  ) {
    return "ACT NOW";
  }

  if (
    directImpact ||
    (
      actionable &&
      availableRelevance >=
        60
    ) ||
    maxScore >= 75
  ) {
    if (actionable && lflOwnedPlayers.length > 0 && maxScore < 55 &&
        !zooPlayers.length && !watchPlayers.length && !opponentPlayers.length) {
      return "FYI";
    }
    return "MONITOR";
  }

  if (
    fantasyRelevance >= 48 ||
    (
      actionable &&
      availableRelevance >=
        55
    )
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
  lflOwnedPlayers = [],
  fantasyRelevance = 0,
  primaryEvent =
    "GENERAL_NEWS"
}) {
  if (
    actionTier === "NOISE"
  ) {
    return "NOISE";
  }

  if (
    zooPlayers.length > 0
  ) {
    return "ZOO IMPACT";
  }

  if (
    availablePlayers.length >
      0 &&
    watchPlayers.length > 0
  ) {
    return "WATCH LIST";
  }

  if (
    availablePlayers.length >
      0 &&
    ACTIONABLE_EVENTS.has(
      primaryEvent
    )
  ) {
    return "AVAILABLE OPPORTUNITY";
  }

  if (
    watchPlayers.length > 0
  ) {
    return "WATCH LIST";
  }

  if (
    opponentPlayers.length > 0
  ) {
    return "OPPONENT";
  }

  if (
    lflOwnedPlayers.length > 0
  ) {
    return "LFL NEWS";
  }

  if (
    primaryEvent ===
      "PERFORMANCE_ANALYSIS" ||
    fantasyRelevance >= 60
  ) {
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
  lflOwnedPlayers = [],
  urgentKeywords = [],
  eventTypes = []
}) {
  const urgent =
    urgentKeywords.length >
    0;

  const actionable =
    hasActionableEvent(
      eventTypes
    );

  if (
    actionTier ===
      "ACT NOW" &&
    zooPlayers.length &&
    urgent
  ) {
    return "CHECK ZOO LINEUP";
  }

  if (
    actionTier ===
      "ACT NOW" &&
    availablePlayers.length &&
    actionable
  ) {
    return "REVIEW WAIVERS";
  }

  if (
    availablePlayers.length &&
    watchPlayers.length &&
    actionable
  ) {
    return "MONITOR FOR ADD";
  }

  if (
    availablePlayers.length &&
    actionable
  ) {
    return "REVIEW AVAILABLE PLAYER";
  }

  if (
    zooPlayers.length
  ) {
    return "MONITOR ZOO PLAYER";
  }

  if (
    opponentPlayers.length
  ) {
    return "MONITOR OPPONENT";
  }

  if (
    watchPlayers.length
  ) {
    return "MONITOR WATCH LIST";
  }

  if (
    lflOwnedPlayers.length &&
    actionable
  ) {
    return "MONITOR LFL PLAYER";
  }

  return "HOLD";
}

function getPriorityScore(
  post
) {
  const i =
    post.intelligence ||
    {};

  const tierWeight =
    {
      "ACT NOW": 400,
      "MONITOR": 300,
      "FYI": 200,
      "NOISE": 100
    }[
      i.actionTier
    ] || 0;

  const maxScore =
    Math.max(
      Number(
        i.fantasyRelevance ||
        0
      ),
      Number(
        i.zooRelevance ||
        0
      ),
      Number(
        i.watchRelevance ||
        0
      ),
      Number(
        i.availableRelevance ||
        0
      ),
      Number(
        i.opponentRelevance ||
        0
      )
    );

  const agePenalty =
    Math.min(
      getPostAgeHours(
        post.publishedAt
      ),
      72
    );

  return (
    tierWeight +
    maxScore -
    agePenalty
  );
}

function buildBrief(
  posts = []
) {
  const meaningful =
    posts
      .filter(
        post =>
          post.intelligence
            ?.actionTier !==
          "NOISE"
      )
      .sort(
        (a, b) =>
          getPriorityScore(
            b
          ) -
          getPriorityScore(
            a
          )
      );

  const actNow =
    meaningful.filter(
      post =>
        post.intelligence
          ?.actionTier ===
        "ACT NOW"
    );

  const zoo =
    meaningful.filter(
      post =>
        post.intelligence
          ?.zooImpact
    );

  const available =
    meaningful.filter(
      post =>
        post.intelligence
          ?.availablePlayerImpact
    );

  const watch =
    meaningful.filter(
      post =>
        post.intelligence
          ?.watchListImpact
    );

  const opponent =
    meaningful.filter(
      post =>
        post.intelligence
          ?.opponentImpact
    );

  let recommendation =
    "HOLD";

  if (
    actNow.some(
      post =>
        post.intelligence
          ?.recommendation ===
        "CHECK ZOO LINEUP"
    )
  ) {
    recommendation =
      "CHECK ZOO LINEUP";

  } else if (
    actNow.some(
      post =>
        post.intelligence
          ?.recommendation ===
        "REVIEW WAIVERS"
    )
  ) {
    recommendation =
      "REVIEW WAIVERS";

  } else if (
    available.some(
      post =>
        post.intelligence
          ?.watchListImpact
    )
  ) {
    recommendation =
      "MONITOR WAIVERS";

  } else if (
    zoo.length
  ) {
    recommendation =
      "MONITOR ZOO";
  }

  return {
    recommendation,

    relevantPosts:
      meaningful.length,

    noisePosts:
      posts.length -
      meaningful.length,

    actNowCount:
      actNow.length,

    zooImpactCount:
      zoo.length,

    availableOpportunityCount:
      available.length,

    watchListCount:
      watch.length,

    opponentCount:
      opponent.length,

    topItems:
      meaningful
        .slice(
          0,
          8
        )
        .map(
          post => ({
            author:
              post.author,

            handle:
              post.handle,

            text:
              post.text,

            link:
              post.link,

            publishedAt:
              post.publishedAt,

            actionTier:
              post.intelligence
                .actionTier,

            primaryCategory:
              post.intelligence
                .primaryCategory,

            recommendation:
              post.intelligence
                .recommendation,

            primaryEvent:
              post.intelligence
                .primaryEvent,

            eventTypes:
              post.intelligence
                .eventTypes,

            sourceAuthority:
              post.intelligence
                .sourceAuthority,

            contextImpact:
              post.intelligence
                .contextImpact,

            maxRelevance:
              Math.max(
                post.intelligence
                  .fantasyRelevance,

                post.intelligence
                  .zooRelevance,

                post.intelligence
                  .watchRelevance,

                post.intelligence
                  .availableRelevance,

                post.intelligence
                  .opponentRelevance
              ),

            players:
              post.intelligence
                .impactPlayers ||
              post.intelligence
                .players
          })
        )
  };
}

function getZooUpdateEvent(
  primaryEvent = "GENERAL_NEWS",
  eventTypes = [],
  text = ""
) {
  const n = normalize(text);

  if (primaryEvent === "DEPTH_CHART") {
    if (/(named starter|starter|starting|first team|first-team|qb1|rb1|wr1|te1)/.test(n)) {
      return "START";
    }
    if (/(benched|backup|second team|second-team)/.test(n)) {
      return "ROLE";
    }
  }

  if (primaryEvent === "ROLE_WORKLOAD") return "ROLE";
  if (primaryEvent === "TRANSACTION") return "TRANSACTION";
  if (primaryEvent === "INACTIVE") return "INACTIVE";
  if (primaryEvent === "INJURY") return "INJURY";
  if (primaryEvent === "PRACTICE") return "PRACTICE";
  if (primaryEvent === "PERFORMANCE_ANALYSIS") return "PERFORMANCE";
  if (primaryEvent === "FANTASY_STRATEGY") return "FANTASY";

  if (eventTypes.includes("DEPTH_CHART")) return "ROLE";
  if (eventTypes.includes("ROLE_WORKLOAD")) return "ROLE";
  return "UPDATE";
}

function getZooUpdateRecommendation(
  post = {},
  player = {}
) {
  const i = post.intelligence || {};
  const event = getZooUpdateEvent(
    i.primaryEvent,
    i.eventTypes || [],
    `${post.title || ""} ${post.text || ""}`
  );
  const n = normalize(`${post.title || ""} ${post.text || ""}`);
  const lineup = normalize(player.lineupStatus || "");
  const isStarter = lineup && !/(bench|be|ir)/.test(lineup);

  if (event === "INACTIVE" || /(ruled out|will not play|not expected to play)/.test(n)) {
    return isStarter ? "CHECK LINEUP" : "HOLD";
  }

  if (event === "INJURY") {
    if (/(doubtful|out|injured reserve| ir |pup)/.test(` ${n} `)) {
      return isStarter ? "CHECK LINEUP" : "MONITOR";
    }
    return "MONITOR";
  }

  if (event === "PRACTICE") {
    if (/(did not practice|missed practice|limited practice|limited participant)/.test(n)) {
      return isStarter ? "MONITOR LINEUP" : "MONITOR";
    }
    if (/(full practice|full participant|returned to practice|practicing|practiced|back at practice)/.test(n)) {
      return "HOLD";
    }
  }

  if (event === "START" || event === "ROLE") return "MONITOR ROLE";
  if (event === "TRANSACTION") return "REVIEW IMPACT";
  return i.recommendation || "HOLD";
}

function buildZooPlayerUpdates(
  posts = [],
  playerCatalog = [],
  windowHours = 12
) {
  const cutoff = Date.now() - (windowHours * 60 * 60 * 1000);
  const zooByName = new Map(
    playerCatalog
      .filter(player => player.ownershipStatus === "ZOO")
      .map(player => [normalize(player.name), player])
  );

  const updates = [];
  const seen = new Set();

  for (const post of posts) {
    const published = new Date(post.publishedAt || 0).getTime();
    if (!Number.isFinite(published) || published < cutoff) continue;

    const i = post.intelligence || {};
    const directNames = Array.isArray(i.directZooPlayers) ? i.directZooPlayers : [];
    if (!directNames.length) continue;

    const combined = `${post.title || ""} ${post.text || ""}`;
    const event = getZooUpdateEvent(
      i.primaryEvent,
      i.eventTypes || [],
      combined
    );
    const availabilityStatus = getPracticeAvailabilityStatus(combined);

    for (const playerName of directNames) {
      const player = zooByName.get(normalize(playerName));
      if (!player) continue;

      // Keep every direct tweet, suppressing only true duplicate items/stories.
      const storyText = normalize(post.text || post.title || "")
        .replace(/\bhttps?\S+/g, "")
        .slice(0, 220);
      const sourceKey = normalize(post.guid || post.link || "");
      const duplicateKey = sourceKey
        ? `${normalize(player.name)}|${sourceKey}`
        : `${normalize(player.name)}|${event}|${storyText}`;

      if (seen.has(duplicateKey)) continue;
      seen.add(duplicateKey);

      let recommendation = getZooUpdateRecommendation(post, player);
      let whatHappened = post.text || post.title || "Update";

      if (availabilityStatus) {
        if (["FULL", "CLEARED", "EXPECTED TO PLAY"].includes(availabilityStatus)) {
          recommendation = "HOLD";
        } else if (["OUT", "IR/PUP"].includes(availabilityStatus)) {
          recommendation = isZooStarter(player) ? "CHANGE LINEUP" : "MONITOR";
        } else if (["DNP", "LIMITED", "QUESTIONABLE", "GAME-TIME DECISION", "DOUBTFUL"].includes(availabilityStatus)) {
          recommendation = isZooStarter(player) ? "MONITOR LINEUP" : "MONITOR";
        }
      }

      updates.push({
        playerId: player.playerId || "",
        player: player.name,
        position: player.position || "",
        nflTeam: player.nflTeam || "",
        lineupStatus: player.lineupStatus || "",
        event: availabilityStatus || event,
        primaryEvent: event,
        availabilityStatus,
        direct: true,
        recommendation,
        whatHappened,
        source: post.author || post.handle || "X Source",
        author: post.author || post.handle || "X Source",
        publishedAt: post.publishedAt || "",
        link: post.link || "",
        guid: post.guid || "",
        sourceAuthority: i.sourceAuthority || {},
        zooRelevance: Number(i.zooRelevance || 0),
        actionTier: i.actionTier || "FYI"
      });
    }
  }

  return updates.sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() -
      new Date(a.publishedAt || 0).getTime()
  );
}

function buildPostIntelligence(
  post,
  playerCatalog
) {
  const combinedText =
    `${post.title} ${post.text}`;

  const playerMatches =
    findMatchingLeaguePlayers(
      combinedText,
      playerCatalog
    );

  const eventTypes =
    detectEventTypes(
      combinedText
    );

  const primaryEvent =
    getPrimaryEvent(
      eventTypes
    );

  const sourceAuthority =
    getSourceAuthority(
      post.handle,
      post.author
    );

  const contextImpact =
    buildContextImpact(
      combinedText,
      playerMatches,
      playerCatalog,
      eventTypes
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
      playerMatches,
      eventTypes,
      sourceAuthority
    );

  const zooRelevance =
    scoreZooRelevance(
      combinedText,
      playerMatches,
      contextImpact,
      eventTypes,
      sourceAuthority
    );

  const watchRelevance =
    scoreWatchRelevance(
      combinedText,
      playerMatches,
      contextImpact,
      eventTypes,
      sourceAuthority
    );

  const availableRelevance =
    scoreAvailableRelevance(
      combinedText,
      playerMatches,
      eventTypes,
      sourceAuthority
    );

  const opponentRelevance =
    scoreOpponentRelevance(
      combinedText,
      playerMatches,
      contextImpact,
      eventTypes,
      sourceAuthority
    );

  const uniqueNames =
    (
      items = []
    ) => [
      ...new Set(
        items.filter(
          Boolean
        )
      )
    ];

  const directZooPlayers =
    playerMatches
      .filter(
        player =>
          player.ownershipStatus ===
          "ZOO"
      )
      .map(
        player =>
          player.name
      );

  const contextZooPlayers =
    contextImpact
      .filter(
        player =>
          player.ownershipStatus ===
          "ZOO"
      )
      .map(
        player =>
          player.name
      );

  const zooPlayers =
    uniqueNames(
      [
        ...directZooPlayers,
        ...contextZooPlayers
      ]
    );

  const directWatchPlayers =
    playerMatches
      .filter(
        player =>
          player.onWatchList
      )
      .map(
        player =>
          player.name
      );

  const contextWatchPlayers =
    contextImpact
      .filter(
        player =>
          player.onWatchList
      )
      .map(
        player =>
          player.name
      );

  const watchPlayers =
    uniqueNames(
      [
        ...directWatchPlayers,
        ...contextWatchPlayers
      ]
    );

  const availablePlayers =
    playerMatches
      .filter(
        player =>
          player.ownershipStatus ===
          "AVAILABLE"
      )
      .map(
        player =>
          player.name
      );

  const lflOwnedPlayers =
    playerMatches
      .filter(
        player =>
          player.ownershipStatus ===
          "LFL OWNED"
      )
      .map(
        player => ({
          name:
            player.name,

          lflTeam:
            player.lflTeam
        })
      );

  const directOpponentPlayers =
    playerMatches
      .filter(
        player =>
          player.opponentThisWeek
      )
      .map(
        player =>
          player.name
      );

  const contextOpponentPlayers =
    contextImpact
      .filter(
        player =>
          player.opponentThisWeek
      )
      .map(
        player =>
          player.name
      );

  const opponentPlayers =
    uniqueNames(
      [
        ...directOpponentPlayers,
        ...contextOpponentPlayers
      ]
    );

  const actionableAvailablePlayers =
    hasActionableEvent(
      eventTypes
    ) &&
    availableRelevance >= 55
      ? availablePlayers
      : [];

  const actionTier =
    getActionTier({
      fantasyRelevance,
      zooRelevance,
      watchRelevance,
      availableRelevance,
      opponentRelevance,
      urgentKeywords,
      zooPlayers,
      watchPlayers,

      availablePlayers:
        actionableAvailablePlayers,

      opponentPlayers,
      lflOwnedPlayers,
      eventTypes
    });

  const primaryCategory =
    getPrimaryCategory({
      actionTier,
      zooPlayers,
      watchPlayers,

      availablePlayers:
        actionableAvailablePlayers,

      opponentPlayers,
      lflOwnedPlayers,
      fantasyRelevance,
      primaryEvent
    });

  const recommendation =
    getRecommendation({
      actionTier,
      zooPlayers,
      watchPlayers,

      availablePlayers:
        actionableAvailablePlayers,

      opponentPlayers,
      lflOwnedPlayers,
      urgentKeywords,
      eventTypes
    });

  const serializePlayer =
    (
      player,
      indirect = false
    ) => ({
      name:
        player.name,

      position:
        player.position,

      nflTeam:
        player.nflTeam,

      classification:
        player.classification,

      ownershipStatus:
        player.ownershipStatus,

      lflTeam:
        player.lflTeam,

      lineupStatus:
        player.lineupStatus,

      opponentThisWeek:
        player.opponentThisWeek,

      onWatchList:
        player.onWatchList,

      watchPriority:
        player.watchPriority,

      indirect,

      contextReason:
        player.contextReason ||
        ""
    });

  const directSerialized =
    playerMatches.map(
      player =>
        serializePlayer(
          player,
          false
        )
    );

  const contextSerialized =
    contextImpact.map(
      player =>
        serializePlayer(
          player,
          true
        )
    );

  return {
    ...post,

    intelligence: {
      players:
        directSerialized,

      contextImpact:
        contextSerialized,

      impactPlayers: [
        ...directSerialized,
        ...contextSerialized
      ],

      directZooPlayers,
      contextZooPlayers,
      zooPlayers,
      watchPlayers,
      availablePlayers,
      actionableAvailablePlayers,
      lflOwnedPlayers,
      opponentPlayers,

      fantasyKeywords,
      urgentKeywords,
      eventTypes,
      primaryEvent,
      sourceAuthority,

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
          getPostAgeHours(
            post.publishedAt
          ) *
          10
        ) /
        10,

      alertLevel:
        getAlertLevel(
          fantasyRelevance,
          zooRelevance,
          watchRelevance,
          availableRelevance,
          opponentRelevance
        ),

      directZooImpact:
        directZooPlayers.length >
        0,

      indirectZooImpact:
        contextZooPlayers.length >
        0,

      zooImpact:
        zooPlayers.length >
        0,

      watchListImpact:
        watchPlayers.length >
        0,

      availablePlayerImpact:
        actionableAvailablePlayers.length >
        0,

      opponentImpact:
        opponentPlayers.length >
        0,

      hasActionableEvent:
        hasActionableEvent(
          eventTypes
        )
    }
  };
}

// -----------------------------------------------------------------------------
// NON-X SOURCE INGESTION
// -----------------------------------------------------------------------------
function decodeHtmlEntities(text = "") {
  return decodeXml(
    String(text)
      .replace(/&nbsp;/gi, " ")
      .replace(/&#8217;/g, "'")
      .replace(/&#8211;/g, "-")
      .replace(/&#8212;/g, "-")
      .replace(/&hellip;/gi, "...")
  );
}

function cleanSourceText(text = "") {
  return decodeHtmlEntities(
    String(text)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function extractHtmlBlocks(html = "") {
  const blocks = [];
  const seen = new Set();

  const add = raw => {
    const text = cleanSourceText(raw);
    const key = normalize(text);
    if (text.length < 18 || key.length < 18 || seen.has(key)) return;
    seen.add(key);
    blocks.push(text);
  };

  for (const match of String(html).matchAll(
    /<(h1|h2|h3|h4|h5|p|li|blockquote|time)[^>]*>([\s\S]*?)<\/\1>/gi
  )) {
    add(match[2]);
  }

  // Fallback for pages whose useful content is rendered in div-based cards.
  if (blocks.length < 20) {
    const plain = cleanSourceText(html);
    for (const chunk of plain.split(/(?<=[.!?])\s+(?=[A-Z0-9])/)) {
      add(chunk);
    }
  }

  return blocks.slice(0, 1600);
}

function extractPagePublishedAt(html = "") {
  const text = String(html || "");

  const jsonDate =
    text.match(/"datePublished"\s*:\s*"([^"]+)"/i) ||
    text.match(/"dateModified"\s*:\s*"([^"]+)"/i);

  if (jsonDate && jsonDate[1]) {
    const time = new Date(jsonDate[1]).getTime();
    if (Number.isFinite(time)) return new Date(time).toISOString();
  }

  const timeTag = text.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeTag && timeTag[1]) {
    const time = new Date(timeTag[1]).getTime();
    if (Number.isFinite(time)) return new Date(time).toISOString();
  }

  return "";
}

function parseNewsTimestamp(text = "", fallback = "") {
  const raw = String(text || "");
  const match = raw.match(
    /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,\s+([A-Z][a-z]{2})\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?\s+(\d{1,2}):(\d{2})\s*(am|pm)\s*(EDT|EST|CDT|CST|MDT|MST|PDT|PST)?\b/i
  );

  if (!match) return fallback || "";

  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const month = monthMap[
    match[1].charAt(0).toUpperCase() +
    match[1].slice(1, 3).toLowerCase()
  ];

  if (month == null) return fallback || "";

  const year = Number(match[3] || 2026);
  let hour = Number(match[4]);
  const minute = Number(match[5]);
  const ampm = String(match[6]).toLowerCase();

  if (ampm === "pm" && hour !== 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  const zone = String(match[7] || "EDT").toUpperCase();
  const offsets = {
    EDT: "-04:00", EST: "-05:00",
    CDT: "-05:00", CST: "-06:00",
    MDT: "-06:00", MST: "-07:00",
    PDT: "-07:00", PST: "-08:00"
  };

  const mm = String(month + 1).padStart(2, "0");
  const dd = String(Number(match[2])).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const min = String(minute).padStart(2, "0");

  const iso = `${year}-${mm}-${dd}T${hh}:${min}:00${offsets[zone] || "-04:00"}`;
  const time = new Date(iso).getTime();

  return Number.isFinite(time)
    ? new Date(time).toISOString()
    : (fallback || "");
}

function sourceFocusCatalog(playerCatalog = []) {
  // Runtime news matching is intentionally focused on players who can drive
  // a Zoo decision now: Zoo, Watch List, weekly opponent, and top free agents.
  // Other LFL rosters remain available through the ESPN intelligence layer.
  const protectedPlayers = playerCatalog.filter(player =>
    player.ownershipStatus === "ZOO" ||
    player.onWatchList ||
    player.opponentThisWeek
  );

  const available = playerCatalog
    .filter(player => player.ownershipStatus === "AVAILABLE")
    .sort((a, b) =>
      playerMarketQuality(b) - playerMarketQuality(a)
    )
    .slice(0, 75);

  const merged = new Map();

  for (const player of [...protectedPlayers, ...available]) {
    const key = player.playerId
      ? `id:${player.playerId}`
      : `name:${normalize(player.name)}`;

    if (!merged.has(key)) merged.set(key, player);
  }

  return [...merged.values()];
}

function buildSourceContext(blocks = [], index = 0) {
  const parts = [];
  const start = Math.max(0, index - 1);
  const end = Math.min(blocks.length - 1, index + 2);

  for (let i = start; i <= end; i += 1) {
    if (blocks[i]) parts.push(blocks[i]);
  }

  return parts.join(" ").slice(0, 1600);
}

function extractItemsFromSource(source = {}, html = "", playerCatalog = []) {
  // Keep external-source parsing bounded so one large page can never stall
  // the Netlify function. Recent news is normally near the top of the page.
  const blocks = extractHtmlBlocks(String(html || "").slice(0, 400000)).slice(0, 250);
  const focusPlayers = sourceFocusCatalog(playerCatalog);
  const pagePublishedAt = extractPagePublishedAt(html);
  const items = [];
  const seen = new Set();

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const direct = findMatchingLeaguePlayers(block, focusPlayers);

    if (!direct.length) continue;

    const context = buildSourceContext(blocks, index);
    const contextMatches = findMatchingLeaguePlayers(context, focusPlayers);

    const playerNames = [
      ...new Set(
        [...direct, ...contextMatches]
          .map(player => player.name)
          .filter(Boolean)
      )
    ].slice(0, 6);

    if (!playerNames.length) continue;

    const publishedAt =
      source.type === "PLAYER_NEWS"
        ? parseNewsTimestamp(context, pagePublishedAt)
        : (pagePublishedAt || new Date().toISOString());

    const key = `${source.key}|${normalize(playerNames.join("|"))}|${normalize(context).slice(0, 260)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      author: source.label,
      handle: source.key,
      text: context,
      title: `${source.label}: ${playerNames.join(", ")}`,
      link: source.url,
      publishedAt,
      guid: key,
      sourceType: source.type,
      sourceKey: source.key,
      sourceLabel: source.label
    });

    if (items.length >= 35) break;
  }

  return items;
}

async function fetchSourcePage(source = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(source.url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Zoo-GM/2.0; +https://ma3dtribe.com)",
        "Accept": "text/html,application/xhtml+xml",
        "Cache-Control": "no-cache"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`${source.label} request failed: ${response.status}`);
    }

    return {
      ok: true,
      source,
      html: await response.text()
    };
  } catch (error) {
    return {
      ok: false,
      source,
      error: error.message || String(error)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFantasyProsApiNews() {
  if (!FANTASYPROS_API_KEY) return [];

  try {
    const data = await fetchJson(
      "https://api.fantasypros.com/v2/json/nfl/news?limit=100",
      "FantasyPros API",
      {
        headers: {
          "x-api-key": FANTASYPROS_API_KEY
        },
        timeoutMs: 4000
      }
    );

    return (data.items || []).map(item => ({
      author: "FantasyPros",
      handle: "fantasypros",
      text: cleanSourceText(item.desc || item.description || item.title || ""),
      title: item.title || "FantasyPros Player News",
      link: item.link || "https://www.fantasypros.com/nfl/player-news.php",
      publishedAt: item.created || item.created_formated || "",
      guid: `fantasypros-api-${item.id || normalize(item.title || "")}`,
      sourceType: "PLAYER_NEWS",
      sourceKey: "fantasypros",
      sourceLabel: "FantasyPros Player News"
    }));
  } catch (error) {
    console.warn("FantasyPros API unavailable:", error.message);
    return [];
  }
}

function normalizeExpertRankingsPayload(payload = {}) {
  if (!payload || typeof payload !== "object") {
    return {
      week: null,
      experts: []
    };
  }

  const experts = Array.isArray(payload.experts)
    ? payload.experts.filter(expert => expert && expert.name && expert.rankings)
    : [];

  return {
    week: payload.week ?? payload.scoringPeriodId ?? null,
    experts
  };
}

async function loadExpertRankings() {
  if (EXPERT_RANKINGS_URL) {
    try {
      const remote = await fetchJson(
        EXPERT_RANKINGS_URL,
        "Zoo GM expert rankings",
        { timeoutMs: 4000 }
      );

      const normalized = normalizeExpertRankingsPayload(remote);
      if (normalized.experts.length) {
        return {
          ...normalized,
          source: "REMOTE",
          expectedExperts: EXPECTED_EXPERTS
        };
      }
    } catch (error) {
      console.warn("Expert rankings URL unavailable:", error.message);
    }
  }

  return {
    ...normalizeExpertRankingsPayload(INLINE_WEEKLY_EXPERT_RANKINGS),
    source: "INLINE",
    expectedExperts: EXPECTED_EXPERTS
  };
}

function buildExpertRankingConsensus(expertRankings = {}, playerCatalog = []) {
  const byPlayer = new Map();

  for (const expert of expertRankings.experts || []) {
    for (const [position, names] of Object.entries(expert.rankings || {})) {
      if (!Array.isArray(names)) continue;

      names.forEach((name, index) => {
        const key = normalize(name);
        if (!key) return;

        const current = byPlayer.get(key) || {
          name,
          position: canonicalPosition(position),
          ranks: [],
          experts: []
        };

        current.ranks.push(index + 1);
        current.experts.push({
          expert: expert.name,
          rank: index + 1
        });

        byPlayer.set(key, current);
      });
    }
  }

  const catalogByName = new Map(
    playerCatalog.map(player => [normalize(player.name), player])
  );

  return [...byPlayer.values()]
    .map(item => {
      const avg = item.ranks.length
        ? item.ranks.reduce((sum, rank) => sum + rank, 0) / item.ranks.length
        : 999;

      const player = catalogByName.get(normalize(item.name)) || {};

      return {
        ...item,
        averageRank: Math.round(avg * 100) / 100,
        expertCount: item.ranks.length,
        playerId: player.playerId || "",
        nflTeam: player.nflTeam || "",
        ownershipStatus: player.ownershipStatus || "UNKNOWN",
        lflTeam: player.lflTeam || "",
        onWatchList: Boolean(player.onWatchList),
        opponentThisWeek: Boolean(player.opponentThisWeek)
      };
    })
    .sort((a, b) => {
      if (a.position !== b.position) {
        return a.position.localeCompare(b.position);
      }
      return a.averageRank - b.averageRank;
    });
}

function buildExpertRankingItems(consensus = [], week = null) {
  const now = new Date().toISOString();

  return consensus.slice(0, 300).map(item => ({
    author: "Zoo GM Expert Consensus",
    handle: "expert_consensus",
    text:
      `${item.name} is consensus ${item.position}${item.averageRank} ` +
      `across ${item.expertCount} expert ranking${item.expertCount === 1 ? "" : "s"} ` +
      `for Week ${week || "current"}.`,
    title: `Expert Consensus: ${item.name}`,
    link: "",
    publishedAt: now,
    guid: `expert-${week || "current"}-${normalize(item.position)}-${normalize(item.name)}`,
    sourceType: "EXPERT_RANKING",
    sourceKey: "expert_consensus",
    sourceLabel: "Zoo GM Expert Consensus"
  }));
}

function dedupeSourceItems(items = []) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key =
      normalize(item.guid || "") ||
      `${normalize(item.sourceKey || item.author || "")}|${normalize(item.title || "")}|${normalize(item.text || "").slice(0, 220)}`;

    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

exports.handler =
async function () {
  try {
    const espnData =
      await fetchJson(
        ESPN_ENDPOINT,
        "Zoo GM ESPN",
        { timeoutMs: 8000 }
      );

    if (
      !espnData ||
      !espnData.ok
    ) {
      throw new Error(
        espnData &&
        espnData.error
          ? espnData.error
          : "Zoo GM ESPN data unavailable"
      );
    }

    const watchList =
      Array.isArray(
        espnData.watchList
      )
        ? espnData.watchList.filter(
            player =>
              player &&
              player.name
          )
        : [];

    const playerCatalog =
      buildLeaguePlayerCatalog(
        espnData,
        watchList
      );

    const expertRankings =
      await loadExpertRankings();

    const expertRankingConsensus =
      buildExpertRankingConsensus(
        expertRankings,
        playerCatalog
      );

    const sourceResults =
      await Promise.all(
        INTELLIGENCE_SOURCES
          .filter(source => source.enabled)
          .map(fetchSourcePage)
      );

    const sourceStatus =
      sourceResults.map(result => ({
        key: result.source.key,
        label: result.source.label,
        type: result.source.type,
        url: result.source.url,
        ok: result.ok,
        error: result.ok ? "" : result.error
      }));

    const scrapedItems = [];

    for (const result of sourceResults) {
      if (!result.ok) continue;

      scrapedItems.push(
        ...extractItemsFromSource(
          result.source,
          result.html,
          playerCatalog
        )
      );
    }

    const fantasyProsApiItems =
      await fetchFantasyProsApiNews();

    // If the official FantasyPros API is configured, prefer it over scraped
    // FantasyPros player-news cards while still keeping the weekly article.
    const filteredScrapedItems =
      fantasyProsApiItems.length
        ? scrapedItems.filter(item =>
            !(
              item.sourceKey === "fantasypros" &&
              item.sourceType === "PLAYER_NEWS"
            )
          )
        : scrapedItems;

    const expertRankingItems =
      buildExpertRankingItems(
        expertRankingConsensus,
        expertRankings.week
      );

    const rawPosts =
      dedupeSourceItems([
        ...fantasyProsApiItems,
        ...filteredScrapedItems,
        ...expertRankingItems
      ]);

    const posts =
      rawPosts
        .map(
          post =>
            buildPostIntelligence(
              post,
              playerCatalog
            )
        )
        .sort(
          (
            a,
            b
          ) => {
            const aTime =
              new Date(
                a.publishedAt
              ).getTime() ||
              0;

            const bTime =
              new Date(
                b.publishedAt
              ).getTime() ||
              0;

            return (
              bTime -
              aTime
            );
          }
        );

    const zooPlayerUpdates =
      buildZooPlayerUpdates(
        posts,
        playerCatalog,
        12
      );

    const brief =
      buildBrief(
        posts
      );

    const watchListIntelligence =
      buildWatchListIntelligence(
        watchList,
        playerCatalog,
        espnData,
        posts
      );

    const suggestedWatchList =
      buildSuggestedWatchList(
        watchList,
        espnData,
        posts,
        12
      );

    const expendability =
      buildExpendability(
        espnData,
        posts,
        watchListIntelligence,
        playerCatalog
      );

    const lineupAlerts =
      buildStartingLineupAlerts(
        espnData,
        posts
      );

    const replacementRecommendations =
      buildReplacementRecommendations(
        espnData,
        posts,
        watchListIntelligence,
        lineupAlerts
      );

    const addDropDecisions =
      buildAddDropDecisions(
        espnData,
        posts,
        watchListIntelligence,
        expendability
      );

    const opponentIntelligence =
      buildOpponentIntelligence(
        posts,
        24
      );

    const opportunityAlerts =
      buildOpportunityAlerts(
        espnData,
        posts,
        suggestedWatchList,
        watchListIntelligence
      );

    const leagueIntelligence = {
      leagueSize: LFL_CONFIG.leagueSize,
      rosterSize: LFL_CONFIG.rosterSize,
      starters: LFL_CONFIG.starters,
      bench: LFL_CONFIG.bench,
      ir: LFL_CONFIG.ir,
      startingSlots: LFL_CONFIG.startingSlots,
      preferredRosterCounts: LFL_CONFIG.preferredRosterCounts,
      philosophy: LFL_CONFIG.philosophy,
      positionProfiles: Object.fromEntries(
        Object.entries(LFL_CONFIG.positionProfiles).map(([position, profile]) => [
          position,
          {
            ...profile,
            historicalThreeYearAverage: historicalPositionAverage(position)
          }
        ])
      ),
      scoring: LFL_CONFIG.scoring
    };

    const summary = {
      postsReviewed:
        posts.length,

      intelligenceItemsReviewed:
        posts.length,

      sourcesAttempted:
        sourceStatus.length,

      sourcesOnline:
        sourceStatus.filter(source => source.ok).length,

      expertsLoaded:
        expertRankings.experts.length,

      relevantPosts:
        brief.relevantPosts,

      noisePosts:
        brief.noisePosts,

      actNow:
        brief.actNowCount,

      monitor:
        posts.filter(
          post =>
            post.intelligence
              .actionTier ===
            "MONITOR"
        ).length,

      fyi:
        posts.filter(
          post =>
            post.intelligence
              .actionTier ===
            "FYI"
        ).length,

      fantasyRelevant:
        posts.filter(
          post =>
            post.intelligence
              .fantasyRelevance >=
            60
        ).length,

      zooRelevant:
        posts.filter(
          post =>
            post.intelligence
              .zooRelevance >=
            60
        ).length,

      watchListRelevant:
        posts.filter(
          post =>
            post.intelligence
              .watchRelevance >=
            60
        ).length,

      availablePlayerRelevant:
        posts.filter(
          post =>
            post.intelligence
              .availableRelevance >=
            60
        ).length,

      opponentRelevant:
        posts.filter(
          post =>
            post.intelligence
              .opponentRelevance >=
            60
        ).length,

      indirectZooImpact:
        posts.filter(
          post =>
            post.intelligence
              .indirectZooImpact
        ).length,

      actionableEvents:
        posts.filter(
          post =>
            post.intelligence
              .hasActionableEvent
        ).length,

      urgent:
        posts.filter(
          post =>
            post.intelligence
              .alertLevel ===
            "URGENT"
        ).length,

      important:
        posts.filter(
          post =>
            post.intelligence
              .alertLevel ===
            "IMPORTANT"
        ).length,

      zooRosterLoaded:
        espnData.zooRosterSize ??
        (
          espnData.zoo &&
          espnData.zoo.roster
            ? espnData.zoo
                .roster.length
            : 0
        ),

      lflTeamsLoaded:
        espnData.teamCount ??
        (
          espnData.teams ||
          []
        ).length,

      rosteredPlayersLoaded:
        espnData
          .rosteredPlayerCount ??
        0,

      availablePlayersLoaded:
        espnData
          .availablePlayerCount ??
        (
          espnData
            .availablePlayers ||
          []
        ).length,

      watchListLoaded:
        watchList.length,

      watchListAddNow:
        watchListIntelligence.filter(
          player => player.recommendation === "ADD NOW"
        ).length,

      watchListWatchClosely:
        watchListIntelligence.filter(
          player => player.recommendation === "WATCH CLOSELY"
        ).length,

      suggestedWatchListLoaded:
        suggestedWatchList.length,

      topSuggestedWatch:
        suggestedWatchList[0]?.name || "",

      topExpendable:
        expendability.top3[0]?.name ||
        "",

      lineupAlerts:
        lineupAlerts.length,

      replacementRecommendations:
        replacementRecommendations.length,

      addDropDecisions:
        addDropDecisions.length,

      opportunityAlerts:
        opportunityAlerts.length,

      opponentActionableUpdates:
        opponentIntelligence.length,

      playerCatalogLoaded:
        playerCatalog.length
    };

    return {
      statusCode:
        200,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"
      },

      body:
        JSON.stringify({
          ok:
            true,

          source:
            "Zoo GM Fantasy Intelligence",

          dataSources: {
            playerNews:
              "NBC Sports Rotoworld + FantasyPros",

            weeklyIdp:
              "Footballguys + FantasyPros + SI",

            expertRankings:
              expertRankings.experts.length
                ? `${expertRankings.experts.length} weekly expert sets`
                : "Awaiting weekly expert rankings",

            espnLeague:
              "Live Zoo GM ESPN Sync",

            watchList:
              "ESPN Watch List"
          },

          sourceStatus,
          expertRankings: {
            week: expertRankings.week,
            source: expertRankings.source,
            expertsLoaded: expertRankings.experts.map(expert => expert.name),
            expectedExperts: expertRankings.expectedExperts,
            consensus: expertRankingConsensus
          },

          summary,
          brief,
          leagueIntelligence,
          watchList,
          watchListIntelligence,
          suggestedWatchList,
          expendability,
          lineupAlerts,
          replacementRecommendations,
          addDropDecisions,
          opponentIntelligence,
          opportunityAlerts,
          zooPlayerUpdates,
          posts
        })
    };

  } catch (
    error
  ) {
    console.error(
      "Zoo GM Intelligence Error:",
      error
    );

    return {
      statusCode:
        500,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"
      },

      body:
        JSON.stringify({
          ok:
            false,

          error:
            "Unable to retrieve or analyze Zoo GM intelligence.",

          detail:
            error.message
        })
    };
  }
};
