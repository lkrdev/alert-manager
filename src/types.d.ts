import { IAlert } from '@looker/sdk';
import DashboardFilter from './utils/dashboardFilter';

type GlobalFilters = { [key: string]: string };

interface AlertSyncHistory {
    created_at: string | null;
    action: string | null;
    dashboard_id: string;
    dashboard_title: string;
}

type AlertHistoryItem = Record<string, unknown>;

interface IAlertDetail {
    id?: string;
    alert_id: string;
    dashboard_title: string;
    dashboard_id: string;
    dashboard_url: string;
    query_slug: string;
    model: string;
    view: string;
    average_runtime: number | null;
    alert_history_items: AlertHistoryItem[];
    latest_alert_sync_history: AlertSyncHistory | null;
}

interface IAlertAndDetail {
    id?: string;
    alert: IAlert;
    details: IAlertDetail;
    _filter: DashboardFilter;
    _is_current_user_owner?: boolean;
}

declare module '@looker/sdk' {
    interface Looker40SDK {
        alert_details: (alert_ids: string[]) => Promise<IAlertDetail[]>;
    }
}

interface DashboardFiltersChangedEventDashboardLayoutComponent {
    id: string;
    dashboard_layout_id: string;
    dashboard_element_id: string;
    row: number;
    column: number;
    width: number;
    height: number;
    deleted: boolean;
}

interface DashboardFiltersChangedEventDashboardLayout {
    id: string;
    dashboard_id: string;
    type: string;
    active: boolean;
    column_width: number | null;
    width: number | null;
    deleted: boolean;
    dashboard_layout_components: DashboardFiltersChangedEventDashboardLayoutComponent[];
    label: string | null;
    description: string | null;
    order: number;
}

interface DashboardFiltersChangedEventDashboardElement {
    title: string;
    title_hidden: boolean;
    vis_config: Record<string, unknown>;
}

interface DashboardFiltersChangedEventDashboardOptions {
    layouts: DashboardFiltersChangedEventDashboardLayout[];
    elements: Record<string, DashboardFiltersChangedEventDashboardElement>;
}

interface DashboardFiltersChangedEventDashboardInfo {
    id: string;
    title: string;
    canEdit: boolean;
    absoluteUrl: string;
    url: string;
    dashboard_filters: Record<string, string>;
    options: DashboardFiltersChangedEventDashboardOptions;
}

interface DashboardFiltersChangedEvent {
    type: 'dashboard:filters:changed';
    dashboard: DashboardInfo;
}
