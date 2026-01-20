const { exec } = require('child_process');
const os = require('os');

const url = 'http://localhost:3000';
const platform = os.platform();

let command;

if (platform === 'win32') {
  // Windows에서 크롬 열기
  command = `start chrome "${url}"`;
} else if (platform === 'darwin') {
  // macOS에서 크롬 열기
  command = `open -a "Google Chrome" "${url}"`;
} else {
  // Linux에서 크롬 열기
  command = `google-chrome "${url}" || chromium-browser "${url}" || xdg-open "${url}"`;
}

exec(command, (error) => {
  if (error) {
    console.error(`브라우저를 열 수 없습니다: ${error.message}`);
    // 대체 방법으로 기본 브라우저 열기
    const open = require('open-cli');
    open(url);
  }
});
