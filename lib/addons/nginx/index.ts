import * as cdk from '@aws-cdk/core';

import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class NginxAddon implements ClusterAddon {

    deploy(scope: cdk.Construct, clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("ngninx-ingress", {
            chart: "nginx-ingress",
            repository: "https://helm.nginx.com/stable",
            namespace: "kube-system"
        });
    }
}