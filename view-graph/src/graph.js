import { DEFAULT_NODE_COLOR, ORIG_NODE_RADIUS } from './consts.js';
import { Vector2 } from './vector2.js';

export class Graph {
    constructor(graphData, nodeTypeToColor, worldToCamPos) {
        this.nodes = {};
        this.edges = {};
        this.adjNodes = {};
        this.adjEdges = {};

        // Save all nodes
        for (let node of graphData.nodes) {
            // console.log(node);
            const worldPos = new Vector2(node.pos.x, node.pos.y);
            const id = node.id;
            var color = DEFAULT_NODE_COLOR;
            if (node.type in nodeTypeToColor){
                color = nodeTypeToColor[node.type]
            }
            const nodeRadius = ("size" in node ? node.size : 1.0) * ORIG_NODE_RADIUS;
            this.nodes[id] = {
                id: id,
                type: node.type,
                worldPos: worldPos,
                curCamPos: worldToCamPos(worldPos),
                label: node.label,
                color: color,
                content: node.description,
                images: node.images,
                radius: nodeRadius,
                visible: false,
            }
        }
        
        // Edges
        var edgeId = 0;
        for (let edge of graphData.edges) {
            const id = edgeId++;
            const src = edge.src;
            const dst = edge.dst;
            const srcType = this.nodes[src].type;
            this.edges[id] = {
                id: id,
                src: src,
                dst: dst,
                color: nodeTypeToColor[srcType],
            }
        }

        // Construct map from node id to adj nodes and edges, for faster look up.
        // Because the graph never changes after init.
        for (var node of Object.values(this.nodes)) {
            this.adjEdges[node.id] = [];
            this.adjNodes[node.id] = [];
            for (var edge of Object.values(this.edges)) {
                if (edge.src == node.id) {
                    this.adjEdges[node.id].push(edge);
                    this.adjNodes[node.id].push(edge.dst);
                }
                else if (edge.dst == node.id) {
                    this.adjEdges[node.id].push(edge);
                    this.adjNodes[node.id].push(edge.src);
                }
            }
            node.radius = node.radius * Math.pow(this.adjNodes[node.id].length / 4, 1 / 3);
        }
    }

    *iterNodes() {
        for (const node of Object.values(this.nodes)) {
            yield node;
        }
    }

    *iterEdges() {
        for (const edge of Object.values(this.edges)) {
            yield edge;
        }
    }
    *getAdjNodes(nodeId) {
        for (const node of this.adjNodes[nodeId]) {
            yield node;
        }
    }
    
    *getAdjEdges(nodeId) {
        for (const edge of this.adjEdges[nodeId]) {
            yield edge;
        }
    }
}