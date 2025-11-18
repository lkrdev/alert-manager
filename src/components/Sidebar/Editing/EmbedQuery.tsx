import { Card } from '@looker/components';
import { getEmbedSDK, ILookerConnection } from '@looker/embed-sdk';
import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useEditingContext } from './Context';

interface EmbedQueryProps {
    slug?: string;
}

const StyledCard = styled(Card)`
    width: 100%;
    height: 250px;
    & > iframe {
        height: 100%;
        width: 100%;
    }
`;

const EmbedQuery: React.FC<EmbedQueryProps> = ({ slug }) => {
    const { query_connection, setQueryConnection } = useEditingContext();
    const mounted = useRef(false);

    useEffect(() => {
        if (query_connection && mounted.current) {
            if (slug) {
                query_connection.loadQueryVisualization({
                    id: slug!,
                });
            } else {
                query_connection.preload();
            }
        }
    }, [query_connection, slug, mounted.current]);

    const embedRef = useCallback((el: HTMLDivElement) => {
        if (el && !mounted.current) {
            mounted.current = true;
            const embed = getEmbedSDK().preload();
            embed
                .appendTo(el)
                .build()
                .connect({ waitUntilLoaded: true })
                .then((connection: ILookerConnection) => {
                    setQueryConnection(connection);
                });
        }
    }, []);
    return <StyledCard raised ref={embedRef} />;
};

export default EmbedQuery;
