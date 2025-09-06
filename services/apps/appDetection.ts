import { Platform } from "react-native";
import { getInstalledApps as getAppList } from "react-native-get-app-list";
import { InstalledApp } from "../../types";
import { POPULAR_APPS, AppData } from "../../data/apps";

// Interface for native app detection (requires native modules)
export interface NativeAppInfo {
  packageName: string;
  name: string;
  icon?: string;
}

/**
 * Detects installed apps on the device using react-native-get-app-list
 */
export async function getInstalledApps(): Promise<InstalledApp[]> {
  try {
    console.log("Starting to fetch installed apps...");

    // Check if we're on Android (iOS not supported by this library)
    if (Platform.OS !== "android") {
      console.log("iOS detected - using fallback mock data");
      const mockInstalledApps = getMockInstalledApps();
      return processApps(mockInstalledApps);
    }

    // Check if the library is available
    if (typeof getAppList !== "function") {
      console.error(
        "react-native-get-app-list not properly installed or linked"
      );
      throw new Error("Library not available");
    }

    // Get real installed apps from device
    console.log("Calling getAppList()...");
    const installedApps = await getAppList();
    console.log(
      `✅ Successfully retrieved ${installedApps.length} installed apps`
    );

    if (installedApps.length === 0) {
      console.log("⚠️ No apps found - might be a permission issue");
      throw new Error("No apps detected - check permissions");
    }

    // Convert to our NativeAppInfo format
    // Library returns: { appName: string, packageName: string, versionName: string }
    const nativeApps: NativeAppInfo[] = installedApps.map((app) => ({
      packageName: app.packageName || "",
      name: app.appName || "Unknown App",
      icon: undefined, // This library doesn't provide icons
    }));

    console.log(`🔄 Processing ${nativeApps.length} apps...`);
    const processedApps = processApps(nativeApps);
    console.log(`✅ Processed and filtered to ${processedApps.length} apps`);

    return processedApps;
  } catch (error) {
    console.error("❌ Error detecting installed apps:", error);
    console.log("🔄 Falling back to mock data for testing...");

    // Fallback to mock data if real detection fails
    const mockInstalledApps = getMockInstalledApps();
    return processApps(mockInstalledApps);
  }
}

/**
 * Process apps - match with our database and categorize
 */
