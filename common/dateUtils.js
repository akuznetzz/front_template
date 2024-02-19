// функции для работы с датами

export default {
  // Форматирует дату для сохранения на сервере YYYY-MM-DD
  formatDateForSave(date) {
    const formattedDate = new Date(date);
    let month = '' + (formattedDate.getMonth() + 1);
    let day = '' + formattedDate.getDate();
    const year = formattedDate.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  },

  // Формирует дату из datetime (YYYY-MM-DDThh:mm:ss±hh:mm) в формат DD.MM.YYYY
  dateParse: (date) => {
    return new Date(Date.parse(date.split('T')[0], 'DD.MM.YYYY'));
  },

  // Форматирует дату в формат DD.MM.YYYY из YYYY-MM-DD
  formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    const yyyy = date.getFullYear();

    return dd + '.' + mm + '.' + yyyy;
  },
};
