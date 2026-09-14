import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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

const defaultProgress = {
  courseProgress: 18,
  writingScore: 6.0,
  studyTime: "2h 40m",
  xp: 240,
  currentUnit: {
    id: 1,
    title: "Discussion Essays",
    description: "3–9 lessons · Question analysis and idea development",
    progress: 28,
  },
  nextLesson: {
    id: 3,
    title: "Question Analysis",
    summary: "Learn to dissect essay questions and identify key components.",
    duration: "24 min",
    steps: 6,
  },
  criteria: [
    { name: "Task Response", label: "Task Response · 7.0", value: 70 },
    { name: "Coherence & Cohesion", label: "Coherence & Cohesion · 6.0", value: 60 },
    { name: "Lexical Resource", label: "Lexical Resource · 5.5", value: 55 },
    { name: "Grammar", label: "Grammar · 5.5", value: 55 },
  ],
};

async function seedProgress(uid: string) {
  const progressRef = doc(db, "studentProgress", uid);
  const snap = await getDoc(progressRef);

  if (!snap.exists()) {
    await setDoc(progressRef, {
      uid,
      ...defaultProgress,
      updatedAt: new Date(),
    });
    console.log(`Seeded progress for ${uid}`);
  } else {
    console.log(`Progress already exists for ${uid}`);
  }
}

const uid = process.argv[2];
if (uid) {
  seedProgress(uid).then(() => process.exit(0));
} else {
  console.error("Please provide a UID as an argument");
  process.exit(1);
}
