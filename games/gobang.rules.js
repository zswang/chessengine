var gobangRules = {
	title: '五子棋', // 标题
	version: 1, // 版本
	author: '王集鹄', // 作者
	players: ['black', 'white'], // 玩家类型
	turnOrder: ['black', 'white'], // 执棋顺序
    drop: true,
	symmetry: { 
		points: { // 对称坐标
			white: function(point, grid){
				return [
					grid[0] - point[0] - 1,
					grid[1] - point[1] - 1
				];
			}
		}
	},
	zones: { // 区域
		tengen: { // 天元
			red: [7, 7, 1, 1]
		}
	},
	pieces: { // 棋子类型
		stone: { // 兵|卒
			names: {
				black: '●',
				white: '○'
			},
			drops: {
                empty: '='
            }
		}
	},
	board: { // 棋盘
		grid: [15, 15] // 坐标
	}
};