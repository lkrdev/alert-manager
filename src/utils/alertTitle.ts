import { ComparisonType, IAlert } from '@looker/sdk';
type TDateOperator = 'INCREASES_BY' | 'DECREASES_BY' | 'CHANGES_BY';

const date_operator: { [key: TDateOperator[number]]: string } = {
    INCREASES_BY: 'increases by',
    DECREASES_BY: 'decreases by',
    CHANGES_BY: 'changes by',
};

type TBaseOperator =
    | 'GREATER_THAN'
    | 'LESS_THAN'
    | 'EQUAL_TO'
    | 'GREATER_THAN_OR_EQUAL_TO'
    | 'LESS_THAN_OR_EQUAL_TO';

const base_operator: { [key: TBaseOperator[number]]: string } = {
    GREATER_THAN: 'is greater than',
    LESS_THAN: 'is less than',
    EQUAL_TO: 'is equal to',
    GREATER_THAN_OR_EQUAL_TO: 'is greater than or equal to',
    LESS_THAN_OR_EQUAL_TO: 'is less than or equal to',
};

export const getOperator = (operator: ComparisonType): string => {
    return base_operator[operator] || date_operator[operator] || '';
};

export const getAlertTitle = (alert: IAlert, custom_title?: string) => {
    if (custom_title?.length) {
        return custom_title;
    } else if (alert.custom_title?.length) {
        return alert.custom_title;
    }
    // 1. Determine the Comparison Operator Text using direct map lookup (O(1))
    // We use the alert.type directly as the key to look up the comparison string.
    const comparison = getOperator(alert.comparison_type);

    // 2. Determine the Threshold Value
    let thresholdValue: string;

    if (typeof alert.threshold !== undefined) {
        // If no userInput, use the alert's threshold value if present
        thresholdValue = String(alert.threshold);
    } else {
        // Default fallback
        thresholdValue = '...';
    }

    // 3. Construct and Return the Rule String
    const fieldTitle =
        alert.field && alert.field.title ? alert.field.title : '';

    return `${fieldTitle} ${comparison} ${thresholdValue}`;
};
