// --- 1. DOM要素の取得 ---
const startButton = document.getElementById('start-button');
const micButton = document.getElementById('mic-button');
const micText = document.getElementById('mic-text');
const messageDisplay = document.getElementById('message-display');
const recordingIndicator = document.getElementById('recording-indicator');

// --- 2. 実験シナリオの定義 (セリフ1用) ---
const line1AudioFile = 'audio/line1.mp3'; // セリフ1のファイル

// --- 3. Web Audio API (セリフ2) の準備 ---
let audioContext; // オーディオコンテキスト
let gainNodes = []; // 11個の音量ノード
let audioBuffers = []; // 11個の音声データ
let audioSources = []; // 11個の再生ソース
let isLoading = false;
let isLoaded = false;
const audioFileCount = 11; // ★ファイル数は11個

// ★ご指定の11個の音声ファイル名を定義 (.wav)
const audioFileNames = [
    'audio/cntnm20251030T1422170.wav',  // (インデックス 0 = シーケన్స్ 1)
    'audio/cntnm20251030T1422171.wav',  // (インデックス 1 = シーケన్స్ 2)
    'audio/cntnm20251030T1422172.wav',  // (インデックス 2 = シーケンス 3)
    'audio/cntnm20251030T1422173.wav',  // (インデックス 3 = シーケンス 4)
    'audio/cntnm20251030T1422174.wav',  // (インデックス 4 = シーケンス 5)
    'audio/cntnm20251030T1422175.wav',  // (インデックス 5 = シーケンス 6)
    'audio/cntnm20251030T1422176.wav',  // (インデックス 6 = シーケンス 7)
    'audio/cntnm20251030T1422177.wav',  // (インデックス 7 = シーケンス 8)
    'audio/cntnm20251030T1422178.wav',  // (インデックス 8 = シーケンス 9)
    'audio/cntnm20251030T1422179.wav',  // (インデックス 9 = シーケンス 10)
    'audio/cntnm20251030T14221710.wav' // (インデックス 10 = シーケンス 11)
];
// ★------------------------------------

// Web Audio API の初期化 (ユーザーの操作で開始する必要がある)
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNodes = []; // GainNodeの配列を初期化
        // 11個のGainNodeを作成し、すべてミュート(0)にしてスピーカーに接続
        for (let i = 0; i < audioFileCount; i++) {
            const gainNode = audioContext.createGain();
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.connect(audioContext.destination);
            gainNodes.push(gainNode);
        }
    }
}

// 11個の音声ファイルを非同期でロードする関数
async function loadAudioFiles() {
    if (isLoaded || isLoading) return; // 既にロード中またはロード済
    isLoading = true;
    console.log('グラデーション音声のロードを開始...');

    const promises = audioFileNames.map(async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    });

    try {
        audioBuffers = await Promise.all(promises);
        isLoaded = true;
        isLoading = false;
        console.log('グラデーション音声のロード完了。');
        messageDisplay.textContent = '準備完了。「開始」ボタンを押してください。';
    } catch (error) {
        console.error('音声ファイルのロード中にエラー:', error);
        isLoading = false;
    }
}

// --- 4. 従来の再生関数 (セリフ1用) ---
function playAudio(src, callback) {
    const audio = new Audio(src);
    audio.onended = () => {
        if (callback) {
            callback();
        }
    };
    audio.play();
}

