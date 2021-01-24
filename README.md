# React application practice

## 学習内容

React + WebSocket (+ TypeScript + SCSS + Webpack)

### Goal
1. React で SPA のアプリケーションを作成する
1. TypeScript を利用してソースコードを書く
1. 1つのHTML で動作するものを作成する


## 題材

[neu](https://shop.neu-icarus.com/items/192061)

※ ゲームのルールとカードの種類を参考にさせていただきました。

※ よろしければ、実際のゲームをご購入いただき、大切な方とお楽しみ下さい。


## Sample URL

https://matsuyoido.github.io/cardgame-react

※ 全てのルールを再現したわけではなく、サンプルとして1ゲーム遊ぶことができる仕様となっています。

※ 許諾を取れているわけではないため、公開を停止する場合がございます。

※ 無料枠での WebSocket を利用しているため、通信制限により突然利用できなくなる可能性がございます。


## 開発環境
1. java が実行できる環境であること
    - 理由: gradle の nodejs 管理プラグインを利用しているため
1. `$ gradlew testServer` を実行すればサーバーが起動するようになっています
    - `develop/src/test/server.js` に、ローカル起動用のJSがあり、 `const folderPath` で指定しているのが、アクセス時のルートディレクトリとなる
    - `localhost:3000` がアクセス用のURL


# 以降、開発者のメモと反省点などになります

## 特に嵌った点

### SCSS 定義名を TypeScript で参照させる & class名などの命名規則を ダッシュ記法にすること

webpack.config.js から抜粋

```javascript
		{
			test: /\.s[ca]ss$/,
			use: [
			  "style-loader",
			  {
				loader: "css-loader",
				options: {
					esModule: true,
					modules: {
						exportLocalsConvention: 'dashesOnly'
					}
				}
			  },
			  "postcss-loader",
			  "sass-loader"
			],
		  }
```

&

`$ tsm ${SCSSファイルまでのregexパス} --nameFormat dashes --exportType default` の実行によるSCSS用のtsファイル生成


### WebSocket のサーバー、どれを使おう問題

当初、 Achex サーバーを利用する予定だったが、メンテナンスされていなくて wss が使えず…。

結局、 [PieSocket](https://www.piesocket.com/) を利用することとした。

※ Heroku などにWebSocketサーバーを建てて利用することを迷ったが、どうせ使うなら WebSocketである必要ない…となったため


### 責務分け

再利用がしやすいようにWebSocket処理をインターフェース化などしようと考えたが、、

画面描画との連動性が高すぎて分割できず。また、WebSocketだとリクエストとレスポンスが別になるためうまく抽象化はできなかった。

結果として、WebSocketを使って画面を描画するファイルが1つ…という結果になった。


### GitHub pages での SPA化

Node.js によるサーバー起動であれば、全てのリクエストを index.html に…という設定で問題なくできた。

しかし、Github pages にはそんな設定はない(ルート or docs 配下のどちらかしか選択できないのも驚き…)。

調べたところ、 404 の時にリダイレクトさせて強制的にindex.htmlに遷移。index.html で、再度URLを組み替えるなどの処理をJSで行う参考ページあり。

その実装を適応させて、SPA化が実現できた。


## TODO

1. gradle による watchタスクを未検証のため、使えるか検証はしてみたい
1. ルールの拡充
    1. ホスト（ゲーム開始宣言をした人）がいなくなると、ゲームが続行不可能になる。ゲームの途中で人数が減ったら、ゲームを強制終了させるようにしたい。
    1. 本家はポイント制で、3ポイント消えると退場。最後の一人が勝者。という形式。これを実現したい。
        - いずれ、プレイヤーの持ちポイントを設定できるようにしたい
        - 持ちポイントがなくなった人はプレイヤーから降格し、見ているだけ…のステータスとしたい

