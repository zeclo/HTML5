import * as PIXI from 'pixi.js';
//var fs = require('fs')
import * as csvSync from 'csv-parse/lib/sync';


let rsGetJSON = '';
function getJSON(url:string){
    fetch(url) //非同期処理に注意。チェーンメソッドを利用。
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            //var json = JSON.parse(JSON.stringify( data ));
            //alert(json);
            alert(json);
            rsGetJSON = json;
        })
        .catch((error) => {
            alert('Error:'+ error);
        }); 
}

let rsGetCSV = '';
function getCSV(url:string){
    fetch(url) //非同期処理に注意。チェーンメソッドを利用。
        .then(function(response) {
            return response.text();
        })
        .then(function(text) {
            rsGetCSV = text;
        }); 
}

//ファイルの読み込み。windoow.onload前に実行
getCSV('/scenario.csv');
//getJSON('/scenario2.json');

function convertCSVtoArray2(str:string){ // 読み込んだCSVデータが文字列として渡される
    alert("convertCSVtoArray2開始");
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
 
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for(var i=0;i<tmp.length;++i){
        result[i] = tmp[i].split(',');
    }
 
    alert("これからCSVの2行目3列目(=[1][2])の値を出力");
    alert(result[1][2]); // 300yen
    //return result[1][2]
}


