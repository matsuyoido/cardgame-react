
enum CardCategory {
    /** 数値カード */
    Num,
    /** 特殊カード */
    Special
}
enum OrderCategory {
    /** 次の手順 */
    Next,
    /** 前の手順 */
    Previous,
    /** 指定された手順 */
    Nominate,
}

abstract class Card {
    private _category: CardCategory;
    public readonly viewName: string

    constructor(category: CardCategory, viewName: string | number) {
        this._category = category;
        this.viewName = viewName.toString();
    }

    // final method
    /** カードの値を返す */
    public readonly value = (): number => {
        return CardCategory.Num === this._category || !isNaN(+this.viewName) ? +this.viewName : 0;
    };
    /** 特殊カードである */
    public readonly isSpecialCard = (): boolean => CardCategory.Special === this._category;

    /** 次の順番 */
    abstract nextPlayerOrder(): OrderCategory;

    /** 次の人が場に出すカードの数 */
    abstract nextPlayerPullOutCount(): number;

    /** 自分の手番を飛ばして次の人に効果を継続させる */
    abstract skipMyTurn(): boolean;

    /** 数値を固定化させる */
    abstract fixedValue(): boolean;

}

export {Card};
export {OrderCategory, CardCategory};

