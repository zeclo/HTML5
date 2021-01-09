import * as PIXI from 'pixi.js';


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

        //【回答欄】なし
        contenarList['answerListContainer'].visible = false;
        contenarList['okSp'].visible = false;
        contenarList['ngSp'].visible = false;
        contenarList['noneSp'].visible = true;

        //【次へボタン】非表示
        contenarList['aNextButtonSprite'].zIndex = -1;

    }catch (error) {
        alert("エラーが出たぜ　" + error);
    }
}

function readStep(){ 
    //alert("readStep開始");
    //シナリオ,ステップ,キャラID,フレーズ日本語,フレーズ英語,反応,正解,選択肢
    //1,1,A,"今日はいい天気だね","It's nice weather!","good",,,

    //各スプライトの処理

    //【スコア】変化なし
    //【メッセージ】csvから読み取り
    contenarList['aMessageText'].text = getCSVCellData(currentStep+1,3).replace(/"/g, '');
    
    //【キャラクタ】感情付きの画像があれば表示 
    if (getCSVCellData(currentStep+1,6) === "") {
        //次へボタンを表示
        contenarList['aNextButtonSprite'].zIndex = 10;
        contenarList['aNextButtonSprite'].visible = true;

        contenarList['answerListContainer'].visible = false;
        contenarList['okSp'].visible = false;
        contenarList['ngSp'].visible = false;
        contenarList['noneSp'].visible = true;
    } else {
        //【次へボタン】非表示
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
}

function anserOK(){ 
    //ボタン制御
    contenarList['answerListContainer'].visible = false;
    contenarList['okSp'].visible = true;
    contenarList['ngSp'].visible = false;
    contenarList['noneSp'].visible = false;
    
    //スコア加算
    currentScore = currentScore + 10;
    setScore();
}

function anserNG(){ 
    //ボタン制御
    contenarList['answerListContainer'].visible = false;
    contenarList['okSp'].visible = false;
    contenarList['ngSp'].visible = true;
    contenarList['noneSp'].visible = false;
}

function tapOK(){ 
    readStep();
}

function tapNG(){ 
    contenarList['answerListContainer'].visible = true;
    contenarList['okSp'].visible = false;
    contenarList['ngSp'].visible = false;
    contenarList['noneSp'].visible = false;
}

function tapNext(){ 
    readStep();
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

function getCharImgFileName (charactorID, emotionID){
    if (emotionID === ''){
        return charactorID;
    }else{
        return charactorID + '-' + emotionID;
    }
}

function initSprite (obj:PIXI.Sprite, anchorX:number, anchorY:number, x:number, y:number) {
    //次へボタン(aAnswer)
    obj.anchor.x = anchorX;
    obj.anchor.y = anchorY;
    obj.x = x;
    obj.y = y;
}

function initText (contenerName:string,　text:string, fontSize:number, x:number, y:number){
    contenarList[contenerName] =  new PIXI.Text(text, 
        { 
            //   fontFamily: 'Arial',   // フォント
            fontSize: fontSize,
            fill : 0x000000,       // 文字色
            //   stroke: 0x000000,      // アウトラインの色
            //   strokeThickness: 3,    // アウトラインの太さ   
            //   align: 'center',       // 文字揃え(複数行の場合に有効)     
        });
    contenarList[contenerName].x = x;
    contenarList[contenerName].y = y;
}

document.addEventListener("DOMContentLoaded", function() {
    //このイベントを追加することでonloadの前にリソース読み取りが完了する
    // 現在、以下アラートを除くと画像読取りが表示に間に合わなくなる
    alert("DOMContentLoaded開始");
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

    //★読み込んだ画像データをテクスチャ(アプリ上でインスタンス化)に登録
    // onAssetsLoaded handler builds the example.
    function onAssetsLoaded2() {
       try {
            //【スコア】(aScore)
            let aScore = PIXI.Texture.from('/assets/0score.png');
            contenarList['aScoreSprite'] = new PIXI.Sprite(aScore);   
            initSprite(contenarList['aScoreSprite'],0,0,0,0);
            app.stage.addChild(contenarList['aScoreSprite']);
        
            initText('aScoreText','0点',40,10,5);
            
            app.stage.addChild(contenarList['aScoreText']);
            

            //会話(aMessage)
            let aMessage = PIXI.Texture.from('/assets/メッセージ.png');
            contenarList['aMessageSprite'] = new PIXI.Sprite(aMessage);  
            initSprite(contenarList['aMessageSprite'],0,0,0,50);   
            app.stage.addChild(contenarList['aMessageSprite']);

            initText('aMessageText','100点',40,30,70);
            
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
            initSprite(contenarList['aAnswerSprite'],0,0,0,350);  
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

            initText('ans1TextSp','①',20,contenarList['ans1Sp'].x + 5,contenarList['ans1Sp'].y + 10);
            initText('ans2TextSp','②',20,contenarList['ans2Sp'].x + 5,contenarList['ans2Sp'].y + 10);
            initText('ans3TextSp','③',20,contenarList['ans3Sp'].x + 5,contenarList['ans3Sp'].y + 10);
            initText('ans4TextSp','④',20,contenarList['ans4Sp'].x + 5,contenarList['ans4Sp'].y + 10);
            initText('ans5TextSp','④',20,contenarList['ans5Sp'].x + 5,contenarList['ans5Sp'].y + 10);
            initText('ans6TextSp','⑥',20,contenarList['ans6Sp'].x + 5,contenarList['ans6Sp'].y + 10);
            
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
            initSprite(contenarList['aNextButtonSprite'],0,0,670,160);
            contenarList['aNextButtonSprite'].interactive = true;
            contenarList['aNextButtonSprite'].buttonMode = true;
            contenarList['aNextButtonSprite'].on('pointertap',tapNext);    
            app.stage.addChild(contenarList['aNextButtonSprite'] );

        }catch (error) {
            alert("エラーが出たぜ　" + error);
        }

        initScenario();
        readStep();
    }
}
