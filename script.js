document.addEventListener("DOMContentLoaded", function() {
    // 時刻の更新
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2,'0');
        const minutes = now.getMinutes().toString().padStart(2,'0');
        const youbi = now.getDay();//曜日　Sunday - Saturday : 0 - 6
        document.getElementById("clock").innerHTML = `${hours}<span>:</span>${minutes}`;
    }
    // 定期的に時刻を更新
    setInterval(updateClock, 1000);



    // アラームの設定
    function setAlarm(alarmType, startTime) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 各アラームの音楽ファイルのパス
        const alarmPath = {
            "startAlarm": "path/to/start-alarm.mp3",
            "midAlarm": "path/to/mid-alarm.mp3",
            "endAlarm": "path/to/end-alarm.mp3",
            "finalAlarm": "path/to/final-alarm.mp3"
        };

        // アラームの再生
        const alarmTime = calculateAlarmTime(startTime, alarmType); // アラームを鳴らす時刻を計算
        scheduleAlarm(alarmTime, alarmPath[alarmType]); // アラームをセット
    }

    // アラームを鳴らす時刻を計算する関数
    function calculateAlarmTime(startTime, alarmType) {
        const timeMap = {
            "startAlarm": 0,
            "midAlarm": 50,
            "endAlarm": 80,
            "finalAlarm": 90
        };
        return startTime + timeMap[alarmType];
    }

    // アラームをセットする関数
    function scheduleAlarm(timeInMinutes, filePath) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const minutesUntilAlarm = timeInMinutes - ((currentHour * 60) + currentMinute); // アラームまでの残り時間（分）

        // 残り時間が負の場合は次の日の同時刻をセット
        const millisecondsUntilAlarm = minutesUntilAlarm <= 0 ? (24 * 60 * 60 * 1000) + (minutesUntilAlarm * 60 * 1000) : minutesUntilAlarm * 60 * 1000;

        setTimeout(() => {
            playAlarm(filePath); // アラームを再生
        }, millisecondsUntilAlarm);
    }

    // 定期的にアラームをチェック
    setInterval(function () {
        const now = new Date();
        // const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }); // 現在の曜日を取得
        const dayOfWeek = 'Wed';
        const alarmSettingsKey = `alarmSettings_${dayOfWeek}`; // 曜日に対応するlocalStorageのキー
        const savedSettings = localStorage.getItem(alarmSettingsKey); // localStorageから設定を読み込む

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            const hour = now.getHours();
            const minute = now.getMinutes();

            // 曜日ごとの時間帯を取得
            const timeSlots = getTimeSlots(dayOfWeek);
            const timeSlots_ = getTimeSlots_(dayOfWeek);

            console.log(settings);

            Object.keys(settings).forEach((key,index) => {
                const timeArray = key.split('_');
                console.log(timeArray);
                const correspondingTimeSlot = timeSlots_[timeArray[0]-1];//何コマ目
                console.log(correspondingTimeSlot);
                if(correspondingTimeSlot){// 要素の中身があるなら
                    const isTimeEnabled = settings[key];
                    console.log("istrue?:"+isTimeEnabled);
                    const startTime = correspondingTimeSlot.hour * 60 + correspondingTimeSlot.minute;
                    if(isTimeEnabled){ //チェックボックスがtrueなら
                        setAlarm(timeArray[1],startTime);// アラームをセット
                    }
                }
                
            });
            // アラームのチェック
            // const checkedAlarms = ["startAlarm", "midAlarm", "endAlarm", "finalAlarm"];
            // checkedAlarms.forEach((alarmId, index) => {
            //     const correspondingTimeSlot = timeSlots_[index]; // 対応する時間帯を取得
            //     console.log(correspondingTimeSlot);
            //     for(let i = 0; i < timeSlots_.length; i++) {
            //         console.log(isCurrentTimeWithinSlot(correspondingTimeSlot, hour, minute));
            //         if (correspondingTimeSlot && settings[`${i + 1}_${alarmId}`] && isCurrentTimeWithinSlot(correspondingTimeSlot, hour, minute)) {
            //             setAlarm(alarmId, correspondingTimeSlot.hour * 60 + correspondingTimeSlot.minute); // アラームをセット
            //         }
            //     }
            // });

        }
    }, 6000); // 1分ごとにチェック

    // 各曜日ごとの時間帯を取得する関数
    function getTimeSlots_(day) {
        switch (day) {
            case "Wed":
            case "Thu":
                return [
                    { hour: 15, minute: 50 },
                    { hour: 17, minute: 40 },
                    { hour: 19, minute: 30 }
                ];
            case "Fri":
                return [
                    { hour: 15, minute: 50 },
                    { hour: 17, minute: 40 }
                ];
            case "Sat":
            case "Sun":
                return [
                    { hour: 10, minute: 0 },
                    { hour: 11, minute: 50 },
                    { hour: 14, minute: 40 },
                    { hour: 16, minute: 30 }
                ];
            default:
                return [];
        }
    }
    
    // 指定の時刻帯に現在の時刻が含まれるかを判定する関数
    function isCurrentTimeWithinSlot(timeSlot, currentHour, currentMinute) {
        const { hour, minute } = timeSlot;
        console.log(hour, minute)
        return currentHour === hour && currentMinute >= minute && currentMinute < minute + 50; // 50分までの範囲
    }


    // カスタム設定モーダル関連
    const modal = document.getElementById("customSettingsModal");
    const modalBtn = document.getElementById("customSettingsBtn");
    const span = document.getElementsByClassName("close")[0];
    const saveCustomSettingsBtn = document.getElementById("saveCustomSettingsBtn");
    const dayTitle = document.getElementById("dayTitle");
    const scheduleContainer = document.getElementById("scheduleContainer");
    const weekdaySelect = document.getElementById("weekdaySelect");

    modalBtn.onclick = function() {
        modal.style.display = "block";
        updateCustomSettingsModal();
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // 曜日選択に応じて設定モーダルを更新
    weekdaySelect.addEventListener("change", function() {
        updateCustomSettingsModal();
        loadSettings(weekdaySelect.value); // 追加: 曜日ごとにデータを読み込む
    });

    // 曜日ごとの時間帯を取得
    function getTimeSlots(day) {
        switch (day) {
            case "Wed":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10", "19:30 ~ 21:00"];
            case "Thu":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10", "19:30 ~ 21:00"];
            case "Fri":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10"];
            case "Sat":
                return ["10:00 ~ 11:30", "11:50 ~ 13:20", "14:40 ~ 16:10", "16:30 ~ 18:00"];
            case "Sun":
                return ["10:00 ~ 11:30", "11:50 ~ 13:20", "14:40 ~ 16:10", "16:30 ~ 18:00"];
            default:
                return [];
        }
    }

    // カスタム設定保存ボタンがクリックされたときの処理
    saveCustomSettingsBtn.onclick = function() {
        const selectedDay = weekdaySelect.value;
        saveSettings(selectedDay); // 修正: 選択された曜日を引数として渡す
        modal.style.display = "none";
    }

    // カスタム設定モーダルの更新
    function updateCustomSettingsModal() {
        const selectedDay = weekdaySelect.value;
        dayTitle.textContent = `${selectedDay}の設定`;

        // 既存のスケジュールをクリア
        scheduleContainer.innerHTML = "";

        // 各時間帯に対してコマごとの設定を作成
        const timeSlots = getTimeSlots(selectedDay);
        for (let i = 0; i < timeSlots.length; i++) {
            const timeSlot = timeSlots[i];
            const [startTime, endTime] = timeSlot.split(" ~ ");

            const pElement = document.createElement("p");
            scheduleContainer.appendChild(pElement);
            pElement.textContent = `${startTime} ~ ${endTime}`;

            const prefix = `${i + 1}`;
            createCheckbox("開始時", `${selectedDay}_${prefix}_startAlarm`);
            createCheckbox("開始50分後", `${selectedDay}_${prefix}_midAlarm`);
            createCheckbox("終了10分前", `${selectedDay}_${prefix}_endAlarm`);
            createCheckbox("終了時", `${selectedDay}_${prefix}_finalAlarm`);

        }

        // 保存された設定を反映
        loadSettings(selectedDay);
    }

    // チェックボックスを作成
    function createCheckbox(labelText, id) {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = id;

        label.htmlFor = id;
        label.appendChild(document.createTextNode(` ${labelText}`));
        label.appendChild(checkbox);

        scheduleContainer.appendChild(label);
    }

    // 保存処理（localStorageを使用）
    function saveSettings(day) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const settingsKey = `alarmSettings_${day}`; // 曜日ごとに個別のキーを作成

        const settings = {};

        checkboxes.forEach((checkbox) => {
            const parts = checkbox.id.split('_'); // IDを分割
            if (parts.length === 3) {
                const time = parts[1];
                const type = parts[2];
                settings[`${time}_${type}`] = checkbox.checked; // 設定を保存
            }
        });

        // 保存処理（localStorageを使用）
        localStorage.setItem(settingsKey, JSON.stringify(settings));
    }

    // 保存された設定を読み込んで反映
    function loadSettings(day) {
        const settingsKey = `alarmSettings_${day}`; // 曜日ごとに個別のキーを作成
        const savedSettings = localStorage.getItem(settingsKey);

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);

            Object.keys(settings).forEach((key) => {
                const parts = key.split('_'); // キーを分割
                if (parts.length === 2) {
                    const time = parts[0];
                    const type = parts[1];
                    const checkbox = document.getElementById(`${day}_${time}_${type}`);
                    if (checkbox) {
                        checkbox.checked = settings[key];
                    }
                }
            });
        }
    }


    
});
