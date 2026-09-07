const RSS_FEED_URL = "https://rss.app/feeds/MN6OehHIKqSDETrP.xml";
const ESPN_ENDPOINT = "https://ma3dtribe.com/.netlify/functions/zoo-gm-espn";

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

  positionProfiles: {
    QB: { scarcity: 42, market: 38, benchBias: -18, historicalAvg: [44.98, 47.0, 44.09] },
    RB: { scarcity: 100, market: 100, benchBias: 20, historicalAvg: [38.79, 40.0, 40.15] },
    WR: { scarcity: 80, market: 82, benchBias: 14, historicalAvg: [37.55, 37.0, 35.81] },
    TE: { scarcity: 48, market: 42, benchBias: -16, historicalAvg: [28.57, 30.0, 29.48] },
    LB: { scarcity: 82, market: 72, benchBias: 16, historicalAvg: [39.03, 38.0, 36.91] },
    DL: { scarcity: 54, market: 48, benchBias: -15, historicalAvg: [35.1, 31.0, 34.08] },
    CB: { scarcity: 40, market: 34, benchBias: -16, historicalAvg: [38.4, 37.0, 35.19] },
    S:  { scarcity: 46, market: 40, benchBias: -16, historicalAvg: [40.0, 37.0, 33.73] },
    K:  { scarcity: 24, market: 18, benchBias: -24, historicalAvg: [25.4, 0, 0] }
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
        }
      }
    );

  if (!response.ok) {
    throw new Error(
      `${label} request failed: ${response.status}`
    );
  }

  return response.text();
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

  aliases.add(
    original
  );

  const cleaned =
    original
      .replace(
        /\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi,
        ""
      )
      .replace(
        /[-–—]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (cleaned) {
    aliases.add(
      cleaned
    );
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

function acquisitionScore(player = {}, rosterCounts = {}, posts = []) {
  const position = canonicalPosition(player.position);
  const profile = getPositionProfile(position);
  const need = rosterNeedScore(position, rosterCounts);
  const marketQuality = playerMarketQuality(player);
  const news = liveNewsScore(posts, player.name);

  let score =
    (need * 1.0) +
    (profile.scarcity * 0.25) +
    (profile.market * 0.12) +
    (marketQuality * 0.22) +
    (news * 0.75) +
    profile.benchBias;

  const current = Number(rosterCounts[position] || 0);
  const preferred = getPreferredCount(position);

  if (
    LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
    current >= preferred
  ) {
    score -= 24;
  }

  if (["RB", "WR", "LB"].includes(position) && current < preferred) {
    score += 8;
  }

  if (position === "RB") {
    score += 8;
  }

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

    const replacementValue = clamp(
      Math.round((profile.scarcity * 0.55) + (marketQuality * 0.45)),
      0,
      100
    );

    const claimRisk = clamp(
      Math.round((Number(catalogPlayer.percentOwned || 0) * 0.65) + (Number(catalogPlayer.percentStarted || 0) * 1.2)),
      0,
      100
    );

    let score =
      (need * 1.0) +
      (profile.scarcity * 0.20) +
      (news * 1.0) +
      (replacementValue * 0.15) +
      (profile.market * 0.10) +
      (claimRisk * 0.10);

    const currentCount = Number(counts[position] || 0);
    const preferred = getPreferredCount(position);
    const redundantSingle =
      LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
      currentCount >= preferred;

    if (redundantSingle) score -= 18;
    if (["RB", "WR", "LB"].includes(position) && currentCount < preferred) score += 8;
    if (position === "RB") score += 8;
    if (String(watchPlayer.priority || "").toLowerCase() === "high") score += 5;
    if (catalogPlayer.ownershipStatus === "LFL OWNED") score -= 15;

    score = clamp(Math.round(score), 0, 100);

    let recommendation = "IGNORE";
    if (catalogPlayer.ownershipStatus === "LFL OWNED") {
      recommendation = score >= 70 ? "TRADE WATCH" : "OWNED - MONITOR";
    } else if (score >= 82) {
      recommendation = "ADD NOW";
    } else if (score >= 68) {
      recommendation = "WATCH CLOSELY";
    } else if (score >= 50) {
      recommendation = "HOLD";
    }

    const reasons = [];
    if (position === "RB") reasons.push("LFL RB scarcity + trade premium");
    if (need >= 20) reasons.push(`Zoo needs ${position} depth`);
    if (redundantSingle) reasons.push(`Zoo normally carries one ${position}`);
    if (news >= 15) reasons.push("actionable live news");
    if (claimRisk >= 60) reasons.push("elevated waiver claim risk");
    if (profile.scarcity >= 80 && position !== "RB") reasons.push(`high ${position} lineup demand`);
    if (!reasons.length) reasons.push("depth value versus current Zoo construction");

    results.push({
      playerId: catalogPlayer.playerId || watchPlayer.playerId || null,
      name: catalogPlayer.name,
      position,
      nflTeam: catalogPlayer.nflTeam || "",
      ownershipStatus: catalogPlayer.ownershipStatus || "UNKNOWN",
      lflTeam: catalogPlayer.lflTeam || "",
      priorityScore: score,
      recommendation,
      components: {
        zooNeed: need,
        positionalScarcity: profile.scarcity,
        liveNews: news,
        replacementValue,
        tradeMarketValue: profile.market,
        claimRisk
      },
      historicalPositionAverage: historicalPositionAverage(position),
      currentZooCount: currentCount,
      preferredZooCount: preferred,
      reasons
    });
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
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
  limit = 12
) {
  return (espnData.availablePlayers || [])
    .filter(player => player && player.name && canonicalPosition(player.position) !== "D/ST")
    .map(player => ({
      ...player,
      position: canonicalPosition(player.position),
      acquisitionScore: acquisitionScore(player, counts, posts)
    }))
    .sort((a, b) => b.acquisitionScore - a.acquisitionScore)
    .slice(0, limit);
}

function buildExpendability(espnData = {}, posts = []) {
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

    const afterCutCounts = simulateCountsAfterCut(counts, position);
    const replacementOptions = buildBestAvailableOptions(
      espnData,
      posts,
      afterCutCounts,
      5
    );
    const bestReplacement = replacementOptions[0] || null;

    let score = 42;

    if (isBench) score += 18;
    if (surplus > 0) score += Math.min(30, 20 + ((surplus - 1) * 6));

    // Scarce/tradeable positions are harder to cut even if they are on the bench.
    score -= profile.scarcity * 0.18;
    score -= profile.market * 0.10;
    score -= marketQuality * 0.08;

    // Preserve positive actionable news/upside; negative injury news is intentionally
    // not treated as an automatic cut because IR/stash value can still matter.
    score -= news * 0.35;

    if (position === "RB") score -= 14;
    if (position === "WR") score -= 7;
    if (position === "LB" && surplus === 0) score -= 5;

    if (
      LFL_CONFIG.philosophy.singleCarryPositions.includes(position) &&
      positionCount > preferred
    ) {
      score += 20;
    }

    if (bestReplacement) {
      score += Math.max(0, (bestReplacement.acquisitionScore - 55) * 0.35);
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
    if (position === "LB" && surplus > 0) reasons.push("LB production is more replaceable than RB inventory");
    if (position === "RB") reasons.push("RB scarcity/trade value strongly protects this roster spot");
    if (LFL_CONFIG.philosophy.singleCarryPositions.includes(position) && positionCount > preferred) {
      reasons.push(`duplicate ${position} is normally unnecessary`);
    }
    if (bestReplacement && bestReplacement.acquisitionScore >= 65) {
      reasons.push(`strong waiver alternative: ${bestReplacement.name} (${bestReplacement.position})`);
    }
    if (strategicOverride?.note) reasons.push(strategicOverride.note);
    if (!reasons.length) reasons.push("lower marginal value versus the rest of Zoo's roster");

    results.push({
      playerId: player.playerId || null,
      name: player.name,
      position,
      nflTeam: player.nflTeam || "",
      lineupStatus: player.rosterStatus || player.lineupSlot || "",
      injuryStatus: player.injuryStatus || "ACTIVE",
      expendabilityScore: score,
      currentPositionCount: positionCount,
      preferredPositionCount: preferred,
      surplusAtPosition: surplus,
      historicalPositionAverage: historicalPositionAverage(position),
      strategicAdjustment: strategicOverride?.expendabilityAdjustment || 0,
      bestAvailableReplacement: bestReplacement ? {
        playerId: bestReplacement.playerId || null,
        name: bestReplacement.name,
        position: bestReplacement.position,
        nflTeam: bestReplacement.nflTeam || "",
        acquisitionScore: bestReplacement.acquisitionScore,
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
    bestAvailableOverall: buildBestAvailableOptions(espnData, posts, counts, 10)
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

exports.handler =
async function () {
  try {
    const [
      xml,
      espnData
    ] =
      await Promise.all([
        fetchText(
          `${RSS_FEED_URL}?zgm=${Date.now()}`,
          "RSS feed",
          {
            headers: {
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            }
          }
        ),

        fetchJson(
          ESPN_ENDPOINT,
          "Zoo GM ESPN"
        )
      ]);

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

    const rawPosts = [
      ...xml.matchAll(
        /<item>([\s\S]*?)<\/item>/gi
      )
    ].map(
      match => {
        const item =
          match[1];

        const rawTitle =
          getTag(
            item,
            "title"
          );

        const rawDescription =
          getTag(
            item,
            "description"
          );

        return {
          author:
            getAuthorFromTitle(
              stripHtml(
                rawTitle
              )
            ),

          handle:
            stripHtml(
              getTag(
                item,
                "dc:creator"
              )
            ),

          text:
            stripHtml(
              rawDescription
            ),

          title:
            stripHtml(
              rawTitle
            ),

          link:
            stripHtml(
              getTag(
                item,
                "link"
              )
            ),

          publishedAt:
            stripHtml(
              getTag(
                item,
                "pubDate"
              )
            ),

          guid:
            stripHtml(
              getTag(
                item,
                "guid"
              )
            )
        };
      }
    );

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

    const expendability =
      buildExpendability(
        espnData,
        posts
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

      topExpendable:
        expendability.top3[0]?.name ||
        "",

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
            "Zoo GM Fantasy X List",

          dataSources: {
            xFeed:
              "RSS.app",

            espnLeague:
              "Live Zoo GM ESPN Sync",

            watchList:
              "ESPN Watch List"
          },

          summary,
          brief,
          leagueIntelligence,
          watchList,
          watchListIntelligence,
          expendability,
          posts
        })
    };

  } catch (
    error
  ) {
    console.error(
      "Zoo GM X Feed Error:",
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
            "Unable to retrieve or analyze Zoo GM X feed.",

          detail:
            error.message
        })
    };
  }
};
