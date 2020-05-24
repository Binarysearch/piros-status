
export interface ReplicaMessage {
    serviceName: string;
    replicaStatus: ReplicaStatus;
}

export interface ReplicaStatus {
    host: string;
    replicaData: any;
}

export interface AplicationService {
    name: string;
    replicas: ReplicaStatus[];
}

export interface AplicationStatus {
    services: Map<string, AplicationService>;
}