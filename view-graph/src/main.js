import { graphData } from './graphData.js';
import { Vector2 } from './vector2.js';

console.log(graphData.nodes);

function resetView() {
    console.log("resetView");
    pivot = new Vector2(0, 0);
    updateView();
}

function changeZoomByFactor(factor) {
    console.log("changeZoomByFactor", factor);
    worldViewArea *= factor;
    setNodeRadius(nodeRadius / factor);
    updateView();
}

function zoomIn() {
    if (worldViewArea > 400 * 400) {
        changeZoomByFactor(0.8);
    }
}

function zoomOut() {
    if (worldViewArea < 1600 * 1600) {
        changeZoomByFactor(1.2);
    }
}

function onClickModelButton() {
    window.location.href = "../index.html";
}

function onMouseWheel(event) {
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
        zoomOut();
    } else {
        zoomIn();
    }
}

function onClickNode(node) {
    console.log("onClickNode", node);
}

// Event listeners
document.getElementById("reset-view-button").addEventListener("click", resetView);
document.getElementById("zoom-in-button").addEventListener("click", zoomIn);
document.getElementById("zoom-out-button").addEventListener("click", zoomOut);
document.getElementById("model-button").addEventListener("click", onClickModelButton);
window.addEventListener("wheel", onMouseWheel);

const graphView = document.getElementById("graph-view");
var nodes = new Set();

// World view: the rectangle in the world that is visible.
// Camera view: the rectangle in UI that displays the world.

var pivot = new Vector2(0, 0);  // World position of the center of current view
var worldViewArea = 600 * 600;  // Area of the world that is visible.
var nodeRadius = 32;

// Global variables for avoiding re-computation
var worldViewWidth = null;
var worldViewHeight = null;
var camWidth = graphView.offsetWidth;
var camHeight = graphView.offsetHeight;

var pivotElem = null;


function updateElemRadius(elem, radius) {
    const value = radius * 2 + "px"
    elem.style.width = elem.style.height = value;
    elem.style.lineHeight = value;
    elem.style.fontSize = (radius / 4) + "px";
}

function updateRadiusOfVisibleNodes(radius) {
    for (let node of nodes) {
        if (inCam(node.curCamPos, radius)) {
            updateElemRadius(node.elem, radius);
        } else {
            node.elem.style.visibility = 'hidden';
        }
    }
}


function setNodeRadius(radius) {
    nodeRadius = radius;
    updateRadiusOfVisibleNodes(radius);
}

function setPivot(newPivot) {
    pivot = newPivot;
    
    const pivotCamPos = worldToCamPos(newPivot);
    setElemPos(pivotElem, pivotCamPos);

    updateView();
}

// Only called in `updateView`
function updateNodeElems() {
    // Loop through all nodes and update their cam position.
    // Then decide whether to render them.
    var toRm = [];
    for (let node of nodes) {
        const elem = node.elem;
        const worldPos = node.worldPos;
        var newPos = worldToCamPos(worldPos);
        node.curCamPos = newPos;
        if (inCam(newPos, nodeRadius)) {
            setCirclePos(elem, newPos, nodeRadius);
            updateElemRadius(elem, nodeRadius);
            elem.style.visibility = 'visible';
        } else {
            elem.style.visibility = 'hidden';
            
        }
    }
}


// Should be called every time the camera changes.
function updateView() {
    camWidth = graphView.offsetWidth;
    camHeight = graphView.offsetHeight;
    const camAspectRatio = camWidth / camHeight;
    worldViewWidth = Math.sqrt(worldViewArea * camAspectRatio);
    worldViewHeight = Math.sqrt(worldViewArea / camAspectRatio);
    updateNodeElems();
}

function rotateElem(elem, deg) {
    elem.style.webkitTransform = 'rotate(' + deg + 'deg)';
    elem.style.mozTransform = 'rotate(' + deg + 'deg)';
    elem.style.oTransform = 'rotate(' + deg + 'deg)';
    elem.style.transform = 'rotate(' + deg + 'deg)';
}

