console.log('Loaded OTSDB Script')
export class OTSDB {
  async rdb() {
    const data = await fetch('https://mailer-vknh.onrender.com/LoggingHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'MaqWalIndustriesXDLOL',
        read: 'true',
        append: 'false',
        log: ''
      })
    })
    .then(res => {return res.json()})
    return data.data
  }
  async adb(log) {
    const data = await fetch('https://mailer-vknh.onrender.com/LoggingHandler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'MaqWalIndustriesXDLOL',
        read: 'true',
        append: 'true',
        log: log,
      })
    })
    .then(res => {return res.json()})
    return data.data
  }
}