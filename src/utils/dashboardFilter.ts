import { DestinationType, IAlert, Looker40SDK } from '@looker/sdk';
import { filter, map, reduce } from 'lodash';
import stringify from 'safe-stable-stringify';

type FilterValue = string;

class DashboardFilter {
    private initialFilter: Record<string, FilterValue>;
    private onChangeCallbacks: ((
        filter: Record<string, FilterValue>
    ) => void)[];

    constructor(private filter: Record<string, FilterValue>) {
        Object.entries(filter).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                this.filter[key] = '';
            }
        });
        this.initialFilter = { ...this.filter };
        this.onChangeCallbacks = [];
    }

    public static fromAppliedDashboardFilters(
        appliedDashboardFilters: IAlert['applied_dashboard_filters']
    ): DashboardFilter {
        const filter = reduce(
            appliedDashboardFilters,
            (acc, filter) => {
                if (filter.filter_title) {
                    acc[filter.filter_title] = String(
                        filter.filter_value || ''
                    );
                }
                return acc;
            },
            {} as Record<string, FilterValue>
        );
        return new DashboardFilter(filter);
    }

    public getSortedKey(version: 'initial' | 'current'): string {
        return stringify(
            version === 'initial' ? this.initialFilter : this.filter
        );
    }
    public getFilter(initial: boolean = false): Record<string, string> {
        return initial ? this.initialFilter : this.filter;
    }

    public isDirty(): boolean {
        return this.getSortedKey('current') !== this.getSortedKey('initial');
    }

    public getInitialKey(): string {
        return btoa(stringify(this.initialFilter) as string);
    }

    public toSearchParams(): URLSearchParams {
        const params = new URLSearchParams(
            Object.entries(this.filter).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = String(value);
                }
                return acc;
            }, {} as Record<string, string>)
        );
        return params;
    }

    public registerCallback(
        callback: (filter: Record<string, FilterValue>) => void
    ): number {
        this.onChangeCallbacks.push(callback);
        return this.onChangeCallbacks.length - 1;
    }

    public unregisterCallback(index: number): void {
        this.onChangeCallbacks.splice(index, 1);
    }

    public compareFilter(
        filter: DashboardFilter,
        {
            this_version = 'current',
            compare_version = 'current',
        }: {
            this_version?: 'initial' | 'current';
            compare_version?: 'initial' | 'current';
        } = {}
    ): boolean {
        return (
            this.getSortedKey(this_version) ===
            filter.getSortedKey(compare_version)
        );
    }

    public updateFromDashboardChange(full_url: string): void {
        const url = new URL(full_url);
        const params = url.searchParams;
        const filter = Object.fromEntries(params.entries());
        this.filter = { ...filter };
        this.onChangeCallbacks.forEach((callback) => {
            if (callback) {
                callback(this.filter);
            }
        });
    }

    public reset(): void {
        this.filter = { ...this.initialFilter };
        this.onChangeCallbacks.forEach((callback) => {
            if (callback) {
                callback(this.filter);
            }
        });
    }

    public async copyAndSave(
        sdk: Looker40SDK,
        alert: IAlert,
        current_user_email: string
    ): Promise<{ success: boolean; error?: string; alert?: IAlert }> {
        const { id, ...new_alert } = alert;
        new_alert.applied_dashboard_filters = map(
            alert.applied_dashboard_filters,
            (filter) => ({
                ...filter,
                filter_value: this.filter[filter.filter_title!],
            })
        );
        new_alert.destinations = filter(alert.destinations, (d) => {
            // remove all other users email destinations.
            if (d.destination_type === DestinationType.EMAIL) {
                return d.email_address === current_user_email;
            }
            return true;
        });
        try {
            const created_alert = await sdk.ok(sdk.create_alert(new_alert));
            return { success: true, alert: created_alert };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    public async save(
        sdk: Looker40SDK,
        alert: IAlert
    ): Promise<{ success: boolean; error?: string }> {
        const new_applied_dashboard_filters = map(
            alert.applied_dashboard_filters,
            (filter) => ({
                ...filter,
                filter_value: this.filter[filter.filter_title!],
            })
        );
        try {
            await sdk.ok(
                sdk.update_alert(alert.id!, {
                    ...alert,
                    applied_dashboard_filters: new_applied_dashboard_filters,
                })
            );
            this.initialFilter = { ...this.filter };
            return { success: true };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }
}

export default DashboardFilter;
