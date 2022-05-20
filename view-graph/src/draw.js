import {
    NODE_COLOR_FOCUS,
    EDGE_COLOR_FOCUS,
    EDGE_COLOR_HOVER,
    NODE_COLOR_HOVER,
    EDGE_COLOR,
    DEFAULT_NODE_TEXT_COLOR,
    ALPHA_FAR_NODES,
} from './consts.js';


const canvas = document.getElementById("graph-view");
const ctx = canvas.getContext('2d');

function changeColorStringAlpha(color, alpha) {
    // color string format: "rgba(r, g, b, a)"
    const colorArr = color.split(',');
    colorArr[3] = alpha + ')';
    return colorArr.join(',');
}

function getColorStringAlpha(color) {
    return color.split(',')[3].slice(0, -1);
}

export function drawScene(graph, focusingNodeId, hoveringNodeId,
                          nodeStrokeWidth, scale) {
    nodeStrokeWidth *= scale;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const nodes = graph.nodes;
    const edges = graph.edges;

    for (const node of Object.values(nodes)) {
        node.visible = false;
    }
    
    const edgeStrokeWidth = nodeStrokeWidth * 0.8;

    function drawEdgeOfColor(edge, color) {
        const startCamPos = nodes[edge.src].curCamPos;
        const endCamPos = nodes[edge.dst].curCamPos;
        drawEdge(startCamPos, endCamPos, color, edgeStrokeWidth);
    }

    function drawNodeOfColor(node, color, textColor, shadowColor=null, fill=false) {
        // var shape = node.type != '实体类型' ? 'circle' : 'rect';
        node.visible = true;
        drawNode(node.curCamPos, node.radius * scale, color, textColor,
            node.label, nodeStrokeWidth * node.radius / 24, shadowColor, fill, 'circle');
    }

    // If focusing, only draw nodes within two edges. Use BFS
    if (focusingNodeId) {
        // console.log('focusingnodeid', focusingNodeId);
        var showNodes = new Set([focusingNodeId]);
        // Shallow copies
        var levels = [new Set(showNodes)];
        var front = new Set(showNodes);
        for (var i = 0; i < 2; ++i) {  // Radius from focusing node
            var next = new Set();
            for (const nodeId of front) {
                for (const neighbor of graph.adjNodes[nodeId]) {
                    if (!showNodes.has(neighbor)) {
                        next.add(neighbor);
                        showNodes.add(neighbor);
                    }
                }
            }
            levels.push(next);
            front = next;
        }

        // Draw edges between visible nodes
        for (const nodeId of levels[1]) {
            for (const edge of graph.adjEdges[nodeId]) {
                drawEdgeOfColor(edge, EDGE_COLOR);
            }
        }

        // Draw focusing edges
        for (const edge of graph.adjEdges[focusingNodeId]) {
            drawEdgeOfColor(edge, EDGE_COLOR_FOCUS);
        }
        
        // Draw nodes except for last level
        for (const level of levels.slice(0, -1)) {
            for (const nodeId of level) {
            // for (const nodeId of showNodes) {
                const node = nodes[nodeId];
                drawNodeOfColor(node, node.color, DEFAULT_NODE_TEXT_COLOR, node.color);
            }
        }

        for (const node of Object.values(nodes)) {
            if (!showNodes.has(node)) {
                const nodeColor = changeColorStringAlpha(node.color, 0.1);
                drawNodeOfColor(node, nodeColor, DEFAULT_NODE_TEXT_COLOR, node.color);
            }
        }

        // Draw last level, should be less opaque
        for (const nodeId of levels[levels.length - 1]) {
            const node = nodes[nodeId];
            const nodeColor = changeColorStringAlpha(node.color, ALPHA_FAR_NODES);
            const textColor = changeColorStringAlpha(DEFAULT_NODE_TEXT_COLOR, ALPHA_FAR_NODES);
            drawNodeOfColor(node, nodeColor, textColor);
        }
            
        // Draw focusing node
        const focusingNode = nodes[focusingNodeId];
        drawNodeOfColor(focusingNode, NODE_COLOR_FOCUS, DEFAULT_NODE_TEXT_COLOR, NODE_COLOR_FOCUS, true);
    }
    // Not focusing
    else {
        // Draw edges
        for (const edge of Object.values(edges)) {
            drawEdgeOfColor(edge, EDGE_COLOR);
        }


        for (const node of Object.values(nodes)) {
            drawNodeOfColor(node, node.color, DEFAULT_NODE_TEXT_COLOR);
        }

    }
    
    if (hoveringNodeId) {
        const hoveringNode = nodes[hoveringNodeId];
        for (const edge of graph.adjEdges[hoveringNodeId]) {
            drawEdgeOfColor(edge, EDGE_COLOR_HOVER);
        }

        for (const nodeId of graph.adjNodes[hoveringNodeId]) {
            const node = nodes[nodeId];
            drawNodeOfColor(node, node.color, DEFAULT_NODE_TEXT_COLOR, node.color, false);
        }

        drawNodeOfColor(hoveringNode, NODE_COLOR_HOVER, DEFAULT_NODE_TEXT_COLOR, NODE_COLOR_HOVER, true);
    }
}