function processApps(nativeApps: NativeAppInfo[]): InstalledApp[] {
  // Match with our popular apps database and categorize
  const matchedApps = nativeApps.map((app) => {
    const appData = findMatchingApp(app);
    return {
      id: appData?.id || app.packageName,
      name: appData?.name || app.name,
      packageName: app.packageName,
      icon: appData?.icon || "apps",
      category: appData?.category as any,
      isSupported: !!appData,
    } as InstalledApp;
  });

  // Filter out system apps and launcher apps that users don't need passwords for
  const filteredApps = matchedApps.filter((app) => {
    const systemPackages = [
      "com.android.systemui",
      "com.android.launcher",
      "com.android.settings",
      "com.android.phone",
      "com.android.contacts",
      "com.android.mms",
      "com.android.camera",
      "com.android.gallery3d",
      "com.android.calendar",
      "com.android.calculator2",
      "com.android.clock",
      "com.android.documentsui",
      "com.android.providers",
      "com.android.bluetooth",
      "com.android.nfc",
      "com.android.server",
      "com.android.inputmethod",
      "com.android.location",
      "android.ext",
      "android.auto_generated_rro",
      "com.google.android.packageinstaller",
      "com.google.android.gms",
      "com.google.android.gsf",
      "com.google.android.ext",
      "com.google.android.webview",
      "com.google.android.tts",
      "com.sec.android", // Samsung system apps
      "com.samsung.android", // Samsung system apps
      "com.oneplus.", // OnePlus system apps
      "com.oppo.", // Oppo system apps
      "com.vivo.", // Vivo system apps
      "com.xiaomi.", // Xiaomi system apps
      "com.miui.", // MIUI system apps
      "com.huawei.", // Huawei system apps
    ];

    // Filter out system apps
    const isSystemApp = systemPackages.some((pkg) =>
      app.packageName.toLowerCase().startsWith(pkg.toLowerCase())
    );
    if (isSystemApp) return false;

    // Filter out apps with very short or generic names
    if (app.name.length < 2) return false;

    // Filter out apps that look like system services
    const systemKeywords = [
      "service",
      "framework",
      "system",
      "config",
      "stub",
      "overlay",
      "launcher",
    ];
    const nameContainsSystemKeyword = systemKeywords.some(
      (keyword) =>
        app.name.toLowerCase().includes(keyword) ||
        app.packageName.toLowerCase().includes(keyword)
    );
    if (nameContainsSystemKeyword && !app.isSupported) return false;

    // Filter out apps that are just package names (no proper display name)
    if (app.name === app.packageName) return false;

    return true;
  });

  // Sort by popularity (supported apps first, then alphabetically)
  return filteredApps.sort((a, b) => {
    if (a.isSupported && !b.isSupported) return -1;
    if (!a.isSupported && b.isSupported) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Find matching app in our popular apps database
 */
function findMatchingApp(nativeApp: NativeAppInfo): AppData | undefined {
  // First try to match by package name
  let match = POPULAR_APPS.find(
    (app) =>
      (Platform.OS === "android" &&
        app.packageName === nativeApp.packageName) ||
      (Platform.OS === "ios" && app.bundleId === nativeApp.packageName)
  );

  // If no match, try to match by name (fuzzy matching)
  if (!match) {
    const cleanName = nativeApp.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    match = POPULAR_APPS.find((app) => {
      const appCleanName = app.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        cleanName.includes(appCleanName) || appCleanName.includes(cleanName)
      );
    });
  }

  return match;
}

/**
 * Mock installed apps for demo purposes
 * In production, this would be replaced with native module calls
 */
function getMockInstalledApps(): NativeAppInfo[] {
  const commonApps = [
    // Social & Communication
    { packageName: "com.instagram.android", name: "Instagram" },
    { packageName: "com.whatsapp", name: "WhatsApp" },
    { packageName: "com.facebook.katana", name: "Facebook" },
    { packageName: "com.twitter.android", name: "Twitter" },
    { packageName: "com.discord", name: "Discord" },
    { packageName: "com.snapchat.android", name: "Snapchat" },

    // Entertainment
    { packageName: "com.netflix.mediaclient", name: "Netflix" },
    { packageName: "com.google.android.youtube", name: "YouTube" },
    { packageName: "com.spotify.music", name: "Spotify" },
    { packageName: "com.disney.disneyplus", name: "Disney+" },

    // Productivity
    { packageName: "com.google.android.gm", name: "Gmail" },
    { packageName: "com.microsoft.office.outlook", name: "Outlook" },
    { packageName: "com.Slack", name: "Slack" },
    { packageName: "notion.id", name: "Notion" },

    // Finance
    { packageName: "com.paypal.android.p2pmobile", name: "PayPal" },
    { packageName: "com.venmo", name: "Venmo" },
    { packageName: "com.robinhood.android", name: "Robinhood" },

    // Shopping
    { packageName: "com.amazon.mShop.android.shopping", name: "Amazon" },
    { packageName: "com.ebay.mobile", name: "eBay" },

    // Gaming
    { packageName: "com.valvesoftware.android.steam.community", name: "Steam" },
    { packageName: "tv.twitch.android.app", name: "Twitch" },

    // Travel & Food
    { packageName: "com.ubercab", name: "Uber" },
    { packageName: "com.airbnb.android", name: "Airbnb" },
    { packageName: "com.dd.doordash", name: "DoorDash" },

    // Developer
    { packageName: "com.github.android", name: "GitHub" },

    // Health
    { packageName: "com.nike.ntc", name: "Nike Training" },

    // Some unknown/unsupported apps
    { packageName: "com.example.customapp1", name: "Custom Banking App" },
    { packageName: "com.example.customapp2", name: "My Fitness Tracker" },
    { packageName: "com.random.productivity", name: "Task Manager Pro" },
  ];

  // Randomly select 15-25 apps to simulate realistic device
  const shuffled = commonApps.sort(() => 0.5 - Math.random());
  const selectedCount = Math.floor(Math.random() * 10) + 15; // 15-25 apps
  return shuffled.slice(0, selectedCount);
}

/**
 * Check if device has permission to read installed apps
 */
export async function checkAppPermission(): Promise<boolean> {
  try {
    if (Platform.OS !== "android") {
      return false; // iOS doesn't support app listing
    }

    // Try to get apps to check permission
    const apps = await getAppList();
    return apps.length > 0;
  } catch (error) {
    console.log("Permission check failed:", error);
    return false;
  }
}

/**
 * Request permission to read installed apps
 * Note: react-native-get-app-list handles permissions automatically
 */
export async function requestAppPermission(): Promise<boolean> {
  try {
    if (Platform.OS !== "android") {
      return false; // iOS doesn't support app listing
    }

    // The library handles permission requests automatically
    // Just try to get the app list
    const apps = await getAppList();
    return apps.length > 0;
  } catch (error) {
    console.error("Permission request failed:", error);
    return false;
  }
}
