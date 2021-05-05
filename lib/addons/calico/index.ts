import * as cdk from '@aws-cdk/core';
import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class CalicoAddon implements ClusterAddon {

    deploy(scope: cdk.Construct, clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("calico-addon", {
            chart: "aws-calico",
            repository: "https://aws.github.io/eks-charts",
            namespace: "kube-system"
        });
    }
}
