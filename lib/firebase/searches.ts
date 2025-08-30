import { db } from "./config"
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  serverTimestamp,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { updateUserStats } from "./users"

export interface Search {
  id?: string
  userId: string
  query: string
  locationLat?: number
  locationLng?: number
  locationName?: string
  resultsCount: number
  createdAt: any
}

// Add search to database
export const addSearch = async (searchData: Omit<Search, "id" | "createdAt">) => {
  const docRef = await addDoc(collection(db, "searches"), {
    ...searchData,
    createdAt: serverTimestamp(),
  })

  // Update user search count
  await updateUserStats(searchData.userId, "searchCount")

  console.log("[v0] Search added:", docRef.id)
  return docRef.id
}

// Get trending searches (real-time)
export const subscribeTrendingSearches = (callback: (searches: string[]) => void) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const q = query(
    collection(db, "searches"),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    orderBy("createdAt", "desc"),
    limit(100),
  )

  return onSnapshot(q, (snapshot) => {
    const searchCounts: { [key: string]: number } = {}

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Search
      const query = data.query.toLowerCase().trim()
      if (query) {
        searchCounts[query] = (searchCounts[query] || 0) + 1
      }
    })

    // Sort by count and get top 10
    const trending = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query)

    callback(trending)
  })
}

// Get search suggestions (recent + trending)
export const getSearchSuggestions = async (userId?: string): Promise<string[]> => {
  const suggestions: string[] = []

  // Get user's recent searches if logged in
  if (userId) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const userSearchesQuery = query(
      collection(db, "searches"),
      where("userId", "==", userId),
      where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
      orderBy("createdAt", "desc"),
      limit(5),
    )

    const userSearches = await getDocs(userSearchesQuery)
    const recentQueries = userSearches.docs.map((doc) => doc.data().query)
    suggestions.push(...recentQueries)
  }

  // Get trending searches
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const trendingQuery = query(
    collection(db, "searches"),
    where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)),
    orderBy("createdAt", "desc"),
    limit(50),
  )

  const trendingSearches = await getDocs(trendingQuery)
  const searchCounts: { [key: string]: number } = {}

  trendingSearches.docs.forEach((doc) => {
    const data = doc.data() as Search
    const query = data.query.toLowerCase().trim()
    if (query && !suggestions.includes(query)) {
      searchCounts[query] = (searchCounts[query] || 0) + 1
    }
  })

  const trending = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([query]) => query)

  suggestions.push(...trending)

  // Remove duplicates and return top 8
  return [...new Set(suggestions)].slice(0, 8)
}
