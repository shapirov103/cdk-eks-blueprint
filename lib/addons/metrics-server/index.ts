import { ClusterAddon, ClusterInfo } from "../../eksBlueprintStack";
import { loadExternalYaml } from "../../utils/yamlUtils";

export class MetricsServerAddon implements ClusterAddon {

    version: string;

    constructor(version?: string) {
        this.version = version ?? "v0.4.1";
    }

    deploy(clusterInfo: ClusterInfo): void {
        const manifestUrl = `https://github.com/kubernetes-sigs/metrics-server/releases/download/${this.version}/components.yaml`;
        const manifest = loadExternalYaml(manifestUrl);
        clusterInfo.cluster.addManifest('metrics-server-addon', ...manifest);
    }
}