// Lógica mínima para o fluxo de Caderneta de Saúde
// Ajuste número de modelos e nomes das imagens conforme sua pasta /images/menino e /images/menina

const state = {
  sexo: null, // 'menino' | 'menina'
  modelo: null, // ex: 'MODELO12'
  tipo: null, // 'NOVA' | 'REFORMA'
  encadernacao: null, // 'WIRE-O' | 'ESPIRAL'
  extras: { cartao_sus:false, foto_verso:false, tag_bolinha:false },
  dados: {}
};

const precos = {
  NOVA: { 'WIRE-O': 60.00, 'ESPIRAL': 50.00 },
  REFORMA: { 'WIRE-O': 50.00, 'ESPIRAL': 40.00 },
  extras: { cartao_sus:5.00, foto_verso:5.00, tag_bolinha:5.00 }
};

// --- Funções utilitárias
function q(sel){return document.querySelector(sel)}
function qs(sel){return Array.from(document.querySelectorAll(sel))}

// --- MONTAGEM básica da página (se existir elementos)
document.addEventListener('DOMContentLoaded', ()=>{
  if(!document.body.classList.contains('caderneta')) return;
  initCaderneta();
});

function initCaderneta(){
  renderSexoCard();
  updateProgress();
  attachGlobalHandlers();
}

// Globals
function attachGlobalHandlers(){
  // Handler para botões dinamicamente criados são adicionados nos renderizadores
}

function updateProgress(){
  const steps = ['sexo','caderneta','modelo','preencher','resumo'];
  const wrap = q('#progress');
  wrap.innerHTML = '';
  steps.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'step';
    if(
      (s==='sexo' && state.sexo) ||
      (s==='modelo' && state.modelo) ||
      (s==='preencher' && state.dados && Object.keys(state.dados).length>0) ||
      (s==='resumo' && state.sent)
    ){
      el.classList.add('done');
    }
    el.textContent = s.toUpperCase();
    wrap.appendChild(el);
  });
}

// RENDER SEXO
function renderSexoCard(){
  const root = q('#flow');
  root.innerHTML = `
    <div class="card jcard">
      <div class="question">Qual o sexo do bebê?</div>
      <div class="btn-row center">
        <button class="btn" data-sexo="menino">👦 MENINO</button>
        <button class="btn" data-sexo="menina">👧 MENINA</button>
      </div>
    </div>
  `;
  qs('[data-sexo]').forEach(b=>{
    b.addEventListener('click', ev=>{
      state.sexo = b.dataset.sexo;
      renderCatalogo();
      updateProgress();
    });
  });
}

// RENDER CATÁLOGO (carrega imagens da pasta /images/{sexo})
function renderCatalogo(){
  const root = q('#flow');
  root.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'card';
  title.innerHTML = `<strong>Escolha o modelo (${state.sexo})</strong>`;
  root.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';
  // Aqui assumimos que você colocou algumas imagens conhecidas — liste algumas para demo
  // Em produção, você pode gerar a lista de imagens via JSON ou backend.
  const demoModels = ['MODELO12','MODELO13','MODELO14','MODELO15'];
  demoModels.forEach(m=>{
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    const imgPath = `images/${state.sexo}/${m}.jpg`;
    thumb.innerHTML = `<img src="${imgPath}" alt="${m}"><div class="small-muted">${m}</div>`;
    thumb.addEventListener('click', ()=> {
      state.modelo = m;
      renderNovaReforma();
      updateProgress();
    });
    grid.appendChild(thumb);
  });
  root.appendChild(grid);
}

// RENDER NOVA / REFORMA
function renderNovaReforma(){
  const root = q('#flow');
  root.innerHTML = `
    <div class="card jcard">
      <div class="question">A caderneta será...</div>
      <div class="btn-row center">
        <button class="btn" data-tipo="NOVA">NOVA</button>
        <button class="btn" data-tipo="REFORMA">REFORMA <div class="small-muted" style="font-style:italic"> (Colocar a capa na que tenho)</div></button>
      </div>
    </div>
  `;
  qs('[data-tipo]').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.tipo = b.dataset.tipo;
      renderEncadernacao();
      updateProgress();
    });
  });
}

