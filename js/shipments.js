let allShipments=[], selectedShipment=null;
(async()=>{await guardPage();await loadShipments();})();

async function loadShipments(){
    try{const data=await apiFetch("/shipments?limit=200");allShipments=data.shipments||[];renderShipments(allShipments);}
    catch(e){console.error(e);}
}
function renderShipments(rows){
    const tbody=document.getElementById("shipmentTableBody");
    if(!rows.length){tbody.innerHTML=`<tr><td colspan="7" class="empty-state">No shipments found.</td></tr>`;return;}
    tbody.innerHTML=rows.map(s=>`<tr>
        <td><strong>${escapeHTML(s.tracking_number)}</strong><br><small>${escapeHTML(s.reference_number||"")}</small></td>
        <td>${escapeHTML(s.customer_name||s.sender_name||"-")}</td>
        <td>${escapeHTML(s.origin_country)} → ${escapeHTML(s.destination_country)}</td>
        <td>${escapeHTML(s.service_type||"-")}</td>
        <td><span class="status-badge status-${escapeHTML(s.status)}">${formatStatus(s.status)}</span></td>
        <td>${formatDate(s.created_at)}</td>
        <td><button class="table-button" onclick="viewShipment(${s.id})">View</button>
            <button class="table-button" onclick="openStatusModal(${s.id})">Update</button></td>
    </tr>`).join("");
}
document.getElementById("shipmentForm")?.addEventListener("submit",async e=>{
    e.preventDefault();const b=document.getElementById("createShipmentButton"),m=document.getElementById("shipmentFormMessage");
    b.disabled=true;b.textContent="Creating...";m.textContent="";
    const value=id=>document.getElementById(id)?.value.trim()||"";
    const payload={tracking_id:value("tracking_id"),reference_number:value("reference_number"),sender_name:value("sender_name"),sender_phone:value("sender_phone"),
        sender_address:value("sender_address"),receiver_name:value("receiver_name"),receiver_phone:value("receiver_phone"),receiver_address:value("receiver_address"),
        origin_country:value("origin_country"),destination_country:value("destination_country"),service_type:value("service_type"),package_type:value("package_type"),
        weight:value("weight"),pieces:value("pieces")||1,declared_value:value("declared_value"),currency:value("currency")||"USD",
        shipping_charge:value("shipping_charge"),estimated_delivery:value("estimated_delivery"),description:value("description")};
    try{const data=await apiFetch("/shipments",{method:"POST",body:JSON.stringify(payload)});m.className="form-message success";m.innerHTML=`Shipment created. Tracking: <strong>${escapeHTML(data.shipment.tracking_number)}</strong>`;e.target.reset();await loadShipments();}
    catch(err){m.className="form-message error";m.textContent=err.message;}
    finally{b.disabled=false;b.textContent="Create Shipment";}
});
document.getElementById("openCreateShipment")?.addEventListener("click",()=>document.getElementById("shipmentModal").classList.add("active"));
document.getElementById("closeShipmentModal")?.addEventListener("click",()=>document.getElementById("shipmentModal").classList.remove("active"));
document.getElementById("cancelShipment")?.addEventListener("click",()=>document.getElementById("shipmentModal").classList.remove("active"));

function filterShipments(){
    const q=document.getElementById("searchShipment").value.toLowerCase(),status=document.getElementById("statusFilter").value;
    renderShipments(allShipments.filter(s=>[s.tracking_number,s.reference_number,s.customer_name,s.sender_name,s.receiver_name,s.destination_country].filter(Boolean).join(" ").toLowerCase().includes(q)&&(!status||s.status===status)));
}
document.getElementById("searchShipment")?.addEventListener("input",filterShipments);
document.getElementById("statusFilter")?.addEventListener("change",filterShipments);

window.viewShipment=async id=>{
    try{const d=await apiFetch(`/shipments/${id}`);selectedShipment=d.shipment;showShipmentDetails(d);}
    catch(e){alert(e.message);}
};
function showShipmentDetails(d){
    const s=d.shipment,h=d.tracking_history||[];
    const modal=document.createElement("div");modal.className="modal-overlay active";modal.id="dynamicShipmentModal";
    modal.innerHTML=`<div class="modal wide-modal"><div class="modal-header"><div><span class="page-label">SHIPMENT DETAILS</span><h2>${escapeHTML(s.tracking_number)}</h2></div><button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button></div>
    <div class="detail-grid">
      <div><span>Sender</span><strong>${escapeHTML(s.sender_name)}</strong></div><div><span>Receiver</span><strong>${escapeHTML(s.receiver_name)}</strong></div>
      <div><span>Route</span><strong>${escapeHTML(s.origin_country)} → ${escapeHTML(s.destination_country)}</strong></div><div><span>Service</span><strong>${escapeHTML(s.service_type||"-")}</strong></div>
      <div><span>Weight</span><strong>${s.weight||"-"} KG</strong></div><div><span>Charge</span><strong>${s.currency||"USD"} ${Number(s.shipping_charge||0).toFixed(2)}</strong></div>
      <div><span>Current Location</span><strong>${escapeHTML(s.current_location||"-")}</strong></div><div><span>Status</span><strong>${formatStatus(s.status)}</strong></div>
    </div><h3 class="section-title">Tracking Timeline</h3><div class="timeline">${h.map(e=>`<div class="timeline-item"><strong>${formatStatus(e.status)}</strong><span>${escapeHTML(e.location||"-")} · ${formatDateTime(e.event_time)}</span><p>${escapeHTML(e.description||"")}</p></div>`).join("")||"<p>No tracking events.</p>"}</div></div>`;
    document.body.appendChild(modal);
}
window.openStatusModal=async id=>{
    const s=allShipments.find(x=>x.id===id);if(!s)return;
    const status=prompt(`Update ${s.tracking_number}\nCurrent: ${formatStatus(s.status)}\n\nEnter status: booked, picked_up, departed, in_transit, arrived, customs, out_for_delivery, delivered, exception, cancelled`,s.status);
    if(!status)return;
    const location=prompt("Current location:",s.current_location||"");if(!location)return;
    const description=prompt("Event description:","");
    try{await apiFetch(`/shipments/${id}/tracking-events`,{method:"POST",body:JSON.stringify({status,location,description})});await loadShipments();}
    catch(e){alert(e.message);}
};
