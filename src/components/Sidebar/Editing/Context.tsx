import { ILookerConnection } from '@looker/embed-sdk';
import { mergeWith } from 'lodash';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBoolean } from 'usehooks-ts';
import { useAppContext } from '../../../AppContext';
import { IAlertAndDetail } from '../../../types';

interface EditingContextType {
    current_alert: IAlertAndDetail | undefined;
    dirty: ReturnType<typeof useBoolean>;
    saving: ReturnType<typeof useBoolean>;
    dirty_modal: string | undefined;
    resetFilters: () => void;
    updateCurrentAlert: (alert: Partial<IAlertAndDetail>) => void;
    query_connection: ILookerConnection | undefined;
    setQueryConnection: React.Dispatch<
        React.SetStateAction<ILookerConnection | undefined>
    >;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export const EditingContextProvider: React.FC<{
    children: React.ReactNode;
    editing_alert?: IAlertAndDetail;
}> = ({ children, editing_alert }) => {
    const dirty = useBoolean(false);
    const saving = useBoolean(false);
    const [query_connection, setQueryConnection] = useState<
        ILookerConnection | undefined
    >(undefined);
    const [dirty_modal, setDirtyModal] = useState<string | undefined>(
        undefined
    );
    const [current_alert, setCurrentAlert] = useState<
        IAlertAndDetail | undefined
    >(editing_alert);
    const { embed_connection } = useAppContext();

    const updateCurrentAlert = (alert: Partial<IAlertAndDetail>) => {
        setCurrentAlert((prev) => {
            return mergeWith(prev, alert, (objValue, srcValue) => {
                return srcValue;
            });
        });
    };

    useEffect(() => {
        if (!dirty.value) {
            setCurrentAlert(editing_alert);
            dirty.setFalse();
        } else {
            handleDirtyModal();
        }
    }, [editing_alert]);

    const handleDirtyModal = () => {
        setDirtyModal('dirty');
    };

    const resetFilters = () => {
        if (!current_alert) return;
        current_alert._filter.reset();
        if (embed_connection) {
            embed_connection
                .asDashboardConnection()
                .updateFilters(current_alert._filter.getFilter());
        }
    };

    return (
        <EditingContext.Provider
            value={{
                current_alert,
                dirty,
                saving,
                dirty_modal,
                updateCurrentAlert,
                resetFilters,
                query_connection,
                setQueryConnection,
            }}
        >
            {children}
        </EditingContext.Provider>
    );
};

export const useEditingContext = () => {
    const context = useContext(EditingContext);
    if (context === undefined) {
        throw new Error(
            'useEditingContext must be used within an EditingContextProvider'
        );
    }
    return context;
};
