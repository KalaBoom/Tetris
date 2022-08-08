class Game {
    constructor() {
        for (let y=0; y < this.field.rows; y++) {
            const line = this.getOneLine()
            this.playfield.push(line)
        }
        this.setNextActiveFigure()
    }
    field = {
        rows: 20,
        cols: 10
    }
    level = 1
    score = 0
    status = 'start'
    playfield = []
    figures = {
        'J': [
            [0,5,0],
            [0,5,0],
            [5,5,0]
        ],
        'I': [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
        ],
        'O': [
            [2,2],
            [2,2]
        ],
        'L': [
            [0,4,0],
            [0,4,0],
            [0,4,4]
        ],
        'Z': [
            [6,6,0],
            [0,6,6],
            [0,0,0]
        ],
        'T': [
            [0,0,0],
            [3,3,3],
            [0,3,0]
        ],
        'S': [
            [0,7,7],
            [7,7,0],
            [0,0,0]
        ]
    }
    activeFigure = {
        x: 0,
        y: 0,
        current: null,
        next: null,
        moveLeft() {
            this.x -= 1
        },
        moveRight() {
            this.x += 1
        },
        moveBottom() {
            this.y += 1
        },
        moveTop() {
            this.y -= 1
        },
        rotate() {
            const newBlocks = this.current.map(i => i.map(j => {j = 0; return j}))
            const length = this.current.length - 1
            for (let y=0; y <= length; y++) {
                for (let x=0; x <= length; x++) {
                    newBlocks[x][length-y] = this.current[y][x]
                }
            }
            this.current = newBlocks
        }
    }
    moveActiveFigureLeft() {
        this.activeFigure.moveLeft()
        if (this.hasCollision()) {
            this.activeFigure.moveRight()
        }
    }
    moveActiveFigureRight() {
        this.activeFigure.moveRight()
        if (this.hasCollision()) {
            this.activeFigure.moveLeft()
        }
    }
    moveActiveFigureBottom() {
        this.activeFigure.moveBottom()
        if (this.hasCollision()) {
            this.activeFigure.moveTop()
            this.lockActiveFigure()
            if (!this.checkGameOver()) {
                this.setNextActiveFigure()
                this.getScore()
            } else {
                this.changeStatus('game over')
            }
        }
    }
    hasCollision() {
        const {y:yFigure, x:xFigure, current} = this.activeFigure
        for (let y=0; y < current.length;y++) {
            for (let x=0; x < current[y].length; x++) {
                const yCoord = y+yFigure
                const xCoord = x+xFigure
                if (current[y][x] && 
                    ((this.playfield[yCoord] === undefined || this.playfield[yCoord][xCoord] === undefined) ||
                    (this.playfield[yCoord] && this.playfield[yCoord][xCoord]))
                    ) {
                    return true
                }
                
            }
        }
        return false
    }
    lockActiveFigure() {
        const {x, y, current} = this.activeFigure
        for (let i=0; i < current.length; i++) {
            for (let j=0; j < current[i].length; j++) {
                if (current[i][j]) {
                    this.playfield[y+i][x+j] = current[i][j]
                }
            }
        }
    }
    clearState() {
        console.log('clear state')
        this.playfield = this.playfield.map(y => y.map(x => {x = 0; return x}))
        console.log(this.playfield)
        this.level = 1
        this.score = 0
    }
    setNextActiveFigure() {
        this.activeFigure.x = Math.floor(this.field.cols / 2)
        this.activeFigure.y = 0
        this.activeFigure.current = this.activeFigure.next ? this.activeFigure.next : this.getNextFigure()
        this.activeFigure.next = this.getNextFigure()
    }
    getNextFigure() {
        const keys = Object.keys(this.figures)
        const rnd = Math.random() * keys.length | 0
        const key = keys[rnd]
        return this.figures[key]
    }
    getScore() {
        let score = 0
        let calcScore = 0
        let line
        while(line = this.checkAllLine()) {
            calcScore+=this.calcScore(line)
            this.deleteLine(line)
            score++
            line = null
        }
        this.score += (this.field.cols + calcScore) * score
        if (this.level*1000 <= this.score) {
            this.level++
        }
    }
    calcScore(line) {
        const row = this.playfield[line]
        return row.reduce((acc, x) => acc+x,0)
    }
    deleteLine(line) {
        this.playfield.splice(line, 1)
        this.playfield.unshift(this.getOneLine())
    }
    getOneLine() {
        const line = []
        for (let x=0; x < this.field.cols; x++) {
            line.push(0)
        }
        return line
    }
    checkAllLine() {
        for (let y=0; y < this.playfield.length; y++) {
            const isAllFull = this.playfield[y].every(x => x !== 0)
            if (isAllFull) {
                return y
            }
        }
        return false
    }
    checkGameOver() {
        const first = this.playfield[0]
        const isGameOver = first.some(x => x !== 0)
        return isGameOver
    }
    changeStatus(newStatus) {
        this.status = newStatus
    }
}

