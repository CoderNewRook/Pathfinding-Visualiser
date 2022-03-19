import { contains, remove } from './ArrayUtilities'
import { PathfinderNode } from './PathfinderNode';

//export interface IAnimationStep {
//    visitedIndices: number[];
//    unvisitedIndices: number[];
//    pathIndices: number[];
//}

export interface IAnimationStep {
    colorChanges: {
        indices: number[];
        color: string;
    }[];
}

function createColorChanges(changes: { indices: number[]; color: string }[]) {
    return { colorChanges: changes };
}

function colorChange(indices: number[], color: string) {
    return { indices, color };
}

export function dijkstras(nodes: PathfinderNode[][], start: PathfinderNode, target: PathfinderNode): IAnimationStep[] {
    const animations: IAnimationStep[] = [];
    const flatNodes = nodes.flat();
    const unvisited = [...flatNodes];
    const visited = new Array<PathfinderNode>();
    const seen = new Array<PathfinderNode>();
    const maxDist = 10000; // would normally be infinity but not necessary here
    //const dist = nodes.map(col => col.map(n => maxDist));
    //const prev: (PathfinderNode | null)[][] = nodes.map(col => col.map(n => null));

    //const dist = unvisited.map(n => maxDist);
    //const prev: (PathfinderNode | null)[] = unvisited.map(n => null);
    //console.log(nodes[0].length);
    //dist[unvisited.indexOf(start)] = 0;
    //prev[unvisited.indexOf(start)] = null;
    unvisited.forEach(n => { n.dist = maxDist; n.prev = null; });
    start.dist = 0;
    seen.push(start);
    let targetFound = false;
    //let iterations = 1;
    while (unvisited.length > 0) {
        const current = unvisited.reduce((minDistNode, currentNode) => currentNode.dist < minDistNode.dist ? currentNode : minDistNode, unvisited[0]);
        //const current = unvisited[dist.indexOf(Math.min(...dist))];
        //const current2 = unvisited[dist.reduce((minIndex, currentDist, i) => currentDist < dist[minIndex] ? i : minIndex, dist[0])];
        //console.log(contains(unvisited, current));
        remove(unvisited, current);
        visited.push(current);
        //console.log(iterations++);
        //animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited")]));

        if (current === target) {
            targetFound = true;
            break;
        }

        const animIndices = new Array<number>();

        current.neighbours.forEach(n => {
            if (!contains(visited, n)) {
                const newDist = current.dist + n.cost;
                if (newDist < n.dist) {
                    n.dist = newDist;
                    n.prev = current;
                }
                if (!contains(seen, n)) {
                    seen.push(n);
                    animIndices.push(flatNodes.indexOf(n));
                }
            }
        });

        if (animIndices.length > 0) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited"), colorChange(animIndices, "Unvisited")]));
        }
    }
    if (targetFound) {
        let prevNode = target;
        while (prevNode.prev !== null) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
            prevNode = prevNode.prev;
        }
        animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
    }
    return animations;
}

export function astar(nodes: PathfinderNode[][], start: PathfinderNode, target: PathfinderNode): IAnimationStep[] {
    const animations: IAnimationStep[] = [];
    const flatNodes = nodes.flat();
    const unvisited = [...flatNodes];
    const visited = new Array<PathfinderNode>();
    const seen = new Array<PathfinderNode>();
    const maxDist = 10000; // would normally be infinity but not necessary here

    unvisited.forEach(n => { n.dist = maxDist; n.heuristicDist = maxDist; n.prev = null; });

    let targetPos = [0, 0];

    for (let i = 0; i < nodes.length; i++) {
        const col = nodes[i];
        for (let j = 0; j < col.length; j++) {
            if (nodes[i][j] === target) targetPos = [i, j];
        }
    }

    nodes.map((col, i) => col.map((n, j) => n.heuristicDist = distance([i, j], targetPos)));

    start.dist = 0;
    seen.push(start);
    let targetFound = false;

    while (unvisited.length > 0) {
        const current = unvisited.reduce((minDistNode, currentNode) => currentNode.combinedDist() < minDistNode.combinedDist() ? currentNode : minDistNode, unvisited[0]);
        remove(unvisited, current);
        visited.push(current);

        //animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited")]));

        if (current === target) {
            targetFound = true;
            break;
        }

        const animIndices = new Array<number>();

        current.neighbours.forEach(n => {
            if (!contains(visited, n)) {
                const newDist = current.dist + n.cost;
                if (newDist < n.dist) {
                    n.dist = newDist;
                    n.prev = current;
                }
                if (!contains(seen, n)) {
                    seen.push(n);
                    animIndices.push(flatNodes.indexOf(n));
                }
            }
        });

        if (animIndices.length > 0) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited"), colorChange(animIndices, "Unvisited")]));
        }
    }
    if (targetFound) {
        let prevNode = target;
        while (prevNode.prev !== null) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
            prevNode = prevNode.prev;
        }
        animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
    }
    return animations;
}

