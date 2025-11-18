import { ExtensionContext } from '@looker/extension-sdk-react';
import { Looker40SDK } from '@looker/sdk';
import { useContext } from 'react';
import { IAlertDetail } from '../types';

export default function useSdk() {
    const context = useContext(ExtensionContext);

    if (!context) {
        throw new Error('useSdk must be used within a LookerExtensionProvider');
    }

    let sdk = context.core40SDK;
    sdk.alert_details = async (alert_ids: string[]) => {
        const alert_details = await sdk.authSession.transport.rawRequest(
            'GET',
            '/alert_details',
            {
                alert_ids: alert_ids,
            }
        );
        const alert_details_body = JSON.parse(
            alert_details.body
        ) as IAlertDetail[];
        return alert_details_body;
    };
    return sdk as Looker40SDK & {
        alert_details: (alert_ids: string[]) => Promise<IAlertDetail[]>;
    };
}
