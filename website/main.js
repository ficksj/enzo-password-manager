const releaseVersion = document.querySelector('#release-version')

const translations = {
  en: {
    nav: ['Features', 'Security', 'Source', 'Download'],
    hero: ['Your passwords.<br /><span>Close at hand.</span>', 'A quiet, encrypted vault that lives in your system tray. Open it when you need it. Keep your data yours.', 'Download for Windows', 'Explore on GitHub'],
    meta: ['Windows 10 / 11', 'No account required', 'Open source'],
    trust: ['Encrypted on your device', 'Unlocked by you', 'No cloud, no account', 'YOUR KEYS STAY YOURS <span>↗</span>'],
    intro: ['A BETTER PLACE FOR YOUR PASSWORDS', 'Everything you need.<br /><span>Nothing you don\'t.</span>', 'Enzo keeps your everyday credentials organized, protected, and one click away, without getting in your way.'],
    security: ['SECURITY IS THE FOUNDATION', 'Private isn\'t a setting.<br /><span>It\'s the architecture.</span>', 'Enzo is designed to keep the vault on your Windows device. Your PIN derives the encryption key; Windows Hello can protect a device-bound copy for convenient unlock.', 'Read the security model'],
    steps: ['GETTING STARTED', 'Set up in a moment.', [['Create your vault', 'Choose a PIN. Enzo creates your encrypted local vault.'], ['Add your logins', 'Save websites, apps, and secure notes in one private place.'], ['Stay in your flow', 'Open Enzo from the tray, copy what you need, and get back to work.']]],
    download: ['YOUR DESKTOP. YOUR VAULT.', 'Keep Enzo<br />close at hand.', 'Get the latest Windows release and take your passwords back to local.', 'Download for Windows', 'Need MSI? View all downloads'],
    faq: ['GOOD QUESTIONS', 'Before you begin.', [['Where is my vault stored?', 'Your encrypted vault is saved in Enzo\'s local Windows application data directory. Enzo does not upload it to a server.'], ['Can I use Enzo without Windows Hello?', 'Yes. Windows Hello is optional. You can create and unlock your vault with your Enzo PIN.'], ['Can I move my vault to another device?', 'Encrypted backup and restore support is planned. Keep the current vault on its original device until backup support is available.'], ['Is Enzo open source?', 'Yes. Review the source code, report an issue, or contribute on GitHub.']]],
    footer: ['LOCAL-FIRST PASSWORD MANAGER FOR WINDOWS', 'GitHub', 'Releases', 'MIT License', '© 2026 ENZO. PRIVATE BY DESIGN.']
  },
  ru: {
    nav: ['Возможности', 'Безопасность', 'Исходный код', 'Скачать'],
    hero: ['Ваши пароли.<br /><span>Всегда под рукой.</span>', 'Тихое зашифрованное хранилище в системном трее. Откройте его, когда нужно, и держите данные под своим контролем.', 'Скачать для Windows', 'Открыть на GitHub'],
    meta: ['Windows 10 / 11', 'Без аккаунта', 'Открытый исходный код'],
    trust: ['Зашифровано на устройстве', 'Доступ только для вас', 'Без облака и аккаунта', 'ВАШИ КЛЮЧИ — ВАШИ <span>↗</span>'],
    intro: ['ЛУЧШЕЕ МЕСТО ДЛЯ ВАШИХ ПАРОЛЕЙ', 'Всё необходимое.<br /><span>Ничего лишнего.</span>', 'Enzo хранит ваши доступы организованно, безопасно и в одном клике, не мешая рабочему процессу.'],
    security: ['БЕЗОПАСНОСТЬ — ОСНОВА', 'Приватность — не настройка.<br /><span>Это архитектура.</span>', 'Enzo хранит vault на вашем Windows-устройстве. PIN формирует ключ шифрования, а Windows Hello защищает привязанную к устройству копию для быстрого входа.', 'Модель безопасности'],
    steps: ['БЫСТРЫЙ СТАРТ', 'Настройка за минуту.', [['Создайте хранилище', 'Придумайте PIN. Enzo создаст локальный зашифрованный vault.'], ['Добавьте доступы', 'Сохраните сайты, приложения и защищённые заметки в одном месте.'], ['Работайте спокойно', 'Откройте Enzo из трея, скопируйте нужное и вернитесь к работе.']]],
    download: ['ВАШ РАБОЧИЙ СТОЛ. ВАШ VAULT.', 'Держите Enzo<br />под рукой.', 'Скачайте последнюю версию для Windows и верните пароли в локальное хранилище.', 'Скачать для Windows', 'Нужен MSI? Все загрузки'],
    faq: ['ЧАСТЫЕ ВОПРОСЫ', 'Перед началом.', [['Где хранится vault?', 'Зашифрованный vault хранится в локальной папке данных Enzo в Windows. Enzo не загружает его на сервер.'], ['Можно использовать Enzo без Windows Hello?', 'Да. Windows Hello необязателен. Vault можно создать и открывать с помощью PIN Enzo.'], ['Можно перенести vault на другое устройство?', 'Поддержка зашифрованного экспорта и восстановления запланирована. До её появления храните текущий vault на исходном устройстве.'], ['Enzo — open source?', 'Да. Изучайте исходный код, сообщайте об ошибках и участвуйте в разработке на GitHub.']]],
    footer: ['ЛОКАЛЬНЫЙ МЕНЕДЖЕР ПАРОЛЕЙ ДЛЯ WINDOWS', 'GitHub', 'Релизы', 'Лицензия MIT', '© 2026 ENZO. PRIVATE BY DESIGN.']
  }
}

