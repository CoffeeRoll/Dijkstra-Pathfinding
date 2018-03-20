/// Creates an N-dimentioanl array with the provided lengths
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) {
            arr[length-1 - i] = createArray.apply(this, args); //recurse
        }
    }

    return arr;
}

///A class implementing a directed graph
class Graph {    
    constructor(size) {
        this._nodes = new Array(size);
        this._edges = new Array(size);
        this._openNodes = new Array(size);
        this._NULL_EDGE = -1;
        this._numNodes = 0;
        this._MAX_NODES = size;
        
        //Default alll edges to unconnected
        for (let y = 0; y < this._edges.length; y++) {
            this._edges[y] = new Array(size);
            for (let x = 0; x < this._edges[y].length; x++) {
                this._edges[y][x] = this._NULL_EDGE;
            }
            this._openNodes[y] = false;
            this._nodes[y] = this._NULL_EDGE;
        } 
    }

    ///Returns the index that the provided value is at in the array of nodes (-1 if not found)
    _getIndex(name) {
        for (var i = 0; i < this._nodes.length; i++) {
            if (name == this._nodes[i]) { return i; }
        }
        return -1;
    }

    ///Determines if the Graph is full
    IsFull() {
        let test = (this._numNodes == this._MAX_NODES);
        //console.log("IsFull: " + test);
        return test;
    }

    ///returns the index of the first empty node (-1 if full)
    _getNextIndex() {
        if(this.IsFull()) { return -1; }

        for (let i = 0; i < this._openNodes.length; i++) {
            if (this._openNodes[i] == false) { 
                //console.log("_getNextIndex: " + i);
                return i; 
            }
        }
    }
    
    ///Adds a node to the graph with the provided name and returns true if it succeeded
    AddNode(name) {
        if(!this.IsFull()){
            let tmp = this._getNextIndex();
            this._nodes[tmp] = name;
            this._openNodes[tmp] = true;
            this._numNodes++;
            //console.log("AddNode: " + name + " added at index " + tmp);
            return true;
        }
        return false;
    }

    ///Removes a node from the Graph and returns true if the node was found and removed
    RemoveNode(name) {
        var index = this._getIndex(name);

        if (index != -1) {
            for (var i = 0; i < index; i++)
            {
                this._edges[index][i] = this.NULL_EDGE;
                this._edges[i][index] = this.NULL_EDGE;
            }
            this._numNodes--;

            this._openNodes[index] = false;

            return true;
        }

        return false;
    }

    ///Adds an edge between two nodes with a given weight
    AddEdge(startNode, endNode, weight) {
        var fromIndex = this._getIndex(startNode);
        var toIndex = this._getIndex(endNode);

        this._edges[fromIndex][toIndex] = weight;
    }

    ///Returns the weight between two nodes
    GetEdgeWeight(startNode, endNode) {
        var fromIndex = this._getIndex(startNode);
        var toIndex = this._getIndex(endNode);

        return this._edges[fromIndex][toIndex];
    }
    
    ///Prints edge matrix data to the colsole
    PrintEdgeMatrix() {
        let mtrx = "";
        for (let y = 0; y < this._edges.length; y++) {
            for (let x = 0; x < this._edges[y].length; x++) {
                mtrx += this._edges[y][x] + " ";
            }
            mtrx += '\n';
        }
        console.log(mtrx);
    }
    
    ///Prints the data from getMST to the console
    _printMSTData(data) {
        let text = "";
        
        text += "Name\tPrevious\tWeight\n";
        
        for (let i = 0; i < data.length; i++) {
            text += data[i][0] + "\t\t";
            text += data[i][1] + "\t\t\t";
            text += data[i][2];
            text += '\n';
        }
        console.log(text);
    }
    
    ///Utility function used by getMST
    _minDistance(dist, mstSet) {
        let min = Infinity;
        let minIndex = 0;
        
        for (let v = 0; v < this._MAX_NODES; v++) {
            if (mstSet[v] == false && dist[v][2] <= min) {
                min = dist[v][2];
                minIndex = v;
            }
        }
        return minIndex;
    }
    
    /**Returns a 2D array where 
    *  [0] is the name of the node
    *  [1] is the path along the MST to the previous node
    *  [2] is the collective weight to get to this node from srcNode
    */
    getMST(srcNode) {
        var data = createArray(this._MAX_NODES, 3);
        var mstSet = new Array(this._MAX_NODES);
        
        for (let i = 0; i < this._MAX_NODES; i++) {
            mstSet[i] = false;                  //No nodes in mst
            data[i][0] = this._nodes[i];        //Node Names
            data[i][1] = srcNode;               //Previous node in tree, default to srcNode
            data[i][2] = Infinity;              //Distance is infinite
        }
        
        data[this._getIndex(srcNode)][2] = 0;   //srcNode to itself is 0
        
        for (let count = 0; count < this._MAX_NODES -1; count++) {
            
            let minNodeIndex = this._minDistance(data, mstSet);
            
            mstSet[minNodeIndex] = true;
            
            for (let v = 0; v < this._MAX_NODES; v++) {
                if (!mstSet[v] && 
                    this._edges[minNodeIndex][v] > 0 && 
                    data[minNodeIndex][2] != Infinity && 
                    data[minNodeIndex][2] + this._edges[minNodeIndex][v] < data[v][2]) {
                    
                    data[v][1] = this._nodes[minNodeIndex];
                    data[v][2] = data[minNodeIndex][2] + this._edges[minNodeIndex][v];
                    
                }
            }
        }
        return data;
    }
}


