/* ================================================
   民营经济共生发展指数平台 — app.js v2
   架构：DataStore → Modules → Charts
   无模拟数据：所有数据来自 API 或文件导入
   ================================================ */

// ============================================================
// 1. SCHEMA DEFINITIONS — 各数据集的字段定义与CSV模板
// ============================================================
const SCHEMAS = {
  trend: {
    label: '季度趋势数据',
    desc: '时间序列，每行一个季度',
    fields: [
      { key: 'quarter',      label: '季度标识',         required: true,  example: '2024Q1' },
      { key: 'totalIndex',   label: '综合共生发展指数',  required: true,  example: '74.2' },
      { key: 'dim1',         label: '资源交互效率分',    required: false, example: '71.5' },
      { key: 'dim2',         label: '协同发展能力分',    required: false, example: '76.8' },
      { key: 'dim3',         label: '政策环境支持分',    required: false, example: '72.4' },
      { key: 'dim4',         label: '发展效能分',        required: false, example: '76.1' },
      { key: 'pmi',          label: '制造业PMI',         required: false, example: '50.2' },
      { key: 'costMatch',    label: '融资成本匹配比(%)', required: false, example: '108.3' },
      { key: 'supplyRate',   label: '供应链金融渗透率(%)' , required: false, example: '34.2' },
      { key: 'riskShare',    label: '风险共担覆盖率(%)', required: false, example: '28.6' },
      { key: 'gdpShare',     label: '民营经济占GDP(%)',  required: false, example: '65.8' },
      { key: 'rndTrend',     label: '研发投入转化率(%)', required: false, example: '38.4' },
      { key: 'policyGrowth', label: '普惠贷款增速(%)',   required: false, example: '18.4' },
      { key: 'creditRate',   label: '信用平台覆盖率(%)', required: false, example: '68.7' },
    ],
  },
  regions: {
    label: '地区排名数据',
    desc: '每行一个地区（县市区）',
    fields: [
      { key: 'name',   label: '地区名称', required: true,  example: '鹿城区' },
      { key: 'total',  label: '综合指数', required: true,  example: '78.4' },
      { key: 'd1',     label: '资源交互', required: false, example: '76.2' },
      { key: 'd2',     label: '协同发展', required: false, example: '79.8' },
      { key: 'd3',     label: '政策环境', required: false, example: '77.1' },
      { key: 'd4',     label: '发展效能', required: false, example: '80.5' },
      { key: 'change', label: '季度变化', required: false, example: '+1.8' },
      { key: 'warn',   label: '预警状态', required: false, example: '正常' },
    ],
  },
  industries: {
    label: '行业适配数据',
    desc: '每行一个行业',
    fields: [
      { key: 'name',       label: '行业名称',         required: true,  example: '制造业' },
      { key: 'adaptSmall', label: '小微企业适配度(%)', required: false, example: '88' },
      { key: 'adaptMid',   label: '中型企业适配度(%)', required: false, example: '94' },
      { key: 'adaptLarge', label: '大型企业适配度(%)', required: false, example: '99' },
      { key: 'adaptTotal', label: '整体适配度(%)',     required: true,  example: '91.2' },
      { key: 'costMatch',  label: '成本匹配比(%)',     required: false, example: '108.3' },
    ],
  },
  kpis: {
    label: '核心KPI数据',
    desc: '当期KPI快照，每行一个指标',
    fields: [
      { key: 'indicator',  label: '指标名称', required: true,  example: 'adaptRate' },
      { key: 'value',      label: '指标值',   required: true,  example: '92.4' },
      { key: 'unit',       label: '单位',     required: false, example: '%' },
      { key: 'target',     label: '目标值',   required: false, example: '95' },
      { key: 'trend',      label: '趋势描述', required: false, example: '▲+1.2' },
    ],
  },
  products: {
    label: '融资产品分布',
    desc: '融资产品结构占比，每行一类',
    fields: [
      { key: 'label',  label: '产品类型', required: true, example: '普通信贷' },
      { key: 'value',  label: '占比(%)',  required: true, example: '42' },
    ],
  },
  bankTypes: {
    label: '审批周期（机构类型）',
    desc: '各类金融机构贷款审批周期',
    fields: [
      { key: 'label', label: '机构类型',   required: true, example: '国有银行' },
      { key: 'days',  label: '审批周期(天)', required: true, example: '12' },
    ],
  },
  digitalTools: {
    label: '数字工具应用率',
    desc: '各项数字化工具覆盖率',
    fields: [
      { key: 'label', label: '工具名称',   required: true, example: '区块链存证' },
      { key: 'value', label: '覆盖率(%)', required: true, example: '65' },
    ],
  },
  activeMetrics: {
    label: '经济活跃度指标',
    desc: '高频经济活跃度分项数据',
    fields: [
      { key: 'label', label: '指标名称', required: true, example: '增值税开票量指数' },
      { key: 'value', label: '指标值',   required: true, example: '85.4' },
    ],
  },
  defaultRates: {
    label: '行业违约率',
    desc: '各行业企业违约率监控',
    fields: [
      { key: 'label',   label: '行业名称',   required: true,  example: '制造业' },
      { key: 'rate',    label: '违约率(%)',   required: true,  example: '2.8' },
      { key: 'isAvg',   label: '是否为均值行（y/n）', required: false, example: 'n' },
    ],
  },
  provinces: {
    label: '省内地市对比',
    desc: '浙江省各地市指数对比',
    fields: [
      { key: 'city',  label: '城市名称', required: true,  example: '杭州' },
      { key: 'total', label: '综合指数', required: true,  example: '82.1' },
      { key: 'd1',    label: '资源交互', required: false, example: '83.4' },
      { key: 'd2',    label: '协同发展', required: false, example: '81.8' },
      { key: 'd3',    label: '政策环境', required: false, example: '80.6' },
      { key: 'd4',    label: '发展效能', required: false, example: '82.6' },
    ],
  },
  forecast: {
    label: '指数预测数据',
    desc: 'ARIMA或其他模型的预测结果',
    fields: [
      { key: 'quarter', label: '预测季度',   required: true,  example: '2025Q1' },
      { key: 'value',   label: '预测中值',   required: true,  example: '75.0' },
      { key: 'upper',   label: '置信上界',   required: false, example: '76.5' },
      { key: 'lower',   label: '置信下界',   required: false, example: '73.5' },
    ],
  },
};