class View {
    constructor(game) {
        this.game = game
        this.canvas = document.getElementById('canvas')
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.ctx = canvas.getContext('2d')

        this.data.startXSideBar = this.data.startXField+((this.game.field.cols+this.data.distanceSideBar)*this.data.w)
        this.data.widthSideBar = this.data.w*this.data.wSideBar
        this.data.heigthSideBar = this.data.h*this.game.field.rows
    }
    data = {
        w: 25,
        h: 25,
        startXField: 100,
        startYField: 50,
        distanceSideBar: 2,
        distanceOutParam: 50,
        distanceInnerParam: 30,
        wSideBar: 7
    }
    types = {
        0: 'black',
        1: 'aqua',
        2: 'yellow',
        3: 'purple',
        4: 'orange',
        5: 'blue',
        6: 'red',
        7: 'green'
    }
    updateView() {
        this.drawBackground()
        this.drawPlayfield()
        this.drawActiveFigure()
        this.drawSideBar()
    }
    drawBackground() {
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height)
    }
    drawPlayfield() {
        const {w, h, startXField: startX, startYField: startY} = this.data
        this.game.playfield.forEach((y, i) => y.forEach((x, j) => this.drawBlock(i, j, x)))
        this.ctx.strokeStyle = 'white'
        this.ctx.strokeRect(startX, startY, w*this.game.playfield[0].length, h* this.game.playfield.length)
    }
    drawActiveFigure() {
        const {x:xFigure, y:yFigure, current} = this.game.activeFigure
        current.forEach((y,i) => {
            y.forEach((x,j) => {
                if(x !== 0) {
                    this.drawBlock(i+yFigure,j+xFigure, x)
                }
            })
        })
    }
    drawNextFigure() {
        const {distanceSideBar, wSideBar} = this.data
        const {next} = this.game.activeFigure
        const xFigure = this.game.field.cols + distanceSideBar + 2
        const yFigure = this.game.field.rows * 0.8
        this.ctx.lineWidth = 1
        next.forEach((y,i) => {
            y.forEach((x,j) => {
                if(x !== 0) {
                    this.drawBlock(i+yFigure,j+xFigure, x)
                }
            })
        })
    }
    drawSideBar() {
        this.ctx.save()
        this.drawSideBarBackround()
        this.drawSideBarLine()
        this.drawSideBarParameters()
        this.ctx.restore()
    }
    drawSideBarBackround() {
        const {startXSideBar:startX, startYField:startY, widthSideBar:width, heigthSideBar:heigth} = this.data
        this.ctx.strokeStyle = 'white'
        this.ctx.strokeRect(startX, startY, width, heigth)
    }
    drawSideBarLine() {
        const {startXSideBar:startX, startYField:startY, widthSideBar:width, heigthSideBar:heigth} = this.data
        const xLine = startX+width
        const yLine = (startY+heigth)*0.7
        this.ctx.strokeStyle = 'white'
        this.ctx.lineWidth = 5
        this.ctx.lineTo(startX, yLine)
        this.ctx.lineTo(xLine, yLine)
        this.ctx.stroke()
    }
    drawSideBarParameters() {
        const {startXSideBar:startX, startYField:startY, widthSideBar:width, heigthSideBar:heigth,
        distanceOutParam} = this.data
        const x = startX + Math.ceil(width*0.3)
        const y = startY + distanceOutParam
        const yNextFigure = heigth * 0.92
        this.drawParameter(x, y, 'Level', this.game.level)
        this.drawParameter(x, y + distanceOutParam*2, 'Score', this.game.score)
        this.drawParameter(x, yNextFigure, 'Next')
        this.drawNextFigure()
    }
    drawParameter(x, y, text, score='') {
        const {distanceInnerParam} = this.data
        const disctance = this.calcDisctanceParam(score)
        this.ctx.font = "30px Arial";
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(text, x, y);
        this.ctx.fillText(score, x+disctance, y+distanceInnerParam)
    }
    calcDisctanceParam(param) {
        const length = param.toString().length
        if (length == 1) {
            return 30
        }
        if (length == 2) {
            return 20
        }
        if (length == 3) {
            return 10
        }
        if (length == 4) {
            return 5
        }
    }
    drawBlock(y, x, type=0, needStroke=true) {
        const {w, h, startXField: startX, startYField: startY} = this.data
        this.ctx.strokeStyle = 'black'
        this.ctx.fillStyle = this.types[type]
        this.ctx.fillRect(startX+x*w, startY+y*h, w, h)
        if (needStroke) {
            this.ctx.strokeRect(startX+x*w, startY+y*h, w, h)
        }
    }
}

