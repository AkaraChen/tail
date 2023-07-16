import chokidar from "chokidar";
import EventEmitter from "events";
import fs from "fs";
import { Buffer } from "buffer";
import slash from 'slash';

function isValidFile(file: string) {
    try {
        return fs.statSync(file).isFile();
    } catch {
        return false;
    }
}

export class Tail extends EventEmitter {
    private watcher: chokidar.FSWatcher;
    private lastsize = 0;
    constructor(_file: string) {
        super();
        const file = slash(_file);
        if (!isValidFile(file)) {
            throw new Error(`${file} is not a valid file`);
        }
        this.watcher = chokidar.watch(file);
        this.watcher.on("change", (_path, stats) => {
            // in change event, stats is always valid, return it to make typescript happy
            if (!stats) return;
            if (stats.size < this.lastsize) return
            const diff = stats.size - this.lastsize;
            const buffer = Buffer.alloc(diff);
            fs.readSync(fs.openSync(file, "r"), buffer, {
                position: stats.size - diff,
                length: diff,
            })
            this.emit(
                "data",
                buffer.toString()
                    .replace(/\r\n/g, "\n")
                    .split("\n")
                    // remove empty lines
                    .filter(Boolean)
            );
            this.lastsize = stats.size;
        });
    }
}

export default Tail;
