const graph = {};
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const queueList = document.getElementById('queueList');
const addEdgeForm = document.getElementById('addEdgeForm');
const startBFSButton = document.getElementById('startBFSButton');
const startDFSButton = document.getElementById('startDFSButton');
const startUCSButton = document.getElementById('startUCSButton');
const resetButton = document.getElementById('resetButton');
const resetColorsButton = document.getElementById('resetColorsButton');

let steps = [];
let stepIndex = 0;
let interval = null;
let visitedNodes = new Set(); 
let exploringNodes = new Set(); 

const positions = {}; 

// Add edges to the graph
function addEdge(from, to, cost) {
    if (!graph[from]) graph[from] = [];
    if (!positions[from]) positions[from] = randomPosition();
    if (!positions[to]) positions[to] = randomPosition();

    graph[from].push({ node: to, cost });
    drawGraph();
}

// Generate random positions for nodes
function randomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

// Draw the graph (nodes and edges)
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    for (const from in graph) {
        for (const edge of graph[from]) {
            const to = edge.node;
            const start = positions[from];
            const end = positions[to];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw cost
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            ctx.fillStyle = 'black';
            ctx.fillText(edge.cost, midX, midY);
        }
    }

    // Draw nodes
    for (const node in positions) {
        const { x, y } = positions[node];

        // Highlight the node being explored
        let fillColor = 'white';
        if (exploringNodes.has(node)) fillColor = 'yellow'; 
        if (visitedNodes.has(node)) fillColor = 'lightgray'; 

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.fillText(node, x - 5, y + 5);
    }
}

// Update queue UI
function updateQueueUI(queue) {
    queueList.innerHTML = '';
    for (const item of queue) {
        const li = document.createElement('li');
        li.textContent = `Node: ${item.node}, Cost: ${item.cost || ''}`;
        queueList.appendChild(li);
    }
}

// Breadth-First Search (BFS) - Level-wise exploration
function bfs(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [start] }];
    steps = [];
    exploringNodes = new Set(); 

    while (queue.length > 0) {
        const current = queue.shift();
        steps.push(current);
        exploringNodes.add(current.node); 

        updateQueueUI(queue);  

        if (current.node === goal) return steps;

        if (!visited.has(current.node)) {
            visited.add(current.node);
            visitedNodes.add(current.node); // Mark node as visited

            // Explore neighbors (breadth-first)
            for (const neighbor of graph[current.node] || []) {
                queue.push({ node: neighbor.node, path: [...current.path, neighbor.node] });
            }
        }
    }
    return steps;
}

// Depth-First Search (DFS) - Deep exploration along one path
function dfs(start, goal) {
    const visited = new Set();
    const stack = [{ node: start, path: [start] }];
    steps = [];
    exploringNodes = new Set(); // Reset exploring nodes

    while (stack.length > 0) {
        const current = stack.pop();
        steps.push(current);
        exploringNodes.add(current.node); // Add current node to exploring set

        updateQueueUI(stack);  // Update queue display

        if (current.node === goal) return steps;

        if (!visited.has(current.node)) {
            visited.add(current.node);
            visitedNodes.add(current.node); // Mark node as visited

            // Explore neighbors (depth-first)
            for (const neighbor of graph[current.node] || []) {
                stack.push({ node: neighbor.node, path: [...current.path, neighbor.node] });
            }
        }
    }
    return steps;
}

// Uniform-Cost Search (UCS) - Cheapest path exploration
function uniformCostSearch(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [start], cost: 0 }];
    steps = [];
    exploringNodes = new Set(); // Reset exploring nodes

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost); // Sort by cost
        const current = queue.shift();
        steps.push(current);
        exploringNodes.add(current.node); 

        updateQueueUI(queue); 

        if (current.node === goal) return steps;

        if (!visited.has(current.node)) {
            visited.add(current.node);
            visitedNodes.add(current.node); // Mark node as visited

            // Explore neighbors (by cost)
            for (const neighbor of graph[current.node] || []) {
                queue.push({
                    node: neighbor.node,
                    cost: current.cost + neighbor.cost,
                    path: [...current.path, neighbor.node],
                });
            }
        }
    }
    return steps;
}

function visualizeStep() {
    if (stepIndex < steps.length) {
        resetGraphColors();

        const step = steps[stepIndex];
        const currentNode = positions[step.node];

        // Highlight the current node
        ctx.beginPath();
        ctx.arc(currentNode.x, currentNode.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        // Highlight the path
        for (const node of step.path) {
            const nodePosition = positions[node];
            ctx.beginPath();
            ctx.arc(nodePosition.x, nodePosition.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = 'lightblue';
            ctx.fill();
            ctx.closePath();
        }

        // Update Output
        document.getElementById('pathDisplay').textContent = `Path: ${step.path.join(' -> ')}`;
        document.getElementById('stepsDisplay').textContent = `Steps: ${steps.length}`;
        
        // Display total cost if it exists (only UCS will have a cost)
        if (stepIndex === steps.length - 1 && steps[stepIndex].cost !== undefined) {
            document.getElementById('costDisplay').textContent = `Total Cost: ${steps[stepIndex].cost}`;
        } else {
            document.getElementById('costDisplay').textContent = ''; 
        }

        stepIndex++;
    } else {
        clearInterval(interval);
    }
}

function reset() {
    steps = [];
    stepIndex = 0;
    visitedNodes.clear(); 
    exploringNodes.clear(); 
    Object.keys(graph).forEach(key => delete graph[key]);
    Object.keys(positions).forEach(key => delete positions[key]);
    queueList.innerHTML = '';
    drawGraph();
}

function resetGraphColors() {
    drawGraph();
}

// Event Listeners
addEdgeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value, 10);

    addEdge(from, to, cost);
    addEdgeForm.reset();
});

startBFSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = bfs(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

startDFSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = dfs(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

startUCSButton.addEventListener('click', () => {
    const startNode = prompt('Enter start node:').toUpperCase();
    const goalNode = prompt('Enter goal node:').toUpperCase();
    steps = uniformCostSearch(startNode, goalNode);
    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

resetButton.addEventListener('click', reset);
resetColorsButton.addEventListener('click', resetGraphColors);
