require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "infobip-mobile-messaging-react-native-plugin"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  infobip-mobile-messaging-react-native-plugin
                   DESC
  s.homepage     = "https://github.com/infobip/mobile-messaging-react-native-plugin"
  s.license      = "MIT"
  s.authors      = { "Infobip" => "Push.Support@infobip.com" }
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => 'https://github.com/infobip/mobile-messaging-react-native-plugin.git', :tag => s.version}
  s.swift_version = '5'
  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React-Core"

  s.dependency "MobileMessaging/Core", "13.0.1"
  s.dependency "MobileMessaging/InAppChat", "13.0.1"
  s.dependency "MobileMessaging/Inbox", "13.0.1"
  if defined?($WebRTCUIEnabled)
    s.dependency "MobileMessaging/WebRTCUI", "13.0.1"
  end
end
