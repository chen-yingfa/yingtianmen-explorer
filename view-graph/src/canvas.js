import { graphData } from './graphData.js';
import { Vector2 } from './vector2.js';
import * as draw from './draw.js';
import { Graph } from './graph.js';
import {
    HOME_NODE_ID,
    nodeTypeToColor,
    ORIG_STROKE_WIDTH,
    ORIG_WORLD_VIEW_AREA,
} from './consts.js';

console.log(graphData.nodes);

function resetView() {
    console.log("resetView");
    curPivot = origPivot;
    console.log(worldViewArea, ORIG_WORLD_VIEW_AREA);
    worldViewArea = ORIG_WORLD_VIEW_AREA;
    scale = 1;
    updateNodesCamPos();
    drawScene();
}

function changeZoomByFactor(factor) {
    // View area increases by factor^2.
    worldViewArea *= factor * factor;
    scale /= factor;
    updateNodesCamPos();
    drawScene();
}

function zoomIn() {
    if (worldViewArea > ORIG_WORLD_VIEW_AREA / 6) {
        changeZoomByFactor(0.8);
    }
}

function zoomOut() {
    if (worldViewArea < ORIG_WORLD_VIEW_AREA * 32) {
        changeZoomByFactor(1.2);
    }
}

function onClickModelButton() {
    if (!enableMouseControls) return;
    window.location.href = "../index.html";
}

function onMouseWheel(event) {
    if (!enableMouseControls) return;
    if (event.path[0] != canvas) return;
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
        zoomOut();
    } else {
        zoomIn();
    }
}

function onMouseMove(e) {
    if (!enableMouseControls) return;
    // important: correct mouse position:
    var rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (hoveringNodeId) {
        const hoveringNode = graph.nodes[hoveringNodeId];
        const actualRadius = (hoveringNode.radius + nodeStrokeWidth / 2) * scale;
        const dist = hoveringNode.curCamPos.distance(new Vector2(x, y));
        if (dist > actualRadius) {
            onStopHoverNode();
        }
    }
    
    if (!hoveringNodeId) {
        // Check if hovering a new node
        for (const node of graph.iterNodes()) {
            if (!node.visible) continue;
            const actualRadius = (node.radius + nodeStrokeWidth / 2) * scale;
            const dist = node.curCamPos.distance(new Vector2(x, y));
            if (dist < actualRadius) {
                onStartHoverNode(node.id);
                break;
            }
        }
    }

    if (hoveringNodeId) {
        this.style.cursor = 'pointer';
    } else {
        this.style.cursor = 'default';
    }
    drawScene();
}

function onStartHoverNode(nodeId) {
    hoveringNodeId = nodeId;
}

function onStopHoverNode() {
    hoveringNodeId = null;
}

function onStartFocusNode(nodeId) {
    // Zoom to node and display info about the entity.
    focusingNodeId = nodeId;
    const node = graph.nodes[nodeId];
    displayInfo(node);
    lerpCam(node.worldPos, worldViewArea);
}

function onStopFocusNode() {
    // focusingEdges.clear();
    focusingNodeId = null;
    hideInfo();
}

function onClickNode(nodeId) {
    if (!enableMouseControls) return;
    onStartFocusNode(nodeId);
}

function onClickCanvas(e) {
    // console.log("onClickCanvas");
    if (!enableMouseControls) return;
    if (hoveringNodeId) {
        onClickNode(hoveringNodeId);
    } else {
        onStopFocusNode();
    }
    drawScene();
}

function onSearchInputKeyPress(event) {
    if (event.keyCode == 13) {
        onSearch();
    }
}

function onClickInfoImage(event) {
    if (infoImage.src != '') {
        largeImage.src = infoImage.src;
        largeImageContainer.style.visibility = 'visible';
    }
}

function onClickLargeImageCloseButton(event) {
    largeImageContainer.style.visibility = 'hidden';
}


// Global DOM elements
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoType = document.getElementById('info-type');
const infoContent = document.getElementById('info-content');
const infoImage = document.getElementById('info-image');
const canvas = document.getElementById("graph-view");
const searchInput = document.getElementById('search-input');
const searchResultContainer = document.getElementById('search-result-container');
const largeImageContainer = document.getElementById('large-image-container');
const largeImage = document.getElementById('large-image');
const largeImageCloseButton = document.getElementById('large-image-close-button');

// Event listeners
document.getElementById("reset-view-button").addEventListener("click", resetView);
document.getElementById("zoom-in-button").addEventListener("click", zoomIn);
document.getElementById("zoom-out-button").addEventListener("click", zoomOut);
document.getElementById("model-button").addEventListener("click", onClickModelButton);
document.getElementById("search-button").addEventListener("click", onSearch);
document.getElementById("search-input").addEventListener("keypress", onSearchInputKeyPress);
window.addEventListener("wheel", onMouseWheel);
infoImage.addEventListener('click', onClickInfoImage);
largeImageCloseButton.addEventListener('click', onClickLargeImageCloseButton);


const ctx = canvas.getContext('2d');
canvas.onmousemove = onMouseMove;
// canvas.addEventListener("click", onClickCanvas);

// Globals for knowledge graph app
var enableMouseControls = true;
var graph = null;
var hoveringNodeId = null;
var focusingNodeId = null;
// var focusingEdges = new Set();
// var hoveringEdges = new Set();

// World view: the rectangle in the world that is visible.
// Camera view: the rectangle in UI that displays the world.
var origPivot = new Vector2(0, 0);

var curPivot = origPivot;  // World position of the center of current view
var worldViewArea = ORIG_WORLD_VIEW_AREA;  // Area of the world that is visible.

