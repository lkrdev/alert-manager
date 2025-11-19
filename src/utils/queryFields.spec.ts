import { SelectOptionProps } from '@looker/components';
import {
    getFieldOption,
    getFieldOptions,
    getPivotValues,
    parseDynamicFields,
} from './queryFields';

describe('QueryFields', () => {
    const DF_STRING =
        '[{"category":"dimension","expression":"${a.b}","label":"AB","value_format":null,"value_format_name":null,"dimension":"ab","_kind_hint":"dimension","_type_hint":"string"},{"_kind_hint":"measure","_type_hint":"number","based_on":"order_items_big.user_id","expression":"","label":"CD","measure":"cd","type":"count_distinct"},{"category":"table_calculation","expression":"${a.b}","label":"AB calc","value_format":null,"value_format_name":null,"_kind_hint":"dimension","table_calculation":"ab_calc","_type_hint":"string"},{"category":"table_calculation","expression":"${a.b}","label":"bc calc","value_format":null,"value_format_name":null,"_kind_hint":"measure","table_calculation":"bc_calc","_type_hint":"number"}]';
    it('parse df', () => {
        const dynamic_fields = parseDynamicFields(DF_STRING);
        expect(Object.keys(dynamic_fields)).toEqual([
            'ab',
            'cd',
            'ab_calc',
            'bc_calc',
        ]);
        expect(dynamic_fields['ab']).toEqual({
            dimension: 'ab',
            label: 'AB',
            category: 'dimension',
            _kind_hint: 'dimension',
            _type_hint: 'string',
        });
        expect(dynamic_fields['cd']).toEqual({
            measure: 'cd',
            label: 'CD',
            _kind_hint: 'measure',
            _type_hint: 'number',
        });
        expect(dynamic_fields['ab_calc']).toEqual({
            table_calculation: 'ab_calc',
            label: 'AB calc',
            category: 'table_calculation',
            _kind_hint: 'dimension',
            _type_hint: 'string',
        });
        expect(dynamic_fields['bc_calc']).toEqual({
            table_calculation: 'bc_calc',
            label: 'bc calc',
            category: 'table_calculation',
            _kind_hint: 'measure',
            _type_hint: 'number',
        });
    });
});

describe('getPivotValues', () => {
    it('should get multiple pivot values', () => {
        const pivot_values = getPivotValues(
            RESULTS_JSON_MULTIPLE_PIVOTS,
            QUERY_MULTIPLE_PIVOTS.fields,
            QUERY_MULTIPLE_PIVOTS.pivots,
        );
        const expected = [
            ['Cancelled', ''],
            ['Complete', '2022-01'],
            ['Complete', '2022-04'],
            ['Complete', '2022-07'],
            ['Complete', '2022-10'],
            ['Complete', '2023-01'],
            ['Complete', '2023-04'],
            ['Complete', '2023-07'],
            ['Complete', '2023-10'],
            ['Complete', '2024-01'],
            ['Complete', '2024-04'],
            ['Complete', '2024-07'],
            ['Complete', '2024-10'],
            ['Complete', '2025-01'],
            ['Processing', ''],
            ['Returned', '2022-01'],
            ['Returned', '2022-04'],
            ['Returned', '2022-07'],
            ['Returned', '2022-10'],
            ['Returned', '2023-01'],
            ['Returned', '2023-04'],
            ['Returned', '2023-07'],
            ['Returned', '2023-10'],
            ['Returned', '2024-01'],
            ['Returned', '2024-04'],
            ['Returned', '2024-07'],
            ['Returned', '2024-10'],
            ['Returned', '2025-01'],
            ['Returned', '2025-04'],
            ['Shipped', ''],
        ];
        for (const i of expected) {
            expect(pivot_values.map((k) => k.join('::'))).toContain(
                i.join('::'),
            );
        }
        for (const i of pivot_values) {
            expect(expected.map((k) => k.join('::'))).toContain(i.join('::'));
        }
    });
    it('should get single pivot values', () => {
        const pivot_values = getPivotValues(
            RESULTS_JSON_SINGLE_PIVOT,
            QUERY_SINGLE_PIVOTS.fields,
            QUERY_SINGLE_PIVOTS.pivots,
        );
        const expected = [
            ['Cancelled'],
            ['Complete'],
            ['Processing'],
            ['Returned'],
            ['Shipped'],
        ];
        for (const i of expected) {
            expect(pivot_values.map((k) => k.join('::'))).toContain(
                i.join('::'),
            );
        }
        for (const i of pivot_values) {
            expect(expected.map((k) => k.join('::'))).toContain(i.join('::'));
        }
    });
});

