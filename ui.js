
import { artistInfo, artistBio, artistAlbums, similarMusic, albumDetails, main, bgAlbumDetails, bodyPage, popularArtists } from "./selectores.js"
import { hideLoader, backToHome, removeAlert } from "./functions.js"
import { messages } from "./ui-messages.js"
export { uiArtisInfo, uiArtisBio, uiTopTrack, uiAlbums, uiAlbumDetails, uiSimilarMusic, uishowContainersHtml, uiShowErrorMessage, uiBackToHome }


let uishowContainersHtml = (result) => {
    artistInfo.classList.remove("u-hide")
    artistBio.parentElement.classList.remove("u-hide")
    artistAlbums.parentElement.classList.remove("u-hide")
    similarMusic.parentElement.classList.remove("u-hide")

    popularArtists.classList.add("u-hide")
    !search.classList.contains("search--active") && search.classList.toggle("search--active")
    setTimeout(() => hideLoader(), 500)
    backToHome()
}


let artistTags
let infoModalAlbum

function uiArtisInfo(data, fromSimilar = false) {
    uiCleanHtml(artistInfo)

    // guardar tags para biografia     
    artistTags = data.genres ?? data.artists.items[0].genres

    // distingir si es busqueda o viene desde similar artist
    let basicInfo = {}

    if (fromSimilar) {
        basicInfo = {
            //name: data.name,
            followers: data.followers.total,
            popularity: data.popularity,
            image: data.images[0].url
        }
    } else {
        basicInfo = {
            //name: data.artists.items[0].name,
            followers: data.artists.items[0].followers.total,
            popularity: data.artists.items[0].popularity,
            image: data?.artists?.items[0]?.images[0]?.url ?? "images/home/no-image.jpg"
        }
    }

    const divInfo = document.createElement('div')
    divInfo.classList.add('info')
    const divMedia = document.createElement('div')
    divMedia.classList.add('media')

    divInfo.innerHTML =
        `<h2 class="info__name">${data?.artists?.items[0]?.name ?? data.name}</h2>
            <span class="info__followers">Followers: <b>${basicInfo.followers}</b></span>
            <span class="info__popularity">Popularity: <b>${basicInfo.popularity}</b></span>`
    divMedia.innerHTML = `
            <img class="media__image" src="${basicInfo.image}" alt="${basicInfo.name}">
            <span class="media__play u-hide"> 
                <audio src="" controls="true" class="media__audio"></audio>
            </span>`

    artistInfo.appendChild(divInfo)
    artistInfo.appendChild(divMedia)
}


// añadir audio principal
function uiTopTrack(data) {
    if (data === "" || data.message === 'Too many requests') return

    let mainAudio = document.querySelector('.media__audio');
    mainAudio?.parentElement.classList.remove("u-hide")
    mainAudio?.setAttribute('src', data.tracks[0].preview_url)
}


// bio
function uiArtisBio(data) {
    uiCleanHtml(artistBio)
    //error o data vacía 
    if (data === "" || data.data.artist.profile.biography.text === null) return uiShowErrorMessage(messages.bio, "biography")

    let biography = uiTextBiography(data)

    biography.length > 1
        ? artistBio.insertAdjacentHTML('beforeend', `<p class="artist-bio__text">${biography[0]}</p>
          <p class="artist-bio__text">${biography[1]}</p>`)
        : artistBio.insertAdjacentHTML('beforeend', `<p class="artist-bio__text">${biography[0]}</p>`)

    // tags
    const divTags = document.createElement('div');
    artistTags.forEach(tag => {
        divTags.insertAdjacentHTML('beforeend', `<span class="tag">${tag}</span>`)
    })
    artistBio.appendChild(divTags)
}


function uiTextBiography(data) {
    let biography = data.data.artist.profile.biography.text
    let regex = /\<(.*?)\>/g
    biography = biography.replace(regex, '').split('\n').filter(paragraph => paragraph !== '')

    if (biography[0].length > 1000) {
        let shortDescription = [biography[0].split(" ").join(" ")]//.slice(0, 800) + "..."        
        return shortDescription
    }
    return biography
}


// albums
function uiAlbums(data) {

    uiCleanHtml(artistAlbums)
    //error o data vacía 
    if (data === "") return uiShowErrorMessage(messages.album, "album")

    infoModalAlbum = []
    data.items.forEach((album, index) => {

        // guardar info para modal detalles de album        
        let objectAlbum = { "artist": album.artists[0].name, "albumName": album.name, "img": album.images[0].url }
        infoModalAlbum.push(objectAlbum)

        // info album
        let { name, images, total_tracks, id, release_date } = album
        release_date = release_date.split('-')[0]

        const divAlbum = document.createElement('div')
        divAlbum.classList.add('album')
        divAlbum.dataset.order = index

        divAlbum.innerHTML = `
         <span class="album__year">${release_date}</span>
            <img class="album__image" data-album-id="${id}" src="${images[0].url}" alt="${name}"/>
            <div class="album__info">
                <h3 class="album__name">${name}</h3>
                <span class="album__tracks">Tracks: ${total_tracks}</span>
                <span class="album__link" data-album-id="${id}">Ver album</span>
            </div>`
        artistAlbums.appendChild(divAlbum)
    })
}


