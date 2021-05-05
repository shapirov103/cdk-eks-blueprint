import * as cdk from '@aws-cdk/core';

import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

const AROG_NS = 'argocd-ns'
const ARGO_SERVER_NAME = "argocd-server"

export class ArgoCDAddon implements ClusterAddon {

    deploy(scope: cdk.Construct, clusterInfo: ClusterInfo): void {
        const cluster = clusterInfo.cluster
        cluster.addHelmChart("argocd-addon", {
            chart: "argo-cd",
            repository: "https://argoproj.github.io/argo-helm",
            namespace: AROG_NS,
            version: '0.16.10',
            values: {
                "server.name": ARGO_SERVER_NAME,
                "server.service.type": 'LoadBalancer',
            }
        });
    }
}