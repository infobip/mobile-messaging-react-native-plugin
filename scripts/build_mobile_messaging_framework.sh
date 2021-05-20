#!/bin/bash
echo "Building MobileMessaging.xcframework with Carthage started..."
cd ios || { echo "[MobileMessagingPlugin] can't find ios folder"; exit 1; }
carthage update --cache-builds --use-xcframeworks
echo "Building MobileMessaging.xcframework with Carthage finished."
cd -
