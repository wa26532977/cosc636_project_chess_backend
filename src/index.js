const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()

const server = http.createServer(app)
const io = socketio(server)

const lobby = {
    1: {gameId: null, leftPlayer: null, rightPlayer: null},
    2: {gameId: null, leftPlayer: null, rightPlayer: null},
    3: {gameId: null, leftPlayer: null, rightPlayer: null},
    4: {gameId: null, leftPlayer: null, rightPlayer: null},
    5: {gameId: null, leftPlayer: null, rightPlayer: null},
}

const livePlayer = {}

function remove_sit(clientId) {
    Object.keys(lobby).forEach((key) => {
        if (lobby[key].leftPlayer === livePlayer[clientId]) {
            lobby[key].leftPlayer = null
        }
        if (lobby[key].rightPlayer === livePlayer[clientId]) {
            lobby[key].rightPlayer = null
        }
    })
}


io.on("connection", client => {
    console.log('a user connected');
    client.on("user_join_lobby", userName => {
        livePlayer[client.id] = userName
        io.emit('lobby_update', lobby, livePlayer)
    })

    client.on("player_sit", (gameTableId, whichSide) => {
        // reset previous setting position
        remove_sit(client.id)
        // set current position also make sure no one is currently setting here
        if (lobby[gameTableId][whichSide] === null) {
            lobby[gameTableId][whichSide] = livePlayer[client.id]
        }
        console.log(lobby[gameTableId][whichSide])
        // update the lobby
        io.emit('lobby_update', lobby, livePlayer)
    })

    client.on('player_cancel', () => {
        remove_sit(client.id)
        io.emit('lobby_update', lobby, livePlayer)
    })

    client.on('disconnect', () => {
        remove_sit(client.id)
        delete livePlayer[client.id]
        io.emit('lobby_update', lobby, livePlayer)
    });
})

server.listen(process.env.PORT || 8000)

