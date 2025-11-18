import { Box } from '@looker/components';
import React, { useEffect, useRef } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useAppContext } from './AppContext';
import LkrLoading from './components/LkrLoading';
import Sidebar from './components/Sidebar';
import useConfigContext from './ConfigContext';
import Dashboard from './EmbedConnection';

const App: React.FC = () => {
    const { isLoading, me } = useAppContext();
    const initial_wait = useBoolean(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            initial_wait.setFalse();
        }, 1000);
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const {
        config: { remove_branded_loading, background_color },
    } = useConfigContext();

    if (isLoading || (initial_wait.value && !Boolean(remove_branded_loading))) {
        return (
            <Box
                height="100vh"
                width="100vw"
                display="flex"
                justifyContent="center"
                alignItems="center"
                backgroundColor={background_color}
            >
                {!Boolean(remove_branded_loading) && (
                    <LkrLoading duration={750} />
                )}
            </Box>
        );
    } else if (me) {
        return (
            <>
                <Box
                    p="medium"
                    display="grid"
                    height="100%"
                    backgroundColor={background_color}
                    style={{ gridTemplateColumns: '350px 1fr', gap: '8px' }}
                >
                    <Sidebar />
                    <Dashboard />
                </Box>
            </>
        );
    } else {
        return <Box>Unknown error</Box>;
    }
};

export default App;
