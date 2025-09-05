
setTimeout(()=>{
  const ls = localStorage.getItem('LoggedInGate1')
  if (!ls) window.location.href = 'login.html'
}, 2000)