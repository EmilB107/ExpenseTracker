import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  loadGoogleSignIn,
  requestToken,
  revokeToken,
  loadDriveExpenses,
  saveDriveExpenses,
  DriveAuthError
} from '../utils/googleDrive'

const LOCAL_KEY = 'expense-tracker-data'
const SESSION_KEY = 'expense-tracker-drive-session'
const CLIENT_ID_KEY = 'expense-tracker-client-id'
// IDs that came from Drive when signing out, so they aren't re-imported as new expenses on the next sign-in
const DRIVE_IDS_KEY = 'expense-tracker-drive-ids'
// Edits and deletes made while signed out, replayed onto the Drive copy on the next sign-in
const PENDING_KEY = 'expense-tracker-pending-changes'

const readJson = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage:`, e)
    return fallback
  }
}

/**
 * Signed out: expenses live in localStorage.
 * Signed in: expenses live in a hidden app folder in the user's own Google Drive.
 * Signing out keeps a local copy; signing back in uploads everything added, edited, or deleted while signed out.
 * Every write downloads the latest Drive copy first, so a stale tab can't overwrite newer data.
 */
export function useStorage() {
  const session = ref(readJson(SESSION_KEY, null))
  const expensesRaw = ref(session.value ? [] : readJson(LOCAL_KEY, []))
  // 'local' | 'loading' | 'saving' | 'synced' | 'expired' | 'error'
  const syncStatus = ref(session.value ? 'loading' : 'local')
  const syncError = ref('')

  const isDriveMode = computed(() => session.value !== null)

  const clientId = ref(localStorage.getItem(CLIENT_ID_KEY) || '')
  const isDriveConfigured = computed(() => Boolean(clientId.value))

  const hasValidToken = () => session.value && session.value.expiresAt - Date.now() > 60 * 1000

  const handleDriveError = (error) => {
    syncError.value = error.message
    if (!isDriveMode.value) {
      syncStatus.value = 'local'
    } else if (error instanceof DriveAuthError || !hasValidToken()) {
      syncStatus.value = 'expired'
    } else {
      syncStatus.value = 'error'
    }
  }

  const refresh = async () => {
    if (!isDriveMode.value) return
    if (!hasValidToken()) {
      syncStatus.value = 'expired'
      syncError.value = ''
      return
    }

    syncStatus.value = 'loading'
    try {
      expensesRaw.value = await loadDriveExpenses(session.value.token)
      syncStatus.value = 'synced'
      syncError.value = ''
    } catch (error) {
      handleDriveError(error)
    }
  }

  // Writes always start from a click (Confirm, Delete), which is the only time the browser allows
  // Google's popup. Access was already granted, so it opens and closes on its own.
  const renewSession = async () => {
    try {
      const newSession = await requestToken(clientId.value, '')
      session.value = newSession
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    } catch (error) {
      throw new DriveAuthError(`Couldn't reconnect to Google automatically. ${error.message}`)
    }
  }

  const write = async (change, pendingChange = null) => {
    if (!isDriveMode.value) {
      const next = change(expensesRaw.value)
      expensesRaw.value = next
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      if (pendingChange) {
        localStorage.setItem(PENDING_KEY, JSON.stringify([...readJson(PENDING_KEY, []), pendingChange]))
      }
      return
    }

    syncStatus.value = 'saving'
    try {
      if (!hasValidToken()) await renewSession()
      const latest = await loadDriveExpenses(session.value.token)
      const next = change(latest)
      await saveDriveExpenses(session.value.token, next)
      expensesRaw.value = next
      syncStatus.value = 'synced'
      syncError.value = ''
    } catch (error) {
      handleDriveError(error)
      throw error
    }
  }

  const signIn = async () => {
    syncError.value = ''
    try {
      const newSession = await requestToken(clientId.value, isDriveMode.value ? '' : 'select_account')
      session.value = newSession
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      syncStatus.value = 'loading'

      const remote = await loadDriveExpenses(newSession.token)
      const pendingChanges = readJson(PENDING_KEY, [])
      const updated = pendingChanges.reduce(applyPendingChange, remote)

      const updatedIds = new Set(updated.map(expense => expense.id))
      const previousDriveIds = new Set(readJson(DRIVE_IDS_KEY, []))
      const createdWhileSignedOut = readJson(LOCAL_KEY, [])
        .filter(expense => !updatedIds.has(expense.id) && !previousDriveIds.has(expense.id))

      const merged = [...updated, ...createdWhileSignedOut]
      if (pendingChanges.length > 0 || createdWhileSignedOut.length > 0) {
        await saveDriveExpenses(newSession.token, merged)
      }
      localStorage.removeItem(LOCAL_KEY)
      localStorage.removeItem(DRIVE_IDS_KEY)
      localStorage.removeItem(PENDING_KEY)

      expensesRaw.value = merged
      syncStatus.value = 'synced'
    } catch (error) {
      handleDriveError(error)
    }
  }

  const signOut = () => {
    if (session.value) revokeToken(session.value.token)
    session.value = null
    localStorage.removeItem(SESSION_KEY)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(expensesRaw.value))
    localStorage.setItem(DRIVE_IDS_KEY, JSON.stringify(expensesRaw.value.map(expense => expense.id)))
    localStorage.removeItem(PENDING_KEY)
    syncStatus.value = 'local'
    syncError.value = ''
  }

  const setClientId = (id) => {
    if (isDriveMode.value) signOut()
    syncError.value = ''

    if (id) {
      localStorage.setItem(CLIENT_ID_KEY, id)
    } else {
      localStorage.removeItem(CLIENT_ID_KEY)
    }
    clientId.value = id

    if (isDriveConfigured.value) {
      loadGoogleSignIn().catch(error => { syncError.value = error.message })
    }
  }

  const applyPendingChange = (list, pendingChange) => {
    if (pendingChange.type === 'delete') {
      return list.filter(expense => expense.id !== pendingChange.id)
    }
    return list.map(expense => (expense.id === pendingChange.id ? { ...expense, ...pendingChange.changes } : expense))
  }

  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split('/')
    return new Date(year, month - 1, day)
  }

  const expenses = computed(() => {
    return [...expensesRaw.value].sort((a, b) => parseDate(b.date) - parseDate(a.date))
  })

  const addExpense = (expense) => {
    return write(list => [...list, { id: Date.now(), ...expense }])
  }

  const updateExpense = (id, changes) => {
    return write(list => {
      if (!list.some(expense => expense.id === id)) {
        throw new Error('This expense was deleted on another device.')
      }
      return list.map(expense => (expense.id === id ? { ...expense, ...changes } : expense))
    }, { type: 'update', id, changes })
  }

  const deleteExpense = (id) => {
    return write(list => list.filter(expense => expense.id !== id), { type: 'delete', id })
  }

  const handleVisibilityChange = () => {
    const isBusy = syncStatus.value === 'loading' || syncStatus.value === 'saving'
    if (document.visibilityState === 'visible' && !isBusy) refresh()
  }

  onMounted(() => {
    if (isDriveConfigured.value) {
      loadGoogleSignIn().catch(error => { syncError.value = error.message })
    }
    refresh()
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clientId,
    setClientId,
    syncStatus,
    syncError,
    signIn,
    signOut,
    refresh
  }
}
