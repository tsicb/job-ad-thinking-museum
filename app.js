(function museumApp(){
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const label = (v) => escapeHtml(v);
  const state = {
    nodes: [], nodeById: new Map(), mapId: "materials.work.tasks",
    demoLens: "materials", labLens:"materials", sentence:"overtime",
    movement:"vertical", diagnosis:"materials", chunk:"grouped",
    quizMode:"full", quizOrder:[], quizIndex:0, quizVisible:false
  };
  const branchLabels = {materials:"素材",value:"価値",delivery:"伝達"};
  const chunkItems = [
    { group:"仕事", items:["仕事内容","役割","応募要件"] },
    { group:"条件", items:["給与","休日","雇用形態"] },
    { group:"組織", items:["事業","職場の人","研修制度"] }
  ];
  const demoLenses = {
    materials:{path:"素材 ＞ 条件 ＞ 勤務",title:"まず、何が事実か。",body:"「月平均5時間」は勤務実態についての情報です。繁忙期の変動、計算期間、担当業務による違いは確認が必要かもしれません。"},
    value:{path:"価値 ＞ 守る ＞ 暮らし",title:"次に、誰にとって意味があるか。",body:"平日の生活時間を確保したい人には魅力になり得ます。ただし、残業が少ないことと仕事全体の負担が軽いことは同義ではありません。"},
    delivery:{path:"伝達 ＞ 選ぶ ＞ 主張",title:"最後に、何を伝えるか。",body:"単に数値を載せるだけでなく、生活時間を大切にしたい人へ訴求する選択肢があります。実態にない自由度や保証は付け加えません。"}
  };
  const movements = {
    vertical:{name:"縦に移動する",lead:"「何をしているか」から「何のためか」へ。抽象度を動かす。",path:["仕事 ＞ 実務","仕事","仕事 ＞ 役割"],body:"日々の「電話対応」という作業だけで止まらず、その仕事が部署や顧客に果たす役割まで視点を引き上げます。逆に役割が抽象的なら、実務の具体例へ下ります。"},
    horizontal:{name:"横に移動する",lead:"今の一つだけでなく、兄弟の2つを思い出す。",path:["仕事 ＞ 実務","仕事 ＞ 役割","仕事 ＞ 要件"],body:"仕事内容の説明が十分でも、目的と必要な力が伝わっているとは限りません。「実務」を見たら、同じ親にある「役割・要件」も連想できます。"},
    bridge:{name:"別の枝へ渡る",lead:"同じ材料を、価値と伝達から見つめ直す。",path:["組織 ＞ 仕組み","価値 ＞ 合う ＞ 能力","伝達 ＞ 選ぶ ＞ 根拠"],body:"「先輩が教える」という育成体制から、「未経験者が取り組めるか」という適合性へ、さらにその不安を和らげる説明の根拠へ移ります。唯一の正解ルートではありません。"}
  };
  const labCases = {
    overtime:{
      quote:"残業は月平均5時間です。",
      lenses:{
        materials:{path:"素材 ＞ 条件 ＞ 勤務",title:"勤務の実態を確認する",body:"平均の算出期間、繁忙期や業務による違いは？ まず掲載可能な事実を把握します。",next:"勤務の事実 → 暮らしの価値 → 主張の設計"},
        value:{path:"価値 ＞ 守る ＞ 暮らし",title:"生活時間という意味を考える",body:"仕事終わりの時間を確保したい人には価値になり得ます。誰にも同じ魅力が響くとは限りません。",next:"勤務の事実 → 暮らしの価値 → 主張の設計"},
        delivery:{path:"伝達 ＞ 選ぶ ＞ 主張",title:"主要な訴求にするか選ぶ",body:"「残業が少ない」だけでなく、生活リズムを重視する求職者への伝え方を検討します。",next:"勤務の事実 → 暮らしの価値 → 主張の設計"}
      }
    },
    training:{
      quote:"未経験歓迎。入社後は先輩が教えます。",
      lenses:{
        materials:{path:"素材 ＞ 組織 ＞ 仕組み",title:"教育の中身を見つける",body:"誰が、何を、どの順序で、どれほどの期間教えるのでしょうか。まだ書かれていない事実の確認が必要です。",next:"教育の仕組み → 能力との適合 → 根拠の提示"},
        value:{path:"価値 ＞ 合う ＞ 能力",title:"自分にもできそうか考える",body:"「経験がなくても仕事を覚えられる」という安心につながる可能性があります。実際に対応可能な業務範囲は要確認です。",next:"教育の仕組み → 能力との適合 → 根拠の提示"},
        delivery:{path:"伝達 ＞ 選ぶ ＞ 根拠",title:"「丁寧」の裏づけを示す",body:"研修期間や最初に任せる業務などを確認できれば、一般的な歓迎文から説得力のある説明に進めます。",next:"教育の仕組み → 能力との適合 → 根拠の提示"}
      }
    },
    growth:{
      quote:"やりがいを感じながら成長できます。",
      lenses:{
        materials:{path:"素材 ＞ 仕事 ＞ 役割・実務",title:"達成や成長を裏づける仕事を探す",body:"どんな業務を通じて力がつき、誰にどんな価値を提供するのでしょうか。抽象語を支える出来事が必要です。",next:"充実の中身 → 成長の中身 → 仕事の根拠"},
        value:{path:"価値 ＞ 得る ＞ 充実・成長",title:"充実と成長を区別する",body:"やりがいは仕事の意味や満足感、成長はできることの増加。どちらが主要な価値なのかを検討します。",next:"充実の中身 → 成長の中身 → 仕事の根拠"},
        delivery:{path:"伝達 ＞ 語る ＞ 描写",title:"言葉を具体的な場面に変える",body:"仕事の場面、達成したときの反応、習得の過程などを実際の情報で描けば、読み手が想像しやすくなります。",next:"充実の中身 → 成長の中身 → 仕事の根拠"}
      }
    }
  };
  const diagnoses = {
    materials:{state:"確認事項 / 原稿からは分からない",title:"仕事の「役割」と「組織の姿」が薄い",body:"PC入力や電話対応はありますが、どんなデータを扱うか、誰と働くか、教育がどう行われるかは不明です。仕事内容を増やして書く前に、具体的な情報を企業に確認する方向です。",route:"仕事 ＞ 役割　／　組織 ＞ 人・仕組み",action:"次の質問：『1日の業務の流れと、配属チームの人数は？』"},
    value:{state:"価値の仮説 / 対象者によって変わる",title:"ある数字に、求職者にとっての意味を与える",body:"17時終業・残業月平均5時間という事実から、生活時間を確保したい求職者への訴求を仮説として考えられます。一方、成長や仕事の充実は現時点で材料が少なく、断定できません。",route:"条件 ＞ 勤務 → 守る ＞ 暮らし",action:"次の問い：『どんな転職理由の人に、この価値が響く？』"},
    delivery:{state:"表現案 / 確認済みの事実を使用",title:"情報の列挙を、中心メッセージへ変える",body:"仕事の説明と条件の一覧が中心なら、『残業月平均5時間』をどこで強調するか検討できます。ただし主張を決める前に、どんな求職者を狙うかを決める必要があります。",route:"選ぶ ＞ 相手・主張 → 並べる ＞ 強弱",action:"表現案：『17時終業、残業は月平均5時間。平日の時間も大切にしたい方へ。』"}
  };
  const relatedNodes = {
    "materials.conditions.schedule":["value.protect.life","delivery.select.claim"],
    "materials.organization.systems":["value.fit.ability","delivery.select.evidence"],
    "materials.work.role":["value.gain.fulfillment","delivery.narrate.depiction"],
    "value.protect.life":["materials.conditions.schedule","delivery.select.claim"],
    "value.fit.ability":["materials.work.requirements","delivery.select.evidence"],
    "value.gain.growth":["materials.work.tasks","delivery.narrate.depiction"],
    "delivery.select.claim":["value.protect.life","materials.conditions.schedule"],
    "delivery.select.evidence":["materials.organization.systems","value.fit.ability"],
    "delivery.narrate.depiction":["materials.work.tasks","value.gain.fulfillment"]
  };
  function press(group, attribute, value) {
    document.querySelectorAll(group).forEach(button=>{
      const chosen = button.getAttribute(attribute) === value;
      button.setAttribute("aria-pressed", String(chosen));
    });
  }
  function renderChunk() {
    press("[data-chunk]","data-chunk",state.chunk);
    const target=$("chunk-demo");if(!target)return;
    if(state.chunk==="flat"){
      target.innerHTML='<div class="chunk-flat">'+chunkItems.flatMap(g=>g.items.map(x=>"<span>"+label(x)+"</span>")).join("")+"</div>";
    } else {
      target.innerHTML='<div class="chunk-grouped">'+chunkItems.map(g=>'<div class="chunk-group"><strong>'+label(g.group)+'</strong>'+g.items.map(x=>"<span>"+label(x)+"</span>").join("")+"</div>").join("")+"</div>";
    }
  }
  function renderDemoLens(){
    press("[data-demo-lens]","data-demo-lens",state.demoLens);
    const x=demoLenses[state.demoLens];
    $("lens-result").innerHTML='<div class="path">'+label(x.path)+'</div><h4>'+label(x.title)+'</h4><p>'+label(x.body)+'</p>';
  }
  function getNode(id){ return state.nodeById.get(id) || null; }
  function rootBranch(id){return id.split(".")[0];}
  function ancestors(id){
    const chain=[]; let next=getNode(id),loop=0;
    while(next && loop++<6){chain.unshift(next);next=next.parentId?getNode(next.parentId):null;}
    return chain;
  }
  function mapTo(id,history=true){
    if(!getNode(id))return;
    state.mapId=id;
    renderMap();
    if(history){
      const url=new URL(window.location.href);
      url.searchParams.set("node",id); url.hash="explore";
      window.history.replaceState(null,"",url.pathname+url.search+url.hash);
    }
  }
  function renderMap(){
    if(!state.nodes.length)return;
    const current=getNode(state.mapId) || getNode("materials.work.tasks");
    if(!current)return;
    const main=rootBranch(current.id);
    const major=["materials","value","delivery"].includes(main)?main:"materials";
    const primary=getNode(major);
    $("map-lenses").innerHTML=["materials","value","delivery"].map((id,i)=>{
      const node=getNode(id);
      return '<button type="button" data-map-node="'+id+'" aria-pressed="'+(major===id)+'">'+(i+1).toString().padStart(2,"0")+' '+label(node.label)+' <span>'+label(node.question || "")+'</span></button>';
    }).join("");
    $("map-groups").innerHTML=primary.children.map((groupId,i)=>{
      const group=getNode(groupId);
      const active=current.id===groupId || current.parentId===groupId;
      return '<div class="map-group'+(active?' is-active':'')+'"><button type="button" class="map-group-title" data-map-node="'+label(groupId)+'">'+label(group.label)+' <span>0'+(i+1)+'　↗</span></button><div class="map-children">'+group.children.map(childId=>{
        const child=getNode(childId);
        return '<button type="button" class="'+(current.id===childId?'is-active':'')+'" data-map-node="'+label(childId)+'">'+label(child.label)+'</button>';
      }).join("")+'</div></div>';
    }).join("");
    const chain=ancestors(current.id);
    $("map-depth").textContent="第"+current.depth+"層";
    $("map-breadcrumb").innerHTML=chain.map((node,i)=>'<button type="button" data-map-node="'+label(node.id)+'">'+label(node.label)+'</button>'+((i+1<chain.length)?" ＞ ":"")).join("");
    const children=current.children.map(id=>getNode(id)).filter(Boolean);
    const nodeBody=(current.definition?'<p class="map-node-desc">'+label(current.definition)+'</p>':
      '<p class="map-node-desc">このテーマから、3つの子テーマを手がかりに考えを広げます。暗記より、問いから関係を組み立て直すことを重視します。</p>');
    const question = current.question || current.mnemonic || "どこから考える？";
    let extra="";
    if(current.example) extra='<div class="map-node-example"><strong>求人広告の例</strong>'+label(current.example)+'</div>';
    if(current.mnemonic) extra+='<div class="map-node-example"><strong>記憶のフレーズ</strong>'+label(current.mnemonic)+'</div>';
    if(children.length) extra+='<div class="map-node-actions">'+children.map(x=>'<button type="button" data-map-node="'+label(x.id)+'">'+label(x.label)+'　↗</button>').join("")+'</div>';
    $("map-node").innerHTML='<div class="map-node"><span class="micro">NODE / '+label(current.id)+'</span><h3 class="map-node-title">'+label(current.label)+'</h3><div class="map-node-question">'+label(question)+'</div>'+nodeBody+extra+'</div>';
    const parent=getNode(current.parentId);
    const siblingIds=parent?parent.children:[current.id];
    $("map-siblings").innerHTML=siblingIds.map(id=>{
      const x=getNode(id);
      return '<button type="button" class="'+(id===current.id?'is-active':'')+'" data-map-node="'+label(id)+'">'+label(x.label)+'</button>';
    }).join("");
    let paths=relatedNodes[current.id];
    if(!paths){
      const choices=["materials","value","delivery"].filter(x=>x!==major);
      paths=choices.map(id=>{
        const branch=getNode(id);
        return branch?.children[0] || id;
      });
    }
    $("map-related").innerHTML=paths.filter(id=>getNode(id)).map(id=>'<button type="button" data-map-node="'+label(id)+'">'+label(ancestors(id).slice(1).map(n=>n.label).join(" ＞ "))+'　↗</button>').join("");
  }
  function renderPhrases(){
    const filter=$("phrase-filter").value;
    const parents=state.nodes.filter(n=>n.children?.length===3)
      .filter(n=>filter==="all" || n.id===filter || n.id.startsWith(filter+"."));
    $("phrase-grid").innerHTML=parents.map((node,i)=>{
      const childNames=node.children.map(id=>getNode(id)?.label).filter(Boolean);
      return '<details class="phrase-item"><summary><span class="phrase-parent">PAIR '+String(i+1).padStart(2,"0")+' / '+label(node.depth===0?"全体":node.label)+'</span><span class="phrase-summary">'+label(node.depth===0?"求人広告テキスト":node.label)+'</span></summary><div class="phrase-answer"><strong>'+label(childNames.join("・"))+'</strong><p>'+label(node.mnemonic || "")+'</p></div></details>';
    }).join("");
  }
  function renderMovement(){
    press("[data-movement]","data-movement",state.movement);
    const x=movements[state.movement];
    $("movement-result").innerHTML='<span class="micro">MOVE / '+label(state.movement.toUpperCase())+'</span><h4>'+label(x.name)+'</h4><p><strong>'+label(x.lead)+'</strong></p><p>'+label(x.body)+'</p><div class="movement-path">'+x.path.map((p,i)=>(i?'<span class="arrow">→</span>':'')+'<span class="step">'+label(p)+'</span>').join("")+'</div>';
  }
  function renderLab(){
    press("[data-lab-lens]","data-lab-lens",state.labLens);
    const obj=labCases[state.sentence];
    const x=obj.lenses[state.labLens];
    $("sentence-quote").textContent="「"+obj.quote+"」";
    $("lab-result").innerHTML='<span class="micro">'+label(x.path)+'</span><h4>'+label(x.title)+'</h4><p>'+label(x.body)+'</p><div class="lab-route"><strong>代表的な移動経路</strong><div>'+label(x.next)+'</div></div>';
  }
  function renderDiagnosis(){
    press("[data-diagnosis]","data-diagnosis",state.diagnosis);
    const x=diagnoses[state.diagnosis];
    $("diagnosis-result").innerHTML='<div class="diagnosis-result"><div class="state">'+label(x.state)+'</div><h4>'+label(x.title)+'</h4><p>'+label(x.body)+'</p><div class="route"><strong>地図での現在地：</strong> '+label(x.route)+'<br>'+label(x.action)+'</div></div>';
  }
  function shuffle(arr){
    const out=arr.slice();
    for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }
  function initQuiz(){
    state.quizOrder=shuffle(state.nodes.filter(n=>n.children?.length===3).map(n=>n.id));
    state.quizIndex=0;
    state.quizVisible=false;
    renderQuiz();
  }
  function renderQuiz(){
    if(!state.quizOrder.length)return;
    press("[data-quiz-mode]","data-quiz-mode",state.quizMode);
    const node=getNode(state.quizOrder[state.quizIndex]);
    const childNames=node.children.map(id=>getNode(id).label);
    const missing=state.quizIndex%3;
    $("quiz-progress").textContent=(state.quizIndex+1)+" / "+state.quizOrder.length;
    const prompt=state.quizMode==="full"?"このテーマの下には、どんな3つがある？":"欠けている1つは何でしょう？";
    const hint=state.quizMode==="full"?"3つを声に出してから答えを見てください":childNames.map((x,i)=>i===missing?"［ ？ ］":x).join("　・　");
    $("quiz-question").innerHTML='<div class="prompt">'+label(prompt)+'</div><h4>'+label(node.depth===0?"求人広告テキスト":node.label)+'</h4><div class="hint">'+label(hint)+'</div>';
    $("quiz-answer").hidden=!state.quizVisible;
    if(state.quizVisible){
      $("quiz-answer").innerHTML='<strong>'+label(childNames.join("・"))+'</strong><p>'+label(node.mnemonic || "")+'</p>';
    } else {
      $("quiz-answer").innerHTML="";
    }
    $("quiz-reveal").textContent=state.quizVisible?"答えを隠す":"答えを表示";
  }
  function bind(){
    document.querySelectorAll("[data-chunk]").forEach(btn=>btn.addEventListener("click",()=>{state.chunk=btn.dataset.chunk;renderChunk();}));
    document.querySelectorAll("[data-demo-lens]").forEach(btn=>btn.addEventListener("click",()=>{state.demoLens=btn.dataset.demoLens;renderDemoLens();}));
    $("map-app").addEventListener("click",evt=>{
      const btn=evt.target.closest("[data-map-node]");
      if(btn)mapTo(btn.dataset.mapNode);
    });
    $("phrase-filter").addEventListener("change",renderPhrases);
    document.querySelectorAll("[data-movement]").forEach(btn=>btn.addEventListener("click",()=>{state.movement=btn.dataset.movement;renderMovement();}));
    document.querySelectorAll("[data-lab-lens]").forEach(btn=>btn.addEventListener("click",()=>{state.labLens=btn.dataset.labLens;renderLab();}));
    $("sentence-select").addEventListener("change",evt=>{state.sentence=evt.target.value;renderLab();});
    document.querySelectorAll("[data-diagnosis]").forEach(btn=>btn.addEventListener("click",()=>{state.diagnosis=btn.dataset.diagnosis;renderDiagnosis();}));
    document.querySelectorAll("[data-quiz-mode]").forEach(btn=>btn.addEventListener("click",()=>{state.quizMode=btn.dataset.quizMode;state.quizVisible=false;renderQuiz();}));
    $("quiz-reveal").addEventListener("click",()=>{state.quizVisible=!state.quizVisible;renderQuiz();});
    $("quiz-next").addEventListener("click",()=>{
      state.quizIndex++;
      if(state.quizIndex>=state.quizOrder.length){
        state.quizOrder=shuffle(state.quizOrder);state.quizIndex=0;
      }
      state.quizVisible=false;renderQuiz();
    });
    window.addEventListener("popstate",()=>{
      const id=new URLSearchParams(location.search).get("node");
      if(id && getNode(id))mapTo(id,false);
    });
  }
  async function initialize(){
    renderChunk();renderDemoLens();renderMovement();renderLab();renderDiagnosis();bind();
    try{
      const response=await fetch("./data/taxonomy.json",{cache:"no-store"});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const data=await response.json();
      if(!Array.isArray(data.nodes)||data.nodes.length!==40)throw new Error("unexpected taxonomy schema");
      state.nodes=data.nodes;
      state.nodeById=new Map(data.nodes.map(n=>[n.id,n]));
      const requested=new URLSearchParams(location.search).get("node");
      if(requested && getNode(requested))state.mapId=requested;
      renderMap();renderPhrases();initQuiz();
    } catch(error) {
      const message='<div class="map-node-desc">分類データを読み込めませんでした。GitHub PagesまたはローカルHTTPサーバーで開いてください。再読み込みしても改善しない場合は data/taxonomy.json を確認してください。</div>';
      $("map-groups").innerHTML=message;$("map-node").innerHTML=message;
      $("phrase-grid").innerHTML=message;$("quiz-question").innerHTML=message;
      console.error("Thinking Museum taxonomy load failed:",error);
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize);
  else initialize();
})();
