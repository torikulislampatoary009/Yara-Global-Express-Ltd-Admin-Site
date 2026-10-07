const form=document.getElementById("loginForm"),errorBox=document.getElementById("loginError"),button=document.getElementById("loginButton");
if(localStorage.getItem("yeara_token")) location.href="dashboard.html";
form.addEventListener("submit",async e=>{
    e.preventDefault();errorBox.textContent="";
    button.disabled=true;button.textContent="Signing in...";
    try{
        const response=await fetch("https://yge-backend.onrender.com/api/auth/login",{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value})
        });
        const data=await response.json();
        if(!response.ok||!data.success)throw new Error(data.message||"Login failed.");
        localStorage.setItem("yeara_token",data.token);
        localStorage.setItem("yeara_user",JSON.stringify(data.user));
        location.href="dashboard.html";
    }catch(err){errorBox.textContent=err.message;}
    finally{button.disabled=false;button.textContent="Sign In";}
});
