import * as React from 'react';

export interface ConfirmationDialogProps {
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    content?: React.ReactNode;
    title?: React.ReactNode;
}

interface ConfirmationDialogInternalProps {
    cancel: () => void;
    confirm: (state: ConfirmationDialogState) => void;
}

export interface ConfirmationDialogState {
    isOpen: boolean
}

export class ConfirmationDialog<P extends ConfirmationDialogProps = ConfirmationDialogProps, S extends ConfirmationDialogState = ConfirmationDialogState> extends React.Component<P, S> {
    private static _container: React.Component;
    private static _renderContainerContent: () => React.ReactNode;

    public constructor(props: P) {
        super(props);

        this.state = { isOpen: true } as S;
    }

    public static render(container: React.Component, dialog: React.ReactNode) {
        this._container = container;
        this._renderContainerContent = container.render;

        container.render = () => {
            const { isConfirmationDialogOpen } = container.state as any;
            const renderContainerContent = ConfirmationDialog._renderContainerContent.bind(container);

            return (
                <>
                    {renderContainerContent()}
                    {isConfirmationDialogOpen && dialog}
                </>
            );
        };

        container.setState({ isConfirmationDialogOpen: true });
    }

    protected destroy() {
        if (ConfirmationDialog._container && ConfirmationDialog._renderContainerContent) {
            ConfirmationDialog._container.render = ConfirmationDialog._renderContainerContent;

            ConfirmationDialog._container.setState({ isConfirmationDialogOpen: false }, () => {
                ConfirmationDialog._container = null;
                ConfirmationDialog._renderContainerContent = null;
            });
        }
    }

    protected handleCancel = () => {
        this.setState({ isOpen: false }, () => {
            (this.props as any as ConfirmationDialogInternalProps).cancel();

            this.destroy();
        });
    }

    protected handleConfirm = () => {
        this.setState({ isOpen: false }, () => {
            (this.props as any as ConfirmationDialogInternalProps).confirm(this.state);

            this.destroy();
        });
    }
}

export declare type ConfirmFunc<P extends ConfirmationDialogProps = ConfirmationDialogProps> = (container: React.Component, props?: P) => Promise<{}>;

export function createConfirm<P extends ConfirmationDialogProps = ConfirmationDialogProps>(dialog: (props: P) => JSX.Element): ConfirmFunc<P> {
    return function (container, props: P): Promise<{}> {
        return new Promise((resolve, reject) => {
            const requiredProps: ConfirmationDialogInternalProps = {
                cancel: reject,
                confirm: resolve
            };
            const resultProps = (props ? Object.assign({}, props, requiredProps) : requiredProps) as any;

            ConfirmationDialog.render(container, dialog(resultProps));
        });
    };
}