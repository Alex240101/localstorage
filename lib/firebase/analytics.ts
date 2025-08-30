import { db } from "./config"
import { collection, onSnapshot } from "firebase/firestore"

export interface AnalyticsData {
  totalUsers: number
  totalSearches: number
  todayUsers: number
  todaySearches: number
}

// Subscribe to analytics data
export const subscribeToAnalytics = (callback: (data: AnalyticsData) => void) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Listen to users collection
  const usersUnsubscribe = onSnapshot(collection(db, "users"), (usersSnapshot) => {
    const totalUsers = usersSnapshot.size
    const todayUsers = usersSnapshot.docs.filter((doc) => {
      const userData = doc.data()
      const createdAt = userData.createdAt?.toDate()
      return createdAt && createdAt >= today
    }).length

    // Listen to searches collection
    const searchesUnsubscribe = onSnapshot(collection(db, "searches"), (searchesSnapshot) => {
      const totalSearches = searchesSnapshot.size
      const todaySearches = searchesSnapshot.docs.filter((doc) => {
        const searchData = doc.data()
        const createdAt = searchData.createdAt?.toDate()
        return createdAt && createdAt >= today
      }).length

      callback({
        totalUsers,
        totalSearches,
        todayUsers,
        todaySearches,
      })
    })

    return () => {
      usersUnsubscribe()
      searchesUnsubscribe()
    }
  })

  return usersUnsubscribe
}

// Log analytics to console
export const logAnalytics = () => {
  subscribeToAnalytics((data) => {
    console.log("[v0] 📊 Analytics Dashboard:")
    console.log(`[v0] 👥 Total Users: ${data.totalUsers}`)
    console.log(`[v0] 🔍 Total Searches: ${data.totalSearches}`)
    console.log(`[v0] 🆕 Today's Users: ${data.todayUsers}`)
    console.log(`[v0] 📈 Today's Searches: ${data.todaySearches}`)
  })
}
