/**
 * Portfolio site — main script
 * Handles: mobile menu, video card playback, photo lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
	// ──────────────────────────────────────────────
	// Mobile menu
	// ──────────────────────────────────────────────
	const menuBtn = document.getElementById('mobile-menu-btn')
	const mobileMenu = document.getElementById('mobile-menu')
	const menuIcon = document.getElementById('menu-icon')

	function openMenu() {
		mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px'
		mobileMenu.style.opacity = '1'
		menuIcon.textContent = 'close'
	}

	function closeMenu() {
		mobileMenu.style.maxHeight = '0'
		mobileMenu.style.opacity = '0'
		menuIcon.textContent = 'menu'
	}

	menuBtn.addEventListener('click', () => {
		const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px'
		isOpen ? closeMenu() : openMenu()
	})

	// Close menu when a link is clicked
	mobileMenu.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => closeMenu())
	});

	// ──────────────────────────────────────────────
	// Video card play / pause / ended
	// ──────────────────────────────────────────────
	/**
	 * Attaches play/pause/ended handlers to every video card
	 * matching the given selectors.
	 *
	 * @param {string} cardSelector   - CSS selector for the card wrapper
	 * @param {string} overlaySelector - CSS selector for the play overlay inside each card
	 */
	function initVideoCards(cardSelector, overlaySelector) {
		document.querySelectorAll(cardSelector).forEach(card => {
			const video = card.querySelector('video')
			const overlay = card.querySelector(overlaySelector)
			if (!video || !overlay) return

			video.volume = 0.5

			overlay.addEventListener('click', () => {
				if (video.paused) {
					if (!video.dataset.hasPlayed) {
						video.currentTime = 0
						video.dataset.hasPlayed = 'true'
					} else if (video.ended) {
						video.currentTime = 0
					}
					video.play()
					overlay.style.opacity = '0'
					overlay.style.pointerEvents = 'none'
				}
			})

			video.addEventListener('click', () => {
				video.pause()
				overlay.style.opacity = '1'
				overlay.style.pointerEvents = 'auto'
			})

			video.addEventListener('ended', () => {
				overlay.style.opacity = '1'
				overlay.style.pointerEvents = 'auto'
			})
		});
	}

	initVideoCards('.skincare-video-card', '.skincare-play-overlay')
	initVideoCards('.hair-video-card', '.hair-play-overlay')
	initVideoCards('.makeup-video-card', '.makeup-play-overlay')
	initVideoCards('.beauty-video-card', '.beauty-play-overlay')

	// ──────────────────────────────────────────────
	// Performance stat proofs (mobile tap directly opens lightbox)
	// ──────────────────────────────────────────────
	document.querySelectorAll('.stat-item').forEach(item => {
		item.addEventListener('click', (e) => {
			// On wider screens, hover handles it — skip tap logic
			if (window.innerWidth > 1280) return

			e.stopPropagation()

			// Get all triggers in this stat item to open as a gallery
			const triggers = Array.from(item.querySelectorAll('.photo-lightbox-trigger'))
			if (triggers.length > 0) {
				openLightboxGallery(triggers, 0)
			}
		})
	})

	// ──────────────────────────────────────────────
	// Photo lightbox
	// ──────────────────────────────────────────────
	const lightbox = document.getElementById('photo-lightbox')
	const backdrop = document.getElementById('lightbox-backdrop')
	const content = document.getElementById('lightbox-content')
	const lightboxImg = document.getElementById('lightbox-img')
	const lightboxDesc = document.getElementById('lightbox-desc')
	const lightboxClose = document.getElementById('lightbox-close')
	const lightboxNav = document.getElementById('lightbox-nav')
	const lightboxPrev = document.getElementById('lightbox-prev')
	const lightboxNext = document.getElementById('lightbox-next')
	const lightboxDots = document.getElementById('lightbox-dots')
	let isLightboxOpen = false
	let currentGallery = []
	let currentGalleryIndex = 0

	function updateLightboxContent() {
		const trigger = currentGallery[currentGalleryIndex]
		if (!trigger) return
		const img = trigger.querySelector('img')
		lightboxImg.src = img.src
		lightboxImg.alt = img.alt
		lightboxDesc.textContent = trigger.dataset.description || ''

		// Handle external link overlay
		const existingLink = document.getElementById('lightbox-cloned-link')
		if (existingLink) existingLink.remove()

		const sourceLink = trigger.parentElement.querySelector('a[href]')
		if (sourceLink) {
			const clonedLink = sourceLink.cloneNode(true)
			clonedLink.id = 'lightbox-cloned-link'
			clonedLink.className = "absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-black/80 transition-all z-20"
			clonedLink.style.opacity = '1' // When navigating inside open gallery, it's instantly visible
			document.getElementById('lightbox-img-wrapper').appendChild(clonedLink)
		}

		// Update dots
		if (lightboxDots) {
			Array.from(lightboxDots.children).forEach((dot, idx) => {
				if (idx === currentGalleryIndex) {
					dot.classList.add('bg-white')
					dot.classList.remove('bg-white/40')
				} else {
					dot.classList.remove('bg-white')
					dot.classList.add('bg-white/40')
				}
			})
		}
	}

	function openLightboxGallery(triggers, startIndex = 0) {
		if (!triggers || triggers.length === 0) return
		isLightboxOpen = true
		currentGallery = triggers
		currentGalleryIndex = startIndex

		// Build dots
		if (lightboxDots) {
			lightboxDots.innerHTML = ''
			if (triggers.length > 1) {
				lightboxNav.classList.remove('hidden')
				triggers.forEach((_, idx) => {
					const dot = document.createElement('button')
					dot.className = 'w-2 h-2 rounded-full transition-colors ' + (idx === startIndex ? 'bg-white' : 'bg-white/40')
					dot.addEventListener('click', (e) => {
						e.stopPropagation()
						currentGalleryIndex = idx
						updateLightboxContent()
					})
					lightboxDots.appendChild(dot)
				})
			} else {
				lightboxNav.classList.add('hidden')
			}
		}

		updateLightboxContent()

		const scrollbarW = window.innerWidth - document.documentElement.clientWidth
		document.body.style.paddingRight = scrollbarW + 'px'
		document.body.style.overflow = 'hidden'
		lightbox.style.pointerEvents = 'auto'

		// Start state
		content.style.transition = 'none'
		content.style.opacity = '0'
		content.style.transform = 'scale(0.92)'
		
		const clonedLink = document.getElementById('lightbox-cloned-link')
		if (clonedLink) {
			clonedLink.style.transition = 'none'
			clonedLink.style.opacity = '0'
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				content.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 0.15, 1)'
				content.style.opacity = '1'
				content.style.transform = 'scale(1)'

				backdrop.style.background = 'rgba(0,0,0,0.6)'
				backdrop.style.backdropFilter = 'blur(8px)'
				backdrop.style.webkitBackdropFilter = 'blur(8px)'
				lightboxClose.style.opacity = '1'
				
				if (clonedLink) {
					clonedLink.style.transition = 'opacity 0.4s ease'
					clonedLink.style.opacity = '1'
				}
			})
		})
	}

	function closeLightbox() {
		if (!isLightboxOpen) return
		isLightboxOpen = false

		content.style.opacity = '0'
		content.style.transform = 'scale(0.92)'
		backdrop.style.background = 'rgba(0,0,0,0)'
		backdrop.style.backdropFilter = 'blur(0px)'
		backdrop.style.webkitBackdropFilter = 'blur(0px)'
		lightboxClose.style.opacity = '0'
		
		const clonedLink = document.getElementById('lightbox-cloned-link')
		if (clonedLink) clonedLink.style.opacity = '0'

		setTimeout(() => {
			lightbox.style.pointerEvents = 'none'
			document.body.style.overflow = ''
			document.body.style.paddingRight = ''
			if (clonedLink) clonedLink.remove()
		}, 450)
	}

	document.querySelectorAll('.photo-lightbox-trigger').forEach(trigger => {
		trigger.addEventListener('click', (e) => {
			// Only group images that are part of the same stat-proof container
			const context = trigger.closest('.stat-proof')
			if (context) {
				const triggers = Array.from(context.querySelectorAll('.photo-lightbox-trigger'))
				const idx = triggers.indexOf(trigger)
				openLightboxGallery(triggers, idx >= 0 ? idx : 0)
			} else {
				// Standalone image
				openLightboxGallery([trigger], 0)
			}
		})
	})

	lightboxClose.addEventListener('click', closeLightbox)
	backdrop.addEventListener('click', closeLightbox)

	if (lightboxPrev) {
		lightboxPrev.addEventListener('click', (e) => {
			e.stopPropagation()
			if (currentGallery.length > 1) {
				currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length
				updateLightboxContent()
			}
		})
	}
	if (lightboxNext) {
		lightboxNext.addEventListener('click', (e) => {
			e.stopPropagation()
			if (currentGallery.length > 1) {
				currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length
				updateLightboxContent()
			}
		})
	}

	document.addEventListener('keydown', (e) => {
		if (!isLightboxOpen) return
		if (e.key === 'Escape') closeLightbox()
		if (e.key === 'ArrowLeft' && currentGallery.length > 1) {
			currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length
			updateLightboxContent()
		}
		if (e.key === 'ArrowRight' && currentGallery.length > 1) {
			currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length
			updateLightboxContent()
		}
	})

	// ──────────────────────────────────────────────
	// Scroll Animation (Fade In Sections)
	// ──────────────────────────────────────────────
	document.body.classList.add('js-scroll-animate');

	const scrollObserverOptions = {
		root: null,
		rootMargin: '0px',
		threshold: 0.15
	};

	const scrollObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				// Tiny delay ensures the browser paints the initial hidden state first
				setTimeout(() => {
					entry.target.classList.add('is-visible');
				}, 100);
				observer.unobserve(entry.target); // Only animate once
			}
		});
	}, scrollObserverOptions);

	// Observe all main sections
	document.querySelectorAll('section').forEach(section => {
		scrollObserver.observe(section);
	});
});

