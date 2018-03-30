import * as React from 'react';
import * as ReactDom from 'react-dom';

export interface ConfirmationDialogProps {
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    content?: React.ReactNode;
    title?: React.ReactNode;
}

interface ConfirmationDialogInternalProps {
    cancel: () => void;
    confirm: () => void;
}

export interface ConfirmationDialogState {
    isOpen: boolean
}

export class ConfirmationDialog<P extends ConfirmationDialogProps = ConfirmationDialogProps, S extends ConfirmationDialogState = ConfirmationDialogState> extends React.Component<P, S> {
    private static _instance: Element;

    public constructor(props: P) {
        super(props);

        this.state = { isOpen: true } as S;
    }

    public static render(dialog: JSX.Element) {
        const container = document.createElement('div');

        document.body.appendChild(container);

        ConfirmationDialog._instance = ReactDom.render(dialog, container) as Element;
    }

    protected destroy() {
        if (ConfirmationDialog._instance) {
            const container = ReactDom.findDOMNode(ConfirmationDialog._instance);

            ReactDom.unmountComponentAtNode(container);
            container.parentElement.remove();
            ConfirmationDialog._instance = null;
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
            (this.props as any as ConfirmationDialogInternalProps).confirm();

            this.destroy();
        });
    }
}

export declare type ConfirmFunc<P extends ConfirmationDialogProps = ConfirmationDialogProps> = (props?: P) => Promise<{}>;

export function createConfirm<P extends ConfirmationDialogProps = ConfirmationDialogProps>(dialog: (props: P) => JSX.Element): ConfirmFunc {
    return function(props: P): Promise<{}> {
        return new Promise((resolve, reject) => {
            const requiredProps: ConfirmationDialogInternalProps = {
                cancel: reject,
                confirm: resolve
            };
            const resultProps = (props ? Object.assign({}, props, requiredProps) : requiredProps) as any;

            ConfirmationDialog.render(dialog(resultProps));
        });
    };
}