const SEASON_ID = 2026;
const LEAGUE_ID = 261539;
const ZOO_TEAM_NAME = process.env.ZOO_TEAM_NAME || "Zoo";

const ESPN_WATCH_LIST_IDS = [
  4870795,
  4567104,
  4569603,
  3127273,
  4954445,
  4685248,
  4869645,
  4905664,
  4362249,
  3929846,
  4034790,
  4870998,
  17372,
  4702555,
  4043169,
  4035232,
  4431005,
  4870805,
  4869461,
  4683813,
  3919512,
  4676004,
  3917853,
  4596334,
  3150744,
  4832800,
  4688813,
  3916433,
  4696044,
  3054850,
  4426350,
  3926229,
  4683062,
  4431664,
  4433975,
  4361652,
  4685617,
  5081397,
  4034949,
  4361529,
  4710714,
  5083315,
  4880281
];
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


async function fetchJson(
  url,
  {
    cookieHeader,
    fantasyFilter
  } = {}
) {
  const headers = {
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 ZooGM/1.0"
  };

  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  if (fantasyFilter) {
    headers["X-Fantasy-Filter"] =
      JSON.stringify(fantasyFilter);
  }

  const response = await fetch(url, {
    headers
  });

  const text = await response.text();

  if (!response.ok) {
    const error = new Error(
      `ESPN request failed with status ${response.status}`
    );

    error.status = response.status;
    error.body = text.slice(0, 500);

    throw error;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "ESPN returned a non-JSON response"
    );
  }
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

    position:
      POSITION_BY_ID[
        defaultPositionId
      ] ||
      `POS-${defaultPositionId}`,

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

    eligibleSlots:
      Array.isArray(
        player.eligibleSlots
      )
        ? player.eligibleSlots
        : []
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


    const warnings = [];


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
      transactionsResult,
      pendingResult
    ] =
      await Promise.allSettled(
        [
          seasonRequest,
          availableRequest,
          transactionsRequest,
          pendingRequest
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


    const playerById =
      buildPlayerLookup(
        teams,
        availablePlayers
      );

    const watchList =
  ESPN_WATCH_LIST_IDS
    .map(playerId => {
      const player =
        playerById.get(
          Number(playerId)
        );

      if (!player) {
        return {
          playerId: Number(playerId),
          name: `Player ${playerId}`,
          position: "",
          nflTeam: "",
          found: false
        };
      }

      return {
        ...player,
        found: true
      };
    });
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

    const matchups =
      normalizeMatchups(
        core.schedule ||
        [],
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


        availablePlayers,


watchList,


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
