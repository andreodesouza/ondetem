/* ============================================
   BeautyGlow — app.js
   Lógica completa: agenda, dados, gráficos,
   modais, configurações, localStorage
   Framework: Vanilla JS + Chart.js (via CDN)
   ============================================ */

/* ==========================================
   DADOS INICIAIS
   ========================================== */
const SERVICOS_PRECOS = {
  'Manicure + Pedicure': 80,
  'Corte + Escova': 120,
  'Progressiva': 220,
  'Design de sobrancelha': 60,
  'Limpeza de pele': 150,
  'Coloração': 180
};

const HORARIOS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

// Dados de agendamentos (persistidos no localStorage)
function dadosIniciais() {
  const hoje = new Date();
  const d = (offset) => {
    const dt = new Date(hoje);
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };
  return [
    { id: 1, nome: 'Carla Mendes',    data: d(0),  hora: '09:00', servico: 'Manicure + Pedicure',    profissional: 'Lia',    status: 'pago' },
    { id: 2, nome: 'Fernanda Lima',   data: d(0),  hora: '10:00', servico: 'Corte + Escova',         profissional: 'Amanda', status: 'pago' },
    { id: 3, nome: 'Juliana Costa',   data: d(0),  hora: '13:00', servico: 'Design de sobrancelha',  profissional: 'Lia',    status: 'aguardando' },
    { id: 4, nome: 'Patrícia Alves',  data: d(0),  hora: '15:00', servico: 'Progressiva',            profissional: 'Amanda', status: 'pago' },
    { id: 5, nome: 'Renata Souza',    data: d(0),  hora: '17:00', servico: 'Limpeza de pele',        profissional: 'Carol',  status: 'cancelado' },
    { id: 6, nome: 'Sandra Lima',     data: d(1),  hora: '09:00', servico: 'Coloração',              profissional: 'Amanda', status: 'pago' },
    { id: 7, nome: 'Ana Paula',       data: d(1),  hora: '14:00', servico: 'Corte + Escova',         profissional: 'Carol',  status: 'aguardando' },
    { id: 8, nome: 'Bruna Costa',     data: d(2),  hora: '10:00', servico: 'Progressiva',            profissional: 'Amanda', status: 'pago' },
    { id: 9, nome: 'Cláudia Reis',    data: d(2),  hora: '11:00', servico: 'Manicure + Pedicure',    profissional: 'Lia',    status: 'pago' },
    { id: 10, nome: 'Lara Nunes',     data: d(3),  hora: '09:00', servico: 'Corte + Escova',         profissional: 'Carol',  status: 'concluido' },
    { id: 11, nome: 'Tatiana Rocha',  data: d(3),  hora: '15:00', servico: 'Design de sobrancelha',  profissional: 'Lia',    status: 'pago' },
    { id: 12, nome: 'Kelly Dias',     data: d(-1), hora: '10:00', servico: 'Manicure + Pedicure',    profissional: 'Lia',    status: 'concluido' },
    { id: 13, nome: 'Marta Almeida',  data: d(-1), hora: '14:00', servico: 'Limpeza de pele',        profissional: 'Carol',  status: 'concluido' },
    { id: 14, nome: 'Rosa Ferreira',  data: d(-2), hora: '09:00', servico: 'Progressiva',            profissional: 'Amanda', status: 'cancelado' },
    { id: 15, nome: 'Julia Santos',   data: d(-2), hora: '11:00', servico: 'Design de sobrancelha',  profissional: 'Lia',    status: 'concluido' },
    { id: 16, nome: 'Marcos Oliveira',data: d(4),  hora: '09:00', servico: 'Corte + Escova',         profissional: 'Amanda', status: 'pago' },
    { id: 17, nome: 'Paula Faria',    data: d(5),  hora: '13:00', servico: 'Coloração',              profissional: 'Carol',  status: 'aguardando' },
    { id: 18, nome: 'Débora Melo',    data: d(-3), hora: '10:00', servico: 'Progressiva',            profissional: 'Amanda', status: 'cancelado' },
  ];
}

