import { Badge } from "@/components/ui/badge";
import type { OrgTreeNode } from "@/types/app";

function TreeNode({ node }: { node: OrgTreeNode }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{node.name}</h3>
              <Badge variant="secondary" className="rounded-full">
                {node.type}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Líder: {node.leader}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-muted-foreground">Colaboradores</p>
              <p className="text-xl font-semibold">{node.collaborators}</p>
            </div>
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-muted-foreground">Mood promedio</p>
              <p className="text-xl font-semibold">{node.averageMood.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {node.children.length ? (
        <div className="ml-6 space-y-4 border-l border-dashed border-border pl-6">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function OrgTree({ tree }: { tree: OrgTreeNode }) {
  return <TreeNode node={tree} />;
}
