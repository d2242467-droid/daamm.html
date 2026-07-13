		function initAudio() {
			if (!audioInitialized) {
				audioContext = new (window.AudioContext || window.webkitAudioContext)();
				audioInitialized = true;
			}
			if (audioContext.state === 'suspended') audioContext.resume();
			return audioContext;
		}

		function playShotgunSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
			gain.gain.setValueAtTime(0.5, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25);
			const bufferSize = ctx.sampleRate * 0.15; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
			const noise = ctx.createBufferSource(); noise.buffer = buffer; const noiseGain = ctx.createGain();
			noiseGain.gain.setValueAtTime(0.3, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
			noise.connect(noiseGain); noiseGain.connect(ctx.destination); noise.start(now);
		}

		function playPlasmaSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'triangle'; osc.frequency.setValueAtTime(500, now); osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
			gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.1);
		}

		function playRocketLaunchSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'sawtooth'; osc.frequency.setValueAtTime(250, now); osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
			gain.gain.setValueAtTime(0.6, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.35);
		}

		function playExplosionSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'sawtooth'; osc.frequency.setValueAtTime(90, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
			gain.gain.setValueAtTime(0.8, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.6);
			const bufferSize = ctx.sampleRate * 0.5; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
			const noise = ctx.createBufferSource(); noise.buffer = buffer; const noiseGain = ctx.createGain();
			noiseGain.gain.setValueAtTime(0.6, now); noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
			noise.connect(noiseGain); noiseGain.connect(ctx.destination); noise.start(now);
		}

		function playHurtSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.linearRampToValueAtTime(40, now + 0.15);
			gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.2);
		}

		function playPickupSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'sine'; osc.frequency.setValueAtTime(330, now); osc.frequency.setValueAtTime(440, now + 0.08); osc.frequency.setValueAtTime(660, now + 0.16);
			gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.25);
		}

		function playReloadSound() {
			if (!audioInitialized) return;
			const ctx = audioContext; const now = ctx.currentTime;
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.type = 'triangle'; osc.frequency.setValueAtTime(200, now); osc.frequency.setValueAtTime(400, now + 0.1);
			gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
			osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.2);
		}

		function playDrumKick(ctx, now) {
			const osc = ctx.createOscillator(); const gain = ctx.createGain();
			osc.connect(gain); gain.connect(ctx.destination);
			osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);
			gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
			osc.start(now); osc.stop(now + 0.15);
		}

		function playDrumSnare(ctx, now) {
			const bufferSize = ctx.sampleRate * 0.12; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
			const source = ctx.createBufferSource(); source.buffer = buffer; const gain = ctx.createGain();
			source.connect(gain); gain.connect(ctx.destination);
			gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
			source.start(now); source.stop(now + 0.12);
		}

		function startBackgroundMusic() {
			if (musicInterval) clearInterval(musicInterval);
			musicInterval = setInterval(() => {
				if (!isMusicPlaying || !audioInitialized || state.gameState === 'SHOP') return;
				const ctx = audioContext; const now = ctx.currentTime;
				if (musicStep % 4 === 0) playDrumKick(ctx, now); else if (musicStep % 4 === 2) playDrumSnare(ctx, now);
				let bassNote = bassSequence[musicStep];
				if (bassNote > 0) {
					const osc = ctx.createOscillator(); const gain = ctx.createGain();
					osc.type = 'sawtooth'; osc.frequency.setValueAtTime(bassNote / 2, now);
					gain.gain.setValueAtTime(synthVolume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
					const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(450, now);
					osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.2);
				}
				let leadNote = leadSequence[musicStep];
				if (leadNote > 0 && Math.random() > 0.3) {
					const osc = ctx.createOscillator(); const gain = ctx.createGain();
					osc.type = 'triangle'; osc.frequency.setValueAtTime(leadNote, now);
					gain.gain.setValueAtTime(synthVolume * 0.4, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
					osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + 0.15);
				}
				musicStep = (musicStep + 1) % bassSequence.length;
			}, 150);
		}

		function toggleAudio() {
			initAudio(); isMusicPlaying = !isMusicPlaying;
			document.getElementById("audio-toggle").innerText = isMusicPlaying ? "МУЗЫКА: ВКЛ" : "МУЗЫКА: ВЫКЛ";
			document.getElementById("audio-toggle").style.color = isMusicPlaying ? "#00ff00" : "#ff2a2a";
			document.getElementById("audio-toggle").style.borderColor = isMusicPlaying ? "#00ff00" : "#ff2a2a";
			if (isMusicPlaying) startBackgroundMusic();
		}

