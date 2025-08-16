Run this in the browser console

// Reset your tutorial status
fetch('/api/users/reset-intro', { 
  method: 'POST', 
  headers: { 
    'Authorization': 'Bearer ' + await window.Clerk.session.getToken(),
    'Content-Type': 'application/json'
  } 
})
.then(r => r.json())
.then(data => {
  console.log('Reset result:', data);
  if (data.success) {
    alert('Tutorial reset! Refresh the page to see it again.');
    window.location.reload();
  }
});