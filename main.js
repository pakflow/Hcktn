let currentPage = 1
let inpFullName = $('#inp-full-name')
let inpPhone = $('#inp-phone')
let btnSaveCard = $('.btn-save-card')
let API = "http://localhost:8000/kpi?_page=1&_limit=3"
let SECOND_API = "http://localhost:8000/kpi"
let modal = $('.modal')


//Тут мы отсчитываем сколько круглых недель прошло с начала курсов, столько и KPI у нас будет

let beginOfCourses = 2021 * 365 + 10 * 30 + 4//начало курсов в днях (4 октября 2021)
let today = new Date();
let dd = parseInt(String(today.getDate()).padStart(2, '0'));
let mm = parseInt(String(today.getMonth() + 1).padStart(2, '0'));
let yyyy = today.getFullYear();
let todayCountDays = yyyy * 365 + mm * 30 + dd//сегодняшняя дата в днях

let divKpi = $('.div-kpi')
let countOwWeeks = Math.ceil((todayCountDays - beginOfCourses) / 7) //сколько недель прошло ровно!

//Create

//Добавляем столько input'ов сколько недель прошло в CREATE
for (let i = 0; i < countOwWeeks; i++) {
    divKpi.append(`<span>Week-${i + 1}</span><input type="email" id="inp-kpi-${i}" placeholder="Введите KPI"><br>`)
}

async function addCard() {

    let fullName = inpFullName.val()
    let phone = inpPhone.val()
    let kpiArray = []
    for (let i = 0; i < countOwWeeks; i++) {
        if ($(`#inp-kpi-${i}`).val() === "") {
            $(`#inp-kpi-${i}`).val(0)
        }
        kpiArray.push($(`#inp-kpi-${i}`).val())
    }
    let kpi = {
        fullName,
        phone,
        kpiArray,
    }
    try {
        const response = await axios.post(API, kpi);
        modal.modal("hide")//убираем модалку
        render(`http://localhost:8000/kpi?_page=${currentPage}&_limit=3`)//обновляем страничку после добавления
    } catch (e) {
        console.log(e.statusText)
    }

}
btnSaveCard.on('click', addCard)//кнопка добавления карточки

let divCards = $('.div-cards')
let btnPrev = $('.prev')
let btnNext = $('.next')
//Обновление страницы
async function render(url) {

    try {
        const response = await axios(url)

        //каждый раз сначала очищаем div с картами
        divCards.html("")
        //добавляем столько карт, сколько объектов у нас в local


        let sumOfKpi = []
        response.data.forEach((item, index) => {
            let tempKpi = 0
            divCards.append(`
            <div class="card" style="width: 22rem;">
                <div class="card-body">
                    <h5 class="card-title my-card">${item.fullName}</h5>
                    <p class="card-text my-card-info">${item.phone}</p>
                    <table class="table table-striped my-table">
                        <thead>
                            <tr>
                                <th scope="col">Week</th>
                                <th scope="col">KPI</th>
                            </tr>
                        </thead>
                        <tbody class="my-tbody" id="tbody-${item.id}">
                            
                        </tbody>
                        <tfoot class="table-danger">
                            <tr><td>AVG</td><td id="tfoot-${index}"></td></tr>
                        </tfoot>
                    </table>
                    <button id="${item.id}" type="button" class="btn btn-success edit-btn" data-bs-toggle="modal"
                                data-bs-target="#editModal">
                                Изменить карточку студента
                    </button>
                </div>
            </div>`)


            for (let i = 0; i < countOwWeeks; i++) {
                $(`#tbody-${item.id}`).append(`<tr><td>${i + 1}</td><td>${item.kpiArray[i] || 0}</td></tr>`)
                tempKpi += parseInt(`${item.kpiArray[i] || 0}`)
            }
            sumOfKpi.push(tempKpi)
        });

        for (let i = 0; i < response.data.length; i++) {
            $(`#tfoot-${i}`).append((sumOfKpi[i] / countOwWeeks).toFixed(2))
        }




        //Pagination
        let links = response.headers.link.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim)

        if (!links) {//если links у нас null то дизейблим кнопки
            btnPrev.attr('disabled', "true")
            btnNext.attr('disabled', "true")
            return
        }
        if (links[0] === links[1]) {
            btnPrev.removeAttr('disabled')
        }
        if (links[1] === links[2]) {
            btnNext.removeAttr('disabled')
        }
        if (links.length === 4) {
            btnPrev.attr('id', links[1])
            btnNext.attr('id', links[2])
            btnPrev.removeAttr('disabled')
            btnNext.removeAttr('disabled')
        }
        else if (links.length === 3 && currentPage === 1) {
            btnPrev.attr('disabled', "true")
            btnNext.attr('id', links[1])
        } else if (links.length === 3 && currentPage !== 1) {
            btnNext.attr('disabled', "true")
            btnPrev.attr('id', links[1])
        }


    } catch (e) {
        console.log(e)
    }
}
//Первый показ страницы
render(API)

