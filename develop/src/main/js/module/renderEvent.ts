import {Player} from './../model/player';

interface GameFlow {

    /** プレイヤー参入 */
    receivePlayer(player: Player, isPlayer: boolean);
    /** プレイヤー変更 */
    receiveChangedMember(players: readonly Player[], watchers: readonly Player[]);
    /** ゲーム開始を受けて準備完了 */
    completeSetup(player: Player);
    /** カードが置かれる */
    notifyPullOutCard(pullOutCard: string, announcedSum: number);
    /** 次のプレイヤー操作 */
    nextPlayerAction(player: Player, pullOutCount: number);
    /** ゲームが終了する */
    receiveEndGame(watchers: readonly Player[]);

}

export {GameFlow};