const QUERY_MULTIPLE_PIVOTS = {
    view: 'order_items_big',
    fields: [
        'order_items_big.status',
        'order_items_big.count',
        'status_custom_field',
        'count_of_user_id',
        'order_items_big.delivered_quarter',
    ],
    pivots: ['order_items_big.status', 'order_items_big.delivered_quarter'],
};

const RESULTS_JSON_MULTIPLE_PIVOTS = [
    {
        status_custom_field: 'Cancelled',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 87919,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 6407,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 'Cancelled',
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Complete',
                        '2022-04': 'Complete',
                        '2022-07': 'Complete',
                        '2022-10': 'Complete',
                        '2023-01': 'Complete',
                        '2023-04': 'Complete',
                        '2023-07': 'Complete',
                        '2023-10': 'Complete',
                        '2024-01': 'Complete',
                        '2024-04': 'Complete',
                        '2024-07': 'Complete',
                        '2024-10': 'Complete',
                        '2025-01': 'Complete',
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 'Processing',
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Returned',
                        '2022-04': 'Returned',
                        '2022-07': 'Returned',
                        '2022-10': 'Returned',
                        '2023-01': 'Returned',
                        '2023-04': 'Returned',
                        '2023-07': 'Returned',
                        '2023-10': 'Returned',
                        '2024-01': 'Returned',
                        '2024-04': 'Returned',
                        '2024-07': 'Returned',
                        '2024-10': 'Returned',
                        '2025-01': 'Returned',
                        '2025-04': 'Returned',
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 'Shipped',
                    },
                },
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 87919,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
    },
    {
        status_custom_field: 'Complete',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 44213,
                        '2022-04': 71279,
                        '2022-07': 96720,
                        '2022-10': 126490,
                        '2023-01': 146263,
                        '2023-04': 155090,
                        '2023-07': 172627,
                        '2023-10': 213980,
                        '2024-01': 218972,
                        '2024-04': 236132,
                        '2024-07': 264537,
                        '2024-10': 316433,
                        '2025-01': 312663,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 3010,
                        '2022-04': 4729,
                        '2022-07': 6475,
                        '2022-10': 8426,
                        '2023-01': 9657,
                        '2023-04': 10244,
                        '2023-07': 11422,
                        '2023-10': 14150,
                        '2024-01': 14533,
                        '2024-04': 15572,
                        '2024-07': 17522,
                        '2024-10': 20879,
                        '2025-01': 20879,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 'Cancelled',
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Complete',
                        '2022-04': 'Complete',
                        '2022-07': 'Complete',
                        '2022-10': 'Complete',
                        '2023-01': 'Complete',
                        '2023-04': 'Complete',
                        '2023-07': 'Complete',
                        '2023-10': 'Complete',
                        '2024-01': 'Complete',
                        '2024-04': 'Complete',
                        '2024-07': 'Complete',
                        '2024-10': 'Complete',
                        '2025-01': 'Complete',
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 'Processing',
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Returned',
                        '2022-04': 'Returned',
                        '2022-07': 'Returned',
                        '2022-10': 'Returned',
                        '2023-01': 'Returned',
                        '2023-04': 'Returned',
                        '2023-07': 'Returned',
                        '2023-10': 'Returned',
                        '2024-01': 'Returned',
                        '2024-04': 'Returned',
                        '2024-07': 'Returned',
                        '2024-10': 'Returned',
                        '2025-01': 'Returned',
                        '2025-04': 'Returned',
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 'Shipped',
                    },
                },
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 44213,
                        '2022-04': 71279,
                        '2022-07': 96720,
                        '2022-10': 126490,
                        '2023-01': 146263,
                        '2023-04': 155090,
                        '2023-07': 172627,
                        '2023-10': 213980,
                        '2024-01': 218972,
                        '2024-04': 236132,
                        '2024-07': 264537,
                        '2024-10': 316433,
                        '2025-01': 312663,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
    },
    {
        status_custom_field: 'Shipped',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 17810,
                    },
                },
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 1347,
                    },
                },
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 'Cancelled',
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Complete',
                        '2022-04': 'Complete',
                        '2022-07': 'Complete',
                        '2022-10': 'Complete',
                        '2023-01': 'Complete',
                        '2023-04': 'Complete',
                        '2023-07': 'Complete',
                        '2023-10': 'Complete',
                        '2024-01': 'Complete',
                        '2024-04': 'Complete',
                        '2024-07': 'Complete',
                        '2024-10': 'Complete',
                        '2025-01': 'Complete',
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 'Processing',
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Returned',
                        '2022-04': 'Returned',
                        '2022-07': 'Returned',
                        '2022-10': 'Returned',
                        '2023-01': 'Returned',
                        '2023-04': 'Returned',
                        '2023-07': 'Returned',
                        '2023-10': 'Returned',
                        '2024-01': 'Returned',
                        '2024-04': 'Returned',
                        '2024-07': 'Returned',
                        '2024-10': 'Returned',
                        '2025-01': 'Returned',
                        '2025-04': 'Returned',
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 'Shipped',
                    },
                },
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 17810,
                    },
                },
            },
        },
    },
    {
        status_custom_field: 'Processing',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 9854,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 739,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 'Cancelled',
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Complete',
                        '2022-04': 'Complete',
                        '2022-07': 'Complete',
                        '2022-10': 'Complete',
                        '2023-01': 'Complete',
                        '2023-04': 'Complete',
                        '2023-07': 'Complete',
                        '2023-10': 'Complete',
                        '2024-01': 'Complete',
                        '2024-04': 'Complete',
                        '2024-07': 'Complete',
                        '2024-10': 'Complete',
                        '2025-01': 'Complete',
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 'Processing',
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Returned',
                        '2022-04': 'Returned',
                        '2022-07': 'Returned',
                        '2022-10': 'Returned',
                        '2023-01': 'Returned',
                        '2023-04': 'Returned',
                        '2023-07': 'Returned',
                        '2023-10': 'Returned',
                        '2024-01': 'Returned',
                        '2024-04': 'Returned',
                        '2024-07': 'Returned',
                        '2024-10': 'Returned',
                        '2025-01': 'Returned',
                        '2025-04': 'Returned',
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 'Shipped',
                    },
                },
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 9854,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                        '2025-04': null,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
    },
    {
        status_custom_field: 'Returned',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 507,
                        '2022-04': 741,
                        '2022-07': 1079,
                        '2022-10': 1222,
                        '2023-01': 1599,
                        '2023-04': 1833,
                        '2023-07': 1781,
                        '2023-10': 2301,
                        '2024-01': 2015,
                        '2024-04': 1989,
                        '2024-07': 2652,
                        '2024-10': 2990,
                        '2025-01': 3393,
                        '2025-04': 130,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 39,
                        '2022-04': 57,
                        '2022-07': 83,
                        '2022-10': 94,
                        '2023-01': 123,
                        '2023-04': 139,
                        '2023-07': 136,
                        '2023-10': 176,
                        '2024-01': 155,
                        '2024-04': 153,
                        '2024-07': 204,
                        '2024-10': 230,
                        '2025-01': 260,
                        '2025-04': 10,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': 'Cancelled',
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Complete',
                        '2022-04': 'Complete',
                        '2022-07': 'Complete',
                        '2022-10': 'Complete',
                        '2023-01': 'Complete',
                        '2023-04': 'Complete',
                        '2023-07': 'Complete',
                        '2023-10': 'Complete',
                        '2024-01': 'Complete',
                        '2024-04': 'Complete',
                        '2024-07': 'Complete',
                        '2024-10': 'Complete',
                        '2025-01': 'Complete',
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': 'Processing',
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 'Returned',
                        '2022-04': 'Returned',
                        '2022-07': 'Returned',
                        '2022-10': 'Returned',
                        '2023-01': 'Returned',
                        '2023-04': 'Returned',
                        '2023-07': 'Returned',
                        '2023-10': 'Returned',
                        '2024-01': 'Returned',
                        '2024-04': 'Returned',
                        '2024-07': 'Returned',
                        '2024-10': 'Returned',
                        '2025-01': 'Returned',
                        '2025-04': 'Returned',
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': 'Shipped',
                    },
                },
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Complete: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': null,
                        '2022-04': null,
                        '2022-07': null,
                        '2022-10': null,
                        '2023-01': null,
                        '2023-04': null,
                        '2023-07': null,
                        '2023-10': null,
                        '2024-01': null,
                        '2024-04': null,
                        '2024-07': null,
                        '2024-10': null,
                        '2025-01': null,
                    },
                },
                Processing: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
                Returned: {
                    'order_items_big.delivered_quarter': {
                        '2022-01': 507,
                        '2022-04': 741,
                        '2022-07': 1079,
                        '2022-10': 1222,
                        '2023-01': 1599,
                        '2023-04': 1833,
                        '2023-07': 1781,
                        '2023-10': 2301,
                        '2024-01': 2015,
                        '2024-04': 1989,
                        '2024-07': 2652,
                        '2024-10': 2990,
                        '2025-01': 3393,
                        '2025-04': 130,
                    },
                },
                Shipped: {
                    'order_items_big.delivered_quarter': {
                        '': null,
                    },
                },
            },
        },
    },
];

