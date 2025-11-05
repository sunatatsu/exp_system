// --- 1. DOM要素の取得 ---
const startButton = document.getElementById('start-button');
const micButton = document.getElementById('mic-button');
const micText = document.getElementById('mic-text');
const messageDisplay = document.getElementById('message-display');
const recordingIndicator = document.getElementById('recording-indicator');

// --- 2. 実験シナリオの定義 ---
const audioFiles = {
    // ★セリフ1をご指定のファイルに変更
    line1: 'audio/001_恐れ入ります。.wav', 
    
    // ★セリフ2をご指定のファイルに変更 (A1, A2, A3すべて)
    line2_A1: 'audio/002_四国めたん（ノーマル）_…お客様。そのよう….wav',
    line2_A2: 'audio/002_四国めたん（ノーマル）_…お客様。そのよう….wav',
    line2_A3: 'audio/002_四国めたん（ノーマル）_…お客様。そのよう….wav'
};

const scenarios_exp1 = {
    'A1': [
        { type: 'agent', message: '（エージェントが話しています - セリフ1）', audio: audioFiles.line1 },
        { type: 'user', message: '「ユーザのセリフ1」をどうぞ' },
        { type: 'agent', message: '（エージェントが話しています - セリフ2）', audio: audioFiles.line2_A1 },
        { type: 'end', message: '対話終了です。' }
    ],
    'A2': [
        { type: 'agent', message: '（エージェントが話しています - セリフ1）', audio: audioFiles.line1 },
        { type: 'user', message: '「ユーザのセリフ1」をどうぞ' },
        { type: 'agent', message: '（エージェントが話しています - セリフ2）', audio: audioFiles.line2_A2 },
        { type: 'end', message: '対話終了です。' }
    ],
    'A3': [
        { type: 'agent', message: '（エージェントが話しています - セリフ1）', audio: audioFiles.line1 },
        { type: 'user', message: '「ユーザのセリフ1」をどうぞ' },
        { type: 'agent', message: '（エージェントが話しています - セリフ2）', audio: audioFiles.line2_A3 },
        { type: 'end', message: '対話終了です。' }
    ]
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


// ... (script_A2.js の前半は同じ) ...
function startExperiment() {
    startButton.classList.add('hidden');
    // ★A2 をハードコーディング
    const assignedCondition = 'A2'; 
    console.log('選択された条件で実験を開始:', assignedCondition);
    currentScenario = scenarios_exp1[assignedCondition];
    scenarioStep = 0;
    runScenario();
}
// ... (残りのコードは同じ) ...


// シナリオを1ステップ進める関数
function runScenario() {
    if (scenarioStep >= currentScenario.length) {
        console.log('シナリオ終了');
        return;
    }

    const step = currentScenario[scenarioStep];

    if (step.type === 'agent') {
        isUserTurn = false;
        messageDisplay.textContent = step.message; 
        micButton.style.display = 'none'; 
        
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

// 音声ファイルを再生する関数
function playAudio(src, callback) {
    const audio = new Audio(src);
    audio.onended = () => {
        if (callback) {
            callback();
        }
    };
    // ★以前のバージョンにあったエラーハンドリングを念のため追加
    audio.onerror = (e) => {
        console.error('音声ファイルの再生エラー:', src, e);
        messageDisplay.textContent = `エラー: 音声ファイル(${src})が読み込めません。`;
        // エラーでも次に進む
        if (callback) {
            callback();
        }
    };
    audio.play();
}
