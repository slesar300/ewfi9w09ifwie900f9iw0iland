/**
 * Work page grid: only these .mp4 files (no image tiles).
 * After adding a file to video/, append its filename here (exact name, incl. spaces).
 */
;(function () {
	const FILES = [
		'12223.mp4',
		'3D Model Animation.mp4',
		'Ai Bag Ads.mp4',
		'Animated Work.mp4',
		'Animation Video lll.mp4',
		'Animation Video.mp4',
		'Anime Style Video.mp4',
		'Cartier Video.mp4',
		'Comm Video.mp4',
		'Commercial Video .mp4',
		'Commercial Video.mp4',
		'Hugo Boss Ad.mp4',
		'Intro Film Studio.mp4',
		'Model Studio Intro.mp4',
		'Motion Ai Video.mp4',
		'My Vision ll.mp4',
		'My Vision.mp4',
		'Prewivew.mp4',
		'Rally Intro.mp4',
		'Rolex Commercial Video.mp4',
		'SSC Video.mp4',
		'Snipes Ads.mp4',
		'Vailo Commercial.mp4',
	]

	const labelFromFile = name => name.replace(/\.mp4$/i, '')

	const grid = document.getElementById('work-archive-grid')
	if (!grid) return

	const frag = document.createDocumentFragment()
	for (const file of FILES) {
		const a = document.createElement('a')
		a.className = 'archive-tile archive-tile--video'
		a.href = '#'
		a.setAttribute('role', 'listitem')

		const media = document.createElement('span')
		media.className = 'archive-tile__media'

		const video = document.createElement('video')
		video.className = 'archive-tile__video'
		video.muted = true
		video.playsInline = true
		video.loop = true
		video.preload = 'metadata'

		const source = document.createElement('source')
		source.src = `./video/${file}`
		source.type = 'video/mp4'
		video.appendChild(source)

		const cap = document.createElement('span')
		cap.className = 'archive-tile__cap'
		cap.textContent = labelFromFile(file)

		media.appendChild(video)
		a.appendChild(media)
		a.appendChild(cap)
		frag.appendChild(a)
	}
	grid.appendChild(frag)
})()
