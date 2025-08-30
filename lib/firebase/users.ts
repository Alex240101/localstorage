import { db } from "./config"
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, increment, updateDoc } from "firebase/firestore"

export interface User {
  id: string
  displayName: string
  gender: "masculino" | "femenino" | "otro"
  phone?: string
  createdAt: any
  searchCount: number
  favoriteCount: number
  reviewCount: number
}

// Create temporary user session
export const createUserSession = async (
  userData: Omit<User, "id" | "createdAt" | "searchCount" | "favoriteCount" | "reviewCount">,
) => {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const userDoc = {
    ...userData,
    id: userId,
    createdAt: serverTimestamp(),
    searchCount: 0,
    favoriteCount: 0,
    reviewCount: 0,
  }

  await setDoc(doc(db, "users", userId), userDoc)

  // Store in localStorage for session management
  if (typeof window !== "undefined") {
    localStorage.setItem("busca-local-user", JSON.stringify({ id: userId, ...userData }))
  }

  console.log("[v0] User registered:", userId)
  return userId
}

// Delete user session (when logging out)
export const deleteUserSession = async (userId: string) => {
  await deleteDoc(doc(db, "users", userId))

  if (typeof window !== "undefined") {
    localStorage.removeItem("busca-local-user")
  }

  console.log("[v0] User session deleted:", userId)
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("busca-local-user")
  return userData ? JSON.parse(userData) : null
}

// Update user stats
export const updateUserStats = async (
  userId: string,
  field: "searchCount" | "favoriteCount" | "reviewCount",
  increment_value = 1,
) => {
  const userRef = doc(db, "users", userId)
  await updateDoc(userRef, {
    [field]: increment(increment_value),
  })
}

// Listen to user stats changes
export const subscribeToUserStats = (userId: string, callback: (user: User) => void) => {
  const userRef = doc(db, "users", userId)
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as User)
    }
  })
}

export const createUser = async (displayName: string, gender: "masculino" | "femenino" | "otro") => {
  const userData = {
    displayName,
    gender,
  }

  const userId = await createUserSession(userData)

  // Return user data in expected format
  return {
    id: userId,
    username: displayName,
    name: displayName,
    gender,
    createdAt: new Date().toISOString(),
  }
}
