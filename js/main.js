const WIDTH = 200;
const HEIGHT = 100;

const CHARACTER_TYPES = {
    infantry: {
        type: "infantry",
        onAir: false,
        vsAir: false,
        life: 100,
        attack: 100,
        range: 10,
        cooltime: 10,
        cost: 500,
        color: "red",
    },
    tank: {
        type: "tank",
        onAir: false,
        vsAir: false,
        life: 400,
        attack: 200,
        range: 20,
        cooltime: 20,
        cost: 1000,
        color: "green",
    },
    rocket: {
        type: "rocket",
        onAir: false,
        vsAir: false,
        life: 200,
        attack: 100,
        range: 40,
        cooltime: 10,
        cost: 1000,
        color: "yellow",
    },
    missile: {
        type: "missile",
        onAir: false,
        vsAir: true,
        life: 200,
        attack: 200,
        range: 40,
        cooltime: 25,
        cost: 1000,
        color: "blue",
    },
    attacker: {
        type: "attacker",
        onAir: true,
        vsAir: false,
        life: 200,
        attack: 400,
        range: 20,
        cooltime: 10,
        cost: 2000,
        color: "lime",
    },
    fighter: {
        type: "fighter",
        onAir: true,
        vsAir: true,
        life: 400,
        attack: 400,
        range: 40,
        cooltime: 10,
        cost: 1000,
        color: "aqua",
    },
};

var state = {};
var timer = null;

init();
restart();

function init() {
    var selectTeamA = document.getElementById("teamA.select");
    for (var i of ["sample", "random"]) {
        var optionElement = document.createElement("option");
        optionElement.textContent = i;
        optionElement.value = i;
        selectTeamA.appendChild(optionElement);
    }
    var selectTeamB = document.getElementById("teamB.select");
    for (var i of ["random", "sample"]) {
        var optionElement = document.createElement("option");
        optionElement.textContent = i;
        optionElement.value = i;
        selectTeamB.appendChild(optionElement);
    }
}

function restart() {
    state = {
        time: 0,
        teamA: {
            life: 1000,
            money: 1000,
            characters : [],
        },
        teamB: {
            life: 1000,
            money: 1000,
            characters : [],
        },
        fired: [],
        bursted: [],
        winner: null,
    }

    if (timer != null) {
        clearInterval(timer);
    }
    timer = setInterval(loop, 20);
}

function loop() {
    if (state.time % 2 == 0) {
        move();
        command();
    } else if (state.time % 2 == 1) {
        attack_enemy();
        attack_area();
        state.teamA.money += 50;
        state.teamB.money += 50;
    }

    view();
    if (state.teamA.life <= 0) {
        clearInterval(timer);
        document.getElementById("time_text").textContent = "teamB is win";
        return;
    } else if (state.teamB.life <= 0) {
        clearInterval(timer);
        document.getElementById("time_text").textContent = "teamA is win";
        return;
    }

    state.time++;
}

