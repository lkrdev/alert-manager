import { ILookerConnection } from '@looker/embed-sdk';
import { IUser, Looker40SDK } from '@looker/sdk';
import { orderBy, reduce } from 'lodash';
import keyBy from 'lodash/keyBy';
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import useSdk from './hooks/useSdk';
import { IAlertAndDetail, IAlertDetail } from './types';
import DashboardFilter from './utils/dashboardFilter';

interface AppContextType {
    isLoading: boolean;
    me: IUser | undefined;
    getSearchParams: (global_filters?: boolean) => Record<string, string>;
    integrations:
        | {
              id: string;
              label?: string;
          }[]
        | undefined;
    updateSearchParams: (
        params: Record<string, string | undefined | null>
    ) => void;
    alerts:
        | {
              dashboard_id: string;
              dashboard_title: string;
              alerts: IAlertAndDetail[];
          }[]
        | undefined;
    loading_alerts: boolean;
    loadDashboard: (
        dashboard_id: string,
        filter?: DashboardFilter
    ) => Promise<void>;
    updateAlerts: () => void;
    selected_dashboard_id: string | undefined;
    embed_connection: ILookerConnection | undefined;
    setEmbedConnection: React.Dispatch<
        React.SetStateAction<ILookerConnection | undefined>
    >;
    selected_alert: IAlertAndDetail | undefined;
    loadAlert: (alert: IAlertAndDetail) => Promise<void>;
    resetSelectedAlert: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextHydrate = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const sdk = useSdk();
    const mounted = useRef(false);
    const history = useHistory();

    useEffect(() => {
        runHydrate();
    }, [sdk]);

    const [hydrated, setHydrated] = useState<
        IAlertAndDetail | undefined | null
    >(undefined);

    const runHydrate = async () => {
        if (mounted.current) {
            return;
        }
        const hydrateInvalid = () => {
            mounted.current = true;
            setHydrated(null);
        };
        const pathname = history.location.pathname;
        const alert_match = pathname.match(/^\/alert\/(.+)$/);
        const alert_id = alert_match ? alert_match[1] : null;
        if (alert_id) {
            try {
                const alert = await sdk.ok(sdk.get_alert(alert_id));
                if (alert?.id) {
                    const alert_details = await sdk.alert_details([alert.id]);
                    mounted.current = true;
                    setHydrated({
                        id: alert.id,
                        alert: alert,
                        details: alert_details[0],
                        _filter: DashboardFilter.fromAppliedDashboardFilters(
                            alert.applied_dashboard_filters
                        ),
                    });
                } else {
                    hydrateInvalid();
                }
            } catch (error) {
                console.error('Error hydrating alert:', error);
                hydrateInvalid();
                history.push('');
            }
        } else {
            hydrateInvalid();
        }
    };
    if (!mounted.current) {
        return <React.Fragment></React.Fragment>;
    } else {
        return (
            <>
                <AppContextProvider hydrated_alert={hydrated}>
                    {children}
                </AppContextProvider>
            </>
        );
    }
};

