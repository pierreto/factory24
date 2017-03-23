/**
 * socketManager.service.ts
 *
 * @authors Félix Boulet
 * @date 2017/02/19
 * @modified by Mikael Ferland, Pierre To on 2017/03/07
 */

import * as io from 'socket.io';
import * as http from 'http';
import { RoomManager } from './roomManager.service';
import { PlayerManager } from './playerManager.service';
import { CommandHandler } from './commandHandler.service';

export class SocketManager {
    private sio: SocketIO.Server;
    private roomManager: RoomManager;
    private playerManager: PlayerManager;
    private commandHandler: CommandHandler;

    constructor(server: http.Server) {
        this.sio = io.listen(server);
        this.roomManager = new RoomManager();
        this.playerManager = new PlayerManager();
        this.commandHandler = new CommandHandler(this.sio, this.roomManager);
    }

    public handleSockets() {
        this.sio.on('connection', (socket) => {

            socket.on('chat message', (msg: string) => {
                let player = this.playerManager.getPlayerFromSocketID(socket.id);

                if (player !== undefined) {
                    if (this.commandHandler.isACommand(msg)) {
                        this.commandHandler.handleCommand(msg, player);
                    }
                    else {
                        // Regular message
                        this.sio.sockets
                            .in(player.getRoomId().toString())
                            .emit('message sent', { username: player.getName(), submessage: msg });
                    }
                }
            });

            socket.on('disconnect', (msg: any) => {
                let player = this.playerManager.getPlayerFromSocketID(socket.id);

                if (player !== undefined) {
                    this.roomManager.leaveRoom(player.getName(), player.getRoomId());
                    this.playerManager.removePlayer(player.getName());
                    let disconnectMsg = "L'utilisateur a quitté la partie.";
                    this.sio.sockets
                        .in(player.getRoomId().toString())
                        .emit('user disconnect', { username: player.getName(), submessage: disconnectMsg });
                }
                console.log("User disconnected");
            });

            socket.on('cwValidateName', (name: string) => {
                let validity = this.playerManager.validateName(name);
                socket.emit('wcNameValidated', validity);
            });

            socket.on('cwAddPlayer', (player: any) => {
                // Find (or create) a room in room manager service
                let room = this.roomManager.createRoom(player.capacity);

                // Create a new player in the playerManager
                let newPlayer = this.playerManager.addPlayer(player.name, socket.id, room.getRoomInfo().roomID);

                // Allows client to join a specific room
                room.addPlayer(newPlayer);
                socket.join(room.getRoomInfo().roomID.toString());

                setTimeout(() => { this.sio.emit('wcFindRoom', room.getRoomInfo(), player.name); }, 500);
            });

            // Allows client to leave a specific room
            socket.on('cwLeaveRoom', (player: any) => {
                this.roomManager.leaveRoom(player.name, player.roomID);
                this.playerManager.removePlayer(player.name);
                socket.leave(player.roomID.toString());
            });

            // Updates the information in the waiting room
            setInterval(() => {
                for (let room of this.roomManager.getExistingRooms()) {
                    let id = room.getRoomInfo().roomID as number;
                    this.sio.sockets.in(id.toString()).emit('wcRefresh', room.getRoomInfo());
                    if (room.getGameMaster().isGameStarted() === true) {
                        this.sio.sockets.in(id.toString()).emit('wcUpdateTurnInfo', room.getGameMaster().getTurnInfo());
                    }
                }
            }, 1000);

            // Initializes the scrabble game in a specific room
            socket.on('cwStartGame', (roomID: number) => {
                let room = this.roomManager.findRoom(roomID);
                let gameMaster = room.getGameMaster();

                if (!gameMaster.isGameStarted()) {
                    gameMaster.startGame();

                    let msg = "Jeu initialisé. Ordre des joueurs :";
                    gameMaster.getPlayers().forEach(player => {
                        msg += " " + player.getName();
                    });
                    msg += ". Joueur actif : " + gameMaster.getActivePlayer().getName() + ".";

                    this.sio.sockets
                        .in(roomID.toString())
                        .emit('message sent', { username: "Scrabble Game", submessage: msg });

                    gameMaster.getPlayers().forEach(player => {
                        // Updates each player's rack with 7 randomized letters from stash
                        this.sio.sockets.connected[player.getSocketId()]
                            .emit('wcUpdateRack', player.getLettersRack());
                        // Updates the player's validated name
                        this.sio.sockets.connected[player.getSocketId()]
                            .emit('wcUpdateName', player.getName());
                    });
                }
            });
        });
    }
}
