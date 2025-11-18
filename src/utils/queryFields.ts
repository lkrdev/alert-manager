import {
    ILookmlModelExplore,
    ILookmlModelExploreField,
    IQuery,
    Looker40SDK,
} from '@looker/sdk';
import { difference, filter, map, pick, sortBy } from 'lodash';

type CategoryType = 'dimension' | 'table_calculation';
type KindHintType = 'dimension' | 'measure';
type TypeHintType = 'string' | 'number' | 'yesno' | 'datetime' | 'date';

export interface IDynamicField {
    dimension?: string;
    measure?: string;
    table_calculation?: string;
    label: string;
    category?: CategoryType;
    _kind_hint?: KindHintType;
    _type_hint?: TypeHintType;
}

export interface ILookmlModelExploreFieldWithKind
    extends ILookmlModelExploreField {
    _kind_hint: KindHintType;
    _type_hint: TypeHintType;
}

interface IDynamicFieldTransformed {
    [key: string]: IDynamicField;
}

export const parseDynamicFields = (dynamic_fields: string) => {
    try {
        const df = JSON.parse(dynamic_fields) as IDynamicField[];
        return Object.fromEntries(
            df.map((field) => [
                field.dimension || field.measure || field.table_calculation,
                pick(field, [
                    'dimension',
                    'measure',
                    'table_calculation',
                    'label',
                    'category',
                    '_kind_hint',
                    '_type_hint',
                ]),
            ])
        ) as IDynamicFieldTransformed;
    } catch (error) {
        return {} as IDynamicFieldTransformed;
    }
};

export class QueryFields {
    private dynamic_fields: IDynamicFieldTransformed;
    private model_fields: { [key: string]: ILookmlModelExploreFieldWithKind };
    private query: IQuery;
    private model_explore: ILookmlModelExplore;
    constructor(model_explore: ILookmlModelExplore, query: IQuery) {
        console.log('QueryFields', model_explore, query);
        try {
            this.dynamic_fields = parseDynamicFields(
                query.dynamic_fields || '[]'
            );
        } catch (error) {
            console.error(error);
            this.dynamic_fields = {};
        }
        this.model_explore = model_explore;
        this.model_fields = {
            ...this.getModelFields('dimensions'),
            ...this.getModelFields('measures'),
        };
        this.query = query;
    }

    private getModelFields(type: 'dimensions' | 'measures') {
        let fields: { [key: string]: ILookmlModelExploreFieldWithKind } = {};
        const fieldArray = this.model_explore.fields?.[type];
        if (fieldArray) {
            for (const field of fieldArray) {
                fields[field.name!] = {
                    ...field,
                    _kind_hint:
                        field.category === 'dimension'
                            ? 'dimension'
                            : 'measure',
                    _type_hint: field.is_numeric ? 'number' : 'string',
                };
            }
        }
        return fields;
    }

    private lookupField(
        name: string
    ): IDynamicField | ILookmlModelExploreFieldWithKind | undefined {
        return this.model_fields[name] || this.dynamic_fields[name];
    }

    public getQueryFields() {
        return filter(
            map(this.query.fields, (field) => this.lookupField(field!)),
            Boolean
        );
    }

    public getAlertFields() {
        return filter(
            this.getQueryFields(),
            (field) =>
                field?._kind_hint === 'measure' ||
                field?._type_hint === 'number'
        );
    }

    public getDynamicFields() {
        return this.dynamic_fields;
    }

    public async pivotValues(sdk: Looker40SDK) {
        if (!this.query.pivots?.length) {
            return Promise.resolve([]);
        }
        const fields = this.query.fields || [];
        const pivots = this.query.pivots || [];
        const non_pivots = difference(fields, pivots);
        const run = (await sdk.ok(
            sdk.run_query({
                query_id: this.query.id!,
                result_format: 'json',
                server_table_calcs: true,
            })
        )) as unknown as Record<string, any>[];
        const values = getPivotValues(run, fields, pivots);
        return {
            pivot_values: sortBy(values, (value) => value.join('::')),
            non_pivot_fields: non_pivots.map((field) =>
                this.lookupField(field!)
            ),
            pivot_fields: pivots.map((pivot) => this.lookupField(pivot!)),
        };
    }
}

export const getPivotValues = (
    results_json: Record<string, any>[],
    fields: string[] = [],
    pivots: string[] = []
) => {
    if (
        !Array.isArray(results_json) ||
        !results_json.length ||
        !pivots.length
    ) {
        return [];
    }

    const first_row = results_json[0];
    if (!first_row) {
        return [];
    }

    const pivot_source_field = fields.find((field) => {
        const value = first_row[field];
        return (
            value &&
            typeof value === 'object' &&
            pivots.some((pivotName) => pivotName in value)
        );
    });

    if (!pivot_source_field) {
        return [];
    }

    const pivot_tree = first_row[pivot_source_field];
    if (!pivot_tree || typeof pivot_tree !== 'object') {
        return [];
    }

    const combinations: string[][] = [];

    const collectPivots = (
        node: Record<string, any>,
        depth: number,
        current: string[]
    ) => {
        if (depth === pivots.length) {
            combinations.push([...current]);
            return;
        }

        const pivot_name = pivots[depth];
        const pivot_layer = node?.[pivot_name];
        if (!pivot_layer || typeof pivot_layer !== 'object') {
            return;
        }

        for (const [pivot_value, child_node] of Object.entries(pivot_layer)) {
            current.push(pivot_value);
            collectPivots(
                child_node as Record<string, any>,
                depth + 1,
                current
            );
            current.pop();
        }
    };

    collectPivots(pivot_tree, 0, []);

    return combinations;
};
