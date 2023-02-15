const menu_container = document.getElementById("menu_container");
const action_container = document.getElementById("action_container");
const puzzle_container = document.getElementById("puzzle_container");
const levels = document.querySelectorAll("#levels div");
const win_message = document.getElementById("win_message");

//////////////////////////////////
var ROW = 4; //how many rows
var COLM = 4; //how many colomns
var COUNT; //cols*rows
var all_blocks; //the html elements with className="puzzle_block"
let BLOCK_WIDTH;
var emptyBlockCoords = [ROW - 1, ROW - 1]; //the coordinates of the empty block
var indexes = []; //keeps track of the order of the blocks

//////////////////////////////////
//add listener to all level options
levels.forEach((div) => {
	div.addEventListener("click", selectLevel);
});
function selectLevel() {
	//remove active on all other options
	levels.forEach((div) => {
		div.classList.remove("active");
	});
	this.classList.add("active");
	let amount = this.innerText.charAt(0);
	// console.log(amount);
	ROW = COLM = amount;
}

/////
function startGame() {
	resetAll();
	//now display board and secondary menu ,remove level menu
	menu_container.classList.remove("show");
	action_container.classList.add("show");
	setTimeout(() => {
		puzzle_container.classList.remove("blur");
	}, 600);
	initializeGame();
}

function resetAll() {
	//show menu
	menu_container.classList.add("show");
	///remove show if have by secondary actions
	action_container.classList.remove("show");
	//make blur on board as game does not started
	puzzle_container.classList.add("blur");
	//remove prev win message
	win_message.classList.remove("show");
	///////
	COUNT = ROW * COLM;
	puzzle_container.innerHTML = "";
	indexes = [];
	emptyBlockCoords = [ROW - 1, ROW - 1];
	BLOCK_WIDTH = Math.floor(puzzle_container.clientHeight / COLM);
	puzzle_container.style.width = BLOCK_WIDTH * COLM + "px";
	puzzle_container.style.height = BLOCK_WIDTH * COLM + "px";
}
function reStart() {
	resetAll();
	menu_container.classList.remove("show");
	action_container.classList.add("show");
	puzzle_container.classList.add("blur");
	initializeGame();
	setTimeout(() => {
		puzzle_container.classList.remove("blur");
	}, 600);
}
function openMenu() {
	resetAll();
}

function initializeGame() {
	// console.log(blockWidth);
	///create required blocks on board
	for (let y = 0; y < ROW; y++) {
		for (let x = 0; x < COLM; x++) {
			let blockIdx = x + y * COLM;
			// console.log(blockIdx);
			indexes.push(blockIdx);
			//put till second-last block if its last break to make empty
			if (blockIdx > COUNT - 2) {
				// console.log(x, y, blockIdx);
				// console.log(blockIdx);
				break;
			}

			let newBlock = document.createElement("div");
			newBlock.classList.add("puzzle_block");
			newBlock.innerText = blockIdx + 1;
			newBlock.style.width = BLOCK_WIDTH + "px";
			newBlock.style.height = BLOCK_WIDTH + "px";
			newBlock.style.lineHeight = BLOCK_WIDTH + "px";
			newBlock.style.fontSize = (BLOCK_WIDTH * 55) / 100 + "px";

			puzzle_container.appendChild(newBlock);

			//put the index in array this array is to track which block is where in js
		}
	}
	//grab the all blocks in board
	all_blocks = document.getElementsByClassName("puzzle_block");
	//get width of block to do calc
	// BLOCK_WIDTH  = all_blocks[0].clientWidth;
	// thire is 1 or 2px diff in width and clent width
	// console.log(BLOCK_WIDTH, CLIENT_WIDTH);
	// console.log(indexes);
	//position each block in its proper position(first in correct order)
	//beacuse for shuffling they have to at valid places
	for (let y = 0; y < ROW; y++) {
		for (let x = 0; x < COLM; x++) {
			let blockIdx = x + y * COLM;

			if (blockIdx > COUNT - 2) {
				break;
			}

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
	// console.log(indexes);
}

function positionBlockAtCoord(blockIdx, x, y) {
	//get block from list by its index
	let block = all_blocks[blockIdx];
	// console.log(block);
	//position the block at a certain coordinates
	//set its left and top in position absolute co-ords
	// console.log(x * CLIENT_WIDTH + "px", y * CLIENT_WIDTH + "px");
	block.style.left = x * BLOCK_WIDTH + "px";
	block.style.top = y * BLOCK_WIDTH + "px";
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
		//return true as say block is moved succesfully now check is it solved
		return true;
	}
	return false;
}
function isMovable(block) {
	//return the block coordinates if he can move else return null

	//get row and colm by its actual position in DOM
	///we can use Attribute on blocks to store its x and y but we use this
	let blockPos = [parseInt(block.style.left), parseInt(block.style.top)];
	let blockCoords = [
		Math.floor(blockPos[0] / BLOCK_WIDTH),
		Math.floor(blockPos[1] / BLOCK_WIDTH),
	];
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
		//the blx 56yjock is moved alwasys check is it solved now or not
		if (checkPuzzleSolved()) {
			setTimeout(() => {
				win_message.classList.remove("show");
			}, 700);
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
