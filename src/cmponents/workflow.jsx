// "use client";
// import { useState, useCallback, useRef } from "react";
// import ReactFlow, {
//   addEdge,
//   Background,
//   Controls,
//   MiniMap,
//   useNodesState,
//   useEdgesState,
//   Handle,
//   Position,
//   useReactFlow,
// } from "reactflow";
// import { Play, Square, Diamond, RepeatIcon, StopCircle } from "lucide-react";
// import "reactflow/dist/style.css";

// // Base node dimensions
// const NODE_DIMENSIONS = {
//   start: { width: 150, height: 60 },
//   action: { width: 200, height: 80 },
//   decision: { width: 180, height: 100 },
//   loop: { width: 250, height: 200 },
//   end: { width: 150, height: 60 },
// };

// const PADDING = 50;

// // Calculate dimensions for loop node based on children
// const calculateLoopNodeDimensions = (loopNode, nodes) => {
//   const children = nodes.filter((n) => n.parentNode === loopNode.id);
//   if (!children.length) {
//     return {
//       width: NODE_DIMENSIONS.loop.width,
//       height: NODE_DIMENSIONS.loop.height,
//     };
//   }

//   const childrenBounds = children.reduce(
//     (bounds, child) => {
//       console.log({ child })
//       const childDimensions = NODE_DIMENSIONS[child.type];
//       const right = child.position.x + (childDimensions?.width || 200);
//       const bottom = child.position.y + (childDimensions?.height || 100);

//       return {
//         maxX: Math.max(bounds.maxX, right),
//         maxY: Math.max(bounds.maxY, bottom),
//       };
//     },
//     { maxX: 0, maxY: 0 }
//   );

//   return {
//     width: Math.max(
//       NODE_DIMENSIONS.loop.width,
//       childrenBounds.maxX + PADDING * 2
//     ),
//     height: Math.max(
//       NODE_DIMENSIONS.loop.height,
//       childrenBounds.maxY + PADDING * 2
//     ),
//   };
// };

// // Start Node Component
// const StartNode = ({ data }) => {
//   return (
//     <div
//       className="relative bg-green-50 border-2 border-green-500 rounded-lg p-4"
//       style={{
//         width: NODE_DIMENSIONS.start.width,
//         height: NODE_DIMENSIONS.start.height,
//       }}
//     >
//       <Handle type="source" position={Position.Bottom} />
//       <div className="flex items-center justify-center h-full">
//         <Play className="w-5 h-5 text-green-600 mr-2" />
//         <div className="font-semibold text-green-700">
//           {data.label || "Start"}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Action Node Component
// const ActionNode = ({ data }) => {
//   return (
//     <div
//       className="relative bg-blue-50 border-2 border-blue-500 rounded-lg p-4"
//       style={{
//         width: NODE_DIMENSIONS.action.width,
//         height: NODE_DIMENSIONS.action.height,
//       }}
//     >
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//       <div className="flex flex-col h-full">
//         <div className="flex items-center mb-2">
//           <Square className="w-5 h-5 text-blue-600 mr-2" />
//           <div className="font-semibold text-blue-700">
//             {data.label || "Action"}
//           </div>
//         </div>
//         <div className="text-sm text-blue-600">
//           {data.description || "Action description"}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Decision Node Component
// const DecisionNode = ({ data }) => {
//   return (
//     <div
//       className="relative bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 transform rotate-45"
//       style={{
//         width: NODE_DIMENSIONS.decision.width,
//         height: NODE_DIMENSIONS.decision.height,
//       }}
//     >
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} id="yes" />
//       <Handle type="source" position={Position.Right} id="no" />
//       <div className="flex flex-col items-center justify-center h-full -rotate-45">
//         <Diamond className="w-5 h-5 text-yellow-600 mb-2" />
//         <div className="font-semibold text-yellow-700 text-center">
//           {data.label || "Decision"}
//         </div>
//         <div className="text-xs text-yellow-600 mt-1">Yes (↓) / No (→)</div>
//       </div>
//     </div>
//   );
// };