// --- 5. グラデーション再生関数 (セリフ2用) ---
function playGradationSequence(sequence, interval, onEndCallback) {
    if (!isLoaded) {
        console.error('音声がロードされていません。');
        return;
    }

    // 11個の音源をすべて作成し、GainNodeに接続
    audioSources = [];
    audioBuffers.forEach((buffer, index) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(gainNodes[index]); // 対応するGainNodeに接続
        audioSources.push(source);
    });

    // 11個の音源を「同時」に再生開始
    const startTime = audioContext.currentTime;
    audioSources.forEach(source => source.start(startTime));

    let step = 0;

    // シーケンス実行関数
    function runStep() {
        if (step >= sequence.length) {
            // シーケンス終了
            audioSources.forEach(source => source.stop()); // 全音源を停止
            // 全Gainをミュートに戻す
            gainNodes.forEach(gn => gn.gain.setValueAtTime(0, audioContext.currentTime));
            
            if (onEndCallback) {
                onEndCallback(); // 次のシナリオステップへ
            }
            return;
        }

        const sequenceIndex = sequence[step]; // 例: 11
        const gainNodeIndex = sequenceIndex - 1; // 配列インデックス (0〜10)

        // すべての音量をミュートにする
        gainNodes.forEach((node, index) => {
            if (node.gain.value !== 0) {
                 node.gain.setValueAtTime(0, audioContext.currentTime);
            }
        });

        // 指定されたGainNodeだけ音量を1にする
        if (gainNodeIndex >= 0 && gainNodeIndex < gainNodes.length) {
            gainNodes[gainNodeIndex].gain.setValueAtTime(1, audioContext.currentTime);
        }

        step++;
        // 指定されたinterval(ms)後に次のステップを実行
        setTimeout(runStep, interval);
    }

    // 最初のステップを開始
    runStep();
}


// --- 6. 実験シナリオの定義 (A3) ---
// (★ここが A1 と異なる)
// (A3のシーケンスをここで定義)
const sequence_A3 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]; // ★A3のシーケンス
const sequence_interval_ms = 250; // ★切り替え間隔 (ミリ秒)

// シナリオのステップ定義
const scenario = [
    { 
        type: 'agent', 
        message: '（エージェントが話しています - セリフ1）', 
        play: (callback) => playAudio(line1AudioFile, callback) 
    },
    { 
        type: 'user', 
        message: '「ユーザのセリフ1」をどうぞ' 
    },
    { 
        type: 'agent', 
        message: '（エージェントが話しています - セリフ2）', 
        play: (callback) => playGradationSequence(sequence_A3, sequence_interval_ms, callback) // ★A3シーケンスを再生
    },
    { 
        type: 'end', 
        message: '対話終了です。' 
    }
];

// --- 7. 状態変数とイベントリスナー ---
let scenarioStep = 0;
let isUserTurn = false;
let isRecording = false;

// ★開始ボタン: AudioContextを初期化し、ファイルをロード
startButton.addEventListener('click', () => {
    messageDisplay.textContent = '音声ファイルをロード中...';
    startButton.disabled = true;
    initAudioContext(); // AudioContextを初期化
    loadAudioFiles().then(() => {
        // ロード完了後に実験開始の準備が整う
        startButton.classList.add('hidden');
        startExperiment(); // ロード完了後に実験開始
    });
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && isUserTurn && !isRecording) {
        event.preventDefault();
        isRecording = true;
        messageDisplay.textContent = '録音中... (Enterを離して終了)';
        micButton.style.backgroundColor = '#0056b3';
        micText.textContent = '録音中...';
        recordingIndicator.classList.remove('hidden');
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && isRecording) {
        isRecording = false;
        isUserTurn = false;
        micButton.style.backgroundColor = '#007bff';
        micText.textContent = '待機中 (Enter)';
        recordingIndicator.classList.add('hidden');
        console.log('Enter解放。即座に次のステップへ。');
        scenarioStep++;
        runScenario(); 
    }
});

// --- 8. 実験進行ロジック ---
function startExperiment() {
    // startButton.classList.add('hidden'); // (ロード完了後に隠されている)
    console.log('実験条件 A3 (徐々に変化) で実験を開始'); // ★A3
    scenarioStep = 0;
    runScenario();
}

function runScenario() {
    if (scenarioStep >= scenario.length) {
        console.log('シナリオ終了');
        return;
    }

    const step = scenario[scenarioStep];

    if (step.type === 'agent') {
        isUserTurn = false;
        messageDisplay.textContent = step.message; 
        micButton.style.display = 'none'; 
        
        // step.play には playAudio または playGradationSequence が入っている
        step.play(() => {
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
