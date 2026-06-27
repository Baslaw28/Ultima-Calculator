// Simple calculator logic with keyboard support and basic safety check for evaluation.

(() => {
  const displayEl = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');
  let expression = ''; // user-visible expression (using normal operators)
  const MAX_LENGTH = 200;

  function updateDisplay() {
    displayEl.textContent = expression === '' ? '0' : expression;
  }

  function appendValue(val) {
    if (expression.length >= MAX_LENGTH) return;
    // Prevent two operators in a row (except '(' and unary '-')
    const last = expression.slice(-1);
    const operators = ['+', '-', '*', '/', '.'];
    if (operators.includes(val)) {
      // prevent multiple dots in the same number
      if (val === '.') {
        // find last operator position
        const lastOp = Math.max(
          expression.lastIndexOf('+'),
          expression.lastIndexOf('-'),
          expression.lastIndexOf('*'),
          expression.lastIndexOf('/'),
          expression.lastIndexOf('('),
          expression.lastIndexOf(')')
        );
        const currentNumber = expression.slice(lastOp + 1);
        if (currentNumber.includes('.')) return;
      } else {
        if (expression === '' && val !== '-') return; // don't start with operator except '-'
        if (operators.includes(last)) {
          // replace previous operator with new one
          expression = expression.slice(0, -1);
        }
      }
    }

    expression += val;
    updateDisplay();
  }

  function backspace() {
    expression = expression.slice(0, -1);
    updateDisplay();
  }

  function clearAll() {
    expression = '';
    updateDisplay();
  }

  function safeEvaluate(expr) {
    // Allow digits, whitespace, operators + - * / ( ) and decimal point only
    // Replace fancy symbols with JS equivalents
    const normalized = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!/^[0-9+\-*/().\s]+$/.test(normalized)) {
      throw new Error('Invalid characters');
    }
    // Use Function instead of eval; still treat carefully
    if (normalized.length > 500) throw new Error('Expression too long');
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + normalized + ')')();
  }

  function compute() {
    try {
      if (!expression) return;
      // Balance parentheses: quick check
      const open = (expression.match(/\(/g) || []).length;
      const close = (expression.match(/\)/g) || []).length;
      if (open !== close) {
        expression = 'Error';
        updateDisplay();
        setTimeout(() => { expression = ''; updateDisplay(); }, 1000);
        return;
      }

      const result = safeEvaluate(expression);
      if (typeof result === 'number' && !Number.isFinite(result)) throw new Error('Math error');
      // Format result: avoid long fractions
      const formatted = Number.isInteger(result) ? String(result) : (+result.toPrecision(12)).toString();
      expression = formatted.replace(/(?:\.0+|(\.\d+?)0+)$/, '$1');
      updateDisplay();
    } catch (err) {
      expression = 'Error';
      updateDisplay();
      setTimeout(() => { expression = ''; updateDisplay(); }, 1200);
    }
  }

  // Button clicks
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      const action = btn.dataset.action;
      if (action === 'clear') { clearAll(); return; }
      if (action === 'backspace') { backspace(); return; }
      if (action === 'equals') { compute(); return; }
      if (val !== undefined) appendValue(val);
    });
  });

  // Keyboard input
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); compute(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key.toLowerCase() === 'c') { e.preventDefault(); clearAll(); return; }
    // Allow digits and operators and parentheses
    if (/^[0-9+\-*/().]$/.test(e.key)) {
      appendValue(e.key);
      e.preventDefault();
    }
  });

  // Initialize
  updateDisplay();
})();
