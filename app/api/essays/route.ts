import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, query, where, getDocs, orderBy, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, essay, result } = body;

    if (!uid || !essay || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const essayRef = doc(db, "essays", `${uid}_${Date.now()}`);
    await setDoc(essayRef, {
      uid,
      essay: essay.substring(0, 5000),
      result,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving essay:", error);
    return NextResponse.json({ error: "Failed to save essay" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const essaysRef = collection(db, "essays");
    const q = query(essaysRef, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const essays = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    return NextResponse.json({ essays });
  } catch (error) {
    console.error("Error fetching essays:", error);
    return NextResponse.json({ error: "Failed to fetch essays" }, { status: 500 });
  }
}