export const AppContextProvider: React.FC<{
    children: React.ReactNode;
    hydrated_alert: IAlertAndDetail | undefined | null;
}> = ({ children, hydrated_alert }) => {
    const [selected_dashboard_id, setSelectedDashboardId] = useState<
        string | undefined
    >(hydrated_alert?.details.dashboard_id);
    const [selected_alert, setSelectedAlert] = useState<
        IAlertAndDetail | undefined
    >(hydrated_alert || undefined);
    const [embed_connection, setEmbedConnection] = useState<
        ILookerConnection | undefined
    >(undefined);
    const location = useLocation();
    const sdk = useSdk();
    const { data: me, isLoading, error } = useSWR('me', () => sdk.ok(sdk.me()));

    const integrations_swr = useSWR(sdk ? 'integrations' : null, () =>
        getAllIntegrations(sdk)
    );

    const loadDashboard = async (
        dashboard_id: string,
        filter?: DashboardFilter
    ) => {
        if (embed_connection) {
            const filter_object = filter?.getFilter() || {};
            await embed_connection.loadDashboard({
                id: dashboard_id,
                params: filter_object,
            });
            if (selected_dashboard_id === dashboard_id) {
                await embed_connection
                    .asDashboardConnection()
                    .updateFilters(filter_object || {});
                await embed_connection.asDashboardConnection().run();
            }
        }
        setSelectedDashboardId(dashboard_id);
    };

    const loadAlert = async (alert_and_detail: IAlertAndDetail) => {
        setSelectedAlert(alert_and_detail);
        loadDashboard(
            alert_and_detail.details.dashboard_id,
            alert_and_detail._filter
        );
        history.push(`/alert/${alert_and_detail.id!}`);
    };

    const getAllAlertsAndDashboards = async (current_user: IUser) => {
        const alerts = await sdk.ok(sdk.search_alerts({ limit: 10000 }));
        const all_alert_ids = [...alerts.map((alert) => alert.id!)];
        const alert_details = await sdk.alert_details(all_alert_ids);
        const alert_details_keyed: Record<string, IAlertDetail> = keyBy(
            alert_details,
            'alert_id'
        );

        let all_alerts_and_details: {
            [dashboard_id: string]: {
                dashboard_id: string;
                dashboard_title: string;
                alerts: IAlertAndDetail[];
            };
        } = {};
        for (const alert of alerts) {
            const detail = alert_details_keyed[alert.id!]!;
            if (detail) {
                if (!all_alerts_and_details[detail.dashboard_id]) {
                    all_alerts_and_details[detail.dashboard_id] = {
                        dashboard_id: detail.dashboard_id,
                        dashboard_title: detail.dashboard_title,
                        alerts: [],
                    };
                }
                all_alerts_and_details[detail.dashboard_id].alerts.push({
                    id: alert.id!,
                    alert,
                    details: detail,
                    _filter: DashboardFilter.fromAppliedDashboardFilters(
                        alert.applied_dashboard_filters
                    ),
                    _is_current_user_owner: alert.owner_id === current_user.id,
                });
            }
        }
        return orderBy(
            Object.entries(all_alerts_and_details).map(
                ([dashboard_id, dashboard]) => ({
                    dashboard_id,
                    dashboard_title: dashboard.dashboard_title,
                    alerts: dashboard.alerts,
                })
            ),
            ['dashboard_title']
        ) as {
            dashboard_id: string;
            dashboard_title: string;
            alerts: IAlertAndDetail[];
        }[];
    };

    const all_alerts_and_dashboards_swr = useSWR(
        !me ? null : 'all_alerts_and_dashboards',
        () => getAllAlertsAndDashboards(me!)
    );

    const current_search_ref = useRef(
        Object.fromEntries(new URLSearchParams(location.search))
    );

    const history = useHistory();
    const getSearchParams = (global_filters?: boolean) => {
        const { sandboxed_host, sdk, _theme, ...global_filters_params } =
            current_search_ref.current;
        if (global_filters) {
            return global_filters_params;
        } else {
            return { ...global_filters_params };
        }
    };

    const updateSearchParams = (
        params: Record<string, string | undefined | null>
    ) => {
        const new_params = new URLSearchParams({
            ...getSearchParams(false),
        });
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                new_params.delete(key);
            } else {
                new_params.set(key, value);
            }
        });
        current_search_ref.current = Object.fromEntries(new_params);
        history.push({ search: new_params.toString() });
    };

    const resetSelectedAlert = () => {
        setSelectedAlert(undefined);
        setSelectedDashboardId(undefined);
        history.push(``);
        if (embed_connection) {
            embed_connection.preload();
        }
    };

    return (
        <AppContext.Provider
            value={{
                me,
                isLoading,
                getSearchParams,
                updateSearchParams,
                alerts: all_alerts_and_dashboards_swr.data,
                loading_alerts: all_alerts_and_dashboards_swr.isLoading,
                updateAlerts: () =>
                    all_alerts_and_dashboards_swr.mutate(
                        all_alerts_and_dashboards_swr.data
                    ),
                loadDashboard,
                selected_dashboard_id,
                embed_connection,
                setEmbedConnection,
                selected_alert,
                loadAlert,
                resetSelectedAlert,
                integrations: integrations_swr.data,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

const getAllIntegrations = async (sdk: Looker40SDK) => {
    const integrations = await sdk.ok(sdk.all_integrations({}));
    integrations[0].enabled;
    const ins = reduce(
        integrations,
        (acc, i) => {
            if (
                i.enabled &&
                (i.id?.endsWith('slack') || i.id?.endsWith('slack_legacy'))
            ) {
                acc.push({
                    id: i.id,
                    label: i.label,
                });
            }
            return acc;
        },
        [] as {
            id: string;
            label?: string;
        }[]
    );
    return [
        ...ins,
        {
            id: 'email',
            label: 'Email',
        },
    ];
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error(
            'useAppContext must be used within an AppContextProvider'
        );
    }
    return context;
};