// RENDER ENCADENAÇÃO (mostra as duas fotos: MODELOxxE e MODELOxxW)
function renderEncadernacao(){
  const root = q('#flow');
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card jcard';
  card.innerHTML = `<div class="question">Qual o modo de encadernação?</div>`;
  const row = document.createElement('div'); row.className = 'btn-row';
  const modelo = state.modelo;
  const imgE = `images/${state.sexo}/${modelo}E.jpg`;
  const imgW = `images/${state.sexo}/${modelo}W.jpg`;

  const btnE = document.createElement('div');
  btnE.className = 'thumb';
  btnE.innerHTML = `<img src="${imgE}" alt="espiral"><div class="small-muted">ESPIRAL<br>R$ ${precos[state.tipo]['ESPIRAL'].toFixed(2)}</div>`;
  btnE.addEventListener('click', ()=>{
    state.encadernacao = 'ESPIRAL';
    renderForm();
    updateProgress();
  });

  const btnW = document.createElement('div');
  btnW.className = 'thumb';
  btnW.innerHTML = `<img src="${imgW}" alt="wireo"><div class="small-muted">WIRE-O<br>R$ ${precos[state.tipo]['WIRE-O'].toFixed(2)}</div>`;
  btnW.addEventListener('click', ()=>{
    state.encadernacao = 'WIRE-O';
    renderForm();
    updateProgress();
  });

  row.appendChild(btnW);
  row.appendChild(btnE);
  card.appendChild(row);
  root.appendChild(card);
}