/* ==========================================
   ESTADO GLOBAL
   ========================================== */
let agendamentos = [];
let semanaOffset = 0;
let agendamentoSelecionadoId = null;
let graficos = {};

/* ==========================================
   PERSISTÊNCIA (localStorage)
   ========================================== */
function carregarDados() {
  const salvo = localStorage.getItem('beautyglow_agendamentos');
  if (salvo) {
    try { agendamentos = JSON.parse(salvo); }
    catch { agendamentos = dadosIniciais(); }
  } else {
    agendamentos = dadosIniciais();
    salvarDados();
  }
}

function salvarDados() {
  localStorage.setItem('beautyglow_agendamentos', JSON.stringify(agendamentos));
}

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  renderDashboard();
  renderAgenda();
  renderRelatorios();
  // Define data mínima como hoje no input de novo agendamento
  const dataInput = document.getElementById('novo-data');
  if (dataInput) dataInput.min = new Date().toISOString().split('T')[0];
});

/* ==========================================
   NAVEGAÇÃO
   ========================================== */
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  btn.classList.add('active');

  const titulos = {
    dashboard:     ['Visão geral',    'Abril 2026'],
    agenda:        ['Agenda',         semanaLabel()],
    relatorios:    ['Relatórios',     '2026'],
    configuracoes: ['Configurações',  'Estabelecimento']
  };
  document.getElementById('page-title').textContent = titulos[id][0];
  document.getElementById('page-sub').textContent   = titulos[id][1];

  if (id === 'relatorios') renderRelatorios();
  if (id === 'agenda')     renderAgenda();
}

/* ==========================================
   UTILS
   ========================================== */
function formatarBRL(val) {
  return 'R$' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 0 });
}

function preco(servico) {
  return SERVICOS_PRECOS[servico] || 0;
}

function statusLabel(s) {
  const m = { pago: '50% pago', aguardando: 'Aguardando', cancelado: 'Cancelado', concluido: 'Concluído' };
  return m[s] || s;
}

function statusClass(s) {
  const m = { pago: 'badge-pago', aguardando: 'badge-aguardando', cancelado: 'badge-cancelado', concluido: 'badge-concluido' };
  return m[s] || '';
}

function dotClass(s) {
  const m = { pago: 'dot-pago', aguardando: 'dot-aguardando', cancelado: 'dot-cancelado', concluido: 'dot-concluido' };
  return m[s] || '';
}

function blockClass(s) {
  const m = { pago: 'block-pago', aguardando: 'block-aguardando', cancelado: 'block-cancelado', concluido: 'block-concluido' };
  return m[s] || 'block-pago';
}

function gerarId() {
  return Math.max(0, ...agendamentos.map(a => a.id)) + 1;
}

