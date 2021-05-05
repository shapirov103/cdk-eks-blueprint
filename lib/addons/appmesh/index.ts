import * as cdk from '@aws-cdk/core';
import { ManagedPolicy } from "@aws-cdk/aws-iam";

import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class AppMeshAddon implements ClusterAddon {

    deploy(scope: cdk.Construct, clusterInfo: ClusterInfo): void {

        const cluster = clusterInfo.cluster;

        // App Mesh service account.
        const opts = { name: 'appmesh-controller', namespace: "appmesh-system" }
        const sa = cluster.addServiceAccount('appmesh-controller', opts);

        // Cloud Map access policy.
        const cloudMapPolicy = ManagedPolicy.fromAwsManagedPolicyName("AWSCloudMapFullAccess")
        sa.role.addManagedPolicy(cloudMapPolicy);

        // App Mesh access policy.
        const appMeshPolicy = ManagedPolicy.fromAwsManagedPolicyName("AWSAppMeshFullAccess")
        sa.role.addManagedPolicy(appMeshPolicy);

        // App Mesh Namespace
        const appMeshNS = cluster.addManifest('appmesh-ns', {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: { name: 'appmesh-system' }
        });
        sa.node.addDependency(appMeshNS);

        // App Mesh Controller        
        const chart = cluster.addHelmChart("AppMeshAddon", {
            chart: "appmesh-controller",
            repository: "https://aws.github.io/eks-charts",
            release: "appm-release",
            namespace: "appmesh-system",
            values: {
                "region": cluster.stack.region,
                "serviceAccount.create": false,
                "serviceAccount.name": "appmesh-controller"
            }
        });
        chart.node.addDependency(sa);
    }
}