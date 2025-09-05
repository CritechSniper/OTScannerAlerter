setTimeout(()=>{
  const ls = localStorage.getItem('LoggedInGate2')
  if (!ls) window.location.href = 'login.html'
}, 2000)