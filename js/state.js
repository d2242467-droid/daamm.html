var state = {
    gameState: 'START',
    playerX: 3.5,
    playerY: 3.5,
    playerAngle: 0,
    playerPitch: 0,
    health: 100,
    maxHealth: 100,
    damageMultiplier: 1.0,
    score: 0,
    playerZ: 0.5,
    playerVelZ: 0,
    isOnGround: true,
    cameraShake: 0,
    difficulty: 'MEDIUM',
    weaponsUnlocked: { shotgun: true, rifle: false, minigun: false, rocket: false },
    shopCosts: { health: 300, damage: 400, rifle: 800, rocket: 1500, minigun: 2000, ammo: 150, clipCapacity: 700, frag: 250, molotov: 300, flash: 300 },
    maxShotgunClip: 2,
    maxRifleClip: 30,
    maxMinigunClip: 100,
    currentWeapon: 'shotgun',
    ammo: 100,
    shotgunClip: 2,
    rifleClip: 30,
    minigunClip: 100,
    isShooting: false,
    shootTimer: 0,
    walkCycle: 0,
    isMoving: false,
    rifleFireRateTimer: 0,
    minigunFireRateTimer: 0,
    meleeCooldownTimer: 0,
    isReloading: false,
    reloadTimer: 0,
    rocketLoaded: false,
    rocketReloadTimer: 0,
    regularSpawnTimer: 0,
    bossSpawnTimer: 0,
    hasBoss: false,
    hardBossKillCount: 0,
    grenadeCounts: { frag: 3, molotov: 1, flash: 1 },
    currentGrenadeType: 'frag',
    thrownGrenades: [],
    fireZones: [],
    messageText: '',
    messageTimer: 0,
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    pickups: [],
    flashOverlayTimer: 0,
    lastTime: 0,
    multiplayer: { enabled: false, isHost: false, isClient: false, peer: null, conn: null, clientConns: {}, players: {}, myId: null },
    selectedMapName: 'CLASSIC',
    map: null
};

window.saveProgress = function() {
    const data = {
        health: state.health,
        maxHealth: state.maxHealth,
        damageMultiplier: state.damageMultiplier,
        score: state.score,
        difficulty: state.difficulty,
        weaponsUnlocked: state.weaponsUnlocked,
        shopCosts: state.shopCosts,
        maxShotgunClip: state.maxShotgunClip,
        maxRifleClip: state.maxRifleClip,
        maxMinigunClip: state.maxMinigunClip,
        ammo: state.ammo,
        grenadeCounts: state.grenadeCounts,
        hardBossKillCount: state.hardBossKillCount
    };
    localStorage.setItem('minecraftDoomSave', JSON.stringify(data));
};

window.loadProgress = function() {
    try {
        const saved = localStorage.getItem('minecraftDoomSave');
        if (saved) {
            const data = JSON.parse(saved);
            for (let key in data) {
                state[key] = data[key];
            }
            console.log("Progress loaded!");
        }
    } catch(e) {
        console.error("Failed to load progress", e);
    }
};

window.resetProgress = function() {
    localStorage.removeItem('minecraftDoomSave');
    location.reload();
};

var DOM = {
    canvas: null,
    mctx: null,
    ammoUi: null,
    healthUi: null,
    scoreUi: null,
    shopUi: null,
    startScreen: null,
    gameOverScreen: null,
    pauseScreen: null,
    crosshair: null,
    hitmarker: null,
    damageOverlay: null,
    fpsCounter: null,
    mpPanel: null,
    mpStatus: null,
    grenadeTypeUi: null,
    grenadeCountUi: null,
    flashOverlay: null,
    mapSelectBtn: null,
    mapOptions: null
};
