const timeoutSignal = Symbol('timeout')

module.exports = { repeatUntilResult, timeoutSignal }

async function repeatUntilResult({ timeBetween, timeout }, f) {
  if (timeout < timeBetween) throw timeoutSignal

  const result = await f()
  if (result) return result

  return executeAfter(
    { delay: timeBetween },
    async () => repeatUntilResult({ timeBetween, timeout: timeout - timeBetween }, f)
  )
}

async function executeAfter({ delay, }, f) {
  return new Promise((resolve, reject) =>
    setTimeout(() => f().then(resolve).catch(reject), delay)
  )
}
