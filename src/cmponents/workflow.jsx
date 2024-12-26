"use client";
import ELK from "elkjs/lib/elk.bundled.js";
import { Diamond, Play, RepeatIcon, Square, StopCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

const elk = new ELK();

const PADDING = 50;
const NODE_DIMENSIONS = {
  startNode: { width: 150, height: 60 },
  actionNode: { width: 200, height: 80 },
  decisionNode: { width: 180, height: 100 },
  loopNode: { width: 250, height: 200 },
  endNode: { width: 150, height: 60 },
};

const getLayoutedElements = async (
  nodes,
  edges,
  options = {},
  isChild = false
) => {
  // Create hierarchy of nodes
  const getChildren = (parentId) =>
    nodes.filter((node) => node.parentId === parentId);

  const createElkNode = (node) => {
    const children = getChildren(node.id);
    return {
      id: node.id,
      width: NODE_DIMENSIONS[node.type].width,
      height: NODE_DIMENSIONS[node.type].height,
      children: children.length ? children.map(createElkNode) : undefined,
      layoutOptions:
        node.type === "loopNode"
          ? {
              "elk.padding": "[top=50, left=50, bottom=50, right=50]",
            }
          : undefined,
    };
  };

  const elkNodes = nodes.filter((node) => !node.parentId).map(createElkNode);

  const elkEdges = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const elkGraph = {
    id: "root",
    children: elkNodes,
    edges: elkEdges,
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "50",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.padding": "[top=50, left=50, bottom=50, right=50]",
      ...options,
    },
  };

  const layoutedGraph = await elk.layout(elkGraph);

  // Helper function to find node in ELK graph
  const findElkNode = (id, elkGraph) => {
    if (elkGraph.id === id) return elkGraph;
    if (!elkGraph.children) return null;
    for (const child of elkGraph.children) {
      const found = findElkNode(id, child);
      if (found) return found;
    }
    return null;
  };

  const layoutedNodes = nodes.map((node) => {
    const elkNode = findElkNode(node.id, layoutedGraph);
    if (elkNode) {
      let position = { x: elkNode.x, y: elkNode.y };

      // If node has parent, adjust position relative to parent
      if (node.parentId) {
        const parent = nodes.find((n) => n.id === node.parentId);
        if (parent) {
          position = {
            x: elkNode.x - parent.position.x,
            y: elkNode.y - parent.position.y,
          };
        }
      }

      return {
        ...node,
        position,
      };
    }
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const calculateNodePosition = (nodes, parentNode = null) => {
  if (parentNode) {
    const siblingNodes = nodes.filter((n) => n.parentNode === parentNode.id);
    const lastSibling = siblingNodes[siblingNodes.length - 1];

    return {
      x: PADDING,
      y: lastSibling
        ? lastSibling.position.y + NODE_DIMENSIONS[lastSibling.type].height + 40
        : PADDING,
    };
  }

  const lastNode = nodes[nodes.length - 1];
  return lastNode
    ? {
        x: lastNode.position.x,
        y: lastNode.position.y + NODE_DIMENSIONS[lastNode.type].height + 60,
      }
    : { x: 100, y: 100 };
};

const calculateLoopNodeDimensions = (loopNode, nodes) => {
  const children = nodes.filter((n) => n.parentNode === loopNode.id);
  if (!children.length) {
    return {
      width: NODE_DIMENSIONS.loopNode.width,
      height: NODE_DIMENSIONS.loopNode.height,
    };
  }

  const childrenBounds = children.reduce(
    (bounds, child) => {
      const childDimensions = NODE_DIMENSIONS[child.type];
      const right = child.position.x + (childDimensions?.width || 200);
      const bottom = child.position.y + (childDimensions?.height || 100);

      return {
        maxX: Math.max(bounds.maxX, right),
        maxY: Math.max(bounds.maxY, bottom),
      };
    },
    { maxX: 0, maxY: 0 }
  );

  return {
    width: Math.max(
      NODE_DIMENSIONS.loopNode.width,
      childrenBounds.maxX + PADDING * 2
    ),
    height: Math.max(
      NODE_DIMENSIONS.loopNode.height,
      childrenBounds.maxY + PADDING * 2
    ),
  };
};

// Node Components
const StartNode = ({ data }) => {
  return (
    <div
      className="relative bg-green-50 border-2 border-green-500 rounded-lg p-4"
      style={{
        width: NODE_DIMENSIONS.startNode.width,
        height: NODE_DIMENSIONS.startNode.height,
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center justify-center h-full">
        <Play className="w-5 h-5 text-green-600 mr-2" />
        <div className="font-semibold text-green-700">
          {data.label || "Start"}
        </div>
      </div>
    </div>
  );
};

const ActionNode = ({ data }) => {
  return (
    <div
      className="relative bg-blue-50 border-2 border-blue-500 rounded-lg p-4"
      style={{
        width: NODE_DIMENSIONS.actionNode.width,
        height: NODE_DIMENSIONS.actionNode.height,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-2">
          <Square className="w-5 h-5 text-blue-600 mr-2" />
          <div className="font-semibold text-blue-700">
            {data.label || "Action"}
          </div>
        </div>
        <div className="text-sm text-blue-600">
          {data.description || "Action description"}
        </div>
      </div>
    </div>
  );
};

const DecisionNode = ({ data }) => {
  return (
    <div
      className="relative bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 transform rotate-45"
      style={{
        width: NODE_DIMENSIONS.decisionNode.width,
        height: NODE_DIMENSIONS.decisionNode.height,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="yes" />
      <Handle type="source" position={Position.Right} id="no" />
      <div className="flex flex-col items-center justify-center h-full -rotate-45">
        <Diamond className="w-5 h-5 text-yellow-600 mb-2" />
        <div className="font-semibold text-yellow-700 text-center">
          {data.label || "Decision"}
        </div>
        <div className="text-xs text-yellow-600 mt-1">Yes (↓) / No (→)</div>
      </div>
    </div>
  );
};

const LoopNode = ({ data, id }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes();
  const dimensions = calculateLoopNodeDimensions({ id }, nodes);

  return (
    <div
      className="relative bg-purple-50 rounded-lg p-4"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        transition: "width 0.3s ease, height 0.3s ease",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-2">
          <RepeatIcon className="w-5 h-5 text-purple-600 mr-2" />
          <div className="font-semibold text-purple-700">
            {data.label || "Loop"}
          </div>
        </div>
      </div>
    </div>
  );
};

const EndNode = ({ data }) => {
  return (
    <div
      className="relative bg-red-50 border-2 border-red-500 rounded-lg p-4"
      style={{
        width: NODE_DIMENSIONS.endNode.width,
        height: NODE_DIMENSIONS.endNode.height,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-center h-full">
        <StopCircle className="w-5 h-5 text-red-600 mr-2" />
        <div className="font-semibold text-red-700">{data.label || "End"}</div>
      </div>
    </div>
  );
};

const generateUniqueId = () =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const nodeTypes = {
  startNode: StartNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  loopNode: LoopNode,
  endNode: EndNode,
};

const initialNodes = [
  {
    id: "start_1",
    type: "startNode",
    position: { x: 250, y: 50 },
    data: { label: "Start" },
  },
];

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Nodes Palette</h2>
      <div className="space-y-3">
        <div
          className="p-3 border-2 border-green-200 rounded-lg cursor-move bg-green-50 hover:bg-green-100 transition-colors"
          onDragStart={(e) => onDragStart(e, "startNode")}
          draggable
        >
          <div className="flex items-center">
            <Play className="w-4 h-4 mr-2 text-green-600" />
            Start Node
          </div>
        </div>

        <div
          className="p-3 border-2 border-blue-200 rounded-lg cursor-move bg-blue-50 hover:bg-blue-100 transition-colors"
          onDragStart={(e) => onDragStart(e, "actionNode")}
          draggable
        >
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-2 text-blue-600" />
            Action Node
          </div>
        </div>

        <div
          className="p-3 border-2 border-yellow-200 rounded-lg cursor-move bg-yellow-50 hover:bg-yellow-100 transition-colors"
          onDragStart={(e) => onDragStart(e, "decisionNode")}
          draggable
        >
          <div className="flex items-center">
            <Diamond className="w-4 h-4 mr-2 text-yellow-600" />
            Decision Node
          </div>
        </div>

        <div
          className="p-3 border-2 border-purple-200 rounded-lg cursor-move bg-purple-50 hover:bg-purple-100 transition-colors"
          onDragStart={(e) => onDragStart(e, "loopNode")}
          draggable
        >
          <div className="flex items-center">
            <RepeatIcon className="w-4 h-4 mr-2 text-purple-600" />
            Loop Node
          </div>
        </div>

        <div
          className="p-3 border-2 border-red-200 rounded-lg cursor-move bg-red-50 hover:bg-red-100 transition-colors"
          onDragStart={(e) => onDragStart(e, "endNode")}
          draggable
        >
          <div className="flex items-center">
            <StopCircle className="w-4 h-4 mr-2 text-red-600" />
            End Node
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const findClosestNode = useCallback((point, nodes) => {
    return nodes.reduce((closest, node) => {
      const distance = Math.sqrt(
        Math.pow(node.position.x - point.x, 2) +
          Math.pow(node.position.y - point.y, 2)
      );

      if (!closest || distance < closest.distance) {
        return { node, distance };
      }
      return closest;
    }, null);
  }, []);

  const isPointInNode = useCallback((point, node) => {
    const { width, height } = NODE_DIMENSIONS[node.type];
    return (
      point.x >= node.position.x &&
      point.x <= node.position.x + width &&
      point.y >= node.position.y &&
      point.y <= node.position.y + height
    );
  }, []);

  const layoutFlow = useCallback(async () => {
    let layoutedNodes = [...nodes];

    // First layout nested nodes within loop nodes
    for (const node of nodes) {
      if (node.type === "loopNode") {
        const children = nodes.filter((n) => n.parentId === node.id);
        const childEdges = edges.filter((e) =>
          children.some((c) => c.id === e.source || c.id === e.target)
        );

        if (children.length) {
          const { nodes: layoutedChildren } = await getLayoutedElements(
            children,
            childEdges,
            {
              "elk.padding": "[top=50, left=50, bottom=50, right=50]",
            }
          );

          layoutedNodes = layoutedNodes.map(
            (n) => layoutedChildren.find((lc) => lc.id === n.id) || n
          );

          // Update loop node dimensions
          const dimensions = calculateLoopNodeDimensions(
            node,
            layoutedChildren
          );
          layoutedNodes = layoutedNodes.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  style: {
                    ...n.style,
                    width: dimensions.width,
                    height: dimensions.height,
                  },
                }
              : n
          );
        }
      }
    }

    // Then layout the entire graph
    const { nodes: finalNodes, edges: layoutedEdges } =
      await getLayoutedElements(
        layoutedNodes.filter((n) => !n.parentId),
        edges.filter((e) => !nodes.find((n) => n.id === e.source)?.parentId)
      );

    setNodes([...finalNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const parentNode = nodes.find(
        (node) => node.type === "loopNode" && isPointInNode(position, node)
      );

      const newNodeId = generateUniqueId();

      const newNode = {
        id: newNodeId,
        type,
        position: parentNode
          ? {
              x: PADDING,
              y:
                nodes.filter((n) => n.parentNode === parentNode.id).length *
                  100 +
                PADDING,
            }
          : position,
        data: {
          label: `${type.replace("Node", "")}`,
          description:
            type === "actionNode" ? "Configure this action" : undefined,
          iterations: type === "loopNode" ? 3 : undefined,
        },
        style: {
          border: type === "loopNode" ? "2px dashed #8B5CF6" : undefined,
        },
        ...(parentNode && {
          parentNode: parentNode.id,
          extent: "parent",
          draggable: true,
        }),
      };

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);

        if (parentNode) {
          const loopChildren = nds.filter(
            (n) => n.parentNode === parentNode.id
          );
          if (loopChildren.length > 0) {
            const lastChild = loopChildren[loopChildren.length - 1];
            setEdges((eds) =>
              eds.concat({
                id: generateUniqueId(),
                source: lastChild.id,
                target: newNode.id,
                type: "straight",
              })
            );
          }

          return updatedNodes.map((node) => {
            if (node.id === parentNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  children: [...(node.data.children || []), newNodeId],
                },
              };
            }
            return node;
          });
        } else {
          const closestNode = findClosestNode(position, nds);
          if (closestNode) {
            setEdges((eds) =>
              eds.concat({
                id: generateUniqueId(),
                source: closestNode.node.id,
                target: newNode.id,
                type: "straight",
              })
            );
          }
          return updatedNodes;
        }
      });
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-50 p-4" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            type: "straight",
            animated: true,
            style: { strokeWidth: 2 },
          }}
          fitView
          nodesConnectable={true}
          snapToGrid={true}
          snapGrid={[20, 20]}
          connectionMode="loose"
          elevateNodesOnSelect={true}
          autoPanOnNodeDrag={true}
        >
          <Background />
          <Controls />
          <Panel position="top-left" className="flex gap-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={layoutFlow}
            >
              Auto Layout
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => {
                setNodes(initialNodes);
                setEdges([]);
              }}
            >
              Reset
            </button>
          </Panel>
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
