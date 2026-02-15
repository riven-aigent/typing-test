<script>
  import { COMMON_WORDS, CODE_WORDS, generateText } from '$lib/words.js';

  // State
  let mode = $state('common');
  let duration = $state(30);
  let words = $state([]);
  let currentIndex = $state(0);
  let input = $state('');
  let started = $state(false);
  let finished = $state(false);
  let timeLeft = $state(0);
  let timer = $state(null);
  let results = $state([]);
  let startTime = $state(0);
  let inputEl = $state(null);
  let caretLeft = $state(0);
  let history = $state([]);

  // Derived
  let wordList = $derived(mode === 'code' ? CODE_WORDS : COMMON_WORDS);
  let correctWords = $derived(results.filter(r => r.correct).length);
  let wrongWords = $derived(results.filter(r => !r.correct).length);
  let totalChars = $derived(results.reduce((sum, r) => sum + r.typed.length + 1, 0));
  let correctChars = $derived(results.filter(r => r.correct).reduce((sum, r) => sum + r.typed.length + 1, 0));
  let wpm = $derived(finished ? Math.round((correctChars / 5) / (duration / 60)) : 0);
  let rawWpm = $derived(finished ? Math.round((totalChars / 5) / (duration / 60)) : 0);
  let accuracy = $derived(results.length > 0 ? Math.round((correctWords / results.length) * 100) : 100);

  function reset() {
    words = generateText(wordList, 80);
    currentIndex = 0;
    input = '';
    started = false;
    finished = false;
    timeLeft = duration;
    results = [];
    startTime = 0;
    if (timer) clearInterval(timer);
    timer = null;
    setTimeout(() => inputEl?.focus(), 50);
  }

  function startTimer() {
    started = true;
    startTime = Date.now();
    timeLeft = duration;
    timer = setInterval(() => {
      timeLeft = Math.max(0, duration - Math.floor((Date.now() - startTime) / 1000));
      if (timeLeft <= 0) {
        finish();
      }
    }, 100);
  }

  function finish() {
    finished = true;
    if (timer) clearInterval(timer);
    timer = null;
    // Save to history
    if (results.length > 0) {
      history = [...history, { wpm, rawWpm, accuracy, mode, duration, date: new Date().toISOString() }].slice(-20);
      try { localStorage.setItem('typing-history', JSON.stringify(history)); } catch {}
    }
  }

  function handleKeydown(e) {
    if (finished) return;
    if (!started && e.key.length === 1) startTimer();

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() === '') return;
      const typed = input.trim();
      const expected = words[currentIndex];
      results = [...results, { typed, expected, correct: typed === expected }];
      currentIndex++;
      input = '';
      if (currentIndex >= words.length) {
        words = [...words, ...generateText(wordList, 40)];
      }
    }
  }

  function setMode(m) { mode = m; reset(); }
  function setDuration(d) { duration = d; reset(); }

  // Load history
  $effect(() => {
    try {
      const saved = localStorage.getItem('typing-history');
      if (saved) history = JSON.parse(saved);
    } catch {}
    reset();
  });

  // Refocus on click anywhere
  function focusInput() { inputEl?.focus(); }
</script>