window.onload = () => {
    alert("window.onload開始");

    //★PIXIのインスタンス化→viewをHTMLのBodyタグ内に追加　
	// width: 600,     // スクリーン(ビュー)横幅 
    //height: 600,    // スクリーン(ビュー)縦幅  
    const app = new PIXI.Application({ backgroundColor: 0x1099bb ,width: 750,height: 500});
    document.body.appendChild(app.view);

    //★画像データの読み込み
    app.loader
        .add('/assets/0score.png')
        .add('/assets/メッセージ.png')
        .add('/assets/キャラクタ.png')
        .add('/assets/回答欄.png')
        .add('/assets/次へボタン.png')
        .load(onAssetsLoaded2);
    

    alert("テストおぉぉぉぉぉぉぉ→この処理はload(onAssetsLoaded2)より早く実行される");


    const REEL_WIDTH = 160;
    const SYMBOL_SIZE = 150;


    //★読み込んだ画像データをテクスチャ(アプリ上でインスタンス化)に登録
    // onAssetsLoaded handler builds the example.
    function onAssetsLoaded2() {

        convertCSVtoArray2(rsGetCSV);

        //alert("0はじめ。この後rsGetJSONを出力(アラート続くよ。。)");
        //var json3 = 'json =\'' + JSON.stringify(rsGetJSON,null, 2) + '\'';
      

        PIXI.resources.BufferResource
        // 画像を読み込み、テクスチャにする
        let butaTexture = PIXI.Texture.from('/assets/animalface_kangaroo.png');
        // 読み込んだテクスチャから、スプライトを生成する
        let butaSprite = new PIXI.Sprite(butaTexture);
        // ぶたの基準点を設定(%) 0.5はそれぞれの中心 位置・回転の基準になる
        butaSprite.anchor.x = 0.5;
        butaSprite.anchor.y = 0.5;
        // ぶたの位置決め
        butaSprite.x = app.screen.width / 2;        // ビューの幅 / 2 = x中央
        butaSprite.y = app.screen.height / 2;       // ビューの高さ / 2 = y中央
        // 表示領域に追加する
        app.stage.addChild(butaSprite);


        // 円を作る(テクスチャを貼る)
        let circle = new PIXI.Graphics()
        // 塗りつぶしのかわりにテクスチャを貼る (テクスチャ,色味(リファレンスには背景色って書いてあるからバグかも),透明度,テクスチャのスケール・位置情報)
        //.beginTextureFill(butaTexture, 0x00ffff, 1, new PIXI.Matrix(1,0,0,1,-35,-35))  
        //.beginTextureFill(butaTexture)
        .lineStyle(2, 0x000000)     // 線のスタイル指定(幅, 色) これ以外に透明度, alignment(線の位置)などが指定可能
        .drawCircle(0,0,30)   
        .endFill();
        
        circle.x = 200;
        circle.y = 100;
        app.stage.addChild(circle);




        // 新しいコンテナを生成
        let sampleContainer = new PIXI.Container();

        // ステージのあたりに作ったコンテナを配置する
        sampleContainer.x = 100;
        sampleContainer.y = app.screen.height - 200;
        app.stage.addChild(sampleContainer);

        // 新しいコンテナにオブジェクトを入れていく
        // 背景色用の長方形
        let background = new PIXI.Graphics()
        .beginFill(0xffff00)
        .drawRect(0,0,400,200)
        .endFill();

        // コンテナに入れる
        sampleContainer.addChild(background);

        // 大量のロッカーをぶち込む
        let lockerTexture = PIXI.Texture.from('/assets/animalface_kirin.png')
        let lockers = new Array()
        for (let i=0; i < 2; i++) {
            for(let j=0; j < 13; j++ ) {
                let locker = new PIXI.Sprite(lockerTexture);
                locker.scale.x = locker.scale.y = 0.25;
                locker.x = j * 30 + 10;
                locker.y = i * 100 + 20;
                sampleContainer.addChild(locker);
                lockers.push(locker)
            }
        }
        // コンテナを適当に動かしたり回転させたりしてみる
        //sampleContainer.x += 50;
        //sampleContainer.y -= 50;
        //sampleContainer.rotation = -Math.PI / 3;
        //sampleContainer.scale.x = sampleContainer.scale.y = 1.5;


        /**
         * 1.6 
         */

        // 中央のぶたのインタラクション(イベント)を有効化
        butaSprite.interactive = true;

        // ぶたにマウスが重なった時、表示をポインターにする
        butaSprite.buttonMode = true;

        // 中央のぶたスプライトにクリックイベントのリスナーを設定する
        // オブジェクト.on('イベントの種類', イベントハンドラ) で設定する
        butaSprite.on('pointertap',showAlert);

        function showAlert(e) {
            console.log(e);
            alert('ぶたがクリック(タップ)されました!!');
            butaSprite.visible = false;
        }

        // リスナーを解除する(on()の逆)
        // butaSprite.off('pointertap',showAlert);


        
        


        //ベース
        let aBase1 = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(0,0,750,500) //起点x、起点y、長さ横、長さ縦
        .endFill();
        //app.stage.addChild(aBase1);

        

        //・スコア(aScore)
        let aScore1 = new PIXI.Graphics()
        .beginFill(0x0000FF)
        .drawRect(0,0,750,50) //起点x、起点y、長さ横、長さ縦
        .endFill();
        app.stage.addChild(aScore1);

        let aScore = PIXI.Texture.from('/assets/0score.png');
        let aScoreSprite = new PIXI.Sprite(aScore);    
        aScoreSprite.anchor.x = 0;
        aScoreSprite.anchor.y = 0;
        aScoreSprite.x = 0;       
        aScoreSprite.y = 0;      
        app.stage.addChild(aScoreSprite);

        //会話(aMessage)
        let aMessage1 = new PIXI.Graphics()
        .beginFill(0x00FF00)
        .drawRect(0,50,750,200) //起点x、起点y、長さ横、長さ縦
        .endFill();
        //app.stage.addChild(aMessage);

        let aMessage = PIXI.Texture.from('/assets/メッセージ.png');
        let aMessageSprite = new PIXI.Sprite(aMessage);    
        aMessageSprite.anchor.x = 0;
        aMessageSprite.anchor.y = 0;
        aMessageSprite.x = 0;       
        aMessageSprite.y = 50;      
        app.stage.addChild(aMessageSprite);


        //キャラクタ(aCharacter)
        let aCharacter1 = new PIXI.Graphics()
        .beginFill(0x00FFFF)
        .drawRect(0,250,750,100) //起点x、起点y、長さ横、長さ縦
        .endFill();
        //app.stage.addChild(aCharacter1);
        let aCharacter = PIXI.Texture.from('/assets/キャラクタ.png');
        let aCharacterSprite = new PIXI.Sprite(aCharacter);    
        aCharacterSprite.anchor.x = 0;
        aCharacterSprite.anchor.y = 0;
        aCharacterSprite.x = 0;       
        aCharacterSprite.y = 250;      
        app.stage.addChild(aCharacterSprite);


        //回答欄(aAnswer)
        let aAnswer1 = new PIXI.Graphics()
        .beginFill(0xFF0000)
        .drawRect(0,350,750,150) //起点x、起点y、長さ横、長さ縦
        .endFill();
        //app.stage.addChild(aAnswer1);
        let aAnswer = PIXI.Texture.from('/assets/回答欄.png');
        let aAnswerSprite = new PIXI.Sprite(aAnswer);    
        aAnswerSprite.anchor.x = 0;
        aAnswerSprite.anchor.y = 0;
        aAnswerSprite.x = 0;       
        aAnswerSprite.y = 350;      
        app.stage.addChild(aAnswerSprite);









        //app.ticker.add(animate);
        let amountTime = 0;

        // 処理の定義
        function animate(delta) {
            // ぶたがはまってる円を左右に動かす(適当なのでほっとくとどんどんずれていきます)
            //amountTime += delta;                    // delta(app.ticker.deltaTime) : 前のフレームから今のフレームまでの経過時間を正規化した値？
            amountTime += app.ticker.deltaMS;    // app.ticker.deltaMS  : 前のフレームから今のフレームまでの経過時間(ms)

            if (amountTime >= 1000) {
                // 右に動かす
                alert("1秒たったぜ！" +amountTime);
                amountTime = 0
                //スプライトに対して処理も可能
                //aAnswerSprite.x = 100;       
            }
            else {
                // 左に動かす
                //circle.x -= 2;
            }
        }

    }


    //▲▲▲▲ここまでがオリジナル▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲







    //★読み込んだ画像データをテクスチャ(アプリ上でインスタンス化)に登録
    // onAssetsLoaded handler builds the example.
    function onAssetsLoaded() {
        // Create different slot symbols.
        const slotTextures = [
            PIXI.Texture.from('/assets/animalface_kangaroo.png'),
            PIXI.Texture.from('/assets/animalface_kirin.png'),
            PIXI.Texture.from('/assets/animalface_tanuki.png'),
            PIXI.Texture.from('/assets/animalface_usagi.png'),
        ];

        // Build the reels
        const reels = [];
        const reelContainer = new PIXI.Container();
        for (let i = 0; i < 5; i++) {
            const rc = new PIXI.Container();
            rc.x = i * REEL_WIDTH;
            reelContainer.addChild(rc);

            const reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter(),
            };
            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            rc.filters = [reel.blur];

            // Build the symbols
            for (let j = 0; j < 4; j++) {
                const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
                // Scale the symbol to fit symbol area.
                symbol.y = j * SYMBOL_SIZE;
                symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
                symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
                reel.symbols.push(symbol);
                rc.addChild(symbol);
            }
            reels.push(reel);
        }
        app.stage.addChild(reelContainer);

        // Build top & bottom covers and position reelContainer
        const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
        reelContainer.y = margin;
        reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
        const top = new PIXI.Graphics();
        top.beginFill(0, 1);
        top.drawRect(0, 0, app.screen.width, margin);
        const bottom = new PIXI.Graphics();
        bottom.beginFill(0, 1);
        bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

        // Add play text
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
        });

        const playText = new PIXI.Text('Spin the wheels!', style);
        playText.x = Math.round((bottom.width - playText.width) / 2);
        playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
        bottom.addChild(playText);

        // Add header text
        const headerText = new PIXI.Text('PIXI MONSTER SLOTS!', style);
        headerText.x = Math.round((top.width - headerText.width) / 2);
        headerText.y = Math.round((margin - headerText.height) / 2);
        top.addChild(headerText);

        app.stage.addChild(top);
        app.stage.addChild(bottom);

        // Set the interactivity.
        bottom.interactive = true;
        bottom.buttonMode = true;
        bottom.addListener('pointerdown', () => {
            startPlay();
        });

        let running = false;

        // Function to start playing.
        function startPlay() {
            if (running) return;
            running = true;

            for (let i = 0; i < reels.length; i++) {
                const r = reels[i];
                const extra = Math.floor(Math.random() * 3);
                const target = r.position + 10 + i * 5 + extra;
                const time = 2500 + i * 600 + extra * 600;
                tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
            }
        }

        // Reels done handler.
        function reelsComplete() {
            running = false;
        }

        // Listen for animate update.
        app.ticker.add((delta) => {
        // Update the slots.
            for (let i = 0; i < reels.length; i++) {
                const r = reels[i];
                // Update blur filter y amount based on speed.
                // This would be better if calculated with time in mind also. Now blur depends on frame rate.
                r.blur.blurY = (r.position - r.previousPosition) * 8;
                r.previousPosition = r.position;

                // Update symbol positions on reel.
                for (let j = 0; j < r.symbols.length; j++) {
                    const s = r.symbols[j];
                    const prevy = s.y;
                    s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                    if (s.y < 0 && prevy > SYMBOL_SIZE) {
                        // Detect going over and swap a texture.
                        // This should in proper product be determined from some logical reel.
                        s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                        s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                        s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                    }
                }
            }
        });
    }

    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening = [];
    function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };

        tweening.push(tween);
        return tween;
    }
    // Listen for animate update.
    app.ticker.add((delta) => {
        const now = Date.now();
        const remove = [];
        for (let i = 0; i < tweening.length; i++) {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });

    // Basic lerp funtion.
    function lerp(a1, a2, t) {
        return a1 * (1 - t) + a2 * t;
    }

    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount) {
        return (t) => (--t * t * ((amount + 1) * t + amount) + 1);
    }



}
