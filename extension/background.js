const API = 'http://127.0.0.1:48152'

const bridgeRequest = async (path, body) => {
  const { token } = await chrome.storage.local.get('token')
  if (!token) throw new Error('Enzo bridge is not configured')
  const response = await fetch(`${API}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Bridge request failed')
  return data
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'ENZO_SAVE_CREDENTIAL') return false
  bridgeRequest('/save-credential', message.credential)
    .then((entry) => sendResponse({ ok: true, entry }))
    .catch((error) => sendResponse({ ok: false, error: error.message }))
  return true
})
