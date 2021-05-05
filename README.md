# EKS Blueprint

The repository contains the source code and configuration for the `EKS Shared Services Platform` reference architecture. 

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
  "@shapirov/cdk-eks-blueprint": "0.1.5"
}
```

Replace the contents of `bin/<your-main-file>.ts` (where `your-main-file` by default is the name of the root project directory) with the following:

```typescript
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';

import { CdkEksBlueprintStack, Addons } from '@shapirov/cdk-eks-blueprint';

const clusterAddons: Array<ClusterAddon> = [
    new Addons.CalicoAddon,
    new Addons.MetricsServerAddon,
    new Addons.ClusterAutoScalerAddon,
    new Addons.ContainerInsightsAddOn,
    new Addons.NginxAddon,
    new Addons.ArgoCDAddon
];

const app = new cdk.App();
new CdkEksBlueprintStack(app, 'east-test-1', clusterAddons, [], {
  env: {
      account: <AWS_ACCOUNT_ID>,
      region: <AWS_REGION>,
  },
});
```

Deploy the stack 

```
cdk deploy
```

```
Outputs:
east-dev.eastdevClusterNameAD4927F9 = east-dev
east-dev.eastdevConfigCommand1B9C7FF9 = aws eks update-kubeconfig --name east-dev --region us-west-1 --role-arn arn:aws:iam::115717706081:role/east-dev-eastdevMastersRole0C14F966-OFP9T3GLGTTL
east-dev.eastdevGetTokenCommand54E73D04 = aws eks get-token --cluster-name east-dev --region us-west-1 --role-arn arn:aws:iam::115717706081:role/east-dev-eastdevMastersRole0C14F966-OFP9T3GLGTTL
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

Examples are provided under `lib/teams`, however due to uniqueness of every team, clients are expected to supply implementation of the `TeamSetup` interface.

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

PR Language 

```
Closes #31 

This pull request performs the following:

1. Updates addon filenames to be consistent (index.ts)
2. Replaces hardcoded manifests with helm charts where possible. 
3. Adds Typescript ESLint to the project. https://github.com/typescript-eslint/typescript-eslint
4. A bit of code cleanup and organization.

Note that my editor settings use 4 space tabs for formatting. A few files have been auto-formatted. @shapirov103 lets sort out formatting for the project prior to merging. 
```

Seth Fox 

Built SaaS Factory -> 2SAs -> 20SAs

Startup Focus
* Clubhouse -> Ran into all sorts of scalablility issues with us. 
    * DB issues 
    * Account strategy issues 
* AWS -> We have too many choices. How do we put them together. 
* Starting with a managed service gets them going quickly. 
* Self Managed v Managed -> His example is Snowflake. If customer chooses that, they are still running on our platform. 
* What is your tech anchor point?
    * Multi tenancy
    * Spent a bunch of time in OpenStack world.
    * Kind of a weird answer here. 
    * This was really all over the place.
    * Concrete answer -> working with containers and Kubernetes
    * Networking is a strength as well.
* EC2 Specifically -> What have you talked to Samira about?
    * Graviton MacOS, Nitro Enclaves
* What does your current team look like?
    * 20 or so SAs and managers
    * Few direct reports. 
* Why did he have to apply to get learning?
    * He did the informational. I did that. 
* SDM role was all tech. 
* Whats a big project you took on and made yours. 
    * SaaS Factory -> Ownership -> 
* What are the issues with Graviton. Blockers to adoption?
    * Developing for multiple platforms isn't great for devs. So this sucks. 
    * He is missing the ecosystem
* What is next year?
    * MacOS -> Find product market fit
    * Get ahead of Gton 2
    * Where do we need specialists on EC2 and where do we not.
    * Continue to hire amazing people. 
    * Our people look way more like product centric people than sales centric. 
* How do we make this an appreciated role.
    * For the people we work with -> we are oxygen and gravity. 
    * Data and Comms are the most important thing we can do (outside of hire people).
    * 


 