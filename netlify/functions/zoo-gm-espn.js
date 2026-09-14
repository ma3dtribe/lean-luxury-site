const SEASON_ID = 2026;
const LEAGUE_ID = 261539;
const ZOO_TEAM_NAME = process.env.ZOO_TEAM_NAME || "Zoo";

// Watch List must come from ESPN live state only.
// No hard-coded fallback IDs are kept because removed players must disappear immediately.
const ESPN_BASE =
  `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${SEASON_ID}`;

const LEAGUE_BASE =
  `${ESPN_BASE}/segments/0/leagues/${LEAGUE_ID}`;


const POSITION_BY_ID = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  8: "DT",
  9: "DE",
  10: "LB",
  11: "DL",
  12: "CB",
  13: "S",
  14: "DB",
  15: "DP",
  16: "D/ST"
};


const LINEUP_SLOT_BY_ID = {
  0: "QB",
  1: "TQB",
  2: "RB",
  3: "RB/WR",
  4: "WR",
  5: "WR/TE",
  6: "TE",
  7: "OP",
  8: "DT",
  9: "DE",
  10: "LB",
  11: "DL",
  12: "CB",
  13: "S",
  14: "DB",
  15: "DP",
  16: "D/ST",
  17: "K",
  18: "P",
  19: "HC",
  20: "BE",
  21: "IR",
  22: "RES",
  23: "FLEX"
};


const GENERIC_POSITION_SLOTS = new Set([
  "TQB",
  "RB/WR",
  "WR/TE",
  "OP",
  "DB",
  "DP",
  "BE",
  "IR",
  "RES",
  "FLEX"
]);

function cleanPositionLabel(position = "") {
  const value = String(position || "").toUpperCase();

  if (
    value === "DT" ||
    value === "DE" ||
    value === "DL"
  ) {
    return "DL";
  }

  return value;
}

function positionFromEligibleSlots(
  eligibleSlots = [],
  fallback = ""
) {
  for (const rawSlotId of eligibleSlots || []) {
    const slotId = Number(rawSlotId);
    const label = LINEUP_SLOT_BY_ID[slotId];

    if (!label) continue;
    if (GENERIC_POSITION_SLOTS.has(label)) continue;

    return cleanPositionLabel(label);
  }

  return cleanPositionLabel(fallback);
}

function rosterDisplayPosition(
  player,
  lineupSlotId
) {
  const slotLabel =
    LINEUP_SLOT_BY_ID[Number(lineupSlotId)];

  if (
    slotLabel &&
    !GENERIC_POSITION_SLOTS.has(slotLabel)
  ) {
    return cleanPositionLabel(slotLabel);
  }

  return positionFromEligibleSlots(
    player?.eligibleSlots || [],
    player?.position || ""
  );
}


function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0"
    },
    body: JSON.stringify(body)
  };
}


function getHeader(event, name) {
  const headers = event?.headers || {};
  const target = String(name).toLowerCase();

  for (const [key, value] of Object.entries(headers)) {
    if (String(key).toLowerCase() === target) {
      return value;
    }
  }

  return undefined;
}


function leagueUrl(views = [], params = {}) {
  const url = new URL(LEAGUE_BASE);

  for (const view of views) {
    url.searchParams.append("view", view);
  }

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function isRetryableEspnStatus(status) {
  return [408, 425, 429, 500, 502, 503, 504].includes(Number(status));
}


function espnFallbackUrl(url) {
  const primary = "https://lm-api-reads.fantasy.espn.com/";
  const fallback = "https://fantasy.espn.com/";

  if (String(url).startsWith(primary)) {
    return String(url).replace(primary, fallback);
  }

  return null;
}


async function fetchJsonOnce(
  url,
  {
    cookieHeader,
    fantasyFilter
  } = {}
) {
  const headers = {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 ZooGM/1.0",
    "Cache-Control": "no-cache",
    Pragma: "no-cache"
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  if (fantasyFilter) {
    headers["X-Fantasy-Filter"] =
      JSON.stringify(fantasyFilter);
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    12000
  );

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal
    });

    const bodyText = await response.text();

    if (!response.ok) {
      const error = new Error(
        `ESPN request failed with status ${response.status}`
      );

      error.status = response.status;
      error.body = bodyText.slice(0, 500);
      error.url = url;

      throw error;
    }

    try {
      return JSON.parse(bodyText);
    } catch {
      const error = new Error(
        "ESPN returned a non-JSON response"
      );
      error.status = 502;
      error.body = bodyText.slice(0, 500);
      error.url = url;
      throw error;
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(
        "ESPN request timed out"
      );
      timeoutError.status = 504;
      timeoutError.url = url;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}


async function fetchJson(
  url,
  options = {}
) {
  const urls = [url];
  const fallback = espnFallbackUrl(url);

  if (fallback && fallback !== url) {
    urls.push(fallback);
  }

  let lastError = null;

  for (const candidateUrl of urls) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        return await fetchJsonOnce(
          candidateUrl,
          options
        );
      } catch (error) {
        lastError = error;

        const retryable =
          isRetryableEspnStatus(error?.status) ||
          error?.name === "TypeError";

        if (!retryable || attempt === 3) {
          break;
        }

        // ESPN occasionally returns short-lived 502/503 responses.
        // A small backoff avoids blanking the whole Zoo GM dashboard
        // because of a single transient upstream failure.
        await sleep(350 * attempt);
      }
    }
  }

  throw lastError || new Error("ESPN request failed");
}


