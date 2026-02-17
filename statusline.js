#!/usr/bin/env node
// claude-blip - a single-file statusline for Claude Code
// Shows: project │ branch │ model │ context usage

const { execSync } = require("child_process");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  warnThreshold: 0.7,
  criticalThreshold: 0.9,
  barWidth: 10,
  // Debug: set to true to log full input data to stderr
  debug: false,
};

// ─────────────────────────────────────────────────────────────
// ANSI
// ─────────────────────────────────────────────────────────────
const ANSI = {
  dim: "\x1b[2m",
  reset: "\x1b[0m",
  green: "\x1b[38;5;108m",
  yellow: "\x1b[38;5;222m",
  red: "\x1b[38;5;167m",
};

const dim = (s) => `${ANSI.dim}${s}${ANSI.reset}`;
const color = (s, c) => `${c}${s}${ANSI.reset}`;
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Format token count (e.g., 12400 → "12.4K")
 */
function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

// ─────────────────────────────────────────────────────────────
// Data Fetchers
// ─────────────────────────────────────────────────────────────

function getContextDisplay(ctxWindow) {
  const rawUsed = ctxWindow?.used_percentage;
  const maxTokens = ctxWindow?.context_window_size || 200_000;
  if (rawUsed == null) return null;

  // Scale to 80% effective limit (Claude compresses around 80%)
  const scaled = Math.min(100, Math.round((rawUsed / 80) * 100));
  const ratio = scaled / 100;

  // Bar: thin line (━ filled, ─ empty)
  const filled = Math.round(ratio * CONFIG.barWidth);
  const empty = CONFIG.barWidth - filled;
  const bar = "\u2501".repeat(filled) + "\u2500".repeat(empty);

  const tokenStr = formatTokens(Math.round(maxTokens * (rawUsed / 100)));

  if (ratio < CONFIG.warnThreshold) {
    return color(`${bar} ${tokenStr}`, ANSI.green);
  } else if (ratio < CONFIG.criticalThreshold) {
    return color(`${bar} ${tokenStr}`, ANSI.yellow);
  } else {
    return color(`${bar} ${tokenStr}`, ANSI.red);
  }
}

// ─────────────────────────────────────────────────────────────
// Output Builder
// ─────────────────────────────────────────────────────────────

function buildStatusline(input) {
  const data = JSON.parse(input);

  if (CONFIG.debug) {
    console.error("[blip]", JSON.stringify(data, null, 2));
  }

  const dir = data.workspace?.current_dir || process.cwd();

  const parts = [];

  // 1. Project name
  const project = path.basename(dir);
  parts.push(dim(project));

  // 2. Git branch
  try {
    const branch = execSync("git branch --show-current", {
      cwd: dir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (branch) parts.push(dim(branch));
  } catch {
    // Not a git repo or git not available
  }

  // 3. Model
  const model = data.model?.display_name;
  if (model) {
    // Extract tier name: "Opus 4.6" → "opus", "Sonnet 4.5" → "sonnet"
    const tier = model.split(/\s/)[0].toLowerCase();
    parts.push(dim(tier));
  }

  // 4. Context window (bar + token count)
  const ctx = getContextDisplay(data.context_window);
  if (ctx) {
    parts.push(ctx);
  }

  // Truncate if wider than terminal - drops segments from the left
  const sep = dim(" \u00B7 ");
  const cols = process.stdout.columns || 80;
  while (parts.length > 1 && stripAnsi(parts.join(sep)).length > cols) {
    parts.shift();
  }
  return parts.join(sep);
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const output = buildStatusline(input);
    process.stdout.write(output);
  } catch {
    // Silent fail - a broken statusline should never interrupt your flow
  }
});
