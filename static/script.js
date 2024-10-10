const gridElement = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const modal = document.getElementById('modal');
let grid = [];
let start = null;
let end = null;

// Create grid
function createGrid() {
    gridElement.innerHTML = '';
    grid = Array.from({ length: 20 }, () => Array(20).fill(0)); // 0 for walkable

    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => selectCell(i, j, cell));
            gridElement.appendChild(cell);
        }
    }
}

// Handle cell selection
function selectCell(i, j, cell) {
    if (!start) {
        start = [i, j];
        cell.classList.add('start');
    } else if (!end) {
        end = [i, j];
        cell.classList.add('end');
    } else {
        // Toggle wall
        if (grid[i][j] === 0) {
            grid[i][j] = 1; // Wall
            cell.classList.add('wall');
        } else if (grid[i][j] === 1) {
            grid[i][j] = 0; // Clear
            cell.classList.remove('wall');
        }
    }
}


function randomizeWalls() {
    const wallProbability = 0.3;  // Set the probability of a wall appearing (30%)
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            // Don't override the start or end points
            if ((i !== start[0] || j !== start[1]) && (i !== end[0] || j !== end[1])) {
                // Set a random wall based on the probability
                if (Math.random() < wallProbability) {
                    grid[i][j] = 1;  // 1 represents a wall
                } else {
                    grid[i][j] = 0;  // 0 represents an open path
                }
            }
        }
    }
    renderGrid();  // Re-render the grid to display the random walls
}
function renderGrid() {
    gridElement.innerHTML = '';  // Clear existing grid
    console.log("Rendering grid...");

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            // Check cell value
            if (grid[i][j] === 1) {
                cell.classList.add('wall');
            } else if (i === start[0] && j === start[1]) {
                cell.classList.add('start');
            } else if (i === end[0] && j === end[1]) {
                cell.classList.add('end');
            }

            gridElement.appendChild(cell);
            console.log(`Cell rendered at (${i}, ${j})`);
        }
    }
}
async function animatePath(path) {
    for (let i = 0; i < path.length; i++) {
        const [x, y] = path[i];
        const cell = gridElement.children[x * 20 + y];

        // Add the path class to the cell
        cell.classList.add('path');

        // Optionally, pause between each step
        await new Promise(resolve => setTimeout(resolve, 250)); // 300ms delay for a slower effect
    }
}


// Start A* algorithm
async function startAlgorithm() {
    if (!start || !end) {
        alert("Please set both start and end points.");
        return;
    }

    const csrfToken = getCookie('csrftoken'); // Get the CSRF token from the cookie
    const response = await fetch('/a_star/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Send as JSON
            'X-CSRFToken': csrfToken, // Include CSRF token in headers
        },
        body: JSON.stringify({
            start: start,
            end: end,
            grid: grid
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert("Error with A* algorithm: " + errorData.error);
        return;
    }

    const path = await response.json();

    if (path.length === 0) {
        alert("No path Found!!");// Show modal if no path found
    } else {
            animatePath(path);
    }
}

// Reset the grid
function resetGrid() {
    start = null;
    end = null;
    grid = [];
    createGrid();
}


// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie string begins with the name we want
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Event listeners
startBtn.addEventListener('click', startAlgorithm);
resetBtn.addEventListener('click', resetGrid);
document.getElementById('randomize-btn').addEventListener('click', randomizeWalls);
createGrid();
