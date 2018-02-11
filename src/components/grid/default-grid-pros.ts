import { GridProps } from './grid';

export const DefaultGridProps: Partial<GridProps> = {
    messages: {
        loading: '',
        noItems: ''
    },
    selectionMode: 0,
    style: {
        className: '',
        body: {
            className: '',
            row: {
                className: '',
                cell: {
                    className: ''
                },
                ifSelected: {
                    className: ''
                }
            }
        },
        header: {
            row: {
                className: '',
                cell: {
                    className: '',
                    filterIcon: (isFiltered: boolean) => ({ className: '' }),
                    iconBySortDirection: {
                        [1]: { className: '' },
                        [2]: { className: '' }
                    },
                    title: {
                        className: ''
                    }
                }
            }
        }
    }
};