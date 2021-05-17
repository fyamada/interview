const { PowerballTicket, PowerballException, PowerballDraw } = require('../../../app/types')

test('PowerballTicket getWhiteBalls', () => {
  let ticket = new PowerballTicket()
  ticket.setNumbers("01 02 03 04 05 06")
  let whiteBalls = ticket.getWhiteBalls()
  expect(whiteBalls).toContain('01')
  expect(whiteBalls).toContain('02')
  expect(whiteBalls).toContain('03')
  expect(whiteBalls).toContain('04')
  expect(whiteBalls).toContain('05')
  expect(whiteBalls.length).toBe(5)
})

test('PowerballTicket more than 6 balls', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("01 02 03 04 05 06 07")).toThrow(PowerballException)
})

test('PowerballTicket less than 6 balls', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("01 02 03 04 05")).toThrow(PowerballException)
})

test('PowerballTicket white ball above range', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("70 02 03 04 05 06")).toThrow(PowerballException)
})

test('PowerballTicket white ball bellow range', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("00 02 03 04 05 06")).toThrow(PowerballException)
})

test('PowerballTicket powerball above range', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("01 02 03 04 05 27")).toThrow(PowerballException)
})

test('PowerballTicket powerball bellow range', () => {
  let ticket = new PowerballTicket()
  expect(() => ticket.setNumbers("01 02 03 04 05 00")).toThrow(PowerballException)
})

test('PowerballTicket getPowerBall', () => {
  let ticket = new PowerballTicket()
  ticket.setNumbers("01 02 03 04 05 06")
  let powerBall = ticket.getPowerBall()
  expect(powerBall).toContain('06')
  expect(powerBall.length).toBe(1)
})

test('Compute just powerball prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "21 22 23 24 25 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(4)
})

test('Compute 1 whiteball + powerball prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 22 23 24 25 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(4)
})

test('Compute 2 whiteballs + powerball prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 23 24 25 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(7)
})

test('Compute 3 whiteballs prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 24 25 16")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(7)
})

test('Compute 3 whiteballs + powerball prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 24 25 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(100)
})

test('Compute 4 whiteballs prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 04 25 26")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(100)
})

test('Compute 4 whiteballs + powerball prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 04 25 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(50000)
})

test('Compute 5 whiteballs prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 04 05 26")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(false)
  expect(prize.prize).toBe(1000000)
})

test('Compute grand prize', () => {
  let ticket = new PowerballTicket("2021-05-01", "01 02 03 04 05 06")
  let draw = new PowerballDraw("2021-05-01", "01 02 03 04 05 06")
  let prize = draw.computePrize(ticket)
  expect(prize.grandPrize).toBe(true)
  expect(prize.prize).toBe(-1)
})