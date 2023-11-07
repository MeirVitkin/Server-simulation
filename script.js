

class Package {
    constructor(from, to, content) {
        this.from = from;
        this.to = to;
        this.content = content;
    }

}
class Cable {
    constructor(name) {
        this.name = name;
        this.busy = false;
        this.queue = [];
        this.messages = [];
    }

    sendPackageToServer(pack) {
        this.queue.push(pack);

        if (!this.busy) {
            this.busy = true;
            this.sendNextPackage();
        }
    }

    sendNextPackage() {
        if (this.queue.length === 0) {
            this.busy = false;
            return;
        }

        const pack = this.queue.shift();

        createCircle(pack.from, 'blue', 10, 6);
        setTimeout(() => {
            Server.sendTo(pack);
            this.sendNextPackage();
        }, 2000);
    }

    getMessageFormServer(pack) {
        this.messages.push(pack);
    }

    sendMessage() {
        if (!this.busy && this.messages.length > 0) {
                this.busy = true;
                const pack = this.messages.shift();
                setTimeout(() => {
                    this.busy = false;
                }, 2000)
                return pack;
        }
    }


}

class Server {
    static cablesArray = [];

    static sendTo(pack) {

        const foundCable = findObjectByName(pack.to);

        if (foundCable) {
            foundCable.getMessageFormServer(pack);
        } else {
            console.log("Object not found.");
        }


    }

}

class Client {
    constructor(name) {
        this.name = name;
        this.cable = new Cable(name);
        Server.cablesArray.push(this.cable);
        this.messageForMe();
    }
    creaetClient(name) {
        if (isClientNameUnique(name)) {
            const storedNames = JSON.parse(localStorage.getItem('clientNames')) || [];
            storedNames.push(name);
            localStorage.setItem('clientNames', JSON.stringify(storedNames));


            const client = document.getElementById('cilentConteinor');
            const newClientContainer = document.createElement('div');
            // newClientContainer.style.backgroundColor=getRandomColor();
            newClientContainer.innerHTML = `<div id=${name} class="client" >
        <div class="mesegeBox" id="mesegeBox${name}">
        <h4>Hi ${name}</h4>
        </div><select class="toDropdown" id=To${name}></select>
        <input placeholder="Enter your text here" class="input" id="message${name}">
        <button class="button" id=${name}>send</button>
        </div>`
            client.appendChild(newClientContainer);
            const canvasContainer = document.createElement('div');
            canvasContainer.innerHTML = `
            <canvas id="canvas${name}" class="canvas" width="750px" height="250px"
             ></canvas>`;

            client.appendChild(canvasContainer);

            updateAllToDropdowns();

            const button = newClientContainer.querySelector('.button');
            button.addEventListener('click', () => {


                let To = document.getElementById(`To${name}`).value;
                let message = document.getElementById(`message${name}`).value;
                //check if the message is to him self
                if (To === "Select a contact" || "") {
                    message = document.getElementById(`message${name}`);
                    To = document.getElementById(`To${name}`);
                    message.value = "";
                    To.value = "";
                    console.log("you can't send this message ");
                    return;
                }
                let newPackage = new Package(name, To, message);
                message = document.getElementById(`message${name}`);
                To = document.getElementById(`To${name}`);
                message.value = "";
                To.value = "";


                //send the message to the server
                this.cable.sendPackageToServer(newPackage);

                // setTimeout(()=>{
                //     if (sended==="noSended") {
                //         console.log("send ="+ sended);
                //         sended= this.cable.sendPackageToServer(newPackage);
                //     }
                // },5000)

                //enter the content message to the sender's box
                let messageTo = document.getElementById(`mesegeBox${newPackage.from}`);
                let newMessage = document.createElement('p');
                newMessage.innerHTML = `<span class="msgTo">To: ${newPackage.to}</span><br>
                <span class="messageTime">${currentTime()}</span>
                <span class="messageTo">${newPackage.content}</span>`;
                messageTo.appendChild(newMessage);
            })
        }
        else { console.log("there is already a client with that name"); }
    }
    messageForMe() {
        setInterval(() => {
            const pack = this.cable.sendMessage();
            console.log(pack);
            if (pack !== undefined) {
                createCircle(pack.to, 'green', 730, -6)
                setTimeout(() => {
                    let messageTo = document.getElementById(`mesegeBox${pack.to}`);
                    let newMessage = document.createElement('p');
                    newMessage.classList = "msgFrom"
                    newMessage.innerHTML = `<span class="from">From: ${pack.from}</span><br>
                <span class="messageFrom">${pack.content} </span>   
                <span class="messageTime">${currentTime()}</span>`;
                    messageTo.appendChild(newMessage);

                }, 2000)
            }
        }, 1500);


    }

}

function callCreateClient(name) {
    const clientAdd = new Client(name);
    clientAdd.creaetClient(name);
   
}

function findObjectByName(name) {
    return Server.cablesArray.find(obj => obj.name === name);
}
function currentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const currentTime = ` ${formattedHours}:${formattedMinutes} ${ampm}`;
    return currentTime;

}
function isClientNameUnique(name) {
    const storedNames = JSON.parse(localStorage.getItem('clientNames')) || [];
    return !storedNames.includes(name);
}
function getAllClientNames() {
    const storedNames = JSON.parse(localStorage.getItem('clientNames')) || [];
    return storedNames;
}

function updateAllToDropdowns() {
    const clientContainers = document.querySelectorAll('.client');
    const clientNames = getAllClientNames();

    clientContainers.forEach(clientContainer => {
        const toDropdown = clientContainer.querySelector('.toDropdown');
        toDropdown.innerHTML = '';
        const unselectableOption = document.createElement('option');
        unselectableOption.disabled = true;
        unselectableOption.selected = true;
        unselectableOption.text = 'Select a contact';
        toDropdown.appendChild(unselectableOption);
        clientNames.forEach(clientName => {
            if (clientName !== clientContainer.id) {
                const option = document.createElement('option');
                option.value = clientName;
                option.text = clientName;
                toDropdown.appendChild(option);
            }
        });
    });
}


function createCircle(name, color, x, dx) {
    const canvas = document.getElementById(`canvas${name}`);
    const ctx = canvas.getContext('2d');
    const y = canvas.height / 2;
    console.log(canvas.width);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();

        x += dx;

        if (x + 10 > canvas.width || x - 10 < 0) {
            dx *= -1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        requestAnimationFrame(animate);
    }

    animate();
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


const userButton = document.getElementById('submitUser');
userButton.addEventListener('click', () => {
    let user = document.getElementById('createUser');
    let u = user.value;
    if (u === "") {
        return
    }
    user.value = "";
    callCreateClient(u);

});
window.addEventListener('beforeunload', function () {
    localStorage.removeItem('clientNames');
});