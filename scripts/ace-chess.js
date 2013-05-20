var AceChess = typeof exports == 'undefined' ? {} : exports;

void function (exports){
    /**
     * Ace Chess
     * 棋类游戏引擎
     * @author 王集鹄(WangJihu, http://weibo.com/zswang)
     * @version 1.0
     */

    /**
     * 棋类游戏
     * @param{Object} rules 游戏规则
     *   @field{String} title 标题
     *   @field{String} version 版本
     *   @field{String} author 作者
     *   @field{Array[String]} players 玩家类型
     *   @field{Array[String]} turnOrder 执棋顺序
     *   @field{String} checkmated 关键棋子类型
     *   @field{String} directions 方位
     *   @field{Object} symmetry 对称数据
     *      @field{Object} points 对称坐标
     *      @field{Object} directions 对称方向
     *   @field{Object} zones 区域
     *   @field{Object} pieces 棋子类型
     */
    function Chess(rules){
        this.rules = rules;
        this.replay();
    }
    
    /**
     * 移动棋子
     * @param{Array} from 来源坐标
     * @param{Array} to 目标坐标
     */
    Chess.prototype.move = function(from, to){
        var fromItem = this.points[from];
        var toItem = this.points[to];
        if (!fromItem) return;
        var oldFrom = this.from;
        var oldTo = this.to;
        this.points[to] = this.points[from];
        this.points[from] = null;
        var upgrade = this.rules.pieces[fromItem.piece].upgrade;
        if (fromItem && upgrade && upgrade['move']){
            fromItem.piece = upgrade['move'];
        }
        this.step++;
        //emit('move');
    };
    
    /**
     * 空投
     * @param{Array} to 目标坐标
     * @param{String} piece 棋子类型
     */
    Chess.prototype.drop = function(to, piece){
        this.points[to] = {
            piece: piece,
            player: this.getCurrPlayer()
        };
        this.step++;
        //emit('drop');
    };
    
    /**
     * 休眠
     * @param{Array} from 来源坐标
     */
    Chess.prototype.sleep = function(from){
        var fromItem = this.points[from];
        if (!fromItem) return;
        var upgrade = this.rules.pieces[fromItem.piece].upgrade;
        if (fromItem && upgrade && upgrade['sleep']){
            fromItem.piece = upgrade['sleep'];
        }
        this.step++;
        //emit('sleep');
    };

    /**
     * 计算可以移动到的坐标
     * @param{Array} point 坐标
     * @param{Object} movePoints 坐标
     * @param{Boolean} ignoreWarning 是否忽略警告
     * @return{Boolean} 是否可移动
     */
    Chess.prototype.calcMoves = function(point, movePoints, ignoreWarning){
        if (!point || !movePoints) return;
        var result;
        var item = this.points[point];
        if (!item) return;
        var moves = this.rules.pieces[item.piece].moves;
        moves = moves instanceof Array ? moves : [moves];
        for (var i = 0; i < moves.length; i++){
            if (this.calcMove(point, moves[i], movePoints, ignoreWarning)) result = true;
        }
        return result;
    };
    
    /**
     * 计算可以空降的坐标
     * @param{Object} movePoints 坐标
     * @return{Boolean} 是否可移动
     */
    Chess.prototype.calcDrops = function(movePoints){
        if (!movePoints) return;
        var result;
        for (var piece in this.rules.pieces){
            var drops = this.rules.pieces[piece].drops;
            if (!drops) continue;
            for (var i = 0; i < this.rules.board.grid[0]; i++){
                for (var j = 0; j < this.rules.board.grid[1]; j++){
                    var pos = [i, j];
                    var item = this.points[pos];
                    if (drops.empty == '=' && item) continue; // 必须空子
                    if (drops.empty == '!' && !item) continue; // 必须非空
                    if (drops.piece && item && item.piece != item.piece) continue; // 必须某种棋子
                    if (drops.zone && !this.posInZone(item.player, tryPos2, verify[j].zone)) continue; // 指定区域
                    if (drops.friend == "=" && item && this.getCurrPlayer() != item.player) continue; // 必须盟友
                    if (drops.friend == "!" && item && this.getCurrPlayer() == item.player) continue; // 必须非盟友
                    movePoints[pos] = piece;
                    result = true;
                }
            }
        }
        return result;
    };

    /**
     * 计算可以选择的坐标
     * @param{Object} activePoints 可选的子
     * @return{Boolean} 是否可选
     */
    Chess.prototype.calcActive = function(activePoints){
        if (!activePoints) return;
        var result;
        for (var i = 0; i < this.rules.board.grid[1]; i++){
            for (var j = 0; j < this.rules.board.grid[0]; j++){
                var pos = [j, i];
                var item = this.points[pos];
                if (!item || item.player != this.getCurrPlayer()) continue;
                var movePoints = {};
                if (this.calcMoves(pos, movePoints)){
                    activePoints[pos] = movePoints;
                    result = true;
                }
            }
        }
        return result;
    };

    /**
     * 计算可以移动到的坐标
     * @param{Array} point 坐标
     * @param{Array} move 移动的方式列表
     * @param{Object} movePoints 可移动的坐标
     * @param{Boolean} ignoreWarning 是否忽略警告
     * @return{Boolean} 是否可移动
     */
    Chess.prototype.calcMove = function(point, move, movePoints, ignoreWarning){
        var result;
        if (!move) return;
        if (typeof move == 'string'){
            var moves = this.rules.pieces[move].moves;
            moves = moves instanceof Array ? moves : [moves];
            for (var i = 0; i < moves.length; i++){
                if (this.calcMove(point, moves[i], movePoints, ignoreWarning)) result = true;
            }
            return result;
        }
        var item = this.points[point];
        if (!item) return;
        if (move.zone){ // 起步区域判断
            if (!this.posInZone(item.player, point, move.zone)) return;
        }
        for (var i = 0; i < move.direction.length; i++){
            var directions = move.direction[i] instanceof Array ? 
                move.direction[i] : [move.direction[i]];
            var verify = move.verify instanceof Array ? move.verify : [move.verify];
            var tryPos = [point[0], point[1]];
            for (var j = 0; j < directions.length; j++){
                var direction = this.rules.directions[
                    this.symmetryDirection(directions[j], item.player)
                ];
                var found = false;
                while (true){
                    var tryPos2 = [tryPos[0] + direction[0], tryPos[1] + direction[1]];
                    if (tryPos2[0] < 0 || tryPos2[1] < 0 ||
                        tryPos2[0] >= this.rules.board.grid[0] || 
                        tryPos2[1] >= this.rules.board.grid[1]) break; // 越界
                    var tryItem = this.points[tryPos2];
                    if (verify[j]){ // 移动验证
                        if (verify[j].zone){ // 目标区域判断
                            if (!this.posInZone(item.player, tryPos2, verify[j].zone)) break; // 目标区域
                        }
                        if (verify[j].empty){
                            if (verify[j].empty == '=' && tryItem) break; // 必须空
                            if (verify[j].empty == '!' && !tryItem) break; // 必须非空
                        }
                        if (verify[j].pieces){ // 指定棋子类型
                            if (verify[j].pieces != tryItem.pieces) break;
                        }
                        if (verify[j].friend && tryItem){
                            if (verify[j].friend == '=' && tryItem.player != item.player) break; // 必须盟友
                            if (verify[j].friend == '!' && tryItem.player == item.player) break; // 必须非盟友
                        }
                    }
                    tryPos = tryPos2;
                    if ((verify[j] && verify[j].berth) || j == directions.length - 1){ // 最后一步
                        if (tryItem && this.rules.pieces[tryItem.piece].shield) break; // 盾牌
                        // 如果移动这一步，主将是否收到对方威胁
                        if (ignoreWarning || !this.rules.checkmated || !this.checkdanger(point, tryPos2)){
                            result = true;
                            movePoints[tryPos2] = true;
                        }
                    }
                    found = true;
                    if (!verify[j].more || verify[j].more == '?') break; // 没有更多步
                }
                if (!found && verify[j] &&
                    !(verify[j].more == '*' || verify[j].more == '?')) break; // 可以为空
            }
        }
        return result;
    };
    
    /**
     * 预判移动是否危险
     * @param{Array} from 坐标
     * @param{Array} to 移动的方式列表
     * @return{Boolean} 返回是否危险
     */
    Chess.prototype.checkdanger = function(from, to){
        if (!this.rules.checkmated) return;
        var fromItem = this.points[from];
        if (!fromItem) return;
        var result = false;
        var toItem = this.points[to];
        var fromPiece = fromItem.piece;
        
        // 模拟移动
        this.move();
        this.points[to] = this.points[from];
        this.points[from] = null;
        var update = this.rules.pieces[fromItem.piece].update;
        if (fromItem && update && update['move']) fromItem.piece = update['move'];
        result = this.calcWarning();
        // 还原
        fromItem.piece = fromPiece;
        this.points[to] = toItem;
        this.points[from] = fromItem;
        
        return result && result[this.rules.checkmated];
    };
    
    /**
     * 计算警告
     * @param{Object} warning 被警告的坐标
     * @return{Object} 返回哪些棋子类型受到威胁
     */
    Chess.prototype.calcWarning = function(warning){
        var result;
        for (var i = 0; i < this.rules.board.grid[1]; i++){
            for (var j = 0; j < this.rules.board.grid[0]; j++){
                var pos = [j, i];
                var item = this.points[pos];
                if (!item || item.player == this.getCurrPlayer()) continue;
                var movePoints = {};
                this.calcMoves(pos, movePoints, true);
                for (var p in movePoints){
                    var tryItem = this.points[p];
                    if (tryItem && tryItem.player == this.getCurrPlayer()){
                        result = result || {};
                        result[tryItem.piece] = true;
                        if (warning){
                            warning[p] = warning[p] || {};
                            warning[p][pos] = true;
                        }
                    }
                } 
            }
        }
        return result;
    };
    
    /**
     * 从新开始游戏
     */
    Chess.prototype.replay = function(){
        this.step = 0; // 移动步数
        this.points = {}; // 棋子点阵
        
        var pieces, symmetry;
        for (var player in this.rules.board.setup){ // 遍历玩家
            pieces = this.rules.board.setup[player];
            if (typeof pieces == 'string'){ // 重定向
                pieces = this.rules.board.setup[pieces];
                symmetry = true; // 需要对称
            }
            for (var piece in pieces){ // 遍历棋子
                var posList = pieces[piece];
                for (var i = 0; i < posList.length; i++){ // 遍历坐标
                    point = posList[i];
                    if (symmetry){ // 需要处理对称
                        point = this.symmetryPoint(point, player);
                    }
                    this.points[point] = {
                        player: player,
                        piece: piece
                    };
                }
            }
        }
        
        // console.log(this.points);
    };
    
    /**
     * 获取对称坐标
     * @param{Array} point 源坐标
     * @param{String} player 相对玩家视角
     * @return{Array} 返回对称坐标
     */
    Chess.prototype.symmetryPoint = function(point, player){
        if (!this.rules.symmetry || !this.rules.symmetry.points) return point;
        var item = this.rules.symmetry.points[player];
        if (!item) return point;
        if (typeof item == 'function'){
            return item(point, this.rules.board.grid);
        } else {
            return item[point];
        }
    };
    
    /**
     * 获取对称方向
     * @param{Array} direction 方向
     * @param{String} player 相对玩家视角
     * @return{Array} 返回对称方向
     */
    Chess.prototype.symmetryDirection = function(direction, player){
        if (!this.rules.symmetry || !this.rules.symmetry.directions) return direction;
        var symmetryDirections = this.rules.symmetry.directions[player];
        if (!symmetryDirections) return direction;
        if (typeof symmetryDirections == 'function'){
            return symmetryDirections(direction);
        } else {
            return symmetryDirections[direction];
        }
    };

    /**
     * 当前执棋玩家
     */
    Chess.prototype.getCurrPlayer = function(){
        return this.rules.turnOrder[
            this.step % this.rules.turnOrder.length
        ];
    };
    
    /**
     * 上一个执棋玩家
     */
    Chess.prototype.getPrevPlayer = function(){
        return this.rules.turnOrder[
            (this.step - 1 + this.rules.turnOrder.length) % this.rules.turnOrder.length
        ];
    };

    /**
     * 下一个执棋玩家
     */
    Chess.prototype.getNextPlayer = function(){
        return this.rules.turnOrder[
            (this.step + 1) % this.rules.turnOrder.length
        ];
    };

    /**
     * 坐标是否在区域中
     * @param{String} player 玩家类型
     * @param{Array} point 坐标
     * @param{String} zone 区域名
     */
    Chess.prototype.posInZone = function(player, point, zone){
        if (!this.rules.zones) return;
        if (zone instanceof Array){
            for (var i = 0; i < zone.length; i++)
                if (this.posInZone(player, point, zone[i])) return true;
            return;
        }
        var xor;
        if (zone.substr(0, 1) == '!'){
            zone = zone.substr(1);
            xor = true;
        }
        var bound = this.rules.zones[zone][player];
        if (typeof bound == 'string'){
            bound = this.rules.zones[zone][bound];
            point = this.symmetryPoint(point, player);
        }
        if (!bound) return;
        if (point[0] < bound[0] || point[1] < bound[1] ||
            point[0] >= bound[0] + bound[2] || point[1] >= bound[1] + bound[3])
            return xor;
        return !xor;
    };
    
    /**
     * 创建一个棋类游戏
     */
    exports.create = function(rules){
        return new Chess(rules)
    }
    
}(AceChess);