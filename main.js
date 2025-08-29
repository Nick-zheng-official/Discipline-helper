const { app, BrowserWindow } = require("electron");
const path = require("path")


function createWindow() {
  //当app准备好后，执行createWindow创建窗口
  const win = new BrowserWindow({
    width: 800, //窗口宽度
    height: 600, //窗口高度
    autoHideMenuBar: true, //自动隐藏菜单档
    webPreferences: {
      //在main.js中定义preload.js为桥梁
      preload: path.resolve(__dirname, "./preload.js"),
    },
  });
  win.loadFile("./pages/index.html");
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

//兼容核心代码 2
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
