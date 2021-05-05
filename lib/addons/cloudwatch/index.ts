import * as cdk from '@aws-cdk/core';
import { KubernetesManifest } from "@aws-cdk/aws-eks";
import { ManagedPolicy } from "@aws-cdk/aws-iam";
import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";
import { loadYaml, readYamlDocument } from "../../utils/yamlUtils";

export class ContainerInsightsAddOn implements ClusterAddon {

    deploy(scope: cdk.Construct, clusterInfo: ClusterInfo): void {
        const cluster = clusterInfo.cluster;
        console.assert(clusterInfo.nodeGroup || clusterInfo.autoscalingGroup, "ContainerInsightsAddon can only be used with EKS EC2 at the moment. "
            + "If using customer cluster provider, make sure you return the node group");

        const nodeGroup = clusterInfo.nodeGroup || clusterInfo.autoscalingGroup;
        nodeGroup!.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));
        let doc = readYamlDocument(__dirname + '/cwagent-fluentd-quickstart.yaml');
        let docArray = doc.replace(/{{cluster_name}}/g, cluster.clusterName).replace(/{{region_name}}/g, cluster.stack.region).split("---").map(e => loadYaml(e));
        new KubernetesManifest(cluster.stack, "cluster-insights", {
            cluster,
            manifest: docArray
        });
    }
}