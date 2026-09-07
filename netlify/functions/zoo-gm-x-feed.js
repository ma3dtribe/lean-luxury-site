<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <meta
    name="robots"
    content="noindex,nofollow"
  >

  <title>Zoo GM | LFL Command Center</title>

  <style>
    :root {
      --bg: #080b10;
      --panel: #10151d;
      --panel2: #151c26;
      --border: #263142;
      --text: #f4f7fb;
      --muted: #93a0b2;
      --green: #55d187;
      --yellow: #ffd166;
      --red: #ff6b6b;
      --blue: #66aaff;
      --purple: #bd93f9;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    button,
    select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    .page {
      width: min(1500px, 100%);
      margin: 0 auto;
      padding: 24px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      margin-bottom: 18px;
    }

    .brand h1 {
      margin: 0;
      font-size: 32px;
      line-height: 1;
    }

    .brand p {
      margin: 7px 0 0;
      color: var(--muted);
      font-size: 13px;
    }

    .refresh-area {
      text-align: right;
    }

    .refresh-area button {
      border: 1px solid var(--border);
      background: var(--panel2);
      color: var(--text);
      padding: 10px 14px;
      border-radius: 8px;
      font-weight: 800;
    }

    .refresh-area button:hover {
      border-color: var(--green);
    }

    .refresh-area button:disabled {
      opacity: .55;
      cursor: wait;
    }

    #lastRefresh {
      display: block;
      margin-top: 6px;
      color: var(--muted);
      font-size: 11px;
    }

    .status {
      padding: 11px 13px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 9px;
      margin-bottom: 18px;
      color: var(--muted);
      font-size: 13px;
    }

    .error {
      color: var(--red);
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .summary-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
    }

    .summary-label {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .summary-number {
      margin-top: 5px;
      font-size: 25px;
      font-weight: 900;
    }

    .panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 18px;
    }

    .panel-header,
    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 13px 15px;
      border-bottom: 1px solid var(--border);
    }

    .panel-header h2,
    .panel-head h2 {
      margin: 0;
      font-size: 16px;
    }

    .panel-body {
      padding: 15px;
    }

    .news-time {
      color: var(--muted);
      font-size: 11px;
    }

    .brief-panel {
      border-color: #34445b;
    }

    .brief-headline {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 14px;
    }

    .brief-recommendation {
      margin-top: 4px;
      font-size: 22px;
      font-weight: 900;
    }

    .brief-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .brief-stat {
      background: var(--panel2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
    }

    .brief-stat strong {
      display: block;
      margin-top: 4px;
      font-size: 19px;
    }

    .brief-items {
      display: grid;
      gap: 9px;
    }

    .brief-item {
      background: var(--panel2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 11px;
    }

    .brief-item-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 6px;
    }

    .brief-category {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .4px;
    }

    .brief-text {
      font-size: 13px;
      line-height: 1.45;
    }

    .brief-meta {
      margin-top: 7px;
      color: var(--muted);
      font-size: 11px;
    }

    .main-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.55fr) minmax(330px, .8fr);
      gap: 18px;
    }

    .stack {
      display: grid;
      gap: 18px;
      align-content: start;
    }

    .stack .panel {
      margin-bottom: 0;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .filter {
      border: 1px solid var(--border);
      background: var(--panel2);
      color: var(--muted);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 800;
    }

    .filter.active {
      color: var(--text);
      border-color: var(--green);
    }

    .news-feed {
      display: grid;
      gap: 11px;
    }

    .news-card {
      background: var(--panel2);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 13px;
    }

    .news-card.act-now {
      border-color: var(--red);
    }

    .news-card.monitor {
      border-color: #806d31;
    }

    .news-card.zoo-impact {
      box-shadow: inset 3px 0 0 var(--green);
    }

    .news-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .news-author {
      font-weight: 900;
      font-size: 13px;
    }

    .news-text {
      line-height: 1.5;
      font-size: 13px;
      white-space: pre-line;
    }

    .news-text a {
      color: var(--blue);
    }

    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 9px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 4px 7px;
      font-size: 10px;
      font-weight: 900;
    }

    .badge.event {
      border-color: #58677b;
      color: #dce6f5;
    }

    .badge.source {
      border-color: #55466d;
      color: var(--purple);
    }

    .badge.zoo {
      border-color: #2f7650;
      color: var(--green);
    }

    .badge.available {
      border-color: #806d31;
      color: var(--yellow);
    }

    .badge.watch {
      border-color: #4c6996;
      color: var(--blue);
    }

    .badge.opponent {
      border-color: #805151;
      color: #ff9999;
    }

    .badge.indirect {
      border-color: #6c5f86;
      color: #d6b8ff;
    }

    .recommendation {
      margin-top: 9px;
      font-size: 11px;
      font-weight: 900;
    }

    .meters {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-top: 10px;
    }

    .meter {
      min-width: 0;
    }

    .meter-label {
      display: flex;
      justify-content: space-between;
      gap: 5px;
      color: var(--muted);
      font-size: 9px;
      margin-bottom: 3px;
    }

    .meter-track {
      height: 5px;
      background: #242d39;
      border-radius: 999px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      width: 0;
      background: currentColor;
    }

    .meter.overall {
      color: var(--text);
    }

    .meter.fantasy {
      color: var(--purple);
    }

    .meter.zoo {
      color: var(--green);
    }

    .meter.available {
      color: var(--yellow);
    }

    .meter.watch {
      color: var(--blue);
    }

    .meter.opponent {
      color: var(--red);
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th,
    td {
      padding: 9px 8px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      white-space: nowrap;
    }

    th {
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .4px;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .starter {
      color: var(--green);
    }

    .bench {
      color: var(--muted);
    }

    .ir {
      color: var(--red);
    }

    .matchup {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
      text-align: center;
    }

    .team-name {
      font-weight: 900;
      font-size: 15px;
    }

    .vs {
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
    }

    .empty {
      color: var(--muted);
      font-size: 12px;
      padding: 8px 0;
    }

    .commish-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .commish-controls select {
      background: var(--panel2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 5px 8px;
    }

    .commish-status {
      color: var(--muted);
      font-size: 11px;
      font-weight: 900;
    }

    .commish-awards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }

    .commish-award {
      background: var(--panel2);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 13px;
    }

    .commish-award-title {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .5px;
      margin-bottom: 7px;
    }

    .commish-award-name {
      font-size: 17px;
      font-weight: 900;
      line-height: 1.25;
    }

    .commish-award-detail {
      color: var(--muted);
      font-size: 12px;
      margin-top: 5px;
    }

    .commish-note {
      color: var(--yellow);
      font-size: 12px;
      margin-bottom: 14px;
    }

    .footer {
      text-align: center;
      color: var(--muted);
      font-size: 11px;
      padding: 4px 0 20px;
    }

    @media (max-width: 1050px) {
      .summary-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .main-grid {
        grid-template-columns: 1fr;
      }

      .brief-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .commish-awards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 650px) {
      .page {
        padding: 14px;
      }

      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .refresh-area {
        text-align: left;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .brief-grid {
        grid-template-columns: 1fr;
      }

      .commish-awards {
        grid-template-columns: 1fr;
      }

      .brand h1 {
        font-size: 26px;
      }

      .meters {
        grid-template-columns: repeat(3, 1fr);
      }

      .brief-headline {
        flex-direction: column;
      }
    }
  </style>
</head>

<body>

<div class="page">

  <div class="topbar">
    <div class="brand">
      <h1>🦁 ZOO GM</h1>
      <p>LFL Fantasy Football Command Center</p>
    </div>

    <div class="refresh-area">
      <button onclick="loadZooGM()">
        Refresh Intelligence
      </button>

      <span id="lastRefresh">
        Waiting for data...
      </span>
    </div>
  </div>

  <div id="status" class="status">
    Connecting to Zoo GM intelligence...
  </div>

  <div class="summary-grid">

    <div class="summary-card">
      <div class="summary-label">Zoo Players</div>
      <div class="summary-number" id="zooRosterCount">—</div>
    </div>

    <div class="summary-card">
      <div class="summary-label">Relevant</div>
      <div class="summary-number" id="availableCount">—</div>
    </div>

    <div class="summary-card">
      <div class="summary-label">X Posts</div>
      <div class="summary-number" id="postsCount">—</div>
    </div>

    <div class="summary-card">
      <div class="summary-label">Noise Hidden</div>
      <div class="summary-number" id="zooNewsCount">—</div>
    </div>

    <div class="summary-card">
      <div class="summary-label">Available Opps</div>
      <div class="summary-number" id="availableNewsCount">—</div>
    </div>

    <div class="summary-card">
      <div class="summary-label">Act Now</div>
      <div class="summary-number" id="urgentCount">—</div>
    </div>

  </div>

  <section class="panel brief-panel">

    <div class="panel-header">
      <h2>Zoo GM Brief</h2>
      <span class="news-time">Relevance first</span>
    </div>

    <div class="panel-body">

      <div class="brief-headline">
        <div>
          <div class="summary-label">GM Recommendation</div>
          <div class="brief-recommendation" id="gmRecommendation">
            Loading...
          </div>
        </div>

        <div class="news-time" id="briefLine">
          Analyzing the latest fantasy activity...
        </div>
      </div>

      <div class="brief-grid">

        <div class="brief-stat">
          <div class="summary-label">Relevant</div>
          <strong id="briefRelevant">—</strong>
        </div>

        <div class="brief-stat">
          <div class="summary-label">Noise Hidden</div>
          <strong id="briefNoise">—</strong>
        </div>

        <div class="brief-stat">
          <div class="summary-label">Act Now</div>
          <strong id="briefActNow">—</strong>
        </div>

        <div class="brief-stat">
          <div class="summary-label">Available Opps</div>
          <strong id="briefAvailable">—</strong>
        </div>

        <div class="brief-stat">
          <div class="summary-label">Zoo Impact</div>
          <strong id="briefZoo">—</strong>
        </div>

      </div>

      <div class="brief-items" id="briefItems">
        <div class="empty">Building Zoo GM Brief...</div>
      </div>

    </div>

  </section>

  <div class="main-grid">

    <main>

      <section class="panel">

        <div class="panel-header">
          <h2>Live Intelligence</h2>

          <div class="filters">

            <button
              class="filter active"
              data-filter="relevant"
            >
              Relevant
            </button>

            <button
              class="filter"
              data-filter="act"
            >
              Act Now
            </button>

            <button
              class="filter"
              data-filter="zoo"
            >
              Zoo
            </button>

            <button
              class="filter"
              data-filter="available"
            >
              Available
            </button>

            <button
              class="filter"
              data-filter="watch"
            >
              Watch List
            </button>

            <button
              class="filter"
              data-filter="opponent"
            >
              Opponent
            </button>

            <button
              class="filter"
              data-filter="all"
            >
              All
            </button>

          </div>
        </div>

        <div class="panel-body">
          <div class="news-feed" id="newsFeed">
            <div class="empty">
              Loading intelligence...
            </div>
          </div>
        </div>

      </section>

    </main>

    <aside class="stack">

      <section class="panel">

        <div class="panel-head">
          <h2>This Week</h2>
          <span id="matchupPeriod">Current matchup</span>
        </div>

        <div class="panel-body">
          <div id="matchupBox">
            <div class="empty">
              Loading matchup...
            </div>
          </div>
        </div>

      </section>

      <section class="panel">

        <div class="panel-head">
          <h2>Zoo Roster</h2>
          <span>Live from ESPN</span>
        </div>

        <div class="panel-body table-wrap">

          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>NFL</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody id="rosterBody">
              <tr>
                <td colspan="4">Loading...</td>
              </tr>
            </tbody>
          </table>

        </div>

      </section>

      <section class="panel">

        <div class="panel-head">
          <h2>Watch List</h2>
          <span id="watchCount">—</span>
        </div>

        <div class="panel-body table-wrap">

          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>Priority</th>
              </tr>
            </thead>

            <tbody id="watchBody">
              <tr>
                <td colspan="3">Loading...</td>
              </tr>
            </tbody>
          </table>

        </div>

      </section>

    </aside>

  </div>

  <!-- COMMISH REPORT MOVED TO BOTTOM -->

  <section class="panel" style="margin-top:18px;">

    <div class="panel-header">
      <h2>Commish Report</h2>

      <div class="commish-controls">
        <label
          for="commishWeek"
          class="news-time"
        >
          Week
        </label>

        <select
          id="commishWeek"
          aria-label="Commish Report Week"
        ></select>

        <span
          id="commishStatus"
          class="commish-status"
        >
          Loading...
        </span>
      </div>
    </div>

    <div class="panel-body">

      <div
        id="commishNote"
        class="commish-note"
        style="display:none;"
      ></div>

      <div class="commish-awards">

        <div class="commish-award">
          <div class="commish-award-title">
            🏆 Offensive Player of the Week
          </div>

          <div
            class="commish-award-name"
            id="offensivePOTW"
          >
            —
          </div>

          <div
            class="commish-award-detail"
            id="offensivePOTWDetail"
          >
            —
          </div>
        </div>

        <div class="commish-award">
          <div class="commish-award-title">
            🛡️ Defensive Player of the Week
          </div>

          <div
            class="commish-award-name"
            id="defensivePOTW"
          >
            —
          </div>

          <div
            class="commish-award-detail"
            id="defensivePOTWDetail"
          >
            —
          </div>
        </div>

        <div class="commish-award">
          <div class="commish-award-title">
            💰 Cash Money Team
          </div>

          <div
            class="commish-award-name"
            id="cashMoneyTeam"
          >
            —
          </div>

          <div
            class="commish-award-detail"
            id="cashMoneyDetail"
          >
            —
          </div>
        </div>

        <div class="commish-award">
          <div class="commish-award-title">
            🗑️ Garbage Team
          </div>

          <div
            class="commish-award-name"
            id="garbageTeam"
          >
            —
          </div>

          <div
            class="commish-award-detail"
            id="garbageDetail"
          >
            —
          </div>
        </div>

      </div>

      <div
        class="summary-label"
        style="margin-bottom:8px;"
      >
        Power Rankings · Wins, then Points For
      </div>

      <div class="table-wrap">

        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Record</th>
              <th>PF</th>
            </tr>
          </thead>

          <tbody id="powerRankingsBody">
            <tr>
              <td colspan="4">Loading...</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>

  </section>

  <div class="footer" id="updatedAt">
    Zoo GM
  </div>

</div>

<script>
  const ESPN_URL =
    "/.netlify/functions/zoo-gm-espn";

  const X_URL =
    "/.netlify/functions/zoo-gm-x-feed";

  let espnData = null;
  let xData = null;

  let activeFilter =
    "relevant";

  let selectedReportWeek =
    1;

  const esc = value =>
    String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  function cacheBust(
    url
  ) {
    const separator =
      url.includes("?")
        ? "&"
        : "?";

    return (
      `${url}${separator}` +
      `_zgm=${Date.now()}`
    );
  }

  function getEspnUrl() {
    return cacheBust(
      `${ESPN_URL}?reportWeek=${encodeURIComponent(
        selectedReportWeek
      )}`
    );
  }

  function getXUrl() {
    return cacheBust(
      X_URL
    );
  }

  function fmtDate(
    value
  ) {
    if (!value) {
      return "";
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      [],
      {
        month:
          "short",

        day:
          "numeric",

        hour:
          "numeric",

        minute:
          "2-digit"
      }
    );
  }

  function maxScore(
    post
  ) {
    const intelligence =
      post.intelligence ||
      {};

    return Math.max(
      Number(
        intelligence
          .fantasyRelevance ||
        0
      ),

      Number(
        intelligence
          .zooRelevance ||
        0
      ),

      Number(
        intelligence
          .watchRelevance ||
        0
      ),

      Number(
        intelligence
          .availableRelevance ||
        0
      ),

      Number(
        intelligence
          .opponentRelevance ||
        0
      )
    );
  }

  function meter(
    label,
    value,
    className
  ) {
    const score =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            value ||
            0
          )
        )
      );

    return `
      <div class="meter ${esc(className)}">

        <div class="meter-label">
          <span>${esc(label)}</span>
          <span>${score}</span>
        </div>

        <div class="meter-track">
          <div
            class="meter-fill"
            style="width:${score}%"
          ></div>
        </div>

      </div>
    `;
  }

  function renderSummary() {
    const summary =
      xData?.summary ||
      {};

    const brief =
      xData?.brief ||
      {};

    document.getElementById(
      "zooRosterCount"
    ).textContent =
      summary.zooRosterLoaded ??
      espnData?.zooRosterSize ??
      "—";

    document.getElementById(
      "availableCount"
    ).textContent =
      summary.relevantPosts ??
      brief.relevantPosts ??
      "—";

    document.getElementById(
      "postsCount"
    ).textContent =
      summary.postsReviewed ??
      "—";

    document.getElementById(
      "zooNewsCount"
    ).textContent =
      summary.noisePosts ??
      brief.noisePosts ??
      "—";

    document.getElementById(
      "availableNewsCount"
    ).textContent =
      brief.availableOpportunityCount ??
      summary.availablePlayerRelevant ??
      "—";

    document.getElementById(
      "urgentCount"
    ).textContent =
      summary.actNow ??
      brief.actNowCount ??
      "—";
  }

  function renderBrief() {
    const brief =
      xData?.brief ||
      {};

    document.getElementById(
      "gmRecommendation"
    ).textContent =
      brief.recommendation ||
      "HOLD";

    document.getElementById(
      "briefRelevant"
    ).textContent =
      brief.relevantPosts ??
      "—";

    document.getElementById(
      "briefNoise"
    ).textContent =
      brief.noisePosts ??
      "—";

    document.getElementById(
      "briefActNow"
    ).textContent =
      brief.actNowCount ??
      "—";

    document.getElementById(
      "briefAvailable"
    ).textContent =
      brief.availableOpportunityCount ??
      "—";

    document.getElementById(
      "briefZoo"
    ).textContent =
      brief.zooImpactCount ??
      "—";

    document.getElementById(
      "briefLine"
    ).textContent =
      "Best actionable intelligence from the latest X feed.";

    const items =
      brief.topItems ||
      [];

    const container =
      document.getElementById(
        "briefItems"
      );

    if (
      !items.length
    ) {
      container.innerHTML =
        `<div class="empty">
          No actionable intelligence right now.
        </div>`;

      return;
    }

    container.innerHTML =
      items
        .slice(
          0,
          8
        )
        .map(
          item => {
            const event =
              item.primaryEvent ||
              "";

            const source =
              item.sourceAuthority
                ?.tier ||
              "";

            const context =
              (
                item.contextImpact ||
                []
              )
                .map(
                  player =>
                    player.name
                )
                .filter(
                  Boolean
                );

            return `
              <div class="brief-item">

                <div class="brief-item-top">

                  <span class="brief-category">
                    ${esc(
                      item.primaryCategory ||
                      item.actionTier ||
                      "INTELLIGENCE"
                    )}
                  </span>

                  <span class="news-time">
                    ${esc(
                      fmtDate(
                        item.publishedAt
                      )
                    )}
                  </span>

                </div>

                <div class="brief-text">
                  ${esc(
                    item.text ||
                    ""
                  )}
                </div>

                <div class="brief-meta">

                  ${esc(
                    item.author ||
                    ""
                  )}

                  ${
                    event
                      ? ` · ${esc(event)}`
                      : ""
                  }

                  ${
                    source
                      ? ` · ${esc(source)}`
                      : ""
                  }

                  ${
                    context.length
                      ? ` · Context: ${esc(
                          context.join(
                            ", "
                          )
                        )}`
                      : ""
                  }

                  ${
                    item.recommendation
                      ? ` · ${esc(
                          item.recommendation
                        )}`
                      : ""
                  }

                  · Score ${esc(
                    item.maxRelevance ??
                    0
                  )}

                </div>

              </div>
            `;
          }
        )
        .join("");
  }

  function postPassesFilter(
    post
  ) {
    const i =
      post.intelligence ||
      {};

    if (
      activeFilter ===
      "all"
    ) {
      return true;
    }

    if (
      activeFilter ===
      "relevant"
    ) {
      return (
        i.actionTier !==
        "NOISE"
      );
    }

    if (
      activeFilter ===
      "act"
    ) {
      return (
        i.actionTier ===
        "ACT NOW"
      );
    }

    if (
      activeFilter ===
      "zoo"
    ) {
      return Boolean(
        i.zooImpact
      );
    }

    if (
      activeFilter ===
      "available"
    ) {
      return Boolean(
        i.availablePlayerImpact
      );
    }

    if (
      activeFilter ===
      "watch"
    ) {
      return Boolean(
        i.watchListImpact
      );
    }

    if (
      activeFilter ===
      "opponent"
    ) {
      return Boolean(
        i.opponentImpact
      );
    }

    return true;
  }

  function renderNews() {
    const posts =
      [
        ...(
          xData?.posts ||
          []
        )
      ]
        .sort(
          (
            a,
            b
          ) =>
            (
              new Date(
                b.publishedAt
              ).getTime() ||
              0
            ) -
            (
              new Date(
                a.publishedAt
              ).getTime() ||
              0
            )
        )
        .filter(
          postPassesFilter
        );

    const container =
      document.getElementById(
        "newsFeed"
      );

    if (
      !posts.length
    ) {
      container.innerHTML =
        `<div class="empty">
          No posts match this filter.
        </div>`;

      return;
    }

    container.innerHTML =
      posts
        .map(
          post => {
            const i =
              post.intelligence ||
              {};

            const score =
              maxScore(
                post
              );

            const classes = [
              "news-card"
            ];

            if (
              i.actionTier ===
              "ACT NOW"
            ) {
              classes.push(
                "act-now"
              );
            }

            if (
              i.actionTier ===
              "MONITOR"
            ) {
              classes.push(
                "monitor"
              );
            }

            if (
              i.zooImpact
            ) {
              classes.push(
                "zoo-impact"
              );
            }

            const badges =
              [];

            if (
              i.primaryEvent &&
              i.primaryEvent !==
                "GENERAL_NEWS"
            ) {
              badges.push(
                `<span class="badge event">
                  ${esc(
                    i.primaryEvent
                  )}
                </span>`
              );
            }

            if (
              i.sourceAuthority
                ?.tier
            ) {
              badges.push(
                `<span class="badge source">
                  ${esc(
                    i.sourceAuthority
                      .tier
                  )}
                </span>`
              );
            }

            if (
              i.zooImpact
            ) {
              badges.push(
                `<span class="badge zoo">
                  ZOO
                </span>`
              );
            }

            if (
              i.indirectZooImpact
            ) {
              badges.push(
                `<span class="badge indirect">
                  INDIRECT ZOO IMPACT
                </span>`
              );
            }

            if (
              i.availablePlayerImpact
            ) {
              badges.push(
                `<span class="badge available">
                  AVAILABLE
                </span>`
              );
            }

            if (
              i.watchListImpact
            ) {
              badges.push(
                `<span class="badge watch">
                  WATCH LIST
                </span>`
              );
            }

            if (
              i.opponentImpact
            ) {
              badges.push(
                `<span class="badge opponent">
                  OPPONENT
                </span>`
              );
            }

            const directPlayers =
              (
                i.players ||
                []
              )
                .map(
                  player =>
                    player.name
                )
                .filter(
                  Boolean
                );

            const contextPlayers =
              (
                i.contextImpact ||
                []
              )
                .map(
                  player =>
                    `${player.name}${
                      player.contextReason
                        ? ` (${player.contextReason})`
                        : ""
                    }`
                )
                .filter(
                  Boolean
                );

            return `
              <article class="${classes.join(" ")}">

                <div class="news-top">

                  <div>
                    <div class="news-author">
                      ${esc(
                        post.author ||
                        post.handle ||
                        "X"
                      )}
                    </div>

                    <div class="news-time">
                      ${esc(
                        fmtDate(
                          post.publishedAt
                        )
                      )}
                    </div>
                  </div>

                  <div class="news-time">
                    ${esc(
                      i.primaryCategory ||
                      ""
                    )}
                    · ${score}
                  </div>

                </div>

                <div class="news-text">
                  ${esc(
                    post.text ||
                    post.title ||
                    ""
                  )}
                </div>

                ${
                  badges.length
                    ? `
                      <div class="badges">
                        ${badges.join("")}
                      </div>
                    `
                    : ""
                }

                ${
                  directPlayers.length
                    ? `
                      <div class="brief-meta">
                        Direct: ${esc(
                          directPlayers.join(
                            ", "
                          )
                        )}
                      </div>
                    `
                    : ""
                }

                ${
                  contextPlayers.length
                    ? `
                      <div class="brief-meta">
                        Context impact: ${esc(
                          contextPlayers.join(
                            ", "
                          )
                        )}
                      </div>
                    `
                    : ""
                }

                <div class="recommendation">
                  ${esc(
                    i.actionTier ||
                    "NOISE"
                  )}
                  ·
                  ${esc(
                    i.recommendation ||
                    "HOLD"
                  )}
                </div>

                <div class="meters">

                  ${meter(
                    "Overall",
                    score,
                    "overall"
                  )}

                  ${meter(
                    "Fantasy",
                    i.fantasyRelevance,
                    "fantasy"
                  )}

                  ${meter(
                    "Zoo",
                    i.zooRelevance,
                    "zoo"
                  )}

                  ${meter(
                    "Available",
                    i.availableRelevance,
                    "available"
                  )}

                  ${meter(
                    "Watch",
                    i.watchRelevance,
                    "watch"
                  )}

                  ${meter(
                    "Opponent",
                    i.opponentRelevance,
                    "opponent"
                  )}

                </div>

              </article>
            `;
          }
        )
        .join("");
  }

  function rosterStatusClass(
    status
  ) {
    const value =
      String(
        status ||
        ""
      ).toUpperCase();

    if (
      value.includes(
        "START"
      )
    ) {
      return "starter";
    }

    if (
      value.includes(
        "IR"
      )
    ) {
      return "ir";
    }

    return "bench";
  }

  function renderRoster() {
    const roster =
      espnData?.zoo?.roster ||
      espnData?.zooRoster ||
      [];

    const body =
      document.getElementById(
        "rosterBody"
      );

    if (
      !roster.length
    ) {
      body.innerHTML =
        `<tr>
          <td colspan="4">
            No Zoo roster data.
          </td>
        </tr>`;

      return;
    }

    body.innerHTML =
      roster
        .map(
          player => {
            const status =
              player.rosterStatus ||
              player.lineupStatus ||
              player.lineupSlot ||
              "";

            return `
              <tr>

                <td>
                  <strong>
                    ${esc(
                      player.name
                    )}
                  </strong>
                </td>

                <td>
                  ${esc(
                    player.position ||
                    ""
                  )}
                </td>

                <td>
                  ${esc(
                    player.nflTeam ||
                    ""
                  )}
                </td>

                <td class="${rosterStatusClass(status)}">
                  ${esc(
                    status
                  )}
                </td>

              </tr>
            `;
          }
        )
        .join("");
  }

  function renderWatchList() {
    const watchList =
      xData?.watchList ||
      espnData?.watchList ||
      [];

    document.getElementById(
      "watchCount"
    ).textContent =
      watchList.length;

    const body =
      document.getElementById(
        "watchBody"
      );

    if (
      !watchList.length
    ) {
      body.innerHTML =
        `<tr>
          <td colspan="3">
            No Watch List players.
          </td>
        </tr>`;

      return;
    }

    body.innerHTML =
      watchList
        .map(
          player => `
            <tr>

              <td>
                <strong>
                  ${esc(
                    player.name
                  )}
                </strong>
              </td>

              <td>
                ${esc(
                  player.position ||
                  ""
                )}
              </td>

              <td>
                ${esc(
                  player.priority ||
                  ""
                )}
              </td>

            </tr>
          `
        )
        .join("");
  }

  function renderMatchup() {
    const zooId =
      Number(
        espnData?.zooTeamId ??
        espnData?.zoo?.teamId
      );

    let current =
      null;

    for (
      const matchup
      of espnData?.matchups ||
      []
    ) {
      const homeId =
        Number(
          matchup.home?.teamId
        );

      const awayId =
        Number(
          matchup.away?.teamId
        );

      if (
        homeId === zooId ||
        awayId === zooId
      ) {
        current =
          matchup;

        break;
      }
    }

    document.getElementById(
      "matchupPeriod"
    ).textContent =
      espnData?.matchupPeriodId
        ? `Matchup ${espnData.matchupPeriodId}`
        : "Current matchup";

    const container =
      document.getElementById(
        "matchupBox"
      );

    if (
      !current
    ) {
      container.innerHTML =
        `<div class="empty">
          No current matchup found.
        </div>`;

      return;
    }

    const home =
      current.home ||
      {};

    const away =
      current.away ||
      {};

    container.innerHTML = `

      <div class="matchup">

        <div>

          <div class="team-name">
            ${esc(
              home.teamName ||
              home.name ||
              "Home"
            )}
          </div>

          <div class="news-time">
            ${esc(
              home.totalPoints ??
              home.score ??
              0
            )} pts
          </div>

        </div>

        <div class="vs">
          VS
        </div>

        <div>

          <div class="team-name">
            ${esc(
              away.teamName ||
              away.name ||
              "Away"
            )}
          </div>

          <div class="news-time">
            ${esc(
              away.totalPoints ??
              away.score ??
              0
            )} pts
          </div>

        </div>

      </div>
    `;
  }

  function populateCommishWeeks() {
    const select =
      document.getElementById(
        "commishWeek"
      );

    const currentWeek =
      Math.max(
        1,
        Number(
          espnData?.matchupPeriodId ||
          espnData?.scoringPeriodId ||
          1
        )
      );

    if (
      selectedReportWeek >
      currentWeek
    ) {
      selectedReportWeek =
        currentWeek;
    }

    const options =
      [];

    for (
      let week = 1;
      week <= currentWeek;
      week += 1
    ) {
      options.push(
        `<option
          value="${week}"
          ${
            week ===
            selectedReportWeek
              ? "selected"
              : ""
          }
        >
          Week ${week}
        </option>`
      );
    }

    select.innerHTML =
      options.join("");
  }

  function renderCommishReport() {
    populateCommishWeeks();

    const report =
      espnData?.commishReport ||
      {};

    const status =
      report.status ||
      espnData?.commishReportStatus ||
      "NO_DATA";

    document.getElementById(
      "commishStatus"
    ).textContent =
      status.replace(
        /_/g,
        " "
      );

    const note =
      document.getElementById(
        "commishNote"
      );

    if (
      status !== "FINAL"
    ) {
      note.style.display =
        "block";

      note.textContent =
        status ===
        "NO_DATA"
          ? "Awaiting Week results."
          : "Week is still in progress. Results below are provisional.";
    } else {
      note.style.display =
        "none";

      note.textContent =
        "";
    }

    const offense =
      report.offensivePlayerOfWeek ||
      null;

    const defense =
      report.defensivePlayerOfWeek ||
      null;

    document.getElementById(
      "offensivePOTW"
    ).textContent =
      offense?.name ||
      "—";

    document.getElementById(
      "offensivePOTWDetail"
    ).textContent =
      offense
        ? `${offense.position || ""} · ${
            offense.lflTeam ||
            offense.teamName ||
            ""
          } · ${Number(
            offense.points ||
            offense.score ||
            0
          ).toFixed(2)} pts`
        : "No qualifying player yet";

    document.getElementById(
      "defensivePOTW"
    ).textContent =
      defense?.name ||
      "—";

    document.getElementById(
      "defensivePOTWDetail"
    ).textContent =
      defense
        ? `${defense.position || ""} · ${
            defense.lflTeam ||
            defense.teamName ||
            ""
          } · ${Number(
            defense.points ||
            defense.score ||
            0
          ).toFixed(2)} pts`
        : "No qualifying player yet";

    const cash =
      report.cashMoneyTeam ||
      null;

    const garbage =
      report.garbageTeam ||
      null;

    document.getElementById(
      "cashMoneyTeam"
    ).textContent =
      cash?.teamName ||
      cash?.name ||
      "—";

    document.getElementById(
      "cashMoneyDetail"
    ).textContent =
      cash
        ? `${Number(
            cash.points ??
            cash.score ??
            0
          ).toFixed(2)} pts`
        : "Awaiting scores";

    document.getElementById(
      "garbageTeam"
    ).textContent =
      garbage?.teamName ||
      garbage?.name ||
      "—";

    document.getElementById(
      "garbageDetail"
    ).textContent =
      garbage
        ? `${Number(
            garbage.points ??
            garbage.score ??
            0
          ).toFixed(2)} pts`
        : "Awaiting scores";

    const rankings =
      report.powerRankings ||
      [];

    const body =
      document.getElementById(
        "powerRankingsBody"
      );

    if (
      !rankings.length
    ) {
      body.innerHTML =
        `<tr>
          <td colspan="4">
            No rankings available.
          </td>
        </tr>`;

      return;
    }

    body.innerHTML =
      rankings
        .map(
          (
            team,
            index
          ) => {
            const wins =
              team.wins ??
              team.record?.wins ??
              0;

            const losses =
              team.losses ??
              team.record?.losses ??
              0;

            const ties =
              team.ties ??
              team.record?.ties ??
              0;

            const record =
              ties
                ? `${wins}-${losses}-${ties}`
                : `${wins}-${losses}`;

            return `
              <tr>

                <td>
                  ${esc(
                    team.rank ??
                    index + 1
                  )}
                </td>

                <td>
                  <strong>
                    ${esc(
                      team.teamName ||
                      team.name ||
                      ""
                    )}
                  </strong>
                </td>

                <td>
                  ${esc(record)}
                </td>

                <td>
                  ${Number(
                    team.pointsFor ??
                    team.pf ??
                    0
                  ).toFixed(2)}
                </td>

              </tr>
            `;
          }
        )
        .join("");
  }

  function renderAll() {
    renderSummary();
    renderBrief();
    renderNews();
    renderRoster();
    renderWatchList();
    renderMatchup();
    renderCommishReport();

    document.getElementById(
      "updatedAt"
    ).textContent =
      `Last refreshed ${new Date().toLocaleString()}`;
  }

  async function loadZooGM() {
    const status =
      document.getElementById(
        "status"
      );

    const refreshButton =
      document.querySelector(
        ".refresh-area button"
      );

    status.textContent =
      "Refreshing ESPN and X intelligence...";

    refreshButton.disabled =
      true;

    try {
      const [
        espnResponse,
        xResponse
      ] =
        await Promise.all([
          fetch(
            getEspnUrl(),
            {
              cache:
                "no-store",

              headers: {
                "Cache-Control":
                  "no-cache"
              }
            }
          ),

          fetch(
            getXUrl(),
            {
              cache:
                "no-store",

              headers: {
                "Cache-Control":
                  "no-cache"
              }
            }
          )
        ]);

      const [
        espn,
        x
      ] =
        await Promise.all([
          espnResponse.json(),
          xResponse.json()
        ]);

      if (
        !espnResponse.ok ||
        !espn.ok
      ) {
        throw new Error(
          espn.error ||
          `ESPN request failed (${espnResponse.status})`
        );
      }

      if (
        !xResponse.ok ||
        !x.ok
      ) {
        throw new Error(
          x.detail ||
          x.error ||
          `X feed request failed (${xResponse.status})`
        );
      }

      espnData =
        espn;

      xData =
        x;

      renderAll();

      status.innerHTML =
        `🟢 Zoo GM Live · ${esc(
          espn.league ||
          espn.leagueName ||
          "LFL"
        )} · ${esc(
          x.summary?.postsReviewed ??
          0
        )} X posts analyzed`;

      document.getElementById(
        "lastRefresh"
      ).textContent =
        `Last refreshed ${new Date().toLocaleTimeString()}`;

    } catch (
      error
    ) {
      console.error(
        error
      );

      status.innerHTML =
        `<span class="error">
          Zoo GM connection error:
          ${esc(error.message)}
        </span>`;

      document.getElementById(
        "newsFeed"
      ).innerHTML =
        `<div class="error">
          Unable to load intelligence:
          ${esc(error.message)}
        </div>`;

    } finally {
      refreshButton.disabled =
        false;
    }
  }

  document
    .getElementById(
      "commishWeek"
    )
    .addEventListener(
      "change",
      event => {
        selectedReportWeek =
          Number(
            event.target.value ||
            1
          );

        loadZooGM();
      }
    );

  document
    .querySelectorAll(
      ".filter"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            document
              .querySelectorAll(
                ".filter"
              )
              .forEach(
                item =>
                  item.classList.remove(
                    "active"
                  )
              );

            button.classList.add(
              "active"
            );

            activeFilter =
              button.dataset.filter ||
              "all";

            renderNews();
          }
        );
      }
    );

  loadZooGM();

  setInterval(
    loadZooGM,
    5 * 60 * 1000
  );
</script>

</body>
</html>
