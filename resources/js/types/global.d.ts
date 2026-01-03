
import { AxiosInstance } from 'axios';
import ziggyRoute from 'ziggy-js';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        axios: AxiosInstance;
        appLocale: string;
        Echo: Echo;
        Pusher: typeof Pusher;
    }

    var route: typeof ziggyRoute;
}
