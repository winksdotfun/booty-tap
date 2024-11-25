import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDyzIuow1wVwnysfY2WHGUeBhKBGDXVZuc",
  authDomain: "ultimate-analytics-9d0be.firebaseapp.com",
  projectId: "ultimate-analytics-9d0be",
  storageBucket: "ultimate-analytics-9d0be.firebasestorage.app",
  messagingSenderId: "108249184507",
  appId: "1:108249184507:web:d4653164cec30c6fecd85e",
  measurementId: "G-85NGN7TB3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// App identification constants
const APP_ID = 'booty_tap';
const APP_CATEGORY = 'game';  // Type of app (game, utility, etc.)
const APP_PLATFORM = 'web';   // Platform identifier

// Custom event logger with comprehensive app identification
export const logCustomEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  // Add comprehensive app identification to all events
  const enhancedParams = {
    ...eventParams,
    app_id: APP_ID,           // Unique app identifier
    app_category: APP_CATEGORY, // Type of application
    app_platform: APP_PLATFORM, // Platform identifier
    app_version: '1.0.0',     
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString(),
    session_id: generateSessionId() // Add session tracking
  };

  // Prefix all events with app identifier for easy filtering
  const prefixedEventName = `${APP_CATEGORY}_${APP_ID}_${eventName}`;
  
  console.log(`Logging event: ${prefixedEventName}`, enhancedParams);
  logEvent(analytics, prefixedEventName, enhancedParams);
};

// Generate a unique session ID for better user journey tracking
const generateSessionId = () => {
  if (!window.sessionStorage.getItem('firebase_session_id')) {
    window.sessionStorage.setItem('firebase_session_id', 
      `${APP_ID}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    );
  }
  return window.sessionStorage.getItem('firebase_session_id');
};

export { analytics };

// Example usage:
// logCustomEvent('game_start', { level: 1, difficulty: 'easy' });
// logCustomEvent('game_complete', { score: 100, time_spent: 120 });
