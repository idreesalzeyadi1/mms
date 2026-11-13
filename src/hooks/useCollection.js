import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Subscribes to a Firestore collection in realtime
export default function useCollection(name) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(`[${name}]`, err);
        setError(err.message);
        setLoading(false);
      }
    );
    return unsub;
  }, [name]);

  return { data, loading, error };
}
