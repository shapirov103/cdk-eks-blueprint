import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class NginxAddon implements ClusterAddon {

    deploy(clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("ingress-nginx", {
            chart: "ingress-nginx",
            repository: "https://kubernetes.github.io/ingress-nginx",
            namespace: "kube-system"
        });
    }
}