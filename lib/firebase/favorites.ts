import { db } from "./config"
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore"
import { updateUserStats } from "./users"

export interface Favorite {
  id: string
  userId: string
  businessId: string
  businessName: string
  businessAddress?: string
  businessRating?: number
  businessImageUrl?: string
  businessCategory?: string
  businessPhone?: string
  businessLat?: number
  businessLng?: number
  createdAt: any
}

// Add favorite
export const addFavorite = async (userId: string, businessData: Omit<Favorite, "id" | "userId" | "createdAt">) => {
  const favoriteId = `${userId}_${businessData.businessId}`

  await setDoc(doc(db, "favorites", favoriteId), {
    id: favoriteId,
    userId,
    ...businessData,
    createdAt: serverTimestamp(),
  })

  // Update user favorite count
  await updateUserStats(userId, "favoriteCount")

  console.log("[v0] Favorite added:", favoriteId)
}

// Remove favorite
export const removeFavorite = async (userId: string, businessId: string) => {
  const favoriteId = `${userId}_${businessId}`
  await deleteDoc(doc(db, "favorites", favoriteId))

  // Update user favorite count
  await updateUserStats(userId, "favoriteCount", -1)

  console.log("[v0] Favorite removed:", favoriteId)
}

// Check if business is favorited
export const isFavorite = async (userId: string, businessId: string): Promise<boolean> => {
  // For now, we'll use localStorage as backup for immediate UI feedback
  if (typeof window !== "undefined") {
    const localFavorites = JSON.parse(localStorage.getItem("busca-local-favorites") || "[]")
    return localFavorites.some((fav: any) => fav.id === businessId)
  }
  return false
}

// Subscribe to user's favorites
export const subscribeToFavorites = (userId: string, callback: (favorites: Favorite[]) => void) => {
  const q = query(collection(db, "favorites"), where("userId", "==", userId))

  return onSnapshot(q, (snapshot) => {
    const favorites = snapshot.docs.map((doc) => doc.data() as Favorite)
    callback(favorites)

    // Also update localStorage for immediate UI feedback
    if (typeof window !== "undefined") {
      const localFavorites = favorites.map((fav) => ({
        id: fav.businessId,
        name: fav.businessName,
        address: fav.businessAddress,
        rating: fav.businessRating,
        image: fav.businessImageUrl,
        category: fav.businessCategory,
        phone: fav.businessPhone,
        lat: fav.businessLat,
        lng: fav.businessLng,
      }))
      localStorage.setItem("busca-local-favorites", JSON.stringify(localFavorites))
    }
  })
}