// // Helper function to generate unique IDs
// const generateUniqueId = () =>
//   `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// // Loop Node Component
// const LoopNode = ({ data, id }) => {
//   const { getNodes } = useReactFlow();
//   const nodes = getNodes();
//   const dimensions = calculateLoopNodeDimensions({ id }, nodes);

//   return (
//     <div
//       className="relative bg-purple-50 rounded-lg p-4"
//       style={{
//         width: dimensions.width,
//         height: dimensions.height,
//         transition: "width 0.3s ease, height 0.3s ease", // Smooth transition
//       }}
//     >
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} />
//       <div className="flex flex-col h-full">
//         <div className="flex items-center mb-2">
//           <RepeatIcon className="w-5 h-5 text-purple-600 mr-2" />
//           <div className="font-semibold text-purple-700">
//             {data.label || "Loop"}
//           </div>
//         </div>
//         <div className="text-sm text-purple-600 mb-2">
//           Iterations: {data.iterations || "Not set"}
//         </div>
//         {/* Container for nested nodes */}
//         <div className="flex-1 bg-white/50 rounded-lg p-4 relative">
//           <div className="absolute top-2 left-2 text-sm text-purple-500">
//             {data.children?.length
//               ? `Contains ${data.children.length} nodes`
//               : "Drag nodes here"}
//           </div>
//           <div className="w-full h-full mt-6" />
//         </div>
//       </div>
//     </div>
//   );
// };

// // End Node Component
// const EndNode = ({ data }) => {
//   return (
//     <div
//       className="relative bg-red-50 border-2 border-red-500 rounded-lg p-4"
//       style={{
//         width: NODE_DIMENSIONS.end.width,
//         height: NODE_DIMENSIONS.end.height,
//       }}
//     >
//       <Handle type="target" position={Position.Top} />
//       <div className="flex items-center justify-center h-full">
//         <StopCircle className="w-5 h-5 text-red-600 mr-2" />
//         <div className="font-semibold text-red-700">{data.label || "End"}</div>
//       </div>
//     </div>
//   );
// };

// // Node types registration
// const nodeTypes = {
//   startNode: StartNode,
//   actionNode: ActionNode,
//   decisionNode: DecisionNode,
//   loopNode: LoopNode,
//   endNode: EndNode,
// };

// // Initial nodes for testing
// const initialNodes = [
//   {
//     id: "start_1",
//     type: "startNode",
//     position: { x: 250, y: 50 },
//     data: { label: "Start" },
//   },
// ];

// // Sidebar component
// const Sidebar = () => {
//   const onDragStart = (event, nodeType) => {
//     event.dataTransfer.setData("application/reactflow", nodeType);
//     event.dataTransfer.effectAllowed = "move";
//   };

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 p-4">
//       <h2 className="text-lg font-semibold mb-4">Nodes Palette</h2>
//       <div className="space-y-3">
//         <div
//           className="p-3 border-2 border-green-200 rounded-lg cursor-move bg-green-50 hover:bg-green-100 transition-colors"
//           onDragStart={(e) => onDragStart(e, "startNode")}
//           draggable
//         >
//           <div className="flex items-center">
//             <Play className="w-4 h-4 mr-2 text-green-600" />
//             Start Node
//           </div>
//         </div>

//         <div
//           className="p-3 border-2 border-blue-200 rounded-lg cursor-move bg-blue-50 hover:bg-blue-100 transition-colors"
//           onDragStart={(e) => onDragStart(e, "actionNode")}
//           draggable
//         >
//           <div className="flex items-center">
//             <Square className="w-4 h-4 mr-2 text-blue-600" />
//             Action Node
//           </div>
//         </div>

//         <div
//           className="p-3 border-2 border-yellow-200 rounded-lg cursor-move bg-yellow-50 hover:bg-yellow-100 transition-colors"
//           onDragStart={(e) => onDragStart(e, "decisionNode")}
//           draggable
//         >
//           <div className="flex items-center">
//             <Diamond className="w-4 h-4 mr-2 text-yellow-600" />
//             Decision Node
//           </div>
//         </div>

//         <div
//           className="p-3 border-2 border-purple-200 rounded-lg cursor-move bg-purple-50 hover:bg-purple-100 transition-colors"
//           onDragStart={(e) => onDragStart(e, "loopNode")}
//           draggable
//         >
//           <div className="flex items-center">
//             <RepeatIcon className="w-4 h-4 mr-2 text-purple-600" />
//             Loop Node
//           </div>
//         </div>

