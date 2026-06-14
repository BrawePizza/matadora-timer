

// Объект таймера
let timerState = {
    mode: "work",           // "work" или "break"
    timeLeft: 25 * 60,      // оставшееся время в секундах
    intervalId: null,
    isRunning: false
}


let settings = {};
let savedSettings = localStorage.getItem("pomodoroSettings")
if (savedSettings) {
    settings = JSON.parse(savedSettings)
    if (typeof settings.workMinutes === "number") {
        settings.workMinutes = settings.workMinutes
    } else {
        settings.workMinutes = 25
    }
    if (typeof settings.breakMinutes === "number") {
        settings.breakMinutes = settings.breakMinutes
    } else {
        settings.breakMinutes = 5
    }
    if (typeof settings.longBreakMinutes === "number") {
        settings.longBreakMinutes = settings.longBreakMinutes
    } else {
        settings.longBreakMinutes = 15
    }
    if (typeof settings.longBreakAfter === "number") {
        settings.longBreakAfter = settings.longBreakAfter
    } else {
        settings.longBreakAfter = 4
    }
} else {
    settings = {
        workMinutes: 25,
        breakMinutes: 5,
        longBreakMinutes: 15,
        longBreakAfter: 4
    }
}


let appState = {
    pomodoroCount: 0,
    totalWorkSeconds: 0,
    history: []       
}


let savedState = localStorage.getItem("pomodoroState")
if (savedState) {
    appState = JSON.parse(savedState)
}


var bellSound = new Audio("./sound/japanse_bell.mp3")


function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60)
    var seconds = totalSeconds % 60
    var minStr = String(minutes).padStart(2, "0")
    var secStr = String(seconds).padStart(2, "0")
    return minStr + ":" + secStr
}


function saveSettings() {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings))
}


function saveState() {
    localStorage.setItem("pomodoroState", JSON.stringify(appState))
}


function playBell() {
    bellSound.currentTime = 0
    bellSound.play().catch(function () {
    })
}

function showNotification(text) {
    var el = document.getElementById("notification")
    var textEl = document.getElementById("notificationText")
    if (!el || !textEl) return
    textEl.textContent = text
    el.classList.remove("hidden")
    el.classList.add("visible")

    setTimeout(function () {
        el.classList.remove("visible")
        el.classList.add("hidden")
    }, 5000)
}


function updateDisplay() {
    var workEl = document.getElementById("workTimer")
    var breakEl = document.getElementById("breakTimer")
    var startBtn = document.getElementById("startPause")

    if (workEl) {
        if (timerState.mode === "work") {
            workEl.textContent = formatTime(timerState.timeLeft)
        } else {
            workEl.textContent = formatTime(settings.workMinutes * 60)
        }
    }

    if (breakEl) {
        if (timerState.mode === "break") {
            breakEl.textContent = formatTime(timerState.timeLeft)
        } else {
            var nextBreak = getNextBreakDuration()
            breakEl.textContent = formatTime(nextBreak)
        }
    }

    var workBox = document.getElementById("workBox")
    var breakBox = document.getElementById("breakBox")
    if (workBox && breakBox) {
        if (timerState.mode === "work") {
            workBox.classList.add("active")
            breakBox.classList.remove("active")
        } else {
            breakBox.classList.add("active")
            workBox.classList.remove("active")
        }
    }

    if (timerState.mode === "break") {
        document.body.classList.add("break-mode")
        document.title = "Отдых — Pomodoro Pro"
    } else {
        document.body.classList.remove("break-mode")
        document.title = "Работа — Pomodoro Pro"
    }

    if (startBtn) {
        if (timerState.isRunning) {
            startBtn.textContent = "Пауза"
        } else {
            startBtn.textContent = "Старт"
        }
    }

    updateStatsDisplay()
    updateHistoryDisplay()
    updateSettingsInputs()
}

function updateStatsDisplay() {
    var countEl = document.getElementById("pomodoroCount")
    var totalEl = document.getElementById("totalTime")

    if (countEl) {
        countEl.textContent = String(appState.pomodoroCount)
    }

    if (totalEl) {
        var totalMinutes = Math.floor(appState.totalWorkSeconds / 60)
        totalEl.textContent = String(totalMinutes) + " мин"
    }
}

function updateHistoryDisplay() {
    var list = document.getElementById("history")
    if (!list) return

    list.innerHTML = ""


    var items = appState.history.slice(0)
    items.reverse()
    if (items.length > 20) {
        items = items.slice(0, 20)
    }

    for (var i = 0; i < items.length; i++) {
        var item = items[i]
        var li = document.createElement("li")
        li.textContent = item.time + " — " + item.type + " — " + item.duration + " мин"
        list.appendChild(li)
    }
}

