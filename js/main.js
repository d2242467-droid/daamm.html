const canvas = document.getElementById("gameCanvas");
		const minimapCanvas = document.getElementById("minimapCanvas");
		const mctx = minimapCanvas.getContext("2d");

		const ammoUi = document.getElementById("ammo-val");
		const healthUi = document.getElementById("health-val");
		const scoreUi = document.getElementById("score-val");
		const weaponUi = document.getElementById("weapon-name");
		const bossUi = document.getElementById("boss-ui");
		const bossHpUi = document.getElementById("boss-hp");
		const reloadUi = document.getElementById("reload-msg");

		state.gameState = 'START';

		config.mapSize = 32;

		// КАРТЫ BRAWL STARS (32x32)
		config.MAPS = {
			// 1. Классическая карта
			CLASSIC: [
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 2, 0, 0, 2, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 5, 5, 0, 0, 0, 0, 5, 5, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 1,
				1, 0, 0, 0, 4, 4, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 4, 4, 0, 0, 0, 1,
				1, 0, 1, 0, 4, 4, 0, 0, 5, 5, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0, 0, 5, 5, 0, 0, 4, 4, 0, 1, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 1, 0, 4, 4, 0, 0, 5, 5, 0, 0, 0, 5, 5, 0, 0, 5, 5, 0, 0, 0, 5, 5, 0, 0, 4, 4, 0, 1, 0, 1,
				1, 0, 0, 0, 4, 4, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0, 0, 4, 4, 0, 0, 0, 1,
				1, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 5, 5, 0, 0, 0, 0, 5, 5, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 2, 0, 0, 2, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
			],
			// 2. Шорох листьев / Rustling Leaves (Средне - много кустов и фланговых коридоров)
			SCATTERED: [
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1,
				1, 2, 2, 0, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 0, 2, 2, 1,
				1, 2, 2, 0, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 0, 2, 2, 1,
				1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1,
				1, 0, 0, 0, 3, 0, 0, 2, 2, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 2, 2, 0, 0, 3, 0, 0, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 0, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 2, 2, 0, 0, 0, 2, 2, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1,
				1, 0, 0, 0, 3, 0, 0, 2, 2, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 0, 2, 2, 0, 0, 3, 0, 0, 0, 1,
				1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1,
				1, 2, 2, 0, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 0, 2, 2, 1,
				1, 2, 2, 0, 0, 0, 3, 3, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 0, 0, 1, 1, 0, 0, 3, 3, 0, 0, 0, 2, 2, 1,
				1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
			],
			// 3. Разбросанная арена / Scattered Arena (Сложно - на основе карты из Brawl Stars)
			CHAOS: [
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
			],
			// 4. Алмазная арена
			DIAMOND: [
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 5, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 5, 5, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
			]
		};
		state.selectedMapName = 'CLASSIC';
		config.MAP_LABELS = { CLASSIC: 'Классика', SCATTERED: 'Шорох Листьев', CHAOS: 'Арена Хаоса', DIAMOND: 'Алмазная Арена' };
		state.map = config.MAPS[state.selectedMapName].slice();


		state.playerX = 3.5;
		state.playerY = 3.5;
		state.playerAngle = 0.0;
		state.playerPitch = 0.0;
		state.health = 100;
		state.maxHealth = 100;
		state.damageMultiplier = 1.0;
		state.score = 0;
		state.playerZ = 0;
		state.playerVelZ = 0;
		state.isOnGround = true;
		config.GRAVITY = 20.0;
		config.JUMP_VELOCITY = 8.0;

		config.DIFFICULTY_SETTINGS = {
			EASY: { label: "ЛЕГКО", spawnInterval: 20, creeperHp: 50, skeletonHp: 100, flyerHp: 100, spiderHp: 70, bruteHp: 0, bossHp: 1000, flyingEnemies: false, flyingBoss: false, spidersEnabled: false, brutesEnabled: false },
			MEDIUM: { label: "СРЕДНЕ", spawnInterval: 10, creeperHp: 200, skeletonHp: 200, flyerHp: 200, spiderHp: 150, bruteHp: 350, bossHp: 2000, flyingEnemies: true, flyingBoss: false, spidersEnabled: true, brutesEnabled: false },
			HARD: { label: "СЛОЖНО", spawnInterval: 10, creeperHp: 500, skeletonHp: 500, flyerHp: 500, spiderHp: 400, bruteHp: 900, bossHp: 5000, flyingEnemies: true, flyingBoss: true, spidersEnabled: true, brutesEnabled: true }
		};
		state.difficulty = 'EASY';

		state.multiplayer = { enabled: false, ws: null, myId: null, players: {}, inputSendTimer: 0 };
		state.weaponsUnlocked = { shotgun: true, rifle: false, rocket: false, minigun: false };
		state.shopCosts = { health: 300, damage: 400, rifle: 800, rocket: 1500, minigun: 2000, ammo: 150, clipCapacity: 700, frag: 250, molotov: 300, flash: 300 };

		// МАГАЗИН: МАКС. ЁМКОСТЬ ОБОЙМ (растёт при покупке в магазине)
		state.maxShotgunClip = 2;
		state.maxRifleClip = 30;
		state.maxMinigunClip = 100;

		state.currentWeapon = 'shotgun';
		state.ammo = 100;
		state.shotgunClip = 2; // УЛУЧШЕННЫЙ ДРОБОВИК: 2 патрона в магазине!
		state.rifleClip = 30;
		state.minigunClip = 100;
		state.isShooting = false;
		state.shootTimer = 0;
		state.walkCycle = 0;
		state.isMoving = false;

		state.rifleFireRateTimer = 0;
		state.minigunFireRateTimer = 0;
		state.meleeCooldownTimer = 0;
		state.isReloading = false;
		state.reloadTimer = 0;

		state.rocketLoaded = true;
		state.rocketReloadTimer = 0;
		config.rocketReloadDuration = 2.5;

		state.regularSpawnTimer = 0;
		state.bossSpawnTimer = 0;
		state.hasBoss = false;
		state.hardBossKillCount = 0; // ДИНАМИЧЕСКОЕ МАСШТАБИРОВАНИЕ ЗДОРОВЬЯ НА СЛОЖНОМ УРОВНЕ

		// УЛУЧШЕННЫЙ ДРОБОВИК: урон увеличен ровно в 2 раза (было 20, стало 40)
		config.BASE_SHOTGUN_DAMAGE = 40;
		config.BASE_RIFLE_DAMAGE = 10;
		config.BASE_ROCKET_DAMAGE = 100;
		config.BASE_MINIGUN_DAMAGE = 5;
		config.BASE_MELEE_DAMAGE = 55;
		config.MELEE_RANGE = 2.0;
		config.MELEE_COOLDOWN = 0.45;

		// ГРАНАТЫ
		state.grenadeCounts = { frag: 0, molotov: 0, flash: 0 };
		state.currentGrenadeType = 'frag';
		state.thrownGrenades = [];
		state.fireZones = [];
		config.GRENADE_TYPES_ORDER = ['frag', 'molotov', 'flash'];
		config.BASE_FRAG_DAMAGE = 110;
		config.FRAG_RADIUS = 3.5;
		config.MOLOTOV_RADIUS = 2.2;
		config.MOLOTOV_DURATION = 5.0;
		config.MOLOTOV_TICK_DAMAGE = 12; // урона в секунду
		config.FLASH_RADIUS = 6.0;
		config.FLASH_STUN_DURATION = 3.0;

		state.messageText = "";
		state.messageTimer = 0;

		state.enemies = [];
		state.projectiles = [];
		state.enemyProjectiles = [];
		state.particles = [];
		state.pickups = [];

		// ФУНКЦИЯ ДОБАВЛЕНИЯ НАПРАВЛЕННОГО ИНДИКАТОРА УРОНА (ДУГА ВОКРУГ ПРИЦЕЛА)

		let scene, camera, renderer, composer, torchLight, muzzleLight;
		let muzzleFlashTimer = 0;
		config.MUZZLE_FLASH_DURATION = 0.09;
		let mapBlocksGroup;
		let weaponPivot;
		const entityMeshes = new Map();
		let weaponMeshes = { shotgun: null, rifle: null, rocket: null, minigun: null, melee: null };
		const textures = {};



		let audioContext = null; let audioInitialized = false; let musicInterval = null; let isMusicPlaying = false; let synthVolume = 0.12;








		let bassSequence = [110, 110, 130, 110, 0, 110, 146, 0, 110, 110, 130, 110, 0, 110, 165, 146, 110, 110, 130, 110, 0, 110, 146, 0, 110, 110, 130, 110, 165, 165, 220, 0];
		let leadSequence = [0, 220, 0, 261, 293, 0, 329, 0, 0, 220, 0, 261, 392, 349, 329, 0, 0, 220, 0, 261, 293, 0, 329, 0, 0, 440, 392, 329, 293, 261, 220, 0];
		let musicStep = 0;






		// ПЕРЕСТРОЙКА КАРТЫ НА ЛЕТУ ПРИ СМЕНЕ СЛОЖНОСТИ (АРЕНЫ BRAWL STARS)

















		// ПРОВЕРКА КОЛЛИЗИИ С УЧЕТОМ РАЗМЕРА ВРАГА (проверяем все 4 угла его "коробки", а не только центр)






		for (let i = 0; i < 7; i++) spawnEnemy(false);

		const keys = {};
		window.addEventListener('keydown', e => {
			if (e.code === 'KeyE') { toggleShop(); return; }
			if (state.gameState !== 'PLAYING') return;
			keys[e.code] = true;

			if (e.code === 'Digit1') {
				state.currentWeapon = 'shotgun';
				weaponUi.innerText = `ДРОБОВИК [1] (${state.shotgunClip}/${state.maxShotgunClip})`;
				reloadUi.innerText = state.isReloading ? "(ПЕРЕЗАРЯДКА...)" : "";
				updateWeaponVisibility();
			}
			if (e.code === 'Digit2') {
				if (state.weaponsUnlocked.rifle) {
					state.currentWeapon = 'rifle'; weaponUi.innerText = `АВТОМАТ [2] (${state.rifleClip}/${state.maxRifleClip})`; reloadUi.innerText = state.isReloading ? "(ПЕРЕЗАРЯДКА...)" : ""; updateWeaponVisibility();
				} else { showCenterMessage("ЗАБЛОКИРОВАНО! Купите Автомат в магазине (E)"); }
			}
			if (e.code === 'Digit3') {
				if (state.weaponsUnlocked.rocket) {
					state.currentWeapon = 'rocket'; weaponUi.innerText = `РАКЕТНИЦА [3] ${state.rocketLoaded ? '(ГОТОВА)' : '(ЗАРЯЖАЕТСЯ)'}`; reloadUi.innerText = !state.rocketLoaded ? "(ПЕРЕЗАРЯДКА...)" : ""; updateWeaponVisibility();
				} else { showCenterMessage("ЗАБЛОКИРОВАНО! Купите Ракетницу в магазине (E)"); }
			}
			if (e.code === 'Digit4') {
				if (state.weaponsUnlocked.minigun) {
					state.currentWeapon = 'minigun'; weaponUi.innerText = `ПУЛЕМЕТ [4] (${state.minigunClip}/${state.maxMinigunClip})`; reloadUi.innerText = state.isReloading ? "(ПЕРЕЗАРЯДКА...)" : ""; updateWeaponVisibility();
				} else { showCenterMessage("ЗАБЛОКИРОВАНО! Купите Пулемет в магазине (E)"); }
			}
			if (e.code === 'KeyM') {
				state.currentWeapon = 'melee'; weaponUi.innerText = `НОЖ [M]`; reloadUi.innerText = ""; updateWeaponVisibility();
			}
			if (e.code === 'Space') {
				if (state.isOnGround) { state.playerVelZ = config.JUMP_VELOCITY; state.isOnGround = false; }
				keys[e.code] = false; e.preventDefault();
			}
			// РУЧНАЯ ПЕРЕЗАРЯДКА НА R ДЛЯ ДРОБОВИКА, АВТОМАТА И ПУЛЕМЕТА
			if (e.code === 'KeyR' && !state.isReloading && state.ammo > 0) {
				if (state.currentWeapon === 'shotgun' && state.shotgunClip < state.maxShotgunClip) startShotgunReload();
				if (state.currentWeapon === 'rifle' && state.rifleClip < state.maxRifleClip) startRifleReload();
				if (state.currentWeapon === 'minigun' && state.minigunClip < state.maxMinigunClip) startMinigunReload();
			}
			// G - СМЕНА ТИПА ГРАНАТЫ, Q - БРОСОК ГРАНАТЫ
			if (e.code === 'KeyG') { cycleGrenadeType(); }
			if (e.code === 'KeyQ') { throwGrenade(); }
		});
		window.addEventListener('keyup', e => keys[e.code] = false);

		let isMouseDown = false; let isMouseLocked = false;
		canvas.addEventListener('mousedown', () => { if (state.gameState === 'PLAYING') { isMouseDown = true; executeShot(); } });
		window.addEventListener('mouseup', () => isMouseDown = false);
		document.addEventListener('pointerlockchange', () => { isMouseLocked = (document.pointerLockElement === canvas); });
		canvas.addEventListener('mousemove', (e) => {
			if (isMouseLocked && state.gameState === 'PLAYING') {
				state.playerAngle += (e.movementX || 0) * 0.0025; state.playerPitch -= (e.movementY || 0) * 0.0025;
				state.playerPitch = Math.max(-Math.PI / 3.5, Math.min(Math.PI / 3.5, state.playerPitch));
			}
		});

		let touchStartX = 0; let touchStartY = 0;
		canvas.addEventListener('touchstart', (e) => { if (state.gameState === 'PLAYING') { const touch = e.touches[0]; touchStartX = touch.clientX; touchStartY = touch.clientY; executeShot(); } });
		canvas.addEventListener('touchmove', (e) => {
			if (state.gameState === 'PLAYING' && e.touches.length > 0) {
				const touch = e.touches[0];
				state.playerAngle += (touch.clientX - touchStartX) * 0.005; state.playerPitch -= (touch.clientY - touchStartY) * 0.005;
				state.playerPitch = Math.max(-Math.PI / 3.5, Math.min(Math.PI / 3.5, state.playerPitch));
				touchStartX = touch.clientX; touchStartY = touch.clientY;
			}
		});







		state.flashOverlayTimer = 0;








		state.lastTime = performance.now();
		function gameLoop(currentTime) {
			let dt = (currentTime - state.lastTime) / 1000; if (dt > 0.1) dt = 0.1; state.lastTime = currentTime;
			update(dt); render3D(); renderMinimap(); requestAnimationFrame(gameLoop);
		}

		window.onload = function () { 
			loadProgress();
			init3D(); 
			setInterval(saveProgress, 5000);
			requestAnimationFrame(gameLoop); 
		}
		window.addEventListener('resize', () => {
			if (camera && renderer) {
				camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix();
				renderer.setSize(canvas.clientWidth, canvas.clientHeight);
				if (composer) composer.setSize(canvas.clientWidth, canvas.clientHeight);
			}
		});