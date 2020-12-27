
import {Player} from './../model/player';
import {Deck} from './../model/deck';
import {GameFlow} from './renderEvent';
import {Board, LayoutInfo} from '../model/board';
import * as UUID from 'uuid';



// class AchexServer extends Board {
//     private readonly connectUrl: string = "ws://achex.ca:4010";
//     // private readonly connectUrl: string = "wss://cloud.achex.ca/neu-card-board";
//     private connected: boolean = false;
//     private joined: boolean = false;
//     private server: WebSocket;
//     private flow: GameFlow;

//     constructor(gameFlow: GameFlow) {
//         super();
//         this.flow = gameFlow;
//         this.server = new WebSocket(this.connectUrl);
//         this.server.onopen = event => {
//             this.connected = true;
//         };

//         this.server.addEventListener('message', event => {
//             let data = JSON.parse(event.data);
//             console.log(data);
//             if (data?.SID) {
//                 this.notifyJoin(this._you);
//             }
//             if (data.auth?.toLowerCase() === 'ok') {
//                 this._you = new Player(this._you.name, data.SID);
//                 // join board
//                 this.server.send(JSON.stringify({
//                     joinHub: this._id
//                 }));
//             }
//             if (data.joinHub?.toLowerCase() === 'ok') {
//                 // assign board
//                 this._watchers.push(this._you);
//                 this.server.send(JSON.stringify({
//                     toH: this._id,
//                     requestType: 'requestAssign'
//                 }));
//                 this.joined = true;
//             }
//             if (data.toH === this._id) {

//                 //#region  assign info
//                 if (data.requestType === 'requestAssign') {
//                     this.server.send(JSON.stringify({
//                         toS: data.sID,
//                         responseType: 'requestAssign',
//                         isPlayer: this._players.includes(this._you)
//                     }));
//                 }
//                 if (data.responseType === 'requsetAssign') {
//                     let player: Player = new Player(data.FROM, data.sID);
//                     let isPlayer: boolean = data.isPlayer;
//                     if (isPlayer) {
//                         this._players.push(player);
//                     } else {
//                         this._watchers.push(player);
//                     }
//                     this.flow.receivePlayer(player, isPlayer);
//                 }
//                 //#endregion

//                 if (data.requestType === 'announceStartGame') {
//                     this._players.push(...this._watchers.splice(0, this._watchers.length));
//                     this._hostId = data.sID;
//                     this.flow.completeSetup(this._you);
//                     this.server.send(JSON.stringify({
//                         toH: this._id,
//                         responseType: 'announceStartGame',
//                         hostId: this._hostId
//                     }));
//                 }
//                 if (data.responseType === 'announceStartGame') {
//                     // host役は後勝ち
//                     this._hostId = data.hostId;
//                     this.flow.completeSetup(this._you);
//                 }

//                 if (data.sendType === 'synchronizedBoardInfo') {
//                     this._hostId = data.sID;
//                     this._presentTurnUserId = data.nextTurnPlayer;
//                     this._players = data.players.map(info => new Player(info.name, info.id));
//                     let cards: string[] = data.deckCard;
//                     this._deck = Deck.build(cards);
//                 }
//                 if (data.sendType === 'pullOutCard') {
//                     let pullOutCard: string = data.cardView;
//                     let announcedSum: number = data.announcedSum;
//                     let nextPullOutCount: number = data.nextPullOutCount;
//                     let nextTurnPlayerId: number = data.nextTurnPlayerId;

//                     this._presentTurnUserId = nextTurnPlayerId;
//                     this._layoutCard.push({
//                         outCard: pullOutCard,
//                         outPlayerId: data.sID,
//                         sum: announcedSum,
//                         nextPlayerId: nextTurnPlayerId,
//                         nextPullOutCount: nextPullOutCount
//                     });
//                     this._deck.draw(); // カードを置いた人が既に引いているため
//                     this.flow.notifyPullOutCard(pullOutCard, announcedSum);
//                     this.flow.nextPlayerAction(this._players.find(player => player.id == nextTurnPlayerId), nextPullOutCount);
//                 }
//                 if (data.sendType === 'changeHost') {
//                     this._hostId = data.sID;
//                 }
//                 if (data.sendType === 'reverseTurnOrder') {
//                     this.reverseOrder(false);
//                 }
//                 if (data.setndType === 'endGame') {
//                     this.resetGame();
//                     this.flow.receiveEndGame(Object.freeze(this._watchers));
//                 }
//             }
//             if (data.leftHub === this._id) {
//                 this._players = this._players.filter(player => player.id != data.sID);
//                 this._watchers = this._watchers.filter(watcher => watcher.id != data.sID);
//                 this.flow.receiveChangedMember(Object.freeze(this._players), Object.freeze(this._watchers));
//                 if (this._hostId == data.sID) {
//                     let nextHostId = this._players[0].id;
//                     if (nextHostId == this._you.id) {
//                         this._hostId = nextHostId;
//                         this.server.send(JSON.stringify({
//                             toH: this._id,
//                             sendType: 'changeHost'
//                         }));
//                     } else {
//                         this.server.send(JSON.stringify({
//                             to: nextHostId,
//                             sendType: 'changeHost'
//                         }));
//                     }
//                 }
//             }
//             if (data.to) {
//                 if (data.sendType === 'changeHost') {
//                     this.server.send(JSON.stringify({
//                         toH: this._id,
//                         sendType: 'changeHost'
//                     }));
//                 }
//             }
//         });

