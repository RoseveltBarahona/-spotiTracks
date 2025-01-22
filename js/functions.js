import { getArtist, getAlbumTracks } from "./api.js"
import { uiBackToHome } from "./ui.js"
import { artistAlbums, artistInfo, similarMusic, bgLoading, main, bgAlbumDetails, bodyPage, popularArtists, search } from "./selectores.js"

export { searchArtist, verifyBeforeSearch, stopOtherAudios, addListenerToAlbums, similarArtist, changeIconMainTrack, showLoader, hideLoader, closeAlbumDetail, backToHome, addListenerToPopularArtist, removeAlert }


//buscador
let actualArtist
let searchInput = document.querySelector('#searchInput')

function searchArtist(artisName) {
    getArtist(artisName)
    showLoader()
    actualArtist = artisName
}


function verifyBeforeSearch(e) {
    e.preventDefault()
    const artisName = searchInput.value.trim()

    if (artisName === '') return alert('Please enter an artist name')
    if (actualArtist === artisName) return alert('busqueda repetida')

    main.classList.contains("u-hide") && main.classList.remove("u-hide")    
    removeAlert()

    //buscar
    searchArtist(artisName)
}


// artistas populares del home
function addListenerToPopularArtist() {
    popularArtists.addEventListener('click', searchPopularArtist)
}

function searchPopularArtist(e) {
    e.preventDefault()

    if (e.target.closest('.slider__link')) {
        let artist = e.target.closest('.slider__link').dataset.name

        getArtist(artist)

        //search.classList.toggle("search--active")
        main.classList.contains("u-hide") && main.classList.remove("u-hide")
        removeAlert()
        setTimeout(() => showLoader(), 300);
    }
}


// ver detalles del album
function addListenerToAlbums() {
    artistAlbums.addEventListener('click', searchTracks)
}
function searchTracks(e) {
    if (e.target.classList.contains('album__image') || e.target.classList.contains('album__link')) {
        const albumID = e.target.getAttribute('data-album-id')
        const orderNumber = e.target.parentElement.getAttribute('data-order')
        getAlbumTracks(albumID, orderNumber)
    }
}


// traer artista similar
function similarArtist() {
    document.addEventListener('click', searchSimilars)
}
function searchSimilars(e) {
    if (e.target.classList.contains('track__artist')) {
        const artistID = e.target.id

        document.querySelector('#searchInput').value = "";
        actualArtist = ""

        getArtist(artistID, true)
        showLoader()
    }
}


// change icon on play
function changeIconMainTrack() {
    document.addEventListener('play', changeIcon, true)
    document.addEventListener('pause', changeIcon, true)
}

function changeIcon(e) {
    if (e.target.classList.contains("media__audio")) {
        const icon = document.querySelector('.media__play')
        icon.classList.toggle('media__play--active')
    }
}

// detener otros audios
function stopOtherAudios() {
    document.addEventListener('play', pauseAudios, true)
}
function pauseAudios(e) {
    const audios = document.body.querySelectorAll('audio')
    for (let audio of audios) {
        if (audio !== e.target) {
            audio.pause()
        }
    }
}

// detalles de album
function closeAlbumDetail() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('album-info__close') || e.target.classList.contains('wrap-album-details')) {
            bgAlbumDetails.classList.toggle("u-hide")
            bodyPage[0].classList.toggle("u-hide-scroll")
        }
    })
}

function backToHome() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('search__title') || e.target.classList.contains('search__logo')) {
            uiBackToHome()
            
            search.classList.contains("search--active") && search.classList.remove("search--active")
            searchInput.value = ""
            actualArtist = ""
        }
    })
}

//mostrar loading
let showLoader = () => bgLoading.classList.add("bg__loading--show")
let hideLoader = () => bgLoading.classList.remove("bg__loading--show")

// eliminar alerta existente
let removeAlert = () => {
    const alerta = document.querySelector(".error")
    alerta?.remove()
}

/*
if (e.target.classList.contains('slider__link')) {
        let artist = e.target.dataset.name } 

function searchSimilarsfromText(e) {
    if (e.target.classList.contains('track__artist')) {
        e.preventDefault()
        const artistID = e.target.id
        const artisName = e.target.textContent

        const input = document.querySelector('#searchInput').value = artisName;
        showLoader()
        ClickEvent()
        //document.querySelector(".search__button").click()    
    }
}

function ClickEvent() {
    const button = document.getElementById("submit-btn");
    const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });
    button.dispatchEvent(event);
} */

/* function searchPopularArtist (e){
e.preventDefault()   
 
if (e.target.parentElement.classList.contains('slider__info')) {
    let artist = e.target.parentElement.parentElement.dataset.name
    search.classList.toggle("search--active")
    getArtist(artist)
    setTimeout(() => {
        showLoader() 
    }, 300);
           
}
if (e.target.classList.contains('slider__img') || e.target.classList.contains('slider__info')) {
    let artist = e.target.parentElement.dataset.name
    search.classList.toggle("search--active")
    getArtist(artist)
    setTimeout(() => {
        showLoader() 
    }, 300);
             
}
} */