function mostrarToast(msg, tipo = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + tipo;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function dataHoje() {
  return new Date().toISOString().split('T')[0];
}

/* ==========================================
   DASHBOARD
   ========================================== */
function renderDashboard() {
  renderMetricas();
  renderListaHoje();
  renderBarrasServicos();
}

function renderMetricas() {
  const hoje = dataHoje();
  const ativos = agendamentos.filter(a => a.status !== 'cancelado');
  const cancelados = agendamentos.filter(a => a.status === 'cancelado');
  const receita = ativos.reduce((s, a) => s + preco(a.servico), 0);
  const antecipacoes = ativos.filter(a => a.status === 'pago' || a.status === 'aguardando')
                             .reduce((s, a) => s + preco(a.servico) * 0.5, 0);
  const multasRetidas = cancelados.reduce((s, a) => s + preco(a.servico) * 0.5, 0);

  const dados = [
    { label: 'Agendamentos (mês)', valor: agendamentos.length, change: '▲ 12% vs mês anterior', up: true },
    { label: 'Receita total',      valor: formatarBRL(receita),  change: '▲ 8% vs mês anterior',   up: true },
    { label: 'Antecipações (50%)', valor: formatarBRL(antecipacoes), change: 'garantido no caixa', up: true },
    { label: 'Cancelamentos',      valor: cancelados.length, change: `multas: ${formatarBRL(multasRetidas)}`, up: false },
  ];

  const c = document.getElementById('metricas-container');
  c.innerHTML = dados.map(d => `
    <div class="metric-card">
      <div class="metric-label">${d.label}</div>
      <div class="metric-value">${d.valor}</div>
      <div class="metric-change ${d.up ? 'up' : 'down'}">${d.change}</div>
    </div>
  `).join('');
}

function renderListaHoje() {
  const hoje = dataHoje();
  const deHoje = agendamentos
    .filter(a => a.data === hoje)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const cont = document.getElementById('lista-hoje');
  const badge = document.getElementById('count-hoje');
  badge.textContent = deHoje.length + ' hoje';

  if (deHoje.length === 0) {
    cont.innerHTML = '<div class="empty-state">Nenhum agendamento para hoje.</div>';
    return;
  }

  cont.innerHTML = deHoje.map(a => `
    <div class="appt-item" onclick="abrirDetalhe(${a.id})">
      <span class="appt-time">${a.hora}</span>
      <span class="appt-dot ${dotClass(a.status)}"></span>
      <div class="appt-info">
        <div class="appt-name">${a.nome}</div>
        <div class="appt-service">${a.servico} · ${a.profissional}</div>
      </div>
      <span class="appt-badge ${statusClass(a.status)}">${statusLabel(a.status)}</span>
    </div>
  `).join('');
}

function renderBarrasServicos() {
  const ativos = agendamentos.filter(a => a.status !== 'cancelado');
  const totais = {};
  ativos.forEach(a => {
    totais[a.servico] = (totais[a.servico] || 0) + preco(a.servico);
  });
  const ordenado = Object.entries(totais).sort((a, b) => b[1] - a[1]);
  const max = ordenado.length ? ordenado[0][1] : 1;

  const cancelados = agendamentos.filter(a => a.status === 'cancelado');
  const multas = cancelados.reduce((s, a) => s + preco(a.servico) * 0.5, 0);
  document.getElementById('total-cancelamentos').textContent = cancelados.length;
  document.getElementById('multas-label').textContent = `multa: ${formatarBRL(multas)}`;

  const cont = document.getElementById('barras-servicos');
  if (!ordenado.length) { cont.innerHTML = '<div class="empty-state">Sem dados.</div>'; return; }
  cont.innerHTML = ordenado.slice(0, 6).map(([serv, val]) => `
    <div class="rev-row">
      <div class="rev-label">${serv.split(' ')[0]}</div>
      <div class="rev-track"><div class="rev-fill" style="width:${Math.round(val/max*100)}%"></div></div>
      <div class="rev-val">${formatarBRL(val)}</div>
    </div>
  `).join('');
}

/* ==========================================
   FILTRO DE BUSCA
   ========================================== */
function filtrarAgendamentos() {
  const q = document.getElementById('busca-cliente').value.toLowerCase();
  if (!q) { renderListaHoje(); return; }

  const filtrados = agendamentos.filter(a => a.nome.toLowerCase().includes(q));
  const cont = document.getElementById('lista-hoje');
  if (!filtrados.length) { cont.innerHTML = '<div class="empty-state">Nenhuma cliente encontrada.</div>'; return; }

  cont.innerHTML = filtrados.slice(0, 8).map(a => `
    <div class="appt-item" onclick="abrirDetalhe(${a.id})">
      <span class="appt-time">${a.hora}</span>
      <span class="appt-dot ${dotClass(a.status)}"></span>
      <div class="appt-info">
        <div class="appt-name">${a.nome}</div>
        <div class="appt-service">${a.data} · ${a.servico} · ${a.profissional}</div>
      </div>
      <span class="appt-badge ${statusClass(a.status)}">${statusLabel(a.status)}</span>
    </div>
  `).join('');
}

/* ==========================================
   AGENDA (CALENDÁRIO SEMANAL)
   ========================================== */
function getLunesDaSemana(offset) {
  const hoje = new Date();
  const dow = hoje.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const seg = new Date(hoje);
  seg.setDate(seg.getDate() + diff + offset * 7);
  return seg;
}

function semanaLabel() {
  const seg = getLunesDaSemana(semanaOffset);
  const dom = new Date(seg); dom.setDate(dom.getDate() + 6);
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `${fmt(seg)} – ${fmt(dom)} ${dom.getFullYear()}`;
}

function navegarSemana(dir) {
  semanaOffset += dir;
  renderAgenda();
}

function irParaHoje() {
  semanaOffset = 0;
  renderAgenda();
}

function renderAgenda() {
  const label = document.getElementById('semana-label');
  if (label) label.textContent = semanaLabel();

  const filtroProf = document.getElementById('filtro-profissional')?.value || '';
  const seg = getLunesDaSemana(semanaOffset);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg); d.setDate(d.getDate() + i);
    return d;
  });
  const hoje = dataHoje();
  const nomeDia = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  const grid = document.getElementById('calendario');
  if (!grid) return;

  let html = '';

  // Cabeçalho
  html += '<div class="cal-header-empty"></div>';
  dias.forEach((d, i) => {
    const iso = d.toISOString().split('T')[0];
    const isHoje = iso === hoje;
    html += `<div class="cal-header">
      <div class="cal-day-name">${nomeDia[i]}</div>
      <div class="cal-day-num ${isHoje ? 'today' : ''}">${d.getDate()}</div>
    </div>`;
  });

  // Linhas de horário
  HORARIOS.forEach(hora => {
    html += `<div class="time-label">${hora}</div>`;
    dias.forEach(d => {
      const iso = d.toISOString().split('T')[0];
      const agend = agendamentos.find(a =>
        a.data === iso && a.hora === hora &&
        (filtroProf === '' || a.profissional === filtroProf)
      );
      if (agend) {
        html += `<div class="time-slot">
          <div class="appt-block ${blockClass(agend.status)}" onclick="abrirDetalhe(${agend.id})">
            ${agend.nome.split(' ')[0]} · ${agend.servico.split(' ')[0]}
          </div>
        </div>`;
      } else {
        html += `<div class="time-slot"></div>`;
      }
    });
  });

  grid.innerHTML = html;
}

