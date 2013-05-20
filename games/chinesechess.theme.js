var chineseChessTheme = {
	className: "board",
	pieceClassName: "piece",
	layer: 3, // 图层数
	chars: [
		["a", "b", "c", "d", "e", "f", "g", "h", "i"],
		["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
	],
	control: { // 控制
		selected: { // 已选
			black: { 0: 'chess selected' },
			red: { 0: 'chess selected' }
		},
		activity: { // 激活
			black: { 0: "activity" },
			red: { 0: "activity" }
		},
		killer: { // 吃掉
			black: { 0: "killer" },
			red: { 0: "killer" }
		},
		moveto: { // 移动
			black: { 0: "moveto" },
			red: { 0: "moveto" }
		},
		warning: { // 警告
			black: { 2: "chess warning" },
			red: { 2: "chess warning" }
		},
		from: { // 来源
			black: { 0: "chess from" },
			red: { 0: "chess from" }
		},
		to: { // 目标
			black: { 0: "chess to" },
			red: { 0: "chess to" }
		}
	},
	pieces: {
		soldier: { // 兵
			black: { 1: "chess black_soldier" },
			red: { 1: "chess red_soldier" }
		},
		soldier_shield: { // 铁兵
			black: { 1: "chess black_soldier", 2: "chess shield" },
			red: { 1: "chess red_soldier", 2: "chess shield" }
		},
		horse: { // 马
			black: { 1: "chess black_horse" },
			red: { 1: "chess red_horse" }
		},
		horse_shield: { // 铁马
			black: { 1: "chess black_horse", 2: "chess shield" },
			red: { 1: "chess red_horse", 2: "chess shield" }
		},
		elephant: { // 象
			black: { 1: "chess black_elephant" },
			red: { 1: "chess red_elephant" }
		},
		chariot: { // 車
			black: { 1: "chess black_chariot" },
			red: { 1: "chess red_chariot" }
		},
		mandarin: { // 士
			black: { 1: "chess black_mandarin" },
			red: { 1: "chess red_mandarin" }
		},
		cannon: { // 炮
			black: { 1: "chess black_cannon" },
			red: { 1: "chess red_cannon" }
		},
		cannon_shield: { // 铁炮
			black: { 1: "chess black_cannon", 2: "chess shield" },
			red: { 1: "chess red_cannon", 2: "chess shield" }
		},
		general: { // 将帅
			black: { 1: "chess black_general" },
			red: { 1: "chess red_general" }
		},
		tiger: { // 旗虎
			black: { 1: "chess black_tiger" },
			red: { 1: "chess red_tiger" }
		},
		rock: { // 铁石
			black: { 1: "chess black_rock" },
			red: { 1: "chess red_rock" }
		},
		elephant_sleep: { // 升变象
			black: { 1: "chess black_elephant", 2: "chess sleep" },
			red: { 1: "chess red_elephant", 2: "chess sleep" }
		},
		mandarin_sleep: { // 升变士
			black: { 1: "chess black_mandarin", 2: "chess sleep" },
			red: { 1: "chess red_mandarin", 2: "chess sleep" }
		}
	}
};