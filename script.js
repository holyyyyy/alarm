document.addEventListener("DOMContentLoaded", function() {
    // 時刻の更新
    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const youbi = now.getDay();//曜日　Sunday - Saturday : 0 - 6
        document.getElementById("clock").innerHTML = `${hours}<span>:</span>${minutes}`;
    }


    // 定期的に時刻を更新
    setInterval(updateClock, 1000);

    // アラームの設定
    function setAlarm(alarmType) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
        // 各アラームの音楽ファイルのパス
        const startAlarmPath = "path/to/start-alarm.mp3";
        const midAlarmPath = "path/to/mid-alarm.mp3";
        const endAlarmPath = "path/to/end-alarm.mp3";
        const finalAlarmPath = "path/to/final-alarm.mp3";
    
        // アラームの再生状態を取得
        const startAlarmChecked = document.getElementById("startAlarm").checked;
        const midAlarmChecked = document.getElementById("midAlarm").checked;
        const endAlarmChecked = document.getElementById("endAlarm").checked;
        const finalAlarmChecked = document.getElementById("finalAlarm").checked;
    
        // アラームの再生
        if (alarmType === "start" && startAlarmChecked) {
            playAlarm(startAlarmPath);
        } else if (alarmType === "mid" && midAlarmChecked) {
            playAlarm(midAlarmPath);
        } else if (alarmType === "end" && endAlarmChecked) {
            playAlarm(endAlarmPath);
        } else if (alarmType === "final" && finalAlarmChecked) {
            playAlarm(finalAlarmPath);
        }
    }
    
    function playAlarm(filePath) {
        const audioElement = new Audio(filePath);
        audioElement.play();
    }
    

    // 定期的にアラームをチェック
    setInterval(function() {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0から6 (0: 日曜日, 1: 月曜日, ..., 6: 土曜日)
        const hour = now.getHours();
        const minute = now.getMinutes();
    
        // 各コマの時刻（時と分の組み合わせ）
        const timeSlots = [
            { hour: 8, minute: 0 },
            { hour: 10, minute: 0 },
            { hour: 13, minute: 0 },
            { hour: 15, minute: 0 }
        ];
    
        // アラームのチェック
        const checkedAlarms = ["startAlarm", "midAlarm", "endAlarm", "finalAlarm"];
        checkedAlarms.forEach(alarmId => {
            const isChecked = document.getElementById(alarmId).checked;
            const correspondingTimeSlot = timeSlots[checkedAlarms.indexOf(alarmId)];
            
            if (isChecked && isCurrentTimeWithinSlot(correspondingTimeSlot, hour, minute)) {
                setAlarm(alarmId);
            }
        });
    
    }, 60000); // 1分ごとにチェック
    
    // 指定の時刻帯に現在の時刻が含まれるかを判定する関数
    function isCurrentTimeWithinSlot(timeSlot, currentHour, currentMinute) {
        const { hour, minute } = timeSlot;
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
    });

    // 曜日ごとの時間帯を取得
    function getTimeSlots(day) {
        switch (day) {
            case "水曜日":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10", "19:30 ~ 21:00"];
            case "木曜日":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10", "19:30 ~ 21:00"];
            case "金曜日":
                return ["15:50 ~ 17:20", "17:40 ~ 19:10"];
            case "土曜日":
                return ["10:00 ~ 11:30", "11:50 ~ 13:20", "14:40 ~ 16:10", "16:30 ~ 18:00"];
            case "日曜日":
                return ["10:00 ~ 11:30", "11:50 ~ 13:20", "14:40 ~ 16:10", "16:30 ~ 18:00"];
            default:
                return [];
        }
    }

    // カスタム設定保存ボタンがクリックされたときの処理
    saveCustomSettingsBtn.onclick = function() {
        saveSettings();
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

            const prefix = `alarm${i + 1}`;
            createCheckbox("開始時", `${selectedDay}_${prefix}Start`);
            createCheckbox("開始50分後", `${selectedDay}_${prefix}Mid`);
            createCheckbox("終了10分前", `${selectedDay}_${prefix}End`);
            createCheckbox("終了時", `${selectedDay}_${prefix}Final`);

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

    // 設定を保存
    function saveSettings() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const settings = {};

        checkboxes.forEach((checkbox) => {
            settings[checkbox.id] = checkbox.checked;
        });

        // 保存処理（localStorageを使用）
        localStorage.setItem("alarmSettings", JSON.stringify(settings));
    }

    // 保存された設定を読み込んで反映
    function loadSettings(day) {
        const savedSettings = localStorage.getItem("alarmSettings");

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);

            Object.keys(settings).forEach((key) => {
                // 曜日とチェックボックスのidが一致する場合のみ反映
                if (key.startsWith(`${day}_`)) {
                    const checkbox = document.getElementById(key);

                    if (checkbox) {
                        checkbox.checked = settings[key];
                    }
                }
            });
        }
    }


    
});