/* ==========================================
   MODAL AGENDAMENTO
   ========================================== */
function abrirModal(id) {
  document.getElementById(id).classList.add('open');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('open');
  agendamentoSelecionadoId = null;
}

// Fechar ao clicar fora
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    agendamentoSelecionadoId = null;
  }
});

function salvarAgendamento() {
  const nome         = document.getElementById('novo-nome').value.trim();
  const data         = document.getElementById('novo-data').value;
  const hora         = document.getElementById('novo-hora').value;
  const servico      = document.getElementById('novo-servico').value;
  const profissional = document.getElementById('novo-profissional').value;
  const status       = document.getElementById('novo-status').value;

  if (!nome || !data || !hora || !servico || !profissional) {
    mostrarToast('Preencha todos os campos!', 'error'); return;
  }

  // Verificar conflito de horário
  const conflito = agendamentos.find(a =>
    a.data === data && a.hora === hora &&
    a.profissional === profissional && a.status !== 'cancelado'
  );
  if (conflito) {
    mostrarToast(`${profissional} já tem horário às ${hora}!`, 'error'); return;
  }

  const novo = { id: gerarId(), nome, data, hora, servico, profissional, status };
  agendamentos.push(novo);
  salvarDados();
  renderDashboard();
  renderAgenda();
  fecharModal('modal-agendamento');

  // Limpar formulário
  ['novo-nome','novo-data','novo-hora'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('novo-servico').value = '';
  document.getElementById('novo-profissional').value = '';
  document.getElementById('novo-status').value = 'aguardando';

  mostrarToast('✓ Agendamento criado com sucesso!', 'success');
}

/* ==========================================
   MODAL DETALHE
   ========================================== */
function abrirDetalhe(id) {
  agendamentoSelecionadoId = id;
  const a = agendamentos.find(x => x.id === id);
  if (!a) return;

  const val = preco(a.servico);
  const antec = val * 0.5;

  const html = `
    <div class="detalhe-row"><span class="detalhe-label">Cliente</span><span class="detalhe-val">${a.nome}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Serviço</span><span class="detalhe-val">${a.servico}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Profissional</span><span class="detalhe-val">${a.profissional}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Data</span><span class="detalhe-val">${new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Horário</span><span class="detalhe-val">${a.hora}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Valor total</span><span class="detalhe-val">${formatarBRL(val)}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Antecipação (50%)</span><span class="detalhe-val" style="color:var(--pk5);">${formatarBRL(antec)}</span></div>
    <div class="detalhe-row"><span class="detalhe-label">Status</span><span class="appt-badge ${statusClass(a.status)}">${statusLabel(a.status)}</span></div>
  `;

  document.getElementById('detalhe-conteudo').innerHTML = html;
  abrirModal('modal-detalhe');
}

function cancelarAgendamento() {
  if (!agendamentoSelecionadoId) return;
  const a = agendamentos.find(x => x.id === agendamentoSelecionadoId);
  if (!a) return;
  if (a.status === 'cancelado') { mostrarToast('Já está cancelado.', ''); fecharModal('modal-detalhe'); return; }
  a.status = 'cancelado';
  salvarDados();
  renderDashboard();
  renderAgenda();
  fecharModal('modal-detalhe');
  mostrarToast('Agendamento cancelado. Antecipação retida.', '');
}

function confirmarPagamento() {
  if (!agendamentoSelecionadoId) return;
  const a = agendamentos.find(x => x.id === agendamentoSelecionadoId);
  if (!a) return;
  if (a.status === 'concluido') { mostrarToast('Já está concluído.', ''); fecharModal('modal-detalhe'); return; }
  if (a.status === 'cancelado') { mostrarToast('Agendamento cancelado.', 'error'); return; }
  a.status = a.status === 'pago' ? 'concluido' : 'pago';
  salvarDados();
  renderDashboard();
  renderAgenda();
  fecharModal('modal-detalhe');
  mostrarToast('✓ Status atualizado!', 'success');
}

/* ==========================================
   RELATÓRIOS + GRÁFICOS (Chart.js)
   ========================================== */
function renderRelatorios() {
  atualizarResumoFaturamento();
  renderGraficoFaturamento();
  renderTabelaServicos();
  renderGraficoCancelamentos();
  renderGraficoMultas();
  renderTabelaProfissionais();
}

function atualizarResumoFaturamento() {
  const ativos = agendamentos.filter(a => a.status !== 'cancelado');
  const receita = ativos.reduce((s, a) => s + preco(a.servico), 0);
  const antec = ativos.filter(a => a.status === 'pago')
                      .reduce((s, a) => s + preco(a.servico) * 0.5, 0);
  const el1 = document.getElementById('receita-total-label');
  const el2 = document.getElementById('antecipacoes-label');
  if (el1) el1.textContent = formatarBRL(receita);
  if (el2) el2.textContent = formatarBRL(antec);
}

function renderGraficoFaturamento() {
  const el = document.getElementById('grafico-faturamento');
  if (!el) return;

  // Gera dados mensais simulados com base nos agendamentos reais
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const base = [4200, 4800, 3900, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const mesAtual = new Date().getMonth();

  agendamentos.filter(a => a.status !== 'cancelado').forEach(a => {
    const m = new Date(a.data + 'T00:00:00').getMonth();
    base[m] = (base[m] || 0) + preco(a.servico);
  });

  const receitas = base;
  const antecipacoes = receitas.map((v, i) => i <= mesAtual ? Math.round(v * 0.5) : 0);

  if (graficos['faturamento']) graficos['faturamento'].destroy();

  graficos['faturamento'] = new Chart(el, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Receita Total',
          data: receitas,
          backgroundColor: meses.map((_, i) => i === mesAtual ? '#D4537E' : '#F4C0D1'),
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Antecipações (50%)',
          data: antecipacoes,
          backgroundColor: meses.map((_, i) => i === mesAtual ? '#993556' : '#ED93B1'),
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#72243E', font: { family: 'DM Sans', size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${formatarBRL(ctx.raw)}`
          }
        }
      },
      scales: {
        x: { grid: { color: '#FBEAF0' }, ticks: { color: '#D4537E', font: { family: 'DM Sans' } } },
        y: { grid: { color: '#FBEAF0' }, ticks: { color: '#D4537E', font: { family: 'DM Sans' }, callback: v => formatarBRL(v) } }
      }
    }
  });
}

