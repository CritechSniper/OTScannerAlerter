export async function triggerEmail(id, output) {
  const response = await fetch('https://mailer-vknh.onrender.com/otscanneralerter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: 'Abul@2010',
      receiver: id,
      body: 'Test mail\nSent by: ot_scanner_alerter_service',
      title: 'Test mail'
    })
  });

  const result = await response.json();
  console.log(result);
  output ? output.textContent = JSON.stringify(result) : console.warn('Output might be needed')
}
