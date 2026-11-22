export const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'expenses.json'
const FILES_API = 'https://www.googleapis.com/drive/v3/files'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'

export const isValidClientId = (id) => /^[\w-]+\.apps\.googleusercontent\.com$/.test(id)

export class DriveAuthError extends Error {}

let gisPromise = null
let fileId = null

export function loadGoogleSignIn() {
    gisPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.onload = resolve
        script.onerror = () => {
            gisPromise = null
            reject(new Error('Could not load Google sign-in.'))
        }
        document.head.appendChild(script)
    })
    return gisPromise
}

// Must be called directly from a click handler, or the browser blocks the Google popup
export function requestToken(clientId, prompt = '') {
    return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
            reject(new Error('Google sign-in is still loading. Try again in a moment.'))
            return
        }

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPE,
            callback: (response) => {
                if (response.error) {
                    reject(new Error('Google sign-in failed.'))
                } else if (!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE)) {
                    reject(new Error('Drive access is needed to sync your expenses.'))
                } else {
                    resolve({
                        token: response.access_token,
                        expiresAt: Date.now() + response.expires_in * 1000
                    })
                }
            },
            error_callback: (error) => {
                const messages = {
                    popup_closed: 'Sign-in was cancelled.',
                    popup_failed_to_open: 'The Google popup was blocked. Allow popups for this site and try again.'
                }
                reject(new Error(messages[error.type] ?? 'Google sign-in failed. Check that your client ID is correct.'))
            }
        })
        client.requestAccessToken({ prompt })
    })
}

export function revokeToken(token) {
    fileId = null
    window.google?.accounts?.oauth2?.revoke(token, () => {})
}

async function driveFetch(token, url, options = {}) {
    let response
    try {
        response = await fetch(url, {
            ...options,
            headers: { Authorization: `Bearer ${token}`, ...options.headers }
        })
    } catch {
        throw new Error('Could not reach Google Drive. Check your connection.')
    }

    if (response.status === 401) {
        throw new DriveAuthError('Google sign-in has expired. Click Reconnect to keep syncing.')
    }
    if (!response.ok) {
        if (response.status === 404) fileId = null
        throw new Error(`Google Drive request failed (${response.status}). Try again.`)
    }
    return response
}

async function findFileId(token) {
    if (fileId) return fileId

    const query = encodeURIComponent(`name='${FILE_NAME}'`)
    const response = await driveFetch(token, `${FILES_API}?spaces=appDataFolder&q=${query}&fields=files(id)&pageSize=1`)
    const { files } = await response.json()
    fileId = files[0]?.id ?? null
    return fileId
}

export async function loadDriveExpenses(token) {
    const id = await findFileId(token)
    if (!id) return []

    const response = await driveFetch(token, `${FILES_API}/${id}?alt=media`, { cache: 'no-store' })
    const data = await response.json()
    return Array.isArray(data) ? data : []
}

export async function saveDriveExpenses(token, expenses) {
    const body = JSON.stringify(expenses)
    const id = await findFileId(token)

    if (id) {
        await driveFetch(token, `${UPLOAD_API}/${id}?uploadType=media`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body
        })
        return
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })], { type: 'application/json' }))
    form.append('file', new Blob([body], { type: 'application/json' }))

    const response = await driveFetch(token, `${UPLOAD_API}?uploadType=multipart&fields=id`, {
        method: 'POST',
        body: form
    })
    fileId = (await response.json()).id
}
