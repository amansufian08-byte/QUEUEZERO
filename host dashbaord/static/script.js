let userTicket =
    localStorage.getItem("queueTicket");


async function getQueue() {

    try {

        const response =
            await fetch("/api/queue");

        const data =
            await response.json();

        updateAdmin(data);

        updateUser(data);

    }

    catch (error) {

        console.log(
            "Server connection error"
        );

    }

}


/* =========================
   ADMIN DASHBOARD
========================= */

function updateAdmin(data) {

    const waiting =
        data.waiting;

    const current =
        "QZ-" + data.current_number;

    const next =
        "QZ-" + data.next_number;


    const wait =
        Math.ceil(
            waiting /
            data.service_rate
        );


    const waitingEl =
        document.getElementById(
            "waiting"
        );

    const currentEl =
        document.getElementById(
            "current"
        );

    const bigCurrent =
        document.getElementById(
            "bigCurrent"
        );

    const waitEl =
        document.getElementById(
            "waitTime"
        );

    const serviceRate =
        document.getElementById(
            "serviceRate"
        );

    const nextEl =
        document.getElementById(
            "nextTicket"
        );

    const activeCounter =
        document.getElementById(
            "activeCounter"
        );


    if (waitingEl)
        waitingEl.textContent =
            waiting;


    if (currentEl)
        currentEl.textContent =
            current;


    if (bigCurrent)
        bigCurrent.textContent =
            current;


    if (waitEl)
        waitEl.textContent =
            wait + "m";


    if (serviceRate)
        serviceRate.textContent =
            data.service_rate;


    if (nextEl)
        nextEl.textContent =
            next;


    if (activeCounter)
        activeCounter.textContent =
            "Counter " +
            String(data.counter)
                .padStart(2, "0");


    /* QUEUE PROGRESS */

    const progress =
        Math.max(
            5,
            Math.min(
                100,
                100 - waiting * 6
            )
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );

    const progressText =
        document.getElementById(
            "progressText"
        );


    if (progressBar)
        progressBar.style.width =
            progress + "%";


    if (progressText)
        progressText.textContent =
            Math.round(progress) + "%";


    /* RISK */

    const risk =
        Math.min(
            100,
            waiting * 5
        );


    const riskScore =
        document.getElementById(
            "riskScore"
        );

    const riskText =
        document.getElementById(
            "riskText"
        );

    const healthMessage =
        document.getElementById(
            "healthMessage"
        );


    if (riskScore)
        riskScore.textContent =
            risk;


    if (risk < 40) {

        if (riskText) {

            riskText.textContent =
                "LOW RISK";

            riskText.style.color =
                "#35e6a0";
        }


        if (healthMessage)
            healthMessage.textContent =
                "Queue is flowing smoothly.";

    }

    else if (risk < 70) {

        if (riskText) {

            riskText.textContent =
                "MEDIUM RISK";

            riskText.style.color =
                "#ffb84d";
        }


        if (healthMessage)
            healthMessage.textContent =
                "Queue is getting busier.";

    }

    else {

        if (riskText) {

            riskText.textContent =
                "HIGH RISK";

            riskText.style.color =
                "#ff5d7d";
        }


        if (healthMessage)
            healthMessage.textContent =
                "Consider opening another counter.";

    }

}


/* =========================
   CALL NEXT
========================= */

async function nextPerson() {

    await fetch(
        "/api/next",
        {
            method: "POST"
        }
    );

    getQueue();

}


/* =========================
   ADD PERSON
========================= */

async function addPerson() {

    await fetch(
        "/api/add",
        {
            method: "POST"
        }
    );

    getQueue();

}


/* =========================
   CHANGE COUNTER
========================= */

async function changeCounter() {

    const counter =
        prompt(
            "Enter counter number (1-20):",
            "3"
        );


    if (counter === null)
        return;


    const number =
        parseInt(counter);


    if (
        isNaN(number) ||
        number < 1 ||
        number > 20
    ) {

        alert(
            "Please enter a counter between 1 and 20."
        );

        return;

    }


    await fetch(
        "/api/counter",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                counter: number
            })
        }
    );


    getQueue();

}


/* =========================
   CHANGE SERVICE RATE
========================= */

