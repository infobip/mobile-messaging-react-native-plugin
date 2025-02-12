# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Application classes that will be serialized/deserialized over Gson
-keep class org.infobip.reactlibrary.mobilemessaging.Configuration* { *; }
-keep class org.infobip.reactlibrary.mobilemessaging.Configuration$* { *; }
-keep class org.infobip.reactlibrary.mobilemessaging.CacheManager* { *; }
-keep class org.infobip.reactlibrary.mobilemessaging.ChatCustomization* { *; }
-keep class org.infobip.reactlibrary.mobilemessaging.ChatCustomization$* { *; }

# InfobipRtcUi classes that are accessed via reflection
-keep class com.infobip.webrtc.ui.InfobipRtcUi$Builder { *; }
-keep class com.infobip.webrtc.ui.SuccessListener { *; }
-keep class com.infobip.webrtc.ui.ErrorListener { *; }
-keep class com.infobip.webrtc.ui.InfobipRtcUi { *; }


# Application classes that are used by native MM SDK

# Preserve all annotations.
-keepattributes *Annotation*

# Preserve all .class method names.
-keepclassmembernames class org.infobip.reactlibrary.mobilemessaging.** {
    java.lang.Class class$(java.lang.String);
    java.lang.Class class$(java.lang.String, boolean);
}

# Preserve all native method names and the names of their classes.
-keepclasseswithmembernames class org.infobip.reactlibrary.mobilemessaging.** {
    native <methods>;
}

# Preserve the special static methods that are required in all enumeration
# classes.
-keepclassmembers class org.infobip.reactlibrary.mobilemessaging.** extends java.lang.Enum {
    <fields>;
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Explicitly preserve all serialization members. The Serializable interface
# is only a marker interface, so it wouldn't save them.
# You can comment this out if your library doesn't use serialization.
# If your code contains serializable classes that have to be backward
# compatible, please refer to the manual.
-keepclassmembers class org.infobip.reactlibrary.mobilemessaging.** implements java.io.Serializable {
    static final long serialVersionUID;
    static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Preserve methonds used by Java reflection
-keepclassmembers class org.infobip.reactlibrary.mobilemessaging.ReactNativeMobileMessagingModule$* {
    public <init>(...);
}

# Preserve all ReactNativeMobileMessagingModule inner classes used by Android MM SDK
-keep class org.infobip.reactlibrary.mobilemessaging.ReactNativeMobileMessagingModule* { *; }
-keep class org.infobip.reactlibrary.mobilemessaging.ReactNativeMobileMessagingModule$* { *; }