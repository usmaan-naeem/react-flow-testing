// First, let's create our page component in pages/workflow-builder.js
import WorkflowBuilder from "@/cmponents/workflow";
import "reactflow/dist/style.css";

// Main WorkflowBuilder component
export default function Page() {
  return (
    <div className="flex h-screen w-screen">
      <WorkflowBuilder />
    </div>
  );
}
