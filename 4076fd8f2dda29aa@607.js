// https://observablehq.com/@mishgen/comics-tree@607
import define1 from "./a2e58f97fd5e8d7c@736.js";
import define2 from "./8d271c22db968ab0@160.js";

function _1(md){return(
md`# Comics-tree

Отображает связи между комиксами/событиями/героями/сериями/историями/создателями (далее элемент) с сайта [marvel.com](https://www.marvel.com) по [API](https://developer.marvel.com)

Входные параметры взяты из [схемы](https://gateway.marvel.com/docs/public), ввод и поиск **только на Английском**.

Если вы знаете точное название элемента, заполняем name/title (<u>регистрозависимы</u>), иначе **nameStartsWith**/**titleStartsWith** (по начальному куску слова). Остальные параметры заполняются по желанию. Если элемент stories, то придётся вводить ID, допустим в поле event вводим 29.

Элементы отображаются в виде дерева. Дерево можно перетаскивать и менять его размер (**пока только в Chrome**).
Иконки элементов можно менять в arrEmoji.

Подтягивание картинок на четвёртом уровне работает только после выбора элемента.

Кнопка ◀ делает элемент основным и перезагружает дерево.

**publicKey** и **privateKey** берутся со страницы [My Developer Account](https://developer.marvel.com/account)

[Демо сайт](https://xn--c1aehpi7d.xn--p1ai/comics-tree/), [Код на observablehq](https://observablehq.com/@mishgen/comics-tree), [github](https://github.com/amputator84/comics-tree)
`
)}

function _selHtmlNew(Select,arrModelGroup){return(
Select(arrModelGroup,{label:'Выбери элемент'})
)}

function _inputsNew(html,d3,arrModel,selHtmlNew,form)
{
  var arr = [html `Выбери параметр:<br/>`]
  var regex = /\/v1\/public\//
  var valueDefault = ''
  d3.map(arrModel.apis, function(d) {
    var type = d.path.replace(regex, '')
    if (type.indexOf('/') == -1) {
      if (selHtmlNew[0].path.replace(regex, '') == type) {
        var param = d.operations[0].parameters
        for (var key in param) {
          // Значение по умолчанию для наглядного примера. Если не нужен, закомментировать.
          //if (param[key].name == 'nameStartsWith' && type == 'characters') valueDefault = 'Guardians of the'
          //else valueDefault = ''
          arr.push(html `<input type="edit" name="${param[key].name}" class="changeArray2" placeholder="${param[key].name}" value="${valueDefault}"/>`)
        }
      }
    } else {
      return false
    }
    return arr
  })
  return form(html`<form>${arr}</form>`)
}