// ============================================================
// 2. DATA STORE — 持久化到 localStorage
// ============================================================
const DataStore = (() => {
  const STORAGE_KEY = 'symbiosis_data_v2';
  const API_KEY = 'symbiosis_apis_v2';
  let store = {};
  let apis = {};
  const listeners = [];
  let _pendingFile = null; // 待映射的文件数据

  function load() {
    try { store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { store = {}; }
    try { apis = JSON.parse(localStorage.getItem(API_KEY) || '{}'); } catch { apis = {}; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) {
      alert('数据体积超出localStorage限制，请考虑精简数据集或使用API模式');
    }
    try { localStorage.setItem(API_KEY, JSON.stringify(apis)); } catch {}
  }

  function set(dataset, data) {
    store[dataset] = { data, updatedAt: new Date().toISOString(), source: 'import' };
    save();
    emit(dataset);
  }

  function setFromApi(dataset, data) {
    store[dataset] = { data, updatedAt: new Date().toISOString(), source: 'api' };
    save();
    emit(dataset);
  }

  function get(dataset) {
    return store[dataset] ? store[dataset].data : null;
  }

  function getMeta(dataset) {
    return store[dataset] || null;
  }

  function clear(dataset) {
    delete store[dataset];
    save();
    emit(dataset);
  }

  function clearAll() {
    store = {};
    save();
    emit('*');
  }

  function hasData(dataset) {
    const d = get(dataset);
    if (!d) return false;
    if (Array.isArray(d)) return d.length > 0;
    if (typeof d === 'object') return Object.keys(d).length > 0;
    return false;
  }

  function hasAnyData() {
    return Object.keys(store).some(k => hasData(k));
  }

  function listDatasets() {
    return Object.keys(SCHEMAS).map(key => ({
      key,
      ...SCHEMAS[key],
      loaded: hasData(key),
      meta: getMeta(key),
      api: getApi(key),
    }));
  }

  function emit(dataset) {
    listeners.forEach(fn => fn(dataset));
  }

  function on(fn) { listeners.push(fn); }

  // API config
  function saveApi(cfg) {
    apis[cfg.dataset] = cfg;
    save();
  }

  function getApi(dataset) { return apis[dataset] || null; }
  function getAllApis() { return apis; }
  function removeApi(dataset) { delete apis[dataset]; save(); }

  function setPendingFile(data) { _pendingFile = data; }
  function getPendingFile() { return _pendingFile; }

  load();
  return { set, setFromApi, get, getMeta, clear, clearAll, hasData, hasAnyData, listDatasets, on, saveApi, getApi, getAllApis, removeApi, setPendingFile, getPendingFile, load };
})();

// ============================================================
// 3. API LAYER — fetch + JSONPath extraction
// ============================================================
const ApiLayer = {
  timers: {},

  extractByPath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  },

  async fetch(cfg) {
    const opts = { method: cfg.method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (cfg.auth) opts.headers['Authorization'] = cfg.auth;
    if (cfg.headers) {
      try { Object.assign(opts.headers, JSON.parse(cfg.headers)); } catch {}
    }
    if (cfg.method === 'POST' && cfg.body) {
      try { opts.body = JSON.stringify(JSON.parse(cfg.body)); } catch { opts.body = cfg.body; }
    }
    const res = await fetch(cfg.url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return this.extractByPath(json, cfg.dataPath);
  },

  async fetchAndStore(cfg) {
    const data = await this.fetch(cfg);
    DataStore.setFromApi(cfg.dataset, data);
    return data;
  },

  startAutoRefresh(dataset, cfg) {
    this.stopAutoRefresh(dataset);
    if (!cfg.refreshInterval || cfg.refreshInterval === '0') return;
    const ms = parseInt(cfg.refreshInterval);
    this.timers[dataset] = setInterval(async () => {
      try { await this.fetchAndStore(cfg); } catch (e) { console.warn('Auto-refresh failed:', e); }
    }, ms);
  },

  stopAutoRefresh(dataset) {
    if (this.timers[dataset]) { clearInterval(this.timers[dataset]); delete this.timers[dataset]; }
  },
};

// ============================================================
// 4. FILE PARSER
// ============================================================
const FileParser = {
  async parse(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') return this.parseCsv(file);
    if (ext === 'json') return this.parseJson(file);
    if (ext === 'xlsx' || ext === 'xls') return this.parseExcel(file);
    throw new Error('不支持的文件格式：' + ext);
  },

  parseCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: r => resolve({ headers: r.meta.fields, rows: r.data }),
        error: reject,
      });
    });
  },

  parseJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const json = JSON.parse(e.target.result);
          const arr = Array.isArray(json) ? json : (json.data || json.list || json.rows || Object.values(json));
          const headers = arr.length ? Object.keys(arr[0]) : [];
          resolve({ headers, rows: arr });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          const headers = rows.length ? Object.keys(rows[0]) : [];
          resolve({ headers, rows });
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  },

  generateCsv(dataset) {
    const schema = SCHEMAS[dataset];
    if (!schema) return;
    const headers = schema.fields.map(f => f.key);
    const example = schema.fields.map(f => f.example);
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `template_${dataset}.csv`;
    a.click(); URL.revokeObjectURL(url);
  },
};

// ============================================================
// 5. CHART REGISTRY — destroy & recreate safely
// ============================================================
const Charts = (() => {
  const _instances = {};
  function destroy(id) {
    if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
  }
  function create(id, config) {
    destroy(id);
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const chart = new Chart(canvas.getContext('2d'), config);
    _instances[id] = chart;
    return chart;
  }
  function destroyAll() { Object.keys(_instances).forEach(id => destroy(id)); }
  return { create, destroy, destroyAll };
})();

// ============================================================
// 6. CHART HELPERS
// ============================================================
const C = {
  blue:'#3b82f6', green:'#10b981', amber:'#f59e0b',
  purple:'#8b5cf6', red:'#ef4444', teal:'#14b8a6',
  indigo:'#6366f1', orange:'#f97316',
};

function rgba(hex, a) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function lineDs(label, data, color, fill=false) {
  return { label, data, borderColor:color, backgroundColor:fill?rgba(color,0.12):'transparent',
    pointBackgroundColor:color, pointRadius:3, pointHoverRadius:5, tension:0.4, fill, borderWidth:2 };
}

const lineOpts = (yLabel='', yMin=null) => ({
  responsive:true, interaction:{mode:'index',intersect:false},
  plugins:{ legend:{position:'top',labels:{font:{size:11},boxWidth:12}},
    tooltip:{backgroundColor:'#1a2340',padding:10,titleFont:{size:12},bodyFont:{size:11}} },
  scales:{
    x:{ ticks:{font:{size:9},maxTicksLimit:10}, grid:{display:false} },
    y:{ ...(yMin!==null?{min:yMin}:{}), ticks:{font:{size:10}}, title:{display:!!yLabel,text:yLabel,font:{size:11}} },
  },
});

