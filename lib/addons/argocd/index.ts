import { ClusterAddon, ClusterInfo } from "../../eksBlueprintStack";

export class ArgoCDAddon implements ClusterAddon {

    deploy(clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("argocd-addon", {
            chart: "argo/argo-cd",
            repository: "https://argoproj.github.io/argo-helm",
            namespace: "kube-system"
        });
    }
}