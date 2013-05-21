var gobangTheme = {
	className: "board",
	pieceClassName: "piece",
	layer: 2, // 图层数
	chars: [
		["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o"],
		["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]
	],
	control: { // 控制
		to: { // 目标
			black: { 0: "chess to" },
			white: { 0: "chess to" }
		},
		moveto: {
			black: { 0: "black_moveto" },
			white: { 0: "white_moveto" }
		}
	},
	pieces: {
		stone: { // 兵
			black: { 1: "chess black_stone" },
			white: { 1: "chess white_stone" }
		}
	}
};