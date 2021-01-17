import * as React from 'react';
import { useState } from 'react';
import { Player } from './model/player';
import { Deck } from './model/deck';
import { Card, OrderCategory } from './model/card';
import GameRule from './model/gameRule';
import * as shortid from 'shortid';
import UrlMap from './url';

import { CardDesign } from './component/PlayCard';
import PlayCard from './component/PlayCard';
import styles from '../css/_board.scss';

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

const GameDescription = (): JSX.Element => {
    const [isView, setViewable] = useState(false);
    const header = (<>
<h3>ゲーム説明 <span style={{ cursor: 'pointer' }} onClick={e => setViewable(!isView)}>{isView ? '―' : '＋'}</span></h3>
    </>);
    if (isView) {
        return (<div>
{header}
<h4>概要</h4>
<dl>
    <dt>ゲーム名</dt><dd>Neu(ノイ)</dd>
    <dt>プレイ人数</dt><dd>2人以上</dd>
    <dt>手札</dt><dd>最大3枚</dd>
    <dt>全カード数</dt><dd>{Deck.TOTAL_CARD_COUNT}枚</dd>
</dl>
<h4>進め方</h4>
<ol>
    <li>プレイヤーが手札からカードを場札に出す</li>
    <li>場札にあるカードの合計を宣言する（ビデオ通話などで）</li>
    <li>場札の合計が101を超えると敗北</li>
    <li>101未満であれば、次のプレイヤーが手札からカードを場札に出す</li>
</ol>
<h4>カードの種類</h4>
<dl>
    <dt>数値</dt><dd>それぞれの数を足したり引いたりする</dd>
    <dt>101</dt><dd>合計に関係なく合計を101にする</dd>
    <dt>PASS</dt><dd>次プレイヤーに順番を回す</dd>
    <dt>TURN</dt><dd>順番を逆回りにする</dd>
    <dt>SHOT</dt><dd>次プレイヤーを指名する</dd>
    <dt>DOUBLE</dt><dd>次プレイヤーがカードを2枚出す必要がある</dd>
</dl>
<h4>勝敗の決まり方</h4>
<p>各プレイヤーはチップを3枚持つ。ゲームに敗北したプレイヤーは、チップを1枚失う。<br />全てのチップを失ったプレイヤーは、ゲームから脱落し、次回からのゲームに参加できない。これをプレイヤーが1人になるまで続け、最終的に残ったプレイヤーが、ゲームの勝者となる。</p>
        </div>);
    } else {
        return (<div>
            {header}
        </div>);
    }
}

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
            console.log(data);
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
        
        return(<>
<header className={styles.headerLayout}>
    <div>
        <button className={styles.copyBtn} onClick={e => this.copyClipboard(this.props.roomId)}>Copy<span className={styles.moreText}>RoomID</span></button>
    </div>
    <div>
        <button className={styles.copyBtn} onClick={e => this.copyClipboard(`${window.location.protocol}//${window.location.host}${UrlMap.generatePlayingUrl(this.props.roomId)}`)}>Copy<span className={styles.moreText}>URL</span></button>
    </div>
</header>
<nav className={styles.navLayout}>
  { (this.state.turnPlayer == undefined) ? null :
  (<div>
    <p>{this.state.turnPlayer.name} 's turn</p>
  </div>)
  }
  { (this.state.startPlayed || this.state.players.length <= 1) ? null : 
  (<div>
    <button className={styles.startBtn} onClick={this.startGame}>Start Game</button>
  </div>)
  }
</nav>
<div>
  <main>
    <section>
        <div className={styles.playersLayout}>
            <h3>プレイヤー</h3>
            {this.state.startPlayed ?
            (<ol>
                {this.state.players.map(player => (<li key={player.id}>{player.name}</li>))}
            </ol>) : 
            (<ul>
                {this.state.players.map(player => (<li key={player.id}>{player.name}</li>))}
            </ul>)
            }
        </div>
        <div className={styles.boardLayout}>
            <div className={styles.deckLayout}>
                <PlayCard cardIndex={-1} viewName="Neu" design={CardDesign.BACK_CARD}
                visiblePlayerSelect={false} visibleSelectBtn={false} />
            </div>
            <div className={styles.cardsLayout}>
                { (this.state.pullOutCards.length == 0) ? null :
                (<div className={styles.fieldCards}>
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
  </main>
  <aside className={styles.descriptionLayout}><GameDescription /></aside>
</div>
        </>);
    }


    private renderHandCards(): JSX.Element {
        if (this.state.startPlayed && this.state.turnPlayer != undefined) {
            let isMyTurn: boolean = this.state.turnPlayer.id == this._player.id;
            return (<div>
<h3>手札</h3>
<ul className={styles.handCards}>
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
        alert('copied!');
    }

}
export default PlayingBoard;
