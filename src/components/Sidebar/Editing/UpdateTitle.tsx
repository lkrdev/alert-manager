import {
    ButtonTransparent,
    FieldText,
    Heading,
    IconButton,
    Popover,
    PopoverLayout,
    Space,
    SpaceVertical,
} from '@looker/components';
import { IAlert } from '@looker/sdk';
import { EditNote } from '@styled-icons/material';
import React, { useEffect, useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useAppContext } from '../../../AppContext';
import useSdk from '../../../hooks/useSdk';
import LoadingButton from '../../LoadingButton';
import { useToast } from '../../Toast/ToastContext';
import { useEditingContext } from './Context';
interface UpdateTitleProps {
    title: string | undefined;
    placeholder_title: string;
    alert: IAlert;
}

function UpdateTitle({ title, placeholder_title, alert }: UpdateTitleProps) {
    const open = useBoolean(false);
    const updating = useBoolean(false);
    const [new_title, setNewTitle] = useState(title);
    const sdk = useSdk();
    const { updateAlerts } = useAppContext();
    const { updateCurrentAlert } = useEditingContext();

    useEffect(() => {
        setNewTitle(title);
    }, [open.value]);

    const { showError, showSuccess } = useToast();

    const handleUpdate = async () => {
        updating.setTrue();
        try {
            await sdk.update_alert(alert.id!, {
                ...alert,
                custom_title: new_title?.length ? new_title : undefined,
            });
            updateAlerts();
            showSuccess(new_title?.length ? 'Title updated' : 'Title removed');
            updateCurrentAlert({
                alert: {
                    ...alert,
                    custom_title: new_title?.length ? new_title : undefined,
                },
            });
        } catch (error) {
            showError('Failed to update title');
            console.error(error);
        } finally {
            updating.setFalse();
            open.setFalse();
        }
    };

    return (
        <Popover
            key={open.value ? 'open' : 'closed'}
            isOpen={open.value}
            width="500px"
            canClose={() => true}
            cancelClickOutside={true}
            onClose={() => open.setFalse()}
            content={
                <PopoverLayout header={false} footer={false}>
                    <SpaceVertical gap="medium" width="400px" between>
                        <Heading as="h6" m="none">
                            Update Title
                        </Heading>
                        <SpaceVertical gap="small" flexGrow={1}>
                            <FieldText
                                width="100%"
                                name="title"
                                placeholder={placeholder_title}
                                value={new_title}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </SpaceVertical>
                        <Space justify="end">
                            <ButtonTransparent
                                size="small"
                                onClick={() => open.setFalse()}
                            >
                                Cancel
                            </ButtonTransparent>
                            <LoadingButton
                                flexGrow={false}
                                size="small"
                                is_loading={updating.value}
                                onClick={handleUpdate}
                            >
                                {updating.value ? 'Updating...' : 'Update'}
                            </LoadingButton>
                        </Space>
                    </SpaceVertical>
                </PopoverLayout>
            }
        >
            <IconButton
                onClick={() => open.setTrue()}
                label="Update Title"
                icon={<EditNote size={24} />}
            />
        </Popover>
    );
}

export default UpdateTitle;
