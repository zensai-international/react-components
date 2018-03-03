import * as React from 'react';
import * as ReactDom from 'react-dom';
import { GridColumn, GridBodyRow, GridBodyRowProps, GridExpanderColumn, GridSelectionMode, GridSelectorColumn, table } from '../src/components/grid/index';
import { InfiniteScrollPager } from '../src/components/pager/infinite-scroll-pager';
import { ClientDataSource } from '../src/infrastructure/data/client-data-source';
import { DataViewMode } from '../src/infrastructure/data/data-source';

function getData(count: number): any[] {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push({
            description: `description${i}`, title: `title${i}`, subItems: [
                { description: `${i}-1-d`, title: `${i}-1-t` },
                { description: `${i}-2-d`, title: `${i}-2-t` },
                { description: `${i}-3-d`, title: `${i}-3-t` }
            ]
        })
    }

    return result;
}

const data = getData(10000);
const dataSource = new ClientDataSource({
    data: () => data,
    view: {
        mode: DataViewMode.FromFirstToCurrentPage,
        page: { size: 100 }
    }
});

function renderBodyRow(rowType: { new (): GridBodyRow }, props: GridBodyRowProps): JSX.Element[] {
    const Row = rowType;
    const columns = [
        new GridColumn({ body: { template: () => '' } }),
        new GridColumn({ body: { template: () => '' } }),
        new GridColumn({ field: 'title', title: 'Title' }),
        new GridColumn({ field: 'description', title: 'description' })
    ];
    const item = props.item;
    const childDataSource = new ClientDataSource<any>({ data: () => item.subItems });

    childDataSource.dataBind();

    return props.isExpanded
        ? [<Row {...props} />].concat(item.subItems.map(x => [<Row {...props} columns={columns} item={x} />]))
        : [<Row {...props} />];
}

ReactDom.render(
    <InfiniteScrollPager dataSource={dataSource}>
        <table.Grid autoBind={true} bodyRowTemplate={renderBodyRow} dataSource={dataSource} selectionMode={GridSelectionMode.Multiple}>
            <GridSelectorColumn />
            <GridExpanderColumn />
            <GridColumn field="title" title="Title" />
            <GridColumn field="description" title="Description" />
            <GridColumn
                isSortable={false}
                body={{ template: (x) => (<a href="#">{x.title}</a>) }}
                title="Link" />
        </table.Grid>
    </InfiniteScrollPager>,
    document.getElementById('grid')
);