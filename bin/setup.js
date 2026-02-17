#!/usr/bin/env node
// claude-blip setup - one command, done.
//
// Usage:
//   npx claude-blip              (install)
//   npx claude-blip --uninstall  (remove)

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOOK_SOURCE = path.resolve(__dirname, "..", "statusline.js");
const HOOKS_DIR = path.join(os.homedir(), ".claude", "hooks");
const SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");

const uninstall = process.argv.includes("--uninstall");

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

function log(msg) {
  console.log(`  ${msg}`);
}

function install() {
  const dest = path.join(HOOKS_DIR, "statusline.js");

  // 1. Copy the statusline script
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  fs.copyFileSync(HOOK_SOURCE, dest);
  fs.chmodSync(dest, 0o755);

  // 2. Update settings.json
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    } catch {
      // Corrupted settings - start fresh
    }
  }

  settings.statusLine = {
    type: "command",
    command: dest,
  };

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");

  console.log();
  log(`${GREEN}${BOLD}blip${RESET} ${DIM}installed${RESET}`);
  log(`${DIM}hook:   ${RESET}${dest}`);
  log(`${DIM}config: ${RESET}${SETTINGS_PATH}`);
  console.log();
  log(`${DIM}Restart Claude Code to see it.${RESET}`);
  console.log();
}

function uninstallAll() {
  let removed = false;

  // Remove statusLine from global settings
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
      if (settings.statusLine) {
        delete settings.statusLine;
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + "\n");
        removed = true;
      }
    } catch {
      // ignore
    }
  }

  // Remove hook file
  const hookPath = path.join(HOOKS_DIR, "statusline.js");
  if (fs.existsSync(hookPath)) {
    fs.unlinkSync(hookPath);
    removed = true;
  }

  console.log();
  if (removed) {
    log(`${GREEN}${BOLD}blip${RESET} ${DIM}uninstalled${RESET}`);
  } else {
    log(`${DIM}Nothing to remove - blip wasn't installed.${RESET}`);
  }
  console.log();
}

// -----------------------------------------------------------------

if (uninstall) {
  uninstallAll();
} else {
  install();
}
