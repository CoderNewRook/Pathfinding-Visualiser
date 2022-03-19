import React, { ChangeEvent, useState, useEffect } from 'react';
import './App.css';
import * as Pathfinder from './Pathfinders'
import { PathfinderNode } from './PathfinderNode';
import { contains } from './ArrayUtilities';

const baseSize = {x: 10, y: 10}
const minSize = {x: 5, y: 5}
const maxSize = {x: 30, y: 20}
const maxVisualsSize = { x: 90, y: 60 };
const nodeSize = maxVisualsSize.x / maxSize.x;

function App() {
    const [sizeX, setSizeX] = useState(baseSize.x);
    const [sizeY, setSizeY] = useState(baseSize.y);
    const [nodes, setNodes] = useState(() => new Array<PathfinderNode>());
    const [start, setStart] = useState(new PathfinderNode());
    const [target, setTarget] = useState(new PathfinderNode());

    const [animInterval, setAnimInterval] = useState(1000);
    const [animations, setAnimations] = useState(new Array<Pathfinder.IAnimationStep>());
    const [animIDs, setAnimIDs] = useState(new Array<number>());
    const [isAnimPlaying, setIsAnimPlaying] = useState(false);

    const [colors, setColors] = useState(new Array<string>());
    const [pathfinderIndex, setPathfinderIndex] = useState(0);
    const [drawerIndex, setDrawerIndex] = useState(0);

    const [isDrawing, setIsDrawing] = useState(false);
    const [wallDraw, setWallDraw] = useState(false);

    useEffect(() => {
        // run base alg on nodes pathfind(nodes or baseNodes, pathfindAlg)
        //setupNodes(sizeX, sizeY);
        generateNodes(sizeX, sizeY);
    }, []);

    //const setupNodes = () => {
    //    const newNodes = new Array<PathfinderNode[]>();
    //    for (let i = 0; i < sizeX; i++) {
    //        const column = new Array<PathfinderNode>();
    //        for (let j = 0; j < sizeY; j++) {
    //            column.push(new PathfinderNode());
    //        }
    //        newNodes.push(column);
    //    }
    //};

    const setupNodes = (x: number, y: number) => {
        const newNodes = new Array<PathfinderNode>();
        const keptNodes = { startNode: false, targetNode: false};
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                const newNode = new PathfinderNode();
                newNode.becomeWall(nodes2D(i, j)?.wall ?? false);
                if (nodes2D(i, j) === start) { setStart(newNode); keptNodes.startNode = true; }
                if (nodes2D(i, j) === target) { setTarget(newNode); keptNodes.targetNode = true; }
                newNodes.push(newNode);
            }
        }
        if (!keptNodes.startNode) setStart(newNodes[0]);
        if (!keptNodes.targetNode) setTarget(newNodes[x * y - 1]);
        setNodes(newNodes);
        resetColors(x, y);
        return newNodes;
    };

    const nodes2D = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= sizeX || y >= sizeY) return null;
        return nodes[x * sizeY + y];
    };

    //const accessArrAs2D = (arr: PathfinderNode[], ) => {

    //}

    //const nodes2DIndexOf = (arr: PathfinderNode[], x: number, y: number, obj: PathfinderNode) => {
        
    //};

    const resetGrid = () => {
        stopAnimation(true);
        nodes.forEach(n => { n.becomeWall(false); n.clearNeighbours(); });
    }

    const assignNeighbours = () => {
        nodes.forEach(n => { n.clearNeighbours(); });
        //const neighbourDelta = [[-1, 0], [0, -1], [1, 0], [0, 1]];
        const neighbourDelta = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, 1], [-1, -1], [1, 1], [1, -1]];
        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                const currentNode = nodes2D(i, j);
                neighbourDelta.forEach(delta => {
                    const possibleNode = nodes2D(i + delta[0], j + delta[1]);
                    if (possibleNode && !possibleNode.wall) currentNode?.addNeighbour(possibleNode);
                });
                //if (i > 0) {
                //    currentNode.addNeighbour(nodes2D(i - 1, j));
                //}
                //if (j > 0) {
                //    currentNode.addNeighbour(nodes2D(i, j - 1));
                //}
                //if (i < sizeX - 1) {
                //    currentNode.addNeighbour(nodes2D(i + 1, j));
                //}
                //if (j < sizeY - 1) {
                //    currentNode.addNeighbour(nodes2D(i, j + 1));
                //}

            }
        }
        //nodes.forEach(n => { console.log(n.neighbours);});
    };

    function generateNodes(x: number, y: number) {
        stopAnimation(false);
        const newNodes = setupNodes(x, y);
        //pathfind(newNodes, pathfinderButtonData[pathfinderIndex].pathfinderAlg, { x, y });
    }

    function playAnimation() {
        if (animIDs.length > 0) {
            stopAnimation(true);
        }
        else {
            const newColors = resetColors(sizeX, sizeY);
            const newAnimations = pathfind(nodes, pathfinderButtonData[pathfinderIndex].pathfinderAlg, { x: sizeX, y: sizeY });
            setIsAnimPlaying(true);
            //nextStep(colors, anims);
            nextStep(newColors, newAnimations.anims, newAnimations.interval);
        }
    }

    function stopAnimation(reset: boolean) {
        animIDs.forEach(id => clearTimeout(id));
        setAnimIDs([]);
        setIsAnimPlaying(false);
        if (reset) resetColors(sizeX, sizeY);
    }

    function resetColors(x: number, y: number) {
        const colors = Array<string>(x * y).fill("");
        setColors(colors);
        return colors;
    }

    function pathfind(grid: PathfinderNode[], pathfinder: (nodes: PathfinderNode[][], start: PathfinderNode, target: PathfinderNode) => Pathfinder.IAnimationStep[], gridSize: { x: number, y: number }) {
        stopAnimation(true);
        assignNeighbours();
        //const grid2D = new Array<PathfinderNode[]>(gridSize.x).fill([]).map(col => new Array());
        const grid2D = new Array<PathfinderNode[]>();
        for (let i = 0; i < gridSize.x; i++) {
            grid2D.push([]);
        }
        //console.log(grid.length);
        //console.log(gridSize);
        //console.log(grid2D);
        grid.forEach((n, i) => {
            //console.log(grid2D[Math.floor(i / gridSize.y)]);
            grid2D[Math.floor(i / gridSize.y)].push(n);
        });
        //console.log(grid2D);
        const newAnimations = pathfinder(grid2D, start, target);
        setAnimations(newAnimations);
        let newPathfindIndex = 0;
        for (let i = 0; i < pathfinderButtonData.length; i++) {
            if (pathfinderButtonData[i].pathfinderAlg === pathfinder) {
                newPathfindIndex = i;
                break;
            }
        }
        const newInterval = updateAnimInterval(gridSize, newPathfindIndex);
        return { anims: newAnimations, interval: newInterval };
    }

    function animationStep(currentColors: string[], anims: Pathfinder.IAnimationStep[], interval: number) {
        const step = anims[0];
        if (!step) {
            stopAnimation(false);
            return;
        }
        const nextColors = [...currentColors];
        //console.log(anims.length);
        //step.visitedIndices.forEach(i => nextColors[i] = "Visited");
        //step.unvisitedIndices.forEach(i => nextColors[i] = " Unvisited");
        //step.pathIndices.forEach(i => nextColors[i] = "Path");
        //step.indices.forEach(i => nextColors[i] = step.color);
        step.colorChanges.forEach(colorChange => colorChange.indices.forEach(i => nextColors[i] = colorChange.color));
        setColors(nextColors);
        if (anims.length > 0) {
            nextStep(nextColors, anims.slice(1), interval);
        }
    }

    function nextStep(currentColors: string[], anims: Pathfinder.IAnimationStep[], interval: number) {
        //const id = window.setTimeout(animationStep, animationDelay(animInterval), currentArr, anims);
        const id = window.setTimeout(animationStep, interval, currentColors, anims, interval);
        setAnimIDs([...animIDs, id]);
    }

    function updateSizeX(e: ChangeEvent<HTMLInputElement>) {
        const newSize = parseInt(e.target.value);
        setSizeX(newSize);
        //updateAnimInterval({ x: newSize, y: sizeY}, pathfinderIndex);
        generateNodes(newSize, sizeY);
    }

    function updateSizeY(e: ChangeEvent<HTMLInputElement>) {
        const newSize = parseInt(e.target.value);
        setSizeY(newSize);
        //updateAnimInterval({ x: sizeX, y: newSize }, pathfinderIndex);
        generateNodes(sizeX, newSize);
    }

    function updateAnimInterval(gridSize: { x: number, y: number }, pathfinderIndex: number) {
        //const newInterval = 1000 / 20 / pathfinderButtonData[pathfinderIndex].speed;
        const newInterval = calculateInterval(20, gridSize, pathfinderButtonData[pathfinderIndex].speed);
        setAnimInterval(newInterval);
        return newInterval;
    }

    function calculateInterval(baseDivider: number, gridSize: { x: number, y: number }, pathfinderSpeed: number) {
        const min = pathfinderSpeed;
        const max = 35 / baseDivider;
        const rangeDelta = max - min;
        const gridSizeRange = maxSize.x * maxSize.y - minSize.x * minSize.y;
        const linearFraction = (gridSize.x * gridSize.y) / gridSizeRange;
        const quadraticFraction = linearFraction ** 2;
        const delta = quadraticFraction * rangeDelta;
        let divider = min + delta;
        return 1000 / baseDivider / divider;
    }

    const startDrawing = () => {
        setIsDrawing(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const drawNode = (n: PathfinderNode, singleClick: boolean) => {
        if ((!singleClick && !isDrawing) || isAnimPlaying) return;
        resetColors(sizeX, sizeY);
        paletteData[drawerIndex].drawer(n);
    }

    const drawStartNode = (n: PathfinderNode) => {
        n.wall = false;
        setStart(n);
    }

    const drawTargetNode = (n: PathfinderNode) => {
        n.wall = false;
        setTarget(n);
    }

    const drawWall = (n: PathfinderNode) => {
        if (n === start || n === target) return;
        n.becomeWall(true);
        setWallDraw(!wallDraw);
        //setIsDrawing(true);
    }

    const eraseWall = (n: PathfinderNode) => {
        if (n === start || n === target) return;
        n.becomeWall(false);
        setWallDraw(!wallDraw);
    }

    const paletteData = [
        { drawer: drawStartNode, description: "Start Node" },
        { drawer: drawTargetNode, description: "Target Node" },
        { drawer: drawWall, description: "Wall" },
        { drawer: eraseWall, description: "Erase Wall" },
    ];

    //window.addEventListener("mousedown", startDrawing);
    //window.addEventListener("mouseup", stopDrawing);

    const pathfinderButtonData = [
        { pathfinderAlg: Pathfinder.dijkstras, description: "Dijkstra's", speed: 1 },
        { pathfinderAlg: Pathfinder.astar, description: "A-Star", speed: 1 },
        { pathfinderAlg: Pathfinder.breadthfirstsearch, description: "Breadth First", speed: 1 },
        { pathfinderAlg: Pathfinder.bestfirstsearch, description: "Best First", speed: 1 }
    ];

    const visualsWidth = nodeSize * sizeX;
    const visualsHeight = nodeSize * sizeY;
    //const nodeSize = {
    //    x: visualsWidth / maxSize.x,
    //    y: visualsHeight / maxSize.x
    //};
    //console.log(gap);
    //console.log(barWidth);
    const paletteButtons = paletteData.map((data, i) => <div key={i + "thdrawer"} className={i === drawerIndex ? "PaletteDrawer CurrentPaletteDrawer" : "PaletteDrawer"} onClick={() => { setDrawerIndex(i); }}>{data.description}</div>);
    const pathfindButtons = pathfinderButtonData.map((data, i) => <div key={i + "thpathfinder"} className={i === pathfinderIndex ? "Pathfind CurrentPathfind" : "Pathfind"} onClick={() => { pathfind(nodes, data.pathfinderAlg, { x: sizeX, y: sizeY }); setPathfinderIndex(i); }}>{data.description}</div>);
    const startStop = animIDs.length > 0 ? "Stop" : "Start";
    const startStopClass = animIDs.length > 0 ? "Start Stop" : "Start";
    //const arrDisplay = arr.map((n, i) => <div className="Data" style={{ backgroundColor: colors[i], height: `${n * 3}px`, width: `${30}px`}} key={i + "th"}></div>);
    const nodesDisplay = nodes.map((n, i) => {
        let extraClassName = "";
        let extraInnerDiv = false;
        if (n === start) {
            extraClassName = "StartNode";
            extraInnerDiv = true;
        }
        else if (n === target) {
            extraClassName = "TargetNode";
            extraInnerDiv = true;
        }
        else if (n.wall) {
            extraClassName = "Wall";
        }
        //return < div onClick={() => drawNode(n, true)} onMouseMove={() => drawNode(n, false)} className={"PathfinderNode " + extraClassName} style={{ width: `${nodeSize}vh`, height: `${nodeSize}vh` }} key={i + "th"}>{extraInnerDiv ? <div className={"PathfinderNode " + colors[i]} /> : ""}</div >;
        return < div onClick={() => drawNode(n, true)} onMouseMove={() => drawNode(n, false)} className={`PathfinderNode ${extraClassName} ${colors[i]}`} style={{ width: `${nodeSize}vh`, height: `${nodeSize}vh` }} key={i + "th"}></div >;
        //return < div onMouseMove={() => drawNode(n)} className={"PathfinderNode " + extraClassName} key={i + "th"}>{extraInnerDiv ? <div className={"PathfinderNode " + colors[i]} /> : ""}</div >;
    });
    return (
        <div id="Pathfinder" onMouseDown={startDrawing} onMouseUp={stopDrawing}>
            <div id="ButtonToolbar">
                <div className={startStopClass} onClick={playAnimation}>{startStop}</div>
                <div className="ResetGrid" onClick={resetGrid}>Reset Grid</div>
                <div id="NodePalette">
                    {paletteButtons}
                </div>
                {pathfindButtons}
                <div className="SizeSpeedContainer">
                    <div className="LabelSlider">
                        <label htmlFor="SizeSpeedX">Columns</label>
                        <input onChange={updateSizeX} id="SizeSpeedX" type="range" min={minSize.x} max={maxSize.x} value={sizeX} />
                    </div>
                    <div className="LabelSlider">
                        <label htmlFor="SizeSpeedY">Rows</label>
                        <input onChange={updateSizeY} id="SizeSpeedY" type="range" min={minSize.y} max={maxSize.y} value={sizeY} />
                    </div>
                </div>
            </div>
            <div id="NodesContainer" style={{ width: `${visualsWidth}vh`, height: `${visualsHeight}vh` }}>
                {nodesDisplay}
            </div>
        </div>
    );
}

export default App;
