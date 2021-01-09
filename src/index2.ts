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
let ctnrLi = { init:'初期値' };
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
        let unitSpaceWidth = ctnrLi['aCharacterSprite'].width / (Object.keys(charIDList).length + 1);
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
                    characterArr[key2].y = ctnrLi['aCharacterSprite'].height - characterArr[key2].height;      
                    characterArr[key2].visible = false;

                    ctnrLi['aCharacterContainer'].addChild(characterArr[key2]);
                    ctnrLi[key2] = characterArr[key2]; 
                }
            }
            characterArr[key].visible = true;
        }

        //【回答欄】なし
        ctnrLi['answerListContainer'].visible = false;
        ctnrLi['okSp'].visible = false;
        ctnrLi['ngSp'].visible = false;
        ctnrLi['noneSp'].visible = true;

        //【次へボタン】非表示
        ctnrLi['aNextButtonSprite'].zIndex = -1;

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
    ctnrLi['aMessageText'].text = getCSVCellData(currentStep+1,3).replace(/"/g, '');
    
    //【キャラクタ】感情付きの画像があれば表示 
    if (getCSVCellData(currentStep+1,6) === "") {
        //次へボタンを表示
        ctnrLi['aNextButtonSprite'].zIndex = 10;
        ctnrLi['aNextButtonSprite'].visible = true;

        ctnrLi['answerListContainer'].visible = false;
        ctnrLi['okSp'].visible = false;
        ctnrLi['ngSp'].visible = false;
        ctnrLi['noneSp'].visible = true;
    } else {
        //【次へボタン】非表示
        ctnrLi['aNextButtonSprite'].visible = false;
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
        ctnrLi['answerListContainer'].visible = true;
        ctnrLi['okSp'].visible = false;
        ctnrLi['ngSp'].visible = false;
        ctnrLi['noneSp'].visible = false;
        
        //選択肢スプライトにテキスト入力
        //全ての選択肢スプライトのイベントを削除→NGをセット 
        ctnrLi['ans1Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans1Sp'].on('pointertap',anserNG);
        ctnrLi['ans2Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans2Sp'].on('pointertap',anserNG); 
        ctnrLi['ans3Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans3Sp'].on('pointertap',anserNG); 
        ctnrLi['ans4Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans4Sp'].on('pointertap',anserNG); 
        ctnrLi['ans5Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans5Sp'].on('pointertap',anserNG); 
        ctnrLi['ans6Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
        ctnrLi['ans6Sp'].on('pointertap',anserNG);   

        clearAnswerList();
        
        //正解の選択肢スプライトにOKイベントをセット
        for (let i=0; i<answerList.length; i++) {
            ctnrLi['ans' + String(i+1)+ 'TextSp'].text = answerList[i][2];
            if(answerList[i][1] === 'ok'){
                ctnrLi['ans' + String(i+1)+ 'Sp'].off('pointertap'); //第2引数にメソッド名を指定すれば個別削除可能 
                ctnrLi['ans' + String(i+1)+ 'Sp'].on('pointertap',anserOK);  
            }
        }
    }
    //吹き出しの位置を語り手の頭上へ表示
    ctnrLi['aCommentEdgeSprite'].x = characterArr[charImgList[getCSVCellData(currentStep+1,2)]].x -10;

    //キャラ画像を感情IDに従って変更
    setVisibleImg(charImgList[getCharImgFileName( getCSVCellData(currentStep+1,2).replace(/"/g, ''),getCSVCellData(currentStep+1,5).replace(/"/g, ''))]);
    
    currentStep ++;
}

function anserOK(){ 
    //ボタン制御
    ctnrLi['answerListContainer'].visible = false;
    ctnrLi['okSp'].visible = true;
    ctnrLi['ngSp'].visible = false;
    ctnrLi['noneSp'].visible = false;
    
    //スコア加算
    currentScore = currentScore + 10;
    setScore();
}

function anserNG(){ 
    //ボタン制御
    ctnrLi['answerListContainer'].visible = false;
    ctnrLi['okSp'].visible = false;
    ctnrLi['ngSp'].visible = true;
    ctnrLi['noneSp'].visible = false;
}

function tapOK(){ 
    readStep();
}

function tapNG(){ 
    ctnrLi['answerListContainer'].visible = true;
    ctnrLi['okSp'].visible = false;
    ctnrLi['ngSp'].visible = false;
    ctnrLi['noneSp'].visible = false;
}

function tapNext(){ 
    readStep();
}

function setScore(){
    ctnrLi['aScoreText'].text = 'スコア' + currentScore + '点';
}

function clearAnswerList(){
    ctnrLi['ans1TextSp'].text = '①';
    ctnrLi['ans2TextSp'].text = '②';
    ctnrLi['ans3TextSp'].text = '③';
    ctnrLi['ans4TextSp'].text = '④';
    ctnrLi['ans5TextSp'].text = '⑤';
    ctnrLi['ans6TextSp'].text = '⑥';
}

function getCharImgFileName (charactorID, emotionID){
    if (emotionID === ''){
        return charactorID;
    }else{
        return charactorID + '-' + emotionID;
    }
}

function initSprite (contName:string, imgFilePath:string
    , anchorX:number, anchorY:number, x:number, y:number) {
        ctnrLi[contName] 
        = new PIXI.Sprite(PIXI.Texture.from(imgFilePath)); 
        ctnrLi[contName].anchor.x = anchorX;
        ctnrLi[contName].anchor.y = anchorY;
        ctnrLi[contName].x = x;
        ctnrLi[contName].y = y;
}

function initBtn (contName:string, imgFilePath:string
    , x:number, y:number) {
        ctnrLi[contName] 
        = new PIXI.Sprite(PIXI.Texture.from(imgFilePath)); 
        ctnrLi[contName].x = x;
        ctnrLi[contName].y = y;
        ctnrLi[contName].interactive = true;
        ctnrLi[contName].buttonMode = true;
}

function initTxt (contenerName:string,　text:string, fontSize:number, x:number, y:number){
    ctnrLi[contenerName] =  new PIXI.Text(text, 
        { 
            //   fontFamily: 'Arial',   // フォント
            fontSize: fontSize,
            fill : 0x000000,       // 文字色
            //   stroke: 0x000000,      // アウトラインの色
            //   strokeThickness: 3,    // アウトラインの太さ   
            //   align: 'center',       // 文字揃え(複数行の場合に有効)     
        });
    ctnrLi[contenerName].x = x;
    ctnrLi[contenerName].y = y;
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
        .add('/assets/キャラクタエリア.png')
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
            initSprite('aScoreSprite' ,'/assets/0score.png', 0,0,0,0);
            app.stage.addChild(ctnrLi['aScoreSprite']);
            initTxt('aScoreText','0点',40,10,5);
            app.stage.addChild(ctnrLi['aScoreText']);
            
            //会話(aMessage)
            initSprite('aMessageSprite','/assets/メッセージ.png',0,0,0,50);   
            app.stage.addChild(ctnrLi['aMessageSprite']);
            initTxt('aMessageText','100点',40,30,70);
            app.stage.addChild(ctnrLi['aMessageText']);

            //キャラクタ(aCharacter)
            ctnrLi['aCharacterContainer']  = new PIXI.Container();
            ctnrLi['aCharacterContainer'] .x = 0;       
            ctnrLi['aCharacterContainer'] .y = 200;
            app.stage.addChild(ctnrLi['aCharacterContainer'] );

            initSprite('aCharacterSprite','/assets/キャラクタエリア.png',0,0,0,0);         
            ctnrLi['aCharacterContainer'] .addChild(ctnrLi['aCharacterSprite']);

            initSprite('aCommentEdgeSprite','/assets/吹き出しの先.png',0,0,100,0);         
            ctnrLi['aCharacterContainer'] .addChild(ctnrLi['aCommentEdgeSprite']);
        
            
            //回答欄(aAnswer)
            initSprite('aAnswerSprite','/assets/回答欄.png',0,0,0,350);  
            app.stage.addChild(ctnrLi['aAnswerSprite']);

            let answerContainer = new PIXI.Container();
            ctnrLi['answerListContainer'] = new PIXI.Container();
            
            initSprite('noneSp','/assets/NONE.png',0,0,0,0);
            initSprite('ansBack','/assets/ANS-Back.png',0,0,0,0);
            
            initBtn('ans1Sp','/assets/ANS.png',10,10);
            initBtn('ans2Sp','/assets/ANS.png',260,10);
            initBtn('ans3Sp','/assets/ANS.png',510,10);
            initBtn('ans4Sp','/assets/ANS.png',10,85);
            initBtn('ans5Sp','/assets/ANS.png',260,85);
            initBtn('ans6Sp','/assets/ANS.png',510,85);

            initBtn('okSp','/assets/OK.png',0,0);
            initBtn('ngSp','/assets/NG.png',0,0);

            ctnrLi['okSp'].on('pointertap',tapOK); 
            ctnrLi['ngSp'].on('pointertap',tapNG); 

            initTxt('ans1TextSp','①',20,ctnrLi['ans1Sp'].x + 5,ctnrLi['ans1Sp'].y + 10);
            initTxt('ans2TextSp','②',20,ctnrLi['ans2Sp'].x + 5,ctnrLi['ans2Sp'].y + 10);
            initTxt('ans3TextSp','③',20,ctnrLi['ans3Sp'].x + 5,ctnrLi['ans3Sp'].y + 10);
            initTxt('ans4TextSp','④',20,ctnrLi['ans4Sp'].x + 5,ctnrLi['ans4Sp'].y + 10);
            initTxt('ans5TextSp','④',20,ctnrLi['ans5Sp'].x + 5,ctnrLi['ans5Sp'].y + 10);
            initTxt('ans6TextSp','⑥',20,ctnrLi['ans6Sp'].x + 5,ctnrLi['ans6Sp'].y + 10);
            
            ctnrLi['answerListContainer'].addChild(ctnrLi['ansBack']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans1Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans1TextSp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans2Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans2TextSp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans3Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans3TextSp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans4Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans4TextSp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans5Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans5TextSp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans6Sp']);
            ctnrLi['answerListContainer'].addChild(ctnrLi['ans6TextSp']);
            answerContainer.addChild(ctnrLi['answerListContainer']);
            answerContainer.addChild(ctnrLi['okSp']);
            answerContainer.addChild(ctnrLi['ngSp']);
            answerContainer.addChild(ctnrLi['noneSp']);
            
            answerContainer.x = 0;       
            answerContainer.y = 350;  
            app.stage.addChild(answerContainer);
            
            //次へボタン(aAnswer)
            initBtn('aNextButtonSprite','/assets/次へボタン.png',670,160);
            ctnrLi['aNextButtonSprite'].on('pointertap',tapNext);    
            app.stage.addChild(ctnrLi['aNextButtonSprite'] );

        }catch (error) {
            alert("エラーが出たぜ　" + error);
        }

        initScenario();
        readStep();
    }
}
