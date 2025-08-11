/* Carteira Atlas Analítica — localStorage + preços do Apps Script */
const API_URL = 'https://script.google.com/macros/s/AKfycbwppWofot1medHug0CamlUoZ2yS7o6p_pPGG_PlKBOv4YwBZYLFe61IW4qiTpfrNpLAUg/exec';
const KEY = 'atlas.carteira.v1';
const fmt = new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct = (n)=> (isFinite(n)? fmt.format(n*100)+'%':'—');
const money = (n)=> 'R$ '+fmt.format(+n||0);
const by = (k)=> (a,b)=> (a[k]||'').localeCompare(b[k]||'');

let carteira = [];       // [{ticker, empresa?, setor?, qtd, pm}]
let precoMap = {};       // {TICKER: {Preco, Empresa, Setor, DY}}
let PIE1, PIE2;

const $ = (s,p=document)=> p.querySelector(s);
const tbody = $('#tbl tbody');

function load(){ try{ carteira = JSON.parse(localStorage.getItem(KEY)||'[]'); }catch{ carteira=[]; } }
function save(){ localStorage.setItem(KEY, JSON.stringify(carteira)); }

async function fetchPrecos(){
  if(!$('#autoPrice').checked) return;
  try{
    const res = await fetch(API_URL+'?t='+(+new Date()));
    const json = await res.json();
    const rows = Array.isArray(json.data)? json.data : [];
    precoMap = {};
    rows.forEach(r=>{
      const t = (r.Ticker||'').trim().toUpperCase();
      if(!t) return;
      precoMap[t] = { Preco:+r.Preco||0, Empresa:r.Empresa||'', Setor:r.Setor||'', DY:(+r.DY||0)/100 };
    });
    $('#lastSync').textContent = 'Atualizado agora';
  }catch(e){
    console.error(e);
    $('#lastSync').textContent = 'Falha ao atualizar';
  }
}

function kpis(rows){
  const custo = rows.reduce((s,r)=> s + r.qtd*r.pm, 0);
  const valor = rows.reduce((s,r)=> s + r.valor, 0);
  const pl = valor - custo;
  const ret = custo>0 ? (valor/custo - 1) : 0;
  const dyEst = rows.reduce((s,r)=> s + (precoMap[r.ticker]?.DY||0) * r.valor, 0) / (valor||1);

  $('#kPatrimonio').textContent = money(valor);
  $('#kPL').innerHTML = `<span class="${pl>=0?'gain':'loss'}">${money(pl)}</span>`;
  $('#kRet').innerHTML = `<span class="${ret>=0?'gain':'loss'}">${fmt.format(ret*100)}%</span>`;
  $('#kDY').textContent = fmt.format(dyEst*100)+'%';

  $('#tCusto').textContent = money(custo);
  $('#tValor').textContent = money(valor);
  $('#tPL').innerHTML = `<span class="${pl>=0?'gain':'loss'}">${money(pl)}</span>`;
}

function render(){
  const q = ($('#q').value||'').toLowerCase();
  const rows = carteira
    .map(it=>{
      const t = it.ticker.toUpperCase();
      const p = precoMap[t]?.Preco ?? 0;
      const empresa = it.empresa || precoMap[t]?.Empresa || '';
      const setor = it.setor || precoMap[t]?.Setor || '';
      const valor = it.qtd * p;
      const custo = it.qtd * it.pm;
      const pl = valor - custo;
      return {...it, ticker:t, empresa, setor, preco:p, valor, custo, pl};
    })
    .filter(r=> !q || r.ticker.toLowerCase().includes(q) || (r.empresa||'').toLowerCase().includes(q))
    .sort(by('ticker'));

  // totais
  const totalValor = rows.reduce((s,r)=>s+r.valor,0);
  kpis(rows);

  // tabela
  tbody.innerHTML = rows.map(r=>{
    const pctCar = totalValor>0 ? r.valor/totalValor : 0;
    const plCls = r.pl>=0?'gain':'loss';
    return `<tr>
      <td>${r.ticker}</td>
      <td>${r.empresa||'-'}</td>
      <td>${r.setor||'-'}</td>
      <td class="num">${fmt.format(r.qtd)}</td>
      <td class="num">${money(r.pm)}</td>
      <td class="num">${money(r.custo)}</td>
      <td class="num">${money(r.preco)}</td>
      <td class="num">${money(r.valor)}</td>
      <td class="num ${plCls}">${money(r.pl)} (${fmt.format((r.valor/(r.custo||1)-1)*100)}%)</td>
      <td class="num">${fmt.format(pctCar*100)}%</td>
      <td>
        <button onclick="edit('${r.ticker}')">✎</button>
        <button onclick="removeTicker('${r.ticker}')">🗑</button>
      </td>
    </tr>`;
  }).join('');

  // gráficos
  drawPies(rows);
}

