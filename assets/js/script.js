const calculate = document.querySelector('#btnSearch');
const amountClp = document.querySelector('#amountClp');
const selectchooseCurrency = document.querySelector('#chooseCurrency');
const ENDPOINT = 'https://mindicador.cl/api';
const charts = document.querySelector('#charts');
const resultOperation = document.querySelector('#resultOperation');
let dataIndicadorCl = null;
const CURRENT_YEAR = new Date().getFullYear();
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  getData(); 
  chartInstance = new Chart(charts, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: `Valor del  en pesos chilenos`,
        data: [],
        fill: false,
        tension: 0.1
      }]
    }

  });
});

const getData = async () => { 
  try {
    const response = await fetch(ENDPOINT);
    const data = await response.json();
    dataIndicadorCl = data;
    getOptions(data);
  } catch (error) {
    console.log(error);
  }
}

const getOptions = (dataIndicadorCl) => {
  const ignoreFields = ['version', 'autor', 'fecha'];
  const options = Object.keys(dataIndicadorCl)
    .filter(key => !ignoreFields.includes(key))
    .map(key => `<option value="${key}">${dataIndicadorCl[key].nombre}</option>`)
    .join('');
  selectchooseCurrency.innerHTML = options;
}

const getHistoryValues = async (year) => {
  try {
    const endpoint = `${ENDPOINT}/${selectchooseCurrency.value}/${year}`;
    const response = await fetch(endpoint);
    const data = await response.json();
    const labels = createLabels(data.serie);
    const dataValues = createData(data.serie);
    updateCharts(dataValues, labels);

  } catch (error) {
    console.log(error);
  }
}


const updateCharts = (data, labels) => {
  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = data;
  chartInstance.update();
}
 
const createLabels = (data) => {
  const result = data.slice(0, 11).map(item => {
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


calculate.addEventListener('click', () => {
  const currencySelected = selectchooseCurrency.value;
  const amount = amountClp.value;
  if (!amount) {
    alert('Debes ingresar un monto');
    return;
  }
  const valor = dataIndicadorCl[currencySelected].valor;
  resultOperation.innerHTML = `:
  ${(valor / amount).toFixed(2)} ${currencySelected}
  `;
  getHistoryValues(CURRENT_YEAR);
});