function renderTabelaServicos() {
  const el = document.getElementById('tabela-servicos');
  if (!el) return;

  const dados = {};
  agendamentos.forEach(a => {
    if (!dados[a.servico]) dados[a.servico] = { total: 0, concluido: 0, cancelado: 0, receita: 0, multas: 0 };
    dados[a.servico].total++;
    if (a.status === 'concluido') dados[a.servico].concluido++;
    if (a.status === 'cancelado') { dados[a.servico].cancelado++; dados[a.servico].multas += preco(a.servico) * 0.5; }
    if (a.status !== 'cancelado') dados[a.servico].receita += preco(a.servico);
  });

  const linhas = Object.entries(dados).sort((a, b) => b[1].receita - a[1].receita);

  el.innerHTML = `
    <thead><tr>
      <th>Serviço</th><th>Agendamentos</th><th>Concluídos</th><th>Cancelados</th><th>Receita</th><th>Multas retidas</th>
    </tr></thead>
    <tbody>
      ${linhas.map(([serv, d]) => `
        <tr>
          <td>${serv}</td>
          <td>${d.total}</td>
          <td>${d.concluido}</td>
          <td>${d.cancelado}</td>
          <td>${formatarBRL(d.receita)}</td>
          <td class="td-pink">${formatarBRL(d.multas)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

function renderGraficoCancelamentos() {
  const el = document.getElementById('grafico-cancelamentos');
  if (!el) return;

  const concluidos = agendamentos.filter(a => a.status === 'concluido').length;
  const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;
  const pagos = agendamentos.filter(a => a.status === 'pago').length;
  const aguardando = agendamentos.filter(a => a.status === 'aguardando').length;

  if (graficos['cancelamentos']) graficos['cancelamentos'].destroy();

  graficos['cancelamentos'] = new Chart(el, {
    type: 'doughnut',
    data: {
      labels: ['Concluídos', '50% Pago', 'Aguardando', 'Cancelados'],
      datasets: [{
        data: [concluidos, pagos, aguardando, cancelados],
        backgroundColor: ['#3B6D11', '#D4537E', '#EF9F27', '#E24B4A'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#72243E', font: { family: 'DM Sans', size: 12 }, padding: 16 } }
      }
    }
  });
}

function renderGraficoMultas() {
  const el = document.getElementById('grafico-multas');
  if (!el) return;

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
  const multas = [120, 60, 180, 0, 0, 0];
  const mesAtual = new Date().getMonth();

  agendamentos.filter(a => a.status === 'cancelado').forEach(a => {
    const m = new Date(a.data + 'T00:00:00').getMonth();
    if (m < 6) multas[m] = (multas[m] || 0) + preco(a.servico) * 0.5;
  });

  if (graficos['multas']) graficos['multas'].destroy();

  graficos['multas'] = new Chart(el, {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [{
        label: 'Multas retidas (R$)',
        data: multas,
        backgroundColor: '#F4C0D1',
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${formatarBRL(ctx.raw)}` } }
      },
      scales: {
        x: { grid: { color: '#FBEAF0' }, ticks: { color: '#D4537E', font: { family: 'DM Sans' } } },
        y: { grid: { color: '#FBEAF0' }, ticks: { color: '#D4537E', font: { family: 'DM Sans' }, callback: v => formatarBRL(v) } }
      }
    }
  });
}

function renderTabelaProfissionais() {
  const el = document.getElementById('tabela-profissionais');
  if (!el) return;

  const dados = {};
  agendamentos.forEach(a => {
    if (!dados[a.profissional]) dados[a.profissional] = { total: 0, concluido: 0, cancelado: 0, receita: 0 };
    dados[a.profissional].total++;
    if (a.status === 'concluido') dados[a.profissional].concluido++;
    if (a.status === 'cancelado') dados[a.profissional].cancelado++;
    if (a.status !== 'cancelado') dados[a.profissional].receita += preco(a.servico);
  });

  el.innerHTML = `
    <thead><tr>
      <th>Profissional</th><th>Agendamentos</th><th>Concluídos</th><th>Cancelados</th><th>Taxa conclusão</th><th>Receita gerada</th>
    </tr></thead>
    <tbody>
      ${Object.entries(dados).map(([prof, d]) => {
        const taxa = d.total ? Math.round((d.concluido / d.total) * 100) : 0;
        return `<tr>
          <td><strong>${prof}</strong></td>
          <td>${d.total}</td>
          <td>${d.concluido}</td>
          <td>${d.cancelado}</td>
          <td>${taxa}%</td>
          <td class="td-pink">${formatarBRL(d.receita)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  `;
}

/* ==========================================
   TABS DE RELATÓRIOS
   ========================================== */
function setTab(btn, painelId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.rel-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(painelId).classList.add('active');

  // Re-renderiza gráfico do painel ativado
  if (painelId === 'rel-faturamento') renderGraficoFaturamento();
  if (painelId === 'rel-cancelamentos') { renderGraficoCancelamentos(); renderGraficoMultas(); }
}

/* ==========================================
   CONFIGURAÇÕES
   ========================================== */
function toggleSwitch(btn) {
  btn.classList.toggle('on');
  btn.classList.toggle('off');
}

function salvarConfiguracoes() {
  const cfg = {
    nome:      document.getElementById('cfg-nome')?.value,
    cnpj:      document.getElementById('cfg-cnpj')?.value,
    tel:       document.getElementById('cfg-tel')?.value,
    end:       document.getElementById('cfg-end')?.value,
    email:     document.getElementById('cfg-email')?.value,
    segAb:     document.getElementById('cfg-seg-ab')?.value,
    segFe:     document.getElementById('cfg-seg-fe')?.value,
    sabAb:     document.getElementById('cfg-sab-ab')?.value,
    sabFe:     document.getElementById('cfg-sab-fe')?.value,
    dom:       document.getElementById('cfg-dom')?.value,
    pagamento: document.getElementById('cfg-pagamento')?.value,
    pct:       document.getElementById('cfg-pct')?.value,
    tg50:      document.getElementById('tg-50')?.classList.contains('on'),
    tgReter:   document.getElementById('tg-reter')?.classList.contains('on'),
    tgReemb:   document.getElementById('tg-reembolso')?.classList.contains('on'),
  };
  localStorage.setItem('beautyglow_config', JSON.stringify(cfg));
  mostrarToast('✓ Configurações salvas!', 'success');
}

function restaurarPadrao() {
  localStorage.removeItem('beautyglow_config');
  mostrarToast('Configurações restauradas ao padrão.', '');
  setTimeout(() => location.reload(), 1000);
}

function carregarConfiguracoes() {
  const salvo = localStorage.getItem('beautyglow_config');
  if (!salvo) return;
  try {
    const cfg = JSON.parse(salvo);
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set('cfg-nome', cfg.nome); set('cfg-cnpj', cfg.cnpj); set('cfg-tel', cfg.tel);
    set('cfg-end', cfg.end); set('cfg-email', cfg.email);
    set('cfg-seg-ab', cfg.segAb); set('cfg-seg-fe', cfg.segFe);
    set('cfg-sab-ab', cfg.sabAb); set('cfg-sab-fe', cfg.sabFe);
    set('cfg-dom', cfg.dom); set('cfg-pagamento', cfg.pagamento); set('cfg-pct', cfg.pct);
    const setToggle = (id, val) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('on', val);
      el.classList.toggle('off', !val);
    };
    setToggle('tg-50', cfg.tg50); setToggle('tg-reter', cfg.tgReter); setToggle('tg-reembolso', cfg.tgReemb);
  } catch {}
}

// Carregar configurações salvas na inicialização
document.addEventListener('DOMContentLoaded', carregarConfiguracoes);
