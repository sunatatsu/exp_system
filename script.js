// ... (script.js の前半は変更なし) ...

// --- 1. DOM要素の取得 ---
const startButton = document.getElementById('start-button');
const micButton = document.getElementById('mic-button');
const micText = document.getElementById('mic-text');
const messageDisplay = document.getElementById('message-display');
// ★追加4: 録音インジケーターの要素を取得
const recordingIndicator = document.getElementById('recording-indicator');


// --- 2. 実験シナリオの定義 ---
const audioFiles = {
    line1: 'audio/line1.mp3',
    // ... (ファイル名は音声ファイルの名前を隠すため、ここに表示しない)
    line2_A1: 'audio/line2_instant.mp3',
    line2_A2: 'audio/line2_constant.mp3',
    line2_A3: 'audio/line2_gradual.mp3'
};
// ★修正5: シナリオ定義から音声ファイル名を削除し、分かりやすいメッセージにする
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
        
        // ★追加6: 赤い丸を表示
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
        
        // ★追加7: 赤い丸を非表示
        recordingIndicator.classList.add('hidden');

        console.log('Enter解放。即座に次のステップへ。');
        scenarioStep++;
        runScenario(); 
    }
});


// --- 4. 実験進行ロジック ---

// 実験開始処理 (変更なし)
function startExperiment() {
    startButton.classList.add('hidden');
    const conditions = ['A1', 'A2', 'A3'];
    const assignedCondition = conditions[Math.floor(Math.random() * conditions.length)];
    console.log('割り当てられた条件:', assignedCondition);
    currentScenario = scenarios_exp1[assignedCondition];
    scenarioStep = 0;
    runScenario();
}

// シナリオを1ステップ進める関数 (変更なし)
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
        // ★追加8: 終了時も赤い丸を非表示にしておく
        recordingIndicator.classList.add('hidden');
    }
}

// 音声ファイルを再生する関数 (変更なし)
function playAudio(src, callback) {
    const audio = new Audio(src);
    audio.onended = () => {
        if (callback) {
            callback();
        }
    };
    audio.play();
}