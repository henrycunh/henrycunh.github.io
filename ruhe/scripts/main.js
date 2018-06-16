var storage = firebase.storage().ref('images')
var db = firebase.database()
var started = false
var memories = []

const addMemory = () => {
    $(".action").addClass("small")
    $("#add-memory-popup").addClass("active")
    $(".action").addClass("disabled")
    $("#ratio").removeClass("active")
    $("#memory").removeClass("active")
}

const saveMemory = () => {
    let file = $("#add-memory-image")[0].files[0]
    let memory = {
        title: $("#add-memory-title").val(),
        desc: $("#add-memory-desc").val(),
        date: $("#add-memory-date").val()
    }
    $("#add-memory-dimmer").addClass("active")
    $("#add-memory-load").addClass("active")
    // Adding memory
    storage.child(file.name).put(file).then(
        snap => snap.ref.getDownloadURL().then(
            url => db.ref('/config').once('value',
                _snap => {
                    let lastID = _snap.val().lastID
                    memory.id = lastID + 1
                    memory.image = url
                    console.log(memory)
                    db.ref('memories/' + memory.id).set(memory).then(
                        () => db.ref('/config/lastID').set(lastID + 1).then(() => {
                            $("#add-memory-dimmer").removeClass("active")
                            $("#add-memory-load").removeClass("active")
                            closeAddMemoryPopup()
                        })
                    )
                }
            )
        )
    ).then( () => getMemories() )
}

const getMemories = () => 
    db.ref('memories').once('value', snap => memories = snap.val() )
        .then( () => {
            let _memories = []
            Object.keys( memories ).forEach( memory => _memories.push( memories[memory] ))
            memories = _memories 
        })

const changeBackground = url => {
    $("#back").css({
        "backgroundImage" :
        	`linear-gradient(to bottom, rgba(83, 83, 83, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%), url(${url})`
    })
}
const showMemory = index => {
    console.log(index)
    let memory = memories[index]
    let date = new Date(memory.date)
    let dateStr = `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}`
    $("#memory-title").html(memory.title)
    $("#memory-desc").html(memory.desc)
    $("#memory-date").html(dateStr)
    changeBackground(memory.image)
}


const changeInputTitle = () => {
    let name = $("#add-memory-image")[0].files[0].name
    name = name.length > 16 ? name.substr(0, 16) + '...' : name
    $("#add-memory-image-label-text").html(name)
}

const closeAddMemoryPopup = () => {
    $("#add-memory-popup").removeClass("active")
    $(".action").removeClass("small disabled")
    $("#ratio").addClass("active")
    $("#memory").addClass("active")

}

const showRandomMemory = () => showMemory( Math.floor( Math.random() * memories.length ))

const tapped = () => {
    if (started) return
    // Transition to memory mode
    $("#welcome-message").addClass("hidden")
    $("#welcome-message-sub").addClass("hidden")
    $("#ratio").addClass("active")
    $(".action").addClass("active")
    // setTimeout(
    //     () => showRandomMemory(), 1000
    // )
    showRandomMemory()
    $("#memory").addClass("active")
    started = true
}

const init = () => {
    getMemories().
        then( () => {
            $(document).click(tapped)
        })
}

$(init)