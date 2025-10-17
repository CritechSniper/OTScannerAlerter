function delay(Seconds) {
  return new Promise(resolve => setTimeout(resolve, Seconds*1000));
}

export class Mailer {
  async mail(id, b, t) {
    const DelaySeconds = 5 //
    if (DelaySeconds > 0) await delay(DelaySeconds); // Delay if specified

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
    const DelaySeconds = 10_000
    if (DelaySeconds > 0) await delay(DelaySeconds); // Delay if specified
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