// config/firebaseConfig.ts
import { Platform } from 'react-native';
import { app, auth, db, storage, messaging } from './firebaseConfig.web'; // Default to web
// Conditionally import the correct platform file
if (Platform.OS !== 'web') {
  // This will replace the web imports with native ones during native bundling
  Object.assign(
    { app, auth, db, storage, messaging },
    require('./firebaseConfig.native')
  );
}

export { app, auth, db, storage, messaging };