//         <div
//           className="p-3 border-2 border-red-200 rounded-lg cursor-move bg-red-50 hover:bg-red-100 transition-colors"
//           onDragStart={(e) => onDragStart(e, "endNode")}
//           draggable
//         >
//           <div className="flex items-center">
//             <StopCircle className="w-4 h-4 mr-2 text-red-600" />
//             End Node
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main WorkflowBuilder component remains the same as before
// const WorkflowBuilder = () => {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const [reactFlowInstance, setReactFlowInstance] = useState(null);
//   const reactFlowWrapper = useRef(null);

//   const onConnect = useCallback(
//     (connection) => setEdges((eds) => addEdge(connection, eds)),
//     [setEdges]
//   );

//   // Helper function to find the closest node to a point
//   const findClosestNode = useCallback((point, nodes) => {
//     return nodes.reduce((closest, node) => {
//       const distance = Math.sqrt(
//         Math.pow(node.position.x - point.x, 2) +
//           Math.pow(node.position.y - point.y, 2)
//       );

//       if (!closest || distance < closest.distance) {
//         return { node, distance };
//       }
//       return closest;
//     }, null);
//   }, []);

//   // Helper function to check if a point is inside a node
//   const isPointInNode = useCallback((point, node) => {

//     console.log({ node });
//     const { width, height } = NODE_DIMENSIONS[node.type.replace("Node", "")];
//     return (
//       point.x >= node.position.x &&
//       point.x <= node.position.x + width &&
//       point.y >= node.position.y &&
//       point.y <= node.position.y + height
//     );
//   }, []);

//   const onDrop = useCallback(
//     (event) => {
//       event.preventDefault();

//       const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
//       const type = event.dataTransfer.getData("application/reactflow");

//       if (typeof type === "undefined" || !type) {
//         return;
//       }

//       const position = reactFlowInstance.project({
//         x: event.clientX - reactFlowBounds.left,
//         y: event.clientY - reactFlowBounds.top,
//       });

//       // Check if the drop position is inside any loop node
//       const parentNode = nodes.find(
//         (node) => node.type === "loopNode" && isPointInNode(position, node)
//       );

//       // Generate a unique ID for the new node
//       const newNodeId = `${type}_${Date.now()}`;

//       // Create new node with default position for nested nodes
//       const newNode = {
//         id: generateUniqueId(),
//         type,
//         position: parentNode
//           ? {
//               x: PADDING, // Start with padding from left
//               y:
//                 nodes.filter((n) => n.parentNode === parentNode.id).length *
//                   100 +
//                 PADDING, // Stack vertically with padding
//             }
//           : position,
//         data: {
//           label: `${type.replace("Node", "")}`,
//           description:
//             type === "actionNode" ? "Configure this action" : undefined,
//           iterations: type === "loopNode" ? 3 : undefined,
//         },
//         // Add style and parent properties
//         style: {
//           border: type === "loopNode" ? "2px dashed #8B5CF6" : undefined,
//         },
//         // Add parent and extent properties if dropped inside a loop node
//         ...(parentNode && {
//           parentNode: parentNode.id,
//           extent: "parent",
//           draggable: true,
//         }),
//       };

//       setNodes((nds) => {
//         const updatedNodes = nds.concat(newNode);

//         if (parentNode) {
//           // If dropped in a loop node, connect to the last node in the loop if it exists
//           const loopChildren = nds.filter(
//             (n) => n.parentNode === parentNode.id
//           );
//           if (loopChildren.length > 0) {
//             const lastChild = loopChildren[loopChildren.length - 1];
//             // Add connection with unique ID
//             setEdges((eds) =>
//               eds.concat({
//                 id: generateUniqueId(),
//                 source: lastChild.id,
//                 target: newNode.id,
//                 type: "smoothstep",
//               })
//             );
//           }

