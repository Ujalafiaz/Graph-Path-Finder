// Graph Representation
const graph = {
    A: { B: 1, C: 4 },
    B: { A: 1, D: 2, E: 5 },
    C: { A: 4, F: 3 },
    D: { B: 2 },
    E: { B: 5, F: 1 },
    F: { C: 3, E: 1 },
};

// BFS Algorithm
function bfs(start, end) {
    const queue = [[start]];
    const visited = new Set();
    let steps = 0;

    while (queue.length > 0) {
        const path = queue.shift();
        const node = path[path.length - 1];
        steps++;

        if (node === end) {
            highlightPath(path); // Highlight path on the graph
            return { path, steps };
        }

        if (!visited.has(node)) {
            visited.add(node);
            for (let neighbor in graph[node]) {
                queue.push([...path, neighbor]);
            }
        }
    }
    return { path: null, steps };
}

// DFS Algorithm
function dfs(start, end) {
    const stack = [[start]];
    const visited = new Set();
    let steps = 0;

    while (stack.length > 0) {
        const path = stack.pop();
        const node = path[path.length - 1];
        steps++;

        if (node === end) {
            highlightPath(path); // Highlight path on the graph
            return { path, steps };
        }

        if (!visited.has(node)) {
            visited.add(node);
            for (let neighbor in graph[node]) {
                stack.push([...path, neighbor]);
            }
        }
    }
    return { path: null, steps };
}

// UCS Algorithm
function ucs(start, end) {
    const queue = [[0, [start]]];
    const visited = new Set();
    let steps = 0;

    while (queue.length > 0) {
        queue.sort((a, b) => a[0] - b[0]);
        const [cost, path] = queue.shift();
        const node = path[path.length - 1];
        steps++;

        if (node === end) {
            highlightPath(path); // Highlight path on the graph
            return { path, cost, steps };
        }

        if (!visited.has(node)) {
            visited.add(node);
            for (let neighbor in graph[node]) {
                queue.push([cost + graph[node][neighbor], [...path, neighbor]]);
            }
        }
    }
    return { path: null, cost: null, steps };
}

// Event Handlers
document.getElementById('bfs-btn').addEventListener('click', () => handleAlgorithm('bfs'));
document.getElementById('dfs-btn').addEventListener('click', () => handleAlgorithm('dfs'));
document.getElementById('ucs-btn').addEventListener('click', () => handleAlgorithm('ucs'));

function handleAlgorithm(algo) {
    const start = document.getElementById('start-city').value;
    const end = document.getElementById('end-city').value;

    let result;
    if (algo === 'bfs') result = bfs(start, end);
    else if (algo === 'dfs') result = dfs(start, end);
    else if (algo === 'ucs') result = ucs(start, end);

    // Display path
    document.getElementById('path').textContent = `Path: ${result.path ? result.path.join(' -> ') : 'No path found'}`;

    // Hide cost for BFS and DFS, show cost only for UCS
    if (algo === 'ucs') {
        document.getElementById('cost').textContent = `Cost: ${result.cost}`;
        document.getElementById('cost').style.display = 'block'; // Ensure cost is visible for UCS
    } else {
        document.getElementById('cost').style.display = 'none'; // Hide cost for BFS and DFS
    }

    // Display steps (time complexity)
    document.getElementById('time-complexity').textContent = `Steps: ${result.steps}`;
    // Add reset button handler
    document.getElementById('reset-btn').addEventListener('click', resetGraph);

}

