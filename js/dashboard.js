(async()=>{
 const user=await guardPage();if(!user)return;
 try{
  const d=await apiFetch("/dashboard/stats"),s=d.stats;
  for(const [id,value] of Object.entries({totalShipments:s.totalShipments,inTransit:s.inTransit,delivered:s.delivered,newRequests:s.newRequests,totalCustomers:s.totalCustomers,exceptions:s.exceptions,totalRevenue:s.revenue,totalProfit:s.profit}))document.getElementById(id)&&(document.getElementById(id).textContent=typeof value==="number"&&id.match(/Revenue|Profit/)?`$${value.toFixed(2)}`:value);
  const rs=document.getElementById("recentShipments");
  if(rs)rs.innerHTML=d.recentShipments.map(x=>`<tr><td><strong>${escapeHTML(x.tracking_number)}</strong></td><td>${escapeHTML(x.customer_name||x.origin_country)}</td><td>${escapeHTML(x.destination_country)}</td><td><span class="status-badge status-${escapeHTML(x.status)}">${formatStatus(x.status)}</span></td><td>${formatDate(x.created_at)}</td></tr>`).join("")||`<tr><td colspan="5">No shipments yet.</td></tr>`;
  const rq=document.getElementById("recentRequests");
  if(rq)rq.innerHTML=d.recentRequests.map(x=>`<tr><td>${escapeHTML(x.name)}</td><td>${escapeHTML(x.origin_country)} → ${escapeHTML(x.destination_country)}</td><td>${formatStatus(x.status)}</td><td>${formatDate(x.created_at)}</td></tr>`).join("")||`<tr><td colspan="4">No quote requests.</td></tr>`;
 }catch(e){console.error(e);}
})();
