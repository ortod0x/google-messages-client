import puppeteer from 'puppeteer';
declare type Conversation = {
    unread: boolean;
    id: number;
    timestamp: string;
    from: string;
    latestMsgText: string;
};
declare class MessageService {
    private page;
    constructor(page: puppeteer.Page);
    getInbox(): Promise<Conversation[]>;
    sendMessage(to: string, text: string): Promise<void>;
}
export default MessageService;
