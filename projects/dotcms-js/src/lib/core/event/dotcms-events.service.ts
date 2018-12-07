import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Protocol } from '../util/protocol';
import { SocketFactory } from '../socket-factory.service';
import { DotEventTypeWrapper } from './model/dot-event-type-wrapper';
import { DotEventData } from './model/dot-event-data';

@Injectable()
export class DotcmsEventsService {
    private socket: Protocol;
    private subjects: Subject<any>[] = [];

    constructor(private socketFactory: SocketFactory) {}

    /**
     * Close the socket
     */
    destroy(): void {
        this.socket.destroy();
        this.socketFactory.clean();
        this.socket = null;
    }

    /**
     * Start the socket
     */
    start(): void {
        if (!this.socket) {
            this.socketFactory.createSocket().subscribe((socket) => {
                this.socket = socket;

                socket.message$().subscribe(
                    (data) => {
                        if (!this.subjects[data.event]) {
                            this.subjects[data.event] = new Subject();
                        }
                        this.subjects[data.event].next(data.payload);
                    }
                );

                socket.start();
            });
        }
    }

    /**
     * This method will be called by clients that want to receive notifications
     * regarding incoming system events. The events they will receive will be
     * based on the type of event clients register for.
     *
     * @param clientEventType - The type of event clients will get. For example,
     *                          "notification" will allow a client to receive the
     *                          messages in the Notification section.
     * @returns any The system events that a client will receive.
     */
    subscribeTo(clientEventType: string): Observable<DotEventData> {
        if (!this.subjects[clientEventType]) {
            this.subjects[clientEventType] = new Subject();
        }

        return this.subjects[clientEventType].asObservable();
    }

    subscribeToEvents(clientEventTypes: string[]): Observable<DotEventTypeWrapper> {
        const subject: Subject<DotEventTypeWrapper> = new Subject<DotEventTypeWrapper>();

        clientEventTypes.forEach((eventType) =>
            this.subscribeTo(eventType).subscribe((data) =>
                subject.next({
                    data: data,
                    eventType: eventType
                })
            )
        );

        return subject.asObservable();
    }
}