async function changeServiceRate() {

    const current =
        document.getElementById(
            "serviceRate"
        ).textContent;


    const input =
        prompt(
            "Enter service rate (people per minute):",
            current
        );


    if (input === null)
        return;


    const rate =
        parseFloat(input);


    if (
        isNaN(rate) ||
        rate <= 0 ||
        rate > 20
    ) {

        alert(
            "Please enter a rate between 0.1 and 20."
        );

        return;

    }


    const response =
        await fetch(
            "/api/service-rate",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    service_rate: rate
                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        alert(
            data.error ||
            "Could not change service rate."
        );

        return;

    }


    getQueue();

}


/* =========================
   RESET
========================= */

async function resetQueue() {

    if (
        !confirm(
            "Reset the queue?"
        )
    )
        return;


    await fetch(
        "/api/reset",
        {
            method: "POST"
        }
    );


    localStorage.removeItem(
        "queueTicket"
    );


    userTicket = null;


    getQueue();

}


/* =========================
   USER JOIN
========================= */

async function joinQueue() {

    try {

        const response =
            await fetch(
                "/api/join",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        userTicket =
            data.ticket;


        localStorage.setItem(
            "queueTicket",
            userTicket
        );


        showTicket();

        getQueue();

    }

    catch (error) {

        alert(
            "Could not join queue."
        );

    }

}


/* =========================
   SHOW TICKET
========================= */

function showTicket() {

    const join =
        document.getElementById(
            "joinSection"
        );

    const ticket =
        document.getElementById(
            "ticketSection"
        );


    if (!join || !ticket)
        return;


    join.classList.add(
        "hidden"
    );


    ticket.classList.remove(
        "hidden"
    );


    const ticketNumber =
        document.getElementById(
            "ticketNumber"
        );


    if (ticketNumber)
        ticketNumber.textContent =
            userTicket;

}


/* =========================
   USER DASHBOARD
========================= */

function updateUser(data) {

    if (!userTicket)
        return;


    const number =
        parseInt(
            userTicket.replace(
                "QZ-",
                ""
            )
        );


    const ahead =
        Math.max(
            0,
            number -
            data.current_number -
            1
        );


    const position =
        ahead + 1;


    const wait =
        Math.ceil(
            ahead /
            data.service_rate
        );


    const positionEl =
        document.getElementById(
            "userPosition"
        );

    const aheadEl =
        document.getElementById(
            "userAhead"
        );

    const waitEl =
        document.getElementById(
            "userWait"
        );

    const counterEl =
        document.getElementById(
            "userCounter"
        );


    if (positionEl)
        positionEl.textContent =
            position;


    if (aheadEl)
        aheadEl.textContent =
            ahead;


    if (waitEl)
        waitEl.textContent =
            wait + " min";


    if (counterEl)
        counterEl.textContent =
            String(data.counter)
                .padStart(2, "0");


    const progress =
        Math.max(
            5,
            Math.min(
                100,
                100 - ahead * 8
            )
        );


    const bar =
        document.getElementById(
            "userProgress"
        );

    const text =
        document.getElementById(
            "userProgressText"
        );


    if (bar)
        bar.style.width =
            progress + "%";


    if (text)
        text.textContent =
            Math.round(progress) + "%";


    const message =
        document.getElementById(
            "userMessage"
        );


    if (!message)
        return;


    const counter =
        "Counter " +
        String(data.counter)
            .padStart(2, "0");


    if (ahead <= 0) {

        message.textContent =
            "🎉 It's your turn! Please go to " +
            counter + ".";

        message.style.color =
            "#35e6a0";

    }

    else if (ahead <= 3) {

        message.textContent =
            "🔔 Your turn is coming very soon!";

        message.style.color =
            "#ffb84d";

    }

    else {

        message.textContent =
            "You can relax. We're tracking your place.";

        message.style.color =
            "#8991aa";

    }

}


/* =========================
   REFRESH
========================= */

function refreshUser() {

    getQueue();

}


/* =========================
   LEAVE QUEUE
========================= */

function leaveQueue() {

    if (
        !confirm(
            "Are you sure you want to leave?"
        )
    )
        return;


    localStorage.removeItem(
        "queueTicket"
    );


    userTicket = null;


    location.reload();

}


/* =========================
   START
========================= */

if (userTicket) {

    showTicket();

}


getQueue();


setInterval(
    getQueue,
    3000
);