import { Server, Socket } from "net";
import { SocketObjectStream } from "@piros/utils";
import { ReplicaMessage, ReplicaStatus, AplicationService } from "../interface/aplication-status";


export class StatusServer {

    //Map serviceName --> (Map replicaHost --> replicadata)
    private services: Map<string, Map<string, { sender: SocketObjectStream; status: ReplicaStatus }>> = new Map();

    constructor(port: number) {
        const server: Server = new Server((socket: Socket) => {
            console.log(`StatusServer: Socket connected adress: '${socket.remoteAddress}'`);
        
            const sender = new SocketObjectStream(socket);
        
            sender.getReceivedMessages().subscribe((message: ReplicaMessage) => {

                let service = this.services.get(message.serviceName);
                if (!service) {
                    service = new Map();
                }
                service.set(message.replicaStatus.host, { sender: sender, status: message.replicaStatus })
                this.services.set(message.serviceName, service);
                this.broadcastUpdatedStatus(message.serviceName);

                socket.on('close', () => {
                    this.removeReplica(message.serviceName, message.replicaStatus.host);
                    this.broadcastUpdatedStatus(message.serviceName);
                });

                this.sendStatusToReplica(sender);
            });

            socket.on('error', () => {});
            
        });
        
        server.listen(port);
    }

    private removeReplica(serviceName: string, replicaHost: string) {
        let service = this.services.get(serviceName);
        if (service) {
            service.delete(replicaHost);
            if (service.size > 0) {
                this.services.set(serviceName, service);
            } else {
                this.services.delete(serviceName);
            }
        }
    }

    private broadcastUpdatedStatus(serviceName: string) {
        const newStatus = this.getServiceStatusMessage(serviceName);

        this.services.forEach((value, key) => {
            value.forEach((value2) => {
                value2.sender.sendMessage(newStatus);
            });
        });
    }

    private sendStatusToReplica(sender: SocketObjectStream) {
        this.services.forEach((value, serviceName) => {
            sender.sendMessage(this.getServiceStatusMessage(serviceName));
        });
    }

    private getServiceStatusMessage(serviceName: string): AplicationService {

        const replicas: ReplicaStatus[] = [];

        if (this.services.has(serviceName)) {
            this.services.get(serviceName).forEach((replicaData) => {
                replicas.push(replicaData.status);
            });
        }

        return {
            name: serviceName,
            replicas: replicas
        };
    }
}