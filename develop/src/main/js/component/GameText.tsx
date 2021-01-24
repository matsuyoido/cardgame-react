import * as React from 'react';
import { useState } from 'react';
import { Deck } from './../model/deck';


function GameOverview(): JSX.Element {
    return (<>
<dl>
    <dt>Players<small>（プレイ人数）</small></dt><dd>2 or more</dd>
    <dt>Deck<small>（全カード数）</small></dt><dd>{Deck.TOTAL_CARD_COUNT}</dd>
    <dt>Hand<small>（手札）</small></dt><dd>Max 3</dd>
    <dt>LifePoint<small>（持ち点）</small></dt><dd>3</dd>
</dl>
    </>);
}

function GameProceed(): JSX.Element {
    return (<>
<ol style={{
    textAlign: 'start'
}}>
    <li>プレイヤーが手札からカードを場札に出す</li>
    <li>場札にあるカードの合計を宣言する<br />（ビデオ通話などで）</li>
    <li>場札の合計が101を超えると敗北</li>
    <li>101未満であれば、次のプレイヤーが手札からカードを場札に出す</li>
</ol>
<aside style={{
    textAlign: 'start',
    fontSize: 'small'
}}>
    <ul>
        <li>ゲームに敗北すると点数が－1</li>
        <li>点数が0のプレイヤーは脱落</li>
        <li>最後に残ったプレイヤーが勝者！</li>
    </ul>
</aside>
    </>);
}
function GameProceedEn(): JSX.Element {
    return (<>
<ol style={{
    textAlign: 'start'
}}>
    <li>Player pull out a card from a hand.</li>
    <li>Declare the total number of cards on a field.<br />（via video chat）</li>
    <li>Defeat when total exceeds 101.</li>
    <li>If less than 101, the next player pull out a card from the hand.</li>
</ol>
<aside style={{
    textAlign: 'start',
    fontSize: 'small'
}}>
    <ul>
        <li>If you lose the game, you get -1 life points.</li>
        <li>Players with 0 life points are eliminated.</li>
        <li>The last remaining player wins！</li>
    </ul>
</aside>
    </>);
}

function GameCard(): JSX.Element {
    const [isView, setViewable] = useState(false);
    const header = (<>
<h3 onClick={e => setViewable(!isView)}>Kind of card<span style={{ cursor: 'pointer', marginLeft: '.5rem' }}>{isView ? '―' : '＋'}</span></h3>
    </>);
    if (isView) {
        return (<div>
{header}
<dl>
    <dt>-10～50</dt><dd>Add or Subtract<br /><small>（それぞれの数を足したり引いたりする）</small></dd>
    <dt>101</dt><dd>Make it 101 regardless of the total<br /><small>（合計に関係なく合計を101にする）</small></dd>
    <dt>PASS</dt><dd>Turn to the next player<br /><small>（次プレイヤーに順番を回す）</small></dd>
    <dt>TURN</dt><dd>Reverse the order<br /><small>（順番を逆回りにする）</small></dd>
    <dt>SHOT</dt><dd>Specify player<br /><small>（次プレイヤーを指名する）</small></dd>
    <dt>DOUBLE</dt><dd>Next player plays two cards<br /><small>（次プレイヤーがカードを2枚出す必要がある）</small></dd>
</dl>
<h4>Cautionary points</h4>
<ol>
    <li>Mr.A: DOUBLE &rarr; Ms.B: Cannnot DOUBLE<br /><small>（DOUBLEを連続して出すことができない）</small></li>
    <li>Mr.A: DOUBLE &rarr; Ms.B: [PASS or TURN or SHOT] &rarr; Mrs.C: [plays two cards]<br /><small>（DOUBLEの次に特殊カードが出された場合、その効果が次の人に引き継がれる）</small></li>
</ol>
        </div>);
    } else {
        return (<div>
            {header}
        </div>);
    }
}

export {GameOverview, GameProceed, GameProceedEn, GameCard};