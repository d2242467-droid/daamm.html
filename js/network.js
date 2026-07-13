function generateShortId() {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function initNetworkGame(spawnX, spawnY) {
	const statusEl = document.getElementById("mp-status");
	statusEl.innerText = ''; state.playerX = spawnX; state.playerY = spawnY; state.playerAngle = 0.0; state.playerPitch = 0.0;
	state.playerZ = 0; state.playerVelZ = 0; state.isOnGround = true; state.health = 100; state.maxHealth = 100; state.score = 0; state.ammo = 100;
	state.maxShotgunClip = 2; state.maxRifleClip = 30; state.maxMinigunClip = 100; state.shotgunClip = 2; state.rifleClip = 30; state.minigunClip = 100;
	state.currentWeapon = 'shotgun'; state.rocketLoaded = true; state.weaponsUnlocked = { shotgun: true, rifle: false, rocket: false, minigun: false };
	state.grenadeCounts = { frag: 0, molotov: 0, flash: 0 }; state.currentGrenadeType = 'frag'; state.thrownGrenades = []; state.fireZones = []; state.meleeCooldownTimer = 0;
	state.enemies = []; state.projectiles = []; state.particles = []; state.pickups = [];
	healthUi.innerText = state.health; scoreUi.innerText = state.score; ammoUi.innerText = state.ammo; weaponUi.innerText = "ДРОБОВИК [1] (2/2)";
	updateGrenadeUi(); updateWeaponVisibility(); initAudio(); document.getElementById("start-overlay").style.display = 'none';
	state.gameState = 'PLAYING'; startBackgroundMusic(); updateDifficultyUi(); canvas.requestPointerLock();
}

function hostGame() {
	const name = document.getElementById("mp-name").value.trim() || 'Хост';
	const chosenDifficulty = document.getElementById("mp-difficulty").value;
	const statusEl = document.getElementById("mp-status");

	statusEl.style.color = '#ffd23a';
	statusEl.innerText = 'Создание сервера...';

	const peerId = "md3d-" + generateShortId();
	const peerOptions = { config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }, { urls: 'stun:stun3.l.google.com:19302' }, { urls: 'stun:stun4.l.google.com:19302' }] } };
	const peer = new Peer(peerId, peerOptions);

	peer.on('open', (id) => {
		statusEl.style.color = '#aaffaa';
		statusEl.innerText = 'Сервер создан! Room ID: ' + id;
		document.getElementById("mp-room").value = id;

		state.multiplayer.enabled = true;
		state.multiplayer.isHost = true;
		state.multiplayer.isClient = false;
		state.multiplayer.peer = peer;
		state.multiplayer.myId = id;
		state.multiplayer.myName = name;
		state.difficulty = chosenDifficulty;
		state.map = config.MAPS.CLASSIC.slice();
		rebuild3DMap();
		initNetworkGame(3.5, 3.5);

		state.multiplayer.players[id] = { id: id, name: name, x: state.playerX, y: state.playerY, health: 100, score: 0, alive: true, isShooting: false };
	});

	peer.on('connection', (conn) => {
		conn.on('open', () => {
			state.multiplayer.clientConns[conn.peer] = conn;
			conn.send({
				type: 'init',
				difficulty: state.difficulty,
				mapData: state.map,
				spawnX: 3.5,
				spawnY: 3.5
			});
		});

		conn.on('data', (data) => {
			if (data.type === 'input') {
				state.multiplayer.players[conn.peer] = {
					id: conn.peer,
					name: data.name,
					x: data.x,
					y: data.y,
					health: data.health,
					score: data.score,
					alive: data.alive,
					isShooting: data.isShooting,
					weapon: data.weapon,
					angle: data.angle,
					pitch: data.pitch
				};
			} else if (data.type === 'hit') {
				const enemy = state.enemies.find(e => e.id === data.enemyId);
				if (enemy) enemy.health -= data.damage;
			}
		});

		conn.on('close', () => {
			delete state.multiplayer.clientConns[conn.peer];
			delete state.multiplayer.players[conn.peer];
		});
	});

	peer.on('error', (err) => {
		statusEl.style.color = '#ff8080';
		statusEl.innerText = 'Ошибка: ' + err.type;
	});
}

