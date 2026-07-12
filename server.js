const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const rooms = new Map();

console.log('🎮 Сервер Minecraft Doom 3D запущен');

wss.on('connection', (ws) => {
    console.log('Игрок подключился');

    ws.on('message', (message) => {
        let data;
        try { data = JSON.parse(message); } catch(e) { return; }

        if (data.type === 'join') {
            const roomId = data.room || 'default';
            if (!rooms.has(roomId)) rooms.set(roomId, new Map());
            
            const room = rooms.get(roomId);
            const playerId = Date.now().toString(36);
            
            room.set(ws, {
                id: playerId,
                name: data.name || 'Игрок',
                x: 3.5,
                y: 3.5,
                angle: 0,
                health: 100,
                score: 0
            });

            ws.roomId = roomId;
            ws.playerId = playerId;

            ws.send(JSON.stringify({
                type: 'joined',
                id: playerId,
                x: 3.5,
                y: 3.5,
                difficulty: data.difficulty
            }));
        }
    });

    ws.on('close', () => {
        console.log('Игрок отключился');
    });
});
