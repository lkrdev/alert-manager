import {
    Card,
    Divider,
    Heading,
    Paragraph,
    SpaceVertical,
} from '@looker/components';
import React from 'react';
import { useAppContext } from '../../AppContext';
import DashboardTitle from '../DashboardTitle';
import ProgressIndicator from '../ProgressIndicator';
import AlertItem from './AlertItem';
import EditingWrapper from './Editing';

const Sidebar: React.FC = () => {
    const { alerts, loading_alerts, loadDashboard, selected_alert, loadAlert } =
        useAppContext();

    return (
        <Card
            as={SpaceVertical}
            raised
            borderRadius="large"
            p="xxsmall"
            backgroundColor="#FFF"
        >
            <Heading p="xsmall">Alert Manager</Heading>
            <ProgressIndicator show={loading_alerts} />
            <SpaceVertical
                width="100%"
                gap="xsmall"
                overflowY={'auto'}
                flexGrow={1}
            >
                {selected_alert ? (
                    <EditingWrapper editing_alert={selected_alert} />
                ) : (
                    <>
                        {alerts?.map((dashboard_alerts, index) => (
                            <SpaceVertical
                                key={dashboard_alerts.dashboard_id}
                                gap="none"
                                px="xsmall"
                                py="none"
                                m="none"
                            >
                                <DashboardTitle
                                    title={dashboard_alerts.dashboard_title}
                                    dashboard_id={dashboard_alerts.dashboard_id}
                                />
                                {dashboard_alerts.alerts.map((alert) => (
                                    <AlertItem
                                        key={alert.id}
                                        alert_detail={alert}
                                        canLoadAlert={() => true}
                                        onCannotLoadAlert={() => {}}
                                    />
                                ))}

                                <Divider
                                    color="keySubtle"
                                    style={{
                                        display:
                                            index === alerts.length - 1
                                                ? 'none'
                                                : undefined,
                                    }}
                                />
                            </SpaceVertical>
                        ))}
                    </>
                )}
                {!loading_alerts && !alerts?.length && (
                    <Paragraph fontSize="xxsmall" width="100%">
                        No alerts found, please create an alert to get started
                    </Paragraph>
                )}
            </SpaceVertical>
        </Card>
    );
};

export default Sidebar;