var width = 25;
var height = 15;

//Array of weights
var grid = createArray(height, width);

//Array or buttons
var buttons = createArray(height, width);

//Graph object
var graph = new Graph(width * height);

var firstButton = -1;
var secondButton = -1;

///Sets up the button values
function setupGridValues() {
    for (var i = 0; i < grid.length; i++) {
        for (var w = 0; w < grid[i].length; w++) {
            grid[i][w] = Math.pow( Math.floor(1 + (Math.random() * 10)), 2); //Random number between 1 and 10 squared
        }
    }
}

///Removes all button_select, button_end, and button_start css classes and adds button_default 
function clearPath() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            buttons[y][x].className = 'button_default';
        }
    }
}

///Sets the css classes for each button along the shortest path
function drawPath() {
    var pathData = graph.getMST(firstButton);
    let index = secondButton;
    let xPos, yPos;
    
    for (let i = 0; i < pathData.length; i++) {
        
        xPos = index % width;
        yPos = Math.floor(index / width);
        
        buttons[yPos][xPos].className = 'button_select';
        
        //If first node
        if (index == pathData[index][1]) { break; }
        
        //update index
        index = pathData[index][1];
    }
    
    let lastButtonXPos = secondButton%width;
    let lastButtonYPos = Math.floor(secondButton/width);
    
    //Change last button css class to button_end
    buttons[lastButtonYPos][lastButtonXPos].className = 'button_end';
    
    //Change first button css class to button_start
    buttons[yPos][xPos].className = 'button_start';
    
}

/// Keeps the most recently clicked buttons to draw a path with
function buttonClick(pos) {
    if (firstButton == -1) {
        firstButton = (pos[1] * width) + pos[0];
    }else if (secondButton == -1) {
        secondButton = (pos[1] * width) + pos[0];
    }else {
        //resetButtons();
        firstButton = secondButton;
        secondButton = (pos[1] * width) + pos[0];
    }
    
    if(firstButton != -1 && secondButton != -1) {
        clearPath();
        drawPath();
    }
}

/// Sets up a button grid with an onclick event to call buttonClick(pos)
function setupButtons() {
    for (var i = 0; i < buttons.length; i++) {
        for (var w = 0; w < buttons[i].length; w++) {
            var tmpBtn = document.createElement("BUTTON");
            tmpBtn.classList.add('button_default');
            tmpBtn.appendChild(document.createTextNode(grid[i][w]));
            
            //closure to keep position data after it changes
            tmpBtn.onclick = (function() {
                var xPos = w;
                var yPos = i;
                
                return function() {
                    buttonClick([xPos, yPos]);
                };
                
            })();
            buttons[i][w] = tmpBtn;
        }
    }
}

//Appends buttons to button grid
function setupHTMLGrid() {
    var asArea = document.getElementById('button_grid');
    setupGridValues();
    setupButtons();
    
    for (var i = 0; i < buttons.length; i++) {
        for (var w = 0; w < buttons[i].length; w++) {
            asArea.appendChild(buttons[i][w]);
        }
        asArea.appendChild(document.createElement("BR"));
    }
    
    
}

function setupGraph() {
    //Add all nodes
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            //Name values increase by 1 from left to right / top to bottom
            graph.AddNode((width * y) + x);
        }
    }
    
    //Add edge connections
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let currentNode = (y * width) + x;
            
            let up = true;
            let down = true;
            let left = true;
            let right = true;
            
            let diag = true; //Sets up diagonal paths
            
            //Checks which connects to make for each node
            if (x == 0) {
                left = false;
            }
            if (y == 0) {
                up = false;
            }
            if (x == width -1) {
                right = false;
            }
            if (y == height -1) {
                down = false;
            }
            
            if (up) { graph.AddEdge(currentNode, currentNode-width, grid[y-1][x]); }
            if (down) { graph.AddEdge(currentNode, currentNode+width, grid[y+1][x]); }
            
            if (diag) {
                if (up && left) { graph.AddEdge(currentNode, currentNode-width-1, grid[y-1][x-1]); }
                if (up && right) { graph.AddEdge(currentNode, currentNode-width +1, grid[y-1][x+1]); }
                if (down && left) { graph.AddEdge(currentNode, currentNode+width-1, grid[y+1][x-1]); }
                if (down && right) { graph.AddEdge(currentNode, currentNode+width+1, grid[y+1][x+1]); }
            }
            if(right) { graph.AddEdge(currentNode, currentNode +1, grid[y][x+1]); }
            if(left) { graph.AddEdge(currentNode, currentNode -1, grid[y][x-1]); }
        }
    }
}

function doFirst() {
    setupHTMLGrid(); //Sets up buttons
    setupGraph(); //Sets up graph with nodes and edges
    let test = graph.getMST(0);
}

window.addEventListener('load', doFirst, false);