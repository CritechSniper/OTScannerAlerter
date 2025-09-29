function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Mailer {
  async mail(id, b, t) {
    const delayMs = 10_000
    if (delayMs > 0) await delay(delayMs); // Delay if specified

    try {
      const response = await fetch('https://mailer-vknh.onrender.com/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'Abul@2010',
          rmail: id,
          body: b,
          title: t
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }
}

console.log('Loaded Mailer Script')
/*
///---Still in work... do NOT UNCOMMENT \\\
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
    const delayMs = 10_000
    if (delayMs > 0) await delay(delayMs); // Delay if specified
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
*/
/*
  How to use:
  const mailer = new Mailer()
  mailer.mail('example@gmail.com', 'body', 'title')
*/
/*

*/