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

// Business data is kept in one private document per signed-in shop owner.
// localStorage remains the fast/offline cache; every change is mirrored to Firestore.
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

const getLocalData = () => {
  const data = {};
  SYNC_KEYS.forEach((key) => {
    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  return data;
};

const pushLocalData = async () => {
  if (!remoteRef || !syncReady || applyingRemote) return;

  try {
    await setDoc(
      remoteRef,
      { ...getLocalData(), updatedAt: Date.now() },
      { merge: true }
    );
  } catch (error) {
    console.error("Genuine Fix Firestore save failed:", error);
  }
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

// App.jsx already writes business state to localStorage. Intercept those writes
// so they are automatically persisted to Firestore as well.
window.localStorage.setItem = (key, value) => {
  originalSetItem(key, value);
  if (SYNC_KEYS.includes(key) && syncReady && !applyingRemote) {
    void pushLocalData();
  }
};

onAuthStateChanged(auth, (user) => {
  syncReady = false;

  if (unsubscribeRemote) {
    unsubscribeRemote();
    unsubscribeRemote = null;
  }

  remoteRef = null;
  reloadScheduled = false;

  if (!user) return;

  remoteRef = doc(db, "shopData", user.uid);

  unsubscribeRemote = onSnapshot(
    remoteRef,
    async (snapshot) => {
      const remoteData = snapshot.exists() ? snapshot.data() : {};
      const changed = applyRemoteData(remoteData);

      // App state is initialized from localStorage. If cloud data replaced the
      // cache, reload once so every React state value reflects the cloud copy.
      if (changed && !reloadScheduled) {
        reloadScheduled = true;
        syncReady = false;
        window.setTimeout(() => window.location.reload(), 0);
        return;
      }

      // The listener is now fully initialized. Future localStorage changes can
      // safely write to Firestore, and an empty cloud document is seeded from
      // the existing offline/local cache.
      syncReady = true;
      if (!snapshot.exists()) await pushLocalData();
    },
    (error) => {
      syncReady = false;
      console.error("Genuine Fix Firestore listener failed:", error);
    }
  );
});