//           // Update parent node's data
//           return updatedNodes.map((node) => {
//             if (node.id === parentNode.id) {
//               return {
//                 ...node,
//                 data: {
//                   ...node.data,
//                   children: [...(node.data.children || []), newNodeId],
//                 },
//               };
//             }
//             return node;
//           });
//         } else {
//           // If not in a loop node, connect to the closest previous node
//           const closestNode = findClosestNode(position, nds);
//           if (closestNode) {
//             setEdges((eds) =>
//               eds.concat({
//                 id: generateUniqueId(),
//                 source: closestNode.node.id,
//                 target: newNode.id,
//                 type: "smoothstep",
//               })
//             );
//           }
//           return updatedNodes;
//         }
//       });
//     },
//     [reactFlowInstance, nodes, setNodes]
//   );

//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = "move";
//   }, []);

//   return (
//     <div className="flex h-screen w-screen">
//       <Sidebar />
//       <div className="flex-1 bg-gray-50 p-4" ref={reactFlowWrapper}>
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onInit={setReactFlowInstance}
//           onDrop={onDrop}
//           onDragOver={onDragOver}
//           nodeTypes={nodeTypes}
//           fitView
//         >
//           <Background />
//           <Controls />
//           <MiniMap />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// };

// export default WorkflowBuilder;


"use client";
import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  Panel
} from 'reactflow';
import dagre from 'dagre';
import { Play, Square, Diamond, RepeatIcon, StopCircle } from 'lucide-react';
import 'reactflow/dist/style.css';

const PADDING = 50;
// Base node dimensions
const NODE_DIMENSIONS = {
  startNode: { width: 150, height: 60 },
  actionNode: { width: 200, height: 80 },
  decisionNode: { width: 180, height: 100 },
  loopNode: { width: 250, height: 200 },
  endNode: { width: 150, height: 60 }
};

// Auto layout function using dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // Set nodes
  nodes.forEach((node) => {
    const dimensions = NODE_DIMENSIONS[node.type];
    dagreGraph.setNode(node.id, { 
      width: dimensions.width, 
      height: dimensions.height 
    });
  });

  // Set edges
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Get new node positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: !node.parentNode ? {
        x: nodeWithPosition.x - NODE_DIMENSIONS[node.type].width / 2,
        y: nodeWithPosition.y - NODE_DIMENSIONS[node.type].height / 2,
      } : node.position,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Position calculation for new nodes
const calculateNodePosition = (nodes, parentNode = null) => {
  if (parentNode) {
    const siblingNodes = nodes.filter(n => n.parentNode === parentNode.id);
    const lastSibling = siblingNodes[siblingNodes.length - 1];
    
    return {
      x: PADDING,
      y: lastSibling 
        ? lastSibling.position.y + NODE_DIMENSIONS[lastSibling.type].height + 40
        : PADDING
    };
  }

  const lastNode = nodes[nodes.length - 1];
  return lastNode ? {
    x: lastNode.position.x,
    y: lastNode.position.y + NODE_DIMENSIONS[lastNode.type].height + 60
  } : { x: 100, y: 100 };
};


// Calculate dimensions for loop node based on children
const calculateLoopNodeDimensions = (loopNode, nodes) => {
  const children = nodes.filter(n => n.parentNode === loopNode.id);
  if (!children.length) {
    return { width: NODE_DIMENSIONS.loopNode.width, height: NODE_DIMENSIONS.loopNode.height };
  }

  const childrenBounds = children.reduce((bounds, child) => {
    const childDimensions = NODE_DIMENSIONS[child.type];
    const right = child.position.x + (childDimensions?.width || 200);
    const bottom = child.position.y + (childDimensions?.height || 100);

    return {
      maxX: Math.max(bounds.maxX, right),
      maxY: Math.max(bounds.maxY, bottom),
    };
  }, { maxX: 0, maxY: 0 });

  return {
    width: Math.max(NODE_DIMENSIONS.loopNode.width, childrenBounds.maxX + PADDING * 2),
    height: Math.max(NODE_DIMENSIONS.loopNode.height, childrenBounds.maxY + PADDING * 2)
  };
};

