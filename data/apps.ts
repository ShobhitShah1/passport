// Popular apps database with accurate Ionicons mappings
export interface AppData {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  packageName?: string; // For Android
  bundleId?: string; // For iOS
}

export const POPULAR_APPS: AppData[] = [
  // Social Media
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'camera',
    category: 'Social',
    color: '#E4405F',
    packageName: 'com.instagram.android',
    bundleId: 'com.burbn.instagram',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    category: 'Social',
    color: '#1877F2',
    packageName: 'com.facebook.katana',
    bundleId: 'com.facebook.Facebook',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'logo-twitter',
    category: 'Social',
    color: '#1DA1F2',
    packageName: 'com.twitter.android',
    bundleId: 'com.atebits.Tweetie2',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'musical-notes',
    category: 'Social',
    color: '#FF0050',
    packageName: 'com.zhiliaoapp.musically',
    bundleId: 'com.zhiliaoapp.musically',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'camera-outline',
    category: 'Social',
    color: '#FFFC00',
    packageName: 'com.snapchat.android',
    bundleId: 'com.toyopagroup.picaboo',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'logo-whatsapp',
    category: 'Communication',
    color: '#25D366',
    packageName: 'com.whatsapp',
    bundleId: 'net.whatsapp.WhatsApp',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    category: 'Communication',
    color: '#0088CC',
    packageName: 'org.telegram.messenger',
    bundleId: 'ph.telegra.Telegraph',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'chatbubbles',
    category: 'Communication',
    color: '#5865F2',
    packageName: 'com.discord',
    bundleId: 'com.hammerandchisel.discord',
  },

  // Entertainment
  {
    id: 'netflix',
    name: 'Netflix',
    icon: 'tv',
    category: 'Entertainment',
    color: '#E50914',
    packageName: 'com.netflix.mediaclient',
    bundleId: 'com.netflix.Netflix',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'logo-youtube',
    category: 'Entertainment',
    color: '#FF0000',
    packageName: 'com.google.android.youtube',
    bundleId: 'com.google.ios.youtube',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'musical-note',
    category: 'Music',
    color: '#1DB954',
    packageName: 'com.spotify.music',
    bundleId: 'com.spotify.client',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    icon: 'film',
    category: 'Entertainment',
    color: '#113CCF',
    packageName: 'com.disney.disneyplus',
    bundleId: 'com.disney.disneyplus',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    icon: 'play-circle',
    category: 'Entertainment',
    color: '#1CE783',
    packageName: 'com.hulu.plus',
    bundleId: 'com.hulu.Hulu',
  },

  // Productivity
  {
    id: 'gmail',
    name: 'Gmail',
    icon: 'mail',
    category: 'Productivity',
    color: '#EA4335',
    packageName: 'com.google.android.gm',
    bundleId: 'com.google.Gmail',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: 'mail-open',
    category: 'Productivity',
    color: '#0078D4',
    packageName: 'com.microsoft.office.outlook',
    bundleId: 'com.microsoft.Office.Outlook',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'chatbox-ellipses',
    category: 'Productivity',
    color: '#4A154B',
    packageName: 'com.Slack',
    bundleId: 'com.tinyspeck.chatlyio',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'document-text',
    category: 'Productivity',
    color: '#000000',
    packageName: 'notion.id',
    bundleId: 'notion.id',
  },
  {
    id: 'trello',
    name: 'Trello',
    icon: 'grid',
    category: 'Productivity',
    color: '#0052CC',
    packageName: 'com.trello',
    bundleId: 'com.fogcreek.trello',
  },

  // Finance
  {
    id: 'paypal',
    name: 'PayPal',
    icon: 'logo-paypal',
    category: 'Finance',
    color: '#003087',
    packageName: 'com.paypal.android.p2pmobile',
    bundleId: 'com.paypal.ppmobile',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    icon: 'card',
    category: 'Finance',
    color: '#3D95CE',
    packageName: 'com.venmo',
    bundleId: 'com.venmo.touch',
  },
  {
    id: 'cash-app',
    name: 'Cash App',
    icon: 'cash',
    category: 'Finance',
    color: '#00D632',
    packageName: 'com.squareup.cash',
    bundleId: 'com.squareup.cash',
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    icon: 'trending-up',
    category: 'Finance',
    color: '#00C805',
    packageName: 'com.robinhood.android',
    bundleId: 'com.robinhood.release',
  },

  // Shopping
  {
    id: 'amazon',
    name: 'Amazon',
    icon: 'storefront',
    category: 'Shopping',
    color: '#FF9900',
    packageName: 'com.amazon.mShop.android.shopping',
    bundleId: 'com.amazon.Amazon',
  },
  {
    id: 'ebay',
    name: 'eBay',
    icon: 'pricetag',
    category: 'Shopping',
    color: '#E53238',
    packageName: 'com.ebay.mobile',
    bundleId: 'com.ebay.iphone',
  },
  {
    id: 'target',
    name: 'Target',
    icon: 'location',
    category: 'Shopping',
    color: '#CC0000',
    packageName: 'com.target.ui',
    bundleId: 'com.target.Target',
  },

  // Gaming
  {
    id: 'steam',
    name: 'Steam',
    icon: 'game-controller',
    category: 'Gaming',
    color: '#171A21',
    packageName: 'com.valvesoftware.android.steam.community',
    bundleId: 'com.valvesoftware.steamcommunity',
  },
  {
    id: 'epic-games',
    name: 'Epic Games',
    icon: 'rocket',
    category: 'Gaming',
    color: '#313131',
    packageName: 'com.epicgames.fortnite',
    bundleId: 'com.epicgames.EpicGames',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: 'tv-outline',
    category: 'Gaming',
    color: '#9146FF',
    packageName: 'tv.twitch.android.app',
    bundleId: 'tv.twitch',
  },

  // Travel
  {
    id: 'uber',
    name: 'Uber',
    icon: 'car',
    category: 'Travel',
    color: '#000000',
    packageName: 'com.ubercab',
    bundleId: 'com.ubercab.UberClient',
  },
  {
    id: 'lyft',
    name: 'Lyft',
    icon: 'car-outline',
    category: 'Travel',
    color: '#E70B81',
    packageName: 'me.lyft.android',
    bundleId: 'com.lyft.lyft',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    icon: 'home',
    category: 'Travel',
    color: '#FF5A5F',
    packageName: 'com.airbnb.android',
    bundleId: 'com.airbnb.app',
  },

  // Food Delivery
  {
    id: 'doordash',
    name: 'DoorDash',
    icon: 'restaurant',
    category: 'Food',
    color: '#FF3008',
    packageName: 'com.dd.doordash',
    bundleId: 'com.doordash.ios.consumer',
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    icon: 'fast-food',
    category: 'Food',
    color: '#5FB709',
    packageName: 'com.ubercab.eats',
    bundleId: 'com.ubercab.UberEats',
  },
  {
    id: 'grubhub',
    name: 'Grubhub',
    icon: 'pizza',
    category: 'Food',
    color: '#F63440',
    packageName: 'com.grubhub.android',
    bundleId: 'com.grubhub.ios',
  },

  // Developer Tools
  {
    id: 'github',
    name: 'GitHub',
    icon: 'logo-github',
    category: 'Developer',
    color: '#181717',
    packageName: 'com.github.android',
    bundleId: 'com.github.GitHubApp',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    icon: 'code-slash',
    category: 'Developer',
    color: '#007ACC',
  },

  // Health & Fitness
  {
    id: 'nike-training',
    name: 'Nike Training',
    icon: 'fitness',
    category: 'Health',
    color: '#000000',
    packageName: 'com.nike.ntc',
    bundleId: 'com.nike.niketraining',
  },
  {
    id: 'myfitnesspal',
    name: 'MyFitnessPal',
    icon: 'barbell',
    category: 'Health',
    color: '#0072CE',
    packageName: 'com.myfitnesspal.android',
    bundleId: 'com.myfitnesspal.mfp',
  },
];

export const APP_CATEGORIES = [
  'All',
  'Social',
  'Communication',
  'Entertainment',
  'Music',
  'Productivity',
  'Finance',
  'Shopping',
  'Gaming',
  'Travel',
  'Food',
  'Developer',
  'Health',
];

export function getAppById(id: string): AppData | undefined {
  return POPULAR_APPS.find(app => app.id === id);
}

export function getAppsByCategory(category: string): AppData[] {
  if (category === 'All') {
    return POPULAR_APPS;
  }
  return POPULAR_APPS.filter(app => app.category === category);
}

export function searchApps(query: string): AppData[] {
  const lowercaseQuery = query.toLowerCase();
  return POPULAR_APPS.filter(app =>
    app.name.toLowerCase().includes(lowercaseQuery)
  );
}