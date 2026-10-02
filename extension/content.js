const fieldText = (input) => `${input.autocomplete || ''} ${input.name || ''} ${input.id || ''} ${input.placeholder || ''}`.toLowerCase()
const isPassword = (input) => input.type === 'password' || /pass(word|wd)?/.test(fieldText(input))
const isLogin = (input) => /user(name)?|login|email|e-mail|identifier/.test(fieldText(input)) && !isPassword(input)

const setValue = (input, value) => {
  if (!input) return
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  if (setter) setter.call(input, value)
  else input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const findFields = (root = document) => {
  const inputs = [...root.querySelectorAll('input')]
  return { login: inputs.find(isLogin) || inputs.find((input) => ['email', 'text'].includes(input.type) && !isPassword(input)), password: inputs.find(isPassword) }
}

const fill = (credential) => {
  const fields = findFields()
  setValue(fields.login, credential.login)
  setValue(fields.password, credential.password)
  fields.login?.focus()
}

const showSavePrompt = (credential, form) => {
  document.querySelector('[data-enzo-save-prompt]')?.remove()
  const host = document.createElement('div')
  host.dataset.enzoSavePrompt = 'true'
  host.style.cssText = 'position:fixed;z-index:2147483647;right:18px;bottom:18px;width:320px;font:12px Arial,sans-serif;'
  const shadow = host.attachShadow({ mode: 'closed' })
  shadow.innerHTML = `<style>:host{all:initial}.card{background:#15161b;color:#f4f1f3;border:1px solid #53303a;border-radius:9px;padding:15px;box-shadow:0 18px 55px #000b}.head{display:flex;align-items:center;gap:8px;font-weight:700}.logo{width:22px;height:22px;border-radius:5px;background:#ff1744;color:#fff;display:grid;place-items:center;font:italic 17px Georgia}.copy{margin:10px 0 14px;color:#a39fa7;line-height:1.45}.actions{display:flex;gap:7px}.actions button{border:0;border-radius:5px;padding:8px 11px;cursor:pointer;font:11px Arial}.save{background:#ff1744;color:#fff}.dismiss{background:#28272e;color:#b5b1b8}</style><div class="card"><div class="head"><span class="logo">E</span>Save this login to Enzo?</div><div class="copy">${escapeHtml(credential.domain)} · ${escapeHtml(credential.login)}</div><div class="actions"><button class="save">Save credential</button><button class="dismiss">Dismiss</button></div></div>`
  shadow.querySelector('.save').addEventListener('click', () => { chrome.runtime.sendMessage({ type: 'ENZO_SAVE_CREDENTIAL', credential }, (response) => { if (response?.ok) host.remove() }) })
  shadow.querySelector('.dismiss').addEventListener('click', () => host.remove())
  document.documentElement.appendChild(host)
}

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))

const inspectSubmit = (form) => {
  const fields = findFields(form)
  if (!fields.password || !fields.login) return
  showSavePrompt({ name: document.title.slice(0, 80) || location.hostname, domain: location.hostname.replace(/^www\./, ''), login: fields.login.value, password: fields.password.value, category: 'web', note: '' }, form)
}

document.addEventListener('submit', (event) => inspectSubmit(event.target), true)
document.addEventListener('click', (event) => {
  const button = event.target.closest('button, input[type="submit"]')
  if (!button) return
  const form = button.form || button.closest('form')
  if (form) window.setTimeout(() => inspectSubmit(form), 250)
}, true)

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'ENZO_FILL') fill(message.credential || message)
})
