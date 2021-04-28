import { ClusterAddon, ClusterInfo } from "../../stacks/eks-blueprint-stack";

export class NginxAddon implements ClusterAddon {

    deploy(clusterInfo: ClusterInfo): void {
        clusterInfo.cluster.addHelmChart("ngninx-ingress", {
            chart: "nginx-ingress",
            repository: "https://helm.nginx.com/stable",
            namespace: "kube-system"
        });
    }
}