const QUERY_SINGLE_PIVOTS = {
    view: 'order_items_big',
    fields: [
        'order_items_big.status',
        'order_items_big.count',
        'status_custom_field',
        'count_of_user_id',
    ],
    pivots: ['order_items_big.status'],
};

const RESULTS_JSON_SINGLE_PIVOT = [
    {
        status_custom_field: 'Cancelled',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: 87919,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: 6407,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: 'Cancelled',
                Complete: 'Complete',
                Processing: 'Processing',
                Returned: 'Returned',
                Shipped: 'Shipped',
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: 87919,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
    },
    {
        status_custom_field: 'Complete',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: null,
                Complete: 2375399,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: 94305,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: 'Cancelled',
                Complete: 'Complete',
                Processing: 'Processing',
                Returned: 'Returned',
                Shipped: 'Shipped',
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: 2375399,
                Processing: null,
                Returned: null,
                Shipped: null,
            },
        },
    },
    {
        status_custom_field: 'Returned',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: 24232,
                Shipped: null,
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: 1840,
                Shipped: null,
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: 'Cancelled',
                Complete: 'Complete',
                Processing: 'Processing',
                Returned: 'Returned',
                Shipped: 'Shipped',
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: 24232,
                Shipped: null,
            },
        },
    },
    {
        status_custom_field: 'Shipped',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: 17810,
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: 1347,
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: 'Cancelled',
                Complete: 'Complete',
                Processing: 'Processing',
                Returned: 'Returned',
                Shipped: 'Shipped',
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: null,
                Returned: null,
                Shipped: 17810,
            },
        },
    },
    {
        status_custom_field: 'Processing',
        'order_items_big.count': {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: 9854,
                Returned: null,
                Shipped: null,
            },
        },
        count_of_user_id: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: 739,
                Returned: null,
                Shipped: null,
            },
        },
        status_calc: {
            'order_items_big.status': {
                Cancelled: 'Cancelled',
                Complete: 'Complete',
                Processing: 'Processing',
                Returned: 'Returned',
                Shipped: 'Shipped',
            },
        },
        count_calc: {
            'order_items_big.status': {
                Cancelled: null,
                Complete: null,
                Processing: 9854,
                Returned: null,
                Shipped: null,
            },
        },
    },
];

