import { Injectable } from '@piros/ioc';
import { Observable, BehaviorSubject } from 'rxjs';
import { AplicationStatus, ReplicaStatus } from '../interface/aplication-status';
import { StatusClient } from '../status-client/status-client';

@Injectable
export class AplicationStatusService {

    private status: BehaviorSubject<AplicationStatus> = new BehaviorSubject({ services: new Map() });

    constructor(
        private statusClient: StatusClient
    ) {
        this.statusClient.getServiceUpdates().subscribe((serviceStatus) => {
            const newStatus = this.status.value;
            newStatus.services.set(serviceStatus.name, serviceStatus);
            this.status.next(newStatus);
        });
    }

    public getStatus(): Observable<AplicationStatus> {
        return this.status.asObservable();
    }

    public setStatus(status: ReplicaStatus): void {
        this.statusClient.setStatus(status);
    }
}