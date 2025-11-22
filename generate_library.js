const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'songs');
const outputFile = path.join(__dirname, 'songs.json');

async function generateLibrary() {
    const library = [];
    
    try {
        const entries = await fs.promises.readdir(songsDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const folderPath = path.join(songsDir, entry.name);
                const folderFiles = await fs.promises.readdir(folderPath);
                
                // Check for info.json
                const infoFile = folderFiles.find(file => file === 'info.json');
                if (!infoFile) continue;
                
                const infoData = await fs.promises.readFile(path.join(folderPath, 'info.json'), 'utf-8');
                let metadata;
                try {
                    metadata = JSON.parse(infoData);
                } catch (e) {
                    console.error(`Error parsing info.json in ${entry.name}:`, e);
                    continue;
                }

                // Find mp3 files
                const songs = folderFiles.filter(file => file.endsWith('.mp3'));
                
                if (songs.length > 0 || entry.name) { // Include even if empty if it's a valid album folder
                     library.push({
                        folder: entry.name,
                        title: metadata.title,
                        description: metadata.description,
                        cover: `songs/${entry.name}/cover.jpg`,
                        songs: songs
                    });
                }
            }
        }
        
        await fs.promises.writeFile(outputFile, JSON.stringify(library, null, 2));
        console.log(`Library generated with ${library.length} albums at ${outputFile}`);
        
    } catch (err) {
        console.error('Error generating library:', err);
    }
}

generateLibrary();
