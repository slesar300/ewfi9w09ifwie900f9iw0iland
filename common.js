document.addEventListener('DOMContentLoaded', () => {
	const yearEl = document.getElementById('year')
	if (yearEl) yearEl.textContent = String(new Date().getFullYear())

	const reduceMotion = document.documentElement.classList.contains(
		'reduce-motion',
	)

	document.querySelectorAll('[data-reveal]').forEach(el => {
		if (reduceMotion) {
			el.style.opacity = '1'
			el.style.transform = 'none'
			return
		}
		el.style.opacity = '0'
		el.style.transform = 'translateY(18px)'
		el.style.transition = 'opacity 1.1s ease-out, transform 1.1s ease-out'

		const io = new IntersectionObserver(
			entries => {
				entries.forEach(ent => {
					if (!ent.isIntersecting) return
					ent.target.style.opacity = '1'
					ent.target.style.transform = 'translateY(0)'
					io.unobserve(ent.target)
				})
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0 },
		)
		io.observe(el)
	})

	const initArchiveTileVideos = () => {
		if (reduceMotion) {
			document.querySelectorAll('.archive-tile__video').forEach(v => v.remove())
			return
		}
		document.querySelectorAll('.archive-tile__video').forEach(video => {
			video.addEventListener('error', () => video.remove(), { once: true })
			const tile = video.closest('.archive-tile')
			if (!tile) return
			const io = new IntersectionObserver(
				entries => {
					entries.forEach(e => {
						if (e.isIntersecting) void video.play?.().catch(() => {})
						else video.pause()
					})
				},
				{ threshold: 0.12, rootMargin: '0px 0px 12% 0px' },
			)
			io.observe(tile)
		})
	}

	const initWorkVideoPlayer = () => {
		const dialog = document.getElementById('work-video-dialog')
		const modalVideo = document.getElementById('work-player-video')
		const titleEl = document.getElementById('work-player-title')
		const closeBtn = dialog?.querySelector('.work-player__close')
		if (!dialog || !modalVideo || !titleEl || !closeBtn) return

		let opener = null

		const clearModalVideo = () => {
			modalVideo.pause()
			modalVideo.querySelectorAll('source').forEach(s => s.remove())
			modalVideo.removeAttribute('src')
			modalVideo.load()
		}

		dialog.addEventListener('close', () => {
			clearModalVideo()
			opener?.focus()
			opener = null
		})

		closeBtn.addEventListener('click', () => dialog.close())

		const backdrop = dialog.querySelector('.work-player__backdrop')
		backdrop?.addEventListener('click', () => dialog.close())

		document.querySelectorAll('.archive-tile--video').forEach(tile => {
			tile.addEventListener('click', e => {
				if (reduceMotion) return
				const preview = tile.querySelector('video.archive-tile__video')
				const src = preview?.querySelector('source')?.getAttribute('src')
				if (!src) return
				e.preventDefault()
				opener = tile
				const cap = tile.querySelector('.archive-tile__cap')
				titleEl.textContent = cap?.textContent?.trim() || 'Video'
				document.querySelectorAll('.archive-tile__video').forEach(v => {
					v.pause()
				})
				clearModalVideo()
				const s = document.createElement('source')
				s.src = src
				s.type = 'video/mp4'
				modalVideo.appendChild(s)
				modalVideo.load()
				dialog.showModal()
				closeBtn.focus()
				void modalVideo.play().catch(() => {})
			})
		})
	}

	initArchiveTileVideos()
	initWorkVideoPlayer()
})
