import readline from 'readline';

readline.emitKeypressEvents(process.stdin);


let seconds = 0;
let currentInput = ''; 

function render() {
  
  readline.clearLine(process.stdout, 0);
  readline.moveCursor(process.stdout, 0, -1);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

  process.stdout.write(`[Время]: ${seconds} сек. (Для выхода нажмите Ctrl+C)\n`);

  process.stdout.write(`> Введите текст: ${currentInput}`);
}

process.stdout.write('\n\n'); 
render();

const timer = setInterval(() => {
  seconds++;
  render();
}, 1000);

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    clearInterval(timer);
    process.stdout.write('\n');
    process.exit();
  }

  if (key.name === 'return') {
    const command = currentInput.trim();
   
    currentInput = ''; 
  } else if (key.name === 'backspace') {
    currentInput = currentInput.slice(0, -1);
  } else if (str && !key.ctrl && !key.meta) {
   
    currentInput += str;
  }

  render();
});