// ============================================================
// 7. MODULES — render each tab from DataStore
// ============================================================
const Modules = {

  // ---- OVERVIEW ----
  renderOverview() {
    const trend = DataStore.get('trend');
    const regions = DataStore.get('regions');
    const hasContent = (trend && trend.length > 0) || (regions && regions.length > 0);

    document.getElementById('empty-overview').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-overview').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    // Score banner
    if (trend && trend.length > 0) {
      const last = trend[trend.length - 1];
      const prev = trend.length > 1 ? trend[trend.length - 2] : null;
      const dims = [
        { label:'资源交互效率', key:'dim1', cls:'c1' },
        { label:'协同发展能力', key:'dim2', cls:'c2' },
        { label:'政策环境支持', key:'dim3', cls:'c3' },
        { label:'发展效能',     key:'dim4', cls:'c4' },
      ];
      const trendIcon = (cur, pre, key) => {
        if (!pre || !cur[key] || !pre[key]) return '';
        const d = (parseFloat(cur[key]) - parseFloat(pre[key])).toFixed(1);
        return `<div class="score-trend ${d>=0?'up':'down'}">${d>=0?'▲':'▼'} ${Math.abs(d)} 较上季度</div>`;
      };
      let html = `<div class="score-card score-main">
        <div class="score-label">综合共生发展指数</div>
        <div class="score-value">${parseFloat(last.totalIndex||0).toFixed(1)}</div>
        ${trendIcon(last,prev,'totalIndex')}
        <div class="score-bar-bg"><div class="score-bar-fill main-fill" style="width:${last.totalIndex}%"></div></div>
      </div>`;
      dims.forEach(d => {
        const v = last[d.key] ? parseFloat(last[d.key]).toFixed(1) : '—';
        html += `<div class="score-card">
          <div class="score-label">${d.label}</div>
          <div class="score-value sm">${v}</div>
          ${trendIcon(last,prev,d.key)}
          <div class="score-bar-bg"><div class="score-bar-fill ${d.cls}" style="width:${last[d.key]||0}%"></div></div>
        </div>`;
      });
      document.getElementById('scoreBanner').innerHTML = html;

      // PMI alert
      const recentPmi = trend.slice(-2).map(r => parseFloat(r.pmi)).filter(v => !isNaN(v));
      if (recentPmi.length === 2 && recentPmi.every(v => v < 48)) {
        document.getElementById('alertBar').style.display = 'flex';
        document.getElementById('alertText').textContent = `PMI连续2季度低于48%（${recentPmi.join(', ')}），触发制造业收缩黄灯预警 · 建议定向增加信贷配额`;
      } else {
        document.getElementById('alertBar').style.display = 'none';
      }

      // Trend chart
      Charts.create('trendChart', {
        type: 'line',
        data: { labels: trend.map(r => r.quarter),
          datasets: [
            lineDs('综合指数', trend.map(r=>parseFloat(r.totalIndex)||null), C.blue, true),
            lineDs('资源交互', trend.map(r=>parseFloat(r.dim1)||null), C.teal),
            lineDs('协同发展', trend.map(r=>parseFloat(r.dim2)||null), C.green),
            lineDs('政策环境', trend.map(r=>parseFloat(r.dim3)||null), C.amber),
            lineDs('发展效能', trend.map(r=>parseFloat(r.dim4)||null), C.purple),
          ]},
        options: { ...lineOpts('指数分值'), scales:{ x:{ticks:{font:{size:9},maxTicksLimit:10},grid:{display:false}}, y:{min:40,max:100} }},
      });

      // Radar
      Charts.create('radarChart', {
        type:'radar',
        data:{ labels:['资源交互效率','协同发展能力','政策环境支持','发展效能'],
          datasets:[{
            label: last.quarter || '最新季度',
            data:[last.dim1,last.dim2,last.dim3,last.dim4].map(v=>parseFloat(v)||0),
            backgroundColor:rgba(C.blue,0.2), borderColor:C.blue, pointBackgroundColor:C.blue, borderWidth:2,
          }, ...(prev ? [{
            label: prev.quarter || '上季度',
            data:[prev.dim1,prev.dim2,prev.dim3,prev.dim4].map(v=>parseFloat(v)||0),
            backgroundColor:rgba(C.amber,0.12), borderColor:C.amber, pointBackgroundColor:C.amber, borderWidth:1.5, borderDash:[4,4],
          }] : [])]},
        options:{ responsive:true,
          plugins:{legend:{position:'bottom',labels:{font:{size:11},boxWidth:12}}},
          scales:{r:{min:40,max:100,ticks:{font:{size:9},stepSize:10},pointLabels:{font:{size:10}}}} },
      });
    }

    if (regions) this.renderRankTable();
  },

  renderRankTable() {
    const regions = DataStore.get('regions');
    if (!regions) return;
    const dim = document.getElementById('regionFilterDim')?.value || 'total';
    const sorted = [...regions].sort((a,b)=>parseFloat(b[dim]||0)-parseFloat(a[dim]||0));
    document.getElementById('rankTableBody').innerHTML = sorted.map((r,i) => {
      const w = r.warn || '';
      const cls = w==='正常'?'badge-green': w==='关注'?'badge-yellow':'badge-red';
      const chg = String(r.change || '');
      const chgCls = chg.startsWith('+') ? 'color:#10b981' : chg.startsWith('-') ? 'color:#ef4444' : '';
      return `<tr><td><strong>${i+1}</strong></td><td>${r.name||''}</td>
        <td><strong>${parseFloat(r.total||0).toFixed(1)}</strong></td>
        <td>${r.d1||'—'}</td><td>${r.d2||'—'}</td><td>${r.d3||'—'}</td><td>${r.d4||'—'}</td>
        <td style="${chgCls}">${chg}</td>
        <td>${w?`<span class="badge ${cls}">${w}</span>`:''}</td></tr>`;
    }).join('');
  },

  // ---- RESOURCE ----
  renderResource() {
    const kpis = DataStore.get('kpis');
    const industries = DataStore.get('industries');
    const trend = DataStore.get('trend');
    const hasContent = kpis || industries || trend;

    document.getElementById('empty-resource').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-resource').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    // KPI cards
    const kpiMap = {};
    if (kpis) kpis.forEach(row => { if (row.indicator) kpiMap[row.indicator] = row; });
    const kpiDefs = [
      { key:'adaptRate', name:'融资适配度', formula:'融资供给/实体需求', unit:'%', warnFn: v=>false },
      { key:'costMatch', name:'融资成本匹配性', formula:'平均融资成本/行业利润率 × 100%', unit:'%', warnFn: v=>parseFloat(v)>100 },
      { key:'creditRate', name:'信用覆盖水平', formula:'信用平台接入企业占比', unit:'%', warnFn: v=>parseFloat(v)<80 },
    ];
    document.getElementById('resourceKpis').innerHTML = kpiDefs.map(def => {
      const row = kpiMap[def.key];
      const v = row ? row.value : (trend && trend.length > 0 && trend[trend.length-1][def.key] ? trend[trend.length-1][def.key] : null);
      const isWarn = v && def.warnFn(v);
      const sub = row ? `${row.trend||''} ${row.unit||def.unit}` : (v ? def.unit : '暂无数据');
      return `<div class="kpi-card${isWarn?' warn':''}">
        <div class="kpi-name">${def.name}</div>
        <div class="kpi-formula">${def.formula}</div>
        <div class="kpi-value${isWarn?' warn':''}">${v ? parseFloat(v).toFixed(1) + (def.unit||'') : '—'}</div>
        <div class="kpi-sub">${sub}</div>
      </div>`;
    }).join('');

    // Industry cost match chart
    if (industries && industries.length > 0) {
      const costVals = industries.map(r => parseFloat(r.costMatch) || null);
      Charts.create('costMatchChart', {
        type:'bar',
        data:{ labels:industries.map(r=>r.name),
          datasets:[{ label:'融资成本/利润率(%)', data:costVals,
            backgroundColor:costVals.map(v=>v?v>100?rgba(C.red,0.75):rgba(C.green,0.75):'#ddd'),
            borderColor:costVals.map(v=>v?v>100?C.red:C.green:'#999'), borderWidth:1.5 }]},
        options:{ responsive:true, plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a2340'}},
          scales:{ x:{ticks:{font:{size:11}}}, y:{title:{display:true,text:'比值(%)'},ticks:{font:{size:10}}} }},
      });

      // Adapt table
      document.getElementById('adaptTableBody').innerHTML = industries.map(r => {
        const t = parseFloat(r.adaptTotal||0);
        const cls = t>=90?'badge-green':t>=80?'badge-yellow':'badge-red';
        const status = t>=90?'适配良好':t>=80?'基本适配':'适配不足';
        return `<tr><td>${r.name}</td><td>${r.adaptSmall||'—'}%</td><td>${r.adaptMid||'—'}%</td>
          <td>${r.adaptLarge||'—'}%</td><td><strong>${t.toFixed(1)}%</strong></td>
          <td><span class="badge ${cls}">${status}</span></td></tr>`;
      }).join('');
    }

    // Credit trend
    if (trend && trend.length > 0) {
      const creditData = trend.map(r => parseFloat(r.creditRate)||null);
      if (creditData.some(v=>v)) {
        Charts.create('creditTrendChart', {
          type:'line',
          data:{ labels:trend.map(r=>r.quarter), datasets:[lineDs('信用平台覆盖率(%)',creditData,C.teal,true)]},
          options:lineOpts('%'),
        });
      }
    }
  },

  // ---- SYNERGY ----
  renderSynergy() {
    const trend = DataStore.get('trend');
    const products = DataStore.get('products');
    const bankTypes = DataStore.get('bankTypes');
    const kpis = DataStore.get('kpis');
    const hasContent = trend || products || bankTypes || kpis;

    document.getElementById('empty-synergy').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-synergy').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    // KPI cards
    const kpiMap = {};
    if (kpis) kpis.forEach(r => { if (r.indicator) kpiMap[r.indicator] = r; });
    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};
    const kpiDefs = [
      { key:'supplyRate', name:'供应链金融渗透率', formula:'供应链融资/实体总融资', unit:'%' },
      { key:'riskShare', name:'风险共担覆盖率', formula:'联保贷款+政银担项目占比', unit:'%' },
      { key:'approvalDays', name:'服务响应效率', formula:'中小企业平均审批周期', unit:'天', warnFn:v=>parseFloat(v)>5 },
    ];
    document.getElementById('synergyKpis').innerHTML = kpiDefs.map(def => {
      const row = kpiMap[def.key];
      const v = row ? row.value : last[def.key];
      const isWarn = v && def.warnFn && def.warnFn(v);
      return `<div class="kpi-card${isWarn?' warn':''}">
        <div class="kpi-name">${def.name}</div><div class="kpi-formula">${def.formula}</div>
        <div class="kpi-value${isWarn?' warn':''}">${v ? parseFloat(v).toFixed(1)+def.unit : '—'}</div>
        <div class="kpi-sub">${row?.trend||''}</div></div>`;
    }).join('');

    if (trend && trend.length > 0) {
      Charts.create('synergyTrendChart', {
        type:'line',
        data:{ labels:trend.map(r=>r.quarter), datasets:[
          lineDs('供应链金融渗透率(%)',trend.map(r=>parseFloat(r.supplyRate)||null),C.green,true),
          lineDs('风险共担覆盖率(%)',trend.map(r=>parseFloat(r.riskShare)||null),C.purple,true),
        ]},
        options:lineOpts('%'),
      });
    }

    if (products && products.length > 0) {
      const colors = [C.blue,C.green,C.amber,C.purple,C.teal,C.orange,C.red,C.indigo].map(c=>rgba(c,0.8));
      Charts.create('productPieChart', {
        type:'doughnut',
        data:{ labels:products.map(r=>r.label), datasets:[{ data:products.map(r=>parseFloat(r.value)||0), backgroundColor:colors, borderWidth:2, borderColor:'#fff' }]},
        options:{ responsive:true, cutout:'60%', plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:12}}} },
      });
    }

    if (bankTypes && bankTypes.length > 0) {
      const days = bankTypes.map(r=>parseFloat(r.days)||0);
      Charts.create('approvalBarChart', {
        type:'bar',
        data:{ labels:bankTypes.map(r=>r.label), datasets:[{
          label:'审批周期（天）', data:days,
          backgroundColor:days.map(v=>v<=5?rgba(C.green,0.75):rgba(C.amber,0.75)), borderRadius:6,
        }]},
        options:{ indexAxis:'y', responsive:true, plugins:{legend:{display:false}},
          scales:{ x:{ticks:{font:{size:10}},title:{display:true,text:'天数'}}, y:{ticks:{font:{size:11}}} } },
      });
    }
  },

  // ---- POLICY ----
  renderPolicy() {
    const trend = DataStore.get('trend');
    const digital = DataStore.get('digitalTools');
    const kpis = DataStore.get('kpis');
    const hasContent = trend || digital || kpis;

    document.getElementById('empty-policy').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-policy').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    const kpiMap = {};
    if (kpis) kpis.forEach(r => { if (r.indicator) kpiMap[r.indicator] = r; });
    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};

    const kpiDefs = [
      { key:'policyGrowth', name:'普惠政策落地率', formula:'普惠金融贷款余额增长率', unit:'%' },
      { key:'digitalRate',  name:'数字工具应用率', formula:'区块链+AI风控技术覆盖率', unit:'%', warnFn:v=>parseFloat(v)<70 },
      { key:'disputeDays',  name:'纠纷化解效率', formula:'区域金融纠纷平均解决时长', unit:'天', warnFn:v=>parseFloat(v)>60 },
    ];
    document.getElementById('policyKpis').innerHTML = kpiDefs.map(def => {
      const row = kpiMap[def.key];
      const v = row ? row.value : last[def.key];
      const isWarn = v && def.warnFn && def.warnFn(v);
      return `<div class="kpi-card${isWarn?' warn':''}">
        <div class="kpi-name">${def.name}</div><div class="kpi-formula">${def.formula}</div>
        <div class="kpi-value${isWarn?' warn':''}">${v ? parseFloat(v).toFixed(1)+def.unit : '—'}</div>
        <div class="kpi-sub">${row?.trend||''}</div></div>`;
    }).join('');

    if (trend && trend.length > 0) {
      const pg = trend.map(r=>parseFloat(r.policyGrowth)||null);
      if (pg.some(v=>v)) {
        Charts.create('policyTrendChart', {
          type:'line',
          data:{ labels:trend.map(r=>r.quarter), datasets:[lineDs('普惠贷款增速(%)',pg,C.amber,true)]},
          options:lineOpts('%'),
        });
      }
    }

    if (digital && digital.length > 0) {
      Charts.create('digitalRadarChart', {
        type:'radar',
        data:{ labels:digital.map(r=>r.label), datasets:[{
          label:'覆盖率(%)', data:digital.map(r=>parseFloat(r.value)||0),
          backgroundColor:rgba(C.indigo,0.2), borderColor:C.indigo, pointBackgroundColor:C.indigo, borderWidth:2,
        }]},
        options:{ responsive:true,
          scales:{r:{min:0,max:100,ticks:{font:{size:9},stepSize:20},pointLabels:{font:{size:10}}}},
          plugins:{legend:{display:false}} },
      });
    }

    // Init simulator
    const cmVal = kpiMap['costMatch']?.value || last.costMatch || null;
    if (cmVal) document.getElementById('simCostMatch').textContent = parseFloat(cmVal).toFixed(1) + '%';
  },

  // ---- EFFECT ----
  renderEffect() {
    const trend = DataStore.get('trend');
    const active = DataStore.get('activeMetrics');
    const kpis = DataStore.get('kpis');
    const hasContent = trend || active || kpis;

    document.getElementById('empty-effect').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-effect').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    const kpiMap = {};
    if (kpis) kpis.forEach(r => { if (r.indicator) kpiMap[r.indicator] = r; });
    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};

    const kpiDefs = [
      { key:'gdpShare',    name:'民营经济增加值占GDP', formula:'—', unit:'%' },
      { key:'rndTrend',    name:'研发投入转化率', formula:'专利授权收益/研发投入', unit:'%' },
      { key:'pmi',         name:'制造业PMI', formula:'—', unit:'', warnFn:v=>parseFloat(v)<48 },
      { key:'employElastic', name:'就业带动弹性', formula:'新增就业/融资规模增速', unit:'' },
      { key:'activeIndex', name:'经济活跃度指数', formula:'增值税+工业用电+物流综合', unit:'' },
    ];
    document.getElementById('effectKpis').innerHTML = kpiDefs.map(def => {
      const row = kpiMap[def.key];
      const v = row ? row.value : last[def.key];
      const isWarn = v && def.warnFn && def.warnFn(v);
      return `<div class="kpi-card${isWarn?' warn':''}">
        <div class="kpi-name">${def.name}</div><div class="kpi-formula">${def.formula}</div>
        <div class="kpi-value${isWarn?' warn':''}">${v ? parseFloat(v).toFixed(1)+(def.unit||'') : '—'}</div>
        <div class="kpi-sub">${row?.trend||''}</div></div>`;
    }).join('');

    if (trend && trend.length > 0) {
      const pmiData = trend.map(r=>parseFloat(r.pmi)||null);
      const costData = trend.map(r=>parseFloat(r.costMatch)||null);
      Charts.create('pmiChart', {
        type:'line',
        data:{ labels:trend.map(r=>r.quarter), datasets:[
          { label:'制造业PMI', data:pmiData, borderColor:C.amber, backgroundColor:rgba(C.amber,0.08),
            borderWidth:2, tension:0.4, yAxisID:'y1',
            pointBackgroundColor:pmiData.map(v=>v&&v<48?C.red:C.amber), pointRadius:4 },
          { label:'融资成本传导弹性(÷20)', data:costData.map(v=>v?v/20:null), borderColor:C.red,
            borderWidth:1.5, tension:0.4, yAxisID:'y2', borderDash:[5,3], pointRadius:2 },
        ]},
        options:{ responsive:true, interaction:{mode:'index',intersect:false},
          plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}},tooltip:{backgroundColor:'#1a2340'}},
          scales:{ x:{ticks:{font:{size:9},maxTicksLimit:10},grid:{display:false}},
            y1:{type:'linear',position:'left',min:40,max:55,title:{display:true,text:'PMI'}},
            y2:{type:'linear',position:'right',min:4,max:7,title:{display:true,text:'弹性'},grid:{display:false}} }},
      });

      const gdpData = trend.map(r=>parseFloat(r.gdpShare)||null);
      if (gdpData.some(v=>v)) {
        Charts.create('gdpChart', {
          type:'line',
          data:{ labels:trend.map(r=>r.quarter), datasets:[lineDs('民营经济占GDP(%)',gdpData,C.green,true)]},
          options:lineOpts('%'),
        });
      }

      const rndData = trend.map(r=>parseFloat(r.rndTrend)||null);
      if (rndData.some(v=>v)) {
        Charts.create('rndChart', {
          type:'line',
          data:{ labels:trend.map(r=>r.quarter), datasets:[lineDs('研发投入转化率(%)',rndData,C.indigo,true)]},
          options:lineOpts('%'),
        });
      }
    }

    if (active && active.length > 0) {
      Charts.create('activeChart', {
        type:'bar',
        data:{ labels:active.map(r=>r.label), datasets:[{
          label:'指标值', data:active.map(r=>parseFloat(r.value)||0), borderRadius:6,
          backgroundColor:[C.blue,C.green,C.amber,C.purple,C.teal,C.orange].map(c=>rgba(c,0.75)),
        }]},
        options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{ticks:{font:{size:10}}}} },
      });
    }
  },

  // ---- WARNING ----
  renderWarning() {
    const trend = DataStore.get('trend');
    const forecast = DataStore.get('forecast');
    const defaults = DataStore.get('defaultRates');
    const kpis = DataStore.get('kpis');
    const hasContent = trend || forecast || defaults || kpis;

    document.getElementById('empty-warning').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-warning').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    // Auto-generate warnings from data
    const warnings = [];
    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};
    const kpiMap = {};
    if (kpis) kpis.forEach(r => { if (r.indicator) kpiMap[r.indicator] = r; });

    // PMI check
    if (trend && trend.length >= 2) {
      const recentPmi = trend.slice(-2).map(r=>parseFloat(r.pmi)).filter(v=>!isNaN(v));
      if (recentPmi.length === 2 && recentPmi.every(v=>v<48)) {
        warnings.push({ level:'red', title:`制造业PMI连续低于48%（${recentPmi.join(', ')}）`, desc:'产业收缩信号明确，需定向干预', action:'建议：政府增加制造业专项信贷配额，启动纾困方案' });
      }
    }

    // Cost match check
    const cm = parseFloat(last.costMatch || kpiMap['costMatch']?.value || 0);
    if (cm > 100) {
      warnings.push({ level:'red', title:`融资成本匹配比 ${cm.toFixed(1)}%，侵蚀利润空间`, desc:'平均融资成本超过行业利润率，抑制实体经济发展', action:'建议：推出财政贴息专项产品，降低综合融资成本' });
    }

    // Supply rate check
    const sr = parseFloat(last.supplyRate || kpiMap['supplyRate']?.value || 0);
    if (sr > 0 && sr < 40) {
      warnings.push({ level:'yellow', title:`供应链金融渗透率 ${sr.toFixed(1)}%，低于目标40%`, desc:'供应链融资覆盖面不足，中小供应商融资困难', action:'建议：联合银行扩大供应链融资产品覆盖范围' });
    }

    // Approval days check
    const ad = parseFloat(last.approvalDays || kpiMap['approvalDays']?.value || 0);
    if (ad > 5) {
      warnings.push({ level:'yellow', title:`贷款审批周期 ${ad.toFixed(1)} 天，超过目标5天`, desc:'审批效率偏低，影响中小企业资金周转速度', action:'建议：推动银行数字化审批，开发循环贷产品' });
    }

    // Default rates check
    if (defaults && defaults.length > 0) {
      const avgRow = defaults.find(r=>r.isAvg==='y');
      const avg = avgRow ? parseFloat(avgRow.rate) : defaults.reduce((s,r)=>s+parseFloat(r.rate||0),0)/defaults.length;
      defaults.filter(r=>r.isAvg!=='y').forEach(r => {
        const rate = parseFloat(r.rate||0);
        if (rate > avg * 1.5) {
          warnings.push({ level:'red', title:`${r.label}违约率 ${rate.toFixed(1)}%，超均值${((rate/avg-1)*100).toFixed(0)}%`, desc:'高违约率行业需重点关注系统性风险传导', action:'建议：联合行业协会推出错峰还款纾困方案' });
        }
      });
    }

    if (warnings.length === 0) {
      warnings.push({ level:'green', title:'当前无重大风险预警', desc:'各项指标运行在正常区间', action:'继续保持监测频率，关注数据异动' });
    }

    document.getElementById('warningGrid').innerHTML = warnings.map(w => `
      <div class="warning-card level-${w.level}">
        <div class="warning-title">${w.title}</div>
        <div class="warning-desc">${w.desc}</div>
        <div class="warning-action">▶ ${w.action}</div>
      </div>`).join('');

    // ARIMA / Forecast chart
    if (forecast && forecast.length > 0) {
      const histLabels = trend ? trend.slice(-4).map(r=>r.quarter) : [];
      const histVals = trend ? trend.slice(-4).map(r=>parseFloat(r.totalIndex)||null) : [];
      const fcLabels = forecast.map(r=>r.quarter);
      const allLabels = [...new Set([...histLabels, ...fcLabels])];
      const pad = n => new Array(n).fill(null);
      Charts.create('arimaChart', {
        type:'line',
        data:{ labels:allLabels, datasets:[
          { label:'历史指数', data:[...histVals,...pad(fcLabels.length)], borderColor:C.blue, borderWidth:2, tension:0.4, pointRadius:3, pointBackgroundColor:C.blue },
          { label:'预测中值', data:[...pad(Math.max(histLabels.length-1,0)),...forecast.map(r=>parseFloat(r.value)||null)], borderColor:C.green, borderWidth:2, borderDash:[6,3], tension:0.4, pointRadius:3, pointBackgroundColor:C.green },
          ...(forecast[0].upper ? [{ label:'上界(95%CI)', data:[...pad(Math.max(histLabels.length-1,0)),...forecast.map(r=>parseFloat(r.upper)||null)], borderColor:rgba(C.green,0.3), borderWidth:1, borderDash:[3,3], pointRadius:0, fill:false }] : []),
          ...(forecast[0].lower ? [{ label:'下界(95%CI)', data:[...pad(Math.max(histLabels.length-1,0)),...forecast.map(r=>parseFloat(r.lower)||null)], borderColor:rgba(C.green,0.3), borderWidth:1, borderDash:[3,3], pointRadius:0, fill:'-1', backgroundColor:rgba(C.green,0.08) }] : []),
        ]},
        options:lineOpts('指数分值',40),
      });
    } else if (trend && trend.length > 0) {
      Charts.create('arimaChart', {
        type:'line',
        data:{ labels:trend.map(r=>r.quarter), datasets:[lineDs('历史指数',trend.map(r=>parseFloat(r.totalIndex)||null),C.blue,true)]},
        options:{ ...lineOpts('指数分值'), plugins:{ ...lineOpts().plugins, subtitle:{display:true,text:'预测数据未导入，显示历史趋势',font:{size:11},color:'#9ca3af'} }},
      });
    }

    // Diagnosis
    const diagItems = [];
    if (cm > 100) diagItems.push({ name:'融资成本匹配性超标', score:cm.toFixed(1)+'%', suggest:'降低融资利率或推出财政贴息，目标融资成本匹配比<100%', lvl:0 });
    if (sr > 0 && sr < 40) diagItems.push({ name:'供应链金融渗透率偏低', score:sr.toFixed(1)+'%', suggest:'扩大供应链金融产品覆盖，目标渗透率≥40%', lvl:1 });
    if (ad > 5) diagItems.push({ name:'审批周期超标', score:ad.toFixed(1)+'天', suggest:'推进数字化审批，开发循环贷，目标≤5天', lvl:1 });
    const cr = parseFloat(last.creditRate || kpiMap['creditRate']?.value || 0);
    if (cr > 0 && cr < 80) diagItems.push({ name:'信用平台覆盖率未达标', score:cr.toFixed(1)+'%', suggest:'扩大企业接入信用平台，目标≥80%', lvl:1 });
    document.getElementById('diagnosisPanel').innerHTML = diagItems.length > 0 ? diagItems.map((item,i) => `
      <div class="diagnosis-item">
        <div class="diag-rank ${item.lvl>0?'med':''}">${i+1}</div>
        <div class="diag-content">
          <div class="diag-name">${item.name} — <span style="color:${item.lvl===0?'#ef4444':'#dd6b20'}">${item.score}</span></div>
          <div class="diag-suggest">▷ ${item.suggest}</div>
        </div>
      </div>`).join('') : '<p style="color:var(--text-muted);padding:12px;">当前数据无明显短板</p>';

    // Default rates chart
    if (defaults && defaults.length > 0) {
      const avgRow = defaults.find(r=>r.isAvg==='y');
      const avg = avgRow ? parseFloat(avgRow.rate) : null;
      const rows = defaults.filter(r=>r.isAvg!=='y');
      const rateVals = rows.map(r=>parseFloat(r.rate)||0);
      Charts.create('defaultRateChart', {
        type:'bar',
        data:{ labels:rows.map(r=>r.label), datasets:[
          { label:'违约率(%)', data:rateVals, backgroundColor:rateVals.map(v=>avg&&v>avg*1.5?rgba(C.red,0.75):avg&&v>avg?rgba(C.amber,0.75):rgba(C.green,0.75)), borderRadius:5 },
          ...(avg ? [{ type:'line', label:'行业均值', data:new Array(rows.length).fill(avg), borderColor:C.red, borderWidth:1.5, borderDash:[5,3], pointRadius:0 }] : []),
        ]},
        options:{ responsive:true, plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}},tooltip:{backgroundColor:'#1a2340'}}, scales:{y:{title:{display:true,text:'违约率(%)'}}} },
      });
    }
  },

  // ---- REPORT ----
  renderReport() {
    const trend = DataStore.get('trend');
    const regions = DataStore.get('regions');
    const provinces = DataStore.get('provinces');
    const kpis = DataStore.get('kpis');
    const hasContent = DataStore.hasAnyData();

    document.getElementById('empty-report').style.display = hasContent ? 'none' : 'flex';
    document.getElementById('content-report').style.display = hasContent ? 'block' : 'none';
    if (!hasContent) return;

    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};
    const qLabel = last.quarter || '最新季度';
    document.getElementById('reportTitle').textContent = `${qLabel} 季度评估报告`;

    const kpiMap = {};
    if (kpis) kpis.forEach(r => { if (r.indicator) kpiMap[r.indicator] = r; });

    let html = '';

    // Section 1: Region ranking
    if (regions || provinces) {
      html += `<div class="report-section"><h3>一、区域排名</h3>`;
      if (last.totalIndex) html += `<p>本季度温州市综合共生发展指数为 <strong>${parseFloat(last.totalIndex).toFixed(1)}分</strong>。</p>`;
      if (provinces && provinces.length > 0) {
        const sorted = [...provinces].sort((a,b)=>parseFloat(b.total)-parseFloat(a.total));
        html += `<table class="rank-table" style="margin:12px 0"><thead><tr><th>排名</th><th>城市</th><th>综合</th><th>资源交互</th><th>协同发展</th><th>政策环境</th><th>发展效能</th></tr></thead><tbody>`;
        html += sorted.map((p,i)=>`<tr><td>${i+1}</td><td><strong>${p.city}</strong></td><td>${p.total}</td><td>${p.d1||'—'}</td><td>${p.d2||'—'}</td><td>${p.d3||'—'}</td><td>${p.d4||'—'}</td></tr>`).join('');
        html += '</tbody></table>';
      }
      html += '</div>';
    }

    // Section 2: Key indicators
    html += `<div class="report-section"><h3>二、关键指标摘要</h3><ul>`;
    const indicatorItems = [
      ['综合共生发展指数', last.totalIndex, '分'],
      ['融资成本匹配比', last.costMatch || kpiMap['costMatch']?.value, '%（>100%表明融资成本侵蚀利润）'],
      ['供应链金融渗透率', last.supplyRate, '%'],
      ['信用平台覆盖率', last.creditRate, '%'],
      ['民营经济占GDP比重', last.gdpShare, '%'],
      ['制造业PMI', last.pmi, ''],
      ['普惠贷款余额增速', last.policyGrowth, '%'],
      ['研发投入转化率', last.rndTrend, '%'],
    ];
    indicatorItems.forEach(([name, val, unit]) => {
      if (val) html += `<li>${name}：<strong>${parseFloat(val).toFixed(1)}${unit}</strong></li>`;
    });
    if (kpis) kpis.forEach(r => {
      if (!indicatorItems.some(([,, ]) => false)) {
        html += `<li>${r.indicator}：<strong>${r.value}${r.unit||''}</strong>${r.trend?` ${r.trend}`:''}</li>`;
      }
    });
    html += '</ul></div>';

    // Section 3: Warnings (inline)
    html += `<div class="report-section"><h3>三、风险预警</h3>`;
    const cm = parseFloat(last.costMatch || kpiMap['costMatch']?.value || 0);
    const sr = parseFloat(last.supplyRate || 0);
    if (cm > 100) html += `<div style="background:#fff5f5;border-left:3px solid #ef4444;padding:9px 14px;border-radius:0 6px 6px 0;margin-bottom:8px;font-size:13px;">融资成本匹配比 ${cm.toFixed(1)}%，超过100%基准，侵蚀企业利润空间</div>`;
    if (sr > 0 && sr < 40) html += `<div style="background:#fffbf0;border-left:3px solid #dd6b20;padding:9px 14px;border-radius:0 6px 6px 0;margin-bottom:8px;font-size:13px;">供应链金融渗透率${sr.toFixed(1)}%，低于目标值40%</div>`;
    html += '</div>';

    // Section 4: Policy recommendations
    html += `<div class="report-section"><h3>四、政策建议</h3>`;
    const recs = [
      cm > 100 && `<div class="policy-rec-item"><strong>财政贴息支持：</strong>针对融资成本超利润率问题（当前${cm.toFixed(1)}%），推出专项贴息产品，目标将匹配比降至100%以下</div>`,
      sr < 40 && `<div class="policy-rec-item"><strong>扩大供应链金融覆盖：</strong>联合本地银行推广供应链融资产品，从当前${sr.toFixed(1)}%提升至40%以上</div>`,
      `<div class="policy-rec-item"><strong>优化审批流程：</strong>推动银行数字化审批，开发"循环贷"产品，将中小企业贷款审批周期压缩至5天以内</div>`,
      `<div class="policy-rec-item"><strong>信用平台扩容：</strong>扩大企业接入信用信息共享平台，目标覆盖率≥80%，降低信息不对称</div>`,
    ].filter(Boolean);
    html += recs.join('') + '</div>';

    document.getElementById('reportBody').innerHTML = html;
  },
};

