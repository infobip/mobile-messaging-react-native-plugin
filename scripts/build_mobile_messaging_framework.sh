#!/bin/bash
echo "Building MobileMessaging.framework with Carthage started..."
cd ios || { echo "[MobileMessagingPlugin] can't find ios folder"; exit 1; }

#-------------Workaround for Carthage Xcode 12 issue---------------#
#Once Carthage issue fixed(https://github.com/Carthage/Carthage/issues/3019) and Carthage version updated this needs to be removed.

xcconfig=$(mktemp /tmp/static.xcconfig.XXXXXX)
trap 'rm -f "$xcconfig"' INT TERM HUP EXIT

echo 'EXCLUDED_ARCHS__EFFECTIVE_PLATFORM_SUFFIX_simulator__NATIVE_ARCH_64_BIT_x86_64__XCODE_1200 = arm64 arm64e armv7 armv7s armv6 armv8' >> $xcconfig
echo 'EXCLUDED_ARCHS = $(inherited) $(EXCLUDED_ARCHS__EFFECTIVE_PLATFORM_SUFFIX_$(EFFECTIVE_PLATFORM_SUFFIX)__NATIVE_ARCH_64_BIT_$(NATIVE_ARCH_64_BIT)__XCODE_$(XCODE_VERSION_MAJOR))' >> $xcconfig

export XCODE_XCCONFIG_FILE="$xcconfig"
#-------------Workaround for Carthage Xcode 12 issue---------------#

carthage update --cache-builds
echo "Building MobileMessaging.framework with Carthage finished."
cd -
