// option select dates
let allDates = [];
// filtered year and month starting values
let lastYear = 0;
let filteredMonth = 0;
let filterDatesBtnPressed = false;

let selectedStartDate = '';
let selectedEndDate = '';

// pagination start
let list = new Array();
let pageList = new Array();
let currentPage = 1;
let numberPerPage = 10;
let numberOfPages = 0;

// incomes
let averageIncome = 0;
let filteredIncome = 0;

function getNumberOfPages() {
    return Math.ceil(list.length / numberPerPage);
}

function nextPage() {
    currentPage += 1;
    loadList();
}

function previousPage() {
    currentPage -= 1;
    loadList();
}

function firstPage() {
    currentPage = 1;
    loadList();
}

function lastPage() {
    currentPage = numberOfPages;
    loadList();
}

function loadList() {
    document.querySelector('tbody').innerHTML = "";
    let begin = ((currentPage - 1) * numberPerPage);
    let end = begin + numberPerPage;
    pageList = list.slice(begin, end);
    drawList();
    check();
}

// load select with dates into options start
function startEndDate (collectedDates) {

    let startDateSelect = document.createElement('select');
    startDateSelect.setAttribute('class', 'start_date');

    let endDateSelect = document.createElement('select');
    endDateSelect.setAttribute('class', 'end_date')

    document.querySelector('body')
    .append(startDateSelect);
    document.querySelector('body')
    .append(endDateSelect);

    collectedDates.forEach(stringDate => {
        let startOption = document.createElement('option')
        let endOption = document.createElement('option');
        
        startOption.value = stringDate;
        startOption.text = stringDate;
        startDateSelect.appendChild(startOption);

        endOption.text = stringDate;
        endOption.value = stringDate;
        endDateSelect.appendChild(endOption);
    })

    let filterDateBtn = document.createElement('button');
    filterDateBtn.setAttribute('class', 'filter_date');
    filterDateBtn.append('Limit salaries by date')

    document.querySelector('body').append(filterDateBtn);

    // filterDateBtn.addEventListener('click', () => {
    //     // filterDatesBtnPressed = true;
    //     // toCompany();

    //     fetch('https://recruitment.hal.skygate.io/incomes/' + list[0].id)
    //         .then(res => {
    //             return res.json();
    //             }).then(incomeData => {
    //                 incomeData.incomes.forEach(income => { 
    //                     filterIncomesByDate(allDates, filteredIncome, parseFloat(income.value))
    //                     })
    //                     console.log(filteredIncome)
    //                 })
    // })
}

function filterIncomesByDate (dateFromApi, averageIncomeResult, income) {
    averageIncomeResult = 0;
    let selectedStartingDate = selectedStartDate.split('-');
    let selectedFinishDate = selectedEndDate.split('-');
    
    dateFromApi.forEach(dateString => {
        dateString = dateString.slice(0, 10).split('-');
        // console.log('selected year' + selectedStartingDate)
        if (parseInt(dateString[0]) >= parseInt(selectedStartingDate[0])
            && parseInt(dateString[1]) >= parseInt(selectedStartingDate[1])
            && parseInt(dateString[2]) >= parseInt(selectedStartingDate[2])
            && parseInt(dateString[0]) <= parseInt(selectedFinishDate[0])
            && parseInt(dateString[1]) <= parseInt(selectedFinishDate[1])
            && parseInt(dateString[2]) <= parseInt(selectedFinishDate[2])
            ) {
                averageIncomeResult += income;
        }
    })
    return averageIncomeResult
    // dateFromApi = dateFromApi.slice(0, 10).split('-');
}
// limit incomes by date end

function drawList() {
pageList.forEach(obj => {
    let tr = document.createElement('tr');
        addTd(tr, obj.id);
        addTd(tr, obj.name, 'selected_cn');
        addTd(tr, obj.city);
        fetch('https://recruitment.hal.skygate.io/incomes/' + obj.id)
        .then(incomeRes => {
        return incomeRes.json();
        })
        .then(incomeData => {
            incomeSum = 0;
            incomeData.incomes.forEach(incomeObj => {
                incomeSum += parseFloat(incomeObj.value);
            })
            addTd(tr, incomeSum.toFixed(2), 'income_sum');
            if (document.querySelector('.average')) {
                addTd(tr, list[0].average_income.toFixed(2), 'average_income')
                addTd(tr, list[0].last_month_salary.toFixed(2))
            }
        })
        
        document.querySelector('tbody').append(tr);
    })
}

function check() {
    document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
    document.getElementById("previous").disabled = currentPage == 1 ? true : false;
    document.getElementById("first").disabled = currentPage == 1 ? true : false;
    document.getElementById("last").disabled = currentPage == numberOfPages ? true : false;
}

document.getElementById('my-select').addEventListener('change', function() {
    numberPerPage = parseInt(this.value)
    loadList();
  });
// end of pagination

// add td functions
function addTd(tr, tdValue, className = '') {
    let td = document.createElement('td');
    td.setAttribute('class', className)
    td.append(tdValue);
    tr.append(td);
  }

function addTh(thValue) {
    let th = document.createElement('th');
    th.setAttribute('class', 'average');
    th.append(thValue);
    document.querySelector('thead tr').append(th);
}
//  end of add td functions