function view() {
    document.getElementById("time_text").textContent = "time  : " + state.time;
    document.getElementById("teamA.life").value = state.teamA.life;
    document.getElementById("teamA.money").innerText = state.teamA.money;
    document.getElementById("teamB.life").value = state.teamB.life;
    document.getElementById("teamB.money").innerText = state.teamB.money;

    const canvas = document.getElementById('field_canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var x = 0; x < 20; x++) {
        for (var y = 0; y < 10; y++) {
            ctx.fillStyle = "#455A64";
            ctx.fillRect(x * 50, y * 50, 49, 49);
        }
    }

    for (var character of state.teamA.characters.concat(state.teamB.characters)) {
        ctx.fillStyle = CHARACTER_TYPES[character.type].color;
        ctx.fillRect(5 * character.x, 5 * character.y + 15, 20, 20);
    }

    for (var fired of state.fired) {
        ctx.beginPath();
        ctx.moveTo(5 * fired[0], 5 * fired[1] + 25);
        ctx.lineTo(5 * fired[2], 5 * fired[3] + 25);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    state.fired = [];

    for (var bursted of state.bursted) {
        ctx.beginPath();
        ctx.arc(5 * bursted[0], 5 * bursted[1] + 25, 100, 0 * Math.PI / 180, 360 * Math.PI / 180,);
        ctx.fillStyle = "red";
        ctx.fill();
    }
    state.bursted = [];
}

function move() {
    for (var character of state.teamA.characters.concat(state.teamB.characters)) {
        var speed = 1;
        if (character.onAir) {
            speed = 1.5;
        }

        if (character.x < character.destination) {
            character.x += speed;
        } else if (character.x > character.destination) {
            character.x -= speed;
        }
    }
}

function attack_enemy() {
    for (var characterA of state.teamA.characters) {
        if (state.time > characterA.fired + characterA.cooltime) {
            var targets = [];
            for (var characterB of state.teamB.characters) {
                if (characterA.x <= characterB.x
                    && characterB.x <= characterA.x + characterA.range
                    && Math.abs(characterA.y - characterB.y) <= 10
                    && ((characterA.vsAir && characterB.onAir) || (!characterA.vsAir && !characterB.onAir))
                ) {
                    targets.push(characterB);
                }
            }
            if (targets.length > 0) {
                var target = Math.floor(Math.random() * targets.length);
                targets[target].life -= characterA.attack;
                characterA.fired = state.time;
                state.fired.push([characterA.x, characterA.y, targets[target].x, targets[target].y]);
            }
        }
    }

    for (var characterB of state.teamB.characters) {
        if (state.time > characterB.fired + characterB.cooltime) {
            var targets = [];
            for (var characterA of state.teamA.characters) {
                if (characterA.x <= characterB.x
                    && characterB.x - characterB.range <= characterA.x
                    && Math.abs(characterA.y - characterB.y) <= 10
                    && ((characterB.vsAir && characterA.onAir) || (!characterB.vsAir && !characterA.onAir))
                ) {
                    targets.push(characterA);
                }
            }
            if (targets.length > 0) {
                var target = Math.floor(Math.random() * targets.length);
                targets[target].life -= characterB.attack;
                characterB.fired = state.time;
                state.fired.push([characterB.x, characterB.y, targets[target].x, targets[target].y]);
            }
        }
    }

    for (var i = state.teamA.characters.length - 1; i >= 0; i--) {
        if (state.teamA.characters[i].life <= 0) {
            state.teamA.characters.splice(i, 1);
        }
    }
    for (var i = state.teamB.characters.length - 1; i >= 0; i--) {
        if (state.teamB.characters[i].life <= 0) {
            state.teamB.characters.splice(i, 1);
        }
    }
}

function attack_area() {
    for (var i = state.teamA.characters.length - 1; i >= 0; i--) {
        if (state.teamA.characters[i].type == "infantry" && state.teamA.characters[i].x >= WIDTH - 1) {
            state.teamB.life -= state.teamA.characters[i].attack;
            state.bursted.push([state.teamA.characters[i].x, state.teamA.characters[i].y]);
            state.teamA.characters.splice(i, 1);
        }
    }

    for (var i = state.teamB.characters.length - 1; i >= 0; i--) {
        if (state.teamB.characters[i].type == "infantry" && state.teamB.characters[i].x <= 0) {
            state.teamA.life -= state.teamB.characters[i].attack;
            state.bursted.push([state.teamB.characters[i].x, state.teamB.characters[i].y]);
            state.teamB.characters.splice(i, 1);
        }
    }
}

async function command() {
    let element1 = document.getElementById('teamA.select');
    const path1 = "./tactics/" + element1.value + ".js";
    const module1 = await import(path1);
    const tactics1 = new module1.Tactics();
    const result1= tactics1.exec(state.time, state.teamA, state.teamB);

    for (var character of state.teamA.characters.concat(state.teamB.characters)) {
        character.x = WIDTH - 1 - character.x;
        character.y = HEIGHT - 1 - character.y;
    }

    let element2 = document.getElementById('teamB.select');
    const path2 = "./tactics/" + element2.value + ".js";
    const module2 = await import(path2);
    const tactics2 = new module2.Tactics();
    const result2 = tactics2.exec(state.time, state.teamB, state.teamA);

    for (var character of state.teamA.characters.concat(state.teamB.characters)) {
        character.x = WIDTH - 1 - character.x;
        character.y = HEIGHT - 1 - character.y;
    }

    for (var result of result1) {
        generate("teamA", result[1], result[0]);
    }

    for (var result of result2) {
        generate("teamB", result[1], HEIGHT - 1 - result[0]);
    }
}

function generate(team, type, y) {
    if (state[team].money >= CHARACTER_TYPES[type].cost) {

        var x = 0;
        var destination = WIDTH - CHARACTER_TYPES[type].range;
        if (type == "infantry") {
            destination = WIDTH;
        }
        if (team == "teamB") {
            x = WIDTH;
            destination = WIDTH - destination;
        }

        state[team].characters.push({
            team: team,
            type: type,
            onAir: CHARACTER_TYPES[type].onAir,
            vsAir: CHARACTER_TYPES[type].vsAir,
            life: CHARACTER_TYPES[type].life,
            attack: CHARACTER_TYPES[type].attack,
            range: CHARACTER_TYPES[type].range,
            cooltime: CHARACTER_TYPES[type].cooltime,
            destination: destination,
            fired: -100,
            x: x,
            y: y,
        });
        state[team].money -= CHARACTER_TYPES[type].cost;
    }
}
