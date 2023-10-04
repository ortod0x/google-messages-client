import puppeteer from 'puppeteer'

type Conversation = {
    unread: boolean, 
    id: number,
    timestamp: string, 
    from: string, 
    latestMsgText: string
}
class MessageService {
    private page: puppeteer.Page
    constructor (page: puppeteer.Page) {
        this.page = page
    }

    async getInbox() {
        // TODO: add pagination
        await this.page.waitForNavigation({ waitUntil: 'load' })
        await this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item')

        const inbox = await this.page.evaluate(() => {
            function evalConvoElement (conversation: Element) {
                const props: Conversation = {
                    unread: false, // querySelector find .unread class
                    id: 0, // href of a tag
                    timestamp: '', // mws-relative-timestamp .innerText || > ..ng-star-inserted').getAttribute('aria-label') if latest message
                    from: '', // querySelector('h3').innerText
                    latestMsgText: '' // querySelector('mws-conversation-snippet').innerText
                }
                props.unread = conversation.querySelector('.unread') ? true : false
                
                const regex = /conversations\/(\d{1,})/g
                const chatUrl = conversation.querySelector('a').href
                props.id = parseInt(chatUrl.match(regex)[0].split('conversations/')[1])
                
                if (conversation.querySelector('mws-relative-timestamp').childElementCount > 0) {
                    props.timestamp = conversation.querySelector('mws-relative-timestamp > .ng-star-inserted').getAttribute('aria-label')
                } else {
                    props.timestamp = (conversation.querySelector('mws-relative-timestamp') as HTMLElement).innerText
                }

                props.from = conversation.querySelector('h3').innerText
                props.latestMsgText = (conversation.querySelector('mws-conversation-snippet') as HTMLElement).innerText
                if (props.latestMsgText.startsWith('You:')) {
                    props.latestMsgText = props.latestMsgText.slice('You:'.length).trim()
                }
                return props
            }

            const conversations = document.querySelectorAll("body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item")
            const msgs = []
            for (const conversation of conversations) {
                if (conversation) {
                    msgs.push(evalConvoElement(conversation))
                }
            }
            return msgs
        })
        return inbox
    }

    async sendMessage (to: string, text: string) {
        await this.page.waitForNavigation({ waitUntil: 'load' });
        await this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > mws-conversations-list > nav > div.conv-container.ng-star-inserted > mws-conversation-list-item');

        const newChatBtn = await this.page.$('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-main-nav > div > mw-fab-link > a');
        await newChatBtn.click();
        await this.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await this.page.waitForSelector('body > mw-app > mw-bootstrap > div > main > mw-main-container > div > mw-new-conversation-container > mw-new-conversation-sub-header');

        let numberInput = await this.page.$('.input');
        await numberInput.type(to);
        await this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-new-conversation-container/div/mw-contact-selector-button/button');
        const contactBtn = await this.page.$x('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-new-conversation-container/div/mw-contact-selector-button/button');
        await contactBtn[0].click();
        await this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div/div[1]/div/mws-message-compose/div/div[2]/div/div/mws-autosize-textarea/textarea');
        let msgInput = await this.page.$('.input');
        await msgInput.type(text);
        await this.page.waitForXPath('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div/div[1]/div/mws-message-compose/div/div[2]/div/div/mws-message-send-button/div/mw-message-send-button/button');
        let sendBtn = await this.page.$x('/html/body/mw-app/mw-bootstrap/div/main/mw-main-container/div/mw-conversation-container/div/div[1]/div/mws-message-compose/div/div[2]/div/div/mws-message-send-button/div/mw-message-send-button/button');
        sendBtn[0].click();
        return;
    }
}

export default MessageService
