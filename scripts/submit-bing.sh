#!/bin/bash
# submit-bing.sh — Submit sitemap URLs to Bing Webmaster URL Submission API
# Usage: BING_API_KEY=your_key ./scripts/submit-bing.sh
#
# Bing has a daily quota (typically 100 URLs/day).
# Run this script daily until all URLs are submitted.

set -euo pipefail

DOMAIN="https://calcolalordonetto.it"
API_KEY="${BING_API_KEY:?Error: Set BING_API_KEY environment variable}"

echo "Fetching sitemap..."
ALL_URLS=$(curl -s "$DOMAIN/sitemap-0.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<loc>//g;s/<\/loc>//g')
TOTAL=$(echo "$ALL_URLS" | wc -l | tr -d ' ')
echo "Found $TOTAL URLs in sitemap."

# Submit first 100 (daily quota)
BATCH=$(echo "$ALL_URLS" | head -100)
COUNT=$(echo "$BATCH" | wc -l | tr -d ' ')
echo "Submitting $COUNT URLs (daily quota)..."

JSON=$(echo "$BATCH" | jq -R -s -c "{siteUrl: \"$DOMAIN\", urlList: split(\"\n\") | map(select(length > 0))}")

RESPONSE=$(curl -s -X POST \
  "https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "Success! $COUNT URLs submitted."
  REMAINING=$((TOTAL - COUNT))
  if [ "$REMAINING" -gt 0 ]; then
    echo "$REMAINING URLs remaining — run again tomorrow."
  else
    echo "All URLs submitted!"
  fi
else
  echo "Error (HTTP $HTTP_CODE): $BODY"
  echo "If quota exceeded, try again tomorrow."
fi
