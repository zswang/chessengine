var chineseChessRules = {
	title: '中国象棋', // 标题
	version: 1, // 版本
	author: '王集鹄', // 作者
	players: ['red', 'black'], // 玩家类型
	turnOrder: ['red', 'black'], // 执棋顺序
	checkmated: true, // 不能送将
	directions: { // 方向
		"n": [0, -1],
		"e": [1, 0],
		"s": [0, 1],
		"w": [-1, 0],
		"ne": [1, -1],
		"nw": [-1, -1],
		"se": [1, 1],
		"sw": [-1, 1]
	},
	symmetry: { 
		points: { // 对称坐标
			black: function(point){
				return [
					9 - point[0] - 1,
					10 - point[1] - 1
				];
			}
		},
		directions: { // 对称方向
			black: {
				"n": "s",
				"s": "n",
				"w": "e",
				"e": "w",
				"nw": "se",
				"sw": "ne",
				"ne": "sw",
				"se": "nw"
			}
		}
	},
	zones: { // 区域
		fortress: { // 王宫
			red: [3, 7, 3, 3],
			black: 'red' // [3, 0, 3, 3]
		},
		myside: { // 本国国土
			red: [0, 5, 9, 5],
			black: 'red' // [0, 0, 9, 5]
		},
		bottom: { // 底部
			red: [0, 9, 9, 1],
			black: 'red' // [0, 0, 9, 1],
		}
	},
	pieces: { // 棋子类型
		soldier: { // 兵|卒
			names: {
				red: '兵',
				black: '卒'
			},
			moves: [{
				direction: ['n'], // 移动方向
				verify: [{ // 检测
					friend: '!' // 非盟军
				}]
			},
			{
				zone: '!myside', // 非自己的国土
				direction: ['e', 'w'], // 移动方向
				verify: [{
					friend: '!' // 非盟军
				}]
			}]
		},
		chariot: { // 車
			names: {
				red: '俥',
				black: '車'
			},
			moves: [{
				direction: [["n", "n"], ["e", "e"], ["w", "w"], ["s", "s"]],
				verify: [{
					more: '*',
					empty: '=',
					berth: true
				}, {
					friend: '!'
				}]
			}]
		},
		horse: {
			names: {
				red: '傌',
				black: '马'
			},
			moves: [{
				direction: [
					["n", "ne"], ["n", "nw"], ["s", "sw"], ["s", "se"],
					["e", "ne"], ["e", "se"], ["w", "nw"], ["w", "sw"]
				],
				verify: [{
					empty: '='
				}, {
					friend: '!'
				}]
			}]
		},
		elephant: {
			names: {
				red: '相',
				black: '象'
			},
			moves: [{
				direction: [
					["ne", "ne"], ["se", "se"], ["nw", "nw"], ["sw", "sw"]
				],
				verify: [{
					empty: '='
				}, {
					zone: 'myside',
					friend: '!'
				}]
			}]
		},
		mandarin: {
			names: {
				red: '仕',
				black: '士'
			},
			moves: [{
				direction: ["ne", "se", "nw", "sw"],
				verify: {
					zone: 'fortress', // 王宫中
					friend: '!'
				}
			}]
		},
		cannon: {
			names: {
				red: '炮',
				black: '包'
			},
			moves: [{
				direction: ["n", "e", "w", "s"],
				verify: {
					more: '+',
					empty: '='
				}
			}, {
				direction: [
					["n", "n", "n", "n"], 
					["e", "e", "e", "e"], 
					["w", "w", "w", "w"], 
					["s", "s", "s", "s"]
				],
				verify: [{
					more: '*',
					empty: '='
				}, {
					empty: '!'
				}, {
					more: '*',
					empty: '='
				}, {
					empty: '!',
					friend: '!'
				}]
			}]
		},
		general: {
			names: {
				red: '帅',
				black: '将'
			},
			warning: true, // 关键棋子
			moves: [{
				direction: [["n", "n"]],
				verify: [{
					more: '*',
					empty: '='
				}, {
					pieces: 'general', // 见面
					friend: '!'
				}]
			}, {
				direction: ["n", "e", "w", "s"],
				verify: {
					zone: 'fortress', // 王宫中
					friend: '!'
				}
			}]
		},
		tiger: { // 旗虎
			names: {
				red: '旗',
				black: '虎'
			},
			moves: ['chariot', 'horse', 'cannon']
		},
		rock: { // 铁石
			names: {
				red: '铁',
				black: '石'
			},
			shield: true // 盾牌
		},
		horse_shield: { // 铁马
			shield: true, // 盾牌
			moves: "horse",
			upgrade: { // 升变
				move: 'horse'
			}
		},
		cannon_shield: { // 铁炮
			shield: true, // 盾牌
			moves: "cannon",
			upgrade: { // 升变
				move: 'cannon'
			}
		},
		soldier_shield: { // 铁兵
			shield: true, // 盾牌
			moves: "soldier",
			upgrade: { // 升变
				move: 'soldier'
			}
		},
		elephant_sleep: { // 升变象
			moves: "elephant",
			sleeps: {
				zone: 'bottom'
			},
			upgrade: { // 升变
				sleep: 'soldier'
			}
		},
		mandarin_sleep: { // 升变士
			moves: "mandarin",
			sleeps: {
				zone: 'bottom'
			},
			upgrade: { // 升变
				sleep: 'soldier'
			}
		}
	},
	board: { // 棋盘
		grid: [9, 10], // 坐标
		setup: {
			red: {
				soldier: [[0, 6], [2, 6], [4, 6], [6, 6], [8, 6]],
				horse: [[1, 9], [7, 9]],
				elephant_sleep: [[2, 9], [6, 9]],
				chariot: [[0, 9], [8, 9]],
				mandarin: [[3, 9], [5, 9]],
				cannon: [[1, 7], [7, 7]],
				general: [[4, 9]],
				tiger: [[2, 7]]
			},
			black: "red"
		}
	}
};