export type EventHandler<T> = { (sender: any, eventArgs?: T): void; };

export class Event<T> {
    private handlers: EventHandler<T>[] = [];

    public off(handler: EventHandler<T>) {
        this.handlers = this.handlers.filter(x => x != handler);
    }

    public on(handler: EventHandler<T>) {
        if (this.handlers.indexOf(handler) == -1) {
            this.handlers.push(handler);
        }
    }

    public trigger(sender: any, eventArgs?: T) {
        this.handlers.forEach(x => x(sender, eventArgs));
    }
}