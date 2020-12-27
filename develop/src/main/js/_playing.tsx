import * as React from 'react';
import { Player } from './model/player';
import { Deck } from './model/deck';
import { Card, OrderCategory } from './model/card';
import GameRule from './model/gameRule';
import * as shortid from 'shortid';

/*
    3. ゲーム未開始（/play/{UUID}）: 2カラムレイアウト
        1. 参加人数表示(右側)
            1. 参加メンバー名
        1. ゲーム開始ボタン(右側)
        1. ルール表示(左側)
    4. ゲーム中(プレイヤー)（/play/{UUID}）: 1カラムレイアウト
        1. 前回の合計値宣言数表示(最上部:左側)
        1. 出札表示(最上部)
            1. hoverすると全部見える(初期実装は全部見えてる状態でOK)
        1. 参加人数表示(上から2番目)
            1. 参加メンバー名
            1. 誰の番か表示
        1. カード表示(上から3番目)
            - 順番になると、カードの下に場に出すボタンが出る
            - モーダルみたいなので、数値入力フォームが出る(×を押すと、カード選択が戻る)
        1. ルール表示(最下部)
    5. ゲーム中(観戦者)（/play/{UUID}）
        1. 前回の合計値宣言数表示(最上部:左側)
        1. 出札表示(最上部)
            1. hoverすると全部見える(初期実装は全部見えてる状態でOK)
        1. 参加人数表示(上から2番目)
            1. 参加メンバー名
            1. 誰の番か表示
        1. ルール表示(最下部)
    6. ゲーム終了（/play/{UUID}）
*/

interface PropType {
    playerName: string;
    roomId: string;
}
interface CardInfo {
    card: Card;
    selectNominatePlayerId?: string;
}
interface PullOutCardInfo {
    card: Card;
    fromPlayerId: string;
    nextPlayerId: string;
}
interface StatType {
    connected: boolean;
    players: Player[];

    startPlayed: boolean;
    handCards: CardInfo[];
    turnPlayer: Player;
    pullOutCards: PullOutCardInfo[];
}


//     render() {
//         if (!this.board.isPlaying()) {
//             return (<div>
// <nav>
//     <p>{this.props.playerName}</p>
// </nav>
// <section>
//     <aside>
//         {this.renderGameDescription()}
//     </aside>
//     <button onClick={e => this.board.join(this.props.roomId, new Player(this.props.playerName))}>Start</button>
//     <p>hello game</p>
//     <ul>{this.renderPlayers(this.state.players.map(info => info.player.name))}</ul>
// </section>
//                     </div>);
//         } else {
//             return (<div>
// <nav>
//     <p>{this.props.playerName}</p>
//     <button>Exit room</button>
// </nav>
// <section>
//     <p>hello game</p>
// </section>
//                     </div>);
//         }
//     }


class PlayingBoard extends React.Component<PropType, StatType> {
    private readonly connectUrl: string = "wss://demo.websocket.me/v3/1?api_key=oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm&notify_self";
    private server: WebSocket;
    private _game: GameRule;

    private _roomId: string;
    private _player: Player;
    private _deck: Deck;
    private _sum: number;
    private _gameEnd: boolean;

    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            players: [],

