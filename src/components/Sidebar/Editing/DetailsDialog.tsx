import {
    Button,
    ButtonTransparent,
    Dialog,
    FieldChips,
    FieldSelect,
    FieldText,
    Grid,
    Header,
    Paragraph,
    Space,
    SpaceVertical,
} from '@looker/components';
import {
    ComparisonType,
    DestinationType,
    IAlertDestination,
} from '@looker/sdk';
import { useFormik } from 'formik';
import { map, omit, some } from 'lodash';
import React, { useEffect } from 'react';
import { useBoolean } from 'usehooks-ts';
import useSdk from '../../../hooks/useSdk';
import { IAlertAndDetail } from '../../../types';
import { getAlertTitle } from '../../../utils/alertTitle';
import LoadingButton from '../../LoadingButton';
import EmbedQuery from './EmbedQuery';

interface DetailsDialogProps {
    alert_detail: IAlertAndDetail;
}

interface DetailsFormValues {
    custom_title: string | undefined;
    cron: string | undefined;
    destinations: IAlertDestination[];
    threshold: number | undefined;
    comparison_type: ComparisonType | undefined;
}

const WithErrors = ({
    children,
    error,
}: {
    children: React.ReactNode;
    error: string | undefined;
}) => {
    return (
        <SpaceVertical gap="none">
            {children}
            <Paragraph
                fontSize="xxsmall"
                color="critical"
                m="none"
                style={{ visibility: error?.length ? 'visible' : 'hidden' }}
            >
                {error}
            </Paragraph>
        </SpaceVertical>
    );
};

const DetailsDialog: React.FC<DetailsDialogProps> = ({ alert_detail }) => {
    const { alert } = alert_detail;
    const open = useBoolean(true);
    const saving = useBoolean(false);
    const sdk = useSdk();

    const intial_values = {
        custom_title: alert.custom_title || undefined,
        cron: alert.cron || undefined,
        destinations: alert.destinations || [],
        threshold: alert.threshold || undefined,
        comparison_type: alert.comparison_type || undefined,
        field: alert.field,
    };

    const formik = useFormik<DetailsFormValues>({
        initialValues: intial_values,
        onSubmit: (values) => {
            console.log(values);
        },
        validate: (values) => {
            const errors: Partial<{
                [key in keyof DetailsFormValues]: string;
            }> = {};

            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Validate email addresses in destinations
            if (values.destinations && values.destinations.length > 0) {
                const invalidEmails = values.destinations
                    .filter(
                        (dest) =>
                            dest.destination_type === DestinationType.EMAIL &&
                            dest.email_address &&
                            !emailRegex.test(dest.email_address)
                    )
                    .map((dest) => dest.email_address);

                if (invalidEmails.length > 0) {
                    errors.destinations = `Invalid email addresses: ${invalidEmails.join(
                        ', '
                    )}`;
                }
            }

            return errors;
        },
    });

    useEffect(() => {
        formik.resetForm({
            values: intial_values,
        });
    }, [open.value]);

    const is_email = some(
        alert.destinations,
        (destination) => destination.destination_type === DestinationType.EMAIL
    );

    return (
        <>
            <Dialog
                key={open.value ? 'open' : 'closed'}
                isOpen={open.value}
                onClose={() => open.setFalse()}
                width="80vw"
                content={
                    <SpaceVertical gap="medium" between p="large">
                        <Header as="h3" m="none">
                            Alert Details
                        </Header>
                        <EmbedQuery slug={alert_detail.details.query_slug} />
                        <SpaceVertical>
                            <WithErrors error={formik.errors.custom_title}>
                                <FieldText
                                    label="Title"
                                    placeholder={getAlertTitle(
                                        omit(alert, 'custom_title')
                                    )}
                                    name="custom_title"
                                    value={alert.custom_title || undefined}
                                    onChange={formik.handleChange}
                                />
                            </WithErrors>
                            <Grid columns={3} gap="small">
                                <FieldSelect
                                    label="Field"
                                    name="field"
                                    options={pivot_values.map((field) => ({
                                        label: field.label,
                                        value: field.name,
                                    }))}
                                    value={formik.values.field || undefined}
                                    onChange={formik.handleChange}
                                >
                                    <option value="1">1</option>
                                </FieldSelect>
                                <FieldText
                                    label="Threshold"
                                    name="threshold"
                                    type="number"
                                    placeholder="Threshold"
                                    value={formik.values.threshold || undefined}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <WithErrors error={formik.errors.cron}>
                                <FieldText
                                    label="Cron"
                                    placeholder="Cron"
                                    name="cron"
                                    value={alert.cron || undefined}
                                    onChange={formik.handleChange}
                                />
                            </WithErrors>
                            {is_email && (
                                <WithErrors
                                    error={
                                        formik.errors.destinations as
                                            | string
                                            | undefined
                                    }
                                >
                                    <FieldChips
                                        label="Emails"
                                        placeholder="Emails"
                                        name="email"
                                        values={map(
                                            formik.values.destinations,
                                            (v) => v?.email_address || ''
                                        )}
                                        onChange={(values) => {
                                            formik.setFieldValue(
                                                'destinations',
                                                values.map((v) => ({
                                                    email_address: v,
                                                    destination_type:
                                                        DestinationType.EMAIL,
                                                }))
                                            );
                                        }}
                                    />
                                </WithErrors>
                            )}
                        </SpaceVertical>
                        <Space justify="end">
                            <ButtonTransparent onClick={open.setFalse}>
                                Cancel
                            </ButtonTransparent>
                            <LoadingButton
                                flexGrow={false}
                                is_loading={saving.value}
                                onClick={(e) => formik.handleSubmit(e as any)}
                            >
                                Save
                            </LoadingButton>
                        </Space>
                    </SpaceVertical>
                }
            ></Dialog>
            <Button
                size="small"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    open.setTrue();
                }}
            >
                Details
            </Button>
        </>
    );
};

export default DetailsDialog;
