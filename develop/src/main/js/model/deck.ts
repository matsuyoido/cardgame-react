import {Card, OrderCategory, CardCategory} from './card';
import _ from 'lodash';

/** 数値カード */
class PipCard extends Card {

    constructor(value: number) {
        super(CardCategory.Num, value);
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Next;
    }
    nextPlayerPullOutCount(): number {
        return 1;
    }
    skipMyTurn(): boolean {
        return false;
    }
    fixedValue(): boolean {
        return false;
    }

}

/** 最大値に変更するカード */
class MaxCard extends Card {

    constructor() {
        super(CardCategory.Special, 101);
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Next;
    }
    nextPlayerPullOutCount(): number {
        return 1;
    }
    skipMyTurn(): boolean {
        return false;
    }
    fixedValue(): boolean {
        return true;
    }

}

/** 次の順番を飛ばすカード(DOUBLEをPASSできる。その時は次の人がDOUBLEの効果を受ける。) */
class PassCard extends Card {

    constructor() {
        super(CardCategory.Special, "PASS");
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Next;
    }
    nextPlayerPullOutCount(): number {
        return 1;
    }
    skipMyTurn(): boolean {
        return true;
    }
    fixedValue(): boolean {
        return false;
    }

}

/** 順番を逆回りにするカード */
class TurnCard extends Card {

    constructor() {
        super(CardCategory.Special, "TURN");
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Previous;
    }
    nextPlayerPullOutCount(): number {
        return 1;
    }
    skipMyTurn(): boolean {
        return true;
    }
    fixedValue(): boolean {
        return false;
    }

}

/** 次の順番を指定するカード */
class ShotCard extends Card {

    constructor() {
        super(CardCategory.Special, "SHOT");
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Nominate;
    }
    nextPlayerPullOutCount(): number {
        return 1;
    }
    skipMyTurn(): boolean {
        return true;
    }
    fixedValue(): boolean {
        return false;
    }

}

/** 次の人がカードを2枚出さなければならないカード(次の人は1枚目にDOUBLEを使えない。二回俺のターン！！なイメージ。) */
class DoubleDrawCard extends Card {

    constructor() {
        super(CardCategory.Special, "DOUBLE");
    }

    nextPlayerOrder(): OrderCategory {
        return OrderCategory.Next;
    }
    nextPlayerPullOutCount(): number {
        return 2;
    }
    skipMyTurn(): boolean {
        return false;
    }
    fixedValue(): boolean {
        return false;
    }

}

// https://qiita.com/nwtgck/items/1cc44b6d445ae1d48957
type CardSet = {
    card: Card,
    count: number
}
class Deck {
    private static readonly LINE_UP: CardSet[] = [
        {
            card: new PipCard(1),
            count: 3
        },
        {
            card: new PipCard(2),
            count: 3
        },
        {
            card: new PipCard(3),
            count: 3
        },
        {
            card: new PipCard(4),
            count: 3
        },
        {
            card: new PipCard(5),
            count: 3
        },
        {
            card: new PipCard(6),
            count: 3
        },
        {
            card: new PipCard(7),
            count: 3
        },
        {
            card: new PipCard(8),
            count: 3
        },
        {
            card: new PipCard(9),
            count: 3
        },
        {
            card: new PipCard(10),
            count: 6
        },
        {
            card: new PipCard(50),
            count: 2
        },
        {
            card: new PipCard(-1),
            count: 2
        },
        {
            card: new PipCard(-10),
            count: 4
        },
        {
            card: new MaxCard(),
            count: 5
        },
        {
            card: new PassCard(),
            count: 4
        },
        {
            card: new TurnCard(),
            count: 4
        },
        {
            card: new ShotCard(),
            count: 2
        },
        {
            card: new DoubleDrawCard(),
            count: 2
        }
    ];
    public static readonly TOTAL_CARD_COUNT = Deck.LINE_UP.map(card => card.count).reduce((accumulator, currentValue) => accumulator + currentValue);
    private _deck: Card[] = [];

    private constructor() {}

    /** 新規 */
    public static afresh(): Deck {
        let instance = new Deck();

        Deck.LINE_UP.forEach(cardLineup => {
            // http://stackoverflow.com/questions/30452263/is-there-a-mechanism-to-loop-x-times-in-es6-ecmascript-6-without-mutable-varia
            [...Array(cardLineup.count)].forEach(i => {
                instance._deck.push(_.cloneDeep(cardLineup.card));
            });
        });

        instance.shuffle();
        return instance;
    }

    /** デッキの構築 */
    public static build(cardView: string[]): Deck {
        let instance = new Deck();
        cardView.forEach((cardViewName, argIndex) => {
            let foundCard = this.convertCard(cardViewName);
            if (foundCard === undefined) {
                throw new Error(`request parameter index [${argIndex}] is illegal type. [${cardViewName}]`);
            } else {
                instance._deck.push(_.cloneDeep(foundCard));
            }
        });
        return instance;
    }

    /** カード変換 */
    public static convertCard(cardView: string): Card {
        return Deck.LINE_UP.map(cardLineup => cardLineup.card).find(card => {
            return card.viewName === cardView;
        });
    }

    private shuffle() {
        // https://www.nxworld.net/tips/js-array-shuffle.html
        // Fisher–Yates shuffle
        for (let i = this._deck.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._deck[i], this._deck[j]] = [this._deck[j], this._deck[i]];
        }
    }

    /** カードを引く */
    public draw(): Card {
        return this._deck.shift();
    }

    public convertJson(): String {
        return JSON.stringify(this._deck.map(card => card.viewName));
    }

}

export {Deck};
