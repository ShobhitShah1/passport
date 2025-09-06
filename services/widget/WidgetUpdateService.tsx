import { SecureNote } from '@/types';
import { updateWidgetData } from '@/widgets/WidgetProvider';

class WidgetUpdateService {
  private static instance: WidgetUpdateService;
  private isInitialized = false;

  static getInstance(): WidgetUpdateService {
    if (!WidgetUpdateService.instance) {
      WidgetUpdateService.instance = new WidgetUpdateService();
    }
    return WidgetUpdateService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('WidgetUpdateService initialized');
    this.isInitialized = true;
  }

  /**
   * Update all widgets when notes data changes
   */
  updateWidgets(notes: SecureNote[]) {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      // Filter and prepare notes for widget display
      const sortedNotes = notes
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10); // Limit to 10 most recent notes

      updateWidgetData(sortedNotes);
      
      console.log(`Widgets updated with ${sortedNotes.length} notes`);
    } catch (error) {
      console.error('Failed to update widgets:', error);
    }
  }

  /**
   * Update widgets when a single note is added
   */
  onNoteAdded(allNotes: SecureNote[]) {
    this.updateWidgets(allNotes);
  }

  /**
   * Update widgets when a single note is updated
   */
  onNoteUpdated(allNotes: SecureNote[]) {
    this.updateWidgets(allNotes);
  }

  /**
   * Update widgets when a note is deleted
   */
  onNoteDeleted(allNotes: SecureNote[]) {
    this.updateWidgets(allNotes);
  }

  /**
   * Force refresh all widgets
   */
  forceRefresh(notes: SecureNote[]) {
    console.log('Force refreshing widgets...');
    this.updateWidgets(notes);
  }
}

export default WidgetUpdateService.getInstance();