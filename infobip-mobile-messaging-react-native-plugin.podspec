require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "infobip-mobile-messaging-react-native-plugin"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  infobip-mobile-messaging-react-native-plugin
                   DESC
  s.homepage     = "https://github.com/github_account/infobip-mobile-messaging-react-native-plugin"
  s.license      = "MIT"
  s.authors      = { "Olga Koroleva" => "Push.Support@infobip.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => 'https://github.com/infobip/mobile-messaging-react-native-plugin.git', :tag => s.version}
  s.swift_version = '5'
  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency "MobileMessaging/Core", "6.2.1"
  s.dependency "MobileMessaging/Geofencing", "6.2.1"

end