//     }

//     public isPlaying(): boolean {
//         if (this.connected && this.joined) {
//             return (0 <= this._players.length);
//         } else {
//             return false;
//             // return this.isPlaying();
//         }   
//     }

//     protected notifyJoin(user: Player) {
//         if (this.connected) {
//             this.server.send(JSON.stringify({
//                 auth: user.name,
//                 passwd: `${user.name}_${UUID.v4()}`
//             }));
//         }
//     }

//     protected notifyStartGame() {
//         this.server.send(JSON.stringify({
//             toH: this._id,
//             requestType: 'announceStartGame'
//         }));
//     }

//     protected notifyReverseOrder() {
//         this.server.send(JSON.stringify({
//             toH: this._id,
//             sendType: 'reverseTurnOrder'
//         }));
//     }

//     public synchronizedBoardInfo() {
//         if (this._you.id == this._hostId) {
//             this._presentTurnUserId = this._you.id;
//             this.server.send(JSON.stringify({
//                 toH: this._id,
//                 sendType: 'synchronizedBoardInfo',
//                 players: JSON.stringify(this._players.map(player => {
//                     return {
//                         "id": player.id,
//                         "name": player.name
//                     };
//                 })),
//                 deckCard: this._deck.convertJson(),
//                 nextTurnPlayer: this._presentTurnUserId
//             }));
//         }
//     }

//     protected notifyPlacedCard(card: LayoutInfo) {
//         this.server.send(JSON.stringify(card));
//     }

//     protected notifyResetGame() {
//         this.server.send(JSON.stringify({
//             toH: this._id,
//             sendType: 'endGame'
//         }));
//     }

//     public exit(): void {
//         if (this.connected && this.joined) {
//             this.server.send(JSON.stringify({
//                 leaveHub: this._id
//             }));
//         }
//     }


// }
// export {AchexServer};


class WebsocketServer extends Board {
    private readonly connectUrl: string = "wss://demo.websocket.me/v3/1?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm&notify_self";
    private connected: boolean = false;
    private joined: boolean = false;
    private server: WebSocket;
    private flow: GameFlow;

    constructor(gameFlow: GameFlow) {
        super();
        this.flow = gameFlow;
        this.server = new WebSocket(this.connectUrl);
        this.server.onopen = event => {
            this.connected = true;
        };

        this.server.addEventListener('message', event => {
            let data = JSON.parse(event.data);
            console.log(data);
            let echoRoomId = data.roomId;
            let action = data.action;
            if (this._id != echoRoomId) {
                return;
            }
            if (action == 'joinPlayer') {
                let playerName = data.playerName;

            }
        });

    }

    public isPlaying(): boolean {
        if (this.connected && this.joined) {
            return (0 <= this._players.length);
        } else {
            return false;
        }   
    }
    public exit(): void {
        throw new Error('Method not implemented.');
    }
    protected notifyJoin(user: Player) {
        if (this.connected) {
            this.server.send(JSON.stringify({
                    roomId: this._id,
                    action: "joinPlayer",
                    playerName: user.name,
                    playerId: user.id
            }));
        }
    }
    protected notifyStartGame() {
        throw new Error('Method not implemented.');
    }
    protected notifyReverseOrder() {
        throw new Error('Method not implemented.');
    }
    public synchronizedBoardInfo() {
        throw new Error('Method not implemented.');
    }
    protected notifyPlacedCard(card: LayoutInfo) {
        throw new Error('Method not implemented.');
    }
    protected notifyResetGame() {
        throw new Error('Method not implemented.');
    }
}
export {WebsocketServer};

// https://github.com/elpheria/rpc-websockets
// TODO: ↑をnpm install して簡単に使ってみる



