import { DataSource } from './data-source';

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

    public getPageCount(): number {
        return this.dataSource.pageSize
            ? Math.ceil(this.dataSource.firstPageSize
                ? ((this.dataSource.view.totalCount - this.dataSource.firstPageSize) / this.dataSource.pageSize + 1)
                : (this.dataSource.view.totalCount / this.dataSource.pageSize))
            : 1;
    }

    protected getPageIndex(pageType: PageType) {
        switch (pageType) {
            case PageType.First: return 0;
            case PageType.Last: return this.getPageCount() - 1;
            case PageType.Next: return this.dataSource.view.pageIndex + 1;
            case PageType.Previous: return this.dataSource.view.pageIndex - 1;
        }
    }

    public canMoveToPage(pageType: PageType): boolean {
        const nextPageIndex = this.getPageIndex(pageType);
        const pageCount = this.getPageCount();

        return (nextPageIndex >= 0) && (nextPageIndex < pageCount) && (nextPageIndex != this.dataSource.view.pageIndex);
    }

    public getPageInfo(pageIndex: number): PageInfo {
        const lastPageIndex = (pageIndex + 1) * this.dataSource.pageSize - 1;
        const totalCount = this.dataSource.view ? this.dataSource.view.totalCount : null;

        return {
            firstIndex: pageIndex * this.dataSource.pageSize,
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