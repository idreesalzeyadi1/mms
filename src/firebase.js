import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpb10ZYeD260142lFMMgb1AHtDTI7jX_E",
  authDomain: "madrasa-web-app.firebaseapp.com",
  databaseURL: "https://madrasa-web-app-default-rtdb.firebaseio.com",
  projectId: "madrasa-web-app",
  storageBucket: "madrasa-web-app.firebasestorage.app",
  messagingSenderId: "172002764719",
  appId: "1:172002764719:web:59f3464423ada13415f15a",
  measurementId: "G-VC8XW05NPB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {});

export default app;
