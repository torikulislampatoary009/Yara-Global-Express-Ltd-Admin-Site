(async()=>{await guardPage();try{const [r,a]=await Promise.all([apiFetch("/reports/operations"),apiFetch("/reports/audit-logs?limit=100")]);const x=r.report;
document.getElementById("statusReport").innerHTML=x.shipment_status.map(v=>`<tr><td>${formatStatus(v.status)}</td><td>${v.total}</td></tr>`).join("");
document.getElementById("serviceReport").innerHTML=x.services.map(v=>`<tr><td>${escapeHTML(v.service_type)}</td><td>${v.shipments}</td><td>$${Number(v.revenue||0).toFixed(2)}</td></tr>`).join("");
document.getElementById("monthlyReport").innerHTML=x.monthly.map(v=>`<tr><td>${v.month}</td><td>${v.shipments}</td><td>$${Number(v.revenue||0).toFixed(2)}</td></tr>`).join("")||`<tr><td colspan="3">No data.</td></tr>`;
document.getElementById("auditReport").innerHTML=a.logs.map(v=>`<tr><td>${formatDateTime(v.created_at)}</td><td>${escapeHTML(v.user_name||v.user_email||"-")}</td><td>${escapeHTML(v.module_name)}</td><td>${escapeHTML(v.action)}</td><td>${escapeHTML(v.entity_type||"-")} ${v.entity_id||""}</td></tr>`).join("")||`<tr><td colspan="5">No audit records.</td></tr>`;
}catch(e){alert(e.message);}})();
