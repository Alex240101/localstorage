import { db, isFirestoreAvailable } from "../firebase/config"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  where,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"

// Types
export interface User {
  id: string
  name: string
  gender: string
  phone?: string
  createdAt: Date
}

export interface SearchRecord {
  id: string
  userId: string
  query: string
  timestamp: Date
}

export interface Favorite {
  id: string
  userId: string
  businessId: string
  businessName: string
  businessImage?: string
  businessAddress?: string
  timestamp: Date
}

// Unified Storage Class
class DataStorage {
  private currentUserId: string | null = null

  async initializeFirestore(): Promise<void> {
    if (!isFirestoreAvailable || !db) return

    try {
      // Check if collections already exist
      const usersSnapshot = await getDocs(query(collection(db, "users"), limit(1)))

      if (usersSnapshot.empty) {
        console.log("[v0] Initializing Firestore with sample data...")

        // Create sample users
        const sampleUsers = [
          { name: "Usuario Demo 1", gender: "masculino", phone: "+51 999 111 222" },
          { name: "Usuario Demo 2", gender: "femenino", phone: "+51 999 333 444" },
          { name: "Usuario Demo 3", gender: "otro", phone: "+51 999 555 666" },
        ]

        for (const userData of sampleUsers) {
          await addDoc(collection(db, "users"), {
            ...userData,
            createdAt: serverTimestamp(),
          })
        }

        // Create sample searches
        const sampleSearches = [
          "pollería",
          "chifa",
          "cevichería",
          "broaster",
          "pizza",
          "restaurante",
          "café",
          "restobar",
          "comida criolla",
          "parrillas",
        ]

        for (const searchQuery of sampleSearches) {
          await addDoc(collection(db, "searches"), {
            userId: "demo-user",
            query: searchQuery,
            timestamp: serverTimestamp(),
          })
        }

        // Create sample favorites
        const sampleFavorites = [
          {
            userId: "demo-user",
            businessId: "demo-business-1",
            businessName: "Pollería El Dorado",
            businessAddress: "Av. Principal 123, Ate",
            businessImage: "/polleria-restaurant.png",
          },
          {
            userId: "demo-user",
            businessId: "demo-business-2",
            businessName: "Chifa Dragón Dorado",
            businessAddress: "Jr. Los Olivos 456, Ate",
            businessImage: "/chifa-chinese-restaurant.png",
          },
        ]

        for (const favorite of sampleFavorites) {
          await addDoc(collection(db, "favorites"), {
            ...favorite,
            timestamp: serverTimestamp(),
          })
        }

        // Create analytics document
        await setDoc(doc(db, "analytics", "global"), {
          totalUsers: sampleUsers.length,
          totalSearches: sampleSearches.length,
          totalFavorites: sampleFavorites.length,
          lastUpdated: serverTimestamp(),
        })

        console.log("[v0] Firestore initialized with sample data successfully!")
      }
    } catch (error) {
      console.log("[v0] Error initializing Firestore:", error)
    }
  }

