// Pakshi Expenses — Scriptable V6
// Google Sheets-backed prototype.
// Native iOS/Supabase track is intentionally untouched.
//
// First run:
// Enter the deployed Apps Script Web App URL.
// No API token is used in this prototype because the underlying Google Sheet
// is configured as "Anyone with the link can edit".
const APP = { urlKey:"pakshi.scriptable.apiURL" };

const DEFAULT_CATEGORIES=[
["food","Food & Dining","food-dining"],["groceries","Groceries","groceries"],["shopping","Shopping","shopping"],
["travel","Travel","travel"],["transport","Transport","transport"],["bills","Bills","bills"],
["entertainment","Entertainment","entertainment"],["health","Health","health"],["home","Home","home"],["other","Other","other"]
].map((x,i)=>({id:x[0],name:x[1],iconKey:x[2],sortOrder:i,isDefault:true}));

const ICONS={
 "food-dining":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v18M15 12v12M25 12v12M15 24h10M20 30v22"/><path d="M42 12c-8 7-8 18 0 24v16M42 12c8 7 8 18 0 24M42 36h7V12"/></g><circle cx="20" cy="30" r="2.5" fill="#B67A5A"/></svg>',
 "groceries":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 24h36l-4 29H18z"/><path d="M23 24c0-9 4-14 9-14s9 5 9 14"/><path d="M24 34h16"/><path d="M28 42h8"/></g><path d="M12 20c5-3 9-5 14-5" stroke="#A5A98A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
 "shopping":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 23h36l-3 30H17z"/><path d="M24 23c0-7 3-12 8-12s8 5 8 12"/><path d="M21 31h22"/></g><circle cx="24" cy="46" r="2" fill="#D69B86"/><circle cx="40" cy="46" r="2" fill="#D69B86"/></svg>',
 "travel":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 39l42-20c3-1 5 3 2 5L16 47l-9-2z"/><path d="M29 31l-3-13 4-2 8 10M20 43l2 9-4 2-7-9"/></g><path d="M47 15c3-4 7-5 10-3-1 4-4 7-8 8" fill="none" stroke="#A5A98A" stroke-width="3" stroke-linecap="round"/></svg>',
 "transport":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 40l3-17c1-5 5-8 10-8h8c5 0 9 3 10 8l3 17"/><path d="M13 40h38v9H13z"/><circle cx="21" cy="49" r="4"/><circle cx="43" cy="49" r="4"/><path d="M20 29h24M28 15v8"/></g></svg>',
 "bills":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 10h30v44l-5-4-5 4-5-4-5 4-5-4-5 4z"/><path d="M24 23h16M24 31h16M24 39h10"/></g><circle cx="42" cy="39" r="4" fill="#D69B86"/></svg>',
 "entertainment":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21h34v28H15z"/><path d="M25 21l5-8h4l5 8"/><path d="M30 30l10 5-10 5z"/></g><path d="M19 16l-4-5M45 16l4-5" stroke="#A5A98A" stroke-width="3" stroke-linecap="round"/></svg>',
 "health":'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 51S12 40 12 25c0-7 5-12 12-12 4 0 7 2 8 5 2-3 5-5 9-5 7 0 11 5 11 12 0 15-20 26-20 26z" fill="#E7C4B7" stroke="#8B533B" stroke-width="3"/><path d="M32 23v14M25 30h14" stroke="#8B533B" stroke-width="3" stroke-linecap="round"/></svg>',
 "home":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#8B533B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 30L32 12l22 18"/><path d="M16 27v25h32V27"/><path d="M27 52V38h10v14"/></g><path d="M22 30h20" stroke="#A5A98A" stroke-width="3"/></svg>',
 "other":'<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#B67A5A"><circle cx="18" cy="32" r="4"/><circle cx="32" cy="32" r="4"/><circle cx="46" cy="32" r="4"/></g><path d="M12 20c5-5 11-7 20-7s15 2 20 7" fill="none" stroke="#A5A98A" stroke-width="3" stroke-linecap="round"/></svg>'
};
function iconSvg(key){return ICONS[String(key)]||ICONS.other}
const NAV_ICONS={
 home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5v8.5h-5v-5h-6v5H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 budget:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 15h8M8 11h5M8 7h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
function navIcon(key){return NAV_ICONS[key]||NAV_ICONS.home}
async function configure(){
  let url=Keychain.contains(APP.urlKey)?Keychain.get(APP.urlKey):"";
  if(!url){
    const a=new Alert();a.title="Pakshi Scriptable setup";a.message="Enter the Google Apps Script Web App URL.";
    a.addTextField("Web App URL",url);a.addAction("Save");a.addCancelAction("Cancel");
    if(await a.presentAlert()===-1)throw new Error("Setup cancelled.");
    url=a.textFieldValue(0).trim();
    if(!url)throw new Error("Web App URL is required.");
    Keychain.set(APP.urlKey,url);
  }
  return {url:url.replace(/\/$/,"")};
}

async function api(config,method,action,payload={}){
  const isWrite=method!=="GET";
  const query="?action="+encodeURIComponent(action)+(isWrite
    ?"&payload="+encodeURIComponent(JSON.stringify(payload))
    :"");
  const request=new Request(config.url+query);
  request.method="GET";

  // Apps Script ContentService GET responses redirect to a one-time
  // script.googleusercontent.com URL. GET→GET redirect is reliable in Scriptable.
  request.onRedirect = redirectedRequest => {
    const responseRequest = new Request(redirectedRequest.url);
    responseRequest.method = "GET";
    return responseRequest;
  };

  const raw=await request.loadString();

  let result;
  try{
    result=JSON.parse(raw);
  }catch(error){
    console.log("Backend returned invalid JSON:");
    console.log(raw);
    throw new Error("Backend returned invalid JSON");
  }

  if(!result.ok)throw new Error(result.error||"Backend error");
  return result;
}

function normalize(data){
 return {
  members:data.members?.length?data.members:[{id:"member-1",name:"Husband",role:"first"},{id:"member-2",name:"Wife",role:"second"}],
  categories:data.categories?.length?data.categories:DEFAULT_CATEGORIES,
  expenses:(data.expenses||[]).map(normalizeExpense),income:data.income||[],savings:data.savings||[],budgets:data.budgets||[]
 };
}
function normalizeExpense(x){return {id:String(x.id),date:dateString(x.date),amount:Number(x.amount||0),categoryId:String(x.categoryId||"other"),description:String(x.description||""),paymentMethod:String(x.paymentMethod||"card").toLowerCase(),paidBy:String(x.paidBy||"member-1"),notes:String(x.notes||""),createdAt:x.createdAt||"",updatedAt:x.updatedAt||""};}
function dateString(v){if(!v)return "";if(typeof v==="string")return v.slice(0,10);return new Date(v).toISOString().slice(0,10);}
function uuid(){return "p-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10);}
function today(){return new Date().toISOString().slice(0,10);}
function catName(d,id){return (d.categories.find(x=>String(x.id)===String(id))||{}).name||"Other"}
function memberName(d,id){return (d.members.find(x=>String(x.id)===String(id))||{}).name||""}

function htmlFor(data){
const serialized=JSON.stringify(data).replace(/<\/script/gi,"<\\/script");
return String.raw`
<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
:root{--bg:#f4ecdc;--surface:#fbf7f0;--text:#604536;--muted:#927f70;--accent:#bd795f;--track:#e5d7c5;--peach:#e8c8a7;--border:rgba(96,69,54,.10)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif}body{min-height:100vh}.app{min-height:100vh;padding:95px 18px 112px}
.screen{display:none}.screen.active{display:block}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:26px}.month{font-size:25px;font-weight:600}.page-title,.section-title{font-size:25px;font-weight:600;letter-spacing:-.4px;margin:0 0 18px}.section-title{margin-bottom:14px}
.cards,.list{display:flex;flex-direction:column;gap:11px}.card,.row{background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:0 4px 14px rgba(96,69,54,.06)}.card{padding:18px}.summary{cursor:pointer;min-height:116px}.label{font-size:16px;color:var(--muted);margin-bottom:7px}.amount{font-size:38px;font-weight:600;letter-spacing:-1px;line-height:1.05}.sub,.muted{font-size:15px;color:var(--muted);margin-top:8px}.meta{display:flex;justify-content:space-between;font-size:15px;color:var(--muted);margin-top:9px}
.progress{height:8px;background:var(--track);border-radius:99px;overflow:hidden;margin-top:13px}.fill{height:100%;background:var(--accent);border-radius:99px}.section{margin-top:30px}.row{padding:14px;display:flex;align-items:center;gap:12px;cursor:pointer}.icon{width:42px;height:42px;border-radius:13px;background:var(--peach);display:flex;align-items:center;justify-content:center;flex:none;padding:7px}.icon svg{width:100%;height:100%;display:block}.navicon{width:22px;height:22px;display:block}.navicon svg{width:100%;height:100%;display:block}.info{flex:1}.name{font-size:16px;font-weight:500}.right{font-size:16px;font-weight:600}.back{color:var(--accent);font-size:16px;padding:6px 0;margin-bottom:20px;cursor:pointer}
.form{display:flex;flex-direction:column;gap:14px}.field{display:flex;flex-direction:column;gap:7px}.field label{font-size:15px;color:var(--muted)}input,select,textarea{width:100%;border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:14px;padding:14px;font:inherit;outline:none}textarea{min-height:88px;resize:none}.primary{width:100%;min-height:52px;border-radius:16px;background:var(--accent);color:white;font-weight:600;font-size:17px;margin-top:8px}.secondary{width:100%;min-height:48px;border-radius:15px;background:var(--surface);color:var(--text);border:1px solid var(--border);font-weight:600;margin-top:9px}.chipbar{display:flex;gap:8px;overflow:auto;margin-bottom:14px}.chip{padding:9px 13px;border-radius:14px;background:var(--surface);border:1px solid var(--border);color:var(--muted);white-space:nowrap}.chip.active{background:var(--accent);color:white}.empty{text-align:center;padding:28px 18px;color:var(--muted)}
.nav{position:fixed;left:14px;right:14px;bottom:14px;height:76px;background:rgba(251,247,240,.97);border:1px solid var(--border);border-radius:24px;box-shadow:0 8px 28px rgba(96,69,54,.12);display:flex;align-items:center;justify-content:space-around;z-index:100}.navbtn{background:transparent;color:var(--muted);min-width:58px;height:58px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.navbtn.active{color:var(--accent)}.navicon{font-size:20px}.navlabel{font-size:12px}.plus{width:58px;height:58px;border:0;border-radius:20px;background:var(--accent);color:white;display:flex;align-items:center;justify-content:center}.plus svg{width:28px;height:28px;display:block}.toast{position:fixed;left:24px;right:24px;bottom:104px;background:var(--text);color:white;padding:13px 16px;border-radius:14px;text-align:center;opacity:0;transform:translateY(10px);transition:.2s;z-index:200}.toast.show{opacity:1;transform:none}.danger{color:#9b5c4c}
</style></head><body><div class="app">

<section id="home" class="screen active"><div class="header"><div class="month" id="home-month"></div></div><h1 class="section-title">Overview</h1><div class="cards" id="summary"></div><div class="section"><div class="header" style="margin-bottom:14px"><h2 class="section-title" style="margin:0">Spending by category</h2><button class="chip" data-action="categories">See all</button></div><div class="list" id="home-categories"></div></div></section>

<section id="add" class="screen"><div class="back" data-screen="home">‹ Back</div><h1 class="page-title">Add Expense</h1><form id="expense-form" class="form">
<div class="field"><label>Amount</label><input id="amount" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="₹0" required></div>
<div class="field"><label>Date</label><input id="date" type="date" required></div><div class="field"><label>Category</label><select id="category" required></select></div>
<div class="field"><label>Description</label><input id="description" type="text" placeholder="e.g. Zomato dinner" required></div>
<div class="field"><label>Payment method</label><select id="payment"><option value="card">Card</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="other">Other</option></select></div>
<div class="field"><label>Paid by</label><select id="paidBy"></select></div><div class="field"><label>Notes (optional)</label><textarea id="notes" placeholder="Add a note"></textarea></div><button class="primary" type="submit">Save Expense</button></form></section>

<section id="budget" class="screen"><h1 class="page-title">Budget</h1><div id="budget-content"></div></section>
<section id="budget-edit" class="screen"><div class="back" data-screen="budget">‹ Back</div><h1 class="page-title">Edit Budget</h1><form id="budget-form" class="form">
<div class="field"><label>Monthly household budget</label><input id="budget-monthly" type="number" min="0" step="0.01" placeholder="₹0"></div>
<div class="section"><h2 class="section-title">Category budgets</h2><div id="budget-category-fields" class="form"></div></div>
<button class="primary">Save Budget</button></form></section>
<section id="settings" class="screen"><h1 class="page-title">Settings</h1><div class="list"><div class="card"><div class="label">Household members</div><div class="muted">These names are used when recording who paid an expense.</div><form id="members-form" class="form" style="margin-top:14px"><div class="field"><label>First member</label><input id="member-first" type="text" required></div><div class="field"><label>Second member</label><input id="member-second" type="text" required></div><button class="primary">Save Members</button></form></div><div class="card"><div class="label">Default payment method</div><select id="default-payment"><option value="card">Card</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="other">Other</option></select></div><div class="card"><div class="label">Data</div><button class="secondary" data-action="export">Export CSV</button></div><div class="card"><div class="label">About</div><div class="muted">Pakshi Expenses — Scriptable V6</div></div></div></section>

<section id="income-detail" class="screen"><div class="back" data-screen="home">‹ Back</div><h1 class="page-title">Income</h1><div id="income-content"></div></section>
<section id="savings-detail" class="screen"><div class="back" data-screen="home">‹ Back</div><h1 class="page-title">Savings</h1><div id="savings-content"></div></section>
<section id="expenses-detail" class="screen"><div class="back" data-screen="home">‹ Back</div><h1 class="page-title">Expenses</h1><div id="expenses-content"></div></section>
<section id="categories-detail" class="screen"><div class="back" data-screen="home">‹ Back</div><h1 class="page-title">Categories</h1><div id="categories-content"></div></section>
<section id="category-detail" class="screen"><div class="back" data-screen="categories-detail">‹ Back</div><h1 class="page-title" id="category-detail-title">Category</h1><div id="category-detail-content"></div></section>

<section id="edit-expense" class="screen"><div class="back" data-screen="expenses-detail">‹ Back</div><h1 class="page-title">Edit Expense</h1><form id="edit-form" class="form">
<input id="edit-id" type="hidden"><div class="field"><label>Amount</label><input id="edit-amount" type="number" min="0.01" step="0.01" required></div><div class="field"><label>Date</label><input id="edit-date" type="date" required></div><div class="field"><label>Category</label><select id="edit-category"></select></div><div class="field"><label>Description</label><input id="edit-description" required></div><div class="field"><label>Payment method</label><select id="edit-payment"><option value="card">Card</option><option value="upi">UPI</option><option value="cash">Cash</option><option value="other">Other</option></select></div><div class="field"><label>Paid by</label><select id="edit-paidBy"></select></div><div class="field"><label>Notes</label><textarea id="edit-notes"></textarea></div><button class="primary">Save Changes</button><button class="secondary danger" type="button" id="delete-expense">Delete Expense</button></form></section>

<section id="income-edit" class="screen"><div class="back" data-screen="income-detail">‹ Back</div><h1 class="page-title">Income Details</h1><form id="income-form" class="form"><div class="field"><label>First member income</label><input id="income-first" type="number" min="0" step="0.01"></div><div class="field"><label>Second member income</label><input id="income-second" type="number" min="0" step="0.01"></div><button class="primary">Save Income</button></form></section>

<section id="savings-edit" class="screen"><div class="back" data-screen="savings-detail">‹ Back</div><h1 class="page-title">Savings Details</h1><form id="savings-form" class="form"><div class="field"><label>First member account</label><input id="save-first" type="number" min="0" step="0.01"></div><div class="field"><label>Second member account</label><input id="save-second" type="number" min="0" step="0.01"></div><div class="field"><label>Common account</label><input id="save-common" type="number" min="0" step="0.01"></div><button class="primary">Save Savings</button></form></section>

</div><nav class="nav"><button class="navbtn active" data-screen="home"><span class="navicon">${navIcon("home")}</span><span class="navlabel">Home</span></button><button class="navbtn" data-screen="add"><span class="navicon">＋</span><span class="navlabel">Add</span></button><button class="plus" data-screen="add" aria-label="Add expense"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button class="navbtn" data-screen="budget"><span class="navicon">${navIcon("budget")}</span><span class="navlabel">Budget</span></button><button class="navbtn" data-screen="settings"><span class="navicon">${navIcon("settings")}</span><span class="navlabel">Settings</span></button></nav><div id="toast" class="toast"></div>

<script>
let DATA=${serialized};let currentSort="recent";let selectedCategoryId="";const month=new Date().toISOString().slice(0,7);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2}),pct=n=>Math.round(n)+"%",cat=id=>DATA.categories.find(x=>String(x.id)===String(id))||DATA.categories[DATA.categories.length-1],member=id=>DATA.members.find(x=>String(x.id)===String(id))||DATA.members[0],fmtDate=d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"";
function ex(){return DATA.expenses.filter(x=>x.date.startsWith(month))}function spent(){return ex().reduce((s,x)=>s+x.amount,0)}function budgetFor(id=""){const b=DATA.budgets.find(x=>String(x.month).slice(0,7)===month&&String(x.categoryId||"")===String(id));return b?Number(b.amount||0):0}function income(){const x=DATA.income.find(x=>String(x.month).slice(0,7)===month);return x?Number(x.firstMemberAmount||0)+Number(x.secondMemberAmount||0):0}function savings(){return DATA.savings.reduce((s,x)=>s+Number(x.amount||0),0)}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".navbtn").forEach(x=>x.classList.toggle("active",x.dataset.screen===id));window.scrollTo(0,0);render()}function action(p){location.href="pakshi-action://"+encodeURIComponent(JSON.stringify(p))}
function render(){
 document.getElementById("home-month").textContent=new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"});
 const s=spent(),b=budgetFor(),u=b?Math.min(100,s/b*100):0;
 document.getElementById("summary").innerHTML='<div class="card summary" data-screen="income-detail"><div class="label">Income</div><div class="amount">'+money(income())+'</div><div class="sub">Tap to view details</div></div><div class="card summary" data-screen="savings-detail"><div class="label">Savings</div><div class="amount">'+money(savings())+'</div><div class="sub">Tap to view details</div></div><div class="card summary" data-screen="expenses-detail"><div class="label">Expenses</div><div class="amount">'+money(s)+'</div><div class="meta"><span>'+ (b?"of "+money(b)+" budget":"No monthly budget set")+'</span><span>'+pct(u)+'</span></div><div class="progress"><div class="fill" style="width:'+u+'%"></div></div><div class="meta"><span></span><span>'+ (b?money(Math.max(0,b-s))+" remaining":"Set a budget")+'</span></div></div>';
 const rows=DATA.categories.map(c=>({...c,spent:ex().filter(x=>String(x.categoryId)===String(c.id)).reduce((a,x)=>a+x.amount,0)})).filter(x=>x.spent>0).sort((a,b)=>b.spent-a.spent);const total=s||1;
 document.getElementById("home-categories").innerHTML=rows.length?rows.slice(0,5).map(c=>'<div class="row" data-category-detail="'+c.id+'"><div class="icon">'+iconSvg(c.iconKey)+'</div><div class="info"><div class="name">'+c.name+'</div><div class="muted">'+pct(c.spent/total*100)+'</div><div class="progress"><div class="fill" style="width:'+Math.min(100,c.spent/total*100)+'%"></div></div></div><div class="right">'+money(c.spent)+'</div></div>').join(""):'<div class="card empty">No expenses yet.<br><br>Tap + to add one.</div>';
 fillSelects();renderMembers();renderBudget();renderBudgetEdit();renderIncome();renderSavings();renderExpenses();renderCategories();renderCategoryDetail();
}
function renderMembers(){const first=DATA.members.find(x=>x.role==="first")||DATA.members[0]||{};const second=DATA.members.find(x=>x.role==="second")||DATA.members[1]||{};document.getElementById("member-first").value=first.name||"";document.getElementById("member-second").value=second.name||""}
function fillSelects(){["category","edit-category"].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=DATA.categories.map(c=>'<option value="'+c.id+'">'+c.name+'</option>').join("")});["paidBy","edit-paidBy"].forEach(id=>{const e=document.getElementById(id);if(e)e.innerHTML=DATA.members.map(m=>'<option value="'+m.id+'">'+m.name+'</option>').join("")})}
function renderBudgetEdit(){
 const monthly=document.getElementById("budget-monthly");
 if(monthly) monthly.value=budgetFor("");
 const container=document.getElementById("budget-category-fields");
 if(!container)return;
 container.innerHTML=DATA.categories.map(c=>{
   const value=budgetFor(c.id);
   return '<div class="field"><label>'+c.iconKey+' '+c.name+'</label><input class="budget-category" data-category-id="'+c.id+'" type="number" min="0" step="0.01" value="'+(value||"")+'" placeholder="₹0"></div>';
 }).join("");
}

function renderBudget(){const s=spent(),b=budgetFor();document.getElementById("budget-content").innerHTML='<div class="card"><div class="meta"><span>Monthly budget</span><span>'+money(b)+'</span></div><div class="progress"><div class="fill" style="width:'+Math.min(100,b?s/b*100:0)+'%"></div></div><div class="meta"><span>'+money(s)+' spent</span><span>'+ (b?money(Math.max(0,b-s))+" remaining":"No budget")+'</span></div></div><div class="section"><h2 class="section-title">Category budgets</h2><div class="list">'+DATA.categories.map(c=>{const x=ex().filter(x=>String(x.categoryId)===String(c.id)).reduce((a,x)=>a+x.amount,0),cb=budgetFor(c.id);return '<div class="card"><div class="meta"><span>'+c.iconKey+' '+c.name+'</span><span>'+ (cb?money(cb):"No budget")+'</span></div><div class="progress"><div class="fill" style="width:'+Math.min(100,cb?x/cb*100:0)+'%"></div></div><div class="meta"><span>'+money(x)+' spent</span><span>'+ (cb?money(Math.max(0,cb-x))+" remaining":"")+'</span></div></div>'}).join("")+'</div></div>'}
function renderIncome(){const x=DATA.income.find(x=>String(x.month).slice(0,7)===month)||{};document.getElementById("income-content").innerHTML='<div class="card"><div class="amount">'+money(income())+'</div><div class="sub">Household income this month</div><button class="primary" data-screen="income-edit">Edit Income</button></div>';document.getElementById("income-first").value=x.firstMemberAmount||0;document.getElementById("income-second").value=x.secondMemberAmount||0}
function renderSavings(){document.getElementById("savings-content").innerHTML='<div class="card"><div class="amount">'+money(savings())+'</div><div class="sub">Current household account balances</div><button class="primary" data-screen="savings-edit">Edit Savings</button></div>';const g=k=>DATA.savings.find(x=>x.ownerType===k)?.amount||0;document.getElementById("save-first").value=g("firstMember");document.getElementById("save-second").value=g("secondMember");document.getElementById("save-common").value=g("common")}
function renderExpenses(){const items=[...ex()].sort((a,b)=>currentSort==="amount"?b.amount-a.amount:b.date.localeCompare(a.date));document.getElementById("expenses-content").innerHTML='<div class="card"><div class="amount">'+money(spent())+'</div><div class="sub">September expenses</div></div><div class="section"><div class="chipbar"><button class="chip '+(currentSort==="recent"?"active":"")+'" data-sort="recent">Most recent</button><button class="chip '+(currentSort==="amount"?"active":"")+'" data-sort="amount">Highest amount</button></div><div class="list">'+(items.length?items.map(x=>'<div class="row" data-expense="'+x.id+'"><div class="icon">'+iconSvg(cat(x.categoryId).iconKey)+'</div><div class="info"><div class="name">'+x.description+'</div><div class="muted">'+fmtDate(x.date)+' · '+member(x.paidBy).name+'</div></div><div class="right">'+money(x.amount)+'</div></div>').join(""):'<div class="card empty">No expenses.</div>')+'</div></div>'}
function renderCategories(){document.getElementById("categories-content").innerHTML='<div class="list">'+DATA.categories.map(c=>{const n=ex().filter(x=>String(x.categoryId)===String(c.id)),s=n.reduce((a,x)=>a+x.amount,0);return '<div class="row" data-category-open="'+c.id+'"><div class="icon">'+iconSvg(c.iconKey)+'</div><div class="info"><div class="name">'+c.name+'</div><div class="muted">'+n.length+' expense'+(n.length===1?"":"s")+'</div></div><div class="right">'+money(s)+'</div></div>'}).join("")+'</div>'}
function renderCategoryDetail(){const c=cat(selectedCategoryId);const items=ex().filter(x=>String(x.categoryId)===String(selectedCategoryId)).sort((a,b)=>b.date.localeCompare(a.date));const total=items.reduce((s,x)=>s+x.amount,0);document.getElementById("category-detail-title").textContent=c.name;document.getElementById("category-detail-content").innerHTML='<div class="card"><div class="amount">'+money(total)+'</div><div class="sub">'+items.length+' expense'+(items.length===1?"":"s")+' this month</div></div><div class="section"><div class="list">'+(items.length?items.map(x=>'<div class="row" data-expense="'+x.id+'"><div class="icon">'+iconSvg(c.iconKey)+'</div><div class="info"><div class="name">'+x.description+'</div><div class="muted">'+fmtDate(x.date)+' · '+member(x.paidBy).name+'</div></div><div class="right">'+money(x.amount)+'</div></div>').join(""):'<div class="card empty">No expenses in this category this month.</div>')+'</div></div>'}

document.addEventListener("click",e=>{
 const screen=e.target.closest("[data-screen]")?.dataset.screen;if(screen){show(screen);return}
 const expid=e.target.closest("[data-expense]")?.dataset.expense;if(expid){const x=DATA.expenses.find(v=>v.id===expid);if(!x)return;document.getElementById("edit-id").value=x.id;document.getElementById("edit-amount").value=x.amount;document.getElementById("edit-date").value=x.date;document.getElementById("edit-category").value=x.categoryId;document.getElementById("edit-description").value=x.description;document.getElementById("edit-payment").value=x.paymentMethod;document.getElementById("edit-paidBy").value=x.paidBy;document.getElementById("edit-notes").value=x.notes;show("edit-expense");return}
 const sort=e.target.closest("[data-sort]")?.dataset.sort;if(sort){currentSort=sort;renderExpenses();return}
 const categoryOpen=e.target.closest("[data-category-open]")?.dataset.categoryOpen;if(categoryOpen){selectedCategoryId=categoryOpen;show("category-detail");return}
 const categoryDetail=e.target.closest("[data-category-detail]")?.dataset.categoryDetail;if(categoryDetail){selectedCategoryId=categoryDetail;show("category-detail");return}
 if(e.target.closest("[data-action=categories]")){show("categories-detail");return}
 if(e.target.closest("[data-action=export]")){action({type:"exportCSV"});return}
});

document.getElementById("expense-form").addEventListener("submit",e=>{e.preventDefault();const x={id:"",date:document.getElementById("date").value,amount:Number(document.getElementById("amount").value),categoryId:document.getElementById("category").value,description:document.getElementById("description").value.trim(),paymentMethod:document.getElementById("payment").value,paidBy:document.getElementById("paidBy").value,notes:document.getElementById("notes").value.trim()};if(!x.amount||x.amount<=0||!x.description){toast("Enter amount and description");return}action({type:"saveExpense",expense:x})});
document.getElementById("edit-form").addEventListener("submit",e=>{e.preventDefault();action({type:"updateExpense",expense:{id:document.getElementById("edit-id").value,date:document.getElementById("edit-date").value,amount:Number(document.getElementById("edit-amount").value),categoryId:document.getElementById("edit-category").value,description:document.getElementById("edit-description").value.trim(),paymentMethod:document.getElementById("edit-payment").value,paidBy:document.getElementById("edit-paidBy").value,notes:document.getElementById("edit-notes").value.trim()}})});
document.getElementById("delete-expense").addEventListener("click",()=>{if(confirm("Delete this expense?"))action({type:"deleteExpense",id:document.getElementById("edit-id").value})});
document.getElementById("income-form").addEventListener("submit",e=>{e.preventDefault();action({type:"saveIncome",income:{month,firstMemberAmount:Number(document.getElementById("income-first").value||0),secondMemberAmount:Number(document.getElementById("income-second").value||0)}})});
document.getElementById("savings-form").addEventListener("submit",e=>{e.preventDefault();action({type:"saveSavings",items:[{ownerType:"firstMember",amount:Number(document.getElementById("save-first").value||0)},{ownerType:"secondMember",amount:Number(document.getElementById("save-second").value||0)},{ownerType:"common",amount:Number(document.getElementById("save-common").value||0)}]})});
document.getElementById("members-form").addEventListener("submit",e=>{e.preventDefault();const first=DATA.members.find(x=>x.role==="first")||{id:"member-1",role:"first"};const second=DATA.members.find(x=>x.role==="second")||{id:"member-2",role:"second"};const firstName=document.getElementById("member-first").value.trim();const secondName=document.getElementById("member-second").value.trim();if(!firstName||!secondName){toast("Enter both names");return}action({type:"saveMembers",members:[{id:first.id,name:firstName,role:"first"},{id:second.id,name:secondName,role:"second"}]})});
document.getElementById("budget-form").addEventListener("submit",e=>{e.preventDefault();const items=[{categoryId:"",amount:Number(document.getElementById("budget-monthly").value||0)}];document.querySelectorAll(".budget-category").forEach(input=>items.push({categoryId:input.dataset.categoryId,amount:Number(input.value||0)}));action({type:"saveBudgets",items})});
document.getElementById("date").value=new Date().toISOString().slice(0,10);render();
</script></body></html>`;
}

async function refresh(wv,config){const data=normalize(await api(config,"GET","bootstrap"));await wv.evaluateJavaScript("DATA="+JSON.stringify(data)+";render();",false);return data}
function csv(data){const header=["Date","Amount","Merchant / Description","Category","Paid By","Payment Method","Notes"];const rows=data.expenses.map(x=>[x.date,x.amount,x.description,catName(data,x.categoryId),memberName(data,x.paidBy),x.paymentMethod,x.notes]);const esc=v=>'"'+String(v??"").replace(/"/g,'""')+'"';return [header,...rows].map(r=>r.map(esc).join(",")).join("\n")}

const config=await configure();
const data=normalize(await api(config,"GET","bootstrap"));
const webView=new WebView();

webView.shouldAllowRequest=request=>{
 const prefix="pakshi-action://";if(!request.url.startsWith(prefix))return true;
 const payload=JSON.parse(decodeURIComponent(request.url.slice(prefix.length)));
 (async()=>{
  try{
   if(payload.type==="saveExpense"){
     payload.expense.id=uuid();
     payload.expense.createdAt=new Date().toISOString();
     let writeError=null;
     try{
       await api(config,"POST","saveExpense",{expense:payload.expense});
     }catch(err){
       writeError=err;
     }
     const latest=await refresh(webView,config);
     const saved=latest.expenses.some(x=>String(x.id)===String(payload.expense.id));
     if(!saved){
       throw writeError||new Error("Expense was not saved");
     }
     await webView.evaluateJavaScript("toast('Expense saved');show('home');",false)
   }
   if(payload.type==="updateExpense"){await api(config,"POST","updateExpense",{expense:payload.expense});await refresh(webView,config);await webView.evaluateJavaScript("toast('Expense updated');show('expenses-detail');",false)}
   if(payload.type==="deleteExpense"){await api(config,"POST","deleteExpense",{id:payload.id});await refresh(webView,config);await webView.evaluateJavaScript("toast('Expense deleted');show('expenses-detail');",false)}
   if(payload.type==="saveIncome"){await api(config,"POST","saveIncome",{income:payload.income});await refresh(webView,config);await webView.evaluateJavaScript("toast('Income saved');show('income-detail');",false)}
   if(payload.type==="saveSavings"){for(const item of payload.items)await api(config,"POST","saveSavings",{savings:{...item,asOfDate:today()}});await refresh(webView,config);await webView.evaluateJavaScript("toast('Savings saved');show('savings-detail');",false)}
   if(payload.type==="saveMembers"){await api(config,"POST","saveMembers",{members:payload.members});await refresh(webView,config);await webView.evaluateJavaScript("toast('Members saved');show('settings');",false)}
   if(payload.type==="saveBudgets"){for(const item of payload.items)await api(config,"POST","saveBudget",{budget:{id:uuid(),month,categoryId:item.categoryId,amount:item.amount}});await refresh(webView,config);await webView.evaluateJavaScript("toast('Budget saved');show('budget');",false)}
   if(payload.type==="exportCSV"){const latest=normalize(await api(config,"GET","bootstrap"));await ShareSheet.present([csv(latest)])}
  }catch(err){await webView.evaluateJavaScript("toast("+JSON.stringify("Error: "+err.message)+")",false)}
 })();return false;
};

await webView.loadHTML(htmlFor(data),null,null,true);
await webView.present(true);
