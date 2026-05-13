gsap.registerPlugin(CustomEase, SplitText, ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
	const yearEl = document.getElementById('year')
	if (yearEl) yearEl.textContent = String(new Date().getFullYear())

	const INTRO_SEEN_KEY = 'ctrlCreateHomeIntroV2'
	try {
		if (new URLSearchParams(location.search).get('replay') === '1') {
			sessionStorage.removeItem(INTRO_SEEN_KEY)
		}
	} catch {
		/* ignore */
	}

	const reduceMotion = document.documentElement.classList.contains(
		'reduce-motion',
	)

	let preloaderRushTimer = null

	const stopPreloaderRush = () => {
		if (preloaderRushTimer != null) {
			clearInterval(preloaderRushTimer)
			preloaderRushTimer = null
		}
		document.querySelectorAll('.preloader-rush__v').forEach(v => {
			v.pause()
			v.classList.remove('is-preloader-rush-active')
		})
	}

	const startPreloaderRush = () => {
		if (reduceMotion) return
		const rushVideos = gsap.utils.toArray('.preloader-rush__v')
		if (rushVideos.length < 2) return
		let rushIdx = 0
		const showRush = i => {
			const n = rushVideos.length
			const idx = ((i % n) + n) % n
			rushVideos.forEach((v, j) => {
				const on = j === idx
				v.classList.toggle('is-preloader-rush-active', on)
				if (on) {
					seekVideoStart(v)
					void v.play().catch(() => {})
				} else {
					v.pause()
				}
			})
		}
		showRush(0)
		preloaderRushTimer = window.setInterval(() => {
			rushIdx = (rushIdx + 1) % rushVideos.length
			showRush(rushIdx)
		}, 460)
	}

	const pausePreloaderPreview = () => {
		stopPreloaderRush()
		document.querySelectorAll('.preloader-images video').forEach(v => v.pause())
	}

	CustomEase.create('hop', '0.9, 0, 0.1, 1')

	const createSplit = (selector, type, className) => {
		return SplitText.create(selector, {
			type,
			[`${type}Class`]: className,
			mask: type,
		})
	}

	const splitPreloaderHeader = createSplit(
		'.preloader-header .brand-link',
		'chars',
		'char',
	)
	const splitPreloaderCopy = createSplit('.preloader-copy p', 'lines', 'line')
	const splitPreloaderEye = createSplit('.preloader-brand-eye', 'chars', 'eyeChar')
	const splitHeader = createSplit('.header-row h1', 'lines', 'line')

	const chars = splitPreloaderHeader.chars
	const lines = splitPreloaderCopy.lines
	const eyeChars = splitPreloaderEye.chars
	const headerLines = splitHeader.lines

	/**
	 * SplitText `chars` must map 1:1 to visible glyphs — string indices often drift
	 * (spaces, masks). We pick anchors from DOM: first C, literal +, first C after +.
	 */
	const getBrandStayIndicesFromChars = charElements => {
		const plusIdx = charElements.findIndex(
			el => (el.textContent || '').trim() === '+',
		)
		const allCIndices = []
		charElements.forEach((el, i) => {
			if ((el.textContent || '').trim() === 'C') allCIndices.push(i)
		})
		const firstC = allCIndices.length ? allCIndices[0] : -1
		const secondC =
			plusIdx >= 0
				? allCIndices.find(i => i > plusIdx) ?? -1
				: allCIndices.length > 1
					? allCIndices[1]
					: -1

		const stay = new Set(
			[firstC, plusIdx, secondC].filter(i => typeof i === 'number' && i >= 0),
		)
		const hasMonogram =
			firstC >= 0 && plusIdx >= 0 && secondC > plusIdx
		return { stay, hasMonogram }
	}

	const { stay: stayCharIndices, hasMonogram } =
		getBrandStayIndicesFromChars(chars)

	const anchorChars = [...stayCharIndices].sort((a, b) => a - b).map(i => chars[i])

	const initialChar = chars[0]

	const initScrollReveal = () => {
		if (reduceMotion) {
			ScrollTrigger.refresh()
			return
		}

		const revealEls = gsap.utils.toArray('[data-reveal]')
		revealEls.forEach(el => {
			gsap.to(el, {
				opacity: 1,
				y: 0,
				duration: 1.35,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: el,
					start: 'top 91%',
					toggleActions: 'play none none none',
				},
			})
		})

		gsap.utils
			.toArray('.work-feature__media > img:not(.work-feature__fallback-img)')
			.forEach(img => {
				const feature = img.closest('.work-feature')
				if (!feature) return
				gsap.fromTo(
					img,
					{ yPercent: -5 },
					{
						yPercent: 5,
						ease: 'none',
						scrollTrigger: {
							trigger: feature,
							start: 'top bottom',
							end: 'bottom top',
							scrub: 1.15,
						},
					},
				)
			})

		gsap.utils.toArray('.work-feature__fallback-img').forEach(img => {
			const feature = img.closest('.work-feature')
			if (!feature) return
			gsap.fromTo(
				img,
				{ yPercent: -5 },
				{
					yPercent: 5,
					ease: 'none',
					scrollTrigger: {
						trigger: feature,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 1.15,
					},
				},
			)
		})

		ScrollTrigger.refresh()
	}

	const seekVideoStart = video => {
		if (!video) return
		try {
			video.currentTime = 0
		} catch {
			/* not seekable yet */
		}
	}

	const initAmbientVideo = () => {
		const heroVideo = document.getElementById('hero-video')
		const heroWrap = document.querySelector('.hero-visual')

		if (reduceMotion) {
			heroVideo?.remove()
			document.querySelectorAll('.work-feature__video').forEach(v => v.remove())
			return
		}

		if (heroVideo && heroWrap) {
			seekVideoStart(heroVideo)
			heroVideo.addEventListener(
				'loadedmetadata',
				() => seekVideoStart(heroVideo),
				{ once: true },
			)
			heroVideo.addEventListener(
				'error',
				() => {
					heroVideo.remove()
					heroWrap.classList.remove('hero-visual--playing')
				},
				{ once: true },
			)
			const showHeroVideo = () => {
				seekVideoStart(heroVideo)
				heroWrap.classList.add('hero-visual--playing')
			}
			const tryShowHero = () => {
				if (heroWrap.classList.contains('hero-visual--playing')) return
				if (heroVideo.readyState >= 2) showHeroVideo()
			}
			;['loadeddata', 'canplay', 'playing'].forEach(evt => {
				heroVideo.addEventListener(evt, tryShowHero, { once: true })
			})
			tryShowHero()
			requestAnimationFrame(() => tryShowHero())
			window.setTimeout(() => {
				if (!heroWrap.classList.contains('hero-visual--playing')) showHeroVideo()
			}, 1200)
			void heroVideo.play?.().catch(() => {})
			document.addEventListener('visibilitychange', () => {
				if (document.hidden) heroVideo.pause()
				else void heroVideo.play?.().catch(() => {})
			})
		}

		document.querySelectorAll('.work-feature__video').forEach(caseVideo => {
			seekVideoStart(caseVideo)
			caseVideo.addEventListener(
				'loadedmetadata',
				() => seekVideoStart(caseVideo),
				{ once: true },
			)
			caseVideo.addEventListener('error', () => caseVideo.remove(), { once: true })
			const host = caseVideo.closest('.work-feature')
			if (host) {
				const io = new IntersectionObserver(
					entries => {
						entries.forEach(e => {
							if (e.isIntersecting) void caseVideo.play?.().catch(() => {})
							else caseVideo.pause()
						})
					},
					{ threshold: 0.22 },
				)
				io.observe(host)
			}
		})
	}

	const markIntroSeen = () => {
		try {
			sessionStorage.setItem(INTRO_SEEN_KEY, '1')
		} catch {
			/* private mode, etc. */
		}
	}

	const skipPreloaderToContent = () => {
		pausePreloaderPreview()
		gsap.set(chars, { x: 0, yPercent: 0 })
		gsap.set(lines, { yPercent: 0, y: 0 })
		if (eyeChars?.length) gsap.set(eyeChars, { yPercent: 0, opacity: 1 })
		gsap.set(headerLines, { yPercent: 0 })
		gsap.set('.divider', { scaleX: 1 })
		document.documentElement.classList.add('is-ready')
		document.querySelector('.preloader')?.setAttribute('hidden', '')
		initScrollReveal()
		initAmbientVideo()
	}

	if (reduceMotion) {
		pausePreloaderPreview()
		gsap.set(chars, { x: 0, yPercent: 0 })
		gsap.set(lines, { yPercent: 0 })
		gsap.set(headerLines, { yPercent: 0 })
		if (eyeChars?.length) gsap.set(eyeChars, { yPercent: 0, opacity: 1 })
		gsap.set('.divider', { scaleX: 1 })
		document.documentElement.classList.add('is-ready')
		document.querySelector('.preloader')?.setAttribute('hidden', '')
		markIntroSeen()
		initScrollReveal()
		initAmbientVideo()
		return
	}

	chars.forEach((char, index) => {
		gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100 })
	})

	gsap.set(lines, { yPercent: 100 })
	gsap.set(headerLines, { yPercent: 100 })
	if (!reduceMotion && eyeChars?.length) {
		gsap.set(eyeChars, { yPercent: 118 })
	}

	const preloaderImages = gsap.utils.toArray('.preloader-images .img')
	const preloaderImagesInner = gsap.utils.toArray('.preloader-images .img video')

	const tl = gsap.timeline({
		delay: 0.25,
		onComplete: () => {
			pausePreloaderPreview()
			markIntroSeen()
			initScrollReveal()
			initAmbientVideo()
		},
	})

	tl.eventCallback('onStart', startPreloaderRush)

	tl.to('.progress-bar', {
		scaleX: 1,
		duration: 4,
		ease: 'power3.inOut',
	})
		.set('.progress-bar', { transformOrigin: 'right' })
		.to('.progress-bar', {
			scaleX: 0,
			duration: 1,
			ease: 'power3.in',
		})

	preloaderImages.forEach((preloaderImg, index) => {
		tl.to(
			preloaderImg,
			{
				clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
				duration: 1,
				ease: 'hop',
				delay: index * 0.75,
			},
			'-=5',
		)
	})

	tl.to(
		preloaderImagesInner,
		{
			scale: 1,
			duration: 1.5,
			ease: 'hop',
		},
		'-=5.25',
	)

	if (!reduceMotion && eyeChars?.length) {
		tl.to(
			eyeChars,
			{
				yPercent: 0,
				duration: 0.95,
				ease: 'hop',
				stagger: 0.038,
			},
			'-=5.25',
		)
	}

	tl.to(
		lines,
		{
			yPercent: 0,
			duration: 2,
			ease: 'hop',
			stagger: 0.1,
		},
		'-=5.5',
	)

	tl.to(
		chars,
		{
			yPercent: 0,
			duration: 1,
			ease: 'hop',
			stagger: 0.025,
		},
		'-=5',
	)

	tl.to(
		'.preloader-images',
		{
			clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
			duration: 1,
			ease: 'hop',
		},
		'-=1.5',
	)

	if (!reduceMotion) {
		tl.to(
			'.preloader-brand-eye',
			{
				opacity: 0,
				y: -40,
				duration: 0.5,
				ease: 'power2.in',
			},
			'-=2.2',
		)
	}

	tl.to(
		lines,
		{
			y: '-125%',
			duration: 2,
			ease: 'hop',
			stagger: 0.1,
		},
		'-=2',
	)

	tl.to(
		chars,
		{
			yPercent: index => {
				if (stayCharIndices.has(index)) {
					return 0
				}
				return index % 2 === 0 ? 100 : -100
			},
			duration: 1,
			ease: 'hop',
			stagger: 0.025,
			delay: 0.5,
			onStart: () => {
				const ensureMaskOverflow = el => {
					const mask = el?.parentElement
					if (mask && mask.classList.contains('char-mask')) {
						mask.style.overflow = 'visible'
					}
				}
				anchorChars.forEach(ensureMaskOverflow)

				if (!hasMonogram || anchorChars.length < 2) {
					const lastChar = chars[chars.length - 1]
					ensureMaskOverflow(initialChar)
					ensureMaskOverflow(lastChar)
					const viewportWidth = window.innerWidth
					const centerX = viewportWidth / 2
					const initialCharRect = initialChar.getBoundingClientRect()
					const lastCharRect = lastChar.getBoundingClientRect()
					gsap.to([initialChar, lastChar], {
						duration: 1,
						ease: 'hop',
						delay: 0.5,
						x: i => {
							if (i === 0) {
								return centerX - initialCharRect.left - initialCharRect.width
							}
							return centerX - lastCharRect.left
						},
					})
					return
				}

				const viewportWidth = window.innerWidth
				const centerX = viewportWidth / 2
				const gap = 12
				const rects = anchorChars.map(c => c.getBoundingClientRect())
				const totalWidth =
					rects.reduce((sum, r) => sum + r.width, 0) + gap * (anchorChars.length - 1)
				let left = centerX - totalWidth / 2

				anchorChars.forEach((charEl, i) => {
					const rect = charEl.getBoundingClientRect()
					const deltaX = left - rect.left
					left += rect.width + (i < anchorChars.length - 1 ? gap : 0)
					gsap.to(charEl, {
						x: deltaX,
						duration: 1,
						ease: 'hop',
						delay: 0.5,
					})
				})
			},
		},
		'-=2.5',
	)

	tl.add(() => {
		gsap.set(chars, { x: 0, yPercent: 0 })
		document.documentElement.classList.add('is-ready')
	}, '+=0.85')

	tl.to(
		'.preloader',
		{
			clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
			duration: 1.75,
			ease: 'hop',
		},
		'-=0.5',
	)

	tl.to(
		'.header-row .line',
		{
			yPercent: 0,
			duration: 1,
			ease: 'power4.out',
			stagger: 0.1,
		},
		'-=0.75',
	)

	tl.to(
		'.divider',
		{
			scaleX: 1,
			duration: 1,
			ease: 'power4.out',
			stagger: 0.1,
		},
		'<',
	)
})