// similar music
function uiSimilarMusic(data) {
    uiCleanHtml(similarMusic)
    // error o data vacía 
    if (data === "") return uiShowErrorMessage(messages.similar, "similars")

    data.tracks.forEach((track, index) => {
        const divTrack = document.createElement('div')
        divTrack.classList.add('track')
        divTrack.innerHTML = `
            <div class="track__order">${index + 1}</div>
            <img class="track__image" src="${track.album.images[1].url}" alt="${track.name}">
            <div class="track__info">
                <span class="track__name">${track.name}</span>
                <a href="#search" id=${track.artists[0].id} class="track__artist">${track.artists[0].name}</a>
                <span class="track__album">${track.album.name}</span>
            </div>
            <div class="track__audio">
                <audio src="${track.preview_url}" controls="true" class="audio"></audio>
            </div>`
        similarMusic.appendChild(divTrack)
    })
}


//detalles del album
function uiAlbumDetails(data, orderNumber) {
    uiCleanHtml(albumDetails)

    let { artist, albumName, img } = infoModalAlbum[orderNumber]

    albumDetails.innerHTML = "<button class='album-info__close'>x</button>"

    // info
    const divAlbumInfo = document.createElement('div')
    divAlbumInfo.classList.add('album-info')
    divAlbumInfo.innerHTML = `        
        <span class="album-info__name">${albumName}</span>
        <span class="album-info__artist">${artist}</span>`

    // image
    const divAlbumImage = document.createElement('img')
    divAlbumImage.src = img
    divAlbumImage.alt = albumName
    divAlbumImage.classList.add("album-image-detail")

    // tracklist
    const divTracks = document.createElement('div')
    divTracks.classList.add('album-tracks')

    data.items.forEach(track => {
        const divAlbumDetail = document.createElement('div')
        divAlbumDetail.classList.add('track-detail')
        divAlbumDetail.innerHTML = `
            <div class="track-detail__number">${track.track_number}</div>
            <span class="track-detail__name">${track.name}</span>`

        divTracks.appendChild(divAlbumDetail)
    })

    const wrapTracks = document.createElement('div')
    wrapTracks.classList.add('wrap-tracks')
    wrapTracks.innerHTML = "<div class='album-tracks-title'>Tracklist</div>"
    wrapTracks.appendChild(divTracks)

    // añadir a html
    albumDetails.appendChild(divAlbumInfo)
    albumDetails.appendChild(divAlbumImage)
    albumDetails.appendChild(wrapTracks)

    // mostrar album
    bgAlbumDetails.classList.toggle("u-hide")
    bodyPage[0].classList.toggle("u-hide-scroll")
}


//errores desde api
function uiShowErrorMessage(message, type) {
    //evitar alerta duplicada
    removeAlert()

    if (type === "token") alert("Token no disponible")

    // error global al iniciar la busqueda
    if (type === "error") {
        const divError = document.createElement("div")
        divError.classList.add("error", "u-max-width")
        divError.innerHTML = `<span class="error__title">${messages.global}</span><p>&#x2022 <b class="error__message">${message}</b></p>`

        main.classList.add("u-hide")
        popularArtists.insertAdjacentElement("beforebegin", divError)
    }
    // errores en secciones
    if (type === "album") artistAlbums.innerHTML = `<div class="error-inside">${message}</div>`
    if (type === "similars") similarMusic.innerHTML = `<div class="error-inside">${message}</div>`
    if (type === "biography") artistBio.innerHTML = `<div class="error-inside">${message}</div>`

    setTimeout(() => hideLoader(), 500)
}


function uiCleanHtml(selector) {
    if (!selector) return
    while (selector.firstChild) {
        selector.removeChild(selector.firstChild)
    }
}

function uiBackToHome() {
    let containers = [artistInfo, artistBio, artistAlbums, similarMusic]
    for (let element of containers) {
        uiCleanHtml(element)
    }

    artistInfo.classList.add("u-hide")
    for (let index = 1; index < containers.length; index++) {
        containers[index].parentElement.classList.add("u-hide")
    }
    popularArtists.classList.remove("u-hide")
    removeAlert()
}


