import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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