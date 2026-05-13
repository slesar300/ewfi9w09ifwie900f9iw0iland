;(function () {
	function isOpenOnHome() {
		const p = (location.pathname || '').replace(/\\/g, '/').toLowerCase()
		if (p === '/' || p === '') return true
		if (p.endsWith('/index.html')) return true
		if (p.endsWith('index.html')) return true
		return false
	}

	document.addEventListener('click', e => {
		const a = e.target && e.target.closest && e.target.closest('a')
		if (!a) return
		const href = (a.getAttribute('href') || '').trim()
		if (href !== 'index.html' && href !== './index.html') return
		if (!isOpenOnHome()) return
		e.preventDefault()
		window.scrollTo({ top: 0, behavior: 'smooth' })
	})
})()