export function breadthfirstsearch(nodes: PathfinderNode[][], start: PathfinderNode, target: PathfinderNode): IAnimationStep[] {
    const animations: IAnimationStep[] = [];
    const flatNodes = nodes.flat();
    const unvisited = [...flatNodes];
    const visited = new Array<PathfinderNode>();
    const seen = new Array<PathfinderNode>();
    const maxDist = 10000; // would normally be infinity but not necessary here

    unvisited.forEach(n => { n.dist = maxDist; n.heuristicDist = maxDist; n.prev = null; });

    let targetPos = [0, 0];

    for (let i = 0; i < nodes.length; i++) {
        const col = nodes[i];
        for (let j = 0; j < col.length; j++) {
            if (nodes[i][j] === target) targetPos = [i, j];
        }
    }

    nodes.map((col, i) => col.map((n, j) => n.heuristicDist = distance([i, j], targetPos)));

    start.dist = 0;
    seen.push(start);
    let targetFound = false;

    while (unvisited.length > 0) {
        const current = seen[0];
        remove(unvisited, current);
        remove(seen, current);
        visited.push(current);

        //animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited")]));

        if (current === target) {
            targetFound = true;
            break;
        }

        const animIndices = new Array<number>();

        current.neighbours.forEach(n => {
            if (!contains(visited, n)) {
                const newDist = current.dist + n.cost;
                if (newDist < n.dist) {
                    n.dist = newDist;
                    n.prev = current;
                }
                if (!contains(seen, n)) {
                    seen.push(n);
                    animIndices.push(flatNodes.indexOf(n));
                }
            }
        });

        if (animIndices.length > 0) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited"), colorChange(animIndices, "Unvisited")]));
        }
    }
    if (targetFound) {
        let prevNode = target;
        while (prevNode.prev !== null) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
            prevNode = prevNode.prev;
        }
        animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
    }
    return animations;
}

export function bestfirstsearch(nodes: PathfinderNode[][], start: PathfinderNode, target: PathfinderNode): IAnimationStep[] {
    const animations: IAnimationStep[] = [];
    const flatNodes = nodes.flat();
    const unvisited = [...flatNodes];
    const visited = new Array<PathfinderNode>();
    const seen = new Array<PathfinderNode>();
    const maxDist = 10000; // would normally be infinity but not necessary here

    unvisited.forEach(n => { n.dist = maxDist; n.heuristicDist = maxDist; n.prev = null; });

    let targetPos = [0, 0];

    for (let i = 0; i < nodes.length; i++) {
        const col = nodes[i];
        for (let j = 0; j < col.length; j++) {
            if (nodes[i][j] === target) targetPos = [i, j];
        }
    }

    nodes.map((col, i) => col.map((n, j) => n.heuristicDist = distance([i, j], targetPos)));

    start.dist = 0;
    seen.push(start);
    let targetFound = false;

    while (seen.length > 0) {
        const current = seen.reduce((minDistNode, currentNode) => currentNode.heuristicDist < minDistNode.heuristicDist ? currentNode : minDistNode, seen[0]);
        remove(seen, current);
        visited.push(current);

        //animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited")]));

        if (current === target) {
            targetFound = true;
            break;
        }

        const animIndices = new Array<number>();

        current.neighbours.forEach(n => {
            if (!contains(visited, n)) {
                const newDist = current.dist + n.cost;
                if (newDist < n.dist) {
                    n.dist = newDist;
                    n.prev = current;
                }
                if (!contains(seen, n)) {
                    seen.push(n);
                    animIndices.push(flatNodes.indexOf(n));
                }
            }
        });

        if (animIndices.length > 0) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(current)], "Visited"), colorChange(animIndices, "Unvisited")]));
        }
    }
    if (targetFound) {
        let prevNode = target;
        while (prevNode.prev !== null) {
            animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
            prevNode = prevNode.prev;
        }
        animations.push(createColorChanges([colorChange([flatNodes.indexOf(prevNode)], "Path")]));
    }
    return animations;
}

function distance(pos1: number[], pos2: number[]) {
    if (pos1.length !== 2 || pos2.length !== 2) return 10000;
    //if (pos1.length !== pos2.length) return;
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
    //return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}

function accessArrayAs2D<T>(arr: T[], sizeY: number, i: number, j: number) {
    return arr[i * sizeY + j];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function repeatCallback(callback: () => void, repeat: number) {
    for (let i = 0; i < repeat; i++) {
        callback();
    }
}