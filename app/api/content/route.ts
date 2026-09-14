import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

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

export async function GET() {
  try {
    const lessonsRef = collection(db, "lessons");
    const q = query(lessonsRef, orderBy("id", "asc"));
    const snapshot = await getDocs(q);

    const lessons = snapshot.docs.map((doc) => ({
      id: doc.data().id,
      title: doc.data().title,
      unit: doc.data().unit,
      type: doc.data().type || "discussion",
      duration: doc.data().duration || 20,
      status: doc.data().status || "available",
      summary: doc.data().summary || "",
      steps: doc.data().steps || ["Learn", "Practice", "Plan", "Write", "Feedback", "Rewrite"],
    }));

    return NextResponse.json({ lessons });
  } catch (error: any) {
    console.error("Error fetching lessons:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, unit, summary, duration, type, status, steps } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "ID and title are required" }, { status: 400 });
    }

    const lessonRef = doc(db, "lessons", String(id));
    await setDoc(lessonRef, {
      id: Number(id),
      title,
      unit: unit || "Discussion Essays",
      type: type || "discussion",
      duration: Number(duration) || 20,
      status: status || "available",
      summary: summary || "",
      steps: steps || ["Learn", "Practice", "Plan", "Write", "Feedback", "Rewrite"],
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error adding lesson:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to add lesson" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const lessonRef = doc(db, "lessons", id);
    await deleteDoc(lessonRef);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting lesson:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
