// script.js - Версия с поддержкой скобок и улучшенным отображением

const display = document.getElementById('display');
const buttons = document.getElementById('buttons');

let currentInput = '0';      // Текущее число (показывается на дисплее)
let expressionHistory = [];  // История ввода: [число, оператор, число, ...]
let clearOnNextDigit = true;
let parenthesisCount = 0;    // Счетчик открытых скобок

/**
 * Определяет приоритет оператора, включая скобки.
 * @param {string} op - Оператор
 * @returns {number} Приоритет
 */
function getPrecedence(op) {
    if (op === '×' || op === '÷' || op === '%') return 3; // Увеличиваем приоритет
    if (op === '+' || op === '-') return 2;
    if (op === '(') return 1;
    return 0;
}

/**
 * Выполняет бинарную операцию.
 */
function operate(num1, operator, num2) {
    num1 = parseFloat(num1);
    num2 = parseFloat(num2);

    switch (operator) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '×': return num1 * num2;
        case '÷': 
            if (num2 === 0) {
                throw new Error("DivByZero");
            }
            return num1 / num2;
        default: return num2;
    }
}

/**
 * Преобразует инфиксное выражение в обратную польскую нотацию (RPN) и вычисляет его.
 */
function calculate() {
    // 1. Подготовка выражения
    if (!isNaN(parseFloat(currentInput))) {
        expressionHistory.push(currentInput);
    }
    
    // Закрываем оставшиеся скобки, если они есть
    for (let i = 0; i < parenthesisCount; i++) {
        expressionHistory.push(')');
    }
    
    const outputQueue = [];
    const operatorStack = [];
    
    try {
        // 2. Алгоритм Shunting-Yard (Инфикс -> RPN)
        for (const token of expressionHistory) {
            if (!isNaN(parseFloat(token))) {
                outputQueue.push(token); // Число -> Очередь
            } else if (token === '(') {
                operatorStack.push(token);
            } else if (token === ')') {
                while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                    outputQueue.push(operatorStack.pop());
                }
                if (operatorStack.pop() !== '(') {
                    throw new Error("Mismatched parenthesis");
                }
            } else { // Оператор
                while (
                    operatorStack.length > 0 &&
                    getPrecedence(operatorStack[operatorStack.length - 1]) >= getPrecedence(token)
                ) {
                    outputQueue.push(operatorStack.pop());
                }
                operatorStack.push(token);
            }
        }
        
        // Перемещаем оставшиеся операторы
        while (operatorStack.length > 0) {
            if (operatorStack[operatorStack.length - 1] === '(') throw new Error("Mismatched parenthesis");
            outputQueue.push(operatorStack.pop());
        }

        // 3. Вычисление RPN
        const finalStack = [];
        for (const token of outputQueue) {
            if (!isNaN(parseFloat(token))) {
                finalStack.push(parseFloat(token));
            } else {
                const num2 = finalStack.pop();
                const num1 = finalStack.pop();
                if (num1 === undefined || num2 === undefined) throw new Error("Invalid expression structure");
                finalStack.push(operate(num1, token, num2));
            }
        }

        if (finalStack.length !== 1) throw new Error("Invalid final expression");

        const finalResult = finalStack[0];
        
        // Обновление состояния
        currentInput = parseFloat(finalResult.toFixed(10)).toString();
        display.innerText = currentInput;
        expressionHistory = [];
        parenthesisCount = 0;
        clearOnNextDigit = true;

    } catch (e) {
        display.innerText = 'Error';
        currentInput = '0';
        expressionHistory = [];
        parenthesisCount = 0;
        clearOnNextDigit = true;
    }
}

// -------------------------------------------------------------
// Ввод и отображение
// -------------------------------------------------------------

