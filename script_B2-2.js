// --- 1. DOM要素の取得 ---
const startButton = document.getElementById('start-button');
const micButton = document.getElementById('mic-button');
const micText = document.getElementById('mic-text');
const messageDisplay = document.getElementById('message-display');
const recordingIndicator = document.getElementById('recording-indicator');

// --- 2. 実験シナリオの定義 ---
const audioFiles = {
    line1: 'audio/001_恐れ入ります。その….wav', // (セリフ1)
    line2_A1: 'audio/002_申し訳ございません….wav', // (セリフ2)
    line3: 'audio/syuuseizyozyo.wav' // ★★★ ご指定のファイルに変更 ★★★
};

// ★シナリオのステップを5段階に変更 (A1のみ)
const scenarios_exp1 = {
    'A1': [
        { type: 'agent', message: '（エージェントが話しています - セリフ1）', audio: audioFiles.line1 },
        { type: 'user', message: '（融通が利かないな、お前じゃ話にならん！）をどうぞ' },
        { type: 'agent', message: '（エージェントが話しています - セリフ2）', audio: audioFiles.line2_A1 },
        { type: 'user', message: '（まだ終わらないのか！ぐずぐずするな！）をどうぞ' }, 
        { type: 'agent', message: '（エージェントが話しています - セリフ3）', audio: audioFiles.line3 }, // ★変更後のファイルが再生される
        { type: 'end', message: '対話終了です。' }
    ]
    // (A2, A3の定義を削除)
};

let currentScenario;
let scenarioStep = 0;
let isUserTurn = false;
let isRecording = false;

// --- 3. イベントリスナーの設定 ---

// 開始ボタン
startButton.addEventListener('click', () => {
    startExperiment();
});

// ページ全体でキーが押された時の処理
window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && isUserTurn && !isRecording) {
        event.preventDefault();
        isRecording = true;
        
        messageDisplay.textContent = '録音中... (Enterを離して終了)';
        micButton.style.backgroundColor = '#0056b3';
        micText.textContent = '録音中...';
        
        // 赤い丸を表示
        recordingIndicator.classList.remove('hidden');
    }
});

// ページ全体でキーが離された時の処理
window.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && isRecording) {
        isRecording = false;
        isUserTurn = false;
        
        micButton.style.backgroundColor = '#007bff';
        micText.textContent = '待機中 (Enter)';
        
        // 赤い丸を非表示
        recordingIndicator.classList.add('hidden');

        console.log('Enter解放。即座に次のステップへ。');
        scenarioStep++;
        runScenario(); 
    }
});


// --- 4. 実験進行ロジック ---

// このファイルは A1 専用
function startExperiment() {
    // 開始ボタンを非表示にする
    startButton.classList.add('hidden');

    // 条件 'A1' を直接指定
    const assignedCondition = 'A1'; 
    
    console.log('選択された条件で実験を開始:', assignedCondition);

    // 指定された条件のシナリオを設定
    currentScenario = scenarios_exp1[assignedCondition];
    scenarioStep = 0;

    // シナリオ開始
    runScenario();
}


// シナリオを1ステップ進める関数
function runScenario() {
    // ★★★★★ 修正箇所 ★★★★★
    // 誤: if (scenarioStep >= scenario.length) {
    // 正: if (scenarioStep >= currentScenario.length) {
    if (scenarioStep >= currentScenario.length) { 
        console.log('シナリオ終了');
        return;
    }

    const step = currentScenario[scenarioStep];

    if (step.type === 'agent') {
        isUserTurn = false;
        messageDisplay.textContent = step.message; 
        micButton.style.display = 'none'; 
        
        // 単純な playAudio 関数を使用
        playAudio(step.audio, () => {
            scenarioStep++;
            runScenario();
        });

    } else if (step.type === 'user') {
        isUserTurn = true; 
        isRecording = false;
        
        messageDisplay.textContent = step.message + " (Enterキーを押しながら話してください)"; 
        
        micButton.style.display = 'inline-block';
        micButton.disabled = true;
        micButton.style.backgroundColor = '#007bff';
        micText.textContent = '待機中 (Enter)'; 
        
    } else if (step.type === 'end') {
        isUserTurn = false;
        messageDisplay.textContent = step.message;
        micButton.style.display = 'none';
        recordingIndicator.classList.add('hidden');
    }
}

// 音声ファイルを再生する関数 (Web Audio API を使わない単純な再生)
function playAudio(src, callback) {
    const audio = new Audio(src);
    audio.onended = () => {
        if (callback) {
            callback();
        }
    };
    // エラーハンドリング
    audio.onerror = (e) => {
        console.error('音声ファイルの再生エラー:', src, e);
        messageDisplay.textContent = `エラー: 音声ファイル(${src})が読み込めません。`;
    };
    audio.play();

}
