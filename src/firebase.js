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
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

const SYNC_KEYS = [
  "gf_shop_info",
  "gf_categories",
  "gf_repairs",
  "gf_inventory",
  "gf_devices_stock",
  "gf_expenses",
  "gf_stock_purchases"
];

const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
let syncReady = false;
let applyingRemote = false;
let unsubscribeRemote = null;
let remoteRef = null;

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
    await setDoc(remoteRef, { ...getLocalData(), updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    console.error("Genuine Fix cloud sync write failed:", error);
  }
};

const applyRemoteData = (remoteData) => {
  const changed = SYNC_KEYS.some((key) => {
    const remoteValue = remoteData[key];
    return typeof remoteValue === "string" && remoteValue !== window.localStorage.getItem(key);
  });
  if (!changed) return false;

  applyingRemote = true;
  try {
    SYNC_KEYS.forEach((key) => {
      if (typeof remoteData[key] === "string") originalSetItem(key, remoteData[key]);
    });
  } finally {
    applyingRemote = false;
  }
  return true;
};

// App.jsx already saves business data to localStorage. Mirror those existing
// writes to Firestore so no business-logic rewrite is needed.
window.localStorage.setItem = (key, value) => {
  originalSetItem(key, value);
  if (SYNC_KEYS.includes(key) && syncReady && !applyingRemote) void pushLocalData();
};

onAuthStateChanged(auth, (user) => {
  syncReady = false;
  if (unsubscribeRemote) {
    unsubscribeRemote();
    unsubscribeRemote = null;
  }

  if (!user) {
    remoteRef = null;
    return;
  }

  remoteRef = doc(db, "shopData", user.uid);
  unsubscribeRemote = onSnapshot(remoteRef, async (snapshot) => {
    if (snapshot.exists()) {
      const changed = applyRemoteData(snapshot.data());
      if (changed) {
        syncReady = false;
        window.location.reload();
        return;
      }
    }

    syncReady = true;
    if (!snapshot.exists()) await pushLocalData();
  }, (error) => {
    console.error("Genuine Fix cloud sync listener failed:", error);
    syncReady = false;
  });
});
