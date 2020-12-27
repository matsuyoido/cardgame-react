import {Card} from './card';


class Player {
    private static readonly HAND_MAX = 3;
    public readonly id: string;
    public readonly name: string;
    private _handCard: Card[];

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
        this._handCard = [];
    }

    /** 手札に加える */
    public addHand(card: Card) {
        if (Player.HAND_MAX <= this._handCard.length) {
            throw new Error(`hand card must ${Player.HAND_MAX} or less.`);
        }
        this._handCard.push(card);
    }

    /** 手札を確認する */
    public checkHand(): string[] {
        return this._handCard.map(card => card.viewName);
    }

    /** 手札からカードを出す */
    public pullOut(index: number): Card {
        let card = this._handCard.splice(index, 1);
        return card.length === 0 ? undefined : card[0];
    }

    /** 手札を破棄する */
    public renounceHand() {
        this._handCard.length = 0;
    }

}

export {Player};