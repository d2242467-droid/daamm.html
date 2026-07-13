		function showCenterMessage(text) { state.messageText = text; state.messageTimer = 2.5; }

		function addDamageIndicator(sourceAngle) {
			let relAngle = sourceAngle - state.playerAngle;
			let degrees = (relAngle * 180 / Math.PI) - 90;

			let container = document.getElementById('damage-container');
			if (!container) return;
			let arc = document.createElement('div');
			arc.className = 'damage-arc';
			arc.style.setProperty('--deg', `${degrees}deg`);
			container.appendChild(arc);

			setTimeout(() => arc.remove(), 600);
		}

		function toggleShop() {
			if (state.gameState === 'START' || state.gameState === 'GAMEOVER') return;
			if (state.multiplayer.enabled) { showCenterMessage('Магазин недоступен в сети'); return; }
			if (state.gameState === 'PLAYING') {
				state.gameState = 'SHOP'; document.exitPointerLock(); updateShopUI();
				document.getElementById("shop-overlay").style.display = "flex";
			} else if (state.gameState === 'SHOP') {
				state.gameState = 'PLAYING'; document.getElementById("shop-overlay").style.display = "none";
				canvas.requestPointerLock();
			}
		}

		function updateShopUI() {
			document.getElementById("shop-score").innerText = `ВАШ СЧЕТ (ВАЛЮТА): ${state.score}`;
			document.getElementById("desc-health").innerText = `Текущий максимум: ${state.maxHealth} HP. Увеличится до ${state.maxHealth + 25} HP.`;
			document.getElementById("cost-health").innerText = state.shopCosts.health; document.getElementById("btn-buy-health").disabled = state.score < state.shopCosts.health;
			document.getElementById("desc-damage").innerText = `Текущий урон: +${Math.round((state.damageMultiplier - 1.0) * 100)}%. Увеличится еще на +15%.`;
			document.getElementById("cost-damage").innerText = state.shopCosts.damage; document.getElementById("btn-buy-damage").disabled = state.score < state.shopCosts.damage;
			const rBtn = document.getElementById("btn-buy-rifle");
			if (state.weaponsUnlocked.rifle) { rBtn.innerText = "КУПЛЕНО"; rBtn.disabled = true; } else { rBtn.innerHTML = `Разблокировать [2] <br> <span>${state.shopCosts.rifle}</span> очков`; rBtn.disabled = state.score < state.shopCosts.rifle; }
			const rkBtn = document.getElementById("btn-buy-rocket");
			if (state.weaponsUnlocked.rocket) { rkBtn.innerText = "КУПЛЕНО"; rkBtn.disabled = true; } else { rkBtn.innerHTML = `Разблокировать [3] <br> <span>${state.shopCosts.rocket}</span> очков`; rkBtn.disabled = state.score < state.shopCosts.rocket; }
			const mgBtn = document.getElementById("btn-buy-minigun");
			if (state.weaponsUnlocked.minigun) { mgBtn.innerText = "КУПЛЕНО"; mgBtn.disabled = true; } else { mgBtn.innerHTML = `Разблокировать [4] <br> <span>${state.shopCosts.minigun}</span> очков`; mgBtn.disabled = state.score < state.shopCosts.minigun; }
			document.getElementById("desc-clip").innerText = `Дробовик: ${state.maxShotgunClip} | Автомат: ${state.maxRifleClip} | Пулемет: ${state.maxMinigunClip}. Улучшает все сразу.`;
			document.getElementById("cost-clipCapacity").innerText = state.shopCosts.clipCapacity; document.getElementById("btn-buy-clipCapacity").disabled = state.score < state.shopCosts.clipCapacity;
			document.getElementById("cost-frag").innerText = state.shopCosts.frag; document.getElementById("btn-buy-frag").disabled = state.score < state.shopCosts.frag;
			document.getElementById("cost-molotov").innerText = state.shopCosts.molotov; document.getElementById("btn-buy-molotov").disabled = state.score < state.shopCosts.molotov;
			document.getElementById("cost-flash").innerText = state.shopCosts.flash; document.getElementById("btn-buy-flash").disabled = state.score < state.shopCosts.flash;
			document.getElementById("cost-ammo").innerText = state.shopCosts.ammo; document.getElementById("btn-buy-ammo").disabled = state.score < state.shopCosts.ammo;
		}

		function buyUpgrade(type) {
			if (state.score < state.shopCosts[type]) return;
			initAudio(); playPickupSound();
			if (type === 'health') {
				state.score -= state.shopCosts.health; state.maxHealth += 25; state.health += 25; if (state.health > state.maxHealth) state.health = state.maxHealth;
				state.shopCosts.health = Math.floor(state.shopCosts.health * 1.5); showCenterMessage("Куплено: +25 Макс. Здоровья!");
			} else if (type === 'damage') {
				state.score -= state.shopCosts.damage; state.damageMultiplier += 0.15; state.shopCosts.damage = Math.floor(state.shopCosts.damage * 1.6); showCenterMessage("Куплено: +15% к Силе Атаки!");
			} else if (type === 'rifle') {
				state.score -= state.shopCosts.rifle; state.weaponsUnlocked.rifle = true; showCenterMessage("Разблокирован: Автомат [2]!");
			} else if (type === 'rocket') {
				state.score -= state.shopCosts.rocket; state.weaponsUnlocked.rocket = true; showCenterMessage("Разблокирована: Ракетница [3]!");
			} else if (type === 'minigun') {
				state.score -= state.shopCosts.minigun; state.weaponsUnlocked.minigun = true; showCenterMessage("Разблокирован: Пулемет [4]!");
			} else if (type === 'clipCapacity') {
				state.score -= state.shopCosts.clipCapacity; state.maxShotgunClip += 1; state.maxRifleClip += 10; state.maxMinigunClip += 25;
				state.shotgunClip = Math.min(state.maxShotgunClip, state.shotgunClip); state.rifleClip = Math.min(state.maxRifleClip, state.rifleClip); state.minigunClip = Math.min(state.maxMinigunClip, state.minigunClip);
				state.shopCosts.clipCapacity = Math.floor(state.shopCosts.clipCapacity * 1.6); showCenterMessage("Куплено: Больше патронов в магазине!");
			} else if (type === 'frag') {
				state.score -= state.shopCosts.frag; state.grenadeCounts.frag += 2; state.shopCosts.frag = Math.floor(state.shopCosts.frag * 1.4);
				showCenterMessage("Куплено: +2 Осколочные гранаты!"); updateGrenadeUi();
			} else if (type === 'molotov') {
				state.score -= state.shopCosts.molotov; state.grenadeCounts.molotov += 2; state.shopCosts.molotov = Math.floor(state.shopCosts.molotov * 1.4);
				showCenterMessage("Куплено: +2 Коктейля Молотова!"); updateGrenadeUi();
			} else if (type === 'flash') {
				state.score -= state.shopCosts.flash; state.grenadeCounts.flash += 2; state.shopCosts.flash = Math.floor(state.shopCosts.flash * 1.4);
				showCenterMessage("Куплено: +2 Светошумовые гранаты!"); updateGrenadeUi();
			} else if (type === 'ammo') {
				state.score -= state.shopCosts.ammo; state.ammo = Math.min(200, state.ammo + 50); showCenterMessage("Получены боеприпасы (+50)!");
			}
			scoreUi.innerText = state.score; healthUi.innerText = state.health; ammoUi.innerText = state.ammo; updateShopUI(); saveProgress();
		}

		function toggleMpPanel() { const panel = document.getElementById("mp-panel"); panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; }

		function updateDifficultyUi() {
			const label = config.DIFFICULTY_SETTINGS[state.difficulty].label; const el = document.getElementById("difficulty-val");
			const mapLabel = config.MAP_LABELS[state.selectedMapName] || state.selectedMapName;
			if (el) el.innerText = `${label} — ${mapLabel}` + (state.multiplayer.enabled ? ' (СЕТЬ)' : '');
		}

		function updateGrenadeUi() {
			const el = document.getElementById("grenade-val");
			if (!el) return;
			const names = { frag: 'ГРАНАТА', molotov: 'МОЛОТОВ', flash: 'СВЕТОШУМОВАЯ' };
			el.innerText = `${names[state.currentGrenadeType]} (${state.grenadeCounts[state.currentGrenadeType]}) [Q]`;
		}

		function triggerFlashOverlay() { state.flashOverlayTimer = 1.2; }