//кнопки пагинации
btnPrev.on('click', function (e) {
    let url = e.target.id
    render(url)
    currentPage--
    // console.log(currentPage)
})
btnNext.on('click', function (e) {
    let url = e.target.id
    render(url)
    currentPage++
    // console.log(currentPage)
})


//Чтобы в input phone допускались только цифры
inpPhone.on('input', function () {
    if (/\D/g.test(this.value)) {
        this.value = this.value.replace(/\D/g, '')
    }
})


// Search
let searchInp = $('.inp-search')
searchInp.on('input', (e) => {
    let value = e.target.value
    let url = `${API}&q=${value}`
    // console.log(url)
    render(url)
})

// Update

let inpFullNameEdit = $('#inp-full-name-edit')
let inpPhoneEdit = $('#inp-phone-edit')
let inpKpiEdit = []
let btnSaveCardEdit = $('.btn-save-card-edit')
let divKpiEdit = $('.div-kpi-edit')
for (let i = 0; i < countOwWeeks; i++) {
    divKpiEdit.append(`<span>Week-${i + 1}</span><input type="email" id="inp-kpi-edit-${i}" placeholder="Введите KPI"><br>`)
}

for (let i = 0; i < countOwWeeks; i++) {
    inpKpiEdit.push($(`#inp-kpi-edit-${i}`))
}
//чтобы отловить именно ту кнопку на которую нажали
$(document).on('click', '.edit-btn', async (e) => {
    let id = e.target.id
    try {
        const response = await axios(`${SECOND_API}/${id}`)
        inpFullNameEdit.val(response.data.fullName)
        inpPhoneEdit.val(response.data.phone)

        for (let i = 0; i < countOwWeeks; i++) {
            inpKpiEdit[i].val(response.data.kpiArray[i])
            // $(`#inp-kpi-${i}`).val('qwe')
        }
        btnSaveCardEdit.attr('id', id)
        btnCardDelete.attr('id', id)
    } catch (e) {
        console.log(e)
    }
})

//кнопка сохранения изменения
btnSaveCardEdit.on('click', async (e) => {
    let id = e.target.id
    let fullName = inpFullNameEdit.val()
    let phone = inpPhoneEdit.val()
    let kpiArray = []
    for (let i = 0; i < countOwWeeks; i++) {
        if ($(`#inp-kpi-edit-${i}`).val() === "") {
            $(`#inp-kpi-edit-${i}`).val(0)
        }
        kpiArray.push($(`#inp-kpi-edit-${i}`).val())
    }
    let kpi = {
        fullName,
        phone,
        kpiArray,
    }
    try {
        await axios.patch(`${SECOND_API}/${id}`, kpi)
        modal.modal('hide')
        render(`http://localhost:8000/kpi?_page=${currentPage}&_limit=3`)
    } catch (e) {
        console.log(e)
    }
})

//Delete

let btnCardDelete = $('.btn-delete')
btnCardDelete.on('click', async (e) => {
    let id = e.target.id
    // console.log(e)
    try {
        await axios.delete(`${SECOND_API}/${id}`)
        let response = await axios(`${SECOND_API}`)
        modal.modal('hide')
        if (response.data.length % 3 === 0) {
            currentPage--
        }
        render(`http://localhost:8000/kpi?_page=${currentPage}&_limit=3`)
    } catch (e) {
        console.log(e)
    }
})