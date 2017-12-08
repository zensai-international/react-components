import * as React from 'react';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';
import { DataSourcePager, PageType } from '../../infrastructure/data/data-source-pager';

function isElementVisible(element) {
    let top = element.offsetTop;
    let left = element.offsetLeft;
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    while(element.offsetParent) {
        element = element.offsetParent;
        top += element.offsetTop;
        left += element.offsetLeft;
    }

    return top >= window.pageYOffset
        && left >= window.pageXOffset
        && (top + height) <= (window.pageYOffset + window.innerHeight)
        && (left + width) <= (window.pageXOffset + window.innerWidth);
}

export interface InfiniteScrollPagerProps {
    isEnabled?: boolean;
    dataSource: DataSource<any>;
    containerClass?: string
}

export class InfiniteScrollPager extends React.Component<InfiniteScrollPagerProps, any> {
    private _visibilityDetector: HTMLElement;
 
    public constructor(props: InfiniteScrollPagerProps) {
        super(props);

        this.state = { isLoading: false };
        
        this.handleScroll = this.handleScroll.bind(this);
    }

    protected attachEvents() {
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);
    }

    protected detachEvents() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }

    protected handleScroll() {
        if ((this.props.dataSource.state != DataSourceState.Binding) && isElementVisible(this._visibilityDetector)) {
            const dataSourcePager = new DataSourcePager(this.props.dataSource);
            dataSourcePager.moveToPage(PageType.Next);
        }
    }

    public componentDidMount() {
        if (this.props.isEnabled != false) {
            this.attachEvents();
        }
    }

    public componentWillReceiveProps(nextProps: InfiniteScrollPagerProps) {
        if (this.props.isEnabled != nextProps.isEnabled) {
            if (nextProps.isEnabled) {
                this.attachEvents();
            } else {
                this.detachEvents();
            }
        }
    }

    public componentWillUnmount() {
        if (this.props.isEnabled) {
            this.detachEvents();
        }
    }

    public render(): JSX.Element {
        return (
            <div onScroll={this.handleScroll} >
                {this.props.children}
                <div ref={x => this._visibilityDetector = x} />
            </div>
        );
    }
}