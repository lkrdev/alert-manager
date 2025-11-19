import { FieldSelect, Grid, SelectOptionObject } from '@looker/components';
import { IAlertField } from '@looker/sdk';
import React from 'react';
import useSWR from 'swr';
import useSdk from '../../../hooks/useSdk';

import { map } from 'lodash';
import {
    alertFieldToFieldOption,
    fieldOptionValueToAlertField,
    QueryFields,
} from '../../../utils/queryFields';

interface FieldGridProps {
    slug?: string;
    alert_field: IAlertField | undefined;
    onChange: (value: IAlertField) => void;
}

const FieldGrid: React.FC<FieldGridProps> = ({
    slug,
    alert_field,
    onChange,
}) => {
    const sdk = useSdk();
    const query = useSWR(slug ? `query-${slug}` : null, () =>
        sdk.ok(sdk.query(slug!)),
    );
    const modelexplore = {
        model: query.data?.model,
        explore: query.data?.view,
    };
    const model_explore = useSWR(
        modelexplore.model && modelexplore.explore
            ? `model-explore-${modelexplore.model}-${modelexplore.explore}`
            : null,
        () =>
            sdk.ok(
                sdk.lookml_model_explore({
                    lookml_model_name: modelexplore.model!,
                    explore_name: modelexplore.explore!,
                }),
            ),
    );

    const query_fields =
        model_explore.data && query.data
            ? new QueryFields(model_explore.data, query.data)
            : undefined;

    const pivot_values = useSWR(
        query_fields ? `pivot-values-${slug}` : null,
        () => query_fields?.getQueryPivotFieldOptions(sdk),
    );

    if (!alert_field || !pivot_values.data || !alert_field) return null;
    console.log(pivot_values.data?.field_options);
    console.log(
        map(pivot_values.data?.field_options, (option) => {
            const current_option = alertFieldToFieldOption(alert_field!);
            return {
                label:
                    Array.from({ length: option.level + 1 }).join(' ') +
                    ' ' +
                    (option.value === current_option.value
                        ? option.display
                        : option.label),
                value: option.value,
            } as SelectOptionObject;
        }),
    );
    return (
        <Grid columns={3} gap='small'>
            <FieldSelect
                options={
                    pivot_values.data && pivot_values.data.field_options
                        ? pivot_values.data.field_options.map(
                              (option) =>
                                  ({
                                      label:
                                          Array.from({
                                              length: option.level + 1,
                                          }).join(' ') +
                                          (option.value ===
                                          alertFieldToFieldOption(alert_field)
                                              .value
                                              ? option.display
                                              : option.label),
                                      value: option.value,
                                  } as SelectOptionObject),
                          )
                        : []
                }
                value={alertFieldToFieldOption(alert_field).value}
                onChange={(value) =>
                    onChange(fieldOptionValueToAlertField(value))
                }
            />
        </Grid>
    );
};

export default FieldGrid;
