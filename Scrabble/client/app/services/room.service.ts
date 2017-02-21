/**
 * room.service.ts
 *
 * @authors Mikael Ferland, Pierre To
 * @date 2017/02/19
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as io from 'socket.io-client';

export interface RoomInfo {
    roomID: number;
    capacity: number;
    playerList: string[];
}

@Injectable()
export class RoomService {

    socket: any;
    private roomInfo = { roomID: -1, capacity: 0, playerList: new Array<string>() };
    private roomJoined = false; // prevents wcFindRoom from being called multiple times
    private playerName: string;
    private missingPlayers = -1;

    constructor(private http: Http) {
        this.socket = io.connect('http://localhost:3000');

        this.socket.on('wcFindRoom', (roomInfo: any, playerName: string) => {
            if (!this.roomJoined) {
                // Set the information of the room
                this.roomInfo = roomInfo;
                this.playerName = playerName;

                this.socket.emit('cwJoinRoom', this.roomInfo.roomID, playerName);
                this.roomJoined = true;
            }
        });

        this.socket.on("wcRefresh", (roomInfo: any) => {
            this.roomInfo = roomInfo;

        });
    }

    leaveRoom() {
        this.socket.emit('cwLeaveRoom', this.roomInfo.roomID, this.playerName);

        // reset all room info
        this.roomJoined = false;
        this.playerName = "";
        this.missingPlayers = -1;
        this.roomInfo = { roomID: -1, capacity: 0, playerList: new Array<string>() };

        this.socket.disconnect();
    }

    getRoomInfo(): RoomInfo {
        return this.roomInfo;
    }

    getPlayerName(): string {
        return this.playerName;
    }

    getMissingPlayers(): number {
      return this.roomInfo.capacity > 0 ? this.roomInfo.capacity - this.roomInfo.playerList.length : -1;
    }
}
