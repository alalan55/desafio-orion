const box = document.querySelector('.box')
const list = document.createElement('ul')
list.classList.add('lista')

let shapes = [];
let map;
let date = Date.now()

// INSERE NA TELA A FORMA DESENHADA
const showCurrentShape = (shape, map) => {

    switch (shape.name) {
        case 'circle':
            new google.maps.Circle({
                map,
                radius: shape.radius,
                center: shape.center
            })
            break;
        case 'rectangle':
            new google.maps.Rectangle({
                map,
                bounds: shape.bounds
            })
            break;
        case 'polygon':
            let decodedPolygon = google.maps.geometry.encoding.decodePath(shape.encodedPath)
            new google.maps.Polygon({
                map,
                path: decodedPolygon
            })
            break;
        case 'polyline':
            let decodedPolyline = google.maps.geometry.encoding.decodePath(shape.encodedPathLine)
            new google.maps.Polyline({
                map,
                path: decodedPolyline
            })
            break;
    }
}

// INICIA A FUNÇÃO DE DESENHOS
const initDrawinng = (map) => {

    let drawingManager = new google.maps.drawing.DrawingManager({
        map: map,
        drawingMode: google.maps.drawing.OverlayType.MAKER,
        drawintControl: true,
        drawindControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['maker', 'circle', 'polygon', 'polyline', 'rectangle']
        },

        circleOptions: {
            draggable: true,
            editable: true
        },
        polygonOptions: {
            draggable: true,
            editable: true
        },
        polylineOptions: {
            draggable: true,
            editable: true
        },
        rectangleOptions: {
            draggable: true,
            editable: true
        },
    });

 
    google.maps.event.addListener(drawingManager, 'overlaycomplete', (event) => {

        let type = event.type

        switch (type) {
            case 'circle':
                const center = event.overlay.getCenter();
                const radius = event.overlay.getRadius();
                const obj = { center: center, radius: radius }
                shapes.push({ name: 'circle', id: Date.now(), ...obj })
                saveInLocalStorage()
                break;
            case 'rectangle':
                const bounds = event.overlay.getBounds();
                shapes.push({ name: 'rectangle', id: Date.now(), bounds })
                saveInLocalStorage()
                break;
            case 'polygon':
                const path = event.overlay.getPath();
                const encodedPath = google.maps.geometry.encoding.encodePath(path)
                shapes.push({ name: 'polygon', id: Date.now(), encodedPath })
                saveInLocalStorage()
                break;
            case 'polyline':
                const pathLine = event.overlay.getPath();
                const encodedPathLine = google.maps.geometry.encoding.encodePath(pathLine)
                shapes.push({ name: 'polyline', id: Date.now(), encodedPathLine })
                saveInLocalStorage()
                break;
        }

        showShapesInBox(map)
    });
}

// INICIA A CONSTRUÇÃO DO MAPA
const initMap = async () => {
    map = new google.maps.Map(document.querySelector('#map'), {
        center: { lat: -22.379040417990762, lng: -43.225045646384395 },
        zoom: 12
    })

    initDrawinng(map)
    showShapesInBox(map)
}

// INICIA BUSCA DE DADOS SALVOS NO LOCAL STORAGE
const initData = () => {
    let dataFromLocal = localStorage.getItem('shapes')
    if (dataFromLocal) {
        shapes = JSON.parse(dataFromLocal)
    }
}

// INSERE AS FORMAS NO BOX DE FORMAS
const showShapesInBox = (map) => {

    if (!shapes.length) {
        let span = document.createElement('span')
        span.classList.add('message')
        span.innerText = 'Nenhuma forma salva'
        box.appendChild(span)
        return
    }

    let message = document.querySelector('.message')
    if (!!message) {
        box.removeChild(message)
    }

    box.appendChild(list)
    list.innerHTML = ''

    for (let item of shapes) {
        let li = document.createElement('li')
        li.classList.add('list-item')
        li.innerText = `TIPO: ${item.name} - ID: ${item.id}`
        li.style.cursor = 'pointer'
        li.addEventListener('click', () => showCurrentShape(item, map))
        list.appendChild(li)
    }
}


// SALVA AS FORMAS NO LOCAL STORAGE
const saveInLocalStorage = () => {

    if (localStorage.getItem('shapes')) {
        localStorage.removeItem('shapes')
    }
    localStorage.setItem('shapes', JSON.stringify(shapes))
}

initData()

window.initMap = initMap