function drawNode(pos, radius, color, textColor, label, strokeWidth, shadowColor=null, fill=false, shape='circle') {
    ctx.beginPath()
    if (shape == 'circle') {
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    }
    else {
        ctx.rect(pos.x - radius, pos.y - radius, radius*2, radius*2);
    }
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    if (shadowColor) {
        ctx.shadowColor = color;
        ctx.shadowBlur = radius / 2;
    } else {
        ctx.shadowBlur = 0;
    }
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.shadowColor = 'black';
    // ctx.shadowBlur = 0;
    
    const fontSize = radius * 0.8;
    if (fontSize >= 8) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold ' + fontSize + 'px Arial';
        ctx.fillText(label, pos.x, pos.y);
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = fontSize * 0.02;
        // ctx.strokeText(label, pos.x, pos.y);
    }
}

function drawEdge(srcPos, dstPos, color, width) {
    ctx.beginPath();
    ctx.shadowBlur = 0;
    ctx.moveTo(srcPos.x, srcPos.y);
    ctx.lineTo(dstPos.x, dstPos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}


function drawNodes(graph, focusingNode, hoveringNode, strokeWidth, scale) {
    function drawColor(node, color, textColor, shadowColor=null, fill=false) {
        drawNode(node.curCamPos, node.radius * scale, color, textColor,
            node.label, strokeWidth * node.radius / 24, shadowColor, fill);
    }
    const nodes = graph.nodes;
    // If focusing, only draw nodes within two edges. Use BFS
    if (focusingNode) {
        showNodes.add(focusingNode.id);
        // Shallow copies
        levels = [new Set(showNodes)];
        var front = new Set(showNodes);
        for (var i = 0; i < 2; ++i) {  // Radius from focusing node
            var next = new Set();
            for (const nodeId of front) {
                for (const neighbor of graph.adjNodes[nodeId]) {
                    if (!showNodes.has(neighbor)) {
                        next.add(neighbor);
                        showNodes.add(neighbor);
                    }
                }
            }
            levels.push(next);
            front = next;
        }
        
        // Draw nodes
        for (const nodeId of showNodes) {
            const node = nodes[nodeId];
            drawColor(node, node.color, DEFAULT_NODE_TEXT_COLOR)
        }

        
    }
    // Not focusing, draw all nodes
    else {
        // console.log(graph);
        for (const node of Object.values(nodes)) {
            if (hoveringNode && node.id === hoveringNode.id) {
                continue;
            } else if (focusingNode && node.id === focusingNode.id) {
                continue;
            } else {
                drawColor(node, node.color, DEFAULT_NODE_TEXT_COLOR);
            }
        }
    }
    // Draw them last to make them on top of other nodes.
    if (focusingNode) {
        drawColor(focusingNode, NODE_COLOR_FOCUS, 'white', true, true);
    }
    if (hoveringNode) {
        drawColor(hoveringNode, NODE_COLOR_HOVER, 'white', true, true);
    }
}

function drawEdges(graph, focusingNode, hoveringNode, strokeWidth) {
    function drawColor(edge, color) {
        const startCamPos = graph.nodes[edge.src].curCamPos;
        const endCamPos = graph.nodes[edge.dst].curCamPos;
        drawEdge(startCamPos, endCamPos, color, strokeWidth);
    }

    if (focusingNode) {
        // And only edge between two visible nodes
        var showEdges = new Set();
        for (const nodeId of levels[1]) {
            for (const edge of graph.adjEdges[nodeId]) {
                showEdges.add(edge);
            }
        }

        // Draw edges
        for (const edge of showEdges) {
            const startCamPos = graph.nodes[edge.src].curCamPos;
            const endCamPos = graph.nodes[edge.dst].curCamPos;
            drawEdge(startCamPos, endCamPos, EDGE_COLOR, strokeWidth);
        }
        
        for (const edge of graph.iterEdges()) {
            if (hoveringEdges.has(edge) || focusingEdges.has(edge)) {
                continue;
            } else {
                drawColor(edge, EDGE_COLOR);
            }
        }

        // Draw focusing edges
        for (const edge of graph.adjEdges[focusingNode.id]) {
            drawColor(edge, EDGE_COLOR_FOCUS);
        }
    }
    // Not focusing
    else {
        // Not focusing
    }
    
    if (hoveringNode) {
        // Drawing hovering edges
        for (const edge of hoveringEdges) {
            drawColor(edge, EDGE_COLOR_HOVER);
        }
    }
}
