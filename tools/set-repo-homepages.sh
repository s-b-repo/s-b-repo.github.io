#!/usr/bin/env bash
# Set the GitHub "homepage" (About-sidebar website link) to cybersec.org.za on a
# CURATED set of professional security repos, creating real backlinks + entity
# association for the site. Requires: gh (authenticated).
#
# Deliberately EXCLUDED: forks/mirrors, and repos whose subject would harm the
# consultancy brand or trip search-quality/spam signals (botnet kits, RATs,
# DDoS/deauth tools, account generators, NSFW). Add/remove names below as you see fit.
#
# Usage:
#   ./set-repo-homepages.sh          # DRY RUN — prints what it would do, changes nothing
#   ./set-repo-homepages.sh --apply  # actually set the homepage fields
#
# Note: GitHub renders these About links as rel="nofollow", so they pass little
# direct PageRank — but they still drive crawl discovery, referral clicks, and
# tie the repos to your site as one entity. The bigger wins are Search Console
# (request indexing) and your profile README.

set -euo pipefail
SITE="https://cybersec.org.za"
APPLY=0; [[ "${1:-}" == "--apply" ]] && APPLY=1

# --- Curated: legit, defensible security work matching the site's service lines ---
REPOS=(
  peregrine                 # Rust MoE inference engine (store feature)
  arcticfox-c3              # C2/tooling (store feature)
  onlyoffice-mcp-server     # MCP server (store feature)
  advanced-shodan-requests  # OSINT / recon (10*)
  nfsmw-2005-re             # reverse-engineering showcase (6*)
  nfsmw-2005-sdk            # RE companion SDK (3*)
  shodan-api-key-tester     # recon tooling
  breach-check              # breach lookup
  Detailed-nmap-cheatsheet  # reference content
  github-dorks              # recon reference
  windows-hardening         # defensive hardening
  mitm-proxy-guide          # tradecraft reference
  iNode-VPN                 # FOSS VPN client (clean-room)
)

# --- Repos with an existing homepage we must NOT clobber (review manually) ---
# rustsploit -> currently points to an X/Twitter account (57*). Decide before overwriting.

echo "Mode: $([[ $APPLY == 1 ]] && echo APPLY || echo 'DRY RUN (no changes)')"
echo "Target homepage: $SITE"
echo "--------------------------------------------------------------"
for r in "${REPOS[@]}"; do
  cur=$(gh api "repos/s-b-repo/$r" --jq '.homepage // ""' 2>/dev/null || echo "__MISSING__")
  if [[ "$cur" == "__MISSING__" ]]; then
    printf 'SKIP   %-26s (repo not found)\n' "$r"; continue
  fi
  if [[ -n "$cur" && "$cur" != "$SITE" ]]; then
    printf 'SKIP   %-26s (already set: %s)\n' "$r" "$cur"; continue
  fi
  if [[ "$cur" == "$SITE" ]]; then
    printf 'OK     %-26s (already %s)\n' "$r" "$SITE"; continue
  fi
  if [[ $APPLY == 1 ]]; then
    gh repo edit "s-b-repo/$r" --homepage "$SITE" >/dev/null && printf 'SET    %-26s -> %s\n' "$r" "$SITE"
  else
    printf 'WOULD  %-26s -> %s\n' "$r" "$SITE"
  fi
done
echo "--------------------------------------------------------------"
[[ $APPLY == 0 ]] && echo "Dry run only. Re-run with --apply to make changes."
