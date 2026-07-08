/* Georgia Cosmetology Theory Exam Prep — app logic */
(function(){
  "use strict";

  const app = document.getElementById('app');
  const PASS_THRESHOLD = 0.75; // typical state-board style cutoff; verify actual current requirement

  const store = {
    key(testId){ return `gact_v1_test_${testId}`; },
    load(testId){
      try{
        const raw = localStorage.getItem(this.key(testId));
        if(!raw) return { answers:{}, current:0, completed:false };
        return JSON.parse(raw);
      }catch(e){ return { answers:{}, current:0, completed:false }; }
    },
    save(testId, state){
      try{ localStorage.setItem(this.key(testId), JSON.stringify(state)); }catch(e){}
    },
    clear(testId){ try{ localStorage.removeItem(this.key(testId)); }catch(e){} }
  };

  let route = { view: 'home', testId: null };

  function navigate(view, testId){
    route = { view, testId };
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function scoreFor(test, state){
    let correct = 0, answered = 0;
    const bySection = {};
    test.sections.forEach(s => bySection[s.name] = { correct:0, total:0 });
    test.questions.forEach(q => {
      const sec = bySection[q.section] || (bySection[q.section] = { correct:0, total:0 });
      sec.total++;
      const given = state.answers[q.id];
      if(given){
        answered++;
        if(given === q.answer){ correct++; sec.correct++; }
      }
    });
    return { correct, answered, total: test.questions.length, bySection };
  }

  /* ---------------- HOME ---------------- */
  function renderHome(){
    const cards = TESTS.map(test => {
      const state = store.load(test.id);
      const answeredCount = Object.keys(state.answers).length;
      let statusHTML;
      if(state.completed){
        const s = scoreFor(test, state);
        const pct = Math.round((s.correct / s.total) * 100);
        const passed = pct/100 >= PASS_THRESHOLD;
        statusHTML = `
          <span class="score">${pct}%</span>
          <span class="stamp ${passed ? 'pass' : 'fail'}">${passed ? 'PASS' : 'REVIEW'}</span>`;
      } else if(answeredCount > 0){
        statusHTML = `<span style="color:var(--brass)">IN PROGRESS</span><br><span style="color:var(--ink-soft)">${answeredCount}/100</span>`;
      } else {
        statusHTML = `<span style="color:var(--ink-soft)">NOT STARTED</span>`;
      }
      return `
        <button class="ticket" data-test="${test.id}">
          <span class="ticket-num">${String(test.id).padStart(2,'0')}</span>
          <span class="ticket-body">
            <span class="ticket-title">${test.title}</span>
            <span class="ticket-meta">100 QUESTIONS &middot; 6 SECTIONS &middot; ${answeredCount > 0 && !state.completed ? 'TAP TO RESUME' : (state.completed ? 'TAP TO REVIEW' : 'TAP TO BEGIN')}</span>
          </span>
          <span class="ticket-status">${statusHTML}</span>
        </button>`;
    }).join('');

    app.innerHTML = `
      <div class="ticket-grid">${cards}</div>
      <p class="home-note">Your progress and scores are saved in this browser only (no account, no server). Clearing site data or using a different device/browser resets them.</p>
    `;

    app.querySelectorAll('.ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.test);
        const state = store.load(id);
        navigate(state.completed ? 'results' : 'quiz', id);
      });
    });
  }

  /* ---------------- QUIZ ---------------- */
  function renderQuiz(testId){
    const test = TESTS.find(t => t.id === testId);
    const state = store.load(testId);
    const idx = Math.min(state.current || 0, test.questions.length - 1);
    const q = test.questions[idx];
    const given = state.answers[q.id];

    const bubbles = test.questions.map((qq, i) => {
      const cls = ['']
        .concat(state.answers[qq.id] ? ['answered'] : [])
        .concat(i === idx ? ['current'] : [])
        .join(' ').trim();
      return `<button class="${cls}" data-idx="${i}" aria-label="Question ${i+1}${state.answers[qq.id] ? ', answered' : ''}"></button>`;
    }).join('');

    const options = ['A','B','C','D'].map(letter => {
      let cls = 'option';
      if(given){
        if(letter === q.answer) cls += ' reveal-correct';
        else if(letter === given) cls += ' reveal-incorrect';
      } else if(letter === given){
        cls += ' selected';
      }
      return `
        <button class="${cls}" data-letter="${letter}" ${given ? 'disabled' : ''}>
          <span class="bubble">${letter}</span>
          <span>${q.options[letter]}</span>
        </button>`;
    }).join('');

    const answeredCount = Object.keys(state.answers).length;

    app.innerHTML = `
      <div class="quiz-topbar">
        <div>
          <div class="quiz-title">${test.title}</div>
          <div class="quiz-section">${q.section}</div>
        </div>
        <button class="btn-link" id="backHome">&larr; All tests</button>
      </div>

      <div class="bubble-grid" id="bubbleGrid">${bubbles}</div>

      <div class="qcard">
        <div class="qnum">QUESTION ${q.id} OF ${test.questions.length}</div>
        <p class="qtext">${q.question}</p>
        <div class="options">${options}</div>
      </div>

      <div class="qnav">
        <button class="btn ghost" id="prevBtn" ${idx === 0 ? 'disabled' : ''}>&larr; Prev</button>
        <span class="answered-count">${answeredCount} / ${test.questions.length} answered</span>
        ${idx === test.questions.length - 1
          ? `<button class="btn gold" id="finishBtn">Finish &amp; grade</button>`
          : `<button class="btn primary" id="nextBtn">Next &rarr;</button>`}
      </div>
      <div style="text-align:center; margin-top:18px;">
        <button class="btn-link" id="finishAnyway">Finish test now (grade with what I've answered)</button>
      </div>
    `;

    function goTo(newIdx){
      state.current = newIdx;
      store.save(testId, state);
      navigate('quiz', testId);
    }

    app.querySelector('#backHome').addEventListener('click', () => navigate('home'));
    app.querySelectorAll('#bubbleGrid button').forEach(b => {
      b.addEventListener('click', () => goTo(Number(b.dataset.idx)));
    });
    const prevBtn = app.querySelector('#prevBtn');
    if(prevBtn) prevBtn.addEventListener('click', () => goTo(idx - 1));
    const nextBtn = app.querySelector('#nextBtn');
    if(nextBtn) nextBtn.addEventListener('click', () => goTo(idx + 1));
    const finishBtn = app.querySelector('#finishBtn');
    if(finishBtn) finishBtn.addEventListener('click', () => finishTest(testId));
    app.querySelector('#finishAnyway').addEventListener('click', () => finishTest(testId));

    app.querySelectorAll('.option').forEach(optBtn => {
      optBtn.addEventListener('click', () => {
        if(given) return;
        state.answers[q.id] = optBtn.dataset.letter;
        store.save(testId, state);
        navigate('quiz', testId);
      });
    });
  }

  function finishTest(testId){
    const state = store.load(testId);
    state.completed = true;
    store.save(testId, state);
    navigate('results', testId);
  }

  /* ---------------- RESULTS ---------------- */
  function renderResults(testId){
    const test = TESTS.find(t => t.id === testId);
    const state = store.load(testId);
    const s = scoreFor(test, state);
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const passed = pct/100 >= PASS_THRESHOLD;

    const sectionRows = test.sections.map(sec => {
      const d = s.bySection[sec.name] || { correct:0, total:0 };
      const p = d.total ? Math.round((d.correct/d.total)*100) : 0;
      return `
        <div class="section-row">
          <div class="label">${sec.name}</div>
          <div class="pct">${d.correct}/${d.total}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div>
        </div>`;
    }).join('');

    const grid = test.questions.map(q => {
      const given = state.answers[q.id];
      let cls = 'g-skipped';
      if(given) cls = given === q.answer ? 'g-correct' : 'g-incorrect';
      return `<button class="${cls}" data-qid="${q.id}" aria-label="Question ${q.id}"></button>`;
    }).join('');

    const missed = test.questions.filter(q => state.answers[q.id] !== q.answer);

    app.innerHTML = `
      <div class="results-hero">
        <div class="eyebrow">${test.title.toUpperCase()} &middot; RESULT</div>
        <div class="big-score">${pct}<sup>%</sup></div>
        <div style="margin-top:6px; color:var(--ink-soft); font-family:'IBM Plex Mono', monospace; font-size:13px;">${s.correct} correct of ${s.total} &middot; ${s.answered} answered</div>
        <div class="stamp-verdict ${passed ? 'pass' : 'fail'}">${passed ? 'LIKELY PASS' : 'NEEDS REVIEW'}</div>
        <p class="results-note">Scored against a common ${Math.round(PASS_THRESHOLD*100)}% study-target cutoff — this is a study benchmark, not the official Georgia Board passing score. Confirm the current passing requirement with the state board.</p>
      </div>

      <div class="section-breakdown">
        <div class="grid-title">By section</div>
        ${sectionRows}
      </div>

      <div class="grid-title">Answer sheet</div>
      <div class="bubble-grid" id="resultGrid">${grid}</div>

      <div class="review-list" id="reviewList"></div>

      <div class="results-actions">
        <button class="btn ghost" id="backHome2">&larr; All tests</button>
        <button class="btn primary" id="retakeBtn">Retake this test</button>
      </div>
    `;

    function renderReview(list, label){
      const el = app.querySelector('#reviewList');
      if(list.length === 0){
        el.innerHTML = `<p style="text-align:center; color:var(--ink-soft); font-size:13px; margin-top:20px;">No missed questions to review${state.answered < s.total ? ' among those answered' : ''} — nice work.</p>`;
        return;
      }
      el.innerHTML = `<div class="grid-title" style="margin-top:0">${label} (${list.length})</div>` + list.map(q => {
        const given = state.answers[q.id];
        return `
          <div class="review-item">
            <div class="rq">Q${q.id}. ${q.question}</div>
            <div class="ra ${given ? 'wrong' : ''}">${given ? `Your answer: ${given}) ${q.options[given]}` : 'Not answered'}</div>
            <div class="ra right">Correct: ${q.answer}) ${q.options[q.answer]}</div>
          </div>`;
      }).join('');
    }
    renderReview(missed, 'Missed & unanswered questions');

    app.querySelector('#resultGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-qid]');
      if(!btn) return;
      const qid = Number(btn.dataset.qid);
      const q = test.questions.find(qq => qq.id === qid);
      renderReview([q], 'Selected question');
      app.querySelector('#reviewList').scrollIntoView({ behavior:'smooth', block:'center' });
    });

    app.querySelector('#backHome2').addEventListener('click', () => navigate('home'));
    app.querySelector('#retakeBtn').addEventListener('click', () => {
      store.clear(testId);
      navigate('quiz', testId);
    });
  }

  function render(){
    if(route.view === 'quiz') renderQuiz(route.testId);
    else if(route.view === 'results') renderResults(route.testId);
    else renderHome();
  }

  render();
})();
