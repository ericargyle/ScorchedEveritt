const {app,BrowserWindow}=require('electron');
const path=require('node:path');
function open(){const w=new BrowserWindow({width:1200,height:850,minWidth:360,minHeight:620,backgroundColor:'#101c2c',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});w.webContents.setWindowOpenHandler(()=>({action:'deny'}));w.webContents.on('will-navigate',e=>e.preventDefault());w.loadFile(path.join(__dirname,'../dist/index.html'));}
app.whenReady().then(open);app.on('window-all-closed',()=>app.quit());