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

function getCSVCellData(rowIndex:number, columnIndex:number){
    return rsGetCSV.split("\n")[rowIndex].split(',')[columnIndex]; 
}

let currentStep = 0;
let currentScore = 0;
let contenarList = { init:'初期値' };
let charImgList = {};
let charIDList = {};
let characterArr = {};

getCSV('/scenario.csv');

function convertCSVtoArray2(str:string){ // 読み込んだCSVデータが文字列として渡される
    //alert("convertCSVtoArray2開始");
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
 
    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for(var i=0;i<tmp.length;++i){
        result[i] = tmp[i].split(',');
    }
 
    //alert("これからCSVの2行目3列目(=[1][2])の値を出力");
    //alert(result[1][2]); // 300yen
    //return result[1][2]
}

function setVisibleImg(targetImgName){
    for(let key in charImgList){
        if(key.indexOf(targetImgName.split('-')[0]) === 0){
            if(key === targetImgName){
                //感情ID付きの画像IDから、画像IDを特定し
                characterArr[key].visible = true;
            } else {
                characterArr[key].visible = false;
            }
        } 
    } 
}

function initScenario(){ 
    //alert("initScenario開始");
    //csvの指定行を読み込む
    try{
        //let stepData = rsGetCSV.split("\n")[currentStep+1].split(',');

        //シナリオ,ステップ,キャラID,フレーズ日本語,フレーズ英語,反応,正解,選択肢
        //1,1,A,"今日はいい天気だね","It's nice weather!","good",,,

        //各スプライトの処理
        //スコア→0点を表示
        setScore();
        //メッセージ→なし
        //キャラクタ→csv全体でどんなキャラがいるかを確認
        
        //alert("キャラ画像の配置開始");
        //キャラ画像を配置する
        let unitSpaceWidth = contenarList['aCharacterSprite'].width / (Object.keys(charIDList).length + 1);
        unitSpaceWidth = parseInt(String(unitSpaceWidth));

        let currentX = 0;
        

        for(let key in charIDList){
            //alert("キャラ配置ループ開始");
            //alert("charIDList　　" + charIDList[key]);
            currentX++;
            for(let key2 in charImgList){
                if(key2.indexOf(key) === 0){
                    //画像を設定する
                    //alert("/assets/char/' +charImgList[key2]　　" + '/assets/char/' +charImgList[key2]);
                    let aMessage = PIXI.Texture.from('/assets/char/' +key2+ '.png');
                    characterArr[key2] = new PIXI.Sprite(aMessage);    
                    characterArr[key2].x = unitSpaceWidth * currentX-parseInt(String(characterArr[key2].width / 2));       
                    characterArr[key2].y = contenarList['aCharacterSprite'].height - characterArr[key2].height;      
                    characterArr[key2].visible = false;

                    contenarList['aCharacterContainer'].addChild(characterArr[key2]);
                    contenarList[key2] = characterArr[key2]; 
                }
            }
            characterArr[key].visible = true;
        }

    }catch (error) {
        alert("エラーが出たぜ　" + error);
    }



    //コンテナを呼ぶ
     //aCharacterContainer['aCharacterContainer'] = aCharacterContainer;

    //コンテナに画像を配置
    //コンテナに吹き出しを配置

    
    //回答欄→なし
    contenarList['answerListContainer'].visible = false;
    contenarList['okSp'].visible = false;
    contenarList['ngSp'].visible = false;
    contenarList['noneSp'].visible = true;
    //次へボタン→非表示
    contenarList['aNextButtonSprite'].zIndex = -1;

    //alert("initScenario終了");
}

