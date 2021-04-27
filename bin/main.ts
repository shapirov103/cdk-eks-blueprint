#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { InstanceType, IVpc } from '@aws-cdk/aws-ec2';
import { Cluster, FargateProfileOptions, KubernetesVersion, MachineImageType, NodegroupAmiType } from '@aws-cdk/aws-eks';

// Blueprint
import { CdkEksBlueprintStack, ClusterAddon, ClusterInfo, ClusterProvider, TeamSetup } from '../lib/eksBlueprintStack';

// Addons 
import * as Addons from '../lib/addons'

// Pipeline
import { PipelineStack } from '../lib/pipelineStack';

// Cluster Providers
import { EC2ClusterProvider, EC2ProviderClusterProps } from '../lib/ec2-cluster-provider';
import { FargateClusterProvider } from '../lib/fargate-cluster-provider';

// Teams
import { TeamBurnhamSetup } from '../lib/teams/team-burnham/setup';
import { TeamRikerSetup } from '../lib/teams/team-riker/setup';
import { TeamTroiSetup } from '../lib/teams/team-troi/setup';

const app = new cdk.App();

const clusterAddons: Array<ClusterAddon> = [
    new Addons.CalicoAddon,
    new Addons.MetricsServerAddon,
    new Addons.ClusterAutoScalerAddon,
    new Addons.ContainerInsightsAddOn,
    new Addons.NginxAddon,
    new Addons.ArgoCDAddon
];

const allTeams: Array<TeamSetup> = [
    new TeamTroiSetup,
    new TeamRikerSetup,
    new TeamBurnhamSetup
];

new PipelineStack(app, "factory-pipeline", {
    env: {
        account: "929819487611",
        region: 'us-east-2'
    },
});

new CdkEksBlueprintStack(app, { id: 'east-dev', addons: clusterAddons, teams: allTeams }, {
    env: {
        region: 'us-east-2'
    },
});

new CdkEksBlueprintStack(app, { id: 'west-dev', addons: clusterAddons, teams: allTeams }, {
    env: {
        region: 'us-west-2'
    },
});

new CdkEksBlueprintStack(app, { id: 'east-test-main', addons: clusterAddons }, {
    env: {
        account: '929819487611',
        region: 'us-east-1',
    },
});

const fargateProfiles: Map<string, FargateProfileOptions> = new Map([
    ["dynatrace", { selectors: [{ namespace: "dynatrace" }] }]
]);

new CdkEksBlueprintStack(app, { id: 'east-fargate-test', clusterProvider: new FargateClusterProvider(fargateProfiles) }, {
    env: {
        region: 'us-east-1'
    }
})

class BottlerocketClusterProvider implements ClusterProvider {
    createCluster(scope: cdk.Construct, vpc: IVpc, version: KubernetesVersion): ClusterInfo {

        const cluster = new Cluster(scope, scope.node.id, {
            vpc: vpc,
            clusterName: scope.node.id,
            outputClusterName: true,
            defaultCapacity: 0, // we want to manage capacity ourselves
            version: version,
        })
            ;
        const nodeGroup = cluster.addAutoScalingGroupCapacity('BottlerocketNodes', {
            instanceType: new InstanceType('t3.small'),
            minCapacity: 2,
            machineImageType: MachineImageType.BOTTLEROCKET
        });

        return { cluster: cluster, autoscalingGroup: nodeGroup, version }

    }
}

new CdkEksBlueprintStack(app, { id: 'east-br-test', clusterProvider: new BottlerocketClusterProvider }, {
    env: {
        region: 'us-east-1'
    }
})

const props: EC2ProviderClusterProps = {
    version: KubernetesVersion.V1_19,
    instanceType: new InstanceType('t3.large'),
    amiType: NodegroupAmiType.AL2_X86_64
}

const myClusterProvider = new EC2ClusterProvider(props);

new CdkEksBlueprintStack(app, { id: "test-cluster-provider", clusterProvider: myClusterProvider });