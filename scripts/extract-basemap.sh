#!/usr/bin/env bash
# Build the offline vector basemap: public/georgia.pmtiles
#
# One static file, no server, no database. MapLibre reads it in the browser
# over HTTP range requests; the app then copies it into Cache Storage so it
# works with the radio off.
#
# Why a corridor and not the whole country:
#   whole Georgia bbox, z14 ... 180 MB   <- over Vercel's 100 MB file limit
#   trip corridor,      z14 ...  37 MB
#   trip corridor,      z15 ...  66 MB   <- chosen: full street detail, fits
# Most of the bbox is Turkey, Armenia, Azerbaijan, Russia and the Black Sea,
# none of which this trip enters.
#
# Prereqs: go-pmtiles CLI on PATH (https://github.com/protomaps/go-pmtiles)
#          npm run data:routes && npm run data:region   (region.geojson)
set -euo pipefail

BUILD_DATE="${BUILD_DATE:-$(date -u +%Y%m%d)}"
PLANET="https://build.protomaps.com/${BUILD_DATE}.pmtiles"
OUT="public/georgia.pmtiles"
MAXZOOM="${MAXZOOM:-15}"

echo "planet : $PLANET"
echo "region : build/region.geojson"
echo "maxzoom: $MAXZOOM"
echo

pmtiles extract "$PLANET" "$OUT" \
  --region=build/region.geojson \
  --maxzoom="$MAXZOOM" \
  --download-threads=8

echo
ls -lh "$OUT"
pmtiles show "$OUT" | head -20
