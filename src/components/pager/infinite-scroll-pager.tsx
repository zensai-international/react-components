import * as React from 'react';
import { DataSourceState, DataSource } from '../../infrastructure/data/data-source';
import { DataSourcePager, PageType } from '../../infrastructure/data/data-source-pager';
import { Event } from '../../infrastructure/event';
import { GridProps, GridHeader } from '../grid';
import { GridBody } from '../grid/table/grid-body';
import * as ReactDOM from 'react-dom';

export interface InfiniteScrollPagerProps {
    dataSource: DataSource;
    isEnabled?: boolean;
    onChanged?: Event<any>;
}

export class InfiniteScrollPager extends React.Component<InfiniteScrollPagerProps, {}> {
    public static defaultProps: Partial<InfiniteScrollPagerProps> = {
        isEnabled: true
    };

    protected readonly gridBodyRef: React.RefObject<GridBody>;
    protected readonly gridHeaderRef: React.RefObject<GridHeader>;

    public constructor(props: InfiniteScrollPagerProps) {
        super(props);

        this.gridBodyRef = React.createRef();
        this.gridHeaderRef = React.createRef();
    }

    public componentDidMount() {
        if (this.props.isEnabled) {
            const { dataSource, onChanged } = this.props;

            this.attachEvents();
            this.changeHeaderPadding();

            dataSource.onDataBound.on(this.handleDataBound);
            if (onChanged) {
                onChanged.on(this.handleDataBound);
            }
        }
    }

    public componentWillReceiveProps(nextProps: InfiniteScrollPagerProps) {
        if (this.props.isEnabled != nextProps.isEnabled) {
            if (nextProps.isEnabled) {
                this.attachEvents();
            } else {
                this.detachEvents();
            }

            this.changeHeaderPadding();
        }

        const { dataSource: currentDataSource } = this.props;
        const { dataSource: nextDataSource } = nextProps;

        if (currentDataSource != nextDataSource) {
            if (currentDataSource) {
                currentDataSource.onDataBound.off(this.handleDataBound);
            }

            if (nextDataSource) {
                nextDataSource.onDataBound.on(this.handleDataBound);
            }
        }
    }

    public componentWillUnmount() {
        if (this.props.isEnabled) {
            this.detachEvents();
        }
        if (this.props.onChanged) {
            this.props.onChanged.off(this.handleDataBound);
        }
    }

    public render(): React.ReactNode {
        type CallbackType = (props: Partial<GridProps>) => React.ReactNode;
        const callback = this.props.children as CallbackType;
        const props: Partial<GridProps> = {
            bodyProps: {
                ref: this.gridBodyRef
            },
            headerProps: {
                ref: this.gridHeaderRef
            }
        };

        return (
            <>
                {callback(props)}
            </>
        );
    }

    protected changeHeaderPadding() {
        const bodyElement = this.getBodyElement();
        const headerElement = this.getHeaderElement();

        if (headerElement) {
            const scrollWidth = bodyElement.offsetWidth - bodyElement.clientWidth;

            headerElement.style.paddingRight = (scrollWidth > 0) ? `${scrollWidth}px` : '';
        }
    }

    protected attachEvents() {
        const bodyElement = this.getBodyElement();

        bodyElement.addEventListener('scroll', this.handleScroll);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);
    }

    protected detachEvents() {
        const bodyElement = this.getBodyElement();

        bodyElement.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }

    protected getBodyElement(): HTMLElement {
        return ReactDOM.findDOMNode(this.gridBodyRef.current) as HTMLElement;
    }

    protected getHeaderElement(): HTMLElement {
        return ReactDOM.findDOMNode(this.gridHeaderRef.current) as HTMLElement;
    }

    protected handleDataBound = () => {
        setTimeout(() => this.changeHeaderPadding(), 0);
    }

    protected handleScroll = () => {
        const { dataSource } = this.props;
        const bodyElement = this.getBodyElement();
        const isEndOfPage = () => bodyElement.scrollHeight - bodyElement.scrollTop <= (bodyElement.clientHeight + 25);

        if ((dataSource.state != DataSourceState.Binding) && isEndOfPage()) {
            const dataSourcePager = new DataSourcePager(dataSource);

            dataSourcePager.moveToPage(PageType.Next);
        }
    }
}