// ============================================================
// 8. DATA MANAGEMENT UI
// ============================================================
const DataUI = {
  _currentDataset: null,
  _pendingHeaders: [],
  _pendingRows: [],

  init() {
    // Source type tabs
    document.querySelectorAll('.src-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.src-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.src-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + btn.dataset.src).classList.add('active');
      });
    });

    this.renderDatasetStatus();
    this.renderApiList();
    this.renderTemplateList();
  },

  renderDatasetStatus() {
    const datasets = DataStore.listDatasets();
    const grid = document.getElementById('datasetStatusGrid');
    grid.innerHTML = datasets.map(ds => {
      const cls = ds.loaded ? (ds.api ? 'has-data api-source' : 'has-data') : 'no-data';
      const badge = ds.loaded ? (ds.api ? 'api' : 'loaded') : 'empty';
      const badgeText = ds.loaded ? (ds.meta?.source === 'api' ? 'API' : '已导入') : '未加载';
      const updatedAt = ds.meta?.updatedAt ? new Date(ds.meta.updatedAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
      const rowCount = ds.loaded && Array.isArray(DataStore.get(ds.key)) ? `${DataStore.get(ds.key).length} 行` : '';
      return `<div class="ds-card ${cls}" onclick="DataUI.previewDataset('${ds.key}')">
        <div class="ds-header">
          <div class="ds-name">${ds.label}</div>
          <span class="ds-badge ${badge}">${badgeText}</span>
        </div>
        <div class="ds-meta">${ds.desc}</div>
        ${rowCount || updatedAt ? `<div class="ds-meta" style="margin-top:4px;">${rowCount}${rowCount&&updatedAt?' · ':''} ${updatedAt}</div>` : ''}
        <div class="ds-actions">
          ${ds.api ? `<button class="btn-xs" onclick="event.stopPropagation();DataUI.editApi('${ds.key}')">编辑API</button>
            <button class="btn-xs" onclick="event.stopPropagation();DataUI.refreshApi('${ds.key}')">↻刷新</button>` :
            `<button class="btn-xs" onclick="event.stopPropagation();document.getElementById('importDataset').value='${ds.key}';document.querySelector('.src-tab[data-src=import]').click()">导入</button>`}
          ${ds.loaded ? `<button class="btn-xs danger" onclick="event.stopPropagation();DataUI.confirmClear('${ds.key}')">清除</button>` : ''}
        </div>
      </div>`;
    }).join('');

    // Update global badge
    const badge = document.getElementById('globalDataBadge');
    const count = datasets.filter(d=>d.loaded).length;
    badge.textContent = count > 0 ? `已加载 ${count}/${datasets.length} 数据集` : '未加载数据';
    badge.className = 'data-status-badge' + (count > 0 ? ' has-data' : '');
  },

  renderApiList() {
    const apis = DataStore.getAllApis();
    const list = document.getElementById('apiDatasetList');
    const keys = Object.keys(apis);
    if (keys.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted);font-size:12px;padding:8px;">暂无配置的API端点，点击下方添加</div>';
      return;
    }
    list.innerHTML = keys.map(key => {
      const cfg = apis[key];
      const schema = SCHEMAS[key];
      const meta = DataStore.getMeta(key);
      const isLoaded = DataStore.hasData(key);
      return `<div class="api-item">
        <div class="api-item-header">
          <span class="api-item-type">${schema?.label || key}</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="api-item-status ${isLoaded?'ok':''}"></div>
            ${meta?.updatedAt ? `<span style="font-size:10px;color:var(--text-muted)">${new Date(meta.updatedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</span>` : ''}
          </div>
        </div>
        <div class="api-item-url">${cfg.method} ${cfg.url}</div>
        <div class="api-item-actions">
          <button class="btn-xs" onclick="DataUI.editApi('${key}')">编辑</button>
          <button class="btn-xs" onclick="DataUI.refreshApi('${key}')">↻ 刷新</button>
          <button class="btn-xs danger" onclick="DataUI.removeApi('${key}')">删除</button>
        </div>
      </div>`;
    }).join('');
  },

  renderTemplateList() {
    const list = document.getElementById('templateList');
    list.innerHTML = Object.keys(SCHEMAS).map(key => {
      const s = SCHEMAS[key];
      return `<div class="template-item">
        <span>${s.label}</span>
        <button class="btn-dl" onclick="FileParser.generateCsv('${key}')">↓ CSV模板</button>
      </div>`;
    }).join('');
  },

  previewDataset(key) {
    this._currentDataset = key;
    const data = DataStore.get(key);
    const card = document.getElementById('previewCard');
    if (!data || !Array.isArray(data) || data.length === 0) { card.style.display = 'none'; return; }
    card.style.display = 'block';
    document.getElementById('previewTitle').textContent = `数据预览 — ${SCHEMAS[key]?.label || key}`;
    document.getElementById('previewMeta').textContent = `共 ${data.length} 行`;
    const headers = Object.keys(data[0]);
    document.getElementById('previewThead').innerHTML = '<tr>' + headers.map(h=>`<th>${h}</th>`).join('') + '</tr>';
    const rows = data.slice(0,50);
    document.getElementById('previewTbody').innerHTML = rows.map(row =>
      '<tr>' + headers.map(h=>`<td>${row[h]??''}</td>`).join('') + '</tr>'
    ).join('');
  },

  confirmClear(key) {
    if (confirm(`确认清除"${SCHEMAS[key]?.label||key}"数据集？`)) {
      DataStore.clear(key);
      this.renderDatasetStatus();
      document.getElementById('previewCard').style.display = 'none';
    }
  },

  async refreshApi(key) {
    const cfg = DataStore.getApi(key);
    if (!cfg) { alert('API未配置'); return; }
    try {
      await ApiLayer.fetchAndStore(cfg);
      this.renderDatasetStatus();
      this.renderApiList();
      App.refreshAllCharts();
      alert(`${SCHEMAS[key]?.label||key} 数据已更新`);
    } catch (e) {
      alert('API请求失败：' + e.message);
    }
  },

  editApi(key) {
    const cfg = DataStore.getApi(key) || {};
    document.getElementById('apiDatasetType').value = key;
    document.getElementById('apiUrl').value = cfg.url || '';
    document.getElementById('apiMethod').value = cfg.method || 'GET';
    document.getElementById('apiAuth').value = cfg.auth || '';
    document.getElementById('apiHeaders').value = cfg.headers || '';
    document.getElementById('apiDataPath').value = cfg.dataPath || '';
    document.getElementById('apiBody').value = cfg.body || '';
    document.getElementById('apiRefreshInterval').value = cfg.refreshInterval || '0';
    document.getElementById('apiModal').style.display = 'flex';
  },

  removeApi(key) {
    if (confirm(`删除"${SCHEMAS[key]?.label||key}"的API配置？（已导入数据保留）`)) {
      ApiLayer.stopAutoRefresh(key);
      DataStore.removeApi(key);
      this.renderApiList();
      this.renderDatasetStatus();
    }
  },

  // File import flow
  async processFile(file) {
    try {
      const dataset = document.getElementById('importDataset').value;
      const { headers, rows } = await FileParser.parse(file);
      this._pendingHeaders = headers;
      this._pendingRows = rows;
      this.showMappingUI(dataset, headers);
      document.getElementById('uploadZone').querySelector('.upload-hint').textContent = `已读取: ${file.name} (${rows.length}行)`;
    } catch (e) {
      alert('文件解析失败：' + e.message);
    }
  },

  showMappingUI(dataset, headers) {
    const schema = SCHEMAS[dataset];
    if (!schema) return;
    const section = document.getElementById('mappingSection');
    section.style.display = 'block';
    const fieldsHtml = schema.fields.map(f => {
      // Auto-match: find header that matches key or label
      const autoMatch = headers.find(h => h.toLowerCase() === f.key.toLowerCase() || h === f.label) || '';
      return `<div class="mapping-row">
        <div class="field-name">${f.label}${f.required?' *':''}<br><code style="font-size:10px;color:#9ca3af">${f.key}</code></div>
        <div class="arrow">→</div>
        <select data-field="${f.key}">
          <option value="">（跳过）</option>
          ${headers.map(h=>`<option value="${h}" ${h===autoMatch?'selected':''}>${h}</option>`).join('')}
        </select>
      </div>`;
    }).join('');
    document.getElementById('mappingFields').innerHTML = fieldsHtml;
  },

  applyMapping() {
    const dataset = document.getElementById('importDataset').value;
    const schema = SCHEMAS[dataset];
    const selects = document.querySelectorAll('#mappingFields select');
    const mapping = {};
    selects.forEach(sel => { if (sel.value) mapping[sel.dataset.field] = sel.value; });

    const required = schema.fields.filter(f=>f.required).map(f=>f.key);
    const missing = required.filter(k=>!mapping[k]);
    if (missing.length > 0) { alert(`缺少必填字段映射：${missing.join(', ')}`); return; }

    const data = this._pendingRows.map(row => {
      const mapped = {};
      Object.entries(mapping).forEach(([field, col]) => { mapped[field] = row[col]; });
      return mapped;
    }).filter(row => Object.values(row).some(v => v !== undefined && v !== ''));

    DataStore.set(dataset, data);
    this.cancelMapping();
    this.renderDatasetStatus();
    this.previewDataset(dataset);
    App.refreshAllCharts();
    alert(`成功导入 ${data.length} 条数据到"${schema.label}"`);
  },

  cancelMapping() {
    document.getElementById('mappingSection').style.display = 'none';
    this._pendingHeaders = [];
    this._pendingRows = [];
  },
};

// ============================================================
// 9. APP CONTROLLER
// ============================================================
const App = {
  _tabInited: {},
  _editingApiKey: null,

  init() {
    DataUI.init();
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.tab-section').forEach(s=>s.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('tab-' + tab).classList.add('active');
        this.renderTab(tab);
      });
    });

    // Data change listener — refresh visible tab
    DataStore.on(dataset => {
      DataUI.renderDatasetStatus();
      DataUI.renderApiList();
      // Re-render current active tab
      const activeTab = document.querySelector('.nav-tab.active')?.dataset.tab;
      if (activeTab && activeTab !== 'data') {
        this._tabInited[activeTab] = false;
        this.renderTab(activeTab);
      }
    });

    // Restore auto-refresh timers for saved APIs
    Object.values(DataStore.getAllApis()).forEach(cfg => {
      if (cfg.refreshInterval && cfg.refreshInterval !== '0') {
        ApiLayer.startAutoRefresh(cfg.dataset, cfg);
      }
    });
  },

  renderTab(tab) {
    if (tab === 'data') return;
    Charts.destroyAll();
    this._tabInited[tab] = true;
    switch(tab) {
      case 'overview': Modules.renderOverview(); break;
      case 'resource': Modules.renderResource(); break;
      case 'synergy':  Modules.renderSynergy();  break;
      case 'policy':   Modules.renderPolicy();   break;
      case 'effect':   Modules.renderEffect();   break;
      case 'warning':  Modules.renderWarning();  break;
      case 'report':   Modules.renderReport();   break;
    }
  },

  refreshAllCharts() {
    const active = document.querySelector('.nav-tab.active')?.dataset.tab;
    if (active && active !== 'data') {
      Charts.destroyAll();
      this.renderTab(active);
    }
  },

  refreshAllData() {
    const apis = DataStore.getAllApis();
    const keys = Object.keys(apis);
    if (keys.length === 0) { alert('未配置API端点，请先在"数据管理"中添加API或导入文件'); return; }
    Promise.all(keys.map(k => ApiLayer.fetchAndStore(apis[k]).catch(e => console.warn(k, e))))
      .then(() => { DataUI.renderDatasetStatus(); this.refreshAllCharts(); });
  },

  goToTab(tab) {
    document.querySelector(`.nav-tab[data-tab="${tab}"]`)?.click();
  },

  exportReport() {
    this.goToTab('report');
    setTimeout(() => window.print(), 500);
  },

  // File handlers
  handleFileDrop(event) {
    event.preventDefault();
    document.getElementById('uploadZone').classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file) DataUI.processFile(file);
  },

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) DataUI.processFile(file);
    event.target.value = '';
  },

  // API Modal
  addApiEndpoint() {
    this._editingApiKey = null;
    ['apiUrl','apiAuth','apiHeaders','apiDataPath','apiBody'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('apiMethod').value = 'GET';
    document.getElementById('apiRefreshInterval').value = '0';
    document.getElementById('apiTestStatus').textContent = '';
    document.getElementById('apiTestResult').style.display = 'none';
    document.getElementById('apiModal').style.display = 'flex';
  },

  closeApiModal() {
    document.getElementById('apiModal').style.display = 'none';
  },

  async testApiEndpoint() {
    const cfg = this._buildApiConfig();
    const status = document.getElementById('apiTestStatus');
    const resultBox = document.getElementById('apiTestResult');
    status.textContent = '测试中...';
    status.style.color = 'var(--text-muted)';
    try {
      const data = await ApiLayer.fetch(cfg);
      status.textContent = '✓ 连接成功';
      status.style.color = 'var(--accent2)';
      resultBox.style.display = 'block';
      document.getElementById('apiTestPre').textContent = JSON.stringify(data, null, 2).slice(0, 3000);
    } catch (e) {
      status.textContent = '✗ 失败: ' + e.message;
      status.style.color = 'var(--danger)';
      resultBox.style.display = 'none';
    }
  },

  async saveApiEndpoint() {
    const cfg = this._buildApiConfig();
    if (!cfg.url) { alert('请填写 API URL'); return; }
    DataStore.saveApi(cfg);
    ApiLayer.stopAutoRefresh(cfg.dataset);
    try {
      await ApiLayer.fetchAndStore(cfg);
      ApiLayer.startAutoRefresh(cfg.dataset, cfg);
      this.closeApiModal();
      DataUI.renderDatasetStatus();
      DataUI.renderApiList();
      this.refreshAllCharts();
    } catch (e) {
      if (confirm(`API请求失败：${e.message}\n\n是否仍然保存配置？`)) {
        this.closeApiModal();
        DataUI.renderApiList();
      }
    }
  },

  _buildApiConfig() {
    return {
      dataset: document.getElementById('apiDatasetType').value,
      url: document.getElementById('apiUrl').value.trim(),
      method: document.getElementById('apiMethod').value,
      auth: document.getElementById('apiAuth').value.trim(),
      headers: document.getElementById('apiHeaders').value.trim(),
      dataPath: document.getElementById('apiDataPath').value.trim(),
      body: document.getElementById('apiBody').value.trim(),
      refreshInterval: document.getElementById('apiRefreshInterval').value,
    };
  },

  simulateSubsidy(val) {
    const v = parseFloat(val);
    document.getElementById('subsidyVal').textContent = (v>=0?'+':'') + v + '%';
    const trend = DataStore.get('trend');
    const kpis = DataStore.get('kpis');
    const kpiMap = {};
    if (kpis) kpis.forEach(r=>{ if(r.indicator) kpiMap[r.indicator]=r; });
    const last = trend && trend.length > 0 ? trend[trend.length-1] : {};
    const baseCm = parseFloat(last.costMatch || kpiMap['costMatch']?.value || 0);
    const delta = (v * 0.8).toFixed(1);
    document.getElementById('simDelta').textContent = (delta>0?'+':'')+delta;
    document.getElementById('simCostMatch').textContent = baseCm ? (baseCm - v * 2.1).toFixed(1) + '%' : '—';
  },

  clearDataset() {
    if (DataUI._currentDataset) DataUI.confirmClear(DataUI._currentDataset);
  },
};

// ============================================================
// BOOT
// ============================================================
App.init();
