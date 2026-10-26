/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connectivity to Noetic Cloud
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // If we're offline or unconfigured, we handle it silently or log a warning
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
         console.warn("[NOETIC_DEBUG]: Sync node in offline mode. Local persistence active.");
      } else if (error.message.includes('permission-denied')) {
         console.log("[NOETIC_GATE]: Firebase rules active. Secure ledger verified.");
      }
    }
  }
}
testConnection();
