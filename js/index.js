
// https://www.thatsoftwaredude.com/content/6125/how-to-paginate-through-a-collection-in-javascript
// http://jsfiddle.net/zscQy/446/
// https://github.com/Oscar-Sherelis/tswork
// http://jsfiddle.net/zscQy/446/

// pagination start
let list = new Array();
let pageList = new Array();
let currentPage = 1;
let numberPerPage = 10;
let numberOfPages = 0;

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

function drawList() {
pageList.forEach(obj => {
    let tr = document.createElement('tr');
        addTd(tr, obj.id);
        addNameTd(tr, obj.name);
        addTd(tr, obj.city);
        fetch('https://recruitment.hal.skygate.io/incomes/' + obj.id)
        .then(incomeRes => {
        return incomeRes.json();
        })
        .then(incomeData => {
            let incomeSum = 0;
            let result = incomeData.incomes;
            // result = result.sort((a, b) => b.date - a.date)
            result.sort(function(a, b) {
                var distancea = Math.abs(a.date);
                var distanceb = Math.abs(b.date);
                return distancea - distanceb; // sort a before b when the distance is smaller
            });
            console.log('Data' + result[0].date)
            // find date, by this date find incomes and sum them
            incomeData.incomes.forEach(incomeObj => {
                incomeSum += parseFloat(incomeObj.value);
                // console.log(incomeObj.date)
            })
            addTd(tr, incomeSum.toFixed(2));
            if (document.querySelector('.average')) {
                addTd(tr, list[0].average_income.toFixed(2))
                addTd(tr, list[0].last_month_salary.toFixed(2))
                // here add last month
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
function addTd(tr, tdValue) {
    let td = document.createElement('td');
    td.append(tdValue);
    tr.append(td);
  }

function addNameTd(tr, tdValue) {
    let td = document.createElement('td');
    td.setAttribute('class', 'selected_cn')
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
                                let averageIncome = 0;
                                let dateYear = [];
                                let dateMonth = [];
                                incomeData.incomes.forEach(income => {
                                    averageIncome += parseFloat(income.value);
                                    let strDate = income.date.slice(0, 10).split('-');
                                    dateYear.push(parseInt(strDate[0]));
                                    dateMonth.push(parseInt(strDate[1]));
                                })
                                let maxYear = Math.max(...dateYear);
                                let maxMonth = Math.max(...dateMonth);
                                if (maxMonth < 10) { maxMonth = '0' + maxMonth}
                                let lastMonth = maxYear + '-' + maxMonth;

                                let lastMonthSalary = 0;
                                incomeData.incomes.forEach(obj => {
                                    console.log(obj.date)
                                    if(obj.date.includes(toString(lastMonth))) {
                                        lastMonthSalary += parseFloat(obj.value)
                                    }
                                })
                                console.log(lastMonth)
                                averageIncome = averageIncome / incomeData.incomes.length;
                                addTh('average income');
                                addTh('last month income');
                                list[0].average_income = averageIncome;
                                list[0].last_month_salary = lastMonthSalary;
                            })

                        numberOfPages = getNumberOfPages();
                        setTimeout(() =>{ firstPage(), 400});
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
