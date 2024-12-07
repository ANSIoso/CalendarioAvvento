// ======= CARICAMENTO SPREADSHEET CALENDARIO =======
function getApiCall(spreadsheetId){
    const apiKey = 'AIzaSyAQ9WRNKFwme_YiA1DtZi27eAg7mmfeJyY';

    return `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Foglio1?key=${apiKey}`;
}

async function fetchGoogleSheetData(spreadsheetId) {
    try {
        // Fetch data from Google Sheets API
        const response = await fetch(getApiCall(spreadsheetId));
        const data = await response.json();
        
        // Extract rows from the data
        const rows = data.values;                
        
        // se non ho estratto niente termino
        if(!rows)
            return

        createPacks(rows.slice(1, rows.length), rows[0][0])
        
    } catch (error) {
        console.error(error);
    }
}



// ======= COSTRUZIONE PACCHETTO =======

// - (CR) decorazione coperchio
function produceDecoration(day){
    let pack_cap_decoration = document.createElement("div");
    let day_mark = document.createElement("div");
    let o_string = document.createElement("div");
    let v_string = document.createElement("div");

    o_string.classList.add("string", "o_string");
    pack_cap_decoration.appendChild(o_string);
    
    v_string.classList.add("string", "v_string");
    pack_cap_decoration.appendChild(v_string);

    day_mark.classList.add("day");
    day_mark.innerHTML = day;
    pack_cap_decoration.appendChild(day_mark);

    return pack_cap_decoration;
}

// - (CR) coperchio
function producePackCap(day, status, isSpecial){
    let pack_cap = document.createElement("div");
    let pack_cap_decoration = produceDecoration(day);
    
    pack_cap.classList.add("pac_cap", "pac_component");
    if(isSpecial)
        pack_cap.classList.add("pac_cap_s");

    pack_cap_decoration.classList.add("pack_cap_decoration");
    pack_cap.appendChild(pack_cap_decoration);

    switch(status){
        case Pack_status.OPENED:
        pack_cap.classList.add("open");
        break;
        case Pack_status.OPENABLE:  
        pack_cap.onclick = function(){
            pack_cap.classList.add("open");
        }
        break;
        case Pack_status.LOCKED:
        pack_cap.onclick = function(){
            // Aggiunge la classe per avviare l'animazione
            pack_cap.classList.add('locked');

            // Rimuove la classe dopo un certo tempo per fermare l'animazione
            setTimeout(() => {
            pack_cap.classList.remove('locked');
            }, 500); // L'animazione durerà 3 secondi
        }
    } 

    return pack_cap;
}

// - (CR) contenuto
function producePackContent(img, isSpecial){
    let img_div = document.createElement("div");
    img_div.classList.add("img", "img_b");
    img_div.style.backgroundImage = `url(${img})`;

    let pack_content = document.createElement("div");
    pack_content.classList.add("pac_content", "pac_component", "unfocus");

    if(isSpecial)
        pack_content.classList.add("pac_content_s");

    pack_content.onclick = function(){
        focusedPack = pack_content;

        togglePack(pack_content)
        
        if (backDrop.style.display == "none") {
            backDrop.style.display = "block";
        } else {
            backDrop.style.display = "none";
        }

        if(img_div.style.backgroundSize = "cover")
            img_div.style.backgroundSize = "contain"
        else
            img_div.style.backgroundSize = "contain"
    }

    pack_content.appendChild(img_div)

  return pack_content;
}

// - assemblaggio dei componenti
function createPack(packStatus, day, isSpecial, img, sizeS, sizeB){
    let pack = document.createElement("div");

    let pack_cap = producePackCap(day, packStatus, isSpecial);
    let pack_content = producePackContent(img, isSpecial);

    pack.classList.add(
        `col-span-${sizeS.col}`,
        `row-span-${sizeS.row}`,
        `md:col-span-${sizeB.col}`,
        `md:row-span-${sizeB.row}`,
        
        "relative",

        "min-h-[12vh]",
        "h-full",
    );

    pack.appendChild(pack_content);
    pack.appendChild(pack_cap);

    return pack;
}

