import { Heading } from '@looker/components';
import React from 'react';

interface DashboardTitleProps {
    title?: string;
    dashboard_id: string;
    children?: React.ReactNode;
}

const DashboardTitle: React.FC<DashboardTitleProps> = ({
    title,
    dashboard_id,
    children,
}) => {
    return (
        <Heading as="h4">
            {title || dashboard_id}
            {children && <> </>}
            {children}
        </Heading>
    );
};

export default DashboardTitle;
