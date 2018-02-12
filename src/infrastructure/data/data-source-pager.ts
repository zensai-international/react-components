import { DataSource, DataViewPage } from './data-source';

export interface PageInfo {
    firstIndex: number;
    lastIndex: number;
}

export enum PageType {
    First,
    Next,
    Last,
    Previous
}

export class DataSourcePager {
    private readonly _dataSource: DataSource<any>;

    public constructor(dataSource: DataSource<any>) {
        this._dataSource = dataSource;
    }

    private getDataViewPage(): DataViewPage {
        return (this.dataSource.view ? this.dataSource.view.page : this.dataSource.viewProps.page) || {};
    }

    public getPageCount(): number {
        const page = this.getDataViewPage();

        return page.size
            ? Math.ceil(this.dataSource.view.totalCount / page.size)
            : 1;
    }

    protected getPageIndex(pageType: PageType) {
        const page = this.getDataViewPage();

        switch (pageType) {
            case PageType.First: return 0;
            case PageType.Last: return this.getPageCount() - 1;
            case PageType.Next: return page.index + 1;
            case PageType.Previous: return page.index - 1;
        }
    }

    public canMoveToPage(pageType: PageType): boolean {
        const nextPageIndex = this.getPageIndex(pageType);
        const page = this.dataSource.view.page;
        const pageCount = this.getPageCount();

        return (nextPageIndex >= 0) && (nextPageIndex < pageCount) && (nextPageIndex != page.index);
    }

    public getPageInfo(pageIndex: number): PageInfo {
        const page = this.getDataViewPage();
        const lastPageIndex = (pageIndex + 1) * page.size - 1;
        const totalCount = this.dataSource.view ? this.dataSource.view.totalCount : null;

        return {
            firstIndex: pageIndex * page.size,
            lastIndex: ((totalCount == null) || (lastPageIndex < totalCount))
                ? lastPageIndex
                : (totalCount > 0) ? (totalCount - 1) : 0
        };
    }

    public moveToPage(pageType: PageType) {
        if (!this.canMoveToPage(pageType)) return;

        const pageIndex = this.getPageIndex(pageType);

        this.dataSource.setPageIndex(pageIndex);
        this.dataSource.dataBind();
    }

    public get dataSource(): DataSource<any> {
        return this._dataSource;
    }
}