const SINGLE_PIVOT_FIELD_INPUT = {
    pivot_values: [
        ['Cancelled'],
        ['Complete'],
        ['Processing'],
        ['Returned'],
        ['Shipped'],
    ],
    non_pivot_fields: [
        {
            align: 'right',
            can_filter: true,
            category: 'measure',
            default_filter_value: null,
            description: '',
            enumerations: null,
            field_group_label: null,
            fill_style: null,
            fiscal_month_offset: 0,
            has_allowed_values: false,
            hidden: false,
            is_filter: false,
            is_numeric: true,
            label: 'Order Items Big Count',
            label_from_parameter: null,
            label_short: 'Count',
            map_layer: null,
            name: 'order_items_big.count',
            strict_value_format: false,
            requires_refresh_on_sort: false,
            sortable: true,
            suggestions: null,
            synonyms: [],
            tags: [],
            type: 'count',
            user_attribute_filter_types: ['number', 'advanced_filter_number'],
            value_format: null,
            value_format_name: null,
            view: 'order_items_big',
            view_label: 'Order Items Big',
            dynamic: false,
            week_start_day: 'monday',
            original_view: 'order_items_big',
            dimension_group: null,
            error: null,
            field_group_variant: 'Count',
            measure: true,
            parameter: false,
            primary_key: false,
            project_name: 'az_load_test',
            scope: 'order_items_big',
            suggest_dimension: 'order_items_big.count',
            suggest_explore: 'order_items_big',
            suggestable: false,
            lookml_expression: null,
            is_fiscal: false,
            is_timeframe: false,
            can_time_filter: false,
            time_interval: null,
            lookml_link:
                '/projects/az_load_test/files/models%2Faz_load_test.model.lkml?line=147',
            period_over_period_params: null,
            permanent: null,
            source_file: 'models/az_load_test.model.lkml',
            source_file_path: 'az_load_test/models/az_load_test.model.lkml',
            sql: null,
            sql_case: null,
            filters: null,
            times_used: 21853638,
            _kind_hint: 'measure',
            _type_hint: 'number',
        },
        {
            dimension: 'status_custom_field',
            label: 'status_custom_field',
            category: 'dimension',
            _kind_hint: 'dimension',
            _type_hint: 'string',
        },
        {
            measure: 'count_of_user_id',
            label: 'Count of User ID',
            _kind_hint: 'measure',
            _type_hint: 'number',
        },
    ],
    pivot_fields: [
        {
            align: 'left',
            can_filter: true,
            category: 'dimension',
            default_filter_value: null,
            description: '',
            enumerations: null,
            field_group_label: null,
            fill_style: null,
            fiscal_month_offset: 0,
            has_allowed_values: false,
            hidden: false,
            is_filter: false,
            is_numeric: false,
            label: 'Order Items Big Status',
            label_from_parameter: null,
            label_short: 'Status',
            map_layer: null,
            name: 'order_items_big.status',
            strict_value_format: false,
            requires_refresh_on_sort: false,
            sortable: true,
            suggestions: null,
            synonyms: [],
            tags: [],
            type: 'string',
            user_attribute_filter_types: ['string', 'advanced_filter_string'],
            value_format: null,
            value_format_name: null,
            view: 'order_items_big',
            view_label: 'Order Items Big',
            dynamic: false,
            week_start_day: 'monday',
            original_view: 'order_items_big',
            dimension_group: null,
            error: null,
            field_group_variant: 'Status',
            measure: false,
            parameter: false,
            primary_key: false,
            project_name: 'az_load_test',
            scope: 'order_items_big',
            suggest_dimension: 'order_items_big.status',
            suggest_explore: 'order_items_big',
            suggestable: true,
            lookml_expression: null,
            is_fiscal: false,
            is_timeframe: false,
            can_time_filter: false,
            time_interval: null,
            lookml_link:
                '/projects/az_load_test/files/models%2Faz_load_test.model.lkml?line=131',
            period_over_period_params: null,
            permanent: null,
            source_file: 'models/az_load_test.model.lkml',
            source_file_path: 'az_load_test/models/az_load_test.model.lkml',
            sql: '${TABLE}.status ',
            sql_case: null,
            filters: null,
            times_used: 21888039,
            _kind_hint: 'dimension',
            _type_hint: 'string',
        },
    ],
    measure_fields: [
        {
            align: 'right',
            can_filter: true,
            category: 'measure',
            default_filter_value: null,
            description: '',
            enumerations: null,
            field_group_label: null,
            fill_style: null,
            fiscal_month_offset: 0,
            has_allowed_values: false,
            hidden: false,
            is_filter: false,
            is_numeric: true,
            label: 'Order Items Big Count',
            label_from_parameter: null,
            label_short: 'Count',
            map_layer: null,
            name: 'order_items_big.count',
            strict_value_format: false,
            requires_refresh_on_sort: false,
            sortable: true,
            suggestions: null,
            synonyms: [],
            tags: [],
            type: 'count',
            user_attribute_filter_types: ['number', 'advanced_filter_number'],
            value_format: null,
            value_format_name: null,
            view: 'order_items_big',
            view_label: 'Order Items Big',
            dynamic: false,
            week_start_day: 'monday',
            original_view: 'order_items_big',
            dimension_group: null,
            error: null,
            field_group_variant: 'Count',
            measure: true,
            parameter: false,
            primary_key: false,
            project_name: 'az_load_test',
            scope: 'order_items_big',
            suggest_dimension: 'order_items_big.count',
            suggest_explore: 'order_items_big',
            suggestable: false,
            lookml_expression: null,
            is_fiscal: false,
            is_timeframe: false,
            can_time_filter: false,
            time_interval: null,
            lookml_link:
                '/projects/az_load_test/files/models%2Faz_load_test.model.lkml?line=147',
            period_over_period_params: null,
            permanent: null,
            source_file: 'models/az_load_test.model.lkml',
            source_file_path: 'az_load_test/models/az_load_test.model.lkml',
            sql: null,
            sql_case: null,
            filters: null,
            times_used: 21853638,
            _kind_hint: 'measure',
            _type_hint: 'number',
        },
        {
            measure: 'count_of_user_id',
            label: 'Count of User ID',
            _kind_hint: 'measure',
            _type_hint: 'number',
        },
    ],
};

