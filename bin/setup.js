#!/usr/bin/env node
// claude-blip setup - one command, done.
//
// Usage:
//   npx claude-blip              (global - recommended)
//   npx claude-blip --project    (this project, shareable)
//   npx claude-blip --local      (this project, gitignored)
//   npx claude-blip --uninstall  (remove from all scopes)

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOOK_SOURCE = path.resolve(__dirname, "..", "statusline.js");

const SCOPES = {
  global: () => path.join(os.homedir(), ".claude", "settings.json"),
  project: () => path.join(process.cwd(), ".claude", "settings.json"),
  local: () => path.join(process.cwd(), ".claude", "settings.local.json"),
};

const args = process.argv.slice(2);
const uninstall = args.includes("--uninstall");
const scope = args.includes("--project")
  ? "project"
  : args.includes("--local")
    ? "local"
    : "global";

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function log(msg) {
  console.log(`  ${msg}`);
}

function getInstallDir() {
  if (scope === "global") {
    return path.join(os.homedir(), ".claude", "hooks");
  }
  return path.join(process.cwd(), ".claude", "hooks");
}

function install() {
  const installDir = getInstallDir();
  const dest = path.join(installDir, "statusline.js");
  const settingsPath = SCOPES[scope]();
  const settingsDir = path.dirname(settingsPath);

  // 1. Copy the statusline script
  fs.mkdirSync(installDir, { recursive: true });
  fs.copyFileSync(HOOK_SOURCE, dest);
  fs.chmodSync(dest, 0o755);

  // 2. Update settings.json
  fs.mkdirSync(settingsDir, { recursive: true });
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    } catch {
      // Corrupted settings - start fresh
    }
  }

  settings.statusLine = {
    type: "command",
    command: dest,
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");

  console.log();
  log(`${GREEN}${BOLD}blip${RESET} ${DIM}installed${RESET}`);
  log(`${DIM}scope:  ${RESET}${scope}`);
  log(`${DIM}hook:   ${RESET}${dest}`);
  log(`${DIM}config: ${RESET}${settingsPath}`);
  console.log();
  log(`${DIM}Restart Claude Code to see it.${RESET}`);
  console.log();
}

function removeStatusLine(settingsPath) {
  if (!fs.existsSync(settingsPath)) return false;
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    if (!settings.statusLine) return false;
    delete settings.statusLine;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
    return true;
  } catch {
    return false;
  }
}

function uninstallAll() {
  let removed = false;

  // Remove from all settings scopes
  for (const [name, getPath] of Object.entries(SCOPES)) {
    if (removeStatusLine(getPath())) {
      log(`${DIM}Removed statusLine from ${name} settings${RESET}`);
      removed = true;
    }
  }

  // Remove hook files
  const locations = [
    path.join(os.homedir(), ".claude", "hooks", "statusline.js"),
    path.join(process.cwd(), ".claude", "hooks", "statusline.js"),
  ];
  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      fs.unlinkSync(loc);
      log(`${DIM}Removed ${loc}${RESET}`);
      removed = true;
    }
  }

  console.log();
  if (removed) {
    log(`${GREEN}${BOLD}blip${RESET} ${DIM}uninstalled${RESET}`);
  } else {
    log(`${DIM}Nothing to remove - blip wasn't installed.${RESET}`);
  }
  console.log();
}

// ─────────────────────────────────────────────────────────────

if (uninstall) {
  uninstallAll();
} else {
  install();
}
