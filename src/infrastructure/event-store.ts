import { Event } from './event';
import { GridColumn, GridColumnProps } from "../components/grid/grid-column-base";

export class EventsStore {

    private _onCellClick: Event<{column: GridColumn<GridColumnProps>, model: any}>;
    
    private _onExpandOrCollapseContent: Event<any>;

    constructor(){
        this._onCellClick = new Event();
        this._onExpandOrCollapseContent = new Event();
    }

    public get onExpandOrCollapseContent() {
        return this._onExpandOrCollapseContent;
    }

    public get onCellClick() {
        return this._onCellClick;
    }

}