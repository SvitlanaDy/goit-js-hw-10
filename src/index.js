import './css/styles.css';
import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import { fetchCountries }from './js/fetchCountries';

const DEBOUNCE_DELAY = 300;

const inputForm = document.getElementById('search-box');
const countryList = document.querySelector('.country-list');
const countryCard = document.querySelector('.country-info');
inputForm.addEventListener('input', debounce(onInputCountrySearch, DEBOUNCE_DELAY));
//Назву країни для пошуку користувач вводить у текстове поле input#search-box. HTTP-запити виконуються при 
//введенні назви країни, тобто на події input. 
function onInputCountrySearch(e) {
    // Виконай санітизацію введеного рядка методом trim(), це вирішить проблему, коли в полі 
    // введення тільки пробіли, або вони є на початку і в кінці рядка.
   //  - trim() => очищує від пробілів
    let inputValue = '';
    inputValue = e.target.value.trim();
    	// При вводі пробілу - запит на СЕРВЕР не відправляється (ф-я обривається)
	// +
	//Якщо користувач повністю очищає поле пошуку, то HTTP-запит не виконується,
    // а розмітка списку країн або інформації про країну зникає.=> UI очищається 
	if (inputValue.length === 0) {
		clearUI()
		return;
	}
    // Ф-я очищає пользов.интерфейс(UI):
	// 1) 1-й запит на СЕРВЕР => повертає відповідь в вигляді масиву даних  10 країн => тому спрацьовує функція CountriesListLayout
//   2) якщо користувач вводить коректні символи в ІНПУТ (назва країни) =>
// 			відправляється 2-й запит на СЕРВЕР => повертає відповідь в вигляді масиву даних з 1 країною =спрацьовує фукція CountryCardLayout
//   3) щоб очистити розмітку CountriesListLayout => виконуємо очищення, countryList.innerHTML = '' (clearUI())
	clearUI()

    // ---- Ф-я (після вводу користувачем => inputValue, відправляє запит на СЕРВЕР, тому, якщо успіх - 
    // то метод .then() викликає ф-ю ()=>{},
      // для даних з БЕКЕНДА, (масив обʼєктів)- [{}, {}, {}] => (dataArray)
      // ------Якщо країна 1 === 1 то запускається функція CountryCardLayout (Якщо результат запиту - це масив з однією країною, 
      //в інтерфейсі відображається розмітка картки з даними про країну: прапор, назва, столиця, населення і мови.)
      // ------Якщо бекенд повернув від 2-х до 10-и країн, під тестовим полем відображається список знайдених країн.
      // Кожен елемент списку складається з прапора та назви країни. CountriesListLayout
      // Якщо у відповіді бекенд повернув більше ніж 10 країн, в інтерфейсі з'являється 
      //повідомлення про те, що назва повинна бути специфічнішою. Для повідомлень використовуй 
      //бібліотеку notiflix і виводь такий рядок "Too many matches found. Please enter a more specific name.". 
      //запускається фунція CountriesListLayout

      fetchCountries(inputValue)
      .then(dataArray => {
         
        if (dataArray.length === 1) {
          renderCountryCardLayout(dataArray);
        } else if (dataArray.length > 1 && dataArray.length <= 10) {
          renderCountriesListLayout(dataArray);
        } else {
                  // якщо <10 країн
          onFetchInfo();
        }
      })
          //onFetchError - Якщо користувач ввів назву країни, якої не існує, бекенд поверне не порожній масив,
          // а помилку зі статус кодом 404 - не знайдено. 
        
      .catch(onFetchError);
  }

  // Декструктирізація даних, які повертає БЕКЕНД => {name, flags} =>
// Підставляємо ${name} в розмітку

 // ------Якщо бекенд повернув від 2-х до 10-и країн, під тестовим полем відображається список знайдених країн.
      // Кожен елемент списку складається з прапора та назви країни. CountriesListLayout
function renderCountriesListLayout(arrayData) {
    const countriesListLayout = arrayData
      .map(({ name, flags }) => {
        return `
                  <li>
                      <img class="flags" src="${flags.svg}" alt="${name.official}" width="100" />
                      <h2 class="name text">${name.official}</h2>
                  </li>`;
      })
      .join('');
  
    countryList.innerHTML = countriesListLayout;
  }

  //Якщо країна 1 === 1 то запускається функція CountryCardLayout (Якщо результат запиту - це масив з однією країною, 
    //в інтерфейсі відображається розмітка картки з даними про країну: прапор, назва, столиця, населення і мови.)
  function renderCountryCardLayout(arrayData) {
    const countryCardLayout = arrayData
      .map(({ name, capital, flags, population, languages }) => {
        return `
                  <div class="card">
                      <div>
                          <img class="flags" src="${flags.svg}" alt="${name.official}" width="300" />
                          <h2 class="name">${name.official}</h2>
                      </div>
                      <p><span>Capital:</span> ${capital}</p>
                      <p><span>Population:</span> ${population}</p>
                      <p><span>Languages:</span> ${Object.values(
              languages
            )}</p>`;
      })
      .join('');
  
    countryCard.innerHTML = countryCardLayout;
  }

  // Якщо у відповіді бекенд повернув більше ніж 10 країн, в інтерфейсі з'являється 
      //повідомлення про те, що назва повинна бути специфічнішою. Для повідомлень використовуй 
      //бібліотеку notiflix і виводь такий рядок "Too many matches found. Please enter a more specific name.". 
      //запускається фунція CountriesListLayout
  // zкщо більше 10 країн
  function onFetchInfo() {
    Notify.info('Too many matches found. Please enter a more specific name.');
  }
  // sn case less 1 country or _ or wrong symbol
  function onFetchError() {
    Notify.failure('Oops, there is no country with that name');
  }
  //щоб очистити розмітку CountriesListLayout => виконуємо очищення, countryList.innerHTML = '' (clearUI())
  function clearUI() {
      countryList.innerHTML = '';
      countryCard.innerHTML = '';
  }