// app.config.js - Dynamic configuration for EAS builds
// Environment variables are automatically injected by EAS Build

export default ({ config }) => {
  return {
    ...config,
    name: "Community Led Engagement",
    slug: "community-led-engagement",
    version: "1.2.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "communityengagement",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.tameerekhalaq.clm.epi",
      buildNumber: "3",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1e3a5f",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "org.tameerekhalaq.clm.epi",
      versionCode: 3,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#1e3a5f",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1e3a5f",
          dark: {
            backgroundColor: "#0f2540",
            image: "./assets/images/splash-icon.png",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos for form submissions.",
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera for capturing images.",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location for form submissions.",
        },
      ],
      "expo-sqlite",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "4517d54a-bda5-41db-b622-df64b63b2eda",
      },
      // API URL is read from process.env.EXPO_PUBLIC_API_URL in src/api/client.ts
      // This is set via EAS environment variables or local .env file
    },
  };
};
