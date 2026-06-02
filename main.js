const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');

let mainWindow;
let activeTrackingIntervals = {};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1150,
        height: 750,
        backgroundColor: '#0b0c0f',
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Feature 1 & 2 Upgrade: Launch Game with optional MangoHud Overlay prefix
ipcMain.on('launch-game', (event, { gameName, gamePath, type, useOverlay }) => {
    const gameDir = path.dirname(gamePath);
    const binary = path.basename(gamePath);
    
    // Core Runner string selection
    let baseCommand = type === 'Wine' ? `wine "${binary}"` : `./${binary}`;
    
    // If user toggled the overlay on, prepend mangohud to the execution string
    let command = useOverlay ? `mangohud ${baseCommand}` : baseCommand;
    
    const startTime = Date.now();

    const gameProcess = exec(command, { cwd: gameDir }, (error) => {
        if (error) console.error(`Launch error: ${error.message}`);
    });

    const pid = gameProcess.pid;
    if (!pid) return;

    activeTrackingIntervals[gameName] = setInterval(() => {
        exec(`ps -p ${pid} -o state=`, (err, stdout) => {
            if (err || !stdout.trim()) {
                clearInterval(activeTrackingIntervals[gameName]);
                delete activeTrackingIntervals[gameName];
                
                const endTime = Date.now();
                const minutesPlayed = Math.round((endTime - startTime) / 1000 / 60);
                
                event.reply('game-closed', { gameName, minutesPlayed, lastPlayed: new Date().toLocaleDateString() });
            }
        });
    }, 5000);
});

// Feature 1: Ultra low impact system profiling diagnostics channel
ipcMain.handle('get-system-stats', async () => {
    return new Promise((resolve) => {
        // Pulls CPU load & Free memory lines via built-in light Linux scripts
        exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' && free -m | grep Mem | awk '{print $3/$2 * 100}'", (err, stdout) => {
            if (err) return resolve({ cpu: '0', ram: '0' });
            const lines = stdout.trim().split('\n');
            resolve({
                cpu: parseFloat(lines[0] || 0).toFixed(0),
                ram: parseFloat(lines[1] || 0).toFixed(0)
            });
        });
    });
});

// Feature 5: SteamGridDB Image Fetch Downloader Stream
ipcMain.handle('download-artwork', async (event, { gameName, targetPath, apiKey }) => {
    return new Promise((resolve) => {
        const queryUrl = `https://www.steamgriddb.com/api/v2/search/autocomplete/${encodeURIComponent(gameName)}`;
        const headers = { 'Authorization': `Bearer ${apiKey}` };

        // Step 1: Query API for Game ID matching search terms
        https.get(queryUrl, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const searchJSON = JSON.parse(data);
                    if (!searchJSON.success || !searchJSON.data.length) return resolve(false);
                    const gameId = searchJSON.data[0].id;

                    // Step 2: Grab high-res grid layout banner URL
                    const gridUrl = `https://www.steamgriddb.com/api/v2/grids/game/${gameId}?dimensions=460x215,920x430`;
                    https.get(gridUrl, { headers }, (gridRes) => {
                        let gridData = '';
                        gridRes.on('data', chunk => gridData += chunk);
                        gridRes.on('end', () => {
                            try {
                                const gridJSON = JSON.parse(gridData);
                                if (!gridJSON.success || !gridJSON.data.length) return resolve(false);
                                const imageUrl = gridJSON.data[0].url;

                                // Step 3: Write network stream to local drive path
                                const file = fs.createWriteStream(targetPath);
                                https.get(imageUrl, (imgRes) => {
                                    imgRes.pipe(file);
                                    file.on('finish', () => {
                                        file.close();
                                        resolve(true);
                                    });
                                });
                            } catch (e) { resolve(false); }
                        });
                    });
                } catch (e) { resolve(false); }
            });
        }).on('error', () => resolve(false));
    });
});

ipcMain.handle('scan-directory', async (event, targetDir) => {
    if (!fs.existsSync(targetDir)) return [];
    return fs.readdirSync(targetDir).filter(file => fs.statSync(path.join(targetDir, file)).isDirectory());
});

ipcMain.handle('check-files', async (event, folderPath) => {
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
