> :warning: **This project has been moved over to [AWS Quickstart repository](https://github.com/aws-quickstart/quickstart-ssp-amazon-eks). All new updates are applied to the new repo.**
# Amazon EKS Shared Services Platform (SSP)

![GitHub](https://img.shields.io/github/license/shapirov103/cdk-eks-blueprint)

Welcome to the `Amazon EKS SSP` repository! 

This repository provides a toolchain and methodlogy that allows customers to build Shared Services Platfomrs on top of EKS. Customers can leverage `EKSBlueprint`
to manage cluters, addons and teams, in order to easily deploy production ready EKS clusters across accounts and regions. It also leverage a Gitops-based approach to provide easy, self-service onboarding of new workloads to the shared clustes. 

Customers can use `EKSBlueprint` to:

* Deploy and manage multi-tenant EKS clusters across acounts and regions. 
* Leverage Gitops-based workflows to onboard and manage workloads. 

## Getting Started 



### Install CDK 

This reference architecture leverages [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/). Install CDK via the following.

```bash
npm install -g aws-cdk
```

Verify the installation.

```bash
cdk --version
```

### Project setup

Create a new CDK project. We use `typescript` for this example. 

```bash
cdk init app --language typescript
```

Bootstrap your environment. For more information see Bootstrapping below.  

```bash
cdk bootstrap aws://<AWS_ACCOUNT_ID>/<AWS_REGION>
```

### Usage

Add the `cdk-eks-blueprint` library as as a dependency to your CDK project. 

```json
"dependencies": {
  "@shapirov/cdk-eks-blueprint": "0.1.6"
}
```

Run the following command to install the dependency to your local npm package manager - 
```
npm i @shapirov/cdk-eks-blueprint
```

Replace the contents of `bin/<your-main-file>.ts` (where `your-main-file` by default is the name of the root project directory) with the following:

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {
    CdkEksBlueprintStack, 
    ArgoCDAddOn,
    MetricsServerAddon, 
    ClusterAutoScaler, 
    ContainerInsightsAddOn, 
    NginxAddon, 
    CalicoNetworkPolicyAddon, 
    ClusterAddOn
}  from '@shapirov/cdk-eks-blueprint';

const addOns: Array<ClusterAddOn> = [
  new ArgoCDAddOn,
  new MetricsServerAddon,
  new ClusterAutoScaler,
  new ContainerInsightsAddOn,
  new NginxAddon, 
  new CalicoNetworkPolicyAddon,
];

const app = new cdk.App();
new CdkEksBlueprintStack(app, {id: 'east-test-1', addOns: addOns, teams: []}, {
  env: {
      account: 'XXXXXXXXXXXX',
      region: 'us-east-2'
  },
});
```

Run the following command to confirm there are no issues with our code

```
npm run build 
```

If there are no errors you should see the following
```
> eks-factory-test@0.1.0 build
> tsc
```

Deploy the stack using the following command

```
cdk deploy
```

### Stack Configuration

Supports context variables (specify in cdk.json, cdk.context.json or pass with -c command line option):

- `instanceType`: (defaulted to "t3.medium") Type of instance for the EKS cluster, must be a valid instance type like t3.medium
- `vpc`: Specifies whether to use an existing VPC (if specified) or create a new one if not specified.
- `minSize`: Min cluster size, must be positive integer greater than 0 (default 1).
- `maxSize`: Max cluster size, must be greater than minSize.
- `vpcSubnets`: List of VPC subnets for cluster provisioning (unsupported yet)

### Updating Clusters

// Todo - Add

### Upgrading Clusters

// Todo - Add

## Solution Details

### Shared Services Platform

A Shared Services Platform (SSP) is an interenal development platform that abstracts the complexities of cloud infrastrucuture from developers, and allows them to deploy workloads with ease. As SSP is typically composed of multiple AWS or open source products and services, including services for running containers, CI/CD pipelines, capturing logs/metrics, and security enforcement. The SSP packages these tools into a cohesive whole and makes them available to development teams via a simplified interface, typically a CLI, GUI, Git, or, manifest file. 

### Reference Architecture goals.

The goal of this project is to provide a reference implementation of a Shared Services Platform (SSP) built on top of EKS. At present the implementation provides the following functionality:

  * **Cluster Management** - Provision one or many EKS clusters across one or many regions.
  * **Add-ons** A modular approach to configuring the clusters with suite of add-ons or plugins that are needed to run workloads in a Kubernetes environment. 
    * **Custom Add-ons** Add your own add-ons by implementing a `ClusterAddon` SPI (to be extended for lifecycle management). 
  * **Tenant Onboarding** Seamless onboarding of tenants/workloads onto specific clusters via CDK configuration and Gitops.

### Supported Addons

| AddOn             | Description                                                                       |
|-------------------|-----------------------------------------------------------------------------------|
| `AppMeshAddon`           | Adds an AppMesh controller and CRDs (pending validation on the latest version of CDK) |
| `ArgoCDAddon`            | Adds an ArgoCD controller |
| `CalicoAddon`            | Adds the Calico 1.7.1 CNI/Network policy engine |
| `CloudWatchAddon`        | Adds Container Insights support integrating monitoring with CloudWatch |
| [`ClusterAutoscalerAddon`](./docs/addons/cluster-autoscaler.md) | Adds the standard cluster autoscaler ([Karpenter](https://github.com/awslabs/karpenter) is coming)|
| `MetricsServerAddon`| Adds metrics server (pre-req for HPA and other monitoring tools)|
| `NginxAddon`        | Adds NGINX ingress controller |

### EKS Cluster Management 

// Todo - Add

### Configuring Add-ons 

// Todo - Add

### Creating an Add-on

// Todo - Add

### Onboarding Tenants

In the most generic cases clients are expected to supply implementation of the `TeamSetup` interface.
Support for teams configuration and authentication both for 'kubectl` access as well as console access is described in [Teams](docs/teams.md) documentation.


### CI/CD

## IaC Pipeline

(work in progress)

Example of IaC self-mutating pipeline based on CodePipeline can be found in the `lib/pipelineStack.ts`.

## Bootstrapping

Each combination of target account and region must be bootstrapped prior to deploying stacks.
Bootstrapping is an process of creating IAM roles and lambda functions that can execute some of the common CDK constructs.

Example: 
```   
  cdk bootstrap aws://<AWS_ACCOUNT_ID>/us-east-1
```
In addition to the regular [environment bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) pipeline bootstrapping for pipelines requires a new style of bootstrapping. Set `AWS_ACCOUNT` environment to your account and execute (with account admin privileges) the command in bootstrap-pipeline.sh.  
