import * as React from 'react';
import * as ReactDom from 'react-dom';
import { GridColumn } from '../src/components/grid/grid-column';
// import { GridDetailsColumn } from '../src/components/grid/grid-details-column';
import { InfiniteScrollPager } from '../src/components/pager/infinite-scroll-pager';
import { Grid } from '../src/components/grid/grid';
import { ClientDataSource } from '../src/infrastructure/data/client-data-source';
import { DataViewMode } from '../src/infrastructure/data/data-source';

function getData(count: number): any[] {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push({ description: `description${i}`, title: `title${i}` })
    }

    return result;
}

const data = getData(1000);
const dataSource = new ClientDataSource(data, { pageSize: 50, viewMode: DataViewMode.FromFirstToCurrentPage });

ReactDom.render(
    <InfiniteScrollPager dataSource={dataSource}>
        <Grid autoBind={true} dataSource={dataSource}>
            {/* <GridDetailsColumn detailsRowTemplate={(column, model, rowIndex) =>
                <Grid autoBind={true} dataSource={new ClientDataSource(data)}>
                    <GridColumn field="title" title="Title" />
                </Grid>
            } /> */}
            <GridColumn field="title" title="Title" />
            <GridColumn field="description" title="Description" />
            <GridColumn
                isSortable={false}
                /*body={{ template: (sender, x) => (<a href="#">{x.title}</a>)}}*/
                title="Link" />
        </Grid>
    </InfiniteScrollPager>,
    document.getElementById('grid')
);