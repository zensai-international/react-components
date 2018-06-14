export enum SelectionMode {
    None,
    Single,
    Multiple
}

export interface SelectionProps {
    mode: SelectionMode;
    selectedItems: any[];

    onChange: (selectedItems: any[]) => void;
}

export class Selection {
    private readonly _props: SelectionProps;

    public constructor(props: SelectionProps) {
        this._props = props;
    }

    protected handleChange(selectedItems: any[]) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(selectedItems);
        }
    }

    public select(item: any) {
        const { mode, selectedItems } = this.props;

        if (mode) {
            const itemIndex = selectedItems.indexOf(item);

            if (itemIndex == -1) {
                if ((mode == SelectionMode.Single) && selectedItems.length) {
                    selectedItems.length = 0;
                }

                selectedItems.push(item);

                this.handleChange(selectedItems);
            }
        }
    }

    public unselect(item: any) {
        const { mode, selectedItems } = this.props;

        if (mode) {
            const itemIndex = selectedItems.indexOf(item);

            if (itemIndex != -1) {
                selectedItems.splice(itemIndex, 1);

                this.handleChange(selectedItems);
            }
        }
    }

    protected get props(): SelectionProps {
        return this._props;
    }
}