const calculate = document.querySelector('#btnSearch');
const amountClp = document.querySelector('#amountClp');
const selectChooseCurrency = document.querySelector('#chooseCurrency');
const ENDPOINT = 'https://mindicador.cl/api';
const charts = document.querySelector('#charts');
const resultOperation = document.querySelector('#resultOperation');
const CURRENT_YEAR = new Date().getFullYear();
const loadingElement = document.querySelector('#loading');
const textError = document.querySelector('#textError');
const resultado = document.querySelector('#resultado');

let dataIndicadorCl = null;
let chartInstance = null;
let loading = false;

document.addEventListener('DOMContentLoaded', () => {
  charts.style.display = 'none'; // ocultar grafico por defecto
  resultado.style.display = 'none'; // ocultar resultado por defecto

  getData(); 

  chartInstance = new Chart(charts, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: '',
        data: [],
        fill: false,
        tension: 0.2
      }]
    }
  });
});

/**
 * @desc Obtiene los datos de la API
 * @returns {void}
 */

const getData = async () => { 
  toggleLoading();
  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) {
      throw new Error('No se pudo obtener los datos');
    }
    const data = await response.json();
    dataIndicadorCl = data;
    getOptions(data);
    toggleLoading();
  } catch (error) {
    toggleLoading();
    showMessageError(`${error.message}, intenta más tarde`);
    disableElements();
  }
}

/**
 * @desc Genera las opciones del select
 * @returns {void}
 */
const getOptions = (dataIndicadorCl) => {
  const ignoreFields = ['version', 'autor', 'fecha'];
  const options = Object.keys(dataIndicadorCl)
    .filter(key => !ignoreFields.includes(key))
    .map(key => {
      if (dataIndicadorCl[key]) {
        return `<option value="${key}">${dataIndicadorCl[key].nombre}</option>`
      }
      return '';
    })
    .join('');
  selectChooseCurrency.innerHTML = options;
}
/**
 * @desc Obtiene los valores historicos del indicador seleccionado
 * @param number year 
 */

const getHistoryValues = async (year) => {
  toggleLoading();
  try {
    const endpoint = `${ENDPOINT}/${selectChooseCurrency.value}/${year}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('No se pudo obtener los datos');
    }

    const data = await response.json();
    charts.style.display = 'block';
    resultado.style.display = 'block';
    updateCharts(createData(data.serie), createLabels(data.serie));

  } catch (error) {
    showMessageError(`${error.message}, intenta más tarde`);
    toggleLoading();
  }
}



// DOM Events
calculate.addEventListener('click', () => {
  const currencySelected = selectChooseCurrency.value;
  const amount = amountClp.value;
  if (!amount) {
    alert('Debes ingresar un monto');
    return;
  }
  calculateExchangeAndRender(amount, currencySelected);
  getHistoryValues(CURRENT_YEAR);
});

selectChooseCurrency.addEventListener('change', () => {
  getHistoryValues(CURRENT_YEAR);
  calculateExchangeAndRender(amountClp.value, selectChooseCurrency.value);
});

// helpers

/**
 * @desc Actualiza los datos del grafico. No es necesario volver a crear la instancia. se ahorra recursos
 * @param {array} data
 * @param {array} labels
 * @returns {void}
 */
const updateCharts = (data, labels) => {
  toggleLoading();
  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = data;
  chartInstance.data.datasets[0].label = `${dataIndicadorCl[selectChooseCurrency.value].nombre}. Valores de los últimos 10 días`;
  chartInstance.update();
}

const createLabels = (data, items = 10) => {
  const result = data.slice(0, items).map(item => {
    const date = new Date(item.fecha);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  });
  return result.reverse();
}

const createData = (data) => {
  const result = data.slice(0, 11).map(item => {
    return item.valor;
  });
  return result.reverse();
}

const calculateExchangeAndRender = (amount, currency) => {
  const result = (amount / dataIndicadorCl[currency].valor).toFixed(2);
  resultOperation.innerHTML = `:
  ${result} ${currency}
  `;
}

const toggleLoading = () => {
  loading = !loading;
  if (loading) {
    calculate.setAttribute('disabled', true);
    calculate.innerHTML = 'Cargando...';
    loadingElement.classList.remove('hidden');
  } else {
    loadingElement.classList.add('hidden');
    calculate.removeAttribute('disabled');
    calculate.innerHTML = 'Calcular';
  }
}
const showMessageError = (message) => {
  textError.textContent = message;
  textError.classList.remove('hidden');
}

const hideMessageError = () => {
  textError.classList.add('hidden');
  textError.textContent = '';
}

const disableElements = () => {
  selectChooseCurrency.innerHTML = `<option>Error al cargar opciones</option>`;
  selectChooseCurrency.disabled = true;
  calculate.disabled = true;
}

