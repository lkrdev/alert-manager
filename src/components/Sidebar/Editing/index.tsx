import {
    ButtonTransparent,
    Divider,
    Link,
    Paragraph,
    Space,
    SpaceVertical,
} from '@looker/components';
import { find, omit, reduce } from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '../../../AppContext';
import useSdk from '../../../hooks/useSdk';
import { DashboardFiltersChangedEvent, IAlertAndDetail } from '../../../types';
import { getAlertTitle } from '../../../utils/alertTitle';
import DashboardTitle from '../../DashboardTitle';
import LoadingButton from '../../LoadingButton';
import { useToast } from '../../Toast/ToastContext';
import AlertItem from '../AlertItem';
import { EditingContextProvider, useEditingContext } from './Context';
import DetailsPopover from './DetailsDialog';
import UpdateTitle from './UpdateTitle';

const EditingBase: React.FC = () => {
    const { current_alert, dirty, saving, resetFilters } = useEditingContext();

    const {
        alerts,
        resetSelectedAlert,
        embed_connection,
        updateAlerts,
        me,
        loadAlert,
    } = useAppContext();
    const sdk = useSdk();
    const { showError, showSuccess } = useToast();

    const current_dashoard = find(alerts, {
        dashboard_id: current_alert?.details.dashboard_id,
    });

    useEffect(() => {
        if (!embed_connection) {
            return;
        }
        const handlers = (embed_connection as any)._embedClient._host._handlers;

        if (handlers && current_alert) {
            const handler = (event: DashboardFiltersChangedEvent) => {
                current_alert._filter.updateFromDashboardChange(
                    event.dashboard.absoluteUrl
                );
                if (current_alert._filter.isDirty()) {
                    dirty.setTrue();
                } else {
                    dirty.setFalse();
                }
            };

            handlers['dashboard:filters:changed'] = [handler];

            // Cleanup: remove the event listener when component unmounts or connection changes
            return () => {
                if (handlers) {
                    handlers['dashboard:filters:changed'] = [];
                }
            };
        }
    }, [embed_connection, current_alert]);

    const other_dashboard_alerts = useMemo(
        () =>
            reduce(
                current_dashoard?.alerts,
                (acc, alert) => {
                    if (current_alert?.id === alert.id) {
                        return acc;
                    } else if (
                        current_alert?._filter.compareFilter(alert._filter)
                    ) {
                        acc.matching_filters.push(alert);
                    } else {
                        acc.rest.push(alert);
                    }
                    return acc;
                },
                { matching_filters: [], rest: [] } as {
                    matching_filters: IAlertAndDetail[];
                    rest: IAlertAndDetail[];
                }
            ),
        [current_alert, current_dashoard]
    );

    const stopEditing = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        resetSelectedAlert();
    };

    const saveFilters = async () => {
        if (!current_alert) return;
        if (!me?.email?.length) {
            return console.error('No email found for current user');
        }
        saving.setTrue();
        if (current_alert._is_current_user_owner) {
            const { success, error, alert } =
                await current_alert._filter.copyAndSave(
                    sdk,
                    current_alert.alert,
                    me.email
                );
            if (success) {
                try {
                    await sdk.ok(sdk.unfollow_alert(current_alert.alert.id!));
                    showSuccess('New alert created with new filters');
                } catch (error) {
                    console.error(error);
                }
                dirty.setFalse();
            } else {
                showError(error || 'Failed to save filters');
            }
            saving.setFalse();
        } else {
            const { success, error } = await current_alert._filter.save(
                sdk,
                current_alert.alert
            );
            if (success) {
                updateAlerts();
                dirty.setFalse();
                showSuccess('New filters saved');
            } else {
                showError(error || 'Failed to save filters');
            }
        }
        saving.setFalse();
    };

    if (!current_alert) {
        return null;
    } else {
        return (
            <SpaceVertical gap="none" width="100%">
                <SpaceVertical gap="xsmall" width="100%">
                    <DashboardTitle
                        title={current_alert.details.dashboard_title}
                        dashboard_id={current_alert.details.dashboard_id}
                    >
                        {'( '}
                        <Link href="#" onClick={stopEditing}>
                            {'Back'}
                        </Link>
                        {' )'}
                    </DashboardTitle>
                    <Divider color="keySubtle" />
                </SpaceVertical>
                <SpaceVertical
                    gap="xsmall"
                    flexGrow={1}
                    width="100%"
                    overflowY={'auto'}
                >
                    <Paragraph fontSize="small" width="100%">
                        Selected Alert:
                    </Paragraph>
                    <AlertItem
                        alert_detail={current_alert}
                        canLoadAlert={() => true}
                        onCannotLoadAlert={() => {}}
                        updateTitleButton={
                            <UpdateTitle
                                title={
                                    current_alert.alert.custom_title ||
                                    undefined
                                }
                                placeholder_title={getAlertTitle(
                                    omit(current_alert.alert, 'custom_title')
                                )}
                                alert={current_alert.alert}
                            />
                        }
                    />
                    <Space width="100%" gap="xsmall">
                        <ButtonTransparent
                            onClick={resetFilters}
                            size="small"
                            color="neutral"
                            disabled={!dirty.value || saving.value}
                        >
                            Reset Filters
                        </ButtonTransparent>
                        <LoadingButton
                            is_loading={saving.value}
                            onClick={saveFilters}
                            disabled={!dirty.value || saving.value}
                            size="small"
                            color="neutral"
                        >
                            {current_alert._is_current_user_owner
                                ? 'Save new alert'
                                : 'Save filters'}
                        </LoadingButton>
                        <DetailsPopover alert_detail={current_alert} />
                    </Space>
                    <Divider color="keySubtle" />
                    <Paragraph fontSize="small" width="100%">
                        Alerts with similar filters:
                    </Paragraph>
                    {other_dashboard_alerts.matching_filters.map((alert) => (
                        <AlertItem
                            key={alert.id}
                            alert_detail={alert}
                            canLoadAlert={() =>
                                !current_alert._filter.isDirty()
                            }
                            onCannotLoadAlert={() => {
                                showError(
                                    'Cannot change alert, please reset filters'
                                );
                            }}
                        />
                    ))}
                    {!other_dashboard_alerts.matching_filters.length && (
                        <Paragraph fontSize="xxsmall" width="100%">
                            No alerts with similar filters found
                        </Paragraph>
                    )}

                    <Divider color="keySubtle" />
                    <Paragraph fontSize="small" width="100%">
                        Alerts with different filters:
                    </Paragraph>
                    {other_dashboard_alerts.rest.map((alert) => (
                        <AlertItem
                            key={alert.id}
                            alert_detail={alert}
                            canLoadAlert={() =>
                                !current_alert._filter.isDirty()
                            }
                            onCannotLoadAlert={() => {
                                showError(
                                    'Cannot change alert, please reset filters'
                                );
                            }}
                        />
                    ))}
                    {!other_dashboard_alerts.rest.length && (
                        <Paragraph fontSize="xxsmall" width="100%">
                            No alerts with different filters found
                        </Paragraph>
                    )}
                </SpaceVertical>
            </SpaceVertical>
        );
    }
};

const Editing: React.FC<{
    editing_alert?: IAlertAndDetail;
}> = ({ editing_alert }) => {
    return (
        <EditingContextProvider editing_alert={editing_alert}>
            <EditingBase />
        </EditingContextProvider>
    );
};

export default Editing;
