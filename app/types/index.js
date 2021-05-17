const moment = require("moment")

class PowerballTicket {

    // Array of numbers. Space separeted string of six numbers, two digit each
    numbers = ""
    draw_date = ""

    constructor(draw_date = "", numbers = "") {
        this.numbers = numbers
        this.draw_date = draw_date
        this.balls = []
    }

    /**
     * Moment UTC from draw_date
     * @returns Moment UTC created from draw_date
     */
    getDrawDate() {
        return moment.utc(this.draw_date)
    }

    /**
     * Extract ISO 8601 from draw date
     * @returns Return full date time ISO 8601 format
     */
    getDrawDateIsoTimestamp() {
        return (new Date(this.draw_date)).toISOString()
    }

    /**
     * Date time in compatible with format in draw feeder
     * @returns Date time ISO 8601 without the Z suffix
     */
    getDrawTimestamp() {
        return this.getDrawDateIsoTimestamp().slice(0,-1)
    }

    /**
     * Perform quality check on the balls numbers
     * Verify the ticket has 6 numbers
     * White balls must be in range [1,69]
     * Powerball must be in range [1,26]
     * @throws PowerballException when a inconsistency is found
     */
    evalBalls() {
        if(typeof(this.balls) == "undefined" || this.balls.length == 0) {
            try {
                this.balls = this.numbers.split(" ")
                if(this.balls.length != 6)
                    throw new PowerballException(`powerball ticket must have 6 numbers. Ticket numbers ${this.numbers}`)
                // White balls should be in range [1,69]
                // Powerball in range [1,26]
                let whiteOutOfRange = this.balls.slice(0,-1)
                            .map(ball => parseInt(ball, 10))
                            .filter(ball => isNaN(ball) || ball < 1 || ball > 69)
                if(whiteOutOfRange.length > 0)
                    throw new PowerballException(`powerball white balls values must be within the range [1, 69]. Invalid numbers ${whiteOutOfRange}`)
                let powerball = this.balls.slice(-1)
                if(powerball < 1 || powerball > 26)
                    throw new PowerballException(`powerball value must be within the range [1, 26]. Invalid number ${powerball}`)
            } catch(error){
                throw new PowerballException(`Error parsing powerball numbers. Ticket numbers ${this.numbers}`)
            }
        }
    }

    /**
     * Retrieve ticket's white balls
     * @returns White balls array
     * @throws PowerballException when a inconsistency is found
     */
    getWhiteBalls() {
        this.evalBalls()
        return this.balls.slice(0, -1)
    }

    /**
     * Retrieve ticket's powerball
     * @returns Powerball array with a single number
     * @throws PowerballException when a inconsistency is found
     */
    getPowerBall() {
        this.evalBalls()
        return this.balls.slice(-1)
    }

    /**
     * Update ticket numbers. evalballs is called automatically.
     * @param {*} numbers New ticket's numbers. String: "01 02 03 04 05 06"
     */
    setNumbers(numbers) {
        this.numbers = numbers
        this.balls = undefined
        this.evalBalls()
    }
}


/**
 * Powerball Draw representation. 
 * Holds logic to evaluate prize against a PowerballTicket.
 */
class PowerballDraw extends PowerballTicket {
    winning_numbers = ""
    multiplier = 0

    constructor(draw_date = "", numbers = "") {
        super(draw_date, numbers)
        this.winning_numbers = numbers
    }

    init() {
        super.setNumbers(this.winning_numbers)
    }

    /**
     * Computes PowerballPrize for this draw against a PowerballTicket.
     * @param {*} powerballTicket Ticket to evaluate prizes
     * @returns PowerballPrize with prize information.
     */
    computePrize(powerballTicket) {
        powerballTicket.evalBalls()
        this.evalBalls()
        if(typeof(powerballTicket) == "undefined")
            throw new PowerballException(`Invalid ticket to compute prize`)
        if(!powerballTicket.getDrawDate().startOf('day').isSame(this.getDrawDate().startOf('day')))
            throw new PowerballException(`Ticket draw date (${powerballTicket.getDrawDate()}) different than this draw date (${this.getDrawDate()})`)
        let ticketWhiteBalls = powerballTicket.getWhiteBalls()
        let drawWhiteBalls = this.getWhiteBalls()
        let whiteBallsMatched = ticketWhiteBalls.filter(ball => drawWhiteBalls.includes(ball));
        let powerBallMatch =  this.getPowerBall().includes(powerballTicket.getPowerBall()[0])
        let prize = new PowerballPrize("Not won", 0, false, powerballTicket, this)
        switch (whiteBallsMatched.length) {
            case 0: 
            case 1: 
                if( powerBallMatch ) {
                    prize.prize = 4
                    prize.status = "Winning"
                }
                break
            case 2:
                if( powerBallMatch ) {
                    prize.prize = 7
                    prize.status = "Winning"
                }
                break
            case 3:
                prize.status = "Winning"
                if( powerBallMatch )
                    prize.prize = 100
                else
                    prize.prize = 7
                break
            case 4:
                prize.status = "Winning"
                if( powerBallMatch )
                    prize.prize = 50000
                else
                    prize.prize = 100
                break
            case 5:
                if( powerBallMatch ) {
                    prize.status = "Grand Prize!!!"
                    prize.grandPrize = true
                    prize.prize = -1
                } else {
                    prize.status = "Winning"
                    prize.prize = 1_000_000
                }
                break
        }
        return prize
    }
}

class PowerballPrize {
    constructor(status = 'Not evaluated', prize = 0, grandPrize = false, ticket = undefined, draw = undefined) {
        this.evaluationDate = new Date()
        this.status = status
        this.prize = prize
        this.grandPrize = grandPrize
        this.ticket = ticket
        this.draw = draw
    }
}

function PowerballException(message) {
    this.message = message;
    this.name = "PowerballException";
 }

module.exports = {
    PowerballDraw,
    PowerballTicket,
    PowerballPrize,
    PowerballException
}