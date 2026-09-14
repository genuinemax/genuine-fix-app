import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvGQgvDz8Mygsm5i0iUv5i1DBplQgFlDY",
  authDomain: "genuine-fix-app.firebaseapp.com",
  projectId: "genuine-fix-app",
  storageBucket: "genuine-fix-app.firebasestorage.app",
  messagingSenderId: "63125199167",
  appId: "1:63125199167:web:281852b13de032c13c1b8a",
  measurementId: "G-0Q3VTF9SEE"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore is the source of truth for business data across devices/browsers.
// localStorage is kept only as a fast offline cache for the existing app state.
const SYNC_KEYS = [
  "gf_shop_info",
  "gf_categories",
  "gf_repairs",
  "gf_inventory",
  "gf_devices_stock",
  "gf_expenses",
  "gf_stock_purchases",
  "gf_orders"
];

const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
let syncReady = false;
let applyingRemote = false;
let remoteRef = null;
let unsubscribeRemote = null;
let reloadScheduled = false;
let pushTimer = null;
let pushInFlight = false;
let pushQueued = false;

const getLocalData = () => {
  const data = {};
  SYNC_KEYS.forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  return data;
};

const writeLocalDataToFirestore = async () => {
  if (!remoteRef || !syncReady || applyingRemote) return;

  if (pushInFlight) {
    pushQueued = true;
    return;
  }

  pushInFlight = true;
  try {
    await setDoc(
      remoteRef,
      {
        ...getLocalData(),
        updatedAt: Date.now()
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Genuine Fix Firestore save failed:", error);
  } finally {
    pushInFlight = false;
    if (pushQueued) {
      pushQueued = false;
      scheduleCloudSave(0);
    }
  }
};

const scheduleCloudSave = (delay = 250) => {
  if (!remoteRef || !syncReady || applyingRemote) return;
  if (pushTimer) window.clearTimeout(pushTimer);

  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    void writeLocalDataToFirestore();
  }, delay);
};

const applyRemoteData = (remoteData) => {
  let changed = false;

  applyingRemote = true;
  try {
    SYNC_KEYS.forEach((key) => {
      const remoteValue = remoteData[key];
      if (typeof remoteValue !== "string") return;

      if (remoteValue !== window.localStorage.getItem(key)) {
        originalSetItem(key, remoteValue);
        changed = true;
      }
    });
  } finally {
    applyingRemote = false;
  }

  return changed;
};

// App.jsx continues to use localStorage, so mirror every business-data change
// to the signed-in user's private Firestore document. Changes are debounced so
// one form save does not create a burst of Firestore writes.
window.localStorage.setItem = (key, value) => {
  originalSetItem(key, value);
  if (SYNC_KEYS.includes(key) && syncReady && !applyingRemote) {
    scheduleCloudSave();
  }
};

onAuthStateChanged(auth, (user) => {
  syncReady = false;
  pushQueued = false;
  pushInFlight = false;

  if (pushTimer) {
    window.clearTimeout(pushTimer);
    pushTimer = null;
  }

  if (unsubscribeRemote) {
    unsubscribeRemote();
    unsubscribeRemote = null;
  }

  remoteRef = null;
  reloadScheduled = false;

  if (!user) return;

  // One private document per Firebase Auth user. The same login therefore
  // exposes the same shop data on any device/browser.
  remoteRef = doc(db, "shopData", user.uid);

  unsubscribeRemote = onSnapshot(
    remoteRef,
    async (snapshot) => {
      const remoteData = snapshot.exists() ? snapshot.data() : {};
      const changed = applyRemoteData(remoteData);

      // React state is initialized from localStorage. When Firestore has the
      // user's existing data, refresh once so every state value uses the cloud
      // copy instead of the previous device's cache.
      if (changed && !reloadScheduled) {
        reloadScheduled = true;
        syncReady = false;
        window.setTimeout(() => window.location.reload(), 0);
        return;
      }

      // Only after the initial cloud snapshot is processed do we allow local
      // edits to write back. This prevents stale local data from overwriting
      // the user's Firestore data during login/startup.
      syncReady = true;

      // First-time setup: if this user has no cloud document yet, preserve the
      // current local/offline data as the initial cloud copy.
      if (!snapshot.exists()) {
        await writeLocalDataToFirestore();
      }
    },
    (error) => {
      syncReady = false;
      console.error("Genuine Fix Firestore listener failed:", error);
    }
  );
});
