// import * as WebSocket from 'ws';

var isOpen = false;
let socket = new WebSocket("wss://cloud.achex.ca/test");

/*
誰かが参加した時点で、その人に対して自分が何なのか(player?watcher?)を添えて伝える

ゲームを開始します ⇒ sendToHub
開始宣言したユーザー・受け取ったユーザーは準備を始める

A: 開始 ⇒ホスト空
B: A
C: A
---
A: 開始1 ⇒ホスト空 ⇒ A ⇒ B
B: 開始2 ⇒ホスト空 ⇒ A ⇒ B
C: A ⇒ B
準備が終わった段階で、皆がホストが誰かを言う(空であれば何もしない). ⇒ sendToHub
そのホストの名前に全員が変更していけば良い。
さらに、誰が準備完了しているか、全員で把握する(開始宣言した時点で、プレイヤーを全員把握しているため、それで判断する)
---
3秒待ってからゲームを開始する。
ホストの人が、次の順番のプレイヤーを宣言 ⇒ sendToHub
受け取った人と自分が同じであれば、カードを出す ⇒ sendToHub
ホストの人が、次の順番のプレイヤーを宣言
...
ホストの人が、101を超えていた場合は、ゲーム終了を宣言する.
---
ホ-ストが消えたとなれば、プレイヤーの次の1番目がホストになるように皆で言う ⇒ sendToHub


管理するなら、

[{
    outCard: PASS,
    announcedSum: 10,
    player: sID,
    nextPlayer: sID
}]

*/


socket.addEventListener('message', (ev) => {
    console.log(ev);

    if (isOpen) {
        if (JSON.parse(ev.data).auth === 'OK') {
            console.log(ev.data.SID);
            socket.send(JSON.stringify({
                "joinHub": 'test'
            }));
        }
        if (JSON.parse(ev.data).joinHub === 'OK') {
            console.log('joined hub1');
            socket.send(JSON.stringify({
                toH: 'test',
                val: 'hello'
            }));
        }
    }
});

socket.onopen = (event) => {
    isOpen = true;

    socket.send(JSON.stringify({
        auth: 'sampleA',
        passwd: 'sampleA_pass'
    }));
};


var socket2 = new WebSocket("wss://cloud.achex.ca/test");
socket2.addEventListener('message', function (ev) {
    console.log(ev);
    if (isOpen) {
        if (JSON.parse(ev.data).auth === 'OK') {
            socket2.send(JSON.stringify({
                "joinHub": 'test'
            }));
        }
        if (JSON.parse(ev.data).joinHub === 'OK') {
            console.log('joined hub2');
            socket2.send(JSON.stringify({
                toH: 'test',
                val: 'hello'
            }));
        }
    }
});
socket2.onopen = function (event) {
    isOpen = true;
    socket2.send(JSON.stringify({
        auth: 'sampleA',
        passwd: 'sampleB_pass'
    }));
};
let a = '1';
console.log(a);