// RENDER FORMULÁRIO COMPLETO
function renderForm(){
  const root = q('#flow');
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>Modelo:</strong> ${state.modelo} • <strong>${state.tipo}</strong> • <strong>${state.encadernacao}</strong>
      </div>
      <div class="small-muted">Preço base: R$ ${precos[state.tipo][state.encadernacao].toFixed(2)}</div>
    </div>
    <hr style="margin:12px 0">
    <form id="pedidoForm">
      <div class="question">Dados para entrega</div>
      <div class="form-row">
        <input name="nome_capa" placeholder="NOME PARA CAPA" required>
        <input name="nome_cliente" placeholder="NOME DO CLIENTE" required>
        <input name="rua" placeholder="RUA" required>
        <input name="numero" placeholder="NÚMERO" required>
        <input name="bairro" placeholder="BAIRRO" required>
        <input name="cidade" placeholder="CIDADE" required>
        <input name="perimetro" placeholder="PERÍMETRO (entre as ruas...)" >
        <input name="ref" placeholder="PONTO DE REFERÊNCIA" >
        <input name="cor_casa" placeholder="COR DA CASA OU MURO" >
      </div>

      <hr style="margin:12px 0">
      <div class="question">Dados da criança</div>
      <div class="form-row">
        <input name="nome_crianca" placeholder="NOME COMPLETO DA CRIANÇA" required>
        <input name="data_nasc" type="date" placeholder="DATA DE NASCIMENTO">
        <input name="hora_nasc" type="time" placeholder="HORÁRIO DE NASCIMENTO">
        <input name="peso" placeholder="PESO DO RECÉM NASCIDO">
        <input name="tamanho" placeholder="TAMANHO DO RECÉM NASCIDO">
        <input name="maternidade" placeholder="MATERNIDADE">
        <input name="nome_mae" placeholder="NOME DA MÃE">
        <input name="nome_pai" placeholder="NOME DO PAI">
      </div>

      <hr style="margin:12px 0">
      <div class="question">Adicionais (cada +R$5,00)</div>
      <label><input type="checkbox" name="extra_cartao"> CARTÃO DO SUS +R$ 5,00</label><br>
      <label><input type="checkbox" name="extra_foto"> FOTO NO VERSO DA CAPA +R$ 5,00</label><br>
      <label><input type="checkbox" name="extra_tag"> TAG BOLINHA +R$ 5,00</label>

      <div class="summary" style="margin-top:12px">
        <div class="total"><span>Valor total</span><span id="valorTotal">R$ 0.00</span></div>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
          <button type="button" id="btnResumo" class="btn primary">Prosseguir / Ver Resumo</button>
        </div>
      </div>
    </form>
  `;
  root.appendChild(card);

  // calcular total inicial
  calcularTotal();

  // eventos
  q('#pedidoForm').addEventListener('change', calcularTotal);
  q('#btnResumo').addEventListener('click', mostrarResumo);
}

function calcularTotal(){
  let total = 0.0;
  total = precos[state.tipo][state.encadernacao];
  const form = q('#pedidoForm');
  if(!form) return;
  const extrasChecked = {
    cartao: form.querySelector('[name="extra_cartao"]').checked,
    foto: form.querySelector('[name="extra_foto"]').checked,
    tag: form.querySelector('[name="extra_tag"]').checked
  };
  if(extrasChecked.cartao) total += precos.extras.cartao_sus;
  if(extrasChecked.foto) total += precos.extras.foto_verso;
  if(extrasChecked.tag) total += precos.extras.tag_bolinha;
  q('#valorTotal').textContent = 'R$ ' + total.toFixed(2);

  // save extras to state
  state.extras.cartao_sus = extrasChecked.cartao;
  state.extras.foto_verso = extrasChecked.foto;
  state.extras.tag_bolinha = extrasChecked.tag;
}

function mostrarResumo(){
  const form = q('#pedidoForm');
  if(!form) return;
  const data = Object.fromEntries(new FormData(form).entries());
  state.dados = data;
  renderResumo();
  updateProgress();
}

function renderResumo(){
  const root = q('#flow');
  root.innerHTML = '';
  const sumCard = document.createElement('div');
  sumCard.className = 'card';
  const total = q('#valorTotal') ? q('#valorTotal').textContent : 'R$ 0.00';
  sumCard.innerHTML = `
    <div><strong>Resumo do Pedido</strong></div>
    <div style="margin-top:8px">
      <div><strong>Modelo:</strong> ${state.modelo}</div>
      <div><strong>Tipo:</strong> ${state.tipo}</div>
      <div><strong>Encadernação:</strong> ${state.encadernacao}</div>
    </div>
    <hr>
    <div><strong>Dados para entrega</strong></div>
    <pre class="small-muted">${JSON.stringify(state.dados, null, 2)}</pre>
    <div class="summary" style="margin-top:8px">
      <div class="total"><span>Total</span><span id="finalTotal">${total}</span></div>
      <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
        <button id="btnWhats" class="btn primary">SOLICITAR PEDIDO VIA WHATSAPP</button>
      </div>
    </div>
  `;
  root.appendChild(sumCard);

  q('#btnWhats').addEventListener('click', ()=>{
    abrirWhatsApp();
  });
}

function abrirWhatsApp(){
  // compõe a mensagem curta com os dados e abre URL
  const numero = '5593991747367'; // sem + e zeros
  let mensagem = `Pedido%20-%20Caderneta%0A`;
  mensagem += `Modelo:%20${encodeURIComponent(state.modelo)}%0A`;
  mensagem += `Tipo:%20${encodeURIComponent(state.tipo)}%0A`;
  mensagem += `Encadernação:%20${encodeURIComponent(state.encadernacao)}%0A`;
  mensagem += `Extras:%20${state.extras.cartao_sus ? 'Cartão SUS,' : ''}${state.extras.foto_verso ? ' Foto Verso,' : ''}${state.extras.tag_bolinha ? ' Tag,' : ''}%0A`;
  mensagem += `Total:%20${q('#valorTotal') ? q('#valorTotal').textContent : ''}%0A%0A`;
  mensagem += `Dados:%0A${encodeURIComponent(JSON.stringify(state.dados, null, 2))}`;
  const url = `https://wa.me/${numero}?text=${mensagem}`;
  window.open(url, '_blank');
}
