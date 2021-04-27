import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class ArgoCDAddon implements ClusterAddon {

    deploy(clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("argocd-addon", {
            chart: "argo-cd",
            repository: "https://argoproj.github.io/argo-helm",
            namespace: "kube-system"
        });
    }
}