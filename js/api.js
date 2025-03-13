import { uiArtisInfo, uiArtisBio, uiAlbums, uiAlbumDetails, uiTopTrack, uiSimilarMusic, uishowContainersHtml, uiShowErrorMessage } from "./ui.js"
import { messages } from "./ui-messages.js"
export { getArtist, getAlbumTracks, getFromRapidApi, getArtisFullInfo }


let actualToken

// token *60min
const getToken = () => {
    const client_id = 'bd5c0c5828c14ba99a991bb6faf72a1a'
    const client_secret = 'bede21133e43433c982effcca4572958'

    const authParameters = {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        body: "grant_type=client_credentials"
    }

    return fetch("https://accounts.spotify.com/api/token", authParameters)
        .then(response => response.json())
        .then(data => {
            actualToken = data.access_token
            return data.access_token;
        })
        .catch(error => {
            return uiShowErrorMessage("Error al obtener Token de Autorización", "token")
        })
}

//fetch options rapidAPI
const optionsRapidApi = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': '5c97fa17f8msh3217261ac5cf82fp154bf7jsn9a9d0b0badd0',
        'x-rapidapi-host': 'spotify23.p.rapidapi.com'
    }
}


// Obtener artista ID e información basica
async function getArtist(artist, fromSimilar = false) {
    try {
        actualToken ??= await getToken()
        if (!actualToken) return  uiShowErrorMessage(messages.token, "error")
            
        const searchParameters = {
            method: "GET",
            headers: { Authorization: 'Bearer ' + actualToken }
        }

        if (fromSimilar) {
            let url = `https://api.spotify.com/v1/artists/${artist}`
            const result = await fetch(url, searchParameters)
            const data = await result.json()

            uiArtisInfo(data, true)
            getArtisFullInfo(artist, searchParameters)

        } else {
            let url = `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`
            const result = await fetch(url, searchParameters)
            const data = await result.json()

            let artistID = data.artists.items[0].id
            uiArtisInfo(data)
            getArtisFullInfo(artistID, searchParameters)
        }

        uishowContainersHtml(true)

    } catch (error) {
        if (fromSimilar) return uiShowErrorMessage(messages.apiSimilars, "error")

        return uiShowErrorMessage(messages.apiError, "error")
    }
}

// Obtener albums, top tracks, similar...
async function getArtisFullInfo(artistID, searchParameters) {

    const promises = [
        fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?limit=3`, searchParameters),
        fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=ES`, searchParameters),
        fetch(`https://spotify23.p.rapidapi.com/artist_overview/?id=${artistID}`, optionsRapidApi),
        fetch(`https://spotify23.p.rapidapi.com/recommendations/?limit=5&seed_artists=${artistID}`, optionsRapidApi)
    ]

    let uiFunctions = [uiAlbums, TopTracks, uiArtisBio, uiSimilarMusic]
    const results = await Promise.allSettled(promises)

    results.forEach(async (result, index) => {
        try {
            if (result.status === 'rejected') throw { "Rejected": result.reason, index }

            if (result.value.ok === !true) throw { "Status_error": result.value.status, index }

            if (result.status === 'fulfilled' && result.value.ok) {
                let data = await result.value.json()
                uiFunctions[index](data)
            }

        } catch (error) {
            console.log(error)
            return uiFunctions[error.index]("")
        }
    })
}


// obtener tracks de album
async function getAlbumTracks(albumId, orderNumber) {
    const searchParameters = {
        method: "GET",
        headers: { Authorization: 'Bearer ' + actualToken }
    }

    const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`
    try {
        let response = await fetch(url, searchParameters)
        let data = await response.json()
        uiAlbumDetails(data, orderNumber)
    } catch (error) {
        return uiAlbumDetails("")
    }
}

// obtener top track de artista
function TopTracks(data) {
    if (data === "") return uiTopTrack(data)

    const urlTopTrack = `https://spotify23.p.rapidapi.com/tracks/?ids=`
    const trackID = data.tracks[0].id
    getFromRapidApi(uiTopTrack, urlTopTrack, trackID)
}

// obtener datos de rapidApi
async function getFromRapidApi(uiFunction, url, id) {
    try {
        const response = await fetch(`${url}${id}`, optionsRapidApi);
        const result = await response.json();
        uiFunction(result)
    } catch (error) {
        return uiFunction("")
    }
}