function worldToCamPos(pos) {
    const worldToCamScale = camWidth / worldViewWidth;

    // World position of camera corners
    const worldDiagHalf = new Vector2(worldViewWidth / 2, worldViewHeight / 2);
    const worldTL = pivot.sub(worldDiagHalf);
    const worldBR = pivot.add(worldDiagHalf);

    return pos.sub(worldTL).mulScalar(worldToCamScale);
}

function inCam(camPos, radius) {
    return (Math.floor(camPos.x - radius) >= 0 && 
        Math.floor(camPos.y - radius) >= 0 && 
        Math.ceil(camPos.x + radius + 10) < camWidth &&
        Math.ceil(camPos.y + radius + 10) < camHeight);
}

function setElemPos(elem, pos) {
    elem.style.left = pos.x + "px";
    elem.style.top = pos.y + "px";
}

function setCirclePos(elem, pos, radius) {
    elem.style.left = pos.x - radius + "px";
    elem.style.top = pos.y - radius + "px";
}

function createNodeElem(label) {
    const nodeElem = document.createElement("div");
    nodeElem.className = "node";
    nodeElem.fontSize = (nodeRadius / 4) + "px";
    nodeElem.style.lineHeight = nodeRadius * 2 + 'px';
    nodeElem.style.height = nodeRadius * 2 + 'px';
    nodeElem.style.width =  nodeRadius * 2 + 'px';
    nodeElem.innerText = label;
    nodeElem.onclick = onClickNode;
    return nodeElem;
}


function createGraph(graphData) {
    // Save all nodes
    for (let node of graphData.nodes) {
        const worldPos = new Vector2(node.position.x, node.position.y);
        const camPos = worldToCamPos(worldPos);
        const label = node.data.name;
        const nodeElem = createNodeElem(label);
        nodes.add({
            elem: nodeElem,
            worldPos: worldPos,
            curCamPos: camPos,
            label: label,
        })

        // Add to page
        nodeElem.style.visibility = 'hidden';
        graphView.appendChild(nodeElem);
    }
    
    // Show only nodes that are within camera view.
    for (let node of nodes) {
        if (inCam(node.curCamPos, nodeRadius)) {
            // TODO: make visible
            node.elem.style.visibility = 'visible';
            setCirclePos(node.elem, node.curCamPos, nodeRadius);
        }
    }
    
    // Create mark for pivot
    pivotElem = document.createElement("div");
    pivotElem.className = "pivot";
    pivotElem.style.height = 4 + 'px';
    pivotElem.style.width = 4 + 'px';
    pivotElem.style.visibility = 'visible';
    const pivotCamPos = worldToCamPos(pivot);
    graphView.appendChild(pivotElem);
    setCirclePos(pivotElem, pivotCamPos, 4);
}


function initCamDragable() {
    let finalX = 0, finalY = 0;
    let origX = 0, origY = 0;
    graphView.onmousedown = onMouseDown;

    function onMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        origX = e.clientX;
        origY = e.clientY;
        document.onmouseup = onMouseUp;
        document.onmousemove = onMouseMove;
    }

    function onMouseMove(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        finalX = e.clientX;
        finalY = e.clientY;
        // set the element's new position:
        const camMouseMovement = new Vector2(origX - finalX, origY - finalY)
        const camToWorldScale = worldViewWidth / camWidth;
        const newPivot = pivot.add(camMouseMovement.mulScalar(camToWorldScale));
        setPivot(newPivot);
        // reset the origin:
        origX = finalX;
        origY = finalY;
    }

    function onMouseUp(e) {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


function init() {
    createGraph(graphData);
    initCamDragable();
    updateView();
}

function zoomToNode(node) {
    setPivot(node.worldPos);
}

window.onresize = updateView;
window.onload = init;