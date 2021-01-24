import {Player} from './../model/player';
import {Card, OrderCategory} from './../model/card';


class GameRule {

    sumValue(currentSum:number, card: Card): number {
        if (card.fixedValue()) {
            return card.value();
        } else {
            return currentSum + card.value();
        }
    }

    checkGameOver(sum: number): boolean {
        return 101 < sum;
    }

    checkCanPullOut(boardCards: Card[], card: Card): boolean {
        let previousCard = this.getPreviousEffectCard(boardCards);
        if (previousCard == undefined) {
            return true;
        }
        // 一つ前がDOUBLEの時、1枚目にDOBULEは出せない
        let doubleNotPullOut = previousCard.nextPlayerPullOutCount() == 2 && card.nextPlayerPullOutCount() == 2;
        return !doubleNotPullOut;
    }

    sortPlayers(players: Player[], boardCards: Card[], card: Card, nextPlayerId: string): Player[] {
        if (card.skipMyTurn()) {
            if (OrderCategory.Next == card.nextPlayerOrder()) {
                return this.moveLeft(players);
            } else if (OrderCategory.Previous == card.nextPlayerOrder()) {
                return this.moveReverse(players);
            } else {
                let moveCount = players.length;
                let sortedPlayers: Player[] = players.slice();
                do {
                    sortedPlayers = this.moveLeft(sortedPlayers);
                    moveCount--; // 無限ループ防止
                } while(sortedPlayers[0].id != nextPlayerId && 0 < moveCount);
                if (moveCount < 0) {
                    alert('error.');
                }
                return sortedPlayers;
            }
        }
        let previousCard = this.getPreviousEffectCard(boardCards);
        if (previousCard != undefined && previousCard.nextPlayerPullOutCount() == 2) {
            return players;
        }
        return this.moveLeft(players);
    }

    private getPreviousEffectCard(cards: Card[], index = -1) {
        if (cards.length == 0) {
            return undefined;
        }
        let previousCard = cards.slice(index)[0];
        if (previousCard != undefined && previousCard.skipMyTurn()) {
            return this.getPreviousEffectCard(cards, index - 1);
        } else {
            return previousCard;
        }
    }

    private moveLeft(players: Player[]): Player[] {
        return [...players.slice(1), players[0]];
    }
    private moveReverse(players: Player[]): Player[] {
        return [...players.slice().reverse()];
    }

}

export default GameRule;