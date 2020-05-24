import { Injectable } from "@piros/ioc";
import { ReplicaStatus } from "../interface/aplication-status";

@Injectable
export class DefaultStatusProvider {

    constructor() {}

    public get defaultStatus(): ReplicaStatus {
        return {
            host: process.env.POD_IP,
            replicaData: null
        };
    }
}