<svelte:window onkeydown={focusInput} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="container" onclick={focusInput}>
  <header>
    <h1>⚡ Typing Test</h1>
    <div class="controls">
      <div class="btn-group">
        <button class:active={mode === 'common'} onclick={() => setMode('common')}>English</button>
        <button class:active={mode === 'code'} onclick={() => setMode('code')}>Code</button>
      </div>
      <div class="btn-group">
        <button class:active={duration === 15} onclick={() => setDuration(15)}>15s</button>
        <button class:active={duration === 30} onclick={() => setDuration(30)}>30s</button>
        <button class:active={duration === 60} onclick={() => setDuration(60)}>60s</button>
        <button class:active={duration === 120} onclick={() => setDuration(120)}>120s</button>
      </div>
    </div>
  </header>

  {#if !finished}
    <div class="timer" class:urgent={timeLeft <= 5 && started}>
      {started ? timeLeft : duration}
    </div>

    <div class="word-display">
      {#each words.slice(Math.max(0, currentIndex - 5), currentIndex + 40) as word, i}
        {@const actualIndex = i + Math.max(0, currentIndex - 5)}
        {@const result = results[actualIndex]}
        <span
          class="word"
          class:current={actualIndex === currentIndex}
          class:correct={result?.correct}
          class:wrong={result && !result.correct}
          class:upcoming={actualIndex > currentIndex}
        >
          {#if actualIndex === currentIndex}
            {#each word.split('') as char, ci}
              <span
                class="char"
                class:char-correct={input[ci] && input[ci] === char}
                class:char-wrong={input[ci] && input[ci] !== char}
                class:char-cursor={ci === input.length}
              >{char}</span>
            {/each}
            {#if input.length > word.length}
              {#each input.slice(word.length).split('') as extra}
                <span class="char char-extra">{extra}</span>
              {/each}
            {/if}
          {:else}
            {word}
          {/if}
        </span>{' '}
      {/each}
    </div>

    <input
      bind:this={inputEl}
      bind:value={input}
      onkeydown={handleKeydown}
      class="hidden-input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />

    <div class="hint">
      {#if !started}
        Start typing to begin...
      {:else}
        {correctWords} words
      {/if}
    </div>
  {:else}
    <div class="results">
      <div class="result-grid">
        <div class="result-card main">
          <div class="result-value">{wpm}</div>
          <div class="result-label">WPM</div>
        </div>
        <div class="result-card">
          <div class="result-value">{accuracy}%</div>
          <div class="result-label">Accuracy</div>
        </div>
        <div class="result-card">
          <div class="result-value">{rawWpm}</div>
          <div class="result-label">Raw WPM</div>
        </div>
        <div class="result-card">
          <div class="result-value">{correctWords}<span class="small">/{results.length}</span></div>
          <div class="result-label">Correct</div>
        </div>
      </div>

      <div class="word-review">
        {#each results as r}
          <span class="review-word" class:correct={r.correct} class:wrong={!r.correct} title={r.correct ? '' : `typed: ${r.typed}`}>
            {r.expected}
          </span>{' '}
        {/each}
      </div>

      <button class="restart-btn" onclick={reset}>Try Again ↻</button>
    </div>

    {#if history.length > 1}
      <div class="history">
        <h3>Recent Results</h3>
        <div class="history-list">
          {#each [...history].reverse().slice(0, 10) as h}
            <div class="history-item">
              <span class="h-wpm">{h.wpm} WPM</span>
              <span class="h-acc">{h.accuracy}%</span>
              <span class="h-mode">{h.mode}</span>
              <span class="h-dur">{h.duration}s</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  header { text-align: center; margin-bottom: 2rem; }
  h1 { font-size: 1.5rem; color: var(--accent); margin-bottom: 1rem; }

  .controls { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
  .btn-group { display: flex; gap: 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .btn-group button {
    padding: 0.4rem 0.8rem;
    background: var(--bg-card);
    color: var(--text-dim);
    font-size: 0.8rem;
    border-right: 1px solid var(--border);
    transition: all 0.15s;
  }
  .btn-group button:last-child { border-right: none; }
  .btn-group button:hover { color: var(--text); }
  .btn-group button.active { background: var(--accent); color: var(--bg); }

  .timer {
    font-size: 3rem;
    font-weight: 700;
    color: var(--accent2);
    margin-bottom: 2rem;
    transition: color 0.3s;
  }
  .timer.urgent { color: var(--wrong); }

  .word-display {
    font-size: 1.4rem;
    line-height: 2.2;
    max-height: 8rem;
    overflow: hidden;
    width: 100%;
    text-align: center;
    position: relative;
  }

  .word { color: var(--text-dim); transition: color 0.1s; display: inline; }
  .word.current { color: var(--text); }
  .word.correct { color: var(--correct); }
  .word.wrong { color: var(--wrong); text-decoration: underline; }
  .word.upcoming { color: var(--text-dark); }

  .char { position: relative; }
  .char-correct { color: var(--correct); }
  .char-wrong { color: var(--wrong); background: rgba(247, 118, 142, 0.15); border-radius: 2px; }
  .char-cursor::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background: var(--cursor);
    animation: blink 1s infinite;
  }
  .char-extra { color: var(--wrong); opacity: 0.7; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .hint {
    margin-top: 2rem;
    color: var(--text-dim);
    font-size: 0.85rem;
  }

  .results { width: 100%; text-align: center; }
  .result-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .result-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem 1rem;
  }
  .result-card.main { border-color: var(--accent); }
  .result-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent2);
  }
  .result-card.main .result-value { color: var(--accent); font-size: 2.5rem; }
  .result-label { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.3rem; }
  .small { font-size: 0.8rem; color: var(--text-dim); }

  .word-review {
    padding: 1rem;
    background: var(--bg-input);
    border-radius: 8px;
    font-size: 0.9rem;
    line-height: 2;
    margin-bottom: 1.5rem;
    max-height: 6rem;
    overflow-y: auto;
  }
  .review-word.correct { color: var(--correct); }
  .review-word.wrong { color: var(--wrong); text-decoration: line-through; cursor: help; }

  .restart-btn {
    padding: 0.8rem 2rem;
    background: var(--accent);
    color: var(--bg);
    font-size: 1rem;
    font-weight: 600;
    border-radius: 8px;
    transition: transform 0.1s, opacity 0.2s;
  }
  .restart-btn:hover { opacity: 0.9; }
  .restart-btn:active { transform: scale(0.97); }

  .history {
    width: 100%;
    margin-top: 2rem;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .history h3 { font-size: 0.85rem; color: var(--text-dim); margin-bottom: 0.8rem; }
  .history-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .history-item {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--text-dim);
    padding: 0.3rem 0;
    border-bottom: 1px solid var(--border);
  }
  .h-wpm { color: var(--accent); font-weight: 600; min-width: 70px; }
  .h-acc { color: var(--correct); min-width: 40px; }
  .h-mode { color: var(--text-dark); }
  .h-dur { color: var(--text-dark); }

  @media (max-width: 600px) {
    .word-display { font-size: 1.1rem; }
    .result-grid { grid-template-columns: repeat(2, 1fr); }
    .result-value { font-size: 1.5rem; }
    .result-card.main .result-value { font-size: 2rem; }
  }
</style>