function updateSettingsInputs() {
    var wInput = document.getElementById("workInput")
    var bInput = document.getElementById("breakInput")
    var lbInput = document.getElementById("longBreakInput")
    var laInput = document.getElementById("longBreakAfterInput")

    if (wInput && !wInput.value) wInput.value = String(settings.workMinutes)
    if (bInput && !bInput.value) bInput.value = String(settings.breakMinutes)
    if (lbInput && !lbInput.value) lbInput.value = String(settings.longBreakMinutes)
    if (laInput && !laInput.value) laInput.value = String(settings.longBreakAfter)
}

function getNextBreakDuration() {
    var count = appState.pomodoroCount + (timerState.mode === "work" ? 1 : 0)
    if (count % settings.longBreakAfter === 0) {
        return settings.longBreakMinutes * 60
    }
    return settings.breakMinutes * 60
}

function tick() {
    if (timerState.timeLeft > 0) {
        timerState.timeLeft = timerState.timeLeft - 1
    } else {
        switchMode()
    }
    updateDisplay()
}

function switchMode() {
    playBell()

    if (timerState.mode === "work") {
        var currentSessionDuration = settings.workMinutes

        appState.pomodoroCount = appState.pomodoroCount + 1
        appState.totalWorkSeconds = appState.totalWorkSeconds + currentSessionDuration * 60

        var now = new Date()
        var timeStr = String(now.getHours()).padStart(2, "0") + ":" +
                      String(now.getMinutes()).padStart(2, "0")

        var historyEntry = {
            time: timeStr,
            type: "Помидор #" + String(appState.pomodoroCount),
            duration: currentSessionDuration
        }
        appState.history.push(historyEntry)

        saveState()

        var nextBreak = getNextBreakDuration()
        timerState.timeLeft = nextBreak
        timerState.mode = "break"

        var breakLabel = (nextBreak === settings.longBreakMinutes * 60)
            ? "Длинный перерыв"
            : "Короткий перерыв"

        showNotification("🍅 Помидор завершён! " + breakLabel)
        document.title = breakLabel + " — Pomodoro Pro"

    } else {
        timerState.timeLeft = settings.workMinutes * 60
        timerState.mode = "work"

        showNotification("⏰ Перерыв окончен! Время работать!")
        document.title = "Pomodoro Pro"
    }

    saveState()
}


function toggleTimer() {
    if (!timerState.isRunning) {
        timerState.isRunning = true
        timerState.intervalId = setInterval(tick, 1000)
    } else {
        timerState.isRunning = false
        clearInterval(timerState.intervalId)
        timerState.intervalId = null
    }
    updateDisplay();
}

function resetTimer() {
    timerState.isRunning = false
    clearInterval(timerState.intervalId)
    timerState.intervalId = null
    timerState.mode = "work"
    timerState.timeLeft = settings.workMinutes * 60
    updateDisplay()
}

function applySettings() {
    var wInput = document.getElementById("workInput")
    var bInput = document.getElementById("breakInput")
    var lbInput = document.getElementById("longBreakInput")
    var laInput = document.getElementById("longBreakAfterInput")

    if (wInput && wInput.value) settings.workMinutes = parseInt(wInput.value, 10)
    else settings.workMinutes = 25

    if (bInput && bInput.value) settings.breakMinutes = parseInt(bInput.value, 10)
    else settings.breakMinutes = 5

    if (lbInput && lbInput.value) settings.longBreakMinutes = parseInt(lbInput.value, 10)
    else settings.longBreakMinutes = 15

    if (laInput && laInput.value) settings.longBreakAfter = parseInt(laInput.value, 10)
    else settings.longBreakAfter = 4

    if (!timerState.isRunning) {
        if (timerState.mode === "work") {
            timerState.timeLeft = settings.workMinutes * 60
        } else {
            timerState.timeLeft = settings.breakMinutes * 60
        }
    }

    saveSettings()
    saveState()
    updateDisplay()
}


function exportJSON() {
    var data = {
        pomodoros: appState.pomodoroCount,
        totalWorkMinutes: Math.floor(appState.totalWorkSeconds / 60),
        history: appState.history,
        settings: settings,
        exportDate: new Date().toLocaleString()
    }

    var jsonStr = JSON.stringify(data, null, 2)

    var blob = new Blob([jsonStr], { type: "application/json" })
    var url = URL.createObjectURL(blob);

    var link = document.createElement("a")
    link.href = url;
    link.download = "pomodoro-stats.json"
    document.body.appendChild(link);
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}


timerState.timeLeft = settings.workMinutes * 60


document.addEventListener("DOMContentLoaded", function () {
    var startBtn = document.getElementById("startPause")
    var resetBtn = document.getElementById("reset")
    var saveBtn = document.getElementById("saveSettings")
    var jsonBtn = document.getElementById("exportJSON")
    var csvBtn = document.getElementById("exportCSV")

    if (startBtn) {
        startBtn.addEventListener("click", toggleTimer)
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetTimer)
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", applySettings)
    }

    if (jsonBtn) {
        jsonBtn.addEventListener("click", exportJSON)
    }

    if (csvBtn) {
        csvBtn.addEventListener("click", exportCSV)
    }

    updateDisplay()
})
