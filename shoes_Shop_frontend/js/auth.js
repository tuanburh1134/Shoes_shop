// Simple client-side auth for demo purposes
(function(){
  const BACKEND = 'http://localhost:8080'
  const AUTH_API = BACKEND + '/api/auth'

  function $(sel){return document.querySelector(sel)}
  function getUsers(){
    try{return JSON.parse(localStorage.getItem('users')||'[]')||[];}catch(e){return[]}
  }
  function saveUsers(u){localStorage.setItem('users',JSON.stringify(u))}
  function setCurrent(user){localStorage.setItem('currentUser',JSON.stringify(user))}
  function getCurrent(){try{return JSON.parse(localStorage.getItem('currentUser')||'null')}catch(e){return null}}
  function notify(title, msg){
    if(window.showNotification) window.showNotification(title, msg || '', 'error', 2600)
    else alert(title + (msg ? ('\n' + msg) : ''))
  }
  function success(title, msg){
    if(window.showNotification) window.showNotification(title, msg || '', 'success', 1800)
    else alert(title + (msg ? ('\n' + msg) : ''))
  }
  function apiMessage(err, fallback){
    try{
      if(err && err.response && err.response.data){
        const d = err.response.data
        if(typeof d === 'string' && d.trim()) return d
        if(d.message) return d.message
      }
      if(err && err.message) return err.message
    }catch(e){}
    return fallback || 'Có lỗi xảy ra'
  }
  async function confirmLogout(){
    try{
      if(window.showConfirm){
        return await window.showConfirm('Bạn có chắc muốn đăng xuất không?', 'Xác nhận đăng xuất')
      }
    }catch(e){}
    return confirm('Bạn có chắc muốn đăng xuất không?')
  }

  // Seed an admin user for demo if no users exist
  try{
    var _users = getUsers();
    if(!_users || _users.length === 0){
      _users = [{username:'admin',password:'admin',role:'admin'}];
      saveUsers(_users);
    }
  }catch(e){}

  // header update & account link behaviour
  function updateHeader(){
    var cur = getCurrent()
    var acctText = document.getElementById('account-text')
    var logoutLink = document.getElementById('logout-link')
    if(cur && cur.username){
      if(acctText) acctText.textContent = cur.username
      if(logoutLink) logoutLink.classList.remove('d-none')
      // ensure account menu hidden by default
      var menu = document.getElementById('account-menu'); if(menu) menu.style.display = 'none';
    } else {
      if(acctText) acctText.textContent = 'Tài khoản'
      if(logoutLink) logoutLink.classList.add('d-none')
      var menu = document.getElementById('account-menu'); if(menu) menu.style.display = 'none';
    }
  }

  var acct = document.getElementById('account-link')
  if(acct){
    acct.addEventListener('click', function(e){
      e.preventDefault()
      var cur = getCurrent()
      var menu = document.getElementById('account-menu')
      if(!cur || !cur.username){
        // not logged in -> go to login
        window.location.href = 'login.html'
        return
      }

      // logged in
      // build a simple dropdown for logged-in users (admin gets manage link)
      if(!menu) return
      if(menu.style.display === 'block'){
        menu.style.display = 'none'
        return
      }

      // populate menu
      menu.innerHTML = ''
      var profile = document.createElement('a'); profile.href = 'profile.html'; profile.className = 'btn-menu'; profile.textContent = 'Trang cá nhân'
      menu.appendChild(profile)
      if(cur.role === 'admin'){
        var manage = document.createElement('a'); manage.href = 'admin/manage-product.html'; manage.className = 'btn-menu'; manage.textContent = 'Quản lý hàng hóa'
        menu.appendChild(manage)
        var orders = document.createElement('a'); orders.href = 'admin/manage-orders.html'; orders.className = 'btn-menu'; orders.textContent = 'Quản lý hóa đơn'
        menu.appendChild(orders)
      }

      // position menu just under the account link (relative to #user-area)
      try{
        var acctLink = document.getElementById('account-link')
        // account-menu is inside #user-area which is position:relative
        var top = acctLink.offsetTop + acctLink.offsetHeight + 6
        var left = acctLink.offsetLeft
        menu.style.top = top + 'px'
        menu.style.left = left + 'px'
        menu.style.right = 'auto'
        menu.style.zIndex = '2000'
        // ensure visible
        menu.style.display = 'block'
      }catch(e){
        menu.style.display = 'block'
      }
      return
    })
    // hide menu when clicking outside
    document.addEventListener('click', function(e){
      var menu = document.getElementById('account-menu')
      var acctLink = document.getElementById('account-link')
      if(menu && menu.style.display === 'block'){
        if(!menu.contains(e.target) && !acctLink.contains(e.target)){
          menu.style.display = 'none'
        }
      }
    })
  }

  var logoutLink = document.getElementById('logout-link')
  if(logoutLink){
    logoutLink.addEventListener('click', async function(e){
      e.preventDefault()
      var ok = await confirmLogout()
      if(!ok) return
      localStorage.removeItem('currentUser')
      updateHeader()
      if(window.showNotification) window.showNotification('Đăng xuất thành công', '', 'success', 1200)
      else alert('Đăng xuất thành công')
      setTimeout(function(){ window.location.href = 'index.html' }, 300)
    })
  }

  // call on load to set header state
  try{updateHeader()}catch(e){}

  // If on login page, attach login handler
  if(document.getElementById('login-form')){
    document.getElementById('login-form').addEventListener('submit', async function(e){
      e.preventDefault()
      var u = document.getElementById('login-username').value.trim()
      var p = document.getElementById('login-password').value
      if(!u || !p){ notify('Đăng nhập thất bại', 'Vui lòng nhập đầy đủ thông tin'); return }
      try{
        const res = await axios.post(AUTH_API + '/login', { username: u, password: p })
        const role = res && res.data && res.data.role ? res.data.role : 'user'
        setCurrent({ username:u, password:p, role:role })
        // load profile if available
        try{
          const auth = 'Basic ' + btoa(u + ':' + p)
          const me = await axios.get(BACKEND + '/api/me', { headers: { Authorization: auth } })
          if(me && me.data){
            const cur = getCurrent() || {}
            cur.email = me.data.email || cur.email
            cur.addresses = me.data.addresses || cur.addresses || []
            cur.avatarUrl = me.data.avatarUrl || cur.avatarUrl
            setCurrent(cur)
          }
        }catch(err){ /* ignore profile fetch error */ }

        success('Đăng nhập thành công', '')
        window.location.href = 'index.html'
      }catch(err){
        const msg = apiMessage(err, 'Thông tin đăng nhập không đúng')
        if(String(msg).toLowerCase().indexOf('account.locked') >= 0){
          notify('Tài khoản đang bị khóa', 'Bạn không thể đăng nhập lúc này')
        } else {
          notify('Đăng nhập thất bại', msg)
        }
      }
    })
  }

  // If on register page, attach register handler
  if(document.getElementById('register-form')){
    document.getElementById('register-form').addEventListener('submit', async function(e){
      e.preventDefault()
      var u = document.getElementById('reg-username').value.trim()
      var p = document.getElementById('reg-password').value
      var emailEl = document.getElementById('reg-email')
      var email = emailEl && emailEl.value ? emailEl.value.trim() : (u ? (u + '@example.com') : '')
      if(!u || !p){ notify('Đăng ký thất bại', 'Vui lòng nhập đầy đủ'); return }
      try{
        await axios.post(AUTH_API + '/register', { username: u, password: p, email: email })
        // keep local mirror for compatibility screens
        try{
          var users = getUsers()
          if(!users.find(x=>x.username===u)) users.push({username:u,password:p,role:'user',email:email,addresses:[]})
          saveUsers(users)
        }catch(er){}
        setCurrent({username:u, password:p, role:'user', email:email, addresses: []})
        success('Đăng ký thành công', '')
        window.location.href = 'index.html'
      }catch(err){
        notify('Đăng ký thất bại', apiMessage(err, 'Không thể tạo tài khoản'))
      }
    })
  }

})();
