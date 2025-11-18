import { Grid } from '@looker/components';
import React from 'react';
import useSWR from 'swr';
import useSdk from '../../../hooks/useSdk';
import { IDynamicField, QueryFields } from '../../../utils/queryFields';

interface FieldGridProps {
    slug?: string;
    value: string | undefined;
    onChange: (
        value: string[] | undefined,
        fields: (ILookmlModelExploreFieldWithKind | IDynamicField)[]
    ) => void;
}

const FieldGrid: React.FC<FieldGridProps> = ({ slug }) => {
    const sdk = useSdk();
    const query = useSWR(slug ? `query-${slug}` : null, () =>
        sdk.ok(sdk.query(slug!))
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
                })
            )
    );

    const query_fields =
        model_explore.data && query.data
            ? new QueryFields(model_explore.data, query.data)
            : undefined;

    const pivot_values = useSWR(
        query_fields ? `pivot-values-${slug}` : null,
        () =>
            query_fields?.pivotValues(sdk).then((values) => {
                console.log('pivot_values', values);
                return values;
            })
    );
    return (
        <Grid columns={3} gap="small">
            FieldGrid
        </Grid>
    );
};

export default FieldGrid;
