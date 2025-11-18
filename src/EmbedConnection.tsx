import { Card } from '@looker/components';
import {
    getEmbedSDK,
    IEmbedBuilder,
    ILookerConnection,
} from '@looker/embed-sdk';
import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useBoolean } from 'usehooks-ts';
import { useAppContext } from './AppContext';
import useExtensionSdk from './hooks/useExtensionSdk';

const StyledCard = styled(Card)<{
    iframe_visible?: boolean;
}>`
    width: 100%;
    height: 100%;
    & > iframe {
        visibility: ${({ iframe_visible }) =>
            iframe_visible ? 'visible' : 'hidden'};
        width: 100%;
        height: 100%;
    }
`;

const EmbedConnection: React.FC = () => {
    const extension_sdk = useExtensionSdk();
    const iframe_visible = useBoolean(false);
    const { setEmbedConnection, selected_alert } = useAppContext();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // if there are errors and we dont see dashboard:loaded event, show iframe anyway
        timeoutRef.current = setTimeout(() => {
            iframe_visible.setTrue();
        }, 5000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const dashboardRef = useCallback(
        (el: HTMLDivElement) => {
            if (extension_sdk && el && !el.children.length) {
                getEmbedSDK().init(extension_sdk.lookerHostData?.hostUrl!);
                let embed_sdk: IEmbedBuilder | null = null;
                if (selected_alert?.details.dashboard_id?.length) {
                    embed_sdk = getEmbedSDK()
                        .createDashboardWithId(
                            selected_alert.details.dashboard_id
                        )
                        .withParams({
                            ...selected_alert._filter.getFilter(),
                        });
                } else {
                    embed_sdk = getEmbedSDK().preload();
                }

                embed_sdk
                    .appendTo(el)
                    .build()
                    .connect({ waitUntilLoaded: true })
                    .then((connection: ILookerConnection) => {
                        setEmbedConnection(connection);
                    })
                    .catch((error: any) => {
                        console.error('Error embedding dashboard:', error);
                    });
            }
        },
        [extension_sdk]
    );
    return (
        <StyledCard
            raised
            borderRadius="large"
            ref={dashboardRef}
            iframe_visible={iframe_visible.value}
        />
    );
};

export default EmbedConnection;
