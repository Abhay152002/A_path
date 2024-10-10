import json
import heapq
from django.http import JsonResponse
from django.shortcuts import render

class Node:
    def __init__(self, position, parent=None):
        self.position = position
        self.parent = parent
        self.g = 0  # Cost from start to current node
        self.h = 0  # Heuristic cost estimate to goal
        self.f = 0  # Total cost

    def __eq__(self, other):
        return self.position == other.position

    def __lt__(self, other):
        return self.f < other.f


def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star_algorithm(start, end, grid):
    if (grid[start[0]][start[1]] == 1 or
            grid[end[0]][end[1]] == 1 or
            not (0 <= start[0] < len(grid) and 0 <= start[1] < len(grid[0])) or
            not (0 <= end[0] < len(grid) and 0 <= end[1] < len(grid[0]))):
        return []
    open_list = []
    closed_list = []
    start_node = Node(start)
    end_node = Node(end)
    heapq.heappush(open_list, (start_node.f, start_node))
    import time
    start_time = time.time()

    while open_list:
        if time.time() - start_time > 1:
            return []
        current_node = heapq.heappop(open_list)[1]
        closed_list.append(current_node)

        if current_node == end_node:
            path = []
            while current_node:
                path.append(current_node.position)
                current_node = current_node.parent
            return path[::-1]  # Return reversed path

        (x, y) = current_node.position
        neighbors = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]  # 4 possible movements

        for next_position in neighbors:
            # Check if within bounds and not a wall
             if (0 <= next_position[0] < len(grid) and
                0 <= next_position[1] < len(grid[0]) and
                grid[next_position[0]][next_position[1]] != 1):  # 0 for walkable
                neighbor_node = Node(next_position, current_node)
                if neighbor_node in closed_list:
                    continue

                neighbor_node.g = current_node.g + 1
                neighbor_node.h = heuristic(neighbor_node.position, end_node.position)
                neighbor_node.f = neighbor_node.g + neighbor_node.h

                if add_to_open(open_list, neighbor_node):
                    heapq.heappush(open_list, (neighbor_node.f, neighbor_node))

    return []  # Return empty list if no path found

def add_to_open(open_list, neighbor_node):
    for node in open_list:
        if neighbor_node == node[1] and neighbor_node.g > node[1].g:
            return False
    return True

def index(request):
    return render(request, 'index.html')

def a_star(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)  # Parse JSON directly from request body
            start = tuple(data['start'])  # Ensure you are parsing correctly
            end = tuple(data['end'])
            grid = data['grid']  # Directly get the grid list
            path = a_star_algorithm(start, end, grid)
            return JsonResponse(path, safe=False)  # Return the path as JSON
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)  # Handle invalid JSON
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)  # Handle other exceptions