// to company function
function toCompany () {
    document.querySelectorAll('.selected_cn')
        .forEach(companyNameTd => {
            companyNameTd.addEventListener('click', () => {
                document.querySelector('tbody').innerHTML = '';
                fetch('https://recruitment.hal.skygate.io/companies')
                .then(res => {
                return res.json();
                    }).then(data => {
                        list = [];
                        data.forEach(obj => {
                            if (obj.name === companyNameTd.innerHTML) {
                                list.push(obj);
                            }
                        })
                        fetch('https://recruitment.hal.skygate.io/incomes/' + list[0].id)
                        .then(res => {
                        return res.json();
                            }).then(incomeData => {
                                let dateYear = [];
                                incomeData.incomes.forEach(income => {
                                        averageIncome += parseFloat(income.value);

                                        // data for option values
                                        if(!allDates.includes(income.date.slice(0, 10))) {
                                            allDates.push(income.date.slice(0, 10))
                                        }


                                    let strYear = income.date.slice(0, 10).split('-');
                                    dateYear.push(parseInt(strYear[0]));

                                })
                                // filter by Year
                                lastYear = Math.max(...dateYear);
                                let filteredByYear = [];
                                incomeData.incomes.forEach(income => {
                                    if (income.date.includes(lastYear)) {
                                        filteredByYear.push(income.date);
                                    }
                                })

                                // after filter by year done filter by month
                                let dateMonth = [];
                                filteredByYear.forEach(date => {
                                    let strMonth = date.slice(0, 10).split('-');
                                    dateMonth.push(strMonth[1]);
                                })
                                lastMonth = Math.max(...dateMonth);
                                if (lastMonth < 10) { lastMonth = '0' + lastMonth}
                                dateMonth.forEach(month => {
                                    if (month.includes(lastMonth)) {
                                        filteredMonth = month;
                                    }
                                })

                                let lastDate = lastYear + '-' + filteredMonth;

                                // from generated date find last month salary
                                let lastMonthSalary = 0;
                                incomeData.incomes.forEach(obj => {
                                    if(obj.date.includes(lastDate)) {
                                        lastMonthSalary += parseFloat(obj.value);
                                    }
                                })
                                averageIncome = averageIncome / incomeData.incomes.length;
                                if (filterDatesBtnPressed === false) {
                                    addTh('average income');
                                    addTh('last month income');
                                }
                                list[0].average_income = averageIncome;
                                list[0].last_month_salary = lastMonthSalary;

                                    startEndDate(allDates);
                                        // event for selects and button
                                    document.querySelector('.start_date').addEventListener('change', e => {
                                        selectedStartDate = e.target.value;
                                    });

                                    document.querySelector('.end_date').addEventListener('change', e => {
                                        selectedEndDate = e.target.value;
                                    });
                                    document.querySelector('.filter_date').addEventListener('click', () => {
                                        fetch('https://recruitment.hal.skygate.io/incomes/' + list[0].id)
                                            .then(res => {
                                                return res.json();
                                                }).then(incomeData => {
                                                    let dateChangeResult = 0
                                                    incomeData.incomes.forEach(income => { 
                                                        dateChangeResult = filterIncomesByDate(allDates, filteredIncome, parseFloat(income.value));
                                                        })
                                                        document.querySelector('.income_sum').innerHTML = dateChangeResult.toFixed(2);
                                                        document.querySelector('.average_income').innerHTML = (dateChangeResult / incomeData.incomes.length).toFixed(2)
                                                    })
                                    })
                            })

                        numberOfPages = getNumberOfPages();
                        setTimeout(() =>{ firstPage();
                            // document.querySelector('.filter_date').addEventListener('click', () => {
                            //     // filterDatesBtnPressed = true;
                            //     // toCompany();
                        
                            //     fetch('https://recruitment.hal.skygate.io/incomes/' + list[0].id)
                            //         .then(res => {
                            //             return res.json();
                            //             }).then(incomeData => {
                            //                 incomeData.incomes.forEach(income => { 
                            //                     filterIncomesByDate(allDates, filteredIncome, parseFloat(income.value))
                            //                     })
                            //                     console.log(filteredIncome)
                            //                 })
                            // })
                                          400});
                        console.log(list)
                    })
            })
        })
}
async function loadData () {
fetch('https://recruitment.hal.skygate.io/companies')
    .then(async res => {
    return await res.json();
        }).then(async data => {
            list = await data;
            numberOfPages = getNumberOfPages();
        })
        .then(() => {
            list.forEach(obj => {
                let incomeSum = 0;
                fetch('https://recruitment.hal.skygate.io/incomes/' + obj.id)
                .then(async incomeRes => {
                return await incomeRes.json();
                })
                .then(incomeData => {
                    incomeData.incomes.forEach(incomeObj => {
                            incomeSum += parseFloat(incomeObj.value);
                    })
                    if (obj.id === incomeData.id) {
                        let afterFloat = incomeSum.toFixed(2);
                        obj.income_sum = parseFloat(afterFloat)
                    }
                })
            })
        })
        .then(() => {
            let h2 = document.createElement('h2');
            h2.append('Loading...');
            document.body.append(h2);

            setTimeout(() =>{list = list.sort((a, b) => b.income_sum - a.income_sum) }, 4000);
            setTimeout(() =>{firstPage(); document.querySelector('h2').remove();
                            document.querySelector('main').style.display = 'block';
                            toCompany()
                            }, 4500);

            document.querySelector('.company_name')
                .addEventListener('change', event => {
                    setTimeout(() =>{list = list.filter(obj => obj.name.match(event.target.value) )}, 4000)
                    setTimeout(() =>{ firstPage()
                                     }, 5000)
                })
        })
}

async function load() {
    await loadData();
    await loadList();
}

window.onload = load;
