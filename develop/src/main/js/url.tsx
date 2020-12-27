
export default class UrlMap {
    private constructor() {}

    static readonly ROOMID_PARAM_NAME = 'roomID';

    static inputNameUrl(): string {
        return '/enter';
    }
    static generateInputNameUrl(roomId: string): string {
        return `/enter?${UrlMap.ROOMID_PARAM_NAME}=${roomId}`;
    }

    static readonly ROOMID_URI_VARIABLE_NAME = 'roomId';
    static playingUrl(): string {
        return `/play/:${UrlMap.ROOMID_URI_VARIABLE_NAME}`;
    }
    static generatePlayingUrl(roomId: string): string {
        return `/play/${roomId}`;
    }

};