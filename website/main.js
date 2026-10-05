const releaseVersion = document.querySelector('#release-version')

const translations = {
  en: {
    nav: ['Features', 'Security', 'Source', 'Download'],
    hero: ['Your passwords.<br /><span>Close at hand.</span>', 'A quiet, encrypted vault that lives in your system tray. Open it when you need it. Keep your data yours.', 'Download for Windows', 'Explore on GitHub'],
    meta: ['Windows 10 / 11', 'No account required', 'Open source'],
    trust: ['Encrypted on your device', 'Unlocked by you', 'No cloud, no account', 'YOUR KEYS STAY YOURS <span>↗</span>'],
    intro: ['A BETTER PLACE FOR YOUR PASSWORDS', 'Everything you need.<br /><span>Nothing you don\'t.</span>', 'Enzo keeps your everyday credentials organized, protected, and one click away, without getting in your way.'],
    cards: [
      ['01 / VAULT', 'Your vault, just yours.', 'Every password is encrypted locally before it touches disk. No account, no cloud copy, no one else holding the keys.', ['ARGON2ID', 'AES-256-GCM', 'LOCAL-FIRST']],
      ['02 / QUICK ACCESS', 'There when you need it.', 'A compact flyout from your system tray stays above your work, then slips away when you\'re done.', ['WINDOWS TRAY', 'ALWAYS ON TOP']],
      ['03 / UNLOCK', 'A touch, and you\'re in.', 'Unlock with your Enzo PIN or use Windows Hello for device-bound biometric access.', ['WINDOWS HELLO', 'PIN FALLBACK']],
      ['04 / GENERATOR', 'Strong by default.', 'Generate secure, random passwords and tune length and character sets to fit every sign-up form.', ['8–64 CHARACTERS', 'CRYPTOGRAPHIC RNG']],
      ['05 / CLIPBOARD', 'Copy. Paste. Gone.', 'Copied passwords can be cleared automatically after your chosen interval to reduce exposure.', ['CONFIGURABLE TIMER', '15 SEC DEFAULT']]
    ],
    security: ['SECURITY IS THE FOUNDATION', 'Private isn\'t a setting.<br /><span>It\'s the architecture.</span>', 'Enzo is designed to keep the vault on your Windows device. Your PIN derives the encryption key; Windows Hello can protect a device-bound copy for convenient unlock.', 'Read the security model'],
    extension: ['ENZO, IN YOUR BROWSER', 'Your vault.<br /><span>Where you sign in.</span>', 'Use the Enzo companion extension to find matching logins, fill forms, generate passwords, and save new credentials back to your encrypted desktop vault.', 'Get the extension', 'View setup guide', ['Load unpacked', 'Paste bridge token', 'Fill and save']],
    steps: ['GETTING STARTED', 'Set up in a moment.', [['Create your vault', 'Choose a PIN. Enzo creates your encrypted local vault.'], ['Add your logins', 'Save websites, apps, and secure notes in one private place.'], ['Stay in your flow', 'Open Enzo from the tray, copy what you need, and get back to work.']]],
    download: ['YOUR DESKTOP. YOUR VAULT.', 'Keep Enzo<br />close at hand.', 'Get the latest Windows release and take your passwords back to local.', 'Download for Windows', 'Need MSI? View all downloads'],
    changelog: ['RELEASE HISTORY', 'Built in public.<br /><span>Improved with care.</span>', 'View all releases', [['v0.2.2', 'LATEST', 'Desktop UI', 'Sharper desktop experience', 'Styled Enzo scrollbar, fixed generator strength states, added RU / EN switching inside the app, and aligned the tray flyout navigation and add-entry controls.'], ['v0.2.1', '', 'Browser companion', 'Autofill that learns your flow', 'Added login-form detection, a save-to-Enzo prompt after form submission, better field matching, and the MV3 background bridge worker.'], ['v0.2.0', '', 'Browser bridge', 'Enzo reaches the browser', 'Introduced the Chrome and Edge companion extension, local bridge API, domain matching, autofill, and password generation from the browser popup.'], ['v0.1.0', '', 'First release', 'The Enzo foundation', 'Encrypted local vault, Argon2id, AES-256-GCM, Windows Hello, tray flyout, password generator, clipboard cleanup, and Windows installers.']]],
    faq: ['GOOD QUESTIONS', 'Before you begin.', [['Where is my vault stored?', 'Your encrypted vault is saved in Enzo\'s local Windows application data directory. Enzo does not upload it to a server.'], ['Can I use Enzo without Windows Hello?', 'Yes. Windows Hello is optional. You can create and unlock your vault with your Enzo PIN.'], ['Can I move my vault to another device?', 'Encrypted backup and restore support is planned. Keep the current vault on its original device until backup support is available.'], ['Is Enzo open source?', 'Yes. Review the source code, report an issue, or contribute on GitHub.']]],
    footer: ['LOCAL-FIRST PASSWORD MANAGER FOR WINDOWS', 'GitHub', 'Releases', 'MIT License', '© 2026 ENZO. PRIVATE BY DESIGN.']
  },
  ru: {
    nav: ['Возможности', 'Безопасность', 'Исходный код', 'Скачать'],
    hero: ['Ваши пароли.<br /><span>Всегда под рукой.</span>', 'Тихое зашифрованное хранилище в системном трее. Откройте его, когда нужно, и держите данные под своим контролем.', 'Скачать для Windows', 'Открыть на GitHub'],
    meta: ['Windows 10 / 11', 'Без аккаунта', 'Открытый исходный код'],
    trust: ['Зашифровано на устройстве', 'Доступ только для вас', 'Без облака и аккаунта', 'ВАШИ КЛЮЧИ — ВАШИ <span>↗</span>'],
    intro: ['ЛУЧШЕЕ МЕСТО ДЛЯ ВАШИХ ПАРОЛЕЙ', 'Всё необходимое.<br /><span>Ничего лишнего.</span>', 'Enzo хранит ваши доступы организованно, безопасно и в одном клике, не мешая рабочему процессу.'],
    cards: [
      ['01 / VAULT', 'Ваш vault — только ваш.', 'Каждый пароль шифруется локально до записи на диск. Без аккаунта, облачной копии и третьих лиц с доступом к ключам.', ['ARGON2ID', 'AES-256-GCM', 'ТОЛЬКО ЛОКАЛЬНО']],
      ['02 / БЫСТРЫЙ ДОСТУП', 'Всегда под рукой.', 'Компактная панель открывается из системного трея поверх работы и исчезает, когда вы закончили.', ['СИСТЕМНЫЙ ТРЕЙ', 'ПОВЕРХ ОКОН']],
      ['03 / РАЗБЛОКИРОВКА', 'Одно касание — и вы внутри.', 'Откройте Enzo с PIN-кодом или используйте Windows Hello для биометрического доступа устройства.', ['WINDOWS HELLO', 'РЕЗЕРВНЫЙ PIN']],
      ['04 / ГЕНЕРАТОР', 'Надёжность по умолчанию.', 'Создавайте случайные пароли и настраивайте длину и наборы символов под любую форму регистрации.', ['8–64 СИМВОЛА', 'КРИПТОГРАФИЧЕСКИЙ RNG']],
      ['05 / БУФЕР ОБМЕНА', 'Скопировали. Вставили. Готово.', 'Скопированные пароли можно автоматически удалять через выбранный интервал, снижая риск раскрытия.', ['НАСТРАИВАЕМЫЙ ТАЙМЕР', '15 СЕК. ПО УМОЛЧАНИЮ']]
    ],
    security: ['БЕЗОПАСНОСТЬ — ОСНОВА', 'Приватность — не настройка.<br /><span>Это архитектура.</span>', 'Enzo хранит vault на вашем Windows-устройстве. PIN формирует ключ шифрования, а Windows Hello защищает привязанную к устройству копию для быстрого входа.', 'Модель безопасности'],
    extension: ['ENZO В БРАУЗЕРЕ', 'Ваш vault.<br /><span>Там, где вы входите.</span>', 'Расширение Enzo находит подходящие доступы, заполняет формы, создаёт пароли и сохраняет новые данные обратно в зашифрованный vault на компьютере.', 'Получить расширение', 'Инструкция по установке', ['Загрузить распакованным', 'Вставить токен bridge', 'Заполнять и сохранять']],
    steps: ['БЫСТРЫЙ СТАРТ', 'Настройка за минуту.', [['Создайте хранилище', 'Придумайте PIN. Enzo создаст локальный зашифрованный vault.'], ['Добавьте доступы', 'Сохраните сайты, приложения и защищённые заметки в одном месте.'], ['Работайте спокойно', 'Откройте Enzo из трея, скопируйте нужное и вернитесь к работе.']]],
    download: ['ВАШ РАБОЧИЙ СТОЛ. ВАШ VAULT.', 'Держите Enzo<br />под рукой.', 'Скачайте последнюю версию для Windows и верните пароли в локальное хранилище.', 'Скачать для Windows', 'Нужен MSI? Все загрузки'],
    changelog: ['ИСТОРИЯ РЕЛИЗОВ', 'Развиваем открыто.<br /><span>Улучшаем внимательно.</span>', 'Все релизы', [['v0.2.2', 'ПОСЛЕДНЯЯ', 'Desktop UI', 'Более аккуратный desktop', 'Стилизован scrollbar Enzo, исправлен индикатор надежности, добавлено RU / EN переключение внутри приложения и выровнены навигация и кнопка добавления записи.'], ['v0.2.1', '', 'Browser companion', 'Autofill под ваш сценарий', 'Добавлены обнаружение login-форм, prompt сохранения после отправки, улучшенный подбор полей и MV3 background bridge.'], ['v0.2.0', '', 'Browser bridge', 'Enzo выходит в браузер', 'Добавлены расширение Chrome/Edge, локальный bridge API, поиск по домену, autofill и генерация паролей из popup.'], ['v0.1.0', '', 'First release', 'Основа Enzo', 'Локальный зашифрованный vault, Argon2id, AES-256-GCM, Windows Hello, tray flyout, генератор, очистка буфера и Windows installers.']]],
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
  document.querySelectorAll('.feature-card').forEach((card, index) => {
    const content = t.cards[index]
    if (!content) return
    const topline = card.querySelector('.feature-topline span:first-child')
    const title = card.querySelector('h3')
    const copy = card.querySelector('p')
    if (topline) topline.textContent = content[0]
    if (title) title.textContent = content[1]
    if (copy) copy.textContent = content[2]
    card.querySelectorAll('.feature-foot span').forEach((badge, badgeIndex) => { badge.textContent = content[3][badgeIndex] })
  })
  const visualLabels = t.cards.map((card) => card[0])
  const cardVisualText = t === translations.ru
    ? ['Скопировать пароль', 'ПРОВЕРЕНО', 'СИЛЬНЫЙ', 'Длина', 'Пароль скопирован', 'Буфер очищается автоматически']
    : ['Copy password', 'VERIFIED', 'STRONG', 'Length', 'Password copied', 'Clipboard clears automatically']
  const trayButton = document.querySelector('.tray-button'); if (trayButton) trayButton.textContent = cardVisualText[0]
  const helloAuth = document.querySelector('.hello-auth'); if (helloAuth) helloAuth.childNodes[0].textContent = `${cardVisualText[1]} `
  const generatorMeter = document.querySelector('.generator-meter b'); if (generatorMeter) generatorMeter.textContent = cardVisualText[2]
  const generatorLength = document.querySelector('.generator-controls span'); if (generatorLength) generatorLength.childNodes[0].textContent = `${cardVisualText[3]} `
  const clipboardText = document.querySelector('.clipboard-row span:nth-child(2)'); if (clipboardText) clipboardText.textContent = cardVisualText[4]
  const clipboardClear = document.querySelector('.clipboard-clear span'); if (clipboardClear) clipboardClear.textContent = cardVisualText[5]
  set('.security-copy .section-kicker', t.security[0]); set('.security-copy h2', t.security[1]); set('.security-copy>p:not(.section-kicker)', t.security[2]); set('.security-copy .text-link', `${t.security[3]} <span>↗</span>`)
  set('.extension-copy .section-kicker', t.extension[0]); set('.extension-copy h2', t.extension[1]); set('.extension-copy>p:not(.section-kicker)', t.extension[2]); set('.extension-actions .button-primary', `<span>⊞</span> ${t.extension[3]} <span class="button-arrow">↗</span>`); set('.extension-actions .text-link', `${t.extension[4]} <span>↗</span>`); document.querySelectorAll('.extension-points span').forEach((item, index) => { const number = item.querySelector('b'); item.textContent = ''; item.append(number, ` ${t.extension[5][index]}`) })
  set('.steps-heading .section-kicker', t.steps[0]); set('.steps-heading h2', t.steps[1]); document.querySelectorAll('.steps-grid article').forEach((article, index) => { article.querySelector('h3').textContent = t.steps[2][index][0]; article.querySelector('p').textContent = t.steps[2][index][1] })
  set('.download-content .section-kicker', t.download[0]); set('.download-content h2', t.download[1]); set('.download-content>p:not(.section-kicker)', t.download[2]); set('.download-content .button-primary', `<span class="windows-mark">⊞</span> ${t.download[3]} <span class="button-arrow">↗</span>`); set('.msi-link', `${t.download[4]} <span>→</span>`)
  set('.changelog-heading .section-kicker', t.changelog[0]); set('.changelog-heading h2', t.changelog[1]); set('.changelog-heading .text-link', `${t.changelog[2]} <span>↗</span>`); document.querySelectorAll('.release-item').forEach((item, index) => { const release = t.changelog[3][index]; item.querySelector('.release-meta b').textContent = release[0]; const badge = item.querySelector('.release-meta span'); if (badge) { badge.textContent = release[1]; badge.hidden = !release[1] } item.querySelector('.release-meta small').textContent = release[2]; item.querySelector('h3').textContent = release[3]; item.querySelector('p').textContent = release[4] })
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
    if (releaseVersion) releaseVersion.textContent = 'V0.2.2'
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
