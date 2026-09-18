// Charts and tooltips for the unlisted info session poll report. Kept out of
// the page itself because the site's CSP allows same-origin scripts only.
(function () {
  const N = 91;
  const pct = (n, d = N) => Math.round((n / d) * 100);
  const pct1 = (n, d = N) => ((n / d) * 100).toFixed(1);

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'style') e.style.cssText = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(c => c && e.appendChild(c));
    return e;
  }
  function seg(cls, n, tip, label) {
    const a = { class: 'seg ' + cls, style: 'flex-grow:' + n, 'data-tip': tip };
    if (label != null) a['data-label'] = String(label);
    return h('span', a);
  }
  function label(name, sub, extra) {
    return h('div', { class: 'crow__label' }, [h('span', { class: 'crow__name', text: name })].concat(extra || [], sub ? [h('span', { class: 'crow__sub', text: sub })] : []));
  }

  /* ---------- workshops ---------- */
  const W = [
    { name: 'Student agents', full: 'Student agents: schedule, job tracker, co-op search', level: 'Intermediate', s: [15, 18, 16], pick: 'Slot 4', lab: 2 },
    { name: 'Financial modeling', full: 'Financial modeling with Claude', level: 'Advanced', s: [26, 7, 14], pick: 'Slot 2', lab: 0 },
    { name: 'Building a business (Collab)', full: 'Building a business with Claude Code (Collab)', level: 'Intermediate', s: [4, 20, 17], pick: 'Slot 3', lab: 1 },
    { name: 'Your first app', full: 'Building your first app with Claude Code', level: 'All levels', s: [13, 10, 12] },
    { name: 'Building tools', full: 'Building tools with Claude', level: 'Beginner / Intermediate', s: [12, 8, 7] },
    { name: 'Guest speaker', full: 'Guest speaker: how professionals use Claude', level: 'All levels', s: [4, 10, 7] },
    { name: 'Claude Code for your major', full: 'Claude Code for your major', level: 'All levels', s: [4, 6, 10] },
    { name: 'Claude for school', full: 'Claude for school: assignments, notes, studying', level: 'All levels', s: [10, 4, 4] },
    { name: 'Portfolio websites', full: 'Portfolio websites with Claude Code', level: 'Beginner', s: [2, 4, 3] },
    { name: 'Marketing and content (Collab)', full: 'Marketing and content creation (Collab)', level: 'Beginner', s: [1, 4, 1] }
  ];
  const WMAX = 50;
  const wChart = document.getElementById('chart-workshops');
  const wTable = document.getElementById('table-workshops');
  W.forEach(w => {
    const total = w.s[0] + w.s[1] + w.s[2];
    const borda = w.s[0] * 3 + w.s[1] * 2 + w.s[2];
    const width = (total / WMAX) * 100;
    const segs = w.s.map((n, i) => n ? seg('s' + (i + 1), n, w.name + ' · Slot ' + (i + 2) + ': ' + n + ' vote' + (n === 1 ? '' : 's'), w.lab === i ? n : null) : null);
    const extra = w.pick ? [h('span', { class: 'pick', text: w.pick })] : [];
    wChart.appendChild(h('div', {
      class: 'crow', tabindex: '0',
      'data-tip': w.full + ' (' + w.level + ')\n' + total + ' picks (' + pct(total) + '% of ballots)\nSlot 2: ' + w.s[0] + ' · Slot 3: ' + w.s[1] + ' · Slot 4: ' + w.s[2]
    }, [
      label(w.name, w.level, extra),
      h('div', { class: 'plot' }, [
        h('div', { class: 'bar', style: 'width:' + width + '%' }, segs),
        h('span', { class: 'val', style: 'left:calc(' + width + '% + 8px)', text: String(total) })
      ])
    ]));
    wTable.appendChild(h('tr', w.pick ? { class: 'hl' } : null, [
      h('td', { text: w.full + (w.pick ? ' (' + w.pick + ')' : '') }), h('td', { text: w.level }),
      h('td', { class: 'n', text: w.s[0] }), h('td', { class: 'n', text: w.s[1] }), h('td', { class: 'n', text: w.s[2] }),
      h('td', { class: 'n', text: total }), h('td', { class: 'n', text: borda })
    ]));
  });

  /* ---------- hackathon ---------- */
  const H = [
    { name: 'Money Moves', note: 'Budgeting, split-the-check, subscription audits', n: 25 },
    { name: 'Fix Northeastern', note: 'One thing on campus that drives you insane, rebuilt', n: 23 },
    { name: 'Beat the Spread', note: 'Sports analytics, prediction, fantasy tools', n: 22 },
    { name: 'Steal This Site', note: 'Rebuild a site you use, cleaner or faster', n: 21 }
  ];
  const HMAX = 0.40;
  const hChart = document.getElementById('chart-hack');
  const hTable = document.getElementById('table-hack');
  H.forEach(t => {
    const p = t.n / N, se = Math.sqrt(p * (1 - p) / N);
    const lo = Math.max(0, p - 1.96 * se), hi = Math.min(HMAX, p + 1.96 * se);
    const tip = t.name + ': ' + t.n + ' votes (' + pct1(t.n) + '%)\nPlausible range ' + (lo * 100).toFixed(0) + '–' + (hi * 100).toFixed(0) + '%';
    hChart.appendChild(h('div', { class: 'crow', tabindex: '0', 'data-tip': tip }, [
      label(t.name, t.note, [h('span', { class: 'crow__fig', text: t.n + ' · ' + pct1(t.n) + '%' })]),
      h('div', { class: 'plot plot--grid' }, [
        h('div', { class: 'bar', style: 'width:' + (p / HMAX * 100) + '%' }, [seg('s2', 1, tip)]),
        h('span', { class: 'whisker', style: 'left:' + (lo / HMAX * 100) + '%;width:' + ((hi - lo) / HMAX * 100) + '%' })
      ])
    ]));
    hTable.appendChild(h('tr', null, [
      h('td', { text: t.name }), h('td', { class: 'n', text: t.n }), h('td', { class: 'n', text: pct1(t.n) + '%' }),
      h('td', { class: 'n', text: (lo * 100).toFixed(0) + '–' + (hi * 100).toFixed(0) + '%' })
    ]));
  });

  /* ---------- 100% stacked rows (apply + events) ---------- */
  function fullRow(name, sub, counts, names) {
    const total = counts.reduce((a, b) => a + b, 0);
    const segs = counts.map((n, i) => n ? seg('s' + (i + 1), n, names[i] + ': ' + n + ' (' + pct(n, total) + '%)', n) : null);
    return h('div', { class: 'crow', tabindex: '0', 'data-tip': name + '\n' + counts.map((n, i) => names[i] + ': ' + n).join(' · ') }, [
      label(name, sub),
      h('div', { class: 'plot plot--full' }, [h('div', { class: 'bar' }, segs)])
    ]);
  }
  document.getElementById('chart-apply').appendChild(
    fullRow('All 91 voters', '64% yes · 32% maybe · 4% not for me', [58, 29, 4], ['Yes, I would apply', 'Maybe', 'Not for me'])
  );

  const E = [
    { name: 'Socials with partner clubs', c: [56, 35, 0] },
    { name: 'Demo night', c: [46, 35, 10] },
    { name: 'Coworking sessions', c: [39, 49, 3] }
  ];
  const eChart = document.getElementById('chart-events');
  const eTable = document.getElementById('table-events');
  E.forEach(e => {
    eChart.appendChild(fullRow(e.name, pct(e.c[0]) + '% definitely', e.c, ['Definitely', 'Might come', 'Not for me']));
    eTable.appendChild(h('tr', null, [h('td', { text: e.name })].concat(e.c.map(n => h('td', { class: 'n', text: n + ' (' + pct(n) + '%)' })))));
  });

  /* ---------- tracks ---------- */
  const T = [
    { name: 'Machine learning', yes: 28, maybe: 9, no: 1 },
    { name: 'Investment', yes: 12, maybe: 7, no: 1 },
    { name: 'Engineering', yes: 10, maybe: 5, no: 0 },
    { name: 'The rotating track', yes: 7, maybe: 7, no: 1 },
    { name: 'None of these', yes: 1, maybe: 0, no: 1 },
    { name: 'Biology', yes: 0, maybe: 1, no: 0 }
  ];
  const TMAX = 40;
  const tChart = document.getElementById('chart-tracks');
  const tTable = document.getElementById('table-tracks');
  T.forEach(t => {
    const total = t.yes + t.maybe + t.no, rest = t.maybe + t.no;
    const width = (total / TMAX) * 100;
    tChart.appendChild(h('div', { class: 'crow', tabindex: '0', 'data-tip': t.name + ': ' + total + ' voters\nWould apply: ' + t.yes + ' · Maybe: ' + t.maybe + ' · Not for me: ' + t.no }, [
      label(t.name, pct(total) + '% of voters'),
      h('div', { class: 'plot' }, [
        h('div', { class: 'bar', style: 'width:' + width + '%' }, [
          t.yes ? seg('s1', t.yes, 'Would apply: ' + t.yes, t.yes) : null,
          rest ? seg('s3', rest, 'Maybe or not for me: ' + rest) : null
        ]),
        h('span', { class: 'val', style: 'left:calc(' + width + '% + 8px)', text: String(total) })
      ])
    ]));
    tTable.appendChild(h('tr', null, [
      h('td', { text: t.name }), h('td', { class: 'n', text: total }), h('td', { class: 'n', text: t.yes }),
      h('td', { class: 'n', text: t.maybe }), h('td', { class: 'n', text: t.no })
    ]));
  });

  /* ---------- outcome ---------- */
  const O = [
    { name: 'Something I can put on a resume', n: 43, yes: 28 },
    { name: 'A better handle on how Claude works', n: 20, yes: 9 },
    { name: 'People to build with', n: 19, yes: 16 },
    { name: 'A tool I actually use for school', n: 9, yes: 5 }
  ];
  const OMAX = 50;
  const oChart = document.getElementById('chart-outcome');
  const oTable = document.getElementById('table-outcome');
  O.forEach(o => {
    const width = (o.n / OMAX) * 100;
    const tip = o.name + ': ' + o.n + ' (' + pct(o.n) + '%)\n' + o.yes + ' of ' + o.n + ' would apply to a build team';
    oChart.appendChild(h('div', { class: 'crow', tabindex: '0', 'data-tip': tip }, [
      label(o.name, pct(o.yes, o.n) + '% would apply to a build team'),
      h('div', { class: 'plot' }, [
        h('div', { class: 'bar', style: 'width:' + width + '%' }, [seg('s2', 1, tip)]),
        h('span', { class: 'val', style: 'left:calc(' + width + '% + 8px)', text: o.n + ' · ' + pct(o.n) + '%' })
      ])
    ]));
    oTable.appendChild(h('tr', null, [
      h('td', { text: o.name }), h('td', { class: 'n', text: o.n }), h('td', { class: 'n', text: pct1(o.n) + '%' }),
      h('td', { class: 'n', text: o.yes + ' of ' + o.n + ' (' + pct(o.yes, o.n) + '%)' })
    ]));
  });

  /* ---------- labels inside segments only when they fit ---------- */
  function fit() {
    document.querySelectorAll('.seg[data-label]').forEach(s => {
      s.textContent = '';
      const t = h('span', { text: s.dataset.label });
      s.appendChild(t);
      if (t.offsetWidth + 10 > s.clientWidth) s.textContent = '';
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  let raf = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); });

  /* ---------- tooltip ---------- */
  const tipEl = document.getElementById('tip');
  function place(x, y) {
    const r = tipEl.getBoundingClientRect();
    let left = x + 14, top = y + 16;
    if (left + r.width > window.innerWidth - 8) left = Math.max(8, x - r.width - 14);
    if (top + r.height > window.innerHeight - 8) top = Math.max(8, y - r.height - 12);
    tipEl.style.left = left + 'px';
    tipEl.style.top = top + 'px';
  }
  function show(text, x, y) { tipEl.textContent = text; tipEl.hidden = false; place(x, y); }
  function hide() { tipEl.hidden = true; }
  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (!t) return hide();
    if (tipEl.textContent !== t.dataset.tip || tipEl.hidden) show(t.dataset.tip, e.clientX, e.clientY);
    else place(e.clientX, e.clientY);
  });
  document.addEventListener('pointerleave', hide);
  document.addEventListener('scroll', hide, { passive: true });
  document.addEventListener('focusin', e => {
    const t = e.target.closest && e.target.closest('.crow[data-tip]');
    if (!t) return hide();
    const r = t.getBoundingClientRect();
    show(t.dataset.tip, r.left + Math.min(r.width * 0.5, 240), r.bottom - 4);
  });
  document.addEventListener('focusout', hide);
})();
