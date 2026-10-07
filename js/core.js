const API_URL="https://yge-backend.onrender.com/api";
const TOKEN_KEY="yeara_token";
const USER_KEY="yeara_user";
const token=()=>localStorage.getItem(TOKEN_KEY);
const currentUser=()=>JSON.parse(localStorage.getItem(USER_KEY)||"null");

function escapeHTML(value){
    if(value===null||value===undefined)return "";
    return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function formatStatus(value){
    if(!value)return "-";
    return String(value).replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
}
function formatDate(value){
    return value?new Date(value).toLocaleDateString():"-";
}
function formatDateTime(value){
    return value?new Date(value).toLocaleString():"-";
}
async function apiFetch(path,options={}){
    const headers={...(options.headers||{})};
    if(!headers["Content-Type"] && options.body)headers["Content-Type"]="application/json";
    if(token())headers.Authorization=`Bearer ${token()}`;
    const response=await fetch(`${API_URL}${path}`,{...options,headers});
    let data={};
    try{data=await response.json();}catch{}
    if(response.status===401){
        localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);
        if(!location.pathname.endsWith("/index.html")&&!location.pathname.endsWith("/")) location.href="index.html";
        throw new Error(data.message||"Your session has expired.");
    }
    if(!response.ok)throw new Error(data.message||"Request failed.");
    return data;
}
function logout(){
    localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY);
    location.href="index.html";
}
async function guardPage(){
    if(!token()){location.href="index.html";return null;}
    try{
        const data=await apiFetch("/auth/me");
        localStorage.setItem(USER_KEY,JSON.stringify(data.user));
        const name=document.getElementById("adminName");if(name)name.textContent=data.user.name;
        return data.user;
    }catch{return null;}
}
function setupShell(){
    const u=currentUser();const name=document.getElementById("adminName");if(name&&u)name.textContent=u.name;
    const logoutButton=document.getElementById("logoutButton");if(logoutButton)logoutButton.addEventListener("click",logout);
    document.querySelectorAll(".admin-nav a").forEach(a=>{
        if(a.pathname===location.pathname)a.classList.add("active");
    });
}
document.addEventListener("DOMContentLoaded",()=>{setupShell();if(!document.body.classList.contains("login-page"))guardPage();});
