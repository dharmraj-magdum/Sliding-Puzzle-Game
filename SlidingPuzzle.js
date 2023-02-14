const puzzle_container = document.getElementById("puzzle_container");
var difficulty = 1; //difficulty based on GameDifficulty array
const ROW = 4; //how many rows
const COLM = 4; //how many colomns
var COUNT; //cols*rows
var all_blocks; //the html elements with className="puzzle_block"
var CLIENT_WIDTH;
var emptyBlockCoords = [ROW - 1, ROW - 1]; //the coordinates of the empty block
var indexes = []; //keeps track of the order of the blocks

function initializeGame() {
	COUNT = ROW * COLM;
	puzzle_container.innerHTML = "";
	let blockWidth = Math.floor(puzzle_container.clientWidth / COLM);
	puzzle_container.style.width = blockWidth * COLM + "px";
	puzzle_container.style.height = blockWidth * COLM + "px";
	// console.log(blockWidth);
	///create required blocks on board
	for (let y = 0; y < ROW; y++) {
		for (let x = 0; x < COLM; x++) {
			let newBlock = document.createElement("div");
			newBlock.classList.add("puzzle_block");
			let blockIdx = x + y * COLM;
			newBlock.innerText = blockIdx + 1;
			newBlock.style.width = blockWidth + "px";
			newBlock.style.height = blockWidth + "px";
			newBlock.style.lineHeight = blockWidth + "px";
			newBlock.style.fontSize = (blockWidth * 55) / 100 + "px";

			indexes.push(blockIdx);
			// console.log(blockIdx);
			//put till second-last block if its last break to make empty
			if (blockIdx >= COUNT - 1) break;

			puzzle_container.appendChild(newBlock);

			//put the index in array this array is to track which block is where in js
		}
	}
	//grab the all blocks in board
	all_blocks = document.getElementsByClassName("puzzle_block");
	//get width of block to do calc
	CLIENT_WIDTH = all_blocks[0].clientWidth;

	// console.log(indexes);
	//position each block in its proper position(first in correct order)
	//beacuse for shuffling they have to at valid places
	for (let y = 0; y < ROW; y++) {
		for (let x = 0; x < COLM; x++) {
			let blockIdx = x + y * COLM;

			if (blockIdx >= COUNT - 1) break;

			//now position that block to its positin on plane/board
			positionBlockAtCoord(blockIdx, x, y);

			//add listener to all blocks
			all_blocks[blockIdx].addEventListener("click", (e) =>
				onClickOnBlock(blockIdx)
			);
		}
	}

	//suffle board
	randomize();
}

initializeGame();

function positionBlockAtCoord(blockIdx, x, y) {
	//get block from list by its index
	let block = all_blocks[blockIdx];
	// console.log(block);
	//position the block at a certain coordinates
	//set its left and top in position absolute co-ords
	block.style.left = x * CLIENT_WIDTH + "px";
	block.style.top = y * CLIENT_WIDTH + "px";
}

function randomize() {
	//move a random block (N times)
	for (let i = 0; i < COUNT * 6; i++) {
		let randomBlockIdx = Math.floor(Math.random() * (COUNT - 1));
		let moved = moveBlock(randomBlockIdx);
		if (!moved) i--;
	}
}

function moveBlock(blockIdx) {
	//moves a block and return true if the block has moved
	let block = all_blocks[blockIdx];
	let blockCoords = isMovable(block);
	if (blockCoords != null) {
		//if movable then position current block to empty's place
		positionBlockAtCoord(
			blockIdx,
			emptyBlockCoords[0],
			emptyBlockCoords[1]
		);
		//mention the changes in index array which is IMP
		let idxOfEmpty = emptyBlockCoords[0] + emptyBlockCoords[1] * COLM;
		let idxOfCurrent = blockCoords[0] + blockCoords[1] * COLM;
		//put curent in empty'c place in logical array
		indexes[idxOfEmpty] = indexes[idxOfCurrent];
		//now just store/set emtyblock's new co-ords
		// (they not used in dom, they are just to check position)
		emptyBlockCoords[0] = blockCoords[0];
		emptyBlockCoords[1] = blockCoords[1];
		return true;
	}
	return false;
}
function isMovable(block) {
	//return the block coordinates if he can move else return null

	//get row and colm by its actual position in DOM
	///we can use Attribute on blocks to store its x and y but we use this
	let blockPos = [parseInt(block.style.left), parseInt(block.style.top)];
	let blockCoords = [blockPos[0] / CLIENT_WIDTH, blockPos[1] / CLIENT_WIDTH];
	// dif=[Xdiff,Ydiff]=[x1-x2,y1-y1]
	let diff = [
		Math.abs(blockCoords[0] - emptyBlockCoords[0]),
		Math.abs(blockCoords[1] - emptyBlockCoords[1]),
	];
	//can be moved if row or colm diff should be 1 that is adjucent
	let canMove =
		(diff[0] == 1 && diff[1] == 0) || (diff[0] == 0 && diff[1] == 1);
	if (canMove) return blockCoords;
	else return null;
}

function onClickOnBlock(blockIdx) {
	if (moveBlock(blockIdx)) {
		//the block is moved alwasys check is it solved now or not
		if (checkPuzzleSolved()) {
			setTimeout(() => alert("Puzzle Solved!!"), 600);
		}
	}
}

function checkPuzzleSolved() {
	//return if puzzle was solved
	let idxOfEmpty = emptyBlockCoords[0] + emptyBlockCoords[1] * COLM;
	// ==>colm+row*totalColmns==>curr index
	for (let i = 0; i < indexes.length; i++) {
		//console.log(indexes[i],i);
		if (i == idxOfEmpty) {
			//if this is blank/empty block do nothing(as its neither gona be wrong/correct)
			continue;
		}
		//if value at array is not corresponde to i(sorted) then is wrong
		if (indexes[i] != i) return false;
	}
	return true;
}

////----------------------------
