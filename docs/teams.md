# Team Support 

The blueprint provides support to register a number of teams for cluster access. 
Teams could be workload teams, who share the cluster using namespaces, or platform teams (one or more) who have admin access (masters group) to the cluster.

## Classes and Interfaces

Basic requirements to add a team is to implement `TeamSetup` interace. It requires to declare team name and implement `setup` method. 
Team names must be unique, otherwise the blueprint validation will throw an exception.

Support classes include two convenience base classes:

`teams/Team` class provides support for the following:
    - registers IAM users for cross-account access
    - provides an existing role for cluster access
    - if role is not provided and users are provided, then a new role is generated by the blueprint automatically
    - creates a namespace
    - registers quotas
    - registers provided users/role in the `awsAuth` map for `kubectl` and console access to the cluster

`teams/PlatformTeam` class provides support for the following:

 - registers IAM users for admin access to the cluster (`kubectl` and console)
 - registers an existing role (or create a new role) for cluster access with trust relationship with the provided/created role

`teams/DefaultTeamRoles` class provides default RBAC configuration for dev teams:

 - Cluster role, group identity and cluster role bindings to view nodes and namespaces
 - Namespace role and role binding for the group to view pods, deployments, daemonsets, services

## Recommended Usage

In the spirit of infrastructure as code, it is recommended to create new teams by creating a class implementation that derives from `teams/Team` or `teams/PlatformTeam` as `Team${TeamName}Setup` for each team. 

For example:

```
export class TeamMyTeamSetup extends Team {
    constructor(app: App) {
        super({
            name: "my-team",
            users: [
                new ArnPrincipal(`arn:aws:iam::${YOUR_IAM_ACCOUNT}:user/user1`),  
                new ArnPrincipal(`arn:aws:iam::${YOUR_IAM_ACCOUNT}:user/user2`)
            ]

        });
    }
}
```

The benefits of this approach is:

1. Self-documenting code
2. Centralized logic related to the team
3. Clear place where to add additional provisioning, for example adding Kubernetes Service Accounts and/or infrastructure, such as S3 buckets
4. IDE support to locate the required team, e.g. CTRL+T in VSCode to lookup class name.

To reduce verbosity for some of the use cases, such as for platform teams, when in reality the use case is simply to enable admin cluster access for a specific role the blueprint provides support for add-hoc team creation as well. For example:

```
const adminTeam = new PlatformTeam( {
    name: "second-adminteam", // make sure this is unique within organization
    userRole: Role.fromRoleArn(`${YOUR_ROLE_ARN}`);
})
```

The example above is shown for a platform team, but it could be similarly applied to a regular team with restricted access. 

## Cluster Access (`kubectl`)

The stack output will contain the `kubeconfig` update command, which should be shared with the development and platform teams.

```
${teamname}teamrole	arn:aws:iam::${account}:role/west-dev-${teamname}AccessRole3CDA6927-1QA4S3TYMY36N

platformteamadmin	arn:aws:iam::${account}:role/west-dev-${platform-team-name}AccessRole57468BEC-8JYMM0HZZ2CE	

teamtroisaiamrole	arn:aws:iam::${account}:role/west-dev-westdevinfbackendRole861AD63A-2K9W8X4DDF46

westdevConfigCommand1AE70258	aws eks update-kubeconfig --name west-dev --region us-west-1 --role-arn arn:aws:iam::${account}:role/west-dev-westdevMastersRole509E4B82-101MDZNTGFF08
```

Note the last command is to update `kubeconfig` with the proper context to access cluster using `kubectl`. The last argument of this command is `--role-arn` which by default is set to the cluster master role. 

Developers (members of each team) should use the role name for the team role, such as `burnhamteamrole` for team name `burnham`. 
Platform administrators must use the role output for their team name, such as platformteamadmin in the above example.

## Console Access

Provided that each team has recieved the name of the role that was created for the cluster access, each team member listed in the users section will be able to assume the role in the target account. 

To do that, users should use "Switch Roles" function in the console and specify the provided role. This will enable EKS console access to list clusters and to get console visibility into the workloads that belong to the team. 

## Examples

There are a few team examples under /teams folder.

The example for team-burnham includes a way to specify IAM users through a local or project CDK context. 
Project context is defined in `cdk.json` under context key and local context is defined in `~/.cdk.json` under context key. 

Example:

```
➜ cat ~/.cdk.json 
{
    "context": {
        "team-burnham.users": "arn:aws:iam::YOUR_ACCOUNT:user/dev1,arn:aws:iam::YOUR_ACCOUNT:user/dev2"
    }
}
```