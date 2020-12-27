import {Player} from './player';
import {Card} from './card';
import {Deck} from './deck';

interface LayoutInfo {
    outCard: string;
    outPlayerId: string;
    sum: number;
    nextPlayerId: string;
    nextPullOutCount: number;
}

abstract class Board {

    /** Board ID */
    protected _id: String;
    /** あなた */
    protected _you: Player;
    /** 主催・運営・知らせ役 */
    protected _hostId: number;
    /** ゲームで遊んでいる人 */
    protected _players: Player[] = [];
    /** ゲームを遊んでいない人 */
    protected _watchers: Player[] = [];
    /** 現在の順番 */
    protected _presentTurnUserId: string;
    /** 場札 */
    protected _layoutCard: LayoutInfo[] = [];
    /** 山札 */
    protected _deck: Deck;
    /** 時計回り */
    protected _clockwise: boolean = true;

    /** ゲーム中？ */
    public abstract isPlaying(): boolean;
    /** 退出する */
    public abstract exit(): void;
    /** 参加を知らせる */
    protected abstract notifyJoin(user: Player);
    /** ゲーム開始を知らせる */
    protected abstract notifyStartGame();
    /** 順番が逆になったことを知らせる */
    protected abstract notifyReverseOrder();
    /** ボードの情報を同期する */
    public abstract synchronizedBoardInfo();
    /** カードが場に出たことを知らせる */
    protected abstract notifyPlacedCard(card: LayoutInfo);
    /** ゲーム終了を知らせる */
    protected abstract notifyResetGame();

    /** 遊んでいる？ */
    public isPlayer(): boolean {
        if (!this.isPlaying()) {
            throw new Error(`game not started.`);
        }
        return this._players.includes(this._you);
    }

    /** あなたの番？ */
    public readonly isYourTurn = (): boolean => {
        if (!this.isPlaying()) {
            throw new Error(`game not started.`);
        }
        return this._presentTurnUserId == this._you.id;
    }

    /** 参加する */
    public readonly join = (boardId: string, user: Player) => {
        this._id = boardId;
        this._you = user;
        
        this.notifyJoin(user);
    }

    /** ゲームを開始する */
    public readonly startGame = () => {
        if (this.isPlaying()) {
            throw new Error("already game started.");
        }
        this.notifyStartGame();
        this._players.push(...this._watchers.splice(0, this._watchers.length));
        this._deck = Deck.afresh();
    }

    /** カードを山札から引く */
    public readonly drawCard = (): Card => {
        if (!this.isYourTurn()) {
            throw new Error(`Not your turn.`);
        }
        return this._deck.draw();
    }

    /** カードを場に出す */
    public readonly placedCard = (cardName: string, nextTurnPlayerIndex: number, announcedSum: number, nextPullOutCount:number) => {
        let nextTurnPlayerId = this._players[nextTurnPlayerIndex].id;
        let placedInfo: LayoutInfo = {
            outCard: cardName,
            outPlayerId: this._you.id,
            sum: announcedSum,
            nextPlayerId: nextTurnPlayerId,
            nextPullOutCount: nextPullOutCount
        };
        this._layoutCard.push(placedInfo);
        this._presentTurnUserId = nextTurnPlayerId;
        this.notifyPlacedCard(placedInfo);
    }

    /** ゲームをリセット */
    public readonly resetGame = () => {
        this._hostId = undefined;
        this._watchers.push(...this._players.splice(0, this._players.length));
        this._presentTurnUserId = undefined;
        this._layoutCard = [];
        this._deck = undefined;
        this._clockwise = true;
    }

    public readonly getPlayers = () => Object.freeze(this._clockwise ? this._players : this._players.reverse());
    public readonly getLatestLayoutCard = ():LayoutInfo => this._layoutCard.slice(-1)[0];

    public readonly reverseOrder = (notify: boolean = true) => {
        this._clockwise = !this._clockwise;
        if (notify) {
            this.notifyReverseOrder();
        }
    }


}

export {Board, LayoutInfo};