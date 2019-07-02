import * as React from 'react';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';
import { DataSourcePager, PageType } from '../../infrastructure/data/data-source-pager';

export interface InfiniteScrollPagerProps {
    dataSource: DataSource;
    isEnabled?: boolean;
    scrollableElement: () => HTMLElement;
}

export class InfiniteScrollPager extends React.Component<InfiniteScrollPagerProps, {}> {
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
            <>
                {this.props.children}
            </>
        );
    }

    protected attachEvents() {
        const scrollableElement = this.props.scrollableElement();

        scrollableElement.addEventListener('scroll', this.handleScroll);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);
    }

    protected detachEvents() {
        const scrollableElement = this.props.scrollableElement();

        scrollableElement.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
    }

    protected handleScroll = () => {
        const { dataSource } = this.props;
        const scrollableElement = this.props.scrollableElement();

        if ((dataSource.state != DataSourceState.Binding)
            && (scrollableElement.scrollHeight - scrollableElement.scrollTop <= (scrollableElement.clientHeight + 25))) {
            const dataSourcePager = new DataSourcePager(dataSource);

            dataSourcePager.moveToPage(PageType.Next);
        }
    }
}