describe('getFieldOption', () => {
    it('should return the correct field option', () => {
        const field_option = getFieldOption(
            { title: 'Order Items Big', name: 'order_items_big.count' },
            undefined,
        );
        expect(field_option).toEqual({
            label: 'Order Items Big',
            value: 'order_items_big.count',
            display: 'Order Items Big',
            level: 0,
        });
        const field_option_with_pivot = getFieldOption(
            { title: 'Order Items Big', name: 'order_items_big.count' },
            ['Cancelled'],
        );
        expect(field_option_with_pivot).toEqual({
            label: 'Order Items Big (any)',
            value: 'order_items_big.count::Cancelled',
            display: 'Any Order Items Big',
            level: 1,
        });
        const option_with_multiple_pivots = getFieldOption(
            { title: 'Order Items Big', name: 'order_items_big.count' },
            ['Cancelled', 'Complete'],
        );
        expect(option_with_multiple_pivots).toEqual({
            label: 'Order Items Big (any)',
            value: 'order_items_big.count::Cancelled::Complete',
            display: 'Any Order Items Big',
            level: 2,
        });
    });
});

describe('getFieldOptions', () => {
    it('should return the correct field options with single pivot', () => {
        const field_options = getFieldOptions(
            SINGLE_PIVOT_FIELD_INPUT.pivot_values,
            SINGLE_PIVOT_FIELD_INPUT.measure_fields as any,
        );
        const EXPECTED = [
            getFieldOption(
                { title: 'Order Items Big', name: 'order_items_big.count' },
                undefined,
            ),
            getFieldOption(
                {
                    title: 'Cancelled',
                    name: 'order_items_big.count::Cancelled',
                },
                ['Cancelled'],
            ),

            getFieldOption(
                { title: 'Complete', name: 'order_items_big.count::Complete' },
                ['Complete'],
            ),
            getFieldOption(
                {
                    title: 'Processing',
                    name: 'order_items_big.count::Processing',
                },
                ['Processing'],
            ),
            getFieldOption(
                { title: 'Returned', name: 'order_items_big.count::Returned' },
                ['Returned'],
            ),
            getFieldOption(
                { title: 'Shipped', name: 'order_items_big.count::Shipped' },
                ['Shipped'],
            ),
            getFieldOption(
                { title: 'Count of User ID', name: 'count_of_user_id' },
                undefined,
            ),
            getFieldOption(
                { title: 'Cancelled', name: 'count_of_user_id::Cancelled' },
                ['Cancelled'],
            ),
            getFieldOption(
                { title: 'Complete', name: 'count_of_user_id::Complete' },
                ['Complete'],
            ),
            getFieldOption(
                { title: 'Processing', name: 'count_of_user_id::Processing' },
                ['Processing'],
            ),
            getFieldOption(
                { title: 'Returned', name: 'count_of_user_id::Returned' },
                ['Returned'],
            ),
            getFieldOption(
                { title: 'Shipped', name: 'count_of_user_id::Shipped' },
                ['Shipped'],
            ),
        ] as (SelectOptionProps & { level: number; display: string })[];
        expect(field_options).toEqual(EXPECTED);
    });
});