const nodeStrokeWidth = ORIG_STROKE_WIDTH;
var scale = 1.0;

// Global variables for avoiding re-computation
var worldViewWidth = null;
var worldViewHeight = null;
var camWidth = canvas.offsetWidth;
var camHeight = canvas.offsetHeight;
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;


function drawScene() {
    draw.drawScene(
        graph, focusingNodeId, hoveringNodeId, nodeStrokeWidth, scale);
}


function updateNodesCamPos() {
    onCamUpdate();
    for (const node of graph.iterNodes()){
        node.curCamPos = worldToCamPos(node.worldPos);
    }
}

function setPivot(newPivot) {
    curPivot = newPivot;
    // Update cam pos of all nodes
    for (const node of graph.iterNodes()) {
        node.curCamPos = worldToCamPos(node.worldPos);
    }
}


// Should be called every time the camera changes.
function onCamUpdate() {
    camWidth = canvas.offsetWidth;
    camHeight = canvas.offsetHeight;
    const camAspectRatio = camWidth / camHeight;
    worldViewWidth = Math.sqrt(worldViewArea * camAspectRatio);
    worldViewHeight = Math.sqrt(worldViewArea / camAspectRatio);
}

function lerpCam(dstPivot, dstWorldViewArea) {
    enableMouseControls = false;
    setTimeout(() => {
        enableMouseControls = true;
    }, 200);

    const startPivot = curPivot;
    const startWorldViewArea = worldViewArea;
    const startTime = Date.now();

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    const animate = () => {
        const elapsedTime = Date.now() - startTime;
        const ratio = elapsedTime / 200;
        const newPivot = startPivot.lerp(dstPivot, ratio);
        const newWorldViewArea = lerp(startWorldViewArea, dstWorldViewArea, ratio);
        setPivot(newPivot);
        drawScene();
        if (ratio < 1) {
            requestAnimationFrame(animate);
        } else {
            setPivot(dstPivot);
        }
    }
    requestAnimationFrame(animate);
}


// Note that `onCamUpdate` has to be called before this when camera changes.
function worldToCamPos(pos) {
    const worldToCamScale = camWidth / worldViewWidth;
    // World position of camera corners
    const worldDiagHalf = new Vector2(worldViewWidth / 2, worldViewHeight / 2);
    const worldTL = curPivot.sub(worldDiagHalf);
    return pos.sub(worldTL).mulScalar(worldToCamScale);
}

function makeCamDragable() {
    let curX = 0, curY = 0;
    let prevX = 0, prevY = 0;
    let downX = 0, downY = 0;
    canvas.onmousedown = onMouseDown;

    function onMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        downX = prevX = curX = e.clientX;
        downY = prevY = curY = e.clientY;
        
        document.onmouseup = onMouseUp;
        document.onmousemove = onMouseMove;
    }

    function onMouseMove(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        curX = e.clientX;
        curY = e.clientY;
        // set the element's new position:
        const camMouseMovement = new Vector2(prevX - curX, prevY - curY)
        const camToWorldScale = worldViewWidth / camWidth;
        const newPivot = curPivot.add(camMouseMovement.mulScalar(camToWorldScale));
        setPivot(newPivot);
        // reset the origin:
        prevX = curX;
        prevY = curY;
        drawScene();
    }

    function onMouseUp(e) {
        document.onmouseup = null;
        document.onmousemove = null;
        // console.log(downX, downY, curX, curY);
        if (Math.abs(downX - curX) <= 2 && Math.abs(downY - curY) <= 2) {
            onClickCanvas(e);
        }
    }
}

function initPivot() {
    origPivot = graph.nodes[HOME_NODE_ID].worldPos;
    curPivot = origPivot;
}


function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    graph = new Graph(graphData, nodeTypeToColor, worldToCamPos);
    initPivot();
    makeCamDragable();
    updateNodesCamPos();
    onCamUpdate();
    drawScene();
}

window.onresize = onCamUpdate;
window.onload = init;


function displayInfo(node) {
    infoTitle.innerHTML   = `${node.label}`;
    infoType.innerHTML    = `类型：${node.type}`;
    infoContent.innerHTML = `${node.content}`;
    if (node.images.length > 0) {
        infoImage.src = node.images[0];
        infoImage.onclick = (event) => {
            largeImageContainer.visibility = 'visible';
        }
    } else {
        infoImage.src = '';
    }
    infoPanel.style.visibility = 'visible';
}

function hideInfo() {
    infoPanel.style.visibility = 'hidden';
}



function onSearch() {
    const searchText = searchInput.value;
    console.log(searchText);
    var result = [];
    while (searchResultContainer.lastChild) 
        searchResultContainer.removeChild(searchResultContainer.lastChild);

    // Do search
    var searchKeys = ['label', 'content', 'type'];
    for (const node of Object.values(graph.nodes)) {
        for (const key of searchKeys) {
            if (node[key].includes(searchText)) {
                result.push(node.id);
                break;
            }
        }
    }

    function createResultDiv(nodeId) {
        const res = document.createElement('div');
        res.innerHTML = `<div class="search-result">${graph.nodes[nodeId].label}</div>`;
        res.onclick = () => {
            onClickNode(nodeId);
        }
        res.onmouseenter = () => {
            console.log('hover', nodeId);
            onStartHoverNode(nodeId);
            drawScene();
        }
        res.onmouseleave = () => {
            onStopHoverNode(nodeId);
            drawScene();
        }
        return res;
    }
    
    // Show results
    if (result.length > 0) {
        for (const nodeId of result) {
            const resultDiv = createResultDiv(nodeId);
            searchResultContainer.appendChild(resultDiv);
        }
    }
}