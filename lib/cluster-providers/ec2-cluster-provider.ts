import { Construct } from "@aws-cdk/core";
import { InstanceType, IVpc, SubnetSelection, Vpc } from "@aws-cdk/aws-ec2";
import { Cluster, CommonClusterOptions, KubernetesVersion, NodegroupAmiType } from "@aws-cdk/aws-eks";

import { ClusterInfo, ClusterProvider } from "../stacks/eks-blueprint-stack";

export interface EC2ProviderClusterProps extends CommonClusterOptions {
    /**
     * Instance type for the cluster. Defaults to m5.large.
     */
    instanceType?: InstanceType;

    /**
     * Min instance count for the cluster.
     */
    minSize?: number;

    /**
     * Max instance count for the cluster.
     */
    maxSize?: number;

    /**
     * AMI type fo the cluster.
     */
    amiType?: NodegroupAmiType.AL2_X86_64;

    /**
     * VPC Subnets for the cluster.
     */
    vpcSubnets?: SubnetSelection[];
}

export class EC2ClusterProvider implements ClusterProvider {

    readonly providerOptions: EC2ProviderClusterProps;

    constructor(options?: EC2ProviderClusterProps) {
        this.providerOptions = options ?? { version: KubernetesVersion.V1_19 };
    }

    createCluster(scope: Construct, vpc: IVpc, version: KubernetesVersion): ClusterInfo {

        const id = scope.node.id;

        const cluster = new Cluster(scope, id, {
            vpc: vpc,
            clusterName: id,
            outputClusterName: true,
            defaultCapacity: 0, // we want to manage capacity ourselves
            version: this.providerOptions.version,
            vpcSubnets: this.providerOptions.vpcSubnets,
        });

        const nodeGroup = cluster.addNodegroupCapacity(id + "-ng", {
            instanceType: this.providerOptions.instanceType,
            amiType: this.providerOptions.amiType,
            minSize: this.providerOptions.minSize,
            maxSize: this.providerOptions.maxSize
        });

        return { cluster: cluster, nodeGroup: nodeGroup, version: version };
    }

}