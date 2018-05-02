import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ClientDataSourceProvider } from '../src/components/data/client-data-source-provider';
import { GridColumn, GridBodyRow, GridBodyRowProps, GridExpanderColumn, GridSelectionMode, GridSelectorColumn, table } from '../src/components/grid/index';
import { InfiniteScrollPager } from '../src/components/pager/infinite-scroll-pager';
import { DataSource, DataViewMode } from '../src/infrastructure/data/index';

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

function renderBodyRow(rowType: { new (): GridBodyRow }, props: GridBodyRowProps): JSX.Element[] {
    const Row = rowType;
    const item = props.item;

    return props.isExpanded
        ? [<Row {...props} />].concat(item.subItems.map(x => [<Row {...props} isExpandable={false} item={x} />]))
        : [<Row {...props} />];
}

ReactDom.render(
    <ClientDataSourceProvider data={() => getData(10000)} view={{ mode: DataViewMode.FromFirstToCurrentPage, page: { size: 100 }}}>
        {
            (dataSource: DataSource) =>
                <InfiniteScrollPager dataSource={dataSource}>
                    <table.Grid autoBind={true} bodyRowTemplate={renderBodyRow} dataSource={dataSource} key="grid" selectionMode={GridSelectionMode.Multiple}>
                        <GridSelectorColumn />
                        <GridExpanderColumn />
                        <GridColumn field="title" title="Title" />
                        <GridColumn field="description" title="Description" />
                        <GridColumn
                            isSortable={false}
                            body={{ template: (x) => (<a href="#">{x.title}</a>) }}
                            title="Link" />
                    </table.Grid>
                </InfiniteScrollPager>
        }
    </ClientDataSourceProvider>,
    document.getElementById('grid')
);