// Start Node Component
const StartNode = ({ data }) => {
  return (
    <div className="relative bg-green-50 border-2 border-green-500 rounded-lg p-4" 
         style={{ width: NODE_DIMENSIONS.startNode.width, height: NODE_DIMENSIONS.startNode.height }}>
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center justify-center h-full">
        <Play className="w-5 h-5 text-green-600 mr-2" />
        <div className="font-semibold text-green-700">{data.label || 'Start'}</div>
      </div>
    </div>
  );
};

// Action Node Component
const ActionNode = ({ data }) => {
  return (
    <div className="relative bg-blue-50 border-2 border-blue-500 rounded-lg p-4"
         style={{ width: NODE_DIMENSIONS.actionNode.width, height: NODE_DIMENSIONS.actionNode.height }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-2">
          <Square className="w-5 h-5 text-blue-600 mr-2" />
          <div className="font-semibold text-blue-700">{data.label || 'Action'}</div>
        </div>
        <div className="text-sm text-blue-600">{data.description || 'Action description'}</div>
      </div>
    </div>
  );
};

// Decision Node Component
const DecisionNode = ({ data }) => {
  return (
    <div className="relative bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4 transform rotate-45"
         style={{ width: NODE_DIMENSIONS.decisionNode.width, height: NODE_DIMENSIONS.decisionNode.height }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="yes" />
      <Handle type="source" position={Position.Right} id="no" />
      <div className="flex flex-col items-center justify-center h-full -rotate-45">
        <Diamond className="w-5 h-5 text-yellow-600 mb-2" />
        <div className="font-semibold text-yellow-700 text-center">{data.label || 'Decision'}</div>
        <div className="text-xs text-yellow-600 mt-1">Yes (↓) / No (→)</div>
      </div>
    </div>
  );
};

// Helper function to generate unique IDs
const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Loop Node Component
const LoopNode = ({ data, id }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes();
  const dimensions = calculateLoopNodeDimensions({ id }, nodes);

  return (
    <div className="relative bg-purple-50 rounded-lg p-4"
         style={{ 
           width: dimensions.width,
           height: dimensions.height,
           transition: 'width 0.3s ease, height 0.3s ease' // Smooth transition
         }}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-2">
          <RepeatIcon className="w-5 h-5 text-purple-600 mr-2" />
          <div className="font-semibold text-purple-700">{data.label || 'Loop'}</div>
        </div>
        <div className="text-sm text-purple-600 mb-2">
          Iterations: {data.iterations || 'Not set'}
        </div>
        {/* Container for nested nodes */}
        <div className="flex-1 bg-white/50 rounded-lg p-4 relative">
          <div className="absolute top-2 left-2 text-sm text-purple-500">
            {data.children?.length 
              ? `Contains ${data.children.length} nodes` 
              : 'Drag nodes here'}
          </div>
          <div className="w-full h-full mt-6" />
        </div>
      </div>
    </div>
  );
};


// End Node Component
const EndNode = ({ data }) => {
  return (
    <div className="relative bg-red-50 border-2 border-red-500 rounded-lg p-4"
         style={{ width: NODE_DIMENSIONS.endNode.width, height: NODE_DIMENSIONS.endNode.height }}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-center h-full">
        <StopCircle className="w-5 h-5 text-red-600 mr-2" />
        <div className="font-semibold text-red-700">{data.label || 'End'}</div>
      </div>
    </div>
  );
};

// Node types registration
const nodeTypes = {
  startNode: StartNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  loopNode: LoopNode,
  endNode: EndNode,
};

// Initial nodes for testing
const initialNodes = [
  {
    id: 'start_1',
    type: 'startNode',
    position: { x: 250, y: 50 },
    data: { label: 'Start' }
  },
];

// Sidebar component
const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Nodes Palette</h2>
      <div className="space-y-3">
        <div
          className="p-3 border-2 border-green-200 rounded-lg cursor-move bg-green-50 hover:bg-green-100 transition-colors"
          onDragStart={(e) => onDragStart(e, 'startNode')}
          draggable
        >
          <div className="flex items-center">
            <Play className="w-4 h-4 mr-2 text-green-600" />
            Start Node
          </div>
        </div>
        
        <div
          className="p-3 border-2 border-blue-200 rounded-lg cursor-move bg-blue-50 hover:bg-blue-100 transition-colors"
          onDragStart={(e) => onDragStart(e, 'actionNode')}
          draggable
        >
          <div className="flex items-center">
            <Square className="w-4 h-4 mr-2 text-blue-600" />
            Action Node
          </div>
        </div>
        
        <div
          className="p-3 border-2 border-yellow-200 rounded-lg cursor-move bg-yellow-50 hover:bg-yellow-100 transition-colors"
          onDragStart={(e) => onDragStart(e, 'decisionNode')}
          draggable
        >
          <div className="flex items-center">
            <Diamond className="w-4 h-4 mr-2 text-yellow-600" />
            Decision Node
          </div>
        </div>
        
        <div
          className="p-3 border-2 border-purple-200 rounded-lg cursor-move bg-purple-50 hover:bg-purple-100 transition-colors"
          onDragStart={(e) => onDragStart(e, 'loopNode')}
          draggable
        >
          <div className="flex items-center">
            <RepeatIcon className="w-4 h-4 mr-2 text-purple-600" />
            Loop Node
          </div>
        </div>
        
        <div
          className="p-3 border-2 border-red-200 rounded-lg cursor-move bg-red-50 hover:bg-red-100 transition-colors"
          onDragStart={(e) => onDragStart(e, 'endNode')}
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

// Main WorkflowBuilder component remains the same as before
const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowWrapper = useRef(null);

  // const PADDING = 50;

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Helper function to find the closest node to a point
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

  // Helper function to check if a point is inside a node
  const isPointInNode = useCallback((point, node) => {
    console.log({ node });
    console.log({ nooooo: node.type})
    const { width, height } = NODE_DIMENSIONS[node.type];
    return (
      point.x >= node.position.x &&
      point.x <= node.position.x + width &&
      point.y >= node.position.y &&
      point.y <= node.position.y + height
    );
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Check if the drop position is inside any loop node
      const parentNode = nodes.find(node => 
        node.type === 'loopNode' && isPointInNode(position, node)
      );

      // Generate a unique ID for the new node
      const newNodeId = `${type}_${Date.now()}`;

      // Create new node with default position for nested nodes
      const newNode = {
        id: generateUniqueId(),
        type,
        position: parentNode 
          ? { 
              x: PADDING, // Start with padding from left
              y: nodes.filter(n => n.parentNode === parentNode.id).length * 100 + PADDING // Stack vertically with padding
            }
          : position,
        data: { 
          label: `${type.replace('Node', '')}`,
          description: type === 'actionNode' ? 'Configure this action' : undefined,
          iterations: type === 'loopNode' ? 3 : undefined,
        },
        // Add style and parent properties
        style: {
          border: type === 'loopNode' ? '2px dashed #8B5CF6' : undefined,
        },
        // Add parent and extent properties if dropped inside a loop node
        ...(parentNode && {
          parentNode: parentNode.id,
          extent: 'parent',
          draggable: true,
        })
      };
      

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        
        if (parentNode) {
          // If dropped in a loop node, connect to the last node in the loop if it exists
          const loopChildren = nds.filter(n => n.parentNode === parentNode.id);
          if (loopChildren.length > 0) {
            const lastChild = loopChildren[loopChildren.length - 1];
            // Add connection with unique ID
            setEdges(eds => eds.concat({
              id: generateUniqueId(),
              source: lastChild.id,
              target: newNode.id,
              type: 'smoothstep',
            }));
          }

          // Update parent node's data
          return updatedNodes.map(node => {
            if (node.id === parentNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  children: [...(node.data.children || []), newNodeId]
                }
              };
            }
            return node;
          });
        } else {
          // If not in a loop node, connect to the closest previous node
          const closestNode = findClosestNode(position, nds);
          if (closestNode) {
            setEdges(eds => eds.concat({
              id: generateUniqueId(),
              source: closestNode.node.id,
              target: newNode.id,
              type: 'smoothstep',
            }));
          }
          return updatedNodes;
        }
      });
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
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
            type: 'straight',
            animated: true,
            style: { strokeWidth: 2 }
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
          <Panel position="top-left">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => {
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                  nodes,
                  edges
                );
                setNodes([...layoutedNodes]);
                setEdges([...layoutedEdges]);
              }}
            >
              Auto Layout
            </button>
          </Panel>
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;