function teamDisplayName(team) {
  if (!team) {
    return "";
  }

  if (team.name) {
    return String(team.name).trim();
  }

  return [
    team.location,
    team.nickname
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}


function buildMemberMap(members = []) {
  const map = new Map();

  for (const member of members) {
    map.set(member.id, {
      id: member.id,
      displayName:
        member.displayName ||
        member.firstName ||
        member.id,
      firstName: member.firstName || "",
      lastName: member.lastName || ""
    });
  }

  return map;
}


function buildProTeamMap(seasonData) {
  const teams =
    seasonData?.settings?.proTeams || [];

  const map = new Map();

  for (const team of teams) {
    map.set(Number(team.id), {
      id: Number(team.id),
      abbreviation:
        team.abbrev ||
        team.abbreviation ||
        "",
      location: team.location || "",
      name: team.name || "",
      byeWeek:
        team.byeWeek ?? null
    });
  }

  return map;
}


function getPlayerObject(source) {
  return (
    source?.playerPoolEntry?.player ||
    source?.player ||
    null
  );
}


function getPoolEntry(source) {
  return (
    source?.playerPoolEntry ||
    source ||
    {}
  );
}


function normalizePlayer(
  source,
  proTeamMap
) {
  const player =
    getPlayerObject(source);

  const pool =
    getPoolEntry(source);

  if (!player) {
    return null;
  }

  const proTeamId =
    Number(player.proTeamId || 0);

  const nflTeam =
    proTeamMap.get(proTeamId);

  const defaultPositionId =
    Number(
      player.defaultPositionId || 0
    );

  const eligibleSlots =
    Array.isArray(player.eligibleSlots)
      ? player.eligibleSlots.map(Number)
      : [];

  const defaultPosition =
    POSITION_BY_ID[
      defaultPositionId
    ] ||
    `POS-${defaultPositionId}`;

  const position =
    positionFromEligibleSlots(
      eligibleSlots,
      defaultPosition
    );

  const ownership =
    player.ownership || {};

  return {
    playerId:
      Number(
        player.id ||
        pool.id ||
        0
      ),

    name:
      player.fullName ||
      [
        player.firstName,
        player.lastName
      ]
        .filter(Boolean)
        .join(" "),

    firstName:
      player.firstName || "",

    lastName:
      player.lastName || "",

    position,

    defaultPositionId,

    proTeamId,

    nflTeam:
      nflTeam?.abbreviation || "",

    nflTeamName:
      [
        nflTeam?.location,
        nflTeam?.name
      ]
        .filter(Boolean)
        .join(" "),

    byeWeek:
      nflTeam?.byeWeek ?? null,

    injuryStatus:
      player.injuryStatus ||
      "ACTIVE",

    percentOwned:
      ownership.percentOwned ??
      null,

    percentStarted:
      ownership.percentStarted ??
      null,

    onTeamId:
      Number(
        source?.onTeamId ||
        pool?.onTeamId ||
        0
      ),

    eligibleSlots
  };
}


function normalizeRosterEntry(
  entry,
  proTeamMap
) {
  const player =
    normalizePlayer(
      entry,
      proTeamMap
    );

  if (!player) {
    return null;
  }

  const lineupSlotId =
    Number(
      entry.lineupSlotId ?? -1
    );

  const slot =
    LINEUP_SLOT_BY_ID[
      lineupSlotId
    ] ||
    `SLOT-${lineupSlotId}`;

  let rosterStatus =
    "STARTER";

  if (lineupSlotId === 20) {
    rosterStatus =
      "BENCH";
  } else if (
    lineupSlotId === 21 ||
    lineupSlotId === 22
  ) {
    rosterStatus =
      "IR";
  }

  return {
    ...player,

    position:
      rosterDisplayPosition(
        player,
        lineupSlotId
      ),

    lineupSlotId,

    lineupSlot:
      slot,

    rosterStatus,

    acquisitionType:
      entry.acquisitionType ||
      null,

    acquisitionDate:
      entry.acquisitionDate ||
      null
  };
}


function normalizeTeam(
  team,
  memberMap,
  proTeamMap
) {
  const ownerIds =
    Array.isArray(team.owners)
      ? team.owners
      : team.primaryOwner
        ? [team.primaryOwner]
        : [];

  const owners =
    ownerIds.map(
      id =>
        memberMap.get(id)
          ?.displayName ||
        id
    );

  const rosterEntries =
    team?.roster?.entries || [];

  const roster =
    rosterEntries
      .map(
        entry =>
          normalizeRosterEntry(
            entry,
            proTeamMap
          )
      )
      .filter(Boolean);

  return {
    teamId:
      Number(team.id),

    name:
      teamDisplayName(team),

    abbreviation:
      team.abbrev || "",

    // ESPN stores the owner's personal Watch List directly on the raw team
    // object returned by the mTeam view. Preserve the IDs so the live list can
    // be resolved later without guessing from player-status flags.
    watchList:
      Array.isArray(team.watchList)
        ? [...new Set(
            team.watchList
              .map(playerId => Number(playerId))
              .filter(playerId => Number.isFinite(playerId) && playerId > 0)
          )]
        : [],

    owners,

    wins:
      team.record?.overall
        ?.wins ?? 0,

    losses:
      team.record?.overall
        ?.losses ?? 0,

    ties:
      team.record?.overall
        ?.ties ?? 0,

    pointsFor:
      team.record?.overall
        ?.pointsFor ?? null,

    pointsAgainst:
      team.record?.overall
        ?.pointsAgainst ?? null,

    playoffSeed:
      team.playoffSeed ??
      null,

    rosterSize:
      roster.length,

    roster
  };
}


function matchupSide(
  side,
  teamById
) {
  if (!side) {
    return null;
  }

  const teamId =
    Number(
      side.teamId || 0
    );

  return {
    teamId,

    teamName:
      teamById.get(teamId)
        ?.name ||
      `Team ${teamId}`,

    totalPoints:
      side.totalPoints ??
      null,

    // ESPN can keep totalPoints at 0 while cumulativeScore.score is already live.
    // Expose one normalized score that prefers a non-zero live value.
    score: (() => {
      const values = [side.cumulativeScore?.score, side.totalPoints]
        .map(Number).filter(Number.isFinite);
      const live = values.find(value => value !== 0);
      return live ?? values[0] ?? 0;
    })(),

    totalProjectedPointsLive:
      side.totalProjectedPointsLive ??
      null,

    cumulativeScore:
      side.cumulativeScore
        ?.score ?? null
  };
}


function normalizeMatchups(
  schedule = [],
  currentMatchupPeriod,
  teamById
) {
  return schedule
    .filter(
      game =>
        Number(
          game.matchupPeriodId
        ) ===
        Number(
          currentMatchupPeriod
        )
    )
    .map(
      game => ({
        matchupId:
          game.id ?? null,

        matchupPeriodId:
          game.matchupPeriodId ??
          null,

        winner:
          game.winner || null,

        home:
          matchupSide(
            game.home,
            teamById
          ),

        away:
          matchupSide(
            game.away,
            teamById
          )
      })
    );
}


function watchCandidatePlayerId(value = {}) {
  const pool = getPoolEntry(value);
  const candidates = [
    value?.playerId,
    value?.player?.id,
    value?.player?.playerId,
    pool?.player?.id,
    pool?.player?.playerId,
    value?.id
  ];

  for (const candidate of candidates) {
    const id = Number(candidate);
    if (Number.isFinite(id) && id > 0) return id;
  }

  return null;
}

function extractWatchListIds(data = {}, { dedicated = false } = {}) {
  const ids = new Set();

  // When this data came from the dedicated ESPN WATCHLIST-filtered request,
  // the returned `players` array itself is the Watch List. ESPN does not
  // consistently attach an `isWatched` boolean to each player object.
  // Guard against an ignored filter accidentally returning the full player pool.
  const dedicatedPlayers = Array.isArray(data?.players) ? data.players : [];
  if (dedicated && dedicatedPlayers.length > 0 && dedicatedPlayers.length <= 100) {
    for (const entry of dedicatedPlayers) {
      const id = watchCandidatePlayerId(entry);
      if (id) ids.add(id);
    }
  }

  const visit = (value, key = "") => {
    if (value == null) return;

    if (Array.isArray(value)) {
      if (/watch.*(id|player)|watchlist/i.test(key)) {
        for (const entry of value) {
          const id = watchCandidatePlayerId(entry);
          if (id) ids.add(id);
        }
      }

      for (const entry of value) visit(entry, key);
      return;
    }

    if (typeof value !== "object") return;

    const playerId = watchCandidatePlayerId(value);
    const watched =
      value.onWatchList === true ||
      value.isWatched === true ||
      value.watchlisted === true ||
      value.watched === true ||
      String(value.status || "").toUpperCase() === "WATCHLIST";

    if (watched && playerId) ids.add(playerId);

    for (const [childKey, childValue] of Object.entries(value)) {
      visit(childValue, childKey);
    }
  };

  visit(data);
  return [...ids];
}

function buildPlayerLookup(
  teams,
  availablePlayers
) {
  const map =
    new Map();

  for (const team of teams) {
    for (
      const player
      of team.roster || []
    ) {
      map.set(
        player.playerId,
        player
      );
    }
  }

  for (
    const player
    of availablePlayers || []
  ) {
    map.set(
      player.playerId,
      player
    );
  }

  return map;
}


function normalizeTransaction(
  transaction,
  teamById,
  playerById
) {
  const items =
    (
      transaction.items ||
      []
    ).map(
      item => {
        const playerId =
          Number(
            item.playerId || 0
          );

        return {
          playerId,

          playerName:
            playerById.get(
              playerId
            )?.name ||
            `Player ${playerId}`,

          position:
            playerById.get(
              playerId
            )?.position ||
            "",

          nflTeam:
            playerById.get(
              playerId
            )?.nflTeam ||
            "",

          type:
            item.type ||
            null,

          fromTeamId:
            item.fromTeamId ??
            null,

          fromTeamName:
            item.fromTeamId
              ? teamById.get(
                  Number(
                    item.fromTeamId
                  )
                )?.name ||
                null
              : null,

          toTeamId:
            item.toTeamId ??
            null,

          toTeamName:
            item.toTeamId
              ? teamById.get(
                  Number(
                    item.toTeamId
                  )
                )?.name ||
                null
              : null
        };
      }
    );

  const teamId =
    Number(
      transaction.teamId ||
      0
    );

  return {
    transactionId:
      transaction.id ||
      null,

    status:
      transaction.status ||
      null,

    type:
      transaction.type ||
      null,

    teamId,

    teamName:
      teamById.get(teamId)
        ?.name ||
      null,

    scoringPeriodId:
      transaction
        .scoringPeriodId ??
      null,

    processDate:
      transaction.processDate ??
      null,

    processDateIso:
      transaction.processDate
        ? new Date(
            transaction.processDate
          ).toISOString()
        : null,

    bidAmount:
      transaction.bidAmount ??
      null,

    items
  };
}


function normalizeAvailablePlayers(
  data,
  proTeamMap
) {
  return (
    data?.players ||
    []
  )
    .map(
      source => {
        const player =
          normalizePlayer(
            source,
            proTeamMap
          );

        if (!player) {
          return null;
        }

        const pool =
          getPoolEntry(source);

        return {
          ...player,

          availabilityStatus:
            source.status ||
            pool.status ||
            "AVAILABLE"
        };
      }
    )
    .filter(Boolean);
}


function weeklyPlayerPoints(entry, reportWeek) {
  const pool = getPoolEntry(entry);

  const direct = Number(
    pool?.appliedStatTotal ??
    entry?.appliedStatTotal
  );

  if (Number.isFinite(direct)) {
    return direct;
  }

  const stats =
    pool?.player?.stats ||
    pool?.stats ||
    [];

  const weeklyStat = stats.find(stat =>
    Number(stat?.scoringPeriodId) === Number(reportWeek) &&
    Number.isFinite(
      Number(
        stat?.appliedTotal ??
        stat?.points
      )
    )
  );

  if (weeklyStat) {
    return Number(
      weeklyStat.appliedTotal ??
      weeklyStat.points ??
      0
    );
  }

  return 0;
}


function normalizeBoxscorePlayer(
  entry,
  teamId,
  teamName,
  proTeamMap,
  reportWeek
) {
  const player =
    normalizePlayer(
      entry,
      proTeamMap
    );

  if (!player) {
    return null;
  }

  const lineupSlotId =
    Number(
      entry?.lineupSlotId ?? -1
    );

  return {
    ...player,

    position:
      rosterDisplayPosition(
        player,
        lineupSlotId
      ),

    teamId:
      Number(teamId),

    teamName:
      teamName ||
      `Team ${teamId}`,

    lineupSlotId,

    lineupSlot:
      LINEUP_SLOT_BY_ID[
        lineupSlotId
      ] ||
      `SLOT-${lineupSlotId}`,

    points:
      weeklyPlayerPoints(
        entry,
        reportWeek
      )
  };
}


function winnerTeamId(game) {
  const winner =
    String(
      game?.winner || ""
    ).toUpperCase();

  if (winner === "HOME") {
    return Number(
      game?.home?.teamId || 0
    );
  }

  if (winner === "AWAY") {
    return Number(
      game?.away?.teamId || 0
    );
  }

  return null;
}


function buildPowerRankings(
  schedule = [],
  teams = [],
  throughWeek
) {
  const rows = new Map(
    teams.map(team => [
      Number(team.teamId),
      {
        teamId: Number(team.teamId),
        teamName: team.name,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0
      }
    ])
  );

  for (const game of schedule || []) {
    const week =
      Number(
        game?.matchupPeriodId || 0
      );

    if (
      week < 1 ||
      week > Number(throughWeek)
    ) {
      continue;
    }

    const homeId =
      Number(
        game?.home?.teamId || 0
      );

    const awayId =
      Number(
        game?.away?.teamId || 0
      );

    const homeRow = rows.get(homeId);
    const awayRow = rows.get(awayId);

    if (!homeRow || !awayRow) {
      continue;
    }

    const homePoints =
      Number(
        game?.home?.totalPoints
      );

    const awayPoints =
      Number(
        game?.away?.totalPoints
      );

    if (Number.isFinite(homePoints)) {
      homeRow.pointsFor +=
        homePoints;
    }

    if (Number.isFinite(awayPoints)) {
      awayRow.pointsFor +=
        awayPoints;
    }

    const winner =
      String(
        game?.winner || ""
      ).toUpperCase();

    if (winner === "HOME") {
      homeRow.wins += 1;
      awayRow.losses += 1;
    } else if (winner === "AWAY") {
      awayRow.wins += 1;
      homeRow.losses += 1;
    } else if (winner === "TIE") {
      homeRow.ties += 1;
      awayRow.ties += 1;
    }
  }

  return Array.from(rows.values())
    .sort((a, b) =>
      b.wins - a.wins ||
      b.pointsFor - a.pointsFor ||
      a.teamName.localeCompare(
        b.teamName
      )
    )
    .map((row, index) => ({
      rank: index + 1,
      ...row,
      pointsFor:
        Number(
          row.pointsFor.toFixed(2)
        )
    }));
}


function buildCommishReport({
  boxscoreData,
  coreSchedule,
  teams,
  teamById,
  proTeamMap,
  reportWeek
}) {
  const games =
    (boxscoreData?.schedule || [])
      .filter(game =>
        Number(
          game?.matchupPeriodId
        ) === Number(reportWeek)
      );

  const winningTeamIds =
    new Set();

  const teamScores = [];
  const players = [];

  let resolvedMatchups = 0;

  for (const game of games) {
    const winner =
      String(
        game?.winner || ""
      ).toUpperCase();

    if (
      winner === "HOME" ||
      winner === "AWAY" ||
      winner === "TIE"
    ) {
      resolvedMatchups += 1;
    }

    const winningId =
      winnerTeamId(game);

    if (winningId) {
      winningTeamIds.add(
        winningId
      );
    }

    for (const sideName of [
      "home",
      "away"
    ]) {
      const side = game?.[sideName];

      if (!side) {
        continue;
      }

      const teamId =
        Number(
          side.teamId || 0
        );

      const teamName =
        teamById.get(teamId)
          ?.name ||
        `Team ${teamId}`;

      const score =
        Number(side.totalPoints);

      if (Number.isFinite(score)) {
        teamScores.push({
          teamId,
          teamName,
          points: score
        });
      }

      const entries =
        side
          ?.rosterForCurrentScoringPeriod
          ?.entries ||
        [];

      for (const entry of entries) {
        const player =
          normalizeBoxscorePlayer(
            entry,
            teamId,
            teamName,
            proTeamMap,
            reportWeek
          );

        if (player) {
          players.push(player);
        }
      }
    }
  }

  const offensivePositions =
    new Set([
      "QB",
      "RB",
      "WR",
      "TE"
    ]);

  const defensivePositions =
    new Set([
      "DL",
      "LB",
      "CB",
      "S",
      "DB"
    ]);

  const winningPlayers =
    players.filter(player =>
      winningTeamIds.has(
        Number(player.teamId)
      )
    );

  const topPlayer = positions =>
    winningPlayers
      .filter(player =>
        positions.has(
          String(
            player.position || ""
          ).toUpperCase()
        )
      )
      .sort((a, b) =>
        Number(b.points || 0) -
        Number(a.points || 0) ||
        a.name.localeCompare(b.name)
      )[0] ||
    null;

  const sortedScores =
    [...teamScores].sort(
      (a, b) =>
        Number(b.points || 0) -
        Number(a.points || 0) ||
        a.teamName.localeCompare(
          b.teamName
        )
    );

  const cashMoneyTeam =
    sortedScores[0] || null;

  const garbageTeam =
    sortedScores.length
      ? sortedScores[
          sortedScores.length - 1
        ]
      : null;

  const expectedMatchups =
    Math.floor(
      teams.length / 2
    );

  const isComplete =
    games.length === expectedMatchups &&
    resolvedMatchups === expectedMatchups;

  return {
    week: Number(reportWeek),
    status:
      isComplete
        ? "FINAL"
        : "IN PROGRESS",
    isComplete,
    matchupCount: games.length,
    resolvedMatchups,

    offensivePlayerOfWeek:
      topPlayer(
        offensivePositions
      ),

    defensivePlayerOfWeek:
      topPlayer(
        defensivePositions
      ),

    cashMoneyTeam,
    garbageTeam,

    powerRankings:
      buildPowerRankings(
        coreSchedule,
        teams,
        reportWeek
      )
  };
}


exports.handler =
async function (event = {}) {

  const requestId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  try {

    const espnS2 =
      process.env.ESPN_S2;

    const espnSwid =
      process.env.ESPN_SWID;


    if (
      !espnS2 ||
      !espnSwid
    ) {
      return jsonResponse(
        500,
        {
          ok: false,
          requestId,
          error:
            "Missing ESPN_S2 or ESPN_SWID environment variable"
        }
      );
    }


    /*
      OPTIONAL SECURITY

      Later, if we create a Netlify
      environment variable named:

      ZOO_GM_API_KEY

      this function will automatically
      require that value in an
      x-zoo-gm-key request header.

      No code change will be needed.
    */

    const requiredApiKey =
      process.env
        .ZOO_GM_API_KEY;

    if (requiredApiKey) {

      const suppliedApiKey =
        getHeader(
          event,
          "x-zoo-gm-key"
        );

      if (
        suppliedApiKey !==
        requiredApiKey
      ) {
        return jsonResponse(
          401,
          {
            ok: false,
            requestId,
            error:
              "Unauthorized"
          }
        );
      }
    }


    const cookieHeader =
      `espn_s2=${espnS2}; SWID=${espnSwid}`;


    /*
      CORE LFL SNAPSHOT
    */

    const core =
      await fetchJson(

        leagueUrl(
          [
            "mTeam",
            "mRoster",
            "mMatchup",
            "mMatchupScore",
            "mSettings",
            "mStatus"
          ]
        ),

        {
          cookieHeader
        }
      );


    if (
      Number(core.id) !==
      LEAGUE_ID
    ) {
      throw new Error(
        `Unexpected ESPN league id: ${core.id}`
      );
    }


    const scoringPeriodId =
      Number(
        core.scoringPeriodId ||
        core.status
          ?.currentScoringPeriod ||
        1
      );


    const matchupPeriodId =
      Number(
        core.status
          ?.currentMatchupPeriod ||
        core.status
          ?.currentMatchupPeriodId ||
        scoringPeriodId
      );


    const requestedReportWeek =
      Number(
        event
          ?.queryStringParameters
          ?.reportWeek ||
        matchupPeriodId
      );


    const reportWeek =
      Number.isFinite(
        requestedReportWeek
      )
        ? Math.max(
            1,
            Math.min(
              requestedReportWeek,
              Math.max(
                1,
                matchupPeriodId
              )
            )
          )
        : matchupPeriodId;


    const warnings = [];


    // ESPN's authoritative Watch List is stored on the owner's team object in
    // the mTeam response. Capture Zoo's raw team before any normalization so
    // Watch List membership comes directly from ESPN and updates immediately
    // when a player is added or removed on ESPN.
    const rawZooTeam =
      (core.teams || []).find(
        team =>
          teamDisplayName(team).toLowerCase() ===
          ZOO_TEAM_NAME.toLowerCase()
      )
      ||
      (core.teams || []).find(
        team =>
          teamDisplayName(team)
            .toLowerCase()
            .includes(ZOO_TEAM_NAME.toLowerCase())
      )
      ||
      null;

    const rawZooWatchIds = [...new Set(
      (Array.isArray(rawZooTeam?.watchList) ? rawZooTeam.watchList : [])
        .map(playerId => Number(playerId))
        .filter(playerId => Number.isFinite(playerId) && playerId > 0)
    )];


    /*
      NFL TEAM / BYE-WEEK INFO
    */

    const seasonRequest =
      fetchJson(
        `${ESPN_BASE}?view=proTeamSchedules_wl`
      );


    /*
      ALL AVAILABLE PLAYERS

      FREE AGENTS + WAIVERS

      Sorted by ESPN ownership.
    */

    const availableRequest =
      fetchJson(

        leagueUrl(
          [
            "kona_player_info"
          ],
          {
            scoringPeriodId
          }
        ),

        {
          cookieHeader,

          fantasyFilter: {
            players: {

              filterStatus: {
                value: [
                  "FREEAGENT",
                  "WAIVERS"
                ]
              },

              limit: 2000,

              sortPercOwned: {
                sortPriority: 1,
                sortAsc: false
              }
            }
          }
        }
      );


    // Resolve the exact live Watch List IDs ESPN returned on Zoo's mTeam
    // object. This mirrors the ESPN web app: first read team.watchList, then
    // request kona_player_info for those IDs. Do not use WATCHLIST as a player
    // status filter; ESPN's browser does not use that mechanism.
    const watchListRequest =
      rawZooWatchIds.length
        ? fetchJson(
            leagueUrl(["kona_player_info"], { scoringPeriodId }),
            {
              cookieHeader,
              fantasyFilter: {
                players: {
                  filterIds: { value: rawZooWatchIds },
                  limit: Math.max(100, rawZooWatchIds.length)
                }
              }
            }
          )
        : Promise.resolve({ players: [] });


    /*
      COMMISH REPORT
      SELECTED-WEEK BOXSCORE
    */

    const boxscoreRequest =
      fetchJson(

        leagueUrl(
          [
            "mBoxscore",
            "mMatchupScore"
          ],
          {
            scoringPeriodId:
              reportWeek,

            matchupPeriodId:
              reportWeek
          }
        ),

        {
          cookieHeader
        }
      );


    /*
      CURRENT SCORING PERIOD
      TRANSACTIONS
    */

    const transactionsRequest =
      fetchJson(

        leagueUrl(
          [
            "mTransactions2"
          ],
          {
            scoringPeriodId
          }
        ),

        {
          cookieHeader,

          fantasyFilter: {
            transactions: {

              filterType: {
                value: [
                  "FREEAGENT",
                  "FREE_AGENT",
                  "WAIVER",
                  "WAIVER_ERROR",
                  "TRADE",
                  "TRADE_ACCEPTED"
                ]
              }
            }
          }
        }
      );


    /*
      PENDING TRANSACTIONS
    */

    const pendingRequest =
      fetchJson(

        leagueUrl(
          [
            "mPendingTransactions"
          ],
          {
            scoringPeriodId
          }
        ),

        {
          cookieHeader
        }
      );


    /*
      RUN OPTIONAL ESPN CALLS
      AT THE SAME TIME
    */

    const [
      seasonResult,
      availableResult,
      watchListResult,
      transactionsResult,
      pendingResult,
      boxscoreResult
    ] =
      await Promise.allSettled(
        [
          seasonRequest,
          availableRequest,
          watchListRequest,
          transactionsRequest,
          pendingRequest,
          boxscoreRequest
        ]
      );


    const seasonData =
      seasonResult.status ===
      "fulfilled"
        ? seasonResult.value
        : {};

    if (
      seasonResult.status ===
      "rejected"
    ) {
      warnings.push(
        "NFL team metadata unavailable"
      );
    }


    const availableData =
      availableResult.status ===
      "fulfilled"
        ? availableResult.value
        : {};

    if (
      availableResult.status ===
      "rejected"
    ) {
      warnings.push(
        "Available players unavailable"
      );
    }


    const watchListData =
      watchListResult.status === "fulfilled"
        ? watchListResult.value
        : {};

    if (watchListResult.status === "rejected") {
      warnings.push("Live ESPN Watch List endpoint unavailable; stale fallback data is disabled");
    }


    const transactionsData =
      transactionsResult.status ===
      "fulfilled"
        ? transactionsResult.value
        : {};

    if (
      transactionsResult.status ===
      "rejected"
    ) {
      warnings.push(
        "Transactions unavailable"
      );
    }


    const pendingData =
      pendingResult.status ===
      "fulfilled"
        ? pendingResult.value
        : {};

    if (
      pendingResult.status ===
      "rejected"
    ) {
      warnings.push(
        "Pending transactions unavailable"
      );
    }


    const boxscoreData =
      boxscoreResult.status ===
      "fulfilled"
        ? boxscoreResult.value
        : {};

    if (
      boxscoreResult.status ===
      "rejected"
    ) {
      warnings.push(
        `Commish Report boxscore unavailable for Week ${reportWeek}`
      );
    }


    /*
      NORMALIZE ESPN DATA
    */

    const memberMap =
      buildMemberMap(
        core.members ||
        []
      );


    const proTeamMap =
      buildProTeamMap(
        seasonData
      );


    const teams =
      (
        core.teams ||
        []
      )
        .map(
          team =>
            normalizeTeam(
              team,
              memberMap,
              proTeamMap
            )
        )
        .sort(
          (a, b) =>
            a.teamId -
            b.teamId
        );


    const teamById =
      new Map(
        teams.map(
          team => [
            team.teamId,
            team
          ]
        )
      );


    /*
      FIND ZOO AUTOMATICALLY
    */

    const zooTeam =

      teams.find(
        team =>
          team.name
            .toLowerCase() ===
          ZOO_TEAM_NAME
            .toLowerCase()
      )

      ||

      teams.find(
        team =>
          team.name
            .toLowerCase()
            .includes(
              ZOO_TEAM_NAME
                .toLowerCase()
            )
      )

      ||

      null;


    const availablePlayers =
      normalizeAvailablePlayers(
        availableData,
        proTeamMap
      );


    // Resolve the authoritative IDs from Zoo's raw ESPN team object. A watched
    // player may not be available, so merge the dedicated ID lookup into the
    // normal player lookup rather than relying on the free-agent pool alone.
    const watchListPlayers =
      normalizeAvailablePlayers(
        watchListData,
        proTeamMap
      );

    const playerById =
      buildPlayerLookup(
        teams,
        [
          ...availablePlayers,
          ...watchListPlayers
        ]
      );

    const liveWatchIds = rawZooWatchIds;

    // No hard-coded, remembered, or inferred fallback. The current ESPN
    // team.watchList array is the single source of truth.
    const watchList = liveWatchIds
      .map(playerId => {
        const player = playerById.get(Number(playerId));
        if (!player) return null;
        return {
          ...player,
          found: true,
          watchListSource: "ESPN TEAM WATCHLIST"
        };
      })
      .filter(Boolean);

    const watchListMeta = {
      source: "ESPN TEAM WATCHLIST",
      requestStatus: watchListResult.status,
      rawTeamIdsFound: rawZooWatchIds.length,
      dedicatedResponsePlayerCount: Array.isArray(watchListData?.players)
        ? watchListData.players.length
        : 0,
      liveIdsFound: liveWatchIds.length,
      resolvedPlayers: watchList.length,
      staleFallbackUsed: false
    };

    if (!liveWatchIds.length) {
      warnings.push("Zoo's ESPN team currently returned an empty Watch List; stale fallback data is disabled");
    }

    if (watchListResult.status === "rejected") {
      warnings.push("ESPN Watch List player-detail lookup failed");
    }

    if (liveWatchIds.length && watchList.length !== liveWatchIds.length) {
      warnings.push(`ESPN Watch List contains ${liveWatchIds.length} IDs but only ${watchList.length} could be resolved to player data`);
    }

    /*
      NORMALIZE TRANSACTIONS
    */

    const transactions =
      (
        transactionsData
          .transactions ||
        []
      )
        .map(
          transaction =>
            normalizeTransaction(
              transaction,
              teamById,
              playerById
            )
        )
        .sort(
          (a, b) =>
            (
              b.processDate ||
              0
            ) -
            (
              a.processDate ||
              0
            )
        );


    const pendingTransactions =
      (
        pendingData
          .pendingTransactions ||
        []
      )
        .map(
          transaction =>
            normalizeTransaction(
              transaction,
              teamById,
              playerById
            )
        )
        .sort(
          (a, b) =>
            (
              b.processDate ||
              0
            ) -
            (
              a.processDate ||
              0
            )
        );


    /*
      CURRENT WEEK MATCHUPS
    */

    const liveSchedule =
      Array.isArray(boxscoreData?.schedule) && boxscoreData.schedule.length
        ? boxscoreData.schedule
        : (core.schedule || []);

    const matchups =
      normalizeMatchups(
        liveSchedule,
        matchupPeriodId,
        teamById
      );


    const zooMatchup =
      zooTeam

        ? matchups.find(
            matchup =>

              matchup.home
                ?.teamId ===
                zooTeam.teamId

              ||

              matchup.away
                ?.teamId ===
                zooTeam.teamId
          ) || null

        : null;


    const commishReport =
      buildCommishReport({
        boxscoreData,
        coreSchedule:
          core.schedule || [],
        teams,
        teamById,
        proTeamMap,
        reportWeek
      });


    /*
      RESPONSE MODE

      ?mode=health
      gives a small test response.

      Default gives full Zoo GM data.
    */

    const mode =
      String(
        event
          ?.queryStringParameters
          ?.mode ||
        "full"
      ).toLowerCase();


    const summary = {

      ok: true,

      requestId,

      source:
        "ESPN LFL",

      leagueId:
        Number(core.id),

      leagueName:
        core.name ||
        "LFL",

      seasonId:
        Number(
          core.seasonId ||
          SEASON_ID
        ),

      scoringPeriodId,

      matchupPeriodId,

      reportWeek,

      commishReportStatus:
        commishReport.status,

      teamCount:
        teams.length,

      rosteredPlayerCount:
        teams.reduce(
          (
            sum,
            team
          ) =>
            sum +
            team.roster.length,
          0
        ),

      availablePlayerCount:
        availablePlayers.length,

      watchListCount:
        watchList.length,

      watchListSource:
        watchListMeta.source,

      watchListRequestStatus:
        watchListMeta.requestStatus,

      transactionCount:
        transactions.length,

      pendingTransactionCount:
        pendingTransactions.length,

      zooTeamId:
        zooTeam
          ?.teamId ||
        null,

      zooRosterSize:
        zooTeam
          ?.roster
          .length ||
        0,

      warnings,

      generatedAt:
        new Date()
          .toISOString()
    };


    if (
      mode === "health" ||
      mode === "summary"
    ) {
      return jsonResponse(
        200,
        summary
      );
    }


    /*
      FULL ZOO GM SNAPSHOT
    */

    return jsonResponse(
      200,
      {

        ...summary,


        zoo:
          zooTeam
            ? {
                teamId:
                  zooTeam.teamId,

                name:
                  zooTeam.name,

                owners:
                  zooTeam.owners,

                roster:
                  zooTeam.roster,

                matchup:
                  zooMatchup
              }
            : null,


        teams,


        matchups,


        commishReport,


        availablePlayers,


        watchList,


        watchListMeta,


        transactions,


        pendingTransactions,


        leagueSettings: {

          name:
            core.name ||
            "LFL",

          size:
            core.settings
              ?.size ??
            teams.length,

          scoringType:
            core.settings
              ?.scoringSettings
              ?.scoringType ||
            null,

          matchupPeriodCount:
            core.settings
              ?.scheduleSettings
              ?.matchupPeriodCount ??
            null,

          playoffTeamCount:
            core.settings
              ?.scheduleSettings
              ?.playoffTeamCount ??
            null,

          lineupSlotCounts:
            core.settings
              ?.rosterSettings
              ?.lineupSlotCounts ||
            {}
        }
      }
    );

  } catch (error) {

    console.error(
      "Zoo GM ESPN sync error:",
      {
        message:
          error.message,

        status:
          error.status ||
          null,

        requestId
      }
    );


    const statusCode =
      Number(
        error.status
      ) === 401
        ? 401
        : 500;


    return jsonResponse(
      statusCode,
      {

        ok: false,

        requestId,

        error:
          Number(
            error.status
          ) === 401

            ? "ESPN authentication failed. The stored ESPN cookies may have expired."

            : error.message
      }
    );
  }
};
