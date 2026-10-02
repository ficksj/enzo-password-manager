chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'ENZO_FILL') return
  const inputs = [...document.querySelectorAll('input')]
  const password = inputs.find((input) => input.type === 'password')
  const login = inputs.find((input) => input !== password && /email|user|login/i.test(`${input.name} ${input.id} ${input.placeholder}`)) || inputs.find((input) => input !== password && ['text','email'].includes(input.type))
  const setValue = (input, value) => { if (!input) return; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })) }
  setValue(login, message.login); setValue(password, message.password)
})
