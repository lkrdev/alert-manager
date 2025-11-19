import { SelectOptionObject } from '@looker/components';
import {
    IAlertField,
    ILookmlModelExplore,
    ILookmlModelExploreField,
    IQuery,
    Looker40SDK,
} from '@looker/sdk';
import { difference, filter, map, pick, sortBy } from 'lodash';

type CategoryType = 'dimension' | 'table_calculation';
type KindHintType = 'dimension' | 'measure';
type TypeHintType = 'string' | 'number' | 'yesno' | 'datetime' | 'date';

type TFieldOption = SelectOptionObject & {
    level: number;
    display: string;
};

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
            ]),
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
                query.dynamic_fields || '[]',
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
        name: string,
    ): IDynamicField | ILookmlModelExploreFieldWithKind | undefined {
        return this.model_fields[name] || this.dynamic_fields[name];
    }

    public getQueryFields() {
        return filter(
            map(this.query.fields, (field) => this.lookupField(field!)),
            Boolean,
        );
    }

    public getAlertFields() {
        return filter(
            this.getQueryFields(),
            (field) =>
                typeof field === 'object' &&
                field._kind_hint === 'measure' &&
                field._type_hint === 'number',
        ) as (IDynamicField | ILookmlModelExploreFieldWithKind)[];
    }

    public getDynamicFields() {
        return this.dynamic_fields;
    }

    public async getQueryPivotFieldOptions(sdk: Looker40SDK) {
        const fields = this.query.fields || [];
        const pivots = this.query.pivots || [];
        const non_pivots = difference(fields, pivots);
        let pivot_values: string[][] = [];
        if (pivots.length) {
            const run = (await sdk.ok(
                sdk.run_query({
                    query_id: this.query.id!,
                    result_format: 'json',
                    server_table_calcs: true,
                }),
            )) as unknown as Record<string, any>[];
            pivot_values = sortBy(
                getPivotValues(run, fields, pivots),
                (value) => value.join('::'),
            );
        }
        const non_pivot_fields = non_pivots.reduce((acc, f) => {
            const field = this.lookupField(f!);
            if (field) {
                acc.push(field);
            }
            return acc;
        }, [] as (IDynamicField | ILookmlModelExploreFieldWithKind)[]);
        const pivot_fields = pivots.reduce((acc, pivot) => {
            const field = this.lookupField(pivot!);
            if (field) {
                acc.push(field);
            }
            return acc;
        }, [] as (IDynamicField | ILookmlModelExploreFieldWithKind)[]);
        const field_options = getFieldOptions(
            pivot_values,
            this.getAlertFields(),
        );
        return {
            pivot_values: sortBy(pivot_values, (value) => value.join('::')),
            non_pivot_fields: non_pivot_fields.filter(Boolean),
            pivot_fields: pivot_fields.filter(Boolean),
            field_options: field_options,
        };
    }
}

export const getFieldOptions = (
    pivot_values: string[][],
    measure_fields: (IDynamicField | ILookmlModelExploreFieldWithKind)[],
): TFieldOption[] => {
    console.log('getFieldOptions', pivot_values, measure_fields);
    const options: TFieldOption[] = [];

    for (const field of measure_fields) {
        // Get field name
        const fieldName =
            (field as ILookmlModelExploreFieldWithKind).name ||
            (field as IDynamicField).dimension ||
            (field as IDynamicField).measure ||
            (field as IDynamicField).table_calculation ||
            '';

        // Get field label/title
        const label =
            (field as ILookmlModelExploreFieldWithKind).label ||
            (field as IDynamicField).label ||
            '';
        const labelShort = (field as ILookmlModelExploreFieldWithKind)
            .label_short;

        // Remove label_short from end of label if it exists
        let title = label;
        if (labelShort && label.endsWith(` ${labelShort}`)) {
            title = label.slice(0, -(labelShort.length + 1));
        }

        // Add base option (no pivot)
        options.push(getFieldOption({ title, name: fieldName }, undefined));

        // Add options for each pivot value combination
        for (const pivotValue of pivot_values) {
            // For single pivot, use the first value as title
            const pivotTitle = pivotValue[0] || '';
            const pivotName = [fieldName, ...pivotValue].join('::');
            options.push(
                getFieldOption(
                    { title: pivotTitle, name: pivotName },
                    pivotValue,
                ),
            );
        }
    }

    return options;
};

export const getPivotValues = (
    results_json: Record<string, any>[],
    fields: string[] = [],
    pivots: string[] = [],
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
        current: string[],
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
                current,
            );
            current.pop();
        }
    };

    collectPivots(pivot_tree, 0, []);

    return combinations;
};

export const getFieldOption = (
    field: Pick<IAlertField, 'title' | 'name'>,
    pivot_values: string[] | undefined,
) => {
    const include_any = typeof pivot_values === 'undefined' ? false : true;
    return {
        label: field.title + (include_any ? ' (any)' : ''),
        value: [field.name, ...(pivot_values || [])].join('::'),
        level: pivot_values?.length || 0,
        display: include_any ? `Any ${field.title}` : field.title,
    } as TFieldOption;
};

export const alertFieldToFieldOption = (field: IAlertField) => {
    const option = getFieldOption(
        field,
        field.filter
            ? field.filter.map((f) => f.filter_value || '')
            : undefined,
    );
    console.log({ option });
    return option;
};

export const fieldOptionValueToAlertField = (value: TFieldOption['value']) => {
    const [name, ...pivot_values] = value.split('::');
    return {
        name: name,
        filter: pivot_values.map((value) => ({ filter_value: value })),
    } as IAlertField;
};