            startPlayed: false,
            handCards: [],
            turnPlayer: undefined,
            pullOutCards: []
        };
        this._roomId = this.props.roomId;
        this.server = new WebSocket(this.connectUrl);
        this.server.onopen = event => {
            this.setState({
                connected: true
            });
            this.join(this.props.roomId, this.props.playerName)
        };
        this.server.addEventListener('message', event => {
            let data = JSON.parse(event.data);
            // console.log(data);
            if (this._roomId != data.roomId) {
                return;
            }
            let action = data.action;

            //#region プレイヤーのIN & OUT
            if (action == 'joinPlayer') {
                let joinPlayer = new Player(data.playerName, data.playerId);
                this.setState(prevState => ({
                    players: [...prevState.players, joinPlayer]
                }));
                this.notifyMe(this._roomId);
            } else if (action == 'notifyJoinedPlayer') {
                if (!this.state.players.some(player => player.id == data.playerId)) {
                    let joinPlayer = new Player(data.playerName, data.playerId);
                    if (joinPlayer.id != this._player.id) {
                        this.setState(prevState => ({
                            players: [...prevState.players, joinPlayer]
                        }));
                    }
                }
            } else if (action == 'notifyExitPlayer') {
                let exitPlayerId = data.playerId;
                this.setState(prevState => ({
                    players: prevState.players.filter(player => player.id != exitPlayerId)
                }));
            }
            //#endregion
            else if (action == 'notifyStartGame') {
                let sortedPlayers = this.state.players.slice().sort((p1, p2) => p1.id < p2.id ? -1 : 1);
                this._sum = 0;
                this._gameEnd = false;
                this._game = new GameRule();
                this.setState({ 
                    startPlayed: true,
                    players: sortedPlayers,
                    turnPlayer: sortedPlayers[0]
                });
            } else if (action == 'passCard' && this._player.id == data.passPlayerId) {
                let card = Deck.convertCard(data.card);
                // console.info('カードを受け取った');
                // console.info(card);
                this._player.addHand(card);
                let info: CardInfo = {
                    card: card
                };
                this.setState(prevState => ({
                    handCards: [...prevState.handCards, info]
                }));
            } else if (action == 'pullOutCard') {
                let card = Deck.convertCard(data.card);
                // 次のプレイヤーを決定
                let sortedPlayers = this._game.sortPlayers(this.state.players, this.state.pullOutCards.map(info => info.card), card, data.nextPlayerId);
                let nextPlayer = sortedPlayers[0];
                console.info('カードが場に出された');
                console.info(card);
                let info: PullOutCardInfo = {
                    card: card,
                    fromPlayerId: this.state.turnPlayer.id,
                    nextPlayerId: nextPlayer.id
                };
                if (this._deck != undefined) {
                    // カードを渡す
                    this.server.send(JSON.stringify({
                        roomId: this._roomId,
                        action: 'passCard',
                        passPlayerId: this.state.turnPlayer.id,
                        card: this._deck.draw().viewName
                    }));
                }
                this.setState(prevState => ({
                    // Arrayが抽象型の場合は格納できなかった。何かの型の中にある場合はいけた。Babel周りが怪しい…
                    pullOutCards: [...prevState.pullOutCards, info],
                }));

                this._sum = this._game.sumValue(this._sum, card);
                if (this._game.checkGameOver(this._sum)) {
                    this.server.send(JSON.stringify({
                        roomId: this._roomId,
                        action: 'gameEnd',
                        losePlayerId: this.state.turnPlayer.id
                    }));
                } else {
                    this.setState({
                        turnPlayer: nextPlayer,
                        players: sortedPlayers
                    });
                }
            } else if (action == 'gameEnd') {
                let losePlayerId = data.losePlayerId;
                let message = losePlayerId == this._player.id ? 'you lose!!' : `${this.state.players.find(player => player.id == losePlayerId).name} is lose!!`;
                if (!this._gameEnd) {
                    this._gameEnd = true;
                    alert(message);
                    this._sum = 0;
                    this._player.renounceHand();
                    this.setState({
                        startPlayed: false,
                        handCards: [],
                        turnPlayer: undefined,
                        pullOutCards: []
                    });
                }
            }
        });

        this.startGame = this.startGame.bind(this);
        this.pullOutCard = this.pullOutCard.bind(this);
    }

    private join(roomId: string, playerName: string) {
        this._player = new Player(playerName, shortid.generate());
        this.server.send(JSON.stringify({
            roomId: roomId,
            action: 'joinPlayer',
            playerName: this._player.name,
            playerId: this._player.id
        }));
    }
    private notifyMe(roomId: string) {
        this.server.send(JSON.stringify({
            roomId: roomId,
            action: 'notifyJoinedPlayer',
            playerName: this._player.name,
            playerId: this._player.id
        }));
    }
    private exitRoom() {
        this.server.send(JSON.stringify({
            roomId: this._roomId,
            action: 'notifyExitPlayer',
            playerId: this._player.id
        }));
        this.server.close();
    }

    startGame() {
        this.server.send(JSON.stringify({
            roomId: this._roomId,
            action: 'notifyStartGame'
        }));
        //#region setting
        this._deck = Deck.afresh();
        [...Array(3)].forEach(i => {
            this.state.players.forEach(player => {
                let card = this._deck.draw();
                this.server.send(JSON.stringify({
                    roomId: this._roomId,
                    action: 'passCard',
                    passPlayerId: player.id,
                    card: card.viewName
                }));
            });
        });
        //#endregion
    }
    pullOutCard(index: number, specifyPlayer?: Player) {
        let card: Card = this._player.pullOut(index);
        // console.info(`カードを場に出す: ${index}`);
        // console.info(card);
        this.setState(prevState => ({
            handCards: prevState.handCards.filter((info, i) => i !== index)
        }));
        this.server.send(JSON.stringify({
            roomId: this._roomId,
            action: 'pullOutCard',
            card: card.viewName,
            nextPlayerId: specifyPlayer?.id
        }));
    }

    componentDidMount() {
        window.onbeforeunload = () => {
            this.exitRoom();
        };
    }
    componentWillUnmount() {
        window.onbeforeunload = null;
        this.exitRoom();
    }

    render() {
        if (!this.state.connected) {
            return (<div>
<p>Connecting...</p>
            </div>);
        }
        
        return(<div>
{this.renderInfo()}
{this.renderPlayers()}
{this.renderGameStartButton()}
{this.renderTurnPlayer()}
{this.renderHandCards()}
{this.renderPullOutCards()}
        </div>);
    }

    private renderGameDescription(): JSX.Element {
        return (<div>
<h3>ゲームルール</h3>
        </div>);
    }
    private renderInfo(): JSX.Element {
        return (<div>
            <p>roomId: {this.props.roomId}</p>
            <p>your name is : {this.props.playerName}</p>
        </div>)
    }
    private renderPlayers(): JSX.Element {
        return (<ul>
{this.state.players.map(player => (<li key={player.id}>{player.name}</li>))}
        </ul>);
    }
    private renderGameStartButton(): JSX.Element {
        if (this.state.startPlayed || this.state.players.length <= 1) {
            return null;
        } else {
            return (<div>
<button onClick={this.startGame}>Start Game</button>
            </div>);
        }
    }
    private renderTurnPlayer(): JSX.Element {
        if (this.state.turnPlayer == undefined) {
            return null;
        } else {
            return (<p>{this.state.turnPlayer.name} 's turn</p>);
        }
    }
    private renderHandCards(): JSX.Element {
        if (this.state.startPlayed && this.state.turnPlayer != undefined) {
            let isMyTurn: boolean = this.state.turnPlayer.id == this._player.id;
            return (<div>
<h3>手札</h3>
<ul>
    {this.state.handCards.map((info, index) => {
        let card = info.card;
        let canPullOut: boolean = this._game.checkCanPullOut(this.state.pullOutCards.map(info => info.card), card);
        if (card.nextPlayerOrder() == OrderCategory.Nominate) {
            let selectedPlayer = this.state.players.find(player => player.id == info.selectNominatePlayerId);
            return isMyTurn ? (<li key={index}>
                <span>{card.viewName}</span>
                <ul>
                {this.state.players.filter(selectPlayer => selectPlayer.id != this._player.id)
                                   .map((selectablePlayer, i) => {
                                        let uniqueId = `player-${index}-${i}`;
                                        let playerId = selectablePlayer.id;
                                        return (<li key={uniqueId}>
                                            <input type="radio" id={uniqueId} value={playerId} checked={playerId == info.selectNominatePlayerId}
                                            name={`specifyPlayer-${index}`}
                                            onChange={e => this.setState(prevState => ({
                                                handCards: prevState.handCards.map((val, handIndex) => {
                                                    if (handIndex == index) {
                                                        val.selectNominatePlayerId = e.target.value;
                                                    }
                                                    return val;
                                                })
                                            }))
                                            } /><label htmlFor={uniqueId}>{selectablePlayer.name}</label>
                                        </li>);
                                    })}
                </ul>
                {selectedPlayer != undefined && canPullOut ? (<button onClick={e => this.pullOutCard(index, selectedPlayer)}>pull out</button>) : null}
            </li>) : (<li key={index}>
                <span>{card.viewName}</span>
            </li>);
        } else {
            return (<li key={index}>
                <span>{card.viewName}</span>
                {isMyTurn && canPullOut ? (<button onClick={e => this.pullOutCard(index)}>pull out</button>) : null}
            </li>);
        }
    })}
</ul>
            </div>);
        } else {
            return null;
        }
    }
    private renderPullOutCards(): JSX.Element {
        if (this.state.pullOutCards.length == 0) {
            return null;
        } else {
            return (<div>
                <h3>場札</h3>
                <ul>
                    {this.state.pullOutCards.map((info, index) => (<li key={`pull-out-card-${index}`}>{info.card.viewName}</li>))}
                </ul>
            </div>);
        }
    }

}
export default PlayingBoard;