function _4($0,dataScheme,dataSchemeDemo,arrAll,$1,api,d3,$2,DOM,url,publicKey,privateKey,arrEmoji)
{
    var uncVar = ''
    var schVar = ''
    $0.value = ''
    var txt = ''
    // getInpEx Количество заполненных полей ввода
    // dataScheme Загруженная схема
    // dataSchemeDemo Демо схема
    var getInpEx = Array.prototype.slice.call(document.querySelectorAll('.changeArray2')).filter(e => e.value != '').length
    if (dataScheme.uncover && getInpEx == 0) {
        uncVar = dataScheme.uncover
        schVar = dataScheme.scheme
        txt = 'Загруженная схема'
    } else {
        uncVar = dataSchemeDemo.uncover
        schVar = dataSchemeDemo.scheme
        txt = 'Демка'
    }
    if (!dataScheme.uncover && !dataSchemeDemo.uncover) $0.value = 'Что-то не так с схемами'

    const jsonAll = uncVar

    // Генерация выпадашки с сортировкой
    function selOrderBy(d) {
        if (arrAll().indexOf(d.data.name) == -1) return
        var selected = ''
        var arr = []
        var arr2 = arrAll(d.data.name, 1)
        for (var i = 0; i < arr2.length; i++) {
            if (arr2[i] == d.data.orderBy) selected = 'selected'
            else selected = ''
            arr.push(`<option value="${arr2[i]}" ${selected}>${arr2[i]}</option>`)
        }
        return arr
    }

    //Генерация выпадашки с страницами
    function selOffset(d) {
        var arr = []
        var begin = d.data.offset
        var end = d.data.available
        var j = 0
        var selected = ''
        for (var i = 0; i < end; i = i + 20) {
            if (i - end < 20 && i - end > 0) j = end
            else j = parseInt(i + 20)
            if (i == begin) selected = 'selected'
            else selected = ''
            arr.push(`<option value="${i}" ${selected}>${i} - ${j}</option>`)
        }
        return arr
    }

    // Клик на элемент + повторная загрузка дерева
    function click(event, d, type) {
        $1.value = jsonAll
        // Клик на надпись - перерисовка дерева
        if (type == 'text') {
            if (d._children == undefined) {
                addDelJsonArr(d)
                var link = (d.data.resourceURI) ? d.data.resourceURI : d.data.id
                var urlUpd = link.replace('http', 'https') + '?limit=20&' + api
                d3.json(urlUpd)
                    .then(function(j) {
                        d.data.children = setTypes(j).children
                        d.children = null
                        d._children = [] //пустой, потому что мы не знаем координаты
                        if (j.data.results[0].thumbnail != undefined) {
                            d.data.img = j.data.results[0].thumbnail.path + '.' + j.data.results[0].thumbnail.extension
                        } else {
                            d.data.img = ''
                        }
                        var parData = getParent(d).data
                        root = d3.hierarchy(parData)
                        root.x0 = height / 2
                        root.y0 = 40
                        root.children.forEach(function(d) {
                            collapse2(d)
                        })
                        $2.value = parData
                        update(root)
                    })
            } else {
                d.children = d.children ? null : d._children
                update(d)
                addDelJsonArr(d, 1)
                $2.value = getParent(d).data
            }
        }
        // Клик на стрелочку влево
        if (type == 'left') {
            var link = ''
            link = d.data.resourceURI
            var urlUpd = link.replace('http', 'https') + '?limit=20&' + api
            d3.json(urlUpd)
                .then(function(j) {
                    root = d3.hierarchy(setTypes(j), function(d) {
                        return d.children
                    })
                    root.x0 = height / 2
                    root.y0 = 40
                    root.children.forEach(collapse)
                    $2.value = root.data
                    update(root)
                })
        }
        // Клик на пагинацию или сортировку
        if (type == 'offset' || type == 'orderBy') {
            var orderBy = arrAll(d.data.name)[0]
            var offset = 0
            if (type == 'offset') {
                offset = event.target.value
                if (d.data.orderBy != undefined) orderBy = d.data.orderBy
            } else {
                orderBy = event.target.value
                if (d.data.offset != undefined) offset = d.data.offset
            }
            addDelJsonArr(d)
            var link = d.data.resourceURI
            var urlUpd = link.replace('http', 'https') + '?limit=20&offset=' + offset + '&orderBy=' + orderBy + '&' + api
            d3.json(urlUpd)
                .then(function(j) {
                    d.data.children = setTypes(j).children
                    d.children = null
                    d._children = [] //пустой, потому что мы не знаем координаты
                    if (j.data.results[0].thumbnail != undefined) {
                        d.data.img = j.data.results[0].thumbnail.path + '.' + j.data.results[0].thumbnail.extension
                    }
                    // Прокидываем кликнутые параметры в изменённое дерево, чтоб hierarchy не затёр
                    d.data.offset = offset
                    d.data.orderBy = orderBy
                    var parData = getParent(d).data
                    root = d3.hierarchy(parData)
                    root.x0 = height / 2
                    root.y0 = 40
                    root.children.forEach(function(d) {
                        collapse2(d)
                    })
                    $2.value = parData
                    update(root)
                })
        }
    }

    // Получение родителя через замыкание
    function getParent(d) {
        if (d.parent != null) d = getParent(d.parent)
        return d
    }

    // Схлопнуть через замыкание
    function collapse2(dd) {
        if (dd.children) {
            dd._children = dd.children
            dd.children.forEach(function(d) {
                collapse2(d)
            })
            var nam = dd.data.name
            if (arrAll().indexOf(dd.data.name) != -1) nam = dd.data.name + dd.parent.data.name
            if (jsonAll.map(d => d.name).indexOf(nam) == -1) {
                dd.children = null
            } else {
                dd.offset = jsonAll.filter(d => d.name == nam)[0].offset || 0
            }
        }
    }

    // Добавление разкрытых связей в массив для отрисовки перезагруженного дерева. Добавление атрибутов напрямую в JSON не получается, потому что JSON каждый раз заново собирается
    function addDelJsonArr(d, del = 0) {
        var nam = d.data.name
        if (arrAll().indexOf(d.data.name) != -1) nam = d.data.name + d.parent.data.name
        if (del == 1 && d.children == null) {
            // Удаление
            jsonAll.map(function(dd, i) {
                if (dd.name == nam) jsonAll.splice(i, 1)
            })
        } else {
            jsonAll.push({
                'name': nam,
                'offset': d.data.offset
            })
        }
    }

    // Добавление нод для элементов, так как по умолчанию их нет в дереве
    function setTypes(j) {
        var d = j.data.results
        if (d.length > 1) {
            var newD2 = {
                "name": j.etag,
                "children": []
            }
            d.forEach(function(di) {
                var n = ''
                var dd = []
                if (di.title != undefined) n = di.title
                else n = di.name
                var types = ['comics', 'events', 'characters', 'series', 'stories', 'creators']
                types.forEach(function(e) {
                    if (di[e] != undefined) {
                        if (di[e].available > 0) dd.push({
                            "name": e,
                            "children": di[e].items,
                            "available": di[e].available,
                            "resourceURI": di.resourceURI + '/' + e
                        })
                    }
                })
                var img = (di.thumbnail != undefined) ? di.thumbnail.path + '.' + di.thumbnail.extension : ''
                newD2.children.push({
                    "name": n,
                    "children": dd,
                    "img": img,
                    "resourceURI": di.resourceURI
                })
            })
        }
        if (d.length == 1) {
            d = d[0]
            var n = ''
            if (d.title != undefined) n = d.title
            else n = d.name
            var dd = []
            var types = ['comics', 'events', 'characters', 'series', 'stories', 'creators']
            types.forEach(function(e) {
                if (d[e] != undefined) {
                    if (d[e].available > 0) dd.push({
                        "name": e,
                        "children": d[e].items,
                        "available": d[e].available,
                        "resourceURI": d.resourceURI + '/' + e
                    })
                }
            })
            var img = (d.thumbnail != undefined) ? d.thumbnail.path + '.' + d.thumbnail.extension : ''
            var newD2 = {
                "name": n,
                "children": dd,
                "img": img,
                "resourceURI": d.resourceURI
            }
        }
        return newD2
    }
    // Рисуем SVG область
    var svg = d3.select(DOM.svg(width, 200))
        .attr('style', 'border: 1px solid green')
        .attr('id', 'svg')

    // Размер окна + отступы
    var margin = {
            top: 20,
            right: 90,
            bottom: 30,
            left: 90
        },
        width = 1100 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var s = svg.attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
    var g = s.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Zoom
    svg.call(d3.zoom().on("zoom", ({
        transform
    }) => g.attr("transform", transform)))

    var i = 0,
        duration = 500, // Скорость разворота связей
        root
    var treemap = d3.tree().size([height, width]);

    // Тянем схему с загруженного файла или демки, иначе с url если заполнен хоть один параметр
    if (schVar && getInpEx == 0) {
        root = d3.hierarchy(schVar)
        root.x0 = height / 2
        root.y0 = 40
        root.children.forEach(collapse2)
        update(root, txt)
    } else {
        d3.json(url)
            .then(function(j) {
                if (j.data.results.length == 0) return false
                root = d3.hierarchy(setTypes(j), function(d) {
                    return d.children
                })
                root.x0 = height / 2
                root.y0 = 40
                root.children.forEach(collapse)
                update(root, 'Динамика')
            })
            .catch(function(error) {
                $0.value = error
                root = d3.hierarchy(schVar)
                root.x0 = height / 2
                root.y0 = 40
                root.children.forEach(collapse2)
                if (publicKey == '') txt = txt + ' publicKey пуст'
                if (privateKey == '') txt = txt + ' privateKey пуст'
                update(root, txt)
            })
    }

    function collapse(d) {
        if (d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }

    // Отрисовка дерева, добавление нод(точек) и связей(линий).
    // Также пагинация, сортировка, ◀
    function update(source, txt = '') {
        var treeData = treemap(root)
        var nodes = treeData.descendants()
        var links = treeData.descendants().slice(1)
        nodes.forEach(function(d) {
            d.y = d.depth * 150 // Длина между связями. depth = уровень столбца слева направо
        })

        g.append('text')
            .attr("x", "10")
            .attr("y", "10")
            .text(txt)

        var node = g.selectAll('g.node')
            .data(nodes, function(d) {
                d.trueName = 'node'
                return d.id || (d.id = ++i);
            });

        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")"
            })

        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return arrAll().indexOf(d.data.name) != -1 ? 0 : 15
            })
            .style("font-size", function(d) {
                if (arrAll().indexOf(d.data.name) != -1) {
                    return "20px"
                }
            })
            .attr("text-anchor", function(d) {
                return "start"
            })
            .text(function(d) {
                var ret = d.data.name
                if (arrAll().indexOf(d.data.name) != -1) {
                    ret = arrEmoji[arrAll().findIndex(e => e == d.data.name)] //+d.offset //arrEmoji[d.data.name]
                }
                return ret
            })
            .style('cursor', 'pointer')
            .on('click', (e, d) => click(e, d, 'text'))

        nodeEnter.append('text')
            .attr('x', -40)
            .attr('y', 8)
            .text('◀')
            .style('cursor', 'pointer')
            .style('font-size', '20px')
            .on('click', (e, d) => click(e, d, 'left'))

        /* offset */
        nodeEnter.append('foreignObject')
            .attr('width', '40')
            .attr('height', '100')
            .attr('x', -20)
            .attr('y', 10)
            .append("xhtml:select")
            .html(function(d) {
                return `${selOffset(d)}`
            })
            .style('display', (d) => {
                if (arrAll().indexOf(d.data.name) == -1 || d.data.available < 21) {
                    return 'none'
                }
            })
            .on("change", (e, d) => click(e, d, 'offset'))

        /* orderBy */
        nodeEnter.append('foreignObject')
            .attr('width', '30')
            .attr('height', '100')
            .attr('x', -60)
            .attr('y', 10)
            .append("xhtml:select")
            .html(function(d) {
                return `${selOrderBy(d)}`
            })
            .style('display', (d) => {
                if (arrAll().indexOf(d.data.name) == -1) {
                    return 'none'
                }
            })
            .on("change", (e, d) => click(e, d, 'orderBy'))

        var nodeUpdate = nodeEnter.merge(node)

        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Картинка
        nodeUpdate.append("svg:image")
            .attr("xlink:href", function(d) {
                return d.data.img
            })
            .attr("x", function(d) {
                return -25;
            })
            .attr("y", function(d) {
                return -25;
            })
            .attr("height", 40)
            .attr("width", 30);

        // удаление элементов после сворачивания
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // Связи
        var link = g.selectAll('path.link')
            .data(links, function(d) {
                return d.id;
            });

        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                }
                return diagonal(o, o)
            });

        var linkUpdate = linkEnter.merge(link);

        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d) {
                return diagonal(d, d.parent)
            });

        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                }
                return diagonal(o, o)
            })
            .remove();

        // Все линии выходят из одной точки
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function diagonal(s, d) {
            var path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`
            return path
        }
    }

    //Возвращаем ноды в SVG
    return svg.node();
}


function _5(md){return(
md`**err** - Показывает ошибки соединения с marvel.`
)}

function _err(){return(
''
)}

function _7(md){return(
md`**Скачать схему на комп** - скачивает схему связей в файл _scheme.json_. Формат _JSON_, состоит из двух частей:
_scheme_ - все доступные надписи и картинки
_uncover_ - открытые связи. Если нажали на иконку, формат ключа = ЭЛЕМЕНТ+ИМЯ, например _comicsNova_`
)}

function _8(DOM,downloadJson,uncover){return(
DOM.download(new Blob([JSON.stringify({'scheme': downloadJson,'uncover': uncover})], {type: "application/json"}), 'scheme.json', "Скачать схему на комп")
)}

function _9(md){return(
md`**Загрузить схему с компа** - загружает JSON схему с компьютера сюда`
)}

function _inputFile2(html){return(
html`<input type="button" value="Загрузить схему с компа" onclick="document.getElementById('getFile').click()" />`
)}

function _11(md){return(
md`**publicKey** - регистририруемся в [marvel.com](https://www.marvel.com/), переходим в [My Developer Account](https://developer.marvel.com/account), копируем "Your public key" в поле **publicKey**.

**privateKey** - по аналогии с **publicKey** берём из "Your private key".`
)}

function _publicKey(Text,html){return(
Text({label: html`<b>publicKey</b>`, placeholder: "Введи publicKey", value: ""})
)}

function _privateKey(Text,html){return(
Text({label: html`<b>privateKey</b>`, placeholder: "Введи privateKey", value:""})
)}

function _14(md){return(
md`**dataSchemeDemo** - Демо схема из прикреплённого файла. Отображается, когда нет данных из сети или пустые поля поиска. Без заполненных privateKey и publicKey не работают новые связи.`
)}

function _dataSchemeDemo(FileAttachment){return(
FileAttachment("scheme@2.json").json()
)}

function _16(md){return(
md`**downloadJson** - Схема отображаемого дерева, подтянутая из сети со всеми связями. Начинается с самого первого (левого) элемента. Так как mutable, обновляется динамически. Для кнопки "Скачать схему на комп".`
)}

function _downloadJson(){return(
''
)}

function _18(md){return(
md`**arrModel** - распарсенная модель API с [gateway.marvel.com/docs/public](https://gateway.marvel.com/docs/public) для работы с параметрами. Мог сделать статику, но параметры иногда меняются, так что оставил динамику.`
)}

function _arrModel(d3){return(
d3.json('https://gateway.marvel.com/docs/public')
             .then(function(j) { return j})
)}

function _20(md){return(
md`**arrModelGroup** - Сгруппированная **arrModel** для выпадашки с элементами.`
)}

function _arrModelGroup(d3,arrModel){return(
d3.group(arrModel.apis, d => d.path.replace(/\/v1\/public\//, '').replace(/\/{.*/, ''))
)}

function _22(md){return(
md`**arrAll** - Список из **arrModel** для **orderBy**`
)}

function _arrAll(d3,arrModel){return(
function arrAll(type='') {
  var arr = d3.map(arrModel.apis,e=>e)
  var arr2 = new Array()
  var t = ''
  var t2 = ''
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].path.indexOf('{') == -1) {
      t2 = arr[i].path.replace(/\/v1\/public\//, '')
      if (type == t2) {
        t = arr[i].operations[0].parameters
      } else {
        arr2.push(t2)
      }
    }
  }
  if (type != '') {
    return t.filter(d=>d.name=='orderBy')[0].allowableValues.values
  } else return arr2
}
)}

function _24(md){return(
md`**arrEmoji** - Иконки Emoji (не картинкой) для элементов _characters/comics/creators/events/series/stories_. Можно вставлять свои, но не все иконки кроссбраузерны.`
)}

function _arrEmoji(){return(
new Array('🦸‍♂️', '🗯️', '🧙', '🗺️', '🍿', '📚')
)}

function _26(md){return(
md`**dataScheme** - Загруженная схема по кнопке "Загрузить схему с компа"`
)}

function _dataScheme(){return(
''
)}

function _28(md){return(
md`**uncover** - Открытые связи, собирающиеся динамически для кнопки "Скачать схему на комп".`
)}

function _uncover(){return(
''
)}

function _30(md){return(
md`**readFile** - Скрытая функция чтения файла для скрытой кнопки "inputFile", которая вызывается с кнопки "Загрузить схему с компа".`
)}

function _31($0)
{
  function readFile(event){
     const inputElement = event.target;
     const inputFile = inputElement.files[0];
     var reader = new FileReader();
     reader.onload = function(loadedEvent) {
        const parsedResult = JSON.parse(loadedEvent.target.result);
        $0.value = parsedResult;
        // Стереть все поля ввода если подтянули схему
        Array.prototype.slice.call(document.querySelectorAll('.changeArray2')).filter(e => e.value = '')
     }
     reader.readAsText(inputFile);
  }
  return window.readFile = readFile;
}


function _32(md){return(
md`**import** - "@observablehq/inputs" и "@mbostock/form-input" - Импортированы для удобного отображения HTML элементов.`
)}

function _35(md){return(
md`**api** - Используется для основной ссылки, а также для динамического переключения страниц. "_Your rate limit: 3000 calls/day_" - можно использовать только 3000 вызовов API в день. Правила сбора в [developer.marvel.com/documentation/authorization](https://developer.marvel.com/documentation/authorization).`
)}

function _api(md5,privateKey,publicKey)
{
  // Используется для основной ссылки, а также для динамического переключения страниц
  // apikey = public = publicKey
  // hash = md5(ts+privateKey+publicKey)
  var ts = new Date().getTime()
  var hash = md5.hash(ts+privateKey+publicKey)
  return `&ts=${ts}&apikey=${publicKey}&hash=${hash}`
}


function _37(md){return(
md`**url** - Полный адрес с hash и параметрами. Для вызова схемы по API.`
)}

function _url(inputsNew,selHtmlNew,api)
{
  // Собираем URL по кусочкам, чтоб добыть JSON
  var url = ''
  for (var key in inputsNew) {
      if (inputsNew[key] != '') url = url + '&' + key + '=' + inputsNew[key]
  }
  url = `https://gateway.marvel.com/v1/public/` + selHtmlNew[0].path.replace(/\/v1\/public\//, '') + `?` + url + api
  return url
}


function _39(md){return(
md`**md5** - Функция сбора md5. Выбирал из нескольких, остановился на рабочей схеме [spark-md5](https://observablehq.com/@tmcw/hacking-hashes-an-exploration-of-the-nyc-taxi-data-issue).`
)}

function _md5(require){return(
require('spark-md5')
)}

function _inputFile(html){return(
html`Скрытая кнопка загрузки схемы. Откровенный костыль Ý<input type="file" onchange="readFile(event)" style="display: none" id="getFile">`
)}

function _42(md){return(
md`**d3** - Сам мотор d3.js 6 версии.`
)}

function _d3(require){return(
require("d3@6")
)}

function _44(md){return(
md`**style** - стили для красивой отрисовки HTML элементов дерева.`
)}

function _45(html){return(
html`<style>

.node circle {
  fill: yellow;
  stroke: green;
  stroke-width: 2px;
}

.node text {
  font: 10px sans-serif;
}

.link {
  fill: none;
  stroke: #ccc;
  stroke-width: 2px;
}

</style>`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["scheme@2.json", {url: new URL("./files/scheme.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof selHtmlNew")).define("viewof selHtmlNew", ["Select","arrModelGroup"], _selHtmlNew);
  main.variable(observer("selHtmlNew")).define("selHtmlNew", ["Generators", "viewof selHtmlNew"], (G, _) => G.input(_));
  main.variable(observer("viewof inputsNew")).define("viewof inputsNew", ["html","d3","arrModel","selHtmlNew","form"], _inputsNew);
  main.variable(observer("inputsNew")).define("inputsNew", ["Generators", "viewof inputsNew"], (G, _) => G.input(_));
  main.variable(observer()).define(["mutable err","dataScheme","dataSchemeDemo","arrAll","mutable uncover","api","d3","mutable downloadJson","DOM","url","publicKey","privateKey","arrEmoji"], _4);
  main.variable(observer()).define(["md"], _5);
  main.define("initial err", _err);
  main.variable(observer("mutable err")).define("mutable err", ["Mutable", "initial err"], (M, _) => new M(_));
  main.variable(observer("err")).define("err", ["mutable err"], _ => _.generator);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["DOM","downloadJson","uncover"], _8);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer("viewof inputFile2")).define("viewof inputFile2", ["html"], _inputFile2);
  main.variable(observer("inputFile2")).define("inputFile2", ["Generators", "viewof inputFile2"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("viewof publicKey")).define("viewof publicKey", ["Text","html"], _publicKey);
  main.variable(observer("publicKey")).define("publicKey", ["Generators", "viewof publicKey"], (G, _) => G.input(_));
  main.variable(observer("viewof privateKey")).define("viewof privateKey", ["Text","html"], _privateKey);
  main.variable(observer("privateKey")).define("privateKey", ["Generators", "viewof privateKey"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _14);
  main.define("initial dataSchemeDemo", ["FileAttachment"], _dataSchemeDemo);
  main.variable(observer("mutable dataSchemeDemo")).define("mutable dataSchemeDemo", ["Mutable", "initial dataSchemeDemo"], (M, _) => new M(_));
  main.variable(observer("dataSchemeDemo")).define("dataSchemeDemo", ["mutable dataSchemeDemo"], _ => _.generator);
  main.variable(observer()).define(["md"], _16);
  main.define("initial downloadJson", _downloadJson);
  main.variable(observer("mutable downloadJson")).define("mutable downloadJson", ["Mutable", "initial downloadJson"], (M, _) => new M(_));
  main.variable(observer("downloadJson")).define("downloadJson", ["mutable downloadJson"], _ => _.generator);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer("arrModel")).define("arrModel", ["d3"], _arrModel);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer("arrModelGroup")).define("arrModelGroup", ["d3","arrModel"], _arrModelGroup);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer("arrAll")).define("arrAll", ["d3","arrModel"], _arrAll);
  main.variable(observer()).define(["md"], _24);
  main.variable(observer("arrEmoji")).define("arrEmoji", _arrEmoji);
  main.variable(observer()).define(["md"], _26);
  main.define("initial dataScheme", _dataScheme);
  main.variable(observer("mutable dataScheme")).define("mutable dataScheme", ["Mutable", "initial dataScheme"], (M, _) => new M(_));
  main.variable(observer("dataScheme")).define("dataScheme", ["mutable dataScheme"], _ => _.generator);
  main.variable(observer()).define(["md"], _28);
  main.define("initial uncover", _uncover);
  main.variable(observer("mutable uncover")).define("mutable uncover", ["Mutable", "initial uncover"], (M, _) => new M(_));
  main.variable(observer("uncover")).define("uncover", ["mutable uncover"], _ => _.generator);
  main.variable(observer()).define(["md"], _30);
  main.variable(observer()).define(["mutable dataScheme"], _31);
  main.variable(observer()).define(["md"], _32);
  const child1 = runtime.module(define1);
  main.import("Button", child1);
  main.import("Checkbox", child1);
  main.import("Toggle", child1);
  main.import("Radio", child1);
  main.import("Range", child1);
  main.import("Select", child1);
  main.import("Text", child1);
  main.import("Textarea", child1);
  main.import("Search", child1);
  main.import("Table", child1);
  main.import("bind", child1);
  const child2 = runtime.module(define2);
  main.import("form", child2);
  main.variable(observer()).define(["md"], _35);
  main.variable(observer("api")).define("api", ["md5","privateKey","publicKey"], _api);
  main.variable(observer()).define(["md"], _37);
  main.variable(observer("url")).define("url", ["inputsNew","selHtmlNew","api"], _url);
  main.variable(observer()).define(["md"], _39);
  main.variable(observer("md5")).define("md5", ["require"], _md5);
  main.variable(observer("viewof inputFile")).define("viewof inputFile", ["html"], _inputFile);
  main.variable(observer("inputFile")).define("inputFile", ["Generators", "viewof inputFile"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _42);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["md"], _44);
  main.variable(observer()).define(["html"], _45);
  return main;
}