function updateDisplay(lastOperator = null) {
    // Отображает полное выражение, но выделяет текущий ввод.
    let fullDisplay = expressionHistory.join(' ') + (expressionHistory.length > 0 && lastOperator ? ' ' : '');
    
    // В случае ошибки, очищаем и выводим 'Error'
    if (fullDisplay.includes('Error')) {
         display.innerText = 'Error';
         return;
    }

    if (clearOnNextDigit && expressionHistory.length === 0) {
         display.innerText = currentInput; // Показываем '0'
         return;
    }

    // Если мы вводим число, показываем его
    if (currentInput !== '') {
        fullDisplay += currentInput;
    } else if (lastOperator) {
        // Если только что нажали оператор, но текущего числа нет
        fullDisplay += lastOperator;
    }
    
    // Добавляем индикатор незакрытых скобок
    if (parenthesisCount > 0) {
        fullDisplay += ' (' + parenthesisCount + ' open)';
    }

    display.innerText = fullDisplay;
}

function clearDisplay() {
    currentInput = '0';
    expressionHistory = [];
    parenthesisCount = 0;
    clearOnNextDigit = true;
    updateDisplay();
}

function inputNumber(value) {
    if (clearOnNextDigit) {
        currentInput = (value === '.') ? '0.' : value;
        clearOnNextDigit = false;
        expressionHistory = []; // Сброс истории при начале нового вычисления
    } else {
        if (value === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && value !== '.') currentInput = value;
        else currentInput += value;
    }
    updateDisplay();
}

function inputOperator(op) {
    if (currentInput === '' && expressionHistory.length === 0) return; // Нельзя начать с оператора
    
    // 1. Добавляем текущее число в историю (если оно есть)
    if (currentInput !== '') {
        expressionHistory.push(currentInput);
    }
    
    // 2. Проверяем последний элемент в истории (если оператор, заменяем его)
    const last = expressionHistory[expressionHistory.length - 1];
    if (last && isNaN(parseFloat(last)) && last !== ')') {
        expressionHistory[expressionHistory.length - 1] = op;
    } else if (currentInput !== '') {
        expressionHistory.push(op);
    }
    
    currentInput = '';
    clearOnNextDigit = false;
    updateDisplay(op);
}

// -------------------------------------------------------------
// Обработчики кнопок
// -------------------------------------------------------------

buttons.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.classList.contains('btn')) return;
    const value = target.innerText;

    if (target.classList.contains('num') || value === '.') {
        inputNumber(value);
    } else if (target.classList.contains('op-add')) {
        inputOperator('+');
    } else if (target.classList.contains('op-sub')) {
        inputOperator('-');
    } else if (target.classList.contains('op-mult')) {
        inputOperator('×');
    } else if (target.classList.contains('op-div')) {
        inputOperator('÷');
    } else if (target.classList.contains('op-mod')) {
        // Процент как оператор деления на 100 для последнего числа
        if (currentInput !== '' && currentInput !== '0') {
            currentInput = (parseFloat(currentInput) / 100).toString();
            updateDisplay();
        }
    } else if (target.classList.contains('fn-equals')) {
        calculate();
    } else if (target.classList.contains('fn-clear')) {
        clearDisplay();
    } else if (target.classList.contains('fn-paren')) {
        // Логика скобок
        if (value === '(') {
            if (currentInput !== '0' && !clearOnNextDigit) {
                 // Запрет ввода ( сразу после числа
                 return;
            }
            expressionHistory.push(value);
            parenthesisCount++;
            clearOnNextDigit = false;
            currentInput = '';
        } else if (value === ')' && parenthesisCount > 0) {
            if (currentInput !== '') expressionHistory.push(currentInput);
            expressionHistory.push(value);
            parenthesisCount--;
            currentInput = '';
            clearOnNextDigit = false;
        }
        updateDisplay();
    } else if (target.classList.contains('fn-sign')) {
        // Смена знака (+/-)
        if (currentInput !== '0' && currentInput !== '') {
            if (currentInput.startsWith('-')) {
                currentInput = currentInput.substring(1);
            } else {
                currentInput = '-' + currentInput;
            }
            updateDisplay();
        }
    }
});

// Инициализация
clearDisplay();

