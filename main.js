const { app, BrowserWindow } = require("electron");
const path = require("path");

// 确保应用只运行一个实例 (新版Electron API)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，表示已有实例在运行，直接退出
  app.quit();
} else {
  // 监听第二个实例启动事件
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 如果应用已经在运行，就聚焦到已有的窗口
    if (BrowserWindow.getAllWindows().length > 0) {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  //当app准备好后，执行createWindow创建窗口
  const win = new BrowserWindow({
    width: 800, //窗口宽度
    height: 600, //窗口高度
    autoHideMenuBar: true, //自动隐藏菜单档
    icon: path.join(__dirname, 'build', 'icons', 'icon.ico'), // Windows平台图标
    webPreferences: {
      //在main.js中定义preload.js为桥梁
      preload: path.resolve(__dirname, "./preload.js"),
    },
  });
  win.loadFile("./index.html");
  win.maximize();
  console.log("main.js里的main.js");
}
app.on("ready", () => {
  createWindow();

  //兼容核心代码 1
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 兼容核心代码 2
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 监听进程信号，确保在关闭cmd窗口时正确退出应用
process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在退出应用...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在退出应用...');
  app.quit();
});

// 在Windows上检测父进程终止
if (process.platform === 'win32') {
  // 设置一个定时器定期检查父进程是否存在
  const checkParentProcess = () => {
    try {
      // 在Windows上，当父进程终止时，process.ppid 会变为1或无效值
      if (process.ppid <= 1) {
        console.log('父进程已终止，正在退出应用...');
        app.quit();
      } else {
        // 每1000毫秒检查一次
        setTimeout(checkParentProcess, 1000);
      }
    } catch (error) {
      console.error('检查父进程时出错:', error);
      app.quit();
    }
  };
  
  // 启动检查
  setTimeout(checkParentProcess, 1000);
}