function drawPies(rows){
  const ctx1 = $('#pieAtivos');
  const ctx2 = $('#pieSetores');
  const total = rows.reduce((s,r)=>s+r.valor,0)||1;

  const byTicker = rows.map(r=>({label:r.ticker, val:r.valor}));
  const mapSetor = {};
  rows.forEach(r=> mapSetor[r.setor||'—'] = (mapSetor[r.setor||'—']||0)+r.valor);
  const bySetor = Object.entries(mapSetor).map(([label,val])=>({label,val}));

  if(PIE1) PIE1.destroy();
  if(PIE2) PIE2.destroy();
  PIE1 = new Chart(ctx1,{type:'pie',data:{labels:byTicker.map(x=>x.label),datasets:[{data:byTicker.map(x=>x.val)}]}});
  PIE2 = new Chart(ctx2,{type:'pie',data:{labels:bySetor.map(x=>x.label),datasets:[{data:bySetor.map(x=>x.val)}]}});
}

// CRUD
const dlg = $('#dlg');
const fTicker = $('#fTicker'), fEmpresa=$('#fEmpresa'), fSetor=$('#fSetor'), fQtd=$('#fQtd'), fPM=$('#fPM');
let editing = null;

function openModal(title){ $('#dlgTitle').textContent=title; dlg.showModal(); }
function closeModal(){ dlg.close(); }

$('#btnAdd').addEventListener('click', ()=>{
  editing = null;
  fTicker.value=''; fEmpresa.value=''; fSetor.value=''; fQtd.value='0'; fPM.value='0';
  openModal('Adicionar ativo');
});

$('#btnSave').addEventListener('click', (e)=>{
  e.preventDefault();
  const item = {
    ticker: (fTicker.value||'').trim().toUpperCase(),
    empresa: (fEmpresa.value||'').trim(),
    setor: (fSetor.value||'').trim(),
    qtd: +fQtd.value || 0,
    pm: +fPM.value || 0
  };
  if(!item.ticker){ return; }
  const i = carteira.findIndex(x=>x.ticker===item.ticker);
  if(i>=0 && editing===item.ticker) carteira[i]=item;
  else if(i>=0 && editing===null) carteira[i]={...carteira[i], qtd:carteira[i].qtd+item.qtd, pm:item.pm};
  else carteira.push(item);
  save(); closeModal(); render();
});

window.edit = (ticker)=>{
  const it = carteira.find(x=>x.ticker===ticker);
  if(!it) return;
  editing = ticker;
  fTicker.value=it.ticker; fEmpresa.value=it.empresa||''; fSetor.value=it.setor||'';
  fQtd.value=it.qtd; fPM.value=it.pm;
  openModal('Editar ativo');
};

window.removeTicker = (ticker)=>{
  if(!confirm(`Remover ${ticker} da carteira?`)) return;
  carteira = carteira.filter(x=>x.ticker!==ticker);
  save(); render();
};

// Import/Export
$('#btnExport').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(carteira,null,2)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'carteira-atlas.json';
  a.click();
});

$('#btnImport').addEventListener('click', ()=>{
  const inp = document.createElement('input');
  inp.type='file'; inp.accept='application/json';
  inp.onchange = async ()=>{
    const f = inp.files[0]; if(!f) return;
    const text = await f.text();
    try{
      const data = JSON.parse(text);
      if(Array.isArray(data)){ carteira = data; save(); render(); }
      else alert('Arquivo inválido.');
    }catch{ alert('Erro ao ler arquivo.'); }
  };
  inp.click();
});

// Busca
$('#q').addEventListener('input', render);

// Ciclo
async function boot(){
  load();
  await fetchPrecos();
  render();
  setInterval(async ()=>{
    if($('#autoPrice').checked){
      await fetchPrecos(); render();
    }
  }, 30000);
}
boot();
