document.addEventListener("DOMContentLoaded", function() {
    const delayTime = {
        "start": 0,
        "mid": 50,
        "end": 80,
        "final": 90
    }
    // カスタム設定モーダル関連
    const modal = document.getElementById("customSettingsModal");
    const openBtn = document.getElementById("openBtn");
    const closeBtn = document.getElementsByClassName("close")[0];
    const saveBtn = document.getElementById("saveBtn");
    const dayTitle = document.getElementById("dayTitle");
    const scheduleContainer = document.getElementById("scheduleContainer");
    const classdaySelect = document.getElementById("classdaySelect");
    
    // モーダルを開く
    openBtn.onclick = function() {
        modal.style.display = "block";
        updateSettings();
    }
    // モーダルを閉じる
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    // 曜日選択に応じて設定モーダルを更新
    classdaySelect.addEventListener("change", function() {
        updateSettings();
        loadSettings(classdaySelect.value); // 追加: 曜日ごとにデータを読み込む
    });

    // 自動再生のため、サウンド再生を最初に許可しておく
    document.getElementById("allowAlarm").addEventListener("click", function() {
        prepareSound("startAlarm");
        prepareSound("midAlarm");
        prepareSound("endAlarm");
        prepareSound("finalAlarm");
        document.getElementById("allowAlarm").remove();
    });
    // 音楽を一瞬鳴らして止める
    function prepareSound(type) {
        const audio = document.getElementById(type);
        console.log(audio);
        audio.play();
        audio.pause();
        audio.volume = 1;
    }

    // 時刻の更新
    function updateClock() {
        // const now = new Date('2024-04-17T06:50:00.160Z')
        // const now = new Date('2024-04-17T07:40:00.160Z')
        // const now = new Date('2024-04-17T08:10:00.160Z')
        // const now = new Date('2024-04-17T08:20:00.160Z')
        // console.log("今は"+now);
        const now = new Date()
        const hours = now.getHours().toString().padStart(2,'0')
        const minutes = now.getMinutes().toString().padStart(2,'0')
        const seconds = now.getSeconds()
        document.getElementById("clock").innerHTML = `${hours}<span>:</span>${minutes}`;
        if (seconds==0){
            checkAlarm(now)
        }
    }
    // 定期的に時刻を更新
    setInterval(updateClock, 1000);

    // 曜日に応じて時間帯を返す
    function timeTables(DOW) { // getTimeSlot
        switch (DOW) {
            case "Wed":
            case 3:
                return [
                    { hour: 15, minute:50, classTime:"15:50 ~ 17:20" },
                    { hour: 17, minute:40, classTime:"17:40 ~ 19:10" },
                    { hour: 19, minute:30, classTime:"19:30 ~ 21:00" }
                ]
            case "Thu":
            case 4:
                return [
                    { hour: 15, minute:50, classTime:"15:50 ~ 17:20" },
                    { hour: 17, minute:40, classTime:"17:40 ~ 19:10" },
                    { hour: 19, minute:30, classTime:"19:30 ~ 21:00" }
                ]
            case "Fri":
            case 5:
                return [
                    { hour: 15, minute:50, classTime:"15:50 ~ 17:20" },
                    { hour: 17, minute:40, classTime:"17:40 ~ 19:10" }
                ]
            case "Sat":
            case 6:
                return [
                    { hour:10, minute: 0, classTime:"10:00 ~ 11:30"},
                    { hour:11, minute: 50, classTime:"11:50 ~ 13:20"},
                    { hour:14, minute: 40, classTime:"14:40 ~ 16:10"},
                    { hour:16, minute: 30, classTime:"16:30 ~ 18:00"}
                ]
            case "Sun":
            case 0:
                return [
                    { hour:10, minute: 0, classTime:"10:00 ~ 11:30"},
                    { hour:11, minute: 50, classTime:"11:50 ~ 13:20"},
                    { hour:14, minute: 40, classTime:"14:40 ~ 16:10"},
                    { hour:16, minute: 30, classTime:"16:30 ~ 18:00"}
                ]
            default:
                return []
        }
    }

    // 各時刻と現在時刻が一致するかどうかチェックして、一致していたらアラームの設定を確認しに行く
    function checkAlarm(now) {
        const youbi = now.getDay();//曜日　Sunday - Saturday : 0 - 6
        const timeTable = timeTables(youbi)
        timeTable.forEach((entry,i) => {
            const startTime = new Date(now.getFullYear(),now.getMonth(),now.getDate(),entry.hour,entry.minute)
            console.log(startTime)
            for (const key in delayTime){
                if(Object.hasOwnProperty.call(delayTime,key)){
                    const currentTime = new Date(startTime)
                    const delay = delayTime[key]
                    currentTime.setMinutes(currentTime.getMinutes() + delay)
                    const hours = currentTime.getHours()
                    const minutes = currentTime.getMinutes()
                    console.log(hours+":"+minutes)

                    if(hours==now.getHours()&&minutes==now.getMinutes()){
                        console.log("アラーム！！！:"+i);
                        checkAlarmSetting(now,key,i)
                    }
                }
            }
        });
        
    }
    function checkAlarmSetting(now,alarmType,num){
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }); // 現在の曜日を取得
        console.log(`alarmSettings_${dayOfWeek}`);
        const savedSettings = localStorage.getItem(`alarmSettings_${dayOfWeek}`)
        if (savedSettings){
            const settings = JSON.parse(savedSettings)
            Object.keys(settings).forEach((element,index) => {
                if(((num+1)+"_"+alarmType)==element){
                    if(settings[element]){
                        console.log(element+"is"+settings[element])
                        playAlarm(alarmType+"Alarm")
                    }
                }
            });
        }
    }
    // アラームを鳴らす
    function playAlarm(filePath){
        const audio = document.getElementById(filePath)
        playAudio()
        async function playAudio(){
            try {
                await audio.play()
            } catch(err) {
                console.log(err)
            }
        }
    }
    function setAlarm(filePath){

        const msUntilAlarm = 0
        setTimeout(playAlarm(filePath),msUntilAlarm)
        
    }

    // カスタム設定モーダルの更新
    function updateSettings() {
        const selectedDay = classdaySelect.value;
        dayTitle.textContent = `${selectedDay}の設定`;

        // 既存のスケジュールをクリア
        scheduleContainer.innerHTML = "";

        // 各時間帯に対してコマごとの設定を作成
        const timeTable = timeTables(selectedDay);
        timeTable.forEach((entry,i) => {
            const [startTime, endTime] = entry.classTime.split(" ~ ")

            const pElement = document.createElement("p");
            scheduleContainer.appendChild(pElement);
            pElement.textContent = `${startTime} ~ ${endTime}`;

            const prefix = `${i + 1}`;
            createCheckbox("開始時", `${selectedDay}_${prefix}_start`);
            createCheckbox("開始50分後", `${selectedDay}_${prefix}_mid`);
            createCheckbox("終了10分前", `${selectedDay}_${prefix}_end`);
            createCheckbox("終了時", `${selectedDay}_${prefix}_final`);
        });

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

    // 保存ボタンがクリックされたときの処理
    saveBtn.onclick = function() {
        const selectedDay = classdaySelect.value;
        saveSettings(selectedDay);
        modal.style.display = "none";
    }
    // localStorageにjsonデータを保存する
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


    // localStorageに保存された設定を読み込んでチェックボックスに反映する
    function loadSettings(day) {
        const settingsKey = `alarmSettings_${day}`; // 曜日ごとに個別のキーを作成
        const savedSettings = localStorage.getItem(settingsKey);

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);

            Object.keys(settings).forEach(element => {
                const parts = element.split('_'); // キーを分割
                if (parts.length === 2) {
                    const time = parts[0];
                    const type = parts[1];
                    const checkbox = document.getElementById(`${day}_${time}_${type}`);
                    if (checkbox) {
                        checkbox.checked = settings[element];
                    }
                }
            });
        }
    }
    



});
