/// <reference types="node" />
import { EventEmitter } from 'events';
import puppeteer from 'puppeteer';
import MessageService from './service';
interface ClientEvents {
    'authenticated': (service: MessageService) => void;
    'browser-launched': () => void;
    'qr-code': (base64Image: string) => void;
}
declare interface MessagesClient {
    on<U extends keyof ClientEvents>(event: U, listener: ClientEvents[U]): this;
    emit<U extends keyof ClientEvents>(event: U, ...args: Parameters<ClientEvents[U]>): boolean;
}
declare type ClientOptions = {
    headless?: boolean;
    credentials?: Credentials;
};
export declare type Credentials = {
    cookies: puppeteer.Protocol.Network.CookieParam[];
    localStorage: object;
};
declare class MessagesClient extends EventEmitter implements MessagesClient {
    private page;
    private browser;
    private isAuthenticated;
    constructor(options?: ClientOptions);
    static loadCredentialFile(path: string): Credentials;
    private launch;
    private attachReqTracer;
    private attachQrReader;
    getCredentials(): Promise<Credentials>;
    private setCredentials;
    quit(): Promise<void>;
}
export default MessagesClient;
