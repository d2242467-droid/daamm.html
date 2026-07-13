		function findOpenSpawnCell(preferX, preferY) {
			// Раскручивающийся поиск ближайшей открытой (0) клетки от предпочитаемой точки,
			// чтобы игрок никогда не появлялся внутри стены на любой из карт.
			const maxRadius = config.mapSize;
			for (let r = 0; r <= maxRadius; r++) {
				for (let dy = -r; dy <= r; dy++) {
					for (let dx = -r; dx <= r; dx++) {
						if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
						const cx = preferX + dx, cy = preferY + dy;
						if (cx <= 0 || cy <= 0 || cx >= config.mapSize - 1 || cy >= config.mapSize - 1) continue;
						if (state.map[cy * config.mapSize + cx] === 0) return { x: cx + 0.5, y: cy + 0.5 };
					}
				}
			}
			return { x: config.mapSize / 2 + 0.5, y: config.mapSize / 2 + 0.5 };
		}

		function spawnBlood(x, y, count = 6) {
			for (let i = 0; i < count; i++) {
				state.particles.push({ x: x + (Math.random() - 0.5) * 0.2, y: y + (Math.random() - 0.5) * 0.2, z: 0.1 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, vz: 1 + Math.random() * 3, color: 0x990000, size: 3 + Math.random() * 4, life: 1.0, type: 'blood' });
			}
		}

		function spawnExplosion(x, y, z = 0) {
			playExplosionSound();
			for (let i = 0; i < 20; i++) {
				state.particles.push({ x: x, y: y, z: z + (Math.random() - 0.5) * 0.3, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, vz: Math.random() * 4 - 1, color: Math.random() > 0.4 ? 0xff6600 : 0xffcc00, size: 8 + Math.random() * 10, life: 0.8 + Math.random() * 0.4, type: 'fire' });
			}
		}

		function spawnEnemy(isBoss = false) {
			const settings = config.DIFFICULTY_SETTINGS[state.difficulty]; let spawned = false; let attempts = 0;

			// ДИНАМИЧЕСКОЕ МАСШТАБИРОВАНИЕ ЗДОРОВЬЯ НА СЛОЖНОМ УРОВНЕ:
			// до первого босса враги как на Лёгком, затем +50% здоровья за каждого убитого босса
			const hardScale = 1 + 0.5 * state.hardBossKillCount;
			const easyStats = config.DIFFICULTY_SETTINGS.EASY;
			const creeperHp = (state.difficulty === 'HARD') ? Math.round(easyStats.creeperHp * hardScale) : settings.creeperHp;
			const skeletonHp = (state.difficulty === 'HARD') ? Math.round(easyStats.skeletonHp * hardScale) : settings.skeletonHp;
			const flyerHp = (state.difficulty === 'HARD') ? Math.round(easyStats.flyerHp * hardScale) : settings.flyerHp;
			const bossHpValue = (state.difficulty === 'HARD') ? Math.round(settings.bossHp * hardScale) : settings.bossHp;

			while (!spawned && attempts < 150) {
				attempts++; let rx = Math.floor(Math.random() * config.mapSize); let ry = Math.floor(Math.random() * config.mapSize);
				if (state.map[ry * config.mapSize + rx] === 0 && Math.hypot(rx - state.playerX, ry - state.playerY) > 6) {
					const id = 'e_' + Math.random().toString(36).substr(2, 9);
					if (isBoss) {
						const bossHp = bossHpValue;
						state.enemies.push({ id: id, x: rx + 0.5, y: ry + 0.5, z: 0, type: 'boss', health: bossHp, maxHealth: bossHp, speed: 2.1, size: 1.3, isFlying: settings.flyingBoss, hoverPhase: Math.random() * Math.PI * 2 });
						state.hasBoss = true; bossUi.style.display = "block"; bossHpUi.innerText = bossHp;
					} else {
						let type;
						if (settings.flyingEnemies) { const r = Math.random(); type = r < 0.34 ? 'creeper' : (r < 0.67 ? 'skeleton' : 'flyer'); } else { type = Math.random() > 0.5 ? 'creeper' : 'skeleton'; }
						if (type === 'creeper') { state.enemies.push({ id: id, x: rx + 0.5, y: ry + 0.5, z: 0, type: type, health: creeperHp, maxHealth: creeperHp, speed: 1.6, size: 0.45 }); }
						else if (type === 'skeleton') { state.enemies.push({ id: id, x: rx + 0.5, y: ry + 0.5, z: 0, type: type, health: skeletonHp, maxHealth: skeletonHp, speed: 1.2, size: 0.45 }); }
						else { state.enemies.push({ id: id, x: rx + 0.5, y: ry + 0.5, z: 0.9, type: type, health: flyerHp, maxHealth: flyerHp, speed: 2.0, size: 0.4, isFlying: true, hoverPhase: Math.random() * Math.PI * 2 }); }
					}
					spawned = true;
				}
			}
		}

		function spawnPickup(x, y) { state.pickups.push({ x: x, y: y, type: Math.random() > 0.4 ? 'state.ammo' : 'state.health', bounceTimer: Math.random() * 10 }); }

		function enemyCanOccupy(x, y, radius) {
			const minX = x - radius, maxX = x + radius;
			const minY = y - radius, maxY = y + radius;
			const corners = [[minX, minY], [maxX, minY], [minX, maxY], [maxX, maxY]];
			for (let i = 0; i < 4; i++) {
				const gx = Math.floor(corners[i][0]), gy = Math.floor(corners[i][1]);
				if (gx < 0 || gy < 0 || gx >= config.mapSize || gy >= config.mapSize) return false;
				if (state.map[gy * config.mapSize + gx] !== 0) return false;
			}
			return true;
		}

		function triggerMuzzleFlash() {
			muzzleFlashTimer = config.MUZZLE_FLASH_DURATION;
		}

		function cycleGrenadeType() {
			const i = config.GRENADE_TYPES_ORDER.indexOf(state.currentGrenadeType);
			state.currentGrenadeType = config.GRENADE_TYPES_ORDER[(i + 1) % config.GRENADE_TYPES_ORDER.length];
			updateGrenadeUi();
			showCenterMessage(`Граната: ${state.currentGrenadeType === 'frag' ? 'Осколочная' : (state.currentGrenadeType === 'molotov' ? 'Молотов' : 'Светошумовая')}`);
		}

		function throwGrenade() {
			if (state.gameState !== 'PLAYING' || state.health <= 0) return;
			if (state.grenadeCounts[state.currentGrenadeType] <= 0) { showCenterMessage("Нет гранат этого типа!"); return; }
			state.grenadeCounts[state.currentGrenadeType]--;
			updateGrenadeUi();
			state.thrownGrenades.push({
				x: state.playerX + Math.cos(state.playerAngle) * 0.5, y: state.playerY + Math.sin(state.playerAngle) * 0.5, z: state.playerZ + 0.6,
				vx: Math.cos(state.playerAngle) * 9.0, vy: Math.sin(state.playerAngle) * 9.0, vz: 3.5,
				fuse: 1.7, type: state.currentGrenadeType
			});
			playRocketLaunchSound();
		}

		function detonateGrenade(g) {
			if (g.type === 'frag') {
				spawnExplosion(g.x, g.y, g.z);
				applyAoeDamage(g.x, g.y, config.FRAG_RADIUS, config.BASE_FRAG_DAMAGE * state.damageMultiplier, true);
			} else if (g.type === 'molotov') {
				spawnExplosion(g.x, g.y, g.z);
				state.fireZones.push({ x: g.x, y: g.y, radius: config.MOLOTOV_RADIUS, duration: config.MOLOTOV_DURATION, particleTimer: 0 });
			} else if (g.type === 'flash') {
				spawnExplosion(g.x, g.y, g.z);
				state.enemies.forEach(enemy => {
					if (Math.hypot(enemy.x - g.x, enemy.y - g.y) < config.FLASH_RADIUS) {
						enemy.stunTimer = Math.max(enemy.stunTimer || 0, config.FLASH_STUN_DURATION);
					}
				});
				if (Math.hypot(state.playerX - g.x, state.playerY - g.y) < config.FLASH_RADIUS) {
					triggerFlashOverlay();
				}
			}
		}

		function applyAoeDamage(ex, ey, radius, dmg, includePlayer) {
			state.enemies.forEach(enemy => {
				let dist = Math.hypot(enemy.x - ex, enemy.y - ey);
				if (dist < radius) {
					let falloff = 1.0 - (dist / radius); let currentDmg = dmg * falloff;
					enemy.health -= currentDmg; spawnBlood(enemy.x, enemy.y, currentDmg / 3);
					if (enemy.type === 'boss') bossHpUi.innerText = Math.max(0, Math.floor(enemy.health));
					if (state.multiplayer.enabled && enemy.id) sendNetworkHit(enemy.id, currentDmg);
				}
			});
			if (includePlayer) {
				let distToPlayer = Math.hypot(state.playerX - ex, state.playerY - ey);
				if (distToPlayer < radius) {
					let falloff = 1.0 - (distToPlayer / radius);
					state.cameraShake = Math.max(state.cameraShake || 0, 0.4);
					state.health = Math.max(0, state.health - Math.floor(dmg * 0.6 * falloff)); healthUi.innerText = state.health;
					addDamageIndicator(Math.atan2(ey - state.playerY, ex - state.playerX)); playHurtSound();
				}
			}
		}

		function buildGrenadeMesh(type) {
			if (type === 'frag') {
				return new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshLambertMaterial({ color: 0x2f3d2a }));
			} else if (type === 'molotov') {
				const group = new THREE.Group();
				const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0x5a3a1a, transparent: true, opacity: 0.85 }));
				group.add(bottle);
				const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.06, 8), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
				liquid.position.y = -0.02; group.add(liquid);
				return group;
			} else {
				return new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 8), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
			}
		}

		function executeShot() {
			if (state.health <= 0 || state.gameState !== 'PLAYING') return;
			if (state.currentWeapon === 'shotgun') {
				// УЛУЧШЕННЫЙ ДРОБОВИК: проверка магазина и увеличенный урон
				if (!state.isReloading && state.shotgunClip > 0 && !state.isShooting && state.ammo > 0) {
					state.isShooting = true; state.shootTimer = 0; state.shotgunClip--; state.ammo--;
					ammoUi.innerText = state.ammo; weaponUi.innerText = `ДРОБОВИК [1] (${state.shotgunClip}/${state.maxShotgunClip})`;
					state.cameraShake = Math.max(state.cameraShake || 0, 0.15);
					playShotgunSound(); triggerMuzzleFlash(); checkHit(0.18, config.BASE_SHOTGUN_DAMAGE * state.damageMultiplier);
					if (state.shotgunClip <= 0 && state.ammo > 0) startShotgunReload();
				}
			} else if (state.currentWeapon === 'rifle') {
				if (!state.isReloading && state.rifleClip > 0 && state.ammo > 0 && state.rifleFireRateTimer <= 0) {
					state.isShooting = true; state.shootTimer = 0; state.rifleClip--; state.ammo--;
					ammoUi.innerText = state.ammo; weaponUi.innerText = `АВТОМАТ [2] (${state.rifleClip}/${state.maxRifleClip})`;
					state.rifleFireRateTimer = 0.12; playPlasmaSound(); triggerMuzzleFlash(); checkHit(0.06, config.BASE_RIFLE_DAMAGE * state.damageMultiplier);
					if (state.rifleClip <= 0 && state.ammo > 0) startRifleReload();
				}
			} else if (state.currentWeapon === 'minigun') {
				if (!state.isReloading && state.minigunClip > 0 && state.ammo > 0 && state.minigunFireRateTimer <= 0) {
					state.isShooting = true; state.shootTimer = 0; state.minigunClip--; state.ammo--;
					ammoUi.innerText = state.ammo; weaponUi.innerText = `ПУЛЕМЕТ [4] (${state.minigunClip}/${state.maxMinigunClip})`;
					state.minigunFireRateTimer = 0.05; playPlasmaSound(); triggerMuzzleFlash(); checkHit(0.07, config.BASE_MINIGUN_DAMAGE * state.damageMultiplier);
					if (state.minigunClip <= 0 && state.ammo > 0) startMinigunReload();
				}
			} else if (state.currentWeapon === 'rocket') {
				if (state.rocketLoaded) {
					state.isShooting = true; state.shootTimer = 0; state.rocketLoaded = false; state.rocketReloadTimer = config.rocketReloadDuration;
					state.cameraShake = Math.max(state.cameraShake || 0, 0.35);
					reloadUi.innerText = "(ЗАРЯЖАЕТСЯ...)"; playRocketLaunchSound(); triggerMuzzleFlash();
					state.projectiles.push({ x: state.playerX + Math.cos(state.playerAngle) * 0.5, y: state.playerY + Math.sin(state.playerAngle) * 0.5, z: state.playerZ + 0.5, vx: Math.cos(state.playerAngle) * 12.0, vy: Math.sin(state.playerAngle) * 12.0, vz: state.playerPitch * 8.0, damage: config.BASE_ROCKET_DAMAGE * state.damageMultiplier });
					if (state.currentWeapon === 'rocket') weaponUi.innerText = `РАКЕТНИЦА [3] (ПЕРЕЗАРЯДКА)`;
				}
			} else if (state.currentWeapon === 'melee') {
				if (state.meleeCooldownTimer <= 0) {
					state.isShooting = true; state.shootTimer = 0; state.meleeCooldownTimer = config.MELEE_COOLDOWN;
					playShotgunSound(); checkHit(0.35, config.BASE_MELEE_DAMAGE * state.damageMultiplier, config.MELEE_RANGE);
				}
			}
		}

		function startShotgunReload() {
			state.isReloading = true; state.reloadTimer = 1.2; reloadUi.innerText = "(ПЕРЕЗАРЯДКА...)"; playReloadSound();
		}

		function startRifleReload() {
			state.isReloading = true; state.reloadTimer = 1.8; reloadUi.innerText = "(ПЕРЕЗАРЯДКА...)"; playReloadSound();
		}

		function startMinigunReload() {
			state.isReloading = true; state.reloadTimer = 2.6; reloadUi.innerText = "(ПЕРЕЗАРЯДКА...)"; playReloadSound();
		}

		function checkHit(fovSpread, damage, maxRange) {
			maxRange = maxRange || Infinity;
			const rayAngle = state.playerAngle; let hitTarget = null; let minEnemyDist = Infinity;
			function hasLineOfSight(enemy) {
				const dx = enemy.x - state.playerX; const dy = enemy.y - state.playerY; const dist = Math.hypot(dx, dy);
				const steps = Math.max(10, Math.floor(dist / 0.05)); const stepX = dx / steps; const stepY = dy / steps;
				let cx = state.playerX; let cy = state.playerY;
				for (let i = 0; i < steps; i++) {
					cx += stepX; cy += stepY; const cellX = Math.floor(cx); const cellY = Math.floor(cy);
					if (cellX < 0 || cellX >= config.mapSize || cellY < 0 || cellY >= config.mapSize) return false;
					if (state.map[cellY * config.mapSize + cellX] > 0) {
						if (Math.hypot(cx - state.playerX, cy - state.playerY) + 0.2 < dist) return false;
					}
				}
				return true;
			}

			state.enemies.forEach(enemy => {
				let enemyAngle = Math.atan2(enemy.y - state.playerY, enemy.x - state.playerX);
				let angleDiff = Math.abs(enemyAngle - rayAngle);
				while (angleDiff < -Math.PI) angleDiff += Math.PI * 2; while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
				if (angleDiff < fovSpread || angleDiff > Math.PI * 2 - fovSpread) {
					let dist = Math.hypot(enemy.x - state.playerX, enemy.y - state.playerY);
					if (dist <= maxRange && dist < minEnemyDist && hasLineOfSight(enemy)) { minEnemyDist = dist; hitTarget = enemy; }
				}
			});

			if (hitTarget) {
				hitTarget.health -= damage; spawnBlood(hitTarget.x, hitTarget.y, damage / 2);
				if (hitTarget.type === 'boss') bossHpUi.innerText = Math.max(0, Math.floor(hitTarget.health));
				hitTarget.x -= Math.cos(state.playerAngle) * 0.12; hitTarget.y -= Math.sin(state.playerAngle) * 0.12;
				if (state.multiplayer.enabled && hitTarget.id) sendNetworkHit(hitTarget.id, damage);
			}
		}

		function update(dt) {
			if (state.gameState !== 'PLAYING') return;
			if (state.health <= 0) {
				state.gameState = 'GAMEOVER'; document.getElementById("death-stats").innerHTML = `Счет: <span style="color:yellow; font-size:24px;">${state.score}</span>!`;
				document.getElementById("death-overlay").style.display = 'flex'; document.exitPointerLock(); return;
			}
			if (isMouseDown) executeShot();
			if (state.messageTimer > 0) state.messageTimer -= dt;

			if (!state.isOnGround) {
				state.playerVelZ -= config.GRAVITY * dt; state.playerZ += state.playerVelZ * dt;
				const cellValue = state.map[Math.floor(state.playerY) * config.mapSize + Math.floor(state.playerX)];
				const platformHeight = (cellValue === 6) ? 1.0 : 0;
				if (state.playerZ <= platformHeight) { state.playerZ = platformHeight; state.playerVelZ = 0; state.isOnGround = true; }
			}

			const moveSpeed = 4.2 * dt; const rotSpeed = 2.4 * dt;
			if (keys['ArrowLeft']) state.playerAngle -= rotSpeed; if (keys['ArrowRight']) state.playerAngle += rotSpeed;
			let newX = state.playerX; let newY = state.playerY; state.isMoving = false;
			if (keys['KeyW'] || keys['ArrowUp']) { newX += Math.cos(state.playerAngle) * moveSpeed; newY += Math.sin(state.playerAngle) * moveSpeed; state.isMoving = true; }
			if (keys['KeyS'] || keys['ArrowDown']) { newX -= Math.cos(state.playerAngle) * moveSpeed; newY -= Math.sin(state.playerAngle) * moveSpeed; state.isMoving = true; }
			if (keys['KeyA']) { newX += Math.cos(state.playerAngle - Math.PI / 2) * moveSpeed; newY += Math.sin(state.playerAngle - Math.PI / 2) * moveSpeed; state.isMoving = true; }
			if (keys['KeyD']) { newX += Math.cos(state.playerAngle + Math.PI / 2) * moveSpeed; newY += Math.sin(state.playerAngle + Math.PI / 2) * moveSpeed; state.isMoving = true; }

			let canPassPlatforms = state.playerZ > 1.3;
			let cellValueX = state.map[Math.floor(state.playerY) * config.mapSize + Math.floor(newX)];
			if (cellValueX === 0 || (cellValueX === 6 && canPassPlatforms)) state.playerX = newX;
			let cellValueY = state.map[Math.floor(newY) * config.mapSize + Math.floor(state.playerX)];
			if (cellValueY === 0 || (cellValueY === 6 && canPassPlatforms)) state.playerY = newY;

			if (state.rifleFireRateTimer > 0) state.rifleFireRateTimer -= dt;
			if (state.minigunFireRateTimer > 0) state.minigunFireRateTimer -= dt;
			if (state.meleeCooldownTimer > 0) state.meleeCooldownTimer -= dt;
			if (state.isShooting) { state.shootTimer += dt * 16; if (state.shootTimer > 4) state.isShooting = false; }
			state.walkCycle += state.isMoving ? dt * 11 : 0;

			// ЗАТУХАНИЕ ВСПЫШКИ ВЫСТРЕЛА
			if (muzzleFlashTimer > 0) {
				muzzleFlashTimer -= dt;
				if (muzzleLight) muzzleLight.intensity = Math.max(0, muzzleFlashTimer / config.MUZZLE_FLASH_DURATION) * 4.5;
			} else if (muzzleLight && muzzleLight.intensity !== 0) {
				muzzleLight.intensity = 0;
			}

			if (state.isReloading) {
				state.reloadTimer -= dt;
				if (state.reloadTimer <= 0) {
					state.isReloading = false; reloadUi.innerText = "";
					if (state.currentWeapon === 'shotgun') {
						state.shotgunClip = Math.min(state.maxShotgunClip, state.ammo);
						weaponUi.innerText = `ДРОБОВИК [1] (${state.shotgunClip}/${state.maxShotgunClip})`;
					} else if (state.currentWeapon === 'rifle') {
						state.rifleClip = Math.min(state.maxRifleClip, state.ammo);
						weaponUi.innerText = `АВТОМАТ [2] (${state.rifleClip}/${state.maxRifleClip})`;
					} else if (state.currentWeapon === 'minigun') {
						state.minigunClip = Math.min(state.maxMinigunClip, state.ammo);
						weaponUi.innerText = `ПУЛЕМЕТ [4] (${state.minigunClip}/${state.maxMinigunClip})`;
					}
				}
			}

			if (!state.rocketLoaded) {
				state.rocketReloadTimer -= dt;
				if (state.rocketReloadTimer <= 0) {
					state.rocketLoaded = true; reloadUi.innerText = "";
					if (state.currentWeapon === 'rocket') weaponUi.innerText = `РАКЕТНИЦА [3] (ГОТОВА)`;
				}
			}

			state.projectiles = state.projectiles.filter(p => {
				p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
				let cx = Math.floor(p.x); let cy = Math.floor(p.y);
				if (cx < 0 || cx >= config.mapSize || cy < 0 || cy >= config.mapSize || state.map[cy * config.mapSize + cx] > 0) {
					spawnExplosion(p.x, p.y, p.z); explodeInRadius(p.x, p.y, p.damage); return false;
				}
				for (let enemy of state.enemies) {
					if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < 0.45) {
						spawnExplosion(p.x, p.y, p.z); explodeInRadius(p.x, p.y, p.damage); return false;
					}
				}
				return true;
			});

			function explodeInRadius(ex, ey, dmg) {
				state.enemies.forEach(enemy => {
					let dist = Math.hypot(enemy.x - ex, enemy.y - ey);
					if (dist < 3.2) {
						let damageMultiplierLocal = 1.0 - (dist / 3.2); let currentDmg = dmg * damageMultiplierLocal;
						enemy.health -= currentDmg; spawnBlood(enemy.x, enemy.y, currentDmg / 3);
						enemy.x += ((enemy.x - ex) / dist) * 0.7 * damageMultiplierLocal; enemy.y += ((enemy.y - ey) / dist) * 0.7 * damageMultiplierLocal;
						if (enemy.type === 'boss') bossHpUi.innerText = Math.max(0, Math.floor(enemy.health));
						if (state.multiplayer.enabled && enemy.id) sendNetworkHit(enemy.id, currentDmg);
					}
				});
				let distToPlayer = Math.hypot(state.playerX - ex, state.playerY - ey);
				if (distToPlayer < 2.5) {
					let dmgFactor = 1.0 - (distToPlayer / 2.5);
					state.cameraShake = Math.max(state.cameraShake || 0, 0.3);
					state.health = Math.max(0, state.health - Math.floor(40 * dmgFactor)); healthUi.innerText = state.health;
					addDamageIndicator(Math.atan2(ey - state.playerY, ex - state.playerX)); playHurtSound();
				}
			}

			// ПРОВЕРКА ЛИНИИ ОГНЯ ОТ ВРАГА К ИГРОКУ (для скелетов-стрелков)
			function enemyHasLineOfSight(enemy) {
				const dx = state.playerX - enemy.x; const dy = state.playerY - enemy.y; const dist = Math.hypot(dx, dy);
				const steps = Math.max(6, Math.floor(dist / 0.25)); const stepX = dx / steps; const stepY = dy / steps;
				let cx = enemy.x; let cy = enemy.y;
				for (let i = 0; i < steps; i++) {
					cx += stepX; cy += stepY;
					const cellX = Math.floor(cx); const cellY = Math.floor(cy);
					if (cellX < 0 || cellX >= config.mapSize || cellY < 0 || cellY >= config.mapSize) return false;
					if (state.map[cellY * config.mapSize + cellX] > 0) return false;
				}
				return true;
			}

			// СНАРЯДЫ ВРАГОВ (плазменные болты скелетов-стрелков)
			if (!state.multiplayer.enabled || state.multiplayer.isHost) {
				state.enemyProjectiles = state.enemyProjectiles.filter(p => {
					p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
					let cx = Math.floor(p.x); let cy = Math.floor(p.y);
					if (cx < 0 || cx >= config.mapSize || cy < 0 || cy >= config.mapSize || state.map[cy * config.mapSize + cx] > 0) return false;
					if (p.life <= 0) return false;
					if (Math.hypot(state.playerX - p.x, state.playerY - p.y) < 0.45) {
						state.cameraShake = Math.max(state.cameraShake || 0, 0.2);
						state.health = Math.max(0, state.health - p.damage); healthUi.innerText = state.health;
						addDamageIndicator(Math.atan2(p.y - state.playerY, p.x - state.playerX));
						spawnBlood(state.playerX, state.playerY, 3);
						if (Math.random() < 0.4) playHurtSound();
						return false;
					}
					return true;
				});
			}

			// ФИЗИКА БРОШЕННЫХ ГРАНАТ (полёт по дуге под гравитацией, взрыв при касании земли/стены/по таймеру)
			if (!state.multiplayer.enabled || state.multiplayer.isHost) {
				state.thrownGrenades = state.thrownGrenades.filter(g => {
					g.vz -= config.GRAVITY * dt;
					const nx = g.x + g.vx * dt; const ny = g.y + g.vy * dt;
					g.z += g.vz * dt; g.fuse -= dt;
					const cx = Math.floor(nx); const cy = Math.floor(ny);
					const hitWall = cx < 0 || cx >= config.mapSize || cy < 0 || cy >= config.mapSize || state.map[cy * config.mapSize + cx] > 0;
					if (!hitWall) { g.x = nx; g.y = ny; } else { g.vx *= -0.3; g.vy *= -0.3; }
					if (g.z <= 0.05) { g.z = 0.05; detonateGrenade(g); return false; }
					if (g.fuse <= 0) { detonateGrenade(g); return false; }
					return true;
				});

				// ОГНЕННЫЕ ЗОНЫ ОТ КОКТЕЙЛЯ МОЛОТОВА (урон по времени)
				state.fireZones = state.fireZones.filter(fz => {
					fz.duration -= dt; fz.particleTimer -= dt;
					if (fz.particleTimer <= 0) {
						fz.particleTimer = 0.12;
						spawnBlood(fz.x + (Math.random() - 0.5) * fz.radius, fz.y + (Math.random() - 0.5) * fz.radius, 1);
					}
					state.enemies.forEach(enemy => {
						if (Math.hypot(enemy.x - fz.x, enemy.y - fz.y) < fz.radius) {
							enemy.health -= config.MOLOTOV_TICK_DAMAGE * dt;
							if (enemy.type === 'boss') bossHpUi.innerText = Math.max(0, Math.floor(enemy.health));
						}
					});
					if (Math.hypot(state.playerX - fz.x, state.playerY - fz.y) < fz.radius) {
						state.health = Math.max(0, state.health - config.MOLOTOV_TICK_DAMAGE * dt); healthUi.innerText = Math.floor(state.health);
					}
					return fz.duration > 0;
				});
			}

			if (state.flashOverlayTimer > 0) {
				state.flashOverlayTimer -= dt;
				const el = document.getElementById("flash-overlay");
				if (el) el.style.opacity = Math.max(0, state.flashOverlayTimer / 1.2) * 0.9;
			}

			state.pickups = state.pickups.filter(p => {
				if (Math.hypot(state.playerX - p.x, state.playerY - p.y) < 0.6) {
					playPickupSound();
					if (p.type === 'state.health') { state.health = Math.min(state.maxHealth, state.health + 25); healthUi.innerText = state.health; }
					else { state.ammo = Math.min(200, state.ammo + 35); ammoUi.innerText = state.ammo; }
					return false;
				}
				return true;
			});

			state.particles = state.particles.filter(p => {
				p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
				if (p.type === 'blood') { p.vz -= config.GRAVITY * 0.5 * dt; if (p.z <= 0) { p.z = 0; p.vx = 0; p.vy = 0; p.vz = 0; } }
				return p.life > 0;
			});

			if (!state.multiplayer.enabled || state.multiplayer.isHost) {
				state.regularSpawnTimer += dt;
				if (state.regularSpawnTimer >= config.DIFFICULTY_SETTINGS[state.difficulty].spawnInterval) {
					spawnEnemy(false); spawnEnemy(false); state.regularSpawnTimer = 0;
				}
				state.bossSpawnTimer += dt;
				if (state.bossSpawnTimer >= 180 && !state.hasBoss) { spawnEnemy(true); state.bossSpawnTimer = 0; }

				state.enemies = state.enemies.filter(enemy => {
					if (enemy.health <= 0) {
						spawnPickup(enemy.x, enemy.y);
						if (enemy.type === 'boss') {
							state.score += 2500; state.hasBoss = false; bossUi.style.display = "none";
							if (state.difficulty === 'HARD') state.hardBossKillCount++; // ДИНАМИЧЕСКОЕ МАСШТАБИРОВАНИЕ ЗДОРОВЬЯ
						}
						else { state.score += enemy.type === 'creeper' ? 100 : 150; }
						scoreUi.innerText = state.score; return false;
					}

					// СВЕТОШУМОВАЯ ГРАНАТА: враг оглушён - не двигается и не атакует
					if (enemy.stunTimer > 0) {
						enemy.stunTimer -= dt;
						return true;
					}

					if (enemy.isFlying) {
						enemy.hoverPhase += dt * 2.2; enemy.z = 0.9 + Math.sin(enemy.hoverPhase) * 0.15;
					}

					let dx = state.playerX - enemy.x; let dy = state.playerY - enemy.y; let dist = Math.hypot(dx, dy);

					// ФИКС ЗАСТРЕВАНИЯ В СТЕНАХ: коллизия с учетом радиуса врага + скольжение вдоль стен + рывок при полном застревании
					if (dist < 22 && dist > 0.35) {
						const radius = Math.min(enemy.size * 0.42, 0.42);
						let stepX = (dx / dist) * enemy.speed * dt;
						let stepY = (dy / dist) * enemy.speed * dt;
						let moved = false;

						if (enemyCanOccupy(enemy.x + stepX, enemy.y, radius)) {
							enemy.x += stepX; moved = true;
						} else {
							stepY *= 1.35;
						}

						if (enemyCanOccupy(enemy.x, enemy.y + stepY, radius)) {
							enemy.y += stepY; moved = true;
						} else if (enemyCanOccupy(enemy.x + stepX * 1.35, enemy.y, radius)) {
							enemy.x += stepX * 1.35; moved = true;
						}

						if (!moved) {
							// Полностью застрял (например, во внутреннем углу) - выталкиваем случайным рывком
							enemy.stuckTimer = (enemy.stuckTimer || 0) + dt;
							if (enemy.stuckTimer > 0.6) {
								for (let tries = 0; tries < 8; tries++) {
									const jAngle = Math.random() * Math.PI * 2;
									const jx = enemy.x + Math.cos(jAngle) * 0.35;
									const jy = enemy.y + Math.sin(jAngle) * 0.35;
									if (enemyCanOccupy(jx, jy, radius)) { enemy.x = jx; enemy.y = jy; break; }
								}
								enemy.stuckTimer = 0;
							}
						} else {
							enemy.stuckTimer = 0;
						}
					}

					if (dist <= 0.6) {
						if (enemy.type === 'creeper') {
							state.cameraShake = Math.max(state.cameraShake || 0, 0.5);
							state.health -= 45; enemy.health = 0; spawnExplosion(enemy.x, enemy.y, 0.2);
						} else if (enemy.type === 'boss') { state.cameraShake = Math.max(state.cameraShake || 0, 0.1); state.health -= 45 * dt; } else { state.cameraShake = Math.max(state.cameraShake || 0, 0.05); state.health -= 14 * dt; }
						state.health = Math.max(0, Math.floor(state.health)); healthUi.innerText = state.health;

						// ВЫЗОВ НАПРАВЛЕННОГО ИНДИКАТОРА УРОНА (ДУГА ВОКРУГ ПРИЦЕЛА)
						addDamageIndicator(Math.atan2(enemy.y - state.playerY, enemy.x - state.playerX));
						if (Math.random() < 0.15) playHurtSound();
					}
					return true;
				});

				if (state.multiplayer.isHost) {
					state.multiplayer.inputSendTimer = (state.multiplayer.inputSendTimer || 0) + dt;
					if (state.multiplayer.inputSendTimer >= 0.08) {
						state.multiplayer.inputSendTimer = 0;
						if (typeof broadcastState === 'function') broadcastState();
					}
				}
			} else {
				state.multiplayer.inputSendTimer = (state.multiplayer.inputSendTimer || 0) + dt;
				if (state.multiplayer.inputSendTimer >= 0.08) {
					state.multiplayer.inputSendTimer = 0;
					if (typeof sendNetworkInput === 'function') sendNetworkInput();
				}
			}
		}

		function startGame(chosenDifficulty) {
			state.multiplayer.enabled = false;
			if (state.multiplayer.peer) { try { state.multiplayer.peer.destroy(); } catch (e) { } state.multiplayer.peer = null; }
			if (chosenDifficulty) state.difficulty = chosenDifficulty;
			state.map = config.MAPS[state.selectedMapName].slice();
			if (mapBlocksGroup) rebuild3DMap();
			const spawn = findOpenSpawnCell(3, 3);
			state.playerX = spawn.x; state.playerY = spawn.y; state.playerAngle = 0.0; state.playerPitch = 0.0;
			initAudio(); document.getElementById("start-overlay").style.display = 'none';
			updateGrenadeUi(); state.gameState = 'PLAYING'; startBackgroundMusic(); updateDifficultyUi(); canvas.requestPointerLock();
		}

		function selectMap(name) {
			state.selectedMapName = name;
			document.querySelectorAll('.map-select-btn').forEach(btn => {
				btn.style.outline = (btn.dataset.map === name) ? '3px solid #ffd700' : 'none';
			});
		}

		function restartGame() {
			if (state.multiplayer.enabled) {
				if (typeof sendNetworkInput === 'function') sendNetworkInput();
				state.playerZ = 0; state.playerVelZ = 0; state.isOnGround = true; state.ammo = 100; state.shotgunClip = state.maxShotgunClip; state.rifleClip = state.maxRifleClip; state.minigunClip = state.maxMinigunClip; state.isReloading = false; state.reloadTimer = 0; state.meleeCooldownTimer = 0;
				state.thrownGrenades = []; state.fireZones = [];
				state.projectiles = []; state.particles = []; document.getElementById("death-overlay").style.display = 'none'; document.getElementById("shop-overlay").style.display = 'none';
				ammoUi.innerText = state.ammo; weaponUi.innerText = `ДРОБОВИК [1] (${state.shotgunClip}/${state.maxShotgunClip})`; reloadUi.innerText = ""; state.gameState = 'PLAYING'; canvas.requestPointerLock();
				return;
			}
			const spawn = findOpenSpawnCell(3, 3);
			state.playerX = spawn.x; state.playerY = spawn.y; state.playerAngle = 0.0; state.playerPitch = 0.0; state.playerZ = 0; state.playerVelZ = 0; state.isOnGround = true;
			state.health = 100; state.maxHealth = 100; state.damageMultiplier = 1.0; state.score = 0; state.ammo = 100;
			state.maxShotgunClip = 2; state.maxRifleClip = 30; state.maxMinigunClip = 100; state.shotgunClip = 2; state.rifleClip = 30; state.minigunClip = 100;
			state.currentWeapon = 'shotgun'; state.rocketLoaded = true; state.hasBoss = false; state.isReloading = false; state.reloadTimer = 0; state.meleeCooldownTimer = 0; state.hardBossKillCount = 0;
			state.weaponsUnlocked = { shotgun: true, rifle: false, rocket: false, minigun: false };
			state.shopCosts = { health: 300, damage: 400, rifle: 800, rocket: 1500, minigun: 2000, ammo: 150, clipCapacity: 700, frag: 250, molotov: 300, flash: 300 };
			state.grenadeCounts = { frag: 0, molotov: 0, flash: 0 }; state.currentGrenadeType = 'frag'; state.thrownGrenades = []; state.fireZones = [];
			state.enemies = []; state.projectiles = []; state.particles = []; state.pickups = [];
			bossUi.style.display = "none"; document.getElementById("death-overlay").style.display = 'none'; document.getElementById("shop-overlay").style.display = 'none';
			for (let i = 0; i < 7; i++) spawnEnemy(false);
			healthUi.innerText = state.health; scoreUi.innerText = state.score; ammoUi.innerText = state.ammo; weaponUi.innerText = "ДРОБОВИК [1] (2/2)"; reloadUi.innerText = "";
			updateGrenadeUi(); updateWeaponVisibility(); state.gameState = 'PLAYING'; initAudio(); updateDifficultyUi(); canvas.requestPointerLock();
		}

