#!/bin/bash
echo "Building MobileMessaging.framework with Carthage started..."
cd ios || { echo "[MobileMessagingPlugin] can't find ios folder"; exit 1; }
carthage update --cache-builds
echo "Building MobileMessaging.framework with Carthage finished."
cd -
