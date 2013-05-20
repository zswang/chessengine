var AceChessControl = AceChessControl || {};
void function(exports){
    
    function ChessControl(options){
        this.rules = options.rules;
        this.theme = options.theme;
        this.engine = AceChess.create(this.rules);
        this.parent = options.parent || document.body;
        this.currPlayer = options.currPlayer;
        this.oncommand = options.oncommand;
        
        this.angleIndex = (options.angleIndex || 0) % this.rules.players.length;

        // 创建棋盘
        this.div_board = document.createElement("div");
        this.div_board.className = this.theme.className;
        this.parent.appendChild(this.div_board);

        this.div_layers = {}; // 地板
        var self = this;
        if (this.rules.board.grid){
            for (var i = 0; i < this.rules.board.grid[1]; i++){
                for (var j = 0; j < this.rules.board.grid[0]; j++){
                    this.div_layers[[j, i, 0]] = document.createElement("div");
                    this.div_layers[[j, i, 0]].className = 
                        this.theme.pieceClassName + " " +
                        this.theme.chars[0][j] + 
                        this.theme.chars[1][i];
                    this.div_board.appendChild(this.div_layers[[j, i, 0]]);
                    this.div_layers[[j, i, 0]].pos = [j, i];
                    this.div_layers[[j, i, 0]].onclick = function(){
                        if (self.currPlayer != self.engine.getCurrPlayer()) return; // 非自己操作
                        if (self.rules.drop){
                            if (self.movePoints[this.pos]){
                                var piece = self.movePoints[this.pos];
                                if (self.drop(this.pos, piece)){
                                    self.oncommand({
                                        type: 'drop',
                                        to: this.pos,
                                        piece: piece
                                    });
                                }
                            }
                            return;
                        }
                        var item = self.engine.points[this.pos];
                        if (item && self.currPlayer == item.player){ // 点中自己的棋子，选中
                            if (self.activePoints[this.pos] && 
                                self.setSelected(this.pos) && self.oncommand){
                                self.oncommand({
                                    type: 'select',
                                    selected: this.pos
                                });
                            }
                        } else if (self.selected && self.movePoints[this.pos]){ // 移动
                            var from = [self.selected[0], self.selected[1]];
                            if (self.move(self.selected, this.pos)){
                                self.oncommand({
                                    type: 'move',
                                    from: from,
                                    to: this.pos
                                });
                            }
                        }
                    };
                    this.div_layers[[j, i, 0]].ondblclick = function(){
                        if (self.dangerous) return; // 处于危险中
                        if (self.currPlayer != self.engine.getCurrPlayer()) return; // 非自己操作
                        var item = self.engine.points[this.pos];
                        if (item && self.currPlayer == item.player){ // 点中自己的棋子，选中
                            if (self.rules.pieces[item.piece].sleeps){
                                if (self.sleep(this.pos)){
                                    self.oncommand({
                                        type: 'sleep',
                                        from: this.pos
                                    });
                                }
                            }
                        }
                    };
                    for (var l = 1; l < this.theme.layer; l++){
                        this.div_layers[[j, i, l]] = document.createElement("div");
                        this.div_layers[[j, i, 0]].appendChild(this.div_layers[[j, i, l]]);
                    }
                }
            }
        }
        this.updateActive();
        this.updateMoves();
        this.updateWarning();
        this.updateAll();
    }
    
    ChessControl.prototype.command = function(data){
        switch(data.type){
            case 'select':
                this.setSelected(data.selected);
                break;
            case 'move':
                this.move(data.from, data.to);
                break;
            case 'sleep':
                this.sleep(data.from);
                break;
            case 'drop':
                this.drop(data.to, data.piece);
                break;
        }
    };

    ChessControl.prototype.updateAll = function(){
        var className = this.theme.className;
        if (this.currPlayer == this.engine.getCurrPlayer() && this.theme.active &&
            this.theme.active.className && this.theme.active.className[this.currPlayer])
            className += " " + this.theme.active.className[this.currPlayer];
        if (this.div_board.className != className)
            this.div_board.className = className;
        for (var i = 0; i < this.rules.board.grid[1]; i++)
            for (var j = 0; j < this.rules.board.grid[0]; j++){
                this.updatePoint([j, i]);
        }
    };
    
    ChessControl.prototype.nextAngle = function(){
        this.angleIndex = (this.angleIndex + 1) % this.rules.players.length;
        this.updateAll();
    };
    
    ChessControl.prototype.setCurrPlayer = function(value){
        if (this.currPlayer == value) return;
        this.currPlayer = value;
        this.updateAll();
    };
    
    ChessControl.prototype.setSelected = function(pos){
        if ("" + this.selected == pos) return;
        var oldSelected = this.selected;
        this.selected = pos;
        if (this.currPlayer == this.engine.getCurrPlayer()){
            this.updateMoves();
            this.updateAll();
        } else {
            this.updatePoint(pos);
            this.updatePoint(oldSelected);
        }
        return true;
    };
    
    ChessControl.prototype.updateActive = function(){
        this.activePoints = {};
        this.engine.calcActive(this.activePoints, this.rules.checkmated);
    };
    
    ChessControl.prototype.updateMoves = function(){
        this.movePoints = {};
        if (this.currPlayer != this.engine.getCurrPlayer()) return;
        if (this.rules.drop){ // 空降
            this.engine.calcDrops(this.movePoints);
            return;
        }
        if (!this.selected || !this.engine.points[this.selected]) return;
        
        this.engine.calcMoves(this.selected, this.movePoints, this.rules.checkmated);
    };
    
    ChessControl.prototype.updateWarning = function(){
        this.warning = {};
        var result = this.engine.calcWarning(this.warning);
        this.dangerous = result && result[this.rules.checkmated];
    };
    
    ChessControl.prototype.move = function(from, to){
        this.engine.move(from, to);
        this.from = from;
        this.to = to;
        this.selected = null;
        this.updateActive();
        this.updateMoves();
        this.updateWarning();
        this.updateAll();
        return true;
    };
    
    ChessControl.prototype.sleep = function(from){
        this.engine.sleep(from);
        this.from = from;
        this.to = from;
        this.selected = null;
        this.updateActive();
        this.updateMoves();
        this.updateWarning();
        this.updateAll();
        return true;
    };
    
    ChessControl.prototype.drop = function(to, piece){
        this.engine.drop(to, piece);
        this.to = to;
        this.selected = null;
        this.updateActive();
        this.updateMoves();
        this.updateAll();
        return true;
    };
    

    ChessControl.prototype.updatePoint = function(pos){
        if (!pos || !this.theme.control) return;
        var item = this.engine.points[pos];
        for (var l = 0; l < this.theme.layer; l++){ // 遍历层次
            var className = this.theme.pieceClassName;
            
            if (l == 0){
                var p = this.engine.symmetryPoint(pos, this.rules.players[this.angleIndex]);
                className += " " +
                    this.theme.chars[0][p[0]] + 
                    this.theme.chars[1][p[1]]; // 位置
            }
            
            if (("" + this.selected == pos) && // 选中
                this.theme.control.selected && 
                this.theme.control.selected[this.engine.getCurrPlayer()] &&
                this.theme.control.selected[this.engine.getCurrPlayer()][l]){
                className += " " + this.theme.control.selected[this.engine.getCurrPlayer()][l];
            }
            if (("" + this.from == pos) && // 来源
                this.theme.control.from &&
                this.theme.control.from[this.engine.getCurrPlayer()] &&
                this.theme.control.from[this.engine.getCurrPlayer()][l]){
                className += " " + this.theme.control.from[this.engine.getPrevPlayer()][l];
            }
            if (("" + this.to == pos) && // 目标
                this.theme.control.to &&
                this.theme.control.to[this.engine.getCurrPlayer()] &&
                this.theme.control.to[this.engine.getCurrPlayer()][l]){
                className += " " + this.theme.control.to[this.engine.getPrevPlayer()][l];
            }
            if (item){
                if (item.player == this.currPlayer &&
                    this.activePoints[pos] &&
                    this.theme.control.activity &&
                    this.theme.control.activity[this.engine.getCurrPlayer()] &&
                    this.theme.control.activity[this.engine.getCurrPlayer()][l]){ // 当前的棋子
                    className += " " + this.theme.control.activity[this.engine.getCurrPlayer()][l];
                }
                if (this.movePoints[pos]){ // 可以移动
                    if (this.theme.control.killer[item.player] &&
                        this.theme.control.killer[item.player][l]){
                        className += " " + this.theme.control.killer[item.player][l];
                    }
                }
                if (this.warning[pos] && item){ // 受到危险
                    if (item.piece == this.rules.checkmated &&
                        this.theme.control.warning[item.player] &&
                        this.theme.control.warning[item.player][l]){
                        className += " " + this.theme.control.warning[item.player][l];
                    }
                }
                if (this.theme.pieces[item.piece][item.player] &&
                    this.theme.pieces[item.piece][item.player][l]){
                    className += " " + this.theme.pieces[item.piece][item.player][l];
                }
            } else {
                if (this.movePoints[pos]){ // 可以移动
                    if (this.theme.control.moveto[this.engine.getCurrPlayer()] &&
                        this.theme.control.moveto[this.engine.getCurrPlayer()][l]){
                        className += " " + this.theme.control.moveto[this.engine.getCurrPlayer()][l];
                    }
                }
            }
            if (className != this.div_layers[[pos, l]].className){
                this.div_layers[[pos, l]].className = className;
            }
        }
    };

    exports.create = function(options){
        return new ChessControl(options);
    };
    
}(AceChessControl);