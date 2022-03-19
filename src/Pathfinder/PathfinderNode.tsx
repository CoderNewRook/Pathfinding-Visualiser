
export class PathfinderNode {
    neighbours: PathfinderNode[];
    wall: boolean;
    dist: number;
    heuristicDist: number;
    prev: PathfinderNode | null;
    cost = 1;

    constructor() {
        this.neighbours = [];
        this.wall = false;
        this.dist = 0;
        this.heuristicDist = 0;
        this.prev = null;
    }

    becomeWall(b: boolean) {
        this.wall = b;
    }

    addNeighbour(neighbour: PathfinderNode) {
        this.neighbours.push(neighbour);
    }

    clearNeighbours() {
        this.neighbours = [];
    }

    combinedDist() {
        return this.dist + this.heuristicDist;
    }
}