  // User Management
  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const user: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
    }

    if (isFirestoreAvailable && db) {
      try {
        await this.initializeFirestore()

        const docRef = await addDoc(collection(db, "users"), {
          ...user,
          createdAt: serverTimestamp(),
        })
        user.id = docRef.id
        console.log("[v0] User created in Firestore with ID:", user.id)
      } catch (error) {
        console.log("[v0] Firestore error, using localStorage:", error)
      }
    }

    // Always save to localStorage as backup
    localStorage.setItem("busca-local-user", JSON.stringify(user))
    this.currentUserId = user.id

    // Update analytics
    this.updateAnalytics("userRegistered")

    return user
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem("busca-local-user")
    if (userData) {
      const user = JSON.parse(userData)
      this.currentUserId = user.id
      return user
    }
    return null
  }

  async deleteUser(userId: string): Promise<void> {
    if (isFirestoreAvailable && db) {
      try {
        await deleteDoc(doc(db, "users", userId))
      } catch (error) {
        console.log("[v0] Firestore delete error:", error)
      }
    }

    localStorage.removeItem("busca-local-user")
    this.currentUserId = null
  }

  // Search Management
  async addSearch(query: string): Promise<void> {
    if (!this.currentUserId) return

    const searchRecord: SearchRecord = {
      id: Date.now().toString(),
      userId: this.currentUserId,
      query: query.toLowerCase(),
      timestamp: new Date(),
    }

    if (isFirestoreAvailable && db) {
      try {
        await addDoc(collection(db, "searches"), {
          ...searchRecord,
          timestamp: serverTimestamp(),
        })
        console.log("[v0] Search saved to Firestore:", query)
      } catch (error) {
        console.log("[v0] Firestore search error:", error)
      }
    }

    // Save to localStorage
    const searches = this.getLocalSearches()
    searches.push(searchRecord)
    localStorage.setItem("busca-local-searches", JSON.stringify(searches))

    // Update analytics
    this.updateAnalytics("searchPerformed")
  }

  private getLocalSearches(): SearchRecord[] {
    const searches = localStorage.getItem("busca-local-searches")
    return searches ? JSON.parse(searches) : []
  }

  async getPopularSearches(limitCount = 10): Promise<string[]> {
    if (isFirestoreAvailable && db) {
      try {
        const q = query(collection(db, "searches"), orderBy("timestamp", "desc"), limit(limitCount * 2))
        const snapshot = await getDocs(q)
        const searches = snapshot.docs.map((doc) => doc.data().query)

        // Count frequency
        const frequency: { [key: string]: number } = {}
        searches.forEach((search) => {
          frequency[search] = (frequency[search] || 0) + 1
        })

        return Object.entries(frequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limitCount)
          .map(([search]) => search)
      } catch (error) {
        console.log("[v0] Firestore popular searches error:", error)
      }
    }

    // Fallback to localStorage
    const searches = this.getLocalSearches()
    const frequency: { [key: string]: number } = {}
    searches.forEach((search) => {
      frequency[search.query] = (frequency[search.query] || 0) + 1
    })

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limitCount)
      .map(([search]) => search)
  }

  // Favorites Management
  async addFavorite(business: any): Promise<void> {
    if (!this.currentUserId) return

    const favorite: Favorite = {
      id: Date.now().toString(),
      userId: this.currentUserId,
      businessId: business.place_id || business.id,
      businessName: business.name,
      businessImage: business.photos?.[0]?.photo_reference || business.image,
      businessAddress: business.vicinity || business.formatted_address || business.address,
      timestamp: new Date(),
    }

    if (isFirestoreAvailable && db) {
      try {
        await addDoc(collection(db, "favorites"), {
          ...favorite,
          timestamp: serverTimestamp(),
        })
        console.log("[v0] Favorite saved to Firestore:", business.name)
      } catch (error) {
        console.log("[v0] Firestore favorite error:", error)
      }
    }

    // Save to localStorage
    const favorites = this.getLocalFavorites()
    favorites.push(favorite)
    localStorage.setItem("busca-local-favorites", JSON.stringify(favorites))
  }

  async removeFavorite(businessId: string): Promise<void> {
    if (!this.currentUserId) return

    if (isFirestoreAvailable && db) {
      try {
        const q = query(
          collection(db, "favorites"),
          where("userId", "==", this.currentUserId),
          where("businessId", "==", businessId),
        )
        const snapshot = await getDocs(q)
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, "favorites", docSnapshot.id))
        })
      } catch (error) {
        console.log("[v0] Firestore remove favorite error:", error)
      }
    }

    // Remove from localStorage
    const favorites = this.getLocalFavorites()
    const updatedFavorites = favorites.filter((fav) => fav.businessId !== businessId)
    localStorage.setItem("busca-local-favorites", JSON.stringify(updatedFavorites))
  }

  private getLocalFavorites(): Favorite[] {
    const favorites = localStorage.getItem("busca-local-favorites")
    return favorites ? JSON.parse(favorites) : []
  }

  getUserFavorites(): Favorite[] {
    return this.getLocalFavorites().filter((fav) => fav.userId === this.currentUserId)
  }

  // Analytics
  private updateAnalytics(action: string): void {
    const analytics = JSON.parse(localStorage.getItem("busca-local-analytics") || "{}")
    analytics[action] = (analytics[action] || 0) + 1
    analytics.lastUpdated = new Date().toISOString()
    localStorage.setItem("busca-local-analytics", JSON.stringify(analytics))

    console.log(`[v0] Analytics: ${action} - Total: ${analytics[action]}`)

    if (analytics[action] % 5 === 0) {
      this.getTotalStats()
    }
  }

  getAnalytics(): any {
    return JSON.parse(localStorage.getItem("busca-local-analytics") || "{}")
  }

  async getTotalStats(): Promise<{ users: number; searches: number; favorites: number }> {
    const stats = { users: 0, searches: 0, favorites: 0 }

    if (isFirestoreAvailable && db) {
      try {
        const [usersSnapshot, searchesSnapshot, favoritesSnapshot] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "searches")),
          getDocs(collection(db, "favorites")),
        ])

        stats.users = usersSnapshot.size
        stats.searches = searchesSnapshot.size
        stats.favorites = favoritesSnapshot.size

        console.log("[v0] === ESTADÍSTICAS TOTALES DEL SISTEMA ===")
        console.log(`[v0] 👥 Usuarios registrados: ${stats.users}`)
        console.log(`[v0] 🔍 Búsquedas realizadas: ${stats.searches}`)
        console.log(`[v0] ❤️ Favoritos guardados: ${stats.favorites}`)
        console.log("[v0] ==========================================")
      } catch (error) {
        console.log("[v0] Error getting Firestore stats:", error)
      }
    }

    return stats
  }
}

export const dataStorage = new DataStorage()
