// script.js - Рефакторинг для безопасности и надежности вычислений

const display = document.getElementById('display');
const buttons = document.getElementById('buttons');

let currentInput = '0'; // Текущее число, вводимое пользователем
let currentExpression = []; // Массив [число, оператор, число, оператор...]
let clearOnNextDigit = true;

/**
 * Определяет приоритет оператора.
 * @param {string} op - Оператор (+, -, ×, ÷, %)
 * @returns {number} Приоритет (выше = выполняется раньше)
 */
function getPrecedence(op) {
    if (op === '×' || op === '÷' || op === '%') return 2;
    if (op === '+' || op === '-') return 1;
    return 0; // Для других элементов
}

/**
 * Выполняет бинарную операцию.
 * @param {number} num1 - Первый операнд
 * @param {string} operator - Оператор
 * @param {number} num2 - Второй операнд
 * @returns {number} Результат
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
                throw new Error("Division by zero");
            }
            return num1 / num2;
        case '%': return (num1 / 100) * num2; // % используется как модификатор
        default: return num2;
    }
}

/**
 * Выполняет вычисление всего выражения, используя приоритет операций.
 */
function calculate() {
    // Добавляем текущее число в выражение перед вычислением
    if (!isNaN(parseFloat(currentInput))) {
        currentExpression.push(currentInput);
    }
    
    // Создаем копии для обработки приоритетов
    const values = [];
    const ops = [];

    try {
        for (let i = 0; i < currentExpression.length; i++) {
            const item = currentExpression[i];

            if (!isNaN(parseFloat(item))) {
                // Это число (операнд)
                values.push(parseFloat(item));
            } else {
                // Это оператор
                while (
                    ops.length > 0 &&
                    getPrecedence(ops[ops.length - 1]) >= getPrecedence(item)
                ) {
                    const op = ops.pop();
                    const val2 = values.pop();
                    const val1 = values.pop();
                    values.push(operate(val1, op, val2));
                }
                ops.push(item);
            }
        }
        
        // Завершаем оставшиеся операции
        while (ops.length > 0) {
            const op = ops.pop();
            const val2 = values.pop();
            const val1 = values.pop();
            values.push(operate(val1, op, val2));
        }

        const finalResult = values[0];
        
        // Отображаем результат, округляя до 10 знаков после запятой
        currentInput = parseFloat(finalResult.toFixed(10)).toString();
        display.innerText = currentInput;
        currentExpression = [currentInput];
        clearOnNextDigit = true;

    } catch (e) {
        display.innerText = 'Error';
        currentInput = '0';
        currentExpression = [];
        clearOnNextDigit = true;
    }
}

/**
 * Обновленная функция очистки.
 */
function clearDisplay() {
    currentInput = '0';
    currentExpression = [];
    clearOnNextDigit = true;
    display.innerText = '0';
}

/**
 * Обновленная функция ввода числа.
 */
function inputNumber(value) {
    if (clearOnNextDigit) {
        currentInput = (value === '.') ? '0.' : value;
        clearOnNextDigit = false;
    } else {
        if (value === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && value !== '.') currentInput = value;
        else currentInput += value;
    }
    display.innerText = currentInput;
}

/**
 * Обновленная функция ввода оператора.
 */
function inputOperator(op) {
    // 1. Сначала добавляем текущее число в выражение
    if (currentInput !== '') {
        currentExpression.push(currentInput);
    }
    
    // 2. Если последний элемент в выражении уже оператор, заменяем его (для последовательного ввода)
    const last = currentExpression[currentExpression.length - 1];
    if (last && isNaN(parseFloat(last))) {
        currentExpression[currentExpression.length - 1] = op;
    } else {
        currentExpression.push(op);
    }
    
    // 3. Обновляем дисплей, показывая последнее число и оператор
    display.innerText = currentInput + ' ' + op;
    currentInput = '';
    clearOnNextDigit = false;
}

// Переопределение обработчика кликов для работы с новой логикой
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
        inputOperator('%');
    } else if (target.classList.contains('fn-equals')) {
        calculate();
    } else if (target.classList.contains('fn-clear')) {
        clearDisplay();
    } 
    // +/- и скобки требуют более сложной логики парсинга и здесь пропущены
    // для сохранения фокуса на устранении eval().
});

// Инициализация
clearDisplay();
