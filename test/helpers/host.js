"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockConsoleHost = exports.ERASE_TO_END = exports.moveCursorTo = void 0;
const buffer_1 = require("buffer");
const stream_1 = require("stream");
const host_1 = require("../../host");
function moveCursorTo(column) {
    return `\u001b[${column}G`;
}
exports.moveCursorTo = moveCursorTo;
exports.ERASE_TO_END = `\u001b[0J`;
class MockInputStream extends stream_1.Transform {
    input;
    constructor() {
        super();
        this.input = '';
    }
    _transform(chunk, _encoding, callback) {
        if (chunk instanceof buffer_1.Buffer) {
            this.input += chunk.toString();
        }
        else {
            this.input += chunk;
        }
        this.push(chunk);
        callback();
    }
    reset() {
        this.input = '';
    }
}
class MockOutputStream extends stream_1.Writable {
    output;
    constructor() {
        super();
        this.output = '';
    }
    _write(chunk, _encoding, callback) {
        if (chunk instanceof buffer_1.Buffer) {
            this.output += chunk.toString();
        }
        else {
            this.output += chunk;
        }
        callback();
    }
    reset() {
        this.output = '';
    }
}
class MockConsoleHost extends host_1.ConsoleHost {
    constructor() {
        super();
        this.inputStream = new MockInputStream();
        this.outputStream = new MockOutputStream();
        this.errorStream = new MockOutputStream();
    }
}
exports.MockConsoleHost = MockConsoleHost;
//# sourceMappingURL=host.js.map