"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const minify_1 = __importDefault(require("./minify"));
const util_1 = require("util");
const worker_farm_1 = __importDefault(require("worker-farm"));
const fs_1 = require("fs");
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const async_sema_1 = __importDefault(require("async-sema"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const worker = require.resolve('./worker');
const writeFileP = util_1.promisify(fs_1.writeFile);
const readFileP = util_1.promisify(fs_1.readFile);
class TaskRunner {
    constructor(distDir, cpus) {
        mkdirp_1.default.sync((this.cacheDir = path_1.join(distDir, 'cache', 'next-minifier')));
        // In some cases cpus() returns undefined
        // https://github.com/nodejs/node/issues/19022
        this.maxConcurrentWorkers = cpus;
        this.sema = new async_sema_1.default(cpus * 3);
    }
    run(tasks, callback) {
        /* istanbul ignore if */
        if (!tasks.length) {
            callback(null, []);
            return;
        }
        if (this.maxConcurrentWorkers > 1) {
            const workerOptions = process.platform === 'win32'
                ? {
                    maxConcurrentWorkers: this.maxConcurrentWorkers,
                    maxConcurrentCallsPerWorker: 1,
                }
                : { maxConcurrentWorkers: this.maxConcurrentWorkers };
            this.workers = worker_farm_1.default(workerOptions, worker);
            this.boundWorkers = (options, cb) => {
                try {
                    this.workers(serialize_javascript_1.default(options), cb);
                }
                catch (error) {
                    // worker-farm can fail with ENOMEM or something else
                    cb(error);
                }
            };
        }
        else {
            this.boundWorkers = (options, cb) => {
                try {
                    cb(null, minify_1.default(options));
                }
                catch (error) {
                    cb(error);
                }
            };
        }
        let toRun = tasks.length;
        const results = [];
        const step = (index, data) => {
            this.sema.release();
            toRun -= 1;
            results[index] = data;
            if (!toRun) {
                callback(null, results);
            }
        };
        tasks.forEach((task, index) => {
            const cachePath = path_1.join(this.cacheDir, task.cacheKey);
            const enqueue = () => {
                this.boundWorkers(task, (error, data) => {
                    const result = error ? { error } : data;
                    const done = () => step(index, result);
                    if (this.cacheDir && !result.error) {
                        writeFileP(cachePath, JSON.stringify(data), 'utf8')
                            .then(done)
                            .catch(done);
                    }
                    else {
                        done();
                    }
                });
            };
            this.sema.acquire().then(() => {
                if (this.cacheDir) {
                    readFileP(cachePath, 'utf8')
                        .then(data => step(index, JSON.parse(data)))
                        .catch(() => enqueue());
                }
                else {
                    enqueue();
                }
            });
        });
    }
    exit() {
        if (this.workers) {
            worker_farm_1.default.end(this.workers);
        }
    }
}
exports.default = TaskRunner;
