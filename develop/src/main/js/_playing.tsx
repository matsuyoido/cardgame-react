import * as React from 'react';
import { Player } from './model/player';
import { Deck } from './model/deck';
import { Card, OrderCategory } from './model/card';
import GameRule from './model/gameRule';
import * as shortid from 'shortid';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const swal = withReactContent(Swal);
import UrlMap from './url';

import {GameCard, GameOverview, GameProceed, GameProceedEn} from './component/GameText';
import { CardDesign } from './component/PlayCard';
import PlayCard from './component/PlayCard';
import styles from '../css/_pages.scss';

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

class PlayingBoard extends React.Component<PropType, StatType> {
    private readonly prodConnectUrl: string = "wss://us-nyc-1.websocket.me/v3/1?api_key=8KhojaoOEF6pdL635Pvvijp4xSqOmdkdQ6dAUXAf&notify_self";
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
        this.server = new WebSocket(window.location.hostname == 'matsuyoido.github.io' ? this.prodConnectUrl : this.connectUrl);
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
                let areYouLose = losePlayerId == this._player.id;
                if (!this._gameEnd) {
                    this._gameEnd = true;
                    swal.fire({
                        title: areYouLose ? 'you lose!!' : `${this.state.players.find(player => player.id == losePlayerId).name} is lose!!`,
                        timer: 5000,
                        timerProgressBar: true,
                        icon: areYouLose ? 'error' : 'info'
                    });
                    this._sum = 0;
                    this._player.renounceHand();
                    this.setState({
                        startPlayed: false,
                        handCards: [],
                        turnPlayer: undefined,
                        pullOutCards: []
                    });
                }
            } else if (action == 'resetGame') {
                let doResetPlayer = this.state.players.find(player => player.id == data.playerId);
                swal.fire({
                    title: 'Game Reset',
                    timer: 5000,
                    timerProgressBar: true,
                    icon: 'warning',
                    text: `by ${doResetPlayer.name}`
                });
                this._sum = 0;
                this._player.renounceHand();
                this.setState({
                    startPlayed: false,
                    handCards: [],
                    turnPlayer: undefined,
                    pullOutCards: []
                });
            }
        });

        this.startGame = this.startGame.bind(this);
        this.pullOutCard = this.pullOutCard.bind(this);
        this.resetGame = this.resetGame.bind(this);
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
    private resetGame() {
        this.server.send(JSON.stringify({
            roomId: this._roomId,
            action: 'resetGame',
            playerId: this._player.id
        }));
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
        window.onclose = () => {
            this.exitRoom();
        };
        window.onunload = () => {
            this.exitRoom();
        };
        // onpagehide もあるが、別タブに切り替えると抜けることになるので対象外にする
    }
    componentWillUnmount() {
        window.onbeforeunload = null;
        window.onclose = null;
        window.onunload = null;
        this.exitRoom();
    }

    render() {
        if (!this.state.connected) {
            return (<div id={styles.loading}>
<div className={styles.loader}>Connecting...</div>
            </div>);
        }
        return(<div id={styles.playing}>
<header>
    {this.renderHeader()}
</header>
<nav>
    {this.renderNavigation()}
</nav>
<div id={styles.main}>
  <main>
    {this.renderMain()}
  </main>
  <aside>
      <GameCard />
  </aside>
</div>
        </div>);
    }

    private renderHeader(): JSX.Element {
        return (<>
<div>
    <button type="button" className={styles.btn} onClick={e => swal.fire({
        title: 'Copy to Clipboard',
        html: (<>
        <p>RoomID: {this.props.roomId}</p>
        <div>
            <button className={['swal2-styled', styles.btn].join(' ')} onClick={e => {
                this.copyClipboard(this.props.roomId);
                swal.clickConfirm();
            }}>RoomID</button>
            <button className={['swal2-styled', styles.btn].join(' ')} onClick={e => {
                this.copyClipboard(`${window.location.protocol}//${window.location.host}${UrlMap.generatePlayingUrl(this.props.roomId)}`);
                swal.clickConfirm();
            }}>URL</button>
        </div>
        </>),
        showConfirmButton: false,
        showCancelButton: false,
        showCloseButton: true
    }).then(result => {
        if (result.isConfirmed) {
            swal.fire({
                icon: 'success',
                text: 'Copied!',
                timer: 1000,
                timerProgressBar: true
            });
        }
    })}>Invitation</button>
</div>
<div>
    <button type="button" className={styles.btn} onClick={e => swal.fire({
        title: '概要',
        html: (<GameOverview />),
        showCloseButton: true
    })}>Overview</button>
</div>
<div>
    <button type="button" className={styles.btn} onClick={e => swal.fire({
        title: 'ゲーム進行',
        html: (<GameProceed />),
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'OK',
        confirmButtonText: 'English',
    }).then(result => {
        if (result.isConfirmed) {
            swal.fire({
                title: 'Game progress',
                html: (<GameProceedEn />),
                showCloseButton: true,
            });
        }
    })}>HowTo</button>
</div>
        </>);
    }

    private renderNavigation(): JSX.Element {
        return (<>
{ (this.state.turnPlayer == undefined) ? null : (<>
<div>
    <p>{this.state.turnPlayer.name} 's turn</p>
</div>
<div>
    <button type="button" className={[styles.switchBtn, styles.reset].join(' ')} onClick={this.resetGame}>Reset Game</button>
</div>
  </>)}
{ (this.state.startPlayed || this.state.players.length <= 1) ? null : 
(<div>
    <button className={[styles.switchBtn, styles.start].join(' ')} onClick={this.startGame}>Start Game</button>
</div>)
}
        </>);
    }

    private renderMain(): JSX.Element {
        return (<>
<section>
    <div id={styles.players}>
        <h3>Player</h3>
        {this.state.startPlayed ?
        (<ol>
            {this.state.players.map(player => (<li key={player.id}>{player.name}</li>))}
        </ol>) : 
        (<ul>
            {this.state.players.map(player => (<li key={player.id}>{player.name}</li>))}
        </ul>)
        }
    </div>
    <div id={styles.board}>
        <div id={styles.deck}>
            <PlayCard cardIndex={-1} viewName="&#9834;" design={CardDesign.BACK_CARD}
            visiblePlayerSelect={false} visibleSelectBtn={false} />
        </div>
        <div id={styles.fields}>
            { (this.state.pullOutCards.length == 0) ? null :
            (<div className={styles.scrolls}>
                <ul>
                    {this.state.pullOutCards.map((info, index) => {

                        return (<li key={`pull-out-card-${index}`} style={{ zIndex: index }}>
                        <PlayCard cardIndex={index} viewName={info.card.viewName} design={this.getCardDesign(info.card)}
                        visiblePlayerSelect={false} visibleSelectBtn={false} />
                        </li>);
                    })}
                </ul>
            </div>)
            }
        </div>
    </div>
    {this.renderHandCards()}
</section>
        </>);
    }

    private renderHandCards(): JSX.Element {
        if (this.state.startPlayed && this.state.turnPlayer != undefined) {
            let isMyTurn: boolean = this.state.turnPlayer.id == this._player.id;
            return (<div id={styles.hands}>
<h3>Hand</h3>
<ul>
    {this.state.handCards.map((info, index) => {
        let card = info.card;
        let canPullOut: boolean = this._game.checkCanPullOut(this.state.pullOutCards.map(info => info.card), card);
        let canSelectPlayer: boolean = card.nextPlayerOrder() == OrderCategory.Nominate;
        return (<li key={`handCard-${index}`}>
        <PlayCard cardIndex={index} viewName={card.viewName} design={this.getCardDesign(card)}
          visibleSelectBtn={isMyTurn && canPullOut} visiblePlayerSelect={isMyTurn && canSelectPlayer}
          selectablePlayers={this.state.players.filter(selectPlayer => selectPlayer.id != this._player.id)}
          pullOutEventFunc={this.pullOutCard} />
        </li>);
    })}
</ul>
            </div>)
        }
        return null;
    }

    private getCardDesign(card: Card): CardDesign {
        if (card.isSpecialCard()) {
            return card.fixedValue() ? CardDesign.ACE_CARD : CardDesign.SPECIAL_CARD;
        } else {
            return 0 < Math.sign(card.value()) ? CardDesign.PLUS_CARD : CardDesign.MINUS_CARD;
        }
    }

    private copyClipboard(text: string): void {
        let body = document.querySelector('body');
        let temporaryCopyElement = document.createElement("textarea");
        temporaryCopyElement.textContent = text;
        
        body.appendChild(temporaryCopyElement);
        temporaryCopyElement.select();
        document.execCommand('copy');
        body.removeChild(temporaryCopyElement);
    }

}
export default PlayingBoard;
