#!/bin/bash
set -e

MAX_ATTEMPTS=${MAX_ATTEMPTS:-3}
ATTEMPT=0
SUCCESS=false

while [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "=== Attempt $ATTEMPT/$MAX_ATTEMPTS ==="

  # Upload the artifact to GitHub Pages
  echo "Uploading artifact (dist/)..."
  npx --yes actions/upload-pages-artifact@v3 --path './dist/'
  UPLOAD_EXIT=$?

  if [ "$UPLOAD_EXIT" -ne 0 ]; then
    echo "ERROR: Artifact upload failed with exit code $UPLOAD_EXIT"
    if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
      echo "Waiting 30 seconds before retry..."
      sleep 30
      continue
    fi
    echo "FAIL: Artifact upload failed after $MAX_ATTEMPTS attempts."
    exit 1
  fi
  echo "OK: Artifact uploaded successfully."

  # Deploy to GitHub Pages
  echo "Deploying to GitHub Pages..."
  npx --yes actions/deploy-pages@v4
  DEPLOY_EXIT=$?

  if [ "$DEPLOY_EXIT" -ne 0 ]; then
    echo "ERROR: Deployment failed with exit code $DEPLOY_EXIT"
    if [ "$ATTEMPT" -lt "$MAX_ATTEMPTS" ]; then
      echo "Waiting 30 seconds before retry..."
      sleep 30
      continue
    fi
    echo "FAIL: Deployment failed after $MAX_ATTEMPTS attempts."
    exit 1
  fi
  echo "OK: Deployment successful."

  SUCCESS=true
  echo "=== Deployment succeeded on attempt $ATTEMPT ==="
  break
done

if [ "$SUCCESS" != "true" ]; then
  echo "FAIL: All $MAX_ATTEMPTS attempts exhausted. Deployment failed."
  exit 1
fi
