import { router } from "expo-router";

class NavigationService {
  private isNavigating = false;
  private navigationQueue: Array<() => void> = [];

  private processQueue() {
    if (this.isNavigating || this.navigationQueue.length === 0) {
      return;
    }

    this.isNavigating = true;
    const nextNavigation = this.navigationQueue.shift();

    if (nextNavigation) {
      setTimeout(() => {
        nextNavigation();
        this.isNavigating = false;
        // Process next item in queue after a delay
        setTimeout(() => this.processQueue(), 100);
      }, 50);
    } else {
      this.isNavigating = false;
    }
  }

  safeNavigate(path: string, method: 'push' | 'replace' = 'replace') {
    console.log(`🧭 Queuing navigation to: ${path}`);

    this.navigationQueue.push(() => {
      try {
        console.log(`🚀 Executing navigation to: ${path}`);
        if (method === 'push') {
          router.push(path as any);
        } else {
          router.replace(path as any);
        }
      } catch (error) {
        console.error(`❌ Navigation failed to ${path}:`, error);
      }
    });

    this.processQueue();
  }

  clearQueue() {
    console.log('🧹 Clearing navigation queue');
    this.navigationQueue = [];
    this.isNavigating = false;
  }

  isCurrentlyNavigating() {
    return this.isNavigating;
  }
}

export const navigationService = new NavigationService();