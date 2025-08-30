import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyA-2b2ygoWAFqYvf4ReoT_18Y2eT2DKnzg",
  authDomain: "vetpro-system.firebaseapp.com",
  projectId: "vetpro-system",
  storageBucket: "vetpro-system.firebasestorage.app",
  messagingSenderId: "579042020708",
  appId: "1:579042020708:web:6db3733e40b81b6bd8fe71",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

let db: any = null
let isFirestoreAvailable = false

try {
  if (typeof window !== "undefined") {
    db = getFirestore(app)
    isFirestoreAvailable = true
    console.log("[v0] Firestore initialized successfully")
  }
} catch (error) {
  console.log("[v0] Firestore not available, using localStorage fallback")
  isFirestoreAvailable = false
}

export { db, isFirestoreAvailable }

// Initialize Analytics with proper error handling
let analytics: any = null
if (typeof window !== "undefined") {
  try {
    isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
          console.log("[v0] Analytics initialized successfully")
        } else {
          console.log("[v0] Analytics not supported in this environment")
        }
      })
      .catch((error) => {
        console.log("[v0] Analytics initialization failed:", error)
      })
  } catch (error) {
    console.log("[v0] Analytics not available:", error)
  }
}

export { analytics }
export default app