// ======= INTERAZIONE CON I PACCHI =======
let focusedPack = null;

const backDrop = document.getElementById("backDrop")

backDrop.onclick = function(){
    backDrop.style.display = "none";

    if(!focusedPack)
        return

    togglePack(focusedPack)

    focusedPack = null;
}

backDrop.style.display = "block";
backDrop.style.display = "none";

function togglePack(pack){
    pack.classList.toggle("unfocus");
    pack.classList.toggle("focus");

    let pac_img = pack.querySelectorAll(".img")[0]
    
    pac_img.classList.toggle("img_b")
}

// ======= COSTRUZIONE DEL CALENDARIO =======
const random_days_list = [14, 3, 22, 7, 18, 12, 1, 21, 10, 19, 25, 8, 6, 11, 4, 24, 15, 5, 9, 16, 20, 13, 23, 2, 17];

const Pack_status = {
    OPENED: "opened",
    OPENABLE: "openable",
    LOCKED: "locked"
};

// - Pattern delle dimensioni delle celle
// (per schermi grandi "Big")
const sizePatternB = [
    { col: 1, row: 1 },
    { col: 1, row: 1 },
    { col: 1, row: 2 },
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 1, row: 2 },
];

// (per schermi piccoli "Small")
const sizePatternS = [
    { col: 1, row: 2 }, 
    { col: 1, row: 3 }, 
    { col: 1, row: 2 }, 
    { col: 1, row: 1 }, 
    { col: 1, row: 2 }, 
    { col: 2, row: 1 }, 
];

function cleanCalendar(){
    document.getElementById("days_list").innerHTML = "";
}


const date = new Date();
const today = date.getDate();

function createPacks(img_rows, special_day){        
    // prima pulisco il calendario da eventuali pacchi presenti
    cleanCalendar()

    // per ogni giorno presente nella lista
    random_days_list.forEach((day, index) => {
        
        // definiamo lo stato del pacchetto ad esso assegnato
        let status;

        // basandoci sulla data odierna
        if(day < today)
            status = Pack_status.OPENED;
        else if (day == today)
            status = Pack_status.OPENABLE;
        else
            status = Pack_status.LOCKED;
        
        
        // prendo come riferimento arr "sizePatternB" ma è la stessa cosa per "sizePatternS"
        // dal momento che entrambi hanno la stessa lunghezza
        let gridRef = index % sizePatternB.length;

        // definisco la dimensione del pacchetto basandomi sul pattern
        let sizeB;
        let sizeS;
        if(index != random_days_list.length-1){
            sizeB = sizePatternB[gridRef]; 
            sizeS = sizePatternS[gridRef]; 
        }else{
            sizeB = sizePatternB[gridRef];
            sizeS = { col: 3, row: 1 }
        }

        // creo il pacchetto e lo inserisco nel calendario
        let pack = createPack(status, day, day == special_day, img_rows[day-1], sizeS, sizeB)
        document.getElementById("days_list").appendChild(pack);
    });
}

// ======= MODIFICA SPREADSHEET CALENDARIO DI RIFERIMENTO =======

let btn = document.getElementById("btn");

btn.onclick = function(){
    let title = document.getElementById("title");
    let title2 = document.getElementById("title2");

    title.classList.toggle("hidden")
    title2.classList.toggle("hidden")
}

let loadCalendar = document.getElementById("loadCalendar");
loadCalendar.onclick = function(){   

    let spreadsheetId = document.getElementById("spreadsheetId").value;
    fetchGoogleSheetData(spreadsheetId);
}

// ======= AUDIO =======
var audioElement0 = new Audio("./song.mp3");

let audioController = document.getElementsByClassName("audioC");

for (let item of audioController) {
    item.onclick = function(){    
        if(audioElement0.paused)
            audioElement0.play(); 
        else
            audioElement0.pause(); 
    }
}

audioElement0.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);



const baseSpreadsheetId = '168hnotY6vthGX7ETik3X1q2wOtxTP9nI9Qm97Ntxui8';
fetchGoogleSheetData(baseSpreadsheetId)