const setLanguage = (language) => {
  const selectedLanguage = translations[language] ? language : 'en'
  const t = translations[selectedLanguage]
  document.documentElement.lang = selectedLanguage
  document.title = selectedLanguage === 'ru' ? 'Enzo — Ваши пароли всегда под рукой' : 'Enzo — Your passwords. Close at hand.'
  const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.innerHTML = value }
  set('.desktop-nav a:nth-child(1)', t.nav[0]); set('.desktop-nav a:nth-child(2)', t.nav[1]); set('.desktop-nav a:nth-child(3)', t.nav[2]); set('.header-download', `${t.nav[3]} <span>↗</span>`)
  set('.hero h1', t.hero[0]); set('.hero-description', t.hero[1]); set('.hero .button-primary', `<span class="windows-mark">⊞</span> ${t.hero[2]} <span class="button-arrow">↗</span>`); set('.hero .button-quiet', `${t.hero[3]} <span>→</span>`)
  document.querySelectorAll('.hero-meta span').forEach((element, index) => { element.innerHTML = `<i></i> ${t.meta[index]}` })
  document.querySelectorAll('.trust-strip>div').forEach((element, index) => { if (index < 3) element.querySelector('span:last-child').textContent = t.trust[index]; else element.innerHTML = t.trust[index] })
  set('.section-intro .section-kicker', t.intro[0]); set('.section-intro h2', t.intro[1]); set('.section-side-copy', t.intro[2])
  set('.security-copy .section-kicker', t.security[0]); set('.security-copy h2', t.security[1]); set('.security-copy>p:not(.section-kicker)', t.security[2]); set('.security-copy .text-link', `${t.security[3]} <span>↗</span>`)
  set('.steps-heading .section-kicker', t.steps[0]); set('.steps-heading h2', t.steps[1]); document.querySelectorAll('.steps-grid article').forEach((article, index) => { article.querySelector('h3').textContent = t.steps[2][index][0]; article.querySelector('p').textContent = t.steps[2][index][1] })
  set('.download-content .section-kicker', t.download[0]); set('.download-content h2', t.download[1]); set('.download-content>p:not(.section-kicker)', t.download[2]); set('.download-content .button-primary', `<span class="windows-mark">⊞</span> ${t.download[3]} <span class="button-arrow">↗</span>`); set('.msi-link', `${t.download[4]} <span>→</span>`)
  set('.faq-section .section-kicker', t.faq[0]); set('.faq-section h2', t.faq[1]); document.querySelectorAll('.faq-list details').forEach((item, index) => { item.querySelector('summary').childNodes[0].textContent = t.faq[2][index][0]; item.querySelector('p').textContent = t.faq[2][index][1] })
  set('.footer-note', t.footer[0]); set('.site-footer>div a:nth-child(1)', t.footer[1]); set('.site-footer>div a:nth-child(2)', t.footer[2]); set('.site-footer>div a:nth-child(3)', t.footer[3]); set('.site-footer>small', t.footer[4])
  document.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', button.dataset.language === selectedLanguage))
  localStorage.setItem('enzo-language', selectedLanguage)
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-language]')
  if (button) setLanguage(button.dataset.language)
})
setLanguage(localStorage.getItem('enzo-language') || 'en')

fetch('https://api.github.com/repos/ficksj/enzo-password-manager/releases/latest')
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then((release) => {
    if (releaseVersion && release.tag_name) releaseVersion.textContent = release.tag_name.toUpperCase()
  })
  .catch(() => {
    if (releaseVersion) releaseVersion.textContent = 'V0.1.0'
  })

document.querySelectorAll('a[href*="/releases/latest"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const isMsi = link.classList.contains('msi-link')
    if (!isMsi) return
    event.preventDefault()
    window.open('https://github.com/ficksj/enzo-password-manager/releases/latest', '_blank', 'noopener')
  })
})

document.querySelectorAll('.faq-list details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return
    document.querySelectorAll('.faq-list details').forEach((other) => {
      if (other !== item) other.open = false
    })
  })
})
