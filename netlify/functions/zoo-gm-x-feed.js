
set -e

echo "=== ZOO GM PERMANENT UPDATE ==="

SOURCE="/tmp/zoo-gm-x-feed-final.js"
REPO="$(mktemp -d)/lean-luxury-site"

test -f "$SOURCE" || {
  echo "ERROR: Final backend file not found."
  exit 1
}

echo "Downloading current GitHub repository..."
git clone --depth 1 \
  https://github.com/ma3dtribe/lean-luxury-site.git \
  "$REPO"

cd "$REPO"

TARGET="netlify/functions/zoo-gm-x-feed.js"

test -f "$TARGET" || {
  echo "ERROR: Backend file not found in repository."
  exit 1
}

echo "Checking for unexpected GitHub changes..."

node - "$SOURCE" "$TARGET" <<'NODE'
const fs = require("fs");
const source = fs.readFileSync(process.argv[2], "utf8");
const current = fs.readFileSync(process.argv[3], "utf8");

const normalize = text => text.replace(/\r\n/g, "\n");

const original = "/tmp/zoo-gm-x-feed-test.js";

if (!fs.existsSync(original)) {
  console.error("STOP: Original comparison file missing.");
  process.exit(1);
}

const baseline = fs.readFileSync(original, "utf8");

if (normalize(current) !== normalize(baseline)) {
  console.error("STOP: GitHub backend differs from the original downloaded version.");
  console.error("No changes committed. Review differences before replacing.");
  process.exit(1);
}

if (!source.includes("function zooRankingName(") ||
    !source.includes("function loadZooByeTeams(") ||
    !source.includes("function zooIsTeamDefenseNews(")) {
  console.error("STOP: Final backend is missing a required fix.");
  process.exit(1);
}

console.log("PASS: GitHub baseline verified");
console.log("PASS: Required fixes present");
NODE

echo "Installing corrected backend..."
cp "$SOURCE" "$TARGET"

node --check "$TARGET"
git diff --check

echo "=== FILES BEING CHANGED ==="
git diff --stat

echo "=== CREATING ONE COMMIT ==="

git add "$TARGET"

git commit -m "Fix Zoo GM bye weeks, lineup alerts, D/ST news and Fairbairn rankings"

echo "=== PUSHING TO GITHUB ==="
git push

echo "=================================="
echo "ZOO GM UPDATE PUSHED SUCCESSFULLY"
echo "=================================="
