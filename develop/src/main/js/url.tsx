
export default class UrlMap {
    private constructor() {}

    static readonly ROOMID_PARAM_NAME = 'roomID';
    static readonly REPOSITORY_PATH = '/neu-react';

    static inputNameUrl(): string {
        return UrlMap.REPOSITORY_PATH + '/enter';
    }
    static generateInputNameUrl(roomId: string): string {
        return UrlMap.REPOSITORY_PATH + `/enter?${UrlMap.ROOMID_PARAM_NAME}=${roomId}`;
    }

    static readonly ROOMID_URI_VARIABLE_NAME = 'roomId';
    static playingUrl(): string {
        return UrlMap.REPOSITORY_PATH + `/play/:${UrlMap.ROOMID_URI_VARIABLE_NAME}`;
    }
    static generatePlayingUrl(roomId: string): string {
        return UrlMap.REPOSITORY_PATH + `/play/${roomId}`;
    }

};