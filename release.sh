#!/bin/bash

git remote rm github

# Find last git tag and create commit log
LAST_TAG=`git describe --tags --abbrev=0`
RELEASE_COMMIT_LOG=`git log $LAST_TAG..HEAD --oneline`

# Save commit log to property file as a property
# (replacing newlines with "\n")
echo RELEASE_COMMIT_LOG="${RELEASE_COMMIT_LOG//$'\n'/\\n}" > $PROPERTIES_FILE

# Bump version
./newversion $RELEASE_VERSION

# Remove package lock (temporary)
rm -f package-lock.json

git add .

# Commit release version
git commit -a -m "Release: $RELEASE_VERSION"

# Create and push tag
git tag $RELEASE_VERSION -m "Release: $RELEASE_VERSION"

# Setting username and password for HTTPS to BitBucket
encoded_username=$(echo ${GIT_USERNAME} | jq -Rr @uri)
encoded_password=$(echo ${GIT_PASSWORD} | jq -Rr @uri)
git remote set-url origin https://${encoded_username}:${encoded_password}@git.ib-ci.com/scm/mml/infobip-mobile-messaging-react-native-plugin.git

# Push changes
git push origin ${BRANCH_NAME_TO_BUILD} --tags
