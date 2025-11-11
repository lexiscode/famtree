
import { AxiosInstance } from 'axios';
import ziggyRoute from 'ziggy-js';

declare global {
    interface Window {
        axios: AxiosInstance;
        appLocale: string;
    }

    var route: typeof ziggyRoute;
}