class Controller {
    constructor(view, game) {
        this.view = view
        this.game = game
        this.intervalId = null
        this.initData()
        this.setHandlers()
    }
    initData() {
        this.data = {
            startNumTimer: 300,
            oldLevel: 1
        }
    }
    start() {
        this.view.drawBackground()
        this.game.changeStatus('start')
        this.checkState()
    }
    update() {
        this.game.moveActiveFigureBottom()
        this.view.updateView()
        this.checkState()
    }
    checkState() {
        this.checkLevel()
        this.checkStatus()
    }
    checkLevel() {
        const {level} = this.game
        const {oldLevel} = this.data
        if (level !== oldLevel) {
            this.restartTimer()
        }
    }
    checkStatus() {
        const {status} = this.game
        switch(status) {
            case 'start':
                this.game.clearState()
                this.game.changeStatus('playing')
                this.startTimer()
                break
            case 'playing':
                break
            case 'game over':
                this.stopTimer()
                openModal('GAME OVER',`SCORE: ${this.game.score}`)
                break
            default:
                throw new Error('Inexpected status')
        }
    }
    startTimer() {
        const {startNumTimer} = this.data
        const interval = startNumTimer - this.game.level * 10
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.update()
            }, interval)
        }
    }
    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }
    restartTimer() {
        this.stopTimer()
        this.startTimer()
    }
    setHandlers() {
        document.addEventListener('keydown', event => {
            event.preventDefault()
            switch(event.keyCode) {
                case 38: // Arrow Up
                    this.game.activeFigure.rotate()
                    this.view.updateView()
                    break
                case 37: // Arrow Left
                    this.game.moveActiveFigureLeft()
                    this.view.updateView()
                    break
                case 39: // Arrow Right
                    this.game.moveActiveFigureRight()
                    this.view.updateView()
                    break
                case 40: // Arrow Down
                    this.game.moveActiveFigureBottom()
                    this.view.updateView()
                    break
            }
                
        })
        
    }

}

const game = new Game()
const view = new View(game)
const controller = new Controller(view, game)
openModal()

function openModal(text='TETRIS', addingText='') {
    const modal = document.getElementById('openModal')
    const title = document.getElementById('modalTitle')
    const addingTextTitle = document.getElementById('textModalTitle')
    title.textContent = text
    addingTextTitle.textContent = addingText
    modal.style.zIndex = 1050
}
function closeModal() {
    const modal = document.getElementById('openModal')
    modal.style.zIndex = -1
}

document.addEventListener('DOMContentLoaded', load)

function load(event) {
    const btn = document.getElementById('btnStart')
    btn.addEventListener('click', startGame)
}

function startGame() {
    controller.start()
    closeModal()
}