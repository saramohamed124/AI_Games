      const $ = (i) => document.getElementById(i),
        rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
      document.querySelectorAll("#tabs button").forEach(
        (b) =>
          (b.onclick = () => {
            document
              .querySelectorAll("#tabs button")
              .forEach((x) => x.setAttribute("aria-selected", x === b));
            for (let i = 0; i < 3; i++) $("s" + i).hidden = i != b.dataset.t;
            if (b.dataset.t == 2) sizeCv();
          }),
      );

      /* لعبة 1: Minimax */
      const L = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      let B,
        over,
        nodes,
        sc = [0, 0, 0],
        wl = [];
      const win = (b) => {
        for (const [x, y, z] of L)
          if (b[x] && b[x] === b[y] && b[x] === b[z]) return [b[x], [x, y, z]];
        return b.includes(null) ? null : ["T", []];
      };
      function mm(b, ai, al, be, d) {
        nodes++;
        const w = win(b);
        if (w) return w[0] === "O" ? 10 - d : w[0] === "X" ? d - 10 : 0;
        let best = ai ? -99 : 99;
        for (let i = 0; i < 9; i++)
          if (!b[i]) {
            b[i] = ai ? "O" : "X";
            const v = mm(b, !ai, al, be, d + 1);
            b[i] = null;
            if (ai) {
              best = Math.max(best, v);
              al = Math.max(al, v);
            } else {
              best = Math.min(best, v);
              be = Math.min(be, v);
            }
            if ($("ab").checked && be <= al) break;
          }
        return best;
      }
      function aiMove() {
        nodes = 0;
        let bs = -99,
          mv = [];
        for (let i = 0; i < 9; i++)
          if (!B[i]) {
            B[i] = "O";
            const v = mm(B, false, -99, 99, 1);
            B[i] = null;
            if (v > bs) {
              bs = v;
              mv = [i];
            } else if (v == bs) mv.push(i);
          }
        B[mv[(Math.random() * mv.length) | 0]] = "O";
        $("nd").textContent =
          "الـ AI فحص " +
          nodes.toLocaleString("en") +
          " وضع محتمل قبل ما يلعب.";
      }
      function draw0() {
        const bd = $("bd");
        bd.innerHTML = "";
        const w = win(B);
        B.forEach((v, i) => {
          const b = document.createElement("button");
          b.textContent = v === "X" ? "✕" : v === "O" ? "◯" : "";
          b.className =
            (v === "O" ? "o " : "") + (w && w[1].includes(i) ? "w" : "");
          b.setAttribute("aria-label", "خانة " + (i + 1));
          b.onclick = () => pick(i);
          bd.appendChild(b);
        });
      }
      function end() {
        const w = win(B);
        if (!w) return false;
        over = true;
        const k = w[0] === "X" ? 0 : w[0] === "T" ? 1 : 2;
        sc[k]++;
        [$("sw"), $("sd"), $("sa")].forEach((e, i) => (e.textContent = sc[i]));
        $("m0").textContent =
          w[0] === "X"
            ? "كسبت! 🎉"
            : w[0] === "T"
              ? "تعادل. ده أفضل نتيجة ممكنة قدام الـ AI."
              : "الـ AI كسب 🤖";
        return true;
      }
      function pick(i) {
        if (over || B[i]) return;
        B[i] = "X";
        if (!end()) {
          aiMove();
          end();
        }
        draw0();
      }
      function new0(ai) {
        B = Array(9).fill(null);
        over = false;
        $("m0").textContent = "دورك (✕)";
        $("nd").textContent = "";
        if (ai) {
          aiMove();
        }
        draw0();
      }
      $("nw").onclick = () => new0(false);
      $("ai1").onclick = () => new0(true);
      new0(false);

      /* لعبة 2: الـ AI بيتعلم نمطك */
      const E = ["✊", "✋", "✌️"];
      let T, last, hist;
      function reset1() {
        T = [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1],
        ];
        last = -1;
        hist = [];
        ["rp", "rd", "ra"].forEach((i) => ($(i).textContent = 0));
        $("pb").innerHTML = "";
        $("wr").textContent = "";
        $("m1").textContent = "اختار حركة";
      }
      document.querySelectorAll(".mv button").forEach(
        (b) =>
          (b.onclick = () => {
            const m = +b.dataset.m,
              pr = last < 0 ? [1, 1, 1] : T[last],
              s = pr[0] + pr[1] + pr[2];
            const mx = Math.max(...pr),
              c = pr.map((v, i) => (v == mx ? i : -1)).filter((i) => i >= 0),
              pred = c[(Math.random() * c.length) | 0],
              ai = (pred + 1) % 3;
            const r = m === ai ? "d" : (m + 1) % 3 === ai ? "a" : "p";
            hist.push(r);
            const k = { p: "rp", d: "rd", a: "ra" }[r];
            $(k).textContent = +$(k).textContent + 1;
            $("m1").textContent =
              E[m] +
              " ضد " +
              E[ai] +
              (r == "p" ? " : كسبت!" : r == "a" ? " : الـ AI كسب" : " : تعادل");
            $("pb").innerHTML =
              "<p style='margin:0'>توقع الـ AI لحركتك دي:</p>" +
              pr
                .map(
                  (v, i) =>
                    `<div class="bar"><span>${E[i]}</span><i style="width:${Math.round((v / s) * 100)}%"></i><b>${Math.round((v / s) * 100)}%</b></div>`,
                )
                .join("");
            if (last >= 0) T[last][m]++;
            last = m;
            const h = hist.slice(-10),
              a = h.filter((x) => x == "a").length;
            $("wr").textContent =
              "الـ AI كسب " +
              Math.round((a / h.length) * 100) +
              "% من آخر " +
              h.length +
              " جولة. لو العشوائية سليمة هيفضل حوالي 33%.";
          }),
      );
      $("rr").onclick = reset1;
      reset1();

      /* لعبة 3: BFS مقابل A* */
      const R = 14,
        C = 14,
        W = new Uint8Array(R * C),
        goal = R * C - 1,
        start = 0;
      let cs,
        cv = $("cv"),
        cx = cv.getContext("2d"),
        vis = new Uint8Array(R * C),
        path = [],
        run = false,
        paint = -1;
      function sizeCv() {
        cs = Math.floor(Math.min($("m").clientWidth - 34, 400) / C);
        cv.width = cv.height = cs * C;
        cv.style.width = cv.style.height = cs * C + "px";
        dr();
      }
      function dr() {
        cx.clearRect(0, 0, cv.width, cv.height);
        for (let i = 0; i < R * C; i++) {
          const x = (i % C) * cs,
            y = ((i / C) | 0) * cs;
          cx.fillStyle = W[i]
            ? "#023047"
            : i == start
              ? "#219EBC"
              : i == goal
                ? "#FFB703"
                : vis[i]
                  ? "#8ECAE6"
                  : "#fff";
          cx.fillRect(x, y, cs, cs);
          cx.strokeStyle = "#dbe9f1";
          cx.strokeRect(x, y, cs, cs);
        }
        cx.fillStyle = "#FB8500";
        path.forEach((i) => {
          if (i != start && i != goal)
            cx.fillRect(
              (i % C) * cs + cs * 0.2,
              ((i / C) | 0) * cs + cs * 0.2,
              cs * 0.6,
              cs * 0.6,
            );
        });
      }
      const cell = (e) => {
        const r = cv.getBoundingClientRect();
        return (
          Math.floor((e.clientY - r.top) / cs) * C +
          Math.floor((e.clientX - r.left) / cs)
        );
      };
      cv.onpointerdown = (e) => {
        if (run) return;
        const i = cell(e);
        if (i == start || i == goal) return;
        cv.setPointerCapture(e.pointerId);
        paint = W[i] ? 0 : 1;
        vis.fill(0);
        path = [];
        clr();
        W[i] = paint;
        dr();
      };
      cv.onpointermove = (e) => {
        if (paint < 0 || run) return;
        const i = cell(e);
        if (i >= 0 && i < R * C && i != start && i != goal && W[i] != paint) {
          W[i] = paint;
          dr();
        }
      };
      cv.onpointerup = cv.onpointercancel = () => (paint = -1);
      const push = (h, x) => {
        h.push(x);
        let i = h.length - 1;
        while (i > 0) {
          const p = (i - 1) >> 1;
          if (h[p][0] <= h[i][0]) break;
          [h[p], h[i]] = [h[i], h[p]];
          i = p;
        }
      };
      const pop = (h) => {
        const t = h[0],
          l = h.pop();
        if (h.length) {
          h[0] = l;
          let i = 0;
          for (;;) {
            const a = 2 * i + 1,
              b = a + 1;
            let m = i;
            if (a < h.length && h[a][0] < h[m][0]) m = a;
            if (b < h.length && h[b][0] < h[m][0]) m = b;
            if (m == i) break;
            [h[m], h[i]] = [h[i], h[m]];
            i = m;
          }
        }
        return t;
      };
      const nbr = (i) => {
        const r = (i / C) | 0,
          c = i % C,
          o = [];
        if (r > 0) o.push(i - C);
        if (r < R - 1) o.push(i + C);
        if (c > 0) o.push(i - 1);
        if (c < C - 1) o.push(i + 1);
        return o.filter((j) => !W[j]);
      };
      const hh = (i) =>
        Math.abs(((i / C) | 0) - (R - 1)) + Math.abs((i % C) - (C - 1));
      function solve(k) {
        const par = new Int32Array(R * C).fill(-2),
          ord = [];
        par[start] = -1;
        if (k == "b") {
          const q = [start];
          let h = 0;
          while (h < q.length) {
            const c = q[h++];
            ord.push(c);
            if (c == goal) break;
            for (const j of nbr(c))
              if (par[j] == -2) {
                par[j] = c;
                q.push(j);
              }
          }
        } else {
          const g = new Int32Array(R * C).fill(1e9),
            hp = [[hh(start), start]],
            dn = new Uint8Array(R * C);
          g[start] = 0;
          while (hp.length) {
            const c = pop(hp)[1];
            if (dn[c]) continue;
            dn[c] = 1;
            ord.push(c);
            if (c == goal) break;
            for (const j of nbr(c)) {
              const n = g[c] + 1;
              if (n < g[j]) {
                g[j] = n;
                par[j] = c;
                push(hp, [n + hh(j), j]);
              }
            }
          }
        }
        const p = [];
        if (par[goal] != -2) for (let c = goal; c != -1; c = par[c]) p.push(c);
        return { ord, p };
      }
      function go(k) {
        if (run) return;
        run = true;
        vis.fill(0);
        path = [];
        const { ord, p } = solve(k);
        let n = 0;
        $("m2").textContent = "";
        const fin = () => {
          path = p;
          dr();
          run = false;
          $(k + "1").textContent = ord.length;
          $(k + "2").textContent = p.length ? p.length - 1 : "مفيش طريق";
          if (!p.length)
            $("m2").textContent = "الحواجز قافلة الطريق، شيل جزء منها.";
          else if (
            $("b1").textContent != "-" &&
            $("a1").textContent != "-" &&
            +$("b1").textContent &&
            +$("a1").textContent
          )
            $("m2").textContent =
              "A* فحص حوالي " +
              Math.round((+$("b1").textContent / +$("a1").textContent) * 10) /
                10 +
              " مرة أقل من BFS على نفس الحواجز.";
        };
        const st = () => {
          for (let i = 0; i < 10 && n < ord.length; i++) vis[ord[n++]] = 1;
          dr();
          n < ord.length ? requestAnimationFrame(st) : fin();
        };
        if (rm) {
          ord.forEach((i) => (vis[i] = 1));
          fin();
        } else st();
      }
      const clr = () => {
        ["b1", "b2", "a1", "a2"].forEach((i) => ($(i).textContent = "-"));
        $("m2").textContent = "";
      };
      $("gb").onclick = () => go("b");
      $("ga").onclick = () => go("a");
      $("gc").onclick = () => {
        if (run) return;
        W.fill(0);
        vis.fill(0);
        path = [];
        clr();
        dr();
      };
      $("gm").onclick = () => {
        if (run) return;
        vis.fill(0);
        path = [];
        clr();
        for (let i = 0; i < R * C; i++)
          W[i] = i != start && i != goal && Math.random() < 0.27 ? 1 : 0;
        dr();
      };
      sizeCv();