function joinGame() {
	const hostId = document.getElementById("mp-room").value.trim();
	const name = document.getElementById("mp-name").value.trim() || 'Игрок';
	const statusEl = document.getElementById("mp-status");

	if (!hostId) {
		statusEl.style.color = '#ff8080';
		statusEl.innerText = 'Введите Room ID Хоста.';
		return;
	}

	statusEl.style.color = '#ffd23a';
	statusEl.innerText = 'Подключение к ' + hostId + '...';

	const peerOptions = { config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }, { urls: 'stun:stun3.l.google.com:19302' }, { urls: 'stun:stun4.l.google.com:19302' }] } };
	const peer = new Peer(undefined, peerOptions);

	peer.on('open', (id) => {
		state.multiplayer.myId = id;
		const conn = peer.connect(hostId);

		conn.on('open', () => {
			statusEl.style.color = '#aaffaa';
			statusEl.innerText = 'Успешно подключено!';

			state.multiplayer.enabled = true;
			state.multiplayer.isHost = false;
			state.multiplayer.isClient = true;
			state.multiplayer.peer = peer;
			state.multiplayer.conn = conn;
			state.multiplayer.myName = name;
		});

		conn.on('data', (msg) => {
			if (msg.type === 'init') {
				state.difficulty = msg.difficulty;
				state.map = msg.mapData;
				rebuild3DMap();
				initNetworkGame(msg.spawnX, msg.spawnY);
			} else if (msg.type === 'state') {
				state.enemies = msg.enemies;
				
				let me = null;
				state.multiplayer.players = msg.players;
				const bossEntry = msg.enemies.find(e => e.type === 'boss');
				if (bossEntry) { state.hasBoss = true; bossUi.style.display = 'block'; bossHpUi.innerText = Math.max(0, Math.floor(bossEntry.health)); } else { state.hasBoss = false; bossUi.style.display = 'none'; }
				
				state.pickups = msg.pickups || [];
				state.enemyProjectiles = msg.enemyProjectiles || [];
			} else if (msg.type === 'enemyDied') {
				// handled by sync state
			}
		});

		conn.on('close', () => {
			showCenterMessage('Соединение с хостом потеряно');
			state.multiplayer.enabled = false;
		});
	});

	peer.on('error', (err) => {
		statusEl.style.color = '#ff8080';
		statusEl.innerText = 'Ошибка: ' + err.type;
	});
}

function broadcastState() {
	if (!state.multiplayer.isHost) return;

	state.multiplayer.players[state.multiplayer.myId] = {
		id: state.multiplayer.myId,
		name: state.multiplayer.myName,
		x: state.playerX,
		y: state.playerY,
		health: state.health,
		score: state.score,
		alive: state.health > 0,
		isShooting: state.isShooting,
		weapon: state.currentWeapon,
		angle: state.playerAngle,
		pitch: state.playerPitch
	};

	const stateMsg = {
		type: 'state',
		enemies: state.enemies.map(e => ({ id: e.id, type: e.type, x: e.x, y: e.y, z: e.z || 0, health: e.health, maxHealth: e.maxHealth, size: e.size, isFlying: e.isFlying })),
		players: state.multiplayer.players,
		pickups: state.pickups,
		enemyProjectiles: state.enemyProjectiles
	};

	for (let peerId in state.multiplayer.clientConns) {
		const conn = state.multiplayer.clientConns[peerId];
		if (conn && conn.open) {
			conn.send(stateMsg);
		}
	}
}

function sendNetworkInput() {
	if (state.multiplayer.isClient && state.multiplayer.conn && state.multiplayer.conn.open) {
		state.multiplayer.conn.send({
			type: 'input',
			name: state.multiplayer.myName,
			x: state.playerX,
			y: state.playerY,
			health: state.health,
			score: state.score,
			alive: state.health > 0,
			isShooting: state.isShooting,
			weapon: state.currentWeapon,
			angle: state.playerAngle,
			pitch: state.playerPitch
		});
	}
}

function sendNetworkHit(enemyId, damage) {
	if (state.multiplayer.isClient && state.multiplayer.conn && state.multiplayer.conn.open) {
		state.multiplayer.conn.send({ type: 'hit', enemyId: enemyId, damage: damage });
	} else if (state.multiplayer.isHost) {
		const enemy = state.enemies.find(e => e.id === enemyId);
		if (enemy) enemy.health -= damage;
	}
}
