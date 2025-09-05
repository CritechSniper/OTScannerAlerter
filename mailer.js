export async function triggerEmail(id) {
  const response = await fetch('https://mailer-vknh.onrender.com/otscanneralerter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: 'Abul@2010',
      receiver: `${id}@iischoolabudhabi.com`
    })
  });

  const result = await response.json();
  console.log(result);
}
