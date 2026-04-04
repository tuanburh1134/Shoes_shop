document.addEventListener('DOMContentLoaded', ()=>{
    const logo = document.getElementById('site-logo');
    if(logo){
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e)=>{
            // navigate to homepage
            window.location.href = 'index.html';
        });
    }
});
