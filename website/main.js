const releaseVersion = document.querySelector('#release-version')

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
