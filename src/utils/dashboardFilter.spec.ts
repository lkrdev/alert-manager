import { IAlert } from '@looker/sdk';
import DashboardFilter from './dashboardFilter';

describe('DashboardFilter', () => {
    it('should create a valid key', () => {
        const filter = {
            a: '1',
            b: '2',
        };
        const dashboardFilter = new DashboardFilter(filter);
        expect(dashboardFilter.getSortedKey('current')).toBe(
            '{"a":"1","b":"2"}'
        );
    });
    it('should make null values empty strings', () => {
        const filter = {
            a: '1',
            b: null,
        } as any;
        const dashboardFilter = new DashboardFilter(filter);
        expect(dashboardFilter.getFilter()).toEqual({ a: '1', b: '' });
        expect(dashboardFilter.getSortedKey('initial')).toBe(
            '{"a":"1","b":""}'
        );
    });
    it('should compare filters', () => {
        const filter1 = {
            a: '1',
            b: '2',
        };
        const filter2 = {
            b: '2',
            a: '1',
        };
        const dashboardFilter1 = new DashboardFilter(filter1);
        const dashboardFilter2 = new DashboardFilter(filter2);
        expect(dashboardFilter1.compareFilter(dashboardFilter2)).toBe(true);
    });
    it('should compare filters (null values)', () => {
        const filter1 = {
            a: '1',
            b: null,
        } as any;
        const filter2 = {
            a: '1',
            b: '',
        };
        const dashboardFilter1 = new DashboardFilter(filter1);
        const dashboardFilter2 = new DashboardFilter(filter2);
        expect(dashboardFilter1.compareFilter(dashboardFilter2)).toBe(true);
    });
    it('should convert to search params', () => {
        const filter = {
            a: '1',
            b: '2',
        };
        const dashboardFilter = new DashboardFilter(filter);
        expect(dashboardFilter.toSearchParams().toString()).toEqual(
            new URLSearchParams('a=1&b=2').toString()
        );
    });
    it('should convert from applied dashboard filters', () => {
        const appliedDashboardFilters = [
            { filter_title: 'a', filter_value: '1' },
            { filter_title: 'b', filter_value: '2' },
        ] as IAlert['applied_dashboard_filters'];
        const dashboardFilter = DashboardFilter.fromAppliedDashboardFilters(
            appliedDashboardFilters
        );
        expect(dashboardFilter.getFilter()).toEqual({ a: '1', b: '2' });
    });
    it('should convert from applied dashboard filters (null values)', () => {
        const appliedDashboardFilters = [
            { filter_title: 'a', filter_value: '1' },
            { filter_title: 'b', filter_value: null },
        ] as IAlert['applied_dashboard_filters'];
        const dashboardFilter = DashboardFilter.fromAppliedDashboardFilters(
            appliedDashboardFilters
        );
        expect(dashboardFilter.getFilter()).toEqual({ a: '1', b: '' });
    });
    it('should convert from applied dashboard filters (undefined values)', () => {
        const appliedDashboardFilters = [
            { filter_title: 'a', filter_value: '1' },
            { filter_title: 'b', filter_value: undefined },
        ] as IAlert['applied_dashboard_filters'];
        const dashboardFilter = DashboardFilter.fromAppliedDashboardFilters(
            appliedDashboardFilters
        );
        expect(dashboardFilter.getFilter()).toEqual({ a: '1', b: '' });
    });
});
