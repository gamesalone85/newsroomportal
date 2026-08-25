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

async function generatePdf(){
  const element=$('responsivaPdf');

  if(typeof html2canvas==='undefined' || !window.jspdf?.jsPDF){
    alert('No fue posible cargar el generador de PDF. Usa el botón Imprimir y selecciona “Guardar como PDF”.');
    return;
  }

  const btn=$('btnPdf');
  const originalText=btn.innerHTML;
  btn.disabled=true;
  btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Generando...';

  try{
    // Espera a que el logo y demás imágenes estén completamente cargados.
    const images=[...element.querySelectorAll('img')];
    await Promise.all(images.map(img=>{
      if(img.complete) return Promise.resolve();
      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    }));

    const canvas=await html2canvas(element,{
      scale:2,
      useCORS:true,
      allowTaint:false,
      backgroundColor:'#ffffff',
      logging:false,
      scrollX:0,
      scrollY:0,
      windowWidth:element.scrollWidth,
      windowHeight:element.scrollHeight
    });

    const { jsPDF }=window.jspdf;
    const pdf=new jsPDF({
      orientation:'portrait',
      unit:'mm',
      format:'letter',
      compress:true
    });

    const pageWidth=215.9;
    const pageHeight=279.4;
    const imgData=canvas.toDataURL('image/jpeg',0.98);

    // Inserta la vista completa como UNA sola imagen, exactamente en una hoja Carta.
    // Así evitamos que html2pdf divida el documento en dos páginas.
    pdf.addImage(imgData,'JPEG',0,0,pageWidth,pageHeight,undefined,'FAST');

    const name=($('responsable').value.trim() || 'responsiva')
      .replace(/[^a-z0-9áéíóúñü _-]/gi,'')
      .replace(/\s+/g,'_');

    pdf.save(`Responsiva_${name}.pdf`);
  }catch(error){
    console.error(error);
    alert('Ocurrió un error al generar el PDF. Prueba con el botón Imprimir y selecciona “Guardar como PDF”.');
  }finally{
    btn.disabled=false;
    btn.innerHTML=originalText;
  }
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