function readStep(){ 
    //alert("readStep開始");
    //シナリオ,ステップ,キャラID,フレーズ日本語,フレーズ英語,反応,正解,選択肢
    //1,1,A,"今日はいい天気だね","It's nice weather!","good",,,

    //各スプライトの処理
        //スコア→変化なし
        //メッセージ→csvから読み取り
        contenarList['aMessageText'].text = getCSVCellData(currentStep+1,3).replace(/"/g, '');
        //todo キャラクタ→感情付きの画像があれば表示 後で対応
        if (getCSVCellData(currentStep+1,6) === "") {
            //次へボタンを表示
            contenarList['aNextButtonSprite'].zIndex = 10;
            contenarList['aNextButtonSprite'].visible = true;

            contenarList['answerListContainer'].visible = false;
            contenarList['okSp'].visible = false;
            contenarList['ngSp'].visible = false;
            contenarList['noneSp'].visible = true;
        } else {
            //次へボタンを非表示
            contenarList['aNextButtonSprite'].visible = false;
            //todo回答欄→csvから読み取り→回答をランダムに配置して、各イベントを紐付け
            let answerList = [];
            let okList = getCSVCellData(currentStep+1,6).replace(/"/g, '').split('/');
            let ngList = getCSVCellData(currentStep+1,7).replace(/"/g, '').split('/')
            for (let i=0; i<okList.length; i++) {
                answerList.push([Math.random(), 'ok', okList[i]]);
            }
            for (let i=0; i<ngList.length; i++) {
                answerList.push([Math.random(), 'ng', ngList[i]]);
            }
            answerList.sort(function(a,b){return(a[0] - b[0]);});
            



            //回答コンテナをActiveに
            contenarList['answerListContainer'].visible = true;
            contenarList['okSp'].visible = false;
            contenarList['ngSp'].visible = false;
            contenarList['noneSp'].visible = false;
            //選択肢スプライトにテキスト入力
            //全ての選択肢スプライトのイベントを削除→NGをセット 
            contenarList['ans1Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans1Sp'].on('pointertap',anserNG);
            contenarList['ans2Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans2Sp'].on('pointertap',anserNG); 
            contenarList['ans3Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans3Sp'].on('pointertap',anserNG); 
            contenarList['ans4Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans4Sp'].on('pointertap',anserNG); 
            contenarList['ans5Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans5Sp'].on('pointertap',anserNG); 
            contenarList['ans6Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
            contenarList['ans6Sp'].on('pointertap',anserNG);   

            clearAnswerList();
            
            //正解の選択肢スプライトにOKイベントをセット
            for (let i=0; i<answerList.length; i++) {
                contenarList['ans' + String(i+1)+ 'TextSp'].text = answerList[i][2];
                if(answerList[i][1] === 'ok'){
                    contenarList['ans' + String(i+1)+ 'Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
                    contenarList['ans' + String(i+1)+ 'Sp'].on('pointertap',anserOK);  
                }
            }
        }
        //吹き出しの位置を語り手の頭上へ表示
        contenarList['aCommentEdgeSprite'].x = characterArr[charImgList[getCSVCellData(currentStep+1,2)]].x -10;

        //キャラ画像を感情IDに従って変更
        setVisibleImg(charImgList[getCharImgFileName( getCSVCellData(currentStep+1,2).replace(/"/g, ''),getCSVCellData(currentStep+1,5).replace(/"/g, ''))]);
        
        
        currentStep ++;
    //alert("readStep終了");
    
    console.log(charIDList); 
    console.log(charImgList);
    console.log(characterArr);
}

function anserOK(){ 
    //alert("anserOK開始");
    //OKエフェクト。コメント欄に表示→少し経ったら消える
    contenarList['answerListContainer'].visible = false;
    contenarList['okSp'].visible = true;
    contenarList['ngSp'].visible = false;
    contenarList['noneSp'].visible = false;
    //スコア加算
    currentScore = currentScore + 10;
    setScore();

    //csvの指定行を読み込む
    //各スプライトの処理
    //スコア→なし
    //メッセージ→csvから読み取り
    //キャラクタ→csvから読み取り→画像表から任意の画像を読み込み
    //回答欄→csvから読み取り
    //次へボタン→回答がアクティブな場合は非表示。
    //alert("anserOK終了");
}

function anserNG(){ 
    //alert("anserNG開始");
    contenarList['answerListContainer'].visible = false;
    contenarList['okSp'].visible = false;
    contenarList['ngSp'].visible = true;
    contenarList['noneSp'].visible = false;
    //alert("anserNG終了");
}

function tapOK(){ 
    //alert("tapOK開始");
    readStep();
}

function tapNG(){ 
    //alert("tapNG開始");
    contenarList['answerListContainer'].visible = true;
    contenarList['okSp'].visible = false;
    contenarList['ngSp'].visible = false;
    contenarList['noneSp'].visible = false;
    //alert("tapNG終了");
}

function setScore(){
        contenarList['aScoreText'].text = 'スコア' + currentScore + '点';
}

function clearAnswerList(){
        contenarList['ans1TextSp'].text = '①';
        contenarList['ans2TextSp'].text = '②';
        contenarList['ans3TextSp'].text = '③';
        contenarList['ans4TextSp'].text = '④';
        contenarList['ans5TextSp'].text = '⑤';
        contenarList['ans6TextSp'].text = '⑥';
}

function getCharImgFileName (charactorID,emotionID){
    if (emotionID === ''){
        return charactorID;

    }else{
        return charactorID + '-' + emotionID;
    }
}





document.addEventListener("DOMContentLoaded", function() {
    alert("DOMContentLoaded開始");
    //このイベントを追加することでonloadの前にリソース読み取りが完了する
    let abc = 'テスト';
});

window.onload = () => {
    //alert("window.onload開始");

    //★PIXIのインスタンス化→viewをHTMLのBodyタグ内に追加　
	// width: 600,     // スクリーン(ビュー)横幅 
    //height: 600,    // スクリーン(ビュー)縦幅  
    const app = new PIXI.Application({ backgroundColor: 0xffffff ,width: 750,height: 500});
    document.body.appendChild(app.view);

    
    //キャラクタ→csv全体でどんなキャラがいるかを確認
    let tmp = rsGetCSV.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
    for(let i=1;i<tmp.length;++i){
        let charactorID = tmp[i].split(',')[2].replace(/"/g, '');
        let emotionID = tmp[i].split(',')[5].replace(/"/g, '');
        let charImgFileName = getCharImgFileName(charactorID,emotionID)
        if(! charImgList[charactorID]){
            charIDList[charactorID] = charactorID;
            charImgList[charactorID] = charactorID;
            app.loader.add('/assets/char/' + charactorID + '.png');
        }
        if(! charImgList[charImgFileName]){
            charImgList[charImgFileName] = charImgFileName;
            app.loader.add('/assets/char/' + charImgFileName + '.png');
        }
    }


    //★画像データの読み込み ここで画像を読み込むとメイン処理で画像の大きさを取得できる
    app.loader
        .add('/assets/0score.png')
        .add('/assets/メッセージ.png')
        .add('/assets/キャラクタ.png')
        .add('/assets/回答欄.png')
        .add('/assets/次へボタン.png')
        .add('/assets/サンプル.png')
        .add('/assets/吹き出しの先.png')

        .add('/assets/OK.png')
        .add('/assets/NG.png')
        .add('/assets/NONE.png')
        .add('/assets/ANS.png')
        .add('/assets/ANS-Back.png')

        .load(onAssetsLoaded2);
    

    //alert("テストおぉぉぉぉぉぉぉ→この処理はload(onAssetsLoaded2)より早く実行される");



    //★読み込んだ画像データをテクスチャ(アプリ上でインスタンス化)に登録
    // onAssetsLoaded handler builds the example.
    function onAssetsLoaded2() {

       try {
            
    
        //alert('start -onAssetsLoaded2');
        
        //・スコア(aScore)
        let aScore = PIXI.Texture.from('/assets/0score.png');
        contenarList['aScoreSprite'] = new PIXI.Sprite(aScore);    
        contenarList['aScoreSprite'].anchor.x = 0;
        contenarList['aScoreSprite'].anchor.y = 0;
        contenarList['aScoreSprite'].x = 0;       
        contenarList['aScoreSprite'].y = 0;      
        app.stage.addChild(contenarList['aScoreSprite']);
       
        contenarList['aScoreText'] =  new PIXI.Text('0点', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 40,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });

        contenarList['aScoreText'].x = 10;
        contenarList['aScoreText'].y = 5;
        app.stage.addChild(contenarList['aScoreText']);
        

        //会話(aMessage)
        let aMessage = PIXI.Texture.from('/assets/メッセージ.png');
        contenarList['aMessageSprite'] = new PIXI.Sprite(aMessage);    
        contenarList['aMessageSprite'].anchor.x = 0;
        contenarList['aMessageSprite'].anchor.y = 0;
        contenarList['aMessageSprite'].x = 0;       
        contenarList['aMessageSprite'].y = 50;      
        app.stage.addChild(contenarList['aMessageSprite']);

        contenarList['aMessageText'] =  new PIXI.Text('100点', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 40,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });

        contenarList['aMessageText'].x = 30;
        contenarList['aMessageText'].y = 70;
        app.stage.addChild(contenarList['aMessageText']);

        //キャラクタ(aCharacter)
        contenarList['aCharacterContainer']  = new PIXI.Container();
        contenarList['aCharacterContainer'] .x = 0;       
        contenarList['aCharacterContainer'] .y = 200;
        app.stage.addChild(contenarList['aCharacterContainer'] );

        let aCharacter = PIXI.Texture.from('/assets/キャラクタ.png');
        contenarList['aCharacterSprite'] = new PIXI.Sprite(aCharacter);        
        contenarList['aCharacterContainer'] .addChild(contenarList['aCharacterSprite']);

        let aCommentEdge = PIXI.Texture.from('/assets/吹き出しの先.png');
        contenarList['aCommentEdgeSprite'] = new PIXI.Sprite(aCommentEdge);  
        contenarList['aCommentEdgeSprite'].x = 100
        contenarList['aCommentEdgeSprite'].y = 0
        contenarList['aCharacterContainer'] .addChild(contenarList['aCommentEdgeSprite']);
     


        //回答欄(aAnswer)
        let aAnswer = PIXI.Texture.from('/assets/回答欄.png');
        contenarList['aAnswerSprite'] = new PIXI.Sprite(aAnswer);    
        contenarList['aAnswerSprite'].anchor.x = 0;
        contenarList['aAnswerSprite'].anchor.y = 0;
        contenarList['aAnswerSprite'].x = 0;       
        contenarList['aAnswerSprite'].y = 350;      
        app.stage.addChild(contenarList['aAnswerSprite']);


        let answerContainer = new PIXI.Container();
        contenarList['answerListContainer'] = new PIXI.Container();
        contenarList['okSp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/OK.png'));  
        contenarList['ngSp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/NG.png')); 
        contenarList['noneSp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/NONE.png')); 
        contenarList['ansBack'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS-Back.png'));  
        contenarList['ans1Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png'));   
        contenarList['ans2Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png')); 
        contenarList['ans3Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png')); 
        contenarList['ans4Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png')); 
        contenarList['ans5Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png')); 
        contenarList['ans6Sp'] = new PIXI.Sprite(PIXI.Texture.from('/assets/ANS.png')); 
        

        contenarList['ans1Sp'].x = 10;       
        contenarList['ans1Sp'].y = 10;
        contenarList['ans1Sp'].interactive = true;
        contenarList['ans1Sp'].buttonMode = true;
        contenarList['ans2Sp'].x = 260;       
        contenarList['ans2Sp'].y = 10;
        contenarList['ans2Sp'].interactive = true;
        contenarList['ans2Sp'].buttonMode = true;
        contenarList['ans3Sp'].x = 510;       
        contenarList['ans3Sp'].y = 10;
        contenarList['ans3Sp'].interactive = true;
        contenarList['ans3Sp'].buttonMode = true;
        contenarList['ans4Sp'].x = 10;       
        contenarList['ans4Sp'].y = 85;
        contenarList['ans4Sp'].interactive = true;
        contenarList['ans4Sp'].buttonMode = true;
        contenarList['ans5Sp'].x = 260;       
        contenarList['ans5Sp'].y = 85;
        contenarList['ans5Sp'].interactive = true;
        contenarList['ans5Sp'].buttonMode = true;
        contenarList['ans6Sp'].x = 510;       
        contenarList['ans6Sp'].y = 85;
        contenarList['ans6Sp'].interactive = true;
        contenarList['ans6Sp'].buttonMode = true;

        contenarList['okSp'].interactive = true;
        contenarList['okSp'].buttonMode = true;
        contenarList['ngSp'].interactive = true;
        contenarList['ngSp'].buttonMode = true;

        contenarList['okSp'].on('pointertap',tapOK); 
        contenarList['ngSp'].on('pointertap',tapNG); 

        contenarList['ans1TextSp'] =  new PIXI.Text('①', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans1TextSp'].x = contenarList['ans1Sp'].x + 5;
        contenarList['ans1TextSp'].y = contenarList['ans1Sp'].y + 10;

        contenarList['ans2TextSp'] =  new PIXI.Text('②', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans2TextSp'].x = contenarList['ans2Sp'].x + 5;
        contenarList['ans2TextSp'].y = contenarList['ans2Sp'].y + 10;

        contenarList['ans3TextSp'] =  new PIXI.Text('③', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans3TextSp'].x = contenarList['ans3Sp'].x + 5;
        contenarList['ans3TextSp'].y = contenarList['ans3Sp'].y + 10;

        contenarList['ans4TextSp'] =  new PIXI.Text('④', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans4TextSp'].x = contenarList['ans4Sp'].x + 5;
        contenarList['ans4TextSp'].y = contenarList['ans4Sp'].y + 10;

        contenarList['ans5TextSp'] =  new PIXI.Text('⑤', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans5TextSp'].x = contenarList['ans5Sp'].x + 5;
        contenarList['ans5TextSp'].y = contenarList['ans5Sp'].y + 10;

        contenarList['ans6TextSp'] =  new PIXI.Text('⑥', 
                { 
                //   fontFamily: 'Arial',   // フォント
                  fontSize: 20,
                  fill : 0x000000,       // 文字色
                //   stroke: 0x000000,      // アウトラインの色
                //   strokeThickness: 3,    // アウトラインの太さ   
                //   align: 'center',       // 文字揃え(複数行の場合に有効)     
                });
        contenarList['ans6TextSp'].x = contenarList['ans6Sp'].x + 5;
        contenarList['ans6TextSp'].y = contenarList['ans6Sp'].y + 10;
        


        contenarList['answerListContainer'].addChild(contenarList['ansBack']);
        contenarList['answerListContainer'].addChild(contenarList['ans1Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans1TextSp']);
        contenarList['answerListContainer'].addChild(contenarList['ans2Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans2TextSp']);
        contenarList['answerListContainer'].addChild(contenarList['ans3Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans3TextSp']);
        contenarList['answerListContainer'].addChild(contenarList['ans4Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans4TextSp']);
        contenarList['answerListContainer'].addChild(contenarList['ans5Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans5TextSp']);
        contenarList['answerListContainer'].addChild(contenarList['ans6Sp']);
        contenarList['answerListContainer'].addChild(contenarList['ans6TextSp']);
        answerContainer.addChild(contenarList['answerListContainer']);
        answerContainer.addChild(contenarList['okSp']);
        answerContainer.addChild(contenarList['ngSp']);
        answerContainer.addChild(contenarList['noneSp']);
        
        answerContainer.x = 0;       
        answerContainer.y = 350;  
        app.stage.addChild(answerContainer);
        
        //次へボタン(aAnswer)
        let aNextButton = PIXI.Texture.from('/assets/次へボタン.png');
        contenarList['aNextButtonSprite']  = new PIXI.Sprite(aNextButton);    
        contenarList['aNextButtonSprite'] .anchor.x = 0;
        contenarList['aNextButtonSprite'] .anchor.y = 0;
        contenarList['aNextButtonSprite'] .x = 670;       
        contenarList['aNextButtonSprite'] .y = 160;    
        app.stage.addChild(contenarList['aNextButtonSprite'] );









        let sampleContainer = new PIXI.Container();
        let a1 = new PIXI.Sprite(PIXI.Texture.from('/assets/次へボタン.png'));  
        let a2 = new PIXI.Sprite(PIXI.Texture.from('/assets/次へボタン2.png'));    
        sampleContainer.addChild(a1);
        sampleContainer.addChild(a2);
        app.stage.addChild(sampleContainer);
        sampleContainer.x = 600
        sampleContainer.y = 400

        sampleContainer.sortableChildren = true;
        // (どのオブジェクトもzIndexの初期値は0)
        //a1.zIndex = 10;
        sampleContainer.removeChildAt(sampleContainer.children.length-1);

        app.stage.sortableChildren = true;
        sampleContainer.zIndex = -1;


         }catch (error) {
        alert("エラーが出たぜ　" + error);
    }



        


           











        //クリックイベントの設定
        contenarList['aNextButtonSprite'].interactive = true;
        contenarList['aNextButtonSprite'].buttonMode = true;
        contenarList['aNextButtonSprite'].on('pointertap',showAlert);  
        contenarList['aNextButtonSprite'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        contenarList['aNextButtonSprite'].on('pointertap',showAlert2);  



        initScenario();
        readStep();


        function showAlert(e) {
            //console.log(e);
            alert('ぶたがクリック(タップ)されました!!');
            //aNextButtonSprite.visible = false;
        }

        function showAlert2(e) {
            readStep();
        }









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

}
