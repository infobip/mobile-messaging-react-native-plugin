package org.infobip.reactlibrary.mobilemessaging;

public class ConfigCache {
    private static final ConfigCache INSTANCE = new ConfigCache();

    private Configuration configuration = null;

    private ConfigCache() {
    }

    public static ConfigCache getInstance() {
        return INSTANCE;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }
}
