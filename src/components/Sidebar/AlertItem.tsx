import {
    Box,
    ButtonBase,
    Grid,
    Header,
    Icon,
    IconButton,
    Paragraph,
    Space,
    SpaceVertical,
    Spinner,
} from '@looker/components';
import { CopyAll, Delete } from '@styled-icons/material';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../AppContext';
import useSdk from '../../hooks/useSdk';
import { IAlertAndDetail } from '../../types';
import { getAlertTitle, getOperator } from '../../utils/alertTitle';
import DashboardFilter from '../../utils/dashboardFilter';
import { useToast } from '../Toast/ToastContext';

interface AlertItemProps {
    alert_detail: IAlertAndDetail;
    hideActions?: boolean;
    canLoadAlert: () => boolean;
    onCannotLoadAlert: () => void;
    updateTitleButton?: React.ReactNode;
}

const StyledButtonBase = styled(ButtonBase)<{ selected: boolean }>`
    &:hover .icon-actions {
        visibility: visible;
    }
    & .icon-actions {
        visibility: hidden;
    }
    background-color: ${({ selected, theme }) => {
        return selected ? theme?.colors?.keySubtle : undefined;
    }};
`;

const AlertItem: React.FC<AlertItemProps> = ({
    alert_detail,
    hideActions = false,
    canLoadAlert,
    onCannotLoadAlert,
    updateTitleButton,
}) => {
    const { alert } = alert_detail;
    const alertTitle = getAlertTitle(alert);
    const { selected_alert, loadAlert, me, updateAlerts, resetSelectedAlert } =
        useAppContext();
    const [duplicating, setDuplicating] = useState(false);
    const sdk = useSdk();
    const { showError, showSuccess } = useToast();

    const handleDuplicate = async () => {
        setDuplicating(true);
        try {
            const r = await sdk.ok(
                sdk.create_alert({
                    ...alert,
                    owner_id: me!.id!,
                })
            );
            if (r.id) {
                updateAlerts();
                loadAlert({
                    id: r.id,
                    alert: r,
                    details: alert_detail.details,
                    _filter: DashboardFilter.fromAppliedDashboardFilters(
                        r.applied_dashboard_filters
                    ),
                    _is_current_user_owner: true,
                } as IAlertAndDetail);
                showSuccess('Alert duplicated');
            }
        } catch (error) {
            showError('Failed to duplicate alert');
            console.error('Error duplicating alert:', error);
        } finally {
            setDuplicating(false);
        }
    };

    const handleDelete = async () => {
        try {
            await sdk.ok(sdk.delete_alert(alert.id!));
            updateAlerts();
            if (selected_alert?.id === alert.id) {
                resetSelectedAlert();
            }
            showSuccess('Alert deleted');
        } catch (error) {
            showError('Failed to delete alert');
            console.error('Error deleting alert:', error);
        }
    };

    return (
        <StyledButtonBase
            as="li"
            selected={selected_alert?.id === alert.id}
            style={{
                display: 'flex',
                cursor: 'pointer',
                padding: '8px 4px',
                width: '100%',
            }}
            onClick={() => {
                if (canLoadAlert()) {
                    loadAlert(alert_detail);
                } else {
                    onCannotLoadAlert();
                }
            }}
        >
            <Space gap="xxsmall" align="start" width="100%">
                <SpaceVertical flexGrow={1} gap="xxsmall">
                    <Header as="h6" m="none">
                        {alertTitle}
                        {updateTitleButton}
                    </Header>
                    <Box width="100%" pl={'small'}>
                        {alert.field && (
                            <Paragraph
                                style={{ pointerEvents: 'none' }}
                                color="key"
                                fontSize="xsmall"
                                title={alert.field.name}
                            >
                                Field: {alert.field.title || alert.field.name}
                            </Paragraph>
                        )}
                        {alert.comparison_type && (
                            <Paragraph
                                style={{ pointerEvents: 'none' }}
                                color="key"
                                fontSize="xsmall"
                            >
                                Comparison: {getOperator(alert.comparison_type)}
                            </Paragraph>
                        )}
                        {alert.threshold !== undefined && (
                            <Paragraph
                                style={{ pointerEvents: 'none' }}
                                color="key"
                                fontSize="xsmall"
                            >
                                Threshold: {String(alert.threshold)}
                            </Paragraph>
                        )}
                        {alert.owner_display_name?.length && (
                            <Paragraph
                                style={{ pointerEvents: 'none' }}
                                color="key"
                                fontSize="xsmall"
                            >
                                Owner: {alert.owner_display_name}
                            </Paragraph>
                        )}
                        {alert.is_disabled && (
                            <Paragraph
                                fontStyle="italic"
                                fontSize="xsmall"
                                color="critical"
                            >
                                Disabled
                            </Paragraph>
                        )}
                        {!alert.field &&
                            alert.threshold === undefined &&
                            !alert.comparison_type && (
                                <Paragraph
                                    fontStyle="italic"
                                    fontSize="xsmall"
                                    color="warning"
                                >
                                    No alert details
                                </Paragraph>
                            )}
                    </Box>
                </SpaceVertical>
                {hideActions ? (
                    <></>
                ) : (
                    <Grid
                        columns={1}
                        gap="none"
                        flexGrow={0}
                        width="auto"
                        className="icon-actions"
                    >
                        <IconButton
                            icon={<Delete />}
                            label={`Delete alert`}
                            size="small"
                            disabled={duplicating}
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete();
                            }}
                        />
                        <IconButton
                            icon={
                                duplicating ? (
                                    <Spinner size={16} />
                                ) : (
                                    <Icon
                                        size="medium"
                                        icon={<CopyAll size={24} />}
                                    />
                                )
                            }
                            label="Duplicate Alert"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDuplicate();
                            }}
                            disabled={duplicating}
                            size="small"
                        />
                    </Grid>
                )}
            </Space>
        </StyledButtonBase>
    );
};

export default AlertItem;
