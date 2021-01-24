
import * as React from 'react';
import { useState, useCallback } from 'react';
import * as shortid from 'shortid';
import { Card } from '../model/card';
import { Player } from '../model/player';
import styles from '../../css/component/_playCard.scss';

// カードデザイン
enum CardDesign {
    PLUS_CARD,
    MINUS_CARD,
    SPECIAL_CARD,
    ACE_CARD,
    BACK_CARD
}
interface CardProp {
    cardIndex: number;
    viewName: string;
    design: CardDesign;
    visibleSelectBtn: boolean;
    visiblePlayerSelect: boolean;
    selectablePlayers?: Player[];
    pullOutEventFunc?: (cardIndex: number, specifyPlayer?: Player) => void;
}

const PlayCard = (props: CardProp): JSX.Element => {
    const [selectPlayerId, setSelectPlayerId] = useState("");

    const playerSelect = props.visiblePlayerSelect ? (<ul className={styles.playerSelect}>
{props.selectablePlayers.map((player, index) => {
    let uniqueId = `player-${shortid.generate()}`;
    let playerId = player.id;
    return (<li key={uniqueId} className={styles.playerRaw}>
<input type="radio" id={uniqueId}
    value={playerId} checked={playerId == selectPlayerId}
    onChange={e => setSelectPlayerId(e.target.value)} />
<label htmlFor={uniqueId} className={styles.playerName} >{player.name}</label>
    </li>);
})}
    </ul>) : null;
    let cardSelectBtn: JSX.Element;
    if (props.visiblePlayerSelect) {
        cardSelectBtn = selectPlayerId != "" && props.visibleSelectBtn ? (<>
<button className={styles.pulloutBtn} onClick={e => props.pullOutEventFunc(props.cardIndex, props.selectablePlayers.find(player => player.id == selectPlayerId))}>場に出す</button>
        </>) : null;
    } else {
        cardSelectBtn = props.visibleSelectBtn ? (<>
<button className={styles.pulloutBtn} onClick={e => props.pullOutEventFunc(props.cardIndex)}>場に出す</button>
                </>) : null;
    }
    let cardDesign: string[] = [styles.playCard];
    switch (props.design) {
        case CardDesign.PLUS_CARD:
            cardDesign.push(styles.plus);
            break;
        case CardDesign.MINUS_CARD:
            cardDesign.push(styles.minus);
            break;
        case CardDesign.SPECIAL_CARD:
            cardDesign.push(styles.special);
            break;
        case CardDesign.ACE_CARD:
            cardDesign.push(styles.fixed);
            break;
        case CardDesign.BACK_CARD:
            cardDesign.push(styles.back);
            break;
    }

    // https://saruwakakun.com/html-css/reference/ribbon みたいな感じで両端に文字入れられないだろうか…
    return (<>
<div className={cardDesign.join(' ')}>
    <div className={styles.rightTop}>
        <span>{props.viewName}</span>
    </div>
    <p>{props.viewName}</p>
    <div className={styles.leftBottom}>
        <span>{props.viewName}</span>
    </div>
</div>
{playerSelect}
<div>
    {cardSelectBtn}
</div>
    </>);
};

export {CardDesign};
export default PlayCard;