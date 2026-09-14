import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const progressRef = doc(db, "studentProgress", uid);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return NextResponse.json({ exists: true, ...progressSnap.data() });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, ...progressData } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const progressRef = doc(db, "studentProgress", uid);
    await setDoc(progressRef, {
      uid,
      ...progressData,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { uid, lessonId, completed } = body;

    if (!uid || lessonId === undefined) {
      return NextResponse.json({ error: "Missing uid or lessonId" }, { status: 400 });
    }

    const progressRef = doc(db, "studentProgress", uid);
    const progressSnap = await getDoc(progressRef);

    let completedLessons: number[] = [];
    let courseProgress = 0;
    let xp = 0;

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      completedLessons = data.completedLessons || [];
      courseProgress = data.courseProgress || 0;
      xp = data.xp || 0;
    }

    if (completed) {
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }
      courseProgress = Math.min(100, Math.round((completedLessons.length / 34) * 100));
      xp += 10;
    } else {
      completedLessons = completedLessons.filter((id) => id !== lessonId);
      courseProgress = Math.max(0, Math.round((completedLessons.length / 34) * 100));
      xp = Math.max(0, xp - 10);
    }

    await setDoc(progressRef, {
      uid,
      completedLessons,
      courseProgress,
      xp,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true, completedLessons, courseProgress, xp });
  } catch (error) {
    console.error("Error updating lesson status:", error);
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 });
  }
}
