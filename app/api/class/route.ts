import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
    const progressCollection = collection(db, "studentProgress");
    const progressSnap = await getDocs(progressCollection);

    const students = progressSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: data.uid,
        name: data.displayName || data.email || "Unknown",
        progress: data.courseProgress || 0,
        score: data.writingScore || 0,
        weakest: data.criteria?.length > 0 ? data.criteria[0].name : "N/A",
      };
    });

    const totalStudents = students.length;
    const avgCompletion = totalStudents > 0 ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / totalStudents) : 0;
    const avgScore = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.score, 0) / totalStudents).toFixed(1) : "0.0";
    const needAttention = students.filter((s) => s.score < 5.5).length;

    const allCriteria = progressSnap.docs.flatMap((doc) => doc.data().criteria || []);
    const criteriaAverages = allCriteria.length > 0
      ? allCriteria.reduce((acc: Record<string, { sum: number; count: number }>, c: { name: string; value: number }) => {
          if (!acc[c.name]) acc[c.name] = { sum: 0, count: 0 };
          acc[c.name].sum += c.value;
          acc[c.name].count += 1;
          return acc;
        }, {})
      : {};
    
    const criteriaStats = Object.entries(criteriaAverages).map(([name, data]) => {
      const sum = (data as { sum: number; count: number }).sum;
      const count = (data as { sum: number; count: number }).count;
      return {
        name,
        avgValue: Math.round(sum / count),
      };
    });

    return NextResponse.json({
      students,
      stats: {
        totalStudents,
        avgCompletion,
        avgScore,
        needAttention,
        criteriaStats,
      },
    });
  } catch (error: any) {
    console.error("Error fetching class data:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to fetch class data" }, { status: 500 });
  }
}
