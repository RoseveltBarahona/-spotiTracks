import { stopOtherAudios, addListenerToAlbums, similarArtist, verifyBeforeSearch, changeIconMainTrack, closeAlbumDetail, backToHome, addListenerToPopularArtist } from "./functions.js"
import { popularArtists } from "./selectores.js"


document.addEventListener("DOMContentLoaded", () => {
    //clonar nodo de slider css
    const copy = document.querySelector(".slider__track").cloneNode(true)
    popularArtists.appendChild(copy)

    //form
    const searchForm = document.querySelector('#form')
    searchForm.addEventListener("submit", verifyBeforeSearch)

    //delegación de eventosS
    addListenerToAlbums()
    stopOtherAudios()
    similarArtist()
    closeAlbumDetail()
    changeIconMainTrack()
    addListenerToPopularArtist()
})


