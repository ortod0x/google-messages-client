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
Object.defineProperty(exports, "__esModule", { value: true });
class MessageService {
    constructor(page) {
        this.page = page;
    }
    getInbox() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: add pagination
            yield this.page.waitForNavigation({ waitUntil: 'load' });
            yield this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item');
            const inbox = yield this.page.evaluate(() => {
                function evalConvoElement(conversation) {
                    const props = {
                        unread: false,
                        id: 0,
                        timestamp: '',
                        from: '',
                        latestMsgText: '' // querySelector('mws-conversation-snippet').innerText
                    };
                    props.unread = conversation.querySelector('.unread') ? true : false;
                    const regex = /conversations\/(\d{1,})/g;
                    const chatUrl = conversation.querySelector('a').href;
                    props.id = parseInt(chatUrl.match(regex)[0].split('conversations/')[1]);
                    if (conversation.querySelector('mws-relative-timestamp').childElementCount > 0) {
                        props.timestamp = conversation.querySelector('mws-relative-timestamp > .ng-star-inserted').getAttribute('aria-label');
                    }
                    else {
                        props.timestamp = conversation.querySelector('mws-relative-timestamp').innerText;
                    }
                    props.from = conversation.querySelector('h3').innerText;
                    props.latestMsgText = conversation.querySelector('mws-conversation-snippet').innerText;
                    if (props.latestMsgText.startsWith('You:')) {
                        props.latestMsgText = props.latestMsgText.slice('You:'.length).trim();
                    }
                    return props;
                }
                const conversations = document.querySelectorAll("body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item");
                const msgs = [];
                for (const conversation of conversations) {
                    if (conversation) {
                        msgs.push(evalConvoElement(conversation));
                    }
                }
                return msgs;
            });
            return inbox;
        });
    }
    sendMessage(to, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            }
            catch (err) {
                // Empty loader attached for immediate requests
                // if this function is called after few seconds/after after content loaded
                // then its no issue else this will go in an exception because nothing is loading
            }
            yield this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item');
            // TODO: parse to var to check if country code is included or not
            const newChatBtn = yield this.page.$('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > div > mw-fab-link > a');
            yield newChatBtn.click();
            yield this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
            // await page.waitForSelector()
            // const numberInput = await page.$eval('#mat-chip-list-2 > div > input', (input) => {
            //     console.log(input)
            // })
            // const numberInput = await page.$('#mat-chip-list-2 > div > input')
            try {
                yield this.page.waitForXPath('//*[@id="mat-chip-list-0"]/div/input', { timeout: 5000 });
            }
            catch (err) { }
            // await page.waitForTimeout(2 * 1000) // remove lateer
            // await this.page.waitForXPath('//*[@id="mat-chip-list-0"]/div/input')
            let numberInput = yield this.page.$x('//*[@id="mat-chip-list-0"]/div/input');
            // console.log('NumberInput', numberInput)
            if (numberInput.length) {
                yield numberInput[0].type(to);
                // numberInput.type(String.fromCharCode(13))
                yield this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-new-conversation-container/div/mw-contact-selector-button/button');
                const contactBtn = yield this.page.$x('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-new-conversation-container/div/mw-contact-selector-button/button');
                yield contactBtn[0].click();
            }
            // await page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-conversation-container > div.container.ng-tns-c39-541.ng-star-inserted > div > mws-message-compose > div > div.input-box > div > mws-autosize-textarea > textarea', { visible: true })
            try {
                yield this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div[1]/div/mws-message-compose/div/div[2]/div/mws-autosize-textarea/textarea');
            }
            catch (err) { }
            // await page.waitForTimeout(2 * 1000) // remove lateer
            let msgInput = yield this.page.$x('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div[1]/div/mws-message-compose/div/div[2]/div/mws-autosize-textarea/textarea');
            // console.log('MsgINput', msgInput)
            if (msgInput.length) {
                yield msgInput[0].type(text);
                yield this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div[1]/div/mws-message-compose/div/div[2]/div/mws-message-send-button/button');
                let sendBtn = yield this.page.$x('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div[1]/div/mws-message-compose/div/div[2]/div/mws-message-send-button/button');
                yield sendBtn[0].click();
            }
            else {
                this.page.reload();
                console.warn('retrying...');
                this.sendMessage(to, text);
            }
            // TODO: return messageId
            return;
        });
    }
}
exports.default = MessageService;
