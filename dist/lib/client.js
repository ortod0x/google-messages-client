"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const service_1 = __importDefault(require("./service"));
class MessagesClient extends events_1.EventEmitter {
    constructor(options = { headless: true, credentials: { cookies: [], localStorage: {} } }) {
        super();
        this.isAuthenticated = false;
        this.launch(options);
    }
    static loadCredentialFile(path) {
        const credentials = JSON.parse(fs_1.default.readFileSync(path).toString());
        return credentials;
    }
    launch(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_1.default.launch({ headless: options.headless });
            this.browser = browser;
            const page = yield browser.newPage();
            this.page = page;
            yield this.page.goto('https://messages.google.com/web/authentication', { waitUntil: 'load' });
            yield this.page.waitForSelector('#mat-mdc-slide-toggle-1');
            yield this.page.evaluate(() => {
                const checkbox = document.querySelector('#mat-mdc-slide-toggle-1-button');
                checkbox.click(); //remember me
            });
            this.emit('browser-launched');
            if (!Object.keys(options.credentials.localStorage).length) {
                this.attachQrReader();
                this.attachReqTracer();
                return;
            }
            else {
                yield this.setCredentials(options.credentials);
                const service = new service_1.default(this.page);
                this.emit('authenticated', service);
                this.isAuthenticated = true;
            }
            try {
                yield this.page.waitForSelector('#mat-checkbox-1');
                const dontshowCheckbox = yield this.page.$('#mat-checkbox-1');
                dontshowCheckbox.click();
                const dontShowBtn = yield this.page.$('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > div > mw-banner > div > mw-remember-this-computer-banner > div > div.button-align > button.action-button.confirm.mat-focus-indicator.mat-button.mat-button-base');
                dontShowBtn.click();
            }
            catch (err) {
                // maybe button doesn't exist
            }
        });
    }
    attachReqTracer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.page.on('request', request => {
                const url = request.url();
                if (url.includes('Pairing/GetWebEncryptionKey')) {
                    const service = new service_1.default(this.page);
                    if (!this.isAuthenticated) {
                        this.emit('authenticated', service);
                        this.isAuthenticated = true;
                    }
                }
            });
        });
    }
    attachQrReader() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForSelector("body > mw-app > mw-bootstrap > div > main > mw-authentication-container > div > div.content-container > div > div.qr-code-container > div.qr-code-wrapper > mw-qr-code");
            yield this.page.exposeFunction('onQrChange', () => __awaiter(this, void 0, void 0, function* () {
                const img = yield this.page.$('body > mw-app > mw-bootstrap > div > main > mw-authentication-container > div > div.content-container > div > div.qr-code-container > div.qr-code-wrapper > mw-qr-code > img');
                if (img) {
                    const src = yield img.getProperty('src');
                    if (src) {
                        this.emit('qr-code', yield src.jsonValue()); // qrData = base64 qr image
                    }
                }
            }));
            yield this.page.evaluate(() => {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.attributeName === 'data-qr-code') {
                            // @ts-ignore
                            window.onQrChange(mutation);
                        }
                    }
                });
                const img = document.querySelector("body > mw-app > mw-bootstrap > div > main > mw-authentication-container > div > div.content-container > div > div.qr-code-container > div.qr-code-wrapper > mw-qr-code");
                if (img) {
                    observer.observe(img, { attributes: true, childList: true, characterData: true });
                }
                return observer;
            });
            yield this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-authentication-container > div > div.content-container > div > div.qr-code-container > div.qr-code-wrapper > mw-qr-code > img');
            const img = yield this.page.$('body > mw-app > mw-bootstrap > div > main > mw-authentication-container > div > div.content-container > div > div.qr-code-container > div.qr-code-wrapper > mw-qr-code > img');
            if (img) {
                const src = yield img.getProperty('src');
                if (src) {
                    this.emit('qr-code', yield src.jsonValue());
                }
            }
        });
    }
    // WILL BE RELEASED SOON
    getCredentials() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitForFunction('!!localStorage.getItem("pr_backend_type")');
            const localStorageData = yield this.page.evaluate(() => {
                let data = {};
                Object.assign(data, window.localStorage);
                return data;
            });
            const cookiz = yield this.page.cookies();
            const creds = {
                cookies: cookiz,
                localStorage: localStorageData
            };
            return creds;
        });
    }
    setCredentials(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.setCookie(...credentials.cookies);
            yield this.page.evaluate((localStorageData) => {
                try {
                    localStorageData = JSON.parse(localStorageData);
                }
                catch (err) { }
                for (const key of Object.keys(localStorageData)) {
                    localStorage.setItem(key, localStorageData[key]);
                }
            }, JSON.stringify(credentials.localStorage));
            yield this.page.reload();
            return;
        });
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.browser.close();
        });
    }
}
exports.default = MessagesClient;
