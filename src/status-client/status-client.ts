import { Injectable } from "@piros/ioc";
import { Socket } from "net";
import { SocketObjectStream } from "@piros/utils";
import { Subscription, Subject, Observable } from "rxjs";
import { AplicationService, ReplicaStatus } from "../interface/aplication-status";
import { DefaultStatusProvider } from "../service/default-status-provider";

const DEFAULT_SERVICE_NAME = 'DEFAULT_SERVICE_NAME';
const DEFAULT_SERVER_HOST = 'localhost';
const DEFAULT_SERVER_PORT = 12345;
const DEFAULT_RECONNECT_INTERVAL = 1000;

@Injectable
export class StatusClient {

    private serverHost: string;
    private serverPort: number;
    private reconnectInterval: number;
    private serviceName: string;

    private objectStream: SocketObjectStream;
    private objectStreamSubscription: Subscription;

    private status: ReplicaStatus;

    private serviceUpdates: Subject<AplicationService> = new Subject();

    constructor(
        private defaultStatusProvider: DefaultStatusProvider
    ) {
        this.status = this.defaultStatusProvider.defaultStatus;
        this.serverHost = process.env.PIROS_STATUS_SERVER_HOST ? process.env.PIROS_STATUS_SERVER_HOST : DEFAULT_SERVER_HOST;
        this.serverPort = process.env.PIROS_STATUS_SERVER_PORT ? <any>(process.env.PIROS_STATUS_SERVER_PORT) : DEFAULT_SERVER_PORT;
        this.reconnectInterval = process.env.PIROS_STATUS_RECONNECT_INTERVAL ? <any>(process.env.PIROS_STATUS_RECONNECT_INTERVAL) : DEFAULT_RECONNECT_INTERVAL;
        this.serviceName = process.env.PIROS_STATUS_SERVICE_NAME ? process.env.PIROS_STATUS_SERVICE_NAME : DEFAULT_SERVICE_NAME;
        this.startStickyConnection();
    }

    private startStickyConnection() {

        const connect = () => {
            console.log(`StatusClient: connecting...`);
            const socket = new Socket();

            socket.on('close', () => {
                console.log(`StatusClient: connection closed.`);
                setTimeout(() => {
                    connect();
                }, this.reconnectInterval);
            });

            socket.on('error', (error) => {
                console.log(`StatusClient: connection error. ${error}`);
            });

            socket.connect(this.serverPort, this.serverHost, () => {
                console.log(`StatusClient: connected`);
                const objectStream = new SocketObjectStream(socket);
                this.clearSubscriptions();
                this.setObjectStream(objectStream);
                this.sendStatus();
            });
        }
        
        connect();
    }

    private sendStatus() {
        if (this.objectStream) {
            this.objectStream.sendMessage({ 
                serviceName: this.serviceName, 
                replicaStatus: this.status
            });
        }
    }

    private clearSubscriptions() {
        if (this.objectStreamSubscription) {
            this.objectStreamSubscription.unsubscribe();
        }
    }
    
    private setObjectStream(objectStream: SocketObjectStream) {
        this.objectStream = objectStream;
        this.objectStreamSubscription = this.objectStream.getReceivedMessages().subscribe((message) => {
            this.onMessageReceived(message);
        });
    }

    private onMessageReceived(message: AplicationService) {
        this.serviceUpdates.next(message);
    }
    
    public getServiceUpdates(): Observable<AplicationService> {
        return this.serviceUpdates.asObservable();
    }

    public setStatus(status: ReplicaStatus): void {
        this.status = status;
        this.sendStatus();
    }
}