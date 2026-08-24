const $ = (id) => document.getElementById(id);

const fieldMap = {
  equipo:'outEquipo', ram:'outRam', modelo:'outModelo', capacidad:'outCapacidad',
  color:'outColor', serie:'outSerie', condicion:'outCondicion', ubicacion:'outUbicacion',
  responsable:'outResponsable', cargador:'outCargador', mouse:'outMouse', monitor:'outMonitor',
  condicionesEntrega:'outCondicionesEntrega', entrega:'outEntrega', areaEntrega:'outAreaEntrega'
};

function capitalizeWords(value){
  return value.toLocaleLowerCase('es-MX').replace(/(^|\s)([a-záéíóúñü])/g,(m,s,c)=>s+c.toLocaleUpperCase('es-MX'));
}

function formatDate(dateValue, city){
  if(!dateValue) return city || 'Ciudad de México';
  const date = new Date(`${dateValue}T12:00:00`);
  const text = new Intl.DateTimeFormat('es-MX',{
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  }).format(date);
  return `${capitalizeWords(text)}, ${city || 'Ciudad de México'}.`;
}

function syncPreview(){
  Object.entries(fieldMap).forEach(([inputId,outId])=>{
    const input=$(inputId), out=$(outId);
    if(input && out) out.textContent=input.value.trim() || '—';
  });
  $('outResponsableFirma').textContent=$('responsable').value.trim() || '—';
  $('outFecha').textContent=formatDate($('fecha').value,$('ciudad').value.trim());
}

function setToday(){
  if(!$('fecha').value){
    const now=new Date();
    const local=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    $('fecha').value=local;
  }
}

async function loadSidebar(){
  const container=$('sidebar-container');
  if(!container) return;
  try{
    const response=await fetch('../includes/sidebar.html');
    if(!response.ok) throw new Error('No se pudo cargar el sidebar');
    container.innerHTML=await response.text();
    const current=document.querySelector('[data-page="responsivas"]');
    if(current) current.classList.add('active');

    if(window.initSidebar) window.initSidebar();
  }catch(error){
    console.warn(error);
    container.style.display='none';
  }
}

function loadSession(){
  try{
    const session=JSON.parse(localStorage.getItem('newsroomSession')||'null');
    if(!session) return;
    const name=session.nombre || session.usuario || session.email || 'Usuario';
    $('userName').textContent=name;
    $('userAvatar').textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'U';
    const roles={1:'Administrador',2:'Soporte',3:'Usuario',4:'Rooms Admin'};
    $('userRole').textContent=roles[session.rol_id] || 'Newsroom Portal';
  }catch(e){ console.warn('Sesión no disponible',e); }
}

function clearForm(){
  document.querySelectorAll('#responsivaForm input').forEach(input=>input.value='');
  setToday();
  $('ciudad').value='Ciudad de México';
  syncPreview();
}

function generatePdf(){
  const element=$('responsivaPdf');
  if(typeof html2pdf==='undefined'){
    alert('No fue posible cargar el generador de PDF. Usa el botón Imprimir y selecciona “Guardar como PDF”.');
    return;
  }
  const name=($('responsable').value.trim() || 'responsiva').replace(/[^a-z0-9áéíóúñü _-]/gi,'').replace(/\s+/g,'_');
  const options={
    margin:0,
    filename:`Responsiva_${name}.pdf`,
    image:{type:'jpeg',quality:0.98},
    html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
  };
  html2pdf().set(options).from(element).save();
}

document.addEventListener('DOMContentLoaded',()=>{
  loadSidebar();
  loadSession();
  setToday();
  syncPreview();
  document.querySelectorAll('#responsivaForm input').forEach(input=>input.addEventListener('input',syncPreview));
  $('btnLimpiar').addEventListener('click',clearForm);
  $('btnImprimir').addEventListener('click',()=>window.print());
  $('btnPdf').addEventListener('click',generatePdf);
});
