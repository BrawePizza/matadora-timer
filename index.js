import readline from 'readline';

// Включаем посимвольный ввод
readline.emitKeypressEvents(process.stdin);


let seconds = 0;
let currentInput = ''; // Здесь хранится текст, который вводит пользователь

// Функция для отрисовки всего интерфейса
function render() {
  // 1. Очищаем текущую строку (строку ввода) и строку над ней (строку таймера)
  readline.clearLine(process.stdout, 0);
  readline.moveCursor(process.stdout, 0, -1);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  // 2. Печатаем верхнюю строку (Таймер)
  process.stdout.write(`[Время]: ${seconds} сек. (Для выхода нажмите Ctrl+C)\n`);

  // 3. Печатаем нижнюю строку (Ввод)
  process.stdout.write(`> Введите текст: ${currentInput}`);
}

// Первичный вывод, чтобы подготовить две строки в консоли
process.stdout.write('\n\n'); 
render();

// Независимый таймер обновляет экран каждую секунду
const timer = setInterval(() => {
  seconds++;
  render();
}, 1000);

// Обработка ввода с клавиатуры
process.stdin.on('keypress', (str, key) => {
  // Выход по Ctrl+C
  if (key.ctrl && key.name === 'c') {
    clearInterval(timer);
    process.stdout.write('\n'); // Перенос строки перед выходом
    process.exit();
  }

  if (key.name === 'return') {
    // Пользователь нажал Enter — обрабатываем введенную строку
    const command = currentInput.trim();
    
    // Тут можно добавить логику обработки команд
    // Для примера: просто очищаем ввод после нажатия Enter
    currentInput = ''; 
  } else if (key.name === 'backspace') {
    // Удаление последнего символа
    currentInput = currentInput.slice(0, -1);
  } else if (str && !key.ctrl && !key.meta) {
    // Добавляем обычные символы в строку ввода
    currentInput += str;
  }

  // Перерисовываем интерфейс сразу после нажатия клавиши
  render();
});
