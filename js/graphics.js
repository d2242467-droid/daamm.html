		function makeProceduralNoiseTexture(colorBase, countX = 16, countY = 16) {
			const tempCanvas = document.createElement('canvas');
			tempCanvas.width = 128; tempCanvas.height = 128;
			const tctx = tempCanvas.getContext('2d');
			const sizeX = 128 / countX; const sizeY = 128 / countY;
			for (let x = 0; x < countX; x++) {
				for (let y = 0; y < countY; y++) {
					const noise = (Math.random() - 0.5) * 35;
					const r = Math.min(255, Math.max(0, colorBase.r + noise));
					const g = Math.min(255, Math.max(0, colorBase.g + noise));
					const b = Math.min(255, Math.max(0, colorBase.b + noise));
					tctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
					tctx.fillRect(x * sizeX, y * sizeY, sizeX, sizeY);
					tctx.strokeStyle = 'rgba(0,0,0,0.1)'; tctx.lineWidth = 1;
					tctx.strokeRect(x * sizeX, y * sizeY, sizeX, sizeY);
				}
			}
			const texture = new THREE.CanvasTexture(tempCanvas);
			texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
			return texture;
		}

		function initTextures() {
			textures[1] = makeProceduralNoiseTexture({ r: 90, g: 90, b: 90 }, 8, 8);
			textures[2] = makeProceduralNoiseTexture({ r: 93, g: 64, b: 55 }, 4, 16);
			textures[3] = makeProceduralNoiseTexture({ r: 46, g: 125, b: 50 }, 8, 8);
			textures[4] = makeProceduralNoiseTexture({ r: 21, g: 101, b: 192 }, 16, 16);
			textures[5] = makeProceduralNoiseTexture({ r: 26, g: 26, b: 26 }, 16, 16);
			textures[6] = makeProceduralNoiseTexture({ r: 0, g: 191, b: 255 }, 8, 8);
			textures['grass'] = makeProceduralNoiseTexture({ r: 35, g: 115, b: 35 }, 16, 16);
			textures['grass'].wrapS = THREE.RepeatWrapping; textures['grass'].wrapT = THREE.RepeatWrapping;
			textures['grass'].repeat.set(32, 32);
		}

		function init3D() {
			scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#11051a', 0.05);
			camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
			camera.rotation.order = 'YXZ'; scene.add(camera);
			renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
			renderer.setPixelRatio(window.devicePixelRatio); renderer.setSize(canvas.clientWidth, canvas.clientHeight);
			renderer.setClearColor('#11051a');
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			initTextures();

			composer = new THREE.EffectComposer(renderer);
			const renderPass = new THREE.RenderPass(scene, camera);
			composer.addPass(renderPass);
			const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 0.4, 0.2, 0.5);
			bloomPass.threshold = 0.5; bloomPass.strength = 0.4; bloomPass.radius = 0.2;
			composer.addPass(bloomPass);

			const floorGeo = new THREE.PlaneGeometry(config.mapSize, config.mapSize);
			const floorMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, map: textures['grass'] });
			const floor = new THREE.Mesh(floorGeo, floorMat);
			floor.rotation.x = -Math.PI / 2; floor.position.set(config.mapSize / 2, 0, config.mapSize / 2); 
			floor.receiveShadow = true; scene.add(floor);

			scene.add(new THREE.AmbientLight(0xffffff, 0.25));
			const dirLight = new THREE.DirectionalLight(0xff77aa, 0.3); dirLight.position.set(16, 25, 16);
			dirLight.castShadow = true;
			dirLight.shadow.camera.left = -20; dirLight.shadow.camera.right = 20;
			dirLight.shadow.camera.top = 20; dirLight.shadow.camera.bottom = -20;
			dirLight.shadow.mapSize.width = 1024; dirLight.shadow.mapSize.height = 1024;
			scene.add(dirLight);
			torchLight = new THREE.PointLight(0xff3333, 1.4, 15); camera.add(torchLight);

			mapBlocksGroup = new THREE.Group();
			scene.add(mapBlocksGroup);
			rebuild3DMap(); // ПОСТРОЕНИЕ 3D КАРТЫ

			weaponPivot = new THREE.Group(); camera.add(weaponPivot); create3DWeapons();

			// ВСПЫШКА ВЫСТРЕЛА: точечный свет у дула, загорается при выстреле
			muzzleLight = new THREE.PointLight(0xffdd66, 0, 5, 2);
			muzzleLight.position.set(0.16, -0.05, -0.55);
			weaponPivot.add(muzzleLight);
		}

		function rebuild3DMap() {
			while (mapBlocksGroup.children.length > 0) {
				mapBlocksGroup.remove(mapBlocksGroup.children[0]);
			}
			const boxGeometryStandard = new THREE.BoxGeometry(1, 2, 1);
			const boxGeometryPlatform = new THREE.BoxGeometry(1, 1, 1);
			for (let z = 0; z < config.mapSize; z++) {
				for (let x = 0; x < config.mapSize; x++) {
					const cellVal = state.map[z * config.mapSize + x];
					if (cellVal > 0) {
						let geom = boxGeometryStandard; let hY = 1.0;
						if (cellVal === 6) { geom = boxGeometryPlatform; hY = 0.5; }
						const blockMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, map: textures[cellVal] || textures[1] });
						const block = new THREE.Mesh(geom, blockMat);
						block.position.set(x + 0.5, hY, z + 0.5);
						block.castShadow = true; block.receiveShadow = true;
						mapBlocksGroup.add(block);
					}
				}
			}
		}

		function create3DWeapons() {
			const shotgunGroup = new THREE.Group();
			const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.15), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x4a2d18 }));
			stock.position.set(0, -0.04, 0); shotgunGroup.add(stock);
			const barrelL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.45), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x222222 }));
			barrelL.position.set(-0.015, 0.01, -0.2); shotgunGroup.add(barrelL);
			const barrelR = barrelL.clone(); barrelR.position.x = 0.015; shotgunGroup.add(barrelR);
			shotgunGroup.position.set(0.18, -0.22, -0.4); weaponPivot.add(shotgunGroup); weaponMeshes.shotgun = shotgunGroup;

			const rifleGroup = new THREE.Group();
			const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x0d131a }));
			rifleGroup.add(receiver);
			const barrelRifle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.35), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x00bfff, emissive: 0x0033aa }));
			barrelRifle.position.set(0, 0.01, -0.2); rifleGroup.add(barrelRifle);
			const strip = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.2), new THREE.MeshBasicMaterial({ color: 0xe0ffff }));
			strip.position.set(0, 0.035, -0.15); rifleGroup.add(strip);
			rifleGroup.position.set(0.18, -0.22, -0.4); rifleGroup.visible = false; weaponPivot.add(rifleGroup); weaponMeshes.rifle = rifleGroup;

			const rocketGroup = new THREE.Group();
			const launcherBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.45), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x2d2d2d }));
			rocketGroup.add(launcherBody);
			const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.05), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xff3300 }));
			muzzle.position.set(0, 0, -0.225); rocketGroup.add(muzzle);
			rocketGroup.position.set(0.22, -0.24, -0.4); rocketGroup.visible = false; weaponPivot.add(rocketGroup); weaponMeshes.rocket = rocketGroup;

			const minigunGroup = new THREE.Group();
			const mgBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x2a2a2a }));
			mgBody.position.set(0, -0.02, -0.05); minigunGroup.add(mgBody);
			const mgBarrelCluster = new THREE.Group();
			for (let b = 0; b < 6; b++) {
				const ang = (b / 6) * Math.PI * 2;
				const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x555555 }));
				barrel.rotation.x = Math.PI / 2;
				barrel.position.set(Math.cos(ang) * 0.035, Math.sin(ang) * 0.035, -0.35);
				mgBarrelCluster.add(barrel);
			}
			minigunGroup.add(mgBarrelCluster); weaponMeshes.minigunBarrels = mgBarrelCluster;
			const mgDrum = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.09), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xffcc00 }));
			mgDrum.position.set(-0.11, -0.09, 0.05); minigunGroup.add(mgDrum);
			minigunGroup.position.set(0.2, -0.24, -0.35); minigunGroup.visible = false; weaponPivot.add(minigunGroup); weaponMeshes.minigun = minigunGroup;

			const meleeGroup = new THREE.Group();
			const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.16), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x2a1a10 }));
			handle.position.set(0, 0, 0.05); meleeGroup.add(handle);
			const guard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.02), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x555555 }));
			guard.position.set(0, 0, -0.04); meleeGroup.add(guard);
			const blade = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.008, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xc8ccd0, emissive: 0x222222 }));
			blade.position.set(0, 0, -0.2); meleeGroup.add(blade);
			const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xc8ccd0 }));
			bladeTip.rotation.x = -Math.PI / 2; bladeTip.position.set(0, 0, -0.375); meleeGroup.add(bladeTip);
			meleeGroup.position.set(0.16, -0.2, -0.35); meleeGroup.rotation.set(0.2, 0.3, -0.2); meleeGroup.visible = false; weaponPivot.add(meleeGroup); weaponMeshes.melee = meleeGroup;
		}

		function updateWeaponVisibility() {
			if (!weaponMeshes.shotgun) return;
			weaponMeshes.shotgun.visible = (state.currentWeapon === 'shotgun');
			weaponMeshes.rifle.visible = (state.currentWeapon === 'rifle');
			weaponMeshes.rocket.visible = (state.currentWeapon === 'rocket');
			weaponMeshes.minigun.visible = (state.currentWeapon === 'minigun');
			weaponMeshes.melee.visible = (state.currentWeapon === 'melee');
		}

		function create3DHealthBar(type) {
			const group = new THREE.Group();
			const bgGeo = new THREE.PlaneGeometry(0.6, 0.06);
			const bgMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
			group.add(new THREE.Mesh(bgGeo, bgMat));
			const fgGeo = new THREE.PlaneGeometry(0.6, 0.06); fgGeo.translate(0.3, 0, 0);
			const fgColor = (type === 'boss') ? 0xff0033 : 0x00ff33;
			const fgMat = new THREE.MeshBasicMaterial({ color: fgColor, side: THREE.DoubleSide });
			const fgMesh = new THREE.Mesh(fgGeo, fgMat); fgMesh.position.set(-0.3, 0, 0.002);
			group.add(fgMesh); group.userData.fg = fgMesh; return group;
		}

		function buildEnemyMesh(type) {
			const group = new THREE.Group(); let animator = null;
			if (type === 'boss') {
				const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x12131c }));
				torso.position.y = 0.9; group.add(torso);
				const innerCore = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.9), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x00fff2, emissive: 0x0088cc }));
				innerCore.position.set(0, 1.0, 0.05); group.add(innerCore);
				const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x0a0b12 }));
				leftArm.position.set(-0.75, 0.8, 0); group.add(leftArm);
				const rightArm = leftArm.clone(); rightArm.position.x = 0.75; group.add(rightArm);
				animator = (time) => { leftArm.rotation.x = Math.sin(time * 8) * 0.3; rightArm.rotation.x = -Math.sin(time * 8) * 0.3; innerCore.rotation.y = time * 2; };
			} else if (type === 'creeper') {
				const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x1b8a1b }));
				head.position.y = 0.7; group.add(head);
				const face = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x000000 }));
				face.position.set(0, 0.7, 0.16); group.add(face);
				const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x0c4d0c }));
				torso.position.y = 0.3; group.add(torso);
				const legGeom = new THREE.BoxGeometry(0.12, 0.16, 0.12); const legMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x0a2e0a });
				const legFL = new THREE.Mesh(legGeom, legMat); legFL.position.set(-0.09, 0.08, 0.08); group.add(legFL);
				const legFR = new THREE.Mesh(legGeom, legMat); legFR.position.set(0.09, 0.08, 0.08); group.add(legFR);
				const legBL = new THREE.Mesh(legGeom, legMat); legBL.position.set(-0.09, 0.08, -0.08); group.add(legBL);
				const legBR = new THREE.Mesh(legGeom, legMat); legBR.position.set(0.09, 0.08, -0.08); group.add(legBR);
				animator = (time) => { const swing = Math.sin(time * 10) * 0.4; legFL.rotation.x = swing; legBR.rotation.x = swing; legFR.rotation.x = -swing; legBL.rotation.x = -swing; };
			} else if (type === 'skeleton') {
				const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x9f8db3 }));
				head.position.y = 0.75; group.add(head);
				const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x2c2438 }));
				spine.position.y = 0.38; group.add(spine);
				const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.15), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x8a75a3 }));
				rib1.position.set(0, 0.5, 0); group.add(rib1); const rib2 = rib1.clone(); rib2.position.y = 0.4; group.add(rib2);
				const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
				eyeL.position.set(-0.06, 0.77, 0.125); group.add(eyeL); const eyeR = eyeL.clone(); eyeR.position.x = 0.06; group.add(eyeR);
				const blaster = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.25), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x4c3a5c }));
				blaster.position.set(0.16, 0.4, 0.1); group.add(blaster);
				animator = (time) => { blaster.position.y = 0.4 + Math.sin(time * 6) * 0.02; };
			} else if (type === 'flyer') {
				const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.35), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x5c6e62 }));
				body.position.y = 0.5; group.add(body);
				const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x4a5850 }));
				wingL.position.set(-0.3, 0.5, 0); group.add(wingL); const wingR = wingL.clone(); wingR.position.x = 0.3; group.add(wingR);
				animator = (time) => { const wingFlap = Math.sin(time * 12) * 0.6; wingL.rotation.z = wingFlap; wingR.rotation.z = -wingFlap; };
			}
			const healthBar = create3DHealthBar(type);
			healthBar.position.y = (type === 'boss') ? 2.2 : (type === 'flyer' ? 1.0 : 1.1);
			group.add(healthBar); group.userData.healthBar = healthBar;
			return { mesh: group, animator: animator };
		}

		function buildPickupMesh(type) {
			const group = new THREE.Group();
			if (type === 'state.health') {
				group.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xffffff })));
				group.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.21), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
				group.add(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.21), new THREE.MeshBasicMaterial({ color: 0xff0000 })));
			} else {
				group.add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0x8b5a2b })));
				const bullets = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.05, 0.22), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
				bullets.position.y = 0.08; group.add(bullets);
			}
			return group;
		}

		function buildProjectileMesh() { return new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffcc00 })); }

		function buildParticleMesh(color) { return new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: color || 0xff9900 })); }

		function buildNetPlayerMesh(colorHex) {
			const group = new THREE.Group();
			const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: colorHex || 0x00ffcc }));
			body.position.y = 0.3; group.add(body);
			const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, color: 0xf0d0a8 }));
			head.position.y = 0.7; group.add(head); return group;
		}

		function syncEntitiesWith3DScene() {
			const activeMeshIds = new Set(); const time = performance.now() / 1000;
			state.enemies.forEach(enemy => {
				if (!enemy._meshId) enemy._meshId = enemy.id || 'enemy_' + Math.random().toString(36).substr(2, 9);
				activeMeshIds.add(enemy._meshId);
				let entityData = entityMeshes.get(enemy._meshId);
				if (!entityData) {
					const compiled = buildEnemyMesh(enemy.type); scene.add(compiled.mesh);
					entityData = { mesh: compiled.mesh, animator: compiled.animator }; entityMeshes.set(enemy._meshId, entityData);
				}
				entityData.mesh.position.set(enemy.x, enemy.z || 0.0, enemy.y);
				entityData.mesh.rotation.y = Math.atan2(state.playerX - enemy.x, state.playerY - enemy.y);
				if (entityData.mesh.userData.healthBar) {
					const healthBar = entityData.mesh.userData.healthBar; const fg = healthBar.userData.fg;
					fg.scale.x = Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
					healthBar.quaternion.copy(entityData.mesh.quaternion).invert().multiply(camera.quaternion);
				}
				if (entityData.animator) entityData.animator(time);
			});

			state.projectiles.forEach(proj => {
				if (!proj._meshId) proj._meshId = 'proj_' + Math.random().toString(36).substr(2, 9);
				activeMeshIds.add(proj._meshId);
				let mesh = entityMeshes.get(proj._meshId);
				if (!mesh) { mesh = buildProjectileMesh(); scene.add(mesh); entityMeshes.set(proj._meshId, mesh); }
				mesh.position.set(proj.x, proj.z, proj.y);
			});

			state.thrownGrenades.forEach(g => {
				if (!g._meshId) g._meshId = 'grenade_' + Math.random().toString(36).substr(2, 9);
				activeMeshIds.add(g._meshId);
				let mesh = entityMeshes.get(g._meshId);
				if (!mesh) { mesh = buildGrenadeMesh(g.type); scene.add(mesh); entityMeshes.set(g._meshId, mesh); }
				mesh.position.set(g.x, g.z, g.y);
				mesh.rotation.x += 0.2; mesh.rotation.z += 0.15;
			});

			state.pickups.forEach(pickup => {
				if (!pickup._meshId) pickup._meshId = 'pickup_' + Math.random().toString(36).substr(2, 9);
				activeMeshIds.add(pickup._meshId);
				let mesh = entityMeshes.get(pickup._meshId);
				if (!mesh) { mesh = buildPickupMesh(pickup.type); scene.add(mesh); entityMeshes.set(pickup._meshId, mesh); }
				mesh.position.set(pickup.x, 0.15 + Math.sin(pickup.bounceTimer) * 0.05, pickup.y);
				mesh.rotation.y = time * 1.5; pickup.bounceTimer += 0.04;
			});

			state.particles.forEach(part => {
				if (!part._meshId) part._meshId = 'part_' + Math.random().toString(36).substr(2, 9);
				activeMeshIds.add(part._meshId);
				let mesh = entityMeshes.get(part._meshId);
				if (!mesh) { mesh = buildParticleMesh(part.color); scene.add(mesh); entityMeshes.set(part._meshId, mesh); }
				mesh.position.set(part.x, part.z, part.y);
			});

			if (state.multiplayer.enabled) {
				Object.values(state.multiplayer.players).forEach(op => {
					if (op.id === state.multiplayer.myId || !op.alive) return;
					const netPlayerId = 'net_' + op.id; activeMeshIds.add(netPlayerId);
					let mesh = entityMeshes.get(netPlayerId);
					if (!mesh) { mesh = buildNetPlayerMesh(op.color); scene.add(mesh); entityMeshes.set(netPlayerId, mesh); }
					mesh.position.set(op.x, 0.0, op.y); mesh.rotation.y = -op.angle - Math.PI / 2;
				});
			}

			for (let [id, val] of entityMeshes.entries()) {
				if (!activeMeshIds.has(id)) { scene.remove(val.mesh ? val.mesh : val); entityMeshes.delete(id); }
			}
		}

		function renderMinimap() {
			mctx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
			const cellSize = minimapCanvas.width / config.mapSize;
			for (let y = 0; y < config.mapSize; y++) {
				for (let x = 0; x < config.mapSize; x++) {
					const cellValue = state.map[y * config.mapSize + x];
					if (cellValue > 0) {
						mctx.fillStyle = (cellValue === 6) ? "#00ffff" : "#444444";
						mctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
					}
				}
			}
			state.pickups.forEach(p => {
				let px = (p.x / config.mapSize) * minimapCanvas.width; let py = (p.y / config.mapSize) * minimapCanvas.height;
				mctx.fillStyle = p.type === 'state.health' ? '#00ff66' : '#ffff00'; mctx.fillRect(px - 2, py - 2, 4, 4);
			});
			state.enemies.forEach(enemy => {
				let mmX = (enemy.x / config.mapSize) * minimapCanvas.width; let mmY = (enemy.y / config.mapSize) * minimapCanvas.height;
				if (enemy.type === 'boss') { mctx.fillStyle = "#ff00ff"; mctx.fillRect(mmX - 4, mmY - 4, 8, 8); }
				else if (enemy.type === 'creeper') { mctx.fillStyle = "#00ff00"; mctx.fillRect(mmX - 2.5, mmY - 2.5, 5, 5); }
				else if (enemy.type === 'flyer') { mctx.fillStyle = "#9fe0c0"; mctx.fillRect(mmX - 2.5, mmY - 2.5, 5, 5); }
				else { mctx.fillStyle = "#ffff00"; mctx.fillRect(mmX - 2.5, mmY - 2.5, 5, 5); }
			});
			let playerMMX = (state.playerX / config.mapSize) * minimapCanvas.width; let playerMMY = (state.playerY / config.mapSize) * minimapCanvas.height;
			mctx.fillStyle = "#ff0000"; mctx.beginPath(); mctx.arc(playerMMX, playerMMY, 3, 0, Math.PI * 2); mctx.fill();
			let dirX = playerMMX + Math.cos(state.playerAngle) * 12; let dirY = playerMMY + Math.sin(state.playerAngle) * 12;
			mctx.strokeStyle = "#ff0000"; mctx.lineWidth = 2; mctx.beginPath(); mctx.moveTo(playerMMX, playerMMY); mctx.lineTo(dirX, dirY); mctx.stroke();
		}

		function render3D() {
			if (state.cameraPitch > 1.5) state.cameraPitch = 1.5; if (state.cameraPitch < -1.5) state.cameraPitch = -1.5;
			camera.position.set(state.playerX, 0.5 + state.playerZ, state.playerY);
			camera.rotation.set(state.cameraPitch, -state.cameraYaw, 0);

			const lookX = state.playerX + Math.cos(state.playerAngle); const lookY = 0.75 + state.playerZ + Math.tan(state.playerPitch); const lookZ = state.playerY + Math.sin(state.playerAngle);
			camera.lookAt(new THREE.Vector3(lookX, lookY, lookZ));

			if (state.cameraShake > 0) {
				camera.rotation.x += (Math.random() - 0.5) * state.cameraShake;
				camera.rotation.y += (Math.random() - 0.5) * state.cameraShake;
				camera.rotation.z += (Math.random() - 0.5) * state.cameraShake;
				state.cameraShake *= 0.85;
				if (state.cameraShake < 0.01) state.cameraShake = 0;
			}
			
			const speed = Math.hypot(state.playerVelX, state.playerVelY);
			if (speed > 0.1 && state.isOnGround) {
				weaponPivot.position.y = Math.sin(performance.now() / 150) * 0.03;
				weaponPivot.position.x = Math.cos(performance.now() / 300) * 0.02;
			} else {
				weaponPivot.position.y = THREE.MathUtils.lerp(weaponPivot.position.y, 0, 0.1);
				weaponPivot.position.x = THREE.MathUtils.lerp(weaponPivot.position.x, 0, 0.1);
			}
			let swayX = 0; let swayY = 0;
			if (state.isMoving && !state.isShooting) { swayX = Math.sin(state.walkCycle) * 0.012; swayY = Math.abs(Math.cos(state.walkCycle)) * 0.008; }
			let recoilZ = 0; let recoilY = 0; let meleeSwing = 0;
			if (state.isShooting) {
				if (state.currentWeapon === 'shotgun') { recoilZ = (state.shootTimer < 1.8) ? 0.09 : -0.03; recoilY = (state.shootTimer < 1.8) ? 0.04 : -0.01; }
				else if (state.currentWeapon === 'rifle') { recoilZ = Math.sin(state.shootTimer * 4.5) * 0.02; recoilY = Math.sin(state.shootTimer * 4.5) * 0.005; }
				else if (state.currentWeapon === 'minigun') { recoilZ = Math.sin(state.shootTimer * 8) * 0.015; recoilY = Math.sin(state.shootTimer * 8) * 0.004; }
				else if (state.currentWeapon === 'melee') { meleeSwing = Math.sin(Math.min(state.shootTimer, 1.4) * 4.5) * 1.1; }
				else { recoilZ = Math.sin(state.shootTimer * 3) * 0.06; recoilY = Math.sin(state.shootTimer * 3) * 0.02; }
			}
			if (weaponMeshes.minigunBarrels) {
				weaponMeshes.minigunBarrels.rotation.z += (state.currentWeapon === 'minigun' && state.isShooting ? 0.9 : 0.08);
			}
			if (weaponMeshes.melee) { weaponMeshes.melee.rotation.set(0.2 - meleeSwing * 0.5, 0.3 + meleeSwing, -0.2); }
			weaponPivot.position.set(swayX, (state.isReloading ? -0.3 : 0) + recoilY, recoilZ);
			syncEntitiesWith3DScene();
			if (composer) composer.render();
			else if (renderer) renderer.render(scene, camera);
		}
